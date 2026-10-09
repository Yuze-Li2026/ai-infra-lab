import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarizeReport,validateReportSummary,milestoneStatus,reportAccepted} from '../site/reports.js';
import {emptyProgress,validateProgress,mergeProgress,record} from '../site/core.js';
const catalog=JSON.parse(readFileSync('site/catalog.json','utf8'));
const lab=catalog.labs.find(l=>l.id==='dbdb');
const raw={schemaVersion:1,lab:'dbdb',mode:'submission',commit:lab.reportCommit,createdAt:new Date().toISOString(),passed:true,results:[{name:'upstream-suite',tests:21,passed:true}],python:'3.12',platform:'test'};
const fingerprint='a'.repeat(64);
test('report import rejects mismatched project, source version and contradictory result',()=>{
 const r=summarizeReport(raw,lab,fingerprint);assert.equal(r.tests,21);assert.equal(r.mode,'submission');
 for(const patch of [{lab:'gpu'},{commit:'old-version'},{passed:false},{results:[{passed:true,tests:-1}]},{mode:'certificate'}])assert.throws(()=>summarizeReport({...raw,...patch},lab,fingerprint));
 assert.throws(()=>validateReportSummary({...r,sha256:'not-a-hash'}));
 assert.throws(()=>validateReportSummary({...r,createdAt:new Date(Date.now()+3600000).toISOString()}));
});
test('partial stages and old summaries cannot satisfy a complete milestone; failed zero-test runs remain readable',()=>{
 const object=catalog.labs.find(l=>l.id==='object-model');
 const report={...raw,lab:object.id,commit:object.reportCommit,results:[{stage:'01-smalltalk-like',tests:5,passed:true}]};
 assert.equal(reportAccepted(object,summarizeReport(report,object,fingerprint)),false);
 report.results=object.requiredChecks.map(r=>({stage:r.name,tests:r.tests,passed:true}));
 const full=summarizeReport(report,object,fingerprint);assert.equal(reportAccepted(object,full),true);
 const legacy={...full};delete legacy.checks;assert.equal(reportAccepted(object,validateReportSummary(legacy)),false);
 assert.equal(reportAccepted(lab,summarizeReport({...raw,results:[{name:'upstream-suite',tests:1,passed:true}]},lab,fingerprint)),false);
 assert.equal(summarizeReport({...raw,passed:false,results:[{name:'setup',tests:0,passed:false}]},lab,fingerprint).tests,0);
 assert.throws(()=>summarizeReport({...report,results:[report.results[0],report.results[0]]},object,fingerprint));
});
test('old backups remain compatible; report backups merge by import time and preserve node records',()=>{
 const legacy=validateProgress({schemaVersion:1,records:{}},catalog.nodes);assert.deepEqual(legacy.labReports,{});
 const r=summarizeReport(raw,lab,fingerprint),a=emptyProgress();a.labReports.dbdb=r;
 const b=record(emptyProgress(),'computer','started','已有记录',catalog.nodes);b.labReports.dbdb={...r,passed:false,checks:r.checks.map(c=>({...c,passed:false})),importedAt:new Date(Date.parse(r.importedAt)+1).toISOString()};
 const merged=mergeProgress(a,b,catalog.nodes);assert.equal(merged.labReports.dbdb.passed,false);assert.equal(merged.records.computer.evidence,'已有记录');
 assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(a)),catalog.nodes).labReports,a.labReports);
});
test('stage readiness requires knowledge evidence and passing independent report for current version',()=>{
 let p=emptyProgress();const m=milestoneStatus(catalog,p,2);
 for(const n of m.nodes)p=record(p,n.id,'submitted','已独立完成设计与代码，保留原测试、边界案例和原理解释供复核。',catalog.nodes);
 p.labReports.dbdb=summarizeReport({...raw,mode:'reference'},lab,fingerprint);assert.equal(milestoneStatus(catalog,p,2).ready,false);
 p.labReports.dbdb=summarizeReport(raw,lab,fingerprint);assert.equal(milestoneStatus(catalog,p,2).ready,true);
 p.labReports.dbdb.commit='obsolete';assert.equal(milestoneStatus(catalog,p,2).ready,false);
});
