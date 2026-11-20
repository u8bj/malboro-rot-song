// Lines 22–34 (song 0:52 – end)
import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { LineText, findWord, lineEnd, lineStart } from "../../components/LineText";
import { Word } from "../../components/KineticText";
import { hexA } from "../../components/Background";
import { Smoke } from "../../components/Smoke";
import { Sparks } from "../../components/Sparks";
import { smokeTexture } from "../../3d-models/textures";
import { Scales, ShoeBox, Vinyl, Crown, ChromeBalls } from "../../3d-models/Objects";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog, spr } from "../../animations/ease";
import { COLORS, FONT } from "../../presets/theme";
import spectrum from "../../lyrics/spectrum.json";

const fps = 60;
const spec = spectrum as number[][];

/* 22 · Fick auf alles, wenn ich nächtelang nicht schlafen kann – moon, stars, racing night clock */
export const Shot22: React.FC = () => {
  const f = useCurrentFrame(); const L = 22; const s0 = lineStart(L), e = lineEnd(L);
  const p = prog(f, s0, e - s0 + 20, ez.inOut);
  const mins = Math.floor(lerp(0, 5 * 60 + 12, p));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #05070d, #050505 70%)" }}>
      {Array.from({ length: 120 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`x${i}`) * 1080, top: random(`y${i}`) * 1100, width: 2 + random(`s${i}`) * 2, height: 2 + random(`s${i}`) * 2, borderRadius: 2,
          background: "#fff", opacity: 0.2 + 0.8 * Math.abs(Math.sin(f / (20 + random(`t${i}`) * 40) + i)) }} />
      ))}
      <div style={{ position: "absolute", left: 640, top: 210 + p * 60, width: 260, height: 260, borderRadius: 130, background: "radial-gradient(circle at 35% 35%, #f4f1e8, #c9c4b6 60%, #8f8a7f)",
        boxShadow: "0 0 80px rgba(240,236,220,0.35), 0 0 200px rgba(240,236,220,0.15)" }} />
      <div style={{ position: "absolute", top: 640, width: 1080, textAlign: "center", fontFamily: FONT.family, fontWeight: 200, fontSize: 230, color: COLORS.white, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", opacity: prog(f, s0 - 8, 14) }}>
        {String(Math.floor(mins / 60)).padStart(2, "0")}<span style={{ opacity: f % 60 < 30 ? 1 : 0.25 }}>:</span>{String(mins % 60).padStart(2, "0")}
      </div>
      <LineText line={L} top={1180} maxSize={120} weight={700} reveal="blur" dur={16} highlight={{ nächtelang: { color: COLORS.ice, weight: 300 }, schlafen: { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* 23 · Ich bin im Recht, wenn ich dann besser lebe – golden scales of justice tipping */
export const Shot23: React.FC = () => {
  const f = useCurrentFrame(); const L = 23; const s0 = lineStart(L), rec = findWord(L, "recht"), bes = findWord(L, "besser");
  const tilt = lerp(0, 0.22, spr(f, rec, { damping: 10, stiffness: 60 })) - lerp(0, 0.4, spr(f, bes, { damping: 10, stiffness: 60 }));
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.0} bloomThreshold={0.65} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[Math.sin(t * 0.3) * 2, 2.2, 9]} look={[0, 1.5, 0]} fov={34} />
        <StudioEnv tint="#ffe2a8" intensity={1} />
        <spotLight position={[0, 9, 2]} angle={0.4} penumbra={0.8} intensity={220} color="#fff1d6" castShadow />
        <Scales tilt={tilt} position={[0, -0.2, 0]} />
        <Sparks t={t} origin={[0, 0, 0]} color="#ffd27a" spread={2} speed={0.6} count={50} />
      </Stage3D>
      <LineText line={L} top={1360} maxSize={120} weight={700} reveal="rise" highlight={{ recht: { color: COLORS.gold, glow: hexA(COLORS.gold, 0.4), weight: 900 }, besser: { weight: 900 } }} />
    </AbsoluteFill>
  );
};

/* 24 · Ich bin echt, denn ich brech' das Gesetz – giant § breaks in two */
export const Shot24: React.FC = () => {
  const f = useCurrentFrame(); const L = 24; const s0 = lineStart(L), br = findWord(L, "brech'"), ges = findWord(L, "gesetz");
  const crack = prog(f, br, 8, ez.snap), split = spr(f, ges, { damping: 14, stiffness: 70 });
  const glyph = (side: 1 | -1) => (
    <AbsoluteFill style={{ clipPath: side < 0 ? "polygon(0 0, 52% 0, 46% 30%, 54% 45%, 44% 62%, 50% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 50% 100%, 44% 62%, 54% 45%, 46% 30%)",
      transform: `translate(${side * split * 120}px, ${split * side * 30}px) rotate(${side * split * 8}deg)` }}>
      <div style={{ position: "absolute", top: 160, width: 1080, textAlign: "center", fontFamily: FONT.family, fontWeight: 200, fontSize: 900, lineHeight: "1", color: COLORS.white,
        textShadow: `0 0 60px ${hexA("#ffffff", 0.2)}`, opacity: prog(f, s0 - 8, 14) }}>§</div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 40%, ${hexA(COLORS.red, 0.25 * split)}, transparent 70%)` }}>
      {glyph(-1)}{glyph(1)}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - split }}>
        <polyline points="560,250 495,470 585,640 475,850 540,1150" fill="none" stroke={COLORS.red} strokeWidth={6} pathLength={1} strokeDasharray={`${crack} 1`} style={{ filter: `drop-shadow(0 0 12px ${COLORS.red})` }} />
      </svg>
      <LineText line={L} top={1360} maxSize={130} weight={800} reveal="drop" dur={10} upper highlight={{ echt: { weight: 900, scale: 1.2 }, gesetz: { color: COLORS.red, glow: hexA(COLORS.red, 0.5) } }} />
    </AbsoluteFill>
  );
};

/* 25 · Und hab' hinter mir ein ganzes Arsenal wie Mkhitaryan – an army of chrome rising behind */
export const Shot25: React.FC = () => {
  const f = useCurrentFrame(); const L = 25; const s0 = lineStart(L), ars = findWord(L, "arsenal");
  const rise = prog(f, s0, ars - s0 + 50, ez.inOut);
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.9} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[lerp(-2, 2, t / 3), 1.2, 9.5]} look={[0, 0, -2]} fov={36} />
        <StudioEnv tint={COLORS.red} intensity={1.2} />
        <spotLight position={[0, 6, 6]} angle={0.6} penumbra={1} intensity={120} />
        <pointLight position={[0, -1, -6]} intensity={80} color={COLORS.red} distance={20} />
        <ChromeBalls n={9 * 9} t={t} rise={rise} />
      </Stage3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(5,5,5,0.9) 72%)" }} />
      <LineText line={L} top={1300} maxSize={110} weight={700} reveal="rise" maxRows={3}
        highlight={{ arsenal: { color: COLORS.red, glow: hexA(COLORS.red, 0.5), weight: 900, scale: 1.2 }, mkhitaryan: { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* 26 · Zimmer bis unter die Decke voll mit Schuhkartons – boxes stack to the top of frame */
const BOX_COLS = [["#e8e6e1", "#1a1a1c"], ["#141416", "#e1141e"], ["#d9d6cf", "#c7c9cc"], ["#202024", "#202024"], ["#efede8", "#e8a33a"]];
const BoxWall: React.FC<{ s0: number; per: number; camY: (f: number) => number; look: (f: number) => number }> = ({ s0, per, camY, look }) => {
  const f = useCurrentFrame();
  const slots = useMemo(() => { const o: [number, number, number][] = []; for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) o.push([(c - 1) * 1.5 + (r % 2 ? 0.35 : -0.35), r * 0.66, random(`bz${r}${c}`) * 0.4]); return o; }, []);
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <CameraRig pos={[0, camY(f), 11]} look={[0, look(f), 0]} fov={36} />
      <StudioEnv intensity={1.1} />
      <spotLight position={[3, 12, 7]} angle={0.7} penumbra={1} intensity={170} castShadow />
      {slots.map(([x, y, z], i) => {
        const p = spr(f, s0 + i * per, { damping: 15, stiffness: 140 });
        if (p < 0.001) return null;
        const [a, b] = BOX_COLS[i % BOX_COLS.length];
        return <ShoeBox key={i} color={a} lid={b} position={[x, y + (1 - p) * 8, z]} rotation={[0, (random(`br${i}`) - 0.5) * 0.25 + (1 - p) * 2, 0]} />;
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#0a0a0b" /></mesh>
    </>
  );
};
export const Shot26: React.FC = () => {
  const L = 26; const s0 = lineStart(L), e = lineEnd(L);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.4} bloomThreshold={0.85} transparent={false}>
        <BoxWall s0={s0 - 8} per={(e - s0) / 36} camY={(f) => lerp(1.5, 5.5, Math.max(0, Math.min(1, (f - s0) / (e - s0))))} look={(f) => lerp(1.2, 5.2, Math.max(0, Math.min(1, (f - s0) / (e - s0))))} />
      </Stage3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 60%, rgba(5,5,5,0.92) 76%)" }} />
      <LineText line={L} top={1420} maxSize={100} weight={700} reveal="rise" highlight={{ decke: { weight: 900 }, schuhkartons: { weight: 900, color: "#e8a33a" } }} />
    </AbsoluteFill>
  );
};

/* 27 · Ich hab' genug davon und ich knie nieder – camera sinks, words bow down */
export const Shot27: React.FC = () => {
  const f = useCurrentFrame(); const L = 27; const s0 = lineStart(L), knie = findWord(L, "knie");
  const sink = prog(f, knie - 6, 40, ez.inOut);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.4} bloomThreshold={0.85} transparent={false}>
        <BoxWall s0={s0 - 400} per={0} camY={() => lerp(5.5, 0.4, sink)} look={() => lerp(4.5, 3.5, sink)} />
      </Stage3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(5,5,5,0.92) 74%)" }} />
      <div style={{ transform: `perspective(900px) rotateX(${sink * 28}deg) translateY(${sink * 50}px)`, transformOrigin: "50% 1500px", position: "absolute", inset: 0 }}>
        <LineText line={L} top={1380} maxSize={110} weight={700} reveal="flip" highlight={{ genug: { weight: 900 }, knie: { weight: 300 }, nieder: { weight: 300 } }} />
      </div>
    </AbsoluteFill>
  );
};

/* 28 · Meine Mucke Ghetto-Gospel wie der 2Pac-Song – spinning vinyl + real audio spectrum */
export const Shot28: React.FC = () => {
  const f = useCurrentFrame(); const L = 28; const s0 = lineStart(L);
  const t = (f - s0) / fps; const inn = spr(f, s0 - 8, { damping: 20, stiffness: 70 });
  const bands = spec[Math.min(spec.length - 1, f)] ?? [];
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.8} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 6.5, 6]} look={[0, 0, 0.3]} fov={36} />
        <StudioEnv tint="#ffd6d6" intensity={1.2} />
        <spotLight position={[3, 7, 3]} angle={0.6} penumbra={1} intensity={130} />
        <Vinyl spin={t * (33.3 / 60) * Math.PI * 2} arm={inn} position={[0, 0, lerp(-6, 0, inn)]} rotation={[0, 0, 0]} />
      </Stage3D>
      {/* spectrum waves (real audio data) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((k) => {
          const pts = Array.from({ length: 60 }, (_, i) => {
            const b = bands[Math.floor((i / 60) * 24)] ?? 0;
            const y = 1200 + Math.sin(i * 0.35 + t * 6 + k) * 18 - b * (110 - k * 30) * Math.sin((i / 59) * Math.PI);
            return `${(i / 59) * 1080},${y + k * 26}`;
          }).join(" ");
          return <polyline key={k} points={pts} fill="none" stroke={k === 0 ? COLORS.red : hexA("#ffffff", 0.45 - k * 0.12)} strokeWidth={k === 0 ? 4 : 2} style={{ filter: k === 0 ? `drop-shadow(0 0 10px ${COLORS.red})` : undefined }} />;
        })}
      </svg>
      <LineText line={L} top={1380} maxSize={110} weight={700} reveal="track" dur={18} tracking={-0.01} upper
        highlight={{ "ghetto-gospel": { color: COLORS.red, glow: hexA(COLORS.red, 0.4), weight: 900 }, "2pac-song": { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* 29 · Kokain, Kokosnuss und wir ziehen wieder – drifting white crystals, abstract light trails */
export const Shot29: React.FC = () => {
  const f = useCurrentFrame(); const L = 29; const s0 = lineStart(L), zie = findWord(L, "ziehen");
  const t = (f - s0) / fps; const pull = prog(f, zie - 4, 26, ez.inOut);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 45%, #10131a, #050505)" }}>
      {Array.from({ length: 140 }, (_, i) => {
        const x0 = random(`cx${i}`) * 1080, y0 = random(`cy${i}`) * 1920, s = 2 + random(`cs${i}`) * 5;
        const x = lerp(x0 + Math.sin(t + i) * 20, -200 + (x0 * 1.6 + 400) * 1, pull) , y = lerp(y0 + t * 30 * (0.5 + random(`cv${i}`)), 700 + (i % 3) * 120, pull);
        return <div key={i} style={{ position: "absolute", left: x, top: y % 1960, width: s * (1 + pull * 12), height: s, transform: `rotate(${(1 - pull) * i * 20}deg)`, background: "#fff", boxShadow: "0 0 8px #cfe6ff", opacity: 0.25 + random(`co${i}`) * 0.6, borderRadius: 2 }} />;
      })}
      <LineText line={L} top={1220} maxSize={130} weight={300} reveal="blur" dur={18} highlight={{ ziehen: { weight: 800 }, wieder: { weight: 800 } }} />
    </AbsoluteFill>
  );
};

/* 30 · Kill den Beefeater, Rauchkette – chain of smoke rings */
const SmokeRing: React.FC<{ t: number; pos: [number, number, number]; r: number; op: number; seed: number }> = ({ t, pos, r, op, seed }) => {
  const mats = useMemo(() => Array.from({ length: 28 }, (_, i) => new THREE.SpriteMaterial({ map: smokeTexture((i % 3) + 1 + seed), transparent: true, depthWrite: false, color: "#dcdcdc" })), [seed]);
  return (
    <group position={pos} rotation={[0.3, t * 0.4 + seed, 0.2]}>
      {mats.map((m, i) => { const a = (i / 28) * Math.PI * 2; m.opacity = op; m.rotation = a + t; return <sprite key={i} material={m} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} scale={[r * 0.6, r * 0.6, 1]} />; })}
    </group>
  );
};
export const Shot30: React.FC = () => {
  const f = useCurrentFrame(); const L = 30; const s0 = lineStart(L);
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.5} bloomThreshold={0.8} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 0, 9]} look={[0, 0.8, 0]} fov={36} />
        <ambientLight intensity={1} />
        {[0, 1, 2, 3, 4].map((i) => {
          const p = Math.max(0, t - i * 0.25);
          return <SmokeRing key={i} t={t} seed={i} pos={[-2.4 + i * 1.2, 0.8 + Math.sin(i + t) * 0.3 + p * 0.25, -i * 0.3]} r={0.55 + p * 0.25} op={Math.min(1, p * 2) * 0.35} />;
        })}
        <Smoke t={t + 3} origin={[0, -2, -1]} count={20} rise={0.4} spread={2} size={2.5} opacity={0.12} life={5} seed={9} />
      </Stage3D>
      <LineText line={L} top={1340} maxSize={120} weight={700} reveal="chars" dur={14} upper highlight={{ rauchkette: { weight: 300, color: COLORS.silver } }} />
    </AbsoluteFill>
  );
};

/* 31 · Sie haben gesagt … einen Traum hätte – dreamscape: clouds, light, floating type */
export const Shot31: React.FC = () => {
  const f = useCurrentFrame(); const L = 31; const s0 = lineStart(L), tr = findWord(L, "traum");
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.9} bloomThreshold={0.6} transparent={false}>
        <color attach="background" args={["#07080f"]} />
        <CameraRig pos={[0, lerp(0, 0.8, t / 3.5), lerp(10, 7, t / 3.5)]} look={[0, 0.5, 0]} fov={40} />
        <ambientLight intensity={1} />
        <Smoke t={t + 10} origin={[0, -3.2, -2]} count={60} rise={0.25} spread={4} size={5} color="#b9c7ff" opacity={0.22} life={8} seed={11} />
        <Smoke t={t + 4} origin={[0, -2.6, 0]} count={30} rise={0.2} spread={3} size={4} color="#ffd9f0" opacity={0.16} life={8} seed={12} />
        <Sparks t={t} origin={[0, -2, 0]} color="#e8eeff" spread={4} speed={0.5} count={90} intensity={1.3} life={4} />
      </Stage3D>
      <AbsoluteFill style={{ transform: `translateY(${Math.sin(t * 1.2) * 12}px)` }}>
        <LineText line={L} centerY={880} maxSize={92} weight={300} reveal="blur" dur={26} maxRows={5} color="#e8ecff" highlight={{ traum: { weight: 800, scale: 1.7, gradient: "linear-gradient(180deg,#ffffff,#b9c7ff)", reveal: "scale" }, wichtig: { weight: 600 } }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(40% 25% at 50% 55%, ${hexA("#b9c7ff", 0.25 * prog(f, tr, 20))}, transparent 70%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/* 32 · Heute bin ich der, der … – golden crown reveal */
export const Shot32: React.FC = () => {
  const f = useCurrentFrame(); const L = 32; const s0 = lineStart(L);
  const t = (f - s0) / fps; const inn = spr(f, s0 - 10, { damping: 16, stiffness: 50 });
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.1} bloomThreshold={0.6} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 2.4, 7.5]} look={[0, 0.6, 0]} fov={34} />
        <StudioEnv tint="#ffe2a8" intensity={1.1} />
        <spotLight position={[0, 8, 2]} angle={0.35} penumbra={0.7} intensity={260} color="#fff1d6" />
        <Crown position={[0, lerp(5, 0.9, inn), 0]} rotation={[0.15, t * 0.8, 0]} scale={1.1} />
        <Sparks t={t} origin={[0, 0, 0]} color="#ffd27a" spread={2} speed={0.7} count={70} />
      </Stage3D>
      <LineText line={L} top={1320} maxSize={130} weight={800} reveal="scale" dur={12} upper highlight={{ heute: { color: COLORS.gold, glow: hexA(COLORS.gold, 0.4) } }} />
    </AbsoluteFill>
  );
};

/* 33 · 6, 66 gegen eine Unterschrift – contract + self-drawing signature */
export const Shot33: React.FC = () => {
  const f = useCurrentFrame(); const L = 33; const s0 = lineStart(L), us = findWord(L, "unterschrift");
  const paper = spr(f, s0 - 10, { damping: 22, stiffness: 60 });
  const sign = prog(f, us - 4, 46, ez.inOut);
  const n = beatPulse(f, 8, "kicks");
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 50% 40%, ${hexA(COLORS.red, 0.12 + n * 0.08)}, transparent 70%)` }}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: 150, top: 300, width: 780, height: 1000, background: "linear-gradient(180deg,#f6f4ee,#e7e3da)", borderRadius: 8,
          transform: `translateY(${(1 - paper) * 1200}px) rotateX(${22 - paper * 6}deg) rotateZ(${-4 + paper * 2}deg)`, boxShadow: "0 50px 120px rgba(0,0,0,0.7)", padding: 70, boxSizing: "border-box" }}>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ height: 12, borderRadius: 6, background: "#1c1c1f", opacity: 0.12, marginBottom: 26, width: `${60 + random(`ln${i}`) * 40}%` }} />)}
          <div style={{ position: "absolute", left: 70, right: 70, bottom: 170, height: 2, background: "#1c1c1f", opacity: 0.4 }} />
          <svg width={640} height={220} viewBox="0 0 640 220" style={{ position: "absolute", left: 70, bottom: 150 }}>
            <path d="M 20 150 C 60 40, 90 40, 80 150 S 140 60, 170 120 S 200 160, 230 90 C 250 40, 270 160, 300 120 S 340 60, 370 130 C 390 170, 420 80, 450 110 S 520 150, 610 70"
              fill="none" stroke="#14213d" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${sign} 1`} />
          </svg>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 1360, width: 1080, textAlign: "center", fontFamily: FONT.family }}>
        <Word text="6, 66" at={findWord(L, "6")} size={190} weight={900} color={COLORS.red} reveal="scale" dur={10} glow={hexA(COLORS.red, 0.5 + n * 0.3)} />
      </div>
      <LineText line={L} only={[2, 5]} top={1600} maxSize={96} weight={500} reveal="rise" highlight={{ unterschrift: { weight: 800 } }} />
    </AbsoluteFill>
  );
};

/* 34 · Ah – outro: ember dies, smoke fades to black */
export const Shot34: React.FC = () => {
  const f = useCurrentFrame(); const L = 34; const s0 = lineStart(L);
  const t = (f - s0) / fps;
  const die = prog(f, s0 + 10, 40, ez.inOut);
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.2} bloomThreshold={0.5} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 0, 6]} look={[0, 0.6, 0]} fov={36} />
        <pointLight position={[0, 0, 0.5]} intensity={(1 - die) * 20} color={COLORS.ember} distance={4} />
        <mesh><sphereGeometry args={[0.09, 32, 16]} /><meshBasicMaterial color={new THREE.Color(4 * (1 - die) + 0.1, 0.8 * (1 - die) + 0.02, 0.1)} /></mesh>
        <Smoke t={t + 5} origin={[0, 0.1, 0]} count={30} rise={0.7} spread={0.4} size={1.1} opacity={0.3 * (1 - die * 0.5)} life={4} seed={2} />
      </Stage3D>
      <div style={{ position: "absolute", top: 1300, width: 1080, textAlign: "center", opacity: 1 - prog(f, s0 + 20, 20) }}>
        <Word text="AH" at={s0} size={220} weight={900} reveal="scale" dur={8} color={COLORS.red} glow={hexA(COLORS.red, 0.5)} />
      </div>
    </AbsoluteFill>
  );
};
