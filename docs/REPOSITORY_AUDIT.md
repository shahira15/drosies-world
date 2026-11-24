# Repository Audit: Secrets, Personal Information, Dependencies, Unnecessary Files

Audit date: 2026-11-24. Scope: all 388 tracked files at commit `b3707ac` (plus this branch's additions) and the full git history. Method: manual review plus pattern searches (text files) and metadata inspection (images, PDFs, DOCX). **No dedicated secret-scanning tool (gitleaks, trufflehog) was available in the environment**, so absence of findings is evidence, not proof. Recommend the owner runs one before deposit (the GitHub secret-scanning feature can also be used).

## 1. Secrets and credentials

| Finding | Location | Assessment |
|---|---|---|
| No private keys, cloud access keys (`AKIA...`), GitHub tokens (`ghp_`), `sk-` style API keys, bearer tokens, passwords or `service_role` keys found in the working tree or in the patch history searched | all text files, all commits (pattern search) | No action. The only history hit for `service_role` is a code comment: "PUBLIC configuration only. Never paste a service_role or secret key here." |
| Supabase **project URL** (`azhzxspojxihdrenjakb.supabase.co`) and **publishable key** `sb_publishable_...` | `index.html` lines about 577-578 | Designed to be public (browser-side). **Not a secret by design, but it is a live credential for a backend that will be permanently archived.** Safe only if row-level security and the Edge Function enforce access (review needed; not testable here). Consider whether the archived software should include the live endpoint. See readiness item S-1. |
| Cloudflare Turnstile **site key** `0x4AAAA...` | `index.html` | Public by design. Same archival consideration. |
| GoatCounter site code `drosiesworld` | several pages | Public identifier. Archived copies would send counts to the live site if served; consider documenting or neutralising for forks (S-2). |

## 2. Personal information

| Finding | Location | Assessment / recommendation |
|---|---|---|
| Author full name, affiliation (Texas Tech University, doctoral researcher), biography, LinkedIn URL, Google Scholar ID, Instagram handle | `team.html`, JSON-LD in several pages, `index.html` | Author-published and intended to be public. Metadata in CITATION.cff uses the same name and affiliation. Author to confirm they want the affiliation in a permanent record. |
| Illustrator full name (Letícia Cavalcanti), Instagram handle, portrait photograph | `team.html`, `illustrator.jpeg` | Third-party person. Written consent for permanent archival of name and photo is **not documented**. The photo is excluded from the release ZIP. |
| Photograph of the author | `shahira-photo.png`, `images/shahira-photo-900.webp` | Excluded from the release ZIP; author's own decision. |
| Public contact email `drosiesworld@gmail.com` | `index.html` (`CONTACT_EMAIL`) | Intended public contact. Used in README. |
| Author's personal email in git commit metadata (`shahira15 <...@gmail.com>`) and Claude commit trailers with session URLs | git history only | Not in the working tree and not in the release ZIP. If the **GitHub repository itself** is archived or forked, history is exposed. The owner may wish to confirm GitHub's noreply-address setting. |
| `Certificate.pdf` metadata: Author "Arzoo, Shahira", creator Canva, Canva design IDs in keywords | `Certificate.pdf` | Excluded from the ZIP. |
| DOCX metadata: creator `python-docx`, no personal names | three `.docx` files | None found. |
| Activity-sheet PDFs: author "(anonymous)", producer ReportLab | `lesson-*.pdf` | None found. |
| Image metadata | 170 raster images checked | 57 carry EXIF/XMP blocks. **No GPS coordinates**, no camera serial or author names found in the one XMP block inspected in detail (creation timestamps only). Not every XMP block was read. |
| Test fixtures with fake emails (`me@example.com`, `me@x.com`) | `tests/conference/*.js` | Test inputs for the personal-information guard; not real addresses. |
| Container paths with session identifiers (`/tmp/claude-0/.../7dc5b43f-...`) | `tests/conference/m6.js`, `m9.js`, `exports.js`, `robustness.js`, `vx-m6.js`; `conference-progress.md` | Not personal data but environment-specific noise and a portability defect. Recommend replacing with `os.tmpdir()` or an environment variable. |
| Visitor feedback form (rating, role, optional country, free-text comment) | `index.html`; backend Supabase table `drosie_feedback` | The form tells users not to include personal information and publishes entries only after review. It transmits to a third-party backend. **No privacy notice or data-retention policy was found in the repository for it**, and the older README claims the site "does not collect personal information, use analytics, or require an account", which is now inaccurate. Human/legal review needed (S-3). |
| Children's data | all activities | Activities store only in the browser. The software does not ask for names (the Conference offers a nickname with a personal-information guard). Whether COPPA/GDPR-K/FERPA considerations apply to the feedback form and analytics has **not** been assessed; legal review recommended. |

## 3. Dependencies

### Runtime (loaded by the browser at use time, none vendored)

| Dependency | Version | Used by | Licence (per the project; not re-verified here) | Notes |
|---|---|---|---|---|
| Leaflet | 1.9.4 via unpkg, with SRI hashes | `index.html` | BSD-2-Clause | Undeclared in any manifest; SRI present. |
| OpenStreetMap tile service | n/a | `index.html` | Data ODbL; attribution given; tile usage policy applies | Heavy use needs a compliant tile provider. |
| page-flip (StPageFlip) | 2.0.7 via jsDelivr | `storybook.html` | MIT | **Not documented anywhere before this audit; no SRI hash.** |
| Google Fonts: DM Sans, Nunito (home and shared pages); Caveat, Cormorant Garamond, Lora (Letters) | CSS API | `styles.css`, `letters/index.html` | SIL Open Font License (as distributed by Google Fonts) | Visitors' IPs go to Google; some jurisdictions treat this as a privacy issue. Self-hosting would remove the call. |
| GoatCounter script | hosted `gc.zgo.at` | four pages | service; script licence not checked | |
| Cloudflare Turnstile | hosted | `index.html` | service terms | |
| Supabase REST/Edge Function | hosted | `index.html` | service terms | |
| YouTube iframe (nocookie) | hosted | `discoveries.html` | service terms; video is third-party content | |

### Development and test only (undeclared; no lockfile)
Node.js 18+ (22 used), Playwright with Chromium, axe-core (installed ad hoc), Python 3 (static server; `seo_check.py` uses only the standard library as far as inspected). `drosie-genetics-lab/package.json` declares no dependencies. **Recommendation:** add a root `package.json` (private) listing devDependencies `playwright` and `axe-core` with versions, or document them as in `docs/TESTING.md`.

### No vendored third-party code
No `node_modules`, minified third-party libraries or copied snippets with licence headers were found. (A header search was done; copied code without a header cannot be ruled out. Several files were generated with AI assistance; see `docs/AI_DISCLOSURE.md`.)

## 4. Unnecessary, stray or misleading files

| File / folder | Issue | Release-ZIP treatment | Suggested repository action |
|---|---|---|---|
| `Virtual lab` | 1-byte stray file | excluded | delete |
| `book-pages/gitkeep` | stray placeholder (`.gitkeep` misspelt); inside an excluded folder | excluded | delete |
| `drosie.png.png` | double extension, 3.9 MB duplicate-style raster | excluded | rename or delete |
| `book-pages/*.png` (56 files, about 55 MB) and `book-pages-web/*.webp` | two copies of the storybook; PNG originals are not used by the pages (WebP are) | excluded | decide whether originals belong in the code repository (Git LFS or separate storage) |
| Root PNGs (`drosie *.png`, `drosie-book-cover.png`, `fruit bowl.png`, `my-microscope.png`) | large originals; web-optimised copies exist under `images/` | excluded | same |
| `README.md` (old) | starter-kit text referenced files (`assets/drosie-mascot.svg`, a book PDF) that do not exist and claimed no analytics | replaced in this branch (history retains it) | n/a |
| `CNAME` | deployment configuration | excluded | keep in the website repo |
| `docs/conference-visual/screens/` (20 PNGs, 3 MB) | QA screenshots | excluded | optional |
| `conference-progress.md`, `conference-visual-progress.md` | internal agent work logs with environment paths | included (documentation of history) | consider moving to `docs/history/` |
| `seo/*.md` | SEO strategy and reports; not software | included | optional |
| `drosie-genetics-lab/README.md` | says `.nojekyll` is included; **it is not in the repository** | included | add `.nojekyll` or correct text (matters if deploying that folder alone) |
| `all-activity-sheets.zip` | derived duplicate of seven PDFs | included | keep (it is a site download) or generate at build |
| `.gitignore` | none present | n/a | add (node_modules, OS files) |

## 5. Documentation accuracy issues found

1. Old root README: wrong file references and the privacy statement mentioned above (replaced).
2. `drosie-genetics-lab/README.md`: "scientifically validated" overstates a developer self-check; `.nojekyll` claim is wrong.
3. `drosie-genetics-lab/docs/QA_REPORT.md` reports 16/16 mission runs whose script is not in the repository; unreproducible here.
4. `lab/README.md` lists "QA actually run" sections that were not re-run here.
5. Several progress documents claim "nothing merged or deployed" at the time written; they are historical.

## 6. Audit limitations

Pattern-based search; no dedicated scanner; images and PDFs were sampled for metadata, not exhaustively read; third-party licence statements are from general knowledge of those projects and were not re-checked against their repositories; no legal review.
