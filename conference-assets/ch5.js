/* Chapter 5 : The Abstract Studio */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc, D = DC.DATA;

  const SECTIONS = [
    { k: 'bg', name: 'Background', why: 'Why does this matter? What is already known? One or two sentences.', ex: 'Example: "Fruit flies are ectotherms, so the air temperature around them can change how active they are."', starters: ['Scientists already know that ', 'I was curious because ', 'One thing that is known is '] },
    { k: 'obj', name: 'Research question or objective', why: 'The question you asked, in one sentence.', ex: 'Example: "I asked whether fewer flies climb above a line in cooler air."', starters: ['I wanted to find out whether ', 'This study asked: ', 'The goal was to see if '] },
    { k: 'methods', name: 'Methods', why: 'What you did, briefly: what you changed, what you measured, how many, how often.', ex: 'Example: "I tapped 10 flies to the bottom of a vial and counted how many were above a line after 10 seconds. I did this 5 times at each temperature."', starters: ['I tested ', 'I measured ', 'I repeated this ', 'I kept the same: '] },
    { k: 'results', name: 'Results', why: 'What you found. Use the real numbers from your data. Describe only. Save the explaining for the conclusion.', ex: 'Example: "At 25 °C the average was 7.2 flies above the line. At 18 °C it was 4.2."', starters: ['In the first group I counted ', 'On average, ', 'The highest value was ', 'The lowest value was '] },
    { k: 'conclusion', name: 'Conclusion', why: 'What your results suggest, how sure you can be, and one limit or next step.', ex: 'Example: "These simulated results fit my prediction, but with one vial per temperature they cannot show what all flies do."', starters: ['These results suggest ', 'My data fit / do not fit my prediction because ', 'A limit of this project is ', 'Next I would '] }
  ];
  DC.ABS_SECTIONS = SECTIONS;
  const wc = (t) => DC.words(t);

  /* ---------- allowed numbers for guided results ---------- */
  function allowedNumbers() {
    const s = DC.aStats(), set = new Set(), add = (n) => { set.add(DC.fmt(n, 1)); set.add(DC.fmt(n, 2)); set.add(String(Math.round(n))); };
    [D.flies, D.trials, D.seconds, D.lineCm, D.restSec, 25, 18, 3, 1, 2].forEach(add);
    D.conditions.forEach((c) => { c.counts.forEach(add); const x = s[c.id]; if (x) { [x.mean, x.median, x.min, x.max, x.range, x.sum, (x.mean / D.flies) * 100].forEach(add); } });
    if (s.control && s.cool) { add(s.control.mean - s.cool.mean); add(s.control.sum - s.cool.sum); }
    return set;
  }
  const numbersIn = (t) => (String(t).replace(/(\d),(\d)/g, '$1$2').match(/\d+(?:\.\d+)?/g) || []);

  /* ---------- feedback rules (word-pattern checks, not a real understanding of the text) ---------- */
  DC.absFeedback = () => {
    const a = DC.state.abs, path = DC.state.path, out = [], blocks = [];
    const add = (lvl, msg, block) => { out.push({ lvl, msg }); if (block) blocks.push(msg); };
    SECTIONS.forEach((s) => { const n = wc(a[s.k]); if (n === 0) add('todo', s.name + ' is empty. ' + s.why, true); else if (n < 6) add('warn', s.name + ' is very short. Add a little more detail.', true); });
    const all = SECTIONS.map((s) => a[s.k]).join(' ');
    if (a.obj.trim() && !/\?|whether|\bif\b|how|what|why|which|find out|investigat|test|see/i.test(a.obj)) add('todo', 'Your objective could say clearly what you asked, for example "I wanted to find out whether…".');
    if (path === 'A') {
      if (!/simulat/i.test(all)) add('warn', 'This activity uses simulated data. Say so somewhere in your abstract so no one thinks it was a real experiment.', true);
      if (a.methods.trim() && !/\d/.test(a.methods)) add('todo', 'Methods: say how many flies and how many trials.');
      if (a.results.trim()) {
        const okSet = allowedNumbers(), bad = numbersIn(a.results).filter((n) => !okSet.has(n) && !okSet.has(DC.fmt(parseFloat(n), 1)));
        if (bad.length) add('warn', 'Results: ' + bad.map((b) => '"' + b + '"').join(', ') + (bad.length > 1 ? ' do' : ' does') + ' not match your recorded data or summaries (see Chapter 4). Check your numbers.', true);
        if (!numbersIn(a.results).length) add('todo', 'Results: include at least one real number from your data, like an average.');
        if (!/(25|room|control)/i.test(a.results) || !/(18|cool)/i.test(a.results)) add('todo', 'Results: mention both conditions (25 °C and 18 °C) so readers can compare.');
        if (/\b(because|proves?|lazy|tired|energetic|slower|faster)\b/i.test(a.results)) add('warn', 'Results should describe what was measured. Explanations such as "because" or "tired" belong in the conclusion, and only as possibilities.');
      }
    } else if (path === 'B') {
      const rows = DC.bLogNumeric();
      if (a.results.trim()) {
        const have = new Set(); rows.forEach((r) => have.add(String(Number(r.value)))); ['data', 'results'].forEach((k) => numbersIn(DC.state.b.f[k]).forEach((n) => have.add(String(Number(n)))));
        DC.state.b.log.forEach((r) => numbersIn(r.note).forEach((n) => have.add(String(Number(n)))));
        const bad = numbersIn(a.results).filter((n) => !have.has(String(Number(n))));
        if (rows.length && numbersIn(a.results).length === 0) add('todo', 'You entered numbers in your data log. Consider using at least one in your results.');
        if (!rows.length && !DC.bFilled('data') && numbersIn(a.results).length) add('warn', 'You have no data entered in your project, but your results contain numbers. Make sure every number is something you really measured.');
        else if (rows.length && bad.length) add('warn', 'Results: ' + bad.map((b) => '"' + b + '"').join(', ') + ' do not appear in your data log. Check them against what you recorded.');
      }
      if (a.methods.trim() && wc(a.methods) < 12) add('todo', 'Methods: could someone repeat what you did? Add what you changed, measured or looked at.');
    }
    if (a.conclusion.trim()) {
      if (DC.overclaim(a.conclusion)) add('warn', 'Conclusion: words like "proves", "always" or "all flies" claim more than your data can show. Try "suggests", "fits" or "in this study".', true);
      if (!/(suggest|fit|fits|consistent|support|might|may |could|seems|in this|in my)/i.test(a.conclusion)) add('todo', 'Conclusion: use careful words such as "suggests" or "fits", and say how sure you can be.');
      if (!/(limit|only|small|more |need|cannot|can't|can not|not sure|don't know|do not know|future|next|another|other)/i.test(a.conclusion)) add('todo', 'Conclusion: add one limit or next step. For example, what you could not tell, or what you would test next.');
    }
    const total = wc(all);
    if (total > 220) add('warn', 'Abstracts are short. Yours is ' + total + ' words. Try to trim it below about 200.', true);
    else if (total > 0 && total < 40) add('todo', 'Your abstract is only ' + total + ' words so far. Most are about 80 to 150 words.');
    if (!out.some((o) => o.lvl === 'warn') && !out.some((o) => o.lvl === 'todo')) add('ok', 'All parts are present and the checker found no problems. Read it aloud once more. Does every sentence match your project?');
    out.blocks = blocks; return out;
  };
  DC.absComplete = () => {
    const a = DC.state.abs; if (!DC.state.path) return false;
    return SECTIONS.every((s) => wc(a[s.k]) >= 6) && DC.absFeedback().blocks.length === 0;
  };
  DC.absTitle = () => (DC.state.path === 'B' ? DC.state.b.f.title.trim() || 'My research project' : DC.STUDY.title);
  DC.absText = () => SECTIONS.map((s) => s.name + ': ' + DC.state.abs[s.k].trim()).join('\n');

  /* shared HTML for the abstract (screen preview and print) */
  DC.abstractHTML = () => {
    const a = DC.state.abs, sim = DC.state.path === 'A';
    return '<h3 style="margin:0">' + esc(DC.absTitle()) + '</h3><p style="margin:.1rem 0 .5rem;font-family:var(--read);font-size:.85rem">' + esc(DC.name()) + ' · Drosie’s First Scientific Conference (simulated educational event)' + (sim ? ' · <strong>Simulated data</strong>' : '') + '</p>' +
      SECTIONS.map((s) => '<h4>' + s.name + '</h4><p>' + (a[s.k].trim() ? esc(a[s.k].trim()).replace(/\n/g, '<br>') : '<em style="color:#777">(not written yet)</em>') + '</p>').join('');
  };

  /* ---------- example abstracts ---------- */
  function exampleHTML() {
    if (DC.state.path === 'A') {
      const sx = DC.aComplete() ? DC.aStats() : (function () { const o = {}; D.conditions.forEach((c) => (o[c.id] = DC.stats(c.counts))); return o; })();
      const ex = {
        bg: 'Fruit flies are ectotherms, so the air temperature around them can change how active they are.',
        obj: 'This simulated activity asked whether fewer fruit flies climb above an 8 cm line in 10 seconds at 18 °C than at 25 °C.',
        methods: 'In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial, one group at 25 °C and one at 18 °C. Flies above the line after 10 seconds were counted in 5 trials per group.',
        results: 'At 25 °C the mean was ' + DC.fmt(sx.control.mean, 1) + ' flies above the line (range ' + sx.control.min + ' to ' + sx.control.max + '). At 18 °C the mean was ' + DC.fmt(sx.cool.mean, 1) + ' (range ' + sx.cool.min + ' to ' + sx.cool.max + ').',
        conclusion: 'In this simulation, the 18 °C group had fewer flies above the line on average, which fits the prediction. With one vial per temperature and repeated trials on the same flies, these simulated data cannot show how all fruit flies behave. Testing more groups would be the next step.'
      };
      return '<details><summary><strong>See a simulated example abstract</strong> (for learning; from the simulated data)</summary><div class="preview" style="margin-top:.5rem"><h3 class="sr-only">Example abstract</h3>' + SECTIONS.map((s) => '<h4>' + s.name + '</h4><p>' + esc(ex[s.k]) + '</p>').join('') + '</div><p class="hint">Use it as a model for structure. Write your own sentences in your own words.</p></details>';
    }
    const ex = { bg: 'Paper towels are used to clean up spills, but they may not all soak up the same amount of water.', obj: 'I asked which of two brands of paper towel soaks up more water.', methods: 'I dipped one sheet of each brand in water for 10 seconds and weighed it before and after. I did this 3 times for each brand and used the same size of sheet.', results: 'Brand A gained 9, 10 and 8 grams. Brand B gained 5, 6 and 5 grams.', conclusion: 'Brand A soaked up more water in my tests. I only tried two brands and three sheets of each, so I cannot say how all brands compare.' };
    return '<details><summary><strong>See an example abstract</strong> (fictional project, only to show the structure)</summary><div class="preview" style="margin-top:.5rem"><h3 class="sr-only">Example abstract</h3>' + SECTIONS.map((s) => '<h4>' + s.name + '</h4><p>' + esc(ex[s.k]) + '</p>').join('') + '</div><p class="hint">This is a made-up example about a different project. Write about <em>your</em> project.</p></details>';
  }

  function fbHTML() {
    return '<ul class="check">' + DC.absFeedback().map((f) => '<li class="' + (f.lvl === 'ok' ? 'ok' : 'todo') + '">' + (f.lvl === 'warn' ? '<strong>Check: </strong>' : '') + esc(f.msg) + '</li>').join('') + '</ul>';
  }
  function paint() {
    const a = DC.state.abs, tot = wc(SECTIONS.map((s) => a[s.k]).join(' '));
    const pv = DC.$('#absPrev'); if (pv) pv.innerHTML = DC.abstractHTML();
    const w = DC.$('#absWc'); if (w) w.textContent = tot + ' words' + (tot > 200 ? ' (a bit long)' : tot >= 80 && tot <= 150 ? ' (a good length)' : tot ? ' (suggested: 80 to 150)' : '');
    SECTIONS.forEach((s) => { const e = DC.$('#wc-' + s.k); if (e) e.textContent = wc(a[s.k]) + ' words'; });
    const f = DC.$('#absFb'); if (f) f.innerHTML = fbHTML();
    DC.softUpdate();
  }

  /* ---------- starting drafts from real project facts (never conclusions, never invented numbers) ---------- */
  function draftFromProject() {
    const a = DC.state.abs, d = {};
    if (DC.state.path === 'A') {
      d.bg = 'Fruit flies are ectotherms, so the air temperature around them can change how active they are.';
      d.obj = 'This simulated activity asked whether fewer fruit flies climb above an 8 cm line in 10 seconds at 18 °C than at 25 °C.';
      d.methods = 'In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial, one at 25 °C and one at 18 °C. Flies above the line after 10 seconds were counted in 5 trials per group.';
      if (DC.aComplete()) { const s = DC.aStats(); d.results = 'At 25 °C the mean was ' + DC.fmt(s.control.mean, 1) + ' flies above the line (range ' + s.control.min + ' to ' + s.control.max + '). At 18 °C the mean was ' + DC.fmt(s.cool.mean, 1) + ' (range ' + s.cool.min + ' to ' + s.cool.max + ').'; }
    } else {
      const f = DC.state.b.f, steps = DC.state.b.steps.filter((x) => x.trim()).join('. ');
      d.bg = f.background; d.obj = f.question; d.methods = f.methods.trim() || steps; d.results = f.results.trim() || f.data; d.conclusion = f.conclusion;
    }
    let n = 0; Object.keys(d).forEach((k) => { if (d[k] && d[k].trim() && !a[k].trim()) { a[k] = d[k].trim(); n++; } });
    DC.save(); return n;
  }
  DC.acts.absDraft = () => { const n = draftFromProject(); DC.refresh(); DC.toast(n ? 'Filled ' + n + ' empty part' + (n > 1 ? 's' : '') + ' from your project. Now make them your own.' : 'Nothing to fill in. Your parts already have text, or your project has nothing to copy yet.'); };
  DC.acts.absStarter = (b) => {
    const ta = DC.$('#ab-' + b.dataset.k), cur = ta.value; ta.value = cur + (cur && !/\s$/.test(cur) ? ' ' : '') + b.dataset.t; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };
  DC.acts.absCopy = async () => { try { await navigator.clipboard.writeText(DC.absTitle() + '\n' + DC.absText()); DC.toast('Abstract copied.'); } catch (e) { DC.toast('Copy is not available here. Select the text in the preview instead.'); } };
  DC.acts.absPrint = () => DC.print(DC.abstractSheet(), 'portrait');
  DC.abstractSheet = () => '<div class="pg"><h1 style="font-family:Georgia,serif">Abstract</h1><div style="font-family:Georgia,serif;font-size:13pt;line-height:1.5">' + DC.abstractHTML().replace(/<h4>/g, '<h4 style="font:700 10pt Verdana,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#444;margin:10pt 0 2pt">') + '</div><p style="font:9pt Verdana,sans-serif;color:#555;margin-top:18pt">Written by a young researcher for Drosie’s First Scientific Conference, a simulated educational event on drosiesworld.com. This abstract has not been peer reviewed.' + (DC.state.path === 'A' ? ' The fruit fly data in it are simulated for learning.' : '') + '</p></div>';

  DC.register(5, {
    complete: () => DC.absComplete(),
    gate: () => 'Fill every part with a few sentences and fix any items marked "Check" in the feedback list.',
    render() {
      if (!DC.state.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      const a = DC.state.abs;
      return '<p class="lead">An <strong>abstract</strong> is a short summary of your study. At a conference, people often read the abstract first to decide if they want to hear more. It answers five questions: why, what did you ask, how, what did you find, and what does it mean?</p>' +
        (DC.state.path === 'A' ? '<div class="callout sim"><strong>Simulated data.</strong> Write about the simulated study you just ran, and say clearly that the data are simulated.</div>' : '') + exampleHTML() +
        '<div class="row" style="margin:.8rem 0"><button type="button" class="btn gold" data-act="absDraft">Start my draft from my project</button><span class="hint">Fills only empty parts with facts you already entered' + (DC.state.path === 'A' ? ' (your own recorded numbers)' : '') + '. It never writes your conclusion for you.</span></div>' +
        '<div class="studio"><div>' + SECTIONS.map((s) => '<div class="card"><div class="spread"><h3><label for="ab-' + s.k + '">' + s.name + '</label></h3><span class="wc" id="wc-' + s.k + '" aria-live="off">' + wc(a[s.k]) + ' words</span></div><p class="hint" id="abh-' + s.k + '">' + esc(s.why) + ' <em>' + esc(s.ex) + '</em></p><div class="starters" role="group" aria-label="Sentence starters for ' + s.name + '">' + s.starters.map((t) => '<button type="button" class="chip" data-act="absStarter" data-k="' + s.k + '" data-t="' + esc(t) + '">' + esc(t.trim()) + '…</button>').join('') + '</div><textarea id="ab-' + s.k + '" data-bind="abs.' + s.k + '" aria-describedby="abh-' + s.k + '">' + esc(a[s.k]) + '</textarea></div>').join('') + '</div>' +
        '<div class="sticky"><div class="card"><div class="spread"><h3>Live abstract preview</h3><span class="wc" id="absWc"></span></div><div class="preview" id="absPrev" aria-live="off"></div><div class="row" style="margin-top:.5rem"><button type="button" class="btn small" data-act="absCopy">Copy text</button><button type="button" class="btn small" data-act="absPrint">Print or save as PDF</button></div></div><div class="card gold"><h3>Feedback on what is missing</h3><div id="absFb"></div><p class="hint">This checker looks for key words, numbers and missing parts. It cannot judge everything. Ask a teacher or parent to read your abstract, too.</p></div></div></div>';
    },
    mount() { DC.onBind('abs.', paint); paint(); }
  });
})();
