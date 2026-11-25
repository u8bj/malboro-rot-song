// „So erkennst du, ob jemand lügt“ – Apple/Selitx-style kinetic explainer. 1080×1920 @ 30 fps. Original visuals.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { SANS, Wd, cl, pr, sm, eo, lerp, spring, useT, SAFE, makeChunks } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
export const LG_OUTRO_T0 = W[W.length - 1].e + 0.6;
export const LG_DURATION_S = LG_OUTRO_T0 + 8.2;
const CX = (SAFE.left + SAFE.right) / 2, SW = SAFE.right - SAFE.left;
const C = { bg: "#f5f5f7", card: "#ffffff", ink: "#0b0b0f", grey: "#86868b", line: "#e5e5ea", blue: "#0a84ff", red: "#ff3b30", green: "#34c759", purple: "#8e5cff", bubbleIn: "#e9e9eb" };
const SHADOW = "0 30px 80px rgba(20,20,40,0.12), 0 8px 24px rgba(20,20,40,0.08)";

/* ───────── kinetic headline: words fly in exactly when spoken ───────── */
const Kinetic: React.FC<{ t: number; from: number; to: number; top: number; size?: number; accent?: Record<string, string>; out?: number }> = ({ t, from, to, top, size = 92, accent = {}, out }) => {
  const o = out !== undefined ? pr(t, out, out + 0.25) : 0;
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.22}px`, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.0,
      opacity: 1 - o, filter: o ? `blur(${o * 14}px)` : undefined, transform: `translateY(${-o * 30}px)` }}>
      {W.slice(from, to).map((w, k) => { const i = from + k; const s = spring(t, W[i].s - 0.06, 0.32); const key = w.w.replace(/[^\p{L}\d]/gu, "").toLowerCase(); const col = accent[key];
        return <span key={i} style={{ display: "inline-block", color: col ?? C.ink, opacity: cl(s * 1.6), transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + 0.15 * s})`, filter: s < 1 ? `blur(${(1 - cl(s)) * 10}px)` : undefined }}>{w.w}</span>; })}
    </div>
  );
};

