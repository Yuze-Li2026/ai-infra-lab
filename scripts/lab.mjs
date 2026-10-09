import {spawn} from 'node:child_process';
import {existsSync,constants} from 'node:fs';
import {mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const [lab,...args]=process.argv.slice(2);
const supported=['indoor','object-model','dbdb','consensus','micrograd','gpu'];
const root=fileURLToPath(new URL('../',import.meta.url));
if(['--help','-h'].includes(lab)){console.log(`用法：node scripts/lab.mjs <${supported.join('|')}> [实验参数]\n默认运行参考实现；--submission 路径运行自己的实现。indoor 必须提供自己的文件。\nGPU 支持 --init 新目录，安全创建无答案模板，已有目录拒绝覆盖。\n解释器优先使用项目 .venv-labs，也可设置 LAB_PYTHON。`);process.exit(0);}
if(!supported.includes(lab)){console.error(`用法：node scripts/lab.mjs <${supported.join('|')}> [实验参数]`);process.exit(2);}
if(lab==='gpu'&&args[0]==='--init'){
 if(args.length!==2){console.error('用法：node scripts/lab.mjs gpu --init <新的作品目录>');process.exit(2);}
 const destination=resolve(args[1]);
 try{
  await mkdir(dirname(destination),{recursive:true});await mkdir(destination);
  await copyFile(resolve(root,'labs/gpu/submission-template.py'),join(destination,'implementation.py'),constants.COPYFILE_EXCL);
  console.log(`已创建 ${destination}。请自行实现 implementation.py 的七个接口，再用 --submission 运行。`);process.exit(0);
 }catch(error){console.error('准备作品失败；不覆盖已有目录或文件：'+error.message);process.exit(1);}
}
const local=resolve(root,'.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_PYTHON||(existsSync(local)?local:'python');
for(let i=0;i<args.length;i++)if(['--submission','--output'].includes(args[i])&&args[i+1])args[++i]=resolve(args[i]);
let command=python,parameters=[resolve(root,`labs/${lab}/run.py`),...args];
if(lab==='indoor'){
 if(args.length!==1||args[0].startsWith('--')){console.error('请提供一个自己编写的 indoor.py 文件路径；解释器使用 LAB_PYTHON。');process.exit(2);}
 command=process.execPath;parameters=[resolve(root,'scripts/grade.mjs'),resolve(args[0]),python];
}
console.log(`运行 ${lab}：${lab==='indoor'||args.includes('--submission')?'指定作品':'参考实现'}。代码使用本地用户权限；默认报告位于项目 artifacts。`);
const child=spawn(command,parameters,{stdio:'inherit',windowsHide:true,cwd:root});
const timeout=setTimeout(()=>{console.error('实验超过 10 分钟，已停止。请缩小工作负载或检查死循环。');child.kill();},600000);
child.on('error',error=>{clearTimeout(timeout);console.error(`启动失败：${error.message}。请阅读站内“从零开始使用”中的环境准备。`);process.exitCode=2;});
child.on('exit',code=>{clearTimeout(timeout);process.exitCode=code??1;});
