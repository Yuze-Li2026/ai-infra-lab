import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export async function verifyVendor(root){
 const base=join(root,'site/vendor'),manifest=JSON.parse(await readFile(join(base,'manifest.json'),'utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.packages))throw Error('Invalid vendor manifest');
 const files=['manifest.json'];
 for(const pkg of manifest.packages)for(const entry of pkg.files){
  if(!/^(marked|dompurify)\/[a-zA-Z0-9.-]+$/.test(entry.path))throw Error('Invalid vendor path');
  const path=join(base,entry.path);if((await lstat(path)).isSymbolicLink()||(await lstat(join(base,pkg.name))).isSymbolicLink())throw Error('Vendor links forbidden');
  const bytes=await readFile(path);
  if(bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error(`Vendor checksum mismatch: ${entry.path}`);
  files.push(entry.path);
 }
 return files;
}
