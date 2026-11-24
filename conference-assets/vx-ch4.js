/* Chapter 4, visual adventure: Data Detective HQ. Same engine and the same saved answers (det.d_mean ... det.limits) as the original chapter. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc, D = DC.DATA;
  const U = () => { const u = vx.c(4); if (u.case == null) u.case = 0; u.sorted = u.sorted || []; u.oi = u.oi || {}; u.lim = u.lim || {}; return u; };
  const okq = (id) => !!(DC.state.det[id] && DC.state.det[id].ok);
  const CASES = [
    { k: 'sort', label: 'Sort the cards', icon: 'data', done: () => U().sorted.length === 10, say: 'Let’s collect the evidence! Tap each card.' },
    { k: 'avg', label: 'Find the averages', icon: 'scale', done: () => okq('d_mean') && okq('d_diff'), say: 'An average shares the flies out evenly.' },
    { k: 'graph', label: 'Read the graph', icon: 'graph', done: () => okq('d_range'), say: 'Each dot is one trial. Look at the spread!' },
    { k: 'axis', label: 'The tricky graph', icon: 'ruler', done: () => okq('d_axis'), say: 'Careful! A graph can trick us. Slide the axis.' },
    { k: 'seen', label: 'Seen or guessed?', icon: 'findings', done: () => !!(DC.state.det.d_oi && DC.state.det.d_oi.ok), say: 'What did we SEE? What do we only THINK?' },
    { k: 'claim', label: 'Claim check', icon: 'question', done: () => okq('d_cause') && okq('d_repl'), say: 'A scientist says: “The cooler flies are LAZY!” Hmm…' },
    { k: 'limits', label: 'Find the limits', icon: 'limits', done: () => okq('limits'), say: 'Every study has limits. Which ones are real?' }
  ];
  const AIDS = ['d_mean', 'd_diff', 'd_range', 'd_oi', 'd_cause', 'd_repl', 'limits', 'd_axis'];

  /* ---------- art: the evidence board ---------- */
  const PIN = [[22, 25], [41, 23], [60, 25], [79, 23], [70, 52], [50, 54], [30, 52]];   // percent positions of the seven case pins
  A.detective = (solved) => A.wall('#ece3f3', 470, '#cdb78a') + A.window(60, 60, 110, 140) + A.lamp(840, 250) + A.r(150, 38, 660, 380, '#8d6336', 16) + A.r(166, 54, 628, 348, '#d9a86a', 8) +
    PIN.map((q, i) => (i < 6 ? A.ln(q[0] * 9.6, q[1] * 6, PIN[i + 1][0] * 9.6, PIN[i + 1][1] * 6, '#c4655a', 3, 'stroke-dasharray="6 5"') : '')).join('') +
    PIN.map((q, i) => A.g('translate(' + q[0] * 9.6 + ' ' + q[1] * 6 + ') rotate(' + ((i * 7) % 9 - 4) + ')', A.r(-44, -30, 88, 62, '#fffdf6', 4, 'stroke="#b88a4a" stroke-width="2"') + A.r(-34, -20, 68, 8, '#c9d8cc', 2) + A.r(-34, -6, 50, 8, '#c9d8cc', 2) + A.r(-34, 8, 58, 8, '#c9d8cc', 2) + A.c(0, -34, 9, solved[i] ? '#2d7a52' : '#c4655a', 'stroke="#fff" stroke-width="2"') + (solved[i] ? A.p('M-4 -34 l3 4 6 -8', 'none', 'stroke="#fff" stroke-width="2.6" stroke-linecap="round"') : ''))).join('') +
    A.desk(300, 478, 360) + A.g('translate(700 505)', A.c(0, 0, 30, 'rgba(255,255,255,.5)', 'stroke="#c99a30" stroke-width="7"') + A.ln(21, 21, 56, 54, '#8d5a2b', 9)) + A.plant(900, 470, 1);

  /* ---------- small helpers ---------- */
  const flyRow = (n) => '<svg viewBox="0 0 ' + Math.max(40, n * 15) + ' 26" style="width:100%;max-width:' + Math.max(60, n * 17) + 'px;height:auto" aria-hidden="true">' + Array.from({ length: n }, (_, i) => A.fly(10 + i * 15, 14, 0.7, i % 2 ? 10 : -8)).join('') + '</svg>';
  const rec = (cid) => DC.state.a.rec[cid];
  const st = () => DC.aStats();
  const dec = (n) => DC.fmt(n, 1);

  /* ---------- case 1: sort the evidence cards ---------- */
  function sortPanel() {
    const u = U(), cards = vx.shuffle(D.conditions.flatMap((c) => rec(c.id).map((v, i) => ({ id: c.id + i, cid: c.id, v }))), 'cards'), left = cards.filter((c) => !u.sorted.includes(c.id));
    const bin = (c) => '<div class="vx-panel" style="margin:0;border-color:' + c.color + '"><strong style="color:' + c.color + '">' + vx.icon('thermo', 26) + ' ' + esc(c.label) + '</strong><div class="row" style="margin-top:.4rem;min-height:2.6rem" role="group" aria-label="Cards in the ' + c.short + ' group">' + cards.filter((x) => x.cid === c.id && u.sorted.includes(x.id)).map((x) => '<span class="vx-step done" style="width:2.2rem;height:2.2rem;background:' + c.color + '">' + x.v + '</span>').join('') + '</div></div>';
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem">Tap a card. It flies to its group.</p><div class="vx-choices" style="grid-template-columns:repeat(5,minmax(0,1fr))" role="group" aria-label="Trial cards">' +
      (left.length ? left.map((c) => vx.choice({ act: 'v4sort', data: { id: c.id }, pic: flyRow(c.v), label: String(c.v), small: D.conditions.find((x) => x.id === c.cid).short })).join('') : '<p class="vx-fb ok" style="grid-column:1/-1">All ten cards are sorted!</p>') + '</div><div class="grid2" style="margin-top:.6rem">' + D.conditions.map(bin).join('') + '</div></div>';
  }
  DC.acts.v4sort = (b) => { const u = U(); if (!u.sorted.includes(b.dataset.id)) u.sorted.push(b.dataset.id); DC.save(); DC.refresh('#v4panel'); DC.softUpdate(); if (u.sorted.length === 10) DC.say('All ten cards are sorted. Two groups!'); };

  /* ---------- case 2: averages ---------- */
  function avgPanel() {
    const s = st(), m1 = s.control.mean, m2 = s.cool.mean;
    const eq = (c) => '<div class="vx-panel" style="margin:0;border-color:' + c.color + ';text-align:center"><strong style="color:' + c.color + '">' + esc(c.short) + '</strong><div style="font:900 1rem var(--vx-font)">' + rec(c.id).join(' + ') + ' = ' + s[c.id].sum + '</div><div class="vx-note">share evenly among 5 trials</div><div class="vx-title" style="font-size:1.5rem;margin:0">' + dec(s[c.id].mean) + ' flies</div></div>';
    const q1 = [Math.round(m1) - 1, m1, Math.round(m1) + 1].map((v) => ({ label: dec(v), ok: Math.abs(v - m1) < 1e-9, fb: 'Add the five counts (' + s.control.sum + ') and share them among 5 trials: ' + dec(m1) + '.', pic: '' }));
    const q2 = [m1 - m2 - 1.8, m1 - m2, m2].map((v) => ({ label: dec(v), ok: Math.abs(v - (m1 - m2)) < 1e-9, fb: 'Subtract the averages: ' + dec(m1) + ' − ' + dec(m2) + ' = ' + dec(m1 - m2) + '.', pic: '' }));
    return '<div class="vx-panel"><div class="grid2">' + D.conditions.map(eq).join('') + '</div></div><div class="vx-panel"><p class="vx-title" style="font-size:1.05rem">What is the 25 °C average?</p>' + vx.quiz('d_mean', vx.shuffle(q1, 'q1'), { q: '25 degree average', cols: 3 }) + '<p class="vx-title" style="font-size:1.05rem;margin-top:.8rem">How many more flies, on average, at 25 °C than at 18 °C?</p>' + vx.quiz('d_diff', vx.shuffle(q2, 'q2'), { q: 'difference', cols: 3 }) + '</div>';
  }

  /* ---------- case 3: the graph ---------- */
  const graphCfg = (o) => DC.guidedChart(Object.assign({ id: 'dg', interactive: true }, o || {}));
  function graphPanel() {
    const s = st(), cfg = graphCfg({ showRange: true, title: '' });
    const q = [[s.cool.min + ' to ' + s.cool.max, true, 'The lowest 18 °C trial had ' + s.cool.min + ' and the highest had ' + s.cool.max + '.'], [dec(s.cool.mean), false, 'That is the average, not the lowest-to-highest.'], [s.control.min + ' to ' + s.control.max, false, 'Those are the 25 °C counts.']].map((x) => ({ label: x[0], ok: x[1], fb: x[2] }));
    return '<div class="vx-panel"><div class="chartbox" id="v4chart">' + DC.chart(cfg) + '</div><div class="readout" id="v4out" role="status" aria-live="polite">Tap or focus a dot to read it. The black bar on the right of each group shows lowest to highest.</div></div><div class="vx-panel"><p class="vx-title" style="font-size:1.05rem">Lowest to highest for the <strong>18 °C</strong> group?</p>' + vx.quiz('d_range', vx.shuffle(q, 'q3'), { q: 'range', cols: 3 }) + '</div>';
  }

  /* ---------- case 4: the tricky axis (a slider you can move) ---------- */
  function axisCfg(v) { const c = graphCfg({ id: 'ax' + v, title: '' }); c.kind = 'bar'; c.yMin = v; c.yMax = 10; c.step = 1; c.showPoints = true; return c; }
  function axisPanel() {
    const v = +(vx.c(4).axis || 0), s = st(), m1 = s.control.mean, m2 = s.cool.mean, vis = v ? ((m2 - v) / (m1 - v)) * 100 : (m2 / m1) * 100, real = (m2 / m1) * 100;
    const q = [['Axis from 0', true, 'Bars should start at zero so their heights match the numbers.', 0], ['Axis from 3', false, 'It makes the 18 °C bar look much smaller than it really is.', 3]].map((x) => ({ label: x[0], ok: x[1], fb: x[2], pic: DC.chart(Object.assign(axisCfg(x[3]), { id: 'axq' + x[3], title: '', yTitle: '', xTitle: '', h: 220, interactive: false })) }));
    return '<div class="vx-panel"><div class="field"><label class="lbl" for="v4slide">Start the vertical axis at: <output id="v4av">' + v + '</output></label><input type="range" id="v4slide" min="0" max="3" step="1" value="' + v + '" data-bind="ui.c.4.axis" aria-describedby="v4axfb"></div><div class="chartbox" id="v4axchart">' + DC.chart(axisCfg(v)) + '</div>' +
      '<div class="vx-fb ' + (v ? 'no' : 'ok') + '" id="v4axfb" role="status">' + (v ? 'The 18 °C bar now looks only about <strong>' + Math.round(vis) + '%</strong> as tall as the 25 °C bar. In truth it is about <strong>' + Math.round(real) + '%</strong>.' : 'Honest: the 18 °C bar is about <strong>' + Math.round(real) + '%</strong> as tall as the 25 °C bar.') + '</div></div>' +
      '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem">Which graph is honest?</p>' + vx.quiz('d_axis', q, { q: 'honest graph', cols: 2 }) + '</div>';
  }

  /* ---------- case 5: seen or guessed ---------- */
  function oiItems() { const s = st(), m1 = s.control.mean, m2 = s.cool.mean; return [['In trial 2 at 18 °C, ' + rec('cool')[1] + ' of 10 flies were above the line.', 'obs', 'A count someone made: an observation.'], ['The cooler flies were less energetic.', 'int', '"Energetic" was not measured. It is an idea about why.'], ['On average, 25 °C had more flies above the line than 18 °C (' + dec(m1) + ' compared with ' + dec(m2) + ').', 'obs', 'A summary of the numbers we collected.'], ['Cold air makes flies tired.', 'int', 'An explanation that needs more evidence.']]; }
  function seenPanel() {
    const u = U(), it = oiItems(), d = DC.state.det.d_oi || {};
    return '<div class="vx-panel"><p class="vx-note" style="margin:0 0 .4rem">Tap a statement, then tap where it goes.</p><div class="vx-choices" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Statements">' +
      it.map((x, i) => vx.choice({ act: 'v4oi', data: { i }, pic: u.oi[i] ? vx.icon(u.oi[i] === 'obs' ? 'findings' : 'idea', 40) : vx.icon('abstract', 40), label: x[0], small: u.oi[i] ? (u.oi[i] === 'obs' ? 'I saw it' : 'I think it means') + (d.checked ? (u.oi[i] === x[1] ? ' ✓' : ' ✗ ' + x[2]) : '') : '', pressed: u.sel === i, cls: d.checked && u.oi[i] ? (u.oi[i] === x[1] ? 'ok' : 'bad') : '' })).join('') + '</div>' +
      '<div class="vx-choices" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Where it goes">' + vx.choice({ act: 'v4bin', data: { v: 'obs' }, pic: vx.icon('findings', 44), label: 'I SAW it', small: 'measured or counted' }) + vx.choice({ act: 'v4bin', data: { v: 'int' }, pic: vx.icon('idea', 44), label: 'I THINK it means', small: 'an idea that needs evidence' }) + '</div>' +
      '<div class="row" style="margin-top:.5rem"><button type="button" class="vx-btn teal" data-act="v4check"' + (Object.keys(u.oi).length < 4 ? ' disabled' : '') + '>Check my cards</button></div>' + (d.checked ? '<div class="vx-fb ' + (d.ok ? 'ok' : 'no') + '" role="status">' + (d.ok ? 'All sorted! Interpretations are ideas that need evidence.' : 'Some cards are in the wrong place. Move them and check again.') + '</div>' : '') + '</div>';
  }
  DC.acts.v4oi = (b) => { U().sel = +b.dataset.i; DC.refresh('[data-act=v4oi][data-i="' + b.dataset.i + '"]'); };
  DC.acts.v4bin = (b) => { const u = U(); if (u.sel == null) { vx.say('First tap a statement.', 'curious'); return; } u.oi[u.sel] = b.dataset.v; const sel = {}; Object.keys(u.oi).forEach((k) => (sel[k] = u.oi[k])); DC.state.det.d_oi_sel = sel; DC.state.det.d_oi = { checked: false, ok: !!(DC.state.det.d_oi && DC.state.det.d_oi.ok) }; u.sel = null; DC.save(); DC.refresh('[data-act=v4oi]'); };
  DC.acts.v4check = () => { const u = U(), ok = oiItems().every((x, i) => u.oi[i] === x[1]); DC.state.det.d_oi = { checked: true, ok: ok || !!(DC.state.det.d_oi && DC.state.det.d_oi.ok) }; DC.save(); DC.refresh('[data-act=v4check]'); DC.softUpdate(); DC.say(ok ? 'All sorted correctly.' : 'Some cards are in the wrong place.'); };

  /* ---------- case 6: claim check ---------- */
  function claimPanel() {
    const s = st(), m1 = s.control.mean, m2 = s.cool.mean;
    const q1 = [['Cold makes ALL flies climb less. Proven!', false, '"All flies" and "proven" go far beyond 20 simulated flies in two vials.', 'bang'], ['Fewer flies climbed at 18 °C (' + dec(m2) + ' vs ' + dec(m1) + '). That fits the prediction, but it is one small test.', true, 'It says what was found, that it fits the prediction, and what it cannot show.', 'check'], ['Temperature does nothing.', false, 'The data do not show that: the 18 °C counts were lower.', 'bang'], ['We learned nothing.', false, 'Too cautious. The data do tell us something about these groups.', 'bang']].map((x) => ({ label: x[0], ok: x[1], fb: x[2], pic: vx.icon(x[3], 40) }));
    const five = (same) => '<svg viewBox="0 0 150 50" aria-hidden="true" style="width:100%;max-width:150px;height:auto">' + [0, 1, 2, 3, 4].map((i) => A.r(8 + i * 28, 8, 18, 34, same ? '#e4f3f1' : ['#d7efe9', '#fde7c4', '#e8dcf2', '#dbeaf7', '#f4d9d3'][i], 6, 'stroke="#1d5a5a" stroke-width="2"')).join('') + '</svg>';
    const q2 = [['Five different groups of flies', false, 'No. The same 10 flies were used every time.', five(false)], ['The same 10 flies, five times', true, 'Right: repeated measurements. Independent replicates would need new groups of flies in new vials.', five(true)]].map((x) => ({ label: x[0], ok: x[1], fb: x[2], pic: x[3] }));
    return '<div class="vx-panel gold"><div style="text-align:center"><svg viewBox="0 0 120 110" aria-hidden="true" style="width:96px;height:auto">' + DC.avatar(DC.SCIENTISTS[3].look, 100).replace('<svg ', '<svg x="10" y="10" ') + '</svg></div><p class="vx-title" style="text-align:center;font-size:1.2rem">“The cooler flies are LAZY!”</p><p class="vx-note" style="text-align:center;margin:0">Is that a measurement, or a guess? What do our data really support?</p></div>' +
      '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem">Which statement fits our data best?</p>' + vx.quiz('d_cause', vx.shuffle(q1, 'q4'), { q: 'best supported statement', cols: 2 }) + '<p class="vx-title" style="font-size:1.05rem;margin-top:.8rem">How did we get our five trials?</p>' + vx.quiz('d_repl', q2, { q: 'where the trials came from', cols: 2 }) + '</div>';
  }

  /* ---------- case 7: limits ---------- */
  const LIM = [['Only 10 flies in each group', true, 'A small group may not describe other flies.'], ['One vial per temperature, so the vial and the temperature are mixed up', true, 'We cannot separate "temperature" from "this vial and these flies".'], ['The same flies were used in all 5 trials', true, 'These are repeated measurements, not independent replicates.'], ['Counting by eye can be a little off', true, 'A second counter or a photo would help.'], ['The data are simulated', true, 'They teach thinking; they do not tell us about real flies.'], ['We used a ruler', false, 'Using a ruler is good practice, not a limit.'], ['We tested many temperatures', false, 'We tested only two, and that is a limit.']];
  function limitsPanel() {
    const u = U(), d = DC.state.det.limits || {};
    return '<div class="vx-panel"><p class="vx-note" style="margin:0 0 .4rem">Tap every card that is a <strong>real limit</strong> of this study.</p><div class="vx-choices" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Possible limits">' + LIM.map((x, i) => vx.choice({ act: 'v4lim', data: { i }, pic: vx.icon('limits', 34), label: x[0], small: d.checked ? ((!!u.lim[i] === x[1] ? '✓ ' : '✗ ') + x[2]) : '', pressed: !!u.lim[i], cls: d.checked ? (!!u.lim[i] === x[1] ? 'ok' : 'bad') : '' })).join('') + '</div><div class="row"><button type="button" class="vx-btn teal" data-act="v4limcheck">Check my choices</button></div>' + (d.checked ? '<div class="vx-fb ' + (d.ok ? 'ok' : 'no') + '" role="status">' + (d.ok ? 'Yes! Naming limits honestly is a strength of good science.' : 'Not all choices match yet. Read the notes and change your cards.') + '</div>' : '') + '</div>';
  }
  DC.acts.v4lim = (b) => { const u = U(), i = +b.dataset.i; u.lim[i] = !u.lim[i]; const sel = {}; LIM.forEach((_, k) => (sel[k] = !!u.lim[k])); DC.state.det.limits_sel = sel; DC.state.det.limits = { checked: false, ok: okq('limits') }; DC.save(); DC.refresh('[data-act=v4lim][data-i="' + i + '"]'); };
  DC.acts.v4limcheck = () => { const u = U(), ok = LIM.every((x, i) => !!u.lim[i] === x[1]); DC.state.det.limits = { checked: true, ok: ok || okq('limits') }; DC.save(); DC.refresh('[data-act=v4limcheck]'); DC.softUpdate(); DC.say(ok ? 'Yes! Those are all the real limits.' : 'Not all choices match yet.'); };

  /* ---------- Path B: evidence board ---------- */
  const KINDS = [['compare', 'Compare groups', 'graph'], ['cats', 'Amounts of different things', 'data'], ['time', 'Changes over time', 'wave'], ['words', 'Words and pictures only', 'abstract']];
  function bPanel() {
    const b = DC.state.b, c = b.chart, rows = DC.bLogNumeric();
    let h = '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem">What kind of evidence do I have?</p><div class="vx-choices" role="group" aria-label="Kind of evidence">' + KINDS.map((k) => vx.choice({ act: 'v4kind', data: { v: k[0] }, pic: vx.icon(k[2], 46), label: k[1], pressed: c.kind === k[0] })).join('') + '</div></div>';
    if (c.kind && c.kind !== 'auto' && c.kind !== 'words') {
      h += '<div class="vx-panel"><div class="grid3">' + [['byt', 'yTitle', 'Vertical axis title'], ['bun', 'unit', 'Unit'], ['bxt', 'xTitle', 'Horizontal axis title']].map((f) => '<div class="field"><label for="' + f[0] + '">' + f[2] + '</label><input type="text" id="' + f[0] + '" data-bind="b.chart.' + f[1] + '" value="' + esc(c[f[1]]) + '"></div>').join('') + '</div>' +
        (rows.length >= 2 ? '<div class="chartbox" id="bBox">' + DC.chart(DC.bChartCfg()) + '</div><div class="readout" id="bOut" role="status" aria-live="polite">Tap or focus a point to read it.</div>' : '<div class="vx-fb info">Add at least two numbers to your evidence cards in Chapter 3. Nothing is made up for you.</div>') + '</div>';
    } else if (c.kind === 'words') h += '<div class="vx-fb ok">Not every project needs a graph. Your observation cards can be your main evidence.</div>';
    h += '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem">My claims</p>' + b.claims.map((cl, i) => '<div class="vx-panel" style="margin:.4rem 0"><label class="sr-only" for="cl-' + i + 't">Claim ' + (i + 1) + '</label><textarea id="cl-' + i + 't" data-bind="b.claims.' + i + '.text" placeholder="I think my project shows…" style="min-height:3.4rem">' + esc(cl.text) + '</textarea><div class="row" style="margin:.4rem 0" role="group" aria-label="Kind of claim ' + (i + 1) + '"><button type="button" class="vx-btn small ' + (cl.kind === 'obs' ? 'teal' : 'ghost') + '" data-act="v4ckind" data-i="' + i + '" data-v="obs" aria-pressed="' + (cl.kind === 'obs') + '">I saw it</button><button type="button" class="vx-btn small ' + (cl.kind === 'int' ? 'teal' : 'ghost') + '" data-act="v4ckind" data-i="' + i + '" data-v="int" aria-pressed="' + (cl.kind === 'int') + '">I think it means</button></div><label class="sr-only" for="cl-' + i + 'e">My evidence</label><input type="text" id="cl-' + i + 'e" data-bind="b.claims.' + i + '.evidence" value="' + esc(cl.evidence) + '" placeholder="Which card or number shows it?"></div>').join('') + '<button type="button" class="vx-btn small ghost" data-act="bAddClaim">+ Another claim</button></div>';
    const q1 = [['The window plants grew 3 cm more than the closet plants.', true, 'It says what was measured.'], ['The window plants grew more because they are happier.', false, '"Happier" was not measured: an interpretation.'], ['Light is the reason all plants grow.', false, 'A big general claim, not an observation.']].map((x) => ({ label: x[0], ok: x[1], fb: x[2] }));
    const q2 = [['Yes, five measurements are five replicates', false, 'Repeating on the same sample is useful, but replicates use new samples.'], ['No: new samples would be independent replicates', true, 'Repeats help with measuring error; new samples show if it holds more generally.']].map((x) => ({ label: x[0], ok: x[1], fb: x[2] }));
    return h + '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem">Which is an OBSERVATION?</p>' + vx.quiz('d_b_oi', q1, { cols: 1 }) + '<p class="vx-title" style="font-size:1.05rem;margin-top:.8rem">Same sample measured 5 times: independent replicates?</p>' + vx.quiz('d_b_rep', q2, { cols: 1 }) + '</div>';
  }
  DC.acts.v4kind = (b) => { DC.state.b.chart.kind = b.dataset.v; DC.save(); DC.refresh('[data-act=v4kind][data-v=' + b.dataset.v + ']'); DC.softUpdate(); };
  DC.acts.v4ckind = (b) => { DC.state.b.claims[+b.dataset.i].kind = b.dataset.v; DC.save(); DC.refresh('[data-act=v4ckind][data-i="' + b.dataset.i + '"][data-v=' + b.dataset.v + ']'); DC.softUpdate(); };

  /* ---------- the chapter ---------- */
  const solved = () => CASES.map((c) => !!c.done());
  vx.chapter(4, {
    render() {
      const S = DC.state;
      if (!S.path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      const scene = (hot, sv) => vx.scene({ art: vx.svg(A.detective(sv), 'The detective room: a big evidence board with seven pinned cards joined by string, a desk and a magnifier'), hot });
      if (S.path === 'B') return '<div class="vx-stage stack"><div class="vx-main">' + scene([], new Array(7).fill(false)) + vx.guide(DC.isDone(4) ? 'celebrate' : 'thinking', DC.isDone(4) ? 'Case closed! On to the Abstract Workshop!' : 'Show your evidence honestly. Only use what you have!') + '</div><div class="vx-side">' + bPanel() + vx.benchBar(4) + '</div></div>';
      if (!DC.aComplete()) return '<div class="vx-stage"><div class="vx-main">' + scene([], solved()) + vx.guide('encourage', 'We need all ten counts first! Visit the lab.') + '</div><div class="vx-side"><div class="vx-panel"><button type="button" class="vx-btn big" data-act="go" data-n="3">Back to the lab</button></div></div></div>';
      const u = U(), sv = solved(), cur = CASES[u.case], all = DC.isDone(4);
      const panel = [sortPanel, avgPanel, graphPanel, axisPanel, seenPanel, claimPanel, limitsPanel][u.case]();
      const hot = PIN.map((q, i) => ({ x: q[0], y: q[1], label: 'Case ' + (i + 1) + ': ' + CASES[i].label, act: 'v4case', data: { i }, w: 90, h: 70, done: sv[i], pulse: i === u.case && !sv[i] }));
      return '<div class="vx-stage"><div class="vx-main">' + scene(hot, sv) + vx.guide(all ? 'celebrate' : sv[u.case] ? 'encourage' : 'curious', all ? 'Case closed! On to the Abstract Workshop!' : sv[u.case] ? 'Solved! Pick the next pin on the board.' : cur.say) + '</div><div class="vx-side">' +
        vx.tray(CASES.map((c, i) => ({ icon: c.icon, label: (i + 1) + '. ' + c.label, act: 'v4case', data: { i }, on: i === u.case, done: sv[i] }))) + '<div id="v4panel">' + panel + '</div>' + (vx.researcher() ? '<div class="vx-note">Means: ' + D.conditions.map((c) => c.short + ' = ' + DC.fmt(st()[c.id].mean, 2) + ', median ' + DC.fmt(st()[c.id].median, 1) + ', range ' + st()[c.id].min + ' to ' + st()[c.id].max).join(' · ') + '.</div>' : '') +
        vx.learn('Data table', DC.chartTable(Object.assign(graphCfg({ id: 'tbl' }), { rowLabel: 'Trial' })).replace(/class="tbl"/, 'class="tbl"')) + vx.benchBar(4) + '</div></div>';
    },
    mount() {
      DC.onBind('ui.c.4.axis', () => { const v = +vx.c(4).axis; const o = DC.$('#v4av'); if (o) o.textContent = v; const box = DC.$('#v4axchart'); if (box) box.innerHTML = DC.chart(axisCfg(v)); const s = st(), m1 = s.control.mean, m2 = s.cool.mean, vis = v ? ((m2 - v) / (m1 - v)) * 100 : (m2 / m1) * 100, real = (m2 / m1) * 100; const f = DC.$('#v4axfb'); if (f) { f.className = 'vx-fb ' + (v ? 'no' : 'ok'); f.innerHTML = v ? 'The 18 °C bar now looks only about <strong>' + Math.round(vis) + '%</strong> as tall as the 25 °C bar. In truth it is about <strong>' + Math.round(real) + '%</strong>.' : 'Honest: the 18 °C bar is about <strong>' + Math.round(real) + '%</strong> as tall as the 25 °C bar.'; } });
      DC.onBind('b.', () => { DC.softUpdate(); const gb = DC.$('#bBox'); if (gb) gb.innerHTML = DC.chart(DC.bChartCfg()); });
      if (DC.$('#v4chart')) DC.chart.attach(DC.$('#v4chart'), DC.$('#v4out'));
      if (DC.$('#bBox')) DC.chart.attach(DC.$('#bBox'), DC.$('#bOut'));
    }
  });
  DC.acts.v4case = (b) => { U().case = +b.dataset.i; DC.save(); DC.refresh('#v4panel'); };
})();
