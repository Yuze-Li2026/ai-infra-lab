# 实际验证记录与复验入口

日期：2026-10-09。Windows、Node v24.21.0、Python 3.12.14；浏览器为本机 Edge 无头模式。使用已有运行时与包，没有安装驱动、下载模型或浏览器。测试使用独立临时浏览器上下文，没有操作使用者的真实学习进度。

## 0.4.1 之后的工程检查

当前改进尚未作为新的完整交付版本验收。自动测试新增进程超时与中断、分块 UTF-8、输出限制、空报告拒绝、报告写入失败保护和 Go 原始日志计数；具体计数与结果保存在 `artifacts/test-results.json`。Markdown 格式检查覆盖当前全部维护文档。

界面回归通过六组脚本：基础操作、异常与存储、任务与并发、文档与阶段、视觉与无障碍、真实 GPU 报告导入。自动无障碍扫描检查八条路由的桌面和手机布局；另检查 320/390/768/1440 px、实际 200% 字体放大、筛选后焦点、命令复制及权限失败恢复、手机目录和章节地址刷新。

手机 200% 文字复查额外发现导航标签重叠：固定五列的布局未造成页面横溢出，却压缩了文字空间。修复为按字号换行后，六条路由在四个屏宽均通过文字边界检查，并实际点击了放大后的手机导航。截图为 `artifacts/ui-text-200-320.png` 与 `artifacts/ui-text-200-390.png`。

新增入门回归覆盖三个真实入口、保存后引导收起、45 个知识点直达各自中文选章、展开实验帮助和继续访问原始资料。另增加双标签页保存的诊断，以及鼠标按下到松开期间收到其他标签页更新的检查；本页不因存储事件替换正在操作的 DOM。结果与失败诊断保留在各脚本日志中。

自动无障碍扫描没有发现规则集中的违规项；这不是完整 WCAG 认证。界面截图和运行日志保存在 `artifacts/`。上述 GPU 报告导入复用已有真实单卡报告，不能代替新增 Linux、多卡或高级课程检查。当前提交的跨系统执行与部署结果以同提交工作流为准；历史版本结果在下文单独保留。

### 跨系统检查与源码恢复

提交 `2e4490907a58ab58653d7e4537666f7326e01cbb` 的 [Validate 37928325425](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37928325425)在 Windows、Ubuntu 均成功。两套环境都执行完整自动检查、CPU 参考程序和五组浏览器回归；本地自动测试为 35 项通过、0 失败、0 跳过，另执行包含真实 GPU 报告导入的六组浏览器回归。

同一提交用 `git archive` 导出源码，解包至新的 `artifacts/recovery-2e44909`，从已有缓存执行 `npm ci --ignore-scripts --offline`，再执行完整自动检查与五组浏览器回归，全部通过。恢复构建的 50 个公开内容文件与工作目录清单完全一致。记录为 `artifacts/recovery-2e44909-report.json`，源码归档为 `artifacts/recovery-2e44909.zip`。演练复用本机已有 Python 实验环境和 Edge，不能视为全新操作系统安装或新增 GPU 实测。

### Linux 原课环境

[Original course Linux environments 37927817570](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37927817570)在提交 `2f21254f4cac376c516011ea5b199fc01b1fce39` 上执行成功。环境为 Ubuntu 24.04、Python 3.12.15，按固定来源准备全新课程目录；依赖在云端安装，本机只下载日志与报告。

| 固定原课 | 实际执行 | 结果与含义 |
| --- | --- | --- |
| DLSys HW0 | 隔离环境导入依赖，原 Makefile 编译并导入 C++ 扩展，执行 6 项原测试 | 6 项失败、0 跳过；执行链可用，起始作业未实现 |
| DLSys HW1 | 独立环境执行 29 项原测试 | 29 项失败、0 跳过；执行链可用，起始作业未实现 |
| DLSys HW2 | 独立环境执行 93 项原测试 | 91 项失败、2 项通过、0 跳过；通过的辅助代码不代表完成作业 |
| MIT 6.5840 Raft | 原 `make raft1` 及竞态检测，预先收集与实际结束的测试均为 28 项 | 28 项失败、0 跳过；全部执行结束，起始 Raft 未实现 |

