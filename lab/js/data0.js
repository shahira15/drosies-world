/* data0.js: all Lab 0 (Safety Academy) content: missions, badges, journal entries, questions, scenarios.
 * Edit text here. Nothing in this file is code that runs; it is data only.
 * Science notes and references are listed in README.md ("Safety accuracy").
 */
(function () {
  'use strict';
  const DW = window.DW;
  const D0 = (DW.data0 = {});

  D0.missions = [
    { n: 1, tag: 'LAB 0 · MISSION 1 OF 7', id: 'suit', title: 'Suit Up', short: 'Choose the right gear', icon: 'coat', objs: ['Choose your gear', 'Check you are ready'], mins: 4,
      lo: 'Identify common lab PPE and everyday-wear choices that are not appropriate in a lab.' },
    { n: 2, tag: 'LAB 0 · MISSION 2 OF 7', id: 'protect', title: 'Protection Lab', short: 'See how gear helps', icon: 'goggles', objs: ['Explore 5 stations'], mins: 8,
      lo: 'Describe how goggles, lab coats, gloves, closed shoes and tied-back hair help, and their limits.' },
    { n: 3, tag: 'LAB 0 · MISSION 3 OF 7', id: 'hazard', title: 'Spot the Hazard', short: 'Find what is not safe', icon: 'alert', objs: ['Find every hazard'], mins: 8,
      lo: 'Recognise common lab hazards and choose a safe response (step away, tell an adult).' },
    { n: 4, tag: 'LAB 0 · MISSION 4 OF 7', id: 'gear', title: 'Gear for the Job', short: 'Plan gear for each task', icon: 'clipboard', objs: ['Plan each task'], mins: 8,
      lo: 'Match PPE to the task and hazard; explain that PPE alone does not make a hazardous task safe.' },
    { n: 5, tag: 'LAB 0 · MISSION 5 OF 7', id: 'rules', title: 'Safety Control Room', short: 'Sort safe and unsafe', icon: 'shield', objs: ['Sort the safety cards'], mins: 5,
      lo: 'Sort safe and unsafe lab behaviours and explain why.' },
    { n: 6, tag: 'LAB 0 · MISSION 6 OF 7', id: 'emergency', title: 'Emergency Response', short: 'Practise calm responses', icon: 'siren', objs: ['Help in 4 situations'], mins: 8,
      lo: 'Rehearse calm first responses: unknown spill, eye splash, broken glass, fire alarm.' },
    { n: 7, tag: 'LAB 0 · MISSION 7 OF 7', id: 'challenge', title: 'Safety Scientist Challenge', short: 'Show what you know', icon: 'medal', objs: ['Answer the challenge'], mins: 6,
      lo: 'Apply what was learned across PPE, hazards and emergency responses.' },
  ];

  D0.badges = [
    { id: 'suited', lab: 0, name: 'Suited Up', text: 'Chose the right gear for the job.', color: '#8ec9ff', icon: 'coat' },
    { id: 'ppe', lab: 0, name: 'PPE Explorer', text: 'Explored how each piece of gear helps.', color: '#7df0cf', icon: 'goggles' },
    { id: 'hazard', lab: 0, name: 'Hazard Detective', text: 'Spotted hazards and chose safe responses.', color: '#ffbd6b', icon: 'alert' },
    { id: 'planner', lab: 0, name: 'Gear Planner', text: 'Matched gear to each job.', color: '#c9a7ff', icon: 'clipboard' },
    { id: 'rules', lab: 0, name: 'Safety Rules Champion', text: 'Sorted safe and unsafe actions.', color: '#ffd36b', icon: 'shield' },
    { id: 'emergency', lab: 0, name: 'Emergency Helper', text: 'Practised calm emergency responses.', color: '#ff8c7a', icon: 'siren' },
    { id: 'safety', lab: 0, name: 'Safety Scientist', text: 'Finished the Safety Scientist Challenge.', color: '#7df0cf', icon: 'star' },
  ];

  /* Safety Journal entries: unlocked as you play */
  D0.journal = {
    'ppe-job': { icon: 'clipboard', title: 'Gear depends on the job', text: 'PPE means personal protective equipment. The right gear depends on the job and the hazard. Not every job needs every piece.' },
    coat: { icon: 'coat', title: 'Lab coat', text: 'A lab coat helps keep splashes off your clothes and skin. It does not make you safe from everything. For a big spill, step away and tell a teacher.' },
    goggles: { icon: 'goggles', title: 'Goggles', text: 'Splash goggles protect your eyes from splashes. Regular glasses and sunglasses are not made for that.' },
    gloves: { icon: 'glove', title: 'Gloves', text: 'Gloves protect hands from some messy jobs. Different gloves are for different jobs. Take them off by peeling from the wrist, then wash your hands.' },
    shoes: { icon: 'boot', title: 'Closed-toe shoes', text: 'Closed shoes cover your whole foot, so drips and dropped things are less likely to reach your skin.' },
    hair: { icon: 'user', title: 'Tied-back hair', text: 'Long hair can dip into your work or get close to heat. Tie it back before you start.' },
    'hz-food': { icon: 'drop', title: 'No food in the lab', text: 'Food and drinks stay out of the lab so nothing gets on them. Never eat or drink where experiments happen.' },
    'hz-bottle': { icon: 'flask', title: 'Unlabeled containers', text: 'If a container has no label, do not touch it or sniff it. Step away and tell an adult.' },
    'hz-hair': { icon: 'flame', title: 'Hair and heat', text: 'Keep long hair tied back and stay away from heat sources. Only an adult runs the heater.' },
    'hz-spill': { icon: 'drop', title: 'Spills', text: 'You do not clean up spills. Step away, warn others and tell an adult.' },
    'hz-glass': { icon: 'alert', title: 'Broken glass', text: 'Never pick up broken glass. Stay clear, warn others and tell an adult.' },
    'hz-exit': { icon: 'exit', title: 'Clear exits', text: 'Exits and walkways stay clear so everyone can leave quickly if needed. Tell an adult if something blocks the way.' },
    'hz-shoes': { icon: 'boot', title: 'Shoes in the lab', text: 'Open shoes like sandals leave toes uncovered. Closed-toe shoes are the lab rule.' },
    'hz-run': { icon: 'walk', title: 'Walk in the lab', text: 'We walk in the lab. Running can knock things over or make you slip.' },
    'plan-hazard': { icon: 'alert', title: 'Look at the hazard first', text: 'Before you choose gear, ask: what could go wrong in this job? Splash? Heat? Something that could get on skin?' },
    'plan-ppe': { icon: 'shield', title: 'PPE is a helper, not magic', text: 'PPE does not make a hazardous activity safe by itself. A safe plan, the right rules and a supervising adult come first.' },
    'rules': { icon: 'shield', title: 'Safety rules', text: 'Listen to your teacher, walk, wash hands, keep food out, report spills, never taste or touch unknown things.' },
    'em-spill': { icon: 'drop', title: 'Unknown spill', text: 'Move away, do not touch it, tell your teacher. Warn others to keep clear.' },
    'em-eye': { icon: 'eye', title: 'Eye splash', text: 'Call for your teacher and start rinsing at the eyewash right away. Do not delay. Keep rinsing until the teacher says.' },
    'em-glass': { icon: 'alert', title: 'Broken glass response', text: 'Stay clear, warn others, tell an adult. An adult cleans it up with the right tools.' },
    'em-fire': { icon: 'siren', title: 'Fire alarm', text: 'Stop, stay calm, follow your teacher and walk the planned route. Do not go back for belongings.' },
    cert: { icon: 'star', title: 'Safety Scientist', text: 'You finished the Safety Scientist Challenge. This is a game achievement, not an official certification.' },
  };

  /* ---------- Mission 1: Suit Up ---------- */
  D0.m1 = {
    scenario: 'Today’s job: mix splashy colored water, then look at a prepared fly slide under the stereomicroscope.',
    items: [
      { id: 'coat', name: 'Lab coat', kind: 'need', why: 'Great! A lab coat helps keep splashes off your clothes and skin.' },
      { id: 'goggles', name: 'Goggles', kind: 'need', why: 'Yes! Splashy water means your eyes need goggles.' },
      { id: 'shoes', name: 'Closed-toe shoes', kind: 'need', why: 'Closed shoes cover your whole foot. Drips and dropped things can’t reach your toes.' },
      { id: 'hairtie', name: 'Hair tie', kind: 'need', why: 'Hair tied back stays out of your work. Nice!' },
      { id: 'gloves', name: 'Gloves', kind: 'ok', why: 'Gloves are great for some jobs, but today’s job doesn’t need them. They’re okay to wear, not required.' },
      { id: 'sandals', name: 'Sandals', kind: 'bad', why: 'Hmm, sandals leave your toes open. A spill or a dropped thing could reach them.' },
      { id: 'scarf', name: 'Loose scarf', kind: 'bad', why: 'A dangling scarf could dip into your work or snag on something.' },
      { id: 'sunglasses', name: 'Sunglasses', kind: 'bad', why: 'Sunglasses aren’t made for splashes, and they’re too dark to see well indoors. Goggles are the right eye protection.' },
      { id: 'headphones', name: 'Headphones', kind: 'bad', why: 'You need to hear instructions and alarms in the lab, so headphones stay off.' },
      { id: 'cardigan', name: 'Baggy sweater', kind: 'bad', why: 'Baggy sleeves can hang into your work. A fitted lab coat is a better layer.' },
    ],
    ready: 'All set! Coat, goggles, closed shoes and tied-back hair. You are ready for the job.',
  };

  /* ---------- Mission 2: Protection Lab ---------- */
  D0.m2 = {
    stations: [
      { id: 'goggles', jr: 'goggles', title: 'Goggles', icon: 'goggles', demo: 'goggles', toggle: ['No goggles', 'Goggles on'],
        cap: ['Without goggles, a splash can reach your eyes.', 'Goggles sit around your eyes and block the splash.'],
        spots: [{ x: 238, y: 178, t: 'The seal around the eye area keeps splashes from the sides out.' }, { x: 160, y: 150, t: 'The strap keeps them snug so they don’t slip.' }],
        q: { q: 'Which job needs goggles?', opts: ['Pouring splashy colored water', 'Reading a book', 'Walking down the hall'], ok: 0, why: 'Splashes are the hazard goggles are made for. Ordinary glasses and sunglasses are not splash protection.' } },
      { id: 'coat', jr: 'coat', title: 'Lab coat', icon: 'coat', demo: 'coat', toggle: ['No coat', 'Coat on'],
        cap: ['Without a coat, a spill soaks into your clothes.', 'The coat catches the spill so it stays on the coat.'],
        spots: [{ x: 250, y: 250, t: 'The coat can be taken off quickly if something spills on it.' }, { x: 250, y: 190, t: 'Buttoned up, it covers your clothes and arms.' }],
        q: { q: 'A little splash lands on your coat. What is the best idea?', opts: ['Tell your teacher and take the coat off if told to', 'Ignore it, coats make you safe from everything', 'Wipe it on your hands'], ok: 0, why: 'A coat is a helper, not a force field. If something spills, step away and tell your teacher.' } },
      { id: 'gloves', jr: 'gloves', title: 'Gloves', icon: 'glove', demo: 'gloves', multi: ['What gloves are made of', 'Wearing them well', 'Taking them off'],
        cap: ['Different jobs need different gloves. Thin disposable gloves help with messy jobs. Heat needs special gloves that adults handle.', 'Check for holes. Gloved hands only touch the job, not your face, phone or door handles.', 'Pinch the wrist, peel the glove inside out, then peel off the second one over the first. Bin them and wash your hands.'],
        spots: [],
        q: { q: 'You finished a job with gloves. What comes next?', opts: ['Peel them off from the wrist, bin them, wash hands', 'Wear them to touch your phone and the door', 'Keep them on all day'], ok: 0, why: 'Gloves can carry mess on the outside. Peel from the wrist so the outside stays inside, bin them, then wash your hands.' } },
      { id: 'shoes', jr: 'shoes', title: 'Closed-toe shoes', icon: 'boot', demo: 'shoes', toggle: ['Sandals', 'Closed shoes'],
        cap: ['Sandals leave toes uncovered.', 'Closed-toe shoes cover the whole foot.'],
        spots: [{ x: 210, y: 360, t: 'Open sandals: drips and dropped things can reach skin.' }, { x: 590, y: 360, t: 'Closed shoes: the top of your foot is covered too.' }],
        q: { q: 'Why do we wear closed-toe shoes in the lab?', opts: ['They help protect feet from drips and dropped things', 'They look cool', 'They make you run faster'], ok: 0, why: 'Covered feet are better protected. That is also why we walk in the lab.' } },
      { id: 'hair', jr: 'hair', title: 'Tied-back hair', icon: 'user', demo: 'hair', toggle: ['Loose hair', 'Tied back'],
        cap: ['Loose hair swings into your work and can get close to heat.', 'Tied-back hair stays out of the way.'],
        spots: [{ x: 210, y: 240, t: 'Loose hair can dip into liquids or get close to heat.' }, { x: 590, y: 160, t: 'A hair tie keeps it behind you.' }],
        q: { q: 'Why tie long hair back?', opts: ['So it stays out of your work and away from heat', 'Because it is the fashion', 'So you can hear better'], ok: 0, why: 'Hair that stays out of the way can’t dip into your work or get near a heater.' } },
    ],
  };

  /* ---------- Mission 3: hazards ---------- */
  D0.hazards = {
    food: { name: 'Food near materials', slotType: 'bench', icon: 'drop', label: 'Snacks next to the lab materials',
      risk: 'Food near lab materials can pick up things we shouldn’t eat.',
      q: 'Someone left a sandwich and a juice next to the lab glassware. What is the safe response?',
      opts: [['Tell the teacher so the food goes to the right place', 1, 'Food stays out of the lab, and an adult can decide what to do.'], ['Eat it before it gets spoiled', 0, 'Never eat or drink in the lab. Materials could get on it.'], ['Push it next to the beakers to make room', 0, 'Pushing it closer makes it worse.']], j: 'hz-food' },
    unlabeled: { name: 'Unlabeled bottle', slotType: 'bench', icon: 'flask', label: 'A bottle with no label',
      risk: 'Nobody knows what is inside, so it could be harmful.',
      q: 'You find a bottle with a question mark and no label. What should you do?',
      opts: [['Don’t touch it, step back and tell an adult', 1, 'Right. Unknown liquids are for adults to check.'], ['Sniff it to figure out what it is', 0, 'Never sniff or taste unknown things.'], ['Pour it out in the sink', 0, 'You don’t know what it is. Leave it to an adult.']], j: 'hz-bottle' },
    hairHeat: { name: 'Hair near heat', slotType: 'bench', icon: 'flame', label: 'Long hair close to a heater',
      risk: 'Loose hair can get too close to heat.',
      q: 'A student with long loose hair is leaning over a heater. What is the safe response?',
      opts: [['Tell them to step back and tell the teacher; hair should be tied', 1, 'Yes. Heat stays an adult job and hair stays tied back.'], ['Touch their hair to check it', 0, 'Don’t touch anyone’s hair or the heater.'], ['Turn the heater off yourself', 0, 'Equipment is for adults to fix. Tell the teacher.']], j: 'hz-hair' },
    spill: { name: 'Spill on the floor', slotType: 'floor', icon: 'drop', label: 'A puddle on the floor',
      risk: 'Someone could slip, and we don’t know what the liquid is.',
      q: 'There is a puddle on the floor. What do you do?',
      opts: [['Step away, warn others and tell the teacher', 1, 'Yes. You don’t clean spills.'], ['Wipe it with your sleeve', 0, 'Don’t touch it. You don’t know what it is.'], ['Step over it quickly', 0, 'Someone could slip. Warn others and tell an adult.']], j: 'hz-spill' },
    glass: { name: 'Broken glass', slotType: 'floor', icon: 'alert', label: 'Pieces of glass on the floor',
      risk: 'Glass is sharp and could cut.',
      q: 'You see broken glass on the floor. What is the safe response?',
      opts: [['Stay clear, warn others and tell an adult', 1, 'Right. Adults clean up glass with the right tools.'], ['Pick up the pieces carefully', 0, 'Never pick up broken glass.'], ['Kick it under the bench', 0, 'That hides a sharp hazard. Tell an adult.']], j: 'hz-glass' },
    exit: { name: 'Blocked exit', slotType: 'exit', icon: 'exit', label: 'Boxes in front of the exit',
      risk: 'People may not be able to get out quickly.',
      q: 'Boxes are blocking the exit door. What do you do?',
      opts: [['Tell the teacher so the way is cleared', 1, 'Yes. Exits must stay clear.'], ['Climb over the boxes', 0, 'Climbing is not safe. Tell the teacher.'], ['Leave it, nobody uses that door', 0, 'In an emergency, everyone might need it.']], j: 'hz-exit' },
    sandals: { name: 'Open shoes', slotType: 'floor', icon: 'boot', label: 'A classmate in sandals',
      risk: 'Toes are uncovered if something spills or drops.',
      q: 'A classmate is working in sandals. What is a safe response?',
      opts: [['Tell the teacher; closed-toe shoes are the lab rule', 1, 'Right. The teacher can help with the rule.'], ['Say nothing; it is not a big deal', 0, 'Open shoes are a lab-safety problem.'], ['Take their sandals away', 0, 'Don’t touch their things. Tell the teacher.']], j: 'hz-shoes' },
    running: { name: 'Running in the lab', slotType: 'floor', icon: 'walk', label: 'A classmate running',
      risk: 'Running can knock things over or cause slips.',
      q: 'A classmate is running between the benches. What is the safe response?',
      opts: [['Remind them to walk and tell the teacher if it keeps happening', 1, 'Yes. We walk in the lab.'], ['Run after them', 0, 'That makes it worse.'], ['Ignore it', 0, 'Running can cause accidents. Speak up kindly.']], j: 'hz-run' },
  };
  D0.hazardIds = Object.keys(D0.hazards);
  D0.decoys = {
    eyewash: 'That is the eyewash station. It is safety equipment. Keep the way to it clear!',
    extinguisher: 'A fire extinguisher. Only adults use it. Not a hazard, but keep the way clear.',
    okkid: 'This scientist is dressed and working safely.',
  };

  /* ---------- Mission 4: gear for the job ---------- */
  D0.m4 = {
    gear: [
      { id: 'coat', name: 'Lab coat' }, { id: 'goggles', name: 'Goggles' }, { id: 'gloves', name: 'Gloves' }, { id: 'shoes', name: 'Closed shoes' },
      { id: 'hairtie', name: 'Hair tie (long hair)' }, { id: 'sunglasses', name: 'Sunglasses' },
    ],
    hazardOpts: [['splash', 'Splashes'], ['heat', 'Heat'], ['germs', 'Living things'], ['none', 'Very low hazard']],
    tasks: {
      scope: { id: 'scope', icon: 'scope', title: 'Look at a prepared fly specimen under a stereomicroscope',
        sub: 'The fly is already on a slide. You only look.', hazard: 'none', risk: 'low', adult: false,
        gear: { coat: 'need', goggles: 'skip', gloves: 'skip', shoes: 'need', hairtie: 'need', sunglasses: 'skip' },
        why: 'Looking at a prepared specimen has very low hazard. A coat, closed shoes and tied hair are everyday lab habits. Goggles and gloves are not needed for this job.' },
      heat: { id: 'heat', icon: 'flame', title: 'Warm water on a heating device',
        sub: 'The teacher runs the heater. You stand back and watch.', hazard: 'heat', risk: 'high', adult: true,
        gear: { coat: 'need', goggles: 'need', gloves: 'skip', shoes: 'need', hairtie: 'need', sunglasses: 'skip' },
        why: 'Heat can burn. Goggles guard against splashes, a coat and closed shoes help, and hair stays tied back. Thin gloves are not heat protection, and hot things are handled only by the teacher. PPE does not make this safe on its own: an adult must run it.' },
      nonhaz: { id: 'nonhaz', icon: 'note', title: 'Draw and label a picture of a fly in your notebook',
        sub: 'Paper, pencil and colors.', hazard: 'none', risk: 'low', adult: false,
        gear: { coat: 'ask', goggles: 'skip', gloves: 'skip', shoes: 'need', hairtie: 'need', sunglasses: 'skip' },
        why: 'No hazard here, so goggles and gloves are not needed. Follow your lab’s rules about coats, keep shoes closed and hair tied.' },
      unknown: { id: 'unknown', icon: 'alert', title: 'You find an unknown spill on the floor',
        sub: 'Nobody knows what it is.', hazard: 'splash', risk: 'high', adult: true, stop: true,
        gear: {},
        why: 'This is not a job for you, and no gear changes that. Step away, warn others and tell the teacher. An adult decides how to deal with it.' },
      bio: { id: 'bio', icon: 'fly', title: 'Move living flies between vials with your teacher',
        sub: 'Closed vials, a teacher next to you.', hazard: 'germs', risk: 'medium', adult: true,
        gear: { coat: 'need', goggles: 'skip', gloves: 'ask', shoes: 'need', hairtie: 'need', sunglasses: 'skip' },
        why: 'Flies are living things, so wash your hands after and follow your teacher’s steps. Gloves depend on your teacher’s rules. A coat, closed shoes and tied hair are everyday habits. Goggles are not needed unless there is a splash risk.' },
    },
    modes: {
      explorer: { name: 'Explorer', blurb: 'Pick the gear for 3 jobs.', tasks: ['scope', 'nonhaz', 'bio'], hazardQ: false, rate: false },
      scientist: { name: 'Scientist', blurb: '4 jobs, and name the hazard.', tasks: ['scope', 'heat', 'nonhaz', 'bio'], hazardQ: true, rate: false },
      advanced: { name: 'Advanced', blurb: '5 jobs, name the hazard, rate the risk.', tasks: ['scope', 'heat', 'nonhaz', 'unknown', 'bio'], hazardQ: true, rate: true },
    },
  };

  /* ---------- Mission 5: sort cards ---------- */
  D0.m5 = [
    { id: 'walk', safe: true, text: 'Walking calmly between benches', why: 'Walking keeps you steady and lets you notice things on the floor.' },
    { id: 'run', safe: false, text: 'Running with a glass beaker', why: 'Running can make you trip or drop things. Walk, and carry things carefully.' },
    { id: 'wash', safe: true, text: 'Washing hands with soap after the job', why: 'Soap and water remove things you can’t see. Always wash after lab work.' },
    { id: 'eat', safe: false, text: 'Snacking at the lab bench', why: 'Food and drinks stay out of the lab so nothing gets on them.' },
    { id: 'report', safe: true, text: 'Telling the teacher about a spill', why: 'Spills are for adults to handle. Telling is the right thing to do.' },
    { id: 'touch', safe: false, text: 'Pressing buttons on equipment you don’t know', why: 'Ask first. Equipment can be hot or break if used the wrong way.' },
    { id: 'listen', safe: true, text: 'Listening to the teacher’s instructions', why: 'Instructions keep everyone safe, so listening is a safety tool.' },
    { id: 'tidy', safe: true, text: 'Putting materials away tidily when done', why: 'A tidy bench means fewer spills and less tripping.' },
    { id: 'taste', safe: false, text: 'Tasting or sniffing an unknown liquid', why: 'Never taste or sniff unknown things. They could be harmful.' },
    { id: 'bag', safe: false, text: 'Leaving a backpack in the walkway', why: 'Bags in walkways cause trips and can block the exit. Keep them out of the way.' },
  ];

  /* ---------- Mission 6: emergencies ---------- */
  D0.m6 = [
    { id: 'spill', kind: 'spill', title: 'Unknown spill', icon: 'drop', j: 'em-spill',
      intro: 'You are walking by a bench and see a puddle of liquid on the floor. Nobody knows what it is.',
      steps: [
        { q: 'What do you do first?', opts: [['Stop, stay back and don’t touch it', 1, 'Yes. Step back and keep clear.'], ['Wipe it up with a paper towel', 0, 'You don’t know what it is. Don’t touch it.'], ['Sniff it to see what it is', 0, 'Never sniff unknown liquids.']] },
        { q: 'Who do you tell?', opts: [['Your teacher, right away', 1, 'Right. Spills are an adult job.'], ['Nobody, it will dry', 0, 'It could slip someone. Tell the teacher.'], ['Wait until class ends', 0, 'Tell now. Waiting lets others walk into it.']] },
        { q: 'While you wait for the teacher…', opts: [['Warn classmates to stay away from the spill', 1, 'Yes. Others need to know too.'], ['Pour water on it', 0, 'That could make it worse. Leave it.'], ['Cover it with your coat', 0, 'Don’t touch it, and keep your coat.']] },
      ], end: 'You kept safe and told an adult. That is the right first response.' },
    { id: 'eye', kind: 'eye', title: 'Eye splash', icon: 'eye', j: 'em-eye',
      intro: 'A classmate gets liquid splashed in their eye. Eyes need help fast.',
      steps: [
        { q: 'What is the first thing to do?', opts: [['Call out “Eye splash!” and start the eyewash right away', 1, 'Yes. Call for help and start rinsing straight away. Don’t wait.'], ['Look for the teacher first, then rinse', 0, 'Don’t delay the rinsing. Shout for help and start at once.'], ['Rub the eye', 0, 'Rubbing can make it worse.']] },
        { q: 'How long should the eye keep rinsing?', opts: [['Until the teacher says stop (often about 15 minutes)', 1, 'Yes. Keep rinsing until the teacher says.'], ['A few seconds', 0, 'That is not long enough.'], ['Until it stops stinging, then stop', 0, 'Keep going until the teacher says.']] },
        { q: 'Who helps?', opts: [['The teacher stays and gets more help if needed', 1, 'Right. Adults call for medical help if needed.'], ['Nobody, it is probably fine', 0, 'Always get an adult.'], ['Go back to the experiment', 0, 'Stay and help. The experiment can wait.']] },
      ], end: 'Fast, calm helping. Rinse right away and keep going until the teacher says.' },
    { id: 'glass', kind: 'glass', title: 'Broken glass', icon: 'alert', j: 'em-glass',
      intro: 'You hear a crash. A glass beaker broke near you.',
      steps: [
        { q: 'What do you do first?', opts: [['Stop and stay clear of the glass', 1, 'Yes. Don’t step closer.'], ['Pick up the pieces', 0, 'Never pick up broken glass.'], ['Walk through to the other side', 0, 'Glass could be on the floor. Stay clear.']] },
        { q: 'What about your classmates?', opts: [['Say “Careful, broken glass!” and tell the teacher', 1, 'Yes. Warn others and tell an adult.'], ['Say nothing', 0, 'Others could walk into it.'], ['Ask them to help pick it up', 0, 'Nobody picks it up. An adult does.']] },
        { q: 'Who cleans it?', opts: [['An adult, with the right tools', 1, 'Right. Adults use tools made for it.'], ['You, with your hands', 0, 'Hands can get cut.'], ['Sweep it with your sleeve', 0, 'Don’t. Leave it to an adult.']] },
      ], end: 'You stayed clear, warned others and told an adult.' },
    { id: 'fire', kind: 'fire', title: 'Fire alarm', icon: 'siren', j: 'em-fire',
      intro: 'The fire alarm rings. It may be a drill. Stay calm.',
      steps: [
        { q: 'What do you do first?', opts: [['Stop, stay calm and listen to the teacher', 1, 'Yes. Follow your teacher.'], ['Run to your bag', 0, 'Leave belongings. Follow your teacher.'], ['Hide under the bench', 0, 'Leave the room with the group.']] },
        { q: 'How do you leave?', opts: [['Walk with your group along the planned route', 1, 'Yes. Walking along the route is the plan.'], ['Run ahead of everyone', 0, 'Running causes trips and crowding.'], ['Take your own shortcut', 0, 'Use the planned route so everyone is counted.']] },
        { q: 'Outside, you notice your jacket is still inside…', opts: [['Leave it and stay with the group at the meeting spot', 1, 'Yes. Never go back inside for belongings.'], ['Run back for it', 0, 'Never go back in. Things can be replaced.'], ['Ask a friend to run back for it', 0, 'Nobody goes back in.']] },
      ], end: 'You followed your teacher and walked the route. Perfect fire drill.' },
  ];

  /* ---------- Mission 7: challenge. Each question has 2 variants; one is picked at random. ---------- */
  const Q = (scene, q, opts, ok, why, topic) => ({ scene, q, opts, ok, why, topic });
  D0.m7 = [
    [Q('goggles', 'You are about to pour splashy colored water. Which gear protects your eyes?', ['Goggles', 'Sunglasses', 'Headphones'], 0, 'Goggles are made for splashes.', 'goggles'),
     Q('goggles', 'Water might splash while you pour. What should be on your face?', ['Goggles', 'A scarf', 'Nothing, you’ll be careful'], 0, 'Goggles go on before the splashy part starts.', 'goggles')],
    [Q('coat', 'A lab coat is…', ['A helper that keeps splashes off your clothes', 'A force field that stops every danger', 'Only for show'], 0, 'PPE helps, but it does not make dangerous things safe.', 'coat'),
     Q('coat', 'You are wearing a lab coat and a big spill happens. What now?', ['Step away and tell the teacher', 'Touch the spill, the coat will protect you', 'Wipe it with your sleeve'], 0, 'A coat is a helper. Spills are for adults.', 'coat')],
    [Q('wash', 'You took your gloves off. What is next?', ['Wash your hands', 'Touch your face', 'Eat a snack'], 0, 'Wash hands after gloves and after every lab job.', 'gloves'),
     Q('wash', 'Which is the right way to take off gloves?', ['Peel from the wrist, inside out, then bin them and wash hands', 'Pull them off by the fingertips and toss them on the bench', 'Keep them on forever'], 0, 'Peel from the wrist so the outside stays on the inside.', 'gloves')],
    [Q('tidy', 'Your hair is long. What do you do before the job?', ['Tie it back', 'Leave it loose', 'Put it in your mouth'], 0, 'Tied hair stays out of the work and away from heat.', 'hair'),
     Q('tidy', 'Why do we wear closed shoes in the lab?', ['They protect feet from drips and drops', 'They are comfy', 'They look cool'], 0, 'Closed shoes cover the whole foot.', 'shoes')],
    [Q('touch', 'You find a bottle with no label. What do you do?', ['Don’t touch it, tell an adult', 'Smell it', 'Pour it in the sink'], 0, 'Unknown containers are for adults.', 'hazard'),
     Q('touch', 'You find a jar with a mystery liquid. What do you do?', ['Step back and tell an adult', 'Taste a drop', 'Shake it'], 0, 'Never taste, sniff or touch unknown things.', 'hazard')],
    [Q('report', 'A puddle on the floor. What do you do?', ['Step away and tell the teacher', 'Wipe it with paper towels', 'Put your hand in to check'], 0, 'You do not clean spills. Tell an adult.', 'spill'),
     Q('report', 'There is a spill on the floor. Who cleans it?', ['An adult', 'You with your sleeve', 'The first person to see it'], 0, 'An adult decides how to deal with it.', 'spill')],
    [Q('eye', 'A splash got in your eye. What is first?', ['Call for the teacher and start the eyewash right away', 'Rub it', 'Wait to see if it’s okay'], 0, 'Don’t delay. Rinse at once and keep going until the teacher says.', 'emergency'),
     Q('eye', 'How long should an eyewash rinse go for?', ['Until the teacher says stop (often about 15 minutes)', 'Three seconds', 'Until you feel bored'], 0, 'Keep rinsing until the teacher says.', 'emergency')],
    [Q('fire', 'The fire alarm rings. What do you do?', ['Follow your teacher and walk the planned route', 'Run to get your bag', 'Hide'], 0, 'Follow your teacher. Leave belongings.', 'emergency'),
     Q('fire', 'You are outside after the alarm. You left your jacket in the lab. What do you do?', ['Leave it and stay with the group', 'Run back in', 'Send a friend in'], 0, 'Never go back in for belongings.', 'emergency')],
  ];
  D0.m7pass = 6;

  /* ---------- Teacher Mode content ---------- */
  D0.teacher = {
    mapping: [
      ['1 Suit Up', 'Identify PPE and everyday wear that is not appropriate in a lab.', 'Drag-and-drop gear selection with feedback.'],
      ['2 Protection Lab', 'Explain how each piece of gear helps and what its limits are.', 'Interactive demos with a question for each.'],
      ['3 Spot the Hazard', 'Recognise common lab hazards and choose a safe response.', 'Explore a scene and respond to each hazard.'],
      ['4 Gear for the Job', 'Match PPE to a task and hazard; PPE alone does not make a hazardous task safe.', 'Planning terminal with difficulty modes.'],
      ['5 Safety Control Room', 'Sort safe and unsafe behaviours and explain why.', 'Card sorting with explanations.'],
      ['6 Emergency Response', 'Practise calm first responses to a spill, an eye splash, broken glass and a fire alarm.', 'Four simulated scenarios.'],
      ['7 Safety Scientist Challenge', 'Apply the ideas across all topics.', '8-question check with retry.'],
    ],
    refs: [
      ['American Chemical Society, Safety Guidelines for Chemical Demonstrations and Teaching Resources', 'acs.org'],
      ['NSTA, Safety in the Science Classroom (Safety Resources)', 'nsta.org'],
      ['U.S. OSHA, Personal Protective Equipment (PPE) overview and eye and face protection', 'osha.gov'],
      ['CDC, Handwashing: Clean Hands Save Lives', 'cdc.gov'],
      ['CDC / NIOSH, Chemical splash first aid and eyewash guidance (about 15 minutes of flushing)', 'cdc.gov/niosh'],
      ['ANSI/ISEA Z358.1, Emergency Eyewash and Shower Equipment (flushing duration reference)', 'safetyequipment.org'],
    ],
    disclaimer: 'This game teaches basic lab-safety habits for ages 5 to 8. It does not replace your school’s rules, a teacher’s instructions, or real safety training. Always follow your school’s own safety rules.',
  };
})();
