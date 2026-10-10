# 个人云端实验室

面向希望用浏览器做实验的学习者，以及需要自行配置的开源使用者。核对日期：2026-10-09。学习网站继续由 GitHub Pages 托管，学习记录保存在浏览器；租用服务器只运行个人实验环境。服务器安装 JupyterLab、课程依赖并保存作品，不需要迁移网站。复制本仓库不会获得网站所有者的实例、SSH 私钥或实验访问令牌。

## 本教程的范围

项目提供 Linux 上的 JupyterLab 启动器、OpenSSH 客户端配置示例和真实 Linux 集成检查。集成检查安装固定版本，启动 Jupyter 与独立 SSH 服务，验证认证、Python 执行、文件持久化、隧道和凭据撤销。具体是否通过以对应提交的 `Private laboratory access` 工作流为准。

免费 CI 检查工具本身；你选择的 GPU、供应商端口映射、宿主权限和计费规则仍要在自己的环境核对。私有环境投入使用前完成本文最后的检查，平台代码开源不等于公共算力服务。当前实际记录见[验证记录](verification.md)。

## 按课程选择长期实验环境

先确定课程需要的设备，再比较包年、包月与按量报价。普通 CPU 服务器是远程 Linux 学习的可选便利，不是网站运行的必需品，也不能代替 GPU。已经能在本机完成的实验无须重复购买算力。

| 学习任务 | 环境选择 | 购买前需要确认 |
| --- | --- | --- |
| Linux、Python、Git、Notebook、小型数据库和 CPU 练习 | 包年 Linux CPU 虚拟机；4 GB 内存仅作轻量起点，多个服务或编译优先比较 8 GB 以上配置 | 内存峰值、磁盘与流量额度、是否能升级、第二年及第三年费用 |
| CUDA、Triton、单卡训练与推理 | 兼容课程版本的 NVIDIA GPU；显存按具体模型和批量计算 | 显存、驱动、框架、CPU/内存、磁盘和镜像；不要只按显卡名称购买 |
| NCCL、训练分片和多卡恢复 | 同机至少两张支持课程要求的 GPU | 每卡显存、互联拓扑、通信权限与实际性能；两卡显存不会自动合并 |
| Kubernetes/Ray、宿主内核、多机通信与 RDMA | 具有相应权限的虚拟机、节点或集群 | 容器实例是否允许这些操作；普通 GPU 容器不保证具备宿主和网络权限 |

课程和设备对应关系见[逐项知识清单](knowledge-index.md)。最终配置要经过目标课程的安装、执行、保存、重启和恢复检查；不能凭套餐参数标为全部课程可用。

### 已核对的长期套餐候选

以下是公开信息，不是已购买订单。2026-10-09 核对后仍需以账号实际资格、库存和订单规则为准。

