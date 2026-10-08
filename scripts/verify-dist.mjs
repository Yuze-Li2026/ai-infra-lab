import {readFile,readdir,lstat} from 'node:fs/promises';
import {join,resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export async function verifyDist(directory='dist'){
 const root=resolve(directory),manifest=JSON.parse(await readFile(join(root,'build-manifest.json'),'utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.files))throw new Error('Invalid build manifest');
 const expected=new Set(['build-manifest.json']);
 for(const file of manifest.files){
  const path=resolve(root,file.path);
  if(!path.startsWith(root+sep)||expected.has(file.path))throw new Error('Invalid or duplicate manifest path');
  expected.add(file.path);
  if((await lstat(path)).isSymbolicLink())throw new Error('Unexpected output link');
  const bytes=await readFile(path);
  if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error(`Output mismatch: ${file.path}`);
 }
 async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){
  const target=join(path,entry.name);if(entry.isSymbolicLink())throw new Error('Unexpected output link');
  if(entry.isDirectory())await walk(target);
  else if(!expected.has(relative(root,target).split(sep).join('/')))throw new Error(`Unexpected public file: ${entry.name}`);
 }}
 await walk(root);return {verifiedFiles:manifest.files.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(await verifyDist(process.argv[2]));