四份环境报告均为 `environmentVerified: true`、`assignmentPassed: false`。工作流检查依赖错误、零测试、缺失结果和跳过情况；没有修改原测试或填写课程答案。原日志、JUnit 与下载来源记录保存在 `artifacts/cloud-evidence/2f21254/`；Actions 附件保留 7 天，工作流链接和本地归档用于追溯。HW3/HW4、CS336 的独立运行环境、多卡及真实集群仍未由这些结果证明。

首轮云端执行暴露了两个跨系统问题：Linux 虚拟环境解释器被解析成系统解释器，以及相对报告路径落入课程工作目录。两项均已修复并实际复跑。另两项浏览器检查曾在异步保存完成前读取状态，已改为等待明确的保存结果；保留原断言和失败日志。

上述改进已同步到验证分支。公开网站仍对应 0.4.1；这些检查没有触发 Pages，也不表示完整交付验收通过。

### AI 维护接手检查

新增离线 `maintenance:status` 与源码绑定的报告。实际回归覆盖源码改动后旧报告过期、检查期间源码变化、损坏/缺失/未绑定报告、异目录调用和错误参数；另在独立目录运行缺失解释器的完整测试入口，确认返回非零并把旧成功记录替换为失败报告。损坏报告只读取，不覆盖。

仓库入口、AI 维护流程与 PR 模板明确由维护者完成调研、实现、排错和交接，学习者提供学习目标即可。这里验证的是维护工具和规则接入，不表示已配置常驻 AI 服务或自动部署。最终自动测试数量、报告指纹及当前源码是否匹配，以命令输出和同提交 CI 为准。

[维护分支运行 37931510370](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37931510370)的 Linux 作业成功，Windows 在损坏进度的浏览器用例中未等到保存结果。该用例现先打开明确的任务，并等待损坏记录提示，再执行普通保存；原数据不得改写、恢复时保留损坏原文的断言继续保留。失败记录新增当前任务按钮、页面提示和截图，供后续定位；该次失败记录不能被本地通过替代，修正后仍须复跑跨系统 CI。

## 私有实验入口与逐项资料

2026-10-09，提交 `d52356375e91503a462b01268ef8cd08149170ee` 的 [Private laboratory access 37938683751](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37938683751)通过。Ubuntu 24.04 实际安装 JupyterLab 4.6.4、Jupyter Server 2.21.1，创建独立 OpenSSH 服务与临时密钥，执行真实 Python kernel，不使用模拟响应。

实际检查包括：私有目录和凭据权限、重复初始化保护、符号链接拒绝、错误令牌与匿名执行拒绝、文件保存、Python 输出、cookie 登录与 XSRF、正确 SSH 公钥转发、错误公钥拒绝、仅回环监听、进程重启和令牌/cookie 同时撤销。测试密钥不上传，报告明确 `gpuVerified: false`。这证明通用入口可运行，不证明任何个人云实例已租用、供应商计费已关闭或 GPU 课程完成。

早期失败保留在对应 Actions 运行与本地诊断中：修复 Jupyter 扩展初始化顺序、日志等级取值、项目 JavaScript 设置影响入口环境的问题，并将 SSH 测试使用的公钥放在私有目录，按 Ubuntu PAM 账户策略验证。密码认证和交互式密码仍然关闭，没有通过放宽主机验证绕过问题。

同提交的 [Validate 37938683957](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37938683957)在 Windows 和 Ubuntu 成功。随后新增的逐项资料、准备教程和界面入口仍需以最终源码指纹对应的本地/CI 报告复核，不能沿用这个提交的结果。新内容包含 45 个模块的 198 项任务、65 项来源与零基础 CPU/Linux/GPU/集群准备说明；知识覆盖数量不构成实验运行证据。

