// Werbevideo „Kostenloses Musikvideo – Warteliste“. 1080×1920 @ 60 fps. Apple-style, all German, real clips from own projects.
import React from "react";
import { AbsoluteFill, Audio, Loop, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SANS, cl, pr, eo, lerp, spring, useT } from "../shared/StoryKit";

export const PROMO_S = 35.6;
const T = { q1: 0.35, q2: 2.5, phone: 4.5, why1: 7.5, why2: 9.2, anders: 11.0, song: 12.4, free: 13.8, show: 15.0, lyr: 18.0, look: 19.8, form: 21.5, wait: 26.0, cost: 28.8, rest: 30.2, cta: 31.5 };
const CX = 540, TW = 780; // text column 150…930 → inside TikTok safe zone, visually centered
const INK = "#0b0b0f", GREY = "#86868b", BLUE = "#0a84ff";
const GRAD = "linear-gradient(90deg,#5e5ce6,#0a84ff 35%,#30d158 70%,#ffd60a)";

/* ───── helpers ───── */
const Line: React.FC<{ t: number; t0: number; t1?: number; top: number; size: number; color?: string; children: React.ReactNode; weight?: number; grad?: boolean; ls?: string }> = ({ t, t0, t1, top, size, color = "#fff", children, weight = 800, grad, ls = "-0.04em" }) => {
  const k = eo(pr(t, t0, t0 + 0.55)); const o = t1 !== undefined ? pr(t, t1 - 0.3, t1) : 0;
  if (k <= 0 || o >= 1) return null;
  return <div style={{ position: "absolute", left: CX - TW / 2, width: TW, top, textAlign: "center", fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.04, letterSpacing: ls, color,
    opacity: k * (1 - o), transform: `translateY(${(1 - k) * 40 - o * 30}px) scale(${0.96 + 0.04 * k})`, filter: k < 1 || o > 0 ? `blur(${(1 - k) * 12 + o * 12}px)` : undefined,
    ...(grad ? { background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}) }}>{children}</div>;
};
const Clip: React.FC<{ name: string; from: number; style?: React.CSSProperties }> = ({ name, from, style }) => {
  const { fps } = useVideoConfig();
  return <Sequence from={Math.round(from * fps)} layout="none"><Loop durationInFrames={Math.round(2.1 * fps)} layout="none"><OffthreadVideo src={staticFile(`promo/clips/${name}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} /></Loop></Sequence>;
};
const Glow: React.FC<{ t: number; color?: string; op?: number }> = ({ t, color = "#5e5ce6", op = 0.5 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(40% 25% at ${50 + Math.sin(t * 0.6) * 12}% ${42 + Math.cos(t * 0.5) * 6}%, ${color}, transparent 70%)`, opacity: op }} />
);

/* ───── scenes ───── */
const S1: React.FC<{ t: number }> = ({ t }) => (<AbsoluteFill style={{ background: "#000" }}>
  <Glow t={t} op={0.25 + 0.15 * pr(t, 0, 4)} />
  <Line t={t} t0={T.q1} t1={T.q2} top={760} size={92}>Du willst ein animiertes Musikvideo?</Line>
  <Line t={t} t0={T.q2} t1={T.phone} top={760} size={92}>Weißt aber nicht, <span style={{ color: GREY }}>wie es geht?</span></Line>
</AbsoluteFill>);

