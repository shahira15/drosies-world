/* hub.js: the Lab Entrance. Glass doors, access terminal, holographic mission map, and the "lab lights up" celebration. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, S = DW.save, art = DW.art;
  const hub = (DW.hub = { scr: null, mapEl: null });

  function setHud() {
    ui.game.classList.add('l0', 'l0-hub');
    ui._objs = D0.missions.map((m) => m.title);
    ui.mTag.textContent = 'LAB 0 · SAFETY ACADEMY'; ui.mTitle.textContent = 'The Lab Entrance';
    ui.setProgress(S.doneCount(), S.doneCount() + ' of 7 missions complete');
    ui.setHudVisible(true); ui.btnHome.style.display = 'none';
    ui.setNav({ view: 'lab', scope: false });
  }

  hub.show = async function (celebrate) {
    L0.run = null; L0.removeAll(); ui.hideDlg(); ui.closeModal && ui.modal.classList.contains('on') && ui.closeModal();
    if (DW.lab) DW.lab.show(false);
    art.sfDefs(); setHud();
    const scr = (hub.scr = L0.screen('l0hub', art.entrance(), { cls: 'l0-hubscreen' })), st = scr.stage;
    const unlocked = S.lab1Unlocked();
    st.classList.toggle('lit', unlocked); st.classList.toggle('open', unlocked);

    /* hotspots */
    const term = L0.box(st, 'l0-hot l0-hot-term', 1160, 440, 200, 360, { role: 'button', tabindex: '0', 'aria-label': 'Access terminal. Opens the mission map.' });
    term.innerHTML = '<span class="l0-hot-lbl">' + icon('map', 18) + ' Mission map</span>';
    const door = L0.box(st, 'l0-hot l0-hot-door', 596, 346, 408, 388, { role: 'button', tabindex: '0', 'aria-label': unlocked ? 'Lab doors are open. Enter Lab 1.' : 'Lab doors are locked until training is done.' });
    const act = () => { A.play('click'); openMap(); };
    const doorAct = () => { A.play('click'); if (S.lab1Unlocked()) hub.startLab1(); else { A.play('nope'); ui.toast('The doors unlock when you finish the Safety Academy.', 'lock', 3000); } };
    const key = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
    term.addEventListener('click', act); term.addEventListener('keydown', key(act));
    door.addEventListener('click', doorAct); door.addEventListener('keydown', key(doorAct));

    /* bottom controls */
    const next = S.nextMission();
    const bar = L0.box(st, 'l0-hubbar', 640, 770, 320, 84);
    bar.append(h('button', { class: 'primary big', html: icon('map', 24) + ' <span>' + (next === 1 && !S.doneCount() ? 'Start training' : next ? 'Mission map' : 'Mission map') + '</span>', onclick: act }));
    const side = L0.box(st, 'l0-hubside', 1010, 790, 560, 66);
    side.append(
      h('button', { class: 'chipbtn', html: icon('clipboard', 18) + ' For teachers', onclick: () => { A.play('click'); DW.teacher.open(); } }),
      h('button', { class: 'chipbtn', html: icon('book', 18) + ' Safety Journal', onclick: () => { A.play('click'); ui.openJournal('safety'); } }));
    if (unlocked) hub.addGo();
    hub.drosie = L0.drosieFly(st, 300, 300, ['Bzzz! Tap the glowing terminal to see the mission map.', 'Training first, discoveries second. That is how real scientists do it!', 'The doors open when you finish all seven missions.', 'I love the lab. But I always wear my goggles. Even on a fly-by!']);
    hub.drosie.classList.add('flyin');

    ui.setBodyClass('l0-hub', true);
    await ui.fade(true, 200); DW.screens.open(scr.el); await ui.fade(false, 650);

    if (celebrate) { await hub.celebrate(); return; }
    if (!S.seenIntro()) { S.markIntro(); await hub.intro(); }
    else {
      const n = S.doneCount();
      if (!n) L0.tip('maya', 'Welcome, future scientist! Before we make our first discovery, let\u2019s learn how scientists stay safe!', 'happy', 6000);
      else if (unlocked) L0.tip('maya', 'The lab is open! Go on in whenever you are ready, or replay any mission.', 'happy', 5500);
      else L0.tip('maya', 'Welcome back! Mission ' + S.nextMission() + ' is next on the map.', 'neutral', 5200);

    }
  };

  hub.addGo = function () {
    const st = hub.scr.stage; if (st.querySelector('.l0-doorgo')) return;
    const go = L0.box(st, 'l0-doorgo', 668, 590, 264, 90);
    go.append(h('button', { class: 'primary big', html: icon('play', 24) + ' <span>Enter Lab 1</span>', onclick: () => { A.play('click'); hub.startLab1(); } }));
  };

  /* first-time story intro (skippable) */
  hub.intro = async function () {
    let skipped = false; const off = DW.bus.on('skip', () => { skipped = true; });
    ui.cine(true);
    const wait = (p) => Promise.race([p, DW.bus.wait('skip')]);
    await wait(DW.sleep(1400));
    if (!skipped) { await wait(ui.say('maya', 'Welcome, future scientist! Before we make our first discovery, let’s learn how scientists stay safe!', { state: 'happy' })); }
    if (!skipped) { await wait(ui.say('drosie', 'Bzzz! Hi! I wanted to dive right into the lab, but Dr. Maya says training comes first.', { state: 'happy' })); }
    if (!skipped) { await wait(ui.say('maya', 'The doors will open when you finish seven short missions. Tap the glowing terminal to see them.', { state: 'neutral' })); }
    off(); ui.cine(false); ui.hideDlg();
    hub.pulseTerminal();
  };
  hub.pulseTerminal = function () { const t = hub.scr && hub.scr.stage.querySelector('.l0-hot-term'); if (t) { t.classList.add('call'); setTimeout(() => t.classList.remove('call'), 7000); } };

  /* ---------- holographic mission map ---------- */
  function openMap() {
    const st = hub.scr.stage; closeMap();
    const pts = [[170, 560], [370, 380], [590, 550], [820, 370], [1040, 550], [1240, 380], [1430, 550]];
    const ov = (hub.mapEl = h('div', { class: 'l0-map l0-overlay', role: 'dialog', 'aria-label': 'Holographic mission map' }));
    L0.pos(ov, 60, 140, 1480, 560);
    let path = 'M' + pts.map((p) => p.join(' ')).join(' L');
    const svg = '<svg viewBox="0 0 1480 560" class="l0-map-svg" aria-hidden="true"><defs><pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#6cf0e4" stroke-opacity=".12" stroke-width="2"/></pattern></defs><rect width="1480" height="560" rx="28" fill="rgba(6,24,36,.92)" stroke="#6cf0e4" stroke-opacity=".6" stroke-width="3"/><rect width="1480" height="560" rx="28" fill="url(#mapgrid)"/>' +
      '<g transform="translate(-60 -140)"><path d="' + path.replace(/M|L/g, (m) => m) + '" fill="none" stroke="#6cf0e4" stroke-opacity=".25" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="' + path + '" fill="none" stroke="#6cf0e4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 16" class="ringdash"/></g></svg>';
    ov.innerHTML = svg;
    ov.append(h('div', { class: 'l0-map-h' }, h('b', null, 'MISSION MAP'), h('span', null, 'Pick a mission. Each one unlocks the next.')));
    const cls = h('button', { class: 'hbtn small l0-map-x', 'aria-label': 'Close map', html: icon('close', 20), onclick: () => { A.play('click'); closeMap(); } });
    ov.append(cls);
    D0.missions.forEach((m, i) => {
      const n = i + 1, done = S.isDone(n), open = S.unlocked(n);
      const f = S.firstTry(n);
      const nb = h('button', { class: 'l0-node ' + (done ? 'done' : open ? 'open' : 'locked'), 'aria-label': 'Mission ' + n + ': ' + m.title + (done ? ', complete' : open ? '' : ', locked') });
      nb.innerHTML = '<span class="l0-node-c">' + icon(done ? 'check' : open ? m.icon : 'lock', 34) + '<i>' + n + '</i></span><b>' + m.title + '</b><em>' + (done ? (f ? 'Replay · best ' + f.first + '/' + f.total : 'Replay') : open ? '~' + m.mins + ' min' : 'Locked') + '</em>';
      nb.style.left = ((pts[i][0] - 60 - 90) / 14.8) + '%'; nb.style.top = ((pts[i][1] - 140 - 62) / 5.6) + '%'; nb.style.width = (180 / 14.8) + '%'; nb.style.height = (150 / 5.6) + '%';
      nb.addEventListener('click', () => {
        if (!open) { A.play('nope'); ui.toast('Finish Mission ' + (n - 1) + ' first.', 'lock', 2400); return; }
        A.play('success'); closeMap(); L0.start(n);
      });
      ov.append(nb);
    });
    st.append(ov); A.play('whoosh');
    setTimeout(() => { const f = ov.querySelector('.l0-node.open') || cls; f.focus({ preventScroll: true }); }, 120);
  }
  function closeMap() { if (hub.mapEl) { hub.mapEl.remove(); hub.mapEl = null; } }
  hub.openMap = openMap;

  /* ---------- lab lights up ---------- */
  hub.celebrate = async function () {
    const st = hub.scr.stage;
    st.classList.remove('lit', 'open'); ui.hideDlg();
    S.setLab0Complete(); DW.track(DW.EVENTS.l0complete, 'Lab 0 completed'); DW.track(DW.EVENTS.lab1unlocked, 'Lab 1 unlocked');
    await DW.sleep(700);
    A.play('whoosh'); st.classList.add('lit'); DW.fx.sparkleAt(st.querySelector('.l0-hot-door'), 24);
    await DW.sleep(1300);
    A.play('zap'); st.classList.add('open'); hub.drosie.classList.add('dance');
    DW.fx.confetti(true);
    await DW.sleep(1200);
    await ui.say('maya', 'You did it! The lab lights are on and the doors are open. You are ready to work like a real scientist.', { state: 'celebrate' });
    await ui.say('drosie', 'Zoom zoom zoom! I’ve got my goggles on! Can we go in now?', { state: 'celebrate' });
    ui.hideDlg();
    await ui.awardBadge('safety'); L0.journal('cert');
    hub.addGo();
    await hub.certificate();
  };

  hub.certificate = function () {
    return new Promise((resolve) => {
      const b = D0.badges.find((x) => x.id === 'safety');
      const card = h('div', { class: 'l0-pop' }, h('div', { class: 'l0-cert' },
        h('div', { class: 'ray' }), h('div', { class: 'bsvg', html: ui.badgeSVG(b) }),
        h('small', null, 'GAME ACHIEVEMENT'), h('h2', null, 'CERTIFIED LAB READY'), h('h3', null, 'SAFETY SCIENTIST'),
        h('p', null, 'You finished all seven Safety Academy missions!'),
        h('p', { class: 'l0-disc' }, 'This is a game achievement. It is not an official certification or a replacement for real safety training. Always follow your teacher and your school’s rules.'),
        h('div', { class: 'l0-res-btns' },
          h('button', { class: 'primary', html: icon('play', 18) + ' <span>Enter Lab 1</span>', onclick: () => { card.remove(); resolve(); hub.startLab1(); } }),
          h('button', { class: 'secondary', html: icon('home', 18) + ' <span>Stay at the entrance</span>', onclick: () => { card.remove(); resolve(); } }))));
      ui.game.append(card);
      setTimeout(() => card.querySelector('button').focus(), 300);
    });
  };

  /* ---------- go to Lab 1 (optional refresher first) ---------- */
  hub.startLab1 = async function () {
    if (!S.lab1Unlocked()) return;
    const st = hub.scr.stage;
    const want = await new Promise((res) => {
      const body = h('div', { class: 'menu' },
        h('p', { class: 'center' }, 'Want a quick 3-question safety refresher before Lab 1?'),
        h('div', { class: 'mbtns' },
          h('button', { class: 'primary', html: 'Yes, quick refresher', onclick: () => { ui.closeModal(); res(true); } }),
          h('button', { class: 'secondary', html: 'No thanks, go in', onclick: () => { ui.closeModal(); res(false); } })));
      ui.openModal('Before you go in', body, { cls: 'small', noClose: true });
    });
    if (want) {
      L0.cur = hub.scr;
      const qs = DW.shuffle(D0.m7).slice(0, 3).map((v) => v[Math.floor(Math.random() * 2)]);
      DW.track(DW.EVENTS.refresher, 'Refresher taken');
      const f = await L0.miniQuiz(qs, st);
      await ui.say('maya', f === 3 ? 'All three. You remembered everything!' : 'Good thinking. You can always replay the missions from the map.', { state: 'happy' });
      ui.hideDlg();
    }
    ui.game.classList.remove('l0', 'l0-hub'); ui.setBodyClass('l0-hub', false);
    await ui.fade(true, 500); L0.removeAll(); ui.hideDlg();
    DW.track(DW.EVENTS.start, 'Game started');
    DW.startLab1();
  };

  /* ---------- exit to entrance from anywhere ---------- */
  hub.home = function () {
    if (ui.game.classList.contains('l0-hub') && hub.scr && hub.scr.el.isConnected) return;
    const inLab0 = ui.game.classList.contains('l0');
    const body = h('div', { class: 'menu' },
      h('p', { class: 'center' }, inLab0 ? 'Go back to the Lab Entrance? Missions you finished are saved.' : 'Go back to the Lab Entrance? Lab 1 starts again from the beginning next time.'),
      h('div', { class: 'mbtns' },
        h('button', { class: 'primary', html: 'Keep playing', onclick: () => ui.closeModal() }),
        h('button', { class: 'secondary', html: icon('home', 18) + ' Lab Entrance', onclick: () => {
          ui.closeModal();
          if (inLab0) L0.cancel(); else { try { sessionStorage.setItem('dw.hub', '1'); } catch (e) { /* ignore */ } window.location.reload(); }
        } })));
    ui.openModal('Lab Entrance', body, { cls: 'small' });
  };
  DW.bus.on('home', hub.home);

  hub.open = function () { return hub.show(false); };
})();
