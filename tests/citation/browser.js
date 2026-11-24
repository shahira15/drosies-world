// Browser tests for /cite/: tabs, copy buttons, downloads, keyboard, mobile layout, accessibility (axe-core).
// Needs: a static server at the repo root on :8123 (python3 -m http.server 8123), Playwright, and AXE_PATH -> axe.min.js.
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.CITE_BASE || 'http://localhost:8123';
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  PASS ' : '  FAIL ') + m); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(BASE + '/cite/');

  console.log('== structure');
  ok(await page.locator('h1').count() === 1, 'exactly one h1');
  const cards = await page.locator('.cite-card').count();
  ok(cards >= 24, cards + ' citation cards');
  const heads = await page.$$eval('h1,h2,h3,h4', (els) => els.filter((e) => e.offsetParent !== null).map((e) => +e.tagName[1]));
  let skip = false; for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skip = true;
  ok(!skip, 'visible heading levels never skip down');
  ok(await page.locator('#software-doi .badge-future').count() === 1, 'future software DOI placeholder is labelled');
  ok(await page.locator('footer a[href="/cite/"]').count() === 1, 'footer links to /cite/');

  console.log('== tabs (WAI-ARIA)');
  const card = page.locator('#secret-fly-lab');
  const tabs = card.locator('[role=tab]');
  ok(await tabs.count() === 5, '5 format tabs');
  ok(await card.locator('[role=tabpanel]:visible').count() === 1, 'only one panel visible with JS');
  await tabs.nth(0).focus(); await page.keyboard.press('ArrowRight');
  ok(await tabs.nth(1).getAttribute('aria-selected') === 'true' && await tabs.nth(1).evaluate((e) => document.activeElement === e), 'ArrowRight moves to MLA and focuses it');
  await page.keyboard.press('End'); ok(await tabs.nth(4).getAttribute('aria-selected') === 'true', 'End selects RIS');
  await page.keyboard.press('Home'); ok(await tabs.nth(0).getAttribute('aria-selected') === 'true', 'Home selects APA');
  await page.keyboard.press('ArrowLeft'); ok(await tabs.nth(4).getAttribute('aria-selected') === 'true', 'ArrowLeft wraps to RIS');
  ok(await card.locator('[role=tab][tabindex="0"]').count() === 1, 'roving tabindex: one tab stop');

  console.log('== copy buttons');
  await tabs.nth(0).click();
  const copyBtn = card.locator('[role=tabpanel]:visible [data-copy]');
  ok((await copyBtn.getAttribute('aria-label')).includes('Copy APA 7 citation for The Secret Fly Lab'), 'copy button has a specific accessible name');
  await copyBtn.focus(); await page.keyboard.press('Enter');
  await copyBtn.filter({ hasText: 'Copied' }).waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const iso = await page.inputValue('#access-date'); const [Y, M, D] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  ok(clip === `Arzoo, S. H. (n.d.). The Secret Fly Lab [Interactive educational game]. Drosie's World. Retrieved ${months[M - 1]} ${D}, ${Y}, from https://drosiesworld.com/lab/`, 'undated APA text with access date copied via keyboard: ' + clip);
  const html = await page.evaluate(async () => { const it = await navigator.clipboard.read(); const t = it[0].types; return t.includes('text/html') ? await (await it[0].getType('text/html')).text() : ''; });
  ok(html.includes('<em>The Secret Fly Lab</em>'), 'rich-text copy keeps italics');
  await page.waitForTimeout(200);
  ok((await page.locator('#cite-status').textContent()).startsWith('Copied'), 'live region announces the copy: ' + await page.locator('#cite-status').textContent());
  ok((await copyBtn.textContent()) === 'Copied', 'button label changes to Copied');
  for (const [i, key, startsWith] of [[3, 'BibTeX', '@misc{arzoosecretflylabnd'], [4, 'RIS', 'TY  - COMP']]) {
    await tabs.nth(i).click();
    await card.locator('[role=tabpanel]:visible [data-copy]').click();
    await card.locator('[role=tabpanel]:visible [data-copy]').filter({ hasText: 'Copied' }).waitFor();
    const c = await page.evaluate(() => navigator.clipboard.readText());
    ok(c.startsWith(startsWith) && c.trim().endsWith(key === 'RIS' ? 'ER  -' : '}'), key + ' copy is complete and well-formed');
  }
  const dlp = page.waitForEvent('download');
  await card.locator('[role=tabpanel]:visible [data-download]').click();
  const d = await dlp; ok(d.suggestedFilename() === 'secret-fly-lab.ris', 'per-entry download: ' + d.suggestedFilename());

  console.log('== access date control');
  await tabs.nth(0).click();
  await page.fill('#access-date', '2026-03-05');
  ok((await card.locator('[role=tabpanel]:visible .acc').first().textContent()) === 'March 5, 2026', 'changing the access date updates APA live');
  await tabs.nth(1).click(); ok((await card.locator('[role=tabpanel]:visible .acc').first().textContent()) === '5 March 2026', 'MLA uses day-month-year');
  await tabs.nth(3).click(); ok((await card.locator('[role=tabpanel]:visible .acc').first().textContent()) === '2026-03-05', 'BibTeX urldate is ISO');
  await tabs.nth(4).click(); ok((await card.locator('[role=tabpanel]:visible .acc').first().textContent()) === '2026/03/05', 'RIS Y2 uses YYYY/MM/DD');
  await tabs.nth(0).click();
  ok((await page.locator('#storybook [role=tabpanel][data-fmt=apa] .cite-text').textContent()).startsWith('Arzoo, S. (2026). Drosie, the Fruit Fly (Version 1.0; L. Cavalcanti, Illus.)'), 'storybook APA is dated and credits the illustrator');
  ok(await page.locator('#storybook .acc').count() === 0, 'storybook (dated, DOI) has no access-date field');
  await page.fill('#access-date', '');
  ok((await card.locator('[role=tabpanel]:visible .acc').first().textContent()) === '[access date]', 'empty date falls back to a visible placeholder');

  console.log('== bibliography downloads');
  for (const f of ['ris', 'bib', 'enw']) {
    const r = await page.request.get(BASE + '/cite/drosies-world-bibliography.' + f);
    const body = await r.text(); ok(r.status() === 200 && body.length > 2000, f + ' served (' + body.length + ' bytes)');
  }

  console.log('== every card: copy buttons exist and are labelled');
  const unlabeled = await page.$$eval('button', (bs) => bs.filter((b) => !(b.getAttribute('aria-label') || b.textContent).trim()).length);
  ok(unlabeled === 0, 'no unlabeled buttons');
  ok(await page.locator('[data-copy]').count() === cards * 5, 'five copy buttons per card');

  console.log('== keyboard-only: skip link, focus visible');
  await page.goto(BASE + '/cite/'); await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), 'first Tab stop is the skip link');
  await tabs.first().focus();
  ok(await page.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; }), 'focus outline visible on tab');

  console.log('== deep links');
  await page.goto(BASE + '/cite/#lesson-3'); ok(await page.locator('#lesson-3:target').count() === 1, '#lesson-3 deep link targets its card');

  console.log('== no-JS fallback');
  const nojs = await browser.newContext({ javaScriptEnabled: false }); const np = await nojs.newPage(); await np.goto(BASE + '/cite/');
  ok(await np.locator('#secret-fly-lab [role=tabpanel]:visible').count() === 5, 'all five formats visible without JavaScript');
  await nojs.close();

  console.log('== responsive: no horizontal scroll');
  for (const w of [320, 375, 768, 1280]) {
    const c = await browser.newContext({ viewport: { width: w, height: 800 } }); const p = await c.newPage(); await p.goto(BASE + '/cite/');
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(ov <= 0, w + 'px: overflow ' + ov);
    const small = await p.$$eval('.copy-btn,[role=tab]', (els) => els.filter((e) => e.offsetParent && (e.getBoundingClientRect().height < 40)).length);
    ok(small === 0, w + 'px: touch targets >= 40px high');
    await c.close();
  }

  console.log('== axe-core accessibility (no exclusions)');
  if (process.env.AXE_PATH) {
    for (const [name, w, dark] of [['desktop', 1280], ['phone', 375]]) {
      const c = await browser.newContext({ viewport: { width: w, height: 800 } }); const p = await c.newPage(); await p.goto(BASE + '/cite/');
      await p.addScriptTag({ path: process.env.AXE_PATH });
      const res = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      for (const v of res.violations) console.log('   axe', v.id, v.impact, v.nodes.length, v.nodes[0].target.join(' '));
      ok(res.violations.length === 0, name + ': axe violations ' + res.violations.length);
      await c.close();
    }
  } else console.log('  SKIP axe (AXE_PATH not set)');

  ok(errors.length === 0, 'no console errors ' + JSON.stringify(errors));
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
