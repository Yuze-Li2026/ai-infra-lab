# 实际验证记录 · 0.2

日期：2026-10-09。Windows、Node v24.21.0、Python 3.12.14；浏览器为本机 Edge 无头模式。使用已有运行时与包，没有安装驱动、下载模型或浏览器。测试使用独立临时浏览器上下文，没有操作使用者的真实学习进度。

## 已执行

|检查|实际结果|
|---|---|
|目录及先修校验|24 节点、30 来源、7 实验；已知引用、步骤完整、依赖无环|
|Node 自动测试|18 项通过，0 失败，0 跳过；涵盖状态、损坏与并发写入、目录、构建和两个实验检查器|
|AOSA 原测试|四阶段 28 项原测试全部通过；错误独立提交会失败|
|性能复现|10,000 对象、一次预热、七次读取测量，环境与原始结果已保留|
|浏览器流程|基础 13 项、优化 8 项、0.2 新增 10 项，共 31 项通过|
|页面运行时|上述流程未发现浏览器运行时异常|
|响应式|五主视图及任务详情在 320、390、768、1280 像素检查无页面横溢出；另有桌面截图与文本放大检查|
|外部链接|35 个唯一来源、实验和许可地址均可访问；原先 3 个超时经过定向重试成功|
|静态构建|隔离构建、旧输出保留、清单哈希和额外文件检测通过；项目子路径访问正常|

浏览器流程包括所有 24 个任务直达链接、中文输入法事件、搜索空态、未提交草稿刷新及导出、真实 Web Locks 并发保存、存储配额失败、损坏记录保护、合法大备份恢复、恶意标签文本转义，以及键盘跳到内容。

WebMCP 只读工具在模拟宿主下验证参数和不修改数据的契约。测试浏览器没有提供原生 WebMCP，因此没有宣称原生宿主兼容性已验证。

## 复验与产物

基础检查运行 `npm run check`。使用 Python 3.10+；非默认解释器可通过 `LAB_TEST_PYTHON` 指定。实验参考测量运行 `python labs/object-model/run.py --benchmark`，说明见对象模型指南。

浏览器复验需要已有 Playwright 和浏览器。`LAB_PLAYWRIGHT_ROOT` 指向包含 Playwright 的 node_modules，`LAB_BROWSER_PATH` 指向浏览器可执行文件。先运行平台并构建，然后依次执行：

```sh
node tests/browser-check.mjs
node tests/optimization-browser.mjs
node tests/release-browser.mjs
```

第二个脚本使用第一个脚本生成的备份样例。开发测试不是平台运行依赖，不自动安装任何包。

本地机器报告：`artifacts/browser-results.json`、`artifacts/optimization-results.json`、`artifacts/release-browser-results.json`、`artifacts/object-model-report.json`、`artifacts/links.json`。界面截图：`desktop.png`、`mobile-clean.png`、`task-desktop.png`、`labs-desktop.png`。这些文件不进入公开构建。

## 验证范围

GitHub Actions 跨系统矩阵和 Pages 工作流尚未在远程执行。Linux/macOS、GPU、多卡、外部评分服务、全部教材内容准确性、完整许可例外、人工教学试用和长期学习成效未获得本轮验证。自动化输入法事件检查不能代表全部真实输入法；响应式与键盘检查不等于完整无障碍合规审计。

## 本地版本与恢复演练

已建立本地 Git 历史。对提交 `a76cf3c` 执行 `git archive`，解包至新建的 `artifacts/recovery-a76cf3c`，从归档源码重新构建。恢复目录的 23 项公开文件清单与工作目录构建逐字节一致，所有 SHA-256 核验通过；归档中的对象模型 28 项原测试也再次通过，说明原始文件校验未受 Git 换行转换破坏。原工作目录没有被回退、删除或覆盖。

报告保留于 `artifacts/recovery-report.json`，源码归档为 `artifacts/release-a76cf3c.zip`。后续提交只补充验收说明时，复现所指版本仍为这个明确提交。没有设置远程地址或上传源码。

公开输出不含个人成果。能力达成仍要求独立设计、实现、测试、解释与评审，不以平台点击数或参考代码通过数认证。
