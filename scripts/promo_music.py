"""Procedural Apple-style promo music (no samples, no APIs). Writes audio/promo/music.mp3 + click.wav.
Timeline (s): 0-11 dark ambient build · 11 drop (bright house, 120 BPM) · 31-31.5 break · 31.5 finale · ends ~35.5"""
import numpy as np, soundfile as sf, subprocess
from scipy.signal import lfilter, butter, fftconvolve
SR = 48000; L = 36.5; N = int(L * SR); t = np.arange(N) / SR; BEAT = 0.5
rng = np.random.default_rng(7)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, d, s=0.0, r=0.0, sus=0.0):
    e = np.ones(n) * s; ia = int(a * SR); idd = int(d * SR)
    e[:ia] = np.linspace(0, 1, ia, endpoint=False)[:n]
    if ia < n: e[ia:ia + idd] = np.linspace(1, s, idd)[:max(0, n - ia)]
    return e
def lp(x, fc, order=2): b, a = butter(order, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc, order=2): b, a = butter(order, fc / (SR / 2), "high"); return lfilter(b, a, x)
def saw(f, n, det=0.0): ph = np.cumsum(np.full(n, f * (1 + det)) / SR); return 2 * (ph % 1) - 1
def add(buf, start, sig, g=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i < N: buf[i:j] += sig[:j - i] * g
mix = np.zeros(N); pads = np.zeros(N); drums = np.zeros(N); bassb = np.zeros(N); arp = np.zeros(N)

# ── A: dark pad (Am add9) swelling 0–11
n = int(11.2 * SR); sw = np.linspace(0, 1, n) ** 1.6
for m in [45, 52, 57, 60, 64, 71]:
    s = sum(saw(hz(m), n, d) for d in (-0.004, 0, 0.005)) / 3
    pads[:n] += lp(s, 500 + 1800 * sw.mean()) * (0.06 + 0.06 * sw ** 1.5) * (0.6 if m > 64 else 1)
for k in range(9, 22):  # soft low pulse from 4.5 s
    st = k * BEAT; e = np.exp(-np.arange(int(0.4 * SR)) / SR * 9); f = 55 * np.exp(-np.arange(len(e)) / SR * 6)
    add(drums, st, np.sin(2 * np.pi * np.cumsum(f) / SR) * e, 0.25 + 0.02 * (k - 9))
nz = rng.standard_normal(int(2.0 * SR)); r = hp(nz, 800) * np.linspace(0, 1, len(nz)) ** 3  # riser into the drop
add(mix, 9.0, lp(r, 9000), 0.18)

# ── drop hit at 11.0 and 31.5
def hit(st, g=1.0):
    n = int(2.5 * SR); f = 90 * np.exp(-np.arange(n) / SR * 3) + 32
    add(drums, st, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.arange(n) / SR * 2.2), 0.9 * g)
    nz = rng.standard_normal(int(1.2 * SR)) * np.exp(-np.arange(int(1.2 * SR)) / SR * 5)
    add(mix, st, lp(nz, 5000), 0.12 * g)
hit(11.0); hit(31.5, 1.15)

