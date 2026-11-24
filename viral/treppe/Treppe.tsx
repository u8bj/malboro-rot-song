// „Treppenhaus“ – original horror short for @entscheidungsnacht. 1080×1920 @ 30 fps. Original story, original creature design.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { SANS, Wd, cl, pr, sm, eo, lerp, spring, useT, SAFE, Grain } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
export const TR_OUTRO_T0 = W[W.length - 1].e + 0.7;
export const TR_DURATION_S = TR_OUTRO_T0 + 8.2;
const CX = (SAFE.left + SAFE.right) / 2;
const C = { wall: "#1b2233", wall2: "#141a28", step: "#262e42", stepTop: "#323c55", rail: "#4a3a2a", amber: "#ffad33", red: "#ff2d2d", ink: "#eef1f7", moon: "#9fb7ff" };

/* light on/off intervals (story) */
const ON: [number, number][] = [[at(20) + 0.25, at(35)], [at(44) + 0.25, at(70)], [at(73), at(107)]];
const lightAt = (t: number) => { for (const [a, b] of ON) { if (t >= a && t < b) { const inn = pr(t, a, a + 0.35); const flick = t - a < 0.35 ? (Math.sin((t - a) * 90) > 0 ? 1 : 0.2) : 1; return inn * flick * (1 - pr(t, b - 0.08, b)); } } return t >= at(139) ? 0.0 : 0; };
const flashOn = (t: number) => t > at(110) && t < at(139);
const timerAt = (t: number) => {
  const segs: [number, number, number, number][] = [[ON[0][0], 30, ON[0][1], 0], [ON[1][0], 30, ON[1][1], 0]];
  for (const [a, va, b, vb] of segs) if (t >= a && t < b) return lerp(va, vb, (t - a) / (b - a));
  const K: [number, number][] = [[ON[2][0], 30], [at(99), 12], [at(105), 10], [at(106), 5], [at(107), 0]];
  if (t >= K[0][0] && t < K[K.length - 1][0]) for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0]));
  return -1;
};
const floorAt = (t: number) => { const F: [number, number][] = [[at(28), 1], [at(30), 2], [at(37), 3], [at(90), 4], [at(92), 5], [at(96), 6], [at(124), 7], [at(129), 8]]; let f = 0; for (const [s, v] of F) if (t >= s) f = v; return f; };

/* ───────── original creature: emaciated, too-long arms, head tilted ───────── */
const Creature: React.FC<{ s?: number; eyes?: number; rim?: string; twitch?: number }> = ({ s = 1, eyes = 0, rim = C.moon, twitch = 0 }) => (
  <g transform={`scale(${s}) rotate(${twitch * 4})`}>
    <path d="M-34 -330 C-60 -330 -66 -280 -48 -250 C-30 -222 34 -222 48 -250 C66 -282 54 -330 30 -334 Z" fill="#030406" transform="rotate(-14 0 -280)" />
    <path d="M-12 -230 L-16 -190 L16 -190 L12 -230Z" fill="#030406" />
    <path d="M-70 -190 C-40 -200 40 -200 70 -190 L60 0 L40 160 L18 160 L6 10 L-6 10 L-18 160 L-40 160 L-60 0Z" fill="#030406" />
    {/* arms reaching far too low */}
    <path d="M-66 -186 C-110 -120 -120 -20 -112 120 L-96 210" stroke="#030406" strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M66 -186 C112 -120 122 -20 114 120 L100 214" stroke="#030406" strokeWidth={22} fill="none" strokeLinecap="round" />
    {[-1, 1].map((sd) => [0, 1, 2, 3].map((f) => <line key={`${sd}${f}`} x1={sd * 98} y1={212} x2={sd * (88 + f * 9)} y2={262 + f * 4} stroke="#030406" strokeWidth={6} strokeLinecap="round" />))}
    {/* rim light */}
    <path d="M70 -190 L60 0 L40 160" stroke={rim} strokeWidth={4} fill="none" opacity={0.55} />
    <path d="M48 -250 C66 -282 54 -330 30 -334" stroke={rim} strokeWidth={4} fill="none" opacity={0.6} transform="rotate(-14 0 -280)" />
    {eyes > 0 && <g opacity={eyes} transform="rotate(-14 0 -280)"><circle cx={-18} cy={-282} r={6} fill="#e8f0ff" /><circle cx={18} cy={-282} r={6} fill="#e8f0ff" /><circle cx={-18} cy={-282} r={18} fill="rgba(220,235,255,0.25)" /><circle cx={18} cy={-282} r={18} fill="rgba(220,235,255,0.25)" /></g>}
  </g>
);

