# 贡献指南

欢迎贡献原始资料、资源评估、中文术语修订、实验复现和平台修复。优先改善现有资源连接，不重复生成一套课程。

提交时说明：实际能力需求、原始来源及作者、版本与许可、先修和适用范围、与当前资源相比的价值、真实验证方式及局限。资源初步访问不能标为复现成功；未经校验的译文不得标为准确官方中文资料。

维护依赖通过 `npm ci --ignore-scripts` 安装，平台修改执行 `npm run check`。文档遵循[写作规范](docs/writing-guide.md)，运行格式与链接检查后逐份审校。重大图谱变更检查依赖和进度迁移。请勿提交课程答案、未授权材料、个人学习数据、模型权重和凭据。

问题反馈尽量包含系统、Node/Python 版本、复现步骤与错误输出；删去个人信息。通过[Issues](https://github.com/Yuze-Li2026/ai-infra-lab/issues)反馈普通问题，通过[Pull requests](https://github.com/Yuze-Li2026/ai-infra-lab/pulls)提交审阅。安全漏洞使用 SECURITY 中的私密入口。
