/* Drosie's First Scientific Conference · data and fixed content.
   EVERYTHING numeric here is SIMULATED for teaching. It is not a real experiment. */
(function () {
  'use strict';
  const DC = (window.DC = window.DC || {});

  /* ---------- the simulated climbing-assay dataset ---------- */
  DC.DATA = {
    flies: 10, trials: 5, lineCm: 8, vialCm: 10, seconds: 10, restSec: 60,
    conditions: [
      { id: 'control', label: 'Room temperature (25 °C)', short: '25 °C', role: 'control', color: '#1d5a5a', counts: [7, 8, 6, 8, 7] },
      { id: 'cool', label: 'Cooler room (18 °C)', short: '18 °C', role: 'test', color: '#b5483c', counts: [4, 5, 3, 5, 4] }
    ]
  };
  DC.cond = (id) => DC.DATA.conditions.find((c) => c.id === id);

  DC.STUDY = {
    title: 'Does a cooler room change how many fruit flies climb?',
    question: 'When fruit flies are tapped to the bottom of a vial, do fewer of them climb above an 8 cm line within 10 seconds at 18 °C than at 25 °C?',
    hypothesis: 'Fruit flies are ectotherms: their body temperature follows the air around them. Cooler air should slow their activity, so cooler flies will climb less.',
    prediction: 'If cooler air reduces climbing, then fewer flies will be above the 8 cm line after 10 seconds at 18 °C than at 25 °C.',
    iv: 'Test temperature (25 °C or 18 °C). This is the one thing we change on purpose.',
    dv: 'The number of flies (out of 10) that are above the 8 cm line 10 seconds after the vial is tapped.',
    control: 'The 25 °C group is the comparison (control) group. It is treated exactly like the 18 °C group except for the temperature.',
    kept: ['Same type of vial (10 cm of climbing height)', 'Same number of flies in each group (10)', 'Same age of flies (simulated: 3 to 5 days old)', 'Same time of day for testing', 'Same three gentle taps to start each trial', 'Same 10 minutes of rest in the test room before testing'],
    measure: 'Tap the vial gently three times so every fly falls to the bottom. Start a 10-second timer. When it ends, count the flies whose bodies are above the 8 cm reference line.',
    uncertainty: ['Counting by eye can be slightly off, especially for flies near the line.', 'Each tap is a little different.', 'Flies can get tired after several trials in a row.', 'Individual flies differ from each other.', 'The room temperature can drift a little.'],
    limitations: ['Only 10 flies in each condition.', 'One vial per condition: a difference between the two vials is mixed up with the difference in temperature.', 'All 5 trials in a condition use the same 10 flies. They are repeated measurements, not independent replicates.', 'Only two temperatures were tested.', 'Climbing is one behavior. It cannot tell us why the flies climbed less.', 'These data are simulated. They are not a real experiment.']
  };

  /* ---------- chapters ---------- */
  DC.CHAPTERS = [
    { n: 1, id: 'invitation', title: 'The Conference Invitation', short: 'Invitation', icon: '✉', min: 6 },
    { n: 2, id: 'path', title: 'Choose Your Research Path', short: 'Research path', icon: '🧭', min: 8 },
    { n: 3, id: 'investigation', title: 'The Research Investigation', short: 'Investigation', icon: '🔬', min: 20 },
    { n: 4, id: 'detective', title: 'Become a Data Detective', short: 'Data detective', icon: '🔎', min: 20 },
    { n: 5, id: 'abstract', title: 'The Abstract Studio', short: 'Abstract', icon: '✍', min: 15 },
    { n: 6, id: 'poster', title: 'The Scientific Poster Studio', short: 'Poster', icon: '🖼', min: 25 },
    { n: 7, id: 'registration', title: 'Registration and Preparation', short: 'Registration', icon: '🎟', min: 10 },
    { n: 8, id: 'hall', title: 'The Interactive Conference Hall', short: 'Conference hall', icon: '🏛', min: 25 },
    { n: 9, id: 'present', title: 'Present, Discuss, and Revise', short: 'Present & revise', icon: '🎤', min: 20 },
    { n: 10, id: 'finale', title: 'The Conference Finale', short: 'Finale', icon: '🏅', min: 10 }
  ];

  /* ---------- fictional scientists (original characters; none are real people) ---------- */
  DC.SCIENTISTS = [
    { id: 'quill', name: 'Dr. Marisol Quill', field: 'Insect behavior', trait: 'Warm and curious. Loves a clear question.', look: { skin: '#c68a5e', hair: '#2b1d16', style: 'bun', glasses: true, coat: '#e8f1ee', accent: '#2f7d7a' } },
    { id: 'anand', name: 'Dr. Kofi Anand', field: 'Genetics and careful controls', trait: 'Precise and patient. Always asks what was kept the same.', look: { skin: '#7a4b34', hair: '#1a1411', style: 'short', glasses: false, coat: '#f4efe0', accent: '#b5483c' } },
    { id: 'waverly', name: 'Dr. Lin Waverly', field: 'Making graphs honest', trait: 'Quick and cheerful. Reads every axis label twice.', look: { skin: '#e8c39e', hair: '#3a2a1c', style: 'long', glasses: true, coat: '#e9e4f3', accent: '#6b4a9a' } },
    { id: 'okoro', name: 'Dr. Sam Okoro', field: 'Skeptical thinking', trait: 'Friendly skeptic. Asks "what else could explain it?"', look: { skin: '#a56b46', hair: '#d8d3cc', style: 'curly', glasses: false, coat: '#f6e8d2', accent: '#8a6a1d' } },
    { id: 'bright', name: 'Prof. Ada Brightwater', field: 'Session chair', trait: 'Calm and encouraging. Wants to know what you would try next.', look: { skin: '#f0d0b0', hair: '#8a8a92', style: 'bob', glasses: true, coat: '#dff0ea', accent: '#1d5a5a' } }
  ];

  /* ---------- glossary (plain definitions of established ideas) ---------- */
  DC.GLOSSARY = [
    ['Research question', 'The thing you want to find out. It is asked as a question.'],
    ['Hypothesis', 'A possible explanation you can test, usually with a "because" idea behind it.'],
    ['Prediction', 'What you expect to measure or see if the hypothesis is right. A prediction is not the same as a hypothesis.'],
    ['Independent variable', 'The one thing you change on purpose.'],
    ['Dependent variable', 'The thing you measure to see what happened.'],
    ['Control (comparison) group', 'A group treated the same way as the test group, except for the one thing you change. It shows what happens without the change.'],
    ['Controlled variables', 'Everything you try to keep the same so it does not confuse your results.'],
    ['Observation', 'What you saw or measured.'],
    ['Interpretation', 'What you think the observation means. Interpretations can be wrong, so they need evidence.'],
    ['Repeated measurements', 'Measuring the same thing again, often on the same subjects. This helps with measurement noise.'],
    ['Independent replicate', 'A separate repeat of the whole experiment with new subjects (for example, a new group of flies in a new vial).'],
    ['Uncertainty', 'How much your numbers could be off or could vary. All real measurements have some.'],
    ['Limitation', 'Something about the study that limits what it can tell us.'],
    ['Correlation and causation', 'Two things happening together does not by itself show that one causes the other.'],
    ['Abstract', 'A short summary of a study: why, what question, how, what was found, and what it means.'],
    ['Poster', 'A large display that lets people read your research and talk with you about it at a conference.'],
    ['Peer review', 'Experts check a manuscript before a journal publishes it. Most conference presentations are shared for discussion and have not been through journal peer review.'],
    ['Simulation', 'Made-up data or events used for learning. A simulation is not a real experiment.']
  ];

  /* ---------- references (each one was looked up in PubMed; see conference-progress.md) ---------- */
  DC.REFS = [
    { id: 'gargano2005', text: 'Gargano JW, Martin I, Bhandari P, Grotewiel MS. Rapid iterative negative geotaxis (RING): a new method for assessing age-related locomotor decline in Drosophila. Experimental Gerontology. 2005;40(5):386-395.', doi: '10.1016/j.exger.2005.02.005', note: 'Describes a climbing (negative geotaxis) assay in fruit flies. This activity is inspired by that kind of assay; it is not a copy of their method.' },
    { id: 'nichols2012', text: 'Nichols CD, Becnel J, Pandey UB. Methods to assay Drosophila behavior. Journal of Visualized Experiments. 2012;(61):3795.', doi: '10.3791/3795', note: 'A methods article that includes a video protocol for the climbing assay.' }
  ];

  /* ---------- fictional conference program ---------- */
  DC.PROGRAM = [
    ['9:00', 'Welcome from Drosie', 'Main stage'],
    ['9:20', 'Opening talk: How scientists share surprises (fictional speaker)', 'Main stage'],
    ['10:00', 'Poster Session A', 'Poster Hall'],
    ['10:45', 'Snack break (imaginary fruit, not for flies!)', 'Courtyard'],
    ['11:15', 'Short talks: climbing, counting and careful controls', 'Presentation area'],
    ['12:15', 'Lunch and discussion corner', 'Discussion corner'],
    ['1:15', 'Poster Session B: this is where you present', 'Poster Hall'],
    ['2:30', 'Reflection time and closing', 'Reflection area']
  ];

  /* ---------- fictional example posters for the poster hall (each has one fixable problem) ---------- */
  DC.EXAMPLE_POSTERS = [
    {
      id: 'p1', by: 'Fictional poster by "Juniper"', title: 'Warm Spots Make Seeds Sprout Faster',
      body: 'Question: Do bean seeds sprout faster in a warm spot? Method: 1 pot of seeds near a heater and 1 pot of seeds in a cold garage. The warm pot sprouted after 3 days and the cold pot after 7 days.',
      claim: 'Conclusion: This proves that all seeds sprout faster when it is warm.',
      prompt: 'What is the main problem with this poster?',
      options: [
        ['One pot per place cannot support a claim about all seeds, and "proves" is too strong.', true, 'Yes. With one pot in each place, we cannot tell whether the seeds, the pot or the place caused the difference (the heater might also dry the soil). A careful claim stays with what was measured.'],
        ['The title is too short.', false, 'Short titles are fine. Look at what the conclusion says and how much data stands behind it.'],
        ['It should have more colors.', false, 'Color is not the problem here. Check whether the conclusion fits the evidence.']
      ]
    },
    {
      id: 'p2', by: 'Fictional poster by "Basil"', title: 'Which Snack Do Pill Bugs Prefer?',
      body: 'Figure: bar graph with the vertical axis starting at 8 instead of 0 (bars: apple 9, carrot 10). The bars make carrot look about twice as tall as apple.',
      claim: 'Conclusion: Pill bugs strongly prefer carrot.',
      prompt: 'What should Basil fix first?',
      options: [
        ['Start the vertical axis at zero so the bar heights match the numbers.', true, 'Yes. Starting at 8 makes a difference of 1 look huge. Axes for bars should start at zero. Also say how many pill bugs were tested.'],
        ['Make the bars thicker.', false, 'Thicker bars do not make the graph more honest. Check the numbers on the axis.'],
        ['Delete the graph.', false, 'A graph is useful here. It only needs a fair axis and clear labels.']
      ]
    },
    {
      id: 'p3', by: 'Fictional poster by "Wren"', title: 'Rolling Marbles Down Ramps',
      body: 'Figure: a graph with bars labeled "A", "B", "C" and no axis titles or units. Results: "B was the best."',
      claim: 'Conclusion: B is better.',
      prompt: 'What is missing that readers need most?',
      options: [
        ['Axis titles and units, and what "A, B, C" and "best" mean.', true, 'Yes. A figure should say what is measured, in what unit, and what each label stands for. "Best" needs a definition like "rolled the farthest in cm".'],
        ['A bigger title.', false, 'A big title will not help a reader understand the graph.'],
        ['A picture of the author.', false, 'Not needed. Readers need to understand the evidence.']
      ]
    }
  ];

  /* ---------- hall areas ---------- */
  DC.AREAS = [
    { id: 'reg', name: 'Registration desk', icon: '🎟', blurb: 'Pick up your badge and read the program.' },
    { id: 'posters', name: 'Poster hall', icon: '🖼', blurb: 'Read posters and spot what makes them clear or confusing.' },
    { id: 'stage', name: 'Presentation area', icon: '🎤', blurb: 'Watch a short fictional talk and test its claims.' },
    { id: 'talk', name: 'Scientist discussion corner', icon: '💬', blurb: 'Answer questions from fictional scientists about your work.' },
    { id: 'booth', name: 'Research information booth', icon: 'ℹ', blurb: 'Glossary, how conferences work, and references.' },
    { id: 'reflect', name: 'Reflection area', icon: '🌿', blurb: 'A quiet place to think about what you learned.' }
  ];
})();
