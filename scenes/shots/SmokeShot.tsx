// Line 1: „Marlboro Rot, aber fühle mich wie John Player“
// Red ember product shot → transforms into black & gold (John Player) on the word „John“.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { Cigarette } from "../../3d-models/Cigarette";
import { Smoke } from "../../components/Smoke";
import { Sparks } from "../../components/Sparks";
import { Word, LightLine } from "../../components/KineticText";
import { hexA } from "../../components/Background";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog } from "../../animations/ease";
import { COLORS } from "../../presets/theme";
import { wf } from "../../lyrics/timing";

const F = {
  marlboro: wf("Marlboro"), rot: wf("Rot"), aber: wf("aber"), fuehle: wf("fühle"), mich: wf("mich"), wie: wf("wie"),
  john: wf("John"), player: wf("Player"), circa: wf("Circa"),
};
export const SMOKE_END = F.circa - 8; // hard cut on the beat just before „Circa“

const mix = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

const World: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 60;
  const gold = prog(f, F.john - 8, 26, ez.inOut);
  const intro = prog(f, 0, 50, ez.inOut);
  const pulse = beatPulse(f, 6, "kicks");
  const rotHit = Math.exp(-Math.max(0, f - F.rot) / 10) * (f >= F.rot ? 1 : 0);
  const ang = lerp(-0.35, 0.3, f / SMOKE_END) ;
  const radius = lerp(8.2, 6.4, ez.inOut(Math.min(1, f / SMOKE_END))) + gold * 0.4;
  const accent = mix(COLORS.red, COLORS.gold, gold);
  const E: [number, number, number] = [-0.62, 1.05, 0];
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <CameraRig pos={[Math.sin(ang) * radius, 0.35 + gold * 0.3, Math.cos(ang) * radius]} look={[0, 0.05 - gold * 0.1, 0]} fov={34} roll={lerp(0.03, -0.02, f / SMOKE_END)} />
      <StudioEnv tint={accent} intensity={0.35 * intro} />
      <ambientLight intensity={0.04} />
      <spotLight position={[3.5, 5, 4]} angle={0.5} penumbra={1} intensity={32 * intro} color="#fff2e6" castShadow />
      <pointLight position={[-3, -2.5, 1.5]} intensity={(25 + rotHit * 60) * intro} color={accent} distance={12} />
      <pointLight position={[2.5, 1.5, -2.5]} intensity={30 * intro} color={accent} distance={10} />
      <group position={E} rotation={[0.1, lerp(-0.45, 0.35, f / SMOKE_END), -0.5]}>
        <Cigarette position={[2.73, 0, 0]} glow={(0.4 + pulse * 0.6 + rotHit) * intro} burn={0} />
      </group>
      <Smoke t={t + 4} origin={[E[0], E[1] + 0.12, E[2]]} count={46} rise={0.75} spread={0.55} size={1.25} color={mix("#ffe1dc", "#f6e7c4", gold)} opacity={0.32 * intro} life={4.5} seed={2} />
      <Smoke t={t + 9} origin={[E[0] - 0.4, E[1] + 1.3, -1.2]} count={18} rise={0.35} spread={1.2} size={2.6} color={accent} opacity={0.12 * intro} life={6} seed={4} />
      <Sparks t={t} origin={[E[0], E[1] + 0.05, E[2]]} color={mix("#ff5a1f", "#ffd27a", gold)} intensity={(1 + rotHit * 2) * intro} spread={0.5} speed={0.7} />
    </>
  );
};

/** Gold double frame that draws itself (black & gold livery reference, no logo). */
const GoldFrame: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 34, ez.inOut);
  const rect = (inset: number, w: number) => (
    <rect x={inset} y={inset} width={1080 - inset * 2} height={1920 - inset * 2} fill="none" stroke="url(#gold)" strokeWidth={w} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a6a2e" /><stop offset="0.5" stopColor="#f3dfa8" /><stop offset="1" stopColor="#8a6a2e" />
        </linearGradient>
      </defs>
      {rect(54, 2.5)}
      {rect(68, 1)}
    </svg>
  );
};

