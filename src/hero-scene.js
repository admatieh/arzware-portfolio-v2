import * as THREE from 'three';
import { makePlayaShape } from './playa-shape.js';

export function initHero(mode='original'){


const container = document.getElementById('three-container');
const prefersReducedMotion = window.__arzwareMotionEnabled === false;
const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
window.__heroVisualOpacity = 1;
const morphNameEl = document.getElementById('morph-name');
const morphCounterEl = document.getElementById('morph-counter');
const dots = document.querySelectorAll('.dot-nav');

const renderer = new THREE.WebGLRenderer({
    antialias: !isMobileViewport,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileViewport ? 1.0 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = isMobileViewport ? 1.6 : 2.2;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);
scene.fog = new THREE.FogExp2(0x0e0e0e, 0.02);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

// Lights (consolidated for performance)
const ambient = new THREE.AmbientLight(0xffeedd, 3.5);
scene.add(ambient);

const keyLight = new THREE.PointLight(0xc4a882, 18, 50);
keyLight.position.set(3, 3, 4);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x4a6fa5, 10, 50);
fillLight.position.set(-4, -2, 3);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x8b7355, 12, 50);
rimLight.position.set(0, 2, -3);
scene.add(rimLight);

// === SHAPE DEFINITIONS ===
const PARTICLE_COUNT = isMobileViewport ? 6000 : 16000;
const shapes = [];
const shapeNames = ['Dodeca', 'Heart', 'Diamond', 'Helix'];

// Helper: sample points on geometry surface
const _triTmp = new THREE.Triangle();
function sampleGeometry(geometry, count) {
    const pos = new Float32Array(count * 3);
    const posAttr = geometry.attributes.position;
    const indexAttr = geometry.index;

    const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
    const areas = new Float32Array(triCount);
    const triCoords = new Float32Array(triCount * 9);
    let totalArea = 0;

    for (let i = 0; i < triCount; i++) {
        let a, b, c;
        if (indexAttr) {
            a = indexAttr.getX(i * 3);
            b = indexAttr.getX(i * 3 + 1);
            c = indexAttr.getX(i * 3 + 2);
        } else {
            a = i * 3; b = i * 3 + 1; c = i * 3 + 2;
        }
        vA.fromBufferAttribute(posAttr, a);
        vB.fromBufferAttribute(posAttr, b);
        vC.fromBufferAttribute(posAttr, c);
        _triTmp.set(vA, vB, vC);
        const area = _triTmp.getArea();
        areas[i] = area;
        totalArea += area;

        const idx = i * 9;
        triCoords[idx] = vA.x; triCoords[idx + 1] = vA.y; triCoords[idx + 2] = vA.z;
        triCoords[idx + 3] = vB.x; triCoords[idx + 4] = vB.y; triCoords[idx + 5] = vB.z;
        triCoords[idx + 6] = vC.x; triCoords[idx + 7] = vC.y; triCoords[idx + 8] = vC.z;
    }

    for (let i = 0; i < count; i++) {
        let r = Math.random() * totalArea;
        let triIdx = 0;
        for (let j = 0; j < triCount; j++) {
            r -= areas[j];
            if (r <= 0) { triIdx = j; break; }
        }
        const base = triIdx * 9;
        let u = Math.random(), v = Math.random();
        if (u + v > 1) { u = 1 - u; v = 1 - v; }
        const w = 1 - u - v;
        pos[i * 3]     = triCoords[base]     * w + triCoords[base + 3] * u + triCoords[base + 6] * v;
        pos[i * 3 + 1] = triCoords[base + 1] * w + triCoords[base + 4] * u + triCoords[base + 7] * v;
        pos[i * 3 + 2] = triCoords[base + 2] * w + triCoords[base + 5] * u + triCoords[base + 8] * v;
    }
    return pos;
}

// Shape 0: Dodecahedron
function makeSkull() {
    const geo = new THREE.DodecahedronGeometry(1.2, 1);
    const nonIdx = geo.index ? geo.toNonIndexed() : geo;
    const idxGeo = new THREE.BufferGeometry();
    idxGeo.setAttribute('position', nonIdx.attributes.position);
    const idxArr = [];
    for (let i = 0; i < nonIdx.attributes.position.count; i++) idxArr.push(i);
    idxGeo.setIndex(idxArr);
    return sampleGeometry(idxGeo, PARTICLE_COUNT);
}

