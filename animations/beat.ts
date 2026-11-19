import analysis from "../lyrics/analysis.json";
import { VIDEO } from "../presets/theme";

const beats: number[] = analysis.beats;
const kicks: number[] = analysis.kicks;
export const BPM = analysis.bpm;

const lastBefore = (arr: number[], t: number) => {
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (arr[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
};

/** Exponentially decaying 1→0 pulse after each beat. `absFrame` = frame in song time. */
export const beatPulse = (absFrame: number, decay = 7, src: "beats" | "kicks" = "beats") => {
  const arr = src === "beats" ? beats : kicks;
  const t = absFrame / VIDEO.fps;
  const i = lastBefore(arr, t);
  if (i < 0) return 0;
  return Math.exp(-(t - arr[i]) * decay);
};

/** Nearest beat time (seconds) to t – used to snap transitions. */
export const snapToBeat = (t: number) => {
  const i = lastBefore(beats, t);
  const a = beats[Math.max(0, i)], b = beats[Math.min(beats.length - 1, i + 1)];
  return Math.abs(t - a) < Math.abs(b - t) ? a : b;
};

export const energyAt = (absFrame: number) => {
  const e = analysis.energy;
  const idx = Math.min(e.values.length - 1, Math.max(0, Math.floor((absFrame / VIDEO.fps) * e.fps)));
  return e.values[idx];
};
