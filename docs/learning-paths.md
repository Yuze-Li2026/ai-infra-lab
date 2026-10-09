# 按工程方向选择学习路线

先建立共同基础，再选择工作方向；不要求为了开始学习先完成所有高级课。路线顺序服从知识地图的实际先修，遇到困难回到对应前置任务。完成时间不作为验收标准。

## 零基础共同起点

文件与运行、算术、Python 可以分别起步 → 函数/抽象/测试和终端/Git → 代数/离散/线代/微积分/概率 → 算法、C/机器组织 → OS、网络、存储、Linux → 数值、机器学习、框架 → 模型、数据、评估、实验产物 → 运行可靠性、部署生命周期和隐私。

主资源分别是 CS50、OpenStax、Composing Programs、Missing Semester、MIT 数学/算法、CS61C、OSTEP、CS144、D2L 与 DLSys。每个具体节点的选章和作品见[选章指南](curriculum.md)。有基础者以可复现项目、推导和反例接受复核；不只凭经验年限跳过。

## 训练与大模型系统

重点顺序：模型结构 → GPU/加速器 → profiler → 分布式/collective → 并行训练/显存 → scaling 与后训练 → 调度/恢复 → 综合系统设计。

以 [CS336](https://cs336.stanford.edu/) 原始 A1–A5 为工程主线：A1 tokenizer/model/optimizer，A2 attention 内核与分布式，A3 规模规律，A4 数据，A5 SFT/推理 RL，按实际目标串联。辅以 [PyTorch 2.10](https://docs.pytorch.org/docs/2.10/distributed.html)、[FSDP](https://docs.pytorch.org/docs/2.10/fsdp.html)与 [NCCL](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)查语义。遵守原课 AI 与答案公开政策，独立完成，不能由 AI 代写原作业冒充学习。

作品包需要 loss/梯度基线、内存分项、通信轨迹、扩展效率、数据/奖励版本、检查点恢复和预算。单卡预算可先做；多卡结果只能在多卡环境实际运行后记为已验证。先确定数据/显存/费用范围，再另行授权大型下载或付费算力。

## 推理与服务系统

重点顺序：模型与数据/评估 → GPU 和性能 → 低精度 → 推理调度/KV cache → 检索/索引 → 模型生命周期 → 调度、权限、SRE 与成本。

使用 [vLLM 官方文档](https://docs.vllm.ai/en/latest/)作为系统参考，与 CS336 和 MLSysBook 的原理对照。先做许可明确的小模型/小数据基线，再比较批处理、prefill/decode、量化、缓存和路由。评价必须同时含输出质量、TTFT、逐 token 延迟、吞吐、p95/p99、失败率与显存；负载中固定请求长度和并发分布。

综合项目至少完成加载与请求契约、错误/取消/超时、容量计划、灰度和回滚；检索方向另验召回率、更新一致性、权限与证据来源。本平台尚未实测 vLLM 生产服务，入口可读不等于工具链可运行。

## 平台、集群与可靠性

重点顺序：Linux/网络/存储 → 分布式容错 → 日志/指标/SLO → 容器与集群 → 调度/队列/配额/拓扑 → 安全和供应链 → 容量/成本 → 端到端设计。

主参考 [Kubernetes 概念](https://kubernetes.io/docs/concepts/overview/)和[调度/驱逐](https://kubernetes.io/docs/concepts/scheduling-eviction/)、[Ray 集群概念](https://docs.ray.io/en/latest/cluster/key-concepts.html)、[Google SRE](https://sre.google/sre-book/table-of-contents/)与 MLSysBook 规模卷。集群实验需要已有隔离环境；默认不在宿主机安装所有组件。

作品包含资源/租户矩阵、任务状态、排队与抢占、节点失效、告警、运行手册与恢复演练。按本地可用环境逐项实测，模拟、单节点和跨机结果分别记录；只写 YAML 不等于能运行可靠集群。

## 数据与模型生命周期

重点顺序：索引/存储和网络 → 数据来源/许可/切分 → 管线、缓存、预取、流批一致性 → 评估/漂移 → 实验与产物谱系 → 注册/部署/回滚 → 权限与删除。

主参考 CS336 A4、[MLSysBook Data Storage](https://mlsysbook.ai/vol2/data_storage/data_storage.html)、[MLflow](https://mlflow.org/docs/latest/ml/)和 SRE。作品要追踪原始数据到模型的版本，复核数据泄漏、失败重试、重复处理与访问边界；测管线端到端吞吐及 GPU 等待，不只比较文件读取速度。模型、训练状态、配置与随机状态一起恢复。

## 内核、框架与编译器

重点顺序：C/C++/内存/算法 → 数值与自动微分 → 张量布局和后端 → GPU → Triton → profiler → IR/图捕获/lowering/动态形状。

框架使用 [DLSys](https://dlsyscourse.org/) HW0–HW4；内核使用 [Triton 官方教程](https://triton-lang.org/main/getting-started/tutorials/index.html)并对照 CUDA；编译器使用 [MLIR Toy](https://mlir.llvm.org/docs/Tutorials/Toy/)与 [torch.compile 教程](https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html)。先明确接口、数值和语义不变量，之后优化。原课 CPU 与 GPU 作业分别验收。

作品需有广播/shape/layout/梯度边界、CPU oracle、IR 变化、编译成本和端到端测量。不同 shape、dtype、设备、非连续张量与失败回退都要解释；低精度质量与编译速度不能省略。

## 边缘、异构与多模态

在模型、数据、数值和 GPU 基础之上按需求深入。参考 [MLSysBook Edge Intelligence](https://mlsysbook.ai/vol2/edge_intelligence/edge_intelligence.html)、D2L 原模型和 CS336 多模态主题，学习导出/runtime 兼容、视觉/音频预处理、动态形状、稀疏访问与受限设备运行。

设备方向验模型输出、冷启动、内存、热降频、功率/实时预算、离线行为和可回滚更新；多模态方向验数据对齐、解码/预处理、padding 与 batching。设备尚未可用时可完成预算与模拟，但保留实际验证缺口。

## 完成一个方向的标准

共同知识说明 + 独立设计/代码 + 原作者允许的测试 + 自选边界与故障 + 质量/性能/资源报告 + 恢复与原理解释，最终由他人复核。平台五个阶段的“材料齐备”只对应当前规定材料；完成小型本地链不能自动升级为任一方向的高级能力认证。

覆盖依据见[能力矩阵](coverage.md)，完整原课实施条件见[高级实验](advanced-labs.md)。
