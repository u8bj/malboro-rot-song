/** Target-shape builders for the shard field. Each returns exactly N triangles (Pose[]),
 *  coherently assigned to shard indices so flights are short and organic. */
import * as THREE from "three";
import type { Pose, ShardData } from "./Shards";
import { mulberry } from "../../3d-models/textures";

type V = THREE.Vector3;
export const EYE = { w: 2.5, h: 1.15 };
const eh = EYE.h / 2, ew = EYE.w / 2, eR = (ew * ew / eh + eh) / 2, eD = eR - eh;
export const insideEye = (x: number, y: number) => x * x + (y - eD) ** 2 <= eR * eR && x * x + (y + eD) ** 2 <= eR * eR;

// heart outline (classic parametric curve), as polar table around its centroid
const HEART_H = 2.3;
const heartPts = (() => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 2000; i++) { const s = (i / 2000) * Math.PI * 2; pts.push([16 * Math.sin(s) ** 3, 13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s)]); }
  const k = HEART_H / 29; return pts.map(([x, y]) => [x * k, (y + 2.5) * k] as [number, number]);
})();
const heartTable = (() => {
  const B = 720, tab = new Array(B).fill(0);
  for (const [x, y] of heartPts) { const th = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2); const b = Math.floor((th / (Math.PI * 2)) * B) % B; tab[b] = Math.max(tab[b], Math.hypot(x, y)); }
  for (let i = 0; i < B; i++) if (!tab[i]) tab[i] = tab[(i + B - 1) % B];
  return tab;
})();
export const rHeart = (th: number) => { const B = heartTable.length; const f = (((th % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * B; const i = Math.floor(f) % B; const j = (i + 1) % B; return heartTable[i] + (heartTable[j] - heartTable[i]) * (f - Math.floor(f)); };
export const insideHeart = (x: number, y: number) => Math.hypot(x, y) <= rHeart(Math.atan2(y, x));

const quadTris = (c: V, ax: V, ay: V): [V, V, V][] => {
  const p00 = c.clone().sub(ax).sub(ay), p10 = c.clone().add(ax).sub(ay), p11 = c.clone().add(ax).add(ay), p01 = c.clone().sub(ax).add(ay);
  return [[p00, p10, p11], [p00, p11, p01]];
};
const toPose = (vs: [V, V, V]): Pose => { const c = vs[0].clone().add(vs[1]).add(vs[2]).multiplyScalar(1 / 3); return { c, L: vs.map((v) => v.clone().sub(c)) as Pose["L"] }; };

/** pick exactly n cells inside a 2D region using an adaptively sized grid */
const regionCells = (n: number, w: number, h: number, inside: (x: number, y: number) => boolean) => {
  let step = Math.sqrt((w * h) / n) * 0.75, cells: [number, number][] = [];
  for (let it = 0; it < 30; it++) {
    cells = [];
    for (let y = -h / 2 + step / 2; y < h / 2; y += step) for (let x = -w / 2 + step / 2; x < w / 2; x += step) if (inside(x, y)) cells.push([x, y]);
    if (cells.length >= n) break; step *= 0.93;
  }
  // even subsample to exactly n
  const out: [number, number][] = []; for (let i = 0; i < n; i++) out.push(cells[Math.floor((i * cells.length) / n)]);
  return { cells: out, step };
};

export const regionTiles = (N: number, w: number, h: number, inside: (x: number, y: number) => boolean, z: (x: number, y: number) => number = () => 0, fill = 0.98) => {
  const { cells, step } = regionCells(N / 2, w, h, inside);
  const tris: [V, V, V][] = [];
  cells.forEach(([x, y]) => tris.push(...quadTris(new THREE.Vector3(x, y, z(x, y)), new THREE.Vector3((step / 2) * fill, 0, 0), new THREE.Vector3(0, (step / 2) * fill, 0))));
  return tris;
};

/** word mosaic from canvas text */
export const textInside = (text: string, width: number) => {
  const cv = document.createElement("canvas"); cv.width = 1600; cv.height = 300;
  const c = cv.getContext("2d")!; c.fillStyle = "#fff"; c.font = "900 230px Inter"; c.textAlign = "center"; c.textBaseline = "middle";
  const m = c.measureText(text).width; c.font = `900 ${230 * Math.min(1, 1500 / m)}px Inter`; c.fillText(text, 800, 150);
  const img = c.getImageData(0, 0, 1600, 300).data;
  const k = 1600 / width;
  return { inside: (x: number, y: number) => { const px = Math.round(800 + x * k), py = Math.round(150 - y * k); if (px < 0 || py < 0 || px >= 1600 || py >= 300) return false; return img[(py * 1600 + px) * 4 + 3] > 128; }, h: (300 / k) };
};

/** boxes given as {pos, size, rotY}; tiles cover the 4 side faces (cols×rows per face) */
export const boxFaceTiles = (boxes: { p: V; s: V; ry?: number }[], cols: number, rows: number) => {
  const tris: [V, V, V][] = [];
  boxes.forEach((b) => {
    const faces = [[new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), b.s.x, b.s.z], [new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), b.s.x, b.s.z], [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), b.s.z, b.s.x], [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), b.s.z, b.s.x]] as [V, V, number, number][];
    faces.forEach(([nrm, right, fw, depth]) => {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cx = (-fw / 2 + (fw * (c + 0.5)) / cols), cy = (-b.s.y / 2 + (b.s.y * (r + 0.5)) / rows);
        const center = nrm.clone().multiplyScalar(depth / 2).add(right.clone().multiplyScalar(cx)).add(new THREE.Vector3(0, cy, 0));
        const ax = right.clone().multiplyScalar((fw / cols / 2) * 0.97), ay = new THREE.Vector3(0, (b.s.y / rows / 2) * 0.97, 0);
        quadTris(center, ax, ay).forEach((tr) => tris.push(tr.map((v) => v.applyAxisAngle(new THREE.Vector3(0, 1, 0), b.ry ?? 0).add(b.p)) as [V, V, V]));
      }
    });
  });
  return tris;
};

