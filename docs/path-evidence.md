# 学习路径的依据与覆盖复核

核对日期：2026-10-09。这里把外部依据、本平台的连接方式和可验证产物放在一起，便于读者自行检查。不是由课程名称、资源数量或本项目的“完整”表述证明覆盖充分。

## 三条原作者路径交叉检查

- [CMU Deep Learning Systems](https://dlsyscourse.org/)（2026 秋）：框架实现连接数学、Python/C++、系统编程和 GPU 后端。它支持本站先补齐基础，再进入自动微分和后端的先修设计。标量 micrograd 只是其中一段，完整张量实现仍需要原课作业。
- [Stanford CS336](https://cs336.stanford.edu/)（2026 春）：把语言模型实现、系统优化、规模规律、数据和训练后处理连成工程路径。它支持将数据、数值、硬件和评估一起验收，不能只测一个矩阵乘法。
- Vijay Janapa Reddi 主编的 [MLSysBook 基础卷](https://mlsysbook.ai/vol1/)与[规模卷](https://mlsysbook.ai/vol2/)，以及作者的[基础教学大纲](https://mlsysbook.ai/instructors/foundations-syllabus.html)和[规模教学大纲](https://mlsysbook.ai/instructors/scale-syllabus.html)：用于复核单机工程与规模化运行的衔接；需要持续审查压缩、边缘、治理和成本等分支。

这些路径的受众已经具备一定编程或数学基础；本站从文件、算术、程序起点递归补齐，而不是让绝对新手直接进入研究生作业。先修关系和按方向选章是本站的设计判断，可被实际学习结果修订。

## 从依据到学习任务

|能力范围|本站节点与精选入口|需要保存的能力证据|
|---|---|---|
|零基础与程序|computer、python；CS50 Python|独立程序、边界输入、错误定位与 README；最终项目不能由 Indoor Voice 代替|
|工具与复现|tools；Missing Semester|终端命令、Git 历史、实际版本和恢复记录|
|数学起点|arithmetic、algebra；OpenStax|单位、比例、函数和指数的手算与解释|
|计算数学|discrete、linear、calculus、probability；MIT OCW、Stat 110、OpenIntro|证明、矩阵/梯度推导、有限差分和统计推断|
|抽象与算法|programming、algorithms；Composing Programs、MIT 6.006|数据结构、复杂度、边界测试和对象模型设计|
|计算机与系统|architecture、os；Beej C、CS61C、OSTEP|内存与并发不变量、原项目测试、失败恢复|
|网络与持久性|network；CS144、DBDB|协议与 I/O 解释、重启后读取、失败路径与锁的限制|
|模型与数值|ml、numerics；D2L、DLSys|梯度、稳定性、训练质量、重复测量协议|
|框架|framework；DLSys、micrograd|计算图、独立自动微分、数值对照，再进入完整张量后端|
|数据工程|data；CS336、MLSysBook|来源和许可、切分与泄漏检查、加载吞吐、可复现训练|
|GPU 与分布式|gpu、dist、training；CUDA、6.5840、PyTorch Distributed|正确性、通信与同步计时、故障注入和检查点恢复|
|服务与运行|inference、operations；vLLM、SRE、Kubernetes|质量基线、延迟/吞吐、SLO、权限和回滚|
|编译器方向|compiler；MLIR Toy|IR、语义等价、编译条件和优化前后测量|

所有 24 个节点的主资源、精读范围、诊断题和提交要求见[选章与复核任务](curriculum.md)。具体 URL、作者、版本、许可、12 维选择依据保存在资源目录，并可从[来源与致谢](../CREDITS.md)核对。

## 原项目与本地证据的关系

对象模型、DBDB、共识和 micrograd 保留固定上游提交、作者和许可；运行器检验原始文件哈希。参考代码测试通过证明适配和环境可复现。学习者应使用独立提交模式，保留设计、真实代码和测试报告，再进行解释与评审。GPU 四项检查是补充集成验证，不替代原课内核或多卡实验。

当前真实运行结果见[验证记录](verification.md)，原课进一步实施要求见[高级实验](advanced-labs.md)。相同“通过”字样可能来自不同测量：平台自动测试、参考复现、独立作品检查与人工评审必须分别记录。

## 怎样继续检查“完整”

每次审查执行四个步骤：从官方课程/系统新增能力提取需求；追溯先修；与现有节点和产物对照；为缺口安排可验证动作。新来源不是自动必修，需要说明真实依赖和教学收益。

目前完整原课 OS/张量/语言模型作业、多卡、生产推理、异构与边缘、调度、压缩、安全治理、能耗与成本的实际工程验证仍有缺口，均保持开放状态。真实新手试用和长期成效也尚未被证明。后续验证可以使路径更完整，不能通过修改状态文字抹去这些问题。

维护者按照[研究覆盖审计](research.md)更新证据、优先级和版本；界面的依据与取舍见[产品架构](architecture.md)。
