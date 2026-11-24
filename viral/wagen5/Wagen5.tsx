// "Wagen 5" – interactive 2nd-person thriller short (original story & designs). 1080×1920 @ 30 fps.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, random } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";

type Wd = { w: string; s: number; e: number };
const WORDS = wordsJson as Wd[];
export const OUTRO_T0 = 53.4; // right after the last spoken word
export const W5_DURATION_S = 61.6; // > 60 s (TikTok Creator Rewards need videos longer than one minute)
const SANS = '"Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';
const K = { bg: "#070b14", navy: "#0e1729", navy2: "#16223a", steel: "#2a3957", amber: "#ffb547", amber2: "#ffd58a", red: "#ff3b3b", blue: "#4da3ff", yellow: "#ffd23f", ink: "#e9eef7" };

const cl = (x: number) => Math.max(0, Math.min(1, x));
const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => { const k = cl(x); return k * k * (3 - 2 * k); };
const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const spring = (t: number, t0: number, d = 0.5) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1.6) return 1; return 1 - Math.exp(-6 * x) * Math.cos(5.4 * x); };
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const at = (i: number) => WORDS[i].s; // word index → time
const shake = (t: number, t0: number, amp = 18, dur = 0.5) => { const k = t >= t0 ? Math.exp(-(t - t0) * (6 / dur)) : 0; return [Math.sin(t * 90) * amp * k, Math.cos(t * 77) * amp * k]; };

/* ───────── shared visual layers ───────── */
const Grain: React.FC = () => { const f = useCurrentFrame(); const seed = Math.floor(f / 2) % 50; return (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.18, pointerEvents: "none" }}>
    <svg width="100%" height="100%"><filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter={`url(#gr${seed})`} /></svg>
  </AbsoluteFill>); };
