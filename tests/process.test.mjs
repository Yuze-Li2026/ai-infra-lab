import test from 'node:test';
import assert from 'node:assert/strict';
import {runProcess} from '../scripts/process.mjs';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';

test('process output preserves split UTF-8 and bounds both streams',async()=>{
  const code="const b=Buffer.from('你好');for(let i=0;i<b.length;i++)setTimeout(()=>process.stdout.write(b.subarray(i,i+1)),i*15);";
  assert.equal((await runProcess(process.execPath,['-e',code])).stdout,'你好');
  for(const stream of ['stdout','stderr']){
    const result=await runProcess(process.execPath,['-e',`setInterval(()=>process.${stream}.write('x'.repeat(4096)),1)`],{maxBytes:1024,timeout:2000});
    assert.equal(result.reason,'output limit');assert.equal(Buffer.byteLength(result[stream]),1024);
  }
  assert.ok((await runProcess('missing-ai-infra-executable-123',[])).error);
});

test('timeout stops owned child work without stopping an unrelated process',async()=>{
  await mkdir('artifacts',{recursive:true});const directory=await mkdtemp(resolve('artifacts/process-'));
  const heartbeat=join(directory,'heartbeat');
  const writer=`setInterval(()=>require('node:fs').appendFileSync(${JSON.stringify(heartbeat)},'x'),25)`;
  const parent=`require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(writer)}],{stdio:'inherit'});setInterval(()=>{},1000);`;
  const unrelated=runProcess(process.execPath,['-e',"setTimeout(()=>process.stdout.write('still alive'),1600)"],{timeout:4000});
  const result=await runProcess(process.execPath,['-e',parent],{timeout:700});assert.equal(result.reason,'timeout');
  const before=await readFile(heartbeat,'utf8');assert.ok(before.length);
  await new Promise(resolveWait=>setTimeout(resolveWait,200));assert.equal(await readFile(heartbeat,'utf8'),before);
  const survivor=await unrelated;assert.equal(survivor.code,0);assert.equal(survivor.stdout,'still alive');
});

test('abort cancels a running command and returns a failure reason',async()=>{
  const controller=new AbortController();const pending=runProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{signal:controller.signal});
  setTimeout(()=>controller.abort(),100);assert.equal((await pending).reason,'interrupted');
});

test('an exited command cannot leave a grandchild holding its pipes open',async()=>{
  await mkdir('artifacts',{recursive:true});const directory=await mkdtemp(resolve('artifacts/process-orphan-'));
  const heartbeat=join(directory,'heartbeat'),stop=join(directory,'stop');
  const writer=`const fs=require('node:fs');const timer=setInterval(()=>{if(fs.existsSync(${JSON.stringify(stop)})){clearInterval(timer);return;}fs.appendFileSync(${JSON.stringify(heartbeat)},'x');},25);setTimeout(()=>process.exit(),15000).unref();`;
  const parent=`require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(writer)}],{stdio:'inherit'}).unref();const fs=require('node:fs');const timer=setInterval(()=>{if(fs.existsSync(${JSON.stringify(heartbeat)})){clearInterval(timer);process.exit(0);}},10);`;
  try{
    const start=Date.now(),result=await runProcess(process.execPath,['-e',parent],{timeout:1500});
    assert.ok(Date.now()-start<8000,'inherited pipes kept the runner blocked');
    assert.ok(result.code===0||result.reason==='timeout',JSON.stringify(result));
    const before=await readFile(heartbeat,'utf8');assert.ok(before.length);
    await new Promise(resolveWait=>setTimeout(resolveWait,250));assert.equal(await readFile(heartbeat,'utf8'),before,'orphan continued writing');
  }finally{await writeFile(stop,'stop');}
});
