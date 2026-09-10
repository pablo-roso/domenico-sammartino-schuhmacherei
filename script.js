/* ============================================================
   Schuhmacherei Sammartino — Seitenlogik
   Besonderheit: Die Werkstatt hat eine Mittagspause. Der Status
   unterscheidet deshalb drei Zustände — offen, Mittagspause,
   geschlossen —, weil "geschlossen" um 13:30 Uhr irreführend wäre.
   ============================================================ */
(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* Je Tag eine Liste von Fenstern. Montag bis Donnerstag zwei. */
  var HOURS = {
    1: [[10, 13], [14, 17]],
    2: [[10, 13], [14, 17]],
    3: [[10, 13], [14, 17]],
    4: [[10, 13], [14, 17]],
    5: [[10, 14]],
    6: [[10, 13]],
    0: []
  };
  var DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function fmt(v) {
    var h = Math.floor(v), m = Math.round((v - h) * 60);
    return h + ':' + (m < 10 ? '0' + m : m);
  }

  var now = new Date();
  var day = now.getDay();
  var dec = now.getHours() + now.getMinutes() / 60;
  var slots = HOURS[day] || [];

  var state = 'closed', until = null, next = null, nextWhen = null;

  for (var s = 0; s < slots.length; s++) {
    if (dec >= slots[s][0] && dec < slots[s][1]) { state = 'open'; until = slots[s][1]; break; }
  }

  if (state !== 'open') {
    // Mittagspause: nach einem Fenster, aber vor dem nächsten desselben Tages.
    for (var t = 0; t < slots.length; t++) {
      if (dec < slots[t][0]) { next = slots[t][0]; nextWhen = 'heute'; if (t > 0) state = 'break'; break; }
    }
    if (next === null) {
      for (var i = 1; i < 8; i++) {
        var d = (day + i) % 7;
        var list = HOURS[d] || [];
        if (!list.length) continue;
        next = list[0][0];
        nextWhen = i === 1 ? 'morgen' : 'am ' + DAYS[d];
        break;
      }
    }
  }

  var label;
  if (state === 'open') {
    label = 'Jetzt geöffnet — bis ' + fmt(until) + ' Uhr';
  } else if (state === 'break') {
    label = 'Mittagspause — wieder ab ' + fmt(next) + ' Uhr';
  } else {
    label = next !== null
      ? 'Geschlossen — wieder ' + nextWhen + ' ab ' + fmt(next) + ' Uhr'
      : 'Geschlossen';
  }

  var badge = document.getElementById('statusBadge');
  var text = document.getElementById('statusText');
  if (badge && text) {
    badge.hidden = false;
    badge.classList.add(state === 'open' ? 'is-open' : state === 'break' ? 'is-break' : 'is-closed');
    text.textContent = label;
  }

  var headerStatus = document.getElementById('headerStatus');
  if (headerStatus) {
    headerStatus.hidden = false;
    headerStatus.textContent = state === 'open' ? 'offen bis ' + fmt(until)
      : state === 'break' ? 'Mittagspause' : 'geschlossen';
    if (state === 'open') headerStatus.classList.add('is-open');
  }

  var list2 = document.getElementById('hoursList');
  if (list2) {
    var row = list2.querySelector('[data-day="' + day + '"]');
    if (row) row.classList.add('is-today');
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
