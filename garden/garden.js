/* Rajat's garden — shared bits for the garden page and the gallery.
   Storage: for this prototype, flowers are saved in this browser only (localStorage).
   To make one garden that every visitor shares, swap the three functions in STORE
   for calls to an online database — nothing else needs to change. */

const STORE = {
  KEY: 'rajat-garden-flowers-v2',
  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || null; } catch (e) { return null; }
  },
  save(list) {
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  },
  add(flower) {
    const list = this.load() || [];
    list.push(flower);
    return this.save(list) ? list : null;
  }
};

/* ---------- island geometry (pixels of island.png, 1200 × 896) ---------- */
const ISLAND = { w: 1200, h: 896, top: 142, bottom: 616 };

// Flowers may only stand on the painted grass. We read the island picture itself:
// a spot is "lawn" when it and the area around it are green (not soil, not background).
let lawn = null;
const lawnReady = new Promise(resolve => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = ISLAND.w; c.height = ISLAND.h;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, ISLAND.w, ISLAND.h);
    try { lawn = g.getImageData(0, 0, ISLAND.w, ISLAND.h).data; } catch (e) { lawn = null; }
    resolve();
  };
  img.onerror = () => resolve();
  img.src = 'island.png';
});
function isGreen(x, y) {
  if (!lawn || x < 0 || y < 0 || x >= ISLAND.w || y >= ISLAND.h) return false;
  const i = (Math.round(y) * ISLAND.w + Math.round(x)) * 4, r = lawn[i], g = lawn[i + 1], b = lawn[i + 2];
  return g > r + 12 && g > b + 30;
}
function onIsland(x, y) {
  // the base and a margin all around (more below, so stems never sit on the front edge) must be lawn
  return [[0, 0], [-40, 0], [40, 0], [0, -30], [0, 46], [-28, 30], [28, 30]].every(([dx, dy]) => isGreen(x + dx, y + dy));
}
function randomSpot() {
  for (let i = 0; i < 600; i++) {
    const x = 150 + Math.random() * 900, y = ISLAND.top + 30 + Math.random() * (ISLAND.bottom - ISLAND.top - 60);
    if (onIsland(x, y)) return { x, y };
  }
  return { x: 600, y: 380 };
}
// further back = smaller, nearer the front = bigger
function depthScale(y) { const t = (y - ISLAND.top) / (ISLAND.bottom - ISLAND.top); return 0.5 + 0.38 * Math.max(0, Math.min(1, t)); }

/* only flowers that visitors drew — the garden starts empty */
function allFlowers() { return STORE.load() || []; }

/* ---------- turn a drawing into a neat flower image ---------- */
// trims empty space, then fits the drawing into a square with its base on the bottom edge
function exportFlower(canvas) {
  const g = canvas.getContext('2d'), { width: W, height: H } = canvas;
  const data = g.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const pad = 10, bw = x1 - x0 + 1 + pad * 2, bh = y1 - y0 + 1 + pad * 2, side = Math.max(bw, bh);
  const out = document.createElement('canvas'); out.width = out.height = 200;
  const k = 200 / side;
  out.getContext('2d').drawImage(canvas, x0 - pad, y0 - pad, bw, bh, (200 - bw * k) / 2, 200 - bh * k, bw * k, bh * k);
  return out.toDataURL('image/png');
}
