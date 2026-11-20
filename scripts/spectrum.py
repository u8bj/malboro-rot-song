"""Per-frame (60 fps) log-spaced spectrum, 24 bands, 0..1 → lyrics/spectrum.json (cached, used by audio-wave visuals)."""
import json, numpy as np, librosa
y, sr = librosa.load("audio/malboro_rot.mp3", sr=22050, mono=True)
hop = sr // 60
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
edges = np.geomspace(40, 12000, 25)
B = np.stack([S[(f >= edges[i]) & (f < edges[i + 1])].mean(axis=0) for i in range(24)], axis=1)
B = np.log1p(B * 20); B /= np.percentile(B, 99, axis=0, keepdims=True); B = np.clip(B, 0, 1)
json.dump([[round(float(v), 2) for v in r] for r in B], open("lyrics/spectrum.json", "w"), separators=(",", ":"))
print(B.shape)
