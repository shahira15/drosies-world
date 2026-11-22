/* lab.js: the explorable laboratory. Parallax layers, eased camera (drag / keys / wheel / edge buttons / minimap),
 * interactive objects with hover halos and tooltips, hints, the flying Drosie companion, and the zoom-in transition.
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon;
  const WORLD_W = 2400, WORLD_H = 900;
  const FACTORS = { back: 0.45, mid: 0.75, main: 1, fore: 1.18 };

  const Lab = (DW.lab = { cam: 0, target: 0, max: 0, s: 1, W: 0, H: 0, enabled: false, moved: 0, active: false, keys: {}, ptr: { x: 0, y: 0 } });

  Lab.build = function (root) {
    Lab.root = root;
    root.innerHTML = '';
    root.append(h('div', { html: DW.art.labDefs() }));
    const world = (Lab.world = h('div', { class: 'world' }));
    Lab.layers = {};
    const mk = (name, art) => {
      const box = h('div', { class: 'layer ' + name });
      const svg = h('div', { class: 'lsvg', html: `<svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${art}</svg>` });
      box.append(svg); world.append(box); Lab.layers[name] = { box, svg };
    };
    mk('back', DW.art.labBack()); mk('mid', DW.art.labMid()); mk('main', DW.art.labMain()); mk('fore', DW.art.labFore());
    world.append(h('div', { class: 'vignette' }), h('div', { class: 'lamp-dim' }));
    root.append(world);

    // edge navigation buttons
    const edge = (dir) => {
      const b = h('button', { class: 'edge ' + dir, 'aria-label': 'Look ' + dir, html: icon(dir, 28) });
      const on = (v) => (e) => { e.preventDefault(); e.stopPropagation(); Lab.keys[dir] = v; if (v) DW.audio.play('tick'); };
      b.addEventListener('pointerdown', on(true)); b.addEventListener('pointerup', on(false)); b.addEventListener('pointerleave', on(false)); b.addEventListener('pointercancel', on(false));
      return b;
    };
    Lab.edgeL = edge('left'); Lab.edgeR = edge('right');
    root.append(Lab.edgeL, Lab.edgeR);

    // companion
    Lab.comp = h('div', { class: 'companion', html: DW.art.drosieFly() });
    root.append(Lab.comp);
    Lab.cx = window.innerWidth * 0.5; Lab.cy = window.innerHeight * 0.4; Lab.cvx = 0;

    Lab.buildMinimap();
    Lab.layout();
    window.addEventListener('resize', Lab.layout);
    Lab.bind();
    requestAnimationFrame(Lab.loop);
  };

  Lab.layout = function () {
    const r = Lab.root.getBoundingClientRect();
    Lab.W = r.width; Lab.H = r.height;
    Lab.s = Math.max(Lab.H / WORLD_H, (Lab.W / WORLD_W) * 1.04);
    const mainW = WORLD_W * Lab.s, top = Lab.H - WORLD_H * Lab.s;
    Lab.mainW = mainW; Lab.max = Math.max(0, mainW - Lab.W); Lab.top = top;
    for (const k in Lab.layers) {
      const f = FACTORS[k], L = Lab.layers[k];
      const w = k === 'fore' ? mainW * 1.25 : Math.min(mainW, Lab.W + Lab.max * f);
      L.box.style.cssText = `width:${w}px;height:${WORLD_H * Lab.s}px;top:${top}px`;
      L.svg.style.cssText = `width:${mainW}px;height:${WORLD_H * Lab.s}px`;
    }
    Lab.cam = DW.clamp(Lab.cam, 0, Lab.max); Lab.target = DW.clamp(Lab.target, 0, Lab.max);
    Lab.apply();
  };

  Lab.apply = function () {
    for (const k in Lab.layers) Lab.layers[k].box.style.transform = `translate3d(${-Lab.cam * FACTORS[k]}px,0,0)`;
    if (Lab.mmView) { Lab.mmView.style.left = (Lab.cam / Lab.mainW) * 100 + '%'; Lab.mmView.style.width = (Lab.W / Lab.mainW) * 100 + '%'; }
    Lab.edgeL.classList.toggle('off', Lab.cam < 8); Lab.edgeR.classList.toggle('off', Lab.cam > Lab.max - 8);
  };

  Lab.loop = function () {
    if (Lab.active && !DW.paused) {
      const k = Lab.keys;
      if (Lab.enabled || Lab.free) {
        if (k.left || k.a) Lab.target -= 16; if (k.right || k.d) Lab.target += 16;
      }
      Lab.target = DW.clamp(Lab.target, 0, Lab.max);
      const d = Lab.target - Lab.cam;
      Lab.cam += Math.abs(d) < 0.3 ? d : d * (Lab.dragging ? 0.5 : 0.1);
      Lab.apply();
      // companion: soft spring toward pointer
      const tx = Lab.ptr.x + 34, ty = Lab.ptr.y - 26 + Math.sin(performance.now() / 380) * 9;
      const ax = (tx - Lab.cx) * 0.06; Lab.cvx = (Lab.cvx + ax) * 0.82;
      Lab.cx += Lab.cvx; Lab.cy += (ty - Lab.cy) * 0.09;
      Lab.comp.style.transform = `translate3d(${Lab.cx - 32}px,${Lab.cy - 32}px,0) rotate(${DW.clamp(Lab.cvx * 3, -22, 22)}deg)`;
    }
    requestAnimationFrame(Lab.loop);
  };

  Lab.bind = function () {
    const root = Lab.root;
    let down = null;
    root.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.edge')) return;
      down = { x: e.clientX, cam: Lab.target, id: e.pointerId }; Lab.moved = 0; Lab.dragging = true;
    });
    window.addEventListener('pointermove', (e) => {
      Lab.ptr.x = e.clientX; Lab.ptr.y = e.clientY;
      if (down && Lab.active && (Lab.enabled || Lab.free)) {
        const dx = e.clientX - down.x; Lab.moved = Math.max(Lab.moved, Math.abs(dx));
        if (Lab.moved > 6) { Lab.target = DW.clamp(down.cam - dx, 0, Lab.max); root.classList.add('dragging'); }
      }
      const o = Lab.active && e.target.closest ? e.target.closest('.obj') : null;
      if (o && Lab.enabled) { DW.ui.tip.show(o.dataset.name, e.clientX, e.clientY); if (Lab._hov !== o) { Lab._hov = o; DW.audio.play('hover'); } }
      else { DW.ui.tip.hide(); Lab._hov = null; }
    });
    const up = () => { down = null; Lab.dragging = false; root.classList.remove('dragging'); };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    root.addEventListener('wheel', (e) => { if (!Lab.enabled) return; Lab.target = DW.clamp(Lab.target + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY), 0, Lab.max); e.preventDefault(); }, { passive: false });
    root.addEventListener('click', (e) => {
      const o = e.target.closest('.obj');
      if (!o || !Lab.enabled || Lab.moved > 6) return;
      Lab.pick(o.dataset.id, e);
    });
    root.addEventListener('keydown', (e) => {
      const o = e.target.closest && e.target.closest('.obj');
      if (o && (e.key === 'Enter' || e.key === ' ') && Lab.enabled) { e.preventDefault(); Lab.pick(o.dataset.id, null); }
    });
    window.addEventListener('keydown', (e) => {
      if (!Lab.active || DW.paused) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') Lab.keys.left = true; if (k === 'arrowright' || k === 'd') Lab.keys.right = true;
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') Lab.keys.left = false; if (k === 'arrowright' || k === 'd') Lab.keys.right = false;
    });
  };

  Lab.pick = function (id, e) {
    if (id === 'lamp') { Lab.toggleLamp(); }
    DW.audio.play('click');
    if (e) DW.fx.burst(e.clientX, e.clientY, { n: 8, speed: 3, life: 30, size: 4 });
    DW.bus.emit('lab:pick', id);
  };

  Lab.toggleLamp = function () {
    const off = Lab.world.classList.toggle('lamp-off');
    DW.audio.play(off ? 'switchOff' : 'switchOn');
  };

  /* ---------- minimap ---------- */
  Lab.buildMinimap = function () {
    const mm = DW.ui.minimap;
    mm.innerHTML = '<div class="mm-track"></div>';
    Lab.mmView = h('div', { class: 'mm-view' });
    mm.append(Lab.mmView);
    [[190, 'cabinet'], [510, 'poster'], [785, 'computer'], [1260, 'compound'], [1560, 'vials'], [1830, 'prep'], [2200, 'stereo']].forEach(([x]) => mm.append(h('i', { class: 'mm-pip', style: { left: (x / WORLD_W) * 100 + '%' } })));
    mm.addEventListener('pointerdown', (e) => {
      if (!Lab.enabled) return;
      const r = mm.getBoundingClientRect(), f = DW.clamp((e.clientX - r.left) / r.width, 0, 1);
      Lab.target = DW.clamp(f * Lab.mainW - Lab.W / 2, 0, Lab.max); DW.audio.play('tick');
    });
  };

  /* ---------- API used by missions ---------- */
  Lab.show = function (on) {
    Lab.active = on; Lab.root.classList.toggle('on', on);
    if (on) Lab.layout();
    DW.fx.dustOn = on;
    Lab.comp.style.display = on ? '' : 'none';
    if (!on) DW.ui.tip.hide();
  };
  Lab.enable = function (on) { Lab.enabled = on; Lab.root.classList.toggle('locked', !on); };
  Lab.objEl = (id) => Lab.root.querySelector('.obj[data-id="' + id + '"]');
  Lab.hint = function (id, on) { const o = Lab.objEl(id); if (o) o.classList.toggle('hint', on !== false); };
  Lab.clearHints = function () { DW.$$('.obj.hint', Lab.root).forEach((o) => o.classList.remove('hint')); };
  Lab.centerOf = function (id) {
    const o = Lab.objEl(id); if (!o) return { x: Lab.W / 2, y: Lab.H / 2 };
    const r = o.querySelector(':scope > .halo').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  Lab.worldX = function (id) {
    const o = Lab.objEl(id); if (!o) return Lab.cam;
    const b = o.querySelector(':scope > .halo'); return +b.getAttribute('x') + +b.getAttribute('width') / 2;
  };
  Lab.panTo = function (worldX) { Lab.target = DW.clamp(worldX * Lab.s - Lab.W / 2, 0, Lab.max); };
  Lab.panToObj = function (id) { Lab.panTo(Lab.worldX(id)); };
  Lab.snapTo = function (worldX) { Lab.panTo(worldX); Lab.cam = Lab.target; Lab.apply(); };

  /** Zoom the camera into an object (transition before opening the workstation). Resolves with the screen point. */
  Lab.zoomInto = function (id, ms) {
    Lab.panToObj(id);
    return DW.sleep(Math.min(900, 250 + Math.abs(Lab.target - Lab.cam) * 0.9)).then(() => {
      const c = Lab.centerOf(id), w = Lab.world;
      w.style.transformOrigin = c.x + 'px ' + c.y + 'px';
      return DW.tween(ms || 800, (t) => { w.style.transform = `scale(${1 + t * 2.6})`; w.style.filter = `blur(${t * 3}px)`; }, DW.ease.inOut).then(() => c);
    });
  };
  Lab.resetZoom = function () { Lab.world.style.transform = ''; Lab.world.style.filter = ''; Lab.world.style.transformOrigin = ''; };

  /** Companion celebrates (quick loop) */
  Lab.companionCheer = function () {
    Lab.comp.classList.remove('cheer'); void Lab.comp.offsetWidth; Lab.comp.classList.add('cheer');
  };
})();
