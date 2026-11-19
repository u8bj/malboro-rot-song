import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette as PPVignette } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import * as THREE from "three";

/** Sets camera every frame from props (pure function of time → Remotion safe). */
export const CameraRig: React.FC<{ pos: [number, number, number]; look?: [number, number, number]; fov?: number; roll?: number }> = ({ pos, look = [0, 0, 0], fov = 35, roll = 0 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(...look);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
  return null;
};

/** Studio environment built only from Lightformers (no HDR download). */
export const StudioEnv: React.FC<{ tint?: string; intensity?: number }> = ({ tint = "#ffffff", intensity = 1 }) => (
  <Environment resolution={256} frames={1}>
    <Lightformer form="rect" intensity={2.2 * intensity} color="#ffffff" position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 3, 1]} />
    <Lightformer form="rect" intensity={3 * intensity} color={tint} position={[-5, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[0.6, 8, 1]} />
    <Lightformer form="rect" intensity={3 * intensity} color="#dfe6ff" position={[5, 1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[0.6, 8, 1]} />
    <Lightformer form="ring" intensity={1.2 * intensity} color={tint} position={[0, 0, 6]} scale={3} />
  </Environment>
);

type StageProps = {
  children: React.ReactNode;
  bloom?: number;
  bloomThreshold?: number;
  transparent?: boolean;
  style?: React.CSSProperties;
};

export const Stage3D: React.FC<StageProps> = ({ children, bloom = 0.9, bloomThreshold = 0.6, transparent = true, style }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, ...style }}
      gl={{ antialias: true, alpha: transparent, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace, preserveDrawingBuffer: true }}
      camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 8] }}
      shadows
    >
      {children}
      {bloom > 0 ? (
        <EffectComposer multisampling={4}>
          <Bloom intensity={bloom} luminanceThreshold={bloomThreshold} luminanceSmoothing={0.3} mipmapBlur />
          <PPVignette darkness={0.55} offset={0.3} />
        </EffectComposer>
      ) : <></>}
    </ThreeCanvas>
  );
};
