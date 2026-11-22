/* fly.js: original vector artwork of Drosophila melanogaster (dorsal view, wings spread).
 *
 * Scientifically informed features that are drawn (not just labelled):
 *   - red compound eyes with a faceted (ommatidia) surface, three ocelli, antennae with a feathery arista
 *   - thorax with dark stripes and bristles, scutellum, halteres (balancers) behind the wings
 *   - two wings with veins, three pairs of legs
 *   - FEMALE: larger, longer and pointed abdomen, dark bands on every segment to the tip
 *   - MALE: slightly smaller, shorter and rounded abdomen, last segments solid dark, sex comb on the first tarsal segment of each front leg
 *
 * Coordinates: origin at the thorax/abdomen junction, head toward -y. Body about 340 units long.
 * 1 mm of real fly is about 136 art units (a fly is roughly 2.5 mm long; females are a little larger).
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});
  let U = 0;
  A.UNITS_PER_MM = 136;

  const WING = 'M0 0C28-40 120-50 205-32C238-22 244 22 208 40C140 62 48 40 0 0Z';
  const FEM_AB = 'M-30-8C-48 20-50 70-34 112C-24 138-8 152 0 160C8 152 24 138 34 112C50 70 48 20 30-8Z';
  const MALE_AB = 'M-30-8C-46 20-48 60-38 90C-30 112-14 122 0 122C14 122 30 112 38 90C48 60 46 20 30-8Z';
  const band = (y, th) => `M-60 ${y}Q0 ${y + 9} 60 ${y}L60 ${y + th}Q0 ${y + th + 9} -60 ${y + th}Z`;

  function legSet(male, id) {
    const seg = (d, w) => `<path d="${d}" stroke="#4a331f" stroke-width="${w + 2.2}"/><path d="${d}" stroke="url(#${id}-leg)" stroke-width="${w}"/>`;
    let comb = '';
    if (male) {
      // sex comb: ~10 thick black bristles in a row on the first tarsal segment (basitarsus) of the front leg
      for (let i = 0; i < 9; i++) {
        const t = (i + 0.5) / 9, x = 112 + 8 * t, y = -104 + 20 * t;
        comb += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(5.5).toFixed(1)} ${(-2.4).toFixed(1)}" stroke="#120b07" stroke-width="2.6" stroke-linecap="round"/>`;
      }
    }
    // bristles that appear when zoomed
    let bris = '';
    for (let i = 0; i < 7; i++) { const t = (i + 0.5) / 7; bris += `<path d="M${(74 + 38 * t).toFixed(1)} ${(-134 + 30 * t).toFixed(1)}l4 -4" /><path d="M${(36 + 56 * t).toFixed(1)} ${(-76 - 8 * t).toFixed(1)}l2 -5"/>`; }
    return `
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${seg('M34 -50L88 -28', 8)}${seg('M88 -28L124 26', 6)}${seg('M124 26L118 76', 3.8)}
        <path d="M118 76l-3 6M118 76l3 6" stroke="#2c1d11" stroke-width="2"/>
        ${seg('M36 -76L92 -84', 8)}${seg('M92 -84L134 -48', 6)}${seg('M134 -48L142 -6', 3.8)}
        <path d="M142 -6l-3 6M142 -6l3 6" stroke="#2c1d11" stroke-width="2"/>
        <g class="front-leg">
          ${seg('M28 -102L74 -134', 8)}${seg('M74 -134L112 -104', 6)}${seg('M112 -104L120 -84L124 -76L127 -69L130 -62L132 -55', 3.8)}
          <path d="M132 -55l3 6M132 -55l-2 6" stroke="#2c1d11" stroke-width="2"/>
          <g class="sexcomb">${comb}</g>
        </g>
        <g class="det" stroke="#3b2816" stroke-width="1.4">${bris}</g>
      </g>
      <g fill="#4a331f"><circle cx="74" cy="-134" r="4.2"/><circle cx="92" cy="-84" r="4.2"/><circle cx="88" cy="-28" r="4.2"/></g>`;
  }

  /** Returns SVG markup (a <g>) for a fly. Options: sex 'f'|'m', scale, wing (deg), dark (0.5-1), det (0-1 detail opacity) */
  A.fly = function (o) {
    o = o || {};
    const id = 'fl' + (U++), male = o.sex === 'm', s = o.scale || 1;
    const wing = o.wing == null ? 52 : o.wing;
    const dark = o.dark == null ? 1 : o.dark;
    const ab = male ? MALE_AB : FEM_AB;
    const bands = (male ? [6, 34, 60] : [6, 34, 60, 86, 112]).map((y) => `<path d="${band(y, male ? 11 : 13)}" fill="#3a281a" opacity="${male ? 0.92 : 0.95}"/>`).join('');
    const tip = male
      ? `<path d="M-60 84Q0 95 60 84L60 180L-60 180Z" fill="#1b110b" opacity="${dark}"/><path d="M-60 84Q0 95 60 84L60 92Q0 103 -60 92Z" fill="#1b110b" opacity="${dark * 0.5}"/>`
      : `<path d="M-8 150L0 166L8 150Z" fill="#8a6238"/><circle cx="-6" cy="136" r="2.600" fill="#2f2013"/><circle cx="6" cy="136" r="2.600" fill="#2f2013"/>`;
    let thoraxBris = '';
    for (let i = 0; i < 9; i++) { const y = -118 + i * 10; thoraxBris += `<path d="M${-44 + i * 0.6} ${y}l-7 -3M${44 - i * 0.6} ${y}l7 -3"/>`; }
    let abHairs = '';
    for (let i = 0; i < 12; i++) { const y = 10 + i * 10, w = male ? 40 : 42; abHairs += `<path d="M${-w} ${y}l-6 4M${w} ${y}l6 4"/>`; }
    const wingVeins = '<path d="M6-2C60-24 150-30 214-20M8 2C70-6 150 0 226 8M12 6C70 18 140 30 200 30M100-12C102 4 102 14 100 22M152-6C153 4 153 12 152 18" fill="none" stroke="#7d7d6c" stroke-width="1.7" stroke-linecap="round"/>';
    const wingMarkup = (mirror) => `
      <g transform="translate(${mirror ? -38 : 38} -104)${mirror ? ' scale(-1 1)' : ''} rotate(${wing})">
        <path d="${WING}" fill="url(#${id}-wing)" stroke="#8d9a93" stroke-width="2.200"/>
        ${wingVeins}
        <path d="M30 -18C80 -34 150 -34 200 -26" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
        <g class="det" stroke="#6f6f60" stroke-width=".9" opacity=".8"><path d="M20 -14l3 -5M40 -22l3 -5M60 -27l3 -5M80 -30l3 -5M100 -32l3 -5M120 -33l3 -5M140 -33l3 -5M160 -32l3 -5M180 -29l3 -5M200 -24l3 -5"/></g>
      </g>`;
    const antenna = (mirror) => `
      <g${mirror ? ' transform="scale(-1 1)"' : ''}>
        <ellipse cx="9" cy="-184" rx="5.500" ry="8" fill="#92693a" stroke="#4b3322" stroke-width="2"/>
        <path d="M13 -188C25 -203 43 -209 58 -199" fill="none" stroke="#5b422b" stroke-width="2.300" stroke-linecap="round"/>
        <g stroke="#6c5035" stroke-width="1.300" stroke-linecap="round"><path d="M22 -197l-3 -7M30 -201l-2 -8M38 -203l0 -8M46 -203l3 -7M53 -201l5 -6"/></g>
      </g>`;
    const eye = (mirror) => `
      <g${mirror ? ' transform="scale(-1 1)"' : ''}>
        <ellipse cx="28" cy="-153" rx="20.500" ry="28.500" transform="rotate(14 28 -153)" fill="url(#${id}-eye)" stroke="#6a1822" stroke-width="2.600"/>
        <ellipse cx="28" cy="-153" rx="20.500" ry="28.500" transform="rotate(14 28 -153)" fill="url(#${id}-om)" class="det"/>
        <ellipse cx="22" cy="-163" rx="6" ry="9" transform="rotate(14 22 -163)" fill="#fff" opacity=".42"/>
      </g>`;

    return `
    <g class="fly ${male ? 'male' : 'female'}" transform="scale(${s})" style="--det:${o.det == null ? 0.25 : o.det}">
      <defs>
        <radialGradient id="${id}-eye" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#e5424f"/><stop offset=".55" stop-color="#b3212e"/><stop offset="1" stop-color="#6b121c"/></radialGradient>
        <pattern id="${id}-om" width="6.400" height="5.600" patternUnits="userSpaceOnUse"><circle cx="1.600" cy="1.400" r="2" fill="#000" opacity=".26"/><circle cx="4.800" cy="4.200" r="2" fill="#000" opacity=".26"/><circle cx="1.600" cy="1.400" r=".8" fill="#fff" opacity=".35"/><circle cx="4.800" cy="4.200" r=".8" fill="#fff" opacity=".35"/></pattern>
        <radialGradient id="${id}-th" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#d4a566"/><stop offset=".6" stop-color="#b48748"/><stop offset="1" stop-color="#7d5a30"/></radialGradient>
        <radialGradient id="${id}-hd" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#d9b06f"/><stop offset="1" stop-color="#9a7240"/></radialGradient>
        <linearGradient id="${id}-ab" x1="0" x2="1"><stop offset="0" stop-color="#b98c52"/><stop offset=".35" stop-color="#e6c88f"/><stop offset=".65" stop-color="#d9b678"/><stop offset="1" stop-color="#a97c46"/></linearGradient>
        <linearGradient id="${id}-leg" x1="0" x2="1"><stop offset="0" stop-color="#b78c58"/><stop offset=".5" stop-color="#d4aa72"/><stop offset="1" stop-color="#a07645"/></linearGradient>
        <linearGradient id="${id}-wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef3ee" stop-opacity=".7"/><stop offset="1" stop-color="#c7d2cc" stop-opacity=".42"/></linearGradient>
        <clipPath id="${id}-clip"><path d="${ab}"/></clipPath>
        <filter id="${id}-sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <ellipse cx="9" cy="6" rx="62" ry="168" fill="#000" opacity=".22" filter="url(#${id}-sh)"/>

      <g class="reg" data-region="wings" tabindex="-1">${wingMarkup(false)}${wingMarkup(true)}</g>
      <g class="reg" data-region="legs">
        ${legSet(male, id)}
        <g transform="scale(-1 1)">${legSet(male, id)}</g>
      </g>
      <g class="reg" data-region="abdomen">
        <path d="${ab}" fill="url(#${id}-ab)" stroke="#6a4a2a" stroke-width="3.500"/>
        <g clip-path="url(#${id}-clip)">${bands}${tip}
          <path d="M-20 0Q-24 60 -16 120" stroke="#fff" stroke-opacity=".28" stroke-width="9" fill="none" stroke-linecap="round"/>
        </g>
        <g class="det" stroke="#4a331f" stroke-width="1.200" opacity=".8">${abHairs}</g>
        <path d="${ab}" fill="none" stroke="#4a331f" stroke-width="1" opacity=".5"/>
      </g>
      <g class="reg" data-region="thorax">
        <path d="M-46 -118C-52 -80-48 -30-28-6L28-6C48-30 52-80 46-118C30-134-30-134-46-118Z" fill="url(#${id}-th)" stroke="#5f4326" stroke-width="3.500"/>
        <path d="M-13 -122L-11 -30M13 -122L11 -30M0 -122L0 -20" stroke="#4a331f" stroke-opacity=".38" stroke-width="5.500" stroke-linecap="round"/>
        <path d="M-20 -12C-12 7 12 7 20 -12Z" fill="#9c7440" stroke="#5f4326" stroke-width="2.500"/>
        <g stroke="#2e2013" stroke-width="2" stroke-linecap="round" opacity=".85">${thoraxBris}</g>
        <path d="M-24 -112C-8 -126 10 -126 26 -112" stroke="#fff" stroke-opacity=".32" stroke-width="7" fill="none" stroke-linecap="round"/>
        <g stroke="#4a331f" stroke-width="2" fill="#7a5a32"><path d="M-44 -34L-62 -22"/><circle cx="-64" cy="-20" r="4.500"/><path d="M44 -34L62 -22"/><circle cx="64" cy="-20" r="4.500"/></g>
      </g>
      <g class="reg" data-region="head">
        <path d="M-38 -150C-38 -176-20 -186 0 -186C20 -186 38 -176 38 -150C38 -132 22 -122 0 -122C-22 -122-38 -132-38 -150Z" fill="url(#${id}-hd)" stroke="#5f4326" stroke-width="3"/>
        <path d="M-9 -184C-9 -198 9 -198 9 -184Z" fill="#c9a06a" stroke="#5f4326" stroke-width="2"/>
        <g fill="#5a3a1a"><circle cx="0" cy="-141" r="2.800"/><circle cx="-7" cy="-150" r="2.800"/><circle cx="7" cy="-150" r="2.800"/></g>
      </g>
      <g class="reg" data-region="eyes">${eye(false)}${eye(true)}</g>
      <g class="reg" data-region="antennae">${antenna(false)}${antenna(true)}<circle cx="24" cy="-196" r="26" fill="transparent"/><circle cx="-24" cy="-196" r="26" fill="transparent"/></g>
    </g>`;
  };

  /** Full <svg> wrapper. opts: all A.fly options plus view ("x y w h"), cls */
  A.flySVG = function (o) {
    o = o || {};
    return `<svg class="flysvg ${o.cls || ''}" viewBox="${o.view || '-245 -225 490 420'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || 'Fruit fly'}">${A.fly(o)}</svg>`;
  };

  /** Magnified front-leg tarsus. Male: sex comb (row of thick black bristles). Female: only fine bristles. */
  A.comb = function (sex, opts) {
    opts = opts || {};
    const male = sex === 'm', id = 'cb' + U++;
    let teeth = '';
    if (male) {
      for (let i = 0; i < 10; i++) {
        const x = 128 + i * 9.4;
        teeth += `<path d="M${x} -16 q${-1.5} -17 ${3.5} -30 q4 13 ${2.6} 30z" fill="#0e0805" stroke="#000" stroke-width="1"/>`;
      }
    } else {
      for (let i = 0; i < 9; i++) {
        const x = 124 + i * 10.5;
        teeth += `<path d="M${x} -17 q2 -9 5 -15" stroke="#6e4f2e" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      }
    }
    const fine = [...Array(14)].map((_, i) => `<path d="M${20 + i * 21} 16 l-4 9" stroke="#7a5a35" stroke-width="1.600" stroke-linecap="round"/>`).join('');
    const seg = (x, w, h, label) => `<rect x="${x}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="url(#${id}-s)" stroke="#5a3f26" stroke-width="3"/>`;
    return `<svg class="combsvg" viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${male ? 'Magnified male front leg with sex comb' : 'Magnified female front leg, no sex comb'}">
      <defs><linearGradient id="${id}-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2bd85"/><stop offset=".5" stop-color="#c79a5f"/><stop offset="1" stop-color="#9b7142"/></linearGradient>
      <radialGradient id="${id}-bg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#f3e7bd"/><stop offset="1" stop-color="#9aa97f"/></radialGradient></defs>
      <g transform="translate(18 120) rotate(14)">
        ${seg(0, 118, 46)}
        ${seg(112, 112, 40)}
        ${seg(220, 56, 32)}${seg(272, 40, 28)}${seg(308, 34, 25)}${seg(338, 46, 23)}
        <path d="M382 -6 q18 -4 24 8 M382 6 q18 10 22 24" stroke="#2c1d11" stroke-width="4" fill="none" stroke-linecap="round"/>
        <g>${teeth}</g>
        <g>${fine}</g>
        <path d="M10 -14 L108 -14" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>
        <path d="M120 -12 L212 -12" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>
        <text x="8" y="52" font-size="12" fill="#3a2a18" font-family="system-ui,sans-serif" opacity=".0">tibia</text>
      </g>
    </svg>`;
  };
})();
