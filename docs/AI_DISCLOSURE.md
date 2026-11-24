# AI-Assisted Development Disclosure

Status: **DRAFT for author review.** Items marked **[AUTHOR TO CONFIRM]** could not be established from the repository and must be completed by the human author before deposit.

## Summary

Drosie's World was developed with the assistance of generative AI tools. The tools identified by the author are:

| Tool | Vendor | Role |
|---|---|---|
| **ChatGPT** | OpenAI | Development assistance by the author's account. Specific models, dates and scope: **[AUTHOR TO CONFIRM]**. Nothing in the git history identifies ChatGPT output, so this disclosure cannot say which files it touched. |
| **Claude** (including Claude Code, model "Claude Sonnet 5.5") | Anthropic | Code, documentation and test authoring in agentic coding sessions. Identifiable from git history (see below). |

AI tools are **not authors** of this work and are not listed as creators in `CITATION.cff` or `.zenodo.json`. The human author selected the project goals, directed the work, reviewed or accepted the changes, and is responsible for the content, including its scientific accuracy and licensing.

## Evidence in the repository (Claude)

Git history (`git log`) as of 2026-11-24 contains 31 commits whose author is "Claude" (noreply@anthropic.com), most with a `Co-Authored-By: Claude Sonnet 5.5` trailer and a `Claude-Session` URL. They cover, between 2026-11-23 and 2026-11-24:

- SEO work (sitemap, robots, structured data, the `seo/` reports and `seo/tools/seo_check.py`), the Science Activities, Fruit Fly Biology and Teacher Resources hub pages, the 404 page;
- redesign or rebuild of the Climbing Challenge, Life Cycle Adventure and Grow Your Own Fruit Fly pages (`climbing-game.html`, `life-cycle-*`, `fly-lab-assets/`, `grow-your-own-fruit-fly.html`);
- Drosie's Lab Notebook Academy (`lab-notebook-academy.html`, `notebook-academy-assets/`);
- the ten-chapter Scientific Conference (`scientific-conference.html`, `conference-assets/`, `conference-teacher-guide.html`) and its 34 test scripts in `tests/conference/`;
- storybook reader changes and WebP image optimisation (`book-pages-web/`);
- the documentation files created for this release preparation (everything listed in the README's documentation index plus `README.md`, `CITATION.cff`, `.zenodo.json`, `tools/build_release.py`).

The remaining commits are authored by the repository owner (many titled "Add files via upload" or "Update index.html"). Some components were committed in bulk by upload, so their generating tool cannot be determined from history. Based on file content only (not proof), `drosie-genetics-lab/`, `lab/` (The Secret Fly Lab), `letters/` and `discoveries.html` look machine-assisted in style, for example `lab/README.md` describes itself with a "QA actually run" section and `drosie-genetics-lab/docs/QA_REPORT.md` references Playwright runs. **[AUTHOR TO CONFIRM which tool produced each of these.]**

## Where AI involvement is likely to matter to users and reviewers

1. **Source code and tests.** AI-written code can contain defects. Tests exist only for the genetics engine and the conference module; see `docs/TESTING.md`.
2. **Scientific content.** Text, quiz items, timings, allele data and reference lists were produced or compiled with AI help. The author, a doctoral researcher working with *Drosophila*, is responsible for checking them. The repository records that allele data were checked against FlyBase by the developer and that **no independent expert has reviewed** them (`drosie-genetics-lab/docs/REMAINING_WORK.md`). During this release preparation, citations were checked for existence against PubMed (see `docs/SCIENTIFIC_REFERENCES.md`); full texts were not read.
3. **Artwork.** The README and code state that interface art (laboratory, microscope, fly diagrams, icons) is inline SVG written in code, and `lab/README.md` states that Drosie and Dr. Maya in the Secret Fly Lab are "TEMP ART" vector placeholders. Whether any raster artwork was AI-generated is **[AUTHOR TO CONFIRM]**. The storybook illustrations are credited to the human illustrator named on `team.html`; the author should confirm that no AI image generation was used for them, and record the answer here.
4. **Audio.** Sound effects and music are synthesised with the Web Audio API in code; narration uses the browser's speech synthesis. No AI-generated audio files are in the repository.

## Human oversight statement (to be confirmed by the author)

**[AUTHOR TO CONFIRM]** Suggested wording once true: "The author reviewed all AI-assisted code, text and scientific claims before release, verified references against primary sources, and takes responsibility for the content."

## Release-preparation work in this branch

The files added for the v1.0.0 archival preparation (documentation, metadata, audit reports and the build script) were drafted by Claude (Claude Code, Claude Sonnet 5.5) at the author's request, based on an audit of the repository on 2026-11-24. Scientific references were checked for existence through PubMed lookups during that session. Automated test results quoted in `docs/TESTING.md` were produced by running the repository's own tests in that session; nothing was estimated.

## Data and privacy note

The software contains no calls to any AI service at runtime. No learner data is sent to an AI provider.
