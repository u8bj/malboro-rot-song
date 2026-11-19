import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry } from "../3d-models/textures";

/** Tiny glowing embers drifting upward (additive). Deterministic in t. */
export const Sparks: React.FC<{ t: number; count?: number; color?: string; origin?: [number, number, number]; spread?: number; speed?: number; life?: number; seed?: number; intensity?: number }> = ({
  t, count = 60, color = "#ff6a2a", origin = [0, 0, 0], spread = 1.2, speed = 0.5, life = 3, seed = 5, intensity = 1,
}) => {
  const data = useMemo(() => { const r = mulberry(seed); return Array.from({ length: count }, () => [r() * life, (r() - 0.5) * 2, (r() - 0.5) * 2, r() * 6.28, 0.4 + r()]); }, [count, seed, life]);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color(color);
  data.forEach(([ph, dx, dz, sw, sp], i) => {
    const age = (t + ph) % life, k = age / life;
    pos[i * 3] = dx * spread * (0.2 + k) + Math.sin(age * 2 + sw) * 0.15;
    pos[i * 3 + 1] = age * speed * sp;
    pos[i * 3 + 2] = dz * spread * 0.5;
    const a = Math.sin(Math.PI * k) * intensity * (0.6 + 0.4 * Math.sin(age * 9 + sw));
    col[i * 3] = c.r * a; col[i * 3 + 1] = c.g * a; col[i * 3 + 2] = c.b * a;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return (
    <points geometry={geo} position={origin}>
      <pointsMaterial size={0.045} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
};
