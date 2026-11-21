// Scenes 1–4  (0:00 – 0:12.6)
import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { C, SANS, SERIF, SHADOW } from "../theme";
import { ws, ls, FPS } from "../timing";
import { AppIcon, Banner, Card, G, cl, pr, sm, eo, eio, lerp, spring, useT } from "../ui/kit";
import { Lyric } from "../ui/Lyrics";
import { Capsule, Drop, Avatar } from "../ui/Objects";
import spectrum from "../lyrics/spectrum.json";

const spec = spectrum as number[][];
const energy = (f: number) => { const b = spec[Math.max(0, Math.min(spec.length - 1, f))] ?? []; return b.reduce((a, v) => a + v, 0) / (b.length || 1); };

export const Pastel: React.FC<{ hue?: "cool" | "warm" | "sky"; k?: number }> = ({ hue = "cool", k = 1 }) => (
  <AbsoluteFill style={{ background: hue === "sky" ? "linear-gradient(180deg,#cfe3ff 0%,#eaf2ff 45%,#ffffff 100%)" : C.bg }}>
    <AbsoluteFill style={{ opacity: k, background: hue === "warm" ? "radial-gradient(40% 50% at 15% 20%, #ffe3ec, transparent 70%), radial-gradient(40% 50% at 85% 80%, #fff1d6, transparent 70%)" : "radial-gradient(40% 50% at 12% 18%, #e3ecff, transparent 70%), radial-gradient(45% 55% at 88% 85%, #f4e6ff, transparent 70%)" }} />
  </AbsoluteFill>
);

