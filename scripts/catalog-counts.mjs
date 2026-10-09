// Count distinct catalog records, not references to the same source or lab.
export function catalogCounts(catalog){
  return {nodes:catalog.nodes.length,topics:catalog.nodes.reduce((sum,node)=>sum+node.topics.length,0),
    sources:catalog.sources.length,labs:catalog.labs.length,
    runnableLabs:catalog.labs.filter(lab=>Boolean(lab.command)).length,
    courseLabs:catalog.labs.filter(lab=>Boolean(lab.preparationCommand)).length};
}

export function verifyDocumentCounts(text,counts,path){
  const patterns={
    nodes:/(\d+)\s*(?:(?:个\s*)?(?:学习|知识)?模块|(?:个\s*)?(?:知识)?节点)/g,
    topics:/(\d+)\s*项\s*(?:选读任务|具体选读|知识(?:点)?(?:的|[，、：]))/g,
    sources:/(\d+)\s*(?:[项个]\s*)?(?:原始)?来源/g,
    labs:/(\d+)\s*[项个]\s*实验入口/g,
    runnableLabs:/(\d+)\s*项\s*本地实验/g
  };
  for(const [key,pattern] of Object.entries(patterns))for(const match of text.matchAll(pattern)){
    if(Number(match[1])!==counts[key])throw Error(`${path} 数量不符：${match[0]}，目录实际为 ${counts[key]}（${key}）`);
  }
}
