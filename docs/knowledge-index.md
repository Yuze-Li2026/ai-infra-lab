# 逐项知识与原始资料

核对日期：2026-10-09。45 个学习模块细分为 198 项选读任务。每项都有原始来源、章节定位、独立复核要求和实践环境。条目数量用于检查漏项，不是领域已经穷尽的证明。

先按[学习路径](learning-paths.md)选方向，再用[中文选章指南](curriculum.md)了解先修与整体目标。下表章节名称用于在原站定位；原站改版时先查看目录。练习要求由本站组织，不冒称原作者评分，也不表示对应环境已经部署。做到实践时先读[按实验准备环境](environment-preparation.md)，个人云端准备见[私有实验室](private-cloud.md)，实际环境证据见[验证记录](verification.md)。

来源、许可和选择依据可从[致谢](../CREDITS.md)复核。课程讲解、教材推导、论文原理与工具 API 各有用途，不能互相替代。英文资料保留原文并配中文任务说明；可靠的中文版本在来源目录中单独标明。

## 认识文件与运行程序

模块标识：`computer`。先修：无。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **文件、目录与路径** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Visual Studio Code 与运行 hello.py | 创建独立学习目录，分别说明相对路径、绝对路径和当前目录 | 普通 CPU |
| **编辑、保存与执行** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Creating Code 与 Running Code | 修改输出后重新执行，证明保存的文件和执行的文件相同 | 普通 CPU |
| **输入、输出与终端** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Functions、Arguments、Return Values | 记录一段输入输出，区分命令与程序提示 | 普通 CPU |

## 数字、比例与算术

