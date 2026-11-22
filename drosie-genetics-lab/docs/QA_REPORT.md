# QA Report

Date: 22 November 2026 · Engine 1.0.0 · Environment: Node 22, headless Google Chrome (Playwright), desktop 1280–1440 px and mobile 390 × 844.

## 1. Automated scientific test suite — 58 / 58 passed

Run with `node tests/run-tests.mjs` (Node) or by opening `/tests/` in a browser; both give the same result. Expected values are derived analytically and written into the tests. They are never read back from the engine.

| Group | Tests | What is verified |
|---|---|---|
| Genotype parsing | 8 | FlyBase-style input, sex inference, coupling ≠ repulsion, shorthand, balancers, rejection of malformed input, format→parse round trip, all stock genotypes |
| Gamete normalization | 5 | Σp = 1 for diverse genotypes; 16 haplotypes for a 4-locus heterozygote; one of each chromosome per gamete; X:Y sperm 1:1; sex-free projection |
| Monohybrid autosomal | 4 | 1:2:1 genotypes / 3:1 phenotypes in each sex; all-heterozygous F1; 1:1 testcross; dominant Sb 1:1 |
| X-linked inheritance | 4 | criss-cross inheritance; Morgan F2 (½ red ♀, ¼ red ♂, ¼ white ♂); hemizygous expression; sons' X only from mother |
| Reciprocal crosses | 2 | X-linked reciprocals differ, autosomal reciprocals agree |
| Dihybrid | 3 | exact 9:3:3:1; four equal gametes; 1:1:1:1 testcross |
| Recombination | 7 | mapping-function values; coupling and repulsion testcross classes; three-locus combination formula, RF ≤ 0.5; unlinked RF = 0.5; X-linked y–w; RF overrides |
| No male crossing over | 3 | parental-only classes from male heterozygotes; zero recombinant gametes from every male genotype; same genotype recombines as a female |
| Lethal alleles & viability | 3 | Cy/+ intercross: zygotes 1:2:1, adults 2:1, survival ¾; Sb 2:1; double-lethal normalization (survival 9/16) |
| Balancers | 3 | l/CyO breeds true with survival ½; no recombinant chromosome 2 from CyO heterozygous females; CyO/CyO and Cy/CyO lethal |
| Phenotype mapping | 2 | multi-trait labels and render traits; Curly not scorable on vestigial wings |
| Chi-square | 6 | p-values at tabled critical values (df 1–3, α 0.05/0.01); exact df = 2 tail; Mendel's 315:108:101:32 → χ² = 0.470, p = 0.925; df with estimated parameters; small-expected and impossible-class warnings; interpretation never claims proof; RF SE |
| Reproducible sampling | 2 | identical counts for identical seeds, different for different seeds; PRNG stability |
| **Convergence (stochastic)** | 6 | 3:1 at N = 200,000 within 4 SE; linkage RF at N = 100,000 within 4 SE; inviable zygote fraction ¼ and adult Curly ⅔; sex-specific X-linked F2; **χ² Type I error ≈ α over 2,000 simulated experiments**; categorical sampler accuracy |

Deterministic tests use tolerance 1e-12 unless stated. Stochastic tests use fixed seeds (so they are reproducible) and tolerances of 4 binomial standard errors. No single random run is treated as validation.

## 2. End-to-end mission tests (headless browser) — 16 / 16 completed

Scripted players drove the real interface: stock selection, the breeding *Run* button, the *Keep flies* control, Punnett prediction inputs, the chi-square form, recombination-class checkboxes, notebook fields and mission quizzes. Every mission was completed from its own experiments: L1–L3, J1–J3, R1–R5 and U1–U5. Answers that depend on the player's data (J3, R1, R4, U1, U2, U3) were graded against that data. Example: U3 with N = 600 gave p(3:1) = 5.8 × 10⁻⁷ and p(2:1) = 0.80.

## 3. Interface checks

| Check | Result |
|---|---|
| JavaScript errors / console errors on every station, all four modes | none |
| Broken resources | none (a missing favicon on secondary pages was found and fixed) |
| Keyboard: Tab to a station in the SVG room, Enter opens it, Escape closes dialogs and panels | pass |
| Interactive controls without accessible names (6 stations scanned) | none found |
| Reduced motion (setting and `prefers-reduced-motion`) | animations off; incubation animation skipped |
| High-contrast mode, 130% text | pass (visual check) |
| Mobile 390 px | HUD wraps, station navigation scrolls, cards stack (visual check) |
| Chart palette (observed / expected bars) | validated with the dataviz palette validator against the panel surface: lightness band, chroma, CVD separation (ΔE 23), normal-vision floor and contrast all pass. A table view and legend accompany every chart. |
| Print / PDF | notebook report and worksheets print alone via print stylesheets |
| URL presets (`?mode=`, `&mission=`, `&demo=1`) | pass |
| Docs viewer renders all Markdown documents | pass |

## 4. Defects found and fixed during QA
1. **Hidden modal blocked all clicks.** A CSS `display` rule overrode the `hidden` attribute. Fixed with a global `[hidden] { display: none !important }`.
2. **Missions required steps in strict order**, so a valid experiment done earlier did not count. Steps can now be completed in any order; dependent steps check for their prerequisites explicitly.
3. **Analysis class order** made "3:1" and "2:1" refer to the wrong classes for Curly data. Classes are now ordered by expected frequency, so conventional ratios read naturally.
4. **Autosomal Punnett squares split sperm by X/Y**, which doubled the grid needlessly. Sex chromosomes are now included only when an X-linked locus segregates.
5. Footer overlapped open stations; duplicated sex symbols in names; vestigial stubs hard to see; cramped chromosome labels; mission step layout. All fixed.

## 5. Scientific verification performed
Each locus and allele was checked against its FlyBase report: gene and allele IDs, recombination map, Release 6 coordinates, phenotype statements, and lethality notes. Classical map positions were checked against Lindsley & Grell (1972) entries, and the Curly/Duox identity against Hurd et al. (2015). NGSS performance expectations and TEKS BIO.8.B were checked against official or state sources. Details are in SCIENTIFIC_REFERENCE.md.

## 6. Not tested
Safari and Firefox were not run (Chrome only). There was no physical-device touch testing, no screen-reader session (NVDA/VoiceOver), and no classroom testing with students. See REMAINING_WORK.md.
