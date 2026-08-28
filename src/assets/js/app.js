/* =========================================================================
   ZLATNICTVÍ VLASTIMIL KALAŠ — chování webu
   -------------------------------------------------------------------------
   Jeden soubor, moduly pod sebou. Každý si sám zkontroluje, jestli má
   na aktuální stránce co dělat — proto stačí připojit ho všude stejně.

   1  MOTIV (světlý / tmavý)     5  GALERIE
   2  NAVIGACE                   6  LIGHTBOX
   3  SCROLL (nahoru)            7  PARTNEŘI
   4  ODHALOVÁNÍ PŘI SCROLLU     8  FORMULÁŘ POPTÁVKY
   ========================================================================= */

(function () {
  'use strict';

  var KALAS = window.KALAS = window.KALAS || {};
  var IMG = 'assets/img/gallery/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var icon = {
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>'
  };


  /* =======================================================================
     1  MOTIV
     ==================================================================== */
  function initTheme() {
    var btn = $('[data-theme-btn]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = dark ? 'light' : 'dark';

      if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');

      try { localStorage.setItem('kalas-theme', next); } catch (e) { /* soukromý režim */ }

      btn.setAttribute('aria-label', next === 'dark' ? 'Přepnout na světlý motiv' : 'Přepnout na tmavý motiv');
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0C0B09' : '#FFFFFF');
    });
  }


  /* =======================================================================
     2  NAVIGACE (mobilní zásuvka)
     ==================================================================== */
  function initNav() {
    var burger = $('[data-burger]');
    var nav = $('[data-nav]');
    var backdrop = $('[data-backdrop]');
    if (!burger || !nav) return;

    function items() {
      return $$('a, button', nav).filter(function (el) { return el.offsetParent !== null; });
    }
    function isOpen() { return nav.classList.contains('open'); }

    function open() {
      nav.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var f = items(); if (f.length) f[0].focus();
    }
    function close() {
      nav.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () { isOpen() ? close() : open(); });
    if (backdrop) backdrop.addEventListener('click', close);
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && isOpen()) close(); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); burger.focus(); return; }
      if (e.key === 'Tab') {
        var f = items(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var mq = window.matchMedia('(min-width: 64.01rem)');
    var onChange = function (e) { if (e.matches && isOpen()) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }


  /* =======================================================================
     3  SCROLL — tlačítko zpět nahoru
     ==================================================================== */
  function initScroll() {
    var btn = $('[data-to-top]');
    if (!btn) return;

    var ticking = false;
    function update() {
      btn.classList.toggle('show', window.scrollY > window.innerHeight * 0.7);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }


  /* =======================================================================
     4  ODHALOVÁNÍ PŘI SCROLLU
     ==================================================================== */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('shown'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = en.target.getAttribute('data-delay');
        if (d) en.target.style.setProperty('--delay', d + 'ms');
        en.target.classList.add('shown');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
    KALAS.watch = function (el) { io.observe(el); };
  }


  /* =======================================================================
     5  GALERIE
     -----------------------------------------------------------------------
     <div data-gallery>                 … celá galerie s filtry
     <div data-gallery data-limit="8">  … jen ukázka bez filtrů
     ==================================================================== */
  function initGallery() {
    var grid = $('[data-gallery]');
    if (!grid || !KALAS.photos) return;

    var filterBar = $('[data-filters]');
    var moreBtn = $('[data-more]');
    var emptyBox = $('[data-empty]');

    var limit = parseInt(grid.getAttribute('data-limit') || '0', 10);
    var PAGE = 12;
    var filter = 'vse';
    var shown = limit || PAGE;

    function list() {
      return filter === 'vse' ? KALAS.photos
        : KALAS.photos.filter(function (p) { return p.c === filter; });
    }

    function draw() {
      var all = list();
      var part = all.slice(0, shown);

      grid.innerHTML = '';
      part.forEach(function (p, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'shot';
        b.dataset.i = i;
        b.setAttribute('aria-label', 'Zvětšit fotografii: ' + p.t);
        b.innerHTML =
          '<img src="' + IMG + 'thumb/' + p.s + '.jpg" alt="' + p.t + '" ' +
          'width="700" height="700" loading="lazy" decoding="async">' +
          '<span class="shot__cap"><span>' + p.t + '</span>' +
          '<span class="shot__zoom" aria-hidden="true">' + icon.zoom + '</span></span>';
        grid.appendChild(b);
      });

      if (emptyBox) emptyBox.classList.toggle('show', all.length === 0);

      if (moreBtn) {
        var rest = all.length - part.length;
        moreBtn.parentElement.style.display = rest > 0 ? '' : 'none';
        moreBtn.textContent = 'Zobrazit další (' + rest + ')';
      }

      KALAS.lightboxItems = all;
    }

    /* Filtry */
    if (filterBar) {
      KALAS.categories.forEach(function (cat) {
        var n = cat.id === 'vse' ? KALAS.photos.length
          : KALAS.photos.filter(function (p) { return p.c === cat.id; }).length;
        if (!n) return;

        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.dataset.filter = cat.id;
        b.setAttribute('aria-pressed', String(cat.id === filter));
        b.innerHTML = cat.label + ' <span class="count">' + n + '</span>';
        filterBar.appendChild(b);
      });

      filterBar.addEventListener('click', function (e) {
        var b = e.target.closest('[data-filter]');
        if (!b) return;
        filter = b.dataset.filter;
        shown = PAGE;
        $$('[data-filter]', filterBar).forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        draw();
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        var before = grid.querySelectorAll('.shot').length;
        shown += PAGE;
        draw();
        var next = grid.querySelectorAll('.shot')[before];
        if (next) next.focus();
      });
    }

    grid.addEventListener('click', function (e) {
      var t = e.target.closest('.shot');
      if (t && KALAS.openLightbox) KALAS.openLightbox(parseInt(t.dataset.i, 10));
    });

    draw();
  }


  /* =======================================================================
     6  LIGHTBOX
     ==================================================================== */
  function initLightbox() {
    var box = $('[data-lightbox]');
    if (!box) return;

    var img = $('[data-lb-img]', box);
    var cap = $('[data-lb-cap]', box);
    var count = $('[data-lb-count]', box);
    var closeBtn = $('[data-lb-close]', box);
    var i = 0;
    var lastFocus = null;

    function items() { return KALAS.lightboxItems || []; }

    function show(n) {
      var all = items();
      if (!all.length) return;
      i = (n + all.length) % all.length;
      var p = all[i];

      img.classList.remove('ready');
      img.alt = p.t;
      img.src = IMG + p.s + '.jpg';
      cap.innerHTML = '<strong>' + p.t + '</strong>Ateliér Vlastimil Kalaš — zakázková výroba';
      count.textContent = (i + 1) + ' / ' + all.length;

      [i + 1, i - 1].forEach(function (k) {
        var q = all[(k + all.length) % all.length];
        if (q) { var pre = new Image(); pre.src = IMG + q.s + '.jpg'; }
      });
    }

    function open(n) {
      if (!items().length) return;
      lastFocus = document.activeElement;
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      show(n);
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    KALAS.openLightbox = open;

    img.addEventListener('load', function () { img.classList.add('ready'); });
    closeBtn.addEventListener('click', close);
    $('[data-lb-prev]', box).addEventListener('click', function () { show(i - 1); });
    $('[data-lb-next]', box).addEventListener('click', function () { show(i + 1); });

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(i + 1);
      else if (e.key === 'ArrowLeft') show(i - 1);
      else if (e.key === 'Tab') {
        var f = $$('button', box);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
      startX = null;
    }, { passive: true });
  }


  /* =======================================================================
     7  PARTNEŘI
     ==================================================================== */
  function initPartners() {
    var cards = $('[data-partners]');
    if (cards && KALAS.partners) {
      KALAS.partners.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'card';
        a.href = p.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML =
          '<span class="tag">' + p.role + '</span>' +
          '<span class="card__title">' + p.name + '</span>' +
          (p.note ? '<span class="card__text">' + p.note + '</span>' : '') +
          '<span class="btn text">' + p.url.replace(/^https?:\/\//, '') + icon.out +
          '<span class="sr-only"> (otevře se v novém okně)</span></span>';
        cards.appendChild(a);
      });
    }

    var salons = $('[data-salons]');
    if (salons && KALAS.salons) {
      KALAS.salons.forEach(function (s) {
        var li = document.createElement('li');
        li.className = 'salon';
        li.innerHTML = '<b>' + s.name + '</b><span>' + s.city + '</span>';
        salons.appendChild(li);
      });
    }
  }


  /* =======================================================================
     8  FORMULÁŘ POPTÁVKY
     -----------------------------------------------------------------------
     Web je statický, proto se ověřená poptávka předá e-mailovému klientu.
     Napojení na server: přepiš funkci send() (viz README).
     ==================================================================== */
  function initForm() {
    var form = $('[data-form]');
    if (!form) return;

    var MAIL = 'vlastik@zlatnictvi-kalas.cz';
    var note = $('[data-form-note]', form);
    var submit = $('[type="submit"]', form);

    var rules = {
      jmeno:   { msg: 'Vyplňte prosím své jméno.', ok: function (v) { return v.trim().length >= 2; } },
      email:   { msg: 'Zadejte platnou e-mailovou adresu.', ok: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); } },
      telefon: { msg: 'Telefon zadejte např. jako +420 123 456 789.', ok: function (v) { return v.trim() === '' || /^[+0-9 ()\/-]{9,20}$/.test(v.trim()); } },
      zprava:  { msg: 'Popište prosím krátce svou představu (min. 10 znaků).', ok: function (v) { return v.trim().length >= 10; } },
      souhlas: { msg: 'Bez souhlasu nelze poptávku odeslat.', ok: function (v, el) { return el.checked; } }
    };

    function box(el) { return el.closest('.field') || el.closest('.consent-box'); }

    function mark(el, message) {
      var b = box(el); if (!b) return;
      b.classList.add('invalid');
      var t = $('.err span', b); if (t) t.textContent = message;
      el.setAttribute('aria-invalid', 'true');
    }
    function unmark(el) {
      var b = box(el); if (!b) return;
      b.classList.remove('invalid');
      el.removeAttribute('aria-invalid');
    }

    form.addEventListener('input', function (e) { if (rules[e.target.name]) unmark(e.target); });
    form.addEventListener('change', function (e) { if (rules[e.target.name]) unmark(e.target); });

    function send() {
      var f = form.elements;
      var body = [
        'Poptávka z webu zlatnictvi-kalas.cz',
        '-----------------------------------',
        'Jméno: ' + f.jmeno.value.trim(),
        'E-mail: ' + f.email.value.trim(),
        'Telefon: ' + (f.telefon.value.trim() || 'neuvedeno'),
        'Typ zakázky: ' + (f.typ ? f.typ.value : '—'),
        'Termín: ' + ((f.termin && f.termin.value.trim()) || 'neuvedeno'),
        '',
        'Představa:',
        f.zprava.value.trim()
      ].join('\n');

      window.location.href = 'mailto:' + MAIL +
        '?subject=' + encodeURIComponent('Poptávka šperku — ' + f.jmeno.value.trim()) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        if (rules[name].ok(el.value || '', el)) unmark(el);
        else { mark(el, rules[name].msg); if (!firstBad) firstBad = el; }
      });

      if (firstBad) {
        firstBad.focus();
        if (note) note.classList.remove('show');
        return;
      }

      submit.setAttribute('aria-disabled', 'true');
      window.setTimeout(function () {
        send();
        submit.removeAttribute('aria-disabled');
        if (note) { note.classList.add('show'); note.setAttribute('tabindex', '-1'); note.focus(); }
      }, 250);
    });
  }


  /* =======================================================================
     START
     ==================================================================== */
  function boot() {
    document.documentElement.classList.remove('no-js');

    [initTheme, initNav, initScroll, initReveal,
     initPartners, initLightbox, initGallery, initForm].forEach(function (fn) {
      try { fn(); }
      catch (err) { if (window.console) console.error('[KALAS]', fn.name, err); }
    });

    var y = $('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