### CS336 A1 与文件恢复

提交 `cfe8a8756f5fcde9c377a1b0d0c532354e7487c9` 的 [CS336 A1 37940554301](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37940554301)实际使用 Python 3.12.15、uv 0.11.20，按上游 `uv.lock` 安装 PyTorch 2.11.0+cu130 等依赖。runner 没有 GPU，实际执行的是 A1 的 CPU 原测试；安装 CUDA 运行库不等于有 GPU。

固定原提交 `a158843b20107949f1a8d7df1b05cd33b9166712` 收集并执行 48 项：47 项起始代码失败，1 项为上游明确标注的 `test_encode_memory_usage` 预期失败。JUnit 将该 xfail 放在 skipped 中，环境检查单独核对其名称、类型和原始原因，不把它计为通过，也不接受其他跳过。`environmentVerified: true`、`assignmentPassed: false`、`gpuVerified: false` 保留在 `artifacts/cloud-evidence/cfe8a87/cs336-a1-cpu-evidence/`，没有填写 adapters 或改变原题。

同提交 [Private laboratory access 37940554320](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37940554320)使用完整版本清单重新安装并通过前述检查，另外实际执行 SCP 下载与上传到新目录的恢复，核对作品内容、原目录未覆盖和凭据未混入备份。报告位于 `artifacts/cloud-evidence/cfe8a87/private-cloud-evidence/`。

新增页面内容本地检查为 39 项自动测试通过、0 失败、0 跳过；六组浏览器脚本通过。资料列表的正文链接补充下划线后，无障碍检查通过。新教程的 13 个站内章节链接已按阅读器实际标题算法核对，桌面、手机及 200% 文字截图已查看。完整源码对应性仍以最终 `maintenance:status` 和同提交 CI 核对，不能只按这段计数验收。

外部入口共检查 79 个，直接网络读取成功 74 个；Slurm、OpenXLA、TRL、Spark 和 CS50 Indoor Voice 的本机网络请求未确认，另通过网页读取工具打开原站复核，CS50 跳转到不含年份的同题地址。原始网络失败保留在 `artifacts/links.json`，未篡改为本机网络通过。

### 逐项内容的跨系统检查与运行器修复

包含全部逐项资料、准备教程和界面改动的提交 `2ce5abd512be2fb7aa6a178b98da7a5c0682c05b` 已同步；[Validate 37941775840](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37941775840)的 Windows 与 Ubuntu 均成功。本地 39 项测试、六组浏览器脚本的源码指纹一致。此提交仍位于验证分支，未触发 Pages。

随后复查运行器发现 Windows 父进程退出后遗留后代的清理问题，改用恢复执行前建立的 Job Object。新增真实后代持有管道、持续写文件和无关进程存活检查；11 项针对性进程/课程测试通过。第一轮测试发现 libuv 标准句柄没有向 Python 启动的命令正确继承，修复为显式传入三个标准句柄后，原中文输出、标准输入和课程命令断言全部通过。另补充归属建立失败时作品不得开始执行的故障注入。完整复验仍按最终源码指纹与同提交 CI 判断，不能沿用前一个提交的结果。

## 0.3.0 历史检查

