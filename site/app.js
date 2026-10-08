import {createViews} from './views.js';
import {STORAGE_KEY,MAX_BACKUP_BYTES,emptyProgress,validateProgress,mergeProgress,nextNode,record,backupWithDrafts} from './core.js';
import {persistProgressLocked,readDrafts,writeDrafts} from './storage.js';
const main=document.querySelector('main');
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView();});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let catalog,progress,selected,filter='',stageFilter='all',langFilter='all';
const drafts=new Map();
const completed=()=>catalog.nodes.filter(n=>progress.records[n.id]?.status==='submitted').length;
let timer;function notify(message){const n=document.querySelector('#notice');n.textContent=message;n.hidden=false;clearTimeout(timer);timer=setTimeout(()=>n.hidden=true,6500);}
function storageWarning(message=''){
  const warning=document.querySelector('#storage-warning');
  warning.textContent=message;warning.hidden=!message;
}
async function save(next,options){
  try{progress=await persistProgressLocked(localStorage,next,catalog.nodes,options);storageWarning();return true;}
  catch(error){
    progress=next;
    storageWarning(`尚未保存到浏览器：${error.message} 当前记录仅在本页，请备份后再关闭。`);
    return false;
  }
}
const labels={learn:'我的学习',map:'知识依赖图',resources:'精选资源',labs:'工程实验',about:'来源与研究'};
function render(){const views=createViews({catalog,progress,selected,filter,stageFilter,langFilter,drafts});const view=location.hash.slice(1).split('/')[0]||'learn';const key=Object.hasOwn(views,view)?view:'learn';main.innerHTML=views[key]();document.querySelector('#view-label').textContent=labels[key];document.querySelectorAll('nav a').forEach(a=>{a.classList.toggle('active',a.dataset.view===key);if(a.dataset.view===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const area=document.querySelector('#evidence');
  if(area){const hint=document.createElement('p');hint.id='draft-hint';hint.className='muted';area.after(hint);updateDraftHint();}
}
function updateDraftHint(){
  const hint=document.querySelector('#draft-hint');
  if(hint)hint.textContent=drafts.has(selected)?'尚未提交的草稿会在本标签页刷新后恢复；备份时作为学习中记录保存。':'编辑后可先保存为学习中，完成验收后再提交成果。';
}
function persistDrafts(){try{writeDrafts(sessionStorage,drafts);}catch{notify('当前浏览器无法暂存草稿，请立即保存或备份后再离开。');}}
function focusDetail(){const detail=document.querySelector('#node-detail');detail?.setAttribute('tabindex','-1');detail?.focus({preventScroll:true});detail?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function readRoute(){const [view,id]=location.hash.slice(1).split('/');selected=['learn','map','labs'].includes(view)&&catalog.nodes.some(n=>n.id===id)?id:null;}
main.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.retry){location.reload();return;}
  if(b.dataset.node){selected=b.dataset.node;const requested=location.hash.slice(1).split('/')[0];const view=['learn','map','labs'].includes(requested)?requested:'learn';const hash=`#${view}/${selected}`;if(location.hash===hash){render();focusDetail();}else location.hash=hash;}
  else if(b.dataset.start||b.dataset.submit){
    const id=b.dataset.start||b.dataset.submit,evidence=document.querySelector('#evidence').value;
    try{
      b.disabled=true;
      const saved=await save(record(progress,id,b.dataset.submit?'submitted':'started',evidence,catalog.nodes));
      if(saved){drafts.delete(id);persistDrafts();}
      render();notify(saved?(b.dataset.submit?'成果记录已保存（本人提交，未独立认证）。':'学习状态已保存。'):'保存未成功，请查看页面上方提示并备份当前记录。');
    }catch(error){b.disabled=false;notify(error.message);}
  }
});
function searchResources(input){
  const pos=input.selectionStart;filter=input.value;render();
  const next=document.querySelector('#search');next.focus();next.setSelectionRange(pos,pos);
}
main.addEventListener('input',e=>{
  if(e.target.id==='evidence'&&selected){
    if(e.target.value===(progress.records[selected]?.evidence||''))drafts.delete(selected);
    else drafts.set(selected,e.target.value);
    persistDrafts();
    updateDraftHint();
  }
  if(e.target.id==='search'&&!e.isComposing)searchResources(e.target);
});
main.addEventListener('compositionend',e=>{if(e.target.id==='search')searchResources(e.target);});
main.addEventListener('change',e=>{if(e.target.id==='language'){langFilter=e.target.value;render();}if(e.target.id==='lab-stage'){stageFilter=e.target.value;render();}});
window.addEventListener('hashchange',()=>{if(!catalog)return;readRoute();render();if(selected)focusDetail();else window.scrollTo(0,0);});
window.addEventListener('beforeunload',e=>{
  if(drafts.size||!document.querySelector('#storage-warning').hidden){e.preventDefault();e.returnValue='';}
});
window.addEventListener('storage',e=>{
  if(e.key!==STORAGE_KEY||!e.newValue||!catalog)return;
  try{
    const merged=mergeProgress(progress,JSON.parse(e.newValue),catalog.nodes);
    if(JSON.stringify(merged.records)===JSON.stringify(progress.records))return;
    progress=merged;
    // Preserve the active textarea and IME composition; the next navigation renders merged state.
    if(!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))render();
    notify('已同步其他标签页的学习记录。当前未保存的说明会保留。');
  }catch{storageWarning('其他标签页写入了无法读取的记录；本页进度仍保留，请先备份。');}
});
document.querySelector('#export').addEventListener('click',()=>{if(!progress)return;const url=URL.createObjectURL(new Blob([JSON.stringify(backupWithDrafts(progress,drafts,catalog.nodes),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ai-infra-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('备份已生成；未提交草稿在备份中记为学习中。');});
document.querySelector('#import').addEventListener('click',()=>document.querySelector('#backup-file').click());
document.querySelector('#backup-file').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f||!catalog)return;
  try{
    if(f.size>MAX_BACKUP_BYTES)throw new Error('备份超过 2 MB 限制。');
    const incoming=validateProgress(JSON.parse(await f.text()),catalog.nodes);
    const saved=await save(mergeProgress(progress,incoming,catalog.nodes),{restore:true});
    render();notify(saved?'备份已合并恢复，同一节点保留较新记录。':'备份已读入本页，但尚未保存到浏览器，请保留原备份。');
  }catch(error){notify(`恢复失败：${error.message}`);}finally{e.target.value='';}
});
try{const response=await fetch('catalog.json');if(!response.ok)throw new Error('无法读取资源目录');catalog=await response.json();progress=emptyProgress();try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)progress=validateProgress(JSON.parse(raw),catalog.nodes);}catch{storageWarning('无法读取已有记录，原数据尚未覆盖。请检查浏览器存储或使用恢复备份。');}try{for(const [id,text]of readDrafts(sessionStorage,catalog.nodes))drafts.set(id,text);}catch{notify('暂存草稿无法读取，已保存的学习进度不受影响。');}readRoute();render();
 if(document.modelContext?.registerTool){Promise.resolve(document.modelContext.registerTool({name:'get_learning_plan',title:'查看下一项学习任务',description:'只读当前本地进度与下一项建议，不标记完成。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('只接受空对象');const n=nextNode(catalog.nodes,progress);return {submitted:completed(),total:catalog.nodes.length,next:n?{id:n.id,title:n.title,objective:n.objective}:null};}})).catch(()=>{});}
}catch(error){main.innerHTML=`<section class="panel"><h1>暂时无法加载学习路径</h1><p>${escape(error.message)}。请通过 start.cmd 或 npm start 启动后访问本地网址，直接双击 HTML 不支持资源读取。</p><button data-retry="true">重新加载</button></section>`;}
