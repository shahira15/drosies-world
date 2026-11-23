/* Drosie's Fly Lab · core: helpers, preferences, read-aloud, saved progress, mission map, notebook (Chapters 1 and 5) */
(() => {
'use strict';
const FL = window.FL = window.FL || {};

/* ---------------------------------------------------------------- helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const NS = 'http://www.w3.org/2000/svg';
const hide = (n, v) => n.toggleAttribute('hidden', !!v);            // the hidden property does not exist on SVG elements
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
Object.assign(FL, { $, $$, rand, clamp, lerp, NS, hide, esc });

const el = {
  gm: $('#gm'), stage: $('#stage'), title: $('#chTitle'), label: $('#chLabel'), coach: $('#coachText'), sr: $('#sr'),
  task: $('#task'), taskText: $('#taskText'), facts: $('#facts'), main: $('#mainBtn'), back: $('#backBtn'), hint: $('#hintBtn'),
  fill: $('#fillSlot'), deeper: $('#deeperBody'), deeperBox: $('#deeper'), trail: $('#trail'),
  read: $('#readBtn'), readLbl: $('#readLbl'), pause: $('#pauseBtn'), readMsg: $('#readMsg')
};
FL.el = el;

/* ---------------------------------------------------------------- preferences (device only) */
const PREF_KEY = 'drosie-flylab-prefs-v1';
const prefs = { large: false, contrast: false, motion: false, easy: false, spacing: false, calm: false };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* storage may be blocked */ }
const rm = () => prefs.motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyPrefs() {
  const h = document.documentElement;
  h.classList.toggle('large', !!prefs.large); h.classList.toggle('contrast', !!prefs.contrast); h.classList.toggle('rm', !!prefs.motion);
  h.classList.toggle('easy', !!prefs.easy); h.classList.toggle('spacing', !!prefs.spacing); h.classList.toggle('calm', !!prefs.calm);
  $$('[data-pref]').forEach(i => { i.checked = !!prefs[i.dataset.pref]; });
}
$$('[data-pref]').forEach(i => i.addEventListener('change', () => { prefs[i.dataset.pref] = i.checked; try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } applyPrefs(); }));
$('#prefReset').addEventListener('click', () => { Object.keys(prefs).forEach(k => { prefs[k] = false; }); try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } applyPrefs(); });
$('#prefBtn').addEventListener('click', () => $('#prefDlg').showModal());
$('#notesBtn').addEventListener('click', () => $('#notesDlg').showModal());
Object.assign(FL, { prefs, rm });

/* ---------------------------------------------------------------- timers and animation (cancelled on navigation) */
let token = 0;
const T = { ids: new Set(), later(fn, ms) { const my = token; const id = setTimeout(() => { T.ids.delete(id); if (my === token) fn(); }, ms); T.ids.add(id); return id; }, clear() { T.ids.forEach(clearTimeout); T.ids.clear(); } };
const wait = ms => new Promise(res => { if (rm()) ms = Math.min(ms, 30); T.later(() => res(), ms); });
function tween(dur, fn, ease = u => u * u * (3 - 2 * u)) {
  const my = token;
  return new Promise(res => {
    if (rm() || dur <= 0) { fn(1); res(); return; }
    const t0 = performance.now();
    (function f(now) { if (my !== token) return; const u = clamp((now - t0) / dur, 0, 1); fn(ease(u)); if (u < 1) requestAnimationFrame(f); else res(); })(t0);
  });
}
Object.assign(FL, { T, wait, tween, token: () => token });

