// „24 Stunden wach“ – modern explainer short for a young audience. Original character „Leo“. 1080×1920 @ 30 fps.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { SANS, Wd, cl, pr, sm, eo, lerp, spring, useT, SAFE } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
export const WACH_OUTRO_T0 = W[W.length - 1].e + 0.5;
export const WACH_DURATION_S = WACH_OUTRO_T0 + 8.2;
const CX = (SAFE.left + SAFE.right) / 2;

/* ───────── story state as functions of time ───────── */
const KEYS: [number, number][] = [[0, 8], [at(16), 8], [at(26), 8.3], [at(29) + 0.6, 24], [at(51), 26], [at(72), 27], [at(96), 29], [at(113), 32], [at(146), 32], [at(152), 39], [at(169), 40]];
const hourAt = (t: number) => { if (t <= KEYS[0][0]) return KEYS[0][1]; for (let i = 0; i < KEYS.length - 1; i++) if (t <= KEYS[i + 1][0]) return lerp(KEYS[i][1], KEYS[i + 1][1], sm((t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]))); return KEYS[KEYS.length - 1][1]; };
const awake = (t: number) => Math.min(24, Math.max(0, hourAt(t) - 8));
const sleeping = (t: number) => t > at(149) && t < at(160);
const battery = (t: number) => (sleeping(t) || t >= at(160) ? lerp(3, 100, eo(pr(t, at(150), at(159)))) : Math.max(3, 100 - awake(t) * 4.1));
const tiredOf = (t: number) => cl(awake(t) / 24);

