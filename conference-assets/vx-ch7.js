/* Chapter 7, visual adventure: the Registration Lobby. Same completion rule as before: checked in AND the six talk steps in the right order.
   Everything here is fictional (the conference, the schedule, the board number). */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc;
  const U = () => { const u = vx.c(7); if (!u.strip) u.strip = []; return u; };
  const RECEPT = { skin: '#e8c39e', hair: '#7a3b2e', style: 'bob', glasses: false, coat: '#2f7d7a', accent: '#d9b45a' };

  /* ---------- art ---------- */
  A.lobby = (checked, board) => A.wall('#f3ead2', 450, '#d9bd88') + A.bunting(18) + A.window(60, 70, 120, 130) +
    /* conference map */ A.r(240, 76, 150, 110, '#fff8e6', 8, 'stroke="#8d6336" stroke-width="5"') + A.p('M254 150 Q290 100 320 140 T376 110', 'none', 'stroke="#2f7d7a" stroke-width="5" stroke-dasharray="3 8" stroke-linecap="round"') + A.c(254, 150, 8, A.C.coral) + A.c(376, 110, 8, A.C.gold) +
    /* program screen */ A.r(450, 70, 190, 120, '#1c2b28', 10, 'stroke="#8d6336" stroke-width="5"') + [0, 1, 2, 3].map((i) => A.r(466, 86 + i * 24, 158, 16, i === 2 ? '#d9b45a' : '#3f5a54', 4)).join('') +
    /* poster board */ A.r(700, 64, 200, 150, '#8d6336', 12) + A.r(710, 74, 180, 130, '#d9a86a', 6) + Array.from({ length: 40 }, (_, i) => { const x = 718 + (i % 8) * 21, y = 82 + Math.floor(i / 8) * 24, mine = board === i + 1; return A.r(x, y, 17, 19, mine ? A.C.gold : '#fffdf6', 2, 'stroke="' + (mine ? '#9a6a1d' : '#b88a4a') + '" stroke-width="' + (mine ? 3 : 1.5) + '"'); }).join('') +
    /* desk, scanner, receptionist */ A.person(300, 330, RECEPT, 1.9) + A.r(120, 392, 420, 22, '#c99a60', 8) + A.r(120, 414, 420, 120, '#a97a46', 6) + A.tx(330, 478, 28, 'Registration', '#fff') +
    A.g('translate(470 366)', A.r(-34, 0, 68, 28, '#2f7d7a', 8, 'stroke="#1d5a5a" stroke-width="3"') + A.r(-24, 6, 48, 6, checked ? '#7df0a0' : '#e8f3ef', 3) + A.c(-18, 20, 3, A.C.coral) + A.c(0, 20, 3, A.C.gold)) +
    A.plant(60, 460, 1.1) + A.plant(900, 460, 1.1) + A.rug(760, 540, 150, 28, '#e8d3a2');

  const ANSWER = ['hello', 'why', 'how', 'found', 'means', 'next'];
  const STEP = { hello: ['Say hello and ask', 'wave'], why: ['Why it matters', 'idea'], how: ['How I studied it', 'methods'], found: ['What I found', 'data'], means: ['What it means', 'findings'], next: ['Limits and questions', 'question'] };
  const asg = () => DC.assignment();

  function stripHTML() {
    const u = U(), n = u.strip.length, rest = vx.shuffle(ANSWER.filter((x) => !u.strip.includes(x)), 'talk' + DC.name());
    const checked = u.checked, right = (id, i) => ANSWER[i] === id;
    const slots = '<ol class="vx-steps" style="list-style:none;padding:0;justify-content:flex-start;gap:.4rem" aria-label="My talk, in order">' + ANSWER.map((_, i) => { const id = u.strip[i]; return '<li>' + (id ? '<button type="button" class="vx-tool ' + (checked ? (right(id, i) ? 'done' : '') : 'on') + '" style="min-width:4.6rem;min-height:4.4rem;' + (checked && !right(id, i) ? 'border-color:var(--vx-no);background:var(--badbg)' : '') + '" data-act="v7drop" data-id="' + id + '" aria-label="Step ' + (i + 1) + ': ' + esc(STEP[id][0]) + '. Press to take it out">' + vx.icon(STEP[id][1], 30) + '<span style="font-size:.7rem">' + (i + 1) + '. ' + esc(STEP[id][0]) + '</span></button>' : '<div class="vx-tool" style="min-width:4.6rem;min-height:4.4rem;border-style:dashed;opacity:.6;cursor:default" aria-label="Empty step ' + (i + 1) + '"><span style="font-size:1.3rem">' + (i + 1) + '</span></div>') + '</li>'; }).join('') + '</ol>';
    const hand = rest.length ? '<div class="vx-tray" role="group" aria-label="Talk cards, tap to add the next step">' + rest.map((id) => '<button type="button" class="vx-tool" data-act="v7add" data-id="' + id + '">' + vx.icon(STEP[id][1], 34) + '<span>' + esc(STEP[id][0]) + '</span></button>').join('') + '</div>' : '';
    const fb = checked ? (DC.state.reg.orderOk ? '<div class="vx-fb ok" role="status">A clear talk: question, why, how, what I found, what it means, then limits and questions. Listeners can follow every step.</div>' : '<div class="vx-fb no" role="status">' + n + ' steps are placed. Red ones are in the wrong place. Tip: results come after methods, and the meaning comes after the results.</div>') : '';
    return slots + hand + (n === 6 ? '<div class="row"><button type="button" class="vx-btn teal" data-act="v7check">Check my talk</button></div>' : '<p class="vx-note">Tap the cards in the order you would say them. A 60-second talk is only about 120 to 150 words.</p>') + fb;
  }
  function boardPanel() { return '<div class="vx-panel gold" style="text-align:center"><p class="vx-title" style="margin:0">Your poster is on board #' + asg().board + '</p><p class="vx-note" style="margin:0">Poster Hall B · visitors come at about ' + asg().time + ' · <strong>pretend schedule</strong></p></div>'; }
  const PROG_ICONS = ['wave', 'star', 'poster', 'heart', 'idea', 'data', 'poster', 'findings'];
  function programPanel() {
    return '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem;margin:0 0 .4rem">Today’s program (fictional)</p><ol class="vx-maplist" style="flex-direction:column" aria-label="Program">' + DC.PROGRAM.map((r, i) => '<li class="row" style="flex-wrap:nowrap;gap:.6rem;padding:.2rem .4rem;border-radius:12px;' + (/you present/.test(r[1]) ? 'background:var(--gold2)' : '') + '"><span aria-hidden="true">' + vx.icon(PROG_ICONS[i], 26) + '</span><strong style="min-width:3.2rem">' + esc(r[0]) + '</strong><span>' + esc(r[1].replace(/\s*\(fictional speaker\)/, '')) + '</span></li>').join('') + '</ol></div>';
  }

  vx.chapter(7, {
    render() {
      const S = DC.state, u = U(), done = DC.isDone(7), checked = S.checked;
      const say = done ? ['You are ready for the conference!', 'celebrate'] : !checked ? ['Welcome! Tap the scanner with your badge.', 'welcome'] : S.reg.orderOk ? ['Great talk plan! Now check in is done too.', 'celebrate'] : ['You are in! Now plan your 60-second talk.', 'encourage'];
      const hot = [{ x: 49, y: 63, label: 'Scan my badge', act: 'v7scan', w: 90, h: 60, pulse: !checked, done: checked }, { x: 32, y: 52, label: 'Receptionist', act: 'v7greet', w: 120, h: 180 }, { x: 25, y: 26, label: 'Conference map', act: 'v7map', w: 130, h: 90 }, { x: 56, y: 26, label: 'Program screen', act: 'v7prog', w: 200, h: 100 }, { x: 83, y: 28, label: 'Poster assignment board', act: 'v7board', w: 200, h: 140 }];
      const tray = vx.tray([{ icon: 'badge', label: 'Scan my badge', act: 'v7scan', done: checked }, { icon: 'map', label: 'Conference map', act: 'v7map', on: u.view === 'map' }, { icon: 'abstract', label: 'Program', act: 'v7prog', on: u.view === 'prog' }, { icon: 'poster', label: 'My poster board', act: 'v7board', on: u.view === 'board' }]);
      let panel = '';
      if (u.view === 'prog') panel = programPanel(); else if (u.view === 'board') panel = checked ? boardPanel() : '<div class="vx-fb info">Scan your badge first. Then the board shows your spot.</div>'; else if (u.view === 'map') panel = '<div class="vx-panel"><p class="vx-title" style="font-size:1.1rem;margin:0">The hall has six areas</p><div class="row" style="margin-top:.4rem">' + DC.AREAS.map((a) => '<span class="vx-step" style="width:auto;padding:0 .8rem;cursor:default">' + esc(a.name) + '</span>').join('') + '</div><p class="vx-note">You will explore them all in the Living Conference Hall. This event is pretend.</p></div>';
      return '<div class="vx-stage"><div class="vx-main">' + vx.scene({ art: vx.svg(A.lobby(checked, checked ? asg().board : 0), 'The conference lobby: a registration desk with a friendly receptionist and a badge scanner, a conference map, a program screen and a poster board numbered 1 to 40'), hot }) + vx.guide(say[1], say[0]) + '</div><div class="vx-side">' +
        '<div class="vx-panel" style="text-align:center"><div id="v7badge">' + DC.badgeHTML(checked ? 'Board #' + asg().board : '') + '</div>' + (checked ? '<div class="vx-fb ok" role="status" id="v7ok" tabindex="-1">✓ Checked in. Welcome, ' + esc(DC.name()) + '!</div>' : '<button type="button" class="vx-btn big" data-act="v7scan" style="margin-top:.6rem">' + vx.icon('badge', 28) + ' Scan my badge</button>') + '</div>' +
        tray + '<div id="v7view">' + panel + '</div><div class="vx-panel"><p class="vx-title" style="font-size:1.1rem;margin:0 0 .3rem">Plan your 60-second talk</p><div id="v7strip">' + stripHTML() + '</div></div></div></div>';
    }
  });
  DC.acts.v7scan = () => {
    if (DC.state.checked) { vx.say('You are already checked in!', 'encourage'); return; }
    const b = DC.$('#v7badge .badge'); if (b && !vx.reduced()) { b.style.transition = 'transform .5s'; b.style.transform = 'translateY(-8px) scale(1.04)'; }
    DC.state.checked = true; DC.save(); setTimeout(() => { DC.refresh('#v7ok'); DC.softUpdate(); DC.say('Beep! You are checked in. Your poster board is number ' + DC.assignment().board + '.'); }, vx.reduced() ? 0 : 450);
  };
  DC.acts.v7greet = () => vx.say(DC.state.checked ? 'Welcome, ' + DC.name() + '! Board #' + DC.assignment().board + '. Have fun!' : 'Hello! Scan your badge and I will find your poster board.', 'welcome');
  DC.acts.v7map = () => { U().view = 'map'; DC.save(); DC.refresh('#v7view'); };
  DC.acts.v7prog = () => { U().view = 'prog'; DC.save(); DC.refresh('#v7view'); };
  DC.acts.v7board = () => { U().view = 'board'; DC.save(); DC.refresh('#v7view'); };
  const redraw = (focus) => { DC.$('#v7strip').innerHTML = stripHTML(); DC.softUpdate(); if (focus) { const f = DC.$(focus); if (f) f.focus(); } };
  DC.acts.v7add = (b) => { const u = U(); u.checked = false; DC.state.reg.orderOk = false; if (!u.strip.includes(b.dataset.id)) u.strip.push(b.dataset.id); DC.save(); redraw('#v7strip [data-act=v7add]'); };
  DC.acts.v7drop = (b) => { const u = U(); u.checked = false; DC.state.reg.orderOk = false; u.strip = u.strip.filter((x) => x !== b.dataset.id); DC.save(); redraw('#v7strip [data-act=v7add]'); };
  DC.acts.v7check = () => { const u = U(), ok = u.strip.length === 6 && u.strip.every((x, i) => x === ANSWER[i]); u.checked = true; DC.state.reg.orderOk = ok || DC.state.reg.orderOk; if (u.strip.length === 6) DC.state.reg.order = u.strip.slice(); DC.state.reg.checked = true; DC.save(); redraw('[data-act=v7check]'); DC.say(ok ? 'Yes! That is a clear order.' : 'Some steps are in the wrong place.'); };
})();
