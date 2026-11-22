/**
 * Viability: separates fertilization (zygote) probabilities from observed adult survivors.
 *
 * Rules (all documented in MODEL_SPECIFICATION.md):
 *  - An allele with viability 'recessive-lethal' kills a zygote in which EVERY copy at that
 *    locus is that allele (homozygote, or hemizygous male for an X-linked lethal).
 *  - Different lethal alleles at the same locus are not assumed to complement or fail to
 *    complement — no such pairs exist in the current database.
 *  - Relative viability of non-lethal mutants is 1 (e.g. reduced vg1 viability not modeled).
 */
import { LOCI } from './trait-database.js';
import { allelesAt } from './chromosome-model.js';

export function assessViability(fly) {
  const reasons = [];
  for (const locus of Object.keys(LOCI)) {
    const copies = allelesAt(fly, locus);
    if (!copies.length) continue;
    const first = copies[0];
    const rec = LOCI[locus].alleles[first];
    if (rec.viability === 'recessive-lethal' && copies.every(a => a === first)) {
      reasons.push(`${rec.display}${copies.length === 1 ? ' (hemizygous)' : '/' + rec.display} is lethal`);
    }
  }
  return { viable: reasons.length === 0, relativeViability: reasons.length ? 0 : 1, reasons };
}

/** Normalize a zygote distribution to the surviving adults. */
export function applyViability(zygotes) {
  const survival = zygotes.reduce((s, z) => s + (z.viable ? z.p : 0), 0);
  const adults = survival > 0 ? zygotes.filter(z => z.viable).map(z => ({ ...z, pAdult: z.p / survival })) : [];
  return { survival, adults };
}
