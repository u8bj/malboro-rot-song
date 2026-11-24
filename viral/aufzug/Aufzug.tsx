// "Stockwerk -7" – original 2nd-person horror/mystery short for @entscheidungsnacht. 1080×1920 @ 30 fps.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { K, SANS, Wd, pr, sm, eo, lerp, spring, shake, useT, Grain, Vignette, Chip, HudRow, makeChunks, Captions, ChoiceCards, EndAB, Watermark } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const CH = makeChunks(W);
const at = (i: number) => W[i].s;
export const AZ_OUTRO_T0 = W[W.length - 1].e + 0.4;
export const AZ_DURATION_S = AZ_OUTRO_T0 + 8.2;

/* floor shown on the elevator display at time t */
const floorAt = (t: number) => (t < at(20) ? "3" : t < at(24) ? "E" : t < at(26) ? "-1" : t < at(33) ? "-2" : t < at(40) ? "-5" : "-7");

/* ───────── elevator interior ───────── */
const Cabin: React.FC<{ t: number; doors?: number; zoom?: number; flicker?: number; hideUp?: number }> = ({ t, doors = 0, zoom = 1, flicker = 0, hideUp = 0 }) => {
  const fl = floorAt(t); const neg = fl.startsWith("-");
  const lamp = 1 - flicker * (Math.sin(t * 37) > 0.6 ? 0.7 : 0);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 900px", background: "#0a0f1b" }}>
      {/* back wall brushed steel */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, #1a2234 0 6px, #1d2638 6px 12px)", opacity: 0.9 }} />
      {/* doors (centre) */}
      <div style={{ position: "absolute", left: 190, top: 620, width: 700, height: 1180, background: "#05070c" }}>
        {doors > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(40% 30% at 50% 70%, rgba(255,181,71,0.25), transparent 70%)", opacity: doors }} />}
      </div>
      <div style={{ position: "absolute", left: 190 - doors * 340, top: 620, width: 350, height: 1180, background: "linear-gradient(90deg,#3a4458,#56617a 60%,#3a4458)", borderRight: "3px solid #1a2030" }} />
      <div style={{ position: "absolute", left: 540 + doors * 340, top: 620, width: 350, height: 1180, background: "linear-gradient(90deg,#3a4458,#56617a 40%,#3a4458)", borderLeft: "3px solid #1a2030" }} />
      {/* floor display */}
      <div style={{ position: "absolute", left: 390, top: 440, width: 300, height: 150, borderRadius: 18, background: "#05070c", border: "4px solid #2a3348", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: '"Courier New", monospace', fontWeight: 800, fontSize: 120, color: neg ? K.red : K.amber, textShadow: `0 0 30px ${neg ? K.red : K.amber}`, opacity: lamp }}>{fl}</div>
      {/* button panel on the right */}
      <div style={{ position: "absolute", left: 930, top: 1000, width: 110, height: 420, borderRadius: 18, background: "#2a3348", padding: 16, boxSizing: "border-box" }}>
        {["▲", "E", "▼"].map((b, i) => <div key={i} style={{ width: 78, height: 78, borderRadius: 39, margin: "12px 0", background: "#11161f", border: "3px solid #4a5570", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SANS, fontWeight: 800, fontSize: 34, color: i === 1 && t > at(13) ? K.amber : "#8a94aa", boxShadow: i === 1 && t > at(13) ? `0 0 20px ${K.amber}` : undefined, opacity: i === 0 ? 1 - hideUp : 1 }}>{b}</div>)}
      </div>
      {/* ceiling light + hatch */}
      <div style={{ position: "absolute", left: 140, top: 60, width: 800, height: 120, borderRadius: 12, background: `rgba(255,236,200,${0.55 * lamp})`, boxShadow: `0 0 120px rgba(255,220,160,${0.35 * lamp})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 35% at 50% 5%, rgba(255,220,160,${0.18 * lamp}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

/* ───────── scenes ───────── */
const S_Lobby: React.FC<{ t: number }> = ({ t }) => {
  const enter = eo(pr(t, at(5), at(9) + 0.4));
  return (<AbsoluteFill>
    <Cabin t={t} doors={1 - enter} zoom={lerp(1.35, 1.0, enter)} />
    <AbsoluteFill style={{ background: "#000", opacity: 1 - pr(t, 0, 0.5) }} />
  </AbsoluteFill>);
};
const S_Descend: React.FC<{ t: number }> = ({ t }) => {
  const [sx, sy] = shake(t, at(21), 8, 1.2);
  return (<AbsoluteFill style={{ transform: `translate(${sx + Math.sin(t * 40) * 1.5}px,${sy}px)` }}>
    <Cabin t={t} zoom={lerp(1.0, 1.22, pr(t, at(15), at(27) + 0.5))} flicker={pr(t, at(21), at(23))} />
  </AbsoluteFill>);
};
const S_Section: React.FC<{ t: number }> = ({ t }) => {
  const y = lerp(820, 1500, eo(pr(t, at(28) - 0.2, at(34))));
  const x = pr(t, at(31), at(32) + 0.3);
  return (<AbsoluteFill style={{ background: "#060a13" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={0} y1={i * 100} x2={1080} y2={i * 100} stroke="#0f1a2e" />)}
      {/* hotel above ground */}
      <rect x={300} y={300} width={480} height={700} fill="#13203a" stroke="#2a3957" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, f) => Array.from({ length: 4 }, (_, c) => <rect key={`${f}${c}`} x={330 + c * 112} y={330 + f * 110} width={70} height={60} rx={6} fill={(f + c) % 3 ? "#1d2c4b" : K.amber} opacity={0.8} />))}
      <text x={540} y={280} textAnchor="middle" fill={K.ink} fontFamily={SANS} fontWeight={800} fontSize={44}>HOTEL</text>
      <line x1={0} y1={1000} x2={1080} y2={1000} stroke="#4a5570" strokeWidth={6} />
      <text x={40} y={985} fill="#8a94aa" fontFamily={SANS} fontWeight={700} fontSize={30}>BODEN</text>
      {/* nothing below… */}
      <rect x={490} y={300} width={100} height={1500} fill="none" stroke="#2a3957" strokeWidth={3} strokeDasharray="12 10" />
      <rect x={498} y={y - 70} width={84} height={140} rx={10} fill={K.amber} style={{ filter: `drop-shadow(0 0 20px ${K.amber})` }} />
      {/* „kein Keller“ */}
      <g opacity={x}><line x1={300} y1={1080} x2={780} y2={1760} stroke={K.red} strokeWidth={14} /><line x1={780} y1={1080} x2={300} y2={1760} stroke={K.red} strokeWidth={14} />
        <text x={540} y={1840} textAnchor="middle" fill={K.red} fontFamily={SANS} fontWeight={900} fontSize={60}>KEIN KELLER</text></g>
    </svg>
  </AbsoluteFill>);
};
const S_Phone: React.FC<{ t: number }> = ({ t }) => {
  const inn = spring(t, at(35) - 0.2, 0.55);
  const bars = Math.max(0, 4 - Math.floor(pr(t, at(35), at(39)) * 5));
  return (<AbsoluteFill>
    <AbsoluteFill style={{ filter: "blur(8px) brightness(0.6)" }}><Cabin t={t} zoom={1.4} /></AbsoluteFill>
    <div style={{ position: "absolute", left: 240, top: 420, width: 600, height: 1000, borderRadius: 70, background: "#0b0f18", border: "10px solid #2a3348", transform: `translateY(${(1 - inn) * 1300}px) rotate(${lerp(10, -3, inn)}deg)`, boxShadow: "0 40px 100px rgba(0,0,0,0.7)", overflow: "hidden", fontFamily: SANS, color: K.ink }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "40px 50px", fontSize: 34, fontWeight: 700 }}>
        <span>3:0{Math.min(9, Math.floor((t - at(35)) * 1.2) + 2)}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>{[0, 1, 2, 3].map((b) => <span key={b} style={{ width: 12, height: 14 + b * 8, borderRadius: 3, background: b < bars ? K.ink : "rgba(255,255,255,0.18)" }} />)}</span>
      </div>
      <div style={{ marginTop: 220, textAlign: "center", fontSize: 64, fontWeight: 800, color: bars === 0 ? K.red : K.ink }}>{bars === 0 ? "Kein Netz" : "Suche…"}</div>
      <div style={{ marginTop: 20, textAlign: "center", fontSize: 34, opacity: 0.6 }}>Notrufe nicht verfügbar</div>
    </div>
  </AbsoluteFill>);
};
const S_Open: React.FC<{ t: number }> = ({ t }) => (
  <Cabin t={t} doors={eo(pr(t, at(42), at(45) + 0.3))} zoom={lerp(1.15, 1.05, pr(t, at(40), at(45)))} />
);
const Corridor: React.FC<{ t: number; door7?: number; knock?: number; openK?: number; push?: number; under?: number; feet?: number }> = ({ t, door7 = 0, knock = 0, openK = 0, push = 0, under = 0, feet = 0 }) => {
  const kx = knock ? Math.sin(t * 70) * 8 * knock : 0;
  return (<AbsoluteFill style={{ background: "#05080f", transform: `scale(${1 + push})`, transformOrigin: "540px 820px" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M0 0 L430 700 L430 1000 L0 1920Z" fill="#101a2e" /><path d="M1080 0 L650 700 L650 1000 L1080 1920Z" fill="#0c1526" />
      <path d="M0 1920 L430 1000 L650 1000 L1080 1920Z" fill="#0a0f1c" /><path d="M0 0 L430 700 L650 700 L1080 0Z" fill="#080d18" />
      {/* side doors */}
      {[0, 1, 2].map((i) => { const k = 1 - i * 0.3; return <g key={i}><rect x={40 + i * 140} y={500 + i * 110} width={120 * k} height={600 * k} fill="#151f36" /><rect x={1040 - i * 140 - 120 * k} y={500 + i * 110} width={120 * k} height={600 * k} fill="#121b30" /></g>; })}
      {/* carpet pattern */}
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={540 - (900 - i * 110) * 0.5} y1={1920 - i * 115} x2={540 + (900 - i * 110) * 0.5} y2={1920 - i * 115} stroke="#3a1414" strokeWidth={3} opacity={0.6} />)}
    </svg>
    {/* door 7 at the end */}
    <div style={{ position: "absolute", left: 470 + kx, top: 740, width: 140, height: 260, background: "#2a1d12", border: "4px solid #3a2a1a", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${openK * 100}%`, background: "rgba(255,236,200,0.95)", boxShadow: `0 0 ${80 * openK}px rgba(255,220,160,0.9)` }} />
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: SANS, fontWeight: 900, fontSize: 54, color: K.amber, opacity: door7, textShadow: `0 0 20px ${K.amber}` }}>7</div>
    </div>
    {/* light leaking under the door – and the shadow of someone standing behind it */}
    {under > 0 && <div style={{ position: "absolute", left: 474, top: 992, width: 132, height: 10, background: `rgba(255,236,200,${under})`, boxShadow: `0 0 ${30 * under}px rgba(255,220,160,${0.9 * under})` }}>
      {[22, 74].map((x, i) => <div key={i} style={{ position: "absolute", left: x, top: -2, width: 36 * feet, height: 14, background: "#05070c", marginLeft: 18 * (1 - feet) }} />)}
    </div>}
    <div style={{ position: "absolute", left: 470, top: 690, width: 140, height: 30, borderRadius: 6, background: K.amber, opacity: 0.25 + 0.75 * door7, filter: "blur(2px)", boxShadow: `0 0 60px 20px rgba(255,181,71,${0.4 * door7})` }} />
    <AbsoluteFill style={{ background: `radial-gradient(20% 18% at 50% 45%, rgba(255,181,71,${0.15 + 0.25 * door7 + 0.5 * openK}), transparent 70%)` }} />
  </AbsoluteFill>);
};
const S_Card: React.FC<{ t: number }> = ({ t }) => {
  const inn = spring(t, at(58) - 0.2, 0.6); const photo = pr(t, at(64), at(66) + 0.2);
  return (<AbsoluteFill>
    <AbsoluteFill style={{ filter: "blur(10px) brightness(0.5)" }}><Corridor t={t} door7={1} /></AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 640, width: 800, height: 500, borderRadius: 36, background: "linear-gradient(135deg,#e9edf5,#b9c2d3)", boxShadow: "0 50px 100px rgba(0,0,0,0.7)", transform: `perspective(1400px) rotateX(${lerp(65, 28, inn)}deg) rotateZ(-8deg) scale(${lerp(0.7, 1, inn)})`, fontFamily: SANS, color: "#1a2030", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 40, top: 36, fontSize: 40, fontWeight: 900, letterSpacing: "0.1em" }}>ZIMMER 7</div>
      <div style={{ position: "absolute", right: 40, top: 40, width: 90, height: 64, borderRadius: 10, background: "linear-gradient(135deg,#d9c27a,#a88a3c)" }} />
      <div style={{ position: "absolute", left: 40, top: 140, width: 240, height: 300, borderRadius: 18, background: "#2a3348", overflow: "hidden" }}>
        <svg width={240} height={300} style={{ filter: `blur(${lerp(14, 6, photo)}px)`, opacity: photo }}><circle cx={120} cy={120} r={60} fill="#8a94aa" /><path d="M20 300 C 30 200 210 200 220 300Z" fill="#8a94aa" /></svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", color: K.yellow, fontWeight: 900, fontSize: 40, opacity: photo }}>DU?</div>
      </div>
      <div style={{ position: "absolute", left: 320, top: 180, fontSize: 34, color: "#4a5570" }}>Gast</div>
      <div style={{ position: "absolute", left: 320, top: 224, width: 380, height: 26, borderRadius: 8, background: "#4a5570", opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 320, top: 300, fontSize: 34, color: "#4a5570" }}>Ebene</div>
      <div style={{ position: "absolute", left: 320, top: 344, fontSize: 52, fontWeight: 900, color: K.red }}>−7</div>
    </div>
  </AbsoluteFill>);
};
const S_Behind: React.FC<{ t: number }> = ({ t }) => {
  const close = eo(pr(t, at(69), at(72) + 0.4)); const missing = pr(t, at(75), at(78));
  const [sx, sy] = shake(t, at(72), 16);
  return (<AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
    {t < at(73) ? <Cabin t={t} doors={1 - close} zoom={1.05} /> : <Cabin t={t} doors={0} zoom={lerp(1.6, 2.4, pr(t, at(73), at(78)))} hideUp={missing} />}
  </AbsoluteFill>);
};
const S_Knock: React.FC<{ t: number }> = ({ t }) => {
  const k0 = at(82) - 0.05; const knocks = [k0, k0 + 0.75, k0 + 1.5];
  const knock = knocks.reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 9) : 0), 0);
  return <Corridor t={t} door7={1} knock={knock} push={lerp(0.2, 0.55, pr(t, at(79), at(85)))} />;
};
const S_Two: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(85) - 0.1, 0.5);
  return (<AbsoluteFill style={{ background: "#060a13", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 420, color: K.ink, transform: `scale(${0.6 + 0.4 * k})`, opacity: k, marginTop: -260, textShadow: `0 0 60px rgba(255,255,255,0.25)` }}>2</div>
  </AbsoluteFill>);
};
const S_Choice: React.FC<{ t: number }> = ({ t }) => (
  <ChoiceCards t={t} tA={at(89)} tB={at(98)}
    a={{ title: "Karte nehmen & Zimmer 7 öffnen", icon: <svg width={220} height={170} viewBox="0 0 220 170"><rect x={30} y={30} width={160} height={100} rx={14} fill="#c9d0de" /><rect x={45} y={50} width={50} height={60} rx={6} fill="#4a5570" /><text x={140} y={95} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill={K.red}>7</text></svg> }}
    b={{ title: "Durch die Dachluke klettern", icon: <svg width={220} height={170} viewBox="0 0 220 170"><rect x={20} y={10} width={180} height={30} fill="#2a3348" /><rect x={70} y={10} width={80} height={30} fill="#05070c" stroke={K.red} strokeWidth={4} /><path d="M110 150 V60 M90 80 l20-20 20 20" stroke={K.red} strokeWidth={8} fill="none" strokeLinecap="round" /></svg> }} />
);
const S_Shadow: React.FC<{ t: number }> = ({ t }) => <Corridor t={t} door7={1} under={sm(pr(t, at(112), at(116)))} feet={sm(pr(t, at(119), at(120) + 0.35))} push={lerp(0.3, 1.2, eo(pr(t, at(108), at(125))))} />;

