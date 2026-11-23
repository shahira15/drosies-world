/* Chapter 9 : Present, discuss, and revise. No microphone or camera is ever used. */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc, wc = DC.words;
  const OVER = { test: (t) => DC.overclaim(t) };
  const JARGON = /(ectotherm|independent variable|dependent variable|geotaxis|hypothes|replicate|statistic|variable)/i;

  /* ---------- 1. presentation practice (silent 60-second timer) ---------- */
  const ui = { left: 60, run: false, iv: 0, step: 0 };
  const STEPS = [
    ['Say hello and ask your question', () => (DC.state.path === 'B' ? DC.state.b.f.question : DC.STUDY.question) || DC.state.abs.obj],
    ['Why it matters', () => DC.state.abs.bg], ['How you studied it', () => DC.state.abs.methods], ['What you found', () => DC.state.abs.results],
    ['What it means and how sure you are', () => DC.state.abs.conclusion], ['Limits, next steps, and invite questions', () => DC.state.poster.f.limitations || (DC.state.path === 'B' ? DC.state.b.f.limitations : '')]
  ];
  const CHECKS = ['I said my question out loud (or in my head) near the start.', 'I pointed to my figure when I told the results.', 'I said how sure I am and named one limit.', 'I invited questions at the end.'];
  function practiceHTML() {
    const st = DC.state.prac, step = Math.min(5, Math.floor((60 - ui.left) / 10));
    return '<div class="card"><h3>Step 1 · Practice a 60-second talk</h3><p>Read your own words from your abstract and poster, one step every 10 seconds. Practice out loud if you like. <strong>No microphone or camera is used.</strong> Nothing is recorded.</p>' +
      '<div class="row"><div class="timer" id="pracTimer" aria-hidden="true">' + ui.left + ' s</div><button type="button" class="btn primary" data-act="pracToggle" id="pracBtn">' + (ui.run ? 'Pause' : ui.left < 60 && ui.left > 0 ? 'Resume' : 'Start 60 seconds') + '</button><button type="button" class="btn" data-act="pracReset">Reset</button><button type="button" class="btn small" data-act="pracStep" data-d="1">Skip to next step</button></div>' +
      '<ol class="clean" style="list-style:none;padding:0;margin-top:.6rem">' + STEPS.map((s, i) => { const t = (s[1]() || '').trim(); return '<li class="setuprow' + (i === step && (ui.run || ui.left < 60) ? ' good' : '') + '" style="grid-template-columns:1fr"><strong>' + (i * 10) + '–' + (i * 10 + 10) + ' s · ' + esc(s[0]) + '</strong><span>' + (t ? esc(t) : '<em>You have not written this yet. Add it in Chapter 5 or 6.</em>') + '</span></li>'; }).join('') + '</ol>' +
      '<fieldset class="field" style="border:0;padding:0"><legend class="lbl">After practicing, check what you did:</legend>' + CHECKS.map((c, i) => '<label class="skipchk" style="color:var(--ink)"><input type="checkbox" data-bind="prac.chk.' + i + '"' + (st.chk && st.chk[i] ? ' checked' : '') + '> ' + esc(c) + '</label>').join('') + '</fieldset>' +
      '<p class="hint">Marked complete after you run the timer to the end at least once' + (st.timerDone ? ' (done ✓)' : '') + '. Talks of this kind are usually 5 to 10 minutes in real conferences. Poster conversations are short and informal.</p></div>';
  }
  function paintTimer() { const t = DC.$('#pracTimer'); if (t) t.textContent = ui.left + ' s'; }
  function stopTimer() { clearInterval(ui.iv); ui.run = false; }
  DC.acts.pracToggle = () => {
    if (ui.run) { stopTimer(); DC.$('#pracBox').innerHTML = practiceHTML(); DC.$('#pracBtn').focus(); return; }
    if (ui.left <= 0) ui.left = 60; ui.run = true; ui.step = -1;
    ui.iv = setInterval(() => {
      if (!DC.$('#pracTimer')) { stopTimer(); return; }
      ui.left--; paintTimer();
      const s = Math.min(5, Math.floor((60 - ui.left) / 10));
      if (s !== ui.step) { ui.step = s; DC.$('#pracBox').innerHTML = practiceHTML(); DC.say('Step ' + (s + 1) + ': ' + STEPS[s][0]); }
      if (ui.left <= 0) { stopTimer(); DC.state.prac.timerDone = true; DC.save(); DC.$('#pracBox').innerHTML = practiceHTML(); DC.say('Time is up. Nicely done.'); DC.softUpdate(); }
    }, 1000);
    DC.$('#pracBox').innerHTML = practiceHTML(); DC.$('#pracBtn').focus();
  };
  DC.acts.pracReset = () => { stopTimer(); ui.left = 60; DC.$('#pracBox').innerHTML = practiceHTML(); };
  DC.acts.pracStep = () => { const s = Math.min(6, Math.floor((60 - ui.left) / 10) + 1); ui.left = Math.max(0, 60 - s * 10); if (ui.left <= 0) { stopTimer(); DC.state.prac.timerDone = true; DC.save(); DC.softUpdate(); } DC.$('#pracBox').innerHTML = practiceHTML(); };

  /* ---------- word-pattern feedback engine (honest about what it can and cannot judge) ---------- */
  function numberFlags(text) {
    const flags = [];
    if (DC.state.path === 'A') {
      const s = {}; DC.DATA.conditions.forEach((c) => (s[c.id] = DC.stats(c.counts))); const ok = new Set();
      const add = (n) => { ok.add(DC.fmt(n, 1)); ok.add(DC.fmt(n, 2)); ok.add(String(Math.round(n))); };
      [10, 5, 8, 25, 18, 3, 1, 2, 60].forEach(add); DC.DATA.conditions.forEach((c) => { c.counts.forEach(add); const x = s[c.id]; [x.mean, x.median, x.min, x.max, x.sum, (x.mean / 10) * 100].forEach(add); }); add(s.control.mean - s.cool.mean);
      (text.match(/\d+(?:\.\d+)?/g) || []).forEach((n) => { if (!ok.has(n) && !ok.has(DC.fmt(parseFloat(n), 1))) flags.push(n); });
    }
    return flags;
  }
  function rubric(text, crit) {
    const t = text.trim(), out = [], flags = []; let met = 0;
    crit.forEach((c) => { const pass = c.test.test(t); if (pass) met++; out.push([pass, pass ? c.yes : c.no]); });
    if (OVER.test(t)) flags.push('Words like "proves", "always" or "all flies" go further than your data can. Try "suggests", "in my data" or "in this study".');
    const nf = numberFlags(t); if (nf.length) flags.push('The number' + (nf.length > 1 ? 's ' : ' ') + nf.map((n) => '"' + n + '"').join(', ') + ' ' + (nf.length > 1 ? 'do' : 'does') + ' not match the simulated data. Check Chapter 4.');
    return { out, flags, met };
  }
  function fbBlock(r, extra) {
    return '<ul class="check">' + r.out.map((o) => '<li class="' + (o[0] ? 'ok' : 'todo') + '">' + esc(o[1]) + '</li>').join('') + '</ul>' + r.flags.map((f) => '<div class="fb no" role="status"><strong>Check: </strong>' + esc(f) + '</div>').join('') + (extra || '');
  }
  const DISCLAIM = '<p class="hint">This feedback looks for key ideas using simple word patterns. It can miss a good answer or accept a weak one, so ask a teacher, parent or friend to listen to you as well.</p>';

  /* ---------- 2. explanation challenge ---------- */
  function explainCheck() {
    const t = DC.state.prac.explain.trim(), n = wc(t), path = DC.state.path, out = [], flags = [];
    const add = (ok, y, no) => out.push([ok, ok ? y : no]);
    add(n >= 12 && n <= 60, 'Length is good (' + n + ' words).', n < 12 ? 'Write a bit more: 2 to 4 short sentences (about 12 to 60 words).' : 'This is ' + n + ' words. Try to say it in 60 words or fewer.');
    add(path === 'A' ? /(climb|above the line|flies)/i.test(t) : /\w{4,}/.test(t) && n >= 12, 'You say what was looked at or measured.', path === 'A' ? 'Say what was measured: how many flies climbed above the line.' : 'Say what you looked at or measured.');
    add(path === 'A' ? /\d/.test(t) && /(25|room|warm)/i.test(t) && /(18|cool|cold)/i.test(t) : /\d|more|less|fewer|most|least|bigger|smaller|higher|lower|same|different/i.test(t), 'You give a comparison or a number from your evidence.', path === 'A' ? 'Compare the two temperatures and use at least one real number.' : 'Say what you found, using a comparison (more, less, same) or a number.');
    add(/(suggest|fits?|might|may |could|in my|in this|so far|seems)/i.test(t), 'You use careful words to show how sure you are.', 'Add a careful word such as "suggests", "in my test" or "might".');
    add(!JARGON.test(t), 'You used everyday words.', 'Try replacing science words (like "variable", "hypothesis" or "ectotherm") with everyday words, as if talking to a 7-year-old.');
    if (OVER.test(t)) flags.push('"Proves", "always" and "all flies" claim more than your data can show.');
    numberFlags(t).forEach((x) => flags.push('The number "' + x + '" is not in the simulated data.'));
    return { out, flags, met: out.filter((o) => o[0]).length };
  }
  DC.explainOk = () => { if (!DC.state.prac.explain.trim()) return false; const r = explainCheck(); return r.met >= 4 && !r.flags.length; };
  DC.acts.explCheck = () => {
    const r = explainCheck(); DC.state.prac.explainOk = r.met >= 4 && !r.flags.length; DC.save();
    DC.$('#explFb').innerHTML = fbBlock(r, '<div class="fb ' + (DC.state.prac.explainOk ? 'ok' : 'info') + '" role="status">' + (DC.state.prac.explainOk ? 'Nice explanation! A listener who is new to science could follow it.' : 'Revise and check again. Your explanation can change as many times as you like.') + '</div>') + DISCLAIM; DC.softUpdate();
  };

  /* ---------- 3. audience questions ---------- */
  const IDK = ['I don’t know yet, but I would ', 'My data cannot answer that, because ', 'That would require another experiment: '];
  const AQ = [
    { id: 'q1', q: 'An audience member asks: "What does your data say, and what does it NOT say?"', crit: [
      { test: /(more|fewer|less|higher|lower|average|mean|pattern|found|saw|counted|\d)/i, yes: 'You describe what the data show.', no: 'Start with what the data show (a pattern or a number).' },
      { test: /(cannot|can't|can not|does not|doesn't|not show|not say|not tell|don't know|do not know|only|limit|just)/i, yes: 'You name something the data cannot show.', no: 'Say one thing your data cannot tell us (for example, what all flies do, or why it happened).' },
      { test: /(because|since|so |as )/i, yes: 'You give a reason.', no: 'Add a reason: why can’t the data say more?' }] },
    { id: 'q2', q: 'An audience member asks: "How sure are you about your conclusion?"', crit: [
      { test: /(not (completely |totally |100 ?%? )?sure|fairly|somewhat|pretty|a little|reasonably|moderately|might|may |could|uncertain|not certain)/i, yes: 'You say how sure you are in careful words.', no: 'Say how sure you are using words like "fairly sure" or "not completely sure".' },
      { test: /(because|since|only|just|few|small|one |same|limit)/i, yes: 'You explain why you are or are not sure.', no: 'Give a reason, such as how many tries or flies, or what you could not control.' },
      { test: /(more|another|next|repeat|test|check|need)/i, yes: 'You say what would make you surer.', no: 'Add what you would do to be surer.' }] },
    { id: 'q3', q: 'An audience member asks: "What experiment would you do next to answer a question your data cannot?"', crit: [
      { test: /(test|measure|compare|repeat|try|experiment|count|observe|record)/i, yes: 'You name something you would do.', no: 'Say what you would do: test, measure, compare or repeat.' },
      { test: /(new|more|different|separate|another|random|control|same|other)/i, yes: 'You say what would be new or kept the same.', no: 'Say what would be new (more groups, different conditions) or kept the same.' },
      { test: /(because|so that|to see|to find out|to check|would show|would tell|answer)/i, yes: 'You say what it would help you find out.', no: 'Say what the new experiment would help you find out.' }] }
  ];
  function qaHTML() {
    const qa = DC.state.prac.qa, done = DC.state.prac.qaDone;
    return '<div class="card"><h3>Step 3 · Audience questions</h3><p>Answer in your own words. It is completely okay to say <strong>"I don’t know yet"</strong>, <strong>"My data cannot answer that"</strong> or <strong>"That would require another experiment"</strong>, especially when you add what you would do to find out.</p>' +
      AQ.map((x) => '<div class="q' + (done[x.id] ? ' done' : '') + '"><h4><label for="qa-' + x.id + '">' + esc(x.q) + '</label></h4><div class="starters" role="group" aria-label="Honest answer starters">' + IDK.map((t) => '<button type="button" class="chip" data-act="qaStarter" data-id="' + x.id + '" data-t="' + esc(t) + '">' + esc(t.trim()) + '…</button>').join('') + '</div><textarea id="qa-' + x.id + '" data-bind="prac.qa.' + x.id + '">' + esc(qa[x.id] || '') + '</textarea><div class="row" style="margin:.4rem 0"><button type="button" class="btn small gold" data-act="qaCheck" data-id="' + x.id + '">Get feedback</button><span class="wc">' + (done[x.id] ? '✓ Strong answer' : '') + '</span></div><div id="qafb-' + x.id + '" aria-live="polite"></div></div>').join('') + DISCLAIM + '</div>';
  }
  DC.acts.qaStarter = (b) => { const ta = DC.$('#qa-' + b.dataset.id); ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + b.dataset.t; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); };
  DC.acts.qaCheck = (b) => {
    const x = AQ.find((q) => q.id === b.dataset.id), t = (DC.state.prac.qa[x.id] || '').trim(), box = DC.$('#qafb-' + x.id);
    if (wc(t) < 8) { box.innerHTML = '<div class="fb info" role="status">Write at least a sentence or two (about 8 words or more) and then ask for feedback.</div>'; return; }
    const r = rubric(t, x.crit), good = r.met >= 2 && !r.flags.length;
    DC.state.prac.qaDone[x.id] = good || !!DC.state.prac.qaDone[x.id]; DC.save();
    const honest = /(don't know yet|don’t know yet|do not know yet|cannot answer|can't answer|another experiment)/i.test(t) ? '<div class="fb ok" role="status">Saying "I don’t know yet" or "my data cannot answer that" is a real scientist’s answer, especially with a plan to find out.</div>' : '';
    box.innerHTML = fbBlock(r, honest + '<div class="fb ' + (good ? 'ok' : 'info') + '" role="status">' + (good ? 'Strong answer. It is specific, careful and honest.' : 'Revise your answer using the notes above, then ask again.') + '</div>'); DC.softUpdate();
  };

  /* ---------- 4. revise ---------- */
  const snap = () => DC.hashNum(JSON.stringify([DC.state.abs, DC.state.poster.f]));
  function suggestions() {
    const sug = [], fb = DC.absFeedback ? DC.absFeedback().filter((f) => f.lvl !== 'ok') : [];
    fb.slice(0, 4).forEach((f) => sug.push(['Abstract: ' + f.msg, 5]));
    const pc = DC.posterChecks ? DC.posterChecks().filter((c) => !c[0]) : []; pc.slice(0, 4).forEach((c) => sug.push(['Poster: ' + c[1], 6]));
    const names = { quill: 'your research question', anand: 'your control and what you kept the same', waverly: 'how you explain your graph', okoro: 'other possible explanations', bright: 'limits and next steps' };
    Object.keys(DC.state.hall.sci).forEach((id) => { const q = DC.state.hall.sci[id]; if (q && !q.best && names[id]) sug.push(['Hall: a scientist asked about ' + names[id] + '. Could your abstract or poster answer that question more clearly?', 5]); });
    DC.AQ_KEYS = AQ.map((x) => x.id);
    return sug;
  }
  function reviseHTML() {
    const sg = suggestions(), revs = DC.state.revs, changed = DC.state.prac.snap != null && DC.state.prac.snap !== snap();
    return '<div class="card"><h3>Step 4 · Revise your work</h3><p>Real scientists revise after feedback. Here is what your own checklists and conversations suggest.</p>' + (sg.length ? '<ul class="clean">' + sg.map((s) => '<li>' + esc(s[0]) + ' <button type="button" class="btn small" data-act="go" data-n="' + s[1] + '">Open Chapter ' + s[1] + '</button></li>').join('') + '</ul>' : '<div class="callout ok">Your checklists show no open items. Reread your work once more as a visitor would, and see what you would still improve.</div>') +
      '<div class="callout ' + (changed ? 'ok' : '') + '">' + (changed ? 'Your abstract or poster text has changed since you opened this chapter. Good: revising is part of science.' : 'You have not changed your abstract or poster text since opening this chapter. You can edit them in Chapters 5 and 6, then come back.') + '</div>' +
      '<div class="field"><label for="revNote">What did I change (or decide to keep on purpose), and why?</label><textarea id="revNote" style="min-height:4rem" placeholder="Example: I changed my conclusion from “proves” to “suggests” because my data came from only one vial."></textarea></div><button type="button" class="btn gold" data-act="revAdd">Add to my revision log</button><span class="hint" id="revMsg" role="status"></span>' +
      '<h4 style="margin-top:.8rem">My revision log</h4>' + (revs.length ? '<ol class="clean">' + revs.map((r) => '<li>' + esc(r.note) + ' <span class="hint">(' + (r.changed ? 'text changed' : 'no text change') + ')</span></li>').join('') + '</ol>' : '<p class="hint">No entries yet. At least one is needed to finish this chapter.</p>') + '</div>';
  }
  DC.acts.revAdd = () => {
    const t = DC.$('#revNote').value.trim();
    if (wc(t) < 8) { DC.$('#revMsg').textContent = 'Please write at least a sentence (8 words or more) about what you changed or kept, and why.'; return; }
    DC.state.revs.push({ note: t, changed: DC.state.prac.snap !== snap(), at: Date.now() }); DC.save(); DC.refresh('#revNote'); DC.softUpdate();
  };

  function reflectHTML() {
    const r = DC.state.refl;
    return '<div class="card"><h3>Step 5 · Reflect</h3>' + [['learned', 'What did I learn about how scientists share their work?'], ['surprise', 'What surprised me, or what was hard?'], ['next', 'What would I like to investigate next?'], ['proud', 'What am I most proud of?']].map((x) => '<div class="field"><label for="r9-' + x[0] + '">' + x[1] + '</label><textarea id="r9-' + x[0] + '" data-bind="refl.' + x[0] + '" style="min-height:3.6rem">' + esc(r[x[0]]) + '</textarea></div>').join('') + '<p class="hint">Reflections show your thinking. They are not graded, and completing this activity does not measure how much you learned.</p></div>';
  }

  DC.practiceDone = () => { const p = DC.state.prac; return !!(p.timerDone && p.explainOk && AQ.every((x) => p.qaDone[x.id]) && DC.state.revs.length >= 1 && wc(DC.state.refl.learned) >= 5); };
  DC.register(9, {
    complete: () => DC.practiceDone(),
    gate() { const p = DC.state.prac, miss = []; if (!p.timerDone) miss.push('run the 60-second practice'); if (!p.explainOk) miss.push('pass the explanation challenge'); if (!AQ.every((x) => p.qaDone[x.id])) miss.push('answer all three audience questions well'); if (!DC.state.revs.length) miss.push('add a revision log entry'); if (wc(DC.state.refl.learned) < 5) miss.push('write your reflection'); return 'Still to do: ' + miss.join(', ') + '.'; },
    render() {
      if (!DC.state.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      const p = DC.state.prac; if (p.snap == null) { p.snap = snap(); DC.save(); }
      return '<p class="lead">Now practice the part scientists find hardest: explaining your work to other people, answering questions, and improving your work afterwards.</p><div id="pracBox">' + practiceHTML() + '</div>' +
        '<div class="card"><h3>Step 2 · Explanation challenge</h3><p>Explain your main finding to a 7-year-old in 2 to 4 short sentences (up to 60 words). Use everyday words.</p><div class="field"><label for="explain">My explanation</label><textarea id="explain" data-bind="prac.explain">' + esc(p.explain) + '</textarea></div><div class="row"><button type="button" class="btn small gold" data-act="explCheck">Check my explanation</button><span class="wc" id="explWc">' + wc(p.explain) + ' words</span></div><div id="explFb" aria-live="polite"></div></div>' + qaHTML() + '<div id="reviseBox">' + reviseHTML() + '</div>' + reflectHTML();
    },
    mount() { ui.left = 60; stopTimer(); DC.onBind('refl.', () => DC.softUpdate());DC.onBind('prac.explain', () => { DC.state.prac.explainOk = false; DC.save(); const w = DC.$('#explWc'); if (w) w.textContent = wc(DC.state.prac.explain) + ' words'; DC.softUpdate(); });
      DC.onBind('prac.qa', (el) => { const id = el.dataset.bind.split('.')[2]; if (DC.state.prac.qaDone[id]) { DC.state.prac.qaDone[id] = false; DC.save(); const q = el.closest('.q'); if (q) q.classList.remove('done'); DC.softUpdate(); } }); }
  });
})();
