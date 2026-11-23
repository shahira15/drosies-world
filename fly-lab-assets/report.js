/* Drosie's Fly Lab · Chapter 6: badge, printable lab report, certificate, then start the game */
(() => {
'use strict';
const FL = window.FL, { $, esc, say, setTask, setMain, setHint, setFill, setDeeper, S } = FL;
const mods = FL.mods;
const D = () => FL.D();
const INGR_NAMES = { water: 'Water', yeast: 'Yeast', sugar: 'Sugar', cornmeal: 'Cornmeal', agar: 'Agar' };
const INGR_WHY = { water: 'moisture; holds the food together', yeast: 'nutrients (protein and vitamins)', sugar: 'energy', cornmeal: 'bulk and nutrients', agar: 'sets the food into a gel' };
const LABEL_TEXT = { lab1: 'What: Fruit Fly Culture', lab2: 'When: Day 0', lab3: "Who: Drosie's Fly Lab" };

const CSS = `*{box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;color:#173f38;margin:0;background:#fff;line-height:1.5}
.page{max-width:760px;margin:0 auto;padding:28px 34px}h1{font-size:28px;margin:0 0 4px;color:#245f55}h2{font-size:18px;margin:22px 0 6px;color:#245f55;border-bottom:2px solid #f6d48c;padding-bottom:3px}
.sub{color:#5a6f64;margin:0 0 10px}table{width:100%;border-collapse:collapse;font-size:14px;margin:6px 0}th,td{border:1px solid #cfdcd1;padding:6px 8px;text-align:left;vertical-align:top}thead th{background:#e8f3e8}
ul{margin:4px 0 4px 20px;padding:0}.box{border:2px dashed #e0c36e;background:#fff9e5;border-radius:10px;padding:10px 14px;margin:14px 0;font-size:14px}
.score{display:flex;gap:18px;font-size:16px;font-weight:bold}.score span{background:#e8f3e8;border-radius:10px;padding:6px 14px}.small{font-size:12px;color:#5a6f64}
@media print{.page{padding:0}h2{break-after:avoid}table,.box{break-inside:avoid}@page{margin:16mm}}`;

function reportHtml() {
  const d = D(), tp = d.setup.temp || 25, T = FL.TEMPS[tp], name = (d.reportName || '').trim();
  const b = FL.score(d.pre), a = FL.score(d.post);
  const ing = d.food.added.map(i => `<li><b>${esc(INGR_NAMES[i])}</b>: ${esc(INGR_WHY[i])}</li>`).join('') || '<li>none recorded</li>';
  const labels = d.setup.labels.map(l => esc(LABEL_TEXT[l])).join(' · ') || 'none';
  const stages = FL.OBS_STAGES.map((s, i) => { const r = d.obs.rec[i]; return `<tr><th scope="row">${esc(s.name)}</th><td>${esc(FL.dayRange(i, tp))}</td><td>${r.sticker !== null ? esc(FL.STICKERS[i][r.sticker]) : '–'}${r.note ? '<br><i>' + esc(r.note) + '</i>' : ''}</td></tr>`; }).join('');
  const qs = FL.QUIZ.map((q, i) => `<tr><td>${i + 1}. ${esc(q.q)}</td><td>${d.pre[i] === null ? '–' : esc(q.options[d.pre[i]])}</td><td>${d.post[i] === null ? '–' : esc(q.options[d.post[i]])}</td><td>${esc(q.options[q.correct])}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Fruit Fly Lab Report</title><style>${CSS}</style></head><body><div class="page">
<h1>My Fruit Fly Lab Report</h1><p class="sub">Drosie's Fly Lab · Drosie's World${name ? ' · Scientist: ' + esc(name) : ''} · ${esc(new Date().toLocaleDateString())}</p>
<div class="box"><b>This was an educational simulation.</b> The food, incubator and fruit flies were virtual, the illustrations are simplified, and the timings are approximate reference values for <i>Drosophila melanogaster</i>. It is not a real laboratory protocol.</div>
<h2>My scientific question</h2><p>How does a fruit fly grow from an egg to an adult, and how does temperature change the timing?</p>
<h2>The simulated experiment</h2><p><b>Fly food</b> (one example of a cornmeal-based recipe; real laboratories use many recipes, and trained adults cook and handle the food):</p><ul>${ing}</ul>
<p><b>Culture vial:</b> clean vial, food, foam plug. <b>Label:</b> ${labels}.</p>
<p><b>Incubator temperature:</b> ${tp}°C. ${esc(T.note)} Egg to adult takes ${esc(T.days)} at this temperature (approximate).</p>
<h2>What I observed</h2><table><thead><tr><th scope="col">Stage</th><th scope="col">When (approximate)</th><th scope="col">My observation</th></tr></thead><tbody>${stages}</tbody></table>
<h2>My notebook questions</h2><div class="score"><span>Before: ${b} / 5</span><span>After: ${a} / 5</span></div>
<table><thead><tr><th scope="col">Question</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Answer</th></tr></thead><tbody>${qs}</tbody></table>
<p class="small">These scores are only feedback about my own learning. They do not show how well the game teaches.</p>
</div></body></html>`;
}
function certificateHtml() {
  const name = (D().reportName || '').trim();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Drosie's Junior Fly Scientist certificate</title><style>
@page{size:landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Georgia,serif;color:#173f38;background:#fff}
.cert{margin:12mm;border:10px double #d9a63e;padding:16mm 14mm;text-align:center;min-height:170mm;display:flex;flex-direction:column;justify-content:center;gap:8px;background:#fffdf4}
h1{font-size:40px;margin:0;color:#245f55}h2{font-size:22px;margin:6px 0;font-weight:normal}.name{font-size:30px;border-bottom:2px solid #245f55;display:inline-block;min-width:60%;padding:4px 10px;margin:8px auto}
.badge{font:bold 24px Georgia;color:#b9603f;letter-spacing:1px}.small{font-size:12px;color:#5a6f64;margin-top:14px}</style></head><body><div class="cert">
<div class="badge">✿ DROSIE'S WORLD ✿</div><h1>Junior Fly Scientist</h1><h2>This certificate is proudly given to</h2><div><span class="name">${name ? esc(name) : '&nbsp;'}</span></div>
<h2>for preparing a virtual fly culture, observing a fruit fly grow from egg to adult, and writing a lab report.</h2>
<p class="small">A fun certificate from Drosie's Fly Lab, an educational simulation. It is not an official qualification. ${esc(new Date().toLocaleDateString())}</p></div></body></html>`;
}
FL.reportHtml = reportHtml; FL.certificateHtml = certificateHtml;
function printHtml(html) {
  FL.lastPrint = html;
  const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  f.srcdoc = html; f.onload = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { $('#readMsg').textContent = 'Printing is not available here. Use Download, then open the file and print it.'; } setTimeout(() => f.remove(), 60000); };
  document.body.appendChild(f);
}
function downloadHtml(html, name) {
  const blob = new Blob([html], { type: 'text/html' }), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function petals() {
  if (FL.rm()) return; const box = document.createElement('div'); box.className = 'petals'; box.setAttribute('aria-hidden', 'true'); const cols = ['#f6d48c', '#db8669', '#9ccfa2', '#bfe3f2', '#f0b45c'];
  for (let i = 0; i < 18; i++) { const p = document.createElement('i'); p.style.left = FL.rand(0, 100) + 'vw'; p.style.background = cols[i % 5]; p.style.setProperty('--dx', FL.rand(-60, 60) + 'px'); p.style.setProperty('--rot', FL.rand(120, 480) + 'deg'); p.style.animationDuration = FL.rand(4, 7) + 's'; p.style.animationDelay = FL.rand(0, 1.5) + 's'; box.appendChild(p); }
  document.body.appendChild(box); FL.T.later(() => box.remove(), 9000);
}
mods.badge = {
  enter() {
    const d = D(), tp = d.setup.temp || 25, b = FL.score(d.pre), a = FL.score(d.post);
    say('Congratulations! You are Drosie\'s Junior Fly Scientist! You asked a question, prepared food, set up a culture, observed, recorded and explained. That is how scientists work!');
    const box = document.createElement('div');
    box.innerHTML = `<h2 style="font-size:1.2rem;margin:.2rem 0">My investigation</h2><ul class="sumlist"><li><b>Question:</b> How does a fruit fly grow from an egg to an adult?</li><li><b>Fly food:</b> ${d.food.added.length} ingredients, cooked by a lab technician (simulated)</li><li><b>Incubator:</b> ${tp}°C, about ${esc(FL.TEMPS[tp].days.replace('about ', ''))} from egg to adult</li><li><b>Stages observed:</b> ${d.obs.rec.filter(r => r.answered).length} of 6</li><li><b>Notebook:</b> ${b} / 5 before, ${a} / 5 after (feedback for me only)</li></ul>
      <div class="namebox"><label for="certName"><b>Name for the certificate (optional)</b></label><input id="certName" maxlength="40" autocomplete="off" placeholder="Your first name, or leave blank"><span class="small" style="font-size:.8rem">It stays on this device and is only used if you print the report or certificate.</span></div>
      <div class="reportbox"><button type="button" class="btn" id="dlReport">Download my lab report</button><button type="button" class="btn alt" id="prReport">Print my lab report</button><button type="button" class="btn alt" id="prCert">Print my certificate</button></div>
      <div class="links"><a href="/life-cycle-game.html">Explore the Life Cycle Adventure</a><a href="/science-activities/">More science activities</a><a href="/">Return to Drosie's World</a></div>`;
    setFill(box); setTask(null);
    const nm = $('#certName', box); nm.value = d.reportName || ''; nm.addEventListener('input', () => { d.reportName = nm.value.slice(0, 40); FL.save(); });
    $('#dlReport', box).addEventListener('click', () => { downloadHtml(reportHtml(), 'drosies-fruit-fly-lab-report.html'); say('Your lab report downloaded. Open it to read or print it.'); });
    $('#prReport', box).addEventListener('click', () => printHtml(reportHtml()));
    $('#prCert', box).addEventListener('click', () => printHtml(certificateHtml()));
    FL.chapterDone('badge'); petals();
    setMain('Restart the experiment', () => $('#restartDlg').showModal(), {});
    FL.setBack('← Back', null);
    setDeeper('<p>A lab report records the question, the set-up, what you observed and what you concluded. Scientists write these so others can understand and repeat their work. Your report notes clearly that this was a simulation, with simplified pictures and approximate times.</p>');
  }
};
FL.boot();
})();
