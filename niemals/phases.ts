/** Act 2 shard choreography (pure functions of time). Coordinates are local to the world group (Y0 applied outside). */
import * as THREE from "three";
import { blend, vortex, Pose, ShardData } from "./models/Shards";
import { assign, regionTiles, insideEye, insideHeart, EYE, textInside, slabFaceTiles, boxFaceTiles, plateTiles, rHeart } from "./models/Targets";
import { DOMINOS, DOMINO, CITY } from "./models/Props";
import { T, T2 } from "./timeline";

export const S2 = new THREE.Vector3(0, 0, -10);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const off = (P: Pose[], o: THREE.Vector3, scale = 1): Pose[] => P.map((p) => ({ c: p.c.clone().multiplyScalar(scale).add(o), L: p.L.map((v) => v.clone().multiplyScalar(scale)) as Pose["L"] }));
const rotY = (P: Pose[], a: number): Pose[] => P.map((p) => ({ c: p.c.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a), L: p.L.map((v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a)) as Pose["L"] }));
const zLens = (p: number) => 0.26 * (1 - p * p);

type Cache = { [k: string]: Pose[] };
const cache: Cache = {};
const once = (k: string, f: () => Pose[]) => (cache[k] ??= f());

export const vortexWarp = (t: number) => t + 0.35 * Math.max(0, t - T2.vortex0) ** 2;

