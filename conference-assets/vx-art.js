/* Original SVG art toolkit for the visual adventure (drawn for this project; no stock imagery).
   Scenes use a 960x600 coordinate space. Everything here is decorative: meaning is always carried by text, labels or the data tables. */
(function () {
  'use strict';
  const DC = window.DC;
  const A = (DC.art = {});
  const C = (A.C = { ivory: '#fbf6e8', sage: '#dfe8d5', sage2: '#b8cbb0', teal: '#1d5a5a', teal2: '#2f7d7a', gold: '#d9b45a', coral: '#c4655a', plum: '#5b3a6b', navy: '#20365a', wood: '#a97a46', wood2: '#8d6336', ink: '#1c2b28', paper: '#fffdf6', sky: '#cfe9ec', leaf: '#6fae76', leaf2: '#3f8a5a' });
  const F = 'ui-rounded,Nunito,"Trebuchet MS",sans-serif';
  const r = (x, y, w, h, f, rx, ex) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + f + '" ' + (ex || '') + '/>';
  const c = (x, y, rad, f, ex) => '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + f + '" ' + (ex || '') + '/>';
  const p = (d, f, ex) => '<path d="' + d + '" fill="' + f + '" ' + (ex || '') + '/>';
  const ln = (x1, y1, x2, y2, s, w, ex) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + w + '" stroke-linecap="round" ' + (ex || '') + '/>';
  const tx = (x, y, s, txt, f, ex) => '<text x="' + x + '" y="' + y + '" font-size="' + s + '" fill="' + f + '" font-family=\'' + F + '\' font-weight="800" text-anchor="middle" ' + (ex || '') + '>' + txt + '</text>';
  const g = (tr, inner, ex) => '<g transform="' + tr + '" ' + (ex || '') + '>' + inner + '</g>';
  A.r = r; A.c = c; A.p = p; A.ln = ln; A.tx = tx; A.g = g;

  /* ---- outdoor props ---- */
  A.sky = () => r(0, 0, 960, 600, '#cfe9ec') + r(0, 230, 960, 200, '#e1f1ea') + r(0, 330, 960, 270, '#eef5dc') + c(820, 110, 62, '#fff3c4') + c(820, 110, 44, '#ffe08a');
  A.cloud = (x, y, s, cls) => g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', c(0, 0, 30, '#fff') + c(34, 8, 26, '#fff') + c(-32, 10, 22, '#fff') + r(-40, 8, 96, 22, '#fff', 11), cls ? 'class="' + cls + '"' : '');
  A.hills = () => p('M0 420 Q160 330 330 400 T640 380 T960 400 V600 H0z', '#a9d39a') + p('M0 470 Q220 400 440 460 T960 450 V600 H0z', '#7fbf84') + p('M0 530 Q300 490 600 530 T960 520 V600 H0z', '#5fa872');
  A.tree = (x, y, s) => g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', r(-12, -10, 24, 90, '#8d6336', 8) + c(0, -50, 62, '#4c9b66') + c(-44, -20, 44, '#5fae78') + c(46, -24, 46, '#3f8a5a') + c(14, -78, 36, '#79c08c') + c(-16, -40, 7, '#c4655a') + c(30, -52, 7, '#c4655a') + c(-38, -12, 6, '#c4655a'));
  A.flower = (x, y, col) => g('translate(' + x + ' ' + y + ')', ln(0, 0, 0, 26, '#3f8a5a', 3) + [0, 72, 144, 216, 288].map((a) => g('rotate(' + a + ') translate(0 -7)', '<ellipse rx="5" ry="7" fill="' + col + '"/>')).join('') + c(0, 0, 4.5, '#ffd36b'));
  A.flowers = () => [[90, 520, C.coral], [140, 548, C.gold], [210, 530, '#e8a0bf'], [760, 530, C.coral], [830, 552, C.gold], [900, 524, '#e8a0bf'], [560, 560, C.coral], [330, 565, '#fff']].map((f) => A.flower(f[0], f[1], f[2])).join('');
  A.bunting = (y, w) => { w = w || 960; let s = p('M0 ' + y + ' Q' + w / 4 + ' ' + (y + 34) + ' ' + w / 2 + ' ' + y + ' T' + w + ' ' + y, 'none', 'stroke="#8d6336" stroke-width="3"'); const cols = [C.gold, C.coral, C.teal2]; for (let i = 0; i < 13; i++) { const x = 40 + i * ((w - 80) / 12); const yy = y + 12 + Math.sin(i / 12 * Math.PI * 2) * 18 + (i % 2 ? 4 : 0); s += p('M' + (x - 15) + ' ' + yy + ' l30 0 -15 30z', cols[i % 3]); } return s; };

  /* ---- indoor props ---- */
  A.wall = (col, floorY, floorCol) => r(0, 0, 960, 600, col) + r(0, floorY, 960, 600 - floorY, floorCol || '#e3d0a5') + [0, 1, 2, 3].map((i) => ln(0, floorY + 24 + i * 40, 960, floorY + 24 + i * 40, 'rgba(141,99,54,.25)', 2)).join('') + r(0, floorY - 10, 960, 12, 'rgba(141,99,54,.35)');
  A.window = (x, y, w, h) => r(x - 8, y - 8, w + 16, h + 16, C.wood2, 10) + r(x, y, w, h, '#cfe9ec', 4) + p('M' + x + ' ' + (y + h) + ' l' + w * 0.45 + ' -' + h * 0.4 + ' l' + w * 0.2 + ' ' + h * 0.2 + ' l' + w * 0.35 + ' -' + h * 0.3 + ' v' + h * 0.5 + 'z', '#a9d39a') + ln(x + w / 2, y, x + w / 2, y + h, C.wood2, 6) + ln(x, y + h / 2, x + w, y + h / 2, C.wood2, 6) + c(x + w * 0.78, y + h * 0.28, 11, '#ffe08a');
  A.shelf = (x, y, w) => r(x, y, w, 12, C.wood2, 4) + [0.12, 0.34, 0.58, 0.8].map((k, i) => { const jx = x + w * k; return r(jx - 15, y - 38, 30, 38, ['#d7efe9', '#fde7c4', '#e8dcf2', '#d9efe0'][i], 6, 'stroke="#8d6336" stroke-width="2"') + r(jx - 11, y - 46, 22, 9, '#f1e7d2', 3); }).join('');
  A.plant = (x, y, s) => g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', p('M-22 0 h44 l-6 46 h-32z', C.coral) + [[-28, -42, -24], [0, -62, 0], [28, -40, 24], [-10, -30, -12], [14, -34, 14]].map((l) => g('translate(0 0) rotate(' + l[2] + ')', '<ellipse cx="' + l[0] * 0.4 + '" cy="' + l[1] + '" rx="12" ry="34" fill="' + (l[2] % 2 ? '#3f8a5a' : '#5fae78') + '"/>')).join(''), 'class="sway"');
  A.lamp = (x, y) => ln(x, y, x, y + 160, C.wood2, 7) + p('M' + (x - 38) + ' ' + y + ' l76 0 -14 -46 h-48z', C.gold, 'stroke="#9a6a1d" stroke-width="3"') + r(x - 30, y + 156, 60, 10, C.wood2, 5);
  A.clock = (x, y) => c(x, y, 34, '#fff', 'stroke="#8d6336" stroke-width="6"') + ln(x, y, x, y - 20, C.ink, 4) + ln(x, y, x + 14, y + 6, C.ink, 4) + c(x, y, 3.5, C.ink);
  A.board = (x, y, w, h) => r(x - 8, y - 8, w + 16, h + 16, C.wood2, 10) + r(x, y, w, h, '#d9a86a', 4) + [[0.1, 0.12], [0.55, 0.18], [0.25, 0.55], [0.68, 0.6]].map((k, i) => g('translate(' + (x + w * k[0]) + ' ' + (y + h * k[1]) + ') rotate(' + (i * 5 - 6) + ')', r(0, 0, w * 0.26, h * 0.3, ['#fffdf6', '#fde7c4', '#e4f3f1', '#fffdf6'][i], 3, 'stroke="#b88a4a" stroke-width="1.5"') + c(w * 0.13, 4, 4, C.coral))).join('');
  A.table = (x, y, w, h) => r(x, y, w, 20, C.wood2, 6) + r(x + 10, y + 20, 14, h - 20, '#7c5530') + r(x + w - 24, y + 20, 14, h - 20, '#7c5530');
  A.desk = (x, y, w) => r(x, y, w, 18, '#c99a60', 6) + r(x, y + 18, w, 64, C.wood, 4) + r(x + 16, y + 30, w / 2 - 26, 38, '#8d6336', 4) + r(x + w / 2 + 10, y + 30, w / 2 - 26, 38, '#8d6336', 4) + c(x + w / 4, y + 49, 4, C.gold) + c(x + w * 0.75, y + 49, 4, C.gold);
  A.rug = (x, y, w, h, col) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + w + '" ry="' + h + '" fill="' + col + '"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + w * 0.82 + '" ry="' + h * 0.78 + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4" stroke-dasharray="10 8"/>';
  A.posterMini = (x, y, w, h, acc) => r(x, y, w, h, '#fff', 4, 'stroke="#8d6336" stroke-width="3"') + r(x + 6, y + 6, w - 12, h * 0.16, acc || C.teal, 3) + r(x + 6, y + h * 0.28, w * 0.36, h * 0.3, C.gold, 3) + [0, 1, 2].map((i) => r(x + w * 0.48, y + h * 0.28 + i * h * 0.11, w * 0.42, h * 0.06, '#c9d8cc', 2)).join('') + r(x + 6, y + h * 0.66, w - 12, h * 0.07, '#c9d8cc', 2) + r(x + 6, y + h * 0.78, w * 0.6, h * 0.07, '#c9d8cc', 2);
  A.door = (x, y, w, h, col, sign) => r(x - 10, y - 10, w + 20, h + 10, C.wood2, 14) + r(x, y, w, h, col, 10) + r(x + w * 0.12, y + h * 0.1, w * 0.76, h * 0.36, 'rgba(255,255,255,.18)', 8) + r(x + w * 0.12, y + h * 0.54, w * 0.76, h * 0.36, 'rgba(255,255,255,.12)', 8) + c(x + w * 0.84, y + h * 0.55, 8, C.gold, 'stroke="#9a6a1d" stroke-width="2"') + (sign || '');
  A.thermo = (x, y, h, label, hot) => r(x - 10, y, 20, h, '#fff', 10, 'stroke="#1d5a5a" stroke-width="3"') + c(x, y + h + 8, 17, hot ? C.coral : '#4a90c2', 'stroke="#1d5a5a" stroke-width="3"') + r(x - 4, y + h * (hot ? 0.18 : 0.52), 8, h * (hot ? 0.82 : 0.48) + 6, hot ? C.coral : '#4a90c2', 4) + (label ? tx(x, y - 10, 22, label, C.ink) : '');
  A.fly = (x, y, s, rot) => g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', DC.lab ? DC.lab.fly(0, 0, rot || 0, false) : '');
  A.person = (x, y, look, s) => '<g transform="translate(' + x + ' ' + y + ')">' + (DC.avatar ? DC.avatar(look, 100 * (s || 1)).replace('<svg ', '<svg x="-' + 50 * (s || 1) + '" y="-' + 55 * (s || 1) + '" ') : '') + '</g>';
  A.confetti = (n) => { let s = ''; const cols = [C.gold, C.coral, C.teal2, '#e8a0bf']; for (let i = 0; i < n; i++) { s += r((i * 97) % 940 + 10, (i * 53) % 260 + 20, 8, 14, cols[i % 4], 2, 'transform="rotate(' + (i * 37) % 90 + ' ' + ((i * 97) % 940 + 14) + ' ' + ((i * 53) % 260 + 27) + ')" opacity=".8"'); } return s; };

  /* ================= scenes ================= */
  /* Chapter 1: invitation garden */
  A.garden = () => A.sky() + A.cloud(160, 90, 1.1, 'drift') + A.cloud(560, 60, 0.8, 'drift') + A.hills() + A.tree(120, 400, 1.15) + A.tree(860, 410, 0.95) + A.flowers() + A.bunting(24) +
    r(380, 470, 200, 14, '#c99a60', 7) + r(395, 484, 12, 70, C.wood2) + r(553, 484, 12, 70, C.wood2) +   /* little garden table */
    g('translate(480 455)', p('M-26 0 h52 l-8 -22 h-36z', '#fff', 'stroke="#8d6336" stroke-width="3"') + c(0, -26, 12, C.coral) + c(-10, -34, 8, '#e8a0bf')) +
    g('translate(760 470)', r(-6, 0, 12, 100, C.wood2) + r(-34, -46, 68, 52, C.teal, 10) + r(-34, -46, 68, 14, C.teal2, 10) + r(-18, -28, 36, 6, '#fff', 3) + r(30, -30, 26, 8, C.coral, 3) + ln(30, -26, 30, -52, C.coral, 3));  /* mailbox with flag */

  /* Chapter 2: two doors */
  const signA = () => r(150, 112, 220, 70, '#fff8e6', 14, 'stroke="#8d6336" stroke-width="4"') + g('translate(200 147)', A.thermo(0, -22, 36, '', true)) + g('translate(260 147)', A.thermo(0, -22, 36, '', false)) + tx(318, 165, 34, 'Lab', C.teal);
  const signB = () => r(530, 112, 240, 70, '#fff8e6', 14, 'stroke="#8d6336" stroke-width="4"') + g('translate(572 128)', r(0, 0, 36, 44, '#fff', 4, 'stroke="#8d6336" stroke-width="3"') + ln(8, 12, 28, 12, '#c9d8cc', 3) + ln(8, 22, 28, 22, '#c9d8cc', 3) + ln(8, 32, 22, 32, '#c9d8cc', 3)) + tx(700, 163, 30, 'Mine!', C.coral);
  A.doors = () => A.wall('#f3ead2', 430, '#d9bd88') + A.bunting(20) + A.window(60, 90, 90, 120) + A.window(810, 90, 90, 120) + signA() + signB() +
    A.door(150, 200, 220, 290, C.teal2) + A.door(530, 200, 240, 290, C.coral) + A.rug(480, 540, 300, 36, '#e8d3a2') + A.plant(70, 470, 1.1) + A.plant(890, 470, 1.1) + A.lamp(470, 230).replace(/stroke/g, 'stroke') +
    g('translate(262 560)', r(-12, -8, 24, 8, 'rgba(0,0,0,.12)', 4)) ;

  /* Campus map */
  const bld = (x, y, body, roof, sym) => g('translate(' + x + ' ' + y + ')', r(-34, -14, 68, 46, body, 6, 'stroke="#8d6336" stroke-width="3"') + p('M-42 -12 L0 -46 L42 -12z', roof, 'stroke="#8d6336" stroke-width="3"') + r(-8, 6, 16, 26, '#8d6336', 3) + (sym || ''));
  A.map = () => {
    const pts = [[12, 78], [24, 58], [22, 30], [40, 18], [56, 28], [72, 20], [84, 40], [66, 52], [48, 66], [82, 80]].map((q) => [q[0] * 9.6, q[1] * 6]);
    const path = 'M' + pts.map((q) => q[0] + ' ' + q[1]).join(' L');
    const styles = [['#fff8e6', C.gold], ['#e8dcf2', C.plum], ['#d7efe9', C.teal2], ['#fde7c4', C.coral], ['#fff8e6', C.teal], ['#e4f3f1', '#c28a3a'], ['#fff8e6', C.coral], ['#e8f3e8', C.teal2], ['#fde7c4', C.plum], ['#fff3c4', C.gold]];
    const svg = A.sky() + A.hills() + A.cloud(200, 70, 1, 'drift') + A.cloud(700, 50, 0.8, 'drift') + p(path, 'none', 'stroke="#f3e2ad" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"') + p(path, 'none', 'stroke="#c99a60" stroke-width="4" stroke-dasharray="4 14" stroke-linecap="round" stroke-linejoin="round"') +
      pts.map((q, i) => bld(q[0], q[1] - 18, styles[i][0], styles[i][1])).join('') + A.tree(60, 330, 0.6) + A.tree(900, 300, 0.55) + A.tree(560, 410, 0.5) + A.tree(380, 330, 0.5);
    return '<svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">' + svg + '</svg>';
  };
})();