// Shape 1: Heart
function makeHeart() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = Math.random() * Math.PI * 2;
        const s = Math.random() * Math.PI;
        const scatter = 0.03;
        // Heart parametric surface
        const x = 1.2 * Math.sin(t) * Math.sin(s);
        let y = 0.8 * Math.cos(s) + 0.4 * Math.cos(t) * Math.sin(s);
        const z = 1.0 * Math.sin(t) * Math.cos(s) * (1 + 0.3 * Math.sin(t));

        // Heart shape modifier
        const heartX = 16 * Math.pow(Math.sin(t), 3) / 16;
        const heartY = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
        const depth = Math.sin(s) * 0.5;

        pos[i * 3] = heartX + (Math.random() - 0.5) * scatter;
        pos[i * 3 + 1] = heartY + (Math.random() - 0.5) * scatter;
        pos[i * 3 + 2] = depth + (Math.random() - 0.5) * scatter;
    }
    return pos;
}

// Shape 2: Diamond / Gem (larger, centered, shifted up)
function makeDiamond() {
    const yOffset = 0.35;
    const topGeo = new THREE.ConeGeometry(1.4, 0.9, 8);
    topGeo.translate(0, 0.45 + yOffset, 0);
    const bottomGeo = new THREE.ConeGeometry(1.4, 2.0, 8);
    bottomGeo.rotateX(Math.PI);
    bottomGeo.translate(0, -1.0 + yOffset, 0);

    const topNonIdx = topGeo.index ? topGeo.toNonIndexed() : topGeo;
    const botNonIdx = bottomGeo.index ? bottomGeo.toNonIndexed() : bottomGeo;
    const topIdxGeo = new THREE.BufferGeometry();
    topIdxGeo.setAttribute('position', topNonIdx.attributes.position);
    const topIdx = []; for (let i = 0; i < topNonIdx.attributes.position.count; i++) topIdx.push(i);
    topIdxGeo.setIndex(topIdx);

    const botIdxGeo = new THREE.BufferGeometry();
    botIdxGeo.setAttribute('position', botNonIdx.attributes.position);
    const botIdx = []; for (let i = 0; i < botNonIdx.attributes.position.count; i++) botIdx.push(i);
    botIdxGeo.setIndex(botIdx);

    const topCount = Math.floor(PARTICLE_COUNT * 0.4);
    const botCount = PARTICLE_COUNT - topCount;
    const topPts = sampleGeometry(topIdxGeo, topCount);
    const botPts = sampleGeometry(botIdxGeo, botCount);

    const pos = new Float32Array(PARTICLE_COUNT * 3);
    pos.set(topPts);
    for (let i = 0; i < botCount * 3; i++) {
        pos[topCount * 3 + i] = botPts[i];
    }
    return pos;
}

// Shape 3: Double Helix
function makeHelix() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const helixCount = PARTICLE_COUNT / 2;
    for (let h = 0; h < 2; h++) {
        const offset = h * Math.PI;
        for (let i = 0; i < helixCount; i++) {
            const idx = (h * helixCount + i) * 3;
            const t = (i / helixCount) * Math.PI * 6 - Math.PI * 3;
            const r = 0.9;
            pos[idx] = r * Math.cos(t + offset) + (Math.random() - 0.5) * 0.04;
            pos[idx + 1] = t * 0.34 + (Math.random() - 0.5) * 0.04;
            pos[idx + 2] = r * Math.sin(t + offset) + (Math.random() - 0.5) * 0.04;

            // Add connecting rungs every so often
            if (i % 200 < 10 && h === 0) {
                const rungT = Math.floor(i / 200) * 200;
                const rungAngle = (rungT / helixCount) * Math.PI * 6 - Math.PI * 3;
                const frac = (i % 200) / 10;
                pos[idx] = r * Math.cos(rungAngle) * (1 - frac) + r * Math.cos(rungAngle + Math.PI) * frac;
                pos[idx + 1] = t * 0.34 + (Math.random() - 0.5) * 0.04;
                pos[idx + 2] = r * Math.sin(rungAngle) * (1 - frac) + r * Math.sin(rungAngle + Math.PI) * frac;
            }
        }
    }
    return pos;
}