const SCENES: { from: number; to: number; C: React.FC<{ t: number }> }[] = [
  { from: 0, to: at(15) - 0.1, C: S_Lobby },
  { from: at(15) - 0.1, to: at(28) - 0.2, C: S_Descend },
  { from: at(28) - 0.2, to: at(33) - 0.1, C: S_Section },
  { from: at(33) - 0.1, to: at(35) - 0.2, C: S_Descend },
  { from: at(35) - 0.2, to: at(40) - 0.1, C: S_Phone },
  { from: at(40) - 0.1, to: at(46) - 0.1, C: S_Open },
  { from: at(46) - 0.1, to: at(58) - 0.2, C: ({ t }) => <Corridor t={t} door7={sm(pr(t, at(54), at(57)))} push={lerp(0, 0.2, pr(t, at(46), at(58)))} /> },
  { from: at(58) - 0.2, to: at(67) - 0.1, C: S_Card },
  { from: at(67) - 0.1, to: at(79) - 0.1, C: S_Behind },
  { from: at(79) - 0.1, to: at(85) - 0.1, C: S_Knock },
  { from: at(85) - 0.1, to: at(89) - 0.15, C: S_Two },
  { from: at(89) - 0.15, to: at(108) - 0.1, C: S_Choice },
  { from: at(108) - 0.1, to: at(125) - 0.15, C: S_Shadow },
  { from: at(125) - 0.15, to: 999, C: ({ t }) => <EndAB t={t} t0={at(125)} arrowAt={at(134)} hideAt={AZ_OUTRO_T0} bg={<Corridor t={t} door7={1} under={1} feet={1} push={1.2} />} /> },
];

