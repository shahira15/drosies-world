/* Drosie's Fly Lab · Chapter 2 (prepare the food) and Chapter 3 (set up the culture) */
(() => {
'use strict';
const FL = window.FL, { $, $$, rand, clamp, lerp, NS, hide, esc, say, setTask, setMain, setHint, setBack, setFill, setDeeper, activate, tween, wait, rm, S, T } = FL;
const mods = FL.mods;
const D = () => FL.D();
const svgPoint = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

/* =================================================================== CHAPTER 2 · PREPARE THE FLY FOOD */
const INGR = {
  water: { label: 'Water', color: '#bfe3f2', why: 'Water makes the food moist and holds the other ingredients together.' },
  yeast: { label: 'Yeast', color: '#d6b383', why: 'Yeast is a nutrient source. It gives the flies and larvae protein and vitamins.' },
  sugar: { label: 'Sugar', color: '#f3e9c8', why: 'Sugar is an energy source (a carbohydrate).' },
  cornmeal: { label: 'Cornmeal', color: '#f0c85a', why: 'Cornmeal gives the food bulk and more nutrients.' },
  agar: { label: 'Agar', color: '#f6ecc0', why: 'Agar is a gel. It sets the food firm so it keeps its shape in the vial.' }
};
const ORDER = ['water', 'yeast', 'sugar', 'cornmeal', 'agar', 'soap'];
const foodSvg = $('#scene-food');
const fx = { facts: [] };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixColor = (added, cooked) => {
  if (cooked) return '#f2dc9a';
  if (!added.length) return '#bfe3f2';
  let r = 0, g = 0, b = 0, w = 0; added.forEach(id => { const c = hex(INGR[id].color), k = id === 'water' ? 2 : 1; r += c[0] * k; g += c[1] * k; b += c[2] * k; w += k; });
  return `rgb(${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)})`;
};
function addParticles(id, n = 7) {
  const g = $('#mixParts'), h = Math.max(20, 16 * D().food.added.length);
  for (let k = 0; k < n; k++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', rand(1.6, 3.2)); c.setAttribute('cx', rand(-38, 38)); c.setAttribute('cy', 66 - rand(6, Math.max(10, h - 8))); c.setAttribute('fill', INGR[id].color); c.setAttribute('stroke', '#0002'); c.setAttribute('stroke-width', .5); c.setAttribute('class', 'part'); c.style.animationDelay = rand(0, 2) + 's'; g.appendChild(c); }
}
function renderMix(animateFrom) {
  const F = D().food, n = F.added.length, h = F.poured ? 0 : (F.cooked ? 88 : n ? 18 + 14 * n : 0), fill = $('#mixFill');
  fill.setAttribute('fill', mixColor(F.added, F.cooked));
  const apply = hh => { fill.setAttribute('y', 66 - hh); fill.setAttribute('height', hh); };
  if (animateFrom !== undefined && !rm()) { const h0 = animateFrom; tween(500, u => apply(lerp(h0, h, u))); } else apply(h);
  $('#mixGloss').setAttribute('opacity', F.cooked && !F.poured ? 1 : 0);
  $('#mixParts').style.display = F.cooked ? 'none' : '';
}
const curH = () => +($('#mixFill').getAttribute('height') || 0);
function markIngredient(id) {
  const g = $('#ing-' + id); if (!g || $('.ingmark', g)) return; g.classList.add('in');
  const m = document.createElementNS(NS, 'g'); m.setAttribute('class', 'ingmark'); m.innerHTML = '<circle cx="60" cy="10" r="11" fill="#245f55" stroke="#fff" stroke-width="2.5"/><path d="M54 10l5 5 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; g.appendChild(m);
}
function bubbles(x, y) {
  const g = $('#foodBubbles'); g.innerHTML = '';
  for (let k = 0; k < 6; k++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', rand(4, 9)); c.setAttribute('fill', '#fff'); c.setAttribute('fill-opacity', '.75'); c.setAttribute('stroke', '#b9a5d6'); c.setAttribute('stroke-width', 2); c.setAttribute('class', 'bubbleFx'); g.appendChild(c); }
  return tween(1100, u => { [...g.children].forEach((c, k) => { c.setAttribute('cx', x + Math.sin(u * 5 + k) * 14 + (k - 3) * 6); c.setAttribute('cy', y - u * (40 + k * 8)); c.setAttribute('opacity', 1 - u); }); }).then(() => { g.innerHTML = ''; });
}
function particlesFall(id) {
  const src = $('#ing-' + id), tr = src.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/), sx = +tr[1] + 30, sy = +tr[2] + 40;
  const g = $('#foodBubbles'); g.innerHTML = '';
  for (let k = 0; k < 9; k++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', rand(2, 3.8)); c.setAttribute('fill', INGR[id].color); c.setAttribute('stroke', '#0003'); c.setAttribute('stroke-width', .6); c.setAttribute('class', 'bubbleFx'); g.appendChild(c); }
  const tx = 190, ty = 214;
  return Promise.all([
    tween(260, u => src.setAttribute('transform', `translate(${tr[1]} ${tr[2]}) rotate(${-26 * u} 33 80)`)).then(() => wait(420)).then(() => tween(260, u => src.setAttribute('transform', `translate(${tr[1]} ${tr[2]}) rotate(${-26 * (1 - u)} 33 80)`))),
    tween(900, u => { [...g.children].forEach((c, k) => { const v = clamp(u * 1.3 - k * 0.04, 0, 1); c.setAttribute('cx', lerp(sx, tx + (k - 4) * 6, v)); c.setAttribute('cy', lerp(sy, ty, v * v) ); c.setAttribute('opacity', v >= 1 ? 0 : 1); }); })
  ]).then(() => { g.innerHTML = ''; src.setAttribute('transform', `translate(${tr[1]} ${tr[2]})`); });
}
async function addIngredient(id) {
  const F = D().food; if (S.phase !== 'food' || S.busy) return;
  if (F.cooked) { say('The food has already been cooked by the lab technician. Next, pour it into the vial.'); return; }
  const g = $('#ing-' + id);
  if (id === 'soap') {
    S.busy = true; if (!F.tried.includes('soap')) { F.tried.push('soap'); FL.save(); }
    g.classList.remove('shake'); void g.getBoundingClientRect(); if (!rm()) g.classList.add('shake');
    say('Soap does not belong in fly food. Flies do not eat soap, and it could make them sick. Try one of the other ingredients!');
    await bubbles(425, 60); S.busy = false; return;
  }
  if (F.added.includes(id)) { say(`${INGR[id].label} is already in the beaker. Try another ingredient!`); return; }
  S.busy = true; const h0 = curH();
  await particlesFall(id); F.added.push(id); addParticles(id); markIngredient(id); renderMix(h0); FL.save();
  renderFacts();
  say(INGR[id].why); S.busy = false;
  const n = F.added.length; if (n === 5) afterAll(); else setTask(`Add the ingredients that fly food needs: ${n} of 5`);
}
function renderFacts() { const f = $('#facts'); f.innerHTML = ''; D().food.added.forEach(id => { const li = document.createElement('li'); li.textContent = INGR[id].why; f.appendChild(li); }); if (D().food.tried.includes('soap')) { const li = document.createElement('li'); li.textContent = 'Soap is not fly food.'; f.appendChild(li); } }
function afterAll() {
  setTask(null); setHint(null);
  say('All five ingredients are in! This is one example of a cornmeal recipe. Different labs use different recipes. Mixing is not enough: trained adults must cook the food and keep it clean.');
  setMain('Ask the lab technician to cook it', cook, { go: true, ready: true });
}
async function cook() {
  const F = D().food; if (S.busy || F.cooked) return; S.busy = true; setMain(null);
  say('A trained lab technician cooks the mixture so the agar can dissolve and sets it carefully. Children do not do this step, because it is hot and needs clean procedures.');
  $('#steam').classList.add('on'); $('#steam').setAttribute('opacity', 1);
  const g0 = mixColor(F.added, false), g1 = mixColor(F.added, true);
  await tween(2400, u => { $('#mixFill').setAttribute('fill', u < .5 ? g0 : g1); });
  F.cooked = true; renderMix(); $('#steam').classList.remove('on'); $('#steam').setAttribute('opacity', 0); FL.save();
  say('Cooked! The food is now a soft gel. Next it goes into a clean culture vial.'); S.busy = false;
  setMain('Pour it into a culture vial', pour, { go: true, ready: true });
}
async function pour() {
  const F = D().food; if (S.busy || !F.cooked || F.poured) return; S.busy = true; setMain(null);
  const v = $('#foodVial'); v.setAttribute('opacity', 1); const h0 = curH();
  await tween(1800, u => { $('#mixFill').setAttribute('y', 66 - lerp(h0, 0, u)); $('#mixFill').setAttribute('height', lerp(h0, 0, u)); $('#foodVialFill').setAttribute('y', 60 - 34 * u); $('#foodVialFill').setAttribute('height', 34 * u); });
  F.poured = true; FL.save(); renderMix(); S.busy = false;
  say('Your food is in a culture vial! A culture is living things growing in a container with food. Now it needs a clean plug, a label and a steady home.');
  setTask(null); FL.chapterDone('food');
}
function renderFood() {
  const F = D().food;
  $$('.ing').forEach(g => { g.classList.remove('in'); $$('.ingmark', g).forEach(m => m.remove()); });
  $('#mixParts').innerHTML = ''; F.added.forEach(id => { markIngredient(id); addParticles(id, 5); });
  $('#foodVial').setAttribute('opacity', F.poured ? 1 : 0);
  $('#foodVialFill').setAttribute('y', F.poured ? 26 : 60); $('#foodVialFill').setAttribute('height', F.poured ? 34 : 0);
  $('#steam').setAttribute('opacity', 0); renderMix(); renderFacts();
}
// click + drag-and-drop (tap, keyboard Enter/Space and pointer drag all work)
ORDER.forEach(id => {
  const g = $('#ing-' + id); let st = null;
  g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addIngredient(id); } });
  g.addEventListener('click', e => { e.stopPropagation(); if (g.dataset.sup) { delete g.dataset.sup; return; } addIngredient(id); });
  g.addEventListener('pointerdown', e => { if (e.button > 0 || S.busy) return; st = { x: e.clientX, y: e.clientY, on: false, ghost: null }; });
  g.addEventListener('pointermove', e => {
    if (!st) return;
    if (!st.on && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 10) { st.on = true; try { g.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } const c = g.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('tabindex'); c.setAttribute('opacity', '.9'); $('#foodDrag').appendChild(c); st.ghost = c; }
    if (st.on) { const p = svgPoint(foodSvg, e); st.ghost.setAttribute('transform', `translate(${p.x - 33} ${p.y - 45}) rotate(-8 33 45)`); $('#dropZone rect').setAttribute('fill', 'rgba(255,211,90,.25)'); }
  });
  const end = e => {
    if (!st) return; const d = st; st = null;
    if (d.on) { g.dataset.sup = '1'; d.ghost.remove(); $('#dropZone rect').setAttribute('fill', 'transparent'); const p = svgPoint(foodSvg, e); if (p.x > 120 && p.x < 260 && p.y > 140 && p.y < 310) addIngredient(id); else say('Drop it into the glass beaker, or just tap the ingredient.'); }
  };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', () => { if (st && st.ghost) st.ghost.remove(); st = null; });
});
mods.food = {
  enter() {
    const F = D().food;
    setDeeper('<p>This is <strong>one example</strong> of a cornmeal-based Drosophila food. Laboratories use many different recipes (for example cornmeal with molasses or with dextrose), and they add small amounts of preservatives to slow mold. Yeast provides protein and vitamins, sugar provides energy, cornmeal adds bulk and nutrients, and agar sets the food into a gel.</p><p>Real fly food is cooked and handled by trained adults with clean equipment. Please do not try to grow flies or other microbes at home without a teacher or grown-up who knows the safe methods.</p>');
    renderFood();
    if (F.poured) { say('Your food is in a culture vial! Ready for the next step.'); FL.chapterDone && FL.finish('food'); return; }
    if (F.cooked) { say('The food is cooked. Pour it into a culture vial.'); setMain('Pour it into a culture vial', pour, { go: true, ready: true }); return; }
    if (F.added.length === 5) { afterAll(); return; }
    say(F.added.length ? 'Keep going! Which ingredients does fly food need?' : 'Welcome to the food station! Fly food needs the right ingredients. Tap an ingredient (or drag it) into the glass beaker. Watch out for one that does not belong!');
    setTask(`Add the ingredients that fly food needs: ${F.added.length} of 5`);
    setHint('Help me', () => { const need = ['water', 'yeast', 'sugar', 'cornmeal', 'agar'].filter(i => !F.added.includes(i)); say(`Fly food needs ${need.map(i => INGR[i].label.toLowerCase()).join(', ')}. Soap is not an ingredient.`); need.forEach(i => $('#ing-' + i).classList.add('shake')); T.later(() => $$('.ing').forEach(g => g.classList.remove('shake')), 600); });
  }
};
FL.resets.push(() => { fx.facts = []; $('#mixParts').innerHTML = ''; });

/* =================================================================== CHAPTER 3 · SET UP THE FLY CULTURE */
const TEMPS = { 18: { days: 'about 19 days', f: 2.0, note: 'Cooler: development is slower.' }, 25: { days: 'about 9–10 days', f: 1, note: 'The standard example. Many labs use about 25°C.' }, 29: { days: 'about 7 days', f: 0.74, note: 'Warmer: development is faster, but very hot temperatures can harm flies.' } };
FL.TEMPS = TEMPS;
const LABELS = [{ id: 'lab1', text: 'What: Fruit Fly Culture', short: 'Fruit Fly Culture' }, { id: 'lab2', text: 'When: Day 0', short: 'Day 0' }, { id: 'lab3', text: "Who: Drosie's Fly Lab", short: "Drosie's Fly Lab" }];
const STEPS = ['Inspect the vial', 'Label the vial', 'Open the door and put the vial in', 'Set the temperature', 'Close the door', 'Begin observing'];
const doorG = $('#doorG'), vialMove = $('#vialMove');
const BENCH = { x: 100, y: 237 }, SHELF = { x: 321, y: 212 };
function setDoor(open) { const sx = lerp(1, 0.16, open); doorG.setAttribute('transform', `translate(206 0) scale(${sx} 1) translate(-206 0)`); doorG.setAttribute('opacity', 1 - 0.35 * open); }
function setTempDisplay(t) {
  $('#dispTemp').textContent = t ? `${t}°C` : '--°C';
  $('#dialTick').setAttribute('transform', `rotate(${t === 18 ? -60 : t === 29 ? 60 : t === 25 ? 0 : -90} 356 67)`);
}
function stepOf() { const C = D().setup; return C.inspected.length < 3 ? 0 : C.labels.length < 3 ? 1 : !C.placed ? 2 : C.temp === null ? 3 : !C.closed ? 4 : 5; }
function setupScene() {
  const C = D().setup;
  $('#vialLabel').setAttribute('opacity', C.labels.length ? 1 : 0);
  { const vg = $('#vialG'); vg.insertBefore($('#vialLabel'), $('#vialStage')); }
  LABELS.forEach(l => { const on = C.labels.includes(l.id); $('#' + l.id).setAttribute('opacity', on ? 1 : 0); $('#' + l.id + 't').setAttribute('opacity', on ? 1 : 0); });
  setDoor(C.doorOpen && !C.closed ? 1 : 0);
  const pos = C.placed ? SHELF : BENCH; vialMove.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
  setTempDisplay(C.temp); $('#lampDot').setAttribute('fill', C.closed ? '#4cd08a' : '#516b66'); $('#lampGlow').setAttribute('opacity', C.closed ? .8 : .3);
  $$('#st0,#st1,#st2,#st3,#st4,#st5').forEach((n, i) => n.setAttribute('opacity', i === 0 ? 1 : 0));
  const st = stepOf(); ['food', 'eggs', 'plug'].forEach(k => { const h = $('#vh-' + k); hide(h, st !== 0); h.classList.toggle('found', C.inspected.includes(k)); }); hide($('#vh-label'), st !== 1);
  $('#benchProps').style.display = '';
  // zoom back out
  $('#scene-lab').setAttribute('viewBox', '0 0 480 360');
}
const INSPECT = { food: 'This is the food medium you made. It is a soft gel with all the nutrients the larvae will need.', eggs: 'Tiny white eggs! A lab technician put a few adult flies on this food to lay eggs, then removed the adults. These eggs are about 0.5 mm long.', plug: 'The foam plug lets air in, but keeps the flies from escaping and keeps the vial clean.' };
const inspectVial = k => { const C = D().setup; if (S.phase !== 'setup' || stepOf() !== 0) return; if (!C.inspected.includes(k)) C.inspected.push(k); FL.save(); say(INSPECT[k]); renderSetup(); };
['food', 'eggs', 'plug'].forEach(k => activate($('#vh-' + k), () => inspectVial(k)));
activate($('#vh-label'), () => labelVial());

function stepStrip() {
  const st = stepOf(), wrap = document.createElement('div'); wrap.className = 'stepstrip';
  wrap.innerHTML = `<p class="stepline"><b>Step ${Math.min(st + 1, 6)} of 6</b> · ${esc(STEPS[st])}</p><ol class="stepdots" aria-label="Set-up steps">${STEPS.map((t, i) => `<li class="${i < st || (i === 5 && D().done.setup) ? 'on' : i === st ? 'now' : ''}" aria-label="Step ${i + 1}: ${esc(t)}${i < st ? ' (done)' : i === st ? ' (current)' : ''}" ${i === st ? 'aria-current="step"' : ''}>${i < st ? '✓' : i + 1}</li>`).join('')}</ol>`;
  return wrap;
}
function tempCards(box) {
  const C = D().setup, f = document.createElement('fieldset'); f.className = 'temps'; f.innerHTML = '<legend class="sr-only">Incubator temperature</legend>' +
    Object.keys(TEMPS).map(t => `<label class="temp"><input type="radio" name="temp" value="${t}" ${C.temp === +t ? 'checked' : ''}><span><b>${t}°C</b><small>${+t === 25 ? 'Standard' : +t < 25 ? 'Cooler' : 'Warmer'}</small><small>${TEMPS[t].days}</small></span></label>`).join('');
  box.appendChild(f);
  const note = document.createElement('p'); note.className = 'tempnote'; note.id = 'tempNote'; note.textContent = C.temp ? TEMPS[C.temp].note : 'Pick a temperature. Many labs use about 25°C, but you can explore the others too.'; box.appendChild(note);
  $$('input[name="temp"]', f).forEach(r => r.addEventListener('change', () => { if (D().setup.closed) { r.checked = false; return; } const t = +r.value; C.temp = t; FL.save(); setTempDisplay(t); note.textContent = TEMPS[t].note; say(`${t} degrees. ${TEMPS[t].note} At this temperature a fruit fly takes ${TEMPS[t].days} from egg to adult.`); if (stepOf() > 3 || true) renderSetup(true); }));
}
function labelCard(done) {
  const card = document.createElement('div'); card.className = 'labelcard' + (done ? ' done' : '');
  card.innerHTML = `<b>${done ? 'Your vial label' : 'The label will say'}</b><span class="l1">Fruit Fly Culture</span><span class="l2">Day 0</span><span class="l3">Drosie's Fly Lab</span><small>A label says what is inside, when it started and who is responsible, so cultures never get mixed up.</small>${done ? '<span class="lok">✓ Labeled!</span>' : ''}`;
  return card;
}
function renderSetup(keepFocus) {
  const C = D().setup, st = stepOf(), box = document.createElement('div'); box.appendChild(stepStrip());
  setScene(st); FL.setHint(null);
  if (st === 0) { setTask(`Tap the glowing numbers on the vial: ${C.inspected.length} of 3`); setMain(null); }
  else if (st === 1) {
    setTask('Give the vial a label'); setMain('Label my vial', labelVial, { go: true, ready: true }); box.appendChild(labelCard(false));
  } else if (st === 2) {
    box.appendChild(labelCard(true));
    setTask(C.doorOpen ? 'Put the vial inside' : 'Open the incubator door');
    setMain(C.doorOpen ? 'Put the vial in the incubator' : 'Open the incubator door', C.doorOpen ? placeVial : openDoor, { go: true, ready: true });
  } else if (st === 3) { setTask('Choose the incubator temperature'); setMain('Choose a temperature first', null, { disabled: true }); tempCards(box); }
  else if (st === 4) { setTask('Close the incubator door'); setMain('Close the door', closeDoor, { go: true, ready: true }); tempCards(box); }
  else { setTask(null); tempCards(box); setMain('Begin observing →', () => go('observe'), { go: true, ready: true }); }
  FL.setFill(box);
  if (keepFocus) { const c = $('input[name="temp"]:checked'); if (c) c.focus({ preventScroll: true }); }
  settleFocus(st);
}
// Keep keyboard focus and the next action on screen: controls that vanish (hidden hotspots, replaced buttons) must not drop focus to <body>,
// and on phones the action button must be scrolled into view after every step change.
let lastStep = -1;
function settleFocus(st) {
  const ae = document.activeElement, lost = !ae || ae === document.body || (ae.closest && ae.closest('[hidden]'));
  const target = !FL.el.main.hidden && !FL.el.main.disabled ? FL.el.main : $('input[name="temp"]') || $('#vh-food:not([hidden])') || FL.el.main;
  if (lost && target) target.focus({ preventScroll: true });
  if (st !== lastStep && window.matchMedia('(max-width: 940px)').matches && !FL.el.main.hidden) { FL.el.main.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); }
  lastStep = st;
}
async function labelVial() {
  const C = D().setup; if (S.busy || stepOf() !== 1) return; S.busy = true; setMain(null);
  say('Labeling the vial: Fruit Fly Culture, Day 0, Drosie\'s Fly Lab. A label tells everyone what is inside, when it started and who is responsible.');
  const lab = $('#vialLabel'); lab.setAttribute('opacity', 0);
  LABELS.forEach(l => { $('#' + l.id).setAttribute('opacity', 1); $('#' + l.id + 't').setAttribute('opacity', 1); });
  await tween(700, u => { lab.setAttribute('opacity', u); lab.setAttribute('transform', `translate(0 ${(1 - u) * -10})`); });
  lab.removeAttribute('transform'); C.labels = LABELS.map(l => l.id); FL.save(); S.busy = false;
  say('Great job! Your vial is labeled: Fruit Fly Culture, Day 0. Now it can go in the incubator.'); renderSetup();
}
const go = id => FL.go(id);
function setScene() { /* scene already reflects state; kept for clarity */ setupScene(); }
async function openDoor() {
  const C = D().setup; if (S.busy) return; S.busy = true; setMain(null);
  say('I open the door. A working incubator door keeps the warm air inside when it is closed.');
  await tween(700, u => setDoor(u)); C.doorOpen = true; FL.save(); S.busy = false; renderSetup();
}
async function placeVial() {
  const C = D().setup; if (S.busy) return; S.busy = true; setMain(null);
  say('The vial goes on the shelf. Cultures stay in clean containers inside the incubator.');
  const a = { ...BENCH }, b = { ...SHELF };
  await tween(1300, u => { const lift = Math.sin(u * Math.PI) * 24; vialMove.setAttribute('transform', `translate(${lerp(a.x, b.x, u)} ${lerp(a.y, b.y, u) - lift})`); });
  C.placed = true; FL.save(); S.busy = false; say('Next, choose the temperature. The standard example is about 25°C.'); renderSetup();
}
async function closeDoor() {
  const C = D().setup; if (S.busy) return; S.busy = true; setMain(null);
  await tween(800, u => setDoor(1 - u)); C.closed = true; $('#lampDot').setAttribute('fill', '#4cd08a'); $('#lampGlow').setAttribute('opacity', .8); FL.save(); S.busy = false;
  say(`The door is closed and the incubator is holding ${C.temp}°C. Your culture is ready to observe!`); FL.chapterDone('setup'); renderSetup(); setTask(null);
}
mods.setup = {
  enter() {
    const C = D().setup;
    setDeeper('<p>Scientists use clean containers, the right food, a label and a steady temperature so cultures are comparable and safe. The vial is closed with a plug that lets air in but keeps flies and contaminants out.</p><p>Some labs also control humidity (often around 60%) or keep a regular light and dark cycle, but there is no single "required" setting for every lab, so this game does not make humidity part of your score. A closed vial helps keep the food from drying out.</p><p>Many adults and eggs go into a real vial. You are not placing a single loose egg into the incubator.</p>');
    $('#vialLabel').setAttribute('opacity', 0);
    $('#scene-lab').setAttribute('aria-label', 'A laboratory bench with a labelled culture vial and an incubator with a glass door.');
    if (D().done.setup) say('Your culture is set up. Ready to observe?'); else say(C.inspected.length ? 'Welcome back to the bench!' : 'Here is your culture vial, ready on the bench! Before we start, let\'s look at it closely. Tap each glowing number.');
    renderSetup();
    if (D().done.setup) { setTask(null); FL.nextChapterButton('setup'); }
  }
};
FL.setupScene = setupScene;
FL.BENCH = BENCH; FL.SHELF = SHELF; FL.setDoor = setDoor; FL.setTempDisplay = setTempDisplay;
FL.resets.push(() => { fx.facts = []; });
})();
