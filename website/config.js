// ── Hier nach der Supabase-Einrichtung deine zwei Werte eintragen ──
// Supabase → Project Settings → API:  "Project URL"  und  "anon public" Key.
// Der anon-Key darf öffentlich sein (die Sicherheitsregeln in setup.sql schützen die Daten).
// Solange hier nichts steht, läuft die Seite im DEMO-MODUS (nichts wird gespeichert).
window.APP_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  // optional: dein TikTok-Handle für Kopf- und Fußzeile, z. B. "@deinname" (leer lassen = ausgeblendet)
  HANDLE: "",
};
