import './styles.css';

// Content remains visible and links remain usable if enhancement fails.
const root = document.documentElement;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let explicitPreference = null;
try { explicitPreference = localStorage.getItem('arzware-motion'); } catch { /* Storage may be disabled. */ }
let motionEnabled = explicitPreference === null ? !motionQuery.matches : explicitPreference === 'on';
const motionButton = document.querySelector('#motion-toggle');

function applyMotion() {
  root.classList.toggle('motion-off', !motionEnabled);
  motionButton.setAttribute('aria-pressed', String(!motionEnabled));
  motionButton.setAttribute('aria-label', 'Pause decorative motion');
  motionButton.querySelector('span').textContent = motionEnabled ? 'on' : 'off';
  window.dispatchEvent(new CustomEvent('arzware:motion', { detail: { enabled: motionEnabled } }));
}
motionButton.addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  explicitPreference = motionEnabled ? 'on' : 'off';
  try { localStorage.setItem('arzware-motion', explicitPreference); } catch { /* Nonessential preference. */ }
  applyMotion();
});
motionQuery.addEventListener('change', () => {
  if (explicitPreference === null) {
    motionEnabled = !motionQuery.matches;
    applyMotion();
  }
});
applyMotion();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  root.classList.add('enhanced');
}

// Mobile navigation supports Escape, focus containment, and focus restoration.
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const navQuery = window.matchMedia('(max-width: 800px)');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') return closeMenu(true);
  mobileNav.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
  document.body.classList.add('menu-open');
  mobileNav.querySelector('a').focus();
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.getAttribute('href'));
  target?.setAttribute('tabindex', '-1');
  target?.focus({ preventScroll: true });
}));
navQuery.addEventListener('change', () => { if (!navQuery.matches) closeMenu(); });
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
  if (event.key === 'Tab') {
    const items = [menuButton, ...mobileNav.querySelectorAll('a')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

// Manual selection avoids rotating content while a visitor reads it.
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const tabList = document.querySelector('[role="tablist"]');
function updateTabOrientation() { tabList.setAttribute('aria-orientation', navQuery.matches ? 'horizontal' : 'vertical'); }
updateTabOrientation();
navQuery.addEventListener('change', updateTabOrientation);
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  for (const panel of panels) {
    const selected = panel.id === tab.getAttribute('aria-controls');
    panel.hidden = !selected;
    panel.classList.remove('is-entering');
    if (selected && motionEnabled) {
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
  }
  if (focus) tab.focus();
}
for (const tab of tabs) {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    const horizontal = tabList.getAttribute('aria-orientation') === 'horizontal';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previous = horizontal ? 'ArrowLeft' : 'ArrowUp';
    let index = tabs.indexOf(tab);
    if (event.key === next) index = (index + 1) % tabs.length;
    else if (event.key === previous) index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[index], true);
  });
}

document.querySelector('#year').textContent = String(new Date().getFullYear());

// The scene is an optional, lazy-loaded enhancement. It cannot block the page.
const artifact = document.querySelector('#artifact');
async function loadScene() {
  try {
    const { createSculpture } = await import('./scene.js');
    createSculpture(artifact, { motionEnabled });
  } catch (error) {
    artifact.dataset.renderMode = 'fallback';
    console.warn('Arzware: using the static sculpture.', error);
  }
}
if ('requestIdleCallback' in window) window.requestIdleCallback(loadScene, { timeout: 1500 });
else window.setTimeout(loadScene, 350);
