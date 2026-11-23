/* Drosie's Life Cycle Adventure · game logic
   One story, five interactive parts: Egg → Larva → Pupa → Adult → Sequence challenge → Celebrate.
   All state lives in memory. Only accessibility preferences are saved (localStorage, this device only). */
(() => {
'use strict';

/* ------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hide = (n, v) => n.toggleAttribute('hidden', !!v); // the hidden property does not exist on SVG elements
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const NS = 'http://www.w3.org/2000/svg';
const el = {
  gm: $('#gm'), stage: $('#stage'), title: $('#chTitle'), label: $('#chLabel'), coach: $('#coachText'), sr: $('#sr'),
  task: $('#task'), taskText: $('#taskText'), facts: $('#facts'), main: $('#mainBtn'), back: $('#backBtn'), hint: $('#hintBtn'),
  fill: $('#fillSlot'), deeper: $('#deeperBody'), deeperBox: $('#deeper'), trail: $('#trail'),
  read: $('#readBtn'), readLbl: $('#readLbl'), pause: $('#pauseBtn'), readMsg: $('#readMsg')
};

/* ------------------------------------------------------------ preferences */
const PREF_KEY = 'drosie-lifecycle-prefs-v1';
const prefs = { large: false, contrast: false, motion: false, easy: false, spacing: false, calm: false, sound: false };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* storage may be blocked */ }
const sysReduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rm = () => prefs.motion || sysReduce();
function applyPrefs() {
  const h = document.documentElement;
  h.classList.toggle('large', prefs.large); h.classList.toggle('contrast', prefs.contrast);
  h.classList.toggle('rm', prefs.motion); h.classList.toggle('easy', prefs.easy);
  h.classList.toggle('spacing', prefs.spacing); h.classList.toggle('calm', prefs.calm);
  $$('[data-pref]').forEach(i => { i.checked = !!prefs[i.dataset.pref]; });
}
function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }

/* ------------------------------------------------------------ timers & animation (all cancelled on navigation/restart) */
let token = 0;
const T = { ids: new Set(), later(fn, ms) { const my = token; const id = setTimeout(() => { T.ids.delete(id); if (my === token) fn(); }, ms); T.ids.add(id); return id; }, clear() { T.ids.forEach(clearTimeout); T.ids.clear(); } };
const wait = ms => new Promise(res => { if (rm()) ms = Math.min(ms, 30); T.later(() => res(), ms); });
/** Tween u from 0..1 over dur ms. Resolves at the end; never resolves (and stops) if the game navigates away. */
function tween(dur, fn, ease = u => u * u * (3 - 2 * u)) {
  const my = token;
  return new Promise(res => {
    if (rm() || dur <= 0) { fn(1); res(); return; }
    const t0 = performance.now();
    (function f(now) {
      if (my !== token) return;
      const u = clamp((now - t0) / dur, 0, 1); fn(ease(u));
      if (u < 1) requestAnimationFrame(f); else res();
    })(t0);
  });
}
const lerp = (a, b, u) => a + (b - a) * u;

/* ------------------------------------------------------------ optional sound (synthesised, off by default) */
let ac = null;
function beep(freq = 600, dur = 0.1, gain = 0.03) {
  if (!prefs.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
  } catch (e) { /* sound is optional */ }
}

/* ------------------------------------------------------------ optional read-aloud (never autoplays) */
const speech = { ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, speaking: false, paused: false, text: '' };
function pickVoice() {
  try { const v = speechSynthesis.getVoices(); return v.find(x => /^en/i.test(x.lang) && /samantha|zira|jenny|aria|google us/i.test(x.name)) || v.find(x => /^en/i.test(x.lang)) || null; } catch (e) { return null; }
}
function setReadUi() {
  el.readLbl.textContent = speech.speaking ? 'Stop' : 'Read aloud';
  el.pause.hidden = !speech.speaking; el.pause.textContent = speech.paused ? 'Resume' : 'Pause';
}
function stopSpeech() {
  if (speech.ok) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  speech.speaking = false; speech.paused = false; setReadUi();
}
function readAloud() {
  if (!speech.ok) { el.readMsg.textContent = 'Read-aloud is not available on this device. The words are shown on screen.'; return; }
  if (speech.speaking) { stopSpeech(); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speech.text || el.coach.textContent);
    const v = pickVoice(); if (v) u.voice = v; u.lang = (v && v.lang) || 'en-US'; u.rate = 0.92; u.pitch = 1.05;
    u.onend = u.onerror = () => { speech.speaking = false; speech.paused = false; setReadUi(); };
    speech.speaking = true; speech.paused = false; el.readMsg.textContent = ''; setReadUi(); speechSynthesis.speak(u);
  } catch (e) { speech.speaking = false; el.readMsg.textContent = 'Read-aloud could not start.'; setReadUi(); }
}
el.read.addEventListener('click', readAloud);
el.pause.addEventListener('click', () => {
  if (!speech.speaking) return;
  try { if (speech.paused) { speechSynthesis.resume(); speech.paused = false; } else { speechSynthesis.pause(); speech.paused = true; } } catch (e) { /* ignore */ }
  setReadUi();
});
if (!speech.ok) { el.read.disabled = true; el.readMsg.textContent = 'Read-aloud is not available in this browser.'; }
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
window.addEventListener('pagehide', stopSpeech);

/* ------------------------------------------------------------ chapters + game state */
const CHAPTERS = [
  { id: 'egg', name: 'Egg', title: 'A Tiny Beginning', label: 'Chapter 1 · Egg' },
  { id: 'larva', name: 'Larva', title: 'The Hungry Larva', label: 'Chapter 2 · Larva' },
  { id: 'pupa', name: 'Pupa', title: 'The Big Transformation', label: 'Chapter 3 · Pupa' },
  { id: 'adult', name: 'Adult', title: 'Drosie Takes Flight', label: 'Chapter 4 · Adult' },
  { id: 'seq', name: 'Challenge', title: 'Put My Life in Order', label: 'Final challenge' }
];
let booted = false;
const S = { phase: 'welcome', max: 0, done: {}, busy: false, mainAction: null, hintAction: null };
const mods = {};

