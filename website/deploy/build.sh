#!/usr/bin/env bash
# Builds deploy/dist/visualx.mp4/ from the website folder. Usage: bash deploy/build.sh  (run inside website/)
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf deploy/dist && mkdir -p deploy/dist/visualx.mp4
cp ./*.html config.js deploy/dist/visualx.mp4/
cp -r assets deploy/dist/visualx.mp4/
# optional live config (not committed): deploy/config.live.js overrides config.js
if [ -f deploy/config.live.js ]; then cp deploy/config.live.js deploy/dist/visualx.mp4/config.js; fi
find deploy/dist -type f | sed 's|deploy/dist||' | sort
