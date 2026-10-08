import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const commit='fba689d101eb5600f5c8f4d7fd79912498e950e2';
const stages=['01-smalltalk-like','02-attr-based','03-customizable','04-maps'];
const files=['LICENSE.md','objmodel/README.txt',...stages.flatMap(s=>[`objmodel/code/${s}/objmodel.py`,`objmodel/code/${s}/test_objmodel.py`])];
const base=resolve('labs/object-model/upstream');
const manifest={repository:'https://github.com/aosabook/500lines',commit,author:'Carl Friedrich Bolz',license:'MIT (software); CC BY 3.0 (written material)',files:[]};
let total=0;
for(const file of files){
 const url=`https://api.github.com/repos/aosabook/500lines/contents/${file}?ref=${commit}`;
 const response=await fetch(url,{headers:{'User-Agent':'AI-Infra-Lab'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`${response.status}: ${file}`);
 const data=await response.json();const bytes=Buffer.from(data.content,'base64');total+=bytes.length;
 if(total>100000)throw new Error('Unexpected download size');
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const target=resolve(base,file);
 let old;try{old=await readFile(target);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(old&&!old.equals(bytes))throw new Error(`Refusing to overwrite modified file: ${file}`);
 await mkdir(dirname(target),{recursive:true});if(!old)await writeFile(target,bytes);
 manifest.files.push({path:file,sha256,bytes:bytes.length,source:`https://github.com/aosabook/500lines/blob/${commit}/${file}`});
}
await writeFile(resolve(base,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Fetched ${files.length} pinned upstream files (${total} bytes); no code executed.`);