/* ---------------------------------------------------------------- optional read-aloud (never autoplays) */
const speech = { ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, speaking: false, paused: false, text: '' };
function pickVoice() { try { const v = speechSynthesis.getVoices(); return v.find(x => /^en/i.test(x.lang) && /samantha|zira|jenny|aria|google us/i.test(x.name)) || v.find(x => /^en/i.test(x.lang)) || null; } catch (e) { return null; } }
function setReadUi() { el.readLbl.textContent = speech.speaking ? 'Stop' : 'Read aloud'; el.pause.hidden = !speech.speaking; el.pause.textContent = speech.paused ? 'Resume' : 'Pause'; }
function stopSpeech() { if (speech.ok) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } } speech.speaking = false; speech.paused = false; setReadUi(); }
function speak(text) {
  if (!speech.ok) { el.readMsg.textContent = 'Read-aloud is not available on this device. The words are shown on screen.'; return; }
  if (speech.speaking) { stopSpeech(); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); const v = pickVoice(); if (v) u.voice = v; u.lang = (v && v.lang) || 'en-US'; u.rate = 0.92; u.pitch = 1.05;
    u.onend = u.onerror = () => { speech.speaking = false; speech.paused = false; setReadUi(); };
    speech.speaking = true; speech.paused = false; el.readMsg.textContent = ''; setReadUi(); speechSynthesis.speak(u);
  } catch (e) { speech.speaking = false; el.readMsg.textContent = 'Read-aloud could not start.'; setReadUi(); }
}
el.read.addEventListener('click', () => speak(speech.text || el.coach.textContent));
el.pause.addEventListener('click', () => { if (!speech.speaking) return; try { if (speech.paused) { speechSynthesis.resume(); speech.paused = false; } else { speechSynthesis.pause(); speech.paused = true; } } catch (e) { /* ignore */ } setReadUi(); });
if (!speech.ok) { el.read.disabled = true; el.readMsg.textContent = 'Read-aloud is not available in this browser.'; }
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
window.addEventListener('pagehide', stopSpeech);
Object.assign(FL, { speak, stopSpeech, speech });

/* ---------------------------------------------------------------- game data saved on this device for this browser session only */
const SAVE_KEY = 'drosie-flylab-session-v1';
const fresh = () => ({
  v: 1, phase: 'welcome', max: 0, done: {},
  pre: [null, null, null, null, null], post: [null, null, null, null, null], qi: { pre: 0, post: 0 }, opened: { pre: false, post: false }, qdone: { pre: false, post: false },
  results: false, food: { added: [], cooked: false, poured: false, tried: [] },
  setup: { inspected: [], labels: [], doorOpen: false, placed: false, temp: null, closed: false },
  obs: { unlocked: 0, v: 0, rec: Array.from({ length: 6 }, () => ({ looked: false, sticker: null, note: '', answered: false, tries: 0 })) }
});
let D = fresh();
try { const s = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1) { D = Object.assign(fresh(), s); } } catch (e) { /* ignore */ }
const hadSave = D.phase !== 'welcome' || D.max > 0;
function save() { try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } }
FL.D = () => D; FL.save = save; FL.hadSave = hadSave;
FL.resets = [];
FL.restartAll = () => { D = fresh(); try { sessionStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } FL.resets.forEach(f => f()); go('welcome'); };
FL.setD = v => { D = v; };

/* ---------------------------------------------------------------- panel helpers */
const S = { phase: 'welcome', busy: false, mainAction: null, hintAction: null, backAction: null };
FL.S = S;
function say(text) { el.coach.textContent = text; speech.text = text; el.sr.textContent = ''; setTimeout(() => { el.sr.textContent = text; }, 30); if (speech.speaking) stopSpeech(); }
function setTask(t) { el.task.hidden = !t; el.taskText.textContent = t || ''; }
function setFacts(list) { el.facts.innerHTML = ''; list.forEach(t => { const li = document.createElement('li'); li.textContent = t; el.facts.appendChild(li); }); }
function addFact(list, t) { if (!list.includes(t)) { list.push(t); const li = document.createElement('li'); li.textContent = t; el.facts.appendChild(li); } }
function setMain(label, action, o = {}) { el.main.hidden = !label; el.main.textContent = label || ''; el.main.disabled = !!o.disabled; el.main.className = 'btn' + (o.go ? ' go' : '') + (o.ready ? ' ready' : ''); S.mainAction = action || null; }
function setHint(label, action) { el.hint.hidden = !label; el.hint.textContent = label || ''; S.hintAction = action || null; }
function setBack(label, action) { el.back.hidden = !label; el.back.textContent = label || '← Back'; S.backAction = action || null; }
function setFill(node) { el.fill.textContent = ''; if (node) el.fill.appendChild(node); }
function setDeeper(html) { el.deeper.innerHTML = html; el.deeperBox.open = false; el.deeperBox.hidden = !html; }
el.main.addEventListener('click', () => { if (S.busy || el.main.disabled || !S.mainAction) return; S.mainAction(); });
el.hint.addEventListener('click', () => { if (S.hintAction) S.hintAction(); });
el.back.addEventListener('click', () => { if (S.backAction) S.backAction(); else { const i = CH.findIndex(c => c.id === S.phase); go(i > 0 ? CH[i - 1].id : 'welcome'); } });
function activate(node, fn) {
  node.addEventListener('click', e => { e.stopPropagation(); fn(e); });
  node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
}
Object.assign(FL, { say, setTask, setFacts, addFact, setMain, setHint, setBack, setFill, setDeeper, activate });

