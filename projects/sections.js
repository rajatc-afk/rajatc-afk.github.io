/* Section menu for the long-scroll case studies.
   Each page sets window.SECTIONS = { h: <artboard height>, list: [[y, 'Label'], ...] } in artboard px (1440 wide),
   then loads this file. A rail of ticks sits at the right edge; hovering or focusing it opens the labels. */
(() => {
  const S = window.SECTIONS, scroll = document.querySelector('.scroll');
  if (!S || !scroll) return;
  const css = `
  .secnav{position:fixed;right:8px;top:50%;translate:0 -50%;z-index:6;font:500 13px/1.2 Inter,system-ui,sans-serif}
  .secnav-in{display:flex;flex-direction:column;align-items:flex-end;gap:2px;padding:12px 6px;border-radius:16px;
    background:transparent;transition:background .25s,box-shadow .25s,backdrop-filter .25s}
  .secnav-h{font:600 10px/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--sn-mute);margin:0 4px 8px 0;
    max-width:0;overflow:hidden;white-space:nowrap;opacity:0;transition:opacity .2s,max-width .3s}
  .secnav button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:flex-end;padding:5px 4px;border-radius:8px}
  .secnav .lb{max-width:0;margin-right:0;overflow:hidden;white-space:nowrap;opacity:0;color:var(--sn-text);transition:opacity .2s,max-width .3s,margin .3s}
  .secnav:hover .lb,.secnav:focus-within .lb{margin-right:12px}
  .secnav .tk{flex:none;width:14px;height:2px;border-radius:2px;background:var(--sn-tick);transition:width .25s,background .25s}
  .secnav button.on .tk{width:26px;background:var(--sn-acc)}
  .secnav button.on .lb{color:var(--sn-acc);font-weight:600}
  .secnav button:hover .tk{background:var(--sn-acc)}
  .secnav:hover .secnav-in,.secnav:focus-within .secnav-in{background:var(--sn-bg);box-shadow:0 10px 40px rgba(0,0,0,.18);backdrop-filter:blur(12px)}
  .secnav:hover .lb,.secnav:focus-within .lb,.secnav:hover .secnav-h,.secnav:focus-within .secnav-h{max-width:260px;opacity:1}
  .secnav button:focus-visible{outline:2px solid var(--sn-acc);outline-offset:1px}
  body{--sn-bg:rgba(255,255,255,.94);--sn-text:#3a3a3e;--sn-mute:#9a9aa0;--sn-tick:rgba(20,20,22,.28);--sn-acc:#141416}
  body.dark{--sn-bg:rgba(24,24,26,.94);--sn-text:#d9d6d0;--sn-mute:#77777c;--sn-tick:rgba(255,255,255,.3);--sn-acc:#f4f1ec}
  @media(max-width:700px){.secnav{display:none}}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const nav = document.createElement('nav');
  nav.className = 'secnav'; nav.setAttribute('aria-label', 'Sections');
  nav.innerHTML = `<div class="secnav-in"><div class="secnav-h">Jump to</div>${
    S.list.map(([, t], i) => `<button type="button" data-i="${i}"><span class="lb">${t}</span><span class="tk"></span></button>`).join('')}</div>`;
  document.body.appendChild(nav);
  const btns = [...nav.querySelectorAll('button')];

  // artboard px -> page px: the long scroll is scaled to the card's width
  const k = () => scroll.getBoundingClientRect().width / 1440;
  const top = () => scroll.getBoundingClientRect().top + scrollY;
  btns.forEach((b, i) => b.addEventListener('click', () => {
    scrollTo({ top: top() + Math.max(0, S.list[i][0] - 70) * k() - 24, behavior: 'smooth' });
    b.blur();
  }));

  let cur = -1;
  const mark = () => {
    const y = (scrollY + innerHeight * .35 - top()) / k();
    let i = 0; S.list.forEach(([sy], j) => { if (sy - 80 <= y) i = j; });
    if (i !== cur) { cur = i; btns.forEach((b, j) => b.classList.toggle('on', j === i)); }
  };
  addEventListener('scroll', mark, { passive: true }); addEventListener('resize', mark); mark();
})();
