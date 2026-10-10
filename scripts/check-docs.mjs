import {readFile,access,readdir} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {marked} from '../site/vendor/marked/marked.esm.js';
import {allowedDocuments} from '../site/documents.js';
const root=resolve('.');
const paths=['README.md','CREDITS.md','CONTRIBUTING.md','SECURITY.md',...(await readdir('docs')).filter(p=>p.endsWith('.md')).map(p=>'docs/'+p)];
const repositoryDocuments=['AGENTS.md','.github/pull_request_template.md','labs/object-model/README.md'];
let links=0;
for(const path of [...paths,...repositoryDocuments]){
 if(!repositoryDocuments.includes(path)&&!allowedDocuments.has(path))throw Error(`文档没有接入站内阅读器：${path}`);
 const source=await readFile(path,'utf8');if(!/^# .+/m.test(source))throw Error(`文档缺少标题：${path}`);
 const checks=[];
 marked.walkTokens(marked.lexer(source),token=>{
  if(!['link','image'].includes(token.type))return;
  links++;const href=token.href;
  if(/^https?:\/\//.test(href)){const url=new URL(href);if(url.username||url.password||url.protocol==='http:'&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw Error(`无效或包含凭据的链接：${path}`);return;}
  if(href.startsWith('#'))return;
  if(/^[a-zA-Z]+:/.test(href)||href.startsWith('//'))throw Error(`无效文档链接：${path} -> ${href}`);
  const target=resolve(dirname(resolve(root,path)),decodeURIComponent(href.split('#')[0]));
  if(!target.startsWith(root+sep))throw Error(`文档链接越界：${path}`);
  checks.push(access(target).catch(()=>{throw Error(`文档链接不存在：${path} -> ${href}`);}));
 });
 await Promise.all(checks);
}
for(const path of allowedDocuments)await access(path);
console.log(`文档检查通过：${paths.length} 份站内 Markdown、${repositoryDocuments.length} 份仓库维护说明，${links} 个链接。`);