/* ------------------------------------------------------------ panel UI helpers */
function say(text) { el.coach.textContent = text; speech.text = text; el.sr.textContent = ''; setTimeout(() => { el.sr.textContent = text; }, 30); stopSpeechIfChanged(); }
function stopSpeechIfChanged() { if (speech.speaking) stopSpeech(); }
function setTask(text) { el.task.hidden = !text; el.taskText.textContent = text || ''; }
function setFacts(list) { el.facts.innerHTML = ''; list.forEach(t => { const li = document.createElement('li'); li.textContent = t; el.facts.appendChild(li); }); }
function addFact(list, text) { if (!list.includes(text)) { list.push(text); const li = document.createElement('li'); li.textContent = text; el.facts.appendChild(li); } }
function setMain(label, action, opts = {}) {
  el.main.hidden = !label; el.main.textContent = label || ''; el.main.disabled = !!opts.disabled;
  el.main.className = 'btn' + (opts.go ? ' go' : '') + (opts.ready ? ' ready' : '');
  S.mainAction = action || null;
}
function setHint(label, action) { el.hint.hidden = !label; el.hint.textContent = label || ''; S.hintAction = action || null; }
function setFill(node) { el.fill.textContent = ''; if (node) el.fill.appendChild(node); }
function setDeeper(html) { el.deeper.innerHTML = html; el.deeperBox.open = false; el.deeperBox.hidden = !html; }
el.main.addEventListener('click', () => { if (S.busy || el.main.disabled || !S.mainAction) return; S.mainAction(); });
el.hint.addEventListener('click', () => { if (S.hintAction) S.hintAction(); });
el.back.addEventListener('click', () => { const i = phaseOrder().indexOf(S.phase); if (i > 0) go(phaseOrder()[i - 1]); });
const phaseOrder = () => ['welcome', ...CHAPTERS.map(c => c.id), 'done'];
const chIndex = id => CHAPTERS.findIndex(c => c.id === id);
/** Make an SVG element behave like a button for mouse, touch and keyboard. */
function activate(node, fn) {
  node.addEventListener('click', e => { e.stopPropagation(); fn(e); });
  node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
}
function svgPoint(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); return { p: p.matrixTransform(m.inverse()), scale: m.a }; }
function nextChapterButton(id) {
  const i = chIndex(id), next = CHAPTERS[i + 1];
  const label = next ? `Next: ${next.title} →` : 'See my badge →';
  setMain(label, () => go(next ? next.id : 'done'), { go: true, ready: true });
}
function finish(id) { if (S.done[id]) nextChapterButton(id); else chapterDone(id); }
function chapterDone(id) {
  S.done[id] = true; S.max = Math.max(S.max, chIndex(id) + 1); renderTrail(); beep(660, 0.12); setTimeout(() => beep(880, 0.16), 140);
  nextChapterButton(id);
}

/* ------------------------------------------------------------ progress trail + navigation */
function renderTrail() {
  el.trail.innerHTML = '';
  CHAPTERS.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button';
    const state = S.done[c.id] ? 'done' : (S.phase === c.id ? 'now' : '');
    if (state) b.classList.add(state);
    b.disabled = i > S.max;
    b.setAttribute('aria-label', `${c.label}: ${c.title}${S.done[c.id] ? ' (finished)' : ''}${i > S.max ? ' (locked)' : ''}`);
    if (S.phase === c.id) b.setAttribute('aria-current', 'step');
    b.innerHTML = `<b aria-hidden="true">${S.done[c.id] ? '✓' : i + 1}</b><span class="lbl">${c.name}</span>`;
    b.addEventListener('click', () => { if (i <= S.max) go(c.id); });
    el.trail.appendChild(b);
  });
}
function go(phase) {
  token++; T.clear(); stopSpeech(); S.busy = false; S.phase = phase;
  $$('.petals').forEach(n => n.remove());
  $$('.scene').forEach(s => hide(s, s.id !== 'scene-' + phase));
  el.stage.dataset.ch = phase; el.gm.dataset.ch = phase;
  const ci = chIndex(phase), c = CHAPTERS[ci];
  el.label.textContent = phase === 'welcome' ? 'A story for curious explorers' : phase === 'done' ? 'You did it!' : c.label;
  el.title.textContent = phase === 'welcome' ? "Drosie's Life Cycle Adventure" : phase === 'done' ? 'Drosie Life Cycle Explorer' : c.title;
  el.back.hidden = phase === 'welcome'; setHint(null); setTask(null); setFill(null); setMain(null); setFacts([]); setDeeper('');
  renderTrail();
  mods[phase].enter();
  document.title = (phase === 'welcome' ? "Fruit Fly Life Cycle Game for Kids" : c ? c.title + ' · Drosie\'s Life Cycle Adventure' : "Drosie Life Cycle Explorer") + " | Drosie's World";
  el.title.focus({ preventScroll: true });
  if (booted && window.matchMedia('(max-width: 940px)').matches) el.stage.scrollIntoView({ block: 'start', behavior: rm() ? 'auto' : 'smooth' });
}

/* =================================================================== WELCOME */
mods.welcome = {
  enter() {
    say("Hi! I'm Drosie, a fruit fly. Come with me from a tiny egg to a flying adult. Are you ready?");
    const chips = document.createElement('div'); chips.className = 'chips'; chips.setAttribute('aria-label', 'The four stages');
    ['Egg', 'Larva', 'Pupa', 'Adult'].forEach((t, i) => { const s = document.createElement('span'); s.className = 'chip on'; s.textContent = `${i + 1}. ${t}`; chips.appendChild(s); });
    setFill(chips);
    setMain(S.max > 0 || S.done.egg ? 'Continue the adventure' : 'Begin the adventure', () => go(CHAPTERS[Math.min(S.max, CHAPTERS.length - 1)].id), { go: true, ready: true });
    setDeeper('<p>Four short chapters, one for each stage of the fruit fly life cycle, then a final challenge. You find things out by exploring, not by racing. There is no timer and no wrong way to look around.</p><p>Everything here is a simplified illustration of <em>Drosophila melanogaster</em>. Open <strong>Science notes</strong> any time for times, words and notes about accuracy.</p>');
  }
};

