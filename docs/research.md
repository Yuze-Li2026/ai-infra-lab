# 研究与能力覆盖审计

研究日期：2026-10-08；整理与验收更新：2026-10-09。状态：多来源桌面研究、四项精选 CPU 原项目复现与真实单卡 GPU 集成验证，尚未完成完整教材阅读、所有高级候选原作业、教学试用与多卡复现。所有“必修”划分和依赖是本项目的设计判断，欢迎证据修订。

## 从实际系统工作反推学习范围

我们交叉查看了大学工程课程、作者教材与生产系统官方入口。以下是依据，而非依据知名度拼接课程：

- [CMU Deep Learning Systems](https://dlsyscourse.org/) 明确将框架实现、自动微分及高效后端连接起来，并列出数学、系统编程和 ML 先修。它支持将框架能力递归拆解，而非直接让新手做 CUDA 作业。
- [Stanford CS336](https://cs336.stanford.edu/) 的日程包含资源核算、内核、并行、推理、数据和评估。它支持从系统瓶颈和实验结果组织进阶路径；这不意味着本站已运行这些作业。
- [MLSysBook](https://mlsysbook.ai/) 展示从单机到规模化的教材与实验生态，用于覆盖交叉检查。网站自己的“完整课程”表述不是本站能力模型完整性的证明。
- [CUDA](https://docs.nvidia.com/cuda/cuda-programming-guide/)、[PyTorch Distributed](https://docs.pytorch.org/docs/stable/distributed.html)、[vLLM](https://docs.vllm.ai/en/latest/) 和 [Kubernetes Security](https://kubernetes.io/docs/concepts/security/) 提供原始实现与运行约束的一手入口，促使路径包括硬件、通信、服务及权限边界。
- [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/) 与 [MIT 6.5840](https://pdos.csail.mit.edu/6.5840/) 是操作系统及故障语义的基础来源。本站没有将它们全部内容机械塞入同一条必修路线。

暂定核心能力模型如下。资源范围仍可扩展，表中不是封闭的领域清单。

|真实能力|递归先修|成果与验收|初步依据|
|---|---|---|---|
|独立实现与诊断程序|文件操作 → 输入输出 → 函数/数据 → 测试/Git|可运行项目、边界测试、错误定位与 README|CS50、Missing Semester、Composing Programs|
|解释训练与数值行为|算术 → 代数/函数 → 线性代数/微积分/概率 → 优化|梯度推导、有限差分、稳定性对照、训练评估|MIT OCW、D2L、DLSys|
|设计框架与执行后端|程序抽象 + C/内存/组织 → OS/并发 + ML/数值|算子和梯度正确性、教学框架与设计解释|DLSys、OSTEP|
|定位性能瓶颈|单位与比例 → 统计测量 + 缓存/内存 → GPU 执行|预热与重复测量、误差、算力/带宽分析|CUDA、CS336|
|管理数据与实验复现|程序/版本控制 + I/O/网络 + ML 评估|数据出处、许可、随机种子、加载性能与复现|CS336、MLSysBook|
|规模化训练与恢复|并发 + 网络 + 分布式故障语义 + 框架 + GPU|通信剖析、扩展效率、一致性及恢复测试|6.5840、PyTorch、CS336|
|部署可用推理服务|模型推理 + 内存预算 + 网络 + 测量|TTFT、逐 token 延迟、吞吐与质量对照|vLLM、CS336|
|运行可靠且有边界的系统|OS/网络/工具 → 日志指标/权限/回滚|故障定位、最小权限、恢复与成本报告|Kubernetes、MLSysBook|
|专业深化：编译器、边缘与异构|核心框架/组织/算法，再按方向展开|语义等价、硬件约束、性能或能耗报告|MLIR、PyTorch 编译与 MLSysBook 两卷；高级工程尚未执行|

## 递归先修与范围取舍

`site/catalog.json` 是 45 节点 DAG 的数据源，本轮由初版 24 节点扩展至 45 节点、41 项来源；构建校验循环、未知引用与来源字段。平台地图逐项显示前置，点击后查看原资源与验收要求。

核心必修包含必要数学、算法、系统与工程基础。GPU 深度优化、分布式训练、推理服务和分布式容错目前按方向必修管理；编译器深度内容为可选研究，未来可能随共同能力需求调整。形式语言、硬件电路设计、完整高阶纯数学课程不自动纳入必修；若证明它们是某项能力的实际前置，则加入对应分支。

起点递归到基本电脑文件操作和四则运算。[CS50 Python](https://cs50.harvard.edu/python/) 明确面向有无经验者；[OpenStax 前代数入口](https://openstax.org/books/prealgebra-2e/pages/1-introduction) 作为数学起点，后续以 [Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites) 选读函数、指数和对数。只提供链接，保留原始条款；选章衔接仍需学习者试用。

[MIT 18.06](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)、[18.01SC](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) 与 [6.042J](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) 只按实际依赖选章。[Composing Programs 第三版](https://composingprograms.com/3ed/) 仍有章节待补；不把它当完整算法课程。[D2L 中文版](https://zh.d2l.ai/) 用作模型基础主资源候选，[Missing Semester 中文社区译文](https://missing-semester-cn.github.io/) 作为辅助，译文未逐句审校，不称为官方译文。

## 覆盖与缺口审计

|领域|当前覆盖|缺口与下一项动作|优先级|
|---|---|---|---|
|零基础电脑与 Python|已有入口和一条本地补充检查流程|新手实际试用，检查文件/终端说明是否足够|P0|
|算术、代数与函数|前代数与代数教材、选读范围和步骤已加入|验证起点诊断与选章衔接，避免跳过函数理解|P0|
|线性代数/微积分/概率|新增 18.02SC、Stat 110 和 OpenIntro|选章深度与有限差分/统计实验的独立学习效果待试用|P0|
|算法、C/组织、网络|新增 6.006、Beej C、CS61C、CS106L、CS144|综合项目工具链、作业授权与校外评测仍待逐项复现|P0|
|系统与框架项目|AOSA 对象运行时四阶段 28 项原测试已复现|DBDB 21、共识 46 项功能测试和 micrograd 11 项检查已通过；完整 OS/张量原课作业仍见深化计划|P0|
|GPU/训练/推理|官方入口与课程需求|已完成单卡四项检查与 Windows 版本锁；多卡、模型许可和原生内核工具链仍待验证|P1|
|可靠性与安全|新增 Google SRE，已有 Kubernetes 原始文档|故障注入、可观测性、供应链与恢复的本地项目仍需验证|P1|
|数据治理|补齐数据、评估、实验版本、生命周期与隐私任务|实际管线、分布变化和访问控制工程验证|P1|
|编译器/异构/边缘|MLIR、Triton、PyTorch 编译及 MLSysBook 分支；补齐加速器、边缘和多模态任务|高级工具链与实际设备尚未执行，不能标为复现|P2|
|通信/存储/调度/能耗|NCCL、分层存储、Kubernetes、Ray、成本与能耗任务，明确依赖与产物|多卡、多节点与测量设备未安装，执行记录保持开放|P1|
|中文友好|中文步骤、原创术语表和部分中文资源|全文译文人审与真实新手试用未完成；未制作机器译文|P1|
|岗位交叉验证|抽样了 NVIDIA 推理与基础设施岗位|样本不足以代表完整就业市场；后续扩展训练、数据、安全和不同企业|P1|

不能因访问过资源入口就称课程已被验证。本地测试分别证明平台行为、补充检查器与固定版本原项目能运行，不证明高级课程教学效果。

## 0.2 来源补齐与选择依据

|原始来源|采用理由与边界|
|---|---|
|[MIT 6.006](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)|原始课程提供算法分析与实现材料；将 Python 和离散数学列为前置，不用程序入门课代替算法课|
|[Beej C](https://beej.us/guide/bgc/html/split/)、[CS61C](https://cs61c.org/fa26/)|分别承担 C 指针/内存入门与计算机组织；C++ 补充由 [CS106L](https://web.stanford.edu/class/cs106l/) 承担，避免初学时同时塞入多门语言|
|[Stanford CS144](https://cs144.github.io/)|网络协议与实际 checkpoint 相连；尚未集成 C++ 工具链和原评测|
|[MIT 18.02SC](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)|补齐偏导、梯度、链式法则所需的多变量基础；不要求全课内容都先修完|
|[Harvard Stat 110](https://stat110.hsites.harvard.edu/)、[OpenIntro Statistics](https://www.openintro.org/book/os/)|区分概率基础和统计推断，支持后续实验评价；当前学习图相应增加微积分先修|
|[Google SRE](https://sre.google/sre-book/table-of-contents/)|增加 SLO、监控、容量与可靠性的一手工程来源；阅读本身不能替代故障恢复实验|
|[MLIR Toy](https://mlir.llvm.org/docs/Tutorials/Toy/)|编译器专业分支有明确逐步项目入口；暂不变成所有人的核心必修|
|[AOSA 对象模型](https://aosabook.org/en/500L/a-simple-object-model.html)|小型但包含真实状态、派发与存储取舍，MIT 代码许可明确，CPU 可运行，原测试可复用；因此优先完成集成|

补齐保留了每节点一个主资源和少量辅助来源。来源中的研究日期、依据、局限和复用方式均可在 catalog 中追溯，未制造权威性的数字排名。

## 岗位抽样交叉检查

只把实际岗位作为能力模型的补充证据，不能当成完整市场调查。2026-10-08 的 NVIDIA 官方招聘样本包括 [Dynamo/Triton Inference Server](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/System-Software-Engineer--Dynamo-Triton-Inference-Server---New-College-Grad-2026_JR2020767)、[AI Inference](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-Software-Engineer---AI-Inference_JR2016392) 与 [DevOps and Infrastructure Automation](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-System-Software-Engineer---DevOps-and-Infrastructure-Automation_JR2018919)。其 C++/Python、推理系统、通信与系统运行需求支持当前程序、网络、性能和可靠性主线。职位会关闭或变更，应记录查看日期，不永久引用为现行招聘要求。

这一采样偏向一家公司的推理和平台方向，训练、数据基础设施、安全及非 GPU 生态仍不足。因此维持开放能力模型，并把“岗位证据不足”保留为研究项。

## 资源筛选与持续审查

每项资源记录权威性、准确性、深度、工程价值、覆盖、教学质量、难度、语言、访问、维护、许可和稳定性。当前是定性桌面评估，未制造量化质量分数。每个知识节点首个资源是暂定主资源，后续只是有理由的补充。发现主课缺口时直接标记，不用堆积链接掩盖。

维护者每季度开展一次能力覆盖审计，每月按需检查链接；新技术或错误证据出现时立即复核受影响依赖。审查记录必须包括日期、证据、改变或保留的判断、许可及兼容性影响、验收方式和负责人。自动链接健康不能替代教学和科学准确性审查。不自动创建定时任务；具体维护排期由维护者决定。

## GitHub 只读检查

[账号公开主页](https://github.com/Yuze-Li2026) 初次研究时显示 3 个仓库，原公开项目包括 `fft-notes`、`linear-algebra-map`、`stat-learning-numpy`。2026-10-09 所有者批准公开发布；经认证核对目标仓库不存在后创建 [ai-infra-lab](https://github.com/Yuze-Li2026/ai-infra-lab)，完整历史哈希核对一致。没有修改其他仓库；不声称公开主页能证明私有项目的情况。

## 0.4.0 覆盖与验收更新

本轮由 24 节点扩展到 45 节点、41 项来源，完整领域对应见[覆盖矩阵](coverage.md)，方向组合见[学习路径](learning-paths.md)。每个新增任务都有先修、原始资源、步骤和独立成果要求；高级工程的实际运行状态仍保持开放。

阶段作品验收核对提交模式、当前版本及全部 `requiredChecks` 名称与最少测试数。旧备份仍兼容，但没有检查范围的旧摘要需重新导入原报告。运行实验禁止 `-O` 或 `PYTHONOPTIMIZE`，以免原测试断言被移除。维护时同步更新目录、选章说明与覆盖矩阵，并执行 `npm run check`。本轮发现、逐文件范围与复验见[审查记录](file-audit.md)。
