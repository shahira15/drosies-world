# 4. Prioritized 90-day growth plan

Principle: measure first, expand second. Every action below is tied to Search Console evidence once it is available. No ranking improvement should be assumed before then.

## Days 0–14: ship and verify
- Review and merge this PR; confirm GitHub Pages deploys.
- In Settings → Pages confirm custom domain `drosiesworld.com` and **Enforce HTTPS**; spot-check `https://www.drosiesworld.com` redirects to the apex.
- Submit the updated `sitemap.xml` in Search Console; request indexing for `/fruit-fly-biology/`, `/teacher-resources/`, `/science-activities/`.
- Check Page indexing report for each sitemap URL; record which are "Discovered/Crawled – not indexed".
- Run URL Inspection → "View crawled page" on `/lab/` and `/drosie-genetics-lab/` to confirm the new text is seen.
- Check PageSpeed Insights (mobile) for `/`, `/lab/`, `/fruit-fly-life-cycle-activities/`; log LCP/CLS/INP field data if shown.
- Decide about the missing letter audio files (`/letters/assets/audio/`).

## Days 15–45: fill the strongest gaps (opportunities #1, #4, #2)
- Publish "Why do scientists use fruit flies?" (consolidate and link; keep other pages short on that topic).
- Publish the printable life cycle worksheet page with a PDF.
- Publish the anatomy page with labelled diagram (SVG + alt text + printable).
- Add each new page to the sitemap and link from hubs, home and the relevant game.
- Add `BreadcrumbList` to older pages as they are touched.

## Days 46–75: scientific skills and grades (#3, #5, then #6)
- Scientific method page built on the Climbing Challenge and Grow Your Own Fruit Fly.
- K–2 activities page.
- Text version of the storybook with discussion questions (confirm publication rights for text and illustrations).
- Coordinate "lab notebook" content with the Lab Notebook Academy owner before publishing anything that overlaps.

## Days 76–90: learn and adjust
- Pull Search Console queries (Performance → Queries / Pages) for the period; compare actual queries with the keyword map; move primary assignments if a different page is winning impressions.
- Rewrite titles/descriptions for pages with impressions but low click-through.
- Prune or merge any page with no impressions after 60 days.
- Earn real links: submit to teacher resource directories, university outreach pages, the Zenodo record and the Instagram profile; ask partner organizations on the team page to link back. Do not buy links.
- Decide whether to start #9, #11, #14 based on data.

## Ongoing
Quarterly: run `python3 seo/tools/seo_check.py`, review Core Web Vitals, update "last reviewed" dates only when content is actually reviewed.
