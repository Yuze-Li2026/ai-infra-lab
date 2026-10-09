import {marked} from './vendor/marked/marked.esm.js';
import DOMPurify from './vendor/dompurify/purify.es.mjs';

export const allowedDocuments=new Set(['README.md','CREDITS.md','CONTRIBUTING.md','LICENSE',
 'docs/getting-started.md','docs/glossary.md','docs/research.md','docs/architecture.md','docs/extensions.md','docs/acceptance.md',
 'docs/maintenance.md','docs/verification.md','docs/optimization-review.md','docs/release-v02.md','docs/requirements-audit.md',
 'docs/object-model-lab.md','docs/dbdb-lab.md','docs/consensus-lab.md','docs/micrograd-lab.md','docs/gpu-lab.md','docs/gpu-validation-plan.md','docs/advanced-labs.md','docs/curriculum.md','docs/release-complete.md']);

export function renderDocument(markdown,path){
 const article=document.createElement('article');article.className='document-body';
 article.innerHTML=DOMPurify.sanitize(marked.parse(markdown,{gfm:true}),{USE_PROFILES:{html:true},FORBID_TAGS:['img','style','form','input','button','iframe'],FORBID_ATTR:['style']});
 const base=new URL(path,new URL('.',location.href));
 for(const anchor of article.querySelectorAll('a')){
  try{
   const url=new URL(anchor.getAttribute('href'),base);
   if(url.origin===location.origin){
    const prefix=new URL('.',location.href).pathname;
    const target=url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):'';
    if(allowedDocuments.has(target)){anchor.href='#read/'+target;anchor.removeAttribute('target');}
    else{anchor.replaceWith(document.createTextNode(anchor.textContent));}
   }else if(url.protocol==='https:'){
    anchor.href=url.href;anchor.target='_blank';anchor.rel='noopener noreferrer';
   }else anchor.replaceWith(document.createTextNode(anchor.textContent));
  }catch{anchor.replaceWith(document.createTextNode(anchor.textContent));}
 }
 for(const table of article.querySelectorAll('table')){const wrap=document.createElement('div');wrap.className='table-wrap';table.before(wrap);wrap.append(table);}
 const outline=document.createElement('nav');outline.className='document-outline';outline.setAttribute('aria-label','文档目录');
 for(const [index,heading]of [...article.querySelectorAll('h2')].entries()){
  heading.id='document-section-'+index;
  const button=document.createElement('button');button.className='link-button';button.textContent=heading.textContent;
  button.addEventListener('click',()=>{heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({behavior:'auto'});});outline.append(button);
 }
 return {article,outline,title:article.querySelector('h1')?.textContent||path};
}

export async function loadDocument(path,signal){
 if(!allowedDocuments.has(path))throw Error('没有这个站内文档。');
 const response=await fetch('./'+path,{signal});if(!response.ok)throw Error('文档暂时不可用。');
 return renderDocument(await response.text(),path);
}
