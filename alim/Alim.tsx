// „alim“ – Apple-style dark-mode lyric video, 1920×1080 @ 60 fps. Own motion graphics, no logos, no people.
import React from "react";
import { AbsoluteFill, Audio, random, staticFile } from "remotion";
import lyricsJson from "./lyrics/lyrics.json";
import { SANS, cl, pr, eo, lerp, spring, useT, Grain } from "../viral/shared/StoryKit";

type Wd = { w: string; s: number; e: number };
type Ln = { line: number; text: string; start: number; end: number; words: Wd[] };
const LY = lyricsJson as Ln[];
const LS = (i: number) => LY[i].start, WS = (i: number, j: number) => LY[i].words[j].s;
export const ALIM_S = 27.4;

const INK = "#f5f5f7", GREY = "#8e8e93";
const GRAD = "linear-gradient(90deg,#5e5ce6,#0a84ff 35%,#30d158 70%,#ffd60a)";
const RAINBOW = "linear-gradient(90deg,#ff375f,#ff9f0a,#ffd60a,#30d158,#0a84ff,#bf5af2)";
const eio = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const glass: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" };
const hitShake = (t: number, hits: number[], amp = 16) => hits.reduce((acc, h) => { const k = t >= h ? Math.exp(-(t - h) * 9) : 0; return [acc[0] + Math.sin(t * 97 + h) * amp * k, acc[1] + Math.cos(t * 83 + h) * amp * k]; }, [0, 0]);

/* ───────── lyric line: words appear exactly when sung (0.1 s lead-in), grey → white/accent ───────── */
type Acc = { color?: string; grad?: string };
const key = (w: string) => w.replace(/[^\p{L}\d'-]/gu, "").toLowerCase();
const Lyric: React.FC<{ t: number; i: number; x?: number; y?: number; size?: number; maxW?: number; acc?: Record<string, Acc>; mono?: number }> = ({ t, i, x = 128, y = 420, size: size0 = 104, maxW = 820, acc = {}, mono = 0 }) => {
  let size = size0;
  const next = i + 1 < LY.length ? LS(i + 1) : LY[i].end + 0.35;
  const o = pr(t, next - 0.06, next + 0.22);
  const longest = Math.max(...LY[i].words.map((w) => w.w.length)); if (longest > 11) size = Math.min(size, Math.floor(820 / (longest * 0.6)));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: maxW, display: "flex", flexWrap: "wrap", columnGap: size * 0.24, rowGap: 0, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1.04,
      opacity: 1 - o, filter: o ? `blur(${o * 16}px)` : undefined, transform: `translateY(${-o * 26}px)` }}>
      {LY[i].words.map((w, j) => {
        const k = eo(pr(t, w.s - 0.1, w.s + 0.08)); if (k <= 0) return null;
        const sung = pr(t, w.s - 0.02, w.s + 0.2); const a = acc[key(w.w)];
        const fin = a?.color ?? INK;
        const base: React.CSSProperties = { display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 26}px) scale(${0.96 + 0.04 * k})`, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined };
        if (a?.grad && sung > 0.5) return <span key={j} style={{ ...base, background: a.grad, WebkitBackgroundClip: "text", color: "transparent", filter: mono ? `grayscale(${mono})` : base.filter }}>{w.w}</span>;
        return <span key={j} style={{ ...base, color: sung < 1 ? mixc(GREY, fin, sung) : fin, filter: mono ? `grayscale(${mono})` : base.filter }}>{w.w}</span>;
      })}
    </div>
  );
};
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`; };

/* ───────── visuals (right side, centre ≈ 1380/520) ───────── */
const CXV = 1390, CYV = 520;

// 0 · Fäuste, Tritte so wie Ong-Bak – glass slab cracks with every hit
const HITS0 = () => [WS(0, 0), WS(0, 1), WS(0, 4)];
const crack = (seed: number, cx: number, cy: number) => Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5; let x = cx, y = cy; const pts = [`${x},${y}`];
  for (let s = 0; s < 4; s++) { const L = 40 + random(`${seed}l${i}${s}`) * 70; x += Math.cos(a + (random(`${seed}j${i}${s}`) - 0.5) * 0.8) * L; y += Math.sin(a + (random(`${seed}k${i}${s}`) - 0.5) * 0.8) * L; pts.push(`${x},${y}`); }
  return pts.join(" ");
});
const S0: React.FC<{ t: number }> = ({ t }) => {
  const hits = HITS0(); const pts = [[300, 260], [170, 430], [380, 520]];
  const [dx, dy] = hitShake(t, hits, 22); const k = eo(pr(t, 0.05, 0.7));
  return (<>
    <div style={{ position: "absolute", left: CXV - 290, top: CYV - 360, width: 580, height: 720, borderRadius: 44, ...glass, transform: `translate(${dx}px,${dy}px) perspective(1600px) rotateY(${lerp(-24, -12, k)}deg) rotateX(6deg) scale(${lerp(0.85, 1, k)})`, opacity: k, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 30% 20%, rgba(255,255,255,0.10), transparent 60%)" }} />
      <svg width={580} height={720} style={{ position: "absolute", inset: 0 }}>
        {hits.map((h, i) => { const d = eo(pr(t, h, h + 0.18)); if (d <= 0) return null; const [cx, cy] = pts[i]; return (
          <g key={i}>{crack(i + 1, cx, cy).map((p, j) => <polyline key={j} points={p} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2.2 - j * 0.12} strokeDasharray={600} strokeDashoffset={600 * (1 - d)} />)}
            <circle cx={cx} cy={cy} r={10} fill="#fff" opacity={1 - pr(t, h, h + 0.3)} /></g>); })}
      </svg>
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {hits.map((h, i) => { const r = pr(t, h, h + 0.6); if (r <= 0 || r >= 1) return null; return <circle key={i} cx={CXV - 290 + pts[i][0] + dx} cy={CYV - 360 + pts[i][1] + dy} r={30 + eo(r) * 420} fill="none" stroke={i === 2 ? "#ff375f" : "#fff"} strokeWidth={6 * (1 - r)} opacity={1 - r} />; })}
    </svg>
    {hits.map((h, i) => <AbsoluteFill key={i} style={{ background: i === 2 ? "#ff375f" : "#fff", opacity: 0.16 * (1 - pr(t, h, h + 0.15)) * (t >= h ? 1 : 0), mixBlendMode: "screen" }} />)}
  </>);
};

