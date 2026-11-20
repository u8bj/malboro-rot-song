// Render many stills with one bundle + one browser.  node scripts/stills.mjs <outdir> <scale> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
const [outDir, scale, ...frames] = process.argv.slice(2);
const linux = process.platform === "linux";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("audio") });
const browserExecutable = linux ? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" : null;
const chromiumOptions = { gl: linux ? "swangle" : "angle" };
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromiumOptions });
const inputProps = process.env.DBG ? { dbg: process.env.DBG } : {};
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "FullVideo", puppeteerInstance, chromiumOptions, inputProps });
const q = [...frames];
const worker = async () => { while (q.length) { const fr = Number(q.shift()); await renderStill({ composition, serveUrl, frame: fr, output: `${outDir}/f${String(fr).padStart(5, "0")}.jpg`, imageFormat: "jpeg", inputProps, scale: Number(scale), puppeteerInstance, chromiumOptions, timeoutInMilliseconds: 120000, onBrowserLog: (l) => { if (l.text.includes("DBG")) console.log(l.text); } }); } };
await Promise.all([worker(), worker(), worker()]);
await puppeteerInstance.close({ silent: true });
console.log("done", frames.length);
