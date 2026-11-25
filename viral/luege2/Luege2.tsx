// „Lügen erkennen“ v2 – acted scenes (Lena & Max, original characters) + narrator freeze-frame analysis. 1080×1920 @ 30 fps.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { OutroCompact, OUTRO_COMPACT_S } from "../shared/Outro";
import { SANS, cl, pr, eo, lerp, spring, useT, SAFE, makeChunks } from "../shared/StoryKit";

type Wd = { w: string; s: number; e: number; spk: "N" | "L" | "M"; ln: number };
const W = wordsJson as Wd[];
const at = (i: number) => W[i].s, en = (i: number) => W[i].e;
const LINES = Array.from({ length: 17 }, (_, n) => { const ix = W.map((w, i) => [w, i] as const).filter(([w]) => w.ln === n).map(([, i]) => i); return { a: ix[0], b: ix[ix.length - 1], s: W[ix[0]].s, e: W[ix[ix.length - 1]].e, spk: W[ix[0]].spk }; });
const LS = (n: number) => LINES[n].s, LE = (n: number) => LINES[n].e;
export const L2_OUTRO_T0 = W[W.length - 1].e + 0.5;
export const L2_DURATION_S = L2_OUTRO_T0 + OUTRO_COMPACT_S;
const CX = (SAFE.left + SAFE.right) / 2, SW = SAFE.right - SAFE.left;
const C = { bg: "#f5f5f7", ink: "#0b0b0f", grey: "#86868b", line: "#e5e5ea", blue: "#0a84ff", red: "#ff3b30", green: "#34c759", purple: "#8e5cff", orange: "#ff9f0a" };
const SHADOW = "0 30px 80px rgba(20,20,40,0.12), 0 8px 24px rgba(20,20,40,0.08)";
const shakeAt = (t: number, t0: number, amp = 14, dur = 0.35) => { const k = 1 - pr(t, t0, t0 + dur); return k <= 0 || t < t0 ? [0, 0] : [Math.sin(t * 91) * amp * k, Math.cos(t * 77) * amp * k]; };

