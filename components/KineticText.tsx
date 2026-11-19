import React from "react";
import { useCurrentFrame } from "remotion";
import { ez, lerp, prog } from "../animations/ease";
import { COLORS, FONT } from "../presets/theme";

export type RevealStyle = "rise" | "blur" | "chars" | "scale" | "track";

type WordProps = {
  text: string;
  at: number; // local frame when the word is sung
  size: number;
  weight?: number;
  color?: string;
  reveal?: RevealStyle;
  dur?: number;
  exitAt?: number;
  exitDur?: number;
  tracking?: number; // em
  glow?: string;
  gradient?: string; // css gradient for text fill
  italic?: boolean;
  style?: React.CSSProperties;
};

/**
 * One word with a masked reveal. Lead-in starts a few frames BEFORE `at`
 * so the word is readable exactly when it is sung.
 */
export const Word: React.FC<WordProps> = ({
  text, at, size, weight = 700, color = COLORS.white, reveal = "rise", dur = 22, exitAt, exitDur = 14,
  tracking = -0.03, glow, gradient, style,
}) => {
  const frame = useCurrentFrame();
  const lead = 6;
  const p = prog(frame, at - lead, dur);
  const x = exitAt !== undefined ? prog(frame, exitAt, exitDur, ez.in) : 0;

  const fill: React.CSSProperties = gradient
    ? { backgroundImage: gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : { color };
  const base: React.CSSProperties = {
    fontFamily: FONT.family, fontWeight: weight, fontSize: size, lineHeight: 1.0,
    letterSpacing: `${tracking}em`, whiteSpace: "nowrap", display: "inline-block",
    textShadow: glow ? `0 0 ${size * 0.25}px ${glow}, 0 0 ${size * 0.6}px ${glow}` : undefined,
    ...fill, ...style,
  };

  if (reveal === "chars") {
    const chars = [...text];
    return (
      <span style={{ display: "inline-block", whiteSpace: "nowrap", opacity: 1 - x, filter: `blur(${x * 16}px)` }}>
        {chars.map((c, i) => {
          const cp = prog(frame, at - lead + i * 2.2, dur, ez.out);
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
              <span style={{ ...base, transform: `translateY(${(1 - cp) * 105}%) rotate(${(1 - cp) * 8}deg)`, opacity: cp, filter: `blur(${(1 - cp) * 6}px)` }}>
                {c === " " ? " " : c}
              </span>
            </span>
          );
        })}
      </span>
    );
  }

  let transform = "";
  let filter = "";
  let opacity = p;
  let ls = tracking;
  switch (reveal) {
    case "rise": transform = `translateY(${(1 - p) * 100}%)`; filter = `blur(${(1 - p) * 8}px)`; break;
    case "blur": transform = `scale(${lerp(1.12, 1, p)})`; filter = `blur(${(1 - p) * 30}px)`; break;
    case "scale": transform = `scale(${lerp(0.6, 1, p)})`; filter = `blur(${(1 - p) * 14}px)`; break;
    case "track": ls = lerp(0.6, tracking, p); filter = `blur(${(1 - p) * 10}px)`; break;
  }
  // exit: fast upward motion-blurred
  transform += ` translateY(${-x * 40}%)`;
  filter += ` blur(${x * 18}px)`;
  opacity *= 1 - x;

  const masked = reveal === "rise";
  return (
    <span style={{ display: "inline-block", overflow: masked ? "hidden" : "visible", verticalAlign: "bottom", padding: masked ? `${size * 0.06}px ${size * 0.04}px ${size * 0.1}px` : 0 }}>
      <span style={{ ...base, letterSpacing: `${ls}em`, transform, filter, opacity }}>{text}</span>
    </span>
  );
};

/** Thin horizontal light line that draws itself – used as a typographic divider/accent. */
export const LightLine: React.FC<{ at: number; width: number; color?: string; dur?: number; thickness?: number; exitAt?: number }> = ({
  at, width, color = COLORS.white, dur = 30, thickness = 2, exitAt,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, ez.inOut);
  const x = exitAt !== undefined ? prog(frame, exitAt, 16, ez.in) : 0;
  return (
    <div style={{ width, height: thickness, position: "relative", margin: "0 auto", opacity: 1 - x }}>
      <div style={{
        position: "absolute", left: `${x * 100}%`, width: `${(p - x) * 100}%`, height: "100%",
        background: `linear-gradient(90deg, transparent, ${color} 30%, ${color} 70%, transparent)`,
        boxShadow: `0 0 18px ${color}`,
      }} />
    </div>
  );
};
