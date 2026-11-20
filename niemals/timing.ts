import lyrics from "./lyrics/lyrics.json";
export const NL = lyrics as { line: number; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] }[];
const clean = (w: string) => w.replace(/[^\p{L}\d'-]/gu, "").toLowerCase();
/** seconds when word (n-th occurrence inside line) starts */
export const ws = (line: number, word: string) => {
  const w = NL[line].words.find((x) => clean(x.w) === word.toLowerCase());
  if (!w) throw new Error(`niemals: ${word} not in line ${line}`);
  return w.s;
};
export const ls = (line: number) => NL[line].start;
export const le = (line: number) => NL[line].end;
