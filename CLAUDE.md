# Marlboro Rot – Apple-Style Lyrics-Video

Premium-Lyrics-Video (Deutschrap) mit Motion Graphics: Kinetic Typography plus prozedurale 3D-Objekte.
**Keine Menschen, keine Hände, keine Charaktere, keine echten Logos und keine Wettanbieter.**

## Stack
- Remotion 4 + @remotion/three (React Three Fiber 8, drei 9, postprocessing für Bloom und Vignette)
- Alle 3D-Modelle und Texturen sind **prozedural** (`3d-models/`) → keine Asset-Lizenzen, kein Download
- Font: Inter (SIL OFL, lokal über @fontsource)
- Audio-Analyse: `scripts/analyze_audio.py` (librosa: BPM, Beats, Kicks, Energie + faster-whisper large-v3 für Wort-Zeitstempel)

## Ordner
| Ordner | Inhalt |
|---|---|
| `audio/` | Original-MP3 (gleichzeitig Remotion-`publicDir`) – nie verändern |
| `lyrics/` | `source.txt` (verbindlicher Songtext, 1 Zeile = 1 Lyric-Zeile), `whisper_words.json` (Cache), `analysis.json` (Beats), `lyrics.json` (ausgerichtet), `timing.ts` |
| `presets/theme.ts` | Designsystem: Farben, Font, Bezier-Kurven, Format |
| `animations/` | `ease.ts` (prog/spr/lerp), `beat.ts` (beatPulse, snapToBeat) |
| `components/` | Background/Grain/Vignette, KineticText (Word, LightLine), Glass, Smoke, Sparks, Stage3D (Kamera, Studio-Env, Bloom) |
| `3d-models/` | textures.ts, MoneyBundle/Bill, Cigarette, PufferJacket |
| `scenes/` | Kompositionen; `scenes/shots/` = ein Shot pro Lyric-Abschnitt |
| `previews/` | Low-Res-Tests, Stills |
| `output/` | finale Renders (gitignored) |

## Regeln
- BPM ≈ 123, Gesang beginnt bei 0,84 s. Song-Zeit = Frame-Zeit (60 fps, Komposition startet bei 0).
- Timing **nie hart codieren**: `wf("Wort", n)` aus `lyrics/timing.ts` liefert den Frame des n-ten Vorkommens.
- Wörter mit `"check": true` in `lyrics.json` müssen manuell geprüft werden (Whisper-Wahrscheinlichkeit < 0,5).
- Alles muss eine reine Funktion des Frames sein (kein `useFrame`-State, kein `Math.random` → `mulberry`/`random(seed)`).
- Wörter beginnen 6 Frames vor ihrem Zeitstempel (Lead-in), damit sie beim Singen lesbar sind.
- Jede Zeile braucht ein eigenes visuelles Motiv – Effekte nicht wiederholen.
- Kein abgeschnittener Text: maximale Wortbreite ≈ 950 px bei 1080 px Breite.

## Pipeline
```bash
python scripts/analyze_audio.py            # einmalig, Ergebnis gecacht in lyrics/
python scripts/build_lyrics.py             # nach jeder Änderung an lyrics/source.txt
npx remotion studio src/index.ts           # Live-Vorschau
npx remotion still src/index.ts TestScene previews/x.png --frame=120 --scale=0.4
npm run preview                            # 540p
npm run render:test                        # 1080×1920, 60 fps, H.264 CRF 16, AAC 320k
```

## Windows (i5-10400F, GTX 1660 Super)
- `remotion.config.ts` nutzt auf Windows automatisch `--gl=angle` (GPU-WebGL). Concurrency 4–6 (`REMOTION_CONCURRENCY`).
- Whisper lokal: `pip install faster-whisper librosa`, CUDA optional (`device="cuda", compute_type="float16"`).
- Hardware-Encoding (optional, nur für Final-Encode): `ffmpeg -c:v h264_nvenc -preset p7 -cq 18`.

## Projekt 2: „Niemals“ (`niemals/`)
- Audio `audio/niemals.mp3` (37,7 s, 108 BPM). Text: `niemals/lyrics/source.txt` (verbindlich, vom Nutzer). Alignment: `LYR_DIR=niemals/lyrics python scripts/build_lyrics.py`
- One-Take-Architektur: `niemals/NiemalsWorld.tsx` (eine Szene, Zeit-Funktionen), `niemals/models/Shards.tsx` (Splitterfeld), `niemals/models/MorphSlab.tsx` (Morph-Körper), Zeiten in `niemals/timeline.ts`
- KEINE harten Schnitte, kein simples Fade: jede Szene entsteht aus der vorherigen (siehe `niemals/STORYBOARD.md`)
- Glas ohne `transmission` rendern (SwiftShader-Artefakte) → transparente Physical-Materialien + Environment-Lightformer
- Stills: `COMP=NiemalsTest node scripts/stills.mjs <dir> 0.3 <frames…>`

## Projekt 3: „Feuer“ – Apple-iOS-Lyrics-Video 16:9 (`feuer/`)
- 1920×1080, 60 fps. Audio `audio/feuer.mp3` (40,1 s, ~96 BPM). Text: `feuer/lyrics/source.txt` (verbindlich, inkl. Adlibs in Klammern).
- Timing: Whisper mit Text-Prompt + akustischer Gegenlauf (`feuer/lyrics/raw/`), Korrekturen in `feuer/lyrics/manual_times.json`.
- Reines 2D (React/SVG/CSS-3D), kein WebGL → schnelles Rendern. Szenen in `feuer/scenes/A|B|C.tsx`, Master `feuer/Feuer.tsx`.
- Szenen sind TRANSPARENT; der Master malt einen gemeinsamen Hintergrund → Übergänge überlappen echt (nie einen deckenden Hintergrund pro Szene einbauen).
- Lyrics im Referenz-Stil: `feuer/ui/Lyrics.tsx` (Wort erscheint beim Singen, grau → schwarz/Akzent, Akzente kursiv Serif, Adlibs grau kursiv).
- Export: `COMP=Feuer TOTAL=2406 AUDIO=audio/feuer.mp3 OUT=output/feuer_chunks FINAL=output/apple_ios_lyrics_video_16x9.mp4 bash scripts/render_chunks.sh`
