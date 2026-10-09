# AI Infra Lab

**From Zero to AI Infrastructure · 站在巨人的肩膀上。**

面向中文学习者的本地优先学习工作台。通过原始教学资源、显式先修关系和工程成果记录，从零开始理解 AI 系统。

已完成本地学习与验收链：41 项原始来源、45 个知识节点、11 项实验入口，6 项有本地执行流程；固定版本对象运行时、DBDB、micrograd、共识及真实单卡 GPU 已验证。覆盖包括数据与存储、模型评估、实验管理、通信与内存、集群调度、编译器、隐私、成本、边缘和多模态；见[完整领域覆盖矩阵](docs/coverage.md)、[方向学习路径](docs/learning-paths.md)和[逐文件审查](docs/file-audit.md)。完整原课高级作业、多卡与长期教学效果仍需进一步验证。不依赖 Codex、商业 AI、登录或后端服务。

## 立即使用

直接打开[在线学习工作台](https://yuze-li2026.github.io/ai-infra-lab/)或[在线文档中心](https://yuze-li2026.github.io/ai-infra-lab/#read/docs/index.md)。公开源码：[Yuze-Li2026/ai-infra-lab](https://github.com/Yuze-Li2026/ai-infra-lab)。本地使用方式如下。

安装 [Node.js](https://nodejs.org/) 22 或更新版本后，在 Windows 双击 `start.cmd`；或在本目录运行：

```sh
npm start
```

在浏览器打开 **http://127.0.0.1:4173**。不需要 `npm install`。页面显示当前推荐任务，点击任务查看原资源、中文导读、先修和成果要求。学习记录存于本浏览器，使用右上角按钮备份与恢复。

其他系统使用相同命令。端口占用时：PowerShell 执行 `$env:PORT=4174`，再执行 `npm start`。直接双击 HTML 不支持目录读取。

## 当前可用

- 中文学习工作台；45 个节点的知识依赖图，可按核心、方向和可选范围筛选，允许预览先修和按已有成果跳过。
- 41 项来源资源，记录原作者、版本、语言、许可、研究证据和 12 项定性评估。
- 11 项实验入口；6 项有本地运行流程，完整原课深化实验保留实际集成状态。
- 阶段复核、实验报告导入与站内指南阅读；本地成果记录与 JSON 备份合并恢复。提交状态是本人自报，不是能力认证。
- CS50 Indoor Voice 的补充 CLI 检查，检测正确结果、边界情况、超时和输出过量。
- AOSA 对象模型项目：固定原始提交、保留许可、运行 28 项原测试，提供独立提交检查与性能对照。
- 刷新后恢复本标签页草稿、含草稿的备份、跨标签页写入锁、损坏数据保护。
- 无构建依赖的静态输出，以及 GitHub Actions 验证和手动 Pages 发布流程。

## 检查与构建

```sh
npm run check
```

构建结果在 `dist/`，可部署于 GitHub Pages 的项目子路径。构建生成 SHA-256 清单并保留上一份输出到 `artifacts/`。实验需要 Python 3.10+，本次使用 3.12.14 验证；可用 `LAB_TEST_PYTHON` 指定测试解释器路径。缺失 Python 时的跳过不算实验验证通过。

统一实验入口：`node scripts/lab.mjs object-model --benchmark`（也支持 dbdb、consensus、micrograd、gpu）。按[实验指南](docs/object-model-lab.md)验收自己的实现。

链接检查：`npm run check-links`，会访问外部站点并写入 `artifacts/links.json`；403、429、超时要人工复核，不能直接判定教材失效。

## 文档入口

[完整文档中心](docs/index.md)按学习者、实验者和维护者分类；[常见故障](docs/faq.md)、[维护者教程](docs/maintainer-tutorial.md)与[安全政策](SECURITY.md)均提供具体操作和边界。

[学习路径依据与覆盖复核](docs/path-evidence.md)把 CMU DLSys、Stanford CS336、MLSysBook 原作者路径与本站节点、成果要求逐项对照；具体精读范围见选章指南。

- [零基础使用及入门验收](docs/getting-started.md)
- [研究、能力模型、覆盖缺口](docs/research.md)
- [产品架构与开源工具评估](docs/architecture.md)
- [声明式资源与实验扩展规范](docs/extensions.md)
- [验收标准](docs/acceptance.md)
- [优化审查与已修复问题](docs/optimization-review.md)
- [完整本地验收](docs/release-complete.md) / [逐条提示词审计](docs/requirements-audit.md) / [选章与诊断](docs/curriculum.md) / [中英术语表](docs/glossary.md)
- [中文维护与部署指南](docs/maintenance.md)
- [来源与致谢](CREDITS.md) / [贡献指南](CONTRIBUTING.md)

## 发布状态

2026-10-09 已取得所有者公开发布授权，核对目标仓库不存在后创建上述公开仓库。远程与本地源码历史的提交、文件树哈希一致；[Windows/Linux 验证](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37877772893)和[Pages 部署](https://github.com/Yuze-Li2026/ai-infra-lab/actions/runs/37878054021)成功。0.3.0 当时的线上 24 项任务、29 份文档/许可、四种屏宽及备份恢复已实测；具体文件清单与发布修复见[验证记录](docs/verification.md)。本轮 0.4.0 检查与发布状态以逐文件审查和验证记录为准；后续提交的最新结果可从仓库 Actions 核对，账号其他项目未修改。

原创代码与组织说明使用 MIT 许可证。外部教材、课程、实验和代码保留各自许可；本站许可证不授予对它们的再分发权利。
