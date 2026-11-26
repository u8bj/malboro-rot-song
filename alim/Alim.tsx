// „alim“ – iOS dark-mode lyric video in the style of „Feuer“: every line told through an own iOS-like interface.
// 1920×1080 @ 60 fps. Own recreation – no Apple assets/logos, no brand logos, no people.
import "@fontsource/instrument-serif/400-italic.css";
import React from "react";
import { AbsoluteFill, Audio, Img, random, staticFile } from "remotion";
import lyricsJson from "./lyrics/lyrics.json";
import { SANS, cl, pr, eo, lerp, spring, useT, Grain } from "../viral/shared/StoryKit";

type Wd = { w: string; s: number; e: number };
type Ln = { line: number; text: string; start: number; end: number; words: Wd[] };
const LY = lyricsJson as Ln[];
const LS = (i: number) => LY[i].start, WS = (i: number, j: number) => LY[i].words[j].s;
export const ALIM_S = 27.4;

const SERIF = '"Instrument Serif", Georgia, serif';
const D = { bg: "#000000", card: "#1c1c1e", card2: "#2c2c2e", card3: "#3a3a3c", sep: "#38383a", ink: "#ffffff", ink2: "#ebebf5", grey: "#8e8e93", grey2: "#48484a",
  blue: "#0a84ff", green: "#30d158", red: "#ff453a", orange: "#ff9f0a", yellow: "#ffd60a", purple: "#bf5af2", pink: "#ff375f", teal: "#64d2ff", indigo: "#5e5ce6" };
const SHADOW = "0 40px 120px rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.4)";
const GRAD = "linear-gradient(90deg,#5e5ce6,#0a84ff 35%,#30d158 70%,#ffd60a)";
const eio = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const hitShake = (t: number, hits: number[], amp = 14) => hits.reduce((a, h) => { const k = t >= h ? Math.exp(-(t - h) * 9) : 0; return [a[0] + Math.sin(t * 97 + h) * amp * k, a[1] + Math.cos(t * 83 + h) * amp * k]; }, [0, 0]);

/* ───────── iOS dark kit ───────── */
const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number; bg?: string; glass?: boolean; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, r = 40, bg = D.card, glass, style, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: r, overflow: "hidden", fontFamily: SANS, color: D.ink, boxShadow: SHADOW,
    background: glass ? "rgba(28,28,30,0.72)" : bg, backdropFilter: glass ? "blur(40px) saturate(180%)" : undefined, border: "1px solid rgba(255,255,255,0.08)", ...style }}>{children}</div>
);
const AppIcon: React.FC<{ size?: number; bg: string; children: React.ReactNode }> = ({ size = 56, bg, children }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.23, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">{children}</svg>
  </div>
);
const Banner: React.FC<{ icon: React.ReactNode; app: string; title: string; body: string; time?: string; w?: number; style?: React.CSSProperties }> = ({ icon, app, title, body, time = "jetzt", w = 720, style }) => (
  <div style={{ width: w, borderRadius: 32, padding: "22px 26px", background: "rgba(44,44,46,0.82)", backdropFilter: "blur(30px) saturate(180%)", boxShadow: SHADOW, border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 18, alignItems: "flex-start", fontFamily: SANS, ...style }}>
    {icon}
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: D.grey, fontSize: 20, fontWeight: 500 }}><span>{app}</span><span>{time}</span></div>
      <div style={{ fontSize: 27, fontWeight: 700, color: D.ink, marginTop: 3 }}>{title}</div>
      <div style={{ fontSize: 24, color: D.ink2, opacity: 0.85, marginTop: 1 }}>{body}</div>
    </div>
  </div>
);
const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 76, height: 46, borderRadius: 23, background: on > 0.5 ? D.green : D.card3, position: "relative" }}>
    <div style={{ position: "absolute", top: 3, left: 3 + on * 30, width: 40, height: 40, borderRadius: 20, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }} />
  </div>
);
const G = {
  fit: <path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="#000" />,
  map: <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#fff" />,
  chart: <path d="M3 17l5-5 4 3 7-8M15 7h4v4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  door: <path d="M6 3h10v18H6zM14 12h.01" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" />,
  lock: <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z" fill="currentColor" />,
  cup: <path d="M5 8h12v5a6 6 0 0 1-12 0zM17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M11 2v3M14 2v3" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" />,
  dice: <><rect x={4} y={4} width={16} height={16} rx={4} stroke="currentColor" strokeWidth={2} fill="none" /><circle cx={9} cy={9} r={1.4} fill="currentColor" /><circle cx={15} cy={15} r={1.4} fill="currentColor" /><circle cx={12} cy={12} r={1.4} fill="currentColor" /></>,
  diamond: <path d="M6 3h12l4 6-10 12L2 9z M2 9h20 M9 3l3 6 3-6 M12 9v12" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinejoin="round" />,
};

