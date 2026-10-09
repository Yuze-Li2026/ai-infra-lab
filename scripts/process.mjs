import {spawn} from 'node:child_process';

// Own a POSIX process group or stop the Windows tree while its parent is alive.
// This limits accidental runaway work; it is not a security sandbox.
async function stopTree(child){
  if(!child.pid)return;
  if(process.platform==='win32'){
    await new Promise(resolve=>{
      const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
      const timer=setTimeout(()=>{killer.kill();resolve();},5000);
      const done=()=>{clearTimeout(timer);resolve();};killer.once('error',done);killer.once('close',done);
    });
  }else{
    try{process.kill(-child.pid,'SIGKILL');}catch(error){if(error.code!=='ESRCH')throw error;}
  }
  if(child.exitCode===null)child.kill('SIGKILL');
}

export function runProcess(command,args,{cwd,env=process.env,input,timeout=600000,maxBytes=65536,inherit=false,signal}={}){
  return new Promise(resolve=>{
    const child=spawn(command,args,{cwd,env,windowsHide:true,detached:process.platform!=='win32',stdio:inherit?'inherit':['pipe','pipe','pipe']});
    const chunks={stdout:[],stderr:[]},sizes={stdout:0,stderr:0};
    let reason,error,stopping,finished=false;
    const finish=async code=>{
      if(finished)return;finished=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);
      if(stopping)await stopping;
      resolve({code,reason,error,stdout:Buffer.concat(chunks.stdout).toString('utf8'),stderr:Buffer.concat(chunks.stderr).toString('utf8')});
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
