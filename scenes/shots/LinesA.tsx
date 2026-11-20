// Lines 2–9 (song 0:06 – 0:22)
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ContactShadows } from "@react-three/drei";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { LineText, findWord, lineEnd, lineStart } from "../../components/LineText";
import { Word } from "../../components/KineticText";
import { hexA } from "../../components/Background";
import { leatherURL, brushedURL } from "../../components/Surfaces";
import { Smoke } from "../../components/Smoke";
import { Sparks } from "../../components/Sparks";
import { Car, Bus } from "../../3d-models/Car";
import { Trophy } from "../../3d-models/Objects";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog, spr } from "../../animations/ease";
import { COLORS, FONT } from "../../presets/theme";

const fps = 60;

/* ───────── 2 · Brandloch im Leder, Fluchtfahrt im Panamera ───────── */
export const Shot02: React.FC = () => {
  const f = useCurrentFrame();
  const L = 2;
  const burnAt = findWord(L, "brandloch"), driveAt = findWord(L, "fluchtfahrt");
  const toCar = prog(f, driveAt - 10, 14, ez.inOut);
  const hole = spr(f, burnAt + 4, { damping: 20, stiffness: 60 });
  const ember = Math.max(0, 1 - Math.max(0, f - burnAt - 20) / 50);
  return (
    <AbsoluteFill>
      {toCar < 1 && (
        <AbsoluteFill style={{ opacity: 1 - toCar, transform: `scale(${1 + toCar * 0.4})`, filter: `blur(${toCar * 20}px)` }}>
          <AbsoluteFill style={{ perspective: 1600 }}>
            <AbsoluteFill style={{ backgroundImage: `url(${leatherURL()})`, backgroundSize: "cover",
              transform: `rotateX(${lerp(18, 8, (f - burnAt + 30) / 90)}deg) scale(1.25) translateY(${-(f - burnAt) * 0.4}px)` }} />
          </AbsoluteFill>
          {/* grazing light sweep */}
          <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(40% 25% at ${lerp(10, 90, (f - burnAt + 20) / 90)}% 40%, rgba(255,240,225,0.18), transparent 70%)` }} />
          {/* burn hole */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" /><feDisplacementMap in="SourceGraphic" scale="38" /></filter>
              <radialGradient id="char"><stop offset="0.45" stopColor="#000" stopOpacity="0.95" /><stop offset="1" stopColor="#1a0d06" stopOpacity="0" /></radialGradient>
              <radialGradient id="glow"><stop offset="0.55" stopColor="#ff6a1a" stopOpacity="0" /><stop offset="0.72" stopColor="#ff7a2a" stopOpacity="1" /><stop offset="1" stopColor="#ff3300" stopOpacity="0" /></radialGradient>
            </defs>
            <g filter="url(#rough)">
              <circle cx={540} cy={720} r={230 * hole} fill="url(#char)" />
              <circle cx={540} cy={720} r={130 * hole} fill="url(#glow)" opacity={ember} style={{ filter: "blur(2px)" }} />
              <circle cx={540} cy={720} r={92 * hole} fill="#020101" />
            </g>
          </svg>
          <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(18% 10% at 50% 37.5%, ${hexA(COLORS.ember, 0.35 * ember * hole)}, transparent 70%)` }} />
          {/* rising smoke wisps */}
          {Array.from({ length: 10 }, (_, i) => {
            const tt = (f - burnAt - i * 5) / fps; if (tt < 0) return null;
            return <div key={i} style={{ position: "absolute", left: 540 + Math.sin(tt * 2 + i) * 50 - 60, top: 680 - tt * 260, width: 120 + tt * 120, height: 120 + tt * 120, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(220,215,210,0.22), transparent 65%)", filter: "blur(18px)", opacity: Math.max(0, 1 - tt / 1.6) }} />;
          })}
          <LineText line={L} only={[0, 3]} top={1240} maxSize={150} weight={800} reveal="chars" highlight={{ brandloch: { color: COLORS.ember, glow: hexA(COLORS.ember, 0.4) } }} />
        </AbsoluteFill>
      )}
      {toCar > 0 && <CarChase from={driveAt - 10} paint="#0b0b0d" line={L} words={[3, 6]} hi="panamera" />}
    </AbsoluteFill>
  );
};