/* ---------------------------------------------------------------- mission map + navigation */
const CH = [
  { id: 'notebook', name: 'Ask', title: "The Scientist's Notebook", label: 'Chapter 1 · Ask', scene: 'notebook' },
  { id: 'food', name: 'Prepare', title: 'Prepare the Fly Food', label: 'Chapter 2 · Prepare', scene: 'food' },
  { id: 'setup', name: 'Set up', title: 'Set Up the Fly Culture', label: 'Chapter 3 · Set up', scene: 'lab' },
  { id: 'observe', name: 'Observe', title: 'Observe Development', label: 'Chapter 4 · Observe', scene: 'lab' },
  { id: 'results', name: 'Record', title: "The Scientist's Results", label: 'Chapter 5 · Record', scene: 'notebook' },
  { id: 'badge', name: 'Explain', title: 'My Lab Report and Scientist Badge', label: 'Chapter 6 · Explain', scene: 'badge' }
];
FL.CH = CH;
const chIndex = id => CH.findIndex(c => c.id === id);
function renderTrail() {
  el.trail.innerHTML = '';
  CH.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button';
    const st = D.done[c.id] ? 'done' : (S.phase === c.id ? 'now' : ''); if (st) b.classList.add(st);
    b.disabled = i > D.max;
    b.setAttribute('aria-label', `${c.label}: ${c.title}${D.done[c.id] ? ' (finished)' : ''}${i > D.max ? ' (locked)' : ''}`);
    if (S.phase === c.id) b.setAttribute('aria-current', 'step');
    b.innerHTML = `<b aria-hidden="true">${D.done[c.id] ? '✓' : i + 1}</b><span class="lbl">${c.name}</span>`;
    b.addEventListener('click', () => { if (i <= D.max) go(c.id); });
    el.trail.appendChild(b);
  });
}
FL.renderTrail = renderTrail;
function nextChapterButton(id) {
  const i = chIndex(id), next = CH[i + 1];
  setMain(next ? `Next: ${next.title} →` : 'Finish', () => go(next ? next.id : 'welcome'), { go: true, ready: true });
}
function chapterDone(id) { D.done[id] = true; D.max = Math.max(D.max, chIndex(id) + 1); save(); renderTrail(); nextChapterButton(id); }
function finish(id) { if (D.done[id]) nextChapterButton(id); else chapterDone(id); }
Object.assign(FL, { nextChapterButton, chapterDone, finish, chIndex });

const mods = FL.mods = {};
let booted = false;
function go(phase) {
  token++; T.clear(); stopSpeech(); S.busy = false; S.phase = phase; D.phase = phase; if (phase !== 'welcome') D.last = phase; save();
  $$('.petals').forEach(n => n.remove());
  const sceneId = phase === 'welcome' ? 'scene-welcome' : 'scene-' + CH[chIndex(phase)].scene;
  $$('.scene').forEach(s => hide(s, s.id !== sceneId));
  el.stage.dataset.ch = phase; el.gm.dataset.ch = phase;
  const c = CH[chIndex(phase)];
  el.label.textContent = phase === 'welcome' ? 'A virtual fruit fly laboratory' : c.label;
  el.title.textContent = phase === 'welcome' ? 'Welcome to Drosie\'s Fly Lab' : c.title;
  setBack(phase === 'welcome' ? null : '← Back', null); setHint(null); setTask(null); setFill(null); setMain(null); setFacts([]); setDeeper(''); setHint(null);
  renderTrail();
  mods[phase].enter();
  document.title = (phase === 'welcome' ? 'Grow Your Own Fruit Fly' : c.title + ' · Drosie\'s Fly Lab') + ' | Drosie\'s World';
  el.title.focus({ preventScroll: true });
  if (booted && window.matchMedia('(max-width: 940px)').matches) el.stage.scrollIntoView({ block: 'start', behavior: rm() ? 'auto' : 'smooth' });
}
FL.go = go;
FL.boot = () => { applyPrefs(); go('welcome'); booted = true; };

