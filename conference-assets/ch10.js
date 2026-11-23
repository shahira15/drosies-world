/* Chapter 10 : The conference finale: certificate, printable materials, portfolio */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc;

  const allDone = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => DC.isDone(n));
  const today = () => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const projTitle = () => DC.absTitle();
  const certDate = () => DC.state.fin.date || today();

  DC.certHTML = () => '<div class="cert"><p class="kicker">Drosie’s World presents</p><h3>Certificate of Participation</h3><p>This certifies that</p><p class="nm">' + esc(DC.name()) + '</p><p>took part in <strong>Drosie’s First Scientific Conference</strong>, a <strong>simulated educational event</strong>, and presented the project</p><p style="font-size:1.2rem"><em>“' + esc(projTitle()) + '”</em>' + (DC.state.path === 'A' ? '<br><span class="sm">(a guided activity with simulated fruit fly data)</span>' : '<br><span class="sm">(the learner’s own research project)</span>') + '</p><p>' + esc(certDate()) + '</p><p class="sm">This certificate shows participation in a learning activity only. It is not a professional certification. It does not mean that any university, scientist, school or journal has reviewed, verified or endorsed the work.</p><p class="sm">Signed, Drosie the fruit fly (a cartoon mascot)</p></div>';

  DC.reflectionHTML = () => {
    const r = DC.state.refl, p = DC.state.prac, names = { quill: 'research questions', anand: 'controls', waverly: 'graphs', okoro: 'other explanations', bright: 'limits and next steps' };
    const row = (h, t) => '<h2 style="font:700 13pt Georgia,serif;margin:12pt 0 3pt">' + h + '</h2><p style="font-size:12pt;margin:0">' + (t && t.trim() ? esc(t).replace(/\n/g, '<br>') : '<em style="color:#777">(not written)</em>') + '</p>';
    const strong = DC.SCIENTISTS.filter((s) => DC.state.hall.sci[s.id] && DC.state.hall.sci[s.id].best).map((s) => names[s.id]);
    return '<div class="pg"><h1 style="font-family:Georgia,serif;margin:0">My Research Reflection</h1><p style="font:10pt Verdana,sans-serif;color:#444">' + esc(DC.name()) + ' · ' + esc(projTitle()) + ' · Drosie’s First Scientific Conference (simulated)</p>' +
      row('What I learned about how scientists share their work', r.learned) + row('What surprised me or was hard', r.surprise) + row('What I would like to investigate next', r.next) + row('What I am most proud of', r.proud) +
      row('My main finding, explained simply', p.explain) +
      '<h2 style="font:700 13pt Georgia,serif;margin:12pt 0 3pt">How I revised my work</h2>' + (DC.state.revs.length ? '<ol style="font-size:12pt">' + DC.state.revs.map((x) => '<li>' + esc(x.note) + '</li>').join('') + '</ol>' : '<p style="font-size:12pt"><em style="color:#777">(no entries)</em></p>') +
      '<h2 style="font:700 13pt Georgia,serif;margin:12pt 0 3pt">Questions I practiced answering in the hall</h2><p style="font-size:12pt">' + (strong.length ? 'I gave strong answers about ' + strong.join(', ') + '.' : '<em style="color:#777">(none yet)</em>') + '</p>' +
      '<p style="font:9pt Verdana,sans-serif;color:#555;margin-top:18pt">The scientists in the hall were fictional characters. Reflections show thinking and are not a test score.</p></div>';
  };

  /* ---------- portfolio (one self-contained HTML file) ---------- */
  function styles() { try { return Array.from(document.styleSheets).map((ss) => { try { return Array.from(ss.cssRules).map((r) => r.cssText).join('\n'); } catch (e) { return ''; } }).join('\n'); } catch (e) { return ''; } }
  DC.portfolioHTML = () => {
    const s = DC.state, A = s.path === 'A', st = DC.aStats();
    let data = '';
    if (A && DC.aComplete()) {
      data = '<h2>My data (simulated)</h2><div class="callout sim">The fruit fly numbers are simulated for learning. They are not from a real experiment.</div><table class="tbl"><caption>Flies above the 8 cm line after 10 seconds (out of 10)</caption><thead><tr><th>Trial</th>' + DC.DATA.conditions.map((c) => '<th>' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>' + [0, 1, 2, 3, 4].map((i) => '<tr><th>' + (i + 1) + '</th>' + DC.DATA.conditions.map((c) => '<td>' + s.a.rec[c.id][i] + '</td>').join('') + '</tr>').join('') + '<tr><th>Mean</th>' + DC.DATA.conditions.map((c) => '<td>' + DC.fmt(st[c.id].mean, 2) + '</td>').join('') + '</tr><tr><th>Lowest to highest</th>' + DC.DATA.conditions.map((c) => '<td>' + st[c.id].min + ' to ' + st[c.id].max + '</td>').join('') + '</tr></tbody></table>';
    } else if (!A) {
      const rows = s.b.log.filter((r) => r.label.trim() || String(r.value).trim());
      data = '<h2>My observations and data</h2>' + (rows.length ? '<table class="tbl"><thead><tr><th>What / when</th><th>Group</th><th>Value</th><th>Note</th></tr></thead><tbody>' + rows.map((r) => '<tr><td>' + esc(r.label) + '</td><td>' + esc(r.group) + '</td><td>' + esc(r.value) + '</td><td>' + esc(r.note) + '</td></tr>').join('') + '</tbody></table>' : '<p><em>No entries.</em></p>');
    }
    let design = '';
    if (A) design = '<h2>Study design (simulated)</h2><dl class="study">' + [['Research question', DC.STUDY.question], ['Hypothesis', DC.STUDY.hypothesis], ['Prediction', DC.STUDY.prediction], ['Independent variable', DC.STUDY.iv], ['Dependent variable', DC.STUDY.dv], ['Control', DC.STUDY.control]].map((r) => '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('') + '</dl>';
    else design = '<h2>My research project</h2><dl class="study">' + DC.B_FIELDS.map((f) => '<div><dt>' + esc(f[1]) + '</dt><dd>' + (s.b.f[f[0]].trim() ? esc(s.b.f[f[0]]).replace(/\n/g, '<br>') : '<em>' + (s.b.skip[f[0]] ? 'skipped' : 'not written') + '</em>') + '</dd></div>').join('') + '</dl>';
    const qa = DC.state.prac.qa, revs = s.revs;
    const body = '<h1>' + esc(DC.name()) + '’s conference portfolio</h1><p>Drosie’s First Scientific Conference · a simulated educational event · created ' + esc(today()) + '</p>' +
      '<div class="callout warn">This file contains everything the learner wrote. It was made on the learner’s own device and was not sent anywhere. Share it only with people you choose. Nothing in it has been peer reviewed or verified by a scientist.</div>' +
      (allDone() ? '<h2>Certificate</h2>' + DC.certHTML() : '<div class="callout">The certificate is not included because the conference is not finished yet.</div>') + design + data +
      '<h2>Abstract</h2><div class="preview">' + DC.abstractHTML() + '</div><h2>Poster</h2>' + DC.posterHTML() +
      '<h2>Practice and revision</h2><h3>Main finding, explained simply</h3><p>' + esc(s.prac.explain || '(not written)') + '</p>' + [['q1', 'What the data say and do not say'], ['q2', 'How sure I am'], ['q3', 'A next experiment']].map((q) => '<h3>' + q[1] + '</h3><p>' + esc(qa[q[0]] || '(not answered)') + '</p>').join('') + '<h3>Revision log</h3>' + (revs.length ? '<ol>' + revs.map((r) => '<li>' + esc(r.note) + '</li>').join('') + '</ol>' : '<p><em>No entries.</em></p>') +
      '<h2>Reflection</h2>' + [['learned', 'What I learned'], ['surprise', 'What surprised me or was hard'], ['next', 'What I want to investigate next'], ['proud', 'What I am proud of']].map((r) => '<h3>' + r[1] + '</h3><p>' + esc(s.refl[r[0]] || '(not written)') + '</p>').join('') +
      '<h2>References</h2><ul>' + DC.REFS.map((r) => '<li>' + esc(r.text) + ' doi:' + esc(r.doi) + '</li>').join('') + '</ul><p><small>Made with Drosie’s World (drosiesworld.com). Scientists and events in the conference hall were fictional.</small></p>';
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(DC.name()) + ' · Conference portfolio</title><style>' + styles() + '\nbody{max-width:1000px;margin:0 auto;padding:1rem;background:#fbf6e8}.posterwrap{overflow-x:auto}#printRoot{display:none}@media print{body>*{display:block!important}}</style></head><body>' + body + '</body></html>';
  };

  DC.acts.finCert = () => { DC.state.fin.claimed = true; DC.state.fin.date = DC.state.fin.date || today(); DC.save(); DC.refresh('#certBox'); DC.softUpdate(); DC.say('Certificate claimed. Congratulations!'); };
  DC.acts.finPrintCert = () => DC.print('<div class="pg">' + DC.certHTML() + '</div>', 'landscape');
  DC.acts.finPrintBadge = () => DC.print('<div class="pg" style="text-align:center;padding-top:2in">' + DC.badgeHTML('Conference participant') + '</div>', 'portrait');
  DC.acts.finPrintAbs = () => DC.print(DC.abstractSheet(), 'portrait');
  DC.acts.finPrintPoster = () => DC.print('<div class="pg">' + DC.posterHTML() + '</div>', 'landscape');
  DC.acts.finPrintRefl = () => DC.print(DC.reflectionHTML(), 'portrait');
  DC.acts.finPortfolio = () => { DC.download('drosie-conference-portfolio.html', DC.portfolioHTML(), 'text/html'); DC.toast('Portfolio downloaded. Open it in any browser.'); };

  const NEXT = [['lab-notebook-academy.html', 'Lab Notebook Academy', 'Practice keeping honest, trustworthy lab notes.'], ['climbing-game.html', 'Climbing Challenge', 'Try the fruit fly climbing game.'], ['grow-your-own-fruit-fly.html', 'Grow Your Own Fruit Fly', 'Follow a virtual fly lab and notebook.'], ['lab/', 'Secret Fly Lab', 'Explore a hidden fly lab.'], ['drosie-genetics-lab/', 'Drosie Genetics Lab', 'Breed virtual flies (older learners).'], ['science-activities/', 'All science activities', 'Browse everything by age.'], ['conference-teacher-guide.html', 'Teacher and parent guide', 'Discussion questions and ideas for adults.']];

  DC.register(10, {
    complete: () => !!(DC.state.fin.claimed && allDone()),
    gate: () => 'This is the last chapter.',
    render() {
      const s = DC.state, done = allDone(), miss = DC.CHAPTERS.filter((c) => c.n < 10 && !DC.isDone(c.n));
      let h = '<p class="lead">You investigated, wrote, designed, presented and revised. That is how scientists share their work. Congratulations!</p>';
      if (!done) h += '<div class="callout warn"><strong>The certificate unlocks when Chapters 1 to 9 are finished.</strong><ul class="clean">' + miss.map((c) => '<li>Chapter ' + c.n + ': ' + esc(c.title) + ' <button type="button" class="btn small" data-act="go" data-n="' + c.n + '">Open</button></li>').join('') + '</ul></div>';
      else if (!s.fin.claimed) h += '<div class="card gold"><h3>You finished the conference!</h3><button type="button" class="btn gold" data-act="finCert">Claim my certificate</button></div>';
      else h += '<div class="card" id="certBox" tabindex="-1"><h3>Your certificate</h3>' + DC.certHTML() + '<div class="row" style="margin-top:.6rem"><button type="button" class="btn primary" data-act="finPrintCert">Print or save certificate as PDF</button><button type="button" class="btn" data-act="finPrintBadge">Print my participation badge</button></div><div style="text-align:center;margin-top:.8rem">' + DC.badgeHTML('Conference participant') + '</div></div>';
      h += '<div class="card"><h3>Your materials</h3><p>Everything is made on your device. Nothing is uploaded. To save a PDF, choose “Save as PDF” in the print window.</p><div class="grid2"><div class="row"><button type="button" class="btn" data-act="finPrintAbs"' + (DC.absComplete() ? '' : ' aria-describedby="abHint"') + '>Print my abstract</button><button type="button" class="btn" data-act="finPrintPoster">Print my poster</button><button type="button" class="btn" data-act="finPrintRefl">Print my reflection</button></div><div class="row"><button type="button" class="btn primary" data-act="finPortfolio">Download my portfolio (.html)</button><button type="button" class="btn" data-act="exportJson">Download my project data (.json)</button></div></div>' +
        '<p class="hint" id="abHint">The portfolio is one file that has your certificate (if earned), study, data, abstract, poster, practice answers, revisions and reflection. The .json file lets you restore your work later with “Back up my work” at the top of the page.</p></div>';
      h += '<div class="card"><h3>What this does and does not mean</h3><ul class="clean"><li>Your certificate and badge are for taking part in a <strong>simulated</strong> learning event.</li><li>No scientist, university or journal has reviewed your work. The scientists in the hall were fictional.</li><li>Finishing the activity does not prove what you learned. Your best evidence is the thinking in your own abstract, poster and answers.</li>' + (s.path === 'A' ? '<li>The fruit fly data were simulated. Real fruit flies would vary more and need more groups to study.</li>' : '') + '</ul></div>';
      h += '<div class="card"><h3>Keep exploring on Drosie’s World</h3><div class="grid3">' + NEXT.map((n) => '<a class="card" style="text-decoration:none;margin:0" href="' + n[0] + '"><strong>' + esc(n[1]) + '</strong><br><span class="hint">' + esc(n[2]) + '</span></a>').join('') + '</div></div>';
      h += '<div class="card"><h3>Start again or revisit</h3><p>You can open any chapter from the bar at the top to revise your work, or try the other research path.</p><div class="row"><button type="button" class="btn" data-act="go" data-n="2">Try the other research path</button><button type="button" class="btn danger" data-act="backup">Back up or erase my work…</button></div></div>';
      return h;
    }
  });
})();
