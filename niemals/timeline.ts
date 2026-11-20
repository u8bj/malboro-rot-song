// All key times in SECONDS, derived from the aligned lyrics (never hard-coded song positions where a word exists).
import { ws, ls, NL } from "./timing";
const lastIch = NL[1].words[NL[1].words.length - 1].s;
import analysis from "./lyrics/analysis.json";
const beats: number[] = analysis.beats;
export const beatNear = (t: number) => beats.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a), beats[0]);

export const T = {
  // scene 1 – orb
  crack0: ws(0, "niemals") - 0.1,
  shatter: beatNear(ws(0, "mich") + 0.25),          // 1.93 – on the beat after „mich“
  // transition 1→2 – shards fly into a mirror
  tiles0: 0, tiles1: 0, // filled below
  // scene 2 – mirror
  clear0: 0, clear1: ws(1, "wahres") + 0.3,
  behind: ws(1, "wahres") - 0.1,
  // transition 2→3 – mirror morphs into the glass eye
  eye0: beatNear(lastIch + 0.3), eye1: ws(2, "augen") - 0.1,
  iris0: ws(2, "deine"), iris1: ws(2, "augen"),
  beam0: ws(2, "verraten") - 0.05, beam1: ws(2, "dich") + 0.15,
  // transition 3→4 – iris becomes the clock
  clock0: beatNear(ws(2, "dich") + 0.3), clock1: ws(3, "viel") + 0.3,
  shadow0: ws(3, "weggeschaut"), shadow1: beatNear(ls(4)) - 0.55,
  // transition 4→5 – clock dissolves into glass particles that rebuild the (damaged) orb
  dissolve: beatNear(ls(4)) - 0.55, orbBack: ls(4),
};
T.tiles0 = T.shatter + 0.45;
T.tiles1 = beatNear(ws(1, "nie"));
T.clear0 = T.tiles1 + 0.12;
export const TEST_END_S = ls(5) + 0.1; // test ends right as scene 6 starts

// ── Act 2 (scenes 6–16). Stage for act 2 sits deeper in space: S2 = (0,0,-10) – the camera flies there through the memory plates.
export const T2 = {
  plates0: ls(5) - 0.4, plates1: ws(5, "erinnerung'n"),
  eyeT0: ls(6) - 0.55, eyeT1: ls(6) + 0.15,
  heart0: beatNear(ws(6, "dich") + 0.2), heart1: ls(7) + 0.05,
  heartCrack0: ws(7, "lang"), heartShat: beatNear(ls(8) - 0.25),
  word1: ws(8, "undankbar"), wordCrack0: ws(8, "undankbar") + 0.4,
  domino0: ls(9) - 0.35, domino1: ws(9, "tust"), fall0: ws(9, "ohne"),
  city0: ws(9, "anfang'n") + 0.25, city1: ls(10) + 0.2,
  crumble: ws(10, "zerstör'n"),
  vortex0: ls(11) - 0.1, vortex1: ws(11, "nur"), clockIn: ws(11, "dieses"),
  collapse0: ls(12) - 0.65, collapse1: ls(12) - 0.02,
  beam0: ls(12) + 0.08, beam1: ls(12) + 0.6,
  dust0: ls(13) - 0.12, dust1: ws(13, "egal"),
  glass0: ws(13, "egal"), sand0: ws(13, "wie"), sand1: ls(14) - 0.2,
  wave0: ls(14) - 0.25, wave1: ws(14, "ich"), decay1: ws(14, "hör'n") + 0.3,
  path0: ls(15) - 0.45, path1: ws(15, "flieg'"),
  fade0: ws(15, "nacht") - 0.2,
};
export const END_S = 37.72;
