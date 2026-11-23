/* Chapters 1 and 2 */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc;

  /* ================= Chapter 1 : the invitation ================= */
  const COLORS = [['#1d5a5a', 'Teal'], ['#b5483c', 'Coral'], ['#5b3a6b', 'Plum'], ['#20365a', 'Navy'], ['#8a6a1d', 'Gold']];
  const ICONS = [['🔬', 'microscope'], ['🧪', 'test tube'], ['🌱', 'seedling'], ['🔭', 'telescope'], ['🪰', 'fly'], ['🍌', 'banana']];

  DC.badgeHTML = (extraNote) => {
    const s = DC.state;
    return '<div class="badge" style="--bc:' + esc(s.badge.color) + '" role="group" aria-label="Conference badge preview"><div class="top">Drosie’s First Scientific Conference</div><div class="ic" aria-hidden="true">' + s.badge.icon + '</div><div class="nm">' + esc(DC.name()) + '</div><div class="rl">Young Researcher' + (extraNote ? ' · ' + esc(extraNote) : '') + '</div><div class="fic">Simulated educational event</div></div>';
  };

  function ch1done() { const s = DC.state; return !!(s.mode && (s.anon || s.nick.trim().length > 0)); }

  DC.register(1, {
    complete: ch1done,
    gate: () => 'Choose a nickname (or stay anonymous) and pick how you want to take part.',
    render() {
      const s = DC.state;
      return '<div class="grid2"><div>' +
        '<div class="invite"><img src="images/drosie-mascot-640.webp" alt="Drosie, a friendly cartoon fruit fly, welcoming you" width="110" height="110"><p class="kicker">You are invited!</p><h3>Drosie’s First Scientific Conference</h3><p class="to" id="inviteTo">Dear ' + esc(DC.name()) + ',</p><p>Come share your discoveries, ask questions and listen to other young researchers. Bring your curiosity!</p><p class="sm" style="font-size:.8rem;color:var(--plum);font-weight:700">A simulated, educational conference. All scientists and schedules here are fictional.</p></div>' +
        '</div><div class="card"><h3>Hi, I’m Drosie!</h3><p>A <strong>scientific conference</strong> is a gathering where researchers share what they are working on. They give short talks and show posters. Then they talk with each other about it. Scientists go to conferences to:</p><ul class="clean"><li><strong>Share</strong> what they asked, did and found.</li><li><strong>Learn</strong> from other people’s work and ideas.</li><li><strong>Get feedback</strong> from people who ask hard, friendly questions.</li></ul><div class="callout">Many conference talks and posters show work that is still in progress. They have usually <strong>not</strong> been through a journal’s peer review yet. The questions and feedback help scientists improve their work.</div></div></div>' +
        '<form class="card" onsubmit="return false" aria-labelledby="regH"><h3 id="regH">Make your badge</h3><div class="grid2"><div>' +
        '<div class="field"><label for="nick">Nickname</label><span class="hint">Use a nickname, not your real full name, school or email.</span><input type="text" id="nick" data-bind="nick" maxlength="20" autocomplete="off" value="' + esc(s.nick) + '" ' + (s.anon ? 'disabled' : '') + '><span id="nickWarn" class="hint" role="alert" style="color:var(--bad);font-weight:700"></span></div>' +
        '<label class="skipchk"><input type="checkbox" id="anon" data-bind="anon"' + (s.anon ? ' checked' : '') + '> I’d rather stay anonymous (my badge will say “Young Researcher”)</label>' +
        '<fieldset class="field" style="border:0;padding:0;margin-top:.8rem"><legend class="lbl">Badge color</legend><div class="choice" id="colorChoice">' + COLORS.map((c) => '<label><input type="radio" name="bcolor" data-bind="badge.color" value="' + c[0] + '"' + (s.badge.color === c[0] ? ' checked' : '') + '><span class="face" style="border-left:12px solid ' + c[0] + '"><b>' + c[1] + '</b></span></label>').join('') + '</div></fieldset>' +
        '<fieldset class="field" style="border:0;padding:0"><legend class="lbl">Badge picture</legend><div class="choice">' + ICONS.map((c) => '<label style="flex:0 1 5.5rem"><input type="radio" name="bicon" data-bind="badge.icon" value="' + c[0] + '" aria-label="' + c[1] + '"' + (s.badge.icon === c[0] ? ' checked' : '') + '><span class="face" style="text-align:center;font-size:1.5rem" aria-hidden="true">' + c[0] + '</span></label>').join('') + '</div></fieldset>' +
        '</div><div style="text-align:center"><p class="kicker">Badge preview</p><div id="badgeBox">' + DC.badgeHTML() + '</div></div></div>' +
        '<fieldset class="field" style="border:0;padding:0;margin-top:.6rem"><legend class="lbl">How would you like to take part?</legend><div class="choice">' +
        '<label><input type="radio" name="mode" data-bind="mode" value="guided"' + (s.mode === 'guided' ? ' checked' : '') + '><span class="face"><b>Guided</b><small>One chapter at a time, in order. Drosie keeps you on track.</small></span></label>' +
        '<label><input type="radio" name="mode" data-bind="mode" value="independent"' + (s.mode === 'independent' ? ' checked' : '') + '><span class="face"><b>Independent</b><small>Open any chapter in any order. Good for older learners and revisiting.</small></span></label></div></fieldset></form>' +
        '<div class="card"><h3>Quick check: is this peer-reviewed?</h3>' + DC.mcq('c1peer', 'A young scientist shows a poster at a conference. Which statement is the most accurate?', [
          ['A journal has already peer-reviewed everything shown at the conference.', false, 'Not quite. Journal peer review is a separate process. Many conference posters show work that has not been reviewed by a journal.'],
          ['The poster shares work with other scientists so they can ask questions and give feedback.', true, 'Yes. Conferences are for sharing and discussing work. Feedback helps scientists improve it, and some work later goes through journal peer review.'],
          ['Only finished, perfect experiments are allowed at conferences.', false, 'Scientists often share work in progress, including surprising results and open questions.']
        ]) + '</div>' +
        '<p class="hint">Privacy: nothing you type leaves your device unless you choose to download or print it. No account, ads or tracking. If you clear your browser’s data, your work will be erased, so use <strong>Back up my work</strong> at the top to keep a copy.</p>';
    },
    mount() {
      const warn = DC.$('#nickWarn');
      DC.onBind('nick', (el) => {
        if (DC.looksPersonal(el.value)) { DC.state.nick = ''; el.value = ''; warn.textContent = 'That looks like an email, web address or phone number. Please use a nickname instead.'; DC.save(); } else warn.textContent = '';
        paint();
      });
      DC.onBind('anon', (el, v) => { DC.$('#nick').disabled = v; paint(); });
      DC.onBind('badge', paint);
      DC.onBind('mode', paint);
      function paint() { DC.$('#badgeBox').innerHTML = DC.badgeHTML(); DC.$('#inviteTo').textContent = 'Dear ' + DC.name() + ','; DC.softUpdate(); }
    }
  });

  /* generic multiple-choice question with specific feedback: stores selection in state.det */
  DC.mcq = (id, prompt, options, tag) => {
    const st = DC.state.det[id], sel = st && st.sel;
    let h = '<div class="q' + (st && st.ok ? ' done' : '') + '" data-q="' + id + '"><h4 id="' + id + '-h">' + esc(prompt) + '</h4><div class="opts" role="group" aria-labelledby="' + id + '-h">';
    options.forEach((o, i) => {
      const chosen = sel === i, cls = chosen ? (o[1] ? ' right' : ' wrong') : '';
      h += '<button type="button" class="opt' + cls + '" data-act="mcq" data-q="' + id + '" data-i="' + i + '" aria-pressed="' + (chosen ? 'true' : 'false') + '"><span aria-hidden="true">' + String.fromCharCode(65 + i) + '.</span><span>' + esc(o[0]) + '</span></button>';
    });
    h += '</div>';
    if (sel != null) h += '<div class="fb ' + (options[sel][1] ? 'ok' : 'no') + '" role="status"><strong>' + (options[sel][1] ? 'Yes! ' : 'Not quite. ') + '</strong>' + esc(options[sel][2]) + '</div>';
    return h + '</div>';
  };
  DC.acts.mcq = (b) => {
    const id = b.dataset.q, i = parseInt(b.dataset.i, 10);
    const reg = DC.mcqReg[id] || null;
    const ok = reg ? reg[i][1] : true;
    const prev = DC.state.det[id] || { tries: 0 };
    DC.state.det[id] = { sel: i, ok: ok || !!prev.ok, tries: prev.tries + 1, firstOk: prev.tries === 0 ? ok : prev.firstOk };
    DC.save(); DC.refresh('[data-q="' + id + '"] .opt:nth-child(' + (i + 1) + ')'); DC.softUpdate(); { const f = DC.$('[data-q="' + id + '"] .fb'); if (f) DC.say(f.innerText); }
  };
  DC.mcqReg = {};
  /* register options so the click handler can score them; chapters call DC.mcqDef */
  const origMcq = DC.mcq;
  DC.mcq = (id, prompt, options, tag) => { DC.mcqReg[id] = options; return origMcq(id, prompt, options, tag); };

  /* ================= Chapter 2 : choose a path ================= */
  const FIELDS = [
    ['title', 'Project title', 'A short title that says what you studied. Example: "Which paper towel soaks up the most water?"', 'text', true],
    ['question', 'Research question', 'What did you want to find out? Write it as a question. Descriptive projects can ask "What is it like?" or "What do I notice?"', 'area', true],
    ['background', 'Background', 'What do you already know, and why does it matter? Name where you learned each fact (a book, a teacher, a website).', 'area'],
    ['hypothesis', 'Hypothesis (if applicable)', 'A possible explanation you can test, with a reason. Only experiments that test an idea need one. Observation and exploration projects can skip this.', 'area'],
    ['methods', 'Methods', 'What did you do, step by step, so someone else could repeat it? What did you change, measure and keep the same?', 'area'],
    ['data', 'Observations or data', 'What did you actually see or measure? Write only what really happened, with units for numbers. Have not collected data yet? Write your plan or skip this.', 'area'],
    ['results', 'Results', 'What pattern or facts do your observations or data show? Describe first. Explaining comes next.', 'area'],
    ['interpretation', 'Interpretation', 'What do you think the results mean? Use words like "might" or "suggests" when you are not sure. What other explanation could fit?', 'area'],
    ['limitations', 'Limitations', 'What makes your results less certain? For example: how many tries, what you could not control, what you did not measure.', 'area'],
    ['conclusion', 'Conclusion', 'Answer your question using your evidence. It is fine to say "I don’t know yet" and what you would do next.', 'area']
  ];
  DC.B_FIELDS = FIELDS;
  const TYPES = [['experiment', 'Experiment', 'I changed one thing and measured what happened.'], ['observation', 'Observation', 'I watched and recorded what happens, without changing anything.'], ['exploration', 'Exploration', 'I am trying things out to see what I notice.']];
  DC.bTypeLabel = () => (TYPES.find((t) => t[0] === DC.state.b.type) || TYPES[0])[1];
  DC.bFilled = (k) => String(DC.state.b.f[k] || '').trim().length > 0;
  DC.bHasHyp = () => DC.state.b.type === 'experiment' && !DC.state.b.skip.hypothesis;

  function ch2done() {
    const s = DC.state;
    if (s.path === 'A') return !!s.a.acked;
    if (s.path === 'B') return DC.bFilled('title') && DC.bFilled('question');
    return false;
  }

  function studyCard() {
    const S = DC.STUDY, D = DC.DATA;
    return '<div class="card gold"><h3>Study design: ' + esc(S.title) + '</h3><span class="tag">Simulation</span> <span class="tag t">Guided Drosophila research</span>' +
      '<dl class="study" style="margin-top:.6rem">' +
      [['Research question', S.question], ['Testable hypothesis', S.hypothesis], ['Prediction', S.prediction], ['Independent variable (what we change)', S.iv], ['Dependent variable (what we measure)', S.dv], ['Control condition', S.control],
       ['Number of flies', D.flies + ' flies in each group (one group at 25 °C, one at 18 °C).'], ['Number of trials', D.trials + ' trials per group, with ' + D.restSec + ' seconds of rest between trials.'], ['How climbing is measured', S.measure + ' The reference line is at ' + D.lineCm + ' cm, and the measurement period is ' + D.seconds + ' seconds.'],
       ['Kept the same (controlled variables)', '<ul class="clean">' + S.kept.map((k) => '<li>' + esc(k) + '</li>').join('') + '</ul>'], ['Sources of uncertainty', '<ul class="clean">' + S.uncertainty.map((k) => '<li>' + esc(k) + '</li>').join('') + '</ul>'], ['Experimental limitations', '<ul class="clean">' + S.limitations.map((k) => '<li>' + esc(k) + '</li>').join('') + '</ul>']]
        .map((r) => '<div><dt>' + r[0] + '</dt><dd>' + (r[1].charAt(0) === '<' ? r[1] : esc(r[1])) + '</dd></div>').join('') + '</dl></div>';
  }

  function readiness() {
    const s = DC.state.b, items = [];
    FIELDS.forEach((f) => {
      const skipped = !!s.skip[f[0]], filled = DC.bFilled(f[0]);
      if (f[0] === 'hypothesis' && s.type !== 'experiment') { items.push([f[1], 'ok', 'Not needed for this kind of project']); return; }
      if (filled) items.push([f[1], 'ok', 'Written']);
      else if (skipped) items.push([f[1], 'todo', 'Skipped: ' + (f[4] ? 'required' : 'fine for now, but readers may ask about it')]);
      else items.push([f[1], 'todo', f[4] ? 'Needed to continue' : 'Not written yet']);
    });
    return '<ul class="check">' + items.map((i) => '<li class="' + (i[1] === 'ok' ? 'ok' : 'todo') + '"><strong>' + esc(i[0]) + ':</strong> ' + esc(i[2]) + '</li>').join('') + '</ul>';
  }

  function bForm() {
    const s = DC.state.b;
    return '<div class="card gold"><h3>My own research project</h3><span class="tag t">Original research</span>' +
      '<div class="callout warn"><strong>Be honest with your data.</strong> Write only what you really observed or measured. If you have not collected something yet, say so or skip it. This site never fills in results for you.</div>' +
      '<fieldset class="field" style="border:0;padding:0"><legend class="lbl">What kind of project is it?</legend><div class="choice">' + TYPES.map((t) => '<label><input type="radio" name="btype" data-bind="b.type" value="' + t[0] + '"' + (s.type === t[0] ? ' checked' : '') + '><span class="face"><b>' + t[1] + '</b><small>' + t[2] + '</small></span></label>').join('') + '</div></fieldset>' +
      '<div class="callout" id="typeNote">' + typeNote() + '</div></div>' +
      '<div class="grid2"><div>' + FIELDS.map((f) => {
        const skipped = !!s.skip[f[0]], v = s.f[f[0]], hide = f[0] === 'hypothesis' && s.type !== 'experiment';
        return '<div class="field" id="wrap-' + f[0] + '"' + (hide ? ' hidden' : '') + '><label for="bf-' + f[0] + '">' + esc(f[1]) + (f[4] ? ' <span class="tag">needed</span>' : '') + '</label><span class="hint" id="bh-' + f[0] + '">' + esc(f[2]) + '</span>' +
          (f[3] === 'text' ? '<input type="text" id="bf-' + f[0] + '" data-bind="b.f.' + f[0] + '" maxlength="120" aria-describedby="bh-' + f[0] + '" value="' + esc(v) + '"' + (skipped ? ' disabled' : '') + '>' : '<textarea id="bf-' + f[0] + '" data-bind="b.f.' + f[0] + '" aria-describedby="bh-' + f[0] + '"' + (skipped ? ' disabled' : '') + '>' + esc(v) + '</textarea>') +
          (f[4] ? '' : '<label class="skipchk"><input type="checkbox" data-bind="b.skip.' + f[0] + '"' + (skipped ? ' checked' : '') + '> Skip: does not apply yet or at all</label>') + '</div>';
      }).join('') + '</div><div class="card sticky"><h3>Is my project ready to present?</h3><div id="ready">' + readiness() + '</div><p class="hint">Real presentations still make sense when some parts are missing, but readers will ask about them. Observation and exploration projects do not need a hypothesis.</p></div></div>';
  }
  function typeNote() {
    const t = DC.state.b.type;
    return t === 'experiment' ? 'Experiments change one thing on purpose. Think about what you changed, what you measured and what you kept the same. A hypothesis is a good fit.'
      : t === 'observation' ? 'Observation projects describe what happens without changing it. You do not need a hypothesis. Good observations say when, where and how you looked.'
      : 'Exploration is a fine way to start. You do not need a hypothesis. Write down what you notice and what new questions come up.';
  }

  DC.register(2, {
    complete: ch2done,
    gate: () => (DC.state.path === 'A' ? 'Tick the box to confirm you know this activity is a simulation.' : DC.state.path === 'B' ? 'Give your project a title and a research question to continue.' : 'Choose a research path to continue.'),
    render() {
      const s = DC.state;
      let h = '<p class="lead">Scientists begin with a question. Choose how you would like to do your research for this conference. Both paths lead to the same poster, abstract and conference.</p>' +
        '<div class="grid2"><div class="card pathcard' + (s.path === 'A' ? ' sel' : '') + '"><span class="tag">Path A</span><h3>Guided Drosophila research</h3><p>Investigate a <strong>simulated</strong> fruit fly climbing experiment. You run the trials, record the numbers and decide what they can and cannot tell us.</p><button type="button" class="btn ' + (s.path === 'A' ? 'primary' : '') + '" data-act="pickPath" data-p="A" aria-pressed="' + (s.path === 'A') + '">' + (s.path === 'A' ? '✓ Path A chosen' : 'Choose Path A') + '</button></div>' +
        '<div class="card pathcard' + (s.path === 'B' ? ' sel' : '') + '"><span class="tag t">Path B</span><h3>My own research</h3><p>Bring a project you really did or are planning: an experiment, observation or exploration. You will organize your own information. Nothing is made up for you.</p><button type="button" class="btn ' + (s.path === 'B' ? 'primary' : '') + '" data-act="pickPath" data-p="B" aria-pressed="' + (s.path === 'B') + '">' + (s.path === 'B' ? '✓ Path B chosen' : 'Choose Path B') + '</button></div></div>';
      if (s.path === 'A') {
        h += '<div class="callout sim"><strong>This is a simulation.</strong> The fruit fly numbers in this activity were made up for learning. They are not from a real published experiment, and they do not show what real flies would do. Real flies and real data would vary more.</div>' + studyCard() +
          '<div class="card"><h3>Check your understanding</h3>' + DC.mcq('c2hyp', 'Which sentence is the PREDICTION (not the hypothesis)?', [
            ['Cooler air slows fruit fly activity because fruit flies are ectotherms.', false, 'That sentence gives a reason (the idea being tested), so it is the hypothesis.'],
            ['If cooler air reduces climbing, fewer flies will be above the 8 cm line at 18 °C than at 25 °C.', true, 'A prediction says what we expect to measure if the hypothesis is right.'],
            ['Fruit flies are interesting insects.', false, 'That is a fact or opinion. It is not a prediction we can measure.']]) +
          DC.mcq('c2iv', 'In this study, what is the independent variable?', [
            ['The number of flies above the line.', false, 'That is what we measure, which makes it the dependent variable.'],
            ['The test temperature.', true, 'It is the one thing we change on purpose: 25 °C or 18 °C.'],
            ['The size of the vial.', false, 'The vial is kept the same in both groups, so it is a controlled variable.']]) + '</div>' +
          '<label class="skipchk" style="font-size:1rem;color:var(--ink)"><input type="checkbox" id="ack" data-bind="a.acked"' + (s.a.acked ? ' checked' : '') + '> I understand this is a simulation with made-up data, not a real experiment.</label>';
      } else if (s.path === 'B') h += bForm();
      return h;
    },
    mount() {
      DC.onBind('a.acked', () => DC.softUpdate());
      DC.onBind('b.type', () => { const hide = DC.state.b.type !== 'experiment'; DC.$('#wrap-hypothesis').hidden = hide; DC.$('#typeNote').textContent = typeNote(); DC.$('#ready').innerHTML = readiness(); DC.softUpdate(); });
      DC.onBind('b.skip', (el) => { const k = el.dataset.bind.split('.')[2], inp = DC.$('#bf-' + k); if (inp) inp.disabled = el.checked; DC.$('#ready').innerHTML = readiness(); });
      DC.onBind('b.f', () => { const r = DC.$('#ready'); if (r) r.innerHTML = readiness(); DC.softUpdate(); });
    }
  });
  /* Each path keeps its own abstract, poster, hall answers, practice answers and revisions, so a Path A draft can never leak into a Path B portfolio (and vice versa). */
  const PATH_KEYS = ['abs', 'poster', 'hall', 'prac', 'revs'];
  DC.acts.pickPath = (b) => {
    const S = DC.state, np = b.dataset.p, op = S.path;
    if (op && op !== np) {
      S.snaps = S.snaps || {}; S.snaps[op] = {}; PATH_KEYS.forEach((k) => (S.snaps[op][k] = JSON.parse(JSON.stringify(S[k]))));
      const d = DC.defaults(); PATH_KEYS.forEach((k) => (S[k] = S.snaps[np] ? S.snaps[np][k] : d[k]));
      DC.toast('Switched to Path ' + np + '. Your Path ' + op + ' work is saved separately and returns if you switch back.');
    }
    DC.state.path = np; DC.save(); DC.refresh('[data-act="pickPath"][data-p="' + b.dataset.p + '"]'); DC.softUpdate(); DC.say('Path ' + b.dataset.p + ' chosen'); };
})();