/* =================================================================== CHAPTER 1 · EGG */
const egg = { found: false, parts: new Set(), facts: [], lens: { x: 120, y: 190 }, dwell: null, hints: 0 };
const EGG_POS = { x: 338, y: 231 }, ZOOM = 4.2, LENS_R = 64;
const eggSvg = $('#scene-egg');
function moveLens(x, y) {
  x = clamp(x, 10, 470); y = clamp(y, 10, 350); egg.lens.x = x; egg.lens.y = y;
  ['#lensClipC', '#lensRing', '#lensGlow'].forEach(s => { $(s).setAttribute('cx', x); $(s).setAttribute('cy', y); });
  $('#zoomUse').setAttribute('transform', `translate(${x} ${y}) scale(${ZOOM}) translate(${-x} ${-y})`);
  $('#lensHandle').setAttribute('transform', `translate(${x} ${y}) rotate(38)`);
  const near = Math.hypot(x - EGG_POS.x, y - EGG_POS.y) < 24;
  $('#lensGlow').setAttribute('opacity', near && !egg.found ? 1 : 0);
  if (near && !egg.found) { if (!egg.dwell) egg.dwell = T.later(foundEgg, rm() ? 60 : 650); }
  else if (egg.dwell) { clearTimeout(egg.dwell); egg.dwell = null; }
}
eggSvg.addEventListener('pointerdown', e => { if (egg.found || S.phase !== 'egg') return; eggSvg.setPointerCapture(e.pointerId); lensFromPointer(e); });
eggSvg.addEventListener('pointermove', e => { if (egg.found || S.phase !== 'egg') return; lensFromPointer(e); });
function lensFromPointer(e) { const { p, scale } = svgPoint(eggSvg, e); moveLens(p.x, p.y - (e.pointerType === 'touch' ? 56 / scale : 0)); }
eggSvg.addEventListener('keydown', e => {
  if (egg.found || S.phase !== 'egg') return;
  const step = e.shiftKey ? 44 : 16, k = e.key;
  const d = k === 'ArrowLeft' ? [-step, 0] : k === 'ArrowRight' ? [step, 0] : k === 'ArrowUp' ? [0, -step] : k === 'ArrowDown' ? [0, step] : null;
  if (d) { e.preventDefault(); moveLens(egg.lens.x + d[0], egg.lens.y + d[1]); }
});
async function showEgg() { // gently slide the lens to the egg (non-drag alternative)
  if (egg.found || S.busy) return; S.busy = true; egg.hints++;
  const a = { ...egg.lens }, b = { x: EGG_POS.x - 30, y: EGG_POS.y - 20 };
  await tween(900, u => moveLens(lerp(a.x, b.x, u), lerp(a.y, b.y, u)));
  const c = { ...egg.lens };
  await tween(500, u => moveLens(lerp(c.x, EGG_POS.x, u), lerp(c.y, EGG_POS.y, u)));
  S.busy = false;
}
function foundEgg() {
  if (egg.found) return; egg.found = true; if (egg.dwell) { clearTimeout(egg.dwell); egg.dwell = null; }
  beep(740, 0.14); renderEgg(true);
}
const EGG_FACTS = {
  size: 'A fruit fly egg is only about 0.5 millimetres long. That is tiny!',
  filaments: 'Two thin filaments (like little snorkels) help the egg get air.',
  embryo: 'A baby fly, called an embryo, grows inside the egg. At about 25°C it hatches after about 1 day.'
};
function renderEgg(announce) {
  $('#lens').setAttribute('opacity', 0); $('#lens').style.display = egg.found ? 'none' : '';
  hide($('#closeup'), !egg.found); eggSvg.style.cursor = egg.found ? '' : 'none'; eggSvg.setAttribute('tabindex', egg.found ? '-1' : '0');
  $('#lens').setAttribute('opacity', 1); eggSvg.style.touchAction = egg.found ? 'auto' : 'none';
  if (!egg.found) {
    setTask('Find the tiny egg: move the lens over the fruit'); setFacts(egg.facts); setHint('Show me where', showEgg);
    if (announce !== false) say('I started as an egg so small you need a magnifying glass. Move the magnifying glass over the fruit (drag with a finger, or use the arrow keys).');
    moveLens(egg.lens.x, egg.lens.y); return;
  }
  setHint(null);
  ['size', 'filaments', 'embryo'].forEach(k => $('#hot-' + k).classList.toggle('found', egg.parts.has(k)));
  $('#ruler').setAttribute('opacity', egg.parts.has('size') ? 1 : 0); $('#filLbl').setAttribute('opacity', egg.parts.has('filaments') ? 1 : 0); $('#embryo').setAttribute('opacity', egg.parts.has('embryo') ? 1 : 0);
  setFacts(egg.facts);
  if (egg.parts.size === 3) { setTask(null); finish('egg'); if (announce) say('You found my egg and learned its secrets! At about 25°C I hatch after about one day.'); }
  else { setTask(`Tap the glowing numbers: ${egg.parts.size} of 3`); if (announce) say('You found it! Tap the glowing numbers to look closer.'); }
  if (S.done.egg) nextChapterButton('egg');
}
['size', 'filaments', 'embryo'].forEach(k => activate($('#hot-' + k), () => {
  if (!egg.found || S.phase !== 'egg') return; egg.parts.add(k); addFact(egg.facts, EGG_FACTS[k]); beep(520 + egg.parts.size * 90, 0.1);
  say(EGG_FACTS[k]); renderEgg(false);
  if (egg.parts.size === 3) { say('You found my egg and learned its secrets! At about 25°C I hatch after about one day.'); }
}));
mods.egg = {
  enter() {
    setDeeper('<p>The egg has a protective shell called the chorion. The two thin filaments are called dorsal appendages, and they help the egg breathe.</p><p>At about 25°C the embryo finishes developing in roughly 24 hours, then a first-instar larva hatches. Cooler temperatures slow this down and warmer ones speed it up.</p>');
    egg.dwell = null; renderEgg(true);
  }
};

