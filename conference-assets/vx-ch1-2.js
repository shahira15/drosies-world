/* Chapters 1 and 2, visual adventure: invitation garden + the two research doors */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc;

  /* ---------- small illustrated vignettes (what a conference is) ---------- */
  const look = (i) => DC.SCIENTISTS[i].look;
  const vig = (k) => {
    let s = A.r(0, 0, 320, 190, '#f3ead2') + A.r(0, 140, 320, 50, '#e3d0a5') + A.r(0, 132, 320, 8, 'rgba(141,99,54,.4)');
    if (k === 'share') {
      s += A.posterMini(150, 22, 130, 104, A.C.teal) + A.g('translate(60 100) scale(.9)', A.person(0, 0, look(0), 1)) + A.p('M104 70 L142 64', 'none', 'stroke="#c4655a" stroke-width="4" stroke-linecap="round"') + A.p('M136 58 l10 6 -10 8z', '#c4655a');
    } else if (k === 'discuss') {
      s += A.r(112, 24, 96, 76, '#fff', 6, 'stroke="#8d6336" stroke-width="3"') + A.r(124, 74, 14, 18, '#c4655a') + A.r(146, 52, 14, 40, '#2f7d7a') + A.r(168, 62, 14, 30, '#d9b45a') + A.ln(124, 94, 190, 94, '#1c2b28', 2) +
        A.g('translate(52 104)', A.person(0, 0, look(2), .9)) + A.g('translate(268 104)', A.person(0, 0, look(3), .9)) + A.c(70, 44, 16, '#fff', 'stroke="#1d5a5a" stroke-width="3"') + A.tx(70, 51, 20, '?', '#1d5a5a');
    } else {
      s += A.r(70, 84, 180, 56, '#a97a46', 6) + A.r(120, 24, 80, 60, '#fff', 4, 'stroke="#555" stroke-width="3"') + A.p('M130 70 l20 -22 14 12 20 -24', 'none', 'stroke="#1d5a5a" stroke-width="4"') +
        [0, 1, 2, 3].map((i) => A.c(50 + i * 74, 170, 22, ['#c68a5e', '#7a4b34', '#e8c39e', '#a56b46'][i]) + A.r(32 + i * 74, 176, 36, 20, ['#2f7d7a', '#c4655a', '#5b3a6b', '#d9b45a'][i], 8)).join('') + A.r(213, 120, 8, 30, '#e8c39e', 4) + A.c(217, 114, 8, '#e8c39e');
    }
    return '<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:100%;height:auto;display:block">' + s + '</svg>';
  };
  const VIG = { share: ['Show a poster', 'poster', 'Scientists show what they found.'], discuss: ['Talk about a graph', 'graph', 'They look at the evidence together.'], audience: ['Ask a question', 'question', 'Listeners ask friendly questions.'] };

  const envelope = () => '<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="14" y="40" width="292" height="160" rx="14" fill="#f6e3b0" stroke="#8d6336" stroke-width="5"/><path d="M14 54 L160 150 L306 54" fill="none" stroke="#8d6336" stroke-width="5" stroke-linejoin="round"/><path d="M14 196 L120 112 M306 196 L200 112" stroke="#c99a60" stroke-width="4" fill="none"/><path d="M14 40 L160 140 L306 40 Z" fill="#fff3c4" stroke="#8d6336" stroke-width="5" stroke-linejoin="round"/><circle cx="160" cy="112" r="24" fill="#c4655a" stroke="#8d3f35" stroke-width="4"/><path d="M160 98 l5 10 11 1.6 -8 7.6 2 11 -10 -5.4 -10 5.4 2 -11 -8 -7.6 11 -1.6z" fill="#ffe9a0"/></svg>';

  /* ================= Chapter 1 ================= */
  const U1 = () => { const u = vx.c(1); u.seen = u.seen || {}; if (u.step == null) u.step = 0; return u; };
  const nickOk = () => DC.state.anon || DC.state.nick.trim().length > 0;
  const maxStep1 = () => (!U1().open ? 0 : !nickOk() ? 2 : 3);
  const COLORS = [['#1d5a5a', 'Teal'], ['#b5483c', 'Coral'], ['#5b3a6b', 'Plum'], ['#20365a', 'Navy'], ['#8a6a1d', 'Gold']];
  const ICONS = [['🔬', 'microscope'], ['🧪', 'test tube'], ['🌱', 'seedling'], ['🔭', 'telescope'], ['🪰', 'fly'], ['🍌', 'banana']];

  function say1() {
    const u = U1(), s = DC.state;
    if (DC.isDone(1)) return ["You're all set! Let's explore!", 'celebrate'];
    if (!u.open) return ['A letter came for you! Tap the envelope.', 'welcome'];
    if (u.step === 1) return ['Scientists share what they find. Tap each picture!', 'explain'];
    if (u.step === 2) return ['Make your conference badge!', 'curious'];
    return ['How shall we explore?', 'curious'];
  }
  function panel1() {
    const u = U1(), s = DC.state;
    if (u.step === 0 || !u.open) {
      return '<div class="vx-panel" style="text-align:center"><button type="button" class="vx-env" data-act="c1open" aria-label="Open the invitation envelope">' + envelope() + '</button><p class="vx-title" style="margin-top:.6rem">Tap to open</p></div>';
    }
    if (u.step === 1) {
      return '<div class="vx-panel vx-invite" style="text-align:center;background:linear-gradient(160deg,#fff8e6,#fdeec4);border-color:var(--gold)"><div class="kicker">You are invited!</div><h2 class="vx-title" style="font-size:clamp(1.5rem,4vw,2.3rem)">Drosie’s First Scientific Conference</h2><p class="vx-note" style="margin:0">A pretend science conference, just for you.</p></div>' +
        vx.tray(Object.keys(VIG).map((k) => ({ icon: VIG[k][1], label: VIG[k][0], act: 'c1vig', data: { k }, done: !!u.seen[k], on: u.vig === k }))) +
        '<div class="vx-panel" id="c1vig" aria-live="polite" style="min-height:11rem">' + vigHTML() + '</div>' +
        vx.learn('Is a conference poster already "peer reviewed"?', 'Not usually. Many posters and talks show work that is still being checked and improved. A journal’s peer review is a separate step that may come later.');
    }
    if (u.step === 2) {
      return '<div class="vx-panel"><div class="grid2"><div style="text-align:center"><div id="c1badge">' + DC.badgeHTML() + '</div></div><div>' +
        '<div class="field"><label for="nick" class="lbl">Nickname</label><input type="text" id="nick" data-bind="nick" maxlength="20" autocomplete="off" value="' + esc(s.nick) + '" ' + (s.anon ? 'disabled' : '') + ' placeholder="A nickname, not your real name"><span id="nickWarn" class="vx-note" role="alert" style="color:var(--bad);font-weight:800"></span></div>' +
        '<button type="button" class="vx-btn small ' + (s.anon ? 'teal' : 'ghost') + '" data-act="c1anon" aria-pressed="' + !!s.anon + '">' + (s.anon ? '✓ ' : '') + 'Stay anonymous</button>' +
        '<p class="lbl" style="margin:.8rem 0 .3rem">Color</p><div class="row" role="group" aria-label="Badge color">' + COLORS.map((c) => '<button type="button" class="vx-choice' + (s.badge.color === c[0] ? ' sel' : '') + '" style="min-height:3rem;width:3.4rem;padding:.2rem;border-color:' + c[0] + '" data-act="c1color" data-v="' + c[0] + '" aria-pressed="' + (s.badge.color === c[0]) + '" aria-label="' + c[1] + '"><span style="display:block;width:100%;height:1.6rem;border-radius:10px;background:' + c[0] + '"></span></button>').join('') + '</div>' +
        '<p class="lbl" style="margin:.8rem 0 .3rem">Picture</p><div class="row" role="group" aria-label="Badge picture">' + ICONS.map((c) => '<button type="button" class="vx-choice' + (s.badge.icon === c[0] ? ' sel' : '') + '" style="min-height:3.2rem;width:3.4rem;padding:.2rem;font-size:1.7rem" data-act="c1icon" data-v="' + c[0] + '" aria-pressed="' + (s.badge.icon === c[0]) + '" aria-label="' + c[1] + '"><span aria-hidden="true">' + c[0] + '</span></button>').join('') + '</div></div></div></div>';
    }
    return '<div class="vx-panel"><p class="lbl" style="text-align:center">Pick your adventure</p><div class="vx-choices" role="group" aria-label="How to explore">' +
      vx.choice({ act: 'c1mode', data: { v: 'guided' }, pic: '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 60 Q40 10 70 45 T110 20" fill="none" stroke="#2f7d7a" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round"/><circle cx="110" cy="20" r="9" fill="#c4655a"/></svg>', label: 'Follow Drosie', small: 'One place at a time', pressed: s.mode === 'guided' }) +
      vx.choice({ act: 'c1mode', data: { v: 'independent' }, pic: '<svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="60" cy="40" r="30" fill="#fff" stroke="#1d5a5a" stroke-width="5"/><path d="M60 18 l9 26 -9 -6 -9 6z" fill="#c4655a"/><path d="M60 62 l9 -18 -9 6 -9 -6z" fill="#1d5a5a"/></svg>', label: 'Explore freely', small: 'Visit places in any order', pressed: s.mode === 'independent' }) + '</div>' +
      '<p class="lbl" style="text-align:center;margin-top:.8rem">Your level</p><div class="vx-choices" role="group" aria-label="Your level">' +
      vx.choice({ act: 'c1level', data: { v: 'explorer' }, pic: vx.icon('star', 64), label: 'Explorer', small: 'Pictures and short steps', pressed: vx.level() === 'explorer' }) +
      vx.choice({ act: 'c1level', data: { v: 'researcher' }, pic: vx.icon('findings', 64), label: 'Researcher', small: 'All the writing and number tools', pressed: vx.level() === 'researcher' }) + '</div>' +
      (DC.isDone(1) ? '<div style="text-align:center;margin-top:.8rem"><button type="button" class="vx-btn big" data-act="vxMap">' + vx.icon('map', 28) + ' Open the map</button></div>' : '') + '</div>';
  }
  const vigHTML = () => { const u = U1(); if (!u.vig) return '<p class="vx-note" style="text-align:center;margin-top:3rem">Tap a picture above.</p>'; return '<div style="max-width:420px;margin:0 auto">' + vig(u.vig) + '</div><p class="vx-title" style="text-align:center;font-size:1.2rem;margin:.5rem 0 0">' + VIG[u.vig][2] + '</p>'; };

  function paintBadge() { const b = DC.$('#c1badge'); if (b) { b.innerHTML = DC.badgeHTML(); const bd = b.querySelector('.badge'); if (bd && !vx.reduced()) bd.style.animation = 'vxpop .35s'; } }
  vx.chapter(1, {
    render() {
      const u = U1(), s = DC.state, [txt, st] = say1();
      return '<div class="vx-stage"><div class="vx-main">' + vx.scene({ art: vx.svg(A.garden(), 'A sunny garden with a tree, flowers, bunting and a mailbox'), hot: u.open ? [] : [{ x: 79, y: 74, label: 'Open the letter', act: 'c1open', pulse: true, w: 72 }] }) + vx.guide(st, txt) + '</div><div class="vx-side">' +
        vx.steps(['Letter', 'Conference', 'Badge', 'Adventure'], u.step, maxStep1(), 'c1step') + '<div id="c1panel">' + panel1() + '</div></div></div>';
    },
    mount() {
      const warn = DC.$('#nickWarn');
      DC.onBind('nick', (el) => { if (DC.looksPersonal(el.value)) { DC.state.nick = ''; el.value = ''; if (warn) warn.textContent = 'That looks like an email, web address or phone number. Please use a nickname.'; DC.save(); } else if (warn) warn.textContent = ''; paintBadge(); DC.softUpdate(); });
    }
  });
  const re1 = (focus) => DC.refresh(focus);
  DC.acts.c1open = () => { const u = U1(); u.open = true; u.step = 1; DC.save(); re1('.vx-invite'); DC.say('The invitation is open.'); };
  DC.acts.c1step = (b) => { const u = U1(), i = +b.dataset.i; if (i <= maxStep1()) { u.step = i; DC.save(); re1(); } };
  DC.acts.c1vig = (b) => { const u = U1(); u.seen[b.dataset.k] = 1; u.vig = b.dataset.k; DC.save(); DC.$$('.vx-tool[data-act=c1vig]').forEach((t) => { const k = t.dataset.k; t.classList.toggle('done', !!u.seen[k]); t.classList.toggle('on', u.vig === k); t.setAttribute('aria-pressed', String(u.vig === k)); }); DC.$('#c1vig').innerHTML = vigHTML(); DC.say(VIG[u.vig][2]); };
  DC.acts.c1color = (b) => { DC.state.badge.color = b.dataset.v; DC.save(); re1('[data-act=c1color][data-v="' + b.dataset.v + '"]'); };
  DC.acts.c1icon = (b) => { DC.state.badge.icon = b.dataset.v; DC.save(); re1('[data-act=c1icon][data-v="' + b.dataset.v + '"]'); };
  DC.acts.c1anon = () => { DC.state.anon = !DC.state.anon; DC.save(); re1('[data-act=c1anon]'); DC.softUpdate(); };
  DC.acts.c1mode = (b) => { DC.state.mode = b.dataset.v; DC.save(); re1('[data-act=c1mode][data-v="' + b.dataset.v + '"]'); DC.softUpdate(); if (DC.isDone(1)) DC.say("You're all set! Open the map to begin."); };
  DC.acts.c1level = (b) => { vx.ui().level = b.dataset.v; DC.save(); vx.paintLevel(); re1('[data-act=c1level][data-v="' + b.dataset.v + '"]'); };

  /* ================= Chapter 2 ================= */
  const U2 = () => { const u = vx.c(2); if (u.bstep == null) u.bstep = 0; return u; };
  const MINI = (cid, temp, hot) => {
    const vialSvg = DC.lab.svg(cid, 0, 0, false).replace('<svg ', '<svg x="40" y="34" width="86" height="136" ');
    return '<svg viewBox="0 0 170 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A lab room at ' + temp + ' with a vial of ten flies waiting at the bottom" style="width:100%;max-width:230px;height:auto;display:block;margin:0 auto">' +
      A.r(0, 0, 170, 200, hot ? '#fde0cf' : '#dbeaf7', 16) + A.r(0, 160, 170, 40, hot ? '#e8c9a8' : '#c6d6e6', 0) + '<g aria-hidden="true">' + vialSvg + '</g>' + A.thermo(146, 30, 70, '', hot) + A.tx(85, 24, 26, temp, '#1c2b28') + '</svg>';
  };
  const ideaTypes = [['experiment', 'Experiment', 'I change one thing', '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M44 8h32M50 8v26L30 70h60L70 34V8" fill="#d7efe9" stroke="#1d5a5a" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="58" r="5" fill="#c4655a"/></svg>'], ['observation', 'Observation', 'I watch and record', '<svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="50" cy="38" r="24" fill="#fff" stroke="#1d5a5a" stroke-width="5"/><path d="M68 56l26 20" stroke="#1d5a5a" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="38" r="8" fill="#c4655a"/></svg>'], ['exploration', 'Exploration', 'I try things out', '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M12 62 Q40 8 64 40 T108 18" fill="none" stroke="#2f7d7a" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round"/><path d="M96 10 l12 8 -14 6z" fill="#c4655a"/></svg>']];
  const bTitleOk = () => DC.bFilled('title'), bQOk = () => DC.bFilled('question');

  function peekA() {
    const s = DC.state, done = s.path === 'A' && s.a.acked;
    return '<div class="vx-panel"><div class="row" style="flex-wrap:nowrap;gap:.5rem"><div style="flex:1;min-width:0">' + MINI('control', '25 °C', true) + '</div><div style="flex:1;min-width:0">' + MINI('cool', '18 °C', false) + '</div></div>' +
      '<p class="vx-title" style="text-align:center;font-size:1.25rem">Same kind of flies. Different room temperature.</p><p class="vx-note" style="text-align:center;margin:0">Do fewer flies climb above the line in the cooler room?</p>' +
      '<div class="vx-choices" role="group" aria-label="Which one is the prediction?" style="max-width:620px;margin:.8rem auto 0">' + vx.choice({ act: 'c2pred', data: { i: 0 }, label: 'Cooler air slows flies down', small: 'the idea we are testing', cls: (DC.state.det.c2hyp && DC.state.det.c2hyp.sel === 0 ? 'bad' : '') }) + vx.choice({ act: 'c2pred', data: { i: 1 }, label: 'Fewer flies above the line at 18 °C', small: 'what we expect to see', cls: (DC.state.det.c2hyp && DC.state.det.c2hyp.ok ? 'ok' : '') }) + '</div>' +
      '<p class="vx-note" style="text-align:center;margin:.2rem 0 0">Quick question: which one is the <strong>prediction</strong>?</p>' +
      '<div style="text-align:center;margin-top:1rem"><button type="button" class="vx-stamp' + (done ? ' pressed' : '') + '" data-act="c2seal" aria-pressed="' + done + '" aria-label="Simulation stamp. Press it to promise to remember that this experiment is a simulation.">' + (done ? '✓ SIMULATION<br>noted' : 'SIMULATION<br>tap to stamp') + '</button><p class="vx-note">The fruit fly numbers are made up for learning. They are not a real experiment.</p></div></div>';
  }
  function peekB() {
    const s = DC.state, u = U2(), f = s.b.f, step = u.bstep;
    const body = step === 0 ? '<div class="field"><label class="lbl" for="bt">Give your discovery a name</label><input type="text" id="bt" data-bind="b.f.title" maxlength="120" value="' + esc(f.title) + '" placeholder="e.g. Ants at my back door"></div>' :
      step === 1 ? '<p class="lbl" style="text-align:center">What kind of project is it?</p><div class="vx-choices" role="group" aria-label="Kind of project">' + ideaTypes.map((t) => vx.choice({ act: 'c2type', data: { v: t[0] }, pic: t[3], label: t[1], small: t[2], pressed: s.b.type === t[0] })).join('') + '</div>' :
      '<div class="field"><label class="lbl" for="bq">What do you want to find out?</label><input type="text" id="bq" data-bind="b.f.question" maxlength="140" value="' + esc(f.question) + '" placeholder="Ask it as a question"></div><div class="row" role="group" aria-label="Question starters">' + ['What happens when…?', 'How many…?', 'When do…?', 'Why do…?'].map((q) => '<button type="button" class="chip" data-act="c2starter" data-t="' + esc(q.replace('…?', '')) + '">' + esc(q) + '</button>').join('') + '</div>';
    return '<div class="vx-panel"><div><div style="text-align:center"><svg viewBox="0 0 220 180" aria-hidden="true" focusable="false" style="width:100%;max-width:150px;height:auto"><rect x="30" y="20" width="130" height="150" rx="10" fill="#fffdf6" stroke="#8d6336" stroke-width="6"/><rect x="30" y="20" width="22" height="150" rx="8" fill="#c4655a"/><path d="M70 60h74M70 84h74M70 108h50" stroke="#c9d8cc" stroke-width="7" stroke-linecap="round"/><path d="M150 140l40-66 10 6-40 66-14 6z" fill="#d9b45a" stroke="#8d6336" stroke-width="3" stroke-linejoin="round"/></svg></div><div>' +
      vx.steps(['Name', 'Kind', 'Question'], step, Math.min(step + (step === 0 && bTitleOk() ? 1 : 0), 3) , 'c2bstep').replace('disabled', '') + body + '<div class="row" style="justify-content:space-between;margin-top:.5rem">' + (step > 0 ? '<button type="button" class="vx-btn small ghost" data-act="c2bstep" data-i="' + (step - 1) + '">← Back</button>' : '<span></span>') + (step < 2 ? '<button type="button" class="vx-btn small" data-act="c2bstep" data-i="' + (step + 1) + '">Next →</button>' : '') + '</div></div></div>' +
      '<p class="vx-note">I keep all my own information on this device. Nothing is made up for me.</p>' + vx.learn('Add more details (optional)', 'In the Researcher level, the workbench has fields for background, hypothesis, methods and more. You can fill those in later, in the lab and in the Abstract Workshop.') + '</div>';
  }
  function say2() {
    const s = DC.state, u = U2();
    if (DC.isDone(2)) return [s.path === 'A' ? 'The lab is open! Let’s go investigate!' : 'Great question! Let’s start your project!', 'celebrate'];
    if (!u.peek) return ['Two doors! Which one will you open?', 'curious'];
    if (u.peek === 'A') return ['Ready to meet the flies? Stamp it to enter!', 'explain'];
    return ['Tell me about your discovery!', 'encourage'];
  }
  vx.chapter(2, {
    render(legacy) {
      const u = U2(), s = DC.state, [txt, st] = say2();
      const scene = vx.scene({ art: vx.svg(A.doors(), 'A hallway with two doors: the Fruit Fly Laboratory and My Own Discovery'), hot: [{ x: 28, y: 52, label: 'Door A: Fruit Fly Laboratory', act: 'c2peek', data: { v: 'A' }, w: 150, h: 190, pulse: !u.peek, done: s.path === 'A' && s.a.acked }, { x: 67, y: 52, label: 'Door B: My Own Discovery', act: 'c2peek', data: { v: 'B' }, w: 150, h: 190, pulse: !u.peek, done: s.path === 'B' && DC.isDone(2) }] });
      const tray = vx.tray([{ icon: 'flask', label: 'Fruit Fly Laboratory', act: 'c2peek', data: { v: 'A' }, on: u.peek === 'A', done: s.path === 'A' && s.a.acked }, { icon: 'book', label: 'My Own Discovery', act: 'c2peek', data: { v: 'B' }, on: u.peek === 'B', done: s.path === 'B' && DC.isDone(2) }]);
      return '<div class="vx-stage"><div class="vx-main">' + scene + vx.guide(st, txt) + '</div><div class="vx-side">' + tray + '<div id="c2panel">' + (u.peek === 'A' ? peekA() : u.peek === 'B' ? peekB() : '') + '</div>' + vx.benchBar(2) + '</div></div>';
    },
    mount() {
      DC.onBind('b.f', () => { if (DC.state.path !== 'B') DC.setPath('B'); DC.softUpdate(); });
    }
  });
  DC.acts.c2peek = (b) => { U2().peek = b.dataset.v; DC.save(); DC.refresh('#c2panel'); };
  DC.acts.c2seal = () => { if (DC.state.path !== 'A') DC.setPath('A'); DC.state.a.acked = true; DC.save(); DC.refresh('.vx-stamp'); DC.softUpdate(); };
  DC.acts.c2pred = (b) => { const i = +b.dataset.i, ok = i === 1; const p = DC.state.det.c2hyp || {}; DC.state.det.c2hyp = { sel: i, ok: ok || !!p.ok, tries: (p.tries || 0) + 1 }; DC.save(); DC.refresh('#c2panel'); DC.say(ok ? 'Yes! A prediction says what we expect to measure.' : 'That is the idea behind it. The prediction is what we expect to see.'); };
  DC.acts.c2bstep = (b) => { if (DC.state.path !== 'B') DC.setPath('B'); U2().bstep = Math.max(0, Math.min(2, +b.dataset.i)); DC.save(); DC.refresh('#c2panel'); };
  DC.acts.c2type = (b) => { if (DC.state.path !== 'B') DC.setPath('B'); DC.state.b.type = b.dataset.v; DC.save(); DC.refresh('[data-act=c2type][data-v="' + b.dataset.v + '"]'); DC.softUpdate(); };
  DC.acts.c2starter = (b) => { const el = DC.$('#bq'); el.value = (b.dataset.t + ' ').replace(/\s+$/, ' '); el.focus(); el.dispatchEvent(new Event('input', { bubbles: true })); };
})();
