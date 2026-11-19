import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural black down jacket (product shot, no person/mannequin).
 * Body + sleeves are continuous tubes whose radius is modulated per baffle → real quilted seams.
 */
const quiltedTube = (H: number, baffles: number, rx: (t: number) => number, rz: (t: number) => number, seam = 0.1) => {
  const g = new THREE.CylinderGeometry(1, 1, H, 128, 220, true);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), t = (y + H / 2) / H;
    const bump = 1 - seam + seam * Math.pow(Math.abs(Math.sin(Math.PI * t * baffles)), 0.45);
    p.setX(i, p.getX(i) * rx(t) * bump);
    p.setZ(i, p.getZ(i) * rz(t) * bump);
  }
  g.computeVertexNormals();
  return g;
};

export const PufferJacket: React.FC<JSX.IntrinsicElements["group"]> = (props) => {
  const shell = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0b0b0d", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15,
    sheen: 0.6, sheenColor: new THREE.Color("#454a55"), sheenRoughness: 0.35, side: THREE.DoubleSide,
  }), []);
  const rib = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111113", roughness: 0.95 }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9dbe0", metalness: 1, roughness: 0.18 }), []);

  const body = useMemo(() => quiltedTube(3.2, 8,
    (t) => (1.0 + 0.07 * Math.sin(Math.PI * t)) * (t > 0.82 ? 1 - 0.42 * ((t - 0.82) / 0.18) ** 2 : 1),
    (t) => (0.6 + 0.05 * Math.sin(Math.PI * t)) * (t > 0.85 ? 1 - 0.3 * ((t - 0.85) / 0.15) ** 2 : 1), 0.09), []);
  const sleeveGeo = useMemo(() => quiltedTube(2.45, 7, (t) => 0.27 + 0.1 * t, (t) => 0.26 + 0.09 * t, 0.12), []);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 64, 32), []);

  const sleeve = (side: 1 | -1) => (
    <group position={[side * 0.9, 1.25, 0]} rotation={[0, 0, side * 0.24]}>
      <mesh geometry={sphere} material={shell} scale={[0.46, 0.4, 0.46]} castShadow />
      <mesh geometry={sleeveGeo} material={shell} position={[side * 0.08, -1.3, 0]} castShadow receiveShadow />
      <mesh material={rib} position={[side * 0.08, -2.6, 0]}><cylinderGeometry args={[0.25, 0.24, 0.24, 48]} /></mesh>
    </group>
  );

  return (
    <group {...props}>
      <mesh geometry={body} material={shell} position={[0, -0.15, 0]} castShadow receiveShadow />
      {/* shoulder yoke closing the top */}
      <mesh geometry={sphere} material={shell} position={[0, 1.42, -0.02]} scale={[0.72, 0.16, 0.42]} />
      {/* standing collar */}
      <mesh material={shell} position={[0, 1.6, -0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.75, 1]}>
        <torusGeometry args={[0.4, 0.16, 32, 72]} />
      </mesh>
      {/* hem band */}
      <mesh material={rib} position={[0, -1.78, 0]} scale={[1, 1, 0.6]}><cylinderGeometry args={[1.0, 0.99, 0.14, 72]} /></mesh>
      {/* zipper */}
      <mesh material={metal} position={[0, -0.15, 0.645]}><boxGeometry args={[0.03, 3.15, 0.03]} /></mesh>
      <group position={[0, 1.38, 0.6]} rotation={[-0.3, 0, 0]}>
        <mesh material={metal}><boxGeometry args={[0.07, 0.08, 0.04]} /></mesh>
        <mesh material={metal} position={[0, -0.13, 0.02]}><boxGeometry args={[0.045, 0.2, 0.015]} /></mesh>
      </group>
      {sleeve(1)}
      {sleeve(-1)}
    </group>
  );
};