/* ───────── light Apple-style captions (hidden while the headline already shows the words) ───────── */
const CHUNKS = makeChunks(W);
const COVERED: [number, number][] = [[7, 9], [9, 16], [18, 29], [29, 35], [40, 45], [45, 55], [55, 59], [79, 84], [90, 110], [110, 116], [138, 144], [151, 159]];
const LightCaptions: React.FC<{ t: number }> = ({ t }) => {
  const ci = CHUNKS.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === CHUNKS.length - 1 || t < W[CHUNKS[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  const c = CHUNKS[ci];
  if (COVERED.some(([a, b]) => c[0] >= a && c[0] < b) || t > W[c[c.length - 1]].e + 0.6) return null;
  const pop = spring(t, W[c[0]].s - 0.05, 0.3);
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 1250, display: "flex", justifyContent: "center", opacity: cl(pop * 2), transform: `translateY(${(1 - pop) * 20}px)` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 16px", padding: "16px 30px", borderRadius: 30, background: "rgba(255,255,255,0.85)", boxShadow: "0 10px 30px rgba(20,20,40,0.08)", fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: "-0.02em" }}>
        {c.map((i) => { const on = t >= W[i].s - 0.03; const cur = on && t < W[i].e + 0.08; return <span key={i} style={{ color: cur ? C.blue : on ? C.ink : "rgba(0,0,0,0.25)" }}>{W[i].w}</span>; })}
      </div>
    </div>
  );
};

/* ───────── UI atoms ───────── */
const Bubble: React.FC<{ t: number; t0: number; text: React.ReactNode; me?: boolean; size?: number; tone?: string }> = ({ t, t0, text, me = false, size = 40, tone }) => {
  const k = spring(t, t0, 0.42);
  if (k <= 0.001) return null;
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", margin: "10px 0" }}>
      <div style={{ maxWidth: "78%", padding: `${size * 0.42}px ${size * 0.6}px`, borderRadius: size * 0.9, background: tone ?? (me ? C.blue : C.bubbleIn), color: me || tone ? "#fff" : C.ink, fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.2,
        transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 30}px)`, transformOrigin: me ? "right bottom" : "left bottom", opacity: cl(k * 2) }}>{text}</div>
    </div>
  );
};
const Typing: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "inline-flex", gap: 10, padding: "22px 28px", borderRadius: 36, background: C.bubbleIn }}>
    {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: C.grey, opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * 5 - i * 0.7)) }} />)}
  </div>
);
const Card: React.FC<{ k: number; top: number; w?: number; children: React.ReactNode; pad?: number }> = ({ k, top, w = SW, children, pad = 40 }) => (
  <div style={{ position: "absolute", left: CX - w / 2, top, width: w, borderRadius: 48, background: C.card, boxShadow: SHADOW, padding: pad, boxSizing: "border-box", fontFamily: SANS, color: C.ink,
    transform: `translateY(${(1 - k) * 160}px) scale(${0.94 + 0.06 * k})`, opacity: cl(k * 1.8) }}>{children}</div>
);
const Tag: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 14, background: color, color: "#fff", fontWeight: 800, fontSize: 30, letterSpacing: "0.08em" }}>{children}</span>;

/* ───────── scenes (absolute song time) ───────── */
type S = { from: number; to: number; C: React.FC<{ t: number }> };
const SCENES: S[] = [
  { from: 0, to: at(9) - 0.15, C: ({ t }) => (<AbsoluteFill>
    <Card k={spring(t, 0, 0.45)} top={430} w={SW - 40}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: "linear-gradient(180deg,#a5adbd,#7d8597)", color: "#fff", fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>M</div>
        <div><div style={{ fontSize: 34, fontWeight: 800 }}>Max</div><div style={{ fontSize: 24, color: C.grey }}>online</div></div>
      </div>
      <div style={{ paddingTop: 20 }}>
        <Bubble t={t} t0={0.05} text="Wo warst du gestern? 👀" me />
        <Bubble t={t} t0={at(3) - 0.1} text="Ich war gestern zuhause." size={46} />
      </div>
    </Card>
    <Kinetic t={t} from={7} to={9} top={1010} size={150} accent={{ lügt: C.red }} />
  </AbsoluteFill>) },
  { from: at(9) - 0.15, to: at(29) - 0.15, C: ({ t }) => {
    const stamp = spring(t, at(16) - 0.05, 0.35);
    return (<AbsoluteFill>
      <Kinetic t={t} from={9} to={16} top={330} size={72} out={at(18) - 0.25} />
      <Kinetic t={t} from={18} to={29} top={330} size={66} accent={{ genauso: C.blue }} />
      <svg width={420} height={260} viewBox="-210 -130 420 260" style={{ position: "absolute", left: CX - 210, top: 640 }}>
        <path d="M-190 0 C-110 -120 110 -120 190 0 C110 120 -110 120 -190 0Z" fill="#fff" stroke={C.ink} strokeWidth={10} />
        <circle r={62} fill={C.ink} /><circle cx={20} cy={-18} r={18} fill="#fff" />
      </svg>
      {stamp > 0.01 && <div style={{ position: "absolute", left: CX - 230, top: 700, width: 460, padding: "18px 0", border: `10px solid ${C.red}`, borderRadius: 24, color: C.red, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: "0.06em",
        transform: `rotate(-10deg) scale(${lerp(2.2, 1, stamp)})`, opacity: cl(stamp * 2), background: "rgba(245,245,247,0.6)" }}>MYTHOS</div>}
    </AbsoluteFill>);
  } },
  { from: at(29) - 0.15, to: at(45) - 0.15, C: ({ t }) => {
    const n = Math.round(eo(pr(t, at(35), at(38))) * 54);
    const flip = pr(t, at(43) - 0.3, at(44) + 0.9);
    return (<AbsoluteFill>
      <Kinetic t={t} from={29} to={35} top={330} size={66} />
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 300, letterSpacing: "-0.06em", color: C.ink, lineHeight: 1, opacity: pr(t, at(35) - 0.2, at(35)) }}>
        {n}<span style={{ fontSize: 150, color: C.grey }}>%</span>
      </div>
      {t > at(40) - 0.2 && (() => { const sy = Math.cos(flip * Math.PI * 8); return <div style={{ position: "absolute", left: CX - 100, top: 900, width: 200, height: 200, borderRadius: 100, background: sy > 0 ? "radial-gradient(circle at 35% 30%, #fff3c4, #e0b94a 50%, #9c7a2c)" : "radial-gradient(circle at 35% 30%, #f1dc93, #c99d32 50%, #85651f)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        transform: `translateY(${-Math.sin(Math.PI * flip) * 90}px) scale(${spring(t, at(40) - 0.2, 0.4)}) scaleY(${Math.max(0.04, Math.abs(sy))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#7a5a16" }}>{sy > 0 ? "50/50" : "?"}</div>; })()}
      <Kinetic t={t} from={40} to={45} top={1150} size={60} accent={{ münzwurf: C.blue }} />
    </AbsoluteFill>);
  } },
  { from: at(45) - 0.15, to: at(55) - 0.15, C: ({ t }) => (<AbsoluteFill>
    <Kinetic t={t} from={45} to={55} top={340} size={78} accent={{ drei: C.blue, forschung: C.blue }} />
    {[0, 1, 2].map((i) => { const k = spring(t, at(48) + i * 0.12, 0.45); return (
      <div key={i} style={{ position: "absolute", left: CX - 330 + i * 230, top: 760, width: 200, height: 260, borderRadius: 40, background: C.card, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SANS, fontWeight: 900, fontSize: 150, color: [C.blue, C.purple, C.green][i], transform: `translateY(${(1 - k) * 300}px) rotate(${(i - 1) * 6 * k}deg)`, opacity: cl(k * 2) }}>{i + 1}</div>); })}
  </AbsoluteFill>) },
  { from: at(55) - 0.15, to: at(79) - 0.15, C: ({ t }) => {
    const cmp = spring(t, at(68) - 0.1, 0.45);
    return (<AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 300, textAlign: "center", fontFamily: SANS }}><Tag color={C.blue}>TRICK 1</Tag>
        <div style={{ fontWeight: 900, fontSize: 96, letterSpacing: "-0.045em", marginTop: 10, color: C.ink, opacity: pr(t, at(57) - 0.1, at(57) + 0.2) }}>Frag nach Details.</div></div>
      {cmp < 0.5 ? (
        <Card k={spring(t, at(60) - 0.2, 0.45)} top={560} w={SW - 40}>
          <Bubble t={t} t0={at(60) - 0.05} text="Was habt ihr gegessen?" me />
          <Bubble t={t} t0={at(64) - 0.05} text="Was lief im Fernsehen?" me />
        </Card>
      ) : (
        <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 560, display: "flex", gap: 24, transform: `scale(${0.9 + 0.1 * cmp})`, opacity: cmp }}>
          {[[C.green, "WAHRHEIT", "„Pizza Margherita, dann noch ’ne Serie bis 1 Uhr, war echt spannend…“"], [C.red, "LÜGE", "„Ähm… Pizza oder so.“"]].map(([c, l, txt], i) => (
            <div key={i} style={{ flex: 1, borderRadius: 40, background: C.card, boxShadow: SHADOW, padding: 30, fontFamily: SANS, opacity: i === 1 ? pr(t, at(75) - 0.2, at(75) + 0.1) : 1 }}>
              <Tag color={c as string}>{l}</Tag>
              <div style={{ marginTop: 20, fontSize: i ? 40 : 34, fontWeight: 600, lineHeight: 1.25, color: C.ink }}>{txt}</div>
              <div style={{ marginTop: 18, fontSize: 26, color: C.grey, fontWeight: 700 }}>{i ? "vage · wenig Details" : "viele Details"}</div>
            </div>))}
        </div>
      )}
    </AbsoluteFill>);
  } },
  { from: at(79) - 0.15, to: at(110) - 0.15, C: ({ t }) => {
    const icons = ["🏠", "🍕", "📺", "😴"];
    const fwd = eo(pr(t, at(81), at(85))), back = eo(pr(t, at(86), at(89) + 0.4));
    const lie = t > at(96) - 0.1, stuck = t > at(105) - 0.2;
    return (<AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 300, textAlign: "center", fontFamily: SANS }}><Tag color={C.purple}>TRICK 2</Tag>
        <div style={{ fontWeight: 900, fontSize: 88, letterSpacing: "-0.045em", marginTop: 10, color: C.ink, lineHeight: 1, opacity: pr(t, at(81) - 0.1, at(81) + 0.2) }}>Rückwärts<br />erzählen lassen.</div></div>
      <div style={{ position: "absolute", left: CX - 380, top: 640, width: 760, height: 8, borderRadius: 4, background: C.line }} />
      <div style={{ position: "absolute", left: CX - 380, top: 640, width: 760 * (back > 0 ? 1 - back : fwd), height: 8, borderRadius: 4, background: back > 0 ? C.purple : C.blue }} />
      {icons.map((e, i) => { const x = CX - 330 + i * 220; const shown = i / 3 <= (back > 0 ? 1 : fwd + 0.01); const broken = lie && !(t > at(100) + 0.3 && i % 2 === 0);
        return <div key={i} style={{ position: "absolute", left: x - 70, top: lie ? 720 + (broken ? Math.sin(i * 7 + t * 9) * 26 * pr(t, at(96), at(98)) : 0) : 720, width: 140, height: 140, borderRadius: 36, background: C.card, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76,
          opacity: shown ? 1 : 0.15, transform: `scale(${shown ? 1 : 0.8}) rotate(${lie && broken ? Math.sin(i * 3) * 14 * pr(t, at(96), at(98)) : 0}deg)`, filter: lie && i === 2 ? "grayscale(1) blur(2px)" : undefined }}>{lie && i === 2 ? "❓" : e}</div>; })}
      {back > 0 && back < 1 && <div style={{ position: "absolute", left: CX - 80, top: 900, fontFamily: SANS, fontWeight: 900, fontSize: 110, color: C.purple }}>◀◀</div>}
      <Kinetic t={t} from={90} to={96} top={920} size={60} out={at(96) - 0.25} accent={{ wahrheit: C.green }} />
      <Kinetic t={t} from={96} to={110} top={920} size={60} accent={{ lüge: C.red, stocken: C.red }} />
      {stuck && <div style={{ position: "absolute", left: CX - 60, top: 1080, width: 120, height: 120, transform: `rotate(${t * 360}deg)`, opacity: pr(t, at(105) - 0.2, at(105)) }}>
        <svg width={120} height={120} viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} stroke={C.line} strokeWidth={3} fill="none" /><path d="M12 3a9 9 0 0 1 9 9" stroke={C.red} strokeWidth={3} fill="none" strokeLinecap="round" /></svg></div>}
    </AbsoluteFill>);
  } },
  { from: at(110) - 0.15, to: at(136) - 0.15, C: ({ t }) => (<AbsoluteFill>
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 300, textAlign: "center", fontFamily: SANS }}><Tag color={C.green}>TRICK 3</Tag>
      <div style={{ fontWeight: 900, fontSize: 84, letterSpacing: "-0.045em", marginTop: 10, color: C.ink, lineHeight: 1, opacity: pr(t, at(112) - 0.1, at(112) + 0.2) }}>Die Frage, mit der<br />niemand rechnet.</div></div>
    <Card k={spring(t, at(119) - 0.3, 0.45)} top={640} w={SW - 40}>
      <Bubble t={t} t0={at(119) - 0.1} text="Wo lag dein Handy, als du geschlafen hast?" me size={44} />
      {t > at(124) && t < at(134) && <div style={{ marginTop: 14 }}><Typing t={t} /></div>}
      <Bubble t={t} t0={at(134)} text="äh… 😳" size={52} />
    </Card>
  </AbsoluteFill>) },
  { from: at(136) - 0.15, to: at(151) - 0.15, C: ({ t }) => {
    const diff = spring(t, at(144) - 0.1, 0.45);
    return (<AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 300, textAlign: "center", fontFamily: SANS }}><Tag color={C.red}>⚠︎ ACHTUNG</Tag></div>
      <Kinetic t={t} from={138} to={144} top={400} size={76} accent={{ kein: C.red }} out={at(144) - 0.25} />
      <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 400, display: "flex", flexDirection: "column", gap: 20, opacity: diff, transform: `translateY(${(1 - diff) * 60}px)` }}>
        {[["Montag", "„Ich war allein zuhause.“", false], ["Mittwoch", "„Ich war mit Tom zuhause.“", true]].map(([d, s, changed], i) => (
          <div key={i} style={{ borderRadius: 36, background: C.card, boxShadow: SHADOW, padding: "26px 32px", fontFamily: SANS }}>
            <div style={{ fontSize: 26, color: C.grey, fontWeight: 700 }}>{d as string}</div>
            <div style={{ fontSize: 46, fontWeight: 700, marginTop: 6, color: C.ink }}>{changed ? <>„Ich war <span style={{ background: "rgba(255,59,48,0.15)", color: C.red, padding: "0 8px", borderRadius: 10 }}>mit Tom</span> zuhause.“</> : s}</div>
          </div>))}
        <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.ink, marginTop: 10, opacity: pr(t, at(149), at(150)) }}>Die Geschichte <span style={{ color: C.red }}>ändert sich</span> 👀</div>
      </div>
    </AbsoluteFill>);
  } },
  { from: at(151) - 0.15, to: 999, C: ({ t }) => (<AbsoluteFill>
    <div style={{ position: "absolute", left: SAFE.left, width: SW, top: 480, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: "-0.05em", lineHeight: 0.98, color: C.ink,
      transform: `scale(${0.85 + 0.15 * spring(t, at(155) - 0.1, 0.45)})`, opacity: pr(t, at(155) - 0.2, at(155) + 0.1) * (1 - pr(t, LG_OUTRO_T0, LG_OUTRO_T0 + 0.3)) }}>Wen testest<br /><span style={{ color: C.blue }}>du</span> zuerst? 👇</div>
  </AbsoluteFill>) },
];

