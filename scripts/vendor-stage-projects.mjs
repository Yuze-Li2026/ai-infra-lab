// Restore the three pinned integrations using their committed manifests.
// This command downloads only the selected small files; it never updates versions.
import {mkdir,writeFile,readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

export async function restorePinnedSources(root,fetchSource=fetch){
 const pending=[];let verified=0;
 for(const [name,prefix] of [['dbdb','data-store/code/'],['consensus','cluster/code/'],['micrograd','']]){
  const folder=resolve(root,`labs/${name}/upstream`);
  const manifest=JSON.parse(await readFile(resolve(folder,'manifest.json'),'utf8'));
  if(!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(manifest.repository)||!/^[a-f0-9]{40}$/.test(manifest.commit))throw Error('Invalid pinned repository');
  for(const item of manifest.files){
   if(!Number.isSafeInteger(item.bytes)||item.bytes<0||item.bytes>100000||!/^[a-f0-9]{64}$/.test(item.sha256))throw Error('Invalid pinned file metadata');
   const target=resolve(folder,item.path);
   if(!target.startsWith(folder+sep))throw Error('Upstream path escapes its directory');
   for(let path=target;path!==resolve(root);path=dirname(path)){
    try{if((await lstat(path)).isSymbolicLink())throw Error('Refusing symbolic link: '+path);}
    catch(error){if(error.code!=='ENOENT')throw error;}
   }
   let bytes;
   try{bytes=await readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}
   if(bytes){
    if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Refusing to overwrite modified file: '+target);
    verified++;continue;
   }
   const path=item.path==='LICENSE.md'?'LICENSE.md':prefix+item.path;
   const url=manifest.repository.replace('https://github.com/','https://raw.githubusercontent.com/')+'/'+manifest.commit+'/'+path;
   const response=await fetchSource(url,{signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw Error(`HTTP ${response.status}: ${url}`);
   const chunks=[];let length=0;
   for await(const chunk of response.body){length+=chunk.length;if(length>item.bytes)throw Error('Unexpected source size: '+path);chunks.push(chunk);}
   bytes=Buffer.concat(chunks);
   if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Upstream checksum mismatch: '+path);
   pending.push({target,bytes});
  }
 }
 // Complete validation first; failed downloads must not partially restore a tree.
 for(const {target,bytes} of pending){await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'});}
 return {verified,restored:pending.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 console.log(await restorePinnedSources(fileURLToPath(new URL('../',import.meta.url))));
}
