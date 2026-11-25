(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 十草（とくさ）の輪を描く */
  const ring = $('#tokusa-ring');
  if (ring) {
    const NS = 'http://www.w3.org/2000/svg';
    const n = 96;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r1 = 150 + (i % 3) * 3, r2 = 192 - (i % 2) * 6;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 200 + Math.cos(a) * r1);
      l.setAttribute('y1', 200 + Math.sin(a) * r1);
      l.setAttribute('x2', 200 + Math.cos(a) * r2);
      l.setAttribute('y2', 200 + Math.sin(a) * r2);
      l.setAttribute('stroke-width', i % 4 === 0 ? 2.2 : 1);
      ring.appendChild(l);
    }
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 200); c.setAttribute('cy', 200); c.setAttribute('r', 140);
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', 'rgba(250,246,238,.6)'); c.setAttribute('stroke-width', '.6');
    ring.appendChild(c);
  }

  /* ヒーローのスライド */
  const slides = $$('.hero-slides img');
  if (slides.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-on');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-on');
    }, 6500);
  }

  /* ヘッダー・スマホバー */
  const hd = $('.hd');
  const bar = $('.sp-bar');
  const hero = $('.hero');
  const onScroll = () => {
    const y = scrollY;
    const h = hero ? hero.offsetHeight : 0;
    hd.classList.toggle('is-solid', y > h - 90);
    bar && bar.classList.toggle('is-show', y > h * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ハンバーガー */
  const burger = $('.hd-burger');
  const setOpen = (open) => {
    hd.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!hd.classList.contains('is-open')));
  $$('.hd-nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  /* スクロールで現れる */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  $$('.rv, .curtain').forEach(el => io.observe(el));

  /* いま見ている章をナビに */
  const links = $$('.hd-nav a[href^="#"]');
  const secIO = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secIO.observe(s));

  /* お酒のタブ */
  const tabs = $$('.tabs [role="tab"]');
  const ink = $('.tab-ink');
  const moveInk = (t) => { if (!ink) return; ink.style.left = t.offsetLeft + 'px'; ink.style.width = t.offsetWidth + 'px'; };
  const select = (t, focus) => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    moveInk(t);
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });
  const cur = tabs.find(t => t.getAttribute('aria-selected') === 'true');
  if (cur) { requestAnimationFrame(() => moveInk(cur)); addEventListener('resize', () => moveInk($('.tabs [aria-selected="true"]'))); document.fonts && document.fonts.ready.then(() => moveInk($('.tabs [aria-selected="true"]'))); }

  /* 営業中かどうか（京都時間）。臨時休業は反映されません */
  const st = $('[data-status]');
  if (st) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const m = (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
    const open = 17 * 60 + 30, close = 22 * 60;
    const txt = $('.status-text', st);
    if (parts.weekday === 'Sun') txt.textContent = '本日は定休日です';
    else if (m < open) txt.textContent = '本日 17:30 から営業';
    else if (m < close) { txt.textContent = 'ただいま営業時間中'; st.classList.add('is-open'); }
    else txt.textContent = '本日の営業は終了しました';
  }

  const y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ===== アクセス計測 =====
     GA4 の測定ID（G-XXXXXXXXXX）を下に入れると計測が始まります。
     空のままなら何も送信しません。 */
  const GA_ID = '';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }
  /* 電話・地図・Instagram のクリック（来店につながる行動）を記録 */
  const where = (a) => a.closest('.hd') ? 'header' : a.closest('.sp-bar') ? 'sp_bar' : a.closest('.ft') ? 'footer'
    : (a.closest('section[id]') || {}).id || 'other';
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-track]');
    if (!a) return;
    const name = { tel: 'tel_click', map: 'map_click', instagram: 'instagram_click' }[a.dataset.track];
    if (name) gtag('event', name, { link_location: where(a), link_url: a.href, transport_type: 'beacon' });
  });
})();
