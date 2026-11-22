/* Mission 6: Emergency Response Simulator. Four calm practice scenarios, three decisions each. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, art = DW.art;

  L0.missions[6] = async function (run) {
    const scr = L0.screen('l0m6', art.calmRoom('#3a8fa0')), st = scr.stage;
    const SC = D0.m6, done = {}; let firstOK = 0, steps = 0;
    ui._objs = SC.map((s) => s.title);

    const menu = L0.box(st, 'l0-emenu', 250, 130, 1100, 520);
    const stageBox = L0.box(st, 'l0-escene', 70, 140, 840, 472); stageBox.style.display = 'none';
    const tag = L0.box(st, 'l0-etag', 70, 112, 840, 34); tag.style.display = 'none';

    function renderMenu() {
      menu.style.display = ''; stageBox.style.display = 'none'; tag.style.display = 'none';
      const left = SC.filter((s) => !done[s.id]).length;
      menu.innerHTML = '<div class="l0-emenu-h"><b>PRACTICE ROOM</b><span>Choose a situation. These are only practice, and everyone is safe.</span></div>';
      const g = h('div', { class: 'l0-egrid' });
      SC.forEach((s, i) => {
        const b = h('button', { class: 'l0-ecard' + (done[s.id] ? ' done' : ''), onclick: () => { A.play('click'); play(s); }, html: '<i>' + icon(done[s.id] ? 'check' : s.icon, 44) + '</i><b>' + s.title + '</b><span>' + (done[s.id] ? 'Done. Tap to practise again.' : 'Tap to start') + '</span>' });
        g.append(b);
      });
      menu.append(g);
      ui.setProgress(SC.length - left, left ? left + ' situation' + (left > 1 ? 's' : '') + ' to practise' : 'All situations practised!');
      setTimeout(() => { const f = g.querySelector('button:not(.done)') || g.firstChild; f && f.focus({ preventScroll: true }); }, 60);
    }

    async function play(sc) {
      menu.style.display = 'none'; stageBox.style.display = ''; tag.style.display = '';
      tag.innerHTML = '<span>' + icon(sc.icon, 18) + ' PRACTICE: ' + sc.title.toUpperCase() + '</span>';
      let step = 0, allFirst = true;
      stageBox.innerHTML = art.emergScene(sc.kind, 0); A.play('whoosh');
      await L0.maya(sc.intro, 'neutral'); ui.hideDlg();
      for (let i = 0; i < sc.steps.length; i++) {
        const q = sc.steps[i];
        const r = await L0.ask({ stage: st, title: 'What would you do?', icon: sc.icon, q: q.q, opts: q.opts, where: 'right' });
        if (r.first) firstOK++; else allFirst = false; steps++;
        step++; stageBox.innerHTML = art.emergScene(sc.kind, Math.min(3, step));
        DW.fx.sparkleAt(stageBox, 8);
      }
      L0.journal(sc.j); done[sc.id] = true;
      await L0.maya(sc.end, allFirst ? 'celebrate' : 'happy'); ui.hideDlg();
      renderMenu();
    }

    await L0.enter(scr);
    L0.drosieFly(st, 1400, 690, ['Bzzz! Staying calm is the most important part.', 'Tell a grown-up, every time!', 'Practice makes you ready.']).classList.add('small');
    await L0.maya('Welcome to the Practice Room. Sometimes things go wrong in a lab. Good scientists stay calm, stay safe and tell an adult.', 'happy');
    await L0.maya('We will practise four situations. They are only practice. Take a breath, and think about the safest first step.', 'neutral');
    ui.hideDlg(); renderMenu();
    await L0.G(new Promise((res) => { const t = setInterval(() => { if (run.dead) clearInterval(t); else if (SC.every((s) => done[s.id])) { clearInterval(t); res(); } }, 300); }));
    await L0.sleep(400);
    await L0.maya('Spill, eye splash, broken glass and a fire alarm. You practised calm, safe first steps for all four. Well done.', 'celebrate'); ui.hideDlg();
    return L0.finish(run, { first: firstOK, total: steps, pass: L0.threshold(firstOK, steps), badge: 'emergency', jr: ['em-spill', 'em-eye', 'em-glass', 'em-fire'], text: 'You practised four emergency situations. The most important rule is always the same: stay calm and tell an adult.' });
  };
})();