/* ───────── characters (original, stylised) ───────── */
type Mood = "neutral" | "nervous" | "suspicious" | "shock" | "smug";
const talkAmp = (t: number, spk: "L" | "M") => { const w = W.find((x) => x.spk === spk && t >= x.s - 0.02 && t <= x.e); return w ? 0.35 + 0.65 * Math.abs(Math.sin((t - w.s) * 19)) : 0; };
const Person: React.FC<{ who: "lena" | "max"; t: number; mood: Mood; look?: number; sweat?: number; glitch?: number }> = ({ who, t, mood, look = 0, sweat = 0, glitch = 0 }) => {
  const lena = who === "lena", talk = talkAmp(t, lena ? "L" : "M");
  const skin = lena ? "#f4c9a8" : "#e2ae88", skinD = lena ? "#e3ae8a" : "#cc936c", hood = lena ? ["#a57bff", "#7b4ff0"] : ["#3d9bff", "#0a6cdc"], hair = lena ? "#3b2a22" : "#6b4a2e";
  const blink = (Math.floor(t * 10 + (lena ? 3 : 0)) % 38 === 0) ? 0.1 : 1;
  const open = mood === "shock" ? 1.25 : mood === "suspicious" ? 0.55 : 1;
  const face = lena ? 1 : -1, lx = look * 9 + face * 4;
  const brow = { neutral: [0, 0], nervous: [14, -6], suspicious: [-10, 6], shock: [0, -16], smug: [-4, -2] }[mood];
  const id = who;
  return (
    <svg width={400} height={560} viewBox="0 0 400 560" style={{ overflow: "visible", filter: glitch ? `drop-shadow(${8 * glitch}px 0 0 rgba(255,0,90,0.7)) drop-shadow(${-8 * glitch}px 0 0 rgba(0,210,255,0.7))` : undefined }}>
      <defs>
        <radialGradient id={`sk${id}`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#fff" stopOpacity={0.35} /><stop offset="60%" stopColor={skin} stopOpacity={0} /></radialGradient>
        <linearGradient id={`hd${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hood[0]} /><stop offset="100%" stopColor={hood[1]} /></linearGradient>
      </defs>
      <ellipse cx={200} cy={552} rx={170} ry={14} fill="rgba(0,0,0,0.08)" />
      <g transform={`translate(0 ${Math.sin(t * 2.2 + (lena ? 0 : 1)) * 3})`}>
        {lena && <path d="M66 240 C54 110 346 110 334 240 L346 430 C300 456 100 456 54 430 Z" fill={hair} />}
        <path d="M54 560 C54 440 118 386 200 386 C282 386 346 440 346 560 Z" fill={`url(#hd${id})`} />
        <path d="M150 392 Q200 440 250 392" stroke="rgba(0,0,0,0.12)" strokeWidth={6} fill="none" />
        <line x1={182} y1={420} x2={178} y2={470} stroke="rgba(255,255,255,0.7)" strokeWidth={5} strokeLinecap="round" /><line x1={218} y1={420} x2={222} y2={470} stroke="rgba(255,255,255,0.7)" strokeWidth={5} strokeLinecap="round" />
        <rect x={172} y={330} width={56} height={70} rx={20} fill={skinD} />
        <g transform={`translate(0 ${-talk * 4}) rotate(${face * 2 + (glitch ? Math.sin(t * 60) * 3 : 0)} 200 230)`}>
          <circle cx={72} cy={240} r={22} fill={skinD} /><circle cx={328} cy={240} r={22} fill={skinD} />
          <ellipse cx={200} cy={225} rx={130} ry={138} fill={skin} />
          <ellipse cx={200} cy={225} rx={130} ry={138} fill={`url(#sk${id})`} />
          {lena ? (<>
            <circle cx={200} cy={72} r={48} fill={hair} />
            <path d="M70 215 C70 100 330 92 332 215 C300 150 210 132 120 170 C100 180 84 196 70 215 Z" fill={hair} />
          </>) : (
            <path d="M72 200 C60 96 140 70 210 76 C300 82 344 130 328 200 C306 150 270 140 240 150 C210 128 160 160 130 140 C110 160 88 170 72 200 Z" fill={hair} />
          )}
          <ellipse cx={130} cy={292} rx={24} ry={13} fill="#ff7b8a" opacity={0.28} /><ellipse cx={270} cy={292} rx={24} ry={13} fill="#ff7b8a" opacity={0.28} />
          {[150, 250].map((ex, i) => (
            <g key={i} transform={`translate(${ex} 240) scale(1 ${open * blink}) translate(${-ex} -240)`}>
              <ellipse cx={ex} cy={240} rx={25} ry={30} fill="#fff" />
              <circle cx={ex + lx} cy={244} r={15} fill="#2a1d18" /><circle cx={ex + lx + 5} cy={238} r={5} fill="#fff" />
              {lena && <path d={`M${ex - 26} 226 l-10 -8 M${ex - 20} 218 l-6 -10`} stroke="#2a1d18" strokeWidth={4} strokeLinecap="round" transform={i ? `translate(${2 * ex} 0) scale(-1 1)` : undefined} />}
            </g>))}
          <g stroke="#2a1d18" strokeWidth={9} strokeLinecap="round">
            <line x1={122} y1={192 + brow[1] + brow[0] * 0.3} x2={176} y2={192 + brow[1] - brow[0] * 0.6} />
            <line x1={224} y1={192 + brow[1] - brow[0] * 0.6} x2={278} y2={192 + brow[1] + brow[0] * 0.3 + (mood === "suspicious" ? -14 : 0)} />
          </g>
          <path d="M196 262 Q204 280 192 284" stroke={skinD} strokeWidth={6} fill="none" strokeLinecap="round" />
          {talk > 0 ? (<g><ellipse cx={200} cy={318} rx={24 + talk * 4} ry={5 + talk * 20} fill="#5b1e2a" /><ellipse cx={200} cy={318 + talk * 12} rx={14} ry={4 + talk * 6} fill="#ff6b81" opacity={0.8} /></g>)
            : mood === "shock" ? <ellipse cx={200} cy={322} rx={18} ry={26} fill="#5b1e2a" />
            : mood === "nervous" ? <path d="M168 318 q8 -8 16 0 q8 8 16 0 q8 -8 16 0 q8 8 16 0" stroke="#5b1e2a" strokeWidth={7} fill="none" strokeLinecap="round" />
            : mood === "suspicious" ? <path d="M176 320 L226 312" stroke="#5b1e2a" strokeWidth={8} strokeLinecap="round" />
            : mood === "smug" ? <path d="M172 314 Q205 334 230 306" stroke="#5b1e2a" strokeWidth={8} fill="none" strokeLinecap="round" />
            : <path d="M174 310 Q200 334 226 310" stroke="#5b1e2a" strokeWidth={8} fill="none" strokeLinecap="round" />}
          {sweat > 0 && [0, 1].map((k) => { const y = ((t * 40 + k * 60) % 120); return <path key={k} d="M0 -18 C8 -4 12 4 12 10 A12 12 0 0 1 -12 10 C-12 4 -8 -4 0 -18Z" fill="#7cc8ff" opacity={sweat * (1 - y / 120)} transform={`translate(${k ? 322 : 86} ${150 + y}) scale(1.3)`} />; })}
        </g>
      </g>
    </svg>
  );
};

/* ───────── stage + camera (pure function of t) ───────── */
const BASE = 1230, LX = 300, MX = 760, CY = 940;
type Key = { t: number; s: number; x: number; y: number };
const KEYS: Key[] = [
  { t: 0, s: 1.08, x: 540, y: 960 }, { t: LS(0) + 0.05, s: 1.18, x: 440, y: 930 }, { t: LS(1) - 0.1, s: 1.2, x: 660, y: 930 },
  { t: at(9) - 0.1, s: 1.45, x: MX, y: 900 }, { t: at(13), s: 3.1, x: MX, y: 905 },
  { t: LS(4) - 0.3, s: 1.12, x: 520, y: 950 }, { t: LS(5) - 0.1, s: 1.3, x: 700, y: 920 }, { t: at(70) - 0.1, s: 1.1, x: 560, y: 950 },
  { t: LS(8) - 0.3, s: 1.18, x: 440, y: 930 }, { t: LS(9) - 0.1, s: 1.32, x: 700, y: 920 }, { t: at(115) - 0.1, s: 1.12, x: 560, y: 950 },
  { t: LS(12) - 0.3, s: 1.2, x: 450, y: 930 }, { t: LS(13) - 0.1, s: 1.55, x: MX, y: 900 }, { t: LS(14) - 0.1, s: 1.15, x: 560, y: 950 },
  { t: LS(15) - 0.1, s: 1.16, x: 470, y: 940 }, { t: LE(15) + 0.05, s: 1.8, x: MX, y: 890 },
];
const cam = (t: number) => { let k = 0; for (let i = 0; i < KEYS.length; i++) if (KEYS[i].t <= t) k = i; const p = KEYS[Math.max(0, k - 1)], q = KEYS[k]; const b = k === 0 ? 1 : eo(pr(t, q.t, q.t + 0.5)); return { s: lerp(p.s, q.s, b), x: lerp(p.x, q.x, b), y: lerp(p.y, q.y, b) }; };
const toScreen = (t: number, X: number, Y: number) => { const c = cam(t); return [540 + (X - c.x) * c.s, CY + (Y - c.y) * c.s]; };

const Stage: React.FC<{ t: number; lena: Mood; max: Mood; maxLook?: number; sweat?: number; glitch?: number; freeze?: number }> = ({ t, lena, max, maxLook = 0, sweat = 0, glitch = 0, freeze }) => {
  const tt = freeze !== undefined ? freeze : t; const c = cam(tt); const [sx, sy] = glitch ? [Math.sin(t * 70) * 10 * glitch, 0] : [0, 0];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - c.x * c.s}px, ${CY - c.y * c.s}px) scale(${c.s})` }}>
        <div style={{ position: "absolute", left: -400, top: 1180, width: 1880, height: 900, background: "linear-gradient(180deg,#e9e9ee,#dedee6)" }} />
        <div style={{ position: "absolute", left: 40, top: 905, width: 1000, height: 330, borderRadius: 70, background: "linear-gradient(180deg,#d9d6e2,#c9c5d6)", boxShadow: "0 30px 60px rgba(40,30,80,0.12)" }} />
        <div style={{ position: "absolute", left: 90, top: 1040, width: 900, height: 200, borderRadius: 50, background: "linear-gradient(180deg,#e7e4ef,#d4d0e0)" }} />
        <div style={{ position: "absolute", left: 860, top: 640, width: 150, height: 170, borderRadius: 24, background: "linear-gradient(180deg,#ffffff,#ececf2)", boxShadow: SHADOW, opacity: 0.85 }} />
        <div style={{ position: "absolute", left: LX - 200, top: BASE - 560 }}><Person who="lena" t={tt} mood={lena} /></div>
        <div style={{ position: "absolute", left: MX - 200 + sx, top: BASE - 560 + sy }}><Person who="max" t={tt} mood={max} look={maxLook} sweat={sweat} glitch={glitch} /></div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── speech bubble (karaoke) ───────── */
const SpeechBubble: React.FC<{ t: number; ln: number; extra?: React.ReactNode }> = ({ t, ln, extra }) => {
  const L = LINES[ln], lena = L.spk === "L"; const k = spring(t, L.s - 0.12, 0.38);
  return (
    <div style={{ position: "absolute", top: 300, left: lena ? SAFE.left + 10 : undefined, right: lena ? undefined : 1080 - SAFE.right + 10, maxWidth: 700, transformOrigin: lena ? "left bottom" : "right bottom",
      transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 40}px)`, opacity: cl(k * 2) }}>
      <div style={{ display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: "0.08em", color: "#fff", background: lena ? C.purple : C.blue, padding: "6px 16px", borderRadius: 12, marginBottom: 10, float: lena ? "left" : "right" }}>{lena ? "LENA" : "MAX"}</div>
      <div style={{ clear: "both", background: "#fff", borderRadius: 40, padding: "26px 34px", boxShadow: SHADOW, fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.12, letterSpacing: "-0.025em", display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
        {W.slice(L.a, L.b + 1).map((w, i) => { const on = t >= w.s - 0.05; return <span key={i} style={{ color: on ? C.ink : "rgba(0,0,0,0.14)", transform: `translateY(${on ? 0 : 6}px)` }}>{w.w}</span>; })}
        {extra}
      </div>
    </div>
  );
};

