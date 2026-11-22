import { sexSymbol, traitSwatch, flySVG } from '../phenotype-renderer.js';
import { chiSquareGOF, interpretChiSquare, recombinationEstimate, parseRatio, formatGenotype, plainDescription } from '../engine/index.js';
import { recordsToCSV, download } from '../notebook.js';
import { toFraction, pct, total, pooled, sexMatters } from './util.js';

// Validated with the dataviz palette validator against the panel surface #132c40 (dark).
const OBS = '#2f9fd6', EXP = '#c97d22';
const PRESETS = { 2: ['3:1', '1:1', '2:1'], 3: ['1:2:1', '1:1:1'], 4: ['9:3:3:1', '1:1:1:1'] };

export function renderAnalysis(app, el, params) {
  const s = app.state, mode = app.mode(), esc = app.esc;
  if (!s.records.length) { el.innerHTML = `<div class="empty">No data yet. Run a cross at the Breeding Station first.</div>`; return; }
  const rec = (params.recordId && app.getRecord(params.recordId)) || s.records[s.records.length - 1];
  const split = params.split ?? sexMatters(rec);
  // Classes ordered by expected frequency (largest first) so conventional ratios (3:1, 2:1, 9:3:3:1) read naturally.
  const rows = (split ? rec.classCounts.map(c => ({ ...c, name: `${c.label} ${sexSymbol(c.sex)}` })) : pooled(rec).map(c => ({ ...c, name: c.label })))
    .sort((a, b) => (b.expectedP - a.expectedP) || (a.name < b.name ? -1 : 1));
  const N = total(rec);

  const recSelect = `<label>Dataset <select id="rec">${[...s.records].reverse().map(r => `<option value="${r.id}" ${r.id === rec.id ? 'selected' : ''}>Cross #${r.num}: ${esc(r.motherName)} × ${esc(r.fatherName)} (n=${total(r)})</option>`).join('')}</select></label>`;

  if (mode === 'little') {
    el.innerHTML = `<div class="row">${recSelect}</div><h3>How many of each kind?</h3>${pictoChart(rows, N)}<p class="lead">Which kind of fly was most common? Do the babies look like their parents?</p>`;
    el.querySelector('#rec').onchange = e => app.open('analysis', { recordId: e.target.value });
    return;
  }

  const k = rows.length;
  const presetList = [...(PRESETS[k] || [])];
  const hyp = params.hyp || (presetList[0] || 'model');
  let weights = null, hypError = '';
  if (hyp === 'model') weights = rows.map(r => r.expectedP);
  else { try { weights = parseRatio(hyp); if (weights.length !== k) hypError = `This ratio has ${weights.length} parts but there are ${k} classes.`; } catch (e) { hypError = e.message; } }

  const chi = params.ran && weights && !hypError ? chiSquareGOF(rows.map(r => r.count), weights, { estimatedParams: +(params.est || 0) }) : null;

  el.innerHTML = `
    <div class="row">${recSelect}
      <label class="switch"><input type="checkbox" id="split" ${split ? 'checked' : ''}> Split by sex</label>
      <button class="btn" id="csv">⬇ CSV (this cross)</button><button class="btn" id="csv-all">⬇ CSV (all crosses)</button></div>
    <p class="small muted">Parents: ${app.genoHTML(rec.mother, { hidden: rec.motherHidden })} × ${app.genoHTML(rec.father)} · seed ${rec.seed} · <span class="badge sim">SIMULATED</span></p>
    <div class="cols-2">
      <section class="panel"><h3>Observed vs expected</h3>${barChart(rows, N, esc)}
        <div class="legend"><span><i style="background:${OBS}"></i>Observed</span><span><i style="background:${EXP}"></i>Expected (engine model)</span></div></section>
      <section class="panel"><h3>Counts</h3><table class="data compact"><thead><tr><th>Class</th><th>Observed</th><th>Obs. %</th><th>Expected %</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${traitSwatch(r.traits)} ${esc(r.name)}</td><td class="num">${r.count}</td><td class="num">${pct(r.count / N)}</td><td class="num">${mode === 'junior' ? pct(r.expectedP) : toFraction(r.expectedP)}</td></tr>`).join('')}
        </tbody><tfoot><tr><td>Total</td><td class="num">${N}</td><td></td><td></td></tr></tfoot></table>
        ${mode === 'junior' ? `<p class="small">Observed numbers are rarely exactly equal to expected ones — chance plays a role. Bigger samples usually come closer. Chi-square testing unlocks in Researcher mode.</p>` : ''}</section>
    </div>
    ${mode !== 'junior' ? `<section class="panel chi">
      <h3>Chi-square goodness-of-fit test</h3>
      <form id="chi-form" class="row wrap">
        <label>Hypothesis ${hypSelect(presetList, hyp, k)}</label>
        <label>Custom ratio <input id="custom" class="mono" placeholder="e.g. ${'1:'.repeat(k - 1)}1" value="${presetList.includes(hyp) || hyp === 'model' ? '' : esc(hyp)}" style="width:9em"></label>
        ${mode === 'university' ? `<label>Parameters estimated from data <input id="est" type="number" min="0" max="${Math.max(0, k - 2)}" value="${params.est || 0}" style="width:4em"></label>` : ''}
        <button class="btn primary">Run test</button></form>
      <p class="small">Ratio parts are matched to classes in the order listed: ${rows.map((r, i) => `<b>${i + 1}</b> ${esc(r.name)}`).join(' · ')}</p>
      ${hypError ? `<div class="callout bad" role="alert">${esc(hypError)}</div>` : ''}
      ${chi ? chiTable(rows, chi, esc, mode) : ''}
    </section>` : ''}
    ${mode !== 'junior' ? rfTool(app, rec, params) : ''}
    ${mode === 'university' ? assumptions() : ''}`;

  el.querySelector('#rec').onchange = e => app.open('analysis', { recordId: e.target.value });
  el.querySelector('#split').onchange = e => app.open('analysis', { recordId: rec.id, split: e.target.checked });
  el.querySelector('#csv').onclick = () => download(`drosie-cross-${rec.num}.csv`, recordsToCSV([rec], f => formatGenotype(f)));
  el.querySelector('#csv-all').onclick = () => download('drosie-all-crosses.csv', recordsToCSV(s.records, f => formatGenotype(f)));
  const form = el.querySelector('#chi-form');
  if (form) form.onsubmit = e => {
    e.preventDefault();
    const custom = el.querySelector('#custom').value.trim();
    const h = custom || el.querySelector('#hyp').value;
    const est = el.querySelector('#est')?.value || 0;
    const next = { recordId: rec.id, split, hyp: h, ran: true, est };
    app.open('analysis', next);
    let w; try { w = h === 'model' ? rows.map(r => r.expectedP) : parseRatio(h); } catch { return; }
    if (w.length !== k) return;
    const result = chiSquareGOF(rows.map(r => r.count), w, { estimatedParams: +est });
    app.emit({ type: 'chi', recordId: rec.id, ratio: h.replace(/\s/g, ''), k, result });
    app.sfx('step');
  };
  el.querySelectorAll('[data-rec-class]').forEach(cb => cb.onchange = () => {
    const labels = [...el.querySelectorAll('[data-rec-class]:checked')].map(x => x.value);
    app.open('analysis', { ...params, recordId: rec.id, split, rfLabels: labels });
  });
  const rfb = el.querySelector('#rf-go');
  if (rfb) rfb.onclick = () => { app.emit({ type: 'rf', recordId: rec.id, labels: [...(params.rfLabels || [])] }); app.toast('Recombination estimate recorded.', 'good'); };
}

function hypSelect(presets, hyp, k) {
  return `<select id="hyp">${presets.map(p => `<option ${p === hyp ? 'selected' : ''}>${p}</option>`).join('')}
    <option value="model" ${hyp === 'model' ? 'selected' : ''}>Model prediction (Punnett / engine)</option>
    <option value="${'1:'.repeat(k - 1)}1" ${hyp === '1:'.repeat(k - 1) + '1' && !presets.includes(hyp) ? 'selected' : ''}>Equal (${'1:'.repeat(k - 1)}1)</option></select>`;
}

function chiTable(rows, chi, esc, mode) {
  const fmtP = p => !Number.isFinite(p) ? '—' : p < 0.0001 ? '< 0.0001' : p.toFixed(4);
  return `<table class="data compact"><thead><tr><th>Class</th><th>O</th><th>E</th><th>O − E</th><th>(O − E)² / E</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td>${esc(r.name)}</td><td class="num">${r.count}</td><td class="num">${chi.expectedCounts[i].toFixed(2)}</td><td class="num">${(r.count - chi.expectedCounts[i]).toFixed(2)}</td><td class="num">${(chi.contributions[i] ?? 0).toFixed(3)}</td></tr>`).join('')}
    </tbody><tfoot><tr><td colspan="4">χ² (sum)</td><td class="num"><b>${Number.isFinite(chi.chi2) ? chi.chi2.toFixed(3) : '∞'}</b></td></tr></tfoot></table>
    <dl class="meta wide"><dt>Degrees of freedom</dt><dd>${chi.df} ${mode === 'university' ? '= classes − 1 − estimated parameters' : '= classes − 1'}</dd>
      <dt>p-value</dt><dd><b>${fmtP(chi.p)}</b></dd>${chi.critical ? `<dt>Critical value (α = 0.05)</dt><dd>${chi.critical.toFixed(3)}</dd>` : ''}</dl>
    ${chi.warnings.map(w => `<div class="callout warn">${esc(w)}</div>`).join('')}
    <div class="callout ${chi.reject ? 'bad' : 'good'}">${esc(interpretChiSquare(chi))}</div>
    ${mode === 'university' ? `<p class="small">The p-value is P(χ² ≥ observed | H₀) from the χ² distribution with ${chi.df} df — a large-sample approximation to the multinomial. Testing a model against data simulated from that same model rejects about 5% of the time at α = 0.05 (verified in the test suite).</p>` : ''}`;
}

