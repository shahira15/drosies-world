/* Mission 5: Safety Control Room. Sort illustrated scenario cards into SAFE and NOT SAFE panels. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, art = DW.art;

  L0.missions[5] = async function (run) {
    const scr = L0.screen('l0m5', art.controlRoom()), st = scr.stage;
    const cards = DW.shuffle(D0.m5).slice(0, 8);
    ui._objs = cards.map((_, i) => 'Card ' + (i + 1));

    const mk = (cls, label, ic, x) => {
      const p = L0.box(st, 'l0-panel ' + cls, x, 150, 440, 480, { role: 'group', 'aria-label': label + ' panel' });
      p.innerHTML = '<div class="l0-panel-h"><i>' + icon(ic, 44) + '</i><b>' + label + '</b></div><div class="l0-panel-body"></div><div class="l0-panel-n">0</div>';
      return p;
    };
    const safeP = mk('safe', 'SAFE', 'shield', 40), badP = mk('unsafe', 'NOT SAFE', 'alert', 1120);
    const body = (p) => p.querySelector('.l0-panel-body');
    const count = { safe: 0, unsafe: 0 };

    const box = L0.box(st, 'l0-rbox', 560, 126, 480, 520);
    const sceneEl = h('div', { class: 'l0-rscene' }), txt = h('p', { class: 'l0-rtext' }), fb = h('div', { class: 'l0-fb', 'aria-live': 'polite' });
    const card = h('div', { class: 'l0-rcard', tabindex: '0', 'aria-label': 'Safety card. Drag it to a panel, or use the buttons below.' }, sceneEl, txt);
    box.append(card, fb);
    const btns = L0.box(st, 'l0-rbtns', 560, 670, 480, 84);
    const bS = h('button', { class: 'l0-sbtn safe', html: icon('shield', 22) + ' <span>SAFE</span>' });
    const bU = h('button', { class: 'l0-sbtn unsafe', html: icon('alert', 22) + ' <span>NOT SAFE</span>' });
    const nextBtn = h('button', { class: 'primary', html: 'Next card ' + icon('right', 18) }); nextBtn.style.display = 'none';
    btns.append(bS, bU); const nbox = L0.box(st, 'l0-nbox', 560, 670, 480, 84); nbox.append(nextBtn); nbox.style.display = 'none';
    const prog = L0.box(st, 'l0-rprog', 560, 108, 480, 14);
    [box, btns, prog].forEach((e) => { e.style.display = 'none'; }); // shown when the first card loads

    let idx = 0, firstOK = 0, answered = false, cur = null, resolveCard;
    function load() {
      cur = cards[idx]; answered = false; fb.className = 'l0-fb'; box.style.display = ''; prog.style.display = '';
      sceneEl.innerHTML = art.ruleScene(cur.id); txt.textContent = cur.text;
      card.classList.remove('gone', 'right', 'wrong'); card.style.transform = ''; void card.offsetWidth; card.classList.add('in');
      btns.style.display = ''; nbox.style.display = 'none'; nextBtn.style.display = 'none';
      prog.innerHTML = cards.map((_, i) => '<i class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"></i>').join('');
      ui.setProgress(idx, 'Card ' + (idx + 1) + ' of ' + cards.length);
      DW.audio.speak(cur.text, 'maya');
    }
    function choose(safe) {
      if (answered || run.dead) return; answered = true;
      const ok = safe === cur.safe, panel = cur.safe ? safeP : badP;
      if (ok) { firstOK++; A.play('success'); } else A.play('nope');
      (safe ? safeP : badP).classList.add(ok ? 'react-ok' : 'react-no'); setTimeout(() => { safeP.classList.remove('react-ok', 'react-no'); badP.classList.remove('react-ok', 'react-no'); }, 900);
      card.classList.add(ok ? 'right' : 'wrong');
      fb.className = 'l0-fb on ' + (ok ? 'ok' : 'no'); fb.innerHTML = '<b></b> <span></span>';
      fb.querySelector('b').textContent = ok ? L0.pick('good') : 'It goes in ' + (cur.safe ? 'SAFE' : 'NOT SAFE') + '.'; fb.querySelector('span').textContent = cur.why;
      // chip into the correct panel
      const chip = h('div', { class: 'l0-chipcard', title: cur.text, html: '<span>' + cur.text + '</span>' }); body(panel).append(chip);
      count[cur.safe ? 'safe' : 'unsafe']++; panel.querySelector('.l0-panel-n').textContent = count[cur.safe ? 'safe' : 'unsafe'];
      btns.style.display = 'none'; nbox.style.display = ''; nextBtn.style.display = ''; nextBtn.focus();
      L0.G(DW.sleep(10)).then(() => { if (!run.dead) DW.fx.sparkleAt(panel, ok ? 12 : 4); });
    }
    bS.onclick = () => { A.play('click'); choose(true); }; bU.onclick = () => { A.play('click'); choose(false); };
    card.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') choose(true); else if (e.key === 'ArrowRight') choose(false); });

    /* drag */
    let sx = 0, sy = 0, dragging = false, down = false;
    card.addEventListener('pointerdown', (e) => { if (answered) return; down = true; dragging = false; sx = e.clientX; sy = e.clientY; try { card.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } });
    card.addEventListener('pointermove', (e) => {
      if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragging && Math.hypot(dx, dy) > 9) dragging = true;
      if (dragging) { card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + Math.max(-12, Math.min(12, dx / 20)) + 'deg)'; const [x] = L0.toUnits(st, e.clientX, e.clientY); safeP.classList.toggle('hot', x < 520); badP.classList.toggle('hot', x > 1080); }
    });
    card.addEventListener('pointerup', (e) => {
      if (!down) return; down = false; safeP.classList.remove('hot'); badP.classList.remove('hot');
      if (dragging) { const [x] = L0.toUnits(st, e.clientX, e.clientY); card.style.transform = ''; if (x < 520) choose(true); else if (x > 1080) choose(false); }
      dragging = false;
    });

    const done = new Promise((res) => { resolveCard = res; });
    nextBtn.onclick = () => { A.play('click'); idx++; if (idx >= cards.length) resolveCard(); else load(); };

    await L0.enter(scr);
    L0.drosieFly(st, 40, 650, ['Bzzz! Drag the card to a panel, or use the buttons.', 'Think: could this hurt someone?', 'Listening to the teacher is a safety tool!']).classList.add('small');
    await L0.maya('Welcome to the Safety Control Room. Cards will show what people are doing in the lab. Sort each one into SAFE or NOT SAFE.', 'happy');
    await L0.maya('You can drag a card to a panel, or press the buttons under it. I will tell you why each one belongs where it does.', 'neutral');
    ui.hideDlg(); load();
    await L0.G(done);
    const total = cards.length;
    await L0.maya(firstOK === total ? 'Every card on the first try. You really know the rules.' : 'You sorted every card, and now you know why each one belongs where it does.', 'celebrate');
    ui.hideDlg();
    return L0.finish(run, { first: firstOK, total, pass: L0.threshold(firstOK, total), badge: 'rules', jr: ['rules'], text: 'You sorted ' + total + ' safety cards. Next up: practising what to do in an emergency.' });
  };
})();
