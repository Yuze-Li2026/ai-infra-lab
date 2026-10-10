import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.LAB_BROWSER_PATH?{executablePath:process.env.LAB_BROWSER_PATH}:{channel:'chrome'})});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
const page=await context.newPage(),checks=[],violations=[],errors=[],screenshots=[];
page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
const base=process.env.LAB_QA_URL||'http://127.0.0.1:4173';
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
let failure;
await mkdir('artifacts',{recursive:true});
try{
 let releaseCatalog;const delayedCatalog=new Promise(resolve=>{releaseCatalog=resolve;});
 const loadingPage=await context.newPage();
 await loadingPage.route('**/catalog.json',async route=>{await delayedCatalog;await route.continue();});
 await loadingPage.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await loadingPage.locator('#import').isDisabled(),true);
 assert.equal(await loadingPage.locator('#export').isDisabled(),true);
 releaseCatalog();await loadingPage.getByRole('heading',{name:'把知识变成工程能力'}).waitFor();
 assert.equal(await loadingPage.locator('#import').isEnabled(),true);
 await loadingPage.close();checks.push('backup controls stay disabled until delayed catalog and stored records are ready');
 await page.goto(base+'/#learn');await page.locator('.start-guide').waitFor();
 assert.equal(await page.locator('[data-lab-total] strong').innerText(),String(catalog.labs.length));
 assert.ok((await page.locator('[data-lab-total]').innerText()).includes(`${catalog.labs.filter(l=>l.command).length} 个本地运行 · ${catalog.labs.filter(l=>l.preparationCommand).length} 个原课流程`));
 await page.goto(base+'/#labs');await page.locator('.lab-card').first().waitFor();
 assert.equal(await page.locator('.lab-card').count(),catalog.labs.length);
 assert.equal(await page.locator('.lab-card.lab-ready').count(),catalog.labs.filter(l=>l.command).length);
 checks.push('homepage experiment total equals every unfiltered lab card, with local commands and original-course workflows identified separately');
 await page.goto(base+'/#learn');await page.locator('.start-guide').waitFor();
 assert.equal(await page.locator('.start-guide').getAttribute('open'),'');
 await page.getByRole('link',{name:/打开第一个任务/}).click();await page.locator('#node-detail').waitFor();
 assert.match(await page.locator('.study-scope').innerText(),/文件操作与原课环境起步/);
 await page.locator('#node-detail').getByRole('link',{name:'打开中文学习指南',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.tagName==='H3');
 assert.equal(await page.locator(':focus').innerText(),'认识文件与运行程序');
 await page.goto(base+'/#learn');await page.getByRole('link',{name:/按工程方向选路线/}).click();await page.locator('.document-body h1').waitFor();
 assert.equal(new URL(page.url()).hash,'#read/docs/learning-paths.md');
 await page.goto(base+'/#learn');await page.getByRole('link',{name:/完成第一次本地检查/}).click();await page.locator('.document-body h1').waitFor();
 assert.equal(new URL(page.url()).hash,'#read/docs/getting-started.md');
 await page.goto(base+'/#learn/computer');await page.locator('#evidence').fill('已建立学习目录，独立运行程序并解释文件路径、输入输出与错误定位。');
 await page.getByRole('button',{name:'记录为学习中',exact:true}).click();await page.getByRole('status').filter({hasText:'学习状态已保存'}).waitFor();
 await page.reload();await page.locator('.start-guide').waitFor();assert.equal(await page.locator('.start-guide').getAttribute('open'),null);
 await page.locator('.start-guide summary').click();assert.equal(await page.getByRole('link',{name:/打开第一个任务/}).isVisible(),true);
 await page.evaluate(()=>localStorage.clear());await page.goto(base+'/#learn');await page.reload();
 checks.push('first-visit entry links reach real tasks and guides; saved learners see a collapsed, reopenable guide without changing progress');
 for(const n of catalog.nodes){
  await page.goto(base+'/#map/'+n.id);await page.locator('.topic-reading summary').click();
  assert.equal(await page.locator('.topic-reading li').count(),n.topics.length,n.id);
  for(const t of n.topics){
   const item=page.locator(`[data-topic="${t.id}"]`);
   assert.ok((await item.innerText()).includes(t.outcome),t.id);
   assert.equal(await item.locator('a').first().getAttribute('href'),t.url,t.id);
   assert.equal(await item.locator('.environment-help').count(),t.environment==='reading'?0:1,t.id);
  }
 }
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/#map/training');
  await page.locator('.topic-reading summary').click();
  const expandedTopics=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  violations.push(...expandedTopics.violations.map(v=>({route:'map/training/topics',width,id:v.id,nodes:v.nodes})));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const path=`artifacts/ui-topics-${width}.png`;await page.locator('.topic-reading').screenshot({path});screenshots.push(path);
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`topics 200% ${width}`);
  await page.evaluate(()=>{document.documentElement.style.fontSize='';});
  await page.getByRole('link',{name:'在知识清单中阅读本节',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.tagName==='H2');
  assert.equal(await page.locator(':focus').innerText(),catalog.nodes.find(n=>n.id==='training').title);
  for(const n of catalog.nodes)assert.equal(await page.getByRole('heading',{name:n.title,exact:true,level:2}).count(),1,n.id);
 }
 checks.push('all topic outcomes and primary links render; expanded readings pass four widths, 200% text, accessibility and chapter navigation');
 await page.goto(base+'/#labs');await page.getByRole('link',{name:'配置个人云端实验室',exact:true}).click();
 await page.locator('.document-body h1').waitFor();assert.equal(new URL(page.url()).hash,'#read/docs/private-cloud.md');
 checks.push('private laboratory guide is reachable without exposing instance addresses or credentials');
 await page.goto(base+'/#labs');assert.equal(await page.locator('.lab-card .environment-help').count(),catalog.labs.length);
 for(const [environment,id,title]of [['cpu','computer','CPU'],['linux','linux','Linux'],['gpu','gpu','GPU'],['multi-gpu','training','多卡与集群'],['cluster','orchestration','多卡与集群'],['device','accelerators','目标设备']]){
  await page.goto(base+'/#map/'+id);await page.locator('.topic-reading summary').click();
  await page.locator(`[data-environment="${environment}"]`).first().click();
  await page.waitForFunction(()=>document.activeElement?.tagName==='H2');assert.equal(await page.locator(':focus').innerText(),title);
 }
 checks.push('every lab has preparation help; six knowledge environment links reach the matching beginner chapter');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const route of ['learn','map','resources','labs','about','map/computer','milestone/0','read/docs/writing-guide.md']){
    await page.goto(base+'/#'+route);await page.locator('main h1').waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: ${route}`);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    violations.push(...result.violations.map(v=>({route,width,id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
    const path=`artifacts/ui-${route.replace(/[^a-z0-9]/g,'-')}-${width}.png`;
    await page.screenshot({path,fullPage:route==='learn'});screenshots.push(path);
  }
  }
  checks.push('eight routes at desktop and mobile widths scanned against WCAG A/AA rules with screenshots');
  await page.goto(base+'/#labs');await page.locator('.practice-guide summary').click();
  assert.equal(await page.locator('.practice-steps li').count(),4);
  const expanded=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  violations.push(...expanded.violations.map(v=>({route:'labs/expanded-help',width:390,id:v.id,nodes:v.nodes})));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('link',{name:'源码下载、环境准备与报告导入',exact:true}).click();await page.locator('.document-body h1').waitFor();
  checks.push('expanded experiment guidance remains accessible and links to preparation, execution and report instructions');
  await page.goto(base+'/#read/docs/writing-guide.md');await page.locator('.document-body h1').waitFor();
  assert.equal(await page.locator('.document-outline').getAttribute('open'),null);
  await page.locator('.document-outline summary').click();await page.locator('.document-outline button').nth(1).click();
  const chapter=await page.locator(':focus').innerText(),chapterURL=page.url();
  assert.equal(new URL(chapterURL).hash.split('#').length,3);
  await page.reload();await page.waitForFunction(()=>document.activeElement?.tagName==='H2');assert.equal(await page.locator(':focus').innerText(),chapter);
  await page.goto(base+'/#read/docs/writing-guide.md#missing-chapter');await page.getByRole('status').filter({hasText:'没有找到'}).waitFor();assert.equal(await page.locator('.document-body h1').count(),1);
  checks.push('mobile outline opens, chapter URLs restore focus after reload, and missing chapters show a recoverable notice');
  await page.goto(base+'/#read/docs/private-cloud.md');await page.locator('.document-body h1').waitFor();
  const tableNames=await page.locator('.document-body .table-wrap').evaluateAll(elements=>elements.map(element=>element.getAttribute('aria-label')));
  assert.ok(tableNames.length>1);assert.equal(new Set(tableNames).size,tableNames.length);
  assert.ok(tableNames.every(name=>name&&name.includes('可横向滚动')));
  const longCode=page.locator('.document-body pre').filter({hasText:'ssh-keygen -t ed25519'}).first();
  assert.equal(await longCode.getAttribute('tabindex'),'0');
  const copyBefore=longCode.locator('..').getByRole('button',{name:'复制代码',exact:true});
  await copyBefore.focus();await page.keyboard.press('Tab');assert.equal(await longCode.evaluate(element=>element===document.activeElement),true);
  assert.ok(await longCode.evaluate(element=>element.scrollWidth>element.clientWidth));
  await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.activeElement?.tagName==='PRE'&&document.activeElement.scrollLeft>0);
  const cloudAccessibility=await new AxeBuilder({page}).analyze();
  violations.push(...cloudAccessibility.violations.map(v=>({route:'read/docs/private-cloud.md',width:390,id:v.id,nodes:v.nodes})));
  checks.push('cloud guide tables have distinct accessible names; keyboard users can enter and scroll long commands; full accessibility rules checked');
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(base+'/#labs');await page.locator('.command-block').first().waitFor();
  const command=await page.locator('.command-block code').first().innerText();
  await page.locator('.command-block [data-copy]').first().click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),command);
  await page.goto(base+'/#read/docs/getting-started.md');await page.locator('.code-block').first().waitFor();
  const code=await page.locator('.code-block code').first().innerText();await page.locator('.code-block [data-copy]').first().click();
  // Windows normalizes text clipboard line endings to CRLF; content must otherwise match exactly.
  assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),code);
  await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new DOMException('Denied','NotAllowedError'));});
  await page.locator('.code-block [data-copy]').first().click();await page.getByRole('status').filter({hasText:'已选中'}).waitFor();
  assert.equal(await page.evaluate(()=>getSelection().getRangeAt(0).toString()),code);
  checks.push('lab commands and document code copy exact text; denied clipboard permission selects text and explains recovery');
  for(const [route,id,value]of [['resources','language','zh'],['labs','lab-stage','1'],['map','node-category','core']]){
    await page.goto(base+'/#'+route);await page.locator('#'+id).selectOption(value);assert.equal(await page.locator(':focus').getAttribute('id'),id);
  }
  checks.push('all filters retain keyboard focus after results update');
  for(const width of [320,768]){
    await page.setViewportSize({width,height:900});
    for(const route of ['learn','map','resources','labs','about','read/docs/getting-started.md']){
      await page.goto(base+'/#'+route);await page.locator('main h1').waitFor();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: ${route}`);
    }
  }
  await page.setViewportSize({width:1280,height:900});await page.goto(base+'/#learn');await page.reload();await page.locator('main h1').waitFor();
  const originalSize=await page.locator('main h1').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  assert.equal(await page.locator('main h1').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),originalSize*2);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'artifacts/ui-text-200.png'});screenshots.push('artifacts/ui-text-200.png');
  checks.push('320, 390, 768 and 1440 pixel layouts fit; 200% text actually doubles the computed heading size without page overflow');
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ['learn','map','resources','labs','map/computer','read/docs/getting-started.md']){
      await page.goto(base+'/#'+route);await page.locator('main h1').waitFor();
      await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`200% text: ${width} ${route}`);
      const crowded=await page.locator('.sidebar nav a,.topbar button,.quick-help').evaluateAll(elements=>elements.filter(element=>{
        const bounds=element.getBoundingClientRect();
        const range=document.createRange();range.selectNodeContents(element);
        return element.scrollWidth>element.clientWidth+1||[...range.getClientRects()].some(rect=>rect.width>0&&(rect.left<bounds.left-1||rect.right>bounds.right+1));
      }).map(element=>element.textContent.trim()));
      assert.deepEqual(crowded,[],`text extends outside a navigation or toolbar control: ${width} ${route}`);
    }
    if(width<=390){
      await page.goto(base+'/#learn');await page.locator('main h1').waitFor();
      await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
      const path=`artifacts/ui-text-200-${width}.png`;await page.screenshot({path});screenshots.push(path);
      await page.locator('.sidebar').getByRole('link',{name:'精选资源',exact:true}).click();await page.locator('#language').waitFor();
      assert.equal(new URL(page.url()).hash,'#resources');
    }
  }
  checks.push('at 200% text, six routes fit four widths; navigation and toolbar text stay inside their controls, and mobile navigation remains operable');
  const keyboardPage=await context.newPage();
  await keyboardPage.goto(base+'/#learn');await keyboardPage.locator('main h1').waitFor();
  await keyboardPage.keyboard.press('Tab');assert.match(await keyboardPage.locator(':focus').innerText(),/跳到学习内容/);
  await keyboardPage.keyboard.press('Enter');assert.equal(await keyboardPage.locator(':focus').getAttribute('id'),'main');
  await keyboardPage.close();
  checks.push('keyboard skip link moves focus to main content');
  assert.deepEqual(errors,[]);
  assert.equal(violations.length,0,violations.map(v=>`${v.route}: ${v.id} (${v.nodes.length})`).join('\n')+'\nDetails: artifacts/quality-browser-results.json');console.log({passed:true,checks});
}catch(error){failure=error;throw error;}finally{
 await writeFile('artifacts/quality-browser-results.json',JSON.stringify({passed:!failure,checkedAt:new Date().toISOString(),checks,violations,screenshots,error:failure?.message,limits:'Automated checks plus explicit keyboard interaction; not full WCAG certification.'},null,2)+'\n');
 await context.close();await browser.close();
}