/* ───────── typography helpers ───────── */
const Kinetic: React.FC<{ t: number; from: number; to: number; top: number; size?: number; accent?: Record<string, string>; out?: number; color?: string }> = ({ t, from, to, top, size = 88, accent = {}, out, color = C.ink }) => {
  const o = out !== undefined ? pr(t, out, out + 0.22) : 0;
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.22}px`, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.0,
      opacity: 1 - o, filter: o ? `blur(${o * 14}px)` : undefined }}>
      {W.slice(from, to).map((w, k) => { const i = from + k; const s = spring(t, W[i].s - 0.06, 0.3); const key = w.w.replace(/[^\p{L}\d]/gu, "").toLowerCase();
        return <span key={i} style={{ display: "inline-block", color: accent[key] ?? color, opacity: cl(s * 1.6), transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + 0.15 * s})`, filter: s < 1 ? `blur(${(1 - cl(s)) * 10}px)` : undefined }}>{w.w}</span>; })}
    </div>
  );
};
const Tag: React.FC<{ color: string; children: React.ReactNode; size?: number }> = ({ color, children, size = 30 }) => <span style={{ display: "inline-block", padding: `${size * 0.27}px ${size * 0.6}px`, borderRadius: size * 0.45, background: color, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "0.08em" }}>{children}</span>;
const Stamp: React.FC<{ t: number; t0: number; text: string; color?: string; x: number; y: number; rot?: number; size?: number }> = ({ t, t0, text, color = C.red, x, y, rot = -10, size = 86 }) => {
  const k = spring(t, t0, 0.3); if (k <= 0.01) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, cl(k))})`, opacity: cl(k * 2.5), border: `${size * 0.11}px solid ${color}`, borderRadius: size * 0.28, padding: `${size * 0.1}px ${size * 0.35}px`, color, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "0.05em", background: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{text}</div>;
};

/* narrator captions (bottom, inside safe area) – hidden where a headline already shows the words */
const CHUNKS = makeChunks(W.map((w) => ({ w: w.w, s: w.s, e: w.e }))).filter((c) => W[c[0]].spk === "N");
const COVERED: [number, number][] = [[9, 11], [20, 51], [51, 56], [74, 89], [89, 95], [117, 134], [134, 142], [177, 186], [186, 193], [193, 201]];
const NarrCaptions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((c, k) => t >= W[c[0]].s - 0.05 && t <= W[c[c.length - 1]].e + 0.35 && (k === CHUNKS.length - 1 || t < W[CHUNKS[k + 1][0]].s - 0.05));
  if (!c || COVERED.some(([a, b]) => c[0] >= a && c[0] < b)) return null;
  const pop = spring(t, W[c[0]].s - 0.05, 0.28);
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 1262, display: "flex", justifyContent: "center", opacity: cl(pop * 2), transform: `scale(${0.9 + 0.1 * pop})` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 16px", padding: "16px 30px", borderRadius: 30, background: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 60, letterSpacing: "-0.025em", boxShadow: "0 16px 40px rgba(0,0,0,0.25)" }}>
        {c.map((i) => { const on = t >= W[i].s - 0.03, cur = on && t < W[i].e + 0.08; return <span key={i} style={{ color: cur ? "#ffd60a" : on ? "#fff" : "rgba(255,255,255,0.3)" }}>{W[i].w}</span>; })}
      </div>
    </div>
  );
};

/* freeze-frame chrome for the "Seht ihr?" analysis moments */
const FreezeFX: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (<>
  <AbsoluteFill style={{ background: "#fff", opacity: 1 - pr(t, t0, t0 + 0.22) }} />
  <div style={{ position: "absolute", left: SAFE.left + 10, top: SAFE.top + 40, display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 16, background: C.ink, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: "0.08em", opacity: pr(t, t0, t0 + 0.15) }}>
    <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 5)) }} />ANALYSE
  </div>
  {[[SAFE.left, 250], [SAFE.right - 70, 250], [SAFE.left, 1180], [SAFE.right - 70, 1180]].map(([x, y], i) => <div key={i} style={{ position: "absolute", left: x, top: y, width: 70, height: 70, borderColor: C.ink, borderStyle: "solid", borderWidth: `${i < 2 ? 6 : 0}px ${i % 2 ? 6 : 0}px ${i >= 2 ? 6 : 0}px ${i % 2 ? 0 : 6}px`, opacity: 0.5 * pr(t, t0, t0 + 0.15) }} />)}
</>);

const TitleCard: React.FC<{ t: number; n: number; ln: number; from: number; to: number; color: string }> = ({ t, n, ln, from, to, color }) => {
  const k = spring(t, LS(ln) - 0.05, 0.35); const [dx, dy] = shakeAt(t, LS(ln), 18);
  return (<AbsoluteFill style={{ background: "#0b0b0f" }}>
    <AbsoluteFill style={{ background: `radial-gradient(50% 30% at 50% 45%, ${color}55, transparent 70%)`, opacity: k }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", transform: `translate(${dx}px,${dy}px) scale(${lerp(1.6, 1, cl(k))})`, opacity: cl(k * 2) }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 330, lineHeight: 1, color, letterSpacing: "-0.06em" }}>{n}</div>
      <Tag color={color} size={34}>TRICK {n}</Tag>
    </div>
    <Kinetic t={t} from={from} to={to} top={1010} size={96} color="#fff" />
  </AbsoluteFill>);
};

/* ───────── scenes ───────── */
type S = { from: number; to: number; C: React.FC<{ t: number }> };
const SCENES: S[] = [
  /* 1 – cold open: the question + the eye myth */
  { from: 0, to: at(20) - 0.15, C: ({ t }) => {
    const zoomEyes = t > at(13);
    return (<AbsoluteFill>
      <Stage t={t} lena="suspicious" max={t > LE(1) ? "nervous" : "smug"} maxLook={t > LE(1) ? Math.sin(t * 3.2) : -0.3} sweat={t > at(9) ? 0.8 : 0} />
      {t < at(9) - 0.1 && t > LS(0) - 0.2 && <SpeechBubble t={t} ln={t < LS(1) - 0.1 ? 0 : 1} />}
      {t >= at(9) - 0.1 && t < at(11) + 0.2 && <Kinetic t={t} from={9} to={11} top={300} size={170} accent={{ lügt: C.red }} out={at(11)} />}
      {zoomEyes && <Stamp t={t} t0={at(18) - 0.05} text="MYTHOS" x={540} y={CY - 10} size={110} />}
      {zoomEyes && t > at(18) - 0.05 && <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><g stroke={C.red} strokeWidth={26} strokeLinecap="round" opacity={pr(t, at(18) - 0.05, at(18) + 0.1)}><line x1={300} y1={700} x2={780} y2={1180} /><line x1={780} y1={700} x2={300} y2={1180} /></g></svg>}
    </AbsoluteFill>);
  } },
  /* 2 – liars look you in the eye just as often */
  { from: at(20) - 0.15, to: at(31) - 0.15, C: ({ t }) => (<AbsoluteFill>
    <Kinetic t={t} from={20} to={31} top={330} size={84} accent={{ genauso: C.blue }} />
    {[["LÜGNER", C.red], ["EHRLICHE", C.green]].map(([l, c], i) => { const k = spring(t, at(23) + i * 0.12, 0.4); const fill = eo(pr(t, at(24), at(28)));
      return (<div key={i} style={{ position: "absolute", left: SAFE.left + 30, width: SW - 60, top: 760 + i * 190, borderRadius: 36, background: "#fff", boxShadow: SHADOW, padding: "26px 32px", boxSizing: "border-box", transform: `translateX(${(1 - k) * (i ? 900 : -900)}px)`, fontFamily: SANS }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Tag color={c as string} size={26}>{l}</Tag><span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>👀 {Math.round(fill * 61)} %</span></div>
        <div style={{ marginTop: 18, height: 18, borderRadius: 9, background: C.line }}><div style={{ width: `${fill * 61}%`, height: "100%", borderRadius: 9, background: c as string }} /></div>
      </div>); })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.ink, opacity: pr(t, at(28), at(28) + 0.2) }}>= kein Unterschied</div>
  </AbsoluteFill>) },
  /* 3 – 54 % / coin flip */
  { from: at(31) - 0.15, to: at(45) - 0.15, C: ({ t }) => {
    const n = Math.round(eo(pr(t, at(37), at(40))) * 54); const flip = pr(t, at(42) - 0.2, at(44) + 0.6); const sy = Math.cos(flip * Math.PI * 8); const [dx, dy] = shakeAt(t, at(40), 10);
    return (<AbsoluteFill>
      <Kinetic t={t} from={31} to={38} top={330} size={74} />
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 540, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 340, letterSpacing: "-0.06em", color: C.ink, lineHeight: 1, opacity: pr(t, at(37) - 0.2, at(37)), transform: `translate(${dx}px,${dy}px)` }}>{n}<span style={{ fontSize: 160, color: C.grey }}>%</span></div>
      {t > at(42) - 0.3 && <div style={{ position: "absolute", left: CX - 100, top: 930, width: 200, height: 200, borderRadius: 100, background: sy > 0 ? "radial-gradient(circle at 35% 30%, #fff3c4, #e0b94a 50%, #9c7a2c)" : "radial-gradient(circle at 35% 30%, #f1dc93, #c99d32 50%, #85651f)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        transform: `translateY(${-Math.sin(Math.PI * flip) * 100}px) scale(${spring(t, at(42) - 0.3, 0.4)}) scaleY(${Math.max(0.04, Math.abs(sy))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#7a5a16" }}>{sy > 0 ? "50/50" : "?"}</div>}
      <Kinetic t={t} from={42} to={45} top={1190} size={70} accent={{ münzwurf: C.blue }} />
    </AbsoluteFill>);
  } },
  /* 4 – three tricks */
  { from: at(45) - 0.15, to: LS(3) - 0.1, C: ({ t }) => (<AbsoluteFill>
    <Kinetic t={t} from={45} to={51} top={330} size={90} accent={{ drei: C.blue, wirklich: C.blue }} />
    {[0, 1, 2].map((i) => { const t0 = at(46) + i * 0.16; const k = spring(t, t0, 0.32); const [dx, dy] = shakeAt(t, t0 + 0.05, 8, 0.25); return (
      <div key={i} style={{ position: "absolute", left: CX - 345 + i * 240, top: 760, width: 210, height: 280, borderRadius: 44, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SANS, fontWeight: 900, fontSize: 170, color: [C.blue, C.purple, C.orange][i], transform: `translate(${dx}px,${dy + (1 - k) * -600}px) rotate(${(i - 1) * 7 * k}deg) scale(${lerp(1.4, 1, cl(k))})`, opacity: cl(k * 3) }}>{i + 1}</div>); })}
  </AbsoluteFill>) },
  /* 5 – TRICK 1 */
  { from: LS(3) - 0.1, to: LS(4) - 0.25, C: ({ t }) => <TitleCard t={t} n={1} ln={3} from={53} to={56} color={C.blue} /> },
  /* 6 – scene: what did you watch? + freeze */
  { from: LS(4) - 0.25, to: at(74) - 0.15, C: ({ t }) => {
    const fz = at(70) - 0.08; const frozen = t >= fz;
    return (<AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: frozen ? "grayscale(1) contrast(0.95)" : undefined }}>
        <Stage t={t} lena="suspicious" max={t > LS(5) ? "nervous" : "neutral"} maxLook={t > LS(5) ? Math.sin(t * 4) : 0} sweat={t > LS(5) + 0.5 ? 1 : 0} freeze={frozen ? fz : undefined} />
      </div>
      <SpeechBubble t={frozen ? Math.min(t, LE(5) + 1) : t} ln={t < LS(5) - 0.1 ? 4 : 5} />
      {frozen && <FreezeFX t={t} t0={fz} />}
      {frozen && <Stamp t={t} t0={at(72) - 0.05} text="VAGE" x={760} y={560} size={96} rot={8} />}
      {frozen && (() => { const [x, y] = toScreen(fz, MX, 980); const k = eo(pr(t, fz + 0.15, fz + 0.6)); return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><ellipse cx={x} cy={y} rx={230} ry={300} fill="none" stroke={C.red} strokeWidth={10} strokeDasharray={1700} strokeDashoffset={1700 * (1 - k)} transform={`rotate(-8 ${x} ${y})`} /></svg>; })()}
    </AbsoluteFill>);
  } },
  /* 7 – truth vs lie */
  { from: at(74) - 0.15, to: LS(7) - 0.1, C: ({ t }) => (<AbsoluteFill>
    {[[C.green, "WAHRHEIT", "„Die neue Krimiserie. Drei Folgen, bis halb eins – das Ende war krass!“", "viele Details ✓", 74], [C.red, "LÜGE", "„So ’ne Serie halt.“", "kurz & vage ✕", 80]].map(([c, l, txt, sub, i0], i) => {
      const k = spring(t, at(i0 as number) - 0.1, 0.4);
      return (<div key={i} style={{ position: "absolute", left: SAFE.left + 20, width: SW - 40, top: 360 + i * 420, borderRadius: 44, background: "#fff", boxShadow: SHADOW, padding: "34px 40px", boxSizing: "border-box", fontFamily: SANS, transform: `translateY(${(1 - k) * 200}px) scale(${0.92 + 0.08 * k})`, opacity: cl(k * 2) }}>
        <Tag color={c as string}>{l}</Tag>
        <div style={{ marginTop: 22, fontSize: i ? 64 : 50, fontWeight: 800, lineHeight: 1.18, color: C.ink, letterSpacing: "-0.02em" }}>{txt}</div>
        <div style={{ marginTop: 16, fontSize: 32, fontWeight: 800, color: c as string }}>{sub}</div>
      </div>); })}
  </AbsoluteFill>) },
  /* 8 – TRICK 2 */
  { from: LS(7) - 0.1, to: LS(8) - 0.25, C: ({ t }) => <TitleCard t={t} n={2} ln={7} from={91} to={95} color={C.purple} /> },
  /* 9 – scene: tell it backwards + freeze */
  { from: LS(8) - 0.25, to: at(117) - 0.15, C: ({ t }) => {
    const fz = at(115) - 0.08; const frozen = t >= fz;
    const g = Math.max(t > at(108) - 0.05 && t < at(108) + 0.45 ? 1 : 0, t > at(113) && t < at(114) + 0.5 ? 1 : 0);
    return (<AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: frozen ? "grayscale(1) contrast(0.95)" : undefined }}>
        <Stage t={t} lena="suspicious" max={t > LS(9) ? "nervous" : "neutral"} maxLook={t > LS(9) ? Math.sin(t * 5) : 0} sweat={t > LS(9) ? 1 : 0} glitch={frozen ? 0 : g} freeze={frozen ? fz : undefined} />
      </div>
      <div style={{ transform: g && !frozen ? `translateX(${Math.sin(t * 80) * 8}px)` : undefined }}><SpeechBubble t={frozen ? Math.min(t, LE(9) + 1) : t} ln={t < LS(9) - 0.1 ? 8 : 9} /></div>
      {frozen && <FreezeFX t={t} t0={fz} />}
      {frozen && <Stamp t={t} t0={fz + 0.25} text="↺ FÄNGT VORNE AN" x={540} y={1150} size={58} rot={-4} />}
    </AbsoluteFill>);
  } },
  /* 10 – truth rewinds, lie collapses */
  { from: at(117) - 0.15, to: LS(11) - 0.1, C: ({ t }) => {
    const icons = ["🏠", "🍕", "📺", "😴"]; const fwd = eo(pr(t, at(117), at(121))), back = eo(pr(t, at(124), at(127) + 0.3));
    const crash = pr(t, at(129), at(129) + 0.6), rebuild = eo(pr(t, at(131), at(133) + 0.3));
    const row = (y: number, label: string, col: string, lie: boolean) => (<>
      <div style={{ position: "absolute", left: SAFE.left + 20, top: y - 70 }}><Tag color={col} size={26}>{label}</Tag></div>
      <div style={{ position: "absolute", left: CX - 380, top: y + 70, width: 760, height: 8, borderRadius: 4, background: C.line }} />
      <div style={{ position: "absolute", left: CX - 380, top: y + 70, width: 760 * (lie ? fwd : back > 0 ? 1 - back : fwd), height: 8, borderRadius: 4, background: col }} />
      {icons.map((e, i) => { const fall = lie ? crash * (1 - rebuild) : 0; const swap = lie && rebuild > 0.5 ? [2, 0, 3, 1][i] : i; const x = CX - 330 + i * 220;
        return <div key={i} style={{ position: "absolute", left: x - 70, top: y + fall * (260 + i * 60), width: 140, height: 140, borderRadius: 36, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76,
          opacity: (i / 3 <= fwd + 0.01 ? 1 : 0.15) * (1 - fall * 0.7), transform: `rotate(${fall * (i % 2 ? 40 : -35)}deg)`, border: lie && rebuild > 0.5 ? `4px solid ${C.red}` : undefined }}>{lie && rebuild > 0.5 && swap === 3 ? "❓" : icons[swap]}</div>; })}
    </>);
    return (<AbsoluteFill>
      {row(420, "WAHRHEIT", C.green, false)}
      {back > 0 && back < 1 && <div style={{ position: "absolute", left: CX - 80, top: 640, fontFamily: SANS, fontWeight: 900, fontSize: 100, color: C.green }}>◀◀</div>}
      {t > at(127) && row(890, "LÜGE", C.red, true)}
      <Kinetic t={t} from={122} to={128} top={1200} size={62} accent={{ wahrheit: C.green }} out={at(128) - 0.2} />
      <Kinetic t={t} from={128} to={134} top={1200} size={62} accent={{ lüge: C.red }} />
    </AbsoluteFill>);
  } },
  /* 11 – TRICK 3 */
  { from: LS(11) - 0.1, to: LS(12) - 0.25, C: ({ t }) => <TitleCard t={t} n={3} ln={11} from={136} to={142} color={C.orange} /> },
  /* 12 – scene: the unexpected question → counter-question → busted */
  { from: LS(12) - 0.25, to: LS(16) - 0.15, C: ({ t }) => {
    const fz = LS(14) - 0.08; const frozen = t >= fz && t < LE(14) + 0.15;
    const busted = t > LE(15) + 0.05; const [dx, dy] = shakeAt(t, LE(15) + 0.05, 22, 0.5);
    const ln = t < LS(13) - 0.1 ? 12 : t < LS(15) - 0.1 ? 13 : 15;
    const memo = spring(t, at(169) - 0.1, 0.4);
    return (<AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px)` }}>
      <div style={{ position: "absolute", inset: 0, filter: frozen ? "grayscale(1) contrast(0.95)" : undefined }}>
        <Stage t={t} lena={t > LS(15) ? "smug" : "suspicious"} max={busted ? "shock" : t > LS(13) ? "nervous" : "neutral"} maxLook={busted ? 0 : t > LS(13) ? Math.sin(t * 6) : 0} sweat={t > LS(13) ? 1 : 0} freeze={frozen ? fz : undefined} />
      </div>
      {!busted && <SpeechBubble t={frozen ? Math.min(t, LE(13) + 1) : t} ln={ln} extra={ln === 15 && memo > 0.01 ? (
        <div style={{ width: "100%", marginTop: 18, display: "flex", alignItems: "center", gap: 18, padding: "16px 22px", borderRadius: 26, background: C.blue, color: "#fff", transform: `scale(${0.7 + 0.3 * memo})`, transformOrigin: "left center", opacity: cl(memo * 2) }}>
          <span style={{ fontSize: 38 }}>▶</span>
          <svg width={330} height={50}>{Array.from({ length: 30 }, (_, i) => { const h = 8 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 40; return <rect key={i} x={i * 11} y={25 - h / 2} width={6} height={h} rx={3} fill="#fff" opacity={i / 30 < pr(t, at(169), at(176)) ? 1 : 0.45} />; })}</svg>
          <span style={{ fontSize: 30, fontWeight: 800, whiteSpace: "nowrap" }}>02:07 Uhr</span>
        </div>) : undefined} />}
      {frozen && <FreezeFX t={t} t0={fz} />}
      {frozen && <Stamp t={t} t0={at(156) - 0.05} text="GEGENFRAGE" x={540} y={1160} size={72} rot={-6} />}
      {frozen && (() => { const k = pr(t, at(157), LE(14)); return <div style={{ position: "absolute", left: SAFE.left + 20, top: 640, width: 160, height: 160 }}><svg width={160} height={160} viewBox="0 0 40 40"><circle cx={20} cy={20} r={16} fill="#fff" stroke={C.ink} strokeWidth={3} /><path d={`M20 20 L${20 + 12 * Math.sin(k * 6.28 * 3)} ${20 - 12 * Math.cos(k * 6.28 * 3)}`} stroke={C.red} strokeWidth={3} strokeLinecap="round" /><rect x={17} y={1} width={6} height={4} rx={1} fill={C.ink} /></svg></div>; })()}
      {busted && <AbsoluteFill style={{ background: C.red, opacity: 0.35 * (1 - pr(t, LE(15) + 0.05, LE(15) + 0.6)) }} />}
      {busted && <Stamp t={t} t0={LE(15) + 0.15} text="ERWISCHT" x={540} y={420} size={100} rot={-8} />}
    </AbsoluteFill>);
  } },
  /* 13 – caution + story changes */
  { from: LS(16) - 0.15, to: at(193) - 0.15, C: ({ t }) => {
    const diff = spring(t, at(186) - 0.1, 0.4);
    return (<AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}><Tag color={C.orange} size={34}>⚠︎ VORSICHT</Tag></div>
      <Kinetic t={t} from={179} to={186} top={420} size={84} accent={{ einzelnes: C.orange }} out={at(186) - 0.25} />
      <div style={{ position: "absolute", left: SAFE.left + 10, width: SW - 20, top: 420, display: "flex", flexDirection: "column", gap: 22, opacity: diff, transform: `translateY(${(1 - diff) * 60}px)` }}>
        {[["MONTAG", <>„Zuhause. Netflix.“</>], ["MITTWOCH", <>„Ich war <span style={{ background: "rgba(255,59,48,0.14)", color: C.red, padding: "0 10px", borderRadius: 12 }}>bei Tom</span>.“</>]].map(([d, s], i) => (
          <div key={i} style={{ borderRadius: 40, background: "#fff", boxShadow: SHADOW, padding: "28px 36px", fontFamily: SANS, opacity: i ? pr(t, at(189), at(189) + 0.2) : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}><span style={{ width: 54, height: 54, borderRadius: 27, background: C.blue, color: "#fff", fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>M</span><span style={{ fontSize: 28, color: C.grey, fontWeight: 800, letterSpacing: "0.06em" }}>{d as string}</span></div>
            <div style={{ fontSize: 58, fontWeight: 800, marginTop: 10, color: C.ink, letterSpacing: "-0.02em" }}>{s}</div>
          </div>))}
        <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.ink, marginTop: 14, opacity: pr(t, at(191), at(191) + 0.2) }}>Geschichte <span style={{ color: C.red }}>verändert</span> 🚩</div>
      </div>
    </AbsoluteFill>);
  } },
  /* 14 – CTA */
  { from: at(193) - 0.15, to: 999, C: ({ t }) => (<AbsoluteFill>
    <Kinetic t={t} from={193} to={197} top={420} size={70} color={C.grey} />
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 140, letterSpacing: "-0.055em", lineHeight: 0.95, color: C.ink,
      transform: `scale(${0.8 + 0.2 * spring(t, at(197) - 0.1, 0.4)})`, opacity: pr(t, at(197) - 0.15, at(197) + 0.1) }}>Wen testest<br /><span style={{ color: C.blue }}>du</span> zuerst?</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontSize: 140, transform: `translateY(${Math.abs(Math.sin(t * 5)) * 26}px)`, opacity: pr(t, at(199), at(199) + 0.2) }}>👇</div>
  </AbsoluteFill>) },
];

const FREEZES = [at(70) - 0.08, at(115) - 0.08, LS(14) - 0.08];
const TITLES = [3, 7, 11].map(LS);

export const Luege2: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const sfx: [number, string, number][] = [
    [0, "whoosh", 0.5], [LS(0) - 0.12, "pop", 0.5], [LS(1) - 0.12, "pop", 0.5],
    [at(9) - 0.05, "impact", 0.7], [at(9), "heart", 0.8], [at(13) - 0.6, "riser", 0.5], [at(18) - 0.05, "error", 0.7], [at(18) - 0.05, "glitch", 0.5],
    [at(37), "tick", 0.3], [at(40), "ding", 0.45], [at(42) - 0.2, "coin", 0.7], ...[0, 1, 2].map((i) => [at(46) + i * 0.16, "impact", 0.4] as [number, string, number]),
    ...TITLES.flatMap((s) => [[s - 1.4, "riser", 0.55], [s - 0.05, "impact", 0.9], [s - 0.05, "drop", 0.7]] as [number, string, number][]),
    [LS(4) - 0.12, "pop", 0.5], [LS(5) - 0.12, "pop", 0.5], [LS(5) + 0.4, "heart", 0.5],
    ...FREEZES.flatMap((s) => [[s, "scratch", 0.75], [s + 0.02, "shutter", 0.5]] as [number, string, number][]),
    [at(72) - 0.05, "error", 0.55], [at(74) - 0.1, "send", 0.4], [at(80) - 0.1, "error", 0.35],
    [LS(8) - 0.12, "pop", 0.5], [LS(9) - 0.12, "pop", 0.5], [at(108) - 0.05, "glitch", 0.6], [at(113), "glitch", 0.6],
    [at(124), "rewind", 0.7], [at(129), "impact", 0.45], [at(129), "glitch", 0.4],
    [LS(12) - 0.12, "pop", 0.5], [LS(13) - 0.12, "pop", 0.5], [LS(13), "tick", 0.45], [at(156) - 0.05, "error", 0.4],
    [LS(15) - 0.12, "pop", 0.5], [at(169) - 0.15, "buzz", 0.7], [at(169) - 0.1, "msg", 0.5],
    [LE(15) + 0.05, "drop", 0.95], [LE(15) + 0.05, "impact", 0.85], [LE(15) + 0.15, "gasp", 0.5], [LE(15) + 0.3, "heart", 0.6],
    [LS(16) - 0.1, "impact", 0.35], [at(189), "error", 0.35], [at(197) - 0.1, "ding", 0.5],
    [L2_OUTRO_T0, "pop", 0.5], [L2_OUTRO_T0 + 0.85, "pop", 0.5], [L2_OUTRO_T0 + 1.5, "ding", 0.35],
  ];
  const bedVol = (f: number) => { const s = f / fps; if (TITLES.some((x) => s > x - 0.35 && s < x + 0.25)) return 0; if (FREEZES.some((x) => s > x && s < x + 1.2)) return 0.03; if (s > LE(15) - 0.2 && s < LS(16)) return 0; return s > L2_OUTRO_T0 ? 0.08 : 0.12; };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 15% 10%, #e7efff, transparent 70%), radial-gradient(45% 35% at 90% 85%, #f3e8ff, transparent 70%)" }} />
      <Audio src={staticFile("luege2/voice.mp3")} />
      <Audio src={staticFile("luege2/bed.mp3")} loop volume={bedVol} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={fr(s)}><Audio src={staticFile(`luege2/${n}.mp3`)} volume={v} /></Sequence>)}
      {SCENES.slice(1).filter((s) => !TITLES.some((x) => Math.abs(x - s.from) < 0.2)).map((s, i) => <Sequence key={"sw" + i} from={fr(s.from - 0.1)}><Audio src={staticFile("luege2/whoosh.mp3")} volume={0.4} /></Sequence>)}

      {SCENES.map((s, i) => {
        if (t < s.from - 0.01 || t >= s.to + 0.25) return null;
        const inn = i === 0 ? 1 : eo(pr(t, s.from, s.from + 0.28)), out = pr(t, s.to, s.to + 0.25);
        return <AbsoluteFill key={i} style={{ opacity: inn * (1 - out), transform: `scale(${lerp(1.1, 1, inn) * lerp(1, 0.9, out)})`, filter: inn < 1 || out > 0 ? `blur(${(1 - inn) * 18 + out * 18}px)` : undefined }}><s.C t={t} /></AbsoluteFill>;
      })}

      {t < L2_OUTRO_T0 && <NarrCaptions t={t} />}
      <div style={{ position: "absolute", left: SAFE.left + 40, width: SW - 80, top: SAFE.top + 10, height: 10, borderRadius: 5, background: "rgba(0,0,0,0.08)", opacity: 1 - pr(t, L2_OUTRO_T0 - 0.3, L2_OUTRO_T0) }}>
        <div style={{ width: `${cl(t / L2_OUTRO_T0) * 100}%`, height: "100%", borderRadius: 5, background: C.blue }} />
      </div>
      <OutroCompact t={t} t0={L2_OUTRO_T0} light line="Mehr Psycho-Tricks? Folg mir." />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(0,0,0,0.3)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

export const Luege2Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 15% 10%, #e7efff, transparent 70%), radial-gradient(45% 35% at 90% 85%, #f3e8ff, transparent 70%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontWeight: 900, fontSize: 150, letterSpacing: "-0.055em", lineHeight: 0.92, color: C.ink }}>Lügt er<br /><span style={{ color: C.red }}>gerade?</span></div>
    <div style={{ position: "absolute", left: 340, top: 700, transform: "scale(1.35)", transformOrigin: "top center" }}><Person who="max" t={1.3} mood="nervous" look={-1} sweat={1} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center" }}><span style={{ display: "inline-block", padding: "18px 36px", borderRadius: 30, background: C.ink, color: "#fff", fontWeight: 900, fontSize: 64 }}>3 Tricks, die <span style={{ color: "#ffd60a" }}>wirklich</span> helfen</span></div>
  </AbsoluteFill>
);
