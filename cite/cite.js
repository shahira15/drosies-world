/* Cite Drosie's World: format tabs (WAI-ARIA tabs pattern), copy-to-clipboard and single-entry downloads.
   Without JavaScript every format is shown as plain text, so the page still works. */
(function () {
  'use strict';
  var status = document.getElementById('cite-status');

  function announce(msg) {
    if (!status) return;
    status.textContent = '';
    window.setTimeout(function () { status.textContent = msg; }, 30);
  }

  /* ---- Access date (undated web resources are cited with the reader's own access date) ---- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MLA_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(style, y, m, d) {
    switch (style) {
      case 'apa': case 'chi': return MONTHS[m - 1] + ' ' + d + ', ' + y;
      case 'mla': return d + ' ' + MLA_MONTHS[m - 1] + ' ' + y;
      case 'iso': return y + '-' + pad(m) + '-' + pad(d);
      case 'ris': return y + '/' + pad(m) + '/' + pad(d);
    }
    return '[access date]';
  }
  var accInput = document.getElementById('access-date');
  function paintDates() {
    var v = accInput && accInput.value, parts = v && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    document.querySelectorAll('.acc').forEach(function (el) {
      el.textContent = parts ? fmt(el.getAttribute('data-style'), +parts[1], +parts[2], +parts[3]) : '[access date]';
    });
  }
  if (accInput) {
    var t = new Date();
    accInput.value = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    accInput.max = accInput.value;
    var box = accInput.closest('.acc-box'); if (box) box.hidden = false;
    accInput.addEventListener('input', paintDates);
    paintDates();
  }

  /* ---- Tabs ---- */
  document.querySelectorAll('[data-cite]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role=tab]'));
    var panels = Array.prototype.slice.call(box.querySelectorAll('[role=tabpanel]'));
    box.classList.add('is-js');
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = e.key, to = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to >= 0) { e.preventDefault(); select(to, true); }
      });
    });
    select(0, false);
  });

  /* ---- Copy ---- */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  function copy(el) {
    var text = el.textContent.replace(/\s+$/, '');
    var rich = el.classList.contains('cite-rich');
    if (rich && navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
      // Keep italics when pasting into Word or Google Docs; plain text is the fallback flavour.
      var clone = el.cloneNode(true);
      clone.querySelectorAll('.acc').forEach(function (a) { a.replaceWith(document.createTextNode(a.textContent)); });
      var item = new ClipboardItem({
        'text/html': new Blob([clone.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      });
      return navigator.clipboard.write([item]).catch(function () { return plain(text); });
    }
    return plain(text);
  }
  function plain(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (btn) {
      var panel = btn.closest('[role=tabpanel]');
      var el = panel.querySelector('.cite-text');
      var label = btn.getAttribute('aria-label').replace(/^Copy /, '');
      copy(el).then(function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        announce('Copied ' + label);
      }, function () {
        btn.textContent = 'Press Ctrl+C';
        btn.classList.add('is-failed');
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        announce('Could not copy automatically. The citation is selected; press Control or Command plus C.');
      }).then(function () {
        window.setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('is-done', 'is-failed'); }, 2200);
      });
      return;
    }
    var dl = e.target.closest ? e.target.closest('[data-download]') : null;
    if (dl) {
      var code = dl.closest('[role=tabpanel]').querySelector('.cite-text').textContent;
      var type = dl.getAttribute('data-download') === 'ris' ? 'application/x-research-info-systems' : 'application/x-bibtex';
      var a = document.createElement('a');
      var url = URL.createObjectURL(new Blob([code + '\n'], { type: type + ';charset=utf-8' }));
      a.href = url; a.download = dl.getAttribute('data-filename');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      announce('Downloaded ' + dl.getAttribute('data-filename'));
    }
  });
})();