/* ───────── lyric line (Feuer style: top-left, word appears when sung, grey → white, accents italic serif) ───────── */
type Acc = { color?: string; italic?: boolean; grad?: string };
const key = (w: string) => w.replace(/[^\p{L}\d'-]/gu, "").toLowerCase();
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`; };
const Lyric: React.FC<{ t: number; i: number; acc?: Record<string, Acc> }> = ({ t, i, acc = {} }) => {
  const size = 78; const next = i + 1 < LY.length ? LS(i + 1) : LY[i].end + 0.35;
  const o = pr(t, next - 0.06, next + 0.22);
  return (
    <div style={{ position: "absolute", left: 120, top: 92, width: 1680, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: size * 0.24, fontFamily: SANS, fontSize: size, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.12,
      opacity: 1 - o, filter: o ? `blur(${o * 14}px)` : undefined, transform: `translateY(${-o * 20}px)` }}>
      {LY[i].words.map((w, j) => {
        const k = cl((t - (w.s - 0.1)) / 0.16); if (k <= 0) return null;
        const sung = cl((t - w.s) / 0.22); const a = acc[key(w.w)];
        const st: React.CSSProperties = { display: "inline-block", transform: `translateY(${(1 - k) * 18}px)`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined, opacity: k,
          fontFamily: a?.italic ? SERIF : SANS, fontStyle: a?.italic ? "italic" : "normal", fontWeight: a?.italic ? 400 : 700, fontSize: a?.italic ? size * 1.14 : size, letterSpacing: a?.italic ? "0" : undefined };
        if (a?.grad && sung > 0.5) return <span key={j} style={{ ...st, background: a.grad, WebkitBackgroundClip: "text", color: "transparent", paddingRight: 6 }}>{w.w}</span>;
        return <span key={j} style={{ ...st, color: mixc(D.grey2, a?.color ?? D.ink, sung) }}>{w.w}</span>;
      })}
    </div>
  );
};

/* ═════════════ scenes ═════════════ */
const CY = 640; // vertical centre of the UI area (lyrics sit above)

// 1 · Fäuste, Tritte so wie Ong-Bak → Fitness: Kickboxen workout, heart rate spikes on every hit
const S0: React.FC<{ t: number }> = ({ t }) => {
  const hits = [WS(0, 0), WS(0, 1), WS(0, 4)]; const k = spring(t, 0.15, 0.6); const [dx, dy] = hitShake(t, hits, 12);
  const n = hits.filter((h) => t >= h).length; const bpm = Math.round([118, 146, 168, 187][n] - (n ? 6 * Math.min(1, (t - hits[n - 1]) * 2) : 0));
  const rings: [string, number][] = [[D.pink, 0.2 + n * 0.27], [D.green, 0.15 + n * 0.22], [D.teal, 0.1 + n * 0.3]];
  return (
    <Card x={960 + dx} y={CY + dy + (1 - cl(k)) * 260} w={1460} h={600} r={48} style={{ opacity: cl(k * 2) }}>
      <div style={{ position: "absolute", left: 52, top: 44, display: "flex", gap: 18, alignItems: "center" }}>
        <AppIcon size={64} bg="linear-gradient(135deg,#d6ff3a,#7ad400)">{G.fit}</AppIcon>
        <div><div style={{ fontSize: 42, fontWeight: 800 }}>Kickboxen</div><div style={{ fontSize: 24, color: D.grey }}>Training · Outdoor</div></div>
      </div>
      <div style={{ position: "absolute", left: 52, top: 170, fontSize: 30, color: D.yellow, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>00:{String(Math.floor(t * 1.6) % 60).padStart(2, "0")},{String(Math.floor(t * 100) % 100).padStart(2, "0")}</div>
      <div style={{ position: "absolute", left: 52, top: 215, display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{bpm}</span>
        <span style={{ fontSize: 40, fontWeight: 700, color: D.red }}>♥︎ BPM</span>
      </div>
      <div style={{ position: "absolute", left: 52, top: 420, fontSize: 30, fontWeight: 700 }}>Treffer <span style={{ color: D.green, marginLeft: 10, fontVariantNumeric: "tabular-nums" }}>{n}</span></div>
      <svg width={900} height={190} style={{ position: "absolute", left: 0, top: 400 }} viewBox="0 0 900 190">
        <polyline fill="none" stroke={D.red} strokeWidth={4} strokeLinejoin="round" opacity={0.9} points={Array.from({ length: 80 }, (_, i) => { const tt = (i / 79) * Math.max(t, 0.01); const spike = hits.reduce((acc, h) => acc + (tt >= h ? Math.exp(-(tt - h) * 12) * 80 : 0), 0); return `${(i / 79) * 560 + 300},${150 - spike - 10 * Math.sin(i * 0.8)}`; }).join(" ")} />
      </svg>
      <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: "absolute", right: 60, top: 90 }}>
        {rings.map(([c, v], i) => { const r = 180 - i * 52; const L = 2 * Math.PI * r; return (<g key={i}>
          <circle r={r} fill="none" stroke={c} strokeOpacity={0.22} strokeWidth={42} />
          <circle r={r} fill="none" stroke={c} strokeWidth={42} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(0.98, v) * eo(pr(t, 0.3, 0.9)))} transform="rotate(-90)" /></g>); })}
      </svg>
      {hits.map((h, i) => <div key={i} style={{ position: "absolute", inset: 0, background: i === 2 ? D.orange : "#fff", opacity: 0.12 * (1 - pr(t, h, h + 0.18)) * (t >= h ? 1 : 0) }} />)}
    </Card>
  );
};

// „… so wie Ong-Bak“ → a film clip playing in an iOS Picture-in-Picture window that bleeds into the scene:
// cinematic push from fist/face to the title on the hit, heat shimmer, embers flying out, light spill + reflection.
const PW = 600, PH = 338; const PX = 1300, PY = 560; // window size + centre
const IMG_W = 1000, IMG_H = 1215;
const OngBakPiP: React.FC<{ t: number }> = ({ t }) => {
  const t0 = WS(0, 2) - 0.1, hit = WS(0, 4); if (t < t0 - 0.01) return null;
  const inK = spring(t, t0, 0.5); const ci = cl(inK);
  const punch = t >= hit ? Math.exp(-(t - hit) * 7) * Math.sin((t - hit) * 26) : 0; const flare = t >= hit ? Math.exp(-(t - hit) * 3) : 0;
  const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3);
  const [dx, dy] = hitShake(t, [hit], 18);
  // camera inside the clip: close on fist/face → whip down to the ONG-BAK title on the hit
  const pre = eo(pr(t, t0, hit)), whip = eio(pr(t, hit - 0.06, hit + 0.16));
  const scale = lerp(lerp(2.5, 2.1, pre), 1.15, whip);
  const fx = lerp(0.58, 0.5, whip), fy = lerp(lerp(0.36, 0.33, pre), 0.86, whip); // focus point (fraction of image)
  const iw = PW * scale, ih = iw * (IMG_H / IMG_W);
  const ix = PW / 2 - fx * iw, iy = Math.min(0, Math.max(PH - ih, PH / 2 - fy * ih));
  const motionBlur = Math.sin(Math.PI * pr(t, hit - 0.06, hit + 0.16)) * 10;
  const glare = pr(t, t0 + 0.05, t0 + 0.75);
  const left = PX - PW / 2 + dx + (1 - ci) * 760, top = PY - PH / 2 + dy;
  const embers = Array.from({ length: 46 }, (_, i) => {
    const born = t0 + random(`eb${i}`) * 1.4; const age = t - born; if (age < 0 || age > 1.6) return null;
    const burst = born > hit ? 1 : 0; const sp = burst ? 260 + random(`es${i}`) * 520 : 60 + random(`es${i}`) * 120;
    const ang = burst ? -Math.PI / 2 + (random(`ea${i}`) - 0.5) * 2.6 : -Math.PI / 2 + (random(`ea${i}`) - 0.5) * 0.9;
    const x = left + random(`ex${i}`) * PW + Math.cos(ang) * sp * age + Math.sin(age * 6 + i) * 10;
    const y = top + PH * (0.25 + random(`ey${i}`) * 0.6) + Math.sin(ang) * sp * age + 60 * age * age;
    const sz = 3 + random(`ez${i}`) * 5; const o = (1 - age / 1.6) * (0.6 + 0.4 * Math.sin(age * 20 + i));
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: sz, background: i % 3 ? "#ffb347" : "#ffe08a", boxShadow: `0 0 ${sz * 3}px #ff7a1a`, opacity: o * ci }} />;
  }).filter((x) => x !== null);
  return (<>
    {/* heat shimmer filter for the clip */}
    <svg width={0} height={0} style={{ position: "absolute" }}><filter id="heat" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves={2} seed={Math.floor(t * 30) % 100} />
      <feDisplacementMap in="SourceGraphic" scale={6 + 10 * flare} />
    </filter></svg>
    {/* fire light spilling onto the scene / workout card */}
    <AbsoluteFill style={{ background: `radial-gradient(28% 40% at ${(PX / 1920) * 100}% ${((PY + 120) / 1080) * 100}%, rgba(255,120,30,${(0.16 * flick + 0.55 * flare) * ci}), transparent 70%)`, mixBlendMode: "screen", pointerEvents: "none" }} />
    <AbsoluteFill style={{ background: `radial-gradient(60% 75% at 70% 55%, rgba(255,90,20,${0.4 * flare}), rgba(180,20,10,${0.18 * flare}) 50%, transparent 78%)`, mixBlendMode: "screen", pointerEvents: "none" }} />
    {/* reflection on the card surface below the window */}
    <div style={{ position: "absolute", left, top: top + PH + 14, width: PW, height: PH * 0.45, overflow: "hidden", opacity: 0.22 * ci, transform: `rotate(${lerp(5, -1.5, ci)}deg)`, maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent)", WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent)", filter: "blur(6px)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, transform: "scaleY(-1)", transformOrigin: "50% 0%" }}>
        <Img src={staticFile("alim/ongbak_crop.jpg")} style={{ position: "absolute", left: ix, top: iy - PH, width: iw, height: ih }} />
      </div>
    </div>
    {/* the PiP window */}
    <div style={{ position: "absolute", left, top, width: PW, height: PH, borderRadius: 26, overflow: "hidden", background: "#000",
      boxShadow: `0 40px 110px rgba(0,0,0,0.75), 0 0 ${50 + 160 * flare}px rgba(255,110,20,${(0.22 * flick + 0.6 * flare)})`, border: "1px solid rgba(255,255,255,0.16)",
      transform: `rotate(${lerp(5, -1.5, ci)}deg) scale(${(1 + 0.12 * punch + 0.03 * flare) * lerp(0.92, 1, ci)})`, filter: ci < 1 ? `blur(${(1 - ci) * 10}px)` : undefined, opacity: cl(inK * 2) }}>
      <div style={{ position: "absolute", inset: 0, filter: `url(#heat) contrast(1.08) saturate(1.12) brightness(${0.9 + 0.12 * flick + 0.25 * flare})${motionBlur > 0.5 ? ` blur(${motionBlur * 0.35}px)` : ""}` }}>
        <Img src={staticFile("alim/ongbak_crop.jpg")} style={{ position: "absolute", left: ix, top: iy, width: iw, height: ih }} />
      </div>
      {/* grade: vignette, warm fire tint, film grain */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 85% at 50% 45%, transparent 50%, rgba(0,0,0,0.55))" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(255,90,10,${0.06 + 0.06 * flick})`, mixBlendMode: "overlay" }} />
      <svg width={PW} height={PH} style={{ position: "absolute", inset: 0, opacity: 0.14, mixBlendMode: "overlay" }}><filter id="pg"><feTurbulence type="fractalNoise" baseFrequency="0.9" seed={Math.floor(t * 24) % 50} /></filter><rect width={PW} height={PH} filter="url(#pg)" /></svg>
      {/* glass glare sweeping once over the window */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${glare * 140 - 40}%, rgba(255,255,255,0.22) ${glare * 140 - 30}%, transparent ${glare * 140 - 18}%)` }} />
      {/* iOS PiP controls */}
      <div style={{ position: "absolute", left: 14, top: 12, display: "flex", gap: 8, opacity: 1 - pr(t, hit - 0.1, hit + 0.1) * 0.6 }}>{[0, 1].map((i) => <div key={i} style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(40,40,44,0.65)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={15} height={15} viewBox="0 0 24 24">{i === 0 ? <path d="M6 6l12 12M18 6 6 18" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" /> : <path d="M9 4H4v5M15 20h5v-5M4 4l6 6M20 20l-6-6" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" />}</svg></div>)}</div>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 12, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.28)" }}><div style={{ width: `${lerp(41, 44, pr(t, t0, hit + 1))}%`, height: "100%", borderRadius: 2, background: "#fff" }} /></div>
    </div>
    {embers}
  </>);
};

// 2 · Zivis fahnden, Bruder, normal → Maps (dark): a vehicle follows you, banner
const S1: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(1); const k = eo(pr(t, a - 0.15, a + 0.25)); const b = spring(t, WS(1, 1) - 0.1, 0.55); const ok = spring(t, WS(1, 3) - 0.05, 0.5);
  const route = [[160, 470], [420, 420], [560, 300], [820, 280], [980, 160], [1300, 140]];
  const along = (p: number) => { const segs = route.length - 1; const f = Math.min(segs - 0.001, Math.max(0, p * segs)); const i = Math.floor(f), r = f - i; return [lerp(route[i][0], route[i + 1][0], r), lerp(route[i][1], route[i + 1][1], r)]; };
  const pMe = 0.25 + (t - a) * 0.16, pThem = pMe - 0.12; const [mx, my] = along(pMe), [ex, ey] = along(pThem);
  return (<div style={{ opacity: k, transform: `scale(${lerp(1.04, 1, k)})` }}>
    <Card x={960} y={CY} w={1460} h={620} r={48} bg="#141416">
      <svg width={1460} height={620} style={{ position: "absolute", inset: 0 }}>
        <rect width={1460} height={620} fill="#141416" />
        <path d="M0 560 Q300 520 520 600 L0 620Z" fill="#0c2236" /><rect x={1050} y={330} width={330} height={210} rx={30} fill="#13261a" />
        {Array.from({ length: 16 }, (_, i) => <line key={`a${i}`} x1={i * 100 - 40} y1={0} x2={i * 100 + 60} y2={620} stroke="#26262a" strokeWidth={i % 4 ? 8 : 16} />)}
        {Array.from({ length: 8 }, (_, i) => <line key={`b${i}`} x1={0} y1={i * 90 + 20} x2={1460} y2={i * 90 - 30} stroke="#26262a" strokeWidth={i % 3 ? 8 : 16} />)}
        <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke={D.blue} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        <circle cx={ex} cy={ey} r={30 + 10 * Math.sin(t * 8)} fill="rgba(255,69,58,0.2)" /><circle cx={ex} cy={ey} r={13} fill={D.red} stroke="#fff" strokeWidth={4} />
        <circle cx={mx} cy={my} r={36} fill="rgba(10,132,255,0.25)" /><circle cx={mx} cy={my} r={15} fill={D.blue} stroke="#fff" strokeWidth={5} />
      </svg>
      <div style={{ position: "absolute", left: 30, bottom: 26, padding: "14px 20px", borderRadius: 20, background: "rgba(28,28,30,0.85)", fontSize: 24, fontWeight: 700, display: "flex", gap: 12, alignItems: "center", opacity: cl(ok), transform: `translateY(${(1 - cl(ok)) * 20}px)` }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: D.green }} />Weiterfahren wie normal
      </div>
    </Card>
    <div style={{ position: "absolute", left: 920, top: CY - 340, transform: `translateY(${(1 - cl(b)) * -120}px)`, opacity: cl(b * 2) }}>
      <Banner w={700} icon={<AppIcon size={54} bg="linear-gradient(135deg,#34c759,#0a84ff)">{G.map}</AppIcon>} app="KARTEN" title="Fahrzeug folgt dir" body="Seit 3 Min. auf deiner Route" />
    </div>
  </div>);
};

// 3 · Mach' schlau auf Motorola → pairing sheet: generic flip phone (no logo) connects
const FlipPhone: React.FC<{ rot: number; open: number; glow: number }> = ({ rot, open, glow }) => (
  <div style={{ width: 200, height: 260, position: "relative", perspective: 1000, transform: `rotateY(${rot}deg)`, transformStyle: "preserve-3d" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(160deg,#5a5a62,#1e1e22)", border: "1px solid rgba(255,255,255,0.2)", padding: "26px 22px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
      {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ height: 30, borderRadius: 9, background: `rgba(255,255,255,${0.1 + glow * 0.15})` }} />)}
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 200, height: 260, transformOrigin: "50% 0%", transform: `rotateX(${lerp(-178, -10, open)}deg)`, transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", inset: 0, transform: "translateY(-100%)", borderRadius: 26, background: "linear-gradient(200deg,#62626a,#232327)", border: "1px solid rgba(255,255,255,0.2)", padding: 16, boxSizing: "border-box" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 14, background: `radial-gradient(80% 70% at 50% 35%, rgba(100,210,255,${0.2 + glow * 0.6}), #04060a 75%)` }} />
      </div>
    </div>
  </div>
);
const S2: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(2); const k = spring(t, a - 0.12, 0.55); const open = eio(pr(t, WS(2, 0), WS(2, 2))); const done = pr(t, WS(2, 3) - 0.05, WS(2, 3) + 0.2);
  return (<>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)", opacity: cl(k) }} />
    <Card x={960} y={CY + 40 + (1 - cl(k)) * 600} w={760} h={600} r={56} glass>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontSize: 40, fontWeight: 800 }}>Klapphandy</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", fontSize: 24, color: D.grey }}>{done > 0.5 ? "Verbunden mit diesem Gerät" : "Nicht verbunden"}</div>
      <div style={{ position: "absolute", left: 318, top: 300, transformOrigin: "0 0", transform: `translateY(${Math.sin(t * 2) * 5}px) scale(0.62)` }}><FlipPhone rot={-25 + Math.sin(t * 1.2) * 18} open={open} glow={done} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 46, height: 84, borderRadius: 22, background: done > 0.5 ? "rgba(48,209,88,0.18)" : D.blue, color: done > 0.5 ? D.green : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>
        {done > 0.5 ? "✓ Verbunden" : "Verbinden"}
      </div>
    </Card>
  </>);
};

