// Scenes 5–8  (0:12.6 – 0:26.5)
import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import { C, SANS, SERIF, SHADOW } from "../theme";
import { ws, ls } from "../timing";
import { AppIcon, G, cl, pr, eo, eio, lerp, spring, useT } from "../ui/kit";
import { Lyric } from "../ui/Lyrics";
import { Capsule, Bundle, Avatar, Drop, ChromePistol } from "../ui/Objects";
import { Pastel, mixHex } from "./A";

/* ───────── 5 · Nein, sie können's nicht versteh'n … begreifen ───────── */
export const S5: React.FC = () => {
  const t = useT();
  const s0 = ls(4), b1 = ws(4, "versteh’n"), beg = ws(4, "begreifen"), end = ls(5);
  const morph = eio(pr(t, s0 - 0.35, s0 + 0.25)); // drop → bubble → chat window
  const blur = eio(pr(t, beg - 0.3, beg + 0.35));
  const q = spring(t, beg + 0.05, 0.6);
  const fly = Math.pow(pr(t, end - 0.62, end + 0.12), 2.2);
  const msgs = [
    { at: ws(4, "nein") + 0.15, txt: "Ich verstehe dich nicht.", me: false },
    { at: b1 + 0.1, txt: "Warum?", me: true },
    { at: ws(4, "können’s", 1) + 0.05, txt: "Du verstehst es nicht.", me: false },
  ];
  const ww = lerp(160, 1200, morph), hh = lerp(200, 760, morph);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + fly * 22})`, transformOrigin: "960px 470px", opacity: 1 - pr(t, end - 0.05, end + 0.12) }}>
        <div style={{ position: "absolute", left: 960 - ww / 2, top: 620 - hh / 2, width: ww, height: hh, borderRadius: lerp(80, 44, morph), background: morph < 0.5 ? mixHex("#cfe2fb", "#ffffff", morph * 2) : "#fff",
          boxShadow: SHADOW, overflow: "hidden", fontFamily: SANS, filter: `blur(${blur * 9}px)`, opacity: 1 - blur * 0.55 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, borderBottom: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: morph }}>
            <Avatar s={58} label="?" bg="linear-gradient(180deg,#a5adbd,#7d8597)" /><div style={{ fontSize: 22, marginTop: 6, color: C.ink }}>Unterhaltung</div>
          </div>
          {msgs.map((m, i) => { const k = spring(t, m.at, 0.45); if (k <= 0) return null; return (
            <div key={i} style={{ position: "absolute", top: 170 + i * 130, [m.me ? "right" : "left"]: 50, maxWidth: 760, padding: "22px 32px", borderRadius: 36, fontSize: 40,
              background: m.me ? C.blue : "#e9e9eb", color: m.me ? "#fff" : C.ink, transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 40}px)`, transformOrigin: m.me ? "right bottom" : "left bottom", opacity: cl(k * 2) } as React.CSSProperties}>{m.txt}</div>); })}
        </div>
        {/* the big question mark – the camera flies through its dot */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 620, lineHeight: 1, color: C.blue,
          transform: `scale(${0.4 + 0.6 * q})`, opacity: cl(q * 1.5), textShadow: "0 40px 80px rgba(10,132,255,0.25)" }}>?</div>
      </AbsoluteFill>
      <Lyric line={4} accents={{ "versteh’n": { italic: true }, begreifen: { color: C.pink, italic: true } }} out={end - 0.4} />
    </AbsoluteFill>
  );
};

