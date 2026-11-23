/* Drosie's Lab Notebook Academy · Station 5 (drawing studio) and Station 6 (data integrity) */
(() => {
'use strict';
const FA = window.FA, { $, $$, esc } = FA;
const S = () => FA.st();

/* =============================================================== STATION 5 · Scientific drawing studio */
const SPEC = `
<g stroke="#5a3a14" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="4">
  <path d="M148 112L112 96L94 112M142 132L100 138L82 164M146 148L108 182L96 222M212 112L248 96L266 112M218 132L260 138L278 164M214 148L252 182L264 222"/></g>
<ellipse cx="180" cy="235" rx="34" ry="66" fill="#e0b56a" stroke="#5a3a14" stroke-width="2"/>
<g stroke="#5a3a14" stroke-width="3" fill="none"><path d="M150 205Q180 214 210 205M147 225Q180 234 213 225M147 245Q180 254 213 245M150 265Q180 274 210 265M155 283Q180 291 205 283"/></g>
<ellipse cx="180" cy="130" rx="38" ry="42" fill="#d9a456" stroke="#5a3a14" stroke-width="2"/><circle cx="180" cy="170" r="10" fill="#c9923f" stroke="#5a3a14" stroke-width="1.5"/>
<g fill="#cfe7f5" fill-opacity=".62" stroke="#6f93a8" stroke-width="2"><path d="M150 120C110 140 84 200 98 262C118 276 150 236 160 180Z"/><path d="M210 120C250 140 276 200 262 262C242 276 210 236 200 180Z"/></g>
<g stroke="#6f93a8" stroke-width="1.2" fill="none"><path d="M148 130C124 170 112 220 108 256M146 150C130 180 124 210 122 240M212 130C236 170 248 220 252 256M214 150C230 180 236 210 238 240"/></g>
<g fill="#5a3a14"><circle cx="147" cy="154" r="3.4"/><circle cx="213" cy="154" r="3.4"/></g><g stroke="#5a3a14" stroke-width="1.6"><path d="M147 154L152 146M213 154L208 146"/></g>
<ellipse cx="180" cy="70" rx="27" ry="22" fill="#c9985a" stroke="#5a3a14" stroke-width="2"/>
<ellipse cx="155" cy="66" rx="12" ry="16" fill="#b3262f" stroke="#5a3a14" stroke-width="1.5"/><ellipse cx="205" cy="66" rx="12" ry="16" fill="#b3262f" stroke="#5a3a14" stroke-width="1.5"/>
<g stroke="#5a3a14" stroke-width="2" fill="#5a3a14"><path d="M174 50L169 34M186 50L191 34" fill="none"/><circle cx="169" cy="33" r="3.2"/><circle cx="191" cy="33" r="3.2"/></g>`;
const ANCH = { head: [180, 76, 'Head'], eye: [155, 62, 'Compound eye'], antenna: [191, 34, 'Antenna'], thorax: [180, 125, 'Thorax'], abdomen: [180, 245, 'Abdomen'], wing: [255, 220, 'Wing'], leg: [266, 164, 'Leg'], haltere: [213, 154, 'Haltere'] };
const DECOY = ['Tail', 'Stinger', 'Second pair of wings', 'Fins'];
const LAB_POS = { head: [296, 100], eye: [20, 30], antenna: [250, 14], thorax: [20, 125], abdomen: [20, 300], wing: [20, 235], leg: [296, 190], haltere: [296, 150] };
const BUILD = {
  head: { n: 'Head', svg: '<ellipse cx="180" cy="70" rx="27" ry="22" fill="#fff" stroke="#1c2b28" stroke-width="2.2"/>' },
  eyes: { n: 'Compound eyes (2)', svg: '<ellipse cx="155" cy="66" rx="12" ry="16" fill="#f4d9d3" stroke="#1c2b28" stroke-width="2"/><ellipse cx="205" cy="66" rx="12" ry="16" fill="#f4d9d3" stroke="#1c2b28" stroke-width="2"/>' },
  antennae: { n: 'Antennae (2)', svg: '<path d="M174 50L169 34M186 50L191 34" stroke="#1c2b28" stroke-width="2.2" fill="none"/><circle cx="169" cy="33" r="3" fill="#1c2b28"/><circle cx="191" cy="33" r="3" fill="#1c2b28"/>' },
  thorax: { n: 'Thorax', svg: '<ellipse cx="180" cy="130" rx="38" ry="42" fill="#fff" stroke="#1c2b28" stroke-width="2.2"/>' },
  abdomen: { n: 'Abdomen', svg: '<ellipse cx="180" cy="235" rx="34" ry="66" fill="#fff" stroke="#1c2b28" stroke-width="2.2"/><path d="M150 205Q180 214 210 205M147 225Q180 234 213 225M147 245Q180 254 213 245M150 265Q180 274 210 265" stroke="#1c2b28" stroke-width="1.6" fill="none"/>' },
  legs: { n: 'Six legs (3 pairs on the thorax)', svg: '<path d="M148 112L112 96L94 112M142 132L100 138L82 164M146 148L108 182L96 222M212 112L248 96L266 112M218 132L260 138L278 164M214 148L252 182L264 222" stroke="#1c2b28" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  wings: { n: 'One pair of wings (2 wings)', svg: '<path d="M150 120C110 140 84 200 98 262C118 276 150 236 160 180Z" fill="#fff" fill-opacity=".5" stroke="#1c2b28" stroke-width="2"/><path d="M210 120C250 140 276 200 262 262C242 276 210 236 200 180Z" fill="#fff" fill-opacity=".5" stroke="#1c2b28" stroke-width="2"/>' },
  halteres: { n: 'Halteres (tiny balancing knobs)', svg: '<circle cx="147" cy="154" r="3.6" fill="#1c2b28"/><circle cx="213" cy="154" r="3.6" fill="#1c2b28"/><path d="M147 154L152 146M213 154L208 146" stroke="#1c2b28" stroke-width="1.6"/>' }
};
const GUIDE = '<g stroke="#9db4a8" stroke-width="1.5" stroke-dasharray="5 4" fill="none"><ellipse cx="180" cy="70" rx="27" ry="22"/><ellipse cx="180" cy="130" rx="38" ry="42"/><ellipse cx="180" cy="235" rx="34" ry="66"/></g>';
let vb = { z: 1, cx: 180, cy: 180 };
/** Standalone SVG of the learner's drawing (used on the page, in the notebook entry and in printouts). */
FA.drawingSvg = (d, big) => {
  const strokes = (d.strokes || []).map(p => `<path d="${p}" fill="none" stroke="#1c2b28" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const parts = (d.parts || []).map(k => BUILD[k] ? BUILD[k].svg : '').join('');
  const labels = (d.labels || []).map(id => { const a = ANCH[id], p = LAB_POS[id]; if (!a || !p) return ''; const right = p[0] > 180; const tx = right ? p[0] : p[0], ty = p[1]; const lx = right ? p[0] - 4 : p[0] + 74; return `<path d="M${lx} ${ty - 4}L${a[0]} ${a[1]}" stroke="#c4655a" stroke-width="1.4"/><text x="${tx}" y="${ty}" font-family="Verdana,sans-serif" font-size="11.5" font-weight="700" fill="#1c2b28">${a[2]}</text>`; }).join('');
  return `<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(d.title || 'Drawing of an adult fruit fly')}"><rect width="360" height="360" fill="#fff"/>${d.guide ? GUIDE : ''}${parts}${strokes}${labels}</svg>`;
};
const capOf = d => { const sk = (d.strokes || []).length > 0, pt = (d.parts || []).length > 0; return sk && !pt ? 'Observation drawing (drawn freehand from the specimen)' : pt && !sk ? 'Simplified diagram (built from shapes, not drawn from direct observation)' : sk && pt ? 'Observation drawing plus diagram parts' : (d.desc || '').trim().length >= 20 ? 'Written description (no drawing)' : 'No drawing yet'; };
FA.drawCaption = capOf;
FA.stations[5] = {
  render(root) {
    const s = S().s5; if (!s.date) { s.date = FA.today(); FA.save(); }
    const hasMeta = s.title.trim() && s.date && s.spec.trim(), rep = (s.strokes.length > 0) || (s.parts.length >= 4) || (s.desc || '').trim().length >= 20;
    const done = hasMeta && rep && s.labels.length >= 3;
    const v = [vb.cx - 180 / vb.z, vb.cy - 180 / vb.z, 360 / vb.z, 360 / vb.z].map(n => n.toFixed(1)).join(' ');
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Look closely at the fly. Draw what you see. Label the parts.', j: 'Observe the specimen, then draw it and label the parts you can see. Add the title, date and specimen number.', a: 'Draw from observation. Label only structures you can see, record the date and specimen identifier, and note magnification or scale only if you actually know it.' }))}</p>
    <div class="callout"><b>Scientific drawing rules:</b> draw what is visible · use clear outlines · label accurately · do not invent parts · a simplified diagram is not the same as a drawing from observation.</div>
    <div class="two"><div><h3>1. Observe the specimen</h3>
      <svg class="spec" id="specSvg" viewBox="${v}" role="img" aria-label="Illustrated adult fruit fly, dorsal view: head with two compound eyes and two antennae, a thorax with three pairs of legs and one pair of wings, and a striped abdomen.">${SPEC}</svg>
      <p class="starter">Illustrated specimen, dorsal view (from above). It is a stand-in for what you would see through a microscope. No scale bar is shown because this picture has no calibrated scale.</p>
      <div class="toolrow" role="group" aria-label="Zoom and move the specimen view"><button type="button" class="mini" data-act="zin" data-f="zin">Zoom in</button><button type="button" class="mini" data-act="zout">Zoom out</button><button type="button" class="mini" data-act="zreset">Reset view</button><button type="button" class="mini" data-act="pan" data-dx="-30" data-dy="0" aria-label="Move view left">←</button><button type="button" class="mini" data-act="pan" data-dx="0" data-dy="-30" aria-label="Move view up">↑</button><button type="button" class="mini" data-act="pan" data-dx="0" data-dy="30" aria-label="Move view down">↓</button><button type="button" class="mini" data-act="pan" data-dx="30" data-dy="0" aria-label="Move view right">→</button></div>
      <p class="starter">What is visible: 3 body parts (head, thorax, abdomen) · 2 compound eyes · 2 antennae · 6 legs on the thorax · <b>one pair</b> of wings · tiny halteres behind the wings.</p></div>
    <div><h3>2. Draw it</h3>
      <svg class="draw" id="drawSvg" viewBox="0 0 360 360" role="img" aria-label="Your drawing area. Draw with a mouse or finger, or use the shape buttons below."></svg>
      <div class="toolrow"><button type="button" class="mini" data-act="undo" ${s.strokes.length ? '' : 'disabled'}>Undo last line</button><button type="button" class="mini" data-act="clear">Clear lines</button><button type="button" class="mini" data-act="guide" aria-pressed="${s.guide}">${s.guide ? 'Hide' : 'Show'} tracing guide</button></div>
      <p class="starter">Draw by dragging on the box. You do not have to draw freehand: use the shape buttons or the written description instead.</p></div></div>
    <h3>No freehand? Build a simple diagram instead</h3>
    <div class="pills" role="group" aria-label="Diagram parts">${Object.entries(BUILD).map(([k, b]) => `<button type="button" class="pill${s.parts.includes(k) ? ' on' : ''}" aria-pressed="${s.parts.includes(k)}" data-act="part" data-k="${k}" data-f="bp-${k}">${s.parts.includes(k) ? '✓ ' : ''}${esc(b.n)}</button>`).join('')}</div>
    <p class="fb" id="partFb" role="status"></p>
    <div class="fld"><label for="desc">Or describe it in words (optional alternative to drawing)</label><textarea id="desc" data-in="desc" maxlength="400" placeholder="What I can see: …">${esc(s.desc || '')}</textarea></div>
    <h3>3. Label what you can see</h3>
    <div class="row"><div class="fld" style="margin:0;flex:1 1 12rem"><label for="lab">Choose a label</label><select id="lab" data-f="lab"><option value="">Choose…</option>${Object.entries(ANCH).map(([k, a]) => `<option value="${k}">${a[2]}</option>`).join('')}${DECOY.map(d => `<option value="x:${d}">${d}</option>`).join('')}</select></div><button type="button" class="nb alt" data-act="addlab" data-f="addlab">Add label</button></div>
    <p class="fb" id="labFb" role="status"></p><p class="starter">Labels: ${s.labels.length ? s.labels.map(id => ANCH[id][2]).join(', ') : 'none yet'} (${s.labels.length} added; at least 3 needed)</p>
    <h3>4. Complete the drawing record</h3>
    <div class="fgrid"><div class="fld"><label for="dtitle">Drawing title</label><input id="dtitle" data-in="title" maxlength="60" value="${esc(s.title)}" placeholder="Adult fruit fly, dorsal view"></div><div class="fld"><label for="ddate">Date</label><input id="ddate" type="date" data-ch="date" value="${esc(s.date)}"></div><div class="fld"><label for="dspec">Specimen identifier (made-up example)</label><input id="dspec" data-in="spec" maxlength="30" value="${esc(s.spec)}" placeholder="FLY-S-01"></div></div>
    <fieldset class="fld"><legend class="lab">Magnification or scale</legend><div class="optcards"><label class="optc"><input type="radio" name="mag" value="unknown" data-ch="mag" ${s.mag === 'unknown' ? 'checked' : ''}><span>Not known / not measured (no scale bar added)</span></label><label class="optc"><input type="radio" name="mag" value="known" data-ch="mag" ${s.mag === 'known' ? 'checked' : ''}><span>Known. I will write it below</span></label></div>${s.mag === 'known' ? `<input id="magv" data-in="magVal" maxlength="40" aria-label="Magnification or scale" value="${esc(s.magVal)}" placeholder="for example: 10× objective">` : ''}<p class="starter">Only write a magnification or scale if you really know it.</p></fieldset>
    <div class="card"><h3>Your drawing record</h3><div id="finalSvg" style="max-width:20rem">${FA.drawingSvg(s)}</div><p class="starter"><b>${esc(s.title || 'Untitled')}</b> · ${esc(FA.niceDate(s.date))} · Specimen ${esc(s.spec || '—')} · ${s.mag === 'known' && s.magVal ? 'Magnification/scale: ' + esc(s.magVal) : 'Magnification/scale: not known'}<br>${esc(capOf(s))}</p></div>
    ${done ? '<div class="callout ok" role="status"><b>Station complete!</b> You made an honest, labeled drawing record.</div>' : ''}`;
    const ds = $('#drawSvg'), refresh = () => { ds.innerHTML = FA.drawingSvg({ strokes: s.strokes, parts: s.parts, labels: s.labels, guide: s.guide }).replace(/^<svg[^>]*>|<\/svg>$/g, ''); $('#finalSvg').innerHTML = FA.drawingSvg(s); };
    refresh();
    let cur = null, pts = null;
    const pt = e => { const r = ds.getBoundingClientRect(); return [((e.clientX - r.left) / r.width * 360).toFixed(1), ((e.clientY - r.top) / r.height * 360).toFixed(1)]; };
    ds.onpointerdown = e => { e.preventDefault(); ds.setPointerCapture(e.pointerId); pts = [pt(e)]; cur = document.createElementNS('http://www.w3.org/2000/svg', 'path'); cur.setAttribute('fill', 'none'); cur.setAttribute('stroke', '#1c2b28'); cur.setAttribute('stroke-width', '2.2'); cur.setAttribute('stroke-linecap', 'round'); cur.setAttribute('stroke-linejoin', 'round'); ds.appendChild(cur); };
    ds.onpointermove = e => { if (!cur) return; pts.push(pt(e)); cur.setAttribute('d', 'M' + pts.map(p => p.join(' ')).join('L')); };
    const end = () => { if (!cur) return; if (pts.length > 1) { s.strokes.push('M' + pts.map(p => p.join(' ')).join('L')); FA.save(); FA.rerender('zin'); chk(); } else cur.remove(); cur = null; pts = null; };
    ds.onpointerup = end; ds.onpointercancel = end;
    function chk() { const d = S().s5, m = d.title.trim() && d.date && d.spec.trim(), r = d.strokes.length > 0 || d.parts.length >= 4 || (d.desc || '').trim().length >= 20; if (m && r && d.labels.length >= 3 && !S().done[5]) { FA.mark(5); FA.rerender(); } }
    FA.bind({
      zin: () => { vb.z = Math.min(3, +(vb.z + .5).toFixed(1)); FA.rerender('zin'); }, zout: () => { vb.z = Math.max(1, +(vb.z - .5).toFixed(1)); FA.rerender('zin'); }, zreset: () => { vb = { z: 1, cx: 180, cy: 180 }; FA.rerender('zin'); },
      pan: b => { vb.cx = Math.max(60, Math.min(300, vb.cx + +b.dataset.dx)); vb.cy = Math.max(60, Math.min(300, vb.cy + +b.dataset.dy)); FA.rerender(); },
      undo: () => { s.strokes.pop(); FA.save(); FA.rerender('zin'); }, clear: () => { s.strokes = []; FA.save(); FA.rerender('zin'); },
      guide: () => { s.guide = !s.guide; FA.save(); FA.rerender('zin'); },
      part: b => { const k = b.dataset.k, i = s.parts.indexOf(k); if (i >= 0) s.parts.splice(i, 1); else s.parts.push(k); FA.save(); FA.say(i < 0 ? (k === 'wings' ? 'One pair of wings: two wings, one on each side. Flies have only one pair of functional wings.' : k === 'legs' ? 'Six legs: three pairs, all attached to the thorax.' : `${BUILD[k].n} added.`) : `${BUILD[k].n} removed.`); FA.rerender('bp-' + k); chk(); },
      addlab: () => { const sel = $('#lab'), v = sel.value, fb = $('#labFb'); if (!v) { fb.className = 'fb bad'; fb.textContent = 'Choose a label first.'; return; }
        if (v.startsWith('x:')) { fb.className = 'fb bad'; fb.textContent = `A fruit fly does not have a ${v.slice(2).toLowerCase()}. Label only structures you can see. (A fly has one pair of wings.)`; FA.say(fb.textContent, 'Do not invent structures. A drawing should show what is really there.'); return; }
        if (!s.labels.includes(v)) { s.labels.push(v); FA.save(); } FA.say(`${ANCH[v][2]} labeled.`); FA.rerender('addlab'); chk(); }
    }, {
      desc: f => { s.desc = f.value.slice(0, 400); FA.save(); if (!S().done[5] && (s.desc.trim().length >= 20)) chkLater(); },
      title: f => { s.title = f.value.slice(0, 60); FA.save(); chkLater(); }, spec: f => { s.spec = f.value.slice(0, 30); FA.save(); chkLater(); }, magVal: f => { s.magVal = f.value.slice(0, 40); FA.save(); },
      date: f => { s.date = f.value; FA.save(); FA.rerender('date'); chk(); },
      mag: f => { s.mag = f.value; FA.save(); FA.rerender(); }
    });
    let t = null; const chkLater = () => { clearTimeout(t); t = setTimeout(() => { const d = S().s5; if (!S().done[5] && d.title.trim() && d.spec.trim() && d.labels.length >= 3 && (d.strokes.length > 0 || d.parts.length >= 4 || (d.desc || '').trim().length >= 20)) { FA.mark(5); FA.rerender(); } }, 900); };
    FA.intro('Look at the fly closely. Which parts can you see? Draw only what you see.', 'A good scientific drawing records what is visible. Labels and a date make it a useful record.');
  }
};

/* =============================================================== STATION 6 · The data integrity challenge */
const SC = {
  A: { t: 'A: An unexpected result', story: () => FA.T({ e: 'Three trials counted 4 flies. One trial counted 1 fly. What should you do?', j: 'Trials 1, 2 and 4 each had 4 flies crossing the line. Trial 3 had only 1. What should you do with Trial 3?', a: 'Trials 1, 2 and 4 each gave 4 flies crossing the line. Trial 3 gave 1. There is no known reason. What do you do with the Trial 3 value?' }), table: [['1', '4'], ['2', '4'], ['3', '1'], ['4', '4']],
    opts: [['del', 'Delete it because it is different', 0], ['keep', 'Record it, look for possible explanations, and consider repeating the trial', 1], ['chg', 'Change the 1 to a 4 so it matches', 0]],
    why: 'Record it. An unexpected result is still a result. Write down what you know about the conditions, think about possible explanations, and consider repeating the trial. Do not secretly delete or change it.' },
  B: { t: 'B: A missing unit', story: () => 'The notebook says <b>Temperature: 25</b>. The lab thermometer measures in degrees Celsius. What is missing?', unit: true, why: 'A measurement needs its unit. “25” could mean many things. “25 °C” says exactly what was measured.' },
  C: { t: 'C: A forgotten observation', story: () => FA.T({ e: 'You forgot to count the flies in Trial 4. What do you write?', j: 'You were called away and never counted Trial 4. Later you cannot remember the result. What do you write?', a: 'You were interrupted and never counted Trial 4, and you cannot reliably recall the result. What do you enter for Trial 4?' }), opts: [['guess', 'Write my best guess as the number', 0], ['miss', 'Write “not recorded” and explain what happened', 1], ['copy', 'Copy the number from Trial 3', 0]],
    why: 'Do not invent a number. Mark the value as missing or unknown and write why. For example: “Trial 4: count not recorded. I was called away before counting.”' },
  D: { t: 'D: A changed procedure', story: () => 'Trials 1 to 3 were observed for <b>10 seconds</b>. Before Trial 4 the scientist decides to observe for <b>15 seconds</b>. What should the notebook show?', table: [['1–3', '10 s'], ['4', '15 s']], opts: [['all', 'Change every trial to 15 s so they match', 0], ['note', 'Record the change (what, when and why) and mark which trials used 10 s and which used 15 s', 1], ['none', 'Do not mention it', 0]],
    why: 'Record the change, say why, and identify which trials used which procedure. Results from different procedures should not be mixed up without saying so.' },
  E: { t: 'E: A mistaken entry', story: () => 'You wrote “<b>8 flies</b>” for Trial 2. Later you recount and confirm there were <b>5</b> flies. How do you correct it?', why: '' }
};
SC.E1 = { t: 'E: correction on paper', why: 'Draw a single line through the original so it stays readable, write the corrected value, and add the date (and initials if your lab requires them). Never hide the original.' };
SC.E2 = { t: 'E: correction in an electronic record', why: 'Keep the original entry and show a visible correction history with the date and reason, so the change can be traced.' };
FA.stations[6] = {
  render(root) {
    const s = S().s6.sc, ok = id => s[id] && s[id].ok, allDone = ['A', 'B', 'C', 'D', 'E1', 'E2'].every(x => s[x] && s[x].ever);
    const opt = (id, o) => `<div class="pills" role="radiogroup" aria-label="${esc(SC[id].t)}">${o.map(([k, t, c]) => `<button type="button" class="pill${s[id] && s[id].pick === k ? (s[id].ok ? ' good' : ' bad') : ''}" data-act="sc" data-id="${id}" data-k="${k}" data-c="${c}" data-f="${id}-${k}">${esc(t)}</button>`).join('')}</div><p class="fb ${s[id] ? (s[id].ok ? 'good' : 'bad') : ''}" role="status">${s[id] ? (s[id].ok ? '✓ ' + esc(SC[id].why) : 'Not quite. Think about what keeps the record honest and complete, then try again.') : ''}</p>`;
    const tbl = id => SC[id].table ? `<div class="scroll"><table class="tbl"><caption class="sr-only">Data for scenario ${id}</caption><thead><tr><th scope="col">Trial</th><th scope="col">${id === 'D' ? 'Interval' : 'Flies crossing'}</th></tr></thead><tbody>${SC[id].table.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div>` : '';
    const eOk1 = s.E1 && s.E1.ok, eOk2 = s.E2 && s.E2.ok, today = FA.niceDate(FA.today());
    root.innerHTML = `<p class="prompt">${esc(FA.T({ e: 'Scientists write down what really happened. Let us practice with five stories.', j: 'Five short stories show how scientists keep honest, complete records. Pick the best action for each.', a: 'Five scenarios on honest, complete data recording. Choose the response that keeps the record accurate and traceable.' }))}</p>
    <div class="callout"><b>Everyone makes mistakes.</b> What matters is writing them down openly and fixing them in a way that others can follow. You will not be scolded here. You will practice.</div>
    ${['A', 'C', 'D'].map(id => `<section class="card" aria-labelledby="h-${id}"><h3 id="h-${id}">${SC[id].t}</h3><p>${SC[id].story()}</p>${tbl(id)}${opt(id, SC[id].opts)}</section>`).join('')}
    <section class="card" aria-labelledby="h-B"><h3 id="h-B">${SC.B.t}</h3><p>${SC.B.story()}</p><div class="row"><span class="badge">Temperature: 25 ${s.B && s.B.ok ? '°C' : '___'}</span><div class="fld" style="margin:0"><label for="unit">Add the unit</label><select id="unit" data-f="unit"><option value="">Choose…</option><option value="°C">°C (degrees Celsius)</option><option value="°F">°F (degrees Fahrenheit)</option><option value="%">% (percent)</option><option value="s">s (seconds)</option></select></div><button type="button" class="nb alt" data-act="unit">Add unit</button></div><p class="fb ${s.B ? (s.B.ok ? 'good' : 'bad') : ''}" role="status">${s.B ? (s.B.ok ? '✓ ' + esc(SC.B.why) : 'That unit does not match a Celsius thermometer. Which unit did the thermometer measure in?') : ''}</p></section>
    <section class="card" aria-labelledby="h-E"><h3 id="h-E">${SC.E.t}</h3><p>${SC.E.story()}</p>
      <h4>On paper</h4>${opt('E1', [['scrib', 'Scribble over the 8 until it cannot be read, then write 5', 0], ['line', 'Draw a single line through the 8 so it is still readable, write 5 next to it, and add the date (and initials if your lab requires them)', 1], ['erase', 'Erase the 8 and write 5', 0]])}
      <h4>In an electronic record</h4>${opt('E2', [['over', 'Replace the 8 with 5 and keep no trace', 0], ['hist', 'Keep the original entry and show a visible correction history with the date and reason', 1], ['del', 'Delete the entry and re-enter it as new', 0]])}
      ${eOk1 ? `<div class="doc"><p>Trial 2: <s>8</s> <span class="corr">5</span> flies <span class="starter">(corrected ${esc(today)}, initials ab: recounted, confirmed 5 flies)</span></p><p class="starter">Original entry still readable · reason given · date recorded. Initials and witnesses are required only in some labs.</p></div>` : ''}
    </section>
    <section class="card" aria-labelledby="h-def"><h3 id="h-def">Three different things</h3><ul><li><b>Honest error:</b> an unintentional mistake, like miscounting. Fix it openly. This is not misconduct.</li><li><b>Fabrication:</b> making up data or results.</li><li><b>Falsification:</b> changing or leaving out data or results so the record does not accurately show what was found.</li></ul><p class="starter">These are the general ideas used in research integrity guidance (for example from the US Office of Research Integrity). Real institutions have their own policies.</p></section>
    ${allDone ? '<div class="callout ok" role="status"><b>Station complete!</b> You know how to keep an honest, complete record.</div>' : ''}`;
    FA.bind({
      sc: b => { const id = b.dataset.id, good = b.dataset.c === '1', prev = s[id]; s[id] = { pick: b.dataset.k, ok: good }; if (prev && prev.ever) s[id].ever = true; if (good) s[id].ever = true; FA.save(); FA.say(good ? (SC[id] && SC[id].why || (id === 'E1' ? 'Draw one line through the old entry so it stays readable, then add the correction with the date.' : 'Preserve the original entry and keep a visible correction history.')) : 'Not quite. Think about what keeps the record honest and complete.', 'Corrections should never hide the original information.'); FA.rerender(`${id}-${b.dataset.k}`); fin(); },
      unit: () => { const v = $('#unit').value; if (!v) return; const good = v === '°C'; s.B = { pick: v, ok: good, ever: good || (s.B && s.B.ever) }; FA.save(); FA.say(good ? SC.B.why : 'Check the unit. The thermometer measures in degrees Celsius.'); FA.rerender('unit'); fin(); }
    });
    function fin() { const q = S().s6.sc, e = x => q[x] && q[x].ever; if (['A', 'B', 'C', 'D', 'E1', 'E2'].every(e) && !S().done[6]) { FA.mark(6); FA.rerender(); } }
    FA.intro('Five stories about honest data. What should the scientist do?', 'Complete, honest records let others trust and check the work.');
  }
};
})();
