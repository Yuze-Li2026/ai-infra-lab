# 维护者：从一次修改到可验证发布

平台浏览和日常构建不需要 Codex、商业账号或 npm 安装。维护者需要 Node 22+；实验复验按[独立环境准备](getting-started.md)。先保留 Git 版本和学习备份，再做修改。

## 找到修改位置

| 目标 | 修改位置 | 同时检查 |
| --- | --- | --- |
| 资源、节点、实验、阶段 | site/catalog.json | 来源、许可、唯一 ID、先修引用、循环与对应指南 |
| 页面结构与交互 | site/views.js、site/app.js | 转义、键盘、手机、失败提示、草稿与备份 |
| 视觉 | site/styles.css | 长标题、320 px、200% 文本、代码与表格可读性 |
| 报告与阶段条件 | site/reports.js、site/core.js | 旧备份、版本一致性、参考模式不计入独立作品 |
| 指南 | docs/*.md、site/documents.js | 文档允许列表、相对链接与构建输出 |
| 固定原项目 | labs/*/upstream、独立 run.py | 原许可、SHA-256、兼容补丁、原断言与失败提交 |

`create-catalog`、`refactor-v02` 与 `complete-catalog` 是初建/迁移记录，不是日常修改入口；不要用生成脚本覆盖人工审阅后的目录。

## 完成一个最小修改

选择一个确有证据的问题，在自己的 Git 分支中修改对应文件。更新来源需给原始页面、作者、版本、许可、选择理由和局限。更新先修必须解释实际依赖；新增资源不自动变成所有人的必修。

```sh
npm ci --ignore-scripts
node scripts/credits.mjs
npm run check
```

第一条安装锁定的维护依赖；第二条同步来源致谢；第三条依次执行目录、文档格式和链接、实际测试、构建及发布文件核验。缺失实验依赖、测试失败或跳过均不能通过完整检查。可通过 `LAB_TEST_PYTHON` 指定准备好的实验解释器。

### 运行器与进程清理

Windows 的命令运行器通过 Python 标准库调用系统 [Job Object](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects)：先以暂停状态创建命令，加入本次任务，再恢复执行。若无法建立归属，命令保持未执行并返回错误。监督进程退出或被终止时，系统关闭本次任务的子进程，包括直接父进程已退出的后代；不按程序名称结束其他实验。Node 包装层依次选择 `LAB_TEST_PYTHON`、`LAB_PYTHON`、本站 `.venv-labs/Scripts/python.exe`、PATH 中的 `python`，因此 Windows 上的实验与完整复验需要 Python；浏览、构建和离线维护状态不经过这个运行器。

Linux 使用独立会话和进程组。Python 运行器的超时清理另设 5 秒上限，清理失败返回错误，不再无限等待输出管道。Node 运行器保留标准输入、分块 UTF-8、输出上限、中断与退出码。正常结束也清理 Windows 任务中遗留的后代，因此不能通过这个入口启动长期后台服务。

这些规则管理本次启动的普通进程，不能隔离恶意代码、撤销文件修改或限制全部系统访问；主动脱离 POSIX 进程组、通过系统服务创建进程等行为不在其安全保证内。运行不可信作品仍需单独的受限操作系统环境。实现集中在 `scripts/process.mjs`、`scripts/processes.py`、`scripts/windows_job.py` 和 `scripts/windows_process.py`；修改后必须复验正常输出、超时、父进程提前退出、无关进程存活及原课调用。

## 审查内容与界面

检查本人数据与脚本没有进入公开输出；检查指南的路径、模式、命令与真实结果一致。安装开发依赖后，用已有的 Edge 或 Chrome 执行 `npm run test:browser`，至少查看首页、节点详情、实验、文档和阶段复核的桌面/手机截图。无障碍扫描、键盘操作和实际文字放大分别检查，不能互相替代。文档另按[写作规范](writing-guide.md)审校；内容错误优先修复来源与解释，不能只让测试适应错误。

Git 提交前检查 `git diff` 和 `git status`。不要提交 `.venv-labs`、node_modules、artifacts、个人程序、学习备份、令牌或模型权重。本站原创代码 MIT，第三方材料保留原许可。

## 更新浏览器依赖

版本锁在 package-lock.json；运行 `npm ci` 只用于维护升级/复验。升级 Marked 或 DOMPurify 时核对发布说明和许可，显式运行 `node scripts/vendor-web.mjs` 更新浏览器文件与 SHA-256，审查差异，执行文档清理/链接与浏览器测试。构建不会自动下载或替换第三方文件；校验失败时查明来源，不直接改 hash 让它通过。

## 发布与确认

先让远程 Validate 在 Windows/Linux 通过，再运行手动 Publish Pages。检查来源提交、工作流日志和部署 URL，不只看本机页面。线上复验主视图、实际指南、实验信息、相对路径和新临时上下文的学习备份；不要操作使用者的真实进度。

完整操作与授权边界见[维护与部署](maintenance.md)。公开发布会暴露源码与 Git 提交信息，发布的是审查后的项目材料；不可覆盖其他仓库。

## 回滚与恢复

优先 `git revert <错误提交>`，检查、构建、重新发布；不强制推送。恢复学习记录使用 JSON 导入，与回滚代码分开处理。需要恢复构建时，在新目录解包已知源码归档，检查路径安全与完整性，再构建比对 manifest；不覆盖当前工作目录。

构建将旧 dist 留在 artifacts/build-previous-*。不要无条件删除整个 artifacts；先辨明源码归档、报告、截图与个人作品。依赖环境可按版本锁重建，但新机器/新系统仍需实际复验，不能从本机恢复结果推出全面兼容。
