/**
 * Drosie Genetics Lab — application shell: state, persistence, HUD, room, dialogs,
 * mission event bus, achievements, settings. Station UIs live in js/stations/.
 */
import * as G from './engine/index.js';
import { STOCK_DEFS, buildStock, validateStocks } from './stocks.js';
import { labSceneSVG, STATIONS, drMayaSVG, drosieSVG } from './lab-scene.js';
import { MISSIONS, MODES, missionsForMode, newProgress, applyEvent } from './missions.js';
import { sfx, speak, audioSettings, stopSpeaking } from './audio.js';
import { renderStocks } from './stations/stocks-station.js';
import { renderBreeding } from './stations/breeding-station.js';
import { renderMicroscope } from './stations/microscope-station.js';
import { renderPunnett } from './stations/punnett-station.js';
import { renderChromosomes } from './stations/chromosome-station.js';
import { renderAnalysis } from './stations/analysis-station.js';
import { renderNotebook } from './stations/notebook-station.js';
import { renderMissions } from './stations/missions-station.js';

const STORE_KEY = 'drosie-genetics-lab:v1';
const RENDERERS = { stocks: renderStocks, breeding: renderBreeding, microscope: renderMicroscope, punnett: renderPunnett,
  chromosomes: renderChromosomes, analysis: renderAnalysis, notebook: renderNotebook, missions: renderMissions };

const ACHIEVEMENTS = [
  { id: 'first-cross', name: 'First Cross', desc: 'Raised your first vial of offspring.', test: s => s.records.length >= 1 },
  { id: 'big-data', name: 'Big Data', desc: 'Scored 1,000 offspring in one cross.', test: s => s.records.some(r => r.n >= 1000) },
  { id: 'f2', name: 'Two Generations', desc: 'Bred flies you raised yourself.', test: s => s.records.some(r => r.motherOrigin === 'kept' || r.fatherOrigin === 'kept') },
  { id: 'stat', name: 'Statistician', desc: 'Ran a chi-square test.', test: s => s.flags.chi },
  { id: 'map', name: 'Mapmaker', desc: 'Estimated a recombination frequency.', test: s => s.flags.rf },
  { id: 'morgan', name: "Morgan's Apprentice", desc: 'Completed The mystery of white eyes.', test: s => s.missions.R1?.complete },
  { id: 'notebook', name: 'Careful Recorder', desc: 'Saved a notebook entry.', test: s => s.notebook.length >= 1 },
  { id: 'three', name: 'Rising Researcher', desc: 'Completed 3 missions.', test: s => Object.values(s.missions).filter(m => m.complete).length >= 3 },
  { id: 'all', name: 'Fly Lab Legend', desc: 'Completed every mission.', test: s => MISSIONS.every(m => s.missions[m.id]?.complete) }
];

function defaults() {
  return {
    version: 1, mode: null, settings: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, contrast: false, textScale: 1, sound: false, narration: false },
    mother: null, father: null, collected: [], records: [], notebook: [], missions: {}, activeMission: null,
    achievements: [], flags: {}, visited: {}, secret: (Math.random() * 1e9) | 0, nextSeed: (Math.random() * 1e9) | 0,
    engine: { mapping: 'kosambi' }, punnettMode: 'guided', viewMode: {}
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return { ...defaults(), ...s, settings: { ...defaults().settings, ...(s.settings || {}) } };
  } catch { return null; }
}

