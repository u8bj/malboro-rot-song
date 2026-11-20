// Collection of procedural product objects. All generic, no brands.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { mulberry } from "./textures";

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const gold = () => new THREE.MeshPhysicalMaterial({ color: "#e2b862", metalness: 1, roughness: 0.16, clearcoat: 0.5 });
const chrome = () => new THREE.MeshStandardMaterial({ color: "#e3e5ea", metalness: 1, roughness: 0.08 });

export const Trophy: React.FC<JSX.IntrinsicElements["group"]> = (p) => {
  const g = useMemo(gold, []);
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0b0b0c", roughness: 0.2, clearcoat: 1 }), []);
  const cup = useMemo(() => lathe([[0, 0], [0.32, 0], [0.34, 0.05], [0.12, 0.12], [0.08, 0.3], [0.09, 0.62], [0.2, 0.72], [0.55, 0.95], [0.72, 1.4], [0.76, 1.85], [0.72, 1.86], [0.68, 1.45], [0.5, 1.0], [0.0, 0.86]]), []);
  return (
    <group {...p}>
      <mesh geometry={cup} material={g} castShadow />
      {[1, -1].map((s) => (
        <mesh key={s} material={g} position={[s * 0.78, 1.38, 0]} rotation={[0, 0, s * -0.2]}><torusGeometry args={[0.3, 0.045, 24, 64, Math.PI * 1.25]} /></mesh>
      ))}
      <mesh material={black} position={[0, -0.25, 0]} castShadow><boxGeometry args={[0.9, 0.5, 0.9]} /></mesh>
      <mesh material={g} position={[0, -0.02, 0.451]}><boxGeometry args={[0.5, 0.12, 0.005]} /></mesh>
    </group>
  );
};

export const Plane: React.FC<JSX.IntrinsicElements["group"]> = (p) => {
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f1f2f5", roughness: 0.25, metalness: 0.2, clearcoat: 1 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#20232a", metalness: 0.6, roughness: 0.3 }), []);
  const wing = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0.5, 0); s.lineTo(-0.3, 2.6); s.lineTo(-0.75, 2.6); s.lineTo(-0.6, 0); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }); g.rotateX(Math.PI / 2); return g;
  }, []);
  const tail = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-0.6, 1.0); s.lineTo(-0.95, 1.0); s.lineTo(-0.8, 0); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false });
  }, []);
  return (
    <group {...p}>
      <mesh material={white} rotation={[0, 0, -Math.PI / 2]} castShadow><capsuleGeometry args={[0.28, 3.6, 16, 48]} /></mesh>
      <mesh geometry={wing} material={white} position={[0.2, -0.05, 0]} />
      <mesh geometry={wing} material={white} position={[0.2, -0.05, 0]} scale={[1, 1, -1]} />
      <mesh geometry={tail} material={dark} position={[-1.35, 0.15, -0.02]} />
      <mesh geometry={wing} material={white} position={[-1.7, 0.1, 0]} scale={[0.4, 1, 0.4]} />
      <mesh geometry={wing} material={white} position={[-1.7, 0.1, 0]} scale={[0.4, 1, -0.4]} />
      {[1, -1].map((s) => <mesh key={s} material={dark} position={[0.15, -0.3, s * 1.0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.13, 0.7, 32]} /></mesh>)}
      <mesh position={[1.62, 0.12, 0]} rotation={[0, 0, -0.5]} material={dark}><boxGeometry args={[0.18, 0.08, 0.3]} /></mesh>
    </group>
  );
};

export const Can: React.FC<JSX.IntrinsicElements["group"] & { color?: string; stripe?: string }> = ({ color = "#0b0b0c", stripe = "#c7c9cc", ...p }) => {
  const shell = useMemo(() => lathe([[0, 0], [0.24, 0], [0.3, 0.06], [0.3, 1.0], [0.24, 1.1], [0.22, 1.12], [0, 1.12]]), []);
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color, metalness: 0.7, roughness: 0.25, clearcoat: 1 }), [color]);
  const metal = useMemo(chrome, []);
  const st = useMemo(() => new THREE.MeshStandardMaterial({ color: stripe, metalness: 0.9, roughness: 0.25 }), [stripe]);
  return (
    <group {...p}>
      <mesh geometry={shell} material={body} castShadow />
      <mesh material={metal} position={[0, 1.08, 0]}><cylinderGeometry args={[0.235, 0.24, 0.06, 64]} /></mesh>
      <mesh material={st} position={[0, 0.55, 0]}><cylinderGeometry args={[0.302, 0.302, 0.06, 64]} /></mesh>
    </group>
  );
};

