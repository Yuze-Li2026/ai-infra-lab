import {readFile,writeFile,mkdir} from 'node:fs/promises';
const c=JSON.parse(await readFile('site/catalog.json','utf8'));
const urls=[...new Set([...c.sources.flatMap(s=>[s.url,s.licenseUrl]),...c.labs.map(l=>l.url)])];
const results=[];
// Sequential requests avoid overloading upstream teaching sites.
for(const url of urls){try{const r=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:'follow',headers:{'User-Agent':'AI-Infra-Lab-link-check/0.1'}});await r.body?.cancel();results.push({url,status:r.status,ok:r.ok,finalUrl:r.url,classification:r.ok?'reachable':[403,429].includes(r.status)?'manual-review':'failed'});}catch(e){results.push({url,ok:false,classification:'network-unknown',error:e.message});}}
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/links.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.ok))process.exitCode=1;
