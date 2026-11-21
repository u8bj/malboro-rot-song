import lyrics from "./lyrics/lyrics.json";
export const FL = lyrics as { line: number; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] }[];
export const FPS = 60;
export const W = 1920, H = 1080;
export const AUDIO_S = 40.098;
const clean = (w: string) => w.replace(/[^\p{L}\d’'-]/gu, "").toLowerCase();
/** seconds when `word` (n-th match) of `line` is sung */
export const ws = (line: number, word: string, nth = 0) => {
  const hits = FL[line].words.filter((x) => clean(x.w) === word.toLowerCase());
  if (!hits[nth]) throw new Error(`feuer: "${word}" not in line ${line}`);
  return hits[nth].s;
};
export const ls = (line: number) => FL[line].start;
export const le = (line: number) => FL[line].end;
