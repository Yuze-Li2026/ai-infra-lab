// One-time reviewed migration. Refuses to overwrite this revision after application.
import {readFileSync,writeFileSync} from 'node:fs';
const c=JSON.parse(readFileSync('site/catalog.json','utf8'));
if(c.revision||c.sources.some(s=>s.id==='algorithms-mit'))throw new Error('历史迁移已应用或目录已有新版本，拒绝回写。请直接编辑 catalog.json。');
const additions=[
 ['algorithms-mit','MIT 6.006 Introduction to Algorithms','Erik Demaine / Srini Devadas','https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/','Fall 2011','Python、离散数学','数据结构、排序、图搜索、最短路与动态规划','理论题与编程作业配合，覆盖复杂度与实现','相较单纯刷题，保留证明和成本模型；旧作业运行环境需单独处理','课程页与 syllabus 明确 Python / 离散数学先修；作业采用理论与代码结合。','OCW 许可与单项例外，暂仅链接'],
 ['algebra-text','Algebra and Trigonometry 2e','Jay Abramson / OpenStax','https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites','2e 在线版','四则运算、分数与比例','方程、函数、多项式、指数、对数及三角基础','承接前代数，为微积分与数量关系建模提供教材路径','相较直接进入大学微积分，提供中间桥梁；不要求所有章节必修','原书章节入口已访问，完整习题体验未做学习者试用。','以书页版权及使用条款为准，暂仅链接'],
 ['beej-c','Beej’s Guide to C Programming','Brian “Beej Jorgensen” Hall','https://beej.us/guide/bgc/html/split/','作者在线版，2026-10-08 查阅','已有一种编程语言基础','C 类型、指针、数组、结构体、文件与内存','按主题分章，适合从 Python 过渡到系统语言','作为 C 入门辅助，不替代计算机组织课；现代 C++ 另有课程','作者目录已访问，覆盖指针与内存相关主题。','以作者版权说明为准，暂仅链接'],
 ['cs61c','Berkeley CS61C','Dan Garcia / UC Berkeley 教学团队','https://cs61c.org/fa26/','Fall 2026','程序设计、基本数据结构','C、数值表示、RISC-V、缓存与并行基础','课程日程将讲授、实验和项目串联','较 OSTEP 更靠近计算机组织前置；校内媒体和评分可能不可访问','日程可见 C 入门、指针/数组、内存管理和浮点数讲次。','课程材料与代码须分别核实，暂仅链接'],
 ['cs106l','Stanford CS106L Standard C++ Programming','Stanford CS106L 教学团队','https://web.stanford.edu/class/cs106l/','2026-10-08 在线课程页','程序设计与抽象基础','现代 C++、类型、标准库与资源管理','为 C++ 系统课程提供独立语言桥梁','C 入门不等于掌握 C++；本课放在系统实现前按需学习','官方课程入口已访问，具体作业环境尚未复现。','逐项核实课程与作业许可，暂仅链接'],
 ['cs144','Stanford CS144 Computer Networking','Keith Winstein / Stanford','https://cs144.github.io/','Fall 2026','C++、数据结构、操作系统基础','数据报、可靠传输、TCP 与字节流','分阶段网络实验连接协议语义与实现','作为网络主课；其 Linux/C++ 环境尚未在此 Windows 主机复现','官方日程含 byte stream 与 TCP receiver 检查点，校内提交不可当本站评分。','课程与实验代码分别核实，暂仅链接'],
 ['multivariable','MIT 18.02SC Multivariable Calculus','MIT OCW 教学团队','https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/','Fall 2010','单变量微积分、向量','偏导、梯度、方向导数与多变量优化','为自动微分补齐单变量课程以外的数学环节','按梯度与优化需要选章，向量场积分作为按需深入','官方课程目录与独立学习结构入口已访问。','OCW 许可与单项例外，暂仅链接'],
 ['stat110','Harvard Statistics 110','Joseph K. Blitzstein / Harvard','https://stat110.hsites.harvard.edu/','官方在线课程入口','代数、基础微积分、组合推理','条件概率、随机变量、期望和常见分布','大学概率课程与公开材料作为概率主线','6.042J 提供离散基础，本课系统展开概率；统计推断另配 OpenIntro','官方课程入口已访问；数学衔接为本项目设计。','以原站和教材授权为准，暂仅链接'],
 ['openintro','OpenIntro Statistics','David Diez / Mine Çetinkaya-Rundel / Christopher Barr','https://www.openintro.org/book/os/','第 4 版资源页，2026-10-08 查阅','代数、概率基础','抽样、估计、置信区间、检验与回归','将统计判断与实验结果解释连接','补充概率课不能独自覆盖的推断；不作为完整研究统计训练','教材官方入口已访问；资料与数据文件许可需分别检查。','以各下载文件许可为准，暂仅链接'],
 ['sre','Site Reliability Engineering','Google SRE 作者团队','https://sre.google/sre-book/table-of-contents/','作者在线版本','网络、操作系统、服务部署','服务目标、监控、过载、故障排查与应急响应','从真实生产运行视角组织可靠性实践','补足仅学 Kubernetes 配置的局限；案例需迁移到教学规模','官方目录已访问，作为运行能力选章依据。','作者在线阅读条款，暂仅链接'],
 ['mlir','MLIR Toy Tutorial','LLVM / MLIR contributors','https://mlir.llvm.org/docs/Tutorials/Toy/','滚动教程，集成前固定 LLVM 版本','C++、编译器基础、张量和图优化','语言前端、IR、优化与 lowering','官方逐步构造语言的工程教程','作为编译器方向项目；不是无前置零基础教程','官方教程入口已访问；编译工具链尚未复现。','LLVM 文档与代码许可分别复核，暂仅链接'],
 ['object-model','A Simple Object Model','Carl Friedrich Bolz / AOSA','https://aosabook.org/en/500L/a-simple-object-model.html','500lines commit fba689d101eb5600f5c8f4d7fd79912498e950e2','Python 类、字典、递归、异常和测试','属性查找、方法绑定、可定制对象与共享布局','四阶段原代码及原测试，适合普通 CPU 实验','比简单语法题更接近运行时设计；是教学简化模型，不是生产虚拟机','已固定提交、保留原文与哈希；Python 3.12.14 / Windows 下 28 项原测试通过。','代码 MIT；文字 CC BY 3.0；upstream/LICENSE.md 已核对']
];
for(const [id,title,author,url,version,prerequisites,coverage,teaching,reason,verification,license] of additions){
 c.sources.push({id,title,author,url,version,language:'en',prerequisites,coverage,reason,limitations:reason,verification,license,licenseUrl:id==='object-model'?'https://github.com/aosabook/500lines/blob/fba689d101eb5600f5c8f4d7fd79912498e950e2/LICENSE.md':url,reviewedAt:'2026-10-08',reviewLevel:id==='object-model'?'原始代码及测试在指定环境复现':'目录与教学结构审阅；未完成全课程试学',reuse:id==='object-model'?'保留 MIT 原代码、测试、许可和作者；章节仅链接':'只提供链接与原创导读',evaluation:{authority:`原始来源：${author}`,accuracy:verification,depth:coverage,engineeringValue:reason,coverage,teachingQuality:teaching,difficulty:prerequisites,languageFriendliness:'英文主资源；本站提供选读、验收和术语中文辅助，不声称已完整翻译',accessibility:'官方公开入口；具体媒体、作业服务或下载访问另行确认',maintenance:version,licensing:license,stability:'固定学期或版本信息；滚动内容在实际集成前再次锁定'}});
}
const plans={
 computer:[['cs50'],['建立学习文件夹，理解文件、扩展名和路径','打开编辑器并运行输出程序，区分编辑与执行','故意制造一个错误，记录原始信息并定位'], '文件操作与原课环境起步'],
 arithmetic:[['openstax'],['整数、分数、小数和四则运算','比例、百分比、单位换算','用数据量÷耗时解释吞吐量，并检查单位'], '四则运算、分数、小数、比例'],
 python:[['cs50'],['第 0 周：输入、输出、变量、字符串与函数','独立完成原题 Indoor Voice，再运行本地补充检查','解释失败案例，并用自己的输入复核'], 'CS50 Python 第 0 周及原始 Problem Set 0'],
 tools:[['missing','missing-cn'],['shell 与文件路径；Windows 和类 Unix 命令分别对照','Git 提交、查看差异、分支和一次安全撤回','调试、日志与 README 中的复现步骤'], 'shell、版本控制、调试相关讲次'],
 algebra:[['algebra-text','openstax'],['基础运算与方程：从前代数进入代数教材','函数、图像、多项式、指数与对数','微积分前补齐三角函数基础；用函数描述资源增长'], '先修复习、方程、函数、指数/对数与必要三角基础'],
 programming:[['composing','cs50','object-model'],['函数分解、递归、序列、字典与对象抽象','异常、模块、测试与文件 I/O；完成综合原课项目','进入对象模型原项目，先写设计再对照测试'], 'Composing Programs 函数/数据部分 + CS50 测试与项目'],
 discrete:[['discrete'],['逻辑、集合、归纳与不变量','图与递归结构、计数方法','给算法和依赖图写出可检查的正确性论证'], '证明、图、递归与组合基础'],
 linear:[['linear'],['线性方程、向量空间与矩阵运算','正交、最小二乘、特征值及正定性','将张量形状与线性变换联系，完成原课习题'], '18.06 中矩阵、空间、正交与特征值主题'],
 calculus:[['calculus','multivariable'],['单变量导数、链式法则、积分与优化','向量、偏导、梯度与多变量链式法则','对简单函数手算梯度，用有限差分检验'], '18.01SC 微分基础 → 18.02SC 偏导与优化'],
 probability:[['stat110','openintro','discrete'],['条件概率、随机变量、期望、方差与分布','抽样、置信区间和假设检验；辨别统计假设','对多次性能测量报告离散程度，解释不确定性'], 'Stat110 概率主线 + OpenIntro 抽样与推断选章'],
 algorithms:[['algorithms-mit','composing'],['复杂度、排序、散列与树结构','图搜索、最短路与动态规划','选原课编程和理论题，提交实现、证明与成本测量'], '6.006 数据结构、图算法和动态规划主题'],
 architecture:[['beej-c','cs61c','cs106l'],['C 类型、指针、数组、结构体和内存管理','CS61C 数值表示、机器指令、缓存与并行主题','进入 C++ 实验前补 CS106L 类型、容器和资源管理'], 'C 语言桥梁 → 计算机组织 → 按需 C++'],
 os:[['ostep'],['进程、地址空间和虚拟内存','线程、锁、条件变量与竞态','文件和持久化机制，选原书项目并测试故障'], 'OSTEP 虚拟化、并发、持久化三部分'],
 network:[['cs144'],['数据报、分层与应用请求路径','可靠传输、重组、TCP 与流量控制','原课 checkpoint 从字节流开始；记录带宽与延迟'], 'CS144 讲授及按顺序完成的网络检查点'],
 numerics:[['d2l','dlsys','cs61c'],['浮点表示、舍入、溢出与 dtype','稳定 softmax、梯度误差与有限差分','固定输入与环境，预热并重复测量，报告容差'], '浮点与数值计算；框架课程资源核算'],
 ml:[['d2l'],['张量、线性回归与训练/验证划分','损失、梯度下降、小批量与优化器','建立可复现基线，解释过拟合与数据泄漏'], 'D2L 预备知识、线性模型和优化基础'],
 framework:[['dlsys'],['先做 HW0 自测，再实现计算图与自动微分','实现模块、优化器和数据加载','实现 NDArray 后端，与参考结果和数值容差比较'], 'DLSys HW0–HW4；环境逐阶段核实'],
 data:[['cs336','mlsys'],['记录数据来源、使用许可与版本','过滤、去重、划分和加载管线','比较加载瓶颈、随机种子和可复现训练结果'], 'CS336 数据与评估主题 + MLSys 系统视角'],
 gpu:[['cuda','cs336'],['线程执行、内存层次与访存模式','先实现正确算子，再测算力与带宽瓶颈','优化分块或融合，报告重复测量和精度差异'], 'CUDA 执行/内存模型 + CS336 内核主题'],
 dist:[['distributed'],['先补足原课所需 Go 与并发语法','学习复制、协调、一致性和故障语义','按原实验做故障注入，解释恢复正确性'], '6.5840 原实验，具体版本与环境待锁定'],
 training:[['torch','cs336'],['建立单机基线并核算参数、优化器和激活内存','比较数据、张量与流水线并行','測通信、扩展效率和断点恢复，解释训练等价性'], 'PyTorch 通信 API + CS336 并行主题'],
 inference:[['vllm','cs336'],['固定模型许可、权重版本与单请求基线','比较批处理、KV cache 和调度策略','同时报告输出正确性、TTFT、吞吐和显存'], 'vLLM 官方部署/性能文档 + CS336 推理主题'],
 operations:[['sre','security','mlsys'],['明确服务目标，设计日志、指标和诊断路径','最小权限、资源隔离与过载保护','进行一次可恢复故障演练，记录成本和回滚步骤'], 'Google SRE 目标/监控/应急主题 + Kubernetes 安全'],
 compiler:[['mlir','dlsys'],['补齐 C++、编译流程、IR 和语义基础','沿 Toy Tutorial 构建转换流程','对优化前后做语义一致性、编译成本与性能比较'], 'MLIR Toy Tutorial；进阶分支']
};
for(const n of c.nodes){
 const [resources,tasks,scope]=plans[n.id];n.resources=resources;n.scope=scope;
 n.steps=tasks.map((task,i)=>({title:`步骤 ${i+1}`,task}));
 n.guidance=`按“${scope}”学习，逐步完成下列任务。已有基础可用相应作品与测试证明跳过。`;
 n.status='已建立选读与成果路径；教学衔接仍需学习者试用';
 n.estimatedHours=null; // Do not invent completion times.
}
c.nodes.find(n=>n.id==='calculus').prerequisites=['algebra','linear'];
c.nodes.find(n=>n.id==='probability').prerequisites=['algebra','discrete','calculus'];
for(const s of c.sources){
 s.evaluation.authority=`作者与机构：${s.author}；原始来源见链接`;
 s.evaluation.accuracy=s.verification;
 s.reviewEvidence=[{url:s.url,checkedAt:'2026-10-08',finding:s.verification}];
}
c.labs.push({id:'object-model',title:'阶段综合实践 · 对象运行时',stage:2,nodes:['programming','algorithms','tools'],source:'object-model',url:'https://aosabook.org/en/500L/a-simple-object-model.html',hardware:'CPU / Python 3.10+，无第三方依赖；已在 Windows / Python 3.12.14 复现',status:'固定版本，28 项原测试通过；含独立提交与性能测量流程',integration:'reproduced',goal:'依据原作者四阶段项目实现对象查找、方法绑定、属性定制和共享布局。',rubric:['先提交设计与独立实现，不以复制参考实现为完成','逐阶段通过原测试，并添加有解释的边界案例','运行相同工作负载，比较内存和七次计时','说明原理、性能权衡与教学模型局限'],command:'python labs/object-model/run.py --benchmark',guide:'./docs/object-model-lab.md',limitation:'参考复现不是学习者能力认证；Python 模型性能不能外推到工业虚拟机；无安全沙箱。'});
for(const l of c.labs){if(!l.integration)l.integration=l.id==='indoor'?'checked':'candidate';if(l.command&&!l.guide)l.guide='./docs/getting-started.md';}
c.revision='2026-10-08-v02';
writeFileSync('site/catalog.json',JSON.stringify(c,null,2)+'\n');
writeFileSync('docs/object-model-lab.md',readFileSync('labs/object-model/README.md','utf8'));
console.log(`Updated ${c.nodes.length} nodes, ${c.sources.length} sources, ${c.labs.length} labs.`);