/* ───────── 1 · Leute vor der Tür … ───────── */
export const S1: React.FC = () => {
  const t = useT();
  const kug = ws(0, "kugeln"), end = ls(1);
  const banner = spring(t, 0.12, 0.6);
  const zoom = eio(pr(t, 0.5, 2.4));
  const metal = eio(pr(t, kug - 0.12, kug + 0.4));
  const toShield = eio(pr(t, end - 0.25, end + 0.25));
  // hero tile geometry: banner → dark metallic tile → (scene 2 takes over at the same rect)
  const hx = 960, hy = lerp(-120, 330, banner), hw = lerp(780, 980, metal), hh = lerp(150, 300, metal);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + zoom * 0.14})`, transformOrigin: "960px 330px", filter: `blur(${metal * 6}px)`, opacity: 1 - toShield }}>
        {/* Home dashboard */}
        <Card x={960} y={700} w={1500} h={560} r={44} glass>
          <div style={{ position: "absolute", left: 50, top: 38, fontSize: 50, fontWeight: 800, letterSpacing: "-0.02em" }}>Zuhause</div>
          <div style={{ position: "absolute", left: 50, top: 104, fontSize: 24, color: C.grey }}>Alle Geräte verbunden</div>
          {[["Wohnzimmer", "Licht an", "#ffcc00", G.bulb], ["Haustür", "Verriegelt", C.blue, G.lock], ["Klima", "21 °C", C.orange, G.house]].map(([n, s, c, g], i) => (
            <div key={i} style={{ position: "absolute", left: 50 + i * 290, top: 170, width: 260, height: 160, borderRadius: 26, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", padding: 22, boxSizing: "border-box" }}>
              <AppIcon size={52} bg={c as string} glyph={g as React.ReactNode} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 14 }}>{n as string}</div><div style={{ fontSize: 20, color: C.grey }}>{s as string}</div>
            </div>
          ))}
          {/* door camera tile */}
          <div style={{ position: "absolute", left: 930, top: 38, width: 520, height: 470, borderRadius: 30, overflow: "hidden", background: "linear-gradient(180deg,#dfe4ea,#c9d0d8)" }}>
            <svg width={520} height={470}>
              <rect x={0} y={330} width={520} height={140} fill="#b7bec7" />
              <rect x={190} y={90} width={150} height={260} rx={6} fill="#6d5846" /><rect x={200} y={100} width={130} height={240} rx={4} fill="#7d6754" />
              <circle cx={310} cy={225} r={7} fill="#e8d9a6" />
              <rect x={110} y={80} width={40} height={18} rx={4} fill="#f6f2dc" /><circle cx={130} cy={110} r={40} fill="rgba(255,240,180,0.25)" />
              {/* motion detection box */}
              <rect x={150 - Math.sin(t * 6) * 4} y={150} width={230} height={210} fill="none" stroke="#ffd60a" strokeWidth={4} strokeDasharray="22 10" opacity={pr(t, 0.2, 0.4)} />
            </svg>
            <div style={{ position: "absolute", left: 18, top: 16, display: "flex", gap: 8, alignItems: "center", background: "rgba(0,0,0,0.45)", color: "#fff", borderRadius: 12, padding: "6px 12px", fontSize: 20, fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: C.red, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 4)) }} />LIVE · Haustür
            </div>
          </div>
        </Card>
      </AbsoluteFill>
      {/* hero: notification → metallic composition */}
      <div style={{ position: "absolute", left: hx - hw / 2, top: hy - hh / 2, width: hw, height: hh, borderRadius: lerp(34, 44, metal), overflow: "hidden",
        background: `linear-gradient(135deg, ${mixHex("#ffffff", "#2b2d31", metal)}, ${mixHex("#ffffff", "#0e0f11", metal)})`, boxShadow: SHADOW,
        transform: `scale(${1 - toShield * 0.2})`, opacity: 1 - toShield }}>
        <div style={{ opacity: 1 - metal * 1.6, position: "absolute", inset: 0 }}>
          <Banner w={hw} style={{ boxShadow: "none", background: "transparent" }} icon={<AppIcon size={62} bg={C.orange} glyph={G.house} />} app="Zuhause" title="Bewegung vor der Haustür erkannt" body="Kamera · Eingangsbereich" />
        </div>
        {metal > 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 46, opacity: metal }}>
            {[0, 1, 2, 3, 4].map((i) => { const k = spring(t, kug + i * 0.08, 0.6); return (
              <div key={i} style={{ transform: `translateY(${(1 - k) * 180}px) scale(${0.6 + 0.4 * k})`, opacity: cl(k * 1.5) }}>
                <Capsule w={66} h={186} rot={Math.sin(t * 1.6 + i) * 55} tone={i % 2 ? "chrome" : "brass"} />
              </div>); })}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, height: 2, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)" }} />
          </div>
        )}
      </div>
      <Lyric line={0} accents={{ "tür": { color: C.blue }, kugeln: { italic: true }, lauf: { color: C.ink } }} out={end - 0.1} />
    </AbsoluteFill>
  );
};
export const mixHex = (a: string, b: string, k: number) => { const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * cl(k)).toString(16).padStart(2, "0")).join(""); };

/* ───────── 2 · Was für Rücken oder Schutz? … nur Gott passt auf mich auf ───────── */
export const S2: React.FC = () => {
  const t = useT();
  const s0 = ls(1), sch = ws(1, "schutz"), gott = ws(1, "gott"), end = ls(2);
  const inn = eio(pr(t, s0 - 0.3, s0 + 0.25));
  const beam = eio(pr(t, gott - 0.25, gott + 0.35));
  const toWave = eio(pr(t, end - 0.35, end + 0.15));
  const rot = Math.sin((t - s0) * 1.7) * 38 + (t - s0) * 30;
  return (
    <AbsoluteFill>
      {/* soft light beam from above */}
      <AbsoluteFill style={{ opacity: beam * (1 - toWave), background: `radial-gradient(22% 80% at 50% 0%, rgba(255,214,140,0.85), rgba(255,226,170,0.45) 50%, transparent 82%)` }} />
      <div style={{ position: "absolute", left: 960 - lerp(260, 8, toWave) / 2, top: lerp(0, 600, toWave), width: lerp(260, 8, toWave), height: lerp(1080, 6, toWave), opacity: beam,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,206,120,0.95) 55%, rgba(255,206,120,0))", boxShadow: "0 0 120px 40px rgba(255,210,130,0.55)", filter: `blur(${lerp(24, 2, toWave)}px)`, borderRadius: 4 }} />
      {/* Health-like safety card (inherits the hero tile rect) */}
      <div style={{ position: "absolute", left: 960 - lerp(980, 1180, inn) / 2, top: lerp(330, 600, inn) - lerp(300, 640, inn) / 2, width: lerp(980, 1180, inn), height: lerp(300, 640, inn), borderRadius: 44,
        background: "#fff", boxShadow: SHADOW, overflow: "hidden", fontFamily: SANS, opacity: (1 - beam) * cl(inn * 2), transform: `scale(${1 + beam * 0.08})` }}>
        <div style={{ position: "absolute", left: 44, top: 36, display: "flex", gap: 16, alignItems: "center" }}>
          <AppIcon size={54} bg={C.blue} glyph={G.shield} /><div><div style={{ fontSize: 34, fontWeight: 800 }}>Sicherheit</div><div style={{ fontSize: 22, color: C.grey }}>Heute</div></div>
        </div>
        <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: "absolute", left: 90, top: 150 }}>
          <circle r={180} fill="none" stroke="#e8f1ff" strokeWidth={22} />
          <circle r={180} fill="none" stroke={C.blue} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${eo(pr(t, s0, sch))} 1`} transform="rotate(-90)" />
        </svg>
        <div style={{ position: "absolute", left: 180, top: 240, width: 240, height: 240, transform: `perspective(900px) rotateY(${rot}deg)` }}>
          <svg width={240} height={240} viewBox="0 0 24 24"><defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#64b5ff" /><stop offset="1" stopColor="#0a5bd8" /></linearGradient></defs>
            <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" fill="url(#sh)" /><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ position: "absolute", left: 600, top: 250, fontSize: 96, fontWeight: 200, letterSpacing: `${lerp(0.32, 0.12, eo(pr(t, sch - 0.1, sch + 0.5)))}em`, color: C.ink,
          opacity: pr(t, sch - 0.1, sch + 0.25), filter: `blur(${(1 - pr(t, sch - 0.1, sch + 0.3)) * 10}px)` }}>SCHUTZ</div>
        <div style={{ position: "absolute", left: 606, top: 400, fontSize: 26, color: C.grey, opacity: pr(t, sch + 0.2, sch + 0.5) }}>Status</div>
        <div style={{ position: "absolute", left: 606, top: 434, fontSize: 30, fontWeight: 700, color: C.green, opacity: pr(t, sch + 0.25, sch + 0.55) }}>● Aktiv</div>
      </div>
      <Lyric line={1} to={5} accents={{ "schutz": { color: C.blue }, "bra": {} }} out={gott - 0.3} />
      {/* „nur Gott passt auf mich auf“ – centred inside the light */}
      <Lyric line={1} from={5} align="center" x={960} y={440} size={96} maxW={1600} accents={{ gott: { italic: true, color: C.gold } }} out={end - 0.2} style={{ opacity: 1 - toWave }} />
    </AbsoluteFill>
  );
};

