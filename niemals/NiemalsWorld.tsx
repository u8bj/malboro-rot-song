import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Stage3D, CameraRig } from "../components/Stage3D";
import { Sparks } from "../components/Sparks";
import { Word } from "../components/KineticText";
import { LineText } from "../components/LineText";
import { Grain, Vignette, hexA } from "../components/Background";
import { buildShards, buildCracks, blend, vortex, ShardMesh, Cracks, Pose, ShardData, CLOCK_R } from "./models/Shards";
import { MorphSlab, useIrisClockTexture, drawIrisClock, textTexture, navyBackground } from "./models/MorphSlab";
import { T, T2, END_S } from "./timeline";
import { act2Poses } from "./phases";
import { PLATES, plateTransform } from "./models/Targets";
import { mulberry } from "../3d-models/textures";
import { Act2, flightCam } from "./Act2";
import { NL, ws } from "./timing";
import { COLORS, FONT } from "../presets/theme";

const FPS = 60;
const Y0 = 0.55;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const VIOLET = "#8a6bff", BLUE = "#4f7dff";

const rotPoses = (P: Pose[], ang: number): Pose[] => P.map((p) => ({ c: p.c.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang), L: p.L.map((v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang)) as Pose["L"] }));

/** shard poses as a pure function of time */
const shardPoses = (d: ShardData, t: number): { poses: Pose[]; visible: boolean; mirrorness: number; opacity?: number } => {
  if (t >= T2.plates0) return act2Poses(d, t);
  const orbAng = t * 0.35;
  if (t < T.shatter) return { poses: rotPoses(d.orb, orbAng), visible: true, mirrorness: 0 };
  if (t < T.tiles0) {
    const k = pr(t, T.shatter, T.tiles0 + 0.15);
    return { poses: blend(d, rotPoses(d.orb, orbAng), rotPoses(d.exploded, orbAng), sm(k), { spread: 0.35, lift: 0.1, spin: 0.5 }), visible: true, mirrorness: 0 };
  }
  if (t < T.tiles1 + 0.02) {
    const k0 = pr(T.tiles0, T.shatter, T.tiles0 + 0.15);
    const from = blend(d, rotPoses(d.orb, orbAng), rotPoses(d.exploded, orbAng), sm(k0), { spread: 0.35, lift: 0.1, spin: 0.5 });
    const k = pr(t, T.tiles0, T.tiles1);
    // top rows land first → mirror is "built" from top to bottom
    return { poses: blend(d, from, d.mirror, k, { spread: 0.45, lift: 0.55, spin: 1, rank: (i) => 1 - (d.mirror[i].c.y + 1.4) / 2.8 }), visible: true, mirrorness: sm(pr(t, T.tiles0 + 0.2, T.tiles1)) };
  }
  if (t < T.dissolve) return { poses: d.mirror, visible: false, mirrorness: 1 };
  const vEnd = T.dissolve + 0.32;
  if (t < vEnd) return { poses: blend(d, d.clock, vortex(d, t), pr(t, T.dissolve, vEnd), { spread: 0.5, lift: 0.3, rank: (i) => d.clock[i].c.length() / CLOCK_R }), visible: true, mirrorness: 0 };
  const k = pr(t, vEnd - 0.02, T.orbBack + 0.05);
  return { poses: blend(d, vortex(d, t), rotPoses(d.damaged, orbAng), k, { spread: 0.5, lift: 0.2, rank: (i) => (d.orb[i].c.y + 1.1) / 2.2 }), visible: true, mirrorness: 0 };
};

