import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:'python');
for(const [lab,modules,expected]of [['dbdb','portalocker',21],['consensus','fissix',46],['micrograd','torch',11]]){
 const probe=spawnSync(python,['-c',`import sys; import ${modules}; assert sys.version_info >= (3,10)`],{encoding:'utf8',windowsHide:true});
 test(`${lab}: original checks pass; broken independent submission fails without modifying files`,{skip:probe.status!==0},async()=>{
  await mkdir('artifacts',{recursive:true});const dir=await mkdtemp(resolve(`artifacts/${lab}-check-`));
  const output=join(dir,'reference.json');
  const run=spawnSync(python,['-B',`labs/${lab}/run.py`,'--output',output],{encoding:'utf8',windowsHide:true,timeout:45000});
  assert.equal(run.status,0,run.stderr);const reference=JSON.parse(await readFile(output,'utf8'));
  assert.equal(reference.mode,'reference');assert.equal(reference.passed,true);assert.equal(reference.results.reduce((n,r)=>n+r.tests,0),expected);
  assert.equal(reference.upstreamChecksumsVerified,true);assert.equal(reference.benchmark[0].samples_ns.length,7);
  const submission=join(dir,'submission');await mkdir(submission);
  const file=lab==='consensus'?join(submission,'cluster.py'):join(submission,lab,'__init__.py');
  if(lab!=='consensus')await mkdir(join(submission,lab));
  const source='raise RuntimeError("deliberately incomplete independent implementation")\n';await writeFile(file,source);
  const failedOutput=join(dir,'failed.json');
  const bad=spawnSync(python,['-B',`labs/${lab}/run.py`,'--submission',submission,'--output',failedOutput],{encoding:'utf8',windowsHide:true,timeout:45000});
  assert.equal(bad.status,1,bad.stderr);const failed=JSON.parse(await readFile(failedOutput,'utf8'));assert.equal(failed.mode,'submission');assert.equal(failed.passed,false);
  assert.equal(await readFile(file,'utf8'),source);
  const optimized=spawnSync(python,['-O',`labs/${lab}/run.py`,'--output',failedOutput],{encoding:'utf8',windowsHide:true,timeout:10000});
  assert.equal(optimized.status,1);assert.equal(JSON.parse(await readFile(failedOutput,'utf8')).passed,false);
 });
}
