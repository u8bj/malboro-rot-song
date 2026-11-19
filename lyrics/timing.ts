import lyrics from "./lyrics.json";
import { VIDEO } from "../presets/theme";

type W = { w: string; s: number; e: number | null };
const all: W[] = (lyrics as { words: W[] }[]).flatMap((l) => l.words);

/** Song-time frame at which word `word` (n-th occurrence) starts. Throws if missing → no silent desync. */
export const wf = (word: string, nth = 0) => {
  const hits = all.filter((x) => x.w.replace(/[^\p{L}\d]/gu, "").toLowerCase() === word.toLowerCase());
  if (!hits[nth]) throw new Error(`Word not in lyrics.json: ${word}`);
  return Math.round(hits[nth].s * VIDEO.fps);
};
export const LYRICS = lyrics;
