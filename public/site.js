function layout(){document.querySelectorAll('gallery-freeform').forEach(g=>{let bottom=0;g.querySelectorAll('figure').forEach(f=>{bottom=Math.max(bottom,Number(f.style.getPropertyValue('--y'))/100*g.clientWidth+f.offsetHeight)});g.style.height=bottom+'px'})}
new ResizeObserver(layout).observe(document.body);window.addEventListener('load',layout);document.querySelectorAll('img').forEach(i=>i.addEventListener('load',layout));
const dialog=document.querySelector('#lightbox');let opener;
function reportLightbox(open){if(window.parent!==window)window.parent.postMessage({type:'archive-lightbox',open},location.origin)}
document.addEventListener('click',e=>{const b=e.target.closest('.zoom');if(!b)return;opener=b;const source=b.querySelector('img');const image=dialog.querySelector('img');image.src=source.src;image.alt=source.alt;dialog.showModal();reportLightbox(true)});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>{reportLightbox(false);opener?.focus()});

// Display each project in its own frame above the archive.
if(document.querySelector('[data-page="main"]')){
 const modal=document.createElement('dialog');modal.className='project-overlay';modal.setAttribute('aria-label','Project details');
 modal.innerHTML='<button class="project-close" aria-label="Close project">×</button><iframe title="Project details"></iframe>';
 document.body.append(modal);const frame=modal.querySelector('iframe');
 const routes=['/raw-po','/listen-to-the-force','/the-road-1','/chroma-wheel','/earlier-works','/bio'];
 let frozen=[],trigger,overflow='',homeTitle=document.title;
 function freeze(){
  document.querySelectorAll('img[src]').forEach(img=>{if(!/\.gif(?:\?|$)/i.test(img.src)||!img.complete||!img.naturalWidth)return;
   try{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);const still=c.toDataURL();frozen.push([img,img.src]);img.src=still;}catch{}
  });
  document.querySelectorAll('iframe[src*="player.vimeo.com"]').forEach(f=>f.contentWindow.postMessage({method:'pause'},'https://player.vimeo.com'));
 }
 function openProject(path,a,push=true){
  trigger=a||trigger;
  if(!modal.open){freeze();overflow=document.body.style.overflow;document.body.style.overflow='hidden';modal.showModal();}
  if(push)history.pushState({archiveOverlay:true,path},'',`/?project=${encodeURIComponent(path.slice(1))}`);
  modal.querySelector('button').focus();
  frame.src=path;
  if(a&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const r=a.getBoundingClientRect(),b=modal.getBoundingClientRect();modal.animate([{transform:`translate(${r.x+r.width/2-b.x-b.width/2}px,${r.y+r.height/2-b.y-b.height/2}px) scale(.25)`,opacity:0},{transform:'none',opacity:1}],{duration:240,easing:'ease-out'});}
 }
 frame.addEventListener('load',()=>{modal.classList.remove('image-open');try{frame.contentDocument.documentElement.classList.add('embedded-project');document.title=frame.contentDocument.title;}catch{}});
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='archive-lightbox')return;modal.classList.toggle('image-open',event.data.open)});
 modal.addEventListener('close',()=>{frame.src='about:blank';frozen.forEach(([img,src])=>img.src=src);frozen=[];document.body.style.overflow=overflow;document.title=homeTitle;trigger?.focus({preventScroll:true});if(history.state?.archiveOverlay)history.replaceState(null,'','/');});
 modal.querySelector('button').addEventListener('click',()=>modal.close());
 modal.addEventListener('cancel',e=>{e.preventDefault();modal.close()});
 window.addEventListener('popstate',()=>{if(history.state?.archiveOverlay)openProject(history.state.path,null,false);else if(modal.open)modal.close()});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('data-full-page'))return;
  const url=new URL(a.href);if(url.origin!==location.origin)return;const path=url.pathname.replace(/\/$/,'')||'/';
  if(modal.contains(a)&&(path==='/'||path==='/main')){e.preventDefault();modal.close();return;}
  if(!routes.includes(path))return;e.preventDefault();openProject(path,a);
 });
 const requestedProject=new URLSearchParams(location.search).get('project');const requestedPath=requestedProject&&'/'+requestedProject;
 if(routes.includes(requestedPath))openProject(requestedPath,null,false);
}else if(window.top===window){
 const project=location.pathname.replace(/^\/+|\/+$/g,'');
 if(project&&project!=='main')location.replace(`/?project=${encodeURIComponent(project)}`);
}
