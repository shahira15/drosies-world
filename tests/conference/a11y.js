// Automated accessibility scan (axe-core) of every chapter. Needs AXE_PATH=/path/to/axe.min.js. Automated checks cover only part of WCAG; manual testing is still needed.
const { open, ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
const fs = require('fs');
const axeSrc = fs.readFileSync(process.env.AXE_PATH, 'utf8');
(async () => {
  for (const path of ['A', 'B']) {
    const { browser, page, errors } = await open({ reduced: true });
    await page.evaluate(SEED_ALL, path);
    for (let n = 1; n <= 10; n++) {
      await page.goto('http://localhost:8123/scientific-conference.html#ch' + n); await page.reload();
      if (n === 10) { await page.locator('[data-act=finCert]').click().catch(() => {}); }
      if (n === 8) { await page.locator('.areabtn[data-a=talk]').click(); await page.locator('[data-act=sciPick][data-s=quill]').click(); }
      await page.evaluate(axeSrc);
      const res = await page.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((x) => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n')[1]) })); });
      ok(res.length === 0, `axe path ${path} ch${n}: ${res.length} violation types` + (res.length ? ' ' + JSON.stringify(res) : ''));
    }
    ok(errors.length === 0, 'no console errors ' + errors.join('|'));
    await browser.close();
  }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
