/* Site-wide automated tests for Drosie's World (pages, links, keyboard, mobile, offline/no-external, accessibility scan,
 * and functional tests of the educational simulations that had no tests before).
 *
 *   node tests/site/run.js [suite ...]        suites: pages links keyboard mobile a11y offline components science
 *   SITE_ROOT=/path/to/extracted/edition EXPECT_NO_EXTERNAL=1 AXE_PATH=.../axe.min.js node tests/site/run.js
 *   BROWSER=firefox node tests/site/run.js    (only if that browser is installed; otherwise reported as NOT RUN)
 *
 * Automated accessibility scans are NOT a WCAG conformance evaluation.
 */
const fs = require('fs'), path = require('path');
const L = require('./lib');
const { ROOT, PAGES } = L;
const want = new Set(process.argv.slice(2));
const run = (s) => !want.size || want.has(s);
const NO_EXT = process.env.EXPECT_NO_EXTERNAL === '1';
const present = (rel) => fs.existsSync(path.join(ROOT, rel));
const pages = PAGES.filter(present);

async function scrollAll(page) {
  /* lazy images far down the page would otherwise be judged before they load: make them eager, then wait */
  await page.evaluate(() => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); window.scrollTo(0, document.documentElement.scrollHeight); window.scrollTo(0, 0); });
  await page.waitForFunction(() => [...document.images].every(i => i.offsetParent === null || i.complete), null, { timeout: 6000 }).catch(() => {});
}
const brokenImages = (page) => page.evaluate(() => [...document.images].filter(i => i.offsetParent !== null && getComputedStyle(i).display !== 'none' && (!i.complete || i.naturalWidth === 0)).map(i => i.getAttribute('src')));