$('#restartBtn').addEventListener('click', () => { if (D.phase === 'welcome' && D.max === 0 && !D.opened.pre) return; $('#restartDlg').showModal(); });
$('#restartDlg').addEventListener('close', e => { if (e.target.returnValue === 'yes') FL.restartAll(); });

/* ---------------------------------------------------------------- WELCOME */
mods.welcome = {
  enter() {
    say('Welcome, Scientist! Today you are going to prepare a home for a tiny fruit fly, set up a real scientist\'s observation station, and discover how it grows!');
    const box = document.createElement('div');
    box.innerHTML = '<p class="nbnote"><strong>Your mission:</strong> Ask → Prepare → Set up → Observe → Record → Explain. This is a learning adventure, not a graded test.</p>';
    setFill(box);
    const progressed = hadSave && (D.max > 0 || D.opened.pre || D.pre.some(x => x !== null));
    if (progressed) {
      setMain('Continue my experiment', () => { const t = D.last && CH.some((c, i) => c.id === D.last && i <= D.max) ? D.last : CH[Math.min(D.max, CH.length - 1)].id; go(t); }, { go: true, ready: true });
      setHint('Start a new experiment', () => FL.restartAll());
    } else setMain('Begin the mission', () => go('notebook'), { go: true, ready: true });
    setDeeper('<p>You will keep a notebook, prepare fly food (with a lab technician\'s help), label and incubate a culture vial, watch six developmental stages at a speed you control, then answer your first five questions again to see what you learned. At the end you can print a lab report.</p><p>Everything is a simplified simulation of <em>Drosophila melanogaster</em>. Progress is kept only in this browser tab, and nothing is sent anywhere.</p>');
  }
};

