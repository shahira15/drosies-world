/**
 * Drosie Genetics Lab — Trait database
 * --------------------------------------------------------------
 * Every real locus/allele below was checked against FlyBase report pages
 * (releases FB2026_01–FB2026_03) and classical sources (Lindsley & Grell 1972;
 * Lindsley & Zimm 1992 "Red Book"). See docs/SCIENTIFIC_REFERENCE.md.
 *
 * Conventions
 *  - mapPosition: classical recombination (genetic) map position, centimorgans.
 *  - physical: Release 6 genome coordinates where verified; null when not verified.
 *  - An allele is NOT the same as a gene: each mutant allele has its own record.
 *  - Fictional/illustrative entries are flagged with `illustrative: true`.
 */

export const CHROMOSOMES = {
  X: { id: 'X', label: 'X (chromosome 1)', arms: ['X'], mapLength: 68, sex: true,
       physicalMb: { X: 23.5 }, note: 'Acrocentric. Males carry one X (hemizygous).' },
  '2': { id: '2', label: 'Chromosome 2', arms: ['2L', '2R'], mapLength: 108, centromereCM: 55,
       physicalMb: { '2L': 23.5, '2R': 25.3 }, note: 'Metacentric autosome.' },
  '3': { id: '3', label: 'Chromosome 3', arms: ['3L', '3R'], mapLength: 106, centromereCM: 47,
       physicalMb: { '3L': 28.1, '3R': 32.1 }, note: 'Metacentric autosome.' },
  '4': { id: '4', label: 'Chromosome 4 (dot)', arms: ['4'], mapLength: 0, physicalMb: { '4': 1.35 },
       note: 'Tiny "dot" chromosome; essentially no meiotic recombination. No loci modeled.' },
  Y: { id: 'Y', label: 'Y chromosome', arms: ['Y'], mapLength: 0,
       note: 'In Drosophila the Y does NOT determine maleness (the X:autosome ratio does); Y is needed for male fertility.' }
};

/** Modeled chromosomes, in conventional genotype-writing order. */
export const MODELED_CHROMOSOMES = ['X', '2', '3'];

