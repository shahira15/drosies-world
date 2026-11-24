/* Chapter 3, visual adventure: the Fly Laboratory workbench.
   Uses the validated engine unchanged: DC.DATA, DC.lab.positions/svg/fly (deterministic), DC.state.a.rec/setup, DC.chart. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc, D = DC.DATA, G = DC.lab.geom;

  /* ---------- the workbench (art) ---------- */
  const VX = { control: 60, cool: 380 };           // x of each vial in the 960x600 scene
  A.lab = () => A.wall('#d7efe9', 500, '#c99a60') + A.r(0, 0, 960, 500, '#d7efe9') + A.window(770, 40, 130, 120) + A.shelf(40, 52, 240).replace(/translate/g, 'translate') + A.clock(480, 70) +
    A.r(0, 496, 960, 20, '#8d6336') + A.r(0, 516, 960, 84, '#a97a46') + [0, 1, 2].map((i) => A.ln(0, 540 + i * 24, 960, 540 + i * 24, 'rgba(60,35,10,.22)', 2)).join('') +
    /* thermometers beside the vials */
    A.thermo(372, 170, 150, '', true) + A.thermo(692, 170, 150, '', false) + A.tx(372, 146, 22, '25 °C', A.C.ink) + A.tx(692, 146, 22, '18 °C', A.C.ink) +
    /* ruler, magnifier, notebook on the bench */
    A.g('translate(400 536) rotate(-3)', A.r(0, 0, 150, 26, '#f3e9c8', 3, 'stroke="#8d6336" stroke-width="2"') + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => A.ln(10 + i * 16, 0, 10 + i * 16, i % 2 ? 9 : 15, '#6b5a2a', 2)).join('')) +
    A.g('translate(230 548)', A.c(0, 0, 26, 'rgba(255,255,255,.55)', 'stroke="#c99a30" stroke-width="7"') + A.ln(18, 18, 52, 46, '#8d5a2b', 9)) +
    A.g('translate(70 530)', A.r(0, 0, 120, 52, '#fffdf6', 4, 'stroke="#8d6336" stroke-width="3"') + A.ln(60, 0, 60, 52, '#8d6336', 3) + A.ln(12, 14, 50, 14, '#c9d8cc', 3) + A.ln(12, 26, 50, 26, '#c9d8cc', 3) + A.ln(72, 14, 108, 14, '#c9d8cc', 3)) +
    /* timer */
    A.g('translate(712 408)', A.r(0, 0, 150, 92, '#2f7d7a', 14, 'stroke="#1d5a5a" stroke-width="4"') + A.r(12, 12, 126, 44, '#e8f3ef', 8) + '<text id="vxTimerTxt" x="75" y="46" font-size="34" font-weight="900" text-anchor="middle" fill="#1c2b28" font-family="ui-rounded,Nunito,sans-serif">0.0 s</text>' + A.c(40, 74, 8, '#c4655a') + A.c(75, 74, 8, '#d9b45a') + A.c(110, 74, 8, '#e8f3ef')) +
    /* clipboard */
    A.g('translate(872 360) rotate(5)', A.r(0, 0, 76, 130, '#c99a60', 8, 'stroke="#8d6336" stroke-width="4"') + A.r(8, 14, 60, 110, '#fffdf6', 4) + A.r(22, -4, 32, 14, '#d9b45a', 5, 'stroke="#9a6a1d" stroke-width="3"') + [0, 1, 2, 3, 4].map((i) => A.ln(16, 34 + i * 18, 60, 34 + i * 18, '#c9d8cc', 3)).join(''));

  /* ---------- UI state (not scientific data) ---------- */
  const U = () => { const u = vx.c(3); if (!u.cond) u.cond = 'control'; return u; };
  const live = { phase: 'idle', t: 0, raf: 0, speed: 1, hl: false, trial: 0, counted: [], num: 0, msg: '', tries: 0, wrong: 0, setupSel: null };
  const rec = (cid) => DC.state.a.rec[cid];
  const nextTrial = (cid) => { const i = rec(cid).findIndex((v) => typeof v !== 'number'); return i < 0 ? 4 : i; };
  const setupDone = () => ['temp:changed', 'count:measured', 'vial:same', 'nflies:same', 'tod:same', 'taps:same'].every((q) => DC.state.a.setup[q.split(':')[0]] === q.split(':')[1]);
  const stage = () => (!setupDone() ? 0 : !DC.aComplete() ? 1 : 2);
  const nrec = () => D.conditions.reduce((a, c) => a + DC.recorded(c.id).length, 0);

  function vialMarkup(cid) {
    const sel = U().cond === cid, ti = sel ? live.trial : nextTrial(cid), running = sel && (live.phase === 'running' || live.phase === 'done'), t = running ? live.t : 0;
    const inner = DC.lab.svg(cid, ti, t, sel && live.hl).replace('<svg ', '<svg x="' + VX[cid] + '" y="70" width="260" height="420" ');
    return (sel ? A.r(VX[cid] - 10, 58, 262, 444, 'rgba(255,224,138,.38)', 24, 'stroke="#d9a02b" stroke-width="4" stroke-dasharray="10 8"') : '') + '<g aria-hidden="true"' + (sel && live.phase === 'tap' ? ' class="vx-vshake"' : '') + '>' + inner + '</g>';
  }
  function lamps(cid) { return rec(cid).map((v, i) => A.c(VX[cid] + 44 + i * 42, 506, 12, typeof v === 'number' ? '#2d7a52' : (U().cond === cid && live.trial === i ? '#ffd36b' : '#fff'), 'stroke="#1d5a5a" stroke-width="3"') + (typeof v === 'number' ? A.tx(VX[cid] + 44 + i * 42, 511, 14, v, '#fff') : '')).join(''); }
  function sceneArt() {
    return vx.svg(A.lab().replace('>0.0 s<', '>' + ((live.phase === 'running' || live.phase === 'done' ? live.t : 0) * D.seconds).toFixed(1) + ' s<') + '<g id="vxV-control">' + vialMarkup('control') + '</g><g id="vxV-cool">' + vialMarkup('cool') + '</g>' + lamps('control') + lamps('cool'), 'A laboratory bench with two vials of fruit flies, a thermometer for each (25 °C and 18 °C), a timer, a ruler, a magnifier, a notebook and a clipboard');
  }
  const pct = (x, y) => ({ x: +(x / 9.6).toFixed(1), y: +(y / 6).toFixed(1) });
  function hots() {
    const mk = (x, y, label, act, data, w, h) => Object.assign(pct(x, y), { label, act, data, w, h });
    return [mk(VX.control + 130, 280, 'Choose the 25 °C vial', 'v3cond', { c: 'control' }, 150, 260), mk(VX.cool + 130, 280, 'Choose the 18 °C vial', 'v3cond', { c: 'cool' }, 150, 260), mk(787, 452, 'Start the timer', 'v3start', {}, 120, 70), mk(910, 430, 'Clipboard: your records', 'v3clip', {}, 70, 110), mk(256, 548, 'Magnifier: count the flies', 'v3zoom', {}, 70, 70), mk(372, 260, 'Thermometer: 25 °C', 'v3therm', { c: 'control' }, 48, 130), mk(692, 260, 'Thermometer: 18 °C', 'v3therm', { c: 'cool' }, 48, 130), mk(130, 556, 'Notebook', 'v3note', {}, 90, 60), mk(475, 548, 'Ruler: the line is at 8 cm', 'v3ruler', {}, 110, 40)];
  }

  /* ---------- Drosie lines ---------- */
  function say() {
    const s = stage();
    if (DC.isDone(3)) return ['All the data are in! On to the Detective HQ!', 'celebrate'];
    if (s === 0) return ['Let’s plan! What do we change? What do we measure?', 'thinking'];
    if (s === 2) return ['You have all the data! Compare the two vials.', 'celebrate'];
    if (live.phase === 'running') return ['Watch the flies climb!', 'curious'];
    if (live.phase === 'done') return ['Time’s up! Tap the flies above the dashed line.', 'explain'];
    if (live.msg) return [live.msg, live.msg.startsWith('✓') ? 'encourage' : 'thinking'];
    return ['Pick a vial, then tap it and start the timer.', 'curious'];
  }

  /* ---------- stage 0: the planning game (tap an object, then tap a label) ---------- */
  const OBJ = [
    { k: 'temp', label: 'Thermometer', sub: 'the room temperature', right: 'changed', svg: '<svg viewBox="0 0 80 90" aria-hidden="true">' + A.thermo(40, 8, 52, '', true) + '</svg>', hint: 'We change the temperature on purpose: 25 °C or 18 °C.' },
    { k: 'count', label: 'Flies above the line', sub: 'counted after 10 seconds', right: 'measured', svg: '<svg viewBox="0 0 80 90" aria-hidden="true">' + A.ln(6, 40, 74, 40, '#c4655a', 4).replace('stroke-linecap="round"', 'stroke-dasharray="8 6" stroke-linecap="round"') + A.g('translate(40 20) scale(.8)', DC.lab.fly(0, 0, 0, false)) + A.g('translate(24 68) scale(.8)', DC.lab.fly(0, 0, 10, false)) + '</svg>', hint: 'This is what we measure: how many flies climb above the line.' },
    { k: 'same', label: 'Vial, taps, time', sub: 'and 10 flies: the same for both', right: 'same', svg: '<svg viewBox="0 0 80 90" aria-hidden="true"><path d="M26 8h28M28 8v56a12 12 0 0 0 24 0V8" fill="#e4f3f1" stroke="#1d5a5a" stroke-width="4"/><circle cx="40" cy="50" r="3" fill="#6b4a2a"/><circle cx="34" cy="36" r="3" fill="#6b4a2a"/></svg>', hint: 'These stay the same for both groups, so they cannot explain a difference.' }
  ];
  const LAB = [['changed', 'Changed on purpose', 'thermo'], ['measured', 'Measured', 'ruler'], ['same', 'Kept the same', 'scale']];
  const assigned = (k) => DC.state.a.setup[k === 'same' ? 'vial' : k] === OBJ.find((o) => o.k === k).right;
  function planPanel() {
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.15rem">Sort the experiment</p><p class="vx-note" style="margin:0 0 .5rem">Tap a picture, then tap where it belongs.</p><div class="vx-choices" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Things in the experiment">' +
      OBJ.map((o) => vx.choice({ act: 'v3obj', data: { k: o.k }, pic: o.svg, label: o.label, small: o.sub, pressed: live.setupSel === o.k, cls: assigned(o.k) ? 'ok' : '' })).join('') + '</div><div class="vx-choices" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Where it belongs">' +
      LAB.map((l) => vx.choice({ act: 'v3lab', data: { v: l[0] }, pic: vx.icon(l[2], 46), label: l[1], cls: '', pressed: false })).join('') + '</div>' + (setupDone() ? '<div class="vx-fb ok" role="status">The 25 °C room is the <strong>control</strong>: it is treated the same, except for the temperature.</div>' : '') + '</div>';
  }

  /* ---------- stage 1: choose, run, count, record ---------- */
  const chips = () => { const c = U().cond; return '<div class="vx-tray" role="group" aria-label="Choose a trial">' + [0, 1, 2, 3, 4].map((i) => { const v = rec(c)[i]; return '<button type="button" class="vx-step' + (typeof v === 'number' ? ' done' : '') + '" data-act="v3trial" data-i="' + i + '"' + (live.trial === i ? ' aria-current="step"' : '') + ' aria-label="Trial ' + (i + 1) + (typeof v === 'number' ? ', recorded ' + v + ' flies' : ', not recorded yet') + '">' + (typeof v === 'number' ? v : i + 1) + '</button>'; }).join('') + '</div>'; };
  function countSVG() {
    const c = U().cond, fl = DC.lab.positions(c, live.trial), base = DC.lab.svg(c, live.trial, 1, live.hl).replace(/<\/svg>$/, '');
    const hit = fl.map((f) => { const on = live.counted.includes(f.id); return '<g role="button" tabindex="0" data-act="v3tap" data-f="' + f.id + '" aria-pressed="' + on + '" aria-label="Fly ' + f.id + (on ? ', counted' : '') + '" style="pointer-events:none"><circle cx="' + f.x.toFixed(1) + '" cy="' + f.y.toFixed(1) + '" r="11" fill="' + (on ? 'rgba(255,211,107,.35)' : 'rgba(255,255,255,.01)') + '" stroke="' + (on ? '#e0a000' : 'none') + '" stroke-width="3.5"/>' + (on ? '<circle cx="' + (f.x + 12).toFixed(1) + '" cy="' + (f.y - 12).toFixed(1) + '" r="9" fill="#e0a000"/><text x="' + (f.x + 12).toFixed(1) + '" y="' + (f.y - 8).toFixed(1) + '" font-size="12" font-weight="900" text-anchor="middle" fill="#33220c" font-family="Arial,sans-serif">' + (live.counted.indexOf(f.id) + 1) + '</text>' : '') + '</g>'; }).join('');
    /* one forgiving tap zone: a tap picks the NEAREST fly (no overlapping circles); each fly is still its own keyboard-focusable button */
    return base.replace('role="img"', 'role="group"') + '<rect data-act="v3near" x="0" y="0" width="260" height="420" fill="transparent" style="cursor:pointer"/>' + hit + '</svg>';
  }
  function countPanel() {
    const c = U().cond, truth = D.conditions.find((x) => x.id === c).counts[live.trial], recorded = typeof rec(c)[live.trial] === 'number';
    return '<div class="vx-panel gold" id="c3count"><div class="spread"><strong>' + vx.icon('findings', 28) + ' Count the flies above the dashed line</strong><span class="vx-count" aria-hidden="true" style="font-size:1.1rem">' + live.num + '</span></div>' +
      '<div style="margin-top:.4rem"><div class="chartbox" style="padding:.2rem;max-width:300px;margin:0 auto">' + countSVG() + '</div><div style="margin-top:.6rem">' +
      '<p class="vx-note" style="margin:0 0 .4rem">Tap each fly whose body is above the line. Same job with the keyboard or a screen reader: use the buttons below.</p>' +
      '<div class="row" role="group" aria-label="How many flies are above the line?"><button type="button" class="vx-btn small ghost" data-act="v3num" data-d="-1" aria-label="One fewer">−</button><output id="c3out" class="vx-title" style="margin:0;min-width:2.2rem;text-align:center;font-size:1.6rem" aria-live="polite">' + live.num + '</output><button type="button" class="vx-btn small ghost" data-act="v3num" data-d="1" aria-label="One more">+</button></div>' +
      '<div class="row" style="margin-top:.5rem"><button type="button" class="vx-btn teal" data-act="v3record"' + (recorded ? '' : '') + '>' + vx.icon('clip', 22) + ' Record on the clipboard</button><button type="button" class="vx-btn small ghost" data-act="v3help" aria-pressed="' + live.hl + '">' + (live.hl ? 'Hide help' : 'Help me count') + '</button></div></div></div>' +
      (live.msg ? '<div class="vx-fb ' + (live.msg.startsWith('✓') ? 'ok' : 'no') + '" role="status">' + esc(live.msg) + '</div>' : '') +
      '<details class="vx-learn"><summary>Describe this trial in words</summary><div class="vx-note">' + esc(DC.lab.describe(c, live.trial)) + '</div></details></div>';
  }
  function runPanel() {
    const c = U().cond, cd = DC.cond(c);
    return '<div class="vx-tray" role="group" aria-label="Choose a vial">' + D.conditions.map((x) => ({ icon: 'vial', label: x.short + (x.role === 'control' ? ' (control)' : ''), act: 'v3cond', data: { c: x.id }, on: c === x.id, done: DC.recorded(x.id).length === D.trials })).map((t) => '<button type="button" class="vx-tool' + (t.done ? ' done' : '') + (t.on ? ' on' : '') + '" data-act="v3cond" data-c="' + t.data.c + '" aria-pressed="' + !!t.on + '">' + vx.icon('vial', 38) + '<span>' + esc(t.label) + '</span></button>').join('') + '</div>' + chips() +
      '<div style="text-align:center;margin:.5rem 0"><button type="button" class="vx-btn big" id="c3go" data-act="v3start"' + (live.phase === 'running' || live.phase === 'tap' ? ' disabled' : '') + '>' + vx.icon('timer', 30) + ' ' + (live.phase === 'done' ? 'Run it again' : 'Tap the vial and start') + '</button><div class="row" style="justify-content:center;margin-top:.4rem"><label class="skipchk"><input type="checkbox" id="c3fast" data-act="v3speed"' + (live.speed > 1 ? ' checked' : '') + '> Fast (3×)</label></div></div>' +
      (live.phase === 'done' ? countPanel() : '<div class="vx-panel"><p class="vx-note" style="margin:0;text-align:center">' + (typeof rec(c)[live.trial] === 'number' ? 'Trial ' + (live.trial + 1) + ' is recorded: <strong>' + rec(c)[live.trial] + '</strong> flies. You can run it again to look, or pick another trial.' : 'Each vial has 10 flies. You will do 5 trials in each vial (a one-minute rest between trials).') + '</p></div>');
  }

  /* ---------- stage 2: compare + variation ---------- */
  function varPanel() {
    const v = DC.state.det.c3var || {};
    const cards = [['Someone made a mistake', 'Throw those trials away.', 'bang'], ['Natural variation', 'Flies, taps and counting differ a little.', 'wave'], ['The flies cheated', 'They climbed on purpose.', 'star']];
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.15rem">Why are the five numbers not all the same?</p><div class="vx-choices" role="group" aria-label="Why the numbers differ">' + cards.map((c, i) => vx.choice({ act: 'v3var', data: { i }, pic: vx.icon(c[2], 56), label: c[0], small: c[1], cls: v.sel === i ? (i === 1 ? 'ok' : 'bad') : '' })).join('') + '</div>' + (v.ok ? '<div class="vx-fb ok" role="status">Yes. Repeating shows how much the count wobbles. All five trials use the <strong>same 10 flies</strong>, so they are repeated measurements, not independent replicates.</div>' : v.sel != null ? '<div class="vx-fb no" role="status">Not quite. Real measurements vary a little; we keep every trial.</div>' : '') + '</div>';
  }
  function comparePanel() {
    const cfg = DC.guidedChart({ id: 'l3', interactive: true });
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.15rem">Both vials, side by side</p><div class="chartbox" id="c3chart">' + DC.chart(cfg) + '</div><div class="readout" id="c3out2" role="status" aria-live="polite">Tap or focus a dot to read it.</div></div>' + varPanel();
  }
  function tableHTML() {
    let h = '<div class="tblwrap"><table class="tbl"><caption>Flies above the 8 cm line after 10 seconds (out of 10)</caption><thead><tr><th scope="col">Trial</th>' + D.conditions.map((c) => '<th scope="col">' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>';
    for (let i = 0; i < D.trials; i++) h += '<tr><th scope="row">' + (i + 1) + '</th>' + D.conditions.map((c) => '<td>' + (typeof rec(c.id)[i] === 'number' ? rec(c.id)[i] : '–') + '</td>').join('') + '</tr>';
    h += '</tbody></table></div>';
    if (vx.researcher() && DC.aComplete()) { const s = DC.aStats(); h += '<p class="vx-note">Means: ' + D.conditions.map((c) => c.short + ' = ' + DC.fmt(s[c.id].mean, 2)).join(' · ') + '. Ranges: ' + D.conditions.map((c) => c.short + ' = ' + s[c.id].min + ' to ' + s[c.id].max).join(' · ') + '.</p>'; }
    return h;
  }

  /* ---------- Path B: the research organizer as visual cards ---------- */
  function bBoard() {
    const b = DC.state.b, exp = b.type === 'experiment';
    const v = (k, icon, ttl, ph) => '<div class="vx-panel" style="margin:0"><div class="spread"><strong>' + vx.icon(icon, 30) + ' ' + ttl + '</strong></div><label class="sr-only" for="bv-' + k + '">' + esc(ttl) + '</label><textarea id="bv-' + k + '" data-bind="b.vars.' + k + '" style="min-height:4.2rem" placeholder="' + esc(ph) + '">' + esc(b.vars[k]) + '</textarea></div>';
    const missing = [!DC.bFilled('question') && 'a question (Chapter 2)', !(DC.bFilled('methods') || b.skip.methods || b.steps.some((x) => x.trim())) && 'one step', !(DC.bFilled('data') || b.skip.data || b.log.some((r) => r.label.trim() || String(r.value).trim())) && 'one evidence card'].filter(Boolean);
    return '<p class="vx-title">Plan your project</p><div class="grid3" role="group" aria-label="Planning cards">' + v('changed', 'thermo', exp ? 'What I change' : 'What is different', 'e.g. the room') + v('measured', 'ruler', 'What I look at', 'e.g. ants I count') + v('same', 'scale', 'What stays the same', 'e.g. the place') + '</div>' +
      '<p class="vx-title" style="margin-top:1rem">My steps</p><div class="vx-pack" id="stepCards">' + b.steps.map((st, i) => '<div class="vx-panel" style="margin:0"><div class="spread"><strong>Step ' + (i + 1) + '</strong><button type="button" class="vx-btn small ghost" data-act="bDelStep" data-i="' + i + '" aria-label="Remove step ' + (i + 1) + '">✕</button></div><label class="sr-only" for="st-' + i + '">Step ' + (i + 1) + '</label><input type="text" id="st-' + i + '" data-bind="b.steps.' + i + '" value="' + esc(st) + '" placeholder="What did you do?"></div>').join('') + '<button type="button" class="vx-card" data-act="bAddStep" style="border-style:dashed">' + vx.icon('star', 40) + '<span>Add a step</span></button></div>' +
      '<p class="vx-title" style="margin-top:1rem">My evidence cards</p><p class="vx-note">Only write what you really saw or measured.</p><div class="vx-pack" style="grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))">' + b.log.map((r, i) => '<div class="vx-panel" style="margin:0"><div class="spread"><strong>' + vx.icon('data', 28) + ' Card ' + (i + 1) + '</strong><button type="button" class="vx-btn small ghost" data-act="bDelLog" data-i="' + i + '" aria-label="Remove card ' + (i + 1) + '">✕</button></div>' + [['label', 'What / when'], ['value', 'Number (optional)'], ['group', 'Group (optional)'], ['note', 'Note']].map((f) => '<label class="sr-only" for="lg-' + i + f[0] + '">' + f[1] + ' on card ' + (i + 1) + '</label><input type="text" ' + (f[0] === 'value' ? 'inputmode="decimal" ' : '') + 'id="lg-' + i + f[0] + '" data-bind="b.log.' + i + '.' + f[0] + '" value="' + esc(r[f[0]]) + '" placeholder="' + f[1] + '" style="margin-bottom:.3rem">').join('') + '</div>').join('') + '<button type="button" class="vx-card" data-act="bAddLog" style="border-style:dashed">' + vx.icon('data', 40) + '<span>Add an evidence card</span></button></div>' +
      '<div class="vx-panel gold" style="margin-top:1rem"><strong>' + (missing.length ? 'Still needed: ' + esc(missing.join(', ')) : '✓ Everything needed is here') + '</strong><label class="skipchk" style="margin-top:.5rem;font-size:1rem;color:var(--ink)"><input type="checkbox" data-bind="b.organizerSeen"' + (b.organizerSeen ? ' checked' : '') + '> I looked everything over and I am ready.</label></div>';
  }

  /* ---------- the chapter ---------- */
  vx.chapter(3, {
    render() {
      if (!DC.state.path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      if (!DC.$('#c3scene') && DC.state.path === 'A') { reset(); live.trial = nextTrial(U().cond); }
      const [txt, st] = say();
      if (DC.state.path === 'B') {
        const scene = vx.scene({ art: vx.svg(A.wall('#f3ead2', 440, '#d9bd88') + A.window(70, 70, 120, 140) + A.board(300, 70, 360, 200) + A.desk(250, 330, 460) + A.plant(850, 450, 1.1) + A.posterMini(740, 90, 110, 140, A.C.coral), 'A cozy research corner with a notebook board and a desk'), cls: '' });
        return '<div class="vx-stage stack"><div class="vx-main">' + scene + vx.guide(st, 'Let’s plan your project with cards!') + '</div><div class="vx-side">' + bBoard() + vx.benchBar(3) + '</div></div>';
      }
      const s = stage(), u = U(), body = s === 0 ? planPanel() : s === 1 ? runPanel() : comparePanel();
      return '<div class="vx-stage"><div class="vx-main">' + vx.scene({ art: sceneArt(), id: 'c3scene', hot: hots() }) + vx.guide(st, txt) + '</div><div class="vx-side">' + '<ol class="vx-steps" aria-label="Progress: plan, trials, compare" style="list-style:none;padding:0">' + ['Plan', 'Trials', 'Compare'].map((l, i) => '<li class="vx-step' + (i < s ? ' done' : '') + '"' + (i === s ? ' aria-current="step"' : '') + ' style="width:auto;padding:0 .9rem;cursor:default">' + (i < s ? '✓ ' : '') + l + '</li>').join('') + '</ol>' + body +
        '<details class="vx-learn"><summary>Data table (' + nrec() + ' of 10 recorded)</summary>' + tableHTML() + '</details>' + vx.benchBar(3) + '</div></div>';
    },
    mount() {
      if (DC.state.path === 'B') { DC.onBind('b.', () => DC.softUpdate()); return; }
      if (DC.$('#c3chart')) DC.chart.attach(DC.$('#c3chart'), DC.$('#c3out2'));
    }
  });

  /* ---------- trial loop (animation uses the same deterministic positions) ---------- */
  function stopLoop() { cancelAnimationFrame(live.raf); clearTimeout(live.tapT); }
  function paintLive() {
    const c = U().cond, g = DC.$('#vxV-' + c); if (g) g.innerHTML = vialMarkup(c); const t = DC.$('#vxTimerTxt'); if (t) t.textContent = (live.t * D.seconds).toFixed(1) + ' s';
  }
  function finishTrial() { live.phase = 'done'; live.t = 1; live.counted = []; live.num = 0; live.msg = ''; live.tries = 0; DC.state.a.ran[U().cond][live.trial] = 1; DC.save(); DC.refresh('#c3count'); DC.say('Time is up. Count the flies above the dashed line.'); }
  DC.acts.v3start = () => {
    if (live.phase === 'running' || live.phase === 'tap' || !setupDone()) return;
    live.hl = false; live.msg = ''; live.counted = []; live.num = 0; live.t = 0;
    const go = () => { live.phase = 'running'; if (vx.reduced()) { finishTrial(); return; } DC.refresh('#c3go'); const dur = (D.seconds * 1000) / live.speed, t0 = performance.now(); const step = (now) => { live.t = Math.min(1, (now - t0) / dur); paintLive(); if (live.t < 1) live.raf = requestAnimationFrame(step); else finishTrial(); }; live.raf = requestAnimationFrame(step); };
    if (vx.reduced()) { go(); return; }
    live.phase = 'tap'; paintLive(); DC.say('Tap, tap, tap!'); live.tapT = setTimeout(go, 650);
  };
  function reset() { stopLoop(); live.phase = 'idle'; live.t = 0; live.hl = false; live.msg = ''; live.counted = []; live.num = 0; }
  DC.acts.v3cond = (b) => { reset(); U().cond = b.dataset.c; live.trial = nextTrial(b.dataset.c); DC.save(); DC.refresh('[data-act=v3cond][data-c=' + b.dataset.c + ']'); };
  DC.acts.v3trial = (b) => { reset(); live.trial = +b.dataset.i; DC.refresh('[data-act=v3trial][data-i="' + live.trial + '"]'); };
  DC.acts.v3speed = (b) => { live.speed = b.checked ? 3 : 1; };
  DC.acts.v3help = () => { live.hl = !live.hl; DC.refresh('[data-act=v3help]'); };
  DC.acts.v3stage = () => {};
  DC.acts.v3near = (b, e) => {
    const svg = b.ownerSVGElement, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    let best = null, bd = 1e9; DC.lab.positions(U().cond, live.trial).forEach((f) => { const d = Math.hypot(f.x - q.x, f.y - q.y); if (d < bd) { bd = d; best = f; } });
    if (best && bd <= 26) DC.acts.v3tap({ dataset: { f: best.id } }); else { live.msg = ''; }
  };
  DC.acts.v3tap = (b) => {
    const id = +b.dataset.f, f = DC.lab.positions(U().cond, live.trial).find((x) => x.id === id), i = live.counted.indexOf(id);
    if (i >= 0) { live.counted.splice(i, 1); live.msg = ''; } else if (f.cross) { live.counted.push(id); live.msg = ''; } else { live.msg = 'That fly is below the dashed line, so it does not count.'; DC.say(live.msg); }
    live.num = live.counted.length; DC.refresh('[data-act=v3tap][data-f="' + id + '"]');
  };
  DC.acts.v3num = (b) => { live.num = Math.max(0, Math.min(D.flies, live.num + (+b.dataset.d))); const o = DC.$('#c3out'); if (o) o.textContent = live.num; const k = DC.$('#c3count .vx-count'); if (k) k.textContent = live.num; };
  DC.acts.v3record = () => {
    const c = U().cond, truth = D.conditions.find((x) => x.id === c).counts[live.trial];
    if (live.num === truth) {
      DC.state.a.rec[c][live.trial] = live.num; DC.save(); live.msg = '✓ Recorded ' + live.num + ' on the clipboard.'; const ni = rec(c).findIndex((v) => typeof v !== 'number');
      if (ni >= 0) { live.trial = ni; } else { const other = D.conditions.find((x) => DC.recorded(x.id).length < D.trials); if (other) { U().cond = other.id; live.trial = nextTrial(other.id); } }
      live.phase = 'idle'; live.t = 0; live.counted = []; live.num = 0; DC.refresh('#c3go'); DC.softUpdate(); DC.say(live.msg); live.msg = '';
    } else { live.tries++; live.msg = live.num > truth ? 'Look again: fewer flies are above the dashed line.' : 'Look again: more flies are above the dashed line.'; if (live.tries >= 2) live.msg += ' Try “Help me count”.'; DC.refresh('#c3count'); DC.say(live.msg); }
  };
  DC.acts.v3obj = (b) => { live.setupSel = b.dataset.k; DC.refresh('[data-act=v3obj][data-k=' + b.dataset.k + ']'); };
  DC.acts.v3lab = (b) => {
    const k = live.setupSel; if (!k) { DC.say('First tap a picture, then tap where it belongs.'); vx.say('First tap a picture on the top row.', 'curious'); return; }
    const o = OBJ.find((x) => x.k === k); if (o.right === b.dataset.v) { const S = DC.state.a.setup; if (k === 'temp') S.temp = 'changed'; else if (k === 'count') S.count = 'measured'; else { S.vial = 'same'; S.nflies = 'same'; S.tod = 'same'; S.taps = 'same'; } live.setupSel = null; DC.save(); DC.refresh('[data-act=v3obj]'); DC.softUpdate(); DC.say('Yes! ' + o.hint); } else { DC.refresh('[data-act=v3lab][data-v=' + b.dataset.v + ']'); vx.say('Not quite. ' + o.hint, 'thinking'); }
  };
  DC.acts.v3var = (b) => { const i = +b.dataset.i, ok = i === 1, p = DC.state.det.c3var || {}; DC.state.det.c3var = { sel: i, ok: ok || !!p.ok, tries: (p.tries || 0) + 1 }; DC.save(); DC.refresh('[data-act=v3var][data-i="' + i + '"]'); DC.softUpdate(); };
  /* bench objects: each one teaches something */
  DC.acts.v3therm = (b) => vx.say(b.dataset.c === 'control' ? 'This room is 25 °C. It is our comparison, the control.' : 'This room is 18 °C. It is cooler. This is what we change.', 'explain');
  DC.acts.v3ruler = () => vx.say('The dashed line is at 8 cm. A fly counts only if its body is above it.', 'explain');
  DC.acts.v3note = () => vx.say('The notebook is for notes. The Researcher workbench has the full tools.', 'explain');
  DC.acts.v3clip = () => { const el = DC.$('summary'); const d = DC.$('details.vx-learn'); if (d) { d.open = true; d.scrollIntoView({ block: 'center', behavior: vx.reduced() ? 'auto' : 'smooth' }); } vx.say('The clipboard keeps every count. Here is the data table.', 'explain'); };
  DC.acts.v3zoom = () => { if (live.phase === 'done') { const c = DC.$('#c3count'); if (c) c.scrollIntoView({ block: 'center' }); } else vx.say('The magnifier helps after a trial: then you count the flies.', 'explain'); };
})();
