# Drosie Genetics Lab

**Breed. Predict. Discover.** A free *Drosophila melanogaster* genetics simulator with a literature-informed design and an automated technical test suite for ages 5 through undergraduate. Part of [Drosie's World](https://drosiesworld.com).

Students choose parent flies from a stock center, breed them, examine offspring under a microscope, predict results with Punnett squares, explore chromosomes and crossing over, and test their data with chi-square. All of it runs on a genetics engine that is independent of the interface and covered by an automated scientific test suite.

## Features
- **Genetics engine** (`js/engine/`): autosomal and X-linked inheritance with male hemizygosity; independent assortment; linkage and recombination from classical map distances (Kosambi, Haldane or linear mapping); **no meiotic crossing over in males**; recessive lethality with separate zygote and adult distributions; a simplified, documented CyO balancer; a FlyBase-style genotype parser and formatter; seeded, reproducible sampling; and chi-square with exact p-values.
- **Real alleles**, compiled from FlyBase records and checked by the developer (not yet independently reviewed): *w*<sup>1118</sup>, *y*<sup>1</sup>, *vg*<sup>1</sup>, *e*<sup>1</sup>, *b*<sup>1</sup> (*Adc*<sup>b-1</sup>), *Cy*<sup>1</sup> (*Duox*<sup>Cy</sup>), *Sb*<sup>1</sup>, plus the CyO balancer. One clearly labelled fictional lethal, *l(2)DEMO*, is used for teaching balancers.
- **Illustrated laboratory** with 8 interactive stations: Fly Stock Center, Breeding Station, Genetics Microscope, Punnett Workbench, Chromosome Explorer, Data Analysis Computer, Research Notebook and Challenge Board. Dr. Maya and Drosie guide the player.
- **Four levels:** Little Geneticist (5–8), Junior (9–12), Researcher (13–17) and University.
- **16 research missions**, each driven by real experiments and graded from the player's own data.
- **Notebook** with printable PDF report (via the browser's print dialog) and CSV export of raw simulated counts.
- **Educator materials:** teacher guide, undergraduate instructor guide, 6 printable worksheets with keys, and classroom links.
- **Accessibility:** keyboard navigation, focus styles, reduced motion, high contrast, text scaling, optional narration, screen-reader announcements, and text alongside every color cue.
- No backend, no accounts, no tracking, no paid services. Optional progress is kept in `localStorage`, with an explicit reset.

## Run locally
ES modules need to be served over HTTP; opening `index.html` directly from disk will not work.
```
cd drosie-genetics-lab
python3 -m http.server 8000      # or: npx serve
# open http://localhost:8000/
```

## Tests
```
node tests/run-tests.mjs         # Node 18+; exits non-zero on any failure
```
You can also open `/tests/` in a browser. The suite (58 tests) separates deterministic analytic checks from large-sample convergence checks. See `docs/QA_REPORT.md`.

## Project layout
```
index.html                 the lab
css/styles.css
js/engine/                 UI-independent genetics engine
  trait-database.js        loci, alleles, balancer, sources
  chromosome-model.js      haplotypes, flies, canonical identity
  genotype-parser.js       FlyBase-style parsing/formatting
  inheritance-models.js    dominance → phenotype, meiotic rules
  recombination.js         mapping functions, gamete haplotypes
  viability.js             lethality, zygote → adult
  genetics-engine.js       gametes, crosses, projections
  simulation.js            seeded PRNG, sampling
  statistics.js            chi-square, p-values, RF estimates
js/phenotype-renderer.js   SVG fly illustrations
js/lab-scene.js            illustrated lab, Dr. Maya, Drosie
js/missions.js             16 missions
js/notebook.js             notebook data, CSV export
js/stocks.js               stock collection
js/ui.js                   app shell, HUD, dialogs, events
js/stations/*.js           one module per station
tests/                     automated scientific test suite
docs/                      reference, model spec, guides, QA report (docs/index.html renders them)
teacher/                   resources hub and printable worksheets
```

## Deploy to GitHub Pages
Copy this folder into a repository (or a subfolder such as `/genetics-lab/`) and enable Pages. `.nojekyll` is included so files are served as-is. All paths are relative. See `docs/INTEGRATION.md`.

## Licence and credits
Original code and artwork for Drosie's World. No photographs or third-party images are used. Scientific data are cited in `docs/SCIENTIFIC_REFERENCE.md`. FlyBase is acknowledged as the source of gene and allele records.
