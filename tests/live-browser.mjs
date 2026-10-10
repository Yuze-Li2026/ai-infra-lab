// Optional post-deployment QA using existing Playwright and a fresh browser context.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {allowedDocuments} from '../site/documents.js';
import {sourceSnapshot,sameSource} from '../scripts/verification-state.mjs';
const require=createRequire(process.env.LAB_PLAYWRIGHT_ROOT?resolve(process.env.LAB_PLAYWRIGHT_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const base=new URL(process.env.LAB_LIVE_URL||'https://yuze-li2026.github.io/ai-infra-lab/');
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
assert.equal(base.protocol,'https:');
const before=await sourceSnapshot();
await mkdir('artifacts',{recursive:true});
// A launch, HTTP or interaction failure must not leave an old success current.
let result={passed:false,url:base.href,checkedAt:new Date().toISOString(),source:{before,after:before},error:'Online verification did not complete'};
await writeFile('artifacts/live-browser-results.json',JSON.stringify(result,null,2)+'\n');
const browser=await chromium.launch({headless:true,...(process.env.LAB_BROWSER_PATH?{executablePath:process.env.LAB_BROWSER_PATH}:{channel:'chrome'})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage(),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
try{
 const manifest=JSON.parse(await readFile('dist/build-manifest.json','utf8'));
 const publicManifest=await context.request.get(new URL('build-manifest.json',base).href);
 assert.equal(publicManifest.status(),200);assert.deepEqual(await publicManifest.json(),manifest);
 for(const file of manifest.files){const response=await context.request.get(new URL(file.path,base).href);assert.equal(response.status(),200,file.path);const bytes=await response.body();assert.equal(bytes.length,file.bytes,file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
 checks.push(`all ${manifest.files.length} public file sizes and SHA-256 match the reviewed local build`);
 await page.goto(base.href);await page.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();
 assert.equal(await page.locator('[data-lab-total] strong').innerText(),String(catalog.labs.length));
 await page.goto(base.href+'#labs');await page.locator('.lab-card').first().waitFor();
 assert.equal(await page.locator('.lab-card').count(),catalog.labs.length);
 checks.push('online homepage experiment total matches all experiment cards');
 await page.goto(base.href);await page.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();
 await page.getByRole('button',{name:'打开学习任务'}).click();await page.locator('#evidence').fill('线上临时上下文验收：已创建文件并运行独立程序，解释编辑、执行与路径，并保存真实命令输出。');await page.getByRole('button',{name:'提交成果记录'}).click();await page.getByRole('status').filter({hasText:'成果记录已保存'}).waitFor();await page.reload();assert.equal(await page.locator('.stat strong').first().innerText(),`1 / ${catalog.nodes.length}`);
 const download=page.waitForEvent('download');await page.locator('#export').click();const backup=await readFile(await(await download).path(),'utf8');await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('#backup-file').setInputFiles({name:'live-backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.getByRole('status').filter({hasText:'合并恢复'}).waitFor();assert.equal(await page.locator('.stat strong').first().innerText(),`1 / ${catalog.nodes.length}`);checks.push('real HTTPS submission, reload, backup and restore in isolated context');
 for(const node of catalog.nodes){await page.goto(base.href+'#map/'+node.id);await page.getByRole('heading',{name:node.title,exact:true}).waitFor();}checks.push(`all ${catalog.nodes.length} task deep links`);
 for(const doc of allowedDocuments){await page.goto(base.href+'#read/'+doc);await page.locator('.document-body').waitFor();if(doc!=='LICENSE')await page.locator('.document-body h1').waitFor();assert.equal(await page.locator('.document-body script,.document-body iframe').count(),0);}checks.push(`all ${allowedDocuments.size} guides and license render at repository prefix`);
 await page.goto(base.href+'#read/docs/dbdb-lab.md');await page.getByRole('link',{name:'环境准备',exact:true}).click();await page.locator('.document-body h1').filter({hasText:'从第一个文件开始'}).waitFor();assert.equal(new URL(page.url()).pathname,base.pathname);checks.push('relative guide link stays within Pages workspace');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});for(const route of ['learn','map','resources','labs','about','read/docs/path-evidence.md']){await page.goto(base.href+'#'+route);await page.locator(route.startsWith('read')?'.document-body h1':'main h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${route}`);}}checks.push('all views and evidence guide fit four viewport sizes');
 await page.setViewportSize({width:1440,height:1000});await page.goto(base.href);await page.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();await page.screenshot({path:'artifacts/live-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/live-mobile.png',fullPage:true});await page.setViewportSize({width:1000,height:900});
 const originalSize=await page.locator('main h1').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
 assert.equal(await page.locator('main h1').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),originalSize*2);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('200% text actually doubles the heading size without page overflow');
 assert.deepEqual(errors,[]);checks.push('no browser runtime errors');
 const after=await sourceSnapshot();assert.ok(sameSource(before,after),'Source changed during online verification');
 result={passed:true,url:base.href,checkedAt:new Date().toISOString(),source:{before,after},publicFiles:manifest.files.length,checks};console.log(result);
}catch(error){result.error=error.message;throw error;}finally{await writeFile('artifacts/live-browser-results.json',JSON.stringify(result,null,2)+'\n');await context.close();await browser.close();}
