/**
 * ONE persistent field of 1280 glass shards = the narrative glass element of the video.
 * Every shard has a pose per "state" (orb, exploded, mirror tile, clock tile, vortex, damaged orb, …).
 * Transitions interpolate per shard (staggered) with an arc + spin that is zero at both ends,
 * so every state matches its neighbour exactly → seamless morphs.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { mulberry } from "../../3d-models/textures";

export const ORB_R = 1.1;
export const MIRROR = { w: 1.9, h: 2.8, n: 8 };
export const CLOCK_R = 1.25;
const COLS = 20, ROWS = 32;

type V = THREE.Vector3;
export type Pose = { c: V; L: [V, V, V] };
export type StateFn = (i: number, t: number) => Pose;

const superR = (th: number, a: number, b: number, n: number) => Math.pow(Math.pow(Math.abs(Math.cos(th) / a), n) + Math.pow(Math.abs(Math.sin(th) / b), n), -1 / n);
const clampToMirror = (x: number, y: number) => {
  const r = Math.hypot(x, y), th = Math.atan2(y, x), R = superR(th, MIRROR.w / 2, MIRROR.h / 2, MIRROR.n);
  return r > R ? [x * R / r, y * R / r] : [x, y];
};
const sq2disk = (u: number, v: number) => [u * Math.sqrt(1 - v * v / 2), v * Math.sqrt(1 - u * u / 2)];

export const buildShards = () => {
  const g = new THREE.IcosahedronGeometry(ORB_R, 7); // 1280 faces, non-indexed
  const p = g.attributes.position.array as Float32Array;
  const N = p.length / 9;
  const rnd = mulberry(77);
  const tri: { verts: [V, V, V]; c: V; axis: V; spin: number; lift: V; seed: number }[] = [];
  for (let i = 0; i < N; i++) {
    const vs = [0, 1, 2].map((k) => new THREE.Vector3(p[i * 9 + k * 3], p[i * 9 + k * 3 + 1], p[i * 9 + k * 3 + 2])) as [V, V, V];
    const c = vs[0].clone().add(vs[1]).add(vs[2]).multiplyScalar(1 / 3);
    tri.push({ verts: vs, c, axis: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), spin: (rnd() - 0.5) * 7, lift: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() * 0.8).normalize(), seed: rnd() });
  }
  // coherent assignment to mirror cells: sort by height, then by x inside each row band
  const order = tri.map((_, i) => i).sort((a, b) => tri[b].c.y - tri[a].c.y);
  const cellOf = new Array<number>(N);
  for (let r = 0; r < ROWS; r++) {
    const band = order.slice(r * COLS * 2, (r + 1) * COLS * 2).sort((a, b) => tri[a].c.x - tri[b].c.x);
    band.forEach((ti, k) => (cellOf[ti] = r * COLS * 2 + k));
  }
  const cellVerts = (idx: number, mapper: (u: number, v: number) => number[]) => {
    const cell = Math.floor(idx / 2), half = idx % 2;
    const cx = cell % COLS, ry = Math.floor(cell / COLS);
    const uv = (a: number, b: number) => { const u = (a / COLS) * 2 - 1, v = 1 - (b / ROWS) * 2; const [x, y] = mapper(u, v); return new THREE.Vector3(x, y, 0); };
    const p00 = uv(cx, ry), p10 = uv(cx + 1, ry), p11 = uv(cx + 1, ry + 1), p01 = uv(cx, ry + 1);
    return (half ? [p00, p11, p01] : [p00, p10, p11]) as [V, V, V];
  };
  const toPose = (vs: [V, V, V]): Pose => { const c = vs[0].clone().add(vs[1]).add(vs[2]).multiplyScalar(1 / 3); return { c, L: vs.map((v) => v.clone().sub(c)) as [V, V, V] }; };

  const orb = tri.map((s) => toPose(s.verts));
  const mirror = tri.map((_, i) => toPose(cellVerts(cellOf[i], (u, v) => clampToMirror(u * MIRROR.w / 2, v * MIRROR.h / 2))));
  const clock = tri.map((_, i) => toPose(cellVerts(cellOf[i], (u, v) => sq2disk(u, v).map((q) => q * CLOCK_R)).map((v) => v.setZ(0.12)) as [V, V, V]));
  const exploded = tri.map((s, i) => { const o = orb[i]; return { c: o.c.clone().multiplyScalar(1.55 + s.seed * 0.9).add(s.lift.clone().multiplyScalar(0.25)), L: o.L.map((v) => v.clone().multiplyScalar(0.9)) as [V, V, V] }; });
  // damaged orb: a cluster of shards around one impact point pushed out / missing
  const impact = new THREE.Vector3(0.55, 0.45, 0.7).normalize();
  const damaged = tri.map((s, i) => {
    const o = orb[i]; const d = s.c.clone().normalize().dot(impact);
    const k = Math.max(0, (d - 0.55) / 0.45);
    return { c: o.c.clone().add(s.c.clone().normalize().multiplyScalar(k * (0.45 + s.seed * 1.3))).add(s.lift.clone().multiplyScalar(k * 0.3)), L: o.L.map((v) => v.clone().multiplyScalar(1 - k * 0.35)) as [V, V, V] };
  });
  return { tri, N, orb, mirror, clock, exploded, damaged, impact };
};
export type ShardData = ReturnType<typeof buildShards>;

/** vortex state – shards as tiny particles spinning around the y axis. */
export const vortex = (d: ShardData, t: number, radius = 1.6, scale = 0.35): Pose[] => d.tri.map((s, i) => {
  const a = s.seed * Math.PI * 2 + t * (2.2 + s.seed * 1.5);
  const r = radius * (0.35 + 0.65 * ((i * 0.618) % 1));
  const y = ((i * 0.37) % 1 - 0.5) * 2.4;
  return { c: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), L: d.orb[i].L.map((v) => v.clone().multiplyScalar(scale).applyAxisAngle(s.axis, t * s.spin)) as [V, V, V] };
});

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Blend two pose lists. k = global 0..1; stagger spreads shards over `spread` of the window by `rank`. */
export const blend = (d: ShardData, A: Pose[], B: Pose[], k: number, opts: { spread?: number; rank?: (i: number) => number; lift?: number; spin?: number } = {}): Pose[] => {
  const spread = opts.spread ?? 0.4, lift = opts.lift ?? 0.6, spinK = opts.spin ?? 1;
  return A.map((a, i) => {
    const s = d.tri[i];
    const r = opts.rank ? opts.rank(i) : s.seed;
    const e = ease((k - r * spread) / (1 - spread));
    const arc = Math.sin(Math.PI * e);
    const c = a.c.clone().lerp(B[i].c, e).add(s.lift.clone().multiplyScalar(arc * lift));
    const ang = arc * s.spin * spinK;
    const L = a.L.map((v, j) => v.clone().lerp(B[i].L[j], e).applyAxisAngle(s.axis, ang)) as [V, V, V];
    return { c, L };
  });
};

