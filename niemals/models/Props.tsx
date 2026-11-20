import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, Line } from "@react-three/drei";
import { mulberry } from "../../3d-models/textures";

type V = THREE.Vector3;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const k = cl(x); return k * k * (3 - 2 * k); };

/* ── dominoes ── */
export const DOMINO = { w: 0.42, h: 0.82, d: 0.12 };
export const DOMINOS = (() => { const out: { p: V; ry: number }[] = []; for (let i = 0; i < 10; i++) { const a = -0.9 + i * 0.2; out.push({ p: new THREE.Vector3(Math.sin(a) * 2.6 - 0.1, -0.6, Math.cos(a) * 2.6 - 3.0 - i * 0.05), ry: a + Math.PI / 2 }); } return out; })();
/** fall angle for domino i (0..~1.35 rad), forward along its local z */
export const dominoFall = (i: number, t: number, t0: number, gap = 0.11) => 1.32 * sm((t - (t0 + i * gap)) / 0.32) ** 1.4;

export const Domino: React.FC<{ i: number; fall: number; mat: THREE.Material; dotMat: THREE.Material } & JSX.IntrinsicElements["group"]> = ({ i, fall, mat, dotMat, ...g }) => {
  const D = DOMINOS[i];
  return (
    <group position={D.p} rotation={[0, D.ry, 0]} {...g}>
      {/* pivot at the bottom front edge */}
      <group position={[0, 0, DOMINO.d / 2]} rotation={[fall, 0, 0]}>
        <group position={[0, DOMINO.h / 2, -DOMINO.d / 2]}>
          <RoundedBox args={[DOMINO.w, DOMINO.h, DOMINO.d]} radius={0.02} smoothness={3} material={mat} castShadow />
          <mesh material={dotMat} position={[0, 0, DOMINO.d / 2 + 0.002]}><boxGeometry args={[DOMINO.w * 0.8, 0.012, 0.004]} /></mesh>
          {[[-0.1, 0.22], [0.1, 0.22], [0, -0.2], [-0.1, -0.3], [0.1, -0.3]].slice(0, 1 + (i % 5)).map(([x, y], k) => (
            <mesh key={k} material={dotMat} position={[x, y, DOMINO.d / 2 + 0.003]}><circleGeometry args={[0.03, 24]} /></mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

/* ── floating glass city ── */
export const CITY = (() => {
  const r = mulberry(31); const main: { p: V; s: V }[] = []; const small: { p: V; s: V; d: number }[] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, rad = 0.6 + (i % 3) * 0.55; main.push({ p: new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad - 0.2), s: new THREE.Vector3(0.36 + r() * 0.15, 1.2 + r() * 1.6, 0.36 + r() * 0.15) }); }
  for (let i = 0; i < 34; i++) { const a = r() * Math.PI * 2, rad = 0.4 + r() * 2.0; small.push({ p: new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad - 0.2), s: new THREE.Vector3(0.18 + r() * 0.14, 0.3 + r() * 0.8, 0.18 + r() * 0.14), d: r() }); }
  return { main, small, baseY: -1.3 };
})();
const windowTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t; const c = document.createElement("canvas"); c.width = 128; c.height = 512; const x = c.getContext("2d")!;
  x.fillStyle = "#000"; x.fillRect(0, 0, 128, 512); const r = mulberry(8);
  for (let y = 8; y < 512; y += 22) for (let k = 0; k < 4; k++) if (r() > 0.45) { x.fillStyle = r() > 0.8 ? "#b8c6ff" : "#6f7dc8"; x.fillRect(10 + k * 29, y, 18, 9); }
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }; })();
export const useCityMats = () => useMemo(() => ({
  glass: new THREE.MeshPhysicalMaterial({ color: "#aab8ff", metalness: 0.3, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.55, envMapIntensity: 2, emissiveMap: windowTex(), emissive: new THREE.Color("#ffffff"), emissiveIntensity: 1.2 }),
  base: new THREE.MeshPhysicalMaterial({ color: "#1a1f36", metalness: 0.6, roughness: 0.25, clearcoat: 1, transparent: true }),
}), []);