// 1 · Zivis fahnden, Bruder, normal – radar over a street grid, blue/red light
const S1: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(1); const k = eo(pr(t, a - 0.3, a + 0.4)); const lock = spring(t, WS(1, 3), 0.4); const R = 330;
  const streets = Array.from({ length: 14 }, (_, i) => i);
  return (<>
    <AbsoluteFill style={{ background: `radial-gradient(40% 45% at 100% 0%, rgba(10,132,255,${0.35 * (0.5 + 0.5 * Math.sin(t * 14))}), transparent 70%), radial-gradient(40% 45% at 100% 100%, rgba(255,55,95,${0.3 * (0.5 - 0.5 * Math.sin(t * 14))}), transparent 70%)`, opacity: k }} />
    <div style={{ position: "absolute", left: CXV - R, top: CYV - R, width: R * 2, height: R * 2, borderRadius: "50%", overflow: "hidden", ...glass, transform: `scale(${lerp(0.8, 1, k)})`, opacity: k }}>
      <svg width={R * 2} height={R * 2}>
        {streets.map((i) => <line key={`h${i}`} x1={0} y1={i * 52 + 14} x2={R * 2} y2={i * 52 + 30 * Math.sin(i)} stroke="rgba(255,255,255,0.09)" strokeWidth={i % 4 ? 2 : 6} />)}
        {streets.map((i) => <line key={`v${i}`} x1={i * 52 - 20} y1={0} x2={i * 52 + 20 * Math.cos(i)} y2={R * 2} stroke="rgba(255,255,255,0.09)" strokeWidth={i % 5 ? 2 : 6} />)}
        {[1, 2, 3].map((r) => <circle key={r} cx={R} cy={R} r={(R / 3.2) * r} fill="none" stroke="rgba(100,210,255,0.25)" strokeWidth={1.5} />)}
        <line x1={R} y1={0} x2={R} y2={R * 2} stroke="rgba(100,210,255,0.15)" /><line x1={0} y1={R} x2={R * 2} y2={R} stroke="rgba(100,210,255,0.15)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(100,210,255,0.45), transparent 22%)", transform: `rotate(${(t - a) * 300}deg)`, borderRadius: "50%" }} />
      {[[0.3, 0.35, WS(1, 1)], [0.7, 0.6, WS(1, 2)], [0.62, 0.3, WS(1, 3)]].map(([px, py, ts], i) => { const b = pr(t, ts as number, (ts as number) + 0.2); return <div key={i} style={{ position: "absolute", left: (px as number) * R * 2 - 9, top: (py as number) * R * 2 - 9, width: 18, height: 18, borderRadius: 9, background: i === 2 ? "#ff375f" : "#64d2ff", opacity: b, boxShadow: `0 0 24px ${i === 2 ? "#ff375f" : "#64d2ff"}` }} />; })}
      {lock > 0.01 && <div style={{ position: "absolute", left: 0.62 * R * 2 - 46, top: 0.3 * R * 2 - 46, width: 92, height: 92, borderRadius: 46, border: "3px solid #ff375f", transform: `scale(${lerp(2.2, 1, cl(lock))})`, opacity: cl(lock * 2) }} />}
    </div>
  </>);
};

