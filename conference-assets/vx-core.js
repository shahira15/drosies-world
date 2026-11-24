/* Visual adventure layer: scene framework, Drosie companion, Research Backpack, world map, Explorer/Researcher level.
   It sits ON TOP of the validated engine: same state, same completion rules, same data. */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc;
  const vx = (DC.vx = {});

  /* ?legacy=1 shows the original (text/forms) chapters everywhere. Used by regression tests and handy for teachers. */
  vx.legacy = /[?&]legacy=1/.test(location.search);
  vx.reduced = () => document.documentElement.classList.contains('nomotion') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* new place names for the adventure (the original worksheet-style titles stay in ?legacy=1 mode) */
  const TITLES = ['The Magical Conference Invitation', 'The Research Pathways', 'The Virtual Fruit Fly Laboratory', 'Data Detective Headquarters', 'The Abstract Story Workshop', 'The Scientific Poster Art Studio', 'Conference Registration Lobby', 'The Living Conference Hall', 'The Presentation Theater', 'The Conference Celebration'];
  const SHORTS = ['Invitation', 'Pathways', 'Fly Lab', 'Detective HQ', 'Story Workshop', 'Poster Studio', 'Lobby', 'Conference Hall', 'Theater', 'Celebration'];
  if (!vx.legacy) DC.CHAPTERS.forEach((c, i) => { c.title = TITLES[i]; c.short = SHORTS[i]; });

  /* ---------- UI-only state (never scientific data) ---------- */
  vx.ui = () => { const u = (DC.state.ui = DC.state.ui || {}); u.level = u.level || 'explorer'; u.seen = u.seen || {}; u.bench = u.bench || {}; u.c = u.c || {}; return u; };
  vx.level = () => (vx.legacy ? 'researcher' : vx.ui().level);
  vx.researcher = () => vx.level() === 'researcher';
  vx.c = (n) => (vx.ui().c[n] = vx.ui().c[n] || {});
  const path = () => DC.state.path;

  /* ---------- original icon set (24x24, drawn here) ---------- */
  const S = '#1d5a5a';
  vx.ICONS = {
    question: '<circle cx="12" cy="12" r="10" fill="#fff3c4" stroke="' + S + '" stroke-width="2"/><path d="M9 9.6a3 3 0 1 1 4.6 2.5c-1 .6-1.6 1.1-1.6 2.4" fill="none" stroke="' + S + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.9" r="1.3" fill="' + S + '"/>',
    idea: '<path d="M12 2.5a6.5 6.5 0 0 0-3.6 11.9c.7.5 1 1.1 1 1.8v.6h5.2v-.6c0-.7.3-1.3 1-1.8A6.5 6.5 0 0 0 12 2.5z" fill="#ffe9a0" stroke="' + S + '" stroke-width="1.8"/><path d="M9.6 19.2h4.8M10.4 21.5h3.2" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/>',
    methods: '<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" fill="#d7efe9" stroke="' + S + '" stroke-width="1.9" stroke-linejoin="round"/><path d="M7.5 15.5h9" stroke="' + S + '" stroke-width="1.6"/>',
    data: '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="#fff" stroke="' + S + '" stroke-width="1.9"/><path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" stroke="' + S + '" stroke-width="1.4"/>',
    graph: '<path d="M3.5 3.5v17h17" fill="none" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/><rect x="7" y="11" width="3.4" height="9" fill="#c4655a"/><rect x="12.4" y="6.5" width="3.4" height="13.5" fill="#2f7d7a"/><rect x="17.4" y="13" width="3" height="7" fill="#d9b45a"/>',
    findings: '<circle cx="10" cy="10" r="6.5" fill="#e8f3ef" stroke="' + S + '" stroke-width="2"/><path d="M15 15l6 6" stroke="' + S + '" stroke-width="2.6" stroke-linecap="round"/><path d="M7.5 10.5l2 2 3.5-4" fill="none" stroke="#2d7a52" stroke-width="2" stroke-linecap="round"/>',
    limits: '<path d="M12 3L22 20H2L12 3z" fill="#ffe9a0" stroke="' + S + '" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 9.5v5" stroke="' + S + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.2" fill="' + S + '"/>',
    abstract: '<path d="M6 3h10l3 3v15H6z" fill="#fff" stroke="' + S + '" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 9h7M9 12.5h7M9 16h4.5" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    poster: '<rect x="3" y="3.5" width="18" height="14" rx="1.5" fill="#fff" stroke="' + S + '" stroke-width="1.9"/><rect x="5.5" y="6" width="13" height="2.6" fill="#2f7d7a"/><rect x="5.5" y="10.5" width="5" height="4.5" fill="#d9b45a"/><path d="M12.5 11h6M12.5 14h6M8 17.5v3.5M16 17.5v3.5" stroke="' + S + '" stroke-width="1.5"/>',
    badge: '<path d="M8 2h8l1 8H7z" fill="#c4655a" stroke="' + S + '" stroke-width="1.5"/><circle cx="12" cy="15" r="5.5" fill="#ffe9a0" stroke="' + S + '" stroke-width="1.9"/><path d="M12 12.3l1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3z" fill="' + S + '"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="#e6dfc4" stroke="#8a8466" stroke-width="1.9"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="#8a8466" stroke-width="2"/>',
    check: '<circle cx="12" cy="12" r="10" fill="#2d7a52"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    map: '<path d="M3 6l6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18 3 20.5z" fill="#e8f3e8" stroke="' + S + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 3.5V18M15 6v14.5" stroke="' + S + '" stroke-width="1.4"/><circle cx="12" cy="11" r="1.7" fill="#c4655a"/>',
    pack: '<path d="M7 7a5 5 0 0 1 10 0" fill="none" stroke="' + S + '" stroke-width="2"/><rect x="4.5" y="7" width="15" height="14" rx="4" fill="#c4655a" stroke="' + S + '" stroke-width="1.9"/><rect x="8" y="12.5" width="8" height="5" rx="1.5" fill="#ffe9a0" stroke="' + S + '" stroke-width="1.4"/>',
    thermo: '<path d="M10 4a2 2 0 0 1 4 0v9.2a4.4 4.4 0 1 1-4 0z" fill="#fff" stroke="' + S + '" stroke-width="1.9"/><circle cx="12" cy="17.2" r="2.4" fill="#c4655a"/><path d="M12 7v10" stroke="#c4655a" stroke-width="2"/>',
    timer: '<circle cx="12" cy="13.5" r="8" fill="#fff" stroke="' + S + '" stroke-width="2"/><path d="M12 8.5v5.5l3.2 2M9.5 2.5h5M12 2.5v3" stroke="' + S + '" stroke-width="2" stroke-linecap="round" fill="none"/>',
    ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5" fill="#f3e9c8" stroke="' + S + '" stroke-width="1.8"/><path d="M6 8v3M9.5 8v4.5M13 8v3M16.5 8v4.5" stroke="' + S + '" stroke-width="1.6"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2" fill="#fff" stroke="' + S + '" stroke-width="1.9"/><rect x="8.5" y="2.3" width="7" height="3.6" rx="1.4" fill="#d9b45a" stroke="' + S + '" stroke-width="1.5"/><path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4" stroke="' + S + '" stroke-width="1.6" stroke-linecap="round"/>',
    vial: '<path d="M8.5 3h7M9 3v15a3 3 0 0 0 6 0V3" fill="#e4f3f1" stroke="' + S + '" stroke-width="1.9"/><path d="M9 9h6" stroke="#c4655a" stroke-width="1.8" stroke-dasharray="2 1.5"/><circle cx="11" cy="14" r="1" fill="#6b4a2a"/><circle cx="13.3" cy="6.5" r="1" fill="#6b4a2a"/>',
    book: '<path d="M3 5.5c3-1.3 6-1.3 9 0v14c-3-1.3-6-1.3-9 0zM12 5.5c3-1.3 6-1.3 9 0v14c-3-1.3-6-1.3-9 0z" fill="#fff" stroke="' + S + '" stroke-width="1.8" stroke-linejoin="round"/>',
    door: '<rect x="5" y="2.5" width="14" height="19" rx="2" fill="#f0d9a8" stroke="' + S + '" stroke-width="1.9"/><circle cx="15.5" cy="12.5" r="1.3" fill="' + S + '"/>',
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#ffd36b" stroke="#9a6a1d" stroke-width="1.5" stroke-linejoin="round"/>',
    heart: '<path d="M12 20.5S3 14.8 3 8.8A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 9 1.8c0 6-9 11.7-9 11.7z" fill="#e8786a" stroke="#9a3f35" stroke-width="1.6"/>',
    dots: '<circle cx="5.5" cy="12" r="2.2" fill="' + S + '"/><circle cx="12" cy="12" r="2.2" fill="' + S + '"/><circle cx="18.5" cy="12" r="2.2" fill="' + S + '"/>',
    bang: '<path d="M12 3.5v11" stroke="' + S + '" stroke-width="3.4" stroke-linecap="round"/><circle cx="12" cy="19.5" r="2" fill="' + S + '"/>',
    wave: '<path d="M4 9c2-3 4-3 6 0s4 3 6 0 3-2.5 4-1.5M4 15c2-3 4-3 6 0s4 3 6 0 3-2.5 4-1.5" fill="none" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3" fill="#d7efe9" stroke="' + S + '" stroke-width="1.9" stroke-linejoin="round"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/><path d="M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z" fill="#ffe9a0" stroke="' + S + '" stroke-width="1.6" stroke-linejoin="round"/>'
  };
  vx.icon = (name, size) => '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" aria-hidden="true" focusable="false">' + (vx.ICONS[name] || '') + '</svg>';

  /* ---------- Drosie, the recurring companion (mascot artwork + expressive states) ---------- */
  const GLYPH = { welcome: 'wave', curious: 'question', thinking: 'dots', encourage: 'heart', celebrate: 'star', surprised: 'bang', explain: 'idea' };
  const STATE_LABEL = { welcome: 'waving hello', curious: 'curious', thinking: 'thinking', encourage: 'encouraging', celebrate: 'celebrating', surprised: 'surprised', explain: 'explaining' };
  vx.guide = (state, text, small) => {
    state = GLYPH[state] ? state : 'welcome';
    return '<div class="vx-guide"><div class="vx-drosie" data-state="' + state + '"><img src="images/drosie-mascot-640.webp" alt="Drosie the fruit fly, ' + STATE_LABEL[state] + '" width="104" height="104"><span class="vx-glyph" aria-hidden="true">' + vx.icon(GLYPH[state], 22) + '</span></div>' +
      '<div class="vx-bubble" id="vxSay" role="status" aria-live="polite"><span id="vxSayText">' + esc(text) + '</span>' + (small ? '<small id="vxSaySmall">' + esc(small) + '</small>' : '') + '</div></div>';
  };
  /* change what Drosie says (also announced to screen readers through the live region) */
  vx.say = (text, state, small) => {
    const b = DC.$('#vxSayText'); if (!b) return;
    b.textContent = text; const sm = DC.$('#vxSaySmall'); if (sm) sm.textContent = small || '';
    const d = DC.$('.vx-drosie'); if (d && state && GLYPH[state]) { d.dataset.state = state; d.querySelector('.vx-glyph').innerHTML = vx.icon(GLYPH[state], 22); const im = d.querySelector('img'); im.alt = 'Drosie the fruit fly, ' + STATE_LABEL[state]; if (!vx.reduced()) { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; } }
  };

  /* ---------- scene building blocks ---------- */
  vx.svg = (inner, label, desc) => '<svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label) + '" preserveAspectRatio="xMidYMid slice">' + (desc ? '<desc>' + esc(desc) + '</desc>' : '') + inner + '</svg>';
  /* hot: {x,y (percent), label, act, data:{..}, w,h (px min), done, pulse, id} */
  vx.hot = (h) => '<button type="button" class="vx-hot' + (h.done ? ' done' : '') + (h.pulse ? ' pulse' : '') + '" style="left:' + h.x + '%;top:' + h.y + '%;' + (h.w ? 'width:' + h.w + 'px;height:' + (h.h || h.w) + 'px;' : 'width:64px;height:64px;') + '" data-act="' + h.act + '"' + Object.keys(h.data || {}).map((k) => ' data-' + k + '="' + esc(h.data[k]) + '"').join('') + (h.id ? ' id="' + h.id + '"' : '') + ' aria-label="' + esc(h.label) + (h.done ? ', done' : '') + '"><span class="vx-tip" aria-hidden="true">' + esc(h.label) + '</span></button>';
  vx.scene = (o) => '<div class="vx-scene ' + (o.cls || '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '><div class="vx-art">' + o.art + '</div>' + (o.hot || []).map(vx.hot).join('') + (o.over || '') + '</div>';
  /* tray of big icon tools: [{icon, label, act, data, done, on, disabled}] */
  vx.tray = (items) => '<div class="vx-tray" role="group" aria-label="Things to do here">' + items.map((t) => '<button type="button" class="vx-tool' + (t.done ? ' done' : '') + (t.on ? ' on' : '') + '" data-act="' + t.act + '"' + Object.keys(t.data || {}).map((k) => ' data-' + k + '="' + esc(t.data[k]) + '"').join('') + (t.disabled ? ' disabled' : '') + (t.on ? ' aria-pressed="true"' : '') + (t.id ? ' id="' + t.id + '"' : '') + '>' + (t.svg || vx.icon(t.icon, 38)) + '<span>' + esc(t.label) + '</span>' + (t.done ? '<span class="sr-only">(done)</span>' : '') + '</button>').join('') + '</div>';
  vx.steps = (labels, cur, doneUpTo, act) => '<div class="vx-steps" role="group" aria-label="Steps">' + labels.map((l, i) => '<button type="button" class="vx-step' + (i < doneUpTo ? ' done' : '') + '" data-act="' + act + '" data-i="' + i + '"' + (i === cur ? ' aria-current="step"' : '') + (i > doneUpTo ? ' disabled' : '') + ' aria-label="Step ' + (i + 1) + ': ' + esc(l) + (i < doneUpTo ? ', done' : '') + '">' + (i < doneUpTo ? '✓' : i + 1) + '</button>').join('') + '</div>';
  /* picture choice card: {act, data, pic (svg/html), label, small, cls, pressed, id} */
  vx.choice = (c) => '<button type="button" class="vx-choice ' + (c.cls || '') + '" data-act="' + c.act + '"' + Object.keys(c.data || {}).map((k) => ' data-' + k + '="' + esc(c.data[k]) + '"').join('') + (c.pressed != null ? ' aria-pressed="' + !!c.pressed + '"' : '') + (c.id ? ' id="' + c.id + '"' : '') + '><span class="pic" aria-hidden="true">' + (c.pic || '') + '</span><span>' + esc(c.label) + '</span>' + (c.small ? '<small>' + esc(c.small) + '</small>' : '') + '</button>';
  /* picture quiz: options [{label, small, pic, ok, fb}] -> sets DC.state.det[id] = {sel, ok, tries} (same shape as the original chapters) */
  vx.reg = {};
  vx.shuffle = (arr, seed) => { const a = arr.slice(), r = DC.rng('vx-' + seed); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  vx.quiz = (id, opts, o) => {
    o = o || {}; vx.reg[id] = opts; const st = DC.state.det[id] || {};
    return '<div class="vx-choices" role="group" aria-label="' + esc(o.q || 'Choose one') + '"' + (o.cols ? ' style="grid-template-columns:repeat(' + o.cols + ',minmax(0,1fr))"' : '') + '>' + opts.map((c, i) => vx.choice({ act: 'vxQuiz', data: { id, i }, pic: c.pic, label: c.label, small: c.small, cls: st.sel === i ? (c.ok ? 'ok' : 'bad') : '' })).join('') + '</div>' +
      (st.sel != null && opts[st.sel] ? '<div class="vx-fb ' + (opts[st.sel].ok ? 'ok' : 'no') + '" role="status"><strong>' + (opts[st.sel].ok ? 'Yes! ' : 'Not quite. ') + '</strong>' + esc(opts[st.sel].fb || '') + '</div>' : '');
  };
  DC.acts.vxQuiz = (b) => { const id = b.dataset.id, i = +b.dataset.i, o = vx.reg[id] && vx.reg[id][i]; if (!o) return; const p = DC.state.det[id] || {}; DC.state.det[id] = { sel: i, ok: !!o.ok || !!p.ok, tries: (p.tries || 0) + 1 }; DC.save(); DC.refresh('[data-act=vxQuiz][data-id="' + id + '"][data-i="' + i + '"]'); DC.softUpdate(); DC.say((o.ok ? 'Yes! ' : 'Not quite. ') + (o.fb || '')); };
  vx.learn = (summary, html) => '<details class="vx-learn"><summary>' + esc(summary) + '</summary><div class="vx-note">' + html + '</div></details>';

  /* ---------- chapter wrapper: new visual render, original chapter kept as the Researcher workbench ---------- */
  vx.benchOn = (n) => vx.legacy || (vx.researcher() && !!vx.ui().bench[n]);
  vx.benchBar = (n) => (vx.researcher() && !vx.legacy ? '<div class="vx-bench"><span>Researcher level: full forms, tables and numbers are in the workbench.</span><button type="button" class="vx-btn small teal" data-act="vxBench" data-n="' + n + '">Open the workbench</button></div>' : '');
  vx.chapter = (n, def) => {
    const legacy = DC.chap[n];
    DC.chap[n] = {
      legacy, complete: legacy.complete, gate: def.gate || legacy.gate,
      render() { if (vx.benchOn(n)) return (vx.legacy ? '' : '<div class="vx-bench"><span>Researcher workbench</span><button type="button" class="vx-btn small ghost" data-act="vxBench" data-n="' + n + '">Back to the scene</button></div>') + legacy.render(); return '<div class="vx">' + def.render(legacy) + '</div>'; },
      mount(root) { if (vx.benchOn(n)) { if (legacy.mount) legacy.mount(root); return; } if (def.mount) def.mount(root, legacy); }
    };
  };
  DC.acts.vxBench = (b) => { const u = vx.ui(); u.bench[b.dataset.n] = !u.bench[b.dataset.n]; DC.save(); DC.refresh(); };

  /* ---------- Explorer / Researcher level ---------- */
  vx.paintLevel = () => { DC.$$('#vxLevel button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lv === vx.level()))); };
  vx.setLevel = (lv) => { vx.ui().level = lv; DC.save(); vx.paintLevel(); DC.refresh(); DC.say(lv === 'researcher' ? 'Researcher level: full tools are available.' : 'Explorer level: pictures and short steps.'); };

  /* ---------- Research Backpack: cards that stand for work the learner actually did ---------- */
  const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  const bMethods = () => { const b = DC.state.b; return DC.bFilled('methods') || b.skip.methods || b.steps.some((s) => s.trim()); };
  vx.cards = () => {
    const S_ = DC.state, A = S_.path === 'A', B = S_.path === 'B', st = DC.aStats();
    const setupOk = ['temp:changed', 'count:measured', 'vial:same', 'nflies:same', 'tod:same', 'taps:same'].every((p) => S_.a.setup[p.split(':')[0]] === p.split(':')[1]);
    return [
      { id: 'question', label: 'Question', icon: 'question', ch: 2, earned: () => (A && !!S_.a.acked) || (B && DC.bFilled('question')), text: () => (A ? 'Do fewer flies climb in the cooler room?' : S_.b.f.question) },
      { id: 'idea', label: B ? 'Idea' : 'Prediction', icon: 'idea', ch: 2, earned: () => (A && !!S_.a.acked) || (B && DC.bFilled('question') && (DC.bFilled('hypothesis') || S_.b.type !== 'experiment' || !!S_.b.skip.hypothesis)), text: () => (A ? 'Cooler air: fewer flies above the line.' : S_.b.type !== 'experiment' ? 'Observation project: no hypothesis needed.' : S_.b.f.hypothesis) },
      { id: 'methods', label: 'Methods', icon: 'methods', ch: 3, earned: () => (A && setupOk) || (B && bMethods()), text: () => (A ? '10 flies · 5 trials · 8 cm line · 10 s' : S_.b.f.methods || S_.b.steps.filter((x) => x.trim()).join('; ')) },
      { id: 'data', label: 'Data', icon: 'data', ch: 3, earned: () => (A && DC.aComplete()) || (B && (DC.bLogNumeric().length > 0 || DC.bFilled('data'))), text: () => (A ? '25 °C: ' + DC.state.a.rec.control.join(' ') + ' · 18 °C: ' + DC.state.a.rec.cool.join(' ') : DC.bLogNumeric().map((r) => r.label + ' ' + r.value).join(', ') || S_.b.f.data) },
      { id: 'graph', label: 'Graph', icon: 'graph', ch: 4, earned: () => (A && DC.aComplete() && !!(S_.det.d_range && S_.det.d_range.ok)) || (B && S_.b.chart.kind && S_.b.chart.kind !== 'auto'), text: () => (A ? 'Means: ' + DC.fmt(st.control.mean, 1) + ' and ' + DC.fmt(st.cool.mean, 1) + ' flies' : 'My chart: ' + S_.b.chart.kind) },
      { id: 'findings', label: 'Findings', icon: 'findings', ch: 5, earned: () => DC.words(S_.abs.results) >= 6, text: () => S_.abs.results },
      { id: 'limits', label: 'Limits', icon: 'limits', ch: 4, earned: () => (A && !!(S_.det.limits && S_.det.limits.ok)) || (B && (DC.bFilled('limitations') || !!S_.b.skip.limitations)), text: () => (A ? 'Small groups, one vial each, same flies, simulated.' : S_.b.f.limitations || 'Skipped for now') },
      { id: 'abstract', label: 'Abstract', icon: 'abstract', ch: 5, earned: () => DC.absComplete(), text: () => DC.absTitle() },
      { id: 'poster', label: 'Poster', icon: 'poster', ch: 6, earned: () => DC.posterComplete(), text: () => S_.poster.f.title || 'My poster' },
      { id: 'badge', label: 'Badge', icon: 'badge', ch: 7, earned: () => !!S_.checked, text: () => DC.name() + ' · Board #' + DC.assignment().board }
    ];
  };
  vx.packHTML = (sel) => {
    const cards = vx.cards(), got = cards.filter((c) => c.earned()).length;
    let h = '<h2 style="margin:0 0 .3rem">Research Backpack <span class="vx-count" aria-label="' + got + ' of ' + cards.length + ' cards">' + got + '/' + cards.length + '</span></h2><p class="vx-note">Every card is real work you did. Tap one to look at it.</p><div class="vx-pack">';
    cards.forEach((c) => { const e = c.earned(); h += e ? '<button type="button" class="vx-card" data-act="vxCard" data-id="' + c.id + '">' + vx.icon(c.icon, 44) + '<span>' + esc(c.label) + '</span><small>' + esc(cut(c.text(), 46)) + '</small></button>' : '<div class="vx-card locked" role="img" aria-label="' + esc(c.label) + ', not collected yet. Finish chapter ' + c.ch + '.">' + vx.icon('lock', 44) + '<span>' + esc(c.label) + '</span><small>Chapter ' + c.ch + '</small></div>'; });
    h += '</div>';
    if (sel) { const c = cards.find((x) => x.id === sel); h += '<div class="vx-panel gold" id="vxCardDetail" tabindex="-1"><div class="spread"><strong>' + vx.icon(c.icon, 28) + ' ' + esc(c.label) + '</strong><button type="button" class="vx-btn small ghost" data-act="go" data-n="' + c.ch + '" data-close>Open chapter ' + c.ch + '</button></div><p style="margin:.4rem 0 0;font-weight:700;overflow-wrap:anywhere">' + esc(cut(c.text(), 400)) + '</p></div>'; }
    return h + '<div class="row" style="margin-top:.8rem"><button type="button" class="vx-btn small" data-close>Close</button></div>';
  };
  DC.acts.vxPack = () => DC.dialog(vx.packHTML());
  DC.acts.vxCard = (b) => { DC.$('#dlg').innerHTML = vx.packHTML(b.dataset.id); const d = DC.$('#vxCardDetail'); if (d) d.focus(); };
  vx.paintPack = () => { const n = vx.cards().filter((c) => c.earned()).length; const el = DC.$('#btnPack'); if (el) { el.innerHTML = vx.icon('pack', 20) + ' Backpack <span class="vx-count" aria-hidden="true">' + n + '</span><span class="sr-only"> ' + n + ' of 10 cards</span>'; } };
  vx.checkCards = () => {
    const u = vx.ui(), pk = path() || '-', cards = vx.cards(), fresh = [];
    if (!u.packInit) { cards.forEach((c) => { if (c.earned()) u.seen[pk + ':' + c.id] = 1; }); u.packInit = 1; DC.save(); }
    cards.forEach((c) => { const k = pk + ':' + c.id; if (c.earned() && !u.seen[k]) { u.seen[k] = 1; fresh.push(c); } });
    vx.paintPack();
    if (fresh.length) { DC.save(); fresh.forEach((c, i) => setTimeout(() => vx.flyCard(c), i * 350)); DC.say('New research card: ' + fresh.map((c) => c.label).join(', ') + '. It is in your backpack.'); }
  };
  vx.flyCard = (c) => {
    const btn = DC.$('#btnPack'); if (!btn || vx.reduced()) { vx.toast('New card: ' + c.label); return; }
    const el = document.createElement('div'); el.className = 'vx-fly'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<div class="vx-card" style="min-height:0;padding:.3rem">' + vx.icon(c.icon, 40) + '</div>';
    el.style.left = Math.round(innerWidth / 2 - 32) + 'px'; el.style.top = Math.round(innerHeight / 2 - 32) + 'px'; document.body.appendChild(el);
    const r = btn.getBoundingClientRect(); requestAnimationFrame(() => { el.style.transform = 'translate(' + (r.left + r.width / 2 - innerWidth / 2) + 'px,' + (r.top + r.height / 2 - innerHeight / 2) + 'px) scale(.35)'; el.style.opacity = '.2'; });
    setTimeout(() => { el.remove(); btn.classList.add('bump'); setTimeout(() => btn.classList.remove('bump'), 600); vx.toast('New card: ' + c.label); }, 900);
  };
  vx.toast = (m) => { const t = document.createElement('div'); t.className = 'vx-toast'; t.setAttribute('aria-hidden', 'true'); t.textContent = m; t.style.bottom = (4.5 + document.querySelectorAll('.vx-toast').length * 3.2) + 'rem'; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };

  /* ---------- world map ---------- */
  vx.PLACES = { 1: 'Invitation Garden', 2: 'Research Doors', 3: 'Fly Laboratory', 4: 'Detective HQ', 5: 'Story Workshop', 6: 'Poster Studio', 7: 'Registration Lobby', 8: 'Conference Hall', 9: 'Presentation Theater', 10: 'Celebration Garden' };
  const NODES = [[1, 12, 78], [2, 24, 58], [3, 22, 30], [4, 40, 18], [5, 56, 28], [6, 72, 20], [7, 84, 40], [8, 66, 52], [9, 48, 66], [10, 82, 80]];
  vx.mapHTML = () => {
    const first = DC.firstOpen(), cur = DC.state.cur;
    const nodes = NODES.map(([n, x, y]) => { const c = DC.CHAPTERS[n - 1], done = DC.isDone(n), open = DC.canOpen(n); const st = done ? 'done' : open ? (n === cur ? 'cur' : '') : 'lock'; const place = (vx.PLACES && vx.PLACES[n]) || c.short;
      return '<button type="button" class="vx-node ' + st + '" style="left:' + x + '%;top:' + y + '%" data-act="vxGoto" data-n="' + n + '"' + (open ? '' : ' aria-disabled="true"') + (n === cur ? ' aria-current="location"' : '') + ' aria-label="Place ' + n + ': ' + esc(place) + (done ? ', done' : open ? (n === first ? ', next up' : ', open') : ', locked until earlier places are done') + '"><span class="dot" aria-hidden="true">' + (done ? '✓' : open ? n : '🔒') + '</span><span class="nm" aria-hidden="true">' + esc(place) + '</span></button>'; }).join('');
    const list = '<ul class="vx-maplist" aria-label="Places, as a list">' + DC.CHAPTERS.map((c) => { const done = DC.isDone(c.n), open = DC.canOpen(c.n); return '<li><button type="button" class="vx-btn small ' + (done ? 'teal' : 'ghost') + '" data-act="vxGoto" data-n="' + c.n + '"' + (open ? '' : ' aria-disabled="true"') + '>' + (done ? '✓ ' : open ? '' : '🔒 ') + c.n + '. ' + esc((vx.PLACES && vx.PLACES[c.n]) || c.short) + '</button></li>'; }).join('') + '</ul>';
    return '<div class="spread"><h2 style="margin:0">Conference campus</h2><button type="button" class="vx-btn small" data-close>Close</button></div><div class="vx-map" role="group" aria-label="Map of the campus">' + (DC.art ? DC.art.map() : '') + nodes + '</div>' + list;
  };
  DC.acts.vxMap = () => { DC.$('#dlg').classList.add('vx-dlg-wide'); DC.dialog(vx.mapHTML(), () => DC.$('#dlg').classList.remove('vx-dlg-wide')); };
  DC.acts.vxGoto = (b) => { const n = +b.dataset.n; if (!DC.canOpen(n)) { vx.toast('Finish the earlier places first'); DC.say('That place is locked. Finish the earlier places first.'); return; } const d = DC.$('#dlg'); if (d.open) d.close(); DC.go(n); };

  /* ---------- footer with a map button ---------- */
  DC.navFoot = (n) => {
    const next = n < 10 ? DC.canOpen(n + 1) : false;
    const gate = n < 10 && !next ? '<span class="gate" id="gateMsg">' + (DC.chap[n] && DC.chap[n].gate ? esc(DC.chap[n].gate()) : 'Finish this place to continue.') + '</span>' : '';
    return '<div class="nav-foot vx-foot"><span class="row"><button type="button" class="vx-btn small ghost" data-act="vxMap">' + vx.icon('map', 20) + ' Map</button>' + (n > 1 ? '<button type="button" class="btn vx-btn small ghost" data-act="go" data-n="' + (n - 1) + '">← Back</button>' : '') + '</span>' +
      '<span class="row">' + gate + (n < 10 ? '<button type="button" class="btn primary vx-btn' + (next ? '' : ' ') + '" data-act="go" data-n="' + (n + 1) + '"' + (next ? '' : ' aria-describedby="gateMsg" aria-disabled="true"') + '>Next place →</button>' : '') + '</span></div>';
  };

  /* ---------- hooks: run after every view / soft update ---------- */
  const baseView = DC.view, baseSoft = DC.softUpdate;
  DC.view = function (o) { baseView.call(DC, o); document.body.dataset.vxChapter = String(DC.state.cur); vx.checkCards(); };
  DC.softUpdate = function () { baseSoft.call(DC); vx.checkCards(); };

  /* elements that are not <button>s but carry role="button" + data-act (SVG flies, hot zones) must work with Enter and Space */
  document.addEventListener('keydown', (e) => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && t.hasAttribute('data-act') && t.tagName.toLowerCase() !== 'button') { e.preventDefault(); const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); t.dispatchEvent(ev); } });

  /* ---------- header wiring ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.app !== 'conference') return;
    const lv = DC.$('#vxLevel'); if (lv) lv.addEventListener('click', (e) => { const b = e.target.closest('[data-lv]'); if (b) vx.setLevel(b.dataset.lv); });
    const m = DC.$('#btnMap'); if (m) m.addEventListener('click', DC.acts.vxMap);
    const p = DC.$('#btnPack'); if (p) p.addEventListener('click', DC.acts.vxPack);
    vx.paintLevel(); vx.checkCards();
  });
})();
