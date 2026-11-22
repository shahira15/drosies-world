/* Mission 2: Protection Lab. Five stations with animated demos, compare toggles, inspect hotspots and a question each. */
(function () {
  'use strict';
  const DW = window.DW, h = DW.h, icon = DW.icon, ui = DW.ui, A = DW.audio, D0 = DW.data0, L0 = DW.l0, art = DW.art;

  L0.missions[2] = async function (run) {
    const scr = L0.screen('l0m2', art.protectRoom()), st = scr.stage;
    const SS = D0.m2.stations;
    const state = {}; SS.forEach((s) => (state[s.id] = { seen: new Set(), spots: new Set(), done: false, first: true }));
    let cur = 0, view = 0, busy = false;

    /* station list */
    const list = L0.box(st, 'l0-stlist', 52, 150, 416, 488);
    list.append(h('div', { class: 'l0-stlist-h' }, 'STATIONS'));
    const sbtn = SS.map((s, i) => {
      const b = h('button', { class: 'l0-station', html: '<i>' + icon(s.icon, 30) + '</i><b>' + s.title + '</b><em class="chk">' + icon('check', 18) + '</em>', onclick: () => { A.play('click'); select(i); } });
      list.append(b); return b;
    });

    /* demo screen */
    const demo = L0.box(st, 'l0-demo', 600, 140, 871, 490);
    const cap = L0.box(st, 'l0-cap', 600, 584, 871, 46);
    const spots = L0.box(st, 'l0-spots', 600, 140, 871, 490);
    const fact = L0.box(st, 'l0-fact', 620, 156, 540, 100); fact.style.display = 'none';

    /* controls */
    const seg = L0.box(st, 'l0-seg', 600, 662, 520, 66);
    const act = L0.box(st, 'l0-acts', 1130, 662, 440, 66);
    const btnReplay = h('button', { class: 'secondary', html: icon('restart', 18) + ' <span>Replay</span>', onclick: () => { A.play('click'); render(); } });
    const btnSpeak = h('button', { class: 'secondary', 'aria-label': 'Read aloud', html: icon('speech', 18), onclick: () => { A.play('click'); DW.audio.speak(SS[cur].cap[Math.min(view, SS[cur].cap.length - 1)], 'maya'); } });
    const btnQ = h('button', { class: 'primary', html: icon('question', 18) + ' <span>Quiz me</span>', onclick: () => ask() });
    act.append(btnSpeak, btnReplay, btnQ);

    function ready(s) { const S0 = state[s.id]; const labels = s.toggle || s.multi; return S0.seen.size >= labels.length && (s.spots.length === 0 || S0.spots.size >= 1); }
    function refresh() {
      SS.forEach((s, i) => { sbtn[i].classList.toggle('on', i === cur); sbtn[i].classList.toggle('done', state[s.id].done); });
      const s = SS[cur]; btnQ.disabled = state[s.id].done || !ready(s);
      btnQ.classList.toggle('glow', !btnQ.disabled);
      btnQ.querySelector('span').textContent = state[s.id].done ? 'Done' : 'Quiz me';
      const left = SS.filter((x) => !state[x.id].done).length;
      ui.setProgress(SS.length - left, left ? 'Explore ' + left + ' more station' + (left > 1 ? 's' : '') : 'All stations done!');
    }
    function render() {
      const s = SS[cur]; state[s.id].seen.add(view);
      const labels = s.toggle || s.multi;
      demo.innerHTML = art.demo(s.demo, view);
      cap.textContent = s.cap[Math.min(view, s.cap.length - 1)];
      cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in');
      seg.innerHTML = '';
      labels.forEach((l, i) => seg.append(h('button', { class: 'l0-segbtn' + (i === view ? ' on' : ''), 'aria-pressed': String(i === view), onclick: () => { A.play('switchOn'); view = i; render(); } }, l)));
      spots.innerHTML = ''; fact.style.display = 'none';
      s.spots.forEach((sp, i) => {
        const b = h('button', { class: 'l0-spot' + (state[s.id].spots.has(i) ? ' seen' : ''), 'aria-label': 'Inspect: ' + sp.t, title: 'Tap to inspect', html: '<i></i>' });
        b.style.left = (sp.x / 800) * 100 + '%'; b.style.top = (sp.y / 450) * 100 + '%';
        b.onclick = () => { state[s.id].spots.add(i); b.classList.add('seen'); A.play('ding'); fact.innerHTML = '<b>' + icon('lens', 18) + ' Look closer</b><p></p>'; fact.querySelector('p').textContent = sp.t; fact.style.display = ''; DW.audio.speak(sp.t, 'maya'); refresh(); };
        spots.append(b);
      });
      A.play('whoosh'); refresh();
    }
    function select(i) { cur = i; view = 0; render(); }

    async function ask() {
      const s = SS[cur]; if (busy) return; busy = true;
      const r = await L0.ask({ stage: st, title: s.title + ' question', icon: s.icon, q: s.q.q, opts: s.q.opts.map((t, i) => [t, i === s.q.ok ? 1 : 0, s.q.why]), where: 'center' });
      busy = false; state[s.id].done = true; state[s.id].first = r.first; L0.journal(s.jr);
      refresh();
      const next = SS.findIndex((x) => !state[x.id].done);
      if (next >= 0) { cur = next; view = 0; render(); }
    }

    await L0.enter(scr);
    L0.drosieFly(st, 1470, 745, ['Bzzz! Try both buttons. See the difference?', 'Tap the glowing spots to look closer.', 'Gear helps, but it is never magic. Remember that!']).classList.add('small');
    await L0.maya('Welcome to the Protection Lab. Each station shows what a piece of gear does, and what happens without it.', 'happy');
    await L0.maya('Try both buttons under the screen, tap the glowing spots, then take the quick question.', 'neutral');
    ui.hideDlg(); render();

    await L0.G(new Promise((res) => { const t = setInterval(() => { if (run.dead) clearInterval(t); else if (SS.every((s) => state[s.id].done)) { clearInterval(t); res(); } }, 300); }));
    await L0.sleep(500);
    const first = SS.filter((s) => state[s.id].first).length;
    await L0.maya('One more thing. Gear helps, but it is a helper, not magic. It never makes a hazardous job safe by itself.', 'think');
    ui.hideDlg();
    return L0.finish(run, { first, total: SS.length, pass: L0.threshold(first, SS.length), badge: 'ppe', jr: ['gloves'], text: 'You explored goggles, lab coats, gloves, closed shoes and tied-back hair, and saw what each one does.' });
  };
})();
