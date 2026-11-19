import { Config } from "@remotion/cli/config";

// Linux cloud container: use the preinstalled headless shell + SwiftShader (no GPU).
// Windows (GTX 1660 Super): set REMOTION_GL=angle for GPU WebGL; leave browser default.
const isLinuxCloud = process.platform === "linux" && !process.env.REMOTION_DEFAULT_BROWSER;
if (isLinuxCloud) {
  Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
}
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as any) ?? (isLinuxCloud ? "swangle" : "angle"));
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
Config.setConcurrency(process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : 4);
Config.setTimeoutInMilliseconds(120000);
Config.setPublicDir("./audio");
