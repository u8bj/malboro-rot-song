import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { C, SANS, SHADOW } from "../theme";
import { FPS } from "../timing";

export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const pr = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const sm = (x: number) => { const k = cl(x); return k * k * (3 - 2 * k); };
export const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3); // ease-out cubic
export const eio = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** iOS-like spring (critically damped-ish, tiny overshoot) */
export const spring = (t: number, t0: number, dur = 0.55) => {
  const x = (t - t0) / dur; if (x <= 0) return 0; if (x >= 1.6) return 1;
  return 1 - Math.exp(-6 * x) * Math.cos(5.2 * x);
};
export const useT = () => useCurrentFrame() / FPS;
export const ease = (t: number, inp: number[], out: number[]) => interpolate(t, inp, out, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

export const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number; bg?: string; style?: React.CSSProperties; children?: React.ReactNode; glass?: boolean }> = ({ x, y, w, h, r = 36, bg = C.card, style, children, glass }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: r, background: glass ? "rgba(255,255,255,0.62)" : bg,
    backdropFilter: glass ? "blur(30px) saturate(160%)" : undefined, boxShadow: SHADOW, overflow: "hidden", fontFamily: SANS, color: C.ink, ...style }}>{children}</div>
);

/** small app icon tile (own simple glyphs) */
export const AppIcon: React.FC<{ size?: number; bg: string; glyph: React.ReactNode }> = ({ size = 64, bg, glyph }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.23, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">{glyph}</svg>
  </div>
);
export const G = {
  house: <path d="M12 3 2.5 11h2.5v9h5v-6h4v6h5v-9h2.5z" fill="#fff" />,
  shield: <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" fill="#fff" />,
  bubble: <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6L4.5 21l4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.6 10-8S17.5 3 12 3z" fill="#fff" />,
  pin: <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#fff" />,
  wallet: <path d="M3 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm13 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 4h13v1H4z" fill="#fff" />,
  wave: <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />,
  cam: <path d="M4 7h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm13 3 4-2.5v9L17 14z" fill="#fff" />,
  doc: <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5" fill="#fff" />,
  heart: <path d="M12 21s-7.5-4.6-10-9.2C.3 8.6 2.2 4.5 6 4.5c2.2 0 3.5 1.2 4.4 2.5h3.2c.9-1.3 2.2-2.5 4.4-2.5 3.8 0 5.7 4.1 4 7.3C19.5 16.4 12 21 12 21z" fill="#fff" />,
  bulb: <path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 20h6v2H9z" fill="#fff" />,
  lock: <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z" fill="#fff" />,
};

/** iOS notification banner */
export const Banner: React.FC<{ icon: React.ReactNode; app: string; title: string; body: string; time?: string; w?: number; style?: React.CSSProperties }> = ({ icon, app, title, body, time = "jetzt", w = 760, style }) => (
  <div style={{ width: w, borderRadius: 34, padding: "26px 30px", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(30px) saturate(180%)", boxShadow: SHADOW, display: "flex", gap: 22, alignItems: "flex-start", fontFamily: SANS, ...style }}>
    {icon}
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: C.grey, fontSize: 22, fontWeight: 500 }}><span>{app}</span><span>{time}</span></div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 4 }}>{title}</div>
      <div style={{ fontSize: 26, color: C.ink2, marginTop: 2 }}>{body}</div>
    </div>
  </div>
);

/** horizontal motion-blur filter (whip pans) */
export const BlurDefs: React.FC<{ id: string; x: number; y?: number }> = ({ id, x, y = 0 }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}><filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`${x} ${y}`} /></filter></svg>
);
export const fsec = (t: number) => Math.round(t * FPS);
