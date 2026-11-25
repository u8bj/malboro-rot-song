// Reusable end-screen CTAs for all @entscheidungsnacht videos: follow + like reminders.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

const SANS = '"Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const spring = (t: number, t0: number, d = 0.5) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1.6) return 1; return 1 - Math.exp(-6 * x) * Math.cos(5.4 * x); };

export const HANDLE = "@entscheidungsnacht";

/** t = current time (s), t0 = when the outro starts. Total runtime ≈ 7 s. */
export const Outro: React.FC<{ t: number; t0: number; accent?: string; likeTitle?: string }> = ({ t, t0, accent = "#ffd23f", likeTitle = "Hat dir die Story gefallen?" }) => {
  if (t < t0) return null;
  const follow = spring(t, t0, 0.55), tap = pr(t, t0 + 1.4, t0 + 1.7), followed = t > t0 + 1.7;
  const like = spring(t, t0 + 2.6, 0.55), beat = Math.exp(-Math.max(0, t - (t0 + 3.2)) * 5) * (t > t0 + 3.2 ? 1 : 0);
  const out = pr(t, t0 + 7.2, t0 + 7.8);
  const card: React.CSSProperties = { position: "absolute", left: 50, right: 170, borderRadius: 36, overflow: "hidden", background: "rgba(10,16,30,0.86)", border: "1.5px solid rgba(255,255,255,0.14)", backdropFilter: "blur(16px)",
    display: "flex", alignItems: "center", gap: 22, padding: "28px 28px", fontFamily: SANS, color: "#e9eef7", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" };
  return (
    <AbsoluteFill style={{ opacity: 1 - out, pointerEvents: "none" }}>
      {/* follow reminder */}
      <div style={{ ...card, top: 1010, transform: `translateX(${(1 - follow) * -1200}px)` }}>
        <Img src={staticFile("brand/profile.png")} style={{ width: 110, height: 110, borderRadius: 55, border: `3px solid ${accent}`, flexShrink: 0, objectFit: "cover" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 28, opacity: 0.7, fontWeight: 600 }}>Vergiss nicht zu folgen</div>
          <div style={{ fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{HANDLE}</div>
        </div>
        <div style={{ flexShrink: 0, padding: "16px 22px", borderRadius: 18, fontSize: 30, fontWeight: 800, background: followed ? "rgba(255,255,255,0.14)" : "#fe2c55", color: "#fff", transform: `scale(${1 - 0.12 * Math.sin(Math.PI * tap)})`, whiteSpace: "nowrap" }}>
          {followed ? "✓ Gefolgt" : "Folgen"}
        </div>
      </div>
      {/* like reminder */}
      <div style={{ ...card, top: 1230, transform: `translateX(${(1 - like) * 1200}px)`, opacity: like > 0.001 ? 1 : 0 }}>
        <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, r = 40 + (1 - beat) * 40; return <div key={i} style={{ position: "absolute", left: 55 + Math.cos(a) * r - 5, top: 55 + Math.sin(a) * r - 5, width: 10, height: 10, borderRadius: 5, background: "#fe2c55", opacity: t > t0 + 3.2 ? beat : 0 }} />; })}
          <svg width={92} height={92} viewBox="0 0 24 24" style={{ transform: `scale(${1 + beat * 0.35})` }}><path d="M12 21s-7.5-4.6-10-9.2C.3 8.6 2.2 4.5 6 4.5c2.2 0 3.5 1.2 4.4 2.5h3.2c.9-1.3 2.2-2.5 4.4-2.5 3.8 0 5.7 4.1 4 7.3C19.5 16.4 12 21 12 21z" fill={t > t0 + 3.2 ? "#fe2c55" : "rgba(255,255,255,0.85)"} /></svg>
        </div>
        <div>
          <div style={{ fontSize: 30, opacity: 0.7, fontWeight: 600 }}>{likeTitle}</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Gerne liken ❤️</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Compact, clean end card (≈3.6 s): one card – profile, handle, follow tap, like heart. Stays inside the TikTok safe area. */
export const OUTRO_COMPACT_S = 3.6;
export const OutroCompact: React.FC<{ t: number; t0: number; light?: boolean; line?: string }> = ({ t, t0, light = false, line = "Folg für mehr" }) => {
  if (t < t0 || t > t0 + OUTRO_COMPACT_S) return null;
  const k = spring(t, t0, 0.45), tap = pr(t, t0 + 0.85, t0 + 1.05), followed = t > t0 + 1.05;
  const heart = spring(t, t0 + 1.5, 0.4), burst = t > t0 + 1.5 ? Math.exp(-(t - t0 - 1.5) * 4) : 0;
  const out = pr(t, t0 + OUTRO_COMPACT_S - 0.35, t0 + OUTRO_COMPACT_S);
  const ink = light ? "#0b0b0f" : "#f2f4f8", sub = light ? "#86868b" : "rgba(255,255,255,0.6)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: light ? `rgba(245,245,247,${0.75 * cl(k * 2) * (1 - out)})` : `rgba(0,0,0,${0.55 * cl(k * 2) * (1 - out)})`, backdropFilter: `blur(${18 * cl(k * 2) * (1 - out)}px)` }}>
      <div style={{ position: "absolute", left: 140, width: 720, top: 640, borderRadius: 56, padding: "56px 40px 44px", boxSizing: "border-box", background: light ? "#fff" : "rgba(22,24,32,0.92)", border: light ? "none" : "1.5px solid rgba(255,255,255,0.12)",
        boxShadow: light ? "0 40px 100px rgba(20,20,40,0.18)" : "0 40px 100px rgba(0,0,0,0.6)", fontFamily: SANS, color: ink, textAlign: "center",
        transform: `translateY(${(1 - k) * 120 + out * 40}px) scale(${(0.9 + 0.1 * k) * (1 - out * 0.06)})`, opacity: cl(k * 2) * (1 - out) }}>
        <Img src={staticFile("brand/profile.png")} style={{ width: 170, height: 170, borderRadius: 85, objectFit: "cover", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }} />
        <div style={{ fontSize: 46, fontWeight: 800, marginTop: 22, letterSpacing: "-0.02em" }}>{HANDLE}</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: sub, marginTop: 6 }}>{line}</div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 36 }}>
          <div style={{ width: 300, padding: "22px 0", borderRadius: 24, fontSize: 36, fontWeight: 800, background: followed ? (light ? "#e9e9eb" : "rgba(255,255,255,0.14)") : "#fe2c55", color: followed ? ink : "#fff", transform: `scale(${1 - 0.1 * Math.sin(Math.PI * tap)})` }}>{followed ? "✓ Gefolgt" : "Folgen"}</div>
          <div style={{ position: "relative", width: 96, height: 84, borderRadius: 24, background: light ? "#f2f2f5" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, r = 30 + (1 - burst) * 44; return <div key={i} style={{ position: "absolute", left: 48 + Math.cos(a) * r - 5, top: 42 + Math.sin(a) * r - 5, width: 10, height: 10, borderRadius: 5, background: "#fe2c55", opacity: burst }} />; })}
            <svg width={54} height={54} viewBox="0 0 24 24" style={{ transform: `scale(${0.9 + 0.1 * heart + burst * 0.4})` }}><path d="M12 21s-7.5-4.6-10-9.2C.3 8.6 2.2 4.5 6 4.5c2.2 0 3.5 1.2 4.4 2.5h3.2c.9-1.3 2.2-2.5 4.4-2.5 3.8 0 5.7 4.1 4 7.3C19.5 16.4 12 21 12 21z" fill={t > t0 + 1.5 ? "#fe2c55" : light ? "#c7c7cc" : "rgba(255,255,255,0.5)"} /></svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
