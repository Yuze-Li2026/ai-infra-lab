# 中文维护指南

## 修改和检查

资源及知识内容修改 `site/catalog.json`；页面布局修改 `site/views.js` 和 `site/styles.css`，交互修改 `site/app.js`。保持目录字段规范，优先链接原资源。修改来源后执行 `node scripts/credits.mjs` 更新致谢。`create-catalog.mjs` 和一次性迁移脚本会拒绝覆盖现有成果，不是日常修改命令。

每次变更后执行 `npm run check`，覆盖目录校验、测试、构建和产物哈希核验。测试报告存在 skip 时核实是否缺 Python 3.10+。Node 版本最低 22。Marked 与 DOMPurify 版本锁在 package-lock.json，浏览器运行文件随源码分发，普通启动/构建不需要 npm install。维护升级时使用 npm ci，再显式运行 vendor-web.mjs 并检查许可、manifest 与内容清理测试；构建不会自动下载包。

链接检查 `npm run check-links` 写入本地 artifacts。失败应区分网络未知、访问限制和真实失效。更新资源先核对作者、版本和许可，再验证实验，不因新颖立即替换经典课程。

## 部署（需要项目所有者批准）

2026-10-09 所有者已批准本项目公开发布，并创建[源码仓库](https://github.com/Yuze-Li2026/ai-infra-lab)和[在线工作台](https://yuze-li2026.github.io/ai-infra-lab/)。Windows/Linux 验证和 Pages 已实际成功，版本与线上检查见[验证记录](verification.md)。首次创建或向其他目的地公开发布仍需所有者批准；本项目后续操作遵循已授予的范围。

1. 取得仓库创建批准，认证查询账号下全量仓库及名称冲突。建议名称 `ai-infra-lab`，不能覆盖已有仓库。
2. 检查本地 Git 状态和历史，复核个人成果、凭据和 artifacts 未纳入版本。创建批准的新仓库并推送。
3. 在 GitHub Pages 设置中选择 GitHub Actions。检查环境保护规则，再手动运行 `Publish Pages (manual)`。
4. 确认部署 URL、子路径静态资源、手机显示和数据备份行为。发布前必须再次通过校验、测试与构建。

线上复验使用 `node tests/live-browser.mjs`，需已有 Playwright 与浏览器；环境变量说明见验证记录。脚本逐个检查公开文件的大小与 SHA-256，并使用临时上下文测试学习和恢复，不能操作用户真实进度。本站只支持已说明的 Actions 产物部署，不依赖分支上的 Jekyll 控制文件。

验证工作流在 push/PR 时执行，发布工作流只有 `workflow_dispatch`。发布先查询当前同一提交的 Windows/Linux Validate 是否成功；通过后才构建和部署，不会拿其他提交的绿色结果放行。Actions 版本升级先查官方发布、固定提交，再实际执行验证与部署；核对结果保存在工作流中的版本注释。

## 备份、迁移和回滚

学习者通过页面导出 JSON；迁移到本地不同端口或 Pages 后重新导入。平台不会上传个人学习记录。维护者不要将 artifacts 和个人提交代码放入公共仓库。

每个可用版本应保留 Git 提交；修复已发布错误建议 `git revert <commit>` 形成反向提交，再经验证后发布。不要使用强制推送覆盖他人工作。撤回部署时选择已验证的历史提交重新构建发布，课程目录版本变化要检查进度兼容。当前本地提交与恢复演练结果见验证记录。

构建将原 `dist/` 保存为 `artifacts/build-previous-*`，失败的暂存内容也保留，不递归删除旧输出。重新发布应优先用已知提交重新构建；应急恢复前先核对备份清单。维护者可以在确认路径与备份用途后自行清理累积目录，勿把整个 artifacts 当成可无条件删除的临时垃圾。

## 诊断

- 找不到 Node：检查官方安装和 PATH，重新打开终端。
- 端口占用：设置 PORT 再启动，访问输出中的新网址；已有进度需从旧 origin 备份迁移。
- 页面空白：使用 HTTP 启动，不直接打开 HTML；检查浏览器控制台与 catalog.json 是否可访问。
- 记录没了：检查是否换浏览器、无痕模式或 origin，尝试原地址或恢复备份。
- 检查器不能启动 Python：传入解释器完整路径，确认版本和文件权限。
- GPU 实验无法运行：先查看原实验条件，不自动安装驱动、改系统或下载大模型。

## 安全边界

本地服务器仅绑定 127.0.0.1，不向局域网开放。不提供远程执行。CLI 检查器运行任意指定 Python 文件具有当前用户权限，只检查主动选择的可信本人代码；超时、输出上限与 `-I` 不是沙箱。运行器安全隔离是未来集成外部代码前的工程缺口。

新增后端、账号同步、任意插件执行或模型下载前重新审视权限、个人数据、成本及恢复方式。普通目录修改可逆；公开发布、仓库创建、危险操作、大规模安装与高风险配置仍需批准。

## 实验与文档维护

CPU 依赖固定于 labs/requirements-cpu.txt，GPU Windows / CPython 3.12 复现锁为 requirements-gpu-windows-lock.txt。报告包含环境、模式、版本、测试与完整计时样本。新的实验报告需维护 site/reports.js 已知类型、catalog 的 reportCommit 和里程碑。新指南需加入 site/documents.js 的允许列表。修改里程碑或报告格式后验证旧备份兼容与跨标签页合并。

运行项目解释器的 scripts/doctor.py 可只读检查版本、依赖、GPU 和工具。complete-catalog.mjs 是本轮一次性整合记录，需要实际 artifacts 报告，不是日常必跑构建命令。目录以 site/catalog.json 为唯一日常数据源。
