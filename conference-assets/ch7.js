/* Chapter 7 : Conference registration and preparation (all events, people and times are fictional) */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc;

  DC.hashNum = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; };
  DC.assignment = () => {
    const h = DC.hashNum(DC.name() + '|' + (DC.state.path || '')), board = 1 + (h % 40), slots = ['1:20', '1:35', '1:50', '2:05'];
    return { board, time: slots[(h >> 3) % slots.length], hall: 'Poster Hall B' };
  };

  const STEPS = [
    ['hello', 'Say hello, share your name or nickname, and ask your question', 'Start with the question. It tells listeners what to listen for.'],
    ['why', 'Why the question matters (background)', 'One or two sentences of background help everyone follow along.'],
    ['how', 'How you studied it (methods)', 'What you changed, measured and kept the same.'],
    ['found', 'What you found (results)', 'Say what the data show. Point to the figure.'],
    ['means', 'What it means, and how sure you are (conclusion)', 'Use careful words. Say what you can and cannot tell.'],
    ['next', 'Limits, next steps, and an invitation for questions', 'Finish by inviting questions. It is okay to say "I don’t know yet."']
  ];
  const ANSWER = STEPS.map((s) => s[0]);
  function initialOrder() { const r = DC.rng('talk-' + DC.name()); const a = ANSWER.slice(); do { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } while (a.join() === ANSWER.join()); return a; }
  const order = () => { if (!DC.state.reg.order) { DC.state.reg.order = initialOrder(); DC.save(); } return DC.state.reg.order; };

  function orderHTML() {
    const o = order(), st = DC.state.reg;
    return '<ol class="clean" style="list-style:none;padding:0">' + o.map((id, i) => {
      const step = STEPS.find((s) => s[0] === id), right = st.checked && id === ANSWER[i], wrong = st.checked && id !== ANSWER[i];
      return '<li class="setuprow' + (right ? ' good' : wrong ? ' bad' : '') + '" style="grid-template-columns:auto 1fr auto"><b aria-hidden="true">' + (i + 1) + '.</b><span id="ord-' + id + '">' + esc(step[1]) + (st.checked ? '<span class="hint" style="display:block">' + (right ? '✓ ' : '✗ ') + esc(step[2]) + '</span>' : '') + '</span><span class="row"><button type="button" class="btn small" data-act="ordMove" data-i="' + i + '" data-d="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move up: ' + esc(step[1]) + '">↑</button><button type="button" class="btn small" data-act="ordMove" data-i="' + i + '" data-d="1"' + (i === o.length - 1 ? ' disabled' : '') + ' aria-label="Move down: ' + esc(step[1]) + '">↓</button></span></li>';
    }).join('') + '</ol>';
  }
  DC.acts.ordMove = (b) => {
    const i = +b.dataset.i, d = +b.dataset.d, o = order(); const j = i + d; if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]]; DC.state.reg.checked = false; DC.state.reg.orderOk = false; DC.save();
    DC.$('#ordBox').innerHTML = orderHTML(); DC.say('Moved to position ' + (j + 1));
    const nb = DC.$('#ordBox [data-act=ordMove][data-i="' + j + '"][data-d="' + d + '"]') || DC.$('#ordBox [data-act=ordMove][data-i="' + j + '"]'); if (nb) nb.focus();
    DC.$('#ordMsg').innerHTML = ''; DC.softUpdate();
  };
  DC.acts.ordCheck = () => {
    const o = order(), ok = o.every((id, i) => id === ANSWER[i]); DC.state.reg.checked = true; DC.state.reg.orderOk = ok || DC.state.reg.orderOk; DC.save();
    DC.$('#ordBox').innerHTML = orderHTML();
    const n = o.filter((id, i) => id === ANSWER[i]).length;
    DC.$('#ordMsg').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '" role="status">' + (ok ? 'Yes! That is a clear order: question, background, methods, results, meaning, then limits and questions. Listeners can follow every step.' : n + ' of 6 are in the right place. Read the notes beside the steps marked ✗ and try again. Hint: results come after methods, and meaning comes after results.') + '</div>'; DC.softUpdate();
  };
  DC.acts.checkIn = () => {
    DC.state.checked = true; DC.save(); DC.refresh('#checkedMsg'); DC.softUpdate(); DC.say('You are checked in!');
  };

  DC.register(7, {
    complete: () => !!(DC.state.checked && DC.state.reg.orderOk),
    gate: () => 'Check in at the desk and put the six talk steps in the right order.',
    render() {
      const s = DC.state, as = DC.assignment(), ab = DC.absComplete ? DC.absComplete() : false, po = DC.posterComplete ? DC.posterComplete() : false;
      return '<p class="lead">Welcome to the conference venue! Check in, collect your badge, look at the program and get ready to present.</p>' +
        '<div class="callout sim"><strong>Everything here is pretend.</strong> The conference, schedule, board numbers and speakers are fictional. We never ask for your real name, school or email.</div>' +
        '<div class="grid2"><div class="card"><h3>1 · Check-in desk</h3><div style="text-align:center">' + DC.badgeHTML('Board #' + as.board) + '</div>' +
        '<p>Name on badge: <strong>' + esc(DC.name()) + '</strong>. ' + (s.anon ? 'You chose to stay anonymous.' : 'This is your nickname.') + ' You can change it in Chapter 1.</p>' +
        (s.checked ? '<div class="fb ok" id="checkedMsg" tabindex="-1" role="status">✓ You are checked in! Welcome, ' + esc(DC.name()) + '.</div>' : '<button type="button" class="btn gold" data-act="checkIn">Check in and collect my badge</button>') + '</div>' +
        '<div class="card"><h3>2 · Your poster assignment</h3><dl class="study"><div><dt>Hall</dt><dd>' + as.hall + '</dd></div><div><dt>Board</dt><dd>#' + as.board + '</dd></div><div><dt>Poster Session B</dt><dd>Visitors arrive at about ' + as.time + '</dd></div></dl><p class="hint">Made up from your nickname, just for fun. It is not a real assignment.</p></div></div>' +
        '<div class="card"><h3>3 · Conference program (fictional)</h3><div class="tblwrap"><table class="tbl"><caption>Program</caption><thead><tr><th scope="col">Time</th><th scope="col">Session</th><th scope="col">Where</th></tr></thead><tbody>' + DC.PROGRAM.map((r) => '<tr' + (/you present/.test(r[1]) ? ' style="background:var(--gold2)"' : '') + '><th scope="row">' + r[0] + '</th><td style="text-align:left">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join('') + '</tbody></table></div></div>' +
        '<div class="card"><h3>4 · Presentation preparation</h3><ul class="check"><li class="' + (ab ? 'ok' : 'todo') + '">Abstract ' + (ab ? 'is ready.' : 'is not finished yet. <button type="button" class="btn small" data-act="go" data-n="5">Open Chapter 5</button>') + '</li><li class="' + (po ? 'ok' : 'todo') + '">Poster ' + (po ? 'is ready.' : 'is not finished yet. <button type="button" class="btn small" data-act="go" data-n="6">Open Chapter 6</button>') + '</li></ul><p class="hint">You can continue without them, but your conversations in the hall will be easier with a finished abstract and poster.</p></div>' +
        '<div class="card"><h3>5 · Practice: put your 60-second talk in order</h3><p>A short talk has a shape. Use the arrows to put the six steps in the best order, then check. (A 60-second talk is only about 120 to 150 spoken words, so each step gets a sentence or two.)</p><div id="ordBox">' + orderHTML() + '</div><div class="row"><button type="button" class="btn gold" data-act="ordCheck">Check my order</button></div><div id="ordMsg"></div></div>';
    }
  });
})();