/* sky colours by clock hour */
const SKY: [number, string, string][] = [[8, "#7cc6ff", "#ffd7a8"], [16, "#ffb38a", "#ff7eb3"], [24, "#3b2a8a", "#14104a"], [29, "#1d1857", "#0b0a2e"], [31, "#ff9a6b", "#6a5acd"], [32, "#ffcf8a", "#8ec5ff"], [40, "#9fe0ff", "#fff1c9"]];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixC = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * cl(k))).join(",")})`; };
const sky = (h: number) => { let i = 0; while (i < SKY.length - 2 && h > SKY[i + 1][0]) i++; const k = (h - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]); return [mixC(SKY[i][1], SKY[i + 1][1], k), mixC(SKY[i][2], SKY[i + 1][2], k)]; };

/* ───────── LEO – original character ───────── */
const Leo: React.FC<{ t: number; tired: number; asleep?: number; mouth?: "smile" | "o" | "yawn" | "flat" | "grin"; look?: number }> = ({ t, tired, asleep = 0, mouth = "smile", look = 0 }) => {
  const lid = Math.max(tired * 0.55, asleep);                  // 0 open … 1 closed
  const blink = Math.sin(t * 2.3) > 0.985 ? 1 : 0;
  const L = Math.min(1, lid + blink * (1 - lid));
  const slump = tired * 22 + asleep * 30, tilt = Math.sin(t * 1.3) * 2 + tired * 6 + asleep * 10;
  const breathe = Math.sin(t * (asleep ? 1.6 : 2.4)) * 4;
  return (
    <svg width={620} height={720} viewBox="-310 -360 620 720" style={{ overflow: "visible" }}>
      <ellipse cx={0} cy={350} rx={210} ry={22} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0 ${slump + breathe}) rotate(${tilt})`}>
        {/* hoodie body */}
        <path d="M-190 360 C-190 190 -120 130 0 130 C120 130 190 190 190 360 Z" fill="#20c4a8" />
        <path d="M-60 140 Q0 200 60 140" stroke="#17a08a" strokeWidth={10} fill="none" />
        <line x1={-24} y1={175} x2={-30} y2={250} stroke="#f5f5f5" strokeWidth={7} strokeLinecap="round" /><line x1={24} y1={175} x2={30} y2={250} stroke="#f5f5f5" strokeWidth={7} strokeLinecap="round" />
        <rect x={-70} y={260} width={140} height={60} rx={20} fill="#17a08a" />
        {/* head */}
        <g transform={`translate(${look * 10} 0)`}>
          <ellipse cx={0} cy={-20} rx={150} ry={160} fill="#ffcfa3" />
          <ellipse cx={-148} cy={-10} rx={22} ry={34} fill="#f2b98a" /><ellipse cx={148} cy={-10} rx={22} ry={34} fill="#f2b98a" />
          {/* hair (messier when tired) */}
          <path d={`M-150 -60 C-160 -170 -60 -210 0 -200 C 80 -215 170 -160 150 -60 C 120 -120 ${60 + tired * 30} -${110 - tired * 20} 0 -110 C -60 -${120 + tired * 15} -120 -110 -150 -60Z`} fill="#3b2a20" />
          <path d={`M10 -200 C 20 -${240 + tired * 30} 60 -${245 + tired * 20} 70 -${225 + tired * 25}`} stroke="#3b2a20" strokeWidth={18} strokeLinecap="round" fill="none" />
          {/* eyes */}
          {[-58, 58].map((x, i) => (
            <g key={i}>
              {tired > 0.35 && <path d={`M${x - 40} 16 Q${x} ${36 + tired * 10} ${x + 40} 16`} stroke={`rgba(150,90,140,${(tired - 0.35) * 1.2})`} strokeWidth={8} fill="none" />}
              <ellipse cx={x} cy={-20} rx={38} ry={44} fill="#fff" />
              <circle cx={x + look * 8} cy={-14} r={20} fill="#2a1d16" /><circle cx={x + 7 + look * 8} cy={-22} r={7} fill="#fff" />
              {/* eyelid */}
              <rect x={x - 42} y={-66} width={84} height={92 * L} fill="#ffcfa3" />
              <path d={`M${x - 42} ${-66 + 92 * L} Q${x} ${-60 + 92 * L + 8} ${x + 42} ${-66 + 92 * L}`} stroke="#3b2a20" strokeWidth={6} fill="none" />
              {/* brows */}
              <path d={`M${x - 36} ${-86 + tired * 10} Q${x} ${-100 + tired * 14 + (i ? -tired * 6 : tired * 6)} ${x + 36} ${-86 + tired * 10}`} stroke="#3b2a20" strokeWidth={10} strokeLinecap="round" fill="none" />
            </g>
          ))}
          {/* mouth */}
          {asleep > 0.6 ? <path d="M-20 70 Q0 78 20 70" stroke="#7a3b2a" strokeWidth={8} strokeLinecap="round" fill="none" />
            : mouth === "o" ? <ellipse cx={0} cy={78} rx={26} ry={30} fill="#7a3b2a" />
            : mouth === "yawn" ? <ellipse cx={0} cy={84} rx={40} ry={48 + Math.sin(t * 3) * 6} fill="#7a3b2a" />
            : mouth === "flat" ? <path d="M-34 74 L34 78" stroke="#7a3b2a" strokeWidth={9} strokeLinecap="round" />
            : mouth === "grin" ? <path d="M-60 54 Q0 120 60 54 Z" fill="#7a3b2a" />
            : <path d="M-46 60 Q0 104 46 60" stroke="#7a3b2a" strokeWidth={10} strokeLinecap="round" fill="none" />}
          {/* cheeks */}
          <ellipse cx={-98} cy={40} rx={22} ry={12} fill="rgba(255,120,120,0.35)" /><ellipse cx={98} cy={40} rx={22} ry={12} fill="rgba(255,120,120,0.35)" />
        </g>
      </g>
    </svg>
  );
};

