/* compare.js: Mission 6. Male vs female Drosophila melanogaster, side by side.
 * Four clue lenses (tummy shape, stripes, dark tip, sex comb) + a "size is not enough" check.
 * Science notes shown to the child:
 *   - Females are generally a bit larger; males a bit smaller. Individuals overlap in size, so size alone is unreliable.
 *   - Female abdomen: longer, more pointed, dark bands continue to the tip.
 *   - Male abdomen: shorter, rounder, last segments solid dark.
 *   - Male front legs: sex comb (a row of thick, dark bristles on the first tarsal segment).
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, A = DW.audio;
  const C = (DW.compare = {});

  C.build = function () {
    if (C.el) return;
    const el = (C.el = DW.screens.make('compare', 'compare-screen'));
    el.innerHTML = `
      <div class="sc-bg"></div>
      <div class="sc-title"><span class="kick">MISSION 6 · MALE OR FEMALE?</span><b>Compare the two flies</b></div>
      <div class="cp-main">
        <div class="cp-fly" data-sex="f"><div class="cp-tag f">${icon('female', 18)}<span>GIRL FLY</span><em>female</em></div><div class="cp-view" id="cpF"></div><div class="cp-clue" id="clueF"></div></div>
        <div class="cp-mid"><div class="cp-lens" id="cpLens"></div></div>
        <div class="cp-fly" data-sex="m"><div class="cp-tag m">${icon('male', 18)}<span>BOY FLY</span><em>male</em></div><div class="cp-view" id="cpM"></div><div class="cp-clue" id="clueM"></div></div>
      </div>
      <div class="cp-tabs" id="cpTabs"></div>
      <div class="cp-size" id="cpSize"></div>
      <div class="cp-comb" id="cpComb"></div>`;
    C.q = (s) => el.querySelector(s);
    C.bind();
  };

  C.bind = function () {
    C.tabs = C.q('#cpTabs');
  };

  C.setView = function (view) {
    const mk = (sex, scale) => DW.art.flySVG({ sex, wing: 48, det: 0.5, scale, view, cls: 'zoomview' });
    C.q('#cpF').innerHTML = mk('f', 1.02); C.q('#cpM').innerHTML = mk('m', 0.92);
  };

  C.drawTabs = function () {
    const tabs = C.q('#cpTabs'); tabs.innerHTML = '';
    DW.data.clues.forEach((c, i) => tabs.append(h('button', { class: 'ctab ' + (C.seen.has(c.id) ? 'done' : '') + (C.cur === c.id ? ' on' : ''), 'data-id': c.id, html: '<i>' + (C.seen.has(c.id) ? icon('check', 14) : i + 1) + '</i><span>' + c.name + '</span>', onclick: () => C.pick(c.id) })));
    tabs.append(h('button', { class: 'ctab ' + (C.seen.has('size') ? 'done' : '') + (C.cur === 'size' ? ' on' : ''), 'data-id': 'size', html: '<i>' + (C.seen.has('size') ? icon('check', 14) : 5) + '</i><span>Size check</span>', onclick: () => C.pick('size') }));
  };

  C.pick = function (id) {
    const first = !C.seen.has(id); C.seen.add(id); C.cur = id;
    A.play(first ? 'ding' : 'click');
    C.drawTabs();
    C.q('#cpSize').classList.remove('on'); C.q('#cpComb').classList.remove('on'); C.q('.cp-main').classList.remove('hide');
    if (id === 'size') { C.showSize(); }
    else {
      const c = DW.data.clues.find((x) => x.id === id);
      C.setView(c.view);
      C.q('#clueF').textContent = c.f; C.q('#clueM').textContent = c.m;
      C.q('.cp-main').classList.remove('vpulse'); void C.q('.cp-main').offsetWidth; C.q('.cp-main').classList.add('vpulse');
      A.speak(c.name + '. ' + c.f + ' ' + c.m, 'maya');
      if (id === 'comb') C.showComb();
    }
    DW.ui.setProgress(C.seen.size, 'Clues checked: ' + C.seen.size + ' of 5');
    if (first) { const t = C.tabs.querySelector('[data-id="' + id + '"]'); t && DW.fx.sparkleAt(t, 12); }
    if (C.seen.size >= 5 && !C.finished) { C.finished = true; setTimeout(() => C.resolve && C.resolve(), 2600); DW.fx.confetti(); A.play('success'); }
  };

  /* Magnified sex comb */
  C.showComb = function () {
    const box = C.q('#cpComb');
    box.innerHTML = `<div class="comb-head">${icon('lens', 20)}<b>Magnified front leg</b><span>(simulated close-up)</span></div>
      <div class="comb-pair"><figure><div class="comb-img">${DW.art.comb('m')}</div><figcaption><b>Boy fly</b><span>Tiny dark combs on the front legs!</span></figcaption></figure>
      <figure><div class="comb-img">${DW.art.comb('f')}</div><figcaption><b>Girl fly</b><span>No comb. Just thin hairs.</span></figcaption></figure></div>
      <button class="primary" id="combOk">Got it!</button>`;
    box.classList.add('on'); C.q('.cp-main').classList.add('hide');
    C.q('#combOk').onclick = () => { A.play('click'); box.classList.remove('on'); C.q('.cp-main').classList.remove('hide'); DW.bus.emit('compare:comb'); };
    DW.bus.emit('compare:comb');
    A.speak('Tiny dark combs on the boy fly\'s front legs!', 'maya');
  };

  /* "Size is not enough" activity. Illustrative flies, not real measurements. */
  C.showSize = function () {
    const box = C.q('#cpSize'); C.q('.cp-main').classList.add('hide');
    const flies = [{ sex: 'f', mm: 2.3, scale: 0.9 }, { sex: 'm', mm: 2.6, scale: 1.02 }, { sex: 'f', mm: 2.8, scale: 1.08 }, { sex: 'm', mm: 2.2, scale: 0.86 }];
    const order = DW.shuffle(flies);
    box.innerHTML = `<div class="sz-head"><b>Is the biggest fly always a girl?</b><span>Tap the biggest fly. (Pretend flies for this game.)</span></div><div class="sz-row"></div><div class="sz-msg" id="szMsg"></div>`;
    const row = box.querySelector('.sz-row');
    order.forEach((f) => {
      row.append(h('button', { class: 'sz-card', 'data-sex': f.sex, 'data-mm': f.mm, html: '<div class="sz-fly">' + DW.art.flySVG({ sex: f.sex, wing: 50, det: 0, scale: f.scale }) + '</div><div class="sz-rule"><i></i><b>' + f.mm.toFixed(1) + ' mm</b></div><div class="sz-sex">' + icon(f.sex === 'f' ? 'female' : 'male', 16) + '<span>' + (f.sex === 'f' ? 'girl' : 'boy') + '</span></div>' }));
    });
    box.classList.add('on');
    const maxmm = Math.max(...flies.map((f) => f.mm));
    row.addEventListener('click', (e) => {
      const card = e.target.closest('.sz-card'); if (!card) return;
      DW.$$('.sz-card', row).forEach((c) => c.classList.add('reveal'));
      const msg = box.querySelector('#szMsg'); const big = +card.dataset.mm === maxmm;
      msg.innerHTML = (big ? 'Good eye! ' : 'Good try! ') + 'But look: a <b>big boy</b> can be bigger than a <b>small girl</b>. Sizes overlap, so size alone cannot tell you. Use the tummy and the comb!';
      A.play('success'); A.speak('Sizes overlap, so size alone cannot tell you. Use the tummy and the comb!', 'maya');
      C.sizeDone = true;
    });
  };

  C.run = function () {
    C.build(); C.seen = new Set(); C.cur = null; C.finished = false;
    C.q('#cpSize').classList.remove('on'); C.q('#cpComb').classList.remove('on'); C.q('.cp-main').classList.remove('hide');
    C.setView('-245 -225 490 420');
    C.q('#clueF').textContent = 'Tap a clue below to zoom in.'; C.q('#clueM').textContent = 'Tap a clue below to zoom in.';
    C.drawTabs();
    DW.screens.open(C.el); DW.ui.setNav({ view: 'scope' });
    return new Promise((resolve) => { C.resolve = resolve; }).then(() => { C.resolve = null; });
  };
  C.hint = function () {
    const ids = DW.data.clues.map((c) => c.id).concat('size'); const next = ids.find((i) => !C.seen.has(i));
    const t = C.q('.ctab[data-id="' + next + '"]'); if (t) { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); }
  };
  C.close = function () { return DW.screens.close(C.el); };
})();
