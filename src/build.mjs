// Static site generator for adventuressty — renders the approved design into plain HTML pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(root, 'public');
const dataDir = path.join(root, 'data');
const VERSION = Date.now().toString(36);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (id) => `/img/${id}.webp`;
const PHONE = '(213) 220-0917';
const SMS = 'sms:+12132200917';
const EMAIL = 'info@adventuressty.com';
const SOC = {
  ig: 'https://www.instagram.com/adventuressty/',
  fb: 'https://www.facebook.com/adventuressTy',
  yt: 'https://www.youtube.com/c/AdventuressTy',
  tt: 'https://www.tiktok.com/@adventuressty',
};
const PAY_URL = 'https://adventuressty.com/payments/';
const SHOP_URL = 'https://adventuressty.com/shop/';

// ---------- Icons ----------
const I = {
  chat: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>`,
  ig: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6"/></svg>`,
  fb: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z"/></svg>`,
  yt: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/></svg>`,
  tt: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3v11a4 4 0 1 1-4-4"/><path d="M14 3c0 3 2 5 5 5"/></svg>`,
  play: (s = 34, fill = 'currentColor') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
  left: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>`,
  right: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 6.6 7 .7-5.3 4.8 1.6 7L12 17.5 5.7 21.1l1.6-7L2 9.3l7-.7z"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`,
  tick: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A7A52" stroke-width="2" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>`,
  pin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  close: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};
const stars5 = `<span class="stars">${I.star.repeat(5)}</span>`;
const expectIcons = {
  pace: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  lang: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  style: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
  car: 'M5 16h14M6 16l1.5-5h9L18 16M7 16v2M17 16v2M8 13.5h.5M15.5 13.5h.5',
  food: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 4 3 4v8',
  leisure: 'M3 20h18M6 20c0-5 3-9 6-9s6 4 6 9M12 11V4M12 4l5 3',
};

// ---------- Trips ----------
// Order, slugs and listing details follow the "All trips" board.
const TRIPS = [
  { file: 'Trip', slug: 'costa-rica', name: 'Costa Rica Escape', dates: 'Feb 11–17, 2027', month: 'February 2027', kind: 'Global', where: 'Arenal, Monteverde + Tamarindo', img: 'e5ce039f5ff62ed7023dc28d4cc875fb', select: 'Costa Rica Escape · Feb 2027' },
  { file: 'TripSedona', slug: 'jenesis-house-sedona', name: 'Jenesis House Wellness Retreat', dates: 'Apr 1–4, 2027', month: 'April 2027', kind: 'Retreat', where: 'Sedona, Arizona', img: '91f758d09c65db770629914016a1d059', select: 'Jenesis House Retreat · Apr 2027' },
  { file: 'TripMediterranean', slug: 'mediterranean-cruise', name: 'Mediterranean Cruise', dates: 'Aug 20–29, 2027', month: 'August 2027', kind: 'Cruise', where: 'Sailing from Barcelona', img: '9d8aa692d1bf1dd40abffdb34438c164', select: 'Mediterranean Cruise · Aug 2027' },
  { file: 'TripGrandCanyon', slug: 'grand-canyon-west', name: 'Grand Canyon West VIP', dates: 'Sep 9–11, 2027', month: 'September 2027', kind: 'Signature', where: 'Private helicopter + Skywalk', img: 'e71232d578fad18f68e59d7cafbba69d', select: 'Grand Canyon West VIP · Sep 2027' },
  { file: 'TripChina', slug: 'china', name: 'China Journey', dates: 'Oct 17–25, 2027', month: 'October 2027', kind: 'Global', where: 'Zhangjiajie + Fenghuang', img: '1706190a2e96c14c9c925da34f3b2159', select: 'China · Oct 2027' },
  { file: 'TripNewZealand', slug: 'new-zealand', name: 'New Zealand Journey', dates: 'Jan 21–29, 2028', month: 'January 2028', kind: 'Global', where: 'Queenstown to Christchurch', img: '906548611e3df1282be3ba4d6b984178', select: 'New Zealand · Jan 2028' },
  { file: 'TripPeru', slug: 'peru', name: 'Peru Journey', dates: 'Apr 25 – May 1, 2028', month: 'April 2028', kind: 'Global', where: 'Sacred Valley + Machu Picchu', img: '2eed5b5baf0da35b0396a2273d6db8f4', select: 'Peru · Apr 2028' },
  { file: 'TripSwissAlps', slug: 'amsterdam-swiss-alps', name: 'Amsterdam to the Swiss Alps', dates: 'May 23 – Jun 3, 2028', month: 'May 2028', kind: 'Global', where: 'Lucerne, Interlaken + Zurich', img: '3c08bc792d1a4e9ca9212e9f6274a72e', select: 'Amsterdam to the Swiss Alps · May 2028' },
  { file: 'TripSouthAfrica', slug: 'south-africa', name: 'South Africa Safari', dates: 'Dec 2–14, 2028', month: 'December 2028', kind: 'Signature', where: 'Cape Town to the bush', img: 'c1bf6c4192aff14dab41dedaf0262e51', select: 'South Africa + Zimbabwe · Dec 2028' },
];
for (const t of TRIPS) {
  t.T = JSON.parse(fs.readFileSync(path.join(dataDir, t.file + '.json'), 'utf8'));
  t.url = `/trips/${t.slug}/`;
  t.from = t.T.prices[0][1].replace(/^From\s+/i, '');
}
const bySlug = Object.fromEntries(TRIPS.map((t) => [t.slug, t]));
// Past trips shown with the "Sold out" stamp. These are real past Adventuress Ty trips.
const PAST = [
  { name: 'Dubai 2026 Adventure', dates: 'Oct 10–18, 2026', kind: 'Signature', where: 'Dubai, UAE', img: '11980c9ee130050eb8b6d1ecd8a7fb6a' },
  { name: 'Bali Adventure', dates: 'Jun 23–30, 2026', kind: 'Global', where: 'Bali, Indonesia', img: '18ecb13306e6c97cd6dfb3b641e8537e' },
  { name: 'Napa Valley Wine Weekend', dates: 'Sep 11–14, 2025', kind: 'Signature', where: 'Napa, California', img: '1d3cfcf25a7efcffaf424672cf20293a' },
];