// 2 · Mach' schlau auf Motorola – generic flip phone opens in 3D (no logo)
const S2: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(2); const k = eo(pr(t, a - 0.12, a + 0.35)); const open = eio(pr(t, WS(2, 0), WS(2, 1) + 0.2)); const glow = pr(t, WS(2, 3) - 0.1, WS(2, 3) + 0.25);
  return (
    <div style={{ position: "absolute", left: CXV - 170, top: CYV - 40, width: 340, height: 420, perspective: 1800, transform: `translateY(${(1 - k) * 120}px) rotateZ(${lerp(-8, -4, open)}deg)`, opacity: k }}>
      {/* bottom half (keypad) */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "linear-gradient(160deg,#3a3a40,#16161a)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 50px 120px rgba(0,0,0,0.6)", padding: "48px 40px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ height: 46, borderRadius: 14, background: "rgba(255,255,255,0.08)", boxShadow: glow ? `0 0 ${18 * glow}px rgba(100,210,255,${0.5 * glow})` : undefined }} />)}
      </div>
      {/* top half (screen), hinged at the top edge of the keypad */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 340, height: 420, transformOrigin: "50% 0%", transform: `rotateX(${lerp(-178, -8, open)}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: 0, transform: "translateY(-100%)", transformOrigin: "50% 100%", borderRadius: 40, background: "linear-gradient(200deg,#45454c,#1c1c21)", border: "1px solid rgba(255,255,255,0.14)", padding: 26, boxSizing: "border-box" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 24, background: `radial-gradient(80% 70% at 50% 30%, rgba(100,210,255,${0.25 + 0.5 * glow}), #05070c 75%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, color: INK, gap: 14 }}>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.04em", opacity: 0.35 + 0.65 * open }}>04:30</div>
            <div style={{ padding: "10px 18px", borderRadius: 16, background: "rgba(255,255,255,0.14)", fontSize: 22, fontWeight: 700, opacity: glow, transform: `translateY(${(1 - glow) * 14}px)` }}>1 neue Nachricht</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3 · Big Stacks heißt, wir kommen voran – bill stacks grow like a chart, arrow climbs
const S3: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(3); const k = eo(pr(t, a - 0.3, a + 0.3)); const heights = [3, 5, 7, 10, 14]; const arrow = eo(pr(t, WS(3, 5) - 0.15, WS(3, 5) + 0.6));
  return (<div style={{ opacity: k }}>
    {heights.map((h, i) => { const g = eo(pr(t, WS(3, 0) + i * 0.09, WS(3, 1) + 0.3 + i * 0.12)); const n = Math.max(1, Math.round(h * g)); const x = CXV - 360 + i * 150, base = CYV + 300;
      return (<div key={i}>{Array.from({ length: n }, (_, j) => (
        <div key={j} style={{ position: "absolute", left: x, top: base - j * 30, width: 128, height: 26, borderRadius: 6, background: "linear-gradient(180deg,#9fd7b0,#4f8f69)", border: "1px solid rgba(255,255,255,0.35)", boxShadow: "0 6px 14px rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", left: 50, top: 0, bottom: 0, width: 26, background: "rgba(255,255,255,0.75)" }} />
        </div>))}</div>);
    })}
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs><linearGradient id="ag" x1="0" x2="1"><stop offset="0" stopColor="#30d158" /><stop offset="1" stopColor="#ffd60a" /></linearGradient></defs>
      <polyline points={`${CXV - 380},${CYV + 250} ${CXV - 200},${CYV + 140} ${CXV - 40},${CYV + 170} ${CXV + 140},${CYV - 20} ${CXV + 330},${CYV - 200}`} fill="none" stroke="url(#ag)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - arrow)} />
      {arrow > 0.92 && <polygon points={`${CXV + 360},${CYV - 228} ${CXV + 300},${CYV - 214} ${CXV + 344},${CYV - 170}`} fill="#ffd60a" />}
    </svg>
  </div>);
};

// 4 · Freiheit, Zelle, Chaye, bonne chance – four glass tiles flip in on their word
const TileIcon: React.FC<{ i: number }> = ({ i }) => {
  if (i === 0) return <svg width={130} height={130} viewBox="0 0 100 100"><rect x={22} y={14} width={56} height={78} rx={6} fill="none" stroke="#fff" strokeWidth={5} /><path d="M50 14 L78 22 L78 84 L50 92 Z" fill="rgba(255,214,10,0.9)" /><rect x={8} y={92} width={84} height={5} rx={2} fill="#fff" /></svg>;
  if (i === 1) return <svg width={130} height={130} viewBox="0 0 100 100"><rect x={14} y={14} width={72} height={72} rx={10} fill="none" stroke="#fff" strokeWidth={5} />{[30, 45, 60, 75].map((x) => <line key={x} x1={x - 3} y1={16} x2={x - 3} y2={84} stroke="#fff" strokeWidth={5} />)}</svg>;
  if (i === 2) return <svg width={130} height={130} viewBox="0 0 100 100"><path d="M32 22 Q30 48 40 58 Q30 72 34 86 L66 86 Q70 72 60 58 Q70 48 68 22 Z" fill="rgba(255,159,10,0.85)" stroke="#fff" strokeWidth={4} /><ellipse cx={50} cy={92} rx={26} ry={5} fill="#fff" />{[0, 1].map((k) => <path key={k} d={`M${44 + k * 10} 14 q-4 -6 0 -10`} stroke="rgba(255,255,255,0.7)" strokeWidth={3} fill="none" />)}</svg>;
  return <svg width={130} height={130} viewBox="0 0 100 100"><rect x={16} y={16} width={68} height={68} rx={16} fill="#fff" />{[[34, 34], [66, 34], [50, 50], [34, 66], [66, 66]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={6.5} fill="#0b0b0c" />)}</svg>;
};
const S4: React.FC<{ t: number }> = ({ t }) => {
  const times = [WS(4, 0), WS(4, 1), WS(4, 2), WS(4, 3)]; const cols = ["#ffd60a", "#8e8e93", "#ff9f0a", "#30d158"];
  return (<>{times.map((ts, i) => { const f = eo(pr(t, ts - 0.12, ts + 0.3)); const x = CXV - 330 + (i % 2) * 340, y = CYV - 330 + Math.floor(i / 2) * 340;
    return (<div key={i} style={{ position: "absolute", left: x, top: y, width: 300, height: 300, borderRadius: 40, ...glass, display: "flex", alignItems: "center", justifyContent: "center", transform: `perspective(1200px) rotateY(${lerp(-100, 0, f)}deg) scale(${lerp(0.8, 1, f)})`, opacity: cl(f * 1.5),
      boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 ${60 * f}px ${cols[i]}33` }}><TileIcon i={i} /></div>); })}</>);
};

// 5 · Banditen bei Sonn'nuntergang – full-bleed sunset, road, tail lights
const S5: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(5); const k = eo(pr(t, a - 0.35, a + 0.3)); const sink = pr(t, a, LS(6)); const hz = 700;
  return (<AbsoluteFill style={{ opacity: k }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1b0f3a 0%,#5b1d5e 34%,#d9466b 52%,#ff9f0a 64%,#2a0f1f 65%,#0b0b0c 100%)" }} />
    <div style={{ position: "absolute", left: 1220, top: lerp(380, 560, sink), width: 340, height: 340, borderRadius: 170, background: "radial-gradient(circle,#fff3c4,#ffb340 55%,#ff6a2a)", boxShadow: "0 0 160px rgba(255,170,60,0.8)", clipPath: `inset(0 0 ${Math.max(0, lerp(380, 560, sink) + 340 - hz)}px 0)` }} />
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <polygon points={`1390,${hz} 1410,${hz} 1900,1080 900,1080`} fill="#121216" />
      {[0, 1, 2, 3, 4, 5].map((i) => { const z = ((t * 1.4 + i / 6) % 1); const y = hz + Math.pow(z, 2.2) * 380; const w = 2 + z * 14; return <rect key={i} x={1400 - w / 2} y={y} width={w} height={6 + z * 30} fill="rgba(255,255,255,0.6)" />; })}
      {[0, 1].map((c) => { const z = 1 - ((t - a) * 0.45 + c * 0.35) % 1; const y = hz + Math.pow(z, 2) * 360 + 10; const sp = 10 + z * 60; const cx = 1400 + (c ? 1 : -1) * (40 + z * 120);
        return <g key={c} opacity={pr(t, a + c * 0.3, a + c * 0.3 + 0.3)}><circle cx={cx - sp / 2} cy={y} r={3 + z * 7} fill="#ff2d3d" /><circle cx={cx + sp / 2} cy={y} r={3 + z * 7} fill="#ff2d3d" /><ellipse cx={cx} cy={y} rx={sp} ry={6 + z * 10} fill="rgba(255,45,61,0.25)" /></g>; })}
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,11,12,0.75) 0%, rgba(11,11,12,0.2) 45%, transparent 60%)" }} />
  </AbsoluteFill>);
};

// diamond
const Gem: React.FC<{ size: number; rot: number; hue?: number; glow?: number }> = ({ size, rot, hue = 190, glow = 0 }) => {
  const c = Math.cos(rot); const facets = [0, 1, 2, 3, 4, 5];
  return (<svg width={size} height={size} viewBox="-60 -60 120 120" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${10 + glow * 40}px hsla(${hue},100%,70%,${0.4 + glow * 0.5}))` }}>
    <g transform={`scale(${0.35 + 0.65 * Math.abs(c)} 1)`}>
      <polygon points="-48,-14 -28,-38 28,-38 48,-14 0,50" fill={`hsl(${hue},80%,60%)`} />
      {facets.map((i) => { const x0 = -48 + i * 16; const l = 0.5 + 0.5 * Math.sin(rot * 2 + i); return <polygon key={i} points={`${x0},-14 ${x0 + 16},-14 0,50`} fill={`hsla(${hue},90%,${55 + l * 35}%,0.9)`} />; })}
      {[0, 1, 2].map((i) => { const l = 0.5 + 0.5 * Math.cos(rot * 2 + i); return <polygon key={i} points={`${-28 + i * 18.7},-38 ${-9.3 + i * 18.7},-38 ${-18.6 + i * 18.7 + 9},-14`} fill={`hsla(${hue},90%,${65 + l * 30}%,0.95)`} />; })}
      <polygon points="-48,-14 -28,-38 28,-38 48,-14" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
    </g>
  </svg>);
};
const Sparkle: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => <svg width={s} height={s} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, opacity: o }}><path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#fff" /></svg>;

// 6 · Werden heiß, jagen auch die Klunker – rotating diamond, heat glow
const S6: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(6); const k = eo(pr(t, a - 0.08, a + 0.35)); const heat = pr(t, WS(6, 1) - 0.05, WS(6, 1) + 0.4) * (1 - pr(t, WS(6, 5) - 0.2, WS(6, 5) + 0.3)); const spark = pr(t, WS(6, 5) - 0.05, WS(6, 5) + 0.5);
  return (<>
    <AbsoluteFill style={{ background: `radial-gradient(35% 45% at 72% 50%, rgba(255,120,30,${0.45 * heat}), transparent 70%)` }} />
    <div style={{ position: "absolute", left: CXV - 260, top: CYV - 280, transform: `scale(${lerp(0.6, 1, k)}) translateY(${Math.sin(t * 2.4) * 10}px)`, opacity: k }}><Gem size={520} rot={(t - a) * 2.2} hue={lerp(195, 28, heat)} glow={Math.max(spark, heat * 0.8)} /></div>
    {[[-180, -160], [190, -120], [140, 190], [-150, 160], [0, -260]].map(([x, y], i) => { const s = pr(t, WS(6, 5) + i * 0.06, WS(6, 5) + i * 0.06 + 0.15) * (1 - pr(t, WS(6, 5) + 0.5 + i * 0.06, WS(6, 5) + 0.9 + i * 0.06)); return <Sparkle key={i} x={CXV + x} y={CYV + y} s={60 + (i % 2) * 40} o={s} />; })}
  </>);
};

// 7 · (repeat) – gem rain, one gets caught
const S7: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(7); const k = eo(pr(t, a - 0.3, a + 0.3)); const catchK = eo(pr(t, WS(7, 5) - 0.1, WS(7, 5) + 0.35));
  return (<div style={{ opacity: k }}>
    {Array.from({ length: 26 }, (_, i) => { const x = 930 + random(`gx${i}`) * 900; const sp = 520 + random(`gs${i}`) * 520; const y = ((random(`gy${i}`) * 1300 + (t - a) * sp) % 1300) - 140; const s = 40 + random(`gz${i}`) * 70;
      return <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.85 * (1 - catchK * 0.75), filter: `blur(${(sp - 520) / 260}px)` }}><Gem size={s} rot={t * 3 + i} hue={170 + random(`gh${i}`) * 60} /></div>; })}
    {catchK > 0.01 && <div style={{ position: "absolute", left: CXV - 220, top: CYV - 240, transform: `scale(${lerp(0.2, 1, catchK)})`, opacity: catchK }}><Gem size={440} rot={t * 1.5} glow={1 - pr(t, WS(7, 5) + 0.3, WS(7, 5) + 1)} /></div>}
  </div>);
};

// 8 · Alles blau und sie ziel'n auf uns grad – blue wash, reticle locks on
const S8: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(8); const k = eo(pr(t, a - 0.3, a + 0.25)); const lock = eio(pr(t, WS(8, 4) - 0.3, WS(8, 4) + 0.25)); const fire = pr(t, WS(8, 7), WS(8, 7) + 0.25);
  const [dx, dy] = hitShake(t, [WS(8, 7)], 14); const gap = lerp(300, 120, lock);
  return (<>
    <AbsoluteFill style={{ background: `radial-gradient(70% 80% at 70% 50%, rgba(10,132,255,${0.55 + 0.15 * Math.sin(t * 10)}), rgba(5,20,60,0.9) 70%)`, opacity: k * (1 - 0.3 * fire) }} />
    <div style={{ position: "absolute", left: CXV - 300 + dx, top: CYV - 300 + dy, width: 600, height: 600, opacity: k }}>
      <svg width={600} height={600}>
        <circle cx={300} cy={300} r={gap} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={3} />
        <circle cx={300} cy={300} r={gap * 0.4} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
        {[[0, -1], [0, 1], [-1, 0], [1, 0]].map(([x, y], i) => <line key={i} x1={300 + x * (gap + 20)} y1={300 + y * (gap + 20)} x2={300 + x * (gap + 90)} y2={300 + y * (gap + 90)} stroke="#fff" strokeWidth={3} />)}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => { const c = 300 + 0; const d = gap + 60; return <path key={i} d={`M${c + sx * d} ${c + sy * (d - 40)} L${c + sx * d} ${c + sy * d} L${c + sx * (d - 40)} ${c + sy * d}`} fill="none" stroke={lock > 0.95 ? "#ff375f" : "#fff"} strokeWidth={5} />; })}
        <circle cx={300} cy={300} r={9} fill="#ff375f" opacity={lock} />
      </svg>
      {lock > 0.95 && <div style={{ position: "absolute", left: 300 + gap + 40, top: 300 - gap - 70, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", color: "#ff375f", opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 12)) }}>ERFASST</div>}
    </div>
    <AbsoluteFill style={{ background: "#fff", opacity: 0.25 * (1 - fire) * (t >= WS(8, 7) ? 1 : 0), mixBlendMode: "screen" }} />
  </>);
};

// 9 · Die Vision fällt in Scherben unter – "VISION" pane cracks then shatters
const SHARDS = (() => { const out: { pts: string; cx: number; cy: number; i: number }[] = []; const cols = 6, rows = 4, W = 640, H = 420;
  const jx = (c: number, r: number) => (c === 0 || c === cols ? 0 : (random(`sx${c}${r}`) - 0.5) * 60), jy = (c: number, r: number) => (r === 0 || r === rows ? 0 : (random(`sy${c}${r}`) - 0.5) * 60);
  const P = (c: number, r: number) => [c * (W / cols) + jx(c, r), r * (H / rows) + jy(c, r)];
  let i = 0; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = P(c, r), b = P(c + 1, r), d = P(c, r + 1), e = P(c + 1, r + 1);
    for (const tri of (random(`d${c}${r}`) > 0.5 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]])) out.push({ pts: tri.map((p) => p.join(",")).join(" "), cx: (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy: (tri[0][1] + tri[1][1] + tri[2][1]) / 3, i: i++ }); }
  return out; })();
