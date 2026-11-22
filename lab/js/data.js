/* data.js: all game content in one place (missions, facts, parts, badges, cases).
 * Every science statement here is deliberately conservative and kid-level. See README "Science sources".
 */
(function () {
  'use strict';
  const DW = window.DW;

  DW.state = {
    mission: 0,
    discoveries: new Set(),
    items: new Set(),
    badges: new Set(),
    specimen: null,      // {sex:'f'|'m'} the fly the player placed under the microscope
    foundScope: false,
    scopeUnlocked: false,
    hintsUsed: 0,
  };

  DW.data = {};

  DW.data.missions = [
    { n: 1, title: 'Welcome to the Secret Lab', objs: ['Explore the lab', 'Find the stereomicroscope'] },
    { n: 2, title: 'Discover the Stereomicroscope', objs: ['Tap each microscope part'] },
    { n: 3, title: 'Prepare the Specimen', objs: ['Collect the fly vial', 'Put the flies on the pad', 'Place a fly on the stage'] },
    { n: 4, title: 'Master the Microscope', objs: ['Light on', 'Right amount of light', 'Find the focus', 'Make it sharp', 'Zoom in', 'Center the fly'] },
    { n: 5, title: 'Explore Fly Anatomy', objs: ['Head', 'Eyes', 'Antennae', 'Thorax', 'Wings', 'Legs', 'Abdomen'] },
    { n: 6, title: 'Male or Female?', objs: ['Tummy shape', 'Stripes', 'Dark tip', 'Sex comb', 'Size check'] },
    { n: 7, title: 'The Fly Detective Challenge', objs: ['Case 1', 'Case 2', 'Case 3', 'Case 4', 'Case 5', 'Case 6'] },
  ];

  /* Equipment collection */
  DW.data.items = {
    stereo: { name: 'Stereomicroscope', icon: 'scope', text: 'Shows tiny animals in 3D. Two eyepieces, one zoom dial, one focus knob.' },
    vial: { name: 'Fly vial', icon: 'vial', text: 'A small tube with fly food at the bottom. Flies live and grow here.' },
    pad: { name: 'Sleepy-fly pad', icon: 'pad', text: 'Flies rest gently on this pad so scientists can look at them closely.' },
    brush: { name: 'Soft brush', icon: 'brush', text: 'Scientists use a soft brush to move sleepy flies. No pinching!' },
    notebook: { name: 'Lab notebook', icon: 'note', text: 'Scientists write down what they see, so they can check it later.' },
    lens: { name: 'Detective lens', icon: 'lens', text: 'Lets you zoom in on clues on a mystery fly.' },
  };

  /* The six stereomicroscope parts tapped in Mission 2 */
  DW.data.parts = {
    eyepieces: { name: 'Eyepieces', icon: 'eye', text: 'Look through both. Two eyes make a 3D picture!' },
    zoom: { name: 'Zoom dial', icon: 'lens', text: 'Turn it to zoom in or out. This is the magnification.' },
    focus: { name: 'Focus knob', icon: 'target', text: 'Turn it to make the picture sharp. It moves the whole head up and down.' },
    objective: { name: 'Objective lens', icon: 'scope', text: 'The lens just above the fly. It collects the light from your fly.' },
    stage: { name: 'Stage', icon: 'pad', text: 'The platform where your fly rests.' },
    light: { name: 'Light', icon: 'sun', text: 'A switch turns the light on. The dial makes it brighter or dimmer.' },
  };
  DW.data.partOrder = ['eyepieces', 'zoom', 'focus', 'objective', 'stage', 'light'];

  /* Lab discoveries (tap objects in the lab). Each is one simple, true fact. */
  DW.data.discoveries = {
    poster: { title: 'Two wings!', text: 'A fruit fly has two wings. Tiny balance knobs called halteres sit behind them.', icon: 'fly' },
    computer: { title: 'FlyBase', text: 'Scientists share fruit fly facts in a big online library called FlyBase.', icon: 'note' },
    notebook: { title: 'Write it down', text: 'Scientists write down what they see so they can check it later.', icon: 'note' },
    fruit: { title: 'Fruit fly fans', text: 'Fruit flies are drawn to ripe, squishy fruit.', icon: 'sparkle' },
    clock: { title: 'Short lives', text: 'A fruit fly lives for weeks, not years. That makes it great for studying how life grows.', icon: 'sun' },
    board: { title: 'Fast growers', text: 'A fly grows from egg to adult in about 10 days when it is warm.', icon: 'sparkle' },
    vials: { title: 'Fly homes', text: 'Lab flies live in vials with yummy food at the bottom.', icon: 'vial' },
    cabinet: { title: 'Fly food', text: 'Fly food is a soft mix of things like yeast and sugar.', icon: 'flask' },
    compound: { title: 'Not this one!', text: 'A compound microscope looks at very thin slides. For a whole fly we use a stereomicroscope.', icon: 'scope' },
  };

  /* Anatomy: fly-local coordinates (see fly.js). cx,cy = centre of zoom, s = zoom factor */
  DW.data.regions = [
    { id: 'head', name: 'Head', cx: 0, cy: -152, s: 3.0, text: 'The head holds the eyes, the antennae and the mouth.' },
    { id: 'eyes', name: 'Compound eyes', cx: 28, cy: -153, s: 5.2, text: 'Each eye is made of about 800 tiny lenses. Wild flies have red eyes!' },
    { id: 'antennae', name: 'Antennae', cx: 30, cy: -194, s: 5.4, text: 'Antennae sense smells and sounds. The feathery part is called the arista.' },
    { id: 'thorax', name: 'Thorax', cx: 0, cy: -66, s: 2.5, text: 'The middle part. The wings and all six legs attach here.' },
    { id: 'wings', name: 'Wings', cx: 130, cy: -20, s: 2.1, text: 'Flies have two wings. Thin lines called veins make them strong.' },
    { id: 'legs', name: 'Legs', cx: 100, cy: -78, s: 2.5, text: 'Six legs, three on each side. Flies can even taste with their feet!' },
    { id: 'abdomen', name: 'Abdomen', cx: 0, cy: 72, s: 2.3, text: 'The back part. It has stripes and holds the tummy.' },
  ];

  /* Compare clues */
  DW.data.clues = [
    { id: 'shape', name: 'Tummy shape', f: 'Girl fly: longer tummy with a pointy end.', m: 'Boy fly: shorter, rounder tummy.', view: '-100 -20 200 200', ic: 'target' },
    { id: 'bands', name: 'Stripes', f: 'Girl fly: dark stripes go all the way to the tip.', m: 'Boy fly: stripes stop, then the end is solid dark.', view: '-100 -20 200 200', ic: 'sparkle' },
    { id: 'tip', name: 'Dark tip', f: 'Girl fly: the tip is striped like the rest.', m: 'Boy fly: the tip is dark and black.', view: '-80 40 160 140', ic: 'target' },
    { id: 'comb', name: 'Sex comb', f: 'Girl fly: front legs have no comb.', m: 'Boy fly: tiny dark combs on the front legs!', view: '60 -145 100 100', ic: 'lens' },
  ];

  /* Badges */
  DW.data.badges = [
    { id: 'explorer', name: 'Lab Explorer', text: 'Found 5 discoveries in the lab.', color: '#7df0cf', icon: 'pin' },
    { id: 'sharp', name: 'Sharp Eyes', text: 'Made a perfectly sharp picture.', color: '#8ec9ff', icon: 'eye' },
    { id: 'anatomist', name: 'Fly Anatomist', text: 'Explored all 7 body parts.', color: '#ffbd6b', icon: 'fly' },
    { id: 'comb', name: 'Comb Spotter', text: 'Found the sex comb.', color: '#c9a7ff', icon: 'lens' },
    { id: 'detective', name: 'Fly Detective', text: 'Solved the Fly Detective challenge.', color: '#ffd36b', icon: 'medal' },
    { id: 'scientist', name: 'Lab 1 Scientist', text: 'Finished Lab 1: Meet Your Fruit Fly.', color: '#ff8c7a', icon: 'star' },
  ];

  /* Detective cases. Built fresh each play. Tier 1 = clear clues, tier 3 = size is misleading. */
  DW.data.makeCases = function () {
    const r = DW.shuffle;
    const pair = (a, b) => r([a, b]);
    const t1 = pair({ sex: 'f', scale: 1.04, dark: 1, tier: 1 }, { sex: 'm', scale: 0.9, dark: 1, tier: 1 });
    const t2 = pair({ sex: 'f', scale: 0.98, dark: 0.85, tier: 2 }, { sex: 'm', scale: 0.96, dark: 0.82, tier: 2 });
    const t3 = pair({ sex: 'f', scale: 0.9, dark: 1, tier: 3 }, { sex: 'm', scale: 1.04, dark: 0.78, tier: 3 }); // small girl, big boy
    return t1.concat(t2, t3).map((c, i) => Object.assign({ id: i, wing: 44 + Math.floor(Math.random() * 20) }, c));
  };
  DW.data.caseHints = [
    'Look at the end of the tummy. Round and dark, or pointy and striped?',
    'Check the front legs. Do you see a tiny dark comb?',
    'Count the stripes. Do they go all the way to the tip?',
  ];

  /* Short script lines */
  DW.data.T = {
    welcome: [
      'Welcome to the Secret Fly Lab! I am Dr. Maya.',
      'This is where scientists meet fruit flies. Look around and see what you can find!',
    ],
  };
})();
