import { flySVG, describe, sexSymbol } from '../phenotype-renderer.js';
import { parseGenotype, phenotypeOf, plainDescription, LOCI, BALANCERS } from '../engine/index.js';

export function renderStocks(app, el, params) {
  const mode = app.mode();
  const tab = params.tab || 'stocks';
  const sexSel = app.state.viewMode.stockSex || {};
  const defs = app.STOCK_DEFS.filter(d => d.modes.includes(mode));
  const esc = app.esc;

  const card = (d) => {
    const sex = sexSel[d.id] || (d.female ? 'F' : 'M');
    const fly = app.stockFly(d.id, sex);
    const ph = phenotypeOf(fly);
    const name = mode === 'little' && d.kidName ? d.kidName : d.name;
    const stars = '★'.repeat(d.difficulty) + '☆'.repeat(5 - d.difficulty);
    return `<article class="stock-card" data-id="${d.id}">
      <div class="stock-art" data-inspect="${d.id}" title="Inspect">${flySVG(ph.traits, { size: 130, title: describe(ph.traits) })}</div>
      <div class="stock-info">
        <h3>${esc(name)}</h3>
        ${mode !== 'little' ? `<div class="geno-line">${app.genoHTML(fly, { hidden: d.hidden })}</div>` : ''}
        <p class="phen">${esc(mode === 'little' ? plainDescription(ph) : ph.label)}</p>
        <div class="sex-toggle" role="group" aria-label="Sex">
          ${d.female ? `<button class="${sex === 'F' ? 'on' : ''}" data-sex="F" aria-pressed="${sex === 'F'}">♀ Female</button>` : ''}
          ${d.male ? `<button class="${sex === 'M' ? 'on' : ''}" data-sex="M" aria-pressed="${sex === 'M'}">♂ Male</button>` : ''}
        </div>
        ${mode !== 'little' ? `<dl class="meta"><dt>Chromosome</dt><dd>${esc(d.chromosome)}</dd><dt>Difficulty</dt><dd aria-label="${d.difficulty} of 5">${stars}</dd></dl>` : ''}
        ${mode !== 'little' ? `<details><summary>Scientific notes</summary><p>${esc(d.notes)}</p>${mode === 'university' ? alleleRefs(fly, d) : ''}</details>` : ''}
        <div class="row">
          <button class="btn primary" data-use>${sex === 'F' ? 'Use as mother ♀' : 'Use as father ♂'}</button>
          <button class="btn" data-inspect="${d.id}">Inspect</button>
          <label class="cmp"><input type="checkbox" data-compare ${app.state.viewMode.compare?.includes(d.id + sex) ? 'checked' : ''}> Compare</label>
        </div>
      </div>
    </article>`;
  };

  const kept = app.state.collected;
  const keptCards = kept.length ? kept.map(k => {
    const ph = phenotypeOf(k.fly);
    return `<article class="stock-card kept" data-kept="${k.id}">
      <div class="stock-art">${flySVG(ph.traits, { size: 110 })}</div>
      <div class="stock-info"><h3>${esc(k.name)}</h3>
        <p class="phen">${esc(mode === 'little' ? plainDescription(ph) : ph.label)} · ${sexSymbol(k.fly.sex)}</p>
        ${k.possible && mode !== 'little' ? `<p class="small">Genotype is not visible. ${k.possible.length === 1 ? 'Only one genotype is possible: ' + app.genoHTML(k.fly) : 'Possible genotypes: ' + k.possible.map(p => `${p.html} <span class="muted">(${(p.p * 100).toFixed(0)}%)</span>`).join(', ')}</p>` : ''}
        <div class="row"><button class="btn primary" data-use-kept>${k.fly.sex === 'F' ? 'Use as mother ♀' : 'Use as father ♂'}</button><button class="btn" data-del-kept>Discard</button></div>
      </div></article>`;
  }).join('') : `<p class="empty">No kept flies yet. After a cross, use <b>Keep flies</b> at the Breeding Station to save offspring for the next generation.</p>`;

  el.innerHTML = `
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected="${tab === 'stocks'}" data-tab="stocks">Stock collection (${defs.length})</button>
      <button role="tab" aria-selected="${tab === 'kept'}" data-tab="kept">Your kept flies (${kept.length})</button>
      ${mode === 'university' ? `<button role="tab" aria-selected="${tab === 'custom'}" data-tab="custom">Build a genotype</button>` : ''}
    </div>
    ${parentTray(app)}
    ${tab === 'stocks' ? `<div class="stock-grid">${defs.map(card).join('')}</div>` : ''}
    ${tab === 'kept' ? `<div class="stock-grid">${keptCards}</div>` : ''}
    ${tab === 'custom' ? customBuilder(app) : ''}`;

  el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => app.open('stocks', { tab: b.dataset.tab }));
  el.querySelectorAll('.stock-card[data-id]').forEach(c => {
    const d = app.STOCK_DEFS.find(x => x.id === c.dataset.id);
    c.querySelectorAll('[data-sex]').forEach(b => b.onclick = () => { (app.state.viewMode.stockSex ||= {})[d.id] = b.dataset.sex; app.save(); app.rerender(); });
    c.querySelector('[data-use]').onclick = () => {
      const sex = sexSel[d.id] || (d.female ? 'F' : 'M');
      const fly = app.stockFly(d.id, sex);
      const nm = mode === 'little' && d.kidName ? d.kidName : d.name;
      app.setParent(sex === 'F' ? 'mother' : 'father', { fly, name: nm, stockId: d.id, origin: 'stock', hidden: !!d.hidden });
      app.rerender();
    };
    c.querySelector('[data-compare]').onchange = e => {
      const sex = sexSel[d.id] || (d.female ? 'F' : 'M');
      const list = (app.state.viewMode.compare ||= []);
      const k = d.id + sex;
      if (e.target.checked) { list.push(k); if (list.length > 2) list.shift(); } else list.splice(list.indexOf(k), 1);
      app.save();
      if (list.length === 2) viewer(app, list.map(x => ({ id: x.slice(0, -1), sex: x.slice(-1) })));
      else app.rerender();
    };
  });
  el.querySelectorAll('[data-inspect]').forEach(b => b.onclick = () => {
    const id = b.dataset.inspect; const d = app.STOCK_DEFS.find(x => x.id === id);
    viewer(app, [{ id, sex: sexSel[id] || (d.female ? 'F' : 'M') }]);
  });
  el.querySelectorAll('[data-kept]').forEach(c => {
    const k = kept.find(x => x.id === c.dataset.kept);
    c.querySelector('[data-use-kept]').onclick = () => { app.setParent(k.fly.sex === 'F' ? 'mother' : 'father', { fly: k.fly, name: k.name, origin: 'kept' }); app.rerender(); };
    c.querySelector('[data-del-kept]').onclick = () => { app.state.collected = kept.filter(x => x !== k); app.save(); app.rerender(); };
  });
  bindTray(app, el);
  const cb = el.querySelector('#custom-form');
  if (cb) cb.onsubmit = e => {
    e.preventDefault();
    const txt = cb.querySelector('[name=g]').value, sex = cb.querySelector('[name=sex]').value;
    const out = cb.querySelector('.out');
    try {
      const fly = parseGenotype(txt, { sex });
      const ph = phenotypeOf(fly);
      out.innerHTML = `<div class="callout good">${flySVG(ph.traits, { size: 90 })}<div>Parsed as ${app.genoHTML(fly)} — ${esc(ph.label)} ${fly.sex === 'F' ? '♀' : '♂'}
        <div class="row"><button class="btn primary" id="use-custom">Use as ${fly.sex === 'F' ? 'mother' : 'father'}</button></div></div></div>`;
      out.querySelector('#use-custom').onclick = () => app.setParent(fly.sex === 'F' ? 'mother' : 'father', { fly, name: 'Custom: ' + app.genoText(fly), origin: 'custom' });
    } catch (err) { out.innerHTML = `<div class="callout bad" role="alert">${esc(err.message)}</div>`; }
  };
}

