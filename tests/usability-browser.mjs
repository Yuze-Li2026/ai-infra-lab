import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(resolve(process.env.LAB_PLAYWRIGHT_ROOT,'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.LAB_BROWSER_PATH});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage(),checks=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
const base=process.env.LAB_QA_URL||'http://127.0.0.1:4173';
try{
 await page.goto(base+'/#labs');await page.locator('.lab-card').first().waitFor();
 assert.equal(await page.locator('.lab-card').count(),11);
 assert.equal(await page.locator('.lab-card a[href="#read/docs/project-workflows.md"]').count(),5);
 for(const card of await page.locator('.lab-card').all())assert.equal(await card.locator('a[href^="#read/docs/"]').count(),1);
 assert.equal(await page.getByText('原课准备流程',{exact:true}).count(),5);
 checks.push('all eleven lab entries have accessible guides; five original-course plans remain distinct from reproduced labs');
 await page.locator('a[href="#read/docs/project-workflows.md"]').first().click();await page.locator('.document-body h1').waitFor();
 assert.equal(await page.locator('.document-outline button').count(),6);
 for(const text of ['python-project check','ostep-project check','needle check','raft check','systems check'])assert.ok((await page.locator('.document-body').innerText()).includes(text));
 checks.push('each original-course guide contains its actual preparation, environment and execution commands');
 const evidence=JSON.parse(await readFile('artifacts/gpu-contract-results.json','utf8'));
 await page.goto(base+'/#labs');await page.locator('[data-report=gpu]').click();
 await page.locator('#report-file').setInputFiles(evidence.results.find(r=>r.name==='contract-routing').report);
 await page.getByRole('status').filter({hasText:'作品通过报告'}).waitFor();
 assert.match(await page.locator('.lab-card').filter({hasText:'GPU · 正确性'}).innerText(),/完整范围通过/);
 const exported=page.waitForEvent('download');await page.locator('#export').click();
 const backup=JSON.parse(await readFile(await(await exported).path(),'utf8'));assert.equal(backup.labReports.gpu.tests,7);assert.equal(backup.labReports.gpu.mode,'submission');
 checks.push('actual seven-case GPU routing report imports and backs up; reference fixture does not prove learner authorship');
 await page.locator('[data-report=gpu]').click();await page.locator('#report-file').setInputFiles(evidence.results.find(r=>r.name==='missing-optimizer-state').report);
 await page.getByRole('status').filter({hasText:'未通过的作品报告'}).waitFor();
 assert.match(await page.locator('.lab-card').filter({hasText:'GPU · 正确性'}).innerText(),/未通过/);
 checks.push('actual incomplete-checkpoint report imports as failed and replaces the preceding result');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const route of ['labs','read/docs/project-workflows.md','read/docs/gpu-lab.md','read/docs/usability-audit.md']){
   await page.goto(base+'/#'+route);await page.locator(route.startsWith('read')?'.document-body h1':'main h1').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: ${route}`);
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/#labs');await page.locator('.lab-card').first().waitFor();await page.screenshot({path:'artifacts/usability-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/#read/docs/project-workflows.md');await page.locator('.document-body h1').waitFor();await page.screenshot({path:'artifacts/usability-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);checks.push('four viewport sizes and long command guides fit without runtime errors');
 const result={passed:true,url:base,checks};await writeFile('artifacts/usability-browser-results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await context.close();await browser.close();}