const COMMENTS = [["lena.music", "Wie macht man solche Musikvideos?", "2.481"], ["beatsbykev", "Kannst du ein Tutorial machen? 🙏", "1.906"], ["jxnas_", "Welche Programme benutzt du?", "1.233"], ["melody.mp3", "Wie bekommt man diese Animationen hin?", "987"]];
const SPhone: React.FC<{ t: number }> = ({ t }) => {
  const k = eo(pr(t, T.phone, T.phone + 0.6)); const ry = lerp(-18, -6, pr(t, T.phone, T.why1));
  return (<AbsoluteFill style={{ background: "#000", perspective: 1800 }}>
    <Glow t={t} op={0.35} />
    <div style={{ position: "absolute", left: CX - 290, top: 300, width: 580, height: 1100, borderRadius: 86, background: "#111", border: "8px solid #2a2a2e", boxShadow: "0 60px 140px rgba(94,92,230,0.25), inset 0 0 0 2px rgba(255,255,255,0.06)", overflow: "hidden",
      transform: `translateY(${(1 - k) * 300}px) rotateY(${ry}deg) rotateX(6deg)`, opacity: k }}>
      <div style={{ position: "absolute", inset: 0, filter: "blur(6px) brightness(0.65)" }}><Clip name="ni_eye" from={T.phone} /></div>
      <div style={{ position: "absolute", left: 210, top: 22, width: 160, height: 46, borderRadius: 23, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 690, borderRadius: "40px 40px 0 0", background: "rgba(255,255,255,0.97)", padding: "26px 30px", boxSizing: "border-box", fontFamily: SANS }}>
        <div style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: INK, marginBottom: 18 }}>4.127 Kommentare</div>
        {COMMENTS.map(([u, c, l], i) => { const kk = spring(t, T.phone + 0.5 + i * 0.6, 0.35); return (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 26, opacity: cl(kk * 2), transform: `translateY(${(1 - kk) * 40}px) scale(${0.9 + 0.1 * kk})`, transformOrigin: "left center" }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, flexShrink: 0, background: ["linear-gradient(135deg,#ff9a9e,#fad0c4)", "linear-gradient(135deg,#a18cd1,#fbc2eb)", "linear-gradient(135deg,#84fab0,#8fd3f4)", "linear-gradient(135deg,#fccb90,#d57eeb)"][i] }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 22, color: GREY, fontWeight: 600 }}>{u}</div><div style={{ fontSize: 31, color: INK, fontWeight: 600, lineHeight: 1.2, marginTop: 2 }}>{c}</div></div>
            <div style={{ textAlign: "center", color: GREY, fontSize: 20 }}><div style={{ fontSize: 30 }}>♡</div>{l}</div>
          </div>); })}
      </div>
    </div>
  </AbsoluteFill>);
};

const PRICES = [["Tutorial", "49,99 €"], ["KI-Abo", "29,99 € / Monat"], ["Software", "299 €"], ["Geheime Methode", "🔒"]];
const SWhy: React.FC<{ t: number }> = ({ t }) => {
  const spread = eo(pr(t, T.why1, T.why2 + 1.2)); const open = eo(pr(t, T.why2 + 0.8, T.why2 + 1.2)); const wipe = eo(pr(t, T.anders - 0.35, T.anders));
  return (<AbsoluteFill style={{ background: "#000", perspective: 1600 }}>
    <Glow t={t} color="#ff375f" op={0.18} />
    {PRICES.map(([a, b], i) => { const ang = (i / 4) * Math.PI * 2 + 0.6; const r = 120 + spread * 330; const k = spring(t, T.why1 + 0.1 + i * 0.12, 0.45);
      return <div key={i} style={{ position: "absolute", left: CX + Math.cos(ang) * r * 1.1 - 170, top: 1000 + Math.sin(ang) * r * 0.55 - 60, width: 340, padding: "22px 26px", borderRadius: 30, background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.14)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", fontFamily: SANS, color: "#fff",
        transform: `rotateY(${Math.cos(ang) * 22}deg) rotateX(${Math.sin(ang) * 10}deg) scale(${0.8 + 0.2 * k})`, opacity: cl(k * 2) * (t > T.why2 ? 0.35 : 1), filter: t > T.why2 ? "blur(3px)" : undefined }}>
        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{a}</div><div style={{ fontSize: 40, fontWeight: 800, marginTop: 4 }}>{b}</div></div>; })}
    <Line t={t} t0={T.why1 + 0.1} t1={T.why2} top={430} size={86}>Warum muss eigentlich <span style={{ color: "#ff375f" }}>alles Geld kosten?</span></Line>
    <Line t={t} t0={T.why2} top={430} size={78}>Warum Wissen zurückhalten, wenn man es <span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>teilen kann?</span></Line>
    {t > T.why2 + 0.2 && <svg width={200} height={240} viewBox="0 0 100 120" style={{ position: "absolute", left: CX - 100, top: 900, opacity: pr(t, T.why2 + 0.2, T.why2 + 0.5) }}>
      <path d={`M30 55 V35 a20 20 0 0 1 40 0 V${lerp(55, 40, open)}`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" transform={`translate(${open * 18} ${-open * 10}) rotate(${open * 25} 70 40)`} />
      <rect x={18} y={52} width={64} height={56} rx={12} fill="#fff" /><circle cx={50} cy={76} r={7} fill="#000" /><rect x={47} y={78} width={6} height={14} rx={3} fill="#000" />
    </svg>}
    {wipe > 0 && <div style={{ position: "absolute", left: CX - 2000 * wipe, top: 1010 - 2000 * wipe, width: 4000 * wipe, height: 4000 * wipe, borderRadius: "50%", background: "#fff" }} />}
  </AbsoluteFill>);
};