export const act2Poses = (d: ShardData, t: number): { poses: Pose[]; visible: boolean; opacity: number; mirrorness: number } => {
  const orbAng = t * 0.35;
  const damaged = () => rotY(d.damaged, orbAng);
  const plates = (tt: number) => assign(d, d.orb, plateTiles(tt));
  const eyeT = () => once("eye", () => off(assign(d, d.orb, regionTiles(d.N, EYE.w, EYE.h, insideEye, (x, y) => { const R = Math.hypot(EYE.w / 2, EYE.h / 2); return zLens(Math.min(1, Math.hypot(x, y) / R)) * 0.9; })), S2));
  const heartT = () => once("heart", () => off(assign(d, d.orb, regionTiles(d.N, 2.4, 2.5, insideHeart, (x, y) => zLens(Math.min(1, Math.hypot(x, y) / rHeart(Math.atan2(y, x)))) * 1.5)), S2));
  const word = (scale: number, key: string) => once(key, () => { const ti = textInside("UNDANKBAR", 2.7 * scale); return off(assign(d, d.orb, regionTiles(d.N, 2.7 * scale, ti.h, ti.inside, () => 0, 0.92)), S2); });
  const dominoT = () => once("dom", () => off(assign(d, d.orb, slabFaceTiles(DOMINOS.map((D) => ({ p: D.p.clone(), s: new THREE.Vector3(DOMINO.w, DOMINO.h, DOMINO.d), ry: D.ry })), 4, 8)), S2));
  const cityT = () => once("city", () => off(assign(d, d.orb, boxFaceTiles(CITY.main.map((b) => ({ p: b.p.clone().setY(CITY.baseY + b.s.y / 2), s: b.s })), 2, 8)), S2));

  // 5 → 6: damaged orb bursts into memory plates
  if (t < T2.plates0) return { poses: damaged(), visible: true, opacity: 1, mirrorness: 0 };
  if (t < T2.plates1) return { poses: blend(d, damaged(), plates(t), pr(t, T2.plates0, T2.plates1), { spread: 0.5, lift: 0.6 }), visible: true, opacity: 1, mirrorness: 0 };
  // 6: plates drift (camera flies between them)
  if (t < T2.eyeT0) return { poses: plates(t), visible: true, opacity: 1, mirrorness: 0 };
  // 6 → 7: plates turn and gather into the lens
  if (t < T2.eyeT1 + 0.15) return { poses: blend(d, plates(T2.eyeT0), eyeT(), pr(t, T2.eyeT0, T2.eyeT1), { spread: 0.45, lift: 0.9, spin: 1.2 }), visible: true, opacity: 1 - pr(t, T2.eyeT1, T2.eyeT1 + 0.15), mirrorness: 0 };
  // 7–8: the solid morph body carries eye → heart (shards hidden)
  if (t < T2.heartShat) return { poses: eyeT(), visible: false, opacity: 0, mirrorness: 0 };
  // 8 → 9: heart shatters, fragments write the word
  const wordAt = T2.word1 - 0.05;
  if (t < wordAt) {
    const burst = off(heartT().map((p) => ({ c: p.c.clone().sub(S2).multiplyScalar(1.5).add(new THREE.Vector3(0, 0, 0.6)), L: p.L })), S2);
    const k = pr(t, T2.heartShat, wordAt);
    const a = blend(d, heartT(), burst, Math.min(1, k * 2.2), { spread: 0.3, lift: 0.1 });
    return { poses: k < 0.45 ? a : blend(d, blend(d, heartT(), burst, 1), word(1, "w1"), (k - 0.45) / 0.55, { spread: 0.4, lift: 0.4 }), visible: true, opacity: 1, mirrorness: 0.55 };
  }
  // 9: glass-metal word
  if (t < T2.domino0) return { poses: word(1, "w1"), visible: true, opacity: 1, mirrorness: 0.55 };
  // 9 → 10: letters collapse into domino faces
  if (t < T2.domino1 + 0.15) return { poses: blend(d, word(1, "w1"), dominoT(), pr(t, T2.domino0, T2.domino1), { spread: 0.5, lift: 0.5 }), visible: true, opacity: 1 - pr(t, T2.domino1, T2.domino1 + 0.15), mirrorness: lerp(0.55, 0.2, pr(t, T2.domino0, T2.domino1)) };
  // 10–11: solid dominoes / buildings carry the shape
  if (t < T2.crumble) return { poses: cityT(), visible: false, opacity: 0, mirrorness: 0.3 };
  // 11: buildings crumble (top first, gravity) …
  const crumbleEnd = T2.vortex0 + 0.05;
  if (t < crumbleEnd) {
    const dt = t - T2.crumble;
    const P = cityT().map((p, i) => {
      const h = p.c.y - CITY.baseY; const delay = Math.max(0, 2.4 - h) * 0.12 + d.tri[i].seed * 0.15;
      const u = Math.max(0, dt - delay);
      const dir = p.c.clone().sub(S2).setY(0).normalize();
      return { c: p.c.clone().add(dir.multiplyScalar(u * 0.5)).add(new THREE.Vector3(0, -1.6 * u * u, 0)), L: p.L.map((v) => v.clone().applyAxisAngle(d.tri[i].axis, u * d.tri[i].spin)) as Pose["L"] };
    });
    return { poses: P, visible: true, opacity: 1, mirrorness: 0.3 };
  }
  // 11 → 12: debris swept into a glass vortex
  const vort = (tt: number) => off(vortex(d, vortexWarp(tt), 1.8, 0.3), S2);
  if (t < T2.vortex1) {
    const dt = crumbleEnd - T2.crumble;
    const from = cityT().map((p, i) => { const h = p.c.y - CITY.baseY; const delay = Math.max(0, 2.4 - h) * 0.12 + d.tri[i].seed * 0.15; const u = Math.max(0, dt - delay); const dir = p.c.clone().sub(S2).setY(0).normalize(); return { c: p.c.clone().add(dir.multiplyScalar(u * 0.5)).add(new THREE.Vector3(0, -1.6 * u * u, 0)), L: p.L.map((v) => v.clone().applyAxisAngle(d.tri[i].axis, u * d.tri[i].spin)) as Pose["L"] }; });
    return { poses: blend(d, from, vort(t), pr(t, crumbleEnd, T2.vortex1), { spread: 0.45, lift: 0.5 }), visible: true, opacity: 1, mirrorness: 0 };
  }
  if (t < T2.collapse0) return { poses: vort(t), visible: true, opacity: 1, mirrorness: 0 };
  // 12 → 13: vortex contracts into the giant word
  if (t < T2.collapse1) return { poses: blend(d, vort(t), word(1.15, "w2"), pr(t, T2.collapse0, T2.collapse1), { spread: 0.5, lift: 0.3, rank: (i) => d.tri[i].seed }), visible: true, opacity: 1, mirrorness: 0.6 };
  // 13: giant word, then it dissolves (shards shrink while light particles take over)
  const shrink = pr(t, T2.dust0, T2.dust0 + 0.35);
  if (t < T2.dust0 + 0.4) return { poses: word(1.15, "w2").map((p) => ({ c: p.c, L: p.L.map((v) => v.clone().multiplyScalar(1 - shrink)) as Pose["L"] })), visible: true, opacity: 1, mirrorness: 0.6 };
  return { poses: word(1.15, "w2"), visible: false, opacity: 0, mirrorness: 0 };
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** vertex positions of the dissolving word – the birth positions of the light particles */
export const wordVertices = (d: ShardData) => {
  const P = act2Poses(d, T2.dust0 - 0.01).poses;
  const arr = new Float32Array(P.length * 9);
  P.forEach((p, i) => p.L.forEach((v, j) => { arr[i * 9 + j * 3] = p.c.x + v.x; arr[i * 9 + j * 3 + 1] = p.c.y + v.y; arr[i * 9 + j * 3 + 2] = p.c.z + v.z; }));
  return arr;
};
export { T };
