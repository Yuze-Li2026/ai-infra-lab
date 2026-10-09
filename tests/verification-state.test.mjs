import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sourceSnapshot,reportStatus} from '../scripts/verification-state.mjs';

test('verification reports cannot carry success across source changes or a changing run',async()=>{
  await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/verification-state-'));
  await mkdir(join(folder,'site'));await mkdir(join(folder,'artifacts'));
  await writeFile(join(folder,'site/app.js'),'export const value=1;\n');
  const before=await sourceSnapshot(folder),report=join(folder,'artifacts/result.json');
  const save=value=>writeFile(report,JSON.stringify(value));
  await save({passed:true,source:{before,after:before}});
  assert.equal((await reportStatus(report,before)).status,'passed');
  assert.deepEqual(await sourceSnapshot(folder),before,'Writing evidence must not invalidate source');
  await writeFile(join(folder,'site/app.js'),'export const value=2;\n');
  const after=await sourceSnapshot(folder);
  assert.equal((await reportStatus(report,after)).status,'stale');
  await save({passed:true,source:{before,after}});
  assert.equal((await reportStatus(report,after)).status,'source-changed');
  await save({passed:false,source:{before:after,after}});
  assert.equal((await reportStatus(report,after)).status,'failed');
  await save({passed:true});assert.equal((await reportStatus(report,after)).status,'unbound');
  await save({passed:true,source:{before:{},after:{}}});assert.equal((await reportStatus(report,after)).status,'invalid');
  await writeFile(report,'broken JSON');assert.equal((await reportStatus(report,after)).status,'invalid');
  assert.equal(await readFile(report,'utf8'),'broken JSON','Diagnostics must preserve damaged evidence');
  assert.equal((await reportStatus(join(folder,'missing.json'),after)).status,'missing');
});

test('maintenance status locates its own repository and rejects ignored CLI arguments',async()=>{
  await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/maintenance-cli-'));
  const script=resolve('scripts/maintenance-status.mjs');
  const result=spawnSync(process.execPath,[script],{cwd:folder,encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);
  const status=JSON.parse(result.stdout);
  assert.equal(status.schemaVersion,1);assert.ok(status.catalog.nodes>0);
  assert.match(status.source.sha256,/^[a-f0-9]{64}$/);
  assert.ok(['passed','failed','stale','unbound','source-changed','missing','invalid'].includes(status.reports.tests.status));
  assert.equal(spawnSync(process.execPath,[script,'--publish'],{windowsHide:true,timeout:10000}).status,2);
});

test('a failed environment probe replaces an earlier success with a failed report',async()=>{
  await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/verification-probe-'));
  await mkdir(join(folder,'scripts'));await mkdir(join(folder,'artifacts'));
  for(const name of ['test.mjs','process.mjs','processes.py','windows_job.py','windows_process.py','verification-state.mjs'])await copyFile(resolve('scripts',name),join(folder,'scripts',name));
  const report=join(folder,'artifacts/test-results.json');await writeFile(report,JSON.stringify({passed:true}));
  const result=spawnSync(process.execPath,[join(folder,'scripts/test.mjs')],{cwd:folder,encoding:'utf8',windowsHide:true,timeout:10000,
    env:{...process.env,LAB_TEST_PYTHON:join(folder,'missing-python-executable')}});
  assert.equal(result.status,1,result.stderr);
  const data=JSON.parse(await readFile(report,'utf8'));
  assert.equal(data.passed,false);assert.match(data.error,/完整测试环境未就绪/);
  assert.equal((await reportStatus(report,await sourceSnapshot(folder))).status,'failed');
});
