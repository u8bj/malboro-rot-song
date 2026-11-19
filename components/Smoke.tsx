import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry, smokeTexture } from "../3d-models/textures";

type Props = {
  t: number; // seconds (scene-local) – smoke is a pure function of time (deterministic for Remotion)
  origin?: [number, number, number];
  count?: number;
  spread?: number;
  rise?: number;
  color?: string;
  opacity?: number;
  seed?: number;
  life?: number;
  size?: number;
};

/** Deterministic billboard smoke. Each puff loops through its life cycle with its own phase. */
export const Smoke: React.FC<Props> = ({ t, origin = [0, 0, 0], count = 40, spread = 0.4, rise = 0.9, color = "#d8d8d8", opacity = 0.35, seed = 1, life = 4, size = 1.2 }) => {
  const puffs = useMemo(() => {
    const r = mulberry(seed * 101);
    return Array.from({ length: count }, () => ({ phase: r() * life, dx: (r() - 0.5) * 2, dz: (r() - 0.5) * 2, swirl: r() * Math.PI * 2, spin: (r() - 0.5) * 0.6, m: Math.floor(r() * 3), s: 0.6 + r() * 0.8 }));
  }, [count, seed, life]);
  const mats = useMemo(() => puffs.map((p) => new THREE.SpriteMaterial({ map: smokeTexture(p.m + 1 + seed * 3), transparent: true, depthWrite: false, color: new THREE.Color(color) })), [puffs, seed, color]);
  return (
    <group position={origin}>
      {puffs.map((p, i) => {
        const age = (t + p.phase) % life;
        const k = age / life;
        const y = rise * age;
        const curl = Math.sin(age * 1.3 + p.swirl) * 0.25 * k + p.dx * spread * k;
        const s = (0.15 + k * 1.6) * size * p.s;
        const a = Math.sin(Math.PI * Math.min(1, k * 1.15)) ** 1.5 * opacity;
        const m = mats[i];
        m.opacity = a;
        m.rotation = p.swirl + age * p.spin;
        return <sprite key={i} material={m} position={[curl, y, p.dz * spread * k * 0.6]} scale={[s, s, s]} />;
      })}
    </group>
  );
};