/* ───────── 3 · Und wenn wir schießen, wird es laut (ja), Blaulicht und Siren'n (Bra) ───────── */
const ROADS = (() => { const out: string[] = []; for (let i = 0; i < 16; i++) out.push(`M ${-200 + i * 170} -200 L ${-200 + i * 170 + 120} 1400`); for (let j = 0; j < 10; j++) out.push(`M -300 ${-100 + j * 150} L 2300 ${-160 + j * 150}`); return out; })();
export const MapLight: React.FC<{ t: number; route?: number; car?: number; flash?: number }> = ({ t, route = 0, car = 0, flash = 0 }) => {
  const path = "M 260 980 L 520 760 L 840 700 L 1060 520 L 1380 460 L 1720 180";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <rect width={1920} height={1080} fill={C.mapLand} />
      <path d="M 1450 -20 C 1500 200 1700 260 1960 250 L 1960 -20 Z" fill={C.mapWater} />
      <rect x={300} y={160} width={280} height={190} rx={20} fill={C.mapPark} /><rect x={1180} y={680} width={360} height={240} rx={24} fill={C.mapPark} />
      {ROADS.map((d, i) => <path key={i} d={d} stroke={C.mapRoad} strokeWidth={i % 5 === 2 ? 26 : 13} fill="none" />)}
      <path d="M -50 610 C 600 560 1300 640 1980 560" stroke="#ffd36b" strokeWidth={30} fill="none" /><path d="M -50 610 C 600 560 1300 640 1980 560" stroke="#ffe7a6" strokeWidth={20} fill="none" />
      <path d={path} stroke={C.blue} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${route} 1`} />
      <CarOnPath d={path} k={car} flash={flash} t={t} />
    </svg>
  );
};
const CarOnPath: React.FC<{ d: string; k: number; flash: number; t: number }> = ({ d, k, flash, t }) => {
  const pts = d.replace(/[ML]/g, "").trim().split(/\s+/).map(Number); const P: [number, number][] = []; for (let i = 0; i < pts.length; i += 2) P.push([pts[i], pts[i + 1]]);
  const seg = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1])); const tot = seg.reduce((a, b) => a + b, 0);
  let L = k * tot, i = 0; while (i < seg.length - 1 && L > seg[i]) { L -= seg[i]; i++; }
  const f = seg[i] ? L / seg[i] : 0; const x = P[i][0] + (P[i + 1][0] - P[i][0]) * f, y = P[i][1] + (P[i + 1][1] - P[i][1]) * f;
  const red = Math.sin(t * 14) > 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={90} fill={red ? "rgba(255,59,48,0.22)" : "rgba(10,132,255,0.22)"} opacity={flash} />
      <circle r={34} fill="#fff" stroke="rgba(0,0,0,0.08)" strokeWidth={2} />
      <path d="M-18 6 h36 v-8 l-6-10 h-24 l-6 10z" fill="#1c1c1e" /><circle cx={-10} cy={8} r={4} fill="#1c1c1e" /><circle cx={10} cy={8} r={4} fill="#1c1c1e" />
      <rect x={-9} y={-18} width={8} height={5} rx={2} fill={red ? C.red : "#ffb3ad"} /><rect x={1} y={-18} width={8} height={5} rx={2} fill={red ? "#9fd0ff" : C.blue} />
    </g>
  );
};
export const S3: React.FC = () => {
  const t = useT(); const f = Math.round(t * FPS);
  const s0 = ls(2), laut = ws(2, "laut"), blau = ws(2, "blaulicht"), end = ls(3);
  const inn = eio(pr(t, s0 - 0.25, s0 + 0.3));
  const loud = eo(pr(t, laut - 0.05, laut + 0.15)) * (1 - 0.4 * pr(t, laut + 0.6, blau));
  const toMap = eio(pr(t, blau - 0.2, blau + 0.45));
  const N = 96;
  const bars = Array.from({ length: N }, (_, i) => { const e = energy(f - (N - i) * 2); return Math.max(0.04, e * (1 + loud * 1.8)) * (0.6 + 0.4 * Math.sin(i * 1.7) ** 2); });
  const flash = pr(t, blau, blau + 0.2);
  const cw = lerp(1300, 1920, toMap), ch = lerp(380, 1080, toMap);
  const exitZ = eio(pr(t, end - 0.3, end + 0.25)); // map disappears through a fluid zoom
  return (
    <AbsoluteFill>
     <AbsoluteFill style={{ transform: `scale(${1 + exitZ * 3})`, opacity: 1 - exitZ, transformOrigin: "960px 560px" }}>
      <div style={{ position: "absolute", left: 960 - cw / 2, top: lerp(620, 540, toMap) - ch / 2, width: cw, height: ch, borderRadius: lerp(44, 0, toMap), overflow: "hidden", background: "#fff", boxShadow: SHADOW,
        transform: `scaleX(${lerp(0.02, 1, eo(inn))})` }}>
        {toMap < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toMap }}>
            <div style={{ position: "absolute", left: 44, top: 30, display: "flex", gap: 14, alignItems: "center", fontFamily: SANS }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: C.red }} /><span style={{ fontSize: 28, fontWeight: 700 }}>Aufnahme</span>
              <span style={{ fontSize: 26, color: C.grey, fontVariantNumeric: "tabular-nums" }}>0:{String(Math.floor((t - s0 + 3) % 60)).padStart(2, "0")}</span>
            </div>
            <svg width={1300} height={380} style={{ position: "absolute", left: 0, top: 0 }}>
              <line x1={40} x2={1260} y1={215} y2={215} stroke={C.line} strokeWidth={2} />
              {bars.map((b, i) => { const h = Math.min(300, b * 220); return <rect key={i} x={50 + i * 12.6} y={215 - h / 2} width={6} height={h} rx={3} fill={mixHex("#1c1c1e", "#ff3b30", loud)} />; })}
            </svg>
          </div>
        )}
        {toMap > 0 && <div style={{ position: "absolute", inset: 0, opacity: toMap }}><MapLight t={t} route={eio(pr(t, blau, end - 0.2))} car={eio(pr(t, blau + 0.1, end))} flash={flash} /></div>}
      </div>
      {/* red / blue light reflections (visual siren) */}
      {flash > 0 && (
        <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: flash * 0.55 }}>
          <AbsoluteFill style={{ background: `radial-gradient(45% 60% at ${Math.sin(t * 7) > 0 ? "18%" : "82%"} 30%, ${Math.sin(t * 7) > 0 ? "rgba(255,59,48,0.55)" : "rgba(10,132,255,0.55)"}, transparent 70%)` }} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 18%, transparent 30%)", opacity: toMap }} />
     </AbsoluteFill>
      <Lyric line={2} accents={{ laut: { color: C.red, weight: 900 }, blaulicht: { color: C.blue }, "siren’n": { color: C.red, italic: true } }} out={end - 0.15} />
    </AbsoluteFill>
  );
};

/* ───────── 4 · Erst fallen Schüsse, danach fallen Mamas Trän'n ───────── */
export const S4: React.FC = () => {
  const t = useT();
  const s0 = ls(3), mama = ws(3, "mamas"), tr = ws(3, "trän’n"), end = ls(4);
  const big = eio(pr(t, mama - 0.35, mama + 0.4));
  const toBubble = eio(pr(t, end - 0.35, end + 0.2));
  const drops = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ x: 120 + random(`dx${i}`) * 1680, s: 26 + random(`ds${i}`) * 34, v: 120 + random(`dv${i}`) * 160, ph: random(`dp${i}`) * 1200 })), []);
  const bs = lerp(70, 420, big);
  return (
    <AbsoluteFill>
      {drops.map((d, i) => { const y = ((t - s0 + 0.3) * d.v + d.ph) % 1300 - 200; return <Drop key={i} s={d.s} style={{ left: d.x, top: y, opacity: 0.85 * (1 - big * 0.6) * (1 - toBubble) }} />; })}
      {/* hero drop: falls in, grows, reflects a message from „Mama“ */}
      <div style={{ position: "absolute", left: 960 - bs / 2, top: lerp(-160, 600, eo(pr(t, s0, mama - 0.2))) - bs * 0.66 + lerp(0, -40, big), opacity: 1 - toBubble }}>
        <Drop s={bs}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(245,248,255,0.6)", transform: "scale(1.15)", opacity: big }}>
            <div style={{ position: "absolute", left: "50%", top: "18%", transform: "translateX(-50%)", textAlign: "center", fontFamily: SANS }}>
              <div style={{ margin: "0 auto", width: bs * 0.2, height: bs * 0.2, borderRadius: "50%", background: "linear-gradient(180deg,#a5adbd,#7d8597)", color: "#fff", fontSize: bs * 0.08, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>M</div>
              <div style={{ fontSize: bs * 0.06, fontWeight: 600, marginTop: 4, color: C.ink }}>Mama</div>
            </div>
            <div style={{ position: "absolute", left: "16%", top: "56%", background: "#e9e9eb", borderRadius: 22, padding: `${bs * 0.03}px ${bs * 0.045}px`, display: "flex", gap: bs * 0.018, opacity: pr(t, tr - 0.4, tr) }}>
              {[0, 1, 2].map((k) => <span key={k} style={{ width: bs * 0.028, height: bs * 0.028, borderRadius: "50%", background: "#8e8e93", opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * 5 - k * 0.7)) }} />)}
            </div>
          </div>
        </Drop>
      </div>
      <Lyric line={3} accents={{ "schüsse": { italic: true }, "trän’n": { color: C.blue, under: "rgba(10,132,255,0.25)" }, mamas: { weight: 800 } }} out={end - 0.1} />
    </AbsoluteFill>
  );
};
