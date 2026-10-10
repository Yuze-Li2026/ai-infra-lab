# 推理服务与编译器：独立 CPU 环境

适用于学到推理部署或编译器方向的学习者。先理解模型、张量形状、Linux 进程和容器，再按当前方向选择一个环境。这里验证真实推理请求和编译产物执行，CPU 结果不能替代 CUDA、多卡、生产负载或完整原课程验收。

## vLLM 推理服务

需要专用 Linux amd64 机器、Docker、AVX2 或 AVX512、至少 16 GB 内存与 20 GB 空闲磁盘。依据 [vLLM CPU 安装文档](https://docs.vllm.ai/en/stable/getting_started/installation/cpu/)检查实际 CPU 指令集。官方 CPU 镜像约 1.57 GB 压缩数据，[固定模型的文件清单](https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca)列出约 1.5 GB 权重，解压与运行还需额外磁盘；先确认下载条件。该流程不安装显卡驱动。

使用固定摘要的 vLLM 0.31.0 CPU 镜像，模型为 Qwen 团队公开的 [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)，固定提交 `c1899de289a04d12100db370d81485cdf75e47ca`，模型许可 Apache-2.0。不下载浮动 `main`，不启用远程自定义代码，也不需要模型 API 付费账号；原模型服务的访问条件仍以上游为准。

在项目根目录先查看只读计划：

```sh
python3 scripts/check-inference-environment.py
```

确认专用机器、资源和下载条件后执行：

```sh
python3 scripts/check-inference-environment.py --run
```

脚本创建本次容器和独立权重缓存，端口只映射到宿主 `127.0.0.1`，用随机 API 密钥测试访问。它检查健康状态、匿名与错误密钥拒绝、正确密钥读取模型、顺序与双请求并发生成、错误模型拒绝、流式结束与结果一致。随后强制终止服务并重新启动，核对固定权重恢复后的推理。结束时删除本次容器与临时密钥文件，权重缓存保留在本次 `artifacts/infra-inference-*` 目录。

容器内存上限为 12 GiB，其中 KV cache 显式设置为 1 GiB，还需给权重、工作进程和首次执行的临时分配留出空间。健康检查通过只证明服务就绪，随后仍必须实际生成。

`artifacts/inference-results.json` 的 `passed` 和 `cleanupPassed` 都应为 `true`；`memory` 记录 cgroup 的实际占用、峰值、上限和 OOM 事件。错误信息、容器状态和经密钥遮盖的服务日志保存在 `artifacts/inference-log.json`。报告中的时间是少量集成请求的实测耗时，不能当成吞吐基准或服务承诺。生成结果用于核对系统行为，不据此声称模型知识正确。

启动失败先看 CPU 指令、内存和服务日志，再区分权重访问失败与框架错误。健康检查有截止时间；服务退出会立即报告失败。若日志显示重启成功但请求仍连接失败，用 [docker port](https://docs.docker.com/reference/cli/docker/container/port/) 查询当前映射；自动分配的宿主端口不能视为固定地址。脚本在首次启动和重启后都读取并核对回环映射，报告的 `bindings` 保存两次实际地址。显存不足不适用于这个 CPU 配置，宿主 OOM 则需降低本次实验内存需求或换符合条件的机器；修改后重新记录参数。不要将 API 密钥、缓存和日志原文放入公开网站。

这个命令负责完整复验并关闭服务，不会给学习网站挂接公共推理后端。[vLLM 服务参数](https://docs.vllm.ai/en/stable/cli/serve/)说明，API 密钥仅覆盖指定 API 路径，不能保护全部端点；本流程因此只映射回环地址，不能改成公网监听后只依靠该密钥。需要长期服务时，另行设计进程管理、TLS、全路径访问控制、限流、监控与费用；低价 CPU 的学习检查不代表高并发可用。

## MLIR 经 LLVM CPU 后端编译执行

使用 [IREE 官方编译器与运行时](https://iree.dev/reference/bindings/python/)处理 MLIR，并通过其 [LLVM CPU 后端](https://iree.dev/guides/deployment-configurations/cpu/)执行。先阅读 [MLIR Linalg dialect](https://mlir.llvm.org/docs/Dialects/Linalg/)和源码中的 `labs/compiler-validation/matmul.mlir`，解释输入与输出形状、初始化和矩阵乘法。

本流程固定 Linux x86_64、CPython 3.12、IREE 3.12.0；所列六个轮子的总下载量约 133 MB。依赖清单包含完整版本和该平台轮子的 SHA-256，安装时强制检查，不适用于直接照搬到 Windows 或其他 Python ABI。

在目标 Linux 的项目根目录创建独立环境后执行：

```sh
python3.12 -m venv .venv-compiler
.venv-compiler/bin/python -m pip install --require-hashes --only-binary=:all: -r labs/compiler-validation/requirements-linux-py312.txt
.venv-compiler/bin/python scripts/check-compiler-environment.py
```

脚本把实际 Linalg 矩阵乘法编译为 LLVM CPU 产物并保存，加载后使用五组固定种子输入与独立 NumPy 结果比较，另检验零输入、错误形状和无效 IR 拒绝。再建立新的运行时上下文，从磁盘读取产物并复跑，确认二进制可以重用。成功记录在 `artifacts/compiler-results.json`，VMFB 位于本次 `artifacts/compiler-*` 目录。

哈希不匹配应停止安装并核对版本、平台与来源，不删除 `--require-hashes`。编译错误先根据诊断查 IR 的操作、类型和形状；结果不一致时保留输入种子、误差、源码与产物哈希。这个检查没有完成 Toy 教程所有章节、编译器源码构建、动态形状、GPU 后端或优化性能研究，后续任务仍按原文进行。

## MLIR Toy 七章源码与原测试

面向已经学过 C++、AST 和 IR 的学习者。依据 [MLIR 构建说明](https://mlir.llvm.org/getting_started/)与 [Toy 原教程](https://mlir.llvm.org/docs/Tutorials/Toy/)，固定 LLVM 22.1.8、提交 `ca7933e47d3a3451d81e72ac174dcb5aa28b59d1`，许可为 Apache-2.0 WITH LLVM-exception。源码在执行时从官方仓库取得，本站不再分发整套 LLVM。

需要 Linux x86-64、Python 3.10+、Git、CMake、Ninja、Clang 与 lld，至少 16 GB 内存、30 GiB 空闲磁盘。源码获取和编译属于大下载、长时间任务；优先使用已有专用环境或仓库的免费公开 CPU 工作流。本机流量有限时不要直接执行构建。

在项目根目录查看计划，不下载或构建：

```sh
python3 scripts/check-toy-environment.py
```

环境和下载条件齐备后执行：

```sh
python3 scripts/check-toy-environment.py --run --jobs 2
```

`--jobs` 控制并行编译，范围 1–8，默认 2。命令只使用新建的 `artifacts/toy-*` 目录，保留源码与构建产物以便排错；不覆盖个人课程目录。构建开启 LLVM 断言，使用 X86 后端和 `-O1` 控制构建开销，不以这组参数评估编译器优化性能。

流程编译 `toyc-ch1` 至 `toyc-ch7`、FileCheck 与 CPU JIT 运行器，收集全部原测试，再比较收集结果、源文件清单和实际执行集合。任意缺失、失败、超时或不支持的测试均不能通过。结果写入 `artifacts/toy-results.json`，完整构建日志、原始 lit JSON 和收集清单分别保留；报告记录上游提交、工具版本、七个二进制 SHA-256 与逐章计数。

最近一次云端构建在 5,400 秒上限处超时，未进入原测试；见[实际运行记录](verification.md#050-之后的验证分支)。不能把本文命令或解析器回归当成已完成构建。失败先检查 `toy-build.log` 中第一个编译错误、磁盘与内存；收集不全时核对七章二进制和 JIT 条件，不过滤测试。修复后重新运行会保留前一次构建目录。原教程参考实现通过只证明环境与执行工具可用，个人作品仍须自己实现、解释和复核。

## 如何读取证据

环境报告只证明所列安装、执行与错误路径；课程成果还需要自己的实现和解释。报告不导入个人作品通过状态。云端工作流保留结果 JSON，推理额外保留已遮盖临时密钥的诊断；不上传模型权重、凭据文件或整个个人实验目录。当前具体成功/失败与提交见[验证记录](verification.md)及仓库 Actions。
