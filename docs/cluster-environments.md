# 集群环境：从隔离验证开始

适用于已经理解 Linux、进程、容器和网络，准备学习资源调度与故障恢复的人。先阅读 [Kubernetes 中文概念](https://kubernetes.io/zh-cn/docs/concepts/)和 [Ray Core](https://docs.ray.io/en/latest/ray-core/walkthrough.html)。这里使用真正运行的控制面、工作节点和远程任务；所有容器位于同一台 CPU 主机，不能据此推断跨机可靠性或 GPU 扩展性能。

## 先准备什么

使用专门的 Linux amd64 实验机，建议至少 4 核、16 GB 内存和 20 GB 空闲磁盘，已安装 Docker Engine。Kubernetes 流程还需 kind 0.33.0 和 kubectl 1.37.0。镜像首次下载可能数 GB；学校热点下先读和做计划，等网络合适再执行。已有 GitHub 标准 Linux runner 可以复验仓库工作流，不能用作常驻个人服务器。

Docker 操作权限接近宿主管理员权限。只在自己的隔离实验机执行，不在学校公共服务器或已有业务节点操作。脚本不会读取当前 Kubernetes 上下文，而是在本次私有目录写独立 kubeconfig，使用随机集群名称；不把 kubeconfig 上传为报告。

版本、镜像摘要和官方来源保存在 `labs/cluster-validation/versions.json`。kind 安装依照[官方快速开始](https://kind.sigs.k8s.io/docs/user/quick-start/)，kubectl 依照[官方 Linux 安装说明](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)；选择上面固定的版本。仓库工作流给出对应下载与哈希核验过程。Ray 使用固定摘要的官方 CPU 镜像，不向当前系统 Python 安装全部框架依赖。

## 查看计划

先取得本站源码，在项目根目录的 Linux 终端运行。下列命令只打印条件和版本，不安装工具或启动服务：

```sh
python3 scripts/check-cluster-environment.py kubernetes
python3 scripts/check-cluster-environment.py ray
```

确认自己处于实验机、Docker 可用、磁盘和网络满足条件，再添加 `--run`。它会下载缺少的固定镜像、创建临时集群、实际发出请求并注入故障，结束后删除本次创建的容器集群。镜像缓存保留，便于下次重用。

## Kubernetes

```sh
python3 scripts/check-cluster-environment.py kubernetes --run
```

验证依次建立一个控制面和两个工作节点，创建独立 namespace 与只读 ServiceAccount，确认能读 Pod 但不能读 Secret。随后运行分布在两个工作节点上的非 root HTTP 副本，检查就绪探针、Service 和 DNS；删除一个 Pod 后核对新 UID 与服务恢复。

配额检查故意提交超出 CPU 预算的 Pod，应由 API 拒绝。发布检查将新副本改为退出码 23 的故障程序，确认它实际执行且 rollout 失败，再回滚到原版本并重新请求服务。这些拒绝是测试预期；若脚本把错误请求接受或没有恢复，整次检查失败。

成功时 `artifacts/kubernetes-cluster-results.json` 中 `passed` 与 `cleanupPassed` 均为 `true`。逐条命令与退出码在同名前缀的 `log.json`。这不包含多控制面高可用、CNI NetworkPolicy、持久卷备份、云负载均衡或 GPU 调度验收；继续相应任务时按原文单独设计检查。

## Ray

```sh
python3 scripts/check-cluster-environment.py ray --run
```

两个独立容器在本次 Docker 网络中分别运行 head 与 worker，不向宿主公开服务端口。脚本确认两个真实节点注册，用 `STRICT_SPREAD` placement group 在不同节点执行任务，核对结果与节点 ID。然后终止一个 actor，要求新进程从应用检查点恢复计数，再继续更新；错误远程任务必须将异常传回调用者。

成功报告是 `artifacts/ray-cluster-results.json`。记录 Ray 版本、两个节点、检查项与清理结果；不能把 actor 重建理解为业务状态自动持久化。此例由应用主动写检查点，Ray head 失效、对象存储重建、跨机网络故障、GPU 和大规模数据作业仍按各自要求验证。Ray 管理接口能够执行代码，只放在受信网络；容器不对外发布端口并不构成完整多租户隔离。

## 失败与恢复

工具缺失会在创建资源前退出。镜像拉取失败先检查错误信息、出口和剩余磁盘；不要换成未记录的 `latest` 标签绕过固定版本。节点未就绪时查看报告中的 kind 创建输出。远程任务未完成时查看 Ray 容器日志，区分资源不足、注册失败和应用异常。

脚本使用有上限的等待，并在失败后清理自己创建的随机名称资源。`cleanupPassed: false` 表示清理未确认完成；日志包含资源名，应只处理该次资源，不能执行删除所有容器或所有集群的命令。运行被宿主强制断电或直接杀死时，Python 的退出清理可能没有机会执行，重连后同样先按记录清点。

公开上传只包含两份结果/日志 JSON，不包含 kubeconfig、Ray 应用检查点或其他实验目录。它们是环境复验材料，不能导入学习页面冒充独立作品报告。自己的作品还需设计、实现、测试、性能测量与原理解释。
