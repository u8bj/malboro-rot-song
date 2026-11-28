// BATAL SHOP – modern black/red ad (English VO). 1080×1920 @ 30 fps, ~25 s. Footage = the shop's own clip, cropped into new UI cards.
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, random, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { cl, pr, eo, lerp, spring, useT, Grain } from "../shared/StoryKit";

type Wd = { w: string; s: number; e: number };
const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
export const BATAL_EN_S = W[W.length - 1].e + 1.45;
const L = [0, at(10), at(20), at(32), at(42)];
const DISP = '"Unbounded", "Inter", sans-serif', GROT = '"Space Grotesk", "Inter", sans-serif', MONO = '"JetBrains Mono", monospace';
const RED = "#ff1f3d", DRED = "#7a0012", INK = "#f4f4f4", BG = "#050505";
const kick = (t: number, t0: number, d = 0.35) => (t >= t0 ? Math.exp(-(t - t0) * (7 / d)) : 0);
const shakeAt = (t: number, hits: number[], amp = 18) => hits.reduce((a, h) => { const k = kick(t, h, 0.4); return [a[0] + Math.sin(t * 91 + h) * amp * k, a[1] + Math.cos(t * 77 + h) * amp * k]; }, [0, 0]);
const eio = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };

/* ───────── building blocks ───────── */
// mask reveal: text slides up from behind a clipping line
const Reveal: React.FC<{ t: number; t0: number; children: React.ReactNode; dur?: number; out?: number; style?: React.CSSProperties }> = ({ t, t0, children, dur = 0.35, out, style }) => {
  const k = eio(pr(t, t0 - 0.05, t0 - 0.05 + dur)); const o = out !== undefined ? eio(pr(t, out, out + 0.25)) : 0;
  if (k <= 0) return null;
  return <div style={{ overflow: "hidden", ...style }}><div style={{ transform: `translateY(${(1 - k) * 105 - o * 105}%)` }}>{children}</div></div>;
};
const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "0.14em", color: INK, textTransform: "uppercase", ...style }}>{children}</div>;
const Typer: React.FC<{ t: number; t0: number; text: string; cps?: number; style?: React.CSSProperties }> = ({ t, t0, text, cps = 38, style }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps))); if (t < t0) return null;
  return <Mono style={style}>{text.slice(0, n)}<span style={{ opacity: Math.floor(t * 4) % 2 ? 1 : 0, color: RED }}>▍</span></Mono>;
};

// background: grid + red glow + scan line
const Backdrop: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: BG }}>
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at ${50 + Math.sin(t * 0.7) * 18}% ${38 + Math.cos(t * 0.5) * 10}%, rgba(255,31,61,0.28), transparent 70%), radial-gradient(50% 35% at 50% 105%, rgba(122,0,18,0.55), transparent 70%)` }} />
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${(t * 40) % 90}px` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: ((t * 520) % 2300) - 200, height: 140, background: "linear-gradient(180deg, transparent, rgba(255,31,61,0.10), transparent)" }} />
  </AbsoluteFill>
);