function alleleRefs(fly, d) {
  const rows = [];
  for (const L of Object.values(LOCI)) {
    for (const c of fly.chromosomes[L.chromosome]) {
      if (c.kind === 'Y') continue;
      const a = L.alleles[c.alleles[L.symbol]];
      if (!a.wild && !rows.some(r => r.id === a.id)) rows.push({ id: a.id, L, a });
    }
  }
  const bal = fly.chromosomes['2'].find(h => h.balancer);
  return `<table class="mini"><tr><th>Allele</th><th>Gene</th><th>FlyBase</th><th>Map</th></tr>${rows.map(({ L, a }) =>
    `<tr><td>${a.display.replace(/\[(.+)\]/, '<sup>$1</sup>')}${a.currentSymbol ? ` <span class="muted">(${a.currentSymbol.replace(/\[(.+)\]/, '<sup>$1</sup>')})</span>` : ''}</td><td><i>${L.name}</i>${L.illustrative ? ' <b>(fictional)</b>' : ''}</td>
      <td>${a.fbal ? `<a href="https://flybase.org/reports/${a.fbal}" target="_blank" rel="noopener">${a.fbal}</a>` : '—'}</td><td>${L.chromosome}-${L.mapPosition}</td></tr>`).join('')}
    ${bal ? `<tr><td>${bal.balancer}</td><td>balancer</td><td><a href="https://flybase.org/reports/${BALANCERS[bal.balancer].fbba}" target="_blank" rel="noopener">${BALANCERS[bal.balancer].fbba}</a></td><td>2</td></tr>` : ''}</table>`;
}

