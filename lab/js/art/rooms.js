/* rooms.js (art): backgrounds and scene illustrations for Lab 0, the Safety Academy.
 * All rooms are drawn on a 1600x900 canvas (hazard scene: 2400x900). Everything is original vector art.
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});
  const R = (x, y, w, h, r, fill, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${fill}" ${extra || ''}/>`;
  let U = 0;

  /* shared gradients, inserted once as an always-rendered 0x0 svg */
  A.sfDefs = function () {
    if (document.getElementById('sf-defs')) return;
    const d = document.createElement('div');
    d.id = 'sf-defs';
    d.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="sf-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b6a72"/><stop offset="1" stop-color="#274854"/></linearGradient>
      <linearGradient id="sf-wallD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3b52"/><stop offset="1" stop-color="#0d2233"/></linearGradient>
      <linearGradient id="sf-wallW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3c4"/><stop offset="1" stop-color="#5f9ca0"/></linearGradient>
      <linearGradient id="sf-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#436b75"/><stop offset="1" stop-color="#1b343d"/></linearGradient>
      <linearGradient id="sf-floorD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a4c"/><stop offset="1" stop-color="#0a1b27"/></linearGradient>
      <linearGradient id="sf-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5fbff" stop-opacity=".75"/><stop offset="1" stop-color="#7fc2cf" stop-opacity=".25"/></linearGradient>
      <linearGradient id="sf-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3ee"/><stop offset=".6" stop-color="#cfdad4"/><stop offset="1" stop-color="#9fb4ae"/></linearGradient>
      <linearGradient id="sf-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5764"/><stop offset="1" stop-color="#1f3d49"/></linearGradient>
      <linearGradient id="sf-metal" x1="0" x2="1"><stop offset="0" stop-color="#8aa2a8"/><stop offset=".4" stop-color="#e9f1f0"/><stop offset="1" stop-color="#7d949a"/></linearGradient>
      <linearGradient id="sf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1e3d"/><stop offset=".45" stop-color="#27507c"/><stop offset=".8" stop-color="#e98f62"/><stop offset="1" stop-color="#ffcf8a"/></linearGradient>
      <linearGradient id="sf-bld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26505f"/><stop offset="1" stop-color="#153441"/></linearGradient>
      <linearGradient id="sf-int" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset="1" stop-color="#f4b565"/></linearGradient>
      <linearGradient id="sf-pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a6571"/><stop offset="1" stop-color="#1e3340"/></linearGradient>
      <linearGradient id="sf-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe3a8" stop-opacity="0"/></linearGradient>
      <radialGradient id="sf-warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd58a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
      <radialGradient id="sf-cyan" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6cf0e4" stop-opacity=".55"/><stop offset="1" stop-color="#6cf0e4" stop-opacity="0"/></radialGradient>
      <radialGradient id="sf-spot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6" stop-opacity=".65"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
      <linearGradient id="sf-liquid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fe0d0" stop-opacity=".85"/><stop offset="1" stop-color="#2fa6c9" stop-opacity=".8"/></linearGradient>
      <pattern id="sf-tile" width="80" height="60" patternUnits="userSpaceOnUse"><path d="M0 0H80M0 0V60" stroke="#a8d0d2" stroke-opacity=".12" stroke-width="2"/></pattern>
      <pattern id="sf-ftile" width="120" height="50" patternUnits="userSpaceOnUse"><path d="M0 0H120M0 0V50" stroke="#a8d0d2" stroke-opacity=".1" stroke-width="2"/></pattern>
      <pattern id="sf-scan" width="8" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H8" stroke="#8ff6ee" stroke-opacity=".08" stroke-width="2"/></pattern>
    </defs></svg>`;
    document.body.appendChild(d);
  };

  /* ---------- reusable props ---------- */
  const ceiling = (w, xs) => R(0, 0, w, 56, 0, '#16303a') + xs.map((x) => R(x - 120, 20, 240, 16, 8, '#c9eef0') + R(x - 104, 24, 208, 8, 4, '#fffbe6', 'class="flick"')).join('');
  const plant = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-34 0H34L26 60H-26Z" fill="#c9806a" stroke="#8b4f3e" stroke-width="3"/><g class="sway" style="transform-origin:0 0"><path d="M0 0C-30-50-60-60-70-110C-30-90-10-60 0 0Z" fill="#4c9a6b"/><path d="M0 0C30-60 60-70 80-100C40-90 10-60 0 0Z" fill="#5fb07a"/><path d="M0 0C-5-70 10-110 4-150C-18-110-12-60 0 0Z" fill="#3e8a5e"/></g></g>`;
  const sign = (x, y, w, text, col) => `<g>${R(x, y, w, 46, 10, '#0d2230', `stroke="${col || '#6cf0e4'}" stroke-width="3"`)}<text x="${x + w / 2}" y="${y + 31}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${col || '#6cf0e4'}">${text}</text></g>`;
  A.props = { R, plant, sign };

  /* ---------- ENTRANCE (hub) ---------- */
  A.entrance = function () {
    let stars = '';
    const rnd = DW.rng(11);
    for (let i = 0; i < 46; i++) stars += `<circle cx="${rnd() * 1600}" cy="${rnd() * 320}" r="${0.7 + rnd() * 1.6}" fill="#fff" class="twinkle" style="animation-delay:${-rnd() * 3}s;animation-duration:${2 + rnd() * 2.5}s"/>`;
    const win = (x, y, w, h, kind) => {
      const inner = kind === 'scope'
        ? `<g transform="translate(${x + w / 2 - 36} ${y + 50})"><path d="M0 120H80M20 120V70L34 40L56 56V120" fill="#e8c27a" stroke="#6a4a22" stroke-width="3"/><rect x="26" y="20" width="14" height="30" rx="4" transform="rotate(-20 33 35)" fill="#33454d"/></g>`
        : kind === 'flask'
          ? `<g transform="translate(${x + w / 2} ${y + 60})"><path d="M-14 0H14V30L40 80Q44 92 32 92H-32Q-44 92 -40 80L-14 30Z" fill="#7df0cf" opacity=".85" stroke="#fff6d6" stroke-width="3"/><path d="M-24 62H24" stroke="#fff" stroke-width="3" opacity=".7"/></g>`
          : `<g transform="translate(${x + 30} ${y + 52})"><rect width="${w - 60}" height="${h - 120}" rx="6" fill="#103348" stroke="#a9e3ea" stroke-width="3"/><path d="M10 ${h - 150}L40 ${h - 170}L70 ${h - 160}L100 ${h - 190}" fill="none" stroke="#6cf0e4" stroke-width="4"/></g>`;
      return `<g>${R(x - 8, y - 8, w + 16, h + 16, 10, '#9cb8bd', 'stroke="#5d7d86" stroke-width="3"')}${R(x, y, w, h, 4, 'url(#sf-int)')}${inner}<path d="M${x} ${y + h}L${x + w * 0.5} ${y}L${x + w * 0.8} ${y}L${x + w * 0.3} ${y + h}Z" fill="#fff" opacity=".12"/></g>`;
    };
    return `
    ${R(0, 0, 1600, 900, 0, 'url(#sf-sky)')}${stars}
    <circle cx="1330" cy="130" r="48" fill="#fff6d6"/><circle cx="1346" cy="118" r="44" fill="#27507c" opacity=".35"/><circle cx="1330" cy="130" r="90" fill="#fff6d6" opacity=".08"/>
    <path d="M0 520L90 470L170 505L260 430L340 490L430 450L520 500V560H0Z" fill="#152a47" opacity=".9"/><path d="M1080 520L1170 450L1260 500L1350 440L1450 490L1530 462L1600 500V560H1080Z" fill="#152a47" opacity=".9"/>
    ${R(100, 250, 1400, 470, 0, 'url(#sf-bld)')}${R(80, 232, 1440, 30, 6, '#10303c', 'stroke="#6cf0e4" stroke-opacity=".35" stroke-width="2"')}
    ${[...Array(14)].map((_, i) => `<path d="M${180 + i * 95} 264V710" stroke="#0b2530" stroke-opacity=".5" stroke-width="3"/>`).join('')}
    ${win(170, 400, 330, 240, 'scope')}
    ${win(1100, 400, 330, 240, 'flask')}
    <g class="interior" opacity=".0">${R(170, 400, 330, 240, 4, '#ffe9b0', 'opacity=".25"')}${R(1100, 400, 330, 240, 4, '#ffe9b0', 'opacity=".25"')}</g>
    <!-- sign -->
    <g class="sign">${R(470, 178, 660, 70, 14, '#0b2231', 'stroke="#6cf0e4" stroke-width="4"')}
      <text x="800" y="208" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="900" letter-spacing="7" fill="#9be7ef" class="sign-glow">DROSIE'S</text>
      <text x="800" y="236" text-anchor="middle" font-family="system-ui,sans-serif" font-size="25" font-weight="900" letter-spacing="5" fill="#ffd36b" class="sign-glow">RESEARCH LABORATORY</text></g>
    <!-- doorway -->
    ${R(560, 322, 480, 20, 8, '#0f2a36', 'stroke="#6cf0e4" stroke-opacity=".6" stroke-width="2"')}${R(580, 330, 440, 5, 2, '#6cf0e4', 'class="flick" opacity=".9"')}
    ${R(596, 346, 408, 388, 10, '#0a1b25', 'stroke="#9cb8bd" stroke-width="8"')}
    <g class="doorway-in">${R(604, 354, 392, 372, 4, 'url(#sf-int)')}
      <path d="M604 560H996" stroke="#c98d46" stroke-width="3" opacity=".5"/>
      <g transform="translate(700 520)"><path d="M0 200H70M14 200V120L26 96L46 110V200" fill="#e8c27a" stroke="#6a4a22" stroke-width="3"/></g>
      <g transform="translate(860 560)"><path d="M-14 0H14V24L36 70Q40 82 28 82H-28Q-40 82 -36 70L-14 24Z" fill="#7df0cf" opacity=".8" stroke="#fff6d6" stroke-width="3"/></g>
      <path d="M720 354L640 734H960L880 354Z" fill="url(#sf-beam)" opacity=".7" class="beam"/></g>
    <g class="doorL"><rect x="604" y="354" width="196" height="372" rx="4" fill="url(#sf-glass)" stroke="#d2e4e6" stroke-width="6"/><path d="M630 380L690 380L620 520Z" fill="#fff" opacity=".18"/><rect x="760" y="520" width="8" height="60" rx="3" fill="#e9f1f0"/></g>
    <g class="doorR"><rect x="800" y="354" width="196" height="372" rx="4" fill="url(#sf-glass)" stroke="#d2e4e6" stroke-width="6"/><path d="M830 380L890 380L820 520Z" fill="#fff" opacity=".18"/><rect x="832" y="520" width="8" height="60" rx="3" fill="#e9f1f0"/></g>
    <rect class="darkveil" x="100" y="250" width="1400" height="484" fill="#06101a" opacity=".5"/>
    <!-- status plate -->
    <g>${R(690, 262, 220, 50, 10, '#08161f', 'stroke="#47879d" stroke-width="3"')}<circle class="led" cx="716" cy="287" r="9" fill="#ff6b5e"/>
      <text class="st-lock" x="812" y="294" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="900" letter-spacing="1.500" fill="#ffb3a8">TRAINING REQUIRED</text>
      <text class="st-open" x="812" y="294" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="900" letter-spacing="2" fill="#7df0cf" opacity="0">LAB READY</text></g>
    <!-- ground -->
    ${R(0, 724, 1600, 176, 0, 'url(#sf-pave)')}<path d="M480 724L-100 900M1120 724L1700 900M800 724V900M640 724L420 900M960 724L1180 900" stroke="#9cc4cf" stroke-opacity=".12" stroke-width="3"/>
    <path d="M0 780H1600M0 850H1600" stroke="#9cc4cf" stroke-opacity=".1" stroke-width="3"/>
    <ellipse cx="800" cy="740" rx="260" ry="26" fill="url(#sf-warm)" class="warmpulse"/>
    ${plant(380, 770, 0.9)}${plant(1250, 770, 0.8)}
    <g>${R(1370, 520, 14, 240, 6, '#2a3d48')}<ellipse cx="1377" cy="516" rx="44" ry="16" fill="#fff2c4" class="flick"/>${R(1334, 500, 86, 16, 8, '#3b5360')}<path d="M1344 520L1300 724H1454L1410 520Z" fill="url(#sf-beam)" opacity=".5"/></g>
    <g>${R(216, 520, 14, 240, 6, '#2a3d48')}<ellipse cx="223" cy="516" rx="44" ry="16" fill="#fff2c4" class="flick"/>${R(180, 500, 86, 16, 8, '#3b5360')}<path d="M190 520L146 724H300L256 520Z" fill="url(#sf-beam)" opacity=".5"/></g>
    <!-- terminal pedestal -->
    <g class="terminal">${R(1190, 600, 132, 200, 14, '#243844', 'stroke="#6cf0e4" stroke-opacity=".5" stroke-width="3"')}
      ${R(1178, 770, 156, 30, 10, '#1b2c36')}
      <g transform="translate(1256 560)"><path d="M-86 -10L-70 -70H70L86 -10Z" fill="#10242f" stroke="#47879d" stroke-width="4"/><path d="M-72 -16L-58 -62H58L72 -16Z" fill="#0a2a3a"/><path d="M-50 -38H50M-40 -26H40" stroke="#6cf0e4" stroke-width="4" stroke-linecap="round" class="draw"/><circle cx="0" cy="-48" r="4" fill="#ffd36b" class="blink"/></g>
      <ellipse cx="1256" cy="500" rx="100" ry="44" fill="url(#sf-cyan)" class="warmpulse"/></g>
    `;
  };

  /* ---------- M1 SUIT-UP ROOM ---------- */
  A.prepRoom = function () {
    return `
    ${R(0, 0, 1600, 660, 0, 'url(#sf-wall)')}${R(0, 380, 1600, 280, 0, 'url(#sf-tile)')}
    ${ceiling(1600, [300, 800, 1300])}
    ${R(0, 650, 1600, 250, 0, 'url(#sf-floor)')}${R(0, 650, 1600, 250, 0, 'url(#sf-ftile)')}${R(0, 644, 1600, 10, 0, '#0d222b', 'opacity=".55"')}
    ${sign(610, 78, 380, 'SUIT-UP ROOM')}
    <g>${R(610, 150, 380, 500, 190, '#b8d6da', 'stroke="#d9eef0" stroke-width="12"')}${R(626, 166, 348, 468, 174, '#7fb6bf')}
      <path d="M650 560L820 200L880 200L700 600Z" fill="#fff" opacity=".18"/><path d="M850 600L930 380L960 380L900 600Z" fill="#fff" opacity=".1"/></g>
    <ellipse cx="800" cy="716" rx="230" ry="38" fill="url(#sf-spot)" class="warmpulse"/><ellipse cx="800" cy="720" rx="150" ry="20" fill="none" stroke="#6cf0e4" stroke-width="4" stroke-dasharray="12 10" opacity=".8" class="ringdash"/>
    <path d="M560 56L440 650H1160L1040 56Z" fill="url(#sf-beam)" opacity=".5" class="beam"/>
    ${plant(1480, 700, 0.8)}
    `;
  };

  /* ---------- M2 PROTECTION LAB ---------- */
  A.protectRoom = function () {
    return `
    ${R(0, 0, 1600, 660, 0, 'url(#sf-wallD)')}${R(0, 0, 1600, 660, 0, 'url(#sf-scan)')}
    ${ceiling(1600, [250, 800, 1350])}
    ${R(0, 650, 1600, 250, 0, 'url(#sf-floorD)')}${R(0, 650, 1600, 250, 0, 'url(#sf-ftile)')}
    ${sign(640, 70, 320, 'PROTECTION LAB')}
    <g>${R(520, 112, 1030, 540, 26, '#0a1d2b', 'stroke="#47879d" stroke-width="5"')}${R(536, 128, 998, 508, 18, '#0e2a3c')}
      <path d="M536 128h46M536 128v46M1534 128h-46M1534 128v46M536 636h46M536 636v-46M1534 636h-46M1534 636v-46" stroke="#6cf0e4" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${R(536, 128, 998, 508, 18, 'url(#sf-scan)')}</g>
    <ellipse cx="1030" cy="660" rx="480" ry="40" fill="url(#sf-cyan)" opacity=".5"/>
    <g>${R(40, 112, 440, 540, 22, '#0b2231', 'stroke="#47879d" stroke-opacity=".7" stroke-width="4"')}</g>
    ${plant(1540, 740, 0.8)}
    `;
  };

  /* ---------- M3 HAZARD LAB (2400 wide) ---------- */
  A.hazardLabBase = function () {
    let panels = '';
    for (let i = 0; i < 13; i++) panels += `<path d="M${i * 200} 0V640" stroke="#0e2b33" stroke-opacity=".18" stroke-width="3"/>`;
    const win = (x) => `<g>${R(x - 12, 96, 304, 248, 10, '#d9e6df', 'stroke="#6f9096" stroke-width="6"')}${R(x, 108, 280, 224, 4, 'url(#sf-sky)')}<circle cx="${x + 200}" cy="${150}" r="26" fill="#fff7d6"/>${R(x + 136, 108, 8, 224, 0, '#d9e6df')}${R(x, 214, 280, 8, 0, '#d9e6df')}<path d="M${x} 332V280Q${x + 80} 250 ${x + 160} 284T${x + 280} 270V332Z" fill="#3e7a68"/></g>`;
    const bench = (x) => `<g>${R(x - 230, 596, 460, 18, 4, '#f4f8f4')}${R(x - 230, 610, 460, 32, 0, 'url(#sf-top)', 'stroke="#7e968f" stroke-width="3"')}${R(x - 220, 640, 440, 130, 0, 'url(#sf-front)')}${R(x - 214, 654, 206, 104, 6, '#26505e', 'stroke="#14323d" stroke-width="3"')}${R(x + 8, 654, 206, 104, 6, '#26505e', 'stroke="#14323d" stroke-width="3"')}${R(x - 112, 700, 30, 7, 3, '#cfdcdc')}${R(x + 112, 700, 30, 7, 3, '#cfdcdc')}</g>`;
    return `
    ${R(0, 0, 2400, 660, 0, 'url(#sf-wall)')}${panels}${R(0, 420, 2400, 240, 0, 'url(#sf-tile)')}
    ${ceiling(2400, [300, 900, 1500, 2100])}
    ${win(150)}${win(950)}${win(1500)}
    ${R(0, 780, 2400, 120, 0, 'url(#sf-floor)')}${R(0, 770, 2400, 130, 0, 'url(#sf-ftile)')}${R(0, 764, 2400, 10, 0, '#0d222b', 'opacity=".5"')}
    ${bench(450)}${bench(1150)}${bench(1850)}
    <g transform="translate(560 430)">${R(0, 0, 160, 10, 3, '#b99a6a')}${R(10, -44, 36, 44, 8, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(14, -22, 28, 18, 4, '#ff8c7a', 'opacity=".8"')}${R(60, -54, 36, 54, 8, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(64, -26, 28, 22, 4, '#7df0cf', 'opacity=".8"')}${R(110, -40, 36, 40, 8, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(114, -20, 28, 16, 4, '#ffe08a', 'opacity=".8"')}</g>
    <g transform="translate(1660 380)">${R(0, 0, 100, 150, 8, '#f6efde', 'stroke="#c8b98f" stroke-width="5"')}${R(10, 12, 80, 22, 4, '#3b6a72')}<text x="50" y="29" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="900" fill="#fff" letter-spacing="1">RULES</text><path d="M16 56h68M16 72h58M16 88h64M16 104h50" stroke="#9fb8bd" stroke-width="5" stroke-linecap="round"/></g>
    <g class="decoy" data-id="eyewash" transform="translate(1960 460)">${R(0, 0, 90, 112, 10, '#2e9a63', 'stroke="#1c6e45" stroke-width="4"')}${R(12, 12, 66, 24, 4, '#fff')}<text x="45" y="30" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="900" fill="#1c6e45">EYEWASH</text><path d="M26 68Q26 56 38 56M64 68Q64 56 52 56" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>${R(20, 74, 50, 18, 6, '#e6f4ee')}</g>
    <g class="decoy" data-id="extinguisher" transform="translate(2100 470)">${R(0, 0, 40, 100, 14, '#d33a2c', 'stroke="#8f2318" stroke-width="3"')}${R(10, -16, 20, 18, 4, '#333')}${R(2, 30, 36, 24, 3, '#fff')}<path d="M20 -8C34 -8 44 0 46 20" stroke="#333" stroke-width="5" fill="none"/></g>
    <g>${R(2160, 360, 200, 410, 10, '#0f2a36', 'stroke="#9cb8bd" stroke-width="8"')}${R(2170, 370, 180, 390, 4, '#17394a')}${R(2184, 330, 152, 26, 6, '#2e9a63')}<text x="2260" y="349" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="900" fill="#fff" letter-spacing="3">EXIT</text></g>
    <ellipse cx="1150" cy="620" rx="600" ry="70" fill="url(#sf-warm)" opacity=".5"/>
    `;
  };

  /* slot art: each returns markup with origin at the ground/bench anchor */
  const puddle = (w, extra) => `<g class="hz-anim hz-shimmer"><ellipse cx="0" cy="0" rx="${w}" ry="${w * 0.22}" fill="url(#sf-liquid)" stroke="#bff3f0" stroke-width="3"/><ellipse cx="${-w * 0.25}" cy="${-w * 0.05}" rx="${w * 0.35}" ry="${w * 0.07}" fill="#fff" opacity=".55"/></g>`;
  const bottle = (x, labeled, col) => `<g transform="translate(${x} 0)">${R(-18, -84, 36, 84, 10, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2.500"')}${R(-14, -44, 28, 40, 6, col, 'opacity=".8"')}${R(-10, -96, 20, 14, 3, '#d7b768')}${labeled ? `${R(-14, -66, 28, 18, 2, '#fff', 'stroke="#9fb4b8" stroke-width="1.500"')}<path d="M-9 -60h18M-9 -54h12" stroke="#2b4a55" stroke-width="2" stroke-linecap="round"/>` : `${R(-14, -66, 28, 18, 2, '#e8e2cf', 'stroke="#c9c1a3" stroke-width="1.500" stroke-dasharray="3 3"')}<text x="0" y="-48" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#8a7a4d">?</text>`}</g>`;

  A.hazard = function (id, resolved) {
    const check = resolved ? `<g transform="translate(0 -170)"><circle r="18" fill="#2fc07f" stroke="#fff" stroke-width="3"/><path d="M-8 0l6 6 11-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : '';
    switch (id) {
      case 'food':
        return `<g>${resolved ? '' : `<g transform="translate(70 0)"><g class="hz-anim hz-crumb"><circle cx="-6" cy="-6" r="2.500" fill="#e2b872"/><circle cx="8" cy="-4" r="2" fill="#e2b872"/><circle cx="26" cy="-6" r="2.200" fill="#e2b872"/></g>
          ${R(-24, -30, 52, 12, 6, '#e8c27a', 'stroke="#b88a3c" stroke-width="2"')}${R(-22, -40, 48, 10, 3, '#74b86a')}${R(-24, -52, 52, 14, 7, '#e8c27a', 'stroke="#b88a3c" stroke-width="2"')}
          <g transform="translate(66 0)">${R(-18, -52, 36, 52, 6, '#f2a43c', 'stroke="#b66f12" stroke-width="2.500"')}${R(-12, -44, 24, 14, 3, '#fff', 'opacity=".85"')}<path d="M6 -52v-18l12 -6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>
          <g class="hz-anim hz-fly" transform="translate(-30 -70)"><ellipse rx="5" ry="3.500" fill="#2a1d12"/><ellipse cx="-3" cy="-4" rx="5" ry="2.500" fill="#fff" opacity=".8"/></g></g>`}
          <g>${R(-56, -26, 12, 26, 4, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(-70, -26, 12, 26, 4, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(-84, -26, 12, 26, 4, 'url(#sf-glass)', 'stroke="#bfe7ea" stroke-width="2"')}${R(-90, -2, 50, 6, 2, '#7b9096')}</g>${check}</g>`;
      case 'unlabeled':
        return `<g>${bottle(-30, true, '#8ec9ff')}${bottle(30, resolved, '#9bff7a')}${resolved ? `<text x="30" y="-46" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" font-weight="900" fill="#2b4a55">ASK!</text>` : ''}${check}</g>`;
      case 'hairHeat':
        return `<g><g transform="translate(-60 0)">${R(-22, -12, 44, 12, 4, '#7b9096', 'stroke="#53696f" stroke-width="2"')}${R(-7, -52, 14, 42, 3, '#9fb2b8', 'stroke="#53696f" stroke-width="2"')}
          ${resolved ? '' : `<g class="hz-anim hz-flame"><path d="M0 -56C-13 -74 -4 -82 0 -100C11 -82 13 -68 0 -56Z" fill="#ffb347"/><path d="M0 -58C-6 -68 -2 -75 0 -86C6 -75 6 -67 0 -58Z" fill="#fff0a8"/></g>`}</g>
          <g transform="translate(${resolved ? 40 : 14} 246) ${resolved ? '' : 'rotate(-9)'} scale(.9)" style="transform-origin:0 0">${A.kid({ pose: 'hands', hairStyle: resolved ? 'tied' : 'long', hair: '#7a3b22', skin: '#e0ac84', shirt: '#7d6bd0', wear: { coat: true, goggles: resolved, shoes: 'closed' }, face: resolved ? 'smile' : 'think' })}</g>${check}</g>`;
      case 'spill':
        return `<g>${resolved ? `<g opacity=".35">${puddle(92)}</g><g transform="translate(0 -4)"><path d="M-26 0L0 -86L26 0Z" fill="#ffd400" stroke="#b38f00" stroke-width="4" stroke-linejoin="round"/><text x="0" y="-18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="30" font-weight="900" fill="#333">!</text></g>` : puddle(92)}${check}</g>`;
      case 'glass':
        return `<g>${resolved ? '<path d="M-90 -10L90 -6M-90 -42L90 -38" stroke="#ffd400" stroke-width="7" stroke-dasharray="18 10"/>' : ''}<g opacity="${resolved ? 0.4 : 1}"><path d="M-40 0L-22 -18L-10 0Z" fill="#cfeff5" stroke="#7fc2cf" stroke-width="2"/><path d="M-4 -2L12 -26L26 -4Z" fill="#e5fbff" stroke="#7fc2cf" stroke-width="2"/><path d="M34 0L48 -12L62 2Z" fill="#cfeff5" stroke="#7fc2cf" stroke-width="2"/><path d="M-60 2L-52 -8L-44 4Z" fill="#e5fbff" stroke="#7fc2cf" stroke-width="2"/>${resolved ? '' : '<g class="twinkle"><path d="M10 -40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"/></g>'}</g>${check}</g>`;
      case 'exit':
        return `<g>${resolved ? '' : `<g class="hz-anim">${R(-70, -86, 78, 86, 4, '#c79a62', 'stroke="#8d6637" stroke-width="3"')}${R(-70, -86, 78, 14, 4, '#d9b07a')}${R(-16, -150, 68, 64, 4, '#d1a46c', 'stroke="#8d6637" stroke-width="3"')}${R(-100, -60, 36, 60, 4, '#b98a52', 'stroke="#8d6637" stroke-width="3"')}${R(8, -64, 62, 64, 4, '#c79a62', 'stroke="#8d6637" stroke-width="3"')}</g>`}${check}</g>`;
      case 'sandals':
        return `<g transform="scale(.9)">${A.kid({ pose: 'stand', hairStyle: 'short', hair: '#3a2a1a', skin: '#8d5a3b', shirt: '#e0a43a', wear: { coat: true, shoes: resolved ? 'closed' : 'sandals' }, face: 'smile' })}</g>${check}`;
      case 'running':
        return `<g transform="scale(.9)">${resolved ? '' : '<g class="hz-anim hz-speed"><path d="M-84 -190h-40M-86 -150h-54M-80 -110h-34" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>'}${A.kid({ pose: resolved ? 'walk' : 'run', hairStyle: 'tied', hair: '#a8501e', skin: '#f0c19c', shirt: '#4fbf9a', wear: { coat: true, shoes: 'closed', goggles: false }, face: resolved ? 'smile' : 'oh' })}</g>${check}`;
      case 'okkid':
        return `<g transform="scale(.9)">${A.kid({ pose: 'hands', hairStyle: 'tied', hair: '#2b1a14', skin: '#d9a27b', shirt: '#5aa0d6', wear: { coat: true, goggles: true, shoes: 'closed' }, face: 'smile' })}</g>`;
      default: return '';
    }
  };

  /* ---------- M4 TERMINAL ROOM ---------- */
  A.terminalRoom = function () {
    return `
    ${R(0, 0, 1600, 900, 0, 'url(#sf-wallD)')}${R(0, 0, 1600, 900, 0, 'url(#sf-scan)')}
    ${ceiling(1600, [300, 800, 1300])}
    <ellipse cx="800" cy="860" rx="780" ry="80" fill="url(#sf-cyan)" opacity=".35"/>
    ${R(0, 780, 1600, 120, 0, 'url(#sf-floorD)')}
    ${[120, 1400].map((x) => `<g transform="translate(${x} 540)">${R(0, 0, 90, 160, 10, '#102a39', 'stroke="#47879d" stroke-width="3"')}${R(10, 10, 70, 44, 4, '#0a2a3a')}<path d="M16 40L32 30L48 38L66 20" stroke="#6cf0e4" stroke-width="3" fill="none"/></g>`).join('')}
    `;
  };

  /* ---------- M5 CONTROL ROOM ---------- */
  A.controlRoom = function () {
    return `
    ${R(0, 0, 1600, 900, 0, 'url(#sf-wallD)')}${R(0, 0, 1600, 900, 0, 'url(#sf-scan)')}
    ${ceiling(1600, [250, 800, 1350])}
    ${sign(600, 66, 400, 'SAFETY CONTROL ROOM')}
    ${R(0, 760, 1600, 140, 0, 'url(#sf-floorD)')}
    <ellipse cx="320" cy="640" rx="320" ry="40" fill="#2fc07f" opacity=".16" class="warmpulse"/><ellipse cx="1280" cy="640" rx="320" ry="40" fill="#ff9a5e" opacity=".16" class="warmpulse"/>
    ${R(560, 640, 480, 120, 20, '#0f2431', 'stroke="#47879d" stroke-width="4"')}${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${600 + i * 66}" cy="680" r="12" fill="${['#2fc07f', '#ffd36b', '#ff6b5e', '#6cf0e4', '#2fc07f', '#ffd36b'][i]}" opacity=".7" class="blink" style="animation-delay:${-i * 0.3}s"/>`).join('')}
    `;
  };

  /* ---------- M6 / M7 calm room ---------- */
  A.calmRoom = function (tint) {
    return `
    ${R(0, 0, 1600, 900, 0, 'url(#sf-wallW)')}${R(0, 360, 1600, 300, 0, 'url(#sf-tile)')}
    ${ceiling(1600, [300, 800, 1300])}
    ${R(0, 700, 1600, 200, 0, 'url(#sf-floor)')}${R(0, 700, 1600, 200, 0, 'url(#sf-ftile)')}
    <path d="M500 56L360 700H1240L1100 56Z" fill="url(#sf-beam)" opacity=".4" class="beam"/>
    ${plant(1500, 790, 0.8)}${plant(100, 790, 0.8)}
    ${tint ? R(0, 0, 1600, 900, 0, tint, 'opacity=".12"') : ''}
    `;
  };

  /* ---------- mini scene backdrop ---------- */
  const mini = (inner, w, h) => `<svg viewBox="0 0 ${w || 320} ${h || 200}" xmlns="http://www.w3.org/2000/svg" class="minisvg" aria-hidden="true">
    <rect width="320" height="200" fill="#bfe0e0"/><rect y="120" width="320" height="80" fill="#8db8bb"/><path d="M0 120H320" stroke="#6f9aa0" stroke-width="3"/>${inner}</svg>`;
  const benchM = `<g><rect x="30" y="88" width="170" height="10" rx="3" fill="#f4f8f4" stroke="#9fb4ae" stroke-width="2"/><rect x="36" y="98" width="158" height="52" fill="#2f5764"/><rect x="42" y="104" width="70" height="40" rx="3" fill="#26505e"/><rect x="118" y="104" width="70" height="40" rx="3" fill="#26505e"/></g>`;
  const kidAt = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})">${A.kid(o)}</g>`;
  const adult = (x, y, s, pose) => kidAt(x, y, s, { pose: pose || 'point', hairStyle: 'tied', hair: '#2b1a14', skin: '#b9754f', shirt: '#2f8f8a', pants: '#27384f', wear: { coat: true, shoes: 'closed' }, face: 'smile' });

  /* scenes for the rules cards (M5, M7). Safe / unsafe is in data. */
  A.ruleScene = function (id) {
    const kid = (x, o) => kidAt(x, 168, 0.42, Object.assign({ wear: { coat: true, shoes: 'closed' }, hairStyle: 'tied', hair: '#2b1a14', shirt: '#4fa3c7' }, o));
    switch (id) {
      case 'walk': return mini(`${benchM}${kid(240, { pose: 'walk', face: 'smile' })}<path d="M190 176h-60" stroke="#2fc07f" stroke-width="6" stroke-linecap="round" stroke-dasharray="3 12"/><path d="M130 176l12-9M130 176l12 9" stroke="#2fc07f" stroke-width="6" stroke-linecap="round"/>`);
      case 'run': return mini(`${benchM}<g class="hz-anim hz-wobble"><rect x="60" y="62" width="14" height="26" rx="4" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/><rect x="82" y="68" width="14" height="20" rx="4" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/></g>${kid(230, { pose: 'run', face: 'oh' })}<path d="M262 90h40M262 108h50M262 126h34" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>`);
      case 'wash': return mini(`<rect x="170" y="60" width="110" height="14" rx="6" fill="#b7c6c7"/><path d="M225 74V92" stroke="#9db0b4" stroke-width="10"/><rect x="190" y="104" width="70" height="40" rx="8" fill="#e9f1f0" stroke="#9fb4ae" stroke-width="3"/><path d="M221 78Q225 96 229 78" fill="#7fc2e8" opacity=".8"/>${kid(120, { pose: 'hands', face: 'smile', wear: { coat: true, shoes: 'closed' } })}<circle cx="190" cy="120" r="7" fill="#fff" stroke="#b9dde3" stroke-width="2"/><circle cx="206" cy="108" r="5" fill="#fff" stroke="#b9dde3" stroke-width="2"/><circle cx="244" cy="112" r="6" fill="#fff" stroke="#b9dde3" stroke-width="2"/>`);
      case 'eat': return mini(`${benchM}<g class="hz-anim hz-fly"><ellipse cx="100" cy="62" rx="4.500" ry="3" fill="#2a1d12"/></g><rect x="52" y="64" width="12" height="24" rx="3" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/><rect x="72" y="76" width="26" height="12" rx="5" fill="#e8c27a" stroke="#b88a3c" stroke-width="2"/>${kid(230, { pose: 'mouth', face: 'smile', wear: { coat: false, shoes: 'closed' } })}<rect x="236" y="106" width="22" height="12" rx="5" fill="#e8c27a" stroke="#b88a3c" stroke-width="2" transform="rotate(-20 247 112)"/>`);
      case 'report': return mini(`<g>${puddle(36)}</g>`.replace('<g class', '<g transform="translate(140 170)"><g class').replace(/<\/g>$/, '</g></g>') + `${adult(260, 170, 0.42, 'stand')}${kid(60, { pose: 'point', face: 'worried' })}<g><rect x="30" y="36" width="64" height="30" rx="14" fill="#fff" stroke="#6f9aa0" stroke-width="3"/><text x="62" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="900" fill="#c0392b">Spill!</text></g>`);
      case 'touch': return mini(`<g><rect x="190" y="72" width="100" height="80" rx="10" fill="#243844" stroke="#47879d" stroke-width="3"/><circle cx="220" cy="104" r="12" fill="#ffd36b" stroke="#a97a2a" stroke-width="3"/><circle cx="260" cy="104" r="12" fill="#ff6b5e" stroke="#a63a42" stroke-width="3"/><rect x="206" y="128" width="68" height="8" rx="3" fill="#6cf0e4"/></g>${kid(120, { pose: 'reach', face: 'think' })}<g><circle cx="150" cy="44" r="18" fill="#fff" stroke="#6f9aa0" stroke-width="3"/><text x="150" y="52" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="900" fill="#c0392b">?</text></g>`);
      case 'listen': return mini(`${adult(240, 170, 0.46, 'point')}${kid(100, { pose: 'stand', face: 'smile' })}<g><rect x="150" y="30" width="110" height="40" rx="16" fill="#fff" stroke="#6f9aa0" stroke-width="3"/><path d="M166 46h60M166 58h40" stroke="#2f8f8a" stroke-width="5" stroke-linecap="round"/></g>`);
      case 'tidy': return mini(`${benchM}<rect x="46" y="60" width="14" height="28" rx="4" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/><rect x="64" y="60" width="14" height="28" rx="4" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/><rect x="82" y="60" width="14" height="28" rx="4" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2"/><rect x="40" y="86" width="64" height="4" rx="2" fill="#7b9096"/><rect x="130" y="72" width="44" height="16" rx="2" fill="#f6efde" stroke="#c8b98f" stroke-width="2"/><g transform="translate(250 60)"><circle r="20" fill="#2fc07f"/><path d="M-9 0l6 6 12-12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`);
      case 'taste': return mini(`${kid(150, { pose: 'mouth', face: 'oh', wear: { coat: true, shoes: 'closed' } })}<rect x="150" y="82" width="26" height="30" rx="6" fill="rgba(200,240,250,.8)" stroke="#7fc2cf" stroke-width="2.500" transform="rotate(-18 163 97)"/><rect x="153" y="96" width="20" height="14" rx="3" fill="#9bff7a" opacity=".8" transform="rotate(-18 163 97)"/><g transform="translate(250 60)"><circle r="22" fill="#ff6b5e"/><path d="M-9 -9l18 18M9 -9l-18 18" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`);
      case 'bag': return mini(`<g><rect x="90" y="150" width="90" height="34" rx="12" fill="#e0525d" stroke="#a63a42" stroke-width="3" transform="rotate(-6 135 167)"/><path d="M110 150Q135 128 160 148" stroke="#a63a42" stroke-width="5" fill="none"/></g>${kid(250, { pose: 'walk', face: 'oh' })}<path d="M200 150L140 150" stroke="#ffd400" stroke-width="5" stroke-dasharray="4 8"/><g class="twinkle"><path d="M196 140l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#ffd400"/></g>`);
      default: return mini('');
    }
  };

  /* ---------- emergency scenes (calm, bright, no injuries) ---------- */
  A.emergScene = function (kind, step) {
    const bg = (inner) => `<svg viewBox="0 0 800 450" class="emsvg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${R(0, 0, 800, 450, 0, '#cfe8e6')}${R(0, 300, 800, 150, 0, '#9cc4c6')}<path d="M0 300H800" stroke="#7fa9ac" stroke-width="4"/>${R(0, 0, 800, 300, 0, 'url(#sf-tile)')}${inner}</svg>`;
    const k = (x, y, s, o) => kidAt(x, y, s, Object.assign({ hairStyle: 'tied', hair: '#2b1a14', shirt: '#4fa3c7', wear: { coat: true, goggles: true, shoes: 'closed' } }, o));
    const teacher = (x, y, s, pose) => adult(x, y, s, pose);
    const speech = (x, y, w, t) => `<g class="pop">${R(x, y, w, 46, 18, '#fff', 'stroke="#6f9aa0" stroke-width="3"')}<text x="${x + w / 2}" y="${y + 31}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="900" fill="#2b4a55">${t}</text></g>`;
    const bench = `<g>${R(40, 230, 330, 20, 5, '#f4f8f4', 'stroke="#9fb4ae" stroke-width="3"')}${R(50, 250, 310, 110, 0, '#2f5764')}</g>`;
    if (kind === 'spill') {
      const near = step === 0;
      return bg(`${bench}<g transform="translate(560 390)">${puddle(110)}</g>
        ${k(near ? 520 : 380, 400, 0.78, { pose: near ? 'stand' : 'stop', face: near ? 'think' : 'worried' })}
        ${step >= 1 ? speech(250, 90, 250, 'Spill! Teacher!') : ''}
        ${step >= 2 ? teacher(700, 400, 0.8, 'point') : ''}
        ${step >= 3 ? `<g transform="translate(560 380)"><path d="M-30 0L0 -100L30 0Z" fill="#ffd400" stroke="#b38f00" stroke-width="5" stroke-linejoin="round"/><text x="0" y="-18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="900" fill="#333">!</text></g>` : ''}`);
    }
    if (kind === 'eye') {
      const wash = step >= 1;
      return bg(`<g transform="translate(520 120)">${R(0, 0, 220, 190, 14, '#2e9a63', 'stroke="#1c6e45" stroke-width="5"')}${R(18, 14, 184, 36, 8, '#fff')}<text x="110" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="900" fill="#1c6e45" letter-spacing="2">EYEWASH</text><ellipse cx="110" cy="150" rx="86" ry="22" fill="#e6f4ee" stroke="#b6d8c8" stroke-width="4"/>${R(54, 96, 14, 40, 6, '#9fb4b8')}${R(152, 96, 14, 40, 6, '#9fb4b8')}${wash ? `<path d="M61 96Q61 70 90 60M159 96Q159 70 130 60" stroke="#7fd6f0" stroke-width="9" fill="none" stroke-linecap="round" class="hz-anim hz-flow"/><path d="M61 96Q61 70 90 60M159 96Q159 70 130 60" stroke="#e8fbff" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 14" class="hz-anim hz-flow"/>` : ''}</g>
        ${k(wash ? 600 : 330, 410, 0.82, { pose: wash ? 'hold' : 'stand', face: 'worried', wear: { coat: true, shoes: 'closed', goggles: false } })}
        ${step >= 0 ? speech(120, 70, 260, 'Eye splash!') : ''}${step >= 1 ? teacher(220, 410, 0.8, 'point') : ''}
        ${step >= 2 ? `<g transform="translate(120 250)"><circle r="40" fill="#fff" stroke="#6f9aa0" stroke-width="4"/><path d="M0 -26V0L16 10" stroke="#2b4a55" stroke-width="5" stroke-linecap="round" fill="none"/><text y="64" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="900" fill="#2b4a55">~15 min</text></g>` : ''}`);
    }
    if (kind === 'glass') {
      return bg(`${bench}<g transform="translate(560 390)"><path d="M-60 0L-30 -20L-12 0Z" fill="#e5fbff" stroke="#7fc2cf" stroke-width="3"/><path d="M0 -2L22 -30L40 -4Z" fill="#cfeff5" stroke="#7fc2cf" stroke-width="3"/><path d="M50 2L66 -14L82 4Z" fill="#e5fbff" stroke="#7fc2cf" stroke-width="3"/><path d="M-80 4L-68 -10L-56 6Z" fill="#cfeff5" stroke="#7fc2cf" stroke-width="3"/><g class="twinkle"><path d="M20 -56l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#fff"/></g></g>
        ${k(step === 0 ? 480 : 330, 400, 0.78, { pose: step === 0 ? 'stand' : 'stop', face: 'worried' })}
        ${step >= 1 ? speech(200, 90, 330, 'Careful! Broken glass!') : ''}${step >= 2 ? teacher(700, 400, 0.8, 'point') : ''}
        ${step >= 3 ? '<path d="M450 392L690 380M450 422L690 410" stroke="#ffd400" stroke-width="9" stroke-dasharray="22 12"/>' : ''}`);
    }
    /* fire alarm */
    const lined = step >= 1;
    return bg(`<g transform="translate(560 60)">${R(0, 0, 150, 66, 10, '#2e9a63', 'stroke="#1c6e45" stroke-width="4"')}<text x="62" y="44" text-anchor="middle" font-family="system-ui,sans-serif" font-size="26" font-weight="900" fill="#fff" letter-spacing="2">EXIT</text><path d="M104 22l24 11-24 11" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="translate(60 70)"><circle r="26" fill="#d33a2c" stroke="#8f2318" stroke-width="4"/><path d="M-10 6V-4a10 10 0 0 1 20 0V6M-14 6H14V12H-14Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></g>
      ${step >= 2 ? '<path d="M200 380L520 380" stroke="#2fc07f" stroke-width="9" stroke-dasharray="4 18" stroke-linecap="round"/><path d="M520 380l-22 -14M520 380l-22 14" stroke="#2fc07f" stroke-width="9" stroke-linecap="round"/>' : ''}
      ${teacher(lined ? 610 : 700, 410, 0.8, 'point')}
      ${k(lined ? 380 : 260, 410, 0.78, { pose: 'stand', face: 'smile', wear: { coat: false, shoes: 'closed' } })}${k(lined ? 280 : 160, 410, 0.74, { pose: 'stand', hair: '#7a3b22', skin: '#f0c19c', shirt: '#e0a43a', wear: { shoes: 'closed' } })}${lined ? k(180, 410, 0.7, { pose: 'stand', hair: '#3a2a1a', skin: '#8d5a3b', shirt: '#6aa86a', wear: { shoes: 'closed' } }) : ''}
      ${step >= 3 ? '<g transform="translate(700 300)"><circle r="30" fill="#2fc07f"/><path d="M-12 0l8 8 16-17" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' : ''}`);
  };

  /* ---------- Demo scenes for the Protection Lab (800x450) ---------- */
  const head = (cx, cy, s, o) => `<g transform="translate(${cx} ${cy}) scale(${s})"><g transform="translate(0 214)">${A.kid(Object.assign({ pose: 'stand' }, o)).replace(/<ellipse cx="0" cy="2"[^>]*\/>/, '')}</g></g>`;

  A.demo = function (kind, on) {
    const frame = (inner) => `<svg viewBox="0 0 800 450" class="demosvg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
    const drops = (n, fromX, fromY, toX, toY, cls, color) => [...Array(n)].map((_, i) => `<g class="dx ${cls}" style="--dx:${toX - fromX + (i % 3) * 8 - 8}px;--delay:${i * 0.12}s;transform:translate(${fromX}px,${fromY}px)"><circle class="dy" r="${6 + (i % 3) * 2}" fill="${color || '#4fc3f7'}" stroke="#e8fbff" stroke-width="2" style="--dy:${toY - fromY + (i % 4) * 10 - 10}px;--delay:${i * 0.12}s"/></g>`).join('');
    const bench = `<path d="M0 410H800V450H0Z" fill="#2f5764"/><path d="M0 404H800V412H0Z" fill="#f4f8f4"/>`;
    if (kind === 'goggles') {
      return frame(`${R(0, 0, 800, 450, 0, '#d6ecee')}${bench}
        ${head(250, 175, 1.7, { hairStyle: 'tied', hair: '#2b1a14', shirt: '#4fa3c7', wear: { coat: true, goggles: !!on }, face: on ? 'smile' : 'think' })}
        <g transform="translate(640 340)"><path d="M-30 -40H30L40 40H-40Z" fill="url(#sf-glass)" stroke="#7fc2cf" stroke-width="4"/><path d="M-34 -4H34L40 40H-40Z" fill="url(#sf-liquid)"/></g>
        ${drops(9, 610, 290, on ? 322 : 262, 178, on ? 'hit' : 'pass')}
        ${on ? `<g class="pop" transform="translate(470 70)">${R(0, 0, 250, 56, 18, '#fff', 'stroke="#2fc07f" stroke-width="4"')}<text x="125" y="35" text-anchor="middle" font-family="system-ui,sans-serif" font-size="21" font-weight="900" fill="#1c6e45">Splash stopped!</text></g>`
        : `<g transform="translate(250 175)"><ellipse rx="86" ry="74" fill="none" stroke="#ff9a5e" stroke-width="6" stroke-dasharray="10 8" class="ringdash"/></g><g class="pop" transform="translate(470 70)">${R(0, 0, 270, 56, 18, '#fff', 'stroke="#ff9a5e" stroke-width="4"')}<text x="135" y="35" text-anchor="middle" font-family="system-ui,sans-serif" font-size="21" font-weight="900" fill="#b85a1c">Splash zone: eyes!</text></g>`}`);
    }
    if (kind === 'coat') {
      return frame(`${R(0, 0, 800, 450, 0, '#d6ecee')}${bench}
        <g transform="translate(250 430) scale(1.4)">${A.kid({ pose: 'hands', hairStyle: 'tied', shirt: '#4fa3c7', wear: { coat: !!on, shoes: 'closed' }, face: 'smile' })}</g>
        ${[0, 1, 2, 3].map((i) => `<g class="dx pass" style="--dx:${(i % 2) * 24 - 10}px;--delay:${i * 0.2}s;transform:translate(${190 + i * 16}px,70px)"><path class="dy" d="M0 -10C10 4 10 14 0 14C-10 14 -10 4 0 -10Z" fill="#ff7bd0" stroke="#fff" stroke-width="2" style="--dy:${250 + (i % 2) * 18}px;--delay:${i * 0.2}s"/></g>`).join('')}
        <g class="stain" transform="translate(210 ${on ? 330 : 342})"><ellipse rx="44" ry="26" fill="#ff7bd0" opacity=".75"/><ellipse cx="-12" cy="-6" rx="14" ry="7" fill="#fff" opacity=".5"/></g>
        <g class="pop" transform="translate(470 80)">${R(0, 0, 290, 96, 18, '#fff', `stroke="${on ? '#2fc07f' : '#ff9a5e'}" stroke-width="4"`)}<text x="145" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="${on ? '#1c6e45' : '#b85a1c'}">${on ? 'Spill stays on the coat' : 'Spill soaks into clothes'}</text><text x="145" y="68" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#2b4a55">${on ? 'Big spill? Move away, tell a teacher.' : 'Skin and clothes get messy.'}</text></g>`);
    }
    if (kind === 'shoes') {
      const foot = (x, sand) => `<g transform="translate(${x} 360)">${sand
        ? `<rect x="-70" y="40" width="140" height="16" rx="8" fill="#9b6b3e" stroke="#6e4a26" stroke-width="3"/><path d="M-60 40Q-70 -10 -20 -20L30 -20Q70 -14 76 40Z" fill="#d6a37e" stroke="#9a6e4c" stroke-width="4"/>${[-44, -22, 0, 22, 44].map((tx) => `<ellipse cx="${tx + 8}" cy="34" rx="9" ry="11" fill="#d6a37e" stroke="#9a6e4c" stroke-width="3"/>`).join('')}<path d="M-30 -14Q0 -50 30 -14" stroke="#e9573f" stroke-width="10" fill="none" stroke-linecap="round"/>`
        : `<path d="M-72 50Q-72 -4 -20 -20L40 -34Q70 -34 80 -4Q84 20 86 50Z" fill="#f4f8f9" stroke="#7c97a3" stroke-width="4"/><path d="M-76 46H90V62Q90 70 80 70H-66Q-76 70 -76 60Z" fill="#3f86b4" stroke="#27648a" stroke-width="3"/><path d="M30 -30Q64 -26 74 6" stroke="#d4e2e8" stroke-width="5" fill="none"/>`}</g>`;
      return frame(`${R(0, 0, 800, 450, 0, '#d6ecee')}${R(0, 410, 800, 40, 0, '#8db8bb')}
        ${foot(210, true)}${foot(590, false)}
        ${[0, 1, 2].map((i) => `<g class="dx pass" style="--dx:0px;--delay:${i * 0.25}s;transform:translate(${170 + i * 40}px,60px)"><circle class="dy" r="9" fill="#ff7bd0" stroke="#fff" stroke-width="2" style="--dy:${282 + (i % 2) * 14}px;--delay:${i * 0.25}s"/></g>`).join('')}
        ${[0, 1, 2].map((i) => `<g class="dx pass" style="--dx:${(i - 1) * 16}px;--delay:${i * 0.25}s;transform:translate(${560 + i * 22}px,60px)"><circle class="dy" r="9" fill="#ff7bd0" stroke="#fff" stroke-width="2" style="--dy:${300 + i * 6}px;--delay:${i * 0.25}s"/></g>`).join('')}
        <text x="210" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#b85a1c">Open sandals</text><text x="590" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#1c6e45">Closed-toe shoes</text>
        <g class="pop"><ellipse cx="210" cy="372" rx="100" ry="40" fill="none" stroke="#ff9a5e" stroke-width="6" stroke-dasharray="10 8" class="ringdash"/><path d="M570 370l16 16 38-40" stroke="#2fc07f" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -60)"/></g>`);
    }
    if (kind === 'hair') {
      const side = (x, tied) => `<g transform="translate(${x} 0)">
        <g class="${tied ? '' : 'hairswing'}" style="transform-origin:0 200px">
          <ellipse cx="0" cy="170" rx="46" ry="54" fill="#d9a27b" stroke="#9a6e4c" stroke-width="4"/>
          ${tied ? '<path d="M-34 140C-30 110 30 110 34 140C20 128 -20 128 -34 140Z" fill="#2b1a14"/><ellipse cx="30" cy="124" rx="12" ry="18" fill="#2b1a14"/><rect x="22" y="132" width="16" height="8" rx="4" fill="#ff8c7a"/>' : '<path d="M-44 168C-56 210 -52 270 -34 300L-8 300C-22 260 -26 210 -22 168Z" fill="#2b1a14" class="hairflow"/><path d="M-44 150C-40 110 40 110 44 150C26 128 -26 128 -44 150Z" fill="#2b1a14"/>'}
          <ellipse cx="-14" cy="168" rx="5" ry="6.500" fill="#2b1a14"/><ellipse cx="14" cy="168" rx="5" ry="6.500" fill="#2b1a14"/><path d="M-9 190Q0 198 9 190" stroke="#8a2f3b" stroke-width="4" fill="none" stroke-linecap="round"/>
        </g>
        <rect x="-70" y="330" width="140" height="80" rx="10" fill="url(#sf-glass)" stroke="#7fc2cf" stroke-width="4"/><path d="M-66 360H66V402Q66 408 60 408H-60Q-66 408 -66 402Z" fill="url(#sf-liquid)"/></g>`;
      return frame(`${R(0, 0, 800, 450, 0, '#d6ecee')}${bench}${side(210, false)}${side(590, true)}
        <text x="210" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#b85a1c">Loose hair</text><text x="590" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#1c6e45">Tied-back hair</text>
        <g class="pop" transform="translate(110 70)"><rect width="200" height="30" rx="14" fill="#fff" stroke="#ff9a5e" stroke-width="3"/><text x="100" y="21" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" fill="#b85a1c">dips into your work</text></g>`);
    }
    if (kind === 'gloves') {
      const ic = (id, x, y, sz) => A.gear(id, sz).replace('<svg ', `<svg x="${x}" y="${y}" `);
      const txt = (x, y, t, sz, col, w) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${sz}" font-weight="${w || 900}" fill="${col}">${t}</text>`;
      const card = (x, col, inner) => `<g transform="translate(${x} 40)">${R(0, 0, 230, 370, 22, '#fff', `stroke="${col}" stroke-width="5"`)}${inner}</g>`;
      const mark = (ok, x, y) => ok === 1 ? `<g transform="translate(${x} ${y})"><circle r="24" fill="#2fc07f"/><path d="M-10 0l7 8 14-16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : ok === 2 ? `<g transform="translate(${x} ${y})"><circle r="24" fill="#ff9a5e"/><path d="M0 -12v14M0 10v2" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>` : `<g transform="translate(${x} ${y})"><circle r="24" fill="#e8574b"/><path d="M-10 -10l20 20M10 -10l-20 20" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>`;
      const bg = R(0, 0, 800, 450, 0, '#d6ecee');
      const i = on | 0;
      if (i === 0) {
        return frame(`${bg}${card(25, '#2fc07f', `${ic('gloves', 55, 40, 120)}${txt(115, 205, 'Thin disposable', 22, '#1c6e45')}${txt(115, 235, 'gloves', 22, '#1c6e45')}${txt(115, 275, 'Good for messy,', 16, '#2b4a55', 700)}${txt(115, 297, 'splashy jobs', 16, '#2b4a55', 700)}${mark(1, 115, 335)}`)}
          ${card(285, '#ff9a5e', `<g style="filter:hue-rotate(-150deg) saturate(1.3)">${ic('gloves', 55, 40, 120)}</g>${txt(115, 205, 'Heat gloves', 22, '#b85a1c')}${txt(115, 275, 'For hot things.', 16, '#2b4a55', 700)}${txt(115, 297, 'Adults use these.', 16, '#2b4a55', 700)}${mark(2, 115, 335)}`)}
          ${card(545, '#e8574b', `<g style="filter:grayscale(1) brightness(1.15)">${ic('gloves', 55, 40, 120)}</g>${txt(115, 205, 'Cloth gloves', 22, '#a63a42')}${txt(115, 275, 'Liquid soaks', 16, '#2b4a55', 700)}${txt(115, 297, 'right through', 16, '#2b4a55', 700)}${mark(0, 115, 335)}`)}`);
      }
      if (i === 1) {
        return frame(`${bg}${card(25, '#2fc07f', `${ic('gloves', 55, 40, 120)}<circle cx="170" cy="70" r="30" fill="none" stroke="#2b4a55" stroke-width="6"/><path d="M192 92l24 24" stroke="#2b4a55" stroke-width="8" stroke-linecap="round"/>${txt(115, 215, 'Check for holes', 22, '#1c6e45')}${txt(115, 262, 'before you start', 16, '#2b4a55', 700)}${mark(1, 115, 330)}`)}
          ${card(285, '#2fc07f', `${ic('gloves', 20, 60, 100)}<g transform="translate(150 150)"><path d="M-30 -60H30L38 40H-38Z" fill="url(#sf-glass)" stroke="#7fc2cf" stroke-width="4"/><path d="M-34 -14H34L38 40H-38Z" fill="url(#sf-liquid)"/></g>${txt(115, 215, 'Gloved hands touch', 20, '#1c6e45')}${txt(115, 240, 'only the job', 20, '#1c6e45')}${mark(1, 115, 330)}`)}
          ${card(545, '#e8574b', `${ic('gloves', 20, 60, 100)}<g transform="translate(150 130)">${R(-26, -48, 52, 96, 10, '#2f3b46', 'stroke="#111" stroke-width="3"')}${R(-20, -40, 40, 66, 4, '#6cf0e4', 'opacity=".5"')}</g>${txt(115, 215, 'Not face, phone', 20, '#a63a42')}${txt(115, 240, 'or door handles', 20, '#a63a42')}${mark(0, 115, 330)}`)}`);
      }
      const num = (n, x) => `<g transform="translate(${x} 36)"><circle r="22" fill="#2f8f8a"/><text y="8" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="900" fill="#fff">${n}</text></g>`;
      return frame(`${bg}${card(25, '#47879d', `${num(1, 40)}${ic('gloves', 55, 60, 120)}<path d="M55 150L100 108" stroke="#ff9a5e" stroke-width="7" stroke-linecap="round"/><path d="M100 108l-16 2M100 108l-2 16" stroke="#ff9a5e" stroke-width="7" stroke-linecap="round"/>${txt(115, 225, 'Pinch the wrist', 20, '#2b4a55')}${txt(115, 252, 'and peel back', 20, '#2b4a55')}`)}
        ${card(285, '#47879d', `${num(2, 40)}<g transform="translate(0 4)" style="transform-origin:115px 140px;transform:scaleX(-1)">${ic('gloves', 55, 60, 120)}</g>${txt(115, 225, 'Turn it inside', 20, '#2b4a55')}${txt(115, 252, 'out into a ball', 20, '#2b4a55')}`)}
        ${card(545, '#47879d', `${num(3, 40)}${ic('soap', 55, 60, 120)}${txt(115, 225, 'Bin the gloves,', 20, '#2b4a55')}${txt(115, 252, 'then wash hands', 20, '#2b4a55')}`)}`);
    }
    return frame('');
  };
})();