// 4 · Big Stacks heißt, wir kommen voran → Stocks: portfolio counts up, curve climbs
const S3: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(3); const k = eo(pr(t, a - 0.15, a + 0.3)); const g = eio(pr(t, WS(3, 0) - 0.1, WS(3, 5) + 0.5)); const val = Math.round(lerp(12480, 48920, g));
  const pts = Array.from({ length: 60 }, (_, i) => { const x = i / 59; const y = 0.15 + x * 0.65 + 0.06 * Math.sin(i * 1.3) + 0.04 * Math.sin(i * 0.37); return [x * 1280 + 70, 520 - y * 330]; });
  const shown = Math.max(2, Math.round(60 * g));
  return (<div style={{ opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
    <Card x={960} y={CY} w={1460} h={620} r={48}>
      <div style={{ position: "absolute", left: 60, top: 44, display: "flex", gap: 18, alignItems: "center" }}><AppIcon size={60} bg="#000">{G.chart}</AppIcon><div><div style={{ fontSize: 26, color: D.grey, fontWeight: 600 }}>Portfolio</div><div style={{ fontSize: 30, fontWeight: 800 }}>Big Stacks</div></div></div>
      <div style={{ position: "absolute", right: 60, top: 40, textAlign: "right" }}>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{val.toLocaleString("de-DE")} €</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: D.green }}>▲ +{Math.round((val / 12480 - 1) * 100)} %</div>
      </div>
      <svg width={1460} height={620} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(48,209,88,0.35)" /><stop offset="1" stopColor="rgba(48,209,88,0)" /></linearGradient></defs>
        {[0, 1, 2, 3].map((i) => <line key={i} x1={70} x2={1350} y1={230 + i * 95} y2={230 + i * 95} stroke={D.sep} strokeDasharray="4 8" />)}
        <polygon points={`${pts[0][0]},540 ${pts.slice(0, shown).map((p) => p.join(",")).join(" ")} ${pts[shown - 1][0]},540`} fill="url(#sf)" />
        <polyline points={pts.slice(0, shown).map((p) => p.join(",")).join(" ")} fill="none" stroke={D.green} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={pts[shown - 1][0]} cy={pts[shown - 1][1]} r={12} fill={D.green} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: 60, bottom: 30, display: "flex", gap: 10 }}>{["1T", "1W", "1M", "3M", "1J", "5J"].map((r) => <span key={r} style={{ padding: "8px 18px", borderRadius: 12, fontSize: 22, fontWeight: 700, background: r === "1J" ? D.card3 : "transparent", color: r === "1J" ? "#fff" : D.grey }}>{r}</span>)}</div>
    </Card>
  </div>);
};

