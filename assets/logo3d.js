// Real-time 3D logo tile — the vector mark is extruded into a solid, bevelled object and
// rendered in ~50 physically-based materials (glass, metal, fabric, stone, prints…) on black,
// the same families as the andregs.com logo renders. Scrubbing calls show(i).
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/* ---------- tiny procedural-noise kit ---------- */
const H = (x, y) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = H(xi, yi), b = H(xi + 1, yi), c = H(xi, yi + 1), d = H(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const fbm = (x, y, o = 5) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vn(x * f + i * 17.3, y * f + i * 9.1); f *= 2; a *= .5; } return s / (1 - Math.pow(.5, o)); };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (stops, t) => { t = Math.min(.9999, Math.max(0, t)); const p = t * (stops.length - 1), i = Math.floor(p), f = p - i, a = hex(stops[i]), b = hex(stops[i + 1]); return [0, 1, 2].map(k => a[k] + (b[k] - a[k]) * f); };
const fract = x => x - Math.floor(x);

function canvasTex(size, draw, { srgb = true, rep = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t;
}
// per-pixel texture: f(u,v) -> [r,g,b] (0..255) or a number 0..1 for grayscale
const pix = (size, f, opt) => canvasTex(size, (x, s) => {
  const im = x.createImageData(s, s);
  for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) { let c = f(i / s, j / s); if (typeof c === 'number') { c = c * 255; c = [c, c, c]; } const k = (j * s + i) * 4; im.data[k] = c[0]; im.data[k + 1] = c[1]; im.data[k + 2] = c[2]; im.data[k + 3] = 255; }
  x.putImageData(im, 0, 0);
}, opt);
const lin = { srgb: false };

