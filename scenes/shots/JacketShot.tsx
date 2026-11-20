// Line 2b: „… in der Moncler“ – black down jacket as a 3D product showcase.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ContactShadows } from "@react-three/drei";
import { Stage3D, CameraRig, StudioEnv } from "../../components/Stage3D";
import { PufferJacket } from "../../3d-models/PufferJacket";
import { Word, LightLine } from "../../components/KineticText";
import { beatPulse } from "../../animations/beat";
import { ez, lerp, prog, spr } from "../../animations/ease";
import { COLORS } from "../../presets/theme";
import { wf } from "../../lyrics/timing";

const F = { in: wf("in"), der: wf("der"), moncler: wf("Moncler"), mille: wf("Mille") };
export const JACKET_START = F.in - 12;

const World: React.FC = () => {
  const f = useCurrentFrame();
  const l = f - JACKET_START;
  const rise = spr(f, JACKET_START, { damping: 22, stiffness: 70 });
  const kick = beatPulse(f, 7, "kicks");
  const sweep = prog(f, F.moncler - 10, 50, ez.inOut);
  const lights = prog(f, JACKET_START, 30, ez.out);
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <CameraRig pos={[lerp(1.6, -0.6, l / 80), lerp(1.6, 0.5, ez.out(Math.min(1, l / 70))), lerp(14.5, 12.6, ez.out(Math.min(1, l / 70)))]} look={[0, -0.75, 0]} fov={34} />
      <StudioEnv tint="#e8eeff" intensity={0.8 * lights} />
      <ambientLight intensity={0.05} />
      <spotLight position={[0, 7, 3]} angle={0.45} penumbra={1} intensity={140 * lights} castShadow color="#ffffff" />
      {/* moving light sweep across the nylon on „Moncler“ */}
      <spotLight position={[lerp(-7, 7, sweep), 1.5, 5]} angle={0.35} penumbra={0.8} intensity={180 * lights * Math.sin(Math.PI * sweep)} color="#dfe8ff" />
      <pointLight position={[-4, 1, -3]} intensity={(50 + kick * 30) * lights} color="#9fb7ff" distance={12} />
      <pointLight position={[4, 2, -3]} intensity={50 * lights} color="#ffffff" distance={12} />
      <group position={[0, lerp(-3.2, 0, rise) + Math.sin(f / 40) * 0.04, 0]} rotation={[0.04, lerp(-1.4, 0, rise) + l * 0.006, 0]}>
        <PufferJacket />
      </group>
      <ContactShadows position={[0, -2.15, 0]} scale={8} blur={2.6} far={4} opacity={0.75 * rise} frames={Infinity} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.16, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#070708" roughness={0.3} metalness={0.4} />
      </mesh>
    </>
  );
};

export const JacketShot: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage3D bloom={0.6} bloomThreshold={0.8} transparent={false}><World /></Stage3D>
      <AbsoluteFill style={{ top: 1395, alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Word text="in" at={F.in} size={48} weight={400} color={COLORS.grey} reveal="rise" dur={14} tracking={0} />
          <Word text="der" at={F.der} size={48} weight={400} color={COLORS.grey} reveal="rise" dur={14} tracking={0} />
        </div>
        <div style={{ marginTop: 18 }}>
          <Word text="MONCLER" at={F.moncler} size={128} weight={300} reveal="track" dur={30} tracking={0.32} color={COLORS.white} />
        </div>
        <div style={{ marginTop: 30 }}><LightLine at={F.moncler + 8} width={420} color={COLORS.silver} dur={30} thickness={1.5} /></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
