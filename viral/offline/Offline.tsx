// „Was passiert, wenn das Internet weltweit ausfällt?“ – cinematic scenario explainer. 1080×1920 @ 30 fps. Original visuals, no brand logos.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, random } from "remotion";
import { geoEquirectangular, geoPath, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import wordsJson from "./words.json";
import { Outro } from "../shared/Outro";
import { SANS, Wd, cl, pr, sm, eo, lerp, spring, useT, SAFE } from "../shared/StoryKit";

const W = wordsJson as Wd[];
const at = (i: number) => W[i].s;
export const OFF_OUTRO_T0 = W[W.length - 1].e + 0.6;
export const OFF_DURATION_S = OFF_OUTRO_T0 + 8.2;
const CX = (SAFE.left + SAFE.right) / 2;
const C = { bg: "#07080c", panel: "#11131b", line: "#1d2130", ink: "#eef1f7", grey: "#7d8496", red: "#ff3b3b", cyan: "#39d0ff", amber: "#ffb020", green: "#2fd47a" };
const LAND = feature(land110 as never, (land110 as unknown as { objects: { land: never } }).objects.land) as never;

/* hour shown in the HUD */
const HK: [number, number][] = [[at(16), 0], [at(27), 1], [at(45), 3], [at(63), 6], [at(75), 12], [at(93), 24]];
const hourAt = (t: number) => { let h = 0; for (const [s, v] of HK) if (t >= s - 0.1) h = v; return h; };
const minuteLabel = (t: number) => (t < at(27) - 0.1 ? "MINUTE 1" : `STUNDE ${hourAt(t)}`);

/* ───────── world map with city lights that go dark ───────── */
const WorldLights: React.FC<{ t: number; dark: number; w?: number }> = ({ t, dark, w = 1000 }) => {
  const proj = useMemo(() => geoEquirectangular().scale(w / 6.3).translate([w / 2, w * 0.28]), [w]);
  const d = useMemo(() => geoPath(proj)(LAND) ?? "", [proj]);
  const cities = useMemo(() => { const out: [number, number, number][] = []; let i = 0; while (out.length < 260 && i < 6000) { const lon = random(`lo${i}`) * 360 - 180, lat = random(`la${i}`) * 130 - 55; i++; if (geoContains(LAND, [lon, lat])) { const p = proj([lon, lat]); if (p) out.push([p[0], p[1], random(`k${i}`)]); } } return out; }, [proj]);
  return (
    <svg width={w} height={w * 0.56} style={{ overflow: "visible" }}>
      <path d={d} fill="#141824" stroke="#232a3b" strokeWidth={1.2} />
      {cities.map(([x, y, k], i) => { const off = dark > k; const fl = !off && dark > k - 0.08 ? (Math.sin(t * 40 + i) > 0 ? 1 : 0.2) : 1;
        return <circle key={i} cx={x} cy={y} r={off ? 2 : 3.5} fill={off ? "#2a2f3d" : C.amber} opacity={off ? 0.6 : fl} style={{ filter: off ? undefined : `drop-shadow(0 0 6px ${C.amber})` }} />; })}
    </svg>
  );
};

/* ───────── generic UI pieces (no brands) ───────── */
const Spinner: React.FC<{ t: number; s?: number; col?: string }> = ({ t, s = 70, col = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 360}deg)` }}><circle cx={12} cy={12} r={9} stroke="rgba(255,255,255,0.15)" strokeWidth={3} fill="none" /><path d="M12 3a9 9 0 0 1 9 9" stroke={col} strokeWidth={3} fill="none" strokeLinecap="round" /></svg>
);
const Panel: React.FC<{ k: number; w?: number; children: React.ReactNode; border?: string }> = ({ k, w = 760, children, border = C.line }) => (
  <div style={{ position: "absolute", left: CX - w / 2, top: 470, width: w, borderRadius: 40, background: C.panel, border: `3px solid ${border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", transform: `translateY(${(1 - k) * 120}px) scale(${0.92 + 0.08 * k})`, opacity: cl(k * 2), overflow: "hidden", fontFamily: SANS, color: C.ink }}>{children}</div>
);
const Silhouette: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <g transform={`translate(${x} 0) scale(${s})`}><circle cx={0} cy={-150} r={30} fill="#2a3042" stroke="#566079" strokeWidth={3} /><path d="M-45 0 C-45 -80 -30 -110 0 -110 C30 -110 45 -80 45 0Z" fill="#2a3042" stroke="#566079" strokeWidth={3} /></g>
);