/** Mesh that renders a pose list. Geometry buffer updated every frame (pure function of poses). */
export const ShardMesh: React.FC<{ poses: Pose[]; material: THREE.Material; visible?: boolean }> = ({ poses, material, visible = true }) => {
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(poses.length * 9), 3)); return g; }, [poses.length]);
  const arr = geo.attributes.position.array as Float32Array;
  poses.forEach((p, i) => p.L.forEach((v, j) => { arr[i * 9 + j * 3] = p.c.x + v.x; arr[i * 9 + j * 3 + 1] = p.c.y + v.y; arr[i * 9 + j * 3 + 2] = p.c.z + v.z; }));
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return <mesh geometry={geo} material={material} visible={visible} castShadow />;
};

/** Crack paths: random walks over the icosphere's edge graph. */
export const buildCracks = (count: number, steps: number, seed: number, bias?: THREE.Vector3) => {
  const g = new THREE.IcosahedronGeometry(ORB_R * 1.004, 7);
  const p = g.attributes.position.array as Float32Array;
  const key = (x: number, y: number, z: number) => `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
  const verts: V[] = []; const id = new Map<string, number>(); const adj: Set<number>[] = [];
  const vid = (k: number) => { const x = p[k], y = p[k + 1], z = p[k + 2]; const s = key(x, y, z); if (!id.has(s)) { id.set(s, verts.length); verts.push(new THREE.Vector3(x, y, z)); adj.push(new Set()); } return id.get(s)!; };
  for (let i = 0; i < p.length / 9; i++) { const a = vid(i * 9), b = vid(i * 9 + 3), c = vid(i * 9 + 6); adj[a].add(b).add(c); adj[b].add(a).add(c); adj[c].add(a).add(b); }
  const rnd = mulberry(seed);
  const paths: V[][] = [];
  const start = bias ? verts.reduce((best, v, i) => (v.clone().normalize().dot(bias) > verts[best].clone().normalize().dot(bias) ? i : best), 0) : -1;
  for (let c = 0; c < count; c++) {
    let cur = start >= 0 ? start : Math.floor(rnd() * verts.length);
    let dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const path = [verts[cur]];
    for (let s = 0; s < steps; s++) {
      const n = [...adj[cur]];
      // prefer continuing roughly in the same direction → long elegant cracks
      n.sort((a, b) => verts[b].clone().sub(verts[cur]).normalize().dot(dir) - verts[a].clone().sub(verts[cur]).normalize().dot(dir) + (rnd() - 0.5) * 0.9);
      const nx = n[0]; dir = verts[nx].clone().sub(verts[cur]).normalize().lerp(dir, 0.5).normalize(); cur = nx; path.push(verts[cur]);
    }
    paths.push(path);
  }
  return paths;
};

/** Glowing crack lines that grow (`grow` 0..1). */
export const Cracks: React.FC<{ paths: V[][]; grow: number; opacity: number; color?: string; width?: number }> = ({ paths, grow, opacity, color = "#dfe8ff", width = 2.2 }) => (
  <>
    {paths.map((pth, i) => {
      const n = Math.max(0, Math.min(pth.length, Math.floor(pth.length * Math.max(0, Math.min(1, grow * 1.3 - (i / paths.length) * 0.3)))));
      if (n < 2 || opacity <= 0) return null;
      return <Line key={i} points={pth.slice(0, n)} color={color} lineWidth={width} transparent opacity={opacity} toneMapped={false} />;
    })}
  </>
);
