"""Verify original starter execution, without claiming assignment completion."""
import argparse
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('report')
parser.add_argument('--tests', type=int)
parser.add_argument('--go-list')
args = parser.parse_args()
source = Path(args.report)
data = json.loads(source.read_text(encoding='utf-8'))
if data.get('kind') != 'course-execution' or data.get('passed') is not False:
    raise ValueError('Expected an original unimplemented starter failure, not an assignment pass.')
if len(data['results']) != 1:
    raise ValueError('Preparation/runtime failure or unexpected result scope; inspect the original log.')
result = data['results'][0]
if result.get('exitCode') != 1 or result.get('skipped') != 0:
    # make returns 2 when its test target fails.
    if not (args.go_list and result.get('exitCode') == 2 and result.get('skipped') == 0):
        raise ValueError('Unexpected exit code or skipped checks.')
if args.go_list:
    expected = set(re.findall(r'^(Test\S+)$', Path(args.go_list).read_text(), re.MULTILINE))
    log = Path(data['log']).read_text(encoding='utf-8')
    executed = set(re.findall(r'^=== RUN\s+(Test\S+)', log, re.MULTILINE))
    if not expected or executed != expected or result.get('completed') is not True:
        raise ValueError('The collected Go suite did not finish in full.')
else:
    cases = ET.parse(data['junit']).getroot().findall('.//testcase')
    if not args.tests or len(cases) != args.tests or result.get('tests') != args.tests:
        raise ValueError('Original test collection does not match the pinned starter.')
    if any(case.find('error') is not None or case.find('skipped') is not None for case in cases):
        raise ValueError('Collection/setup errors and skipped checks cannot verify the environment.')
    log = Path(data['log']).read_text(encoding='utf-8')
    if re.search(r'(ModuleNotFoundError|ImportError|NameError):', log):
        raise ValueError('Missing imports or names require investigation; not accepted as a TODO failure.')
if result.get('failures', 0) < 1:
    raise ValueError('Expected observed failures from the unimplemented starter.')
summary = {'environmentVerified':True, 'assignmentPassed':False, 'project':data['project'],
           'sourceCommit':data['commit'], 'execution':result,
           'limits':'Only pinned source acquisition, environment and complete original test execution. No student implementation or course completion.'}
output = source.with_name(source.stem+'-environment.json')
output.write_text(json.dumps(summary, indent=2)+'\n', encoding='utf-8')
print(json.dumps(summary))
