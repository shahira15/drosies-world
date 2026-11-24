# Live Website Privacy and Security Audit (drosiesworld.com)

Audit date: 2026-11-24. **Scope:** the live website's architecture as shown by the repository source (the archival edition is separate; it has no external services and is verified by tests, see `docs/TESTING.md`).

**Method and limits.** Source review and pattern searches only. **No requests were sent to the live Supabase project, Cloudflare, GoatCounter or the production domain**, because probing a production backend is the owner's decision. Everything said about the server side below is therefore a *requirement or hypothesis to be tested by the owner*, not a finding about what is configured. This is **not a legal opinion** and makes no claim of compliance with COPPA, FERPA, GDPR, UK GDPR or any other law; a qualified privacy professional must review.

## 1. Data-flow inventory (live site)

| # | Flow | Trigger | Data leaving the browser | Recipient | Where in source | Control / issue |
|---|---|---|---|---|---|---|
| 1 | Feedback submission | Visitor submits the home-page form | role, rating, free-text comment, optional country, Turnstile token; plus the visitor's IP and headers (inherent) | Supabase Edge Function `submit-drosie-feedback` | `index.html` `DROSIE_FEEDBACK_CONFIG` | Client warns "don't include children's names"; moderation before display (per page text). Server rules unknown (section 2). |
| 2 | Approved feedback display | Page load | IP/headers only | Supabase REST `rest/v1/drosie_feedback` with the public key | same | Needs RLS and column limits (section 2). Rendering uses `textContent` (safe against HTML injection). |
| 3 | Bot check | Page load | Cloudflare Turnstile loads, collects browser signals | Cloudflare | `index.html` | Third-party script on a children's site; privacy terms apply. |
| 4 | Visit counter | Page load (home) | IP/headers; reads `TOTAL.json` | GoatCounter | `index.html` | Public counter endpoint. |
| 5 | Analytics events | Page and activity events | Page path, event name, title; `track.js` states Do-Not-Track is respected and no names or scores are sent | GoatCounter | `index.html`, `lab/`, `discoveries.html`, `storybook.html` | Vendor claims cookie-less and anonymous counting; **not verified here**. Quiz events send category-level results only per page text. |
| 6 | Fonts | Page load | IP, user-agent, referrer | Google Fonts | `styles.css` `@import`; `letters/index.html` | Avoidable by self-hosting. |
| 7 | Map library and tiles | Page load (home) | IP, user-agent, referrer; viewed tile coordinates | unpkg (Leaflet, SRI-pinned), OpenStreetMap tile servers | `index.html` | Avoidable; OSM tile policy applies. |
| 8 | Page-flip library | Storybook load | IP, user-agent, referrer | jsDelivr | `storybook.html` | **No SRI hash.** |
| 9 | Video embed | Discovery Library load | IP, cookies per YouTube's no-cookie mode | YouTube | `discoveries.html` | Loads on page view (`loading="lazy"`); a click-to-load facade would avoid early contact. |
| 10 | Outreach-contact form | Visitor presses submit | Adult email, role, city, country, activity text | **Not sent to a server.** Builds a `mailto:` link to `drosiesworld@gmail.com`; the visitor's mail app sends it | `index.html` map section | Good design (no hidden transmission). The form text says "no submission is automatic". |
| 11 | Local storage | Using activities | Progress and preferences on the visitor's device only (keys: `dw.*`, `drosie-*`, `drosieConference.v1`, `drosie-genetics-lab:v1`, ...) | none | various | Resettable; the Conference includes a personal-information guard on name-like fields. |

## 2. Supabase feedback pipeline: what must be true (row-level security checklist)

The browser holds a **publishable (anon) key**, which is public by design. Security therefore rests entirely on database rules and the Edge Function. The owner should verify each item in the Supabase dashboard and by the tests in section 3.

**Row-level security (RLS) requirements for `public.drosie_feedback` (and any related table):**
1. **RLS enabled** on every table in an exposed schema. A table without RLS is fully readable and writable through the REST API with the public key.
2. **No write access for `anon` or `authenticated`:** no INSERT, UPDATE or DELETE policies. Submissions must go only through the Edge Function, which uses the **service-role key from the function's secret environment** (never in client code or this repository; history was scanned and none was found).
3. **Read access only to approved rows:** a SELECT policy for `anon` of the form `USING (approved = true)`.
4. **Column-level exposure:** RLS limits *rows*, not columns. If the table holds anything beyond `role, rating, comment, country, created_at` (for example id, email, IP, hashed IP, user-agent, Turnstile token, moderation notes, timestamps of approval), anon must not be able to select it. Prefer a **view** (for example `public.approved_feedback`, created with `security_invoker` and exposing only the five public columns), `REVOKE ALL` on the base table from `anon`, and `GRANT SELECT` on the view only; or use column-level `GRANT SELECT (role, rating, comment, country, created_at)`. The current client query already requests only those five columns, but the **client filter is not a security control**; a visitor can request any column or any row.
5. **`approved` defaults to `false`** and only an admin role (or the dashboard) can set it true.
6. **No table or function exposes the moderation or contact data** to `anon` (check every other table in the project, storage buckets, and database functions callable as RPC).
7. **Defaults:** make sure new tables default to RLS-on; review "exposed schemas" and remove any not needed.

