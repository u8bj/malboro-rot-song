import * as THREE from "three";

// All textures are generated procedurally (no external assets → no licensing issues, no network).
const cache = new Map<string, THREE.Texture>();
const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  if (cache.has(key)) return cache.get(key)!;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

// deterministic PRNG
export const mulberry = (a: number) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Stylised, fictional banknote (not a reproduction of real currency). */
export const banknoteTexture = () => make("note", 1024, 512, (c) => {
  const g = c.createLinearGradient(0, 0, 1024, 512);
  g.addColorStop(0, "#6f9c80"); g.addColorStop(0.5, "#a9cfa9"); g.addColorStop(1, "#4d7a63");
  c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
  // guilloche
  c.lineWidth = 1.2;
  for (let k = 0; k < 46; k++) {
    c.strokeStyle = `rgba(20,60,40,${0.12 + (k % 3) * 0.05})`;
    c.beginPath();
    for (let x = 0; x <= 1024; x += 4) {
      const y = 256 + Math.sin(x * 0.012 + k * 0.4) * (60 + k * 3) * Math.cos(x * 0.004 + k * 0.13);
      x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke();
  }
  // rosette
  c.save(); c.translate(760, 256);
  for (let k = 0; k < 60; k++) { c.rotate(Math.PI / 30); c.strokeStyle = "rgba(255,255,255,0.18)"; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  c.strokeStyle = "rgba(10,40,25,0.55)"; c.lineWidth = 10; c.strokeRect(18, 18, 988, 476);
  c.lineWidth = 2; c.strokeRect(34, 34, 956, 444);
  c.fillStyle = "rgba(15,45,30,0.85)";
  c.font = "800 190px Inter, Arial"; c.fillText("100", 60, 230);
  c.font = "800 70px Inter, Arial"; c.fillText("100", 840, 460);
  c.font = "600 34px Inter, Arial"; c.fillText("EURO  ·  SPECIMEN", 66, 440);
  // holo strip
  const hg = c.createLinearGradient(560, 0, 620, 512);
  hg.addColorStop(0, "rgba(255,255,255,0.65)"); hg.addColorStop(0.5, "rgba(210,230,255,0.35)"); hg.addColorStop(1, "rgba(255,240,200,0.6)");
  c.fillStyle = hg; c.fillRect(560, 0, 46, 512);
});

/** Paper-stack edge (side faces of a bundle). */
export const paperEdgeTexture = () => make("edge", 512, 64, (c) => {
  c.fillStyle = "#cfe0cc"; c.fillRect(0, 0, 512, 64);
  const r = mulberry(7);
  for (let y = 0; y < 64; y += 2) { c.fillStyle = `rgba(40,80,60,${0.15 + r() * 0.35})`; c.fillRect(0, y, 512, 1); }
});

export const bandTexture = (label: string) => make("band" + label, 512, 128, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#f6e7bf"); g.addColorStop(0.5, "#d9b768"); g.addColorStop(1, "#a9853d");
  c.fillStyle = g; c.fillRect(0, 0, 512, 128);
  c.fillStyle = "#2b2110"; c.font = "800 64px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(label, 256, 68);
});

/** Soft cloudy alpha blob for smoke sprites. */
export const smokeTexture = (seed = 1) => make("smoke" + seed, 256, 256, (c) => {
  const r = mulberry(seed * 977);
  const img = c.createImageData(256, 256);
  // value-noise fbm
  const grid = (s: number) => { const a: number[] = []; for (let i = 0; i < (s + 1) * (s + 1); i++) a.push(r()); return a; };
  const octs = [4, 8, 16, 32].map((s) => ({ s, g: grid(s) }));
  const sm = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    let n = 0, amp = 0.55;
    for (const { s, g } of octs) {
      const fx = (x / 256) * s, fy = (y / 256) * s, ix = Math.floor(fx), iy = Math.floor(fy), tx = sm(fx - ix), ty = sm(fy - iy);
      const v = (i: number, j: number) => g[j * (s + 1) + i];
      n += amp * ((v(ix, iy) * (1 - tx) + v(ix + 1, iy) * tx) * (1 - ty) + (v(ix, iy + 1) * (1 - tx) + v(ix + 1, iy + 1) * tx) * ty);
      amp *= 0.5;
    }
    const dx = x / 128 - 1, dy = y / 128 - 1, d = Math.sqrt(dx * dx + dy * dy);
    const fall = Math.max(0, 1 - d) ** 1.6;
    const a = Math.max(0, Math.min(1, (n - 0.35) * 2.2)) * fall;
    const i = (y * 256 + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 255;
  }
  c.putImageData(img, 0, 0);
});

export const corkTexture = () => make("cork", 256, 256, (c) => {
  c.fillStyle = "#c98b4a"; c.fillRect(0, 0, 256, 256);
  const r = mulberry(3);
  for (let i = 0; i < 2600; i++) { c.fillStyle = r() > 0.5 ? "rgba(120,60,20,0.35)" : "rgba(255,220,170,0.25)"; c.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2); }
});

/** Quilted nylon micro-texture (normal-ish bump) for the jacket. */
export const nylonBump = () => make("nylon", 256, 256, (c) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) { c.fillStyle = y % 4 ? "#8a8a8a" : "#767676"; c.fillRect(0, y, 256, 1); }
});

/** Fictional purple 500 note (stylised, marked SPECIMEN – not a currency reproduction). */
export const note500Texture = () => make("note500", 1024, 512, (c) => {
  const g = c.createLinearGradient(0, 0, 1024, 512);
  g.addColorStop(0, "#5b3a8c"); g.addColorStop(0.5, "#b79ad9"); g.addColorStop(1, "#4a2f78");
  c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
  c.lineWidth = 1.2;
  for (let k = 0; k < 46; k++) {
    c.strokeStyle = `rgba(40,15,70,${0.12 + (k % 3) * 0.05})`; c.beginPath();
    for (let x = 0; x <= 1024; x += 4) { const y = 256 + Math.sin(x * 0.011 + k * 0.37) * (50 + k * 3) * Math.cos(x * 0.005 + k * 0.11); x === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
  }
  c.save(); c.translate(760, 256);
  for (let k = 0; k < 60; k++) { c.rotate(Math.PI / 30); c.strokeStyle = "rgba(255,255,255,0.2)"; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  c.strokeStyle = "rgba(30,10,55,0.55)"; c.lineWidth = 10; c.strokeRect(18, 18, 988, 476);
  c.fillStyle = "rgba(30,10,55,0.85)"; c.font = "800 190px Inter, Arial"; c.fillText("500", 60, 230);
  c.font = "800 70px Inter, Arial"; c.fillText("500", 840, 460);
  c.font = "600 34px Inter, Arial"; c.fillText("EURO  ·  SPECIMEN", 66, 440);
  const hg = c.createLinearGradient(560, 0, 620, 512);
  hg.addColorStop(0, "rgba(255,255,255,0.65)"); hg.addColorStop(0.5, "rgba(210,230,255,0.35)"); hg.addColorStop(1, "rgba(255,240,200,0.6)");
  c.fillStyle = hg; c.fillRect(560, 0, 46, 512);
});
