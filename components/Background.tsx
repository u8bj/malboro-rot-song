import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { COLORS } from "../presets/theme";

/** Deep black stage with soft top light, animated film grain and vignette. */
export const Background: React.FC<{ glow?: string; glowOpacity?: number; children?: React.ReactNode }> = ({ glow = "#ffffff", glowOpacity = 0.06, children }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <AbsoluteFill style={{ background: `radial-gradient(120% 60% at 50% 30%, ${hexA(glow, glowOpacity)} 0%, transparent 60%)` }} />
    {children}
  </AbsoluteFill>
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`grain${Math.floor(frame / 2)}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 85% 70% at 50% 50%, transparent 45%, rgba(0,0,0,${strength}) 100%)` }} />
);

export function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
