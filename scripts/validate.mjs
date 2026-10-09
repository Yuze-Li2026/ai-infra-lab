import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export function validateCatalog(c){
 if(c.schemaVersion!==1||!Array.isArray(c.nodes)||!Array.isArray(c.sources)||!Array.isArray(c.labs)||!Array.isArray(c.stages))throw new Error('Invalid catalog schema');
 const requiredText=(object,fields,label)=>{for(const field of fields)if(typeof object?.[field]!=='string'||!object[field].trim())throw new Error(`Missing or invalid ${label}.${field}`);};
 const id=value=>typeof value==='string'&&/^[a-z][a-z0-9-]*$/.test(value)&&!['constructor','prototype','__proto__'].includes(value);
 const strings=(value,label)=>{if(!Array.isArray(value)||value.some(x=>typeof x!=='string'||!x.trim())||new Set(value).size!==value.length)throw new Error(`Invalid ${label}`);};
 const https=value=>{let url;try{url=new URL(value);}catch{throw new Error(`Invalid URL: ${value}`);}if(url.protocol!=='https:'||url.username||url.password)throw new Error('Only credential-free HTTPS resources allowed');};
 for(const kind of ['nodes','sources','labs'])for(const item of c[kind])if(!item||!id(item.id))throw new Error(`Invalid ${kind} ID`);
 if(!c.nodes.length||!c.sources.length||!c.stages.length)throw new Error('Catalog must not be empty');
 for(const s of c.stages){if(!Number.isSafeInteger(s.id)||s.id<0)throw new Error('Invalid stage ID');requiredText(s,['title','description'],'stage');}
 for(const s of c.sources){
  requiredText(s,['title','author','version','prerequisites','coverage','reason','limitations','verification','reviewedAt','license','reuse','reviewLevel'],'source');
  if(!['zh','en'].includes(s.language)||!/^\d{4}-\d{2}-\d{2}$/.test(s.reviewedAt)||Number.isNaN(Date.parse(s.reviewedAt)))throw new Error(`Invalid review metadata: ${s.id}`);
  https(s.url);https(s.licenseUrl);
  if(s.originalUrl!==undefined)https(s.originalUrl);
  if(s.readingLabel!==undefined&&(!['作者中文','官方中文','社区译文'].includes(s.readingLabel)||s.language!=='zh'))throw Error(`Invalid source reading edition: ${s.id}`);
  if(!s.evaluation||typeof s.evaluation!=='object'||Array.isArray(s.evaluation))throw new Error(`Invalid evaluation: ${s.id}`);
  if(!Array.isArray(s.reviewEvidence)||!s.reviewEvidence.length)throw new Error(`Missing review evidence: ${s.id}`);
  for(const evidence of s.reviewEvidence){requiredText(evidence,['url','checkedAt','finding'],'review evidence');https(evidence.url);}
 }
 for(const n of c.nodes){
  strings(n.prerequisites,`prerequisites ${n.id}`);strings(n.resources,`resources ${n.id}`);
  requiredText(n,['scope'],'node');
  if(!Array.isArray(n.steps)||n.steps.length<2)throw new Error(`Missing learning steps: ${n.id}`);
  for(const step of n.steps)requiredText(step,['title','task'],'learning step');
 }
 for(const l of c.labs){
  requiredText(l,['title','goal','status','hardware','limitation'],'lab');strings(l.nodes,'lab nodes');strings(l.rubric,'lab rubric');https(l.url);
  if(!l.nodes.length||!['candidate','checked','reproduced'].includes(l.integration))throw new Error(`Invalid lab integration: ${l.id}`);
  if(l.command){requiredText(l,['guide'],'lab guide');if(!/^\.\/docs\/[a-z0-9-]+\.md$/.test(l.guide))throw new Error('Lab guide must be a local document');}
  if(l.preparationCommand){requiredText(l,['guide'],'course workflow guide');if(!/^\.\/docs\/[a-z0-9-]+\.md$/.test(l.guide))throw Error('Course workflow needs a local guide');}
  if(l.validation){
   const v=l.validation;requiredText(v,['commit','createdAt','python','platform'],'reproduction record');
   if(v.mode!=='reference'||v.passed!==true||!Number.isSafeInteger(v.tests)||v.tests<1||l.reportCommit&&v.commit!==l.reportCommit||Number.isNaN(Date.parse(v.createdAt)))throw Error('Invalid reproduction metadata or version mismatch');
   if(v.results&&(!Array.isArray(v.results)||!v.results.length||v.results.some(r=>r.passed!==true||!Number.isSafeInteger(r.tests)||r.tests<1)||v.results.reduce((sum,r)=>sum+r.tests,0)!==v.tests))throw Error('Invalid reproduction test count');
  }
  if(l.requiredChecks!==undefined){
   if(!Array.isArray(l.requiredChecks)||!l.requiredChecks.length||new Set(l.requiredChecks.map(r=>r.name)).size!==l.requiredChecks.length)throw Error('Invalid required test scope');
   for(const r of l.requiredChecks)if(typeof r.name!=='string'||!r.name.trim()||r.name.length>128||!Number.isSafeInteger(r.tests)||r.tests<1)throw Error('Invalid required test scope');
  }
 }
 const unique=(list,name)=>{const ids=new Set();for(const x of list){if(typeof x.id!=='string'&&name!=='stages')throw new Error(`Invalid ${name} ID`);if(ids.has(x.id))throw new Error(`Duplicate ${name}: ${x.id}`);ids.add(x.id);}return ids;};
 const nodes=unique(c.nodes,'nodes'),sources=unique(c.sources,'sources'),stages=unique(c.stages,'stages');unique(c.labs,'labs');
 for(const s of c.sources){for(const f of ['title','author','url','version','language','license','licenseUrl','reviewedAt','reviewLevel','reuse','evaluation'])if(!s[f])throw new Error(`Missing source field ${s.id}.${f}`);for(const f of ['authority','accuracy','depth','engineeringValue','coverage','teachingQuality','difficulty','languageFriendliness','accessibility','maintenance','licensing','stability'])if(!s.evaluation[f])throw new Error(`Missing evaluation ${s.id}.${f}`);for(const f of ['url','licenseUrl'])if(new URL(s[f]).protocol!=='https:')throw new Error('Only HTTPS resources allowed');}
 for(const n of c.nodes){for(const f of ['title','objective','guidance','evidence','status'])if(typeof n[f]!=='string'||!n[f].trim())throw new Error(`Missing node field ${n.id}.${f}`);if(!stages.has(n.stage)||!['core','specialist','optional'].includes(n.category)||!Array.isArray(n.prerequisites)||!Array.isArray(n.resources)||!n.resources.length)throw new Error(`Invalid node ${n.id}`);for(const p of n.prerequisites)if(!nodes.has(p)||p===n.id)throw new Error(`Invalid dependency ${n.id}/${p}`);for(const r of n.resources)if(!sources.has(r))throw new Error(`Unknown resource ${r}`);}
 const visiting=new Set(),done=new Set();function walk(id){if(visiting.has(id))throw new Error(`Dependency cycle at ${id}`);if(done.has(id))return;visiting.add(id);c.nodes.find(n=>n.id===id).prerequisites.forEach(walk);visiting.delete(id);done.add(id);}c.nodes.forEach(n=>walk(n.id));
 for(const l of c.labs){if(!sources.has(l.source)||!stages.has(l.stage)||new URL(l.url).protocol!=='https:'||!Array.isArray(l.rubric)||l.rubric.length<3||!l.hardware||!l.status||!l.limitation)throw new Error(`Invalid lab ${l.id}`);for(const n of l.nodes)if(!nodes.has(n))throw new Error(`Unknown lab prerequisite ${n}`);}
 if(c.milestones!==undefined){
  if(!Array.isArray(c.milestones)||c.milestones.length!==stages.size||new Set(c.milestones.map(m=>m.stage)).size!==stages.size)throw Error('Invalid milestone stages');
  for(const m of c.milestones){
   if(!stages.has(m.stage))throw Error('Unknown milestone stage');
   requiredText(m,['title'],'milestone');strings(m.nodes,'milestone nodes');strings(m.labs,'milestone labs');strings(m.criteria,'milestone criteria');
   if(!m.labs.length||m.criteria.length<3)throw Error('Incomplete milestone');
   for(const id of m.nodes)if(!nodes.has(id)||c.nodes.find(n=>n.id===id).stage!==m.stage)throw Error('Invalid milestone node');
   for(const n of c.nodes.filter(n=>n.stage===m.stage&&n.category==='core'))if(!m.nodes.includes(n.id))throw Error('Milestone omits core knowledge');
   for(const id of m.labs)if(!c.labs.some(l=>l.id===id&&l.stage===m.stage&&l.command&&l.requiredChecks?.length))throw Error('Invalid milestone lab or missing test scope');
  }
 }
 return {nodes:nodes.size,sources:sources.size,labs:c.labs.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){console.log('Catalog validated:',validateCatalog(JSON.parse(readFileSync('site/catalog.json','utf8'))));}