/* ---------------------------------------------------------------- notebook: the same five questions before and after */
const QUIZ = [
  { q: 'Which animal is a fruit fly?', options: ['An insect', 'A spider', 'A worm', 'A fish'], correct: 0, why: 'An adult fruit fly is an insect with six legs.' },
  { q: 'Which ingredient helps provide proteins and vitamins in typical fly food?', options: ['Plastic', 'Yeast', 'Sand', 'Soap'], correct: 1, why: 'Yeast supplies important nutrients.' },
  { q: 'What comes after a fruit fly egg hatches?', options: ['An adult fly', 'A pupa', 'A larva', 'A butterfly'], correct: 2, why: 'An egg hatches into a first-instar larva.' },
  { q: 'Which stage comes just before an adult fruit fly emerges?', options: ['Egg', 'Pupa', 'First-instar larva', 'Seed'], correct: 1, why: 'The adult emerges from the puparium after metamorphosis.' },
  { q: 'Does temperature affect how quickly fruit flies develop?', options: ['No, never', 'Yes, temperature matters', 'Only at night', 'Only after adulthood'], correct: 1, why: 'Developmental rate depends on temperature; extreme temperatures can be harmful.' }
];
FL.QUIZ = QUIZ;
const qArt = i => ({
  0: '<img src="life-cycle-assets/adult.webp" alt="An adult fruit fly" width="110" height="73">',
  1: '<svg viewBox="0 0 70 80" role="img" aria-label="A jar of yeast"><rect x="8" y="26" width="54" height="50" rx="9" fill="#e7c9a0" stroke="#a9825a" stroke-width="3"/><rect x="4" y="16" width="62" height="14" rx="6" fill="#c5a173" stroke="#a9825a" stroke-width="3"/><rect x="16" y="42" width="38" height="22" rx="5" fill="#fff8e6"/><text x="35" y="57" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="10" fill="#7a5a2a">YEAST</text></svg>',
  2: '<img src="life-cycle-assets/egg.webp" alt="A fruit fly egg" width="52" height="68"><span aria-hidden="true" style="font-size:1.6rem">→</span><span aria-label="what hatches?" role="img" style="font:900 2rem var(--display);color:#a85e43">?</span>',
  3: '<img src="life-cycle-assets/pupa.webp" alt="A fruit fly puparium" width="40" height="80"><span aria-hidden="true" style="font-size:1.6rem">→</span><img src="life-cycle-assets/adult.webp" alt="An adult fruit fly" width="90" height="60">',
  4: '<svg viewBox="0 0 60 90" role="img" aria-label="A thermometer"><rect x="24" y="6" width="14" height="56" rx="7" fill="#fff" stroke="#8fb9c8" stroke-width="3"/><circle cx="31" cy="72" r="13" fill="#d9683f" stroke="#8fb9c8" stroke-width="3"/><rect x="28" y="30" width="6" height="42" fill="#d9683f"/><g stroke="#8fb9c8" stroke-width="2"><path d="M42 16H50M42 28H48M42 40H50M42 52H48"/></g></svg>'
}[i]);
const nb = { mode: 'pre' };
const book = $('#book'), sheet = $('#sheet');
const score = arr => arr.reduce((n, a, i) => n + (a === QUIZ[i].correct ? 1 : 0), 0);
FL.score = score;
function renderCover(mode) {
  nb.mode = mode; book.dataset.open = D.opened[mode] ? '1' : '0';
  if (!D.opened[mode]) {
    sheet.innerHTML = '';
    say(mode === 'pre' ? 'This is my notebook! First, tell me what you already know. These five questions are for learning, not for a grade, and nothing is marked wrong.' : 'Here is our notebook again! Let\'s answer the same five questions and see what you have discovered.');
    setTask(null); setMain('Open the notebook', () => openBook(mode), { go: true, ready: true });
  } else renderQuestion(mode, D.qi[mode]);
}
async function openBook(mode) {
  if (S.busy) return; S.busy = true; book.dataset.open = '1'; D.opened[mode] = true; save();
  await FL.wait(rm() ? 10 : 900); S.busy = false; renderQuestion(mode, D.qi[mode]);
}
function renderQuestion(mode, i) {
  D.qi[mode] = i; save(); const Qn = QUIZ[i], arr = D[mode];
  const opts = Qn.options.map((o, k) => `<label class="opt"><input type="radio" name="q${mode}" value="${k}" ${arr[i] === k ? 'checked' : ''}><span>${esc(o)}</span></label>`).join('');
  sheet.innerHTML = `<p class="qno">Question ${i + 1} of 5 · ${mode === 'pre' ? 'before' : 'after'}</p><div class="qart">${qArt(i)}</div><h2 class="qtext" id="qtext" tabindex="-1">${esc(Qn.q)}</h2>
    <fieldset class="opts"><legend class="sr-only">Choose one answer</legend>${opts}</fieldset><button type="button" class="mini hearq" id="hearQ">Hear the question</button>
    <div class="qdots" aria-hidden="true">${QUIZ.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>`;
  say(i === 0 ? (mode === 'pre' ? 'Question 1. Pick the answer you think is best. It is okay to guess!' : 'Question 1 again. Pick the answer you think is best.') : `Question ${i + 1}. Choose an answer.`);
  setTask(`Question ${i + 1} of 5`);
  const next = () => { if (i < 4) renderQuestion(mode, i + 1); else finishQuiz(mode); };
  setMain(i < 4 ? 'Next question →' : 'Finish my notebook ✓', next, { go: true, ready: arr[i] !== null, disabled: arr[i] === null });
  setBack('← Previous', () => { if (i > 0) renderQuestion(mode, i - 1); else { const k = FL.chIndex(S.phase); go(k > 0 ? CH[k - 1].id : 'welcome'); } });
  $$('input[name="q' + mode + '"]', sheet).forEach(r => r.addEventListener('change', () => { arr[i] = +r.value; save(); el.main.disabled = false; el.main.classList.add('ready'); el.sr.textContent = 'Answer saved.'; }));
  $('#hearQ').addEventListener('click', () => speak(`${Qn.q} ${Qn.options.map((o, k) => `Option ${k + 1}: ${o}.`).join(' ')}`));
}
function finishQuiz(mode) {
  D.qdone[mode] = true; save();
  if (mode === 'pre') {
    sheet.innerHTML = '<div class="qart"><img src="climbing-game-assets/drosie.webp" alt="Drosie" width="90" height="84"></div><h2 class="qtext" id="qtext" tabindex="-1">Notebook saved!</h2><p>Your first answers are tucked safely in the notebook. Now let\'s get to work in the lab.</p>';
    say('Great thinking! Your answers are saved in the notebook. Now let\'s go to the lab!'); setTask(null); setBack('← Back to the questions', () => renderQuestion('pre', 4)); chapterDone('notebook');
  } else showResults();
}
mods.notebook = {
  enter() {
    setDeeper('<p>The five questions are a quick check of what you already know. They are not graded, and you will not be told which answers are right until the end. Your results are only for you: they are feedback about your own learning, not a test of the game.</p>');
    if (D.qdone.pre) { renderCover('pre'); if (D.opened.pre) { finishQuizView(); } } else renderCover('pre');
  }
};
function finishQuizView() { sheet.innerHTML = '<div class="qart"><img src="climbing-game-assets/drosie.webp" alt="Drosie" width="90" height="84"></div><h2 class="qtext" id="qtext" tabindex="-1">Notebook saved!</h2><p>Your first answers are saved in the notebook.</p>'; say('Your first answers are saved in the notebook. Ready for the lab?'); setBack('← Back to the questions', () => renderQuestion('pre', 4)); setTask(null); finish('notebook'); }

