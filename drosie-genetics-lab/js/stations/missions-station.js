import { newProgress, stepsDone, gradeAnswer, missionsForMode } from '../missions.js';
import { STATIONS } from '../lab-scene.js';

export function renderMissions(app, el, params) {
  const s = app.state, esc = app.esc, mode = app.mode();
  const list = missionsForMode(mode);
  const cur = list.filter(m => m.mode === mode);
  const sel = (params.id && app.MISSIONS.find(m => m.id === params.id)) || (app.state.activeMission && app.MISSIONS.find(m => m.id === app.state.activeMission)) || cur.find(m => !app.state.missions[m.id]?.complete) || cur[0];
  const order = ['little', 'junior', 'researcher', 'university'];
  const groups = [mode, ...order.filter(m => m !== mode)].filter(m => list.some(x => x.mode === m));
  const status = m => { const p = s.missions[m.id]; return p?.complete ? 'done' : p && Object.keys(p.steps).length ? 'started' : 'new'; };

  const board = `<div class="board">${groups.map(g => `<section><h3 style="--c:${app.MODES[g].color}"><span class="dot"></span>${app.MODES[g].name}</h3>
    <div class="mission-cards">${list.filter(m => m.mode === g).map((m, i) => `<button class="mission-card ${status(m)} ${sel && sel.id === m.id ? 'on' : ''}" data-m="${m.id}">
      <span class="pin" aria-hidden="true"></span><span class="mnum">${m.id}</span><b>${esc(m.title)}</b>
      <span class="mstatus">${{ done: '✓ Complete', started: 'In progress', new: 'Not started' }[status(m)]}</span></button>`).join('')}</div></section>`).join('')}
    <p class="small muted">${list.length} missions available at this level. Change level (top bar) to see more.</p></div>`;

  el.innerHTML = `<div class="missions-layout">${board}<section class="mission-detail" aria-live="polite">${sel ? detail(app, sel) : '<div class="empty">Choose a mission card.</div>'}</section></div>`;
  el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => app.open('missions', { id: b.dataset.m }));
  if (sel) bindDetail(app, el, sel);
}

function detail(app, m) {
  const esc = app.esc;
  const p = app.state.missions[m.id] || newProgress();
  const active = app.state.activeMission === m.id;
  const done = stepsDone(m, p);
  const station = id => STATIONS.find(s => s.id === id)?.name || id;
  return `<article class="mission">
    <header><span class="mnum big">${m.id}</span><h2>${esc(m.title)}</h2>
      ${active ? '<span class="badge">Active mission</span>' : `<button class="btn primary" id="activate">Start this mission</button>`}</header>
    <div class="cols-2">
      <div><h4>Learning objectives</h4><ul>${m.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
        <h4>Scientific background</h4><p>${m.background}</p>
        ${app.mode() !== 'little' ? `<details><summary>Underlying genetic model</summary><p class="small">${esc(m.model)}</p></details>` : ''}</div>
      <div><h4>Your experiment</h4>
        ${m.prediction ? predictionBlock(app, m, p) : ''}
        <ol class="steps">${m.steps.map(st => `<li class="${p.steps[st.id] ? 'done' : ''}"><span class="check" aria-hidden="true">${p.steps[st.id] ? '✓' : ''}</span><span class="st-text">${esc(st.text)}
          ${!p.steps[st.id] && st.where ? `<button class="link" data-go="${st.where}">Go to ${esc(station(st.where))} →</button>` : ''}</span><span class="sr-only">${p.steps[st.id] ? '(done)' : '(to do)'}</span></li>`).join('')}</ol>
        ${m.quiz ? quizBlock(app, m, p, done) : ''}
        ${p.complete ? `<div class="callout good"><b>Mission complete!</b> ${m.feedback.correct}</div>` : ''}
        <p class="small muted">Completion: all experiment steps${m.quiz ? ' + a correct answer based on your data' : ''}.</p>
      </div></div></article>`;
}

function predictionBlock(app, m, p) {
  if (p.prediction != null) return `<p class="callout">Your prediction: <b>${app.esc(m.prediction.options[p.prediction])}</b></p>`;
  return `<div class="panel"><p><b>${app.esc(m.prediction.prompt)}</b></p><div class="row">${m.prediction.options.map((o, i) => `<button class="btn" data-pred="${i}">${app.esc(o)}</button>`).join('')}</div></div>`;
}

function quizBlock(app, m, p, done) {
  const esc = app.esc, q = m.quiz;
  if (!done) return `<p class="small muted">🔒 The final question unlocks when every step is done.</p>`;
  if (p.complete) return '';
  return `<form class="panel quiz" id="quiz"><p><b>${esc(q.prompt)}</b></p>
    ${q.kind === 'choice' ? q.options.map((o, i) => `<label class="opt"><input type="radio" name="a" value="${i}" required> ${esc(o)}</label>`).join('')
      : `<input name="a" type="number" step="any" required class="mono" aria-label="Your answer">`}
    <div class="row"><button class="btn primary">Submit answer</button></div>
    ${p.answered && !p.correct ? `<div class="callout warn">${m.feedback.incorrect}</div>` : ''}</form>`;
}

function bindDetail(app, el, m) {
  const p = (app.state.missions[m.id] ||= newProgress());
  el.querySelector('#activate')?.addEventListener('click', () => {
    app.state.activeMission = m.id; app.save(); app.updateHud(); app.sfx('success');
    app.dialog([`Mission <b>${app.esc(m.title)}</b> is active. I'll track your progress in the top bar.`, m.steps[0] ? `First step: ${app.esc(m.steps[0].text)}` : '']);
    app.rerender();
  });
  el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => app.open(b.dataset.go));
  el.querySelectorAll('[data-pred]').forEach(b => b.onclick = () => { p.prediction = +b.dataset.pred; app.emit({ type: 'prediction', mission: m.id, value: p.prediction }); app.save(); app.rerender(); });
  const quiz = el.querySelector('#quiz');
  if (quiz) quiz.onsubmit = e => {
    e.preventDefault();
    const v = m.quiz.kind === 'choice' ? quiz.querySelector('input[name=a]:checked')?.value : quiz.a.value;
    const { correct } = gradeAnswer(m, p, v, app);
    app.save(); app.sfx(correct ? 'success' : 'error');
    if (correct) { app.dialog([m.feedback.correct], { mood: 'wow' }); app.emit({ type: 'mission-complete', id: m.id }); }
    app.updateHud(); app.rerender();
  };
}
