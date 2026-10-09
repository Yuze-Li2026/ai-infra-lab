import {readFile,writeFile,mkdir} from 'node:fs/promises';
const c=JSON.parse(await readFile('site/catalog.json','utf8'));
const urls=[...new Set([...c.sources.flatMap(s=>[s.url,s.licenseUrl,...(s.originalUrl?[s.originalUrl]:[])]),...c.nodes.flatMap(n=>n.topics.map(t=>t.url)),...c.labs.map(l=>l.url)])];
const results=[];
const previous=process.argv.includes('--retry-failed')?JSON.parse(await readFile('artifacts/links.json','utf8')):null;
// Sequential requests avoid overloading upstream teaching sites.
for(const url of urls){
 const old=previous?.results.find(r=>r.url===url);
 if(old?.ok){results.push(old);continue;}
 try{const r=await fetch(url,{signal:AbortSignal.timeout(previous?30000:10000),redirect:'follow',headers:{'User-Agent':'AI-Infra-Lab-link-check/0.1'}});await r.body?.cancel();results.push({url,status:r.status,ok:r.ok,finalUrl:r.url,checkedAt:new Date().toISOString(),classification:r.ok?'reachable':[403,429].includes(r.status)?'manual-review':'failed',...(old?{previousAttempt:old}:{})});}catch(e){results.push({url,ok:false,checkedAt:new Date().toISOString(),classification:'network-unknown',error:e.message,...(old?{previousAttempt:old}:{})});}
}
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/links.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify({total:results.length,reachable:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok)},null,2));if(results.some(r=>!r.ok))process.exitCode=1;
