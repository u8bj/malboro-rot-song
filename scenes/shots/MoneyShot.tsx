// Line 2a: „Circa vier, fünf Mille …“ – spinning hero bundles, 4→5 counter, bundles stack on „Mille“.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { MoneyBundle, Bill } from "../../3d-models/MoneyBundle";
import { mulberry } from "../../3d-models/textures";
import { Word } from "../../components/KineticText";
import { hexA } from "../../components/Background";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog, spr } from "../../animations/ease";
import { COLORS, FONT } from "../../presets/theme";
import { wf } from "../../lyrics/timing";

const F = { circa: wf("Circa"), vier: wf("vier"), fuenf: wf("fünf"), mille: wf("Mille"), in: wf("in"), moncler: wf("Moncler") };
export const MONEY_START = F.circa - 8;
export const MONEY_END = F.mille + 72; // front bills finish flying past the lens

// pyramid stack slots (x, layer)
const SLOTS: [number, number, number][] = [];
[[-1.75, 0], [0, 0], [1.75, 0], [-0.88, 1], [0.88, 1], [0, 2], [-1.75, 1.0001], [1.75, 1.0001], [0, 3]].forEach(([x, l], i) =>
  SLOTS.push([x, l, (i % 2 ? -0.25 : 0.2)]),
);

const World: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 60;
  const local = f - MONEY_START;
  const kick = beatPulse(f, 8, "kicks");
  const camP = ez.inOut(Math.min(1, local / (MONEY_END - MONEY_START)));
  const rnd = useMemo(() => mulberry(42), []);
  const rain = useMemo(() => Array.from({ length: 26 }, () => [rnd() * 6 - 3, rnd() * 3, rnd() * 4 - 3, rnd() * 6.28, rnd() * 6.28, 0.6 + rnd() * 0.8]), [rnd]);
  const baseY = -2.35;
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <CameraRig pos={[lerp(-1.2, 1.1, camP), lerp(0.9, 0.2, camP), lerp(10.5, 8.6, camP)]} look={[0, -0.6, 0]} fov={36} />
      <StudioEnv tint="#b9ffd0" intensity={0.7} />
      <ambientLight intensity={0.08} />
      <spotLight position={[2, 6, 5]} angle={0.55} penumbra={0.9} intensity={110} color="#ffffff" castShadow />
      <pointLight position={[-4, -1, 2]} intensity={30 + kick * 25} color={COLORS.money} distance={14} />
      <pointLight position={[3, 2, -3]} intensity={40} color={COLORS.gold} distance={12} />

      {/* hero bundles – spin slowly in space while „Circa vier, fünf“ is sung, then dive into the stack on „Mille“ */}
      {[0, 1, 2].map((i) => {
        const appear = spr(f, [F.circa, F.vier, F.fuenf][i] - 4, { damping: 16, stiffness: 90 });
        const land = spr(f, F.mille + i * 3, { damping: 20, stiffness: 140 });
        const hover: [number, number, number] = [[-1.25, 0.75, -0.6], [1.2, -0.2, 0.2], [0.0, -1.85, 0.9]][i] as [number, number, number];
        const slot = SLOTS[[1, 3, 5][i]];
        const target: [number, number, number] = [slot[0], baseY + slot[1] * 0.27, slot[2]];
        const pos = hover.map((h, k) => lerp(h, target[k], land)) as [number, number, number];
        const spin = t * (0.9 + i * 0.25) + i;
        return (
          <MoneyBundle key={i} position={[pos[0], pos[1] + (1 - appear) * -2.5 + Math.sin(t * 2 + i) * 0.06 * (1 - land), pos[2]]}
            rotation={[lerp(0.9 + Math.sin(spin) * 0.3, 0, land), lerp(spin, Math.PI * 2 * Math.round(spin / (Math.PI * 2)) + 0.08 * i, land), lerp(0.35 * (i - 1), 0, land)]}
            scale={appear * 1.0} />
        );
      })}

      {/* remaining bundles drop in on „Mille“ */}
      {SLOTS.map((s, i) => {
        if ([1, 3, 5].includes(i)) return null;
        const at = F.mille + i * 1.3;
        const p = spr(f, at, { damping: 15, stiffness: 160, mass: 0.8 });
        if (f < at - 1) return null;
        return (
          <MoneyBundle key={"s" + i} position={[s[0] + (1 - p) * (i % 2 ? 2 : -2), baseY + s[1] * 0.27 + (1 - p) * 5, s[2]]}
            rotation={[(1 - p) * 2.2, (1 - p) * 3 + i * 0.05, (1 - p) * 1.2]} />
        );
      })}

      {/* loose bills raining down after „Mille“ */}
      {f > F.mille - 4 && rain.map(([x, y0, z, a, b, s], i) => {
        const tt = (f - F.mille + 4) / 60 - i * 0.025;
        if (tt < 0) return null;
        return <Bill key={"b" + i} position={[x + Math.sin(tt * 2 + a) * 0.4, 3.6 + y0 - tt * 2.4 * s, z]} rotation={[a + tt * 3 * s, b + tt * 2, tt * 1.5]} scale={0.55} curl={0.25} />;
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY - 0.14, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.6} />
      </mesh>
    </>
  );
};