/* ───────── props & stickers ───────── */
const Sticker: React.FC<{ t: number; t0: number; x: number; y: number; rot?: number; children: React.ReactNode; out?: number }> = ({ t, t0, x, y, rot = -6, children, out }) => {
  const k = spring(t, t0, 0.4); const o = out !== undefined ? pr(t, out, out + 0.25) : 0;
  if (k <= 0.001 || o >= 1) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k * (1 - o)}) rotate(${rot}deg)`, filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.25))" }}>{children}</div>;
};
const Pill: React.FC<{ bg: string; fg?: string; size?: number; children: React.ReactNode }> = ({ bg, fg = "#fff", size = 54, children }) => (
  <div style={{ padding: `${size * 0.28}px ${size * 0.55}px`, borderRadius: size, background: bg, color: fg, fontFamily: SANS, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", border: "5px solid #fff" }}>{children}</div>
);
const Battery: React.FC<{ v: number; t: number; charging?: boolean }> = ({ v, t, charging }) => {
  const col = v > 50 ? "#34c759" : v > 20 ? "#ffcc00" : "#ff3b30";
  const blink = v <= 10 && !charging ? (Math.sin(t * 10) > 0 ? 1 : 0.3) : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 900, fontSize: 46, color: "#fff", opacity: blink }}>
      <div style={{ position: "relative", width: 120, height: 56, borderRadius: 14, border: "5px solid #fff", padding: 5, boxSizing: "border-box" }}>
        <div style={{ width: `${v}%`, height: "100%", borderRadius: 7, background: col }} />
        <div style={{ position: "absolute", right: -16, top: 14, width: 9, height: 20, borderRadius: 3, background: "#fff" }} />
        {charging && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>⚡</div>}
      </div>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(v)}%</span>
    </div>
  );
};

/* ───────── modern captions: 1–3 words, thick outline, keyword pops ───────── */
const KEY = new Set(["körper", "leo", "akku", "mitternacht", "adenosin", "hunger", "gemüse", "chips", "pizza", "schokolade", "hunger-hormone", "neunzehn", "langsam", "promille", "sekundenschlaf", "gehirn", "vierundzwanzig", "speichern", "schlaf", "cheatcode", "wach"]);
const CH = (() => { const out: number[][] = []; let cur: number[] = []; W.forEach((w, i) => { cur.push(i); if (/[.,:?!]$/.test(w.w) || cur.length >= 3 || w.w.length > 11) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
const Caps: React.FC<{ t: number }> = ({ t }) => {
  const ci = CH.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === CH.length - 1 || t < W[CH[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  const c = CH[ci];
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1170, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0 20px", fontFamily: SANS, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
      {c.map((i) => { const w = W[i]; const key = KEY.has(w.w.replace(/[^\p{L}-]/gu, "").toLowerCase()); const k = spring(t, w.s - 0.04, 0.28); const on = t >= w.s - 0.04;
        return <span key={i} style={{ fontSize: key ? 98 : 80, color: key ? "#ffe14d" : "#fff", WebkitTextStroke: "10px #111", paintOrder: "stroke fill", opacity: on ? 1 : 0, transform: `scale(${on ? 0.7 + 0.3 * k : 0.7}) rotate(${key ? -3 : 0}deg)`, display: "inline-block" }}>{w.w}</span>; })}
    </div>
  );
};

/* ───────── scene helpers ───────── */
const punchTimes = [at(7), at(15), at(23), at(29), at(43), at(56), at(62), at(77), at(92), at(100), at(115), at(127), at(140), at(168)];
const punch = (t: number) => punchTimes.reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 7) * 0.07 : 0), 0);
const black = (t: number) => (t > at(100) && t < at(100) + 0.22) || (t > at(104) && t < at(104) + 0.3) ? 1 : 0;

export const Wach: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const h = hourAt(t), [s1, s2] = sky(h);
  const tired = tiredOf(t) * (t >= at(160) ? 0 : 1);
  const asleep = sleeping(t) ? sm(pr(t, at(149), at(150))) * (1 - pr(t, at(158), at(159.5 > 0 ? 159 : 159))) : 0;
  const hh = Math.floor(h % 24), mm = Math.floor((h % 1) * 60);
  const night = h > 20 && h < 31;
  const mouth: "smile" | "o" | "yawn" | "flat" | "grin" = t < at(26) ? "smile" : t < at(44) ? "flat" : t < at(51) ? "yawn" : t < at(66) ? "o" : t < at(113) ? "flat" : t < at(146) ? "o" : t >= at(160) ? "grin" : "smile";
  const leoIn = spring(t, at(15) - 0.2, 0.5);
  const sc = 1 + punch(t);
  const shake = (t >= at(100) && t < at(101.0 > 0 ? 101 : 101)) ? Math.sin(t * 90) * 10 : 0;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${s1}, ${s2})` }}>
      {/* audio */}
      <Audio src={staticFile("wach/voice.mp3")} />
      <Audio src={staticFile("wach/beat.mp3")} loop volume={(f) => 0.16 * (1 - 0.6 * pr(f / fps, at(96), at(97)) + 0.6 * pr(f / fps, at(113), at(114)))} />
      {[[at(16) - 0.1, "alarm", 0.55], [at(26), "whoosh", 0.6], [at(29), "boom", 0.6], [at(62) - 0.05, "crunch", 0.8], [at(72), "whoosh", 0.5], [at(100) - 0.1, "snore", 0.7], [at(113), "boom", 0.6], [at(140) - 0.1, "error", 0.7], [at(152), "levelup", 0.7], [at(168), "levelup", 0.5]].map(([s, n, v], i) =>
        <Sequence key={i} from={fr(s as number)}><Audio src={staticFile(`wach/${n}.mp3`)} volume={v as number} /></Sequence>)}
      {[at(15), at(23), at(43), WACH_OUTRO_T0, WACH_OUTRO_T0 + 1.6, WACH_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"p" + i} from={fr(s)}><Audio src={staticFile("wach/pop.mp3")} volume={0.45} /></Sequence>)}

      {/* room: window with sky, desk glow at night */}
      <AbsoluteFill style={{ transform: `scale(${sc}) translateX(${shake}px)`, transformOrigin: `${CX}px 760px` }}>
        <div style={{ position: "absolute", left: 120, top: 430, width: 380, height: 300, borderRadius: 28, background: `linear-gradient(180deg, ${mixC(s1, "#ffffff", night ? 0 : 0.3)}, ${s2})`, border: "14px solid rgba(255,255,255,0.85)", overflow: "hidden" }}>
          {night ? <div style={{ position: "absolute", left: 230, top: 40, width: 70, height: 70, borderRadius: 35, background: "#fff6c9", boxShadow: "0 0 40px #fff6c9" }} /> : <div style={{ position: "absolute", left: 40, top: 160 - Math.min(1, (h - 8) / 2) * 60, width: 90, height: 90, borderRadius: 45, background: "#ffe066", boxShadow: "0 0 50px #ffd23f" }} />}
          <div style={{ position: "absolute", left: 175, top: 0, width: 10, height: 300, background: "rgba(255,255,255,0.85)" }} />
        </div>
        {night && <AbsoluteFill style={{ background: "radial-gradient(40% 30% at 50% 62%, rgba(120,200,255,0.25), transparent 70%)" }} />}
        {/* bed while sleeping */}
        {asleep > 0 && <div style={{ position: "absolute", left: CX - 360, top: 900, width: 720, height: 200, borderRadius: 40, background: "#5b7cfa", opacity: asleep, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} />}
        {/* Leo */}
        <div style={{ position: "absolute", left: CX - 310, top: 470, transform: `translateY(${(1 - leoIn) * 900}px) scale(${0.95 + 0.05 * leoIn})`, opacity: t < at(15) - 0.2 ? 0 : 1 }}>
          <Leo t={t} tired={tired} asleep={asleep} mouth={mouth} look={t > at(61) && t < at(66) ? Math.sin(t * 4) : 0} />
        </div>
        {/* Zzz when asleep */}
        {asleep > 0.5 && [0, 1, 2].map((i) => { const ph = ((t * 0.8 + i / 3) % 1); return <div key={i} style={{ position: "absolute", left: CX + 120 + ph * 80, top: 520 - ph * 200, fontFamily: SANS, fontWeight: 900, fontSize: 60 + i * 10, color: "#fff", opacity: 1 - ph }}>Z</div>; })}

        {/* ── beat stickers ── */}
        <Sticker t={t} t0={at(0)} x={CX} y={640} rot={-3} out={at(15) - 0.3}><div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 110, color: "#fff", WebkitTextStroke: "12px #111", paintOrder: "stroke fill", textAlign: "center", lineHeight: 1 }}>24 h<br />wach? 😵‍💫</div></Sticker>
        <Sticker t={t} t0={at(23)} x={CX + 230} y={540} rot={8} out={at(26)}><Pill bg="#34c759">100% 🔋</Pill></Sticker>
        <Sticker t={t} t0={at(39)} x={CX} y={440} rot={-4} out={at(51) - 0.2}><Pill bg="#8e5cff" size={50}>🧠 Adenosin ↑</Pill></Sticker>
        {t > at(39) && t < at(51) && Array.from({ length: 14 }, (_, i) => { const k = pr(t, at(39) + i * 0.12, at(39) + i * 0.12 + 0.4); return <div key={i} style={{ position: "absolute", left: CX - 120 + (i % 7) * 40, top: 470 + Math.floor(i / 7) * 36, width: 26, height: 26, borderRadius: 13, background: "#b388ff", transform: `scale(${eo(k)})`, boxShadow: "0 0 12px #b388ff" }} />; })}
        <Sticker t={t} t0={at(62)} x={CX - 260} y={560} rot={-12} out={at(66) + 0.4}><div style={{ fontSize: 120 }}>🥔</div></Sticker>
        <Sticker t={t} t0={at(63)} x={CX + 260} y={520} rot={10} out={at(66) + 0.4}><div style={{ fontSize: 120 }}>🍕</div></Sticker>
        <Sticker t={t} t0={at(65)} x={CX + 230} y={760} rot={-8} out={at(66) + 0.4}><div style={{ fontSize: 120 }}>🍫</div></Sticker>
        <Sticker t={t} t0={at(57)} x={CX - 230} y={800} rot={6} out={at(61)}><div style={{ fontSize: 110, position: "relative" }}>🥦<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, color: "#ff3b30", fontWeight: 900, fontFamily: SANS }}>✕</div></div></Sticker>
        {/* hunger hormones */}
        {t > at(69) - 0.2 && t < at(72) - 0.1 && <div style={{ position: "absolute", left: CX - 300, top: 400, width: 600, display: "flex", flexDirection: "column", gap: 14, padding: "22px 26px", borderRadius: 28, background: "rgba(10,10,30,0.6)", border: "4px solid #fff", boxSizing: "border-box" }}>
          {[["Hunger", "#ff7a45", 0.95], ["Satt-Gefühl", "#5b7cfa", 0.2]].map(([l, c, v], i) => { const k = eo(pr(t, at(69) + i * 0.15, at(70) + 0.5)); return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 900, fontSize: 34, color: "#fff" }}><span style={{ width: 200, textAlign: "right" }}>{l as string}</span>
              <div style={{ flex: 1, height: 34, borderRadius: 17, background: "rgba(255,255,255,0.3)", border: "4px solid #fff" }}><div style={{ width: `${(v as number) * 100 * k}%`, height: "100%", borderRadius: 13, background: c as string }} /></div></div>); })}
        </div>}
        {/* reaction gauge */}
        {t > at(80) - 0.2 && t < at(96) - 0.1 && (() => { const v = lerp(0.95, 0.45, eo(pr(t, at(81), at(86)))); const k = spring(t, at(80) - 0.2, 0.4); return (
          <div style={{ position: "absolute", left: CX - 230, top: 350, width: 460, padding: "20px 0 14px", borderRadius: 30, background: "rgba(10,10,30,0.6)", border: "4px solid #fff", transform: `scale(${k})`, textAlign: "center", fontFamily: SANS, fontWeight: 900, color: "#fff" }}>
            <svg width={420} height={230} viewBox="-210 -210 420 230"><path d="M-180 0 A180 180 0 0 1 180 0" stroke="rgba(255,255,255,0.3)" strokeWidth={36} fill="none" strokeLinecap="round" />
              <path d="M-180 0 A180 180 0 0 1 180 0" stroke="#34c759" strokeWidth={36} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${v} 1`} />
              <line x1={0} y1={0} x2={Math.cos(Math.PI * (1 - v)) * 150} y2={-Math.sin(Math.PI * (1 - v)) * 150} stroke="#fff" strokeWidth={12} strokeLinecap="round" /><circle r={18} fill="#fff" /></svg>
            <div style={{ fontSize: 40, marginTop: -6, WebkitTextStroke: "8px #111", paintOrder: "stroke fill" }}>REAKTION</div>
          </div>); })()}
        <Sticker t={t} t0={at(91)} x={CX + 250} y={700} rot={9} out={at(96) - 0.2}><Pill bg="#ff9f0a" size={52}>≈ 0,5 ‰</Pill></Sticker>
        <Sticker t={t} t0={at(126)} x={CX + 240} y={700} rot={-8} out={at(128) + 0.6}><Pill bg="#ff3b30" size={58}>≈ 1 ‰</Pill></Sticker>
        <Sticker t={t} t0={at(99)} x={CX} y={430} rot={-3} out={at(107)}><Pill bg="#111" size={56}>😴 Sekundenschlaf</Pill></Sticker>
        {/* save failed dialog */}
        {t > at(137) && t < at(146) && (() => { const k = spring(t, at(137), 0.4); return (
          <div style={{ position: "absolute", left: CX - 330, top: 400, width: 660, borderRadius: 30, background: "#1b1d2a", border: "6px solid #fff", padding: "34px 36px", boxSizing: "border-box", fontFamily: SANS, color: "#fff", transform: `scale(${k}) rotate(-2deg)`, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 30, opacity: 0.7, fontWeight: 700 }}>🧠 Gehirn.exe</div>
            <div style={{ fontSize: 56, fontWeight: 900, marginTop: 8 }}>Speichern {t > at(140) ? <span style={{ color: "#ff3b30" }}>fehlgeschlagen ❌</span> : <span style={{ opacity: 0.6 }}>…</span>}</div>
            <div style={{ marginTop: 18, height: 26, borderRadius: 13, background: "#2c3044" }}><div style={{ width: `${Math.min(62, pr(t, at(137), at(140)) * 62)}%`, height: "100%", borderRadius: 13, background: t > at(140) ? "#ff3b30" : "#34c759" }} /></div>
          </div>); })()}
        <Sticker t={t} t0={at(147)} x={CX} y={430} rot={3} out={at(152)}><Pill bg="#34c759" size={56}>Die gute Nachricht 👇</Pill></Sticker>
        {/* cheat code banner */}
        {t > at(165) - 0.2 && t < at(169) - 0.1 && (() => { const k = spring(t, at(167), 0.4); return (
          <div style={{ position: "absolute", left: CX - 380, top: 400, width: 760, padding: "26px 0", borderRadius: 24, background: "linear-gradient(90deg,#8e5cff,#ff4fd8)", border: "6px solid #fff", textAlign: "center", fontFamily: SANS, fontWeight: 900, color: "#fff", transform: `scale(${k}) rotate(-3deg)` }}>
            <div style={{ fontSize: 30, letterSpacing: "0.2em", opacity: 0.85 }}>CHEAT AKTIVIERT</div><div style={{ fontSize: 76 }}>😴 SCHLAF</div>
          </div>); })()}
        {/* final question */}
        {t > at(169) - 0.1 && t < WACH_OUTRO_T0 + 0.3 && <Sticker t={t} t0={at(171) - 0.1} x={CX} y={400} rot={-2} out={WACH_OUTRO_T0}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: "#fff", WebkitTextStroke: "12px #111", paintOrder: "stroke fill", textAlign: "center", lineHeight: 1.05 }}>Wie lange warst<br />DU schon wach? 👇</div></Sticker>}
      </AbsoluteFill>

      {/* blackout = microsleep */}
      <AbsoluteFill style={{ background: "#000", opacity: black(t) }} />

      {/* HUD: clock + battery (safe top area) */}
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 10, display: "flex", justifyContent: "center", gap: 26, alignItems: "center", opacity: pr(t, at(16) - 0.3, at(16)) * (1 - pr(t, at(169) - 0.4, at(169) - 0.1)) }}>
        <div style={{ padding: "12px 28px", borderRadius: 40, background: "rgba(0,0,0,0.35)", border: "4px solid #fff", fontFamily: SANS, fontWeight: 900, fontSize: 56, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
          {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
        </div>
        <div style={{ padding: "12px 24px", borderRadius: 40, background: "rgba(0,0,0,0.35)", border: "4px solid #fff" }}><Battery v={battery(t)} t={t} charging={sleeping(t)} /></div>
      </div>
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 110, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 34, color: "#fff", opacity: pr(t, at(26), at(27)) * (1 - pr(t, at(146), at(147))) }}>
        wach seit <span style={{ color: "#ffe14d" }}>{Math.floor(awake(t))} h</span>
      </div>

      {t < WACH_OUTRO_T0 && <Caps t={t} />}
      <Outro t={t} t0={WACH_OUTRO_T0} likeTitle="Hat dir das Video gefallen?" />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.55)", WebkitTextStroke: "5px rgba(0,0,0,0.25)", paintOrder: "stroke fill" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

/* cover */
export const WachCover: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #3b2a8a, #14104a)", fontFamily: SANS }}>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 50% 55%, rgba(120,200,255,0.3), transparent 70%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontWeight: 900, fontSize: 150, color: "#fff", WebkitTextStroke: "14px #111", paintOrder: "stroke fill", lineHeight: 1 }}>24 h<br /><span style={{ color: "#ffe14d" }}>WACH</span></div>
    <div style={{ position: "absolute", left: 230, top: 640 }}><Leo t={0.4} tired={0.95} mouth="o" /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontWeight: 900, fontSize: 70, color: "#fff", WebkitTextStroke: "10px #111", paintOrder: "stroke fill" }}>Das passiert mit dir 😵‍💫</div>
  </AbsoluteFill>
);