**Edge Function requirements (`submit-drosie-feedback`):**
- Verify the Turnstile token **server-side** with the secret key (siteverify), including that it has not been replayed and, if configured, that the hostname/action match.
- **Validate every field on the server:** `role` against an allow-list, `rating` integer 1-5, `comment` and `country` length limits, strip control characters; reject unexpected properties. Client `maxlength` is not enforced by attackers.
- **Rate limit** by IP/token; the client's 60-second wait is bypassable.
- **CORS:** restrict `Access-Control-Allow-Origin` to the production origin(s).
- **Do not log** full bodies containing children's information; set a retention period.
- Consider server-side screening for likely personal data (email addresses, phone numbers) and reject with a message.
- Treat comments as untrusted when moderators view them (dashboard, email, spreadsheets): do not render as HTML.

**Potential data exposure if the above is not in place:** reading unapproved or hidden columns; mass-posting spam or abusive content under the public key; storing identifying data that visitors typed despite the warning; leaking service-role key through logs. None of these has been observed; none has been ruled out.

## 3. Tests the owner can run against their own project (not run here)

Using only the public key, each of these should be **refused or return nothing**:
1. `GET /rest/v1/drosie_feedback?select=*` returns only approved rows and only the public columns (no id/email/ip/etc.).
2. `GET /rest/v1/drosie_feedback?approved=eq.false` returns an empty list.
3. `POST /rest/v1/drosie_feedback` with a row, and `PATCH`/`DELETE` with a filter, return 401/403 (not 201/204).
4. `POST /functions/v1/submit-drosie-feedback` with a missing, invalid or reused Turnstile token fails; oversized comment fails; invalid `role` fails; more than N requests per minute from one IP is throttled.
5. `GET /rest/v1/` (OpenAPI document) and other tables/RPCs expose nothing unintended; run Supabase's security advisor ("RLS disabled", "exposed view", "function search_path").
6. Cross-origin request from an unrelated origin is blocked by CORS.

## 4. Other findings

| Severity | Finding | Recommendation |
|---|---|---|
| Medium | **Privacy statements are inconsistent with what the live pages do.** The Secret Fly Lab said "We do not collect anything about you" (reworded in this branch to "No names or personal information collected") while analytics and a visit counter operate. The old root README (replaced) said the site uses no analytics. Pages using `styles.css` request Google Fonts; some say "No personal information is collected" (true for the page's own forms, not for the font request). | Adopt one accurate privacy notice (draft: `docs/PROPOSED_PRIVACY_NOTICE.md`), link it from the footer, and align per-page claims. |
| Medium | No privacy notice or retention policy exists for the feedback form. | Publish the notice; define how long feedback is kept and how to ask for deletion. |
| Medium | Several third parties receive visitors' IPs on a children's education site (Google Fonts, unpkg, jsDelivr, OSM, Cloudflare, YouTube, GoatCounter, Supabase). | Self-host fonts and libraries (the archival edition already does for page-flip); load the map and video only on user action; keep analytics minimal. |
| Low-Medium | **No Content-Security-Policy.** GitHub Pages cannot set HTTP headers, but a `<meta http-equiv="Content-Security-Policy">` can restrict script/connect sources. | Add a meta CSP once third parties are minimised. |
| Low | page-flip loaded from jsDelivr **without SRI**; Leaflet has SRI. | Use the vendored copy or add an integrity hash. |
| Low | `innerHTML` is used widely (232 occurrences). Spot checks show values pass through an escape helper (`esc`/`DC.esc`) and the Conference has robustness and personal-information tests; **a complete XSS review was not performed.** Backup/restore imports JSON from a user-chosen file into local state. | Targeted review of every `innerHTML` that includes stored or imported values; fuzz the restore path. |
| Low | URL parameters (`?mode=`, `&mission=`, `&demo=` in the Genetics Lab; `?legacy=1` in the Conference) are read by scripts. | Confirm they are validated against allow-lists (not reviewed in detail). |
| Info | No `eval`, `new Function`, `document.write`, `postMessage`, WebSocket or XHR in shipped code. All `target="_blank"` links reviewed by pattern carry `noopener`. | None. |
| Info | Publishable key, Turnstile site key and Supabase URL are in the repository by design; no service-role or secret key was found in the tree or history (pattern scan; no dedicated scanner was available). | Run a secret scanner before deposit. |
| Info | `team.html` and structured data publish the author's and illustrator's names, affiliation and social links (author-chosen). | Obtain consent for the illustrator's details. |

## 5. Children's data considerations (for professional review)

The site is aimed at children aged 5 to 12 and at educators. The software itself asks for no names or accounts. Points for privacy counsel: whether the feedback form and analytics count as collecting personal information (IP addresses are personal data under several laws); whether parental-consent rules apply to a feedback form aimed at "parents, teachers and visitors" on a children's site; data-processing agreements with Supabase and others; data location; retention and deletion; whether a cookie/consent banner is needed in target jurisdictions (the site sets no cookies of its own, but third parties may); school procurement privacy questionnaires. **No compliance claim is made.**

## 6. Priority actions

1. Verify RLS and the Edge Function with the section 3 tests; fix anything that fails.
2. Publish a reviewed privacy notice and align the statements on pages.
3. Remove avoidable third-party requests from child-facing pages (fonts, CDN scripts, embeds).
4. Add SRI/vendor remaining scripts and a meta CSP.
5. Run a secret scanner on the repository and history.
