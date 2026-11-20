#!/usr/bin/env bash
# Stable chunked render of the full video. Re-run safely: finished chunks are skipped.
# Delete output/chunks/c_NN.mp4 to force re-rendering a chunk (e.g. after a lyric fix).
#   SCALE=0.5 bash scripts/render_chunks.sh   → preview
set -e
SCALE=${SCALE:-1}; CHUNK=${CHUNK:-600}; TOTAL=${TOTAL:-5017}; COMP=${COMP:-FullVideo}; AUDIO=${AUDIO:-audio/malboro_rot.mp3}; FINAL=${FINAL:-output/malboro_rot_full_s${SCALE}.mp4}
OUT=${OUT:-output/chunks_s${SCALE}}; mkdir -p "$OUT" "$(dirname "$FINAL")"
i=0
for ((a=0; a<TOTAL; a+=CHUNK)); do
  b=$((a+CHUNK-1)); ((b>=TOTAL)) && b=$((TOTAL-1))
  f=$(printf "%s/c_%02d.mp4" "$OUT" $i)
  if [ ! -s "$f" ]; then
    echo "[$(date +%T)] chunk $i frames $a-$b"
    npx remotion render src/index.ts "$COMP" "$f.tmp.mp4" --frames=$a-$b --scale=$SCALE --muted --log=error && mv "$f.tmp.mp4" "$f"
  fi
  i=$((i+1))
done
ls "$OUT"/c_*.mp4 | sed "s#^#file '$PWD/#; s#\$#'#" > "$OUT/list.txt"
# re-encode while concatenating (stream copy can drop frames at chunk joins)
ffmpeg -y -loglevel error -f concat -safe 0 -i "$OUT/list.txt" -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -r 60 -fps_mode cfr "$OUT/video_only.mp4"
ffmpeg -y -loglevel error -i "$OUT/video_only.mp4" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -movflags +faststart "$FINAL"
echo "DONE $FINAL"
