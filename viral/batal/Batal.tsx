// BATAL SHOP – hype ad (remix of the shop's own clip) with ElevenLabs voice-over. 1080×1920 @ 30 fps, ~25.6 s.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, random, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { SANS, cl, pr, eo, lerp, spring, useT, Grain } from "../shared/StoryKit";

type Wd = { w: string; s: number; e: number };
const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
const RED = "#ff1f3d", RED2 = "#c4001d", GOLD = "#ffd23f";
// line starts (word indices): intro 0 · galaxy 8 · v-bucks 20 · skins 32 · cta 44
const L = [0, at(8), at(20), at(32), at(44), W[W.length - 1].e];
export const BATAL_S = W[W.length - 1].e + 0.9;
const IMPACT = "drop-shadow(0 8px 0 rgba(0,0,0,0.55))";

/* helpers */
const kick = (t: number, t0: number, dur = 0.35) => (t >= t0 ? Math.exp(-(t - t0) * (7 / dur)) : 0);
const shakeAt = (t: number, hits: number[], amp = 22) => hits.reduce((a, h) => { const k = kick(t, h, 0.4); return [a[0] + Math.sin(t * 91 + h) * amp * k, a[1] + Math.cos(t * 77 + h) * amp * k]; }, [0, 0]);

/* footage segment from the shop's clip, slowed to fit the line, with punch-zooms */
const Footage: React.FC<{ t: number; from: number; to: number; srcFrom: number; srcTo: number; punches: number[]; zoom0?: number; zoom1?: number; origin?: string }> = ({ t, from, to, srcFrom, srcTo, punches, zoom0 = 1.08, zoom1 = 1.22, origin = "50% 45%" }) => {
  const { fps } = useVideoConfig(); const rate = (srcTo - srcFrom) / (to - from);
  const z = lerp(zoom0, zoom1, eo(pr(t, from, to))) + punches.reduce((a, p) => a + 0.09 * kick(t, p, 0.45), 0);
  return (
    <Sequence from={Math.round(from * fps)} durationInFrames={Math.round((to - from + 0.4) * fps)} layout="none">
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: origin }}>
        <OffthreadVideo src={staticFile("batal/src.mp4")} startFrom={Math.round(srcFrom * 30)} playbackRate={rate} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

/* big slam word */
const Slam: React.FC<{ t: number; t0: number; text: string; y: number; size?: number; color?: string; stroke?: boolean; out?: number; rot?: number }> = ({ t, t0, text, y, size = 170, color = "#fff", stroke, out, rot = -4 }) => {
  const k = spring(t, t0, 0.32); if (k <= 0.001) return null; const o = out ? pr(t, out, out + 0.15) : 0; if (o >= 1) return null;
  const s = lerp(2.4, 1, cl(k));
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1, fontStyle: "italic",
    color: stroke ? "transparent" : color, WebkitTextStroke: stroke ? `6px ${color}` : undefined, transform: `scale(${s}) rotate(${rot}deg)`, opacity: cl(k * 3) * (1 - o),
    filter: `${IMPACT} drop-shadow(${6 * (1 - cl(k))}px 0 0 rgba(255,0,60,0.8)) drop-shadow(${-6 * (1 - cl(k))}px 0 0 rgba(0,220,255,0.8))`, textShadow: stroke ? undefined : `0 0 40px ${color}66` }}>{text}</div>;
};

/* glitch transition overlay */
const Glitch: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const k = 1 - pr(t, t0 - 0.08, t0 + 0.22); if (k <= 0 || t < t0 - 0.08) return null;
  return (<AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "#fff", opacity: 0.55 * k }} />
    {Array.from({ length: 9 }, (_, i) => { const y = random(`gy${t0}${i}`) * 1920, h = 20 + random(`gh${t0}${i}`) * 90; return <div key={i} style={{ position: "absolute", left: (random(`gx${t0}${i}${Math.floor(t * 30)}`) - 0.5) * 200, top: y, width: 1080, height: h, background: i % 2 ? "rgba(255,31,61,0.55)" : "rgba(0,220,255,0.4)", opacity: k, mixBlendMode: "screen" }} />; })}
  </AbsoluteFill>);
};

/* speed lines */
const Speed: React.FC<{ t: number; k: number }> = ({ t, k }) => k <= 0.01 ? null : (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: k, mixBlendMode: "screen" }}>
    {Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2 + random(`sa${i}`) * 0.2; const r0 = 380 + ((t * 2400 + random(`sr${i}`) * 900) % 900); return <line key={i} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 260)} y2={900 + Math.sin(a) * (r0 + 260)} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} />; })}
  </svg>
);

