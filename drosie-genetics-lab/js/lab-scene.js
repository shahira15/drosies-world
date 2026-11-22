/**
 * Illustrated laboratory scene (original SVG artwork) with 8 interactive stations,
 * Dr. Maya and Drosie.
 */
export const STATIONS = [
  { id: 'stocks', name: 'Fly Stock Center', short: 'Stocks', blurb: 'Choose parent flies from the stock collection.' },
  { id: 'breeding', name: 'Breeding Station', short: 'Breed', blurb: 'Mate a female and a male and raise their offspring.' },
  { id: 'microscope', name: 'Genetics Microscope', short: 'Microscope', blurb: 'Examine flies up close and score their traits.' },
  { id: 'punnett', name: 'Punnett Square Workbench', short: 'Punnett', blurb: 'Predict offspring from gametes.' },
  { id: 'chromosomes', name: 'Chromosome Explorer', short: 'Chromosomes', blurb: 'See genes on chromosomes, meiosis and crossing over.' },
  { id: 'analysis', name: 'Data Analysis Computer', short: 'Data', blurb: 'Graph results and run chi-square tests.' },
  { id: 'notebook', name: 'Research Notebook', short: 'Notebook', blurb: 'Record your investigations and export reports.' },
  { id: 'missions', name: 'Genetics Challenge Board', short: 'Missions', blurb: 'Research missions for every level.' }
];

function hot(id, label, inner) {
  return `<g class="station" data-station="${id}" tabindex="0" role="button" aria-label="${label}">
    ${inner}
    <g class="station-label"><rect rx="14" ry="14" height="30" fill="rgba(8,20,32,.82)" stroke="rgba(255,214,120,.6)"/><text>${label}</text></g>
  </g>`;
}

export function drMayaSVG(size = 120, mood = 'smile') {
  return `<svg viewBox="0 0 120 150" width="${size}" height="${size * 1.25}" aria-hidden="true">${mayaBody(mood)}</svg>`;
}

