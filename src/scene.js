import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** A bespoke three-axis bronze sculpture. No model downloads or background video. */
export function createSculpture(container, { motionEnabled = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    container.dataset.renderMode = 'fallback';
    return;
  }
  container.appendChild(canvas);
  renderer.setClearColor(0x0e0e0e, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 801 ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, .2, 8.7);
  camera.lookAt(0, 0, 0);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .06);
  scene.environment = environmentMap.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xc4a882, .4));
  const warmLight = new THREE.DirectionalLight(0xffebce, 4);
  warmLight.position.set(-3, 5, 4);
  scene.add(warmLight);
  const coolLight = new THREE.DirectionalLight(0x7eb8e0, 2.2);
  coolLight.position.set(4, -1, -2);
  scene.add(coolLight);

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  sculpture.rotation.set(.35, -.42, -.28);
  const bronze = new THREE.MeshStandardMaterial({ color: 0xc4a882, metalness: .94, roughness: .24, envMapIntensity: 1.25 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xa8784a, metalness: .93, roughness: .28, envMapIntensity: 1.1 });
  const paleMetal = new THREE.MeshStandardMaterial({ color: 0xe8e4de, metalness: .88, roughness: .26, envMapIntensity: 1.1 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x4d4031, metalness: .9, roughness: .3 });

  // Incomplete arcs leave space for each axis to pass through the next.
  // Offset bevel rims and inset grooves give the object a manufactured character.
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Group();
    const geometry = new THREE.TorusGeometry(1.37, .235, 20, 112, Math.PI * 1.82);
    const body = new THREE.Mesh(geometry, [bronze, copper, paleMetal][i]);
    ring.add(body);
    for (const side of [-1, 1]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.37, .027, 6, 100, Math.PI * 1.82), bronze);
      rim.position.z = side * .227;
      ring.add(rim);
    }
    const groove = new THREE.Mesh(new THREE.TorusGeometry(1.598, .012, 5, 100, Math.PI * 1.82), darkMetal);
    ring.add(groove);
    // Round terminal caps match the arc tube and avoid exposed mesh ends.
    const capGeometry = new THREE.SphereGeometry(.235, 16, 12);
    for (const angle of [0, Math.PI * 1.82]) {
      const cap = new THREE.Mesh(capGeometry, [bronze, copper, paleMetal][i]);
      cap.position.set(Math.cos(angle) * 1.37, Math.sin(angle) * 1.37, 0);
      ring.add(cap);
    }
    ring.rotation.z = i * Math.PI * 2 / 3 + .24;
    if (i === 1) ring.rotation.x = Math.PI / 2;
    if (i === 2) ring.rotation.y = Math.PI / 2;
    sculpture.add(ring);
    rings.push(ring);
  }
  const core = new THREE.Mesh(new RoundedBoxGeometry(.72, .72, .72, 3, .1), bronze);
  core.rotation.set(.5, .5, .4);
  sculpture.add(core);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.09, .004, 4, 160), new THREE.MeshBasicMaterial({ color: 0x8b7355, transparent: true, opacity: .55 }));
  halo.rotation.set(.8, .3, .15);
  scene.add(halo);

  // A soft generated shadow keeps the artifact grounded without costly shadow maps.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,.65)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.5), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .7 }));
  shadow.position.set(0, -2.04, -.3);
  shadow.rotation.x = -.9;
  scene.add(shadow);

  let visible = true;
  let paused = !motionEnabled;
  let lost = false;
  let disposed = false;
  let frame = null;
  let lastFrame = 0;
  let activeTime = 0;
  let previousTime = 0;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  const finePointer = window.matchMedia('(pointer: fine)');
  function draw() {
    if (!disposed && !lost) renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (width <= 0 || height <= 0 || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 500 ? 9.5 : 8.7;
    camera.updateProjectionMatrix();
    draw();
  }
  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden || lost || disposed) { previousTime = 0; return; }
    if (now - lastFrame >= 1000 / 30) {
      if (previousTime) activeTime += Math.min((now - previousTime) / 1000, .1);
      previousTime = now;
      lastFrame = now;
      currentX += (pointerX - currentX) * .06;
      currentY += (pointerY - currentY) * .06;
      sculpture.rotation.y = -.42 + activeTime * .085 + currentX * .2;
      sculpture.rotation.x = .35 + Math.sin(activeTime * .2) * .08 + currentY * .11;
      sculpture.position.y = Math.sin(activeTime * .55) * .055;
      core.rotation.y = .5 - activeTime * .13;
      halo.rotation.z = .15 + activeTime * .017;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = 0;
    if (!paused && visible && !document.hidden && !lost && !disposed) frame = requestAnimationFrame(tick);
    else if (visible && !document.hidden && !lost) draw();
  }
  function onPointer(event) {
    if (!finePointer.matches || paused || !visible) return;
    pointerX = (event.clientX / window.innerWidth - .5) * 2;
    pointerY = (event.clientY / window.innerHeight - .5) * 2;
  }
  function onMotion(event) { paused = !event.detail.enabled; sync(); }
  function onVisibility() { sync(); }
  function onContextLost(event) {
    event.preventDefault(); lost = true; container.classList.remove('is-ready');
    container.dataset.renderMode = 'fallback'; sync();
  }
  function onContextRestored() {
    lost = false; resize(); container.classList.add('is-ready'); container.dataset.renderMode = 'webgl'; sync();
  }
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('arzware:motion', onMotion);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '50px' });
  visibilityObserver.observe(container);
  resize();
  container.classList.add('is-ready');
  container.dataset.renderMode = 'webgl';
  sync();

  // Restores smoothly after browser back/forward cache; cleans resources on real exit.
  function dispose(event) {
    if (event.persisted) return;
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('arzware:motion', onMotion);
    document.removeEventListener('visibilitychange', onVisibility);
    const materials = new Set();
    scene.traverse(object => {
      object.geometry?.dispose();
      if (object.material) materials.add(object.material);
    });
    materials.forEach(material => material.dispose());
    environmentMap.dispose(); shadowTexture.dispose(); renderer.dispose();
  }
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', dispose);
  return { dispose, resize };
}
