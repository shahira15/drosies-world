/* Chapter 9, visual adventure: the Presentation Theater. Five stops (practice, explain, audience, revise, reflect) with the same saved fields and the same
   completion rule as the original chapter. No microphone or camera is ever used. Feedback is simple word-pattern checking and says so. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc, wc = DC.words;
  const U = () => { const u = vx.c(9); if (u.step == null) { u.step = 0; u.left = 60; u.qa = {}; } return u; };
  const P = () => DC.state.prac;
  const TAB = [['practice', 'timer', 'Practice'], ['explain', 'idea', 'Explain'], ['audience', 'question', 'Questions'], ['revise', 'clip', 'Revise'], ['reflect', 'heart', 'Reflect']];
  const done = () => [!!P().timerDone, !!P().explainOk, DC.AQ.every((x) => P().qaDone[x.id]), DC.state.revs.length >= 1, wc(DC.state.refl.learned) >= 5];
  let iv = 0;
  const stop = () => { clearInterval(iv); iv = 0; };

  A.theater = (step, left, run) => A.wall('#ece3f3', 440, '#cdb78a') + A.bunting(14) +
    A.r(60, 60, 260, 360, '#7a2f45', 10) + A.r(640, 60, 260, 360, '#7a2f45', 10) + A.r(60, 60, 60, 360, '#8f3a54', 10) + A.r(840, 60, 60, 360, '#8f3a54', 10) +
    A.r(250, 70, 460, 260, '#fff', 8, 'stroke="#555" stroke-width="6"') + A.posterMini(400, 86, 160, 228, A.C.teal) + A.r(590, 86, 96, 70, '#fff7df', 8, 'stroke="#8d6336" stroke-width="3"') + A.tx(638, 132, 34, '<tspan id="v9clock">' + left + '</tspan>', run ? A.C.coral : A.C.teal) +
    A.r(220, 330, 520, 40, '#a97a46', 8, 'stroke="#8d6336" stroke-width="4"') + A.g('translate(155 330)', A.person(0, 0, DC.state.look || { skin: '#e8c39e', hair: '#5a3a24' }, 1.6)) +
    [0, 1, 2, 3, 4, 5].map((i) => A.c(120 + i * 144, 520, 30, ['#c68a5e', '#7a4b34', '#e8c39e', '#a56b46', '#f0d0b0', '#8d5a3c'][i]) + A.r(88 + i * 144, 532, 64, 50, ['#2f7d7a', '#c4655a', '#5b3a6b', '#d9b45a', '#20365a', '#3f8a5a'][i], 16)).join('') +
    TAB.map((t, i) => A.c(150 + i * 165, 460, 13, i === step ? '#ffe08a' : done()[i] ? '#9fcf9b' : 'rgba(255,255,255,.7)', 'stroke="#8d6336" stroke-width="3"')).join('');

  /* answer pieces for each audience question: [good, weak] for each of the three things a strong answer includes */
  const PIECES = {
    q1: [['My data show a pattern in what I counted.', 'Flies are just interesting.'], ['They cannot show why it happened.', 'They show everything about all flies.'], ['I can’t say more because I only tested a few flies.', 'Trust me.']],
    q2: [['I am fairly sure, but not completely sure.', 'I am totally certain.'], ['I only tested a small number of flies.', 'No reason.'], ['I would repeat it to be surer.', 'I am done.']],
    q3: [['I would test it again with new flies.', 'I would sleep on it.'], ['I would use more groups and keep everything else the same.', 'Nothing changes.'], ['That would help me find out why. It would answer a new question.', 'Who knows.']]
  };
  const SHORT = { q1: 'What does your data say, and what does it NOT say?', q2: 'How sure are you?', q3: 'What would you test next?' };
  const pick = (id) => U().qa[id] || (U().qa[id] = [null, null, null]);
  const order = (id, k) => vx.shuffle([0, 1], 'qa' + id + k + DC.name());

  /* ---------- panels ---------- */
  function practice() {
    const u = U(), steps = [['hello', 'question', 'Hello! My question'], ['why', 'idea', 'Why it matters'], ['how', 'methods', 'How I studied it'], ['found', 'graph', 'What I found'], ['means', 'findings', 'What it means'], ['next', 'limits', 'Limits & questions']];
    const cur = Math.min(5, Math.floor((60 - u.left) / 10));
    return '<div class="vx-panel"><div class="vx-timer" id="v9t" style="font-size:2.2rem;font-weight:800;text-align:center" role="timer" aria-live="off">' + u.left + ' s</div><div class="row" style="justify-content:center"><button type="button" class="vx-btn" data-act="v9go" id="v9go">' + (u.run ? 'Pause' : u.left < 60 && u.left > 0 ? 'Keep going' : 'Start my 60 seconds') + '</button><button type="button" class="vx-btn small ghost" data-act="v9reset">Start over</button><button type="button" class="vx-btn small ghost" data-act="v9skip">Skip ahead 10 s</button></div>' +
      '<div class="vx-tray" role="list" aria-label="Your talk in six steps" id="v9steps">' + steps.map((s, i) => '<span role="listitem" class="vx-tool' + (i === cur && (u.run || u.left < 60) ? ' on' : '') + (u.left <= 0 || i < cur ? ' done' : '') + '">' + vx.icon(s[1], 32) + '<span>' + s[2] + '</span></span>').join('') + '</div>' +
      '<p class="vx-note" style="margin-top:.4rem">Say each part out loud if you like. Nothing is recorded: there is no microphone or camera. ' + (P().timerDone ? '<strong>Practice done ✓</strong>' : 'Run the timer to the end (or use Skip ahead).') + '</p></div>';
  }
  function explain() {
    const t = P().explain, r = t.trim() ? DC.explainCheck() : null, S = ['In my test, I looked at ', 'I found that ', 'This suggests that ', 'I am not completely sure because '];
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Tell a 7-year-old what you found.</p><p class="vx-note" style="margin:0 0 .4rem">2 to 4 short sentences, everyday words, one number from your evidence.</p><div class="starters" role="group" aria-label="Sentence starters">' + S.map((s) => '<button type="button" class="chip" data-act="v9st" data-t="' + esc(s) + '" data-to="explain">' + esc(s.trim()) + '…</button>').join('') + '</div>' +
      '<textarea id="explain" data-bind="prac.explain" aria-label="My explanation" style="min-height:5rem">' + esc(t) + '</textarea><div class="row"><span class="vx-note" id="explWc">' + wc(t) + ' words</span><button type="button" class="vx-btn small teal" data-act="v9expl">Check my explanation</button></div><div id="v9ef">' + explFb(r) + '</div></div>';
  }
  function explFb(r) {
    if (!r) return '';
    return '<div class="vx-tray" role="list" aria-label="Explanation checklist">' + r.out.map((o) => '<span role="listitem" class="vx-tool' + (o[0] ? ' done' : '') + '" style="max-width:none;text-align:left">' + vx.icon(o[0] ? 'check' : 'dots', 22) + '<span>' + esc(o[1]) + '</span></span>').join('') + '</div>' + r.flags.map((f) => '<div class="vx-fb no" role="status">' + esc(f) + '</div>').join('') +
      '<div class="vx-fb ' + (P().explainOk ? 'ok' : 'info') + '" role="status">' + (P().explainOk ? 'Nice explanation! A listener new to science could follow it.' : 'Revise and check again. You can change it as often as you like.') + ' <small>This checks key words, so it can miss a good answer or accept a weak one. Ask someone to listen too.</small></div>';
  }
  function audience() {
    const qa = P().qa, h = DC.AQ.map((x) => {
      const pk = pick(x.id), allPicked = pk.every((v) => v != null), txt = (qa[x.id] || '').trim(), r = allPicked ? DC.rubric(txt, x.crit) : null, good = !!P().qaDone[x.id];
      return '<div class="vx-panel' + (good ? ' gold' : '') + '"><p class="vx-title" style="font-size:1.05rem;margin:0">“' + esc(SHORT[x.id]) + '”</p><p class="vx-note" style="margin:.2rem 0">Build your answer: pick one card in each row.' + (good ? ' <strong>✓ Strong answer</strong>' : '') + '</p>' +
        [0, 1, 2].map((k) => '<div class="vx-choices" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:.3rem 0" role="group" aria-label="Part ' + (k + 1) + ' of your answer">' + order(x.id, k).map((j) => '<button type="button" class="vx-choice' + (pk[k] === j ? ' sel' : '') + '" data-act="v9pick" data-id="' + x.id + '" data-k="' + k + '" data-j="' + j + '" aria-pressed="' + (pk[k] === j) + '" style="font-weight:700;font-size:.9rem;min-height:3rem;text-align:left"><span>' + esc(PIECES[x.id][k][j]) + '</span></button>').join('') + '</div>').join('') +
        (allPicked ? '<div class="vx-fb ' + (good ? 'ok' : 'info') + '" role="status"><strong>' + (good ? 'Strong answer. ' : 'Not yet. ') + '</strong>' + esc(good ? 'It is specific, careful and honest.' : r.out.filter((o) => !o[0]).map((o) => o[1]).concat(r.flags).join(' ') || 'Try a different card.') + '</div>' : '') + '</div>';
    }).join('');
    return h + '<p class="vx-note">Saying “my data cannot answer that” is a real scientist’s answer. These are practice questions, not a real audience.</p>';
  }
  function revise() {
    const sg = DC.suggestions(), revs = DC.state.revs, changed = P().snap != null && P().snap !== DC.revSnap();
    const Q = ['I changed my conclusion to “suggests” because my data came from only one vial.', 'I kept my title on purpose because it says my question clearly.', 'I added one limit to my poster because the scientists asked about it.'];
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Scientists revise after feedback.</p>' + (sg.length ? '<div class="vx-tray" role="group" aria-label="Things to improve">' + sg.slice(0, 5).map((s) => '<button type="button" class="vx-tool" data-act="go" data-n="' + s[1] + '" title="' + esc(s[0]) + '">' + vx.icon(s[1] === 6 ? 'poster' : 'abstract', 32) + '<span>' + (s[1] === 6 ? 'Poster' : s[1] === 5 ? 'Abstract' : 'Fix') + '</span></button>').join('') + '</div><ul class="vx-note" style="margin:.3rem 0;padding-left:1.1rem">' + sg.slice(0, 4).map((s) => '<li>' + esc(s[0]) + '</li>').join('') + '</ul>' : '<div class="vx-fb ok">Your checklists look good. Revising is still part of science.</div>') +
      '<div class="vx-fb ' + (changed ? 'ok' : 'info') + '" role="status">' + (changed ? 'Your abstract or poster has changed since you opened this chapter. Good.' : 'You have not changed your abstract or poster text yet. You can edit them in Chapters 5 and 6, then come back.') + '</div>' +
      '<p class="vx-note" style="margin:.4rem 0 .2rem">What did you change or keep on purpose, and why?</p><div class="starters" role="group" aria-label="Examples">' + Q.map((s) => '<button type="button" class="chip" data-act="v9st" data-t="' + esc(s) + '" data-to="v9rev">' + esc(s.slice(0, 34)) + '…</button>').join('') + '</div><textarea id="v9rev" aria-label="My revision note" style="min-height:3.6rem"></textarea><div class="row"><button type="button" class="vx-btn small teal" data-act="v9revadd">Add to my revision log</button><span class="vx-note" id="v9rm" role="status"></span></div>' +
      (revs.length ? '<ol class="vx-note" style="padding-left:1.1rem">' + revs.map((r) => '<li>' + esc(r.note) + ' (' + (r.changed ? 'text changed' : 'no text change') + ')</li>').join('') + '</ol>' : '') + '</div>';
  }
  function reflect() {
    const S = ['I learned that scientists ', 'I learned how to ', 'Sharing my work taught me '];
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">' + vx.icon('heart', 22) + ' What did I learn about how scientists share their work?</p><div class="starters" role="group" aria-label="Starters">' + S.map((s) => '<button type="button" class="chip" data-act="v9st" data-t="' + esc(s) + '" data-to="r9-learned">' + esc(s.trim()) + '…</button>').join('') + '</div><textarea id="r9-learned" data-bind="refl.learned" aria-label="What I learned" style="min-height:4rem">' + esc(DC.state.refl.learned) + '</textarea>' +
      ['surprise', 'next', 'proud'].map((k, i) => '<div class="field"><label class="lbl" for="r9-' + k + '">' + ['What surprised me, or was hard?', 'What would I like to investigate next?', 'What am I most proud of?'][i] + ' (optional)</label><textarea id="r9-' + k + '" data-bind="refl.' + k + '" style="min-height:3rem">' + esc(DC.state.refl[k] || '') + '</textarea></div>').join('') + '</div>';
  }
  const PAN = [practice, explain, audience, revise, reflect];
  const SAY = [['Let us practice! Press start and tell your story in 60 seconds.', 'welcome'], ['Pretend I am 7. What did you find?', 'curious'], ['The audience has questions. Pick answer cards!', 'explain'], ['Scientists always revise. What will you improve?', 'thinking'], ['Almost there. What did you learn?', 'encourage']];

  vx.chapter(9, {
    render() {
      if (!DC.state.path) return vx.guide('curious', 'Choose a door first!') + '<div class="vx-panel"><button type="button" class="vx-btn" data-act="go" data-n="2">Go to the doors</button></div>';
      const u = U(), d = done(), p = P(); if (p.snap == null) { p.snap = DC.revSnap(); DC.save(); }
      const hot = TAB.map((t, i) => ({ x: (150 + i * 165) / 9.6, y: 460 / 6, label: t[2], act: 'v9step', data: { i }, w: 60, h: 60, done: d[i] }));
      return '<div class="vx-stage"><div class="vx-main">' + vx.scene({ art: vx.svg(A.theater(u.step, u.left, u.run), 'The presentation theater with a stage, a screen showing a poster and an audience'), hot }) + vx.guide(SAY[u.step][1], SAY[u.step][0]) + '</div><div class="vx-side">' +
        vx.tray(TAB.map((t, i) => ({ icon: t[1], label: t[2], act: 'v9step', data: { i }, on: u.step === i, done: d[i] }))) + '<p class="vx-note" style="margin:.2rem 0">Stops finished: <strong>' + d.filter(Boolean).length + '</strong> of 5</p><div id="v9panel">' + PAN[u.step]() + '</div></div></div>';
    },
    mount() {
      const u = U(); if (u.run && !iv) u.run = false;
      DC.onBind('prac.explain', () => { P().explainOk = false; DC.save(); const w = DC.$('#explWc'); if (w) w.textContent = wc(P().explain) + ' words'; DC.softUpdate(); });
      DC.onBind('refl.', () => DC.softUpdate());
    }
  });
  const redraw = (f) => { DC.refresh(f); };
  DC.acts.v9step = (b) => { stop(); const u = U(); u.run = false; u.step = +b.dataset.i; DC.save(); DC.refresh(); };
  function paint() { const u = U(), t = DC.$('#v9t'), c = DC.$('#v9clock'); if (t) t.textContent = u.left + ' s'; if (c) c.textContent = u.left; }
  function finish() { stop(); const u = U(); u.run = false; u.left = 0; P().timerDone = true; DC.save(); DC.refresh('#v9go'); DC.softUpdate(); DC.say('Time is up. Nicely done.'); }
  DC.acts.v9go = () => {
    const u = U(); if (u.run) { stop(); u.run = false; DC.refresh('#v9go'); return; }
    if (u.left <= 0) u.left = 60; u.run = true;
    iv = setInterval(() => { if (!DC.$('#v9t')) { stop(); u.run = false; return; } u.left--; if (u.left <= 0) { finish(); return; } paint(); if (u.left % 10 === 0) { DC.refresh('#v9go'); } }, 1000);
    DC.refresh('#v9go');
  };
  DC.acts.v9reset = () => { stop(); const u = U(); u.run = false; u.left = 60; DC.refresh('#v9go'); };
  DC.acts.v9skip = () => { const u = U(); u.left = Math.max(0, u.left - 10); if (u.left <= 0) finish(); else { paint(); DC.refresh('#v9go'); } };
  DC.acts.v9st = (b) => { const ta = DC.$('#' + b.dataset.to); ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + b.dataset.t; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); };
  DC.acts.v9expl = () => { const r = DC.explainCheck(); P().explainOk = r.met >= 4 && !r.flags.length; DC.save(); DC.$('#v9ef').innerHTML = explFb(r); DC.softUpdate(); DC.say(P().explainOk ? 'Nice explanation!' : 'Revise and check again.'); };
  DC.acts.v9pick = (b) => {
    const id = b.dataset.id, pk = pick(id), x = DC.AQ.find((q) => q.id === id); pk[+b.dataset.k] = +b.dataset.j;
    if (pk.every((v) => v != null)) { const t = pk.map((v, k) => PIECES[id][k][v]).join(' '), r = DC.rubric(t, x.crit); P().qa[id] = t; P().qaDone[id] = r.met >= 2 && !r.flags.length; } else { P().qaDone[id] = false; }
    DC.save(); DC.refresh('[data-act=v9pick][data-id=' + id + '][data-k="' + b.dataset.k + '"][data-j="' + b.dataset.j + '"]'); DC.softUpdate(); DC.say(P().qaDone[id] ? 'Strong answer!' : pk.every((v) => v != null) ? 'Not yet. Try different cards.' : 'Pick one card in each row.');
  };
  DC.acts.v9revadd = () => {
    const t = DC.$('#v9rev').value.trim(); if (wc(t) < 8) { DC.$('#v9rm').textContent = 'Please write at least a sentence (8 words or more).'; return; }
    DC.state.revs.push({ note: t, changed: P().snap !== DC.revSnap(), at: Date.now() }); DC.save(); DC.refresh('#v9rev'); DC.softUpdate();
  };
})();