/* ---------- textures (built lazily, cached) ---------- */
const T = {};
const tx = (k, make) => T[k] || (T[k] = make());
const TEX = {
  noiseBump: () => tx('nb', () => pix(256, (u, v) => fbm(u * 18, v * 18, 4), lin)),
  fineBump: () => tx('fb', () => pix(256, (u, v) => vn(u * 160, v * 160) * .6 + fbm(u * 30, v * 30, 3) * .4, lin)),
  brushed: () => tx('br', () => pix(256, (u, v) => vn(u * 3, v * 420) * .7 + vn(u * 9, v * 900) * .3, lin)),
  hammered: () => tx('hm', () => pix(256, (u, v) => 1 - Math.pow(Math.abs(fbm(u * 9, v * 9, 3) - .5) * 2, .6), lin)),
  knit: () => tx('kn', () => pix(256, (u, v) => { const col = fract(u * 26), row = fract(v * 40 + (col < .5 ? 0 : .5)); const vv = Math.sin(row * Math.PI) * Math.sin(col * Math.PI); return Math.pow(vv, .7) * .85 + vn(u * 200, v * 200) * .15; }, lin)),
  towel: () => tx('tw', () => pix(256, (u, v) => Math.pow(vn(u * 140, v * 140), 1.5) * .8 + vn(u * 40, v * 40) * .2, lin)),
  leather: () => tx('le', () => pix(256, (u, v) => { const a = fbm(u * 30, v * 30, 3); return Math.min(1, Math.abs(a - .5) * 3.2) * .8 + vn(u * 220, v * 220) * .2; }, lin)),
  crater: () => tx('cr', () => pix(256, (u, v) => { let h = fbm(u * 6, v * 6, 5); for (let k = 0; k < 14; k++) { const cx = H(k, 3), cy = H(k, 7), r = .03 + H(k, 11) * .07, d = Math.hypot(u - cx, v - cy) / r; if (d < 1.2) h -= (d < 1 ? (1 - d * d) * .35 : -(1.2 - d) * .5); } return Math.min(1, Math.max(0, h)); }, lin)),
  avocado: () => tx('av', () => pix(256, (u, v) => Math.pow(1 - Math.abs(vn(u * 55, v * 55) - .5) * 2, 3) * .7 + fbm(u * 12, v * 12, 3) * .3, lin)),
  sponge: () => tx('sp', () => pix(256, (u, v) => { const n = fbm(u * 40, v * 40, 3); return n < .42 ? 0 : Math.min(1, (n - .42) * 3); }, lin)),
  denimBump: () => tx('db', () => pix(256, (u, v) => .5 + .5 * Math.sin((u + v) * Math.PI * 2 * 70) * (.7 + .3 * vn(u * 90, v * 90)), lin)),

  marble: () => tx('ma', () => pix(512, (u, v) => { const w = Math.abs(Math.sin((u * 5 + v * 2 + fbm(u * 4, v * 4) * 5) * Math.PI)); return ramp(['#5f6670', '#c9ccd2', '#f4f4f2', '#ffffff'], Math.pow(w, .35)); })),
  granite: () => tx('gr', () => pix(512, (u, v) => { const n = fbm(u * 50, v * 50, 3), s = H(Math.floor(u * 512), Math.floor(v * 512)); return s > .97 ? [235, 235, 235] : s < .05 ? [20, 20, 22] : ramp(['#2b2c30', '#6d6f75', '#a7a9ad'], n); })),
  terrazzo: () => tx('tz', () => canvasTex(512, (x, s) => { x.fillStyle = '#efe7da'; x.fillRect(0, 0, s, s); const cols = ['#e06c4f', '#2f6f8f', '#e9b44c', '#1f1f1f', '#9cc3b0', '#c95b8a']; for (let k = 0; k < 420; k++) { x.fillStyle = cols[k % cols.length]; x.beginPath(); const cx = H(k, 1) * s, cy = H(k, 2) * s, r = 3 + H(k, 3) * 12, n = 5 + (k % 3); for (let p = 0; p < n; p++) { const a = p / n * Math.PI * 2, rr = r * (.6 + H(k, p + 9) * .6); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); } })),
  jade: () => tx('ja', () => pix(512, (u, v) => ramp(['#0d4d36', '#2f9e72', '#7fd6ae', '#2f9e72'], fbm(u * 6, v * 6)))),
  sandstone: () => tx('ss', () => pix(512, (u, v) => ramp(['#b9783f', '#d9a066', '#f0c995', '#c98a4f'], fract(v * 7 + fbm(u * 3, v * 3) * 2) * .7 + vn(u * 300, v * 300) * .3))),
  wood: () => tx('wd', () => pix(512, (u, v) => { const r = fract(u * 14 + fbm(u * 2, v * 9) * 3); return ramp(['#3d2212', '#6b3d20', '#8f5a32', '#5a321b'], r * .85 + vn(u * 6, v * 400) * .15); })),
  cork: () => tx('ck', () => pix(512, (u, v) => ramp(['#7a4e2a', '#b07a45', '#d4a26b', '#8c5b31'], vn(u * 140, v * 140) * .6 + fbm(u * 20, v * 20, 3) * .4))),
  moss: () => tx('ms', () => pix(512, (u, v) => ramp(['#1d3a12', '#3f6b1f', '#7aa33a', '#a9c95a'], fbm(u * 26, v * 26, 4)))),
  lava: () => tx('lv', () => pix(512, (u, v) => { const n = fbm(u * 7, v * 7); const c = Math.pow(1 - Math.abs(n - .5) * 2, 9); return ramp(['#000000', '#ff4400', '#ffcc33'], c); })),
  lavaRock: () => tx('lr', () => pix(512, (u, v) => ramp(['#0e0d0d', '#262322', '#3a3533'], fbm(u * 20, v * 20)))),
  denim: () => tx('dn', () => pix(512, (u, v) => { const t = .5 + .5 * Math.sin((u + v) * Math.PI * 2 * 70); return ramp(['#1b2f5a', '#2f4f8a', '#6d8cc0'], t * .55 + fbm(u * 8, v * 8, 3) * .45); })),
  holo: () => tx('ho', () => pix(512, (u, v) => ramp(['#ffb3e6', '#b3d9ff', '#b8ffe0', '#fff6b3', '#e0b3ff', '#ffb3e6'], fract(u * .9 + v * .6 + fbm(u * 3, v * 3) * .5)))),
  sunset: () => tx('sn', () => canvasTex(512, (x, s) => { const g = x.createLinearGradient(0, 0, 0, s); ['#2b1055', '#7a2d8c', '#e8475f', '#ff8c42', '#ffd166'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c)); x.fillStyle = g; x.fillRect(0, 0, s, s); x.fillStyle = '#fff3c4'; x.beginPath(); x.arc(s * .6, s * .62, s * .16, 0, 7); x.fill(); })),
  stars: () => tx('st', () => canvasTex(512, (x, s) => { const g = x.createLinearGradient(0, 0, s, s); g.addColorStop(0, '#0b1a5e'); g.addColorStop(.6, '#2a2bd8'); g.addColorStop(1, '#7b2fd8'); x.fillStyle = g; x.fillRect(0, 0, s, s); for (let k = 0; k < 260; k++) { x.fillStyle = `rgba(255,255,255,${.4 + H(k, 5) * .6})`; x.beginPath(); x.arc(H(k, 1) * s, H(k, 2) * s, H(k, 3) * 2.2 + .4, 0, 7); x.fill(); } })),
  candy: () => tx('ca', () => canvasTex(512, (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); x.fillStyle = '#ff3b5c'; for (let k = -s; k < s * 2; k += 64) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 32, 0); x.lineTo(k + 32 - s, s); x.lineTo(k - s, s); x.fill(); } })),
  dots: () => tx('do', () => canvasTex(512, (x, s) => { x.fillStyle = '#ff5fa2'; x.fillRect(0, 0, s, s); x.fillStyle = '#ffe14d'; for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(i * 64 + (j % 2) * 32, j * 64, 14, 0, 7); x.fill(); } })),
  flames: () => tx('fl', () => canvasTex(512, (x, s) => { x.fillStyle = '#e8261c'; x.fillRect(0, 0, s, s); [['#ff8a00', .35], ['#ffd400', .2]].forEach(([c, amp]) => { x.fillStyle = c; x.beginPath(); x.moveTo(0, s); for (let i = 0; i <= 16; i++) { const px = i / 16 * s, py = s * (.55 + amp) - (i % 2 ? s * (.25 + H(i, c.length) * .2) : 0); x.quadraticCurveTo(px - s / 32, py + s * .1, px, py); } x.lineTo(s, s); x.fill(); }); })),
  topo: () => tx('tp', () => pix(512, (u, v) => { const n = fbm(u * 4, v * 4); const line = fract(n * 14) < .07; const base = ramp(['#e9e1c8', '#cfd8a8', '#9cbf86', '#6f9a6b'], n); return line ? [70, 60, 45] : base; })),
  terrain: () => tx('tr', () => pix(512, (u, v) => { const n = fbm(u * 5, v * 5, 6); return n < .38 ? ramp(['#1b4d6b', '#2e7c8c'], n / .38) : ramp(['#c9b27a', '#5c8a3a', '#2f5a24', '#8a7a5a'], (n - .38) / .62); })),
  watermelon: () => tx('wm', () => canvasTex(512, (x, s) => { x.fillStyle = '#e8384f'; x.fillRect(0, 0, s, s); x.fillStyle = '#1c1c1c'; for (let k = 0; k < 40; k++) { x.save(); x.translate(H(k, 1) * s, H(k, 2) * s); x.rotate(H(k, 3) * 6); x.beginPath(); x.ellipse(0, 0, 4, 8, 0, 0, 7); x.fill(); x.restore(); } })),
  twoTone: (a, b, ang = .35) => tx('tt' + a + b, () => canvasTex(256, (x, s) => { x.fillStyle = a; x.fillRect(0, 0, s, s); x.fillStyle = b; x.beginPath(); x.moveTo(0, s * (.5 - ang)); x.lineTo(s, s * (.5 + ang)); x.lineTo(s, s); x.lineTo(0, s); x.fill(); })),
  glow: () => tx('gw', () => canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.4, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); })),
};

