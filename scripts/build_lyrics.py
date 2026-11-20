"""Align the binding lyrics (lyrics/source.txt) to Whisper word timings.
Global sequence alignment → matched words get Whisper times (start snapped to onsets ±80 ms),
unmatched words are interpolated between anchors and flagged "check": true.
Extra timings: lyrics/manual_times.json {"<line>:<word>": start_seconds} overrides (for manual fixes)."""
import json, re, difflib, os
D = os.environ.get("LYR_DIR", "lyrics")
src = [l.strip() for l in open(f"{D}/source.txt", encoding="utf-8") if l.strip()]
ww = [w for s in json.load(open(f"{D}/whisper_words.json")) for w in s["words"]]
tail = os.path.exists(f"{D}/whisper_tail.json") and json.load(open(f"{D}/whisper_tail.json")) or []
ww += [w for w in tail if w["s"] > ww[-1]["s"] + 0.01]
for pt in (json.load(open(f"{D}/whisper_patches.json")) if os.path.exists(f"{D}/whisper_patches.json") else []):
    ww = [w for w in ww if not (pt["from"] <= w["s"] < pt["to"])] + pt["words"]
ww.sort(key=lambda w: w["s"])
on = json.load(open(f"{D}/analysis.json"))["onsets"]
manual = json.load(open(f"{D}/manual_times.json")) if os.path.exists(f"{D}/manual_times.json") else {}
norm = lambda s: re.sub(r"[^a-zäöüß0-9]", "", s.lower().replace("2pac", "tupac"))
words = [(li, wi, w) for li, line in enumerate(src) for wi, w in enumerate(line.split())]
A = [norm(w) for _, _, w in words]; B = [norm(w["w"]) for w in ww]
res = [None] * len(words)
n, m = len(A), len(B)
sim = lambda a, b: difflib.SequenceMatcher(None, a, b).ratio()
S = [[0.0] * (m + 1) for _ in range(n + 1)]; P = [[None] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    for j in range(1, m + 1):
        s = sim(A[i - 1], B[j - 1]); best = (S[i - 1][j - 1] + (s if s >= 0.55 else -0.3), "d")
        if S[i - 1][j] > best[0]: best = (S[i - 1][j], "u")
        if S[i][j - 1] > best[0]: best = (S[i][j - 1], "l")
        S[i][j], P[i][j] = best
i, j = n, m
while i > 0 and j > 0:
    d = P[i][j]
    if d == "d":
        if sim(A[i - 1], B[j - 1]) >= 0.55: res[i - 1] = (j - 1, sim(A[i - 1], B[j - 1]))
        i -= 1; j -= 1
    elif d == "u": i -= 1
    else: j -= 1
times = []
for k, r in enumerate(res):
    if r:
        x = ww[r[0]]; s = x["s"]; near = [o for o in on if abs(o - s) <= 0.08]
        if near: s = min(near, key=lambda o: abs(o - s))
        times.append({"s": s, "e": x["e"], "p": x["p"], "check": x["p"] < 0.45 or r[1] < 0.75})
    else: times.append(None)
# interpolate gaps
k = 0
while k < len(times):
    if times[k] is None:
        a = k - 1; b = k
        while b < len(times) and times[b] is None: b += 1
        t0 = times[a]["e"] if a >= 0 else 0.0
        t1 = times[b]["s"] if b < len(times) else t0 + 0.4 * (b - k)
        L = [len(words[q][2]) for q in range(k, b)]; tot = sum(L); acc = 0
        for q in range(k, b):
            s = t0 + (t1 - t0) * acc / tot; acc += L[q - k]; e = t0 + (t1 - t0) * acc / tot
            times[q] = {"s": s, "e": e, "p": 0, "check": True}
        k = b
    else: k += 1
out = []
for li, line in enumerate(src):
    ws = []
    for (l2, wi, w), t in zip(words, times):
        if l2 != li: continue
        key = f"{li}:{wi}"
        s = manual.get(key, t["s"])
        ws.append({"w": w, "s": round(s, 3), "e": round(t["e"], 3), "p": round(t["p"], 3), "check": bool(t["check"] and key not in manual)})
    out.append({"line": li, "text": line, "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws})
json.dump(out, open(f"{D}/lyrics.json", "w"), ensure_ascii=False, indent=1)
rep = []
for l in out:
    flags = [w["w"] for w in l["words"] if w["check"]]
    rep.append(f'{l["line"]:2d} {l["start"]:6.2f}-{l["end"]:6.2f}  ' + (f'CHECK: {flags}' if flags else "ok"))
open(f"{D}/sync_report.txt", "w").write("\n".join(rep) + "\n")
print("\n".join(rep))