/* =================================================================== CHAPTER 2 · LARVA */
const L = { step: 'choose', facts: [], skins: [], tried: new Set(), pos: { x: 110, y: 176 } };
const LSTEPS = ['choose', 'ate1', 'molt2', 'ate2', 'molt3', 'ate3', 'wander'];
const INSTAR_SCALE = [0.75, 1.15, 1.65], MASH = { x: 236, y: 232 }, DRY = { x: 392, y: 136 };
const larvaG = $('#larvaG'), larvaScale = $('#larvaScale');
const instarOf = () => (LSTEPS.indexOf(L.step) >= LSTEPS.indexOf('molt3') ? 3 : LSTEPS.indexOf(L.step) >= LSTEPS.indexOf('molt2') ? 2 : 1);
function placeLarva(x, y, s, flip = 1, wob = 0) { L.pos = { x, y }; larvaG.setAttribute('transform', `translate(${x} ${y + wob})`); larvaScale.setAttribute('transform', `scale(${s * flip} ${s})`); }
function instarChips() {
  const wrap = document.createElement('div'); wrap.className = 'chips'; wrap.setAttribute('aria-label', 'Larval instars');
  [1, 2, 3].forEach(n => { const c = document.createElement('span'); c.className = 'chip' + (instarOf() === n ? ' on' : instarOf() > n ? ' ok' : ''); c.textContent = `${n}${['st', 'nd', 'rd'][n - 1]} instar`; wrap.appendChild(c); });
  return wrap;
}
function renderSkins() {
  const g = $('#skins'); g.innerHTML = '';
  L.skins.forEach(s => { const im = document.createElementNS(NS, 'image'); im.setAttribute('href', 'life-cycle-assets/larva.webp'); im.setAttribute('x', s.x - 45 * s.s); im.setAttribute('y', s.y - 13 * s.s); im.setAttribute('width', 90 * s.s); im.setAttribute('height', 27 * s.s); im.setAttribute('opacity', '.32'); im.setAttribute('style', 'filter:saturate(.3) brightness(1.1)'); g.appendChild(im); });
}
function renderLarvaUi() {
  const step = L.step, i = instarOf(); setFill(instarChips()); setFacts(L.facts);
  $('#dryspot').setAttribute('opacity', step === 'ate3' || step === 'wander' ? 1 : 0);
  $$('.item').forEach(n => { n.classList.remove('glow'); n.classList.toggle('tried', L.tried.has(n.id)); });
  setHint(null);
  const map = {
    choose: () => { setTask('Tap the food Drosie can eat'); setMain(null); setHint('Help me', () => { $('#item-mash').classList.add('glow'); say('Look for the soft, squishy fruit. Yum!'); }); },
    ate1: () => { setTask('Drosie is full. Time to molt!'); setMain('Molt!', () => doMolt(2), { go: true, ready: true }); },
    molt2: () => { setTask('Feed the 2nd instar larva'); setMain('Feed', () => doFeed('ate2'), { go: true, ready: true }); },
    ate2: () => { setTask('Full again. Time to molt!'); setMain('Molt!', () => doMolt(3), { go: true, ready: true }); },
    molt3: () => { setTask('Feed the 3rd instar larva'); setMain('Feed', () => doFeed('ate3'), { go: true, ready: true }); },
    ate3: () => { setTask('Big and full. What does Drosie do next?'); setMain('Follow the larva →', doWander, { go: true, ready: true }); },
    wander: () => { setTask(null); finish('larva'); }
  };
  map[step]();
  if (S.done.larva) { setTask(null); nextChapterButton('larva'); }
}
async function chooseFood(id) {
  if (S.phase !== 'larva' || S.busy || L.step !== 'choose') return;
  S.busy = true; $$('.item').forEach(n => n.classList.remove('glow'));
  const node = $('#' + id), box = { 'item-mash': MASH, 'item-stone': { x: 410, y: 286 }, 'item-leaf': { x: 100, y: 276 } }[id];
  const from = { ...L.pos };
  if (id !== 'item-mash') {
    L.tried.add(id); node.classList.add('tried');
    await tween(700, u => placeLarva(lerp(from.x, from.x + (box.x - from.x) * 0.45, u), lerp(from.y, from.y + (box.y - from.y) * 0.35, u), INSTAR_SCALE[0], 1, Math.sin(u * 12) * 3));
    await wait(250);
    await tween(600, u => placeLarva(lerp(L.pos.x, from.x, u), lerp(L.pos.y, from.y, u), INSTAR_SCALE[0], 1, Math.sin(u * 10) * 3));
    say(id === 'item-stone' ? 'A pebble is not food. Larvae eat soft, yeasty fruit.' : 'A dry leaf is not food either. Try the soft, squishy one!');
    renderLarvaUi(); S.busy = false; return;
  }
  say('Yum! Larvae eat soft, yeasty fruit. They have no legs, so they wriggle over to it.');
  await tween(1200, u => placeLarva(lerp(from.x, MASH.x - 20, u), lerp(from.y, MASH.y, u), INSTAR_SCALE[0], 1, Math.sin(u * 22) * 4));
  await munch(INSTAR_SCALE[0]);
  L.step = 'ate1'; addFact(L.facts, 'Larvae have no legs. They wriggle, eat and grow.'); say('Munch, munch! I am full. Now my skin feels tight. Press Molt!'); renderLarvaUi(); S.busy = false;
}
async function munch(s) {
  const g = $('#crumbs'); g.innerHTML = '';
  for (let k = 0; k < 4; k++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 2.5); c.setAttribute('cx', L.pos.x + 30 * s); c.setAttribute('cy', L.pos.y + 10); g.appendChild(c); }
  await tween(1500, u => {
    placeLarva(L.pos.x, L.pos.y, s * (1 + 0.07 * Math.sin(u * 28)), 1, 0);
    [...g.children].forEach((c, k) => { c.setAttribute('cx', L.pos.x + 34 * s + Math.sin(u * 5 + k) * 6 + k * 3); c.setAttribute('cy', L.pos.y + 14 - u * (20 + k * 8)); c.setAttribute('opacity', 1 - u); });
  });
  g.innerHTML = ''; placeLarva(L.pos.x, L.pos.y, s);
  beep(420, 0.08);
}
async function doFeed(next) {
  if (S.busy) return; S.busy = true; setMain(null); const s = INSTAR_SCALE[instarOf() - 1];
  say('Munch, munch! Feeding makes me grow.'); await munch(s); L.step = next;
  say(next === 'ate2' ? 'I am full again. Time for my next molt!' : 'I am a big, well-fed larva now!'); renderLarvaUi(); S.busy = false;
}
async function doMolt(n) {
  if (S.busy) return; S.busy = true; setMain(null);
  const s0 = INSTAR_SCALE[n - 2], s1 = INSTAR_SCALE[n - 1]; say('Molting! I am wriggling out of my old skin.');
  L.skins.push({ x: L.pos.x - 6 - L.skins.length * 14, y: L.pos.y + 30 + L.skins.length * 6, s: s0 }); renderSkins();
  await tween(1700, u => placeLarva(L.pos.x, L.pos.y, lerp(s0, s1, u * u), 1, Math.sin(u * 16) * 2 * (1 - u)));
  L.step = n === 2 ? 'molt2' : 'molt3';
  addFact(L.facts, n === 2 ? 'Between instars a larva molts: it sheds its old skin so it can grow.' : 'Fruit fly larvae have three instars. This is the third!');
  say(n === 2 ? 'I am now a second instar larva. See my old skin? A molt separates each instar.' : 'Third instar! That makes three. I am much bigger now.');
  renderLarvaUi(); S.busy = false;
}
async function doWander() {
  if (S.busy) return; S.busy = true; setMain(null);
  say('A big third instar larva stops eating and wanders away from the food to find a dry place.');
  const from = { ...L.pos };
  await tween(2400, u => placeLarva(lerp(from.x, DRY.x, u), lerp(from.y, DRY.y, u), INSTAR_SCALE[2], 1, Math.sin(u * 26) * 4));
  L.step = 'wander'; addFact(L.facts, 'Late third instar larvae wander away from their food before they become pupae.');
  say('Found a dry spot! The larva stage lasts about 4 days at 25°C. Next comes a big change.'); renderLarvaUi(); S.busy = false;
}
['item-mash', 'item-stone', 'item-leaf'].forEach(id => activate($('#' + id), () => chooseFood(id)));
mods.larva = {
  enter() {
    setDeeper('<p>Larvae (sometimes called maggots) have no legs. Their skin cannot stretch much, so they molt twice. The three larval stages are called first, second and third instars. About 4 days at 25°C is typical for all larval stages together.</p><p>Late third-instar larvae stop feeding and leave the food ("wandering"). Soon after, they stop moving and begin to form the puparium.</p>');
    setFacts(L.facts); renderSkins();
    const s = INSTAR_SCALE[instarOf() - 1];
    if (L.step === 'wander') placeLarva(DRY.x, DRY.y, s); else if (L.step === 'choose') placeLarva(110, 176, s); else placeLarva(MASH.x - 20, MASH.y, s);
    if (L.step === 'choose') say('I hatched! I am a hungry larva and I have no legs. Which of these is my food?');
    else say(S.done.larva ? 'Back to my larva days! Press Next when you are ready.' : 'Where were we?');
    renderLarvaUi();
  }
};