/** continuous camera path (Catmull-Rom through time-keyed points) */
const CAM: [number, [number, number, number], [number, number, number], number][] = [
  // time, position, look, fov
  [0, [-1.6, 0.6, 8.6], [0, 0.4, 0], 34],
  [T.shatter, [-0.6, 0.4, 7.9], [0, 0.4, 0], 34],
  [T.tiles1, [0.2, 0.25, 7.8], [0, 0.35, 0], 34],
  [T.eye1, [0.9, 0.3, 8.4], [0, 0.35, 0], 34],
  [T.clock1, [-0.4, 0.5, 7.9], [0, 0.4, 0], 34],
  [T.dissolve, [-1.2, 0.9, 8.1], [0, 0.45, 0], 34],
  [T.orbBack, [1.6, -0.9, 6.6], [0, 0.65, 0], 36],
  [T2.plates0, [2.2, -1.0, 6.0], [0, 0.6, 0], 37],
  [T2.plates1, [0.6, 0.2, 5.4], [0, 0.5, -3], 40],
  [T2.plates1 + 0.8, [0.15, 0.55, 1.2], [0, 0.55, -7], 42],
  [T2.eyeT0, [-0.2, 0.6, -2.4], [0, 0.55, -10], 38],
  [T2.eyeT1 + 0.4, [0.35, 0.45, -1.9], [0, 0.5, -10], 34],
  [T2.heart0, [-0.4, 0.2, -2.4], [0, 0.55, -10], 34],
  [T2.heartShat, [0.3, 0.7, -2.6], [0, 0.55, -10], 34],
  [T2.word1 + 0.3, [0, 0.5, -2.2], [0, 0.55, -10], 34],
  [T2.domino0 + 0.3, [1.4, 1.6, -5.2], [0, 0.0, -12.6], 38],
  [T2.fall0 + 0.8, [2.2, 1.4, -6.2], [-0.2, 0.0, -12.9], 38],
  [T2.city1, [3.0, 2.0, -5.6], [0, 0.2, -10.2], 38],
  [T2.crumble, [-1.6, 0.9, -7.2], [0, 0.2, -10.4], 40],
  [T2.vortex0, [-0.6, 1.2, -3.8], [0, 0.55, -10], 38],
  [T2.collapse0, [0.5, 0.5, -4.6], [0, 0.55, -10], 38],
  [T2.collapse1 + 0.2, [0, 0.5, 0.4], [0, 0.55, -10], 34],
  [T2.glass0 + 0.4, [-2.6, 0.9, -4.6], [0, 0.55, -10], 36],
  [T2.sand1, [2.6, 0.7, -4.5], [0, 0.5, -10], 36],
  [T2.wave1, [0, 0.6, -3.6], [0, 0.55, -10], 36],
  [T2.path0, [-0.8, 0.7, -4.0], [-0.6, 0.55, -10], 38],
];
const camAt = (t: number) => {
  if (t >= T2.path0) {
    // hand over smoothly from the spline to the follow-cam of the flight
    const k = sm(pr(t, T2.path0, T2.path1 + 0.2));
    const a = camAtSpline(T2.path0), b = flightCam(t, Y0);
    return { pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k), fov: lerp(a.fov, b.fov, k) };
  }
  return camAtSpline(t);
};
const camAtSpline = (t: number) => {
  const pts = CAM.map((c) => new THREE.Vector3(...c[1]));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const f = cl((t - CAM[i][0]) / (CAM[i + 1][0] - CAM[i][0]));
  const u = (i + f) / (CAM.length - 1);
  const look = new THREE.Vector3(...CAM[i][2]).lerp(new THREE.Vector3(...CAM[i + 1][2]), sm(f));
  return { pos: curve.getPoint(u), look, fov: lerp(CAM[i][3], CAM[i + 1][3], sm(f)) };
};

