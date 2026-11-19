// Inter (SIL OFL 1.1, free for commercial use) – Apple-like neo-grotesk, bundled locally via @fontsource.
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import { continueRender, delayRender } from "remotion";

const weights = [200, 300, 400, 500, 600, 700, 800, 900];
const handle = delayRender("fonts");
Promise.all(weights.map((w) => document.fonts.load(`${w} 100px Inter`, "ÄÖÜäöüß€0123456789ABC"))).then(() => continueRender(handle), () => continueRender(handle));
