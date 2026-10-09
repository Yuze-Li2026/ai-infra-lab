import {ready, nextNode} from './core.js';
import {milestoneStatus,REPORT_LABS} from './reports.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, text, className = '') => {
 const local=/^\.\/(docs\/[a-z0-9-]+\.md|CREDITS\.md|README\.md|LICENSE|CONTRIBUTING\.md)$/.test(url);
 return `<a class="${className}" href="${escape(local?'#read/'+url.slice(2):url)}" ${local?'':'target="_blank" rel="noopener noreferrer"'}>${escape(text)}</a>`;
};
const chip = (text, green = false) => `<span class="chip ${green ? 'green' : ''}">${escape(text)}</span>`;
const intro = (eyebrow, title, text) => `<div class="intro"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${text}</p></div>`;
const categoryLabels = {core:'核心必修', specialist:'方向必修', optional:'可选深入'};
const evaluationLabels = {authority:'权威性',accuracy:'准确性',depth:'理论深度',engineeringValue:'工程价值',coverage:'覆盖程度',teachingQuality:'教学质量',difficulty:'先修难度',languageFriendliness:'语言友好度',accessibility:'可访问性',maintenance:'维护状态',licensing:'许可证',stability:'长期稳定性'};

export function createViews(state) {
  const {catalog, progress, selected, filter, stageFilter, langFilter, drafts} = state;
  const source = id => catalog.sources.find(s => s.id === id);
  const node = id => catalog.nodes.find(n => n.id === id);
  const isDone = id => progress.records[id]?.status === 'submitted';
  const completed = () => catalog.nodes.filter(n => isDone(n.id)).length;
  const status = n => isDone(n.id) ? '已提交成果' : progress.records[n.id]?.status === 'started' ? '学习中' : ready(n, progress) ? '可开始' : '待先修';
  const nodeButton = (id, cls = 'quiet') => `<button class="${cls}" data-node="${id}">${escape(node(id).title)}</button>`;

  function details(n) {
    const value = drafts.has(n.id) ? drafts.get(n.id) : progress.records[n.id]?.evidence || '';
    const related = catalog.labs.filter(l => l.nodes.includes(n.id));
    const following = catalog.nodes.filter(other => other.prerequisites.includes(n.id));
    return `<section class="detail panel" id="node-detail" tabindex="-1" aria-label="学习任务详情">
      <div class="detail-heading"><div><span class="eyebrow">LEARNING BRIEF / 阶段 ${n.stage}</span><h2>${escape(n.title)}</h2></div>${chip(status(n), ready(n,progress))}</div>
      <p class="detail-objective">${escape(n.objective)}</p>
      <div class="dependency-block"><span class="section-label">先修知识</span><div class="dependency">${n.prerequisites.map(id=>nodeButton(id)).join('') || '<span class="muted">无先修要求，可以从这里开始。</span>'}</div></div>
      <div class="detail-columns"><div>
        <h3>学习步骤</h3><ol class="learning-steps">${n.steps.map((s,i)=>`<li><span class="step-number">0${i+1}</span><div><strong>${escape(s.title)}</strong><p>${escape(s.task)}</p></div></li>`).join('')}</ol>
        <h3>精选原始资源</h3><div class="reading-list">${n.resources.map((id,i)=>`<div><span class="section-label">${i===0?'主资源':'补充阅读'}</span>${link(source(id).url,source(id).title)}<small>${escape(source(id).author)}</small></div>`).join('')}</div>
        ${related.length ? `<h3>相关实践</h3><ul class="related-labs">${related.map(l=>`<li>${link(l.guide||l.url,l.title)}<small>${escape(l.status)}</small></li>`).join('')}</ul>` : ''}
        <details class="review-note"><summary>学习范围与研究状态</summary><p>${escape(n.scope)}</p><p>${escape(n.status)}。已有基础可以用对应作品和测试证明跳过。</p></details>
      </div><div class="evidence-panel">
        <span class="eyebrow">PROOF OF WORK</span><h3>留下可复现的成果</h3><p>${escape(n.evidence)}</p>
        <label for="evidence">代码位置、测试结果和你的解释</label><textarea id="evidence" maxlength="6000" placeholder="做了什么？如何验证？遇到的问题和设计取舍是什么？至少写 20 字。">${escape(value)}</textarea>
        <div class="actions"><button data-start="${n.id}">记录为学习中</button><button class="primary" data-submit="${n.id}">提交成果记录</button></div>
        <p class="fineprint">成果由本人提交，尚未经过独立评审。观看视频或勾选不能代替工程能力验证。</p>
      </div></div>
      ${following.length ? `<div class="next-dependencies"><span class="section-label">这些知识将用在</span><div class="dependency">${following.map(n=>nodeButton(n.id)).join('')}</div></div>` : ''}
    </section>`;
  }

  function learning() {
    const next = nextNode(catalog.nodes,progress);
    const count = completed();
    const records = Object.entries(progress.records).sort((a,b)=>Date.parse(b[1].updatedAt)-Date.parse(a[1].updatedAt)).slice(0,3);
    return intro('YOUR LEARNING WORKSPACE','把知识变成工程能力','沿着清晰的先修路径，向原作者学习，用自己的工程成果向前走。') + `
      <div class="stats">
        <div class="stat"><span>学习进度</span><strong>${count} <small>/ ${catalog.nodes.length}</small></strong><span>知识节点已提交成果</span></div>
        <div class="stat"><span>精选知识来源</span><strong>${catalog.sources.length}</strong><span>课程、教材与原始文档</span></div>
        <div class="stat"><span>本地工程实践</span><strong>${String(catalog.labs.filter(l=>l.command).length).padStart(2,'0')}</strong><span>提供可运行流程的实验</span></div>
      </div>
      <div class="columns"><div>
        <section class="panel focus-panel"><div class="row"><span class="eyebrow">YOUR NEXT STEP</span>${chip(next?`阶段 0${next.stage}`:'当前路径')}</div>
          ${next ? `<h2 class="focus-title">${escape(next.title)}</h2><p>${escape(next.objective)}</p>
            <div class="focus-resource"><span class="section-label">从这个资源开始</span><strong>${escape(source(next.resources[0]).title)}</strong><span>${escape(source(next.resources[0]).author)}</span></div>
            <div class="actions"><button class="primary" data-node="${next.id}">打开学习任务</button>${link(source(next.resources[0]).url,'访问主资源','focus-link')}</div>
            <p class="focus-footnote">学习原理 · 独立实现 · 验证与解释</p>` : '<h2 class="focus-title">每一份成果，都值得复核</h2><p>当前节点均已提交成果。回看作品，检查设计与测试，继续解决真实工程问题。</p>'}
        </section>
        <section class="panel recent-panel"><div class="row"><h2>近期学习</h2><span class="section-label">YOUR NOTES</span></div>
          ${records.map(([id,r])=>`<div class="list-item row"><div>${nodeButton(id,'link-button')}<small>${r.status==='submitted'?'本人已提交成果':'学习中'} · ${new Date(r.updatedAt).toLocaleDateString('zh-CN')}</small></div>${chip(r.status==='submitted'?'已记录':'进行中')}</div>`).join('') || '<div class="empty-note"><span class="empty-number">01</span><div><strong>从第一份学习记录开始</strong><p>打开上方任务，阅读、实践，再保存你的理解与成果。</p></div></div>'}
        </section>
        <div class="principle"><span class="eyebrow">OUR APPROACH</span><p>站在巨人的肩膀上。<br><span>精选已有成果，建立连接，持续验证。</span></p></div>
      </div><section class="panel route-panel"><div class="row"><h2>你的学习路径</h2><span class="section-label">5 STAGES</span></div><p class="muted route-intro">从第一行代码，到理解真实系统。</p>
        <div class="roadmap">${catalog.stages.map(s=>{const ns=catalog.nodes.filter(n=>n.stage===s.id);const done=ns.filter(n=>isDone(n.id)).length;return `<div class="stage ${next?.stage===s.id?'current':''}"><div class="stage-index">0${s.id}</div><div class="stage-content"><div class="row"><a class="stage-review-link" href="#milestone/${s.id}">${escape(s.title.split('·')[1]?.trim()||s.title)}</a><span class="count">${done}/${ns.length}</span></div><p>${escape(s.description)}</p><div class="progress" role="progressbar" aria-label="${escape(s.title)}" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${ns.length}"><div style="width:${done/ns.length*100}%"></div></div></div></div>`;}).join('')}</div>
        <a class="route-link" href="#map">查看完整知识依赖</a><p class="fineprint">点击阶段名称，复核知识成果和独立作品报告。</p>
      </section></div>${selected?details(node(selected)):''}`;
  }

  function map() {
    return intro('KNOWLEDGE ATLAS','先理解依赖，再决定路线','从起点逐层展开。点击节点，查看前置知识、学习步骤，以及它将支持的下一项能力。') +
      (selected ? details(node(selected)) : '') +
      `<div class="map-legend">${chip('可开始',true)}${chip('待先修')}${chip('已提交成果',true)}<span>所有节点均可预览；已有基础可提交成果跳过。</span></div>` +
      catalog.stages.map(s=>`<section class="map-stage"><div class="map-stage-heading"><span class="stage-big">0${s.id}</span><div><h2>${escape(s.title)}</h2><p>${escape(s.description)}</p></div></div>
        <div class="node-grid">${catalog.nodes.filter(n=>n.stage===s.id).map(n=>`<button class="node ${isDone(n.id)?'done':!ready(n,progress)?'locked':''} ${selected===n.id?'selected':''}" data-node="${n.id}" aria-pressed="${selected===n.id}"><span class="node-meta">${categoryLabels[n.category]} <span>${status(n)}</span></span><strong>${escape(n.title)}</strong><span class="node-prereq">前置：${escape(n.prerequisites.map(id=>node(id).title).join('、')||'从零开始')}</span></button>`).join('')}</div></section>`).join('');
  }

  function resources() {
    const list=catalog.sources.filter(s=>(langFilter==='all'||s.language===langFilter)&&`${s.title} ${s.author} ${s.coverage}`.toLowerCase().includes(filter.trim().toLowerCase()));
    return intro('THE READING ROOM','精选资源，保留原始来源','每一项都有选择理由、适用范围与原作者。先找到合适的主资源，再按需深入。')+`
      <div class="filters"><input id="search" type="search" aria-label="搜索资源" value="${escape(filter)}" placeholder="搜索课程、作者或想掌握的能力"><select id="language" aria-label="资源语言"><option value="all">全部语言</option><option value="zh" ${langFilter==='zh'?'selected':''}>中文资源</option><option value="en" ${langFilter==='en'?'selected':''}>英文资源</option></select></div>
      <div class="section-meta"><span>${list.length} 项资源</span><span>最近研究日期 ${catalog.reviewedAt}</span></div>
      <div class="grid">${list.map(s=>`<article class="resource"><div class="row"><span class="eyebrow">${s.language==='zh'?'中文资源':'ORIGINAL SOURCE'}</span>${chip(s.id==='object-model'?'原测试已复现':'资料已初审',s.id==='object-model')}</div><h2>${escape(s.title)}</h2><div class="meta">${escape(s.author)}</div><p>${escape(s.reason)}</p><p class="resource-prereq"><span>先修</span>${escape(s.prerequisites)}</p>${link(s.url,'阅读原始资源','text-link')}
        <details class="resource-details"><summary>选择依据、版本与许可</summary><dl><dt>版本</dt><dd>${escape(s.version)}</dd>${Object.entries(s.evaluation).map(([key,value])=>`<dt>${escape(evaluationLabels[key]||key)}</dt><dd>${escape(value)}</dd>`).join('')}<dt>验证与局限</dt><dd>${escape(s.verification)} · ${s.reviewedAt}</dd><dd>${escape(s.limitations)}</dd></dl>${link(s.licenseUrl,'核查许可来源')}</details></article>`).join('')||'<div class="empty panel"><h2>没有找到匹配资源</h2><p>尝试更短的关键词，或切换到全部语言。</p></div>'}</div>`;
  }

  function labResults(l) {
    const v=l.validation;
    if(!v)return '';
    if(l.id!=='object-model')return `<details class="lab-results"><summary>实际复现结果 · ${v.tests} 项检查通过</summary><p>参考实现 · Python ${escape(v.python)} · ${escape(v.platform)}<br>运行日期 ${escape(v.createdAt.slice(0,10))}</p>${v.benchmark?.length?`<div class="table-wrap"><table><caption>本机测量；完整协议与局限见实验指南</caption><thead><tr><th>工作负载</th><th>中位数</th></tr></thead><tbody>${v.benchmark.map(b=>`<tr><td>${escape(b.device||b.name||'自动微分图')}</td><td>${escape(b.median_ms??b.medianMs??'详见报告')} ms</td></tr>`).join('')}</tbody></table></div>`:''}<p>原测试与补充检查分别说明；参考实现通过不代表学习者已掌握。</p></details>`;
    return `<details class="lab-results"><summary>查看实际复现结果 · ${v.tests} 项原测试通过</summary><p>参考实现 · Python ${escape(v.python)} · ${escape(v.platform)}<br>运行日期 ${escape(v.createdAt.slice(0,10))}</p>
      <div class="table-wrap"><table><caption>相同工作负载：10,000 个对象；一次预热、七次测量</caption><thead><tr><th>实现</th><th>保留内存</th><th>读取中位数</th></tr></thead><tbody>${v.benchmark.map(b=>`<tr><td>${b.stage==='03-customizable'?'字典属性存储':'共享 map 存储'}</td><td>${(b.retained_bytes/1048576).toFixed(2)} MiB</td><td>${(b.read_ns_median/1000000).toFixed(3)} ms</td></tr>`).join('')}</tbody></table></div>
      <p>本次测量中共享布局节省内存，但读取更慢。结果取决于实现与环境，不能外推到工业虚拟机，也不代表学习者已掌握。</p></details>`;
  }

  function reportRecord(l){
   if(!REPORT_LABS.includes(l.id))return '';
   const r=progress.labReports?.[l.id];
   return `<div class="report-record"><div class="row"><span class="section-label">我的实验报告</span>${r?chip(r.mode==='reference'?'参考复现':r.passed?'作品检查通过':'作品尚未通过',r.mode==='submission'&&r.passed):chip('尚未导入')}</div>${r?`<p>${r.tests} 项检查 · ${new Date(r.createdAt).toLocaleDateString('zh-CN')}<br><span class="fineprint">${escape(r.python)} · ${escape(r.platform)}</span></p>`:'<p>运行器生成 JSON 后，在这里导入。报告与学习备份一起保存在本地。</p>'}<button class="quiet" data-report="${l.id}">${r?'更新实验报告':'导入实验报告'}</button><p class="fineprint">${r?.mode==='reference'?'参考报告不计入个人作品验收。':'本地报告是本人提供的证据，不是独立认证。'}</p></div>`;
  }

  function milestone(){
   const stage=Number(location.hash.split('/')[1]);const m=milestoneStatus(catalog,progress,stage);
   if(!m)return intro('STAGE REVIEW','没有这个阶段','请从学习路径打开阶段验收。');
   return intro('STAGE REVIEW',escape(m.milestone.title),'把知识说明、独立作品和可复现实验放在一起复核。')+`<div class="stats"><div class="stat"><span>知识成果</span><strong>${m.submitted} <small>/ ${m.nodes.length}</small></strong><span>本人提交，需复核</span></div><div class="stat"><span>作品报告</span><strong>${m.accepted} <small>/ ${m.reports.length}</small></strong><span>独立提交模式且检查通过</span></div><div class="stat"><span>阶段状态</span><strong class="status-word">${m.ready?'材料齐备':'继续积累'}</strong><span>材料齐备仍需设计与解释评审</span></div></div><div class="columns"><section class="panel"><h2>知识与原理</h2>${m.nodes.map(n=>`<div class="list-item row">${nodeButton(n.id,'link-button')}${chip(status(n),isDone(n.id))}</div>`).join('')}</section><section class="panel"><h2>阶段验收标准</h2><ol class="rubric">${m.milestone.criteria.map(s=>`<li>${escape(s)}</li>`).join('')}</ol>${link('./docs/curriculum.md','阅读选章与复核任务','text-link')}</section></div><div class="grid lab-grid">${m.reports.map(({id})=>{const l=catalog.labs.find(l=>l.id===id);return `<section class="panel"><h2>${escape(l.title)}</h2><p>${escape(l.goal)}</p>${link(l.guide,'打开实验指南','text-link')}${reportRecord(l)}</section>`;}).join('')}</div><p class="fineprint">平台不会根据报告文件自动判定真实能力；文件指纹用于追溯，不是数字签名。</p>`;
  }

  function labs() {
    const list=catalog.labs.filter(l=>stageFilter==='all'||String(l.stage)===stageFilter).sort((a,b)=>Number(Boolean(b.command))-Number(Boolean(a.command))||a.stage-b.stage);
    return intro('THE ENGINEERING BENCH','用工程成果验证学习','从原作者的项目出发，经历设计、实现、测试、优化与解释。每个实验都标明运行条件和实际验证程度。')+`
      <div class="filters"><select id="lab-stage" aria-label="实验阶段"><option value="all">全部阶段</option>${catalog.stages.map(s=>`<option value="${s.id}" ${stageFilter===String(s.id)?'selected':''}>${escape(s.title)}</option>`).join('')}</select></div>
      ${selected?details(node(selected)):''}<div class="grid lab-grid">${list.map(l=>`<article class="resource lab-card ${l.command?'lab-ready':''}"><div class="row"><span class="eyebrow">STAGE 0${l.stage}</span>${chip(l.integration==='reproduced'?'已复现':l.integration==='checked'?'本地检查可用':'待集成',Boolean(l.command))}</div><h2>${escape(l.title)}</h2><p>${escape(l.goal)}</p><p class="meta">${escape(source(l.source).author)}</p><div class="lab-hardware"><span class="section-label">运行条件</span><p>${escape(l.hardware)}</p></div>
        <div class="dependency">${l.nodes.map(id=>nodeButton(id,'quiet')).join('')}</div>
        ${l.command?`<div class="command-block"><span class="section-label">在项目目录中运行</span><code>${escape(l.command)}</code></div><div class="actions">${link(l.guide,'阅读实验指南','button-link primary')}${link(l.url,'原作者项目')}</div>`:`<p>${link(l.url,'查看原课程项目','text-link')}</p>`}
        ${labResults(l)}${reportRecord(l)}<details class="resource-details"><summary>验收标准与集成状态</summary><p>${escape(l.status)}</p><ol class="rubric">${l.rubric.map(r=>`<li>${escape(r)}</li>`).join('')}</ol><p>${escape(l.limitation)}</p></details></article>`).join('')}</div>`;
  }

  function about() {
    return intro('STANDING ON THE SHOULDERS OF GIANTS','来源透明，研究持续开放','连接世界上已有的优秀成果，并持续检查它们能否组成可学习、可实践的路径。')+`
      <div class="research-grid"><section class="panel"><span class="eyebrow">EVIDENCE</span><h2>哪些已经验证</h2><p>已记录 ${catalog.sources.length} 项来源、${catalog.nodes.length} 个知识节点的学习步骤，以及对象模型、数据库、自动微分与共识的固定版本测试结果；真实 GPU 已完成四项补充检查。</p><p>参考项目复现、平台测试与学习者能力验收，是不同的证据。</p>${link('./docs/release-complete.md','阅读完整验收报告','text-link')}</section>
      <section class="panel"><span class="eyebrow">OPEN QUESTIONS</span><h2>哪些仍需验证</h2><p>依赖划分和选章需要真实学习者持续试用；多卡、原课程高级作业与工业服务实验仍需合适环境。高级候选项目不会被标记成已完成集成。</p>${link('./docs/research.md','研究依据与覆盖审计','text-link')}</section></div>
      <section class="panel"><h2>归功于原作者</h2><p>课程、教材与文档以原始链接为主。四个精选项目复用了许可明确的 MIT 代码与原测试，并保留作者、固定提交和许可。本站原创内容使用 MIT 许可证，不能覆盖第三方权利。</p><div class="document-links">${link('./CREDITS.md','来源与致谢')}${link('./LICENSE','本站许可证')}${link('./docs/extensions.md','资源扩展规范')}${link('./docs/glossary.md','中英术语表')}</div></section>
      <section class="panel"><h2>学习记录由你掌握</h2><p>进度保存在浏览器，本标签页的草稿可以在刷新后恢复；导出备份时也会包含草稿。换设备或清理浏览器前请备份。记录不会上传服务器。</p><div class="document-links">${link('./docs/getting-started.md','从零开始使用')}${link('./docs/architecture.md','架构与工具选择')}${link('./docs/maintenance.md','维护与恢复指南')}${link('./docs/requirements-audit.md','提示词逐项验收')}${link('./docs/curriculum.md','选章与复核任务')}${link('./docs/advanced-labs.md','高级原课实验')}</div></section>`;
  }
  return {learn:learning,map,resources,labs,about,milestone};
}