export const app = {
  state: load() || defaults(),
  G, STOCK_DEFS, MISSIONS, MODES, STATIONS,
  current: null, params: {},
  crossCache: new Map(),
  save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch { /* storage full or disabled: progress is optional */ } },
  mode() { return this.state.mode || 'junior'; },
  level() { return ['little', 'junior', 'researcher', 'university'].indexOf(this.mode()); },
  esc,

  /** Genotype display adapted to the current mode. */
  genoHTML(fly, { hidden = false } = {}) {
    if (hidden) return '<span class="geno mystery" title="Hidden — design a testcross!">? / ?</span>';
    if (!fly) return '';
    const m = this.mode();
    if (m === 'little') return '';
    if (m === 'junior') return `<span class="geno">${G.formatShorthand(fly)}</span>`;
    return `<span class="geno">${G.formatGenotype(fly, { style: 'html' })}</span>`;
  },
  genoText(fly) { return G.formatGenotype(fly, { style: 'text' }); },
  phen(fly) { return G.phenotypeOf(fly); },

  crossFor(rec) {
    const k = rec.id;
    if (!this.crossCache.has(k)) this.crossCache.set(k, G.cross(rec.mother, rec.father, rec.opts || {}));
    return this.crossCache.get(k);
  },
  getRecord(id) { return this.state.records.find(r => r.id === id); },
  lastRecordWhere(fn) { return [...this.state.records].reverse().find(fn); },
  mysteryFly() { return buildStock(STOCK_DEFS.find(d => d.id === 'mystery'), 'F', this.state.secret); },
  stockFly(id, sex) { return buildStock(STOCK_DEFS.find(d => d.id === id), sex, this.state.secret); },

  setParent(role, entry) {
    this.state[role] = entry;
    this.save();
    this.emit({ type: 'parents', mother: this.state.mother?.fly, father: this.state.father?.fly });
    toast(`${role === 'mother' ? '♀ Mother' : '♂ Father'} selected: ${entry.name}`);
    sfx('click');
    updateHud();
  },

  emit(ev) {
    let any = false;
    for (const m of missionsForMode(this.mode())) {
      const p = (this.state.missions[m.id] ||= newProgress());
      const before = JSON.stringify(p.steps);
      if (applyEvent(m, p, ev, this)) {
        any = true;
        if (JSON.stringify(p.steps) !== before && (this.state.activeMission === m.id)) {
          toast(`Mission step complete — ${m.title}`, 'good'); sfx('step');
        }
        if (p.complete) { toast(`Mission complete: ${m.title}!`, 'good'); sfx('success'); }
      }
    }
    if (ev.type === 'chi') this.state.flags.chi = true;
    if (ev.type === 'rf') this.state.flags.rf = true;
    checkAchievements();
    this.save();
    if (any) updateHud();
  },

  open(id, params = {}) { openStation(id, params); },
  rerender() { if (this.current) openStation(this.current, this.params, true); },
  toast, dialog: showDialog, modal: showModal, closeModal, sfx, updateHud: () => updateHud(),
  nextSeed() { const s = this.state.nextSeed >>> 0; this.state.nextSeed = (G.mulberry32(s)() * 4294967296) >>> 0; return s; }
};

/* ------------------------------------------------------------------ */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

function applySettings() {
  const s = app.state.settings;
  document.documentElement.classList.toggle('reduced-motion', !!s.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', !!s.contrast);
  document.documentElement.style.setProperty('--text-scale', s.textScale);
  audioSettings.sound = !!s.sound; audioSettings.narration = !!s.narration;
}

function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!app.state.achievements.includes(a.id) && a.test(app.state)) {
      app.state.achievements.push(a.id);
      toast(`🏅 Achievement: ${a.name}`, 'gold'); sfx('success');
    }
  }
}