/* ---------- material catalogue (mirrors the families in the reference renders) ---------- */
const P = (o) => new THREE.MeshPhysicalMaterial({ envMapIntensity: 1.5, ...o });
const glass = (o = {}) => P({ color: '#ffffff', metalness: 0, roughness: .04, transmission: 1, thickness: 60, ior: 1.52, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 2.6, ...o });
const fresnel = (rim, core = '#05020a', power = 2.2) => new THREE.ShaderMaterial({
  uniforms: { c0: { value: new THREE.Color(core) }, c1: { value: new THREE.Color(rim) }, p: { value: power } },
  vertexShader: 'varying vec3 n;varying vec3 v;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform vec3 c0,c1;uniform float p;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),p);gl_FragColor=vec4(mix(c0,c1*1.8,f),1.);}',
});

export const MATERIALS = [
  // glass
  ['Clear glass', () => glass()],
  ['Smoky glass', () => glass({ attenuationColor: new THREE.Color('#2a2a30'), attenuationDistance: 50 })],
  ['Frosted glass', () => glass({ roughness: .38, clearcoatRoughness: .3 })],
  ['Amber glass', () => glass({ attenuationColor: new THREE.Color('#e08a2c'), attenuationDistance: 45 })],
  ['Violet glass', () => glass({ attenuationColor: new THREE.Color('#8b5cf6'), attenuationDistance: 50 })],
  ['Ice', () => glass({ roughness: .2, bumpMap: TEX.noiseBump(), bumpScale: 1.2, attenuationColor: new THREE.Color('#bfe8ff'), attenuationDistance: 80 })],
  ['Soap bubble', () => glass({ iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 900] })],
  // glow
  ['Neon violet', () => fresnel('#b26bff'), { glow: '#8b3dff' }],
  ['Neon green', () => fresnel('#39ff8a', '#020805'), { glow: '#1fd16a' }],
  // metals
  ['Chrome', () => P({ color: '#ffffff', metalness: 1, roughness: .1, envMapIntensity: 3.2 })],
  ['Brushed steel', () => P({ color: '#d7dadf', metalness: 1, roughness: .32, bumpMap: TEX.brushed(), bumpScale: 1.2 })],
  ['Gold', () => P({ color: '#ffc95c', metalness: 1, roughness: .12 })],
  ['Rose gold', () => P({ color: '#f2b49c', metalness: 1, roughness: .14 })],
  ['Copper', () => P({ color: '#e07b4c', metalness: 1, roughness: .2 })],
  ['Hammered bronze', () => P({ color: '#b8863b', metalness: 1, roughness: .26, bumpMap: TEX.hammered(), bumpScale: 3 })],
  ['Titanium', () => P({ color: '#c3c9d2', metalness: 1, roughness: .2, iridescence: .7, iridescenceIOR: 1.6, envMapIntensity: 3 })],
  // plastics & clay
  ['Gloss black', () => P({ color: '#050505', roughness: .06, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 4.5 })],
  ['Matte white', () => P({ color: '#f1f1f1', roughness: .62 })],
  ['Coral clay', () => P({ color: '#ff7b5c', roughness: .85 })],
  ['Lilac rubber', () => P({ color: '#b9a6ff', roughness: .5, sheen: .4, sheenColor: new THREE.Color('#fff') })],
  ['Olive rubber', () => P({ color: '#86a83b', roughness: .55 })],
  ['Red / navy', () => P({ map: TEX.twoTone('#d93a2b', '#1b2440'), roughness: .3, clearcoat: .6 })],
  ['Yellow / blue', () => P({ map: TEX.twoTone('#ffd23f', '#2b7cff', -.2), roughness: .35, clearcoat: .5 })],
  // iridescent
  ['Holographic', () => P({ map: TEX.holo(), metalness: .35, roughness: .12, iridescence: 1, iridescenceIOR: 1.4, clearcoat: 1 })],
  ['Pearl', () => P({ color: '#f4efe9', roughness: .22, iridescence: .55, iridescenceIOR: 1.3, clearcoat: 1, sheen: .5 })],
  ['Oil slick', () => P({ envMapIntensity: 2.5, color: '#08080b', metalness: .6, roughness: .08, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 1200] })],
  // fabric
  ['Velvet', () => P({ color: '#3b2bd6', roughness: .95, sheen: 1, sheenRoughness: .4, sheenColor: new THREE.Color('#b3a6ff') })],
  ['Knit wool', () => P({ color: '#c95b2b', roughness: .95, bumpMap: TEX.knit(), bumpScale: 6, sheen: .8, sheenColor: new THREE.Color('#ffc8a8') })],
  ['Black knit', () => P({ color: '#151515', roughness: .95, bumpMap: TEX.knit(), bumpScale: 6, sheen: .6, sheenColor: new THREE.Color('#888') })],
  ['Denim', () => P({ map: TEX.denim(), roughness: .9, bumpMap: TEX.denimBump(), bumpScale: 2, sheen: .4 })],
  ['Leather', () => P({ color: '#6b4126', roughness: .5, bumpMap: TEX.leather(), bumpScale: 2.5, clearcoat: .25 })],
  ['Terry towel', () => P({ color: '#9fb7d9', roughness: 1, bumpMap: TEX.towel(), bumpScale: 7, sheen: .7, sheenColor: new THREE.Color('#fff') })],
  // stone
  ['Marble', () => P({ map: TEX.marble(), roughness: .18, clearcoat: .8 })],
  ['Granite', () => P({ map: TEX.granite(), roughness: .3, clearcoat: .6 })],
  ['Terrazzo', () => P({ map: TEX.terrazzo(), roughness: .35, clearcoat: .4 })],
  ['Jade', () => P({ map: TEX.jade(), roughness: .15, transmission: .25, thickness: 30, clearcoat: 1 })],
  ['Moon rock', () => P({ color: '#9a9a9a', roughness: .95, bumpMap: TEX.crater(), bumpScale: 12 })],
  ['Lava rock', () => P({ map: TEX.lavaRock(), roughness: .9, bumpMap: TEX.noiseBump(), bumpScale: 8, emissive: new THREE.Color('#ffffff'), emissiveMap: TEX.lava(), emissiveIntensity: 1.6 })],
  ['Sandstone', () => P({ map: TEX.sandstone(), roughness: .9, bumpMap: TEX.fineBump(), bumpScale: 3 })],
  // organic
  ['Walnut', () => P({ map: TEX.wood(), roughness: .45, clearcoat: .5, clearcoatRoughness: .2 })],
  ['Cork', () => P({ map: TEX.cork(), roughness: .95, bumpMap: TEX.fineBump(), bumpScale: 4 })],
  ['Moss', () => P({ map: TEX.moss(), roughness: 1, bumpMap: TEX.fineBump(), bumpScale: 8, sheen: .6, sheenColor: new THREE.Color('#c9f08a') })],
  ['Avocado skin', () => P({ color: '#3d5a1c', roughness: .6, bumpMap: TEX.avocado(), bumpScale: 9 })],
  ['Sponge', () => P({ color: '#f2d33b', roughness: 1, bumpMap: TEX.sponge(), bumpScale: 10 })],
  ['Watermelon', () => P({ map: TEX.watermelon(), roughness: .35, clearcoat: .6 })],
  // prints
  ['Sunset', () => P({ map: TEX.sunset(), roughness: .3, clearcoat: .7 })],
  ['Starry night', () => P({ map: TEX.stars(), roughness: .25, clearcoat: .8 })],
  ['Candy stripes', () => P({ map: TEX.candy(), roughness: .2, clearcoat: 1 })],
  ['Polka pop', () => P({ map: TEX.dots(), roughness: .3, clearcoat: .8 })],
  ['Flames', () => P({ map: TEX.flames(), roughness: .3, clearcoat: .8 })],
  ['Topographic', () => P({ map: TEX.topo(), roughness: .6 })],
  ['Satellite terrain', () => P({ map: TEX.terrain(), roughness: .7, bumpMap: TEX.noiseBump(), bumpScale: 3 })],
];