/* ───────── 6 · Ich brauch' mich nicht beweisen, du kannst mich nicht vergleichen ───────── */
export const S6: React.FC = () => {
  const t = useT();
  const s0 = ls(5), ver = ws(5, "vergleichen"), end = ls(6);
  const inn = eio(pr(t, s0 - 0.1, s0 + 0.5));
  const sym = spring(t, ws(5, "du") - 0.1, 0.5) * (1 - pr(t, ver, ver + 0.3));
  const fwd = eio(pr(t, ver + 0.05, ver + 0.6));
  const toMap = eio(pr(t, end - 0.4, end + 0.15));
  const parts = useMemo(() => Array.from({ length: 26 }, (_, i) => [random(`pa${i}`) * Math.PI * 2, 60 + random(`pr${i}`) * 140]), []);
  const card = (label: string, sub: string, bg: string, x: number, sc: number, op: number, blur: number) => (
    <div style={{ position: "absolute", left: x - 260, top: 620 - 330, width: 520, height: 660, borderRadius: 44, background: "#fff", boxShadow: SHADOW, fontFamily: SANS, transform: `scale(${sc})`, opacity: op, filter: `blur(${blur}px)`, textAlign: "center" }}>
      <div style={{ marginTop: 70, display: "flex", justifyContent: "center" }}><Avatar s={180} label={label === "ICH" ? "ICH" : "···"} bg={bg} /></div>
      <div style={{ fontSize: 56, fontWeight: 800, marginTop: 34, letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 24, color: C.grey, marginTop: 6 }}>{sub}</div>
      <div style={{ margin: "40px 46px 0", height: 14, borderRadius: 7, background: "#f2f2f7" }}><div style={{ width: label === "ICH" ? "100%" : "55%", height: "100%", borderRadius: 7, background: label === "ICH" ? C.blue : C.grey2 }} /></div>
      <div style={{ margin: "20px 46px 0", height: 14, borderRadius: 7, background: "#f2f2f7" }}><div style={{ width: label === "ICH" ? "100%" : "40%", height: "100%", borderRadius: 7, background: label === "ICH" ? C.pink : C.grey2 }} /></div>
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: inn * (1 - toMap), transform: `scale(${lerp(1.3, 1, inn)})` }}>
        {card("ANDERE", "Profil", "linear-gradient(180deg,#c7c7cc,#9a9aa0)", lerp(1280, 1500, fwd), lerp(1, 0.78, fwd), lerp(1, 0.35, fwd), fwd * 6)}
        {card("ICH", "Profil", "linear-gradient(180deg,#5aa9ff,#0a5bd8)", lerp(640, 960, fwd), lerp(1, 1.12, fwd) * (1 - toMap * 0.85), 1, 0)}
        {/* compare symbol dissolves into particles */}
        <div style={{ position: "absolute", left: 960 - 60, top: 560, width: 120, height: 120, borderRadius: 60, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SANS, fontSize: 58, fontWeight: 700, color: C.ink, transform: `scale(${sym})`, opacity: sym }}>⇄</div>
        {t > ver && t < ver + 0.9 && parts.map(([a, r], i) => { const k = eo(pr(t, ver, ver + 0.8)); return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r * k * 2, top: 620 + Math.sin(a) * r * k * 2, width: 8, height: 8, borderRadius: 4, background: C.grey2, opacity: 1 - k }} />; })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 96, color: C.pink, letterSpacing: "0.06em",
          opacity: pr(t, ver + 0.25, ver + 0.6), transform: `translateY(${(1 - eo(pr(t, ver + 0.25, ver + 0.7))) * 30}px)` }}>UNVERGLEICHBAR</div>
      </AbsoluteFill>
      <Lyric line={5} accents={{ "beweisen": { italic: true }, vergleichen: { color: C.blue } }} out={end - 0.2} />
    </AbsoluteFill>
  );
};

