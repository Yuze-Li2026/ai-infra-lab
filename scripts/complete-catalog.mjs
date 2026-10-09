// One-time migration of reviewed, pinned experiments. Source originals are never generated here.
import {readFile,writeFile} from 'node:fs/promises';
const c=JSON.parse(await readFile('site/catalog.json','utf8'));
const commit='fba689d101eb5600f5c8f4d7fd79912498e950e2';
const publicValidation=r=>({mode:r.mode,commit:r.commit,createdAt:r.createdAt,python:r.python,platform:r.platform,passed:r.passed,tests:r.results.reduce((n,x)=>n+x.tests,0),benchmark:r.benchmark});
const projects=[
 {id:'dbdb',title:'DBDB · 持久化键值数据库',author:'Taavi Burns',url:'https://aosabook.org/en/500L/dbdb-dog-bed-database.html',stage:2,nodes:['algorithms','os','architecture'],goal:'实现二叉树、延迟加载、文件锁和提交，验证关闭重开后的持久化。',difficulty:'递归、文件 I/O、数据结构与锁',tests:21,commit},
 {id:'consensus',title:'Clustering by Consensus · 故障与共识',author:'Dustin J. Mitchell',url:'https://aosabook.org/en/500L/clustering-by-consensus.html',stage:4,nodes:['dist','network','os'],goal:'通过原作者模拟网络理解日志一致性、选举、节点失效和恢复。',difficulty:'并发、网络、状态机与故障模型',tests:46,commit},
 {id:'micrograd',title:'micrograd · 自动微分与训练',author:'Andrej Karpathy',url:'https://github.com/karpathy/micrograd',stage:3,nodes:['framework','calculus','ml'],goal:'独立实现标量反向自动微分，用有限差分、原测试和小模型训练检查梯度。',difficulty:'Python 对象、链式法则与优化',tests:11,commit:'7bc720e951fe422b8f8814aa5aa1b64121d26b4c'}
];
for(const p of projects){
 const licenseUrl=p.id==='micrograd'?`https://github.com/karpathy/micrograd/blob/${p.commit}/LICENSE`:`https://github.com/aosabook/500lines/blob/${commit}/${p.id==='dbdb'?'data-store':'cluster'}/LICENSE.md`;
 const finalLicense=p.id==='micrograd'?licenseUrl:`https://github.com/aosabook/500lines/blob/${commit}/LICENSE.md`;
 const s={id:p.id,title:p.title,author:p.author,url:p.url,version:p.commit,language:'en',license:p.id==='micrograd'?'MIT':'MIT（代码）；CC BY 3.0（正文未复制）',licenseUrl:finalLicense,prerequisites:p.difficulty,coverage:p.goal,reason:'原作者完整教学代码与测试规模可控，可在普通电脑检查关键机制。',limitations:p.id==='consensus'?'确定性模拟网络；不是多主机工业服务。原始 500 行编辑限制未满足。':'教学模型，不能替代完整工业系统或原课程所有作业。',verification:`固定源码 SHA-256 已核对；${p.tests} 项检查在本机通过。`,reviewedAt:'2026-10-09',reviewLevel:'代码复现',reuse:'保留固定提交、原作者和许可证；原始文件不改写，兼容适配独立记录。',evaluation:{authority:'作者提供原始项目与设计说明',accuracy:'原测试断言保留；本地实际运行',depth:p.goal,engineeringValue:'可独立实现、运行检查、分析边界并解释设计',coverage:'覆盖所列机制；不宣称覆盖该阶段全部知识',teachingQuality:'源码与原作者说明对应；本站仅提供导读与验收组织',difficulty:p.difficulty,languageFriendliness:'英文原文，配中文实验指南与术语表',accessibility:'精选源码本地可用；原文保留在线链接',maintenance:'固定提交；Python 3.12 兼容层独立维护',licensing:'代码 MIT 原文随项目保留，书籍正文未复制',stability:'提交固定、逐文件校验；适配与断言分开'},reviewEvidence:[{url:p.url,checkedAt:'2026-10-09',finding:'原始来源与设计范围已核对'},{url:finalLicense,checkedAt:'2026-10-09',finding:'许可文件随源码保留'}]};
 const i=c.sources.findIndex(s=>s.id===p.id);if(i>=0)c.sources[i]=s;else c.sources.push(s);
 const report=JSON.parse(await readFile(`artifacts/${p.id}-report.json`,'utf8'));
 const lab={id:p.id,title:p.title,stage:p.stage,nodes:p.nodes,source:p.id,url:p.url,hardware:p.id==='consensus'?'CPU / Python 3.10+；fissix 固定版本':'CPU / Python 3.10+；依赖详见指南',goal:p.goal,status:`固定源码；${p.tests} 项检查通过。参考复现与独立作品分别记录。`,integration:'reproduced',command:`node scripts/lab.mjs ${p.id}`,guide:`./docs/${p.id}-lab.md`,reportCommit:p.commit,rubric:['Learn：按原作者说明解释关键机制','Design / Build：先写设计，再独立实现，不以复制参考源码验收','Test：用原断言和自选边界案例验证，提交本地报告','Optimize：固定种子与工作负载，预热后重复测量，解释时间与空间取舍','Explain：复述失败边界、简化假设与可复现步骤'],limitation:s.limitations+' 本地代码以当前用户权限运行；报告是本人提供的证据，不是独立认证。',validation:publicValidation(report)};
 const j=c.labs.findIndex(l=>l.id===p.id);if(j>=0)c.labs[j]=lab;else c.labs.push(lab);
}
const gpuReport=JSON.parse(await readFile('artifacts/gpu-report.json','utf8'));
const gpu={id:'gpu',title:'GPU · 正确性、训练与恢复',stage:4,nodes:['gpu','numerics','training'],source:'torch',url:'https://pytorch.org/docs/stable/index.html',hardware:'NVIDIA CUDA GPU；本机 RTX 5060 Laptop 8 GB，PyTorch 2.10.0+cu128；不会修改驱动',goal:'比较 CPU/GPU 数值误差，测量明确边界的矩阵乘法，验证训练和恢复后的下一步。',status:'真实 GPU 的四项补充集成检查通过；尚未验证多卡。',integration:'checked',command:'node scripts/lab.mjs gpu',guide:'./docs/gpu-lab.md',reportCommit:'pytorch-2.10.0+cu128',rubric:['说明精度、容差、随机种子与确定性选项','计时包含同步，报告预热、样本、中位数与测量边界','验证模型与优化器恢复后的下一步一致','分析单卡结果不能外推的条件'],limitation:'本站基于 PyTorch 公共 API 编写的补充集成检查，不是原课程评分；参考报告不作为个人能力验收。',validation:{...gpuReport,tests:4}};
const gi=c.labs.findIndex(l=>l.id==='gpu');if(gi>=0)c.labs[gi]=gpu;else c.labs.push(gpu);
const obj=c.labs.find(l=>l.id==='object-model');obj.stage=1;obj.nodes=['programming','tools'];obj.command='node scripts/lab.mjs object-model --benchmark';obj.reportCommit=commit;
c.labs.find(l=>l.id==='indoor').command='node scripts/lab.mjs indoor ./indoor.py';
c.labs.find(l=>l.id==='indoor').reportCommit='supplemental-v0.1';
for(const n of c.nodes){if(n.id==='framework'&&!n.resources.includes('micrograd'))n.resources.push('micrograd');if(n.id==='algorithms'&&!n.resources.includes('dbdb'))n.resources.push('dbdb');if(n.id==='dist'&&!n.resources.includes('consensus'))n.resources.push('consensus');}
gpu.validation=publicValidation(gpuReport);
const labs=['indoor','object-model','dbdb','micrograd','consensus'];
c.milestones=c.stages.map(s=>({stage:s.id,title:s.title,nodes:c.nodes.filter(n=>n.stage===s.id&&(n.category==='core'||c.labs.find(l=>l.id===labs[s.id]).nodes.includes(n.id))).map(n=>n.id),labs:[labs[s.id]],criteria:['提交知识节点的可复现成果与原理说明','提交独立作品的通过报告；参考实现不计入','保留设计、边界测试、重复性能测量和优化解释','请同伴复核关键假设；平台不作独立认证']}));
c.reviewedAt='2026-10-09';c.revision='2026-10-09-complete-local';
await writeFile('site/catalog.json',JSON.stringify(c,null,2)+'\n');
console.log({sources:c.sources.length,labs:c.labs.length,milestones:c.milestones.length});
