"""Build and execute the seven upstream MLIR Toy chapters on a Linux CPU host."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import sys
import uuid

from processes import run

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / 'labs/compiler-validation/toy-version.json').read_text())


def validate_results(expected, data):
    """A zero exit status alone does not rule out filtered or unsupported tests."""
    cases = data.get('tests', [])
    names = [case.get('name') for case in cases]
    if not expected or len(names) != len(set(names)) or set(names) != set(expected):
        raise ValueError('Collected and executed upstream Toy test sets differ')
    bad = [{key: case.get(key) for key in ['name', 'code']} for case in cases if case.get('code') != 'PASS']
    if bad:
        raise ValueError('Every original test must pass without skips: ' + json.dumps(bad))
    chapters = {re.search(r'Examples/Toy/(Ch[1-7])/', name).group(1) for name in names}
    if chapters != {'Ch' + str(i) for i in range(1, 8)}:
        raise ValueError('Expected all seven original chapters')
    return {'tests': len(cases), 'passed': len(cases), 'skipped': 0,
            'chapters': {chapter: sum('/' + chapter + '/' in name for name in names) for chapter in sorted(chapters)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Fetch fixed upstream source and build it; substantial cloud/local disk and CPU work')
    parser.add_argument('--jobs', type=int, default=2, choices=range(1, 9))
    args = parser.parse_args()
    if not args.run:
        print(json.dumps({'version': VERSION, 'requirements': 'Linux x86-64, Python 3.10+, Git, CMake, Ninja, Clang and lld; 16 GB RAM, 30 GB free disk. No GPU. Builds only in a new private artifacts directory.'}, indent=2))
        return
    artifacts = ROOT / 'artifacts'
    artifacts.mkdir(exist_ok=True)
    folder = artifacts / ('toy-' + uuid.uuid4().hex)
    folder.mkdir(mode=0o700)
    source, build = folder / 'llvm-project', folder / 'build'
    report = {'passed': False, 'checkedAt': datetime.now(timezone.utc).isoformat(), 'version': VERSION,
              'environment': platform.platform(), 'gpuVerified': False, 'commands': [],
              'limits': 'Upstream Toy Ch1–Ch7 CPU build and original tests, including JIT. Not an independent learner implementation or GPU backend.'}
    log_path = artifacts / 'toy-build.log'

    def command(argv, timeout=120, capture=False):
        report['commands'].append(argv)
        log.write('\n$ ' + ' '.join(argv) + '\n'); log.flush()
        result = run(argv, timeout=timeout, text=True, encoding='utf-8', errors='replace',
                     stdout=-1 if capture else log, stderr=-2, env=environment)
        if capture:
            log.write(result.stdout); log.flush()
        if result.returncode:
            raise RuntimeError('Command failed (' + str(result.returncode) + '): ' + ' '.join(argv))
        return result.stdout if capture else None

    environment = {**os.environ, 'GIT_TERMINAL_PROMPT': '0', 'PYTHONDONTWRITEBYTECODE': '1'}
    # Inherited lit filters could silently reduce the original suite.
    for key in ['LIT_FILTER', 'LIT_FILTER_OUT', 'LIT_OPTS', 'LLVM_LIT_ARGS', 'FILECHECK_OPTS']:
        environment.pop(key, None)
    with log_path.open('w', encoding='utf-8') as log:
        try:
            if not __debug__ or sys.platform != 'linux' or platform.machine() not in ['x86_64', 'AMD64']:
                raise RuntimeError('Use Linux x86-64 Python without -O')
            for name in ['git', 'cmake', 'ninja', 'clang', 'clang++', 'ld.lld']:
                if not shutil.which(name):
                    raise RuntimeError('Missing build tool: ' + name)
            if shutil.disk_usage(folder).free < 30 * 1024**3:
                raise RuntimeError('At least 30 GiB of free build space is required')
            report['tools'] = {name: command([name, '--version'], capture=True).splitlines()[0]
                               for name in ['git', 'cmake', 'ninja', 'clang', 'ld.lld']}
            command(['git', 'init', str(source)])
            command(['git', '-C', str(source), 'remote', 'add', 'origin', VERSION['repository']])
            command(['git', '-C', str(source), 'fetch', '--depth=1', 'origin', VERSION['commit']], timeout=600)
            command(['git', '-C', str(source), 'checkout', '--detach', 'FETCH_HEAD'], timeout=120)
            if command(['git', '-C', str(source), 'rev-parse', 'HEAD'], capture=True).strip() != VERSION['commit']:
                raise RuntimeError('Upstream source commit mismatch')
            command(['cmake', '-G', 'Ninja', '-S', str(source / 'llvm'), '-B', str(build),
                     '-DLLVM_ENABLE_PROJECTS=mlir', '-DLLVM_BUILD_EXAMPLES=ON', '-DLLVM_TARGETS_TO_BUILD=X86',
                     '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_CXX_FLAGS_RELEASE=-O1 -DNDEBUG',
                     '-DCMAKE_C_COMPILER=clang', '-DCMAKE_CXX_COMPILER=clang++', '-DLLVM_ENABLE_LLD=ON',
                     '-DLLVM_ENABLE_ASSERTIONS=ON', '-DLLVM_PARALLEL_LINK_JOBS=1'], timeout=300)
            command(['cmake', '--build', str(build), '--target', 'Toy', 'FileCheck', 'not', 'mlir-runner',
                     '--parallel', str(args.jobs)], timeout=5400)
            report['binaries'] = {f'toyc-ch{i}': hashlib.sha256((build / 'bin' / f'toyc-ch{i}').read_bytes()).hexdigest()
                                  for i in range(1, 8)}
            tests = build / 'tools/mlir/test/Examples/Toy'
            lit = [sys.executable, str(build / 'bin/llvm-lit')]
            collected = command([*lit, '--show-tests', str(tests)], capture=True)
            expected = {line.strip() for line in collected.splitlines() if line.strip().startswith('MLIR :: Examples/Toy/')}
            # Compare with the original source files as well, so missing collection cannot pass.
            originals = {'MLIR :: ' + path.relative_to(source / 'mlir/test').as_posix()
                         for path in (source / 'mlir/test/Examples/Toy').rglob('*')
                         if path.is_file() and re.search(r'(?m)^\s*(?://|#)\s*RUN:', path.read_text())}
            if expected != originals or not expected:
                raise RuntimeError('Collection omits original Toy test files')
            (artifacts / 'toy-collection.txt').write_text(collected, encoding='utf-8')
            raw = artifacts / 'toy-lit-results.json'
            command([*lit, '-v', '--timeout=60', '-j', str(args.jobs), '-o', str(raw), str(tests)], timeout=600)
            report['execution'] = validate_results(expected, json.loads(raw.read_text()))
            if command(['git', '-C', str(source), 'status', '--porcelain', '--untracked-files=no'], capture=True).strip():
                raise RuntimeError('Upstream tracked source changed during validation')
            report['passed'] = True
        except BaseException as error:
            report['error'] = type(error).__name__ + ': ' + str(error)
            raise
        finally:
            (artifacts / 'toy-results.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
