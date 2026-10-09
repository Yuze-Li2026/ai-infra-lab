import {validateReportSummary} from './reports.js';
export const STORAGE_KEY='ai-infra-lab.progress.v1';
export const MAX_BACKUP_BYTES=2*1024*1024;
export const DRAFT_KEY='ai-infra-lab.drafts.v1';
export const emptyProgress=()=>({schemaVersion:1,updatedAt:new Date().toISOString(),records:{},labReports:{}});
export function validateProgress(value,nodes){
  if(!value||value.schemaVersion!==1||!value.records||typeof value.records!=='object'||Array.isArray(value.records))throw new Error('备份格式或版本不兼容。');
  const ids=new Set(nodes.map(n=>n.id)); const records={};
  if(Object.keys(value.records).length>nodes.length)throw new Error('备份含过多记录。');
  for(const [id,r] of Object.entries(value.records)){
    if(!ids.has(id)||!r||!['started','submitted'].includes(r.status)||typeof r.evidence!=='string'||r.evidence.length>6000||typeof r.updatedAt!=='string'||Number.isNaN(Date.parse(r.updatedAt)))throw new Error('备份包含未知节点或无效记录。');
    if(r.status==='submitted'&&r.evidence.trim().length<20)throw new Error('提交记录缺少成果说明。');
    if(Date.parse(r.updatedAt)>Date.now()+300000)throw new Error('备份记录的时间明显超前，请检查设备时钟或备份内容。');
    records[id]={status:r.status,evidence:r.evidence,updatedAt:new Date(r.updatedAt).toISOString()};
  }
  const labReports={};
  if(value.labReports!==undefined){
    if(!value.labReports||typeof value.labReports!=='object'||Array.isArray(value.labReports)||Object.keys(value.labReports).length>6)throw new Error('实验报告备份无效。');
    for(const [id,summary]of Object.entries(value.labReports)){const report=validateReportSummary(summary);if(id!==report.lab)throw new Error('实验报告标识不匹配。');labReports[id]=report;}
  }
  return {schemaVersion:1,updatedAt:new Date().toISOString(),records,labReports};
}
export function ready(node,progress){return node.prerequisites.every(id=>progress.records[id]?.status==='submitted');}
export function nextNode(nodes,progress){
  const available=nodes.filter(n=>progress.records[n.id]?.status!=='submitted'&&ready(n,progress));
  const started=available.filter(n=>progress.records[n.id]?.status==='started').sort((a,b)=>Date.parse(progress.records[b.id].updatedAt)-Date.parse(progress.records[a.id].updatedAt));
  return started[0]||available.find(n=>n.category==='core')||available[0];
}
export function mergeProgress(current,incoming,nodes){
  const a=validateProgress(current,nodes),b=validateProgress(incoming,nodes);
  const records={...a.records};
  for(const [id,r] of Object.entries(b.records)){
    if(!records[id]||Date.parse(r.updatedAt)>Date.parse(records[id].updatedAt))records[id]=r;
  }
  const labReports={...a.labReports};
  for(const [id,r]of Object.entries(b.labReports))if(!labReports[id]||Date.parse(r.importedAt)>Date.parse(labReports[id].importedAt))labReports[id]=r;
  return validateProgress({...a,records,labReports},nodes);
}
export function record(progress,id,status,evidence,nodes){
  if(!nodes.some(n=>n.id===id))throw new Error('未知学习节点。');
  const time=Math.max(Date.now(),Date.parse(progress.records[id]?.updatedAt||0)+1||0);
  return validateProgress({...progress,records:{...progress.records,[id]:{status,evidence,updatedAt:new Date(time).toISOString()}}},nodes);
}
export function backupWithDrafts(progress,drafts,nodes){
  let result=progress;
  for(const [id,text] of drafts)result=record(result,id,'started',text,nodes);
  return result;
}
