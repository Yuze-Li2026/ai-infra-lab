# AI Infra Lab

AI Infra Lab 是面向中文学习者的 AI 基础设施学习工作台。它把原始课程、先修关系、工程实验和个人成果记录连接起来，支持在线访问和本地运行。

[打开工作台](https://yuze-li2026.github.io/ai-infra-lab/) · [阅读文档](docs/index.md) · [查看发布版本](https://github.com/Yuze-Li2026/ai-infra-lab/releases)

## 开始使用

直接[打开在线工作台](https://yuze-li2026.github.io/ai-infra-lab/)即可阅读中文学习说明、选择任务和记录成果，无需安装或注册。知识点的“打开中文学习指南”直达对应选章与复核任务，原课和官方文档保留为深入学习的入口。

需要本地运行时，再从[源码仓库](https://github.com/Yuze-Li2026/ai-infra-lab)下载并解压完整源码。安装 Node.js 22 或更新版本后，Windows 用户双击 `start.cmd`，也可以在项目目录运行：

```sh
npm start
```

打开[本地工作台](http://127.0.0.1:4173)。普通浏览和构建无需安装 npm 依赖，无需账号或商业 AI 服务。页面根据先修关系推荐任务；学习记录保存在当前浏览器，通过“备份进度”和“恢复备份”迁移。第一次做实验请阅读[入门教程](docs/getting-started.md)。

## 学习与实验

- 45 个知识节点连接 41 项原始来源，包含先修、选章、操作任务和成果要求。范围依据见[覆盖矩阵](docs/coverage.md)与[学习路径依据](docs/path-evidence.md)。
- 11 项实验入口提供专用指南。6 项本地实验支持运行与报告，另外 5 项连接原课源码准备和测试流程。
- 本地实验包括 Indoor Voice、对象模型、DBDB、micrograd、共识模拟和单卡 GPU。报告区分参考复现与自己的实现，参考报告不计个人作品通过。
- 原课工具支持 CS50 最终项目、OSTEP MapReduce、DLSys HW0–HW2、MIT Raft 和 CS336 A1/A2。环境、固定版本和命令见[原课工作流程](docs/project-workflows.md)。课程 TODO 由学习者完成。
- 学习说明、草稿和报告摘要可以备份恢复。本人提交表示留下了成果记录，不构成独立能力认证。

GPU 与系统实验需要相应的本地工具和硬件，网站不远程执行代码。完整原课、多卡、真实集群及生产服务仍须按各自条件验证；具体状态见[交付清单](docs/delivery-checklist.md)和[验证记录](docs/verification.md)。

## 维护与验证

AI 接手从仓库根目录 `AGENTS.md` 和[AI 维护流程](docs/ai-maintenance.md)开始；学习者可以直接描述改进想法。`npm run maintenance:status` 离线查看当前源码及报告是否过期，不安装依赖或发布网站。

维护者在项目目录安装固定开发依赖，并按[环境指南](docs/getting-started.md)准备 Python 3.12、CPU 实验依赖和 PyTorch：

```sh
npm ci --ignore-scripts
npm run check
```

完整检查覆盖目录、文档格式、链接、知识覆盖、实际实验、构建和发布文件校验。缺少实验依赖或出现跳过，不能作为完整验收通过。`LAB_TEST_PYTHON` 可以指定测试解释器的完整路径。

界面变更使用 `npm run test:browser`，检查学习、备份、恢复、报告、站内文档、键盘、手机布局和无障碍规则。需要已安装的 Edge（Windows 默认）或 Chrome；可用 `LAB_BROWSER_PATH` 指定。脚本启动独立测试服务，结束后关闭，不自动下载浏览器。

仅检查静态网站与构建：

```sh
npm run check-site
```

输出位于 `dist/`，包含逐文件 SHA-256 清单。构建保留上一份输出，个人数据、实验环境和工作目录不进入公开网站。联网检查资源入口使用 `npm run check-links`；超时和访问限制需复核，不能直接判为资源失效。

## 文档与贡献

- [文档中心](docs/index.md)：教程、实验、维护和研究入口。
- [写作规范](docs/writing-guide.md)：文档类型、术语、格式、示例验证与审校。
- [维护者教程](docs/maintainer-tutorial.md)：修改、检查、发布与回滚。
- [贡献指南](CONTRIBUTING.md)和[安全政策](SECURITY.md)：提交要求、问题反馈与数据边界。
- [来源与致谢](CREDITS.md)：作者、原始入口、版本和许可。

公开版本由 [GitHub Actions](https://github.com/Yuze-Li2026/ai-infra-lab/actions)验证，Pages 仅部署已经通过同提交 Windows/Linux 检查的内容。发布附件保存源码、静态网站、验证记录与校验和，历史发布记录不代替当前提交的检查。

本站原创代码与组织说明使用 MIT 许可证。外部教材、课程、数据和代码保留各自许可；本站许可证不授予它们的再分发权利。