const REVIEWS = [
  { name: 'Alana Atkins-Jamison', trip: 'Skydiving + snow tubing', text: 'Ty keeps the ball rolling, the energy high and the group organized. Whether it’s your 1st adventure or your 100th, I recommend!' },
  { name: 'Felicia Durrah', trip: 'Indoor skydiving', text: 'I was immediately welcomed and felt an instant sisterhood. What I loved most is that safety was placed at the forefront.' },
  { name: 'Angela McNair', trip: 'Catalina zipline', text: 'It’s the community and knowing someone you trust has the logistics down, so you can simply enjoy it worry free.' },
  { name: 'Tracy Alexander', trip: 'First trip with Ty', text: 'Ty’s energy is positive and infectious. This was my first adventure with Ty, but it definitely won’t be my last!' },
  { name: 'Keisha Stewart', trip: 'Returning traveler', text: 'Because of your group and your vision, I’ve been able to experience things that most people will only imagine.' },
  { name: 'Kat Leigh Ray', trip: 'Group weekend', text: 'Meeting all of the beautiful women, and one gentleman, was so uplifting. Positivity. Beauty. Strength. And so much fun.' },
  { name: 'Da’Jah U. Ausby', trip: 'Group weekend', text: 'That was such an amazing experience. We will definitely be joining and I will be bringing more ladies for sure!' },
  { name: 'Kendra Bennett', trip: 'Couples trip', text: 'I was nervous, but I loved every moment of it. My husband even enjoyed it! We’re already planning the next one.' },
];
const TRIP_QUOTES = [
  { text: 'Initially, I was shy and terrified. But by the end of the day I felt so good having taken a literal leap of faith and made a few friends along the way.', who: 'Angela McNair · Catalina zipline' },
  { text: 'I was immediately welcomed and felt an instant sisterhood. What I loved most is that safety was placed at the forefront.', who: 'Felicia Durrah · Indoor skydiving' },
  { text: 'Ty keeps the ball rolling, the energy high and the group organized. Whether it’s your 1st adventure or your 100th, I recommend!', who: 'Alana Atkins-Jamison · Skydiving + snow tubing' },
  { text: 'Ty’s energy is positive and infectious. This was my first adventure with Ty, but it definitely won’t be my last!', who: 'Tracy Alexander · First trip with Ty' },
  { text: 'Because of your group and your vision, I’ve been able to experience things that most people will only imagine.', who: 'Keisha Stewart · Returning traveler' },
  { text: 'I was nervous, but I loved every moment of it. My husband even enjoyed it! We’re already planning the next one.', who: 'Kendra Bennett · Couples trip' },
];

// ---------- Layout ----------
function head({ title, desc, ogImg, canonical }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0D3B31">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImg || img('80eb6a63d526b8d9366391dae46f10fe')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css?v=${VERSION}">
<script>document.documentElement.classList.add('js')</script>
</head>`;
}

function tripsDropdown(cls = 'dropdown') {
  return `<ul class="${cls}">${TRIPS.map((t) => `<li><a href="${t.url}">${esc(t.name)} <small>${esc(t.month)}</small></a></li>`).join('')}<li><a class="all" href="/trips/">View all trips</a></li></ul>`;
}

function header(active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header>
<div class="topbar">
  <div class="inner">
    <a class="logo" href="/" aria-label="Adventuress Ty home"><img src="/img/logo-white.png" alt="Adventuress Ty, moments you’ll talk about forever" width="168" height="64"></a>
    <div class="meta">
      <a href="${SMS}">${I.chat()}Text us at <strong>${PHONE}</strong></a>
      <span class="links"><a href="/contact/?topic=newsletter">Join our email list</a><span>|</span><a href="/contact/?topic=reservation">Account login</a></span>
    </div>
  </div>
</div>
<nav class="mainnav" aria-label="Main">
  <div class="inner">
    <ul class="menu">
      <li><a href="/"${cur('home')}>Home</a></li>
      <li class="has-dd"><a href="/trips/"${cur('trips')}>View trips ▾</a>${tripsDropdown()}</li>
      <li><a href="/#shop">Shop</a></li>
      <li><a href="/contact/?topic=gift">Gift cards</a></li>
      <li class="has-dd"><a href="/about/"${cur('about')}>About us ▾</a><ul class="dropdown" style="min-width:240px"><li><a href="/about/">Our story</a></li><li><a href="/about/#founder">Meet Ty + the team</a></li><li><a href="/about/#gallery">Past trip photos</a></li><li><a href="/#reviews">Reviews</a></li></ul></li>
      <li class="has-dd"><a href="/#journal">Journal ▾</a><ul class="dropdown" style="min-width:240px"><li><a href="/#journal">Latest stories</a></li><li><a href="${SOC.yt}" target="_blank" rel="noopener">Trip videos</a></li><li><a href="${SOC.ig}" target="_blank" rel="noopener">Instagram</a></li></ul></li>
      <li><a href="/#reviews">Reviews</a></li>
      <li><a href="/faqs/"${cur('faqs')}>FAQs</a></li>
      <li><a href="/contact/"${cur('contact')}>Contact us</a></li>
    </ul>
    <div class="social">${socialLinks()}</div>
  </div>
</nav>
<div class="mobilebar">
  <a class="logo" href="/" aria-label="Adventuress Ty home"><img src="/img/logo-white.png" alt="Adventuress Ty" width="126" height="48"></a>
  <button class="menu-btn" type="button" aria-label="Open menu" aria-controls="drawer" aria-expanded="false" data-menu-open>${I.menu}</button>
</div>
<a class="mobile-strip" href="${SMS}">Text us at <span>${PHONE}</span></a>
</header>
<div class="drawer-scrim" data-menu-close></div>
<aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">
  <div class="drawer-head"><img src="/img/logo-white.png" alt="Adventuress Ty" width="115" height="44"><button class="menu-btn" type="button" aria-label="Close menu" data-menu-close>${I.close}</button></div>
  <nav aria-label="Mobile">
    <a href="/">Home <span class="pm">›</span></a>
    <details><summary>View trips <span class="pm">+</span></summary>${TRIPS.map((t) => `<a href="${t.url}">${esc(t.name)} <small>${esc(t.month)}</small></a>`).join('')}<a href="/trips/"><b>All trips</b></a></details>
    <a href="/#shop">Shop <span class="pm">›</span></a>
    <a href="/contact/?topic=gift">Gift cards <span class="pm">›</span></a>
    <a href="/about/">About us <span class="pm">›</span></a>
    <a href="/#journal">Journal <span class="pm">›</span></a>
    <a href="/#reviews">Reviews <span class="pm">›</span></a>
    <a href="/faqs/">FAQs <span class="pm">›</span></a>
    <a href="/contact/">Contact us <span class="pm">›</span></a>
    <div class="drawer-cta"><a class="btn btn-mint" href="${SMS}">Text ${PHONE}</a><a class="btn btn-ghost-mint" href="/contact/?topic=newsletter">Join our email list</a></div>
    <div class="social">${socialLinks()}</div>
  </nav>
</aside>`;
}

function socialLinks(size = 18) {
  return `<a href="${SOC.ig}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig(size)}</a><a href="${SOC.fb}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb(size)}</a><a href="${SOC.yt}" target="_blank" rel="noopener" aria-label="YouTube">${I.yt(size)}</a><a href="${SOC.tt}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt(size)}</a>`;
}

