import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ez, prog } from "../animations/ease";

export type Trans = "cut" | "fade" | "zoom" | "blurzoom" | "wipeUp" | "wipeLeft" | "iris" | "flash" | "slideUp" | "tilt";

/**
 * Mount a shot only inside [from - pad, to + pad] and apply entry/exit transitions.
 * Content keeps using the ABSOLUTE song frame (no Sequence offset) → timings stay song-exact.
 */
export const ShotFrame: React.FC<{ from: number; to: number; inT?: Trans; outT?: Trans; inDur?: number; outDur?: number; children: React.ReactNode; z?: number; hold?: number }> = ({
  from, to, inT = "fade", outT = "cut", inDur = 12, outDur = 12, children, z = 0, hold = 0,
}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to + (outT === "cut" ? hold : outDur)) return null;
  const pi = inT === "cut" ? 1 : prog(f, from, inDur, ez.out);
  const po = outT === "cut" ? 0 : prog(f, to, outDur, ez.in);
  const style: React.CSSProperties = { zIndex: z };
  let tr = "", filt = "", op = 1, clip = "";
  const apply = (t: Trans, p: number, dir: 1 | -1) => {
    const q = 1 - p; // 0 = settled
    switch (t) {
      case "fade": op *= p; break;
      case "zoom": tr += ` scale(${1 + q * 0.15 * dir})`; op *= p; break;
      case "blurzoom": tr += ` scale(${1 + q * 0.35 * dir})`; filt += ` blur(${q * 30}px)`; op *= Math.min(1, p * 1.5); break;
      case "wipeUp": clip = dir > 0 ? `inset(${q * 100}% 0 0 0)` : `inset(0 0 ${q * 100}% 0)`; break;
      case "wipeLeft": clip = dir > 0 ? `inset(0 0 0 ${q * 100}%)` : `inset(0 ${q * 100}% 0 0)`; break;
      case "iris": clip = `circle(${p * 120}% at 50% 50%)`; break;
      case "flash": op *= p; filt += ` brightness(${1 + q * 3})`; break;
      case "slideUp": tr += ` translateY(${q * 30 * dir}%)`; filt += ` blur(${q * 20}px)`; break;
      case "tilt": tr += ` perspective(1400px) rotateX(${q * 25 * dir}deg) scale(${1 - q * 0.1})`; op *= p; break;
    }
  };
  if (inT !== "cut") apply(inT, pi, 1);
  if (outT !== "cut" && po > 0) apply(outT, 1 - po, -1);
  return <AbsoluteFill style={{ ...style, transform: tr || undefined, filter: filt || undefined, opacity: op, clipPath: clip || undefined }}>{children}</AbsoluteFill>;
};
