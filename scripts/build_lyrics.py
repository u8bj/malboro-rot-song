"""Align the user's binding lyrics to Whisper words, snap starts to nearby onsets, flag uncertain words.
Usage: python scripts/build_lyrics.py  (reads lyrics/source.txt, lyrics/whisper_words.json, lyrics/analysis.json)"""
import json, re, difflib
src = [l.strip() for l in open("lyrics/source.txt", encoding="utf-8") if l.strip()]
ww = [w for s in json.load(open("lyrics/whisper_words.json")) for w in s["words"]]
on = json.load(open("lyrics/analysis.json"))["onsets"]
norm = lambda s: re.sub(r"[^a-zäöüß0-9]", "", s.lower())
wn = [norm(w["w"]) for w in ww]
out, cur = [], 0
for li, line in enumerate(src):
    words = line.split()
    res = []
    for w in words:
        n = norm(w); best, bi = 0, None
        for j in range(cur, min(cur + 6, len(ww))):
            r = difflib.SequenceMatcher(None, n, wn[j]).ratio()
            if r > best: best, bi = r, j
        if bi is None or best < 0.5:
            res.append({"w": w, "s": None, "e": None, "check": True}); continue
        x = ww[bi]; cur = bi + 1
        s = x["s"]; near = [o for o in on if abs(o - s) <= 0.08]
        if near: s = min(near, key=lambda o: abs(o - s))
        res.append({"w": w, "s": round(s, 3), "e": x["e"], "p": x["p"], "check": x["p"] < 0.5 or best < 0.8})
    # fill unknowns by interpolation
    for i, r in enumerate(res):
        if r["s"] is None:
            prev = next((res[k]["e"] for k in range(i - 1, -1, -1) if res[k]["e"]), 0)
            r["s"] = r["e"] = prev
    out.append({"line": li, "text": line, "start": res[0]["s"], "end": res[-1]["e"], "words": res})
json.dump(out, open("lyrics/lyrics.json", "w"), ensure_ascii=False, indent=1)
for l in out:
    flags = [w["w"] for w in l["words"] if w.get("check")]
    print(f'{l["start"]:6.2f}-{l["end"]:6.2f}  {l["text"]}' + (f'   ⚠ prüfen: {flags}' if flags else ""))