export const LOCI = {
  y: {
    symbol: 'y', name: 'yellow', currentGeneSymbol: 'y', fbgn: 'FBgn0004034',
    chromosome: 'X', arm: 'X', mapPosition: 0.0, cytology: '1A5', physical: null,
    trait: 'body', wildPhenotype: 'wild-type (tan) body pigment',
    alleles: {
      'y+': { id: 'y+', wild: true },
      y1: { id: 'y1', display: 'y[1]', fbal: 'FBal0018607', dominance: 'recessive',
            phenotype: 'yellow body', viability: 'viable',
            notes: 'Start-codon (ATG) mutation; the iso-1 reference-genome strain carries y1. Adults lack black pigment in body, wings, bristles. y1 males show reduced mating success with wild-type females (not modeled).' }
    },
    sources: ['https://flybase.org/reports/FBgn0004034', 'https://flybase.org/reports/FBal0018607']
  },
  w: {
    symbol: 'w', name: 'white', currentGeneSymbol: 'w', fbgn: 'FBgn0003996',
    chromosome: 'X', arm: 'X', mapPosition: 1.5, cytology: '3B6', physical: 'X: ~2.79–2.80 Mb',
    trait: 'eye', wildPhenotype: 'red eyes',
    alleles: {
      'w+': { id: 'w+', wild: true },
      w1118: { id: 'w1118', display: 'w[1118]', fbal: 'FBal0018186', dominance: 'recessive',
               phenotype: 'white eyes', viability: 'viable',
               notes: 'Null deletion allele; homozygotes/hemizygotes have <1% of wild-type red pigment. Standard background for transgenesis. Has documented behavioural and retinal side effects (not modeled).' }
    },
    sources: ['https://flybase.org/reports/FBal0018186']
  },
  Cy: {
    symbol: 'Cy', name: 'Curly', currentGeneSymbol: 'Duox', fbgn: 'FBgn0283531',
    chromosome: '2', arm: '2L', mapPosition: 6.1, cytology: '23A–23B', physical: '2L:2,816,443 (Duox[Cy] point mutation)',
    trait: 'wings', wildPhenotype: 'flat wings',
    alleles: {
      'Cy+': { id: 'Cy+', wild: true },
      Cy1: { id: 'Cy1', display: 'Cy[1]', currentSymbol: 'Duox[Cy]', fbal: 'FBal0002196', dominance: 'dominant',
             phenotype: 'Curly (upward-curved) wings', viability: 'recessive-lethal',
             notes: 'Classical "Cy1" is now Duox[Cy]: a G1505C missense change in Dual oxidase (Hurd, Liang & Lehmann 2015, PLoS Genet 11:e1005625). Dominant visible wing phenotype; homozygotes are not viable (ubiquitous duox expression restores viability). Expressivity varies with rearing conditions; modeled as fully penetrant.' }
    },
    sources: ['https://flybase.org/reports/FBal0002196', 'https://flybase.org/reports/FBgn0283531', 'https://doi.org/10.1371/journal.pgen.1005625']
  },
  'l(2)DEMO': {
    symbol: 'l(2)DEMO', name: 'demonstration recessive lethal (fictional)', currentGeneSymbol: null, fbgn: null,
    chromosome: '2', arm: '2L', mapPosition: 30.0, cytology: null, physical: null, illustrative: true,
    trait: 'none', wildPhenotype: 'no visible effect',
    alleles: {
      'l(2)DEMO+': { id: 'l(2)DEMO+', wild: true },
      'l(2)DEMO1': { id: 'l(2)DEMO1', display: 'l(2)DEMO[1]', fbal: null, dominance: 'recessive',
                     phenotype: 'none (heterozygotes look wild type)', viability: 'recessive-lethal', illustrative: true,
                     notes: 'FICTIONAL teaching allele standing in for "your favourite recessive lethal mutation on chromosome 2". Its map position (2-30) is illustrative only.' }
    },
    sources: []
  },
  b: {
    symbol: 'b', name: 'black', currentGeneSymbol: 'Adc', fbgn: 'FBgn0000153',
    chromosome: '2', arm: '2L', mapPosition: 48.5, cytology: '34E5–35D1 region', physical: '2L: ~13.82 Mb (Adc[b-1] lesion)',
    trait: 'body', wildPhenotype: 'grey/tan body',
    alleles: {
      'b+': { id: 'b+', wild: true },
      b1: { id: 'b1', display: 'b[1]', currentSymbol: 'Adc[b-1]', fbal: 'FBal0000858', dominance: 'recessive',
            phenotype: 'black body', viability: 'viable',
            notes: 'black is now Adc (Acidic amino acid decarboxylase, an aspartate 1-decarboxylase). b1 = Adc[b-1]: frameshift + Y348H; expected to be enzymatically inactive. Darkening increases with age; newly eclosed flies are hard to score.' }
    },
    sources: ['https://flybase.org/reports/FBal0000858', 'Lindsley & Grell 1972 p.22 (location 2-48.5)']
  },
  vg: {
    symbol: 'vg', name: 'vestigial', currentGeneSymbol: 'vg', fbgn: 'FBgn0003975',
    chromosome: '2', arm: '2R', mapPosition: 67.0, cytology: '49D2–E1', physical: '2R:12,884,201..12,899,385',
    trait: 'wings', wildPhenotype: 'full-length wings',
    alleles: {
      'vg+': { id: 'vg+', wild: true },
      vg1: { id: 'vg1', display: 'vg[1]', fbal: 'FBal0017868', dominance: 'recessive',
             phenotype: 'vestigial wings', viability: 'viable',
             notes: 'Insertion of a 412 transposable element. Wings and halteres reduced. Some dominant enhancement is reported in specific sensitized backgrounds (not modeled).' }
    },
    sources: ['https://flybase.org/reports/FBgn0003975', 'https://flybase.org/reports/FBal0017868']
  },
  Sb: {
    symbol: 'Sb', name: 'Stubble', currentGeneSymbol: 'Sb', fbgn: 'FBgn0003319',
    chromosome: '3', arm: '3R', mapPosition: 58.2, cytology: '89B', physical: '3R:16,116,161..16,145,284',
    trait: 'bristles', wildPhenotype: 'long thin bristles',
    alleles: {
      'Sb+': { id: 'Sb+', wild: true },
      Sb1: { id: 'Sb1', display: 'Sb[1]', fbal: 'FBal0015145', dominance: 'dominant',
             phenotype: 'Stubble (short, thick) bristles', viability: 'recessive-lethal',
             notes: 'Sb/+ bristles are less than half normal length and thicker. Sb1 chromosomes are homozygous lethal, but most Sb alleles are homozygous viable; the lethality of Sb1 is probably due to a second, linked lethal mutation (FBrf0077943). Modeled here as a recessive-lethal property of the Sb1 chromosome.' }
    },
    sources: ['https://flybase.org/reports/FBgn0003319', 'https://flybase.org/reports/FBal0015145', 'https://flybase.org/reports/FBrf0077943']
  },
  e: {
    symbol: 'e', name: 'ebony', currentGeneSymbol: 'e', fbgn: 'FBgn0000527',
    chromosome: '3', arm: '3R', mapPosition: 70.7, cytology: '93C–D', physical: '3R:21,229,839..21,237,177',
    trait: 'body', wildPhenotype: 'tan body',
    alleles: {
      'e+': { id: 'e+', wild: true },
      e1: { id: 'e1', display: 'e[1]', fbal: 'FBal0003278', dominance: 'recessive',
            phenotype: 'ebony (very dark) body', viability: 'viable',
            notes: 'Insertion of a 412 element in exon 2. Ebony links beta-alanine to dopamine/histamine. FlyBase notes many stock-centre "e1" stocks are probably e4. Visual-system effects not modeled.' }
    },
    sources: ['https://flybase.org/reports/FBgn0000527', 'https://flybase.org/reports/FBal0003278', 'Lindsley & Grell 1972 (location 3-70.7)']
  }
};

