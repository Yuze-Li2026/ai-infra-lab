import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const selected={marked:['lib/marked.esm.js','LICENSE'],dompurify:['dist/purify.es.mjs','LICENSE']};
const manifest={schemaVersion:1,packages:[]};
for(const [name,files]of Object.entries(selected)){
 const pkg=JSON.parse(await readFile(`node_modules/${name}/package.json`,'utf8'));
 const directory=`site/vendor/${name}`;await mkdir(directory,{recursive:true});
 const entry={name,version:pkg.version,license:pkg.license,source:pkg.repository,files:[]};
 for(const path of files){const bytes=await readFile(`node_modules/${name}/${path}`);const target=path.split('/').at(-1);await writeFile(`${directory}/${target}`,bytes);entry.files.push({path:`${name}/${target}`,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});}
 manifest.packages.push(entry);
}
await writeFile('site/vendor/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(manifest.packages.map(p=>`${p.name}@${p.version}`).join(', '));
