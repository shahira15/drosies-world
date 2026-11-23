/* Drosie's Lab Notebook Academy · Station 7 (notebook detective) and Station 8 (complete notebook entry) */
(() => {
'use strict';
const FA = window.FA, { $, $$, esc } = FA;
const S = () => FA.st();

/* =============================================================== STATION 7 · Notebook detective */
const FLAWS = [
  { id: 'date', label: 'No date', bad: 'Date: ______', good: 'Date: Nov 12 (the day the work was done)', ask: 'The date line is empty. What should the scientist do?', hint: 'A dated entry shows when the work happened.', opts: [['Leave it blank', 0], ['Write the date the work was actually done', 1], ["Write tomorrow's date", 0]], why: 'Dates turn the notebook into a timeline. Use the date the work was done.' },
  { id: 'title', label: 'Unclear experiment title', bad: 'Title: fly stuff', good: 'FLY-1112-01 · Climbing practice, 5 adult flies', ask: 'The title is “fly stuff”. What is better?', hint: 'Could another person tell which experiment this is from the title?', opts: [['Keep “fly stuff”', 0], ['Use a clear title and experiment ID that say what the experiment was', 1], ['Just write “Experiment”', 0]], why: 'A clear title and ID make the page easy to find and understand.' },
  { id: 'sample', label: 'Missing sample identifier', bad: 'Sample: (blank)', good: 'Sample: vial V-03, 5 adult flies, label FLY-S-01', ask: 'No sample or vial is identified. What should be added?', hint: 'Which vial and which flies were used?', opts: [['Leave it blank', 0], ['Add the vial or sample identifier and what it contains', 1], ['Write “my flies”', 0]], why: 'Sample identifiers let someone trace exactly what was used.' },
  { id: 'units', label: 'Missing measurement units', bad: 'Temperature: 25 · Time: 10', good: 'Temperature: 25 °C · Time: 10 s', ask: 'The numbers have no units. What is needed?', hint: 'What do the 25 and the 10 measure?', opts: [['Nothing, the numbers are enough', 0], ['Add units, such as °C and s', 1], ['Replace the numbers with words like “warm”', 0]], why: 'A number without a unit is ambiguous. Units say what was measured.' },
  { id: 'proc', label: 'A procedure nobody could follow', bad: 'Procedure: Put flies in tube. Wait. Count.', good: 'Procedure: 5 adult flies in a clear vial; tap down; start timer; at 10 s count flies above the red line; repeat for 3 trials.', ask: 'Could another scientist repeat “Put flies in tube. Wait. Count.”?', hint: 'How many flies? How long to wait? What exactly is counted?', opts: [['Yes, it is clear enough', 0], ['Rewrite it with numbers, times and what is counted, as it was actually done', 1], ['Write “See above”', 0]], why: 'A procedure should let someone else follow the work, with quantities, times and what was counted.' },
  { id: 'claim', label: 'A claim written as an observation', bad: 'Observation: Flies like the light.', good: 'Observation: 4 of 5 flies were above the line at 10 s. Interpretation (not observed): flies might prefer the light; not tested.', ask: '“Flies like the light” is listed as an observation. What is the problem?', hint: 'Did anyone see “liking”? What was actually seen?', opts: [['Nothing is wrong', 0], ['Write what was actually seen, and move the idea to an interpretation labeled as untested', 1], ['Delete the whole Observations section', 0]], why: 'Observations are what you saw or measured. Ideas about why belong in interpretation and are labeled as such.' },
  { id: 'corr', label: 'A correction that hides the original', bad: 'Trial 2: ▇▇▇ 3', good: 'Trial 2: 8 3 (corrected Nov 12: recount shows 3; original 8 left readable)', ask: 'The old number is blotted out so it cannot be read. What is better?', hint: 'Could someone still tell what was first written?', opts: [['Leave the blot', 0], ['Draw a single line through the original (still readable), write the new value, and add the date and reason', 1], ['Tear out the page and rewrite it', 0]], why: 'Corrections must not conceal the original information. Keep it readable and explain the change.' },
  { id: 'chg', label: 'A missing explanation for a changed procedure', bad: 'Trial 4 used 15 s.', good: 'Trial 4 used 15 s instead of 10 s because the flies were slow to start. Trials 1–3 used 10 s.', ask: 'The notebook says Trial 4 used 15 s. What is missing?', hint: 'Why did it change, and which trials used which time?', opts: [['Nothing is missing', 0], ['Say why it changed and which trials used 10 s and which used 15 s', 1], ['Delete the sentence', 0]], why: 'A changed procedure should be recorded with the reason, and the trials should be identified.' }
];
FA.FLAWS = FLAWS;
FA.stations[7] = {
  render(root) {
    const s = S().s7.fixed, ok = id => s[id] && s[id].ok, left = FLAWS.filter(f => !s[f.id] || !s[f.id].ever).length, done = left === 0;
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'This notebook page has problems. Find them and fix them with the buttons below.', j: 'Investigate this incomplete notebook page. Each problem has a card with choices. Repair them all.', a: 'Investigate and repair the page. For each documentation problem, choose the repair that makes the record complete, traceable and honest.' }))}</p>
    <p class="progress">${FLAWS.length - left} of ${FLAWS.length} problems repaired</p>
    <div class="doc mono" aria-label="Fictional notebook page to repair"><p><span class="badge">Fictional page</span></p>
    ${FLAWS.map(f => `<p id="line-${f.id}" class="${s[f.id] && s[f.id].ever ? 'hl' : ''}">${s[f.id] && s[f.id].ever ? '✓ ' + esc(f.good) : esc(f.bad)}</p>`).join('')}</div>
    <h3>The problems to investigate</h3>
    ${FLAWS.map((f, i) => { const a = s[f.id]; const fixed = a && a.ever; return `<section class="flaw${fixed ? ' fixed' : ''}" aria-labelledby="fl-${f.id}"><h3 id="fl-${f.id}">${i + 1}. ${esc(f.label)}${fixed ? ' <span class="sr-only">(repaired)</span>' : ''}</h3><p>${esc(f.ask)}</p>
      <div class="optcards" role="radiogroup" aria-label="${esc(f.label)}">${f.opts.map(([t, c], k) => `<label class="optc"><input type="radio" name="fl-${f.id}" value="${k}" data-ch="flaw" data-id="${f.id}" data-c="${c}" data-f="${f.id}-${k}" ${a && a.pick === k ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
      <div class="row"><button type="button" class="mini" data-act="hint" data-id="${f.id}" data-f="h-${f.id}">Hint</button></div>
      <p class="fb ${a ? (a.ok ? 'good' : 'bad') : ''}" id="fb-${f.id}" role="status">${a && a.ok ? '✓ ' + esc(f.why) : a ? 'Not quite. Try another choice, or press Hint.' : ''}</p></section>`; }).join('')}
    ${done ? '<div class="callout ok" role="status"><b>Station complete!</b> You repaired every problem. The page is now complete, traceable and honest.</div>' : ''}`;
    FA.bind({ hint: b => { const f = FLAWS.find(x => x.id === b.dataset.id); $('#fb-' + f.id).className = 'fb'; $('#fb-' + f.id).textContent = 'Hint: ' + f.hint; FA.say('Hint: ' + f.hint); } },
      { flaw: r => { const f = FLAWS.find(x => x.id === r.dataset.id), good = r.dataset.c === '1', prev = s[f.id]; s[f.id] = { pick: +r.value, ok: good, ever: good || !!(prev && prev.ever) }; FA.save(); FA.say(good ? f.why : 'Not quite. Think about what would help another scientist trust and follow this page.', 'Complete, traceable records can be checked by others.'); FA.rerender(`${f.id}-${r.value}`); if (FLAWS.every(x => S().s7.fixed[x.id] && S().s7.fixed[x.id].ever) && !S().done[7]) { FA.mark(7); FA.rerender(); } } });
    FA.intro('Let us investigate this page. What is missing or unclear?', 'Records should let another researcher understand and assess the work.');
  }
};

/* =============================================================== STATION 8 · Create a complete notebook entry */
const FIELDS = [
  { k: 'notebookId', l: 'Notebook ID', t: 'text', lv: 1, ph: 'NB-001', st: 'A made-up code for your notebook.' },
  { k: 'page', l: 'Page number', t: 'number', lv: 1, ph: '1' },
  { k: 'dateWork', l: 'Date of work', t: 'date', lv: 0 },
  { k: 'expId', l: 'Experiment ID', t: 'text', lv: 1, ph: 'FLY-YYMMDD-01' },
  { k: 'title', l: 'Experiment title', t: 'text', lv: 0, ph: 'Climbing practice, 5 adult flies (simulated)' },
  { k: 'objective', l: 'Scientific question or objective', t: 'area', lv: 0, st: 'I want to find out…' },
  { k: 'prediction', l: 'Prediction or hypothesis (if relevant)', t: 'area', lv: 0, st: 'I think… because…' },
  { k: 'materials', l: 'Materials and sample identifiers', t: 'area', lv: 1, st: 'Vial, flies (sample ID), timer…' },
  { k: 'procedure', l: 'Procedure as actually performed', t: 'area', lv: 0, st: 'First I… then I… (write what you really did)' },
  { k: 'conditions', l: 'Conditions', t: 'area', lv: 1, st: 'Temperature (with unit), light, which vial…' },
  { k: 'deviations', l: 'Deviations from the plan (anything unusual or changed)', t: 'area', lv: 0, st: 'Something unusual happened: …' },
  { k: 'observations', l: 'Observations (what I saw)', t: 'area', lv: 0, st: 'I saw… (only what you saw or counted)' },
  { k: 'interpretation', l: 'Interpretation (what I think it means)', t: 'area', lv: 0, st: 'This might mean… but I am not sure because…' },
  { k: 'limitations', l: 'Limitations', t: 'area', lv: 1, st: 'This is limited because…' },
  { k: 'nextSteps', l: 'Next steps', t: 'area', lv: 1, st: 'Next I will…' },
  { k: 'refs', l: 'Related records (pages, protocols, files)', t: 'text', lv: 2, ph: 'See p. 9, protocol P-2' }
];
FA.FIELDS = FIELDS;
const lvNum = () => FA.T({ e: 0, j: 1, a: 2 });
function defaults() {
  const st = S(), s2 = st.s2, r = st.s3.rec, d = {};
  d.notebookId = s2.nbId || ''; d.page = '1'; d.dateWork = s2.date || FA.today(); d.expId = s2.expId || ''; d.title = s2.title ? s2.title + ' (simulated)' : '';
  d.materials = 'Clear observation vial with 5 adult fruit flies (simulated), reference line marked on the vial, timer.';
  d.conditions = 'Room temperature (not measured); normal room light; same vial and same 5 flies for all trials.';
  d.deviations = r[2] && r[2].conds.some(c => /tilt/i.test(c)) ? 'Trial 2: the vial was tilted when it was tapped.' : '';
  d.procedure = '';
  return d;
}
function rawRows() { const r = S().s3.rec; return [1, 2, 3].filter(t => r[t]).map(t => ({ trial: t, time: r[t].time, n: r[t].n, up: r[t].up, interval: `${r[t].int} ${r[t].unit}`, cond: r[t].conds.join('; ') + (r[t].other ? '; ' + r[t].other : '') })); }
FA.rawRows = rawRows;
FA.calc = () => { const rr = rawRows(); const n = rr.reduce((a, x) => a + x.n, 0), up = rr.reduce((a, x) => a + x.up, 0); return { rows: rr, n, up, frac: n ? Math.round(up / n * 100) : null }; };
/** Current effective value of a field (original, or latest dated correction). */
FA.effective = (final, corr, k) => { const c = corr.filter(x => x.k === k).pop(); return c ? c.nw : final.fields[k]; };
FA.stations[8] = {
  render(root) {
    const st = S(), s = st.s8, lv = lvNum(), vis = FIELDS.filter(f => f.lv <= lv), final = s.final;
    if (!Object.keys(s.draft).length && !final) { s.draft = defaults(); FA.save(); }
    const dr = s.draft, calc = FA.calc();
    const raw = `<div class="scroll"><table class="tbl"><caption>Raw data (original, as recorded in Station 3)</caption><thead><tr><th scope="col">Trial</th><th scope="col">Recorded at</th><th scope="col">Flies observed</th><th scope="col">Crossed the line</th><th scope="col">Interval</th><th scope="col">Conditions</th></tr></thead><tbody>${calc.rows.map(r => `<tr><td>${r.trial}</td><td>${r.time}</td><td>${r.n}</td><td>${r.up}</td><td>${esc(r.interval)}</td><td>${esc(r.cond)}</td></tr>`).join('') || '<tr><td colspan="6">No trials yet. Do Station 3 first to record raw data.</td></tr>'}</tbody></table></div>`;
    const proc = lv >= 2 ? `<h3>Processed data</h3><p class="starter">Calculated from the raw data above. The raw data stay unchanged.</p><div class="bars" role="img" aria-label="Flies crossing per trial">${calc.rows.map(r => `<div><span>Trial ${r.trial}</span><span class="tr"><span class="fl" style="display:block;width:${r.n ? r.up / r.n * 100 : 0}%"></span></span><span>${r.up}/${r.n}</span></div>`).join('')}</div><p>Total crossing: ${calc.up} of ${calc.n} (${calc.frac === null ? '–' : calc.frac + '%'}) across ${calc.rows.length} trials. <span class="sim">Simulated data</span></p>` : '';
    const draw = `<h3>Scientific drawing</h3>${S().s5.strokes.length || S().s5.parts.length ? `<div style="max-width:16rem">${FA.drawingSvg(S().s5)}</div><p class="starter">${esc(S().s5.title || 'Untitled')} · ${esc(FA.niceDate(S().s5.date))} · Specimen ${esc(S().s5.spec || '—')}<br>${esc(FA.drawCaption(S().s5))}</p>` : '<p class="starter">No drawing yet. Make one in Station 5 to include it here.</p>'}`;
    if (final) { root.innerHTML = finalView(final, s, raw, draw, proc, vis); wireFinal(root); }
    else {
      root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Write your notebook page. Use the sentence starters. Tell what really happened.', j: 'Build a complete notebook entry from your simulated experiment. You can edit freely while it is a draft.', a: 'Build a complete entry. It is a draft until you mark it complete. After that the original is preserved and changes are recorded as dated corrections.' }))}</p>
      <div class="callout"><b>Draft:</b> you can change anything now. When you press “Mark this page complete”, the page is saved as an original record.</div>
      <div class="entry"><h3>Page identity</h3><div class="fgrid">${vis.filter(f => ['notebookId', 'page', 'dateWork', 'expId'].includes(f.k)).map(f => fld(f, dr)).join('')}</div>
      <h3>Plan</h3>${vis.filter(f => ['title', 'objective', 'prediction'].includes(f.k)).map(f => fld(f, dr)).join('')}
      <h3>Materials, method and conditions</h3>${vis.filter(f => ['materials', 'procedure', 'conditions', 'deviations'].includes(f.k)).map(f => fld(f, dr)).join('')}
      <h3>What happened</h3>${vis.filter(f => f.k === 'observations').map(f => fld(f, dr)).join('')}${raw}${draw}${proc}
      <h3>What it means</h3>${vis.filter(f => ['interpretation', 'limitations', 'nextSteps', 'refs'].includes(f.k)).map(f => fld(f, dr)).join('')}
      <p class="fb" id="chkFb" role="status"></p><div class="row"><button type="button" class="nb go" data-act="finalize" data-f="finalize">Mark this page complete</button></div>
      <p class="starter">Before you finish, check: is every number labeled with a unit? Did you write what really happened, including anything unusual? Are observations and interpretations kept apart?</p></div>`;
      FA.bind({ finalize: () => finalize(vis) }, { fld: f => { S().s8.draft[f.dataset.k] = f.value.slice(0, 700); FA.save(); } });
    }
    FA.intro(final ? 'Your page is complete. The original is preserved. Changes now become dated corrections.' : 'This is the big one: a complete notebook entry.', 'A complete entry lets another researcher understand and assess what was done.');
  }
};
function fld(f, d) {
  const id = 'f8-' + f.k, v = d[f.k] || '';
  const help = (FA.lv() !== 'apprentice' && f.st) ? `<span class="starter">${esc(f.st)}</span>` : '';
  const input = f.t === 'area' ? `<textarea id="${id}" data-in="fld" data-k="${f.k}" maxlength="700">${esc(v)}</textarea>` : `<input id="${id}" type="${f.t}" data-in="fld" data-k="${f.k}" maxlength="80" value="${esc(v)}" ${f.ph ? `placeholder="${esc(f.ph)}"` : ''}>`;
  return `<div class="fld"><label for="${id}">${esc(f.l)}</label>${input}${help}</div>`;
}
function finalize(vis) {
  const s = S().s8, d = s.draft, fb = $('#chkFb'), miss = [];
  if (!(d.title || '').trim()) miss.push('an experiment title'); if (!d.dateWork) miss.push('the date of the work'); if (!(d.objective || '').trim()) miss.push('the question or objective');
  if (!(d.observations || '').trim()) miss.push('your observations'); if (!(d.interpretation || '').trim()) miss.push('your interpretation (what you think it means)'); if (!FA.calc().rows.length) miss.push('raw data (do Station 3 first)');
  if (miss.length) { fb.className = 'fb bad'; fb.textContent = 'Almost there. Please add: ' + miss.join(', ') + '.'; FA.say(fb.textContent); return; }
  s.final = { ts: new Date().toISOString(), date: FA.today(), fields: Object.assign({}, d), raw: FA.calc().rows, drawing: JSON.parse(JSON.stringify(S().s5)), level: FA.lv() }; s.corrections = []; s.done = true; FA.save(); FA.mark(8);
  FA.say('Page complete! Your original entry is now preserved. If you find a mistake, add a dated correction instead of rewriting it.', 'Finished records are not silently overwritten. Changes are dated corrections.'); FA.rerender('corr-field');
}
function view(fin, corr, k) { const c = corr.filter(x => x.k === k); const orig = fin.fields[k] || ''; if (!c.length) return esc(orig) || '<span class="starter">(blank)</span>'; return `<s>${esc(orig)}</s> ` + c.map((x, i) => (i < c.length - 1 ? `<s>${esc(x.nw)}</s> ` : `<span class="corr">${esc(x.nw)}</span> `) + `<span class="starter">(corrected ${esc(FA.niceDate(x.date))}${x.initials ? ', initials ' + esc(x.initials) : ''}: ${esc(x.reason)})</span>`).join(' '); }
FA.entryView = view;
function finalView(fin, s, raw, draw, proc, vis) {
  const corr = s.corrections, show = FIELDS.filter(f => f.lv <= (['explorer', 'junior', 'apprentice'].indexOf(fin.level)));
  const hist = [{ date: fin.date, ts: fin.ts, t: 'Page marked complete (original saved).' }].concat(corr.map(c => ({ date: c.date, ts: c.ts, t: `Correction to “${esc(c.label)}”: ${esc(c.reason)}` })));
  return `<div class="callout ok" role="status"><b>Page complete.</b> The original entry below is preserved. If you find a mistake, add a dated correction instead of overwriting.</div>
  <article class="doc entry" aria-label="Your finished notebook entry"><p><span class="badge">Practice entry</span> <span class="sim">Simulated experiment</span></p>
  ${show.map(f => `<div class="fld"><span class="lab">${esc(f.l)}</span><p>${view(fin, corr, f.k)}</p></div>`).join('')}${raw}${draw}${proc}<p class="starter">Date entry completed: ${esc(FA.niceDate(fin.date))}</p></article>
  <h3>Add a dated correction</h3>
  <div class="card"><div class="fld"><label for="corr-field">Which part needs correcting?</label><select id="corr-field" data-f="corr-field">${show.map(f => `<option value="${f.k}">${esc(f.l)}</option>`).join('')}</select></div><div class="fld"><label for="corr-new">Corrected text</label><textarea id="corr-new" maxlength="400"></textarea></div><div class="fld"><label for="corr-why">Reason for the correction</label><input id="corr-why" maxlength="120" placeholder="for example: recounted, typing mistake"></div><div class="fld"><label for="corr-ini">Initials (optional, made-up example such as AB)</label><input id="corr-ini" maxlength="4" style="max-width:6rem"></div><p class="fb" id="corrFb" role="status"></p><button type="button" class="nb" data-act="addcorr">Add dated correction</button></div>
  <h3>Local revision history</h3><ol>${hist.map(h => `<li>${esc(FA.niceDate(h.date))} ${esc((h.ts || '').slice(11, 16))}: ${h.t}</li>`).join('')}</ol>
  <p class="starter">This simple history is stored only on this device. It is a teaching model, not a professional audit-trailed electronic lab notebook.</p>
  <div class="row"><button type="button" class="nb alt" data-act="printEntry">Print my entry</button><button type="button" class="nb alt" data-act="dlEntry">Download my entry</button><button type="button" class="nb alt" data-act="newDraft">Start a new practice draft</button></div>`;
}
function wireFinal() {
  const s = S().s8;
  FA.bind({
    addcorr: () => { const k = $('#corr-field').value, nw = $('#corr-new').value.trim().slice(0, 400), why = $('#corr-why').value.trim().slice(0, 120), ini = $('#corr-ini').value.trim().slice(0, 4), fb = $('#corrFb'); if (!nw || !why) { fb.className = 'fb bad'; fb.textContent = 'Please write the corrected text and the reason.'; return; }
      const f = FIELDS.find(x => x.k === k); s.corrections.push({ k, label: f.l, nw, reason: why, initials: ini, date: FA.today(), ts: new Date().toISOString() }); FA.save(); FA.say('Correction added. The original is still readable.', 'A correction shows what changed, when and why, without hiding the first entry.'); FA.rerender('corr-field'); },
    printEntry: () => FA.printHtml(FA.entryHtml()), dlEntry: () => FA.downloadHtml(FA.entryHtml(), 'drosies-notebook-entry.html'),
    newDraft: () => { s.archive = (s.archive || []).concat([{ final: s.final, corrections: s.corrections }]); s.final = null; s.corrections = []; s.draft = {}; s.done = true; FA.save(); FA.say('A new practice draft is ready. Your earlier page is kept on this device.'); FA.rerender(); }
  });
}
})();
