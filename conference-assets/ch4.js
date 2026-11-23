/* Chapter 4 : Become a data detective */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc, D = DC.DATA;
  const g = { view: 'dot', pts: true, mean: true, range: false, trunc: false };
  const okq = (id) => !!(DC.state.det[id] && DC.state.det[id].ok);
  const sA = () => DC.aStats();

  /* ---------- numeric question ---------- */
  function numQ(id, prompt, answer, hint, tol) {
    const st = DC.state.det[id] || {};
    return '<div class="q' + (st.ok ? ' done' : '') + '"><h4><label for="' + id + '">' + esc(prompt) + '</label></h4><div class="row"><input type="text" inputmode="decimal" id="' + id + '" style="max-width:8rem" value="' + esc(st.val != null ? st.val : '') + '"><button type="button" class="btn small gold" data-act="numQ" data-id="' + id + '" data-ans="' + answer + '" data-tol="' + (tol || 0.05) + '" data-hint="' + esc(hint) + '">Check</button></div>' +
      (st.msg ? '<div class="fb ' + (st.ok ? 'ok' : 'no') + '" role="status">' + esc(st.msg) + '</div>' : '') + '</div>';
  }
  DC.acts.numQ = (b) => {
    const id = b.dataset.id, raw = DC.$('#' + id).value.replace(',', '.').trim(), v = parseFloat(raw), ans = parseFloat(b.dataset.ans), tol = parseFloat(b.dataset.tol);
    const prev = DC.state.det[id] || {};
    let ok = false, msg;
    if (raw === '' || isNaN(v)) msg = 'Type a number.'; else if (Math.abs(v - ans) <= tol) { ok = true; msg = 'Correct: ' + DC.fmt(ans, 1) + '. ' + b.dataset.hint; } else msg = 'Not quite. ' + b.dataset.hint.split('|')[0];
    DC.state.det[id] = { val: raw, ok: ok || !!prev.ok, msg }; DC.save(); DC.refresh('#' + id); DC.softUpdate(); DC.say(msg);
  };

  /* ---------- sorting question: observation vs interpretation ---------- */
  function oiQ(items, id) {
    const sel = DC.state.det[id + '_sel'] || {}, st = DC.state.det[id] || {};
    return '<div class="q' + (st.ok ? ' done' : '') + '"><h4>Which statements are OBSERVATIONS (what was measured) and which are INTERPRETATIONS (what someone thinks it means)?</h4>' + items.map((it, i) => {
      const v = sel[i] || '', right = st.checked && v === it[1], wrong = st.checked && v !== it[1];
      return '<div class="setuprow' + (right ? ' good' : wrong ? ' bad' : '') + '"><label for="' + id + i + '">' + esc(it[0]) + '</label><select id="' + id + i + '" data-bind="det.' + id + '_sel.' + i + '"><option value="">Choose…</option><option value="obs"' + (v === 'obs' ? ' selected' : '') + '>Observation</option><option value="int"' + (v === 'int' ? ' selected' : '') + '>Interpretation</option></select>' + (st.checked ? '<div class="hint" style="grid-column:1/-1">' + (right ? '✓ ' : '✗ ') + esc(it[2]) + '</div>' : '') + '</div>';
    }).join('') + '<div class="row" style="margin-top:.5rem"><button type="button" class="btn small gold" data-act="oiCheck" data-id="' + id + '">Check my sorting</button></div>' + (st.checked ? '<div class="fb ' + (st.ok ? 'ok' : 'no') + '" role="status">' + (st.ok ? 'All sorted correctly. Interpretations are ideas that need evidence. They can be tested, and they can be wrong.' : 'Some are not right yet. Read the notes and change your answers.') + '</div>' : '') + '</div>';
  }
  DC.acts.oiCheck = (b) => {
    const id = b.dataset.id, items = DC.oiItems[id], sel = DC.state.det[id + '_sel'] || {};
    const ok = items.every((it, i) => sel[i] === it[1]);
    DC.state.det[id] = { checked: true, ok: ok || !!(DC.state.det[id] && DC.state.det[id].ok) }; DC.save(); DC.refresh('[data-act=oiCheck]'); DC.softUpdate(); DC.say(ok ? 'All sorted correctly.' : 'Some are not right yet. Read the notes and change your answers.');
  };
  DC.oiItems = {};

  /* ---------- multi-select limitations ---------- */
  function limitsQ() {
    const items = [
      ['Only 10 flies were in each group.', true, 'A small group means the result may not describe other flies.'],
      ['Each condition used one vial, so differences between the vials are mixed up with the temperature difference.', true, 'Yes. With one vial per condition we cannot separate "temperature" from "this particular vial and group of flies".'],
      ['All five trials used the same 10 flies, so they are repeated measurements, not independent replicates.', true, 'Right. Repeating on the same flies helps with measurement wobble, not with how different flies might behave.'],
      ['Counting by eye can make small errors.', true, 'A second person counting, or a photo, would help check the counts.'],
      ['The data are simulated.', true, 'Yes. They show how to think about evidence. They do not tell us about real fruit flies.'],
      ['The ruler was used to measure the line.', false, 'Using a ruler is good practice. It is not a limitation.'],
      ['We tested many different temperatures.', false, 'We tested only two (25 °C and 18 °C). Testing only two is a limitation.']
    ];
    DC.oiItems.limits = items;
    const sel = DC.state.det.limits_sel || {}, st = DC.state.det.limits || {};
    return '<div class="q' + (st.ok ? ' done' : '') + '"><h4 id="limH">Tick every statement that is a real LIMITATION of this study.</h4><div role="group" aria-labelledby="limH">' + items.map((it, i) => {
      const on = !!sel[i], shown = st.checked, right = shown && on === it[1];
      return '<label class="setuprow' + (shown ? (right ? ' good' : ' bad') : '') + '" style="grid-template-columns:auto 1fr;cursor:pointer"><input type="checkbox" style="width:1.3rem;height:1.3rem" data-bind="det.limits_sel.' + i + '"' + (on ? ' checked' : '') + '><span>' + esc(it[0]) + (shown ? '<span class="hint" style="display:block">' + (right ? '✓ ' : '✗ ') + esc(it[2]) + '</span>' : '') + '</span></label>';
    }).join('') + '</div><div class="row" style="margin-top:.5rem"><button type="button" class="btn small gold" data-act="limCheck">Check my choices</button></div>' + (st.checked ? '<div class="fb ' + (st.ok ? 'ok' : 'no') + '" role="status">' + (st.ok ? 'Yes! Naming limits honestly is a strength of good science, not a weakness.' : 'Not all choices match yet. Read the notes beside each statement and adjust.') + '</div>' : '') + '</div>';
  }
  DC.acts.limCheck = () => {
    const items = DC.oiItems.limits, sel = DC.state.det.limits_sel || {};
    const ok = items.every((it, i) => !!sel[i] === it[1]);
    DC.state.det.limits = { checked: true, ok: ok || !!(DC.state.det.limits && DC.state.det.limits.ok) }; DC.save(); DC.refresh('[data-act=limCheck]'); DC.softUpdate(); DC.say(ok ? 'Yes, those are all the real limitations.' : 'Not all choices match yet. Read the notes beside each statement.');
  };

  /* ---------- guided graph ---------- */
  function cfgFor() {
    const cfg = DC.guidedChart({ id: 'gc', interactive: true, showPoints: g.pts, showMean: g.mean, showRange: g.range });
    if (g.view === 'line') { cfg.kind = 'line'; cfg.xTitle = 'Trial number'; cfg.catLabels = [1, 2, 3, 4, 5]; cfg.title = 'Count in each trial, in order (simulated data)'; }
    else if (g.view === 'bar') { cfg.kind = 'bar'; cfg.title = 'Average flies above the line (simulated data)'; cfg.yMin = g.trunc ? 3 : 0; cfg.showPoints = true; cfg.step = 1; cfg.yMax = 10; }
    return cfg;
  }
  function graphHTML() {
    const cfg = cfgFor();
    const s = sA(), m1 = s.control.mean, m2 = s.cool.mean;
    let note = '';
    if (g.view === 'bar' && g.trunc) {
      const vis = ((m2 - 3) / (m1 - 3)) * 100, real = (m2 / m1) * 100;
      note = '<div class="callout bad"><strong>Misleading axis!</strong> The vertical axis starts at 3, not 0. The 18 °C bar now looks only about <strong>' + Math.round(vis) + '%</strong> as tall as the 25 °C bar. The real averages are ' + DC.fmt(m2, 1) + ' and ' + DC.fmt(m1, 1) + ', so the 18 °C average is really about <strong>' + Math.round(real) + '%</strong> of the 25 °C average. Bar graphs should start at zero.</div>';
    }
    return '<div class="togs" role="group" aria-label="Graph options"><label>Graph type <select id="gView" data-act="gView" style="width:auto"><option value="dot"' + (g.view === 'dot' ? ' selected' : '') + '>Dot plot (every trial)</option><option value="bar"' + (g.view === 'bar' ? ' selected' : '') + '>Bars of averages</option><option value="line"' + (g.view === 'line' ? ' selected' : '') + '>Trials in order</option></select></label>' +
      (g.view === 'dot' ? '<label><input type="checkbox" data-act="gOpt" data-k="pts"' + (g.pts ? ' checked' : '') + '> Show every trial</label><label><input type="checkbox" data-act="gOpt" data-k="mean"' + (g.mean ? ' checked' : '') + '> Show averages</label><label><input type="checkbox" data-act="gOpt" data-k="range"' + (g.range ? ' checked' : '') + '> Show lowest to highest</label>' : '') +
      (g.view === 'bar' ? '<label><input type="checkbox" data-act="gOpt" data-k="trunc"' + (g.trunc ? ' checked' : '') + '> Try starting the axis at 3 (see what happens)</label>' : '') + '</div>' +
      '<div class="chartbox" id="gBox">' + DC.chart(cfg) + '</div><div class="legend"><span style="--c:' + D.conditions[0].color + '">25 °C control (circles)</span><span style="--c:' + D.conditions[1].color + '">18 °C (squares)</span></div>' +
      '<div class="readout" id="gOut" role="status" aria-live="polite">Tab to a point, or hover or tap it, to read its value.</div>' + note +
      '<details><summary>Show this graph as a table</summary>' + DC.chartTable({ groups: cfg.groups, rowLabel: 'Trial' }) + '</details>';
  }
  const paintGraph = () => { const b = DC.$('#gArea'); if (b) { b.innerHTML = graphHTML(); DC.chart.attach(DC.$('#gBox'), DC.$('#gOut')); } };
  DC.acts.gView = (el) => { /* handled by change */ };
  document.addEventListener('change', (e) => {
    const t = e.target; if (!t.dataset || !t.dataset.act) return;
    if (t.dataset.act === 'gView') { g.view = t.value; paintGraph(); DC.$('#gView').focus(); }
    if (t.dataset.act === 'gOpt') { g[t.dataset.k] = t.checked; paintGraph(); DC.$('[data-k=' + t.dataset.k + ']').focus(); }
  });
  DC.acts.gOpt = () => {};

  function summaryHTML() {
    const s = sA();
    const row = (lab, f) => '<tr><th scope="row">' + lab + '</th>' + D.conditions.map((c) => '<td>' + f(s[c.id]) + '</td>').join('') + '</tr>';
    return '<div class="tblwrap"><table class="tbl"><caption>Summary of the five trials in each group (flies above the line, out of 10)</caption><thead><tr><th scope="col">Summary</th>' + D.conditions.map((c) => '<th scope="col">' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>' +
      '<tr><th scope="row">Each trial</th>' + D.conditions.map((c) => '<td>' + DC.state.a.rec[c.id].join(', ') + '</td>').join('') + '</tr>' +
      row('Total', (x) => x.sum) + row('Mean (average)', (x) => DC.fmt(x.mean, 2)) + row('Median (middle value)', (x) => DC.fmt(x.median, 1)) + row('Lowest to highest', (x) => x.min + ' to ' + x.max) + row('Mean as a share of 10 flies', (x) => DC.fmt((x.mean / D.flies) * 100, 0) + '%') + '</tbody></table></div>';
  }

  function aHTML() {
    if (!DC.aComplete()) return '<div class="callout warn">You need all 10 trial recordings before you can analyze them. <button type="button" class="btn small" data-act="go" data-n="3">Back to Chapter 3</button></div>';
    const s = sA(), m1 = s.control.mean, m2 = s.cool.mean, diff = m1 - m2;
    const nonOverlap = s.cool.max < s.control.min;
    DC.oiItems.d_oi = [
      ['In trial 2 at 18 °C, ' + DC.state.a.rec.cool[1] + ' of 10 flies were above the line.', 'obs', 'This is a count someone made. It is an observation.'],
      ['The cooler flies were less energetic.', 'int', '"Energetic" was not measured. It is an idea about why the counts differ.'],
      ['On average, the 25 °C group had more flies above the line than the 18 °C group (' + DC.fmt(m1, 1) + ' compared with ' + DC.fmt(m2, 1) + ').', 'obs', 'This describes the numbers we collected. It is a summary of observations.'],
      ['Cold air makes flies tired.', 'int', 'This explains what might be happening. It needs more evidence than these counts.']];
    const vis = ((m2 - 3) / (m1 - 3)) * 100, real = (m2 / m1) * 100;
    return '<p class="lead">Now you have numbers. A data detective asks: what do the numbers <em>say</em>, and what do they <em>not</em> say?</p><div class="callout sim"><strong>Simulated data.</strong> These numbers came from your trials in the simulated lab. They are not from real flies.</div>' +
      '<div class="card"><h3>Step 1 · Your results and summaries</h3>' + summaryHTML() + '<p class="hint">Summaries are calculated from the numbers you recorded. We are only describing these data. We are <strong>not</strong> running a statistical test or claiming a significant result.</p></div>' +
      '<div class="card"><h3>Step 2 · Explore the graph</h3><p>Try each graph type. Which one lets you see <em>every</em> trial? Which one hides how much the trials vary?</p><div id="gArea">' + graphHTML() + '</div>' +
      '<div class="callout"><strong>Comparing the conditions.</strong> The 25 °C average is ' + DC.fmt(m1, 1) + ' flies and the 18 °C average is ' + DC.fmt(m2, 1) + ', a difference of ' + DC.fmt(diff, 1) + ' flies. The lowest to highest counts ' + (nonOverlap ? 'do not overlap' : 'overlap') + ' (' + s.control.min + ' to ' + s.control.max + ' compared with ' + s.cool.min + ' to ' + s.cool.max + '). That describes <em>these 10 recordings</em>. A difference between two averages does not by itself prove what caused it.<br><strong>Results do not always match the prediction.</strong> If the 18 °C flies had climbed as much as or more than the 25 °C flies, that would also be a real and useful result. Scientists report what they find, not what they hoped for.</div></div>' +
      '<div class="card"><h3>Step 3 · Detective questions</h3>' +
      numQ('d_mean', 'What is the mean (average) number of flies above the line at 25 °C?', m1, 'Add the five counts (' + DC.state.a.rec.control.join(' + ') + ' = ' + s.control.sum + ') and divide by 5.|Add the five counts and divide by 5.') +
      numQ('d_diff', 'How many more flies, on average, were above the line at 25 °C than at 18 °C?', diff, 'Subtract the means: ' + DC.fmt(m1, 1) + ' − ' + DC.fmt(m2, 1) + ' = ' + DC.fmt(diff, 1) + '.|Subtract the 18 °C mean from the 25 °C mean.') +
      DC.mcq('d_range', 'For the 18 °C group, what is the lowest to highest count?', [
        [s.cool.min + ' to ' + s.cool.max, true, 'The lowest trial had ' + s.cool.min + ' and the highest had ' + s.cool.max + '. The range shows how much the trials varied.'],
        [DC.fmt(m2, 1), false, 'That is the mean. Lowest to highest means the smallest and biggest counts.'],
        [s.control.min + ' to ' + s.control.max, false, 'Those are the counts for the 25 °C group.']]) +
      oiQ(DC.oiItems.d_oi, 'd_oi') +
      DC.mcq('d_cause', 'Which conclusion is best supported by these data?', [
        ['Cold air makes all fruit flies climb less. This proves it.', false, '"All fruit flies" and "proves" go far beyond 20 simulated flies in two vials.'],
        ['In this simulation the 18 °C group had fewer flies above the line on average (' + DC.fmt(m2, 1) + ' compared with ' + DC.fmt(m1, 1) + '). That fits the prediction, but one vial per condition cannot show what all flies do or rule out other differences between the groups.', true, 'This states what was found, says it fits the prediction, and admits what the study cannot show.'],
        ['Temperature has no effect on climbing.', false, 'The data do not show that. In this simulation every 18 °C count (' + s.cool.min + ' to ' + s.cool.max + ') was lower than every 25 °C count (' + s.control.min + ' to ' + s.control.max + ').'],
        ['The data can tell us nothing at all.', false, 'Too cautious. The data do tell us something about these groups. They just cannot tell us everything.']]) +
      DC.mcq('d_repl', 'The five trials in each group used the same 10 flies. Do they count as five independent replicates of the experiment?', [
        ['Yes. Five trials means five replicates.', false, 'Repeating on the same flies is useful, but those measurements are not independent. They all come from the same flies.'],
        ['No. They are repeated measurements on the same flies. They show how much the count wobbles, but not how other groups of flies would behave.', true, 'Independent replicates would use new groups of flies in new vials.'],
        ['Yes, but only for the 25 °C group.', false, 'The same issue applies to both groups.']]) +
      limitsQ() +
      DC.mcq('d_axis', 'Why can a bar graph with the vertical axis starting at 3 be misleading?', [
        ['Because 3 is an unlucky number.', false, 'Numbers are not lucky or unlucky. The problem is what the picture suggests.'],
        ['Bar heights should match amounts from zero. Starting at 3 makes the 18 °C bar look about ' + Math.round(vis) + '% as tall as the 25 °C bar, but the averages are really ' + Math.round(real) + '% as large.', true, 'Try the "start the axis at 3" box in Step 2 to see it.'],
        ['It does not mislead. The numbers are the same.', false, 'The numbers are the same, but the picture makes the difference look much bigger than it is.']]) + '</div>';
  }

  /* ---------- Path B tools ---------- */
  const KINDS = [['compare', 'Compare groups', 'I have numbers for two or more groups and want to see how they compare.'], ['cats', 'Amounts for different things', 'Each row is its own thing (like different snacks) with a number.'], ['time', 'Changes over time or in order', 'My numbers were collected one after another (day 1, day 2…).'], ['words', 'My evidence is in words or pictures', 'I observed things but did not measure numbers. No graph needed.']];
  function bCfg() {
    const b = DC.state.b, rows = DC.bLogNumeric(), c = b.chart;
    const yT = (c.yTitle || '').trim() + (c.unit ? ' (' + c.unit.trim() + ')' : ''), xT = (c.xTitle || '').trim();
    if (c.kind === 'compare') {
      const gs = {}; rows.forEach((r, i) => { const k = r.group.trim() || 'All'; (gs[k] = gs[k] || { key: k, label: k, color: ['#1d5a5a', '#b5483c', '#5b3a6b', '#20365a', '#8a6a1d'][Object.keys(gs).length % 5], values: [], labels: [] }); gs[k].values.push(Number(r.value)); gs[k].labels.push(r.label || 'row ' + (i + 1)); });
      return { kind: 'dot', groups: Object.values(gs), yTitle: yT, xTitle: xT, yMin: Math.min(0, ...rows.map((r) => Number(r.value))), title: b.f.title || 'My data', id: 'bc', interactive: true, desc: 'Dot plot of the numbers you entered, grouped by the group column.' };
    }
    if (c.kind === 'cats') return { kind: 'bar', groups: rows.map((r, i) => ({ key: 'r' + i, label: r.label || 'row ' + (i + 1), color: ['#1d5a5a', '#b5483c', '#5b3a6b', '#20365a', '#8a6a1d'][i % 5], values: [Number(r.value)], labels: [r.label || 'row ' + (i + 1)] })), yTitle: yT, xTitle: xT, yMin: Math.min(0, ...rows.map((r) => Number(r.value))), title: b.f.title || 'My data', id: 'bc', interactive: true, showPoints: false, desc: 'Bar chart with one bar for each row you entered.' };
    return { kind: 'line', groups: [{ key: 'seq', label: 'My data', color: '#1d5a5a', values: rows.map((r) => Number(r.value)), labels: rows.map((r) => r.label || '') }], catLabels: rows.map((r, i) => r.label || i + 1), yTitle: yT, xTitle: xT, yMin: Math.min(0, ...rows.map((r) => Number(r.value))), title: b.f.title || 'My data', id: 'bc', interactive: true, desc: 'Line chart of the numbers in the order you entered them.' };
  }
  DC.bChartCfg = bCfg;
  function bGraphHTML() {
    const b = DC.state.b, c = b.chart, rows = DC.bLogNumeric();
    if (!c.kind || c.kind === 'auto') return '<div class="callout">Pick the kind of evidence you have above. The tool will only draw what fits.</div>';
    if (c.kind === 'words') {
      const obs = b.log.filter((r) => r.label.trim());
      return '<div class="callout ok"><strong>Not every project needs a graph.</strong> If your evidence is words, drawings or photos, a clear observation table can be your main result.</div>' + (obs.length ? '<div class="tblwrap"><table class="tbl"><caption>My observations</caption><thead><tr><th scope="col">What / when</th><th scope="col">Group</th><th scope="col">What I noticed</th></tr></thead><tbody>' + obs.map((r) => '<tr><td>' + esc(r.label) + '</td><td>' + esc(r.group) + '</td><td>' + esc(r.note) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="hint">Add rows in Chapter 3’s observation log. They will show up here.</p>');
    }
    if (rows.length < 2) return '<div class="callout warn">Add at least two rows with numbers in the data log (Chapter 3) to draw this graph. Nothing is made up for you.</div>';
    const warns = [];
    if (!c.yTitle.trim()) warns.push('Give the vertical axis a title (what the numbers are).'); if (!c.unit.trim()) warns.push('Add a unit if your numbers have one (cm, seconds, count…).'); if (!c.xTitle.trim()) warns.push('Give the horizontal axis a title.');
    if (c.kind === 'compare') { const gc = {}; rows.forEach((r) => { const k = r.group.trim() || 'All'; gc[k] = (gc[k] || 0) + 1; }); if (Object.values(gc).some((n) => n < 3)) warns.push('Some groups have fewer than 3 numbers. Averages from so few numbers can be misleading, so look at every point.'); }
    if (c.kind === 'time' && rows.length < 3) warns.push('A line over time works best with at least 3 points.');
    const cfg = bCfg(), s = DC.stats(rows.map((r) => Number(r.value)));
    return (warns.length ? '<div class="callout warn"><strong>Before you present:</strong><ul class="clean">' + warns.map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '<div class="callout ok">Axes are labeled. Good graphs say what is measured and in what unit.</div>') +
      '<div class="chartbox" id="bBox">' + DC.chart(cfg) + '</div><div class="readout" id="bOut" role="status" aria-live="polite">Tab to a point, or hover or tap it, to read its value.</div><details><summary>Show as a table</summary>' + DC.chartTable({ groups: cfg.groups, catLabels: cfg.catLabels, rowLabel: 'Row' }) + '</details>' +
      '<p class="hint">Summary of the ' + s.n + ' numbers you entered (all rows together): mean ' + DC.fmt(s.mean, 2) + ', median ' + DC.fmt(s.median, 2) + ', lowest ' + DC.fmt(s.min, 2) + ', highest ' + DC.fmt(s.max, 2) + '. These only describe your numbers.</p>';
  }
  function claimFeedback(c) {
    const t = c.text.toLowerCase(), out = [];
    if (!c.text.trim()) return '';
    if (/\b(prove|proves|proved|proof|always|never|everyone|all (of )?the)\b/.test(t)) out.push(['no', 'Strong words like "proves", "always" or "all" usually go further than one small project can show. Try "suggests", "in my data" or "in my tries".']);
    if (c.kind === 'obs' && /\b(because|so that|which means|therefore|must have)\b/.test(t)) out.push(['part', 'This sounds like an explanation ("because…"). Is it something you saw, or something you think? If you did not see the reason, mark it as an interpretation.']);
    if (c.kind === 'int' && !c.evidence.trim()) out.push(['part', 'What did you see or measure that makes you think so? An interpretation needs evidence.']);
    if (c.kind === 'obs' && !c.evidence.trim()) out.push(['info', 'Where is this recorded? Point to a row in your log or a number in your graph.']);
    if (!c.kind) out.push(['info', 'Choose whether this is something you saw or measured, or something you think it means.']);
    if (!out.length) out.push(['ok', c.kind === 'int' ? 'Good: you marked this as an interpretation and pointed to evidence.' : 'Good: this is tied to something recorded.']);
    return out.map((o) => '<div class="fb ' + o[0] + '" role="status">' + esc(o[1]) + '</div>').join('');
  }
  function bHTML() {
    const b = DC.state.b, c = b.chart;
    return '<p class="lead">Your evidence belongs to <strong>your</strong> project, so these tools only show what you entered in Chapter 3. They never invent data and they never force a bar graph.</p>' +
      '<div class="card"><h3>Step 1 · What kind of evidence do I have?</h3><div class="choice">' + KINDS.map((k) => '<label><input type="radio" name="bkind" data-bind="b.chart.kind" value="' + k[0] + '"' + (c.kind === k[0] ? ' checked' : '') + '><span class="face"><b>' + k[1] + '</b><small>' + k[2] + '</small></span></label>').join('') + '</div></div>' +
      '<div class="card"><h3>Step 2 · Show my evidence</h3>' + (c.kind && c.kind !== 'words' && c.kind !== 'auto' ? '<div class="grid3"><div class="field"><label for="byt">Vertical axis title</label><input type="text" id="byt" data-bind="b.chart.yTitle" value="' + esc(c.yTitle) + '" placeholder="e.g. Ants counted"></div><div class="field"><label for="bun">Unit</label><input type="text" id="bun" data-bind="b.chart.unit" value="' + esc(c.unit) + '" placeholder="e.g. ants, cm, seconds"></div><div class="field"><label for="bxt">Horizontal axis title</label><input type="text" id="bxt" data-bind="b.chart.xTitle" value="' + esc(c.xTitle) + '" placeholder="e.g. Day"></div></div>' : '') + '<div id="bGraph">' + bGraphHTML() + '</div></div>' +
      '<div class="card"><h3>Step 3 · My claims and my evidence</h3><p>Write what you think your project shows. For each claim, say if it is something you <strong>saw or measured</strong> or something you <strong>think it means</strong>, and point to evidence.</p><div id="claims">' + b.claims.map((cl, i) =>
        '<div class="q"><div class="field"><label for="cl-' + i + 't">Claim ' + (i + 1) + '</label><textarea id="cl-' + i + 't" data-bind="b.claims.' + i + '.text" style="min-height:3.6rem">' + esc(cl.text) + '</textarea></div><div class="grid2"><div class="field"><label for="cl-' + i + 'k">This is…</label><select id="cl-' + i + 'k" data-bind="b.claims.' + i + '.kind"><option value="">Choose…</option><option value="obs"' + (cl.kind === 'obs' ? ' selected' : '') + '>Something I saw or measured</option><option value="int"' + (cl.kind === 'int' ? ' selected' : '') + '>Something I think it means</option></select></div><div class="field"><label for="cl-' + i + 'e">My evidence (a row, number or what I saw)</label><input type="text" id="cl-' + i + 'e" data-bind="b.claims.' + i + '.evidence" value="' + esc(cl.evidence) + '"></div></div><div id="clfb-' + i + '">' + claimFeedback(cl) + '</div>' + (b.claims.length > 1 ? '<button type="button" class="btn small danger" data-act="bDelClaim" data-i="' + i + '">Remove claim ' + (i + 1) + '</button>' : '') + '</div>').join('') + '</div><button type="button" class="btn small" data-act="bAddClaim">+ Add a claim</button></div>' +
      '<div class="card"><h3>Step 4 · Check your thinking</h3>' + DC.mcq('d_b_oi', 'Which of these is an OBSERVATION?', [['"The plants by the window grew 3 cm more than the ones in the closet."', true, 'It says what was measured. It could be written in a data table.'], ['"The window plants grew more because they are happier."', false, 'This explains why. "Happier" was not measured, so it is an interpretation.'], ['"Light is the reason all plants grow."', false, 'This is a big general claim, not an observation.']]) +
      DC.mcq('d_b_rep', 'You measured the same thing five times on the same sample. Are those five measurements independent replicates?', [['Yes, five measurements means five replicates.', false, 'Repeating a measurement on the same sample is useful, but independent replicates use new samples (new plants, new groups, new days).'], ['No. They are repeated measurements. New samples would be independent replicates.', true, 'Repeats help with measuring error. New samples help with whether the result holds more generally.'], ['It depends only on how long it took.', false, 'Time taken does not decide this. Whether the samples are new does.']]) + '</div>';
  }
  DC.acts.bAddClaim = () => { DC.state.b.claims.push({ text: '', evidence: '', kind: '' }); DC.save(); DC.refresh('#cl-' + (DC.state.b.claims.length - 1) + 't'); };
  DC.acts.bDelClaim = (b) => { DC.state.b.claims.splice(+b.dataset.i, 1); DC.save(); DC.refresh('#cl-0t'); };

  function bComplete() {
    const b = DC.state.b, c = b.chart; if (!c.kind || c.kind === 'auto') return false;
    const evOk = c.kind === 'words' ? b.log.some((r) => r.label.trim()) : DC.bLogNumeric().length >= 2 && c.yTitle.trim() && c.xTitle.trim();
    return !!(evOk && b.claims.some((cl) => cl.text.trim() && cl.kind && cl.evidence.trim()) && okq('d_b_oi') && okq('d_b_rep'));
  }
  const AIDS = ['d_mean', 'd_diff', 'd_range', 'd_oi', 'd_cause', 'd_repl', 'limits', 'd_axis'];

  DC.register(4, {
    complete() { const s = DC.state; if (s.path === 'A') return DC.aComplete() && AIDS.every(okq); if (s.path === 'B') return bComplete(); return false; },
    gate: () => (DC.state.path === 'B' ? 'Choose your evidence type, show it honestly, add a claim with evidence and answer both checks.' : 'Answer all eight detective questions correctly (you can try again).'),
    render() {
      if (!DC.state.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      const body = DC.state.path === 'A' ? aHTML() : bHTML();
      const prog = DC.state.path === 'A' && DC.aComplete() ? '<p class="gate" id="qprog">Questions answered correctly: ' + AIDS.filter(okq).length + ' of ' + AIDS.length + '</p>' : '';
      return body + prog;
    },
    mount() {
      let lastNarrow = window.innerWidth < 560; window.addEventListener('resize', () => { const n = window.innerWidth < 560; if (n !== lastNarrow && DC.state.cur === 4) { lastNarrow = n; DC.refresh(); } });
      if (DC.state.path === 'A' && DC.aComplete()) { const b = DC.$('#gBox'); if (b) DC.chart.attach(b, DC.$('#gOut')); }
      DC.onBind('b.chart.kind', () => DC.refresh());
      DC.onBind('b.chart', () => { const gr = DC.$('#bGraph'); if (gr) { gr.innerHTML = bGraphHTML(); const bb = DC.$('#bBox'); if (bb) DC.chart.attach(bb, DC.$('#bOut')); } DC.softUpdate(); });
      DC.onBind('b.claims', (el) => { const m = /b\.claims\.(\d+)/.exec(el.dataset.bind); if (m) { const f = DC.$('#clfb-' + m[1]); if (f) f.innerHTML = claimFeedback(DC.state.b.claims[+m[1]]); } DC.softUpdate(); });
      DC.onBind('det.', () => { /* selects/checkboxes just store; checking happens on button press */ });
      if (DC.state.path === 'B') { const bb = DC.$('#bBox'); if (bb) DC.chart.attach(bb, DC.$('#bOut')); }
    }
  });
})();
