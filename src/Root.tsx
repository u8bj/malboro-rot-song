import "./fonts";
import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "../presets/theme";
import { TestScene, TEST_DURATION } from "../scenes/TestScene";
import { FullVideo, FULL_DURATION } from "../scenes/FullVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={TEST_DURATION} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_DURATION} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
