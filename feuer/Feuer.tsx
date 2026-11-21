// Master composition – scenes overlap; each scene animates its own entrance from the previous one's last state.
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { ls } from "./timing";
import { useT } from "./ui/kit";
import * as A from "./scenes/A";
import { pr, eio } from "./ui/kit";
import * as B from "./scenes/B";
import * as Cs from "./scenes/C";

const SC: [React.FC, number][] = [[A.S1, 0], [A.S2, 1], [A.S3, 2], [A.S4, 3], [B.S5, 4], [B.S6, 5], [B.S7, 6], [B.S8, 7], [Cs.S9, 8], [Cs.S10, 9], [Cs.S11, 10], [Cs.S12, 11]];
const PAD_IN = 0.45, PAD_OUT = 0.3;

export const Feuer: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#f2f2f7" }}>
      <Audio src={staticFile("feuer.mp3")} />
      {/* ONE shared background – scenes are transparent so every transition really overlaps */}
      <A.Pastel hue="cool" />
      <AbsoluteFill style={{ opacity: eio(pr(t, ls(10) - 0.6, ls(10) + 0.2)) * (1 - eio(pr(t, ls(11) - 0.3, ls(11) + 0.5))) }}><A.Pastel hue="warm" /></AbsoluteFill>
      <AbsoluteFill style={{ background: "#ffffff", opacity: eio(pr(t, ls(3) - 0.35, ls(3) + 0.1)) * (1 - eio(pr(t, ls(4) + 0.2, ls(4) + 0.9))) }} />
      {SC.map(([S, line], i) => {
        const a = i === 0 ? -1 : ls(line) - PAD_IN;
        const b = i === SC.length - 1 ? 999 : ls(SC[i + 1][1]) + PAD_OUT;
        return t >= a && t < b ? <AbsoluteFill key={i}><S /></AbsoluteFill> : null;
      })}
    </AbsoluteFill>
  );
};