const S9: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(9); const k = eo(pr(t, a - 0.3, a + 0.3)); const crackK = eo(pr(t, WS(9, 2) - 0.05, WS(9, 2) + 0.25)); const br = WS(9, 4) - 0.04; const fall = Math.max(0, t - br);
  const W = 640, H = 420, ox = CXV - W / 2, oy = CYV - H / 2;
  return (<>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
      <defs><clipPath id="pane"><rect x={0} y={0} width={W} height={H} rx={36} /></clipPath>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.18)" /><stop offset="1" stopColor="rgba(255,255,255,0.04)" /></linearGradient></defs>
      <defs>{SHARDS.map((sh) => <clipPath key={sh.i} id={`sh${sh.i}`}><polygon points={sh.pts} /></clipPath>)}</defs>
      {SHARDS.map((sh) => { const vx = 120 + sh.cx * 0.9 + random(`vx${sh.i}`) * 260; const vy = -120 - random(`vy${sh.i}`) * 220; const rot = (random(`r${sh.i}`) - 0.5) * 900 * fall;
        const x = vx * fall, y = vy * fall + 1400 * fall * fall;
        return (<g key={sh.i} transform={`translate(${ox + x} ${oy + y}) rotate(${rot} ${sh.cx} ${sh.cy})`} opacity={1 - pr(fall, 0.6, 1.2)}>
          <g clipPath="url(#pane)"><g clipPath={`url(#sh${sh.i})`}>
            <rect x={0} y={0} width={W} height={H} fill="url(#pg)" />
            <text x={W / 2} y={H / 2 + 52} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={150} letterSpacing="-6" fill="#fff">VISION</text>
          </g><polygon points={sh.pts} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={fall > 0 ? 1.5 : 0} /></g>
        </g>); })}
      {fall === 0 && crackK > 0 && crack(9, 330, 200).map((p, j) => <polyline key={j} points={p} transform={`translate(${ox} ${oy})`} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray={600} strokeDashoffset={600 * (1 - crackK)} />)}
    </svg>
    <AbsoluteFill style={{ background: "#fff", opacity: 0.22 * (1 - pr(t, br, br + 0.2)) * (t >= br ? 1 : 0), mixBlendMode: "screen" }} />
  </>);
};

