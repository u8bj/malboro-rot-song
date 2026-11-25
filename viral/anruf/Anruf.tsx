// „3:17 Uhr – Anruf von deiner eigenen Nummer“ – original horror A/B short for @entscheidungsnacht. 1080×1920 @ 30 fps.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { OutroCompact, OUTRO_COMPACT_S } from "../shared/Outro";
import { SANS, cl, pr, eo, lerp, spring, useT, SAFE, Grain, Vignette, shake } from "../shared/StoryKit";

type Wd = { w: string; s: number; e: number; spk: "N" | "P" | "X"; ln: number };
const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
const LINES = Array.from({ length: 14 }, (_, n) => { const ix = W.map((w, i) => [w, i] as const).filter(([w]) => w.ln === n).map(([, i]) => i); return { a: ix[0], b: ix[ix.length - 1], s: W[ix[0]].s, e: W[ix[ix.length - 1]].e, spk: W[ix[0]].spk }; });
const LS = (n: number) => LINES[n].s, LE = (n: number) => LINES[n].e;
export const AN_OUTRO_T0 = W[W.length - 1].e + 0.6;
export const AN_DURATION_S = AN_OUTRO_T0 + OUTRO_COMPACT_S;
const CX = (SAFE.left + SAFE.right) / 2, SW = SAFE.right - SAFE.left;
const C = { ink: "#eef1f7", moon: "#8fb2ff", red: "#ff2d3d", green: "#30d158", blue: "#4da3ff", warm: "#ffb054", dim: "rgba(238,241,247,0.55)" };
const ANSWER = at(14) - 0.1;

/* ───────── phone ───────── */
const Phone: React.FC<{ t: number }> = ({ t }) => {
  const ringing = t < ANSWER; const vib = ringing && Math.sin(t * 7) > 0 ? Math.sin(t * 95) * 6 : 0;
  const mine = pr(t, at(10) - 0.1, at(10) + 0.3); const you = pr(t, at(24), at(26));
  const callT = Math.max(0, t - ANSWER); const P = W.find((w) => w.spk === "P" && t >= w.s && t <= w.e + 0.05);
  const amp = P ? 0.4 + 0.6 * Math.abs(Math.sin(t * 17)) : t > at(16) && t < at(21) ? 0.15 + 0.1 * Math.abs(Math.sin(t * 3)) : 0.05;
  return (
    <div style={{ position: "absolute", left: CX - 300, top: 330, width: 600, height: 1060, borderRadius: 90, background: "#0b0d12", border: "10px solid #1c1f27", boxShadow: `0 0 ${ringing ? 160 : 90}px rgba(120,160,255,${ringing ? 0.35 : 0.2})`, transform: `translateX(${vib}px) rotate(${vib * 0.15}deg)`, overflow: "hidden", fontFamily: SANS, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 20%, #1c2a4a, #07080c 75%)" }} />
      <div style={{ position: "absolute", left: 200, top: 26, width: 180, height: 50, borderRadius: 25, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.7 }}>Dienstag, 25. November</div>
        <div style={{ fontSize: 170, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, opacity: ringing ? 1 : 0.25 }}>3:17</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center" }}>
        <div style={{ fontSize: 30, opacity: 0.6, fontWeight: 600 }}>{ringing ? "Eingehender Anruf …" : `${String(Math.floor(callT / 60)).padStart(2, "0")}:${String(Math.floor(callT % 60)).padStart(2, "0")}`}</div>
        <div style={{ fontSize: 58, fontWeight: 800, marginTop: 8, color: you > 0.5 ? C.red : "#fff" }}>{you > 0.5 ? "DU" : mine > 0.5 ? "Meine Nummer" : "+49 157 ••• •• 17"}</div>
        {mine > 0 && <div style={{ display: "inline-block", marginTop: 14, padding: "8px 20px", borderRadius: 16, background: "rgba(255,45,61,0.2)", color: C.red, fontSize: 28, fontWeight: 800, opacity: mine }}>⚠︎ Anrufer = dein Handy</div>}
      </div>
      {/* waveform */}
      {!ringing && <svg width={600} height={200} style={{ position: "absolute", left: 0, top: 640 }}>{Array.from({ length: 34 }, (_, i) => { const h = 8 + amp * 150 * Math.abs(Math.sin(i * 0.9 + t * 9) * Math.cos(i * 0.37 - t * 4)); return <rect key={i} x={45 + i * 15} y={100 - h / 2} width={8} height={h} rx={4} fill={P ? C.blue : "rgba(255,255,255,0.4)"} />; })}</svg>}
      {ringing ? (
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 90, display: "flex", justifyContent: "space-between" }}>
          {[[C.red, "✕"], [C.green, "✆"]].map(([c, s], i) => <div key={i} style={{ width: 150, height: 150, borderRadius: 75, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70, transform: i && Math.sin(t * 6) > 0 ? "scale(1.08)" : undefined }}>{s}</div>)}
        </div>) : (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 100, display: "flex", justifyContent: "center" }}><div style={{ width: 150, height: 150, borderRadius: 75, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70 }}>✕</div></div>)}
    </div>
  );
};

