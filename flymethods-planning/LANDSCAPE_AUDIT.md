# Landscape Audit

Tags: [V] verified via search snippet this session · [U] background knowledge, unverified · [A] assumption · [BLOCKED]. See README.

## 1. Drosophila-specific resources

| Resource | What it documentably offers | Relevance |
|---|---|---|
| **FlyBase** | Bulk downloads incl. synonyms file; current release shown as FB2026_01 (12 Mar 2026) [V: https://flybase.org/downloads/bulkdata, https://wiki.flybase.org/wiki/FlyBase:FilesOverview]. Its antibody page is mostly **links** to vendors/collections (DSHB, GeneTex, MilliporeSigma, US Biological…), a community-review site (pAbmAbs), BioCompare, BenchSci, CESA; lab-made antibodies appear per gene under "Stocks and Reagents → Antibody Information" [V: https://wiki.flybase.org/wiki/FlyBase:Antibodies]. | Gene/synonym/FBgn authority. Not a per-paper antibody-usage-parameter resource as far as seen. |
| **DSHB (Univ. Iowa)** | Searchable catalog; Drosophila-filtered listings of ~290–297 products (counts vary by page/filter); entries give name, gene, antigen, AB_ registry ID; some entries show images from papers [V: https://dshb.biology.uiowa.edu/collections/drosophila-antigens]. | Ideal seed catalogue: Drosophila-centric, RRID-bearing. Per-use parameters not documented here. |
| **Würzburg Hybridoma Library** | ~200 antibodies vs Drosophila brain, described in the literature [V search hit: https://pmc.ncbi.nlm.nih.gov/articles/PMC3244249 — not read in full]. | Niche collection. |
| **FlyBase Community / Fly Board** | Fly Board = community-representation group; Community Advisory Group has run user surveys (e.g., Fly Lab List survey Nov 2023, 274 responses) [V: https://wiki.flybase.org/wiki/FlyBase:Fly_Board, https://wiki.flybase.org/wiki/FlyBase:Community_Advisory_Group]. FlyBase user survey 2012 exists [V: https://flybase.org/commentaries/2012_03/FlyBase_user_survey.html]. | Channel for needs-assessment and beta-testing. Contents of surveys regarding antibodies **not read**. |
| **Harvard FGR protocols portal / Perrimon-lab resources** | A Drosophila protocols portal (beta) and protocol lists exist [V search hit: https://fgr.hms.harvard.edu/protocols]. | Protocol-level, curated lists; not antibody-usage extraction. Not read in depth. |
| **Alliance of Genome Resources** | No evidence found of antibody/RRID integration for Drosophila [V negative-result: searched, nothing found — absence of evidence only]. | Possible future integration partner. |

## 2. General antibody / reagent resources

| Resource | Documented facts |
|---|---|
| **Antibody Registry** | Issues RRIDs (AB_…); vendor catalogues are submitted by companies/curators; does not offer direct API — index access via SciCrunch/FDI Lab; individual records retrievable as .json/.xml [V: https://antibodyregistry.org/faq, https://pmc.ncbi.nlm.nih.gov/articles/PMC9825422]. |
| **CiteAb** | Self-described antibody search engine, results ranked by citations; website terms restrict copying/re-selling [V: https://citeab.com/terms]. Drosophila-specific coverage **unverified**. |
| **Antibodypedia** | Portal for antibody/antigen validation data [V: https://pubmed.ncbi.nlm.nih.gov/18667413/]. Drosophila coverage [U: likely minimal]. |
| **pAbmAbs** | Nonprofit, community reviews (positive and negative), Aarhus-origin; reviews contain vendor, catalogue, assay, dilution [V: https://newsroom.au.dk/en/news/show/artikel/dansk-database-vil-goere-forskning-reproducerbar, https://pabmabs-astro.pages.dev/about — the second domain's identity with the original service is unconfirmed]. Current activity level/size **unknown**. |
| **BenchSci** | Listed by FlyBase as an "AI literature screen for antibodies" [V: FlyBase antibodies page]. Commercial; capabilities beyond that **not verified**; do not assume. |
| **BioCompare** | Listed by FlyBase [V]. Vendor-product comparison [U]. |

## 3. Literature-mining and rigor tools

- **Europe PMC RRID integration (May 2026):** RRIDs from SciCrunch attached to articles, searchable, shown in SciLite, retrievable via the Annotations API; claims enrichment even where authors did not structure RRIDs [V: https://www.rrids.org/news/2026/5/21/from-text-to-traceability-rrid-integration-in-europe-pmc]. **This is the closest existing infrastructure to our step 1 (article↔antibody).** It does not, from what was seen, provide dilutions/buffers/tissues.
- **SciLite:** text-mined annotation display on full-text articles; limited to licence types CC0/CC BY/CC BY-NC per the 2017 paper [V: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5527546/].
- **SciScore:** NER-based rigor/RRID checker for authors and journals; detects antibody entities in methods and "identifiability" [V search hits: https://pmc.ncbi.nlm.nih.gov/articles/PMC7644557, https://pmc.ncbi.nlm.nih.gov/articles/PMC8189493]. Whether its output is openly queryable by gene/organism **unverified**.
- **Antibody Watch:** text-mining of antibody *specificity* problems, F-score >0.914 on a 2,223-paper feasibility set [V: https://arxiv.org/pdf/2008.01937]. Relevant to our "usage ≠ validation" distinction.
- **Protocol-extraction datasets (research-grade):** BioPIE (protocol IE of reagents/materials/devices) [V: https://arxiv.org/html/2601.04524v1]; BioProBench (27K protocols, 556K instances, protocol understanding rather than parameter extraction from papers) [V: https://arxiv.org/html/2505.07889v3]. Neither is Drosophila/antibody-usage specific as far as seen.

## 4. Protocol repositories

- **protocols.io:** site code of conduct states all published content is CC-BY; individual Drosophila protocols (e.g., drug feeding, fly model protocols collection) exist [V: https://www.protocols.io/code-of-conduct]. API terms/rate limits **unverified**.
- **Bio-protocol, JoVE, Nature Protocols, Springer "Drosophila: Methods and Protocols"** [U/partly V]: curated protocols; licensing varies; JoVE/Springer largely not reusable. Not an antibody-usage index.

## 5. Bibliographic infrastructure (see DATA_SOURCES_AND_LICENSING.md)

Europe PMC, PMC (OA subset, BioC, OAI-PMH, cloud service), Crossref, OpenAlex — all verified at snippet level; details and conflicts in that file.

## 6. GitHub / published software / discontinued projects

**Not audited in this pass.** No GitHub search was run (GitHub search goes through `gh api search/code`; deferred to Phase 1b). Discontinued-project discovery (e.g., defunct antibody portals) is **open**. We make no claim that no similar repository exists. Action: scripted GitHub + Zenodo + bioRxiv + Bioinformatics/NAR-database-issue search with a logged query list (see DEVELOPMENT_ROADMAP Phase 0).

## 7. NER / structured extraction methods (state of knowledge)

- [U] Biomedical NER models (BioBERT/PubMedBERT-family, scispaCy, PubTator-style tools) handle genes/species/cell lines; reagent-specific NER (antibody vendor/catalogue/dilution) is typically rule+ML hybrid (the SciScore approach is NER-based [V]).
- [U] Dilutions (`1:500`, `1/500`, `1 µg/ml`), catalogue numbers, RRIDs, and "(Vendor, #cat)" patterns are highly regular → deterministic extraction is a strong baseline.
- [U] The hard parts: antibody-to-experiment linking across sentences, species disambiguation, synonyms, supplement/figure-legend placement, tables.
- Needs literature review before final method choice (Phase 4 task); no benchmark specific to Drosophila antibody usage found [V negative-result].

## 8. What this audit did **not** establish

- No primary-API calls (Europe PMC blocked). No measurement of how many Drosophila papers report catalogue numbers/RRIDs/dilutions.
- No read of FlyBase's actual terms page (conflicting indirect evidence).
- No usability data for competitors; capabilities of commercial tools beyond public descriptions are unknown.
