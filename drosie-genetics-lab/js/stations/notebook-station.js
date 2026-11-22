import { NOTEBOOK_FIELDS, newEntry, recordsToCSV, download } from '../notebook.js';
import { formatGenotype } from '../engine/index.js';
import { sexSymbol, traitSwatch } from '../phenotype-renderer.js';
import { toFraction, pct, total } from './util.js';

export function renderNotebook(app, el, params) {
  const s = app.state, esc = app.esc, mode = app.mode();
  if (params.newFor) {
    const r = app.getRecord(params.newFor);
    const e = newEntry(r.id);
    e.title = `Cross #${r.num}: ${r.motherName} × ${r.fatherName}`;
    e.design = designText(app, r);
    s.notebook.push(e); app.save();
    params = { id: e.id };
    app.params = params;
  }
  const entry = s.notebook.find(e => e.id === params.id) || s.notebook[s.notebook.length - 1];
  const rec = entry?.recordId && app.getRecord(entry.recordId);

  el.innerHTML = `<div class="nb-layout">
    <aside class="nb-list"><button class="btn primary" id="nb-new">+ New entry</button>
      <ul>${[...s.notebook].reverse().map(e => `<li><button class="link ${entry && e.id === entry.id ? 'on' : ''}" data-id="${e.id}">${esc(e.title || 'Untitled entry')}<small>${new Date(e.created).toLocaleDateString()}</small></button></li>`).join('') || '<li class="muted small">No entries yet.</li>'}</ul>
      <hr><button class="btn" id="csv-all">⬇ Raw counts (CSV)</button><button class="btn" id="json">⬇ Notebook (JSON)</button></aside>
    <section class="nb-page">${entry ? editor(app, entry, rec, mode) : '<div class="empty">Create a notebook entry to record an investigation.</div>'}</section></div>`;

  el.querySelector('#nb-new').onclick = () => { const e = newEntry(); s.notebook.push(e); app.save(); app.open('notebook', { id: e.id }); };
  el.querySelectorAll('[data-id]').forEach(b => b.onclick = () => app.open('notebook', { id: b.dataset.id }));
  el.querySelector('#csv-all').onclick = () => download('drosie-raw-counts.csv', recordsToCSV(s.records, f => formatGenotype(f)));
  el.querySelector('#json').onclick = () => download('drosie-notebook.json', JSON.stringify(s.notebook, null, 2), 'application/json');
  if (!entry) return;
  const form = el.querySelector('#nb-form');
  form.querySelector('[name=recordId]').onchange = e => {
    entry.recordId = e.target.value || null;
    const r = app.getRecord(entry.recordId); if (r && !entry.design) entry.design = designText(app, r);
    app.save(); app.open('notebook', { id: entry.id });
  };
  form.onsubmit = e => {
    e.preventDefault();
    for (const f of NOTEBOOK_FIELDS) entry[f.key] = form[f.key].value;
    app.save(); app.toast('Notebook entry saved.', 'good'); app.sfx('step');
    app.emit({ type: 'notebook-save', entry });
    app.open('notebook', { id: entry.id });
  };
  el.querySelector('#nb-print').onclick = () => {
    for (const f of NOTEBOOK_FIELDS) entry[f.key] = form[f.key].value; app.save();
    const pr = document.getElementById('print-area');
    pr.innerHTML = report(app, entry, rec);
    document.body.classList.add('printing');
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('printing'), 300); }, 50);
  };
  el.querySelector('#nb-del').onclick = () => app.modal(`<p>Delete “${esc(entry.title || 'Untitled')}”?</p><div class="row"><button class="btn" id="no">Cancel</button><button class="btn danger" id="yes">Delete</button></div>`,
    { title: 'Delete entry', onMount: b => { b.querySelector('#no').onclick = app.closeModal; b.querySelector('#yes').onclick = () => { s.notebook = s.notebook.filter(x => x !== entry); app.save(); app.closeModal(); app.open('notebook', {}); }; } });
}

function designText(app, r) {
  return `Mother: ${app.genoText(r.mother)} (${r.motherName}); Father: ${app.genoText(r.father)} (${r.fatherName}). ${r.n} adult offspring scored, seed ${r.seed}.`.replace(r.motherHidden ? app.genoText(r.mother) : '\u0000', '?/?');
}

function editor(app, entry, rec, mode) {
  const esc = app.esc;
  return `<form id="nb-form" class="notebook-paper">
    ${NOTEBOOK_FIELDS.map(f => `<label class="nb-field"><span>${f.label}</span>${f.rows === 1 ? `<input name="${f.key}" value="${esc(entry[f.key])}">` : `<textarea name="${f.key}" rows="${f.rows}" placeholder="${esc(f.hint || '')}">${esc(entry[f.key])}</textarea>`}</label>`).join('')}
    <label class="nb-field"><span>Attached cross (data)</span><select name="recordId"><option value="">— none —</option>${[...app.state.records].reverse().map(r => `<option value="${r.id}" ${r.id === entry.recordId ? 'selected' : ''}>Cross #${r.num}: ${esc(r.motherName)} × ${esc(r.fatherName)}</option>`).join('')}</select></label>
    ${rec ? dataBlock(app, rec, mode) : ''}
    <div class="row"><button class="btn primary">Save entry</button><button type="button" class="btn" id="nb-print">🖨 Print / save as PDF</button><button type="button" class="btn danger" id="nb-del">Delete</button></div>
  </form>`;
}

function dataBlock(app, rec, mode) {
  const N = total(rec);
  return `<div class="nb-data"><h4>Expected vs observed (simulated) offspring</h4><table class="data compact"><thead><tr><th>Phenotype</th><th>Sex</th><th>Expected</th><th>Observed</th></tr></thead><tbody>
    ${rec.classCounts.map(c => `<tr><td>${traitSwatch(c.traits)} ${app.esc(c.label)}</td><td>${sexSymbol(c.sex)}</td><td class="num">${mode === 'junior' || mode === 'little' ? pct(c.expectedP) : toFraction(c.expectedP)} (${(c.expectedP * N).toFixed(1)})</td><td class="num">${c.count}</td></tr>`).join('')}
    </tbody></table><p class="small muted">N = ${N}; ${rec.inviable} inviable zygotes; seed ${rec.seed}. Data are simulated.</p></div>`;
}

function report(app, entry, rec) {
  const esc = app.esc;
  return `<article class="report"><header><h1>${esc(entry.title || 'Drosie Genetics Lab report')}</h1><p>Drosie Genetics Lab · ${new Date().toLocaleDateString()} · Level: ${app.MODES[app.mode()].name}</p></header>
    ${['question', 'hypothesis', 'design'].map(k => `<h2>${NOTEBOOK_FIELDS.find(f => f.key === k).label}</h2><p>${esc(entry[k] || '—')}</p>`).join('')}
    ${rec ? `<h2>Data</h2>${dataBlock(app, rec, app.mode())}` : ''}
    ${['conclusion', 'limitations'].map(k => `<h2>${NOTEBOOK_FIELDS.find(f => f.key === k).label}</h2><p>${esc(entry[k] || '—')}</p>`).join('')}
    <footer><p>All offspring counts were generated by a probability simulation (Drosie Genetics Lab engine) and are not laboratory measurements.</p></footer></article>`;
}
