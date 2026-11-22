import { flySVG, describe, sexSymbol } from '../phenotype-renderer.js';
import { phenotypeOf, plainDescription } from '../engine/index.js';

export function renderMicroscope(app, el, params) {
  const s = app.state, mode = app.mode(), esc = app.esc;
  const rec = params.recordId ? app.getRecord(params.recordId) : s.records[s.records.length - 1];
  const specimens = [];
  const stockIds = ['wt', 'white', 'vg', 'ebony'].concat(mode === 'little' ? [] : ['yellow', 'black', 'curly', 'stubble']);
  for (const id of stockIds) {
    const d = app.STOCK_DEFS.find(x => x.id === id);
    if (!d.modes.includes(mode)) continue;
    for (const sex of ['F', 'M']) {
      const f = app.stockFly(id, sex);
      specimens.push({ key: `s:${id}:${sex}`, group: 'Stock flies', name: `${mode === 'little' && d.kidName ? d.kidName : d.name} ${sexSymbol(sex)}`, traits: phenotypeOf(f).traits, stockId: id, source: 'stock' });
    }
  }
  if (rec) {
    const res = app.crossFor(rec);
    rec.individuals.slice(0, 30).forEach((ind, i) => {
      const z = res.zygotes[ind.zygoteIndex];
      specimens.push({ key: `o:${rec.id}:${i}`, group: `Offspring of cross #${rec.num}`, name: `Offspring ${i + 1} ${sexSymbol(ind.sex)}`, traits: z ? z.phenotype.traits : ind.traits, source: 'offspring' });
    });
  }
  const selKey = params.sel || (rec ? `o:${rec.id}:0` : specimens[0].key);
  const sel = specimens.find(x => x.key === selKey) || specimens[0];
  const cmpKey = params.cmp;
  const cmp = cmpKey && specimens.find(x => x.key === cmpKey);
  const v = s.viewMode.scope ||= { zoom: 1.4, focus: 50, light: 100, rot: 0 };

  const groups = [...new Set(specimens.map(x => x.group))];
  el.innerHTML = `<div class="scope-layout">
    <aside class="specimens"><h3>Specimen tray</h3>${groups.map(g => `<h4>${esc(g)}</h4><div class="spec-grid">${specimens.filter(x => x.group === g).map(x => `
      <button class="spec ${x.key === sel.key ? 'on' : ''}" data-key="${x.key}" aria-pressed="${x.key === sel.key}" title="${esc(x.name)}">${flySVG(x.traits, { size: 44 })}<span>${esc(x.name)}</span></button>`).join('')}</div>`).join('')}
      ${!rec ? '<p class="small">Run a cross to put offspring on the tray.</p>' : ''}</aside>
    <section class="scope-main">
      <div class="eyepieces ${cmp ? 'two' : ''}">
        ${eyepiece(sel, v)}${cmp ? eyepiece(cmp, v) : ''}
      </div>
      <div class="scope-controls">
        <label>Magnification <input type="range" id="zoom" min="1" max="4" step="0.1" value="${v.zoom}"><output>${(v.zoom * 10).toFixed(0)}×</output></label>
        <label>Focus <input type="range" id="focus" min="0" max="100" value="${v.focus}"></label>
        <label>Light <input type="range" id="light" min="40" max="160" value="${v.light}"></label>
        <label>Rotate <input type="range" id="rot" min="-180" max="180" value="${v.rot}"></label>
        <label>Compare with <select id="cmp"><option value="">— none —</option>${specimens.filter(x => x.key !== sel.key).map(x => `<option value="${x.key}" ${x.key === cmpKey ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
      </div>
      <div class="panel scoring"><h3>${mode === 'little' ? 'What do you see?' : 'Scoring sheet'}</h3>${scoreSheet(sel, mode, esc)}</div>
    </section></div>`;

  const apply = () => {
    el.querySelectorAll('.eyepiece svg').forEach(svg => {
      svg.style.transform = `rotate(${v.rot}deg) scale(${v.zoom})`;
      svg.style.filter = `blur(${Math.abs(v.focus - 50) / 12}px) brightness(${v.light}%)`;
    });
    const o = el.querySelector('output'); if (o) o.textContent = `${(v.zoom * 10).toFixed(0)}×`;
  };
  for (const id of ['zoom', 'focus', 'light', 'rot']) el.querySelector('#' + id).oninput = e => { v[id] = +e.target.value; apply(); app.save(); };
  apply();
  el.querySelectorAll('.spec').forEach(b => b.onclick = () => { app.sfx('click'); app.open('microscope', { ...params, sel: b.dataset.key }); });
  el.querySelector('#cmp').onchange = e => app.open('microscope', { ...params, sel: sel.key, cmp: e.target.value || undefined });
  app.emit({ type: 'inspect', stockId: sel.stockId, source: sel.source, phenotype: { traits: sel.traits } });
}

function eyepiece(x, v) {
  return `<figure class="eyepiece"><div class="eyepiece-ring"><div class="eyepiece-field" style="--light:${v.light / 100}">${flySVG(x.traits, { size: 230, title: describe(x.traits) })}</div></div><figcaption>${x.name}</figcaption></figure>`;
}

function scoreSheet(x, mode, esc) {
  const t = x.traits;
  if (mode === 'little') {
    return `<ul class="kid-traits">
      <li><span class="ico eye ${t.eye}"></span> Eyes: <b>${t.eye === 'red' ? 'red' : 'white'}</b></li>
      <li><span class="ico body ${t.body}"></span> Body: <b>${{ wild: 'tan', yellow: 'yellow', black: 'black', ebony: 'very dark', 'yellow-dark': 'dark' }[t.body]}</b></li>
      <li><span class="ico wing ${t.wings}"></span> Wings: <b>${{ normal: 'long', vestigial: 'tiny', curly: 'curly' }[t.wings]}</b></li>
      <li>${t.sex === 'F' ? 'This is a girl fly (bigger, striped pointy tail).' : 'This is a boy fly (smaller, dark round tail).'}</li></ul>`;
  }
  const row = (k, v, wild) => `<tr><th>${k}</th><td>${v}</td><td>${wild ? '<span class="tag">wild type</span>' : '<span class="tag mut">mutant</span>'}</td></tr>`;
  return `<table class="data compact"><tbody>
    ${row('Sex', t.sex === 'F' ? 'Female — larger, pointed banded abdomen, no sex combs' : 'Male — smaller, rounded dark-tipped abdomen, sex combs on forelegs', true)}
    ${row('Eyes', t.eye === 'red' ? 'Dark red' : 'White (no red pigment)', t.eye === 'red')}
    ${row('Body colour', { wild: 'Tan (wild type)', yellow: 'Yellow', black: 'Black', ebony: 'Ebony (very dark, shiny)', 'yellow-dark': 'Dark (combination)' }[t.body], t.body === 'wild')}
    ${row('Wings', { normal: 'Long, flat', vestigial: 'Vestigial (tiny, crumpled)', curly: 'Curly (curved upward)' }[t.wings], t.wings === 'normal')}
    ${row('Bristles', t.bristles === 'stubble' ? 'Stubble (short, thick)' : 'Long, thin', t.bristles === 'normal')}
    </tbody></table>
    <p class="small muted">Tip: black and ebony look alike — real geneticists distinguish them by crosses (they are different genes on chromosomes 2 and 3), not just by eye.</p>`;
  void esc; void plainDescription;
}