/** Reusable dynamic car shot with light streaks & road dashes (used for Panamera, Mustang). */
export const CarChase: React.FC<{ from: number; paint: string; line: number; words: [number, number]; hi: string; muscle?: boolean; rear?: boolean; accent?: string }> = ({
  from, paint, line, words, hi, muscle, rear, accent = COLORS.white,
}) => {
  const f = useCurrentFrame();
  const l = (f - from) / fps;
  const kick = beatPulse(f, 8, "kicks");
  const streaks = useMemo(() => Array.from({ length: 28 }, (_, i) => [random(`s${i}`), random(`t${i}`), random(`u${i}`)]), []);
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.0} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={rear ? [lerp(-12.5, -10.5, l / 2), 1.3 + Math.sin(l * 30) * 0.015, lerp(4.5, 2.2, l / 2)] : [lerp(5.5, -2.5, ez.inOut(Math.min(1, l / 2.2))), 1.3, lerp(11, 10, l / 2)]}
          look={[rear ? 0 : 0.3, 0.1, 0]} fov={rear ? 32 : 36} roll={Math.sin(l * 2) * 0.02} />
        <StudioEnv tint="#cfd8ff" intensity={0.9} />
        <ambientLight intensity={0.05} />
        <spotLight position={[0, 7, 2]} angle={0.6} penumbra={1} intensity={90} castShadow />
        <pointLight position={[-4, 1, 3]} intensity={30 + kick * 40} color={accent} distance={12} />
        <Car paint={paint} wheelSpin={l * 40} muscle={muscle} position={[0, Math.sin(l * 24) * 0.008, 0]} rotation={[0, rear ? 0 : -0.35, 0]} />
        {/* road dashes rushing by */}
        {Array.from({ length: 14 }, (_, i) => {
          const x = ((i * 2.4 - l * 38) % 33.6 + 33.6) % 33.6 - 16.8;
          return <mesh key={i} position={rear ? [x, 0.005, -1.6] : [x, 0.005, 1.7]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.2, 0.07]} /><meshBasicMaterial color="#9a9a9a" /></mesh>;
        })}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#08080a" roughness={0.25} metalness={0.5} /></mesh>
        <ContactShadows position={[0, 0.01, 0]} scale={9} blur={2} far={2} opacity={0.8} frames={1} />
      </Stage3D>
      {/* motion-blurred light streaks (screen space) */}
      <AbsoluteFill style={{ mixBlendMode: "screen" }}>
        {streaks.map(([a, b, c], i) => {
          const x = 1300 - (((l * (1800 + c * 2600) + a * 2400) % 2600));
          return <div key={i} style={{ position: "absolute", left: x, top: 200 + b * 1500, width: 200 + c * 500, height: 2 + c * 2,
            background: `linear-gradient(90deg, transparent, ${i % 5 === 0 ? COLORS.red : "rgba(220,230,255,0.8)"}, transparent)`, filter: "blur(1.5px)", opacity: 0.35 + c * 0.5 }} />;
        })}
      </AbsoluteFill>
      <LineText line={line} only={words} top={1330} maxSize={140} weight={800} reveal="slide" dur={12} upper
        highlight={{ [hi]: { weight: 300, color: accent === COLORS.white ? COLORS.silver : accent } }} />
    </AbsoluteFill>
  );
};

