// Hardware integration suite: run explicitly on a CUDA host, never pretend CPU is CUDA.
import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {summarizeReport,reportAccepted} from '../site/reports.js';
const python=process.env.LAB_TEST_PYTHON||resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
await mkdir('artifacts',{recursive:true});const dir=await mkdtemp(resolve('artifacts/gpu-contract-'));
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));const lab=catalog.labs.find(l=>l.id==='gpu');
const reference=resolve('labs/gpu/reference.py').replaceAll('\\','/');
const loader=`import importlib.util\nspec=importlib.util.spec_from_file_location('reference',${JSON.stringify(reference)})\nr=importlib.util.module_from_spec(spec)\nspec.loader.exec_module(r)\nfor name in ['matmul','squared_gradient','build_model','build_optimizer','train_step','save_checkpoint','load_checkpoint']: globals()[name]=getattr(r,name)\n`;
const cases=[
 ['contract-routing',loader,null],
 ['wrong-matmul',loader+'\ndef matmul(a,b):\n    import torch\n    return torch.zeros((a.shape[0],b.shape[1]),device=a.device)\n','fp32-matmul-correctness'],
 ['wrong-gradient',loader+'\ndef squared_gradient(x):\n    return x*0\n','autograd-cpu-gpu-comparison'],
 ['fake-training-loss',loader+'\ndef train_step(*args):\n    return 0.0\n','small-model-training'],
 ['missing-optimizer-state',loader+`\ndef load_checkpoint(path,model,optimizer,device):\n    import torch\n    state=torch.load(path,map_location=device,weights_only=True)\n    model.load_state_dict(state['model'])\n    torch.set_rng_state(state['rng'].cpu())\n    torch.cuda.set_rng_state_all([x.cpu() for x in state['cuda_rng']])\n    return state['step']\n`,'checkpoint-and-exact-next-step'],
 ['missing-rng-state',loader+`\ndef load_checkpoint(path,model,optimizer,device):\n    import torch\n    state=torch.load(path,map_location=device,weights_only=True)\n    model.load_state_dict(state['model'])\n    optimizer.load_state_dict(state['optimizer'])\n    return state['step']\n`,'checkpoint-and-exact-next-step']
];
const results=[];
for(const[name,source,failedCheck]of cases){
 const file=join(dir,name+'.py'),output=join(dir,name+'.json');await writeFile(file,source);
 const run=spawnSync(process.execPath,['scripts/lab.mjs','gpu','--submission',file,'--output',output],{encoding:'utf8',windowsHide:true,timeout:60000,env:{...process.env,LAB_PYTHON:python}});
 assert.equal(run.status,failedCheck?1:0,run.stderr+run.stdout);
 const raw=JSON.parse(await readFile(output,'utf8'));assert.equal(raw.mode,'submission');
 if(failedCheck)assert.equal(raw.results.find(r=>r.name===failedCheck)?.passed,false);
 const summary=summarizeReport(raw,lab,'b'.repeat(64));assert.equal(reportAccepted(lab,summary),!failedCheck);
 assert.equal(await readFile(file,'utf8'),source);
 results.push({name,passed:true,expectedRejected:Boolean(failedCheck),tests:summary.tests,report:output});
}
await writeFile('artifacts/gpu-contract-results.json',JSON.stringify({passed:true,results,limits:'Reference routing fixture tests the adapter, not independent learner authorship.'},null,2)+'\n');
console.log('GPU contract checks:',results.length,'passed; incorrect products, gradients, training and incomplete restores rejected.');
