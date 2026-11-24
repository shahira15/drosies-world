/* Chapter 5, visual adventure: the Abstract Story Workshop.
   Explorer: pick accurate sentence cards for five story slots (with real distractors). Researcher / "write my own": the original editable fields and checks.
   Both write the same state (DC.state.abs.*) and are judged by the same completion rule (DC.absComplete). Nothing is auto-written for the conclusion. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc, D = DC.DATA;
  const SLOTS = [
    { k: 'bg', name: 'Why?', icon: 'idea', say: 'Why does this matter? Pick the card that sets the scene.' },
    { k: 'obj', name: 'Question?', icon: 'question', say: 'What did we ask? A good question can be tested.' },
    { k: 'methods', name: 'How?', icon: 'methods', say: 'How did we find out? Numbers help.' },
    { k: 'results', name: 'What happened?', icon: 'data', say: 'Only what we measured, with the right numbers.' },
    { k: 'conclusion', name: 'What does it mean?', icon: 'findings', say: 'Careful words! What do the results suggest?' }
  ];
  const U = () => { const u = vx.c(5); if (u.slot == null) u.slot = 0; u.fb = u.fb || null; return u; };

  /* ---------- art: the workshop ---------- */
  A.workshop = (filled) => A.wall('#fdf0d5', 470, '#d9bd88') + A.window(60, 60, 110, 120) + A.shelf(750, 120, 170) + A.clock(480, 70) +
    SLOTS.map((s, i) => { const x = 140 + i * 155; return A.g('translate(' + x + ' 190)', A.p('M-52 150 V40 a52 52 0 0 1 104 0 V150z', filled[i] ? '#e4f3e9' : '#fffdf6', 'stroke="#8d6336" stroke-width="6"') + A.tx(0, 52, 34, filled[i] ? '✓' : String(i + 1), filled[i] ? '#2d7a52' : '#8d6336') + A.ln(-30, 86, 30, 86, filled[i] ? '#2d7a52' : '#c9d8cc', 5) + A.ln(-30, 108, 20, 108, filled[i] ? '#2d7a52' : '#c9d8cc', 5) + A.ln(-30, 130, 26, 130, filled[i] ? '#2d7a52' : '#c9d8cc', 5)); }).join('') +
    A.desk(220, 468, 500) + A.g('translate(700 470)', A.r(0, 0, 80, 14, '#f3e9c8', 4, 'stroke="#8d6336" stroke-width="3"') + A.ln(70, 0, 130, -60, '#c4655a', 6) + A.c(134, -66, 8, '#d9b45a')) + A.plant(70, 470, 1);

  /* ---------- sentence cards generated from the learner's data (Path A) ---------- */
  const stats = () => { if (DC.aComplete()) return DC.aStats(); const o = {}; D.conditions.forEach((c) => (o[c.id] = DC.stats(c.counts))); return o; };
  const f1 = (n) => DC.fmt(n, 1);
  function cardsA(k) {
    const s = stats(), c = s.control, w = s.cool;
    const R = { bg: [
      ['Fruit flies are ectotherms, so the air temperature around them can change how active they are.', true, 'A real fact that sets up why temperature might matter.'],
      ['Fruit flies are the most amazing insects in the whole world.', false, 'Fun, but it does not tell the reader why we tested temperature.'],
      ['Everyone knows that cold flies are lazy.', false, 'That is an unsupported claim, not background.']],
    obj: [
      ['This simulated activity asked whether fewer fruit flies climb above an 8 cm line in 10 seconds at 18 °C than at 25 °C.', true, 'Clear, testable, and says it is simulated.'],
      ['I asked: do fewer flies climb above the line in cooler air? (simulated)', true, 'Short and testable.'],
      ['I wanted to prove that cold makes flies lazy.', false, 'A question tries to find out. "Lazy" was not measured.'],
      ['Flies.', false, 'A topic is not a question.']],
    methods: [
      ['In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial, one at 25 °C and one at 18 °C. Flies above the 8 cm line after 10 seconds were counted in 5 trials per group.', true, 'It says what changed, what was counted, and how many.'],
      ['We looked at some flies in a cold place and a warm place.', false, 'Too vague. Say how many flies, what was measured and how often.'],
      ['We tested 100 flies in 12 vials.', false, 'That is not what was done in this simulation (10 flies per group).']],
    results: [
      ['At 25 °C the mean was ' + f1(c.mean) + ' flies above the line (range ' + c.min + ' to ' + c.max + '). At 18 °C the mean was ' + f1(w.mean) + ' (range ' + w.min + ' to ' + w.max + ').', true, 'These are your own averages and ranges.'],
      ['At 25 °C the mean was ' + f1(w.mean) + ' flies above the line. At 18 °C the mean was ' + f1(c.mean) + '.', false, 'The two groups are swapped. Check your data table.'],
      ['At 25 °C the mean was 7.5 flies above the line. At 18 °C the mean was 4.2.', false, '7.5 is not in your data.'],
      ['The cold flies were lazy and slow.', false, 'That explains why, but only counts were measured. Put explanations in the conclusion.']],
    conclusion: [
      ['In this simulation the 18 °C group had fewer flies above the line on average, which fits the prediction. One vial per temperature is a limit, so more groups are needed.', true, 'It says what was found, how it fits, and one limit.'],
      ['These simulated results suggest cooler air may reduce climbing, but they cannot show what all flies do.', true, 'Careful words and an honest limit.'],
      ['This proves that cold makes all flies lazy.', false, '"Proves", "all" and "lazy" go further than the data.'],
      ['Nothing happened.', false, 'There was a difference in this simulation. Describe it carefully.']] };
    return vx.shuffle(R[k].map((x) => ({ text: x[0], ok: x[1], fb: x[2] })), 'abs' + k);
  }
  const filled = () => SLOTS.map((s) => DC.words(DC.state.abs[s.k]) >= 6);

  function docHTML() {
    const a = DC.state.abs;
    return '<div class="preview" id="v5doc" aria-label="Your abstract so far"><h3 style="margin:0;font-size:1.1rem">' + esc(DC.absTitle()) + '</h3><p style="margin:.1rem 0 .4rem;font:600 .8rem var(--vx-font)">' + esc(DC.name()) + ' · simulated educational conference' + (DC.state.path === 'A' ? ' · <strong>Simulated data</strong>' : '') + '</p>' +
      SLOTS.map((s) => '<h4>' + esc(s.name) + '</h4><p>' + (a[s.k].trim() ? esc(a[s.k]) : '<em style="color:#8a8466">(empty slot)</em>') + '</p>').join('') + '<p class="vx-note" style="margin:.5rem 0 0">' + DC.words(SLOTS.map((s) => a[s.k]).join(' ')) + ' words</p></div>';
  }

  /* ---------- the slot panel ---------- */
  function slotPanelA() {
    const u = U(), s = SLOTS[u.slot], opts = cardsA(s.k), cur = DC.state.abs[s.k], locked = s.k === 'results' && !DC.aComplete();
    if (locked) return '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem">The data card is missing</p><p class="vx-note">Record all ten counts in the lab first. Then your numbers appear here.</p><button type="button" class="vx-btn" data-act="go" data-n="3">Back to the lab</button></div>';
    const own = u.own && u.own[s.k];
    return '<div class="vx-panel"><div class="spread"><strong class="vx-title" style="font-size:1.15rem;margin:0">' + vx.icon(s.icon, 30) + ' ' + esc(s.name) + '</strong><span class="vx-note">Slot ' + (u.slot + 1) + ' of 5</span></div>' +
      (own ? '<div class="field" style="margin-top:.5rem"><label class="sr-only" for="ab-' + s.k + '">' + esc(s.name) + '</label><textarea id="ab-' + s.k + '" data-bind="abs.' + s.k + '" style="min-height:6rem">' + esc(cur) + '</textarea></div><div id="v5chk">' + checksHTML() + '</div>' :
      '<div class="vx-choices" style="grid-template-columns:minmax(0,1fr)" role="group" aria-label="Sentence cards for ' + esc(s.name) + '">' + opts.map((o, i) => '<button type="button" class="vx-choice' + (cur === o.text ? ' ok' : (u.fb && u.fb.k === s.k && u.fb.i === i ? ' bad' : '')) + '" data-act="v5pick" data-i="' + i + '" style="align-items:flex-start;text-align:left;font-weight:700;font-size:.95rem;min-height:3.4rem" aria-pressed="' + (cur === o.text) + '"><span>' + esc(o.text) + '</span></button>').join('') + '</div>' +
        (u.fb && u.fb.k === s.k ? '<div class="vx-fb ' + (u.fb.ok ? 'ok' : 'no') + '" role="status"><strong>' + (u.fb.ok ? 'Yes! ' : 'Not quite. ') + '</strong>' + esc(u.fb.text) + '</div>' : '')) +
      '<div class="row" style="margin-top:.5rem"><button type="button" class="vx-btn small ghost" data-act="v5own">' + (own ? '← Back to the cards' : '✎ Write it in my own words') + '</button></div></div>';
  }
  function checksHTML() { const f = DC.absFeedback().filter((x) => x.lvl !== 'ok').sort((a, b) => (a.lvl === 'warn' ? 0 : 1) - (b.lvl === 'warn' ? 0 : 1)).slice(0, 3); return f.length ? '<ul class="check">' + f.map((x) => '<li class="todo">' + esc(x.msg) + '</li>').join('') + '</ul>' : '<div class="vx-fb ok">The checker found no problems with this abstract.</div>'; }
  function slotPanelB() {
    const u = U(), s = SLOTS[u.slot], sec = DC.ABS_SECTIONS.find((x) => x.k === s.k), cur = DC.state.abs[s.k];
    return '<div class="vx-panel"><div class="spread"><strong class="vx-title" style="font-size:1.15rem;margin:0">' + vx.icon(s.icon, 30) + ' ' + esc(s.name) + '</strong><span class="vx-note">Slot ' + (u.slot + 1) + ' of 5</span></div><p class="vx-note">' + esc(sec.why) + '</p><div class="starters" role="group" aria-label="Sentence starters">' + sec.starters.map((t) => '<button type="button" class="chip" data-act="v5starter" data-t="' + esc(t) + '">' + esc(t.trim()) + '…</button>').join('') + '</div>' +
      '<label class="sr-only" for="ab-' + s.k + '">' + esc(s.name) + '</label><textarea id="ab-' + s.k + '" data-bind="abs.' + s.k + '" style="min-height:6rem">' + esc(cur) + '</textarea><div id="v5chk">' + checksHTML() + '</div><div class="row"><button type="button" class="vx-btn small gold" data-act="absDraft">Fill empty slots from my project</button></div></div>';
  }

  vx.chapter(5, {
    render() {
      const S = DC.state;
      if (!S.path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      const u = U(), fl = filled(), done = DC.isDone(5), s = SLOTS[u.slot];
      const hot = SLOTS.map((x, i) => ({ x: (140 + i * 155) / 9.6, y: 50, label: 'Story slot ' + (i + 1) + ': ' + x.name, act: 'v5slot', data: { i }, w: 100, h: 130, done: fl[i], pulse: i === u.slot && !fl[i] }));
      const sc = vx.scene({ art: vx.svg(A.workshop(fl), 'A writing workshop with five arched story slots: Why, Question, How, What happened, What does it mean'), hot });
      const tray = vx.tray(SLOTS.map((x, i) => ({ icon: x.icon, label: x.name, act: 'v5slot', data: { i }, on: i === u.slot, done: fl[i] })));
      return '<div class="vx-stage"><div class="vx-main">' + sc + vx.guide(done ? 'celebrate' : fl[u.slot] ? 'encourage' : 'explain', done ? 'Your research story is ready! Time to make a poster!' : fl[u.slot] ? 'Nice! Pick the next slot.' : s.say) + '</div><div class="vx-side">' + tray + '<div id="v5panel">' + (S.path === 'A' ? slotPanelA() : slotPanelB()) + '</div>' + vx.benchBar(5) + '</div></div>' + '<div class="vx-panel" style="margin-top:1rem"><div class="spread"><strong class="vx-title" style="margin:0;font-size:1.1rem">' + vx.icon('abstract', 28) + ' My abstract</strong><span><button type="button" class="vx-btn small" data-act="absPrint">Print or save as PDF</button></span></div>' + docHTML() + '</div>';
    },
    mount() {
      DC.onBind('abs.', () => { const d = DC.$('#v5doc'); if (d) d.outerHTML = docHTML(); const c = DC.$('#v5chk'); if (c) c.innerHTML = checksHTML(); DC.softUpdate(); });
    }
  });
  DC.acts.v5slot = (b) => { U().slot = +b.dataset.i; U().fb = null; DC.save(); DC.refresh('#v5panel'); };
  DC.acts.v5own = () => { const u = U(), k = SLOTS[u.slot].k; u.own = u.own || {}; u.own[k] = !u.own[k]; DC.save(); DC.refresh('#v5panel'); };
  DC.acts.v5pick = (b) => {
    const u = U(), s = SLOTS[u.slot], o = cardsA(s.k)[+b.dataset.i]; u.fb = { k: s.k, i: +b.dataset.i, ok: o.ok, text: o.fb };
    if (o.ok) { DC.state.abs[s.k] = o.text; } DC.save(); DC.refresh('#v5panel'); DC.softUpdate(); DC.say((o.ok ? 'Yes! ' : 'Not quite. ') + o.fb);
    if (o.ok && u.slot < 4 && DC.words(DC.state.abs[SLOTS[u.slot + 1].k]) < 6) vx.say('Nice! Pick the next slot: ' + SLOTS[u.slot + 1].name, 'encourage');
  };
  DC.acts.v5starter = (b) => { const ta = DC.$('#ab-' + SLOTS[U().slot].k); ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + b.dataset.t; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); };
})();
