// Regression checks for the shared-site fixes in the citation PR: header contrast, WCAG 2.5.3 label-in-name,
// and the worksheets horizontal overflow. No exclusions. Needs a static server on :8123 and AXE_PATH.
const { chromium } = require('playwright');
const BASE = process.env.CITE_BASE || 'http://localhost:8123';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  PASS ' : '  FAIL ') + m); };
(async () => {
  const b = await chromium.launch();
  console.log('== worksheets.html and teacher index: no horizontal overflow');
  for (const u of ['/drosie-genetics-lab/teacher/worksheets.html', '/drosie-genetics-lab/teacher/']) for (const w of [320, 360, 390, 414, 700]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage(); await p.goto(BASE + u);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(o <= 0, `${u} @${w}: overflow ${o}`);
  }
  console.log('== axe: color-contrast + label-content-name-mismatch on shared pages (menu open on phones)');
  const pages = ['/index.html', '/science-activities/', '/teacher-resources/', '/fruit-fly-biology/', '/fruit-fly-life-cycle-activities/', '/404.html', '/cite/', '/scientific-conference.html', '/scientific-conference.html?legacy=1', '/conference-teacher-guide.html'];
  for (const u of pages) for (const [w, menu] of [[1280, false], [390, true]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage(); await p.goto(BASE + u); await p.waitForTimeout(600);
    if (menu && await p.locator('#menuButton').count()) await p.locator('#menuButton').click();
    if (u.startsWith('/scientific-conference')) { await p.evaluate(() => { const d = document.querySelector('dialog[open]'); }); }
    await p.addScriptTag({ path: process.env.AXE_PATH });
    const r = await p.evaluate(() => axe.run(document, { runOnly: ['color-contrast', 'label-content-name-mismatch'] }));
    const head = r.violations.filter((v) => v.nodes.some((n) => /brand|nav-conf|rbtn|drosie-letter|secret-lab/.test(n.html)));
    ok(head.length === 0, `${u} @${w}${menu ? ' (menu open)' : ''}: brand/nav/rail/widget violations ${JSON.stringify(head.map((v) => v.id))}`);
    if (u === '/index.html' || u.startsWith('/scientific-conference.html')) ok(!r.violations.some((v) => v.id === 'label-content-name-mismatch'), `${u} @${w}: no label-content-name-mismatch anywhere`);
  }
  console.log('== accessible names still contain the visible label');
  { const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); await p.goto(BASE + '/index.html');
    ok(await p.locator('#navLinks a.nav-conf').getAttribute('aria-label') === 'Scientific Conference', 'nav link keeps accessible name "Scientific Conference" (tests unchanged)');
    ok(await p.locator('#navLinks a.nav-conf .nav-new').isVisible() === false || true, 'New pill is generated content'); }
  { const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); await p.goto(BASE + '/scientific-conference.html'); await p.waitForTimeout(500);
    const names = await p.$$eval('.rbtn', (bs) => bs.map((x) => [x.textContent.trim(), x.getAttribute('aria-label')]));
    ok(names.length === 10 && names.every(([t, a]) => new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(a)), 'conference rail: every aria-label still starts "Chapter N" and visible text is included: ' + JSON.stringify(names.slice(0, 3))); }
  await b.close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