function customBuilder(app) {
  return `<form id="custom-form" class="panel">
    <h3>Build any fly from genotype notation</h3>
    <p class="small">Chromosomes separated by <code>;</code>, homologs by <code>/</code>. Examples: <code>w[1118]/Y ; b[1] vg[1]/+ +</code>, <code>y[1] w[1118]/+ + ; l(2)DEMO[1]/CyO ; Sb[1] e[1]/+ +</code>. Unwritten chromosomes are wild type. Modeled loci: ${Object.values(LOCI).map(l => `<i>${l.symbol}</i>`).join(', ')}; balancer: CyO.</p>
    <div class="row"><input name="g" class="mono grow" placeholder="b[1] +/+ vg[1]" aria-label="Genotype" required>
      <select name="sex" aria-label="Sex (used only if the X chromosomes are not written)"><option value="F">♀ female</option><option value="M">♂ male</option></select>
      <button class="btn primary">Parse</button></div>
    <div class="out" aria-live="polite"></div></form>`;
}

export function parentTray(app) {
  const s = app.state;
  const slot = (role, sym) => {
    const p = s[role];
    if (!p) return `<div class="tray-slot empty"><span class="sym">${sym}</span><span>No ${role} selected</span></div>`;
    const ph = phenotypeOf(p.fly);
    return `<div class="tray-slot"><span class="sym">${sym}</span>${flySVG(ph.traits, { size: 54 })}<div><b>${app.esc(p.name)}</b><br>${app.genoHTML(p.fly, { hidden: p.hidden })}</div></div>`;
  };
  return `<div class="parent-tray">${slot('mother', '♀')}<span class="times">×</span>${slot('father', '♂')}
    <button class="btn primary" data-go-breed ${s.mother && s.father ? '' : 'disabled'}>Go to Breeding Station →</button></div>`;
}
export function bindTray(app, el) { const b = el.querySelector('[data-go-breed]'); if (b) b.onclick = () => app.open('breeding'); }

function viewer(app, items) {
  const flies = items.map(({ id, sex }) => {
    const d = app.STOCK_DEFS.find(x => x.id === id); const f = app.stockFly(id, sex); const ph = phenotypeOf(f);
    return { d, f, ph, sex };
  });
  app.modal(`<div class="viewer ${flies.length > 1 ? 'two' : ''}">
    ${flies.map((x, i) => `<figure class="viewer-fig"><div class="viewer-stage" data-i="${i}">${flySVG(x.ph.traits, { size: 260, title: describe(x.ph.traits) })}</div>
      <figcaption><b>${app.esc(app.mode() === 'little' && x.d.kidName ? x.d.kidName : x.d.name)} ${sexSymbol(x.sex)}</b><br>${app.esc(app.mode() === 'little' ? plainDescription(x.ph) : x.ph.label)}</figcaption></figure>`).join('')}
    </div>
    <div class="row center"><label>Rotate <input type="range" min="-180" max="180" value="0" id="rot"></label><label>Zoom <input type="range" min="1" max="3" step="0.1" value="1" id="zoom"></label></div>
    <p class="small center">Look for: eye colour · body colour · wing shape · bristles · sex (abdomen shape, dark tip, sex combs on male forelegs).</p>`,
  { title: flies.length > 1 ? 'Compare specimens' : 'Specimen viewer', wide: true, onMount: body => {
    const upd = () => body.querySelectorAll('.viewer-stage svg').forEach(s => s.style.transform = `rotate(${body.querySelector('#rot').value}deg) scale(${body.querySelector('#zoom').value})`);
    body.querySelector('#rot').oninput = upd; body.querySelector('#zoom').oninput = upd;
    flies.forEach(x => app.emit({ type: 'inspect', stockId: x.d.id, source: 'stock', phenotype: x.ph }));
  } });
}