/** domino faces: front/back of thin slabs */
export const slabFaceTiles = (slabs: { p: V; s: V; ry: number }[], cols: number, rows: number) => {
  const tris: [V, V, V][] = [];
  slabs.forEach((b) => [1, -1].forEach((side) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const center = new THREE.Vector3(-b.s.x / 2 + (b.s.x * (c + 0.5)) / cols, (b.s.y * (r + 0.5)) / rows, (side * b.s.z) / 2);
      quadTris(center, new THREE.Vector3((b.s.x / cols / 2) * 0.97, 0, 0), new THREE.Vector3(0, (b.s.y / rows / 2) * 0.97, 0)).forEach((tr) => tris.push(tr.map((v) => v.applyAxisAngle(new THREE.Vector3(0, 1, 0), b.ry).add(b.p)) as [V, V, V]));
    }
  }));
  return tris;
};

/** Coherently assign source poses to target triangles (both sorted by height bands then x). */
export const assign = (d: ShardData, from: Pose[], targetTris: [V, V, V][]): Pose[] => {
  const N = d.N;
  const tgt = targetTris.slice(0, N).map(toPose);
  while (tgt.length < N) tgt.push(tgt[tgt.length % Math.max(1, targetTris.length)]);
  const key = (p: Pose) => Math.round(p.c.y * 6) * 1000 + p.c.x + p.c.z * 0.3;
  const si = from.map((_, i) => i).sort((a, b) => key(from[b]) - key(from[a]));
  const ti = tgt.map((_, i) => i).sort((a, b) => key(tgt[b]) - key(tgt[a]));
  const out = new Array<Pose>(N);
  si.forEach((s, k) => (out[s] = tgt[ti[k]]));
  return out;
};

/** floating glass plates (memory panes) along a corridor into depth */
export const PLATES = (() => {
  const r = mulberry(5); const out: { p: V; ry: number; rz: number; w: number; h: number }[] = [];
  for (let i = 0; i < 10; i++) out.push({ p: new THREE.Vector3((i % 2 ? 1 : -1) * (0.75 + r() * 0.5), (r() - 0.5) * 1.6, 1.2 - i * 2.1), ry: (i % 2 ? -1 : 1) * (0.12 + r() * 0.15), rz: (r() - 0.5) * 0.2, w: 1.25, h: 0.9 });
  return out;
})();
export const plateTiles = (t: number) => {
  const tris: [V, V, V][] = [];
  PLATES.forEach((pl, i) => {
    const drift = new THREE.Vector3(Math.sin(t * 0.6 + i) * 0.08, Math.sin(t * 0.8 + i * 2) * 0.1, 0);
    const rot = new THREE.Euler(Math.sin(t * 0.5 + i) * 0.08, pl.ry + Math.sin(t * 0.4 + i) * 0.1, pl.rz);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const center = new THREE.Vector3(-pl.w / 2 + (pl.w * (c + 0.5)) / 8, -pl.h / 2 + (pl.h * (r + 0.5)) / 8, 0);
      quadTris(center, new THREE.Vector3(pl.w / 16, 0, 0), new THREE.Vector3(0, pl.h / 16, 0)).forEach((tr) => tris.push(tr.map((v) => v.applyEuler(rot).add(pl.p).add(drift)) as [V, V, V]));
    }
  });
  return tris;
};
export const plateTransform = (i: number, t: number) => {
  const pl = PLATES[i];
  return { p: pl.p.clone().add(new THREE.Vector3(Math.sin(t * 0.6 + i) * 0.08, Math.sin(t * 0.8 + i * 2) * 0.1, 0)), r: new THREE.Euler(Math.sin(t * 0.5 + i) * 0.08, pl.ry + Math.sin(t * 0.4 + i) * 0.1, pl.rz) };
};
