/* save.js: local, on-device progress (localStorage). No accounts, no names, nothing leaves the browser.
 * Stored under one key ("dw.progress.v1"). Reset clears it.
 */
(function () {
  'use strict';
  const DW = window.DW;
  const KEY = 'progress.v1';
  const blank = () => ({
    v: 1,
    lab0: { done: {}, first: {}, badges: [], journal: [], completed: false, diff: 'explorer', refresher: 0 },
    lab1: { completed: false, teacherUnlocked: false },
    teacher: { last: null },
    seenIntro: false,
  });
  function merge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  let data = merge(blank(), DW.store.get(KEY, {}) || {});
  const commit = () => DW.store.set(KEY, data);

  const S = (DW.save = {
    get: () => data,
    commit,
    seenIntro() { return !!data.seenIntro; },
    markIntro() { data.seenIntro = true; commit(); },
    isDone: (n) => !!data.lab0.done[n],
    firstTry: (n) => data.lab0.first[n],
    unlocked(n) { return n === 1 || !!data.lab0.done[n - 1]; },
    nextMission() { for (let n = 1; n <= 7; n++) if (!data.lab0.done[n]) return n; return 0; },
    doneCount() { let c = 0; for (let n = 1; n <= 7; n++) if (data.lab0.done[n]) c++; return c; },
    complete(n, res) {
      data.lab0.done[n] = true;
      const prev = data.lab0.first[n];
      if (res && (!prev || res.first > prev.first)) data.lab0.first[n] = { first: res.first, total: res.total };
      commit();
    },
    lab0Complete() { return !!data.lab0.completed; },
    setLab0Complete() { data.lab0.completed = true; commit(); },
    lab1Unlocked() { return !!(data.lab0.completed || data.lab1.teacherUnlocked); },
    teacherUnlock() { data.lab1.teacherUnlocked = true; commit(); },
    lab1Complete() { data.lab1.completed = true; commit(); },
    isLab1Complete: () => !!data.lab1.completed,
    addBadge(id) { if (!data.lab0.badges.includes(id)) { data.lab0.badges.push(id); commit(); } },
    hasBadge: (id) => data.lab0.badges.includes(id),
    addJournal(id) { if (!data.lab0.journal.includes(id)) { data.lab0.journal.push(id); commit(); return true; } return false; },
    hasJournal: (id) => data.lab0.journal.includes(id),
    diff() { return data.lab0.diff; },
    setDiff(d) { data.lab0.diff = d; commit(); },
    saveTeacher(r) { data.teacher.last = r; commit(); },
    reset() {
      try { localStorage.removeItem('dw.' + KEY); } catch (e) { /* ignore */ }
      data = blank();
    },
  });

  // hydrate in-memory sets
  DW.state.sBadges = new Set(data.lab0.badges);
  DW.state.sJournal = new Set(data.lab0.journal);
})();
