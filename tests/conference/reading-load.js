// Reading-load audit. Opens each chapter in a comparable "start of this chapter" state and counts what a learner must face:
//   words (whole chapter and first screen), paragraphs, free-text fields (text inputs, textareas, selects), buttons, and passive text blocks.
// Usage: LABEL=baseline node tests/conference/reading-load.js [explorer|researcher]   -> docs/conference-visual/<label>-<mode>.json
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'http://localhost:8123/scientific-conference.html';
const label = process.env.LABEL || 'run';
const mode = process.argv[2] || '';

// state needed so that chapter n is reachable and empty (its own work cleared)
const prep = ([n, path, mode]) => {
  const S = DC.state;
  const full = (p) => {
    S.mode = 'independent'; S.nick = 'Zoe'; S.path = p; S.checked = true; S.a.acked = true;
    DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice()));
    S.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' };
    S.det.c3var = { sel: 1, ok: true }; ['d_mean', 'd_diff', 'd_range', 'd_oi', 'd_cause', 'd_repl', 'limits', 'd_axis'].forEach((k) => (S.det[k] = { ok: true }));
    if (p === 'B') { S.b.f.title = 'Ants at my door'; S.b.f.question = 'When do ants come to my door?'; S.b.f.methods = 'I watched the door.'; S.b.log = [{ label: 'Mon', group: '', value: '4', note: '' }, { label: 'Tue', group: '', value: '6', note: '' }]; S.b.organizerSeen = true; S.b.chart = { kind: 'time', yTitle: 'Ants', xTitle: 'Day', unit: 'ants' }; }
    Object.assign(S.abs, p === 'A' ? { bg: 'Fruit flies are ectotherms, so air temperature can change how active they are.', obj: 'This simulated activity asked whether fewer flies climb above an 8 cm line at 18 °C than at 25 °C.', methods: 'In a simulated experiment, two groups of 10 flies were tapped and counted after 10 seconds in 5 trials.', results: 'At 25 °C the mean was 7.2 flies above the line. At 18 °C the mean was 4.2.', conclusion: 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit.' } : { bg: 'Ants live in colonies near doors.', obj: 'When do ants come to my door?', methods: 'I watched the door each morning and counted the ants.', results: 'I counted 4 ants on Monday and 6 on Tuesday.', conclusion: 'More ants came on Tuesday, which suggests the day might matter, but I need more days.' });
    S.poster.started = true; Object.assign(S.poster.f, { title: 'My title', author: 'Zoe', question: S.abs.obj, background: S.abs.bg, methods: S.abs.methods, results: S.abs.results, conclusions: S.abs.conclusion, limitations: '- Only a few tries' });
    S.reg.orderOk = true; DC.AREAS.forEach((a) => (S.hall.visited[a.id] = true)); ['quill', 'anand', 'waverly'].forEach((id) => (S.hall.sci[id] = { sel: 0, score: 2, best: true }));
    Object.assign(S.prac, { timerDone: true, explain: 'x', explainOk: true, qa: { q1: 'x', q2: 'x', q3: 'x' }, qaDone: { q1: true, q2: true, q3: true } }); S.revs = [{ note: 'a b c d e f g h', changed: true }]; Object.assign(S.refl, { learned: 'I learned many new things today.' });
  };
  if (mode && DC.state.ui) DC.state.ui.level = mode;
  if (n === 1) { DC.state = DC.defaults(); if (mode && DC.state.ui) DC.state.ui.level = mode; }
  else if (n === 2) { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = null; }
  else {
    full(path);
    if (n === 3) { S.a.rec = { control: [null, null, null, null, null], cool: [null, null, null, null, null] }; S.a.setup = {}; S.det.c3var = null; S.b.organizerSeen = false; S.b.log = [{ label: '', group: '', value: '', note: '' }]; }
    if (n === 4) { S.det = { c3var: { sel: 1, ok: true } }; S.b.chart = { kind: 'auto', yTitle: '', xTitle: '', unit: '' }; S.b.claims = [{ text: '', evidence: '', kind: '' }]; }
    if (n === 5) { Object.keys(S.abs).forEach((k) => (S.abs[k] = '')); }
    if (n === 6) { S.poster.started = false; Object.keys(S.poster.f).forEach((k) => (S.poster.f[k] = '')); }
    if (n === 7) { S.checked = false; S.reg = DC.defaults().reg; }
    if (n === 8) { S.hall = DC.defaults().hall; }
    if (n === 9) { S.prac = DC.defaults().prac; S.revs = []; S.refl = DC.defaults().refl; }
    if (n === 10) { S.fin = { claimed: false }; }
  }
  DC.saveNow();
};

const measure = () => {
  const stage = document.querySelector('#stage');
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT); let words = 0, first = 0, n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el || !vis(el) || el.closest('[aria-hidden="true"], .sr-only, script, style')) continue;
    const w = (t.match(/\S+/g) || []).length; words += w; const rg = document.createRange(); rg.selectNodeContents(n); const rc = rg.getBoundingClientRect(); if (rc.top < innerHeight && rc.bottom > 0) first += w;
  }
  const paras = [...stage.querySelectorAll('p, li, dd')].filter((e) => vis(e) && (e.innerText.match(/\S+/g) || []).length >= 8 && !e.closest('.nav-foot')).length;
  const fields = [...stage.querySelectorAll('input[type=text], input[type=number], textarea, select')].filter(vis).length;
  const buttons = [...stage.querySelectorAll('button, [role=button], a.btn')].filter(vis).length;
  const longBlocks = [...stage.querySelectorAll('.card, .callout, .q, .bubble, .preview')].filter((e) => vis(e) && !e.querySelector('.card, .callout, .q') && (e.innerText.match(/\S+/g) || []).length >= 35).length;
  return { words, firstScreenWords: first, paragraphs: paras, textFields: fields, buttons, longTextBlocks: longBlocks };
};

(async () => {
  const browser = await chromium.launch(); const out = { label, mode: mode || 'legacy', chapters: {} };
  for (const path of ['A', 'B']) {
    for (let n = 1; n <= 10; n++) {
      if (n === 1 && path === 'B') continue;
      const row = {};
      for (const [vw, vh, key] of [[1280, 800, 'desktop'], [390, 800, 'phone']]) {
        const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
        await p.goto(URL); await p.evaluate(prep, [n, path, mode]);
        await p.goto(URL + '#ch' + n); await p.reload(); await p.waitForTimeout(350);
        const title = await p.locator('#chTitle').innerText().catch(() => '?');
        row[key] = Object.assign({ title }, await p.evaluate(measure)); await ctx.close();
      }
      out.chapters[path + n] = row;
    }
  }
  await browser.close();
  fs.mkdirSync('docs/conference-visual', { recursive: true });
  const file = `docs/conference-visual/${label}-${out.mode}.json`; fs.writeFileSync(file, JSON.stringify(out, null, 1));
  console.log('wrote ' + file);
  console.log('chapter | desktop words (first screen) | paragraphs | text fields | long blocks | buttons');
  for (const [k, v] of Object.entries(out.chapters)) { const d = v.desktop; console.log(`${k.padEnd(3)} ${String(d.title).slice(0, 28).padEnd(28)} ${String(d.words).padStart(4)} (${String(d.firstScreenWords).padStart(3)})  p${String(d.paragraphs).padStart(2)}  f${String(d.textFields).padStart(2)}  L${String(d.longTextBlocks).padStart(2)}  b${String(d.buttons).padStart(2)}`); }
})();
