import React from "react";
import { useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { Word, RevealStyle } from "./KineticText";
import { LYRICS } from "../lyrics/timing";
import { COLORS, FONT, VIDEO } from "../presets/theme";

type Hi = { color?: string; gradient?: string; glow?: string; weight?: number; scale?: number; reveal?: RevealStyle };

export type LineTextProps = {
  line: number;
  top?: number; // px; if omitted → vertically centred around `centerY`
  centerY?: number;
  maxWidth?: number;
  maxSize?: number;
  minSize?: number;
  maxRows?: number;
  weight?: number;
  color?: string;
  reveal?: RevealStyle;
  dur?: number;
  tracking?: number;
  upper?: boolean;
  align?: "center" | "left";
  left?: number;
  highlight?: Record<string, Hi>; // key = word (punctuation stripped, case-insensitive)
  exitAt?: number;
  dimPast?: boolean;
  wordGap?: number;
  rowGap?: number;
  style?: React.CSSProperties;
  hide?: string[]; // words not rendered as text (replaced by a visual)
  only?: [number, number]; // render only word index range [a, b)
};

const clean = (w: string) => w.replace(/[^\p{L}\d'-]/gu, "").toLowerCase();

/** Fit font size so all words wrap into ≤ maxRows rows and no word exceeds maxWidth. */
const fit = (words: { t: string; k: number }[], weight: number, tracking: number, maxW: number, maxS: number, minS: number, rows: number, gap: number) => {
  for (let s = maxS; s >= minS; s -= 4) {
    const ws = words.map((w) => measureText({ text: w.t, fontFamily: FONT.family, fontSize: s * w.k, fontWeight: String(weight), letterSpacing: `${tracking}em` }).width + s * w.k * 0.12);
    if (ws.some((x) => x > maxW)) continue;
    let r = 1, cur = 0;
    for (const x of ws) { if (cur && cur + gap * s + x > maxW) { r++; cur = x; } else cur += (cur ? gap * s : 0) + x; }
    if (r <= rows) return s;
  }
  return minS;
};

/** Renders one lyric line word-by-word, exactly on the sung timestamps. */
export const LineText: React.FC<LineTextProps> = ({
  line, top, centerY = 960, maxWidth = 940, maxSize = 150, minSize = 44, maxRows = 3, weight = 700, color = COLORS.white,
  reveal = "rise", dur = 16, tracking = -0.02, upper = false, align = "center", left = 70, highlight = {}, exitAt, dimPast = false,
  wordGap = 0.26, rowGap = 0.05, style, hide = [], only,
}) => {
  const f = useCurrentFrame();
  const L = LYRICS[line];
  const words = L.words.map((w, idx) => ({ w, idx })).filter(({ w, idx }) => !hide.includes(clean(w.w)) && (!only || (idx >= only[0] && idx < only[1]))).map(({ w }) => {
    const h = highlight[clean(w.w)];
    return { raw: w, t: upper ? w.w.toUpperCase() : w.w, h, k: h?.scale ?? 1 };
  });
  const size = fit(words, weight, tracking, maxWidth, maxSize, minSize, maxRows, wordGap);
  const rowsEst = Math.ceil(words.reduce((a, w) => a + w.t.length * w.k, 0) * size * 0.58 / maxWidth);
  const blockH = rowsEst * size * (1.12 + rowGap);
  const y = top ?? centerY - blockH / 2;
  return (
    <div style={{ position: "absolute", top: y, left: align === "center" ? (VIDEO.width - maxWidth) / 2 : left, width: maxWidth, display: "flex", flexWrap: "wrap",
      justifyContent: align === "center" ? "center" : "flex-start", alignItems: "baseline", columnGap: size * wordGap, rowGap: size * rowGap, ...style }}>
      {words.map((w, i) => {
        const at = Math.round(w.raw.s * VIDEO.fps);
        const next = words[i + 1] ? Math.round(words[i + 1].raw.s * VIDEO.fps) : at + 30;
        const past = dimPast && f > next + 4 ? 0.55 : 1;
        return (
          <span key={i} style={{ opacity: past }}>
            <Word text={w.t} at={at} size={size * w.k} weight={w.h?.weight ?? weight} color={w.h?.color ?? color} gradient={w.h?.gradient}
              glow={w.h?.glow} reveal={w.h?.reveal ?? reveal} dur={dur} tracking={tracking} exitAt={exitAt !== undefined ? exitAt + i * 0.6 : undefined} />
          </span>
        );
      })}
    </div>
  );
};

/** helpers to get frames of a line */
export const lineStart = (line: number) => Math.round(LYRICS[line].start * VIDEO.fps);
export const lineEnd = (line: number) => Math.round(LYRICS[line].end * VIDEO.fps);
export const wordAt = (line: number, idx: number) => Math.round(LYRICS[line].words[idx].s * VIDEO.fps);
export const findWord = (line: number, w: string) => {
  const i = LYRICS[line].words.findIndex((x) => clean(x.w) === w.toLowerCase());
  if (i < 0) throw new Error(`word ${w} not in line ${line}`);
  return wordAt(line, i);
};
