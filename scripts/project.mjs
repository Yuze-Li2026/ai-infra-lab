import {runProcess} from './process.mjs';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++)if(['--directory','--archive','--python','--output'].includes(args[i])&&args[i+1])args[++i]=resolve(args[i]);
const local=resolve(root,'.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_PYTHON||(existsSync(local)?local:process.platform==='win32'?'python':'python3');
const controller=new AbortController();
const interrupt=()=>controller.abort();
process.on('SIGINT',interrupt);process.on('SIGTERM',interrupt);
try{
 const result=await runProcess(python,[resolve(root,'scripts/project.py'),...args],{inherit:true,cwd:root,timeout:660000,signal:controller.signal,env:{...process.env,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'}});
 if(result.error)console.error('无法启动课程工具：'+result.error);
 if(result.reason)console.error('课程工具未完成：'+result.reason);
 process.exitCode=result.reason==='interrupted'?130:result.error?2:result.reason?1:result.code??1;
}finally{process.off('SIGINT',interrupt);process.off('SIGTERM',interrupt);}