/* =================================================================== CHAPTER 3 · PUPA */
const P = { step: 'form', seen: new Set(), q: { puparium: false, pupa: false }, facts: [], v: 0 };
const BAND_TEXT = {
  early: 'Early pupa: much of the larva’s old body is taken apart while new adult parts begin to form. It looks like it is resting, but a lot is happening.',
  mid: 'Middle: the head, eyes, wings, legs and abdomen are taking shape. This is active development, not sleeping.',
  late: 'Late pupa: the adult fly is almost ready, with red eyes and folded wings. It will soon come out.'
};
const bandOf = v => (v < 36 ? 'early' : v < 70 ? 'mid' : 'late');
function peek(v) {
  P.v = v; const o = clamp(v / 15, 0, 1);
  $('#pCaseImg').setAttribute('opacity', 1 - 0.78 * o); $('#innerBg').setAttribute('opacity', 0.92 * o);
  $('#layerEarly').setAttribute('opacity', v < 3 ? 0 : clamp(1 - (v - 24) / 22, 0, 1));
  $('#layerMid').setAttribute('opacity', clamp(1 - Math.abs(v - 52) / 26, 0, 1));
  $('#layerLate').setAttribute('opacity', clamp((v - 62) / 24, 0, 1));
  $('#peekTag').setAttribute('opacity', v > 2 ? 1 : 0);
}
function pupaUi() {
  setFacts(P.facts);
  $('#caseLabels').setAttribute('opacity', P.q.puparium && P.q.pupa ? 1 : 0);
  hide($('#hit-puparium'), P.step !== 'q'); hide($('#hit-pupa'), P.step !== 'q');
  if (P.step === 'form') {
    $('#pLarva').setAttribute('opacity', 1); $('#pLarva').removeAttribute('transform'); $('#pCase').setAttribute('opacity', 0);
    setTask('Watch what happens to the wandering larva'); setMain('Watch the skin harden', formPuparium, { go: true, ready: true });
  } else {
    $('#pLarva').setAttribute('opacity', 0); $('#pCase').setAttribute('opacity', 1); $('#pCaseImg').style.filter = '';
    if (P.step === 'peek') peekUi(); else if (P.step === 'q') { peekUi(true); quizUi(); } else { peekUi(true); }
  }
  if (S.done.pupa) { setTask(null); nextChapterButton('pupa'); }
}
async function formPuparium() {
  if (S.busy) return; S.busy = true; setMain(null); setTask(null);
  say('The skin of the third instar larva hardens and turns brown. It forms a case called the puparium.');
  await tween(2600, u => {
    $('#pLarva').setAttribute('transform', `rotate(${90 * u} 240 176) scale(${lerp(1, 0.5, u)})`); $('#pLarva').setAttribute('opacity', 1 - clamp((u - 0.35) / 0.5, 0, 1));
    $('#pCase').setAttribute('opacity', clamp((u - 0.3) / 0.6, 0, 1)); $('#pCaseImg').style.filter = `brightness(${lerp(1.7, 1, u)}) saturate(${lerp(0.45, 1, u)})`;
  });
  P.step = 'peek'; addFact(P.facts, 'The puparium forms from the hardened skin of the third instar larva.');
  say('This is the puparium. The pupa is developing inside. Slide to peek in. You choose when to look, but the fly changes all by itself.');
  pupaUi(); S.busy = false;
}
function peekUi(quiet) {
  const box = document.createElement('div');
  box.innerHTML = `<label class="rangelbl" for="peekRange"><span>Early</span><span>Peek inside the puparium</span><span>Late</span></label><input id="peekRange" class="range" type="range" min="0" max="100" step="1" value="${P.v}" aria-valuetext="Not peeking yet">`;
  const r = $('input', box), chips = document.createElement('div'); chips.className = 'chips';
  const lbl = { early: 'Early', mid: 'Middle', late: 'Late' };
  const upd = () => { ['early', 'mid', 'late'].forEach(b => { const c = $('[data-b="' + b + '"]', chips); c.className = 'chip' + (P.seen.has(b) ? ' ok' : ''); }); };
  ['early', 'mid', 'late'].forEach(b => { const c = document.createElement('span'); c.dataset.b = b; c.textContent = lbl[b]; chips.appendChild(c); });
  box.appendChild(chips); setFill(box); upd(); peek(P.v);
  r.addEventListener('input', () => {
    const v = +r.value, b = bandOf(v); peek(v); r.setAttribute('aria-valuetext', v < 3 ? 'Not peeking yet' : lbl[b] + ' pupa');
    if (v >= 3) { if (!P.seen.has(b)) { P.seen.add(b); upd(); say(BAND_TEXT[b]); if (P.step === 'peek' && P.seen.size === 3) { P.step = 'q'; T.later(() => { addFact(P.facts, 'The pupa develops inside the puparium. Adult parts form during metamorphosis, and it is not just sleeping.'); quizStart(); }, 900); } else if (P.step === 'peek') setTask(`Peek at all three times: ${P.seen.size} of 3`); } }
  });
  if (!quiet && P.step === 'peek') setTask(`Peek at all three times: ${P.seen.size} of 3`);
}
function quizStart() { if (S.phase !== 'pupa') return; hide($('#hit-puparium'), false); $('#caseLabels').setAttribute('opacity', 0); say('Now a puzzle! Which part is the PUPARIUM? Tap it in the picture.'); quizUi(); }
function quizUi() {
  hide($('#hit-puparium'), P.step !== 'q'); hide($('#hit-pupa'), P.step !== 'q');
  setTask(!P.q.puparium ? 'Tap the puparium (the hard outer case)' : !P.q.pupa ? 'Tap the pupa (the fly changing inside)' : null);
  setHint(!(P.q.puparium && P.q.pupa) ? 'Help me' : null, () => say(!P.q.puparium ? 'The puparium is the hard brown case on the outside.' : 'The pupa is the soft, changing fly inside the case.'));
}
function answer(which) {
  if (S.phase !== 'pupa' || P.step !== 'q') return;
  const want = !P.q.puparium ? 'puparium' : !P.q.pupa ? 'pupa' : null;
  if (!want) return;
  if (which !== want) { say(which === 'pupa' ? 'That is the pupa, the soft fly changing inside. The puparium is the hard case outside.' : 'That is the hard case. The pupa is the fly changing inside it.'); return; }
  P.q[which] = true; beep(700, 0.12);
  if (which === 'puparium') { say('Yes! The puparium is the hard outer case made from the last larval skin. Now find the pupa inside.'); quizUi(); }
  else {
    addFact(P.facts, 'Puparium = the hard outer case. Pupa = the developing fly inside.'); $('#caseLabels').setAttribute('opacity', 1); P.step = 'done';
    say('Yes! The pupa is inside the puparium. It stays about 4 to 5 days at 25°C while it changes into an adult.'); setFacts(P.facts); setTask(null); setHint(null); quizUi(); chapterDone('pupa');
  }
}
activate($('#hit-puparium'), () => answer('puparium')); activate($('#hit-pupa'), () => answer('pupa'));
// the whole case is also tappable for mouse/touch (hit areas sit on top of it)
mods.pupa = {
  enter() {
    setDeeper('<p>When a third instar larva is ready, it stops moving and its cuticle hardens and darkens. This is called pupariation. The hard case is the puparium and the animal inside is the pupa.</p><p>During metamorphosis many larval tissues are broken down, and adult structures such as the head, eyes, wings and legs develop from groups of cells set aside in the larva. At about 25°C the pupal stage lasts roughly 4 to 5 days.</p>');
    $('#peekTag').setAttribute('opacity', 0);
    if (P.step === 'form') say('I am a big larva and I have stopped eating. Something amazing is about to happen!');
    else say(S.done.pupa ? 'The puparium and the pupa inside. Press Next when you are ready.' : 'Welcome back to the puparium!');
    pupaUi();
  }
};