/* ---------------------------------------------------------------- Chapter 5: the same questions, then the results */
const STAGE_NAMES = ['Egg', 'First instar larva', 'Second instar larva', 'Third instar larva', 'Pupa in the puparium', 'Adult'];
FL.STAGE_NAMES = STAGE_NAMES;
function showResults() {
  const b = score(D.pre), a = score(D.post);
  const rows = QUIZ.map((q, i) => `<div class="qres"><p><b>${i + 1}. ${esc(q.q)}</b></p><p>Before: ${D.pre[i] === null ? 'no answer' : esc(q.options[D.pre[i]])} ${D.pre[i] === q.correct ? '(correct)' : '(not yet)'} · After: ${D.post[i] === null ? 'no answer' : esc(q.options[D.post[i]])} ${D.post[i] === q.correct ? '(correct)' : '(not yet)'}</p><p>Answer: <b>${esc(q.options[q.correct])}</b>. ${esc(q.why)}</p></div>`).join('');
  const obs = D.obs.rec.map((r, i) => `<tr><th scope="row">${esc(STAGE_NAMES[i])}</th><td>${r.sticker !== null ? esc(FL.STICKERS ? FL.STICKERS[i][r.sticker] : '') : '–'}${r.note ? ' · ' + esc(r.note) : ''}</td></tr>`).join('');
  const msg = a > b ? 'You answered more questions correctly this time. Nice work noticing and learning!' : a === b ? 'You kept your score steady. Keep exploring: every scientist keeps learning!' : 'Some answers changed. That is okay: scientists change their minds when they find out more!';
  sheet.innerHTML = `<div class="res"><h2 class="qtext" id="qtext" tabindex="-1">My results</h2>
    <div class="scorebars" role="group" aria-label="Score comparison"><div class="bar"><span>Before</span><div class="track"><div class="fill" style="width:${b * 20}%"></div></div><span>${b} / 5</span></div><div class="bar after"><span>After</span><div class="track"><div class="fill" style="width:${a * 20}%"></div></div><span>${a} / 5</span></div></div>
    <p class="nbnote">${esc(msg)} These scores are just feedback for you. One short activity cannot prove how much anyone learned.</p>
    <h3>Questions and answers</h3>${rows}<h3>What I observed</h3><table class="sumtable"><thead><tr><th scope="col">Stage</th><th scope="col">My observation</th></tr></thead><tbody>${obs}</tbody></table></div>`;
  say(`You scored ${b} out of 5 before and ${a} out of 5 after. ${msg}`); setTask(null);
  setBack('← Back to the questions', () => renderQuestion('post', 4)); D.results = true; save(); chapterDone('results');
}
mods.results = {
  enter() {
    setDeeper('<p>Comparing "before" and "after" answers is a simple way to notice your own learning. It is not a scientific measurement of how well this game teaches. A real study would need many learners, a comparison group and careful design.</p>');
    if (D.results) { book.dataset.open = '1'; showResults(); } else renderCover('post');
  }
};
FL.resets.push(() => { nb.mode = 'pre'; sheet.innerHTML = ''; book.dataset.open = '0'; });
})();