/** Soft night-studio reflections: big white/blue softboxes in front, violet strips at the sides. */
const NightEnv: React.FC<{ k: number }> = ({ k }) => (
  <Environment resolution={512} frames={1}>
    <color attach="background" args={["#05070f"]} />
    <Lightformer form="rect" intensity={2.4 * k} color="#eef2ff" position={[0, 4, 7]} scale={[12, 4, 1]} />
    <Lightformer form="rect" intensity={1.4 * k} color="#5d7cff" position={[0, -3, 7]} scale={[12, 3, 1]} />
    <Lightformer form="rect" intensity={3 * k} color="#8a6bff" position={[-6, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[0.5, 9, 1]} />
    <Lightformer form="rect" intensity={3 * k} color="#6aa0ff" position={[6, 1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[0.5, 9, 1]} />
    <Lightformer form="rect" intensity={1.5 * k} color="#ffffff" position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
    <Lightformer form="rect" intensity={0.5 * k} color="#c9d4ff" position={[0, 0, 10]} scale={[16, 12, 1]} />
  </Environment>
);

/** abstract light patterns (memories) glowing inside the floating glass plates */
const memoryTex = (i: number) => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 368; const c = cv.getContext("2d")!; const r = mulberry(100 + i);
  const g = c.createLinearGradient(0, 0, 512, 368); g.addColorStop(0, "rgba(40,50,120,0.6)"); g.addColorStop(1, "rgba(90,50,140,0.5)"); c.fillStyle = g; c.fillRect(0, 0, 512, 368);
  for (let k = 0; k < 26; k++) { const x = r() * 512, y = r() * 368, rad = 10 + r() * 60; const b = c.createRadialGradient(x, y, 0, x, y, rad); const col = r() > 0.5 ? "190,205,255" : "215,180,255"; b.addColorStop(0, `rgba(${col},${0.5 + r() * 0.5})`); b.addColorStop(1, `rgba(${col},0)`); c.fillStyle = b; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill(); }
  for (let k = 0; k < 4; k++) { c.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.3})`; c.lineWidth = 2 + r() * 3; c.beginPath(); const y0 = r() * 368; c.moveTo(0, y0); c.bezierCurveTo(170, y0 + (r() - 0.5) * 200, 340, y0 + (r() - 0.5) * 200, 512, r() * 368); c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const MemoryLights: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const mats = useMemo(() => PLATES.map((_, i) => new THREE.MeshBasicMaterial({ map: memoryTex(i), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })), []);
  return <>{PLATES.map((pl, i) => { const tr = plateTransform(i, t); mats[i].opacity = k * (0.55 + 0.45 * Math.sin(t * 2 + i) ** 2); return <mesh key={i} material={mats[i]} position={tr.p} rotation={tr.r}><planeGeometry args={[pl.w * 0.96, pl.h * 0.96]} /></mesh>; })}</>;
};

const Background: React.FC = () => {
  const { scene } = useThree();
  const tex = useMemo(navyBackground, []);
  scene.background = tex;
  return null;
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const d = useMemo(buildShards, []);
  const cracks1 = useMemo(() => buildCracks(7, 26, 3), []);
  const cracks2 = useMemo(() => buildCracks(16, 30, 9, new THREE.Vector3(0.55, 0.45, 0.7).normalize()), []);
  const { cv, tex } = useIrisClockTexture();
  const wahr = useMemo(() => textTexture("wahres Ich", 300, 600), []);

  // ── materials (morphing) ──
  const shardMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#dfe6ff", roughness: 0.03, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.32, side: THREE.DoubleSide, envMapIntensity: 2.2, iridescence: 0.5, iridescenceIOR: 1.4, depthWrite: false }), []);
  const slabMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.0, transparent: true, side: THREE.FrontSide, iridescenceIOR: 1.4 }), []);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 1.0, roughness: 0.5, transparent: true }), [tex]);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dfe3ec", metalness: 1, roughness: 0.15, transparent: true }), []);
  const shadowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, depthWrite: false }), []);
  const textMat = useMemo(() => new THREE.MeshBasicMaterial({ map: wahr, transparent: true, depthWrite: false, toneMapped: false }), [wahr]);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(BLUE), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const beamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3.3, 4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), []);

  // ── shards ──
  const S = shardPoses(d, t);
  const m = S.mirrorness;
  const sOp = S.opacity ?? 1;
  shardMat.metalness = lerp(0.1, 1, m); shardMat.opacity = lerp(0.32, 1, m) * sOp;
  const wordGlow = t > T2.heartShat ? (pr(t, T2.word1 - 0.3, T2.word1 + 0.2) * (1 - pr(t, T2.domino0, T2.domino1))) + (pr(t, T2.collapse0, T2.collapse1) * (1 - pr(t, T2.dust0, T2.dust0 + 0.3))) : 0;
  const plateK = t > T2.plates0 && t < T2.eyeT1 ? pr(t, T2.plates0, T2.plates1) * (1 - pr(t, T2.eyeT0, T2.eyeT1)) : 0;
  shardMat.emissive.setRGB(0.55, 0.62, 1); shardMat.emissiveIntensity = 0.55 * wordGlow + 0.25 * plateK;
  shardMat.opacity = Math.max(shardMat.opacity, (0.85 * wordGlow + 0.55 * plateK) * sOp); shardMat.depthWrite = m > 0.9; shardMat.color.setRGB(lerp(0.87, 0.82, m), lerp(0.9, 0.85, m), lerp(1, 0.92, m));

  // ── orb glow & cracks ──
  const orbVis = t < T.shatter + 0.35 ? 1 - pr(t, T.shatter, T.shatter + 0.35) : t > T.orbBack - 0.3 ? pr(t, T.orbBack - 0.3, T.orbBack + 0.2) * (1 - pr(t, T2.plates0, T2.plates0 + 0.3)) : 0;
  const crackGrow = pr(t, T.crack0, T.shatter - 0.05);
  const flash = Math.exp(-Math.max(0, t - T.shatter) * 9) * (t >= T.shatter ? 1 : 0);
  glowMat.opacity = 0.22 * orbVis + flash * 0.6;

  // ── slab (mirror → eye → clock crystal) ──
  const slabOn = t >= T.tiles1 && t < T.dissolve + 0.08;
  const act2 = t >= T2.eyeT1 - 0.1;
  const clear = sm(pr(t, T.clear0, T.clear1));
  const eye = sm(pr(t, T.eye0, T.eye1));
  const circ = sm(pr(t, T.clock0, T.clock1));
  // material morph: chrome mirror → clear glass (eye lens) → watch crystal
  slabMat.metalness = lerp(1, 0.08, clear); slabMat.roughness = lerp(0.015, 0.03, clear); slabMat.color.setRGB(lerp(0.95, 0.8, clear), lerp(0.96, 0.86, clear), lerp(1, 1, clear));
  slabMat.opacity = lerp(1, 0.2, clear) * (1 - pr(t, T.dissolve, T.dissolve + 0.08));
  slabMat.depthWrite = clear < 0.5;
  slabMat.iridescence = 0.6 * clear * (1 - circ);

  // ── iris / clock face ──
  const irisK = sm(pr(t, T.iris0, T.iris1));
  const pupil = 0.75 + 0.15 * Math.sin(t * 2.4);
  const irisCrack = 0; // used in scene 7 of the full video
  if (slabOn) { drawIrisClock(cv, circ, pupil, irisCrack, t); tex.needsUpdate = true; }
  const faceR = lerp(0.54 * irisK, CLOCK_R * 0.96, circ);
  const faceOp = 1 - pr(t, T.dissolve - 0.02, T.dissolve + 0.1);
  if (!act2) { faceMat.opacity = faceOp; metal.opacity = faceOp; }
  const look = { x: Math.sin(t * 1.3) * 0.16 * (1 - circ), y: Math.cos(t * 0.9) * 0.06 * (1 - circ) };
  // clock hands accelerate
  const hc = Math.max(0, t - T.clock0);
  const minuteA = -(hc * 1.2 + hc * hc * hc * 0.9);
  const hourA = minuteA / 12 - 0.8;
  const spinY = circ * Math.sin(Math.max(0, t - T.clock1) * 1.4) * 0.55;
  const shadow = sm(pr(t, T.shadow0, T.shadow1));
  shadowMat.opacity = 0.82 * faceOp;

  // ── light beam through the eye ──
  const bk = pr(t, T.beam0, T.beam1);
  beamMat.opacity = Math.sin(Math.PI * bk);

  const cam = camAt(t);
  // scene 7: dramatic light (key dips, violet rim rises)
  const drama = sm(pr(t, T2.eyeT1, T2.eyeT1 + 0.6)) * (1 - sm(pr(t, T2.heart0, T2.heart1)));
  const lightDim = (1 - 0.55 * shadow * (t < T.dissolve ? 1 : 0)) * (1 - 0.5 * drama);
  const wahrOp = sm(pr(t, T.behind, T.behind + 0.35)) * (1 - pr(t, T.eye0, T.eye0 + 0.35));
  textMat.opacity = wahrOp;

  return (
    <>
      <Background />
      <CameraRig pos={[cam.pos.x, cam.pos.y, cam.pos.z]} look={[cam.look.x, cam.look.y, cam.look.z]} fov={cam.fov} />
      <NightEnv k={1} />
      <ambientLight intensity={0.05} />
      <spotLight position={[2.5, 6, 5]} angle={0.5} penumbra={1} intensity={90 * lightDim} color="#e8ecff" />
      <pointLight position={[-3, -1, -2.5]} intensity={45 * lightDim + 160 * drama} color={VIOLET} distance={14} />
      <spotLight position={[4 * Math.sin(t * 1.5), 5, -6]} angle={0.25} penumbra={0.5} intensity={200 * drama} color="#ffffff" target-position={[0, 0.55, -10]} />
      <pointLight position={[3, 2, -3]} intensity={35 * lightDim} color={BLUE} distance={12} />
      <Sparks t={t} origin={[0, -3, -3]} color="#b8c6ff" spread={5} speed={0.25} count={110} life={9} intensity={0.8 * (1 - pr(t, T2.path0, T2.path1))} seed={21} />
      <Sparks t={t} origin={[0, -3, -11]} color="#b8c6ff" spread={6} speed={0.22} count={140} life={9} intensity={0.8 * pr(t, T2.plates1, T2.eyeT0) * (1 - pr(t, T2.path0, T2.path1))} seed={22} />

      <group position={[0, Y0, 0]}>
        {/* glass shards: orb / flying pieces / mirror tiles / particles */}
        <ShardMesh poses={S.poses} material={shardMat} visible={S.visible} />
        {/* inner light of the orb */}
        <mesh material={glowMat} scale={0.55 + flash * 0.6}><sphereGeometry args={[1, 32, 16]} /></mesh>
        <pointLight intensity={(6 + flash * 60) * orbVis} color="#8fa6ff" distance={4} />
        <group rotation={[0, t * 0.35, 0]}>
          <Cracks paths={cracks1} grow={crackGrow} opacity={t < T.shatter ? 1 : 1 - pr(t, T.shatter, T.shatter + 0.12)} />
          {t > T.orbBack - 0.2 && t < T2.plates0 + 0.15 && <Cracks paths={[...cracks1, ...cracks2]} grow={pr(t, T.orbBack, T.orbBack + 1.6)} opacity={pr(t, T.orbBack - 0.1, T.orbBack + 0.2) * (1 - pr(t, T2.plates0, T2.plates0 + 0.12))} width={2.6} />}
        </group>

        {plateK > 0.01 && <MemoryLights t={t} k={plateK} />}
        {act2 && <Act2 t={t} d={d} cv={cv} tex={tex} slabMat={slabMat} faceMat={faceMat} metal={metal} frame={f} />}
        {/* morphing body + things inside / behind it */}
        {slabOn && (
          <group rotation={[0, spinY, 0]}>
            <MorphSlab s={{ eye, circle: circ }} material={slabMat} />
            <mesh material={textMat} position={[0, 0, -0.5]} visible={wahrOp > 0.001}><planeGeometry args={[1.75, 0.44]} /></mesh>
            {faceR > 0.01 && (
              <group position={[look.x, look.y, 0]}>
                <mesh material={faceMat} scale={faceR} position={[0, 0, -0.02]}><circleGeometry args={[1, 96]} /></mesh>
                {circ > 0.05 && (
                  <group position={[0, 0, 0.03]} scale={circ}>
                    <mesh material={metal} rotation={[0, 0, hourA]} position={[Math.sin(-hourA) * 0.28, Math.cos(-hourA) * 0.28, 0.02]}><boxGeometry args={[0.07, 0.6, 0.03]} /></mesh>
                    <mesh material={metal} rotation={[0, 0, minuteA]} position={[Math.sin(-minuteA) * 0.42, Math.cos(-minuteA) * 0.42, 0.04]}><boxGeometry args={[0.04, 0.86, 0.03]} /></mesh>
                    <mesh material={metal}><torusGeometry args={[CLOCK_R * 0.99, 0.045, 24, 128]} /></mesh>
                  </group>
                )}
                {shadow > 0 && <mesh material={shadowMat} position={[0, 0, 0.2]} rotation={[0, 0, Math.PI / 2]}><circleGeometry args={[CLOCK_R * 1.05, 96, 0, Math.PI * 2 * shadow]} /></mesh>}
              </group>
            )}
            {bk > 0 && bk < 1 && <mesh material={beamMat} position={[lerp(-2.2, 2.2, bk), 0, 0.35]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.035, 4, 0.01]} /></mesh>}
          </group>
        )}
      </group>
    </>
  );
};

/* ───────── typography ───────── */
const fr = (s: number) => Math.round(s * FPS);

/** Liquid word morph (gooey: blur + contrast). Shows `a` from tA, morphs into `b` at tB. */
const GooeyMorph: React.FC<{ a: string; b: string; tA: number; tB: number; tOut: number; top: number; size: number }> = ({ a, b, tA, tB, tOut, top, size }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const inA = pr(t, tA - 0.1, tA + 0.25);
  const k = sm(pr(t, tB - 0.25, tB + 0.15));
  const out = pr(t, tOut, tOut + 0.35);
  const goo = Math.sin(Math.PI * k);
  const blurA = (1 - inA) * 14 + k * 16, blurB = (1 - k) * 16;
  const st: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.family, fontWeight: 800, fontSize: size, letterSpacing: "0.04em", color: "#fff" };
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, height: size * 1.6, background: "#000", mixBlendMode: "screen", filter: `contrast(${1 + goo * 22}) blur(${out * 12}px)`, opacity: 1 - out }}>
      <div style={{ ...st, filter: `blur(${blurA}px)`, opacity: inA * (1 - k) }}>{a}</div>
      <div style={{ ...st, filter: `blur(${blurB}px)`, opacity: k, textShadow: `0 0 40px ${hexA(BLUE, 0.5)}` }}>{b}</div>
    </div>
  );
};

/** words placed on an arc around the orb; they get blown outward when it shatters. */
const ArcLine: React.FC<{ line: number; cx: number; cy: number; r: number; blowAt: number; size: number }> = ({ line, cx, cy, r, blowAt, size }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const words = NL[line].words;
  const top = Math.ceil(words.length * 0.43);
  const blow = sm(pr(t, blowAt, blowAt + 0.7));
  return (
    <>
      {words.map((w, i) => {
        const onTop = i < top;
        const n = onTop ? top : words.length - top, j = onTop ? i : i - top;
        const span = onTop ? 100 : 110;
        const deg = onTop ? -90 - span / 2 + (span * (j + 0.5)) / n : 90 + span / 2 - (span * (j + 0.5)) / n;
        const a = (deg * Math.PI) / 180;
        const rr = r * (1 + blow * 0.35);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        const rot = onTop ? deg + 90 : deg - 90;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: 1 - blow, filter: `blur(${blow * 14}px)` }}>
            <Word text={w.w} at={fr(w.s)} size={size} weight={i === 3 ? 800 : 500} reveal="blur" dur={18} tracking={0.02} color={i === 3 ? "#fff" : COLORS.silver} glow={i === 3 ? hexA(BLUE, 0.4) : undefined} />
          </div>
        );
      })}
    </>
  );
};

export const NiemalsOverlay: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  return (
    <>
      {/* scene 1 – around the orb */}
      {t < T.tiles1 && <ArcLine line={0} cx={540} cy={745} r={545} blowAt={T.shatter} size={64} />}
      {/* scene 2 – „wahres Ich“ lives in 3D behind the mirror; the rest below */}
      {t > 2.0 && t < T.eye0 + 0.6 && <LineText lyrics={NL} line={1} only={[0, 5]} top={1395} maxSize={78} weight={500} color={COLORS.silver} reveal="rise" exitAt={fr(T.eye0)} />}
      {/* ICH → AUGEN liquid morph (scene 2 → 3) */}
      {t > 3.5 && t < T.clock0 + 0.6 && (
        <>
          <GooeyMorph a="ICH" b="AUGEN" tA={NL[1].words[NL[1].words.length - 1].s} tB={ws(2, "augen")} tOut={T.clock0} top={1480} size={190} />
          <LineText lyrics={NL} line={2} only={[0, 1]} top={1400} maxSize={64} weight={500} color={COLORS.silver} reveal="rise" exitAt={fr(T.clock0)} />
          <LineText lyrics={NL} line={2} only={[2, 4]} top={1800} maxSize={70} weight={500} color={COLORS.silver} reveal="track" tracking={0.04} exitAt={fr(T.clock0)} />
        </>
      )}
      {/* scene 4 – clock; „weggeschaut“ sinks into the shadow */}
      {t > T.clock0 && t < T.dissolve + 0.6 && (
        <div style={{ opacity: 1 - 0.7 * sm(pr(t, T.shadow0 + 0.3, T.shadow1)), filter: `blur(${sm(pr(t, T.shadow0 + 0.3, T.shadow1)) * 6 + pr(t, T.dissolve, T.dissolve + 0.4) * 20}px)` }}>
          <LineText lyrics={NL} line={3} only={[0, 5]} top={1430} maxSize={76} weight={500} color={COLORS.silver} reveal="rise" />
          <LineText lyrics={NL} line={3} only={[5, 6]} top={1550} maxSize={150} weight={800} reveal="blur" dur={24} />
        </div>
      )}
      {/* scene 5 – repetition, escalated: big stacked words */}
      {t > T.orbBack - 0.3 && t < T2.plates1 + 0.5 && <LineText exitAt={fr(T2.plates0 + 0.2)} lyrics={NL} line={4} centerY={1680} maxSize={118} maxRows={3} weight={800} upper reveal="drop" dur={12} dimPast highlight={{ niemals: { color: "#fff", glow: hexA(VIOLET, 0.5) } }} />}
    </>
  );
};

/** Act 2 typography */
const Act2Text: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const k = beatPulseLocal(t);
  const crumble = sm(pr(t, T2.crumble + 0.35, T2.vortex0 + 0.3));
  const decay = sm(pr(t, T2.wave1 + 0.3, T2.decay1));
  const endFade = sm(pr(t, T2.fade0 + 0.3, END_S));
  return (
    <>
      {/* 6 – memories chase me */}
      {t > ls5 - 0.3 && t < T2.eyeT1 && (
        <div style={{ transform: `translateX(${-sm(pr(t, T2.eyeT0, T2.eyeT1)) * 120}px)`, filter: `blur(${pr(t, T2.eyeT0 + 0.2, T2.eyeT1) * 16}px)`, opacity: 1 - pr(t, T2.eyeT0 + 0.2, T2.eyeT1) }}>
          <LineText lyrics={NL} line={5} hide={["mich"]} top={1420} maxSize={96} maxRows={1} weight={300} reveal="slide" dur={18}
            highlight={{ "erinnerung'n": { weight: 700, gradient: "linear-gradient(90deg,#ffffff,#a9b8ff 60%,#c4a8ff)" }, jagen: { weight: 700 } }} />
        </div>
      )}
      {/* 6 → 7 liquid word morph MICH → AUGEN */}
      {t > ws(5, "mich") - 0.3 && t < T2.heart0 + 0.6 && (
        <>
          <GooeyMorph a="MICH" b="AUGEN" tA={ws(5, "mich")} tB={ws(6, "augen")} tOut={T2.heart0} top={1560} size={190} />
          <LineText lyrics={NL} line={6} only={[0, 1]} top={1470} maxSize={64} weight={500} color={COLORS.silver} reveal="rise" exitAt={fr(T2.heart0)} />
          <LineText lyrics={NL} line={6} only={[2, 4]} top={1860} maxSize={60} weight={600} color={COLORS.silver} reveal="track" tracking={0.08} exitAt={fr(T2.heart0)} />
        </>
      )}
      {/* 8 – trusted you: „vertraut“ glows like the heart */}
      {t > ls7 - 0.3 && t < T2.heartShat + 0.5 && (
        <LineText lyrics={NL} line={7} top={1460} maxSize={104} weight={500} reveal="blur" dur={20} exitAt={fr(T2.heartShat - 0.3)}
          highlight={{ vertraut: { weight: 800, color: "#ffd6e6", glow: hexA("#ff5a8a", 0.55), scale: 1.25 } }} />
      )}
      {/* 9 – the word itself is built from the heart's shards (3D); the rest as text */}
      {t > ls8 - 0.3 && t < T2.domino0 + 0.5 && <LineText lyrics={NL} line={8} hide={["undankbar"]} top={1500} maxSize={96} weight={500} color={COLORS.silver} reveal="rise" exitAt={fr(T2.domino0)} />}
      {/* 10 – words tip over like dominoes */}
      {t > ls9 - 0.3 && t < T2.city1 + 0.4 && (
        <div style={{ opacity: 1 - pr(t, T2.city0 + 0.3, T2.city1 + 0.3), filter: `blur(${pr(t, T2.city0 + 0.3, T2.city1 + 0.3) * 14}px)` }}>
          <LineText lyrics={NL} line={9} top={1480} maxSize={104} weight={700} reveal="flip" dur={14} highlight={{ grund: { weight: 300 } }} />
        </div>
      )}
      {/* 11 – the world breaks: text falls with the debris */}
      {t > ls10 - 0.3 && t < T2.vortex1 && (
        <div style={{ transform: `translateY(${crumble * crumble * 520}px) rotate(${crumble * 5}deg)`, opacity: 1 - crumble, filter: `blur(${crumble * 10}px)` }}>
          <LineText lyrics={NL} line={10} top={1450} maxSize={128} weight={800} reveal="drop" dur={12} upper highlight={{ "zerstör'n": { color: "#c4a8ff", glow: hexA(VIOLET, 0.5) } }} />
        </div>
      )}
      {/* 12 – chaos keeps me awake: the line sways with the vortex */}
      {t > ls11 - 0.3 && t < T2.collapse1 && (
        <div style={{ transform: `rotate(${Math.sin(t * 2.2) * 2.5}deg) scale(${1 + k * 0.03})`, opacity: 1 - pr(t, T2.collapse0, T2.collapse1), filter: `blur(${pr(t, T2.collapse0, T2.collapse1) * 18}px)` }}>
          <LineText lyrics={NL} line={11} top={1440} maxSize={100} weight={600} reveal="scale" dur={14} dimPast highlight={{ chaos: { weight: 900, color: "#c4a8ff", glow: hexA(VIOLET, 0.6), scale: 1.3 }, wach: { weight: 900 } }} />
        </div>
      )}
      {/* 14 – calm, light */}
      {t > ls13 - 0.3 && t < T2.wave1 + 0.3 && <LineText lyrics={NL} line={13} top={1480} maxSize={104} weight={300} reveal="blur" dur={24} exitAt={fr(T2.wave0 + 0.1)} highlight={{ jung: { weight: 600 } }} />}
      {/* 15 – can't hear it anymore: the line gets quieter with the waves */}
      {t > ls14 - 0.3 && t < T2.path1 && (
        <div style={{ opacity: 1 - decay * 0.75 - pr(t, T2.path0, T2.path1) * 0.25, transform: `scale(${1 - decay * 0.12})`, letterSpacing: `${-decay * 0.02}em` }}>
          <LineText lyrics={NL} line={14} top={1480} maxSize={104} weight={500} reveal="track" dur={20} tracking={0.0} highlight={{ "hör'n": { weight: 300 } }} />
        </div>
      )}
      {/* 16 – fly aimlessly through the night */}
      {t > ls15 - 0.3 && (
        <div style={{ transform: `translate(${-endFade * 40}px, ${-endFade * 60}px)`, opacity: 1 - endFade * 0.85 }}>
          <LineText lyrics={NL} line={15} top={1420} maxSize={110} weight={400} reveal="blur" dur={26} maxRows={3} highlight={{ planlos: { weight: 700 }, nacht: { weight: 800, gradient: "linear-gradient(180deg,#ffffff,#9fb4ff)", scale: 1.15 } }} />
        </div>
      )}
    </>
  );
};
const ls5 = NL[5].start, ls7 = NL[7].start, ls8 = NL[8].start, ls9 = NL[9].start, ls10 = NL[10].start, ls11 = NL[11].start, ls13 = NL[13].start, ls14 = NL[14].start, ls15 = NL[15].start;
const beatPulseLocal = (t: number) => { const b = 60 / 107.666; const ph = (t - 0.07) / b; return Math.exp(-((ph - Math.floor(ph)) * b) * 7); };

export const NiemalsScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#030407" }}>
    <Audio src={staticFile("niemals.mp3")} />
    <Stage3D bloom={0.85} bloomThreshold={0.62} transparent={false}><World /></Stage3D>
    <NiemalsOverlay />
    <Act2Text />
    <Vignette strength={0.55} />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