function rfTool(app, rec, params) {
  const p = pooled(rec); const N = total(rec);
  const sel = params.rfLabels || [];
  const recN = p.filter(c => sel.includes(c.label)).reduce((s, c) => s + c.count, 0);
  const est = sel.length ? recombinationEstimate(recN, N) : null;
  return `<details class="panel" ${sel.length ? 'open' : ''}><summary>Recombination frequency calculator (testcrosses)</summary>
    <p class="small">In a testcross of a double-heterozygous <b>female</b>, tick the <b>recombinant</b> (non-parental) phenotype classes. RF = recombinants ÷ total.</p>
    <div class="row wrap">${p.map(c => `<label class="chk"><input type="checkbox" data-rec-class value="${app.esc(c.label)}" ${sel.includes(c.label) ? 'checked' : ''}> ${app.esc(c.label)} (${c.count})</label>`).join('')}</div>
    ${est ? `<p>RF = ${recN} / ${N} = <b>${(est.r * 100).toFixed(2)}%</b> ± ${(est.se * 100).toFixed(2)}% (SE); 95% CI ${(est.ci95[0] * 100).toFixed(1)}–${(est.ci95[1] * 100).toFixed(1)}%. ${est.r > 0.5 ? '<b>RF > 50%: you may have ticked the parental classes.</b>' : ''}</p>
      <p class="small">Map distance ≈ RF × 100 cM only for short intervals; for longer ones, multiple crossovers make RF underestimate map distance (mapping functions correct for this).</p>
      <button class="btn primary" id="rf-go">Record this estimate</button>` : ''}</details>`;
}

