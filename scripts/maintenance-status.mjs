import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sourceSnapshot,reportStatus} from './verification-state.mjs';
import {catalogCounts} from './catalog-counts.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if(process.argv.length>2){
  if(process.argv.length===3&&process.argv[2]==='--help'){
    console.log('npm run maintenance:status — read local source, Git state and source-bound reports. No network, installation or writes.');
    process.exit(0);
  }
  console.error('Unsupported argument. Use --help.');process.exit(2);
}
function git(args){
  const result=spawnSync('git',['-C',root,...args],{encoding:'utf8',windowsHide:true,timeout:5000,maxBuffer:2*1024*1024});
  return result.status===0?result.stdout.trimEnd():null;
}
const top=git(['rev-parse','--show-toplevel']);
const inRepository=top!==null&&resolve(top)===root;
const source=await sourceSnapshot(root);
const catalog=JSON.parse(await readFile(resolve(root,'site/catalog.json'),'utf8'));
const packageInfo=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const changes=inRepository?git(['status','--porcelain=v1','--untracked-files=normal']):null;
const [tests,browser]=await Promise.all([
  reportStatus(resolve(root,'artifacts/test-results.json'),source),
  reportStatus(resolve(root,'artifacts/browser-suite-results.json'),source)
]);
console.log(JSON.stringify({
  schemaVersion:1,observedAt:new Date().toISOString(),packageVersion:packageInfo.version,
  runtime:{node:process.version,supported:Number(process.versions.node.split('.')[0])>=22},
  git:inRepository?{commit:git(['rev-parse','HEAD']),branch:git(['branch','--show-current']),dirty:changes===null?null:changes.length>0}:null,
  source,catalog:catalogCounts(catalog),
  reports:{tests:{path:'artifacts/test-results.json',...tests},browser:{path:'artifacts/browser-suite-results.json',...browser}},
  handoff:['AGENTS.md','docs/ai-maintenance.md','docs/delivery-checklist.md','docs/verification.md'],
  limits:'Read-only local inventory. Reports are not signed. No remote CI, deployment, GPU availability or complete project acceptance is inferred.'
},null,2));
