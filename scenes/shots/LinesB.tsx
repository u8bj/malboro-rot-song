// Lines 10–21 (song 0:22 – 0:52)
import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { LineText, findWord, lineEnd, lineStart, wordAt } from "../../components/LineText";
import { Word } from "../../components/KineticText";
import { hexA } from "../../components/Background";
import { Sparks } from "../../components/Sparks";
import { Smoke } from "../../components/Smoke";
import { CarChase } from "./LinesA";
import { PufferJacket } from "../../3d-models/PufferJacket";
import { Bill } from "../../3d-models/MoneyBundle";
import { Scissors, Clipper, Plane, Can, Bottle, Mirror } from "../../3d-models/Objects";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog, spr } from "../../animations/ease";
import { COLORS, FONT } from "../../presets/theme";

const fps = 60;

/* 10 · Lieber Gott, Schukran – god rays + gold dust */
export const Shot10: React.FC = () => {
  const f = useCurrentFrame(); const L = 10; const s0 = lineStart(L);
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `repeating-conic-gradient(from ${t * 6}deg at 50% -10%, rgba(255,226,170,0.13) 0deg 4deg, transparent 4deg 13deg)`, maskImage: "linear-gradient(180deg, #000 0%, transparent 80%)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 80%)", filter: "blur(6px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 35% at 50% 0%, rgba(255,230,180,0.35), transparent 70%)" }} />
      {Array.from({ length: 90 }, (_, i) => {
        const x = random(`gx${i}`) * 1080, sp = 30 + random(`gs${i}`) * 80, y = (random(`gy${i}`) * 1920 + t * sp) % 1920;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(t + i) * 20, top: y, width: 3, height: 3, borderRadius: 2, background: "#ffe3a6", boxShadow: "0 0 8px #ffcf70", opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i)) }} />;
      })}
      <LineText line={L} centerY={980} maxSize={170} weight={300} reveal="blur" dur={22} tracking={0}
        highlight={{ gott: { weight: 600 }, schukran: { gradient: "linear-gradient(180deg,#fff6dc,#d4af6a)", weight: 800, scale: 1.1 } }} maxRows={3} />
    </AbsoluteFill>
  );
};

/* 11 · Playmates … im Mustang – red muscle car, rear chase */
export const Shot11: React.FC = () => {
  const L = 11;
  return <CarChase from={lineStart(L) - 8} paint="#7d0a12" line={L} words={[0, 7]} hi="mustang" muscle rear accent={COLORS.red} />;
};

/* 12 · Friseur – scissors snapping on the beat + clipper */
export const Shot12: React.FC = () => {
  const f = useCurrentFrame(); const L = 12; const s0 = lineStart(L);
  const t = (f - s0) / fps;
  const snap = beatPulse(f, 10);
  const inn = spr(f, s0 - 18, { damping: 18, stiffness: 110 });
  const week = Math.floor(Math.max(0, f - findWord(L, "wöchentlich") + 6) / 6);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.6} bloomThreshold={0.8} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 0.4, 10]} look={[0, 0.2, 0]} fov={34} />
        <StudioEnv intensity={1.2} />
        <spotLight position={[3, 6, 5]} angle={0.5} penumbra={1} intensity={120} castShadow />
        <Scissors open={0.15 + snap * 0.85} position={[lerp(-4, -0.3, inn), 1.3, 0]} rotation={[0.2 + t * 0.3, -0.4 + t * 0.2, -0.5]} scale={1.05} />
        <Clipper position={[lerp(4, 1.0, inn), 0.0, 0.2]} rotation={[0.3, -0.6 + t * 0.6, 0.35]} scale={0.95} />
        {/* falling hair clippings */}
        {Array.from({ length: 40 }, (_, i) => {
          const tt = (t * (0.6 + random(`h${i}`) * 0.6) + random(`hy${i}`)) % 1;
          return <mesh key={i} position={[(random(`hx${i}`) - 0.5) * 5, 3 - tt * 6, (random(`hz${i}`) - 0.5) * 2]} rotation={[tt * 9, i, tt * 5]}><boxGeometry args={[0.18, 0.008, 0.008]} /><meshStandardMaterial color="#1a1512" /></mesh>;
        })}
      </Stage3D>
      {/* weekly rhythm: 7 dots */}
      <div style={{ position: "absolute", top: 1240, width: 1080, display: "flex", justifyContent: "center", gap: 26 }}>
        {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i < week ? COLORS.white : "rgba(255,255,255,0.15)", boxShadow: i < week ? "0 0 14px #fff" : undefined }} />)}
      </div>
      <LineText line={L} top={1330} maxSize={110} weight={700} reveal="chars" dur={14} highlight={{ friseur: { weight: 300 }, wöchentlich: { color: COLORS.silver } }} />
    </AbsoluteFill>
  );
};