// Product-photo studio on black: big overhead softbox, two tall strip lights, a cool rim, warm kicker.
// Glass and metal get their bright edges by reflecting these.
function studio() {
  const env = new THREE.Scene(); env.background = new THREE.Color('#000');
  const panel = (w, h, color, k, pos, look = [0, 0, 0]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(...pos); p.lookAt(...look); env.add(p);
  };
  panel(6, 3, '#ffffff', 5, [0, 4, 2]);          // overhead softbox
  panel(.7, 6, '#ffffff', 9, [-4, .5, 2.5]);      // left strip
  panel(.7, 6, '#ffffff', 7, [4, .5, 2.5]);       // right strip
  panel(3, 3, '#bcd0ff', 4, [2, 1, -5]);          // cool rim from behind
  panel(2, 1.2, '#ffd2a6', 3, [-3, -3, 3]);       // warm low kicker
  panel(12, 12, '#151821', 1, [0, 0, -8]);        // faint backdrop so reflections never go fully dead
  panel(14, 10, '#0b0c10', 1, [0, 0, 9]);         // behind the camera: what flat front faces reflect
  panel(14, .5, '#ffffff', 7, [0, -1.6, 8.5]);    // bright horizon band → the classic chrome streak
  panel(14, .25, '#ffffff', 4, [0, 1.2, 8.5]);
  return env;
}