function footer() {
  const col = (title, links, first) => `<div class="foot-col acc${first ? ' first-acc' : ''}"><details open><summary>${title} <span class="pm">+</span></summary><div>${links.map(([l, h, ext]) => `<a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}>${l}</a>`).join('')}</div></details></div>`;
  return `<footer>
<div class="foot-logo"><img src="/img/logo-white.png" alt="Adventuress Ty" width="252" height="96" loading="lazy"></div>
<div class="foot-main"><div class="inner">
  <div class="foot-col contact-col">
    <h3>Contact us</h3>
    <span>Cypress, CA 90630</span>
    <a href="${SMS}">Text us: ${PHONE}</a>
    <a href="mailto:${EMAIL}">${EMAIL}</a>
    <a class="btn btn-mint" href="/contact/">Send a message</a>
  </div>
  ${col('Learn more', [
    ['About Adventuress Ty', '/about/'], ['VIP Circle program', '/contact/?topic=vip'], ['Our partners', '/contact/?topic=partners'], ['The Journal', '/#journal'],
    ['Terms + conditions', '/policies/#terms'], ['Privacy policy', '/policies/#privacy'], ['Payment policies', '/policies/#payments'], ['Travel insurance', '/faqs/#on-the-trip'],
    ['Roommate matching', '/contact/?topic=roommate'], ['Payment plans + auto pay', '/faqs/#payments'], ['Join a waitlist', '/contact/?topic=waitlist']], true)}
  ${col('Client support', [
    ['Manage my reservation', '/contact/?topic=reservation'], ['Make a payment', PAY_URL, 1], ['Payment extension request', '/contact/?topic=extension'],
    ['Submit flight information', '/contact/?topic=flights'], ['Emergency contact form', '/contact/?topic=emergency'], ['Account questions', '/faqs/']])}
  ${col('Community', [
    ['Join the crew', '/contact/?topic=newsletter'], ['Past trip photos', '/about/#gallery'], ['Shop the collection', '/#shop'], ['For travel advisors', '/contact/?topic=advisors'], ['Media + press', SOC.yt, 1]])}
  <div class="foot-col follow"><h3>Follow us</h3><div class="circles">${socialLinks()}</div></div>
</div></div>
<div class="copyright">© <span data-year>2026</span> Adventuress Ty. All rights reserved.</div>
</footer>
<div class="textus">
  <span class="bubble"><button class="bubble-x" type="button" aria-label="Dismiss">×</button>Hi there, have a question?<br><strong>Text us here.</strong></span>
  <a class="fab" href="${SMS}" aria-label="Text us at ${PHONE}">${I.chat(26)}</a>
</div>
<script src="/assets/main.js?v=${VERSION}" defer></script>
</body>
</html>`;
}