/* 13 · Monster-Hype – notifications pile up, then fade away (no invented text: icons + numbers only) */
const Icon: React.FC<{ k: number }> = ({ k }) => {
  const paths = [
    "M12 21s-7.5-4.6-10-9.2C.3 8.6 2.2 4.5 6 4.5c2.2 0 3.5 1.2 4.4 2.5h3.2c.9-1.3 2.2-2.5 4.4-2.5 3.8 0 5.7 4.1 4 7.3C19.5 16.4 12 21 12 21z",
    "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 0 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z",
    "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 1c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4zm-8 0c-.3 0-.7 0-1.1.1A4.4 4.4 0 0 1 9 17v3H1v-3c0-2.2 4.5-4 7-4z",
  ];
  const cols = [COLORS.red, "#3f86ff", COLORS.gold, "#9fd6a8"];
  return <svg width={64} height={64} viewBox="0 0 24 24"><path d={paths[k % 4]} fill={cols[k % 4]} /></svg>;
};
export const Shot13: React.FC = () => {
  const f = useCurrentFrame(); const L = 13; const s0 = lineStart(L), meide = findWord(L, "meide");
  const gone = prog(f, meide, 40, ez.inOut);
  const cards = Array.from({ length: 9 }, (_, i) => ({ at: s0 - 6 + i * 6, k: i, n: [999, 412, 87, 2300, 15, 640, 128, 9, 777][i] }));
  return (
    <AbsoluteFill>
      {cards.map((c, i) => {
        const p = spr(f, c.at, { damping: 16, stiffness: 150 });
        if (p <= 0.001) return null;
        const away = Math.max(0, Math.min(1, gone * 1.6 - i * 0.07));
        const x = (i % 2 ? 1 : -1) * (60 + (i * 37) % 120), y = 230 + i * 118;
        return (
          <div key={i} style={{ position: "absolute", left: 140 + x, top: y, width: 800, height: 104, borderRadius: 30, display: "flex", alignItems: "center", gap: 26, padding: "0 30px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(20px)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.5)", transform: `translateY(${(1 - p) * -80}px) scale(${lerp(0.85, 1, p) - away * 0.15}) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
            opacity: p * (1 - away), filter: `blur(${away * 22}px)` }}>
            <Icon k={c.k} />
            <span style={{ fontFamily: FONT.family, fontWeight: 700, fontSize: 52, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>{c.n.toLocaleString("de-DE")}+</span>
            <div style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: 8, background: COLORS.red, boxShadow: `0 0 12px ${COLORS.red}` }} />
          </div>
        );
      })}
      <LineText line={L} top={1400} maxSize={110} weight={800} reveal="drop" dur={12}
        highlight={{ "monster-hype": { color: COLORS.white, glow: hexA("#ffffff", 0.3), scale: 1.1 }, öffentlichkeit: { weight: 300, color: COLORS.grey } }} />
    </AbsoluteFill>
  );
};

/* 14 · Ich bin fresh, meine Kleidung sitzt – jacket product spin, white studio, glints */
export const Shot14: React.FC = () => {
  const f = useCurrentFrame(); const L = 14; const s0 = lineStart(L);
  const t = (f - s0) / fps; const fresh = findWord(L, "fresh");
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.0} bloomThreshold={0.75} transparent={false}>
        <color attach="background" args={["#0a0b0d"]} />
        <CameraRig pos={[Math.sin(t * 0.5) * 2, 0.8, 12.5]} look={[0, -0.6, 0]} fov={34} />
        <StudioEnv tint="#ffffff" intensity={1.4} />
        <spotLight position={[0, 8, 4]} angle={0.4} penumbra={1} intensity={200} castShadow />
        <group rotation={[0, t * 1.8, 0]} position={[0, 0.2, 0]}><PufferJacket /></group>
        <Sparks t={t} origin={[0, -1.5, 0.5]} color="#ffffff" spread={2.2} speed={1.4} count={60} intensity={1.4} />
      </Stage3D>
      {/* star glints */}
      {[[300, 520, 0], [790, 760, 14], [420, 1080, 26]].map(([x, y, d], i) => {
        const p = prog(f, fresh + d, 10, ez.out), q = prog(f, fresh + d + 12, 14, ez.in), s = p * (1 - q);
        return <svg key={i} width={160} height={160} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x - 80, top: y - 80, transform: `scale(${s}) rotate(${f * 2}deg)`, filter: "drop-shadow(0 0 12px #fff)" }}>
          <path d="M0 -1 L0.12 -0.12 L1 0 L0.12 0.12 L0 1 L-0.12 0.12 L-1 0 L-0.12 -0.12 Z" fill="#fff" /></svg>;
      })}
      <LineText line={L} top={1390} maxSize={130} weight={700} reveal="scale" dur={14} highlight={{ fresh: { weight: 900, scale: 1.25, glow: hexA("#ffffff", 0.45) }, sitzt: { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* 15 · Nachdem ich einkiff', setze ich im Wettbüro einen Lilanen auf Hajduk Split – purple 500 + bet slip */
export const Shot15: React.FC = () => {
  const f = useCurrentFrame(); const L = 15; const s0 = lineStart(L);
  const setze = findWord(L, "setze"), lil = findWord(L, "lilanen"), hj = findWord(L, "hajduk");
  const t = (f - s0) / fps;
  const note = spr(f, lil - 8, { damping: 15, stiffness: 70 });
  const slip = spr(f, setze - 6, { damping: 20, stiffness: 80 });
  const stamp = prog(f, hj + 4, 10, ez.snap);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.8} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[0, 0, 8]} look={[0, 0.2, 0]} fov={36} />
        <StudioEnv tint="#d8c4ff" intensity={1} />
        <spotLight position={[2, 5, 6]} angle={0.5} penumbra={1} intensity={120} castShadow />
        <pointLight position={[-3, -1, 2]} intensity={50} color="#9b5cff" />
        {/* haze for „einkiff'“ */}
        <Smoke t={t + 3} origin={[0, -2.5, -2]} count={26} rise={0.5} spread={2} size={3} color="#c9b8e6" opacity={0.16 * (1 - prog(f, setze, 40))} life={5} seed={6} />
        <group position={[lerp(4, 0.5, note), lerp(3, 1.55, note), 0.5]} rotation={[0.5 - note * 0.3 + Math.sin(t) * 0.1, -0.6 + t * 0.7, 0.2]} scale={1.5 * note}>
          <Bill purple curl={0.25} />
        </group>
      </Stage3D>
      {/* bet slip (crisp HTML in 3D perspective) */}
      <AbsoluteFill style={{ perspective: 1400 }}>
        <div style={{ position: "absolute", left: 230, top: 780, width: 620, height: 470, borderRadius: 14, background: "linear-gradient(180deg,#f7f6f2,#e9e7e1)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
          transform: `translateY(${(1 - slip) * 900}px) rotateX(${18 - slip * 8}deg) rotateZ(${-6 + slip * 3}deg)`, fontFamily: FONT.family, color: "#121214", padding: "40px 46px", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ height: 10, background: "repeating-linear-gradient(90deg,#121214 0 6px, transparent 6px 12px)", opacity: 0.35, marginBottom: 34 }} />
          <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em" }}>HAJDUK SPLIT</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 40, fontWeight: 500, color: "#55565c" }}><span>1</span><span>×</span><span style={{ fontVariantNumeric: "tabular-nums" }}>500 €</span></div>
          <div style={{ height: 2, background: "#121214", opacity: 0.12, margin: "36px 0" }} />
          <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: 34 }, (_, i) => <div key={i} style={{ width: random(`bc${i}`) > 0.5 ? 6 : 3, height: 70, background: "#121214" }} />)}</div>
          <div style={{ position: "absolute", right: 30, top: 30, width: 150, height: 150, borderRadius: 75, border: `8px solid #6b33c9`, color: "#6b33c9", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 64, transform: `scale(${lerp(2.2, 1, stamp)}) rotate(-14deg)`, opacity: stamp }}>✓</div>
        </div>
      </AbsoluteFill>
      <LineText line={L} only={[0, 3]} top={1430} maxSize={96} weight={500} color={COLORS.silver} reveal="blur" exitAt={setze - 10} />
      <LineText line={L} only={[3, 12]} top={1380} maxSize={92} weight={700} reveal="rise" dur={12} maxRows={3}
        highlight={{ lilanen: { color: "#b98aff", glow: hexA("#9b5cff", 0.5), weight: 900 }, hajduk: { weight: 900 }, split: { weight: 900 } }} />
    </AbsoluteFill>
  );
};

/* 16 · Richtung Graz hab' ich den Flug verpasst – boarding pass + plane flying through the letters */
export const Shot16: React.FC = () => {
  const f = useCurrentFrame(); const L = 16; const s0 = lineStart(L);
  const flug = findWord(L, "flug"), miss = findWord(L, "verpasst");
  const pass = spr(f, s0 - 8, { damping: 20, stiffness: 70 });
  const stamp = prog(f, miss, 9, ez.snap);
  const fly = prog(f, flug - 16, 70, ez.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(80% 50% at 50% 30%, #12161f, #050505)" }} />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: 120, top: 360, width: 840, height: 520, borderRadius: 34, overflow: "hidden", fontFamily: FONT.family,
          background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(20px)",
          transform: `translateY(${(1 - pass) * -600}px) rotateX(${(1 - pass) * 50 + 10}deg) rotateY(${Math.sin((f - s0) / 50) * 6}deg)`, boxShadow: "0 40px 120px rgba(0,0,0,0.6)", color: COLORS.white, padding: 50, boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.03em" }}>BER</div></div>
            <svg width={120} height={40}><path d="M0 20 H 110 M 92 6 L 110 20 L 92 34" stroke={COLORS.silver} strokeWidth={3} fill="none" /></svg>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.03em" }}>GRZ</div></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 40, color: COLORS.grey }}><span>Berlin</span><span>Graz</span></div>
          <div style={{ borderTop: "2px dashed rgba(255,255,255,0.2)", margin: "46px -50px 34px" }} />
          <div style={{ display: "flex", gap: 5 }}>{Array.from({ length: 48 }, (_, i) => <div key={i} style={{ width: random(`p${i}`) > 0.5 ? 7 : 3, height: 80, background: "rgba(255,255,255,0.75)" }} />)}</div>
        </div>
      </AbsoluteFill>
      {/* MISSED FLIGHT stamp */}
      <div style={{ position: "absolute", left: 210, top: 560, padding: "18px 40px", border: `10px solid ${COLORS.red}`, borderRadius: 18, color: COLORS.red, fontFamily: FONT.family, fontWeight: 900, fontSize: 96, letterSpacing: "0.02em",
        transform: `rotate(-12deg) scale(${lerp(2.5, 1, stamp)})`, opacity: stamp, textShadow: `0 0 30px ${hexA(COLORS.red, 0.5)}`, boxShadow: `0 0 40px ${hexA(COLORS.red, 0.35)}`, whiteSpace: "nowrap" }}>MISSED FLIGHT</div>
      <LineText line={L} top={1180} maxSize={140} weight={800} reveal="rise" upper maxRows={3}
        highlight={{ graz: { weight: 300 }, flug: { color: COLORS.ice, glow: hexA(COLORS.ice, 0.5) }, verpasst: { color: COLORS.red } }} />
      {/* plane in front of the type – flies through the letters */}
      <Stage3D bloom={0}>
        <CameraRig pos={[0, 0, 10]} look={[0, 0, 0]} fov={36} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 6]} intensity={3} />
        <StudioEnv intensity={0.8} />
        {fly > 0 && fly < 1 && <Plane position={[lerp(-6, 6, fly), lerp(-2.2, 2.6, fly), lerp(-3, 2, fly)]} rotation={[0.25, -0.25, 0.45]} scale={0.9} />}
      </Stage3D>
    </AbsoluteFill>
  );
};

/* 17 · Wegen drei Jacky-Cola-Dosen und Hustensaft – three cans drop on beats + purple bottle */
export const Shot17: React.FC = () => {
  const f = useCurrentFrame(); const L = 17; const s0 = lineStart(L);
  const drei = findWord(L, "drei"), hs = findWord(L, "hustensaft");
  const t = (f - s0) / fps;
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.9} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[Math.sin(t * 0.4) * 1.5, 1.6, 9.5]} look={[0, 0.9, 0]} fov={34} />
        <StudioEnv intensity={1.2} />
        <spotLight position={[0, 8, 3]} angle={0.5} penumbra={1} intensity={170} castShadow />
        <pointLight position={[2, 1, 2]} intensity={40} color="#9b5cff" />
        {[0, 1, 2].map((i) => {
          const p = spr(f, drei - 6 + i * 9, { damping: 13, stiffness: 160 });
          return <Can key={i} position={[(i - 1) * 0.95 - 0.8, (1 - p) * 6, i % 2 ? -0.4 : 0.2]} rotation={[0, t * 0.6 + i, (1 - p) * 1.2]} scale={1.15} />;
        })}
        {(() => { const p = spr(f, hs - 8, { damping: 16, stiffness: 90 }); return <Bottle position={[1.9, lerp(-4, 0, p), 0]} rotation={[0, t, 0.05]} scale={0.95} level={0.72} />; })()}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#09090a" roughness={0.3} metalness={0.4} /></mesh>
      </Stage3D>
      <LineText line={L} top={1330} maxSize={110} weight={700} reveal="flip" dur={14}
        highlight={{ drei: { weight: 900, scale: 1.3 }, hustensaft: { color: "#b98aff", glow: hexA("#9b5cff", 0.5) } }} />
    </AbsoluteFill>
  );
};

/* 18 · Nie wieder häng' ich ab in schmutzigen Diskos – club beams, then lights out */
export const Shot18: React.FC = () => {
  const f = useCurrentFrame(); const L = 18; const s0 = lineStart(L), dirty = findWord(L, "schmutzigen");
  const off = prog(f, dirty + 8, 30, ez.inOut);
  const k = beatPulse(f, 9, "kicks");
  const t = (f - s0) / fps;
  const cols = ["#ff2bd6", "#2b6bff", "#00e5ff", "#ff3b3b"];
  return (
    <AbsoluteFill>
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.sin(t * (0.8 + i * 0.13) + i) * 35 + (i - 3.5) * 8;
        return <div key={i} style={{ position: "absolute", left: 540 - 220, top: -120, width: 440, height: 2100, transformOrigin: "50% 0", transform: `rotate(${a}deg)`,
          background: `linear-gradient(180deg, ${hexA(cols[i % 4], 0.75)}, transparent 85%)`, clipPath: "polygon(48% 0, 52% 0, 100% 100%, 0 100%)", mixBlendMode: "screen", filter: "blur(8px)",
          opacity: (0.4 + k * 0.6) * (1 - off) * (i % 2 === Math.floor(f / 15) % 2 ? 1 : 0.6) }} />;
      })}
      <AbsoluteFill style={{ background: `radial-gradient(50% 30% at 50% 0%, ${hexA("#ffffff", 0.15 * (1 - off))}, transparent)` }} />
      {/* haze */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 40%, rgba(40,40,60,0.25))", opacity: 1 - off }} />
      {/* single white line remains after lights off – smooth transition */}
      <div style={{ position: "absolute", top: 960, left: 540 - 400 * off, width: 800 * off, height: 2, background: "#fff", boxShadow: "0 0 20px #fff", opacity: off * (1 - prog(f, dirty + 50, 30)) }} />
      <LineText line={L} top={1260} maxSize={130} weight={800} reveal="scale" dur={10} upper
        highlight={{ nie: { color: COLORS.red, glow: hexA(COLORS.red, 0.5) }, wieder: { color: COLORS.red, glow: hexA(COLORS.red, 0.5) }, diskos: { weight: 300 } }} />
    </AbsoluteFill>
  );
};

