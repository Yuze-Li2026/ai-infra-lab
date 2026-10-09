"""Check fixed CS336 A1 CPU environment, preserving original TODO and xfail results."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'workspaces/systems-a1'
PYTHON = COURSE / '.venv/bin/python'
REPORT = ROOT / 'artifacts/course-cs336-a1.json'


def run():
    output = {'environmentVerified': False, 'assignmentPassed': False, 'gpuVerified': False}
    try:
        if os.name != 'posix':
            raise RuntimeError('Use the real Linux course environment')
        probe = subprocess.run([str(PYTHON), '-c',
            'import sys,torch,numpy,pytest,einops,einx,jaxtyping,tiktoken; '
            'assert torch.__version__.startswith("2.11."); '
            'assert sys.prefix != sys.base_prefix; '
            'import json; print(json.dumps({"python":sys.version,"torch":torch.__version__,"cudaAvailable":torch.cuda.is_available()}))'],
            cwd=COURSE, capture_output=True, text=True, timeout=60, check=True)
        output['environment'] = json.loads(probe.stdout)
        collected = subprocess.run([str(PYTHON), '-m', 'pytest', 'tests', '--collect-only', '-q', '-o', 'addopts='],
            cwd=COURSE, capture_output=True, text=True, timeout=90)
        collection_path = REPORT.with_name(REPORT.stem + '-collection.txt')
        collection_path.write_text(collected.stdout + collected.stderr, encoding='utf-8')
        if collected.returncode:
            raise RuntimeError('Original test collection failed; inspect collection log')
        expected = {line.strip() for line in collected.stdout.splitlines() if re.match(r'^tests/[^\s]+\.py::', line)}
        if not expected:
            raise RuntimeError('No original tests collected')
        executed = subprocess.run([sys.executable, str(ROOT / 'scripts/project.py'), 'systems', 'check', '--part', 'a1',
                                  '--output', str(REPORT)], cwd=ROOT, timeout=660)
        if executed.returncode != 1:
            raise RuntimeError('The unimplemented fixed starter must report assignment failure')
        evidence = json.loads(REPORT.read_text(encoding='utf-8'))
        if len(evidence['results']) != 1 or evidence['passed'] is not False:
            raise RuntimeError('Incomplete execution or unexpected assignment success')
        result = evidence['results'][0]
        if result.get('exitCode') != 1:
            raise RuntimeError('Tests did not finish normally')
        cases = ET.parse(evidence['junit']).getroot().findall('.//testcase')
        observed = {case.get('classname').replace('.', '/') + '.py::' + case.get('name') for case in cases}
        if observed != expected or result['tests'] != len(expected):
            raise RuntimeError('Collected and executed original tests differ')
        xfailed = []
        for case in cases:
            if case.find('error') is not None:
                raise RuntimeError('Original test setup or collection error')
            skipped = case.find('skipped')
            if skipped is not None:
                # This one upstream test is deliberately marked xfail: the
                # non-streaming tokenizer cannot fit within its 1 MB budget.
                if (case.get('name') != 'test_encode_memory_usage'
                        or skipped.get('type') != 'pytest.xfail'
                        or 'expected to take more memory' not in skipped.get('message', '')):
                    raise RuntimeError('Unexpected skipped original test')
                xfailed.append(case.get('name'))
        log = Path(evidence['log']).read_text(encoding='utf-8')
        if re.search(r'(ModuleNotFoundError|ImportError|NameError):', log):
            raise RuntimeError('Missing import/name is not accepted as an assignment TODO')
        if result.get('failures', 0) < 1:
            raise RuntimeError('Expected observed unimplemented assignment failures')
        output.update(environmentVerified=True, sourceCommit=evidence['commit'], collectedTests=len(expected),
                      execution=result, upstreamExpectedFailures=xfailed,
                      limits='Only A1 fixed dependencies, collection and original CPU test execution. Original xfail is recorded separately, never counted as pass. No A2 GPU or student implementation.')
    finally:
        REPORT.parent.mkdir(exist_ok=True)
        REPORT.with_name(REPORT.stem + '-environment.json').write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(output))


if __name__ == '__main__':
    run()