/* ───────── 3 · Eine Stunde später fließt Blut durch den Katheter ───────── */
const ecg = (x: number) => {
  // one heartbeat cycle shape, x in [0,1)
  const g = (m: number, s: number, a: number) => a * Math.exp(-((x - m) ** 2) / (2 * s * s));
  return g(0.18, 0.025, 0.12) - g(0.36, 0.008, 0.15) + g(0.4, 0.012, 1) - g(0.44, 0.01, 0.3) + g(0.65, 0.04, 0.22);
};
export const Shot03: React.FC = () => {
  const f = useCurrentFrame();
  const L = 3;
  const s0 = lineStart(L), flow = findWord(L, "fließt"), blood = findWord(L, "blut");
  const clock = prog(f, s0, findWord(L, "später") + 10 - s0, ez.inOut);
  const toMon = prog(f, flow - 12, 14, ez.inOut);
  const beatLen = 60 / 123 * fps;
  const W = 1000, sweep = ((f - flow) / (beatLen * 2.5)) % 1;
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200; const age = (sweep - x + 1) % 1;
    const ph = ((f - flow) / beatLen - (sweep - x) * 2.5);
    pts.push(`${40 + x * W},${820 - ecg(((ph % 1) + 1) % 1) * 260}`);
    void age;
  }
  const hr = beatPulse(f, 9);
  const mins = Math.floor(clock * 60);
  return (
    <AbsoluteFill>
      {toMon < 1 && (
        <AbsoluteFill style={{ opacity: 1 - toMon, alignItems: "center", justifyContent: "center", filter: `blur(${toMon * 16}px)` }}>
          <div style={{ fontFamily: FONT.family, fontWeight: 200, fontSize: 250, color: COLORS.white, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", marginTop: -300 }}>
            {clock >= 1 ? "1" : "0"}:{String(mins % 60).padStart(2, "0")}
          </div>
          <svg width={420} height={420} style={{ position: "absolute", top: 960 - 210 - 420, opacity: 0.6 }}>
            <circle cx={210} cy={210} r={200} fill="none" stroke="#222" strokeWidth={3} />
            <circle cx={210} cy={210} r={200} fill="none" stroke={COLORS.red} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clock} transform="rotate(-90 210 210)" />
          </svg>
        </AbsoluteFill>
      )}
      {toMon > 0 && (
        <AbsoluteFill style={{ opacity: toMon }}>
          {/* glass monitor panel */}
          <div style={{ position: "absolute", left: 30, top: 470, width: 1020, height: 620, borderRadius: 40, background: "linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 21 }, (_, i) => <line key={i} x1={40 + i * 50} x2={40 + i * 50} y1={560} y2={1060} stroke="rgba(255,255,255,0.05)" />)}
            {Array.from({ length: 11 }, (_, i) => <line key={i} x1={40} x2={1040} y1={560 + i * 50} y2={560 + i * 50} stroke="rgba(255,255,255,0.05)" />)}
            <polyline points={pts.join(" ")} fill="none" stroke={COLORS.red} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${COLORS.red})` }} />
            <rect x={40 + sweep * W} y={560} width={40} height={500} fill={COLORS.bg} />
            <circle cx={40 + sweep * W} cy={820 - ecg(0.0) * 260} r={7} fill="#fff" />
            {/* catheter: tube with blood flowing (dash offset) */}
            <path d="M -20 1230 C 300 1180, 700 1300, 1100 1210" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={22} strokeLinecap="round" />
            <path d="M -20 1230 C 300 1180, 700 1300, 1100 1210" fill="none" stroke={COLORS.red} strokeWidth={12} strokeLinecap="round" pathLength={1}
              strokeDasharray={`${prog(f, blood - 4, 30, ez.inOut)} 1`} style={{ filter: `drop-shadow(0 0 8px ${COLORS.red})` }} />
            <path d="M -20 1230 C 300 1180, 700 1300, 1100 1210" fill="none" stroke="rgba(255,200,200,0.5)" strokeWidth={3} strokeDasharray="10 40" strokeDashoffset={-f * 6} opacity={prog(f, blood + 10, 10)} />
          </svg>
          <div style={{ position: "absolute", left: 80, top: 500, fontFamily: FONT.family, display: "flex", alignItems: "center", gap: 20 }}>
            <svg width={56} height={56} viewBox="0 0 24 24" style={{ transform: `scale(${1 + hr * 0.25})`, filter: `drop-shadow(0 0 ${8 + hr * 14}px ${COLORS.red})` }}>
              <path d="M12 21s-7.5-4.6-10-9.2C.3 8.6 2.2 4.5 6 4.5c2.2 0 3.5 1.2 4.4 2.5h3.2c.9-1.3 2.2-2.5 4.4-2.5 3.8 0 5.7 4.1 4 7.3C19.5 16.4 12 21 12 21z" fill={COLORS.red} />
            </svg>
            <span style={{ fontSize: 96, fontWeight: 200, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>123</span>
          </div>
        </AbsoluteFill>
      )}
      <LineText line={L} top={1420} maxSize={92} weight={600} reveal="rise" dimPast highlight={{ blut: { color: COLORS.red, glow: hexA(COLORS.red, 0.5), weight: 900 }, katheter: { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* ───────── 4 · Siehst du diese Siegernarben? ───────── */
export const Shot04: React.FC = () => {
  const f = useCurrentFrame();
  const L = 4; const scar = findWord(L, "siegernarben");
  const cuts = [["M 120 380 Q 520 520 980 760", 0], ["M 160 520 Q 560 660 940 900", 6], ["M 220 650 Q 600 780 900 1020", 12], ["M 700 300 L 520 980", 30]] as const;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: `url(${brushedURL()})`, backgroundSize: "cover", transform: `scale(${1.1 + (f - scar) * 0.0006}) rotate(-2deg)` }} />
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `linear-gradient(${110 + (f - scar) * 0.15}deg, transparent 35%, rgba(255,255,255,0.22) 48%, transparent 60%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {cuts.map(([d, dl], i) => {
          const p = prog(f, scar - 6 + dl, 12, ez.snap);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#050505" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
              <path d={d} fill="none" stroke="#f4f6fb" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} transform="translate(0,-7)" style={{ filter: "drop-shadow(0 0 6px #fff)" }} />
            </g>
          );
        })}
      </svg>
      {/* spark burst at each cut */}
      {cuts.slice(0, 3).map(([, dl], i) => {
        const tt = (f - (scar - 6 + dl)) / fps; if (tt < 0 || tt > 0.6) return null;
        return Array.from({ length: 12 }, (_, k) => {
          const a = random(`a${i}${k}`) * Math.PI - Math.PI * 0.9, v = 300 + random(`v${i}${k}`) * 700;
          return <div key={`${i}${k}`} style={{ position: "absolute", left: 980 - i * 40 + Math.cos(a) * v * tt, top: 760 + i * 130 + Math.sin(a) * v * tt + 900 * tt * tt, width: 6, height: 6, borderRadius: 3, background: "#ffd9a0", boxShadow: "0 0 10px #ffb050", opacity: 1 - tt / 0.6 }} />;
        });
      })}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(5,5,5,0.92) 75%)" }} />
      <LineText line={L} top={1260} maxSize={140} weight={800} reveal="blur" dur={14}
        highlight={{ siegernarben: { gradient: "linear-gradient(180deg,#ffffff,#9aa0aa 60%,#e6e9ef)", scale: 1.05 } }} />
    </AbsoluteFill>
  );
};

/* ───────── 5 · Ich akzeptiere keine Niederlagen ───────── */
export const Shot05: React.FC = () => {
  const f = useCurrentFrame();
  const L = 5; const s0 = lineStart(L), nd = findWord(L, "niederlagen");
  const up = spr(f, s0 - 10, { damping: 22, stiffness: 60 });
  const strike = prog(f, nd + 12, 14, ez.inOut);
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.1} bloomThreshold={0.65} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[Math.sin((f - s0) / 120) * 8, 1.2, Math.cos((f - s0) / 120) * 8]} look={[0, 0.1, 0]} fov={32} />
        <StudioEnv tint="#ffe2a8" intensity={1.0} />
        <spotLight position={[0, 8, 1]} angle={0.3} penumbra={0.6} intensity={260 * up} color="#fff1d6" castShadow />
        <pointLight position={[-3, 1, -2]} intensity={40} color={COLORS.gold} />
        <Trophy position={[0, lerp(-2.5, 0.35, up), 0]} rotation={[0, (f - s0) * 0.01, 0]} scale={1.15} />
        <Sparks t={(f - s0) / fps} origin={[0, 0.5, 0]} color="#ffd27a" spread={1.6} speed={0.8} count={80} intensity={1.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#0a0a0b" roughness={0.35} metalness={0.4} /></mesh>
      </Stage3D>
      <LineText line={L} top={1270} maxSize={110} weight={700} reveal="flip" hide={["niederlagen"]} />
      <div style={{ position: "absolute", top: 1520, width: 1080, textAlign: "center" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          <Word text="NIEDERLAGEN" at={nd} size={128} weight={900} reveal="scale" color={COLORS.white} tracking={-0.02} />
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: COLORS.red, transformOrigin: "left", transform: `scaleX(${strike})`, boxShadow: `0 0 24px ${COLORS.red}` }} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── 6 · Deutsche Rapper … (glass shatter) ───────── */
export const Shot06: React.FC = () => {
  const f = useCurrentFrame();
  const L = 6; const end = lineEnd(L);
  const shards = useMemo(() => {
    const out: { poly: string; cx: number; cy: number }[] = [];
    const cols = 4, rows = 7;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const j = (k: string) => (random(`${k}${r}${c}`) - 0.5) * 60;
      const x0 = (c / cols) * 1080 + j("a"), x1 = ((c + 1) / cols) * 1080 + j("b"), y0 = (r / rows) * 1920 + j("c"), y1 = ((r + 1) / rows) * 1920 + j("d");
      const mx = (x0 + x1) / 2 + j("e"), my = (y0 + y1) / 2 + j("f");
      out.push({ poly: `polygon(${x0}px ${y0}px, ${x1}px ${y0}px, ${mx}px ${my}px)`, cx: (x0 + x1 + mx) / 3, cy: (y0 * 2 + my) / 3 });
      out.push({ poly: `polygon(${x1}px ${y0}px, ${x1}px ${y1}px, ${mx}px ${my}px)`, cx: (x1 * 2 + mx) / 3, cy: (y0 + y1 + my) / 3 });
      out.push({ poly: `polygon(${x1}px ${y1}px, ${x0}px ${y1}px, ${mx}px ${my}px)`, cx: (x0 + x1 + mx) / 3, cy: (y1 * 2 + my) / 3 });
      out.push({ poly: `polygon(${x0}px ${y1}px, ${x0}px ${y0}px, ${mx}px ${my}px)`, cx: (x0 * 2 + mx) / 3, cy: (y0 + y1 + my) / 3 });
    }
    return out;
  }, []);
  const br = prog(f, end - 8, 34, ez.in);
  const content = (
    <AbsoluteFill style={{ background: "radial-gradient(80% 50% at 50% 50%, #17171a, #050505)" }}>
      <LineText line={L} centerY={900} maxSize={150} weight={900} reveal="drop" dur={12} upper maxRows={4}
        highlight={{ rapper: { gradient: "linear-gradient(180deg,#fff,#8d929c)" } }} />
    </AbsoluteFill>
  );
  if (br <= 0) return content;
  return (
    <AbsoluteFill>
      {shards.map((s, i) => {
        const dx = s.cx - 540, dy = s.cy - 900, d = Math.hypot(dx, dy) + 1;
        const k = br * (0.6 + random(`k${i}`) * 0.8);
        return (
          <AbsoluteFill key={i} style={{ clipPath: s.poly, transformOrigin: `${s.cx}px ${s.cy}px`,
            transform: `translate(${(dx / d) * k * 900}px, ${(dy / d) * k * 900 + k * k * 400}px) rotate(${(random(`r${i}`) - 0.5) * k * 140}deg) scale(${1 - k * 0.3})`, opacity: 1 - k * 0.8 }}>
            {content}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────── 7 · Fans hab' ich mittlerweile eine Million ───────── */
export const Shot07: React.FC = () => {
  const f = useCurrentFrame();
  const L = 7; const fans = findWord(L, "fans"), mil = findWord(L, "million");
  const p = interpolate(f, [fans, mil + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez.inOut });
  const n = Math.round(p ** 2.2 * 1_000_000);
  const hit = f >= mil + 6 ? Math.exp(-(f - mil - 6) / 14) : 0;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 50% 50%, ${hexA("#3d5cff", 0.12 + hit * 0.25)}, transparent 70%)` }}>
      {Array.from({ length: 70 }, (_, i) => {
        const a = random(`pa${i}`) * Math.PI * 2, sp = 0.3 + random(`ps${i}`), life = ((f / fps) * sp + random(`pl${i}`)) % 1;
        const r = 200 + life * 700 * (0.4 + p);
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r, top: 900 + Math.sin(a) * r * 1.2, width: 4, height: 4, borderRadius: 2, background: "#fff",
          boxShadow: "0 0 10px #9db4ff", opacity: Math.sin(life * Math.PI) * (0.3 + p * 0.7) }} />;
      })}
      <LineText line={L} top={560} maxSize={92} weight={600} hide={["million", "eine"]} reveal="rise" color={COLORS.silver} />
      <div style={{ position: "absolute", top: 820, width: 1080, textAlign: "center", fontFamily: FONT.family, fontWeight: 800, fontSize: 210, color: COLORS.white,
        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em", transform: `scale(${1 + hit * 0.08})`, textShadow: `0 0 ${30 + hit * 80}px ${hexA("#9db4ff", 0.5 + hit * 0.4)}`, opacity: prog(f, fans - 6, 10) }}>
        {n.toLocaleString("de-DE")}
      </div>
      <div style={{ position: "absolute", top: 1100, width: 1080, textAlign: "center" }}>
        <Word text="eine Million" at={findWord(L, "eine")} size={84} weight={300} tracking={0.08} reveal="track" color={COLORS.white} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────── 8 · Wir sind Hertha BSC, aber bleiben Union ───────── */
export const Shot08: React.FC = () => {
  const f = useCurrentFrame();
  const L = 8; const s0 = lineStart(L), aber = findWord(L, "aber");
  const draw = prog(f, s0 - 10, 50, ez.inOut);
  const red = prog(f, aber, 20, ez.inOut);
  const col = red > 0.5 ? COLORS.red : "#2f6fe0";
  const k = beatPulse(f, 6, "kicks");
  const lines = ["M 60 40 H 940 V 1460 H 60 Z", "M 60 750 H 940", "M 500 750 m -150 0 a 150 150 0 1 0 300 0 a 150 150 0 1 0 -300 0", "M 280 40 V 300 H 720 V 40", "M 280 1460 V 1200 H 720 V 1460", "M 400 40 V 120 H 600 V 40", "M 400 1460 V 1380 H 600 V 1460"];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1200 }}>
        <div style={{ position: "absolute", left: 40, top: 300, width: 1000, height: 1500, transform: `rotateX(58deg) translateY(${-200 + (f - s0) * 0.6}px) rotateZ(${(f - s0) * 0.03}deg)`, transformOrigin: "50% 60%" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, #0b120c 0 120px, #0e1710 120px 240px)", opacity: 0.9 }} />
          <svg width={1000} height={1500} style={{ position: "absolute", inset: 0 }}>
            {lines.map((d, i) => <path key={i} d={d} fill="none" stroke="#e8ecef" strokeWidth={6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} opacity={0.85} />)}
          </svg>
        </div>
      </AbsoluteFill>
      {/* floodlight beams */}
      {[[-80, 15], [1160, -15]].map(([x, rot], i) => (
        <div key={i} style={{ position: "absolute", left: x - 300, top: -200, width: 600, height: 1500, transformOrigin: "50% 0", transform: `rotate(${rot}deg)`,
          background: `linear-gradient(180deg, ${hexA(col, 0.45 + k * 0.25)}, transparent 80%)`, clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)", filter: "blur(10px)", mixBlendMode: "screen", opacity: draw }} />
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.7) 0%, transparent 25%, transparent 55%, rgba(5,5,5,0.9) 72%)" }} />
      <LineText line={L} top={1330} maxSize={128} weight={800} reveal="rise" upper
        highlight={{ hertha: { color: "#3f86ff", glow: hexA("#3f86ff", 0.4) }, bsc: { color: "#3f86ff", weight: 300 }, union: { color: COLORS.red, glow: hexA(COLORS.red, 0.5), scale: 1.25 } }} />
    </AbsoluteFill>
  );
};

/* ───────── 9 · Ich muss nie mehr mit dem Bus fahren ───────── */
export const Shot09: React.FC = () => {
  const f = useCurrentFrame();
  const L = 9; const s0 = lineStart(L), bus = findWord(L, "bus"), fah = findWord(L, "fahren");
  const busIn = spr(f, s0 - 6, { damping: 18, stiffness: 90 });
  const swap = spr(f, fah - 4, { damping: 16, stiffness: 120 });
  const cross = prog(f, bus + 6, 10, ez.snap);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.8} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[5.5, 3.2, 8.5]} look={[0, 0.6, 0]} fov={36} />
        <StudioEnv intensity={1} />
        <spotLight position={[2, 8, 4]} angle={0.5} penumbra={1} intensity={140} castShadow />
        <group scale={busIn * (1 - swap) * 0.85} rotation={[0, -0.5 + (f - s0) * 0.008 + swap * 3, 0]}><Bus /></group>
        <group scale={swap} rotation={[0, -0.6 + (1 - swap) * -3 + (f - fah) * 0.006, 0]}><Car paint="#101012" /></group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><shadowMaterial opacity={0.6} /></mesh>
      </Stage3D>
      {/* the bus gets crossed out */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
        <line x1={250} y1={560} x2={830} y2={1100} stroke={COLORS.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${cross} 1`} style={{ filter: `drop-shadow(0 0 12px ${COLORS.red})` }} />
      </svg>
      <LineText line={L} top={1360} maxSize={120} weight={700} reveal="rise" highlight={{ bus: { color: COLORS.grey, weight: 300 }, nie: { color: COLORS.white, weight: 900 }, fahren: { weight: 300 } }} />
    </AbsoluteFill>
  );
};
