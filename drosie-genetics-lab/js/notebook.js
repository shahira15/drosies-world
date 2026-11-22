/** Research notebook: entries, CSV/JSON export, printable report. */
export const NOTEBOOK_FIELDS = [
  { key: 'title', label: 'Title', rows: 1 },
  { key: 'question', label: 'Research question', rows: 2, hint: 'What do you want to find out?' },
  { key: 'hypothesis', label: 'Hypothesis or prediction', rows: 3, hint: 'What do you expect, and why?' },
  { key: 'design', label: 'Cross design', rows: 2, hint: 'Which parents? Why this cross? (auto-filled when you attach a cross)' },
  { key: 'conclusion', label: 'Conclusion', rows: 3, hint: 'What do the data show? Use evidence.' },
  { key: 'limitations', label: 'Limitations', rows: 3, hint: 'Sample size? Model assumptions? What could you do next?' }
];

export function newEntry(recordId = null) {
  return { id: 'nb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), created: new Date().toISOString(),
    title: '', question: '', hypothesis: '', design: '', conclusion: '', limitations: '', recordId };
}

function csvCell(v) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }

/** Raw simulated counts in long format — one row per cross × phenotype class × sex. */
export function recordsToCSV(records, genotypeText) {
  const head = ['cross_id', 'created', 'mother_genotype', 'father_genotype', 'seed', 'n_adults_scored', 'inviable_zygotes_simulated', 'phenotype', 'sex', 'observed_count', 'expected_proportion', 'expected_count', 'data_type'];
  const rows = [head.join(',')];
  for (const r of records) {
    const n = r.classCounts.reduce((s, c) => s + c.count, 0);
    for (const c of r.classCounts) {
      rows.push([r.id, r.created, genotypeText(r.mother), genotypeText(r.father), r.seed, n, r.inviable, c.label, c.sex === 'M' ? 'male' : 'female', c.count, c.expectedP.toFixed(6), (c.expectedP * n).toFixed(3), 'SIMULATED'].map(csvCell).join(','));
    }
  }
  return rows.join('\n');
}

export function download(filename, text, mime = 'text/csv') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
