import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalog} from '../scripts/validate.mjs';
import {emptyProgress,nextNode,record,ready,validateProgress,mergeProgress,STORAGE_KEY,MAX_BACKUP_BYTES,backupWithDrafts} from '../site/core.js';
import {persistProgress,persistProgressLocked,readDrafts,writeDrafts} from '../site/storage.js';
const catalog=JSON.parse(readFileSync('site/catalog.json','utf8'));
test('catalog references and graph are valid',()=>assert.equal(validateCatalog(catalog).nodes,catalog.nodes.length));
test('dependency cycle and missing sources rejected',()=>{const c=structuredClone(catalog);c.nodes[0].prerequisites=['python'];assert.throws(()=>validateCatalog(c),/cycle/);const d=structuredClone(catalog);d.nodes[0].resources=['missing-source'];assert.throws(()=>validateCatalog(d),/Unknown resource/);});
test('zero beginner can advance through prerequisites',()=>{let p=emptyProgress();assert.equal(nextNode(catalog.nodes,p).id,'computer');assert.equal(ready(catalog.nodes.find(n=>n.id==='python'),p),false);p=record(p,'computer','submitted','已独立创建文件并运行程序，保存截图并解释了输出与文件路径的区别。',catalog.nodes);assert.equal(ready(catalog.nodes.find(n=>n.id==='python'),p),true);assert.equal(nextNode(catalog.nodes,p).id,'arithmetic');});
test('self reported mastery requires evidence; unknown backup versions and IDs rejected',()=>{assert.throws(()=>record(emptyProgress(),'computer','submitted','done',catalog.nodes));assert.throws(()=>validateProgress({schemaVersion:2,records:{}},catalog.nodes));assert.throws(()=>validateProgress({schemaVersion:1,records:{evil:{}}},catalog.nodes));});
test('backup round trip preserves evidence without accepting unknown fields',()=>{const p=record(emptyProgress(),'python','started','<script>alert(1)</script>',catalog.nodes);const round=validateProgress(JSON.parse(JSON.stringify(p)),catalog.nodes);assert.equal(round.records.python.evidence,p.records.python.evidence);assert.equal(Object.getPrototypeOf(round.records),Object.prototype);});
test('recommend the most recent eligible active task before unopened nodes',()=>{
 let p=record(emptyProgress(),'arithmetic','started','数学草稿',catalog.nodes);
 assert.equal(nextNode(catalog.nodes,p).id,'arithmetic');
 p=record(p,'python','started','尚不满足先修',catalog.nodes);
 assert.equal(nextNode(catalog.nodes,p).id,'arithmetic');
});
test('maximum catalog-sized progress can be exported and reimported',()=>{
 const p=emptyProgress();for(const n of catalog.nodes)p.records[n.id]={status:'started',evidence:'学'.repeat(6000),updatedAt:new Date().toISOString()};
 const bytes=Buffer.from(JSON.stringify(p,null,2));assert.ok(bytes.length>250000);assert.ok(bytes.length<=MAX_BACKUP_BYTES);assert.deepEqual(validateProgress(JSON.parse(bytes),catalog.nodes).records,p.records);
});
const memoryStorage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),data};};
test('saving from a stale tab retains records written by another tab',()=>{
 const storage=memoryStorage();const a=record(emptyProgress(),'computer','started','A 的记录',catalog.nodes),b=record(emptyProgress(),'arithmetic','started','B 的记录',catalog.nodes);
 persistProgress(storage,a,catalog.nodes);const merged=persistProgress(storage,b,catalog.nodes);
 assert.deepEqual(Object.keys(merged.records).sort(),['arithmetic','computer']);
 assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).records,merged.records);
});
test('malformed existing data is protected; explicit restore preserves a recovery copy',()=>{
 const storage=memoryStorage();storage.setItem(STORAGE_KEY,'{broken');
 assert.throws(()=>persistProgress(storage,emptyProgress(),catalog.nodes),/已保留原数据/);
 assert.equal(storage.getItem(STORAGE_KEY),'{broken');
 persistProgress(storage,emptyProgress(),catalog.nodes,{restore:true});
 assert.ok([...storage.data].some(([key,value])=>key.startsWith(STORAGE_KEY+'.recovery.')&&value==='{broken'));
 assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).records,{});
});
test('quota errors propagate instead of claiming persistence succeeded',()=>{
 const storage={getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError');}};
 assert.throws(()=>persistProgress(storage,emptyProgress(),catalog.nodes),/QuotaExceededError/);
});
test('merge uses record timestamps and does not regress newer evidence',()=>{
 const a=record(emptyProgress(),'computer','started','较新的记录',catalog.nodes);a.records.computer.updatedAt='2026-10-08T12:00:00Z';
 const b=record(emptyProgress(),'computer','started','较旧的记录',catalog.nodes);b.records.computer.updatedAt='2026-10-07T12:00:00Z';
 assert.equal(mergeProgress(a,b,catalog.nodes).records.computer.evidence,'较新的记录');
});
test('unsubmitted drafts survive session restore and are included in export',()=>{
 const storage=memoryStorage(),drafts=new Map([['computer','未提交的说明']]);writeDrafts(storage,drafts);
 assert.deepEqual(readDrafts(storage,catalog.nodes),drafts);
 const backup=backupWithDrafts(emptyProgress(),drafts,catalog.nodes);assert.equal(backup.records.computer.status,'started');assert.equal(backup.records.computer.evidence,'未提交的说明');
});
test('future timestamps are rejected and rapid consecutive edits remain ordered',()=>{
 const p=record(emptyProgress(),'computer','started','first',catalog.nodes);
 const q=record(p,'computer','started','second',catalog.nodes);assert.ok(Date.parse(q.records.computer.updatedAt)>Date.parse(p.records.computer.updatedAt));
 q.records.computer.updatedAt='2099-01-01T00:00:00Z';assert.throws(()=>validateProgress(q,catalog.nodes),/时间明显超前/);
});
test('Web Locks serialize writes from concurrent stale snapshots',async()=>{
 const storage=memoryStorage();let queue=Promise.resolve(),calls=0;
 const locks={request:(_name,work)=>{calls++;const result=queue.then(work);queue=result.catch(()=>{});return result;}};
 await Promise.all(['computer','arithmetic'].map(id=>persistProgressLocked(storage,record(emptyProgress(),id,'started',id,catalog.nodes),catalog.nodes,{},locks)));
 assert.equal(calls,2);assert.equal(Object.keys(JSON.parse(storage.getItem(STORAGE_KEY)).records).length,2);
});
test('catalog rejects incomplete steps, unsafe identifiers, and credential URLs',()=>{
 for(const mutate of [c=>c.nodes[0].steps=[],c=>c.nodes[0].id='constructor',c=>c.sources[0].url='https://user:password@example.com',c=>c.sources[0].originalUrl='javascript:alert(1)',c=>c.sources[0].readingLabel='官方中文',c=>c.labs.find(l=>l.validation).validation.commit='obsolete']){
  const c=structuredClone(catalog);mutate(c);assert.throws(()=>validateCatalog(c));
 }
});
