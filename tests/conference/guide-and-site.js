// Teacher guide page, SEO metadata, sitemap, and that pre-existing pages still load without new console errors.
const { chromium } = require('playwright');
const fs = require('fs');
const { ok, done } = require('./helpers');
const BASE = 'http://localhost:8123/';
(async () => {
  const browser = await chromium.launch();
  async function load(url, w = 1280) { const ctx = await browser.newContext({ viewport: { width: w, height: 800 } }); const page = await ctx.newPage(); const errs = []; page.on('console', (m) => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', (e) => errs.push(e.message)); const r = await page.goto(BASE + url); return { page, errs, status: r.status() }; }
  console.log('teacher guide');
  for (const w of [320, 390, 768, 1280]) { const { page, errs } = await load('conference-teacher-guide.html', w); const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(ov <= 0, 'guide: no horizontal overflow at ' + w + 'px'); if (w === 1280) ok(errs.length === 0, 'guide: no console errors'); await page.close(); }
  { const { page } = await load('conference-teacher-guide.html'); const h = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((e) => e.tagName)); ok(h.filter((x) => x === 'H1').length === 1 && h[0] === 'H1', 'guide: exactly one h1, first'); ok(!h.some((x, i) => i > 0 && parseInt(x[1]) - parseInt(h[i - 1][1]) > 1), 'guide: heading levels do not skip');
    const txt = await page.evaluate(() => document.body.innerText); for (const must of ['simulation', 'not been timed', 'not been tested by people using screen readers', 'does not claim alignment', 'fictional']) ok(txt.toLowerCase().includes(must.toLowerCase()) || txt.includes(must), 'guide states: ' + must);
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h))); let bad = 0; for (const l of links) { const r = await (await browser.newContext()).request.get(BASE + l.replace(/^\//, '')); if (r.status() >= 400) { bad++; console.log('   broken link', l, r.status()); } } ok(bad === 0, 'guide: all ' + links.length + ' internal links resolve'); await page.close(); }
  console.log('conference page SEO');
  { const { page } = await load('scientific-conference.html'); const m = await page.evaluate(() => ({ t: document.title, d: document.querySelector('meta[name=description]').content, c: document.querySelector('link[rel=canonical]').href, h1: document.querySelectorAll('h1').length, ld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent), noscript: document.body.innerText.includes('JavaScript'), about: !!document.querySelector('#about h2'), links: [...document.querySelectorAll('#about a')].map((a) => a.getAttribute('href')) }));
    ok(m.t.includes("Drosie's First Scientific Conference") && m.t.length < 100, 'title descriptive and under 100 chars: ' + m.t.length);
    ok(m.d.length > 80 && m.d.length < 200, 'meta description length ' + m.d.length); ok(m.c === 'https://drosiesworld.com/scientific-conference.html', 'canonical URL');
    ok(m.ld['@type'] === 'LearningResource' && m.ld.isAccessibleForFree === true, 'JSON-LD is a free LearningResource (no invented ratings or reviews)'); ok(!JSON.stringify(m.ld).match(/aggregateRating|review|offers/i), 'JSON-LD contains no rating/review/offer claims');
    ok(m.about && m.links.length >= 5, 'crawlable intro with internal links: ' + m.links.length);
    const html = fs.readFileSync(__dirname + '/../../scientific-conference.html', 'utf8'); for (const t of ['The Conference Invitation', 'Choose Your Research Path', 'The Research Investigation', 'Become a Data Detective', 'The Abstract Studio', 'The Scientific Poster Studio', 'Registration and Preparation', 'The Interactive Conference Hall', 'Present, Discuss, and Revise', 'The Conference Finale']) ok(html.includes(t), 'static (crawlable) HTML names chapter: ' + t);
    await page.locator('#stage').waitFor(); await page.waitForTimeout(200); ok((await page.title()).startsWith("Drosie's First Scientific Conference |"), 'page title stays the static SEO title after the app loads'); await page.close(); }
  const sm = fs.readFileSync(__dirname + '/../../sitemap.xml', 'utf8'); ok(sm.includes('<loc>https://drosiesworld.com/scientific-conference.html</loc>') && sm.includes('conference-teacher-guide.html'), 'sitemap lists both new pages');
  ok((sm.match(/<url>/g) || []).length === (sm.match(/<\/url>/g) || []).length, 'sitemap tags balanced');
  console.log('existing pages unaffected');
  for (const pg of ['index.html', 'lab-notebook-academy.html', 'climbing-game.html', 'science-activities/', 'teacher-resources/', 'grow-your-own-fruit-fly.html', 'life-cycle-game.html', 'storybook.html', 'team.html', 'lab/', 'drosie-genetics-lab/']) { const { page, errs, status } = await load(pg); ok(status === 200 && errs.filter((e) => !/favicon|net::ERR|Failed to load resource/.test(e)).length === 0, pg + ' loads (' + status + ') without script errors' + (errs.length ? ' [' + errs.slice(0, 2).join(' | ') + ']' : '')); await page.close(); }
  { const { page } = await load('index.html'); ok(await page.locator('footer a[href="scientific-conference.html"]').count() === 1, 'home page footer links to the conference'); await page.close(); }
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
