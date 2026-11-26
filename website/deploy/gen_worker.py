"""Bundles deploy/dist/visualx.mp4/** into one self-contained Worker script (no Assets upload needed).
Serves files with correct types, caching and HTTP Range support (needed for video on iOS/Safari)."""
import base64, json, os, sys
root = os.path.join(os.path.dirname(__file__), "dist")
TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".mp4": "video/mp4", ".jpg": "image/jpeg",
         ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".json": "application/json"}
files = {}
for dp, _, fns in os.walk(root):
    for fn in fns:
        full = os.path.join(dp, fn); rel = "/" + os.path.relpath(full, root).replace(os.sep, "/")
        ext = os.path.splitext(fn)[1].lower()
        if fn.startswith(".") or ext not in TYPES: continue
        files[rel] = [TYPES[ext], base64.b64encode(open(full, "rb").read()).decode()]
js = "const FILES = " + json.dumps(files) + ";\n" + r'''
const cache = new Map();
function bytes(p) { let b = cache.get(p); if (!b) { const s = atob(FILES[p][1]); b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); cache.set(p, b); } return b; }
export default {
  async fetch(request) {
    const url = new URL(request.url);
    let p = decodeURIComponent(url.pathname);
    if (p === "/visualx.mp4") return Response.redirect(url.origin + "/visualx.mp4/" + url.search, 301);
    if (p.endsWith("/")) p += "index.html";
    if (!FILES[p] || !["GET", "HEAD"].includes(request.method)) return new Response("Nicht gefunden", { status: 404 });
    const [type] = FILES[p]; const body = bytes(p); const size = body.length;
    const h = { "Content-Type": type, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": type.startsWith("text/html") || p.endsWith("/config.js") ? "no-cache" : "public, max-age=86400" };
    if (p.endsWith("/admin.html")) h["X-Robots-Tag"] = "noindex, nofollow";
    const range = request.headers.get("Range");
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        let start = m[1] === "" ? size - Number(m[2]) : Number(m[1]); let end = m[1] !== "" && m[2] !== "" ? Number(m[2]) : size - 1;
        if (start >= size || start < 0 || end < start) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
        end = Math.min(end, size - 1);
        return new Response(request.method === "HEAD" ? null : body.slice(start, end + 1), { status: 206, headers: { ...h, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
      }
    }
    return new Response(request.method === "HEAD" ? null : body, { headers: { ...h, "Content-Length": String(size) } });
  },
};
'''
out = os.path.join(os.path.dirname(__file__), "bundle", "worker.js"); os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w").write(js)
print(len(files), "files,", round(os.path.getsize(out) / 1024 / 1024, 2), "MB script")
