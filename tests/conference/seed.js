// Seeds a fully completed Path A (or minimal B) conference into localStorage state, for tests.
exports.SEED_ALL = (path) => {
  const S = DC.state; S.mode = 'guided'; S.nick = 'Zoe'; S.path = path; S.checked = true;
  S.a.acked = true; DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice())); S.det.c3var = { sel: 1, ok: true };
  ['d_mean', 'd_diff', 'd_range', 'd_oi', 'd_cause', 'd_repl', 'limits', 'd_axis'].forEach((k) => (S.det[k] = { ok: true }));
  if (path === 'B') { S.b.f.title = 'Ants at my door'; S.b.f.question = 'When do ants come to my door?'; S.b.f.methods = 'I watched the door.'; S.b.log = [{ label: 'Mon', group: '', value: '4', note: 'ants' }, { label: 'Tue', group: '', value: '6', note: 'ants' }]; S.b.organizerSeen = true; S.b.chart = { kind: 'time', yTitle: 'Ants', xTitle: 'Day', unit: 'ants' }; S.b.claims = [{ text: 'More ants on Tuesday', kind: 'obs', evidence: 'Tue=6, Mon=4' }]; S.det.d_b_oi = { ok: true }; S.det.d_b_rep = { ok: true }; }
  Object.assign(S.abs, path === 'A'
    ? { bg: 'Fruit flies are ectotherms, so air temperature can change how active they are.', obj: 'This simulated activity asked whether fewer flies climb above an 8 cm line at 18 °C than at 25 °C.', methods: 'In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial and counted after 10 seconds in 5 trials.', results: 'At 25 °C the mean was 7.2 flies above the line (range 6 to 8). At 18 °C the mean was 4.2 (range 3 to 5).', conclusion: 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit, so more groups are needed.' }
    : { bg: 'Ants live in colonies near doors.', obj: 'When do ants come to my door?', methods: 'I watched the door each morning at 8 and counted the ants I saw.', results: 'I counted 4 ants on Monday and 6 ants on Tuesday.', conclusion: 'More ants came on Tuesday, which suggests the day might matter, but I only watched two days so more days are needed.' });
  const P = S.poster; P.started = true;
  Object.assign(P.f, { title: S.abs.obj.slice(0, 50), author: 'Zoe', question: S.abs.obj, background: S.abs.bg, methods: S.abs.methods, results: S.abs.results, conclusions: S.abs.conclusion, limitations: '- Only a few tries', ack: 'Thanks to my teacher.', refs: '' });
  P.fig = path === 'A' ? 'auto' : 'auto';
  S.reg.orderOk = true; S.reg.order = ['hello', 'why', 'how', 'found', 'means', 'next'];
  DC.AREAS.forEach((a) => (S.hall.visited[a.id] = true)); ['quill', 'anand', 'waverly'].forEach((id) => (S.hall.sci[id] = { sel: 0, score: 2, best: true }));
  Object.assign(S.prac, { timerDone: true, explain: 'Warm flies climbed more than cool flies in my test.', explainOk: true, qa: { q1: 'My data cannot tell us what all flies do.', q2: 'Fairly sure but not completely.', q3: 'I would test more groups.' }, qaDone: { q1: true, q2: true, q3: true } });
  S.revs = [{ note: 'I changed my conclusion to say suggests because I had one vial only.', changed: true, at: 1 }];
  Object.assign(S.refl, { learned: 'Scientists share, listen and improve their work.', surprise: 'Counting was hard.', next: 'Try three temperatures.', proud: 'My poster.' });
  DC.saveNow();
};
