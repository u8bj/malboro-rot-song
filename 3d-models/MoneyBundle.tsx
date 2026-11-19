import React, { useMemo } from "react";
import * as THREE from "three";
import { bandTexture, banknoteTexture, paperEdgeTexture } from "./textures";

const W = 1.6, H = 0.8, D = 0.26;

/** Banknote bundle with paper band – box with note on top/bottom and paper-stack edges. */
export const MoneyBundle: React.FC<JSX.IntrinsicElements["group"] & { label?: string }> = ({ label = "€ 1.000", ...props }) => {
  const mats = useMemo(() => {
    const note = banknoteTexture();
    const edge = paperEdgeTexture();
    const top = new THREE.MeshPhysicalMaterial({ map: note, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: 0.4 });
    const side = new THREE.MeshStandardMaterial({ map: edge, roughness: 0.85 });
    // box face order: +x -x +y -y +z -z  → top is +y
    return [side, side, top, top, side, side];
  }, []);
  const bandMat = useMemo(() => {
    const t = bandTexture(label);
    return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.35, metalness: 0.25, clearcoat: 0.6 });
  }, [label]);
  return (
    <group {...props}>
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={[W, D, H, 1, 1, 1]} />
      </mesh>
      {/* paper band (slightly larger, wraps around the middle) */}
      <mesh material={bandMat} castShadow>
        <boxGeometry args={[0.34, D + 0.012, H + 0.012]} />
      </mesh>
    </group>
  );
};

/** Single loose bill (thin plane with subtle curl). */
export const Bill: React.FC<JSX.IntrinsicElements["group"] & { curl?: number }> = ({ curl = 0.15, ...props }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, 24, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin((x / W) * Math.PI) * curl * 0.5 - (x / W) ** 2 * curl); }
    g.computeVertexNormals();
    return g;
  }, [curl]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: banknoteTexture(), roughness: 0.6, side: THREE.DoubleSide }), []);
  return <group {...props}><mesh geometry={geo} material={mat} castShadow /></group>;
};
