import {marked} from './vendor/marked/marked.esm.js';
import DOMPurify from './vendor/dompurify/purify.es.mjs';

export const allowedDocuments=new Set(['README.md','CREDITS.md','CONTRIBUTING.md','LICENSE','SECURITY.md',
 'docs/index.md','docs/faq.md','docs/maintainer-tutorial.md','docs/path-evidence.md','docs/coverage.md','docs/learning-paths.md','docs/file-audit.md',
 'docs/getting-started.md','docs/glossary.md','docs/research.md','docs/architecture.md','docs/extensions.md','docs/acceptance.md','docs/writing-guide.md','docs/delivery-checklist.md',
 'docs/maintenance.md','docs/verification.md','docs/optimization-review.md','docs/release-v02.md','docs/requirements-audit.md',
 'docs/object-model-lab.md','docs/dbdb-lab.md','docs/consensus-lab.md','docs/micrograd-lab.md','docs/gpu-lab.md','docs/gpu-validation-plan.md','docs/advanced-labs.md','docs/project-workflows.md','docs/usability-audit.md','docs/curriculum.md','docs/release-complete.md']);

export function headingSlugger(){
 const used=new Set();
 return text=>{
  const base=text.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').replace(/\s/g,'-')||'section';
  let slug=base,index=0;while(used.has(slug))slug=base+'-'+ ++index;
  used.add(slug);return slug;
 };
}

export function focusSection(heading){
 heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({behavior:'auto'});
}

export function renderDocument(markdown,path){
 if(!DOMPurify.isSupported)throw Error('当前浏览器不支持安全文档阅读，请更新浏览器后重试。');
 const article=document.createElement('article');article.className='document-body';
 article.innerHTML=DOMPurify.sanitize(marked.parse(markdown,{gfm:true}),{USE_PROFILES:{html:true},FORBID_TAGS:['img','style','form','input','button','iframe'],FORBID_ATTR:['style']});
 const base=new URL(path,new URL('.',location.href));
 for(const anchor of article.querySelectorAll('a')){
  try{
   const url=new URL(anchor.getAttribute('href'),base);
   if(url.origin===location.origin){
    const prefix=new URL('.',location.href).pathname;
    const target=url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):'';
    if(allowedDocuments.has(target)){anchor.href='#read/'+target+url.hash;anchor.removeAttribute('target');}
    else{anchor.replaceWith(document.createTextNode(anchor.textContent));}
   }else if(url.protocol==='https:'){
    anchor.href=url.href;anchor.target='_blank';anchor.rel='noopener noreferrer';
   }else anchor.replaceWith(document.createTextNode(anchor.textContent));
  }catch{anchor.replaceWith(document.createTextNode(anchor.textContent));}
 }
 for(const table of article.querySelectorAll('table')){const wrap=document.createElement('div');wrap.className='table-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',table.querySelector('caption')?.textContent||'可横向滚动的数据表');table.before(wrap);wrap.append(table);}
 for(const pre of article.querySelectorAll('pre')){
  const code=pre.querySelector('code');if(!code)continue;
  const block=document.createElement('div');block.className='code-block';
  const tools=document.createElement('div');tools.className='code-tools';
  const language=document.createElement('span');language.textContent=code.className.match(/language-([\w+-]+)/)?.[1]||'代码';
  const copy=document.createElement('button');copy.type='button';copy.className='copy-button';copy.dataset.copy='';copy.textContent='复制';copy.setAttribute('aria-label','复制代码');
  tools.append(language,copy);pre.before(block);block.append(tools,pre);
 }
 const outline=document.createElement('details');outline.className='document-outline';outline.open=matchMedia('(min-width:1101px)').matches;
 const summary=document.createElement('summary');summary.textContent='本页目录';outline.append(summary);
 const links=document.createElement('nav');links.className='outline-links';links.setAttribute('aria-label','文档目录');outline.append(links);
 const slug=headingSlugger(),sections=new Map();
 for(const heading of article.querySelectorAll('h1,h2,h3,h4,h5,h6')){
  const id=slug(heading.textContent);heading.id='document-'+id;sections.set(id,heading);
  if(heading.tagName!=='H2')continue;
  const button=document.createElement('button');button.className='link-button';button.textContent=heading.textContent;
  button.addEventListener('click',()=>{history.replaceState(null,'','#read/'+path+'#'+encodeURIComponent(id));focusSection(heading);});links.append(button);
 }
 if(!links.childElementCount)outline.hidden=true;
 return {article,outline,sections,title:article.querySelector('h1')?.textContent||path};
}

export async function loadDocument(route,signal){
 const [path,fragment]=route.split('#',2);
 if(!allowedDocuments.has(path))throw Error('没有这个站内文档。');
 const response=await fetch('./'+path,{signal});if(!response.ok)throw Error('文档暂时不可用。');
 const result=renderDocument(await response.text(),path);
 let section='';try{section=decodeURIComponent(fragment||'');}catch{throw Error('章节地址的编码无效。');}
 return {...result,section,sectionMissing:Boolean(section&&!result.sections.has(section))};
}
