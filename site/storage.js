import {STORAGE_KEY,DRAFT_KEY,emptyProgress,validateProgress,mergeProgress} from './core.js';

// Re-read immediately before each write so an older tab retains newer disk records.
// localStorage is not transactional; the storage event refreshes other open tabs.
export function persistProgress(storage,next,nodes,{restore=false}={}){
  const validated=validateProgress(next,nodes);
  const raw=storage.getItem(STORAGE_KEY);
  let existing=emptyProgress();
  if(raw!==null){
    try{existing=validateProgress(JSON.parse(raw),nodes);}
    catch{
      if(!restore)throw new Error('已有记录无法读取，已保留原数据。请导出本页进度，再使用恢复备份修复。');
      // Explicit restore preserves the original bytes before replacing unreadable data.
      storage.setItem(`${STORAGE_KEY}.recovery.${Date.now()}`,raw);
    }
  }
  const merged=mergeProgress(validated,existing,nodes);
  storage.setItem(STORAGE_KEY,JSON.stringify(merged));
  return merged;
}

export async function persistProgressLocked(storage,next,nodes,options={},locks=globalThis.navigator?.locks){
  if(locks?.request)return locks.request(STORAGE_KEY,()=>persistProgress(storage,next,nodes,options));
  return persistProgress(storage,next,nodes,options);
}

export function readDrafts(storage,nodes){
  const raw=storage.getItem(DRAFT_KEY);if(!raw)return new Map();
  const value=JSON.parse(raw),ids=new Set(nodes.map(n=>n.id));
  if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('草稿格式无效');
  const result=new Map();
  for(const [id,text]of Object.entries(value)){
    if(!ids.has(id)||typeof text!=='string'||text.length>6000)throw new Error('草稿内容无效');
    result.set(id,text);
  }
  return result;
}
export function writeDrafts(storage,drafts){storage.setItem(DRAFT_KEY,JSON.stringify(Object.fromEntries(drafts)));}
