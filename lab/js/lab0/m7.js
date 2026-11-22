/* Mission 7: Safety Scientist Challenge. 8 questions (random variants), feedback + retry; pass at 6 of 8 on the first try. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, S = DW.save, art = DW.art;
  const TOPIC = { goggles: 'Goggles (Mission 2)', coat: 'Lab coats (Mission 2)', gloves: 'Gloves (Mission 2)', hair: 'Tied-back hair (Mission 2)', shoes: 'Closed shoes (Mission 2)', hazard: 'Spotting hazards (Mission 3)', spill: 'Spills (Mission 3 and 6)', emergency: 'Emergencies (Mission 6)' };
  const scene = (q) => q.scene === 'goggles' ? art.demo('goggles', true) : q.scene === 'coat' ? art.demo('coat', true) : q.scene === 'eye' ? art.emergScene('eye', 1) : q.scene === 'fire' ? art.emergScene('fire', 1) : art.ruleScene(q.scene);

  L0.missions[7] = async function (run) {
    const scr = L0.screen('l0m7', art.calmRoom('#c9a62a')), st = scr.stage;
    const banner = L0.box(st, 'l0-ban', 400, 112, 800, 56); banner.innerHTML = '<span>' + icon('medal', 24) + ' SAFETY SCIENTIST CHALLENGE</span>';
    const pips = L0.box(st, 'l0-pips', 400, 176, 800, 22);
    ui._objs = D0.m7.map((_, i) => 'Question ' + (i + 1));
    await L0.enter(scr);
    L0.drosieFly(st, 90, 520, ['Bzzz! You know this. Take your time.', 'Wrong answer? No worries, you can try again.']).classList.add('small');
    DW.track(DW.EVENTS.assessStart, 'Assessment started');
    await L0.maya('This is the Safety Scientist Challenge. Eight questions about everything you practised. If you pick a wrong answer, you will see why and can try again.', 'happy');
    await L0.maya('Get at least six right on the first try to light up the lab. If not, we will review together and you can try again with new questions.', 'neutral');
    ui.hideDlg();

    for (let attempt = 1; ; attempt++) {
      const qs = D0.m7.map((v) => v[Math.floor(Math.random() * v.length)]);
      const wrongTopics = []; let first = 0;
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        pips.innerHTML = qs.map((_, k) => '<i class="' + (k < i ? 'd' : k === i ? 'c' : '') + '"></i>').join('');
        ui.setProgress(i, 'Question ' + (i + 1) + ' of ' + qs.length);
        const r = await L0.ask({ stage: st, title: 'Question ' + (i + 1) + ' of ' + qs.length, icon: 'question', scene: scene(q), q: q.q, opts: q.opts.map((t, k) => [t, k === q.ok ? 1 : 0, q.why]), where: 'center' });
        if (r.first) first++; else wrongTopics.push(q.topic);
      }
      ui.setProgress(qs.length, 'Challenge complete');
      const total = qs.length;
      if (first >= D0.m7pass) {
        DW.track(DW.EVENTS.assessDone, 'Assessment completed');
        S.complete(7, { first, total }); DW.track(DW.EVENTS.l0mission(7), 'Lab 0 mission 7 completed');
        await L0.maya('You got ' + first + ' of ' + total + ' on the first try. You are a Safety Scientist! Come, let us light up the lab.', 'celebrate'); ui.hideDlg();
        return 'hub-final';
      }
      /* review, then retry with fresh questions */
      const topics = [...new Set(wrongTopics)].map((t) => TOPIC[t] || t);
      const choice = await L0.G(new Promise((res) => {
        const card = h('div', { class: 'l0-pop' }, h('div', { class: 'l0-res' },
          h('small', null, 'ALMOST THERE'), h('h2', null, first + ' of ' + total + ' on the first try'),
          h('p', { class: 'l0-res-p' }, 'You need ' + D0.m7pass + '. Learning from mistakes is how scientists get better. Let’s look at what to review:'),
          h('ul', { class: 'l0-review' }, ...topics.map((t) => h('li', null, t))),
          h('div', { class: 'l0-res-btns' },
            h('button', { class: 'primary', html: icon('restart', 18) + ' <span>Try again with new questions</span>', onclick: () => { card.remove(); A.play('click'); res('again'); } }),
            h('button', { class: 'secondary', html: icon('home', 18) + ' <span>Review missions</span>', onclick: () => { card.remove(); A.play('click'); res('hub'); } }))));
        ui.game.append(card); setTimeout(() => card.querySelector('button').focus(), 250);
      }));
      if (choice === 'hub') return 'hub';
      await L0.maya('New questions coming up. Think about why each answer is the safe one.', 'happy'); ui.hideDlg();
    }
  };
})();
