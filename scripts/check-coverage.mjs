import {readFile} from 'node:fs/promises';
export async function checkCoverage(root='.'){
 const c=JSON.parse(await readFile(`${root}/site/catalog.json`,'utf8'));
 const matrix=await readFile(`${root}/docs/coverage.md`,'utf8'),curriculum=await readFile(`${root}/docs/curriculum.md`,'utf8');
 for(const n of c.nodes){
  if(!matrix.includes('`'+n.id+'`'))throw Error(`能力覆盖表缺少节点：${n.id}`);
  const heading='### '+n.title, start=curriculum.indexOf(heading);
  const end=curriculum.indexOf('\n### ',start+heading.length);
  const section=curriculum.slice(start,end<0?undefined:end);
  if(start<0||!section.includes(n.scope))throw Error(`选章指南缺少任务或范围：${n.id}`);
 }
 console.log(`覆盖结构核对通过：${c.nodes.length} 个节点均有矩阵与选章任务；不代表领域穷尽或教学成效。`);
}
await checkCoverage();