export const Aufzug: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const fl = floorAt(t);
  const bars = t < at(35) ? 4 : Math.max(0, 4 - Math.floor(pr(t, at(35), at(39)) * 5));
  const hudOp = pr(t, 0.6, 1.1) * (1 - pr(t, at(125) - 0.3, at(125)));
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Audio src={staticFile("aufzug/voice.mp3")} />
      <Audio src={staticFile("aufzug/drone.mp3")} volume={0.55} />
      <Sequence from={fr(at(15))} durationInFrames={fr(at(46) - at(15))}><Audio src={staticFile("aufzug/hum.mp3")} loop volume={0.3} /></Sequence>
      {[at(20), at(42) - 0.15].map((s, i) => <Sequence key={"d" + i} from={fr(s)}><Audio src={staticFile("aufzug/ding.mp3")} volume={0.7} /></Sequence>)}
      {[at(28), at(41), at(64), at(120), at(124)].map((s, i) => <Sequence key={"h" + i} from={fr(s - 0.1)}><Audio src={staticFile("aufzug/hit.mp3")} volume={0.55} /></Sequence>)}
      <Sequence from={fr(at(69))}><Audio src={staticFile("aufzug/close.mp3")} volume={0.8} /></Sequence>
      <Sequence from={fr(at(82) - 0.15)}><Audio src={staticFile("aufzug/knock.mp3")} volume={0.95} /></Sequence>
      <Sequence from={fr(at(85))}><Audio src={staticFile("aufzug/heart.mp3")} volume={0.7} /></Sequence>
      {[AZ_OUTRO_T0, AZ_OUTRO_T0 + 1.6, AZ_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"p" + i} from={fr(s)}><Audio src={staticFile("aufzug/pop.mp3")} volume={0.5} /></Sequence>)}

      {SCENES.map((s, i) => (t >= s.from && t < s.to ? <AbsoluteFill key={i}><s.C t={t} /></AbsoluteFill> : null))}
      {SCENES.slice(1).map((s, i) => { const d = t - s.from; return d >= 0 && d < 0.12 ? <AbsoluteFill key={"fl" + i} style={{ background: "#fff", opacity: 0.16 * (1 - d / 0.12) }} /> : null; })}
      <HudRow op={hudOp}>
        <Chip label="UHRZEIT" value={`03:0${Math.min(9, Math.floor(t / 7))}`} />
        <Chip label="STOCKWERK" value={fl} color={fl.startsWith("-") ? K.red : K.ink} pulse={fl.startsWith("-") ? 0.35 : 0} op={pr(t, at(15), at(15) + 0.3)} />
        <Chip label="EMPFANG" value={<span style={{ display: "inline-flex", gap: 5, alignItems: "flex-end", height: 40 }}>{[0, 1, 2, 3].map((b) => <span key={b} style={{ width: 9, height: 12 + b * 8, borderRadius: 2, background: b < bars ? K.ink : "rgba(255,255,255,0.18)" }} />)}</span>} color={bars ? K.ink : K.red} op={pr(t, at(35) - 0.5, at(35))} pulse={bars === 0 ? 0.4 : 0} />
      </HudRow>
      {t < AZ_OUTRO_T0 && <Captions t={t} W={W} chunks={CH} y={t > at(125) - 0.15 ? 1180 : 1330} />}
      <Outro t={t} t0={AZ_OUTRO_T0} />
      <Vignette />
      <Grain />
      <Watermark />
    </AbsoluteFill>
  );
};

/* cover */
export const AufzugCover: React.FC = () => {
  const t = at(41) + 0.5;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <AbsoluteFill style={{ filter: "brightness(0.8)" }}><Cabin t={t} doors={0.35} zoom={1.05} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,11,20,0.85) 0%, rgba(7,11,20,0.15) 30%, rgba(7,11,20,0.15) 55%, rgba(7,11,20,0.9) 80%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SANS }}>
        <div style={{ display: "inline-block", padding: "12px 30px", borderRadius: 16, background: K.red, color: "#fff", fontWeight: 900, fontSize: 54, letterSpacing: "0.08em" }}>TEIL 1</div>
        <div style={{ marginTop: 24, fontWeight: 900, fontSize: 150, lineHeight: 0.95, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>STOCKWERK<br /><span style={{ color: K.red }}>−7</span></div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1330, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 84, color: K.yellow, lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,0.85)" }}>Das Hotel hat keinen Keller.</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#fff" }}><span style={{ color: K.blue }}>A</span> oder <span style={{ color: K.red }}>B</span>?</div>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};
