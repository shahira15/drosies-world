/** Small shared helpers for station UIs. */
export function toFraction(x, maxDen = 4096) {
  if (x === 0) return '0';
  if (Math.abs(x - 1) < 1e-12) return '1';
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-9) return `${n}/${d}`;
  }
  return x.toFixed(4);
}
export const pct = (x, d = 1) => `${(100 * x).toFixed(d)}%`;
export function parseFractionInput(s) {
  s = String(s).trim().replace(',', '.');
  if (!s) return NaN;
  if (s.endsWith('%')) return parseFloat(s) / 100;
  if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
  return Number(s);
}
export const total = rec => rec.classCounts.reduce((s, c) => s + c.count, 0);

/** Pool sex-specific class counts by phenotype label. */
export function pooled(rec) {
  const m = new Map();
  for (const c of rec.classCounts) {
    if (!m.has(c.label)) m.set(c.label, { label: c.label, traits: { ...c.traits, sex: 'F' }, count: 0, expectedP: 0 });
    const x = m.get(c.label); x.count += c.count; x.expectedP += c.expectedP;
  }
  return [...m.values()];
}
export function sexMatters(rec) {
  const p = pooled(rec);
  return rec.classCounts.some(c => { const pc = p.find(x => x.label === c.label); return Math.abs(c.expectedP - pc.expectedP / 2) > 1e-9; });
}