// HUD: top bar (brand, section index) – inside TikTok safe area
const HUD: React.FC<{ t: number; sec: number }> = ({ t, sec }) => (
  <>
    <div style={{ position: "absolute", left: 60, right: 150, top: 236, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Mono style={{ fontSize: 24, display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 12, height: 12, borderRadius: 6, background: RED, boxShadow: `0 0 12px ${RED}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }} />BATAL.SHOP</Mono>
      <Mono style={{ fontSize: 24, opacity: 0.7 }}>{sec ? `0${sec} / 04` : "LIVE"}</Mono>
    </div>
    <div style={{ position: "absolute", left: 60, right: 150, top: 286, height: 2, background: "rgba(255,255,255,0.12)" }}><div style={{ width: `${cl(t / L[4]) * 100}%`, height: "100%", background: RED }} /></div>
  </>
);

// diagonal marquee band
const Band: React.FC<{ t: number; y: number; text: string; rot?: number; k?: number; dark?: boolean }> = ({ t, y, text, rot = -7, k = 1, dark }) => (
  <div style={{ position: "absolute", left: -200, right: -200, top: y, height: 96, background: dark ? "#0b0b0b" : RED, transform: `rotate(${rot}deg) scaleY(${k})`, overflow: "hidden", display: "flex", alignItems: "center", border: dark ? `2px solid ${RED}` : undefined }}>
    <div style={{ whiteSpace: "nowrap", fontFamily: DISP, fontWeight: 900, fontSize: 52, color: dark ? RED : "#0b0b0b", letterSpacing: "0.02em", transform: `translateX(${-((t * 260) % 900)}px)` }}>{Array.from({ length: 6 }, () => text).join("  ✦  ")}</div>
  </div>
);

// cropped footage card
const FootCard: React.FC<{ t: number; from: number; to: number; src0: number; src1: number; x: number; y: number; w: number; h: number; cy: number; scale: number; enterFrom?: "left" | "right" | "bottom"; punches?: number[] }> = ({ t, from, to, src0, src1, x, y, w, h, cy, scale, enterFrom = "right", punches = [] }) => {
  const { fps } = useVideoConfig(); const k = eio(pr(t, from - 0.05, from + 0.45)); const rate = (src1 - src0) / (to - from);
  const off = enterFrom === "right" ? [1200 * (1 - k), 0] : enterFrom === "left" ? [-1200 * (1 - k), 0] : [0, 900 * (1 - k)];
  const z = punches.reduce((a, p) => a + 0.05 * kick(t, p, 0.4), 1) * lerp(1.06, 1, eio(pr(t, from, to)));
  const vw = 1080 * scale, vh = 1920 * scale;
  return (
    <div style={{ position: "absolute", left: x + off[0], top: y + off[1], width: w, height: h, borderRadius: 40, overflow: "hidden", border: `2px solid ${RED}`, boxShadow: `0 0 0 6px rgba(255,31,61,0.12), 0 0 80px rgba(255,31,61,0.35), 0 40px 80px rgba(0,0,0,0.7)`, transform: `scale(${z}) rotate(${(1 - k) * (enterFrom === "left" ? -6 : 6)}deg)`, filter: k < 1 ? `blur(${(1 - k) * 12}px)` : undefined, background: "#000" }}>
      <Sequence from={Math.round((from - 0.1) * fps)} durationInFrames={Math.round((to - from + 0.6) * fps)} layout="none">
        <div style={{ position: "absolute", left: w / 2 - vw / 2, top: h / 2 - cy * scale, width: vw, height: vh }}>
          <OffthreadVideo src={staticFile("batal/src.mp4")} startFrom={Math.round(src0 * 30)} playbackRate={rate} muted style={{ width: "100%", height: "100%" }} />
        </div>
      </Sequence>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.65))" }} />
      {/* corner brackets */}
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cyy], i) => <div key={i} style={{ position: "absolute", [cx ? "right" : "left"]: 18, [cyy ? "bottom" : "top"]: 18, width: 44, height: 44, borderColor: "#fff", borderStyle: "solid", borderWidth: `${cyy ? 0 : 3}px ${cx ? 3 : 0}px ${cyy ? 3 : 0}px ${cx ? 0 : 3}px`, opacity: 0.8 } as React.CSSProperties} />)}
    </div>
  );
};

// pill tag with check
const Pill: React.FC<{ t: number; t0: number; text: string; x: number; y: number; red?: boolean }> = ({ t, t0, text, x, y, red = true }) => {
  const k = spring(t, t0 - 0.04, 0.3); if (k <= 0.001) return null;
  return <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 18px", borderRadius: 60, background: red ? RED : "#0b0b0b", border: red ? "none" : `2px solid ${RED}`,
    transform: `scale(${lerp(1.8, 1, cl(k))}) rotate(${(1 - cl(k)) * -8}deg)`, opacity: cl(k * 3), boxShadow: `0 10px 40px rgba(255,31,61,0.45)` }}>
    <span style={{ width: 46, height: 46, borderRadius: 23, background: red ? "#0b0b0b" : RED, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={26} height={26} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
    <span style={{ fontFamily: DISP, fontWeight: 900, fontSize: 54, color: red ? "#0b0b0b" : INK, letterSpacing: "0.01em" }}>{text}</span>
  </div>;
};

// red slab wipe between sections
const Wipe: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const p = pr(t, t0 - 0.32, t0 + 0.18); if (p <= 0 || p >= 1) return null;
  const x = lerp(-1700, 1300, eio(p));
  return (<AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: x, top: -400, width: 900, height: 2800, background: RED, transform: "rotate(14deg)", boxShadow: `0 0 120px ${RED}` }} />
    <div style={{ position: "absolute", left: x - 260, top: -400, width: 120, height: 2800, background: "#fff", transform: "rotate(14deg)", opacity: 0.9 }} />
  </AbsoluteFill>);
};

// V-coins burst
const Coins: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null; const age = t - t0;
  return (<>{Array.from({ length: 30 }, (_, i) => { const a = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * 2.7; const sp = 800 + random(`cs${i}`) * 1000; const x = 540 + Math.cos(a) * sp * age, y = 900 + Math.sin(a) * sp * age + 2400 * age * age; const s = 46 + random(`cz${i}`) * 44; if (y > 2100) return null;
    return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff, #cfe0f0 40%, #7f97ad)", border: "3px solid #e9f3ff", transform: `scaleX(${Math.max(0.15, Math.abs(Math.cos(age * 14 + i)))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 900, fontSize: s * 0.42, color: "#5b7d99" }}>V</div>; })}</>);
};

