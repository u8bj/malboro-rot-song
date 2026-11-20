/**
 * Single closed glass/metal body whose outline & thickness morph continuously:
 *   mirror (rounded rectangle, flat)  →  eye lens (vesica, convex)  →  clock crystal (circle, flat-domed)
 * Same vertex grid in every state → true geometric morph (no swap).
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { MIRROR, CLOCK_R, sanitizeNormals } from "./Shards";
import { rHeart } from "./Targets";

const NR = 36, NT = 180;
const EYE = { w: 2.5, h: 1.15 };
// vesica (two circles) for the eye: R - d = h/2, R² - d² = (w/2)²
const eh = EYE.h / 2, ew = EYE.w / 2, eR = (ew * ew / eh + eh) / 2, eD = eR - eh;
const rayCircle = (ux: number, uy: number, cx: number, cy: number, R: number) => { const b = ux * cx + uy * cy; return b + Math.sqrt(b * b - (cx * cx + cy * cy) + R * R); };

const rMirror = (th: number) => Math.pow(Math.pow(Math.abs(Math.cos(th) / (MIRROR.w / 2)), MIRROR.n) + Math.pow(Math.abs(Math.sin(th) / (MIRROR.h / 2)), MIRROR.n), -1 / MIRROR.n);
const rEye = (th: number) => { const ux = Math.cos(th), uy = Math.sin(th); return Math.min(rayCircle(ux, uy, 0, eD, eR), rayCircle(ux, uy, 0, -eD, eR)); };
const rCircle = () => CLOCK_R;

/** half-thickness profiles z(ρ), ρ ∈ [0,1] */
const zMirror = (p: number) => 0.06 * Math.pow(Math.max(0, 1 - Math.pow(p, 14)), 0.25);
const zLens = (p: number) => 0.26 * (1 - p * p) + 0.012 * Math.sqrt(Math.max(0, 1 - p * p));
const zClock = (p: number) => 0.07 * Math.pow(Math.max(0, 1 - Math.pow(p, 10)), 0.3) + 0.05 * (1 - p * p);

export type SlabState = { eye: number; circle: number; heart?: number }; // eye: mirror→eye, circle: eye→circle, heart: (eye)→heart

export const MorphSlab: React.FC<{ s: SlabState; material: THREE.Material } & JSX.IntrinsicElements["group"]> = ({ s, material, ...g }) => {
  const geo = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const n = (NR + 1) * NT * 2;
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const idx: number[] = [];
    for (const side of [0, 1]) for (let r = 0; r < NR; r++) for (let t = 0; t < NT; t++) {
      const o = side * (NR + 1) * NT;
      const a = o + r * NT + t, b = o + r * NT + ((t + 1) % NT), c = o + (r + 1) * NT + t, d = o + (r + 1) * NT + ((t + 1) % NT);
      if (side === 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
    geom.setIndex(idx);
    return geom;
  }, []);
  const arr = geo.attributes.position.array as Float32Array;
  for (let side = 0; side < 2; side++) for (let r = 0; r <= NR; r++) for (let t = 0; t < NT; t++) {
    const th = (t / NT) * Math.PI * 2, p = Math.max(0.004, r / NR);
    const hk = s.heart ?? 0;
    const R = ((rMirror(th) * (1 - s.eye) + rEye(th) * s.eye) * (1 - s.circle) + rCircle() * s.circle) * (1 - hk) + rHeart(th) * hk;
    const z = ((zMirror(p) * (1 - s.eye) + zLens(p) * s.eye) * (1 - s.circle) + zClock(p) * s.circle) * (1 - hk) + zLens(p) * 1.5 * hk;
    const k = ((side * (NR + 1) + r) * NT + t) * 3;
    arr[k] = Math.cos(th) * R * p; arr[k + 1] = Math.sin(th) * R * p; arr[k + 2] = side ? -z : z;
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  sanitizeNormals(geo);
  geo.computeBoundingSphere();
  return <group {...g}><mesh geometry={geo} material={material} castShadow /></group>;
};

/** Iris ⇄ clock-face texture, redrawn per frame. b: 0 = iris, 1 = clock face. crack: 0..1 iris cracks. */
export const useIrisClockTexture = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1024;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex };
}, []);