/* ───────── call pill (stays on screen while the call runs) ───────── */
const CallPill: React.FC<{ t: number }> = ({ t }) => {
  const callT = t - ANSWER; const P = W.find((w) => w.spk === "P" && t >= w.s && t <= w.e + 0.05); const quiet = t > LS(9) ? 0.35 : 1;
  return (
    <div style={{ position: "absolute", left: CX - 230, width: 460, top: SAFE.top + 10, height: 84, borderRadius: 42, background: "#000", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 16, padding: "0 26px", boxSizing: "border-box", fontFamily: SANS, color: "#fff" }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: C.green }} />
      <div style={{ fontSize: 30, fontWeight: 800, color: C.red }}>DU</div>
      <svg width={180} height={50}>{Array.from({ length: 14 }, (_, i) => { const h = 6 + (P ? quiet * 38 * Math.abs(Math.sin(i * 1.1 + t * 12)) : 2); return <rect key={i} x={i * 13} y={25 - h / 2} width={7} height={h} rx={3.5} fill={P ? C.blue : "rgba(255,255,255,0.35)"} />; })}</svg>
      <div style={{ marginLeft: "auto", fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums", opacity: 0.8 }}>{`${String(Math.floor(callT / 60)).padStart(2, "0")}:${String(Math.floor(callT % 60)).padStart(2, "0")}`}</div>
    </div>
  );
};

/* ───────── bedroom ───────── */
const Bedroom: React.FC<{ t: number; empty?: boolean; push?: number }> = ({ t, empty = false, push = 0 }) => {
  const br = empty ? 0 : (Math.sin(t * 2.1) * 0.5 + 0.5) * (t > at(42) ? 1 : 0.25);
  const twitch = !empty && t > at(42) && t < at(44) + 0.5 ? Math.sin(t * 40) * 6 : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1020" /><stop offset="1" stopColor="#05070d" /></linearGradient>
        <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.moon} stopOpacity={0.32} /><stop offset="1" stopColor={C.moon} stopOpacity={0} /></linearGradient>
        <linearGradient id="blk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4766" /><stop offset="1" stopColor="#1a2236" /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bw)" />
      <g transform={`translate(540 1000) scale(${1 + push * 0.35}) translate(-540 -1000)`}>
        <rect x={700} y={380} width={260} height={340} rx={8} fill="#18233d" stroke="#2a3657" strokeWidth={10} />
        <line x1={830} y1={380} x2={830} y2={720} stroke="#2a3657" strokeWidth={8} /><line x1={700} y1={550} x2={960} y2={550} stroke="#2a3657" strokeWidth={8} />
        <circle cx={900} cy={440} r={30} fill="#dfe8ff" opacity={0.85} />
        <polygon points="700,380 960,380 620,1500 60,1500" fill="url(#beam)" />
        <rect x={0} y={1330} width={1080} height={590} fill="#070910" />
        <rect x={120} y={760} width={840} height={240} rx={30} fill="#141b2c" />
        <rect x={100} y={1000} width={880} height={330} rx={26} fill="#1b2438" />
        <ellipse cx={300} cy={1010} rx={150} ry={56} fill="#c9d3ea" opacity={empty ? 0.5 : 0.7} />
        {empty ? (
          <path d="M120 1180 C300 1150 600 1170 960 1140 L960 1330 L120 1330 Z" fill="url(#blk)" />
        ) : (
          <path d={`M120 1040 C200 ${980 - br * 40} 420 ${930 - br * 60 + twitch} 600 ${950 - br * 50} C760 ${960 - br * 30} 900 1000 960 1060 L960 1330 L120 1330 Z`} fill="url(#blk)" />
        )}
        {!empty && <path d={`M220 ${1080 - br * 20} C400 ${1010 - br * 50} 620 ${1020 - br * 40} 860 1090`} stroke="#4c5b80" strokeWidth={6} fill="none" opacity={0.6} />}
        {empty && <path d="M260 1060 C280 1100 330 1110 380 1090" stroke="#0b0f19" strokeWidth={10} fill="none" opacity={0.7} />}
      </g>
    </svg>
  );
};

