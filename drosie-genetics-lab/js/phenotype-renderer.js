/**
 * Phenotype renderer: original dorsal-view SVG illustrations of D. melanogaster adults.
 * Sexual dimorphism drawn: females larger with a pointed, banded abdomen (ovipositor);
 * males smaller with a rounded abdomen whose last segments are fully pigmented, and sex
 * combs on the first tarsal segment of the forelegs.
 */
let uid = 0;

const BODY = {
  wild:        { thorax: '#a8773f', thoraxHi: '#d4a466', abd: '#c99a5b', band: '#5b3a1d', leg: '#6b4a2a', vein: '#7a5a3a', shine: 0.25 },
  yellow:      { thorax: '#d6b155', thoraxHi: '#f1d88c', abd: '#e8cb7a', band: '#b08440', leg: '#b08a4a', vein: '#b89a5a', shine: 0.3 },
  black:       { thorax: '#463628', thoraxHi: '#6f5a44', abd: '#56412f', band: '#20160f', leg: '#2d2118', vein: '#3a2a1e', shine: 0.2 },
  ebony:       { thorax: '#251c16', thoraxHi: '#4f4136', abd: '#2e241c', band: '#0e0905', leg: '#1a120c', vein: '#2a1e15', shine: 0.45 },
  'yellow-dark': { thorax: '#6b5532', thoraxHi: '#93784b', abd: '#7a6340', band: '#3a2a16', leg: '#4a3a22', vein: '#5a4a2a', shine: 0.3 }
};

