/* Chapter 6 : The Scientific Poster Studio */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc, D = DC.DATA;

  const PAL = {
    teal: { n: 'Drosie teal', a: '#1d5a5a', b: '#fff8e6', c: '#1c2b28', d: '#d9b45a' },
    plum: { n: 'Plum', a: '#5b3a6b', b: '#fbf5ff', c: '#241a2b', d: '#e0b84a' },
    navy: { n: 'Navy', a: '#20365a', b: '#f4f8ff', c: '#14213a', d: '#e8b23a' },
    forest: { n: 'Forest', a: '#2f5d34', b: '#f6faef', c: '#1b2a1c', d: '#d9b45a' },
    mono: { n: 'High contrast', a: '#000000', b: '#ffffff', c: '#000000', d: '#ffd400' }
  };
  DC.POSTER_PAL = PAL;   /* read-only: lets the visual studio show the same palettes */
  const LAYOUTS = [['columns', 'Classic columns', 'Three columns with a wide results area. Reads left to right.'], ['story', 'Storyboard', 'Two columns that tell the story from top to bottom.'], ['banner', 'Banner', 'Results in the middle, with a bright title banner.']];
  const FIELDS = [
    ['title', 'Title', 'Say what you studied, in under 12 words. Titles can be a question or a finding.', 'text'],
    ['author', 'Researcher name or nickname', 'Use your nickname. Please do not add your school or other private details.', 'text'],
    ['question', 'Research question', 'One clear question.', 'area'], ['background', 'Background', 'Two or three short sentences. What do readers need to know first?', 'area'],
    ['methods', 'Methods', 'What you did, as short steps. Start a line with "- " to make a bullet list.', 'area'], ['results', 'Results', 'What you found, in words. Put numbers here. The figure shows the pattern.', 'area'],
    ['conclusions', 'Conclusions', 'What the results suggest and how sure you can be.', 'area'], ['limitations', 'Limitations', 'What makes the results less certain.', 'area'],
    ['ack', 'Acknowledgments (optional)', 'Thank people who helped, such as "my teacher". Use first names or roles only.', 'area'], ['refs', 'References (optional)', 'List real sources you used. Do not list a source you did not use.', 'area']
  ];
  const wc = DC.words;

  /* ---------- contrast ---------- */
  const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  DC.contrast = ratio;

  /* ---------- figure ---------- */
  function figureCfg() {
    const p = DC.state.poster;
    if (p.fig === 'none' || p.fig === 'draw') return null;
    if (DC.state.path === 'A') {
      if (!DC.aComplete()) return null;
      const cfg = DC.guidedChart({ id: 'pf', title: '' });
      if (p.figView === 'bar') { cfg.kind = 'bar'; cfg.yMin = 0; cfg.step = 1; cfg.showPoints = true; } else if (p.figView === 'line') { cfg.kind = 'line'; cfg.catLabels = [1, 2, 3, 4, 5]; cfg.xTitle = 'Trial number'; }
      cfg.title = ''; cfg.h = 240; cfg.w = 640; return cfg;
    }
    const b = DC.state.b; if (!b.chart.kind || b.chart.kind === 'auto' || b.chart.kind === 'words' || DC.bLogNumeric().length < 2) return null;
    const cfg = DC.bChartCfg(); cfg.interactive = false; cfg.id = 'pf'; cfg.title = ''; cfg.h = 240; cfg.w = 640; return cfg;
  }
  function autoCaption() {
    const p = DC.state.poster, cfg = figureCfg(); if (!cfg) return '';
    if (DC.state.path === 'A') {
      const kind = p.figView === 'bar' ? 'Bars show the mean; dots show single trials.' : p.figView === 'line' ? 'Each point is one trial, shown in order.' : 'Each marker is one trial; dashed lines show the mean.';
      return 'Figure 1. Number of flies (out of 10) above the 8 cm line 10 seconds after tapping the vial, for 5 trials at 25 °C and 5 trials at 18 °C. ' + kind + ' Simulated data.';
    }
    const b = DC.state.b.chart; return 'Figure 1. ' + (b.yTitle || 'Values') + (b.unit ? ' (' + b.unit + ')' : '') + (b.xTitle ? ' by ' + b.xTitle.toLowerCase() : '') + '. Data collected by the researcher.';
  }

  /* ---------- poster HTML (used on screen, in the full-size preview, in print and in the portfolio) ---------- */
  const rich = (t) => {
    const lines = String(t || '').split('\n').map((l) => l.trim()).filter(Boolean); let h = '', inList = false;
    lines.forEach((l) => { const li = /^[-•*]\s+/.test(l); if (li) { if (!inList) { h += '<ul>'; inList = true; } h += '<li>' + esc(l.replace(/^[-•*]\s+/, '')) + '</li>'; } else { if (inList) { h += '</ul>'; inList = false; } h += '<p>' + esc(l) + '</p>'; } });
    return h + (inList ? '</ul>' : '');
  };
  DC.posterHTML = () => {
    const p = DC.state.poster, f = p.f, pal = PAL[p.palette] || PAL.teal, cfg = figureCfg(), sim = DC.state.path === 'A';
    const cap = (p.figCaption || '').trim() || autoCaption();
    let fig = '';
    if (cfg) fig = '<figure>' + DC.chart(cfg) + '<figcaption>' + esc(cap) + '</figcaption></figure>';
    else if (p.fig === 'draw') fig = '<figure><div class="figbox">Space for a drawing, photo or table. Add it to the printed poster by hand.</div><figcaption>' + esc(cap || 'Figure 1. (Write what the figure shows.)') + '</figcaption></figure>';
    const sec = (cls, h, body) => '<section class="ps ' + cls + '"><h4>' + h + '</h4>' + body + '</section>';
    return '<div class="poster" data-layout="' + esc(p.layout) + '" style="--pa:' + pal.a + ';--pb:' + pal.b + ';--pc:' + pal.c + ';--pd:' + pal.d + ';--ps:' + (parseFloat(p.scale) || 1) + '">' +
      '<header class="pt"><h3 class="ptitle">' + esc(f.title || 'My research title') + '</h3><p>' + esc(f.author || DC.name()) + '<br>Drosie’s First Scientific Conference<br>' + (sim ? '<span class="simtag">Simulated data</span>' : 'A simulated educational conference') + '</p></header>' +
      sec('s-q', 'Question', rich(f.question)) + sec('s-bg', 'Background', rich(f.background)) + sec('s-me', 'Methods', rich(f.methods)) +
      sec('s-res', 'Results', rich(f.results) + fig) + sec('s-con', 'Conclusions', rich(f.conclusions)) + sec('s-lim', 'Limitations', rich(f.limitations)) +
      '<footer class="pfoot"><div>' + (f.ack.trim() ? '<p><strong>Thanks:</strong> ' + esc(f.ack.replace(/\n/g, ' ')) + '</p>' : '') + (f.refs.trim() ? '<p><strong>References:</strong> ' + esc(f.refs.replace(/\n/g, ' ')) + '</p>' : '') + '</div><p>Made with Drosie’s World. A simulated educational conference poster. It has not been peer reviewed' + (sim ? ', and the data are simulated' : '') + '.</p></footer></div>';
  };

  /* ---------- checks ---------- */
  function checks() {
    const p = DC.state.poster, f = p.f, pal = PAL[p.palette] || PAL.teal, out = [], blocks = [];
    const add = (ok, msg, block) => { out.push([ok, msg]); if (!ok && block) blocks.push(msg); };
    add(wc(f.title) > 0 && wc(f.title) <= 12, wc(f.title) === 0 ? 'Add a title.' : wc(f.title) <= 12 ? 'Title length is good (' + wc(f.title) + ' words).' : 'Title is long (' + wc(f.title) + ' words). Aim for 12 or fewer.', wc(f.title) === 0);
    [['question', 'Research question'], ['methods', 'Methods'], ['results', 'Results'], ['conclusions', 'Conclusions'], ['limitations', 'Limitations']].forEach((s) => add(wc(f[s[0]]) >= 3, s[1] + (wc(f[s[0]]) >= 3 ? ' is written.' : ' needs a few words.'), true));
    const long = ['question', 'background', 'methods', 'results', 'conclusions', 'limitations'].filter((k) => wc(f[k]) > 70);
    add(!long.length, long.length ? 'Too many words in: ' + long.join(', ') + '. Posters work best with short sections (about 70 words or fewer). Use bullets.' : 'Sections are short enough to read from a few steps away.');
    const total = ['question', 'background', 'methods', 'results', 'conclusions', 'limitations'].reduce((a, k) => a + wc(f[k]), 0);
    add(total <= 350, total <= 350 ? 'Total of ' + total + ' words. Good for a poster.' : 'Total of ' + total + ' words is a lot for a poster. Cut the least important sentences.');
    const cfg = figureCfg();
    if (cfg) { add(true, 'A labeled figure is included (axes have titles' + (DC.state.path === 'A' ? ', and bars start at zero' : '') + ').'); const bad = DC.state.path === 'B' && (!DC.state.b.chart.yTitle.trim() || !DC.state.b.chart.xTitle.trim()); if (bad) add(false, 'Your figure needs axis titles. Add them in Chapter 4, Step 2.', true); add((p.figCaption || '').trim().length > 0 || autoCaption().length > 0, 'Figure has a caption that says what it shows.'); }
    else add(p.fig === 'draw' || p.fig === 'none', DC.state.path === 'A' && !DC.aComplete() ? 'The figure needs your recorded data from Chapter 3.' : p.fig === 'draw' ? 'You chose a drawing space. Fill it in by hand and label it.' : 'No figure chosen. That is okay for a words-only project, but a picture or graph helps readers.');
    const t = ratio('#ffffff', pal.a), body = ratio('#ffffff', pal.c);
    add(t >= 4.5 && body >= 4.5, 'Color contrast: title text ' + t.toFixed(1) + ':1 and body text ' + body.toFixed(1) + ':1 (at least 4.5:1 is recommended for text).');
    if (p.layout === 'banner') { const bt = ratio(pal.d, '#1c2b28'); add(bt >= 4.5, 'Banner title contrast ' + bt.toFixed(1) + ':1.'); }
    add((parseFloat(p.scale) || 1) >= 0.9, (parseFloat(p.scale) || 1) >= 0.9 ? 'Text size is readable.' : 'Text size is small. Make it larger and use fewer words.');
    if (DC.overclaim(f.conclusions)) add(false, 'Conclusions: "proves", "always" or "all flies" claim more than your data can show.', true);
    if (DC.looksPersonal(f.author + ' ' + f.ack)) add(false, 'Remove emails, web addresses or phone numbers from the name or thanks.', true);
    const el = DC.$('#posterLive .poster'); if (el) { const w = el.getBoundingClientRect().width, h = el.getBoundingClientRect().height; const fits = h <= w / 1.34 + 3; add(fits, fits ? 'The poster fits on one landscape page.' : 'The poster is taller than one landscape page, so a printout would be cut or spill onto a second page. Shorten the text or reduce the text size.'); }
    out.blocks = blocks; return out;
  }
  DC.posterChecks = checks;
  DC.posterComplete = () => {
    const p = DC.state.poster, f = p.f; if (!DC.state.path || !p.started) return false;
    const need = wc(f.title) > 0 && ['question', 'methods', 'results', 'conclusions', 'limitations'].every((k) => wc(f[k]) >= 3);
    if (!need) return false;
    if (DC.overclaim(f.conclusions)) return false;
    if (DC.looksPersonal(f.author + ' ' + f.ack)) return false;
    if (DC.state.path === 'B' && figureCfg() && (!DC.state.b.chart.yTitle.trim() || !DC.state.b.chart.xTitle.trim())) return false;
    return true;
  };
  function checksHTML() { return '<ul class="check checks">' + checks().map((c) => '<li class="' + (c[0] ? 'ok' : 'todo') + '">' + esc(c[1]) + '</li>').join('') + '</ul>'; }

  /* on narrow screens, shrink the whole poster preview to fit (the full-size preview and print are not affected) */
  function fitPoster() { const w = DC.$('#posterLive .posterwrap'), po = w && DC.$('.poster', w); if (!po) return; po.style.zoom = ''; const avail = w.clientWidth - 24; po.style.zoom = avail < 720 ? String(Math.max(0.3, avail / 720)) : ''; }
  window.addEventListener('resize', () => { if (DC.state && DC.state.cur === 6) fitPoster(); });
  function paint() { const l = DC.$('#posterLive'); if (!l) return; l.innerHTML = '<div class="posterwrap" tabindex="0" role="region" aria-label="Poster preview">' + DC.posterHTML() + '</div>'; fitPoster(); const c = DC.$('#posterChecks'); if (c) c.innerHTML = checksHTML(); DC.softUpdate(); }

  /* ---------- starting content from the learner's own earlier work ---------- */
  DC.acts.postStart = () => {
    const P = DC.state.poster, f = P.f, a = DC.state.abs, path = DC.state.path, d = {};
    d.title = path === 'A' ? DC.STUDY.title : DC.state.b.f.title; d.author = DC.state.anon ? '' : DC.state.nick.trim();
    d.question = path === 'A' ? 'Do fewer fruit flies climb above an 8 cm line in 10 seconds at 18 °C than at 25 °C? (simulated)' : DC.state.b.f.question;
    d.background = a.bg; d.methods = a.methods; d.results = a.results; d.conclusions = a.conclusion;
    d.limitations = path === 'A' ? '- Only 10 flies per group, in one vial each\n- The same flies were used in all 5 trials\n- Only two temperatures\n- The data are simulated' : DC.state.b.f.limitations;
    d.refs = path === 'A' ? 'Gargano JW et al. (2005) Experimental Gerontology 40(5):386-395. Nichols CD et al. (2012) J Vis Exp (61):3795. (Climbing assays that inspired this activity.)' : '';
    let n = 0; Object.keys(d).forEach((k) => { if (d[k] && String(d[k]).trim() && !String(f[k]).trim()) { f[k] = String(d[k]).trim(); n++; } });
    P.started = true; DC.save(); DC.refresh(); DC.toast(n ? 'Filled ' + n + ' empty part' + (n > 1 ? 's' : '') + ' from your abstract and project. Edit anything you like.' : 'Nothing new to fill in.');
  };
  DC.acts.postPrint = () => { DC.state.poster.previewed = true; DC.save(); DC.print('<div class="pg">' + DC.posterHTML() + '</div>', 'landscape'); };
  DC.acts.postFull = () => { DC.state.poster.previewed = true; DC.save(); DC.$('#dlg').classList.add('poster-dlg'); DC.dialog('<div class="spread"><h2>Full-size poster preview</h2><button class="btn small" data-close type="button">Close</button></div><div class="posterwrap" tabindex="0" role="region" aria-label="Full-size poster">' + DC.posterHTML() + '</div>', () => DC.$('#dlg').classList.remove('poster-dlg')); };

  const GUIDE = [
    ['Readable typography', ['Use big, plain letters. Body text should be readable from about one arm’s length to a step or two away.', 'Short lines and short sentences are easier than long paragraphs.']],
    ['Visual hierarchy', ['The title should be the biggest thing, then the headings, then the body text.', 'Put the most important result where eyes land first. Use the figure as the star.']],
    ['Accurate figure labels', ['Every figure needs a caption that says what it shows and how many trials or samples it uses.', 'Say if the data are simulated.']],
    ['Clear graph axes', ['Each axis gets a title and a unit.', 'Count data and bars should start at zero.']],
    ['Concise scientific writing', ['One idea per sentence. Use bullets for methods.', 'Say what you saw first. Then say what you think it means, and use careful words such as "suggests".']],
    ['Color contrast', ['Dark text on a light background (or the reverse) is easiest to read.', 'Do not use color alone to tell groups apart. This graph also uses different marker shapes.']],
    ['Avoiding misleading graphs', ['Do not cut off the bottom of a bar chart.', 'Show every data point when you have only a few.', 'Do not make a difference look bigger by stretching the picture.']]
  ];

  DC.register(6, {
    complete: () => DC.posterComplete(),
    gate: () => 'Press "Start my poster", fill the required parts (title, question, methods, results, conclusions, limitations) and fix any problems the checklist flags.',
    render() {
      const s = DC.state;
      if (!s.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      const P = s.poster, f = P.f;
      return '<p class="lead">A <strong>scientific poster</strong> lets people read your research quickly and then talk with you about it. A good poster is mostly a clear question, a clear figure and short words.</p>' +
        '<div class="callout">An automatically arranged poster is a practice tool. It is <strong>not</strong> the same as a professionally reviewed research presentation, and it has not been checked by a scientist.</div>' +
        '<div class="row" style="margin:.6rem 0"><button type="button" class="btn gold" data-act="postStart">Start my poster from my work</button><span class="hint">Fills empty parts from your abstract and project. You can change everything.</span></div>' +
        '<div class="grid2"><div class="card"><h3>Layout</h3><div class="choice">' + LAYOUTS.map((l) => '<label><input type="radio" name="lay" data-bind="poster.layout" value="' + l[0] + '"' + (P.layout === l[0] ? ' checked' : '') + '><span class="face"><b>' + l[1] + '</b><small>' + l[2] + '</small></span></label>').join('') + '</div></div>' +
        '<div class="card"><h3>Colors and size</h3><div class="choice" role="radiogroup" aria-label="Color theme">' + Object.keys(PAL).map((k) => '<label style="flex:1 1 7rem"><input type="radio" name="pal" data-bind="poster.palette" value="' + k + '"' + (P.palette === k ? ' checked' : '') + '><span class="face" style="border-left:12px solid ' + PAL[k].a + '"><b>' + PAL[k].n + '</b></span></label>').join('') + '</div><div class="field" style="margin-top:.6rem"><label for="pscale">Text size: <output id="pscaleOut">' + (parseFloat(P.scale) || 1) + '</output>×</label><input type="range" id="pscale" min="0.85" max="1.25" step="0.05" value="' + (parseFloat(P.scale) || 1) + '" data-bind="poster.scale"></div></div></div>' +
        '<div class="card"><h3>Figure</h3><div class="choice"><label><input type="radio" name="fig" data-bind="poster.fig" value="auto"' + (P.fig === 'auto' ? ' checked' : '') + '><span class="face"><b>Graph from my data</b><small>' + (s.path === 'A' ? 'Built from the trials you recorded.' : 'Built from the data log and chart settings in Chapters 3 and 4.') + '</small></span></label><label><input type="radio" name="fig" data-bind="poster.fig" value="draw"' + (P.fig === 'draw' ? ' checked' : '') + '><span class="face"><b>Space for a drawing or photo</b><small>Leave a frame to fill in by hand.</small></span></label><label><input type="radio" name="fig" data-bind="poster.fig" value="none"' + (P.fig === 'none' ? ' checked' : '') + '><span class="face"><b>No figure</b><small>Words only.</small></span></label></div>' +
        (s.path === 'A' ? '<div class="field" style="margin-top:.6rem"><label for="pfv">Graph type</label><select id="pfv" data-bind="poster.figView" style="max-width:20rem"><option value="dot"' + (P.figView === 'dot' ? ' selected' : '') + '>Dot plot (every trial)</option><option value="bar"' + (P.figView === 'bar' ? ' selected' : '') + '>Bars of averages (start at zero)</option><option value="line"' + (P.figView === 'line' ? ' selected' : '') + '>Trials in order</option></select></div>' : '') +
        '<div class="field" style="margin-top:.6rem"><label for="pcap">Figure caption <span class="hint">(leave empty to use an automatic caption)</span></label><textarea id="pcap" data-bind="poster.figCaption" style="min-height:3.6rem">' + esc(P.figCaption) + '</textarea></div></div>' +
        '<div class="card"><h3>Edit your poster text</h3><div class="grid2">' + FIELDS.map((x) => '<div class="field"><label for="pf-' + x[0] + '">' + x[1] + '</label><span class="hint" id="pfh-' + x[0] + '">' + x[2] + '</span>' + (x[3] === 'text' ? '<input type="text" id="pf-' + x[0] + '" data-bind="poster.f.' + x[0] + '" aria-describedby="pfh-' + x[0] + '" maxlength="120" value="' + esc(f[x[0]]) + '">' : '<textarea id="pf-' + x[0] + '" data-bind="poster.f.' + x[0] + '" aria-describedby="pfh-' + x[0] + '">' + esc(f[x[0]]) + '</textarea>') + '</div>').join('') + '</div></div>' +
        '<h3>Live preview</h3><div id="posterLive"></div><div class="row" style="margin:.6rem 0"><button type="button" class="btn small" data-act="postFull">Full-size preview</button><button type="button" class="btn primary small" data-act="postPrint">Print or save as PDF</button></div><p class="hint">To make a PDF, choose “Save as PDF” as the printer in the print window. Choose landscape and turn on “Background graphics” if your browser offers it.</p>' +
        '<div class="grid2"><div class="card gold"><h3>Poster checklist</h3><div id="posterChecks"></div></div><div class="card"><h3>Poster design guide</h3>' + GUIDE.map((g) => '<details><summary><strong>' + g[0] + '</strong></summary><ul class="clean">' + g[1].map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul></details>').join('') + '</div></div>';
    },
    mount() {
      DC.onBind('poster.', (el) => {
        if (el.dataset.bind === 'poster.f.title' || /^poster\.f\./.test(el.dataset.bind)) DC.state.poster.started = true;
        if (el.dataset.bind === 'poster.scale') { const o = DC.$('#pscaleOut'); if (o) o.textContent = el.value; }
        if (el.dataset.bind === 'poster.fig') { DC.refresh(); return; }
        paint();
      });
      paint(); requestAnimationFrame(() => { const c = DC.$('#posterChecks'); if (c) c.innerHTML = checksHTML(); });
    }
  });
})();
