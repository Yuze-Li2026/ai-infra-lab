// Optional end-to-end release checks, using only an already-installed browser.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.LAB_PLAYWRIGHT_ROOT?resolve(process.env.LAB_PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.LAB_BROWSER_PATH?{executablePath:process.env.LAB_BROWSER_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage();page.on('dialog',d=>d.accept());
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173',checks=[];
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
try{
 await page.goto(base+'/#map/programming');await page.locator('#evidence').waitFor();
 assert.equal(await page.locator('.learning-steps li').count(),3);
 const draft='刷新与备份都应该保留的独立设计说明；还没有完成测试，暂不提交成果。';
 await page.locator('#evidence').fill(draft);await page.reload();assert.equal(await page.locator('#evidence').inputValue(),draft);
 const downloading=page.waitForEvent('download');await page.locator('#export').click();const download=await downloading;
 const backup=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(backup.records.programming.evidence,draft);assert.equal(backup.records.programming.status,'started');
 checks.push('deep link, refresh recovery and exported unsaved draft');
 await page.locator('[data-start=programming]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('ai-infra-lab.progress.v1'))?.records.programming);
 assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(sessionStorage.getItem('ai-infra-lab.drafts.v1'))).length),0);
 checks.push('successful save clears only the saved session draft');
 for(const node of catalog.nodes){await page.goto(base+'/#map/'+node.id);await page.locator('#node-detail').waitFor();assert.equal(await page.locator('.detail-heading h2').innerText(),node.title);assert.equal(await page.locator('.learning-steps li').count(),3);}
 checks.push(`all ${catalog.nodes.length} node deep links show three steps and evidence`);
 await page.goto(base+'/#labs');await page.locator('.lab-results').filter({hasText:'28 项原测试通过'}).locator('summary').click();assert.equal(await page.locator('.lab-results').filter({hasText:'28 项原测试通过'}).locator('tbody tr').count(),2);
 assert.match(await page.locator('.lab-results').filter({hasText:'28 项原测试通过'}).innerText(),/28 项原测试通过/);assert.match(await page.locator('.lab-results').filter({hasText:'28 项原测试通过'}).innerText(),/读取更慢/);
 for(const guide of catalog.labs.filter(l=>l.guide))assert.equal((await fetch(new URL(guide.guide,base))).status,200);
 checks.push('actual benchmark and local experiment guides are accessible');
 await page.screenshot({path:'artifacts/labs-desktop.png',fullPage:true});
 // Both pages start with stale snapshots, then save through the real browser lock API.
 const second=await context.newPage();second.on('dialog',d=>d.accept());
 await page.goto(base+'/#map/computer');await second.goto(base+'/#map/arithmetic');
 await page.locator('#evidence').fill('第一个标签页的说明');await second.locator('#evidence').fill('第二个标签页的说明');
 await Promise.all([page.locator('[data-start=computer]').click(),second.locator('[data-start=arithmetic]').click()]);
 await page.waitForFunction(()=>{const r=JSON.parse(localStorage.getItem('ai-infra-lab.progress.v1')).records;return r.computer?.evidence==='第一个标签页的说明'&&r.arithmetic?.evidence==='第二个标签页的说明';});
 assert.equal(await page.evaluate(()=>typeof navigator.locks?.request),'function');await second.close();checks.push('simultaneous browser saves preserve both nodes with Web Locks');
 await page.goto(base+'/#map/architecture');await page.locator('#node-detail').waitFor();await page.screenshot({path:'artifacts/task-desktop.png',fullPage:true});
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const view of ['learn','map','resources','labs','about','map/architecture']){
   await page.goto(base+'/#'+view);await page.locator('main h1').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px overflow in ${view}`);
  }
 }
 checks.push('all views plus full task form fit 320, 390, 768 and 1280 px');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/#learn');await page.locator('.focus-panel').waitFor();await page.screenshot({path:'artifacts/mobile-clean.png',fullPage:true});
 await page.goto(base+'/#resources');await page.locator('#search').fill('zz-no-result');assert.match(await page.locator('.empty').innerText(),/没有找到匹配资源/);await page.locator('#search').fill('');assert.equal(await page.locator('article.resource').count(),catalog.sources.length);
 checks.push('resource empty state recovers to all catalog sources');
 await page.goto(base+'/#map');await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');assert.equal(new URL(page.url()).hash,'#map');
 checks.push('keyboard skip focuses content without replacing the route');
 const toolsContext=await browser.newContext();await toolsContext.addInitScript(()=>Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.registeredLearningTool=tool;}}}));
 const toolPage=await toolsContext.newPage();await toolPage.goto(base);await toolPage.waitForFunction(()=>Boolean(window.registeredLearningTool));
 const toolResult=await toolPage.evaluate(()=>{const t=window.registeredLearningTool;const result=t.execute({});let rejects=0;for(const input of [[],null,{change:true}]){try{t.execute(input);}catch{rejects++;}}return {result,rejects,storage:localStorage.length};});
 assert.equal(toolResult.result.total,catalog.nodes.length);assert.equal(toolResult.rejects,3);assert.equal(toolResult.storage,0);await toolsContext.close();
 checks.push('optional read-only tool contract with mock host (not native WebMCP compatibility)');
 assert.deepEqual(errors,[]);checks.push('no browser runtime errors');
 const result={passed:true,checks};await writeFile('artifacts/release-browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await context.close();await browser.close();}