/* ───────── 7 · Wir sind nicht wie die meisten, Makarow aus Stalingrad (Bra) ───────── */
const LAND = feature(land110 as never, (land110 as unknown as { objects: { land: never } }).objects.land) as never;
export const S7: React.FC = () => {
  const t = useT();
  const s0 = ls(6), mak = ws(6, "makarow"), sta = ws(6, "stalingrad"), end = ls(7);
  const inn = eio(pr(t, s0 - 0.35, s0 + 0.3));
  const z = eio(pr(t, s0 + 0.2, sta - 0.1));
  const pin = spring(t, sta - 0.05, 0.5);
  const metal = eio(pr(t, end - 0.7, end - 0.25));
  const out = eio(pr(t, end - 0.3, end + 0.15));
  const target: [number, number] = [44.5, 48.7]; // Volgograd
  const scale = 300 * Math.pow(26, z);
  const center: [number, number] = [lerp(20, target[0], eio(Math.min(1, z * 1.3))), lerp(30, target[1], eio(Math.min(1, z * 1.3)))];
  const proj = geoMercator().scale(scale).center(center).translate([960, 610]);
  const d = geoPath(proj)(LAND) ?? "";
  const [px, py] = proj(target) ?? [960, 610];
  const graticule: string[] = []; for (let lo = -180; lo <= 180; lo += 15) graticule.push(geoPath(proj)({ type: "LineString", coordinates: Array.from({ length: 33 }, (_, i) => [lo, -80 + i * 5]) } as never) ?? "");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C.mapWater, opacity: inn, clipPath: `circle(${lerp(6, 120, inn) * (1 - out) + 0.01}% at ${lerp(960, px, out)}px ${lerp(620, py - 60, out)}px)` }}>
        <svg width={1920} height={1080}>
          {graticule.map((g, i) => <path key={i} d={g} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} fill="none" />)}
          <path d={d} fill="#eef0ea" stroke="#d6dccd" strokeWidth={1.2} />
          <path d={geoPath(proj)({ type: "LineString", coordinates: [[44.0, 50.5], [44.4, 49.4], [44.6, 48.6], [45.6, 47.2], [47.5, 46.3]] } as never) ?? ""} stroke="#a9d3f3" strokeWidth={lerp(1, 18, z)} fill="none" strokeLinecap="round" />
          {/* user location dot (the ICH card shrank into it) */}
          <circle cx={px} cy={py} r={lerp(30, 14, z) + Math.sin(t * 4) * 3} fill="rgba(10,132,255,0.18)" opacity={1 - pin} />
          <circle cx={px} cy={py} r={11} fill={C.blue} stroke="#fff" strokeWidth={4} opacity={1 - pin} />
        </svg>
        {/* pin → metallic object */}
        <div style={{ position: "absolute", left: px - 40, top: py - 110 - (1 - pin) * 120, opacity: cl(pin * 2) * (1 - metal), transform: `scale(${pin})`, transformOrigin: "50% 100%" }}>
          <svg width={80} height={110} viewBox="0 0 24 33"><path d="M12 0a11 11 0 0 0-11 11c0 8 11 22 11 22s11-14 11-22A11 11 0 0 0 12 0z" fill={C.red} /><circle cx={12} cy={11} r={4.5} fill="#fff" /></svg>
        </div>
        {/* label card */}
        <div style={{ position: "absolute", left: px + 190, top: py - 60, padding: "18px 26px", borderRadius: 22, background: "rgba(255,255,255,0.9)", boxShadow: SHADOW, fontFamily: SANS, opacity: pr(t, sta + 0.1, sta + 0.35) * (1 - out),
          transform: `translateX(${(1 - eo(pr(t, sta + 0.1, sta + 0.4))) * 30}px)` }}>
          <div style={{ fontSize: 34, fontWeight: 800 }}>Stalingrad</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 18%, transparent 30%)", opacity: inn * (1 - out) }} />
      {/* pin → chrome object → it flies to the centre and becomes the first wallet card (scene 8) */}
      <div style={{ position: "absolute", left: lerp(px, 960, out) - 130, top: lerp(py - 160, 560, out) - 40, opacity: metal * (1 - pr(t, end - 0.05, end + 0.15)), transform: `scale(${lerp(0.3, 1.1, metal) * (1 + out * 0.4)}) rotate(${(1 - metal) * -25}deg)` }}><ChromePistol w={300} rot={Math.sin(t * 1.8) * 14} /></div>
      <Lyric line={6} accents={{ "meisten": { italic: true }, makarow: { weight: 800 }, stalingrad: { color: C.red } }} out={end - 0.1} />
    </AbsoluteFill>
  );
};