export function flySVG(traits, { size = 160, title = '', className = '', showLabel = false } = {}) {
  const id = `fly${++uid}`;
  const c = BODY[traits.body] || BODY.wild;
  const male = traits.sex === 'M';
  const eyeRed = traits.eye !== 'white';
  const stub = traits.bristles === 'stubble';
  const t = title ? `<title>${esc(title)}</title>` : '';
  const defs = `
  <defs>
    <radialGradient id="${id}eye" cx="40%" cy="35%" r="70%">
      ${eyeRed ? '<stop offset="0" stop-color="#ff6b5e"/><stop offset=".55" stop-color="#c3201f"/><stop offset="1" stop-color="#6e0d10"/>'
               : '<stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece7dc"/><stop offset="1" stop-color="#b9b2a4"/>'}
    </radialGradient>
    <pattern id="${id}omm" width="3.2" height="2.8" patternUnits="userSpaceOnUse">
      <circle cx="1.6" cy="1.4" r="0.95" fill="${eyeRed ? '#ffffff' : '#8c8578'}" opacity="${eyeRed ? 0.16 : 0.25}"/>
    </pattern>
    <radialGradient id="${id}th" cx="45%" cy="35%" r="75%">
      <stop offset="0" stop-color="${c.thoraxHi}"/><stop offset="1" stop-color="${c.thorax}"/>
    </radialGradient>
    <linearGradient id="${id}wing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef6ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe0f2" stop-opacity=".28"/>
    </linearGradient>
    <linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b8f0ff" stop-opacity=".35"/><stop offset=".5" stop-color="#ffd6f6" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

  // Legs: three pairs, jointed
  const legs = [
    { y: 92, a: -38, l: [26, 22, 18] }, { y: 103, a: 10, l: [30, 26, 20] }, { y: 114, a: 40, l: [32, 28, 22] }
  ].map((g, i) => [-1, 1].map(s => {
    const x0 = 100 + s * 14, y0 = g.y;
    const rad = d => (d * Math.PI) / 180;
    const a1 = rad(s > 0 ? g.a : 180 - g.a);
    const x1 = x0 + Math.cos(a1) * g.l[0], y1 = y0 + Math.sin(a1) * g.l[0];
    const a2 = a1 + s * rad(i === 0 ? -35 : 25);
    const x2 = x1 + Math.cos(a2) * g.l[1], y2 = y1 + Math.sin(a2) * g.l[1];
    const a3 = a2 + s * rad(i === 0 ? -20 : 15);
    const x3 = x2 + Math.cos(a3) * g.l[2], y3 = y2 + Math.sin(a3) * g.l[2];
    const comb = male && i === 0 ? `<line x1="${x2}" y1="${y2}" x2="${x2 + Math.cos(a3) * 6}" y2="${y2 + Math.sin(a3) * 6}" stroke="#0b0705" stroke-width="3.2" stroke-linecap="round"/>` : '';
    return `<path d="M${x0} ${y0} L${x1} ${y1} L${x2} ${y2} L${x3} ${y3}" fill="none" stroke="${c.leg}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${comb}`;
  }).join('')).join('');

  // Abdomen
  const abd = male
    ? { cy: 150, rx: 25, ry: 36, path: 'M75 128 C72 160 82 186 100 190 C118 186 128 160 125 128 C118 118 82 118 75 128 Z' }
    : { cy: 158, rx: 30, ry: 50, path: 'M71 128 C66 168 82 204 100 214 C118 204 134 168 129 128 C120 117 80 117 71 128 Z' };
  const bandsN = male ? 4 : 6;
  let bands = '';
  for (let i = 0; i < bandsN; i++) {
    const top = 128 + ((abd === null ? 0 : (male ? 58 : 82)) * i) / bandsN;
    const h = male ? 14.5 : 13.7;
    const full = male && i >= bandsN - 2;
    bands += `<rect x="60" y="${top + (full ? 0 : h * 0.55)}" width="80" height="${full ? h + 1 : h * 0.45}" fill="${c.band}" opacity="${full ? 0.95 : 0.85}"/>`;
  }
  const abdomen = `
    <clipPath id="${id}abd"><path d="${abd.path}"/></clipPath>
    <path d="${abd.path}" fill="${c.abd}"/>
    <g clip-path="url(#${id}abd)">${bands}<ellipse cx="90" cy="${abd.cy - 10}" rx="8" ry="${abd.ry * 0.6}" fill="#fff" opacity="${c.shine * 0.6}"/></g>
    <path d="${abd.path}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`;

  // Wings
  const wing = side => {
    const s = side;
    if (traits.wings === 'vestigial') {
      return `<path d="M${100 + s * 12} 104 q${s * 18} 0 ${s * 24} 14 q${s * -2} 8 ${s * -10} 5 q${s * 5} 8 ${s * -5} 11 q${s * -8} -4 ${s * -10} -10 q${s * -4} -8 ${s * 1} -20 z"
        fill="#d3e0ee" fill-opacity=".95" stroke="#6f86a0" stroke-width="1.5"/>
        <path d="M${100 + s * 12} 108 q${s * 6} 4 ${s * 8} 10" stroke="${c.vein}" stroke-width=".8" fill="none" opacity=".6"/>`;
    }
    const curly = traits.wings === 'curly';
    const len = curly ? 72 : 112, w = curly ? 30 : 34, tipX = 100 + s * (curly ? 40 : 34), tipY = 100 + len;
    const d = `M${100 + s * 9} 100 C${100 + s * (w + 12)} 112 ${tipX + s * 18} ${tipY - 34} ${tipX} ${tipY}
               C${tipX - s * 12} ${tipY + 6} ${100 + s * 10} ${tipY - 20} ${100 + s * 4} 112 Z`;
    const veins = [0.35, 0.55, 0.75].map(f => `<path d="M${100 + s * 9} 102 Q${100 + s * (w * f + 10)} ${100 + len * 0.5} ${tipX - s * (1 - f) * 16} ${tipY - (1 - f) * 10}" fill="none" stroke="${c.vein}" stroke-width=".9" opacity=".55"/>`).join('');
    const cross = `<path d="M${100 + s * 18} ${100 + len * 0.45} l${s * 12} 6" stroke="${c.vein}" stroke-width=".8" opacity=".5"/>`;
    const curl = curly ? `<path d="M${tipX - s * 2} ${tipY - 2} c${s * 14} -6 ${s * 14} -24 ${s * 0} -26 c${s * -10} 0 ${s * -14} 10 ${s * -6} 18" fill="url(#${id}wing)" stroke="${c.vein}" stroke-width="1.1" opacity=".9"/>
      <path d="M${tipX - s * 6} ${tipY - 14} q${s * 8} -4 ${s * 10} 2" stroke="#fff" stroke-width="1" opacity=".5" fill="none"/>` : '';
    return `<path d="${d}" fill="url(#${id}wing)" stroke="${c.vein}" stroke-width="1" stroke-opacity=".65"/>
            <path d="${d}" fill="url(#${id}sheen)"/>${veins}${cross}${curl}`;
  };
  const halteres = traits.wings === 'vestigial'
    ? `<circle cx="84" cy="122" r="2" fill="${c.thoraxHi}"/><circle cx="116" cy="122" r="2" fill="${c.thoraxHi}"/>`
    : `<g fill="${c.thoraxHi}" stroke="${c.leg}" stroke-width=".6"><line x1="86" y1="118" x2="80" y2="124" stroke="${c.leg}"/><circle cx="79" cy="125" r="3"/><line x1="114" y1="118" x2="120" y2="124" stroke="${c.leg}"/><circle cx="121" cy="125" r="3"/></g>`;

  // Thorax & bristles
  const bl = stub ? 5.5 : 14, bw = stub ? 2.6 : 1.3;
  const bristlePts = [[88, 86, -20], [112, 86, 20], [90, 100, -15], [110, 100, 15], [93, 112, -10], [107, 112, 10], [92, 128, -25], [108, 128, 25]];
  const bristles = bristlePts.map(([x, y, a]) => {
    const r = ((a + 180) * Math.PI) / 180 * -1;
    const dx = Math.sin((a * Math.PI) / 180) * bl, dy = Math.cos((a * Math.PI) / 180) * bl;
    void r;
    return `<line x1="${x}" y1="${y}" x2="${x + dx * 0.6}" y2="${y + dy}" stroke="#1a120b" stroke-width="${bw}" stroke-linecap="round"/>`;
  }).join('');
  const thorax = `
    <ellipse cx="100" cy="102" rx="27" ry="29" fill="url(#${id}th)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
    <path d="M86 122 Q100 138 114 122 Z" fill="${c.thorax}" stroke="rgba(0,0,0,.3)" stroke-width=".8"/>
    <ellipse cx="94" cy="92" rx="7" ry="12" fill="#fff" opacity="${c.shine}"/>
    <path d="M100 76 L100 122" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`;

  // Head
  const head = `
    <ellipse cx="100" cy="64" rx="23" ry="15" fill="url(#${id}th)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
    <g>
      <ellipse cx="81" cy="61" rx="11.5" ry="14" fill="url(#${id}eye)" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>
      <ellipse cx="81" cy="61" rx="11.5" ry="14" fill="url(#${id}omm)"/>
      <ellipse cx="119" cy="61" rx="11.5" ry="14" fill="url(#${id}eye)" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>
      <ellipse cx="119" cy="61" rx="11.5" ry="14" fill="url(#${id}omm)"/>
      <ellipse cx="78" cy="55" rx="3" ry="4" fill="#fff" opacity=".55"/><ellipse cx="116" cy="55" rx="3" ry="4" fill="#fff" opacity=".55"/>
    </g>
    <g fill="#f3d27a" opacity=".85"><circle cx="100" cy="58" r="1.5"/><circle cx="97" cy="62" r="1.3"/><circle cx="103" cy="62" r="1.3"/></g>
    <g stroke="${c.leg}" stroke-width="1.6" stroke-linecap="round" fill="${c.thoraxHi}">
      <path d="M95 50 q-3 -6 -6 -8" fill="none"/><path d="M105 50 q3 -6 6 -8" fill="none"/>
      <ellipse cx="94" cy="49" rx="2.6" ry="3.4"/><ellipse cx="106" cy="49" rx="2.6" ry="3.4"/>
      <path d="M89 42 q-5 -6 -4 -14 M88 37 l-4 -1 M87 33 l-4 0 M106 0" fill="none" stroke-width=".9"/>
      <path d="M111 42 q5 -6 4 -14 M112 37 l4 -1 M113 33 l4 0" fill="none" stroke-width=".9"/>
    </g>`;

  const svg = `<svg class="fly-svg ${className}" viewBox="0 0 200 232" width="${size}" height="${size * 1.16}" role="img" aria-label="${esc(title || describe(traits))}" xmlns="http://www.w3.org/2000/svg">${t}${defs}
    <ellipse cx="100" cy="${male ? 196 : 220}" rx="${male ? 48 : 56}" ry="7" fill="#000" opacity=".18"/>
    <g class="fly-legs">${legs}</g>
    ${abdomen}
    <g class="fly-wings">${wing(-1)}${wing(1)}</g>
    ${halteres}${thorax}${bristles}${head}
  </svg>`;
  return showLabel ? `<figure class="fly-fig">${svg}<figcaption>${esc(describe(traits))}</figcaption></figure>` : svg;
}

export function describe(t) {
  const sex = t.sex === 'M' ? 'male' : 'female';
  const bits = [];
  if (t.eye === 'white') bits.push('white eyes'); else bits.push('red eyes');
  bits.push({ wild: 'tan body', yellow: 'yellow body', black: 'black body', ebony: 'ebony body', 'yellow-dark': 'dark mixed body' }[t.body]);
  bits.push({ normal: 'normal wings', vestigial: 'vestigial wings', curly: 'Curly wings' }[t.wings]);
  if (t.bristles === 'stubble') bits.push('Stubble bristles');
  return `${sex} fly: ${bits.join(', ')}`;
}

/** Small colour chip used in tables/charts; carries text so colour is never the only cue. */
export function traitSwatch(t) {
  const c = BODY[t.body] || BODY.wild;
  return `<span class="swatch" aria-hidden="true"><i style="background:${t.eye === 'white' ? '#efe9dc' : '#c3201f'}"></i><i style="background:${c.abd}"></i></span>`;
}

export function sexSymbol(s) { return s === 'M' ? '♂' : '♀'; }

function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }
