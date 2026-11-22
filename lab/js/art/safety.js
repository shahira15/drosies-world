/* safety.js (art): original vector artwork for Lab 0, the Safety Academy.
 *   A.kid(opts)   a friendly child scientist, front view, with poses and wearable layers (PPE and distractors)
 *   A.gear(id)    standalone 120x120 icons for each piece of gear
 *   A.sfDefs()    shared gradients (inserted once into the page)
 * All shapes are original; nothing is traced from other artwork.
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});
  let U = 0;

  const sh = (hex, amt) => {
    let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const n = parseInt(c, 16), f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + ((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
  };
  A.sh = sh;

  const POSES = {
    stand: { lh: [-46, -98], rh: [46, -98], ll: -17, rl: 17, ly: 0, ry: 0 },
    walk: { lh: [-38, -112], rh: [44, -88], ll: -25, rl: 21, ly: -5, ry: 0 },
    run: { lh: [-54, -134], rh: [56, -84], ll: -36, rl: 28, ly: -28, ry: 0 },
    point: { lh: [-44, -98], rh: [88, -198], ll: -17, rl: 17, ly: 0, ry: 0 },
    wave: { lh: [-44, -98], rh: [64, -232], ll: -17, rl: 17, ly: 0, ry: 0 },
    hands: { lh: [-30, -140], rh: [30, -140], ll: -17, rl: 17, ly: 0, ry: 0 },
    reach: { lh: [-44, -98], rh: [82, -148], ll: -17, rl: 17, ly: 0, ry: 0 },
    mouth: { lh: [-44, -98], rh: [16, -190], ll: -17, rl: 17, ly: 0, ry: 0 },
    hold: { lh: [-26, -150], rh: [26, -150], ll: -17, rl: 17, ly: 0, ry: 0 },
    stop: { lh: [-44, -98], rh: [58, -170], ll: -17, rl: 17, ly: 0, ry: 0 },
  };

  /** opts: skin hair shirt pants pose hairStyle(long|tied|short) face(smile|oh|worried|think) wear{coat,goggles,sunglasses,gloves,shoes:'closed'|'sandals',scarf,headphones,cardigan} scale */
  A.kid = function (o) {
    o = Object.assign({ skin: '#c98660', hair: '#2b1a14', shirt: '#4fa3c7', pants: '#35507a', pose: 'stand', hairStyle: 'long', face: 'smile', wear: {}, scale: 1 }, o || {});
    const w = o.wear || {}, p = POSES[o.pose] || POSES.stand;
    const skin = o.skin, skinD = sh(skin, -34), hair = o.hair, hairL = sh(hair, 30);
    const coat = !!w.coat, card = !!w.cardigan;
    const slv = coat ? '#f7fafa' : card ? '#c27a54' : o.shirt;
    const slvS = coat ? '#aac4c9' : card ? '#8c4f33' : sh(o.shirt, -42);
    const sw = card ? 30 : coat ? 22 : 19;
    const hip = [[-14, -100], [14, -100]];
    const foot = [[p.ll, -9 + (p.ly || 0)], [p.rl, -9 + (p.ry || 0)]];
    const pantsD = sh(o.pants, -40);
    let legs = '', shoes = '';
    for (let i = 0; i < 2; i++) {
      legs += `<path d="M${hip[i][0]} ${hip[i][1]}L${foot[i][0]} ${foot[i][1]}" stroke="${pantsD}" stroke-width="30" stroke-linecap="round"/><path d="M${hip[i][0]} ${hip[i][1]}L${foot[i][0]} ${foot[i][1]}" stroke="${o.pants}" stroke-width="24" stroke-linecap="round"/>`;
      const fx = foot[i][0] + (i ? 4 : -4), fy = foot[i][1] + 10, f = i ? 1 : -1;
      if (w.shoes === 'closed') {
        shoes += `<g transform="translate(${fx} ${fy}) scale(${i ? 1 : -1} 1)"><path d="M-14 4C-14-12-5-18 6-16C16-14 25-7 25 4C25 11 21 13 15 13H-11C-14 13-14 9-14 4Z" fill="#f4f8f9" stroke="#7c97a3" stroke-width="3"/><path d="M-14 8H25" stroke="#3f86b4" stroke-width="6" stroke-linecap="round"/><path d="M12 -9Q20-4 22 2" stroke="#d4e2e8" stroke-width="3" fill="none"/><path d="M-4 -8l6 5M2 -12l6 5" stroke="#7c97a3" stroke-width="2"/></g>`;
      } else if (w.shoes === 'sandals') {
        shoes += `<g transform="translate(${fx} ${fy})"><rect x="-20" y="6" width="42" height="7" rx="3.500" fill="#9b6b3e" stroke="#6e4a26" stroke-width="2"/><ellipse cx="1" cy="2" rx="19" ry="7" fill="${skin}" stroke="${skinD}" stroke-width="2"/>${[-14, -7, 0, 7, 14].map((x) => `<circle cx="${x + 2}" cy="-1" r="3.200" fill="${skin}" stroke="${skinD}" stroke-width="1.500"/>`).join('')}<path d="M-10 4Q2-9 14 4" stroke="#d9534f" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
      } else {
        shoes += `<g transform="translate(${fx} ${fy})"><ellipse cx="0" cy="3" rx="17" ry="10" fill="#f3f6f6" stroke="#b8c6cb" stroke-width="3"/><path d="M-12 -2h24" stroke="#d96b6b" stroke-width="3"/></g>`;
      }
    }

    const torso = `<path d="M-33 -168Q0 -178 33 -168L37 -100Q0 -90 -37 -100Z" fill="${o.shirt}" stroke="${sh(o.shirt, -42)}" stroke-width="3" stroke-linejoin="round"/><path d="M-14 -174Q0 -160 14 -174" fill="none" stroke="${sh(o.shirt, -42)}" stroke-width="3"/>`;
    const coatLayer = coat ? `<path d="M-41 -170Q0 -182 41 -170L48 -50Q0 -38 -48 -50Z" fill="#f7fafa" stroke="#aac4c9" stroke-width="3" stroke-linejoin="round"/><path d="M-16 -176L0 -128L16 -176" fill="#e6f0f1" stroke="#aac4c9" stroke-width="3"/><path d="M0 -128V-44" stroke="#aac4c9" stroke-width="3"/><circle cx="0" cy="-108" r="3" fill="#8fb0b6"/><circle cx="0" cy="-84" r="3" fill="#8fb0b6"/><rect x="-36" y="-88" width="20" height="17" rx="3" fill="none" stroke="#aac4c9" stroke-width="2.500"/><rect x="16" y="-88" width="20" height="17" rx="3" fill="none" stroke="#aac4c9" stroke-width="2.500"/>` : '';
    const cardLayer = card ? `<path d="M-42 -170Q0 -184 42 -170L50 -70Q0 -58 -50 -70Z" fill="#c27a54" stroke="#8c4f33" stroke-width="3"/><path d="M0 -176V-62" stroke="#8c4f33" stroke-width="3"/><path d="M-30 -150h22M-30 -132h22M8 -150h22M8 -132h22M-30 -114h22M8 -114h22" stroke="#a9643f" stroke-width="2.500"/>` : '';

    let arms = '', hands = '';
    for (let i = 0; i < 2; i++) {
      const side = i ? 1 : -1, S = [side * 31, -164], H = i ? p.rh : p.lh;
      const E = [(S[0] + H[0]) / 2 + side * 9, (S[1] + H[1]) / 2 + 12];
      const d = `M${S[0]} ${S[1]}L${E[0]} ${E[1]}L${H[0]} ${H[1]}`;
      arms += `<path d="${d}" fill="none" stroke="${slvS}" stroke-width="${sw + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${slv}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (card) arms += `<g transform="translate(${H[0]} ${H[1]})"><path d="M-17 -2Q-20 26 -14 34M-6 2Q-6 30 0 38M5 2Q8 28 14 34" stroke="#8c4f33" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
      if (w.gloves) hands += `<g transform="translate(${H[0]} ${H[1]})"><circle r="13.500" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><path d="M-6 -5l4 6M0 -7l2 7M6 -4l-2 6" stroke="#8ccdf3" stroke-width="2.500" stroke-linecap="round"/></g>`;
      else hands += `<circle cx="${H[0]}" cy="${H[1]}" r="10.500" fill="${skin}" stroke="${skinD}" stroke-width="3"/>`;
    }

    const scarf = w.scarf ? `<path d="M-27 -178Q0 -158 27 -178L32 -164Q0 -144 -32 -164Z" fill="#e0525d" stroke="#a63a42" stroke-width="3"/><path d="M10 -158L24 -96L8 -90L-2 -150Z" fill="#e0525d" stroke="#a63a42" stroke-width="3"/><path d="M12 -134l12 -3M10 -118l13 -3" stroke="#ffd7d1" stroke-width="3"/><path d="M8 -90l-2 8M15 -92l-1 8M22 -95l0 8" stroke="#a63a42" stroke-width="2.500"/>` : '';

    const neck = `<rect x="-9" y="-186" width="18" height="16" rx="6" fill="${skinD}"/>`;
    const hs = o.hairStyle;
    const hairBack = hs === 'long' ? `<path d="M-41 -222C-52 -176-54 -146-38 -124L38 -124C54 -146 52 -176 41 -222Z" fill="${hair}"/>` : '';
    const pony = hs === 'tied' ? `<path d="M22 -250C46 -262 64 -240 56 -212C52 -196 46 -188 40 -192C46 -206 44 -228 22 -240Z" fill="${hair}" stroke="${sh(hair, -20)}" stroke-width="2"/><path d="M30 -246Q46 -240 50 -222" stroke="${hairL}" stroke-width="3" fill="none"/>` : '';
    const band = hs === 'tied' ? `<rect x="18" y="-250" width="12" height="9" rx="4" transform="rotate(-14 24 -245)" fill="#ff8c7a" stroke="#d9584a" stroke-width="2"/>` : '';
    const head = `<circle cx="-37" cy="-212" r="8" fill="${skin}" stroke="${skinD}" stroke-width="2.500"/><circle cx="37" cy="-212" r="8" fill="${skin}" stroke="${skinD}" stroke-width="2.500"/><circle cx="0" cy="-214" r="37" fill="${skin}" stroke="${skinD}" stroke-width="3"/>`;
    const fringe = hs === 'short'
      ? `<path d="M-38 -216C-42 -256 42 -258 38 -216C30 -236 12 -242 -4 -238C-20 -234-34 -228-38 -216Z" fill="${hair}"/>`
      : `<path d="M-39 -218C-44 -260 44 -262 39 -218C30 -238 8 -246 -6 -240C-22 -236-34 -230-39 -218Z" fill="${hair}"/>` +
        (hs === 'long' ? `<path d="M-39 -218C-46 -186-46 -160-40 -138L-30 -140C-34 -164-34 -190-30 -222ZM39 -218C46 -186 46 -160 40 -138L30 -140C34 -164 34 -190 30 -222Z" fill="${hair}"/>` : '');
    const hl = `<path d="M-18 -244Q0 -252 18 -244" stroke="${hairL}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;

    const f = o.face;
    const eyes = `<ellipse cx="-14" cy="-214" rx="5.200" ry="6.800" fill="#2b1a14"/><ellipse cx="14" cy="-214" rx="5.200" ry="6.800" fill="#2b1a14"/><circle cx="-12.500" cy="-216.500" r="1.900" fill="#fff"/><circle cx="15.500" cy="-216.500" r="1.900" fill="#fff"/>`;
    const brows = f === 'worried' ? `<path d="M-22 -228l14 -4M22 -228l-14 -4" stroke="#2b1a14" stroke-width="3" stroke-linecap="round"/>` : f === 'think' ? `<path d="M-22 -229l14 -3M8 -234l14 4" stroke="#2b1a14" stroke-width="3" stroke-linecap="round"/>` : `<path d="M-21 -229Q-14 -233 -7 -230M7 -230Q14 -233 21 -229" stroke="#2b1a14" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const mouth = f === 'oh' ? `<ellipse cx="0" cy="-193" rx="5" ry="6.500" fill="#8a2f3b"/>` : f === 'worried' ? `<path d="M-8 -192Q0 -198 8 -192" stroke="#8a2f3b" stroke-width="3.500" fill="none" stroke-linecap="round"/>` : `<path d="M-10 -195Q0 -185 10 -195" stroke="#8a2f3b" stroke-width="3.500" fill="none" stroke-linecap="round"/>`;
    const cheeks = `<circle cx="-24" cy="-198" r="6" fill="#e8907a" opacity=".4"/><circle cx="24" cy="-198" r="6" fill="#e8907a" opacity=".4"/><path d="M-2 -207Q0 -202 3 -205" stroke="${skinD}" stroke-width="2.500" fill="none" stroke-linecap="round"/>`;
    const face = eyes + brows + cheeks + mouth;

    const gog = w.goggles ? `<rect x="-44" y="-224" width="88" height="10" rx="5" fill="#2f6f8a"/><path d="M-32 -232H-6Q2 -232 2 -224V-206Q2 -196 -8 -196H-26Q-36 -196 -36 -206V-224Q-36 -232 -32 -232Z" fill="rgba(190,238,250,.5)" stroke="#1f9a92" stroke-width="5"/><path d="M32 -232H6Q-2 -232 -2 -224V-206Q-2 -196 8 -196H26Q36 -196 36 -206V-224Q36 -232 32 -232Z" fill="rgba(190,238,250,.5)" stroke="#1f9a92" stroke-width="5"/><path d="M-28 -226Q-22 -229 -14 -228M10 -226Q16 -229 24 -228" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="-31" cy="-231" r="1.500" fill="#1f9a92"/><circle cx="31" cy="-231" r="1.500" fill="#1f9a92"/>` : '';
    const sun = w.sunglasses ? `<path d="M-40 -222L-33 -224M40 -222L33 -224" stroke="#1b1b22" stroke-width="4" stroke-linecap="round"/><path d="M-33 -226H-5Q0 -226 0 -219V-212Q0 -202 -9 -202H-24Q-33 -202 -33 -212Z" fill="#1b1b22" stroke="#444" stroke-width="2.500"/><path d="M33 -226H5Q0 -226 0 -219V-212Q0 -202 9 -202H24Q33 -202 33 -212Z" fill="#1b1b22" stroke="#444" stroke-width="2.500"/><path d="M-26 -222l10 0" stroke="#7a7aa0" stroke-width="2.500" stroke-linecap="round"/>` : '';
    const hp = w.headphones ? `<path d="M-40 -224C-42 -276 42 -276 40 -224" fill="none" stroke="#3d4650" stroke-width="8" stroke-linecap="round"/><rect x="-50" y="-232" width="15" height="34" rx="7" fill="#e0525d" stroke="#a63a42" stroke-width="3"/><rect x="35" y="-232" width="15" height="34" rx="7" fill="#e0525d" stroke="#a63a42" stroke-width="3"/>` : '';

    return `<g class="kid" transform="scale(${o.scale})">
      <ellipse cx="0" cy="2" rx="46" ry="7" fill="#000" opacity=".22"/>
      ${hairBack}${legs}${shoes}${torso}${coatLayer}${cardLayer}${arms}${hands}${scarf}${neck}${pony}${head}${fringe}${hl}${band}${face}${sun}${gog}${hp}
    </g>`;
  };

  A.kidSVG = function (o, view) {
    return `<svg class="kidsvg" viewBox="${view || '-115 -290 230 310'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student">${A.kid(o)}</svg>`;
  };

  /* ---------- gear icons ---------- */
  const G = {
    coat: `<path d="M40 16L60 30L80 16L106 28L114 64L98 70L94 56V106Q60 114 26 106V56L22 70L6 64L14 28Z" fill="#f7fafa" stroke="#8fb0b6" stroke-width="3" stroke-linejoin="round"/><path d="M40 16L60 54L80 16" fill="#e4eef0" stroke="#8fb0b6" stroke-width="3" stroke-linejoin="round"/><path d="M60 54V108" stroke="#b3cacd" stroke-width="3"/><circle cx="60" cy="70" r="2.800" fill="#8fb0b6"/><circle cx="60" cy="88" r="2.800" fill="#8fb0b6"/><rect x="30" y="80" width="19" height="16" rx="3" fill="none" stroke="#b3cacd" stroke-width="3"/><rect x="71" y="80" width="19" height="16" rx="3" fill="none" stroke="#b3cacd" stroke-width="3"/><path d="M14 44L22 58M106 44L98 58" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>`,
    goggles: `<rect x="4" y="52" width="112" height="14" rx="7" fill="#2f6f8a"/><path d="M12 54Q12 38 28 38H48Q62 38 62 52V68Q62 84 46 84H28Q12 84 12 68Z" fill="rgba(180,232,248,.6)" stroke="#1f9a92" stroke-width="6"/><path d="M108 54Q108 38 92 38H72Q58 38 58 52V68Q58 84 74 84H92Q108 84 108 68Z" fill="rgba(180,232,248,.6)" stroke="#1f9a92" stroke-width="6"/><path d="M22 52Q28 46 40 46M78 52Q84 46 96 46" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="24" cy="39" r="2.200" fill="#0f6e68"/><circle cx="96" cy="39" r="2.200" fill="#0f6e68"/><circle cx="44" cy="39" r="2.200" fill="#0f6e68"/><circle cx="76" cy="39" r="2.200" fill="#0f6e68"/>`,
    gloves: (() => { const g = '<rect x="26" y="52" width="40" height="42" rx="13" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="27" y="20" width="10" height="42" rx="5" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="38" y="13" width="10" height="48" rx="5" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="49" y="17" width="10" height="44" rx="5" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="60" y="26" width="9" height="36" rx="4.500" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="14" y="56" width="26" height="11" rx="5.500" transform="rotate(34 24 62)" fill="#5fb7ea" stroke="#2e7fae" stroke-width="3"/><rect x="24" y="90" width="44" height="16" rx="5" fill="#8ccdf3" stroke="#2e7fae" stroke-width="3"/><path d="M34 60h26" stroke="#b5e2f9" stroke-width="4" stroke-linecap="round"/>'; return `<g transform="translate(-2 4) scale(.62)">${g}</g><g transform="translate(122 4) scale(-.62 .62)">${g}</g>`; })(),
    shoes: `<path d="M12 80Q12 56 30 54L46 48Q58 44 66 52Q82 66 104 70Q116 72 116 84V94H12Z" fill="#f4f8f9" stroke="#7c97a3" stroke-width="3" stroke-linejoin="round"/><path d="M84 66Q106 70 116 82V94H90Z" fill="#dce8ec" stroke="#7c97a3" stroke-width="2"/><path d="M10 92H118V100Q118 106 110 106H18Q10 106 10 100Z" fill="#3f86b4" stroke="#27648a" stroke-width="3"/><path d="M50 52l7 7M58 50l8 8M66 54l7 7" stroke="#7c97a3" stroke-width="3" stroke-linecap="round"/><path d="M14 78Q22 70 30 74" stroke="#ff8c7a" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    hairtie: `<ellipse cx="60" cy="62" rx="40" ry="32" fill="none" stroke="#d9584a" stroke-width="26"/><ellipse cx="60" cy="62" rx="40" ry="32" fill="none" stroke="#ff8c7a" stroke-width="20"/><path d="M26 44Q40 28 62 28M84 34Q98 42 100 56" stroke="#ffd0c8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M24 70Q28 86 44 92M70 94Q92 90 98 74" stroke="#d9584a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`,
    sandals: `<path d="M18 92Q10 62 30 48Q46 40 60 52Q70 72 86 80Q110 86 106 98Q98 106 70 106H32Q18 106 18 92Z" fill="#b07d4a" stroke="#6e4a26" stroke-width="3" stroke-linejoin="round"/><path d="M42 52Q54 72 70 82" stroke="#e9573f" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M42 52Q36 68 34 86" stroke="#e9573f" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="42" cy="52" r="6" fill="#c0392b" stroke="#8a2b21" stroke-width="2"/>`,
    scarf: `<path d="M12 36Q60 18 108 36L110 56Q60 40 10 56Z" fill="#e0525d" stroke="#a63a42" stroke-width="3" stroke-linejoin="round"/><path d="M68 50L100 108L78 114L54 52Z" fill="#e0525d" stroke="#a63a42" stroke-width="3" stroke-linejoin="round"/><path d="M82 82L96 78M76 94L90 90" stroke="#ffd7d1" stroke-width="4" stroke-linecap="round"/><path d="M78 114l-2 6M86 111l-1 6M94 109l0 6" stroke="#a63a42" stroke-width="3" stroke-linecap="round"/>`,
    sunglasses: `<path d="M6 48L16 50M114 48L104 50" stroke="#2a2a32" stroke-width="6" stroke-linecap="round"/><path d="M14 46H54Q62 46 62 54V64Q62 80 46 80H30Q14 80 14 64Z" fill="#1b1b22" stroke="#444" stroke-width="4"/><path d="M106 46H66Q58 46 58 54V64Q58 80 74 80H90Q106 80 106 64Z" fill="#1b1b22" stroke="#444" stroke-width="4"/><path d="M58 54Q60 50 62 54" stroke="#444" stroke-width="5" fill="none"/><path d="M22 56L40 56M70 56L88 56" stroke="#7a7aa0" stroke-width="4" stroke-linecap="round"/>`,
    headphones: `<path d="M20 70C16 20 104 20 100 70" fill="none" stroke="#3d4650" stroke-width="10" stroke-linecap="round"/><rect x="8" y="58" width="26" height="46" rx="12" fill="#e0525d" stroke="#a63a42" stroke-width="4"/><rect x="86" y="58" width="26" height="46" rx="12" fill="#e0525d" stroke="#a63a42" stroke-width="4"/><rect x="14" y="68" width="8" height="26" rx="4" fill="#ffb3a8"/><rect x="98" y="68" width="8" height="26" rx="4" fill="#ffb3a8"/>`,
    cardigan: `<path d="M38 16L60 28L82 16L112 38L118 104L102 108L99 58L96 108Q60 116 24 108L21 58L18 108L2 104L8 38Z" fill="#c27a54" stroke="#8c4f33" stroke-width="3" stroke-linejoin="round"/><path d="M60 28V110" stroke="#8c4f33" stroke-width="3"/><path d="M30 50h20M30 64h20M70 50h20M70 64h20M30 78h20M70 78h20" stroke="#a9643f" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="50" r="3" fill="#6e3a22"/><circle cx="60" cy="70" r="3" fill="#6e3a22"/><path d="M4 104l-1 8M10 106l0 8M17 107l1 8M101 107l-1 8M108 106l0 8M115 104l1 8" stroke="#8c4f33" stroke-width="3" stroke-linecap="round"/>`,
    soap: `<rect x="34" y="52" width="48" height="56" rx="12" fill="#8fd6d0" stroke="#3a9a92" stroke-width="3"/><rect x="42" y="68" width="32" height="22" rx="4" fill="#fff" opacity=".9"/><path d="M46 76h24M46 83h16" stroke="#3a9a92" stroke-width="3" stroke-linecap="round"/><path d="M58 52V32H80Q90 32 90 40" fill="none" stroke="#3a9a92" stroke-width="8" stroke-linecap="round"/><rect x="48" y="44" width="20" height="10" rx="3" fill="#3a9a92"/><circle cx="98" cy="64" r="7" fill="rgba(255,255,255,.6)" stroke="#8fd6d0" stroke-width="2"/><circle cx="108" cy="48" r="5" fill="rgba(255,255,255,.6)" stroke="#8fd6d0" stroke-width="2"/><circle cx="20" cy="56" r="6" fill="rgba(255,255,255,.6)" stroke="#8fd6d0" stroke-width="2"/>`,
  };
  A.gear = function (id, size) {
    const s = size ? ` width="${size}" height="${size}"` : '';
    return `<svg class="gearsvg" viewBox="0 0 120 120"${s} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${G[id] || ''}</svg>`;
  };
  A.gearIds = Object.keys(G);
})();
