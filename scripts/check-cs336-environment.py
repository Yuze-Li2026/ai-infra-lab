"""Check fixed CS336 CPU environments, retaining TODO, xfail and unavailable GPU results."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def classify_cases(cases, expected, part):
    observed = [case.get('classname').replace('.', '/') + '.py::' + case.get('name') for case in cases]
    if len(observed) != len(set(observed)) or set(observed) != expected or not expected:
        raise RuntimeError('Collected and executed original tests differ')
    xfailed, unavailable = [], []
    gpu_cases = {'test_flash_' + direction + '_triton[' + causal + ']'
                 for direction in ['forward_pass', 'backward'] for causal in ['False', 'True']}
    for case in cases:
        if case.find('error') is not None:
            raise RuntimeError('Original test setup or collection error')
        skipped = case.find('skipped')
        if skipped is None:
            continue
        name = case.get('name')
        if (part == 'a1' and name == 'test_encode_memory_usage'
                and skipped.get('type') == 'pytest.xfail'
                and 'expected to take more memory' in skipped.get('message', '')):
            xfailed.append(name)
        elif (part == 'a2' and name in gpu_cases and skipped.get('type') == 'pytest.skip'
              and 'A GPU must be available to run Triton kernels' in skipped.get('message', '')):
            unavailable.append(name)
        else:
            raise RuntimeError('Unexpected skipped original test: ' + name)
    if part == 'a2' and set(unavailable) != gpu_cases:
        raise RuntimeError('This CPU-only check expects four explicit upstream GPU skips; use a separate GPU validation')
    return xfailed, unavailable


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--part', choices=['a1', 'a2'], default='a1')
    args = parser.parse_args()
    course = ROOT / ('workspaces/systems-' + args.part)
    python = course / '.venv/bin/python'
    report = ROOT / ('artifacts/course-cs336-' + args.part + '.json')
    output = {'environmentVerified': False, 'assignmentPassed': False, 'gpuVerified': False}
    report.parent.mkdir(exist_ok=True)
    try:
        if os.name != 'posix':
            raise RuntimeError('Use the real Linux course environment')
        probe = subprocess.run([str(python), '-c',
            'import sys,torch,numpy,pytest,einops,einx,jaxtyping,tiktoken; '
            'assert torch.__version__.startswith("2.11."); '
            'assert sys.prefix != sys.base_prefix; '
            'import json; print(json.dumps({"python":sys.version,"torch":torch.__version__,"cudaAvailable":torch.cuda.is_available()}))'],
            cwd=course, capture_output=True, text=True, timeout=60, check=True)
        output['environment'] = json.loads(probe.stdout)
        if args.part == 'a2' and output['environment']['cudaAvailable']:
            raise RuntimeError('This A2 mode measures CPU prerequisites only; do not use it to accept a GPU environment')
        collected = subprocess.run([str(python), '-m', 'pytest', 'tests', '--collect-only', '-q', '-o', 'addopts='],
            cwd=course, capture_output=True, text=True, timeout=90)
        collection_path = report.with_name(report.stem + '-collection.txt')
        collection_path.write_text(collected.stdout + collected.stderr, encoding='utf-8')
        if collected.returncode:
            raise RuntimeError('Original test collection failed; inspect collection log')
        expected = {line.strip() for line in collected.stdout.splitlines() if re.match(r'^tests/[^\s]+\.py::', line)}
        if not expected:
            raise RuntimeError('No original tests collected')
        executed = subprocess.run([sys.executable, str(ROOT / 'scripts/project.py'), 'systems', 'check', '--part', args.part,
                                  '--output', str(report)], cwd=ROOT, timeout=660)
        if executed.returncode != 1:
            raise RuntimeError('The unimplemented fixed starter must report assignment failure')
        evidence = json.loads(report.read_text(encoding='utf-8'))
        if len(evidence['results']) != 1 or evidence['passed'] is not False:
            raise RuntimeError('Incomplete execution or unexpected assignment success')
        result = evidence['results'][0]
        if result.get('exitCode') != 1:
            raise RuntimeError('Tests did not finish normally')
        cases = ET.parse(evidence['junit']).getroot().findall('.//testcase')
        xfailed, unavailable = classify_cases(cases, expected, args.part)
        if result['tests'] != len(expected) or result['skipped'] != len(xfailed) + len(unavailable):
            raise RuntimeError('Original test accounting differs from JUnit')
        log = Path(evidence['log']).read_text(encoding='utf-8')
        if re.search(r'(ModuleNotFoundError|ImportError|NameError):', log):
            raise RuntimeError('Missing import/name is not accepted as an assignment TODO')
        if result.get('failures', 0) < 1:
            raise RuntimeError('Expected observed unimplemented assignment failures')
        output.update(environmentVerified=args.part == 'a1', cpuEnvironmentVerified=True,
                      sourceCommit=evidence['commit'], collectedTests=len(expected), executedCpuTests=len(expected) - len(unavailable),
                      execution=result, upstreamExpectedFailures=xfailed, unavailableGpuTests=unavailable,
                      limits='Only fixed dependencies, collection and CPU execution. A2 GPU skips remain unverified, never passes; the complete A2 environment is not accepted. No student implementation.')
    except Exception as error:
        output['error'] = type(error).__name__ + ': ' + str(error)
        raise
    finally:
        report.parent.mkdir(exist_ok=True)
        report.with_name(report.stem + '-environment.json').write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(output))


if __name__ == '__main__':
    run()
