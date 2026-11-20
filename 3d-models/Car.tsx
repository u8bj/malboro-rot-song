import React, { useMemo } from "react";
import * as THREE from "three";

/** Generic procedural GT / sports coupé (no real manufacturer design). Front points to +x. */
export const Car: React.FC<JSX.IntrinsicElements["group"] & { paint?: string; wheelSpin?: number; lights?: number; muscle?: boolean }> = ({
  paint = "#0d0d10", wheelSpin = 0, lights = 1, muscle = false, ...props
}) => {
  const W = 1.9;
  const body = useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = muscle
      ? [[2.3, 0.3], [2.38, 0.72], [1.2, 0.95], [0.6, 1.0], [0.05, 1.38], [-0.9, 1.38], [-1.55, 1.05], [-2.3, 1.0], [-2.36, 0.3]]
      : [[2.3, 0.3], [2.38, 0.6], [1.25, 0.86], [0.7, 0.95], [0.0, 1.34], [-0.95, 1.3], [-2.05, 0.98], [-2.36, 0.86], [-2.32, 0.3]];
    s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p)); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.16, bevelSegments: 8, curveSegments: 12 });
    g.translate(0, 0, -W / 2); g.computeVertexNormals();
    return g;
  }, [muscle]);
  const glass = useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = muscle ? [[0.55, 1.03], [0.1, 1.36], [-0.88, 1.36], [-1.45, 1.06]] : [[0.66, 0.98], [0.02, 1.33], [-0.92, 1.29], [-1.9, 1.0]];
    s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p)); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: W - 0.12, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.12, bevelSegments: 6 });
    g.translate(0, 0.03, -(W - 0.12) / 2);
    return g;
  }, [muscle]);
  const paintM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: paint, metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 }), [paint]);
  const glassM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#050608", metalness: 0.9, roughness: 0.05, clearcoat: 1 }), []);
  const tyre = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.85 }), []);
  const rim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b9bcc4", metalness: 1, roughness: 0.2 }), []);
  const head = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.3) }), []);
  const tail = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.15, 0.2) }), []);
  head.color.setScalar(0.3 + lights * 3); tail.color.setRGB(0.3 + lights * 4, 0.05, 0.08);
  const wheel = (x: number, z: number) => (
    <group key={`${x}${z}`} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={tyre}><cylinderGeometry args={[0.4, 0.4, 0.3, 48]} /></mesh>
      <group position={[0, z > 0 ? 0.152 : -0.152, 0]} rotation={[0, wheelSpin, 0]}>
        <mesh material={rim}><cylinderGeometry args={[0.29, 0.29, 0.02, 48]} /></mesh>
        {[0, 1, 2, 3, 4].map((k) => <mesh key={k} material={rim} rotation={[0, (k * Math.PI * 2) / 5, 0]} position={[0, z > 0 ? 0.01 : -0.01, 0]}><boxGeometry args={[0.52, 0.03, 0.06]} /></mesh>)}
      </group>
    </group>
  );
  return (
    <group {...props}>
      <mesh geometry={body} material={paintM} castShadow receiveShadow />
      <mesh geometry={glass} material={glassM} />
      {wheel(1.45, W / 2 + 0.06)}{wheel(-1.5, W / 2 + 0.06)}{wheel(1.45, -W / 2 - 0.06)}{wheel(-1.5, -W / 2 - 0.06)}
      {/* LED headlight strips & full-width rear light bar */}
      <mesh material={head} position={[2.43, 0.62, 0.62]}><boxGeometry args={[0.04, 0.05, 0.42]} /></mesh>
      <mesh material={head} position={[2.43, 0.62, -0.62]}><boxGeometry args={[0.04, 0.05, 0.42]} /></mesh>
      <mesh material={tail} position={[muscle ? -2.48 : -2.47, muscle ? 0.86 : 0.76, 0]}><boxGeometry args={[0.04, 0.05, W + 0.1]} /></mesh>
    </group>
  );
};

export const Bus: React.FC<JSX.IntrinsicElements["group"]> = (props) => {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e9e9ec", roughness: 0.35, clearcoat: 0.6 }), []);
  const win = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0b0c10", metalness: 0.8, roughness: 0.08 }), []);
  const tyre = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.9 }), []);
  return (
    <group {...props}>
      <mesh material={body} position={[0, 1.15, 0]} castShadow><boxGeometry args={[5.2, 1.9, 1.9]} /></mesh>
      <mesh material={win} position={[0.1, 1.45, 0.951]}><boxGeometry args={[4.6, 0.7, 0.01]} /></mesh>
      <mesh material={win} position={[0.1, 1.45, -0.951]}><boxGeometry args={[4.6, 0.7, 0.01]} /></mesh>
      <mesh material={win} position={[2.601, 1.35, 0]}><boxGeometry args={[0.01, 1.0, 1.6]} /></mesh>
      {[[1.7, 1], [-1.7, 1], [1.7, -1], [-1.7, -1]].map(([x, z], i) => (
        <mesh key={i} material={tyre} position={[x, 0.38, z * 0.92]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.38, 0.38, 0.3, 32]} /></mesh>
      ))}
    </group>
  );
};
