/** Act 2 objects (scenes 7–16) that are not shards: morph body (eye→heart), dominoes, city, vortex clock,
 *  light particles → hourglass → sound waves → flight path, stars. Everything = pure function of t. */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { MorphSlab, drawIrisClock } from "./models/MorphSlab";
import { CLOCK_R, ShardData } from "./models/Shards";
import { rHeart } from "./models/Targets";
import { Domino, DOMINOS, DOMINO, dominoFall, CITY, useCityMats, Hourglass, HOURGLASS_PROFILE, Particles, waveLine, PATH, pathPts, GlowLine, STARS } from "./models/Props";
import { Plane } from "../3d-models/Objects";
import { S2, wordVertices } from "./phases";
import { T2 } from "./timeline";
import { ws } from "./timing";
import { mulberry } from "../3d-models/textures";
import spectrum from "./lyrics/spectrum.json";

const spec = spectrum as number[][];
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => { const k = cl(x); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const NP = 3840;

/* particle targets */
const hourglassTargets = (() => {
  const r = mulberry(4); const a = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    if (i < 2800) { // glass contour
      const u = r() * (HOURGLASS_PROFILE.length - 1), k = Math.floor(u), f = u - k;
      const [r0, y0] = HOURGLASS_PROFILE[k], [r1, y1] = HOURGLASS_PROFILE[Math.min(k + 1, HOURGLASS_PROFILE.length - 1)];
      const rr = r0 + (r1 - r0) * f, yy = y0 + (y1 - y0) * f, th = r() * Math.PI * 2;
      a[i * 3] = Math.cos(th) * rr; a[i * 3 + 1] = yy; a[i * 3 + 2] = Math.sin(th) * rr;
    } else { // upper sand body
      const h = r(), th = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.45 * h;
      a[i * 3] = Math.cos(th) * rr; a[i * 3 + 1] = 0.2 + h * 0.62; a[i * 3 + 2] = Math.sin(th) * rr;
    }
  }
  return a;
})();
const HG_POS = new THREE.Vector3(0, 0, 0);