// 5 · Freiheit, Zelle, Chaye, bonne chance → Control Centre: four tiles switch on with their word
const S4: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(4); const k = spring(t, a - 0.12, 0.55);
  const tiles: [string, React.ReactNode, string, number][] = [["Freiheit", G.door, D.yellow, WS(4, 0)], ["Zelle", G.lock, D.indigo, WS(4, 1)], ["Chaye", G.cup, D.orange, WS(4, 2)], ["Bonne Chance", G.dice, D.green, WS(4, 3)]];
  return (<div style={{ opacity: cl(k * 2), transform: `scale(${lerp(0.9, 1, cl(k))})`, transformOrigin: "960px 640px" }}>
    {tiles.map(([n, g, c, ts], i) => { const on = eo(pr(t, ts - 0.08, ts + 0.15)); const pop = spring(t, ts - 0.08, 0.4); const x = 960 - 470 + (i % 2) * 330, y = CY - 165 + Math.floor(i / 2) * 330;
      return (<div key={i} style={{ position: "absolute", left: x - 150, top: y - 150, width: 300, height: 300, borderRadius: 64, background: on > 0.5 ? "rgba(255,255,255,0.92)" : "rgba(58,58,60,0.75)", backdropFilter: "blur(30px)", boxShadow: SHADOW,
        transform: `scale(${1 + 0.06 * Math.sin(Math.PI * cl(pop))})`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 34, boxSizing: "border-box", fontFamily: SANS }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: on > 0.5 ? c : "rgba(255,255,255,0.12)", color: on > 0.5 ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={44} height={44} viewBox="0 0 24 24">{g}</svg></div>
        <div><div style={{ fontSize: 30, fontWeight: 800, color: on > 0.5 ? "#000" : "#fff" }}>{n}</div><div style={{ fontSize: 22, color: on > 0.5 ? "#3a3a3c" : D.grey }}>{on > 0.5 ? "Ein" : "Aus"}</div></div>
      </div>); })}
    {[0.7, 0.45].map((v, i) => <div key={i} style={{ position: "absolute", left: 1190 + i * 170, top: CY - 315, width: 140, height: 630, borderRadius: 64, background: "rgba(58,58,60,0.75)", overflow: "hidden", boxShadow: SHADOW }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${v * 100 + (i === 0 ? 8 * Math.sin(t * 2) : 0)}%`, background: "rgba(255,255,255,0.92)" }} />
      <svg width={140} height={80} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, bottom: 24 }}>{i === 0 ? <><circle cx={12} cy={12} r={3.2} fill="#3a3a3c" />{Array.from({ length: 8 }, (_, j) => <line key={j} x1={12} y1={5.5} x2={12} y2={7} stroke="#3a3a3c" strokeWidth={1.4} strokeLinecap="round" transform={`rotate(${j * 45} 12 12)`} />)}</> : <path d="M5 10h3l4-3v10l-4-3H5zM15 9.5a3.5 3.5 0 0 1 0 5" stroke="#3a3a3c" strokeWidth={1.4} fill="none" strokeLinecap="round" />}</svg>
    </div>)}
  </div>);
};

// 6 · Banditen bei Sonn'nuntergang → Weather widget: sunset 18:42, sun slides down the arc
const S5: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(5); const k = eo(pr(t, a - 0.15, a + 0.3)); const p = eio(pr(t, a, LS(6) - 0.1)); const ang = Math.PI * lerp(0.42, 0.97, p);
  const sx = 730 - Math.cos(ang) * 560, sy = 470 - Math.sin(ang) * 300;
  return (<div style={{ opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
    <Card x={960} y={CY} w={1460} h={620} r={48} bg="linear-gradient(180deg,#2b1a52 0%,#7a2e6b 42%,#e0566b 70%,#ff9f43 100%)">
      <div style={{ position: "absolute", left: 60, top: 44 }}><div style={{ fontSize: 34, fontWeight: 700 }}>Mein Standort</div><div style={{ fontSize: 110, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}>24°</div><div style={{ fontSize: 28, fontWeight: 600, opacity: 0.9 }}>Klar · H: 29° T: 17°</div></div>
      <div style={{ position: "absolute", right: 60, top: 50, textAlign: "right" }}><div style={{ fontSize: 24, fontWeight: 700, opacity: 0.75, letterSpacing: "0.06em" }}>SONNENUNTERGANG</div><div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-0.03em" }}>18:42</div></div>
      <svg width={1460} height={620} style={{ position: "absolute", inset: 0 }}>
        <path d="M170 470 A560 300 0 0 1 1290 470" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        <line x1={100} x2={1360} y1={470} y2={470} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <circle cx={sx} cy={sy} r={70} fill="rgba(255,220,140,0.35)" /><circle cx={sx} cy={sy} r={34} fill="#fff4c8" />
        <rect x={0} y={472} width={1460} height={160} fill="rgba(20,10,30,0.6)" />
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 26, display: "flex", justifyContent: "space-between" }}>
        {["17", "18", "18:42", "19", "20", "21"].map((h, i) => <div key={i} style={{ textAlign: "center", fontSize: 24, fontWeight: 700 }}><div style={{ opacity: 0.8 }}>{h}</div><div style={{ fontSize: 30, marginTop: 6 }}>{i < 2 ? "☀︎" : i === 2 ? "◐" : "☾"}</div><div>{[26, 25, 24, 22, 20, 19][i]}°</div></div>)}
      </div>
    </Card>
  </div>);
};

// 7 · Werden heiß, jagen auch die Klunker → Find My precision finding: arrow + distance, gets "heiß"
const S6: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(6); const k = eo(pr(t, a - 0.15, a + 0.3)); const d = Math.max(4, Math.round(lerp(64, 9, eio(pr(t, a, LS(7)))))); const heat = pr(t, WS(6, 1) - 0.05, WS(6, 1) + 0.3);
  const rot = Math.sin(t * 1.7) * 28 * (1 - pr(t, WS(6, 5), WS(6, 5) + 0.4)); const col = heat > 0.5 ? D.orange : D.green;
  return (<div style={{ opacity: k }}>
    <Card x={960} y={CY} w={760} h={640} r={56} bg={`linear-gradient(180deg, ${mixc("#0e2a1c", "#3a1a08", heat)}, #050806)`}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center" }}><div style={{ fontSize: 24, color: D.grey, fontWeight: 600 }}>Genaue Suche</div><div style={{ fontSize: 40, fontWeight: 800, display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}><svg width={36} height={36} viewBox="0 0 24 24">{G.diamond}</svg>Klunker</div></div>
      <svg width={760} height={640} style={{ position: "absolute", inset: 0 }} viewBox="0 0 760 640">
        {[0, 1, 2].map((i) => { const r = ((t * 0.9 + i / 3) % 1); return <circle key={i} cx={380} cy={330} r={80 + r * 200} fill="none" stroke={col} strokeOpacity={0.35 * (1 - r)} strokeWidth={3} />; })}
        <g transform={`translate(380 330) rotate(${rot})`}><path d="M0 -150 L70 40 L0 0 L-70 40 Z" fill={col} /></g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center" }}>
        <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{d} m</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: col }}>{heat > 0.5 ? "Wird heißer …" : "vorne"}</div>
      </div>
    </Card>
  </div>);
};
// 8 · (repeat) → Find My: "Klunker gefunden" – full green pulse
const S7: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(7); const k = eo(pr(t, a - 0.15, a + 0.25)); const found = spring(t, WS(7, 5) - 0.1, 0.5); const d = Math.max(0, Math.round(lerp(4, 0, eio(pr(t, a, WS(7, 5))))));
  return (<div style={{ opacity: k }}>
    <Card x={960} y={CY} w={760} h={640} r={56} bg={found > 0.3 ? "linear-gradient(180deg,#30d158,#1f9e43)" : "linear-gradient(180deg,#3a1a08,#050806)"}>
      <svg width={760} height={640} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3].map((i) => { const r = ((t * 1.4 + i / 4) % 1); return <circle key={i} cx={380} cy={300} r={60 + r * 300} fill="none" stroke="#fff" strokeOpacity={0.4 * (1 - r)} strokeWidth={4} />; })}
        <circle cx={380} cy={300} r={lerp(30, 110, cl(found))} fill="#fff" opacity={0.95} />
        <g transform={`translate(${380 - 48} ${300 - 48}) scale(4)`} opacity={cl(found)}><path d="M6 3h12l4 6-10 12L2 9z M2 9h20 M9 3l3 6 3-6 M12 9v12" stroke={D.green} strokeWidth={1.6} fill="none" strokeLinejoin="round" /></g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center" }}>
        <div style={{ fontSize: found > 0.3 ? 64 : 110, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{found > 0.3 ? "Hier" : `${d} m`}</div>
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.9 }}>{found > 0.3 ? "Klunker gefunden" : "Sehr heiß"}</div>
      </div>
    </Card>
  </div>);
};