/* coins burst on "gestackt" */
const Coins: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null; const age = t - t0;
  return (<>{Array.from({ length: 34 }, (_, i) => { const a = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * 2.8; const sp = 900 + random(`cs${i}`) * 1100; const x = 540 + Math.cos(a) * sp * age, y = 1000 + Math.sin(a) * sp * age + 2600 * age * age; const s = 50 + random(`cz${i}`) * 50; const spin = Math.cos(age * 14 + i);
    if (y > 2100) return null;
    return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff, #cfe0f0 40%, #7f97ad)", border: "3px solid #e9f3ff", transform: `scaleX(${Math.max(0.15, Math.abs(spin))})`, boxShadow: "0 0 18px rgba(160,220,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: s * 0.5, color: "#5b7d99" }}>V</div>; })}</>);
};

/* TikTok captions */
const CH = (() => { const out: number[][] = []; let c: number[] = []; W.forEach((w, i) => { c.push(i); if (/[.,!?]$/.test(w.w) || c.length >= 3) { out.push(c); c = []; } }); if (c.length) out.push(c); return out; })();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ci = CH.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === CH.length - 1 || t < W[CH[k + 1][0]].s - 0.05)); if (ci < 0) return null;
  const c = CH[ci]; if (t > W[c[c.length - 1]].e + 0.4) return null; const pop = spring(t, W[c[0]].s - 0.05, 0.28);
  return (<div style={{ position: "absolute", left: 60, right: 150, top: 1240, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", fontFamily: SANS, fontWeight: 900, fontSize: 72, lineHeight: 1.05, textTransform: "uppercase", transform: `scale(${0.8 + 0.2 * cl(pop)})` }}>
    {c.map((i) => { const on = t >= W[i].s - 0.03, cur = on && t < W[i].e + 0.06; return <span key={i} style={{ color: cur ? GOLD : on ? "#fff" : "rgba(255,255,255,0.35)", WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: "0 6px 0 rgba(0,0,0,0.6)" }}>{W[i].w.replace(/[.,!?]$/, "")}</span>; })}
  </div>);
};

/* own CTA finale */
const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: `linear-gradient(160deg, ${RED}, ${RED2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${RED}aa, inset 0 -8px 0 rgba(0,0,0,0.25)`, fontFamily: SANS, fontWeight: 900, fontSize: size * 0.62, color: "#fff", transform: "rotate(-8deg)" }}>B</div>
);
const CTA: React.FC<{ t: number }> = ({ t }) => {
  const a = L[4]; const shop = at(48); const link = at(50); const hol = at(54);
  const [dx, dy] = shakeAt(t, [shop, link, hol], 26);
  const lk = spring(t, shop - 0.05, 0.4), pill = spring(t, link - 0.05, 0.4);
  return (<AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 42%, ${RED2}, #2a0006 70%, #0a0002)`, transform: `translate(${dx}px,${dy}px)` }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>{Array.from({ length: 18 }, (_, i) => { const r = ((i / 18) * 360 + (t - a) * 25) * Math.PI / 180; return <polygon key={i} points={`540,820 ${540 + Math.cos(r) * 2000},${820 + Math.sin(r) * 2000} ${540 + Math.cos(r + 0.09) * 2000},${820 + Math.sin(r + 0.09) * 2000}`} fill="#ff4058" />; })}</svg>
    <div style={{ position: "absolute", left: 540 - 140, top: 380, transform: `scale(${lerp(3, 1, cl(spring(t, a + 0.1, 0.4)))})`, opacity: cl(spring(t, a + 0.1, 0.4) * 3) }}><Logo size={280} /></div>
    <Slam t={t} t0={a + 0.05} text="WORAUF" y={720} size={130} out={shop - 0.1} />
    <Slam t={t} t0={at(46)} text="WARTEST DU?" y={860} size={110} color={GOLD} out={shop - 0.1} />
    {lk > 0.01 && <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontStyle: "italic", lineHeight: 0.9, transform: `scale(${lerp(2.2, 1, cl(lk))})`, opacity: cl(lk * 3) }}>
      <div style={{ fontSize: 230, color: "#fff", WebkitTextStroke: `8px ${RED}`, paintOrder: "stroke", filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.5))", letterSpacing: "-0.02em" }}>BATAL</div>
      <div style={{ fontSize: 170, color: "#fff", filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.5))" }}>SHOP</div>
    </div>}
    {pill > 0.01 && <div style={{ position: "absolute", left: 140, right: 230, top: 1150, height: 140, borderRadius: 70, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: RED2,
      transform: `scale(${lerp(0.5, 1, cl(pill)) * (1 + 0.04 * Math.sin(t * 12))})`, opacity: cl(pill * 3), boxShadow: "0 0 60px rgba(255,255,255,0.6)" }}>
      <span style={{ display: "inline-block", transform: `translateY(${-Math.abs(Math.sin(t * 8)) * 12}px)` }}>↑</span> LINK IN DER BIO</div>}
  </AbsoluteFill>);
};

