/* Drosie's Fly Lab · Chapter 4: observe development (time-lapse station) */
(() => {
'use strict';
const FL = window.FL, { $, $$, clamp, lerp, esc, say, setTask, setMain, setHint, setBack, setFill, setDeeper, tween, rm, S } = FL;
const mods = FL.mods;
const D = () => FL.D();

/* Reference timeline in days at about 25°C (rough, approximate). Other temperatures stretch or squeeze it. */
const REF = [0, 1, 2, 3, 5, 9.5], REF_END = 10;
const STAGES = [
  { name: 'Egg', short: 'Egg', text: 'The egg holds a tiny developing embryo. It is only about 0.5 mm long. At about 25°C a first instar larva hatches after about 1 day.',
    img: 'life-cycle-assets/egg.webp', alt: 'A fruit fly egg with two thin filaments', call: ['About 0.5 mm long: very tiny!', 'Two thin filaments help the egg get air.'],
    q: 'What do you predict will hatch from the egg?', a: ['A larva', 'A fully grown adult', 'A seed'], ok: 0, why: 'A larva hatches from the egg. It is the second stage of the life cycle.' },
  { name: 'First instar larva', short: 'L1', text: 'The tiny first instar larva starts to eat. Fruit fly larvae have no legs: they wriggle through the food.',
    img: 'life-cycle-assets/larva.webp', alt: 'A small legless fruit fly larva', call: ['It has no legs. It wriggles.', 'It eats the food all day to grow.'],
    q: 'What does the larva need to grow?', a: ['Suitable nutrients', 'A pair of shoes', 'Sunlight alone'], ok: 0, why: 'Larvae eat nutrients in their food, such as yeast, to grow.' },
  { name: 'Second instar larva', short: 'L2', text: 'After a molt (shedding its old outer skin), the larva is in its second instar and is bigger.',
    img: 'life-cycle-assets/larva.webp', alt: 'A larger legless fruit fly larva', call: ['Bigger than before.', 'The old skin was shed in a molt.'],
    q: 'What is a molt?', a: ['Shedding the old outer covering', 'Flying out of the vial', 'Turning into an egg'], ok: 0, why: 'A molt is when a larva sheds its old outer covering so it can grow.' },
  { name: 'Third instar larva', short: 'L3', text: 'The third instar larva is the biggest. Later it leaves the food and looks for a dry place to form its puparium.',
    img: 'life-cycle-assets/larva.webp', alt: 'The biggest legless fruit fly larva', call: ['The biggest larva stage.', 'Late in this stage it crawls out of the food.'],
    q: 'How many larval instars does a fruit fly have?', a: ['One', 'Three', 'Seven'], ok: 1, why: 'Fruit flies have three larval instars, separated by molts.' },
  { name: 'Pupa in the puparium', short: 'Pupa', text: 'The last larval skin hardens into a brown case called the puparium. The pupa inside is changing into an adult. It does not eat.',
    img: 'life-cycle-assets/pupa.webp', alt: 'A brown fruit fly puparium', call: ['The puparium is the hard outer case.', 'The pupa inside is changing into an adult.'],
    q: 'Does the pupa need to eat?', a: ['Yes, every hour', 'No, it does not feed'], ok: 1, why: 'The pupa does not feed. It uses what the larva stored while it changes into an adult.' },
  { name: 'Adult', short: 'Adult', text: 'Eclosion! The adult comes out of the puparium. At first its wings are small and crumpled, and they expand and harden within hours. It has six legs and one pair of wings.',
    img: 'life-cycle-assets/adult.webp', alt: 'An adult fruit fly with wings', call: ['Six legs and one pair of wings.', 'Three body parts: head, thorax, abdomen. The empty puparium stays behind.'],
    q: 'How many legs does the adult fruit fly have?', a: ['Four', 'Six', 'Eight'], ok: 1, why: 'Adult insects, including fruit flies, have six legs.' }
];
const STICKERS = [
  ['I see tiny white eggs on the food.', 'The eggs are very small.', 'There are no larvae yet.'],
  ['Tiny larvae are in the food.', 'The larvae have no legs.', 'The larvae are eating.'],
  ['The larvae are bigger now.', 'I see an old skin left behind (a molt).', 'They are still in the food.'],
  ['The larvae are even bigger.', 'Some larvae are climbing out of the food.', 'The larvae still have no legs.'],
  ['I see hard brown cases on the vial wall.', 'The larvae stopped moving.', 'Something is changing inside the cases.'],
  ['Adult flies have come out.', 'Empty brown cases are left behind.', 'The flies have wings.']
];
FL.STICKERS = STICKERS; FL.OBS_STAGES = STAGES;
const factor = () => (FL.TEMPS[D().setup.temp || 25] || FL.TEMPS[25]).f;
const fmt = d => { const r = Math.round(d * 10) / 10; return Number.isInteger(r) ? String(r) : r.toFixed(1); };
const stageOf = refDay => { let k = 0; REF.forEach((b, i) => { if (refDay >= b - 1e-9) k = i; }); return k; };
const allowedMax = () => { const u = D().obs.unlocked; return u < 5 ? Math.round(REF[u + 1] * 10) - 1 : Math.round(REF_END * 10); };
FL.dayRange = (i, t) => { const f = (FL.TEMPS[t || 25] || FL.TEMPS[25]).f, a = REF[i] * f, b = (i < 5 ? REF[i + 1] : REF_END) * f; return i === 5 ? `Day ${fmt(a)} onwards` : `Day ${fmt(a)} to ${fmt(b)}`; };

const vb = { cur: [0, 0, 480, 360] };
const WIDE = [0, 0, 480, 360], CLOSE = [221, 137, 200, 150];
let zoomed = false, viewStage = 0, tlEls = null;
function setView(a) { vb.cur = a; $('#scene-lab').setAttribute('viewBox', a.map(n => n.toFixed(1)).join(' ')); }
async function zoomTo(close) {
  zoomed = close; const a = [...vb.cur], b = close ? CLOSE : WIDE;
  await tween(700, u => setView(a.map((v, i) => lerp(v, b[i], u))));
  const z = $('#zoomBtn'); if (z) { z.textContent = zoomed ? 'Zoom back out' : 'Zoom into the vial'; z.setAttribute('aria-pressed', String(zoomed)); }
}
function setArt(i) { for (let k = 0; k < 6; k++) { const g = $('#st' + k); g.style.opacity = k === i ? 1 : 0; g.setAttribute('opacity', k === i ? 1 : 0); } }

function dayText(v) {
  const ref = v / 10, f = factor(), day = ref * f, i = stageOf(ref);
  return { day: `Day ${fmt(day)}`, sub: `about ${Math.round(day * 24)} hours · ${STAGES[i].name}`, i };
}
function buildTimeline() {
  const box = document.createElement('div'); box.className = 'tl';
  box.innerHTML = `<div class="tlhead"><span class="tlday" id="tlDay">Day 0</span><span class="tlsub" id="tlSub"></span></div>
    <input class="tlrange" id="tlRange" type="range" min="0" max="${REF_END * 10}" step="1" aria-label="Elapsed time in the incubator" aria-describedby="tlHelp">
    <div class="tlmarks" id="tlMarks" aria-hidden="true"></div><p class="tlsub" id="tlHelp">Slide to move through time. New stages unlock as you finish each one. Temperature: <b id="tlTemp"></b>.</p>`;
  const marks = $('#tlMarks', box);
  REF.forEach((b, i) => { const s = document.createElement('span'); s.style.left = (b / REF_END * 100) + '%'; s.dataset.i = i; s.innerHTML = `<i></i>${STAGES[i].short}`; marks.appendChild(s); });
  tlEls = { box, day: $('#tlDay', box), sub: $('#tlSub', box), range: $('#tlRange', box), marks, temp: $('#tlTemp', box) };
  tlEls.temp.textContent = `${D().setup.temp || 25}°C (${FL.TEMPS[D().setup.temp || 25].days} from egg to adult)`;
  tlEls.range.addEventListener('input', () => {
    const max = allowedMax(); let v = +tlEls.range.value;
    if (v > max) { v = max; tlEls.range.value = String(v); say('Finish this stage first: look, record and answer. Then the next stage unlocks.'); }
    D().obs.v = v; FL.save(); applyTime(v);
  });
  return box;
}
function applyTime(v) {
  const t = dayText(v); tlEls.day.textContent = t.day; tlEls.sub.textContent = t.sub;
  tlEls.range.value = String(v); tlEls.range.setAttribute('aria-valuetext', `${t.day}, ${STAGES[t.i].name}`);
  $$('#tlMarks span', tlEls.box).forEach(s => s.classList.toggle('lock', +s.dataset.i > D().obs.unlocked));
  setArt(t.i); if (t.i !== viewStage) { viewStage = t.i; renderStage(); }
}
const done = i => { const r = D().obs.rec[i]; return r.looked && r.sticker !== null && r.answered; };

function renderStage(focusSel) {
  const i = viewStage, r = D().obs.rec[i], st = STAGES[i], u = D().obs.unlocked, box = $('#stageBox'); if (!box) return;
  const tp = D().setup.temp || 25;
  const sizes = i >= 1 && i <= 3 ? `<div class="sizes" aria-label="Larva size comparison">${[1, 2, 3].map(k => `<div class="${k === i ? 'on' : ''}"><img src="life-cycle-assets/larva.webp" alt="" width="${20 + k * 22}" height="${(20 + k * 22) * 0.296}"><span>${['L1', 'L2', 'L3'][k - 1]}${k === i ? ' (this one)' : ''}</span></div>`).join('')}</div>` : '';
  box.innerHTML = `<div class="stagecard"><h2>${esc(st.name)}</h2><p><b>${esc(FL.dayRange(i, tp))}</b> (approximate)</p><p>${esc(st.text)}</p>
    <button type="button" class="btn alt zoombtn" id="lensBtn" aria-pressed="${r.looked}">${r.looked ? 'Magnifying glass on' : 'Use the magnifying glass'}</button>
    <div class="lensrow" id="lensRow" ${r.looked ? '' : 'hidden'}><div class="lens"><img src="${st.img}" alt="${esc(st.alt)}" ${i === 4 ? 'style="max-height:90%;max-width:40%"' : ''}></div><ul class="lenslist">${st.call.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>${sizes}</div>
    <ol class="checklist" aria-label="Stage tasks"><li class="${r.looked ? 'on' : ''}">Look with the magnifying glass</li><li class="${r.sticker !== null ? 'on' : ''}">Record what you see</li><li class="${r.answered ? 'on' : ''}">Answer the question</li></ol>
    <h3>Record what you see</h3><div class="stickers" id="stickers">${STICKERS[i].map((t, k) => `<button type="button" class="sticker" data-k="${k}" aria-pressed="${r.sticker === k}">${esc(t)}<span class="tick" aria-hidden="true">${r.sticker === k ? '✓' : ''}</span></button>`).join('')}</div>
    <label class="sr-only" for="obsNote">Add a note about this stage (optional)</label><input class="note" id="obsNote" maxlength="100" placeholder="My own note (optional)">
    <h3>Question</h3><p id="qText"><b>${esc(st.q)}</b></p><div class="qopts" id="qopts" role="group" aria-label="Answers">${st.a.map((t, k) => `<button type="button" class="qopt ${r.answered && k === st.ok ? 'right' : ''}" data-k="${k}">${esc(t)}${r.answered && k === st.ok ? '<span class="mark"> ✓ correct</span>' : ''}</button>`).join('')}</div><p class="qfb" id="qfb" role="status">${r.answered ? esc(st.why) : ''}</p>`;
  const note = $('#obsNote', box); note.value = r.note || ''; note.addEventListener('input', () => { r.note = note.value.slice(0, 100); FL.save(); });
  $('#lensBtn', box).addEventListener('click', () => { r.looked = true; FL.save(); say(`Magnifying glass! ${st.call.join(' ')}`); renderStage('#lensBtn'); });
  $$('#stickers .sticker', box).forEach(b => b.addEventListener('click', () => { r.sticker = +b.dataset.k; FL.save(); say('Recorded in your notebook.'); renderStage('#stickers .sticker[data-k="' + b.dataset.k + '"]'); }));
  $$('#qopts .qopt', box).forEach(b => b.addEventListener('click', () => {
    const k = +b.dataset.k; if (r.answered) return;
    if (k === st.ok) { r.answered = true; FL.save(); say(`Yes! ${st.why}`); renderStage('#qopts .qopt[data-k="' + k + '"]'); }
    else { r.tries++; FL.save(); b.classList.add('try'); $('#qfb').textContent = 'Not quite. Look at the magnifying glass picture and try again!'; say('Not quite. Look again and try another answer. There is no penalty!'); }
  }));
  if (focusSel) { const f = $(focusSel, box); if (f) f.focus({ preventScroll: true }); }
  stageMain();
}
function stageMain() {
  const u = D().obs.unlocked, i = viewStage;
  if (i < u || (D().done.observe && i === 5)) { setTask(null); setMain(D().done.observe ? 'Next: The Scientist\'s Results →' : 'Go to the newest stage →', () => { if (D().done.observe) FL.go('results'); else jumpTo(u); }, { go: true, ready: true }); return; }
  const ok = done(i); const r = D().obs.rec[i], n = (r.looked ? 1 : 0) + (r.sticker !== null ? 1 : 0) + (r.answered ? 1 : 0);
  setTask(ok ? null : `Finish this stage: ${n} of 3 tasks done`);
  if (i < 5) setMain(`Next: ${STAGES[i + 1].name} →`, advance, { go: ok, ready: ok, disabled: !ok });
  else setMain('Finish observing ✓', finishObserve, { go: ok, ready: ok, disabled: !ok });
}
function jumpTo(i) { const v = Math.round(REF[i] * 10) + (i === D().obs.unlocked ? 1 : 0); D().obs.v = v; FL.save(); applyTime(v); }
async function advance() {
  const O = D().obs, i = O.unlocked; if (S.busy || !done(i) || i >= 5) return; S.busy = true; setMain(null);
  say(`Time passes in the incubator… ${STAGES[i + 1].name} begins.`);
  O.unlocked = i + 1; const a = O.v, b = Math.round(REF[i + 1] * 10) + 1;
  await tween(rm() ? 0 : 1800, u => { const v = Math.round(lerp(a, b, u)); applyTime(v); });
  O.v = b; FL.save(); applyTime(b); S.busy = false; say(`${STAGES[i + 1].name}. ${STAGES[i + 1].text}`); renderStage();
}
function finishObserve() {
  if (!done(5)) return; say('You watched a fruit fly grow from an egg to an adult and wrote down what you saw. Time for the questions again!'); FL.chapterDone('observe'); stageMain();
}
mods.observe = {
  enter() {
    const O = D().obs, C = D().setup; if (!C.temp) { C.temp = 25; }
    setDeeper('<p>This is a time-lapse <strong>simulation</strong>: you control how fast time moves, and each stage is a simplified illustration. At about 25°C, development takes roughly 9–10 days from egg to adult. At about 18°C it takes roughly twice as long (about 19 days), and at about 29°C it is faster (about 7 days). These are rough, approximate reference values.</p><p>A real vial holds many eggs and larvae at different stages, so a real culture contains a mixture. The puparium forms from the hardened last larval skin; "pupation" and "pupariation" describe the change into the pupal stage, and "eclosion" is the adult emerging.</p>');
    // show the culture inside a closed incubator
    $('#vialMove').setAttribute('transform', `translate(${FL.SHELF.x} ${FL.SHELF.y})`); FL.setDoor(0);
    $('#vialG').insertBefore($('#vialLabel'), $('#vialStage'));
    const lab = C.labels || []; $('#vialLabel').setAttribute('opacity', lab.length ? 0.2 : 0); ['lab1', 'lab2', 'lab3'].forEach(l => { const on = lab.includes(l); $('#' + l).setAttribute('opacity', on ? 1 : 0); $('#' + l + 't').setAttribute('opacity', on ? 1 : 0); });
    FL.setTempDisplay(C.temp); $('#lampDot').setAttribute('fill', '#4cd08a'); $('#lampGlow').setAttribute('opacity', .8); ['food', 'eggs', 'plug', 'label'].forEach(k => FL.hide($('#vh-' + k), true));
    $('#scene-lab').setAttribute('aria-label', 'An incubator with a glass door. Inside, a labelled culture vial shows the stage you are observing.');
    zoomed = false; setView(WIDE);
    const root = document.createElement('div'); root.appendChild(buildTimeline());
    const zb = document.createElement('button'); zb.type = 'button'; zb.className = 'btn alt zoombtn'; zb.id = 'zoomBtn'; zb.textContent = 'Zoom into the vial'; zb.setAttribute('aria-pressed', 'false'); zb.addEventListener('click', () => zoomTo(!zoomed)); root.appendChild(zb);
    const sb = document.createElement('div'); sb.id = 'stageBox'; root.appendChild(sb); setFill(root);
    viewStage = stageOf(O.v / 10);
    say(D().done.observe ? 'Your observations are all recorded. Slide the time bar to look back at any stage.' : O.unlocked === 0 && !O.rec[0].looked ? 'Welcome to the observation station! The culture is in the incubator. Use the magnifying glass, record what you see, and answer the question to move forward in time.' : 'Welcome back to the observation station!');
    applyTime(O.v); renderStage();
    if (D().done.observe) { setTask(null); }
  }
};
FL.resets.push(() => { zoomed = false; viewStage = 0; });
})();
