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
