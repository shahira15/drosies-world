# Drosie's World

**An Interactive Educational Software Platform for Entomology and Scientific Inquiry**

Version 1.0.0 (provisional, pending human approval; see [`docs/RELEASE_READINESS_REPORT.md`](docs/RELEASE_READINESS_REPORT.md))

Drosie's World is a collection of free, browser-based educational activities built around *Drosophila melanogaster* (the common fruit fly) and a friendly fly mascot named Drosie. It is a static website: HTML, CSS and vanilla JavaScript, with no build step, no server code of its own and no package dependencies. The live site is at <https://drosiesworld.com>.

> **What this document claims, and what it does not.**
> This README describes what the software *does* (technical functionality). It makes **no claim that the software improves learning**. No formal student learning outcomes have been established, no classroom study has been run, and no independent expert review of the science content has been completed. Statements about "educational objectives" below are *design intentions*, not measured results. See [Limitations](#limitations).

## Contents

1. [Educational objectives (design intentions)](#educational-objectives-design-intentions)
2. [Target audiences](#target-audiences)
3. [Components and scientific simulations](#components-and-scientific-simulations)
4. [Installation and running](#installation-and-running)
5. [Functionality overview](#functionality-overview)
6. [Testing, accessibility and browser support](#testing-accessibility-and-browser-support)
7. [Privacy and external services](#privacy-and-external-services)
8. [Limitations](#limitations)
9. [Repository layout](#repository-layout)
10. [Documentation index](#documentation-index)
11. [Licensing](#licensing)
12. [How to cite](#how-to-cite)
13. [AI-assisted development](#ai-assisted-development)

## Educational objectives (design intentions)

The activities are designed to let learners:

- observe and name the stages of the fruit fly life cycle (egg, larva, pupa, adult);
- practise basic laboratory skills in simulation: lab safety, using a stereomicroscope, recognising anatomy and telling male from female flies;
- practise the *process* of inquiry: making a prediction, repeating a trial, recording data honestly, noticing variation, and separating observation from interpretation;
- explore Mendelian and chromosomal genetics with a simulated fruit fly cross (Punnett squares, X-linkage, linkage and recombination, lethal alleles, chi-square);
- see how scientists communicate (notebooks, abstracts, posters, conferences) in a simulated setting.

These are intentions of the design. They are **not** validated outcomes.

## Target audiences

| Audience | Components designed for them |
|---|---|
| Children about 5 to 8 with a parent or teacher | Storybook, Letters from Drosie, Life Cycle game, Secret Fly Lab, Grow Your Own Fruit Fly |
| Children about 7 to 12 | Climbing Challenge, Lab Notebook Academy, Scientific Conference |
| Middle school, high school and undergraduate students | Drosie Genetics Lab (four levels: Little, Junior, Researcher, University) |
| Teachers, homeschooling parents, outreach educators | Teacher Resources, lesson-plan and activity-sheet downloads, in-app teacher guides |

Age bands are the author's design targets and have not been piloted with learners.

## Components and scientific simulations

All simulations are **simplified models for teaching**. None produces real experimental data. Details and sources are in [`docs/SCIENTIFIC_REFERENCES.md`](docs/SCIENTIFIC_REFERENCES.md) and the complete feature list in [`docs/EDUCATIONAL_FEATURES.md`](docs/EDUCATIONAL_FEATURES.md).

| Component | Entry point | What it simulates |
|---|---|---|
| Drosie Genetics Lab | `drosie-genetics-lab/index.html` | A seeded genetics engine: autosomal and X-linked inheritance, linkage and recombination (no male crossing over), recessive lethals, a simplified CyO balancer, Punnett squares, chi-square tests. Seven real alleles plus one labelled fictional lethal. Has its own automated scientific test suite (58 tests). |
| The Secret Fly Lab | `lab/index.html` | Lab 0 Safety Academy (7 missions) and Lab 1 (stereomicroscope optics with blur, brightness and field of view; anatomy; sex identification; a "Fly Detective" challenge). |
| Life Cycle Adventure | `life-cycle-game.html` | An illustrated walk through egg, larva, pupa and adult with approximate timings at about 25 °C. |
| Grow Your Own Fruit Fly | `grow-your-own-fruit-fly.html` | A virtual culture: prepare food, choose a temperature, watch time-lapse development, write a lab report. Timings are approximate reference values. |
| Climbing Challenge | `climbing-game.html` | A negative-geotaxis "climbing assay" with random simulated flies. Explicitly not real data. |
| Lab Notebook Academy | `lab-notebook-academy.html` | Practice in keeping a trustworthy notebook. Not a validated electronic lab notebook. |
| Scientific Conference | `scientific-conference.html` | A ten-chapter simulated conference: a simulated climbing experiment or the learner's own project, graphing, abstract, poster, practice talk, Q&A, certificate (participation only). |
| Storybook, Letters, Discovery Library, Fruit Fly Biology, Science Activities, Teacher Resources | `storybook.html`, `letters/`, `discoveries.html`, `fruit-fly-biology/`, `science-activities/`, `teacher-resources/` | Reading and reference material, lesson plans and printable sheets. |

## Installation and running

There is nothing to install or build. You need a modern web browser.

**Quickest (most pages):** open `index.html` in a browser. Some pages use `file://`-friendly classic scripts, but others do not.

**Recommended: a local static server** (required for the Genetics Lab, which uses ES modules):

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Any static file server works (for example `npx serve`). Page links assume the site is served from the root of a host.

**Deploying:** the site is designed for GitHub Pages (or any static host). `CNAME` in the repository root is specific to the author's domain and should be removed or changed for other deployments.

**Network note:** a fully offline copy is functional for most activities, but some pages request third-party resources (web fonts, map tiles, analytics; see [Privacy and external services](#privacy-and-external-services)). These degrade gracefully or fail silently when blocked.

**Archival edition (for Zenodo):** a self-contained, offline edition with no third-party requests is built with `python3 tools/build_archive.py` (two variants: `full`, with the original illustrations under the rights described in `ASSET_LICENSES.md`, and `placeholders`, with neutral stand-in images). Differences from the live site are listed in [`docs/ARCHIVAL_EDITION.md`](docs/ARCHIVAL_EDITION.md); the build is reproducible ([`docs/RELEASE_BUILD.md`](docs/RELEASE_BUILD.md)).

## Functionality overview

- **Persistence:** learner progress and preferences are stored in the browser's `localStorage` on the learner's device only; there are reset controls. Backup and restore as JSON, and printable or downloadable outputs (HTML, CSV, print-to-PDF) exist in the Conference and Genetics Lab.
- **Accessibility features** (implemented; not independently audited): skip links, keyboard operation, visible focus, ARIA live announcements, reduced-motion support, high-contrast and larger-text settings, optional browser speech-synthesis narration, text alternatives to charts.
- **Reproducibility:** the Genetics Lab uses a seeded pseudo-random number generator, so the same seed gives the same simulated counts.
- **Honest-science design:** simulations are labelled as simulations; interpretation text avoids "proves"; the Conference includes overclaim detectors; certificates and badges state that they are not official or accredited.

## Testing, accessibility and browser support

Summarised here; actual results, failures and limits are in [`docs/TESTING.md`](docs/TESTING.md). In brief:

- Automated tests: the **Genetics Lab engine** (Node), the **Scientific Conference** (Playwright, 30 scripts) and, new in this release, a **site-wide suite** (`tests/site/`) covering page loading, links, keyboard navigation, mobile layouts, offline operation, an axe-core scan, and functional flows for the Climbing Challenge, Life Cycle Adventure, Grow Your Own, Secret Fly Lab, Notebook Academy, Storybook, Letters, Discovery Library, home page and Genetics Lab UI.
- Browsers: automated runs used **Chromium only**. The suite supports Firefox and WebKit, but those browsers are not installed in the build environment, so they have **not** been run.
- Accessibility: automated axe-core scans plus keyboard tests. **No screen-reader testing, no testing with disabled users, and no WCAG conformance claim**; automated tools find only part of the barriers.

## Privacy and external services

There are no user accounts. The **live website** uses these third-party services (the **archival edition uses none of them**) (details in [`docs/REPOSITORY_AUDIT.md`](docs/REPOSITORY_AUDIT.md)):

- GoatCounter (privacy-oriented analytics): home page, Secret Fly Lab, Discovery Library and Storybook;
- Google Fonts: the shared `styles.css` (used by the home page, Discovery Library, Fruit Fly Biology, Life Cycle Activities, Science Activities, Teacher Resources, Team and 404 pages) and the Letters page;
- Supabase and Cloudflare Turnstile: the home-page visitor-feedback form;
- Leaflet (unpkg CDN) and OpenStreetMap tiles: a map on the home page;
- `page-flip` 2.0.7 (jsDelivr CDN): the Storybook page-turn effect;
- an embedded YouTube (privacy-enhanced domain) video in the Discovery Library.

The Scientific Conference, Genetics Lab, Secret Fly Lab (apart from analytics), Life Cycle, Grow Your Own, Climbing Challenge, and Lab Notebook Academy pages load no other third-party scripts or fonts.

## Limitations

- **No demonstrated educational effectiveness.** No formal student learning outcomes have been established. No pilot, controlled study or classroom evaluation has been conducted. Optional pre/post quizzes in the software are practice tools and, as the software itself states, do not measure learning gains.
- **Simplified, partly stylised science.** Illustrations are diagrams, not photographs. Timings are approximate. The Genetics Lab models 7 real alleles with complete penetrance and no crossover interference, nondisjunction, incomplete dominance or chromosome 4 loci (see `drosie-genetics-lab/docs/MODEL_SPECIFICATION.md` §9).
- **No independent expert review.** The design is literature-informed and technically tested; allele data were compiled from FlyBase by the developer and not independently reviewed. No *Drosophila* geneticist, entomologist or teacher review has been recorded. See [`docs/SCIENTIFIC_VERIFICATION_MATRIX.md`](docs/SCIENTIFIC_VERIFICATION_MATRIX.md) for what is and is not supported.
- **Not standards-aligned** except for informal NGSS/TEKS mappings in the Genetics Lab teacher guide, which are the author's own and unreviewed. The Conference makes no alignment claim.
- **Testing gaps:** single-browser automation, no screen-reader or real-device testing; see the testing document for unresolved failures.
- **English only.** Narration relies on the browser's built-in speech voices, which vary.
- **Safety:** the software does not replace school laboratory rules, adult supervision or training, and does not give instructions for keeping live animals.
- **Rights:** the mascot, character designs, storybook illustrations and branding are not licensed for reuse. See [Licensing](#licensing).

## Repository layout

```
index.html, styles.css, script.js   home page and shared styles
lab/                                The Secret Fly Lab (classic scripts, window.DW)
drosie-genetics-lab/                Genetics Lab (ES modules, engine + tests + docs)
conference-assets/, scientific-conference.html, conference-teacher-guide.html
fly-lab-assets/, grow-your-own-fruit-fly.html
life-cycle-assets/, life-cycle-game.html
climbing-game.html
notebook-academy-assets/, lab-notebook-academy.html
letters/                            Letters from Drosie
storybook.html, book-pages*/        storybook reader and page images (artwork)
science-activities/, teacher-resources/, fruit-fly-biology/, discoveries.html, team.html
tests/conference/                   Playwright test scripts
seo/                                SEO reports and the static checker
docs/                               release, audit and architecture documentation
tools/build_release.py              deterministic release-ZIP builder
```

## Documentation index

| Document | Purpose |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Software architecture |
| [`docs/SCIENTIFIC_REFERENCES.md`](docs/SCIENTIFIC_REFERENCES.md) | Sources per simulation, verification status |
| [`docs/EDUCATIONAL_FEATURES.md`](docs/EDUCATIONAL_FEATURES.md) | Feature inventory |
| [`docs/TESTING.md`](docs/TESTING.md) | Automated, accessibility and browser testing |
| [`docs/REPOSITORY_AUDIT.md`](docs/REPOSITORY_AUDIT.md) | Secrets, personal information, dependencies, unnecessary files |
| [`docs/LICENSING_AUDIT.md`](docs/LICENSING_AUDIT.md) | Per-asset licensing audit |
| [`docs/LICENSING_PROPOSAL.md`](docs/LICENSING_PROPOSAL.md) | **Proposed** (not applied) mixed-license strategy |
| [`docs/AI_DISCLOSURE.md`](docs/AI_DISCLOSURE.md) | AI-assisted development disclosure |
| [`docs/ARCHIVAL_EDITION.md`](docs/ARCHIVAL_EDITION.md) | Archival edition and its differences from the live site |
| [`docs/SCIENTIFIC_VERIFICATION_MATRIX.md`](docs/SCIENTIFIC_VERIFICATION_MATRIX.md) | Concept-by-concept verification of the science |
| [`docs/INDEPENDENT_SCIENTIFIC_REVIEWER_CHECKLIST.md`](docs/INDEPENDENT_SCIENTIFIC_REVIEWER_CHECKLIST.md) | Checklist for an independent reviewer |
| [`docs/LIVE_SITE_PRIVACY_SECURITY_AUDIT.md`](docs/LIVE_SITE_PRIVACY_SECURITY_AUDIT.md) | Live-site privacy/security audit (incl. Supabase RLS requirements) |
| [`docs/PROPOSED_PRIVACY_NOTICE.md`](docs/PROPOSED_PRIVACY_NOTICE.md) | Draft privacy notice for human/legal review |
| [`docs/BOOK_RELATIONSHIP.md`](docs/BOOK_RELATIONSHIP.md) | Verified book record and recommended relation |
| [`docs/COMPONENT_LICENSE_INVENTORY.md`](docs/COMPONENT_LICENSE_INVENTORY.md) | Per-component proposed licensing |
| [`ASSET_LICENSES.md`](ASSET_LICENSES.md), [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | Asset rights and third-party notices |
| [`docs/ZENODO_METADATA_DRAFT.md`](docs/ZENODO_METADATA_DRAFT.md) | Draft Zenodo record text |
| [`docs/RELEASE_BUILD.md`](docs/RELEASE_BUILD.md) | Reproducible build |
| [`docs/RELEASE_READINESS_REPORT.md`](docs/RELEASE_READINESS_REPORT.md) | Issues needing human review |

## Licensing

**No licence has been finalised.** The author's preferred strategy, drafted but **not in effect**:

- **MIT** for eligible reusable software code (`licenses/MIT.PROPOSED.txt`; per-component list in [`docs/COMPONENT_LICENSE_INVENTORY.md`](docs/COMPONENT_LICENSE_INVENTORY.md)).
- The **Drosie's World name and logo, the Drosie mascot and character designs, the storybook illustrations (by Letícia Cavalcanti), photographs, and other protected creative assets are excluded** from that licence. Their rights and terms are documented in [`ASSET_LICENSES.md`](ASSET_LICENSES.md). The author states that artwork rights were obtained from the illustrator; the exact contractual scope still needs human verification. The companion book is CC BY-NC-ND 4.0 on Zenodo (verified).
- Illustrator attribution is preserved; permission to *distribute* artwork is kept distinct from permission to *sublicense* it.
- Third-party material: [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## How to cite

Use the citation hub at [`/cite/`](cite/index.html) (APA, MLA, Chicago, BibTeX, RIS, with copy buttons and downloadable `.bib`/`.ris` files) or [`CITATION.cff`](CITATION.cff). Suggested platform citation (the software DOI has **not** been issued yet and none is shown):

> Arzoo, S. H. (2026). *Drosie's World: An Interactive Educational Software Platform for Entomology and Scientific Inquiry* (Version 1.0.0) [Computer software]. Drosie's World. https://drosiesworld.com

The companion storybook is a separate scholarly output with its own DOI, verified against the Zenodo record: <https://doi.org/10.5281/zenodo.23550876> (see [`docs/BOOK_RELATIONSHIP.md`](docs/BOOK_RELATIONSHIP.md)). The creator's ORCID is intentionally left blank until the author supplies a verified identifier.

## AI-assisted development

The creator conceived the project and directs its scientific and educational development. **ChatGPT** assisted with project conceptualisation, brainstorming, educational content development, simulation specifications, scientific explanations, prompt development, code generation, troubleshooting and feature planning. **Claude Code** assisted with repository-level implementation, interface development, code generation, debugging, testing, documentation and release preparation. Not all code or content was written manually. AI tools are not authors. Details and open confirmations: [`docs/AI_DISCLOSURE.md`](docs/AI_DISCLOSURE.md).

## Contact

Questions and error reports: drosiesworld@gmail.com (the address already published on the site).
