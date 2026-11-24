/* Chapter 8, visual adventure: the Living Conference Hall. Six illustrated areas; same area ids, same saved answers, same completion rule as the original hall
   (visit all six areas + answer at least three scientists' questions well). All scientists, posters and the talk are fictional and have not verified anyone's work. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc;
  const U = () => { const u = vx.c(8); if (u.area == null) u.area = ''; return u; };
  const H = () => DC.state.hall;
  const visited = () => DC.AREAS.filter((a) => H().visited[a.id]).length;
  const best = () => Object.values(H().sci).filter((x) => x && x.best).length;
  const SC = () => DC.SCIENTISTS;

  /* ---------- art: the hall overview and six environments ---------- */
  const ZONES = { reg: [14, 70], booth: [14, 33], posters: [40, 40], stage: [70, 44], talk: [86, 80], reflect: [48, 86] };
  A.hallOverview = (vis) => A.wall('#f6efd9', 440, '#e3d0a5') + A.bunting(14) + [250, 365, 480].map((x) => A.window(x, 40, 70, 60)).join('') +
    A.g('translate(30 120)', A.r(0, 0, 150, 100, '#fff', 4, 'stroke="#8d6336" stroke-width="4"') + A.r(-6, -30, 162, 30, '#c4655a', 4) + [0, 1, 2].map((i) => A.r(10 + i * 46, -30, 22, 30, '#fff')).join('') + A.tx(75, 62, 24, 'Info booth', A.C.teal)) +
    A.g('translate(30 380)', A.r(0, 0, 150, 56, '#8d6336', 6) + A.r(0, -8, 150, 14, '#b4834a', 4) + A.tx(75, 38, 18, 'Registration', '#fff')) +
    [215, 345].map((x, i) => A.posterMini(x, 120, 110, 126, i ? A.C.plum : A.C.teal)).join('') +
    A.r(520, 160, 190, 86, '#a97a46', 4, 'stroke="#8d6336" stroke-width="4"') + A.r(540, 100, 150, 62, '#fff', 4, 'stroke="#555" stroke-width="3"') + A.p('M552 148 l24 -22 18 12 24 -24 30 28', 'none', 'stroke="#1d5a5a" stroke-width="4"') +
    '<ellipse cx="830" cy="455" rx="70" ry="30" fill="#a97a46" stroke="#8d6336" stroke-width="4"/>' + [[760, 455], [900, 455], [830, 500]].map((q) => A.c(q[0], q[1], 14, A.C.teal2)).join('') +
    A.rug(460, 520, 110, 32, '#9fcf9b') + A.r(405, 492, 110, 14, A.C.wood2, 5) + A.plant(340, 500, 0.8) + A.plant(580, 500, 0.8) +
    DC.AREAS.map((a) => { const q = ZONES[a.id]; return vis[a.id] ? A.g('translate(' + q[0] * 9.6 + ' ' + q[1] * 6 + ')', A.c(0, -50, 17, '#2d7a52', 'stroke="#fff" stroke-width="3"') + A.p('M-8 -50 l6 7 11 -13', 'none', 'stroke="#fff" stroke-width="3.5" stroke-linecap="round"')) : ''; }).join('');
  A.areaReg = () => A.lobby(true, DC.assignment().board);
  A.areaPosters = () => A.wall('#f6efd9', 450, '#e3d0a5') + A.bunting(14) + DC.EXAMPLE_POSTERS.map((p, i) => A.posterMini(120 + i * 220, 120, 170, 210, [A.C.teal, A.C.coral, A.C.plum][i])).join('') + A.r(820, 110, 150, 230, '#d9b45a', 10) + A.r(830, 120, 130, 210, '#fffdf6', 6) + A.tx(895, 235, 22, 'My poster', A.C.ink) + A.rug(480, 530, 260, 34, '#e8d3a2') + A.plant(60, 470, 1);
  A.areaStage = () => A.wall('#e9e0f2', 450, '#cdb78a') + A.bunting(14) + A.r(140, 340, 680, 60, '#a97a46', 8, 'stroke="#8d6336" stroke-width="4"') + A.r(260, 70, 440, 250, '#fff', 8, 'stroke="#555" stroke-width="6"') + '<g id="stageBars"></g>' + A.r(260, 340, 20, 60, '#8d6336') +
    A.g('translate(150 330)', A.person(0, 0, SC()[0].look, 1.7)) + A.g('translate(820 400)', A.r(-26, -70, 52, 70, '#8d6336', 6) + A.r(-34, -76, 68, 12, '#b4834a', 4)) +
    [0, 1, 2, 3, 4].map((i) => A.c(150 + i * 165, 560, 30, ['#c68a5e', '#7a4b34', '#e8c39e', '#a56b46', '#f0d0b0'][i]) + A.r(120 + i * 165, 572, 60, 40, ['#2f7d7a', '#c4655a', '#5b3a6b', '#d9b45a', '#20365a'][i], 14)).join('');
  A.areaTalk = (sel, done) => A.wall('#f3ead2', 450, '#d9bd88') + A.bunting(14) + A.window(80, 60, 110, 130) + A.window(770, 60, 110, 130) + '<ellipse cx="480" cy="430" rx="190" ry="70" fill="#a97a46" stroke="#8d6336" stroke-width="6"/>' + A.c(480, 430, 18, '#fff') + A.tx(480, 437, 20, '?', A.C.teal) +
    SC().map((s, i) => { const x = 150 + i * 165, y = i % 2 ? 330 : 300; return A.g('translate(' + x + ' ' + y + ')', (sel === s.id ? A.c(0, -10, 78, 'rgba(255,224,138,.5)') : '') + A.person(0, 0, s.look, 1.45) + A.r(-52, 62, 104, 28, done[s.id] ? '#e4f3e9' : '#fffdf6', 8, 'stroke="#8d6336" stroke-width="3"') + A.tx(0, 82, 15, s.name.split(' ').slice(-1)[0], A.C.ink)); }).join('') + A.plant(70, 480, 1);
  A.areaBooth = () => A.wall('#f6efd9', 450, '#e3d0a5') + A.bunting(14) + A.r(100, 140, 760, 250, '#fff', 8, 'stroke="#8d6336" stroke-width="5"') + A.r(90, 100, 780, 44, '#c4655a', 8) + Array.from({ length: 9 }, (_, i) => A.r(100 + i * 86, 100, 43, 44, '#fff', 0)).join('') +
    A.r(130, 170, 220, 150, '#fde7c4', 8, 'stroke="#c99a60" stroke-width="3"') + A.tx(240, 215, 26, 'Words', A.C.teal) + [0, 1, 2, 3, 4, 5].map((i) => A.r(150 + (i % 3) * 66, 238 + Math.floor(i / 3) * 40, 56, 30, '#fff', 4, 'stroke="#c99a60" stroke-width="2"')).join('') +
    A.g('translate(500 200)', A.r(0, 0, 70, 120, '#c4655a', 6, 'stroke="#8d3f35" stroke-width="3"') + A.r(10, 18, 50, 8, '#ffe9a0', 2) + A.r(86, 0, 70, 120, '#2f7d7a', 6, 'stroke="#1d5a5a" stroke-width="3"') + A.r(96, 18, 50, 8, '#ffe9a0', 2)) + A.g('translate(720 190)', [0, 1, 2, 3].map((i) => A.c(0, i * 34, 13, '#fff', 'stroke="#1d5a5a" stroke-width="3"') + A.tx(0, i * 34 + 6, 16, String(i + 1), A.C.teal)).join('')) +
    A.r(100, 390, 760, 40, '#a97a46', 6) + A.plant(900, 480, 1);
  A.areaReflect = () => A.sky() + A.hills() + A.tree(130, 400, 1.1) + A.tree(840, 410, 1) + A.flowers() + A.rug(480, 480, 220, 50, '#9fcf9b') + A.r(380, 440, 200, 18, A.C.wood2, 7) + A.r(396, 458, 12, 40, A.C.wood2) + A.r(552, 458, 12, 40, A.C.wood2) + A.cloud(180, 80, 1) + A.cloud(640, 60, 0.8) + A.tx(480, 380, 28, 'A quiet place to think', '#2f7d7a');

  /* ---------- panels ---------- */
  const mark = (s) => (s && s.best ? 'celebrate' : s ? 'thinking' : 'curious');
  function regPanel() { const a = DC.assignment(); return '<div class="vx-panel" style="text-align:center"><div>' + DC.badgeHTML('Board #' + a.board) + '</div><p class="vx-title" style="margin:.5rem 0 0">Your board is #' + a.board + '</p><p class="vx-note" style="margin:0">Poster Hall B · pretend schedule</p></div>' + vx.learn('The program (fictional)', '<ol style="margin:0;padding-left:1.1rem">' + DC.PROGRAM.map((r) => '<li><strong>' + esc(r[0]) + '</strong> ' + esc(r[1]) + '</li>').join('') + '</ol>'); }
  function postersPanel() {
    const u = U(), P = DC.EXAMPLE_POSTERS, sel = u.poster;
    let h = '<div class="vx-tray" role="group" aria-label="Posters">' + P.map((p, i) => '<button type="button" class="vx-tool' + (DC.state.det['hp_' + p.id] && DC.state.det['hp_' + p.id].ok ? ' done' : '') + (sel === p.id ? ' on' : '') + '" data-act="v8poster" data-id="' + p.id + '">' + vx.icon('poster', 36) + '<span>Poster ' + (i + 1) + '</span></button>').join('') + '<button type="button" class="vx-tool' + (sel === 'mine' ? ' on' : '') + '" data-act="v8poster" data-id="mine">' + vx.icon('star', 36) + '<span>My poster</span></button></div>';
    if (sel === 'mine') { h += DC.state.poster.started ? '<div class="vx-panel"><div class="posterwrap" tabindex="0" role="region" aria-label="Your poster">' + DC.posterHTML() + '</div><p class="vx-note">Look like a visitor: can you read the question from three steps away? Is every axis labelled?</p></div>' : '<div class="vx-fb info">You have not started your poster yet. <button type="button" class="vx-btn small" data-act="go" data-n="6">Open the Poster Studio</button></div>'; }
    else if (sel) { const p = P.find((x) => x.id === sel); h += '<div class="vx-panel"><span class="tag">' + esc(p.by) + '</span><p class="vx-title" style="font-size:1.15rem;margin:.3rem 0">' + esc(p.title) + '</p><p class="vx-note" style="margin:0 0 .3rem">' + esc(p.body) + '</p><p style="margin:0 0 .4rem"><em>' + esc(p.claim) + '</em></p><p class="vx-title" style="font-size:1rem">' + esc(p.prompt) + '</p>' + vx.quiz('hp_' + p.id, p.options.map((o) => ({ label: o[0], ok: o[1], fb: o[2] })), { q: p.prompt, cols: 1 }) + '</div>'; }
    else h += '<div class="vx-fb info">Tap a poster to look closely. Each one has something to fix.</div>';
    return h;
  }
  function stagePanel() {
    const T = DC.TALK_DATA, sg = DC.stats(T.sugar), sl = DC.stats(T.salt), f = (n) => DC.fmt(n, 1);
    const cfg = { kind: 'bar', groups: [{ key: 's', label: 'Sugar water', color: '#c4655a', values: T.sugar, labels: T.sugar.map((_, i) => 'cup ' + (i + 1)) }, { key: 'l', label: 'Salt water', color: '#2f7d7a', values: T.salt, labels: T.salt.map((_, i) => 'cup ' + (i + 1)) }], yMin: 0, yMax: 16, step: 4, yTitle: 'Ants at each cup', xTitle: 'Kind of cup (5 cups each)', title: '', id: 'stg', interactive: true, desc: 'Ants counted at five sugar cups and five salt cups.' };
    const q = (ok1, a, b) => [{ label: 'Supported by the data', ok: ok1, fb: ok1 ? a : b }, { label: 'Not supported', ok: !ok1, fb: ok1 ? b : a }];
    return '<div class="vx-fb info" role="note"><strong>A fictional talk.</strong> The speaker and the numbers are invented for practice.</div><div class="vx-panel"><p class="vx-title" style="font-size:1.1rem;margin:0">“Do ants visit sugar water or salt water?”</p><div class="chartbox" id="v8chart">' + DC.chart(cfg) + '</div><div class="readout" id="v8out" role="status" aria-live="polite">Tap or focus a bar to read it.</div></div>' +
      '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Is each claim supported by these data?</p><p class="vx-note" style="margin:.2rem 0">1. “More ants were counted at sugar cups (mean ' + f(sg.mean) + ') than at salt cups (' + f(sl.mean) + ').”</p>' + vx.quiz('ht_1', [{ label: 'Supported by the data', ok: true, fb: 'It describes exactly what was counted.' }, { label: 'Not supported', ok: false, fb: 'The table shows ' + sg.sum + ' ants at sugar cups and ' + sl.sum + ' at salt cups.' }], { cols: 2 }) +
      '<p class="vx-note" style="margin:.5rem 0 .2rem">2. “Ants always prefer sugar over salt.”</p>' + vx.quiz('ht_2', [{ label: 'Supported by the data', ok: false, fb: '"Always" goes far beyond one test on one patio.' }, { label: 'Not supported', ok: true, fb: 'The data are from one test. They cannot show what ants always do.' }], { cols: 2 }) +
      '<p class="vx-note" style="margin:.5rem 0 .2rem">3. “Sugar makes ants happy.”</p>' + vx.quiz('ht_3', [{ label: 'Supported by the data', ok: false, fb: 'Happiness was not measured. Only ant counts were.' }, { label: 'Not supported', ok: true, fb: 'This is an interpretation about feelings that counts cannot show.' }], { cols: 2 }) + '</div>';
  }
  function talkPanel() {
    const u = U(), sel = u.sci, done = {}; SC().forEach((s) => (done[s.id] = !!(H().sci[s.id] && H().sci[s.id].best)));
    let h = '<div class="vx-fb info" role="note">These five scientists are <strong>fictional</strong>. They have not checked or verified your work.</div><p class="vx-note" style="margin:.2rem 0">Strong answers: <strong id="v8best">' + best() + '</strong> of 5 (talk with at least 3).</p><div class="vx-tray" role="group" aria-label="Scientists">' + SC().map((s) => '<button type="button" class="vx-tool' + (done[s.id] ? ' done' : '') + (sel === s.id ? ' on' : '') + '" data-act="v8sci" data-id="' + s.id + '">' + DC.avatar(s.look, 44) + '<span>' + esc(s.name.replace('Prof. ', '').replace('Dr. ', '')) + '</span></button>').join('') + '</div>';
    if (sel) {
      const s = SC().find((x) => x.id === sel), q = DC.sciQuestion(sel), st = H().sci[sel];
      h += '<div class="vx-panel gold"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="position:relative;flex:none">' + DC.avatar(s.look, 70) + '<span class="vx-glyph" style="width:28px;height:28px;top:-6px;right:-10px" aria-hidden="true">' + vx.icon(st ? (st.best ? 'star' : 'dots') : 'question', 16) + '</span></div><div class="vx-bubble" style="margin:0" id="v8q" tabindex="-1">' + esc(q.q) + '<small>' + esc(s.name + ' · ' + s.field) + '</small></div></div>' +
        '<div class="vx-choices" style="grid-template-columns:minmax(0,1fr)" role="group" aria-label="Your answer">' + q.o.map((o, i) => '<button type="button" class="vx-choice' + (st && st.sel === i ? (o[1] === 2 ? ' ok' : o[1] === 1 ? ' sel' : ' bad') : '') + '" data-act="v8ans" data-id="' + sel + '" data-i="' + i + '" style="align-items:flex-start;text-align:left;font-weight:700;font-size:.95rem;min-height:3.2rem" aria-pressed="' + !!(st && st.sel === i) + '"><span>' + esc(o[0]) + '</span></button>').join('') + '</div>' +
        (st ? '<div class="vx-fb ' + (q.o[st.sel][1] === 2 ? 'ok' : q.o[st.sel][1] === 1 ? 'info' : 'no') + '" role="status"><strong>' + (q.o[st.sel][1] === 2 ? 'Strong answer. ' : q.o[st.sel][1] === 1 ? 'Partly there. ' : 'Not quite. ') + '</strong>' + esc(q.o[st.sel][2]) + '</div>' : '') + '<p class="vx-note">' + esc(s.name) + ' is a fictional character. The feedback is built into this activity.</p></div>';
    } else h += '<div class="vx-fb info">Tap a scientist to hear one question.</div>';
    return h;
  }
  function boothPanel() {
    const u = U(), g = DC.GLOSSARY, it = u.term != null ? g[u.term] : null;
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">How a conference works</p><div class="row" style="flex-wrap:nowrap;justify-content:space-between;text-align:center">' + [['abstract', 'Send an abstract'], ['poster', 'Make a poster'], ['question', 'Answer questions'], ['findings', 'Improve the work']].map((x) => '<div style="flex:1;min-width:0">' + vx.icon(x[0], 34) + '<div class="vx-note">' + x[1] + '</div></div>').join('') + '</div><p class="vx-note" style="margin:.4rem 0 0">Posters and talks usually have <strong>not</strong> had a journal’s peer review yet.</p></div>' +
      '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Words scientists use</p><div class="row" role="group" aria-label="Glossary">' + g.map((x, i) => '<button type="button" class="chip' + (u.term === i ? ' on' : '') + '" data-act="v8term" data-i="' + i + '" aria-pressed="' + (u.term === i) + '">' + esc(x[0]) + '</button>').join('') + '</div>' + (it ? '<div class="vx-fb info" role="status"><strong>' + esc(it[0]) + ':</strong> ' + esc(it[1]) + '</div>' : '') + '</div>' +
      '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Books to check</p><div class="row">' + DC.REFS.map((r, i) => '<button type="button" class="vx-tool' + (u.ref === i ? ' on' : '') + '" data-act="v8ref" data-i="' + i + '">' + vx.icon('book', 36) + '<span>' + esc(r.text.split(' ')[0] + ' ' + r.text.match(/\d{4}/)[0]) + '</span></button>').join('') + '</div>' + (u.ref != null ? '<div class="vx-fb info" role="status">' + esc(DC.REFS[u.ref].text) + ' <a href="https://doi.org/' + DC.REFS[u.ref].doi + '" target="_blank" rel="noopener">doi:' + DC.REFS[u.ref].doi + '</a><br><small>' + esc(DC.REFS[u.ref].note) + ' Both records were found in PubMed; the full texts were not read for this activity.</small></div>' : '') + '</div>';
  }
  const STARTS = { learned: ['I learned that scientists ', 'I learned how to ', 'A good scientist '], surprise: ['I was surprised that ', 'It was hard to ', 'I did not expect '], next: ['Next I would like to find out ', 'I wonder whether ', 'I would test '] };
  function reflectPanel() {
    return '<div class="vx-panel"><p class="vx-note" style="margin:0 0 .4rem">Find a spot on the rug. Your thoughts stay on your device. Tap a starter, then finish the sentence.</p>' + [['learned', 'What I learned', 'idea'], ['surprise', 'What surprised me', 'bang'], ['next', 'What I want to explore next', 'question']].map((x) => '<div class="field"><label class="lbl" for="rf-' + x[0] + '">' + vx.icon(x[2], 22) + ' ' + x[1] + '</label><div class="starters" role="group" aria-label="Starters for ' + x[1] + '">' + STARTS[x[0]].map((t) => '<button type="button" class="chip" data-act="v8start" data-k="' + x[0] + '" data-t="' + esc(t) + '">' + esc(t.trim()) + '…</button>').join('') + '</div><textarea id="rf-' + x[0] + '" data-bind="refl.' + x[0] + '" style="min-height:3.4rem">' + esc(DC.state.refl[x[0]]) + '</textarea></div>').join('') + '</div>';
  }
  const PANELS = { reg: regPanel, posters: postersPanel, stage: stagePanel, talk: talkPanel, booth: boothPanel, reflect: reflectPanel };
  const SAY = { reg: ['Welcome back to registration! Here is your board.', 'welcome'], posters: ['Posters! Tap one and spot what to fix.', 'curious'], stage: ['A short talk! Is each claim supported?', 'explain'], talk: ['Scientists love questions. Tap one to chat!', 'welcome'], booth: ['Need a word explained? Ask the booth!', 'explain'], reflect: ['A quiet spot. What did you learn?', 'encourage'] };

  function hallScene(a) {
    const vis = H().visited, u = U();
    const art = a === '' ? A.hallOverview(vis) : a === 'reg' ? A.areaReg() : a === 'posters' ? A.areaPosters() : a === 'stage' ? A.areaStage() : a === 'talk' ? A.areaTalk(u.sci, (function () { const d = {}; SC().forEach((s) => (d[s.id] = !!(H().sci[s.id] && H().sci[s.id].best))); return d; })()) : a === 'booth' ? A.areaBooth() : A.areaReflect();
    let hot;
    if (a === '') hot = DC.AREAS.map((x) => ({ x: ZONES[x.id][0], y: ZONES[x.id][1], label: x.name, act: 'v8area', data: { id: x.id }, w: 130, h: 90, done: !!vis[x.id], pulse: !vis[x.id] && DC.AREAS.findIndex((z) => !vis[z.id]) === DC.AREAS.indexOf(x) }));
    else if (a === 'posters') hot = DC.EXAMPLE_POSTERS.map((p, i) => ({ x: (205 + i * 220) / 9.6, y: 36, label: 'Look at poster ' + (i + 1), act: 'v8poster', data: { id: p.id }, w: 160, h: 210, done: !!(DC.state.det['hp_' + p.id] && DC.state.det['hp_' + p.id].ok) })).concat([{ x: 92.5, y: 38, label: 'Visit my poster', act: 'v8poster', data: { id: 'mine' }, w: 130, h: 220 }]);
    else if (a === 'talk') hot = SC().map((s, i) => ({ x: (150 + i * 165) / 9.6, y: (i % 2 ? 330 : 300) / 6, label: s.name, act: 'v8sci', data: { id: s.id }, w: 110, h: 170, done: !!(H().sci[s.id] && H().sci[s.id].best) }));
    else if (a === 'booth') hot = [{ x: 25, y: 42, label: 'Glossary board', act: 'v8term', data: { i: 0 }, w: 200, h: 130 }, { x: 58, y: 42, label: 'Books', act: 'v8ref', data: { i: 0 }, w: 190, h: 130 }];
    else hot = [];
    return vx.scene({ art: vx.svg(art, a === '' ? 'The conference hall with six areas' : DC.AREAS.find((x) => x.id === a).name), hot });
  }
  vx.chapter(8, {
    render() {
      if (!DC.state.path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      const u = U(), a = u.area, done = DC.isDone(8);
      const say = a ? SAY[a] : done ? ['You explored the whole hall! Time to present!', 'celebrate'] : ['Welcome to the hall! Tap a place to explore. (' + visited() + ' of 6 visited)', 'welcome'];
      const tray = vx.tray(DC.AREAS.map((x) => ({ icon: { reg: 'badge', posters: 'poster', stage: 'timer', talk: 'question', booth: 'book', reflect: 'heart' }[x.id], label: (function (s) { return s.charAt(0).toUpperCase() + s.slice(1); })(x.name.replace('Scientist ', '').replace('Research information ', 'Info ')), act: 'v8area', data: { id: x.id }, on: a === x.id, done: !!H().visited[x.id] })));
      return '<div class="vx-stage"><div class="vx-main">' + hallScene(a) + vx.guide(say[1], say[0]) + '</div><div class="vx-side">' + (a ? '<div class="row" style="margin-bottom:.4rem"><button type="button" class="vx-btn small ghost" data-act="v8hall">← Back to the hall</button></div>' : '<p class="vx-note" style="margin:0 0 .3rem">Places visited: <strong id="v8vis">' + visited() + '</strong> of 6 · scientists with a strong answer: <strong>' + best() + '</strong> of 3 needed</p>') + tray + '<div id="v8panel">' + (a ? PANELS[a]() : '') + '</div></div></div>';
    },
    mount() { if (DC.$('#v8chart')) DC.chart.attach(DC.$('#v8chart'), DC.$('#v8out')); }
  });
  DC.acts.v8area = (b) => { const id = b.dataset.id; U().area = id; H().visited[id] = true; if (id === 'talk' && !U().sci) U().sci = ''; DC.save(); DC.refresh('#v8panel'); DC.softUpdate(); DC.say('You are at the ' + DC.AREAS.find((x) => x.id === id).name); };
  DC.acts.v8hall = () => { U().area = ''; DC.save(); DC.refresh(); };
  DC.acts.v8poster = (b) => { U().poster = b.dataset.id; DC.save(); DC.refresh('#v8panel'); };
  DC.acts.v8sci = (b) => { U().sci = b.dataset.id; DC.save(); DC.refresh('#v8q'); };
  DC.acts.v8ans = (b) => { const id = b.dataset.id, i = +b.dataset.i, o = DC.sciQuestion(id).o[i], sc = o[1], prev = H().sci[id] || {}; H().sci[id] = { sel: i, score: sc, best: sc === 2 || !!prev.best }; DC.save(); DC.refresh('[data-act=v8ans][data-i="' + i + '"]'); DC.softUpdate(); DC.say((sc === 2 ? 'Strong answer. ' : sc === 1 ? 'Partly there. ' : 'Not quite. ') + o[2]); };
  DC.acts.v8term = (b) => { U().term = +b.dataset.i; DC.save(); DC.refresh('#v8panel'); };
  DC.acts.v8ref = (b) => { U().ref = +b.dataset.i; DC.save(); DC.refresh('#v8panel'); };
  DC.acts.v8start = (b) => { const ta = DC.$('#rf-' + b.dataset.k); ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + b.dataset.t; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); };
})();