/* ───────── hallway towards the front door ───────── */
const Hallway: React.FC<{ t: number; push?: number; knock?: number; feet?: number }> = ({ t, push = 0, knock = 0, feet = 0 }) => {
  const flick = knock ? 0.6 + 0.4 * Math.abs(Math.sin(t * 31)) : 1;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#05070c" />
      <g transform={`translate(540 820) scale(${1 + push * 0.9}) translate(-540 -820)`}>
        <polygon points="0,0 410,560 410,1060 0,1920" fill="#0d1120" /><polygon points="1080,0 670,560 670,1060 1080,1920" fill="#0a0e1a" />
        <polygon points="0,0 1080,0 670,560 410,560" fill="#080b14" /><polygon points="0,1920 1080,1920 670,1060 410,1060" fill="#0b0e17" />
        <rect x={130} y={620} width={110} height={150} fill="#151b2c" transform="skewY(18)" /><rect x={860} y={300} width={90} height={130} fill="#121827" transform="skewY(-18)" />
        <g transform={`translate(${knock * Math.sin(t * 60) * 3} 0)`}>
          <rect x={440} y={640} width={200} height={420} fill="#1a1410" stroke="#2a211a" strokeWidth={8} />
          <circle cx={612} cy={860} r={8} fill="#8a7a5a" />
          <path d="M600 880 a6 6 0 1 1 12 0 l3 16 h-18 z" fill="#000" />
        </g>
        <rect x={440} y={1056} width={200} height={8} fill={C.warm} opacity={0.85 * flick} />
        {feet > 0 && <g opacity={feet}><rect x={490} y={1056} width={34} height={8} fill="#000" /><rect x={556} y={1056} width={34} height={8} fill="#000" /></g>}
        <polygon points="440,1064 640,1064 760,1300 320,1300" fill={C.warm} opacity={0.07 * flick} />
      </g>
    </svg>
  );
};

/* ───────── bedroom door behind you – long fingers ───────── */
const Fingers: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={cl(k * 1.5)}>
    {[0, 1, 2, 3].map((i) => { const len = [0.8, 1, 1.05, 0.85][i] * 120 * k; const yy = i * 38;
      return (<g key={i}>
        <path d={`M-30 ${yy} C${-4} ${yy - 16} ${len * 0.55} ${yy - 14} ${len * 0.75} ${yy + 6} C${len * 0.85} ${yy + 18} ${len * 0.8} ${yy + 34} ${len * 0.7} ${yy + 44}`} stroke="#9aa0ad" strokeWidth={20} strokeLinecap="round" fill="none" />
        <path d={`M-30 ${yy} C${-4} ${yy - 16} ${len * 0.55} ${yy - 14} ${len * 0.75} ${yy + 6}`} stroke="#c9cdd6" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.6} />
        <circle cx={len * 0.4} cy={yy - 9} r={6} fill="#7d8391" opacity={0.8} />
        <path d={`M${len * 0.74} ${yy + 34} l-6 14`} stroke="#3a2f2f" strokeWidth={7} strokeLinecap="round" />
      </g>); })}
  </g>
);
const DoorBehind: React.FC<{ t: number }> = ({ t }) => {
  const open = eo(pr(t, LS(11) + 0.2, LE(11) + 0.6)); const fing = pr(t, LE(11) - 0.4, LE(11) + 0.5); const eyes = pr(t, LE(11) + 0.3, LE(11) + 0.8);
  const gx = 540 + open * 160;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#06080e" />
      <rect x={280} y={380} width={520} height={1020} fill="#0e1322" stroke="#1c2336" strokeWidth={24} />
      <rect x={292} y={392} width={gx - 292} height={996} fill="#000" />
      <g transform={`translate(${gx} 392) scale(${1 - open * 0.55} 1)`}><rect x={0} y={0} width={496} height={996} fill="#161c2c" /><rect x={40} y={60} width={410} height={380} fill="none" stroke="#1f273b" strokeWidth={8} /><rect x={40} y={520} width={410} height={400} fill="none" stroke="#1f273b" strokeWidth={8} /></g>
      <Fingers x={gx} y={660} k={fing} s={1} />
      {[0, 1].map((i) => <circle key={i} cx={gx - 120 + i * 50} cy={600} r={7} fill="#f2f4ff" opacity={eyes * (0.6 + 0.4 * Math.sin(t * 3))} />)}
    </svg>
  );
};

