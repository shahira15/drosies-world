// Privacy: during a full learner session, nothing is sent anywhere. Every request must be a GET to our own origin for a static file.
const { chromium } = require('playwright');
const { ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
(async () => {
  const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const page = await ctx.newPage();
  const reqs = [], ws = []; page.on('pageerror', (e) => console.log('PAGEERR', e.message)); page.on('console', (m) => m.type() === 'error' && console.log('CERR', m.text())); page.on('request', (r) => reqs.push({ m: r.method(), u: r.url(), body: r.postData() })); page.on('websocket', (w) => ws.push(w.url()));
  await page.addInitScript(() => { window.__net = []; const wrap = (o, n) => { const f = o[n]; if (f) o[n] = function () { window.__net.push(n); return f.apply(this, arguments); }; }; wrap(window, 'fetch'); wrap(navigator, 'sendBeacon'); const X = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function () { window.__net.push('xhr'); return X.apply(this, arguments); }; });
  const SECRET = 'ZzPrivateNickQ9';
  await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch1');
  await page.evaluate(([S, f]) => { eval('(' + f + ')')('A'); DC.state.nick = S; DC.state.b.f.title = 'Secret project title ' + S; DC.state.abs.bg = 'Private background about the flies and the weather, written by ' + S + '.'; DC.state.refl.proud = 'Proud ' + S; DC.saveNow(); }, [SECRET, SEED_ALL.toString()]);
  for (let n = 1; n <= 10; n++) { await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch' + n); await page.reload(); if (n === 10) { await page.locator('[data-act=finCert]').click().catch(() => {}); await Promise.all([page.waitForEvent('download'), page.locator('[data-act=finPortfolio]').click()]); await Promise.all([page.waitForEvent('download'), page.locator('[data-act=exportJson]').click()]); } }
  await page.evaluate(() => { window.print = () => {}; DC.acts.finPrintCert && document.querySelector('[data-act=finPrintAbs]').click(); });
  const net = await page.evaluate(() => window.__net);
  const origin = 'http://localhost:8123/';
  const foreign = reqs.filter((r) => !r.u.startsWith(origin) && !r.u.startsWith('data:') && !r.u.startsWith('blob:'));
  const nonGet = reqs.filter((r) => r.m !== 'GET');
  const leaks = reqs.filter((r) => r.u.includes(SECRET) || (r.body || '').includes(SECRET));
  console.log('requests observed:', reqs.length, '| distinct paths:', [...new Set(reqs.map((r) => new URL(r.u).pathname.split('/').pop()))].join(', '));
  ok(foreign.length === 0, 'no request leaves our own origin (' + foreign.map((r) => r.u).join(',') + ')');
  ok(nonGet.length === 0, 'no POST/PUT/other writes (' + nonGet.map((r) => r.m + ' ' + r.u).join(',') + ')');
  ok(leaks.length === 0, 'learner-entered text never appears in any URL or body');
  ok(net.length === 0, 'page never called fetch / XHR / sendBeacon (' + net.join(',') + ')');
  ok(ws.length === 0, 'no WebSockets');
  const store = await page.evaluate(() => ({ keys: Object.keys(localStorage), ss: Object.keys(sessionStorage), cookies: document.cookie, idb: indexedDB.databases ? null : null }));
  ok(store.keys.length === 1 && store.keys[0] === 'drosieConference.v1' && store.cookies === '', 'only one localStorage key; no cookies (' + store.keys.join(',') + ')');
  ok((await ctx.cookies()).length === 0, 'browser context holds no cookies');
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
