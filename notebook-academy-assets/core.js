/* Drosie's Lab Notebook Academy · core: state, storage, levels, navigation, read-aloud, preferences */
(() => {
'use strict';
const FA = window.FA = { stations: {}, views: {} };
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
Object.assign(FA, { $, $$, esc });

/* ------------------------------------------------------------ local-only storage */
const KEY = 'drosie-notebook-academy-v1', PREF = 'drosie-notebook-academy-prefs-v1';
let memory = null;
const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const blank = () => ({
  v: 1, level: 'junior', cur: 1, done: {},
  s1: { parts: [], cmp: {} },
  s2: { book: null, title: '', tocAdded: false, numbered: false, date: '', expId: '', nbId: '' },
  s3: { rec: {}, played: {}, why: null, t2: null, tries: {} },
  s4: { ans: {} },
  s5: { title: '', date: '', spec: '', mag: 'unknown', magVal: '', strokes: [], parts: [], labels: [], desc: '', guide: false },
  s6: { sc: {} },
  s7: { fixed: {} },
  s8: { draft: {}, final: null, corrections: [], done: false }
});
let st = blank();
try { const s = JSON.parse(read(KEY) || 'null'); if (s && s.v === 1) { const b = blank(); Object.keys(b).forEach(k => { st[k] = (typeof b[k] === 'object' && !Array.isArray(b[k]) && s[k]) ? Object.assign({}, b[k], s[k]) : (s[k] !== undefined ? s[k] : b[k]); }); } } catch (e) { /* ignore corrupted storage */ }
FA.st = () => st;
FA.save = () => { const ok = write(KEY, JSON.stringify(st)); if (!ok) { memory = st; } return ok; };
FA.today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
FA.time = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
FA.niceDate = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return m ? `${M[+m - 1]} ${+d}, ${y}` : iso; };

/* ------------------------------------------------------------ levels */
FA.LEVELS = { explorer: 'Explorer', junior: 'Junior Scientist', apprentice: 'Research Apprentice' };
FA.lv = () => st.level;
/** Pick wording for the current level: T({e, j, a}) falls back from apprentice to junior to explorer text. */
FA.T = o => o[st.level[0]] ?? o.j ?? o.e ?? o.a;
FA.atLeast = lv => ['explorer', 'junior', 'apprentice'].indexOf(st.level) >= ['explorer', 'junior', 'apprentice'].indexOf(lv);

/* ------------------------------------------------------------ preferences */
const prefs = Object.assign({ large: false, contrast: false, motion: false, easy: false }, (() => { try { return JSON.parse(read(PREF) || '{}'); } catch (e) { return {}; } })());
const rm = () => prefs.motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
FA.rm = rm;
function applyPrefs() { const h = document.documentElement; h.classList.toggle('large', !!prefs.large); h.classList.toggle('contrast', !!prefs.contrast); h.classList.toggle('rm', !!prefs.motion); h.classList.toggle('easy', !!prefs.easy); $$('[data-pref]').forEach(i => { i.checked = !!prefs[i.dataset.pref]; }); }
$$('[data-pref]').forEach(i => i.addEventListener('change', () => { prefs[i.dataset.pref] = i.checked; write(PREF, JSON.stringify(prefs)); applyPrefs(); }));
$('#prefBtn').addEventListener('click', () => $('#prefDlg').showModal());

/* ------------------------------------------------------------ read-aloud (optional, never automatic) */
const sp = { ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, speaking: false, paused: false, text: '' };
const readBtn = $('#readBtn'), pauseBtn = $('#pauseBtn'), readMsg = $('#readMsg');
function ui() { readBtn.textContent = sp.speaking ? 'Stop' : 'Read aloud'; pauseBtn.hidden = !sp.speaking; pauseBtn.textContent = sp.paused ? 'Resume' : 'Pause'; }
FA.stopSpeech = () => { if (sp.ok) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } } sp.speaking = false; sp.paused = false; ui(); };
FA.speak = text => {
  if (!sp.ok) { readMsg.textContent = 'Read-aloud is not available in this browser. The words are on screen.'; return; }
  if (sp.speaking) { FA.stopSpeech(); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).slice(0, 1800)); const v = speechSynthesis.getVoices().find(x => /^en/i.test(x.lang)); if (v) u.voice = v; u.lang = (v && v.lang) || 'en-US'; u.rate = 0.92; u.onend = u.onerror = () => { sp.speaking = false; sp.paused = false; ui(); }; sp.speaking = true; readMsg.textContent = ''; ui(); speechSynthesis.speak(u); }
  catch (e) { sp.speaking = false; readMsg.textContent = 'Read-aloud could not start.'; ui(); }
};
readBtn.addEventListener('click', () => FA.speak(sp.text || $('#coachText').textContent));
pauseBtn.addEventListener('click', () => { try { if (sp.paused) { speechSynthesis.resume(); sp.paused = false; } else { speechSynthesis.pause(); sp.paused = true; } } catch (e) { /* ignore */ } ui(); });
if (!sp.ok) { readBtn.disabled = true; readMsg.textContent = 'Read-aloud is not available here.'; }
document.addEventListener('visibilitychange', () => { if (document.hidden) FA.stopSpeech(); });
window.addEventListener('pagehide', FA.stopSpeech);

/* ------------------------------------------------------------ coach */
FA.say = (text, why) => {
  $('#coachText').textContent = text; sp.text = text; const w = $('#whyBox');
  if (why) { w.hidden = false; w.innerHTML = '<b>Why scientists do this:</b> ' + esc(why); } else w.hidden = true;
  const sr = $('#sr'); sr.textContent = ''; setTimeout(() => { sr.textContent = text; }, 30); if (sp.speaking) FA.stopSpeech();
};
FA.announce = t => { const sr = $('#sr'); sr.textContent = ''; setTimeout(() => { sr.textContent = t; }, 30); };

