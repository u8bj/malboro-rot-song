import React from "react";
import { C, SANS } from "../theme";

/** abstract metallic cartridge capsule (no weapon) */
export const Capsule: React.FC<{ w?: number; h?: number; rot?: number; tone?: "brass" | "chrome" }> = ({ w = 60, h = 170, rot = 0, tone = "brass" }) => {
  const g = tone === "brass" ? ["#7a5a22", "#f3d98b", "#b8892f", "#5b4014"] : ["#55595f", "#f5f7fa", "#a7acb3", "#3b3e43"];
  const id = `cap${tone}`;
  return (
    <svg width={w} height={h} viewBox="0 0 60 170" style={{ transform: `perspective(600px) rotateY(${rot}deg)`, filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor={g[0]} /><stop offset="0.35" stopColor={g[1]} /><stop offset="0.6" stopColor={g[2]} /><stop offset="1" stopColor={g[3]} /></linearGradient>
        <linearGradient id={id + "t"} x1="0" x2="1"><stop offset="0" stopColor="#4a4d52" /><stop offset="0.35" stopColor="#e6e8ec" /><stop offset="1" stopColor="#2e3034" /></linearGradient>
      </defs>
      <path d="M8 70 C8 30 22 6 30 2 C38 6 52 30 52 70 Z" fill={`url(#${id}t)`} />
      <rect x="6" y="68" width="48" height="96" rx="5" fill={`url(#${id})`} />
      <rect x="6" y="150" width="48" height="5" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
};

/** chrome sphere */
export const Sphere: React.FC<{ r: number; style?: React.CSSProperties }> = ({ r, style }) => (
  <div style={{ width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(circle at 34% 28%, #ffffff 0%, #e9ecf1 12%, #a9afb8 38%, #5d636c 66%, #2c2f34 88%, #4b5058 100%)",
    boxShadow: "0 30px 40px rgba(20,20,40,0.22), inset -8px -14px 30px rgba(0,0,0,0.25)", ...style }} />
);

/** glass drop (teardrop) */
export const Drop: React.FC<{ s: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ s, children, style }) => (
  <div style={{ position: "absolute", width: s, height: s * 1.32, ...style }}>
    <svg width={s} height={s * 1.32} viewBox="0 0 100 132" style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 12px 18px rgba(30,60,120,0.18))" }}>
      <defs>
        <radialGradient id="dg" cx="0.38" cy="0.62" r="0.7"><stop offset="0" stopColor="rgba(255,255,255,0.95)" /><stop offset="0.5" stopColor="rgba(170,205,250,0.75)" /><stop offset="1" stopColor="rgba(70,130,220,0.8)" /></radialGradient>
        <clipPath id="dc"><path d="M50 0 C62 30 98 62 98 86 A48 46 0 0 1 2 86 C2 62 38 30 50 0Z" /></clipPath>
      </defs>
      <path d="M50 0 C62 30 98 62 98 86 A48 46 0 0 1 2 86 C2 62 38 30 50 0Z" fill="url(#dg)" stroke="rgba(90,140,220,0.6)" strokeWidth={1.5} />
      <ellipse cx="34" cy="78" rx="9" ry="15" fill="rgba(255,255,255,0.85)" transform="rotate(25 34 78)" />
    </svg>
    {children && <div style={{ position: "absolute", left: "8%", top: "40%", width: "84%", height: "56%", borderRadius: "50%", overflow: "hidden" }}>{children}</div>}
  </div>
);

/** cash bundle */
export const Bundle: React.FC<{ w?: number; style?: React.CSSProperties }> = ({ w = 220, style }) => (
  <div style={{ position: "relative", width: w, height: w * 0.5, ...style }}>
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={{ position: "absolute", left: 0, top: (3 - k) * 4, width: w, height: w * 0.42, borderRadius: 8, background: "linear-gradient(135deg,#bfe3c4,#7fbf8f 60%,#a7d7b0)", boxShadow: "0 3px 6px rgba(0,0,0,0.12)", border: "1px solid rgba(0,60,20,0.15)" }} />
    ))}
    <div style={{ position: "absolute", left: w * 0.42, top: -2, width: w * 0.16, height: w * 0.42 + 16, background: "linear-gradient(180deg,#f7ecd0,#d8bd7a)", borderRadius: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
    <div style={{ position: "absolute", left: 14, top: 18, fontFamily: SANS, fontWeight: 800, fontSize: w * 0.12, color: "rgba(0,70,30,0.55)" }}>100</div>
  </div>
);

export const Avatar: React.FC<{ s: number; label: string; bg: string }> = ({ s, label, bg }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: s * 0.38 }}>{label}</div>
);
export const Row: React.FC<{ k: string; v: string; vColor?: string }> = ({ k, v, vColor = C.grey }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 26px", background: "#f2f2f7", borderRadius: 16, fontSize: 26, marginTop: 10 }}><span style={{ color: C.ink }}>{k}</span><span style={{ color: vColor }}>{v}</span></div>
);

/** stylised chrome pistol silhouette (generic, no brand details) */
export const ChromePistol: React.FC<{ w?: number; rot?: number }> = ({ w = 240, rot = 0 }) => (
  <svg width={w} height={w * 0.66} viewBox="0 0 240 158" style={{ transform: `perspective(700px) rotateY(${rot}deg)`, filter: "drop-shadow(0 20px 24px rgba(20,20,40,0.28))" }}>
    <defs>
      <linearGradient id="pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.3" stopColor="#d9dde3" /><stop offset="0.55" stopColor="#8f959e" /><stop offset="0.8" stopColor="#c8ccd2" /><stop offset="1" stopColor="#5b6069" /></linearGradient>
      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3d43" /><stop offset="1" stopColor="#15161a" /></linearGradient>
    </defs>
    {/* slide */}
    <path d="M14 22 Q14 14 22 14 H226 Q234 14 234 22 V54 Q234 60 228 60 H22 Q14 60 14 52 Z" fill="url(#pc)" />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={170 + i * 7} y={20} width={3} height={34} rx={1.5} fill="rgba(60,64,72,0.35)" />)}
    <rect x={22} y={26} width={120} height={4} rx={2} fill="rgba(255,255,255,0.7)" />
    {/* frame + trigger guard */}
    <path d="M40 60 H200 V72 Q200 78 194 78 H120 Q110 78 104 84 L98 92 Q90 104 76 104 H70 Q58 104 58 92 V78 H40 Z" fill="url(#pc)" />
    <path d="M92 80 Q92 98 76 98" stroke="#2c2f35" strokeWidth={6} fill="none" strokeLinecap="round" />
    {/* grip */}
    <path d="M150 78 H200 L214 146 Q216 154 207 154 H170 Q162 154 160 146 Z" fill="url(#pg)" />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={172 + i * 5} y1={92} x2={182 + i * 5} y2={146} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />)}
  </svg>
);
