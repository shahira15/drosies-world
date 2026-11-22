# Genetics Model Specification

Engine version 1.0.0 · Source: `js/engine/` (no DOM dependencies; runs in browsers and Node ≥ 18).

## 1. Representation

- **Haplotype** (one homolog): `{ kind: 'X'|'Y'|'A', chrom, alleles: {locus: allele}, balancer: null|'CyO' }`. Every modeled locus on that chromosome has an allele. Unwritten loci are wild type. A Y haplotype carries no modeled loci.
- **Fly**: `{ sex, chromosomes: { X: [h,h], '2': [h,h], '3': [h,h] } }`. Sex is *derived* from the sex chromosomes (XX → female, XY → male); other karyotypes are rejected.
- Homolog order carries no meaning. A canonical order (X before Y, then sorted key) is used for identity (`flyKey`), so coupling (`b vg/+ +`) and repulsion (`b +/+ vg`) are correctly different genotypes.

## 2. Meiosis and gametes

For each parent, the gamete distribution is the product over chromosomes 1 (X/Y), 2 and 3 of per-chromosome haplotype distributions. Chromosomes assort independently.

Per chromosome pair:

| Parent | Crossing over | Result |
|---|---|---|
| male (any chromosome) | **none** | each homolog with probability ½ |
| female, X or autosome | yes | path enumeration (below) |
| female, either homolog is a balancer | none (simplification) | each homolog with probability ½ |

**Path enumeration (females).** Let modeled loci on the chromosome be ordered by map position, l₁ … lₙ, with adjacent-interval recombination fractions r₁ … rₙ₋₁. A gamete chromosome is a path that starts on homolog 1 or 2 (probability ½ each) and switches homolog in interval i with probability rᵢ, independently across intervals. All 2ⁿ paths are enumerated and identical haplotypes are merged. This gives exact probabilities that sum to 1.

**Map distance → recombination fraction.** For each adjacent interval of map length d (cM):

- Kosambi (default): r = ½ tanh(2d/100)
- Haldane: r = ½ (1 − e^(−2d/100))
- Linear: r = min(d/100, ½)

Because intervals are combined independently, the RF between non-adjacent loci is r = ½ [1 − Π(1 − 2rᵢ)] ≤ ½. Per-interval overrides (`rfOverrides: {'b|vg': 0.17}`) are supported.

*Rationale for Kosambi default:* classical map distances are sums of short-interval estimates, so they exceed the RF observed over long intervals. Kosambi gives r(b–vg) = 0.1770 for 18.5 cM, close to the ~17–18% typically observed in teaching labs. Linear would give 0.185 and Haldane 0.155. University users can switch the function and see the effect.

## 3. Fertilization

Every egg × sperm pair is combined. The zygote probability is the product of the two gamete probabilities, summed over pairs giving the same canonical genotype. XY sperm give sons and X sperm give daughters, so offspring sex ratio and sex-specific distributions emerge from the model; they are never imposed.

## 4. Phenotype

For each locus, the copies present are 2 in females, or 1 for X-linked loci in males (hemizygosity).

- A **recessive** mutant allele is expressed when *all* copies are that allele.
- A **dominant** mutant allele is expressed when *any* copy is present.
- Scoring rules: Curly cannot be scored on vestigial wings, so vestigial is reported with a note. Body-color mutants are reported individually (e.g. "yellow black body"). Rendering uses the darkest applicable color.
- All phenotypes are fully penetrant with no scoring error (see §8).

## 5. Viability

An allele marked `recessive-lethal` kills a zygote when every copy at its locus is that allele. CyO carries *Cy*<sup>1</sup>, so CyO/CyO and Cy/CyO are lethal. All other genotypes have relative viability 1.

The engine reports both:

- **zygote (fertilization) probabilities**, which sum to 1 over all genotypes, viable or not;
- **adult probabilities** = zygote probability / survival, over viable genotypes only.

Example: Cy/+ × Cy/+ gives zygotes 1 : 2 : 1, survival ¾, adults 2 Curly : 1 flat.

## 6. Balancer model (explicitly limited)

Modeled:

- dominant visible marker (Curly);
- recessive lethality of the balancer homozygote;
- in a female carrying CyO on either homolog, **no recombinant chromosome 2 is recovered** (complete suppression), so a balanced lethal stock breeds true.

**Not** modeled:

- the inversion structure itself;
- single crossovers *within* inverted segments producing acentric or dicentric products;
- double crossovers, gene conversion, or crossing over distal to the most distal breakpoint (which really does happen, e.g. *speck* recombining onto CyO);
- the recessive markers *cn*<sup>2</sup>, *pr*<sup>1</sup>, *dpy*<sup>lvI</sup>;
- the fitness costs of balancers;
- breakdown of balancers over many generations.

## 7. Simulation (sampling)

Zygotes are drawn i.i.d. from the fertilization distribution using a seeded Mulberry32 PRNG and a binary-search categorical sampler. Inviable zygotes are discarded and counted, and drawing continues until N adults have been scored. This is equivalent to multinomial sampling of N adults from the viability-normalized distribution. The same seed, parents, N and engine options always give identical counts. All outputs are labelled **SIMULATED**.

## 8. Statistics

- **χ² goodness of fit:** χ² = Σ (O − E)²/E. Expected ratios are normalized to N. df = k − 1 − (parameters estimated from the data). The p-value is the upper tail of χ²(df), from the regularized incomplete gamma function (series + continued fraction).
- **Warnings:** any expected count < 5; N < 30; df < 1; an observed class with expected 0 (which contradicts the hypothesis outright).
- **Interpretation text** never states that a model is proven. Failing to reject is reported as "consistent with", with a note on power.
- **Recombination estimate:** r̂ = recombinants / N, SE = √(r̂(1 − r̂)/N), with a Wald 95% interval.

## 9. Assumptions (summary) and unsupported mechanisms

Assumed: Mendelian segregation; no meiotic drive or segregation distortion; all gametes equally functional; random union of gametes; no interference between intervals; complete penetrance and no scoring error; equal viability of non-lethal genotypes; XX/XY only.

Not supported (yet): maternal effects; incomplete dominance and codominance; multiple alleles at one locus beyond those listed; epistasis beyond the Curly/vestigial scoring rule; chromosome 4 loci; nondisjunction (XXY, XO); attached-X; translocations; P-element-induced male recombination; temperature-sensitive expressivity; age-dependent scoring; population genetics.