/* ── hourglass ── */
export const HOURGLASS_PROFILE: [number, number][] = [[0.0, -1.18], [0.62, -1.18], [0.66, -1.05], [0.6, -0.55], [0.32, -0.18], [0.07, 0.0], [0.32, 0.18], [0.6, 0.55], [0.66, 1.05], [0.62, 1.18], [0.0, 1.18]];
export const Hourglass: React.FC<{ k: number; sand: number; t: number } & JSX.IntrinsicElements["group"]> = ({ k, sand, t, ...g }) => {
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#dfe6ff", roughness: 0.02, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.22, side: THREE.DoubleSide, envMapIntensity: 2.4, iridescence: 0.5, depthWrite: false }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9dde8", metalness: 1, roughness: 0.18, transparent: true }), []);
  const sandM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e9dcc0", emissive: new THREE.Color("#c8a46a"), emissiveIntensity: 0.35, roughness: 0.9, transparent: true }), []);
  const geo = useMemo(() => new THREE.LatheGeometry(HOURGLASS_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 96), []);
  glass.opacity = 0.22 * k; metal.opacity = k; sandM.opacity = k;
  const top = 1 - sand, bot = sand;
  return (
    <group {...g}>
      <mesh geometry={geo} material={glass} />
      {[1.26, -1.26].map((y) => <mesh key={y} material={metal} position={[0, y, 0]}><cylinderGeometry args={[0.78, 0.78, 0.08, 64]} /></mesh>)}
      {[[0.55, 0.55], [-0.55, 0.55], [0.55, -0.55], [-0.55, -0.55]].map(([x, z], i) => <mesh key={i} material={metal} position={[x, 0, z]}><cylinderGeometry args={[0.025, 0.025, 2.52, 12]} /></mesh>)}
      {/* upper sand (inverted cone shrinking) */}
      {top > 0.02 && <mesh material={sandM} position={[0, 0.18 + 0.4 * top * 0.5, 0]} rotation={[Math.PI, 0, 0]} scale={[0.95 * Math.cbrt(top), top, 0.95 * Math.cbrt(top)]}><coneGeometry args={[0.5, 0.75, 48, 1, false]} /></mesh>}
      {/* lower pile growing */}
      {bot > 0.02 && <mesh material={sandM} position={[0, -1.14 + 0.32 * bot, 0]} scale={[Math.cbrt(bot), bot, Math.cbrt(bot)]}><coneGeometry args={[0.62, 0.64, 48]} /></mesh>}
      {/* falling stream */}
      {sand > 0 && sand < 0.98 && <mesh material={sandM} position={[0, -0.55 + bot * 0.15, 0]}><cylinderGeometry args={[0.012, 0.012, 1.1 - bot * 0.3, 8]} /></mesh>}
    </group>
  );
};

/* ── particle system: generic Points with per-point positions ── */
export const Particles: React.FC<{ pos: Float32Array; size?: number; color?: string; opacity?: number }> = ({ pos, size = 0.035, color = "#dfe6ff", opacity = 1 }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const mat = useMemo(() => new THREE.PointsMaterial({ size, color: new THREE.Color(color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, map: dotTex(), alphaTest: 0.001 }), [size, color]);
  mat.opacity = opacity;
  if (!geo.attributes.position || (geo.attributes.position.array as Float32Array).length !== pos.length) geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  else { (geo.attributes.position.array as Float32Array).set(pos); }
  geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
  return <points geometry={geo} material={mat} />;
};
const dotTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,0.6)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); t = new THREE.CanvasTexture(c); return t; }; })();

/* ── sound waves (ribbons from real spectrum) ── */
export const waveLine = (j: number, t: number, amp: number, bands: number[], n = 160): V[] => {
  const pts: V[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x = (u - 0.5) * 3.2;
    const b = bands[Math.floor(u * (bands.length - 1))] ?? 0;
    const env = Math.sin(Math.PI * u);
    const y = Math.sin(u * 14 + t * 5 + j * 0.8) * (0.25 + b * 0.6) * amp * env * (1 - j * 0.12);
    pts.push(new THREE.Vector3(x, y + (j - 3) * 0.04, -j * 0.35));
  }
  return pts;
};

/* ── flight path ── */
export const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(1.4, 0.5, -2), new THREE.Vector3(0.6, 1.2, -6), new THREE.Vector3(-1.2, 1.8, -10),
  new THREE.Vector3(-0.2, 2.6, -15), new THREE.Vector3(1.5, 3.2, -20), new THREE.Vector3(0.5, 3.8, -26), new THREE.Vector3(-1, 4.2, -32),
]);
export const pathPts = (from: number, to: number, n = 220) => Array.from({ length: n }, (_, i) => PATH.getPoint(from + ((to - from) * i) / (n - 1)));

export const GlowLine: React.FC<{ pts: V[]; color?: string; width?: number; opacity?: number }> = ({ pts, color = "#9fb4ff", width = 3, opacity = 1 }) =>
  pts.length > 1 && opacity > 0 ? <Line points={pts} color={color} lineWidth={width} transparent opacity={opacity} toneMapped={false} /> : null;

export const STARS = (() => { const r = mulberry(99); const a = new Float32Array(2400 * 3); for (let i = 0; i < 2400; i++) { a[i * 3] = (r() - 0.5) * 60; a[i * 3 + 1] = (r() - 0.5) * 40 + 3; a[i * 3 + 2] = -r() * 60 + 8; } return a; })();
