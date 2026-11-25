"""Multi-voice ElevenLabs dialog → one tightened track + words.json (with speaker + line index).
usage: python scripts/tts_dialog.py <dialog.json> <out_dir> <audio_out.mp3>
Each line is cached in <out_dir>/lines/<i>.json (delete one file to re-voice just that line). The key is injected by the proxy."""
import json, sys, base64, subprocess, urllib.request, os, io, numpy as np, librosa, soundfile as sf
cfg_path, out_dir, audio_out = sys.argv[1:4]
cfg = json.load(open(cfg_path, encoding="utf-8")); os.makedirs(os.path.join(out_dir, "lines"), exist_ok=True)
SR = 44100
def tts(i, spk, text, prev, nxt):
    cache = os.path.join(out_dir, "lines", f"{i:02d}.json")
    if os.path.exists(cache): return json.load(open(cache))
    v = cfg["voices"][spk]
    body = {"text": text, "model_id": v.get("model", "eleven_multilingual_v2"), "voice_settings": {"stability": v["stability"], "similarity_boost": 0.85, "style": v["style"], "use_speaker_boost": True, "speed": v["speed"]}}
    if prev: body["previous_text"] = prev
    if nxt: body["next_text"] = nxt
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['id']}/with-timestamps?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    d = json.load(urllib.request.urlopen(req)); json.dump(d, open(cache, "w")); return d
def apply_fx(y, fx):
    if not fx: return y
    a, b = os.path.join(out_dir, "fx_in.wav"), os.path.join(out_dir, "fx_out.wav"); sf.write(a, y, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a, "-af", fx, "-ar", str(SR), "-ac", "1", b], check=True)
    z, _ = sf.read(b); os.remove(a); os.remove(b); z = z[:len(y)]
    return np.pad(z, (0, max(0, len(y) - len(z))))
lines = [l[:2] for l in cfg["lines"]]; line_fx = [l[2] if len(l) > 2 else None for l in cfg["lines"]]; track = []; words = []; t = 0.0
for i, (spk, text) in enumerate(lines):
    same = lambda j: 0 <= j < len(lines) and lines[j][0] == spk
    d = tts(i, spk, text, lines[i - 1][1] if same(i - 1) else None, lines[i + 1][1] if same(i + 1) else None)
    y, _ = librosa.load(io.BytesIO(base64.b64decode(d["audio_base64"])), sr=SR, mono=True)
    y = apply_fx(y, line_fx[i] or cfg["voices"][spk].get("fx"))
    a = d.get("alignment") or d["normalized_alignment"]
    w, cur, s, e = [], "", None, None
    for c, s0, e0 in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if c.isspace():
            if cur: w.append([cur, s, e]); cur = ""
            continue
        if not cur: s = s0
        cur += c; e = e0
    if cur: w.append([cur, s, e])
    maxgap = 0.38 if spk == "N" else 0.75   # characters keep their hesitation pauses
    keep = 0.24 if spk == "N" else 0.5
    st = max(0, w[0][1] - 0.04); en = min(len(y) / SR, w[-1][2] + 0.12)
    pieces, c0 = [], st
    for k in range(len(w) - 1):
        if w[k + 1][1] - w[k][2] > maxgap: pieces.append((c0, w[k][2] + keep / 2)); c0 = w[k + 1][1] - keep / 2
    pieces.append((c0, en))
    def remap(x):
        o = 0.0
        for a0, b0 in pieces:
            if x <= b0: return o + max(0, x - a0)
            o += b0 - a0
        return o
    fade = int(0.008 * SR)
    for a0, b0 in pieces:
        seg = y[int(a0 * SR):int(b0 * SR)].copy()
        if len(seg) > 2 * fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        track.append(seg)
    for x in w: words.append({"w": x[0], "s": round(t + remap(x[1]), 3), "e": round(t + remap(x[2]), 3), "spk": spk, "ln": i})
    t += sum(b - a for a, b in pieces)
    nxt_spk = lines[i + 1][0] if i + 1 < len(lines) else None
    gap = 0.0 if nxt_spk is None else (cfg.get("gap_same", 0.22) if nxt_spk == spk else cfg.get("gap_change", 0.32))
    track.append(np.zeros(int(gap * SR))); t += gap
y = np.concatenate(track); y = y / max(1e-6, np.abs(y).max()) * 0.89
tmp = os.path.join(out_dir, "dlg.wav"); sf.write(tmp, y, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", audio_out], check=True); os.remove(tmp)
json.dump(words, open(os.path.join(out_dir, "words.json"), "w"), ensure_ascii=False)
print(f"total {t:.1f}s, {len(words)} words")
for i in range(len(lines)):
    ws = [(k, x) for k, x in enumerate(words) if x["ln"] == i]
    print(f"L{i:02d} {lines[i][0]} {ws[0][1]['s']:.2f}-{ws[-1][1]['e']:.2f} idx {ws[0][0]}-{ws[-1][0]} | " + " ".join(f"{k}:{x['w']}" for k, x in ws))