// 9 · Alles blau und sie ziel'n auf uns grad → Camera: blue bokeh, yellow AF box locks, AE/AF-Sperre
const S8: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(8); const k = eo(pr(t, a - 0.15, a + 0.25)); const lock = eio(pr(t, WS(8, 4) - 0.25, WS(8, 4) + 0.2)); const shot = pr(t, WS(8, 7), WS(8, 7) + 0.25);
  const box = lerp(360, 200, lock); const [dx, dy] = hitShake(t, [WS(8, 7)], 10);
  const ticks: React.CSSProperties[] = [{ left: box / 2 - 7, top: -3 }, { left: box / 2 - 7, bottom: -3 }, { top: box / 2 - 1, left: -8 }, { top: box / 2 - 1, right: -8 }];
  return (<div style={{ opacity: k }}>
    <Card x={960 + dx} y={CY + dy} w={1460} h={640} r={48} bg="#000">
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, bottom: 110, overflow: "hidden", background: "radial-gradient(70% 90% at 50% 50%, #0a3a8a, #020a1c 75%)" }}>
        {Array.from({ length: 22 }, (_, i) => { const x = random(`bx${i}`) * 1460, y = random(`by${i}`) * 460, r = 30 + random(`br${i}`) * 90; return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: i % 4 === 0 ? "rgba(255,69,58,0.35)" : "rgba(100,170,255,0.35)", filter: "blur(6px)", opacity: 0.6 + 0.4 * Math.sin(t * 4 + i) }} />; })}
        <div style={{ position: "absolute", left: 730 - box / 2, top: 230 - box / 2, width: box, height: box, border: `3px solid ${D.yellow}`, opacity: 0.4 + 0.6 * lock }}>
          {ticks.map((p, i) => <div key={i} style={{ position: "absolute", width: 14, height: 3, background: D.yellow, ...p }} />)}
          <div style={{ position: "absolute", right: -42, top: box / 2 - 20, fontSize: 32, color: D.yellow }}>☀︎</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {lock > 0.95 && <span style={{ padding: "6px 14px", borderRadius: 8, background: D.yellow, color: "#000", fontSize: 20, fontWeight: 800, letterSpacing: "0.04em" }}>AE/AF-SPERRE</span>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 60 }}>
        <span style={{ fontSize: 22, color: D.grey, fontWeight: 700, letterSpacing: "0.08em" }}>VIDEO</span><span style={{ fontSize: 22, color: D.yellow, fontWeight: 700, letterSpacing: "0.08em" }}>FOTO</span>
        <div style={{ width: 78, height: 78, borderRadius: 39, border: "5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 62, height: 62, borderRadius: 31, background: "#fff", transform: `scale(${1 - 0.12 * Math.sin(Math.PI * shot)})` }} /></div>
        <span style={{ fontSize: 22, color: D.grey, fontWeight: 700, letterSpacing: "0.08em" }}>PORTRÄT</span>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: (1 - shot) * (t >= WS(8, 7) ? 0.7 : 0) }} />
    </Card>
  </div>);
};

