/* scope.js: the stereomicroscope workstation.
 *   - learn phase  (Mission 2): tap the six real parts of a stereomicroscope
 *   - prep phase   (Mission 3): drag a sleeping fly from the pad to the stage (snap, bounce, sparkle)
 *   - master phase (Mission 4): a LIVE optical simulation. Every control changes the rendered image:
 *        light switch + brightness  -> dark / clear / washed-out image
 *        focus knob (+ tiny turns)  -> blur from distance to the focal plane; depth of field shrinks with zoom
 *        zoom dial                  -> fly gets bigger AND the field of view (in mm) shrinks
 *        moving the specimen        -> fly shifts inside the circular field
 * All numbers are a SIMULATION for teaching, not a real measurement.
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, clamp = DW.clamp, A = DW.audio;

  /* ---------- generic full-screen "screens" ---------- */
  DW.screens = {
    list: [],
    make(name, cls) { const el = h('section', { class: 'screen ' + (cls || ''), 'data-name': name }); DW.ui.screens.append(el); return el; },
    open(el) { el.classList.add('on'); requestAnimationFrame(() => el.classList.add('in')); },
    close(el) { el.classList.remove('in'); return DW.sleep(350).then(() => el.classList.remove('on')); },
  };

  /* ---------- Rotary knob ---------- */
  function Knob(o) {
    const range = o.range || 300, span = o.max - o.min;
    let val = o.value;
    const ticks = [...Array(21)].map((_, i) => `<rect x="-1.2" y="-54" width="2.4" height="${i % 5 === 0 ? 8 : 4.5}" rx="1" transform="rotate(${-range / 2 + (i * range) / 20})" fill="${i % 5 === 0 ? '#9fd6e0' : '#4e7684'}"/>`).join('');
    const grip = [...Array(16)].map((_, i) => `<rect x="-3" y="-41" width="6" height="9" rx="2" transform="rotate(${i * 22.5})" fill="#10202a"/>`).join('');
    const ro = h('div', { class: 'k-val' });
    const svg = h('div', { class: 'k-svg', html: `<svg viewBox="-60 -60 120 120" aria-hidden="true">${ticks}<g class="kb"><circle r="38" fill="url(#kg)" stroke="#071117" stroke-width="3"/>${grip}<circle r="22" fill="#2b4150" stroke="#071117" stroke-width="2"/><rect x="-3.200" y="-33" width="6.400" height="17" rx="3" fill="#ffd36b"/></g></svg>` });
    const el = h('div', { class: 'knob', tabindex: 0, role: 'slider', 'aria-label': o.label, 'aria-valuemin': o.min, 'aria-valuemax': o.max }, svg, h('div', { class: 'k-label' }, o.label), ro);
    const kb = el.querySelector('.kb');
    let lastStep = 0;
    function set(v, silent) {
      v = clamp(v, o.min, o.max); val = v;
      kb.setAttribute('transform', 'rotate(' + ((v - o.min) / span * range - range / 2) + ')');
      el.setAttribute('aria-valuenow', Math.round(v)); ro.textContent = o.fmt ? o.fmt(v) : Math.round(v);
      const st = Math.floor(((v - o.min) / span) * 40);
      if (st !== lastStep) { lastStep = st; if (!silent) A.play('tick'); }
      if (!silent && o.onChange) o.onChange(v);
    }
    let prev = null;
    const ang = (e) => { const r = svg.getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
    svg.addEventListener('pointerdown', (e) => { svg.setPointerCapture(e.pointerId); prev = ang(e); el.classList.add('grab'); e.preventDefault(); el.focus({ preventScroll: true }); });
    svg.addEventListener('pointermove', (e) => {
      if (prev == null) return;
      const a = ang(e); let d = a - prev; if (d > 180) d -= 360; if (d < -180) d += 360; prev = a;
      set(val + (d / range) * span);
    });
    const end = () => { prev = null; el.classList.remove('grab'); };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    el.addEventListener('wheel', (e) => { e.preventDefault(); set(val - Math.sign(e.deltaY) * span * (e.shiftKey ? 0.004 : 0.02)); }, { passive: false });
    el.addEventListener('keydown', (e) => {
      const big = span / 40, small = span / 400;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(val + (e.shiftKey ? small : big)); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(val - (e.shiftKey ? small : big)); e.preventDefault(); }
    });
    set(val, true);
    return { el, set, get: () => val };
  }
  DW.Knob = Knob;

  /* ---------- Scope screen ---------- */
  const S = (DW.scope = {});
  const sp = (S.sp = { light: false, intensity: 22, focus: 10, zoomT: 0.2, px: -4, py: 3, ideal: 62, sex: 'f', placed: false });
  const zoomOf = (t) => 0.7 * Math.pow(4.5 / 0.7, t);
  S.zoom = () => zoomOf(sp.zoomT);

  S.build = function () {
    if (S.el) return;
    const el = (S.el = DW.screens.make('scope', 'scope-screen'));
    el.innerHTML = `
      <svg width="0" height="0" style="position:absolute"><defs><radialGradient id="kg" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6b8795"/><stop offset="1" stop-color="#1d2e38"/></radialGradient></defs></svg>
      <div class="sc-bg"></div>
      <div class="sc-title"><span class="kick" id="scKick">RESEARCH STATION</span><b id="scTitle">Stereomicroscope</b></div>
      <div class="sc-left">
        <div class="sc-illus">${DW.art.scopeSVG('sc-')}<div class="spec-ring" id="specRing"></div></div>
        <div class="part-card" id="partCard"></div>
        <div class="prep-tray" id="prepTray"></div>
      </div>
      <div class="sc-center">
        <div class="field-wrap">
          <div class="field" id="field"><div class="fc" id="fc"><svg viewBox="0 0 400 400" id="fsvg"></svg></div>
            <div class="f-wash" id="fWash"></div><div class="f-vig"></div><div class="f-dark" id="fDark"></div>
            <div class="f-sheen"></div>
            <div class="f-arrow" id="fArrow">➤</div>
            <div class="scalebar" id="scalebar"><i></i><span>1 mm</span></div>
          </div>
          <div class="field-meta"><span id="fmZoom"></span><span id="fmFov"></span><span class="sim">SIMULATION</span></div>
        </div>
        <div class="coach" id="coach"></div>
      </div>
      <div class="sc-steps" id="scSteps"></div>
      <div class="sc-dock" id="scDock"></div>`;
    S.q = (s) => el.querySelector(s);
    S.svg = S.q('.scopesvg');
    S.g = (id) => S.svg.querySelector('#sc-' + id);
    S.field = S.q('#field'); S.fc = S.q('#fc'); S.fsvg = S.q('#fsvg');
    S.buildField(); S.buildDock(); S.bindParts();
    S.renderIllus();
  };

  /* the circular view: plate texture + fly (fly group rebuilt when the specimen changes) */
  S.buildField = function () {
    const rnd = DW.rng(7), specks = [];
    for (let i = 0; i < 46; i++) specks.push(`<circle cx="${(rnd() - 0.5) * 900}" cy="${(rnd() - 0.5) * 900}" r="${0.8 + rnd() * 2.6}" fill="#8b8f74" opacity="${0.2 + rnd() * 0.35}"/>`);
    for (let i = 0; i < 12; i++) { const x = (rnd() - 0.5) * 800, y = (rnd() - 0.5) * 800, a = rnd() * 180; specks.push(`<path d="M${x} ${y}l${20 + rnd() * 40} ${rnd() * 8}" stroke="#a7a98f" stroke-width="1.5" opacity=".45" transform="rotate(${a} ${x} ${y})"/>`); }
    S.fsvg.innerHTML = `
      <defs><radialGradient id="plateG" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#f4f0dc"/><stop offset=".7" stop-color="#dcd9bd"/><stop offset="1" stop-color="#bdbda0"/></radialGradient></defs>
      <rect x="-10" y="-10" width="420" height="420" fill="url(#plateG)"/>
      <g id="plateTex" transform="translate(200 200)">${specks.join('')}<path d="M-600 40H600M-600 -160H600M-600 240H600" stroke="#b8b79c" stroke-width="1" opacity=".35"/></g>
      <g id="flyG"></g>`;
    S.flyG = S.fsvg.querySelector('#flyG');
  };
  S.setSpecimen = function (sex, scale) {
    sp.sex = sex; sp.scaleF = scale || (sex === 'm' ? 0.92 : 1.02);
    S.flyG.innerHTML = DW.art.fly({ sex, wing: 50, det: 0.55 });
    // little fly on the illustration stage
    const spec = S.g('spec');
    spec.querySelector('.specmark').innerHTML = '<g transform="rotate(-20) scale(0.085)">' + DW.art.fly({ sex, wing: 50, det: 0 }) + '</g>';
  };

  /* ---------- illustration state ---------- */
  S.renderIllus = function () {
    const lum = sp.light ? sp.intensity / 100 : 0;
    S.g('focusG').style.transform = `translateY(${-(sp.focus - 50) * 0.7}px)`;
    S.g('fknob').setAttribute('transform', 'rotate(' + ((sp.focus / 100) * 300 - 150) + ')');
    S.g('dial').setAttribute('transform', 'rotate(' + (-120 + (sp.intensity / 100) * 240) + ')');
    S.g('ridges').setAttribute('transform', 'translate(' + (-sp.zoomT * 120) + ' 0)');
    S.g('glow').setAttribute('opacity', sp.light ? 0.25 + lum * 0.75 : 0);
    S.g('led').setAttribute('fill', sp.light ? '#3cf0a0' : '#33454d');
    S.g('swk').setAttribute('x', sp.light ? 2 : -17);
    S.g('swk').setAttribute('fill', sp.light ? '#ffd36b' : '#8fa5ad');
    S.g('spec').setAttribute('opacity', sp.placed ? 1 : 0);
  };
  S.focusBlur = function () { // simulated blur in px
    const zoom = zoomOf(sp.zoomT);
    return Math.min(16, Math.abs(sp.focus - sp.ideal) * 0.28 * (0.55 + 0.45 * zoom));
  };
  S.lum = () => (sp.light ? sp.intensity / 100 : 0);
  S.lightGood = () => sp.light && S.lum() >= 0.38 && S.lum() <= 0.72;

  S.renderField = function () {
    const zoom = zoomOf(sp.zoomT), fov = 20 / zoom, lum = S.lum(), blur = S.focusBlur();
    const bright = sp.light ? 0.1 + lum * 1.6 : 0.025;
    const contrast = lum > 0.75 ? Math.max(0.25, 1 - (lum - 0.75) * 2.4) : lum < 0.3 ? 0.55 + lum : 1;
    const wash = Math.max(0, lum - 0.72) * 2.3;
    S.fc.style.filter = `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
    S.q('#fWash').style.opacity = clamp(wash, 0, 0.75);
    const upm = 20 * zoom; // field units per mm (400 units = field of view)
    S.q('#plateTex').setAttribute('transform', `translate(200 200) scale(${zoom})`);
    const s = (upm / DW.art.UNITS_PER_MM) * (sp.scaleF || 1);
    S.flyG.setAttribute('transform', `translate(${200 + sp.px * upm} ${200 + sp.py * upm}) rotate(-14) scale(${s.toFixed(4)}) translate(0 10)`);
    // detail layer opacity rises with magnification so facets/bristles appear when zoomed in
    S.flyG.style.setProperty('--det', clamp((zoom - 1.2) / 2.2, 0.1, 0.85).toFixed(2));
    S.q('#fmZoom').textContent = 'Eyepiece 10×  ·  Zoom ' + zoom.toFixed(1) + '×  ·  Total ' + Math.round(zoom * 10) + '×';
    S.q('#fmFov').textContent = 'Field ≈ ' + fov.toFixed(1) + ' mm';
    const sb = S.q('#scalebar'); sb.style.width = (upm / 400) * 100 + '%'; // 1 mm
    S.q('#fDark').style.opacity = sp.light ? 0 : 1;
    const ar = S.q('#fArrow'), dx = sp.px * upm, dy = sp.py * upm, d = Math.hypot(dx, dy);
    if (sp.light && d > 170) { const a = Math.atan2(dy, dx); ar.style.opacity = 1; ar.style.left = (50 + 38 * Math.cos(a)) + '%'; ar.style.top = (50 + 38 * Math.sin(a)) + '%'; ar.style.transform = `translate(-50%,-50%) rotate(${a}rad)`; } else ar.style.opacity = 0;
  };

  /* ---------- the control dock ---------- */
  S.buildDock = function () {
    const dock = S.q('#scDock');
    const power = h('button', { class: 'power', 'data-ctl': 'power', 'aria-pressed': 'false', html: '<i class="led"></i><span>Light</span><b>OFF</b>' });
    power.addEventListener('click', () => { sp.light = !sp.light; A.play(sp.light ? 'switchOn' : 'switchOff'); S.changed(); });
    S.power = power;
    S.kLight = Knob({ id: 'bright', label: 'Brightness', min: 0, max: 100, value: sp.intensity, fmt: (v) => Math.round(v) + '%', onChange: (v) => { sp.intensity = v; S.changed(); } });
    S.kFocus = Knob({ id: 'focus', label: 'Focus knob', min: 0, max: 100, value: sp.focus, fmt: () => '', onChange: (v) => { sp.focus = v; S.changed(); } });
    S.kZoom = Knob({ id: 'zoom', label: 'Zoom dial', min: 0, max: 1, value: sp.zoomT, fmt: (v) => zoomOf(v).toFixed(1) + '×', onChange: (v) => { sp.zoomT = v; S.changed(); } });
    S.kLight.el.dataset.ctl = 'bright'; S.kFocus.el.dataset.ctl = 'focus'; S.kZoom.el.dataset.ctl = 'zoom';
    const nudge = (dir) => h('button', { class: 'nudge', 'aria-label': 'Tiny focus turn ' + (dir < 0 ? 'down' : 'up'), html: icon(dir < 0 ? 'left' : 'right', 18), onclick: () => { sp.focus = clamp(sp.focus + dir * 0.6, 0, 100); S.kFocus.set(sp.focus, true); A.play('tick'); S.changed(); } });
    const tiny = h('div', { class: 'tiny', 'data-ctl': 'tiny' }, nudge(-1), h('span', null, 'tiny turn'), nudge(1));
    const mv = (dx, dy, ic) => h('button', { class: 'mv', 'aria-label': 'Move fly ' + ic, html: icon(ic, 20), onclick: () => { sp.px = clamp(sp.px + dx, -9, 9); sp.py = clamp(sp.py + dy, -9, 9); A.play('tick'); S.changed(); } });
    const pad = h('div', { class: 'pad', 'data-ctl': 'move' }, mv(0, -0.25, 'up'), mv(-0.25, 0, 'left'), h('i', { class: 'pad-c', html: icon('hand', 20) }), mv(0.25, 0, 'right'), mv(0, 0.25, 'down'));
    dock.append(
      h('div', { class: 'dc dc-power' }, power),
      h('div', { class: 'dc' }, S.kLight.el),
      h('div', { class: 'dc' }, S.kFocus.el, tiny),
      h('div', { class: 'dc' }, S.kZoom.el),
      h('div', { class: 'dc dc-move' }, pad, h('div', { class: 'k-label' }, 'Move the fly')));
    // drag the fly inside the view to move the specimen on the stage
    let drag = null;
    S.field.addEventListener('pointerdown', (e) => { if (!S.master) return; drag = { x: e.clientX, y: e.clientY, px: sp.px, py: sp.py }; S.field.setPointerCapture(e.pointerId); S.field.classList.add('grab'); });
    S.field.addEventListener('pointermove', (e) => {
      if (!drag) return; const r = S.field.getBoundingClientRect(), upm = (r.width / 400) * 20 * zoomOf(sp.zoomT);
      sp.px = clamp(drag.px + (e.clientX - drag.x) / upm, -9, 9); sp.py = clamp(drag.py + (e.clientY - drag.y) / upm, -9, 9); S.changed(true);
    });
    const end = () => { if (drag) { drag = null; S.field.classList.remove('grab'); A.play('drop'); } };
    S.field.addEventListener('pointerup', end); S.field.addEventListener('pointercancel', end);
  };

  S.changed = function (quiet) {
    S.power.setAttribute('aria-pressed', sp.light); S.power.classList.toggle('on', sp.light); S.power.querySelector('b').textContent = sp.light ? 'ON' : 'OFF';
    S.renderIllus(); S.renderField();
    if (S.master) S.evaluate();
  };

  /* ---------- MASTER phase: step checking against the live simulation ---------- */
  const STEP_CTL = ['power', 'bright', 'focus', 'tiny', 'zoom', 'move'];
  const STEP_LABELS = ['Turn the light on', 'Make the light just right', 'Find the focus', 'Make it sharp', 'Zoom in', 'Put the fly in the middle'];
  S.coachText = function () {
    const m = S.master; if (!m) return '';
    const lum = S.lum(), blur = S.focusBlur();
    switch (m.step) {
      case 0: return 'It is dark. Tap the light switch!';
      case 1: return lum < 0.38 ? 'A bit dark. Turn the brightness up.' : lum > 0.72 ? 'Too bright! Everything looks washed out. Turn it down.' : 'Nice and clear. Hold it there!';
      case 2: return blur > 3.5 ? 'Blurry! Turn the focus knob slowly until the fly looks clearer.' : 'Getting clearer!';
      case 3: return blur > 1.0 ? 'Almost! Use the tiny turn buttons for a super sharp picture.' : 'Sharp!';
      case 4: return 'Turn the zoom dial. Watch the fly get bigger and the view get smaller.';
      case 5: return blur > 1.4 ? 'Zooming in made it blurry again. Tiny turns will fix it!' : 'Drag the fly into the middle of the circle.';
      default: return 'You did it!';
    }
  };
  S.drawSteps = function () {
    const m = S.master, box = S.q('#scSteps'); box.innerHTML = '';
    STEP_LABELS.forEach((l, i) => box.append(h('div', { class: 'st ' + (i < m.step ? 'done' : i === m.step ? 'cur' : ''), html: '<i>' + (i < m.step ? icon('check', 14) : i + 1) + '</i><span>' + l + '</span>' })));
    DW.$$('[data-ctl]', S.el).forEach((c) => c.classList.toggle('need', c.dataset.ctl === STEP_CTL[m.step]));
    S.q('#coach').textContent = S.coachText();
    DW.ui.setProgress(m.step, STEP_LABELS[m.step]);
  };
  S.evaluate = function () {
    const m = S.master; if (!m || m.finished) return;
    S.q('#coach').textContent = S.coachText();
    const zoom = zoomOf(sp.zoomT), blur = S.focusBlur(), ok = S.lightGood();
    let pass = false;
    switch (m.step) {
      case 0: pass = sp.light; break;
      case 1: if (ok) { m.hold = m.hold || performance.now(); pass = performance.now() - m.hold > 700; if (!pass) setTimeout(() => S.master && S.evaluate(), 760); } else m.hold = 0; break;
      case 2: pass = sp.light && S.lum() > 0.2 && blur < 3.5; break;
      case 3: pass = ok && blur < 1.0; break;
      case 4: pass = zoom >= 2.5; break;
      case 5: pass = ok && blur < 1.4 && Math.abs(sp.px) <= 0.8 && Math.abs(sp.py) <= 0.8; break;
    }
    if (pass) S.stepDone();
  };
  S.stepDone = function () {
    const m = S.master; m.step++; m.hold = 0;
    A.play(m.step >= 6 ? 'success' : 'ding');
    S.drawSteps();
    const done = S.q('#scSteps').children[m.step - 1]; done && DW.fx.sparkleAt(done, 14);
    if (m.step === 4) DW.bus.emit('scope:sharp');
    if (m.step >= 6) { m.finished = true; DW.fx.confetti(); S.q('#coach').textContent = 'Perfect! Light, focus, zoom and position: all just right.'; setTimeout(() => m.resolve(), 1300); }
    else { setTimeout(S.evaluate, 50); }
  };
  S.hintMaster = function () {
    const m = S.master; if (!m) return null;
    const t = ['Tap the glowing light switch.', 'Turn the brightness knob. Not too dark, not too bright.', 'Turn the focus knob slowly until the fly looks clear.', 'Use the tiny turn arrows for a sharp picture.', 'Turn the zoom dial to make the fly bigger.', 'Drag the fly to the middle of the circle, then fix the focus with tiny turns.'];
    return t[m.step];
  };

  /* ---------- LEARN phase ---------- */
  S.bindParts = function () {
    S.svg.addEventListener('click', (e) => { const p = e.target.closest('.part'); if (p && S.learn) S.tapPart(p.dataset.part); });
    S.svg.addEventListener('keydown', (e) => { const p = e.target.closest && e.target.closest('.part'); if (p && S.learn && (e.key === 'Enter' || e.key === ' ')) S.tapPart(p.dataset.part); });
    DW.$$('.part', S.svg).forEach((p) => { p.setAttribute('tabindex', 0); p.setAttribute('role', 'button'); p.setAttribute('aria-label', DW.data.parts[p.dataset.part].name); });
    S.svg.addEventListener('pointerover', (e) => { const p = e.target.closest('.part'); if (p && S.learn) DW.ui.tip.show(DW.data.parts[p.dataset.part].name, e.clientX, e.clientY); else DW.ui.tip.hide(); });
    S.svg.addEventListener('pointermove', (e) => { const p = e.target.closest('.part'); if (p && S.learn) DW.ui.tip.move(e.clientX, e.clientY); else DW.ui.tip.hide(); });
    S.svg.addEventListener('pointerleave', () => DW.ui.tip.hide());
  };
  S.tapPart = function (id) {
    const L = S.learn; if (!L) return;
    const d = DW.data.parts[id];
    DW.$$('.part', S.svg).forEach((p) => p.classList.remove('active', 'hint'));
    S.svg.querySelector('.part[data-part="' + id + '"]').classList.add('active');
    const first = !L.seen.has(id); L.seen.add(id);
    A.play(first ? 'ding' : 'click');
    const card = S.q('#partCard');
    card.innerHTML = `<div class="pc-ic">${icon(d.icon, 26)}</div><div><b>${d.name}</b><p>${d.text}</p></div><div class="pc-n">${L.seen.size} / ${DW.data.partOrder.length}</div>`;
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('on', 'pop');
    A.speak(d.name + '. ' + d.text, 'maya');
    DW.ui.setProgress(0, 'Tap each part: ' + L.seen.size + ' of ' + DW.data.partOrder.length);
    const c = S.svg.querySelector('.part[data-part="' + id + '"]').getBoundingClientRect(); if (first) DW.fx.burst(c.left + c.width / 2, c.top + c.height / 2, { n: 14, speed: 4, life: 40 });
    if (L.seen.size >= DW.data.partOrder.length && !L.done) { L.done = true; setTimeout(() => L.resolve(), 1800); }
  };
  S.hintLearn = function () {
    const L = S.learn; if (!L) return;
    const next = DW.data.partOrder.find((p) => !L.seen.has(p)); if (!next) return;
    DW.$$('.part', S.svg).forEach((p) => p.classList.remove('hint'));
    S.svg.querySelector('.part[data-part="' + next + '"]').classList.add('hint');
  };

  /* ---------- PREP phase: drag a fly to the stage ---------- */
  S.stagePoint = function () {
    const svg = S.svg, pt = svg.createSVGPoint(); pt.x = 300; pt.y = 540;
    const m = pt.matrixTransform(svg.getScreenCTM()); return { x: m.x, y: m.y };
  };
  S.buildTray = function () {
    const tray = S.q('#prepTray'); tray.innerHTML = '';
    tray.append(h('div', { class: 'pt-title', html: icon('pad', 18) + '<span>Sleepy-fly pad</span>' }));
    const row = h('div', { class: 'pt-row' }); tray.append(row);
    S.trayFlies = [];
    DW.shuffle(['f', 'm', 'f']).forEach((sex, i) => {
      const f = h('button', { class: 'tfly', 'aria-label': 'Sleeping fly ' + (i + 1) + '. Drag it to the stage.', 'data-sex': sex, style: { '--r': (i * 37 - 30) + 'deg' }, html: DW.art.flySVG({ sex, wing: 48, det: 0, scale: 1 }) + '<span class="zzz">z<i>z</i></span>' });
      row.append(f); S.trayFlies.push(f);
      S.bindDrag(f);
    });
    tray.classList.add('on');
  };
  S.bindDrag = function (f) {
    let ghost = null, sx = 0, sy = 0, ox = 0, oy = 0, id = null;
    f.addEventListener('pointerdown', (e) => {
      if (!S.prep || S.prep.busy) return;
      e.preventDefault(); id = e.pointerId; f.setPointerCapture(id);
      const r = f.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; sx = e.clientX; sy = e.clientY;
      ghost = h('div', { class: 'ghostfly', html: f.querySelector('svg').outerHTML }); ghost.style.left = ox + 'px'; ghost.style.top = oy + 'px'; DW.ui.game.append(ghost);
      f.classList.add('lifted'); A.play('pickup'); S.q('#specRing').classList.add('live');
    });
    f.addEventListener('pointermove', (e) => {
      if (!ghost) return;
      const x = ox + e.clientX - sx, y = oy + e.clientY - sy; ghost.style.left = x + 'px'; ghost.style.top = y + 'px';
      const t = S.stagePoint(), d = Math.hypot(x - t.x, y - t.y); S.q('#specRing').classList.toggle('near', d < 80);
      ghost.style.transform = `translate(-50%,-50%) rotate(${(e.clientX - sx) * 0.1}deg) scale(${d < 80 ? 0.8 : 1})`;
    });
    const drop = async (e) => {
      if (!ghost) return;
      const g = ghost; ghost = null; const x = parseFloat(g.style.left), y = parseFloat(g.style.top), t = S.stagePoint();
      S.q('#specRing').classList.remove('near', 'live');
      if (Math.hypot(x - t.x, y - t.y) < 80) await S.place(f, g, x, y, t);
      else {
        A.play('nope'); g.style.transition = 'all .35s cubic-bezier(.3,1.4,.5,1)'; g.style.left = ox + 'px'; g.style.top = oy + 'px'; g.style.transform = 'translate(-50%,-50%)';
        setTimeout(() => { g.remove(); f.classList.remove('lifted'); }, 360);
        S.q('#coach').textContent = 'Almost! Drop the fly on the glowing stage.';
      }
    };
    f.addEventListener('pointerup', drop); f.addEventListener('pointercancel', drop);
    f.addEventListener('click', (e) => { // tap-to-select alternative (keyboard / touch friendly)
      if (!S.prep || S.prep.busy || e.detail === 0 && false) return;
      S.trayFlies.forEach((x) => x.classList.remove('sel')); f.classList.add('sel'); S.prep.sel = f; A.play('click');
      S.q('#specRing').classList.add('live'); S.q('#coach').textContent = 'Now tap the glowing stage.';
    });
  };
  S.place = async function (f, ghost, x, y, t) {
    S.prep.busy = true;
    ghost.style.transition = 'all .22s cubic-bezier(.2,1.6,.4,1)'; ghost.style.left = t.x + 'px'; ghost.style.top = t.y + 'px'; ghost.style.transform = 'translate(-50%,-50%) scale(.55) rotate(-20deg)';
    await DW.sleep(230); ghost.remove();
    A.play('snap'); DW.fx.burst(t.x, t.y, { n: 24, speed: 5, life: 50 });
    S.setSpecimen(f.dataset.sex); sp.placed = true; S.renderIllus();
    const spec = S.g('spec'); spec.style.transition = 'none'; DW.tween(380, (k) => spec.setAttribute('transform', `translate(300 ${547 - Math.sin(k * Math.PI) * 18}) scale(${0.6 + 0.4 * k})`), DW.ease.out);
    S.trayFlies.forEach((x) => { x.classList.remove('sel', 'lifted'); if (x !== f) x.classList.add('stay'); }); f.classList.add('used');
    S.q('#coach').textContent = 'Perfect landing!';
    S.q('#specRing').classList.remove('live');
    await DW.sleep(700);
    S.prep.resolve({ sex: f.dataset.sex });
  };

  /* ---------- open / close / phases ---------- */
  S.open = function (phase) {
    S.build();
    const el = S.el;
    el.dataset.phase = phase; S.master = null; S.learn = null; S.prep = null;
    S.q('#scKick').textContent = phase === 'learn' ? 'MISSION 2 · MEET THE PARTS' : phase === 'prep' ? 'MISSION 3 · PREPARE THE SPECIMEN' : 'MISSION 4 · MASTER THE MICROSCOPE';
    DW.$$('.part', S.svg).forEach((p) => p.classList.remove('active', 'hint'));
    S.q('#partCard').classList.remove('on'); S.q('#prepTray').classList.remove('on');
    S.q('#coach').textContent = '';
    S.renderIllus(); S.renderField();
    DW.screens.open(el);
    DW.ui.setNav({ view: 'scope' });
  };
  S.close = function () { DW.ui.setNav({ view: 'lab' }); return DW.screens.close(S.el); };
  S.isOpen = () => S.el && S.el.classList.contains('on');

  S.runLearn = function () {
    S.open('learn');
    return new Promise((resolve) => { S.learn = { seen: new Set(), resolve }; setTimeout(() => S.q('#partCard').classList.remove('on'), 0); });
  };
  S.runPrep = function () {
    S.open('prep'); sp.placed = false; S.renderIllus(); S.g('spec').setAttribute('transform', 'translate(300 547)');
    S.buildTray();
    return new Promise((resolve) => {
      S.prep = { resolve, busy: false, sel: null };
      S.q('#coach').textContent = 'Drag a sleepy fly to the glowing stage.';
      const ring = S.q('#specRing'); ring.classList.add('show');
      ring.onclick = () => { if (S.prep && S.prep.sel && !S.prep.busy) { const f = S.prep.sel; const t = S.stagePoint(); const r = f.getBoundingClientRect(); const g = h('div', { class: 'ghostfly', html: f.querySelector('svg').outerHTML }); g.style.left = r.left + r.width / 2 + 'px'; g.style.top = r.top + r.height / 2 + 'px'; DW.ui.game.append(g); S.place(f, g, 0, 0, t); } };
    }).then((r) => { S.q('#specRing').classList.remove('show'); return r; });
  };
  S.runMaster = function (sex) {
    if (sex) S.setSpecimen(sex);
    sp.placed = true; sp.light = false; sp.intensity = 22; sp.focus = 10; sp.zoomT = 0.2; sp.px = -4; sp.py = 3;
    S.open('master');
    S.kLight.set(sp.intensity, true); S.kFocus.set(sp.focus, true); S.kZoom.set(sp.zoomT, true);
    S.changed(true);
    return new Promise((resolve) => { S.master = { step: 0, hold: 0, resolve, finished: false }; S.drawSteps(); S.evaluate(); });
  };
  /* anatomy/detective reuse the same settings as "ready" values */
  S.endMaster = function () { S.master = null; };
})();