/**
 * Balancer chromosomes (University mode). Explicitly simplified — see MODEL_SPECIFICATION.md.
 */
export const BALANCERS = {
  CyO: {
    id: 'CyO', name: 'Curly of Oster', fbba: 'FBba0000025', chromosome: '2',
    /** alleles the balancer carries at MODELED loci (all other modeled loci are wild type) */
    alleles: { Cy: 'Cy1' },
    realMarkers: 'Duox[Cy], cn[2], pr[1], dpy[lvI] (cn2, pr1 and dpy[lvI] loci are not modeled)',
    notes: 'Multiply inverted chromosome 2 (In(2LR)O superimposed on In(2L)Cy + In(2R)Cy). Suppresses recovery of crossover chromosomes across chromosome 2. Dominant marker Curly; CyO/CyO is lethal.',
    sources: ['https://flybase.org/reports/FBba0000025', 'https://flybase.org/reports/FBab0004786', 'Miller et al. 2018 G3 8:1161 (PMC5873907)']
  }
};

/** Helpers */
export function lociOn(chrom) {
  return Object.values(LOCI)
    .filter(l => l.chromosome === chrom)
    .sort((a, b) => a.mapPosition - b.mapPosition);
}
export function wildAllele(locusSymbol) {
  return Object.values(LOCI[locusSymbol].alleles).find(a => a.wild).id;
}
export function alleleRecord(locusSymbol, alleleId) {
  const L = LOCI[locusSymbol];
  if (!L) throw new Error(`Unknown locus ${locusSymbol}`);
  const a = L.alleles[alleleId];
  if (!a) throw new Error(`Unknown allele ${alleleId} at ${locusSymbol}`);
  return a;
}
export function locusOfAllele(alleleId) {
  for (const L of Object.values(LOCI)) if (L.alleles[alleleId]) return L.symbol;
  return null;
}
