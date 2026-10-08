import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
const text=`# 来源与致谢

研究日期：${catalog.reviewedAt}。本站主要提供原始链接与原创中文导读。唯一随项目分发的第三方实验代码是 AOSA 对象模型项目：固定提交、文件校验和原始许可证位于 labs/object-model/upstream。初审不代表已验证完整教学效果。本站 MIT 许可证不覆盖第三方材料。

${catalog.sources.map(s=>`## ${s.title}

- 原作者：${s.author}
- 来源：[${s.title}](${s.url})
- 版本：${s.version}
- 许可：${s.license}；[核查入口](${s.licenseUrl})
- 使用方式：${s.reuse}
- 验证：${s.verification}；${s.reviewedAt}
- 局限：${s.limitations}
`).join('\n')}
## 集成代码与工具

Carl Friedrich Bolz 的 A Simple Object Model 代码与测试来自 aosabook/500lines，提交 fba689d101eb5600f5c8f4d7fd79912498e950e2。Copyright (c) Carl Friedrich Bolz。MIT 代码及 CC BY 3.0 文字的许可原文保留在 labs/object-model/upstream/LICENSE.md；未复制书籍正文。

平台使用浏览器、Node.js 与 Python 标准库，无第三方运行时包。对象模型适配器只组织原测试运行；Indoor Voice 检查器为原创补充检查，不是 CS50 官方评分。Playwright 仅用于可选开发验收，不随平台分发。

本文件由 site/catalog.json 生成；修改来源后运行 node scripts/credits.mjs。
`;
await writeFile('CREDITS.md',text,'utf8');
console.log(`Credits updated: ${catalog.sources.length} sources`);
