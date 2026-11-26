// Startseite: Formular → Supabase (Song-Upload in privaten Speicher + Eintrag in die Warteliste).
const CFG = window.APP_CONFIG || {};
const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
const $ = (id) => document.getElementById(id);
let sb = null;
if (!DEMO) {
  const { createClient } = window.supabase;
  sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
} else $("demo").hidden = false;
if (CFG.HANDLE) $("handle").textContent = CFG.HANDLE;

// sound toggle for the example clip
$("sound").onclick = () => { const v = $("ex"); v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play(); } $("sound").textContent = v.muted ? "🔈 Ton an" : "🔊 Ton aus"; };

// open / closed
(async () => {
  if (DEMO) return;
  const { data } = await sb.from("settings").select("open,message").eq("id", 1).maybeSingle();
  if (data && !data.open) { $("form").style.display = "none"; $("closed").style.display = "block"; if (data.message) $("closedMsg").textContent = data.message; }
})();

const MAX = 10 * 1024 * 1024;
const EXT_TYPES = { mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", flac: "audio/flac" };
let file = null;
$("file").onchange = (e) => {
  file = e.target.files[0] || null;
  if (!file) return;
  $("drop").classList.add("has");
  $("fileText").innerHTML = `<b>${file.name.replace(/[<>&"]/g, "")}</b><br /><small style="color:var(--sub)">${(file.size / 1024 / 1024).toFixed(1)} MB · tippe zum Ändern</small>`;
};

const err = (m) => { $("err").textContent = m || ""; if (m) $("err").scrollIntoView({ block: "center", behavior: "smooth" }); };
const val = (id) => $(id).value.trim();
const setProg = (p) => { $("prog").style.display = "block"; $("prog").firstElementChild.style.width = `${Math.round(p * 100)}%`; };

$("form").onsubmit = async (e) => {
  e.preventDefault(); err("");
  if ($("website").value) return; // bot trap
  const d = { username: val("username"), contact_platform: $("platform").value, contact_handle: val("contact"), tiktok: val("tiktok"), song_title: val("songTitle") || null, lyrics: val("lyrics"), wishes: val("wishes") || null };
  if (!d.username) return err("Bitte gib deinen Benutzernamen ein.");
  if (!d.contact_handle) return err("Bitte gib an, wie ich dich erreichen kann.");
  if (!d.tiktok) return err("Bitte gib deinen TikTok-Benutzernamen ein.");
  if (!file) return err("Bitte lade deinen Song hoch.");
  if (file.size > MAX) return err("Die Datei ist größer als 10 MB. Bitte komprimiere sie (z. B. MP3 mit 192 kbit/s).");
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!(file.type.startsWith("audio/") || EXT_TYPES[ext])) return err("Bitte lade eine Audiodatei hoch (MP3, WAV, M4A …).");
  if (!d.lyrics) return err("Bitte füge deinen Songtext ein.");
  if (!$("crights").checked) return err("Bitte bestätige, dass du den Song verwenden darfst.");
  if (!$("cprivacy").checked) return err("Bitte stimme der Datenschutzerklärung zu.");

  const btn = $("submit"); btn.disabled = true; btn.textContent = "Wird gesendet …"; setProg(0.1);
  try {
    const id = crypto.randomUUID();
    if (DEMO) { await new Promise((r) => setTimeout(r, 900)); setProg(1); return success(7); }
    const path = `uploads/${id}/song.${EXT_TYPES[ext] ? ext : "mp3"}`;
    const up = await sb.storage.from("songs").upload(path, file, { upsert: false, contentType: file.type || EXT_TYPES[ext] || "audio/mpeg" });
    if (up.error) throw new Error(up.error.message);
    setProg(0.75);
    const ins = await sb.from("submissions").insert({ id, ...d, song_path: path, is_16_plus: $("c16").checked, rights_ok: true, privacy_ok: true });
    if (ins.error) throw new Error(ins.error.message);
    setProg(1);
    const pos = await sb.rpc("waitlist_position", { sub_id: id });
    success(pos.data);
  } catch (x) {
    console.error(x);
    err("Das hat leider nicht geklappt. Bitte versuch es gleich nochmal." + (String(x.message || "").includes("mime") ? " (Dateiformat nicht erlaubt)" : ""));
    btn.disabled = false; btn.textContent = "Auf die Warteliste";
  }
};

function success(pos) {
  $("form").style.display = "none"; $("done").style.display = "block";
  if (pos) $("posText").innerHTML = `Du bist auf <b>Platz ${pos}</b>. Ich melde mich bei dir, sobald du an der Reihe bist.`;
  $("done").scrollIntoView({ block: "center", behavior: "smooth" });
}