const Vignette: React.FC<{ k?: number }> = ({ k = 0.85 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 65% at 50% 45%, transparent 40%, rgba(0,0,0,${k}) 100%)`, pointerEvents: "none" }} />;
const Rain: React.FC<{ t: number; n?: number; slant?: number; op?: number; speed?: number }> = ({ t, n = 90, slant = -18, op = 0.35, speed = 1 }) => {
  const drops = useMemo(() => Array.from({ length: 140 }, (_, i) => [random(`rx${i}`) * 1300 - 100, random(`ry${i}`), 50 + random(`rl${i}`) * 90, 0.5 + random(`rv${i}`)]), []);
  return (<svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>
    {drops.slice(0, n).map(([x, y, l, v], i) => { const yy = ((y * 2200 + t * 1400 * v * speed) % 2200) - 200; return <line key={i} x1={x} y1={yy} x2={x + slant * 0.4} y2={yy + l} stroke="#9fb7de" strokeWidth={2} strokeLinecap="round" />; })}
  </svg>);
};

/* ───────── original silhouette characters ───────── */
const Figure: React.FC<{ x: number; y: number; s?: number; rim?: string; coat?: string; hat?: boolean; eyes?: number }> = ({ x, y, s = 1, rim = K.amber, coat = "#0b1220", hat = false, eyes = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 420 C-150 250 -110 175 -60 160 L60 160 C110 175 150 250 150 420 Z" fill={coat} />
    <path d="M-150 420 C-150 250 -110 175 -60 160" stroke={rim} strokeWidth={5} fill="none" opacity={0.75} />
    <rect x={-30} y={110} width={60} height={60} rx={20} fill={coat} />
    <ellipse cx={0} cy={60} rx={72} ry={86} fill={coat} />
    <path d="M-60 20 C-70 70 -55 120 -20 140" stroke={rim} strokeWidth={5} fill="none" opacity={0.85} />
    {hat && <path d="M-110 0 L110 0 L80 -18 L70 -70 C40 -84 -40 -84 -70 -70 L-80 -18 Z" fill="#05080f" />}
    {eyes > 0 && <g opacity={eyes}><circle cx={-24} cy={52} r={6} fill="#fff" /><circle cx={24} cy={52} r={6} fill="#fff" /><circle cx={-24} cy={52} r={16} fill="rgba(255,255,255,0.15)" /><circle cx={24} cy={52} r={16} fill="rgba(255,255,255,0.15)" /></g>}
  </g>
);

/* ───────── train compartment (interior) ───────── */
const Compartment: React.FC<{ t: number; zoom?: number; lights?: number }> = ({ t, zoom = 1, lights = 1 }) => {
  const passing = ((t * 900) % 1400) - 200;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 1000px" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${K.navy} 0%, ${K.bg} 100%)` }} />
      {/* window */}
      <div style={{ position: "absolute", left: 140, top: 260, width: 800, height: 560, borderRadius: 60, overflow: "hidden", background: "linear-gradient(180deg,#0a1222,#122038)", boxShadow: "inset 0 0 0 14px #1c2942, inset 0 0 80px rgba(0,0,0,0.8)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 4, background: "rgba(255,181,71,0.12)" }} />
        {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: passing - k * 470, top: 300 + k * 30, width: 22, height: 22, borderRadius: 11, background: K.amber, boxShadow: `0 0 50px 20px rgba(255,181,71,${0.35 * lights})`, filter: "blur(1px)", transform: "scaleX(5)" }} />)}
        <Rain t={t} n={50} slant={-60} op={0.45} speed={0.6} />
      </div>
      {/* luggage rack */}
      <div style={{ position: "absolute", left: 80, top: 170, width: 920, height: 18, borderRadius: 9, background: "#1f2c47" }} />
      {/* seats */}
      <div style={{ position: "absolute", left: 60, top: 880, width: 960, height: 520, borderRadius: "70px 70px 20px 20px", background: "linear-gradient(180deg,#24324f,#141d31)" }} />
      <div style={{ position: "absolute", left: 60, top: 1300, width: 960, height: 620, background: "linear-gradient(180deg,#1a2540,#0c1222)" }} />
      {/* lamp glow */}
      <AbsoluteFill style={{ background: `radial-gradient(40% 25% at 50% 8%, rgba(255,213,138,${0.22 * lights}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

/* ───────── suitcase ───────── */
const Suitcase: React.FC<{ open: number; glow: number }> = ({ open, glow }) => (
  <svg width={620} height={560} viewBox="-310 -300 620 560" style={{ overflow: "visible" }}>
    <ellipse cx={0} cy={240} rx={300} ry={26} fill="rgba(0,0,0,0.5)" />
    {/* body */}
    <rect x={-280} y={-40} width={560} height={270} rx={30} fill="#3b2a1c" />
    <rect x={-280} y={-40} width={560} height={270} rx={30} fill="url(#leather)" />
    <defs>
      <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a4029" /><stop offset="1" stopColor="#2a1c12" /></linearGradient>
      <radialGradient id="moneyGlow"><stop offset="0" stopColor="rgba(255,213,138,0.9)" /><stop offset="1" stopColor="rgba(255,181,71,0)" /></radialGradient>
    </defs>
    {/* money inside */}
    {open > 0.05 && <g opacity={open}>
      <ellipse cx={0} cy={-30} rx={330} ry={160} fill="url(#moneyGlow)" opacity={glow} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-250 + (i % 5) * 100} y={-30 - Math.floor(i / 5) * 26} width={92} height={50} rx={6} fill={i % 2 ? "#7fbf8f" : "#9fd3a8"} stroke="#3e7a52" strokeWidth={2} />)}
      {Array.from({ length: 10 }, (_, i) => <rect key={"b" + i} x={-215 + (i % 5) * 100} y={-30 - Math.floor(i / 5) * 26} width={20} height={50} fill="#e8d3a0" />)}
    </g>}
    {/* lid (hinged at the back) */}
    <g transform={`translate(0 -40) scale(1 ${lerp(1, -0.55, open)})`}>
      <rect x={-280} y={-90} width={560} height={90} rx={26} fill="#4b3523" />
      <rect x={-60} y={-112} width={120} height={30} rx={14} fill="none" stroke="#2a1c12" strokeWidth={14} />
    </g>
    <rect x={-200} y={-46} width={40} height={18} rx={4} fill="#c9a24a" /><rect x={160} y={-46} width={40} height={18} rx={4} fill="#c9a24a" />
  </svg>
);

/* ───────── HUD (game-like status chips) ───────── */
const Chip: React.FC<{ label: string; value: string; color?: string; pulse?: number; op?: number }> = ({ label, value, color = K.ink, pulse = 0, op = 1 }) => (
  <div style={{ padding: "14px 22px 12px", borderRadius: 18, background: "rgba(10,16,30,0.72)", border: `1.5px solid ${pulse > 0.01 ? color : "rgba(255,255,255,0.12)"}`, backdropFilter: "blur(10px)", fontFamily: SANS,
    transform: `scale(${1 + pulse * 0.12})`, opacity: op, boxShadow: pulse ? `0 0 ${30 * pulse}px ${color}` : undefined }}>
    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(233,238,247,0.55)" }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{value}</div>
  </div>
);
const HUD: React.FC<{ t: number }> = ({ t }) => {
  const money = Math.round(eo(pr(t, at(26), at(28) + 0.4)) * 2_000_000);
  const hours = t < at(10) ? 0 : 3;
  const clockS = Math.floor(hours * 3600 + Math.max(0, t - 2) * 37);
  const hh = String(Math.floor(clockS / 3600)).padStart(2, "0"), mm = String(Math.floor(clockS / 60) % 60).padStart(2, "0"), ss = String(clockS % 60).padStart(2, "0");
  const wag = t >= at(71) ? 1 : 0;
  const cdStart = at(81), left = Math.max(0, 3 - Math.floor(Math.max(0, t - cdStart) / 2.6));
  const show = pr(t, 0.6, 1.1) * (1 - pr(t, at(100) - 0.3, at(100)));
  return (
    <div style={{ position: "absolute", left: 40, right: 170, top: 250, display: "flex", gap: 14, flexWrap: "wrap", opacity: show }}>
      <Chip label="FAHRZEIT" value={`${hh}:${mm}:${ss}`} pulse={Math.exp(-Math.max(0, t - at(10)) * 4) * (t > at(10) ? 1 : 0)} />
      <Chip label="KOFFER" value={`${money.toLocaleString("de-DE")} €`} color={money > 0 ? K.yellow : K.ink} pulse={money > 0 && money < 2_000_000 ? 0.4 : 0} op={pr(t, at(16), at(16) + 0.3)} />
      <Chip label="WAGEN" value={t >= at(74) ? "5" : "?"} color={wag ? K.red : K.ink} pulse={Math.exp(-Math.max(0, t - at(75)) * 3) * (t > at(75) ? 1 : 0)} op={pr(t, at(66), at(66) + 0.3)} />
      {t > cdStart - 0.2 && <Chip label="ZEIT" value={`0:0${left}`} color={K.red} pulse={Math.exp(-((t - cdStart) % 2.6) * 4)} />}
    </div>
  );
};

/* ───────── captions: 1–3 words, current word yellow ───────── */
const CHUNKS = (() => {
  const out: number[][] = []; let cur: number[] = [];
  WORDS.forEach((w, i) => { cur.push(i); const end = /[.,:?!]$/.test(w.w) || cur.length >= 3; if (end) { out.push(cur); cur = []; } });
  if (cur.length) out.push(cur); return out;
})();
const Captions: React.FC<{ t: number; y?: number }> = ({ t, y = 1330 }) => {
  const ci = CHUNKS.findIndex((c, k) => t >= WORDS[c[0]].s - 0.05 && (k === CHUNKS.length - 1 || t < WORDS[CHUNKS[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  const c = CHUNKS[ci]; const t0 = WORDS[c[0]].s;
  const pop = spring(t, t0 - 0.05, 0.35);
  return (
    <div style={{ position: "absolute", left: 50, right: 170, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: "-0.02em", lineHeight: 1.08,
      transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
      {c.map((i) => { const w = WORDS[i]; const on = t >= w.s - 0.03; const cur = on && t < w.e + 0.08;
        return <span key={i} style={{ color: cur ? K.yellow : on ? "#ffffff" : "rgba(255,255,255,0.35)", transform: `translateY(${cur ? -4 : 0}px)` }}>{w.w}</span>; })}
    </div>
  );
};

/* ───────── scenes ───────── */
const S_Wake: React.FC<{ t: number }> = ({ t }) => {
  const open = eo(pr(t, 0.0, 0.7)) * (1 - 0.55 * Math.exp(-Math.pow((t - 1.0) * 9, 2)));
  return (<AbsoluteFill style={{ filter: `blur(${(1 - pr(t, 0.2, 1.4)) * 14}px)` }}>
    <Compartment t={t} zoom={lerp(1.25, 1.1, pr(t, 0, 2.3))} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 960 * (1 - open), background: "#000", borderRadius: "0 0 50% 50% / 0 0 120px 120px" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 960 * (1 - open), background: "#000", borderRadius: "50% 50% 0 0 / 120px 120px 0 0" }} />
  </AbsoluteFill>);
};
const S_TrainOutside: React.FC<{ t: number }> = ({ t }) => {
  const x = ((t * 1600) % 3000);
  return (<AbsoluteFill style={{ background: "linear-gradient(180deg,#05080f,#0c1528 60%,#0a0f1c)" }}>
    {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ position: "absolute", left: (random(`st${i}`) * 1080), top: random(`sy${i}`) * 700, width: 3, height: 3, borderRadius: 2, background: "#cfe0ff", opacity: 0.5 }} />)}
    {/* hills */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><path d={`M0 1000 C 300 900 ${600 - (t * 40) % 300} 980 1080 920 L1080 1920 L0 1920Z`} fill="#0b1324" /></svg>
    {/* poles rushing by */}
    {Array.from({ length: 6 }, (_, i) => { const px = 1300 - ((t * 2400 + i * 380) % 1700); return <div key={i} style={{ position: "absolute", left: px, top: 760, width: 14, height: 700, background: "#04070d", filter: "blur(3px)" }} />; })}
    {/* train */}
    <div style={{ position: "absolute", left: -40, top: 1080, width: 1160, height: 300, background: "linear-gradient(180deg,#1b2843,#0f1729)", borderRadius: 26 }}>
      {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ position: "absolute", left: ((i * 190 - x * 0.08) % 1300) + 20, top: 60, width: 140, height: 110, borderRadius: 18, background: "linear-gradient(180deg,#ffd58a,#ffb547)", boxShadow: "0 0 40px rgba(255,181,71,0.6)" }} />)}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1390, height: 10, background: "#2a3957" }} />
    {/* station lights flying past without stopping */}
    {t > at(12) - 0.3 && Array.from({ length: 3 }, (_, i) => { const px = 1400 - ((t - at(12) + i * 0.35) * 3200); return <div key={i} style={{ position: "absolute", left: px, top: 900, width: 260, height: 10, background: K.amber, filter: "blur(6px)", opacity: 0.8 }} />; })}
    <Rain t={t} n={110} slant={-90} op={0.35} speed={1.4} />
  </AbsoluteFill>);
};
const S_Case: React.FC<{ t: number }> = ({ t }) => {
  const inn = spring(t, at(16) - 0.3, 0.6);
  const open = eo(pr(t, at(25) - 0.1, at(25) + 0.6));
  const glow = 0.6 + 0.4 * Math.sin(t * 3) ** 2;
  return (<AbsoluteFill>
    <Compartment t={t} zoom={lerp(1.0, 1.35, pr(t, at(16), at(29)))} lights={0.6} />
    <div style={{ position: "absolute", left: 230, top: 720, transform: `translateY(${(1 - inn) * 400}px) scale(${lerp(1.3, 1.5, open)})`, transformOrigin: "310px 400px" }}><Suitcase open={open} glow={glow} /></div>
    {open > 0 && <AbsoluteFill style={{ background: `radial-gradient(40% 25% at 50% 48%, rgba(255,213,138,${0.25 * open * glow}), transparent 70%)`, mixBlendMode: "screen" }} />}
  </AbsoluteFill>);
};
const S_Note: React.FC<{ t: number }> = ({ t }) => {
  const inn = spring(t, at(29) - 0.15, 0.6);
  const name = pr(t, at(33), at(34) + 0.3);
  const write = pr(t, at(37) - 0.1, at(42) + 0.3);
  const msg = "Nicht öffnen, bevor der Zug hält.";
  return (<AbsoluteFill>
    <Compartment t={t} zoom={1.45} lights={0.5} />
    <AbsoluteFill style={{ background: "rgba(5,8,15,0.55)" }} />
    <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 760, background: "linear-gradient(180deg,#f3ecd9,#e2d7bb)", borderRadius: 10, boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      transform: `translateY(${(1 - inn) * 700}px) rotate(${lerp(-12, -3, inn)}deg)`, padding: 70, boxSizing: "border-box", fontFamily: '"Instrument Serif", Georgia, serif', color: "#1d1a14" }}>
      <div style={{ fontSize: 46, fontStyle: "italic", opacity: 0.6 }}>Für</div>
      {/* „your name“ – deliberately blurred: it's YOUR name */}
      <div style={{ fontSize: 120, fontStyle: "italic", marginTop: -6, filter: `blur(${lerp(14, 7, name)}px)`, opacity: name }}>Dein Name</div>
      <div style={{ height: 3, background: "#1d1a14", opacity: 0.3, margin: "10px 0 50px" }} />
      <div style={{ fontSize: 74, fontStyle: "italic", lineHeight: 1.15, color: "#7a1010" }}>{msg.slice(0, Math.floor(msg.length * write))}<span style={{ opacity: write < 1 ? 1 : 0 }}>|</span></div>
    </div>
  </AbsoluteFill>);
};
const S_TooLate: React.FC<{ t: number }> = ({ t }) => {
  const k = pr(t, at(43) - 0.05, at(43) + 0.15);
  const [sx, sy] = shake(t, at(43), 26);
  return (<AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
    <S_Note t={t} />
    <AbsoluteFill style={{ background: K.red, mixBlendMode: "multiply", opacity: 0.7 * k }} />
    <AbsoluteFill style={{ background: "#fff", opacity: Math.exp(-Math.max(0, t - at(43)) * 12) * 0.6 }} />
  </AbsoluteFill>);
};
const S_Woman: React.FC<{ t: number }> = ({ t }) => {
  const push = pr(t, at(45), at(61));
  const eyes = sm(pr(t, at(58) - 0.1, at(58) + 0.4));
  const lean = sm(pr(t, at(59), at(61)));
  return (<AbsoluteFill>
    <Compartment t={t} zoom={lerp(1.05, 1.25, push)} lights={0.7} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 1.5, lean)})`, transformOrigin: "540px 700px" }}>
      {/* original character: woman in long coat, face in shadow, short bob hair */}
      <g transform="translate(540 610)">
        <path d="M-80 -20 C-95 -120 -40 -170 0 -170 C40 -170 95 -120 80 -20 L70 70 L-70 70 Z" fill="#05080f" />
        <path d="M-80 -20 C-95 -120 -40 -170 0 -170" stroke={K.amber} strokeWidth={5} fill="none" opacity={0.8} />
      </g>
      <Figure x={540} y={540} s={1.35} rim={K.amber} eyes={eyes} />
    </svg>
    <AbsoluteFill style={{ background: `radial-gradient(30% 20% at 50% 36%, rgba(255,181,71,${0.08 + 0.1 * eyes}), transparent 70%)` }} />
  </AbsoluteFill>);
};
const S_Door: React.FC<{ t: number; shadows: number; rattle?: number; openK?: number }> = ({ t, shadows, rattle = 0, openK = 0 }) => {
  const [sx, sy] = rattle ? shake(t, rattle, 10, 0.9) : [0, 0];
  return (<AbsoluteFill style={{ background: "linear-gradient(180deg,#0c1426,#060a13)" }}>
    {/* corridor perspective */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M0 0 L300 520 L300 1500 L0 1920Z" fill="#111b30" /><path d="M1080 0 L780 520 L780 1500 L1080 1920Z" fill="#0d1628" />
      <path d="M0 1920 L300 1500 L780 1500 L1080 1920Z" fill="#0a111f" />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={0} y1={1920 - i * 90} x2={1080} y2={1920 - i * 90} stroke="#16223a" strokeWidth={2} />)}
    </svg>
    {/* the door to car 4 */}
    <div style={{ position: "absolute", left: 300, top: 520, width: 480, height: 980, background: "#1a2640", border: "8px solid #24324f", boxSizing: "border-box", transform: `translate(${sx}px,${sy}px)` }}>
      <div style={{ position: "absolute", left: 60, top: 80, width: 344, height: 520, background: `linear-gradient(180deg, rgba(255,213,138,${0.35 + openK}), rgba(255,181,71,${0.15 + openK}))`, filter: "blur(1px)", overflow: "hidden" }}>
        {/* two figures approaching behind frosted glass */}
        <svg width={344} height={520} style={{ filter: `blur(${lerp(14, 6, shadows)}px)` }}>
          <Figure x={110} y={lerp(420, 120, shadows)} s={lerp(0.35, 0.85, shadows)} rim="transparent" coat="#120a05" hat />
          <Figure x={240} y={lerp(440, 140, shadows)} s={lerp(0.32, 0.8, shadows)} rim="transparent" coat="#120a05" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 120, top: -80, padding: "10px 28px", borderRadius: 12, background: "#0a101d", color: K.ink, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: "0.1em" }}>WAGEN 4</div>
      <div style={{ position: "absolute", right: 40, top: 640, width: 26, height: 120, borderRadius: 13, background: "#9aa6bc", transform: `rotate(${rattle ? Math.sin(t * 60) * 12 * Math.exp(-(t - rattle) * 2) : 0}deg)` }} />
    </div>
    {openK > 0 && <AbsoluteFill style={{ background: `radial-gradient(35% 30% at 50% 50%, rgba(255,240,210,${openK}), rgba(255,213,138,${openK * 0.6}) 40%, transparent 75%)`, mixBlendMode: "screen" }} />}
  </AbsoluteFill>);
};
const S_Map: React.FC<{ t: number }> = ({ t }) => {
  const k = pr(t, at(71) - 0.2, at(76));
  const cars = [0, 1, 2, 3, 4, 5];
  return (<AbsoluteFill style={{ background: "#060a13" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {/* grid */}
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={0} y1={i * 100} x2={1080} y2={i * 100} stroke="#0f1a2e" />)}
      {cars.map((c) => <g key={c}><rect x={340} y={420 + c * 190} width={400} height={170} rx={24} fill={c === 4 ? "#13233f" : "#0e1729"} stroke={c === 4 ? K.blue : c === 3 ? K.red : "#24324f"} strokeWidth={c >= 3 ? 5 : 3} />
        <text x={760} y={515 + c * 190} fill="rgba(233,238,247,0.5)" fontFamily={SANS} fontSize={30} fontWeight={700}>{c + 1}</text></g>)}
      {/* you */}
      <circle cx={540} cy={1225} r={18 + Math.sin(t * 5) * 3} fill={K.blue} /><circle cx={540} cy={1225} r={44} fill="none" stroke={K.blue} strokeWidth={3} opacity={0.5} />
      <text x={580} y={1236} fill={K.blue} fontFamily={SANS} fontSize={34} fontWeight={800}>DU</text>
      {/* two pursuers moving from car 4 towards car 5 */}
      {[0, 1].map((i) => <circle key={i} cx={470 + i * 120} cy={lerp(1000, 1130, k) + i * 20} r={18} fill={K.red} style={{ filter: `drop-shadow(0 0 12px ${K.red})` }} />)}
    </svg>
  </AbsoluteFill>);
};
const S_Countdown: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.max(1, 3 - Math.floor(Math.max(0, t - at(81)) / 1.2));
  const p = ((t - at(81)) % 1.2) / 1.2;
  return (<AbsoluteFill style={{ background: "#07090f", alignItems: "center", justifyContent: "center" }}>
    <AbsoluteFill style={{ background: `radial-gradient(40% 30% at 50% 45%, rgba(255,59,59,${0.35 * (1 - p)}), transparent 70%)` }} />
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 620, color: K.red, transform: `scale(${1.3 - 0.3 * eo(p * 2)})`, opacity: 1 - p * 0.6, marginTop: -260, textShadow: `0 0 80px ${K.red}` }}>{n}</div>
  </AbsoluteFill>);
};
const S_Choice: React.FC<{ t: number }> = ({ t }) => {
  const a = spring(t, at(83) - 0.1, 0.5), b = spring(t, at(91) - 0.1, 0.5);
  const card = (side: "A" | "B", k: number, col: string, title: string, icon: React.ReactNode, x: number) => (
    <div style={{ position: "absolute", left: x, top: 420, width: 470, height: 820, borderRadius: 40, background: "rgba(14,23,41,0.9)", border: `3px solid ${col}`, boxShadow: `0 0 60px ${col}55`, fontFamily: SANS, color: K.ink,
      transform: `translateY(${(1 - k) * 1500}px)`, opacity: cl(k * 3), display: "flex", flexDirection: "column", alignItems: "center", padding: 40, boxSizing: "border-box" }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, fontWeight: 900, color: "#0a0f1a" }}>{side}</div>
      <div style={{ marginTop: 50 }}>{icon}</div>
      <div style={{ marginTop: 40, fontSize: 48, fontWeight: 800, textAlign: "center", lineHeight: 1.15 }}>{title}</div>
    </div>
  );
  return (<AbsoluteFill style={{ background: "#060a13" }}>
    {card("A", a, K.blue, "Koffer verstecken", <svg width={220} height={170} viewBox="0 0 220 170"><rect x={10} y={20} width={200} height={40} rx={10} fill="#24324f" /><rect x={50} y={70} width={120} height={80} rx={14} fill="#6b4a2f" /><rect x={92} y={58} width={36} height={14} rx={6} fill="#c9a24a" /></svg>, 50)}
    {card("B", b, K.red, "Notbremse ziehen", <svg width={220} height={170} viewBox="0 0 220 170"><rect x={95} y={0} width={30} height={90} fill="#9aa6bc" /><rect x={50} y={80} width={120} height={50} rx={18} fill={K.red} /><path d="M110 140 v20" stroke={K.red} strokeWidth={8} /></svg>, 560)}
  </AbsoluteFill>);
};
const S_End: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(100) - 0.1, 0.6);
  const p = Math.sin(t * 5) * 0.5 + 0.5;
  return (<AbsoluteFill>
    <AbsoluteFill style={{ filter: "blur(18px) brightness(0.45)" }}><S_Door t={t} shadows={1} openK={0.6} /></AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 170, color: "#fff", transform: `scale(${0.7 + 0.3 * k})`, opacity: k, letterSpacing: "-0.03em" }}>
      <span style={{ color: K.blue }}>A</span> oder <span style={{ color: K.red }}>B</span>?
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center", gap: 50, opacity: pr(t, at(103), at(104)) }}>
      {[K.blue, K.red].map((c, i) => <div key={i} style={{ width: 200, height: 200, borderRadius: 100, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 120, color: "#0a0f1a",
        transform: `scale(${1 + (i === 0 ? p : 1 - p) * 0.08})`, boxShadow: `0 0 ${40 + 40 * (i === 0 ? p : 1 - p)}px ${c}` }}>{i ? "B" : "A"}</div>)}
    </div>
    <svg width={140} height={140} viewBox="0 0 24 24" style={{ position: "absolute", left: 470, top: 1500, opacity: pr(t, at(109), at(109) + 0.3) * (1 - pr(t, OUTRO_T0, OUTRO_T0 + 0.3)), transform: `translateY(${Math.sin(t * 6) * 12}px)` }}><path d="M12 4v14m-6-6 6 6 6-6" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </AbsoluteFill>);
};