if(mode === 'playa'){
  for(let i=0;i<4;i++)shapes.push(makePlayaShape(PARTICLE_COUNT,i));
}else{
  shapes.push(makeSkull());shapes.push(makeHeart());shapes.push(makeDiamond());shapes.push(makeHelix());
}

function getShapeBounds(pos) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i], y = pos[i + 1], z = pos[i + 2];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    return {
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        centerZ: (minZ + maxZ) / 2,
        maxAxis: Math.max(maxX - minX, maxY - minY, maxZ - minZ)
    };
}

function normalizeShapeToAxis(pos, targetAxis) {
    const bounds = getShapeBounds(pos);
    const scale = targetAxis / (bounds.maxAxis || targetAxis);
    for (let i = 0; i < pos.length; i += 3) {
        pos[i] = (pos[i] - bounds.centerX) * scale;
        pos[i + 1] = (pos[i + 1] - bounds.centerY) * scale;
        pos[i + 2] = (pos[i + 2] - bounds.centerZ) * scale;
    }
}

// Keep every morph visually the same footprint as the hero object.
const heroShapeAxis = getShapeBounds(shapes[0]).maxAxis;
shapes.forEach((shape, index) => {
    normalizeShapeToAxis(shape, heroShapeAxis);
    // Increase Helix size (index 3)
    if (mode !== 'playa' && index === 3) {
        for (let i = 0; i < shape.length; i++) {
            shape[i] *= 1.6;
        }
    }
});

// === PARTICLE SYSTEM ===
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const randoms = new Float32Array(PARTICLE_COUNT);

// Initialize with first shape
positions.set(shapes[0]);

const c1 = new THREE.Color(0xb8b2aa);
const c2 = new THREE.Color(0xa39688);
const c3 = new THREE.Color(0x8899a4);

const _tmpCol = new THREE.Color();
for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ratio = i / PARTICLE_COUNT;
    if (ratio < 0.5) {
        _tmpCol.copy(c1).lerp(c2, ratio * 2);
    } else {
        _tmpCol.copy(c2).lerp(c3, (ratio - 0.5) * 2);
    }
    colors[i * 3] = _tmpCol.r;
    colors[i * 3 + 1] = _tmpCol.g;
    colors[i * 3 + 2] = _tmpCol.b;
    sizes[i] = 0.016 + Math.random() * 0.025;
    randoms[i] = Math.random();
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

