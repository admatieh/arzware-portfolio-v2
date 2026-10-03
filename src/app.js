import './hero.css';
import './styles.css';

const root=document.documentElement;
root.classList.add('rev-interactive');
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let preference=null;
try{preference=localStorage.getItem('arzware-motion')}catch{}
let motionEnabled=preference===null?!motionQuery.matches:preference==='on';
const motionButton=document.querySelector('#motion-toggle');
let blurFrame=null,scrollFrame=null;
let heroVisible=true;
const blurLayer=document.querySelector('.layer-blur');
const container=document.querySelector('#three-container');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
let mouseX=innerWidth/2,mouseY=innerHeight/2,smoothX=mouseX,smoothY=mouseY;

function updateMotion(){
  window.__arzwareMotionEnabled=motionEnabled;
  root.classList.toggle('rev-motion-off',!motionEnabled);
  motionButton?.setAttribute('aria-pressed',String(!motionEnabled));
  if(motionButton)motionButton.querySelector('span').textContent=motionEnabled?'on':'off';
  window.dispatchEvent(new CustomEvent('arzware:motion',{detail:{reduced:!motionEnabled}}));
  updateBlurLifecycle();
}
motionButton?.addEventListener('click',()=>{
  motionEnabled=!motionEnabled;preference=motionEnabled?'on':'off';
  try{localStorage.setItem('arzware-motion',preference)}catch{}
  updateMotion();
});
motionQuery.addEventListener('change',()=>{if(preference===null){motionEnabled=!motionQuery.matches;updateMotion()}});

function animateBlur(){
  blurFrame=null;
  if(!motionEnabled||!heroVisible||document.hidden||!fine.matches||!blurLayer||innerWidth<=768)return;
  smoothX+=(mouseX-smoothX)*.1;smoothY+=(mouseY-smoothY)*.1;
  blurLayer.style.setProperty('--x',`${(smoothX/innerWidth*100).toFixed(1)}%`);
  blurLayer.style.setProperty('--y',`${(smoothY/innerHeight*100).toFixed(1)}%`);
  if(Math.abs(mouseX-smoothX)>.2||Math.abs(mouseY-smoothY)>.2)blurFrame=requestAnimationFrame(animateBlur);
}
function updateBlurLifecycle(){
  if(blurFrame!==null){cancelAnimationFrame(blurFrame);blurFrame=null}
  if(motionEnabled&&heroVisible&&!document.hidden&&fine.matches&&innerWidth>768&&blurLayer)blurFrame=requestAnimationFrame(animateBlur);
}
document.addEventListener('pointermove',event=>{if(!fine.matches)return;mouseX=event.clientX;mouseY=event.clientY;if(blurFrame===null)updateBlurLifecycle()},{passive:true});

function fadeHero(){
  scrollFrame=null;if(!container)return;
  const progress=Math.min(Math.max((scrollY-innerHeight*.18)/(innerHeight*.54),0),1);
  window.__heroVisualOpacity=1-progress;
  container.style.opacity=(1-progress).toFixed(3);
  container.style.pointerEvents='none';
}
window.addEventListener('scroll',()=>{if(scrollFrame===null)scrollFrame=requestAnimationFrame(fadeHero)},{passive:true});
window.addEventListener('resize',()=>{fadeHero();updateBlurLifecycle()},{passive:true});
document.addEventListener('visibilitychange',()=>{root.classList.toggle('rev-page-hidden',document.hidden);updateBlurLifecycle()});
if(container&&'IntersectionObserver'in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;updateBlurLifecycle()},{threshold:.01}).observe(document.querySelector('#hero'));
updateMotion();fadeHero();

// Original Three.js geometry and shaders are isolated from the page interactions.
if(container){
  const mode=new URLSearchParams(location.search).get('art')==='playa'?'playa':'original';
  root.dataset.art=mode;
  if(mode==='playa'){
    const map=document.querySelector('.rev-radial-map')?.cloneNode(true);
    if(map){map.querySelector('.rev-map-type')?.remove();container.querySelector('.rev-hero-fallback')?.replaceChildren(map)}
  }
  import('./hero-scene.js').then(({initHero})=>initHero(mode)).then(()=>{
    root.classList.add('hero-ready');container.dataset.renderer='ready';
  }).catch(error=>{
    container.dataset.renderer='fallback';
    console.warn('The static hero is available because WebGL could not start.',error.message);
  });
}

// Supporting content stays visible when JavaScript is unavailable.
if('IntersectionObserver'in window){
  const reveal=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target)}
  },{threshold:.06,rootMargin:'0px 0px -12px 0px'});
  document.querySelectorAll('.rev-reveal').forEach(el=>reveal.observe(el));root.classList.add('rev-enhanced');
}

const menuToggle=document.querySelector('.menu-toggle'),menu=document.querySelector('#site-menu');
function closeMenu(restore=false){
  menu?.classList.remove('is-open');document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded','false');menuToggle?.setAttribute('aria-label','Toggle menu');
  if(restore)menuToggle?.focus();
}
menuToggle?.addEventListener('click',()=>{
  if(menuToggle.getAttribute('aria-expanded')==='true')return closeMenu(true);
  menu?.classList.add('is-open');document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded','true');menuToggle.setAttribute('aria-label','Close navigation menu');
  menu?.querySelector('a')?.focus();
});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',event=>{
  if(menuToggle?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){event.preventDefault();closeMenu(true)}
  if(event.key==='Tab'){
    const items=[...menu.querySelectorAll('a'),menuToggle],first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});
window.addEventListener('resize',()=>{if(innerWidth>768&&menuToggle?.getAttribute('aria-expanded')==='true')closeMenu()},{passive:true});

const friction={inquiries:{tags:['Inquiry','Context','Next step','Follow-up'],title:'A conversation that keeps its context.',copy:'Connect the first inquiry, the customer’s details, and the next action. Give the follow-up somewhere to live.'},operations:{tags:['Customers','People','Information','Tasks'],title:'One clearer picture of the working day.',copy:'Bring records, tasks, and status into a shared view. Make the next action easier to see and the right information easier to find.'},routine:{tags:['Trigger','Routine','Review','Ready'],title:'A routine that remembers itself.',copy:'Give repeatable tasks a considered workflow. People review the important parts and keep the final judgment.'}};
const frictionVisual=document.querySelector('.rev-friction-visual');
document.querySelectorAll('[data-friction]').forEach(button=>button.addEventListener('click',()=>{
  const state=friction[button.dataset.friction];if(!state)return;
  document.querySelectorAll('[data-friction]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('#friction-title').textContent=state.title;document.querySelector('#friction-copy').textContent=state.copy;
  document.querySelectorAll('[data-source]').forEach(tag=>tag.textContent=state.tags[Number(tag.dataset.source)]);
  frictionVisual?.classList.remove('is-changing');requestAnimationFrame(()=>frictionVisual?.classList.add('is-changing'));
}));

const tabs=[...document.querySelectorAll('[data-scenario]')];
function selectScenario(tab,focus=false){
  for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active}
  if(focus)tab.focus();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectScenario(tab));
  tab.addEventListener('keydown',event=>{
    let target=null;
    if(event.key==='ArrowRight')target=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')target=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')target=0;if(event.key==='End')target=tabs.length-1;
    if(target!==null){event.preventDefault();selectScenario(tabs[target],true)}
  });
});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