export const drawIrisClock = (cv: HTMLCanvasElement, b: number, pupil: number, crack: number, t: number) => {
  const c = cv.getContext("2d")!; const C = 512;
  c.clearRect(0, 0, 1024, 1024);
  // base disc
  const g = c.createRadialGradient(C, C, 0, C, C, 512);
  g.addColorStop(0, `rgba(${lerp(60, 26, b)},${lerp(95, 30, b)},${lerp(230, 60, b)},1)`);
  g.addColorStop(0.55, `rgba(${lerp(110, 22, b)},${lerp(80, 26, b)},${lerp(240, 52, b)},1)`);
  g.addColorStop(1, `rgba(${lerp(10, 14, b)},${lerp(10, 15, b)},${lerp(40, 22, b)},1)`);
  c.fillStyle = g; c.beginPath(); c.arc(C, C, 510, 0, Math.PI * 2); c.fill();
  // iris fibres → become the 60 minute ticks
  const n = 120;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.05 * (1 - b);
    const isTick = i % 2 === 0;
    const major = i % 10 === 0;
    const r0 = lerp(150 + (i * 37) % 60, major ? 400 : 440, b), r1 = lerp(430 - (i * 53) % 90, 480, b);
    const alpha = isTick ? 0.35 + 0.65 * b : 0.35 * (1 - b);
    c.strokeStyle = `rgba(${lerp(170, 240, b)},${lerp(160, 242, b)},${lerp(255, 248, b)},${alpha})`;
    c.lineWidth = lerp(2 + ((i * 7) % 3), major ? 12 : 4, b);
    c.beginPath(); c.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0); c.lineTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1); c.stroke();
  }
  // limbal ring
  c.strokeStyle = `rgba(150,170,255,${0.6 * (1 - b)})`; c.lineWidth = 14; c.beginPath(); c.arc(C, C, 500, 0, Math.PI * 2); c.stroke();
  // pupil → shrinks into the clock's centre pin
  const pr = lerp(150 * pupil, 22, b);
  const pg = c.createRadialGradient(C, C, 0, C, C, pr * 1.3);
  pg.addColorStop(0, "#000"); pg.addColorStop(0.75, "#02030a"); pg.addColorStop(1, "rgba(2,3,10,0)");
  c.fillStyle = pg; c.beginPath(); c.arc(C, C, pr * 1.3, 0, Math.PI * 2); c.fill();
  if (b > 0.5) { c.fillStyle = `rgba(230,232,240,${(b - 0.5) * 2})`; c.beginPath(); c.arc(C, C, 16, 0, Math.PI * 2); c.fill(); }
  // highlight
  c.fillStyle = `rgba(255,255,255,${0.5 * (1 - b)})`; c.beginPath(); c.ellipse(C - 120, C - 140, 46, 30, -0.5, 0, Math.PI * 2); c.fill();
  // cracks in the iris
  if (crack > 0) {
    c.strokeStyle = `rgba(230,240,255,${0.9 * crack})`; c.lineWidth = 3;
    for (let k = 0; k < 7; k++) {
      let a = k * 0.9 + 0.3, r = 160; c.beginPath(); c.moveTo(C + Math.cos(a) * r, C + Math.sin(a) * r);
      const L = 9 * crack;
      for (let s = 0; s < L; s++) { a += Math.sin(k * 13 + s * 7) * 0.12; r += 34; c.lineTo(C + Math.cos(a) * r, C + Math.sin(a) * r); }
      c.stroke();
    }
  }
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Canvas texture with text (used for words that live INSIDE the 3D scene, e.g. behind the mirror). */
export const textTexture = (text: string, size = 180, weight = 700) => {
  const cv = document.createElement("canvas"); cv.width = 2048; cv.height = 512;
  const c = cv.getContext("2d")!;
  c.font = `${weight} ${size}px Inter`; c.textAlign = "center"; c.textBaseline = "middle";
  c.shadowColor = "rgba(150,170,255,0.9)"; c.shadowBlur = 40; c.fillStyle = "#ffffff"; c.fillText(text, 1024, 256);
  c.shadowBlur = 0; c.fillText(text, 1024, 256);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/** Navy radial background gradient as scene.background. */
export const navyBackground = () => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 910;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(256, 330, 10, 256, 420, 700);
  g.addColorStop(0, "#0d1530"); g.addColorStop(0.45, "#070b1a"); g.addColorStop(1, "#030407");
  c.fillStyle = g; c.fillRect(0, 0, 512, 910);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};
