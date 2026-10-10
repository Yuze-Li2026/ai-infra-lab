# 声明式扩展规范 v1

数据源：`site/catalog.json`。新增内容先做研究，再编辑数据，执行 `npm run check`。`schemas/catalog.schema.json` 提供编辑器字段校验，Node 校验器另检查引用和知识依赖无环；VS Code 已配置关联。

## 资源 Source

必须记录：唯一 `id`、`title`、`author`、`url`、`version`、`language`、`license`、`licenseUrl`、`prerequisites`、`coverage`、`reason`、`limitations`、`verification`、`reviewedAt`、`reviewLevel`、`reuse`、`evaluation`、`reviewEvidence`。最后一项记录原始证据的 `url / checkedAt / finding`，不能只写一个分数。

`evaluation` 含 `authority / accuracy / depth / engineeringValue / coverage / teachingQuality / difficulty / languageFriendliness / accessibility / maintenance / licensing / stability`。写依据和局限，不填无证据的“世界顶级”。`version` 不得只写 latest 便声称已固定；滚动资源在代码集成前改为 release 或 commit。

中文资源可选 `readingLabel`，只接受“作者中文”“官方中文”或“社区译文”，同时要求 `language` 为 `zh`。`originalUrl` 是可选的无凭据 HTTPS 英文对照地址，资源卡片与任务阅读列表会显示入口，链接检查一并核对。标签仅说明来源身份，不证明翻译质量；`reviewEvidence` 必须记录身份与版本的核查依据。

许可证未知时注明待核实、仅链接。不下载和镜像课程材料；代码、文字、视频、插图、数据、模型分别核实许可。社区译文、官方译文和机器译文必须区分；未经审校的机器译文明确标示。

## 知识节点 Node

字段：`id / title / stage / prerequisites / resources / category / objective / guidance / evidence / status / scope / steps / topics`。`steps` 至少两步，每步包含 `title / task`；`scope` 说明选读范围和边界。

`topics` 逐项记录知识与依据，不得为空。每项包含 `id / title / source / url / section / outcome / environment`：ID 以所属节点 ID 加连字符开头且全局唯一；`source` 引用已有来源，`url` 为无凭据 HTTPS 原文入口；`section` 指定选章，`outcome` 给出复核任务。`environment` 为 `reading / cpu / linux / gpu / multi-gpu / cluster / device` 之一，说明实践条件，不表示该环境已验收。优先链接具体章节；官方入口不稳定时保留原文入口与可查找的章节名称。

修改后运行 `node scripts/knowledge-index.mjs` 生成 `docs/knowledge-index.md` 并审阅。`npm run check-coverage` 检查它与目录一致；不得用生成文档替代原始来源审查。

`category` 为 `core` 核心必修、`specialist` 方向必修或 `optional` 可选深入。重要补充通常作为节点辅助资源记录；与目标无关的资源不强行加入依赖图。若补充项成为独立能力，应在审计中解释新增节点的理由。

`prerequisites` 是节点 ID 数组，必须无环；`resources` 第一个为暂定主资源，后续补充要有理由。`status` 诚实说明衔接及验证程度。`evidence` 必须说明可观察成果和判断条件，不允许只写“看完视频”。

## 实验 Lab

字段：`id / title / stage / nodes / source / url / hardware / status / goal / rubric / limitation / integration`；可选 `command / preparationCommand / guide / validation / reportCommit / requiredChecks`。`integration` 使用 `candidate / checked / reproduced`。`guide` 必须是站内相对地址；`validation` 保留实际运行环境、固定提交、测试数量与原始测量摘要。

`candidate` 表示尚未完成本站运行集成，`checked` 表示已有本地补充检查，`reproduced` 表示固定参考实现已有实测。原课准备入口由 `preparationCommand` 单独标识；环境验证与课程完成另记，不增加未定义的集成枚举。不得省略校外访问条件、CPU/GPU 要求或课程评分服务限制。进入“可复现”之前需补充版本锁定、依赖、操作系统、正确性测试、性能测量协议、恢复方式和具体许可记录；初版候选并不满足这些门槛。

外部代码不在浏览器里自动执行。将来运行器应隔离权限和依赖，不使用本页超时检查当作安全沙箱。引入容器也需说明挂载、网络、资源限制和退出恢复行为。

## 提交审查

修改者提供能力需求证据、原始来源、与原资源的对比、许可状态、先修变更及实验验证记录。维护者先审范围与科学准确性，再验数据与平台行为。未经批准，不公开发布新仓库和用户的个人成果。

## 报告、里程碑与文档

可导入实验设置固定 reportCommit；新增实验类型同时维护 site/reports.js 与对应测试。原始报告含 schemaVersion、lab、mode、commit、createdAt、passed、results、python、platform，results 明确区分原断言与补充检查。mode 只能为 reference 或 submission，参考通过不等于个人作品。页面只保存摘要、SHA-256 与导入时间，不存任意 HTML 或执行代码。

验收实验必须声明 `requiredChecks`，每组含稳定 `name` 与最低原测试计数 `tests`；报告保留各组的名称、计数与通过状态，不能仅凭总体 passed 或测试总数验收。对象模型名称取原阶段 ID。旧摘要无范围时仍保留，但要重新导入原报告后才计入完整材料；失败零测试报告可以保存诊断，不计入验收。里程碑不能遗漏所在阶段的核心节点。新增节点同步更新 coverage.md 与 curriculum.md，`npm run check-coverage` 检查对应关系。

milestones 的 stage、nodes、labs、criteria 必须与目录引用一致；阶段知识说明与当前版本独立通过报告齐备时只称材料齐备。新增指南加入 site/documents.js 的允许列表和 docs/index.md，运行 npm run check-docs。新增根文档同时维护构建白名单与本地服务器白名单，避免本机能读但发布缺失。