/* =================================================================== CHAPTER 4 · ADULT */
const A = { step: 'ready', facts: [], found: new Set() };
const PARTS = [
  { id: 'head', label: 'Head', x: 13, y: 62, fact: 'The head holds the eyes, antennae and mouthparts.' },
  { id: 'eye', label: 'Compound eye', x: 20, y: 40, fact: 'A compound eye is made of many tiny lenses. My two big red eyes are compound eyes.' },
  { id: 'antenna', label: 'Antenna', x: 6, y: 44, fact: 'Antennae sense smells and touch. Adults have one pair of antennae.' },
  { id: 'thorax', label: 'Thorax', x: 38, y: 34, fact: 'The thorax is the middle part. The wings and all six legs attach to it.' },
  { id: 'wing', label: 'Wing', x: 70, y: 14, fact: 'A fruit fly has one pair of wings: two wings in total.' },
  { id: 'haltere', label: 'Haltere', x: 55, y: 36, fact: 'Halteres are tiny knobs behind the wings that help flies balance. They are mostly hidden in this picture.' },
  { id: 'abdomen', label: 'Abdomen', x: 80, y: 50, fact: 'The abdomen is the back part, with stripes. It is used for digestion and for reproduction.' },
  { id: 'legs', label: 'Six legs', x: 47, y: 80, fact: 'Insects have six legs, three on each side.' }
];
const emFly = $('#emFly'), emWings = $('#emWings');
function setWings(u) { emWings.setAttribute('transform', `scale(${lerp(0.4, 1, u)} ${lerp(0.5, 1, u)})`); }
function setEmFly(x, y, s, op = 1) { emFly.setAttribute('transform', `translate(${x} ${y}) scale(${s})`); emFly.setAttribute('opacity', op); }
function adultUi() {
  setFacts(A.facts);
  const step = A.step;
  hide($('#anat'), step !== 'anat' && step !== 'done'); $('#emWrap').style.display = (step === 'anat' || step === 'done') ? 'none' : '';
  $('#emCaseSmall').setAttribute('opacity', step === 'anat' || step === 'done' ? 0.75 : 0);
  if (step === 'ready') { setEmFly(240, 190, 2.1, 0); emFly.classList.remove('hard'); setWings(0); $('#emCap').setAttribute('opacity', 0); $('#emCase').setAttribute('opacity', 1); setTask('Drosie is ready to come out!'); setMain('Watch Drosie come out', eclose, { go: true, ready: true }); }
  if (step === 'emerged') { setEmFly(378, 232, 2.4); emFly.classList.remove('hard'); setWings(0); $('#emCase').setAttribute('opacity', 0.7); setTask('The new adult needs to expand its wings'); setMain('Watch the wings', unfold, { go: true, ready: true }); }
  if (step === 'hard') { setEmFly(378, 232, 2.4); emFly.classList.add('hard'); setWings(1); $('#emCase').setAttribute('opacity', 0.7); setTask(null); setMain('Meet adult Drosie →', openAnatomy, { go: true, ready: true }); }
  if (step === 'anat' || step === 'done') {
    buildHots(); setTask(S.done.adult ? null : `Tap the glowing numbers: ${A.found.size} of ${PARTS.length}`);
    if (S.done.adult) nextChapterButton('adult');
  }
}
async function eclose() {
  if (S.busy) return; S.busy = true; setMain(null); setTask(null);
  say('The adult fly pushes off the front end of the puparium and crawls out. This is called eclosion.');
  $('#emCap').setAttribute('opacity', 1); setEmFly(240, 190, 2.1, 1);
  await tween(900, u => { $('#emCap').setAttribute('transform', `translate(${lerp(0, 40, u)} ${lerp(0, -46, u) - 40 * Math.sin(u * Math.PI)}) rotate(${50 * u} 240 92)`); $('#emCap').setAttribute('opacity', 1 - clamp((u - 0.6) / 0.4, 0, 1)); });
  await tween(1700, u => setEmFly(lerp(240, 240, u), lerp(190, 64, u), 2.1, 1));
  emFly.setAttribute('class', 'emfly');
  await tween(1500, u => setEmFly(lerp(240, 378, u), lerp(64, 232, u), lerp(2.1, 2.4, u), 1));
  $('#emCase').setAttribute('opacity', 0.7); setWings(0);
  A.step = 'emerged'; addFact(A.facts, 'The adult comes out of the puparium by eclosion.');
  say('I am out! My body is soft and pale and my wings are crumpled. Let us watch them unfold.'); adultUi(); S.busy = false;
}
async function unfold() {
  if (S.busy) return; S.busy = true; setMain(null); setTask(null);
  say('My wings expand and then harden. My body darkens too. This takes a few hours in real life.');
  const r = tween(5200, u => setWings(u)); emFly.classList.add('hard'); await r;
  A.step = 'hard'; addFact(A.facts, 'A new adult’s wings expand and then harden before it can fly.');
  say('Now my wings are ready. In this game we speed it up. Real wings take a few hours.'); adultUi(); S.busy = false;
}
async function openAnatomy() {
  if (S.busy) return; S.busy = true; setMain(null);
  await tween(500, u => { emFly.setAttribute('opacity', 1 - u); });
  A.step = 'anat'; say('Meet me, an adult fruit fly! Tap the glowing numbers to explore my body.'); adultUi(); S.busy = false;
}
function buildHots() {
  const g = $('#anatHots'); g.innerHTML = '';
  PARTS.forEach((p, i) => {
    const x = 40 + p.x * 4, y = 62 + p.y * 2.66, found = A.found.has(p.id);
    const h = document.createElementNS(NS, 'g'); h.setAttribute('class', 'hot' + (found ? ' found' : '')); h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0');
    h.setAttribute('aria-label', `${p.label}${found ? ' (found)' : ''}`);
    h.innerHTML = `<circle class="pulse" cx="${x}" cy="${y}" r="24"/><circle class="dot" cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y + 6}" text-anchor="middle">${found ? '✓' : i + 1}</text>`;
    if (found && p.id === A.last) { const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'hlabel'); t.setAttribute('x', x); t.setAttribute('y', y - 26); t.setAttribute('text-anchor', 'middle'); t.textContent = p.label; h.appendChild(t); }
    activate(h, () => findPart(p)); g.appendChild(h);
  });
}
function findPart(p) {
  if (S.phase !== 'adult' || (A.step !== 'anat' && A.step !== 'done')) return;
  const first = !A.found.has(p.id); A.found.add(p.id); A.last = p.id; addFact(A.facts, p.fact); say(p.fact); beep(500 + A.found.size * 60, 0.1);
  buildHots(); setFacts(A.facts);
  if (first) { if (A.found.size === PARTS.length) { A.step = 'done'; setTask(null); say('You explored my whole body! I have a head, thorax, abdomen, six legs, compound eyes, antennae, one pair of wings and tiny halteres. When mature, adults can reproduce and start a new generation.'); chapterDone('adult'); } else setTask(`Tap the glowing numbers: ${A.found.size} of ${PARTS.length}`); }
}
mods.adult = {
  enter() {
    setDeeper('<p>Eclosion is when the adult fly emerges from the puparium. A newly emerged fly is pale with crumpled wings. It pumps fluid into its wings to expand them, and then its outer skin hardens and darkens.</p><p>Adults have three body parts (head, thorax, abdomen), six legs, compound eyes, antennae, one pair of wings, and halteres, which are small balancing organs. At about 25°C adults usually appear around day 9 to 10 from egg laying. Mature adults can mate and females lay eggs, which begins the next generation.</p>');
    $('#emCap').removeAttribute('transform');
    if (A.step === 'ready') say('It is time! Inside my puparium I am ready to come out.');
    else say(S.done.adult ? 'My whole body! Press Next for the final challenge.' : 'Welcome back!');
    adultUi();
  }
};

