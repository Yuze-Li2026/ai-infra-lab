# 选章、练习与复核任务

这是权威来源的中文使用指南，不是替代教材的新课程。主资源优先，补充资源按需；完成时间不作为能力标准。具体章节随原课版本更新，以原始目录为准。这里的诊断问题由本站组织，用来检查先修与复核作品，不冒充原课程评分。

## 如何使用

先打开知识节点的主资源，在下列精读范围中找到对应章节，完成原作者的例题与获准公开的练习。卡住时只回到对应前置节点，不要求先读完所有教材。已有基础者用代码、推导和失败案例接受复核后可跳过。每个阶段同时保留 Learn → Design → Build → Test → Optimize → Explain 产物。

专业分支按实际目标选择；高阶 GPU、多卡、推理与编译器不是零基础第一步。完整原课实验条件见[高级原课实验](advanced-labs.md)。

本页说明模块目标；[逐项知识与原始资料](knowledge-index.md)进一步列出 198 项具体选读、章节定位、复核任务与实践环境。两者共同使用，不能只读一个资源首页就算覆盖整个模块。

## 起点 · 电脑与第一行代码

从文件、数字和函数开始

### 认识文件与运行程序

类别：核心必修。前置：无，直接开始。

精读范围：文件操作与原课环境起步