/* ------------------------------------------------------------ event delegation for the page */
const page = $('#page');
FA.bind = (click, input) => { page._click = click || {}; page._input = input || {}; };
page.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && page.contains(b) && page._click && page._click[b.dataset.act]) page._click[b.dataset.act](b, e); });
page.addEventListener('input', e => { const f = e.target.closest('[data-in]'); if (f && page._input && page._input[f.dataset.in]) page._input[f.dataset.in](f, e); });
page.addEventListener('change', e => { const f = e.target.closest('[data-ch]'); if (f && page._input && page._input[f.dataset.ch]) page._input[f.dataset.ch](f, e); });

/* ------------------------------------------------------------ stations, tabs and progress */
const NAMES = ['What is a real lab notebook?', 'Set up your first lab notebook', 'Record as you go', 'Observation, measurement or interpretation?', 'Scientific drawing studio', 'The data integrity challenge', 'Notebook detective', 'Create a complete notebook entry'];
FA.NAMES = NAMES;
function renderTabs() {
  const nav = $('#tabs'); nav.innerHTML = '';
  NAMES.forEach((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tab' + (st.done[i + 1] ? ' done' : ''); if (st.cur === i + 1) b.setAttribute('aria-current', 'page');
    b.setAttribute('aria-label', `Station ${i + 1}: ${n}${st.done[i + 1] ? ' (complete)' : ''}`); b.innerHTML = `<b aria-hidden="true">${st.done[i + 1] ? '✓' : i + 1}</b><span class="lbl">${esc(n)}</span>`; b.addEventListener('click', () => FA.go(i + 1)); nav.appendChild(b); });
  const n = Object.keys(st.done).filter(k => st.done[k]).length; $('#progress').textContent = `${n} of 8 stations complete`;
  $('#prevSt').disabled = st.cur <= 1; $('#nextSt').hidden = st.cur >= 8; $('#nextSt').classList.toggle('go', !!st.done[st.cur]);
  $('#doneNote').textContent = st.done[st.cur] ? '✓ Station complete' : '';
}
FA.refreshChrome = renderTabs;
FA.mark = n => { if (!st.done[n]) { st.done[n] = true; FA.save(); renderTabs(); FA.announce(`Station ${n} complete.`); } };
FA.go = (n, opts = {}) => {
  st.cur = n; FA.save(); FA.stopSpeech(); showView('station'); renderTabs();
  $('#pageNo').textContent = `Page ${n}`; $('#pageTitle').textContent = NAMES[n - 1]; $('#pageDate').textContent = FA.niceDate(st.s2.date || '') || 'Practice notebook';
  document.title = `${NAMES[n - 1]} · Drosie's Lab Notebook Academy`;
  FA.rerender(); if (!opts.keepFocus) $('#pageTitle').focus({ preventScroll: true });
  if (!opts.noScroll && window.matchMedia('(max-width: 759px)').matches) $('.book').scrollIntoView({ block: 'start', behavior: rm() ? 'auto' : 'smooth' });
};
/** Re-render the current station and put focus back where the learner was working (elements carry data-f keys). */
FA.rerender = focusKey => {
  const ae = document.activeElement, key = focusKey || (ae && page.contains(ae) && ae.dataset && ae.dataset.f), y = window.scrollY;
  const s = FA.stations[st.cur]; if (!s) return; page.innerHTML = ''; s.render(page);
  window.scrollTo(0, y);
  if (key) { const t = page.querySelector(`[data-f="${key}"]`); if (t) t.focus({ preventScroll: true }); }
};
$('#prevSt').addEventListener('click', () => FA.go(Math.max(1, st.cur - 1)));
$('#nextSt').addEventListener('click', () => FA.go(Math.min(8, st.cur + 1)));

/* ------------------------------------------------------------ level selector */
$$('input[name="level"]').forEach(r => { r.checked = r.value === st.level; r.addEventListener('change', () => { st.level = r.value; FA.save(); FA.announce(`Level: ${FA.LEVELS[st.level]}.`); FA.rerender(); }); });

/* ------------------------------------------------------------ views */
function showView(v) {
  ['Station', 'Print', 'Guide'].forEach(k => { $('#view' + k).hidden = (k.toLowerCase() !== v); $('#v' + k).setAttribute('aria-pressed', String(k.toLowerCase() === v)); });
  FA.view = v;
}
FA.showView = showView;
$('#vStation').addEventListener('click', () => FA.go(st.cur));
$('#vPrint').addEventListener('click', () => { showView('print'); FA.views.print(); document.title = "Printables · Drosie's Lab Notebook Academy"; });
$('#vGuide').addEventListener('click', () => { showView('guide'); FA.views.guide(); document.title = "Teacher & parent guide · Drosie's Lab Notebook Academy"; });

/* ------------------------------------------------------------ reset and deletion */
const openReset = () => $('#resetDlg').showModal();
$('#resetBtn').addEventListener('click', openReset);
$('#resetDlg').addEventListener('close', e => {
  if (e.target.returnValue !== 'reset') return;
  try { localStorage.removeItem(KEY); } catch (x) { /* ignore */ }
  const lvl = st.level; st = blank(); st.level = lvl; FA.save(); $$('input[name="level"]').forEach(r => { r.checked = r.value === st.level; });
  FA.go(1); FA.announce('All practice data was deleted from this device.');
});

FA.boot = () => { applyPrefs(); renderTabs(); FA.go(st.cur || 1, { noScroll: true, keepFocus: true }); };
})();