/* 19 · Baller Hits, als wär's ein Schutzmechanismus – hex force-field rippling on kicks */
export const Shot19: React.FC = () => {
  const f = useCurrentFrame(); const L = 19; const s0 = lineStart(L), sm = findWord(L, "schutzmechanismus");
  const k = beatPulse(f, 6, "kicks");
  const shield = prog(f, sm - 10, 24, ez.out);
  const hexes = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = -9; r <= 9; r++) for (let q = -6; q <= 6; q++) out.push([540 + q * 92 + (r % 2 ? 46 : 0), 760 + r * 80]);
    return out;
  }, []);
  const hp = (cx: number, cy: number, s: number) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `${cx + Math.cos(a) * s},${cy + Math.sin(a) * s}`; }).join(" ");
  const ripple = ((f - s0) % 30) / 30;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {hexes.map(([x, y], i) => {
          const d = Math.hypot(x - 540, y - 760);
          const inside = d < 560 * (0.3 + shield * 0.7);
          const wave = Math.max(0, 1 - Math.abs(d / 600 - ripple) * 6) * k;
          return <polygon key={i} points={hp(x, y, 44)} fill={hexA(COLORS.ice, inside ? 0.03 + wave * 0.25 : 0)} stroke={hexA(COLORS.ice, inside ? 0.25 + wave * 0.7 : 0.04)} strokeWidth={2}
            style={{ filter: wave > 0.2 ? `drop-shadow(0 0 8px ${COLORS.ice})` : undefined }} />;
        })}
        <circle cx={540} cy={760} r={560 * (0.3 + shield * 0.7)} fill="none" stroke={hexA(COLORS.ice, 0.5 + k * 0.4)} strokeWidth={3} style={{ filter: `drop-shadow(0 0 20px ${COLORS.ice})` }} />
      </svg>
      <LineText line={L} only={[0, 2]} centerY={700} maxSize={190} weight={900} reveal="scale" dur={10} upper
        highlight={{ baller: { gradient: "linear-gradient(180deg,#fff,#a9c9ff)" } }} />
      <LineText line={L} only={[2, 6]} top={1360} maxSize={110} weight={600} reveal="track" dur={18} tracking={0.0}
        highlight={{ schutzmechanismus: { weight: 800, color: COLORS.ice, glow: hexA(COLORS.ice, 0.4) } }} />
    </AbsoluteFill>
  );
};

