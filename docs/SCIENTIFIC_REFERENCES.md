# Scientific References by Simulation

Prepared 2026-11-24 for the v1.0.0 archival draft.

## How to read this document

**Verification levels used here (only what was actually done):**

- **PubMed-verified**: during this audit the record was retrieved from PubMed (title, authors, journal, year, DOI matched). Full text was **not** read.
- **PubMed-matched**: a PubMed record was located by citation lookup (a PMID was returned) but its metadata was not otherwise inspected.
- **In-repo only**: the source is cited in the repository, but it was not independently checked in this audit (FlyBase records, books, labsheets, safety standards, web pages).
- **Not verified**: a lookup was tried and found nothing, or no lookup was possible.

"Supports" below means the source is relevant to the factual basis of the simulation. It does **not** mean an expert has confirmed that the simulation correctly implements the source. **No independent expert review has been done.**

## Reference list

| ID | Reference | Status |
|---|---|---|
| R1 | Adams MD et al. (2000) The genome sequence of *Drosophila melanogaster*. *Science* 287(5461):2185-2195. doi:10.1126/science.287.5461.2185 (PMID 10731132) | PubMed-verified |
| R2 | Reiter LT, Potocki L, Chien S, Gribskov M, Bier E (2001) A systematic analysis of human disease-associated gene sequences in *Drosophila melanogaster*. *Genome Res* 11(6):1114-1125. doi:10.1101/gr.169101 (PMID 11381037) | PubMed-verified |
| R3 | Hales KG, Korey CA, Larracuente AM, Roberts DM (2015) Genetics on the fly: a primer on the *Drosophila* model system. *Genetics* 201(3):815-842. doi:10.1534/genetics.115.183392 (PMID 26564900) | PubMed-verified |
| R4 | Morgan TH (1910) Sex limited inheritance in *Drosophila*. *Science* 32(812):120-122. doi:10.1126/science.32.812.120 (PMID 17759620) | PubMed-verified |
| R5 | Gargano JW, Martin I, Bhandari P, Grotewiel MS (2005) Rapid iterative negative geotaxis (RING). *Exp Gerontol* 40(5):386-395. doi:10.1016/j.exger.2005.02.005 (PMID 15919590) | PubMed-verified |
| R6 | Nichols CD, Becnel J, Pandey UB (2012) Methods to assay *Drosophila* behavior. *J Vis Exp* (61):3795. doi:10.3791/3795 (PMID 22433384) | PubMed-verified |
| R7 | Hurd TR, Liang FX, Lehmann R (2015) *Curly* encodes dual oxidase... *PLoS Genet* 11(11):e1005625. doi:10.1371/journal.pgen.1005625 | PubMed-matched (PMID 26587980) |
| R8 | Bidaye SS, Machacek C, Wu Y, Dickson BJ (2014) Neuronal control of *Drosophila* walking direction. *Science* 344:97-101. doi:10.1126/science.1249964 | PubMed-matched (PMID 24700860) |
| R9 | Miller DE, Cook KR, Hawley RS et al. (2018) The evolutionary history of *Drosophila* balancer chromosomes, *Genetics* (cited in-repo as PMC5873907) | **Not verified** (citation lookup returned no match; volume/pages not given in repo; check before citing) |
| R10 | Sturtevant AH (1913) The linear arrangement of six sex-linked factors in *Drosophila*. *J Exp Zool* 14:43-59 | In-repo only (pre-PubMed era) |
| R11 | Kosambi DD (1944) *Ann Eugen* 12:172-175; Haldane JBS (1919) *J Genet* 8:299-309 | In-repo only |
| R12 | Lindsley DL, Grell EH (1972) *Genetic Variations of* Drosophila melanogaster; Lindsley DL, Zimm GG (1992) *The Genome of* Drosophila melanogaster | In-repo only |
| R13 | FlyBase (https://flybase.org), release FB2026_01 to FB2026_03 reports for each allele, gene and CyO (IDs recorded in `trait-database.js`) | In-repo only. Not re-queried in this audit. |
| R14 | Bloomington Drosophila Stock Center, stock #79596 (RRID:BDSC_79596); Vilinsky et al. (2018) | In-repo only |
| R15 | Carolina Biological Supply labsheet "Three-Point Linkage with *Drosophila*" (b-vg map distance check) | In-repo only; commercial source, not reviewable here |
| R16 | Safety: American Chemical Society *Safety in the Elementary Science Classroom*; NSTA safety resources; OSHA laboratory standard and eye/face protection; CDC/NIOSH PPE and glove guidance; ANSI/ISEA Z358.1 (eyewash, flush about 15 minutes) | In-repo only (`lab/README.md`). Not reviewed here. |
| R17 | Nobel Prize in Physiology or Medicine laureate listings (1933, 1946, 1995, 2017), nobelprize.org | In-repo only |
| R18 | NGSS performance expectations and Texas TEKS (Biology) used in `drosie-genetics-lab/docs/TEACHER_GUIDE.md` | In-repo only. The repository states only Biology BIO.8.B was verified for TEKS. |

## Per simulation

### 1. Drosie Genetics Lab (`drosie-genetics-lab/`)

Authoritative documents already in the repository: `docs/SCIENTIFIC_REFERENCE.md` (allele table), `docs/MODEL_SPECIFICATION.md`, `docs/QA_REPORT.md`.

| Modelled feature | Basis | Sources |
|---|---|---|
| Allele and gene facts: *y*<sup>1</sup>, *w*<sup>1118</sup>, *Cy*<sup>1</sup>/*Duox*<sup>Cy</sup>, *b*<sup>1</sup>/*Adc*<sup>b-1</sup>, *vg*<sup>1</sup>, *Sb*<sup>1</sup>, *e*<sup>1</sup>; CyO balancer | FlyBase reports (IDs such as FBgn0003996, FBal0018186, FBba0000025 recorded in `trait-database.js`) | R13, R12; R7 for *Curly* = *Duox*; R9 for CyO history |
| X-linked inheritance, hemizygous males, white-eyed F2 pattern | Morgan's classic result | R4 |
| Linkage and recombination; mapping functions; map positions | Sturtevant's linear arrangement; Kosambi and Haldane mapping functions; classical map positions | R10, R11, R12 |
| No meiotic crossing over in males | Standard *D. melanogaster* biology | R12 (and standard textbooks; not independently re-checked here) |
| Recessive lethality, dominant markers, balancer behaviour | FlyBase and Lindsley and Zimm | R13, R12 |
| Chi-square, p-values | Standard statistics; tested against Mendel's 315:108:101:32 data and tabled critical values | internal tests |
| Fictional lethal *l(2)DEMO* | Fictional by design and labelled so | none (not a scientific claim) |

Known simplifications are enumerated in `MODEL_SPECIFICATION.md` §9 (for example no crossover interference, no nondisjunction, complete penetrance). Not yet expert reviewed (`REMAINING_WORK.md`). **Open issue:** the Genetics Lab README describes the simulator as "scientifically validated". That wording is stronger than the evidence (developer self-check, no independent review) and should be revised by the author. See the readiness report.

### 2. The Secret Fly Lab (`lab/`)

| Content | Basis | Sources |
|---|---|---|
| Adult size about 2.5 mm; sex differences (sex combs, abdomen banding, size unreliable alone); about 800 ommatidia per compound eye; red wild-type eyes | Standard *Drosophila* teaching facts as stated in `lab/README.md` | R13 (FlyBase), "standard *Drosophila* teaching guides" (not specified), R3 |
| Lab safety, PPE, eyewash (about 15 minutes), emergency responses | Published safety guidance | R16 |
| Microscope optics (blur, brightness, field of view) | Explicitly simplified model for learning the controls | none (not a scientific claim) |

Pre/post check: documented limits in `lab/README.md` (no control group, tiny samples). The "Safety Scientist" badge is stated in-game to be a game achievement, not a certification.

### 3. Life Cycle Adventure (`life-cycle-game.html`, `life-cycle-assets/`)

Stage timings at about 25 °C stated in the code: embryo about 24 hours; larval stages about 4 days (three instars, two molts); pupa about 4 to 5 days; adult wing expansion a few hours. Complete metamorphosis. Sources: R3 and R13 in general; **no reference is cited on the page itself** for individual numbers. Fruit Fly Biology page says egg to adult is "roughly 9-10 days at about 25 °C" (consistent). Status: in-repo claims only; recommended author action is to attach a specific citation (for example a standard *Drosophila* developmental-timing source) to the numbers.

### 4. Grow Your Own Fruit Fly (`grow-your-own-fruit-fly.html`, `fly-lab-assets/`)

Time-lapse of development with a reference timeline at about 25 °C (about 9-10 days egg to adult); the page states about 19 days at about 18 °C and about 7 days at about 29 °C and calls them "rough". Food ingredient roles (yeast as protein and vitamins, sugar as energy). The temperature figures are **not cited** and were **not verified** in this audit. Recommend author add a source. The lab report text says timings are "approximate reference values".

### 5. Climbing Challenge (`climbing-game.html`)

Basis: negative geotaxis and the climbing (RING) assay concept. Sources: R5, R6 (both PubMed-verified for existence; full texts not read in this or the earlier repository audits). The page states that the flies are drawings with simple random rules, that results are not real, and that real assays standardise conditions. No claim is made about real temperature effects (an earlier repository note records that such a claim would be unverified).

### 6. Scientific Conference (`scientific-conference.html`, `conference-assets/`)

Path A is a fixed simulated climbing-assay dataset (20 simulated flies, two vials; 18 versus 25 °C is a hypothesis about **simulated** data). Cited as examples of climbing assays: R5, R6. Repository notes state that the full texts were not read. The statistics taught are descriptive only (no p-values by design). Fictional scientists, posters and talks are labelled fictional. No standards alignment is claimed.

### 7. Lab Notebook Academy (`lab-notebook-academy.html`)

Teaches general principles of good record keeping (dated entries, raw data, honest corrections). **No references are cited** for these principles in the repository. It states that it is not a validated or legally compliant electronic lab notebook. Recommend the author cite an authoritative source on laboratory notebook practice, or state clearly that the content is the author's professional practice.

### 8. Discovery Library (`discoveries.html`)

Bidaye et al. (R8) for the "Moonwalker" walking-direction research; BDSC stock #79596 (R14); embedded third-party video credited on the page to IMP and Science/AAAS via a YouTube uploader. The page notes that the demonstration stock is not the genotype shown in the 2014 video. Whether the YouTube upload is authorised is a rights question, not a scientific one (see the licensing audit).

### 9. Fruit Fly Biology, Letters, Storybook, Science Activities, Teacher Resources

`fruit-fly-biology/index.html` lists R1, R2, R3, R4, R13, R17 and states facts (about 2-3 mm; four chromosome pairs; roughly 14,000 genes; about 800 ommatidia). Note R1 itself reports "approximately 13,600 genes" at the time of publication, so "roughly 14,000" is a rounded present-day figure; the author may wish to cite a current genome annotation (FlyBase) for that number. The Letters and Storybook pages were not found to cite sources (not exhaustively checked); all of these should be checked against R3 and R13 by the author.

## Citation hygiene findings

1. R9 could not be matched; verify the full citation.
2. R7 and R8 were matched to PMIDs but metadata not reviewed here.
3. Timing figures in simulations 3 and 4 and the facts on simulations 2 and 9 lack per-claim citations.
4. FlyBase release IDs and map coordinates recorded in `drosie-genetics-lab/` were **not** re-verified against FlyBase in this audit.
5. A human domain expert (a *Drosophila* geneticist or entomologist) should review before the release is described as scientifically reviewed.
