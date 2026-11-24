// Shared helpers for conference tests. Run: node tests/conference/<file>.js  (needs a static server on :8123 at repo root)
const { chromium } = require('playwright');
const URL = process.env.CONF_URL || 'http://localhost:8123/scientific-conference.html?legacy=1';
async function open(opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  if (opts.init) await ctx.addInitScript(opts.init);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(URL + (opts.hash || ''));
  return { browser, ctx, page, errors };
}
let pass = 0, fail = 0; const fails = [];
function ok(cond, msg) { if (cond) { pass++; console.log('  PASS', msg); } else { fail++; fails.push(msg); console.log('  FAIL', msg); } }
function done() { console.log(`\n${pass} passed, ${fail} failed`); if (fail) { console.log('Failures:\n - ' + fails.join('\n - ')); process.exitCode = 1; } }
async function overflow(page) { return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); }
module.exports = { open, ok, done, overflow, URL };
