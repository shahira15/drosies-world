// Discoverability: nav link, Science Activities + Teacher Resources featured cards, every link, desktop/tablet/phone, keyboard, structured data.
// Needs a static server at the repo root on :8123. Set AXE_PATH to also run the axe-core scan.
const { chromium } = require('playwright');
const fs = require('fs');
const { ok, done } = require('./helpers');
const BASE = 'http://localhost:8123/';
const NAV_PAGES = ['index.html', '404.html', 'fruit-fly-biology/', 'fruit-fly-life-cycle-activities/', 'science-activities/', 'teacher-resources/'];
const IGNORE = /Failed to load resource|ERR_TUNNEL|net::ERR/; // sandbox blocks third-party fonts; same in the original pages

(async () => {
  const browser = await chromium.launch();
  const open = async (url, w, h = 800) => { const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => m.type() === 'error' && !IGNORE.test(m.text()) && errs.push(m.text())); await page.goto(BASE + url); return { page, errs, ctx }; };

  console.log('navigation link on every page that carries the site nav');
  for (const pg of NAV_PAGES) {
    const { page, errs, ctx } = await open(pg, 1280);
    const l = page.locator('#navLinks a.nav-conf');
    ok(await l.count() === 1, pg + ': exactly one Conference link in the main nav');
    const href = await l.getAttribute('href');
    ok(/^\/?scientific-conference\.html$/.test(href), pg + ': links to scientific-conference.html (' + href + ')');
    ok((await l.getAttribute('aria-label')) === 'Scientific Conference' && (await l.isVisible()), pg + ': visible on desktop, accessible name "Scientific Conference"');
    ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, pg + ': no horizontal overflow at 1280');
    ok(errs.length === 0, pg + ': no script errors ' + errs.join('|'));
    await ctx.close();
  }

  console.log('desktop click-through and keyboard');
  { const { page, ctx } = await open('science-activities/', 1280); await page.locator('#navLinks a.nav-conf').click(); await page.waitForURL('**/scientific-conference.html'); ok((await page.title()).startsWith("Drosie's First Scientific Conference"), 'desktop: nav click opens the conference'); await ctx.close(); }
  { const { page, ctx } = await open('teacher-resources/', 1280); await page.locator('#navLinks a.nav-conf').focus();
    ok(await page.evaluate(() => document.activeElement.classList.contains('nav-conf')), 'link is keyboard-focusable');
    await page.keyboard.press('Enter'); await page.waitForURL('**/scientific-conference.html'); ok(page.url().endsWith('/scientific-conference.html'), 'Enter on the focused link opens the conference'); await ctx.close(); }

  console.log('tablet and phone menus');
  for (const w of [390, 768, 1024]) {
    for (const pg of ['index.html', 'science-activities/', 'teacher-resources/']) {
      const { page, ctx } = await open(pg, w);
      ok(!(await page.locator('#navLinks a.nav-conf').isVisible()), `${pg} @${w}: menu closed by default (link hidden)`);
      ok(await page.locator('#menuButton').isVisible(), `${pg} @${w}: hamburger button visible`);
      await page.locator('#menuButton').click();
      ok((await page.locator('#menuButton').getAttribute('aria-expanded')) === 'true' && await page.locator('#navLinks a.nav-conf').isVisible(), `${pg} @${w}: opening the menu shows the Conference link, aria-expanded=true`);
      ok((await page.locator('#navLinks a.nav-conf .nav-new').isVisible()), `${pg} @${w}: "New" pill shown in the menu`);
      const box = await page.locator('#navLinks a.nav-conf').boundingBox(); ok(box.height >= 36 && box.x >= 0 && box.x + box.width <= w, `${pg} @${w}: link is tappable (${Math.round(box.height)}px high) and inside the viewport`);
      await page.locator('#navLinks a.nav-conf').click(); await page.waitForURL('**/scientific-conference.html'); ok(page.url().endsWith('/scientific-conference.html'), `${pg} @${w}: tapping it opens the conference`);
      await ctx.close();
    }
  }
  { const { page, ctx } = await open('science-activities/', 390); await page.locator('#menuButton').click(); await page.locator('#menuButton').click(); ok(!(await page.locator('#navLinks').evaluate((n) => n.classList.contains('open'))) && (await page.locator('#menuButton').getAttribute('aria-expanded')) === 'false', 'menu closes again when the button is pressed twice'); await ctx.close(); }
  { const { page, ctx } = await open('index.html', 820); await page.locator('#menuButton').click(); await page.locator('.drosie-games-menu summary').click(); ok(await page.locator('.drosie-games-dropdown a').first().isVisible(), 'home @820: Games dropdown still opens inside the collapsed menu'); await ctx.close(); }

  console.log('featured cards');
  for (const [pg, primary] of [['science-activities/', 'scientific-conference.html'], ['teacher-resources/', 'conference-teacher-guide.html']]) {
    const { page, errs, ctx } = await open(pg, 1280);
    const card = page.locator('#conference .conf-feature');
    ok(await card.count() === 1, pg + ': featured card present');
    ok(await page.locator('#conference h2#conf-h').innerText() === 'Drosie’s First Scientific Conference', pg + ': heading text');
    const hrefs = await card.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    ok(hrefs.includes('/scientific-conference.html') && hrefs.includes('/conference-teacher-guide.html'), pg + ': card links to both the conference and the teacher guide (' + hrefs.join(', ') + ')');
    ok((await card.locator('a.button-dark').getAttribute('href')).endsWith(primary), pg + ': primary button is "' + primary + '"');
    ok((await page.locator('a[href="#conference"]').count()) >= 1 && await page.locator('a[href="#conference"]').first().isVisible(), pg + ': hero jump button scrolls to the card');
    ok(/simulat/i.test(await card.innerText()), pg + ': card says it is a simulation');
    const dec = await page.evaluate(() => [...document.querySelectorAll('#conference svg,#conference .conf-art')].every((e) => e.getAttribute('aria-hidden') === 'true'));
    ok(dec, pg + ': decorative art is hidden from screen readers');
    ok(errs.length === 0, pg + ': no script errors ' + errs.join('|')); await ctx.close();
  }
  { const { page, ctx } = await open('science-activities/', 1280); const c = page.locator('#ages-9-11 article', { hasText: 'Scientific Conference' }); ok(await c.count() === 1, 'hub: also listed in the Ages 9–11 group'); ok(/Suggested ages 7–12/.test(await c.innerText()), 'hub card states ages 7–12'); await ctx.close(); }
  { const { page, ctx } = await open('teacher-resources/', 1280); ok(await page.locator('#activities article', { hasText: 'Scientific Conference' }).count() === 1, 'teachers: also listed under Interactive classroom activities'); ok(await page.locator('#grades a[href="/conference-teacher-guide.html"]').count() === 1, 'teachers: grade-band section links to the guide'); await ctx.close(); }

  console.log('every internal link on the three edited pages resolves');
  const api = await (await browser.newContext()).request;
  for (const pg of ['index.html', 'science-activities/', 'teacher-resources/']) {
    const { page, ctx } = await open(pg, 1280);
    const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))].filter((h) => !/^(https?:|mailto:|tel:|javascript:)/.test(h)));
    let bad = [];
    for (const h of links) {
      const [path, frag] = h.split('#'); const url = path === '' ? pg : (path.startsWith('/') ? path.slice(1) : (pg.endsWith('/') ? pg : pg.replace(/[^/]*$/, '')) + path);
      const r = await api.get(BASE + url); if (r.status() >= 400) bad.push(h + ' -> ' + r.status());
      else if (frag && !/\.(pdf|zip|png|webp|svg)$/.test(path)) { const html = path === '' ? await page.content() : await r.text(); if (!new RegExp('id=["\']' + frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']').test(html)) bad.push(h + ' -> missing #' + frag); }
    }
    ok(bad.length === 0, `${pg}: all ${links.length} internal links and anchors resolve` + (bad.length ? ' BAD: ' + bad.join(', ') : '')); await ctx.close();
  }

  console.log('no layout damage');
  for (const pg of ['science-activities/', 'teacher-resources/', 'fruit-fly-biology/']) for (const w of [320, 390, 768, 1280]) { const { page, ctx } = await open(pg, w); ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, `${pg} @${w}px: no horizontal overflow`); await ctx.close(); }

  console.log('structured data');
  for (const [pg, url] of [['science-activities/', 'https://drosiesworld.com/scientific-conference.html'], ['teacher-resources/', 'https://drosiesworld.com/conference-teacher-guide.html']]) {
    const { page, ctx } = await open(pg, 1280); const d = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
    const items = d['@graph'].find((g) => g['@type'] === 'CollectionPage').mainEntity.itemListElement; const it = items.find((i) => i.item.url === url);
    ok(!!it && it.item.isAccessibleForFree === true && it.item.typicalAgeRange === '7-12', pg + ': ItemList has the conference entry (free, ages 7-12)');
    ok(items.every((i, n) => i.position === n + 1), pg + ': ItemList positions still sequential (' + items.length + ' items)'); ok(!/aggregateRating|review|offers/i.test(JSON.stringify(d)), pg + ': no invented ratings/reviews'); await ctx.close();
  }

  if (process.env.AXE_PATH) {
    // Scope: components added by this change. The pages also contain older elements with known colour-contrast problems
    // (logo accent, eyebrow tags, kickers, grey card notes) that pre-date this change and are reported separately, not fixed here.
    console.log('axe-core on the new components');
    const axe = fs.readFileSync(process.env.AXE_PATH, 'utf8');
    for (const [pg, w, openMenu] of [['science-activities/', 1280, false], ['teacher-resources/', 1280, false], ['science-activities/', 390, true], ['teacher-resources/', 390, true], ['index.html', 820, true], ['index.html', 1280, false]]) {
      const { page, ctx } = await open(pg, w); if (openMenu) await page.locator('#menuButton').click(); await page.evaluate(axe);
      const v = await page.evaluate(async () => {
        const mine = [...document.querySelectorAll('article')].find((a) => /Scientific Conference/.test(a.textContent)); if (mine) mine.setAttribute('data-mine', '1');
        const sels = ['#navLinks a.nav-conf', '#conference', '[data-mine]'].filter((x) => document.querySelector(x)); const out = [];
        for (const sel of sels) { const r = await axe.run(sel, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); r.violations.forEach((x) => out.push(sel + ' ' + x.id + ' x' + x.nodes.length)); }
        return { out, n: sels.length };
      });
      ok(v.out.length === 0 && v.n >= 1, `axe ${pg} @${w}${openMenu ? ' (menu open)' : ''}: ${v.n} new component(s) scanned, ${v.out.length} violations` + (v.out.length ? ' ' + v.out.join(', ') : ''));
      await ctx.close();
    }
  }
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
