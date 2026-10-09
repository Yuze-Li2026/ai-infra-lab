import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(resolve(process.env.LAB_PLAYWRIGHT_ROOT,'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.LAB_BROWSER_PATH});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage();page.on('dialog',d=>d.accept());const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173',catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
try{
 await page.goto(base+'/#labs');await page.locator('[data-report=dbdb]').click();await page.locator('#report-file').setInputFiles('artifacts/dbdb-report.json');
 await page.getByRole('status').filter({hasText:'参考复现报告'}).waitFor();
 await page.goto(base+'/#milestone/2');await page.getByRole('heading',{name:'系统 · 理解计算机'}).waitFor();assert.equal(await page.locator('.stat strong').nth(1).innerText(),'0 / 1');checks.push('reference report is stored but not accepted as independent work');
 const independent=JSON.parse(await readFile('artifacts/dbdb-report.json','utf8'));independent.mode='submission';
 await writeFile('artifacts/qa-submission.json',JSON.stringify(independent));await page.locator('[data-report=dbdb]').click();await page.locator('#report-file').setInputFiles('artifacts/qa-submission.json');
 await page.getByRole('status').filter({hasText:'作品通过报告'}).waitFor();assert.equal(await page.locator('.stat strong').nth(1).innerText(),'1 / 1');assert.match(await page.locator('.stat strong').nth(2).innerText(),/继续积累/);
 checks.push('passing submission summary requires knowledge evidence; file does not automatically certify stage');
 const download=page.waitForEvent('download');await page.locator('#export').click();const backup=JSON.parse(await readFile(await (await download).path(),'utf8'));assert.equal(backup.labReports.dbdb.mode,'submission');assert.match(backup.labReports.dbdb.sha256,/^[a-f0-9]{64}$/);
 await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('#backup-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.getByRole('status').filter({hasText:'合并恢复'}).waitFor();assert.equal(await page.locator('.stat strong').nth(1).innerText(),'1 / 1');checks.push('report summaries survive export, clear and restore');
 const before=await page.evaluate(()=>localStorage.getItem('ai-infra-lab.progress.v1'));
 for(const invalid of [{...independent,lab:'micrograd'},{...independent,passed:false},{...independent,commit:'old'}]){
  await page.locator('[data-report=dbdb]').click();await page.locator('#report-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await page.getByRole('status').filter({hasText:'报告导入失败'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('ai-infra-lab.progress.v1')),before);
 }
 checks.push('mismatched, contradictory and old report imports preserve existing data');
 for(const stage of catalog.stages){await page.goto(base+'/#milestone/'+stage.id);await page.locator('main h1').waitFor();assert.equal(await page.locator('main .stat').count(),3);}checks.push('all five stage reviews are accessible');
 const docs=['getting-started','dbdb-lab','consensus-lab','micrograd-lab','gpu-lab','advanced-labs','curriculum','requirements-audit','release-complete'];
 for(const doc of docs){await page.goto(base+'/#read/docs/'+doc+'.md');await page.locator('.document-body h1').waitFor();assert.equal(await page.locator('.document-body script').count(),0);}checks.push('guides render inside the workspace');
 await page.goto(base+'/#read/docs/dbdb-lab.md');await page.locator('.document-body h1').waitFor();assert.equal(await page.locator('.document-body pre code').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');await page.locator('.document-outline button').first().click();assert.match(await page.evaluate(()=>document.activeElement.textContent),/Learn/);checks.push('document outline works with keyboard focus');
 await page.route('**/docs/dbdb-lab.md',route=>route.fulfill({contentType:'text/plain',body:'# 测试文档\n\n## 安全\n<script>window.__injected=1</script><img src=x onerror="window.__injected=1"><a href="javascript:alert(1)">危险</a><a href="https://example.org/">外部</a>'}));
 await page.reload();await page.getByRole('heading',{name:'测试文档'}).waitFor();assert.equal(await page.locator('.document-body img,.document-body script,.document-body a[href^="javascript:"]').count(),0);assert.equal(await page.evaluate(()=>window.__injected),undefined);assert.match(await page.locator('.document-body a').getAttribute('rel'),/noopener/);checks.push('Markdown sanitization rejects executable markup and unsafe links');await page.unroute('**/docs/dbdb-lab.md');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});for(const route of ['milestone/2','read/docs/curriculum.md','read/docs/requirements-audit.md','read/docs/gpu-lab.md']){await page.goto(base+'/#'+route);await page.locator(route.startsWith('read')?'.document-body h1':'main h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: ${route}`);}}checks.push('stage reviews and long guides fit four viewport sizes');
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/#read/docs/dbdb-lab.md');await page.locator('.document-body h1').waitFor();await page.screenshot({path:'artifacts/guide-desktop.png',fullPage:true});
 await page.goto(base+'/#milestone/2');await page.locator('main h1').waitFor();await page.screenshot({path:'artifacts/milestone-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/#read/docs/gpu-lab.md');await page.locator('.document-body h1').waitFor();await page.screenshot({path:'artifacts/guide-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);checks.push('no runtime errors');const result={passed:true,checks};await writeFile('artifacts/complete-browser-results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await context.close();await browser.close();}