/* ───────── stairwell (looking up one flight to the landing) ───────── */
const Stairwell: React.FC<{ t: number; figure?: { x: number; y: number; s: number; eyes?: number } | null; window?: number; brokenSwitch?: boolean; zoom?: number; door?: number }> = ({ t, figure, window: win = 0, brokenSwitch = false, zoom = 1, door = 0 }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${CX}px 900px` }}>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.wall2}, ${C.wall})` }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {/* landing wall + window */}
      <rect x={180} y={380} width={720} height={480} fill="#1f2738" />
      <rect x={560} y={440} width={240} height={300} rx={8} fill="#0c1222" stroke="#3a445c" strokeWidth={10} />
      <circle cx={720} cy={510} r={30} fill={C.moon} opacity={0.6} />
      <line x1={680} y1={440} x2={680} y2={740} stroke="#3a445c" strokeWidth={8} />
      {/* reflection in the window */}
      {win > 0 && <g opacity={win} transform="translate(620 720)"><Creature s={0.32} rim={C.moon} /></g>}
      {/* apartment door on landing */}
      <rect x={250} y={470} width={180} height={390} fill="#3a2c20" stroke="#4d3b2b" strokeWidth={8} />
      <rect x={300} y={520} width={80} height={28} rx={4} fill="#d6c7a8" /><circle cx={405} cy={680} r={8} fill="#b8a46a" />
      {/* light switch (glowing orange, German stairwell style) */}
      <rect x={470} y={600} width={48} height={64} rx={8} fill={brokenSwitch ? "#2a2a2a" : C.amber} opacity={brokenSwitch ? 1 : 0.85 + Math.sin(t * 4) * 0.15} style={{ filter: brokenSwitch ? undefined : `drop-shadow(0 0 14px ${C.amber})` }} />
      {brokenSwitch && <path d="M470 600 L518 664 M518 600 L470 664" stroke={C.red} strokeWidth={6} />}
      {/* stairs coming towards the viewer */}
      {Array.from({ length: 9 }, (_, i) => { const y = 860 + i * 70, w = 520 + i * 70; return <g key={i}><rect x={CX - w / 2 + 40} y={y} width={w} height={20} fill={C.stepTop} /><rect x={CX - w / 2 + 40} y={y + 20} width={w} height={50} fill={C.step} /></g>; })}
      {/* banister */}
      <path d="M180 1500 L330 860 L330 380" stroke={C.rail} strokeWidth={18} fill="none" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={185 + i * 19} y1={1480 - i * 82} x2={185 + i * 19} y2={1420 - i * 82} stroke="#33291e" strokeWidth={6} />)}
      {/* figure */}
      {figure && <g transform={`translate(${figure.x} ${figure.y})`}><Creature s={figure.s} eyes={figure.eyes ?? 0} rim={C.moon} twitch={Math.sin(t * 13) > 0.9 ? 1 : 0} /></g>}
    </svg>
    {door > 0 && <AbsoluteFill style={{ background: `radial-gradient(25% 18% at 30% 35%, rgba(255,220,160,${0.7 * door}), transparent 70%)` }} />}
  </AbsoluteFill>
);

/* darkness + moonlight + flashlight cone */
const Dark: React.FC<{ t: number; light: number; flash: boolean; aim?: [number, number] }> = ({ t, light, flash, aim = [CX, 900] }) => {
  const d = 1 - light;
  if (d <= 0.01) return null;
  if (flash) {
    const jit = [Math.sin(t * 7) * 18, Math.cos(t * 5) * 14];
    const flick = Math.sin(t * 31) > 0.93 ? 0.6 : 1;
    return <AbsoluteFill style={{ background: `radial-gradient(circle 330px at ${aim[0] + jit[0]}px ${aim[1] + jit[1]}px, rgba(0,0,0,${0.05 * flick}) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.96) 100%)`, opacity: d }} />;
  }
  return <AbsoluteFill style={{ background: `radial-gradient(20% 14% at 66% 30%, rgba(0,0,0,0.75), rgba(0,0,0,0.97) 70%)`, opacity: d }} />;
};

