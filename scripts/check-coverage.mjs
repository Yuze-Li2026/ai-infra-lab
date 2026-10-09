import {readFile} from 'node:fs/promises';
import {renderKnowledgeIndex} from './knowledge-index.mjs';
import {validateCatalog} from './validate.mjs';
export async function checkCoverage(root='.'){
 const c=JSON.parse(await readFile(`${root}/site/catalog.json`,'utf8'));
 validateCatalog(c);
 if((await readFile(`${root}/docs/knowledge-index.md`,'utf8')).replace(/\r\n/g,'\n')!==renderKnowledgeIndex(c))throw Error('逐项知识清单与目录不一致：运行 node scripts/knowledge-index.mjs 后审阅');
 const matrix=await readFile(`${root}/docs/coverage.md`,'utf8'),curriculum=await readFile(`${root}/docs/curriculum.md`,'utf8');
 for(const n of c.nodes){
  if(!matrix.includes('`'+n.id+'`'))throw Error(`能力覆盖表缺少节点：${n.id}`);
  const heading='### '+n.title, start=curriculum.indexOf(heading);
  const end=curriculum.indexOf('\n### ',start+heading.length);
  const section=curriculum.slice(start,end<0?undefined:end);
  if(start<0||!section.includes(n.scope))throw Error(`选章指南缺少任务或范围：${n.id}`);
 }
 console.log(`覆盖结构核对通过：${c.nodes.length} 个模块、${c.nodes.reduce((sum,n)=>sum+n.topics.length,0)} 项知识均有来源、选读、产物和环境；不代表领域穷尽或教学成效。`);
}
await checkCoverage();
