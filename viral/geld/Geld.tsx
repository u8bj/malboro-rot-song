// „100 € im Monat – Kopfkissen vs. Sparbuch vs. ETF“ – original money simulation short. 1080×1920 @ 30 fps.
// Layout strictly inside the TikTok safe area (SAFE): nothing important under the top bar, right icons or bottom text.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { SANS, Wd, cl, pr, sm, eo, lerp, spring, useT, Grain, makeChunks, Captions, SAFE } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const CH = makeChunks(W);
const at = (i: number) => W[i].s;
export const GELD_OUTRO_T0 = W[W.length - 1].e + 0.5;
export const GELD_DURATION_S = GELD_OUTRO_T0 + 8.2;

const C = { bg: "#0a0c11", grid: "#141822", ink: "#f2f4f8", grey: "#8a90a0", pillow: "#e7d2ad", spar: "#4da3ff", etf: "#34c759", red: "#ff453a", yellow: "#ffd23f" };
const CX = (SAFE.left + SAFE.right) / 2; // visual centre of the safe area (≈495)

/* money model (monthly, 100 € each): pillow 0 %, savings 1 % p.a., ETF Ø 7 % p.a. incl. crash year 12 (−30 %) */
const G = Math.pow(Math.pow(1.07, 30) / 0.7, 1 / 29) - 1;
const series = (() => {
  const p: number[] = [0], s: number[] = [0], e: number[] = [0];
  let ps = 0, ss = 0, es = 0;
  for (let m = 1; m <= 360; m++) {
    const y = Math.ceil(m / 12);
    ps += 100; ss = ss * (1 + 0.01 / 12) + 100;
    const ann = y === 12 ? -0.3 : G; es = es * Math.pow(1 + ann, 1 / 12) + 100;
    p.push(ps); s.push(ss); e.push(es);
  }
  return { p, s, e };
})();
const val = (arr: number[], years: number) => { const m = Math.max(0, Math.min(360, years * 12)); const i = Math.floor(m), f = m - i; return arr[i] + ((arr[Math.min(360, i + 1)] ?? arr[i]) - arr[i]) * f; };

/* simulated year as a function of narration time */
const yearAt = (t: number) => {
  const K: [number, number][] = [[at(19), 0], [at(27), 5], [at(33) + 0.2, 5], [at(36), 10], [at(40), 10.6], [at(43), 12], [at(73) - 0.3, 12], [at(74) + 0.5, 20], [at(80) - 0.2, 20], [at(81) + 0.6, 30]];
  if (t <= K[0][0]) return 0;
  for (let i = 0; i < K.length - 1; i++) if (t <= K[i + 1][0]) { const k = (t - K[i][0]) / (K[i + 1][0] - K[i][0]); return lerp(K[i][1], K[i + 1][1], sm(k)); }
  return 30;
};
const eur = (v: number) => `${Math.round(v).toLocaleString("de-DE")} €`;

/* ───────── icons (original, simple) ───────── */
const IconPillow = () => <svg width={70} height={70} viewBox="0 0 24 24"><path d="M3 8c0-2 2-3 4-3h10c2 0 4 1 4 3v8c0 2-2 3-4 3H7c-2 0-4-1-4-3z" fill={C.pillow} /><path d="M7 9h10M7 15h10" stroke="#a88f66" strokeWidth={1} /></svg>;
const IconBook = () => <svg width={70} height={70} viewBox="0 0 24 24"><rect x={5} y={3} width={14} height={18} rx={2} fill={C.spar} /><rect x={8} y={7} width={8} height={2} rx={1} fill="#cfe5ff" /><rect x={8} y={11} width={6} height={1.6} rx={0.8} fill="#cfe5ff" /></svg>;
const IconChart = ({ col }: { col: string }) => <svg width={70} height={70} viewBox="0 0 24 24"><path d="M3 18l5-6 4 3 6-8 3 3" stroke={col} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21h18" stroke={C.grey} strokeWidth={1.5} /></svg>;

