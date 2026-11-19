import React from "react";
import { useCurrentFrame } from "remotion";
import { ez, lerp, prog } from "../animations/ease";
import { COLORS, FONT } from "../presets/theme";

/** Frosted-glass pill (glassmorphism) with a pulsing status dot. */
export const GlassPill: React.FC<{ at: number; label: string; sub?: string; dot?: string }> = ({ at, label, sub, dot = COLORS.money }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 26, ez.out);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18, padding: "22px 40px", borderRadius: 999,
      background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
      border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(24px) saturate(140%)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
      transform: `translateY(${lerp(-40, 0, p)}px) scale(${lerp(0.9, 1, p)})`, opacity: p, filter: `blur(${(1 - p) * 10}px)`,
      fontFamily: FONT.family,
    }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: dot, boxShadow: `0 0 16px ${dot}` }} />
      <span style={{ color: COLORS.white, fontSize: 40, fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</span>
      {sub && <span style={{ color: COLORS.grey, fontSize: 40, fontWeight: 400 }}>{sub}</span>}
    </div>
  );
};
