// @entscheidungsnacht profile picture – 3 original variants. 1080×1080, designed for a circular crop.
import React from "react";
import { AbsoluteFill } from "remotion";

const SANS = '"Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';
const BG = "radial-gradient(circle at 50% 42%, #1a2846 0%, #0b1222 55%, #05080f 100%)";
const Y = "#ffd23f", BL = "#4da3ff", R = "#ff3b3b";
const Stars: React.FC = () => <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>{[[260, 250, 5], [810, 220, 4], [880, 520, 3], [190, 600, 3], [700, 160, 3], [330, 820, 3], [820, 790, 4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#cfe0ff" opacity={0.8} />)}</svg>;

/** 1 · crescent moon whose inner edge splits into A (blue) / B (red) */
export const PP1: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Stars />
    <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }}>
      <defs><radialGradient id="mg" cx="0.4" cy="0.4"><stop offset="0" stopColor="#fff1b8" /><stop offset="1" stopColor={Y} /></radialGradient>
        <mask id="cres"><rect width="1080" height="1080" fill="#fff" /><circle cx="640" cy="470" r="300" fill="#000" /></mask></defs>
      <circle cx="540" cy="540" r="360" fill="rgba(255,210,63,0.10)" />
      <circle cx="500" cy="540" r="330" fill="url(#mg)" mask="url(#cres)" style={{ filter: "drop-shadow(0 0 40px rgba(255,210,63,0.45))" }} />
    </svg>
    <div style={{ position: "absolute", left: 560, top: 500, fontFamily: SANS, fontWeight: 900, fontSize: 210, letterSpacing: "-0.04em", lineHeight: 1 }}>
      <span style={{ color: BL }}>A</span><span style={{ color: "#fff", opacity: 0.85 }}>/</span><span style={{ color: R }}>B</span>
    </div>
  </AbsoluteFill>
);

/** 2 · two roads splitting towards a full moon (the decision) */
export const PP2: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Stars />
    <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }}>
      <circle cx="540" cy="360" r="170" fill={Y} style={{ filter: "drop-shadow(0 0 60px rgba(255,210,63,0.6))" }} />
      <path d="M0 760 C 300 700 780 700 1080 760 L1080 1080 L0 1080Z" fill="#070b14" />
      <path d="M540 1080 L540 870 C 540 800 420 760 300 730" stroke={BL} strokeWidth="46" fill="none" strokeLinecap="round" />
      <path d="M540 1080 L540 870 C 540 800 660 760 780 730" stroke={R} strokeWidth="46" fill="none" strokeLinecap="round" />
      <path d="M540 1080 L540 880" stroke="#e9eef7" strokeWidth="46" strokeLinecap="round" />
      <text x="250" y="700" fill={BL} fontFamily={SANS} fontWeight="900" fontSize="130">A</text>
      <text x="745" y="700" fill={R} fontFamily={SANS} fontWeight="900" fontSize="130">B</text>
    </svg>
  </AbsoluteFill>
);

/** 3 · bold monogram „EN“ under a crescent – clean & brandable */
export const PP3: React.FC = () => (
  <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
    <Stars />
    <svg width={260} height={260} viewBox="0 0 100 100" style={{ position: "absolute", top: 170, filter: "drop-shadow(0 0 30px rgba(255,210,63,0.55))" }}><path d="M60 8a42 42 0 1 0 32 60A34 34 0 1 1 60 8z" fill={Y} /></svg>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 420, color: "#fff", letterSpacing: "-0.06em", marginTop: 170, lineHeight: 1 }}>
      E<span style={{ color: Y }}>N</span>
    </div>
  </AbsoluteFill>
);
