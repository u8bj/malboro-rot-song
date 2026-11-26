#!/usr/bin/env bash
# Builds deploy/dist/visualx.mp4/ from the website folder. Usage: bash deploy/build.sh  (run inside website/)
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf deploy/dist && mkdir -p deploy/dist/visualx.mp4
cp ./*.html config.js sw.js manifest.webmanifest deploy/dist/visualx.mp4/
cp -r assets deploy/dist/visualx.mp4/
# optional live config (not committed): deploy/config.live.js overrides config.js
if [ -f deploy/config.live.js ]; then cp deploy/config.live.js deploy/dist/visualx.mp4/config.js; fi

# cache-busting: every build gets a version tag on CSS/JS links so browsers always load the new files
V=$(date +%s)
for f in deploy/dist/visualx.mp4/*.html; do
  sed -i -E "s#(href|src)=\"(assets/[^\"?]+\.(css|js)|config\.js)\"#\1=\"\2?v=$V\"#g" "$f"
done