export const Bottle: React.FC<JSX.IntrinsicElements["group"] & { liquid?: string; level?: number }> = ({ liquid = "#7b2cff", level = 0.7, ...p }) => {
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transparent: true, opacity: 0.22, clearcoat: 1, side: THREE.DoubleSide }), []);
  const liq = useMemo(() => new THREE.MeshPhysicalMaterial({ color: liquid, emissive: new THREE.Color(liquid), emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.85 }), [liquid]);
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f2f2f2", roughness: 0.4 }), []);
  const g = useMemo(() => lathe([[0, 0], [0.42, 0], [0.45, 0.05], [0.45, 1.3], [0.3, 1.6], [0.16, 1.7], [0.16, 1.95], [0, 1.95]]), []);
  const l = useMemo(() => lathe([[0, 0.03], [0.41, 0.03], [0.42, 0.06], [0.42, 1.3 * level], [0, 1.3 * level]]), [level]);
  return (
    <group {...p}>
      <mesh geometry={l} material={liq} />
      <mesh geometry={g} material={glass} />
      <mesh material={cap} position={[0, 2.02, 0]}><cylinderGeometry args={[0.19, 0.19, 0.18, 48]} /></mesh>
    </group>
  );
};

/** Scissors: `open` 0..1 opens the blades around the pivot. */
export const Scissors: React.FC<JSX.IntrinsicElements["group"] & { open?: number }> = ({ open = 0, ...p }) => {
  const steel = useMemo(chrome, []);
  const handle = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0d0d0f", roughness: 0.3, clearcoat: 1 }), []);
  const blade = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, 0.07); s.quadraticCurveTo(1.4, 0.09, 2.2, 0.0); s.lineTo(0, -0.08); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
  }, []);
  const half = (side: 1 | -1) => (
    <group rotation={[0, 0, side * (0.06 + open * 0.32)]} position={[0, 0, side * 0.025]}>
      <mesh geometry={blade} material={steel} scale={[1, side, 1]} />
      <mesh material={steel} position={[-0.35, side * -0.12, 0]} rotation={[0, 0, side * 0.35]}><boxGeometry args={[0.7, 0.07, 0.04]} /></mesh>
      <mesh material={handle} position={[-0.95, side * -0.33, 0]} scale={[1.25, 0.9, 1]}><torusGeometry args={[0.24, 0.065, 24, 64]} /></mesh>
    </group>
  );
  return <group {...p}>{half(1)}{half(-1)}<mesh material={steel} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.12, 32]} /></mesh></group>;
};

export const Clipper: React.FC<JSX.IntrinsicElements["group"]> = (p) => {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#111114", roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }), []);
  const steel = useMemo(chrome, []);
  const gld = useMemo(gold, []);
  return (
    <group {...p}>
      <RoundedBox args={[0.62, 2.3, 0.42]} radius={0.18} smoothness={6} material={body} castShadow />
      <mesh material={steel} position={[0, 1.23, 0]}><boxGeometry args={[0.66, 0.2, 0.3]} /></mesh>
      {Array.from({ length: 13 }, (_, i) => <mesh key={i} material={steel} position={[-0.3 + i * 0.05, 1.38, 0.05]}><boxGeometry args={[0.025, 0.12, 0.2]} /></mesh>)}
      <mesh material={gld} position={[0, 0.2, 0.215]}><boxGeometry args={[0.3, 0.05, 0.01]} /></mesh>
      <mesh material={steel} position={[0, -0.5, 0.22]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.02, 32]} /></mesh>
    </group>
  );
};

const grooveTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t;
  const c = document.createElement("canvas"); c.width = c.height = 1024; const x = c.getContext("2d")!;
  x.fillStyle = "#0a0a0b"; x.fillRect(0, 0, 1024, 1024);
  for (let r = 180; r < 505; r += 1.6) { x.strokeStyle = `rgba(255,255,255,${0.025 + ((r * 7) % 5) * 0.008})`; x.beginPath(); x.arc(512, 512, r, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = "#c8101a"; x.beginPath(); x.arc(512, 512, 165, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#e9e5dc"; x.beginPath(); x.arc(512, 512, 12, 0, Math.PI * 2); x.fill();
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }; })();

export const Vinyl: React.FC<JSX.IntrinsicElements["group"] & { spin?: number; arm?: number }> = ({ spin = 0, arm = 1, ...p }) => {
  const rec = useMemo(() => new THREE.MeshPhysicalMaterial({ map: grooveTex(), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }), []);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.3 }), []);
  const plat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 0.8, roughness: 0.35 }), []);
  const steel = useMemo(chrome, []);
  return (
    <group {...p}>
      <mesh material={plat} position={[0, -0.08, 0]}><cylinderGeometry args={[2.25, 2.25, 0.12, 128]} /></mesh>
      <group rotation={[0, -spin, 0]}>
        <mesh material={[edge, rec, edge]}><cylinderGeometry args={[2.1, 2.1, 0.03, 128]} /></mesh>
      </group>
      <group position={[2.35, 0.25, -1.6]} rotation={[0, -0.55 - arm * 0.35, 0]}>
        <mesh material={steel} position={[0, -0.12, 0]}><cylinderGeometry args={[0.16, 0.2, 0.3, 32]} /></mesh>
        <mesh material={steel} position={[-1.3, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 2.6, 16]} /></mesh>
        <mesh material={plat} position={[-2.62, 0.0, 0]}><boxGeometry args={[0.3, 0.08, 0.16]} /></mesh>
      </group>
    </group>
  );
};

export const ShoeBox: React.FC<JSX.IntrinsicElements["group"] & { color?: string; lid?: string }> = ({ color = "#e8e6e1", lid = "#1a1a1c", ...p }) => {
  const a = useMemo(() => new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, clearcoat: 0.2 }), [color]);
  const b = useMemo(() => new THREE.MeshPhysicalMaterial({ color: lid, roughness: 0.5, clearcoat: 0.3 }), [lid]);
  return (
    <group {...p}>
      <RoundedBox args={[1.4, 0.5, 0.85]} radius={0.015} smoothness={2} material={a} position={[0, 0.25, 0]} castShadow receiveShadow />
      <RoundedBox args={[1.44, 0.16, 0.89]} radius={0.015} smoothness={2} material={b} position={[0, 0.5, 0]} castShadow />
    </group>
  );
};

/** Mirror with liquid-distorting surface (`wobble` 0..1). */
export const Mirror: React.FC<JSX.IntrinsicElements["group"] & { wobble?: number; t?: number }> = ({ wobble = 0, t = 0, ...p }) => {
  const frame = useMemo(() => {
    const rr = (s: THREE.Shape | THREE.Path, w: number, h: number, r: number) => { s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h); };
    const s = new THREE.Shape(); rr(s, 1.25, 2.05, 0.5); const hole = new THREE.Path(); rr(hole, 1.12, 1.92, 0.42); s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 });
  }, []);
  const plane = useMemo(() => new THREE.PlaneGeometry(2.26, 3.86, 80, 120), []);
  const base = useMemo(() => Float32Array.from(plane.attributes.position.array), [plane]);
  const pos = plane.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3], y = base[i * 3 + 1];
    const r = Math.sqrt(x * x + y * y);
    pos.setZ(i, wobble * 0.08 * Math.sin(r * 6 - t * 8) * Math.exp(-r * 0.4));
  }
  pos.needsUpdate = true; plane.computeVertexNormals();
  const glassM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d9dde6", metalness: 1, roughness: 0.03 }), []);
  const fm = useMemo(chrome, []);
  return (
    <group {...p}>
      <mesh geometry={frame} material={fm} position={[0, 0, -0.06]} castShadow />
      <mesh geometry={plane} material={glassM} position={[0, 0, 0.02]} />
    </group>
  );
};

