import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
const text=`# 来源与致谢

研究日期：${catalog.reviewedAt}。本站主要提供原始链接与原创中文导读。随项目分发的精选第三方实验代码包括 AOSA 对象模型、DBDB、共识与 micrograd；各自 upstream 目录保留固定提交、校验和与原始许可证。初审不代表已验证完整教学效果。本站 MIT 许可证不覆盖第三方材料。

${catalog.sources.map(s=>`## ${s.title}

- 原作者：${s.author}
- 来源：[${s.title}](${s.url})
- 阅读版本：${s.readingLabel||(s.language==='zh'?'中文':'英文原文')}${s.originalUrl?'；[英文对照]('+s.originalUrl+')':''}
- 版本：${s.version}
- 许可：${s.license}；[核查入口](${s.licenseUrl})
- 使用方式：${s.reuse}
- 验证：${s.verification}；${s.reviewedAt}
- 局限：${s.limitations}
`).join('\n')}
## 集成代码与工具

Carl Friedrich Bolz 的 A Simple Object Model 代码与测试来自 aosabook/500lines，提交 fba689d101eb5600f5c8f4d7fd79912498e950e2。Copyright (c) Carl Friedrich Bolz。MIT 代码及 CC BY 3.0 文字的许可原文保留在 labs/object-model/upstream/LICENSE.md；未复制书籍正文。

DBDB 作者 Taavi Burns；Clustering by Consensus 作者 Dustin J. Mitchell。同属 aosabook/500lines 固定提交。micrograd 作者 Andrej Karpathy，固定提交 7bc720e951fe422b8f8814aa5aa1b64121d26b4c，MIT 原文位于 labs/micrograd/upstream/LICENSE。AOSA 正文为 CC BY 3.0，本站未复制书籍正文；保留的许可文件适用于代码。

站内阅读器复用 Marked 18.1.0（MIT）及 DOMPurify 3.4.16（Apache-2.0 或 MPL-2.0 双许可，保留原许可）；版本、逐文件 SHA-256 与原许可位于 site/vendor。平台无 CDN 与商业运行服务依赖。实验依赖 portalocker、pywin32、fissix、appdirs 及可选 PyTorch/NumPy，见 labs 的版本锁与上游各自许可；这些安装包不随网站分发。

对象模型与共识、数据库适配器组织保留的原测试；兼容修改独立于原始文件。Indoor Voice、GPU 和 micrograd 的有限差分/训练检查是补充检查，不能冒充官方课程评分。Playwright 仅用于可选开发验收，不随平台分发。

环境复验使用 [kind/Kubernetes](https://kind.sigs.k8s.io/)、[Ray](https://github.com/ray-project/ray)、[vLLM](https://github.com/vllm-project/vllm) 和 [IREE](https://github.com/iree-org/iree) 的官方发布；固定镜像摘要、包版本和平台条件保留在 labs 的独立目录。Qwen 团队的 [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) 使用固定提交与 Apache-2.0 许可。镜像、安装包和模型不随本站源码或网页再分发，下载时仍须遵守各上游及其依赖的许可。环境检查由本站编写，不是这些项目的官方认证。

容器端口查询依据 Docker 官方 [docker container port](https://docs.docker.com/reference/cli/docker/container/port/) 与[端口发布说明](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/)，2026-10-10 核对；仅链接并用于复验流程，不复制文档正文。

MLIR Toy 源码构建取自 [LLVM 官方仓库](https://github.com/llvm/llvm-project/tree/ca7933e47d3a3451d81e72ac174dcb5aa28b59d1/mlir/examples/toy)，LLVM 22.1.8，提交 ca7933e47d3a3451d81e72ac174dcb5aa28b59d1，Apache-2.0 WITH LLVM-exception；七章原测试随上游源码在独立环境执行，本站保留接入脚本与版本记录，不再分发整套 LLVM。

本文件由 site/catalog.json 生成；修改来源后运行 node scripts/credits.mjs。
`;
await writeFile('CREDITS.md',text,'utf8');
console.log(`Credits updated: ${catalog.sources.length} sources`);