// Custom shader for soft particles
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMorph: { value: 0 },
        uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
        uMouseActive: { value: 0 },
    },
    vertexShader: `
        attribute float aSize;
        attribute float aRandom;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uMorph;

        uniform vec3 uMouse3D;
        uniform float uMouseActive;

        void main() {
            vColor = color;
            vec3 pos = position;

            // Subtle breathing
            float breath = sin(uTime * 0.5 + aRandom * 6.28) * 0.02;
            pos += normalize(pos) * breath;

            // During morph, particles scatter outward slightly
            float scatter = sin(uMorph * 3.14159) * 0.3;
            pos += normalize(pos + vec3(0.001)) * scatter * aRandom;

            // Mouse influence — swirl + push with depth-agnostic distance
            vec3 toParticle = pos - uMouse3D;
            // Use only XY distance so depth doesn't reduce influence
            float xyDist = length(toParticle.xy);
            float fullDist = length(toParticle);
            float mouseRadius = 1.4;
            float influence = 1.0 - smoothstep(0.0, mouseRadius, xyDist);
            influence = influence * influence * uMouseActive;

            if (influence > 0.001) {
                // Push away from mouse
                vec3 pushDir = fullDist > 0.001 ? normalize(toParticle) : vec3(0.0, 1.0, 0.0);
                float pushStrength = influence * 0.12;
                pos += pushDir * pushStrength;

                // Swirl around mouse (rotate in XY plane around mouse position)
                float swirlSpeed = uTime * 2.0 + aRandom * 6.28;
                float swirlStrength = influence * 0.10;
                vec2 radial = pos.xy - uMouse3D.xy;
                float angle = swirlStrength * (1.0 + sin(swirlSpeed) * 0.3);
                float cosA = cos(angle);
                float sinA = sin(angle);
                vec2 rotated = vec2(
                    radial.x * cosA - radial.y * sinA,
                    radial.x * sinA + radial.y * cosA
                );
                pos.xy = uMouse3D.xy + rotated;

                // Z-axis gentle orbit for depth feel
                pos.z += sin(swirlSpeed * 0.7 + aRandom * 3.14) * influence * 0.06;

                // Organic jitter
                float jitter = sin(uTime * 4.0 + aRandom * 18.0) * 0.02 * influence;
                pos += pushDir * jitter;
            }

            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * uPixelRatio * 620.0 / -mvPos.z;
            gl_PointSize = max(gl_PointSize, 1.8);
            gl_Position = projectionMatrix * mvPos;

            vAlpha = 0.95 + 0.05 * (1.0 - smoothstep(0.0, 10.0, -mvPos.z));
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
            vec3 brightColor = vColor * 1.9 + 0.14;
            gl_FragColor = vec4(brightColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// === MORPHING ===
let currentShape = 0;
let targetShape = 0;
let morphProgress = 0;
let isMorphing = false;
const morphDuration = 2.0;
let morphStartTime = 0;
const clock = new THREE.Clock();

// Service content mapped to each shape
const objectCopy = [
    // MoGhoz - left only the quotes, removed titles..
    // { title: 'Operating Layer', quote: '\u201cThe work should remember itself.\u201d' },
    // { title: 'Human Judgment', quote: '\u201cAI can assist. People still decide.\u201d' },
    // { title: 'Business Memory', quote: '\u201cA dashboard is a company learning to see.\u201d' },
    // { title: 'Quiet Automation', quote: '\u201cThe best process stops asking to be remembered.\u201d' },
    { title: '', quote: '\u201cThe work should remember itself.\u201d' },
    { title: '', quote: '\u201cAI can assist. People still decide.\u201d' },
    { title: '', quote: '\u201cA dashboard is a company learning to see.\u201d' },
    { title: '', quote: '\u201cThe best process stops asking to be remembered.\u201d' }
];
const morphQuoteEl = document.getElementById('morph-quote');
let labelUpdatedForMorph = false;

function startMorph(targetIdx) {
    if (isMorphing || targetIdx === currentShape) return;
    targetShape = targetIdx;
    isMorphing = true;
    morphStartTime = clock.getElapsedTime();
    labelUpdatedForMorph = false;

    // Fade out the morph-name and quote at morph start
    if (morphNameEl) morphNameEl.classList.add('is-changing');
    if (morphQuoteEl) morphQuoteEl.classList.add('is-changing');
}

// Morph progress bar
const morphProgressEl = document.getElementById('morph-progress');
let morphTimer = 0;
const morphInterval = 4;

// Auto-morph every 3.5 seconds
let autoMorphInterval = prefersReducedMotion ? null : setInterval(() => {
    const next = (currentShape + 1) % shapes.length;
    startMorph(next);
}, 4000);

// Click dots to morph
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx);
        if (autoMorphInterval) clearInterval(autoMorphInterval);
        startMorph(idx);
        autoMorphInterval = prefersReducedMotion ? null : setInterval(() => {
            const next = (currentShape + 1) % shapes.length;
            startMorph(next);
        }, 4000);
    });
});

function updateUI(idx) {
    morphNameEl.textContent = objectCopy[idx].title;
    if (morphQuoteEl) morphQuoteEl.textContent = objectCopy[idx].quote;
    morphCounterEl.textContent = `0${idx + 1} / 0${shapes.length}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

// === MOUSE RAYCASTING ===
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2(9999, 9999);
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let mouseOnScreen = false;
let mouseActiveSmooth = 0;

// === POINTER / TOUCH INTERACTION ===
// Keep the WebGL canvas non-interactive so mobile vertical swipes scroll normally.
// We listen passively at document level and only feed the shader with coordinates.
const interactionLayer = document;
let touchStartX = 0;
let touchStartY = 0;
let touchIsScrolling = false;

function updatePointerPosition(clientX, clientY) {
    mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    mouseOnScreen = true;
}

function isHeroTouchZone() {
    return window.scrollY < window.innerHeight * 0.75;
}

