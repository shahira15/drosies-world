const { open, ok, done } = require('./helpers');
(async () => {
  const { browser, page, errors } = await open({});
  console.log('unit: overclaim detector, stats, rng, hash');
  const r = await page.evaluate(() => ({
    a: DC.overclaim('This proves cold flies climb less.'), b: DC.overclaim('All flies climb less in the cold.'), c: DC.overclaim('My data cannot tell us what all flies do.'),
    d: DC.overclaim('These results suggest cooler flies climb less.'), e: DC.overclaim('Flies always climb.'), f: DC.overclaim('It is not proven.'),
    s: DC.stats([7, 8, 6, 8, 7]), s2: DC.stats([4, 5, 3, 5, 4]), s3: DC.stats([]), med: DC.stats([1, 2, 3, 4]).median,
    r1: DC.rng('x')() === DC.rng('x')(), r2: DC.rng('x')() !== DC.rng('y')(), esc: DC.esc('<a href="x">&\'</a>'), pii1: DC.looksPersonal('me@x.com'), pii2: DC.looksPersonal('Zoe'), pii3: DC.looksPersonal('call 555 123 4567')
  }));
  ok(r.a && r.b && r.e, 'flags proves / "all flies climb" / always');
  ok(!r.c && !r.d && !r.f, 'does not flag careful negated or hedged sentences');
  ok(r.s.mean === 7.2 && r.s.median === 7 && r.s.min === 6 && r.s.max === 8 && r.s.sum === 36, 'stats control: mean 7.2, median 7, range 6-8, sum 36');
  ok(Math.abs(r.s2.mean - 4.2) < 1e-9 && r.s2.median === 4 && r.s2.sum === 21, 'stats cool: mean 4.2, median 4, sum 21');
  ok(r.s3 === null && r.med === 2.5, 'empty stats null; even-length median');
  ok(r.r1 && r.r2, 'seeded rng is deterministic and seed-sensitive');
  ok(!r.esc.includes('<') && r.esc.includes('&lt;') && r.esc.includes('&quot;'), 'esc escapes HTML');
  ok(r.pii1 && !r.pii2 && r.pii3, 'personal-info detector: email yes, nickname no, phone yes');
  ok(errors.length === 0, 'no console errors'); await browser.close(); done();
})();