| 检查 | 实际结果 |
| --- | --- |
| 目录及先修校验 | 24 节点、33 来源、11 实验；已知引用、步骤完整、依赖无环 |
| Node 自动测试 | 24 项通过，0 失败，0 跳过；涵盖状态、损坏与并发写入、报告与里程碑、第三方完整性、目录、构建及错误独立作品 |
| AOSA 原测试 | 四阶段 28 项原测试全部通过；错误独立提交会失败 |
| 性能复现 | 10,000 对象、一次预热、七次读取测量，环境与原始结果已保留 |
| 浏览器流程 | 基础 13 项、优化 8 项、原版本新增 10 项，完整链新增 10 项，共 41 组通过 |
| 页面运行时 | 上述流程未发现浏览器运行时异常 |
| 响应式 | 五主视图及任务详情在 320、390、768、1280 像素检查无页面横溢出；另有桌面截图与文本放大检查 |
| 外部链接 | 40 个唯一来源、实验和许可入口已检查；网络超时进行定向复验，最新分类在 artifacts/links.json |
| 静态构建 | 隔离构建、旧输出保留、清单哈希和额外文件检测通过；项目子路径访问正常 |

浏览器流程包括所有 24 个任务直达链接、中文输入法事件、搜索空态、未提交草稿刷新及导出、真实 Web Locks 并发保存、存储配额失败、损坏记录保护、合法大备份恢复、恶意标签文本转义，以及键盘跳到内容。

WebMCP 只读工具在模拟宿主下验证参数和不修改数据的契约。测试浏览器没有提供原生 WebMCP，因此没有宣称原生宿主兼容性已验证。

## 复验与产物

基础检查运行 `npm run check`。使用 Python 3.10+；非默认解释器可通过 `LAB_TEST_PYTHON` 指定。实验参考测量运行 `python labs/object-model/run.py --benchmark`，说明见对象模型指南。

完整本地浏览器复验需要项目锁定的开发依赖及已安装的浏览器。在项目根目录运行：

```sh
npm run test:browser
```

脚本负责构建、DBDB 参考复现、独立测试服务和执行顺序。Windows 默认查找 Edge，其他系统默认使用 Chrome；`LAB_BROWSER_PATH` 可指定已有浏览器。失败返回非零，汇总写入 `artifacts/browser-suite-results.json`。原始脚本仍可单独运行，但优化检查依赖基础检查生成的备份样例。

若已完成 `tests/gpu-check.mjs` 并保留真实报告，再运行 `npm run test:browser -- --gpu-reports` 加入报告导入复验。没有 GPU 报告时该选项会明确失败，不生成替代通过记录。开发测试不是平台浏览的运行依赖。

本地机器报告：`artifacts/browser-results.json`、`artifacts/optimization-results.json`、`artifacts/release-browser-results.json`、`artifacts/object-model-report.json`、`artifacts/links.json`。界面截图：`desktop.png`、`mobile-clean.png`、`task-desktop.png`、`labs-desktop.png`。这些文件不进入公开构建。

## 验证范围

GitHub Actions 跨系统矩阵已经实际执行，结果见文末。macOS、多卡、外部评分服务、全部教材内容准确性、完整许可例外、人工教学试用和长期学习成效未获得本轮验证。自动化输入法事件检查不能代表全部真实输入法；响应式与键盘检查不等于完整无障碍合规审计。

## 本地版本与恢复演练

已建立本地 Git 历史。对提交 `a76cf3c` 执行 `git archive`，解包至新建的 `artifacts/recovery-a76cf3c`，从归档源码重新构建。恢复目录的 23 项公开文件清单与工作目录构建逐字节一致，所有 SHA-256 核验通过；归档中的对象模型 28 项原测试也再次通过，说明原始文件校验未受 Git 换行转换破坏。原工作目录没有被回退、删除或覆盖。

报告保留于 `artifacts/recovery-report.json`，源码归档为 `artifacts/release-a76cf3c.zip`。上述为早期版本的明确恢复证据；当前已经设置项目远程地址并上传完整历史，后续记录如下。

公开输出不含个人成果。能力达成仍要求独立设计、实现、测试、解释与评审，不以平台点击数或参考代码通过数认证。

## 0.3.0 新增实测