const goldText = (f: number, at: number) => {
  const pos = interpolate(f, [at, at + 50], [120, -20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    gradient: "linear-gradient(105deg, #8a6a2e 0%, #d4af6a 35%, #fff4d6 48%, #d4af6a 60%, #8a6a2e 100%)",
    style: { backgroundSize: "250% 100%", backgroundPosition: `${pos}% 0` } as React.CSSProperties,
  };
};

export const SmokeShot: React.FC = () => {
  const f = useCurrentFrame();
  const gold = prog(f, F.john - 8, 26, ez.inOut);
  const rotHit = f >= F.rot ? Math.exp(-(f - F.rot) / 14) : 0;
  const exitRed = F.john - 18;
  // stripes wipe (gold pinstripes sweep across on „John“)
  const wipe = prog(f, F.john - 12, 18, ez.inOut);
  return (
    <AbsoluteFill>
      <Stage3D bloom={1.1} bloomThreshold={0.5} transparent={false}>
        <World />
      </Stage3D>
      {/* colored atmosphere */}
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(90% 45% at 50% 100%, ${hexA(COLORS.red, (0.22 + rotHit * 0.35) * (1 - gold))} 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(80% 40% at 50% 70%, ${hexA(COLORS.gold, 0.14 * gold)} 0%, transparent 70%)` }} />

      {/* LINE 1 – red part */}
      <AbsoluteFill style={{ top: 1130, alignItems: "center", textAlign: "center" }}>
        <div><Word text="MARLBORO" at={F.marlboro} size={150} weight={800} reveal="chars" tracking={0.01} exitAt={exitRed} /></div>
        <div style={{ marginTop: -10 }}>
          <Word text="ROT" at={F.rot} size={330} weight={900} color={COLORS.red} reveal="scale" dur={16} tracking={-0.02} glow={hexA(COLORS.red, 0.55 + rotHit * 0.4)} exitAt={exitRed} />
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 18, justifyContent: "center" }}>
          {([["aber", F.aber], ["fühle", F.fuehle], ["mich", F.mich], ["wie", F.wie]] as const).map(([w, at]) => (
            <Word key={w} text={w} at={at} size={58} weight={500} color={COLORS.silver} reveal="rise" dur={16} tracking={0} exitAt={exitRed + 2} />
          ))}
        </div>
        <div style={{ marginTop: 34 }}><LightLine at={6} width={560} color={COLORS.red} dur={44} exitAt={exitRed} /></div>
      </AbsoluteFill>

      {/* pinstripe wipe */}
      {wipe > 0 && wipe < 1 && (
        <AbsoluteFill>
          {[0.42, 0.47, 0.71, 0.74].map((y, i) => (
            <div key={i} style={{ position: "absolute", top: `${y * 100}%`, left: `${(wipe * 1.6 - 0.6 - i * 0.05) * 100}%`, width: "60%", height: i % 2 ? 1.5 : 3,
              background: `linear-gradient(90deg, transparent, ${COLORS.goldLight}, transparent)`, boxShadow: `0 0 20px ${COLORS.gold}`, filter: "blur(0.4px)" }} />
          ))}
        </AbsoluteFill>
      )}

      {/* LINE 1 – gold part */}
      {f >= F.john - 10 && (
        <>
          <GoldFrame at={F.john - 6} />
          <AbsoluteFill style={{ top: 1180, alignItems: "center", textAlign: "center" }}>
            <div><Word text="JOHN" at={F.john} size={250} weight={800} reveal="track" dur={18} tracking={0.02} {...goldText(f, F.john)} /></div>
            <div style={{ marginTop: 6 }}><Word text="PLAYER" at={F.player} size={112} weight={300} reveal="track" dur={20} tracking={0.42} {...goldText(f, F.player + 6)} /></div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
