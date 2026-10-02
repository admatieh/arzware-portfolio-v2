import './styles.css';

const root=document.documentElement;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let preference=null;
try{preference=localStorage.getItem('arzware-motion')}catch{}
let enabled=preference===null?!motionQuery.matches:preference==='on';
const motionButton=document.querySelector('#motion-toggle');
let frame=null,visible=true;
function updateMotion(){
  root.classList.toggle('motion-off',!enabled);
  motionButton.setAttribute('aria-pressed',String(!enabled));
  motionButton.querySelector('span').textContent=enabled?'on':'off';
  if(!enabled){
    if(frame!==null){cancelAnimationFrame(frame);frame=null}
    document.querySelectorAll('[data-artifact]').forEach(el=>{el.style.setProperty('--drift-x','0px');el.style.setProperty('--drift-y','0px')});
  }
}
motionButton.addEventListener('click',()=>{
  enabled=!enabled;preference=enabled?'on':'off';
  try{localStorage.setItem('arzware-motion',preference)}catch{}
  updateMotion();
});
motionQuery.addEventListener('change',()=>{if(preference===null){enabled=!motionQuery.matches;updateMotion()}});
updateMotion();
if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  },{threshold:.07,rootMargin:'0px 0px -18px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));root.classList.add('enhanced');
  if(location.hash){const target=document.getElementById(location.hash.slice(1));target?.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'))}
}
const toggle=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-nav'),mobile=matchMedia('(max-width: 850px)');
function closeMenu(restore=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');if(restore)toggle.focus()}
toggle.addEventListener('click',()=>{
  if(toggle.getAttribute('aria-expanded')==='true')return closeMenu(true);
  menu.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');menu.querySelector('a').focus();
});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
mobile.addEventListener('change',()=>{if(!mobile.matches)closeMenu()});
document.addEventListener('keydown',event=>{
  if(toggle.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){event.preventDefault();closeMenu(true)}
  if(event.key==='Tab'){
    const items=[toggle,...menu.querySelectorAll('a')],first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});
// Tiny pointer drift is confined to the visible hero. Touch scrolling remains native.
const hero=document.querySelector('.hero'),art=hero?.querySelector('[data-artifact]'),fine=matchMedia('(pointer: fine)');
function resetDrift(){art?.style.setProperty('--drift-x','0px');art?.style.setProperty('--drift-y','0px')}
hero?.addEventListener('pointermove',event=>{
  if(!enabled||!fine.matches||!visible||frame!==null)return;
  const rect=hero.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
  frame=requestAnimationFrame(()=>{frame=null;art.style.setProperty('--drift-x',`${x*9}px`);art.style.setProperty('--drift-y',`${y*7}px`)});
},{passive:true});
hero?.addEventListener('pointerleave',resetDrift);
if(hero&&'IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;hero.classList.toggle('art-paused',!visible)},{threshold:0}).observe(hero);
document.addEventListener('visibilitychange',()=>root.classList.toggle('page-hidden',document.hidden));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
