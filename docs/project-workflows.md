# 原课项目：从准备源码到运行自己的作品

这里补齐五个原课入口的实际操作。`prepare` 获取固定版本的原作者起始代码或建立空项目；`check` 执行实际检查，未实现、缺少环境、跳过测试都会保留失败记录。**取得起始代码不等于完成作业**。不用本站的参考通过记录代替自己的实现。

所有命令在本站源码目录运行，使用 Node 22+ 和 Python 3.10+；建议 Python 3.12。先运行 `node scripts/project.mjs --help`。`plan` 只显示来源、版本、体积和条件，既不下载也不安装。默认作品放在 `workspaces/`，不会上传到本站；已有目录拒绝覆盖。可用 `--directory` 指定自己新建的作品位置。

`labs/projects.json` 固定原始提交和 SHA-256。归档大小、哈希、解压路径检查通过才交付工作目录；已有个人作品不会被更新覆盖。源码获取需要网络，已下载的固定归档可传入 `--archive` 重用。所有课程环境单独准备，工具不自动安装包、改变驱动、购买算力或向官方评分服务提交。

## CS50 Python：自行设计最终项目

不确定命令应该在哪台机器执行时，先看[实验与环境对应表](environment-preparation.md#按实验选择)。CPU 作业、Linux 工具链和 GPU 作业分别准备，不要求一开始租用所有设备。

依据 [CS50 最终项目原题](https://cs50.harvard.edu/python/project/)，先明确一个真实需求，再自行设计功能、错误处理与用户流程。原题要求 `project.py` 的 `main`、至少三个额外顶层函数，以及 `test_project.py` 中对应的 `test_函数名` 测试；保留 README、依赖和自己的演示。本站结构检查只是补充检查，不能代替原题的视频、设计或官方提交。

```sh
node scripts/project.mjs python-project plan
node scripts/project.mjs python-project prepare
```

准备结果是故意未实现的文件；在里面写自己的程序和测试。Windows 安装这项小型测试依赖：

```powershell
.venv-labs/Scripts/python.exe -m venv workspaces/python-project/.venv
workspaces/python-project/.venv/Scripts/python.exe -m pip install -r workspaces/python-project/requirements.txt
node scripts/project.mjs python-project check
```

Linux/macOS 把第一项解释器换为 `python3`，随后用 `workspaces/python-project/.venv/bin/python`。检查先核对结构，再实际执行 pytest；只有结构齐备、至少一个实际测试、无失败且无跳过才报告通过。作品需求是否解决、测试是否充分、README 和演示仍需独立复核，不能只增加三个空函数和无断言测试。

## OSTEP：并发 MapReduce 库

选定原作者 [OSTEP concurrency-mapreduce](https://github.com/remzi-arpacidusseau/ostep-projects/tree/76cff3f89f4bf337af6e02e53a831b7eeb1396df/concurrency-mapreduce)，而不是笼统指向整个项目仓库。先修 C、函数指针、线程、互斥、内存所有权和文件 I/O。起始目录只获取原始 README 与 `mapreduce.h`，约 13 KB；没有附带实现。原仓库未发现独立许可证，因此这两份原文件保留在个人目录，不打包到本站公开源码。

```sh
node scripts/project.mjs ostep-project plan
node scripts/project.mjs ostep-project prepare
node scripts/project.mjs ostep-project check
```

阅读工作目录 README，自行编写 `workspaces/ostep-project/mapreduce.c`，实现原 API。`check` 调用 gcc，使用 C11、`-Wall -Wextra -Werror -O2 -pthread`，把自己的文件和本站测试客户端链接为真实可执行程序。Linux/macOS 可使用支持 pthread 的编译器；Windows 需要具备 pthread 的 MinGW 工具链，只有一个 `gcc` 命令并不能保证兼容。其他 OSTEP 进程/内核实验仍需相应 Unix 环境。

检查是明确标注的**补充检查**，因为这个原项目没有公开完整评分测试：空文件、单文件、多个输入、自定义分区与分区内 key 顺序、实际 mapper 重叠、key/value 生命周期；每项重复三次。词频由 Python 独立计算，另检查每个输入只调度一次、mapper 数量上界、重复 reduce、线程重叠和超时。测量包含进程启动和文件 I/O；通过这些案例不证明线程安全或无泄漏。原作者还要求内存检查和性能评估，Linux 上应另做 Valgrind/线程检查、压力负载和资源释放解释。

## DLSys：从 HW0 到张量框架

依据 [DLSys 原课](https://dlsyscourse.org/) 与教师的 [HW0](https://github.com/dlsyscourse/hw0)、[HW1](https://github.com/dlsyscourse/hw1)、[HW2](https://github.com/dlsyscourse/hw2)。三个部分各有固定提交，每份源码含原 MNIST 输入，约 11–12 MB；按需准备单个部分，不必一次下载全部。尚未接入 HW3/HW4 的完整构建与 GPU 后端，不能把这里的三个部分称为全课程已复现。

```sh
node scripts/project.mjs needle plan --part hw0
node scripts/project.mjs needle prepare --part hw0
node scripts/project.mjs needle prepare --part hw1
node scripts/project.mjs needle prepare --part hw2
```

Windows 创建独立的 CPU 课程环境：

```powershell
.venv-labs/Scripts/python.exe -m venv workspaces/needle-hw0/.venv
workspaces/needle-hw0/.venv/Scripts/python.exe -m pip install numpy==2.2.6 pytest==9.0.2 numdifftools==0.9.41 pybind11==3.0.1 "mugrade @ https://codeload.github.com/dlsyscourse/mugrade/zip/717e300a5c2ddc0c729746946f8dc9f0d1c0ecea"
node scripts/project.mjs needle check --part hw0
node scripts/project.mjs needle check --part hw1 --python workspaces/needle-hw0/.venv/Scripts/python.exe
node scripts/project.mjs needle check --part hw2 --python workspaces/needle-hw0/.venv/Scripts/python.exe
```

Linux/macOS 使用 `python3 -m venv workspaces/needle-hw0/.venv`，解释器为该目录下的 `.venv/bin/python`；其余 pip 参数相同。`mugrade` **不是 PyPI 包**，来源和固定提交来自教师仓库。安装它是因为原本地测试导入该模块；本站不会调用在线 `submit`，也不需要评分 API key。原课在线评分可能要求在校账号，与本地 pytest 不同。

检查器保留原始测试，配置每份作业的 `PYTHONPATH`，实际运行整个 `tests` 并保存 JUnit。起始 TODO 尚未实现，失败是正常结果。HW0 的 C++ 检查还需要原 `Makefile` 指定的 pybind11 扩展；Linux 在作业目录使用同一环境的 Python 与 `make` 编译。原 Makefile 使用 `.so` 和 POSIX 参数，不能把它直接当作 Windows `.pyd` 构建命令；未编译的 C++ 部分不会因为 Python 部分通过而被忽略。不要改原测试来绕过失败。

Ubuntu 24.04 上已实际验证这三份固定起始代码的环境、HW0 扩展编译及完整测试执行。环境可运行，未实现作业仍失败；版本、日志和具体结果见[Linux 原课环境记录](verification.md#linux-原课环境)。这不代表学习者自己的实现通过。

阅读原 notebook 的题目与接口，独立完成后检查广播/形状、梯度、网络/优化器与数据加载，再做规模、内存和性能对照。本站不会输出作业答案，不声称已经替学习者完成原 HW。

## MIT 6.5840：实际 Raft 实验

依据 [2026 Lab 1 源码准备](https://pdos.csail.mit.edu/6.5840/labs/lab-mr.html)、[Go 环境要求](https://pdos.csail.mit.edu/6.5840/labs/go.html)与 [Lab 3 Raft](https://pdos.csail.mit.edu/6.5840/labs/lab-raft1.html)。**2026 版是 `src/raft1`、`make raft1`，不能照搬旧版 `src/raft` 命令。**工具固定原服务器提交 `513cac0aef010750fc74688da8a395974a83cf7a`，保留 Git 历史，原始入口使用原课的 Git 协议。

```sh
node scripts/project.mjs raft plan
node scripts/project.mjs raft prepare
node scripts/project.mjs raft check
```

运行需要 Linux 或已有 WSL2、Go 1.22+、make 和供竞态检测使用的 C 编译器。Windows 原生命令行会明确失败；工具不会安装 WSL、发行版或 Go。固定源码及原 `make raft1` 已在 Ubuntu 24.04 CI 实际执行，环境验证通过，起始实现仍失败，详见[Linux 原课环境记录](verification.md#linux-原课环境)。本机 Windows 尚未安装 Linux/WSL2；云端结果不改变本机的运行条件。

按原题独立完成 `src/raft1/raft.go`，在作品的 `src` 下先使用 `make RUN="-run 3A" raft1` 定位第一部分，然后 `make raft1` 跑完整目标；本站 `check` 调用同一完整目标，保存原日志并核对实际 Go 测试通过行及退出码。继续按原课完成 3B/3C/3D、上层 KV 和分片，重复故障场景与 `-race`；这些更深部分不会被本站一次 Raft 命令自动标记为掌握。AOSA 共识模拟器与此独立实验分别记录。

## CS336：依赖隔离与实际原测试

固定 A1 的 Linux CPU 环境已实际按上游锁安装并执行原测试，环境就绪与作业完成分别记录，见[原课实测](verification.md#cs336-a1-与文件恢复)。A2 的 GPU/多卡条件仍需对应设备，不能沿用 A1 的 CPU 结果。

依据 [Stanford CS336](https://cs336.stanford.edu/)、[A1 原仓库](https://github.com/stanford-cs336/assignment1-basics)与 [A2 原仓库](https://github.com/stanford-cs336/assignment2-systems)。本次分别固定 `a158843b…` 与 `ca8bc81a…`；完整 SHA、归档体积和指纹在 `plan` 中可核对。当前两个项目都要求 Python 3.12/3.13、PyTorch `~=2.11.0`，与本站 `.venv-labs` 的 2.10 GPU 检查不同，必须隔离。

```sh
node scripts/project.mjs systems plan --part a1
node scripts/project.mjs systems prepare --part a1
node scripts/project.mjs systems prepare --part a2
```

先阅读作品中的 README、作业 PDF、`AGENTS.md` 与 `pyproject.toml`，遵守原课学术政策，自行实现并连接 `tests/adapters.py`。准备 [uv](https://docs.astral.sh/uv/getting-started/installation/)，在相应作品目录手动执行 `uv sync --frozen`。这一步可能下载不同的 PyTorch 与大量依赖，应先核对自己的磁盘、平台、预算和许可；工具没有替你执行安装。后续从本站目录运行：

```sh
node scripts/project.mjs systems check --part a1
node scripts/project.mjs systems check --part a2
```

`check` 用 uv 已创建的 `.venv` 解释器执行 `python -m pytest tests` 并记录 JUnit；与原课环境中的 pytest 相同，同时避免运行时的隐式 Python/依赖下载。没有独立环境时明确失败。A2 还需要原课支持的 GPU/Triton/分布式环境；8 GB 显存不足以保证所有工作负载可执行。训练数据和大模型不会自动下载。A3–A5 尚未接入源码工具，仍按[高级原课实验](advanced-labs.md)进入原题，不能把 A1/A2 起始代码准备成功称为全部 CS336 完成。

## 阅读结果、保留作品与故障定位

`check` 写入 `artifacts/course-项目-时间戳.json`、原始 `.log` 和 pytest `.xml`。缺少环境返回 1 并写失败记录；原测试失败、零测试或任何跳过均不会报告完整通过。准备失败也返回非零，并保留已有作品；网络失败时可以重试，已经准备的目录不应再次执行 `prepare`。课程执行记录不是本站六项实验的报告，暂不导入其里程碑；在知识节点提交代码、设计、执行记录和原理说明。

原测试的指纹保存在作品 `.project-source.json`，变更测试会拒绝继续；CS336 明确要求学习者填写的 `tests/adapters.py` 除外。自己新增边界测试可以另建文件。指纹是复现辅助，不是防作弊签名。运行、编译和测试作品使用本地用户权限，没有安全沙箱，勿执行不信任的代码。保留自己的 README、版本锁、测试、日志、性能协议、失败原因和设计解释；个人作品不随本站发布。
