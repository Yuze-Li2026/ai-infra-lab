import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalog} from '../scripts/validate.mjs';
import {renderKnowledgeIndex} from '../scripts/knowledge-index.mjs';
const catalog=JSON.parse(readFileSync('site/catalog.json','utf8'));
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