/** Bills whooshing past the lens – interacts with the type on „Mille“ and wipes to the jacket. */
const FrontWorld: React.FC = () => {
  const f = useCurrentFrame();
  const rnd = useMemo(() => mulberry(9), []);
  const bills = useMemo(() => Array.from({ length: 22 }, () => [rnd(), rnd(), rnd(), rnd() * 6.28, rnd()]), [rnd]);
  return (
    <>
      <CameraRig pos={[0, 0, 8]} look={[0, 0, 0]} fov={36} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 5]} intensity={2.5} />
      <StudioEnv intensity={0.6} />
      {bills.map(([a, b, c, r, d], i) => {
        const start = F.mille - 2 + i * 0.9 + (i > 11 ? 6 : 0);
        const tt = (f - start) / 60;
        if (tt < 0 || tt > 0.76) return null;
        const p = tt / 0.75;
        // fly from lower-right deep → past the lens upper-left
        const x = lerp(3 + a * 2, -4 - b * 2, p);
        const y = lerp(-5 + c * 2, 4 + a * 3, p);
        const z = lerp(-2, 4.5 + d * 2.2, p);
        return <Bill key={i} position={[x, y, z]} rotation={[r + p * 4, p * 3 + i, p * 2]} scale={0.9 + d * 0.4} curl={0.3} />;
      })}
    </>
  );
};

export const MoneyShot: React.FC = () => {
  const f = useCurrentFrame();
  const swap = prog(f, F.fuenf - 4, 12, ez.snap);
  const kick = beatPulse(f, 8, "kicks");
  const milleHit = f >= F.mille ? Math.exp(-(f - F.mille) / 12) : 0;
  const exit = F.in - 6;
  return (
    <AbsoluteFill>
      {f < F.in + 4 && <AbsoluteFill style={{ opacity: 1 - prog(f, F.in - 12, 14, ez.inOut) }}>
      <Stage3D bloom={0.7} bloomThreshold={0.75} transparent={false}><World /></Stage3D>
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(70% 40% at 50% 85%, ${hexA(COLORS.money, 0.1 + kick * 0.05 + milleHit * 0.15)} 0%, transparent 70%)` }} />

      <AbsoluteFill style={{ top: 330, alignItems: "center", textAlign: "center" }}>
        <Word text="CIRCA" at={F.circa} size={46} weight={500} color={COLORS.grey} reveal="track" tracking={0.55} dur={24} exitAt={exit} />
        {/* 4 → 5 slot counter: the number IS the lyric */}
        <div style={{ position: "relative", height: 400, width: 1080, overflow: "hidden", marginTop: 10, opacity: 1 - prog(f, exit, 12, ez.in), filter: `blur(${prog(f, exit, 12, ez.in) * 16}px)` }}>
          {["4", "5"].map((n, i) => {
            const y = (i - swap) * 100;
            const appear = prog(f, F.vier - 6, 18);
            return (
              <div key={n} style={{ position: "absolute", inset: 0, transform: `translateY(${y}%) scale(${1 + milleHit * 0.04})`, opacity: appear,
                fontFamily: FONT.family, fontWeight: 200, fontSize: 420, lineHeight: "400px", color: COLORS.white, letterSpacing: "-0.04em",
                filter: `blur(${Math.abs(y) / 100 * 10 + (1 - appear) * 20}px)`, textShadow: `0 0 60px ${hexA(COLORS.money, 0.35)}` }}>
                {n}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: -6 }}>
          <Word text="vier," at={F.vier} size={54} weight={400} color={COLORS.silver} reveal="rise" dur={14} tracking={0} exitAt={exit} />
          <Word text="fünf" at={F.fuenf} size={54} weight={400} color={COLORS.silver} reveal="rise" dur={14} tracking={0} exitAt={exit} />
        </div>
        <div style={{ marginTop: 26, filter: `drop-shadow(0 0 ${20 + milleHit * 40}px ${hexA(COLORS.money, 0.35 + milleHit * 0.4)})` }}>
          <Word text="MILLE" at={F.mille} size={250} weight={900} reveal="blur" dur={14} tracking={-0.02}
            gradient="linear-gradient(180deg, #ffffff 0%, #e6f5e9 55%, #9fd6a8 100%)" exitAt={exit} />
        </div>
      </AbsoluteFill>
      </AbsoluteFill>}

      <Stage3D bloom={0}><FrontWorld /></Stage3D>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: f < MONEY_START + 8 ? 0.55 * (1 - (f - MONEY_START) / 8) : 0 }} />
    </AbsoluteFill>
  );
};