/* 20 · Vielleicht bin ich schizo, all diese Missgunst – RGB split / sliced duplicate type */
export const Shot20: React.FC = () => {
  const f = useCurrentFrame(); const L = 20; const s0 = lineStart(L), sch = findWord(L, "schizo");
  const k = beatPulse(f, 10, "kicks");
  const g = (f >= sch - 4 ? 1 : 0.15) * (0.4 + k);
  const slices = Array.from({ length: 9 }, (_, i) => (random(`sl${i}${Math.floor(f / 4)}`) - 0.5) * 60 * g);
  const text = <LineText line={L} centerY={900} maxSize={150} weight={900} reveal="rise" dur={12} upper maxRows={4} highlight={{ missgunst: { weight: 300 } }} />;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-10 * g}px)`, mixBlendMode: "screen", filter: "url(#none)", opacity: 0.9 }}>
        <AbsoluteFill style={{ filter: "sepia(1) saturate(9) hue-rotate(-50deg)" }}>{text}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${12 * g}px)`, mixBlendMode: "screen", opacity: 0.9 }}>
        <AbsoluteFill style={{ filter: "sepia(1) saturate(9) hue-rotate(160deg)" }}>{text}</AbsoluteFill>
      </AbsoluteFill>
      {slices.map((dx, i) => (
        <AbsoluteFill key={i} style={{ clipPath: `inset(${(i / 9) * 100}% 0 ${100 - ((i + 1) / 9) * 100}% 0)`, transform: `translateX(${dx}px)` }}>{text}</AbsoluteFill>
      ))}
      {/* scanlines */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)", opacity: 0.5 + k * 0.5 }} />
    </AbsoluteFill>
  );
};

