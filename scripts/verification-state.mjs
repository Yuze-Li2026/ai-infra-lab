import {createHash} from 'node:crypto';
import {lstat,readFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';

const roots=['AGENTS.md','README.md','CREDITS.md','CONTRIBUTING.md','SECURITY.md','LICENSE',
  'package.json','package-lock.json','start.cmd','.gitignore','.gitattributes','.markdownlint.json',
  'site','docs','labs','scripts','tests','schemas','.github','.vscode'];
const excluded=new Set(['__pycache__','.pytest_cache','node_modules','artifacts','workspaces']);

export async function sourceSnapshot(directory=process.cwd()){
  const root=resolve(directory),files=[];
  async function visit(path){
    const full=join(root,path);
    let info;
    try{info=await lstat(full);}catch(error){if(error.code==='ENOENT')return;throw error;}
    if(info.isSymbolicLink())throw Error('Cannot bind verification to a symbolic-link source: '+path);
    if(info.isDirectory()){
      for(const name of (await readdir(full)).sort()){
        if(excluded.has(name)||name.startsWith('.venv')||name.endsWith('.pyc')||name.endsWith('.pyo'))continue;
        await visit(path+'/'+name);
      }
    }else if(info.isFile())files.push(path);
    else throw Error('Unsupported source entry: '+path);
  }
  for(const path of roots)await visit(path);
  if(!files.length)throw Error('No project source files found');
  const hash=createHash('sha256');
  for(const path of files.sort()){
    const bytes=await readFile(join(root,path));
    hash.update(JSON.stringify([path,bytes.length])+'\n');hash.update(bytes);
  }
  return {version:1,algorithm:'sha256',sha256:hash.digest('hex'),files:files.length};
}

export function sameSource(left,right){
  return Boolean(left&&right&&left.version===1&&right.version===1&&left.algorithm==='sha256'&&right.algorithm==='sha256'
    &&/^[a-f0-9]{64}$/.test(left.sha256)&&left.sha256===right.sha256&&Number.isSafeInteger(left.files)&&left.files>0&&left.files===right.files);
}

export async function reportStatus(path,current){
  let report;
  try{
    const info=await lstat(path);
    if(!info.isFile()||info.isSymbolicLink()||info.size>2*1024*1024)throw Error('Expected a regular report below 2 MiB');
    report=JSON.parse(await readFile(path,'utf8'));
    if(!report||typeof report.passed!=='boolean')throw Error('Report has no boolean passed field');
  }catch(error){return {status:error.code==='ENOENT'?'missing':'invalid',diagnostic:error.code==='ENOENT'?'No local report':error.message};}
  const source=report.source;
  if(source&&(!sameSource(source.before,source.before)||!sameSource(source.after,source.after))){
    return {status:'invalid',reportedPassed:report.passed,currentSource:false,diagnostic:'Invalid source fingerprint in report'};
  }
  const status=!source?'unbound':!sameSource(source.before,source.after)?'source-changed'
    :!sameSource(source.after,current)?'stale':report.passed?'passed':'failed';
  return {status,reportedPassed:report.passed,recordedAt:report.createdAt||report.checkedAt||null,
    currentSource:sameSource(source?.before,current)&&sameSource(source?.after,current)};
}
