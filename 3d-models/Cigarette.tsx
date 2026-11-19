import React, { useMemo } from "react";
import * as THREE from "three";
import { corkTexture } from "./textures";

/** Minimal product-style cigarette, ember on -x. `glow` 0..1 drives ember intensity (beat-synced). */
export const Cigarette: React.FC<JSX.IntrinsicElements["group"] & { glow?: number; burn?: number }> = ({ glow = 1, burn = 0, ...props }) => {
  const paper = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d8d4cc", roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffffff") }), []);
  const cork = useMemo(() => new THREE.MeshStandardMaterial({ map: corkTexture(), roughness: 0.7 }), []);
  const ring = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4af6a", metalness: 1, roughness: 0.25 }), []);
  const ash = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3b3936", roughness: 1 }), []);
  const ember = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a0500", emissive: new THREE.Color("#ff3a0a"), roughness: 0.9 }), []);
  const emberHot = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb070") }), []);
  ember.emissiveIntensity = 2.5 + glow * 5;
  emberHot.color.setRGB(1 + glow * 2, 0.55 + glow * 0.8, 0.25 + glow * 0.3);
  const R = 0.16, Lp = 2.6 - burn, Lf = 0.95;
  return (
    <group {...props}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={cork} position={[0, Lf / 2 + 0.0, 0]} castShadow><cylinderGeometry args={[R, R, Lf, 64]} /></mesh>
        <mesh material={ring} position={[0, -0.005, 0]}><cylinderGeometry args={[R * 1.003, R * 1.003, 0.03, 64]} /></mesh>
        <mesh material={paper} position={[0, -Lp / 2, 0]} castShadow><cylinderGeometry args={[R, R, Lp, 64]} /></mesh>
        <mesh material={ash} position={[0, -Lp - 0.05, 0]}><cylinderGeometry args={[R * 0.99, R * 0.97, 0.1, 64]} /></mesh>
        <mesh material={ember} position={[0, -Lp - 0.1, 0]} scale={[R * 0.98, 0.07, R * 0.98]}><sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
        <mesh material={emberHot} position={[0, -Lp - 0.12, 0]} scale={[R * 0.55, 0.05, R * 0.55]}><sphereGeometry args={[1, 32, 16]} /></mesh>
      </group>
      <pointLight position={[-(Lp + 0.3), 0, 0.2]} color="#ff4a12" intensity={1.5 + glow * 4} distance={3} decay={2} />
    </group>
  );
};
