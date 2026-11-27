# Archival Edition of Drosie's World (v1.0.0, provisional)

This folder is a **self-contained archival edition** of the Drosie's World website, prepared for permanent deposit. It is built from the project's source repository by `tools/build_archive.py`; the live website's source files are not modified by that build.

## How to use it
- **Open `index.html`** in a modern browser, or serve the folder with any static server (`python3 -m http.server`). Links are relative, so it works from `file://` and from any folder.
- **The Drosie Genetics Lab** (`drosie-genetics-lab/index.html`) uses ES modules, which browsers block on `file://`. Serve the folder over HTTP for that one activity.
- No internet connection is needed. **The edition makes no network requests to any third party** (verified by automated tests with every external host blocked; see `docs/TESTING.md`).
- No data you type or generate leaves your device. Progress is stored only in your browser's local storage.

## Which edition is this?
See the first line of `ARCHIVAL_EDITION.md` at the archive root:
- **Full edition**: includes the original storybook illustrations and mascot/character images, **under the rights and attribution described in `ASSET_LICENSES.md`**. Those images are *not* open-licensed by this archive; the contractual scope of the author's rights must be verified before upload.
- **Placeholder edition**: every illustration is replaced by a neutral generated placeholder of the same size, so layouts and functionality are identical but no protected artwork is included. (The characters drawn in JavaScript code remain; see `docs/COMPONENT_LICENSE_INVENTORY.md`.)

## Differences from the live website

| Area | Live website | Archival edition |
|---|---|---|
| Visitor feedback form ("Wall of Love") | Submits to a Supabase backend, protected by Cloudflare Turnstile, and shows approved reviews | **Removed.** A notice explains it is disabled. No Supabase URL, key or Turnstile key is present. |
| Analytics and visit counter | GoatCounter script on four pages; visitor counter fetched from GoatCounter | **Removed.** (The in-app event helper is inert without the script.) |
| Outreach map and adult-contact form | Leaflet from a CDN with OpenStreetMap tiles; a `mailto:` form | **Removed** (replaced by a notice). |
| Fonts | Google Fonts requested on shared pages and the Letters page | **Removed.** System font fallbacks are used, so type looks slightly different. |
| Storybook page-turn library | `page-flip` 2.0.7 from jsDelivr | **Vendored copy** in `vendor/page-flip/` (MIT; see `THIRD_PARTY_NOTICES.md`). |
| Discovery Library video | YouTube embed | **Text notice and a plain link** to the original (clicking it leaves the archive). |
| Team page portraits | Photographs of the author and the illustrator | **Neutral silhouette placeholders.** Personal photographs are never included. |
| Certificate download | `Certificate.pdf` (made in Canva, contains character artwork) | Full edition: included. Placeholder edition: a neutral blank certificate. |
| Links | Root-absolute (`/lab/`) | **Relative** (`lab/index.html`) so the folder works from any location |
| Notice banner | none | A short banner on the home page states this is the archival edition |
| Domain files | `CNAME` | Omitted |
| Full-size master images (about 70 MB) | In the repository | **Omitted** (not used by any page; the web-sized copies the pages use are kept in the full edition) |
| `canonical` and structured-data URLs | Point to drosiesworld.com | **Unchanged** (they are metadata, not requests); they identify the live site |
| Letters narration | Optional recorded audio is absent by design; the browser's speech voice reads the letter | Same |

Everything else is identical: all simulations, calculations, simulated data, printables, teacher guides, tests and documentation.

## What is NOT in this archive
Portraits; full-size image masters; QA screenshots; deployment configuration. The list of every excluded or replaced file is in `EXCLUDED_AND_REPLACED_FILES.txt`; the SHA-256 of every file is in `RELEASE_MANIFEST.txt`.

## Licensing in this archive
No licence has been finalised. `licenses/MIT.PROPOSED.txt` is a **proposal** for the software code only. Names, logo, mascot, character designs, storybook illustrations and photographs are **not** covered. Read `ASSET_LICENSES.md`.

## Known limitations
Educational effectiveness has not been studied; no student learning outcomes have been established. Automated tests ran on Chromium only. See `docs/TESTING.md` and `docs/RELEASE_READINESS_REPORT.md`.
