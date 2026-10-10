import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:'python');

test('Toy verification refuses missing, duplicated, unsupported and failed original tests',()=>{
  const code=`import importlib.util,sys
sys.path.insert(0,sys.argv[1])
spec=importlib.util.spec_from_file_location('toy',sys.argv[1]+'/check-toy-environment.py')
toy=importlib.util.module_from_spec(spec);spec.loader.exec_module(toy)
expected={'MLIR :: Examples/Toy/Ch'+str(i)+'/jit.toy' for i in range(1,8)}
cases=[{'name':name,'code':'PASS'} for name in sorted(expected)]
result=toy.validate_results(expected,{'tests':cases})
assert result['tests']==7 and result['skipped']==0 and len(result['chapters'])==7
bad=[cases[:-1],cases+[cases[0]],[]]
for state in ['UNSUPPORTED','FAIL','XFAIL','XPASS','TIMEOUT','UNRESOLVED']:
 bad.append([{**cases[0],'code':state},*cases[1:]])
for sample in bad:
 try: toy.validate_results(expected,{'tests':sample})
 except ValueError: pass
 else: raise AssertionError('Incomplete or skipped suite was accepted')
try: toy.validate_results(set(),{'tests':[]})
except ValueError: pass
else: raise AssertionError('Empty suite accepted')
print('Result-parser regression only; not an upstream build result')
`;
  const result=spawnSync(python,['-c',code,resolve('scripts')],{encoding:'utf8',windowsHide:true,timeout:10000});
  assert.equal(result.status,0,result.stderr);
  const plan=spawnSync(python,[resolve('scripts/check-toy-environment.py')],{encoding:'utf8',windowsHide:true,timeout:10000});
  assert.equal(plan.status,0,plan.stderr);
  assert.match(JSON.parse(plan.stdout).version.commit,/^[0-9a-f]{40}$/);
});

test('CS336 CPU evidence retains the exact unavailable GPU cases and rejects any other skip',()=>{
 const code=`import importlib.util,sys,xml.etree.ElementTree as ET
spec=importlib.util.spec_from_file_location('course',sys.argv[1]+'/check-cs336-environment.py')
course=importlib.util.module_from_spec(spec);spec.loader.exec_module(course)
cases=[]
for direction in ['forward_pass','backward']:
 for causal in ['False','True']:
  case=ET.Element('testcase',classname='tests.test_attention',name='test_flash_'+direction+'_triton['+causal+']')
  ET.SubElement(case,'skipped',type='pytest.skip',message='A GPU must be available to run Triton kernels')
  cases.append(case)
cpu=ET.Element('testcase',classname='tests.test_attention',name='test_flash_backward_pytorch')
ET.SubElement(cpu,'failure',message='NotImplementedError');cases.append(cpu)
expected={'tests/test_attention.py::'+case.get('name') for case in cases}
xfailed,unavailable=course.classify_cases(cases,expected,'a2')
assert xfailed==[] and len(unavailable)==4
for sample in [cases[:-1],cases+[cases[0]],[]]:
 try: course.classify_cases(sample,expected,'a2')
 except RuntimeError: pass
 else: raise AssertionError('Incorrect collection accepted')
ET.SubElement(cpu,'skipped',type='pytest.skip',message='unexpected missing dependency')
try: course.classify_cases(cases,expected,'a2')
except RuntimeError: pass
else: raise AssertionError('Unexpected CPU skip accepted')
print('GPU skips remain unverified; this fixture is not course execution')
`;
 const result=spawnSync(python,['-c',code,resolve('scripts')],{encoding:'utf8',windowsHide:true,timeout:10000});
 assert.equal(result.status,0,result.stderr);
});