/* ───────── keyhole + eye ───────── */
const Keyhole: React.FC<{ t: number }> = ({ t }) => {
  const k = eo(pr(t, LS(12) - 0.2, LS(12) + 0.6)); const stare = t > at(135); const dx = stare ? 0 : Math.sin(t * 5) * 40;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs><radialGradient id="wood" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor="#3a2a1e" /><stop offset="1" stopColor="#0d0805" /></radialGradient>
        <clipPath id="kh"><circle cx={540} cy={760} r={150} /><polygon points="470,840 610,840 680,1180 400,1180" /></clipPath></defs>
      <g transform={`translate(540 860) scale(${lerp(0.6, 1.08, k) + (stare ? pr(t, at(135), at(137) + 0.5) * 0.15 : 0)}) translate(-540 -860)`}>
        <rect x={-500} y={-500} width={2080} height={2920} fill="url(#wood)" />
        {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${-200 + i * 90} -200 C${-150 + i * 90} 600 ${-260 + i * 90} 1200 ${-180 + i * 90} 2200`} stroke="#1b120c" strokeWidth={3} fill="none" opacity={0.5} />)}
        <circle cx={540} cy={860} r={330} fill="#7d6a4a" /><circle cx={540} cy={860} r={300} fill="#4f4130" />
        <g clipPath="url(#kh)">
          <rect x={300} y={560} width={480} height={680} fill="#1a0f0f" />
          <ellipse cx={540 + dx} cy={790} rx={190} ry={120} fill="#e8e1d8" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${360 + dx + i * 4} ${760 + i * 10} q60 ${-10 + i * 3} 110 ${8 - i}`} stroke="#c0302f" strokeWidth={2.5} fill="none" opacity={0.6} />)}
          <circle cx={540 + dx} cy={790} r={78} fill="#4a1616" /><circle cx={540 + dx} cy={790} r={stare ? 52 : 34} fill="#000" /><circle cx={512 + dx} cy={762} r={12} fill="#fff" opacity={0.85} />
        </g>
      </g>
    </svg>
  );
};

/* ───────── captions with speaker styling ───────── */
const chunks = (() => { const out: number[][] = []; let cur: number[] = []; W.forEach((w, i) => { if (cur.length && W[cur[0]].ln !== w.ln) { out.push(cur); cur = []; } cur.push(i); if (/[.,:?!]$/.test(w.w) || cur.length >= 3) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
const Caps: React.FC<{ t: number }> = ({ t }) => {
  const ci = chunks.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === chunks.length - 1 || t < W[chunks[k + 1][0]].s - 0.05));
  if (ci < 0) return null; const c = chunks[ci]; if (t > W[c[c.length - 1]].e + 0.7) return null;
  const spk = W[c[0]].spk; const pop = spring(t, W[c[0]].s - 0.05, 0.3);
  const hi = spk === "N" ? "#ffd23f" : spk === "P" ? C.blue : C.red;
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 1210, textAlign: "center", fontFamily: SANS }}>
      {spk !== "N" && <div style={{ display: "inline-block", marginBottom: 12, padding: "6px 18px", borderRadius: 12, fontSize: 26, fontWeight: 900, letterSpacing: "0.1em", background: spk === "P" ? "rgba(77,163,255,0.18)" : "rgba(255,45,61,0.2)", color: hi }}>{spk === "P" ? "📞 DEINE STIMME" : "🚪 „MAMA“"}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px", fontWeight: 900, fontSize: 86, letterSpacing: "-0.02em", lineHeight: 1.08, fontStyle: spk === "N" ? "normal" : "italic", transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 6px 26px rgba(0,0,0,0.9)" }}>
        {c.map((i) => { const on = t >= W[i].s - 0.03, cur = on && t < W[i].e + 0.08; return <span key={i} style={{ color: cur ? hi : on ? (spk === "N" ? "#fff" : spk === "P" ? "#cfe5ff" : "#ffd0d4") : "rgba(255,255,255,0.3)" }}>{W[i].w}</span>; })}
      </div>
    </div>
  );
};

