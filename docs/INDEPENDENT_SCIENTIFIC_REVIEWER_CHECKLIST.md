# Independent Scientific Reviewer Checklist

For a *Drosophila* geneticist, entomologist or biology educator who is **not** the developer. Purpose: decide whether the science content is accurate enough for the stated audience, and record exactly what was and was not reviewed. Nothing here has been completed yet: **no independent review has taken place.**

Reviewer: ______________  Affiliation: ______________  Date: ________  Conflicts of interest: ______________
Scope reviewed (tick): [ ] Genetics Lab  [ ] Secret Fly Lab  [ ] Life Cycle  [ ] Grow Your Own  [ ] Climbing  [ ] Conference  [ ] Notebook Academy  [ ] Letters/Storybook  [ ] Discovery Library  [ ] Fruit Fly Biology page  [ ] Lesson plans/worksheets

Use: **OK** / **Fix** (give correction) / **Cannot judge**. Companion documents: `docs/SCIENTIFIC_VERIFICATION_MATRIX.md`, `drosie-genetics-lab/docs/SCIENTIFIC_REFERENCE.md`, `drosie-genetics-lab/docs/MODEL_SPECIFICATION.md`.

## A. Genetics Lab data (highest risk)
| # | Check | Result | Notes |
|---|---|---|---|
| A1 | For each of the 7 real alleles (y1, w1118, Cy1/Duox^Cy, b1/Adc^b-1, vg1, Sb1, e1): symbol, FBgn/FBal IDs, chromosome arm, map position, cytology, dominance, phenotype wording, viability. Compare with current FlyBase. | | |
| A2 | CyO: marker list (Cy, cn2, pr1, dpy-lvI) and FlyBase ID FBba0000025; lethality of Cy/Cy and CyO/CyO as modelled. | | |
| A3 | Sb1 chromosome treated as homozygous lethal: is the stated explanation (linked lethal) acceptable for teaching? | | |
| A4 | l(2)DEMO is clearly fictional everywhere it appears. | | |
| A5 | Crossing over: none in males; female map-unit to recombination conversion with Kosambi/Haldane/linear options; default function appropriate? | | |
| A6 | Balancers: model treats recombination as completely suppressed although rare crossovers occur far from breakpoints (Miller 2016, 2018). Is the learner-facing wording acceptable? | | |
| A7 | Sex determination wording (X:A ratio; Y not sex-determining; only XX and XY modelled). | | |
| A8 | Complete penetrance, no interference, no nondisjunction: are limits stated clearly enough at every level? | | |
| A9 | Chi-square: degrees of freedom, expected-count warnings, wording of interpretation (never "proves"). | | |
| A10 | Missions R1-R5, U1-U5, J1-J3, L1-L3: are the keyed answers scientifically defensible for the age group? | | |

## B. Numbers and facts that currently have no checked source
| # | Claim (where) | Result | Suggested source / correction |
|---|---|---|---|
| B1 | Egg to adult about 9-10 days at 25 C (several pages) | | |
| B2 | About 19 days at 18 C and about 7 days at 29 C (Grow Your Own) | | |
| B3 | Embryo about 24 h; larva about 4 d with 3 instars; pupa about 4-5 d; wings harden over hours (Life Cycle) | | |
| B4 | Adult 2-3 mm; females slightly larger; about 800 ommatidia per eye; sex combs, abdomen banding, halteres (Secret Fly Lab, Fruit Fly Biology) | | |
| B5 | "Roughly 14,000 genes" (Fruit Fly Biology; source paper says about 13,600) | | |
| B6 | Adult lifespan "several weeks to about two months" (Fruit Fly Biology) | | |
| B7 | Nobel Prize listing and attributions (Fruit Fly Biology) | | |
| B8 | Moonwalker stock details: BDSC 79596, CsChrimson, 625 nm, retinal (Discovery Library) | | |
| B9 | Food ingredient roles (yeast, sugar, agar) and the statement that a technician, not the child, cooks it (Grow Your Own) | | |

## C. Simulation honesty and age-appropriateness
| # | Check | Result | Notes |
|---|---|---|---|
| C1 | Every simulation states clearly it is a simulation and does not show real data. | | |
| C2 | Climbing Challenge: random per-fly rule is not presented as real behaviour; no claim about temperature, age or genotype effects. | | |
| C3 | Conference Path A fixed dataset: wording about the hypothesis (18 vs 25 C) makes clear it concerns simulated data only. | | |
| C4 | Microscope optics in the Secret Fly Lab are acknowledged as simplified. | | |
| C5 | No instructions for keeping live animals; handling statements are safe. | | |
| C6 | Lab safety content (PPE, eyewash, spills, glass) matches current school-safety guidance. (A safety professional should confirm.) | | |
| C7 | Anything that could be read as a claim of improved learning, validation, accreditation or standards alignment. | | |
| C8 | Lab Notebook Academy: record-keeping principles are accurate and not presented as legally compliant ELN practice. | | |

## D. References
| # | Check | Result | Notes |
|---|---|---|---|
| D1 | Confirm the full text supports each claim in the verification matrix marked V-ABS (abstract-only). | | |
| D2 | Confirm Miller 2018 (doi:10.1534/g3.118.200021) supports the CyO statements it is cited for. | | |
| D3 | Resolve Haldane 1919 original citation and the Kosambi 1943/1944 year. | | |
| D4 | Add or replace sources for rows marked NONE or UNV in the matrix. | | |

## E. Outcome
[ ] Accurate for the stated audience as is   [ ] Accurate after the fixes listed   [ ] Not recommended for release
Summary of required changes: ______________________________________________
What I did not review: ______________________________________________
Signature / date: ______________

*A completed checklist should be stored with the release (for example in `docs/reviews/`), and the Zenodo description may say "reviewed by" only for the scope actually ticked above.*
