"""Run a pinned real model with vLLM on a dedicated Linux CPU Docker host."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import platform
import secrets
import sys
import time
import urllib.error
import urllib.request
import uuid
from processes import run

ROOT = Path(__file__).resolve().parents[1]
VERSIONS = json.loads((ROOT / 'labs/inference-validation/versions.json').read_text())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Download pinned CPU image/model and execute real inference')
    args = parser.parse_args()
    if not args.run:
        print(json.dumps({'versions': VERSIONS, 'requirements': 'Dedicated Linux amd64 Docker host, AVX2 or AVX512, 16 GB RAM and 20 GB free disk; see docs/inference-compiler-environments.md.'}, indent=2))
        return
    if not __debug__ or sys.platform != 'linux':
        raise RuntimeError('Use Linux Python without -O for actual verification')
    name = 'infra-inference-' + uuid.uuid4().hex[:12]
    folder = ROOT / 'artifacts' / name
    folder.mkdir(parents=True, mode=0o700)
    cache = folder / 'model-cache'
    cache.mkdir()
    token = secrets.token_hex(32)
    credentials = folder / 'server.env'
    with credentials.open('x') as output:
        os.chmod(credentials, 0o600)
        output.write('VLLM_API_KEY=' + token + '\n')
    result = {'passed': False, 'checkedAt': datetime.now(timezone.utc).isoformat(), 'environment': platform.platform(),
              'versions': VERSIONS, 'checks': [], 'gpuVerified': False,
              'limits': 'Real 0.6B model, CPU integration requests; not a quality benchmark, load test, production SLA or GPU result.'}
    logs, created = [], False

    def command(argv, timeout=120, expected=0):
        completed = run(argv, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout)
        logs.append({'command': argv, 'exitCode': completed.returncode,
                     'stdout': completed.stdout[-16000:].replace(token, '[redacted]'),
                     'stderr': completed.stderr[-8000:].replace(token, '[redacted]')})
        if expected is not None and completed.returncode != expected:
            raise RuntimeError('Command failed: ' + ' '.join(argv) + '\n' + completed.stderr[-3000:].replace(token, '[redacted]'))
        return completed

    def request(path, body=None, key=token, timeout=120):
        headers = {'Content-Type': 'application/json'}
        if key:
            headers['Authorization'] = 'Bearer ' + key
        req = urllib.request.Request(base + path, data=None if body is None else json.dumps(body).encode(), headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as error:
            return error.code, error.read()

    def ready(timeout):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                status, _ = request('/health', timeout=3)
                if status == 200:
                    return
            except (OSError, urllib.error.URLError):
                pass
            state = command(['docker', 'inspect', '--format', '{{.State.Running}}', name]).stdout.strip()
            if state != 'true':
                raise RuntimeError('Inference container exited before health was ready')
            time.sleep(2)
        raise TimeoutError('vLLM readiness deadline exceeded')

    try:
        command(['docker', 'pull', VERSIONS['image']], timeout=600)
        created = True
        command(['docker', 'run', '-d', '--name', name, '--label', 'ai-infra.validation=' + name,
                 '--memory=10g', '--shm-size=1g', '--security-opt=no-new-privileges',
                 '-p', '127.0.0.1::8000', '--env-file', str(credentials),
                 '-e', 'VLLM_CPU_KVCACHE_SPACE=1', '-e', 'VLLM_CPU_OMP_THREADS_BIND=auto',
                 '-e', 'VLLM_NO_USAGE_STATS=1', '-e', 'DO_NOT_TRACK=1',
                 '-v', str(cache) + ':/root/.cache/huggingface', '--entrypoint', 'vllm', VERSIONS['image'],
                 'serve', VERSIONS['model'], '--revision', VERSIONS['revision'], '--host', '0.0.0.0',
                 '--port', '8000', '--dtype', 'float32', '--max-model-len', '256', '--max-num-seqs', '2',
                 '--enforce-eager', '--disable-log-requests'], timeout=120)
        binding = command(['docker', 'port', name, '8000/tcp']).stdout.strip()
        assert binding.startswith('127.0.0.1:') and '\n' not in binding
        base = 'http://' + binding
        ready(600)
        result['checks'].append('pinned pretrained model loads and HTTP service becomes healthy on loopback only')
        for key in [None, 'incorrect-test-key']:
            assert request('/v1/models', key=key)[0] == 401
        status, data = request('/v1/models')
        assert status == 200 and VERSIONS['model'] in [model['id'] for model in json.loads(data)['data']]
        result['checks'].append('anonymous and incorrect-key API requests are rejected; correct key lists the loaded model')
        body = {'model': VERSIONS['model'], 'prompt': 'The capital of France is', 'max_tokens': 8, 'temperature': 0, 'seed': 7}

        def completion():
            start = time.perf_counter()
            status, payload = request('/v1/completions', body)
            assert status == 200, payload.decode()[:1000]
            data = json.loads(payload)
            assert data['choices'][0]['text'] and 0 < data['usage']['completion_tokens'] <= 8
            return {'text': data['choices'][0]['text'], 'usage': data['usage'], 'elapsedSeconds': time.perf_counter() - start}

        first = completion()
        with ThreadPoolExecutor(max_workers=2) as pool:
            concurrent = list(pool.map(lambda _: completion(), range(2)))
        assert all(item['text'] == first['text'] for item in concurrent)
        result['requests'] = [first, *concurrent]
        assert request('/v1/completions', {**body, 'model': 'missing-model'})[0] in [400, 404]
        result['checks'].append('real sequential and concurrent token generation agrees; unavailable model request fails')
        stream = {**body, 'stream': True}
        req = urllib.request.Request(base + '/v1/completions', data=json.dumps(stream).encode(),
                                     headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
        chunks, done = [], False
        with urllib.request.urlopen(req, timeout=120) as response:
            for line in response:
                if not line.startswith(b'data: '):
                    continue
                payload = line[6:].strip()
                if payload == b'[DONE]':
                    done = True
                    break
                part = json.loads(payload)
                if part.get('choices'):
                    chunks.append(part['choices'][0]['text'])
        assert done and ''.join(chunks) == first['text']
        result['checks'].append('streamed completion finishes and matches the non-streamed greedy result')
        command(['docker', 'kill', '--signal=KILL', name])
        command(['docker', 'start', name])
        ready(300)
        assert completion()['text'] == first['text']
        result['checks'].append('abrupt service termination and restart restore authenticated inference from cached fixed weights')
        result['passed'] = True
    except BaseException as error:
        result['error'] = str(error).replace(token, '[redacted]')
        raise
    finally:
        cleanup = True
        if created:
            try:
                command(['docker', 'logs', '--tail', '160', name], expected=None)
            except Exception as error:
                logs.append({'diagnosticError': str(error).replace(token, '[redacted]')})
            try:
                cleanup = command(['docker', 'rm', '-f', name], expected=None).returncode == 0
            except Exception as error:
                cleanup = False
                logs.append({'cleanupError': str(error).replace(token, '[redacted]')})
        credentials.unlink(missing_ok=True)
        result['cleanupPassed'] = cleanup
        result['passed'] = result['passed'] and cleanup
        (ROOT / 'artifacts/inference-results.json').write_text(json.dumps(result, indent=2) + '\n')
        (ROOT / 'artifacts/inference-log.json').write_text(json.dumps(logs, indent=2) + '\n')
        if not cleanup:
            raise RuntimeError('Container cleanup failed: ' + name)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