export const Luege: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 15% 10%, #e7efff, transparent 70%), radial-gradient(45% 35% at 90% 85%, #f3e8ff, transparent 70%)" }} />
      <Audio src={staticFile("luege/voice.mp3")} />
      <Audio src={staticFile("luege/beat.mp3")} loop volume={0.14} />
      {[[0.05, "send", 0.5], [at(3) - 0.1, "msg", 0.6], [at(16) - 0.05, "alert", 0.5], [at(35), "ding", 0.4], [at(43) - 0.3, "coin", 0.7], [at(60) - 0.05, "send", 0.45], [at(64) - 0.05, "send", 0.45], [at(86), "rewind", 0.7], [at(96), "alert", 0.4], [at(119) - 0.1, "send", 0.5], [at(134), "msg", 0.6], [at(137), "alert", 0.5], [at(155), "ding", 0.5]].map(([s, n, v], i) =>
        <Sequence key={i} from={fr(s as number)}><Audio src={staticFile(`luege/${n}.mp3`)} volume={v as number} /></Sequence>)}
      {SCENES.slice(1).map((s, i) => <Sequence key={"sw" + i} from={fr(s.from)}><Audio src={staticFile("luege/swoosh.mp3")} volume={0.35} /></Sequence>)}
      {[LG_OUTRO_T0, LG_OUTRO_T0 + 1.6, LG_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"p" + i} from={fr(s)}><Audio src={staticFile("luege/pop.mp3")} volume={0.4} /></Sequence>)}

      {/* scenes with soft zoom-blur transitions (Apple-like) */}
      {SCENES.map((s, i) => {
        if (t < s.from - 0.01 || t >= s.to + 0.3) return null;
        const inn = i === 0 ? 1 : eo(pr(t, s.from, s.from + 0.35)), out = pr(t, s.to, s.to + 0.3);
        return <AbsoluteFill key={i} style={{ opacity: inn * (1 - out), transform: `translateY(70px) scale(${lerp(1.08, 1, inn) * lerp(1, 0.92, out)})`, filter: inn < 1 || out > 0 ? `blur(${(1 - inn) * 16 + out * 16}px)` : undefined }}><s.C t={t} /></AbsoluteFill>;
      })}

      {/* progress bar – keeps people watching */}
      <div style={{ position: "absolute", left: SAFE.left + 40, width: SW - 80, top: SAFE.top + 10, height: 10, borderRadius: 5, background: "rgba(0,0,0,0.08)", opacity: 1 - pr(t, LG_OUTRO_T0 - 0.3, LG_OUTRO_T0) }}>
        <div style={{ width: `${cl(t / LG_OUTRO_T0) * 100}%`, height: "100%", borderRadius: 5, background: C.blue }} />
      </div>

      {t < LG_OUTRO_T0 && <LightCaptions t={t} />}
      <Outro t={t} t0={LG_OUTRO_T0} likeTitle="Hat dir das Video gefallen?" />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(0,0,0,0.3)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

export const LuegeCover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 15% 10%, #e7efff, transparent 70%), radial-gradient(45% 35% at 90% 85%, #f3e8ff, transparent 70%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontWeight: 900, fontSize: 130, letterSpacing: "-0.05em", lineHeight: 0.95, color: C.ink }}>Lügt er<br /><span style={{ color: C.red }}>gerade?</span></div>
    <div style={{ position: "absolute", left: 120, right: 120, top: 760, borderRadius: 48, background: "#fff", boxShadow: SHADOW, padding: 40 }}>
      <div style={{ display: "inline-block", padding: "22px 32px", borderRadius: 40, background: C.bubbleIn, fontSize: 50, fontWeight: 600 }}>Ich war gestern zuhause.</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, textAlign: "center", fontWeight: 900, fontSize: 72, color: C.blue }}>3 Tricks, die wirklich helfen</div>
  </AbsoluteFill>
);
