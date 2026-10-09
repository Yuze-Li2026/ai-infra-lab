import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:'python');
const launcher=resolve('scripts/project.mjs'),labLauncher=resolve('scripts/lab.mjs');
const run=(args,options={})=>spawnSync(process.execPath,[launcher,...args],{encoding:'utf8',windowsHide:true,timeout:45000,env:{...process.env,LAB_PYTHON:python},...options});
async function temporary(){await mkdir('artifacts',{recursive:true});return mkdtemp(resolve('artifacts/course-test-'));}

test('every original-course entry has a working pinned preparation plan',()=>{
 for(const[id,part]of [['python-project'],['ostep-project'],['raft'],['needle','hw0'],['needle','hw1'],['needle','hw2'],['systems','a1'],['systems','a2']]){
  const result=run([id,'plan',...(part?['--part',part]:[])]);assert.equal(result.status,0,result.stderr);
  const data=JSON.parse(result.stdout);assert.ok(data.commit);assert.ok(data.environment);assert.ok(data.license);
  if(data.kind==='pytest'||data.kind==='uv'){assert.match(data.sha256,/^[a-f0-9]{64}$/);assert.ok(data.bytes<32*1024*1024);}
 }
 assert.notEqual(run(['needle','plan','--part','invalid']).status,0);
 const legacy=spawnSync(python,[resolve('scripts/project.py'),'python-project','plan'],{encoding:'utf8',windowsHide:true,env:{...process.env,PYTHONIOENCODING:'cp1252',PYTHONUTF8:'0'}});
 assert.equal(legacy.status,0,legacy.stderr);assert.match(JSON.parse(legacy.stdout).limits,/不安装/);
});

test('course preparation preserves an existing workspace and rejects corrupted source before delivery',async()=>{
 const dir=await temporary(),folder=join(dir,'my-project');
 const prepared=run(['python-project','prepare','--directory',folder]);assert.equal(prepared.status,0,prepared.stderr);
 const original=await readFile(join(folder,'project.py'),'utf8');
 assert.equal(run(['python-project','prepare','--directory',folder]).status,1);
 assert.equal(await readFile(join(folder,'project.py'),'utf8'),original);
 const output=join(dir,'failed.json');assert.equal(run(['python-project','check','--directory',folder,'--output',output]).status,1);
 assert.equal(JSON.parse(await readFile(output,'utf8')).passed,false);
 const archive=join(dir,'wrong.zip');await writeFile(archive,'not the pinned course archive');
 const target=join(dir,'needle');assert.equal(run(['needle','prepare','--directory',target,'--archive',archive]).status,1);
 assert.equal(existsSync(target),false);
});

