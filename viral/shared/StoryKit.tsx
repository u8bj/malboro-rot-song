// Shared building blocks for @entscheidungsnacht story shorts (1080×1920).
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from "remotion";

export type Wd = { w: string; s: number; e: number };
export const SANS = '"Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';
export const K = { bg: "#070b14", navy: "#0e1729", navy2: "#16223a", steel: "#2a3957", amber: "#ffb547", amber2: "#ffd58a", red: "#ff3b3b", blue: "#4da3ff", yellow: "#ffd23f", ink: "#e9eef7" };
export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const sm = (x: number) => { const k = cl(x); return k * k * (3 - 2 * k); };
export const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const spring = (t: number, t0: number, d = 0.5) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1.6) return 1; return 1 - Math.exp(-6 * x) * Math.cos(5.4 * x); };
export const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
export const shake = (t: number, t0: number, amp = 18, dur = 0.5) => { const k = t >= t0 ? Math.exp(-(t - t0) * (6 / dur)) : 0; return [Math.sin(t * 90) * amp * k, Math.cos(t * 77) * amp * k]; };

export const Grain: React.FC = () => { const f = useCurrentFrame(); const seed = Math.floor(f / 2) % 50; return (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.18, pointerEvents: "none" }}>
    <svg width="100%" height="100%"><filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter={`url(#gr${seed})`} /></svg>
  </AbsoluteFill>); };
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.85 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 65% at 50% 45%, transparent 40%, rgba(0,0,0,${k}) 100%)`, pointerEvents: "none" }} />;

export const Chip: React.FC<{ label: string; value: React.ReactNode; color?: string; pulse?: number; op?: number }> = ({ label, value, color = K.ink, pulse = 0, op = 1 }) => (
  <div style={{ padding: "14px 22px 12px", borderRadius: 18, background: "rgba(10,16,30,0.72)", border: `1.5px solid ${pulse > 0.01 ? color : "rgba(255,255,255,0.12)"}`, backdropFilter: "blur(10px)", fontFamily: SANS,
    transform: `scale(${1 + pulse * 0.12})`, opacity: op, boxShadow: pulse ? `0 0 ${30 * pulse}px ${color}` : undefined }}>
    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(233,238,247,0.55)" }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{value}</div>
  </div>
);
export const HudRow: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (
  <div style={{ position: "absolute", left: 40, right: 170, top: 250, display: "flex", gap: 14, flexWrap: "wrap", opacity: op }}>{children}</div>
);

/** 1–3 word captions, current word yellow */
export const makeChunks = (W: Wd[]) => { const out: number[][] = []; let cur: number[] = []; W.forEach((w, i) => { cur.push(i); if (/[.,:?!]$/.test(w.w) || cur.length >= 3) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; };
export const Captions: React.FC<{ t: number; W: Wd[]; chunks: number[][]; y?: number }> = ({ t, W, chunks, y = 1330 }) => {
  const ci = chunks.findIndex((c, k) => t >= W[c[0]].s - 0.05 && (k === chunks.length - 1 || t < W[chunks[k + 1][0]].s - 0.05));
  if (ci < 0) return null;
  const c = chunks[ci]; const pop = spring(t, W[c[0]].s - 0.05, 0.35);
  return (
    <div style={{ position: "absolute", left: 50, right: 170, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: "-0.02em", lineHeight: 1.08,
      transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
      {c.map((i) => { const w = W[i]; const on = t >= w.s - 0.03; const cur = on && t < w.e + 0.08; return <span key={i} style={{ color: cur ? K.yellow : on ? "#fff" : "rgba(255,255,255,0.35)", transform: `translateY(${cur ? -4 : 0}px)` }}>{w.w}</span>; })}
    </div>
  );
};

export const Rain: React.FC<{ t: number; n?: number; slant?: number; op?: number; speed?: number }> = ({ t, n = 90, slant = -18, op = 0.35, speed = 1 }) => {
  const drops = useMemo(() => Array.from({ length: 140 }, (_, i) => [random(`rx${i}`) * 1300 - 100, random(`ry${i}`), 50 + random(`rl${i}`) * 90, 0.5 + random(`rv${i}`)]), []);
  return (<svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>{drops.slice(0, n).map(([x, y, l, v], i) => { const yy = ((y * 2200 + t * 1400 * v * speed) % 2200) - 200; return <line key={i} x1={x} y1={yy} x2={x + slant * 0.4} y2={yy + l} stroke="#9fb7de" strokeWidth={2} strokeLinecap="round" />; })}</svg>);
};

/** A/B decision cards */
export const ChoiceCards: React.FC<{ t: number; tA: number; tB: number; a: { title: string; icon: React.ReactNode }; b: { title: string; icon: React.ReactNode } }> = ({ t, tA, tB, a, b }) => {
  const ka = spring(t, tA - 0.1, 0.5), kb = spring(t, tB - 0.1, 0.5);
  const card = (side: "A" | "B", k: number, col: string, d: { title: string; icon: React.ReactNode }, x: number) => (
    <div style={{ position: "absolute", left: x, top: 420, width: 470, height: 820, borderRadius: 40, background: "rgba(14,23,41,0.9)", border: `3px solid ${col}`, boxShadow: `0 0 60px ${col}55`, fontFamily: SANS, color: K.ink,
      transform: `translateY(${(1 - k) * 1500}px)`, opacity: cl(k * 3), display: "flex", flexDirection: "column", alignItems: "center", padding: 40, boxSizing: "border-box" }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, fontWeight: 900, color: "#0a0f1a" }}>{side}</div>
      <div style={{ marginTop: 50 }}>{d.icon}</div>
      <div style={{ marginTop: 40, fontSize: 46, fontWeight: 800, textAlign: "center", lineHeight: 1.15 }}>{d.title}</div>
    </div>
  );
  return <AbsoluteFill style={{ background: "#060a13" }}>{card("A", ka, K.blue, a, 50)}{card("B", kb, K.red, b, 560)}</AbsoluteFill>;
};

/** big „A oder B?“ end card over a blurred background */
export const EndAB: React.FC<{ t: number; t0: number; bg: React.ReactNode; arrowAt: number; hideAt: number }> = ({ t, t0, bg, arrowAt, hideAt }) => {
  const k = spring(t, t0 - 0.1, 0.6); const p = Math.sin(t * 5) * 0.5 + 0.5;
  return (<AbsoluteFill>
    <AbsoluteFill style={{ filter: "blur(18px) brightness(0.45)" }}>{bg}</AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 170, color: "#fff", transform: `scale(${0.7 + 0.3 * k})`, opacity: k, letterSpacing: "-0.03em" }}>
      <span style={{ color: K.blue }}>A</span> oder <span style={{ color: K.red }}>B</span>?
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center", gap: 50, opacity: pr(t, t0 + 1.3, t0 + 1.8) }}>
      {[K.blue, K.red].map((c, i) => <div key={i} style={{ width: 200, height: 200, borderRadius: 100, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 120, color: "#0a0f1a",
        transform: `scale(${1 + (i === 0 ? p : 1 - p) * 0.08})`, boxShadow: `0 0 ${40 + 40 * (i === 0 ? p : 1 - p)}px ${c}` }}>{i ? "B" : "A"}</div>)}
    </div>
    <svg width={140} height={140} viewBox="0 0 24 24" style={{ position: "absolute", left: 470, top: 1500, opacity: pr(t, arrowAt, arrowAt + 0.3) * (1 - pr(t, hideAt, hideAt + 0.3)), transform: `translateY(${Math.sin(t * 6) * 12}px)` }}><path d="M12 4v14m-6-6 6 6 6-6" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </AbsoluteFill>);
};

export const Watermark: React.FC = () => <div style={{ position: "absolute", left: 44, top: 1585, fontFamily: SANS, fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.38)", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>@entscheidungsnacht</div>;
