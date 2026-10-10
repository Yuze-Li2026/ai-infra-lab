import test from 'node:test';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile,cp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {runProcess} from '../scripts/process.mjs';
const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:'python');
const probe=spawnSync(python,['-c','import sys; print(int(sys.version_info >= (3,10)))'],{encoding:'utf8',windowsHide:true});
test('pinned original object-model tests pass; invalid independent implementation fails',{skip:probe.status!==0||probe.stdout.trim()!=='1'},async()=>{
 await mkdir('artifacts',{recursive:true});const dir=await mkdtemp(resolve('artifacts/lab-test-'));
 const output=join(dir,'reference.json');
 const run=spawnSync(python,['-I','-B','labs/object-model/run.py','--output',output],{encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(run.status,0,run.stderr);const report=JSON.parse(await readFile(output,'utf8'));
 assert.equal(report.mode,'reference');assert.equal(report.passed,true);assert.equal(report.results.reduce((sum,r)=>sum+r.tests,0),28);
 await writeFile(join(dir,'objmodel.py'),'raise RuntimeError("deliberately incomplete submission")\n');
 const bad=spawnSync(python,['-I','-B','labs/object-model/run.py','--stage','01-smalltalk-like','--submission',dir,'--output',join(dir,'submission.json')],{encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(bad.status,1);assert.equal(JSON.parse(await readFile(join(dir,'submission.json'),'utf8')).passed,false);
 // Runner plumbing only: copied reference verifies all-stage routing, not learner independence.
 const stages=['01-smalltalk-like','02-attr-based','03-customizable','04-maps'];
 const complete=join(dir,'all-stages');await mkdir(complete);
 for(const stage of stages){await mkdir(join(complete,stage));await cp(`labs/object-model/upstream/objmodel/code/${stage}/objmodel.py`,join(complete,stage,'objmodel.py'));}
 const full=spawnSync(python,['-I','-B','labs/object-model/run.py','--submission',complete,'--output',join(dir,'full.json')],{encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(full.status,0,full.stderr);assert.deepEqual(JSON.parse(await readFile(join(dir,'full.json'),'utf8')).results.map(r=>r.stage),stages);
});

test('object-model integrity failure replaces an old success with a failed report',async()=>{
 await mkdir('artifacts',{recursive:true});const dir=await mkdtemp(resolve('artifacts/object-integrity-'));
 await cp('labs/object-model',join(dir,'labs/object-model'),{recursive:true});
 await cp('labs/common.py',join(dir,'labs/common.py'));
 await mkdir(join(dir,'scripts'));
 for(const file of ['processes.py','windows_job.py'])await cp('scripts/'+file,join(dir,'scripts',file));
 const output=join(dir,'report.json');await writeFile(output,JSON.stringify({passed:true,old:true}));
 await writeFile(join(dir,'labs/object-model/upstream/objmodel/code/01-smalltalk-like/objmodel.py'),'# corrupted isolated copy\n');
 const result=await runProcess(python,['-I','-B',join(dir,'labs/object-model/run.py'),'--output',output],{timeout:10000});
 assert.equal(result.code,1,result.stderr);
 const report=JSON.parse(await readFile(output,'utf8'));
 assert.equal(report.passed,false);assert.equal(report.upstreamChecksumsVerified,false);
 assert.match(report.results[0].error,/校验失败/);assert.equal(report.old,undefined);
});

test('object-model stage timeout stops descendants holding its output pipes',async()=>{
 await mkdir('artifacts',{recursive:true});const dir=await mkdtemp(resolve('artifacts/object-descendant-'));
 const heartbeat=join(dir,'heartbeat'),stop=join(dir,'stop'),output=join(dir,'report.json');
 const writer=`import time\nfrom pathlib import Path\np=Path(${JSON.stringify(heartbeat)}); stop=Path(${JSON.stringify(stop)})\nend=time.monotonic()+28\nwhile time.monotonic()<end and not stop.exists():\n p.write_text(str(time.monotonic())); time.sleep(.03)\n`;
 await writeFile(join(dir,'objmodel.py'),`import subprocess,sys,time\nfrom pathlib import Path\nsubprocess.Popen([sys.executable,'-c',${JSON.stringify(writer)}])\nwhile not Path(${JSON.stringify(heartbeat)}).exists(): time.sleep(.01)\nraise RuntimeError('test fixture exits while its child retains the pipes')\n`);
 try{
  const result=await runProcess(python,['-I','-B','labs/object-model/run.py','--stage','01-smalltalk-like','--submission',dir,'--output',output],{timeout:23000});
  assert.equal(result.reason,undefined,'outer timeout should not be needed');assert.equal(result.code,1,result.stderr);
  const report=JSON.parse(await readFile(output,'utf8'));assert.equal(report.passed,false);assert.match(report.results[0].error,/15/);
  const before=await readFile(heartbeat,'utf8');await new Promise(resolveWait=>setTimeout(resolveWait,200));
  assert.equal(await readFile(heartbeat,'utf8'),before,'stage descendant survived');
 }finally{await writeFile(stop,'stop');}
});
