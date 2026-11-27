# Relationship Between the Software and the Book

## 1. The book record, verified live

Retrieved from the Zenodo API on **2026-11-24** (`https://zenodo.org/api/records/23550876`):

| Field | Value on the record |
|---|---|
| Title | Drosie, the Fruit Fly |
| Resource type | Book |
| Version | 1.0 |
| Publication date | 2026-10-22 |
| DOI / concept DOI | 10.5281/zenodo.23550876 / 10.5281/zenodo.23550875 |
| Creator | Arzoo, Shahira (Texas Tech University); the record lists an ORCID for the creator (not copied into this repository; see below) |
| Contributor | Cavalcanti, Letícia (type "Other") |
| Licence / access | **CC BY-NC-ND 4.0** / open access |
| Related identifiers on the record | `https://drosiesworld.com/` **isSupplementedBy** (so the book record already presents the website as a supplement to the book) |
| Files | one PDF (about 26 MB) |
| Keywords | Children's science education; STEM education; Biology outreach; Science communication; Insect life cycle; Children's literature; Informal science education; Elementary science education |

The DOI in this repository (`index.html` "Download Free PDF", the citation hub, `CITATION.cff`) matches the record. **ORCID:** the repository's metadata leaves the creator ORCID blank, as instructed, until the author supplies the identifier to use. (The book record shows one; the author should confirm it is the one wanted for the software record.)

## 2. Is the software "supplementary material"?

The book is a children's story. The software is an independent interactive platform with its own simulations, tests, teacher resources and release history. The two share a character, a brand and an author. The software:
- includes an online **reader for the book** and uses the book's illustrations (full edition) and lesson plans that follow its chapters, **but**
- contains substantial content that does not depend on the book (a genetics engine, a conference simulator, a safety academy, and so on).

So the software is best described as **a distinct scholarly output that references and builds on the book**, not as the book's appendix. The book record's own `isSupplementedBy` link to the website is a statement the author made about the book; it does not oblige the software record to use the reciprocal.

## 3. Relation options (DataCite / Zenodo vocabulary)

| Relation (software record to the book DOI) | Meaning | Fit |
|---|---|---|
| **references** (recommended) | The software cites or draws on the book as a source | Accurate and neutral: the reader displays the book, lessons follow it, but neither depends on the other for existence |
| isSupplementTo | The software is supplementary to the book | Overstates dependency; contradicts "distinct output" |
| isDerivedFrom | The software was derived from the book | Not accurate for most components |
| isCompiledBy / compiles | A compiled work | Not applicable |
| isDocumentedBy | The book documents the software | Not accurate |
| isRelatedTo (if offered by the current Zenodo form) | Generic relatedness | Safe fallback if `references` is not wanted; weaker information |
| requires | The software requires the book | Inaccurate: it runs without it (placeholder edition) |

**Recommendation:** on the software record, use **`references`** with resource type *Publication: Book* pointing to `10.5281/zenodo.23550876`. This is what `.zenodo.json` now contains. The choice is the author's; the vocabulary offered in the Zenodo form should be checked at upload time, as it can change.

**Reciprocal link (optional, later):** once the software DOI exists, the book record could add **`isReferencedBy`** (or keep its existing `isSupplementedBy` website link). Editing the book's related identifiers does not require a new version of the PDF, but it changes a published record, so it needs the author's decision.

## 4. Citation practice

- Cite the **book** (DOI above) for the story and illustrations; cite the **platform** (and its software DOI once issued) for the software. The citation hub (`/cite/`) presents them separately.
- The illustrations in the full-edition archive are by Letícia Cavalcanti and remain subject to the terms in `ASSET_LICENSES.md`; the book's own licence on Zenodo is CC BY-NC-ND 4.0.