const Logo: React.FC<{ size: number; draw?: number; fill?: number }> = ({ size, draw = 1, fill = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${30 * fill}px ${RED})` }}>
    <rect x={8} y={8} width={84} height={84} rx={22} fill={RED} fillOpacity={fill} stroke={RED} strokeWidth={4} strokeDasharray={340} strokeDashoffset={340 * (1 - draw)} transform="rotate(-8 50 50)" />
    <text x={50} y={70} textAnchor="middle" fontFamily={DISP} fontWeight={900} fontSize={58} fill="#fff" opacity={fill} transform="rotate(-8 50 50)">B</text>
  </svg>
);

/* ───────── sections ───────── */
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const draw = eo(pr(t, 0.05, 0.6)), fill = eo(pr(t, at(2) - 0.05, at(2) + 0.15));
  return (<>
    <div style={{ position: "absolute", left: 540 - 130, top: 380, transform: `scale(${1 + 0.15 * kick(t, at(2), 0.4)})` }}><Logo size={260} draw={draw} fill={fill} /></div>
    <Reveal t={t} t0={0.05} style={{ position: "absolute", left: 60, right: 150, top: 700, textAlign: "center" }}><Mono style={{ fontSize: 34, color: "rgba(255,255,255,0.75)" }}>Welcome to</Mono></Reveal>
    <Reveal t={t} t0={at(2)} style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 190, color: INK, letterSpacing: "-0.02em", lineHeight: 1 }}>BATAL</div></Reveal>
    <Reveal t={t} t0={at(3)} style={{ position: "absolute", left: 0, right: 0, top: 955, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 190, color: "transparent", WebkitTextStroke: `4px ${RED}`, letterSpacing: "-0.02em", lineHeight: 1 }}>SHOP</div></Reveal>
    <div style={{ position: "absolute", left: 180, right: 180, top: 1170, height: 6, background: RED, transform: `scaleX(${eio(pr(t, at(4) - 0.1, at(9)))})`, transformOrigin: "left", boxShadow: `0 0 20px ${RED}` }} />
    <div style={{ position: "absolute", left: 60, right: 150, top: 1200, textAlign: "center" }}><Typer t={t} t0={at(4)} text="Your #1 Fortnite account shop" cps={22} style={{ fontSize: 30 }} /></div>
    <Band t={t} y={1460} text="RARE SKINS · V-BUCKS · OG ACCOUNTS" k={eio(pr(t, at(6), at(7) + 0.2))} />
  </>);
};

const Galaxy: React.FC<{ t: number }> = ({ t }) => {
  const a = L[1]; const got = spring(t, at(17) - 0.05, 0.35);
  return (<>
    <Reveal t={t} t0={a} style={{ position: "absolute", left: 60, top: 330 }}><Mono style={{ color: RED }}>[01] — Galaxy</Mono></Reveal>
    <FootCard t={t} from={a} to={L[2]} src0={3.5} src1={7.0} x={110} y={390} w={860} h={980} cy={830} scale={1.0} punches={[at(14), at(15), at(16)]} />
    <Reveal t={t} t0={at(10)} style={{ position: "absolute", left: 140, top: 1240 }}><div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 40, color: INK, opacity: 0.85 }}>WANT THE</div></Reveal>
    <Reveal t={t} t0={at(12)} style={{ position: "absolute", left: 130, top: 1285 }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 118, color: INK, letterSpacing: "-0.02em", textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>GALAXY</div></Reveal>
    <Pill t={t} t0={at(14)} text="RARE" x={660} y={470} />
    <Pill t={t} t0={at(15)} text="OG" x={660} y={580} red={false} />
    <Pill t={t} t0={at(16)} text="CLEAN" x={660} y={690} />
    {got > 0.01 && <div style={{ position: "absolute", left: -40, right: -40, top: 1060, padding: "22px 0", background: RED, transform: `rotate(-6deg) scaleX(${cl(got)})`, transformOrigin: "left", textAlign: "center", fontFamily: DISP, fontWeight: 900, fontSize: 96, color: "#0b0b0b", boxShadow: `0 20px 60px rgba(255,31,61,0.5)` }}>WE'VE GOT IT</div>}
  </>);
};

const VBucks: React.FC<{ t: number }> = ({ t }) => {
  const a = L[2];
  return (<>
    <Reveal t={t} t0={a} style={{ position: "absolute", left: 60, top: 330 }}><Mono style={{ color: RED }}>[02] — V-Bucks</Mono></Reveal>
    <FootCard t={t} from={a} to={L[3]} src0={7.0} src1={10.8} x={110} y={600} w={860} h={760} cy={560} scale={1.05} enterFrom="left" punches={[at(22), at(27), at(29)]} />
    <Reveal t={t} t0={at(20)} style={{ position: "absolute", left: 60, right: 150, top: 390 }}><div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 42, color: INK, opacity: 0.85 }}>LOW ON</div></Reveal>
    <Reveal t={t} t0={at(22)} style={{ position: "absolute", left: 50, right: 100, top: 440 }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 112, color: RED, letterSpacing: "-0.02em" }}>V-BUCKS?</div></Reveal>
    <Coins t={t} t0={at(27)} />
    <Pill t={t} t0={at(27)} text="STACKED" x={150} y={1230} />
    <Pill t={t} t0={at(29)} text="READY TO PLAY" x={150} y={1330} red={false} />
  </>);
};

const Skins: React.FC<{ t: number }> = ({ t }) => {
  const a = L[3]; const tiles = [[0, 0], [1, 0], [0, 1], [1, 1]]; const times = [at(33), at(34), at(35), at(36)];
  const more = eio(pr(t, at(38) - 0.1, at(39)));
  return (<>
    <Reveal t={t} t0={a} style={{ position: "absolute", left: 60, top: 330 }}><Mono style={{ color: RED }}>[03] — Rare Skins</Mono></Reveal>
    <FootCard t={t} from={a} to={L[4]} src0={10.95} src1={12.55} x={90} y={390} w={900} h={1100} cy={890} scale={0.9} enterFrom="bottom" punches={times} />
    {/* tile scan highlights over the 2×2 grid */}
    {tiles.map(([cx, cy], i) => { const k = kick(t, times[i], 0.5); return k > 0.02 ? <div key={i} style={{ position: "absolute", left: 90 + 70 + cx * 395, top: 390 + 95 + cy * 480, width: 370, height: 455, borderRadius: 24, border: `5px solid ${RED}`, boxShadow: `0 0 60px ${RED}, inset 0 0 60px rgba(255,31,61,0.4)`, opacity: k }} /> : null; })}
    <Reveal t={t} t0={at(33)} out={at(38) - 0.2} style={{ position: "absolute", left: 0, right: 0, top: 1390, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 64, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.95), 0 0 2px #000" }}>NOBODY ELSE <span style={{ color: RED }}>HAS</span></div></Reveal>
    {more > 0 && <Band t={t} y={1390} text="& SO MUCH MORE" k={more} rot={-5} />}
  </>);
};

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const a = L[4]; const press = pr(t, at(50) + 0.1, at(50) + 0.3);
  return (<>
    <Reveal t={t} t0={a + 0.05} out={at(48) - 0.2} style={{ position: "absolute", left: 60, right: 150, top: 520, textAlign: "center" }}><div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 56, color: INK }}>SO WHAT ARE YOU</div></Reveal>
    <Reveal t={t} t0={at(46)} out={at(48) - 0.2} style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 120, color: RED }}>WAITING FOR?</div></Reveal>
    {t > at(48) - 0.15 && <div style={{ position: "absolute", left: 540 - 110, top: 360, transform: `scale(${lerp(2.5, 1, cl(spring(t, at(48) - 0.1, 0.4)))})`, opacity: cl(spring(t, at(48) - 0.1, 0.4) * 3) }}><Logo size={220} /></div>}
    <Reveal t={t} t0={at(48)} style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 200, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>BATAL</div></Reveal>
    <Reveal t={t} t0={at(49)} style={{ position: "absolute", left: 0, right: 0, top: 840, textAlign: "center" }}><div style={{ fontFamily: DISP, fontWeight: 900, fontSize: 200, color: "transparent", WebkitTextStroke: `5px ${RED}`, lineHeight: 1, letterSpacing: "-0.02em" }}>SHOP</div></Reveal>
    {t > at(50) - 0.1 && <div style={{ position: "absolute", left: 150, right: 240, top: 1100, height: 140, borderRadius: 70, background: RED, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: DISP, fontWeight: 900, fontSize: 56, color: "#0b0b0b",
      transform: `scale(${lerp(0.6, 1, cl(spring(t, at(50) - 0.1, 0.35))) * (1 - 0.06 * Math.sin(Math.PI * press))})`, boxShadow: `0 0 ${60 + 40 * Math.abs(Math.sin(t * 5))}px ${RED}` }}>
      LINK IN BIO <svg width={50} height={50} viewBox="0 0 24 24" style={{ transform: `translate(${Math.abs(Math.sin(t * 6)) * 6}px, ${-Math.abs(Math.sin(t * 6)) * 6}px)` }}><path d="M7 17 17 7M9 7h8v8" stroke="#0b0b0b" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>}
    <div style={{ position: "absolute", left: 60, right: 150, top: 1290, textAlign: "center" }}><Typer t={t} t0={at(53)} text="Get your account now" cps={26} style={{ fontSize: 36, color: INK }} /></div>
  </>);
};

export const BatalEN: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig(); const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const sec = t < L[1] ? 0 : t < L[2] ? 1 : t < L[3] ? 2 : t < L[4] ? 3 : 4;
  const hits = [at(2), at(14), at(15), at(16), at(17), at(22), at(27), at(29), at(33), at(48), at(50)];
  const [sx, sy] = shakeAt(t, hits, 14);
  const scenes = [Intro, Galaxy, VBucks, Skins, CTA];
  const sfx: [number, string, number][] = [
    [0, "riser", 0.4], [at(2) - 0.02, "impact", 0.9], [at(6), "whoosh", 0.4],
    ...[1, 2, 3, 4].flatMap((i) => [[L[i] - 0.35, "whoosh", 0.8], [L[i] - 0.05, "impact", 0.6], [L[i] - 0.02, "glitch", 0.35]] as [number, string, number][]),
    [at(14), "impact", 0.55], [at(15), "impact", 0.55], [at(16), "impact", 0.6], [at(17), "glitch", 0.5],
    [at(22), "impact", 0.5], [at(27), "coins", 0.9], [at(29), "impact", 0.6],
    [at(33), "camera", 0.6], [at(34), "camera", 0.5], [at(35), "camera", 0.5], [at(36), "camera", 0.5], [at(38), "whoosh", 0.5],
    [at(48) - 0.02, "impact", 1.0], [at(50), "impact", 0.8], [at(53), "glitch", 0.4],
  ];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Audio src={staticFile("batal/voice_en.mp3")} />
      <Audio src={staticFile("batal/bed_long.mp3")} volume={(f) => { const s = f / fps; return 0.3 * Math.min(1, s / 0.4) * Math.min(1, (BATAL_EN_S - s) / 0.7); }} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={fr(s)}><Audio src={staticFile(`batal/${n}.mp3`)} volume={v} /></Sequence>)}
      <Backdrop t={t} />
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {scenes.map((S, i) => { const a = i === 0 ? -1 : L[i] - 0.15, b = i === 4 ? 999 : L[i + 1] - 0.05; if (t < a || t >= b) return null; return <AbsoluteFill key={i}><S t={t} /></AbsoluteFill>; })}
      </AbsoluteFill>
      {[1, 2, 3, 4].map((i) => <Wipe key={i} t={t} t0={L[i]} />)}
      <AbsoluteFill style={{ background: RED, opacity: 0.22 * Math.max(kick(t, at(2), 0.3), kick(t, at(48), 0.3)), mixBlendMode: "screen", pointerEvents: "none" }} />
      <HUD t={t} sec={sec} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 60%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
      <Grain />
    </AbsoluteFill>
  );
};
