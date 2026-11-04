/* "Up next" block at the end of each case study.
   The four projects loop in order; the page finds itself by file name and shows the one after it,
   plus small links to the other two and back to all work. Keep this list in step with ME.projects in ../index.html. */
(() => {
  const P = [
    { file: 'licious.html',     title: 'Licious Discover',   keywords: 'Service design · Kiosk UX · Phygital retail', blurb: 'A supermarket-to-doorstep system that brings Licious into stores that don’t sell fresh meat.', image: '../photos/project-1.webp' },
    { file: 'syntra.html',      title: 'Syntra',             keywords: 'Phygital kiosk · Retail tech · AR/VR',        blurb: 'An interactive perfume finder you play like an instrument.', image: '../photos/project-2.webp' },
    { file: 'khajuri.html',     title: 'Khajuri',            keywords: 'Brand identity · Packaging · Craft',          blurb: 'A brand and packaging system for the handmade date-palm brooms of Madhya Pradesh.', image: '../photos/project-3.webp' },
    { file: 'pehli-payri.html', title: 'Pehli Payri Temple', keywords: 'Wayfinding · Signage · Visual identity',      blurb: 'An identity and sign system for a Shiva shrine in the Satpura hills of Chhindwara.', image: '../photos/project-4.webp' },
  ];
  const here = location.pathname.split('/').pop();
  const i = P.findIndex(p => p.file === here);
  const scroll = document.querySelector('.scroll');
  if (i < 0 || !scroll) return;
  const next = P[(i + 1) % P.length];
  const others = [P[(i + 2) % P.length], P[(i + 3) % P.length]];

  const css = `
  .nx{width:min(1312px,100% - 64px);margin:0 auto 120px;font-family:Inter,system-ui,sans-serif;color:var(--nx-text)}
  .nx-h{font:600 12px/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--nx-mute);margin:0 0 20px}
  .nx-card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);align-items:center;gap:56px;padding:20px;border-radius:24px;
    background:var(--nx-bg);text-decoration:none;color:inherit;transition:transform .3s,box-shadow .3s}
  .nx-card:hover{transform:translateY(-3px);box-shadow:0 18px 50px rgba(0,0,0,.12)}
  .nx-img{aspect-ratio:480/500;border-radius:16px;overflow:hidden;background:var(--nx-line)}
  .nx-img img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s}
  .nx-card:hover .nx-img img{transform:scale(1.03)}
  .nx-k{display:inline-block;font:600 11px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;
    padding:5px 8px;border-radius:6px;background:#E4D2EE;color:#141416}
  .nx-t{font-size:clamp(32px,4vw,52px);font-weight:600;letter-spacing:-.02em;line-height:1.08;margin:18px 0 14px}
  .nx-b{font-size:18px;line-height:1.55;color:var(--nx-sub);max-width:34ch}
  .nx-go{display:inline-flex;align-items:center;gap:10px;margin-top:32px;padding:13px 22px;border-radius:999px;font-weight:600;font-size:15px;
    background:var(--nx-text);color:var(--nx-bgpage)}
  .nx-go svg{width:16px;height:16px;transition:transform .3s}
  .nx-card:hover .nx-go svg{transform:translateX(4px)}
  .nx-more{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:28px}
  .nx-more span{font-size:14px;color:var(--nx-mute);margin-right:4px}
  .nx-more a{display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 8px;border-radius:999px;background:var(--nx-bg);
    color:inherit;text-decoration:none;font-size:14px;font-weight:600;transition:background .2s}
  .nx-more a:hover{background:var(--nx-line)}
  .nx-more a img{width:32px;height:32px;border-radius:50%;object-fit:cover}
  .nx-more a.all{padding:8px 16px}
  .nx-extra{margin-top:12px}
  .nx-extra a img{object-position:50% 85%}
  body{--nx-bg:#f3f3f5;--nx-line:#e6e6ea;--nx-text:#141416;--nx-sub:#5c5c63;--nx-mute:#8e8e95;--nx-bgpage:#fff}
  body.dark{--nx-bg:#1a1a1c;--nx-line:#2a2a2d;--nx-text:#f4f1ec;--nx-sub:#a9a6a0;--nx-mute:#7a7a7f;--nx-bgpage:#0e0e0e}
  @media(max-width:760px){
    .nx{width:calc(100% - 32px)}
    .nx-card{grid-template-columns:1fr;gap:22px;padding:14px}
    .nx-b{font-size:16px}
  }`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  scroll.insertAdjacentHTML('afterend', `
  <section class="nx" aria-label="Browse other projects">
    <p class="nx-h">Up next</p>
    <a class="nx-card" href="${next.file}">
      <div class="nx-img"><img src="${next.image}" alt="" loading="lazy"></div>
      <div>
        <span class="nx-k">${next.keywords}</span>
        <h2 class="nx-t">${next.title}</h2>
        <p class="nx-b">${next.blurb}</p>
        <span class="nx-go">View case study ${arrow}</span>
      </div>
    </a>
    <div class="nx-more">
      <span>Or browse</span>
      ${others.map(o => `<a href="${o.file}"><img src="${o.image}" alt="">${o.title}</a>`).join('')}
      <a class="all" href="../index.html#work">All work</a>
    </div>
  </section>`);

  // the other work from the Extras mat, read from the same list the mat uses (../extras/works.js)
  const extras = document.createElement('script');
  extras.src = '../extras/works.js';
  extras.onload = () => {
    const W = (window.WORKS || []).filter(w => w.pages);
    if (!W.length) return;
    document.querySelector('.nx').insertAdjacentHTML('beforeend', `
    <div class="nx-more nx-extra">
      <span>More work</span>
      ${W.map(w => `<a href="../extras/view.html?w=${w.id}"><img src="../extras/${w.id}/card.webp" alt="" loading="lazy">${w.title}</a>`).join('')}
    </div>`);
  };
  document.head.appendChild(extras);

  // the section rail belongs to the case study; fade it out once the "Up next" block is in view
  const nav = document.querySelector('.secnav');
  if (nav && 'IntersectionObserver' in window) {
    nav.style.transition = 'opacity .3s';
    new IntersectionObserver(([e]) => {
      nav.style.opacity = e.isIntersecting ? '0' : '';
      nav.style.pointerEvents = e.isIntersecting ? 'none' : '';
    }).observe(document.querySelector('.nx'));
  }
})();