function page({ file, title, desc, active, body, ogImg }) {
  const html = `${head({ title, desc, ogImg })}
<body>
${header(active)}
<main id="main">
${body}
</main>
${footer()}`;
  const dest = path.join(out, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

const tripCard = (t, badge) => `<a class="trip-card" href="${t.url}">
  <div class="ph"><img class="cover" src="${img(t.img)}" alt="${esc(t.name)}" loading="lazy">${badge ? `<span class="ribbon">${esc(badge)}</span>` : ''}</div>
  <div class="body"><span class="name">${esc(t.name)}</span><span class="where">${esc(t.homeWhere || t.where)}</span><span class="month-pill">${esc(t.month)}</span></div>
</a>`;

// ---------- Home ----------
function home() {
  const best = [
    { ...bySlug['costa-rica'], name: 'Costa Rica Escape', homeWhere: 'Arenal · Monteverde · Tamarindo', badge: 'Best seller' },
    { ...bySlug['jenesis-house-sedona'], img: 'b30357d8ae54da585c02f8e31e629593', badge: 'Few spots left' },
    { ...bySlug['mediterranean-cruise'], badge: 'New' },
  ];
  const styles = [
    { name: 'Signature experiences', sub: 'Private guides + helicopter views', img: 'e71232d578fad18f68e59d7cafbba69d', f: 'Signature' },
    { name: 'Wellness retreats', sub: 'Spa days + slow mornings', img: '91f758d09c65db770629914016a1d059', f: 'Retreat' },
    { name: 'Global journeys', sub: 'Peru, China, the Swiss Alps', img: '3c08bc792d1a4e9ca9212e9f6274a72e', f: 'Global' },
    { name: 'Coastal escapes', sub: 'Beachfront suites + sunset sails', img: '43aaf2efe9336c4fac21cfbeb6d6f627', f: 'Cruise' },
  ];
  const products = [
    { name: 'Adventuress Woman long sleeve', price: '$45', img: 'd11f87585fc241953d50c52b1b897aaa' },
    { name: 'Passport + luggage tag set', price: '$32', img: '4eef894f43cca6ca8ca7a32a75a55dfa' },
    { name: 'Silk travel scarf', price: '$58', img: '11980c9ee130050eb8b6d1ecd8a7fb6a' },
    { name: 'Weekender tote', price: '$68', img: '91f758d09c65db770629914016a1d059' },
  ];
  const posts = [
    { title: 'What to pack for a week in Costa Rica', date: 'October 14, 2026', img: '18ecb13306e6c97cd6dfb3b641e8537e' },
    { title: 'Five dinners we still talk about', date: 'September 30, 2026', img: '1d3cfcf25a7efcffaf424672cf20293a' },
    { title: 'Your first group trip: what to expect', date: 'September 2, 2026', img: '11980c9ee130050eb8b6d1ecd8a7fb6a' },
  ];
  const body = `
<section class="hero">
  <img class="bg-img" src="${img('80eb6a63d526b8d9366391dae46f10fe')}" alt="A traveler strolling the beach at golden hour" fetchpriority="high">
  <div class="shade"></div>
  <div class="center load-in">
    <a class="play" href="${SOC.yt}" target="_blank" rel="noopener" aria-label="Watch the Adventuress Ty film on YouTube">${I.play()}</a>
    <span class="watch">Watch the film</span>
  </div>
  <div class="cta-stem"><a class="btn btn-mint" href="/trips/">Explore all trips</a><span class="stem"></span></div>
</section>

<section class="brand-band on-dark">
  <div class="inner" data-stagger="0.15">
    <h1 class="h-xl">Moments you’ll talk about <em class="accent">forever</em></h1>
    <span class="rule"></span>
    <p>Welcome to Adventuress Ty. We curate small-group journeys around the world, from rainforest canopies to Mediterranean coastlines, with every detail arranged with care. Private guides, beautiful suites and candlelit dinners are already planned, so you simply arrive, exhale and savor it with a circle of travelers who quickly become friends.</p>
  </div>
</section>

<section class="sec best">
  <div class="wrap">
    <div class="sec-head" data-reveal><span class="eyebrow">Our travelers’ favorites</span><h2 class="h-lg">Best selling <em class="accent">journeys</em></h2></div>
    <div class="grid" data-stagger="0.12">${best.map((t) => tripCard(t, t.badge)).join('')}</div>
  </div>
</section>

<section class="booking">
  <img class="bg-img" src="${img('24a60a3e7c62b9b2243cf663e7fa675f')}" alt="A safari lodge terrace at dusk" loading="lazy">
  <div class="inner">
    <div class="panel on-dark" data-reveal="left">
      <h2>Booking is <em class="accent">simple</em></h2>
      <div class="step"><span class="num">1</span><span class="t"><b>Choose your journey</b><span>Every trip shows the dates, the day-by-day plan, what’s included and the price up front.</span></span></div>
      <div class="step"><span class="num">2</span><span class="t"><b>Reserve your spot</b><span>Hold your place with a deposit in minutes, then pay the balance on a plan that suits you.</span></span></div>
      <div class="step"><span class="num">3</span><span class="t"><b>Pack + unwind</b><span>Transfers, suites and guides are arranged. You simply arrive and savor it.</span></span></div>
      <div><a class="btn btn-mint" href="/trips/">View all trips</a></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:100px;padding-bottom:100px">
  <div class="wrap styles-panel on-dark" data-reveal="zoom">
    <div class="copy">
      <span class="eyebrow">Find your way to travel</span>
      <h2 class="h-lg">Travel styles to <em class="accent">explore</em></h2>
      <span class="rule"></span>
      <p>Whether you crave a private helicopter view, a quiet spa morning or a sunset on the sand, there is a journey designed around the way you love to travel.</p>
      <a class="btn btn-mint" href="/trips/">Explore trips now</a>
    </div>
    <div class="tiles" data-stagger="0.1">${styles.map((s) => `<a class="tile zoom" href="/trips/?filter=${s.f}"><img class="bg-img" src="${img(s.img)}" alt="" loading="lazy"><span class="lbl"><b>${esc(s.name)}</b><span>${esc(s.sub)}</span></span></a>`).join('')}</div>
  </div>
</section>

<section id="shop" class="sec shop-sec" style="padding-top:0;padding-bottom:100px">
  <div class="wrap shop-card" data-reveal>
    <div class="intro">
      <h2 class="h-lg" style="font-size:52px">The Adventuress Ty <em class="accent">shop</em></h2>
      <span class="sub">Your journey, your style</span>
      <p>Pieces made for the airport lounge, the dinner table and every photo in between. Wear the community wherever you go.</p>
    </div>
    <div class="carousel" data-carousel data-label="Products">
      <button class="arrow" type="button" data-prev aria-label="Previous products" style="border-color:#DCD5C8;width:48px;height:48px">${I.left}</button>
      <div class="track products">${products.map((p) => `<a class="product zoom" href="${SHOP_URL}" target="_blank" rel="noopener"><div class="ph"><img class="cover" src="${img(p.img)}" alt="${esc(p.name)}" loading="lazy"></div><span class="n">${esc(p.name)}</span><span class="p">${p.price}</span></a>`).join('')}</div>
      <button class="arrow" type="button" data-next aria-label="Next products" style="border-color:#DCD5C8;width:48px;height:48px">${I.right}</button>
    </div>
    <a class="btn btn-ombre" href="${SHOP_URL}" target="_blank" rel="noopener">Shop the collection now</a>
  </div>
</section>

<section id="journal" class="sec journal on-dark">
  <div class="wrap">
    <div class="head" data-reveal>
      <h2>The <em class="accent">Journal</em></h2><span class="vrule"></span>
      <p>Travel notes, packing lists and stories from the road, written by Ty and the travelers who make every journey unforgettable.</p>
    </div>
    <div class="posts" data-stagger="0.12">${posts.map((b) => `<a class="post zoom" href="${SOC.ig}" target="_blank" rel="noopener" style="text-decoration:none"><div class="ph"><img class="cover" src="${img(b.img)}" alt="" loading="lazy"></div><span class="t">${esc(b.title)}</span><span class="d">${esc(b.date)}</span></a>`).join('')}</div>
    <div style="display:flex;justify-content:center"><a class="btn btn-mint" href="${SOC.ig}" target="_blank" rel="noopener">View more</a></div>
  </div>
</section>

<section id="reviews" class="reviews">
  <div class="inner">
    <div class="sec-head" data-reveal style="gap:14px"><h2 class="h-lg">Here’s what our <em class="accent">travelers say</em></h2><span class="rating">${stars5}<strong>5-star stories</strong> from our travelers</span></div>
    <div class="carousel mob-under" data-carousel data-loop data-autoplay="6000" data-label="Show reviews from">
      <button class="arrow" type="button" data-prev aria-label="Previous reviews">${I.left}</button>
      <div class="track review-track">${REVIEWS.map((q) => `<figure class="review">${stars5}<blockquote>“${esc(q.text)}”</blockquote><figcaption><b>${esc(q.name)}</b><span>${esc(q.trip)}</span></figcaption></figure>`).join('')}</div>
      <button class="arrow" type="button" data-next aria-label="Next reviews">${I.right}</button>
      <div class="dots" style="flex-basis:100%;margin-top:6px"></div>
    </div>
  </div>
</section>

<section class="feature on-dark">
  <img class="bg-img" src="${img('18ee4ac631fcb7c293f10fa8fc919e96')}" alt="" loading="lazy">
  <div class="inner">
    <div class="arch zoom" data-reveal="left"><img class="cover" src="${img('b30357d8ae54da585c02f8e31e629593')}" alt="The pool at Jenesis House in Sedona" loading="lazy"></div>
    <div class="copy" data-stagger="0.12">
      <span class="eyebrow">The 2027 wellness series</span>
      <h2><em class="accent">Jenesis House</em><br>Wellness Retreat</h2>
      <p>Four restorative days among Sedona’s red rocks: spa rituals, private pools, guided meditation and slow, candlelit dinners. April 1 to 4, 2027.</p>
      <div><a class="btn btn-mint" href="${bySlug['jenesis-house-sedona'].url}">View the retreat</a></div>
    </div>
  </div>
</section>

<section class="connected">
  <img class="bg-img" src="${img('9d8aa692d1bf1dd40abffdb34438c164')}" alt="Santorini at sunset" loading="lazy">
  <div class="shade"></div>
  <div class="center" data-stagger="0.12">
    <h2>Stay connected</h2>
    <a class="handle" href="${SOC.ig}" target="_blank" rel="noopener">@adventuressty</a>
    <div class="big-circles">${socialLinks(22)}</div>
  </div>
</section>`;
  page({ file: 'index.html', title: 'Adventuress Ty · Moments you’ll talk about forever', desc: 'Small-group journeys around the world with every detail arranged, from Costa Rica and Sedona to South Africa. Curated by Ty Vaughn.', active: 'home', body });
}

// ---------- All trips ----------
function trips() {
  const cards = [
    ...TRIPS.map((t) => `<article class="tcard" data-kind="${t.kind}">
  <a class="ph zoom" href="${t.url}" tabindex="-1" aria-hidden="true"><img class="cover" src="${img(t.img)}" alt="" loading="lazy"></a>
  <div class="body"><a class="name" href="${t.url}">${esc(t.name)}</a><span class="dates">${esc(t.dates)}</span><span class="where">${esc(t.where)}</span><span class="from">From ${esc(t.from)} per person</span><div class="cta-row"><a class="btn btn-ombre btn-sm" href="${t.url}">Learn more</a></div></div>
</article>`),
    ...PAST.map((t) => `<article class="tcard sold" data-kind="${t.kind}">
  <div class="ph"><img class="cover" src="${img(t.img)}" alt="${esc(t.name)}" loading="lazy"><div class="stamp"><span>SOLD OUT</span></div></div>
  <div class="body"><span class="name">${esc(t.name)}</span><span class="dates">${esc(t.dates)}</span><span class="where">${esc(t.where)}</span><div class="cta-row"><a class="btn btn-muted" href="/contact/?topic=waitlist">Join waitlist</a></div></div>
</article>`),
  ];
  const labels = [['All', 'All trips'], ['Global', 'Global journeys'], ['Signature', 'Signature experiences'], ['Retreat', 'Wellness retreats'], ['Cruise', 'Cruises']];
  const body = `
<section class="trips-hero">
  <img class="bg-img" src="${img('43aaf2efe9336c4fac21cfbeb6d6f627')}" alt="An arched window opening onto the sea" fetchpriority="high">
  <div class="shade"></div>
  <div class="glass load-in"><span class="w">Welcome</span><h1>To the Adventuress Ty family</h1><span class="s">— All trips —</span></div>
</section>
<section class="filters">
  <div class="inner">
    <div class="chips" role="group" aria-label="Filter trips">${labels.map(([k, l], i) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>
    <span class="count" data-count aria-live="polite">${cards.length} trips</span>
  </div>
</section>
<section class="sec" style="padding-top:72px">
  <div class="wrap trip-grid" data-stagger="0.06">${cards.join('')}</div>
</section>`;
  page({ file: 'trips/index.html', title: 'All trips · Adventuress Ty', desc: 'Every upcoming Adventuress Ty journey: Costa Rica, Sedona, the Mediterranean, Grand Canyon West, China, New Zealand, Peru, the Swiss Alps and South Africa.', active: 'trips', body, ogImg: img('43aaf2efe9336c4fac21cfbeb6d6f627') });
}

// ---------- Trip detail ----------
function tripPage(t) {
  const T = t.T;
  const labels = ['Itinerary pace', 'Native language', 'Travel style', 'Airport transfers', 'Cuisine', 'Leisure downtime'];
  const keys = ['pace', 'lang', 'style', 'car', 'food', 'leisure'];
  const photoPages = [];
  for (let i = 0; i < T.photos.length; i += 4) photoPages.push(T.photos.slice(i, i + 4));
  const n = T.prices.length;
  const box = (b, wide) => `<div class="box${wide ? ' wide' : ''}"><div class="bar ${b[1]}">${esc(b[0])}</div><ul>${b[2].map((l) => {
    const m = /^(Days? [\d–-]+:)\s*(.*)$/.exec(l);
    return `<li><span>${m ? `<b>${esc(m[1])}</b> ${esc(m[2])}` : esc(l)}</span></li>`;
  }).join('')}</ul></div>`;
  const idx = TRIPS.indexOf(t);
  const nextTrips = [1, 2, 3].map((k) => TRIPS[(idx + k) % TRIPS.length]);
  const reserveHref = `/contact/?topic=reserve&trip=${t.slug}`;
  const body = `
<section class="trip-hero">
  <img class="bg-img" src="${img(T.heroImg)}" alt="" fetchpriority="high">
  <div class="shade"></div>
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/trips/">All trips</a> / ${esc(T.title)}</nav>
  <div class="center load-in">
    <a class="play-sm" href="${SOC.yt}" target="_blank" rel="noopener" aria-label="Watch trip videos on YouTube">${I.play(22, '#F8F4EC')}</a>
    <h1>${esc(T.name)}</h1>
    <span class="dates">${esc(T.dates)}</span>
    <span class="stays">${esc(T.stays)}</span>
    <a class="btn btn-mint" href="#reserve">Book your trip</a>
  </div>
</section>

<section class="story">
  <div class="wrap grid">
    <div class="copy" data-stagger="0.12">
      <h2><span class="a">${esc(T.storyA)}</span><span class="b">${esc(T.storyB)}</span></h2>
      <p class="lead">${esc(T.p1)}</p>
      <p class="lead">${esc(T.p2)}</p>
    </div>
    <div class="arch zoom" data-reveal="right"><img class="cover" src="${img(T.storyImg[0])}" alt="${esc(T.storyImg[1])}" loading="lazy"></div>
  </div>
</section>

<section class="presence">
  <div class="wrap grid">
    <div class="left" data-reveal="left">
      <div class="ph zoom"><img class="cover" src="${img(T.presImg[0])}" alt="${esc(T.presImg[1])}" loading="lazy"></div>
      <div><h3>${esc(T.presA)} <em class="accent">${esc(T.presB)}</em></h3><p>${esc(T.presText)}</p></div>
    </div>
    <div class="highlights" data-reveal="right"><h3>Trip highlights:</h3><ul data-stagger="0.07">${T.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>
  </div>
</section>

<section class="wide-img"><img class="cover" data-parallax src="${img(T.wideImg[0])}" alt="${esc(T.wideImg[1])}" loading="lazy"></section>

<section class="expect-wrap">
  <div class="wrap expect" data-reveal>
    <h2 class="h-caps">What to expect</h2>
    <div class="grid" data-stagger="0.08">${T.expect.map((v, i) => `<div class="ex"><span class="ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${expectIcons[keys[i]]}"/></svg></span><span class="l">${labels[i]}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>
  </div>
</section>

<section class="photos-wrap">
  <div class="wrap photos carousel" data-carousel data-label="Show photos" style="flex-direction:column">
    <div class="track photo-track">${photoPages.map((pg) => `<div class="photo-page">${pg.map((p) => `<div class="ph zoom"><img class="cover" src="${img(p[0])}" alt="${esc(p[1])}" loading="lazy"></div>`).join('')}</div>`).join('')}</div>
    <div class="dots"></div>
  </div>
</section>

<section class="includes">
  <div class="inner">
    <h2 class="h-caps" data-reveal>Full package includes:</h2>
    <ul class="inc-grid" data-stagger="0.05">${T.includes.map((i) => `<li><span class="check">${I.check}</span>${esc(i)}</li>`).join('')}</ul>
    <a class="btn btn-ombre" href="#reserve" style="font-size:14px;padding:17px 38px">Book your trip</a>
  </div>
</section>

<section class="testi on-dark">
  <div class="inner">
    <h2 data-reveal>Testimonials</h2>
    <div class="carousel mob-under" data-carousel data-loop data-label="Show testimonials from" style="gap:24px">
      <button class="arrow light" type="button" data-prev aria-label="Previous testimonials">${I.left}</button>
      <div class="track quote-track">${TRIP_QUOTES.map((q) => `<figure class="quote"><span class="st" aria-label="5 stars">★★★★★</span><blockquote>“${esc(q.text)}”</blockquote><figcaption>${esc(q.who)}</figcaption></figure>`).join('')}</div>
      <button class="arrow light" type="button" data-next aria-label="Next testimonials">${I.right}</button>
      <div class="dots light" style="flex-basis:100%;margin-top:6px"></div>
    </div>
  </div>
</section>

<section class="recap">
  <div class="inner">
    <a class="l" href="${SOC.yt}" target="_blank" rel="noopener">
      <span class="thumb"><img class="cover" src="${img(T.recapImg)}" alt="" loading="lazy"><span>${I.play(34, '#FFFFFF')}</span></span>
      <span style="display:flex;flex-direction:column;gap:6px"><span class="k">Trip recap</span><span class="t">${esc(T.recap[0])} <em class="accent" style="color:#9ADBBE">${esc(T.recap[1])}</em> ${esc(T.recap[2])}</span></span>
    </a>
    <a class="btn btn-ghost-mint" href="${SOC.yt}" target="_blank" rel="noopener">Watch the video</a>
  </div>
</section>

<section class="rooms">
  <div class="wrap inner">
    <div class="sec-head" data-reveal><h2 class="h-caps">Accommodation details</h2><span class="pin">${I.pin}${esc(T.staysLine)}</span></div>
    ${T.rooms.map((r, i) => `<div class="room${i % 2 ? ' rev' : ''}">
      <div class="ph zoom" data-reveal="${i % 2 ? 'right' : 'left'}"><img class="cover" src="${img(r[2])}" alt="${esc(r[0])}" loading="lazy"></div>
      <div class="card" data-reveal="${i % 2 ? 'left' : 'right'}">
        <span class="n1">${esc(r[1])}</span><h3>${esc(r[0])}</h3><p>${esc(r[3])}</p>
        <span class="rd">Room details</span><ul>${r[4].map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    </div>`).join('')}
  </div>
</section>

<section id="reserve" class="reserve">
  <div class="card" data-reveal="zoom">
    <h2 class="h-lg">Reserve your trip <em class="accent">now</em></h2>
    <div class="prices n${n}" data-stagger="0.1">${T.prices.map((p) => `<div class="price"><span class="lb">${esc(p[0])}</span><span class="amt">${esc(p[1])}</span><span class="nt">per person · ${esc(p[2])}</span></div>`).join('')}</div>
    <span class="deposit">Hold your spot with a <strong>${esc(T.deposit[0])}</strong> ${esc(T.deposit[1])}</span>
    <a class="btn btn-ombre btn-lg" href="${reserveHref}">Book now</a>
    <span class="spots">${esc(T.spots)}</span>
    <span class="pay-link">Already reserved? <a href="${PAY_URL}" target="_blank" rel="noopener">Make a payment</a></span>
  </div>
</section>

<section class="info">
  <div class="wrap inner">
    <h2 class="h-caps" style="margin-bottom:16px" data-reveal>Additional information</h2>
    <div class="info-grid" data-stagger="0.08">${T.info.map((b) => box(b)).join('')}</div>
    ${T.wide.map((b) => `<div data-reveal>${box(b, true)}</div>`).join('')}
  </div>
</section>

<section class="more-trips">
  <div class="wrap">
    <div class="sec-head" data-reveal><span class="eyebrow">Keep exploring</span><h2 class="h-lg">More <em class="accent">journeys</em></h2></div>
    <div class="grid" data-stagger="0.12">${nextTrips.map((x) => tripCard(x)).join('')}</div>
  </div>
</section>`;
  page({ file: `trips/${t.slug}/index.html`, title: `${T.title} · ${T.dates} · Adventuress Ty`, desc: `${T.storyA} ${T.storyB}. ${T.dates}. ${T.p1}`.slice(0, 300), active: 'trips', body, ogImg: img(T.heroImg) });
}

// ---------- About ----------
function about() {
  const gal = [
    ['9d8aa692d1bf1dd40abffdb34438c164', 'Sunset over Santorini', 420], ['eeb10c5eaf3cbd02c928364e6d2cd86c', 'Arched suite opening onto the sea', 560], ['91f758d09c65db770629914016a1d059', 'Infinity pool in the trees', 340],
    ['c1bf6c4192aff14dab41dedaf0262e51', 'Safari bath at dusk', 460], ['1d3cfcf25a7efcffaf424672cf20293a', 'Candlelit dinner table', 380], ['80eb6a63d526b8d9366391dae46f10fe', 'Golden-hour beach walk', 560],
    ['24a60a3e7c62b9b2243cf663e7fa675f', 'Safari lodge terrace', 340], ['18ecb13306e6c97cd6dfb3b641e8537e', 'Morning light through palms', 420], ['e5ce039f5ff62ed7023dc28d4cc875fb', 'Horseback on a Costa Rica beach', 460],
    ['3c08bc792d1a4e9ca9212e9f6274a72e', 'Swiss Alpine village', 380], ['e71232d578fad18f68e59d7cafbba69d', 'Grand Canyon at sunset', 520], ['906548611e3df1282be3ba4d6b984178', 'New Zealand lakes and peaks', 360],
  ];
  const why = ['Every detail arranged: boutique hotels, private transfers, guides and reservations.', 'A warm, welcoming circle of travelers. Come solo and leave with sisters.', 'Clear pricing, a simple deposit and flexible payment plans.', 'Ty and her team travel with you, from the first toast to the last goodbye.'];
  const team = [['c2b78b92a33fdedebf400eb2a7793a99', 'Jerusha Day', 'Assistant'], ['7895d0c1fd018513bd7fea2b1614f47b', 'Mikaela Davis', 'Film + editor'], ['b3b89389ecd67316295dad2ec5fddda2', 'Ashley Hopson', 'Social media manager']];
  const body = `
<section class="page-band"><div class="load-in"><h1>About us</h1><div class="rule"></div></div></section>

<section class="sec about-who" style="padding-top:110px;padding-bottom:110px">
  <div class="wrap overlap">
    <div class="ph arch zoom" data-reveal="left"><img class="cover" src="${img('4eef894f43cca6ca8ca7a32a75a55dfa')}" alt="A champagne toast at a group dinner" loading="lazy"></div>
    <div class="panel on-dark" data-reveal="right" style="--d:.15s">
      <span class="eyebrow" style="font-weight:500">Our story</span>
      <h2>Who is <em class="accent">Adventuress Ty?</em></h2>
      <p>Adventuress Ty is a curated group-travel collective founded by Ty Vaughn for women who want to see the world beautifully and together. From candlelit dinners in Costa Rica to sunsets over Santorini, every journey is planned down to the last detail, so all you do is arrive, exhale and savor it.</p>
      <a class="btn btn-mint" href="/contact/?topic=newsletter">Join the crew</a>
    </div>
  </div>
</section>

<section class="sec about-card" style="background:#1E2326;padding-top:110px;padding-bottom:110px">
  <div class="whitecard" data-reveal>
    <span class="kick">Seamlessly planned, effortlessly enjoyed.</span>
    <h2>We take care of every detail, so the only thing you have to plan is what to wear to dinner.</h2>
    <span class="rule em"></span>
    <p>Small groups, beautiful hotels and an itinerary that leaves room to breathe. Our travelers come for the destination and stay for the company.</p>
    <div class="why">
      <div class="arch zoom" data-reveal="left"><img class="cover" src="${img('80eb6a63d526b8d9366391dae46f10fe')}" alt="A traveler walking the beach at golden hour" loading="lazy"></div>
      <div class="copy">
        <h3><em class="accent">Why travel with</em> Adventuress Ty?</h3>
        <ul class="ticks" data-stagger="0.1">${why.map((w) => `<li>${I.tick}<span>${w}</span></li>`).join('')}</ul>
        <a class="btn btn-ombre" href="/trips/">View all trips</a>
      </div>
    </div>
  </div>
</section>

<section class="mission">
  <div class="box2" data-stagger="0.15">
    <h2>Our mission</h2><span class="rule"></span>
    <p>To bring people together to explore the beautiful world through elevated, thoughtfully curated journeys, and to make every traveler feel welcomed, cared for and celebrated.</p>
  </div>
</section>

<section id="founder" class="founder">
  <div class="wrap grid">
    <div class="arch zoom" data-reveal="left"><img class="cover" src="${img('11242687c8fa0fce7efab4f82db9fa92')}" alt="Ty Vaughn, founder of Adventuress Ty" loading="lazy"></div>
    <div class="copy" data-stagger="0.1">
      <span class="eyebrow" style="font-weight:500">About the founder</span>
      <h2>Meet Ty Vaughn</h2>
      <span class="tag">A visionary in curated travel</span>
      <span class="rule em"></span>
      <p>Ty Vaughn didn’t grow up traveling. When she discovered it, it felt like an awakening, and she began bringing friends along. What started as a few friends on a weekend away has grown into a community that sails the Mediterranean, dines under the stars and takes in the world’s most breathtaking views together.</p>
      <p>Ty personally curates every itinerary and travels with each group. Her philosophy is simple: “If it’s not an adventure, then it’s not worth it.” Her team, Jerusha Day, Mikaela Davis and Ashley Hopson, makes sure every moment is captured and every guest is cared for.</p>
      <div class="team">${team.map((m) => `<div class="member"><div class="av"><img class="cover" src="${img(m[0])}" alt="${m[1]}" loading="lazy"></div><div><b>${m[1]}</b><span>${m[2]}</span></div></div>`).join('')}</div>
    </div>
  </div>
</section>

<section id="gallery" class="gallery on-dark">
  <div class="wrap">
    <div class="head" data-reveal><h2>Where will you go <em class="accent">next?</em></h2><div class="line"></div><a class="btn btn-mint" href="/trips/">Explore trips</a></div>
    <div class="masonry">${gal.map((g) => `<div class="ph zoom" data-reveal style="height:${g[2]}px;--ar:3/${(4 * g[2] / 460).toFixed(2)}"><img class="cover" src="${img(g[0])}" alt="${g[1]}" loading="lazy"></div>`).join('')}</div>
  </div>
</section>`;
  page({ file: 'about/index.html', title: 'About us · Adventuress Ty', desc: 'Adventuress Ty is a curated group-travel collective founded by Ty Vaughn. Meet Ty and the team.', active: 'about', body, ogImg: img('11242687c8fa0fce7efab4f82db9fa92') });
}

// ---------- Contact ----------
function contact() {
  const topics = [['general', 'General question'], ['reserve', 'Reserve my spot'], ['reservation', 'Manage my reservation'], ['extension', 'Payment extension request'], ['flights', 'Submit flight information'], ['emergency', 'Emergency contact form'], ['roommate', 'Roommate matching'], ['waitlist', 'Join a waitlist'], ['newsletter', 'Join the email list'], ['gift', 'Gift cards'], ['vip', 'VIP Circle program'], ['partners', 'Partnerships'], ['advisors', 'Travel advisors']];
  const links = [['Upcoming trips', '/trips/'], ['Frequently asked questions', '/faqs/'], ['Make a payment', PAY_URL, 1], ['Manage my reservation', '/contact/?topic=reservation'], ['Payment extension request', '/contact/?topic=extension'], ['Submit flight information', '/contact/?topic=flights'], ['Emergency contact form', '/contact/?topic=emergency'], ['Roommate matching', '/contact/?topic=roommate']];
  const body = `
<section class="contact-hero">
  <img class="bg-img" src="${img('43aaf2efe9336c4fac21cfbeb6d6f627')}" alt="An arched suite opening onto the sea" fetchpriority="high">
  <div class="shade"></div>
  <div class="glass load-in"><h1>Contact us</h1><div class="rule" style="width:72px;margin:8px auto 0"></div></div>
</section>

<section class="sec contact-touch" style="padding-top:110px;padding-bottom:110px">
  <div class="wrap overlap flip">
    <div class="ph arch zoom" data-reveal="right"><img class="cover" src="${img('18ecb13306e6c97cd6dfb3b641e8537e')}" alt="Morning light through the palms in a tropical suite" loading="lazy"></div>
    <div class="panel on-dark" data-reveal="left" style="--d:.15s">
      <h2 style="font-size:60px;line-height:1"><em class="accent">Get in touch</em></h2>
      <p style="font-size:16px">Questions about a journey, your reservation or a payment? We would love to hear from you. Text us at <a href="${SMS}" style="color:#9ADBBE">${PHONE}</a> or send a note below, and our team will reply within one business day.</p>
      <ul class="dotlist">${links.map(([l, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}>${l}</a></li>`).join('')}</ul>
      <div style="padding-top:6px"><a class="btn btn-mint" href="/contact/?topic=newsletter">Join the crew</a></div>
    </div>
  </div>
</section>

<section id="message" class="sec form-sec" style="padding-top:0;padding-bottom:120px;scroll-margin-top:70px">
  <div class="form-card" data-reveal>
    <div class="ph"><img class="cover" src="${img('1d3cfcf25a7efcffaf424672cf20293a')}" alt="A candlelit dinner table" loading="lazy"></div>
    <div class="body">
      <h2>Send us a <em class="accent" style="color:#9ADBBE">message!</em></h2>
      <p>Tell us a little about yourself and the journey you have in mind. Prefer email? Write to <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
      <form class="contact" novalidate>
        <div class="fgrid">
          <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" type="text" placeholder="Your full name" autocomplete="name" required></div>
          <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" placeholder="you@email.com" autocomplete="email" required></div>
          <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" placeholder="(000) 000-0000" autocomplete="tel"></div>
          <div class="field"><label for="c-trip">Trip of interest</label><select id="c-trip" name="trip"><option>Select a trip</option>${TRIPS.map((t) => `<option data-slug="${t.slug}">${esc(t.select)}</option>`).join('')}<option>General question</option></select></div>
        </div>
        <div class="field"><label for="c-topic">How can we help?</label><select id="c-topic" name="topic">${topics.map(([k, l]) => `<option data-key="${k}">${l}</option>`).join('')}</select></div>
        <div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="5" placeholder="How can we help?"></textarea></div>
        <button class="btn btn-mint" type="submit" style="align-self:flex-start">Send message</button>
        <p class="form-note">Sending opens your email app with your message ready to go to ${EMAIL}.</p>
        <div class="form-ok" role="status">Thank you! Your email app should open with your message. If it doesn’t, write to <a href="mailto:${EMAIL}" style="color:#9ADBBE">${EMAIL}</a> or text ${PHONE}.</div>
      </form>
    </div>
  </div>
</section>`;
  page({ file: 'contact/index.html', title: 'Contact us · Adventuress Ty', desc: `Questions about a journey, your reservation or a payment? Text ${PHONE} or email ${EMAIL}.`, active: 'contact', body, ogImg: img('43aaf2efe9336c4fac21cfbeb6d6f627') });
}

// ---------- FAQs ----------
function faqs() {
  const names = [['General', 'general'], ['Payments', 'payments'], ['Reservations', 'reservations'], ['On the trip', 'on-the-trip']];
  const qs = [["Who travels with Adventuress Ty?", "Do I need to be outdoorsy or experienced?", "How large are the groups?", "How do I hear about new trips first?"], ["How much is the deposit?", "Can I pay in installments?", "Are payments refundable?", "Can I request more time on a payment?"], ["What is the difference between double and single occupancy?", "I am traveling solo. Can you match me with a roommate?", "Are flights included?", "Can I join a waitlist for a sold-out trip?"], ["Do I need travel insurance?", "What should I pack?", "Who do I contact while traveling?"]];
  const as = [["Our journeys are designed for women who love beautiful places and good company, whether you are traveling solo or with friends. Most guests come on their own and leave with a circle of new friends. Partners and friends are always welcome too.", "Not at all. Every itinerary balances signature experiences with leisure time, and each activity is optional. We brief every group before we go, and Ty and her team travel with you the whole way.", "We keep groups intimate so every guest gets personal attention. Each trip page lists the spots available, and popular journeys sell out early.", "Join our email list. Early-bird pricing and first invitations go to the list before anywhere else."], ["Most journeys are reserved with a $520 deposit per person (shorter getaways, like the Grand Canyon or Sedona retreat, start at $312). The deposit and the remaining balance schedule are shown on every trip page.", "Yes. After your deposit you can pay your balance in monthly installments or set up auto pay. Every payment can be made from your trip link at any time.", "All payments are final, non-refundable and non-transferable. We strongly recommend travel insurance to protect your trip.", "Yes. Submit a payment extension request from Client Support before your due date and our team will follow up."], ["Double occupancy means you share a room with one other traveler and is priced per person. Single occupancy gives you a private room at a higher rate.", "Yes. Choose double occupancy and request roommate matching, and we will pair you with another traveler from the group.", "Most packages include hotels, ground transfers, guided experiences and many meals. International airfare is included only where the trip page says so. You can submit your flight details from Client Support.", "Yes. Join the waitlist on the trip page and we will reach out if a spot opens."], ["We strongly recommend it for every journey. It protects you if plans change, which matters because all payments are final.", "A detailed packing list and travel notes are emailed before departure, including dress codes for special dinners.", `Your trip leader travels with the group. You can also text us at ${PHONE}, and we ask every guest to complete an emergency contact form before departure.`]];
  let first = true;
  const body = `
<section class="page-band"><div class="load-in"><h1 style="text-transform:none">FAQs</h1><div class="rule"></div></div></section>
<section class="faq-sec">
  <div class="inner">
    <p class="intro" data-reveal>Have a question that isn’t answered below? Text us at <a href="${SMS}">${PHONE}</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
    ${names.map(([n, id], gi) => `<div class="faq-group" id="${id}">
      <div class="gh" data-reveal><h2>${n} questions</h2><i></i></div>
      <div data-stagger="0.06" style="display:flex;flex-direction:column;gap:12px">${qs[gi].map((q, qi) => { const open = first; first = false; return `<div class="qa${open ? ' open' : ''}"><button type="button" aria-expanded="${open}" aria-controls="a-${gi}-${qi}"><span>${esc(q)}</span><span class="sign" aria-hidden="true">+</span></button><div class="ans" id="a-${gi}-${qi}" role="region"><div><p>${esc(as[gi][qi])}</p></div></div></div>`; }).join('')}</div>
    </div>`).join('')}
    <div style="text-align:center;padding-top:10px" data-reveal><a class="btn btn-ombre" href="${SOC.fb}" target="_blank" rel="noopener">${I.fb()}Join our Facebook community</a></div>
  </div>
</section>`;
  page({ file: 'faqs/index.html', title: 'FAQs · Adventuress Ty', desc: 'Deposits, payment plans, roommates, flights, insurance and what to expect on an Adventuress Ty trip.', active: 'faqs', body });
}

// ---------- Policies ----------
function policies() {
  const body = `
<section class="page-band"><div class="load-in"><h1 style="font-size:56px">Policies</h1><div class="rule"></div></div></section>
<article class="prose">
  <h2 id="terms" data-reveal>Terms + conditions</h2>
  <ul data-reveal>
    <li>All sales are final. Payments are non-refundable and non-transferable.</li>
    <li>Registering holds your spot for 24 hours. Your spot is confirmed once payment is received.</li>
    <li>Each trip page lists exactly what is and isn’t included, along with the deposit and the final payment date.</li>
  </ul>
  <h2 id="payments" data-reveal>Payment policies</h2>
  <ul data-reveal>
    <li>Most journeys are reserved with a $520 deposit per person, which includes a $20 processing fee. Shorter getaways start at $312.</li>
    <li>After your deposit you can pay the balance in monthly installments or set up auto pay.</li>
    <li>Need more time? Send a <a href="/contact/?topic=extension">payment extension request</a> before your due date.</li>
    <li>Ready to pay? <a href="${PAY_URL}" target="_blank" rel="noopener">Make a payment</a>.</li>
  </ul>
  <h2 id="insurance" data-reveal>Travel insurance</h2>
  <p data-reveal>Travel insurance is highly recommended for every traveler. Because all payments are final, coverage protects your investment if plans change. Ask us which plans past travelers have used.</p>
  <h2 id="privacy" data-reveal>Privacy policy</h2>
  <p data-reveal>Adventuress Ty uses the details you share with us only to plan your trip and keep you informed about your reservation. Questions about your information? Email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
</article>`;
  page({ file: 'policies/index.html', title: 'Policies · Adventuress Ty', desc: 'Terms, payment policies, travel insurance and privacy for Adventuress Ty trips.', active: '', body });
}

function notFound() {
  const body = `
<section class="trips-hero" style="height:620px">
  <img class="bg-img" src="${img('43aaf2efe9336c4fac21cfbeb6d6f627')}" alt="">
  <div class="shade"></div>
  <div class="glass load-in"><span class="w">Off the map</span><h1>Page not found</h1><span class="s" style="letter-spacing:.12em;text-transform:none;font-size:16px">This page has wandered off. Let’s get you back on the trail.</span><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:16px"><a class="btn btn-mint" href="/">Home</a><a class="btn btn-ghost-mint" href="/trips/">All trips</a></div></div>
</section>`;
  page({ file: '404.html', title: 'Page not found · Adventuress Ty', desc: 'This page could not be found.', active: '', body });
}

// ---------- Build ----------
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
fs.copyFileSync(path.join(here, 'styles.css'), path.join(out, 'assets/styles.css'));
fs.copyFileSync(path.join(here, 'main.js'), path.join(out, 'assets/main.js'));
home(); trips(); TRIPS.forEach(tripPage); about(); contact(); faqs(); policies(); notFound();
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
console.log('Built', TRIPS.length + 7, 'pages into', out);