export const BUNDLES = [[760, 560], [980, 600], [1180, 540], [860, 700], [1100, 720], [620, 420], [1320, 430]];
export const LAM_ZOOM = 0.7; // floor zoom at the end of scene 8 (origin 960/640)
/* ───────── 8 · Bunker' Cash für die Fam unterm Laminat ───────── */
export const S8: React.FC = () => {
  const t = useT();
  const s0 = ls(7), cash = ws(7, "cash"), lam = ws(7, "laminat"), end = ls(8);
  const flip = eio(pr(t, s0 - 0.35, s0 + 0.2));
  const count = eio(pr(t, cash - 0.05, cash + 1.0));
  const down = eio(pr(t, cash + 0.65, lam - 0.2));
  const lift = eio(pr(t, lam - 0.1, lam + 0.45));
  const zoom = eio(pr(t, lam + 0.35, end - 0.1));
  const amount = Math.round(count * 248500);
  const cards = [["#1c1c1e", "Cash"], ["#0a84ff", "Karte"], ["#34c759", "Sparen"], ["#ff2d73", "Familie"]];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${-down * 1240}px)` }}>
        {/* wallet stack */}
        {cards.map(([bg, n], i) => { const k = spring(t, s0 + 0.05 + i * 0.1, 0.55); const top = 380 + i * 92 - (i === 0 ? 0 : 0);
          return (
            <div key={i} style={{ position: "absolute", left: 960 - 380, top: lerp(1200, top, k), width: 760, height: 470, borderRadius: 36, background: bg as string, boxShadow: SHADOW, fontFamily: SANS, color: "#fff",
              transform: i === 0 ? `perspective(1400px) rotateY(${(1 - flip) * 180}deg)` : undefined, zIndex: 10 - i }}>
              <div style={{ position: "absolute", left: 40, top: 32, fontSize: 32, fontWeight: 700 }}>{n as string}</div>
              {i === 0 && (<>
                <div style={{ position: "absolute", left: 40, top: 250, fontSize: 24, opacity: 0.6 }}>Guthaben</div>
                <div style={{ position: "absolute", left: 40, top: 286, fontSize: 96, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{amount.toLocaleString("de-DE")} €</div>
                <div style={{ position: "absolute", right: 40, top: 30, width: 70, height: 46, borderRadius: 8, background: "linear-gradient(135deg,#d9c27a,#a88a3c)" }} />
              </>)}
            </div>);
        })}
      </AbsoluteFill>
      {/* laminate floor rises into view, planks lift, cash bundles underneath */}
      <AbsoluteFill style={{ transform: `translateY(${(1 - down) * 1080}px)`, perspective: 1600, opacity: 1 - pr(t, end - 0.05, end + 0.3) }}>
        <AbsoluteFill style={{ transform: `scale(${1 + zoom * LAM_ZOOM})`, transformOrigin: "960px 640px" }}>
          <AbsoluteFill style={{ background: "#2d2620" }}>
            {/* hidden cash */}
            {BUNDLES.map(([x, y], i) => <Bundle key={i} w={210} style={{ position: "absolute", left: x - 105, top: y - 50, transform: `rotate(${(i - 2) * 6}deg)`, opacity: lift * (1 - pr(t, end - 0.45, end - 0.4)) }} />)}
          </AbsoluteFill>
          {Array.from({ length: 9 }, (_, r) => (
            <div key={r} style={{ position: "absolute", left: 0, top: r * 124, width: 1920, height: 124, display: "flex" }}>
              {Array.from({ length: 5 }, (_, c) => {
                const open = (r === 4 || r === 5) && (c === 2 || c === 3) ? lift : 0;
                const w = 420 + ((r * 37 + c * 53) % 90); const shade = 0.88 + ((r * 7 + c * 3) % 5) * 0.03;
                return <div key={c} style={{ width: w, height: 122, marginRight: 2, flexShrink: 0, marginLeft: c === 0 ? -((r * 131) % 300) : 0,
                  background: `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.06)), repeating-linear-gradient(90deg, rgba(120,80,40,0.10) 0 3px, transparent 3px 22px), linear-gradient(90deg, ${mixHex("#d8b98c", "#b98f5f", shade - 0.88)} , ${mixHex("#cfae7f", "#a77d50", shade - 0.88)})`,
                  transformOrigin: "50% 0%", transform: `rotateX(${open * 72}deg)`, boxShadow: open ? "0 30px 40px rgba(0,0,0,0.35)" : "inset 0 -2px 0 rgba(0,0,0,0.08)" }} />;
              })}
            </div>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
      <Lyric line={7} accents={{ cash: { color: C.green, weight: 900 }, fam: { color: C.pink, italic: true }, laminat: { italic: true } }} out={end - 0.15} dark={down > 0.5} />
    </AbsoluteFill>
  );
};
export const _B = { Drop, AppIcon, G, lerp };
