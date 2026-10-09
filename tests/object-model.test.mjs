import test from 'node:test';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
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
});
