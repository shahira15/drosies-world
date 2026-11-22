# Undergraduate Instructor Guide

Use **University Fly Genetics** mode. In this mode, genotypes use FlyBase-style notation (e.g. `w[1118]/Y ; b[1] vg[1]/+ +`), allele cards link to FlyBase records, and every cross can show its gamete and zygote tables. The *Build a genotype* tab in the Stock Center accepts any genotype over the modeled loci, including CyO.

Before class, read `MODEL_SPECIFICATION.md`. It lists every assumption, and the analysis station repeats them in context.

## What students can verify for themselves
- **Exact expectations.** The gamete table (Breeding → *Gamete formation*) and the zygote table show exact probabilities as fractions or decimals, before and after viability.
- **Engine tests.** Students can run the test suite (`tests/`, or `node tests/run-tests.mjs`). It checks the engine against analytic results, convergence within ±4 SE, and chi-square Type I error calibration.
- **Reproducibility.** Seeds make any dataset reproducible, so an instructor can regenerate a student's data exactly.

## Practical 1 — Two-point mapping of *b* and *vg* (2–3 h)
1. Cross `b[1] vg[1]/b[1] vg[1]` ♀ × `+/Y` ♂ (wild type), keep F1 females, and testcross them to `b[1] vg[1]` males (≥ 1,000 offspring).
2. Identify the parental and recombinant classes, estimate r ± SE (Data → recombination calculator), and compare with the map distance (48.5 → 67.0 = 18.5 cM).
3. Switch *Map → RF function* between Kosambi, Haldane and linear, re-run the cross, and explain the differences.
4. Reverse the sexes: use an F1 **male** as the heterozygote. Students should get r = 0 and explain achiasmate male meiosis.

**Expected values (engine):** Kosambi r = 0.1770, so parental classes are 0.4115 each and recombinant classes 0.0885 each. Haldane r = 0.1546; linear r = 0.185.

## Practical 2 — Lethality and ratio distortion (1–2 h)
1. Intercross `Cy[1]/+` and score ≥ 300 offspring. Test against 3:1 and 2:1.
2. Discuss power. Worked example: 212 Curly : 88 flat gives χ²(3:1) = 3.00, p = 0.083, and χ²(2:1) = 2.16, p = 0.142. **Neither hypothesis is rejected at N = 300.** How large must N be to tell them apart?
3. Read Hurd et al. 2015. Why do students now say *Duox*<sup>Cy</sup>, and what does rescue of homozygote viability by *duox* expression show?
4. Repeat with `Sb[1]/+`. Discuss FlyBase's note that the lethality of the Sb<sup>1</sup> chromosome is probably due to a linked lethal: phenotype and lethality need not come from the same lesion.

## Practical 3 — Balancers and stock keeping (1–2 h)
1. Intercross `l(2)DEMO[1]/CyO` and confirm that all adults are Curly and that zygote survival is ½.
2. Outcross the stock to wild type and identify the flat-winged class as `l(2)DEMO[1]/+`.
3. Design a scheme to put a new chromosome 2 mutation over CyO and recover a balanced stock. Students then write each generation's genotypes in proper notation.
4. **Critique the model.** Ask what the simplified balancer leaves out (MODEL_SPECIFICATION §6) and when CyO can in fact acquire distal markers (e.g. *sp*).

## Practical 4 — Statistical thinking
- Have each student run the 9:3:3:1 dihybrid with seeds 1–40 at N = 400. The class should see about 2 of 40 tests reject at α = 0.05. This is the Type I error, which the test suite also checks with 2,000 runs.
- Explain why df = k − 1 − (estimated parameters). Then test Hardy–Weinberg-style data with one estimated parameter using the *Parameters estimated* field.

## Assessment questions (with answers)
1. *A b vg/+ + male is testcrossed. What fraction of offspring are black but not vestigial?* **0** (no male recombination).
2. *Why are linkage testcrosses in Drosophila done with heterozygous females?* Males don't cross over, so only female meiosis reveals recombination.
3. *A χ² test against 9:3:3:1 gives p = 0.40. What can you conclude?* The data are consistent with independent assortment at this sample size; this does not prove it.
4. *Explain the zygote vs adult distinction for l/CyO × l/CyO.* Zygotes are ¼ l/l : ½ l/CyO : ¼ CyO/CyO; adults are 100% l/CyO.
5. *Two loci 40 cM apart: what RF do Kosambi and Haldane predict?* Kosambi ½ tanh(0.8) = 0.332; Haldane ½(1 − e<sup>−0.8</sup>) = 0.275.

## Known limitations to discuss openly
There is no interference across intervals, no nondisjunction, and no viability differences among non-lethal genotypes. Phenotypes are scored perfectly, the balancer model is simplified, and l(2)DEMO is fictional. See MODEL_SPECIFICATION §9.