| 候选 | 官方公开信息 | 对本项目的适用边界 |
| --- | --- | --- |
| [腾讯云轻量应用服务器](https://cloud.tencent.com/act/pro/lhsale) | 4 核、4 GB、3 Mbps，新用户首年 109 元；页面也列出三年套餐 | 可供轻量 CPU 实验。活动实例不支持调整配置；续费按官网价格或续费活动，不能按 109 元推算每一年。三年总价、磁盘和流量需核对具体订单 |
| [阿里云 ECS 活动](https://www.aliyun.com/daily-act/ecs/activity_selection) | 2 核、2 GB、3 Mbps、40 GB ESSD Entry，页面列出续费 99 元/年、限购一台 | 内存较小，只作轻量练习候选，不作为全套课程环境；实际可购资格和后续活动期限需核对 |
| [AutoDL GPU 容器](https://www.autodl.com/docs/price/) | 支持按量及预付费，预付租期含日、周、月；具体 GPU 价格以库存页为准 | 适合 GPU 课程。预付租期无论开关机都会计时；需核对月份报价与目标课程，不把普通 CPU 套餐价格当成 GPU 预算 |

维护者比较的是同一设备条件下的总费用：计算、必要存储、备份、流量、续费和迁移。若按量与包月的其他费用相同，`包月价 ÷ 小时价` 是大致使用临界点；把每月实际使用时数与它比较。三年 CPU 总费用应使用首购、两次续费和额外费用的实际报价，不能将首年促销乘三。未取得报价时，保留未知项。

个人作品和环境定义长期保存；GPU 可以按学习周期购买。普通预付费不是永久买断，算力到期和作品保存要分别处理。费用确认后由维护者安装、设置访问、验证恢复和可用的停机机制；账号验证与支付由所有者在官网完成。密码、验证码和私钥不进入聊天或 GitHub。

### 学生使用腾讯云 GPU

以下信息于 2026-10-10 核对，适合间歇做 GPU 实验的学习者。先用已到账额度验证课程，再决定付费；资格、库存、赠送有效期和订单价格以自己的账号为准。不要提前购买还用不到的长期算力。

[Cloud Studio 机时计费](https://ide.cloud.tencent.com/docs/guide/billing/machine_time/how-to-purchase-compute-time/)列出 A10、20 核 CPU、116 GB 内存、24 GB 显存，按量价格为 3.3 元/小时。首次绑定腾讯云账号赠送 20 机时；这款 A10 每小时消耗 3.3 机时，全部用于它时约能运行 6.06 小时，不是 20 小时。[机时常见问题](https://ide.cloud.tencent.com/docs/guide/billing/machine_time/FQA/)另列出每日登录可领取 2 机时、7 日内有效，折合 A10 约 36 分钟；实际到账和可用条件须在资源管理中确认。

Cloud Studio 额度用完会自动转按量付费，不会自动停止。打开 IDE 即占用算力，未运行程序也会消耗机时；关闭所有相关标签页后通常还需约 10 分钟释放。用完应在“应用管理”选择“停止使用”，核对状态及剩余额度。账单约有 2 小时延迟，不能仅凭暂时没有扣费通知判断已停止，见[机时介绍](https://ide.cloud.tencent.com/docs/guide/billing/machine_time/compute-time-introduction/)。不要把赠送额度视为不会产生后续费用的上限。

领取后先打开右上角账户菜单，查看“算力资源包使用情况”的已使用量和总量；绑定成功不等于赠送额度已经到账。各资源包有效期仍需分别核对，不能从总机时推断。若旧资源管理地址跳回账号设置，可先用这个菜单确认总量，不必为排查领取提示而充值。

按[官方创建流程](https://ide.cloud.tencent.com/docs/guide/product_use/application/create-application/)，确认模板后会直接进入工作空间；此时就可能开始消耗机时。进入后先将应用设为非公开，核对成员与预览访问权限，再放入个人作品。模板卡片中的 PyTorch/CUDA 版本仅供初选，实际版本、驱动和 GPU 必须在运行环境核对；不能把选中模板当作课程环境已就绪。

[HAI 学生优惠](https://cloud.tencent.com/act/pro/hai-edu)提供半价现金券，每档每月限购一张，购买后 30 天有效。优惠页面列出 30 元面额约能抵扣 8 小时 GPU 进阶型；实际支付价、适用套餐与资格需在登录后的订单核对，不能把券面额直接当作支付金额。券抵扣完仍可能产生按量费用。

[HAI 套餐](https://cloud.tencent.com/document/product/1721/112699)按性能档位提供硬件，不支持指定型号；进阶型既列有对标 A10 的 24 GB 档，也有对标 V100 的 32 GB 档。显存更大不等于架构适合课程。当前课程使用的 [Triton 3.6](https://github.com/triton-lang/triton/tree/v3.6.0#compatibility)要求 Linux 与 NVIDIA 计算能力 8.0 以上，必须核对实际分配的 GPU、驱动和课程依赖。HAI 关机后算力停止计费，默认 80 GB 云盘仅前 15 天免费保留，之后有闲置费用；扩容盘持续计费，见[关机规则](https://cloud.tencent.com/document/product/1721/102027)。

单卡 A10 适合单卡 CUDA 与符合版本条件的 Triton 实验，不能完成真实双卡 NCCL 验收。容器或云端 IDE 也不自动具备宿主内核、集群和跨机网络权限。本节记录公开规格与计费规则，不作为个人实例的交付记录。创建应用后仍须实际核对设备，并完成运行、保存、恢复、访问控制和停止计费检查。

### 存储与免费验证

[AutoDL 数据盘说明](https://www.autodl.com/docs/local_disk/)明确本地盘不提供冗余副本，付费扩容在关机时也可能继续计费；停止程序、关闭 SSH、实例关机和释放实例是不同操作。释放前要先备份并抽查恢复，定时关机也不能替代账单核对。长期环境靠版本清单和备份恢复，不依赖实例永不回收。

[GitHub Actions 标准公共仓库 runner](https://docs.github.com/en/billing/concepts/product-billing/github-actions)已经用于本项目的 Linux/Windows 验证，主要下载发生在云端。它是项目 CI，不作为个人常驻交互工作站。[ModelScope Notebook](https://www.modelscope.cn/docs/notebooks/intro)可作为额外免费练习候选；本轮公开文档未能确认当前账号配额与双卡条件，因此不把历史赠送时长当作长期保证，也不将它设为必需依赖。

## 为什么开源后别人不能直接使用你的实例

访问使用两道已有机制：OpenSSH 验证持有私钥的人；Jupyter Server 验证随机令牌并保留跨站请求保护。Jupyter 监听 `127.0.0.1`，只通过当前电脑的 SSH 隧道访问，不把实例执行端口嵌入公开网页。机制依据见 [OpenSSH](https://man.openbsd.org/ssh)和 [Jupyter 安全文档](https://jupyter-server.readthedocs.io/en/latest/operators/security.html)。

SSH 私钥保存在本机受保护的位置，服务器只保存公钥。Jupyter 的令牌和 cookie 签名密钥由每次部署独立生成，存放在服务器上权限为 `0700` 的私有目录，文件为 `0600`。公开仓库没有默认密码、共用密钥或付费平台 API token。`.private/` 被 Git 忽略，网站构建也不复制实验配置；不要把秘密手动粘入学习成果、Notebook 输出或公开日志。

这保护的是个人访问边界，不承诺供应商管理员、服务器 root 或泄露后的凭据无法访问。密钥泄露后需要撤销，不以隐藏网址代替认证。个人实验室允许你运行自己的代码，Jupyter 的工作目录不是恶意代码沙箱；不要让不受信任的人共享该账号。

## 从零连接自己的机器

以下步骤使用 Linux 服务端与 Windows/macOS/Linux 客户端。服务端需要 Python 3.12、OpenSSH 和独立个人账户或供应商专用容器。还不认识终端和远程目录时，先读[环境入门](environment-preparation.md#先认清三个位置)。购买、系统安装和网络权限按自己的实际条件决定；以下是配置流程，不会自动下单。

### 准备连接信息和密钥

从供应商控制台找到主机地址、SSH 端口、登录用户名和主机指纹。主机地址是目标机器的位置；端口是 SSH 服务入口；用户名决定进入哪个账户。端口不一定是 22，用户也不一定是 root。不要从别人的示例照抄这些值。

在自己电脑运行 `ssh -V`，应输出 OpenSSH 版本。找不到命令时按 [Microsoft OpenSSH 文档](https://learn.microsoft.com/zh-cn/windows-server/administration/openssh/openssh_keymanagement)准备客户端；连接 Linux 不要求在 Windows 安装 SSH 服务端。

在自己电脑生成专用密钥。Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE/.ssh"
ssh-keygen -t ed25519 -f "$env:USERPROFILE/.ssh/ai_infra_lab_ed25519" -C "ai-infra-lab"
```

macOS/Linux 终端：

```sh
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -f "$HOME/.ssh/ai_infra_lab_ed25519" -C "ai-infra-lab"
```

如果提示文件已存在，选择不覆盖，先确认是不是已有密钥。交互中设置密码短语；之后连接时由本人输入。以 `.pub` 结尾的是公钥，只复制这个文件的完整一行到供应商的公钥管理入口，并绑定目标实例/账户。没有 `.pub` 扩展名的是私钥，留在自己的电脑。两者不可混用。

将源码中的 `labs/private-cloud/ssh_config.example` 复制为本机 `.private/ssh_config`，先创建 `.private` 文件夹。用文本编辑器填写实际 `HostName`、`Port`、`User` 和 `IdentityFile`。路径含空格时用英文双引号包住；其余选项先保持模板值。

首次连接在本机项目目录运行下式。它只为首次核对启用询问，不关闭主机校验，也不建立 Notebook 转发：

```sh
ssh -F .private/ssh_config -o ClearAllForwardings=yes -o StrictHostKeyChecking=ask -t ai-infra-private
```

将终端显示的 SHA256 主机指纹与官网控制台核对，一致后才接受并保存到 `known_hosts`。如果平台不显示指纹，可在可信的控制台终端运行 `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` 查看对应 Ed25519 主机键；指纹类型必须相同，平台 SSH 代理也可能使用不同的主机键，应以代理的官方信息为准。无法核对时不要盲目输入 yes。后续使用模板默认的严格验证。

成功后运行 `whoami` 和 `pwd`，应分别显示远程账户和远程目录。此时后面的安装命令在远程执行，不是在你的 Windows 电脑上执行。先按[源码获取说明](getting-started.md#1-打开工作台)在远程个人目录取得选定版本的本站源码并进入目录，记录实际版本；不要覆盖已有作品。使用本站课程 CLI 时另外核对 Node 22+。

### 安装独立控制环境

在服务器的项目目录运行：

```sh
python3.12 -m venv "$HOME/.ai-infra-venvs/notebook"
"$HOME/.ai-infra-venvs/notebook/bin/python" -m pip install -r labs/private-cloud/requirements.txt
```

这一步联网安装浏览器实验入口，依赖包含 Ubuntu 24.04 / Python 3.12 已运行版本的完整清单，不是跨平台 wheel 哈希锁。环境放在项目外，避免 JavaScript 项目的模块设置影响 Jupyter 自带工具。CUDA、PyTorch、Go 和每门原课环境按[原课流程](project-workflows.md)分别安装。启动 Jupyter 的环境不等于所有实验环境已经就绪。云端下载依赖，本机只接收代码、日志和成果；创建后记录 `pip freeze` 与操作系统信息。

### 创建私有凭据并启动

以下路径位于当前服务器用户自己的目录，私有状态与可浏览的作品目录分开：

```sh
"$HOME/.ai-infra-venvs/notebook/bin/python" scripts/private_lab.py init --state "$HOME/.ai-infra-private"
"$HOME/.ai-infra-venvs/notebook/bin/python" scripts/private_lab.py serve --state "$HOME/.ai-infra-private" --root "$HOME/ai-infra-work"
```

首次初始化生成随机秘密，不在标准输出显示；重复 `init` 会报错并保留原文件。`serve` 固定监听回环地址，默认端口 8888；端口占用时退出，不偷偷换端口。仅当供应商提供 root 专用容器时加 `--allow-root`，普通虚拟机优先使用专用非 root 用户。已有目录权限不合格时会拒绝启动，由维护者核对归属后修复，不能递归放宽权限。

首次使用前台运行并保持这个终端打开。持久服务需要按供应商的进程管理条件配置，不能靠关闭窗口后进程是否碰巧存活。断网后先确认旧服务是否仍运行；不要重复启动多个服务。启动器不会自动关机或停止云计费。

### 连接个人电脑

前面的 SSH 终端保持服务运行。在自己电脑另开一个终端，进入保存 `.private/ssh_config` 的项目目录，建立隧道：

```sh
ssh -F .private/ssh_config -N ai-infra-private
```

终端保持运行且没有输出通常是正常现象；`-N` 表示只做转发。打开 [个人实验室](http://127.0.0.1:18888/lab)。这个地址指自己电脑，经隧道连接服务器；它不是公开网站地址。

首次登录时，在供应商可信终端或另一条 SSH 会话中读取服务器私有目录 `credentials.json`，只将 `token` 字段填入 Jupyter 登录框。不要复制整个 JSON，也不要把凭据写入公开网站、截图或成果。后续同一浏览器使用登录 cookie；SSH 隧道仍然必须存在。关闭本机隧道不会关闭服务器计算实例。

进入后新建 Python Notebook，运行 `print(6 * 7)`，应得到 `42`；保存为自己的文件，关闭后重新打开核对内容。这同时检查执行和持久化。默认 kernel 使用入口环境，尚未安装 PyTorch 等课程依赖；每门课的解释器按[原课流程](project-workflows.md)准备，不在控制环境里混装所有课程。Notebook 之外的 Node、Go 和编译命令在远程终端运行。

手机也可以阅读课程；此版本的私有实验入口需要本机 SSH 客户端。尚未把公网 HTTPS 登录网关宣称为已交付功能。若要手机直接运行实验，须另外部署受身份认证保护的 HTTPS 网关并实测会话、限额和撤销，不能直接把 Jupyter 改成公网监听。

### 撤销与恢复

先备份作品，再关闭或释放实例。下面的命令在自己电脑的项目目录执行，使用前面已核对的 SSH 配置；远端路径是该账户家目录下的 `ai-infra-work`。如果启动时用了其他 `--root`，替换为实际路径。每次选择新的本机备份目录，已有同名目录时不要直接覆盖：

```sh
scp -F .private/ssh_config -o ClearAllForwardings=yes -r ai-infra-private:ai-infra-work ./lab-work-backup
```

应在本机备份目录里找到 Notebook 和作品。核对文件数量并打开重要文件；这条命令不会备份工作目录之外的课程作品和报告，需要对它们另外复制。不要把 `.ai-infra-private`、私钥或云平台凭据混入作品备份。

在远端没有 `ai-infra-work-restored` 的前提下，把备份上传到一个新的恢复目录：

```sh
scp -F .private/ssh_config -o ClearAllForwardings=yes -r ./lab-work-backup ai-infra-private:ai-infra-work-restored
```

原目录保持不动，先核对恢复文件，再用相应课程环境运行一次检查。`scp` 复制文件，不复制 GPU、驱动或可跨系统使用的虚拟环境。SSH 终端或复制进程退出不等于实例关机；到供应商控制台确认计算已停、租期和存储费用已核对。释放实例会影响数据，必须先完成恢复抽查。

需要撤销旧的浏览器登录时，停止本项目启动的 Jupyter 进程后执行：

```sh
"$HOME/.ai-infra-venvs/notebook/bin/python" scripts/private_lab.py rotate --state "$HOME/.ai-infra-private"
```

再以原来的 `serve` 命令启动。旧令牌和旧 cookie 同时失效；个人文件保留。若 SSH 私钥泄露，还必须从服务器/供应商控制台移除对应公钥并配置新密钥，只轮换 Jupyter 令牌不够。

备份作品、课程提交、依赖版本和必要模型元数据；私有凭据单独保护，不混入公开报告。恢复时先重建环境，导入作品，验证一个 Notebook 与原课检查，再核对哈希。云盘快照、关机保留和停止计费以实际产品规则为准。

## 接口与错误定位

启动器使用 Python 标准库处理初始化，`serve` 才需要已安装 JupyterLab。成功初始化或轮换退出 0，配置、依赖和权限错误返回 1，命令行参数错误返回 2。服务运行时保持前台，终止由 SSH 会话或所配置的进程管理器处理。

| 参数或问题 | 含义与处理 |
| --- | --- |
| `init / serve / rotate` | 创建、启动、轮换；运行期间拒绝轮换，避免以为旧凭据已撤销 |
| `--state` | 必填，秘密与运行时目录；须为当前用户所有且权限 `0700` |
| `--root` | `serve` 必填，个人作品目录；不能包含秘密目录 |
| `--port` | 默认 8888，只允许 1024–65535；修改后同步 SSH 转发目标 |
| `--allow-root` | 明确允许供应商 root 容器；不授予额外宿主权限 |
| Windows 服务端被拒绝 | 在 Linux 实例运行启动器，本机只负责 SSH 隧道 |
| SSH 主机密钥改变 | 先核对实例是否重建或地址重分配；核实新指纹，不删除整个 known_hosts |
| SSH 拒绝或隧道端口占用 | 核对实例开机、端口、公钥、agent 与本机端口；不要改成共享密码或公网监听 |
| Jupyter 登录失败 | 核对当前实例、端口和最新令牌；轮换后重新登录 |
| 模型无法运行 | 在对应课程环境检查版本、GPU、显存、模型许可和下载完整性，不能只确认网页能打开 |

## 私有实例的交付检查

自行配置时逐项记录结果；由维护者代配时也必须提供这些证据：确认主机密钥和唯一公钥；无密钥及错误密钥不能建立连接；无令牌和错误令牌不能读取文件或创建 kernel；正确凭据能执行代码；回环监听与供应商端口映射符合预期；重启后作品可恢复；撤销后旧会话失效；实际课程所需的 GPU/CPU 和报告流程可用；备份抽样恢复成功；停止计算和遗留存储费用均已核对。

通用工具通过 CI 之后，仍需在实际实例重复检查。账号尚未创建、实例尚未租用或 GPU 尚未执行时，不将个人云端环境写成“已搭建完成”。
