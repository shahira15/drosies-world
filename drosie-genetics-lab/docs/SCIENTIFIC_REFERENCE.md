# Drosie Genetics Lab — Scientific Reference

This document lists every gene, allele and chromosome feature modeled in the simulator, the source of each value, and what is simplified. Engine data live in `js/engine/trait-database.js`; this file is the human-readable copy. Values were checked against FlyBase report pages (releases FB2026_01–FB2026_03) and classical sources in November 2026.

> **Allele ≠ gene.** Every row below is one *specific allele*. For example, `w[1118]` is a particular null allele of the gene *white*. Its properties are not assumed to hold for other *white* alleles.

## 1. Modeled loci and alleles

| Gene (current symbol) | FlyBase gene | Allele used | FlyBase allele | Chromosome / arm | Genetic map | Cytology | Inheritance | Dominance | Phenotype | Viability |
|---|---|---|---|---|---|---|---|---|---|---|
| *yellow* (*y*) | FBgn0004034 | *y*<sup>1</sup> | FBal0018607 | X | 1-0.0 | 1A5 | X-linked | recessive | yellow body, bristles, wings | viable |
| *white* (*w*) | FBgn0003996 | *w*<sup>1118</sup> | FBal0018186 | X | 1-1.5 | 3B6 | X-linked | recessive | white eyes (<1% wild-type red pigment) | viable |
| *Curly* (now *Duox*) | FBgn0283531 | *Cy*<sup>1</sup> = *Duox*<sup>Cy</sup> | FBal0002196 | 2L | 2-6.1 | 23A–23B | autosomal | **dominant** (visible) | wings curved upward | **recessive lethal** |
| *black* (now *Adc*) | FBgn0000153 | *b*<sup>1</sup> = *Adc*<sup>b-1</sup> | FBal0000858 | 2L | 2-48.5 | 34E5–35D1 region | autosomal | recessive | black body | viable |
| *vestigial* (*vg*) | FBgn0003975 | *vg*<sup>1</sup> | FBal0017868 | 2R | 2-67.0 | 49D2–E1 | autosomal | recessive | wings and halteres reduced | viable |
| *Stubble* (*Sb*) | FBgn0003319 | *Sb*<sup>1</sup> | FBal0015145 | 3R | 3-58.2 | 89B | autosomal | **dominant** (visible) | short, thick bristles | **recessive lethal** (chromosome) |
| *ebony* (*e*) | FBgn0000527 | *e*<sup>1</sup> | FBal0003278 | 3R | 3-70.7 | 93C–D | autosomal | recessive | very dark, shiny body | viable |
| *l(2)DEMO* — **FICTIONAL** | — | *l(2)DEMO*<sup>1</sup> | — | 2L | 2-30 (illustrative) | — | autosomal | recessive | none | recessive lethal |

Balancer: **CyO** ("Curly of Oster"), FlyBase FBba0000025. A multiply inverted chromosome 2 carrying *Duox*<sup>Cy</sup>, *cn*<sup>2</sup>, *pr*<sup>1</sup>, *dpy*<sup>lvI</sup>. Only *Cy* is a modeled locus; the other markers are documented but not simulated.

### Notes per allele (what the sources say)

- **w<sup>1118</sup>.** FlyBase describes homozygotes as having white eyes with less than 1% of wild-type red pigment. It is the standard genetic background for transgenesis. FlyBase also documents behavioral and retinal side effects, which are not modeled. Morgan's original 1910 allele was *w*<sup>1</sup>, not *w*<sup>1118</sup>; missions note this.
- **Cy<sup>1</sup> / Duox<sup>Cy</sup>.** Hurd, Liang & Lehmann (2015, *PLoS Genet* 11:e1005625; FBrf0230212) showed that *Curly* mutations are alleles of *duox* (Dual oxidase). They also showed that ubiquitous *duox* expression restores viability of homozygous *Curly* mutants. FlyBase lists the allele as *Duox*<sup>Cy</sup> (G1505C; 2L:2,816,443, Release 6). The simulator treats the phenotype as fully penetrant. In reality expressivity varies with rearing conditions, and FlyBase notes the phenotype can be suppressed under some conditions.
- **b<sup>1</sup> / Adc<sup>b-1</sup>.** *black* is now *Adc* (Acidic amino acid decarboxylase, FBgn0000153), an aspartate 1-decarboxylase. The *b*<sup>1</sup> lesion is a frameshift plus Y348H and is expected to be enzymatically inactive. Classical location 2-48.5 (Lindsley & Grell 1972). Newly eclosed flies are hard to score; color darkens with age.
- **vg<sup>1</sup>.** Insertion of a 412 transposable element. FlyBase lists the recombination map position as 2-67. NCBI Gene gives 2R:12,884,201..12,899,385 (Release 6). Weak dominant effects are reported in some sensitized backgrounds; these are not modeled.
- **Sb<sup>1</sup>.** Sb/+ bristles are less than half normal length and thicker (Red Book). Most *Sb* alleles are homozygous viable. The *Sb*<sup>1</sup> chromosome is homozygous lethal, probably because of a second, linked lethal mutation (FlyBase personal communication FBrf0077943). The simulator therefore treats lethality as a property of the *Sb*<sup>1</sup> chromosome.
- **e<sup>1</sup>.** Insertion of a 412 element in exon 2. Classical location 3-70.7; FlyBase recombination map 3-71; Release 6 coordinates 3R:21,229,839..21,237,177. FlyBase notes that many stock-center stocks labelled *e*<sup>1</sup> are probably *e*<sup>4</sup>.
- **y<sup>1</sup>.** Mutation of the ATG start codon. The iso-1 reference-genome strain carries *y*<sup>1</sup>. Reduced male mating success is documented but not modeled.