const SAnders: React.FC<{ t: number }> = ({ t }) => {
  const rot = t * 40; const free = spring(t, T.free, 0.5);
  return (<AbsoluteFill style={{ background: "#fff", perspective: 1400 }}>
    <AbsoluteFill style={{ background: "radial-gradient(50% 35% at 50% 70%, rgba(94,92,230,0.12), transparent 70%)" }} />
    <div style={{ position: "absolute", left: CX - 260, top: 1020, width: 520, height: 520, borderRadius: "50%", background: "conic-gradient(from 0deg, #5e5ce6, #0a84ff, #30d158, #ffd60a, #ff375f, #5e5ce6)", filter: "blur(2px)",
      transform: `rotateX(68deg) rotateZ(${rot}deg) scale(${0.6 + 0.4 * eo(pr(t, T.anders, T.anders + 0.8))})`, opacity: 0.85 - 0.6 * pr(t, T.free, T.free + 0.4), boxShadow: "0 0 120px rgba(94,92,230,0.4)" }} />
    <Line t={t} t0={T.anders + 0.05} t1={T.song} top={640} size={112} color={INK}>Ich mache es anders.</Line>
    {t >= T.song && t < T.free && <div style={{ position: "absolute", left: CX - TW / 2, width: TW, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 100, letterSpacing: "-0.045em", lineHeight: 1.06, color: INK }}>
      {["Dein Song.", "Deine Texte.", "Dein Musikvideo."].map((s, i) => { const k = eo(pr(t, T.song + 0.05 + i * 0.4, T.song + 0.5 + i * 0.4)); return <div key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 40}px)`, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined, ...(i === 2 ? { background: GRAD, WebkitBackgroundClip: "text", color: "transparent" } : {}) }}>{s}</div>; })}
    </div>}
    {t >= T.free && <div style={{ position: "absolute", left: CX - TW / 2, width: TW, top: 520, textAlign: "center", fontFamily: SANS, transform: `scale(${0.8 + 0.2 * free})`, opacity: cl(free * 2) }}>
      <div style={{ fontSize: 250, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1, whiteSpace: "nowrap", background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>100 %</div>
      <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: "0.02em", color: INK, marginTop: 6 }}>KOSTENLOS</div>
      <div style={{ position: "absolute", left: 0, top: 0, width: TW, height: 420, background: `linear-gradient(100deg, transparent ${pr(t, T.free + 0.3, T.free + 1.0) * 140 - 30}%, rgba(255,255,255,0.8) ${pr(t, T.free + 0.3, T.free + 1.0) * 140 - 20}%, transparent ${pr(t, T.free + 0.3, T.free + 1.0) * 140 - 10}%)` }} />
    </div>}
  </AbsoluteFill>);
};

const CAR = ["mr_title", "ni_eye", "mr_car", "ni_heart", "ni_city"];
const SShow: React.FC<{ t: number }> = ({ t }) => {
  // phase 1: 9:16 carousel · phase 2: 16:9 glass panel · phase 3: 3D wall
  const step = 0.6; const raw = (t - T.show - 0.2) / step; const p = Math.floor(raw) + eo(cl((raw - Math.floor(raw)) / 0.45));
  const ph2 = eo(pr(t, T.lyr - 0.15, T.lyr + 0.35)), ph3 = eo(pr(t, T.look - 0.15, T.look + 0.35));
  const fe = ["fe_map", "fe_ich", "fe_balls"]; const fi = Math.min(2, Math.max(0, Math.floor((t - T.lyr) / 0.6)));
  return (<AbsoluteFill style={{ background: "#f5f5f7", perspective: 1800, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 20% 15%, #e3e2ff, transparent 70%), radial-gradient(45% 30% at 85% 85%, #dff4ff, transparent 70%)" }} />
    {/* phase 1 */}
    {t < T.lyr + 0.4 && <AbsoluteFill style={{ opacity: 1 - ph2, transform: `scale(${1 - 0.1 * ph2})` }}>
      {CAR.map((c, i) => { const o = i - cl(p / (CAR.length - 1)) * (CAR.length - 1); const a = Math.abs(o); if (a > 2.2) return null;
        return <div key={c} style={{ position: "absolute", left: CX - 230 + o * 470, top: 450, width: 460, height: 818, borderRadius: 56, overflow: "hidden", background: "#000", border: "6px solid #1c1c1e", boxShadow: "0 50px 100px rgba(20,20,60,0.3)",
          transform: `rotateY(${-o * 28}deg) scale(${1 - 0.22 * Math.min(1, a)})`, opacity: 1 - 0.45 * Math.min(1, a), zIndex: 10 - Math.round(a) }}><Clip name={c} from={T.show} /></div>; })}
      <Line t={t} t0={T.show + 0.1} t1={T.lyr} top={300} size={60} color={INK}>Aus deiner Musik wird ein <span style={{ color: BLUE }}>visuelles Erlebnis.</span></Line>
    </AbsoluteFill>}
    {/* phase 2 */}
    {t > T.lyr - 0.2 && t < T.look + 0.4 && <AbsoluteFill style={{ opacity: ph2 * (1 - ph3) }}>
      <div style={{ position: "absolute", left: CX - 440, top: 620, width: 880, height: 495, borderRadius: 40, overflow: "hidden", boxShadow: "0 50px 120px rgba(20,20,60,0.28)", border: "1.5px solid rgba(255,255,255,0.9)",
        transform: `rotateX(${lerp(14, 4, pr(t, T.lyr, T.look))}deg) rotateY(${lerp(-10, 6, pr(t, T.lyr, T.look))}deg) scale(${0.92 + 0.08 * ph2})` }}>
        {fe.map((c, i) => <div key={c} style={{ position: "absolute", inset: 0, opacity: i === fi ? 1 : 0 }}><Clip name={c} from={T.lyr - 0.2} /></div>)}
      </div>
      <div style={{ position: "absolute", left: CX - 440, top: 1140, width: 880, height: 60, borderRadius: 30, background: "radial-gradient(50% 50% at 50% 50%, rgba(20,20,60,0.18), transparent 70%)" }} />
      <Line t={t} t0={T.lyr} t1={T.look} top={330} size={66} color={INK}>Deine Lyrics. <span style={{ color: GREY }}>Kreativ in Szene gesetzt.</span></Line>
    </AbsoluteFill>}
    {/* phase 3: 3D wall */}
    {t > T.look - 0.2 && <AbsoluteFill style={{ opacity: ph3 }}>
      <div style={{ position: "absolute", left: CX - 750, top: 380, width: 1500, height: 1300, transform: `rotateX(28deg) rotateZ(-12deg) translateY(${-(t - T.look) * 90}px)`, transformStyle: "preserve-3d", display: "grid", gridTemplateColumns: "repeat(5, 270px)", gap: 30 }}>
        {["mr_par", "ni_glass", "mr_title", "ni_city", "mr_car", "ni_heart", "ni_eye", "mr_par", "ni_glass", "mr_title"].map((c, i) => <div key={i} style={{ width: 270, height: 480, borderRadius: 30, overflow: "hidden", boxShadow: "0 30px 60px rgba(20,20,60,0.25)", background: "#000" }}><Clip name={c} from={T.look - 0.2 - (i % 3) * 0.4} /></div>)}
      </div>
      <div style={{ position: "absolute", left: CX - 400, width: 800, top: 270, padding: "26px 0", borderRadius: 40, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(20,20,60,0.15)", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: "-0.035em", color: INK,
        opacity: eo(pr(t, T.look, T.look + 0.4)), transform: `translateY(${(1 - eo(pr(t, T.look, T.look + 0.4))) * 30}px)` }}>Jeder Song verdient<br />seinen eigenen Look.</div>
    </AbsoluteFill>}
  </AbsoluteFill>);
};

const FIELDS: [string, string, "text" | "file" | "lyrics"][] = [["Dein Benutzername", "@deinname", "text"], ["Kontakt (Instagram, Snapchat oder TikTok)", "Instagram: @deinname", "text"], ["Dein TikTok-Benutzername", "@deinname", "text"], ["Song hochladen", "mein_song.mp3", "file"], ["Songtext einfügen", "Strophe 1 – deine Lyrics …", "lyrics"]];
const F0 = T.form + 0.4, FD = 0.5;
const SForm: React.FC<{ t: number }> = ({ t }) => {
  const k = eo(pr(t, T.form, T.form + 0.6)); const click = F0 + FIELDS.length * FD + 0.45; const done = t > click + 0.15;
  const focus = Math.min(FIELDS.length - 1, Math.floor((t - F0) / FD)); const camY = done ? 0 : lerp(0, -40, cl((t - F0) / (FIELDS.length * FD)));
  const cur = { x: lerp(820, CX, eo(pr(t, click - 0.45, click - 0.05))), y: lerp(1260, 1225, eo(pr(t, click - 0.45, click - 0.05))) };
  const ok = spring(t, click + 0.15, 0.45);
  return (<AbsoluteFill style={{ background: "#f5f5f7", perspective: 1800 }}>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 80% 10%, #e3e2ff, transparent 70%), radial-gradient(45% 30% at 10% 90%, #dff4ff, transparent 70%)" }} />
    <div style={{ position: "absolute", left: CX - 420, top: 250 + camY, width: 840, borderRadius: 40, background: "rgba(255,255,255,0.92)", boxShadow: "0 50px 120px rgba(20,20,60,0.18)", border: "1.5px solid #fff", overflow: "hidden", fontFamily: SANS, color: INK,
      transform: `translateY(${(1 - k) * 200}px) rotateX(${(1 - k) * 18}deg) scale(${0.94 + 0.06 * k})`, opacity: k }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", borderBottom: "1px solid #ececf0", background: "#fafafc" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ marginLeft: 16, flex: 1, height: 40, borderRadius: 12, background: "#efeff4", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 22, color: GREY, fontWeight: 600 }}>🔒 Link in meiner Bio</div>
      </div>
      <div style={{ padding: "34px 44px 40px" }}>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em" }}>Dein kostenloses Musikvideo</div>
        <div style={{ fontSize: 26, color: GREY, marginTop: 6, marginBottom: 26 }}>Trag dich in die Warteliste ein.</div>
        {FIELDS.map(([label, val, kind], i) => { const s = F0 + i * FD; const typed = pr(t, s + 0.05, s + FD - 0.1); const active = focus === i && !done && t >= F0;
          return (<div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: GREY, marginBottom: 8 }}>{i + 1}. {label}</div>
            <div style={{ minHeight: kind === "lyrics" ? 96 : 66, borderRadius: 18, border: `2px solid ${active ? BLUE : "#e5e5ea"}`, boxShadow: active ? "0 0 0 6px rgba(10,132,255,0.14)" : "none", background: "#fff", padding: "14px 20px", boxSizing: "border-box", fontSize: 28, fontWeight: 600, display: "flex", alignItems: kind === "lyrics" ? "flex-start" : "center", gap: 12 }}>
              {kind === "file" ? (t > s ? <><span style={{ fontSize: 30 }}>🎵</span><span>{val}</span><div style={{ flex: 1, height: 8, borderRadius: 4, background: "#ececf0", marginLeft: 10 }}><div style={{ width: `${typed * 100}%`, height: "100%", borderRadius: 4, background: BLUE }} /></div>{typed >= 1 && <span style={{ color: "#30d158", fontWeight: 900 }}>✓</span>}</> : <span style={{ color: "#c7c7cc" }}>Datei auswählen</span>)
                : t > s ? <span>{val.slice(0, Math.round(typed * val.length))}{active && Math.floor(t * 4) % 2 === 0 ? <span style={{ color: BLUE }}>|</span> : null}</span> : <span style={{ color: "#c7c7cc" }}>…</span>}
            </div></div>); })}
        <div style={{ marginTop: 26, height: 92, borderRadius: 24, background: done ? "#30d158" : INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, transform: `scale(${1 - 0.05 * Math.sin(Math.PI * pr(t, click - 0.08, click + 0.12))})` }}>{done ? "✓ Eingetragen" : "Auf die Warteliste"}</div>
      </div>
    </div>
    {t > click - 0.6 && !done && <svg width={44} height={56} viewBox="0 0 22 28" style={{ position: "absolute", left: cur.x, top: cur.y, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}><path d="M2 2 L2 22 L7 17 L11 26 L14 24.5 L10 16 L17 16 Z" fill="#000" stroke="#fff" strokeWidth={1.6} /></svg>}
    {ok > 0.01 && <div style={{ position: "absolute", left: CX - 330, width: 660, top: 640, padding: "44px 30px", borderRadius: 48, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px)", boxShadow: "0 40px 120px rgba(20,20,60,0.25)", textAlign: "center", fontFamily: SANS, transform: `scale(${0.8 + 0.2 * ok})`, opacity: cl(ok * 2) }}>
      <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 60, background: "#30d158", color: "#fff", fontSize: 70, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
      <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", color: INK, marginTop: 20 }}>Du bist auf der Warteliste.</div>
      <div style={{ fontSize: 28, color: GREY, marginTop: 10, fontWeight: 600 }}>Ich melde mich bei dir, sobald du an der Reihe bist.</div>
    </div>}
  </AbsoluteFill>);
};

const ROWS = [["@m••••", "In Arbeit", "#ff9f0a"], ["@j••••", "Wartet", "#86868b"], ["@s••••", "Wartet", "#86868b"], ["Dein Platz", "Gesichert", "#30d158"], ["@k••••", "Wartet", "#86868b"], ["@a••••", "Wartet", "#86868b"]];
const SWait: React.FC<{ t: number }> = ({ t }) => {
  const scroll = eo(pr(t, T.wait + 0.3, T.cost - 0.3));
  return (<AbsoluteFill style={{ background: "#f5f5f7", perspective: 1400 }}>
    <AbsoluteFill style={{ background: "radial-gradient(40% 30% at 50% 65%, rgba(48,209,88,0.12), transparent 70%)" }} />
    <Line t={t} t0={T.wait + 0.05} top={300} size={64} color={INK}>Jedes Musikvideo wird <span style={{ color: BLUE }}>persönlich erstellt.</span></Line>
    <div style={{ position: "absolute", left: CX - 380, top: 560, width: 760, height: 620, transform: "rotateX(24deg)", transformStyle: "preserve-3d", overflow: "hidden", maskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)" }}>
      {ROWS.map(([n, s, c], i) => { const me = i === 3; const y = 40 + i * 118 - scroll * 230; const kk = spring(t, T.wait + 0.1 + i * 0.08, 0.4);
        return <div key={i} style={{ position: "absolute", left: me ? 0 : 20, right: me ? 0 : 20, top: y, height: me ? 104 : 96, borderRadius: 28, background: me ? "#fff" : "rgba(255,255,255,0.75)", boxShadow: me ? "0 0 0 4px #30d158, 0 20px 50px rgba(48,209,88,0.3)" : "0 10px 30px rgba(20,20,60,0.08)", display: "flex", alignItems: "center", padding: "0 30px", gap: 22, fontFamily: SANS, opacity: cl(kk * 2), transform: `translateX(${(1 - kk) * 200}px)` }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: GREY, width: 70 }}>#{i + 1}</div>
          <div style={{ flex: 1, fontSize: 34, fontWeight: 800, color: INK }}>{n}</div>
          <div style={{ padding: "8px 18px", borderRadius: 14, background: `${c}22`, color: c, fontWeight: 800, fontSize: 24 }}>{s}</div>
        </div>; })}
    </div>
    <Line t={t} t0={T.wait + 0.8} top={1190} size={44} color={INK} weight={700} ls="-0.02em">Deshalb gibt es eine Warteliste.<br /><span style={{ color: GREY }}>Melde dich früh an und sichere dir deinen Platz.</span></Line>
  </AbsoluteFill>);
};

const SCost: React.FC<{ t: number }> = ({ t }) => (<AbsoluteFill style={{ background: "#fff" }}>
  {["Keine kostenpflichtigen Abonnements.", "Keine teuren Programme.", "Keine versteckten Kosten."].map((s, i) => { const t0 = T.cost + 0.05 + i * 0.4; const k = eo(pr(t, t0, t0 + 0.4)); const o = pr(t, T.rest - 0.25, T.rest);
    return <div key={i} style={{ position: "absolute", left: CX - TW / 2, width: TW, top: 470 + i * 150, display: "flex", alignItems: "center", gap: 24, fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: "-0.03em", color: INK, opacity: k * (1 - o), transform: `translateX(${(1 - k) * -60}px)`, filter: o ? `blur(${o * 10}px)` : undefined }}>
      <span style={{ flexShrink: 0, width: 76, height: 76, borderRadius: 38, background: "#ff375f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 900 }}>✕</span>{s}</div>; })}
  <Line t={t} t0={T.rest} top={620} size={92} color={INK}>Du lieferst deinen Song.<br /><span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>Ich kümmere mich um den Rest.</span></Line>
</AbsoluteFill>);

const SCta: React.FC<{ t: number }> = ({ t }) => {
  const k = eo(pr(t, T.cta, T.cta + 0.7)); const sweep = pr(t, T.cta + 0.5, T.cta + 1.6); const bio = spring(t, T.cta + 1.4, 0.45);
  const depth = Array.from({ length: 10 }, (_, i) => `0 ${i + 1}px 0 rgba(${90 - i * 6},${90 - i * 6},${110 - i * 6},1)`).join(",") + ", 0 26px 50px rgba(0,0,0,0.6)";
  return (<AbsoluteFill style={{ background: "#000", perspective: 1600 }}>
    {Array.from({ length: 40 }, (_, i) => { const x = (i * 137.5) % 1080, y0 = (i * 263) % 1920; const y = (y0 - (t - T.cta) * (20 + (i % 5) * 8) + 1920) % 1920; return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.15 + (i % 4) * 0.08 }} />; })}
    <div style={{ position: "absolute", left: CX - 380, top: 420, width: 760, height: 760, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", boxShadow: "0 0 160px rgba(94,92,230,0.35), inset 0 0 120px rgba(10,132,255,0.15)", transform: `rotateX(70deg) rotateZ(${t * 30}deg)` }} />
    <div style={{ position: "absolute", left: CX - TW / 2, width: TW, top: 500, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.04em", color: "#fff", textShadow: depth,
      transform: `translateY(${(1 - k) * 80}px) rotateX(${(1 - k) * 30}deg) scale(${0.9 + 0.1 * k})`, opacity: k }}>
      DEIN SONG<br />VERDIENT EIN<br /><span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent", textShadow: "none" }}>MUSIKVIDEO.</span>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sweep * 160 - 40}%, rgba(255,255,255,0.35) ${sweep * 160 - 30}%, transparent ${sweep * 160 - 20}%)`, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
    <Line t={t} t0={T.cta + 0.8} top={900} size={54} color="rgba(255,255,255,0.75)" weight={700} ls="-0.02em">Jetzt kostenlos anmelden.</Line>
    <div style={{ position: "absolute", left: CX - 270, width: 540, top: 1060, height: 120, borderRadius: 60, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: SANS, fontWeight: 900, fontSize: 52, letterSpacing: "0.02em", color: INK,
      boxShadow: "0 0 80px rgba(255,255,255,0.25)", transform: `scale(${0.7 + 0.3 * bio})`, opacity: cl(bio * 2) }}>
      <span style={{ display: "inline-block", transform: `translateY(${-Math.abs(Math.sin((t - T.cta) * 4)) * 10}px)` }}>↑</span> LINK IN DER BIO</div>
  </AbsoluteFill>);
};

type S = { from: number; to: number; C: React.FC<{ t: number }>; cut?: boolean };
const SCENES: S[] = [
  { from: 0, to: T.phone, C: S1 }, { from: T.phone, to: T.why1, C: SPhone }, { from: T.why1, to: T.anders, C: SWhy, cut: true }, { from: T.anders, to: T.show, C: SAnders },
  { from: T.show, to: T.form, C: SShow }, { from: T.form, to: T.wait, C: SForm }, { from: T.wait, to: T.cost, C: SWait }, { from: T.cost, to: T.cta, C: SCost }, { from: T.cta, to: 999, C: SCta },
];

export const Promo: React.FC = () => {
  const t = useT(); const { fps } = useVideoConfig(); const fr = (s: number) => Math.max(0, Math.round(s * fps));
  const sfx: [number, string, number][] = [
    ...[0, 1, 2, 3].map((i) => [T.phone + 0.5 + i * 0.6, "pop.mp3", 0.35] as [number, string, number]),
    ...[T.phone, T.why1, T.show, T.form, T.wait, T.cost].map((s) => [s - 0.12, "whoosh.mp3", 0.3] as [number, string, number]),
    [T.why2 + 0.8, "click.wav", 0.6], [T.free, "impact.mp3", 0.35],
    ...FIELDS.flatMap((_, i) => Array.from({ length: 5 }, (_, j) => [F0 + i * FD + 0.05 + j * 0.1, "click.wav", 0.18] as [number, string, number])),
    [F0 + FIELDS.length * FD + 0.45, "click.wav", 0.7], [F0 + FIELDS.length * FD + 0.6, "confirm.wav", 0.45],
    ...[0, 1, 2].map((i) => [T.cost + 0.05 + i * 0.4, "tick.wav", 0.35] as [number, string, number]),
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("promo/music.mp3")} volume={(f) => Math.min(1, (PROMO_S - f / fps) / 0.6)} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={fr(s)}><Audio src={staticFile(`promo/${n}`)} volume={v} /></Sequence>)}
      {SCENES.map((s, i) => {
        if (t < s.from - 0.01 || t >= s.to + 0.3) return null;
        const inn = i === 0 || SCENES[i - 1].cut ? 1 : eo(pr(t, s.from, s.from + 0.35)); const out = s.cut ? 0 : pr(t, s.to, s.to + 0.3);
        return <AbsoluteFill key={i} style={{ opacity: inn * (1 - out), transform: `scale(${lerp(1.06, 1, inn) * lerp(1, 0.95, out)})`, filter: inn < 1 || out > 0 ? `blur(${(1 - inn) * 14 + out * 14}px)` : undefined }}><s.C t={t} /></AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
};