/* =================================================================== CHAPTER 5 · SEQUENCE CHALLENGE */
const STAGES = [
  { id: 'egg', name: 'Egg', src: 'life-cycle-assets/egg.webp', alt: 'A fruit fly egg', hint: 'The very first stage is a tiny egg.' },
  { id: 'larva', name: 'Larva', src: 'life-cycle-assets/larva.webp', alt: 'A legless fruit fly larva', hint: 'The second stage hatches from the egg and eats and grows. It has no legs.' },
  { id: 'pupa', name: 'Pupa', src: 'life-cycle-assets/pupa.webp', alt: 'A brown fruit fly puparium', hint: 'The third stage is inside a hard case while the body changes.' },
  { id: 'adult', name: 'Adult', src: 'life-cycle-assets/adult.webp', alt: 'An adult fruit fly with wings', hint: 'The last stage has six legs and wings, and it can start a new cycle.' }
];
const Q = { placed: [null, null, null, null], sel: null, tries: 0, checked: false, solved: false, wrong: [], hintN: 0, tray: [] };
const slotsEl = $('#slots'), trayEl = $('#tray');
const stageOf = id => STAGES.find(s => s.id === id);
function shuffleTray() {
  let a; do { a = STAGES.map(s => s.id).sort(() => Math.random() - 0.5); } while (a.every((id, i) => id === STAGES[i].id));
  Q.tray = a;
}
function cardEl(id, placed) {
  const s = stageOf(id), b = document.createElement(placed ? 'div' : 'button'); if (!placed) b.type = 'button'; b.className = 'card' + (placed ? ' placed' : ''); b.dataset.id = id;
  if (!placed) b.setAttribute('aria-label', `${s.name} picture`);
  b.innerHTML = `<img src="${s.src}" alt="${s.alt}" draggable="false"><span>${s.name}</span>`;
  return b;
}
function renderSeq() {
  slotsEl.innerHTML = ''; trayEl.innerHTML = '';
  Q.placed.forEach((id, i) => {
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.className = 'slot'; b.dataset.i = i;
    b.setAttribute('aria-label', id ? `Place ${i + 1}: ${stageOf(id).name}` : `Place ${i + 1}, empty`);
    b.innerHTML = `<span class="n" aria-hidden="true">${i + 1}</span>`;
    if (Q.solved || (Q.checked && id && id === STAGES[i].id)) b.classList.add('ok');
    if (Q.wrong.includes(i)) b.classList.add('bad');
    if (id) { const c = cardEl(id, true); c.style.pointerEvents = 'none'; b.appendChild(c); }
    b.addEventListener('click', () => onSlot(i)); li.appendChild(b); slotsEl.appendChild(li);
  });
  Q.tray.filter(id => !Q.placed.includes(id)).forEach(id => {
    const li = document.createElement('li'), c = cardEl(id, false); if (Q.sel === id) { c.classList.add('sel'); c.setAttribute('aria-pressed', 'true'); } else c.setAttribute('aria-pressed', 'false');
    li.appendChild(c); trayEl.appendChild(li); wireCard(c);
  });
  $('#seqHead').textContent = Q.solved ? 'Perfect order!' : 'Put the life cycle in order';
  $('#timeline').hidden = !Q.solved;
  seqControls();
}
function seqControls() {
  const full = Q.placed.every(Boolean);
  if (Q.solved) { setTask(null); setHint(null); finish('seq'); return; }
  setTask(full ? 'Press Check my order' : Q.sel ? 'Now tap a numbered place' : 'Tap a picture, then tap a number');
  setMain('Check my order', checkSeq, { disabled: !full, go: full, ready: full });
  setHint('Hint', hintSeq);
}
function onSlot(i) {
  if (S.phase !== 'seq' || Q.solved) return;
  if (Q.placed[i]) { const id = Q.placed[i]; Q.placed[i] = null; Q.sel = id; Q.wrong = []; say(`${stageOf(id).name} is back. Tap another place.`); }
  else if (Q.sel) { Q.placed[i] = Q.sel; Q.sel = null; Q.wrong = []; beep(520, 0.07); say(`${stageOf(Q.placed[i]).name} goes in place ${i + 1}.`); }
  else { say('First tap a picture, then tap this number.'); return; }
  renderSeq();
}
function wireCard(c) {
  let drag = null;
  c.addEventListener('click', () => { if (c.dataset.suppress) { delete c.dataset.suppress; return; } if (S.phase !== 'seq' || Q.solved) return; Q.sel = Q.sel === c.dataset.id ? null : c.dataset.id; say(Q.sel ? `${stageOf(Q.sel).name} selected. Now tap a numbered place.` : 'Picture put down.'); renderSeq(); const again = $(`#tray .card[data-id="${c.dataset.id}"]`); if (again) again.focus({ preventScroll: true }); });
  c.addEventListener('pointerdown', e => { if (e.button > 0 || Q.solved) return; drag = { x: e.clientX, y: e.clientY, on: false, id: c.dataset.id, ghost: null }; });
  c.addEventListener('pointermove', e => {
    if (!drag) return; if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) { drag.on = true; try { c.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } const g = c.cloneNode(true); g.classList.add('drag'); document.body.appendChild(g); drag.ghost = g; }
    if (drag.on) { drag.ghost.style.left = (e.clientX - 44) + 'px'; drag.ghost.style.top = (e.clientY - 50) + 'px'; $$('.slot').forEach(s => s.classList.remove('over')); const t = document.elementFromPoint(e.clientX, e.clientY); const s = t && t.closest && t.closest('.slot'); if (s) s.classList.add('over'); }
  });
  const end = e => {
    if (!drag) return; const d = drag; drag = null;
    if (d.on) { c.dataset.suppress = '1'; d.ghost.remove(); $$('.slot').forEach(s => s.classList.remove('over')); const t = document.elementFromPoint(e.clientX, e.clientY); const s = t && t.closest && t.closest('.slot'); if (s && !Q.placed[+s.dataset.i]) { Q.sel = d.id; onSlot(+s.dataset.i); } }
  };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', () => { if (drag && drag.ghost) drag.ghost.remove(); drag = null; $$('.slot').forEach(s => s.classList.remove('over')); });
}
function checkSeq() {
  if (S.phase !== 'seq' || Q.solved || !Q.placed.every(Boolean)) return;
  Q.tries++; Q.checked = true; Q.wrong = Q.placed.map((id, i) => (id === STAGES[i].id ? -1 : i)).filter(i => i >= 0);
  if (!Q.wrong.length) {
    Q.solved = true; beep(660, 0.12); setTimeout(() => beep(880, 0.18), 140);
    say('Perfect! Egg, larva, pupa, adult. That is complete metamorphosis. At about 25°C it takes about 9 to 10 days. The timing changes with temperature, diet and genetics.');
    renderSeq(); return;
  }
  say(`Almost! ${Q.wrong.length === 1 ? 'One picture is' : Q.wrong.length + ' pictures are'} in the wrong place. Tap a wrong one to take it back, or press Hint.`);
  renderSeq();
  T.later(() => { Q.wrong = []; if (S.phase === 'seq') renderSeq(); }, 1600);
}
function hintSeq() {
  if (Q.solved) return; Q.hintN++;
  const i = Q.placed.findIndex((id, k) => id !== STAGES[k].id);
  if (i < 0) { say('Everything looks right. Press Check my order!'); return; }
  say(`Place ${i + 1}: ${STAGES[i].hint}`);
  if (Q.placed[i]) { Q.placed[i] = null; Q.sel = null; renderSeq(); }
}
mods.seq = {
  enter() {
    setDeeper('<p>This challenge is about the order of the four major stages: egg, then larva, then pupa, then adult. Because the larva and the adult look so different and there is a pupa in between, this pattern is called complete metamorphosis.</p><p>There is no timer and you can try as many times as you like.</p>');
    if (!Q.tray.length) shuffleTray();
    say(Q.solved ? 'You put my life in the right order! Press the button to see your badge.' : 'Can you put my life in order? Tap a picture, then tap a number. Or drag it.');
    renderSeq();
  }
};

