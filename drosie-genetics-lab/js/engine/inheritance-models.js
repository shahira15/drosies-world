/**
 * Inheritance rules: dominance → phenotype, and Drosophila-specific meiotic rules.
 */
import { LOCI, BALANCERS } from './trait-database.js';
import { allelesAt } from './chromosome-model.js';

/**
 * Meiotic crossing-over rules for one chromosome pair in one parent.
 *  - Standard D. melanogaster males are achiasmate: NO meiotic crossing over on any chromosome.
 *  - Females recombine on X and the major autosomes.
 *  - If either homolog is a balancer, recovery of crossover chromosomes is suppressed
 *    (modeled as complete suppression — a documented simplification).
 */
export function meioticRule(fly, chrom) {
  if (fly.sex === 'M') return { crossingOver: false, reason: 'Drosophila melanogaster males do not undergo meiotic crossing over.' };
  const pair = fly.chromosomes[chrom];
  const bal = pair.find(h => h.balancer);
  if (bal) return { crossingOver: false, reason: `${bal.balancer} balancer: crossover chromosomes are not recovered (simplified as complete suppression).` };
  return { crossingOver: true, reason: 'Female meiosis: crossing over occurs.' };
}

/** Is the mutant allele at a locus expressed? Handles hemizygous males (one X copy). */
export function expressedAllele(fly, locus) {
  const copies = allelesAt(fly, locus);
  const L = LOCI[locus];
  const mutants = copies.filter(a => !L.alleles[a].wild);
  for (const a of new Set(mutants)) {
    const rec = L.alleles[a];
    if (rec.dominance === 'dominant') return rec;
    if (rec.dominance === 'recessive' && mutants.length === copies.length && new Set(mutants).size === 1) return rec;
  }
  return null;
}

/**
 * Phenotype of a fly. Returns structured traits (for rendering) plus a scoring label.
 * Scoring notes:
 *  - Curly cannot be scored on vestigial wings (vg1 homozygotes) → wings reported as vestigial.
 *  - Body colour mutants are reported individually; combined dark mutants render dark.
 */
export function phenotypeOf(fly) {
  const traits = { sex: fly.sex, eye: 'red', body: 'wild', wings: 'normal', bristles: 'normal' };
  const labels = [];
  const notes = [];
  const exp = {};
  for (const locus of Object.keys(LOCI)) {
    const a = expressedAllele(fly, locus);
    if (a) exp[locus] = a;
  }
  if (exp.w) { traits.eye = 'white'; labels.push('white eyes'); }
  const bodies = [];
  if (exp.y) bodies.push('yellow');
  if (exp.b) bodies.push('black');
  if (exp.e) bodies.push('ebony');
  if (bodies.length) {
    traits.body = bodies.includes('ebony') ? 'ebony' : bodies.includes('black') ? 'black' : 'yellow';
    if (bodies.includes('yellow') && bodies.length > 1) traits.body = 'yellow-dark';
    labels.push(bodies.join(' ') + ' body');
  }
  if (exp.vg) {
    traits.wings = 'vestigial'; labels.push('vestigial wings');
    if (exp.Cy) notes.push('Curly is not scorable on vestigial wings.');
  } else if (exp.Cy) { traits.wings = 'curly'; labels.push('Curly wings'); }
  if (exp.Sb) { traits.bristles = 'stubble'; labels.push('Stubble bristles'); }
  const label = labels.length ? labels.join(', ') : 'wild type';
  return { traits, label, labels, notes, expressed: exp };
}

/** Child-friendly descriptions used in Little Geneticist mode (no notation). */
export function plainDescription(ph) {
  const t = ph.traits;
  const bits = [];
  bits.push(t.eye === 'red' ? 'red eyes' : 'white eyes');
  bits.push({ wild: 'tan body', yellow: 'yellow body', black: 'black body', ebony: 'very dark body', 'yellow-dark': 'mixed dark body' }[t.body]);
  bits.push({ normal: 'long wings', vestigial: 'tiny crumpled wings', curly: 'curly wings' }[t.wings]);
  if (t.bristles === 'stubble') bits.push('short bristles');
  return bits.join(', ');
}

export function describeInheritance(locus) {
  const L = LOCI[locus];
  const mut = Object.values(L.alleles).filter(a => !a.wild);
  const linkage = L.chromosome === 'X' ? 'X-linked' : `autosomal (chromosome ${L.chromosome})`;
  return mut.map(a => `${a.display}: ${linkage}, ${a.dominance}${a.viability === 'recessive-lethal' ? ', recessive lethal' : ''}`).join('; ');
}

export { BALANCERS };