// 10 · Die Vision fällt in Scherben unter → Photos memory card "Vision" cracks and shatters
const crack = (seed: number, cx: number, cy: number) => Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5; let x = cx, y = cy; const pts = [`${x},${y}`];
  for (let s = 0; s < 4; s++) { const L = 40 + random(`${seed}l${i}${s}`) * 80; x += Math.cos(a + (random(`${seed}j${i}${s}`) - 0.5) * 0.8) * L; y += Math.sin(a + (random(`${seed}k${i}${s}`) - 0.5) * 0.8) * L; pts.push(`${x},${y}`); }
  return pts.join(" ");
});
const SW = 1000, SH = 560;
const SHARDS = (() => { const out: { pts: string; cx: number; cy: number; i: number }[] = []; const cols = 7, rows = 4;
  const jx = (c: number, r: number) => (c === 0 || c === cols ? 0 : (random(`sx${c}${r}`) - 0.5) * 70), jy = (c: number, r: number) => (r === 0 || r === rows ? 0 : (random(`sy${c}${r}`) - 0.5) * 70);
  const P = (c: number, r: number) => [c * (SW / cols) + jx(c, r), r * (SH / rows) + jy(c, r)];
  let i = 0; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = P(c, r), b = P(c + 1, r), d = P(c, r + 1), e = P(c + 1, r + 1);
    for (const tri of (random(`d${c}${r}`) > 0.5 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]])) out.push({ pts: tri.map((p) => p.join(",")).join(" "), cx: (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy: (tri[0][1] + tri[1][1] + tri[2][1]) / 3, i: i++ }); }
  return out; })();