test('course checks execute the learner tests and reject a changed implementation',async()=>{
 const probe=spawnSync(python,['-c','import sys; print(sys.executable)'],{encoding:'utf8',windowsHide:true});
 const candidates=[probe.status===0?probe.stdout.trim():python,resolve('workspaces/needle-hw0/.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python')];
 const selected=candidates.find(p=>spawnSync(p,['-c','import pytest'],{windowsHide:true}).status===0);
 assert.ok(selected,'This verification needs pytest: install labs/requirements-ci.txt in the test environment.');
 const dir=await temporary(),folder=join(dir,'project');const prepared=run(['python-project','prepare','--directory',folder]);assert.equal(prepared.status,0,prepared.stderr);
 const code='def main():\n    pass\ndef add(x,y):\n    return x+y\ndef scale(x):\n    return x*2\ndef parse(x):\n    return int(x)\n';
 await writeFile(join(folder,'project.py'),code);
 await writeFile(join(folder,'test_project.py'),'from project import add, scale, parse\ndef test_add():\n    assert add(7,-3)==4\ndef test_scale():\n    assert scale(-5)==-10\ndef test_parse():\n    assert parse("42")==42\n');
 const report=join(dir,'report.json'),args=['python-project','check','--directory',folder,'--python',selected,'--output',report];
 assert.equal(run(args).status,0);let data=JSON.parse(await readFile(report,'utf8'));
 assert.equal(data.passed,true);assert.equal(data.results.find(r=>r.name==='learner-project-tests').tests,3);
 const direct=spawnSync(selected,[resolve('scripts/project.py'),'python-project','check','--directory',folder,'--python',selected,'--output','direct-python.json'],{cwd:dir,encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(direct.status,0,direct.stderr+direct.stdout);
 const directReport=JSON.parse(await readFile(join(dir,'direct-python.json'),'utf8'));
 assert.equal(directReport.results.find(r=>r.name==='learner-project-tests').tests,3);
 assert.equal(existsSync(directReport.junit),true);assert.equal(existsSync(directReport.log),true);
 await writeFile(join(folder,'project.py'),code.replace('return x+y','return x-y'));
 assert.equal(run(args).status,1);data=JSON.parse(await readFile(report,'utf8'));assert.equal(data.passed,false);
 assert.equal(data.results.find(r=>r.name==='learner-project-tests').failures,1);
});

test('lab launcher works from a different directory and refuses ignored Indoor arguments',async()=>{
 const dir=await temporary(),file=join(dir,'indoor.py');await writeFile(file,'print(input().lower())\n');
 const result=spawnSync(process.execPath,[labLauncher,'indoor','indoor.py'],{cwd:dir,encoding:'utf8',windowsHide:true,timeout:30000,env:{...process.env,LAB_PYTHON:python}});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/"passed": true/);
 const bad=spawnSync(process.execPath,[labLauncher,'indoor',file,'silently-ignored-before'],{encoding:'utf8',windowsHide:true});assert.equal(bad.status,2);
 const output=join(dir,'object.json');
 const object=spawnSync(process.execPath,[labLauncher,'object-model','--output',output],{cwd:dir,encoding:'utf8',windowsHide:true,timeout:30000,env:{...process.env,LAB_PYTHON:python}});
 assert.equal(object.status,0,object.stderr);assert.equal(JSON.parse(await readFile(output,'utf8')).passed,true);
 const workspace=join(dir,'gpu-work');
 const init=()=>spawnSync(process.execPath,[labLauncher,'gpu','--init',workspace],{encoding:'utf8',windowsHide:true,timeout:10000});
 assert.equal(init().status,0);const implementation=join(workspace,'implementation.py');
 assert.match(await readFile(implementation,'utf8'),/NotImplementedError/);await writeFile(implementation,'# existing learner work\n');
 assert.equal(init().status,1);assert.equal(await readFile(implementation,'utf8'),'# existing learner work\n');
});

test('course timeout terminates the spawned child tree',async()=>{
 const dir=await temporary();
 const result=spawnSync(python,[resolve('tests/process-tree-probe.py'),dir,'--parent-alive'],{encoding:'utf8',windowsHide:true,timeout:15000});
 assert.equal(result.status,0,result.stderr||result.error?.message);
 assert.match(result.stdout,/exited-parent cleanup and unrelated process verified/);
});

test('course timeout also owns descendants after their parent has exited',async()=>{
 const dir=await temporary();
 const result=spawnSync(python,[resolve('tests/process-tree-probe.py'),dir],{encoding:'utf8',windowsHide:true,timeout:15000});
 assert.equal(result.status,0,result.stderr||result.error?.message);
 assert.match(result.stdout,/exited-parent cleanup and unrelated process verified/);
});

test('Go log accounting counts failed tests and rejects incomplete or skipped runs',()=>{
 const source=`import sys\nsys.path.insert(0,sys.argv[1])\nfrom project import go_test_result\nfailed=go_test_result('=== RUN   TestOne\\n--- FAIL: TestOne (0.1s)\\n=== RUN   TestTwo\\n--- FAIL: TestTwo (0.1s)\\n',2)\nassert failed['tests']==2 and failed['failures']==2 and failed['completed'] and not failed['passed']\nassert not go_test_result('=== RUN   TestOne\\n',0)['passed']\nassert not go_test_result('=== RUN   TestOne\\n--- SKIP: TestOne (0s)\\n',0)['passed']\nassert not go_test_result('',0)['passed']\nassert go_test_result('=== RUN   TestOne\\n--- PASS: TestOne (0.1s)\\n',0)['passed']\nprint('Go result accounting verified; fixture is not actual course execution')\n`;
 const result=spawnSync(python,['-c',source,resolve('scripts')],{encoding:'utf8',windowsHide:true,timeout:10000});
 assert.equal(result.status,0,result.stderr);
});