export const Act2: React.FC<{ t: number; d: ShardData; cv: HTMLCanvasElement; tex: THREE.CanvasTexture; slabMat: THREE.MeshPhysicalMaterial; faceMat: THREE.MeshStandardMaterial; metal: THREE.MeshStandardMaterial; frame: number }> = ({ t, d, cv, tex, slabMat, faceMat, metal, frame }) => {
  const cityM = useCityMats();
  const domMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#eef1f8", roughness: 0.22, clearcoat: 1, envMapIntensity: 1.6, transparent: true }), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#14182b", transparent: true }), []);
  const boxMats = useMemo(() => DOMINOS.map(() => new THREE.MeshPhysicalMaterial({ roughness: 0.15, clearcoat: 1, envMapIntensity: 1.8, transparent: true, emissive: new THREE.Color("#ffffff") })), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a8a"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const beamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3.2, 4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), []);
  const birth = useMemo(() => wordVertices(d), [d]);
  const heartCracks = useMemo(() => {
    const r = mulberry(17); const out: THREE.Vector3[][] = [];
    for (let k = 0; k < 9; k++) { let a = (k / 9) * Math.PI * 2 + r() * 0.4, rad = 0.05; const pts: THREE.Vector3[] = [];
      for (let s = 0; s < 14; s++) { const R = rHeart(a); const p = Math.min(0.98, rad / R); pts.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0.39 * (1 - p * p) + 0.012)); a += (r() - 0.5) * 0.35; rad += R / 14; }
      out.push(pts); }
    return out;
  }, []);
  const wordCracks = useMemo(() => { const r = mulberry(23); return Array.from({ length: 5 }, (_, k) => { let x = -1.3 + k * 0.6, y = 0.32; const pts: THREE.Vector3[] = []; for (let s = 0; s < 10; s++) { pts.push(new THREE.Vector3(x, y, 0.04)); x += (r() - 0.4) * 0.12; y -= 0.068; } return pts; }); }, []);

  /* ── morph body #2: eye (with cracking iris) → heart ── */
  const body2 = t > T2.eyeT1 - 0.05 && t < T2.heartShat + 0.1;
  const heart = sm(pr(t, T2.heart0, T2.heart1));
  const irisCrack = sm(pr(t, ws(6, "verraten"), ws(6, "dich") + 0.4));
  const vortexClock = t > T2.clockIn - 0.4 && t < T2.collapse1 + 0.05;
  if (body2) {
    slabMat.metalness = 0.08; slabMat.roughness = 0.03; slabMat.color.setRGB(0.8, 0.86, 1);
    slabMat.opacity = 0.2 * pr(t, T2.eyeT1 - 0.05, T2.eyeT1 + 0.12) * (1 - pr(t, T2.heartShat, T2.heartShat + 0.08)) + 0.12 * heart;
    // NOTE: iridescence + a point light inside the body produces NaN pixels (bloom spreads them → black frame)
    slabMat.iridescence = 0; slabMat.depthWrite = false;
    drawIrisClock(cv, 0, 0.7 + 0.12 * Math.sin(t * 2), irisCrack, t); tex.needsUpdate = true;
    faceMat.opacity = (1 - heart) * pr(t, T2.eyeT1 - 0.05, T2.eyeT1 + 0.2);
  } else if (vortexClock) {
    slabMat.metalness = 0.1; slabMat.color.setRGB(0.85, 0.9, 1); slabMat.opacity = 0.18 * sm(pr(t, T2.clockIn - 0.4, T2.clockIn + 0.2)); slabMat.iridescence = 0;
    drawIrisClock(cv, 1, 1, 0, t); tex.needsUpdate = true;
    faceMat.opacity = sm(pr(t, T2.clockIn - 0.4, T2.clockIn + 0.2)); metal.opacity = faceMat.opacity;
  }
  const heartGlow = heart * (0.55 + 0.45 * Math.sin(t * 3.2) ** 2) * (1 - pr(t, T2.heartShat - 0.15, T2.heartShat));
  glowMat.opacity = heartGlow * 0.38;
  const hCrack = sm(pr(t, T2.heartCrack0, T2.heartShat - 0.05));

  /* ── dominoes ── */
  const domVis = t > T2.domino1 - 0.15 && t < T2.city0 + 0.02;
  domMat.opacity = pr(t, T2.domino1 - 0.15, T2.domino1 + 0.05); dotMat.opacity = domMat.opacity;
  /* ── domino → building morph boxes + city ── */
  const cityK = sm(pr(t, T2.city0, T2.city1));
  const boxesVis = t >= T2.city0 && t < T2.crumble + 0.05;
  const smallGrow = (i: number) => sm(pr(t, T2.city0 + 0.2 + CITY.small[i].d * 0.6, T2.city0 + 0.6 + CITY.small[i].d * 0.6)) * (1 - sm(pr(t, T2.crumble + 0.1 + CITY.small[i].d * 0.6, T2.crumble + 0.9 + CITY.small[i].d * 0.6)));
  cityM.base.opacity = sm(pr(t, T2.city0, T2.city1)) * (1 - sm(pr(t, T2.crumble + 0.3, T2.vortex0 + 0.2)));
  const dominoPose = (i: number, fall: number) => {
    const D = DOMINOS[i]; const m = new THREE.Matrix4().compose(D.p, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, D.ry, 0)), new THREE.Vector3(1, 1, 1));
    m.multiply(new THREE.Matrix4().makeTranslation(0, 0, DOMINO.d / 2)).multiply(new THREE.Matrix4().makeRotationX(fall)).multiply(new THREE.Matrix4().makeTranslation(0, DOMINO.h / 2, -DOMINO.d / 2));
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); return { p, q };
  };

  /* ── light particles: word dust → hourglass → waves ── */
  const partVis = t > T2.dust0 && t < T2.wave1 + 0.6;
  const pos = useMemo(() => new Float32Array(NP * 3), []);
  const bands = spec[Math.min(spec.length - 1, frame)] ?? [];
  const amp = 1 - 0.88 * sm(pr(t, T2.wave1 + 0.3, T2.decay1));
  const waves = Array.from({ length: 6 }, (_, j) => waveLine(j, t, amp, bands, 640));
  if (partVis) {
    const k1 = sm(pr(t, T2.dust0 + 0.05, T2.dust1)), k2 = sm(pr(t, T2.wave0, T2.wave1));
    const sandFlow = pr(t, T2.sand0, T2.sand1);
    for (let i = 0; i < NP; i++) {
      const b = (i % birth.length / 3) | 0; const bx = birth[(i * 3) % birth.length], by = birth[(i * 3 + 1) % birth.length], bz = birth[(i * 3 + 2) % birth.length];
      void b;
      const seed = ((i * 0.618) % 1);
      // hourglass target (sand grains in the upper body slowly fall through the neck)
      let hx = hourglassTargets[i * 3], hy = hourglassTargets[i * 3 + 1], hz = hourglassTargets[i * 3 + 2];
      if (i >= 2800) { const fall = cl(sandFlow * 1.4 - seed * 0.4); if (fall > 0) { const q = cl(fall * 2.2); hy = lerp(hy, -1.05 + seed * 0.3, q); hx *= 1 - q * 0.6; hz *= 1 - q * 0.6; } }
      const ex = Math.sin(seed * 40 + t) * 0.35 * Math.sin(Math.PI * k1);
      let x = lerp(bx, hx + S2.x + HG_POS.x, k1) + ex, y = lerp(by, hy + S2.y, k1) + Math.cos(seed * 30) * 0.3 * Math.sin(Math.PI * k1), z = lerp(bz, hz + S2.z, k1);
      if (k2 > 0) { const j = i % 6, n = Math.floor(i / 6) % 640; const w = waves[j][n]; const kk = cl(k2 * 1.25 - seed * 0.25); x = lerp(x, w.x + S2.x, kk); y = lerp(y, w.y + S2.y, kk); z = lerp(z, w.z + S2.z, kk); }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
  }
  const partOp = partVis ? pr(t, T2.dust0, T2.dust0 + 0.2) * (1 - 0.65 * sm(pr(t, T2.glass0 + 0.2, T2.glass0 + 0.7)) + 0.65 * sm(pr(t, T2.wave0, T2.wave0 + 0.3))) * (1 - pr(t, T2.wave1 + 0.1, T2.wave1 + 0.6)) : 0;
  const hgK = sm(pr(t, T2.glass0 - 0.1, T2.glass0 + 0.5)) * (1 - sm(pr(t, T2.wave0 - 0.1, T2.wave0 + 0.35)));
  const sand = sm(pr(t, T2.sand0, T2.sand1)) * 0.85;

  /* ── waves → flight path ── */
  const wavesVis = t > T2.wave1 - 0.15 && t < T2.path1 + 0.4;
  const wOp = (j: number) => pr(t, T2.wave1 - 0.15, T2.wave1 + 0.15) * (1 - sm(pr(t, T2.decay1 - 0.9 + (5 - j) * 0.12, T2.decay1 + (5 - j) * 0.1))) ;
  const pathK = sm(pr(t, T2.path0, T2.path1));
  const flight = pr(t, T2.path1 - 0.3, 37.72);
  const head = lerp(0.02, 0.9, flight ** 0.9);
  const morphPts = useMemo(() => pathPts(0, 0.12, 640), []);
  const lastWave = waves[0].map((w, i) => w.clone().lerp(morphPts[i], pathK));
  const pathOp = 1 - 0.75 * pr(t, T2.fade0, 37.6);
  const starsOp = sm(pr(t, T2.path0, T2.path1 + 0.4)) * (1 - 0.92 * sm(pr(t, T2.fade0, 37.65)));
  const planeU = Math.min(0.97, head);
  const pp = PATH.getPoint(planeU), pt = PATH.getTangent(planeU);

  /* ── light beam over the giant word ── */
  const bk = pr(t, T2.beam0, T2.beam1);
  beamMat.opacity = Math.sin(Math.PI * bk);

  return (
    <group position={S2}>
      {body2 && (
        <group>
          <MorphSlab s={{ eye: 1, circle: 0, heart }} material={slabMat} />
          {faceMat.opacity > 0.01 && <mesh material={faceMat} scale={0.54 * (1 - heart * 0.7)} position={[Math.sin(t * 1.1) * 0.15 * (1 - heart), Math.cos(t * 0.8) * 0.06, -0.02]}><circleGeometry args={[1, 96]} /></mesh>}
          <mesh material={glowMat} scale={[0.5 * heart, 0.46 * heart, 0.25]} position={[0, 0.0, 0]}><sphereGeometry args={[1, 32, 16]} /></mesh>
          <pointLight position={[0, 0, 0.5]} intensity={heartGlow * 25} color="#ff6a9a" distance={5} />
          {hCrack > 0 && heartCracks.map((pts, k) => { const n = Math.floor(pts.length * cl(hCrack * 1.4 - k * 0.05)); return n > 1 ? <Line key={k} points={pts.slice(0, n)} color="#ffe6f0" lineWidth={2.2} transparent opacity={0.95} toneMapped={false} /> : null; })}
        </group>
      )}
      {vortexClock && (() => {
        const sc = sm(pr(t, T2.clockIn - 0.4, T2.clockIn + 0.3)) * (1 - sm(pr(t, T2.collapse0, T2.collapse1))) * 0.62;
        const hc = Math.max(0, t - T2.clockIn); const mA = -(hc * 2 + hc * hc * 1.6), hA = mA / 12;
        return (
          <group scale={sc} rotation={[0.15, Math.sin(t) * 0.3, 0]}>
            <MorphSlab s={{ eye: 1, circle: 1 }} material={slabMat} />
            <mesh material={faceMat} scale={CLOCK_R * 0.96} position={[0, 0, -0.02]}><circleGeometry args={[1, 96]} /></mesh>
            <mesh material={metal} rotation={[0, 0, hA]} position={[Math.sin(-hA) * 0.28, Math.cos(-hA) * 0.28, 0.05]}><boxGeometry args={[0.07, 0.6, 0.03]} /></mesh>
            <mesh material={metal} rotation={[0, 0, mA]} position={[Math.sin(-mA) * 0.42, Math.cos(-mA) * 0.42, 0.07]}><boxGeometry args={[0.04, 0.86, 0.03]} /></mesh>
            <mesh material={metal}><torusGeometry args={[CLOCK_R * 0.99, 0.045, 24, 128]} /></mesh>
            {/* no point light here: vortex shards pass through the centre → 1/d² → Inf/NaN pixels */}
          </group>
        );
      })()}

      {t > T2.wordCrack0 && t < T2.domino0 + 0.1 && wordCracks.map((pts, k) => { const n = Math.floor(pts.length * cl(pr(t, T2.wordCrack0 + k * 0.05, T2.domino0 - 0.1))); return n > 1 ? <Line key={k} points={pts.slice(0, n)} color="#e8eeff" lineWidth={2} transparent opacity={0.9} toneMapped={false} /> : null; })}
      {bk > 0 && bk < 1 && <mesh material={beamMat} position={[lerp(-2.4, 2.4, bk), 0, 0.4]} rotation={[0, 0, 0.35]}><boxGeometry args={[0.05, 3.2, 0.01]} /></mesh>}

      {domVis && DOMINOS.map((_, i) => <Domino key={i} i={i} fall={dominoFall(i, t, T2.fall0)} mat={domMat} dotMat={dotMat} />)}
      {boxesVis && DOMINOS.map((_, i) => {
        const B = CITY.main[i]; const from = dominoPose(i, dominoFall(i, T2.city0, T2.fall0));
        const toP = B.p.clone().setY(CITY.baseY + B.s.y / 2);
        const k = cl(cityK * 1.15 - i * 0.015);
        const q = from.q.clone().slerp(new THREE.Quaternion(), k);
        const s = new THREE.Vector3(lerp(DOMINO.w, B.s.x, k), lerp(DOMINO.h, B.s.y, k), lerp(DOMINO.d, B.s.z, k));
        const m = boxMats[i]; m.color.set("#eef1f8").lerp(new THREE.Color("#aab8ff"), k); m.opacity = lerp(1, 0.6, k); m.metalness = lerp(0, 0.3, k); m.emissiveMap = k > 0.3 ? cityM.glass.emissiveMap : null; m.emissiveIntensity = k * 1.1; m.needsUpdate = (k > 0.3) !== (m.userData.e ?? false); m.userData.e = k > 0.3;
        return <mesh key={i} material={m} position={from.p.clone().lerp(toP, k)} quaternion={q} scale={s}><boxGeometry args={[1, 1, 1]} /></mesh>;
      })}
      {t > T2.city0 && t < T2.vortex0 + 0.4 && (
        <>
          <mesh material={cityM.base} position={[0, CITY.baseY - 0.06, -0.2]} scale={[1, 1, 1]}><cylinderGeometry args={[2.6, 2.3, 0.12, 96]} /></mesh>
          {CITY.small.map((b, i) => { const g = smallGrow(i); return g > 0.01 ? <mesh key={i} material={cityM.glass} position={[b.p.x, CITY.baseY + (b.s.y * g) / 2, b.p.z]} scale={[b.s.x, b.s.y * g, b.s.z]}><boxGeometry args={[1, 1, 1]} /></mesh> : null; })}
        </>
      )}

      {hgK > 0.001 && <Hourglass k={hgK} sand={sand} t={t} position={HG_POS} rotation={[0, t * 0.4, 0.05]} />}
      {partVis && partOp > 0.01 && <group position={[-S2.x, -S2.y, -S2.z]}><Particles pos={pos} size={0.04} opacity={partOp} /></group>}

      {wavesVis && waves.map((w, j) => (j === 0 ? null : <GlowLine key={j} pts={w} width={2.2} opacity={wOp(j) * 0.8} color={j % 2 ? "#8a6bff" : "#6aa0ff"} />))}
      {t > T2.wave1 - 0.15 && <GlowLine pts={pathK < 1 ? lastWave : pathPts(0, head)} width={3.2} opacity={(t < T2.path1 ? pr(t, T2.wave1 - 0.15, T2.wave1 + 0.15) : 1) * pathOp} color="#cfd9ff" />}
      {t > T2.path0 && <Particles pos={STARS} size={0.09} opacity={starsOp} color="#e6ecff" />}
      {t > T2.path1 - 0.4 && (
        <group position={pp} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), pt)} scale={0.16 * sm(pr(t, T2.path1 - 0.4, T2.path1 + 0.2))}>
          <Plane />
          <pointLight intensity={8} color="#dfe6ff" distance={3} />
        </group>
      )}
    </group>
  );
};

/** camera follow for the final flight (world coords incl. group offset) */
export const flightCam = (t: number, Y0: number) => {
  const flight = pr(t, T2.path1 - 0.3, 37.72);
  const head = lerp(0.02, 0.9, flight ** 0.9);
  const back = sm(pr(t, T2.fade0 - 1.0, 37.7));
  const u = Math.max(0, head - 0.07 - back * 0.1);
  const p = PATH.getPoint(u).add(S2).add(new THREE.Vector3(0, Y0 + 0.45 + back * 2.2, 1.6 + back * 5));
  const look = PATH.getPoint(Math.min(0.99, head + 0.03)).add(S2).add(new THREE.Vector3(0, Y0, 0));
  return { pos: p, look, fov: 40 };
};
