import { Easing, interpolate, spring } from "remotion";
import { CURVES, VIDEO } from "../presets/theme";

export const ez = {
  out: Easing.bezier(...CURVES.out),
  inOut: Easing.bezier(...CURVES.inOut),
  in: Easing.bezier(...CURVES.in),
  snap: Easing.bezier(...CURVES.snap),
};

/** 0..1 progress between frames [start, start+dur] with easing (clamped). */
export const prog = (frame: number, start: number, dur: number, easing = ez.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Premium spring (no overshoot wobble by default). */
export const spr = (frame: number, start: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({
    frame: frame - start,
    fps: VIDEO.fps,
    config: { damping: cfg.damping ?? 18, stiffness: cfg.stiffness ?? 120, mass: cfg.mass ?? 1 },
  });

export const sec = (s: number) => Math.round(s * VIDEO.fps);
