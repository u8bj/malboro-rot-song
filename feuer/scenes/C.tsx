// Scenes 9–12  (0:26.5 – end)
import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { C, SANS, SERIF, SHADOW } from "../theme";
import { ws, ls, FPS, FL, AUDIO_S } from "../timing";
import { cl, pr, eo, eio, lerp, spring, useT } from "../ui/kit";
import { Lyric } from "../ui/Lyrics";
import { Sphere, Bundle, Row } from "../ui/Objects";
import { Pastel, mixHex } from "./A";
import { BUNDLES, LAM_ZOOM } from "./B";
import spectrum from "../lyrics/spectrum.json";
import analysis from "../lyrics/analysis.json";

const spec = spectrum as number[][];
const kicks: number[] = analysis.kicks;
const kickPulse = (t: number) => { let best = -1; for (const k of kicks) if (k <= t) best = k; return best < 0 ? 0 : Math.exp(-(t - best) * 9); };

/* ───────── 9 · Und wenn sie komm'n, muss ich Bleikugeln feuern (ja) ───────── */
export const S9: React.FC = () => {
  const t = useT(); const f = Math.round(t * FPS);
  const s0 = ls(8), blei = ws(8, "bleikugeln"), end = ls(9);
  const morph = eio(pr(t, s0 - 0.35, s0 + 0.3));
  const k = kickPulse(t);
  const power = 0.6 + 0.8 * pr(t, blei - 0.2, blei + 0.3);
  const whip = eio(pr(t, end - 0.22, end + 0.02));
  const Z = 1 + LAM_ZOOM;
  const spheres = useMemo(() => BUNDLES.map(([x, y], i) => ({ x: 960 + (x - 960) * Z, y: 640 + (y - 640) * Z, r: 54 + (i % 3) * 16, ph: random(`sp${i}`) * 6, show: i < 5 })), []);
  const bands = spec[Math.min(spec.length - 1, f)] ?? [];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${-whip * 1400}px)`, filter: whip ? `blur(${whip * 30}px)` : undefined }}>
        {/* waveform behind the spheres */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: morph }}>
          {Array.from({ length: 64 }, (_, i) => { const b = bands[Math.floor((Math.abs(i - 31.5) / 32) * 23)] ?? 0; const h = (20 + b * 300 * power) * (1 + k * 0.9 * power); return (
            <rect key={i} x={120 + i * 26.5} y={640 - h / 2} width={12} height={h} rx={6} fill={mixHex("#c7c7cc", "#ff3b30", cl(k * power))} opacity={0.85} />); })}
        </svg>
        {spheres.map((s, i) => {
          const bob = Math.sin(t * 1.4 + s.ph) * 18; const r = s.r;
          const tx = 960 + (BUNDLES[i][0] - 960) * 1.35, ty = BUNDLES[i][1] - 20;
          const x = lerp(s.x, tx, morph), y = lerp(s.y, ty, morph) + bob * morph;
          const bw = 210 * Z;
          return (
            <React.Fragment key={i}>
              {s.show && morph < 0.6 && <Bundle w={bw * (1 - morph * 0.6)} style={{ position: "absolute", left: x - (bw * (1 - morph * 0.6)) / 2, top: y - (bw * 0.25) * (1 - morph * 0.6), transform: `rotate(${(i - 2) * 6 * (1 - morph)}deg)`, opacity: 1 - cl(morph * 1.8) }} />}
              <Sphere r={r * (1 + k * 0.08) * lerp(0.3, 1, morph)} style={{ position: "absolute", left: x - r * lerp(0.3, 1, morph), top: y - r * lerp(0.3, 1, morph), opacity: cl((morph - 0.25) * 2.2) }} />
            </React.Fragment>);
        })}
      </AbsoluteFill>
      <Lyric line={8} accents={{ bleikugeln: { color: "#6b7079", weight: 900 }, feuern: { color: C.red } }} out={end - 0.2} />
    </AbsoluteFill>
  );
};

/* ───────── 10 · Kein Schulabschluss, doch zahl' sechsstellig Steuern ───────── */
export const S10: React.FC = () => {
  const t = useT();
  const s0 = ls(9), doch = ws(9, "doch"), st = ws(9, "steuern"), end = ls(10);
  const whipIn = eio(pr(t, s0 - 0.22, s0 + 0.12));
  const pan = eio(pr(t, doch - 0.15, doch + 0.6));
  const count = eio(pr(t, ws(9, "sechsstellig") - 0.1, st + 0.1));
  const big = eo(pr(t, st, st + 0.35));
  const toHouse = eio(pr(t, end - 0.4, end + 0.2));
  const value = Math.round(count * 284716);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${(1 - whipIn) * 1400 - pan * 380}px)`, filter: whipIn < 1 ? `blur(${(1 - whipIn) * 30}px)` : undefined, opacity: 1 - toHouse * 0.9 }}>
        {/* digital school certificate */}
        <div style={{ position: "absolute", left: 960 - 320, top: 240, width: 640, height: 760, borderRadius: 36, background: "#fff", boxShadow: SHADOW, fontFamily: SANS, padding: 50, boxSizing: "border-box",
          transform: `perspective(1600px) rotateY(${pan * 14}deg)` }}>
          <div style={{ fontSize: 22, color: C.grey, letterSpacing: "0.12em" }}>DOKUMENT</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 6 }}>Zeugnis</div>
          {["Deutsch", "Mathematik", "Englisch", "Geschichte"].map((s, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `1px solid ${C.line}`, fontSize: 28 }}><span>{s}</span><span style={{ color: C.grey }}>–</span></div>)}
          <div style={{ marginTop: 40, padding: "26px 28px", borderRadius: 20, background: "#fff2f1", fontSize: 36, fontWeight: 700, display: "flex", justifyContent: "space-between" }}><span>Abschluss:</span><span style={{ color: C.red }}>—</span></div>
        </div>
        {/* finance / tax overview */}
        <div style={{ position: "absolute", left: 1410, top: 240, width: 760, height: 760, borderRadius: 36, background: "#fff", boxShadow: SHADOW, fontFamily: SANS, padding: 50, boxSizing: "border-box", opacity: pr(t, doch - 0.1, doch + 0.3) }}>
          <div style={{ fontSize: 22, color: C.grey, letterSpacing: "0.12em" }}>FINANZEN</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 6 }}>Steuerübersicht</div>
          <svg width={660} height={220} style={{ marginTop: 30 }}>
            {Array.from({ length: 12 }, (_, i) => { const h = (40 + ((i * 53) % 140)) * eo(pr(t, doch + i * 0.04, doch + 0.4 + i * 0.04)); return <rect key={i} x={i * 55} y={210 - h} width={36} height={h} rx={8} fill={i === 11 ? C.blue : "#d6e6ff"} />; })}
          </svg>
          <div style={{ fontSize: 24, color: C.grey, marginTop: 24 }}>Gezahlte Steuern</div>
          <div style={{ fontSize: lerp(80, 104, big), fontWeight: 800, letterSpacing: "-0.03em", color: mixHex("#0b0b0f", "#0a84ff", big), fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{value.toLocaleString("de-DE")} €</div>
          <Row k="Status" v="Bezahlt" vColor={C.green} />
        </div>
      </AbsoluteFill>
      {/* the amount shrinks into the house number of the next scene */}
      {toHouse > 0 && <div style={{ position: "absolute", left: lerp(1410 - 380 + 50, 960 - 40, toHouse), top: lerp(700, 690, toHouse), fontFamily: SANS, fontWeight: 800, fontSize: lerp(104, 30, toHouse), color: C.blue, opacity: 1 - pr(t, end + 0.1, end + 0.25) }}>{toHouse < 0.5 ? `${value.toLocaleString("de-DE")} €` : "28"}</div>}
      <Lyric line={9} accents={{ "schulabschluss": { italic: true, color: C.grey }, sechsstellig: { color: C.blue }, steuern: { color: C.blue, weight: 900 } }} out={end - 0.15} />
    </AbsoluteFill>
  );
};

