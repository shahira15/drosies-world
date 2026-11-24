/* Chapter 6, visual adventure: the Scientific Poster Art Studio.
   The learner pins research cards onto a big live poster board. Same poster engine, same checks, same print/PDF export as before. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc, D = DC.DATA;
  const P = () => DC.state.poster, F = () => DC.state.poster.f, S = () => DC.state;
  const U = () => { const u = vx.c(6); return u; };

  /* ---------- art: a strip of the studio (paint pots, brushes, ruler, scissors) ---------- */
  A.studio = () => A.r(0, 0, 960, 140, '#fdf0d5') + A.r(0, 104, 960, 36, '#c99a60') + A.r(0, 98, 960, 10, '#8d6336') +
    [['#c4655a', 60], ['#d9b45a', 130], ['#2f7d7a', 200], ['#5b3a6b', 270], ['#20365a', 340]].map((q) => A.g('translate(' + q[1] + ' 70)', A.r(-20, 0, 40, 30, '#fffdf6', 6, 'stroke="#8d6336" stroke-width="3"') + A.r(-16, -6, 32, 14, q[0], 6))).join('') +
    A.g('translate(420 30)', A.ln(0, 0, 40, 60, '#a97a46', 7) + A.r(-6, -14, 14, 22, '#c4655a', 5) + A.ln(30, -2, 50, 58, '#a97a46', 7) + A.r(24, -16, 14, 22, '#2f7d7a', 5)) +
    A.g('translate(560 60)', A.r(0, 0, 150, 24, '#f3e9c8', 3, 'stroke="#8d6336" stroke-width="2"') + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => A.ln(10 + i * 17, 0, 10 + i * 17, i % 2 ? 8 : 13, '#6b5a2a', 2)).join('')) +
    A.g('translate(780 50)', A.c(0, 0, 12, 'none', 'stroke="#c4655a" stroke-width="6"') + A.c(30, 0, 12, 'none', 'stroke="#c4655a" stroke-width="6"') + A.ln(8, 8, 50, 52, '#8d6336', 5) + A.ln(22, 8, -20, 52, '#8d6336', 5)) +
    A.g('translate(900 40)', A.r(-26, 0, 52, 70, '#fffdf6', 4, 'stroke="#8d6336" stroke-width="3"') + A.r(-18, 8, 36, 8, '#2f7d7a', 2) + A.r(-18, 22, 14, 14, '#d9b45a', 2));

  /* ---------- the research cards ---------- */
  const ap = (k) => DC.state.abs[k].trim();
  const bsrc = (k) => DC.state.b.f[k].trim();
  const CARDS = [
    { k: 'title', name: 'Title', icon: 'badge' },
    { k: 'question', name: 'Question', icon: 'question' },
    { k: 'methods', name: 'Methods', icon: 'methods' },
    { k: 'results', name: 'Results', icon: 'data' },
    { k: 'graph', name: 'Graph', icon: 'graph' },
    { k: 'conclusions', name: 'Conclusions', icon: 'findings' },
    { k: 'limitations', name: 'Limits', icon: 'limits' },
    { k: 'background', name: 'Background', icon: 'idea', opt: true }
  ];
  const isA = () => S().path === 'A';
  function source(k) {
    if (k === 'title') return isA() ? DC.STUDY.title : bsrc('title');
    if (k === 'question') return isA() ? ap('obj') : bsrc('question') || ap('obj');
    if (k === 'background') return ap('bg') || bsrc('background');
    if (k === 'methods') return ap('methods');
    if (k === 'results') return ap('results');
    if (k === 'conclusions') return ap('conclusion');
    if (k === 'limitations') return isA() ? '- Only 10 flies per group, in one vial each\n- The same flies were used in all 5 trials\n- Only two temperatures\n- The data are simulated' : bsrc('limitations');
    return '';
  }
  const placed = (k) => (k === 'graph' ? !!figOk() : DC.words(F()[k]) >= (k === 'title' ? 1 : 3));
  const bNum = () => !!(S().b.chart.kind && S().b.chart.kind !== 'auto' && S().b.chart.kind !== 'words' && DC.bLogNumeric().length >= 2);
  const figOk = () => { const p = P(); if (!p.figPlaced) return false; if (p.fig === 'draw') return true; if (isA()) return p.fig === 'auto' && DC.aComplete(); return p.fig === 'none' || (p.fig === 'auto' && bNum()); };
  const allPlaced = () => CARDS.every((c) => c.opt || placed(c.k));

  /* ---------- the studio ---------- */
  const NOTE = { background: 'Optional. Add it in the Abstract Workshop (the Why? slot).', title: 'Pick a title in the Abstract Workshop or choose one here.', results: 'Finish the Abstract Workshop first.', methods: 'Finish the Abstract Workshop first.', conclusions: 'Finish the Abstract Workshop first.' };
  function fitPoster() { const w = DC.$('#posterLive .posterwrap'), po = w && DC.$('.poster', w); if (!po) return; po.style.zoom = ''; const avail = w.clientWidth - 20; po.style.zoom = avail < 720 ? String(Math.max(0.3, avail / 720)) : ''; }
  function paint(flash) {
    const l = DC.$('#posterLive'); if (!l) return;
    l.innerHTML = '<div class="posterwrap" tabindex="0" role="region" aria-label="Your poster, live preview">' + DC.posterHTML() + '</div>'; fitPoster();
    if (flash) { const el = DC.$('#posterLive .s-' + flash); if (el && !vx.reduced()) { el.style.transition = 'outline-color .4s'; el.style.outline = '5px solid #ffb400'; el.style.outlineOffset = '2px'; setTimeout(() => { el.style.outline = ''; }, 1400); } }
    const cl = DC.$('#v6checks'); if (cl) cl.innerHTML = checkChips();
    const tray = DC.$('#v6tray'); if (tray) tray.innerHTML = trayHTML();
  }
  function trayHTML() {
    return '<div class="vx-pack" role="group" aria-label="Research cards">' + CARDS.map((c) => { const on = placed(c.k), src = c.k === 'graph' || source(c.k); return '<button type="button" class="vx-card' + (on ? '' : ' ') + '" data-act="v6card" data-k="' + c.k + '" style="' + (on ? 'border-color:var(--vx-ok);background:#f1faf4' : '') + '">' + vx.icon(c.icon, 40) + '<span>' + esc(c.name) + '</span><small>' + (on ? '✓ on the poster' : src ? 'tap to place' : 'not ready yet') + '</small>' + (on ? '<span class="sr-only">. Press to edit or look</span>' : src ? '<span class="sr-only">. Press to place on the poster</span>' : '') + '</button>'; }).join('') + '</div>';
  }
  function checkChips() {
    const issues = DC.posterChecks().filter((x) => !x[0]).slice(0, 3);
    return issues.length ? '<ul class="check" aria-label="Things to fix">' + issues.map((x) => '<li class="todo">' + esc(x[1]) + '</li>').join('') + '</ul>' : (allPlaced() ? '<div class="vx-fb ok">The checklist found nothing to fix. Nice, readable poster!</div>' : '');
  }
  const layoutThumb = (l) => {
    const cells = { columns: [[0, 0, 4, 1, '#1d5a5a'], [0, 1, 1, 2], [1, 1, 3, 2], [0, 3, 1, 1], [1, 3, 1, 1], [2, 3, 1, 1]], story: [[0, 0, 4, 1, '#1d5a5a'], [0, 1, 2, 1], [2, 1, 2, 1], [0, 2, 4, 1], [0, 3, 2, 1], [2, 3, 2, 1]], banner: [[0, 0, 4, 1, '#d9b45a'], [0, 1, 1, 1], [1, 1, 2, 2], [3, 1, 1, 1], [0, 2, 1, 1], [3, 2, 1, 1]] }[l];
    return '<svg viewBox="0 0 80 52" aria-hidden="true" style="width:100%;max-width:96px;height:auto">' + A.r(0, 0, 80, 52, '#fff8e6', 4, 'stroke="#8d6336" stroke-width="2"') + cells.map((c) => A.r(4 + c[0] * 18, 4 + c[1] * 11.5, c[2] * 18 - 2, c[3] * 11.5 - 2, c[4] || '#c9d8cc', 2)).join('') + '</svg>';
  };
  const LAY = [['columns', 'Columns'], ['story', 'Storyboard'], ['banner', 'Banner']];
  function figChoices() {
    const p = P();
    if (isA()) {
      if (!DC.aComplete()) return '<div class="vx-fb info">Record your data in the lab first. Then pick a graph.</div>';
      const th = (v, label) => { const cfg = DC.guidedChart({ id: 'th' + v, title: '', yTitle: '', xTitle: '', h: 200, interactive: false }); if (v === 'bar') { cfg.kind = 'bar'; cfg.yMin = 0; cfg.step = 2; cfg.yMax = 10; cfg.showPoints = true; } if (v === 'line') { cfg.kind = 'line'; cfg.catLabels = [1, 2, 3, 4, 5]; } return vx.choice({ act: 'v6fig', data: { v }, pic: DC.chart(cfg), label, pressed: p.fig === 'auto' && p.figView === v && p.figPlaced }); };
      return '<div class="vx-choices" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Graph type">' + th('dot', 'Every trial') + th('bar', 'Averages (from 0)') + th('line', 'In order') + '</div>';
    }
    const ok = bNum();
    return '<div class="vx-choices" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Figure">' + vx.choice({ act: 'v6figb', data: { v: 'auto' }, pic: vx.icon('graph', 56), label: 'My graph', small: ok ? 'from my evidence' : 'needs numbers (Chapter 4)', pressed: p.fig === 'auto', cls: ok ? '' : '' }) + vx.choice({ act: 'v6figb', data: { v: 'draw' }, pic: vx.icon('poster', 56), label: 'Drawing space', small: 'fill in by hand', pressed: p.fig === 'draw' }) + vx.choice({ act: 'v6figb', data: { v: 'none' }, pic: vx.icon('abstract', 56), label: 'Words only', pressed: p.fig === 'none' }) + '</div>';
  }

  vx.chapter(6, {
    render() {
      if (!S().path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      const p = P(), done = DC.isDone(6);
      /* a poster the learner already built with the original studio keeps its graph; a fresh one starts without a graph until the card is placed */
      if (p.figPlaced === undefined) { if (p.started) p.figPlaced = true; else { p.figPlaced = false; if (p.fig === 'auto') p.fig = 'none'; } DC.save(); }
      const say = done ? ['Your poster is ready! Add colors or print it.', 'celebrate'] : allPlaced() ? ['All cards are on! Check the list and make it yours.', 'encourage'] : p.started ? ['Tap another card to pin it on the board.', 'explain'] : ['Let’s build your poster! Tap a card to place it.', 'curious'];
      return '<div class="vx-stage"><div class="vx-main"><div class="vx-scene" style="aspect-ratio:960/140"><div class="vx-art">' + vx.svg(A.studio(), 'The art studio: paint pots, brushes, a ruler and scissors').replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="xMidYMid slice"').replace('viewBox="0 0 960 600"', 'viewBox="0 0 960 140"') + '</div></div>' + vx.guide(say[1], say[0]) +
        '<div id="posterLive" style="margin-top:.6rem"></div></div><div class="vx-side"><p class="vx-title" style="font-size:1.1rem;margin:0 0 .3rem">Research cards</p><div id="v6tray">' + trayHTML() + '</div>' +
        '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Graph</p>' + figChoices() + '</div>' +
        '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Layout</p><div class="vx-choices" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Layout">' + LAY.map((l) => vx.choice({ act: 'v6lay', data: { v: l[0] }, pic: layoutThumb(l[0]), label: l[1], pressed: p.layout === l[0] })).join('') + '</div>' +
        '<p class="vx-title" style="font-size:1.05rem;margin:.6rem 0 .3rem">Colors</p><div class="row" role="group" aria-label="Poster colors">' + Object.keys(DC.POSTER_PAL).map((k) => '<button type="button" class="vx-choice' + (p.palette === k ? ' sel' : '') + '" style="min-height:3rem;width:3.4rem;padding:.2rem;border-color:' + DC.POSTER_PAL[k].a + '" data-act="v6pal" data-v="' + k + '" aria-pressed="' + (p.palette === k) + '" aria-label="' + esc(DC.POSTER_PAL[k].n) + '"><span style="display:block;width:100%;height:1.6rem;border-radius:10px;background:linear-gradient(90deg,' + DC.POSTER_PAL[k].a + ' 60%,' + DC.POSTER_PAL[k].d + ' 60%)"></span></button>').join('') + '</div>' +
        '<div class="field" style="margin-top:.6rem"><label class="lbl" for="v6sz">Text size: <output id="v6szo">' + (parseFloat(p.scale) || 1) + '</output>×</label><input type="range" id="v6sz" min="0.85" max="1.25" step="0.05" value="' + (parseFloat(p.scale) || 1) + '" data-bind="poster.scale"></div></div>' +
        '<div id="v6checks">' + '</div><div class="row"><button type="button" class="vx-btn teal" data-act="postPrint">' + vx.icon('poster', 22) + ' Print or save as PDF</button><button type="button" class="vx-btn small ghost" data-act="postFull">Full-size preview</button></div><p class="vx-note">Saving as PDF uses your browser’s print window. Choose landscape.</p>' + vx.benchBar(6) + '</div></div>';
    },
    mount() {
      paint();
      DC.onBind('poster.', (el) => { if (el.dataset.bind === 'poster.scale') { const o = DC.$('#v6szo'); if (o) o.textContent = el.value; } paint(); DC.softUpdate(); });
      window.addEventListener('resize', () => { if (DC.state.cur === 6) fitPoster(); });
    }
  });

  /* ---------- actions ---------- */
  function firstPlace() { const p = P(); if (!p.started) { p.started = true; if (!F().author && !S().anon && S().nick.trim()) F().author = S().nick.trim(); } }
  DC.acts.v6card = (b) => {
    const k = b.dataset.k;
    if (k === 'graph') { if (!figOk()) { vx.say(isA() ? 'Pick a graph type below.' : 'Pick what to show in the Graph box below.', 'curious'); return; } paint('res'); vx.say('The graph is in the Results box.', 'explain'); return; }
    const src = source(k), map = { title: 'title', question: 'q', background: 'bg', methods: 'me', results: 'res', conclusions: 'con', limitations: 'lim' };
    if (placed(k)) { v6edit(k); paint(map[k]); return; }
    if (!src) { vx.say(NOTE[k] || 'Write that part first (Abstract Workshop or Project cards).', 'thinking'); if (!NOTE[k]) { v6edit(k); } return; }
    F()[k] = src; firstPlace(); DC.save(); paint(map[k]); DC.softUpdate(); vx.say(isA() || k !== 'title' ? 'Pinned! You can tap the card again to change the words.' : 'Pinned!', 'encourage'); DC.say(CARDS.find((c) => c.k === k).name + ' placed on the poster.');
  };
  function v6edit(k) {
    const name = CARDS.find((c) => c.k === k).name;
    DC.dialog('<h2>' + esc(name) + '</h2><p class="vx-note">Short sentences read best on a poster. Start a line with "- " for a bullet list.</p><label class="sr-only" for="v6ta">' + esc(name) + '</label><textarea id="v6ta" style="min-height:8rem">' + esc(F()[k]) + '</textarea><p id="v6wc" class="vx-note"></p><div class="row"><button type="button" class="vx-btn" data-close>Done</button></div>');
    const ta = DC.$('#v6ta'), wc = DC.$('#v6wc'), upd = () => { wc.textContent = DC.words(ta.value) + ' words'; }; upd(); ta.focus();
    ta.addEventListener('input', () => { F()[k] = ta.value; firstPlace(); DC.save(); upd(); paint(); DC.softUpdate(); });
  }
  DC.acts.v6fig = (b) => { const p = P(); p.fig = 'auto'; p.figView = b.dataset.v; p.figPlaced = true; firstPlace(); DC.save(); DC.refresh('[data-act=v6fig][data-v=' + b.dataset.v + ']'); DC.softUpdate(); };
  DC.acts.v6figb = (b) => { const p = P(); p.fig = b.dataset.v; p.figPlaced = true; firstPlace(); DC.save(); DC.refresh('[data-act=v6figb][data-v=' + b.dataset.v + ']'); DC.softUpdate(); };
  DC.acts.v6lay = (b) => { P().layout = b.dataset.v; DC.save(); DC.refresh('[data-act=v6lay][data-v=' + b.dataset.v + ']'); };
  DC.acts.v6pal = (b) => { P().palette = b.dataset.v; DC.save(); DC.refresh('[data-act=v6pal][data-v=' + b.dataset.v + ']'); };
})();