export function createLogo3D(canvas, pathD) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(1); renderer.setSize(canvas.width, canvas.height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), .02).texture;
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(-2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#cfd8ff', 1.2); rim.position.set(3, -1, -2); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100); camera.position.set(0, 0, 6.2);

  // extrude the vector mark
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathD}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap(p => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 70, bevelEnabled: true, bevelThickness: 26, bevelSize: 16, bevelSegments: 10, curveSegments: 64 });
  geo.computeBoundingBox(); const bb = geo.boundingBox, w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - bb.min.x) / w, (uv.getY(i) - bb.min.y) / h);
  geo.center();
  const mesh = new THREE.Mesh(geo); const s = 2.45 / h; mesh.scale.setScalar(s);
  const pivot = new THREE.Group(); pivot.add(mesh); scene.add(pivot);
  mesh.rotation.x = Math.PI;                     // SVG y-down → 3D y-up without flipping faces

  const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ map: TEX.glow(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.z = -1; scene.add(halo);

  const cache = [];
  const mat = i => cache[i] || (cache[i] = MATERIALS[i][1]());
  let cur = 0;
  function show(i) {
    cur = i; const opt = MATERIALS[i][2] || {};
    mesh.material = mat(i);
    halo.visible = !!opt.glow; if (opt.glow) halo.material.color.set(opt.glow);
    pivot.rotation.set(-.12 + Math.sin(i * 1.7) * .06, -.32 + Math.sin(i * .9) * .12, Math.sin(i * 1.3) * .05);
    renderer.render(scene, camera);
  }
  // build + compile the remaining materials in the background so scrubbing never stalls
  let w8 = 0;
  (function warm() {
    if (w8 >= MATERIALS.length) return;
    const m = mat(w8++); const keep = mesh.material; mesh.material = m; renderer.compile(scene, camera); mesh.material = keep;
    setTimeout(warm, 40);
  })();
  return { show, names: MATERIALS.map(m => m[0]), count: MATERIALS.length };
}