/* ───────── CSS-3D building blocks ───────── */
const Box: React.FC<{ w: number; h: number; d: number; x?: number; y?: number; z?: number; c: string; roof?: string; sx?: number; sy?: number }> = ({ w, h, d, x = 0, y = 0, z = 0, c, roof, sx = 1, sy = 1 }) => {
  const face = (tr: string, ww: number, hh: number, shade: number, extra?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: -ww / 2, top: -hh / 2, width: ww, height: hh, transform: tr, background: mixHex(c, "#000000", shade), backfaceVisibility: "hidden", ...extra }} />
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: `translate3d(${x}px, ${y - (h * sy) / 2}px, ${z}px) scale3d(${sx}, ${sy}, ${sx})` }}>
      {face(`translateZ(${d / 2}px)`, w, h, 0, { backgroundImage: "repeating-linear-gradient(90deg, transparent 0 46px, rgba(120,160,220,0.25) 46px 70px)" })}
      {face(`rotateY(180deg) translateZ(${d / 2}px)`, w, h, 0.12)}
      {face(`rotateY(90deg) translateZ(${w / 2}px)`, d, h, 0.08)}
      {face(`rotateY(-90deg) translateZ(${w / 2}px)`, d, h, 0.16)}
      {face(`rotateX(90deg) translateZ(${h / 2}px)`, w, d, -0.04, { background: roof ?? mixHex(c, "#ffffff", 0.2) })}
    </div>
  );
};