/* =================================================================== CELEBRATE */
mods.done = {
  enter() {
    S.max = CHAPTERS.length; renderTrail(); say('Hooray! You are a Drosie Life Cycle Explorer! You were curious, you looked closely and you learned how a fruit fly grows.');
    setTask(null); setFacts([
      'Egg: about 1 day. A tiny embryo grows inside.', 'Larva: about 4 days. Three instars, separated by molts.',
      'Pupa: about 4 to 5 days. The adult body forms inside the puparium.', 'Adult: emerges around day 9 to 10. Times are approximate at about 25°C.'
    ]);
    const box = document.createElement('div'); box.innerHTML = '<p class="dnote">Times change with temperature, diet and genetic background. This game uses simplified illustrations, not real microscope pictures.</p><div class="links"><a href="/fruit-fly-life-cycle-activities/">Life cycle lesson ideas</a><a href="/climbing-game.html">Play the Climbing Challenge</a><a href="/science-activities/">More science activities</a><a href="/storybook.html">Read the storybook</a></div>';
    setFill(box); setMain('Play again', restartAll, { go: true });
    setDeeper('<p>You practised noticing small details (the egg), observing growth (larval instars), making sense of hidden changes (the pupa), and describing body parts (the adult). Those are real science skills.</p>');
    petals();
  }
};
function petals() {
  if (rm()) return;
  const box = document.createElement('div'); box.className = 'petals'; box.setAttribute('aria-hidden', 'true'); const cols = ['#f6d48c', '#db8669', '#9ccfa2', '#bfe3f2', '#f0b45c'];
  for (let i = 0; i < 18; i++) { const p = document.createElement('i'); p.style.left = rand(0, 100) + 'vw'; p.style.background = cols[i % 5]; p.style.setProperty('--dx', rand(-60, 60) + 'px'); p.style.setProperty('--rot', rand(120, 480) + 'deg'); p.style.animationDuration = rand(4, 7) + 's'; p.style.animationDelay = rand(0, 1.5) + 's'; box.appendChild(p); }
  document.body.appendChild(box); T.later(() => box.remove(), 9000);
}

/* ------------------------------------------------------------ restart + dialogs */
function resetStates() {
  Object.assign(egg, { found: false, parts: new Set(), facts: [], lens: { x: 120, y: 190 }, hints: 0 }); if (egg.dwell) { clearTimeout(egg.dwell); } egg.dwell = null;
  Object.assign(L, { step: 'choose', facts: [], skins: [], tried: new Set(), pos: { x: 110, y: 176 } });
  Object.assign(P, { step: 'form', seen: new Set(), q: { puparium: false, pupa: false }, facts: [], v: 0 });
  Object.assign(A, { step: 'ready', facts: [], found: new Set(), last: null });
  Object.assign(Q, { placed: [null, null, null, null], sel: null, tries: 0, checked: false, solved: false, wrong: [], hintN: 0, tray: [] });
  $('#crumbs').innerHTML = ''; $('#skins').innerHTML = ''; $('#caseLabels').setAttribute('opacity', 0); peek(0);
  S.max = 0; S.done = {};
}
function restartAll() { resetStates(); go('welcome'); }
$('#restartBtn').addEventListener('click', () => { if (S.phase === 'welcome' && S.max === 0) return; $('#restartDlg').showModal(); });
$('#restartDlg').addEventListener('close', e => { if (e.target.returnValue === 'yes') restartAll(); });
$('#notesBtn').addEventListener('click', () => $('#notesDlg').showModal());
$('#prefBtn').addEventListener('click', () => $('#prefDlg').showModal());
$$('[data-pref]').forEach(i => i.addEventListener('change', () => { prefs[i.dataset.pref] = i.checked; savePrefs(); applyPrefs(); if (i.dataset.pref === 'sound' && i.checked) beep(600, 0.1); }));
$('#prefReset').addEventListener('click', () => { Object.keys(prefs).forEach(k => { prefs[k] = false; }); savePrefs(); applyPrefs(); });
window.addEventListener('resize', () => { $$('.card.drag').forEach(n => n.remove()); });

/* ------------------------------------------------------------ init */
applyPrefs(); renderTrail(); go('welcome'); booted = true;
window.__lc = { S, egg, L, P, A, Q, PARTS, go, EGG_POS, prefs, STAGES };
})();