export const Batal: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig(); const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const cuts = [L[1], L[2], L[3], L[4]];
  const [sx, sy] = shakeAt(t, [at(2), at(12), at(13), at(15), at(22), at(26), at(29), at(35), at(38), at(43)], 16);
  const speed = Math.max(kick(t, at(2), 0.6), kick(t, at(11), 0.6), kick(t, at(24), 0.6), kick(t, at(43), 0.6));
  const sfx: [number, string, number][] = [
    [0, "riser", 0.5], [at(2) - 0.02, "impact", 0.9],
    ...cuts.flatMap((c) => [[c - 0.15, "whoosh", 0.7], [c - 0.02, "glitch", 0.5]] as [number, string, number][]),
    [at(12), "impact", 0.6], [at(13), "impact", 0.6], [at(15), "impact", 0.7],
    [at(22), "impact", 0.6], [at(26), "coins", 0.9], [at(29), "impact", 0.7],
    [at(35), "camera", 0.7], [at(38), "camera", 0.7], [at(43), "impact", 0.8],
    [L[4] - 1.2, "riser", 0.6], [at(48), "impact", 1.0], [at(50), "impact", 0.8], [at(54), "glitch", 0.5],
  ];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("batal/voice.mp3")} />
      <Audio src={staticFile("batal/bed_long.mp3")} volume={(f) => { const s = f / fps; return 0.32 * Math.min(1, s / 0.3) * Math.min(1, (BATAL_S - s) / 0.6); }} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={fr(s)}><Audio src={staticFile(`batal/${n}.mp3`)} volume={v} /></Sequence>)}

      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {/* 1 · intro */}
        {t < L[1] + 0.1 && <Footage t={t} from={0} to={L[1]} srcFrom={0} srcTo={3.4} punches={[at(2), at(5)]} zoom0={1.02} zoom1={1.18} origin="50% 22%" />}
        {/* 2 · galaxy */}
        {t >= L[1] - 0.05 && t < L[2] + 0.1 && <Footage t={t} from={L[1]} to={L[2]} srcFrom={3.5} srcTo={7.0} punches={[at(11), at(12), at(13), at(15)]} zoom0={1.25} zoom1={1.05} origin="50% 40%" />}
        {/* 3 · v-bucks */}
        {t >= L[2] - 0.05 && t < L[3] + 0.1 && <Footage t={t} from={L[2]} to={L[3]} srcFrom={7.0} srcTo={10.9} punches={[at(22), at(26), at(29)]} zoom0={1.1} zoom1={1.3} origin="50% 55%" />}
        {/* 4 · rare skins */}
        {t >= L[3] - 0.05 && t < L[4] + 0.1 && <Footage t={t} from={L[3]} to={L[4]} srcFrom={10.95} srcTo={12.55} punches={[at(34), at(35), at(38), at(43)]} zoom0={1.15} zoom1={1.02} origin="50% 55%" />}
        {/* 5 · CTA */}
        {t >= L[4] - 0.05 && <CTA t={t} />}

        {/* kinetic slams over footage */}
        <Slam t={t} t0={at(12)} text="RARE" y={1000} size={190} color={GOLD} out={at(13) - 0.02} />
        <Slam t={t} t0={at(13)} text="OG" y={980} size={240} color="#fff" out={at(15) - 0.02} rot={5} />
        <Slam t={t} t0={at(15)} text="CLEAN" y={1000} size={190} color="#7df9ff" out={at(16) + 0.4} />
        <Slam t={t} t0={at(26)} text="GESTACKT" y={420} size={150} color={GOLD} out={at(29) - 0.05} />
        <Slam t={t} t0={at(29)} text="READY TO PLAY" y={430} size={110} color="#7df9ff" out={L[3] - 0.1} rot={-3} />
        <Slam t={t} t0={at(43)} text="& NOCH VIEL MEHR" y={860} size={100} color={GOLD} out={L[4] - 0.05} />
        <Coins t={t} t0={at(26)} />
        {[at(35), at(38)].map((f, i) => <AbsoluteFill key={i} style={{ background: "#fff", opacity: 0.5 * kick(t, f, 0.25), pointerEvents: "none" }} />)}
        <Speed t={t} k={speed} />
      </AbsoluteFill>

      {cuts.map((c, i) => <Glitch key={i} t={t} t0={c} />)}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.7) 100%)`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: RED, opacity: 0.18 * Math.max(kick(t, at(2), 0.3), kick(t, at(48), 0.3)), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain />
    </AbsoluteFill>
  );
};
