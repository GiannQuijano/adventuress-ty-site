(function () {
  var d = document, w = window;
  var mobileQ = w.matchMedia('(max-width: 860px)');
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header shadow
  var bars = d.querySelectorAll('.mainnav, .mobilebar');
  function onScroll() {
    var s = w.scrollY > 10;
    bars.forEach(function (b) { b.classList.toggle('scrolled', s); });
  }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile drawer
  var openBtn = d.querySelector('[data-menu-open]');
  var drawer = d.getElementById('drawer');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (drawer) {
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) { var f = drawer.querySelector('button, a'); if (f) f.focus(); }
      else if (openBtn) openBtn.focus();
    }
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  d.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.body.classList.contains('menu-open')) setMenu(false); });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { d.body.classList.remove('menu-open'); }); });

  // Footer accordions: open on desktop, collapsed on mobile
  function syncFooter() {
    d.querySelectorAll('.foot-col.acc details').forEach(function (el) {
      if (mobileQ.matches) el.removeAttribute('open'); else el.setAttribute('open', '');
    });
  }
  syncFooter();
  if (mobileQ.addEventListener) mobileQ.addEventListener('change', syncFooter);
  d.querySelectorAll('.foot-col.acc summary').forEach(function (s) {
    s.addEventListener('click', function (e) { if (!mobileQ.matches) e.preventDefault(); });
  });

  // Reveal on scroll
  d.querySelectorAll('[data-stagger]').forEach(function (g) {
    var step = parseFloat(g.getAttribute('data-stagger')) || 0.12;
    Array.prototype.forEach.call(g.children, function (c, i) {
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
      c.style.setProperty('--d', (i * step).toFixed(2) + 's');
    });
  });
  var items = d.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Parallax on full-bleed images
  var par = d.querySelectorAll('[data-parallax]');
  if (par.length && !reduce) {
    var tick = false;
    var run = function () {
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        var vh = w.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      });
      tick = false;
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // Carousels
  d.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.track');
    var prev = c.querySelector('[data-prev]');
    var next = c.querySelector('[data-next]');
    var dotsWrap = c.querySelector('.dots');
    var loop = c.hasAttribute('data-loop');
    if (!track) return;
    function stepW() {
      var first = track.children[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function maxIndex() { return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / stepW())); }
    function index() { return Math.round(track.scrollLeft / stepW()); }
    function go(i) { track.scrollTo({ left: i * stepW(), behavior: reduce ? 'auto' : 'smooth' }); }
    function buildDots() {
      if (!dotsWrap) return;
      var n = maxIndex() + 1;
      dotsWrap.innerHTML = '';
      dotsWrap.style.display = n > 1 ? '' : 'none';
      for (var i = 0; i < n; i++) {
        var b = d.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', (c.getAttribute('data-label') || 'Slide') + ' ' + (i + 1));
        (function (k) { b.addEventListener('click', function () { go(k); }); })(i);
        dotsWrap.appendChild(b);
      }
      update();
    }
    function update() {
      var i = index(), m = maxIndex();
      if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      var none = m === 0;
      if (prev) { prev.disabled = none || (!loop && i <= 0); prev.style.visibility = none ? 'hidden' : ''; }
      if (next) { next.disabled = none || (!loop && i >= m); next.style.visibility = none ? 'hidden' : ''; }
    }
    if (prev) prev.addEventListener('click', function () { var i = index(); go(i <= 0 ? (loop ? maxIndex() : 0) : i - 1); });
    if (next) next.addEventListener('click', function () { var i = index(); go(i >= maxIndex() ? (loop ? 0 : i) : i + 1); });
    var t;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    w.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(buildDots, 150); });
    buildDots();
    // gentle autoplay where requested, paused on hover/touch
    var auto = parseInt(c.getAttribute('data-autoplay') || '0', 10);
    if (auto && !reduce) {
      var timer = null, paused = false;
      var start = function () { stop(); timer = setInterval(function () { if (!paused && maxIndex() > 0) { var i = index(); go(i >= maxIndex() ? 0 : i + 1); } }, auto); };
      var stop = function () { if (timer) clearInterval(timer); };
      c.addEventListener('mouseenter', function () { paused = true; });
      c.addEventListener('mouseleave', function () { paused = false; });
      c.addEventListener('touchstart', function () { paused = true; }, { passive: true });
      c.addEventListener('focusin', function () { paused = true; });
      start();
    }
  });

  // Trips filter
  var chips = d.querySelectorAll('[data-filter]');
  if (chips.length) {
    var cards = d.querySelectorAll('.tcard');
    var count = d.querySelector('[data-count]');
    var apply = function (k, push) {
      var n = 0;
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('data-filter') === k ? 'true' : 'false'); });
      cards.forEach(function (card, i) {
        var show = k === 'All' || card.getAttribute('data-kind') === k;
        card.classList.toggle('hide', !show);
        card.classList.remove('pop');
        if (show) { n++; void card.offsetWidth; card.style.animationDelay = (n * 0.05) + 's'; card.classList.add('pop'); }
      });
      if (count) count.textContent = n + (n === 1 ? ' trip' : ' trips');
      if (push && history.replaceState) {
        var u = new URL(w.location.href);
        if (k === 'All') u.searchParams.delete('filter'); else u.searchParams.set('filter', k);
        history.replaceState(null, '', u.toString());
      }
    };
    chips.forEach(function (ch) { ch.addEventListener('click', function () { apply(ch.getAttribute('data-filter'), true); }); });
    var q = new URLSearchParams(w.location.search).get('filter');
    if (q && d.querySelector('[data-filter="' + q + '"]')) apply(q, false);
  }

  // FAQ accordion
  d.querySelectorAll('.qa > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.parentElement, open = !qa.classList.contains('open');
      d.querySelectorAll('.qa.open').forEach(function (o) { if (o !== qa) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); } });
      qa.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Contact form: prefill from the link that brought the visitor here, then open an email
  var form = d.querySelector('form.contact');
  if (form) {
    var params = new URLSearchParams(w.location.search);
    var topic = params.get('topic'), trip = params.get('trip');
    var sel = form.querySelector('#c-trip'), topicSel = form.querySelector('#c-topic'), msg = form.querySelector('#c-msg');
    if (trip && sel) { Array.prototype.forEach.call(sel.options, function (o) { if (o.getAttribute('data-slug') === trip) sel.value = o.value; }); }
    if (topic && topicSel) { Array.prototype.forEach.call(topicSel.options, function (o) { if (o.getAttribute('data-key') === topic) topicSel.value = o.value; }); }
    if ((topic || trip) && w.location.hash !== '#message') { var target = d.getElementById('message'); if (target) setTimeout(function () { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 400); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (id) { var el = form.querySelector(id); return el ? el.value.trim() : ''; };
      var t = v('#c-topic'), tr = v('#c-trip');
      var subject = (t || 'Website message') + (tr && tr !== 'Select a trip' ? ' · ' + tr : '');
      var body = 'Name: ' + v('#c-name') + '\nEmail: ' + v('#c-email') + '\nPhone: ' + v('#c-phone') + '\nTopic: ' + t + '\nTrip of interest: ' + tr + '\n\n' + v('#c-msg');
      w.location.href = 'mailto:info@adventuressty.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var ok = d.querySelector('.form-ok'); if (ok) ok.classList.add('show');
    });
  }

  // Text-us bubble
  var tu = d.querySelector('.textus');
  if (tu) {
    var closed = false;
    try { closed = sessionStorage.getItem('at-bubble') === '1'; } catch (e) {}
    if (closed) tu.classList.add('closed');
    else setTimeout(function () { tu.classList.add('show'); }, 1400);
    var x = tu.querySelector('.bubble-x');
    if (x) x.addEventListener('click', function () { tu.classList.add('closed'); try { sessionStorage.setItem('at-bubble', '1'); } catch (e) {} });
  }

  // Year
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
