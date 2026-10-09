import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
const [lab,...args]=process.argv.slice(2);
const supported=['indoor','object-model','dbdb','consensus','micrograd','gpu'];
if(!supported.includes(lab)){console.error(`用法：node scripts/lab.mjs <${supported.join('|')}> [实验参数]`);process.exit(2);}
const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=process.env.LAB_PYTHON||(existsSync(local)?local:'python');
let command=python,parameters=[`labs/${lab}/run.py`,...args];
if(lab==='indoor'){if(!args[0]){console.error('请提供自己编写的 indoor.py 文件路径。');process.exit(2);}command=process.execPath;parameters=['scripts/grade.mjs',args[0],python];}
console.log(`运行 ${lab}；仅执行你选择的本地代码。报告保存在 artifacts。`);
const child=spawn(command,parameters,{stdio:'inherit',windowsHide:true});
const timeout=setTimeout(()=>{console.error('实验超过 10 分钟，已停止。请缩小工作负载或检查死循环。');child.kill();},600000);
child.on('error',error=>{clearTimeout(timeout);console.error(`启动失败：${error.message}。请阅读站内“从零开始使用”中的环境准备。`);process.exitCode=2;});
child.on('exit',code=>{clearTimeout(timeout);process.exitCode=code??1;});
