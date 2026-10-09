# AI Infra 能力覆盖与证据

审查日期：2026-10-09。本版包含 45 个模块、198 项选读任务和 65 个原始来源。[逐项知识清单](knowledge-index.md)为每项记录原文、章节、复核产物和实践环境。完整性用“能力 → 先修 → 原始资料 → 独立作品 → 测试与解释”检查，不能由数量证明。本表是一份可以被修订的覆盖基线，不声称任何一次审查能永久穷尽 AI Infra。

## 复核依据

课程主线采用 [DLSys](https://dlsyscourse.org/) 的框架工程作业、[CS336](https://cs336.stanford.edu/) 的模型/系统/规模/数据/后训练作业，与 [MLSysBook 单机卷](https://mlsysbook.ai/vol1/)和[规模卷](https://mlsysbook.ai/vol2/)的工程生命周期交叉检查。CS336 与 DLSys 都要求编程、数学和系统先修，因此大学作业是进阶入口，零基础桥梁不能省略。

关键系统机制另对照 [PyTorch 2.10 分布式 API](https://docs.pytorch.org/docs/2.10/distributed.html)、[FSDP](https://docs.pytorch.org/docs/2.10/fsdp.html)、[NCCL](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)、[CUDA](https://docs.nvidia.com/cuda/cuda-programming-guide/)、[Triton 教程](https://triton-lang.org/main/getting-started/tutorials/index.html)、[vLLM](https://docs.vllm.ai/en/latest/)、[Kubernetes](https://kubernetes.io/docs/concepts/overview/)与 [SRE](https://sre.google/sre-book/table-of-contents/)。框架 API、硬件、集群运行和可靠性相互约束，不能只读一种来源。

基础另由 MIT 数学/算法、CS61C、CS144、OSTEP、CS50 与作者自学路线交叉复核，见[路径证据](path-evidence.md)。所有取舍是本站基于依赖的判断；来源许可、具体版本、12 维评估和本轮访问证据保留在目录与 [Credits](../CREDITS.md)。新版官方滚动教程可能超出现有 PyTorch 2.10 环境；阅读入口更新不意味着自动升级实验依赖。

## 覆盖矩阵

节点 ID 与网页知识任务一一对应；精读范围、先修、实践与成果逐项见[选章指南](curriculum.md)。不同方向需要不同深度，核心、方向必修和可选深入已经在知识地图标注。

| 真实能力范围 | 对应节点 | 主要一手依据 | 必须复核的产物 |
| --- | --- | --- | --- |
| 绝对零基础：文件、运行、单位、输入输出 | `computer`、`arithmetic`、`python` | CS50、OpenStax | 运行记录、单位计算、独立程序与边界输入 |
| 抽象、语言、版本和工程交付 | `programming`、`tools`、`engineering` | Composing Programs、Missing Semester、CS50 | 模块接口、测试、Git 历史、依赖锁、空目录重建 |
| 必要数学：函数、证明、线性代数、微积分、概率统计 | `algebra`、`discrete`、`linear`、`calculus`、`probability` | MIT OCW、Stat110、OpenIntro | 手算与证明、梯度复核、抽样和统计不确定性 |
| 算法、系统语言与机器组织 | `algorithms`、`architecture` | MIT 6.006、Beej C、CS61C、CS106L | 复杂度、内存图、越界诊断、缓存成本 |
| 进程、并发、虚拟内存与隔离 | `os`、`linux` | OSTEP、Docker、Linux cgroup v2、Kubernetes | 竞态与锁不变量、权限、OOM、资源释放 |
| 网络、数据库与存储路径 | `network`、`storage` | CS144、DBDB、MLSysBook Data Storage | 可靠传输、索引/提交、读写预算、失败与恢复 |
| 数值、优化与基本学习机制 | `numerics`、`ml` | D2L、DLSys、CS61C | 误差容差、损失与梯度、泛化与稳定性 |
| 张量运行时和模型计算 | `framework`、`models` | DLSys、D2L、CS336 A1 | shape/广播/layout、自动微分、算子、模型与 tokenizer |
| 数据与实验基础设施 | `data`、`experiments` | CS336 A4、Arrow、Kafka、Spark、Feast、MLflow | 来源/许可、去重、切分、批流读取、特征时间一致性、随机状态、模型产物与谱系 |
| 评估、漂移与鲁棒性 | `evaluation` | CS336、OpenIntro、MLSysBook | 污染检查、置信区间、失败分组、质量门槛 |
| 硬件与 GPU 编程 | `accelerators`、`gpu` | CUDA、Triton、CS336、MLSysBook | 执行/内存模型、硬件路径、内核正确性与预算 |
| 性能工程与低精度 | `profiling`、`precision` | PyTorch Profiler、vLLM quantization、MLSysBook | 时间线、roofline、传输与同步、校准、质量/显存/端到端性能 |
| 分布式正确性与通信 | `dist`、`collectives` | MIT 6.5840、AOSA、PyTorch、NCCL | 故障语义、多数派、collective 输出、拓扑与通信曲线 |
| 训练并行与显存优化 | `training`、`memory` | PyTorch/FSDP、Megatron Core、TorchRec、JAX、CS336 A2 | DP/TP/PP/CP/EP、稀疏分片、重计算、累积、offload、梯度与恢复等价 |
| 训练预算与后训练系统 | `scaling`、`posttraining` | CS336 A3/A5、MLSysBook | 规模曲线、不确定性、rollout/learner 数据版本、奖励与评估 |
| 推理与检索基础设施 | `inference`、`retrieval` | vLLM、SGLang、Faiss、RAG 原论文、CS336 | prefill/decode、KV cache、批处理、TTFT/TPOT、ANN 召回、更新与权限 |
| 部署、集群与生产生命周期 | `orchestration`、`lifecycle` | Kubernetes、Ray、Kueue、Slurm、Feast、MLflow、SRE | 队列/拓扑/配额、模型与特征契约、灰度、漂移、回滚与产物版本 |
| 可靠性、安全、成本与责任 | `operations`、`privacy`、`sustainability` | SRE、OpenTelemetry、Prometheus、DCGM、Kubernetes Security、MLSysBook | SLI/SLO、告警/恢复、威胁/权限模型、隐私、有效成本与能耗边界 |
| 编译器与其他设备/工作负载 | `compiler`、`edge`、`multimodal` | MLIR、OpenXLA、torch.compile、ExecuTorch、ONNX Runtime、D2L、CS336 | IR/lowering、动态形状、语义等价、设备兼容、视觉/音频/稀疏工作负载 |
| 端到端设计与综合判断 | `system-design` | MLSysBook、SRE、CS336 | 需求、容量、拓扑、质量、安全、成本、故障演练和独立评审 |

这张表覆盖训练、推理、平台、数据、编译器与设备等主要分支，而不是把“AI Infra”缩成 LLM 推理或一块 GPU。全栈深度不能由一个小项目证明；按[方向路线](learning-paths.md)选择深入任务。

## 原课到工程的验证梯度

| 层次 | 目前可验证的状态 | 怎样继续深化 |
| --- | --- | --- |
| 基础知识 | 有原资源、精读范围、依赖、成果要求 | 完成原作者习题并由同伴检查推导与解释 |
| 小型本地链 | 入门检查、四阶段对象模型、DBDB、micrograd、共识与单卡补充检查可运行 | 独立实现、原测试、额外边界、性能测量与解释 |
| 完整大学项目 | CS50 Final Project、OSTEP、DLSys、CS336、6.5840 的入口与条件明确 | 按当前原题和政策实施；固定提交、环境与测试；未执行就保留未执行 |
| 方向工程 | 新增机制均有先修、官方读法和产物要求 | 在合适环境做真实调度、服务、低精度、编译器或多卡实验 |
| 生产与教学成效 | 未由本机测试证明 | 长期运行、规模/故障/权限复核，以及真实新手试学与独立评审 |

单卡的四项检查不验证多卡、NCCL、真实服务或自写内核；共识模拟不验证真实网络和磁盘崩溃；micrograd 不验证张量后端；DBDB 不验证工业事务或断电耐久性。完整高级实施清单见[高级原课实验](advanced-labs.md)。

## 开放问题与维护动作

当前学习范围与任务已经细化；多卡、真实集群/推理、异构设备和全部大学作业的实际验证仍开放。调度、隐私、成本、边缘与压缩已经有节点与官方依据，不能再笼统写成“完全未覆盖”，也不能把新增节点当成“工程已完成”。真实用户教学衔接和岗位采样广度仍需继续验证。

每季度从新课程目录、系统版本、论文和实际工程问题反推新增能力；检查其先修和产物，再决定是独立节点、补充资源还是无关扩展。维护者运行 `npm run check` 防止节点在矩阵/选章指南中消失，另进行来源、链接、课程政策和实验兼容复核。结构检查只能证明覆盖表与实现一致，不能证明知识已经穷尽。
