import {runProcess} from './process.mjs';
import {stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export const cases=[{name:'mixed case',input:'Hello, WORLD!\n',expected:'hello, world!'},{name:'digits and punctuation',input:'AI Infra 2026: GPU!\n',expected:'ai infra 2026: gpu!'},{name:'unicode',input:'你好 AI\n',expected:'你好 ai'},{name:'empty line',input:'\n',expected:''}];
export async function grade(file,python='python',timeout=3000){
 const abs=resolve(file);if(!(await stat(abs)).isFile())throw new Error('Submission must be a file');
 const results=[];
 for(const c of cases){
  const run=await runProcess(python,['-I',abs],{input:c.input,timeout,maxBytes:32768,env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  const output=run.stdout.replace(/\r\n/g,'\n').replace(/\n$/,'');
  results.push({name:c.name,passed:run.code===0&&!run.reason&&!run.error&&output===c.expected,expected:c.expected,actual:output.slice(0,2000),error:run.reason||run.error||run.stderr.slice(0,2000),exitCode:run.code});
 }
 return {schemaVersion:1,lab:'indoor',source:'https://cs50.harvard.edu/python/2022/psets/0/indoor/',checker:'AI Infra Lab supplemental checks v0.1',submittedAt:new Date().toISOString(),passed:results.every(r=>r.passed),results,limitation:'Supplemental checks only. Learner code executes with local user permissions; this is not a sandbox or official course grading.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv[2]){console.error('Usage: node scripts/grade.mjs <your indoor.py> [python executable]');process.exitCode=2;}
 else{try{console.log('Running your selected Python file locally; no security sandbox.');const result=await grade(process.argv[2],process.argv[3]);await mkdir('artifacts',{recursive:true});const path=`artifacts/indoor-${Date.now()}.json`;await writeFile(path,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));console.log(`Report: ${path}`);if(!result.passed)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=2;}}
}
