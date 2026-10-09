import {lint} from 'markdownlint/promise';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {applyFixes} from 'markdownlint';
const files=['AGENTS.md','.github/pull_request_template.md','README.md','CREDITS.md','CONTRIBUTING.md','SECURITY.md',...(await readdir('docs')).filter(p=>p.endsWith('.md')).map(p=>'docs/'+p)];
const config=JSON.parse(await readFile('.markdownlint.json','utf8'));
let results=await lint({files,config});
if(process.argv.includes('--fix')){
  for(const [path,errors]of Object.entries(results))if(errors.length)await writeFile(path,applyFixes(await readFile(path,'utf8'),errors));
  results=await lint({files,config});
}
const failures=Object.values(results).reduce((n,errors)=>n+errors.length,0);
if(failures){console.error(results.toString());process.exitCode=1;}
else console.log(`Markdownlint：${files.length} 份文档通过。`);
