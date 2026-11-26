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
js = open(os.path.join(os.path.dirname(__file__), "worker_template.js")).read().replace("/*FILES*/", "const FILES = " + json.dumps(files) + ";")
out = os.path.join(os.path.dirname(__file__), "bundle", "worker.js"); os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w").write(js)
print(len(files), "files,", round(os.path.getsize(out) / 1024 / 1024, 2), "MB script")