export const Scales: React.FC<JSX.IntrinsicElements["group"] & { tilt?: number }> = ({ tilt = 0, ...p }) => {
  const g = useMemo(gold, []);
  const pan = useMemo(() => lathe([[0, 0], [0.55, 0.0], [0.62, 0.14], [0.6, 0.15], [0, 0.03]]), []);
  const side = (s: 1 | -1) => {
    const y = -Math.sin(tilt) * 1.4 * s;
    return (
      <group key={s} position={[1.4 * s, 2.6 + y, 0]}>
        {[0, 1, 2].map((k) => { const a = (k * Math.PI * 2) / 3; return <mesh key={k} material={g} position={[Math.cos(a) * 0.25, -0.6, Math.sin(a) * 0.25]} rotation={[Math.sin(a) * 0.38, 0, -Math.cos(a) * 0.38]}><cylinderGeometry args={[0.012, 0.012, 1.25, 8]} /></mesh>; })}
        <mesh geometry={pan} material={g} position={[0, -1.25, 0]} />
      </group>
    );
  };
  return (
    <group {...p}>
      <mesh material={g} position={[0, 1.3, 0]}><cylinderGeometry args={[0.06, 0.09, 2.6, 32]} /></mesh>
      <mesh material={g} position={[0, 0.03, 0]}><cylinderGeometry args={[0.6, 0.75, 0.12, 64]} /></mesh>
      <mesh material={g} position={[0, 2.6, 0]} rotation={[0, 0, tilt]}><boxGeometry args={[2.9, 0.07, 0.07]} /></mesh>
      <mesh material={g} position={[0, 2.75, 0]}><sphereGeometry args={[0.11, 32, 16]} /></mesh>
      {side(1)}{side(-1)}
    </group>
  );
};

export const Crown: React.FC<JSX.IntrinsicElements["group"]> = (p) => {
  const g = useMemo(gold, []);
  const gem = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d01020", roughness: 0.05, metalness: 0.2, clearcoat: 1, emissive: new THREE.Color("#3a0005") }), []);
  return (
    <group {...p}>
      <mesh material={g}><cylinderGeometry args={[1, 1, 0.55, 96, 1, true]} /></mesh>
      <mesh material={g} position={[0, -0.27, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.0, 0.06, 16, 96]} /></mesh>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return (
        <group key={i} position={[Math.cos(a) * 0.98, 0.55, Math.sin(a) * 0.98]}>
          <mesh material={g} rotation={[0, -a, 0]}><coneGeometry args={[0.2, 0.75, 4]} /></mesh>
          <mesh material={g} position={[0, 0.42, 0]}><sphereGeometry args={[0.07, 24, 12]} /></mesh>
          <mesh material={gem} position={[Math.cos(a) * 0.04, -0.55, Math.sin(a) * 0.04]}><sphereGeometry args={[0.1, 24, 12]} /></mesh>
        </group>); })}
    </group>
  );
};

export const ChromeBalls: React.FC<{ n: number; t: number; rise: number; seed?: number }> = ({ n, t, rise, seed = 3 }) => {
  const m = useMemo(chrome, []);
  const g = useMemo(() => new THREE.SphereGeometry(1, 32, 16), []);
  const d = useMemo(() => { const r = mulberry(seed); return Array.from({ length: n }, (_, i) => [((i % 9) - 4) * 0.55 + (r() - 0.5) * 0.1, Math.floor(i / 9), r()]); }, [n, seed]);
  return <>{d.map(([x, row, k], i) => { const p = Math.max(0, Math.min(1, rise * 1.6 - row * 0.12 - k * 0.1)); return <mesh key={i} geometry={g} material={m} position={[x, -2.6 + row * 0.55 + (1 - p) * -2, -row * 0.4]} scale={0.24 * p} />; })}</>;
};