DBDB 21 项原测试、共识 46 项功能原测试（500 行编辑约束单独未满足）、micrograd 2 项原测试加 9 项补充检查、GPU 4 项真实 CUDA 检查通过。CPU 项目重复性能协议和 GPU 同步计时记录在各自报告。准备或运行失败会生成失败报告，错误独立作品不被冒充通过，源码不被改写。

本轮 41 组浏览器检查使用独立临时上下文；报告导入测试中的 submission 标记是 UI 测试夹具，不代表真实学习者独立实现。没有更改用户真实浏览器学习数据。

## 完整源码恢复演练

代码版本 `827eb19` 的源码归档已在项目自己的新目录安全解包，恢复后的 24 项测试全部通过（0 跳过），39 个公开文件的 SHA-256 清单与工作目录构建完全一致。产物为 artifacts/release-complete-source.zip，报告为 artifacts/recovery-complete-report.json。演练复用已准备的独立 Python 依赖，不声称完成了全新机器安装。

链接检查有 37/40 项可达，3 项 GitHub 入口为连接失败/网络未知；保留尝试与分类，不把它们直接判为资源失效。对应源码与许可已固定在本地。

## 公开源码与跨系统验证

所有者在 2026-10-09 明确批准公开发布。认证核对目标仓库不存在后，创建 [Yuze-Li2026/ai-infra-lab](https://github.com/Yuze-Li2026/ai-infra-lab)。常规 Git 连接重置后使用 GitHub 官方数据 API 上传，逐个核对全部提交和文件树与本地哈希相同，没有改变其他仓库。

首轮代码提交 `79aafab` 的 [Validate 运行 37877122668](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37877122668)已完成：Windows、Ubuntu 均成功。Windows 日志显示 24 测试、24 通过、0 跳过；原对象模型 28、DBDB 21、共识 46 项成功，报告作为工作流附件保存。远程使用 Python 3.12 与 PyTorch 2.10.0+cpu，不是 GPU 验证；GPU 证据来自前述本机实际运行。

Pages 工作流仅手动触发，并检查部署提交本身已有成功的 Validate。Actions 已按官方稳定发布固定完整提交哈希；新版本必须重新通过 CI。

更新后的 `9c16b87` 在 [Validate 37877772893](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37877772893)再次通过 Windows/Linux 矩阵；Ubuntu 日志同样为 24 项、24 通过、0 跳过。该版本的源码归档在独立新目录恢复后通过全部测试，44 个构建文件与工作目录哈希一致，报告保存在 artifacts/recovery-latest-report.json；复用了已准备依赖，没有宣称全新机器安装。

## Pages 与实际线上检查

[Publish Pages 37878054021](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37878054021)成功，网站为[在线学习工作台](https://yuze-li2026.github.io/ai-infra-lab/)。独立临时浏览器上下文实测：24 个任务直达、29 份文档/许可阅读、指南相对跳转、学习提交/刷新/导出/恢复、320/390/768/1280 屏宽和 200% 文本，无运行时异常。只修改了测试上下文的数据。

首次逐文件检查发现 .nojekyll 控制文件返回 404；另外 43 个可访问文件的大小和 SHA-256 均与本地一致。本站通过[官方自定义 Actions 发布方式](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)直接部署构建产物，不运行 Jekyll。后续构建移除这个无用控制文件，让清单中每个文件都可以在实际网站严格核验。不会把该 404 写成“全部文件通过”。

最新版复验命令如下。先构建，等待同一提交的 Validate 与 Pages 都成功，再运行；任何内容哈希不一致或交互失败会非零退出，不能发布旧清单。已有浏览器依赖条件与本地浏览器检查相同。

```sh
node tests/live-browser.mjs
```

默认检查项目正式 URL，可用 LAB_LIVE_URL 指定自己的 HTTPS 部署地址。结果保存在 artifacts/live-browser-results.json，截图为 live-desktop.png 和 live-mobile.png；这些本地产物不混入公开构建。最新部署提交与运行可在[验证工作流](https://github.com/Yuze-Li2026/ai-infra-lab/actions/workflows/validate.yml)和[发布工作流](https://github.com/Yuze-Li2026/ai-infra-lab/actions/workflows/pages.yml)核对。

## 0.4.0 逐文件审查后的复验

2026-10-09 按文件夹提示词重新阅读维护文件与冻结上游，清单覆盖 148 个文件；方法、发现与修复见[逐文件审查](file-audit.md)。学习范围扩展为 45 节点、41 来源，20 类能力对应官方课程、MLSysBook 两卷与原始 API，见[覆盖矩阵](coverage.md)。全部节点都有选章说明，结构检查不代表领域已经穷尽。

| 本轮实际检查 | 结果 |
| --- | --- |
| Node 自动测试 | 25 通过、0 失败、0 跳过；新增部分报告不能计为完整验收、旧摘要兼容和零测试失败报告检查 |
| 本地浏览器 | 13 + 8 + 10 + 13，共 44 组通过；45 个任务直达、范围筛选、报告、备份、阅读与安全失败路径 |
| 文档 | 31 份 Markdown 加本站许可，均接入站内阅读；链接与每节点范围检查通过 |
| 真实单卡 | 4 项 CUDA 检查再次通过：FP32、梯度、训练、独立临时检查点恢复 |
| 原项目 | 对象模型 28、DBDB 21、共识 46 项原测试；micrograd 原测试 2 与补充检查 9 项通过 |
| 首次启动 | DBDB 与共识分别从独立新副本、无 artifacts 目录启动通过，21/46 项原测试成功 |
| 历史工具保护 | create-catalog、research-v02、complete-catalog、refactor-v02 拒绝当前目录，字节没有变化 |
| 外部入口 | 49/49 可达；首轮 9 个超时经定向重试成功，保留两次尝试，不把超时写成资源失效 |
| 公开输出 | 46 项内容文件及构建清单；白名单、逐文件 SHA-256、陈旧输出隔离通过 |

浏览器使用独立临时上下文；submission UI 夹具不代表真实学习者完成作品。桌面及移动截图已检查，新增入口沿用相同间距、颜色与文字层级。新增任务、实测通过和未执行高级工程分别记录。macOS、多卡、真实集群、全部原课作业、设备和长期教学成效仍未由本轮证明。

发布只在同一提交的 Windows/Linux Validate 成功后触发 Pages。源码归档恢复、部署、线上清单与交互复验的最终具体提交和工作流 URL 记录于[0.4.0 发布附件](https://github.com/Yuze-Li2026/ai-infra-lab/releases/tag/v0.4.0)中的 verification JSON 与 SHA256SUMS；可据此核对源代码、静态网站和只含 main 的历史 bundle。恢复使用已准备的 Python 依赖，不声称是全新机器安装。

## 0.4.1 按学习者实际使用复核

具体缺口、执行和未验证条件见[可用性审查](usability-audit.md)及[原课操作流程](project-workflows.md)。本地自动测试 30/30，0 跳过；浏览器 44+5 组；真实 CUDA 7 案例，正确路由与五种错误实现的验收行为符合预期。33 份 Markdown 加本站许可均接入阅读，48 内容文件逐项构建校验。

源码准备八份均成功。DLSys 原测试实际执行 6/29/93 项，起始代码失败 6/29/91 项，无跳过；这验证执行器反馈真实错误，不表示作业已实现。MIT/CS336 的完整环境及更深工程仍未被当前结果证明。Windows 短暂目录占用现有有限重试和回滚，测试继续核对旧输出保留、陈旧内容隔离与逐文件哈希。

发布仍要求当前提交 Windows/Linux Validate 成功，Pages 使用已验证提交重新核对文档和构建；新版本没有覆盖 0.4.0 标签或历史附件。最终提交与远程结果以[Actions](https://github.com/Yuze-Li2026/ai-infra-lab/actions)及对应新发布为准。
