/* lab.js (art): the Secret Fly Lab, drawn as four parallax layers (world is 2400 x 900 units).
 *   back  (moves 45% of camera): wall, windows with golden-hour sky, ceiling lights
 *   mid   (moves 75%): hanging pendant lamps, wall shelves, plants, light shafts
 *   main  (moves 100%): floor, benches, every interactive object
 *   fore  (moves 118%): soft foreground plants and cables for depth
 * Interactive objects are <g class="obj" data-id=".." data-name=".."> with a .halo outline used for hover and hints.
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});

  const R = (x, y, w, h, r, fill, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${fill}" ${extra || ''}/>`;
  const halo = (x, y, w, h, r) => `<rect class="halo" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 18}"/>`;
  const obj = (id, name, x, y, w, h, inner, r) => `<g class="obj" data-id="${id}" data-name="${name}" tabindex="0" role="button" aria-label="${name}">${inner}${halo(x, y, w, h, r)}</g>`;

  A.labDefs = function () {
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b6a72"/><stop offset=".6" stop-color="#335b66"/><stop offset="1" stop-color="#274854"/></linearGradient>
      <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0e0"/><stop offset=".55" stop-color="#ffe3b0"/><stop offset="1" stop-color="#ffb978"/></linearGradient>
      <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#365a63"/><stop offset="1" stop-color="#1b343d"/></linearGradient>
      <linearGradient id="g-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9efe9"/><stop offset=".5" stop-color="#cfdad4"/><stop offset="1" stop-color="#9fb4ae"/></linearGradient>
      <linearGradient id="g-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5764"/><stop offset="1" stop-color="#1f3d49"/></linearGradient>
      <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5fbff" stop-opacity=".75"/><stop offset="1" stop-color="#7fc2cf" stop-opacity=".25"/></linearGradient>
      <linearGradient id="g-metal" x1="0" x2="1"><stop offset="0" stop-color="#8aa2a8"/><stop offset=".4" stop-color="#e9f1f0"/><stop offset="1" stop-color="#7d949a"/></linearGradient>
      <linearGradient id="g-cab" x1="0" x2="1"><stop offset="0" stop-color="#1c3843"/><stop offset=".5" stop-color="#27495a"/><stop offset="1" stop-color="#1a3541"/></linearGradient>
      <linearGradient id="g-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f3b52"/><stop offset="1" stop-color="#0a2233"/></linearGradient>
      <linearGradient id="g-food" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d58a"/><stop offset="1" stop-color="#d4a85a"/></linearGradient>
      <radialGradient id="g-warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd58a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
      <linearGradient id="g-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a8" stop-opacity=".34"/><stop offset="1" stop-color="#ffe3a8" stop-opacity="0"/></linearGradient>
      <pattern id="p-tile" width="80" height="60" patternUnits="userSpaceOnUse"><path d="M0 0H80M0 0V60" stroke="#a8d0d2" stroke-opacity=".12" stroke-width="2"/></pattern>
      <pattern id="p-floor" width="120" height="50" patternUnits="userSpaceOnUse"><path d="M0 0H120M0 0V50" stroke="#a8d0d2" stroke-opacity=".08" stroke-width="2"/></pattern>
    </defs></svg>`;
  };

  /* ---------------- BACK LAYER ---------------- */
  function windowArt(x, y, w, h) {
    return `
    <g>
      ${R(x - 14, y - 14, w + 28, h + 28, 10, '#d9e6df', 'stroke="#6f9096" stroke-width="6"')}
      ${R(x, y, w, h, 4, 'url(#g-sky)')}
      <circle cx="${x + w * 0.72}" cy="${y + h * 0.4}" r="${h * 0.16}" fill="#fff7d6" opacity=".95"/>
      <circle cx="${x + w * 0.72}" cy="${y + h * 0.4}" r="${h * 0.3}" fill="#fff3c0" opacity=".22" class="pulse"/>
      <g class="cloud" style="animation-duration:70s">${R(x + 30, y + 40, 90, 20, 10, '#fff', 'opacity=".75"')}${R(x + 58, y + 26, 54, 24, 12, '#fff', 'opacity=".75"')}</g>
      <g class="cloud" style="animation-duration:95s;animation-delay:-30s">${R(x + 150, y + 74, 110, 22, 11, '#fff', 'opacity=".6"')}${R(x + 180, y + 58, 60, 24, 12, '#fff', 'opacity=".6"')}</g>
      <path d="M${x} ${y + h}V${y + h * 0.66}Q${x + w * 0.2} ${y + h * 0.5} ${x + w * 0.38} ${y + h * 0.64}T${x + w * 0.7} ${y + h * 0.6}T${x + w} ${y + h * 0.62}V${y + h}Z" fill="#5f9b86" opacity=".85"/>
      <path d="M${x} ${y + h}V${y + h * 0.8}Q${x + w * 0.3} ${y + h * 0.68} ${x + w * 0.55} ${y + h * 0.8}T${x + w} ${y + h * 0.78}V${y + h}Z" fill="#3e7a68"/>
      <g class="sway" style="transform-origin:${x + w * 0.2}px ${y + h}px"><rect x="${x + w * 0.18}" y="${y + h * 0.6}" width="8" height="${h * 0.4}" fill="#4a3a2a"/><circle cx="${x + w * 0.18 + 4}" cy="${y + h * 0.56}" r="${h * 0.14}" fill="#3f8a5f"/><circle cx="${x + w * 0.14}" cy="${y + h * 0.62}" r="${h * 0.1}" fill="#4a9a6a"/></g>
      ${R(x + w / 2 - 4, y, 8, h, 0, '#d9e6df')}${R(x, y + h * 0.48, w, 8, 0, '#d9e6df')}
      ${R(x - 24, y + h + 8, w + 48, 16, 5, '#c5d6cf', 'stroke="#6f9096" stroke-width="3"')}
    </g>`;
  }
  A.labBack = function () {
    let panels = '';
    for (let i = 0; i < 13; i++) panels += `<path d="M${i * 200} 0V640" stroke="#0e2b33" stroke-opacity=".18" stroke-width="3"/>`;
    return `
      ${R(0, 0, 2400, 660, 0, 'url(#g-wall)')}${panels}
      ${R(0, 440, 2400, 220, 0, 'url(#p-tile)')}
      ${R(0, 432, 2400, 10, 0, '#8fb8b8', 'opacity=".5"')}
      ${R(0, 0, 2400, 56, 0, '#16303a')}
      ${[300, 900, 1500, 2100].map((x) => `${R(x - 120, 22, 240, 16, 8, '#c9eef0')}${R(x - 104, 26, 208, 8, 4, '#fffbe6', 'class="flick"')}`).join('')}
      ${windowArt(650, 110, 330, 270)}${windowArt(1500, 110, 330, 270)}${windowArt(2160, 130, 190, 230)}
      ${R(0, 600, 2400, 70, 0, '#1d3a45', 'opacity=".6"')}
    `;
  };

  /* ---------------- MID LAYER ---------------- */
  function pendant(x, len) {
    return `<g class="swing" style="transform-origin:${x}px 0">
      <path d="M${x} 56V${len}" stroke="#0e1d24" stroke-width="4"/>
      <path d="M${x - 60} ${len + 40}Q${x - 52} ${len} ${x} ${len - 4}Q${x + 52} ${len} ${x + 60} ${len + 40}Z" fill="#e8b35a" stroke="#a97a2a" stroke-width="4"/>
      <ellipse cx="${x}" cy="${len + 42}" rx="42" ry="8" fill="#fff2c4" class="flick"/>
      <path d="M${x - 40} ${len + 46}L${x - 190} 600H${x + 190}L${x + 40} ${len + 46}Z" fill="url(#g-beam)" opacity=".7"/>
    </g>`;
  }
  A.labMid = function () {
    const jars = (x, y) => {
      let s = R(x, y, 340, 12, 4, '#b99a6a') + R(x, y + 112, 340, 12, 4, '#b99a6a') + R(x + 8, y + 124, 12, 40, 3, '#8a6f45') + R(x + 320, y + 124, 12, 40, 3, '#8a6f45');
      const cols = ['#ffbd6b', '#7df0cf', '#ff8c7a', '#8ec9ff', '#ffe08a', '#c9a7ff'];
      for (let i = 0; i < 6; i++) { const h = 38 + (i % 3) * 14; s += R(x + 20 + i * 52, y - h, 38, h, 8, 'url(#g-glass)', 'stroke="#bfe7ea" stroke-width="2"') + R(x + 24 + i * 52, y - h * 0.62, 30, h * 0.62 - 4, 5, cols[i], 'opacity=".75"') + R(x + 18 + i * 52, y - h - 6, 42, 8, 3, '#d7b768'); }
      for (let i = 0; i < 5; i++) s += R(x + 22 + i * 58, y + 112 - 62, 40, 62, 3, ['#6aa6b0', '#e29a7c', '#8bbf8f', '#c9b36a', '#8e8fc9'][i], 'stroke="#12303a" stroke-width="3"');
      return s;
    };
    const plant = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-34 0H34L26 60H-26Z" fill="#c9806a" stroke="#8b4f3e" stroke-width="3"/><g class="sway" style="transform-origin:0 0"><path d="M0 0C-30-50-60-60-70-110C-30-90-10-60 0 0Z" fill="#4c9a6b"/><path d="M0 0C30-60 60-70 80-100C40-90 10-60 0 0Z" fill="#5fb07a"/><path d="M0 0C-5-70 10-110 4-150C-18-110-12-60 0 0Z" fill="#3e8a5e"/></g></g>`;
    return `
      ${pendant(480, 150)}${pendant(1260, 170)}${pendant(2040, 150)}
      <g opacity=".95">${jars(1010, 290)}</g>
      ${plant(1560, 600, 0.9)}${plant(60, 560, 1)}
      <g opacity=".9"><path d="M700 380L560 640H1000L900 380Z" fill="url(#g-beam)" class="beam"/><path d="M1540 380L1400 640H1900L1790 380Z" fill="url(#g-beam)" class="beam" style="animation-delay:-3s"/></g>
    `;
  };

  /* ---------------- MAIN LAYER ---------------- */
  function bottle(x, y, w, h, col) { return R(x, y, w, h, 7, 'url(#g-glass)', 'stroke="#bfe7ea" stroke-width="2.500"') + R(x + 4, y + h * 0.4, w - 8, h * 0.6 - 4, 5, col, 'opacity=".8"') + R(x + w * 0.25, y - 9, w * 0.5, 11, 3, '#d7b768'); }

  function cabinet() {
    return obj('cabinet', 'Storage cabinet', 60, 220, 290, 580, `
      ${R(60, 220, 290, 580, 14, 'url(#g-cab)', 'stroke="#5f8794" stroke-width="6"')}
      ${R(80, 244, 250, 330, 8, '#0f2a35')}
      ${R(84, 400, 242, 8, 2, '#5f8794')}${R(84, 506, 242, 8, 2, '#5f8794')}
      ${bottle(100, 290, 44, 108, '#ffbd6b')}${bottle(156, 306, 40, 92, '#7df0cf')}${bottle(208, 280, 50, 118, '#ff8c7a')}${bottle(270, 312, 40, 86, '#8ec9ff')}
      ${R(100, 420, 70, 84, 6, '#e8dcbc', 'stroke="#8a7a4d" stroke-width="3"')}${R(108, 436, 54, 12, 3, '#c0392b')}${R(108, 456, 40, 7, 2, '#8a7a4d')}
      ${R(190, 424, 120, 80, 6, '#d5e7ea', 'stroke="#6f9096" stroke-width="3"')}${[0, 1, 2, 3, 4, 5].map((i) => R(198 + i * 19, 434, 12, 60, 5, 'url(#g-glass)', 'stroke="#7fb0b7" stroke-width="1.500"')).join('')}
      ${bottle(104, 524, 56, 40, '#ffe08a')}${bottle(176, 520, 40, 44, '#c9a7ff')}${bottle(232, 526, 70, 38, '#7df0cf')}
      <path d="M92 252L180 252L92 380Z" fill="#fff" opacity=".07"/>
      ${R(80, 590, 250, 190, 8, '#1a3844', 'stroke="#456e7c" stroke-width="3"')}
      ${R(200, 590, 4, 190, 0, '#456e7c')}${R(186, 670, 8, 40, 4, '#e9c46a')}${R(212, 670, 8, 40, 4, '#e9c46a')}
      ${R(106, 612, 70, 24, 4, '#e8dcbc')}<text x="114" y="629" font-family="system-ui,sans-serif" font-size="14" font-weight="800" fill="#2b4a55">FLY FOOD</text>`, 18);
  }

  function poster() {
    return obj('poster', 'Fly poster', 420, 170, 190, 250, `
      <g transform="rotate(-1.500 515 295)">
        ${R(422, 174, 186, 244, 6, '#f6efde', 'stroke="#c8b98f" stroke-width="5"')}
        ${R(436, 188, 158, 36, 4, '#3b6a72')}<text x="515" y="213" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="#fff" letter-spacing="2">FRUIT FLY</text>
        <svg x="440" y="226" width="150" height="150" viewBox="-245 -225 490 420">${A.fly({ sex: 'f', wing: 56, det: 0 })}</svg>
        <path d="M444 392h140" stroke="#c8b98f" stroke-width="3"/><path d="M444 402h96" stroke="#c8b98f" stroke-width="3"/>
        ${R(500, 160, 30, 16, 2, '#f0d98a', 'opacity=".9"')}
      </g>`, 12);
  }

  function computer() {
    return obj('computer', 'Computer', 660, 340, 250, 270, `
      ${R(770, 520, 28, 70, 4, '#7d949a')}${R(722, 584, 124, 20, 8, '#9db2b5', 'stroke="#4c6a72" stroke-width="3"')}
      ${R(664, 344, 240, 180, 14, '#17313b', 'stroke="#7d949a" stroke-width="6"')}
      ${R(678, 358, 212, 152, 6, 'url(#g-screen)')}
      <g class="screen">
        <path d="M692 480L720 450L748 466L778 420L810 440L842 396L876 410" fill="none" stroke="#6cf0d4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="draw"/>
        ${R(692, 372, 80, 8, 4, '#4d8fa6')}${R(692, 388, 52, 8, 4, '#4d8fa6')}
        <svg x="820" y="364" width="56" height="48" viewBox="-245 -225 490 420">${A.fly({ sex: 'm', det: 0 })}</svg>
        <rect x="692" y="494" width="9" height="3" fill="#6cf0d4" class="blink"/>
      </g>
      <path d="M684 364H850L684 440Z" fill="#fff" opacity=".05"/>
      ${R(690, 592, 200, 12, 5, '#d4dfdc', 'stroke="#8fa8ab" stroke-width="2"')}
      ${R(900, 588, 22, 16, 8, '#d4dfdc', 'stroke="#8fa8ab" stroke-width="2"')}`, 18);
  }

  function notebook() {
    return obj('notebook', 'Lab notebook', 940, 560, 190, 50, `
      <path d="M944 604L960 574H1124L1136 604Z" fill="#f6efde" stroke="#b9a874" stroke-width="3"/>
      <path d="M1040 576V604" stroke="#b9a874" stroke-width="3"/>
      <path d="M966 584H1030M966 592H1020M1050 584H1112M1050 592H1100" stroke="#6fa0b3" stroke-width="3" stroke-linecap="round"/>
      ${R(1090, 566, 110, 7, 3, '#f0b64a', 'transform="rotate(14 1090 566)"')}
      <path d="M1176 584L1190 592" stroke="#c0392b" stroke-width="5" stroke-linecap="round"/>
      <g class="twinkle"><path d="M1120 556l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff6c4"/></g>`, 12);
  }

  function fruit() {
    return obj('fruit', 'Fruit bowl', 1150, 540, 110, 70, `
      <path d="M1156 574Q1160 608 1206 608Q1252 608 1256 574Z" fill="#e8dcbc" stroke="#a8935a" stroke-width="3"/>
      <circle cx="1186" cy="566" r="16" fill="#e9573f"/><path d="M1186 550q6-8 12-6" stroke="#3e8a5e" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M1200 568Q1222 538 1252 556Q1226 560 1206 584Z" fill="#f4d35e" stroke="#c5a22a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1250 556l6-8" stroke="#6b5a1e" stroke-width="5" stroke-linecap="round"/>
      <circle cx="1218" cy="562" r="1.500" fill="#6b5a1e"/><circle cx="1230" cy="560" r="1.500" fill="#6b5a1e"/>
      <g class="twinkle" style="animation-delay:-1s"><path d="M1160 546l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff6c4"/></g>`, 14);
  }

  function compound() {
    return obj('compound', 'Compound microscope', 1280, 410, 150, 200, `
      <ellipse cx="1356" cy="606" rx="70" ry="9" fill="#000" opacity=".3"/>
      ${R(1290, 584, 130, 22, 8, '#8fa2a8', 'stroke="#52686f" stroke-width="3"')}
      <path d="M1384 584V470Q1384 430 1352 420" fill="none" stroke="#b7c6c7" stroke-width="22" stroke-linecap="round"/>
      <path d="M1384 584V470Q1384 430 1352 420" fill="none" stroke="#52686f" stroke-width="3" opacity=".6"/>
      <g transform="rotate(-18 1340 440)">${R(1326, 380, 22, 70, 5, '#26343b', 'stroke="#0b1319" stroke-width="2.500"')}${R(1322, 370, 30, 14, 5, '#10181e')}</g>
      ${R(1318, 450, 48, 22, 4, '#6a7f87', 'stroke="#32474f" stroke-width="2"')}
      <path d="M1326 472v22M1342 472v26M1358 472v22" stroke="#26343b" stroke-width="9" stroke-linecap="round"/>
      ${R(1304, 520, 86, 9, 3, '#53686f')}${R(1330, 513, 34, 7, 2, '#d8e6ec', 'opacity=".8"')}
      <circle cx="1386" cy="520" r="14" fill="#3c525b" stroke="#15222a" stroke-width="3"/><circle cx="1386" cy="520" r="5" fill="#8fa2a8"/>
      <circle cx="1386" cy="548" r="10" fill="#3c525b" stroke="#15222a" stroke-width="3"/>`, 14);
  }

  function vials() {
    let v = '';
    const xs = [1462, 1500, 1538, 1576, 1614, 1652];
    xs.forEach((x, i) => {
      v += `<g>${R(x, 500, 30, 102, 8, 'url(#g-glass)', 'stroke="#bfe7ea" stroke-width="2.500"')}${R(x + 3, 566, 24, 32, 5, 'url(#g-food)')}${R(x - 2, 484, 34, 26, 6, '#f4efe0', 'stroke="#c9bf9f" stroke-width="2"')}${R(x + 5, 540, 20, 14, 2, '#fff', 'opacity=".85"')}`;
      for (let k = 0; k < 3; k++) v += `<circle cx="${x + 8 + k * 6}" cy="${540 - k * 10}" r="2.200" fill="#2a1d12" class="buzz" style="animation-delay:${-(i * 0.7 + k * 0.5)}s;animation-duration:${2.2 + k * 0.6}s"/>`;
      v += `</g>`;
    });
    return obj('vials', 'Fly vials', 1440, 480, 270, 130, `
      ${R(1444, 596, 250, 10, 4, '#7b9096')}${R(1444, 520, 12, 80, 3, '#7b9096')}${R(1686, 520, 12, 80, 3, '#7b9096')}${v}
      ${R(1470, 586, 92, 16, 3, '#f6efde')}<text x="1516" y="598" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="800" fill="#2b4a55">FLY CULTURES</text>`, 14);
  }

  function prep() {
    return obj('prep', 'Sleepy fly pad', 1720, 545, 230, 68, `
      <ellipse cx="1830" cy="606" rx="110" ry="9" fill="#000" opacity=".25"/>
      ${R(1740, 576, 140, 28, 8, '#d6dcda', 'stroke="#7d9298" stroke-width="3"')}${R(1752, 566, 116, 14, 4, '#e8ecea', 'stroke="#9fb0b2" stroke-width="2"')}
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${1764 + i * 12}" cy="573" r="2" fill="#9fb0b2"/>`).join('')}
      <path d="M1880 590Q1920 590 1920 548" fill="none" stroke="#6aa6b0" stroke-width="7" stroke-linecap="round"/>${R(1908, 534, 24, 20, 5, '#4d8fa6')}
      <path d="M1760 552L1790 534" stroke="#a0734a" stroke-width="5" stroke-linecap="round"/><path d="M1790 534L1806 524" stroke="#e8d9b0" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="1930" cy="598" rx="24" ry="6" fill="#d7ecef" stroke="#7fb0b7" stroke-width="2" opacity=".9"/>`, 14);
  }

  function lamp() {
    return obj('lamp', 'Desk lamp', 1960, 420, 120, 190, `
      <ellipse cx="2000" cy="604" rx="42" ry="7" fill="#000" opacity=".3"/>${R(1970, 592, 60, 12, 6, '#7d949a')}
      <path d="M2000 592L1988 510L2024 446" fill="none" stroke="#b7c6c7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1996 432L2056 420L2040 470L1992 474Z" fill="#f2c15a" stroke="#a97a2a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1996 474H2040L2062 604H1960Z" fill="url(#g-beam)" opacity=".9" class="lampbeam"/>
      <ellipse cx="2018" cy="472" rx="22" ry="5" fill="#fff6c4" class="flick"/>`, 14);
  }

  function clock() {
    return obj('clock', 'Wall clock', 1256, 160, 100, 100, `
      <circle cx="1306" cy="210" r="46" fill="#f6efde" stroke="#3b6a72" stroke-width="7"/>
      ${[...Array(12)].map((_, i) => `<path d="M1306 170v6" stroke="#2b4a55" stroke-width="3" transform="rotate(${i * 30} 1306 210)" stroke-linecap="round"/>`).join('')}
      <path d="M1306 210V186" stroke="#2b4a55" stroke-width="5" stroke-linecap="round" transform="rotate(40 1306 210)"/>
      <path d="M1306 210V176" stroke="#2b4a55" stroke-width="3.500" stroke-linecap="round" transform="rotate(200 1306 210)"/>
      <g class="secondhand" style="transform-origin:1306px 210px"><path d="M1306 218V174" stroke="#e9573f" stroke-width="2" stroke-linecap="round"/></g>
      <circle cx="1306" cy="210" r="4" fill="#e9573f"/>
      <g class="twinkle" style="animation-delay:-2s"><path d="M1352 164l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff6c4"/></g>`, 50);
  }

  function board() {
    const step = (x, label, inner) => `<g>${R(x, 196, 64, 64, 12, '#fff', 'stroke="#7fa0a7" stroke-width="3"')}${inner}<text x="${x + 32}" y="282" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="800" fill="#2b4a55">${label}</text></g>`;
    return obj('board', 'Fly life-cycle board', 1700, 130, 290, 200, `
      ${R(1700, 130, 290, 200, 10, '#f4f8f6', 'stroke="#9fb4b8" stroke-width="7"')}${R(1712, 316, 266, 8, 2, '#c5d2d0')}
      <text x="1845" y="168" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17" font-weight="900" fill="#3b6a72" letter-spacing="1">FLY LIFE CYCLE</text>
      ${step(1714, 'EGG', '<ellipse cx="1746" cy="228" rx="9" ry="14" fill="#f4efd9" stroke="#bdb38e" stroke-width="2.500" transform="rotate(20 1746 228)"/>')}
      ${step(1784, 'LARVA', '<path d="M1802 232q10-16 24-6t14-6" stroke="#e8dcb0" stroke-width="14" stroke-linecap="round" fill="none"/>')}
      ${step(1854, 'PUPA', '<ellipse cx="1886" cy="228" rx="11" ry="19" fill="#b98c52" stroke="#7a5a32" stroke-width="3"/>')}
      ${step(1924, 'FLY', '<svg x="1928" y="198" width="56" height="60" viewBox="-245 -225 490 420">' + A.fly({ sex: 'f', det: 0 }) + '</svg>')}
      <path d="M1780 228h4M1850 228h4M1920 228h4" stroke="#e9573f" stroke-width="3" stroke-linecap="round"/>
      <g class="twinkle" style="animation-delay:-3s"><path d="M1968 146l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#e9b53a"/></g>`, 14);
  }

  function stereo() {
    return obj('stereo', 'Stereomicroscope', 2060, 300, 290, 310, `
      <ellipse cx="2200" cy="606" rx="120" ry="9" fill="#000" opacity=".3"/>
      <svg x="2070" y="312" width="260" height="303" viewBox="0 0 600 700" overflow="visible">${A.scopeInner('lab-').replace(/class="halo"/g, 'class="ph" style="display:none"')}</svg>`, 20);
  }

  function stool() {
    return `<g><ellipse cx="1040" cy="880" rx="62" ry="9" fill="#000" opacity=".3"/>
      ${R(1005, 706, 70, 14, 7, '#e9c46a', 'stroke="#a97a2a" stroke-width="3"')}${R(1036, 718, 8, 150, 3, '#9fb4b8')}<path d="M1040 840L1000 878M1040 840L1080 878" stroke="#9fb4b8" stroke-width="6" stroke-linecap="round"/></g>`;
  }

  A.labMain = function () {
    let doors = '';
    for (let x = 360; x < 2400; x += 200) doors += R(x + 6, 650, 188, 138, 8, '#26505e', 'stroke="#14323d" stroke-width="3"') + R(x + 84, 700, 32, 8, 4, '#cfdcdc');
    let floorTiles = '';
    return `
      ${R(0, 800, 2400, 100, 0, 'url(#g-floor)')}${R(0, 800, 2400, 100, 0, 'url(#p-floor)')}
      ${R(0, 796, 2400, 8, 0, '#0d222b', 'opacity=".6"')}
      ${R(350, 640, 2050, 156, 0, 'url(#g-front)')}${doors}
      ${R(340, 594, 2060, 16, 0, '#f4f8f4')}${R(340, 606, 2060, 36, 0, 'url(#g-top)', 'stroke="#7e968f" stroke-width="3"')}
      ${R(340, 640, 2060, 6, 0, '#0e262f', 'opacity=".5"')}
      <ellipse cx="2020" cy="600" rx="420" ry="90" fill="url(#g-warm)" class="warmpulse"/>
      <ellipse cx="760" cy="600" rx="380" ry="80" fill="url(#g-warm)" opacity=".6"/>
      ${cabinet()}${poster()}${computer()}${notebook()}${fruit()}${compound()}${vials()}${prep()}${lamp()}${clock()}${board()}${stereo()}${stool()}
      <text x="1200" y="640" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="800" letter-spacing="7" fill="#fff" opacity=".18">DROSIE'S SECRET FLY LAB</text>
    `;
  };

  A.labFore = function () {
    const leaf = (x, y, dx, h, c) => `<path d="M${x} ${y}C${x + dx * 0.2} ${y - h * 0.4} ${x + dx * 0.8} ${y - h * 0.7} ${x + dx} ${y - h}C${x + dx * 0.95 - 34} ${y - h * 0.5} ${x + 34} ${y - h * 0.25} ${x} ${y}Z" fill="${c}"/>`;
    const plant = (x, delay) => `<g class="sway" style="transform-origin:${x}px 900px;animation-delay:${delay}s;opacity:.95">${leaf(x, 900, -110, 300, '#18483a')}${leaf(x, 900, 120, 250, '#1f5a46')}${leaf(x, 900, 20, 340, '#2a7658')}${leaf(x, 900, -40, 200, '#215f4a')}</g>`;
    return plant(70, 0) + plant(2330, -2);
  };
})();
