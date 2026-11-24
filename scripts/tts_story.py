"""ElevenLabs narration with word timestamps + pause tightening.
usage: python scripts/tts_story.py <voice_id> <script.txt> <out_dir> <audio_out.mp3> [stability style speed]
writes <out_dir>/words.json and the tightened mp3. The API key is injected by the network proxy (never in code)."""
import json, sys, base64, subprocess, urllib.request, numpy as np, librosa, soundfile as sf, os
vid, script, out_dir, audio_out = sys.argv[1:5]
stab, style, speed = (float(x) for x in (sys.argv[5:8] if len(sys.argv) > 7 else (0.42, 0.35, 1.0)))
body = json.dumps({"text": open(script, encoding="utf-8").read().strip(), "model_id": "eleven_multilingual_v2",
                   "voice_settings": {"stability": stab, "similarity_boost": 0.85, "style": style, "use_speaker_boost": True, "speed": speed}}).encode()
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128", data=body, headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
d = json.load(urllib.request.urlopen(req))
raw = os.path.join(out_dir, "voice_raw.mp3"); open(raw, "wb").write(base64.b64decode(d["audio_base64"]))
a = d.get("alignment") or d.get("normalized_alignment")
w, cur, s, e = [], "", None, None
for c, s0, e0 in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
    if c.isspace():
        if cur: w.append({"w": cur, "s": s, "e": e}); cur = ""
        continue
    if not cur: s = s0
    cur += c; e = e0
if cur: w.append({"w": cur, "s": s, "e": e})
y, sr = librosa.load(raw, sr=44100, mono=True)
MAXGAP, KEEP = 0.38, 0.24
pieces, cur0 = [], 0.0
for i in range(len(w) - 1):
    if w[i + 1]["s"] - w[i]["e"] > MAXGAP:
        pieces.append((cur0, w[i]["e"] + KEEP / 2)); cur0 = w[i + 1]["s"] - KEEP / 2
pieces.append((cur0, len(y) / sr))
def remap(t):
    o = 0.0
    for a0, b0 in pieces:
        if t <= b0: return o + max(0, t - a0)
        o += b0 - a0
    return o
new = [{"w": x["w"], "s": round(remap(x["s"]), 3), "e": round(remap(x["e"]), 3)} for x in w]
fade = int(0.01 * sr); parts = []
for a0, b0 in pieces:
    seg = y[int(a0 * sr):int(b0 * sr)].copy()
    if len(seg) > 2 * fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    parts.append(seg)
tmp = os.path.join(out_dir, "voice_tight.wav"); sf.write(tmp, np.concatenate(parts), sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "160k", audio_out], check=True); os.remove(tmp)
json.dump(new, open(os.path.join(out_dir, "words.json"), "w"), ensure_ascii=False)
print(f"raw {len(y)/sr:.1f}s -> tight {sum(b-a for a,b in pieces):.1f}s, {len(new)} words")
print(" ".join(f"{i}:{x['w']}@{x['s']:.1f}" for i, x in enumerate(new)))