function mayaBody(mood = 'smile') {
  const mouth = mood === 'wow' ? '<ellipse cx="60" cy="66" rx="5" ry="6" fill="#7a2d2d"/>' : '<path d="M51 63 Q60 71 69 63" stroke="#7a2d2d" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  return `
    <path d="M18 150 C18 110 32 92 60 92 C88 92 102 110 102 150 Z" fill="#f4f7fb" stroke="#c9d3df" stroke-width="1.5"/>
    <path d="M48 94 L60 120 L72 94" fill="#2f7f8c"/>
    <path d="M44 96 L54 132 L60 120 Z M76 96 L66 132 L60 120 Z" fill="#e3e9f1"/>
    <rect x="70" y="112" width="14" height="18" rx="2" fill="#dfe6ee" stroke="#b9c4d1"/>
    <line x1="74" y1="110" x2="74" y2="120" stroke="#e04f4f" stroke-width="2"/><line x1="79" y1="110" x2="79" y2="120" stroke="#2c6fd6" stroke-width="2"/>
    <rect x="53" y="78" width="14" height="16" fill="#8d5a3c"/>
    <ellipse cx="60" cy="54" rx="26" ry="29" fill="#9a6444"/>
    <path d="M32 50 C30 22 50 14 62 16 C80 17 92 30 88 52 C84 38 74 30 60 32 C48 33 38 40 32 50 Z" fill="#1c1512"/>
    <circle cx="60" cy="14" r="11" fill="#1c1512"/>
    <ellipse cx="33" cy="56" rx="4" ry="6" fill="#8d5a3c"/><ellipse cx="87" cy="56" rx="4" ry="6" fill="#8d5a3c"/>
    <g fill="none" stroke="#2a2a3a" stroke-width="2.2"><circle cx="49" cy="52" r="8"/><circle cx="71" cy="52" r="8"/><path d="M57 52 h6"/></g>
    <circle cx="49" cy="53" r="2.6" fill="#1a1a1a"/><circle cx="71" cy="53" r="2.6" fill="#1a1a1a"/>
    <path d="M42 41 q7 -4 13 0 M65 41 q7 -4 13 0" stroke="#1c1512" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${mouth}
    <ellipse cx="43" cy="62" rx="4" ry="2.4" fill="#d9776b" opacity=".45"/><ellipse cx="77" cy="62" rx="4" ry="2.4" fill="#d9776b" opacity=".45"/>`;
}

export function drosieSVG(size = 70) {
  return `<svg viewBox="0 0 100 90" width="${size}" height="${size * 0.9}" aria-hidden="true">${drosieBody()}</svg>`;
}
function drosieBody() {
  return `
    <g class="drosie-wings">
      <ellipse cx="30" cy="30" rx="24" ry="13" transform="rotate(-25 30 30)" fill="#dff1ff" fill-opacity=".75" stroke="#9cc3e4"/>
      <ellipse cx="70" cy="30" rx="24" ry="13" transform="rotate(25 70 30)" fill="#dff1ff" fill-opacity=".75" stroke="#9cc3e4"/>
    </g>
    <ellipse cx="50" cy="62" rx="15" ry="19" fill="#d9a35a"/>
    <path d="M37 60 h26 M36 67 h28 M38 74 h24" stroke="#6b4220" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="50" cy="44" rx="15" ry="11" fill="#b8803f"/>
    <circle cx="50" cy="30" r="14" fill="#c48a48"/>
    <circle cx="38" cy="28" r="10" fill="#d42b2b"/><circle cx="62" cy="28" r="10" fill="#d42b2b"/>
    <circle cx="35" cy="25" r="3.4" fill="#fff"/><circle cx="59" cy="25" r="3.4" fill="#fff"/>
    <circle cx="40" cy="30" r="2" fill="#5a0a0a"/><circle cx="64" cy="30" r="2" fill="#5a0a0a"/>
    <path d="M44 38 q6 5 12 0" stroke="#5a3214" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M45 17 q-4 -9 -10 -10 M55 17 q4 -9 10 -10" stroke="#5a3214" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

export function labSceneSVG() {
  const vial = (x, y, fill = '#e3c07d', plug = '#f2efe6', bugs = 2) => `
    <g transform="translate(${x} ${y})"><rect x="0" y="0" width="16" height="44" rx="5" fill="rgba(220,240,255,.22)" stroke="rgba(220,240,255,.5)"/>
    <rect x="1.5" y="28" width="13" height="14" rx="4" fill="${fill}"/><rect x="-1" y="-6" width="18" height="10" rx="3" fill="${plug}"/>
    ${Array.from({ length: bugs }, (_, i) => `<circle cx="${5 + i * 6}" cy="${14 + (i % 2) * 7}" r="1.6" fill="#3a2714"/>`).join('')}</g>`;
  const shelfRow = (y, colors) => colors.map((c, i) => vial(70 + i * 26, y, c, '#f2efe6', 1 + (i % 3))).join('');

  return `<svg id="lab-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Drosie Genetics Laboratory. Choose a station." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173a54"/><stop offset=".7" stop-color="#10283b"/><stop offset="1" stop-color="#0d1f2e"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3346"/><stop offset="1" stop-color="#0b1621"/></linearGradient>
    <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf1"/><stop offset="1" stop-color="#b8c3cd"/></linearGradient>
    <linearGradient id="cabinet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fa1b1"/><stop offset=".5" stop-color="#c7d3dd"/><stop offset="1" stop-color="#8395a6"/></linearGradient>
    <radialGradient id="lamp" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".45"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowWarm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9e3d" stop-opacity=".2"/></radialGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3550"/><stop offset="1" stop-color="#082234"/></linearGradient>
    <pattern id="tiles" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="none"/><path d="M0 0 H80 M0 0 V80" stroke="rgba(255,255,255,.035)" stroke-width="2"/></pattern>
    <pattern id="cork" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#b07a45"/><circle cx="3" cy="4" r="1.2" fill="#9a6535"/><circle cx="9" cy="9" r="1" fill="#c48d56"/></pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".35"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#wall)"/>
  <rect width="1600" height="720" fill="url(#tiles)"/>
  <!-- window -->
  <g transform="translate(560 60)" opacity=".95">
    <rect width="0" height="0"/>
  </g>
  <!-- DNA helix wall art -->
  <g opacity=".12" stroke="#9fe3ff" stroke-width="3" fill="none">
    <path d="M30 40 C 90 90, 90 140, 30 190 S 90 290, 30 340"/><path d="M90 40 C 30 90, 30 140, 90 190 S 30 290, 90 340"/>
  </g>
  <!-- lamps -->
  ${[420, 1020].map(x => `<g><line x1="${x}" y1="0" x2="${x}" y2="40" stroke="#5b6f80" stroke-width="3"/><path d="M${x - 40} 62 Q${x} 26 ${x + 40} 62 Z" fill="#2c4256"/><ellipse cx="${x}" cy="62" rx="40" ry="6" fill="#ffe7a8"/><path d="M${x - 40} 64 L${x - 260} 760 L${x + 260} 760 L${x + 40} 64 Z" fill="url(#lamp)"/></g>`).join('')}
  <!-- floor -->
  <rect y="760" width="1600" height="140" fill="url(#floor)"/>
  <path d="M0 760 H1600" stroke="rgba(255,255,255,.08)" stroke-width="3"/>

  ${hot('stocks', 'Fly Stock Center', `
    <g filter="url(#soft)">
      <rect x="40" y="180" width="270" height="580" rx="10" fill="#5b4632"/>
      <rect x="52" y="192" width="246" height="556" rx="6" fill="#3b2c1f"/>
      ${[240, 350, 460, 570].map((y, r) => `<rect x="52" y="${y + 52}" width="246" height="10" fill="#7a5c3e"/>${shelfRow(y, ['#e3c07d', '#e8c98a', '#d9b06a', '#e3c07d', '#efd59b', '#dcb876', '#e3c07d', '#e8c98a', '#d9b06a'].slice(0, 9))}`).join('')}
      <rect x="62" y="672" width="226" height="64" rx="6" fill="#2a1f16"/>
      <text x="175" y="712" text-anchor="middle" font-size="19" font-weight="800" fill="#ffd27a" letter-spacing="2">FLY STOCKS</text>
    </g>`)}

  ${hot('breeding', 'Breeding Station', `
    <g filter="url(#soft)">
      <rect x="340" y="300" width="210" height="460" rx="16" fill="url(#cabinet)"/>
      <rect x="358" y="356" width="174" height="300" rx="10" fill="#0e2232" stroke="#6d8296" stroke-width="3"/>
      <rect x="362" y="360" width="166" height="292" rx="8" fill="url(#glowWarm)" opacity=".35" class="incubator-glow"/>
      ${[390, 480, 570].map(y => [380, 412, 444, 476, 508].map(x => vial(x - 6, y, '#e3c07d', '#f2efe6', 2)).join('')).join('')}
      <rect x="372" y="316" width="96" height="28" rx="6" fill="#06131d"/><text x="420" y="336" text-anchor="middle" font-family="monospace" font-size="17" fill="#6ef0a5">25.0°C</text>
      <circle cx="510" cy="330" r="9" fill="#6ef0a5" class="blink"/>
      <rect x="522" y="470" width="8" height="70" rx="4" fill="#5a6c7c"/>
      <rect x="350" y="676" width="190" height="70" rx="10" fill="#7b8e9f"/>
      <text x="445" y="718" text-anchor="middle" font-size="16" font-weight="800" fill="#0d1f2e" letter-spacing="1.5">INCUBATOR</text>
    </g>`)}

  <!-- lab bench -->
  <g filter="url(#soft)"><rect x="590" y="640" width="990" height="34" rx="6" fill="url(#bench)"/><rect x="610" y="674" width="950" height="90" fill="#455a6c"/>
    ${[640, 860, 1080, 1300].map(x => `<rect x="${x}" y="690" width="200" height="60" rx="6" fill="#53697c" stroke="#3a4d5e"/><rect x="${x + 85}" y="712" width="30" height="6" rx="3" fill="#9fb1c1"/>`).join('')}
  </g>

  ${hot('punnett', 'Punnett Square Workbench', `
    <g filter="url(#soft)">
      <rect x="600" y="110" width="320" height="240" rx="10" fill="#7a5532"/>
      <rect x="614" y="124" width="292" height="212" rx="6" fill="#1f3d33"/>
      <g stroke="#e9f2ec" stroke-width="3" fill="none" opacity=".9" stroke-linecap="round">
        <rect x="700" y="170" width="160" height="140"/><line x1="780" y1="170" x2="780" y2="310"/><line x1="700" y1="240" x2="860" y2="240"/>
      </g>
      <g fill="#e9f2ec" font-family="'Comic Sans MS', 'Chalkboard', cursive" font-size="22" text-anchor="middle">
        <text x="740" y="160">e</text><text x="820" y="160">+</text><text x="680" y="212">e</text><text x="680" y="282">+</text>
        <text x="740" y="212" font-size="18">e/e</text><text x="820" y="212" font-size="18">+/e</text><text x="740" y="282" font-size="18">+/e</text><text x="820" y="282" font-size="18">+/+</text>
      </g>
      <text x="650" y="150" fill="#ffe08a" font-size="16" font-family="cursive">♀♂</text>
      <rect x="640" y="336" width="60" height="8" rx="3" fill="#f3f3f3"/>
    </g>`)}

  ${hot('chromosomes', 'Chromosome Explorer', `
    <g filter="url(#soft)">
      <rect x="950" y="100" width="290" height="250" rx="14" fill="#22313e"/>
      <rect x="964" y="114" width="262" height="200" rx="8" fill="url(#screen)"/>
      <g class="chromo-glow">
        <rect x="990" y="140" width="22" height="150" rx="11" fill="#ff8a7a"/><rect x="1018" y="140" width="22" height="150" rx="11" fill="#ff8a7a" opacity=".85"/>
        <rect x="1060" y="150" width="22" height="130" rx="11" fill="#7ad7ff"/><rect x="1088" y="150" width="22" height="130" rx="11" fill="#7ad7ff" opacity=".85"/>
        <rect x="1130" y="150" width="22" height="134" rx="11" fill="#a6f08a"/><rect x="1158" y="150" width="22" height="134" rx="11" fill="#a6f08a" opacity=".85"/>
        <circle cx="1200" cy="270" r="8" fill="#ffd36e"/><circle cx="1214" cy="270" r="8" fill="#ffd36e" opacity=".85"/>
        ${[[990, 200], [1060, 210], [1130, 230], [1088, 180]].map(([x, y]) => `<rect x="${x}" y="${y}" width="${x === 1088 ? 22 : 50}" height="6" fill="#ffffff" opacity=".85"/>`).join('')}
      </g>
      <text x="1095" y="336" text-anchor="middle" font-size="15" font-weight="800" fill="#9fe3ff" letter-spacing="1.5">CHROMOSOMES</text>
    </g>`)}

  ${hot('missions', 'Genetics Challenge Board', `
    <g filter="url(#soft)">
      <rect x="1270" y="100" width="290" height="250" rx="10" fill="#6a4524"/>
      <rect x="1282" y="112" width="266" height="226" rx="6" fill="url(#cork)"/>
      ${[[1300, 130, '#fff6b0', -4], [1388, 126, '#bdf0ff', 3], [1468, 134, '#ffd1e0', -2], [1306, 220, '#d4ffc8', 2], [1396, 222, '#fff6b0', -3], [1474, 226, '#bdf0ff', 4]].map(([x, y, c, r], i) => `
        <g transform="rotate(${r} ${x + 35} ${y + 40})"><rect x="${x}" y="${y}" width="70" height="78" rx="3" fill="${c}"/><circle cx="${x + 35}" cy="${y + 6}" r="5" fill="#d33"/>
        <path d="M${x + 10} ${y + 26} h50 M${x + 10} ${y + 38} h40 M${x + 10} ${y + 50} h46" stroke="#5a5a5a" stroke-width="3" opacity=".5"/><text x="${x + 54}" y="${y + 72}" font-size="14" fill="#1a7a3a">${i < 2 ? '✓' : ''}</text></g>`).join('')}
    </g>`)}

  ${hot('microscope', 'Genetics Microscope', `
    <g filter="url(#soft)">
      <ellipse cx="740" cy="640" rx="90" ry="12" fill="rgba(0,0,0,.25)"/>
      <rect x="670" y="608" width="140" height="32" rx="8" fill="#e8ecef"/>
      <rect x="700" y="590" width="80" height="22" rx="5" fill="#cfd6dc"/>
      <path d="M770 600 L790 470 L812 470 L800 600 Z" fill="#d9dfe4"/>
      <rect x="700" y="520" width="100" height="48" rx="12" fill="#f4f6f8" stroke="#b8c2cb" stroke-width="2"/>
      <circle cx="730" cy="580" r="11" fill="#30434f"/>
      <rect x="712" y="470" width="80" height="54" rx="10" fill="#e9edf0" stroke="#b8c2cb" stroke-width="2"/>
      <path d="M718 474 L700 420 L720 414 L736 470 Z M770 470 L776 414 L798 418 L788 474 Z" fill="#2e3d48"/>
      <rect x="690" y="406" width="36" height="16" rx="5" fill="#16232c" transform="rotate(-12 708 414)"/><rect x="772" y="406" width="36" height="16" rx="5" fill="#16232c" transform="rotate(10 790 414)"/>
      <circle cx="812" cy="540" r="12" fill="#9aa8b4"/><circle cx="812" cy="540" r="5" fill="#53636f"/>
      <ellipse cx="750" cy="604" rx="18" ry="4" fill="#fff6c9" opacity=".9" class="blink-slow"/>
    </g>`)}

  ${hot('notebook', 'Research Notebook', `
    <g filter="url(#soft)">
      <path d="M900 640 L1000 628 L1100 640 L1100 650 L900 650 Z" fill="#2f5d7c"/>
      <path d="M906 638 Q950 612 998 626 L998 646 Q950 632 906 646 Z" fill="#fbf6e8"/>
      <path d="M1094 638 Q1050 612 1002 626 L1002 646 Q1050 632 1094 646 Z" fill="#fffaf0"/>
      ${[0, 1, 2].map(i => `<path d="M${918} ${632 - i * 4} Q950 ${620 - i * 4} 988 ${628 - i * 3}" stroke="#9cb3c6" stroke-width="1.5" fill="none"/><path d="M${1012} ${628 - i * 3} Q1050 ${620 - i * 4} ${1082} ${632 - i * 4}" stroke="#9cb3c6" stroke-width="1.5" fill="none"/>`).join('')}
      <rect x="1060" y="596" width="6" height="44" rx="2" fill="#e0a92b" transform="rotate(28 1063 618)"/>
    </g>`)}

  ${hot('analysis', 'Data Analysis Computer', `
    <g filter="url(#soft)">
      <rect x="1290" y="424" width="250" height="170" rx="12" fill="#1b2732"/>
      <rect x="1302" y="436" width="226" height="138" rx="6" fill="url(#screen)"/>
      ${[[1324, 70], [1352, 48], [1380, 110], [1408, 88], [1436, 30], [1464, 62], [1492, 20]].map(([x, h], i) => `<rect x="${x}" y="${556 - h}" width="18" height="${h}" fill="${i % 2 ? '#ffb84d' : '#58d6ff'}" rx="2" class="bar-anim" style="animation-delay:${i * 0.15}s"/>`).join('')}
      <path d="M1314 470 L1520 470" stroke="#ffffff" stroke-dasharray="4 4" opacity=".4"/>
      <text x="1316" y="456" font-family="monospace" font-size="12" fill="#9fe3ff">χ² = 1.33  p = 0.25</text>
      <rect x="1395" y="594" width="40" height="34" fill="#2b3946"/><rect x="1360" y="626" width="110" height="12" rx="4" fill="#2b3946"/>
      <rect x="1180" y="626" width="140" height="12" rx="4" fill="#2b3946"/>
    </g>`)}

  <!-- Dr. Maya behind the bench -->
  <g id="maya-in-scene" transform="translate(1110 432) scale(1.65)" class="maya-idle">${mayaBody()}</g>
  <rect x="1090" y="640" width="210" height="34" rx="4" fill="url(#bench)"/>
  <!-- Drosie flying -->
  <g id="drosie-fly"><g class="drosie-path">${drosieBody()}</g></g>
</svg>`;
}