function assumptions() {
  return `<details class="panel"><summary>Model assumptions behind the expected values</summary><ul class="small">
    <li>Mendelian segregation; fair meiosis (no meiotic drive); all gametes equally fertile.</li>
    <li>No meiotic crossing over in males; female recombination from classical map distances via the selected mapping function, independent across intervals (no interference).</li>
    <li>Recessive lethals are fully lethal; all other genotypes have equal viability (in real vials, vg and e mutants are often somewhat less viable than wild type, which shifts ratios).</li>
    <li>Phenotypes are fully penetrant and scored without error (real Curly expressivity varies with temperature; black is hard to score in newly eclosed flies).</li>
    <li>XX females and XY males only; nondisjunction (XXY, XO) is not modeled.</li>
    <li>Balancer: recovery of crossover chromosomes is completely suppressed (a simplification).</li></ul></details>`;
}

function barChart(rows, N, esc) {
  const W = 560, H = 260, padL = 44, padB = 70, padT = 14;
  const maxP = Math.max(...rows.map(r => Math.max(r.count / N, r.expectedP)), 0.01);
  const top = Math.ceil(maxP * 10) / 10 || 0.1;
  const gw = (W - padL - 10) / rows.length, bw = Math.min(28, (gw - 14) / 2);
  const y = p => padT + (H - padT - padB) * (1 - p / top);
  const ticks = [0, top / 2, top];
  const bar = (x, p, color, label) => {
    const h = Math.max(0, y(0) - y(p)); const r = Math.min(4, h);
    return `<path d="M${x} ${y(0)} V${y(p) + r} Q${x} ${y(p)} ${x + r} ${y(p)} H${x + bw - r} Q${x + bw} ${y(p)} ${x + bw} ${y(p) + r} V${y(0)} Z" fill="${color}"><title>${esc(label)}</title></path>`;
  };
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of observed and expected proportions per phenotype class">
    ${ticks.map(t => `<line x1="${padL}" x2="${W - 6}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${padL - 6}" y="${y(t) + 4}" class="axis" text-anchor="end">${Math.round(t * 100)}%</text>`).join('')}
    ${rows.map((r, i) => { const x0 = padL + i * gw + (gw - 2 * bw - 2) / 2; const op = r.count / N;
      return `<g class="bar-g">${bar(x0, op, OBS, `${r.name}: observed ${r.count} (${(op * 100).toFixed(1)}%)`)}${bar(x0 + bw + 2, r.expectedP, EXP, `${r.name}: expected ${(r.expectedP * 100).toFixed(1)}% (${(r.expectedP * N).toFixed(1)} flies)`)}
        <foreignObject x="${padL + i * gw}" y="${H - padB + 6}" width="${gw}" height="${padB - 6}"><div class="xlab" xmlns="http://www.w3.org/1999/xhtml">${esc(r.name)}</div></foreignObject></g>`; }).join('')}
    <line x1="${padL}" x2="${W - 6}" y1="${y(0)}" y2="${y(0)}" class="baseline"/></svg>`;
}

function pictoChart(rows, N) {
  return `<div class="picto-chart">${rows.map(r => `<div class="picto-row">${flySVG(r.traits, { size: 60 })}<div class="picto-bar"><span style="width:${(r.count / N) * 100}%"></span></div><b>${r.count}</b><span class="small">${plainDescription({ traits: r.traits })}</span></div>`).join('')}</div>`;
}
