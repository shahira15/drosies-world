/* Drosie's Lab Notebook Academy · Stations 1–4 */
(() => {
'use strict';
const FA = window.FA, { $, $$, esc, T } = FA;
const S = () => FA.st();

/* =============================================================== STATION 1 · What is a real lab notebook? */
const PARTS = [
  { id: 'cover', name: 'Cover', why: 'The cover says whose notebook it is and what project it holds, so it can be found and understood later.' },
  { id: 'nbno', name: 'Notebook number', why: 'Numbering notebooks (Notebook 1, 2, 3…) keeps a series in order, so a missing book is noticed.' },
  { id: 'toc', name: 'Table of contents', why: 'An index lets another person find an experiment quickly. Many labs also fill it in as they go.' },
  { id: 'pageno', name: 'Numbered pages', why: 'Pages that are numbered in advance make it obvious if a page is skipped, added or removed.' },
  { id: 'date', name: 'Dated entries', why: 'Dates show when the work was done, so the record is a timeline and the order of events is clear.' },
  { id: 'title', name: 'Experiment titles', why: 'A clear title and an experiment ID tell a reader exactly which experiment this page belongs to.' },
  { id: 'protocol', name: 'Protocol notes', why: 'Write the procedure as it was actually done, with changes, so someone else could follow it.' },
  { id: 'raw', name: 'Raw data', why: 'Raw data are the original observations and measurements, with units. They are kept exactly as recorded. Calculations are done on copies, so the raw data stay unchanged.' },
  { id: 'drawing', name: 'Drawings', why: 'A drawing records what you actually saw. It is labeled, dated and does not add things you did not see.' },
  { id: 'correction', name: 'Corrections', why: 'A mistake is fixed in a way that leaves the first entry readable, with the date and a reason. Nothing is hidden.' },
  { id: 'concl', name: 'Conclusions', why: 'Conclusions are labeled as interpretations. They say what the evidence can and cannot tell you.' },
  { id: 'refs', name: 'References to related records', why: 'Pointing to other pages, protocols or files lets a reader trace where things came from.' }
];
const CMP = [
  { id: 'c1', q: 'Which one shows the time each trial was done?', a: 'n', why: 'Only the notebook entry has times (10:05, 10:11, 10:17). The summary leaves out when and in what order things happened.', no: { s: 'The summary has no times at all, so it cannot show when each trial happened.', b: 'Both do not show times. Look for the clock times (10:05, 10:11, 10:17).' } },
  { id: 'c2', q: 'Which one tells you the vial was tilted in Trial 2?', a: 'n', why: 'The notebook entry recorded the tilt as it happened. The summary leaves it out, so a reader could trust Trial 2 too much.', no: { s: 'The summary never mentions the tilt. Look for where the unusual event was written down.', b: 'Only one of the two mentions the tilt.' } },
  { id: 'c3', q: 'Which one is quick and easy to skim?', a: 's', why: 'A polished summary is shorter and easier to read quickly. It is useful for sharing, but it is not the original record.', no: { n: 'The notebook entry has more detail, so it is slower to skim. Which one is shorter?', b: 'The two are not equally quick to read. One is shorter on purpose.' } },
  { id: 'c4', q: 'Which one lets another scientist check what actually happened?', a: 'n', why: 'The original record shows each trial, conditions and the unusual event. Scientists keep it so others can assess the work.', no: { s: 'The summary does not give each trial and condition, so a reader cannot check it.', b: 'Only one of them gives enough detail to check against.' } },
  { id: 'c5', q: 'Which one would you need if the summary and the data disagree?', a: 'n', why: 'When something does not add up, the notebook is the source to go back to.', no: { s: 'The summary is the thing in question. You need the original record to settle it.', b: 'Only the original record can settle a disagreement, because the summary came from it.' } }
];
let sel = null;
FA.stations[1] = {
  render(root) {
    const s = S().s1, n = FA.T({ e: 3, j: 4, a: 5 }), cmp = CMP.slice(0, n);
    const hl = id => (sel === id ? ' hl' : '');
    const intro = FA.T({ e: 'A lab notebook is a book where scientists write what they planned, what they really did, what they saw, and what they learned.', j: 'A laboratory notebook is where scientists keep a record of what they planned, what they actually did, what they observed, and what they learned.', a: 'A laboratory notebook is the running record of what a scientist planned, what they actually did, what they observed, and what they learned, written so that another researcher can understand and assess the work.' });
    const done = s.parts.length >= PARTS.length && cmp.every(c => s.cmp[c.id] && s.cmp[c.id].ever);
    root.innerHTML = `<p class="prompt">${esc(intro)}</p>
    <h3>Part A: Examine a real-style notebook</h3>
    <p class="prompt">Tap each part below. It lights up on the sample pages and Drosie explains why scientists keep it. <b>${s.parts.length} of ${PARTS.length}</b> examined.</p>
    <div class="partgrid" role="group" aria-label="Notebook parts">${PARTS.map(p => `<button type="button" class="pill${s.parts.includes(p.id) ? ' good' : ''}" data-act="part" data-id="${p.id}" data-f="p-${p.id}" aria-pressed="${sel === p.id}">${esc(p.name)}${s.parts.includes(p.id) ? '<span class="chk" aria-hidden="true">✓</span><span class="sr-only"> (examined)</span>' : ''}</button>`).join('')}</div>
    <div class="callout" role="status" id="partInfo">${sel ? '<b>' + esc(PARTS.find(p => p.id === sel).name) + ':</b> ' + esc(PARTS.find(p => p.id === sel).why) : 'Choose a part to learn about it.'}</div>
    <div class="doc fadein" aria-label="Sample notebook pages (fictional example)"><p><span class="badge">Fictional example</span></p>
      <div class="two">
        <div>
          <p class="${hl('cover')}"><b>Cover:</b> Laboratory Notebook · Fly Climbing Practice (simulated) · Started Nov 12</p>
          <p class="${hl('nbno')}"><b>Notebook No. 3</b></p>
          <div class="${hl('toc')}"><b>Contents</b><br>p. 10 FLY-1112-01 Climbing practice<br>p. 14 FLY-1114-01 Drawing practice</div>
        </div>
        <div>
          <p class="${hl('pageno')}"><b>Page 12</b></p>
          <p class="${hl('date')}"><b>Date:</b> Nov 12 &nbsp; <b>Time:</b> 10:05</p>
          <p class="${hl('title')}"><b>FLY-1112-01</b> · Climbing practice, 5 adult flies</p>
          <p class="${hl('protocol')}"><b>Protocol:</b> tap vial down, start timer, count flies above the line at 10 s. Planned: 3 trials.</p>
          <p class="${hl('raw')}"><b>Raw data:</b> Trial 1: 4 of 5 above line at 10 s · Trial 2: 3 of 5 (vial tilted) · Trial 3: 5 of 5</p>
          <p class="${hl('drawing')}"><b>Drawing:</b> adult fly, dorsal view, labeled (see p. 13)</p>
          <p class="${hl('correction')}"><b>Trial 2 count:</b> <s>4</s> 3 (corrected Nov 12, initials AB: recounted)</p>
          <p class="${hl('concl')}"><b>Conclusion (tentative):</b> in this practice set most flies crossed within 10 s. Trial 2 was tilted, so interpret with care.</p>
          <p class="${hl('refs')}"><b>See also:</b> p. 9 (vial setup), protocol P-2</p>
        </div>
      </div></div>
    <h3>Part B: A notebook entry or a polished summary?</h3>
    <p class="prompt">Scientists first write a <b>laboratory notebook</b> while they work. Later they may write a <b>polished report</b> for others. They are not the same thing.</p>
    <div class="two">
      <div class="doc"><h4>Notebook entry (written during the experiment)</h4><p>10:05 Trial 1. Tapped vial down. At 10 s: 4 of 5 flies above line.</p><p>10:11 Trial 2. Vial tilted slightly when tapped (my hand slipped). At 10 s: 3 of 5 above line.</p><p>10:17 Trial 3. At 10 s: 5 of 5 above line.</p><p>Not sure yet why Trial 2 is lower. Maybe the tilt?</p></div>
      <div class="doc"><h4>Polished summary (written afterward)</h4><p>Flies reliably climbed above the reference line within 10 seconds in our experiment.</p></div>
    </div>
    ${cmp.map(c => { const a = s.cmp[c.id]; return `<div class="card"><p><b>${esc(c.q)}</b></p><div class="pills" role="group" aria-label="${esc(c.q)}">${[['n', 'The notebook entry'], ['s', 'The summary'], ['b', 'Both']].map(([k, t]) => `<button type="button" aria-pressed="${!!(a && a.pick === k)}" class="pill${a && a.pick === k ? (a.ok ? ' good' : ' bad') : ''}" data-act="cmp" data-id="${c.id}" data-k="${k}" data-f="c-${c.id}-${k}">${t}</button>`).join('')}</div><p class="fb ${a ? (a.ok ? 'good' : 'bad') : ''}" role="status">${a ? (a.ok ? '✓ ' + esc(c.why) : esc((c.no && c.no[a.pick]) || 'Not quite. Look at both documents again.')) : ''}</p></div>`; }).join('')}
    <div class="callout ok"><b>Why keep the original record?</b> A summary can leave out the messy parts. The original notebook shows what really happened, in order, so others (and you, later) can check the work.</div>
    ${done ? '<div class="callout ok" role="status"><b>Station complete!</b> You know the parts of a notebook and why the original record matters.</div>' : ''}
    <details class="card"><summary><b>Go deeper: notebooks vary</b></summary><p>Notebook formats differ between fields and institutions. Some labs use bound paper notebooks, others use electronic lab notebooks (ELNs). The ideas on these pages are general principles; your own lab or school will have its own rules.</p></details>`;
    FA.bind({
      part: b => { sel = b.dataset.id; if (!s.parts.includes(sel)) { s.parts.push(sel); FA.save(); } const p = PARTS.find(x => x.id === sel); FA.say(`${p.name}. ${p.why}`); FA.rerender('p-' + sel); if (s.parts.length >= PARTS.length) check(); },
      cmp: b => { const c = CMP.find(x => x.id === b.dataset.id); const ok = c.a === b.dataset.k; const prev = s.cmp[c.id]; s.cmp[c.id] = { pick: b.dataset.k, ok, ever: ok || !!(prev && prev.ever) }; FA.save(); FA.say(ok ? c.why : ((c.no && c.no[b.dataset.k]) || 'Not quite. Compare the two documents again.'), ok ? 'Keeping the original record lets others check what really happened.' : ''); FA.rerender(`c-${c.id}-${b.dataset.k}`); check(); }
    });
    function check() { const ok = S().s1.parts.length >= PARTS.length && cmp.every(c => S().s1.cmp[c.id] && S().s1.cmp[c.id].ever); if (ok && !S().done[1]) { FA.mark(1); FA.rerender(); } }
    FA.intro('A laboratory notebook is where scientists keep a record of what they planned, what they actually did, what they observed, and what they learned.', 'It is the original, dated record of the work as it happened, not a polished report.');
  }
};

/* =============================================================== STATION 2 · Set up your first lab notebook */
const BOOKS = [
  { id: 'bound', t: 'A bound notebook with numbered pages', ok: true, why: 'Bound, numbered pages make it easy to see if a page is missing, and the entries stay in order. Many institutions ask for this.' },
  { id: 'loose', t: 'Loose sheets in a folder', ok: false, why: 'Loose sheets can be lost, mixed up or swapped without anyone noticing. A bound notebook keeps the record in order.' },
  { id: 'spiral', t: 'A spiral notebook where pages tear out', ok: false, why: 'Pages that tear out easily make it hard to show the record is complete. Bound pages that stay in place are better.' }
];
FA.stations[2] = {
  render(root) {
    const s = S().s2, step = () => ({ 1: s.book === 'bound', 2: !!s.title.trim(), 3: s.tocAdded, 4: s.numbered, 5: !!s.date, 6: !!s.expId.trim() && !!s.nbId.trim() });
    const ok = step(), now = [1, 2, 3, 4, 5, 6].find(i => !ok[i]);
    const yymmdd = (s.date || FA.today()).replace(/-/g, '').slice(2);
    const li = (i, t, body) => `<li class="${ok[i] ? 'done' : now === i ? 'now' : ''}"><h3>${t}${ok[i] ? '<span class="sr-only"> (done)</span>' : ''}</h3>${body}</li>`;
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Let us set up a notebook the way a scientist does. Do the six steps.', j: 'Set up your first lab notebook by doing the six steps in order.', a: 'Set up a notebook that another researcher could navigate. Use fictional identifiers: do not use real names.' }))}</p>
    <ol class="steps">
    ${li(1, 'Choose a bound notebook', `<div class="optcards" role="radiogroup" aria-label="Notebook type">${BOOKS.map(b => `<label class="optc"><input type="radio" name="book" value="${b.id}" data-ch="book" data-f="book-${b.id}" ${s.book === b.id ? 'checked' : ''}><span>${esc(b.t)}</span></label>`).join('')}</div><p class="fb ${s.book ? (s.book === 'bound' ? 'good' : 'bad') : ''}" role="status">${s.book ? esc(BOOKS.find(b => b.id === s.book).why) : ''}</p>`)}
    ${li(2, 'Add a project title', `<div class="fld"><label for="ptitle">Project title</label><input id="ptitle" data-in="title" data-f="title" maxlength="60" value="${esc(s.title)}" placeholder="for example: Fruit fly climbing practice" autocomplete="off"></div><div class="pills">${['Fruit fly climbing practice', 'Fly observation practice'].map(t => `<button type="button" class="pill" data-act="titleChip" data-t="${esc(t)}" data-f="chip-${esc(t)}">${esc(t)}</button>`).join('')}</div>`)}
    ${li(3, 'Create a table of contents', `<p>The table of contents is an index of entries (page, date, title and experiment ID).</p>${s.tocAdded ? '<p class="fb good" role="status">✓ Table of contents created. New entries are listed here as you start them.</p>' : '<button type="button" class="nb alt" data-act="toc" data-f="toc">Create the table of contents</button>'}`)}
    ${li(4, 'Number the pages', `<p>Number every page before you use it. Do not skip pages.</p>${s.numbered ? '<p class="fb good" role="status">✓ Pages numbered 1, 2, 3…</p>' : '<button type="button" class="nb alt" data-act="number" data-f="number">Number the pages</button>'}`)}
    ${li(5, 'Date the first entry', `<div class="fld"><label for="edate">Date of the work (the day you do the experiment)</label><input id="edate" type="date" data-ch="date" data-f="date" value="${esc(s.date)}"></div><button type="button" class="nb alt" data-act="today" data-f="today">Use today's date</button>`)}
    ${li(6, 'Give your experiment an identifier', `<div class="fgrid"><div class="fld"><label for="nbid">Notebook ID (made-up example)</label><input id="nbid" data-in="nbId" data-f="nbid" maxlength="20" value="${esc(s.nbId)}" placeholder="NB-001"></div><div class="fld"><label for="expid">Experiment ID (made-up example)</label><input id="expid" data-in="expId" data-f="expid" maxlength="30" value="${esc(s.expId)}" placeholder="FLY-${yymmdd}-01"></div></div><button type="button" class="nb alt" data-act="suggest" data-f="suggest">Suggest IDs</button><p class="starter">Use fictional codes like these. Do not put real names or personal details in a practice notebook.</p>`)}
    </ol>
    <h3>Your notebook so far</h3>
    <div class="doc ${ok[1] ? '' : 'locked'}" aria-label="Preview of your notebook"><p><b>${esc(s.title || 'Project title not added yet')}</b> ${s.nbId ? '· ' + esc(s.nbId) : ''}</p><p><b>Contents:</b> ${s.tocAdded ? (s.expId && s.date ? `Page 1 · ${esc(FA.niceDate(s.date))} · ${esc(s.expId)} · ${esc(s.title || 'untitled')}` : '(no entries yet)') : '(table of contents not created yet)'}</p><p><b>Pages:</b> ${s.numbered ? 'numbered in advance' : 'not numbered yet'}</p></div>
    <div class="callout"><b>Some labs also ask for signatures, initials, or a witness.</b> Those controls depend on the institution and the kind of work. They are <b>not</b> required everywhere, so follow your own lab's rules.</div>
    <details class="card"><summary><b>Paper notebook or electronic notebook?</b></summary><div class="scroll"><table class="tbl"><caption class="sr-only">Paper and electronic notebooks compared</caption><thead><tr><th scope="col"></th><th scope="col">Bound paper notebook</th><th scope="col">Properly managed electronic notebook (ELN)</th></tr></thead><tbody>
      <tr><th scope="row">Page order</th><td>Pre-numbered pages show if one is missing.</td><td>The system keeps entries in order and records when they were made.</td></tr>
      <tr><th scope="row">Corrections</th><td>One line through the old entry so it stays readable, then the new entry with a date (and initials if required).</td><td>The original entry is preserved and a visible history shows the change.</td></tr>
      <tr><th scope="row">Access and backup</th><td>One physical copy; keep it safe.</td><td>Shared access and backups, controlled by the institution.</td></tr></tbody></table></div><p class="starter">This practice page is a simple teaching model. It is not a validated, audit-trailed ELN.</p></details>
    ${Object.values(ok).every(Boolean) ? '<div class="callout ok" role="status"><b>Station complete!</b> Your first notebook is set up.</div>' : ''}`;
    FA.bind({
      titleChip: b => { s.title = b.dataset.t; FA.save(); FA.rerender('title'); chk(); },
      toc: () => { s.tocAdded = true; FA.save(); FA.say('The table of contents is ready.', 'An index helps others find your work.'); FA.rerender('number'); chk(); },
      number: () => { s.numbered = true; FA.save(); FA.say('Pages numbered. Now nobody can slip a page in or out without it being noticed.', 'Numbered pages make missing or added pages obvious.'); FA.rerender('today'); chk(); },
      today: () => { s.date = FA.today(); FA.save(); FA.rerender('date'); FA.say('Dated. Always use the date the work was actually done.', 'Dates make the record a timeline.'); $('#pageDate').textContent = FA.niceDate(s.date); chk(); },
      suggest: () => { const d = (s.date || FA.today()); s.date = d; s.nbId = s.nbId || 'NB-001'; s.expId = s.expId || 'FLY-' + d.replace(/-/g, '').slice(2) + '-01'; FA.save(); FA.rerender('suggest'); chk(); }
    }, {
      book: (f) => { s.book = f.value; FA.save(); FA.say(BOOKS.find(b => b.id === f.value).why, 'Bound, numbered pages show whether a record is complete.'); FA.rerender('book-' + f.value); chk(); },
      date: f => { s.date = f.value; FA.save(); $('#pageDate').textContent = FA.niceDate(s.date); FA.rerender('date'); chk(); },
      title: f => { s.title = f.value.slice(0, 60); FA.save(); chk(true); },
      nbId: f => { s.nbId = f.value.slice(0, 20); FA.save(); chk(true); },
      expId: f => { s.expId = f.value.slice(0, 30); FA.save(); chk(true); }
    });
    function chk(quiet) { const k = step(); if (Object.values(k).every(Boolean) && !S().done[2]) { FA.mark(2); if (!quiet) FA.rerender(); else FA.rerender(document.activeElement && document.activeElement.dataset.f); } }
    FA.intro('Let us set up a bound notebook step by step.', 'A well-organized notebook lets other people find and follow your work.');
  }
};

/* =============================================================== STATION 3 · Record as you go (simulated experiment) */
const OUT = { 1: [1, 1, 1, 1, 0], 2: [1, 1, 1, 0, 0], 3: [1, 1, 1, 1, 1] };
const EVENTS = {
  1: [[0, 'Vial tapped so all flies start at the bottom.'], [10, 'Time is up: counted the flies above the reference line.']],
  2: [[0, 'Vial tapped so all flies start at the bottom.'], [0.5, 'The vial tilted to one side as it was tapped (the hand slipped).'], [3, 'The vial was set upright again.'], [10, 'Time is up: counted the flies above the reference line.']],
  3: [[0, 'Vial tapped so all flies start at the bottom.'], [10, 'Time is up: counted the flies above the reference line.']]
};
const CONDS = ['Room temperature (not measured)', 'Normal room light', 'Same vial, same 5 flies', 'The vial was tilted when tapped', 'Nothing unusual happened'];
const rnd = (seed) => { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
let anim = { id: 0, playing: false };
function simSvg(t, p) { // p = progress 0..1 (simulated seconds / 10)
  const R = rnd(t * 31 + 7), out = OUT[t];
  const tilt = t === 2 ? (p < .05 ? 0 : p < .3 ? Math.min(14, (p - .05) / .05 * 14) : Math.max(0, 14 - (p - .3) / .05 * 14)) : 0;
  const flies = out.map((up, i) => { const d = R() * .25, dur = .35 + R() * .4, u = Math.min(1, Math.max(0, (p - d) / dur)), e = u * u * (3 - 2 * u), yEnd = up ? 28 + R() * 55 : 150 + R() * 90, y0 = 268, x = 122 + i * 17 + (R() - .5) * 5;
    const y = y0 + (yEnd - y0) * (p >= 1 ? 1 : e), wob = p >= 1 ? 0 : Math.sin(p * 40 + i) * 3; return `<g transform="translate(${(x + wob).toFixed(1)} ${y.toFixed(1)})" ${p >= 1 && up ? 'class="above"' : ''}><ellipse cx="0" cy="6" rx="4.4" ry="7" fill="#d9a04a" stroke="#7a4f1c" stroke-width=".8"/><ellipse cx="0" cy="-3" rx="4.2" ry="4.6" fill="#e6b45e" stroke="#7a4f1c" stroke-width=".8"/><circle cx="0" cy="-9" r="3.6" fill="#e0aa55" stroke="#7a4f1c" stroke-width=".8"/><ellipse cx="-2" cy="-9.6" rx="1.6" ry="2" fill="#b3262f"/><ellipse cx="2" cy="-9.6" rx="1.6" ry="2" fill="#b3262f"/><path d="M-3 -3Q-12 6 -7 16M3 -3Q12 6 7 16" fill="#dff1fb" fill-opacity=".7" stroke="#8aa8bb" stroke-width=".8"/></g>`; }).join('');
  return `<svg viewBox="0 0 300 320" role="img" aria-label="Simulated observation vial with five flies and a reference line"><g transform="rotate(${tilt} 150 300)"><path d="M100 14H200V286Q200 306 150 306Q100 306 100 286Z" fill="#e9f5f4" fill-opacity=".8" stroke="#6faab0" stroke-width="4"/><rect x="94" y="4" width="112" height="18" rx="8" fill="#f1e7d2" stroke="#d6c7a6"/><path d="M100 118H200" stroke="#c4655a" stroke-width="4" stroke-dasharray="9 6"/><text x="208" y="123" font-family="Verdana,sans-serif" font-size="11" fill="#8a3f37" font-weight="700">reference line</text>${flies}</g></svg>`;
}
FA.stations[3] = {
  render(root) {
    const s = S().s3, trial = [1, 2, 3].find(t => !s.rec[t]) || 4, all = trial === 4;
    const playedNow = trial <= 3 && s.played[trial];
    const rows = [1, 2, 3].filter(t => s.rec[t]).map(t => { const r = s.rec[t]; return `<tr><th scope="row">${t}</th><td>${r.time}</td><td>${r.n}</td><td>${r.up}</td><td>${r.int} ${r.unit}</td><td>${esc(r.conds.join('; '))}${r.other ? '; ' + esc(r.other) : ''}</td></tr>`; }).join('');
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Watch the flies. Then write what happened in your notebook right away.', j: 'Watch each trial. Right after it ends, write what happened in your notebook. Then the next trial opens.', a: 'Watch each trial and record it immediately: trial number, flies observed, flies crossing, interval and conditions. The next trial opens only after you record.' }))}</p>
    <p><span class="sim">Simulated data</span> <span class="starter">These numbers are made up for practice. They are not real experimental data.</span></p>
    ${all ? '' : `<div class="two"><div><div class="stage" id="simStage" aria-label="Observation vial">${simSvg(trial, s.played[trial] ? 1 : 0)}</div>
      <div class="row"><button type="button" class="nb go" data-act="play" data-f="play" ${anim.playing ? 'disabled' : ''}>${s.played[trial] ? 'Watch trial ' + trial + ' again' : 'Start trial ' + trial}</button><span class="timer" id="clock" aria-live="off">Time: ${s.played[trial] ? '10' : '0'} s (simulated)</span></div>
      <div class="card" id="evlog"><h3>What I saw (event log)</h3><ul id="evlist">${s.played[trial] ? EVENTS[trial].map(e => `<li>${e[0]} s: ${esc(e[1])}</li>`).join('') : '<li>Press Start to watch trial ' + trial + '.</li>'}</ul></div></div>
      <div id="recForm">${playedNow ? form(trial, s) : '<div class="callout"><b>Next:</b> watch the trial, then record it. You cannot skip ahead: real notes are made at the time of the work.</div>'}</div></div>`}
    <h3>Your notebook (page ${trial > 3 ? 3 : trial})</h3>
    <div class="scroll"><table class="tbl"><caption class="sr-only">Recorded trials</caption><thead><tr><th scope="col">Trial</th><th scope="col">Recorded at</th><th scope="col">Flies observed</th><th scope="col">Crossed the line</th><th scope="col">Interval</th><th scope="col">Conditions</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No trials recorded yet.</td></tr>'}</tbody></table></div>
    ${all ? after(s) : ''}
    <details class="card"><summary><b>Go deeper: this is a simplified practice</b></summary><p>A professional climbing assay uses a defined protocol: for example a fixed number and age of flies, a standardized way of tapping, a set time, controlled temperature and light, and repeated trials, often with blinded scoring. This practice shows only the recordkeeping habit.</p></details>`;
    FA.bind({
      play: () => play(trial),
      show: () => { const out = OUT[trial].filter(Boolean).length; FA.say(`Look at the line: ${out} flies are above it. Now write that in your notebook.`); $('#simStage').innerHTML = simSvg(trial, 1); $$('#simStage .above').forEach(g => g.insertAdjacentHTML('beforeend', '<circle r="11" fill="none" stroke="#2d7a52" stroke-width="2.5"/>')); },
      cond: b => { const c = b.dataset.c; const r = (s.t3draft = s.t3draft || { conds: [] }); const i = r.conds.indexOf(c); if (i >= 0) r.conds.splice(i, 1); else r.conds.push(c); b.setAttribute('aria-pressed', String(i < 0)); b.classList.toggle('on', i < 0); },
      save: () => save(trial),
      why: b => { s.why = b.dataset.k; FA.save(); FA.rerender('why-' + b.dataset.k); doneCheck(); },
      t2: b => { s.t2 = b.dataset.k; FA.save(); FA.rerender('t2-' + b.dataset.k); doneCheck(); }
    }, {});
    if (!playedNow && trial <= 3) FA.intro(`Trial ${trial}. Watch the vial and the reference line.`, 'Writing observations when they happen means you remember details, the order and the conditions.');
    function doneCheck() { const q = S().s3; if (q.rec[1] && q.rec[2] && q.rec[3] && q.why === 'good' && q.t2 === 'keep' && !S().done[3]) { FA.mark(3); FA.rerender(); } }
  }
};
function form(t, s) {
  const d = s.t3draft && s.t3draft.trial === t ? s.t3draft : (s.t3draft = { trial: t, conds: [] });
  return `<div class="card entry"><h3>Write it in your notebook now</h3>
    <div class="fgrid"><div class="fld"><label for="f-trial">Trial number</label><input id="f-trial" type="number" min="1" max="9" inputmode="numeric" data-f="f-trial"></div><div class="fld"><label for="f-n">Flies observed</label><input id="f-n" type="number" min="0" max="20" inputmode="numeric"></div><div class="fld"><label for="f-up">Flies that crossed the line</label><input id="f-up" type="number" min="0" max="20" inputmode="numeric"></div>
    <div class="fld"><label for="f-int">Observation interval</label><div class="row" style="margin:0"><input id="f-int" type="number" min="1" max="600" inputmode="numeric" style="max-width:6rem"><select id="f-unit" aria-label="Unit of time"><option value="s">seconds (s)</option><option value="min">minutes (min)</option></select></div></div></div>
    <div class="fld"><span class="lab" id="condlab">Conditions and anything unusual (choose all that apply)</span><div class="pills" role="group" aria-labelledby="condlab">${CONDS.map(c => `<button type="button" class="pill${d.conds.includes(c) ? ' on' : ''}" aria-pressed="${d.conds.includes(c)}" data-act="cond" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
    <div class="fld"><label for="f-other">Other conditions or notes (optional)</label><input id="f-other" maxlength="120" autocomplete="off"></div>
    <p class="fb" id="f-fb" role="status"></p>
    <div class="row"><button type="button" class="nb" data-act="save" data-f="save">Save to my notebook</button><button type="button" class="nb alt" data-act="show" data-f="show">I need help counting</button></div></div>`;
}
function play(t) {
  const s = S().s3; if (anim.playing) return; anim.playing = true; const my = ++anim.id; $('[data-act="play"]').disabled = true;
  const stage = $('#simStage'), clock = $('#clock'), ev = $('#evlist'); ev.innerHTML = ''; { const rf = $('#recForm'); if (rf) rf.innerHTML = '<div class="callout"><b>Watching…</b> Write it in your notebook right after the trial ends, while you remember it.</div>'; } FA.announce(`Trial ${t} started.`);
  const fin = () => { anim.playing = false; s.played[t] = true; FA.save(); stage.innerHTML = simSvg(t, 1); clock.textContent = 'Time: 10 s (simulated)'; ev.innerHTML = EVENTS[t].map(e => `<li>${e[0]} s: ${esc(e[1])}</li>`).join(''); FA.announce(`Trial ${t} finished. Write it in your notebook now.`); FA.rerender('f-trial'); const rf = $('#recForm'); if (rf && window.matchMedia('(max-width: 759px)').matches) rf.scrollIntoView({ block: 'start', behavior: FA.rm() ? 'auto' : 'smooth' }); FA.say(`Trial ${t} is over. Write what you saw right now, while you remember it.`, 'Records made at the time are more reliable than memories written later.'); };
  if (FA.rm()) { fin(); return; }
  const dur = 4500, t0 = performance.now(); let shown = 0;
  (function f(now) { if (my !== anim.id) return; const p = Math.min(1, (now - t0) / dur), sec = p * 10; stage.innerHTML = simSvg(t, p); clock.textContent = `Time: ${Math.floor(sec)} s (simulated)`;
    EVENTS[t].forEach((e, i) => { if (i >= shown && sec >= e[0] && e[0] < 10) { ev.insertAdjacentHTML('beforeend', `<li>${e[0]} s: ${esc(e[1])}</li>`); shown = i + 1; } });
    if (p < 1) requestAnimationFrame(f); else fin(); })(t0);
}
function save(t) {
  const s = S().s3, v = id => $(id).value, fb = $('#f-fb'), d = s.t3draft || { conds: [] };
  const n = +v('#f-n'), up = +v('#f-up'), tr = +v('#f-trial'), int = +v('#f-int'), unit = v('#f-unit'), other = v('#f-other').trim().slice(0, 120);
  const bad = m => { fb.className = 'fb bad'; fb.textContent = m; s.tries[t] = (s.tries[t] || 0) + 1; FA.save(); FA.say(m); };
  if (!v('#f-trial') || !v('#f-n') || !v('#f-up') || !v('#f-int')) return bad('Please fill in every number: trial, flies observed, flies that crossed, and the interval.');
  if (tr !== t) return bad(`This is trial ${t}. Check the trial number.`);
  if (n !== 5) return bad('Count all the flies in the vial. How many flies are there altogether?');
  const real = OUT[t].filter(Boolean).length;
  if (up !== real) return bad('Look at the reference line again. Watch the trial once more, or press "I need help counting". Count only flies above the line at the end.');
  if (!((int === 10 && unit === 's') || (int === 0.1667 && unit === 'min'))) return bad('Check the time interval: the flies were observed for 10 seconds.');
  const tilt = d.conds.includes(CONDS[3]) || /tilt/i.test(other);
  if (t === 2 && (!tilt || d.conds.includes(CONDS[4]))) return bad('Did anything unusual happen in this trial? Read the event log. Scientists write unusual events down, even if they are small.');
  if (!d.conds.length && !other) return bad('Write at least one condition (for example room temperature or light).');
  if (t !== 2 && d.conds.includes(CONDS[3])) return bad('The event log does not show a tilt in this trial. Only record what really happened.');
  s.rec[t] = { n, up, int, unit, conds: d.conds.slice(), other, time: FA.time(), date: FA.today() }; s.t3draft = null; FA.save();
  FA.say(t === 2 ? 'You recorded the tilt instead of hiding it. That keeps the record honest. Trial 2 stays in the notebook.' : `Saved at ${s.rec[t].time}. Good: written down right away.`, t === 2 ? 'An unexpected event or a surprising result is data too. Record it; do not quietly leave it out.' : 'Recording at the moment keeps details accurate.');
  FA.rerender(t < 3 ? 'play' : 'why-good');
}
function after(s) {
  return `<div class="callout ok"><b>All three trials are in your notebook.</b> Trial 2 was done with a tilted vial. Now think like a scientist.</div>
  <div class="card"><h3>What should the scientist do with Trial 2?</h3><div class="pills" role="group" aria-label="What to do with Trial 2">${[['del', 'Delete it because it is different'], ['keep', 'Keep it, note the tilt, and think about repeating it under the same conditions'], ['change', 'Change the 3 to a 4 so it matches the others']].map(([k, t]) => `<button type="button" aria-pressed="${s.t2 === k}" class="pill${s.t2 === k ? (k === 'keep' ? ' good' : ' bad') : ''}" data-act="t2" data-k="${k}" data-f="t2-${k}">${t}</button>`).join('')}</div>
  <p class="fb ${s.t2 ? (s.t2 === 'keep' ? 'good' : 'bad') : ''}" role="status">${s.t2 === 'keep' ? '✓ Keep every trial and record why one might be different. The tilt may have affected the result, so interpret Trial 2 cautiously. A repeat under consistent conditions would help.' : s.t2 ? 'Not quite. Deleting or changing a recorded trial because it is unexpected makes the record untrue. Keep it, and write down why it may differ (here, the tilt).' : ''}</p></div>
  <div class="card"><h3>A friend says: "I will write it down tomorrow." What could go wrong?</h3><div class="pills" role="group" aria-label="Writing it down later">${[['good', 'I might forget the tilt, mix up which trial was which, or misremember the numbers'], ['none', 'Nothing. Memory is always perfect']].map(([k, t]) => `<button type="button" aria-pressed="${s.why === k}" class="pill${s.why === k ? (k === 'good' ? ' good' : ' bad') : ''}" data-act="why" data-k="${k}" data-f="why-${k}">${t}</button>`).join('')}</div>
  <p class="fb ${s.why ? (s.why === 'good' ? 'good' : 'bad') : ''}" role="status">${s.why === 'good' ? '✓ Exactly. That is why scientists record as they go.' : s.why ? 'Memories fade and change. Try again.' : ''}</p></div>
  ${S().done[3] ? '<div class="callout ok" role="status"><b>Station complete!</b> You recorded each trial when it happened, including the unexpected tilt.</div>' : ''}`;
}

/* =============================================================== STATION 4 · Observation, measurement, or interpretation? */
const CATS = {
  obs: { n: 'Direct observation', d: 'Something you sensed or counted directly.' },
  meas: { n: 'Recorded measurement', d: 'A quantity with units from a tool or a defined procedure.' },
  pred: { n: 'Prediction', d: 'What you think will happen later.' },
  expect: { n: 'Expectation', d: 'What you thought would happen. It is not an observation.' },
  explain: { n: 'Hypothesis or possible explanation', d: 'A testable idea about why something happened. It is an idea to test, not a result.' },
  concl: { n: 'Cautious conclusion', d: 'A statement of what the recorded data show and what they cannot show.' },
  unsup: { n: 'Unsupported interpretation', d: 'A claim about feelings or causes with no evidence recorded.' }
};
const STMT = [
  { id: 'a', t: 'I counted five flies.', c: 'obs', why: 'Counting is a direct observation of how many flies there are.', lv: 0 },
  { id: 'b', t: 'Four flies crossed the line in ten seconds.', c: 'meas', why: 'This is a recorded result with a number and a time interval.', lv: 0 },
  { id: 'c', t: 'I predict more flies will climb at the next trial.', c: 'pred', why: 'A prediction is about the future. It is useful, but it is not a result.', lv: 0 },
  { id: 'd', t: 'The flies were happy.', c: 'unsup', why: 'There is no observation behind "happy". A scientist would record what the flies did instead.', lv: 0 },
  { id: 'e', t: 'The results may have been influenced by the tilted vial.', c: 'explain', why: 'This is a possible explanation. It belongs in a notebook, labeled as an interpretation.', lv: 1 },
  { id: 'f', t: 'I expected five flies to climb.', c: 'expect', why: 'An expectation is what you thought would happen. It is not what was observed.', lv: 1 },
  { id: 'g', t: 'The vial has a red line drawn on it.', c: 'obs', why: 'You can see the line directly: this is an observation.', lv: 1 },
  { id: 'h', t: 'The room thermometer read 23 °C.', c: 'meas', why: 'A reading from an instrument, with a unit, is a measurement.', lv: 2 },
  { id: 'i', t: 'The flies climb because they like the light.', c: 'unsup', why: 'No evidence about light was recorded, so this is an unsupported claim about a cause.', lv: 2 },
  { id: 'j', t: 'Trial 3 may have been higher because the flies were warmer.', c: 'explain', why: 'This is a possible explanation (a hypothesis). It would need a test to support it.', lv: 2 },
  { id: 'k', t: 'Hypothesis: tilting the vial lowers how many flies reach the line.', c: 'explain', why: 'A hypothesis is a testable explanation. It is an idea to test, not a result, and it should be written down as a hypothesis.', lv: 2 },
  { id: 'l', t: 'Across the three practice trials, 12 of 15 flies crossed the line. Trial 2 was tilted, so these data cannot tell us whether the tilt caused the lower count.', c: 'concl', why: 'A conclusion says what the recorded data show and what they cannot show. It stays inside the evidence and is labeled as a conclusion.', lv: 2 }
];
const mapCat = c => FA.T({ e: { obs: 'saw', meas: 'saw', pred: 'think', expect: 'think', explain: 'think', unsup: 'think', concl: 'think' }, j: { obs: 'obs', meas: 'meas', pred: 'pe', expect: 'pe', explain: 'int', unsup: 'int', concl: 'int' }, a: { obs: 'obs', meas: 'meas', pred: 'pred', expect: 'expect', explain: 'explain', unsup: 'unsup', concl: 'concl' } })[c];
const PDEF = { saw: 'something you saw or counted yourself', think: 'something you think, guess or expect', obs: 'something sensed or counted directly', meas: 'a quantity with units from a tool or defined procedure', pe: 'what you expect or guess will happen, before or apart from the result', int: 'an idea or conclusion about what the data mean', pred: 'what you think will happen later', expect: 'what you thought would happen', explain: 'a testable idea about why something happened', concl: 'what the data show and cannot show', unsup: 'a claim with no recorded evidence' };
const catNo = (x, pick) => 'You chose a category meaning ' + (PDEF[pick] || 'something else') + '. Read the sentence again: does it match that meaning?';
const LCATS = () => FA.T({ e: [['saw', 'I saw or counted it'], ['think', 'I think or guess']], j: [['obs', 'Observation'], ['meas', 'Measurement'], ['pe', 'Prediction or expectation'], ['int', 'Interpretation']], a: Object.entries(CATS).map(([k, v]) => [k, v.n]) });
FA.stations[4] = {
  render(root) {
    const s = S().s4, items = STMT.filter(x => x.lv <= FA.T({ e: 0, j: 1, a: 2 }));
    const done = items.every(x => s.ans[x.id] && s.ans[x.id].ever);
    const lc = LCATS();
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Some sentences tell what you saw. Other sentences tell what you think. Pick the right one.', j: 'Sort each sentence: is it something you observed or measured, or is it a prediction or an interpretation?', a: 'Classify each statement. Interpretations and hypotheses belong in a notebook too, but they must be labeled as interpretations, not presented as direct observations.' }))}</p>
    <div class="callout"><b>Key idea:</b> Write what you <i>saw and measured</i> separately from what you <i>think it means</i>. Both belong in a notebook, but they are different.</div>
    ${items.map(x => { const a = s.ans[x.id]; return `<div class="card"><p><b>“${esc(x.t)}”</b></p><div class="pills" role="group" aria-label="Category for: ${esc(x.t)}">${lc.map(([k, n]) => `<button type="button" aria-pressed="${!!(a && a.pick === k)}" class="pill${a && a.pick === k ? (a.ok ? ' good' : ' bad') : ''}" data-act="pick" data-id="${x.id}" data-k="${k}" data-f="${x.id}-${k}">${esc(n)}</button>`).join('')}</div><p class="fb ${a ? (a.ok ? 'good' : 'bad') : ''}" role="status">${a ? (a.ok ? '✓ ' + esc(x.why) : 'Not quite. ' + esc(catNo(x, a.pick))) : ''}</p></div>`; }).join('')}
    <details class="card"><summary><b>What do the words mean?</b></summary><ul>${FA.lv() === 'apprentice' ? Object.values(CATS).map(c => `<li><b>${c.n}:</b> ${c.d}</li>`).join('') : '<li><b>Observation or measurement:</b> what you saw, counted or measured, with units.</li><li><b>Prediction, expectation, interpretation, conclusion:</b> what you think or what the data suggest. Label it as such.</li>'}</ul></details>
    ${done ? '<div class="callout ok" role="status"><b>Station complete!</b> You can tell evidence from interpretation.</div>' : ''}`;
    FA.bind({
      pick: b => { const x = STMT.find(i => i.id === b.dataset.id), ok = mapCat(x.c) === b.dataset.k; const prev = s.ans[x.id]; s.ans[x.id] = { pick: b.dataset.k, ok, ever: ok || !!(prev && prev.ever) }; FA.save(); FA.say(ok ? x.why : 'Not quite. ' + catNo(x, b.dataset.k), 'Keeping observations and interpretations separate makes a record trustworthy.'); FA.rerender(`${x.id}-${b.dataset.k}`); if (items.every(i => s.ans[i.id] && s.ans[i.id].ever) && !S().done[4]) { FA.mark(4); FA.rerender(); } }
    });
    FA.intro('Is it something you saw and measured, or something you think?', 'Interpretations are allowed in notebooks, but they must be labeled so nobody mistakes them for observations.');
  }
};
})();
