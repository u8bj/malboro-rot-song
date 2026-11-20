# Fortschritt – Marlboro Rot Lyrics-Video

## Stand
- [x] Testsequenz (Zeilen 1–2) inkl. Korrekturen: Glas-Label „4–5 Mille inside“ entfernt, 3D-Packung rot/weiß ergänzt (`3d-models/CigPack.tsx`)
- [x] Vollständiger Songtext in `lyrics/source.txt` (36 Zeilen inkl. finalem „Ah“) – **vorläufig**: Whisper + Nutzerzeilen, bis der Nutzer seinen Text schickt
- [x] Alignment `scripts/build_lyrics.py` → `lyrics/lyrics.json`, Prüfliste `lyrics/sync_report.txt`
- [x] Alle Shots: `scenes/shots/SmokeShot|MoneyShot|JacketShot` (Z. 1–2), `LinesA` (Z. 3–10), `LinesB` (Z. 11–22), `LinesC` (Z. 23–36)
- [x] Komposition `FullVideo` (`scenes/FullVideo.tsx`, 5017 Frames = 83,616 s)
- [x] Finaler Render: `output/malboro_rot_full_s1.mp4` (83,616 s, 5016 Frames, 1080×1920, 60 fps, H.264 + AAC 320k)
- [x] QC: Dauer = Audio, vollständig dekodierbar, keine echten Schwarzbilder (8,4 s = minimalistische Uhr, geprüft)

## Fortsetzen nach Unterbrechung
1. `npm i` · Python-venv: `pip install faster-whisper librosa`
2. `bash scripts/render_chunks.sh` – fertige Chunks werden übersprungen
3. Ergebnis: `output/malboro_rot_full_s1.mp4`

## Lyrics-Korrektur durch Nutzer
1. `lyrics/source.txt` ersetzen (gleiche Zeilenaufteilung = 1 Shot pro Zeile; Zeilenanzahl muss zur Shot-Liste in `scenes/FullVideo.tsx` passen)
2. `python scripts/build_lyrics.py` → `lyrics/sync_report.txt` prüfen
3. Betroffene Chunks löschen (Chunk n = Frames n·600 … n·600+599 = Sekunden n·10 … n·10+10) und `render_chunks.sh` erneut starten

## Bekannte unsichere Wörter (Whisper)
siehe `lyrics/sync_report.txt` (CHECK-Einträge)
