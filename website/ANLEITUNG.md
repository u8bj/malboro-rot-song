# Warteliste-Webseite einrichten (komplett kostenlos, ca. 20 Minuten)

Du brauchst: ein **Supabase**-Konto (Datenbank, Song-Speicher und Admin-Login) und ein **GitHub**-Konto (Hosting).
Solange `config.js` leer ist, läuft alles im **Demo-Modus** – zum Anschauen, ohne zu speichern.

## 1. Supabase-Projekt anlegen (ca. 5 Min.)
1. Auf **supabase.com** kostenlos registrieren → **New project**.
2. Name z. B. `warteliste`, ein Datenbank-Passwort vergeben (gut aufheben), **Region: Central EU (Frankfurt)** wählen → Create.

## 2. Datenbank einrichten (ca. 2 Min.)
1. Links **SQL Editor** → **New query**.
2. Den kompletten Inhalt von `supabase/setup.sql` hineinkopieren.
3. **Ganz unten** `DEINE-EMAIL@BEISPIEL.DE` durch **deine E-Mail** ersetzen → **Run**. Es muss „Success“ erscheinen.

## 3. Admin-Login anlegen und fremde Registrierungen sperren (ca. 2 Min.)
1. Links **Authentication** → **Users** → **Add user** → **Create new user**: dieselbe E-Mail wie in Schritt 2 und ein **starkes Passwort**, Haken bei **Auto Confirm User** → Create.
2. **Authentication** → **Sign In / Providers** (bzw. **Settings**) → **„Allow new users to sign up“ AUSschalten** → Save.
   (Wichtig: Dann kann sich niemand außer dir ein Konto anlegen.)

## 4. Schlüssel in `config.js` eintragen (1 Min.)
1. **Project Settings** → **API** (bzw. **Data API**): kopiere **Project URL** und den **anon public** Key.
2. In `config.js` bei `SUPABASE_URL` und `SUPABASE_ANON_KEY` einfügen. Optional bei `HANDLE` deinen TikTok-Namen.
   Der anon-Key darf öffentlich sein. Der **service_role**-Key darf **niemals** in die Webseite!

## 5. Datenschutz ausfüllen
In `datenschutz.html` alle **gelb markierten** Stellen ersetzen.

## 6. Online stellen mit GitHub Pages (ca. 5 Min.)
1. Auf github.com → **New repository**, Name z. B. `musikvideo-warteliste`, **Public** → Create.
2. **„uploading an existing file“** anklicken und **den Inhalt** des Ordners `website` (alle Dateien und Unterordner, auch `.nojekyll`) hineinziehen → **Commit changes**.
3. Im Repo **Settings** → **Pages** → Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → Save.
4. Nach 1–2 Minuten ist die Seite online unter `https://DEINNAME.github.io/musikvideo-warteliste/`
5. Diesen Link in deine **TikTok-Bio**.

## Admin-Panel
`https://DEINNAME.github.io/musikvideo-warteliste/admin.html` – mit deiner E-Mail und deinem Passwort anmelden.
- Alle Anmeldungen mit Platz, Suche und Filter (Neu / Wartet / In Arbeit / Fertig / Abgelehnt)
- Eintrag anklicken: Song anhören und herunterladen, Lyrics kopieren, Kontakt kopieren, Status setzen, interne Notizen, löschen (inkl. Song)
- Schalter **Anmeldungen offen/geschlossen** mit eigenem Hinweistext
- **CSV-Export** (z. B. für Excel)

## Gut zu wissen
- **Gratis-Grenzen bei Supabase:** 500 MB Datenbank, 1 GB Dateispeicher (≈ 150–250 Songs). Lösche fertige Einträge, dann ist wieder Platz.
- **Pausieren:** Gratis-Projekte werden nach ca. 1 Woche **ohne jede Aktivität** pausiert. Neue Anmeldungen zählen als Aktivität. Falls doch pausiert: im Supabase-Dashboard auf **Restore/Resume** klicken – die Daten bleiben erhalten.
- Songs sind **privat**: Nur du siehst sie nach dem Login. Besucher können sich nur eintragen, nichts lesen oder ändern.
- Uploads sind auf 10 MB und Audiodateien beschränkt.
