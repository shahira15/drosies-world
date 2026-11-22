/* lab0/core.js: the shared engine for Lab 0 (Safety Academy).
 * Builds on the Lab 1 engine (DW.ui dialogue/HUD, DW.screens, DW.audio, DW.fx) and adds:
 *   L0.screen(name, bgSVG)   a 16:9 stage with a 1600x900-unit coordinate system
 *   L0.ask(opts)             a question card with shuffled options, gentle feedback and retry
 *   L0.start(n)              run a mission; L0.finish() saves progress, awards badges and shows the result card
 *   L0.G(promise)            guards async work so a cancelled mission never touches the UI again
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, S = DW.save;
  const L0 = (DW.l0 = { run: null, missions: {}, screens: [] });

  /* ---------- coordinates ---------- */
  L0.pos = function (el, x, y, w, hh) {
    el.style.left = x / 16 + '%'; el.style.top = y / 9 + '%';
    if (w != null) el.style.width = w / 16 + '%';
    if (hh != null) el.style.height = hh / 9 + '%';
    return el;
  };
  L0.toUnits = function (stage, cx, cy) {
    const r = stage.getBoundingClientRect();
    return [((cx - r.left) / r.width) * 1600, ((cy - r.top) / r.height) * 900];
  };
  L0.box = function (stage, cls, x, y, w, hh, attrs, ...kids) {
    const e = h('div', Object.assign({ class: cls }, attrs || {}), ...kids);
    L0.pos(e, x, y, w, hh); stage.append(e); return e;
  };

  /* ---------- guarded async ---------- */
  L0.G = function (p) {
    const r = L0.run;
    return new Promise((res) => { Promise.resolve(p).then((v) => { if (!r || !r.dead) res(v); }); });
  };
  L0.sleep = (ms) => L0.G(DW.sleep(ms));
  /* A short non-blocking line that hides itself, but never hides a newer dialogue line. */
  L0._tok = 0;
  L0.tip = function (who, text, state, ms) {
    const tok = ++L0._tok; ui.say(who, text, { state: state || 'neutral', wait: false });
    setTimeout(() => { if (L0._tok === tok) ui.hideDlg(); }, ms || 4500);
  };
  L0.say = (who, text, state) => { L0._tok++; return L0.G(ui.say(who, text, { state })); };
  L0.maya = (t, s) => L0.say('maya', t, s || 'neutral');
  L0.drosie = (t, s) => L0.say('drosie', t, s || 'happy');
  L0.alive = () => !!L0.run && !L0.run.dead;

  /* ---------- varied feedback (avoids the same cheer every time) ---------- */
  const POOLS = {
    good: ['That’s it!', 'Spot on.', 'You got it.', 'Yes, exactly.', 'Good thinking.', 'Right on.', 'Sharp eyes!', 'Nicely done.'],
    again: ['Not quite. Let’s think again.', 'Close. Look again.', 'Good try. Take another look.', 'Hmm. Try a different one.'],
    dro: ['Bzzz! Nice one!', 'Zoom zoom! You’re quick!', 'Wing-flap for you!', 'My eyes saw that. Great!', 'Buzz-tastic.'],
  };
  const last = {};
  L0.pick = function (k) {
    const p = POOLS[k]; let i; do { i = Math.floor(Math.random() * p.length); } while (i === last[k] && p.length > 1);
    last[k] = i; return p[i];
  };

  /* ---------- stage ---------- */
  L0.screen = function (name, bgHTML, o) {
    o = o || {};
    const el = DW.screens.make(name, 'l0-screen ' + (o.cls || ''));
    const stage = h('div', { class: 'l0-stage' });
    const bg = h('div', { class: 'l0-bg', html: '<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">' + bgHTML + '</svg>' });
    stage.append(bg); el.append(stage);
    const scr = {
      el, stage, bg,
      open() { DW.screens.open(el); return DW.sleep(380); },
      async close() { el.classList.remove('in'); await DW.sleep(300); el.remove(); L0.screens = L0.screens.filter((s) => s !== scr); },
    };
    L0.screens.push(scr); L0.cur = scr;
    return scr;
  };
  /** Fade in a freshly built screen. */
  L0.enter = async function (scr, ms) {
    await L0.G(ui.fade(true, 260)); DW.screens.open(scr.el); await L0.G(ui.fade(false, ms || 520));
  };
  L0.removeAll = function () { L0.screens.forEach((s) => s.el.remove()); L0.screens = []; document.querySelectorAll('.l0-pop,.l0-overlay').forEach((e) => e.remove()); };

  /* ---------- Drosie hovering in a scene (tap for a tip) ---------- */
  L0.drosieFly = function (stage, x, y, tips) {
    const d = L0.box(stage, 'l0-drosie', x, y, 150, 190, { role: 'button', tabindex: '0', 'aria-label': 'Drosie the fruit fly. Tap for a tip.' });
    d.innerHTML = DW.art.drosieFly();
    let i = 0;
    const tip = () => {
      A.play('pop'); DW.fx.sparkleAt(d, 10);
      if (!tips || !tips.length) return;
      L0.tip('drosie', tips[i++ % tips.length], 'happy', 6000);
    };
    d.addEventListener('click', tip);
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tip(); } });
    return d;
  };

  /* ---------- question card ---------- */
  /** o: {stage, title, icon, scene (svg string), q, opts:[[text, ok, why]], where:'right'|'center'|'left', ok:'text when right'}
   *  resolves {first:boolean} when the right option is chosen and "Continue" is pressed. */
  L0.ask = function (o) {
    const run = L0.run;
    return new Promise((resolve) => {
      let first = true, done = false;
      const list = DW.shuffle(o.opts);
      const fb = h('div', { class: 'l0-fb', 'aria-live': 'polite' });
      const next = h('button', { class: 'primary l0-cont', html: (o.cont || 'Continue') + ' ' + icon('right', 18) });
      next.style.display = 'none';
      const opts = h('div', { class: 'l0-opts' });
      const card = h('div', { class: 'l0-ask ' + (o.where || 'right'), role: 'group', 'aria-label': o.title || 'Question' },
        o.title ? h('div', { class: 'l0-ask-h', html: (o.icon ? icon(o.icon, 20) : '') + '<span></span>' }) : null,
        o.scene ? h('div', { class: 'l0-ask-scene', html: o.scene }) : null,
        h('p', { class: 'l0-q' }, o.q), opts, fb, next);
      if (o.title) card.querySelector('.l0-ask-h span').textContent = o.title;
      list.forEach((op, i) => {
        const b = h('button', { class: 'l0-opt', 'data-i': i }, h('i', null, 'ABC'[i]), h('span', null, op[0]));
        b.addEventListener('click', () => {
          if (done || (run && run.dead)) return;
          if (op[1]) {
            done = true; A.play('success'); DW.fx.sparkleAt(b, 14);
            b.classList.add('ok'); opts.classList.add('locked');
            fb.className = 'l0-fb ok on'; fb.innerHTML = '<b></b><span></span>';
            fb.querySelector('b').textContent = L0.pick('good'); fb.querySelector('span').textContent = ' ' + (op[2] || '');
            next.style.display = ''; next.focus();
            if (o.onRight) o.onRight(op);
          } else {
            first = false; A.play('nope'); b.classList.add('no'); b.disabled = true;
            fb.className = 'l0-fb no on'; fb.innerHTML = '<b></b><span></span>';
            fb.querySelector('b').textContent = L0.pick('again'); fb.querySelector('span').textContent = ' ' + (op[2] || '');
            if (o.onWrong) o.onWrong(op);
          }
        });
        opts.append(b);
      });
      next.addEventListener('click', () => { A.play('click'); card.classList.add('out'); setTimeout(() => card.remove(), 250); resolve({ first }); });
      card.addEventListener('keydown', (e) => { const i = '123'.indexOf(e.key); if (i >= 0 && opts.children[i]) opts.children[i].click(); });
      (o.stage || (L0.cur && L0.cur.stage)).append(card);
      setTimeout(() => { const f = opts.querySelector('button'); f && f.focus({ preventScroll: true }); }, 60);
    });
  };

  /* ---------- journal ---------- */
  L0.journal = function (id) {
    if (S.addJournal(id)) {
      DW.state.sJournal.add(id);
      const j = D0.journal[id];
      ui.toast('Safety Journal: ' + j.title, j.icon, 3200); A.play('ding');
    }
  };

  /* ---------- result card ---------- */
  L0.resultCard = function (run, o) {
    return new Promise((resolve) => {
      const m = D0.missions[run.n - 1];
      const btns = h('div', { class: 'l0-res-btns' });
      const card = h('div', { class: 'l0-pop' },
        h('div', { class: 'l0-res' },
          h('small', null, 'MISSION ' + run.n + ' COMPLETE'), h('h2', null, m.title),
          o.badge ? h('div', { class: 'l0-res-badge', html: ui.badgeSVG(D0.badges.find((b) => b.id === o.badge)) }) : null,
          h('p', { class: 'l0-res-p' }, o.text), o.extra || null, btns));
      const add = (cls, label, ic, val) => btns.append(h('button', { class: cls, html: icon(ic, 18) + ' <span>' + label + '</span>', onclick: () => { A.play('click'); card.remove(); resolve(val); } }));
      if (run.n < 7) add('primary', 'Next mission', 'right', 'next'); else add('primary', 'Back to the entrance', 'home', 'hub');
      if (run.n < 7) add('secondary', 'Lab Entrance', 'home', 'hub');
      add('secondary', 'Play again', 'restart', 'replay');
      ui.game.append(card);
      setTimeout(() => { const b = btns.querySelector('button'); b && b.focus(); }, 300);
    });
  };

  /* ---------- running a mission ---------- */
  L0.start = async function (n) {
    L0.removeAll(); ui.hideDlg(); ui.cine(false);
    const m = D0.missions[n - 1];
    const run = (L0.run = { n, dead: false, first: 0, total: 0, t0: Date.now() });
    ui.game.classList.add('l0'); ui.game.classList.remove('l0-hub');
    ui.setMission(m, 0); ui.setHudVisible(true); ui.btnHome.style.display = '';
    ui.setNav({ view: 'lab', scope: false }); ui.btnHint.style.display = '';
    DW.track(DW.EVENTS.l0started, 'Lab 0 started');
    DW.track('lab0-mission-' + n + '-started', 'Lab 0 mission ' + n + ' started');
    try {
      const out = await L0.missions[n](run);
      if (run.dead) return;
      if (out === 'hub') { await L0.leave(); DW.hub.show(); }
      else if (out === 'next' && n < 7) L0.start(n + 1);
      else if (out === 'replay') L0.start(n);
      else if (out === 'hub-final') { await L0.leave(); DW.hub.show(true); }
    } catch (err) { console.error(err); ui.toast('Oops, something went wrong. Try the Entrance button.', 'bulb', 5000); }
  };
  L0.leave = async function () {
    const run = L0.run; if (run) run.dead = true;
    ui.hideDlg(); await ui.fade(true, 350); L0.removeAll(); await ui.fade(false, 450);
  };
  L0.cancel = function () { /* Called by the Lab Entrance button during a mission */
    const run = L0.run; if (run) run.dead = true;
    ui.hideDlg(); L0.removeAll(); ui.closeModal(); DW.hub.show();
  };

  /** Save, award and show the result card. res: {first,total,pass,badge,jr:[ids],text} -> 'next'|'hub'|'replay' */
  L0.finish = async function (run, res) {
    S.complete(run.n, { first: res.first, total: res.total });
    DW.track(DW.EVENTS.l0mission(run.n), 'Lab 0 mission ' + run.n + ' completed');
    ui.setProgress(D0.missions[run.n - 1].objs.length, 'Mission complete!');
    (res.jr || []).forEach((j) => L0.journal(j));
    if (res.pass && res.badge) { await L0.G(ui.awardBadge(res.badge)); }
    const msg = res.text || (res.first >= res.total ? 'You got every one on the first try.' : 'You finished the mission. Great learning!');
    return L0.G(L0.resultCard(run, { badge: res.pass ? res.badge : null, text: msg }));
  };
  L0.threshold = (first, total) => first / total >= 0.75;

  /* ---------- mini quiz (used for the optional refresher) ---------- */
  L0.miniQuiz = async function (qs, stage) {
    let first = 0;
    for (const q of qs) {
      const r = await L0.ask({ stage, title: 'Quick check', icon: 'question', scene: q.scene ? DW.art.ruleScene(q.scene) : null, q: q.q, opts: q.opts.map((t, i) => [t, i === q.ok ? 1 : 0, q.why]), where: 'center' });
      if (r.first) first++;
    }
    return first;
  };
})();
