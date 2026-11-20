import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

/**
 * Generic red/white flip-top cigarette pack.
 * Deliberately WITHOUT brand logo, wordmark or the protected chevron trade dress
 * (trademark) – only the generic red-over-white colour split.
 */
const packTexture = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
    const x = c.getContext("2d")!;
    x.fillStyle = "#f4f2ee"; x.fillRect(0, 0, 512, 1024);
    const g = x.createLinearGradient(0, 0, 0, 440);
    g.addColorStop(0, "#c8101a"); g.addColorStop(1, "#a90c15");
    x.fillStyle = g; x.fillRect(0, 0, 512, 430);
    // fine silver seam line
    x.fillStyle = "#c9ccd2"; x.fillRect(0, 430, 512, 6);
    // subtle paper grain
    for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`; x.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2); }
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  };
})();

export const CigPack: React.FC<JSX.IntrinsicElements["group"] & { lidOpen?: number }> = ({ lidOpen = 0, ...props }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: packTexture(), roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08 }), []);
  const red = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#b80e17", roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08 }), []);
  const foil = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9dbe0", metalness: 1, roughness: 0.3 }), []);
  const filter = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c98b4a", roughness: 0.7 }), []);
  const W = 0.88, H = 1.4, D = 0.36, lidH = 0.36;
  return (
    <group {...props}>
      {/* body */}
      <RoundedBox args={[W, H - lidH, D]} radius={0.025} smoothness={4} position={[0, -lidH / 2, 0]} material={mat} castShadow receiveShadow>
      </RoundedBox>
      {/* foil + filters peeking out when lid opens */}
      <mesh material={foil} position={[0, H / 2 - lidH - 0.02, 0]}><boxGeometry args={[W * 0.94, 0.08, D * 0.92]} /></mesh>
      {[-0.29, -0.1, 0.1, 0.29].map((x, i) => (
        <mesh key={i} material={filter} position={[x, H / 2 - lidH + 0.05 + (i === 1 ? 0.18 * lidOpen : 0), 0.02]}><cylinderGeometry args={[0.085, 0.085, 0.3, 32]} /></mesh>
      ))}
      {/* lid hinged at the back */}
      <group position={[0, H / 2 - lidH, -D / 2]} rotation={[-lidOpen * 1.9, 0, 0]}>
        <RoundedBox args={[W + 0.01, lidH, D + 0.01]} radius={0.025} smoothness={4} position={[0, lidH / 2, D / 2]} material={red} castShadow />
      </group>
    </group>
  );
};
