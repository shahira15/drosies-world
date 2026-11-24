# AI-Assisted Development Disclosure

Status: **DRAFT for the author's confirmation.** Updated 2026-11-24 with the author's description of each tool's contribution. Items still marked **[AUTHOR TO CONFIRM]** could not be established from the repository.

## Summary

Drosie's World was conceived and is directed by its creator, **Shahira Helal Arzoo**, who directs the scientific and educational development of the platform and is responsible for its content. Generative AI tools assisted at several stages. **Not all code and content was written by hand**, and no statement in this repository should be read as saying that it was. The tools are not authors and are not listed as creators in `CITATION.cff`, `.zenodo.json` or the citation hub.

| Tool | Vendor | Contribution (as described by the author) |
|---|---|---|
| **ChatGPT** | OpenAI | Project conceptualisation; brainstorming; educational content development; simulation specifications; scientific explanations; prompt development; code generation; troubleshooting; feature planning. |
| **Claude Code** (model "Claude Sonnet 5.5") | Anthropic | Repository-level implementation; interface development; code generation; debugging; testing; documentation; release preparation. |

The author's description is the source for the ChatGPT row; the repository cannot confirm which files or passages ChatGPT produced. The Claude Code row is consistent with git history (below).

## Evidence in the repository

- **Git history:** 31 commits authored as "Claude" (noreply@anthropic.com) before this release-preparation work, most with a `Co-Authored-By: Claude Sonnet 5.5` trailer and a `Claude-Session` URL, between 2026-11-23 and 2026-11-24. They cover SEO work and hub pages; the redesign of the Climbing Challenge, Life Cycle Adventure and Grow Your Own Fruit Fly; the Lab Notebook Academy; the Scientific Conference and its 34 test scripts; storybook reader changes and image optimisation.
- Many other commits are authored by the repository owner, often as bulk uploads ("Add files via upload"). For these, the generating tool cannot be determined from history. Based on style alone (not proof), the Genetics Lab, the Secret Fly Lab, Letters from Drosie and the Discovery Library appear to have been developed with AI assistance. **[AUTHOR TO CONFIRM which tool(s) and which sessions produced each.]**
- **This release-preparation work** (2026-11-24, in the pull request that adds this file): Claude Code drafted the documentation, metadata, audits, citation hub, archival-edition build script, automated tests and the small defect fixes the tests exposed (listed in the readiness report). The author directed the scope and supplied decisions and confirmations (for example the illustrator-rights statement and the descriptions above).

## Where AI involvement matters for users and reviewers

1. **Source code and tests** may contain defects that AI-assisted authorship did not prevent. New automated tests in this release found and led to fixes of several previously undetected defects (see `docs/TESTING.md`).
2. **Scientific content**: explanations, quiz items, timings, allele data and reference lists were developed with AI assistance and then checked by the author. **No independent expert has reviewed them.** During this release preparation, citations were checked against PubMed and Crossref (abstract level) and the results, including discrepancies found, are in `docs/SCIENTIFIC_VERIFICATION_MATRIX.md`. AI assistance is not a substitute for expert review, and the verification matrix lists claims that remain unsupported.
3. **Artwork**: interface art (laboratory scenes, microscope, fly diagrams, icons) is inline SVG written in code, including AI-assisted code. The Drosie and Dr. Maya characters drawn in code (`lab/js/art/chars.js`, `drosie-genetics-lab/js/lab-scene.js`) are marked as placeholder art in the code. The storybook illustrations and the raster mascot images are credited to the human illustrator, Letícia Cavalcanti, and the author states that rights were obtained from her. **[AUTHOR TO CONFIRM that no illustration was generated with an AI image tool and that no raster image came from a stock or AI library (for example Canva).]**
4. **Audio**: sound effects are synthesised in code with the Web Audio API; narration uses the browser's speech synthesis. No AI-generated audio files are in the repository.
5. **Authorship and copyright**: how copyright applies to AI-assisted code and text varies by jurisdiction. Human direction, selection, editing and responsibility are documented here so a reader can judge. Legal review is recommended before relying on any ownership statement.

## Statement for the author to confirm

> The creator conceived the project and directs its scientific and educational development. ChatGPT assisted with project conceptualisation, brainstorming, educational content development, simulation specifications, scientific explanations, prompt development, code generation, troubleshooting and feature planning. Claude Code assisted with repository-level implementation, interface development, code generation, debugging, testing, documentation and release preparation. Not all code or content was written manually. The creator reviewed and is responsible for the released work. **[AUTHOR TO CONFIRM the sentence "The creator reviewed...", including the extent of review per component.]**

## Data and privacy note

The software makes no calls to any AI service at runtime and sends no learner data to an AI provider.

## Where this disclosure is repeated

`README.md`, `CITATION.cff` (not as authors), `.zenodo.json` description, the `/cite/` page, and `docs/ZENODO_METADATA_DRAFT.md`.