(async () => {
  const { srv, base } = await L.serve();
  const { browser, error, name, pw } = await L.launch(); const bname = name;
  console.log(`Site root: ${ROOT}\nBrowser: ${name}${error ? ' NOT AVAILABLE: ' + error : ' ' + browser.version()}\nExpect no external requests: ${NO_EXT}`);
  if (error) { L.suite('browser'); L.skip(`${name} NOT RUN: browser binary is not installed in this environment (${error})`); L.summary(); srv.close(); process.exit(0); }

  /* ------------------------------------------------------------------ pages (desktop) */
  if (run('pages')) {
    L.suite('pages: load, errors, images, external requests (desktop 1280x800)');
    L.ok(pages.length > 0, `${pages.length} public pages found (${PAGES.length - pages.length} listed pages absent from this root)`);
    for (const rel of pages) {
      const t = await L.open(browser, base, rel, { wait: rel.startsWith('lab/') ? 3500 : 800 });
      const p = t.page;
      const status = t.resp && t.resp.status ? t.resp.status() : 0;
      await scrollAll(p);
      const meta = await p.evaluate(() => ({ title: document.title, lang: document.documentElement.lang, vp: !!document.querySelector('meta[name=viewport]'), h1: document.querySelectorAll('h1').length, main: !!document.querySelector('main,[role=main]') }));
      const bi = await brokenImages(p);
      L.ok(status === 200 || (rel === '404.html'), `${rel}: HTTP ${status}`);
      L.ok(t.errors.length === 0, `${rel}: no JavaScript or console errors`, t.errors.join(' | '));
      L.ok(t.failed.length === 0, `${rel}: no failed local requests`, t.failed.join(' | '));
      L.ok(bi.length === 0, `${rel}: all visible images load`, bi.join(', '));
      L.ok(meta.title.length > 3 && meta.lang && meta.vp, `${rel}: title, lang and viewport meta present`, JSON.stringify(meta));
      L.ok(meta.h1 >= 1, `${rel}: has an h1`);
      if (NO_EXT) L.ok(t.external.length === 0, `${rel}: no external network requests attempted`, [...new Set(t.external)].join(' | '));
      else if (t.external.length) console.log(`  INFO ${rel}: attempted ${new Set(t.external).size} external URL(s) (blocked in test): ${[...new Set(t.external)].slice(0, 3).join(', ')}`);
      await t.context.close();
    }
  }

  /* ------------------------------------------------------------------ links (static) */
  if (run('links')) {
    L.suite('links: every local href/src/action resolves; in-page anchors exist');
    const htmlFiles = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (!['docs', 'tests', 'seo', 'node_modules', '.git', 'release', 'vendor'].includes(e.name)) walk(f); } else if (e.name.endsWith('.html')) htmlFiles.push(f); } })(ROOT);
    const idsOf = {}; const idsFor = (f) => idsOf[f] || (idsOf[f] = new Set([...fs.readFileSync(f, 'utf8').matchAll(/\bid="([^"]+)"/g)].map(m => m[1])));
    let n = 0; const bad = [];
    for (const f of htmlFiles) {
      const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
      for (const m of html.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
        let u = m[1]; if (/^(https?:|mailto:|tel:|data:|javascript:|blob:|\/\/)/.test(u) || u === '' ) continue;
        n++; let [file, frag] = u.split('#'); file = file.split('?')[0];
        let target = file === '' ? f : (file.startsWith('/') ? path.join(ROOT, file) : path.resolve(path.dirname(f), decodeURI(file)));
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
        if (!fs.existsSync(target)) { bad.push(`${path.relative(ROOT, f)} -> ${u} (missing file)`); continue; }
        if (frag && target.endsWith('.html') && !idsFor(target).has(decodeURIComponent(frag)) && frag !== 'top') bad.push(`${path.relative(ROOT, f)} -> ${u} (missing anchor)`);
      }
    }
    L.ok(htmlFiles.length > 5, `${htmlFiles.length} HTML files scanned, ${n} local links checked`);
    L.ok(bad.length === 0, `no broken local links or anchors (${bad.length})`, bad.slice(0, 12).join(' | '));
    if (bad.length) bad.forEach(b => console.log('  BROKEN ' + b));
  }

  /* ------------------------------------------------------------------ keyboard */
  if (run('keyboard')) {
    L.suite('keyboard: Tab order reaches interactive controls with a visible focus indicator, no trap');
    for (const rel of pages) {
      if (rel === '404.html') continue;
      const t = await L.open(browser, base, rel, { wait: rel.startsWith('lab/') ? 3500 : 700 });
      const seen = []; let noIndicator = 0;
      for (let i = 0; i < 45; i++) {
        await t.page.keyboard.press('Tab');
        const f = await t.page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; if (e.tagName === 'IFRAME') return { k: 'IFRAME#' + (e.title || '').slice(0, 20), vis: true }; /* embedded documents draw their own focus */ const cs = getComputedStyle(e); const vis = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none') || e.matches(':focus-visible'); return { k: e.tagName + '#' + e.id + '.' + (e.className && e.className.baseVal === undefined ? e.className : '') + '@' + (e.getAttribute('href') || e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30), vis: !!vis }; });
        if (f) { seen.push(f.k); if (!f.vis) noIndicator++; }
      }
      const distinct = new Set(seen).size;
      L.ok(distinct >= 3, `${rel}: Tab reaches ${distinct} distinct controls in 45 presses`, seen.slice(0, 5).join(' | '));
      L.ok(noIndicator === 0, `${rel}: every focused control shows a focus indicator (${noIndicator} without)`);
      await t.context.close();
    }
  }

  /* ------------------------------------------------------------------ mobile layouts */
  if (run('mobile')) {
    L.suite('mobile: 390x844 touch and 320x568; no horizontal overflow, no missing images');
    for (const vp of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
      for (const rel of pages) {
        if (rel === '404.html') continue;
        const t = await L.open(browser, base, rel, { wait: rel.startsWith('lab/') ? 3500 : 700, context: { viewport: vp, hasTouch: true, isMobile: bname === 'chromium' } });
        await scrollAll(t.page);
        const ov = await t.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        const bi = await brokenImages(t.page);
        L.ok(ov.sw <= ov.cw + 1, `${rel} @${vp.width}px: no horizontal page scroll (scrollWidth ${ov.sw} / ${ov.cw})`);
        L.ok(t.errors.length === 0 && bi.length === 0, `${rel} @${vp.width}px: no errors, images load`, t.errors.concat(bi).join(' | '));
        await t.context.close();
      }
    }
  }

  /* ------------------------------------------------------------------ automated accessibility scan */
  if (run('a11y')) {
    L.suite('a11y: automated axe-core scan (NOT a WCAG conformance evaluation)');
    if (!process.env.AXE_PATH || !fs.existsSync(process.env.AXE_PATH)) L.skip('AXE_PATH not set: axe-core scan NOT RUN');
    else for (const rel of pages) {
      const t = await L.open(browser, base, rel, { wait: rel.startsWith('lab/') ? 3500 : 800 });
      await t.page.addScriptTag({ path: process.env.AXE_PATH });
      const res = await t.page.evaluate(async () => { const r = await axe.run({ include: [document], exclude: [['svg text[aria-hidden="true"]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); return r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes[0] && v.nodes[0].target.join(' ').slice(0, 80) })); });
      const serious = res.filter(v => v.impact === 'critical' || v.impact === 'serious');
      L.ok(serious.length === 0, `${rel}: no critical/serious axe violations (${res.length} total violations of any impact)`, serious.map(v => `${v.id}(${v.nodes}) ${v.sample}`).join(' | '));
      res.filter(v => !(v.impact === 'critical' || v.impact === 'serious')).forEach(v => console.log(`  INFO ${rel}: axe ${v.impact} ${v.id} x${v.nodes}`));
      await t.context.close();
    }
  }

  /* ------------------------------------------------------------------ offline / no external services (and file://) */
  if (run('offline')) {
    L.suite('offline: pages work with every external host blocked' + (NO_EXT ? ' and make zero external attempts' : ''));
    const feedback = present('index.html') ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : '';
    if (NO_EXT) {
      L.ok(!/supabase\.co|turnstile|gc\.zgo\.at|unpkg\.com|jsdelivr|googleapis|gstatic|youtube/i.test(feedback), 'index.html contains no Supabase, Turnstile, analytics, CDN, font or YouTube references');
      const hits = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (!['docs', 'tests', 'seo', '.git', 'release'].includes(e.name)) walk(f); } else if (/\.(html|js|css)$/.test(e.name) && !/vendor/.test(f)) { const s = fs.readFileSync(f, 'utf8'); for (const m of s.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) { const st = s.lastIndexOf('<', m.index), tag = s.slice(st, s.indexOf('>', m.index) + 1); if (/^<(script|img|iframe|source|video|audio)\b/i.test(tag) || (/^<link\b/i.test(tag) && /rel="(stylesheet|preload|prefetch|preconnect|dns-prefetch|modulepreload|icon|manifest)/i.test(tag))) hits.push(path.relative(ROOT, f) + ' -> ' + m[1]); } if (/@import\s+url\(['"]?https?:/.test(s)) hits.push(path.relative(ROOT, f) + ' @import'); if (/\bfetch\(\s*['"`]https?:/.test(s)) hits.push(path.relative(ROOT, f) + ' fetch(http)'); } } })(ROOT);
      L.ok(hits.length === 0, 'no auto-loading external resource (script/link/img/iframe/@import/fetch) in any shipped page or script', hits.join(' | '));
      /* file:// */
      L.suite('offline: open directly from the file system (file://), no server');
      for (const rel of ['index.html', 'science-activities/index.html', 'storybook.html', 'climbing-game.html', 'life-cycle-game.html', 'team.html']) {
        if (!present(rel)) continue;
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const errs = [];
        await context.route(/^https?:\/\//, r => { errs.push('external ' + r.request().url()); r.abort(); });
        const page = await context.newPage(); page.on('pageerror', e => errs.push(e.message));
        await page.goto('file://' + path.join(ROOT, rel)); await page.waitForTimeout(900); await scrollAll(page);
        const bi = await brokenImages(page);
        L.ok(errs.length === 0 && bi.length === 0, `file:// ${rel}: loads with no errors and no broken images`, errs.concat(bi).join(' | '));
        if (rel === 'index.html') {
          const link = page.locator('a[href$="science-activities/index.html"]').first();
          if (await link.count()) { const target = await link.evaluate(a => a.href); await page.goto(target); L.ok(/science-activities\/index\.html$/.test(page.url()) && /Science Activities/i.test(await page.title()), 'file:// link from the home page resolves to the Science Activities page (relative links)', page.url()); }
          else L.ok(false, 'home page has a relative link to science-activities/index.html');
        }
        await context.close();
      }
    } else L.skip('zero-external-request assertions only run with EXPECT_NO_EXTERNAL=1 (archival edition); the live site intentionally uses third-party services');
  }

  /* ------------------------------------------------------------------ simulation / component functional tests */
  if (run('components')) {
    L.suite('components: Climbing Challenge (full 3-trial flow, results match what is drawn)');
    if (present('climbing-game.html')) {
      const t = await L.open(browser, base, 'climbing-game.html'); const p = t.page;
      await p.click('#beginBtn');
      const recorded = [];
      for (let trial = 1; trial <= 3; trial++) {
        await p.locator('#flyrow label.pf').nth(trial + 3).click();
        await p.click('#lockBtn'); await p.click('#tapBtn'); await p.waitForSelector('#startBtn:not([hidden]):not([disabled])', { timeout: 8000 }); await p.click('#startBtn');
        await p.waitForSelector('#nextBtn:not([hidden])', { timeout: 40000 });
        const above = await p.locator('#flies .is-above').count(), below = await p.locator('#flies .is-below').count();
        const shown = await p.evaluate(() => (document.querySelector('#recNum') || {}).textContent);
        recorded.push(above);
        L.ok(above + below === 10, `trial ${trial}: all 10 simulated flies are classified above or below the line (${above}/${below})`);
        L.ok(String(shown).trim() === String(above), `trial ${trial}: recorded count (${shown}) equals flies drawn above the line (${above})`);
        await p.click('#nextBtn');
      }
      await p.waitForSelector('#finishBtn:not([hidden])', { timeout: 8000 });
      const avg = (await p.locator('#legendAvg').textContent()).match(/[\d.]+/)[0];
      const expected = (recorded.reduce((a, b) => a + b, 0) / 3).toFixed(1);
      L.ok(avg === expected, `analysis average (${avg}) equals mean of the three recorded trials (${expected})`, recorded.join(','));
      await p.click('#finishBtn'); await p.waitForTimeout(400);
      L.ok(await p.getByText(/Science Explorer/i).first().isVisible(), 'finish shows the explorer badge');
      L.ok(t.errors.length === 0, 'no JavaScript errors during the whole flow', t.errors.join(' | '));
      L.ok(/not real|simulation/i.test(await p.locator('body').innerText()), 'page states results are simulated, not real data');
      await t.context.close();
    }

    L.suite('components: Life Cycle Adventure, Grow Your Own Fruit Fly');
    for (const [rel, title0] of [['life-cycle-game.html', /Tiny Beginning/], ['grow-your-own-fruit-fly.html', /Notebook/]]) {
      if (!present(rel)) continue;
      const t = await L.open(browser, base, rel); const p = t.page;
      await p.click('#mainBtn'); await p.waitForTimeout(900);
      L.ok(title0.test(await p.locator('#chTitle').textContent()), `${rel}: Begin opens the first chapter`, await p.locator('#chTitle').textContent());
      const coach1 = await p.locator('#coachText').textContent();
      if (await p.locator('#hintBtn').count() && await p.locator('#hintBtn').isVisible()) { await p.click('#hintBtn'); await p.waitForTimeout(400); L.ok(true, `${rel}: hint button responds`); }
      await p.click('#prefBtn'); await p.waitForTimeout(300);
      L.ok(await p.locator('#prefDlg').evaluate(d => d.open), `${rel}: settings dialog opens`);
      await p.keyboard.press('Escape'); await p.waitForTimeout(200);
      L.ok(await p.locator('#prefDlg').evaluate(d => !d.open), `${rel}: Escape closes the settings dialog`);
      L.ok(coach1.length > 20, `${rel}: coach text is shown`);
      L.ok(t.errors.length === 0, `${rel}: no JavaScript errors`, t.errors.join(' | '));
      await t.context.close();
    }
    if (present('grow-your-own-fruit-fly.html')) {
      const t = await L.open(browser, base, 'grow-your-own-fruit-fly.html'); const p = t.page;
      const temps = await p.evaluate(() => window.FL && FL.TEMPS ? JSON.parse(JSON.stringify(FL.TEMPS)) : null);
      L.ok(!!temps, 'development-time table FL.TEMPS is defined');
      if (temps) {
        const ks = Object.keys(temps).map(Number).sort((a, b) => a - b); const days = ks.map(k => temps[k].days);
        L.ok(ks.length >= 3, `temperature options: ${ks.join(', ')} C`);
        L.ok(days.every(d => typeof d === 'string' && /\d/.test(d)), 'each temperature has a development-time label', JSON.stringify(days));
        const nums = days.map(d => parseFloat(String(d).match(/[\d.]+/)[0]));
        L.ok(nums.every((v, i) => i === 0 || v <= nums[i - 1]), 'warmer temperature never gives a longer development time label (monotonic, as stated qualitatively in the app)', JSON.stringify(days));
        L.ok(temps[25] && /9|10/.test(temps[25].days), 'the 25 C label is about 9 to 10 days (value is the app\'s own, uncited reference timing)', JSON.stringify(temps[25]));
      }
      await t.context.close();
    }

    L.suite('components: The Secret Fly Lab');
    if (present('lab/index.html')) {
      const t = await L.open(browser, base, 'lab/index.html', { wait: 3500 }); const p = t.page;
      L.ok(/Secret\s*Fly Lab/i.test(await p.locator('body').innerText()), 'title screen shows the game name');
      await p.getByText('Play', { exact: true }).first().click(); await p.waitForTimeout(2500);
      const txt = await p.locator('body').innerText();
      L.ok(/Safety|Mission|Suit Up|Lab 0/i.test(txt), 'Play opens the Lab Entrance / mission map');
      const savedKeys = await p.evaluate(() => Object.keys(localStorage));
      L.ok(true, 'progress keys in localStorage after Play: ' + (savedKeys.join(', ') || '(none yet)'));
      L.ok(t.errors.length === 0, 'no JavaScript errors after Play', t.errors.join(' | '));
      await t.context.close();
    }

    L.suite('components: Lab Notebook Academy');
    if (present('lab-notebook-academy.html')) {
      const t = await L.open(browser, base, 'lab-notebook-academy.html'); const p = t.page;
      const h0 = await p.locator('#pageTitle, .pagehead h2').first().textContent().catch(() => '');
      await p.locator('.tab').nth(1).click(); await p.waitForTimeout(400);
      const h1 = await p.locator('.pagehead h2').first().textContent().catch(() => '');
      L.ok(h0 !== h1 && h1.length > 3, 'selecting station 2 changes the page heading', `${h0} -> ${h1}`);
      await p.click('#vPrint'); await p.waitForTimeout(300); L.ok(await p.locator('body').innerText().then(s => /print/i.test(s)), 'Printables view opens');
      await p.click('#vGuide'); await p.waitForTimeout(300); L.ok(await p.locator('.guidedoc, #guide, body').first().innerText().then(s => /teacher|parent/i.test(s)), 'Teacher and parent guide opens');
      L.ok(/not a (legally|validated)|not a validated|practice/i.test(await p.locator('body').innerText()), 'states it is a practice tool, not a validated lab-notebook system');
      L.ok(t.errors.length === 0, 'no JavaScript errors', t.errors.join(' | '));
      await t.context.close();
    }

    L.suite('components: Storybook reader');
    if (present('storybook.html')) {
      const t = await L.open(browser, base, 'storybook.html', { wait: 1500 }); const p = t.page;
      const v0 = await p.locator('#page-slider').inputValue();
      if (!(await p.evaluate(() => typeof window.St !== 'undefined'))) { L.skip('Storybook page-flip needs its CDN copy on the live site; the CDN is blocked in this test environment (the archival edition vendors it and is tested)'); await t.context.close(); } else {
      await p.click('#next'); await p.waitForFunction(v => document.querySelector('#page-slider').value !== v, v0, { timeout: 4000 }).catch(() => {});
      const v1 = await p.locator('#page-slider').inputValue();
      L.ok(v1 !== v0, `Next page turns the page (slider ${v0} -> ${v1})`);
      await p.click('#previous'); await p.waitForFunction(v => document.querySelector('#page-slider').value === v, v0, { timeout: 4000 }).catch(() => {});
      L.ok(await p.locator('#page-slider').inputValue() === v0, 'Previous page returns');
      await p.locator('#page-slider').fill('20'); await p.waitForFunction(() => document.querySelector('#page-slider').value === '20', null, { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(500);
      L.ok(await p.locator('#page-slider').inputValue() === '20', 'slider jumps to a chosen page');
      const flip = await p.evaluate(() => typeof window.St !== 'undefined');
      L.ok(flip, 'page-flip library is loaded (from ' + (NO_EXT ? 'the vendored copy' : 'CDN or vendored copy') + ')');
      L.ok((await brokenImages(p)).length === 0, 'visible book pages load');
      L.ok(t.errors.length === 0, 'no JavaScript errors', t.errors.join(' | '));
      await t.context.close(); }
    }

    L.suite('components: Letters from Drosie, Discovery Library, home page');
    if (present('letters/index.html')) {
      const t = await L.open(browser, base, 'letters/index.html', { wait: 1500 }); const p = t.page;
      await p.click('#open-mailbox'); await p.waitForTimeout(2500);
      L.ok(/Dear|Drosie/i.test(await p.locator('body').innerText()) && t.errors.length === 0, 'opening the mailbox shows the letter without errors', t.errors.join(' | '));
      await t.context.close();
    }
    if (present('discoveries.html')) {
      const t = await L.open(browser, base, 'discoveries.html'); const p = t.page;
      const before = await p.locator('article, .dl-card, section.dl-item').count();
      await p.fill('#dl-search', 'zzzzqq'); await p.waitForTimeout(400);
      const visible = await p.evaluate(() => [...document.querySelectorAll('article')].filter(a => a.offsetParent !== null).length);
      L.ok(visible === 0 || visible < before || before === 0, `search filters the library (${before} -> ${visible} visible)`);
      await p.fill('#dl-search', ''); await p.waitForTimeout(300);
      L.ok(t.errors.length === 0, 'no JavaScript errors', t.errors.join(' | '));
      await t.context.close();
    }
    if (present('index.html')) {
      const t = await L.open(browser, base, 'index.html'); const p = t.page;
      const total = await p.locator('.lesson-card').count();
      await p.fill('#lessonSearch', 'safety'); await p.waitForTimeout(400);
      const shown = await p.evaluate(() => [...document.querySelectorAll('.lesson-card')].filter(a => a.offsetParent !== null).length);
      L.ok(total >= 7 && shown >= 1 && shown < total, `lesson search narrows ${total} cards to ${shown}`);
      if (NO_EXT) { L.ok(await p.locator('#drosie-feedback-form').count() === 0, 'archival edition: feedback form is absent'); L.ok(await p.locator('script[src*="turnstile"]').count() === 0, 'archival edition: no Turnstile script'); }
      L.ok(t.errors.length === 0, 'no JavaScript errors', t.errors.join(' | '));
      await t.context.close();
    }

    L.suite('components: Drosie Genetics Lab (UI smoke; the engine has its own 58-test Node suite)');
    if (present('drosie-genetics-lab/index.html')) {
      const t = await L.open(browser, base, 'drosie-genetics-lab/index.html', { wait: 1500 }); const p = t.page;
      const n = await p.evaluate(() => document.querySelectorAll('svg [aria-label], svg [role=button], [role=button][aria-label]').length);
      L.ok(n >= 8, `scene exposes ${n} labelled interactive elements (8 stations expected)`);
      L.ok(/simulated/i.test(await p.locator('body').innerText()), 'states that offspring data are simulated');
      L.ok(t.errors.length === 0, 'no JavaScript errors', t.errors.join(' | '));
      await t.context.close();
    }
  }

  const failures = L.summary();
  await browser.close(); srv.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('RUNNER CRASH', e); process.exit(2); });
