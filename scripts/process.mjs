import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const windowsSupervisor=fileURLToPath(new URL('./windows_process.py',import.meta.url));
const localPython=fileURLToPath(new URL('../.venv-labs/Scripts/python.exe',import.meta.url));

// Own a POSIX process group or a Windows Job Object via the Python supervisor.
// This limits accidental runaway work; it is not a security sandbox.
async function stopTree(child){
  if(!child.pid)return;
  if(process.platform==='win32'){
    // Terminating the owner closes its non-inheritable job handle; Windows stops
    // its descendants even when their original parent has already exited.
    if(child.exitCode===null)child.kill('SIGKILL');
  }else{
    try{process.kill(-child.pid,'SIGKILL');}catch(error){if(error.code!=='ESRCH')throw error;}
  }
  if(child.exitCode===null)child.kill('SIGKILL');
}

export function runProcess(command,args,{cwd,env=process.env,input,timeout=600000,maxBytes=65536,inherit=false,signal}={}){
  return new Promise(resolve=>{
    const windows=process.platform==='win32';
    const executable=windows?(env.LAB_TEST_PYTHON||env.LAB_PYTHON||(existsSync(localPython)?localPython:'python')):command;
    const parameters=windows?['-B',windowsSupervisor,command,...args]:args;
    const child=spawn(executable,parameters,{cwd,env,windowsHide:true,detached:!windows,stdio:inherit?'inherit':['pipe','pipe','pipe']});
    const chunks={stdout:[],stderr:[]},sizes={stdout:0,stderr:0};
    let reason,error,stopping,finished=false;
    const finish=async code=>{
      if(finished)return;finished=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);
      if(stopping)await stopping;
      const stderr=Buffer.concat(chunks.stderr).toString('utf8');
      if(windows&&code===126&&stderr.startsWith('AI_INFRA_PROCESS_START_ERROR:')){
        try{error=JSON.parse(stderr.slice('AI_INFRA_PROCESS_START_ERROR:'.length));}catch{error=stderr;}
      }
      resolve({code,reason,error,stdout:Buffer.concat(chunks.stdout).toString('utf8'),stderr});
    };
    const stop=why=>{
      if(stopping||finished)return;
      reason=why;
      stopping=stopTree(child).catch(e=>{error=e.message;}).finally(()=>{
        // Inherited pipes must not keep a timed-out command waiting forever.
        child.stdin?.destroy();child.stdout?.destroy();child.stderr?.destroy();
      });
      stopping.then(()=>finish(child.exitCode));
    };
    const cancel=()=>stop('interrupted');
    const timer=setTimeout(()=>stop('timeout'),timeout);
    signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();
    if(!inherit){
      for(const name of ['stdout','stderr'])child[name].on('data',chunk=>{
        const remaining=Math.max(0,maxBytes-sizes[name]);
        if(remaining)chunks[name].push(chunk.subarray(0,remaining));
        sizes[name]+=chunk.length;if(sizes[name]>maxBytes)stop('output limit');
      });
      child.stdin.on('error',()=>{});child.stdin.end(input);
    }
    child.once('error',e=>{error=e.message;finish(null);});child.once('close',finish);
  });
}