/* ───────── timeline ───────── */
const SCENES: { from: number; to: number; C: React.FC<{ t: number }> }[] = [
  { from: 0, to: at(6) - 0.05, C: S_Wake },
  { from: at(6) - 0.05, to: at(16) - 0.3, C: S_TrainOutside },
  { from: at(16) - 0.3, to: at(29) - 0.15, C: S_Case },
  { from: at(29) - 0.15, to: at(43) - 0.05, C: S_Note },
  { from: at(43) - 0.05, to: at(45) - 0.05, C: S_TooLate },
  { from: at(45) - 0.05, to: at(61) - 0.1, C: S_Woman },
  { from: at(61) - 0.1, to: at(71) - 0.2, C: ({ t }) => <S_Door t={t} shadows={sm(pr(t, at(61), at(70) + 0.5))} /> },
  { from: at(71) - 0.2, to: at(76) - 0.1, C: S_Map },
  { from: at(76) - 0.1, to: at(79) - 0.1, C: ({ t }) => <S_Door t={t} shadows={1} rattle={at(77)} /> },
  { from: at(79) - 0.1, to: at(83) - 0.15, C: S_Countdown },
  { from: at(83) - 0.15, to: at(96) - 0.1, C: S_Choice },
  { from: at(96) - 0.1, to: at(100) - 0.15, C: ({ t }) => <AbsoluteFill style={{ transform: `scale(${lerp(1, 1.25, pr(t, at(97), at(100)))})` }}><S_Door t={t} shadows={1} openK={sm(pr(t, at(97), at(99) + 0.3))} /></AbsoluteFill> },
  { from: at(100) - 0.15, to: 999, C: S_End },
];