/* ───────── scenes ───────── */
type S = { from: number; to: number; C: React.FC<{ t: number }> };
const SCENES: S[] = [
  { from: 0, to: LS(3) - 0.1, C: ({ t }) => <AbsoluteFill style={{ background: "#020306" }}><AbsoluteFill style={{ background: "radial-gradient(40% 30% at 50% 40%, rgba(80,110,200,0.25), transparent 70%)" }} /><div style={{ transform: `translateY(-60px) scale(${0.8 + pr(t, ANSWER, LS(3)) * 0.08})`, transformOrigin: "540px 330px", position: "absolute", inset: 0 }}><Phone t={t} /></div></AbsoluteFill> },
  { from: LS(3) - 0.1, to: LS(5) - 0.1, C: ({ t }) => <Bedroom t={t} push={pr(t, LS(3), LS(5))} /> },
  { from: LS(5) - 0.1, to: LS(7) - 0.1, C: ({ t }) => <Hallway t={t} push={pr(t, LS(5), LS(7)) * 0.4} knock={(t > at(70) && t < at(71) + 1.2) || (t > LS(6) - 0.4 && t < LS(6)) ? 1 : 0} feet={pr(t, LS(6), LS(6) + 0.5)} /> },
  { from: LS(7) - 0.1, to: LS(8) - 0.1, C: ({ t }) => {
    const k = spring(t, LS(7), 0.4), k2 = spring(t, at(95) - 0.1, 0.4);
    return (<AbsoluteFill style={{ background: "#05070c", fontFamily: SANS, color: "#fff" }}>
      <div style={{ position: "absolute", left: CX - 340, width: 680, top: 360, borderRadius: 44, background: "#11141c", border: "1.5px solid rgba(255,255,255,0.08)", padding: 34, boxSizing: "border-box", transform: `translateY(${(1 - k) * 100}px)`, opacity: cl(k * 2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, background: "linear-gradient(180deg,#ff9fb0,#d0607a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>♥</div>
          <div><div style={{ fontSize: 36, fontWeight: 800 }}>Mama</div><div style={{ fontSize: 24, color: C.dim }}>zuletzt online: gestern</div></div>
        </div>
        <div style={{ marginTop: 26, borderRadius: 30, overflow: "hidden", background: "linear-gradient(180deg,#58b5ff,#ffd27a 70%,#f4a35a)", height: 300, position: "relative" }}>
          <div style={{ position: "absolute", left: 40, bottom: 0, width: 600, height: 110, background: "#1e6aa8", opacity: 0.85 }} />
          <div style={{ position: "absolute", left: 440, top: 60, width: 90, height: 90, borderRadius: 45, background: "#fff6c9" }} />
        </div>
        <div style={{ marginTop: 16, display: "inline-block", padding: "18px 26px", borderRadius: 30, background: "#262a35", fontSize: 40, fontWeight: 600 }}>Grüße aus dem Urlaub ☀️ Bin nächsten Sonntag zurück 😘</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontWeight: 900, fontSize: 120, letterSpacing: "-0.04em", color: C.red, transform: `scale(${0.7 + 0.3 * k2})`, opacity: cl(k2 * 2) }}>2.000 km</div>
    </AbsoluteFill>);
  } },
  { from: LS(8) - 0.1, to: LS(10) - 0.1, C: ({ t }) => <Hallway t={t} push={0.4 + pr(t, LS(8), LS(10)) * 0.3} feet={1} knock={t > LE(8) && t < LE(8) + 0.9 ? 1 : 0} /> },
  { from: LS(10) - 0.1, to: LS(11) - 0.1, C: ({ t }) => <Bedroom t={t} empty push={0.15 + pr(t, LS(10), LS(11)) * 0.2} /> },
  { from: LS(11) - 0.1, to: LS(12) - 0.25, C: ({ t }) => <DoorBehind t={t} /> },
  { from: LS(12) - 0.25, to: LS(13) - 0.1, C: ({ t }) => <Keyhole t={t} /> },
  { from: LS(13) - 0.1, to: 999, C: ({ t }) => {
    const n = 3 - Math.floor(pr(t, at(138), at(142)) * 3);
    const kA = spring(t, at(142) - 0.1, 0.45), kB = spring(t, at(147) - 0.1, 0.45);
    const card = (k: number, top: number, col: string, letter: string, title: string, art: React.ReactNode, dir: number) => (
      <div style={{ position: "absolute", left: SAFE.left + 10, width: SW - 20, top, height: 400, borderRadius: 48, overflow: "hidden", background: "#0c0f17", border: `3px solid ${col}`, boxShadow: `0 0 70px ${col}44`, transform: `translateX(${(1 - k) * 1100 * dir}px)`, fontFamily: SANS }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>{art}</div>
        <div style={{ position: "absolute", left: 34, top: 34, width: 110, height: 110, borderRadius: 55, background: col, color: "#000", fontSize: 72, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{letter}</div>
        <div style={{ position: "absolute", left: 34, bottom: 30, fontSize: 56, fontWeight: 900, color: "#fff", textShadow: "0 4px 20px #000" }}>{title}</div>
      </div>);
    return (<AbsoluteFill style={{ background: "#04050a" }}>
      {t < at(142) - 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 420, color: C.red, transform: `scale(${1 + (1 - ((t - at(138)) * 1.4 % 1)) * 0.25})`, opacity: t > at(138) ? 1 : 0 }}>{Math.max(1, n)}</div>}
      {card(kA, 300, C.red, "A", "Haustür öffnen", <svg width={870} height={400}><rect width={870} height={400} fill="#1a1410" /><rect x={560} y={40} width={180} height={360} fill="#2a1d14" /><circle cx={712} cy={230} r={7} fill="#8a7a5a" /><rect x={560} y={392} width={180} height={8} fill={C.warm} /></svg>, -1)}
      {card(kB, 740, C.blue, "B", "Dich umdrehen", <svg width={870} height={400}><rect width={870} height={400} fill="#080b14" /><rect x={560} y={30} width={200} height={370} fill="#000" stroke="#1c2336" strokeWidth={10} /><Fingers x={700} y={150} k={1} s={0.55} /><circle cx={610} cy={120} r={5} fill="#fff" /><circle cx={640} cy={120} r={5} fill="#fff" /></svg>, 1)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 90, color: "#fff", opacity: pr(t, at(152), at(152) + 0.2) }}>A oder B? <span style={{ display: "inline-block", transform: `translateY(${Math.abs(Math.sin(t * 5)) * 16}px)` }}>👇</span></div>
    </AbsoluteFill>);
  } },
];

export const Anruf: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig(); const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const sfx: [number, string, number][] = [
    [0, "buzz", 0.9], [1.25, "buzz", 0.9], [2.5, "buzz", 0.9], [3.75, "buzz", 0.8], [5.0, "buzz", 0.7], [at(10) - 0.1, "impact", 0.6], [at(10), "tinnitus", 0.25],
    [ANSWER, "pickup", 0.7], [ANSWER + 0.1, "static", 0.35], [at(16), "breath", 0.45], [at(24) - 0.1, "boom", 0.6], [LS(2) - 0.1, "static", 0.25],
    [LS(3) - 0.1, "whoosh", 0.6], [at(42) - 0.2, "breath", 0.7], [at(42), "heart", 0.6], [LS(4) - 0.1, "static", 0.25],
    [LS(5) - 0.1, "steps", 0.6], [at(70) - 0.05, "knock", 0.95], [LS(6) - 0.4, "knock2", 0.5],
    [LS(7) - 0.1, "msg", 0.4], [at(95) - 0.1, "impact", 0.7], [LS(8) - 0.1, "static", 0.3], [LE(8), "knock2", 0.85],
    [LS(9), "tinnitus", 0.3], [LS(10) - 0.1, "glitch", 0.7], [LS(10) - 0.1, "boom", 0.6], [at(120), "heart", 0.7],
    [LS(11), "creak", 1.0], [LE(11) + 0.1, "riser", 0.5], [LS(12) - 0.25, "sting", 1.0], [LS(12) - 0.25, "boom", 0.8], [at(137), "impact", 0.8],
    [at(138), "beep", 0.6], [at(139) + 0.4, "beep", 0.6], [at(141), "beep", 0.6], [at(142) - 0.1, "whoosh", 0.6], [at(147) - 0.1, "whoosh", 0.6], [at(152), "impact", 0.5],
    [AN_OUTRO_T0, "msg", 0.5],
  ];
  const droneVol = (f: number) => { const s = f / fps; if (s < ANSWER) return 0.25; if (s > LS(12) - 0.3 && s < LS(12) + 0.5) return 0.1; return s > AN_OUTRO_T0 ? 0.15 : 0.45; };
  const [kx, ky] = [[at(70), 12], [LE(8), 10], [LS(12) - 0.25, 26], [LS(10) - 0.1, 16]].reduce((acc, [s, a]) => { const [x, y] = shake(t, s, a, 0.5); return [acc[0] + x, acc[1] + y]; }, [0, 0]);
  return (
    <AbsoluteFill style={{ background: "#020306" }}>
      <Audio src={staticFile("anruf/voice.mp3")} />
      <Audio src={staticFile("anruf/drone.mp3")} loop volume={droneVol} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={fr(s)}><Audio src={staticFile(`anruf/${n}.mp3`)} volume={v} /></Sequence>)}
      <AbsoluteFill style={{ transform: `translate(${kx}px,${ky}px)` }}>
        {SCENES.map((s, i) => {
          if (t < s.from - 0.01 || t >= s.to + 0.25) return null;
          const inn = i === 0 ? 1 : eo(pr(t, s.from, s.from + 0.25)), out = pr(t, s.to, s.to + 0.25);
          return <AbsoluteFill key={i} style={{ opacity: inn * (1 - out), filter: inn < 1 || out > 0 ? `blur(${(1 - inn) * 14 + out * 14}px) brightness(${1 - out * 0.5})` : undefined }}><s.C t={t} /></AbsoluteFill>;
        })}
      </AbsoluteFill>
      {(t > LS(10) - 0.1 && t < LS(10) + 0.25) && <AbsoluteFill style={{ background: "#fff", opacity: 0.25 * Math.abs(Math.sin(t * 50)), mixBlendMode: "difference" }} />}
      {t > LS(12) - 0.25 && t < LS(12) + 0.25 && <AbsoluteFill style={{ background: C.red, opacity: 0.45 * (1 - pr(t, LS(12) - 0.25, LS(12) + 0.25)) }} />}
      <Vignette k={0.9} />
      <Grain />
      {t > ANSWER + 0.3 && t < LS(3) - 0.1 ? null : t > LS(3) - 0.1 && t < LE(10) + 0.4 && <CallPill t={t} />}
      {t < LS(13) - 0.1 && <Caps t={t} />}
      {t >= LS(13) - 0.1 && t < at(142) - 0.1 && <Caps t={t} />}
      <OutroCompact t={t} t0={AN_OUTRO_T0} />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

export const AnrufCover: React.FC = () => (
  <AbsoluteFill style={{ background: "#020306", fontFamily: SANS }}>
    <Keyhole t={LS(12) + 3} />
    <Vignette k={0.95} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontWeight: 900, fontSize: 112, lineHeight: 0.98, letterSpacing: "-0.04em", color: "#fff", textShadow: "0 8px 40px #000" }}>3:17 Uhr.<br /><span style={{ color: C.red }}>Du rufst dich<br />selbst an.</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1280, textAlign: "center" }}><span style={{ display: "inline-block", padding: "16px 34px", borderRadius: 26, background: "#fff", color: "#000", fontWeight: 900, fontSize: 64 }}>A oder B?</span></div>
  </AbsoluteFill>
);