模块标识：`arithmetic`。先修：无。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **数值、单位与数量级** · [Prealgebra 2e](https://openstax.org/books/prealgebra-2e/pages/1-introduction)；Whole Numbers；Decimals | 换算字节与 GiB，按数据量和耗时计算吞吐量 | 阅读与推导 |
| **分数、比例与百分比** · [Prealgebra 2e](https://openstax.org/books/prealgebra-2e/pages/1-introduction)；Fractions；Percents | 核对加速比与耗时减少百分比，指出二者的区别 | 阅读与推导 |
| **负数、指数与运算顺序** · [Prealgebra 2e](https://openstax.org/books/prealgebra-2e/pages/1-introduction)；Integers；Properties of Real Numbers | 带单位算一组嵌套表达式并逐步验算 | 阅读与推导 |

## 第一段 Python 程序

模块标识：`python`。先修：认识文件与运行程序。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **变量、类型与转换** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Variables、str、int、float | 比较文本数字与数值运算，解释一次类型错误 | 普通 CPU |
| **字符串与原课练习** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：String Methods；Problem Set 0 | 独立完成 Indoor Voice，补充空输入和非英文字母案例 | 普通 CPU |
| **函数、参数与返回值** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Defining Functions | 把重复处理提取成函数，说明输出与返回值的差别 | 普通 CPU |
| **语法错误与定位** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 0：Bugs | 保留一次语法错误及修正前后的实际输出 | 普通 CPU |

## 终端、Git 与可复现环境

模块标识：`tools`。先修：认识文件与运行程序、第一段 Python 程序。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **Shell、管道与退出码** · [计算机教育中缺失的一课](https://missing-semester-cn.github.io/)；Shell；命令行环境 | 把输入经管道处理到文件，区分标准输出和错误输出 | Linux |
| **Git、分支与恢复** · [计算机教育中缺失的一课](https://missing-semester-cn.github.io/)；版本控制 Git | 在独立练习仓库制造错误修改并恢复，保留提交图 | 普通 CPU |
| **调试器与性能工具** · [The Missing Semester](https://missing.csail.mit.edu/)；Debugging and Profiling | 用断点解释状态变化，避免只靠添加打印定位 | 普通 CPU |
| **依赖、虚拟环境与构建** · [The Missing Semester](https://missing.csail.mit.edu/)；Metaprogramming；Development Environment | 从版本清单重建环境，记录解释器和依赖来源 | 普通 CPU |

## 代数、函数与指数

模块标识：`algebra`。先修：数字、比例与算术。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **等式、约束与不等式** · [Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites)；Prerequisites；Equations and Inequalities | 解容量约束并指出变量的单位和可行范围 | 阅读与推导 |
| **函数、图像与复合** · [Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites)；Functions | 用图像解释复合函数及反函数的定义域 | 阅读与推导 |
| **指数与对数** · [Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites)；Exponential and Logarithmic Functions | 把指数关系转换为对数关系并检查增长数量级 | 阅读与推导 |
| **三角函数与周期** · [Algebra and Trigonometry 2e](https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites)；Trigonometric Functions | 解释周期、幅度和相位，为位置编码阅读做准备 | 阅读与推导 |

## 抽象、递归与测试

模块标识：`programming`。先修：第一段 Python 程序。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **条件、循环与异常** · [CS50 Python](https://cs50.harvard.edu/python/)；Weeks 1–3：Conditionals、Loops、Exceptions | 用边界测试覆盖分支、循环终止和错误输入 | 普通 CPU |
| **高阶函数、递归与数据抽象** · [Composing Programs](https://composingprograms.com/3ed/)；Building Abstractions with Functions / Data | 实现递归结构并说明终止条件和抽象边界 | 普通 CPU |
| **对象、接口与派发** · [A Simple Object Model](https://aosabook.org/en/500L/a-simple-object-model.html)；Classes、Instance Attributes、Method Calls | 用对象模型原测试验证实现，再解释方法解析顺序 | 普通 CPU |
| **文件、序列化与资源关闭** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 6：File I/O | 处理 UTF-8、缺失文件和异常退出，验证资源关闭 | 普通 CPU |
| **单元测试与综合程序** · [CS50 Python](https://cs50.harvard.edu/python/)；Week 5：Unit Tests；Final Project | 完成独立项目，保留失败测试及修改理由 | 普通 CPU |

## 证明与离散结构

模块标识：`discrete`。先修：代数、函数与指数、抽象、递归与测试。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **逻辑、集合与关系** · [MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)；Propositions；Sets；Relations | 为一个接口写前置条件、后置条件和反例 | 阅读与推导 |
| **归纳、递归与不变量** · [MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)；Induction；State Machines | 证明循环不变量并说明它如何支持正确性 | 阅读与推导 |
| **有向图与偏序** · [MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)；Directed Graphs；Partial Orders | 为先修图实现拓扑排序，给出有环失败案例 | 普通 CPU |
| **计数与组合** · [MIT 6.042J 计算机数学](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/)；Counting；Generating Functions 选读 | 计算小规模状态空间并解释穷举测试的边界 | 阅读与推导 |

## 向量、矩阵与线性代数

模块标识：`linear`。先修：代数、函数与指数。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **矩阵运算与向量空间** · [MIT 18.06 线性代数](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)；Elimination；Vector Spaces；Nullspace | 推导矩阵形状、秩和解空间 | 阅读与推导 |
| **正交投影与最小二乘** · [MIT 18.06 线性代数](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)；Orthogonality；Projections；Least Squares | 手算小型最小二乘，并用程序核对残差 | 普通 CPU |
| **特征值与正定性** · [MIT 18.06 线性代数](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)；Eigenvalues；Symmetric Matrices；Positive Definiteness | 解释二次型、稳定性和正定条件 | 阅读与推导 |
| **SVD 与低秩近似** · [MIT 18.06 线性代数](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)；Singular Value Decomposition | 比较不同秩的重构误差与存储开销 | 普通 CPU |

## 导数与梯度

模块标识：`calculus`。先修：代数、函数与指数、向量、矩阵与线性代数。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **极限、导数与链式法则** · [MIT 18.01SC 微积分](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/)；Differentiation；Chain Rule | 逐步推导复合函数导数并检查数值近似 | 阅读与推导 |
| **偏导、梯度与方向导数** · [MIT 18.02SC Multivariable Calculus](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)；Partial Derivatives；Gradient | 用形状检查区分标量梯度和向量导数 | 阅读与推导 |
| **Jacobian 与多变量链式法则** · [MIT 18.02SC Multivariable Calculus](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)；Chain Rule；Differentials | 推导一个双输入计算图的向量—Jacobian 积 | 阅读与推导 |
| **极值、约束与曲率** · [MIT 18.02SC Multivariable Calculus](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)；Maxima and Minima；Lagrange Multipliers | 分析驻点并说明约束优化与无约束问题的差别 | 阅读与推导 |

## 概率与统计推理

模块标识：`probability`。先修：代数、函数与指数、证明与离散结构、导数与梯度。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **条件概率与 Bayes** · [Harvard Statistics 110](https://stat110.hsites.harvard.edu/)；Conditional Probability；Bayes' Rule | 用条件概率解释一个带基率的分类结果 | 阅读与推导 |
| **随机变量、期望与方差** · [Harvard Statistics 110](https://stat110.hsites.harvard.edu/)；Random Variables；Expectation；Variance | 推导并用模拟核对均值与方差 | 普通 CPU |
| **大数定律与中心极限定理** · [Harvard Statistics 110](https://stat110.hsites.harvard.edu/)；Law of Large Numbers；Central Limit Theorem | 说明样本数量对估计波动的影响和适用条件 | 普通 CPU |
| **置信区间与假设检验** · [OpenIntro Statistics](https://www.openintro.org/book/os/)；Foundations for Inference；Inference for Numerical Data | 报告重复测量的区间，避免把一次耗时差当结论 | 普通 CPU |
| **随机化与混杂因素** · [OpenIntro Statistics](https://www.openintro.org/book/os/)；Introduction to Data；Experiments | 为性能比较设计受控实验并标出潜在混杂 | 阅读与推导 |

## 软件工程与可测试交付

模块标识：`engineering`。先修：抽象、递归与测试、终端、Git 与可复现环境。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **接口契约与模块边界** · [Composing Programs](https://composingprograms.com/3ed/)；Building Abstractions with Data | 明确输入、返回值、错误与兼容性，独立测试模块 | 普通 CPU |
| **回归、边界与故障测试** · [CS50 Python](https://cs50.harvard.edu/python/)；Unit Tests；Final Project | 加入能击穿错误实现的测试，不只复刻代码路径 | 普通 CPU |
| **CI、构建与可复现交付** · [The Missing Semester](https://missing.csail.mit.edu/)；Metaprogramming；Version Control | 在新目录重建项目并核对版本与构建产物 | 普通 CPU |
| **代码审阅与维护文档** · [The Missing Semester](https://missing.csail.mit.edu/)；Version Control；Debugging | 给一次修改写问题、证据、验证及回滚记录 | 阅读与推导 |

## 数据结构与复杂度

模块标识：`algorithms`。先修：抽象、递归与测试、证明与离散结构。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **复杂度与摊还分析** · [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)；Algorithmic Thinking；Document Distance；Hashing | 比较理论复杂度与不同规模的实际测量 | 普通 CPU |
| **哈希、堆、树与排序** · [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)；Sorting；Heaps；Binary Search Trees；Hashing | 实现并测试边界输入，解释空间与查询代价 | 普通 CPU |
| **图搜索与最短路径** · [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)；BFS；DFS；Shortest Paths | 给出可达性、环检测和负权条件下的区别 | 普通 CPU |
| **动态规划与状态设计** · [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)；Dynamic Programming | 写明状态、转移、初始化和复杂度 | 普通 CPU |

## C/C++、内存与计算机组织

模块标识：`architecture`。先修：抽象、递归与测试、终端、Git 与可复现环境、数字、比例与算术。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **C 指针、生命周期与布局** · [Beej’s Guide to C Programming](https://beej.us/guide/bgc/html/split/)；Pointers；Arrays；Structs；Manual Memory Allocation | 画出栈/堆对象与指针关系，检查越界和释放错误 | 普通 CPU |
| **C++ RAII、所有权与模板** · [Stanford CS106L Standard C++ Programming](https://web.stanford.edu/class/cs106l/)；References；Classes；RAII；Move Semantics | 用 RAII 管理资源并解释移动与复制成本 | 普通 CPU |
| **指令、流水线与 SIMD** · [Berkeley CS61C](https://cs61c.org/fa26/)；RISC-V；Pipelining；Data-Level Parallelism | 把小段代码对应到指令，区分延迟和吞吐 | 普通 CPU |
| **缓存、局部性与带宽** · [Berkeley CS61C](https://cs61c.org/fa26/)；Caches；Memory Hierarchy | 比较顺序与跨步访问，解释缓存未命中 | 普通 CPU |
| **多核、原子操作与共享内存** · [Berkeley CS61C](https://cs61c.org/fa26/)；Thread-Level Parallelism；OpenMP | 构造竞争并修复，说明伪共享的测量条件 | 普通 CPU |

## 操作系统与并发

模块标识：`os`。先修：C/C++、内存与计算机组织、数据结构与复杂度。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **进程、线程与调度** · [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)；Processes；Process API；CPU Scheduling | 对比进程与线程状态、上下文切换和调度策略 | Linux |
| **地址空间、分页与虚拟内存** · [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)；Address Spaces；Paging；TLBs；Swapping | 解释缺页和工作集变化，记录实际内存观测 | Linux |
| **锁、条件变量与并发错误** · [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)；Locks；Condition Variables；Concurrency Bugs | 写有界生产消费程序并测试死锁/丢唤醒 | Linux |
| **文件系统、日志与崩溃一致性** · [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)；Files and Directories；File System Implementation；Crash Consistency | 断点恢复后核对持久状态，不把 flush 等同于落盘 | Linux |

## 网络与存储 I/O

模块标识：`network`。先修：操作系统与并发。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **以太网、IP、路由与 NAT** · [Stanford CS144 Computer Networking](https://cs144.github.io/)；Internet and IP；Routing | 画出一次远程访问的路径及各层地址变化 | Linux |
| **TCP、流控与拥塞** · [Stanford CS144 Computer Networking](https://cs144.github.io/)；TCP；Congestion Control；Checkpoints | 解释重传、窗口、RTT 与带宽时延积 | Linux |
| **DNS、HTTP、TLS 与连接复用** · [Stanford CS144 Computer Networking](https://cs144.github.io/)；Applications；Security | 分离解析、建连、握手和请求耗时，说明 TLS 身份验证 | Linux |
| **套接字、异步 I/O 与背压** · [Stanford CS144 Computer Networking](https://cs144.github.io/)；Byte Stream；Reassembler；Network Interface | 在慢消费者下验证内存上限和连接关闭 | Linux |

## 数据库、索引与存储系统

模块标识：`storage`。先修：数据结构与复杂度、操作系统与并发。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **索引、树与读写放大** · [DBDB · 持久化键值数据库](https://aosabook.org/en/500L/dbdb-dog-bed-database.html)；Design；Binary Tree；Physical Layer | 实现查询与持久化，测量树形与访问模式影响 | 普通 CPU |
| **事务、日志与恢复** · [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)；Crash Consistency；Distributed Systems | 用崩溃案例解释原子性、持久性和重放 | Linux |
| **Arrow、Parquet 与分区** · [Apache Arrow 数据集指南](https://arrow.apache.org/docs/python/dataset.html)；Tabular Datasets：Reading、Filtering、Partitioning | 比较列裁剪、分区过滤和全量扫描的数据量 | 普通 CPU |
| **对象存储、缓存与数据局部性** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Data Storage | 设计分层数据路径，分析小文件、元数据和检查点写入竞争 | 集群 / 管理权限 |

## Linux 与资源隔离

模块标识：`linux`。先修：操作系统与并发、终端、Git 与可复现环境。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **用户、权限、进程与服务** · [计算机教育中缺失的一课](https://missing-semester-cn.github.io/)；Shell；命令行环境 | 区分用户权限和进程归属，记录服务启动及退出码 | Linux |
| **cgroup v2 与资源控制** · [Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)；Core Interface；CPU；Memory；IO | 在获准环境验证内存限制与 OOM 行为，保留资源统计 | Linux |
| **镜像、容器、卷与网络** · [Docker 入门与容器基础](https://docs.docker.com/get-started/)；Workshop；Concepts | 构建固定依赖镜像，验证数据卷重建与网络隔离 | Linux |
| **namespace、权限与隔离边界** · [Kubernetes Security](https://kubernetes.io/zh-cn/docs/concepts/security/)；安全检查清单；Pod 安全标准 | 说明容器共享内核、capabilities 与最小权限的关系 | Linux |

## 数值稳定性与性能测量

模块标识：`numerics`。先修：向量、矩阵与线性代数、导数与梯度、概率与统计推理、C/C++、内存与计算机组织。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **浮点误差与舍入** · [动手学深度学习](https://zh.d2l.ai/)；预备知识；数值稳定性与模型初始化 | 比较不同求和顺序与 dtype 的误差 | 普通 CPU |
| **稳定算子与条件数** · [动手学深度学习](https://zh.d2l.ai/)；数值稳定性；Softmax 回归 | 实现稳定 softmax/log-sum-exp 并测试极端输入 | 普通 CPU |
| **有限差分与梯度检查** · [Deep Learning Systems](https://dlsyscourse.org/)；Automatic Differentiation；HW1 | 选择差分步长，比较解析梯度与数值梯度 | 普通 CPU |
| **预热、同步与统计测量** · [PyTorch Profiler 官方配方](https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html)；PyTorch Profiler：schedule 与 trace | 分开编译、预热、稳态与数据搬运耗时 | 单卡 GPU |

## 机器学习与优化基础

模块标识：`ml`。先修：抽象、递归与测试、向量、矩阵与线性代数、导数与梯度、概率与统计推理。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **损失、泛化与数据划分** · [动手学深度学习](https://zh.d2l.ai/)；线性神经网络；模型选择、欠拟合和过拟合 | 固定划分，报告训练与验证误差并排查泄漏 | 普通 CPU |
| **SGD、动量、Adam 与学习率** · [动手学深度学习](https://zh.d2l.ai/)；优化算法 | 比较优化器状态、收敛和相同预算下的结果 | 普通 CPU |
| **正则化与初始化** · [动手学深度学习](https://zh.d2l.ai/)；权重衰减；暂退法；模型初始化 | 做单因素对照并解释训练/验证差异 | 普通 CPU |
| **训练循环与复现** · [动手学深度学习](https://zh.d2l.ai/)；深度学习计算；训练 | 保存数据版本、随机状态和优化器，复现下一步更新 | 普通 CPU |

## 张量、自动微分与框架

模块标识：`framework`。先修：机器学习与优化基础、数值稳定性与性能测量、操作系统与并发。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **张量、stride、广播与视图** · [Deep Learning Systems](https://dlsyscourse.org/)；NDArray；HW3 选读 | 核对形状、存储别名和非连续输入的行为 | 普通 CPU |
| **计算图、VJP 与自动微分** · [Deep Learning Systems](https://dlsyscourse.org/)；Automatic Differentiation；HW1 | 实现算子反向传播并通过独立数值检查 | 普通 CPU |
| **算子派发、设备与内存管理** · [Deep Learning Systems](https://dlsyscourse.org/)；Hardware Acceleration；HW3/HW4 | 解释分配、设备迁移、同步和后端边界 | 单卡 GPU |
| **模块、优化器与状态序列化** · [Deep Learning Systems](https://dlsyscourse.org/)；Neural Network Modules；HW2 | 验证参数更新、模式切换、保存与恢复 | 普通 CPU |

## 数据管线与可复现训练

模块标识：`data`。先修：机器学习与优化基础、终端、Git 与可复现环境、网络与存储 I/O。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **数据来源、许可与划分** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Lecture 13：Data sources and datasets | 为训练输入写来源、许可、版本和污染检查记录 | 普通 CPU |
| **去重、质量过滤与混合** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Lecture 14：Filtering, deduplication, mixing | 量化过滤损失、重复率与分布变化，检查偏差 | 普通 CPU |
| **分片、预取与数据加载** · [Apache Arrow 数据集指南](https://arrow.apache.org/docs/python/dataset.html)；Tabular Datasets：Scanning and Filtering | 测量读取、解码、组批与 GPU 等待的占比 | 单卡 GPU |
| **分布式预处理与背压** · [Ray 官方集群概念](https://docs.ray.io/en/latest/data/data.html)；Ray Data：Data Processing | 限制在途数据，测试任务重试和重复处理语义 | 集群 / 管理权限 |
| **日志流、分区与重放** · [Apache Kafka 设计](https://kafka.apache.org/43/design/)；Design：Persistence；Replication；Delivery Guarantees | 在重复投递和消费者恢复后核对数据集合与顺序 | 集群 / 管理权限 |
| **事件时间、水位线与迟到数据** · [Spark Structured Streaming](https://spark.apache.org/docs/latest/streaming/index.html)；Structured Streaming：Event-time；Watermarking；State | 构造迟到事件，解释窗口输出与状态清理 | 集群 / 管理权限 |
| **特征存储与时间点正确性** · [Feast 特征平台](https://docs.feast.dev/)；Concepts：Point-in-time Joins；Online/Offline Store | 避免未来特征泄漏并比较训练与服务特征 | 普通 CPU |

## 模型结构与计算工作负载

模块标识：`models`。先修：张量、自动微分与框架、机器学习与优化基础。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **线性层、卷积与循环网络** · [动手学深度学习](https://zh.d2l.ai/)；卷积神经网络；循环神经网络 | 计算参数量、FLOPs、激活大小并对照 profiler | 普通 CPU |
| **Attention、Transformer 与 KV** · [动手学深度学习](https://zh.d2l.ai/)；注意力机制与 Transformer | 推导注意力形状与序列长度引起的资源增长 | 普通 CPU |
| **BPE、词表与 tokenizer** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Tokenization；Assignment 1 | 核对编码/解码与边界输入，保存 tokenizer 版本 | 普通 CPU |
| **MoE、路由与负载不均** · [Megatron Core 用户指南](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/index.html)；User Guide：MoE | 分析专家容量、All-to-All 与负载偏斜 | 多卡 GPU |
| **推荐模型与稀疏 Embedding** · [TorchRec 推荐系统基础设施](https://github.com/meta-pytorch/torchrec)；Introduction；DLRM Examples；Embedding Modules | 计算 Embedding 表规模与访问成本，区分稀疏与稠密负载 | 单卡 GPU |

## 评估、实验设计与鲁棒性

模块标识：`evaluation`。先修：机器学习与优化基础、概率与统计推理、数据管线与可复现训练。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **任务指标、基线与污染** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Lecture 12：Evaluation | 冻结数据与基线，区分离线分数和实际服务质量 | 普通 CPU |
| **重复实验、区间与显著性** · [OpenIntro Statistics](https://www.openintro.org/book/os/)；Statistical Inference | 给出样本量和区间，防止挑选最好一次结果 | 普通 CPU |
| **分布偏移、长尾与对抗输入** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Robust AI | 构造分布变化和长尾样本，定位指标退化 | 普通 CPU |
| **负载模型、尾延迟与可比性** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Monitoring Distributed Systems；Addressing Cascading Failures | 固定输入长度和并发，报告吞吐、p95/p99 与失败率 | 单卡 GPU |

## 实验追踪与模型产物

模块标识：`experiments`。先修：数据管线与可复现训练、软件工程与可测试交付。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **参数、指标与实验追踪** · [MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)；MLflow Tracking | 保留一次可重跑实验的参数、指标和版本 | 普通 CPU |
| **模型、数据与环境产物** · [MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)；Models；Tracking Artifacts | 核对模型签名、依赖和产物哈希 | 普通 CPU |
| **注册表、版本与推广** · [MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)；Model Registry | 验证候选到发布的引用变化及回退 | 普通 CPU |
| **随机性与完整恢复** · [PyTorch Distributed Checkpoint](https://docs.pytorch.org/docs/2.10/distributed.checkpoint.html)；Stateful；State Dict；save/load | 在恢复后比较下一批输入和参数更新，而不只加载成功 | 多卡 GPU |

## GPU 内核与性能工程

模块标识：`gpu`。先修：张量、自动微分与框架、C/C++、内存与计算机组织、数值稳定性与性能测量。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **线程块、warp 与同步** · [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)；Programming Model；Execution Model | 解释索引与屏障范围，测试非整块大小输入 | 单卡 GPU |
| **合并访问、共享内存与 bank** · [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)；Memory Hierarchy；Memory Access | 比较访存模式，核对边界与数据竞争 | 单卡 GPU |
| **归约、GEMM 与分块** · [Triton 官方编程教程](https://triton-lang.org/main/getting-started/tutorials/index.html)；Vector Addition；Fused Softmax；Matrix Multiplication | 验证不同形状和 dtype，再测量分块取舍 | 单卡 GPU |
| **Stream、事件与异步拷贝** · [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)；Asynchronous Execution；Streams and Events | 用事件验证依赖，分析计算与传输重叠 | 单卡 GPU |
| **融合 Attention 与内存流量** · [Triton 官方编程教程](https://triton-lang.org/main/getting-started/tutorials/index.html)；Fused Attention tutorial | 对照输出和梯度，说明减少的中间张量读写 | 单卡 GPU |

## 分布式与故障恢复

模块标识：`dist`。先修：操作系统与并发、网络与存储 I/O、数据结构与复杂度。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **故障模型、重试与幂等** · [MIT 6.5840 分布式系统](https://pdos.csail.mit.edu/6.5840/)；RPC；Fault Tolerance | 区分超时与失败，测试重复请求和部分完成 | Linux |
| **复制日志、Raft 与选举** · [MIT 6.5840 分布式系统](https://pdos.csail.mit.edu/6.5840/)；Raft；Lab raft1 | 执行原测试，解释安全性、活性与网络分区 | Linux |
| **一致性、事务与分片** · [MIT 6.5840 分布式系统](https://pdos.csail.mit.edu/6.5840/)；Linearizability；Transactions；Sharded Systems | 给出历史记录并判断允许的读取结果 | 集群 / 管理权限 |
| **快照、恢复与成员变化** · [MIT 6.5840 分布式系统](https://pdos.csail.mit.edu/6.5840/)；Persistence；Snapshots；Configuration Changes | 故障恢复后核对状态和已确认操作 | 集群 / 管理权限 |

## 分布式训练系统

模块标识：`training`。先修：张量、自动微分与框架、数据管线与可复现训练、GPU 内核与性能工程、分布式与故障恢复、集体通信与高速网络。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **数据并行与梯度同步** · [PyTorch Distributed](https://docs.pytorch.org/docs/2.10/generated/torch.nn.parallel.DistributedDataParallel.html)；DistributedDataParallel | 与单进程基线核对梯度、有效 batch 和训练轨迹 | 多卡 GPU |
| **张量并行与通信** · [Megatron Core 用户指南](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/index.html)；User Guide：Tensor Parallelism | 逐层分析切分、通信量和算子形状 | 多卡 GPU |
| **流水线并行与调度** · [Megatron Core 用户指南](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/index.html)；User Guide：Pipeline Parallelism | 画 microbatch 调度，计算气泡与激活保存成本 | 多卡 GPU |
| **上下文、专家与混合并行** · [Megatron Core 用户指南](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/index.html)；User Guide：Context Parallelism；MoE | 解释并行组的交叠及不同拓扑下的瓶颈 | 多卡 GPU |
| **弹性启动与分布式恢复** · [PyTorch Distributed Checkpoint](https://docs.pytorch.org/docs/2.10/distributed.checkpoint.html)；Distributed save/load；State Dict | 中断一个 worker，核对恢复后优化器和采样状态 | 多卡 GPU |
| **Embedding 分片与流水线** · [TorchRec 推荐系统基础设施](https://github.com/meta-pytorch/torchrec)；Features：Sharders；Planner；Pipelined Training | 比较按表、按行、按列分片的通信和容量 | 多卡 GPU |
| **JAX 全局数组与设备 mesh** · [JAX 分片与并行](https://docs.jax.dev/en/latest/201/sharding.html)；Distributed Arrays；Sharding；Mesh | 在相同数学操作下比较分片、通信和设备放置 | 多卡 GPU |

## 推理服务与性能

模块标识：`inference`。先修：张量、自动微分与框架、GPU 内核与性能工程、网络与存储 I/O、数据管线与可复现训练、模型结构与计算工作负载。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **Prefill、Decode 与 KV cache** · [vLLM](https://docs.vllm.ai/en/latest/)；Design：Paged Attention；Automatic Prefix Caching | 按序列长度计算 KV 开销，区分首 token 与逐 token 延迟 | 单卡 GPU |
| **连续批处理与请求调度** · [vLLM](https://docs.vllm.ai/en/latest/)；Serving；Engine Arguments；Metrics | 在不同到达率下测量排队、吞吐与尾延迟 | 单卡 GPU |
| **推测解码与正确性** · [vLLM](https://docs.vllm.ai/en/latest/)；Features：Speculative Decoding | 比较接受率、质量约束和额外计算成本 | 单卡 GPU |
| **Prefill/Decode 分离与多卡服务** · [vLLM](https://docs.vllm.ai/en/latest/)；Disaggregated Prefilling；Distributed Serving | 测量 KV 传输与排队代价，保留同模型基线 | 多卡 GPU |
| **前缀复用与框架对照** · [SGLang 推理文档](https://docs.sglang.io/)；Quickstart；RadixAttention；Prefix Caching | 用同一输入、模型、质量阈值对照服务框架 | 单卡 GPU |

## 可靠性、安全与可观测性

模块标识：`operations`。先修：操作系统与并发、网络与存储 I/O、终端、Git 与可复现环境。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **SLI、SLO 与错误预算** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Service Level Objectives；Embracing Risk | 为服务定义可观测成功条件和告警窗口 | 阅读与推导 |
| **指标、标签与告警** · [Prometheus 监控基础](https://prometheus.io/docs/introduction/overview/)；Overview；Metric Types；Alerting | 区分 counter/gauge/histogram，控制标签基数 | Linux |
| **追踪、日志与上下文传播** · [OpenTelemetry Python](https://opentelemetry.io/docs/languages/python/)；Python：Instrumentation；Traces；Metrics | 从请求追踪到下游耗时，验证敏感字段不入日志 | Linux |
| **故障、回滚与事后分析** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Emergency Response；Postmortem Culture | 注入可恢复故障并记录发现、止损和恢复时间 | 集群 / 管理权限 |
| **GPU 健康与设备观测** · [NVIDIA DCGM 功能指南](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)；Health Monitoring；Job Statistics；Profiling | 按设备支持范围采集指标，区分应用慢与硬件异常 | 单卡 GPU |

## 编译器与算子图优化

模块标识：`compiler`。先修：C/C++、内存与计算机组织、数据结构与复杂度、张量、自动微分与框架。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **IR、类型与语义** · [MLIR Toy Tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/)；Toy Chapters 1–3 | 为小语言建立 IR，给出转换前后的语义测试 | Linux |
| **Pass、融合与 Lowering** · [MLIR Toy Tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/)；Toy Chapters 4–6 | 逐层验证优化和降低后的结果，不只编译成功 | Linux |
| **图捕获、Graph Break 与动态形状** · [torch.compile 官方教程](https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html)；torch.compile tutorial；Graph Breaks | 定位重编译和图断点，区分首次编译与稳态速度 | 单卡 GPU |
| **HLO、布局与设备代码生成** · [OpenXLA / XLA 编译器](https://openxla.org/xla)；XLA Architecture；HLO；GPU Architecture | 跟踪布局与融合的变化，检查输出和后端约束 | 单卡 GPU |

## 加速器与数据中心架构

模块标识：`accelerators`。先修：C/C++、内存与计算机组织、数值稳定性与性能测量。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **算力、带宽与 Roofline** · [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)；Performance Guidelines | 计算算术强度并与实际瓶颈对照 | 单卡 GPU |
| **CPU NUMA、PCIe 与 NVLink** · [NCCL 官方通信指南](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)；Troubleshooting：GPU-to-GPU；Topology | 画设备拓扑，分别测量点对点和主机传输 | 多卡 GPU |
| **电力、冷却与故障域** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Compute Infrastructure | 估算机架容量，区分设备故障与故障域设计 | 阅读与推导 |
| **GPU、TPU、NPU 与后端约束** · [ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)；Backends；Hardware Support | 为目标后端核对算子、dtype、内存和工具链支持 | 指定目标设备 |
| **ROCm、HIP 与跨厂商移植** · [AMD ROCm 文档](https://rocm.docs.amd.com/en/latest/)；Compatibility Matrix；HIP；Frameworks | 先核对设备支持，再对照正确性与性能，不假设 CUDA 二进制可直接运行 | 指定目标设备 |

## 性能剖析与端到端基准

模块标识：`profiling`。先修：GPU 内核与性能工程、数值稳定性与性能测量、数据管线与可复现训练。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **基准协议与测量误差** · [PyTorch Profiler 官方配方](https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html)；Profiler recipe：schedule；record_shapes | 固定输入与同步点，记录预热和重复次数 | 单卡 GPU |
| **CPU/GPU 时间线与 NVTX** · [Nsight Systems 用户指南](https://docs.nvidia.com/nsight-systems/UserGuide/index.html)；Profiling；CUDA Trace；NVTX | 关联主机发射、设备执行与通信等待 | 单卡 GPU |
| **算子、内存和带宽瓶颈** · [PyTorch Profiler 官方配方](https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html)；Memory Profiling；Trace Analysis | 排序热点后改变一个因素，验证端到端收益 | 单卡 GPU |
| **端到端效率与回归** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Capacity Planning；Monitoring | 同时报告质量、成本与尾延迟，避免局部加速掩盖整体退化 | 单卡 GPU |

## 集体通信与高速网络

模块标识：`collectives`。先修：分布式与故障恢复、GPU 内核与性能工程、网络与存储 I/O。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **AllReduce、AllGather、ReduceScatter** · [NCCL 官方通信指南](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)；Usage：Collective Operations | 手算小数据的输出并在多卡核对 | 多卡 GPU |
| **Ring、Tree 与通信成本** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Collective Communication | 按消息量、带宽和延迟比较通信算法 | 阅读与推导 |
| **InfiniBand、RoCE 与 GPUDirect RDMA** · [NCCL 官方通信指南](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)；Troubleshooting：Networking；GPU-to-NIC | 核对网卡、驱动、拓扑和链路测试后再调参数 | 集群 / 管理权限 |
| **计算通信重叠与梯度分桶** · [PyTorch Distributed](https://docs.pytorch.org/docs/2.10/distributed.html)；DistributedDataParallel；Communication Hooks | 对比不同 bucket 的通信等待与端到端时间 | 多卡 GPU |
| **挂起、超时和通信诊断** · [NCCL 官方通信指南](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)；Troubleshooting：RAS；Logging；Diagnostics | 模拟 worker 退出并保存有界超时和诊断证据 | 多卡 GPU |

## 训练显存与并行内存优化

模块标识：`memory`。先修：张量、自动微分与框架、GPU 内核与性能工程、集体通信与高速网络。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **参数、梯度、状态与激活预算** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Resource Accounting；Systems | 按 dtype 和并行策略列显存预算并实测峰值 | 单卡 GPU |
| **ZeRO/FSDP 状态分片** · [PyTorch FSDP 2.10 API](https://docs.pytorch.org/docs/2.10/fsdp.html)；FullyShardedDataParallel；ShardingStrategy | 核对峰值、通信与恢复文件，说明分片节省来自哪里 | 多卡 GPU |
| **激活重计算与 Offload** · [PyTorch Distributed](https://docs.pytorch.org/docs/2.10/checkpoint.html)；torch.utils.checkpoint；Offload 另参照本节 FSDP 的 CPUOffload | 测量重计算或搬运带来的耗时与显存变化 | 单卡 GPU |
| **分片检查点与恢复拓扑** · [PyTorch Distributed Checkpoint](https://docs.pytorch.org/docs/2.10/distributed.checkpoint.html)；State Dict；StorageWriter；StorageReader | 保存后在支持的拓扑重载并核对下一步训练 | 多卡 GPU |

## 规模规律与训练预算

模块标识：`scaling`。先修：分布式训练系统、模型结构与计算工作负载、概率与统计推理。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **Scaling laws 与拟合** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Scaling Laws；Assignment 3 | 保留不同规模实验，报告拟合误差与外推边界 | 单卡 GPU |
| **Token、参数量与计算预算** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Resource Accounting；Scaling Laws | 在相同计算预算下比较模型和数据分配 | 阅读与推导 |
| **数据质量与有效训练量** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Data；Evaluation | 用可重复样本比较数据清洗前后的质量收益 | 单卡 GPU |
| **吞吐、利用率与经济成本** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Performance Engineering；Sustainable AI | 把失败重试、存储和空闲计费计入有效训练成本 | 阅读与推导 |

## 后训练与 rollout 基础设施

模块标识：`posttraining`。先修：模型结构与计算工作负载、评估、实验设计与鲁棒性、数据管线与可复现训练。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **SFT 与序列打包** · [TRL 后训练指南](https://huggingface.co/docs/trl/index)；SFT Trainer | 验证 masking、padding、样本边界与 loss 计算 | 单卡 GPU |
| **偏好数据、奖励模型与 DPO** · [TRL 后训练指南](https://huggingface.co/docs/trl/index)；Reward Trainer；DPO Trainer | 检查偏好对、参考模型和训练指标是否一致 | 单卡 GPU |
| **PPO/GRPO 与 rollout 管线** · [TRL 后训练指南](https://huggingface.co/docs/trl/index)；GRPO Trainer；PPO Trainer | 记录采样、奖励、更新的吞吐和数据版本 | 多卡 GPU |
| **RLVR、验证器与奖励失真** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Lecture 16：RLVR | 构造验证器反例，解释奖励增长与任务改善的区别 | 单卡 GPU |
| **在线采样、权重同步与复现** · [TRL 后训练指南](https://huggingface.co/docs/trl/index)；vLLM Integration；Distributed Training | 核对采样使用的模型版本和更新顺序，测试中断恢复 | 多卡 GPU |

## 低精度、量化与模型压缩

模块标识：`precision`。先修：数值稳定性与性能测量、模型结构与计算工作负载、GPU 内核与性能工程。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **FP32、FP16、BF16 与 FP8** · [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/)；Floating-Point；Tensor Cores | 比较范围、精度和硬件支持，不仅比较字节数 | 单卡 GPU |
| **混合精度、缩放与溢出** · [动手学深度学习](https://zh.d2l.ai/)；数值稳定性；计算性能 | 用极端输入复核梯度与 loss，记录数值异常 | 单卡 GPU |
| **PTQ、QAT、校准与 QDQ** · [ONNX Runtime 模型量化](https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html)；Quantization Overview；Static/Dynamic；Quantization Debugging | 选择代表性校准集，比较精度、延迟和模型大小 | 普通 CPU |
| **剪枝、蒸馏与结构化稀疏** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume I：Model Compression | 明确压缩策略、质量阈值和实际硬件加速条件 | 单卡 GPU |

## 集群调度与资源管理

模块标识：`orchestration`。先修：分布式与故障恢复、可靠性、安全与可观测性、Linux 与资源隔离。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **Pod、GPU 资源与设备插件** · [Kubernetes 官方概念](https://kubernetes.io/zh-cn/docs/concepts/overview/)；工作负载；调度 GPU；资源管理 | 验证请求、限制和调度失败，不把容器启动当 GPU 可用 | 集群 / 管理权限 |
| **队列、配额、公平与准入** · [Kueue 概念与批任务准入](https://kueue.sigs.k8s.io/docs/concepts/)；Workload；ClusterQueue；LocalQueue；Cohort | 提交竞争作业，核对配额借用和准入行为 | 集群 / 管理权限 |
| **Slurm 作业、GRES 与记账** · [Slurm 集群调度](https://slurm.schedmd.com/overview.html)；Overview；Generic Resources；Accounting | 提交、取消、查看资源与历史账单，解释作业状态 | 集群 / 管理权限 |
| **Ray 任务、Actor 与弹性** · [Ray 官方集群概念](https://docs.ray.io/en/latest/cluster/key-concepts.html)；Cluster Key Concepts；Fault Tolerance；Autoscaling | 验证失败任务重试和资源约束，不遗留孤儿进程 | 集群 / 管理权限 |
| **拓扑、抢占与多租户隔离** · [Kubernetes 官方概念](https://kubernetes.io/zh-cn/docs/concepts/overview/)；调度、抢占和驱逐；安全 | 检查拓扑约束、驱逐恢复和租户访问边界 | 集群 / 管理权限 |

## 模型部署与生命周期

模块标识：`lifecycle`。先修：实验追踪与模型产物、评估、实验设计与鲁棒性、可靠性、安全与可观测性。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **模型签名、依赖与版本** · [MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)；MLflow Models；Model Registry | 用固定版本加载产物并验证输入 schema | 普通 CPU |
| **灰度、影子与回滚** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Release Engineering | 定义发布门槛并演练退回已知版本 | 集群 / 管理权限 |
| **在线质量、漂移与反馈** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：ML Operations at Scale | 区分输入漂移、标签延迟和服务故障 | 集群 / 管理权限 |
| **更新、退役与数据保留** · [MLflow 官方机器学习文档](https://mlflow.org/docs/latest/ml/)；Model Registry；Model Lifecycle | 记录旧模型依赖、回溯需求与删除条件 | 普通 CPU |
| **训练与在线特征的一致性** · [Feast 特征平台](https://docs.feast.dev/)；Architecture；Feature Retrieval | 验证同一实体和时间点的特征定义与回填语义 | 普通 CPU |

## 安全、隐私与治理

模块标识：`privacy`。先修：数据管线与可复现训练、可靠性、安全与可观测性、软件工程与可测试交付。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **身份、权限与密钥** · [Kubernetes Security](https://kubernetes.io/zh-cn/docs/concepts/security/)；认证；鉴权；RBAC；Secret | 检查未登录、错误凭据和撤销后的访问均被拒绝 | Linux |
| **租户、网络与工作负载边界** · [Kubernetes Security](https://kubernetes.io/zh-cn/docs/concepts/security/)；Pod 安全；网络策略；多租户 | 验证跨租户访问被阻止，说明容器不是恶意代码万能沙箱 | 集群 / 管理权限 |
| **依赖、镜像与供应链** · [Kubernetes Security](https://kubernetes.io/zh-cn/docs/concepts/security/)；应用安全；安全检查清单 | 固定依赖及镜像来源，核对扫描与更新流程 | Linux |
| **数据许可、PII 与审计** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Security & Privacy；Responsible AI | 为输入、日志、检查点建立访问和保留规则 | 阅读与推导 |
| **数据投毒、模型输出与滥用** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Robust AI；Security & Privacy | 分析威胁路径并用受控输入验证防护 | 普通 CPU |

## 容量、成本与能源效率

模块标识：`sustainability`。先修：性能剖析与端到端基准、可靠性、安全与可观测性。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **容量、排队与利用率** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Software Engineering in SRE；Capacity Planning | 按到达率、耗时与失败预留估算容量 | 阅读与推导 |
| **总成本与租赁选择** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Sustainable AI | 比较按时与包月，计入闲置、磁盘、流量和恢复成本 | 阅读与推导 |
| **功率、能量与有效工作** · [NVIDIA DCGM 功能指南](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)；Job Statistics；Field Metrics | 区分瞬时功率和累计能量，说明设备计量缺口 | 单卡 GPU |
| **碳、质量与服务目标** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume II：Sustainable AI；Responsible AI | 给出可解释的质量、成本和能耗约束，标注估算假设 | 阅读与推导 |

## 检索、向量索引与 RAG 系统

模块标识：`retrieval`。先修：数据库、索引与存储系统、数据管线与可复现训练、推理服务与性能。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **Embedding、距离与精确检索** · [Faiss 相似度搜索](https://faiss.ai/)；What Is Similarity Search；Flat Indexes | 比较 L2 与内积、归一化影响，建立精确检索基线 | 普通 CPU |
| **IVF、HNSW、PQ 与 ANN** · [Faiss 相似度搜索](https://faiss.ai/)；Research Foundations；Guidelines to Choose an Index | 绘制召回、延迟和内存权衡，避免只报 QPS | 普通 CPU |
| **索引构建、更新与元数据** · [Faiss 相似度搜索](https://faiss.ai/)；Index IO；Index Factory；ID Mapping | 验证版本更新后 ID 与原文一致，测试重复与删除 | 普通 CPU |
| **切分、召回、重排与生成** · [Retrieval-Augmented Generation 原始论文](https://arxiv.org/abs/2005.11401)；原始 RAG 论文：检索—生成模型与实验；切分和重排作为后续工程复核 | 分开评估检索召回、证据相关性和回答质量 | 单卡 GPU |
| **权限过滤与检索泄漏** · [Kubernetes Security](https://kubernetes.io/zh-cn/docs/concepts/security/)；认证与鉴权；多租户。将访问控制原则迁移到检索，原文不提供 RAG 文档过滤实现 | 在检索前后验证文档权限，不把提示词当访问控制 | 普通 CPU |

## 边缘、移动与异构部署

模块标识：`edge`。先修：模型结构与计算工作负载、低精度、量化与模型压缩、加速器与数据中心架构。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **模型导出与算子兼容** · [ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)；Exporting Models；Supported Features | 核对导出前后数值和动态形状约束 | 普通 CPU |
| **委托后端与硬件划分** · [ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)；Backends；Backend Delegation | 记录哪些算子落在设备、哪些回退 CPU | 指定目标设备 |
| **设备内存、量化与布局** · [ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)；Memory Planning；Quantization | 量测峰值和启动耗时，核对量化质量 | 指定目标设备 |
| **设备封装、更新与功耗** · [ExecuTorch 部署指南](https://docs.pytorch.org/executorch/stable/index.html)；Running on Device；Android/iOS Guides | 在实际设备记录冷启动、持续负载与回滚 | 指定目标设备 |

## 多模态与其他模型系统

模块标识：`multimodal`。先修：模型结构与计算工作负载、数据管线与可复现训练、评估、实验设计与鲁棒性。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **图像、音频与视频预处理** · [动手学深度学习](https://zh.d2l.ai/)；计算机视觉；数据预处理 | 核对形状、采样率、归一化与批处理成本 | 普通 CPU |
| **ViT、跨模态注意力与生成** · [Stanford CS336](https://cs336.stanford.edu/)；2026 Lecture 17：Alignment and Multimodality | 分解编码器、投影和解码的计算与内存需求 | 单卡 GPU |
| **多模态输入与服务调度** · [SGLang 推理文档](https://docs.sglang.io/)；Multimodal Models；Serving | 控制输入大小并测量编码和解码尾延迟 | 单卡 GPU |
| **非文本质量与系统约束** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume I：Network Architectures；Benchmarking | 同时记录任务质量、时间分辨率、延迟与存储成本 | 单卡 GPU |

## 端到端 AI 系统设计与复核

模块标识：`system-design`。先修：分布式训练系统、推理服务与性能、集群调度与资源管理、模型部署与生命周期、安全、隐私与治理。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
| **需求、约束与工作负载** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Service Level Objectives；Capacity Planning | 把用户目标写成容量、质量、延迟和预算约束 | 阅读与推导 |
| **数据—训练—服务链路** · [Machine Learning Systems](https://mlsysbook.ai/)；Volume I：ML Workflow；Volume II：ML Operations at Scale | 画端到端数据和控制路径，说明责任和版本边界 | 阅读与推导 |
| **瓶颈、扩展与故障域** · [Stanford CS336](https://cs336.stanford.edu/)；Systems；Parallelism；Inference | 根据测量选择方案，给出成本及失败条件 | 多卡 GPU |
| **设计评审、恢复与交付** · [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)；Release Engineering；Disaster Recovery | 从空环境复现、注入故障、恢复并提交证据 | 集群 / 管理权限 |

## 如何维护这份清单

修改 `site/catalog.json` 中节点的 `topics`，同步主资源、先修和覆盖审查，再运行 `node scripts/knowledge-index.mjs`。覆盖检查会拒绝没有来源、章节、产物或环境的条目，并核对本文与目录一致。自动检查只能验证结构；来源是否适合知识点、先修是否充分以及实验是否有效仍须人工审查和真实运行。
