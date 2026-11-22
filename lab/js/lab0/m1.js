/* Mission 1: Suit Up. Drag (or tap) gear onto the scientist. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, art = DW.art;

  L0.missions[1] = async function (run) {
    const scr = L0.screen('l0m1', art.prepRoom()), st = scr.stage, M = D0.m1;
    const items = M.items, byId = {}; items.forEach((i) => (byId[i.id] = i));
    const worn = new Set(); const tried = new Set();
    let sel = null, busy = true, ready = false, glovesNoted = false;

    /* the scientist */
    const kidBox = L0.box(st, 'l0-kidbox', 581, 150, 438, 590);
    const kidBtn = h('button', { class: 'l0-kidhit', 'aria-label': 'The scientist. Select a gear item first, then press here to put it on.' });
    kidBox.append(kidBtn);
    const kidView = h('div', { class: 'l0-kidview' }); kidBox.prepend(kidView);
    const look = (mood) => {
      const wear = { coat: worn.has('coat'), goggles: worn.has('goggles'), gloves: worn.has('gloves'), sunglasses: worn.has('sunglasses'), scarf: worn.has('scarf'), headphones: worn.has('headphones'), cardigan: worn.has('cardigan') };
      wear.shoes = worn.has('sandals') ? 'sandals' : worn.has('shoes') ? 'closed' : undefined;
      kidView.innerHTML = art.kidSVG({ skin: '#d9a27b', hair: '#2b1a14', shirt: '#5aa0d6', pants: '#35507a', pose: ready ? 'wave' : 'stand', hairStyle: worn.has('hairtie') ? 'tied' : 'long', face: mood || (ready ? 'smile' : 'smile'), wear });
      const k = kidView.firstChild; k.classList.add('l0-kid-pop');
    };
    look();

    /* lockers */
    const locker = L0.box(st, 'l0-locker', 36, 128, 520, 520);
    locker.append(h('div', { class: 'l0-locker-h', html: icon('bag', 18) + '<span>GEAR LOCKERS</span>' }));
    const grid = h('div', { class: 'l0-locker-grid' }); locker.append(grid);
    const itemEls = {};
    DW.shuffle(items).forEach((it) => {
      const b = h('button', { class: 'l0-item', 'data-id': it.id, title: it.name, 'aria-label': it.name + '. Drag onto the scientist, or press to select.', html: art.gear(it.id, 76) + '<span>' + it.name + '</span>' });
      itemEls[it.id] = b; grid.append(b);
    });

    /* task + readiness */
    const task = L0.box(st, 'l0-card l0-task', 1050, 128, 520, 150);
    task.innerHTML = '<div class="l0-card-h">' + icon('clipboard', 18) + '<span>TODAY’S JOB</span></div><p></p>';
    task.querySelector('p').textContent = M.scenario;
    const rd = L0.box(st, 'l0-card l0-ready', 1050, 292, 520, 250);
    rd.innerHTML = '<div class="l0-card-h">' + icon('shield', 18) + '<span>READINESS CHECK</span></div>';
    const areas = [['eyes', 'Eyes', 'eye', 'goggles'], ['body', 'Body', 'user', 'coat'], ['feet', 'Feet', 'boot', 'shoes'], ['hair', 'Hair', 'walk', 'hairtie']];
    const chipWrap = h('div', { class: 'l0-areas' }); rd.append(chipWrap);
    const chips = {};
    areas.forEach(([k, label, ic]) => { const c = h('div', { class: 'l0-area', html: '<i>' + icon(ic, 22) + '</i><b>' + label + '</b><em>?</em>' }); chips[k] = c; chipWrap.append(c); });
    const meter = h('div', { class: 'l0-meter' }, h('i')); rd.append(meter);
    const mtxt = h('div', { class: 'l0-mtxt' }, '0 of 4 checks'); rd.append(mtxt);
    const goBtn = L0.box(st, 'l0-go', 1090, 566, 440, 82);
    goBtn.append(h('button', { class: 'primary big', html: icon('check', 26) + ' <span>I’m ready!</span>' }));
    goBtn.style.display = 'none';
    const hintEl = L0.box(st, 'l0-hintline', 1050, 570, 520, 70);

    function update() {
      let n = 0;
      areas.forEach(([k, , , it]) => { const ok = worn.has(it); chips[k].classList.toggle('ok', ok); chips[k].querySelector('em').textContent = ok ? '✓' : '?'; if (ok) n++; });
      meter.firstChild.style.width = (n / 4) * 100 + '%'; mtxt.textContent = n + ' of 4 checks';
      Object.keys(itemEls).forEach((id) => { itemEls[id].classList.toggle('worn', worn.has(id)); itemEls[id].classList.toggle('sel', sel === id); });
      ready = n === 4;
      goBtn.style.display = ready ? '' : 'none'; hintEl.style.display = ready ? 'none' : '';
      if (ready) { ui.setProgress(1); }
      hintEl.textContent = sel ? 'Now tap or press the scientist to put on: ' + byId[sel].name : 'Drag gear to the scientist, or tap a piece, then tap the scientist.';
    }
    update();

    async function equip(id) {
      if (busy || ready && false) return;
      const it = byId[id];
      if (worn.has(id)) { worn.delete(id); sel = null; A.play('drop'); look(); update(); return; }
      sel = null;
      if (it.kind === 'bad') {
        busy = true; worn.add(id); tried.add(id); A.play('nope'); look('think'); update();
        L0.tip('maya', it.why, 'think', 3000);
        await L0.sleep(3000);
        worn.delete(id); A.play('pop'); itemEls[id].classList.add('shake'); setTimeout(() => itemEls[id].classList.remove('shake'), 600);
        look(); update(); busy = false; return;
      }
      worn.add(id); A.play('snap'); DW.fx.sparkleAt(kidBox, 10); look('smile'); update();
      if (it.kind === 'ok' && !glovesNoted) { glovesNoted = true; L0.tip('maya', it.why, 'neutral', 4500); }
      else if (it.kind === 'need') { ui.toast(it.why, 'check', 3200); }
    }

    /* tap-select + drag */
    Object.keys(itemEls).forEach((id) => {
      const b = itemEls[id];
      let sx = 0, sy = 0, drag = null, moved = false;
      b.addEventListener('pointerdown', (e) => {
        if (busy) return; sx = e.clientX; sy = e.clientY; moved = false; drag = null;
        try { b.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      });
      b.addEventListener('pointermove', (e) => {
        if (busy || !(e.buttons & 1) && e.pointerType === 'mouse') return;
        if (!drag && Math.hypot(e.clientX - sx, e.clientY - sy) > 9 && sx) {
          if (worn.has(id)) return;
          moved = true; drag = h('div', { class: 'l0-ghost', html: art.gear(id, 100) }); st.append(drag); b.classList.add('lift'); A.play('pickup');
        }
        if (drag) { const [x, y] = L0.toUnits(st, e.clientX, e.clientY); L0.pos(drag, x - 60, y - 60, 120, 120); kidBox.classList.toggle('over', x > 540 && x < 1060 && y > 120 && y < 740); }
      });
      b.addEventListener('pointerup', (e) => {
        sx = 0; try { b.releasePointerCapture(e.pointerId); } catch (er) { /* ignore */ }
        if (drag) {
          const [x, y] = L0.toUnits(st, e.clientX, e.clientY); drag.remove(); drag = null; b.classList.remove('lift'); kidBox.classList.remove('over');
          if (x > 540 && x < 1060 && y > 120 && y < 740) equip(id); else A.play('drop');
          setTimeout(() => { moved = false; }, 0);
        }
      });
      b.addEventListener('click', () => {
        if (moved || busy) return;
        if (worn.has(id)) { equip(id); return; }
        sel = sel === id ? null : id; A.play('click'); update();
        if (sel) kidBtn.focus({ preventScroll: true });
      });
    });
    kidBtn.addEventListener('click', () => { if (sel) equip(sel); else { A.play('hover'); ui.toast('Pick a piece of gear first.', 'hand', 1800); } });

    const readyP = new Promise((res) => goBtn.querySelector('button').addEventListener('click', () => res()));
    /* go */
    await L0.enter(scr);
    L0.drosieFly(st, 1400, 690, ['Bzzz! I came to the lab in sandals once. Dr. Maya sent me back for lab shoes.', 'Psst. Not every piece of gear is right for every job!', 'Tap a piece of gear, then tap the scientist.']);
    await L0.maya('Welcome to the Suit-Up Room! Scientists choose their gear for the job they are about to do.', 'happy');
    await L0.maya(M.scenario + ' Pick what you need from the lockers. Some things in there are not for the lab.', 'neutral');
    await L0.drosie('I’ve got six legs and no shoes! Bzzz. You’re the one who has to suit up.', 'happy');
    ui.hideDlg(); busy = false;
    A.play('whoosh'); ui.setProgress(0);

    // wait for ready button
    await L0.G(readyP);
    A.play('success'); DW.fx.confetti(false); ready = true; look('smile');
    const wrongs = tried.size;
    const first = Math.max(0, 4 - wrongs);
    await L0.maya(M.ready, 'celebrate');
    await L0.maya('Tomorrow’s job might need different gear. Goggles and gloves are not always needed. You will plan that in Mission 4.', 'neutral');
    ui.hideDlg();
    return L0.finish(run, { first, total: 4, pass: L0.threshold(first, 4), badge: 'suited', jr: ['ppe-job', 'coat', 'goggles', 'shoes', 'hair'], text: wrongs ? 'You tried ' + wrongs + ' thing' + (wrongs > 1 ? 's' : '') + ' that was not right for the lab, and learned why. That is how scientists learn.' : 'You picked the right gear straight away.' });
  };
})();
