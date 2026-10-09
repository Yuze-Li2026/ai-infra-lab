import {spawn} from 'node:child_process';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {runProcess} from './process.mjs';
import {sourceSnapshot,sameSource} from './verification-state.mjs';

const checks=['browser-check','optimization-browser','release-browser','complete-browser','quality-browser'];
if(process.argv.includes('--gpu-reports'))checks.push('usability-browser');
const unknown=process.argv.slice(2).filter(arg=>arg!=='--gpu-reports');
if(unknown.length)throw Error('Unsupported options: '+unknown.join(' '));
const before=await sourceSnapshot();
const env={...process.env};
await mkdir('artifacts',{recursive:true});
const results=[];
let server,failure;
try{
 if(!env.LAB_BROWSER_PATH&&process.platform==='win32'){
  const candidate='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  await access(candidate);env.LAB_BROWSER_PATH=candidate;
 }
 // Build and reference evidence are real prerequisites, not fixtures silently left by a previous run.
 for(const [name,args]of [['build',['scripts/build.mjs']],['database-reference',['scripts/lab.mjs','dbdb']]]){
  const result=await runProcess(process.execPath,args,{env,cwd:resolve('.'),timeout:120000,maxBytes:1_000_000});
  results.push({name,code:result.code,reason:result.reason});
  if(result.code!==0||result.reason)throw Error(`${name}: ${result.reason||result.stderr||result.stdout}`);
 }
 if(!env.LAB_QA_URL){
  server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:resolve('.'),env:{...env,PORT:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  env.LAB_QA_URL=await new Promise((accept,reject)=>{
   let output='';const timer=setTimeout(()=>reject(Error('Local server startup timed out')),10000);
   const fail=error=>{clearTimeout(timer);reject(error);};
   server.once('error',fail);server.once('exit',code=>fail(Error('Local server exited: '+code)));
   server.stderr.on('data',data=>{output=(output+data).slice(-8000);});
   server.stdout.on('data',data=>{
    output=(output+data).slice(-8000);const url=output.match(/AI Infra Lab: (http:\/\/127\.0\.0\.1:\d+)/)?.[1];
    if(url){clearTimeout(timer);accept(url);}
   });
  });
 }
 for(const name of checks){
  console.log('Browser check:',name);
  const result=await runProcess(process.execPath,['tests/'+name+'.mjs'],{env,cwd:resolve('.'),timeout:180000,maxBytes:2_000_000});
  await writeFile('artifacts/'+name+'.log',result.stdout+result.stderr);
  results.push({name,code:result.code,reason:result.reason});
  if(result.code!==0||result.reason)throw Error(`${name}: ${result.reason||result.stderr||result.stdout}`);
 }
 const after=await sourceSnapshot();
 if(!sameSource(before,after))throw Error('Source changed during browser verification');
 console.log('All requested browser suites passed:',checks.length);
}catch(error){failure=error;throw error;}finally{
 if(server&&server.exitCode===null){
  await new Promise(done=>{const timer=setTimeout(done,5000);server.once('close',()=>{clearTimeout(timer);done();});server.kill();});
 }
 const version=JSON.parse(await readFile('package.json','utf8')).version;
 const after=await sourceSnapshot();
 const stable=sameSource(before,after);
 await writeFile('artifacts/browser-suite-results.json',JSON.stringify({passed:!failure&&stable,version,checkedAt:new Date().toISOString(),source:{before,after},results,error:failure?.message||(!stable?'Source changed during browser verification':undefined),gpuReportChecks:process.argv.includes('--gpu-reports')},null,2)+'\n');
 if(!stable)process.exitCode=1;
}
