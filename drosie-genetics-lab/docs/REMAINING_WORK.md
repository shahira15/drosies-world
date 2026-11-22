# Remaining-work manifest

This lists what the brief asked for that is not yet complete or is deliberately limited. Everything not listed here is implemented and tested (see QA_REPORT.md).

## Not yet done
| Item | Status | Suggested next step |
|---|---|---|
| Inspection of the existing Secret Fly Lab source | Not possible from outside: the page is JavaScript-rendered and its sources were not available | Share the repository so the visual style can be matched more closely |
| Recorded voice narration | Narration uses the browser's built-in speech synthesis (optional, off by default) | Record a voice actor for Dr. Maya |
| Sound design | Short synthesized cues (Web Audio), off by default | Commission a sound set |
| Specimen 3D rotation | The viewer rotates and zooms a dorsal illustration in 2D; lateral and ventral views are not drawn | Add lateral/ventral illustration sets |
| PDF export | Via the browser's print dialog ("Save as PDF"); no PDF library | Acceptable for most schools; a client-side PDF library could be added |
| Expert review | Values were checked against FlyBase and primary literature by the developer; no independent Drosophila geneticist has reviewed them yet | Ask a fly-lab PI or FlyBase curator to review SCIENTIFIC_REFERENCE.md |
| Classroom user testing | Not done | Pilot with one class per level; watch Little mode especially |
| Teacher dashboard / class aggregation | Not built (no backend, by design) | Students can export CSV for the teacher to pool |
| TEKS alignment below high school | Only Biology BIO.8.B was verified | Verify grade 3–8 TEKS before listing them |

## Deliberate model limits (documented, not bugs)
No crossover interference; no nondisjunction or XXY/XO flies; balancer recombination completely suppressed; complete penetrance; no viability differences among non-lethal genotypes; no chromosome 4 loci; no incomplete dominance, codominance or multiple-allele series; Curly on vestigial wings is scored as vestigial. See MODEL_SPECIFICATION.md §9.

## Good candidates for the next models
*cn* and *bw* (eye-colour epistasis, giving white eyes in *cn bw*), *Bar* (a duplication with semi-dominance), the attached-X compound *C(1)DX* (Morgan/Bridges-era teaching), *se* or *ru* on chromosome 3 for three-point mapping with *e* and *Sb*, and TM3/TM6B balancers for chromosome 3.