/* 21 · Ja, ich frag' den Typ im Spiegel jeden Tag: Wer bist du? – distorting 3D mirror */
export const Shot21: React.FC = () => {
  const f = useCurrentFrame(); const L = 21; const s0 = lineStart(L), wer = findWord(L, "wer");
  const t = (f - s0) / fps;
  const inn = spr(f, s0 - 8, { damping: 20, stiffness: 60 });
  const wob = 0.25 + prog(f, wer - 10, 20) * 0.9;
  const flipText = prog(f, wer + 30, 18, ez.inOut);
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.7} bloomThreshold={0.7} transparent={false}>
        <color attach="background" args={[COLORS.bg]} />
        <CameraRig pos={[Math.sin(t * 0.4) * 1.2, 0.3, 8.5]} look={[0, 0.5, 0]} fov={36} />
        <StudioEnv tint="#cfd6ff" intensity={1.3} />
        <spotLight position={[0, 6, 6]} angle={0.5} penumbra={1} intensity={120} />
        <Mirror position={[0, lerp(-4, 0.6, inn), 0]} rotation={[0, Math.sin(t * 0.7) * 0.25, 0]} wobble={wob} t={t} />
      </Stage3D>
      <LineText line={L} only={[0, 9]} top={1320} maxSize={88} weight={600} reveal="rise" color={COLORS.silver} exitAt={wer - 18} />
      <div style={{ position: "absolute", top: 1380, width: 1080, textAlign: "center", transform: `scaleX(${lerp(-1, 1, flipText)})` }}>
        <Word text="WER BIST DU?" at={wer} size={124} weight={800} reveal="blur" dur={20} tracking={0.0} glow={hexA("#cfd6ff", 0.35)} />
      </div>
    </AbsoluteFill>
  );
};

export const _unused = [lineEnd, wordAt];
