// FULL MUSIC VIDEO – every lyric line gets its own shot. Song time == frame time.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Grain, Vignette } from "../components/Background";
import { ShotFrame, Trans } from "../components/ShotFrame";
import { lineStart } from "../components/LineText";
import { LYRICS } from "../lyrics/timing";
import { SmokeShot, SMOKE_END } from "./shots/SmokeShot";
import { MoneyShot, MONEY_START, MONEY_END } from "./shots/MoneyShot";
import { JacketShot, JACKET_START } from "./shots/JacketShot";
import * as A from "./shots/LinesA";
import * as B from "./shots/LinesB";
import * as C from "./shots/LinesC";

export const AUDIO_SECONDS = 83.616;
export const FULL_DURATION = Math.ceil(AUDIO_SECONDS * 60);

const LEAD = 8; // shots start a few frames before the first sung word
type Entry = { line: number; C: React.FC; inT: Trans; outT?: Trans; inDur?: number };
export const SHOTS: Entry[] = [
  { line: 2, C: A.Shot02, inT: "wipeUp", inDur: 10 },
  { line: 3, C: A.Shot03, inT: "blurzoom" },
  { line: 4, C: A.Shot04, inT: "flash", inDur: 8 },
  { line: 5, C: A.Shot05, inT: "iris", inDur: 16 },
  { line: 6, C: A.Shot06, inT: "zoom" },
  { line: 7, C: A.Shot07, inT: "cut" },
  { line: 8, C: A.Shot08, inT: "tilt", inDur: 16 },
  { line: 9, C: A.Shot09, inT: "slideUp" },
  { line: 10, C: B.Shot10, inT: "flash", inDur: 14 },
  { line: 11, C: B.Shot11, inT: "wipeLeft", inDur: 10 },
  { line: 12, C: B.Shot12, inT: "blurzoom" },
  { line: 13, C: B.Shot13, inT: "fade" },
  { line: 14, C: B.Shot14, inT: "iris", inDur: 14 },
  { line: 15, C: B.Shot15, inT: "slideUp" },
  { line: 16, C: B.Shot16, inT: "wipeUp" },
  { line: 17, C: B.Shot17, inT: "zoom" },
  { line: 18, C: B.Shot18, inT: "flash" },
  { line: 19, C: B.Shot19, inT: "blurzoom" },
  { line: 20, C: B.Shot20, inT: "cut" },
  { line: 21, C: B.Shot21, inT: "fade", inDur: 16 },
  { line: 22, C: C.Shot22, inT: "tilt" },
  { line: 23, C: C.Shot23, inT: "iris" },
  { line: 24, C: C.Shot24, inT: "flash", inDur: 8 },
  { line: 25, C: C.Shot25, inT: "wipeUp" },
  { line: 26, C: C.Shot26, inT: "blurzoom" },
  { line: 27, C: C.Shot27, inT: "cut" },
  { line: 28, C: C.Shot28, inT: "zoom" },
  { line: 29, C: C.Shot29, inT: "flash" },
  { line: 30, C: C.Shot30, inT: "fade" },
  { line: 31, C: C.Shot31, inT: "blurzoom", inDur: 20 },
  { line: 32, C: C.Shot32, inT: "iris" },
  { line: 33, C: C.Shot33, inT: "slideUp" },
  { line: 34, C: C.Shot34, inT: "fade", inDur: 6 },
];
const cutOf = (i: number) => (i < SHOTS.length ? lineStart(SHOTS[i].line) - LEAD : FULL_DURATION);
export const shotRange = (i: number) => [cutOf(i), cutOf(i + 1)] as const;

export const FullVideo: React.FC = () => {
  const f = useCurrentFrame();
  const firstCut = cutOf(0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      <Audio src={staticFile("malboro_rot.mp3")} />
      {f < SMOKE_END && <SmokeShot />}
      {f >= JACKET_START && f < firstCut + (SHOTS[0].inDur ?? 12) && <JacketShot />}
      {f >= MONEY_START - 1 && f < MONEY_END && <MoneyShot />}
      {SHOTS.map((s, i) => {
        const [a, b] = shotRange(i);
        // previous shot stays mounted underneath during the incoming transition
        return <ShotFrame key={i} from={a} to={b} hold={SHOTS[i + 1] && SHOTS[i + 1].inT !== "cut" ? (SHOTS[i + 1].inDur ?? 12) : 0} inT={s.inT} inDur={s.inDur} outT="cut" z={i + 1}><s.C /></ShotFrame>;
      })}
      <Vignette strength={0.5} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
export const LINE_COUNT = LYRICS.length;
