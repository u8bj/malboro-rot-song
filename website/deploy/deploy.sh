#!/usr/bin/env bash
# Neu hochladen: baut die Seite, packt sie in einen Worker und deployt nach u8bj.xyz/visualx.mp4
# Braucht einen Cloudflare-API-Token (Edit Cloudflare Workers, Zone u8bj.xyz).
set -euo pipefail
cd "$(dirname "$0")"
bash build.sh >/dev/null
python3 gen_worker.py
npx --yes wrangler@3.99.0 deploy
