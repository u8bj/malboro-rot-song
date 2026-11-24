import "./fonts";
import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "../presets/theme";
import { TestScene, TEST_DURATION } from "../scenes/TestScene";
import { FullVideo, FULL_DURATION } from "../scenes/FullVideo";
import { NiemalsScene } from "../niemals/NiemalsWorld";
import { Feuer } from "../feuer/Feuer";
import { Wagen5, W5_DURATION_S, W5Cover } from "../viral/wagen5/Wagen5";
import { Still } from "remotion";
import { PP1, PP2, PP3 } from "../viral/shared/ProfilePic";
import { AUDIO_S as FEUER_S } from "../feuer/timing";
import { TEST_END_S, END_S } from "../niemals/timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={TEST_DURATION} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_DURATION} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Still id="PP1" component={PP1} width={1080} height={1080} />
    <Still id="PP2" component={PP2} width={1080} height={1080} />
    <Still id="PP3" component={PP3} width={1080} height={1080} />
    <Still id="Wagen5Cover" component={W5Cover} width={1080} height={1920} defaultProps={{ part: 1, hook: "Du hast 3 Sekunden." }} />
    <Composition id="Wagen5" component={Wagen5} durationInFrames={Math.ceil(W5_DURATION_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Feuer" component={Feuer} durationInFrames={Math.ceil(FEUER_S * 60)} fps={60} width={1920} height={1080} />
    <Composition id="Niemals" component={NiemalsScene} durationInFrames={Math.ceil(END_S * 60)} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="NiemalsTest" component={NiemalsScene} durationInFrames={Math.round(TEST_END_S * 60)} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