export const Wagen5: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      {/* audio mix: voice, train ambience (loop), drone bed, hits */}
      <Audio src={staticFile("wagen5/voice.mp3")} volume={1} />
      <Audio src={staticFile("wagen5/drone.mp3")} volume={0.55} />
      <Audio src={staticFile("wagen5/train.mp3")} loop volume={(f) => 0.22 * (1 - pr(f / fps, at(79), at(80))) + 0.12 * pr(f / fps, at(83), at(84))} />
      {[at(10), at(25), at(43), at(61), at(76) - 0.1, at(96)].map((s, i) => <Sequence key={i} from={fr(s - 0.1)}><Audio src={staticFile("wagen5/hit.mp3")} volume={i === 2 || i === 5 ? 0.9 : 0.55} /></Sequence>)}
      <Sequence from={fr(at(77) - 0.2)}><Audio src={staticFile("wagen5/door.mp3")} volume={0.8} /></Sequence>
      <Sequence from={fr(at(79))}><Audio src={staticFile("wagen5/heart.mp3")} volume={0.9} /></Sequence>
      {[OUTRO_T0, OUTRO_T0 + 1.6, OUTRO_T0 + 3.2].map((s2, i) => <Sequence key={"pop" + i} from={fr(s2)}><Audio src={staticFile("wagen5/pop.mp3")} volume={0.5} /></Sequence>)}
      <Sequence from={fr(at(91) + 1.2)}><Audio src={staticFile("wagen5/brake.mp3")} volume={0.35} /></Sequence>

      {SCENES.map((s, i) => (t >= s.from && t < s.to ? <AbsoluteFill key={i}><s.C t={t} /></AbsoluteFill> : null))}
      {/* quick flash cut between scenes (beat of the edit) */}
      {SCENES.slice(1).map((s, i) => { const d = t - s.from; return d >= 0 && d < 0.12 ? <AbsoluteFill key={"fl" + i} style={{ background: "#fff", opacity: 0.18 * (1 - d / 0.12) }} /> : null; })}
      <HUD t={t} />
      {t < OUTRO_T0 && <Captions t={t} y={t > at(100) - 0.15 ? 1180 : 1330} />}
      <Outro t={t} t0={OUTRO_T0} />
      <Vignette />
      <Grain />
      {/* watermark – bottom-left, above TikTok's caption area, semi-transparent */}
      <div style={{ position: "absolute", left: 44, top: 1585, fontFamily: SANS, fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.38)", textShadow: "0 2px 8px rgba(0,0,0,0.6)", letterSpacing: "0.01em" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

/* ───────── cover / thumbnail (series template) ───────── */
export const W5Cover: React.FC<{ part?: number; hook?: string }> = ({ part = 1, hook = "Du hast 3 Sekunden." }) => {
  const t = at(27) + 0.6; // open suitcase, money glowing
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <AbsoluteFill style={{ filter: "brightness(0.8)" }}><S_Case t={t} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,11,20,0.85) 0%, rgba(7,11,20,0.1) 30%, rgba(7,11,20,0.1) 55%, rgba(7,11,20,0.9) 80%)" }} />
      {/* everything important inside the 3:4 centre crop (y 240–1680) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: SANS }}>
        <div style={{ display: "inline-block", padding: "12px 30px", borderRadius: 16, background: K.red, color: "#fff", fontWeight: 900, fontSize: 54, letterSpacing: "0.08em" }}>TEIL {part}</div>
        <div style={{ marginTop: 24, fontWeight: 900, fontSize: 190, lineHeight: 0.95, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>WAGEN 5</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1330, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 92, color: K.yellow, lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,0.85)" }}>{hook}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#fff" }}>
        <span style={{ color: K.blue }}>A</span> oder <span style={{ color: K.red }}>B</span>?
      </div>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};