// Desktop: pointer events. Ignore touch pointers here; touch has its own scroll-safe path.
interactionLayer.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    updatePointerPosition(e.clientX, e.clientY);
}, { passive: true });

interactionLayer.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    updatePointerPosition(e.clientX, e.clientY);
    mouseOnScreen = true;
}, { passive: true });

interactionLayer.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') return;
    mouseOnScreen = false;
}, { passive: true });

interactionLayer.addEventListener('pointercancel', (e) => {
    if (e.pointerType === 'touch') return;
    mouseOnScreen = false;
}, { passive: true });

interactionLayer.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    mouseNDC.set(9999, 9999);
    mouseOnScreen = false;
}, { passive: true });

// Mobile: update the object for light horizontal/free movement, but yield to vertical scroll.
interactionLayer.addEventListener('touchstart', (e) => {
    if (!isHeroTouchZone() || !e.touches.length) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchIsScrolling = false;
    updatePointerPosition(touch.clientX, touch.clientY);
}, { passive: true });

interactionLayer.addEventListener('touchmove', (e) => {
    if (!isHeroTouchZone() || !e.touches.length) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);

    if (dy > 10 && dy > dx * 0.8) {
        touchIsScrolling = true;
        mouseOnScreen = false;
        return;
    }

    if (!touchIsScrolling) {
        updatePointerPosition(touch.clientX, touch.clientY);
    }
}, { passive: true });

interactionLayer.addEventListener('touchend', () => {
    touchIsScrolling = false;
    mouseOnScreen = false;
}, { passive: true });

interactionLayer.addEventListener('touchcancel', () => {
    touchIsScrolling = false;
    mouseOnScreen = false;
}, { passive: true });

// Desktop fallback: document-level mouse leave
document.addEventListener('mouseleave', () => {
    mouseNDC.set(9999, 9999);
    mouseOnScreen = false;
});

// === ANIMATION LIFECYCLE MANAGEMENT ===
const _invMatrix = new THREE.Matrix4();
const _localMouse = new THREE.Vector3();
const _intersectPoint = new THREE.Vector3();

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

let lastUIUpdate = -1;
let animFrameId = null;
let isPageVisible = !document.hidden;
let isHeroInView = true;
let isReducedMotion = prefersReducedMotion;

// Media Query listener for prefers-reduced-motion
const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
function handleReducedMotionChange(e) {
    isReducedMotion = e.matches;
    container.dataset.animating = String(!isReducedMotion && isPageVisible && isHeroInView);
    if (isReducedMotion) {
        if (autoMorphInterval) { clearInterval(autoMorphInterval); autoMorphInterval = null; }
        stopAnimation();
        renderSingleFrame();
    } else {
        if (!autoMorphInterval) {
            autoMorphInterval = setInterval(() => {
                const next = (currentShape + 1) % shapes.length;
                startMorph(next);
            }, 4000);
        }
        updateAnimationLifecycle();
    }
}
window.addEventListener('arzware:motion', event => handleReducedMotionChange({matches:event.detail.reduced}));

function renderSingleFrame() {
    particles.scale.setScalar(window.innerWidth <= 768 ? 0.82 : 1);
    renderer.render(scene, camera);
}

function updateAnimationLifecycle() {
    const shouldAnimate = !isReducedMotion && isPageVisible && isHeroInView;
    container.dataset.animating = String(shouldAnimate);
    if(!shouldAnimate && autoMorphInterval){clearInterval(autoMorphInterval);autoMorphInterval=null;}
    if(shouldAnimate && !autoMorphInterval){autoMorphInterval=setInterval(()=>startMorph((currentShape+1)%shapes.length),4000);}
    if (shouldAnimate) {
        startAnimation();
    } else {
        stopAnimation();
    }
}

function startAnimation() {
    if (!animFrameId && !isReducedMotion) {
        clock.running = true;
        clock.oldTime = performance.now();
        animFrameId = requestAnimationFrame(loop);
    }
}

function stopAnimation() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

