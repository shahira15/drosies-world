/* detective.js: Mission 7. The Fly Detective Challenge.
 * Six mystery flies, generated fresh each play (random order within each difficulty tier):
 *   tier 1 (cases 1-2): all clues are clear.
 *   tier 2 (cases 3-4): the dark tip is a little paler.
 *   tier 3 (cases 5-6): size is misleading (a small girl, a big boy), so you must use the tummy and the comb.
 * Never punishing: a wrong answer gives a gentle nudge and a clue; after two misses the answer is explained and the case counts as "learned".
 */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, A = DW.audio, clamp = DW.clamp;
  const D = (DW.detective = {});
  const VIEWS = { whole: [-245, -225, 490, 420], tummy: [-95, -25, 190, 180], leg: [55, -150, 115, 100] };
  const GOOD = ['You got it!', 'Super sleuth!', 'Sharp eyes!', 'Brilliant detective work!', 'Yes! Great looking!', 'Spot on!'];
  const NUDGE = ['Hmm, let\'s look again!', 'Good try! Use the lens to check the tummy.', 'Not quite. Peek at the front legs too!'];

  D.build = function () {
    if (D.el) return;
    const el = (D.el = DW.screens.make('detective', 'detective-screen'));
    el.innerHTML = `
      <div class="sc-bg"></div>
      <div class="sc-title"><span class="kick">MISSION 7 · FLY DETECTIVE</span><b>Case files</b></div>
      <div class="dt-left">
        <div class="dt-view" id="dtView"><div class="dt-svg" id="dtSvg"></div><div class="dt-ruler" id="dtRuler"></div>
          <div class="dt-lens"><button data-v="whole" class="on">${icon('fly', 18)}<span>Whole fly</span></button><button data-v="tummy">${icon('lens', 18)}<span>Tummy</span></button><button data-v="leg">${icon('lens', 18)}<span>Front leg</span></button></div></div>
      </div>
      <div class="dt-right">
        <div class="dt-file"><div class="dt-dots" id="dtDots"></div><h3 id="dtCase">Case 1 of 6</h3><p class="dt-q">Is this fly a girl or a boy?</p>
          <div class="dt-ans"><button class="ans f" data-a="f">${icon('female', 26)}<span>Girl fly</span></button><button class="ans m" data-a="m">${icon('male', 26)}<span>Boy fly</span></button></div>
          <div class="dt-msg" id="dtMsg"></div>
          <div class="dt-btns"><button class="secondary" id="dtHint">${icon('bulb', 18)} Clue</button><button class="primary" id="dtNext" style="display:none">Next case ${icon('right', 18)}</button></div>
        </div>
        <div class="dt-buddy" id="dtBuddy"></div>
      </div>`;
    D.q = (s) => el.querySelector(s);
    D.buddy = DW.chars.el('drosie', 'idle'); D.q('#dtBuddy').append(D.buddy);
    D.q('.dt-lens').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { A.play('click'); D.view(b.dataset.v); } });
    D.q('.dt-ans').addEventListener('click', (e) => { const b = e.target.closest('.ans'); if (b) D.answer(b.dataset.a); });
    D.q('#dtHint').onclick = () => D.hint();
    D.q('#dtNext').onclick = () => { A.play('click'); D.next(); };
    D.vb = VIEWS.whole.slice();
  };

  D.view = function (name, ms) {
    D.q('.dt-lens').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === name));
    const from = D.vb.slice(), to = VIEWS[name], svg = D.q('#dtSvg svg'); if (!svg) return Promise.resolve();
    return DW.tween(ms == null ? 600 : ms, (k) => { D.vb = from.map((v, i) => DW.lerp(v, to[i], k)); svg.setAttribute('viewBox', D.vb.join(' ')); const f = svg.querySelector('.fly'); f && f.style.setProperty('--det', clamp(k * (name === 'whole' ? 0 : 1) + (name === 'whole' ? (1 - k) * 0.6 : 0.2), 0.1, 0.9)); }, DW.ease.inOut);
  };

  D.show = function () {
    const c = D.cases[D.i]; D.tries = 0; D.hints = 0; D.solved = false;
    D.q('#dtSvg').innerHTML = DW.art.flySVG({ sex: c.sex, scale: c.scale, dark: c.dark, wing: c.wing, det: 0.3 });
    D.vb = VIEWS.whole.slice(); D.q('.dt-lens').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === 'whole'));
    D.q('#dtCase').textContent = 'Case ' + (D.i + 1) + ' of 6';
    D.q('#dtMsg').textContent = ''; D.q('#dtMsg').className = 'dt-msg';
    D.q('#dtNext').style.display = 'none';
    D.q('#dtRuler').innerHTML = '<i></i><b>about ' + (2.5 * c.scale).toFixed(1) + ' mm long</b><span>pretend measurement</span>';
    D.q('.dt-ans').classList.remove('off'); D.q('#dtHint').disabled = false;
    DW.chars.set(D.buddy, 'idle');
    const dots = D.q('#dtDots'); dots.innerHTML = '';
    D.cases.forEach((_, i) => dots.append(h('i', { class: i < D.i ? 'done' : i === D.i ? 'cur' : '' })));
    D.q('.dt-file').dataset.tier = c.tier;
    DW.ui.setProgress(D.i, 'Case ' + (D.i + 1) + ' of 6');
  };

  D.explain = function (c) {
    return c.sex === 'm'
      ? 'It is a boy fly! The tummy is short and round with a dark tip, and the front legs have a tiny dark comb.'
      : 'It is a girl fly! The tummy is long and pointy with stripes all the way to the tip, and there is no comb.';
  };

  D.answer = async function (a) {
    if (D.solved) return;
    const c = D.cases[D.i], msg = D.q('#dtMsg');
    if (a === c.sex) {
      D.solved = true; D.stars = (D.stars || 0) + (D.tries === 0 && D.hints === 0 ? 3 : D.tries <= 1 ? 2 : 1);
      msg.className = 'dt-msg good'; msg.textContent = GOOD[(Math.random() * GOOD.length) | 0] + ' ' + D.explain(c).replace(/^It is a (boy|girl) fly! /, '');
      A.play('success'); DW.fx.confetti(false); DW.chars.set(D.buddy, 'celebrate'); D.buddy.classList.add('dance');
      A.speak(msg.textContent, 'drosie');
      D.afterSolve();
    } else {
      D.tries++;
      A.play('nope'); D.buddy.classList.remove('shrug'); void D.buddy.offsetWidth; D.buddy.classList.add('shrug'); DW.chars.set(D.buddy, 'think');
      if (D.tries >= 2) {
        D.solved = true; D.learned = (D.learned || 0) + 1; D.stars = (D.stars || 0) + 1;
        msg.className = 'dt-msg learn'; msg.textContent = 'No worries, that is how scientists learn! ' + D.explain(c);
        D.view(c.sex === 'm' ? 'leg' : 'tummy'); A.speak(msg.textContent, 'drosie');
        D.afterSolve();
      } else {
        msg.className = 'dt-msg try'; msg.textContent = NUDGE[(Math.random() * NUDGE.length) | 0]; A.speak(msg.textContent, 'drosie');
        D.view('tummy');
      }
    }
  };

  D.afterSolve = function () {
    D.q('.dt-ans').classList.add('off'); D.q('#dtHint').disabled = true;
    D.q('#dtDots').children[D.i].className = 'done';
    DW.ui.setProgress(D.i + 1, D.i + 1 >= 6 ? 'All cases done!' : 'Case ' + (D.i + 2) + ' of 6');
    const btn = D.q('#dtNext'); btn.style.display = ''; btn.innerHTML = (D.i >= 5 ? 'Finish' : 'Next case') + ' ' + icon('right', 18);
    setTimeout(() => btn.focus && btn.focus({ preventScroll: true }), 200);
  };

  D.hint = function () {
    if (D.solved) return; const c = D.cases[D.i], msg = D.q('#dtMsg');
    D.hints++; DW.state.hintsUsed++;
    const lvl = Math.min(3, D.hints);
    A.play('sparkle'); msg.className = 'dt-msg hint';
    if (lvl === 1) { msg.textContent = 'Clue: look at the end of the tummy. Round and dark, or pointy and striped?'; D.view('tummy'); }
    else if (lvl === 2) { msg.textContent = 'Clue: check the front legs. Is there a tiny dark comb?'; D.view('leg'); }
    else { msg.textContent = c.sex === 'm' ? 'Big clue: this fly HAS a comb and a dark round tip.' : 'Big clue: this fly has NO comb and a long pointy tummy.'; D.view(c.sex === 'm' ? 'leg' : 'tummy'); }
    A.speak(msg.textContent, 'drosie');
  };

  D.next = function () {
    D.buddy.classList.remove('dance'); DW.chars.set(D.buddy, 'idle');
    if (D.i >= 5) { D.resolve && D.resolve({ stars: D.stars, learned: D.learned || 0 }); return; }
    D.i++; D.show();
  };

  D.run = function () {
    D.build(); D.cases = DW.data.makeCases(); D.i = 0; D.stars = 0; D.learned = 0;
    D.show(); DW.screens.open(D.el); DW.ui.setNav({ view: 'scope' });
    return new Promise((resolve) => { D.resolve = resolve; }).then((r) => { D.resolve = null; return r; });
  };
  D.close = function () { return DW.screens.close(D.el); };
})();