/* ───────── one column ───────── */
const BASE = 1060, MAXH = 400, COLW = 230;
// running maximum of all three series → the scale grows with the money, bars always fill the stage
const prefMax = (() => { const a: number[] = []; let m = 0; for (let i = 0; i <= 360; i++) { m = Math.max(m, series.e[i], series.s[i], series.p[i]); a.push(m); } return a; })();
const scaleAt = (years: number) => Math.max(1500, val(prefMax, years) * 1.05);
const Column: React.FC<{ x: number; v: number; maxV: number; ghost?: number; color: string; label: string; icon: React.ReactNode; appear: number; hl?: number; tag?: React.ReactNode }> = ({ x, v, maxV, ghost, color, label, icon, appear, hl = 0, tag }) => {
  const h = Math.max(10, (v / maxV) * MAXH) * appear, gh = ghost !== undefined ? (ghost / maxV) * MAXH : 0;
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: COLW, height: 1920, opacity: cl(appear * 1.5), transform: `translateY(${(1 - appear) * 60}px)` }}>
      {ghost !== undefined && <div style={{ position: "absolute", left: 18, width: COLW - 36, top: BASE - gh, height: gh, borderRadius: 22, border: `3px dashed ${color}`, opacity: 0.55 }} />}
      <div style={{ position: "absolute", left: 18, width: COLW - 36, top: BASE - h, height: h, borderRadius: 22, background: `linear-gradient(180deg, ${color}, ${color}88)`, boxShadow: `0 0 ${30 + hl * 50}px ${color}${hl ? "aa" : "44"}` }} />
      <div style={{ position: "absolute", left: -20, right: -20, top: BASE - h - 78, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 44 + hl * 10, color: C.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{eur(v)}</div>
      {tag && <div style={{ position: "absolute", left: -10, right: -10, top: BASE - h - 140, display: "flex", justifyContent: "center" }}>{tag}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: BASE + 16, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: SANS, color: C.ink }}>
        {icon}<div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
};
const Badge: React.FC<{ text: string; color: string; k: number }> = ({ text, color, k }) => (
  <div style={{ padding: "8px 18px", borderRadius: 14, background: color, color: "#0a0c11", fontFamily: SANS, fontWeight: 900, fontSize: 32, transform: `scale(${0.6 + 0.4 * k})`, opacity: k, whiteSpace: "nowrap" }}>{text}</div>
);

