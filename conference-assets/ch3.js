/* Chapter 3 : the research investigation (guided lab simulation + original-research organizer) */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc, D = DC.DATA;

  /* ---------- the lab drawing: animation and recorded numbers come from ONE source ---------- */
  const VX0 = 80, VX1 = 180, YB = 380, PXCM = 34, YLINE = YB - D.lineCm * PXCM;
  const cmY = (cm) => YB - cm * PXCM;
  const posCache = {};

  /* final positions of the 10 flies for one trial. The number above the line equals DATA counts, by construction. */
  DC.lab = {
    positions(cid, ti) {
      const key = cid + ti; if (posCache[key]) return posCache[key];
      const count = DC.cond(cid).counts[ti], r = DC.rng('drosie-' + cid + '-' + ti);
      const idx = [...Array(D.flies).keys()];
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const cross = new Set(idx.slice(0, count)), placed = [], flies = [];
      for (let f = 0; f < D.flies; f++) {
        const isC = cross.has(f); let best = null;
        for (let k = 0; k < 120 && !best; k++) {
          const mind = k < 60 ? 16 : 11;
          const x = VX0 + 12 + r() * (VX1 - VX0 - 24);
          const cm = isC ? 8.7 + r() * 1.12 : 0.7 + r() * 6.3;   // crossers >= 8.7 cm, others <= 7.0 cm: never ambiguous
          const y = cmY(cm);
          if (placed.every((p) => Math.hypot(p[0] - x, p[1] - y) >= mind)) best = [x, y, cm];
        }
        if (!best) best = [VX0 + 12 + r() * (VX1 - VX0 - 24), cmY(isC ? 9.2 : 3.5), 0];
        placed.push(best);
        flies.push({ id: f + 1, cross: isC, x: best[0], y: best[1], cm: (YB - best[1]) / PXCM, x0: VX0 + 14 + r() * (VX1 - VX0 - 28), y0: YB - 10 - r() * 10, rot: (r() - 0.5) * 36, delay: r() * 0.18, tEnd: isC ? 0.6 + r() * 0.4 : 0.35 + r() * 0.55, ph: r() * 6.28 });
      }
      return (posCache[key] = flies);
    },
    fly(x, y, rot, ring) {
      return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(0) + ')">' + (ring ? '<circle r="13" fill="none" stroke="#e0a000" stroke-width="3"/>' : '') +
        '<g stroke="#5a3d22" stroke-width=".9" stroke-linecap="round"><path d="M-3 -2L-8 -5M-3 0L-9 1M-3 2L-8 6M3 -2L8 -5M3 0L9 1M3 2L8 6"/></g>' +
        '<ellipse cx="-4" cy="3" rx="3" ry="8" transform="rotate(14 -4 3)" fill="#e8f2f6" fill-opacity=".85" stroke="#7d9aa6" stroke-width=".6"/><ellipse cx="4" cy="3" rx="3" ry="8" transform="rotate(-14 4 3)" fill="#e8f2f6" fill-opacity=".85" stroke="#7d9aa6" stroke-width=".6"/>' +
        '<ellipse cy="6" rx="3.6" ry="5.4" fill="#8b6a3e"/><path d="M-3.4 5H3.4M-3.2 8H3.2" stroke="#3b2a17" stroke-width="1"/><ellipse cy="-1" rx="3.6" ry="3.9" fill="#b98a4d"/><circle cy="-6.6" r="3.1" fill="#b98a4d"/><circle cx="-2.4" cy="-7" r="1.6" fill="#b3261e"/><circle cx="2.4" cy="-7" r="1.6" fill="#b3261e"/></g>';
    },
    /* t in 0..1 is the fraction of the 10-second measurement period */
    svg(cid, ti, t, hl) {
      const flies = DC.lab.positions(cid, ti);
      let s = '<svg viewBox="0 0 260 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A glass vial with ten fruit flies, a ruler in centimetres and a dashed reference line at 8 centimetres"><defs><linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d5eceb"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#c8e1df"/></linearGradient></defs>' +
        '<path d="M' + VX0 + ' 40V' + (YB - 40) + 'Q' + VX0 + ' ' + (YB + 6) + ' ' + (VX0 + 50) + ' ' + (YB + 6) + 'Q' + VX1 + ' ' + (YB + 6) + ' ' + VX1 + ' ' + (YB - 40) + 'V40Z" fill="url(#glass)" stroke="#6fa5a6" stroke-width="3"/>' +
        '<rect x="' + (VX0 - 4) + '" y="18" width="' + (VX1 - VX0 + 8) + '" height="24" rx="6" fill="#f1e7d2" stroke="#cdbb92" stroke-width="2"/>';
      for (let cm = 0; cm <= D.vialCm; cm++) { const y = cmY(cm); s += '<line x1="' + (VX0 - 12) + '" x2="' + VX0 + '" y1="' + y + '" y2="' + y + '" stroke="#1c2b28" stroke-width="' + (cm % 5 === 0 ? 2 : 1) + '"/><text x="' + (VX0 - 16) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#1c2b28" font-family="Verdana,Arial,sans-serif">' + cm + '</text>'; }
      s += '<text x="24" y="14" font-size="11" fill="#1c2b28" font-family="Verdana,Arial,sans-serif">cm</text>' +
        '<line x1="' + (VX0 - 14) + '" x2="' + (VX1 + 4) + '" y1="' + YLINE + '" y2="' + YLINE + '" stroke="#b5483c" stroke-width="3" stroke-dasharray="8 5"/><text x="' + (VX1 + 8) + '" y="' + (YLINE - 4) + '" font-size="11" font-weight="700" fill="#9a3f35" font-family="Verdana,Arial,sans-serif">8 cm</text><text x="' + (VX1 + 8) + '" y="' + (YLINE + 10) + '" font-size="10" fill="#9a3f35" font-family="Verdana,Arial,sans-serif">reference</text><text x="' + (VX1 + 8) + '" y="' + (YLINE + 21) + '" font-size="10" fill="#9a3f35" font-family="Verdana,Arial,sans-serif">line</text>';
      flies.forEach((f) => {
        let x, y, rot = f.rot;
        if (t <= 0) { x = f.x0; y = f.y0; } else {
          const u = Math.max(0, Math.min(1, (t - f.delay) / (f.tEnd - f.delay))), p = 1 - Math.pow(1 - u, 2);
          x = f.x0 + (f.x - f.x0) * p + (u < 1 ? Math.sin(t * 22 + f.ph) * 2.2 : 0); y = f.y0 + (f.y - f.y0) * p; if (u >= 1) { x = f.x; y = f.y; }
        }
        s += DC.lab.fly(x, y, rot, hl && f.cross && t >= 1);
      });
      return s + '</svg>';
    },
    describe(cid, ti) {
      const f = DC.lab.positions(cid, ti);
      return f.map((x) => 'Fly ' + x.id + ': ' + DC.fmt(x.cm, 1) + ' cm, ' + (x.cross ? 'above' : 'below') + ' the line').join('; ') + '.';
    }
  };

  /* ---------- UI state for the lab (not saved) ---------- */
  const ui = { cond: 'control', trial: 0, phase: 'idle', t: 0, hl: false, speed: 1, msg: '', tries: 0, raf: 0 };
  const reduced = () => document.documentElement.classList.contains('nomotion') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const SETUP = [
    ['temp', 'Test temperature (25 °C or 18 °C)', 'changed'], ['count', 'Number of flies above the 8 cm line after 10 seconds', 'measured'],
    ['vial', 'Type of vial', 'same'], ['nflies', 'Number of flies in each group (10)', 'same'], ['tod', 'Time of day of testing', 'same'], ['taps', 'Three gentle taps to start each trial', 'same']
  ];
  const SETUP_OPTS = [['', 'Choose one…'], ['changed', 'Changed on purpose (independent variable)'], ['measured', 'Measured (dependent variable)'], ['same', 'Kept the same (controlled variable)']];
  const SETUP_FB = { changed: 'The only thing we change on purpose is the temperature.', measured: 'We measure how many flies climb above the line. This is what might be affected by the temperature.', same: 'This is kept the same in both groups so it cannot explain a difference.' };
  const setupDone = () => SETUP.every((r) => DC.state.a.setup[r[0]] === r[2]);

  function setupHTML() {
    return '<div class="card"><h3>Step 1 · Set up the experiment</h3><p>Before any trial, a scientist decides what will change, what will be measured and what must stay the same. Sort each item. (Pick from the menus. No dragging needed.)</p><div class="setupgrid">' +
      SETUP.map((r) => {
        const v = DC.state.a.setup[r[0]] || '', good = v && v === r[2], bad = v && v !== r[2];
        return '<div class="setuprow' + (good ? ' good' : bad ? ' bad' : '') + '"><label for="su-' + r[0] + '">' + esc(r[1]) + '</label><select id="su-' + r[0] + '" data-bind="a.setup.' + r[0] + '" aria-describedby="sufb-' + r[0] + '">' + SETUP_OPTS.map((o) => '<option value="' + o[0] + '"' + (v === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select><div class="hint" id="sufb-' + r[0] + '" style="grid-column:1/-1" role="status">' + (good ? '✓ ' + esc(SETUP_FB[r[2]]) : bad ? 'Not quite. Think about whether we change it, measure it, or keep it the same in both groups.' : '') + '</div></div>';
      }).join('') + '</div>' + (setupDone() ? '<div class="callout ok"><strong>Setup complete.</strong> The 25 °C group is your <strong>control</strong>: it gets everything the same, except the temperature.</div>' : '') + '</div>';
  }

  function assayHTML() {
    return '<div class="card"><h3>The climbing assay in plain words</h3><ol class="clean"><li>Put 10 flies in a clear vial and let them rest in the test room for 10 minutes.</li><li>Tap the vial gently three times. The flies fall to the bottom. (Flies naturally climb up afterwards: this behavior is called negative geotaxis.)</li><li>Start a <strong>10-second</strong> timer.</li><li>When it ends, count the flies whose bodies are <strong>above the dashed 8 cm line</strong>.</li><li>Rest the flies for 60 seconds. Do five trials.</li></ol><p class="hint">Real labs use methods like this to study fruit fly movement (for example, Gargano et al. 2005; Nichols et al. 2012, listed in the booth in Chapter 8). The numbers here are <strong>simulated</strong>.</p></div>';
  }

  function trialArea() {
    const c = DC.cond(ui.cond), done = DC.state.a.rec[ui.cond][ui.trial], running = ui.phase === 'running', fin = ui.phase === 'done';
    const t = running || fin ? ui.t : 0;
    const locked = !setupDone();
    let h = '<div class="tabsx" role="group" aria-label="Choose a group">' + D.conditions.map((x) => '<button type="button" class="tabx" data-act="c3cond" data-c="' + x.id + '" aria-pressed="' + (x.id === ui.cond) + '">' + esc(x.label) + (x.role === 'control' ? ' · control' : '') + '</button>').join('') + '</div>' +
      '<div class="trialbtns" role="group" aria-label="Choose a trial">' + [0, 1, 2, 3, 4].map((i) => '<button type="button" class="tb' + (typeof DC.state.a.rec[ui.cond][i] === 'number' ? ' rec' : '') + '" data-act="c3trial" data-i="' + i + '"' + (i === ui.trial ? ' aria-current="true"' : '') + ' aria-label="Trial ' + (i + 1) + (typeof DC.state.a.rec[ui.cond][i] === 'number' ? ', recorded' : ', not recorded yet') + '">' + (i + 1) + '</button>').join('') + '</div>';
    h += '<div class="labgrid"><div class="labstage"><div id="labSvg">' + DC.lab.svg(ui.cond, ui.trial, t, ui.hl) + '</div><div class="timer" id="timer" aria-hidden="true">' + (t * D.seconds).toFixed(1) + ' s</div><div class="hint">Measurement period: ' + D.seconds + ' seconds</div></div><div id="labCtl">';
    h += '<p><strong>' + esc(c.label) + ' · trial ' + (ui.trial + 1) + ' of ' + D.trials + '</strong></p>';
    if (locked) h += '<div class="callout warn">Finish Step 1 (sorting the variables) to unlock the trials.</div>';
    else {
      h += '<div class="row"><button type="button" class="btn primary" id="startBtn" data-act="c3start"' + (running ? ' disabled' : '') + '>' + (running ? 'Counting time…' : fin ? 'Run this trial again' : 'Tap the vial and start the timer') + '</button><label class="skipchk"><input type="checkbox" id="fast"' + (ui.speed > 1 ? ' checked' : '') + ' data-act="c3speed"> Fast (3×)</label></div>';
      if (fin) {
        h += '<div class="card" style="margin-top:.7rem"><label for="cnt"><strong>How many flies are above the dashed line?</strong></label><div class="row"><input type="number" id="cnt" min="0" max="10" inputmode="numeric" style="max-width:7rem" value="' + (typeof done === 'number' ? done : '') + '"><button type="button" class="btn gold" data-act="c3record">Record this count</button><button type="button" class="btn small" data-act="c3help" aria-pressed="' + ui.hl + '">' + (ui.hl ? 'Hide the highlights' : 'Help me count') + '</button></div><div class="fb ' + (ui.msg.startsWith('✓') ? 'ok' : ui.msg ? 'no' : 'info') + '" role="status" id="cntMsg">' + esc(ui.msg || 'Count the flies whose whole body is above the line. Flies below the line do not count.') + '</div></div>' +
          '<details><summary>Text description of this trial (shows the answer)</summary><p>' + esc(DC.lab.describe(ui.cond, ui.trial)) + '</p></details>';
      } else if (running) h += '<p role="status">Watch the vial. Which flies climb highest?</p>';
      else h += '<p class="hint">Press the button to tap the vial. Then watch for ' + D.seconds + ' seconds and count the flies above the line.</p>' + (typeof done === 'number' ? '<div class="fb ok">Trial recorded: <strong>' + done + '</strong> flies above the line.</div>' : '');
    }
    return h + '</div></div>';
  }

  function tableHTML() {
    const rec = DC.state.a.rec;
    let h = '<div class="tblwrap"><table class="tbl"><caption>Your data table: flies above the 8 cm line after 10 seconds (out of 10)</caption><thead><tr><th scope="col">Trial</th>' + D.conditions.map((c) => '<th scope="col">' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>';
    for (let i = 0; i < D.trials; i++) h += '<tr><th scope="row">' + (i + 1) + '</th>' + D.conditions.map((c) => '<td>' + (typeof rec[c.id][i] === 'number' ? rec[c.id][i] : '<span aria-label="not recorded yet">–</span>') + '</td>').join('') + '</tr>';
    return h + '</tbody></table></div>';
  }

  function aHTML() {
    const nrec = D.conditions.reduce((a, c) => a + DC.recorded(c.id).length, 0);
    return '<p class="lead">You are the researcher. Run the trials, count carefully and record the numbers. Everything on this page is a <strong>simulation</strong>.</p><div class="callout sim"><strong>Simulated experiment.</strong> The flies and results are generated for learning. They are not real data.</div>' + assayHTML() + '<div id="setupBox">' + setupHTML() + '</div>' +
      '<div class="card"><h3>Step 2 · Run the trials</h3><p>Do all 5 trials for both groups (10 recordings). You can run them in any order. Scientists often mix the order so that tiredness does not affect one group more than the other.</p><div id="trialBox">' + trialArea() + '</div></div>' +
      '<div class="card"><h3>Step 3 · Your data table <span class="tag" id="recTag">' + nrec + ' of 10 recorded</span></h3><div id="tableBox">' + tableHTML() + '</div></div>' +
      '<div class="card"><h3>Step 4 · Variation</h3>' + DC.mcq('c3var', 'The five trials in one group did not give exactly the same number. What is the best explanation?', [
        ['Someone made a mistake, so we should throw away the odd trials.', false, 'Do not throw data away just because it differs. Real measurements vary.'],
        ['Natural variation: flies differ from each other, taps are never identical, and counting near the line can be slightly off.', true, 'That is why scientists repeat measurements and look at all of them, not just one number.'],
        ['The flies decided to cheat in some trials.', false, 'Flies do not cheat, but each trial really does come out a little differently.']]) +
      '<div class="callout">A note on repeating: all five trials use the <strong>same 10 flies</strong>. Repeating helps us see how much the count wobbles from trial to trial, but it does not tell us what other groups of flies would do.</div></div>';
  }

  function paintAnim() { const s = DC.$('#labSvg'); if (s) s.innerHTML = DC.lab.svg(ui.cond, ui.trial, ui.t, ui.hl); const t = DC.$('#timer'); if (t) t.textContent = (ui.t * D.seconds).toFixed(1) + ' s'; }
  function paintTrial(focus) { const b = DC.$('#trialBox'); if (b) { b.innerHTML = trialArea(); if (focus) { const f = DC.$(focus); if (f) f.focus({ preventScroll: true }); } } }
  function stop() { cancelAnimationFrame(ui.raf); ui.phase = 'idle'; ui.t = 0; ui.hl = false; ui.msg = ''; ui.tries = 0; }
  function finish() {
    ui.phase = 'done'; ui.t = 1; DC.state.a.ran[ui.cond][ui.trial] = 1; DC.save(); paintTrial('#cnt'); DC.say('Time is up. Count the flies above the line.');
  }
  DC.acts.c3cond = (b) => { stop(); ui.cond = b.dataset.c; paintTrial('[data-act=c3cond][data-c=' + ui.cond + ']'); };
  DC.acts.c3trial = (b) => { stop(); ui.trial = parseInt(b.dataset.i, 10); paintTrial('[data-act=c3trial][data-i="' + ui.trial + '"]'); };
  DC.acts.c3speed = (b) => { ui.speed = b.checked ? 3 : 1; };
  DC.acts.c3start = () => {
    if (ui.phase === 'running' || !setupDone()) return;
    ui.phase = 'running'; ui.t = 0; ui.hl = false; ui.msg = ''; ui.tries = 0;
    if (reduced()) { finish(); return; }
    paintTrial('#startBtn');
    const dur = (D.seconds * 1000) / ui.speed, t0 = performance.now();
    const step = (now) => { ui.t = Math.min(1, (now - t0) / dur); paintAnim(); if (ui.t < 1) ui.raf = requestAnimationFrame(step); else finish(); };
    ui.raf = requestAnimationFrame(step);
  };
  DC.acts.c3help = () => { ui.hl = !ui.hl; paintTrial('[data-act=c3help]'); };
  DC.acts.c3record = () => {
    const inp = DC.$('#cnt'), v = inp.value === '' ? NaN : parseInt(inp.value, 10), truth = DC.cond(ui.cond).counts[ui.trial];
    if (isNaN(v) || v < 0 || v > D.flies) { ui.msg = 'Type a whole number from 0 to ' + D.flies + '.'; paintTrial('#cnt'); return; }
    if (v === truth) {
      DC.state.a.rec[ui.cond][ui.trial] = v; DC.save(); ui.msg = '✓ Recorded ' + v + ' for trial ' + (ui.trial + 1) + '. Your table is updated.';
      paintTrial('#cnt'); const tb = DC.$('#tableBox'); if (tb) tb.innerHTML = tableHTML(); const tg = DC.$('#recTag'); if (tg) tg.textContent = D.conditions.reduce((a, c) => a + DC.recorded(c.id).length, 0) + ' of 10 recorded'; DC.softUpdate();
    } else {
      ui.tries++; ui.msg = 'You typed ' + v + ', but ' + (v > truth ? 'fewer' : 'more') + ' flies are above the dashed line. Look again' + (ui.tries >= 2 ? ' or press “Help me count” to highlight them.' : '.');
      paintTrial('#cnt');
    }
  };

  /* ---------- Path B organizer ---------- */
  function bMethodsOk() { const b = DC.state.b; return DC.bFilled('methods') || b.skip.methods || b.steps.some((s) => s.trim()); }
  function bDataOk() { const b = DC.state.b; return DC.bFilled('data') || b.skip.data || b.log.some((r) => r.label.trim() || String(r.value).trim()); }
  DC.bLogNumeric = () => DC.state.b.log.filter((r) => String(r.value).trim() !== '' && isFinite(Number(r.value)));

  function bReady() {
    const b = DC.state.b, items = [];
    items.push([DC.bFilled('question'), 'A research question', 'Go back to Chapter 2 and write what you wanted to find out.']);
    items.push([bMethodsOk(), 'Methods (steps, or marked as skipped)', 'Write at least one step of what you did, or skip it in Chapter 2.']);
    items.push([bDataOk(), 'Observations or data (a log entry, a summary, or marked as skipped)', 'Add a log entry with something you really saw or measured, or skip it.']);
    if (b.type === 'experiment') items.push([!!(b.vars.changed.trim() && b.vars.measured.trim()), 'What I changed and what I measured', 'For an experiment, name the thing you changed and the thing you measured.']);
    items.push([DC.bFilled('limitations') || b.skip.limitations, 'Limitations (written or skipped)', 'Think about what makes your results less certain. Even one sentence helps.']);
    return items;
  }
  function bReadyHTML() { return '<ul class="check">' + bReady().map((i) => '<li class="' + (i[0] ? 'ok' : 'todo') + '"><strong>' + esc(i[1]) + '</strong>' + (i[0] ? '' : '<br><span class="hint">' + esc(i[2]) + '</span>') + '</li>').join('') + '</ul>'; }

  function bHTML() {
    const b = DC.state.b, exp = b.type === 'experiment';
    return '<p class="lead">This is your research organizer for <strong>' + esc(b.f.title || 'your project') + '</strong>. It helps you arrange what you really did and saw. It never makes up information for you.</p>' +
      '<div class="grid2"><div>' +
      '<div class="card"><h3>' + (exp ? 'What I changed, measured and kept the same' : 'What I looked at') + '</h3>' +
      [['changed', exp ? 'What I changed on purpose' : 'What was different between places, times or groups (if anything)'], ['measured', exp ? 'What I measured or observed' : 'What I observed or measured'], ['same', 'What I tried to keep the same']].map((f) => '<div class="field"><label for="bv-' + f[0] + '">' + f[1] + '</label><textarea id="bv-' + f[0] + '" data-bind="b.vars.' + f[0] + '" style="min-height:3.6rem">' + esc(b.vars[f[0]]) + '</textarea></div>').join('') + '<p class="hint">Observation and exploration projects may not change anything. That is fine. Write "nothing changed" or leave it blank.</p></div>' +
      '<div class="card"><h3>My steps</h3><ol id="stepList" style="padding-left:1.2rem">' + b.steps.map((s, i) => '<li class="field"><label class="sr-only" for="st-' + i + '">Step ' + (i + 1) + '</label><div class="row"><input type="text" id="st-' + i + '" data-bind="b.steps.' + i + '" value="' + esc(s) + '" style="flex:1" placeholder="What did you do?"><button type="button" class="btn small danger" data-act="bDelStep" data-i="' + i + '" aria-label="Remove step ' + (i + 1) + '">✕</button></div></li>').join('') + '</ol><button type="button" class="btn small" data-act="bAddStep">+ Add a step</button></div></div>' +
      '<div><div class="card"><h3>My observation and data log</h3><p class="hint">Add one row for each thing you observed or measured. <strong>Value</strong> is only for real numbers you measured (with units in the note). Leave it blank for observations in words.</p><div class="tblwrap"><table class="tbl"><thead><tr><th scope="col">What / when</th><th scope="col">Group (optional)</th><th scope="col">Value</th><th scope="col">Note or unit</th><th scope="col"><span class="sr-only">Remove</span></th></tr></thead><tbody>' +
      b.log.map((r, i) => '<tr>' + ['label', 'group', 'value', 'note'].map((k) => '<td><label class="sr-only" for="lg-' + i + k + '">' + k + ' row ' + (i + 1) + '</label><input ' + (k === 'value' ? 'type="text" inputmode="decimal"' : 'type="text"') + ' id="lg-' + i + k + '" data-bind="b.log.' + i + '.' + k + '" value="' + esc(r[k]) + '"></td>').join('') + '<td><button type="button" class="btn small danger" data-act="bDelLog" data-i="' + i + '" aria-label="Remove row ' + (i + 1) + '">✕</button></td></tr>').join('') +
      '</tbody></table></div><button type="button" class="btn small" data-act="bAddLog">+ Add a row</button><div class="callout warn" style="margin-top:.6rem">Write only what really happened. If you have no data yet, you can plan what you will record, or skip this part.</div></div>' +
      '<div class="card sticky"><h3>Am I ready for the conference?</h3><div id="bready">' + bReadyHTML() + '</div><label class="skipchk" style="font-size:.95rem;color:var(--ink)"><input type="checkbox" data-bind="b.organizerSeen"' + (b.organizerSeen ? ' checked' : '') + '> I looked over this list and I am ready to continue.</label></div></div></div>';
  }

  DC.acts.bAddStep = () => { DC.state.b.steps.push(''); DC.save(); DC.refresh('#st-' + (DC.state.b.steps.length - 1)); };
  DC.acts.bDelStep = (b) => { DC.state.b.steps.splice(+b.dataset.i, 1); if (!DC.state.b.steps.length) DC.state.b.steps.push(''); DC.save(); DC.refresh('#stepList input'); };
  DC.acts.bAddLog = () => { DC.state.b.log.push({ label: '', group: '', value: '', note: '' }); DC.save(); DC.refresh('#lg-' + (DC.state.b.log.length - 1) + 'label'); };
  DC.acts.bDelLog = (b) => { DC.state.b.log.splice(+b.dataset.i, 1); if (!DC.state.b.log.length) DC.state.b.log.push({ label: '', group: '', value: '', note: '' }); DC.save(); DC.refresh('#lg-0label'); };

  DC.register(3, {
    complete() {
      const s = DC.state;
      if (s.path === 'A') return DC.aComplete() && !!(s.det.c3var && s.det.c3var.ok);
      if (s.path === 'B') return !!(s.b.organizerSeen && bMethodsOk() && bDataOk() && DC.bFilled('question'));
      return false;
    },
    gate: () => (DC.state.path === 'B' ? 'Check your readiness list, then tick the box saying you are ready.' : 'Record all 10 trials and answer the variation question.'),
    render() {
      if (!DC.state.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      return DC.state.path === 'A' ? aHTML() : bHTML();
    },
    mount() {
      stop();
      DC.onBind('a.setup', (el) => { const bx = DC.$('#setupBox'); if (bx) { const id = el.id; bx.innerHTML = setupHTML(); paintTrial(); const f = document.getElementById(id); if (f) f.focus({ preventScroll: true }); } DC.softUpdate(); });
      DC.onBind('b.', () => { const r = DC.$('#bready'); if (r) r.innerHTML = bReadyHTML(); DC.softUpdate(); });
    }
  });
})();
