import {existsSync} from 'node:fs';
import {mkdir,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {runProcess} from './process.mjs';
import {sourceSnapshot,sameSource} from './verification-state.mjs';
const before=await sourceSnapshot();
const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:process.platform==='win32'?'python':'python3');
let files=[],result,counts={},failure;
try{
  const probe=await runProcess(python,['-c','import sys; assert sys.version_info >= (3,10); import pytest, torch, portalocker, fissix; print(sys.executable)'],{timeout:30000});
  if(probe.code!==0||probe.reason||probe.error){
    throw Error('完整测试环境未就绪。按 docs/getting-started.md 准备依赖，或用 LAB_TEST_PYTHON 指定解释器。\n'+(probe.error||probe.reason||probe.stderr));
  }
  files=(await readdir('tests')).filter(file=>file.endsWith('.test.mjs')).sort().map(file=>'tests/'+file);
  result=await runProcess(process.execPath,['--test','--test-reporter=tap',...files],{timeout:180000,maxBytes:8*1024*1024,env:{...process.env,LAB_TEST_PYTHON:probe.stdout.trim()}});
  process.stdout.write(result.stdout);process.stderr.write(result.stderr);
  counts=Object.fromEntries([...result.stdout.matchAll(/^# (tests|pass|fail|skipped) (\d+)\r?$/gm)].map(match=>[match[1],Number(match[2])]));
}catch(error){failure=error.message;console.error(failure);}
const after=await sourceSnapshot();
const stable=sameSource(before,after);
const passed=stable&&!failure&&result?.code===0&&!result.error&&!result.reason&&counts.tests>0&&counts.pass===counts.tests&&counts.fail===0&&counts.skipped===0;
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/test-results.json',JSON.stringify({passed,createdAt:new Date().toISOString(),node:process.version,platform:process.platform,source:{before,after},counts,files,exitCode:result?.code??1,error:!stable?'Source changed during verification':failure||result?.error||result?.reason||null},null,2)+'\n');
if(!passed){console.error('完整测试未通过：失败、跳过、执行异常、源码变化或结果缺失。');process.exitCode=1;}
