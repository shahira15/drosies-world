/* main.js: boot, loading screen, title, cinematic intro, and the seven missions of Lab 1 (Meet Your Fruit Fly).
 * Missions are written as plain async functions so the flow reads top to bottom. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, A = DW.audio, ui = DW.ui, Lab = DW.lab, S = DW.scope, ST = DW.state;
  const M = DW.data.missions;
  const ctx = { reserved: new Set(['stereo']), hint: null, screen: null, view: 'lab', hintLvl: 0, idle: null };

  /* ---------- helpers ---------- */
  let tipToken = 0;
  function tip(text, state, ms) { // short Maya line that does not block and fades away
    const t = ++tipToken; ui.say('maya', text, { wait: false, state: state || 'think' });
    setTimeout(() => { if (t === tipToken && ui.dlg.classList.contains('on') && !ui._adv) ui.hideDlg(); }, ms || 7000);
  }
  const say = (t, state) => ui.say('maya', t, { state });
  const sayD = (t, state) => ui.say('drosie', t, { state });
  function track(n) { DW.track(DW.EVENTS.mission(n), 'Mission ' + n + ' completed'); }
  function setMission(i, done) { ST.mission = i + 1; ui.setMission(M[i], done || 0); }

  async function banner(title, sub) {
    const b = h('div', { class: 'banner' }, h('div', { class: 'b-ic', html: icon('star', 30) }), h('div', null, h('small', null, 'MISSION COMPLETE'), h('b', null, title)));
    ui.game.append(b); A.play('success'); DW.fx.confetti(false);
    await DW.sleep(2200); b.classList.add('out'); await DW.sleep(400); b.remove();
  }

  function showFact(d) {
    const old = DW.$('.fact', ui.game); old && old.remove();
    const f = h('div', { class: 'fact', role: 'status', html: '<div class="fic">' + icon(d.icon || 'sparkle', 24) + '</div><div><small>DISCOVERY</small><b>' + d.title + '</b><p>' + d.text + '</p></div>' });
    f.onclick = () => f.remove(); ui.game.append(f);
    A.speak(d.title + '. ' + d.text, 'maya');
    setTimeout(() => { f.classList.add('out'); setTimeout(() => f.remove(), 400); }, 7500);
  }

  async function discover(id) {
    const d = DW.data.discoveries[id]; if (!d) return;
    const first = !ST.discoveries.has(id); ST.discoveries.add(id);
    if (first) { A.play('sparkle'); const c = Lab.centerOf(id); DW.fx.burst(c.x, c.y, { n: 16, speed: 4, life: 45 }); }
    if (id === 'notebook') ui.addItem('notebook');
    showFact(d);
    if (first) ui.toast('New discovery! ' + ST.discoveries.size + ' of ' + Object.keys(DW.data.discoveries).length, 'sparkle');
    if (ST.discoveries.size >= 5 && !ST.badges.has('explorer')) { await DW.sleep(1200); await ui.awardBadge('explorer'); }
  }

  /* all lab taps that are not part of a mission step become little discoveries */
  DW.bus.on('lab:pick', (id) => {
    if (id === 'lamp') { ctx.lampTaps = (ctx.lampTaps || 0) + 1; if (ctx.lampTaps === 1) ui.toast('Click the lamp again to switch it back on!', 'bulb'); return; }
    if (id === 'stereo' && ST.scopeUnlocked && !ctx.reserved.has('stereo')) { DW.bus.emit('nav', 'scope'); return; }
    if (ctx.reserved.has(id)) return;
    if (id === 'compound') tip('That is a compound microscope. It is for thin slides. Our stereomicroscope has TWO eyepieces!', 'think');
    discover(id);
  });
  DW.bus.on('hint', () => { A.play('sparkle'); ST.hintsUsed++; ctx.hint && ctx.hint(); });

  /* ---------- navigation between lab and the workstation ---------- */
  DW.bus.on('nav', async (where) => {
    if (where === ctx.view || ctx.navBusy || !ST.scopeUnlocked) return;
    if (where === 'scope' && !ctx.screen) { ui.toast('Finish the lab part first!', 'bulb'); return; }
    ctx.navBusy = true; A.play('whoosh');
    await ui.fade(true, 260);
    if (where === 'lab') {
      if (ctx.screen) { ctx.screen.el.classList.remove('in', 'on'); }
      ui.hideDlg(); Lab.show(true); Lab.enable(true); ctx.view = 'lab'; ui.setNav({ view: 'lab' });
    } else {
      Lab.show(false); Lab.enable(false); ui.hideDlg();
      ctx.screen.el.classList.add('on', 'in'); ctx.view = 'scope'; ui.setNav({ view: 'scope' });
      if (ctx.screen === DW.anatomy) { setTimeout(DW.anatomy.updatePins, 50); setTimeout(DW.anatomy.updatePins, 600); };
    }
    await ui.fade(false, 380); ctx.navBusy = false;
  });

  async function enterWorkstation(openFn) {
    Lab.enable(false); ui.hideDlg();
    const c = await Lab.zoomInto('stereo', 800); A.play('whoosh');
    await ui.iris(c.x, c.y, false, 360);
    Lab.show(false); Lab.resetZoom();
    const p = openFn(); ctx.view = 'scope';
    await DW.sleep(120);
    await ui.iris(c.x, c.y, true, 700);
    return { p };
  }
  async function exitWorkstation() {
    A.play('whooshBack'); await ui.fade(true, 350);
    ui.hideDlg();
    if (ctx.screen) ctx.screen.el.classList.remove('in', 'on');
    Lab.show(true); Lab.enable(true); ctx.view = 'lab'; ui.setNav({ view: 'lab' });
    await ui.fade(false, 500);
  }
  async function swapScreen(mod, openFn) {
    await ui.fade(true, 380); ui.hideDlg();
    if (ctx.screen) ctx.screen.el.classList.remove('in', 'on');
    ctx.screen = mod; const p = openFn(); ctx.view = 'scope';
    await DW.sleep(80); await ui.fade(false, 500);
    return { p };
  }

  /* ---------- Loading + title ---------- */
  async function boot() {
    const root = DW.$('#app');
    A.on.sfx = DW.store.get('sfx', true); A.on.music = DW.store.get('music', true); A.on.narr = DW.store.get('narr', true);

    const load = h('div', { class: 'loading' },
      h('div', { class: 'ld-fly', html: DW.art.drosieFly() }),
      h('div', { class: 'ld-title' }, h('small', null, "DROSIE'S WORLD"), h('b', null, 'The Secret Fly Lab')),
      h('div', { class: 'ld-bar' }, h('i')), h('div', { class: 'ld-msg' }, 'Warming up the lab lights…'));
    root.append(load);
    const bar = load.querySelector('.ld-bar i'), msg = load.querySelector('.ld-msg');
    const prog = (p, t) => { bar.style.width = Math.round(p * 100) + '%'; if (t) msg.textContent = t; };
    const t0 = performance.now();
    prog(0.1);
    await DW.sleep(30);
    ui.init(root);                       // builds HUD + dialogue
    prog(0.3, 'Painting the laboratory…');
    await DW.sleep(30);
    Lab.build(ui.labStage);              // draws all parallax layers
    prog(0.55, 'Waking up the fruit flies…');
    await DW.sleep(30);
    S.build();                           // microscope workstation
    await DW.assets.load((p) => prog(0.55 + p * 0.3, 'Loading character art…'));
    prog(0.95, 'Polishing the microscope…');
    const wait = 1500 - (performance.now() - t0); if (wait > 0) await DW.sleep(wait);
    prog(1, 'Ready!'); await DW.sleep(250);
    load.classList.add('out'); setTimeout(() => load.remove(), 600);
    title();
  }

  function title() {
    Lab.show(true); Lab.enable(false); Lab.free = false; Lab.snapTo(1200);
    ui.setHudVisible(false); ui.fade(false, 700);
    const el = h('div', { class: 'title' },
      h('div', { class: 't-logo' }, h('small', null, "DROSIE'S WORLD PRESENTS"), h('h1', null, 'The Secret', h('br'), 'Fly Lab'), h('p', null, 'Lab 0 · Safety Academy', h('br'), 'Lab 1 · Meet Your Fruit Fly')),
      h('button', { class: 'primary big', id: 'playBtn', html: icon('play', 24) + ' <span>' + (sessionStorage.getItem('dw.hub') ? 'Back to the Lab Entrance' : 'Play') + '</span>' }),
      h('div', { class: 't-opts' },
        h('button', { class: 'chipbtn', id: 'tFs', html: icon('full', 18) + ' Fullscreen' }),
        h('button', { class: 'chipbtn', id: 'tSnd', 'aria-pressed': String(A.on.sfx), html: icon('sound', 18) + ' Sound' })),
      h('p', { class: 't-foot' }, 'Ages 5 to 8 · Free · No sign-in · We do not collect anything about you'));
    ui.game.append(el);
    if (!ui.fullscreenOK) el.querySelector('#tFs').style.display = 'none';
    el.querySelector('#tFs').onclick = ui.toggleFullscreen;
    el.querySelector('#tSnd').onclick = (e) => { const v = !(A.on.sfx || A.on.music); A.setSfx(v); A.setMusic(v); A.setNarr(v); DW.store.set('sfx', v); DW.store.set('music', v); DW.store.set('narr', v); e.currentTarget.setAttribute('aria-pressed', v); e.currentTarget.classList.toggle('off', !v); };
    let alive = true;
    (function drift(t) { if (!alive) return; Lab.target = (Math.sin(t / 7000) * 0.5 + 0.5) * Lab.max; Lab.cam += (Lab.target - Lab.cam) * 0.02; Lab.apply(); requestAnimationFrame(drift); })(0);
    el.querySelector('#playBtn').addEventListener('click', async () => {
      alive = false; A.init(); A.play('success');
      el.classList.add('out'); setTimeout(() => el.remove(), 700);
      try { await DW.hub.open(); } catch (err) { console.error(err); ui.toast('Oops, something went wrong. Try Restart in the menu.', 'bulb', 6000); }
    });
    el.querySelector('#playBtn').focus();
  }

  /* ---------- the game (Lab 1) ---------- */
  DW.startLab1 = () => { ui.btnHome.style.display = ''; play().catch((err) => { console.error(err); ui.toast('Oops, something went wrong. Try Restart in the menu.', 'bulb', 6000); }); };
  async function play() {
    await intro();
    await mission1(); await mission2(); await mission3(); await mission4();
    await mission5(); await mission6(); await mission7();
    await finale();
  }

  /* Cinematic introduction */
  async function intro() {
    let skipped = false; const off = DW.bus.on('skip', () => { skipped = true; });
    ui.cine(true); ui.setHudVisible(false); Lab.show(true); Lab.enable(false); Lab.cam = Lab.target = Lab.max; Lab.apply();
    await ui.fade(false, 900);
    const card = h('div', { class: 'cine-card' }, h('small', null, 'LAB 1'), h('b', null, 'Meet Your Fruit Fly'));
    ui.game.append(card);
    await Promise.race([DW.sleep(2200), DW.bus.wait('skip')]);
    card.classList.add('out');
    // slow cinematic pan across the whole lab
    const pan = DW.tween(7000, (k) => { if (skipped) return; Lab.cam = Lab.target = DW.lerp(Lab.max, 0, k); Lab.apply(); }, DW.ease.inOut);
    A.play('whoosh');
    await Promise.race([pan, DW.bus.wait('skip')]);
    card.remove(); off();
    Lab.snapTo(1000);
    await ui.fade(true, 250); await ui.fade(false, 350);
    ui.cine(false);
    DW.fx.dustOn = true;
    await DW.sleep(250);
    await say('Welcome to the Secret Fly Lab! I am Dr. Maya.', 'happy');
    await sayD('Bzzz! Hi! I am Drosie. I am a fruit fly, and I will fly with you!', 'happy');
    await say('We are going to learn how scientists look at tiny flies. Let us start by exploring the lab.', 'neutral');
  }

  /* MISSION 1: Welcome to the Secret Lab */
  async function mission1() {
    setMission(0, 0); ui.setHudVisible(true); ui.setNav({ view: 'lab', scope: false });
    Lab.free = true; Lab.enable(true); ctx.view = 'lab'; ctx.reserved = new Set(['stereo']);
    ui.hideDlg();
    ui.toast('Drag, use arrow keys, or press the arrows to look around', 'hand', 4200);
    // Step 1: explore (any tap on an object, or looking around)
    const cam0 = Lab.target; let explored = false;
    const watch = setInterval(() => { if (Math.abs(Lab.target - cam0) > 500) explored = true; }, 300);
    const onP = DW.bus.on('lab:pick', () => { explored = true; });
    while (!explored) await DW.sleep(300);
    clearInterval(watch); onP();
    ui.setProgress(1, 'Find the stereomicroscope'); A.play('ding');
    tip('Great exploring! Now find the stereomicroscope. It has TWO eyepieces, like two little telescopes.', 'happy', 9000);
    // Step 2: find the right instrument. Gentle hints escalate.
    ctx.hintLvl = 0;
    ctx.hint = () => {
      ctx.hintLvl++;
      if (ctx.hintLvl === 1) tip('A stereomicroscope has two eyepieces on top and a big open stage underneath.', 'think');
      else { Lab.panToObj('stereo'); Lab.hint('stereo', true); tip('Look over here! Something is glowing.', 'happy'); }
    };
    const idle = setTimeout(() => { Lab.hint('stereo', true); }, 45000);
    let tries = 0;
    for (;;) {
      const id = await DW.bus.wait('lab:pick');
      if (id === 'stereo') break;
      if (id === 'compound') continue; // already explained
      if (++tries % 4 === 0) tip('Keep looking! The one we want has two eyepieces.', 'think');
    }
    clearTimeout(idle); Lab.clearHints(); ctx.hint = null; ctx.reserved = new Set();
    A.play('success'); DW.fx.confetti(false); Lab.companionCheer();
    ui.addItem('stereo'); ST.foundScope = true; ST.scopeUnlocked = true; ui.setNav({ scope: true });
    ui.setProgress(2, 'Found it!');
    await say('Yes! That is the stereomicroscope! Two eyepieces, just like I said.', 'happy');
    track(1);
  }

  /* MISSION 2: Discover the Stereomicroscope */
  async function mission2() {
    ctx.reserved = new Set();
    const { p } = await (async () => { const r = await enterWorkstation(() => { ctx.screen = S; return S.runLearn(); }); setMission(1, 0); return r; })();
    ctx.hint = () => { S.hintLearn(); tip('Tap the glowing part!', 'think'); };
    await say('This special microscope helps us see tiny things in 3D!', 'happy');
    await say('Tap each part to learn its name. There are six!', 'neutral');
    ui.hideDlg();
    await p; ctx.hint = null;
    A.play('success');
    await say('You know all the parts! Great job. Next we need a fly to look at.', 'happy');
    track(2); await banner('Discover the Stereomicroscope');
  }

  /* MISSION 3: Prepare the specimen */
  async function mission3() {
    setMission(2, 0);
    await exitWorkstation();
    ctx.reserved = new Set(['vials', 'prep', 'stereo']);
    Lab.free = true; Lab.enable(true); Lab.panToObj('vials');
    await say('Time to get your fly! Fly cultures live in vials with food. Tap the vials.', 'neutral');
    ctx.hint = () => { Lab.panToObj('vials'); Lab.hint('vials', true); tip('The vials are on the bench, with little flies inside.', 'think'); };
    const idle1 = setTimeout(() => Lab.hint('vials', true), 25000);
    await DW.bus.wait('lab:pick', (id) => id === 'vials');
    clearTimeout(idle1); Lab.clearHints();
    ui.addItem('vial'); ui.setProgress(1, 'Put the flies on the pad'); DW.fx.confetti(false);
    ST.discoveries.add('vials');
    await say('You got a vial of fruit flies! To look closely, flies rest gently. Tap the sleepy-fly pad.', 'happy');
    Lab.panToObj('prep');
    ctx.hint = () => { Lab.panToObj('prep'); Lab.hint('prep', true); tip('The sleepy-fly pad is on the bench, next to the vials.', 'think'); };
    const idle2 = setTimeout(() => Lab.hint('prep', true), 22000);
    await DW.bus.wait('lab:pick', (id) => id === 'prep');
    clearTimeout(idle2); Lab.clearHints();
    // tip the flies onto the pad
    A.play('pop'); const c = Lab.centerOf('prep');
    for (let i = 0; i < 3; i++) { DW.fx.burst(c.x - 40 + i * 40, c.y - 40, { n: 6, speed: 2, life: 40, size: 4, colors: ['#e0b06c', '#c8283a'] }); await DW.sleep(160); }
    ui.addItem('pad'); ui.addItem('brush'); ui.removeItem('vial');
    ui.setProgress(2, 'Place a fly on the stage');
    await say('The flies are resting. Real scientists use a gentle puff of carbon dioxide gas or a cool rest. The flies wake up again afterwards.', 'neutral');
    ctx.reserved = new Set(['stereo']);
    Lab.panToObj('stereo'); Lab.hint('stereo', true);
    await say('Now take them to the microscope. Tap the stereomicroscope!', 'happy');
    ctx.hint = () => { Lab.panToObj('stereo'); Lab.hint('stereo', true); tip('Tap the stereomicroscope.', 'think'); };
    ctx.reserved = new Set(['stereo']);
    await DW.bus.wait('lab:pick', (id) => id === 'stereo');
    Lab.clearHints(); ctx.reserved = new Set();
    const { p } = await enterWorkstation(() => { ctx.screen = S; return S.runPrep(); });
    ui.setMission(M[2], 2);
    ctx.hint = () => tip('Drag a sleepy fly to the glowing stage. Or tap a fly, then tap the stage.', 'think');
    await say('Pick a sleepy fly and put it on the stage. Drag it, or tap it and then tap the stage!', 'neutral');
    ui.hideDlg();
    const r = await p; ctx.hint = null;
    ST.specimen = { sex: r.sex };
    ui.setProgress(3, 'Specimen ready!');
    await say('Wonderful! Your fly is ready under the microscope.', 'happy');
    track(3); await banner('Prepare the Specimen');
  }

  /* MISSION 4: Master the microscope */
  async function mission4() {
    setMission(3, 0);
    S.q('#scKick').textContent = 'MISSION 4 · MASTER THE MICROSCOPE';
    const p = S.runMaster(ST.specimen.sex); ctx.screen = S; ctx.view = 'scope'; ui.setNav({ view: 'scope' });
    ui.setMission(M[3], 0);
    const offSharp = DW.bus.on('scope:sharp', () => { ui.awardBadge('sharp'); });
    ctx.hint = () => { const t = S.hintMaster(); t && tip(t, 'think'); };
    await say('Now you are the scientist! Every control changes what you see in the circle.', 'happy');
    await say('Switch on the light, make it just right, then focus. Then zoom in and move your fly to the middle.', 'neutral');
    ui.hideDlg();
    await p; offSharp(); ctx.hint = null; S.endMaster();
    DW.track(DW.EVENTS.microscope, 'Microscope activity completed');
    await say('Amazing! Not too dark, not too bright, sharp focus, zoomed in and centered. You mastered the stereomicroscope!', 'happy');
    track(4); await banner('Master the Microscope');
  }

  /* MISSION 5: Explore fly anatomy */
  async function mission5() {
    setMission(4, 0);
    const { p } = await swapScreen(DW.anatomy, () => DW.anatomy.run(ST.specimen.sex));
    ui.setMission(M[4], 0);
    ctx.hint = () => { DW.anatomy.hint(); tip('Tap a glowing question mark to zoom in on that body part.', 'think'); };
    await say('Look at your fly up close! Tap each glowing question mark to zoom into a body part.', 'happy');
    await say('You can also zoom with the lens buttons, and drag to look around.', 'neutral');
    ui.hideDlg();
    await p; ctx.hint = null;
    DW.track(DW.EVENTS.anatomy, 'Anatomy exploration completed');
    await ui.awardBadge('anatomist');
    await say('You found all seven parts: head, eyes, antennae, thorax, wings, legs and abdomen!', 'happy');
    track(5); await banner('Explore Fly Anatomy');
  }

  /* MISSION 6: Male or female? */
  async function mission6() {
    setMission(5, 0);
    const { p } = await swapScreen(DW.compare, () => DW.compare.run());
    ui.setMission(M[5], 0);
    ctx.hint = () => { DW.compare.hint(); tip('Tap the next clue button to zoom in.', 'think'); };
    const offComb = DW.bus.on('compare:comb', () => { if (!ST.badges.has('comb')) ui.awardBadge('comb'); });
    await say('Fruit flies can be girls or boys. They look a little different. Let us compare!', 'happy');
    await say('Check all five clues. One of them is a tiny dark comb on the boy fly\'s front legs!', 'neutral');
    ui.hideDlg();
    await p; offComb(); ctx.hint = null;
    await say('Remember: size alone is not enough, because some boys are bigger than some girls. Use the tummy and the comb!', 'happy');
    track(6); await banner('Male or Female?');
  }

  /* MISSION 7: Fly Detective */
  async function mission7() {
    setMission(6, 0);
    const { p } = await swapScreen(DW.detective, () => DW.detective.run());
    ui.setMission(M[6], 0);
    ctx.hint = () => DW.detective.hint();
    await say('Detective, we have six mystery flies. Use the lens to look at the tummy and the front legs.', 'happy');
    await say('Is it a girl or a boy? Tap the Clue button if you need help. No pressure, we are learning!', 'neutral');
    ui.hideDlg();
    const res = await p; ctx.hint = null; ctx.stars = res.stars;
    DW.track(DW.EVENTS.detective, 'Fly Detective completed');
    await ui.awardBadge('detective');
    track(7);
  }

  /* Finale */
  async function finale() {
    ui.hideDlg(); await ui.fade(true, 500);
    if (ctx.screen) ctx.screen.el.classList.remove('in', 'on');
    ui.setProgress(M[6].objs.length, 'Lab 1 complete!');
    DW.track(DW.EVENTS.complete, 'Game completed'); DW.save.lab1Complete();
    const el = h('div', { class: 'finale' });
    const row = h('div', { class: 'f-badges' });
    DW.data.badges.forEach((b) => { if (b.id !== 'scientist') row.append(h('div', { class: 'f-b' + (ST.badges.has(b.id) ? '' : ' locked'), html: ui.badgeSVG(b, !ST.badges.has(b.id)) + '<span>' + b.name + '</span>' })); });
    el.append(
      h('div', { class: 'f-ray' }),
      h('div', { class: 'f-card' },
        h('small', null, 'LAB 1 COMPLETE'), h('h2', null, 'You are a Fly Scientist!'),
        h('p', null, 'You used a stereomicroscope, explored a fruit fly, and solved the Fly Detective challenge.'),
        row,
        h('p', { class: 'f-note' }, 'Everything in this game is a simulation to help you learn. Real scientists measure real flies!'),
        h('div', { class: 'f-btns' },
          h('button', { class: 'primary', html: icon('restart', 20) + ' Play again', onclick: () => DW.bus.emit('restart') }),
          h('button', { class: 'secondary', html: icon('book', 20) + ' Journal', onclick: () => ui.openJournal('badge') }),
          h('button', { class: 'secondary', html: icon('exit', 20) + ' Lab Entrance', onclick: () => { try { sessionStorage.setItem('dw.hub', '1'); } catch (e) { /* ignore */ } window.location.reload(); } }),
          h('a', { class: 'secondary', href: 'https://drosiesworld.com', target: '_blank', rel: 'noopener', html: icon('fly', 20) + ' More at drosiesworld.com' }),
          h('a', { class: 'secondary', href: '/cite/#secret-fly-lab', target: '_blank', rel: 'noopener', html: icon('book', 20) + ' Cite This Resource' }))));
    ui.game.append(el); Lab.show(false);
    ui.awardBadge('scientist'); // fanfare + confetti
    await ui.fade(false, 700);
    ui.say('maya', 'Congratulations, scientist! Lab 1 is complete. I am so proud of you!', { state: 'celebrate', wait: false });
  }

  DW.bus.on('restart', () => { window.location.reload(); });

  document.addEventListener('visibilitychange', () => { if (document.hidden) { A.stopSpeak(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
