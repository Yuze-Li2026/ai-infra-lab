import {mkdir,cp,readFile,writeFile,rename,lstat,readdir,realpath} from 'node:fs/promises';
import {resolve,join,relative,sep,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {validateCatalog} from './validate.mjs';
import {verifyVendor} from './verify-vendor.mjs';

async function exists(path){try{return await lstat(path);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function moveDirectory(root,from,to){
 if(!from.startsWith(root+sep)||!to.startsWith(root+sep))throw Error('Unsafe directory move');
 for(let attempt=0;;attempt++){
  try{return await rename(from,to);}catch(error){
   if(process.platform!=='win32'||!['EPERM','EACCES','EBUSY'].includes(error.code)||attempt===5)throw error;
   // Windows may briefly hold freshly copied files. Retry finitely; preserve rollback on failure.
   await new Promise(resolveWait=>setTimeout(resolveWait,25*2**attempt));
  }
 }
}
async function copyText(from,to){
 const bytes=await readFile(from);
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/\r\n/g,'\n');
 await writeFile(to,text,'utf8');
}
async function filesBelow(root,path=root){
 const result=[];
 for(const entry of await readdir(path,{withFileTypes:true})){
  const full=join(path,entry.name);const info=await lstat(full);
  if(info.isSymbolicLink())throw new Error(`Symbolic links are not publishable: ${full}`);
  if(info.isDirectory())result.push(...await filesBelow(root,full));
  else if(info.isFile())result.push(relative(root,full).split(sep).join('/'));
  else throw new Error(`Unsupported output: ${full}`);
 }
 return result.sort();
}
export async function build(project=process.cwd()){
 const root=await realpath(project);
 validateCatalog(JSON.parse(await readFile(join(root,'site/catalog.json'),'utf8')));
 const output=resolve(root,'dist'),artifacts=resolve(root,'artifacts');
 for(const path of [output,artifacts]){
  const info=await exists(path);
  if(info&&(info.isSymbolicLink()||!info.isDirectory()))throw new Error(`Expected regular directory: ${path}`);
  if(info&&await realpath(path)!==path)throw new Error(`Unexpected resolved path: ${path}`);
 }
 await mkdir(artifacts,{recursive:true});
 if((await lstat(join(root,'site'))).isSymbolicLink())throw new Error('Site directory must not be a link');
 const stage=join(artifacts,`build-stage-${randomUUID()}`);await mkdir(stage);
 const publicFiles=['index.html','styles.css','app.js','views.js','core.js','storage.js','reports.js','documents.js','catalog.json'];
 for(const file of publicFiles){
  const from=join(root,'site',file),info=await exists(from);
  if(!info)throw new Error(`Missing public asset: ${file}`);
  if(!info.isFile()||info.isSymbolicLink())throw new Error(`Unsafe public asset: ${file}`);
  await copyText(from,join(stage,file));
 }
 if((await lstat(join(root,'site/vendor'))).isSymbolicLink())throw Error('Vendor directory must not be a link');
 for(const file of await verifyVendor(root)){
  await mkdir(dirname(join(stage,'vendor',file)),{recursive:true});
  await cp(join(root,'site/vendor',file),join(stage,'vendor',file));
 }
 const docs=join(root,'docs');
 if((await lstat(docs)).isSymbolicLink())throw new Error('Documentation directory must not be a link');
 for(const file of await filesBelow(docs)){
  if(!file.endsWith('.md'))continue;
  await mkdir(dirname(join(stage,'docs',file)),{recursive:true});await copyText(join(docs,file),join(stage,'docs',file));
 }
 for(const file of ['README.md','CREDITS.md','LICENSE','CONTRIBUTING.md','SECURITY.md']){
  if((await lstat(join(root,file))).isSymbolicLink())throw new Error(`Unsafe document: ${file}`);
  await copyText(join(root,file),join(stage,file));
 }
 // Pages uses the explicit Actions artifact, so no branch/Jekyll control file is needed.
 const manifest={schemaVersion:1,files:[]};
 for(const path of await filesBelow(stage)){
  const bytes=await readFile(join(stage,path));manifest.files.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 await writeFile(join(stage,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 let backup=null;
 if(await exists(output)){
  backup=join(artifacts,`build-previous-${randomUUID()}`);
  if(!backup.startsWith(root+sep)||output!==join(root,'dist'))throw new Error('Unsafe build target');
  await moveDirectory(root,output,backup);
 }
 try{await moveDirectory(root,stage,output);}catch(error){if(backup)await moveDirectory(root,backup,output);throw error;}
 return {files:manifest.files.length,output,previousOutput:backup};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(await build());
