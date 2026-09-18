/* =========================================================================
   ZLATNICTVÍ VLASTIMIL KALAŠ, chování webu
   -------------------------------------------------------------------------
   Jeden soubor, moduly pod sebou. Každý si sám zkontroluje, jestli má
   na aktuální stránce co dělat, proto stačí připojit ho všude stejně.

   0  PLYNULÉ ROLOVÁNÍ (Lenis)     5  ODHALOVÁNÍ PŘI ROLOVÁNÍ
   1  HLAVIČKA                     6  GALERIE
   2  NAVIGACE                     7  LIGHTBOX
   3  HERO (prezentace, parallax)  8  PARTNEŘI
   4  ZPĚT NAHORU                  9  FORMULÁŘ POPTÁVKY
   ========================================================================= */

(function () {
  'use strict';

  var KALAS = window.KALAS = window.KALAS || {};
  var IMG = 'assets/img/gallery/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Jedna obsluha rolování pro všechny moduly, přepočet max. jednou za snímek */
  var scrollFns = [];
  function onScroll(fn) { scrollFns.push(fn); fn(window.scrollY); }
  (function () {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        scrollFns.forEach(function (fn) { fn(y); });
        ticking = false;
      });
    }, { passive: true });
  })();

  /* Zamčení stránky pod otevřeným menu nebo lightboxem */
  function lockScroll(on) {
    document.body.style.overflow = on ? 'hidden' : '';
    if (KALAS.lenis) { if (on) KALAS.lenis.stop(); else KALAS.lenis.start(); }
  }

  var icon = {
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>'
  };


  /* =======================================================================
     0  PLYNULÉ ROLOVÁNÍ
     -----------------------------------------------------------------------
     Lenis se načítá z CDN. Když se nenačte nebo návštěvník nechce pohyb,
     web jede na běžném rolování prohlížeče.
     ==================================================================== */
  function initSmoothScroll() {
    if (reduceMotion || typeof window.Lenis !== 'function') return;

    KALAS.lenis = new window.Lenis({
      autoRaf: true,
      lerp: 0.09,
      anchors: { offset: -90 },
      prevent: function (node) { return !!(node.closest && node.closest('[data-lightbox], [data-nav]')); }
    });
  }


  /* =======================================================================
     1  HLAVIČKA
     -----------------------------------------------------------------------
     .is-over     průhledná nad tmavou scénou (jen stránka s hero)
     .is-scrolled stránka je odrolovaná, hlavička se zmenší
     .is-hidden   při rolování dolů se schová, nahoru se vrátí
     ==================================================================== */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;

    var hero = $('[data-hero]');
    var lastY = window.scrollY;

    onScroll(function (y) {
      var menuOpen = header.classList.contains('menu-open');

      if (hero) header.classList.toggle('is-over', y < hero.offsetHeight - header.offsetHeight);
      header.classList.toggle('is-scrolled', y > 20);

      if (!menuOpen) {
        if (y > lastY + 6 && y > window.innerHeight * 0.6) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 120) header.classList.remove('is-hidden');
      }
      lastY = y;
    });
  }


  /* =======================================================================
     2  NAVIGACE (menu přes celou obrazovku)
     ==================================================================== */
  function initNav() {
    var burger = $('[data-burger]');
    var nav = $('[data-nav]');
    var header = $('[data-header]');
    if (!burger || !nav) return;

    function items() {
      return $$('a, button', nav).concat([burger]).filter(function (el) { return el.offsetParent !== null; });
    }
    function isOpen() { return nav.classList.contains('open'); }

    function open() {
      nav.classList.add('open');
      if (header) header.classList.add('menu-open');
      if (header) header.classList.remove('is-hidden');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Zavřít menu');
      lockScroll(true);
    }
    function close() {
      nav.classList.remove('open');
      if (header) header.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Otevřít menu');
      lockScroll(false);
    }

    burger.addEventListener('click', function () { isOpen() ? close() : open(); });
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

    var mq = window.matchMedia('(min-width: 75.01rem)');
    var onChange = function (e) { if (e.matches && isOpen()) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }


  /* =======================================================================
     3  HERO
     -----------------------------------------------------------------------
     Fotky se prolínají dokola. Vždy se dopředu stáhne jen ta další, takže
     první načtení zůstane rychlé. Kliknutí na přepínač prezentaci zastaví,
     aby měl návštěvník pohyb pod kontrolou.
     ==================================================================== */
  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;

    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var DUR = 5500;
    var i = 0;
    var timer = null;
    var playing = !reduceMotion && slides.length > 1;
    var visible = true;

    hero.style.setProperty('--slide-dur', DUR + 'ms');

    function imgOf(k) { return $('img', slides[(k + slides.length) % slides.length]); }
    function prime(k) {
      var img = imgOf(k);
      if (img && !img.getAttribute('src') && img.getAttribute('data-src')) img.src = img.getAttribute('data-src');
    }
    function ready(k) { var img = imgOf(k); return !img || (img.getAttribute('src') && img.complete); }

    function go(n) {
      var prev = slides[i];
      i = (n + slides.length) % slides.length;
      var next = slides[i];
      prime(i);
      prime(i + 1);

      if (prev !== next) {
        prev.classList.remove('is-active');
        prev.classList.add('was-active');
        window.setTimeout(function () {
          if (!prev.classList.contains('is-active')) prev.classList.remove('was-active');
        }, 2000);
        next.classList.add('is-active');
      }

      /* restart animace průběhu u aktivního přepínače */
      dots.forEach(function (d) { d.classList.remove('is-active'); d.removeAttribute('aria-current'); });
      void hero.offsetWidth;
      if (dots[i]) { dots[i].classList.add('is-active'); dots[i].setAttribute('aria-current', 'true'); }

    }

    function schedule() {
      window.clearTimeout(timer);
      if (!playing || !visible) return;
      timer = window.setTimeout(function () {
        /* další fotka ještě není stažená: chvíli počkej */
        if (!ready(i + 1)) { prime(i + 1); timer = window.setTimeout(schedule, 400); return; }
        go(i + 1);
        schedule();
      }, DUR);
    }

    function stop() {
      playing = false;
      window.clearTimeout(timer);
      hero.classList.remove('is-playing');
    }

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { stop(); go(k); });
    });

    if (playing) {
      hero.classList.add('is-playing');
      window.addEventListener('load', function () { prime(1); });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          hero.classList.toggle('is-playing', playing && visible);
          if (visible) go(i);
          schedule();
        }, { threshold: 0.2 }).observe(hero);
      } else {
        schedule();
      }
    }

    if (reduceMotion) return;

    /* Parallax: fotky ujíždějí pomaleji než text */
    var media = $('.hero__media', hero);
    var content = $('.hero__content', hero);
    onScroll(function (y) {
      var h = hero.offsetHeight;
      if (y > h) return;
      if (media) media.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
      if (content) {
        content.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
        content.style.opacity = Math.max(0, 1 - y / (h * 0.7)).toFixed(3);
      }
    });
  }


  /* =======================================================================
     4  ZPĚT NAHORU
     ==================================================================== */
  function initToTop() {
    var btn = $('[data-to-top]');
    if (!btn) return;

    onScroll(function (y) { btn.classList.toggle('show', y > window.innerHeight * 1.2); });

    btn.addEventListener('click', function () {
      if (KALAS.lenis) KALAS.lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }


  /* =======================================================================
     5  ODHALOVÁNÍ PŘI ROLOVÁNÍ
     ==================================================================== */
  function initReveal() {
    var items = $$('[data-reveal]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('shown'); });
      KALAS.watch = function (el) { el.classList.add('shown'); };
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
    KALAS.watch = function (el) { io.observe(el); };
  }


  /* =======================================================================
     6  GALERIE
     -----------------------------------------------------------------------
     <div data-gallery>                        celá galerie s filtry
     <div data-gallery data-pick="a,b,c"       vybrané fotky v daném pořadí
          data-more-link="galerie.html">       a na konci dlaždice s odkazem
     ==================================================================== */
  function initGallery() {
    var grid = $('[data-gallery]');
    if (!grid || !KALAS.photos) return;

    var filterBar = $('[data-filters]');
    var moreBtn = $('[data-more]');
    var emptyBox = $('[data-empty]');

    var pick = (grid.getAttribute('data-pick') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var moreLink = grid.getAttribute('data-more-link');
    var PAGE = 12;
    var filter = 'vse';
    var shown = PAGE;

    function list() {
      if (pick.length) {
        return pick.map(function (s) {
          return KALAS.photos.filter(function (p) { return p.s === s; })[0];
        }).filter(Boolean);
      }
      return filter === 'vse' ? KALAS.photos
        : KALAS.photos.filter(function (p) { return p.c === filter; });
    }

    function fadeIn(img) {
      if (img.complete && img.naturalWidth) img.classList.add('loaded');
      else img.addEventListener('load', function () { img.classList.add('loaded'); }, { once: true });
    }

    function draw(from) {
      var all = list();
      var part = pick.length ? all : all.slice(0, shown);
      from = from || 0;

      if (!from) grid.innerHTML = '';

      part.slice(from).forEach(function (p, k) {
        var idx = from + k;
        var src = IMG + 'thumb/' + p.s + '.jpg';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'shot';
        b.dataset.i = idx;
        b.setAttribute('data-reveal', '');
        b.style.setProperty('--delay', (k % 6) * 80 + 'ms');
        b.setAttribute('aria-label', 'Zvětšit fotografii: ' + p.t);
        b.innerHTML =
          '<img src="' + src + '" alt="' + p.t + '" width="700" height="700" loading="lazy" decoding="async">' +
          '<span class="shot__cap"><span>' + p.t + '</span>' +
          '<span class="shot__zoom" aria-hidden="true">' + icon.zoom + '</span></span>';
        grid.appendChild(b);
        fadeIn($('img', b));
        if (KALAS.watch) KALAS.watch(b);
      });

      if (moreLink) {
        var a = document.createElement('a');
        a.className = 'shot shot--more';
        a.href = moreLink;
        a.setAttribute('data-reveal', '');
        a.style.setProperty('--delay', '400ms');
        a.innerHTML =
          '<span><span class="shot__num">' + KALAS.photos.length + '</span>' +
          '<span class="shot__label">realizací</span></span>' +
          '<span class="shot__go">Celá galerie' + icon.arrow + '</span>';
        grid.appendChild(a);
        if (KALAS.watch) KALAS.watch(a);
      }

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
        if (!b || b.getAttribute('aria-pressed') === 'true') return;
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
        draw(before);
        var next = grid.querySelectorAll('.shot')[before];
        if (next) next.focus({ preventScroll: true });
      });
    }

    grid.addEventListener('click', function (e) {
      var t = e.target.closest('button.shot');
      if (t && KALAS.openLightbox) KALAS.openLightbox(parseInt(t.dataset.i, 10));
    });

    draw();
  }


  /* =======================================================================
     7  LIGHTBOX
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
    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function show(n) {
      var all = items();
      if (!all.length) return;
      i = (n + all.length) % all.length;
      var p = all[i];

      img.classList.remove('ready');
      window.setTimeout(function () {
        img.alt = p.t;
        img.src = IMG + p.s + '.jpg';
        if (img.complete && img.naturalWidth) img.classList.add('ready');
      }, 120);
      cap.innerHTML = '<strong>' + p.t + '</strong>Ateliér Vlastimil Kalaš, zakázková výroba';
      count.textContent = pad(i + 1) + ' / ' + pad(all.length);

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
      lockScroll(true);
      show(n);
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      lockScroll(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
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
     8  PARTNEŘI
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
     9  FORMULÁŘ POPTÁVKY
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
        '',
        'Jméno: ' + f.jmeno.value.trim(),
        'E-mail: ' + f.email.value.trim(),
        'Telefon: ' + (f.telefon.value.trim() || 'neuvedeno'),
        'Typ zakázky: ' + (f.typ ? f.typ.value : 'neuvedeno'),
        'Termín: ' + ((f.termin && f.termin.value.trim()) || 'neuvedeno'),
        '',
        'Představa:',
        f.zprava.value.trim()
      ].join('\n');

      window.location.href = 'mailto:' + MAIL +
        '?subject=' + encodeURIComponent('Poptávka šperku: ' + f.jmeno.value.trim()) +
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

    [initSmoothScroll, initHeader, initNav, initHero, initToTop, initReveal,
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