export const Geld: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const yr = yearAt(t);
  const crash = t > at(44) - 0.2 && t < at(73);
  const crashK = pr(t, at(44) - 0.15, at(44) + 0.2);
  const infl = sm(pr(t, at(107), at(120) + 0.3));
  const pillowNow = val(series.p, yr);
  const pillowReal = lerp(pillowNow, pillowNow / Math.pow(1.02, 30), infl);
  const etfCol = crash ? C.red : C.etf;
  const intro = t < at(19);
  const appear = (i: number) => eo(pr(t, at([7, 8, 10][i]) - 0.15, at([7, 8, 10][i]) + 0.35));
  const finalHl = (i: number) => (t > at([83, 86, 88][i]) - 0.1 && t < at(92) ? Math.exp(-(t - at([83, 86, 88][i])) * 1.5) * 0.6 + 0.4 : 0);
  // screen shake on crash
  const shk = t >= at(44) ? Math.exp(-(t - at(44)) * 5) : 0;
  const dots = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("geld/voice.mp3")} />
      <Audio src={staticFile("geld/bed.mp3")} volume={0.6} />
      {[at(7), at(8), at(10)].map((s, i) => <Sequence key={"p" + i} from={fr(s - 0.05)}><Audio src={staticFile("geld/pop.mp3")} volume={0.5} /></Sequence>)}
      {[at(19), at(27), at(35)].map((s, i) => <Sequence key={"c" + i} from={fr(s)}><Audio src={staticFile("geld/coins.mp3")} volume={0.45} /></Sequence>)}
      <Sequence from={fr(at(44) - 0.25)}><Audio src={staticFile("geld/crash.mp3")} volume={0.85} /></Sequence>
      {[at(73), at(80)].map((s, i) => <Sequence key={"w" + i} from={fr(s - 0.2)}><Audio src={staticFile("geld/whoosh.mp3")} volume={0.6} /></Sequence>)}
      <Sequence from={fr(at(88) + 0.4)}><Audio src={staticFile("geld/win.mp3")} volume={0.55} /></Sequence>
      <Sequence from={fr(at(120))}><Audio src={staticFile("geld/crash.mp3")} volume={0.35} /></Sequence>
      {[GELD_OUTRO_T0, GELD_OUTRO_T0 + 1.6, GELD_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"o" + i} from={fr(s)}><Audio src={staticFile("geld/pop.mp3")} volume={0.5} /></Sequence>)}

      {/* subtle grid + red flash during crash */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`, backgroundSize: "90px 90px", opacity: 0.6 }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 50%, rgba(255,69,58,${0.28 * crashK * (crash ? 1 : 0)}), transparent 70%)` }} />

      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 80) * 14 * shk}px, ${Math.cos(t * 70) * 10 * shk}px)` }}>
        {/* header (safe top) */}
        <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 20, textAlign: "center", fontFamily: SANS }}>
          {t > at(121) - 0.2 ? (
            t < at(128) - 0.2
              ? <div style={{ marginTop: 40, display: "inline-block", padding: "18px 30px", borderRadius: 20, background: "rgba(255,69,58,0.15)", border: `3px solid ${C.red}`, fontWeight: 900, fontSize: 54, color: C.red, transform: `scale(${0.8 + 0.2 * spring(t, at(121) - 0.2, 0.45)})` }}>Kissen: −16.000 € Kaufkraft</div>
              : <div style={{ fontWeight: 900, fontSize: 88, color: C.ink, lineHeight: 1.05, letterSpacing: "-0.02em", transform: `scale(${0.8 + 0.2 * spring(t, at(128) - 0.2, 0.5)})` }}>Wann hast <span style={{ color: C.yellow }}>du</span><br />angefangen?</div>
          ) : intro ? (
            <div style={{ fontWeight: 900, fontSize: 84, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.05, opacity: pr(t, 0, 0.3) }}>
              <span style={{ color: C.yellow }}>100 €</span> / Monat<br /><span style={{ fontSize: 60, color: C.grey }}>{t > at(4) - 0.1 ? "30 Jahre lang" : " "}</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.2em", color: C.grey }}>JAHR</div>
              <div style={{ fontSize: 130, fontWeight: 900, color: crash ? C.red : C.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: "-0.04em" }}>{Math.floor(yr)}</div>
              {/* 30 progress dots */}
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6 }}>{Array.from({ length: 30 }, (_, i) => <div key={i} style={{ width: 16, height: 8, borderRadius: 4, background: i < Math.floor(yr) ? (i === 11 ? C.red : C.yellow) : "#232a38" }} />)}</div>
            </>
          )}
        </div>
        {/* assumptions – small, always readable, inside safe area */}
        {!intro && t < at(121) - 0.2 && <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 460, textAlign: "center", fontFamily: SANS, fontSize: 24, color: "#5d6474" }}>Beispielrechnung · Sparbuch 1 % · ETF Ø 7 % p. a. · keine Finanzberatung</div>}

        {/* the three columns */}
        <Column x={CX - COLW * 1.5 - 30} v={pillowReal} ghost={infl > 0.01 ? pillowNow : undefined} color={C.pillow} maxV={scaleAt(yr)} label="Kissen" icon={<IconPillow />} appear={appear(0)} hl={finalHl(0)}
          tag={infl > 0.3 ? <Badge text="Kaufkraft −45 %" color={C.red} k={pr(t, at(110), at(112))} /> : t > at(56) && t < at(59) ? <Badge text="😏" color={C.pillow} k={spring(t, at(57), 0.4)} /> : undefined} />
        <Column x={CX - COLW / 2} v={val(series.s, yr)} color={C.spar} maxV={scaleAt(yr)} label="Sparbuch" icon={<IconBook />} appear={appear(1)} hl={finalHl(1)} />
        <Column x={CX + COLW / 2 + 30} v={val(series.e, yr)} color={etfCol} maxV={scaleAt(yr)} label="ETF" icon={<IconChart col={etfCol} />} appear={appear(2)} hl={finalHl(2)}
          tag={crash && t < at(59) ? <Badge text="−30 %" color={C.red} k={spring(t, at(45), 0.4)} /> : t > at(67) - 0.1 && t < at(73) ? <Badge text="billig nachkaufen" color={C.etf} k={spring(t, at(70) - 0.1, 0.4)} /> : t > at(59) && t < at(67) ? <Badge text="verkaufen = Verlust" color={C.red} k={spring(t, at(62) - 0.1, 0.4)} /> : undefined} />
        {/* monthly deposits: small coins dropping into every column while the clock runs */}
        {!intro && yr > 0 && yr < 30 && dots.map((i) => { const ph = ((t * 1.6 + i / 12) % 1); const col = i % 3; const x = [CX - COLW - 30, CX, CX + COLW + 30][col];
          return <div key={i} style={{ position: "absolute", left: x - 12, top: 520 + ph * 160, width: 24, height: 24, borderRadius: 12, background: C.yellow, opacity: (1 - ph) * 0.8, boxShadow: `0 0 10px ${C.yellow}` }} />; })}
      </AbsoluteFill>

      {t < GELD_OUTRO_T0 && <Captions t={t} W={W} chunks={CH} y={1200} size={70} hi={C.yellow} />}
      <Outro t={t} t0={GELD_OUTRO_T0} likeTitle="Hat dir das Video gefallen?" />
      <Grain />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

/* cover */
export const GeldCover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`, backgroundSize: "90px 90px", opacity: 0.6 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", color: C.ink, fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: "-0.03em" }}>
      <span style={{ color: C.yellow }}>100 €</span><br /><span style={{ fontSize: 70 }}>im Monat · 30 Jahre</span>
    </div>
    {[[C.pillow, 36000, "Kissen"], [C.spar, 41963, "Sparbuch"], [C.etf, 119774, "ETF"]].map(([c, v, l], i) => {
      const h = ((v as number) / 125000) * 620;
      return (<div key={i} style={{ position: "absolute", left: 150 + i * 280, top: 1350 - h, width: 220, height: h, borderRadius: 26, background: `linear-gradient(180deg, ${c}, ${c}88)`, boxShadow: `0 0 50px ${c}66` }}>
        <div style={{ position: "absolute", top: -70, left: -30, right: -30, textAlign: "center", color: C.ink, fontWeight: 900, fontSize: 50 }}>{i === 2 ? "???" : `${Math.round((v as number) / 1000)}k`}</div>
        <div style={{ position: "absolute", bottom: -70, left: -30, right: -30, textAlign: "center", color: C.ink, fontWeight: 800, fontSize: 44 }}>{l as string}</div>
      </div>);
    })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", color: C.yellow, fontWeight: 900, fontSize: 72 }}>Wer gewinnt?</div>
  </AbsoluteFill>
);