/* ───────── scenes ───────── */
const S_Hook: React.FC<{ t: number }> = ({ t }) => {
  const dark = sm(pr(t, at(12), at(16) - 0.2)) * 0.35;
  const glitchT = Math.sin(t * 50) > 0.7 && t > at(6) ? 1 : 0;
  return (<AbsoluteFill>
    <div style={{ position: "absolute", left: CX - 500, top: 620 }}><WorldLights t={t} dark={dark} /></div>
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 400, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 96, lineHeight: 1, color: C.ink, letterSpacing: "-0.03em" }}>
      <span style={{ textShadow: glitchT ? `-6px 0 ${C.red}, 6px 0 ${C.cyan}` : undefined }}>INTERNET</span><br />
      <span style={{ color: C.red, opacity: pr(t, at(4), at(6)) }}>OFFLINE</span>
    </div>
  </AbsoluteFill>);
};
const S_Feed: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(16) - 0.2, 0.45);
  const apps = [["#2b2d3a", at(18)], ["#2d2a3a", at(19)], ["#24332c", at(20)]] as const;
  return (<Panel k={k} w={620}>
    <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 34px", fontSize: 34, fontWeight: 700 }}><span>9:41</span><span style={{ color: C.red }}>✕ Kein Netz</span></div>
    <div style={{ display: "flex", justifyContent: "center", gap: 34, padding: "40px 0 30px" }}>
      {apps.map(([bg, s], i) => { const a = spring(t, s - 0.1, 0.4); return (
        <div key={i} style={{ width: 150, height: 150, borderRadius: 40, background: bg, border: "3px solid #3a3f52", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${a})` }}><Spinner t={t + i * 0.3} s={64} /></div>); })}
    </div>
    <div style={{ padding: "10px 40px 50px" }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 120, borderRadius: 20, background: `linear-gradient(90deg, #1a1d29 ${((t * 80 + i * 30) % 100) - 30}%, #262a3a ${((t * 80 + i * 30) % 100)}%, #1a1d29 ${((t * 80 + i * 30) % 100) + 30}%)`, marginBottom: 18 }} />)}</div>
  </Panel>);
};
const S_Card: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(27) - 0.2, 0.45); const err = t > at(37) - 0.1; const cash = spring(t, at(41), 0.45);
  return (<AbsoluteFill>
    <Panel k={k} w={560} border={err ? C.red : C.line}>
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: 30, color: C.grey, fontWeight: 700, letterSpacing: "0.15em" }}>BETRAG</div>
        <div style={{ fontSize: 96, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>23,80 €</div>
        <div style={{ margin: "30px auto 10px", width: 300, height: 190, borderRadius: 24, background: err ? "rgba(255,59,59,0.12)" : "#1a1d29", border: `3px solid ${err ? C.red : "#3a3f52"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: err ? 54 : 34, fontWeight: 900, color: err ? C.red : C.grey }}>
          {err ? "FEHLER" : t > at(33) ? <Spinner t={t} s={70} /> : "Karte vorhalten"}
        </div>
        <div style={{ fontSize: 28, color: err ? C.red : C.grey, height: 40 }}>{err ? "Keine Verbindung zum Server" : " "}</div>
      </div>
    </Panel>
    {cash > 0.01 && <div style={{ position: "absolute", left: CX - 240, top: 1010, width: 480, padding: "20px 0", borderRadius: 24, background: C.amber, color: "#111", textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 60, transform: `scale(${cash}) rotate(-3deg)` }}>💶 NUR BARGELD</div>}
  </AbsoluteFill>);
};
const S_Nav: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(45) - 0.2, 0.45); const fail = t > at(51);
  return (<AbsoluteFill>
    <Panel k={k} w={760}>
      <div style={{ position: "relative", height: 640, background: "#141824" }}>
        {Array.from({ length: 48 }, (_, i) => { const x = (i % 6) * 127, y = Math.floor(i / 6) * 80; const loaded = random(`m${i}`) < (fail ? 0.25 : 0.55);
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 125, height: 78, background: loaded ? "#1f2535" : "repeating-conic-gradient(#191c27 0 25%, #12141c 0 50%) 0 0/24px 24px" }} />; })}
        <svg width={760} height={640} style={{ position: "absolute", inset: 0 }}><path d="M80 560 C 200 420 320 470 380 340 S 600 160 680 90" stroke={fail ? "#3a3f52" : C.cyan} strokeWidth={14} strokeDasharray={fail ? "18 14" : undefined} fill="none" strokeLinecap="round" />
          <circle cx={80} cy={560} r={22} fill={C.cyan} /><circle cx={80} cy={560} r={40} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.5} /></svg>
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 34, padding: "22px 28px", borderRadius: 24, background: "rgba(10,12,18,0.9)", border: `3px solid ${fail ? C.red : C.line}`, fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", gap: 20 }}>
          {fail ? <><span style={{ color: C.red }}>✕</span> Keine Route gefunden</> : <><Spinner t={t} s={50} /> Route wird berechnet…</>}
        </div>
      </div>
    </Panel>
    {t > at(55) && <div style={{ position: "absolute", left: CX - 270, top: 395, width: 540, padding: "16px 0", borderRadius: 20, background: C.green, color: "#062", textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 40, transform: `scale(${spring(t, at(55), 0.4)})` }}>✓ Offline-Karte gespeichert</div>}
  </AbsoluteFill>);
};
const S_Shop: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(63) - 0.2, 0.45); const empty = sm(pr(t, at(70), at(75) - 0.3));
  const items = useMemo(() => Array.from({ length: 24 }, (_, i) => [random(`it${i}`), ["#e85d4a", "#f2b134", "#5ab0e8", "#7ccf6a"][i % 4]] as const), []);
  return (<Panel k={k} w={760}>
    <div style={{ padding: "34px 40px 20px", fontSize: 34, fontWeight: 800, display: "flex", justifyContent: "space-between" }}><span>Regal 4</span><span style={{ color: empty > 0.5 ? C.red : C.grey }}>{empty > 0.5 ? "Lieferung ausstehend" : "Bestellung wird gesendet…"}</span></div>
    {[0, 1, 2].map((r) => <div key={r} style={{ position: "relative", height: 150, margin: "0 30px 20px", borderBottom: "10px solid #2a2f3d", display: "flex", alignItems: "flex-end", gap: 10, paddingLeft: 10 }}>
      {items.slice(r * 8, r * 8 + 8).map(([rnd, col], i) => <div key={i} style={{ width: 70, height: 110, borderRadius: 10, background: col, opacity: rnd < empty ? 0 : 1, transform: `translateY(${rnd < empty ? 40 : 0}px)`, transition: "none" }} />)}
    </div>)}
    <div style={{ padding: "10px 40px 40px", display: "flex", alignItems: "center", gap: 18, fontSize: 34, color: C.grey }}>🚚 <div style={{ flex: 1, height: 16, borderRadius: 8, background: "#1a1d29" }}><div style={{ width: `${lerp(10, 22, pr(t, at(63), at(75)))}%`, height: "100%", borderRadius: 8, background: C.amber }} /></div></div>
  </Panel>);
};
const S_ATM: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(75) - 0.2, 0.45); const q = eo(pr(t, at(84), at(93) - 0.3));
  return (<AbsoluteFill>
    <Panel k={k} w={600} border={C.red}>
      <div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 32, color: C.grey, fontWeight: 700, letterSpacing: "0.15em" }}>GELDAUTOMAT</div>
        <div style={{ margin: "24px auto", width: 440, height: 220, borderRadius: 20, background: "#0b0d13", border: "3px solid #2a2f3d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: C.red }}>Außer Betrieb</div><div style={{ fontSize: 28, color: C.grey, marginTop: 8 }}>Keine Verbindung zur Bank</div></div>
        <div style={{ margin: "0 auto", width: 260, height: 20, borderRadius: 10, background: "#05060a" }} /></div>
    </Panel>
    <svg width={1080} height={300} style={{ position: "absolute", left: 0, top: 880 }}>{Array.from({ length: 9 }, (_, i) => i < Math.round(q * 9) ? <Silhouette key={i} x={140 + i * 85} s={0.9 - i * 0.04} /> : null).map((e, i) => <g key={i} transform="translate(0 250)">{e}</g>)}</svg>
  </AbsoluteFill>);
};
const S_Phone: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(93) - 0.2, 0.45);
  return (<AbsoluteFill>
    <div style={{ position: "absolute", left: CX - 500, top: 560, opacity: 0.55 }}><WorldLights t={t} dark={lerp(0.6, 0.97, pr(t, at(93), at(107)))} /></div>
    <Panel k={k} w={560}>
      <div style={{ padding: 44, textAlign: "center" }}>
        <div style={{ fontSize: 120 }}>☎️</div>
        <div style={{ fontSize: 52, fontWeight: 900, marginTop: 10, color: t > at(105) ? C.red : C.ink }}>{t > at(105) ? "Keine Verbindung" : "Wähle…"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 20, height: 20 + i * 12, borderRadius: 4, background: "#2a2f3d", alignSelf: "flex-end" }} />)}</div>
      </div>
    </Panel>
  </AbsoluteFill>);
};
const S_Real: React.FC<{ t: number }> = ({ t }) => {
  const k = spring(t, at(112) - 0.2, 0.45);
  const n = Math.round(eo(pr(t, at(120), at(124) + 0.3)) * 8_500_000);
  const screens = Math.floor(eo(pr(t, at(119), at(124))) * 48);
  return (<AbsoluteFill>
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 380, textAlign: "center", fontFamily: SANS, transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
      <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: C.red, color: "#fff", fontWeight: 900, fontSize: 36, letterSpacing: "0.12em" }}>ECHT PASSIERT</div>
      <div style={{ fontSize: 64, fontWeight: 900, color: C.ink, marginTop: 18 }}>19. Juli 2024</div>
    </div>
    <div style={{ position: "absolute", left: CX - 380, top: 600, width: 760, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
      {Array.from({ length: 48 }, (_, i) => <div key={i} style={{ height: 62, borderRadius: 8, background: i < screens ? "#1c3fa8" : "#1a1d29", border: "2px solid #2a2f3d", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 26 }}>{i < screens ? ":(" : ""}</div>)}
    </div>
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1040, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink, fontVariantNumeric: "tabular-nums", opacity: pr(t, at(120), at(121)) * (1 - pr(t, at(125) - 0.3, at(125) - 0.1)) }}>{n.toLocaleString("de-DE")} <span style={{ fontSize: 44, color: C.grey }}>PCs</span></div>
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1035, display: "flex", justifyContent: "center", gap: 40, opacity: t > at(125) - 0.1 ? 1 : 0 }}>
      {[["✈️", at(125)], ["🏦", at(126)], ["🏥", at(127)]].map(([e, s], i) => <div key={i} style={{ fontSize: 90, transform: `scale(${spring(t, (s as number) - 0.05, 0.35)})` }}>{e as string}</div>)}
    </div>
  </AbsoluteFill>);
};

const SCENES: { from: number; to: number; C: React.FC<{ t: number }> }[] = [
  { from: 0, to: at(16) - 0.2, C: S_Hook }, { from: at(16) - 0.2, to: at(27) - 0.2, C: S_Feed }, { from: at(27) - 0.2, to: at(45) - 0.2, C: S_Card },
  { from: at(45) - 0.2, to: at(63) - 0.2, C: S_Nav }, { from: at(63) - 0.2, to: at(75) - 0.2, C: S_Shop }, { from: at(75) - 0.2, to: at(93) - 0.2, C: S_ATM },
  { from: at(93) - 0.2, to: at(108) - 0.1, C: S_Phone }, { from: at(108) - 0.1, to: at(133) - 0.15, C: ({ t }) => t < at(112) - 0.2
    ? <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 110, color: C.ink, textAlign: "center", lineHeight: 1, marginTop: -300, textShadow: `-6px 0 ${C.red}, 6px 0 ${C.cyan}` }}>Klingt wie<br />ein Film?</div></AbsoluteFill>
    : <S_Real t={t} /> },
  { from: at(133) - 0.15, to: 999, C: ({ t }) => <AbsoluteFill><div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 96, color: C.ink, lineHeight: 1.05, transform: `scale(${0.85 + 0.15 * spring(t, at(133) - 0.1, 0.5)})`, opacity: 1 - pr(t, OFF_OUTRO_T0, OFF_OUTRO_T0 + 0.4) }}>Was würdest <span style={{ color: C.red }}>du</span><br />zuerst vermissen? 👇</div></AbsoluteFill> },
];

/* captions: bold, outlined, keyword red/cyan */
const KEY = new Set(["internet", "weltweit", "komplett", "fehler", "bargeld", "route", "offline", "stocken", "geldautomaten", "schlangen", "festnetz", "schwierig", "film", "achteinhalb", "millionen", "weltweit", "tag", "vermissen", "lädt"]);
const CH = (() => { const out: number[][] = []; let cur: number[] = []; W.forEach((w, i) => { cur.push(i); if (/[.,:?!]$/.test(w.w) || cur.length >= 3 || w.w.length > 12) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
const Caps: React.FC<{ t: number }> = ({ t }) => {
  const ci = CH.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === CH.length - 1 || t < W[CH[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 1200, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", fontFamily: SANS, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
      {CH[ci].map((i) => { const w = W[i]; const key = KEY.has(w.w.replace(/[^\p{L}-]/gu, "").toLowerCase()); const on = t >= w.s - 0.04; const k = spring(t, w.s - 0.04, 0.25);
        return <span key={i} style={{ fontSize: key ? 86 : 72, color: key ? C.red : "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", opacity: on ? 1 : 0, transform: `scale(${on ? 0.75 + 0.25 * k : 0.75})`, display: "inline-block" }}>{w.w}</span>; })}
    </div>
  );
};

export const Offline: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig();
  const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const cutAt = SCENES.slice(1).map((s) => s.from);
  const glitch = cutAt.reduce((a, s) => a + (t >= s && t < s + 0.18 ? 1 : 0), 0);
  const punch = [at(4), at(12), at(22), at(37), at(51), at(74), at(92), at(107), at(114), at(122), at(128)].reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 7) * 0.06 : 0), 0);
  const h = hourAt(t), showHud = t > at(16) - 0.2 && t < at(108) - 0.1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("offline/voice.mp3")} />
      <Audio src={staticFile("offline/pulse.mp3")} volume={0.6} />
      {cutAt.map((s, i) => <Sequence key={"g" + i} from={fr(s)}><Audio src={staticFile("offline/glitch.mp3")} volume={0.35} /></Sequence>)}
      {[[at(0), "sting", 0.6], [at(12), "powerdown", 0.6], [at(37) - 0.1, "terminal", 0.8], [at(51), "terminal", 0.5], [at(84), "crowd", 0.45], [at(105) - 0.2, "busy", 0.45], [at(108), "boom", 0.7], [at(112), "sting", 0.6], [at(128), "boom", 0.5]].map(([s, n, v], i) =>
        <Sequence key={i} from={fr(s as number)}><Audio src={staticFile(`offline/${n}.mp3`)} volume={v as number} /></Sequence>)}
      {[OFF_OUTRO_T0, OFF_OUTRO_T0 + 1.6, OFF_OUTRO_T0 + 3.2].map((s, i) => <Sequence key={"p" + i} from={fr(s)}><Audio src={staticFile("offline/pop.mp3")} volume={0.45} /></Sequence>)}

      {/* scanlines + vignette */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 5px)" }} />
      <AbsoluteFill style={{ transform: `scale(${1 + punch}) translateX(${glitch ? (Math.sin(t * 200) * 18) : 0}px)`, transformOrigin: `${CX}px 800px`, filter: glitch ? "saturate(2) hue-rotate(20deg)" : undefined }}>
        {SCENES.map((s, i) => (t >= s.from && t < s.to ? <AbsoluteFill key={i}><s.C t={t} /></AbsoluteFill> : null))}
      </AbsoluteFill>
      {glitch > 0 && <AbsoluteFill style={{ background: `linear-gradient(0deg, transparent ${30 + Math.sin(t * 300) * 20}%, rgba(255,59,59,0.25) ${32 + Math.sin(t * 300) * 20}%, transparent ${36 + Math.sin(t * 300) * 20}%)`, mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 65% at 50% 45%, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />

      {/* HUD timeline (safe top) */}
      {showHud && <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 10, fontFamily: SANS, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "12px 26px", borderRadius: 40, background: "rgba(17,19,27,0.85)", border: `3px solid ${C.red}` }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: C.red, opacity: Math.sin(t * 6) > 0 ? 1 : 0.3 }} />
          <span style={{ fontSize: 46, fontWeight: 900, color: C.ink, letterSpacing: "0.04em" }}>{minuteLabel(t)}</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: C.red }}>OFFLINE</span>
        </div>
        <div style={{ margin: "18px auto 0", width: 700, height: 10, borderRadius: 5, background: "#1a1d29" }}><div style={{ width: `${(h / 24) * 100}%`, height: "100%", borderRadius: 5, background: C.red, boxShadow: `0 0 12px ${C.red}` }} /></div>
      </div>}

      {t < OFF_OUTRO_T0 && <Caps t={t} />}
      <Outro t={t} t0={OFF_OUTRO_T0} likeTitle="Hat dir das Video gefallen?" />
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.bottom + 2, fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>@entscheidungsnacht</div>
    </AbsoluteFill>
  );
};

export const OfflineCover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
    <div style={{ position: "absolute", left: CX - 500, top: 760 }}><WorldLights t={0.3} dark={0.7} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontWeight: 900, fontSize: 130, lineHeight: 1, color: C.ink, letterSpacing: "-0.03em" }}>
      <span style={{ textShadow: `-6px 0 ${C.red}, 6px 0 ${C.cyan}` }}>INTERNET</span><br /><span style={{ color: C.red }}>WELTWEIT</span><br />OFFLINE
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontWeight: 900, fontSize: 64, color: C.ink }}>Stunde für Stunde ⏱️</div>
  </AbsoluteFill>
);
