// 2D procedural surfaces (canvas → data URL, generated once per render tab).
import { mulberry } from "../3d-models/textures";

const memo = new Map<string, string>();
const gen = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  if (memo.has(key)) return memo.get(key)!;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const url = cv.toDataURL("image/jpeg", 0.9); memo.set(key, url); return url;
};

/** Black pebbled leather. */
export const leatherURL = () => gen("leather", 1080, 1920, (c) => {
  c.fillStyle = "#151313"; c.fillRect(0, 0, 1080, 1920);
  const r = mulberry(11);
  for (let i = 0; i < 26000; i++) {
    const x = r() * 1080, y = r() * 1920, s = 4 + r() * 9;
    const g = c.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s);
    g.addColorStop(0, `rgba(70,64,60,${0.35 + r() * 0.25})`); g.addColorStop(0.7, "rgba(25,22,21,0.2)"); g.addColorStop(1, "rgba(0,0,0,0.55)");
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, s, s * (0.7 + r() * 0.4), r() * 3, 0, Math.PI * 2); c.fill();
  }
  // stitching line
  c.strokeStyle = "rgba(190,180,165,0.55)"; c.lineWidth = 3; c.setLineDash([18, 12]);
  c.beginPath(); c.moveTo(80, 0); c.lineTo(80, 1920); c.stroke(); c.beginPath(); c.moveTo(1000, 0); c.lineTo(1000, 1920); c.stroke();
});

/** Dark brushed steel. */
export const brushedURL = () => gen("brushed", 1080, 1920, (c) => {
  const g = c.createLinearGradient(0, 0, 1080, 1920); g.addColorStop(0, "#2a2c30"); g.addColorStop(0.5, "#45484e"); g.addColorStop(1, "#1d1f22");
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  const r = mulberry(5);
  for (let i = 0; i < 9000; i++) { const y = r() * 1920; c.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.06})`; c.fillRect(r() * 1080 - 300, y, 200 + r() * 900, 1); }
});
