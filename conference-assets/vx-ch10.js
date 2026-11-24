/* Chapter 10, visual adventure: the Celebration. The backpack journey, the certificate reveal, printable materials and where to go next.
   Uses the original saved fields and print/download actions. The certificate is for a simulated educational experience, not an accredited award. */
(function () {
  'use strict';
  const DC = window.DC, vx = DC.vx, A = DC.art, esc = DC.esc;
  const allDone = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => DC.isDone(n));
  const NEXT = [['lab-notebook-academy.html', 'Lab Notebook Academy', 'book'], ['climbing-game.html', 'Climbing Challenge', 'ruler'], ['grow-your-own-fruit-fly.html', 'Grow Your Own Fruit Fly', 'flask'], ['lab/', 'Secret Fly Lab', 'vial'], ['drosie-genetics-lab/', 'Drosie Genetics Lab (older learners)', 'dots'], ['science-activities/', 'All science activities', 'star']];

  A.party = (claimed) => A.sky() + A.hills() + A.tree(110, 400, 1.15) + A.tree(870, 410, 1) + A.flowers() + A.bunting(24) +
    A.g('translate(480 300)', A.r(-120, 110, 240, 60, '#a97a46', 8, 'stroke="#8d6336" stroke-width="4"') + A.r(-90, 60, 180, 56, '#d9b45a', 8, 'stroke="#8d6336" stroke-width="4"') + A.r(-60, 20, 120, 46, '#c4655a', 8, 'stroke="#8d3f35" stroke-width="4"') + A.tx(0, 52, 28, '1', '#fff') + A.tx(0, 100, 30, '2', '#fff')) +
    (claimed ? A.g('translate(480 230)', A.c(0, 0, 46, '#ffe08a', 'stroke="#d9b45a" stroke-width="5"') + A.p('M-16 -4 l10 14 22 -24', 'none', 'stroke="#2d7a52" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"')) : '') +
    (claimed ? A.confetti(46) : A.confetti(14));

  vx.chapter(10, {
    gate: () => 'This is the last place.',
    render() {
      const s = DC.state, done = allDone(), claimed = !!s.fin.claimed && done, cards = vx.cards(), got = cards.filter((c) => c.earned()).length;
      const miss = DC.CHAPTERS.filter((c) => c.n < 10 && !DC.isDone(c.n));
      const say = !done ? ['Almost there! Finish the places with a gap below.', 'encourage'] : !claimed ? ['You did it! Press the stamp to get your certificate!', 'celebrate'] : ['Congratulations, ' + DC.name() + '! You shared real science.', 'celebrate'];
      const journey = '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Your research backpack: ' + got + ' of ' + cards.length + ' cards</p><div class="vx-tray" role="list" aria-label="Backpack cards">' + cards.map((c) => '<span role="listitem" class="vx-tool' + (c.earned() ? ' done' : '') + '" style="' + (c.earned() ? '' : 'border-style:dashed;background:#f6f1e1') + '">' + vx.icon(c.icon, 30) + '<span>' + esc(c.label) + (c.earned() ? '' : ' (not yet)') + '</span></span>').join('') + '</div><button type="button" class="vx-btn small ghost" data-act="vxPack">Open the backpack</button></div>';
      let step;
      if (!done) step = '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Places to finish first</p><div class="vx-tray">' + miss.map((c) => '<button type="button" class="vx-tool" data-act="go" data-n="' + c.n + '">' + vx.icon('map', 32) + '<span>' + esc((vx.PLACES && vx.PLACES[c.n] ? vx.PLACES[c.n] : c.title)) + '</span></button>').join('') + '</div></div>';
      else if (!claimed) step = '<div class="vx-panel gold" style="text-align:center"><button type="button" class="vx-stamp" data-act="finCert" aria-label="Claim my certificate">Claim my certificate</button></div>';
      else step = '<div class="vx-panel gold" id="certBox" tabindex="-1"><p class="vx-title" style="font-size:1.1rem;margin:0 0 .4rem">Your certificate</p>' + DC.certHTML() + '<div style="text-align:center;margin-top:.6rem">' + DC.badgeHTML('Conference participant') + '</div></div>';
      const acts = claimed ? '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Keep your work</p><div class="vx-tray" role="group" aria-label="Print or download">' +
        [['finPrintCert', 'badge', 'Certificate'], ['finPrintBadge', 'star', 'Badge'], ['finPrintAbs', 'abstract', 'Abstract'], ['finPrintPoster', 'poster', 'Poster'], ['finPrintRefl', 'heart', 'Reflection'], ['finPortfolio', 'pack', 'Portfolio file'], ['exportJson', 'data', 'Project data']].map((a) => '<button type="button" class="vx-tool" data-act="' + a[0] + '">' + vx.icon(a[1], 34) + '<span>' + a[2] + '</span></button>').join('') + '</div><p class="vx-note">Everything is made on this device. Nothing is uploaded. To save a PDF, choose “Save as PDF” in the print window.</p></div>' : '';
      const honest = vx.learn('What the certificate does and does not mean', '<ul style="margin:0;padding-left:1.1rem"><li>The certificate and badge are for taking part in a <strong>simulated</strong> learning event.</li><li>No scientist, university or journal has reviewed your work. The scientists in the hall were fictional.</li><li>Finishing does not prove what you learned. Your best evidence is the thinking in your own abstract, poster and answers.</li>' + (s.path === 'A' ? '<li>The fruit fly data were simulated. Real flies would vary more and need more groups.</li>' : '') + '</ul>');
      const next = '<div class="vx-panel"><p class="vx-title" style="font-size:1.05rem;margin:0 0 .3rem">Keep exploring Drosie’s World</p><div class="vx-tray">' + NEXT.map((n) => '<a class="vx-tool" href="' + n[0] + '" style="text-decoration:none">' + vx.icon(n[2], 34) + '<span>' + esc(n[1]) + '</span></a>').join('') + '<a class="vx-tool" href="conference-teacher-guide.html" style="text-decoration:none">' + vx.icon('clip', 34) + '<span>Guide for adults</span></a></div><div class="row"><button type="button" class="vx-btn small ghost" data-act="go" data-n="2">Try the other research path</button><button type="button" class="vx-btn small ghost" data-act="backup">Back up or erase my work…</button></div></div>';
      return '<div class="vx-stage"><div class="vx-main">' + vx.scene({ art: vx.svg(A.party(claimed), claimed ? 'A celebration with a winners’ podium, a gold check mark and confetti' : 'A garden with a podium and a little confetti'), hot: [] }) + vx.guide(say[1], say[0]) + '</div><div class="vx-side">' + step + journey + acts + '</div></div><div class="vx-stage stack"><div class="vx-main">' + next + honest + '</div></div>';
    }
  });
  const fin = DC.acts.finCert;
  DC.acts.finCert = (b) => { fin(b); vx.say('Certificate claimed. Congratulations!', 'celebrate'); };
})();
