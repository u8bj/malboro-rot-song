import React from "react";
import { C, SANS, SERIF } from "../theme";
import { FL } from "../timing";
import { cl, useT } from "./kit";

export type Accent = { color?: string; italic?: boolean; weight?: number; under?: string };
const clean = (w: string) => w.replace(/[^\p{L}\d’'-]/gu, "").toLowerCase();

/**
 * Reference-style lyric line: words appear exactly when sung (soft rise + de-blur),
 * the CURRENT word is grey and turns black (or its accent colour) as it's sung.
 * Ad-libs in parentheses are shown smaller, grey & italic.
 */
export const Lyric: React.FC<{
  line: number; x?: number; y?: number; size?: number; maxW?: number; align?: "left" | "center"; accents?: Record<string, Accent>;
  out?: number; outDur?: number; from?: number; to?: number; dark?: boolean; style?: React.CSSProperties;
}> = ({ line, x = 120, y = 96, size = 76, maxW = 1680, align = "left", accents = {}, out, outDur = 0.3, from = 0, to, dark = false, style }) => {
  const t = useT();
  const ws = FL[line].words.slice(from, to);
  const o = out !== undefined ? cl((t - out) / outDur) : 0;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : x - maxW / 2, top: y, width: maxW, display: "flex", flexWrap: "wrap", justifyContent: align === "left" ? "flex-start" : "center",
      columnGap: size * 0.24, rowGap: size * 0.02, fontFamily: SANS, fontSize: size, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.12,
      opacity: 1 - o, filter: o ? `blur(${o * 14}px)` : undefined, transform: `translateY(${-o * 20}px)`, ...style }}>
      {ws.map((w, i) => {
        const adlib = w.w.startsWith("(");
        const a = accents[clean(w.w)];
        const k = cl((t - (w.s - 0.08)) / 0.16); // appear
        if (k <= 0) return null;
        const sung = cl((t - w.s) / 0.22); // grey → final colour
        const base = dark ? "#ffffff" : C.ink;
        const fin = a?.color ?? (adlib ? C.grey : base);
        const col = mix(C.grey2, fin, adlib ? 1 : sung);
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - k) * 18}px)`, filter: `blur(${(1 - k) * 8}px)`, opacity: k,
            color: col, fontFamily: a?.italic || adlib ? SERIF : SANS, fontStyle: a?.italic || adlib ? "italic" : "normal", fontWeight: a?.italic || adlib ? 400 : a?.weight ?? 700,
            fontSize: adlib ? size * 0.78 : a?.italic ? size * 1.12 : size, letterSpacing: a?.italic || adlib ? "0" : undefined,
            textDecoration: a?.under ? `underline ${a.under} ${size * 0.06}px` : undefined, textUnderlineOffset: size * 0.12 }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`; };