## 2. Chromosomes

| Chromosome | Modeled? | Notes |
|---|---|---|
| X (1) | yes | Acrocentric. Males are hemizygous (one X). |
| 2 (2L, 2R) | yes | Metacentric autosome. Centromere drawn near 2-55 (approximate). |
| 3 (3L, 3R) | yes | Metacentric autosome. Centromere drawn near 3-47 (approximate). |
| 4 (dot) | shown, no loci | Tiny; essentially no meiotic recombination. |
| Y | yes (no loci) | Required for male fertility. **Does not determine sex in *Drosophila*.** |

Arm lengths shown in the physical-map view (Release 6, approximate): X ≈ 23.5 Mb, 2L ≈ 23.5, 2R ≈ 25.3, 3L ≈ 28.1, 3R ≈ 32.1, 4 ≈ 1.35 Mb. Gene coordinates appear only where they were checked. *y* has no coordinate shown, and *w* is marked approximate.

## 3. Drosophila-specific biology built into the engine

1. **No meiotic crossing over in males.** Standard *D. melanogaster* male meiosis is achiasmate. The engine never produces recombinant gametes from a male, whatever his genotype (tested).
2. **Sex determination.** In *Drosophila*, sex is set by the X:autosome ratio, not the Y chromosome. XXY flies are female and XO flies are sterile males. The simulator models only XX females and XY males, and the interface says so.
3. **Linkage testcrosses use heterozygous females** (consequence of 1).
4. **Balancers** suppress recovery of crossover chromosomes and carry dominant markers plus recessive lethality. The simplified model is described in MODEL_SPECIFICATION.md §6.

## 4. Primary sources

- FlyBase gene/allele/balancer reports listed above (https://flybase.org).
- Hurd TR, Liang FX, Lehmann R (2015) *Curly* encodes dual oxidase, which acts with heme peroxidase Curly Su to shape the adult *Drosophila* wing. *PLoS Genet* 11(11): e1005625.
- Miller DE, Cook KR, Hemenway EA, Fang V, Miller AL, Hales KG, Hawley RS (2018) The molecular and genetic characterization of second chromosome balancers in *Drosophila melanogaster*. *G3* 8(4):1161-1171. doi:10.1534/g3.118.200021 (PMID 29420191; PMC5873907) — molecular breakpoints and mutations of the second-chromosome balancers SM1, SM5, CyO and SM6a. *Citation corrected 2026-11-24:* an earlier version of this file gave the wrong title and journal. The abstract was checked via PubMed; the full text was not read here, so this reference is not yet confirmed to support the specific list of CyO markers (*Cy*, *cn*<sup>2</sup>, *pr*<sup>1</sup>, *dpy*<sup>lvI</sup>) given above. Confirm that list against FlyBase FBba0000025.
- Lindsley DL, Grell EH (1972) *Genetic Variations of* Drosophila melanogaster; Lindsley DL, Zimm GG (1992) *The Genome of* Drosophila melanogaster ("Red Book").
- Morgan TH (1910) Sex limited inheritance in *Drosophila*. *Science* 32:120–122.
- Sturtevant AH (1913) The linear arrangement of six sex-linked factors in *Drosophila*, as shown by their mode of association. *J Exp Zool* 14:43–59.
- Kosambi DD (1944) The estimation of map distances from recombination values. *Ann Eugen* 12:172–175. Haldane JBS (1919) *J Genet* 8:299–309.
- Carolina Biological Supply, "Three-Point Linkage with Drosophila" labsheet (b–vg 18.5 map units from 48.5 and 67.0).

## 5. Fictional content

Only **l(2)DEMO** is fictional. It is a placeholder for "any recessive lethal on chromosome 2", used to teach balancer stock maintenance, and it is labelled fictional everywhere it appears. No fictional traits are used in Little Geneticist mode; children see real alleles described in plain words.
