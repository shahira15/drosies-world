/* ui.js: the game HUD, dialogue system, inventory, journal, menus, badges, toasts, tooltips and screen transitions. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon;
  const ui = (DW.ui = {});

  /* ---------- small helpers ---------- */
  ui.badgeSVG = function (b, locked) {
    const col = locked ? '#5b7380' : b.color;
    const ic = icon(b.icon, 40).replace('<svg ', '<svg x="30" y="30" ');
    return `<svg class="badge-svg ${locked ? 'locked' : ''}" viewBox="0 0 100 124" aria-hidden="true">
      <path d="M30 64L18 118L36 108L46 122L54 70Z" fill="${locked ? '#3b505c' : '#e9573f'}"/><path d="M70 64L82 118L64 108L54 122L46 70Z" fill="${locked ? '#33464f' : '#c9402c'}"/>
      <circle cx="50" cy="50" r="44" fill="${locked ? '#26414e' : '#ffd36b'}"/><circle cx="50" cy="50" r="38" fill="${col}" stroke="#fff" stroke-opacity="${locked ? 0.15 : 0.7}" stroke-width="3"/>
      <path d="M22 38Q50 8 78 38" stroke="#fff" stroke-opacity="${locked ? 0.05 : 0.35}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g style="color:${locked ? '#8ba2ae' : '#17313b'}">${locked ? icon('lock', 36).replace('<svg ', '<svg x="32" y="32" ') : ic}</g></svg>`;
  };

  ui.fullscreenOK = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  ui.toggleFullscreen = function () {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
    else { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
  };

  /* ---------- build ---------- */
  ui.init = function (root) {
    root.innerHTML = '';
    const game = (ui.game = h('div', { class: 'game', id: 'game' }));
    ui.labStage = h('div', { class: 'labstage' });
    ui.screens = h('div', { class: 'screens' });
    ui.fxCanvas = h('canvas', { class: 'fxcanvas' });

    /* HUD */
    ui.mTag = h('div', { class: 'm-tag' });
    ui.mTitle = h('div', { class: 'm-title' });
    ui.mObj = h('div', { class: 'm-obj' });
    ui.mSegs = h('div', { class: 'm-segs' });
    ui.missionCard = h('div', { class: 'mission-card' }, ui.mTag, ui.mTitle, ui.mObj, ui.mSegs);

    const btn = (ic, label, fn, cls) => h('button', { class: 'hbtn ' + (cls || ''), 'aria-label': label, title: label, html: icon(ic, 22), onclick: () => { DW.audio.play('click'); fn(); } });
    ui.btnHint = btn('bulb', 'Hint', () => DW.bus.emit('hint'), 'hint');
    ui.btnJournal = btn('book', 'Journal', () => ui.openJournal());
    ui.btnFull = btn('full', 'Fullscreen', ui.toggleFullscreen);
    if (!ui.fullscreenOK) ui.btnFull.style.display = 'none';
    ui.btnMenu = btn('gear', 'Settings', () => ui.openMenu('Settings'));
    ui.btnPause = btn('pause', 'Pause', () => ui.openMenu('Paused'));
    ui.btnHome = btn('exit', 'Back to the Lab Entrance', () => DW.bus.emit('home'), 'homebtn');
    ui.btnHome.style.display = 'none';
    ui.hudBtns = h('div', { class: 'hud-btns' }, ui.btnHome, ui.btnHint, ui.btnJournal, ui.btnFull, ui.btnMenu, ui.btnPause);

    ui.vsLab = h('button', { class: 'vs on', html: icon('home', 18) + '<span>Lab</span>', onclick: () => { DW.audio.play('click'); DW.bus.emit('nav', 'lab'); } });
    ui.vsScope = h('button', { class: 'vs', html: icon('scope', 18) + '<span>Microscope</span>', disabled: true, onclick: () => { DW.audio.play('click'); DW.bus.emit('nav', 'scope'); } });
    ui.viewSwitch = h('div', { class: 'viewswitch' }, ui.vsLab, ui.vsScope);

    ui.inv = h('div', { class: 'inventory', role: 'group', 'aria-label': 'Inventory' });
    ui.minimap = h('div', { class: 'minimap', 'aria-hidden': 'true' });

    ui.hud = h('div', { class: 'hud' }, ui.missionCard, ui.hudBtns, ui.viewSwitch, ui.minimap, ui.inv);

    /* Dialogue */
    ui.dlgPortrait = h('div', { class: 'dlg-portrait' });
    ui.dlgName = h('div', { class: 'dlg-name' });
    ui.dlgText = h('div', { class: 'dlg-text' });
    ui.dlgNext = h('div', { class: 'dlg-next', html: icon('down', 18) });
    ui.dlg = h('div', { class: 'dlg', role: 'status', onclick: () => { if (ui._adv) ui._adv(); else if (ui.game.classList.contains('l0')) ui.hideDlg(); } },
      ui.dlgPortrait, h('div', { class: 'dlg-body' }, ui.dlgName, ui.dlgText, ui.dlgNext));

    ui.toasts = h('div', { class: 'toasts', 'aria-live': 'polite' });
    ui.tipEl = h('div', { class: 'tip' });
    ui.modal = h('div', { class: 'modal' });
    ui.curtain = h('div', { class: 'curtain' });
    ui.letterbox = h('div', { class: 'letterbox' }, h('i'), h('i'));
    ui.skipBtn = h('button', { class: 'skip', html: 'Skip ' + icon('right', 16), onclick: () => DW.bus.emit('skip') });

    game.append(ui.labStage, ui.screens, ui.hud, ui.dlg, ui.toasts, ui.tipEl, ui.fxCanvas, ui.letterbox, ui.skipBtn, ui.modal, ui.curtain);
    root.append(game);
    DW.fx.init(ui.fxCanvas);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (ui.modal.classList.contains('on')) ui.closeModal(); else if (!document.fullscreenElement) ui.openMenu('Paused'); return; }
      if ((e.key === 'Enter' || e.key === ' ') && ui._adv && !ui.modal.classList.contains('on')) {
        const t = document.activeElement;
        if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.getAttribute('role') === 'button' || t.getAttribute('role') === 'slider')) return;
        e.preventDefault(); ui._adv();
      }
    });
    ui.setHudVisible(false);
  };

  ui.setHudVisible = (v) => ui.hud.classList.toggle('hidden', !v);
  ui.setBodyClass = (c, on) => ui.game.classList.toggle(c, !!on);

  /* ---------- mission card ---------- */
  ui.setMission = function (m, done) {
    ui.mTag.textContent = m.tag || ('MISSION ' + m.n + ' OF 7');
    ui.mTitle.textContent = m.title;
    ui._objs = m.objs;
    ui.setProgress(done || 0);
  };
  ui.setProgress = function (done, text) {
    const objs = ui._objs || [];
    ui.mSegs.innerHTML = '';
    objs.forEach((o, i) => ui.mSegs.append(h('i', { class: i < done ? 'done' : i === done ? 'cur' : '', title: o })));
    ui.mObj.textContent = text || (done < objs.length ? objs[done] : 'Complete!');
  };
  ui.setNav = function (o) {
    if (o.scope != null) ui.vsScope.disabled = !o.scope;
    if (o.view) { ui.vsLab.classList.toggle('on', o.view === 'lab'); ui.vsScope.classList.toggle('on', o.view === 'scope'); }
  };

  /* ---------- inventory ---------- */
  ui.addItem = function (id, quiet) {
    const S = DW.state, it = DW.data.items[id];
    if (!it || S.items.has(id)) return;
    S.items.add(id);
    const slot = h('div', { class: 'slot pop', 'data-id': id, tabindex: 0, role: 'img', 'aria-label': it.name, html: icon(it.icon, 26) + '<span class="slot-name">' + it.name + '</span>' });
    ui.inv.append(slot);
    if (!quiet) { DW.audio.play('pickup'); ui.toast('Collected: ' + it.name, it.icon); DW.fx.sparkleAt(slot, 14); }
    DW.bus.emit('items');
  };
  ui.removeItem = function (id) { const s = ui.inv.querySelector('[data-id="' + id + '"]'); if (s) s.remove(); DW.state.items.delete(id); };

  /* ---------- toasts ---------- */
  ui.toast = function (text, ic, ms) {
    const t = h('div', { class: 'toast', html: (ic ? icon(ic, 18) : '') + '<span></span>' });
    t.querySelector('span').textContent = text;
    ui.toasts.append(t);
    setTimeout(() => t.classList.add('out'), ms || 2600);
    setTimeout(() => t.remove(), (ms || 2600) + 400);
  };

  /* ---------- tooltips ---------- */
  ui.tip = {
    show(text, x, y) { ui.tipEl.textContent = text; ui.tipEl.classList.add('on'); ui.tip.move(x, y); },
    move(x, y) { ui.tipEl.style.transform = 'translate(' + Math.round(x + 14) + 'px,' + Math.round(y + 18) + 'px)'; },
    hide() { ui.tipEl.classList.remove('on'); },
  };

  /* ---------- dialogue ---------- */
  let typer = null;
  ui.say = function (who, text, o) {
    o = o || {};
    return new Promise((resolve) => {
      const c = DW.manifest.characters[who];
      ui.dlg.classList.add('on'); ui.dlg.dataset.who = who;
      ui.dlgName.textContent = c.name;
      ui.dlgPortrait.innerHTML = '';
      const p = DW.chars.el(who, o.state || 'neutral');
      ui.dlgPortrait.append(p);
      ui._portrait = p;
      ui.dlgText.textContent = '';
      ui.dlgNext.classList.remove('on');
      DW.audio.speak(text, who);
      DW.chars.talking(p, true);
      clearInterval(typer);
      let i = 0;
      const finish = () => {
        clearInterval(typer); typer = null; ui.dlgText.textContent = text;
        DW.chars.talking(p, false);
        if (o.state && o.state !== 'neutral') DW.chars.set(p, o.state);
        if (o.wait === false) { ui._adv = null; resolve(); return; }
        ui.dlgNext.classList.add('on');
        if (o.auto) setTimeout(() => { if (ui._adv) { ui._adv(); } }, o.auto);
      };
      typer = setInterval(() => { if (DW.paused) return; i += 1; ui.dlgText.textContent = text.slice(0, i); if (i >= text.length) finish(); }, 22);
      if (o.wait === false) { ui._adv = () => { if (typer) finish(); }; return; }
      ui._adv = () => {
        if (typer) { finish(); return; }
        ui._adv = null; ui.dlgNext.classList.remove('on'); DW.audio.play('click'); resolve();
      };
    });
  };
  ui.react = function (state) { if (ui._portrait) DW.chars.set(ui._portrait, state); };
  ui.hideDlg = function () { clearInterval(typer); typer = null; ui._adv = null; ui.dlg.classList.remove('on'); DW.audio.stopSpeak(); };
  ui.dlgSeq = async function (who, lines, state) { for (const l of lines) await ui.say(who, l, { state }); };

  /* ---------- transitions ---------- */
  ui.curtainSet = function (css) { ui.curtain.style.background = css; };
  ui.fade = function (toBlack, ms) {
    ui.curtain.style.pointerEvents = toBlack ? 'auto' : 'none';
    ui.curtain.style.transition = 'opacity ' + (ms || 500) + 'ms ease';
    ui.curtain.style.background = '#06101a';
    ui.curtain.style.opacity = toBlack ? 1 : 0;
    return DW.sleep(ms || 500);
  };
  /** Iris: open=true reveals scene from (x,y); open=false closes to black at (x,y). */
  ui.iris = function (x, y, open, ms) {
    const c = ui.curtain, W = window.innerWidth, H = window.innerHeight, maxR = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 20;
    c.style.transition = 'none'; c.style.opacity = 1; c.style.pointerEvents = 'auto';
    return DW.tween(ms || 700, (t) => {
      const r = (open ? t : 1 - t) * maxR;
      c.style.background = `radial-gradient(circle at ${x}px ${y}px, transparent ${Math.max(0, r)}px, #06101a ${Math.max(0, r) + 2}px)`;
    }, DW.ease.inOut).then(() => { if (open) { c.style.opacity = 0; c.style.pointerEvents = 'none'; } });
  };
  ui.cine = (on) => { ui.letterbox.classList.toggle('on', on); ui.skipBtn.classList.toggle('on', on); };

  /* ---------- modal framework ---------- */
  ui.openModal = function (title, body, opts) {
    opts = opts || {};
    DW.paused = true; DW.audio.suspend && 0;
    ui.modal.innerHTML = '';
    const close = h('button', { class: 'hbtn small', 'aria-label': 'Close', html: icon('close', 20), onclick: () => ui.closeModal() });
    const card = h('div', { class: 'mcard ' + (opts.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'mhead' }, h('h2', null, title), opts.noClose ? null : close), body);
    ui.modal.append(card); ui.modal.classList.add('on');
    ui.modal.onclick = (e) => { if (e.target === ui.modal && !opts.noClose) ui.closeModal(); };
    setTimeout(() => { const f = card.querySelector('button.primary, .tabs button'); f && f.focus && f.focus({ preventScroll: true }); }, 30);
  };
  ui.closeModal = function () {
    ui.modal.classList.remove('on'); ui.modal.innerHTML = ''; DW.paused = false; DW.audio.resume();
    DW.bus.emit('modal-closed');
  };

  /* ---------- journal ---------- */
  ui.openJournal = function (tab) {
    DW.audio.play('pageflip');
    const S = DW.state, D = DW.data;
    const body = h('div', { class: 'journal' });
    const tabs = h('div', { class: 'tabs', role: 'tablist' });
    const pane = h('div', { class: 'jpane' });
    const names = [['disc', 'Discoveries', 'sparkle'], ['gear', 'Equipment', 'bag'], ['safety', 'Safety', 'shield'], ['badge', 'Badges', 'medal']];
    function show(k) {
      DW.$$('button', tabs).forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      pane.innerHTML = '';
      if (k === 'disc') {
        const ids = Object.keys(D.discoveries), got = ids.filter((i) => S.discoveries.has(i));
        pane.append(h('p', { class: 'jhint' }, 'Found ' + got.length + ' of ' + ids.length + '. Tap things around the lab to find more!'));
        const grid = h('div', { class: 'jgrid' });
        ids.forEach((id) => {
          const d = D.discoveries[id], has = S.discoveries.has(id);
          grid.append(h('div', { class: 'jcard ' + (has ? '' : 'locked'), html: '<div class="jic">' + icon(has ? d.icon : 'lock', 24) + '</div><div><b>' + (has ? d.title : '???') + '</b><p>' + (has ? d.text : 'Not found yet.') + '</p></div>' }));
        });
        pane.append(grid);
      } else if (k === 'gear') {
        const grid = h('div', { class: 'jgrid' });
        Object.keys(D.items).forEach((id) => {
          const it = D.items[id], has = S.items.has(id);
          grid.append(h('div', { class: 'jcard ' + (has ? '' : 'locked'), html: '<div class="jic">' + icon(has ? it.icon : 'lock', 24) + '</div><div><b>' + (has ? it.name : '???') + '</b><p>' + (has ? it.text : 'Not collected yet.') + '</p></div>' }));
        });
        pane.append(grid);
      } else if (k === 'safety') {
        const J = DW.data0.journal, ids = Object.keys(J), got = ids.filter((i) => S.sJournal && S.sJournal.has(i));
        pane.append(h('p', { class: 'jhint' }, 'Safety Journal: ' + got.length + ' of ' + ids.length + ' notes. Play the Safety Academy missions to unlock more.'));
        const grid = h('div', { class: 'jgrid' });
        ids.forEach((id) => {
          const d = J[id], has = S.sJournal && S.sJournal.has(id);
          grid.append(h('div', { class: 'jcard ' + (has ? '' : 'locked'), html: '<div class="jic">' + icon(has ? d.icon : 'lock', 24) + '</div><div><b>' + (has ? d.title : '???') + '</b><p>' + (has ? d.text : 'Not unlocked yet.') + '</p></div>' }));
        });
        pane.append(grid);
      } else {
        const grid = h('div', { class: 'bgrid' });
        D.badges.concat(DW.data0.badges).forEach((b) => {
          const has = (b.lab === 0 ? S.sBadges : S.badges).has(b.id);
          grid.append(h('div', { class: 'bcard' + (has ? '' : ' locked'), html: ui.badgeSVG(b, !has) + '<b>' + (has ? b.name : 'Locked') + '</b><p>' + (has ? b.text : b.text) + '</p>' }));
        });
        pane.append(grid);
      }
    }
    names.forEach(([k, label, ic]) => tabs.append(h('button', { 'data-k': k, role: 'tab', html: icon(ic, 18) + '<span>' + label + '</span>', onclick: () => { DW.audio.play('click'); show(k); } })));
    body.append(tabs, pane);
    ui.openModal('Discovery Journal', body, { cls: 'wide' });
    show(tab || 'disc');
  };

  /* ---------- menu (pause + settings + restart) ---------- */
  ui.openMenu = function (title) {
    const A = DW.audio;
    const row = (ic, label, key, get, set) => {
      const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(get()), onclick: () => { const v = !get(); set(v); sw.setAttribute('aria-checked', String(v)); DW.store.set(key, v); A.play('click'); } }, h('i'));
      return h('div', { class: 'mrow', html: icon(ic, 22) + '<span>' + label + '</span>' }, sw);
    };
    const body = h('div', { class: 'menu' },
      row('sound', 'Sound effects', 'sfx', () => A.on.sfx, A.setSfx),
      row('music', 'Music', 'music', () => A.on.music, A.setMusic),
      row('speech', 'Read aloud (narration)', 'narr', () => A.on.narr, A.setNarr),
      h('div', { class: 'mbtns' },
        h('button', { class: 'primary', html: icon('play', 20) + ' Resume', onclick: () => { A.play('click'); ui.closeModal(); } }),
        ui.fullscreenOK ? h('button', { class: 'secondary', html: icon('full', 20) + ' Fullscreen', onclick: () => ui.toggleFullscreen() }) : null,
        h('button', { class: 'secondary', html: icon('book', 20) + ' Journal', onclick: () => ui.openJournal() }),
        h('button', { class: 'secondary', html: icon('exit', 20) + ' Lab Entrance', onclick: () => { ui.closeModal(); DW.bus.emit('home'); } }),
        h('button', { class: 'danger', html: icon('restart', 20) + ' Restart game', onclick: () => ui.confirmRestart() })));
    ui.openModal(title || 'Paused', body, { cls: 'small' });
  };
  ui.confirmRestart = function () {
    const body = h('div', { class: 'menu' },
      h('p', { class: 'center' }, 'Start the whole lab again from the beginning?'),
      h('div', { class: 'mbtns' },
        h('button', { class: 'primary', html: 'Keep playing', onclick: () => ui.closeModal() }),
        h('button', { class: 'danger', html: icon('restart', 20) + ' Yes, restart', onclick: () => { DW.bus.emit('restart'); } })));
    ui.openModal('Restart?', body, { cls: 'small' });
  };

  /* ---------- badge celebration ---------- */
  ui.awardBadge = function (id) {
    const S = DW.state, b = DW.data.badges.concat(DW.data0 ? DW.data0.badges : []).find((x) => x.id === id);
    const set = b && b.lab === 0 ? S.sBadges : S.badges;
    if (!b || set.has(id)) return Promise.resolve();
    set.add(id); if (b.lab === 0 && DW.save) DW.save.addBadge(id);
    return new Promise((resolve) => {
      DW.audio.play(id === 'detective' || id === 'scientist' || id === 'safety' ? 'fanfare' : 'success');
      DW.fx.confetti(id === 'detective' || id === 'scientist' || id === 'safety');
      const card = h('div', { class: 'badge-pop' },
        h('div', { class: 'ray' }), h('div', { class: 'bsvg', html: ui.badgeSVG(b) }),
        h('div', { class: 'bt' }, 'NEW BADGE'), h('h3', null, b.name), h('p', null, b.text),
        h('button', { class: 'primary', onclick: () => { DW.audio.play('click'); layer.remove(); resolve(); } }, 'Awesome!'));
      const layer = h('div', { class: 'badge-layer' }, card);
      ui.game.append(layer);
      setTimeout(() => { const bt = card.querySelector('button'); bt && bt.focus(); }, 300);
    });
  };
})();
