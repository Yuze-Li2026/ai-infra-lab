import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {renderKnowledgeIndex} from './knowledge-index.mjs';
import {validateCatalog} from './validate.mjs';
import {catalogCounts,verifyDocumentCounts} from './catalog-counts.mjs';
export function verifyCurriculum(c,curriculum){
 const categories={core:'核心必修',specialist:'方向必修',optional:'可选深入'};
 for(const n of c.nodes){
  const heading='### '+n.title+'\n',start=curriculum.indexOf(heading);
  if(start<0||curriculum.indexOf(heading,start+heading.length)>=0)throw Error(`选章指南缺少或重复任务：${n.id}`);
  const end=curriculum.indexOf('\n### ',start+heading.length),section=curriculum.slice(start,end<0?undefined:end);
  if(!section.includes(n.scope))throw Error(`选章指南范围不符：${n.id}`);
  const prerequisites=n.prerequisites.map(id=>c.nodes.find(node=>node.id===id).title).join('、')||'无，直接开始';
  if(!section.includes(`类别：${categories[n.category]}。前置：${prerequisites}。`))throw Error(`选章指南先修或分类不符：${n.id}`);
  for(const id of n.resources){
   const source=c.sources.find(item=>item.id===id);
   if(!section.includes(']('+source.url+')'))throw Error(`选章指南缺少当前来源：${n.id}/${id}`);
  }
 }
}
export async function checkCoverage(root='.'){
 const c=JSON.parse(await readFile(`${root}/site/catalog.json`,'utf8'));
 validateCatalog(c);
 const counts=catalogCounts(c);
 // Current guides use live totals; versioned audit logs retain historical counts.
 for(const path of ['README.md','docs/coverage.md','docs/curriculum.md','docs/index.md','docs/knowledge-index.md','docs/requirements-audit.md','docs/delivery-checklist.md']){
  verifyDocumentCounts(await readFile(`${root}/${path}`,'utf8'),counts,path);
 }
 if((await readFile(`${root}/docs/knowledge-index.md`,'utf8')).replace(/\r\n/g,'\n')!==renderKnowledgeIndex(c))throw Error('逐项知识清单与目录不一致：运行 node scripts/knowledge-index.mjs 后审阅');
 const matrix=await readFile(`${root}/docs/coverage.md`,'utf8'),curriculum=(await readFile(`${root}/docs/curriculum.md`,'utf8')).replace(/\r\n/g,'\n');
 verifyCurriculum(c,curriculum);
 for(const n of c.nodes){
  if(!matrix.includes('`'+n.id+'`'))throw Error(`能力覆盖表缺少节点：${n.id}`);
 }
 console.log(`覆盖结构核对通过：${c.nodes.length} 个模块、${c.nodes.reduce((sum,n)=>sum+n.topics.length,0)} 项知识均有来源、选读、产物和环境；不代表领域穷尽或教学成效。`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await checkCoverage();
