"""Beat/BPM analysis + Whisper word timestamps. Writes lyrics/analysis.json and lyrics/whisper_words.json (cached)."""
import json, sys, os
import numpy as np, librosa
from faster_whisper import WhisperModel

AUDIO = sys.argv[1] if len(sys.argv) > 1 else "audio/malboro_rot.mp3"
MODEL = os.environ.get("WHISPER_MODEL", "large-v3")

y, sr = librosa.load(AUDIO, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, units="time")
rms = librosa.feature.rms(y=y, hop_length=512)[0]
rms_t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
# low-end kick detection
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[freqs < 150].sum(axis=0)
low_onset = librosa.onset.onset_detect(onset_envelope=np.maximum(0, np.diff(low, prepend=low[0])), sr=sr, hop_length=512, units="time")
json.dump({
    "duration": float(len(y) / sr),
    "bpm": float(np.atleast_1d(tempo)[0]),
    "beats": [round(float(b), 3) for b in beats],
    "onsets": [round(float(o), 3) for o in onsets],
    "kicks": [round(float(o), 3) for o in low_onset],
    "energy": {"fps": 10, "values": [round(float(v), 4) for v in np.interp(np.arange(0, rms_t[-1], 0.1), rms_t, rms)]},
}, open("lyrics/analysis.json", "w"))
print("BPM", tempo, "beats", len(beats))

model = WhisperModel(MODEL, device="cpu", compute_type="int8")
y16 = librosa.load(AUDIO, sr=16000, mono=True)[0].astype(np.float32)
segs, info = model.transcribe(y16, initial_prompt=os.environ.get("WHISPER_PROMPT", "Marlboro Rot, aber fühle mich wie John Player. Circa vier, fünf Mille in der Moncler."), language="de", word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)} for w in s.words]
    out.append({"s": round(s.start, 3), "e": round(s.end, 3), "text": s.text.strip(), "words": words})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
json.dump(out, open("lyrics/whisper_words.json", "w"), ensure_ascii=False, indent=1)
