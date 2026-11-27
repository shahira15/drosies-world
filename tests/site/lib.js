/* Shared helpers for the site-wide test suite (tests/site/).
 * Environment variables:
 *   SITE_ROOT   directory to serve (default: repository root). Use an extracted archival edition to test it.
 *   BROWSER     chromium (default) | firefox | webkit. Browsers that are not installed are reported as NOT RUN.
 *   EXPECT_NO_EXTERNAL=1   fail if any page tries to contact a non-local host (archival edition).
 *   AXE_PATH    path to axe.min.js (npm i axe-core) to enable the automated accessibility scan.
 *   REPORT      optional path; a JSON report of every check is written there.
 */
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(__dirname, '../..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json', '.pdf': 'application/pdf',
  '.xml': 'application/xml', '.txt': 'text/plain', '.md': 'text/markdown', '.zip': 'application/zip', '.ris': 'application/x-research-info-systems',
  '.bib': 'application/x-bibtex', '.cff': 'text/yaml' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
      fs.readFile(f, (e, d) => {
        if (e) { res.statusCode = 404; return res.end('not found'); }
        res.setHeader('content-type', MIME[path.extname(f).toLowerCase()] || 'application/octet-stream');
        res.end(d);
      });
    }).listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* Public pages (relative to SITE_ROOT). Missing pages are skipped and reported. */
const PAGES = ['index.html', 'storybook.html', 'discoveries.html', 'life-cycle-game.html', 'grow-your-own-fruit-fly.html', 'climbing-game.html',
  'lab/index.html', 'lab-notebook-academy.html', 'letters/index.html', 'scientific-conference.html', 'conference-teacher-guide.html',
  'drosie-genetics-lab/index.html', 'drosie-genetics-lab/teacher/index.html', 'drosie-genetics-lab/teacher/worksheets.html',
  'fruit-fly-biology/index.html', 'fruit-fly-life-cycle-activities/index.html', 'science-activities/index.html', 'teacher-resources/index.html',
  'team.html', '404.html', 'cite/index.html'];

/* Optional files that the pages probe for by design (a missing file is the supported default): recorded narration audio/cues. */
const OPTIONAL = /\/letters\/assets\/audio\/letter-\d+\.(mp3|cues\.json)$/;
const results = []; let current = 'init';
function suite(name) { current = name; console.log('\n== ' + name); }
function ok(cond, msg, detail) {
  results.push({ suite: current, ok: !!cond, msg, detail: cond ? undefined : detail });
  console.log((cond ? '  PASS ' : '  FAIL ') + msg + (cond || detail === undefined ? '' : '  -> ' + String(detail).slice(0, 300)));
  return !!cond;
}
function skip(msg) { results.push({ suite: current, ok: null, msg }); console.log('  SKIP ' + msg); }
function summary() {
  const pass = results.filter(r => r.ok === true).length, fail = results.filter(r => r.ok === false).length, sk = results.filter(r => r.ok === null).length;
  console.log(`\n${pass} passed, ${fail} failed, ${sk} skipped`);
  if (process.env.REPORT) fs.writeFileSync(process.env.REPORT, JSON.stringify({ root: ROOT, browser: process.env.BROWSER || 'chromium', pass, fail, skipped: sk, results }, null, 1));
  return fail;
}

async function launch() {
  const name = process.env.BROWSER || 'chromium';
  const pw = require('playwright');
  try { return { browser: await pw[name].launch(), name, pw }; }
  catch (e) { return { error: e.message.split('\n')[0], name, pw }; }
}

/* Opens a page with all non-local requests aborted; records errors and external attempts. */
async function open(browser, base, rel, opts = {}) {
  const context = await browser.newContext(opts.context || { viewport: { width: 1280, height: 800 } });
  const external = [], failed = [], errors = [];
  await context.route(/^(https?|wss?):\/\/(?!127\.0\.0\.1)/, (r) => { external.push(r.request().url()); r.abort(); });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text().slice(0, 160)); });
  page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !OPTIONAL.test(r.url())) failed.push(r.status() + ' ' + r.url().replace(base, '')); });
  const resp = await page.goto(base + '/' + rel, { waitUntil: 'load' }).catch(e => ({ _err: e.message }));
  await page.waitForTimeout(opts.wait ?? 700);
  return { context, page, external, failed, errors, resp };
}

module.exports = { ROOT, PAGES, serve, suite, ok, skip, summary, launch, open, results };
