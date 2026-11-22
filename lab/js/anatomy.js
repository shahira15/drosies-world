/* anatomy.js: Mission 5. Annotated specimen viewer. Tap pulsing pins (or the body itself, or the list) to
 * fly the camera into each of the seven regions. Fine structure (eye facets, bristles, wing hairs) fades in as you zoom.
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, A = DW.audio, clamp = DW.clamp;
  const An = (DW.anatomy = { view: { cx: 0, cy: -15, s: 1 }, found: new Set() });
  const BW = 490, BH = 420;
  const PIN = { head: [2, -171], eyes: [-64, -150], antennae: [-46, -208], thorax: [0, -70], wings: [-172, 34], legs: [-136, -52], abdomen: [0, 92] };

  An.build = function () {
    if (An.el) return;
    const el = (An.el = DW.screens.make('anatomy', 'anatomy-screen'));
    el.innerHTML = `
      <div class="sc-bg"></div>
      <div class="sc-title"><span class="kick">MISSION 5 · EXPLORE FLY ANATOMY</span><b>Drosophila melanogaster</b></div>
      <div class="an-stage" id="anStage"><div class="an-spot"></div><div class="an-svg" id="anSvg"></div><div class="an-pins" id="anPins"></div>
        <div class="an-zoom"><button id="anIn" aria-label="Zoom in">${icon('lens', 20)}<b>+</b></button><button id="anOut" aria-label="Zoom out">${icon('lens', 20)}<b>−</b></button><button id="anAll" aria-label="Whole fly">${icon('fly', 20)}</button></div>
        <div class="an-card" id="anCard"></div>
        <div class="an-note">Illustration of a fruit fly (not a photo). Real flies are about 2.5 mm long.</div></div>
      <div class="an-list" id="anList"></div>`;
    An.q = (s) => el.querySelector(s);
    An.stage = An.q('#anStage');
    An.bind();
  };

  An.bind = function () {
    const stage = An.stage;
    let drag = null;
    stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; drag = { x: e.clientX, y: e.clientY, cx: An.view.cx, cy: An.view.cy, moved: 0 }; });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      if (drag.moved > 6 && An.view.s > 1.05) {
        const svg = An.q('#anSvg svg').getBoundingClientRect(), k = (BW / An.view.s) / svg.width * Math.max(1, svg.width / (svg.height * BW / BH));
        An.setView(drag.cx - dx * k, drag.cy - dy * k, An.view.s, 0);
      }
    });
    window.addEventListener('pointerup', () => { setTimeout(() => { drag = null; }, 0); });
    stage.addEventListener('click', (e) => {
      if (drag && drag.moved > 6) return;
      const r = e.target.closest && e.target.closest('.reg'); if (r && An.resolve) An.pick(r.dataset.region);
    });
    stage.addEventListener('pointermove', (e) => { const r = e.target.closest && e.target.closest('.reg'); if (r && An.resolve) { const d = DW.data.regions.find((x) => x.id === r.dataset.region); DW.ui.tip.show(d.name, e.clientX, e.clientY); } else DW.ui.tip.hide(); });
    stage.addEventListener('pointerleave', () => DW.ui.tip.hide());
    An.q('#anIn').onclick = () => { A.play('click'); An.setView(An.view.cx, An.view.cy, clamp(An.view.s * 1.5, 1, 6), 350); };
    An.q('#anOut').onclick = () => { A.play('click'); An.setView(An.view.cx, An.view.cy, clamp(An.view.s / 1.5, 1, 6), 350); };
    An.q('#anAll').onclick = () => { A.play('whooshBack'); An.focus = null; An.setView(0, -15, 1, 600); An.q('#anCard').classList.remove('on'); };
    stage.addEventListener('wheel', (e) => { if (!An.resolve) return; e.preventDefault(); An.setView(An.view.cx, An.view.cy, clamp(An.view.s * (e.deltaY < 0 ? 1.12 : 0.9), 1, 6), 0); }, { passive: false });
    window.addEventListener('resize', () => An.updatePins());
  };

  An.setView = function (cx, cy, s, ms) {
    const v = An.view, from = { cx: v.cx, cy: v.cy, s: v.s };
    const apply = (k) => {
      v.cx = DW.lerp(from.cx, cx, k); v.cy = DW.lerp(from.cy, cy, k); v.s = DW.lerp(from.s, s, k);
      const svg = An.q('#anSvg svg'); if (!svg) return;
      svg.setAttribute('viewBox', `${v.cx - BW / (2 * v.s)} ${v.cy - BH / (2 * v.s)} ${BW / v.s} ${BH / v.s}`);
      const fly = svg.querySelector('.fly'); fly && fly.style.setProperty('--det', clamp((v.s - 1) / 3, 0.08, 1).toFixed(2));
      An.updatePins();
    };
    An._tw = (An._tw || 0) + 1; const id = An._tw;
    if (!ms) { apply(1); return Promise.resolve(); }
    return DW.tween(ms, (k) => { if (id === An._tw) apply(k); }, DW.ease.inOut);
  };

  An.updatePins = function () {
    const svg = An.q('#anSvg svg'), pins = An.q('#anPins'); if (!svg || !pins) return;
    const ctm = svg.getScreenCTM(), box = An.stage.getBoundingClientRect(); if (!ctm) return;
    const pt = svg.createSVGPoint();
    DW.$$('.pin', pins).forEach((p) => {
      const c = PIN[p.dataset.r]; pt.x = c[0]; pt.y = c[1]; const m = pt.matrixTransform(ctm);
      p.style.transform = `translate(${m.x - box.left}px,${m.y - box.top}px)`;
      p.style.opacity = An.view.s < 1.3 ? 1 : 0; p.style.pointerEvents = An.view.s < 1.3 ? 'auto' : 'none';
    });
  };

  An.drawLists = function () {
    const pins = An.q('#anPins'), list = An.q('#anList'); pins.innerHTML = ''; list.innerHTML = '';
    DW.data.regions.forEach((r) => {
      const ok = An.found.has(r.id);
      pins.append(h('button', { class: 'pin ' + (ok ? 'ok' : ''), 'data-r': r.id, 'aria-label': r.name, html: (ok ? icon('check', 16) : '?') + (ok ? '<span>' + r.name + '</span>' : ''), onclick: (e) => { e.stopPropagation(); An.pick(r.id); } }));
      list.append(h('button', { class: 'chip ' + (ok ? 'ok' : ''), 'data-r': r.id, html: '<i>' + (ok ? icon('check', 14) : '') + '</i><span>' + r.name + '</span>', onclick: () => An.pick(r.id) }));
    });
    An.q('#anList').prepend(h('div', { class: 'an-count' }, 'Found ' + An.found.size + ' of 7'));
    An.updatePins();
  };

  An.pick = async function (id) {
    const r = DW.data.regions.find((x) => x.id === id); if (!r || !An.resolve) return;
    const first = !An.found.has(id); An.found.add(id);
    A.play(first ? 'ding' : 'whoosh');
    An.focus = id;
    const svg = An.q('#anSvg svg'); svg.classList.add('focusing');
    DW.$$('.reg', svg).forEach((x) => x.classList.toggle('focus', x.dataset.region === id));
    const card = An.q('#anCard');
    card.innerHTML = `<b>${r.name}</b><p>${r.text}</p>`; card.classList.remove('on'); void card.offsetWidth; card.classList.add('on');
    A.speak(r.name + '. ' + r.text, 'maya');
    DW.ui.setProgress(An.found.size, 'Body parts found: ' + An.found.size + ' of 7');
    An.drawLists();
    if (first) { const chip = An.q('.chip[data-r="' + id + '"]'); chip && DW.fx.sparkleAt(chip, 16); }
    await An.setView(r.cx, r.cy, r.s, 750);
    if (An.found.size >= 7 && !An.done) { An.done = true; DW.fx.confetti(); A.play('success'); setTimeout(() => An.resolve && An.resolve(), 2200); }
  };

  An.hint = function () {
    const next = DW.data.regions.find((r) => !An.found.has(r.id)); if (!next) return;
    const p = An.q('.pin[data-r="' + next.id + '"]'); if (p) { p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); }
    if (An.view.s > 1.3) { An.q('#anAll').click(); }
  };

  An.run = function (sex) {
    An.build(); An.found = new Set(); An.done = false; An.focus = null;
    An.q('#anSvg').innerHTML = DW.art.flySVG({ sex: sex || 'f', wing: 54, det: 0.08 });
    An.view = { cx: 0, cy: -15, s: 1 }; An.setView(0, -15, 1, 0);
    An.q('#anCard').classList.remove('on'); An.drawLists();
    DW.screens.open(An.el); DW.ui.setNav({ view: 'scope' });
    return new Promise((resolve) => { An.resolve = resolve; setTimeout(An.updatePins, 60); setTimeout(An.updatePins, 600); }).then(() => { An.resolve = null; });
  };
  An.close = function () { return DW.screens.close(An.el); };
})();
