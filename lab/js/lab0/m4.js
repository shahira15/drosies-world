/* Mission 4: Gear for the Job. Plan PPE for each task. Explorer / Scientist / Advanced modes. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, S = DW.save, art = DW.art;

  L0.missions[4] = async function (run) {
    const scr = L0.screen('l0m4', art.terminalRoom()), st = scr.stage, M = D0.m4;
    const term = L0.box(st, 'l0-term', 120, 118, 1360, 560);
    await L0.enter(scr);
    L0.drosieFly(st, 1440, 690, ['Bzzz! Ask yourself: what could go wrong in this job?', 'Some jobs need no goggles at all!', 'Gear helps. A grown-up in charge helps even more.']).classList.add('small');
    await L0.maya('Welcome to the planning terminal. Real scientists ask three things: what is the job, what could go wrong, and what helps me stay safe?', 'happy');
    await L0.maya('Here is the big idea. PPE is a helper. It does not make a hazardous job safe by itself.', 'think');
    ui.hideDlg();

    /* difficulty */
    const mode = await L0.G(new Promise((res) => {
      term.innerHTML = '';
      term.append(h('div', { class: 'l0-term-h' }, h('b', null, 'MISSION PLANNER'), h('span', null, 'Choose how you want to play')));
      const row = h('div', { class: 'l0-modes' });
      Object.keys(M.modes).forEach((k) => {
        const m = M.modes[k];
        row.append(h('button', { class: 'l0-mode' + (S.diff() === k ? ' on' : ''), onclick: () => { A.play('success'); S.setDiff(k); res(k); } },
          h('i', { html: icon(k === 'explorer' ? 'sparkle' : k === 'scientist' ? 'lens' : 'medal', 40) }), h('b', null, m.name), h('span', null, m.blurb)));
      });
      term.append(row);
      setTimeout(() => { const f = row.querySelector('.on') || row.firstChild; f.focus(); }, 80);
    }));
    const cfg = M.modes[mode];
    ui._objs = cfg.tasks.map((_, i) => 'Task ' + (i + 1));
    ui.setProgress(0, 'Plan ' + cfg.tasks.length + ' jobs (' + cfg.name + ' mode)');

    let firstOK = 0;
    for (let i = 0; i < cfg.tasks.length; i++) {
      const t = M.tasks[cfg.tasks[i]];
      const ok = await doTask(t, i);
      if (ok) firstOK++;
      ui.setProgress(i + 1, i + 1 === cfg.tasks.length ? 'All jobs planned!' : 'Job ' + (i + 2) + ' of ' + cfg.tasks.length);
    }

    function head(i, t) {
      term.innerHTML = '';
      term.append(h('div', { class: 'l0-term-h' }, h('b', null, 'JOB ' + (i + 1) + ' OF ' + cfg.tasks.length), h('span', null, cfg.name + ' mode')));
    }
    function taskCard(t) {
      return h('div', { class: 'l0-taskcard' }, h('i', { html: icon(t.icon, 44) }), h('b', null, t.title), h('p', null, t.sub));
    }
    function chips(label, opts, correct) {
      return new Promise((res) => {
        let first = true;
        const box = h('div', { class: 'l0-step' }, h('p', { class: 'l0-q' }, label));
        const row = h('div', { class: 'l0-chips' }); const fb = h('div', { class: 'l0-fb' });
        opts.forEach(([k, name]) => {
          const b = h('button', { class: 'l0-chip', onclick: () => {
            if (k === correct) { A.play('success'); b.classList.add('ok'); row.classList.add('locked'); fb.className = 'l0-fb ok on'; fb.innerHTML = '<b>' + L0.pick('good') + '</b>'; setTimeout(() => res(first), 900); }
            else { first = false; A.play('nope'); b.classList.add('no'); b.disabled = true; fb.className = 'l0-fb no on'; fb.innerHTML = '<b>' + L0.pick('again') + '</b> Think about what could really happen in this job.'; }
          } }, k === 'none' ? 'Very low hazard' : name);
          row.append(b);
        });
        box.append(row, fb); term._right.append(box);
        const f = row.firstChild; f && f.focus();
      });
    }
    async function doTask(t, i) {
      head(i, t);
      const body = h('div', { class: 'l0-body' }); const right = h('div', { class: 'l0-right' });
      body.append(taskCard(t), right); term.append(body); term._right = right;
      let first = true;
      A.play('whoosh');
      if (t.stop) {
        const r = await L0.ask({ stage: st, title: 'Unknown spill', icon: 'alert', q: 'What should you do?', opts: [['Step away, warn others and tell the teacher', 1, 'Yes. No gear makes this a job for you. An adult decides what to do.'], ['Put on gloves and goggles and clean it up', 0, 'PPE does not make this safe. You do not know what the liquid is.'], ['Use lots of paper towels to soak it up', 0, 'You do not touch unknown spills.']], where: 'center' });
        L0.journal('plan-ppe'); return r.first;
      }
      if (cfg.hazardQ) { const f = await chips('What is the main hazard in this job?', M.hazardOpts, t.hazard); if (!f) first = false; L0.journal('plan-hazard'); }
      /* gear step */
      right.innerHTML = ''; right.append(h('p', { class: 'l0-q' }, 'Choose the gear for this job.'));
      const chosen = new Set(); let rate = null, adult = null;
      const grid = h('div', { class: 'l0-gear' });
      M.gear.forEach((g) => {
        const b = h('button', { class: 'l0-gcard', 'aria-pressed': 'false', title: g.name, html: art.gear(g.id, 70) + '<span>' + g.name + '</span>', onclick: () => {
          A.play('click'); if (chosen.has(g.id)) chosen.delete(g.id); else chosen.add(g.id); b.classList.toggle('on', chosen.has(g.id)); b.setAttribute('aria-pressed', String(chosen.has(g.id)));
        } });
        grid.append(b);
      });
      right.append(grid);
      if (cfg.rate) {
        const rr = h('div', { class: 'l0-rate' }, h('b', null, 'Risk level'));
        ['Low', 'Medium', 'High'].forEach((r) => { const b = h('button', { class: 'l0-seg2', onclick: () => { A.play('click'); rate = r.toLowerCase(); rr.querySelectorAll('.l0-seg2').forEach((x) => x.classList.toggle('on', x === b)); } }, r); rr.append(b); });
        const aa = h('div', { class: 'l0-rate' }, h('b', null, 'Does an adult need to run or watch this?'));
        [['Yes', true], ['No', false]].forEach(([r, v]) => { const b = h('button', { class: 'l0-seg2', onclick: () => { A.play('click'); adult = v; aa.querySelectorAll('.l0-seg2').forEach((x) => x.classList.toggle('on', x === b)); } }, r); aa.append(b); });
        right.append(rr, aa);
      }
      const fb = h('div', { class: 'l0-fb' }); const check = h('button', { class: 'primary', html: icon('check', 20) + ' <span>Check my plan</span>' });
      right.append(fb, h('div', { class: 'l0-term-btns' }, check));
      await L0.G(new Promise((res) => {
        check.addEventListener('click', () => {
          const miss = [], extra = [];
          M.gear.forEach((g) => { const e = t.gear[g.id]; const sel = chosen.has(g.id); if (e === 'need' && !sel) miss.push(g.name); if (e === 'skip' && sel) extra.push(g.name); });
          const problems = [];
          if (miss.length) problems.push('Missing: ' + miss.join(', ') + '.');
          if (extra.length) problems.push('Not needed for this job: ' + extra.join(', ') + '.');
          if (cfg.rate) { if (rate === null || adult === null) problems.push('Pick a risk level and say whether an adult is needed.'); else if (rate !== t.risk) problems.push('Check the risk level again.'); if (adult !== null && adult !== t.adult) problems.push(t.adult ? 'This job needs an adult in charge.' : 'This job does not need an adult in charge.'); }
          const real = problems.filter(Boolean);
          if (!real.length) { A.play('success'); DW.fx.sparkleAt(check, 14); res(); return; }
          first = false; A.play('nope'); fb.className = 'l0-fb no on'; fb.innerHTML = '<b>' + L0.pick('again') + '</b> '; const sp = h('span'); sp.textContent = real.join(' '); fb.append(sp);
          M.gear.forEach(() => {});
        });
      }));
      /* explain */
      right.innerHTML = '';
      const note = h('div', { class: 'l0-explain' }, h('b', { html: icon('check', 22) + ' Good plan' }), h('p', null, t.why));
      if (t.adult) note.append(h('div', { class: 'l0-adult', html: icon('user', 20) + '<span>An adult must run or watch this job. Gear alone is not enough.</span>' }));
      if (Object.values(t.gear).includes('ask')) note.append(h('div', { class: 'l0-adult ask', html: icon('question', 20) + '<span>Some choices depend on your teacher’s rules. Always ask.</span>' }));
      const cont = h('button', { class: 'primary', html: 'Next ' + icon('right', 18) }); note.append(h('div', { class: 'l0-term-btns' }, cont));
      right.append(note); L0.journal('plan-ppe');
      await L0.G(new Promise((res) => cont.addEventListener('click', () => { A.play('click'); res(); })));
      return first;
    }

    L0.journal('plan-hazard'); L0.journal('plan-ppe');
    const total = cfg.tasks.length;
    await L0.maya('Great planning. Remember: look at the hazard first, then pick gear, and always listen to the adult in charge.', 'celebrate');
    ui.hideDlg();
    return L0.finish(run, { first: firstOK, total, pass: L0.threshold(firstOK, total), badge: 'planner', jr: ['plan-hazard', 'plan-ppe'], text: 'You planned gear for ' + total + ' jobs in ' + cfg.name + ' mode. Try a harder mode next time!' });
  };
})();
