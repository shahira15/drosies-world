import { LOCI, CHROMOSOMES, BALANCERS, lociOn, meioticRule, intervalRFs, mulberry32, randomSeed, MODELED_CHROMOSOMES } from '../engine/index.js';

const COLORS = { X: '#ff8a7a', '2': '#7ad7ff', '3': '#a6f08a', '4': '#ffd36e', Y: '#c9a6ff' };

export function renderChromosomes(app, el, params) {
  const s = app.state, mode = app.mode(), esc = app.esc;
  if (mode === 'little') {
    el.innerHTML = `<div class="locked"><h3>The Chromosome Explorer opens in Junior Geneticist mode.</h3><p>Chromosomes are like instruction books inside every cell. A fly has 4 pairs!</p></div>`;
    return;
  }
  const view = params.view || 'genetic';
  const gene = params.gene && LOCI[params.gene];
  const W = 980;

  // ---------- Karyotype map ----------
  const rows = [];
  const geneticRow = (cid, y) => {
    const C = CHROMOSOMES[cid];
    const len = Math.max(C.mapLength, 6), scale = (W - 230) / 110;
    const x0 = 190, w = len * scale;
    const loci = lociOn(cid);
    const cen = C.centromereCM != null ? x0 + C.centromereCM * scale : cid === 'X' ? x0 + w : null;
    return `<g><text x="20" y="${y + 6}" class="c-name">${esc(C.label)}</text>
      <rect x="${x0}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${COLORS[cid]}" opacity=".9"/>
      ${cen ? `<circle cx="${cen}" cy="${y}" r="7" fill="#0d1f2e" stroke="#fff" stroke-width="1.5"><title>centromere (approximate)</title></circle>` : ''}
      ${[0, 25, 50, 75, 100].filter(v => v <= len).map(v => `<line x1="${x0 + v * scale}" x2="${x0 + v * scale}" y1="${y + 14}" y2="${y + 20}" stroke="#9fb3c8"/><text x="${x0 + v * scale}" y="${y + 32}" class="tick">${v}</text>`).join('')}
      ${loci.map((L, i) => `<g class="gene-mark ${gene && gene.symbol === L.symbol ? 'sel' : ''}" data-gene="${esc(L.symbol)}" tabindex="0" role="button" aria-label="${esc(L.name)} at ${L.chromosome}-${L.mapPosition}">
        <line x1="${x0 + L.mapPosition * scale}" x2="${x0 + L.mapPosition * scale}" y1="${y - 16}" y2="${y + 16}" stroke="#0d1f2e" stroke-width="3"/>
        <text x="${x0 + L.mapPosition * scale}" y="${y - 22 - (i % 2) * 14}" class="gene-label">${esc(L.symbol)}${L.illustrative ? '*' : ''} <tspan class="muted">${L.mapPosition}</tspan></text></g>`).join('')}</g>`;
  };
  const physicalRow = (cid, y) => {
    const C = CHROMOSOMES[cid];
    const arms = C.physicalMb || {};
    const scale = (W - 230) / 62, x0 = 190;
    let x = x0; const parts = [];
    for (const arm of C.arms) {
      const mb = arms[arm]; if (!mb) continue;
      parts.push(`<rect x="${x}" y="${y - 12}" width="${mb * scale}" height="24" rx="12" fill="${COLORS[cid]}" opacity=".9"/><text x="${x + mb * scale / 2}" y="${y + 34}" class="tick">${arm} ≈ ${mb} Mb</text>`);
      x += mb * scale + 4;
    }
    const marks = lociOn(cid).map((L, i) => `<text x="${x0 + 10}" y="${y - 20 - i * 14}" class="gene-label small" data-gene="${esc(L.symbol)}">${esc(L.symbol)}: ${esc(L.physical || 'not shown (coordinate not verified here)')}</text>`).join('');
    return `<g><text x="20" y="${y + 6}" class="c-name">${esc(C.label)}</text>${parts.join('')}${marks}</g>`;
  };
  const order = ['X', '2', '3', '4'];
  let y = 80;
  for (const c of order) { rows.push(view === 'genetic' ? geneticRow(c, y) : physicalRow(c, y)); y += view === 'genetic' ? 100 : 110; }
  rows.push(`<g><text x="20" y="${y + 6}" class="c-name">Y chromosome</text><rect x="190" y="${y - 12}" width="60" height="24" rx="12" fill="${COLORS.Y}"/><text x="270" y="${y + 5}" class="small-t">Needed for male fertility; does not determine sex in Drosophila. No modeled loci.</text></g>`);
  const svgH = y + 40;

  const info = gene ? geneInfo(app, gene) : `<p class="small">Select a gene on the map for details.</p>`;

  // ---------- Parents' homologs ----------
  const parents = ['mother', 'father'].map(role => {
    const p = s[role]; if (!p) return `<div class="empty">No ${role} selected.</div>`;
    if (p.hidden) return `<div class="callout warn">The mystery female's chromosomes are hidden.</div>`;
    return homologPanel(app, p, role, params);
  }).join('');

  el.innerHTML = `
    <div class="row"><div class="seg" role="radiogroup" aria-label="Map type">
      <button role="radio" aria-checked="${view === 'genetic'}" class="${view === 'genetic' ? 'on' : ''}" data-view="genetic">Genetic map (cM)</button>
      ${mode !== 'junior' ? `<button role="radio" aria-checked="${view === 'physical'}" class="${view === 'physical' ? 'on' : ''}" data-view="physical">Physical map (Mb, Release 6)</button>` : ''}
    </div></div>
    <div class="cols-2">
      <figure class="panel karyo"><svg viewBox="0 0 ${W} ${svgH}" role="img" aria-label="Drosophila melanogaster chromosomes with modeled genes">${rows.join('')}</svg>
        <figcaption class="small">${view === 'genetic'
          ? 'Genetic (recombination) map positions in centimorgans from classical maps (Lindsley & Grell 1972; FlyBase). Map positions are measured within each chromosome, from 0 at the left tip. * = fictional teaching locus at an illustrative position. Centromere positions are approximate.'
          : 'Physical lengths of chromosome arms are approximate (Release 6 assembly). Gene coordinates are shown only where verified against FlyBase/NCBI; physical and genetic distances are not proportional — recombination rate varies along chromosomes and is suppressed near centromeres.'}</figcaption></figure>
      <aside class="panel gene-info">${info}</aside>
    </div>
    <h3>Parents' homologous chromosomes</h3>
    <div class="cols">${parents}</div>
    <div id="meiosis-out" aria-live="polite">${params.meiosis ? params.meiosisHTML || '' : ''}</div>`;

  el.querySelectorAll('[data-view]').forEach(b => b.onclick = () => app.open('chromosomes', { view: b.dataset.view, gene: params.gene }));
  el.querySelectorAll('[data-gene]').forEach(g => {
    const go = () => app.open('chromosomes', { view, gene: g.dataset.gene });
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
  el.querySelectorAll('[data-meiosis]').forEach(b => b.onclick = () => {
    const role = b.dataset.meiosis; const p = s[role];
    const html = meiosis(app, p.fly, role);
    el.querySelector('#meiosis-out').innerHTML = html;
    app.sfx('step');
    app.emit({ type: 'meiosis', role, balancer: p.fly.chromosomes['2'].some(h => h.balancer) });
  });
}

function geneInfo(app, L) {
  const esc = app.esc;
  const muts = Object.values(L.alleles).filter(a => !a.wild);
  return `<h3><i>${esc(L.symbol)}</i> — ${esc(L.name)}</h3>
    ${L.illustrative ? '<div class="callout warn">Fictional teaching locus. Position is illustrative only.</div>' : ''}
    <dl class="meta">
      <dt>Current gene symbol</dt><dd><i>${esc(L.currentGeneSymbol || '—')}</i></dd>
      <dt>FlyBase gene</dt><dd>${L.fbgn ? `<a href="https://flybase.org/reports/${L.fbgn}" target="_blank" rel="noopener">${L.fbgn}</a>` : '—'}</dd>
      <dt>Chromosome arm</dt><dd>${esc(L.arm)}</dd><dt>Genetic map</dt><dd>${L.chromosome}-${L.mapPosition}</dd>
      <dt>Cytology</dt><dd>${esc(L.cytology || '—')}</dd><dt>Physical</dt><dd>${esc(L.physical || 'not shown')}</dd>
      <dt>Wild-type phenotype</dt><dd>${esc(L.wildPhenotype)}</dd></dl>
    ${muts.map(a => `<h4>Allele ${a.display.replace(/\[(.+)\]/, '<sup>$1</sup>')}${a.currentSymbol ? ` (${a.currentSymbol.replace(/\[(.+)\]/, '<sup>$1</sup>')})` : ''}</h4>
      <dl class="meta"><dt>Dominance</dt><dd>${a.dominance}</dd><dt>Phenotype</dt><dd>${esc(a.phenotype)}</dd><dt>Viability</dt><dd>${a.viability === 'recessive-lethal' ? 'homozygous lethal' : 'viable'}</dd>
      <dt>FlyBase allele</dt><dd>${a.fbal ? `<a href="https://flybase.org/reports/${a.fbal}" target="_blank" rel="noopener">${a.fbal}</a>` : '—'}</dd></dl><p class="small">${esc(a.notes)}</p>`).join('')}`;
}

function homologBar(app, h, chrom, w = 300) {
  if (h.kind === 'Y') return `<div class="hbar y"><span>Y</span></div>`;
  const loci = lociOn(chrom); const len = Math.max(...loci.map(l => l.mapPosition), 10) + 8;
  return `<div class="hbar ${h.balancer ? 'bal' : ''}" style="--c:${COLORS[chrom]}">${h.balancer ? `<span class="bal-name">${h.balancer}</span>` : ''}
    ${loci.map(L => { const a = L.alleles[h.alleles[L.symbol]]; return `<span class="allele ${a.wild ? 'wt' : 'mut'}" style="left:${(L.mapPosition / len) * 100}%" title="${L.symbol}: ${a.wild ? '+' : a.display}">${a.wild ? '+' : app.esc(a.display.replace(/\[.*\]/, ''))}</span>`; }).join('')}</div>`;
  void w;
}

function homologPanel(app, p, role, params) {
  const fly = p.fly;
  return `<div class="panel homologs"><h4>${role === 'mother' ? '♀ Mother' : '♂ Father'}: ${app.esc(p.name)}</h4>
    ${MODELED_CHROMOSOMES.map(c => `<div class="hpair"><span class="hlabel">${c === 'X' ? (fly.sex === 'F' ? 'X / X' : 'X / Y') : 'Chr ' + c}</span><div>${fly.chromosomes[c].map(h => homologBar(app, h, c)).join('')}</div></div>`).join('')}
    <p class="small">${app.esc(meioticRule(fly, '2').reason)}</p>
    <button class="btn primary" data-meiosis="${role}">Run one meiosis → one ${role === 'mother' ? 'egg' : 'sperm'}</button></div>`;
  void params;
}

/** Simulate a single meiosis for display, sampling crossovers per interval (females only). */
function meiosis(app, fly, role) {
  const rng = mulberry32(randomSeed());
  const out = [];
  for (const c of MODELED_CHROMOSOMES) {
    const [h1, h2] = fly.chromosomes[c];
    const rule = meioticRule(fly, c);
    let start = rng() < 0.5 ? 0 : 1;
    const srcHap = start ? h2 : h1;
    if (srcHap.kind === 'Y' || h1.kind === 'Y' || h2.kind === 'Y') { out.push({ c, html: homologBar(app, srcHap, c), note: srcHap.kind === 'Y' ? 'received the Y' : 'received the X' }); continue; }
    const loci = lociOn(c).map(l => l.symbol);
    const xo = rule.crossingOver ? intervalRFs(c, app.state.engine).map((r, i) => (rng() < r ? i : -1)).filter(i => i >= 0) : [];
    let src = start; const alleles = {};
    loci.forEach((l, i) => { if (i > 0 && xo.includes(i - 1)) src = 1 - src; alleles[l] = (src ? h2 : h1).alleles[l]; });
    const hap = { kind: h1.kind, chrom: c, alleles, balancer: xo.length ? null : srcHap.balancer };
    const note = !rule.crossingOver ? rule.reason : xo.length ? `${xo.length} crossover${xo.length > 1 ? 's' : ''} between ${xo.map(i => `${loci[i]}–${loci[i + 1]}`).join(', ')}` : 'no crossover in the modeled region this time';
    out.push({ c, html: homologBar(app, hap, c), note, xo: xo.length });
  }
  return `<section class="panel meiosis"><h3>One ${role === 'mother' ? 'egg' : 'sperm'} from the ${role}</h3>
    ${out.map(o => `<div class="hpair"><span class="hlabel">${o.c === 'X' ? 'X/Y' : 'Chr ' + o.c}</span><div>${o.html}<p class="small ${o.xo ? 'xo' : ''}">${o.xo ? '✕ ' : ''}${app.esc(o.note)}</p></div></div>`).join('')}
    <p class="small muted">Each run samples a new random meiosis. Crossovers are drawn interval by interval from the recombination fractions implied by map distances${role === 'father' ? ' — but males never cross over' : ''}.</p></section>`;
}

void BALANCERS;