/* horror captions */
const KEY = new Set(["drei", "achten", "dunkeln", "schritte", "gestalt", "höher", "regel", "kaputt", "zwölf", "zehn", "fünf", "dunkel", "akku", "hinter", "innen", "endlich", "reingehen", "niemand"]);
const CH = (() => { const out: number[][] = []; let cur: number[] = []; W.forEach((w, i) => { cur.push(i); if (/[.,:?!]$/.test(w.w) || cur.length >= 3 || w.w.length > 12) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
const Caps: React.FC<{ t: number }> = ({ t }) => {
  const ci = CH.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === CH.length - 1 || t < W[CH[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1190, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", fontFamily: SANS, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
      {CH[ci].map((i) => { const w = W[i]; const key = KEY.has(w.w.replace(/[^\p{L}-]/gu, "").toLowerCase()); const on = t >= w.s - 0.04; const k = spring(t, w.s - 0.04, 0.25);
        return <span key={i} style={{ fontSize: key ? 88 : 74, color: key ? C.red : "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", opacity: on ? 1 : 0, transform: `scale(${on ? 0.75 + 0.25 * k : 0.75})`, display: "inline-block", textShadow: key ? `0 0 24px ${C.red}` : undefined }}>{w.w}</span>; })}
    </div>
  );
};

export const Treppe: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const light = lightAt(t), flash = flashOn(t);
  const fl = floorAt(t), tm = timerAt(t);
  /* figure placement by story beat */
  let fig: { x: number; y: number; s: number; eyes?: number } | null = null;
  if (t > at(58) - 0.2 && t < at(66)) fig = { x: CX + 170, y: 1160, s: 0.55, eyes: 0.3 };            // on the landing below (seen over the rail)
  else if (t > at(71) && t < at(90)) fig = { x: CX + 40, y: 1260, s: 1.25, eyes: 0.5 };  // one flight higher – closer
  const behind = t > at(118) - 0.1 && t < at(123);                                         // jump scare in the flashlight
  const win = t > at(52) && t < at(58) ? sm(pr(t, at(52), at(55))) : 0;
  const scare = t >= at(119) - 0.05 ? Math.exp(-(t - at(119)) * 4) : 0;
  const run = (t > at(103) && t < at(107)) || (t > at(123) && t < at(130));
  const camShake = run ? Math.sin(t * 22) * 8 : 0;
  const zoom = lerp(1, 1.25, pr(t, at(50), at(57))) * (t > at(57) && t < at(66) ? 1 : 1) + (t > at(71) && t < at(79) ? 0.08 : 0);
  const atDoor = t > at(131) - 0.2;
  const doorOpen = sm(pr(t, at(139), at(145)));
  const hudOp = pr(t, 0.3, 0.8) * (1 - pr(t, at(156) - 0.3, at(156)));
  const rule = t > at(79) - 0.1 && t < at(90) - 0.1;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("treppe/voice.mp3")} />
      <Audio src={staticFile("treppe/drone.mp3")} loop volume={0.5} />
      {[at(20), at(44), at(71)].map((s, i) => <Sequence key={"c" + i} from={fr(s)}><Audio src={staticFile("treppe/click.mp3")} volume={0.8} /></Sequence>)}
      {[[at(37) - 0.2, "steps", 0.85], [at(74), "hit", 0.6], [at(103), "run", 0.8], [at(107), "heart", 0.8], [at(109), "flash", 0.9], [at(119) - 0.08, "hit", 1.0], [at(123), "run", 0.8], [at(133), "keys", 0.8], [at(139), "unlock", 0.85], [at(151) - 0.1, "hit", 0.45]].map(([s, n, v], i) =>
        <Sequence key={i} from={fr(s as number)}><Audio src={staticFile(`treppe/${n}.mp3`)} volume={v as number} /></Sequence>)}
      {[TR_OUTRO_T0, TR_OUTRO_T0 + 1.6, TR_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"p" + i} from={fr(s)}><Audio src={staticFile("treppe/pop.mp3")} volume={0.4} /></Sequence>)}

      <AbsoluteFill style={{ transform: `translate(${camShake + Math.sin(t * 80) * 22 * scare}px, ${Math.cos(t * 70) * 16 * scare}px)` }}>
        {/* intro: broken elevator */}
        {t < at(19) ? (
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.wall2}, #0b0f18)` }}>
            <div style={{ position: "absolute", left: CX - 230, top: 520, width: 460, height: 640, background: "linear-gradient(90deg,#3a4458,#56617a 50%,#3a4458)", borderLeft: "6px solid #1a2030", borderRight: "6px solid #1a2030" }}>
              <div style={{ position: "absolute", left: 226, top: 0, bottom: 0, width: 4, background: "#1a2030" }} />
            </div>
            {t > at(9) - 0.1 && <div style={{ position: "absolute", left: CX - 200, top: 760, width: 400, padding: "18px 0", background: "#f0e6c8", color: "#7a1010", textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 46, transform: `rotate(-4deg) scale(${spring(t, at(9), 0.35)})`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>AUSSER BETRIEB</div>}
            {t > at(13) && <div style={{ position: "absolute", left: CX - 80, top: 400, width: 160, padding: "8px 0", borderRadius: 10, background: "#000", color: C.red, textAlign: "center", fontFamily: '"Courier New", monospace', fontWeight: 800, fontSize: 70, opacity: pr(t, at(13), at(14)), textShadow: `0 0 18px ${C.red}` }}>8</div>}
            <AbsoluteFill style={{ background: "radial-gradient(50% 40% at 50% 45%, transparent 30%, rgba(0,0,0,0.8) 100%)" }} />
          </AbsoluteFill>
        ) : atDoor ? (
          /* your apartment door on the 8th floor */
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.wall2}, #0b0f18)` }}>
            {doorOpen > 0.02 && <div style={{ position: "absolute", left: CX - 218, top: 482, width: 436, height: 736, background: `linear-gradient(180deg, rgba(255,226,170,${doorOpen}), rgba(255,190,110,${0.9 * doorOpen}))`, boxShadow: `0 0 ${140 * doorOpen}px rgba(255,200,130,${0.8 * doorOpen})` }} />}
            <div style={{ position: "absolute", left: CX - 230, top: 470, width: 460, height: 760, background: "#3a2c20", border: "12px solid #4d3b2b", boxSizing: "border-box", transformOrigin: "0 50%", transform: `perspective(1600px) rotateY(${-doorOpen * 70}deg)` }}>
              <div style={{ position: "absolute", left: 140, top: 60, width: 160, padding: "8px 0", background: "#d6c7a8", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#3a2c20" }}>8. OG</div>
              <div style={{ position: "absolute", right: 40, top: 360, width: 26, height: 70, borderRadius: 8, background: "#b8a46a" }} />
            </div>
            {doorOpen > 0.3 && <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><g transform={`translate(${CX} 1180)`} opacity={sm(pr(t, at(142), at(147)))}>
              {/* „you“ – your own silhouette in the doorway, eyes too pale */}
              <circle cx={0} cy={-560} r={62} fill="#0a0a0c" /><path d="M-120 0 C-120 -300 -90 -470 0 -480 C90 -470 120 -300 120 0Z" fill="#0a0a0c" />
              <circle cx={-22} cy={-566} r={7} fill="#fff" opacity={pr(t, at(151), at(153))} /><circle cx={22} cy={-566} r={7} fill="#fff" opacity={pr(t, at(151), at(153))} />
            </g></svg>}
          </AbsoluteFill>
        ) : (
          <Stairwell t={t} figure={fig} window={win} brokenSwitch={t > at(93) && t < at(107)} zoom={zoom} />
        )}
        {/* darkness / flashlight (not at the very start or the lit doorway) */}
        {t >= at(19) && !(atDoor && doorOpen > 0.1) && <Dark t={t} light={atDoor ? 0 : light} flash={flash} aim={behind ? [CX, 760] : [CX, 1000]} />}
        {/* jump scare: it stands right behind you */}
        {behind && <AbsoluteFill style={{ opacity: pr(t, at(118) - 0.1, at(119) - 0.05) }}>
          <svg width={1080} height={1920}><g transform={`translate(${CX} ${1660 + Math.sin(t * 9) * 8})`}><Creature s={3.3} eyes={1} rim="#cfdcff" twitch={Math.sin(t * 17) > 0.6 ? 1 : 0} /></g></svg>
          <AbsoluteFill style={{ background: "radial-gradient(circle 430px at 50% 42%, transparent 45%, rgba(0,0,0,0.96) 100%)" }} />
        </AbsoluteFill>}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: scare * 0.35 }} />
      <AbsoluteFill style={{ background: C.red, mixBlendMode: "multiply", opacity: scare * 0.5 }} />

      {/* the rule */}
      {rule && <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 560, textAlign: "center", fontFamily: SANS, transform: `scale(${0.85 + 0.15 * spring(t, at(84) - 0.1, 0.4)})` }}>
        <div style={{ display: "inline-block", padding: "26px 34px", borderRadius: 22, background: "rgba(0,0,0,0.75)", border: `4px solid ${C.red}`, boxShadow: `0 0 40px ${C.red}66` }}>
          <div style={{ fontSize: 34, letterSpacing: "0.3em", color: C.red, fontWeight: 900 }}>DIE REGEL</div>
          <div style={{ fontSize: 62, fontWeight: 900, color: C.ink, marginTop: 8, opacity: pr(t, at(84) - 0.1, at(84) + 0.2) }}>Es bewegt sich<br />nur im <span style={{ color: C.red }}>Dunkeln</span>.</div>
        </div>
      </div>}

      {/* final question */}
      {t > at(156) - 0.15 && <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 470, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 100, color: C.ink, lineHeight: 1.02, textShadow: "0 8px 30px #000",
        transform: `scale(${0.8 + 0.2 * spring(t, at(156) - 0.1, 0.5)})`, opacity: 1 - pr(t, TR_OUTRO_T0, TR_OUTRO_T0 + 0.4) }}>Würdest <span style={{ color: C.red }}>du</span><br />reingehen?</div>}

      {/* HUD */}
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 10, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontFamily: SANS, opacity: hudOp }}>
        {[["UHRZEIT", `03:0${Math.min(9, Math.floor(t / 8))}`, C.ink], ["STOCK", `${fl}/8`, C.ink], ["LICHT", tm >= 0 ? `0:${String(Math.max(0, Math.ceil(tm))).padStart(2, "0")}` : "AUS", tm >= 0 && tm > 10 ? C.amber : C.red], ...(t > at(108) ? [["AKKU", "3%", C.red]] : [])].map(([l, v, c], i) => (
          <div key={i} style={{ padding: "10px 18px 8px", borderRadius: 16, background: "rgba(0,0,0,0.6)", border: `2px solid ${(c as string) === C.red ? C.red : "rgba(255,255,255,0.15)"}` }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(238,241,247,0.55)" }}>{l}</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: c as string, fontVariantNumeric: "tabular-nums" }}>{v}</div>
          </div>))}
      </div>

      {t < TR_OUTRO_T0 && <Caps t={t} />}
      <Outro t={t} t0={TR_OUTRO_T0} />
      <Grain />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.35)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

export const TreppeCover: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Stairwell t={0.3} figure={{ x: CX + 40, y: 1260, s: 1.25, eyes: 1 }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle 420px at 50% 52%, rgba(0,0,0,0.1), rgba(0,0,0,0.93) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: SANS, fontWeight: 900 }}>
      <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 14, background: C.red, color: "#fff", fontSize: 46, letterSpacing: "0.1em" }}>HORROR</div>
      <div style={{ fontSize: 120, color: C.ink, marginTop: 20, lineHeight: 1, letterSpacing: "-0.03em" }}>TREPPEN<br />HAUS</div>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1380, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 62, color: C.ink, textShadow: "0 6px 24px #000" }}>Es bewegt sich nur im <span style={{ color: C.red }}>Dunkeln</span>.</div>
  </AbsoluteFill>
);