主资源：[CS50 Python](https://cs50.harvard.edu/python/)。

诊断与复核：独立创建文件、找到完整路径、运行并解释输入与输出；区分编辑与执行。

成果标准：截图与运行步骤；说明文件路径与程序输出的区别

### 数字、比例与算术

类别：核心必修。前置：无，直接开始。

精读范围：四则运算、分数、小数、比例

主资源：[Prealgebra 2e](https://openstax.org/books/prealgebra-2e/pages/1-introduction)。

诊断与复核：不用背结论，计算比例、单位换算和百分比变化，解释内存容量与耗时的数量级。

成果标准：独立计算吞吐量、容量单位与百分比，并解释步骤

### 第一段 Python 程序

类别：核心必修。前置：认识文件与运行程序。

精读范围：CS50 Python 第 0 周及原始 Problem Set 0

主资源：[CS50 Python](https://cs50.harvard.edu/python/)。

诊断与复核：编写有输入输出、分支、循环、函数与异常处理的程序，说明每个测试覆盖了什么。

成果标准：通过本地 Indoor Voice 检查，提交代码并解释 lower() 的行为

## 基础 · 数学与程序设计

建立推理和实现能力

### 终端、Git 与可复现环境

类别：核心必修。前置：认识文件与运行程序、第一段 Python 程序。

精读范围：shell、版本控制、调试相关讲次

主资源：[The Missing Semester](https://missing.csail.mit.edu/)。

补充：[计算机教育中缺失的一课](https://missing-semester-cn.github.io/)。

诊断与复核：从一次错误修改恢复文件，重建独立环境，说明 Git 提交与学习备份的不同用途。

成果标准：提交 Git 历史、一次错误定位记录与可复现 README

### 代数、函数与指数

类别：核心必修。前置：数字、比例与算术。

精读范围：先修复习、方程、函数、指数/对数与必要三角基础

主资源：[Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites)。

补充：[Prealgebra 2e](https://openstax.org/books/prealgebra-2e/pages/1-introduction)。

诊断与复核：画函数并解释参数变化，解一元方程，说明指数与对数为什么能互换。

成果标准：推导一个内存容量公式，画函数图并解释指数增长

### 抽象、递归与测试

类别：核心必修。前置：第一段 Python 程序。

精读范围：Composing Programs 函数/数据部分 + CS50 测试与项目

主资源：[Composing Programs](https://composingprograms.com/3ed/)。

补充：[CS50 Python](https://cs50.harvard.edu/python/)；[A Simple Object Model](https://aosabook.org/en/500L/a-simple-object-model.html)。

诊断与复核：实现递归数据结构和对象接口，用失败测试解释抽象边界。

成果标准：提交 CS50 Final Project 或相当项目，含边界测试与设计解释

### 证明与离散结构

类别：核心必修。前置：代数、函数与指数、抽象、递归与测试。

精读范围：证明、图、递归与组合基础

主资源：[MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)。

诊断与复核：给出归纳证明和反例，解释集合、图与逻辑在依赖图中的作用。

成果标准：为算法写循环不变量与证明；构建并检测一个有向图的环

### 向量、矩阵与线性代数

类别：核心必修。前置：代数、函数与指数。

精读范围：18.06 中矩阵、空间、正交与特征值主题

主资源：[MIT 18.06 线性代数](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)。

诊断与复核：手算小矩阵乘法，检查形状、秩与线性相关，解释投影与特征向量。

成果标准：独立完成选定原课习题并解释矩阵乘法形状

### 导数与梯度

类别：核心必修。前置：代数、函数与指数、向量、矩阵与线性代数。

精读范围：18.01SC 微分基础 → 18.02SC 偏导与优化

主资源：[MIT 18.01SC 微积分](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/)。

补充：[MIT 18.02SC Multivariable Calculus](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)。

诊断与复核：推导复合函数导数，用有限差分复核，说明步长太大或太小的误差。

成果标准：手算链式法则，做有限差分检查并说明误差

### 概率与统计推理

类别：核心必修。前置：代数、函数与指数、证明与离散结构、导数与梯度。

精读范围：Stat110 概率主线 + OpenIntro 抽样与推断选章

主资源：[Harvard Statistics 110](https://stat110.hsites.harvard.edu/)。

补充：[OpenIntro Statistics](https://www.openintro.org/book/os/)；[MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)。

诊断与复核：区分随机变量、期望与方差，用重复采样说明置信区间与单次测量的区别。

成果标准：模拟抽样并报告方差；说明单次 benchmark 为什么不充分

## 系统 · 理解计算机

从内存、并发到网络

### 数据结构与复杂度

类别：核心必修。前置：抽象、递归与测试、证明与离散结构。

精读范围：6.006 数据结构、图算法和动态规划主题

主资源：[MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)。

补充：[Composing Programs](https://composingprograms.com/3ed/)；[DBDB · 持久化键值数据库](https://aosabook.org/en/500L/dbdb-dog-bed-database.html)。

诊断与复核：实现树与哈希结构，分析复杂度，用不同输入顺序找退化情况。

成果标准：实现并测量不同索引方案，解释规模增长与复杂度

### C/C++、内存与计算机组织

类别：核心必修。前置：抽象、递归与测试、终端、Git 与可复现环境、数字、比例与算术。

精读范围：C 语言桥梁 → 计算机组织 → 按需 C++

主资源：[Beej’s Guide to C Programming](https://beej.us/guide/bgc/html/split/)。

补充：[Berkeley CS61C](https://cs61c.org/fa26/)；[Stanford CS106L Standard C++ Programming](https://web.stanford.edu/class/cs106l/)。

诊断与复核：独立编译 C 程序，画内存布局，解释越界、指针生命周期和缓存影响。

成果标准：分析缓存行为，检查越界并解释编译与链接

### 操作系统与并发

类别：核心必修。前置：C/C++、内存与计算机组织、数据结构与复杂度。

精读范围：OSTEP 虚拟化、并发、持久化三部分

主资源：[Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)。

诊断与复核：说明进程、线程与地址空间，设计一个竞争案例并验证锁保护的不变量。

成果标准：提交竞态复现、同步正确性测试和持久化故障分析

### 网络与存储 I/O

类别：核心必修。前置：操作系统与并发。

精读范围：CS144 讲授及按顺序完成的网络检查点

主资源：[Stanford CS144 Computer Networking](https://cs144.github.io/)。

诊断与复核：解释连接、重传与超时，用日志区分服务失败、网络延迟和存储等待。

成果标准：解释一次请求的路径并测量 I/O 与网络瓶颈

## 模型 · 搭建学习系统

张量、梯度与训练框架

### 数值稳定性与性能测量

类别：核心必修。前置：向量、矩阵与线性代数、导数与梯度、概率与统计推理、C/C++、内存与计算机组织。

精读范围：浮点与数值计算；框架课程资源核算

主资源：[动手学深度学习](https://zh.d2l.ai/)。

补充：[Deep Learning Systems](https://dlsyscourse.org/)；[Berkeley CS61C](https://cs61c.org/fa26/)。

诊断与复核：比较精度、容差和误差，设计预热与重复计时，解释为何单次最快值不可靠。

成果标准：比较数值误差和性能分布，报告精度容差与实验条件

### 机器学习与优化基础

类别：核心必修。前置：抽象、递归与测试、向量、矩阵与线性代数、导数与梯度、概率与统计推理。

精读范围：D2L 预备知识、线性模型和优化基础

主资源：[动手学深度学习](https://zh.d2l.ai/)。

诊断与复核：解释目标函数、优化、训练/验证划分和过拟合，保留基线与失败案例。

成果标准：训练并评估基线，解释数据泄漏和过拟合

### 张量、自动微分与框架

类别：核心必修。前置：机器学习与优化基础、数值稳定性与性能测量、操作系统与并发。

精读范围：DLSys HW0–HW4；环境逐阶段核实

主资源：[Deep Learning Systems](https://dlsyscourse.org/)。

补充：[micrograd · 自动微分与训练](https://github.com/karpathy/micrograd)。

诊断与复核：独立实现反向图，复核重复变量梯度，再解释标量引擎与张量后端差别。

成果标准：梯度与参考结果对比；算子、优化器测试与设计文档

### 数据管线与可复现训练

类别：核心必修。前置：机器学习与优化基础、终端、Git 与可复现环境、网络与存储 I/O。

精读范围：CS336 数据与评估主题 + MLSys 系统视角

主资源：[Stanford CS336](https://cs336.stanford.edu/)。

补充：[Machine Learning Systems](https://mlsysbook.ai/)。

诊断与复核：记录来源、许可、变换、种子和切分，避免数据泄漏，测量加载瓶颈。

成果标准：提交数据来源清单、复现记录及加载瓶颈分析

## 工程 · 加速与规模化

GPU、分布式、推理与可靠性

### GPU 内核与性能工程

类别：方向必修。前置：张量、自动微分与框架、C/C++、内存与计算机组织、数值稳定性与性能测量。

精读范围：CUDA 执行/内存模型 + CS336 内核主题

主资源：[CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)。

补充：[Stanford CS336](https://cs336.stanford.edu/)。

诊断与复核：解释线程与内存访问，比较 CPU oracle、同步计时与传输总耗时。

成果标准：正确性容差、参考实现、重复测量与性能分析报告

### 分布式与故障恢复

类别：方向必修。前置：操作系统与并发、网络与存储 I/O、数据结构与复杂度。

精读范围：6.5840 2026 Raft 原实验；固定源码与 Linux 环境见原课工作流程

准备与执行入口见 [MIT Raft 工作流程](project-workflows.md#mit-65840实际-raft-实验)。源码已固定，环境执行与学习者作业通过分别验收。

主资源：[MIT 6.5840 分布式系统](https://pdos.csail.mit.edu/6.5840/)。

补充：[Clustering by Consensus · 故障与共识](https://aosabook.org/en/500L/clustering-by-consensus.html)。

诊断与复核：给出安全性与活性不变量，注入故障并解释日志一致性与恢复轨迹。

成果标准：故障注入、恢复测试与一致性解释

### 分布式训练系统

类别：方向必修。前置：张量、自动微分与框架、数据管线与可复现训练、GPU 内核与性能工程、分布式与故障恢复。

精读范围：PyTorch 通信 API + CS336 并行主题

主资源：[PyTorch Distributed](https://docs.pytorch.org/docs/stable/distributed.html)。

补充：[Stanford CS336](https://cs336.stanford.edu/)。

诊断与复核：解释数据/模型并行、通信、梯度同步与检查点状态，单卡结果不得当成多卡证据。

成果标准：扩展效率、通信剖析、断点恢复和训练结果一致性

### 推理服务与性能

类别：方向必修。前置：张量、自动微分与框架、GPU 内核与性能工程、网络与存储 I/O、数据管线与可复现训练。

精读范围：vLLM 官方部署/性能文档 + CS336 推理主题

主资源：[vLLM](https://docs.vllm.ai/en/latest/)。

补充：[Stanford CS336](https://cs336.stanford.edu/)。

诊断与复核：给出显存预算与负载设计，区分 TTFT、逐 token 延迟和吞吐，复核质量下降。

成果标准：报告 TTFT、逐 token 延迟、吞吐、显存与结果正确性

### 可靠性、安全与可观测性

类别：核心必修。前置：操作系统与并发、网络与存储 I/O、终端、Git 与可复现环境。

精读范围：Google SRE 目标/监控/应急主题 + Kubernetes 安全

主资源：[Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)。

补充：[Kubernetes Security](https://kubernetes.io/docs/concepts/security/)；[Machine Learning Systems](https://mlsysbook.ai/)。

诊断与复核：制定 SLO、权限边界、日志指标、故障定位与回滚，实际演练恢复。

成果标准：故障定位、权限说明、恢复演练与成本记录

### 编译器与算子图优化

类别：可选深入。前置：C/C++、内存与计算机组织、数据结构与复杂度、张量、自动微分与框架。

精读范围：MLIR Toy Tutorial；进阶分支

主资源：[MLIR Toy Tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/)。

补充：[Deep Learning Systems](https://dlsyscourse.org/)。

诊断与复核：展示优化前后 IR，说明语义等价条件和后端性能边界。

成果标准：语义等价测试、编译时间与性能权衡报告

## 阶段作品与复核

起点用原课练习验证输入输出；基础用对象运行时验证抽象；系统用 DBDB 验证数据结构与持久化；模型用 micrograd 验证导数与训练；工程用共识模拟验证故障语义，GPU 补充检查验证单卡环境。数学推导、系统解释与各方向知识不能只由这些项目的测试代替。

平台的“材料齐备”只表示已提交规定节点说明与独立作品通过报告，最终应由同伴检查设计、边界案例、性能协议和解释；未经过独立评审不称能力认证。

## 本轮补齐的学习任务

以下任务由官方目录反推能力与先修，不是复制课程讲义。完整高级环境尚未复现；先保留设计与理论核算，再在适合的环境按原课/官方示例实践。

### 软件工程与可测试交付

类别：核心必修。前置：抽象、递归与测试、终端、Git 与可复现环境。

精读范围：包与模块、接口、类型、异常、构建依赖、测试与 CI。

主资源：[The Missing Semester](https://missing.csail.mit.edu/)。 补充：[CS50 Python](https://cs50.harvard.edu/python/)。

- 理解机制与边界：包与模块、接口、类型、异常、构建依赖、测试与 CI；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：为已有项目划分接口、固定依赖并建立自动检查
- 测试、优化与解释：从空目录重建；测试正常、异常和资源释放；保留一次修复前失败。提交接口说明、依赖锁、CI 日志与重建记录；解释测试覆盖盲点

成果标准：提交接口说明、依赖锁、CI 日志与重建记录；解释测试覆盖盲点。

### 数据库、索引与存储系统

类别：核心必修。前置：数据结构与复杂度、操作系统与并发。

精读范围：索引、事务/日志、锁、持久化、列式与对象存储、缓存和检查点。

主资源：[DBDB · 持久化键值数据库](https://aosabook.org/en/500L/dbdb-dog-bed-database.html)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：索引、事务/日志、锁、持久化、列式与对象存储、缓存和检查点；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：完成 DBDB，再选 MLSysBook Data Storage；比较本地文件、对象与共享存储
- 测试、优化与解释：用固定数据对比顺序/随机读取；故障后核对提交边界和校验和。索引与一致性设计、吞吐/延迟分布、故障恢复记录；区分教学库与工业数据库

成果标准：索引与一致性设计、吞吐/延迟分布、故障恢复记录；区分教学库与工业数据库。

### Linux 与资源隔离

类别：核心必修。前置：操作系统与并发、终端、Git 与可复现环境。

精读范围：进程、权限、信号、文件描述符、namespace、cgroup、容器镜像。

主资源：[Docker 入门与容器基础](https://docs.docker.com/get-started/)。补充：[Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)、[OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)与 [Kubernetes 官方中文概念](https://kubernetes.io/zh-cn/docs/concepts/overview/)。

- 理解机制与边界：进程、权限、信号、文件描述符、namespace、cgroup、容器镜像；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：在已有隔离 Linux 环境检查进程、权限与 CPU/内存限额；先读官方容器概念
- 测试、优化与解释：比较受限与不受限工作负载，解释 OOM、退出信号和资源回收。环境版本、最小权限、限制与故障日志；Windows 测试不当作 Linux 实验

成果标准：环境版本、最小权限、限制与故障日志；Windows 测试不当作 Linux 实验。

### 模型结构与计算工作负载

类别：核心必修。前置：张量、自动微分与框架、机器学习与优化基础。

精读范围：MLP、CNN、RNN、attention/Transformer、tokenizer、embedding、MoE 与稀疏访问。

主资源：[动手学深度学习](https://zh.d2l.ai/)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。

- 理解机制与边界：MLP、CNN、RNN、attention/Transformer、tokenizer、embedding、MoE 与稀疏访问；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：选 D2L CNN/RNN/attention，再按 CS336 Assignment 1 实现小型 tokenizer、模型与优化器
- 测试、优化与解释：检查张量形状、mask、梯度和参数量；比较卷积、attention 与 embedding 的访存需求。小型模型与单元测试、FLOPs/内存预算、质量基线；不要求下载大模型

成果标准：小型模型与单元测试、FLOPs/内存预算、质量基线；不要求下载大模型。

### 评估、实验设计与鲁棒性

类别：核心必修。前置：机器学习与优化基础、概率与统计推理、数据管线与可复现训练。

精读范围：数据切分、污染、质量指标、置信区间、漂移、鲁棒性与性能公平比较。

主资源：[Stanford CS336](https://cs336.stanford.edu/)。 补充：[OpenIntro Statistics](https://www.openintro.org/book/os/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：数据切分、污染、质量指标、置信区间、漂移、鲁棒性与性能公平比较；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：固定训练/验证/测试边界；按原课评估主题设计数据与质量基线
- 测试、优化与解释：测多个种子、样本分组和负载；比较精度变化与性能误差。评估协议、失败样本、统计不确定性和质量/性能取舍；避免测试集参与调参

成果标准：评估协议、失败样本、统计不确定性和质量/性能取舍；避免测试集参与调参。

### 实验追踪与模型产物

类别：核心必修。前置：数据管线与可复现训练、软件工程与可测试交付。

精读范围：配置、数据版本、随机状态、环境、模型/优化器产物、谱系与注册。

主资源：[MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：配置、数据版本、随机状态、环境、模型/优化器产物、谱系与注册；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：组织配置、提交、数据哈希与模型元数据；按官方 tracking/model 文档核对字段
- 测试、优化与解释：重跑小模型；从保存状态继续并比较下一步；检查缺失产物时明确失败。可复现实验目录、版本清单与恢复记录；MLflow 仅为参考选型，不自动装服务

成果标准：可复现实验目录、版本清单与恢复记录；MLflow 仅为参考选型，不自动装服务。

### 加速器与数据中心架构

类别：方向必修。前置：C/C++、内存与计算机组织、数值稳定性与性能测量。

精读范围：SIMD/SIMT、tensor core、HBM、NUMA、PCIe/NVLink、NIC、TPU/异构与机柜供电。

主资源：[CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。

- 理解机制与边界：SIMD/SIMT、tensor core、HBM、NUMA、PCIe/NVLink、NIC、TPU/异构与机柜供电；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：沿 CUDA 与 MLSysBook Compute Infrastructure 画主机、设备与网络的数据路径
- 测试、优化与解释：核算容量/带宽/计算上界；用原课资源核算练习解释瓶颈。带单位的预算、硬件兼容表与可证伪预测；异构硬件未实测不写已通过

成果标准：带单位的预算、硬件兼容表与可证伪预测；异构硬件未实测不写已通过。

### 性能剖析与端到端基准

类别：方向必修。前置：GPU 内核与性能工程、数值稳定性与性能测量、数据管线与可复现训练。

精读范围：时间线、异步同步、roofline、算术强度、H2D、数据加载、内存、尾延迟。

主资源：[PyTorch Profiler 官方配方](https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。

- 理解机制与边界：时间线、异步同步、roofline、算术强度、H2D、数据加载、内存、尾延迟；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按官方 profiler 配方标注加载、拷贝、前后向和 optimizer；区分预热与编译开销
- 测试、优化与解释：CPU oracle 与 GPU 容差一起复核；固定线程、batch、时钟条件并记录分布。剖析 trace、测量边界与优化前后报告；内核加速必须另测端到端收益

成果标准：剖析 trace、测量边界与优化前后报告；内核加速必须另测端到端收益。

### 集体通信与高速网络

类别：方向必修。前置：分布式与故障恢复、GPU 内核与性能工程、网络与存储 I/O。

精读范围：AllReduce、AllGather、ReduceScatter、AlltoAll、ring/tree、RDMA、拓扑与超时。

主资源：[NCCL 官方通信指南](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)。 补充：[PyTorch Distributed](https://docs.pytorch.org/docs/2.10/distributed.html)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：AllReduce、AllGather、ReduceScatter、AlltoAll、ring/tree、RDMA、拓扑与超时；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：先按 PyTorch 2.10 后端表核对平台，再用小数组验证各 collective 的输出
- 测试、优化与解释：在可用多进程环境故意制造次序/形状错误；测消息大小、拓扑与 overlap。输出 oracle、通信量推导、延迟/带宽曲线与故障日志；CPU 多进程不冒充多卡

成果标准：输出 oracle、通信量推导、延迟/带宽曲线与故障日志；CPU 多进程不冒充多卡。

### 训练显存与并行内存优化

类别：方向必修。前置：张量、自动微分与框架、GPU 内核与性能工程、集体通信与高速网络。

精读范围：参数、梯度、优化器、激活；梯度累积、重计算、offload、ZeRO/FSDP、分片检查点。

主资源：[PyTorch FSDP 2.10 API](https://docs.pytorch.org/docs/2.10/fsdp.html)。 补充：[PyTorch Distributed](https://docs.pytorch.org/docs/2.10/distributed.html)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。

- 理解机制与边界：参数、梯度、优化器、激活；梯度累积、重计算、offload、ZeRO/FSDP、分片检查点；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：先核算小模型内存，再按官方 FSDP/CS336 系统作业比较分片与累积
- 测试、优化与解释：记录峰值 allocated/reserved、通信与耗时；检查梯度、loss 和断点恢复。内存分项、拓扑与状态保存方案、数值/吞吐对照；没有多卡只提交理论预算

成果标准：内存分项、拓扑与状态保存方案、数值/吞吐对照；没有多卡只提交理论预算。

### 规模规律与训练预算

类别：方向必修。前置：分布式训练系统、模型结构与计算工作负载、概率与统计推理。

精读范围：参数/数据/计算量、scaling laws、MFU、强弱扩展、straggler 与恢复成本。

主资源：[Stanford CS336](https://cs336.stanford.edu/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：参数/数据/计算量、scaling laws、MFU、强弱扩展、straggler 与恢复成本；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按 CS336 Assignment 3 先理解预算与拟合；用获准的小规模实验建立曲线
- 测试、优化与解释：分离硬件峰值、有效吞吐和质量；报告范围、残差与未验证外推。预算模型、拟合诊断、扩展效率与失败开销；原课 API/云费用先另行确认

成果标准：预算模型、拟合诊断、扩展效率与失败开销；原课 API/云费用先另行确认。

### 后训练与 rollout 基础设施

类别：方向必修。前置：模型结构与计算工作负载、评估、实验设计与鲁棒性、数据管线与可复现训练。

精读范围：SFT、偏好优化、RLVR、rollout/learner、奖励、同步/异步与样本版本。

主资源：[Stanford CS336](https://cs336.stanford.edu/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：SFT、偏好优化、RLVR、rollout/learner、奖励、同步/异步与样本版本；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按 CS336 Assignment 5 理解 SFT 与 reasoning RL；先确定数据、奖励和评估边界
- 测试、优化与解释：在小模型/获准环境比较样本版本、生成吞吐与训练质量；检查奖励投机。数据与奖励说明、同步协议、质量/资源报告；与原课作业政策相符

成果标准：数据与奖励说明、同步协议、质量/资源报告；与原课作业政策相符。

### 低精度、量化与模型压缩

类别：方向必修。前置：数值稳定性与性能测量、模型结构与计算工作负载、GPU 内核与性能工程。

精读范围：FP16/BF16/FP8、loss scaling、PTQ/QAT、INT8/INT4、校准、稀疏/剪枝与蒸馏。

主资源：[vLLM](https://docs.vllm.ai/en/latest/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：FP16/BF16/FP8、loss scaling、PTQ/QAT、INT8/INT4、校准、稀疏/剪枝与蒸馏；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按 vLLM quantization 与 MLSysBook Model Compression 选一个兼容方案，不混用训练精度与权重量化
- 测试、优化与解释：固定校准/测试数据；对照 FP32、误差、质量、显存与端到端延迟。校准来源、兼容版本、精度与性能报告；文件变小不自动证明更快

成果标准：校准来源、兼容版本、精度与性能报告；文件变小不自动证明更快。

### 集群调度与资源管理

类别：方向必修。前置：分布式与故障恢复、可靠性、安全与可观测性、Linux 与资源隔离。

精读范围：requests/limits、quota、device plugin、亲和性、拓扑、gang scheduling、弹性和队列公平。

主资源：[Kubernetes 官方概念](https://kubernetes.io/docs/concepts/overview/)。 补充：[Ray 官方集群概念](https://docs.ray.io/en/latest/cluster/key-concepts.html)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：requests/limits、quota、device plugin、亲和性、拓扑、gang scheduling、弹性和队列公平；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：沿 Kubernetes scheduling/eviction 与 Ray task/actor 概念制定小集群的调度策略
- 测试、优化与解释：在已有测试环境复现排队、OOM、抢占与节点不可用；核对资源是否释放。调度配置、任务状态轨迹、利用率与恢复；集群工具尚未在本机安装验证

成果标准：调度配置、任务状态轨迹、利用率与恢复；集群工具尚未在本机安装验证。

### 模型部署与生命周期

类别：核心必修。前置：实验追踪与模型产物、评估、实验设计与鲁棒性、可靠性、安全与可观测性。

精读范围：模型注册、打包、schema、导出/兼容、灰度、A/B、监控、漂移与回滚。

主资源：[MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)。 补充：[Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：模型注册、打包、schema、导出/兼容、灰度、A/B、监控、漂移与回滚；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：制定加载、输入输出契约与版本清单；按官方模型产物和 SRE 原则设计灰度
- 测试、优化与解释：用小模型服务/测试替身演练新旧版本、无效输入与回滚；保存部署前后质量。部署与回滚记录、版本谱系、SLI/SLO 与质量门槛；替身不标生产服务已验证

成果标准：部署与回滚记录、版本谱系、SLI/SLO 与质量门槛；替身不标生产服务已验证。

### 安全、隐私与治理

类别：核心必修。前置：数据管线与可复现训练、可靠性、安全与可观测性、软件工程与可测试交付。

精读范围：IAM/RBAC、租户隔离、密钥、供应链、模型/数据许可、PII、投毒、审计与删除。

主资源：[Kubernetes Security](https://kubernetes.io/docs/concepts/security/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：IAM/RBAC、租户隔离、密钥、供应链、模型/数据许可、PII、投毒、审计与删除；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按 Kubernetes Security 与 MLSysBook Security & Privacy 建模访问边界；只用合成非敏感数据
- 测试、优化与解释：检查越权、日志泄漏、依赖来源和过期访问；设计撤销/清理与审计流程。威胁模型、权限矩阵与负面测试；法规与合同按实际地区另核，不提供法律结论

成果标准：威胁模型、权限矩阵与负面测试；法规与合同按实际地区另核，不提供法律结论。

### 容量、成本与能源效率

类别：方向必修。前置：性能剖析与端到端基准、可靠性、安全与可观测性。

精读范围：容量规划、成本/成功任务、GPU 利用、存储/网络费用、能耗、PUE 与碳核算边界。

主资源：[Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：容量规划、成本/成功任务、GPU 利用、存储/网络费用、能耗、PUE 与碳核算边界；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：用已有测量核算吞吐、闲置与恢复开销；按 MLSysBook Sustainable AI 明确统计边界
- 测试、优化与解释：比较batch/精度策略；没有功率计只报告估算并保留假设，不制造实测电量。单位完整的容量预算、假设与敏感性分析；当前云价须重新查证且先授权购买

成果标准：单位完整的容量预算、假设与敏感性分析；当前云价须重新查证且先授权购买。

### 检索、向量索引与 RAG 系统

类别：方向必修。前置：数据库、索引与存储系统、数据管线与可复现训练、推理服务与性能。

精读范围：embedding、ANN、召回/延迟、混合检索、索引更新、元数据权限、RAG 缓存与评估。

主资源：[Faiss](https://faiss.ai/)。补充：[RAG 原始论文](https://arxiv.org/abs/2005.11401)、[MLSysBook](https://mlsysbook.ai/)与 [vLLM](https://docs.vllm.ai/en/latest/)。

- 理解机制与边界：embedding、ANN、召回/延迟、混合检索、索引更新、元数据权限、RAG 缓存与评估；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：先按 Faiss 建立精确检索基线，再对照原始 RAG 论文拆分检索与生成的评价；数据须许可明确
- 测试、优化与解释：比较近似召回、索引内存、延迟和更新一致性；检查检索权限与证据来源。检索/生成分项基线、负面案例与版本图；不把通用聊天 demo 当完整 RAG 验收

成果标准：检索/生成分项基线、负面案例与版本图；不把通用聊天 demo 当完整 RAG 验收。

### 边缘、移动与异构部署

类别：可选深入。前置：模型结构与计算工作负载、低精度、量化与模型压缩、加速器与数据中心架构。

精读范围：模型导出、算子兼容、设备 runtime、实时预算、热/功率、离线与更新。

主资源：[ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)。补充：[MLSysBook](https://mlsysbook.ai/)与 [torch.compile 官方教程](https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html)。

- 理解机制与边界：模型导出、算子兼容、设备 runtime、实时预算、热/功率、离线与更新；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：按 MLSysBook Edge Intelligence 选已有设备；先核对导出与运行时算子支持
- 测试、优化与解释：比较主机 oracle 与设备输出；检查启动、峰值内存、延迟抖动与降频。兼容矩阵、设备实测和可回滚更新；未有设备仅能提交预算与模拟结果

成果标准：兼容矩阵、设备实测和可回滚更新；未有设备仅能提交预算与模拟结果。

### 多模态与其他模型系统

类别：可选深入。前置：模型结构与计算工作负载、数据管线与可复现训练、评估、实验设计与鲁棒性。

精读范围：视觉/音频、变长序列、diffusion、推荐稀疏特征、模态同步与动态 batching。

主资源：[动手学深度学习](https://zh.d2l.ai/)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。 补充：[Machine Learning Systems](https://mlsysbook.ai/)。

- 理解机制与边界：视觉/音频、变长序列、diffusion、推荐稀疏特征、模态同步与动态 batching；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：选 D2L 原模型实践及 CS336 multimodality 主题；先解释样本形状与预处理
- 测试、优化与解释：在获准的小数据上测 decode/preprocess、padding、batch 与质量；避免只测模型算子。预处理与模型链路、数据许可和质量/吞吐报告；方向按岗位需求深入

成果标准：预处理与模型链路、数据许可和质量/吞吐报告；方向按岗位需求深入。

### 端到端 AI 系统设计与复核

类别：方向必修。前置：分布式训练系统、推理服务与性能、集群调度与资源管理、模型部署与生命周期、安全、隐私与治理。

精读范围：需求/SLO、容量、拓扑、数据/模型生命周期、安全、故障、成本和演进。

主资源：[Machine Learning Systems](https://mlsysbook.ai/)。 补充：[Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)。 补充：[Stanford CS336](https://cs336.stanford.edu/)。

- 理解机制与边界：需求/SLO、容量、拓扑、数据/模型生命周期、安全、故障、成本和演进；先用主资源查明定义、假设与失败条件。
- 设计与独立实践：从一个实际问题写需求、约束与预算，选原作者项目作为实现载体
- 测试、优化与解释：由同伴用故障、扩容、质量下降与预算变化挑战假设；在可用环境复核关键链路。需求、架构、独立代码、原测试、性能/质量/安全报告和恢复演练；标明未实测部分

成果标准：需求、架构、独立代码、原测试、性能/质量/安全报告和恢复演练；标明未实测部分。
