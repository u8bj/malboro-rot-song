// TEST SEQUENCE: song 0:00 → 0:06.08 – lines 1 & 2.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Grain, Vignette } from "../components/Background";
import { SmokeShot, SMOKE_END } from "./shots/SmokeShot";
import { MoneyShot, MONEY_START, MONEY_END } from "./shots/MoneyShot";
import { JacketShot, JACKET_START } from "./shots/JacketShot";
import { wf } from "../lyrics/timing";

export const TEST_DURATION = wf("Brandloch") ; // ends exactly where line 3 starts (6.08 s)
// NOTE: wf("Brandloch") requires line 3 in lyrics.json

export const TestScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      <Audio src={staticFile("malboro_rot.mp3")} />
      {f < SMOKE_END && <SmokeShot />}
      {f >= JACKET_START && <JacketShot />}
      {f >= MONEY_START - 1 && f < MONEY_END && <MoneyShot />}
      <Vignette strength={0.55} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