// 10/11 · Vor paar Stunden war noch alles bunter – colour blobs + rewinding clock, then colour drains
const Blobs: React.FC<{ t: number; sat: number }> = ({ t, sat }) => (
  <AbsoluteFill style={{ filter: `blur(70px) saturate(${sat})` }}>
    {["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"].map((c, i) => { const a = i * 1.05 + t * 0.5; return <div key={i} style={{ position: "absolute", left: 1100 + Math.cos(a) * 300 + Math.sin(t * 0.7 + i) * 80, top: 320 + Math.sin(a * 1.3) * 230, width: 420, height: 420, borderRadius: "50%", background: c, opacity: 0.75 }} />; })}
  </AbsoluteFill>
);
const Clock: React.FC<{ t: number; speed: number; mono: number }> = ({ t, speed, mono }) => {
  const ang = -t * speed * 360; return (
    <div style={{ position: "absolute", left: CXV - 220, top: CYV - 220, width: 440, height: 440, borderRadius: 220, ...glass, filter: `grayscale(${mono})` }}>
      <svg width={440} height={440} viewBox="-220 -220 440 440">
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-180} x2={0} y2={i % 3 ? -165 : -150} stroke="rgba(255,255,255,0.7)" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={14} x2={0} y2={-110} stroke="#fff" strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang / 12})`} />
        <line x1={0} y1={20} x2={0} y2={-160} stroke="#fff" strokeWidth={6} strokeLinecap="round" transform={`rotate(${ang})`} />
        <circle r={12} fill="#ff9f0a" />
      </svg>
    </div>);
};
const S10: React.FC<{ t: number }> = ({ t }) => { const a = LS(10); const k = eo(pr(t, a - 0.3, a + 0.4)); const boost = pr(t, WS(10, 6) - 0.1, WS(10, 6) + 0.4);
  return (<AbsoluteFill style={{ opacity: k }}><Blobs t={t} sat={1 + boost * 0.6} /><Clock t={t - a} speed={1.2 + boost} mono={0} /></AbsoluteFill>); };
const S11: React.FC<{ t: number }> = ({ t }) => { const a = LS(11); const drain = eio(pr(t, a, WS(11, 6) + 0.6));
  return (<AbsoluteFill><Blobs t={t} sat={1 - drain} /><AbsoluteFill style={{ background: `rgba(11,11,12,${0.45 * drain})` }} /><Clock t={(t - a) * (1 - drain * 0.8)} speed={1.4} mono={drain} /></AbsoluteFill>); };

/* ───────── master ───────── */
const SC: { C: React.FC<{ t: number }>; acc: Record<string, Acc>; lyricY?: number }[] = [
  { C: S0, acc: { "ong-bak": { color: "#ff375f" } } },
  { C: S1, acc: { zivis: { color: "#64d2ff" }, normal: { color: "#ff375f" } } },
  { C: S2, acc: { motorola: { color: "#64d2ff" } } },
  { C: S3, acc: { big: { grad: "linear-gradient(90deg,#30d158,#ffd60a)" }, stacks: { grad: "linear-gradient(90deg,#30d158,#ffd60a)" }, voran: { color: "#ffd60a" } } },
  { C: S4, acc: { freiheit: { color: "#ffd60a" }, chaye: { color: "#ff9f0a" }, bonne: { color: "#30d158" }, chance: { color: "#30d158" } } },
  { C: S5, acc: { "sonn'nuntergang": { grad: "linear-gradient(90deg,#ff9f0a,#ff375f)" } } },
  { C: S6, acc: { heiß: { color: "#ff9f0a" }, klunker: { grad: "linear-gradient(90deg,#64d2ff,#bf5af2)" } } },
  { C: S7, acc: { klunker: { grad: "linear-gradient(90deg,#64d2ff,#bf5af2)" } } },
  { C: S8, acc: { blau: { color: "#64d2ff" }, "ziel'n": { color: "#ff375f" } } },
  { C: S9, acc: { vision: { color: "#ffffff" }, scherben: { grad: "linear-gradient(90deg,#ffffff,#8e8e93)" } } },
  { C: S10, acc: { bunter: { grad: RAINBOW } } },
  { C: S11, acc: { bunter: { grad: RAINBOW } } },
];

export const Alim: React.FC = () => {
  const t = useT(); const end = LY[11].end;
  const endK = pr(t, end + 0.3, end + 1.0);
  return (
    <AbsoluteFill style={{ background: "#0b0b0c", overflow: "hidden" }}>
      <Audio src={staticFile("alim.mp3")} />
      {/* shared background glow */}
      <AbsoluteFill style={{ background: `radial-gradient(45% 55% at 72% 48%, rgba(94,92,230,${0.18 + 0.06 * Math.sin(t * 1.3)}), transparent 70%), radial-gradient(35% 40% at 10% 90%, rgba(10,132,255,0.08), transparent 70%)` }} />
      {/* intro: thin light line before the first word */}
      {t < LS(0) + 0.2 && <div style={{ position: "absolute", left: 128, top: 540, height: 2, width: 820 * eo(pr(t, 0, LS(0))), background: "linear-gradient(90deg,rgba(255,255,255,0.8),transparent)", opacity: 1 - pr(t, LS(0) - 0.1, LS(0) + 0.2) }} />}
      {SC.map((s, i) => {
        const a = i === 0 ? -1 : LS(i) - 0.38, b = i === 11 ? 99 : LS(i + 1) + 0.32;
        if (t < a || t >= b) return null;
        const inn = i === 0 ? 1 : eo(pr(t, a, a + 0.38)), out = i === 11 ? endK : pr(t, LS(i + 1) - 0.02, b);
        return (<AbsoluteFill key={i} style={{ opacity: inn * (1 - out), filter: inn < 1 || out > 0 ? `blur(${(1 - inn) * 14 + out * 14}px)` : undefined, transform: `scale(${lerp(1.04, 1, inn) * lerp(1, 0.97, out)})` }}>
          <s.C t={t} />
        </AbsoluteFill>);
      })}
      {/* lyrics (on top of all visuals) */}
      {SC.map((s, i) => { if (t < LS(i) - 0.3 || (i < 11 && t > LS(i + 1) + 0.3)) return null; return <Lyric key={`l${i}`} t={t} i={i} acc={s.acc} mono={i === 11 ? eio(pr(t, LS(11), WS(11, 6) + 0.6)) : 0} />; })}
      {/* end card */}
      {endK > 0 && <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: endK }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: "-0.05em", color: INK, transform: `scale(${lerp(0.94, 1, endK)})` }}>visualx<span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>.mp4</span></div>
      </AbsoluteFill>}
      <Grain />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      {/* watermark bottom-left */}
      <div style={{ position: "absolute", left: 44, bottom: 34, fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: "0.01em", color: "rgba(255,255,255,0.42)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>@visualx.mp4</div>
    </AbsoluteFill>
  );
};
