/* teacher.js: Teacher Mode. Everything stays on this device (localStorage). Printables use the browser's print dialog. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, S = DW.save;
  const T = (DW.teacher = {});

  /* ---------- printing ---------- */
  function printSheet(html, title) {
    document.querySelectorAll('.print-sheet').forEach((e) => e.remove());
    const sh = h('div', { class: 'print-sheet', html: '<div class="ps-page">' + html + '</div>' });
    document.body.append(sh);
    const old = document.title; if (title) document.title = title;
    const clean = () => { sh.remove(); document.title = old; window.removeEventListener('afterprint', clean); };
    window.addEventListener('afterprint', clean);
    setTimeout(() => { try { window.print(); } catch (e) { clean(); } }, 80);
    setTimeout(() => { if (sh.isConnected && !document.hidden) { /* leave in place until afterprint */ } }, 0);
  }
  const hdr = (t, sub) => '<div class="ps-h"><b>Drosie’s World · Safety Academy</b><span>drosiesworld.com</span></div><h1>' + t + '</h1>' + (sub ? '<p class="ps-sub">' + sub + '</p>' : '');
  const foot = () => '<p class="ps-foot">' + D0.teacher.disclaimer + '</p>';
  const nameLine = '<div class="ps-line">Name: ______________________ &nbsp; Date: ____________</div>';

  const sheets = {
    ppe() {
      const rows = [['Lab coat', 'Helps keep splashes off clothes and skin. It is not a force field.'], ['Goggles', 'Protect eyes from splashes. Glasses and sunglasses are not splash goggles.'], ['Gloves', 'For some messy jobs only. Peel off from the wrist, bin, wash hands.'], ['Closed-toe shoes', 'Cover the whole foot against drips and dropped things.'], ['Tied-back hair', 'Keeps hair out of your work and away from heat.']];
      return hdr('PPE Poster: Gear for the Job', 'PPE means personal protective equipment. The right gear depends on the job and the hazard.') +
        '<table class="ps-t">' + rows.map((r) => '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>').join('') + '</table>' +
        '<h2>Remember</h2><ul><li>Not every job needs every piece of gear.</li><li>PPE does not make a hazardous job safe by itself.</li><li>Never clean spills, pick up broken glass or touch unknown things. Step away and tell an adult.</li><li>Listen to your teacher and follow your school’s rules.</li></ul>' + foot();
    },
    checklist() {
      return hdr('Lab Ready Checklist', 'Tick each box before you start a lab job.') + nameLine +
        '<ul class="ps-check">' + ['I know today’s job and what could go wrong.', 'My hair is tied back.', 'I am wearing closed-toe shoes.', 'I have the gear my teacher says I need (coat, goggles, gloves if asked).', 'There is no food or drink at my bench.', 'I know where the exit and the eyewash are.', 'I will walk, not run.', 'If something spills or breaks, I step away and tell my teacher.'].map((t) => '<li>☐ ' + t + '</li>').join('') + '</ul>' + foot();
    },
    hunt() {
      const ids = D0.hazardIds;
      return hdr('Hazard Hunt Worksheet', 'Play Mission 3, then match each hazard with the safe response.') + nameLine +
        '<table class="ps-t"><tr><th>Hazard</th><th>What I should do</th></tr>' + ids.map((id) => '<tr><td>' + D0.hazards[id].name + '</td><td class="ps-blank">&nbsp;</td></tr>').join('') + '</table>' +
        '<p class="ps-sub">Answers for the grown-up: ' + ids.map((id) => D0.hazards[id].name + ' → ' + D0.hazards[id].opts.find((o) => o[1])[0]).join('; ') + '.</p>' + foot();
    },
    cards() {
      return hdr('Safe or Not Safe? Card Sort', 'Cut out the cards. Sort them into SAFE and NOT SAFE. Talk about why.') +
        '<div class="ps-cards">' + D0.m5.map((c) => '<div class="ps-card">' + c.text + '</div>').join('') + '</div>' +
        '<h2>Answer key</h2><ul>' + D0.m5.map((c) => '<li><b>' + (c.safe ? 'SAFE' : 'NOT SAFE') + ':</b> ' + c.text + '. ' + c.why + '</li>').join('') + '</ul>' + foot();
    },
    quiz(set) {
      const qs = D0.m7.map((v) => v[set]);
      const name = set === 0 ? 'Form A' : 'Form B';
      return hdr('Safety Check, ' + name, 'Circle one answer for each question. Use Form A before and Form B after, if you like.') + nameLine +
        '<ol class="ps-q">' + qs.map((q) => '<li>' + q.q + '<div>' + q.opts.map((o, i) => '<span>' + 'ABC'[i] + '. ' + o + '</span>').join('') + '</div></li>').join('') + '</ol>' +
        '<div class="ps-break"></div><h2>Answer key, ' + name + '</h2><ol>' + qs.map((q) => '<li><b>' + 'ABC'[q.ok] + '.</b> ' + q.why + '</li>').join('') + '</ol>' + foot();
    },
    guide() {
      return hdr('Teacher Guide: Objectives and References') +
        '<table class="ps-t"><tr><th>Mission</th><th>Learning objective</th><th>Activity</th></tr>' + D0.teacher.mapping.map((m) => '<tr><td>' + m[0] + '</td><td>' + m[1] + '</td><td>' + m[2] + '</td></tr>').join('') + '</table>' +
        '<h2>References used for the content</h2><ul>' + D0.teacher.refs.map((r) => '<li>' + r[0] + ' (' + r[1] + ')</li>').join('') + '</ul>' + foot();
    },
  };

  /* ---------- the panel ---------- */
  function gate() {
    return new Promise((res) => {
      const a = 6 + Math.floor(Math.random() * 7), b = 4 + Math.floor(Math.random() * 6);
      const inp = h('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Answer', class: 'l0-gate-in' });
      const msg = h('p', { class: 'center', style: 'min-height:1.4em' });
      const go = () => { if (parseInt(inp.value, 10) === a + b) { ui.closeModal(); res(true); } else { A.play('nope'); msg.textContent = 'Not quite. Ask a grown-up to help.'; } };
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') go(); });
      const body = h('div', { class: 'menu' }, h('p', { class: 'center' }, 'Teacher Mode is for grown-ups. What is ' + a + ' + ' + b + '?'), h('div', { class: 'center' }, inp), msg,
        h('div', { class: 'mbtns' }, h('button', { class: 'primary', onclick: go }, 'Open'), h('button', { class: 'secondary', onclick: () => { ui.closeModal(); res(false); } }, 'Cancel')));
      ui.openModal('Adults only', body, { cls: 'small', noClose: true });
      setTimeout(() => inp.focus(), 80);
    });
  }

  T.open = async function () {
    if (!(await gate())) return;
    const body = h('div', { class: 'journal teacher' });
    const tabs = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div', { class: 'jpane tpane' });
    const names = [['over', 'Overview', 'map'], ['prog', 'Progress', 'check'], ['print', 'Printables', 'print'], ['prepost', 'Pre / post check', 'clipboard'], ['set', 'Settings', 'gear']];
    function show(k) {
      DW.$$('button', tabs).forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      pane.innerHTML = '';
      if (k === 'over') {
        pane.append(h('p', null, 'Lab 0 is a short, self-paced safety prequel (about 45 minutes in total) for ages 5 to 8. It teaches basic lab-safety habits through seven missions. Progress stays in this browser only.'),
          h('div', { class: 'tt-wrap' }, h('table', { class: 'tt' }, h('tr', null, h('th', null, 'Mission'), h('th', null, 'Learning objective'), h('th', null, 'Time')),
            ...D0.missions.map((m) => h('tr', null, h('td', null, m.n + '. ' + m.title), h('td', null, m.lo), h('td', null, '~' + m.mins + ' min'))))),
          h('p', { class: 'jhint' }, D0.teacher.disclaimer));
        pane.append(h('h4', null, 'References'), h('ul', { class: 'tref' }, ...D0.teacher.refs.map((r) => h('li', null, r[0] + ' (' + r[1] + ')'))));
      } else if (k === 'prog') {
        pane.append(h('p', { class: 'jhint' }, 'Stored only on this device. Nothing is sent anywhere. Scores show questions answered correctly on the first try.'));
        pane.append(h('div', { class: 'tt-wrap' }, h('table', { class: 'tt' }, h('tr', null, h('th', null, 'Mission'), h('th', null, 'Status'), h('th', null, 'Best first-try score')),
          ...D0.missions.map((m) => { const f = S.firstTry(m.n); return h('tr', null, h('td', null, m.n + '. ' + m.title), h('td', null, S.isDone(m.n) ? 'Complete' : 'Not yet'), h('td', null, f ? f.first + ' / ' + f.total : '—')); }))));
        pane.append(h('p', null, 'Lab 1: ' + (S.lab1Unlocked() ? 'unlocked' : 'locked') + (S.get().lab1.teacherUnlocked ? ' (by Teacher Mode)' : '') + '. Lab 1 completed: ' + (S.isLab1Complete() ? 'yes' : 'not yet') + '.'));
        pane.append(h('button', { class: 'secondary', html: icon('print', 18) + ' Print progress summary', onclick: () => printSheet(hdr('Progress Summary', 'Printed ' + new Date().toLocaleDateString()) + '<table class="ps-t"><tr><th>Mission</th><th>Status</th><th>First-try score</th></tr>' + D0.missions.map((m) => { const f = S.firstTry(m.n); return '<tr><td>' + m.n + '. ' + m.title + '</td><td>' + (S.isDone(m.n) ? 'Complete' : 'Not yet') + '</td><td>' + (f ? f.first + ' / ' + f.total : '-') + '</td></tr>'; }).join('') + '</table>' + foot(), 'Safety Academy progress') }));
      } else if (k === 'print') {
        pane.append(h('p', { class: 'jhint' }, 'Each button opens your browser’s print dialog. Choose “Save as PDF” if you prefer a file.'));
        const list = [['ppe', 'PPE poster'], ['checklist', 'Lab Ready checklist'], ['hunt', 'Hazard Hunt worksheet'], ['cards', 'Safe / Not Safe card sort'], ['guide', 'Objectives and references']];
        const g = h('div', { class: 'tgrid' });
        list.forEach(([id, label]) => g.append(h('button', { class: 'secondary', html: icon('print', 18) + ' <span>' + label + '</span>', onclick: () => { A.play('click'); printSheet(sheets[id](), 'Safety Academy: ' + label); DW.track('lab0-teacher-print', 'Teacher print'); } })));
        pane.append(g);
      } else if (k === 'prepost') {
        pane.append(h('p', null, 'An optional, simple pre / post design for a class or a family: give Form A before playing and Form B after. Each has 8 questions and an answer key.'),
          h('ul', { class: 'tref' }, h('li', null, 'Use the same conditions both times (time, help allowed, reading aloud for younger children).'), h('li', null, 'Compare class patterns, not single children. Scores on 8 questions are a rough guide only.'), h('li', null, 'Limitations: the forms are unvalidated, and a rise could come from practice, memory or teaching around the game. This game does not claim learning gains.')));
        const g = h('div', { class: 'tgrid' });
        [0, 1].forEach((i) => g.append(h('button', { class: 'secondary', html: icon('print', 18) + ' <span>Print Form ' + 'AB'[i] + ' + answers</span>', onclick: () => { A.play('click'); printSheet(sheets.quiz(i), 'Safety Check Form ' + 'AB'[i]); } })));
        pane.append(g);
      } else {
        const row = (label, btn) => h('div', { class: 'mrow' }, h('span', null, label), btn);
        pane.append(
          row('Mission 4 difficulty: ' + S.diff(), h('div', { class: 'tseg' }, ...['explorer', 'scientist', 'advanced'].map((d) => h('button', { class: 'chipbtn' + (S.diff() === d ? ' on' : ''), onclick: () => { S.setDiff(d); show('set'); } }, d[0].toUpperCase() + d.slice(1))))),
          row('Unlock Lab 1 without finishing Lab 0', h('button', { class: 'secondary', onclick: () => { S.teacherUnlock(); DW.track(DW.EVENTS.lab1unlocked, 'Lab 1 unlocked'); ui.toast('Lab 1 is unlocked on this device.', 'check'); show('set'); } }, S.lab1Unlocked() ? 'Unlocked' : 'Unlock')),
          row('Clear all saved progress on this device', h('button', { class: 'danger', onclick: () => confirmReset() }, 'Reset')),
          h('p', { class: 'jhint' }, 'Privacy: no names, accounts or personal data are collected. Optional anonymous counts (such as “mission completed”) are sent only if your browser’s Do Not Track is off.'));
      }
    }
    names.forEach(([k, l, ic]) => tabs.append(h('button', { 'data-k': k, role: 'tab', html: icon(ic, 18) + '<span>' + l + '</span>', onclick: () => { A.play('click'); show(k); } })));
    body.append(tabs, pane);
    ui.openModal('Teacher Mode', body, { cls: 'wide' });
    show('over');
  };

  function confirmReset() {
    const body = h('div', { class: 'menu' }, h('p', { class: 'center' }, 'Clear all Safety Academy progress, badges and journal on this device?'),
      h('div', { class: 'mbtns' }, h('button', { class: 'primary', onclick: () => ui.closeModal() }, 'Keep it'),
        h('button', { class: 'danger', onclick: () => { S.reset(); try { sessionStorage.removeItem('dw.hub'); } catch (e) { /* ignore */ } window.location.reload(); } }, 'Yes, reset')));
    ui.openModal('Reset progress?', body, { cls: 'small' });
  }
  T.reset = confirmReset;
})();