function loop() {
    animFrameId = requestAnimationFrame(loop);
    const heroVisualOpacity = window.__heroVisualOpacity ?? 1;

    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;

    const mouseTarget = mouseOnScreen ? 1 : 0;
    mouseActiveSmooth += (mouseTarget - mouseActiveSmooth) * 0.08;
    material.uniforms.uMouseActive.value = mouseActiveSmooth * heroVisualOpacity;

    if (hasFinePointer) {
        raycaster.setFromCamera(mouseNDC, camera);
        raycaster.ray.intersectPlane(mousePlane, _intersectPoint);
        _invMatrix.copy(particles.matrixWorld).invert();
        _localMouse.copy(_intersectPoint).applyMatrix4(_invMatrix);
        material.uniforms.uMouse3D.value.copy(_localMouse);
    }

    if (isMorphing) {
        const rawProgress = Math.min((elapsed - morphStartTime) / morphDuration, 1);
        morphProgress = easeOutQuart(rawProgress);
        material.uniforms.uMorph.value = morphProgress;

        const srcPositions = shapes[currentShape];
        const tgtPositions = shapes[targetShape];
        const posArray = geometry.attributes.position.array;
        const len = PARTICLE_COUNT * 3;

        for (let i = 0; i < len; i++) {
            posArray[i] = srcPositions[i] + (tgtPositions[i] - srcPositions[i]) * morphProgress;
        }
        geometry.attributes.position.needsUpdate = true;

        if (rawProgress >= 1) {
            isMorphing = false;
            currentShape = targetShape;
            material.uniforms.uMorph.value = 0;
            updateUI(currentShape);
            lastUIUpdate = -1;
        }

        if (rawProgress > 0.4 && rawProgress < 0.6 && lastUIUpdate !== targetShape) {
            lastUIUpdate = targetShape;
            updateUI(targetShape);

            if (!labelUpdatedForMorph && morphNameEl) {
                labelUpdatedForMorph = true;
                morphNameEl.textContent = objectCopy[targetShape].title;
                if (morphQuoteEl) morphQuoteEl.textContent = objectCopy[targetShape].quote;
                requestAnimationFrame(() => {
                    morphNameEl.classList.remove('is-changing');
                    if (morphQuoteEl) morphQuoteEl.classList.remove('is-changing');
                });
            }
        }
    }

    const isMobileNow = window.innerWidth <= 768;
    particles.scale.setScalar(isMobileNow ? 0.82 : 1);

    const sinT = Math.sin(elapsed * 0.2);
    keyLight.position.x = sinT * 4;
    keyLight.position.z = Math.cos(elapsed * 0.2) * 4;

    if (!isMorphing) {
        const barProgress = ((elapsed % morphInterval) / morphInterval) * 100;
        if (morphProgressEl) morphProgressEl.style.width = barProgress + '%';
    } else {
        if (morphProgressEl) morphProgressEl.style.width = '0%';
    }

    renderer.render(scene, camera);
}

// Visibility API
document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    updateAnimationLifecycle();
});

// IntersectionObserver on #hero
const heroElement = document.getElementById('hero');
if (heroElement && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isHeroInView = entry.isIntersecting;
            updateAnimationLifecycle();
        });
    }, { threshold: 0.01 });
    heroObserver.observe(heroElement);
}

// Resize and Orientation change
function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const targetDPR = Math.min(window.devicePixelRatio, w <= 768 ? 1.0 : 1.5);
    renderer.setPixelRatio(targetDPR);
    renderer.setSize(w, h);
    if (material.uniforms.uPixelRatio) {
        material.uniforms.uPixelRatio.value = targetDPR;
    }
    if (isReducedMotion) {
        renderSingleFrame();
    }
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
}, { passive: true });
window.addEventListener('orientationchange', handleResize);

// WebGL Context Lost & Restored
const canvasEl = renderer.domElement;
canvasEl.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stopAnimation();
    document.documentElement.classList.remove('hero-ready');
    container.dataset.renderer='fallback';
    container.dataset.animating='false';
    if(autoMorphInterval){clearInterval(autoMorphInterval);autoMorphInterval=null;}
}, false);
canvasEl.addEventListener('webglcontextrestored', () => {
    document.documentElement.classList.add('hero-ready');container.dataset.renderer='ready';
    handleResize();
    if (isReducedMotion) {
        renderSingleFrame();
    } else {
        updateAnimationLifecycle();
    }
}, false);

// Initial setup
if (isReducedMotion) {
    renderSingleFrame();
} else {
    updateAnimationLifecycle();
}
}