/* ───────── 11 · Doch egal, was ich auch hab' (egal), Haus oder Palast ───────── */
export const S11: React.FC = () => {
  const t = useT();
  const s0 = ls(10), haus = ws(10, "haus"), pal = ws(10, "palast"), end = ls(11);
  const inn = eio(pr(t, s0 - 0.05, s0 + 0.6));
  const P = eio(pr(t, pal - 0.45, pal + 0.5));
  const rot = lerp(-28, 22, pr(t, s0, end + 0.8));
  const up = eio(pr(t, end - 0.25, end + 1.2));
  return (
    <AbsoluteFill>
      {/* Home card frame */}
      <div style={{ position: "absolute", left: 220, top: 230, width: 1480, height: 780, borderRadius: 48, background: "rgba(255,255,255,0.6)", boxShadow: SHADOW, backdropFilter: "blur(20px)", opacity: inn * (1 - up), transform: `translateY(${up * 600 + (1 - inn) * 60}px)` }}>
        <div style={{ position: "absolute", left: 50, top: 40, fontFamily: SANS, fontSize: 40, fontWeight: 800 }}>Zuhause</div>
        <div style={{ position: "absolute", left: 50, top: 92, fontFamily: SANS, fontSize: 24, color: C.grey }}>Hausnummer 28</div>
      </div>
      {/* 3D building: house morphs into a palace */}
      <div style={{ position: "absolute", left: 960, top: 880 + up * 700, perspective: 2200, transform: `scale(${lerp(0.5, 1.15, inn)})`, opacity: inn }}>
        <div style={{ transformStyle: "preserve-3d", transform: `rotateX(-14deg) rotateY(${rot}deg)` }}>
          <div style={{ position: "absolute", left: -600, top: -10, width: 1200, height: 700, transform: "rotateX(90deg) translateZ(-10px)", background: "radial-gradient(closest-side, rgba(180,190,210,0.55), transparent)" }} />
          {/* central body: modern house → palace hall */}
          <Box w={lerp(360, 520, P)} h={lerp(230, 300, P)} d={lerp(300, 360, P)} c={mixHex("#f4f4f6", "#f1e9d8", P)} roof={mixHex("#2c2c30", "#e8dcc0", P)} />
          {/* wings grow out */}
          <Box w={300} h={210} d={300} x={-410} c="#efe6d2" sx={P} sy={P} />
          <Box w={300} h={210} d={300} x={410} c="#efe6d2" sx={P} sy={P} />
          {/* towers */}
          {[-570, 570].map((x) => <Box key={x} w={90} h={380} d={90} x={x} c="#e9dfc8" roof="#c9a24a" sx={1} sy={P} />)}
          {/* columns */}
          {Array.from({ length: 6 }, (_, i) => <Box key={i} w={22} h={240} d={22} x={-200 + i * 80} z={lerp(150, 200, P)} c="#ffffff" sx={1} sy={P} />)}
          {/* golden dome (billboard) */}
          <div style={{ position: "absolute", left: -150, top: -300 - 240 * P, width: 300, height: 150, borderRadius: "150px 150px 0 0", background: "radial-gradient(circle at 35% 30%, #fff3c4, #d8b35a 45%, #9c7a2c)", transform: `scale(${P})`, transformOrigin: "50% 100%", opacity: P }} />
          {/* door with house number */}
          <div style={{ position: "absolute", left: -40, top: -150, width: 80, height: 150, background: "#3a3a3c", borderRadius: "8px 8px 0 0", transform: `translateZ(${lerp(151, 181, P)}px)` }}>
            <div style={{ position: "absolute", left: 14, top: -48, width: 52, height: 36, borderRadius: 8, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", opacity: pr(t, s0 + 0.05, s0 + 0.25) }}>28</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 270, top: 330, fontFamily: SANS, fontWeight: 200, fontSize: 100, letterSpacing: "0.2em", color: C.ink, opacity: pr(t, haus - 0.05, haus + 0.2) * (1 - P) * (1 - up), filter: `blur(${(1 - pr(t, haus - 0.05, haus + 0.25)) * 8}px)` }}>HAUS</div>
      <div style={{ position: "absolute", right: 250, top: 290, fontFamily: SERIF, fontStyle: "italic", fontSize: 140, color: C.gold, opacity: pr(t, pal - 0.05, pal + 0.25) * (1 - up), transform: `translateY(${(1 - eo(pr(t, pal - 0.05, pal + 0.4))) * 30}px)` }}>Palast</div>
      <Lyric line={10} size={68} maxW={1780} accents={{ "egal": { italic: true }, haus: { color: C.blue }, palast: { color: C.gold, italic: true } }} out={end - 0.15} />
    </AbsoluteFill>
  );
};

/* ───────── 12 · Da oben gibt's für sowas keinen Platz, mhm, na na na na ───────── */
export const S12: React.FC = () => {
  const t = useT();
  const s0 = ls(11), platz = ws(11, "platz");
  const sky = eio(pr(t, s0 - 0.4, s0 + 1.0));
  const nas = FL[11].words.filter((w) => w.w.startsWith("na")).map((w) => w.s);
  const pulse = nas.reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 5) : 0), 0);
  const white = eio(pr(t, AUDIO_S - 0.9, AUDIO_S - 0.1));
  const particles = useMemo(() => Array.from({ length: 140 }, (_, i) => ({ x: random(`px${i}`) * 1920, y: 700 + random(`py${i}`) * 500, v: 40 + random(`pv${i}`) * 90, s: 3 + random(`ps${i}`) * 6, ph: random(`pp${i}`) * 6 })), []);
  const clouds = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: random(`cx${i}`) * 2200 - 150, y: 140 + random(`cy${i}`) * 700, w: 380 + random(`cw${i}`) * 520, v: 12 + random(`cv${i}`) * 22 })), []);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: sky }}><Pastel hue="sky" /></AbsoluteFill>
      {clouds.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x + (t - s0) * c.v, top: c.y + (1 - sky) * 400, width: c.w, height: c.w * 0.38, borderRadius: "50%", background: "rgba(255,255,255,0.95)", filter: "blur(28px)", opacity: sky }} />)}
      {/* UI dissolves into light particles that drift up and pulse with „na na na na“ */}
      {particles.map((p, i) => { const tt = t - s0 + 0.3; if (tt < 0) return null; const y = p.y - tt * p.v; const sc = 1 + pulse * 0.9;
        return <div key={i} style={{ position: "absolute", left: p.x + Math.sin(tt + p.ph) * 30, top: y, width: p.s * sc, height: p.s * sc, borderRadius: "50%", background: "#fff", boxShadow: `0 0 ${10 + pulse * 18}px rgba(255,236,190,0.95)`, opacity: Math.min(1, tt * 2) * (0.5 + 0.5 * Math.sin(tt * 3 + p.ph) ** 2) }} />; })}
      <Lyric line={11} to={7} align="center" x={960} y={380} size={88} maxW={1760} accents={{ oben: { italic: true, color: C.blue }, "platz": { weight: 800 } }} />
      <Lyric line={11} from={7} align="center" x={960} y={640} size={64} maxW={1400} style={{ opacity: pr(t, platz, platz + 0.3) }} />
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
    </AbsoluteFill>
  );
};
