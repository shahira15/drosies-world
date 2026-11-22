/**
 * Fly Stock Center collection. Genotypes are written in the engine's FlyBase-style notation and
 * parsed by the engine (so every stock is validated at load time).
 * modes: which educational modes show the stock.
 */
import { parseGenotype } from './engine/index.js';

const ALL = ['little', 'junior', 'researcher', 'university'];
const J_UP = ['junior', 'researcher', 'university'];
const R_UP = ['researcher', 'university'];
const U = ['university'];

export const STOCK_DEFS = [
  { id: 'wt', name: 'Wild type', kidName: 'Everyday fly', female: '+/+', male: '+/Y', modes: ALL, chromosome: '—', difficulty: 1,
    notes: 'Wild type at every modeled locus, like the classic lab strains Canton-S and Oregon-R. Red eyes, tan body, long flat wings.' },
  { id: 'white', name: 'white (w¹¹¹⁸)', kidName: 'Snowy-eyed fly', female: 'w[1118]/w[1118]', male: 'w[1118]/Y', modes: ALL, chromosome: 'X', difficulty: 1,
    notes: 'Recessive, X-linked. The first sex-linked mutation studied (Morgan, 1910, used the original w allele; w1118 is a modern null allele).' },
  { id: 'vg', name: 'vestigial (vg¹)', kidName: 'Tiny-wing fly', female: 'vg[1]/vg[1]', male: 'vg[1]/vg[1]', modes: ALL, chromosome: '2R', difficulty: 1,
    notes: 'Recessive, autosomal (chromosome 2). Wings and halteres reduced; these flies cannot fly.' },
  { id: 'ebony', name: 'ebony (e¹)', kidName: 'Dark fly', female: 'e[1]/e[1]', male: 'e[1]/e[1]', modes: ALL, chromosome: '3R', difficulty: 1,
    notes: 'Recessive, autosomal (chromosome 3). Very dark, shiny body.' },
  { id: 'yellow', name: 'yellow (y¹)', kidName: 'Golden fly', female: 'y[1]/y[1]', male: 'y[1]/Y', modes: J_UP, chromosome: 'X', difficulty: 2,
    notes: 'Recessive, X-linked. Yellow body, bristles and wings. y1 males court less successfully (not modeled).' },
  { id: 'black', name: 'black (b¹)', female: 'b[1]/b[1]', male: 'b[1]/b[1]', modes: J_UP, chromosome: '2L', difficulty: 2,
    notes: 'Recessive, autosomal (chromosome 2). Now known as Adc[b-1]. Easy to confuse with ebony — they are different genes on different chromosomes.' },
  { id: 'ecarrier', name: 'ebony carrier (e¹/+)', female: 'e[1]/+', male: 'e[1]/+', modes: J_UP, chromosome: '3R', difficulty: 2,
    notes: 'Heterozygous: carries one e1 allele but looks wild type, because e1 is recessive.' },
  { id: 'vge', name: 'vestigial ebony (vg¹ ; e¹)', female: 'vg[1]/vg[1] ; e[1]/e[1]', male: 'vg[1]/vg[1] ; e[1]/e[1]', modes: R_UP, chromosome: '2R, 3R', difficulty: 3,
    notes: 'Double mutant for two unlinked recessive genes — use it for dihybrid crosses.' },
  { id: 'bvg', name: 'black vestigial (b¹ vg¹)', female: 'b[1] vg[1]/b[1] vg[1]', male: 'b[1] vg[1]/b[1] vg[1]', modes: R_UP, chromosome: '2L–2R', difficulty: 3,
    notes: 'Both mutations on chromosome 2 (map positions 48.5 and 67.0). The standard "tester" for b–vg linkage testcrosses.' },
  { id: 'bvgcis', name: 'b vg / + + (coupling)', female: 'b[1] vg[1]/+ +', male: 'b[1] vg[1]/+ +', modes: R_UP, chromosome: '2', difficulty: 4,
    notes: 'Double heterozygote with both mutant alleles on the SAME homolog (coupling / cis). Made by crossing b vg flies to wild type.' },
  { id: 'bvgtrans', name: 'b + / + vg (repulsion)', female: 'b[1] +/+ vg[1]', male: 'b[1] +/+ vg[1]', modes: U, chromosome: '2', difficulty: 4,
    notes: 'Double heterozygote with the mutant alleles on DIFFERENT homologs (repulsion / trans).' },
  { id: 'yw', name: 'yellow white (y¹ w¹¹¹⁸)', female: 'y[1] w[1118]/y[1] w[1118]', male: 'y[1] w[1118]/Y', modes: U, chromosome: 'X', difficulty: 4,
    notes: 'Two tightly linked X-linked markers (map positions 0.0 and 1.5). A very common laboratory background.' },
  { id: 'curly', name: 'Curly (Cy¹/+)', female: 'Cy[1]/+', male: 'Cy[1]/+', modes: R_UP, chromosome: '2L', difficulty: 3,
    notes: 'Dominant visible wing marker (now Duox[Cy]); homozygous lethal. A Cy/+ stock must be kept by selecting Curly flies every generation.' },
  { id: 'stubble', name: 'Stubble (Sb¹/+)', female: 'Sb[1]/+', male: 'Sb[1]/+', modes: U, chromosome: '3R', difficulty: 3,
    notes: 'Dominant bristle marker; Sb1 chromosomes are homozygous lethal (probably a linked lethal).' },
  { id: 'balanced', name: 'l(2)DEMO¹ / CyO (balanced)', female: 'l(2)DEMO[1]/CyO', male: 'l(2)DEMO[1]/CyO', modes: U, chromosome: '2', difficulty: 5,
    notes: 'A recessive lethal mutation kept over the CyO balancer. l(2)DEMO is FICTIONAL, standing in for any recessive lethal on chromosome 2.' },
  { id: 'mystery', name: 'Mystery wild-type female', kidName: 'Mystery fly', female: 'MYSTERY', male: null, modes: R_UP, chromosome: '2R', difficulty: 3, hidden: true,
    notes: 'This normal-winged female is either vg+/vg+ or vg1/vg+. Her genotype is hidden — design a testcross to find out.' }
];

/** Mystery genotype is chosen once per player (stored), so the answer is not in the source code. */
export function mysteryGenotype(secret) { return secret % 2 === 0 ? 'vg[1]/+' : '+/+'; }

export function buildStock(def, sex, secret = 1) {
  const g = sex === 'F' ? def.female : def.male;
  if (!g) return null;
  const text = g === 'MYSTERY' ? mysteryGenotype(secret) : g;
  return parseGenotype(text, { sex });
}

export function validateStocks() {
  for (const d of STOCK_DEFS) for (const s of ['F', 'M']) {
    const f = buildStock(d, s, 0); if (f && f.sex !== s) throw new Error(`Stock ${d.id} has wrong sex`);
    buildStock(d, s, 1);
  }
  return true;
}
