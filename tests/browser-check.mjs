// Optional QA. Uses an existing Playwright install; never downloads browsers or packages.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createServer} from 'node:http';
const require=createRequire(process.env.LAB_PLAYWRIGHT_ROOT?resolve(process.env.LAB_PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.LAB_BROWSER_PATH?{executablePath:process.env.LAB_BROWSER_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();
page.on('dialog',dialog=>dialog.accept());
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];
try{
 await page.goto('http://127.0.0.1:4173');await page.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();
 await page.screenshot({path:'artifacts/desktop.png',fullPage:true});checks.push('desktop learning workspace');
 await page.getByRole('button',{name:'打开学习任务'}).click();await page.locator('#evidence').fill('已创建学习文件夹并独立运行程序，已保存输出截图并解释了路径、编辑与执行的区别。');await page.getByRole('button',{name:'提交成果记录'}).click();
 assert.equal(await page.locator('.stat strong').first().innerText(),'1 / 24');await page.reload();assert.equal(await page.locator('.stat strong').first().innerText(),'1 / 24');checks.push('submit evidence and persist after reload');
 await page.locator('a[data-view="map"]').click();await page.locator('.node[data-node=python]').click();await page.locator('#evidence').fill('x');await page.getByRole('button',{name:'提交成果记录'}).click();await page.getByRole('status').filter({hasText:'缺少成果说明'}).waitFor();checks.push('short evidence rejected');
 await page.locator('a[data-view="resources"]').click();await page.locator('#language').selectOption('zh');assert.equal(await page.locator('article.resource').count(),2);await page.locator('#search').fill('不存在的课程');assert.equal(await page.locator('article.resource').count(),0);checks.push('resource language and text filtering');
 await page.locator('a[data-view="labs"]').click();await page.locator('#lab-stage').selectOption('0');assert.equal(await page.locator('article.resource').count(),1);checks.push('lab stage filtering');
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;await download.saveAs('artifacts/qa-backup.json');const backup=JSON.parse(await readFile('artifacts/qa-backup.json','utf8'));assert.equal(backup.records.computer.status,'submitted');
 await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('#backup-file').setInputFiles('artifacts/qa-backup.json');await page.getByRole('status').filter({hasText:'合并恢复'}).waitFor();checks.push('export, clear storage, restore');
 const raw=await page.evaluate(()=>localStorage.getItem('ai-infra-lab.progress.v1'));await writeFile('artifacts/qa-invalid.json',JSON.stringify({schemaVersion:99,records:{}}));await page.locator('#backup-file').setInputFiles('artifacts/qa-invalid.json');await page.getByRole('status').filter({hasText:'恢复失败'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('ai-infra-lab.progress.v1')),raw);checks.push('invalid restore leaves existing data unchanged');
 backup.records.computer.evidence='<img src=x onerror="window.__injected=1">成果说明，保留测试证据，不执行任何嵌入标签。';backup.records.computer.updatedAt=new Date(Date.now()+1000).toISOString();await writeFile('artifacts/qa-text.json',JSON.stringify(backup));await page.locator('#backup-file').setInputFiles('artifacts/qa-text.json');await page.locator('a[data-view="map"]').click();await page.locator('.node[data-node=computer]').click();assert.match(await page.locator('#evidence').inputValue(),/<img/);assert.equal(await page.evaluate(()=>window.__injected),undefined);assert.equal(await page.locator('#node-detail img').count(),0);checks.push('imported markup stays plain text');
 await page.setViewportSize({width:390,height:844});for(const view of ['learn','map','resources','labs','about']){await page.locator(`a[data-view="${view}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`mobile overflow ${view}`);}await page.locator('a[data-view="learn"]').click();await page.screenshot({path:'artifacts/mobile.png',fullPage:true});checks.push('all five views at mobile width');
 await page.setViewportSize({width:1000,height:900});await page.addStyleTag({content:'html{font-size:32px}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks.push('200% text scale without page overflow');
 for(const path of ['/.git/config','/scripts/serve.mjs','/package.json'])assert.equal((await fetch('http://127.0.0.1:4173'+path)).status,404);checks.push('local private files not served');
 // Serve built output under a repository prefix to detect Pages-relative URL errors.
 const root=resolve('dist');const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html'};
 const staticServer=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(!u.pathname.startsWith('/repo/'))throw Error();const p=resolve(root,'.'+u.pathname.slice(5)+(u.pathname.endsWith('/')?'index.html':''));if(!p.startsWith(root+sep))throw Error();const data=await readFile(p);res.writeHead(200,{'Content-Type':mime[extname(p)]||'text/plain; charset=utf-8'});res.end(data);}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>staticServer.listen(0,'127.0.0.1',r));try{const url=`http://127.0.0.1:${staticServer.address().port}/repo/`;await page.goto(url);await page.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();await page.locator('a[data-view="about"]').click();const links=await page.locator('main a').evaluateAll(as=>as.map(a=>a.href));assert.ok(links.every(l=>l.startsWith(url)));for(const l of links)assert.equal((await fetch(l)).status,200);checks.push('Pages project prefix and documentation links');}finally{await new Promise(r=>staticServer.close(r));}
 assert.deepEqual(errors,[]);checks.push('no browser runtime errors');
 console.log(JSON.stringify({passed:true,checks,webmcp:'Not available in test browser; optional registration not independently validated.'},null,2));await writeFile('artifacts/browser-results.json',JSON.stringify({passed:true,checks},null,2));
}finally{await context.close();await browser.close();}
