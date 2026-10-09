export const REPORT_LABS=['indoor','object-model','dbdb','consensus','micrograd','gpu'];
export const MAX_REPORT_BYTES=1024*1024;
const text=(value,max=600)=>typeof value==='string'&&value.length<=max;
export function validateReportSummary(value){
 if(!value||!REPORT_LABS.includes(value.lab)||!['reference','submission'].includes(value.mode)||typeof value.passed!=='boolean'||!Number.isSafeInteger(value.tests)||value.tests<1||value.tests>100000||!text(value.commit,128)||!text(value.python,300)||!text(value.platform)||!text(value.createdAt,40)||Number.isNaN(Date.parse(value.createdAt))||Date.parse(value.createdAt)>Date.now()+300000||!text(value.importedAt,40)||Number.isNaN(Date.parse(value.importedAt))||Date.parse(value.importedAt)>Date.now()+300000||!/^[a-f0-9]{64}$/.test(value.sha256))throw Error('实验报告摘要无效。');
 return {lab:value.lab,mode:value.mode,passed:value.passed,tests:value.tests,commit:value.commit,python:value.python,platform:value.platform,createdAt:new Date(value.createdAt).toISOString(),importedAt:new Date(value.importedAt).toISOString(),sha256:value.sha256};
}
export function summarizeReport(raw,lab,sha256){
 if(!raw||raw.schemaVersion!==1||raw.lab!==lab.id||!REPORT_LABS.includes(raw.lab)||!Array.isArray(raw.results)||!raw.results.length||raw.results.length>1000)throw Error('这份报告不属于所选实验，或格式不兼容。');
 const mode=raw.mode||(raw.lab==='indoor'&&raw.checker==='AI Infra Lab supplemental checks v0.1'?'submission':null);
 if(raw.results.some(r=>!r||typeof r.passed!=='boolean'||r.tests!==undefined&&(!Number.isSafeInteger(r.tests)||r.tests<0)))throw Error('报告含无效测试结果。');
 if(raw.passed!==raw.results.every(r=>r.passed))throw Error('报告总体状态与各测试结果矛盾。');
 const commit=raw.commit||(raw.lab==='indoor'?'supplemental-v0.1':'');
 if(lab.reportCommit&&commit!==lab.reportCommit)throw Error('报告的原项目版本不匹配。请使用本版实验运行器复验。');
 return validateReportSummary({lab:raw.lab,mode,passed:raw.passed,tests:raw.results.reduce((sum,r)=>sum+(r.tests??1),0),commit,python:String(raw.python||'报告未记录'),platform:String(raw.platform||'报告未记录'),createdAt:raw.createdAt||raw.submittedAt,importedAt:new Date().toISOString(),sha256});
}
export function milestoneStatus(catalog,progress,stage){
 const milestone=catalog.milestones?.find(m=>m.stage===stage);
 if(!milestone)return null;
 const nodes=milestone.nodes.map(id=>catalog.nodes.find(n=>n.id===id));
 const submitted=nodes.filter(n=>progress.records[n.id]?.status==='submitted').length;
 const reports=milestone.labs.map(id=>({id,report:progress.labReports?.[id]}));
 const accepted=reports.filter(r=>r.report?.mode==='submission'&&r.report.passed&&r.report.commit===catalog.labs.find(l=>l.id===r.id)?.reportCommit).length;
 return {milestone,nodes,reports,submitted,accepted,ready:submitted===nodes.length&&accepted===reports.length};
}