/* ------------------------------ Toasts ------------------------------ */
function toast(msg, kind = '') {
  const box = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast ${kind}`; t.textContent = msg;
  box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  document.getElementById('live').textContent = msg;
  setTimeout(() => t.classList.add('out'), 3200);
  setTimeout(() => t.remove(), 3800);
}

/* ------------------------------ Modal ------------------------------- */
let lastFocus = null;
function showModal(html, { title = '', wide = false, onMount } = {}) {
  const m = document.getElementById('modal');
  lastFocus = document.activeElement;
  m.innerHTML = `<div class="modal-card ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <header><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">✕</button></header>
    <div class="modal-body">${html}</div></div>`;
  m.hidden = false;
  m.querySelector('[data-close]').onclick = closeModal;
  m.onclick = e => { if (e.target === m) closeModal(); };
  onMount?.(m.querySelector('.modal-body'));
  m.querySelector('button, input, select, textarea, [tabindex]')?.focus();
}
function closeModal() { const m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; lastFocus?.focus?.(); }

/* ------------------------------ Dialog ------------------------------ */
let dialogQueue = [];
function showDialog(lines, { who = 'maya', mood = 'smile' } = {}) {
  dialogQueue = Array.isArray(lines) ? [...lines] : [lines];
  nextDialog(who, mood);
}
function nextDialog(who, mood) {
  const d = document.getElementById('dialog');
  if (!dialogQueue.length) { d.hidden = true; stopSpeaking(); return; }
  const line = dialogQueue.shift();
  const portrait = who === 'drosie' ? drosieSVG(78) : drMayaSVG(80, mood);
  d.innerHTML = `<div class="dialog-portrait">${portrait}</div>
    <div class="dialog-text"><strong>${who === 'drosie' ? 'Drosie' : 'Dr. Maya'}</strong><p>${line}</p></div>
    <button class="btn primary" id="dialog-next">${dialogQueue.length ? 'Next ›' : 'Got it!'}</button>`;
  d.hidden = false;
  speak(line);
  sfx('bubble');
  const b = d.querySelector('#dialog-next');
  b.onclick = () => nextDialog(who, mood);
  b.focus();
}

const STATION_INTROS = {
  stocks: ['This is our Fly Stock Center. Every vial holds a different <em>stock</em> — a population of flies kept for its traits.', 'Pick a <strong>female</strong> as the mother and a <strong>male</strong> as the father. Look closely: females are bigger with a pointed, striped abdomen; males are smaller with a dark, rounded tail and tiny <em>sex combs</em> on their front legs.'],
  breeding: ['Put a mother and a father in a vial and the incubator does the rest. Each offspring gets one set of chromosomes from each parent.', 'Every result here is <strong>simulated</strong> from the real rules of inheritance — not measured in a real lab. Use a seed number if you want to repeat a result exactly.'],
  microscope: ['Fruit flies are only about 3 mm long. Use the zoom, focus and light controls to see eyes, wings, bristles and body color.'],
  punnett: ['A Punnett square pairs each kind of egg with each kind of sperm. Each box is one possible offspring — the edges tell you how likely it is.'],
  chromosomes: ['<em>Drosophila melanogaster</em> has four chromosome pairs: the X/Y sex chromosomes and autosomes 2, 3 and the tiny dot chromosome 4.', 'Genes sit at positions along chromosomes. In females, homologous chromosomes can swap pieces — crossing over. Fly males don\'t do this at all!'],
  analysis: ['Data time! Compare what you observed with what a hypothesis predicts. A chi-square test tells you whether the difference is bigger than chance usually produces.'],
  notebook: ['Good scientists write everything down: the question, the prediction, the cross, the data, and what might have gone wrong.'],
  missions: ['Pick a research mission. Each one is a real experiment — you\'ll need to breed flies, observe them and analyze your data.']
};

/* --------------------------- Stations ------------------------------- */
function openStation(id, params = {}, silent = false) {
  const st = STATIONS.find(s => s.id === id);
  if (!st) return;
  app.current = id; app.params = params;
  const panel = document.getElementById('station');
  const body = panel.querySelector('.station-body');
  panel.querySelector('.station-title').textContent = st.name;
  panel.dataset.station = id;
  if (panel.hidden) { panel.hidden = false; if (!silent) sfx('open'); }
  document.body.classList.add('station-open');
  document.getElementById('room').setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.station-nav button').forEach(b => b.setAttribute('aria-current', b.dataset.go === id ? 'page' : 'false'));
  const scroll = silent ? body.scrollTop : 0;
  try { RENDERERS[id](app, body, params); }
  catch (e) { console.error(e); body.innerHTML = `<div class="callout bad">Something went wrong in this station: ${esc(e.message)}</div>`; }
  body.scrollTop = scroll;
  if (!silent) panel.querySelector('.station-title').focus();
  if (!app.state.visited[id] && !silent) {
    app.state.visited[id] = true; app.save();
    if (app.mode() !== 'university' || id === 'missions') showDialog(STATION_INTROS[id]);
  }
}
function closeStation() {
  const panel = document.getElementById('station');
  panel.hidden = true; app.current = null;
  document.body.classList.remove('station-open');
  document.getElementById('room').removeAttribute('aria-hidden');
  document.querySelector('.station-nav button[aria-current="page"]')?.setAttribute('aria-current', 'false');
  document.querySelector('#lab-svg .station')?.focus();
}

/* ------------------------------ HUD -------------------------------- */
function updateHud() {
  const m = app.state.activeMission && MISSIONS.find(x => x.id === app.state.activeMission);
  const chip = document.getElementById('mission-chip');
  if (m) {
    const p = app.state.missions[m.id] || newProgress();
    const done = m.steps.filter(s => p.steps[s.id]).length;
    const next = m.steps.find(s => !p.steps[s.id]);
    chip.innerHTML = `<span class="chip-k">Mission</span> <b>${esc(m.title)}</b> <span class="chip-prog">${p.complete ? '✓ complete' : `${done}/${m.steps.length}${next ? ' · ' + esc(next.text) : ' · answer the question'}`}</span>`;
    chip.hidden = false;
  } else chip.hidden = true;
  const mm = MODES[app.mode()];
  document.getElementById('mode-btn').innerHTML = `<span class="dot" style="background:${mm.color}"></span>${mm.name}`;
  document.getElementById('ach-count').textContent = app.state.achievements.length;
  const par = document.getElementById('parent-chip');
  const mo = app.state.mother, fa = app.state.father;
  par.innerHTML = `<span title="Mother">♀ ${mo ? esc(mo.name) : '—'}</span><span title="Father">♂ ${fa ? esc(fa.name) : '—'}</span>`;
}

function chooseMode(first = false) {
  const cards = Object.entries(MODES).map(([k, m]) => `
    <button class="mode-card ${app.state.mode === k ? 'sel' : ''}" data-mode="${k}" style="--c:${m.color}">
      <span class="mode-name">${m.name}</span><span class="mode-ages">${m.ages}</span>
      <span class="mode-desc">${{
        little: 'Observe flies, make predictions, compare babies with parents. Pictures, no notation.',
        junior: 'Genes, alleles, dominant & recessive, Punnett squares, probability and variation.',
        researcher: 'Sex linkage, dihybrid crosses, testcrosses, linkage, recombination and chi-square.',
        university: 'FlyBase notation, balancers, lethals, linkage mapping, statistics, assumptions.' }[k]}</span>
    </button>`).join('');
  showModal(`<p class="lead">${first ? 'Welcome to the lab! ' : ''}Choose a level. You can change it any time — your progress is kept.</p><div class="mode-grid">${cards}</div>`,
    { title: 'Choose your level', wide: true, onMount: body => body.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
      app.state.mode = b.dataset.mode; app.save(); closeModal(); updateHud(); sfx('success');
      if (app.current) app.rerender();
      if (first) introDialog();
    }) });
}

function introDialog() {
  const m = app.mode();
  const lines = {
    little: ['Hi! I\'m Dr. Maya, and this is Drosie — a fruit fly! 🪰', 'Fruit flies have babies very fast, so scientists love to study them. Let\'s look at some flies and see how they are different!', 'Tap the <strong>Challenge Board</strong> to start your first mission.'],
    junior: ['Welcome to the Drosie Genetics Lab! I\'m Dr. Maya.', 'Fruit flies (<em>Drosophila melanogaster</em>) have helped scientists discover how traits are inherited for over 100 years.', 'Start at the <strong>Challenge Board</strong>, or explore the <strong>Fly Stock Center</strong> and set up your own crosses.'],
    researcher: ['Welcome, researcher. Everything here runs on a real inheritance engine: X-linkage, independent assortment, linkage and recombination.', 'Your missions will take you through Morgan\'s classic experiments. Results are simulated — but the statistics are real.'],
    university: ['Welcome. Genotypes use FlyBase-style notation; allele data are compiled from FlyBase records and checked by the developer, and model assumptions are documented in the reference pages.', 'Note the key Drosophila specifics: no meiotic crossing over in males, recessive lethality of Cy and Sb1, and a simplified CyO balancer model.']
  }[m];
  showDialog(lines);
}

function settingsModal() {
  const s = app.state.settings;
  showModal(`
    <form class="settings" onsubmit="return false">
      <label class="switch"><input type="checkbox" name="reducedMotion" ${s.reducedMotion ? 'checked' : ''}> Reduce motion</label>
      <label class="switch"><input type="checkbox" name="contrast" ${s.contrast ? 'checked' : ''}> High contrast</label>
      <label class="switch"><input type="checkbox" name="sound" ${s.sound ? 'checked' : ''}> Sound effects</label>
      <label class="switch"><input type="checkbox" name="narration" ${s.narration ? 'checked' : ''}> Read dialogue aloud (narration)</label>
      <label>Text size <select name="textScale">${[1, 1.15, 1.3].map(v => `<option value="${v}" ${s.textScale == v ? 'selected' : ''}>${Math.round(v * 100)}%</option>`).join('')}</select></label>
      <hr>
      <p class="small">Progress is saved only in this browser (localStorage). No account, no server.</p>
      <div class="row"><button class="btn" id="export-progress">Export progress (JSON)</button><button class="btn danger" id="reset">Reset all progress…</button></div>
    </form>`, { title: 'Settings & accessibility', onMount: body => {
    body.querySelectorAll('input[type=checkbox]').forEach(i => i.onchange = () => { s[i.name] = i.checked; app.save(); applySettings(); if (i.name === 'sound' && i.checked) sfx('success'); });
    body.querySelector('select').onchange = e => { s.textScale = +e.target.value; app.save(); applySettings(); };
    body.querySelector('#export-progress').onclick = () => {
      const blob = new Blob([JSON.stringify(app.state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'drosie-progress.json'; a.click();
    };
    body.querySelector('#reset').onclick = () => {
      showModal(`<p>This deletes all crosses, kept flies, notebook entries, mission progress and achievements stored in this browser. This cannot be undone.</p>
        <div class="row"><button class="btn" data-close2>Cancel</button><button class="btn danger" id="really">Yes, reset everything</button></div>`,
      { title: 'Reset progress?', onMount: b2 => {
        b2.querySelector('[data-close2]').onclick = closeModal;
        b2.querySelector('#really').onclick = () => { localStorage.removeItem(STORE_KEY); app.state = defaults(); app.crossCache.clear(); closeModal(); closeStation(); applySettings(); updateHud(); chooseMode(true); };
      } });
    };
  } });
}

function achievementsModal() {
  showModal(`<ul class="ach-list">${ACHIEVEMENTS.map(a => {
    const got = app.state.achievements.includes(a.id);
    return `<li class="${got ? 'got' : ''}"><span class="medal" aria-hidden="true">${got ? '🏅' : '○'}</span><div><b>${a.name}</b><small>${a.desc}</small></div><span class="sr-only">${got ? 'earned' : 'not yet earned'}</span></li>`;
  }).join('')}</ul>`, { title: 'Achievements' });
}

/* ------------------------------ Boot ------------------------------- */
function positionLabels() {
  document.querySelectorAll('#lab-svg .station').forEach(g => {
    const lab = g.querySelector('.station-label');
    lab.style.display = 'none';
    const bb = g.getBBox();
    lab.style.display = '';
    const text = lab.querySelector('text');
    text.setAttribute('x', 0); text.setAttribute('y', 0);
    const tw = text.getComputedTextLength ? text.getComputedTextLength() : 150;
    const w = tw + 30, x = bb.x + bb.width / 2 - w / 2, y = bb.y - 40;
    lab.querySelector('rect').setAttribute('x', x); lab.querySelector('rect').setAttribute('y', y); lab.querySelector('rect').setAttribute('width', w);
    text.setAttribute('x', x + w / 2); text.setAttribute('y', y + 20); text.setAttribute('text-anchor', 'middle');
  });
}

export function boot() {
  validateStocks();
  // URL presets for teachers: ?mode=junior|little|researcher|university  &demo=1 (large text, no intro)  &mission=R1
  const q = new URLSearchParams(location.search);
  if (MODES[q.get('mode')]) app.state.mode = q.get('mode');
  if (q.get('demo') === '1') { app.state.settings.textScale = 1.3; app.state.visited = Object.fromEntries(STATIONS.map(s => [s.id, true])); }
  if (q.get('mission') && MISSIONS.some(m => m.id === q.get('mission'))) app.state.activeMission = q.get('mission');
  applySettings();
  document.getElementById('room').innerHTML = labSceneSVG();
  positionLabels();
  document.querySelectorAll('#lab-svg .station').forEach(g => {
    const go = () => openStation(g.dataset.station);
    g.addEventListener('click', go);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  document.querySelector('.station-nav').innerHTML = STATIONS.map(s => `<button data-go="${s.id}" title="${s.blurb}">${s.short}</button>`).join('');
  document.querySelectorAll('.station-nav button').forEach(b => b.onclick = () => openStation(b.dataset.go));
  document.getElementById('station-close').onclick = closeStation;
  document.getElementById('mode-btn').onclick = () => chooseMode(false);
  document.getElementById('settings-btn').onclick = settingsModal;
  document.getElementById('ach-btn').onclick = achievementsModal;
  document.getElementById('help-btn').onclick = introDialog;
  document.getElementById('mission-chip').onclick = () => openStation('missions', { id: app.state.activeMission });
  document.getElementById('parent-chip').onclick = () => openStation('breeding');
  document.getElementById('drosie-fly').addEventListener('click', drosieFact);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!document.getElementById('modal').hidden) closeModal();
      else if (!document.getElementById('dialog').hidden) { dialogQueue = []; nextDialog(); }
      else if (app.current) closeStation();
    }
  });
  updateHud();
  if (!app.state.mode) chooseMode(true);
  window.__drosie = app; // for debugging and automated QA
}

const FACTS = [
  'In 1910 Thomas Hunt Morgan found a single white-eyed male. That one fly helped prove that genes are on chromosomes!',
  'Alfred Sturtevant made the first genetic map in 1913 — as an undergraduate — using crossing-over frequencies in flies like me.',
  'Male fruit flies like me don\'t do meiotic crossing over at all. Weird, but true!',
  'Lenore Ward described the Curly mutation in the 1920s. In 2015 scientists finally found its gene: Dual oxidase (Duox).',
  'In fruit flies, the Y chromosome doesn\'t make you male — the ratio of X chromosomes to autosomes does. The Y is needed for male fertility.',
  'A fruit fly generation takes about 10 days at 25 °C. That\'s why geneticists love us!',
  'Calvin Bridges studied flies with unusual numbers of X chromosomes and showed that chromosome behavior explains inheritance.'
];
let factI = 0;
function drosieFact() { showDialog([FACTS[factI++ % FACTS.length]], { who: 'drosie' }); }

export { esc };
