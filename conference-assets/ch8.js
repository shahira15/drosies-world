/* Chapter 8 : The interactive conference hall (all characters and events are fictional) */
(function () {
  'use strict';
  const DC = window.DC, esc = DC.esc;
  let cur = '';

  /* ---------- original scientist avatars ---------- */
  DC.avatar = (l, size) => {
    const hair = { bun: '<circle cx="50" cy="12" r="9" fill="' + l.hair + '"/><path d="M26 40Q26 14 50 14Q74 14 74 40Q66 28 50 28Q34 28 26 40Z" fill="' + l.hair + '"/>', short: '<path d="M27 42Q24 16 50 15Q76 16 73 42Q66 27 50 27Q34 27 27 42Z" fill="' + l.hair + '"/>', long: '<path d="M24 78V40Q24 14 50 14Q76 14 76 40V78Q70 60 70 42Q60 28 50 28Q40 28 30 42Q30 60 24 78Z" fill="' + l.hair + '"/>', curly: '<g fill="' + l.hair + '"><circle cx="30" cy="30" r="10"/><circle cx="42" cy="20" r="11"/><circle cx="58" cy="20" r="11"/><circle cx="70" cy="30" r="10"/></g>', bob: '<path d="M25 56V38Q25 14 50 14Q75 14 75 38V56Q70 56 69 44Q60 28 50 28Q40 28 31 44Q30 56 25 56Z" fill="' + l.hair + '"/>' }[l.style] || '';
    return '<svg viewBox="0 0 100 110" width="' + (size || 84) + '" height="' + (size || 84) + '" role="img" aria-hidden="true" focusable="false"><path d="M12 110Q14 76 50 72Q86 76 88 110Z" fill="' + l.coat + '" stroke="#b9b49d" stroke-width="2"/><path d="M42 74L50 92L58 74Z" fill="' + l.accent + '"/><rect x="43" y="58" width="14" height="16" rx="5" fill="' + l.skin + '"/><ellipse cx="50" cy="44" rx="21" ry="24" fill="' + l.skin + '"/>' + hair + '<circle cx="42" cy="46" r="2.6" fill="#1c2b28"/><circle cx="58" cy="46" r="2.6" fill="#1c2b28"/><path d="M43 56Q50 62 57 56" fill="none" stroke="#7a3b2e" stroke-width="2.4" stroke-linecap="round"/>' + (l.glasses ? '<g fill="none" stroke="' + l.accent + '" stroke-width="2"><circle cx="42" cy="46" r="7"/><circle cx="58" cy="46" r="7"/><path d="M49 46H51"/></g>' : '') + '</svg>';
  };

  /* ---------- scientists' questions: written so that pathway A and B each get meaningful, accurate feedback ---------- */
  function vals() { const o = {}; DC.DATA.conditions.forEach((c) => (o[c.id] = DC.stats(c.counts))); return o; }
  const Q = {
    quill: {
      A: () => ({ q: 'Welcome to your poster! In one sentence: what question were you investigating?', o: [
        ['I wanted to find out whether fewer flies climb above the 8 cm line within 10 seconds at 18 °C than at 25 °C.', 2, 'A clear, testable question. It names what changed (temperature), what was measured (flies above the line) and the time and height, so a listener knows what you did.'],
        ['I wanted to see if flies are better at 25 °C.', 1, 'Close, but "better" is vague. Better at what? Say what you measured: how many flies climbed above the line in 10 seconds.'],
        ['I wanted to prove that cold makes flies lazy.', 0, 'A question tries to find out. It does not prove an answer in advance. And "lazy" is a guess about why. You measured climbing, not laziness. Try "Do fewer flies climb…?"'],
        ['Flies.', 0, 'A topic is not a question. A question can be answered by measuring or observing something.']] }),
      B: () => ({ q: 'Welcome to your poster! ' + (DC.bFilled('question') ? 'I see your question is: “' + DC.state.b.f.question.trim() + '”. ' : '') + 'How would you tell a visitor your question, and what did you look at to answer it?', o: [
        ['I would say it in my own words, then name what I observed or measured to answer it.', 2, 'Yes. Your own words make it clear, and linking the question to your evidence shows how the project hangs together.'],
        ['I would just read it out and hope they understand.', 1, 'Reading is fine as a start. Try adding a sentence about what you looked at to answer it.'],
        ['I did not really have a question. I just collected things.', 1, 'Even descriptive projects begin with a "What is going on?" question. Write one that fits what you collected.'],
        ['It does not matter what my question was.', 0, 'The question is the reason for everything else on the poster. It matters a lot.']] })
    },
    anand: {
      A: () => ({ q: 'Why is the 25 °C group your control? What did you keep the same?', o: [
        ['It is the comparison group. It was treated the same as the 18 °C group (same vial type, 10 flies, time of day, taps) except for the temperature, so a difference is more likely to come from temperature.', 2, 'Right. A control is a fair comparison. Notice "more likely": with only one vial per group we still cannot be sure.'],
        ['The control is the group I expected to do best.', 0, 'A control is not a winner. It is the comparison that shows what happens when you do not change the variable.'],
        ['I did not need a control because I had two groups.', 0, 'Two groups are not enough by themselves. The comparison only works if everything except the variable is kept the same.'],
        ['25 °C is normal, so I used it as the comparison, but I did not think about the other things.', 1, 'Using a usual condition as the comparison is right. Also say what you kept the same, because differences in those things could change the result.']] }),
      B: () => ({ q: 'Do you have a comparison in your project, a time, place or group where you did not change anything? If not, what does that mean for what you can say?', o: [
        ['I had a comparison and tried to keep everything else the same, so I can say more about what the change did.', 2, 'Good. A fair comparison is what lets a scientist say what a change did.'],
        ['My project is an observation, so I have no control group. I can describe what I saw, but I cannot say what caused it.', 2, 'Excellent. Observation projects are real science, and this is an honest description of their limits.'],
        ['I have no comparison, but I can still say exactly what caused my result.', 0, 'Without a comparison it is hard to say what caused something. You can describe what you saw and suggest ideas to test next.'],
        ['What is a control?', 1, 'A good question! A control is a comparison where you do not change the thing you are testing, so you can see what difference the change makes. Then you can answer in your own words.']] })
    },
    waverly: {
      A: () => { const v = vals(); return { q: 'Walk me through your graph. What does it show?', o: [
        ['Each marker is one trial out of 10 flies. At 25 °C the average was ' + DC.fmt(v.control.mean, 1) + ' flies above the line, and at 18 °C it was ' + DC.fmt(v.cool.mean, 1) + '. In this simulation the cooler group had fewer flies above the line.', 2, 'You explained what a marker means, gave the averages, and described the pattern without claiming more than the data show.'],
        ['It shows that cold flies are slower.', 1, '"Slower" is an interpretation. The graph shows how many flies were above the line after 10 seconds. It does not measure speed.'],
        ['It shows that cold proves flies cannot climb.', 0, 'Not supported. Flies at 18 °C did climb (' + v.cool.min + ' to ' + v.cool.max + ' above the line in each trial), and one graph cannot prove a cause.'],
        ['It is a graph of flies.', 0, 'Say what the axes mean and what pattern you see. Start with the vertical axis.']] }; },
      B: () => ({ q: 'Walk me through your figure. What do the axes and points mean, and what pattern do you see?', o: [
        ['I would name the axes and their units, say what each point means, describe the pattern, and say what the graph cannot tell us.', 2, 'That is the ideal order: axes, points, pattern, limits.'],
        ['I did not make a graph because my evidence is in words and pictures, so I would walk through my observation table.', 2, 'Not every project needs a graph. A clear observation table is a fine way to show evidence.'],
        ['The graph speaks for itself.', 0, 'Graphs rarely speak for themselves. A good presenter explains the axes first.'],
        ['My graph proves my idea.', 0, 'A graph shows evidence. It does not prove an idea by itself.']] })
    },
    okoro: {
      A: () => ({ q: 'Could another explanation fit your results? What else might make the 18 °C group climb less?', o: [
        ['Yes. The two groups used different vials and different flies, so those could differ. I would test more groups at both temperatures, in random order, and have a second person count.', 2, 'Excellent. Naming a specific alternative and a way to test it is how scientists think.'],
        ['No. The data are clear: cold causes less climbing.', 0, 'Be careful. Data rarely settle a question alone. Different flies, vials or timing could also matter.'],
        ['Maybe, but I cannot think of anything.', 1, 'Admitting that is honest. Try listing differences between the groups other than temperature: which flies, which vial, when, who counted.'],
        ['Yes, maybe the flies just did not feel like it.', 1, 'That could be true, but it is too vague to test. Try something you could check, such as "the 18 °C flies were tested at a different time of day than the 25 °C flies".']] }),
      B: () => ({ q: 'Could something else explain what you saw? What else might have been different?', o: [
        ['Yes. For example, something else I did not control might have mattered. To check, I would repeat it and change only one thing at a time.', 2, 'Good thinking. Naming a possible alternative and how you would test it is a strength.'],
        ['I do not know yet. I would need another experiment to find out.', 2, '"I don’t know yet" is a real scientist’s answer, especially when you say how you would find out.'],
        ['No. My explanation is the only possible one.', 0, 'There is almost always more than one possible explanation. Looking for others makes your science stronger.'],
        ['Anything else would be silly.', 0, 'Good scientists take other explanations seriously. They are how we find mistakes before others do.']] })
    },
    bright: {
      A: () => ({ q: 'What would you do differently next time, and what are the limits of this study?', o: [
        ['Next time I would test several separate groups of flies in separate vials at both temperatures, in random order, with a second person counting. Now I have 10 flies per group, one vial each, and the data are simulated.', 2, 'Clear limits and a concrete improvement: independent groups, random order and a second counter.'],
        ['I would use more temperatures and more flies, so I could see a pattern across temperatures and rely less on chance.', 2, 'Good. More temperatures show whether the pattern holds and more flies reduce the role of chance. Separate vials would help even more.'],
        ['I would do more trials with the same 10 flies.', 1, 'More trials on the same flies reduce counting wobble, but those trials are still not independent. New groups of flies would tell you more.'],
        ['Nothing. It was perfect.', 0, 'No study is perfect. Naming limits is a sign of careful science, not a weakness.']] }),
      B: () => ({ q: 'What would you do differently next time, and what are the limits of your project?', o: [
        ['I would name one limit (for example, few tries or something I could not control) and one change that would make my evidence stronger.', 2, 'That is the right idea. Limits plus a concrete next step.'],
        ['I do not know yet. I need to think about what was missing.', 1, 'Honest, and a fine starting point. Try to name one thing that limits what your project can tell us.'],
        ['I would make my poster prettier.', 1, 'Good communication matters, but also think about the science: what would make your evidence stronger?'],
        ['It was perfect.', 0, 'No project is perfect. Naming limits shows that you understand your evidence.']] })
    }
  };
  const getQ = (id) => (Q[id][DC.state.path === 'B' ? 'B' : 'A'])();
  DC.sciQuestion = getQ;   /* read-only: the visual hall asks the same questions with the same feedback */
  const bestCount = () => Object.values(DC.state.hall.sci).filter((x) => x && x.best).length;
  const visitedCount = () => DC.AREAS.filter((a) => DC.state.hall.visited[a.id]).length;

  /* ---------- the illustrated hall ---------- */
  const HOT = { reg: [14, 74], booth: [13, 34], posters: [40, 40], stage: [69, 48], talk: [87, 84], reflect: [49, 90] };
  function hallSVG() {
    return '<svg viewBox="0 0 800 400" role="img" aria-labelledby="hallT hallD" xmlns="http://www.w3.org/2000/svg"><title id="hallT">Illustration of the conference hall</title><desc id="hallD">A bright hall with a registration desk and an information booth on the left, three poster boards in the middle, a stage with a screen on the right, a discussion corner with a round table at the bottom right and a reflection area with a rug and plants at the bottom middle.</desc>' +
      '<rect width="800" height="400" fill="#f6efd9"/><rect y="235" width="800" height="165" fill="#e3d0a5"/><g stroke="#cdb584" stroke-width="2" opacity=".7"><path d="M0 275H800M0 320H800M0 365H800"/></g>' +
      '<g fill="#cfe8ee" stroke="#8d6336" stroke-width="4"><rect x="250" y="30" width="70" height="60" rx="4"/><rect x="365" y="30" width="70" height="60" rx="4"/><rect x="480" y="30" width="70" height="60" rx="4"/></g>' +
      '<path d="M0 8Q200 40 400 8T800 8" fill="none" stroke="#8d6336" stroke-width="3"/><g><path d="M40 16l18 0-9 20z" fill="#d9b45a"/><path d="M120 24l18 0-9 20z" fill="#c4655a"/><path d="M200 28l18 0-9 20z" fill="#2f7d7a"/><path d="M280 26l18 0-9 20z" fill="#d9b45a"/><path d="M360 20l18 0-9 20z" fill="#c4655a"/><path d="M440 16l18 0-9 20z" fill="#2f7d7a"/><path d="M520 22l18 0-9 20z" fill="#d9b45a"/><path d="M600 28l18 0-9 20z" fill="#c4655a"/><path d="M680 26l18 0-9 20z" fill="#2f7d7a"/><path d="M760 18l18 0-9 20z" fill="#d9b45a"/></g>' +
      /* info booth with striped awning */
      '<rect x="30" y="120" width="150" height="100" fill="#fff" stroke="#8d6336" stroke-width="4"/><path d="M24 120h162v-30H24z" fill="#b5483c"/><g fill="#fff"><rect x="48" y="90" width="22" height="30"/><rect x="92" y="90" width="22" height="30"/><rect x="136" y="90" width="22" height="30"/></g><text x="105" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#1d5a5a">Info booth</text><text x="105" y="196" text-anchor="middle" font-size="26">ℹ️</text>' +
      /* registration desk */
      '<rect x="30" y="262" width="150" height="62" rx="6" fill="#8d6336"/><rect x="30" y="254" width="150" height="14" rx="4" fill="#b4834a"/><text x="105" y="298" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="700" fill="#fff">Registration</text>' +
      /* poster boards */
      '<g stroke="#8d6336" stroke-width="4"><rect x="215" y="115" width="110" height="130" fill="#fff"/><rect x="345" y="115" width="110" height="130" fill="#fff"/><rect x="475" y="115" width="0" height="0"/></g><g fill="#1d5a5a"><rect x="225" y="125" width="90" height="16"/><rect x="355" y="125" width="90" height="16" fill="#5b3a6b"/></g><g fill="#d9b45a"><rect x="225" y="150" width="40" height="50"/><rect x="355" y="150" width="40" height="50"/></g><g fill="#c9d8cc"><rect x="272" y="150" width="43" height="12"/><rect x="272" y="168" width="43" height="12"/><rect x="272" y="186" width="43" height="12"/><rect x="402" y="150" width="43" height="12"/><rect x="402" y="168" width="43" height="12"/><rect x="402" y="186" width="43" height="12"/></g>' +
      /* stage */
      '<rect x="505" y="170" width="190" height="80" fill="#a97a46" stroke="#8d6336" stroke-width="4"/><rect x="525" y="120" width="150" height="52" fill="#fff" stroke="#555" stroke-width="3"/><path d="M540 160l25-22 20 14 25-24 30 30" fill="none" stroke="#1d5a5a" stroke-width="4"/><rect x="590" y="195" width="22" height="40" fill="#6b4a2a"/>' +
      /* discussion corner */
      '<ellipse cx="710" cy="325" rx="55" ry="26" fill="#a97a46" stroke="#8d6336" stroke-width="4"/><g fill="#2f7d7a"><circle cx="650" cy="325" r="13"/><circle cx="770" cy="325" r="13"/><circle cx="710" cy="365" r="13"/></g><text x="710" y="330" text-anchor="middle" font-size="16">☕</text>' +
      /* reflection corner */
      '<ellipse cx="395" cy="355" rx="85" ry="28" fill="#9fcf9b" stroke="#2d7a52" stroke-width="3"/><rect x="345" y="330" width="100" height="14" rx="5" fill="#8d6336"/><g><circle cx="320" cy="335" r="14" fill="#2d7a52"/><rect x="316" y="342" width="8" height="26" fill="#6b4a2a"/><circle cx="470" cy="335" r="14" fill="#2d7a52"/><rect x="466" y="342" width="8" height="26" fill="#6b4a2a"/></g>' +
      '<image href="images/drosie-mascot-640.webp" x="240" y="270" width="64" height="64"/></svg>';
  }

  function areaNav() {
    return '<div class="areanav" role="group" aria-label="Go to an area of the hall">' + DC.AREAS.map((a) => '<button type="button" class="areabtn' + (DC.state.hall.visited[a.id] ? ' visited' : '') + '" data-act="area" data-a="' + a.id + '"' + (cur === a.id ? ' aria-current="true"' : '') + '><span aria-hidden="true">' + a.icon + '</span> ' + esc(a.name) + (DC.state.hall.visited[a.id] ? '<span class="sr-only"> (visited)</span>' : '') + '</button>').join('') + '</div>';
  }
  function hotspots() {
    return DC.AREAS.map((a) => '<button type="button" class="hot' + (DC.state.hall.visited[a.id] ? ' visited' : '') + '" style="left:' + HOT[a.id][0] + '%;top:' + HOT[a.id][1] + '%" data-act="area" data-a="' + a.id + '"' + (cur === a.id ? ' aria-current="true"' : '') + ' aria-label="' + esc(a.name) + (DC.state.hall.visited[a.id] ? ', visited' : '') + '"><span aria-hidden="true" data-ico="' + a.icon + '"></span><span class="t">' + esc(a.name) + '</span></button>').join('');
  }

  /* ---------- area panels ---------- */
  function areaReg() {
    const as = DC.assignment();
    return '<p>Drosie flutters over: "Welcome! Here is your badge and the program. Your poster is on <strong>Board #' + as.board + '</strong> in ' + as.hall + '."</p><div style="text-align:center">' + DC.badgeHTML('Board #' + as.board) + '</div><div class="tblwrap"><table class="tbl"><caption>Fictional program</caption><tbody>' + DC.PROGRAM.map((r) => '<tr><th scope="row">' + r[0] + '</th><td style="text-align:left">' + esc(r[1]) + '</td></tr>').join('') + '</tbody></table></div>';
  }
  function areaPosters() {
    const P = DC.EXAMPLE_POSTERS;
    return '<p>Poster halls are full of work in progress. Read each fictional poster and decide what to fix. Then look at your own.</p>' +
      P.map((p) => '<div class="card"><span class="tag">' + esc(p.by) + '</span><h4>' + esc(p.title) + '</h4><p>' + esc(p.body) + '</p><p><em>' + esc(p.claim) + '</em></p>' + DC.mcq('hp_' + p.id, p.prompt, p.options) + '</div>').join('') +
      '<div class="card gold"><h4>Your poster on Board #' + DC.assignment().board + '</h4>' + (DC.state.poster.started ? '<details><summary>Show my poster</summary><div class="posterwrap" tabindex="0" role="region" aria-label="Your poster">' + DC.posterHTML() + '</div></details>' : '<p>You have not started your poster yet. <button type="button" class="btn small" data-act="go" data-n="6">Open the Poster Studio</button></p>') + '<p class="hint">Look at it like a visitor. Can you tell the question from three steps away? Is the figure labeled?</p></div>';
  }
  const SUG = [12, 15, 9, 14, 11], SAL = [2, 1, 3, 0, 2];
  DC.TALK_DATA = { sugar: SUG, salt: SAL };
  function areaStage() {
    const sg = DC.stats(SUG), sl = DC.stats(SAL);
    return '<div class="callout sim"><strong>Fictional talk.</strong> This short talk and its numbers were invented for practice. The speaker is a fictional character.</div><div class="card"><h4>Talk: "Do ants visit sugar water or salt water?" (fictional)</h4><ol class="clean"><li><strong>Question:</strong> Do ants visit cups of sugar water more than cups of salt water?</li><li><strong>Method:</strong> Five cups of each, set on the same patio at the same time. After 10 minutes, count ants at each cup.</li><li><strong>Data:</strong><div class="tblwrap"><table class="tbl"><caption>Ants counted at each cup</caption><thead><tr><th scope="col">Cup</th><th scope="col">Sugar water</th><th scope="col">Salt water</th></tr></thead><tbody>' + SUG.map((v, i) => '<tr><th scope="row">' + (i + 1) + '</th><td>' + v + '</td><td>' + SAL[i] + '</td></tr>').join('') + '<tr><th scope="row">Mean</th><td>' + DC.fmt(sg.mean, 1) + '</td><td>' + DC.fmt(sl.mean, 1) + '</td></tr></tbody></table></div></li></ol></div>' +
      '<h4>Claims check: is each claim supported by the data shown?</h4>' +
      DC.mcq('ht_1', 'Claim 1: "More ants were counted at the sugar cups than at the salt cups in this test (mean ' + DC.fmt(sg.mean, 1) + ' compared with ' + DC.fmt(sl.mean, 1) + ')."', [['Supported by the data shown', true, 'Yes. It describes exactly what was counted.'], ['Not supported by the data shown', false, 'The table shows ' + sg.sum + ' ants at sugar cups and ' + sl.sum + ' at salt cups, so this claim matches the data.']]) +
      DC.mcq('ht_2', 'Claim 2: "Ants always prefer sugar over salt."', [['Supported by the data shown', false, '"Always" goes far beyond one test on one patio. We do not know about other ants, places or days.'], ['Not supported by the data shown', true, 'Right. The data are from one test. They cannot show what ants always do.']]) +
      DC.mcq('ht_3', 'Claim 3: "Sugar makes ants happy."', [['Supported by the data shown', false, 'Happiness was not measured. Only ant counts were.'], ['Not supported by the data shown', true, 'Right. This is an interpretation about feelings that the counts cannot show.']]);
  }
  function sciCards() {
    return '<div class="scis" role="group" aria-label="Scientists">' + DC.SCIENTISTS.map((s) => {
      const st = DC.state.hall.sci[s.id], on = uiSci === s.id;
      return '<button type="button" class="sci' + (st && st.best ? ' done' : '') + '" data-act="sciPick" data-s="' + s.id + '" aria-pressed="' + on + '">' + DC.avatar(s.look) + '<b>' + esc(s.name) + '</b><small>' + esc(s.field) + '</small>' + (st && st.best ? '<small>✓ answered well</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  let uiSci = '';
  function sciPanel() {
    if (!uiSci) return '<p class="hint">Choose a scientist to hear a question. Each one asks something real researchers ask. Choose the answer you think a careful scientist would give, and read the feedback.</p>';
    const s = DC.SCIENTISTS.find((x) => x.id === uiSci), q = getQ(uiSci), st = DC.state.hall.sci[uiSci];
    return '<div class="card gold"><div class="row">' + DC.avatar(s.look, 64) + '<div><strong>' + esc(s.name) + '</strong><br><span class="hint">' + esc(s.trait) + '</span></div></div><div class="bubble" id="sciQ" tabindex="-1">' + esc(q.q) + '</div><div class="opts" role="group" aria-label="Your answer">' + q.o.map((o, i) => '<button type="button" class="opt' + (st && st.sel === i ? (o[1] === 2 ? ' right' : o[1] === 1 ? '' : ' wrong') : '') + '" data-act="sciAns" data-s="' + uiSci + '" data-i="' + i + '" aria-pressed="' + (st && st.sel === i) + '"><span aria-hidden="true">' + String.fromCharCode(65 + i) + '.</span><span>' + esc(o[0]) + '</span></button>').join('') + '</div>' +
      (st ? '<div class="fb ' + (q.o[st.sel][1] === 2 ? 'ok' : q.o[st.sel][1] === 1 ? 'part' : 'no') + '" role="status"><strong>' + (q.o[st.sel][1] === 2 ? 'Strong answer. ' : q.o[st.sel][1] === 1 ? 'Partly there. ' : 'Not quite. ') + '</strong>' + esc(q.o[st.sel][2]) + '</div>' : '') +
      '<p class="hint">' + esc(s.name.split(' ')[0] + ' ' + s.name.split(' ')[1]) + ' is a fictional character who has not checked or verified your research. The feedback here is built into this activity.</p></div>';
  }
  function areaTalk() { return '<div class="callout">These five scientists are <strong>fictional</strong>. They ask the kinds of questions real scientists ask. They have not reviewed or verified your work.</div><p>Scientists with a strong answer: <strong id="sciCount">' + bestCount() + '</strong> of 5 (talk with at least 3 to finish this chapter).</p>' + sciCards() + '<div id="sciPanel">' + sciPanel() + '</div>'; }
  function areaBooth() {
    return '<div class="card"><h4>How a conference works</h4><ol class="clean"><li>Scientists send in a short abstract describing their work.</li><li>Organizers put the work into a talk or a poster session.</li><li>On the day, presenters explain their work in a few minutes. Visitors ask questions and give suggestions.</li><li>Many scientists then improve their work, and some later write it up for a journal, where experts review it.</li></ol><p class="hint">Peer review by a journal is a separate step. Most conference posters and talks have not been through it.</p></div>' +
      '<details class="card"><summary><strong>Glossary: words scientists use</strong></summary><dl class="study" style="margin-top:.6rem">' + DC.GLOSSARY.map((g) => '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>').join('') + '</dl></details>' +
      '<div class="card"><h4>References</h4><ul class="clean">' + DC.REFS.map((r) => '<li>' + esc(r.text) + ' <a href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">doi:' + r.doi + '</a><br><span class="hint">' + esc(r.note) + '</span></li>').join('') + '</ul><div class="callout warn"><strong>About these references.</strong> Both records were found in PubMed and their titles, authors and DOIs were checked. The full texts were <em>not</em> read for this activity, so we only claim that they describe climbing (negative geotaxis) assays in fruit flies. The simulated experiment here is not a replication of either paper. Statements such as "fruit flies are ectotherms" are standard textbook biology. Please check a biology reference for details.</div></div>' +
      '<div class="card"><h4>Quick answers</h4><details><summary>Is this a real conference?</summary><p>No. It is a simulated learning activity. All speakers, times and rooms are fictional.</p></details><details><summary>Are the fruit fly data real?</summary><p>In Path A, no. They are simulated for learning. In Path B, the information is your own.</p></details><details><summary>Does a certificate mean my work was reviewed?</summary><p>No. Certificates here show participation in a simulated event only.</p></details></div>';
  }
  function areaReflect() {
    const r = DC.state.refl;
    return '<p>Find a seat on the rug and think quietly. Your answers stay on your device. They also appear in your final portfolio.</p>' + [['learned', 'What is one thing I learned about how scientists work?'], ['surprise', 'What surprised me, or what was harder than I expected?'], ['next', 'What question would I like to investigate next?']].map((x) => '<div class="field"><label for="rf-' + x[0] + '">' + x[1] + '</label><textarea id="rf-' + x[0] + '" data-bind="refl.' + x[0] + '" style="min-height:4rem">' + esc(r[x[0]]) + '</textarea></div>').join('');
  }
  const PANELS = { reg: areaReg, posters: areaPosters, stage: areaStage, talk: areaTalk, booth: areaBooth, reflect: areaReflect };

  function panelHTML() {
    if (!cur) return '<div class="callout">Choose a place on the map, or a button in the list, to explore. You can use the Tab key to move between places. There is no timer, and you can visit in any order.</div>';
    const a = DC.AREAS.find((x) => x.id === cur);
    return '<div class="card"><h3 id="areaH" tabindex="-1"><span aria-hidden="true">' + a.icon + '</span> ' + esc(a.name) + '</h3>' + PANELS[cur]() + '</div>';
  }
  function repaint(focusSel) {
    DC.$('#hotLayer').innerHTML = hotspots(); DC.$('#areaNavBox').innerHTML = areaNav(); DC.$('#areaPanel').innerHTML = panelHTML();
    const v = DC.$('#visitedCount'); if (v) v.textContent = visitedCount();
    const t = focusSel && DC.$(focusSel); if (t) t.focus({ preventScroll: false });
    DC.softUpdate();
  }
  DC.acts.area = (b) => { cur = b.dataset.a; DC.state.hall.visited[cur] = true; DC.save(); repaint('#areaH'); DC.say('You are at the ' + DC.AREAS.find((x) => x.id === cur).name); };
  DC.acts.sciPick = (b) => { uiSci = b.dataset.s; DC.$('#areaPanel').innerHTML = panelHTML(); const q = DC.$('#sciQ'); if (q) q.focus(); };
  DC.acts.sciAns = (b) => {
    const id = b.dataset.s, i = +b.dataset.i, q = getQ(id), sc = q.o[i][1];
    const prev = DC.state.hall.sci[id] || {}; DC.state.hall.sci[id] = { sel: i, score: sc, best: sc === 2 || !!prev.best }; DC.save();
    DC.$('#areaPanel').innerHTML = panelHTML(); const o = DC.$('#areaPanel [data-act=sciAns][data-i="' + i + '"]'); if (o) o.focus(); DC.softUpdate(); { const f = DC.$('#sciPanel .fb'); if (f) DC.say(f.innerText); }
  };
  /* mcq inside the hall: keep the hall open instead of re-rendering the whole chapter */
  const baseMcq = DC.acts.mcq;
  DC.acts.mcq = (b) => { if (DC.state.cur === 8) { const id = b.dataset.q, i = +b.dataset.i, ok = DC.mcqReg[id][i][1], prev = DC.state.det[id] || { tries: 0 }; DC.state.det[id] = { sel: i, ok: ok || !!prev.ok, tries: prev.tries + 1 }; DC.save(); DC.$('#areaPanel').innerHTML = panelHTML(); const o = DC.$('#areaPanel [data-q="' + id + '"] .opt:nth-child(' + (i + 1) + ')'); if (o) o.focus(); const f = DC.$('#areaPanel [data-q="' + id + '"] .fb'); if (f) DC.say(f.innerText); } else baseMcq(b); };

  DC.hallDone = () => visitedCount() === DC.AREAS.length && bestCount() >= 3;
  DC.register(8, {
    complete: () => DC.hallDone(),
    gate: () => 'Visit all six areas (' + visitedCount() + ' of 6 so far) and answer at least three scientists’ questions well (' + bestCount() + ' so far).',
    render() {
      if (!DC.state.path) return '<div class="callout warn">Choose a research path in Chapter 2 first. <button class="btn small" data-act="go" data-n="2" type="button">Go to Chapter 2</button></div>';
      return '<p class="lead">This is the conference hall. Walk around, read posters, listen to a talk and chat with scientists. Visited places turn green.</p><p class="gate">Areas visited: <strong id="visitedCount">' + visitedCount() + '</strong> of 6</p><div class="callout sim"><strong>Everything is pretend.</strong> The hall, the scientists and the posters are fictional. They have not verified your research.</div>' +
        '<div class="hallmap">' + hallSVG() + '<div id="hotLayer">' + hotspots() + '</div></div><div id="areaNavBox">' + areaNav() + '</div><div id="areaPanel">' + panelHTML() + '</div>';
    },
    mount() { uiSci = ''; DC.onBind('refl.', () => {}); }
  });
})();