const S9: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(9); const k = spring(t, a - 0.12, 0.55); const crackK = eo(pr(t, WS(9, 2) - 0.05, WS(9, 2) + 0.25)); const br = WS(9, 4) - 0.04; const fall = Math.max(0, t - br);
  const ox = 960 - SW / 2, oy = CY - SH / 2 + (1 - cl(k)) * 200;
  return (<>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: cl(k * 2) }}>
      <defs>
        <clipPath id="vpane"><rect x={0} y={0} width={SW} height={SH} rx={44} /></clipPath>
        <linearGradient id="vimg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5e5ce6" /><stop offset="0.5" stopColor="#bf5af2" /><stop offset="1" stopColor="#ff375f" /></linearGradient>
        {SHARDS.map((sh) => <clipPath key={sh.i} id={`vs${sh.i}`}><polygon points={sh.pts} /></clipPath>)}
      </defs>
      {SHARDS.map((sh) => { const vx = 80 + (sh.cx - SW / 2) * 0.9 + (random(`vx${sh.i}`) - 0.3) * 260; const vy = -100 - random(`vy${sh.i}`) * 220; const rot = (random(`r${sh.i}`) - 0.5) * 900 * fall;
        return (<g key={sh.i} transform={`translate(${ox + vx * fall} ${oy + vy * fall + 1500 * fall * fall}) rotate(${rot} ${sh.cx} ${sh.cy})`} opacity={1 - pr(fall, 0.55, 1.1)}>
          <g clipPath="url(#vpane)"><g clipPath={`url(#vs${sh.i})`}>
            <rect width={SW} height={SH} fill="url(#vimg)" />
            <circle cx={720} cy={200} r={150} fill="rgba(255,255,255,0.25)" /><path d={`M0 ${SH} L300 260 L520 420 L760 220 L${SW} ${SH}Z`} fill="rgba(0,0,0,0.35)" />
            <rect y={SH - 200} width={SW} height={200} fill="rgba(0,0,0,0.35)" />
            <text x={50} y={SH - 110} fontFamily={SANS} fontWeight={900} fontSize={96} letterSpacing="-3" fill="#fff">Vision</text>
            <text x={52} y={SH - 58} fontFamily={SANS} fontWeight={600} fontSize={30} fill="rgba(255,255,255,0.85)">Rückblick · Heute</text>
          </g><polygon points={sh.pts} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={fall > 0 ? 1.5 : 0} /></g>
        </g>); })}
      {fall === 0 && crackK > 0 && <g transform={`translate(${ox} ${oy})`}>{crack(9, 560, 260).map((p, j) => <polyline key={j} points={p} fill="none" stroke="#fff" strokeWidth={2.4} strokeDasharray={700} strokeDashoffset={700 * (1 - crackK)} />)}</g>}
    </svg>
    <AbsoluteFill style={{ background: "#fff", opacity: 0.18 * (1 - pr(t, br, br + 0.2)) * (t >= br ? 1 : 0) }} />
  </>);
};

