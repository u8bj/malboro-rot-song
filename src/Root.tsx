import "./fonts";
import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "../presets/theme";
import { TestScene, TEST_DURATION } from "../scenes/TestScene";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={TEST_DURATION} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
