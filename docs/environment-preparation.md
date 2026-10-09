# 做到这里，再准备实验环境

面向第一次安装编程工具、连接 Linux 或租用 GPU 的学习者。先找到当前实验对应的一行，再准备所需环境。阅读课程、推导公式和保存网站进度不需要服务器；本机已经满足条件时可以直接使用。本指南解释选择和检查方法，具体作业沿用原课要求。

## 先认清三个位置

| 位置 | 在这里做什么 | 内容保存在哪里 |
| --- | --- | --- |
| 学习网站 | 阅读资料、填写成果、导入报告 | 当前浏览器；用“备份进度”导出 |
| 本机终端 | 执行本机程序，或用 SSH 连接远程机器 | 本机磁盘 |
| 远程终端或 Notebook | 执行云端程序，使用云端 CPU/GPU | 远程磁盘；需要另外备份 |

“在终端运行”不是把代码填进网站成果框。Windows 通常打开 PowerShell；Linux 和 macOS 打开终端。SSH 连接后，同一个窗口的后续命令运行在远程机器上；输入 `exit` 退出远程 shell 后才回到本机。JupyterLab 是编辑和运行 Notebook 的工具，不是显卡，也不会自动安装每门课程的依赖。

## 按实验选择

| 本站实验 | 起步环境 | 何时需要额外准备 | 完整操作 |
| --- | --- | --- | --- |
| Indoor Voice | 本机 CPU、Python 3.10+、Node 22+ | 首次编程时，不需要 GPU | [第一次编程与检查](getting-started.md#2-完成第一项编程练习) |
| 对象模型 | 本机 CPU、Python 3.10+、Node 22+ | 无第三方 Python 依赖 | [对象模型实验](object-model-lab.md) |
| DBDB、共识模拟 | 本机 CPU 与独立 Python 环境 | 分别准备文件锁与语法兼容依赖 | [DBDB](dbdb-lab.md)、[共识](consensus-lab.md) |
| micrograd | CPU 版 PyTorch 即可 | 原测试用 PyTorch 对照梯度；无需先买显卡 | [自动微分实验](micrograd-lab.md) |
| CS50 最终项目 | CPU、Python 与 pytest | 在自己的作品环境安装项目依赖 | [原课流程](project-workflows.md#cs50-python自行设计最终项目) |
| OSTEP MapReduce | C11、gcc、pthread | Windows 编译器不具备 pthread 时，改用合适的 Linux 环境 | [原课流程](project-workflows.md#ostep并发-mapreduce-库) |
| DLSys | HW0–HW2 从 CPU 和 C++ 编译开始 | 后续 GPU 后端按原课版本另配 CUDA；不把全部作业混在一个环境 | [DLSys 流程](project-workflows.md#dlsys从-hw0-到张量框架) |
| MIT Raft | CPU、Go、原测试要求的工具链 | Go 版本和竞态检测支持需核对；不需要 GPU | [Raft 流程](project-workflows.md#mit-65840实际-raft-实验) |
| GPU 补充实验 | 支持目标 PyTorch 的 NVIDIA CUDA GPU | 核对实际显卡和驱动；普通云 CPU 不适用 | [GPU 实验](gpu-lab.md) |
| CS336 | 每份作业独立的固定环境 | A2 的 CUDA/Triton/多卡及其他完整负载以原题为准 | [CS336 流程](project-workflows.md#cs336依赖隔离与实际原测试) |

课后涉及真实服务、集群、编译器或其他设备的任务见[高级原课实验](advanced-labs.md)。小型参考程序通过，不代表对应的完整方向工程已经验收。

## CPU

CPU 是普通处理器；前面的 Python、算法、数据库、共识和小型自动微分实验都可先在普通电脑完成。先按[入门教程的环境步骤](getting-started.md#6-准备独立实验环境)创建 `.venv-labs`，在项目目录运行 `scripts/doctor.py` 检查解释器和依赖。虚拟环境把项目依赖放在独立目录，避免互相覆盖，原理见 [Python venv 官方文档](https://docs.python.org/3.12/library/venv.html)。

Windows 的解释器通常是 `.venv-labs/Scripts/python.exe`；Linux/macOS 是 `.venv-labs/bin/python`。它们是不同系统的安装产物，不能直接复制虚拟环境目录来迁移。保存依赖清单，在目标机器重新创建环境。

成功标志是解释器版本正确、当前实验的导入检查成功，再执行指南中的参考复现或自己的作品检查。`ModuleNotFoundError` 先核对是否在同一个解释器下安装和运行，不要反复向系统 Python 安装全部依赖。课程起始 TODO 导致的断言失败应保留，不属于环境安装失败。

## Linux

Linux 实验环境可以是已有 Linux 电脑、支持要求的 WSL2，或自己租用的远程 Linux。安装 WSL2 会改变系统并下载发行版；没有做 Linux 实验时无需提前安装。网络较慢时也可以在云端安装课程依赖，浏览器和 SSH 传输的是编辑内容、输出与报告。

先在目标 Linux 终端确认自己所在的位置和工具版本；以下命令只读取信息：

```sh
pwd
whoami
uname -m
python3 --version
node --version
```

`pwd` 是当前目录，`whoami` 是账户，`uname -m` 是处理器架构。本站命令需要 Node 22+；私有 Notebook 启动器使用 Python 3.12。版本不足或命令不存在时先安装对应工具，再运行作业；不要把系统自带版本默认视为兼容。安装入口见 [Node.js 官方下载](https://nodejs.org/en/download)、[Ubuntu Server 文档](https://documentation.ubuntu.com/server/)与目标课程指南。

需要浏览器编辑器时继续[从零连接个人云端实验室](private-cloud.md)。无需将学习网站部署到自己的机器，也不要把个人作品或访问令牌放进公开站点。

## GPU

GPU 是计算设备，显存是它存放张量的空间。运行 CUDA 课程需要兼容的 NVIDIA GPU 和驱动；增加 CPU 内存不能替代显存。买模型 API 次数也不能获得可运行 CUDA 内核的实验机。

进入实际运行程序的机器后，先执行 `nvidia-smi`。应看到设备名称、显存和驱动；它显示的 CUDA 版本表示驱动能力，不等于当前 Python 已安装对应 PyTorch。再用当前课程解释器核对 `torch.cuda.is_available()`、`torch.__version__` 和 `torch.version.cuda`；操作及安装依据见 [PyTorch 官方安装选择器](https://pytorch.org/get-started/locally/)与 [GPU 指南](gpu-lab.md)。不要因为没有本地 CUDA 编译器就重装驱动：是否需要编译器取决于是否编译扩展或内核。

CPU 版 PyTorch、显卡未映射进容器、驱动不兼容和选择了错误的虚拟环境，都可能导致 CUDA 不可用。先按上述顺序定位。显存不足时先按作业许可缩小测试批量并记录变化；不得缩小要求后宣称原负载通过。

## 多卡与集群

多卡任务至少需要相应数量的真实设备。先核对每张卡的显存、设备之间的连接和目标 NCCL/框架版本，再建立单卡基线、检查通信和训练等价性。两张 24 GB 显卡不自动变成一张 48 GB 显卡；模型如何切分由程序决定。

集群由多个节点组成。容器实例可能只允许操作自己的容器，无法管理宿主内核、GPU 驱动、Kubernetes 节点或 RDMA 网络。租用前将目标任务的权限和网络条件逐条与产品说明核对。没有对应硬件时可以阅读、推导和设计，但不能把模拟输出当成设备测量。

进入调度方向后，可先用[隔离的 Kubernetes 与 Ray 环境](cluster-environments.md)检查真实 CPU 节点、权限、远程任务和故障恢复。该流程在单台 Linux 主机运行容器节点，先确认 Docker 权限、内存、磁盘及镜像下载条件；它不会产生 GPU 或跨机性能证据。

## 目标设备

ROCm、TPU、NPU、手机和边缘设备各有兼容矩阵。先从任务给出的原厂文档确认型号、操作系统、算子和数据类型，再安装工具链；不要假设 CUDA 二进制可在其他厂商设备运行。学习这些方向不要求一开始同时购买所有设备。

## 每次结束实验

1. 保存源代码、Notebook、报告和依赖版本；不要只截一张成功画面。
2. 记录执行位置、版本、命令、输入规模和失败原因。远程生成的报告先下载到本机，再在网站导入支持的 JSON。
3. 将作品备份到另一处，并在新目录抽查恢复。网页进度备份不包含远程源代码或模型文件。
4. 关闭程序和 SSH 后，如果租用云算力，还要去控制台核对实例状态、租期、存储和账单。关掉网页不会停止云费用。

云端完整关闭与恢复流程见[个人云端实验室](private-cloud.md#撤销与恢复)。这些准备和排错本身就是工程学习的一部分；每次只增加当前任务确实需要的工具。