// 11 · Vor paar Stunden war noch alles bunter → Photos library "Vor 3 Stunden": vivid grid
const TILE_COLS = [["#ff375f", "#ff9f0a"], ["#ffd60a", "#30d158"], ["#0a84ff", "#5e5ce6"], ["#bf5af2", "#ff375f"], ["#64d2ff", "#30d158"], ["#ff9f0a", "#ffd60a"], ["#5e5ce6", "#64d2ff"], ["#30d158", "#ffd60a"], ["#ff375f", "#bf5af2"], ["#0a84ff", "#64d2ff"], ["#ffd60a", "#ff375f"], ["#bf5af2", "#0a84ff"]];
const PhotosGrid: React.FC<{ t: number; t0: number; boost: number }> = ({ t, t0, boost }) => (
  <Card x={960} y={CY} w={1460} h={640} r={48}>
    <div style={{ position: "absolute", left: 50, top: 34 }}><div style={{ fontSize: 46, fontWeight: 800 }}>Mediathek</div><div style={{ fontSize: 26, color: D.grey, fontWeight: 600 }}>Vor 3 Stunden · 12 Fotos</div></div>
    <div style={{ position: "absolute", left: 50, top: 150, right: 50, display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
      {TILE_COLS.map(([c1, c2], i) => { const p = spring(t, t0 + i * 0.05, 0.4); return <div key={i} style={{ height: 215, borderRadius: 6, background: `linear-gradient(${135 + i * 20}deg, ${c1}, ${c2})`, transform: `scale(${0.6 + 0.4 * cl(p)})`, opacity: cl(p * 2), filter: `saturate(${1 + boost * 0.5})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "20%", top: "25%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} /></div>; })}
    </div>
  </Card>
);
const S10: React.FC<{ t: number }> = ({ t }) => { const a = LS(10); const k = eo(pr(t, a - 0.15, a + 0.3)); const boost = pr(t, WS(10, 6) - 0.1, WS(10, 6) + 0.3);
  return (<div style={{ opacity: k }}><PhotosGrid t={t} t0={a - 0.2} boost={boost} /></div>); };

// 12 · (repeat) → Settings › Bedienungshilfen › Farbfilter: Graustufen switches on, world turns grey
const GRAY_ON = () => WS(11, 3);
const S11: React.FC<{ t: number }> = ({ t }) => {
  const a = LS(11); const k = spring(t, a - 0.12, 0.55); const on = eo(pr(t, GRAY_ON() - 0.1, GRAY_ON() + 0.15)); const check = pr(t, WS(11, 5) - 0.1, WS(11, 5) + 0.15);
  return (<>
    <div style={{ opacity: 1 - eo(pr(t, a - 0.1, a + 0.4)) * 0.6, filter: "blur(4px)" }}><PhotosGrid t={t} t0={-10} boost={0} /></div>
    <Card x={960} y={CY + (1 - cl(k)) * 500} w={860} h={560} r={48} glass>
      <div style={{ position: "absolute", left: 44, top: 34, fontSize: 24, color: D.blue, fontWeight: 600 }}>‹ Anzeige & Textgröße</div>
      <div style={{ position: "absolute", left: 44, top: 80, fontSize: 52, fontWeight: 800 }}>Farbfilter</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 180, borderRadius: 26, background: D.card2, padding: "0 26px" }}>
        <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 32, fontWeight: 600 }}>Farbfilter<Toggle on={on} /></div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 300, borderRadius: 26, background: D.card2, padding: "0 26px", opacity: 0.4 + 0.6 * on }}>
        {["Graustufen", "Rot/Grün-Filter", "Blau/Gelb-Filter"].map((n, i) => <div key={i} style={{ height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 30, fontWeight: 500, borderBottom: i < 2 ? `1px solid ${D.sep}` : "none" }}>{n}{i === 0 && <span style={{ color: D.blue, fontSize: 34, opacity: cl(check + on) }}>✓</span>}</div>)}
      </div>
    </Card>
  </>);
};

/* ───────── master ───────── */
const S0P: React.FC<{ t: number }> = ({ t }) => (<><S0 t={t} /><OngBakPiP t={t} /></>);
const SC: { C: React.FC<{ t: number }>; acc: Record<string, Acc> }[] = [
  { C: S0P, acc: { "ong-bak": { italic: true, grad: "linear-gradient(180deg,#fff27a,#f2c31a 55%,#c98a0c)" } } },
  { C: S1, acc: { zivis: { color: D.teal }, normal: { italic: true, color: D.green } } },
  { C: S2, acc: { motorola: { italic: true, color: D.teal } } },
  { C: S3, acc: { big: { color: D.green }, stacks: { color: D.green }, voran: { italic: true, color: D.yellow } } },
  { C: S4, acc: { freiheit: { color: D.yellow }, chaye: { italic: true, color: D.orange }, bonne: { italic: true, color: D.green }, chance: { italic: true, color: D.green } } },
  { C: S5, acc: { "sonn'nuntergang": { italic: true, grad: "linear-gradient(90deg,#ff9f0a,#ff375f)" } } },
  { C: S6, acc: { heiß: { italic: true, color: D.orange }, klunker: { color: D.teal } } },
  { C: S7, acc: { klunker: { italic: true, color: D.green } } },
  { C: S8, acc: { blau: { italic: true, color: D.blue }, "ziel'n": { color: D.yellow } } },
  { C: S9, acc: { vision: { italic: true, color: D.purple }, scherben: { color: D.grey } } },
  { C: S10, acc: { bunter: { italic: true, grad: "linear-gradient(90deg,#ff375f,#ff9f0a,#ffd60a,#30d158,#0a84ff,#bf5af2)" } } },
  { C: S11, acc: { bunter: { italic: true, color: D.grey } } },
];

export const Alim: React.FC = () => {
  const t = useT(); const end = LY[11].end; const endK = pr(t, end + 0.3, end + 1.0);
  const gray = eio(pr(t, GRAY_ON() - 0.05, GRAY_ON() + 1.2));
  return (
    <AbsoluteFill style={{ background: D.bg, overflow: "hidden" }}>
      <Audio src={staticFile("alim.mp3")} />
      <AbsoluteFill style={{ filter: gray ? `grayscale(${gray})` : undefined }}>
        {/* shared iOS-dark wallpaper glow – scenes are transparent so transitions overlap */}
        <AbsoluteFill style={{ background: `radial-gradient(45% 55% at 15% 10%, rgba(94,92,230,${0.22 + 0.05 * Math.sin(t)}), transparent 70%), radial-gradient(45% 55% at 90% 95%, rgba(10,132,255,0.16), transparent 70%), radial-gradient(30% 40% at 85% 15%, rgba(191,90,242,0.10), transparent 70%)` }} />
        {SC.map((s, i) => {
          const a = i === 0 ? -1 : LS(i) - 0.2, b = i === 11 ? 99 : LS(i + 1) + 0.2;
          if (t < a || t >= b) return null;
          const out = i === 11 ? endK : pr(t, LS(i + 1) - 0.12, b);
          return <AbsoluteFill key={i} style={{ opacity: 1 - out, filter: out > 0 ? `blur(${out * 14}px)` : undefined, transform: `scale(${lerp(1, 0.96, out)})` }}><s.C t={t} /></AbsoluteFill>;
        })}
        {SC.map((s, i) => (t < LS(i) - 0.3 || (i < 11 && t > LS(i + 1) + 0.3)) ? null : <Lyric key={`l${i}`} t={t} i={i} acc={s.acc} />)}
      </AbsoluteFill>
      {endK > 0 && <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: endK }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: "-0.05em", color: "#fff", transform: `scale(${lerp(0.94, 1, endK)})` }}>visualx<span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>.mp4</span></div>
        </AbsoluteFill>}
      <Grain />
      <div style={{ position: "absolute", left: 44, bottom: 34, fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: "0.01em", color: "rgba(255,255,255,0.42)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>@visualx.mp4</div>
    </AbsoluteFill>
  );
};
