// Explicit maintenance command; fixed small upstream files only, never run by the build.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const commit='fba689d101eb5600f5c8f4d7fd79912498e950e2';
const tree=JSON.parse(await readFile('artifacts/aosa-tree.json','utf8'));
async function download(repo,ref,path){
 try{const r=await fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${path}`,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(r.status);return Buffer.from(await r.arrayBuffer());}
 catch{const r=await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${ref}`);const d=await r.json();if(!r.ok||typeof d.content!=='string')throw Error(`${path}: ${d.message}`);return Buffer.from(d.content,'base64');}
}
async function save(root,path,bytes,manifest){
 if(bytes.length>100000)throw Error('Unexpected source size');
 const target=root+'/'+path;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});
 try{const current=await readFile(target);if(!current.equals(bytes))throw Error(`Refusing to overwrite ${target}`);}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(target,bytes);}
 manifest.files.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for(const [name,prefix]of [['dbdb','data-store/code/'],['consensus','cluster/code/']]){
 const root=`labs/${name}/upstream`;await mkdir(root,{recursive:true});
 const manifest={repository:'https://github.com/aosabook/500lines',commit,license:'MIT code; see LICENSE.md',files:[]};
 await save(root,'LICENSE.md',await readFile('labs/object-model/upstream/LICENSE.md'),manifest);
 for(const f of tree.tree.filter(f=>f.type==='blob'&&f.path.startsWith(prefix)&&(/\.py$/.test(f.path)||f.path.endsWith('requirements.txt')))){
  const bytes=await download('aosabook/500lines',commit,f.path);
  const blobHash=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if(bytes.length!==f.size||blobHash!==f.sha)throw Error('Upstream blob mismatch');
  await save(root,f.path.slice(prefix.length),bytes,manifest);
 }
 await writeFile(root+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(name,manifest.files.length);
}
const microCommit='7bc720e951fe422b8f8814aa5aa1b64121d26b4c',root='labs/micrograd/upstream';
const manifest={repository:'https://github.com/karpathy/micrograd',commit:microCommit,license:'MIT',files:[]};
for(const path of ['LICENSE','README.md','micrograd/__init__.py','micrograd/engine.py','micrograd/nn.py','test/test_engine.py'])await save(root,path,await download('karpathy/micrograd',microCommit,path),manifest);
await writeFile(root+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('micrograd',manifest.files.length);
