# 选章、练习与复核任务

这是权威来源的中文使用指南，不是替代教材的新课程。主资源优先，补充资源按需；完成时间不作为能力标准。具体章节随原课版本更新，以原始目录为准。这里的诊断问题由本站组织，用来检查先修与复核作品，不冒充原课程评分。

## 如何使用

先打开知识节点的主资源，在下列精读范围中找到对应章节，完成原作者的例题与获准公开的练习。卡住时只回到对应前置节点，不要求先读完所有教材。已有基础者用代码、推导和失败案例接受复核后可跳过。每个阶段同时保留 Learn → Design → Build → Test → Optimize → Explain 产物。

专业分支按实际目标选择；高阶 GPU、多卡、推理与编译器不是零基础第一步。完整原课实验条件见[高级原课实验](advanced-labs.md)。

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

精读范围：6.5840 原实验，具体版本与环境待锁定

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
