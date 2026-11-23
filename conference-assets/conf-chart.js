/* Drosie's First Scientific Conference · honest SVG charts (dot plot, bar of means, line by order). */
(function () {
  'use strict';
  const DC = (window.DC = window.DC || {});
  const esc = DC.esc;
  const SHAPES = ['circle', 'square', 'triangle', 'diamond'];

  const niceStep = (max) => { const raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };

  function marker(shape, x, y, r, fill, extra, onBar) {
    const a = onBar ? 'fill="#fff" stroke="' + fill + '" stroke-width="3" ' + extra : 'fill="' + fill + '" stroke="#fff" stroke-width="2" ' + extra;
    if (shape === 'square') return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" ' + a + '/>';
    if (shape === 'triangle') return '<path d="M' + x + ' ' + (y - r - 1) + 'L' + (x + r + 1) + ' ' + (y + r) + 'L' + (x - r - 1) + ' ' + (y + r) + 'Z" ' + a + '/>';
    if (shape === 'diamond') return '<path d="M' + x + ' ' + (y - r - 2) + 'L' + (x + r + 2) + ' ' + y + 'L' + x + ' ' + (y + r + 2) + 'L' + (x - r - 2) + ' ' + y + 'Z" ' + a + '/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + a + '/>';
  }

  /* cfg: {kind:'dot'|'bar'|'line', groups:[{key,label,color,values:[n], labels?:[s]}], yTitle, xTitle, yMin, yMax, title, interactive, showMean, showPoints, showRange, unit, id, catLabels} */
  DC.chart = function (cfg) {
    const NA = !cfg.w && window.innerWidth < 560, W = cfg.w || (NA ? 400 : 640), H = cfg.h || (NA ? 360 : 400), m = { l: NA ? 64 : 74, r: NA ? 38 : 20, t: cfg.title ? (NA ? 40 : 44) : 14, b: NA ? 84 : 78 }, F = NA ? 1.2 : 1, hw = NA ? 30 : 54;
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const kind = cfg.kind || 'dot';
    const all = cfg.groups.reduce((a, g) => a.concat(g.values.filter((v) => typeof v === 'number')), []);
    const yMin = cfg.yMin != null ? cfg.yMin : Math.min(0, ...(all.length ? all : [0]));
    let yMax = cfg.yMax != null ? cfg.yMax : Math.max(1, ...(all.length ? all : [1]));
    if (cfg.yMax == null) yMax = yMax + niceStep(yMax - yMin) * 0.2;
    const step = cfg.step || niceStep(yMax - yMin);
    const top = Math.ceil(yMax / step) * step;
    const Y = (v) => m.t + ph - ((v - yMin) / (top - yMin)) * ph;
    const n = cfg.groups.length;
    const inter = cfg.interactive;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" font-family="Verdana,Arial,sans-serif" role="img" aria-labelledby="' + (cfg.id || 'c') + '-t ' + (cfg.id || 'c') + '-d"><title id="' + (cfg.id || 'c') + '-t">' + esc(cfg.title || 'Chart') + '</title><desc id="' + (cfg.id || 'c') + '-d">' + esc((cfg.desc || '') + ' Values: ' + cfg.groups.map((g) => g.label + ': ' + g.values.filter((v) => typeof v === 'number').join(', ')).join('; ') + '.') + '</desc><rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    if (cfg.title) s += '<text x="' + W / 2 + '" y="24" text-anchor="middle" font-size="' + (16 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">' + esc(cfg.title) + '</text>';
    /* gridlines + y ticks */
    for (let v = Math.ceil(yMin / step) * step; v <= top + 1e-9; v += step) {
      const y = Y(v); s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" stroke="#e3e0d0"/><text x="' + (m.l - 8) + '" y="' + (y + 5) + '" text-anchor="end" font-size="' + (13 * F).toFixed(1) + '" fill="#1c2b28">' + DC.fmt(v, 2) + '</text>';
    }
    s += '<line x1="' + m.l + '" x2="' + m.l + '" y1="' + m.t + '" y2="' + (m.t + ph) + '" stroke="#1c2b28" stroke-width="2"/><line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ph) + '" y2="' + (m.t + ph) + '" stroke="#1c2b28" stroke-width="2"/>';
    if (yMin > 0) s += '<text x="' + (m.l + 6) + '" y="' + (m.t + ph + 16) + '" font-size="' + (12 * F).toFixed(1) + '" fill="#9a3f35" font-weight="700">≈ axis starts at ' + DC.fmt(yMin, 2) + '</text>';
    s += '<text transform="translate(18 ' + (m.t + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="' + (13 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">' + esc(cfg.yTitle || '') + '</text>';
    s += '<text x="' + (m.l + pw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="' + (13 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">' + esc(cfg.xTitle || '') + '</text>';

    if (kind === 'line') {
      const maxN = Math.max(1, ...cfg.groups.map((g) => g.values.length));
      const X = (i) => m.l + (maxN === 1 ? pw / 2 : 30 + (i * (pw - 60)) / (maxN - 1));
      for (let i = 0; i < maxN; i++) s += '<text x="' + X(i) + '" y="' + (m.t + ph + 20) + '" text-anchor="middle" font-size="' + (13 * F).toFixed(1) + '" fill="#1c2b28">' + esc((cfg.catLabels && cfg.catLabels[i]) || i + 1) + '</text>';
      cfg.groups.forEach((g, gi) => {
        const pts = g.values.map((v, i) => (typeof v === 'number' ? [X(i), Y(v), v, i] : null)).filter(Boolean);
        if (pts.length > 1) s += '<polyline fill="none" stroke="' + g.color + '" stroke-width="3" points="' + pts.map((p) => p[0] + ',' + p[1]).join(' ') + '"/>';
        pts.forEach((p) => { s += marker(SHAPES[gi % 4], p[0], p[1], 7, g.color, ptAttrs(g, p[3], p[2], inter, cfg)); });
      });
    } else {
      const slot = pw / n;
      cfg.groups.forEach((g, gi) => {
        const cx = m.l + slot * (gi + 0.5);
        const vals = g.values.filter((v) => typeof v === 'number');
        const st = DC.stats(vals);
        s += '<text x="' + cx + '" y="' + (m.t + ph + 22) + '" text-anchor="middle" font-size="' + (14 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">' + esc(g.label) + '</text>';
        if (!st) return;
        if (kind === 'bar') {
          const y = Y(st.mean), bw = Math.min(110, slot * 0.5);
          s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + (m.t + ph - y) + '" fill="' + g.color + '" fill-opacity=".85" stroke="#1c2b28" stroke-width="1.5"/>';
          s += '<text x="' + cx + '" y="' + (y - 8) + '" text-anchor="middle" font-size="' + (14 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">mean ' + DC.fmt(st.mean, 2) + '</text>';
        }
        if (cfg.showRange && st) s += '<line x1="' + (cx + 62) + '" x2="' + (cx + 62) + '" y1="' + Y(st.min) + '" y2="' + Y(st.max) + '" stroke="#1c2b28" stroke-width="3"/><line x1="' + (cx + 56) + '" x2="' + (cx + 68) + '" y1="' + Y(st.min) + '" y2="' + Y(st.min) + '" stroke="#1c2b28" stroke-width="3"/><line x1="' + (cx + 56) + '" x2="' + (cx + 68) + '" y1="' + Y(st.max) + '" y2="' + Y(st.max) + '" stroke="#1c2b28" stroke-width="3"/>';
        if (kind === 'dot' && cfg.showMean !== false) {
          s += '<line x1="' + (cx - hw) + '" x2="' + (cx + hw) + '" y1="' + Y(st.mean) + '" y2="' + Y(st.mean) + '" stroke="#1c2b28" stroke-width="3" stroke-dasharray="7 4"/><text x="' + (cx + hw + 4) + '" y="' + (Y(st.mean) - 6) + '" font-size="' + (12 * F).toFixed(1) + '" font-weight="700" fill="#1c2b28">mean ' + DC.fmt(st.mean, 2) + '</text>';
        }
        if (cfg.showPoints !== false) {
          g.values.forEach((v, i) => {
            if (typeof v !== 'number') return;
            const dx = (i - (g.values.length - 1) / 2) * 17;
            s += marker(SHAPES[gi % 4], cx + dx, Y(v), 7, g.color, ptAttrs(g, i, v, inter, cfg), kind === 'bar');
          });
        }
      });
    }
    return s + '</svg>';
  };

  function ptAttrs(g, i, v, inter, cfg) {
    const lab = (g.labels && g.labels[i]) || 'point ' + (i + 1);
    const txt = g.label + ', ' + lab + ': ' + DC.fmt(v, 2) + (cfg.unit ? ' ' + cfg.unit : '');
    return inter ? 'class="chart-pt" tabindex="0" role="img" data-tip="' + esc(txt) + '" aria-label="' + esc(txt) + '"' : 'data-tip="' + esc(txt) + '"';
  }

  /* wire pointer/keyboard readout */
  DC.chart.attach = (box, readout) => {
    const show = (e) => { const p = e.target.closest('.chart-pt'); if (p) { readout.textContent = p.dataset.tip; } };
    box.addEventListener('focusin', show); box.addEventListener('mouseover', show); box.addEventListener('click', show);
  };

  /* data table companion (text alternative for every chart) */
  DC.chartTable = (cfg) => {
    const maxN = Math.max(...cfg.groups.map((g) => g.values.length));
    let h = '<div class="tblwrap"><table class="tbl"><caption>Chart data</caption><thead><tr><th scope="col">' + esc(cfg.rowLabel || 'Point') + '</th>' + cfg.groups.map((g) => '<th scope="col">' + esc(g.label) + '</th>').join('') + '</tr></thead><tbody>';
    for (let i = 0; i < maxN; i++) h += '<tr><th scope="row">' + esc((cfg.catLabels && cfg.catLabels[i]) || i + 1) + '</th>' + cfg.groups.map((g) => '<td>' + (typeof g.values[i] === 'number' ? DC.fmt(g.values[i], 2) : '–') + '</td>').join('') + '</tr>';
    return h + '</tbody></table></div>';
  };

  /* Standard chart for the guided dataset, built from what the learner recorded */
  DC.guidedChart = (opts) => {
    opts = opts || {};
    const groups = DC.DATA.conditions.map((c) => ({ key: c.id, label: c.short + (c.role === 'control' ? ' (control)' : ''), color: c.color, values: DC.state.a.rec[c.id].slice(), labels: [1, 2, 3, 4, 5].map((i) => 'trial ' + i) }));
    return Object.assign({
      kind: 'dot', groups, yMin: 0, yMax: 10, step: 2, yTitle: window.innerWidth < 560 ? 'Flies above line (of 10)' : 'Flies above the 8 cm line (out of 10)', xTitle: 'Test temperature (5 trials each)',
      title: 'Climbing in 10 seconds (simulated data)', unit: 'flies', desc: 'Each marker is one trial. Control 25 °C and cooler 18 °C groups, 10 flies each.', id: opts.id || 'g'
    }, opts);
  };
})();