# ── B: progression C–G–Am–F (each 2 s = 1 bar) from 11 to 31, then finale chord
prog = [[48, 55, 60, 64, 67], [43, 50, 55, 59, 62], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60]]
def chord_at(x): return prog[int((x - 11.0) // 2.0) % 4]
for b in range(10):
    st = 11.0 + b * 2.0; n = int(2.05 * SR); ch = prog[b % 4]
    s = sum(saw(hz(m + 12), n, d) for m in ch[1:] for d in (-0.003, 0.004)) / 8
    e = env(n, 0.02, 0.3, 0.8); add(pads, st, lp(s, 2600 if b > 1 else 1800) * e, 0.11)
    for k in range(4):  # bass 8ths on root
        for h in range(2):
            bs = st + k * BEAT + h * 0.25; nn = int(0.23 * SR); f = hz(ch[0] - 12)
            sig = (np.sin(2 * np.pi * f * np.arange(nn) / SR) + 0.3 * saw(f, nn)) * env(nn, 0.005, 0.2, 0.3)
            add(bassb, bs, lp(sig, 700), 0.32 if h == 0 else 0.22)
# finale chord (C maj9) 31.5 → end
n = int(4.6 * SR); fin = sum(saw(hz(m), n, d) for m in [48, 55, 60, 64, 67, 71, 74] for d in (-0.004, 0.004)) / 14
add(pads, 31.5, lp(fin, 3200) * np.exp(-np.arange(n) / SR * 0.3) * env(n, 0.01, 0.1, 1), 0.75)
add(pads, 31.0, lp(rng.standard_normal(int(0.5 * SR)), 8000) * np.linspace(0, 1, int(0.5 * SR)) ** 2, 0.06)

# drums
def kick(st, g=1.0):
    n = int(0.35 * SR); f = 50 + 110 * np.exp(-np.arange(n) / SR * 30)
    add(drums, st, np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-np.arange(n) / SR * 9), 0.62 * g)
def clap(st, g=1.0):
    n = int(0.25 * SR); x = hp(rng.standard_normal(n), 1200) * np.exp(-np.arange(n) / SR * 18); add(drums, st, x, 0.16 * g)
def hat(st, g=1.0):
    n = int(0.06 * SR); x = hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 70); add(drums, st, x, 0.09 * g)
bt = 11.0
while bt < 31.0 - 1e-6:
    kick(bt)
    k = round((bt - 11.0) / BEAT)
    if bt >= 13.0 and k % 2 == 1: clap(bt)
    if bt >= 13.0: hat(bt + 0.25)
    bt += BEAT
for x in np.arange(29.0, 31.0, 0.125): add(drums, x, hp(rng.standard_normal(int(0.03 * SR)), 2500) * np.exp(-np.arange(int(0.03 * SR)) / SR * 80), 0.05 + 0.08 * (x - 29) / 2)  # snare-roll build
for x in [31.5, 32.5, 33.5]: kick(x, 1.1)

# pluck arpeggio (16ths) 15–31
x = 15.0
while x < 31.0 - 1e-6:
    ch = chord_at(x); i = int(round((x - 15.0) / 0.125)); m = [ch[2], ch[3], ch[4], ch[3] + 12][i % 4] + 12
    nn = int(0.2 * SR); f = hz(m); s = (np.sin(2 * np.pi * f * np.arange(nn) / SR) + 0.25 * np.sin(4 * np.pi * f * np.arange(nn) / SR)) * np.exp(-np.arange(nn) / SR * 18)
    add(arp, x, s, 0.07); x += 0.125

# sidechain pump on pads/bass/arp during the groove
duck = np.ones(N)
for k in range(40):
    st = 11.0 + k * BEAT
    if st >= 31.0: break
    i = int(st * SR); n2 = int(0.3 * SR); duck[i:i + n2] = np.minimum(duck[i:i + n2], 0.35 + 0.65 * (np.arange(min(n2, N - i)) / n2) ** 0.7)
ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-np.arange(int(2.2 * SR)) / SR * 2.6); ir /= np.abs(ir).sum() ** 0.5 * 6
wet = fftconvolve(pads + arp * 0.8, ir)[:N]
mix += (pads + arp) * duck + wet * 0.5 * duck + bassb * duck + drums
mix = hp(mix, 28); mix *= np.minimum(1, (L - t) / 0.8).clip(0, 1)
intro = np.where(t < 11.0, 0.45 + 0.55 * (t / 11.0) ** 1.5, 1.0); mix *= intro
mix = np.tanh(mix * 1.6) ; mix /= np.abs(mix).max() / 0.92
st = np.stack([mix, np.roll(mix, 9) * 0.97 + 0.03 * mix], 1)
sf.write("audio/promo/music.wav", st, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "audio/promo/music.wav", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "320k", "audio/promo/music.mp3"], check=True)
# UI sounds
def wavout(name, y): sf.write(f"audio/promo/{name}.wav", (y / np.abs(y).max() * 0.8).astype(np.float32), SR)
n = int(0.03 * SR); wavout("click", hp(rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / SR * 160) + 0.5 * np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 200))
n = int(0.5 * SR); wavout("confirm", sum(np.sin(2 * np.pi * hz(m) * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 6) for m in (84, 88, 91)))
n = int(0.12 * SR); wavout("tick", np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 50))
print("ok")
