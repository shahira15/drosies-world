/* Mission 3: Spot the Hazard. A pannable lab (2400 units wide), 6 of 8 hazards placed at random each play. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, art = DW.art;
  const BENCH = [340, 580, 1040, 1280, 1800], BENCH_Y = 598;
  const FLOOR = [200, 600, 800, 1250, 1500, 1900], FLOOR_Y = 842;

  L0.missions[3] = async function (run) {
    const scr = L0.screen('l0m3', '<rect width="1600" height="900" fill="#0b1a26"/>'), st = scr.stage;
    const ids = DW.shuffle(D0.hazardIds).slice(0, 6);
    if (!ids.includes('exit') && Math.random() < 0.5) ids[0] = 'exit';
    const L = {}; // id -> {x,y}
    const bench = DW.shuffle(BENCH), floor = DW.shuffle(FLOOR);
    ids.forEach((id) => {
      const t = D0.hazards[id].slotType;
      if (t === 'exit') L[id] = { x: 2262, y: 782 };
      else if (t === 'bench') L[id] = { x: bench.shift(), y: BENCH_Y };
      else L[id] = { x: floor.shift(), y: FLOOR_Y };
    });
    const okKid = floor.shift();

    /* world */
    const world = h('div', { class: 'l0-world' });
    const svgNS = '<svg viewBox="0 0 2400 900" preserveAspectRatio="none" role="img" aria-label="A busy science lab with some safety problems to find">' +
      art.hazardLabBase() + '<g class="hz-layer">' +
      ids.map((id) => `<g class="hz" data-id="${id}" role="button" tabindex="0" aria-label="Something in the lab. Tap to look closer." transform="translate(${L[id].x} ${L[id].y})"><g class="hz-art">${art.hazard(id, false)}</g><rect class="hit" x="-110" y="-250" width="220" height="270" rx="26"/></g>`).join('') +
      `<g class="hz decoyk" data-id="okkid" role="button" tabindex="0" aria-label="A scientist working safely" transform="translate(${okKid} ${FLOOR_Y})"><g class="hz-art">${art.hazard('okkid')}</g><rect class="hit" x="-90" y="-250" width="180" height="270" rx="26"/></g></g></svg>`;
    world.innerHTML = svgNS; st.append(world);
    const svg = world.firstChild;
    // decoys already in the background (eyewash, extinguisher)
    svg.querySelectorAll('.decoy').forEach((g) => { g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', g.dataset.id === 'eyewash' ? 'Eyewash station' : 'Fire extinguisher'); g.classList.add('hz'); const bb = g.getBBox(); g.insertAdjacentHTML('beforeend', `<rect class="hit" x="${bb.x - 10}" y="${bb.y - 10}" width="${bb.width + 20}" height="${bb.height + 20}" rx="12"/>`); });

    /* camera */
    const cam = { x: 800, y: 450, z: 1, ax: 800, ay: 450 };
    const px = () => st.clientWidth, u = () => px() / 1600;
    function apply() {
      const W = px(), H = st.clientHeight, k = u();
      let tx = cam.ax * k - cam.x * k * cam.z, ty = cam.ay * k - cam.y * k * cam.z;
      tx = Math.min(0, Math.max(W - 2400 * k * cam.z, tx)); ty = Math.min(0, Math.max(H - 900 * k * cam.z, ty));
      world.style.transform = `translate(${tx}px,${ty}px) scale(${cam.z})`;
      cam.tx = tx;
      const frac = Math.max(0, Math.min(1, (-tx / k) / 800));
      if (view) view.style.left = (frac * 60) + '%';
    }
    async function moveTo(x, y, z, ax, ay, ms) {
      const f = { x: cam.x, y: cam.y, z: cam.z, ax: cam.ax, ay: cam.ay };
      await L0.G(DW.tween(ms || 700, (t) => { cam.x = DW.lerp(f.x, x, t); cam.y = DW.lerp(f.y, y, t); cam.z = DW.lerp(f.z, z, t); cam.ax = DW.lerp(f.ax, ax, t); cam.ay = DW.lerp(f.ay, ay, t); apply(); }, DW.ease.inOut));
    }
    const pan = (d) => { cam.x = Math.max(800, Math.min(1600, cam.x + d)); apply(); };
    let panLock = true;

    /* UI overlays */
    const found = L0.box(st, 'l0-found', 560, 112, 480, 54);
    const view = h('i'); const minimap = L0.box(st, 'l0-minimap', 560, 176, 480, 18, null, view);
    const pL = L0.box(st, 'l0-pan l', 14, 380, 70, 90, { }); const pR = L0.box(st, 'l0-pan r', 1516, 380, 70, 90, {});
    pL.innerHTML = '<button aria-label="Look left">' + icon('left', 30) + '</button>'; pR.innerHTML = '<button aria-label="Look right">' + icon('right', 30) + '</button>';
    pL.firstChild.onclick = () => { A.play('click'); smoothPan(-420); }; pR.firstChild.onclick = () => { A.play('click'); smoothPan(420); };
    async function smoothPan(d) { if (panLock) return; const t = Math.max(800, Math.min(1600, cam.x + d)); await moveTo(t, 450, 1, 800, 450, 450); }
    let nFound = 0, firstOK = 0; const done = new Set();
    function counter() {
      found.innerHTML = '<b>' + icon('lens', 22) + ' Hazards found</b><span>' + [...Array(ids.length)].map((_, i) => '<i class="' + (i < nFound ? 'on' : '') + '"></i>').join('') + '</span><em>' + nFound + '/' + ids.length + '</em>';
      ui.setProgress(nFound ? 0 : 0, nFound + ' of ' + ids.length + ' hazards found');
      ui._objs = ids.map((x, i) => 'Hazard ' + (i + 1)); ui.setProgress(nFound, nFound + ' of ' + ids.length + ' hazards found');
    }
    counter();

    /* drag to pan */
    let drag = null, moved = 0;
    world.addEventListener('pointerdown', (e) => { if (panLock) return; drag = { x: e.clientX, cx: cam.x }; moved = 0; });
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    function onMove(e) { if (!drag || run.dead) return; const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); if (moved > 8) { cam.x = Math.max(800, Math.min(1600, drag.cx - dx / u())); apply(); } }
    function onUp() { drag = null; setTimeout(() => { moved = 0; }, 0); }
    const keyH = (e) => { if (run.dead || panLock || ui.modal.classList.contains('on')) return; if (e.target.closest && e.target.closest('.l0-ask')) return; if (e.key === 'ArrowLeft') pan(-80); else if (e.key === 'ArrowRight') pan(80); };
    document.addEventListener('keydown', keyH);
    world.addEventListener('wheel', (e) => { if (!panLock) { pan(e.deltaY + e.deltaX); } }, { passive: true });
    const cleanup = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); document.removeEventListener('keydown', keyH); offHint(); ui.btnHint.style.display = ''; };

    /* hazard handling */
    let busy = true; // locked while Dr. Maya introduces the mission
    async function onHazard(id, g) {
      if (busy || moved > 8 || run.dead) return; busy = true; panLock = true;
      const hz = D0.hazards[id]; const at = L[id];
      A.play('ding');
      await moveTo(Math.max(560, at.x), at.y - 150, 1.35, 540, 470, 750);
      g.classList.add('spot');
      const bub = L0.box(st, 'l0-risk', 40, 150, 440, 130);
      bub.innerHTML = '<b>' + icon('alert', 20) + ' What could go wrong?</b><p></p>'; bub.querySelector('p').textContent = hz.risk;
      const r = await L0.ask({ stage: st, title: hz.name, icon: hz.icon, q: hz.q, opts: hz.opts, where: 'right' });
      bub.remove(); g.classList.remove('spot');
      if (r.first) firstOK++;
      // scene update
      done.add(id); nFound++; g.classList.add('fixed');
      g.querySelector('.hz-art').innerHTML = art.hazard(id, true);
      A.play('success'); DW.fx.sparkleAt(g, 16); L0.journal(hz.j); counter();
      await moveTo(Math.max(800, Math.min(1600, at.x)), 450, 1, 800, 450, 700);
      panLock = false; busy = false;
      if (nFound === ids.length) finishUp();
    }
    svg.querySelectorAll('.hz').forEach((g) => {
      const id = g.dataset.id;
      const act = () => {
        if (run.dead || busy || moved > 8) return;
        if (D0.hazards[id]) { if (!done.has(id)) onHazard(id, g); else ui.toast('You already fixed this one!', 'check', 1800); }
        else { A.play('hover'); ui.toast(D0.decoys[id] || 'Nothing wrong here.', 'check', 3600); }
      };
      g.addEventListener('click', act);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });

    /* hint */
    ui.btnHint.style.display = 'grid';
    let hintN = 0;
    const offHint = DW.bus.on('hint', () => {
      if (run.dead || busy) return; const left = ids.filter((i) => !done.has(i)); if (!left.length) return;
      hintN++; const id = left[0]; const g = svg.querySelector('.hz[data-id="' + id + '"]');
      L0.tip('maya', hintN % 2 ? 'Look around the ' + (L[id].x > 1600 ? 'right' : L[id].x > 900 ? 'middle' : 'left') + ' side of the lab. There are ' + left.length + ' to find.' : 'Let me show you where to look.', 'think', 5200);
      if (hintN > 1) { g.classList.add('glow'); setTimeout(() => g.classList.remove('glow'), 4500); smoothPan(L[id].x - cam.x); }
    });

    let resolveDone; const allDone = new Promise((r) => { resolveDone = r; });
    function finishUp() { resolveDone(); }

    apply();
    await L0.enter(scr);
    L0.drosieFly(st, 40, 560, ['Bzzz! Tap anything that looks wrong.', 'Drag the lab sideways to look around.', 'You never clean up spills. You tell an adult!']).classList.add('small');
    await L0.maya('Welcome to the Hazard Lab. A hazard is something that could cause harm. Your job is to spot the problems and choose the safe response.', 'happy');
    await L0.maya('Remember: you never clean spills, pick up glass or touch unknown things. You step away and tell an adult. Drag to look around and tap what looks unsafe.', 'neutral');
    ui.hideDlg(); busy = false; panLock = false;

    await L0.G(allDone);
    cleanup();
    await L0.sleep(400);
    const first = firstOK, total = ids.length;
    await L0.maya('You found every hazard. Good scientists look around and speak up. That is what keeps everyone safe.', 'celebrate');
    ui.hideDlg();
    return L0.finish(run, { first, total, pass: L0.threshold(first, total), badge: 'hazard', jr: ['hz-run'], text: 'You found all ' + total + ' hazards and chose the safe response each time. The lab is different every time you play, so try again!' });
  };
})();
