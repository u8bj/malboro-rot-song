# Niemals – Storyboard & Übergangsplanung (One-Take)

**Prinzip:** Eine einzige durchgehende 3D-Szene, eine durchgehende Kamerafahrt (Catmull-Rom-Spline, nie Schnitt).
Drei persistente „Träger“ transportieren die Form von Szene zu Szene:

| Träger | Technik | Rolle |
|---|---|---|
| **Splitterfeld** (1280 Glas-Dreiecke) | jeder Splitter hat eine Pose pro Zustand, Übergang = gestaffelte Interpolation mit Bogen + Spin (an beiden Enden 0 → exakter Anschluss) | Kugel, Explosion, Spiegelkacheln, Uhr-Partikel, Wirbel, Herz-Fragmente, Buchstaben, Dominosteine, Trümmer, Sand |
| **Morph-Körper** (ein Polargitter-Mesh) | Umriss r(θ) + Dickenprofil werden gemischt | Spiegel ⇄ Augenlinse ⇄ Uhrglas ⇄ Herz |
| **Licht-Partikel** (Points) | Zielpositionen aus Oberflächen/Text gesampelt | Wort-Zerfall, Sanduhr, Schallwelle, Flugbahn, Sterne |

Zusätzlich: **Material-Morph** (Chrom → Glas → Metall), **Wort-Morph** (Gooey-Blur/Contrast: z. B. ICH → AUGEN), **Match-Cuts** über gleiche Bildposition (alle Hauptobjekte im selben Bildzentrum).

| # | Zeit (s) | Objekt | Übergang zur nächsten Szene (beginnt während der letzten Wörter) | Status |
|---|---|---|---|---|
| 1 | 0.07–2.16 | Glaskugel, Risse wachsen | Splitter explodieren (Beat 1.93) → fliegen als Kacheln, Material Glas→Chrom | ✅ Test |
| 2 | 2.21–4.14 | Spiegel (Chrom → klar), Wort hinter Glas | Polargitter-Morph Rechteck → Vesica-Linse; Wort-Morph ICH→AUGEN | ✅ Test |
| 3 | 4.64–6.40 | Glas-Auge, Iris bewegt sich, Lichtstrahl | Iris-Fasern werden Minutenstriche, Pupille → Zentrum, Linse → Kreis | ✅ Test |
| 4 | 6.73–9.02 | Uhr, Zeiger beschleunigen, Schatten-Sektor | Uhrglas zerfällt in Splitter-Kacheln → Wirbel | ✅ Test |
| 5 | 9.29–11.14 | beschädigte Kugel, neue Untersicht | Risse → Splitter lösen sich als rechteckige Glasplatten | ✅ Test (Anfang) |
| 6 | 11.42–13.16 | Glasplatten mit Lichtmustern, Kamera-Fly-Through | Platten drehen sich in Kreisanordnung → Linsenform | geplant |
| 7 | 13.70–15.46 | Auge erneut, Iris-Risse (Textur), dramatisches Licht | Linse → Herzumriss (Morph-Körper, r(θ) Herzkurve), Iris → rotes Kernlicht | geplant |
| 8 | 16.00–18.14 | Glasherz, leuchtet, Risse | Herz zerspringt → Splitter fliegen zu Buchstaben-Zielen | geplant |
| 9 | 18.44–20.76 | „UNDANKBAR“ aus Glas-/Metall-Splittern (Text-Sampling), Risse | Buchstaben fallen in Spalten → Quader | geplant |
| 10 | 20.90–23.08 | Dominokette kippt (Beat-synchron) | Steine richten sich auf, wachsen zu Gebäuden (Skalierung pro Stein) | geplant |
| 11 | 23.15–25.24 | schwebende Glasstadt, zerfällt, Kamera fliegt durch | Trümmer → Splitter-Wirbel | geplant |
| 12 | 25.24–28.28 | Wirbel + leuchtende Uhr im Zentrum, beschleunigt | Wirbel kollabiert zu Buchstaben | geplant |
| 13 | 29.09–29.80 | „UNDANKBAR“ riesig, Lichtstrahl | Buchstaben → Licht-Partikel | geplant |
| 14 | 29.80–31.98 | Sanduhr aus Partikeln/Glas, Sand fließt, Orbit | Sandkörner → Wellenlinien | geplant |
| 15 | 32.21–34.30 | 3D-Schallwelle (echte Audio-Daten), wird leiser | letzte Welle streckt sich zur Flugbahn | geplant |
| 16 | 34.48–37.12 | Leuchtbahn durch Sternenhimmel, Silberflugzeug, Kamera zieht zurück | Sterne verlöschen → weiches Ende | geplant |
