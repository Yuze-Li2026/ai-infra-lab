import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalog} from '../scripts/validate.mjs';
import {renderKnowledgeIndex} from '../scripts/knowledge-index.mjs';
import {catalogCounts,verifyDocumentCounts} from '../scripts/catalog-counts.mjs';
import {verifyCurriculum} from '../scripts/check-coverage.mjs';
const catalog=JSON.parse(readFileSync('site/catalog.json','utf8'));

test('curriculum keeps prerequisite, category and primary-source changes in sync',()=>{
 const guide=readFileSync('docs/curriculum.md','utf8').replace(/\r\n/g,'\n');
 verifyCurriculum(catalog,guide);
 for(const change of [
  c=>c.nodes.find(n=>n.id==='training').prerequisites.pop(),
  c=>c.nodes.find(n=>n.id==='inference').category='optional',
  c=>c.sources.find(s=>s.id==='torch').url='https://example.org/new-version'
 ]){const changed=structuredClone(catalog);change(changed);assert.throws(()=>verifyCurriculum(changed,guide),/选章指南/);}
 assert.throws(()=>verifyCurriculum(catalog,guide+'\n### '+catalog.nodes[0].title+'\n'),/重复任务/);
});
test('knowledge coverage rejects missing evidence, unknown references and unsafe reading links',()=>{
 for(const change of [
  c=>delete c.nodes[0].topics,
  c=>c.nodes[0].topics[0].section='',
  c=>c.nodes[0].topics[0].outcome='',
  c=>c.nodes[0].topics[0].source='unknown-source',
  c=>c.nodes[0].topics[0].environment='already-verified',
  c=>c.nodes[0].topics[0].url='javascript:alert(1)',
  c=>c.nodes[0].topics.push(c.nodes[0].topics[0]),
  c=>c.nodes[1].topics[0].id=c.nodes[0].topics[0].id
 ]){const modified=structuredClone(catalog);change(modified);assert.throws(()=>validateCatalog(modified));}
 const output=renderKnowledgeIndex(catalog);
 assert.equal(readFileSync('docs/knowledge-index.md','utf8').replace(/\r\n/g,'\n'),output);
 for(const n of catalog.nodes)for(const t of n.topics){assert.ok(output.includes(t.title));assert.ok(output.includes(t.outcome));}
});

test('current guide counts reject stale module, reading, source and lab totals',()=>{
 const counts=catalogCounts(catalog);
 assert.equal(counts.nodes,new Set(catalog.nodes.map(node=>node.id)).size);
 assert.equal(counts.topics,new Set(catalog.nodes.flatMap(node=>node.topics.map(topic=>topic.id))).size);
 assert.equal(counts.sources,new Set(catalog.sources.map(source=>source.id)).size);
 const claims=[['nodes','个学习模块'],['nodes','节点'],['topics','项选读任务'],['sources','项原始来源'],['labs','项实验入口'],['runnableLabs','项本地实验'],['courseLabs','项原课流程']];
 for(const [key,label] of claims){
  verifyDocumentCounts(`${counts[key]} ${label}`,counts,'fixture.md');
  assert.throws(()=>verifyDocumentCounts(`${counts[key]+1} ${label}`,counts,'fixture.md'),/数量不符/);
 }
 const changed=structuredClone(catalog);changed.nodes[0].topics.pop();
 assert.throws(()=>verifyDocumentCounts(`${counts.topics} 项选读任务`,catalogCounts(changed),'fixture.md'),/数量不符/);
});
