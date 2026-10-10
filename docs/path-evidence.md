# 学习路径的依据与覆盖复核

核对日期：2026-10-09。这里把外部依据、本平台的连接方式和可验证产物放在一起，便于读者自行检查。不是由课程名称、资源数量或本项目的“完整”表述证明覆盖充分。

## 三条原作者路径交叉检查

- [CMU Deep Learning Systems](https://dlsyscourse.org/)（2026 秋）：框架实现连接数学、Python/C++、系统编程和 GPU 后端。它支持本站先补齐基础，再进入自动微分和后端的先修设计。标量 micrograd 只是其中一段，完整张量实现仍需要原课作业。
- [Stanford CS336](https://cs336.stanford.edu/)（2026 春）：把语言模型实现、系统优化、规模规律、数据和训练后处理连成工程路径。它支持将数据、数值、硬件和评估一起验收，不能只测一个矩阵乘法。
- Vijay Janapa Reddi 主编的 [MLSysBook 基础卷](https://mlsysbook.ai/vol1/)与[规模卷](https://mlsysbook.ai/vol2/)，以及作者的[基础教学大纲](https://mlsysbook.ai/instructors/foundations-syllabus.html)和[规模教学大纲](https://mlsysbook.ai/instructors/scale-syllabus.html)：用于复核单机工程与规模化运行的衔接；需要持续审查压缩、边缘、治理和成本等分支。

这些路径的受众已经具备一定编程或数学基础；本站从文件、算术、程序起点递归补齐，而不是让绝对新手直接进入研究生作业。先修关系和按方向选章是本站的设计判断，可被实际学习结果修订。

## 资深作者的自学路径

[Andrej Karpathy 的 Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) 从 micrograd 反向传播逐步进入语言模型、张量、网络诊断、GPT 与 tokenizer；作者明确要求 Python 和基础数学。因此本站在 micrograd 前安排程序、梯度与数值基础。可以按作者课程继续学习，但观看视频或复刻演示不能替代独立作品验收，也不能证明已掌握部署与分布式系统。

[Teach Yourself Computer Science](https://teachyourselfcs.com/) 的作者指南强调程序、计算机组织、算法、数学、系统、网络、数据库、语言/编译器和分布式等基础，并说明面向已有编程能力的自学者。它支持保留本站系统基础，而不能替代 AI Infra 的 GPU、训练、推理和数据要求。本站参考其先修理由，按当前原课选章；不把历史课程版本视为永久正确。

两条路径用于交叉复核和补充阅读，保留作者原文入口，没有复制课程正文或翻译为官方教材。主要学习资源仍以本站目录的逐项评估与明确成果要求为准。

## 从依据到学习任务

| 能力范围 | 本站节点与精选入口 | 需要保存的能力证据 |
| --- | --- | --- |
| 零基础与程序 | computer、python；CS50 Python | 独立程序、边界输入、错误定位与 README；最终项目不能由 Indoor Voice 代替 |
| 工具与复现 | tools；Missing Semester | 终端命令、Git 历史、实际版本和恢复记录 |
| 数学起点 | arithmetic、algebra；OpenStax | 单位、比例、函数和指数的手算与解释 |
| 计算数学 | discrete、linear、calculus、probability；MIT OCW、Stat 110、OpenIntro | 证明、矩阵/梯度推导、有限差分和统计推断 |
| 抽象与算法 | programming、algorithms；Composing Programs、MIT 6.006 | 数据结构、复杂度、边界测试和对象模型设计 |
| 计算机与系统 | architecture、os；Beej C、CS61C、OSTEP | 内存与并发不变量、原项目测试、失败恢复 |
| 网络与持久性 | network；CS144、DBDB | 协议与 I/O 解释、重启后读取、失败路径与锁的限制 |
| 模型与数值 | ml、numerics；D2L、DLSys | 梯度、稳定性、训练质量、重复测量协议 |
| 框架 | framework；DLSys、micrograd | 计算图、独立自动微分、数值对照，再进入完整张量后端 |
| 数据工程 | data；CS336、MLSysBook | 来源和许可、切分与泄漏检查、加载吞吐、可复现训练 |
| GPU 与分布式 | gpu、dist、training；CUDA、6.5840、PyTorch Distributed | 正确性、通信与同步计时、故障注入和检查点恢复 |
| 服务与运行 | inference、operations；vLLM、SRE、Kubernetes | 质量基线、延迟/吞吐、SLO、权限和回滚 |
| 编译器方向 | compiler；MLIR Toy | IR、语义等价、编译条件和优化前后测量 |

上表保留最初 24 节点的基础路径对照。本轮扩展到 45 个节点，完整逐项对应见[覆盖矩阵](coverage.md)，按方向组合见[学习路径](learning-paths.md)。全部节点的主资源、精读范围、诊断题和提交要求见[选章与复核任务](curriculum.md)。具体 URL、作者、版本、许可、12 维选择依据保存在资源目录，并可从[来源与致谢](../CREDITS.md)核对。

## 原项目与本地证据的关系

对象模型、DBDB、共识和 micrograd 保留固定上游提交、作者和许可；运行器检验原始文件哈希。参考代码测试通过证明适配和环境可复现。学习者应使用独立提交模式，保留设计、真实代码和测试报告，再进行解释与评审。GPU 补充集成验证分为四类、共七个案例，不替代原课内核或多卡实验。

当前真实运行结果见[验证记录](verification.md)，原课进一步实施要求见[高级实验](advanced-labs.md)。相同“通过”字样可能来自不同测量：平台自动测试、参考复现、独立作品检查与人工评审必须分别记录。

## 怎样继续检查“完整”

每次审查执行四个步骤：从官方课程/系统新增能力提取需求；追溯先修；与现有节点和产物对照；为缺口安排可验证动作。新来源不是自动必修，需要说明真实依赖和教学收益。

目前完整原课 OS/张量/语言模型作业、多卡、生产推理、异构与边缘、调度、压缩、安全治理、能耗与成本的实际工程验证仍有缺口，均保持开放状态。真实新手试用和长期成效也尚未被证明。后续验证可以使路径更完整，不能通过修改状态文字抹去这些问题。

维护者按照[研究覆盖审计](research.md)更新证据、优先级和版本；界面的依据与取舍见[产品架构](architecture.md)。
