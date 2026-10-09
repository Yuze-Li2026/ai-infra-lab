import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const environmentLabels={reading:'阅读与推导',cpu:'普通 CPU',linux:'Linux',gpu:'单卡 GPU','multi-gpu':'多卡 GPU',cluster:'集群 / 管理权限',device:'指定目标设备'};
const cell=value=>String(value).replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');

export function renderKnowledgeIndex(catalog){
 const source=id=>catalog.sources.find(item=>item.id===id);
 const total=catalog.nodes.reduce((sum,node)=>sum+node.topics.length,0);
 return `# 逐项知识与原始资料

核对日期：${catalog.reviewedAt}。${catalog.nodes.length} 个学习模块细分为 ${total} 项选读任务。每项都有原始来源、章节定位、独立复核要求和实践环境。条目数量用于检查漏项，不是领域已经穷尽的证明。

先按[学习路径](learning-paths.md)选方向，再用[中文选章指南](curriculum.md)了解先修与整体目标。下表章节名称用于在原站定位；原站改版时先查看目录。练习要求由本站组织，不冒称原作者评分，也不表示对应环境已经部署。做到实践时先读[按实验准备环境](environment-preparation.md)，个人云端准备见[私有实验室](private-cloud.md)，实际环境证据见[验证记录](verification.md)。

来源、许可和选择依据可从[致谢](../CREDITS.md)复核。课程讲解、教材推导、论文原理与工具 API 各有用途，不能互相替代。英文资料保留原文并配中文任务说明；可靠的中文版本在来源目录中单独标明。

${catalog.nodes.map(node=>`## ${node.title}

模块标识：\`${node.id}\`。先修：${node.prerequisites.map(id=>catalog.nodes.find(n=>n.id===id).title).join('、')||'无'}。

| 知识与选读 | 独立复核 | 实践条件 |
| --- | --- | --- |
${node.topics.map(topic=>`| **${cell(topic.title)}** · [${cell(source(topic.source).title)}](${topic.url})；${cell(topic.section)} | ${cell(topic.outcome)} | ${environmentLabels[topic.environment]} |`).join('\n')}
`).join('\n')}
## 如何维护这份清单

修改 \`site/catalog.json\` 中节点的 \`topics\`，同步主资源、先修和覆盖审查，再运行 \`node scripts/knowledge-index.mjs\`。覆盖检查会拒绝没有来源、章节、产物或环境的条目，并核对本文与目录一致。自动检查只能验证结构；来源是否适合知识点、先修是否充分以及实验是否有效仍须人工审查和真实运行。
`;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
 await writeFile('docs/knowledge-index.md',renderKnowledgeIndex(catalog));
 console.log(`Knowledge index updated: ${catalog.nodes.reduce((sum,node)=>sum+node.topics.length,0)} topics`);
}
