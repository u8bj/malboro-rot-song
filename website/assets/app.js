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

// example video: silent preview loop, real playback with sound + controls on tap
const vid = $("ex");
const vio = new IntersectionObserver((es) => es.forEach((e) => { if (vid.muted) { if (e.isIntersecting) vid.play().catch(() => {}); else vid.pause(); } }), { threshold: 0.3 });
vio.observe(vid);
$("play").onclick = () => {
  vid.muted = false; vid.volume = 1; vid.loop = false; vid.currentTime = 0; vid.controls = true;
  vid.play().catch(() => { vid.muted = false; });
  // on phones: open the video fullscreen so it is big enough to enjoy
  if (matchMedia("(max-width: 700px)").matches) {
    try { if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen(); else if (vid.requestFullscreen) vid.requestFullscreen().catch(() => {}); } catch (e) {}
  }
  $("play").classList.add("gone"); $("player").classList.add("playing");
};

// scroll reveal
window.__revealReady = true;
const io = !("IntersectionObserver" in window) ? null : new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
// spotlight hover on cards
document.querySelectorAll(".spot").forEach((el) => el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`); }));
// 3D tilt of the example phone (mouse only)
const ph = $("player");
if (matchMedia("(hover: hover)").matches) {
  ph.parentElement.addEventListener("pointermove", (e) => { if (ph.classList.contains("playing")) return; const r = ph.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; ph.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
  ph.parentElement.addEventListener("pointerleave", () => { ph.style.transform = ""; });
}

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
  $("fileText").innerHTML = `<b>${file.name.replace(/[<>&"]/g, "")}</b><br /><small style="color:var(--sub)">${(file.size / 1024 / 1024).toFixed(1)} MB · tippe zum Ändern</small>`; $("dropIc").innerHTML = ic("music");
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

  const btn = $("submit"); btn.disabled = true; btn.firstElementChild.textContent = "Wird gesendet …"; setProg(0.1);
  try {
    const id = crypto.randomUUID();
    if (DEMO) { await new Promise((r) => setTimeout(r, 900)); setProg(1); return success(7, "ABC123"); }
    const path = `uploads/${id}/song.${EXT_TYPES[ext] ? ext : "mp3"}`;
    const up = await sb.storage.from("songs").upload(path, file, { upsert: false, contentType: file.type || EXT_TYPES[ext] || "audio/mpeg" });
    if (up.error) throw new Error(up.error.message);
    setProg(0.75);
    let res = await sb.rpc("submit_entry", { p: { id, ...d, song_path: path } });
    if (res.error && /submit_entry|PGRST202|function/i.test(res.error.message + (res.error.code || ""))) {
      // Fallback, falls das Datenbank-Update (update_portal.sql) noch nicht ausgeführt wurde
      const ins = await sb.from("submissions").insert({ id, ...d, song_path: path });
      if (ins.error) throw new Error(ins.error.message);
      const pos = await sb.rpc("waitlist_position", { sub_id: id });
      res = { data: { position: pos.data } };
    }
    if (res.error) throw new Error(res.error.message);
    if (res.data && res.data.error === "closed") { location.reload(); return; }
    setProg(1);
    success(res.data && res.data.position, res.data && res.data.code);
  } catch (x) {
    console.error(x);
    err("Das hat leider nicht geklappt. Bitte versuch es gleich nochmal." + (String(x.message || "").includes("mime") ? " (Dateiformat nicht erlaubt)" : ""));
    btn.disabled = false; btn.firstElementChild.textContent = "Auf die Warteliste";
  }
};

function success(pos, code) {
  $("form").style.display = "none"; $("done").style.display = "block";
  if (pos) $("posText").innerHTML = `Du bist auf <b>Platz ${pos}</b>. Ich melde mich bei dir, sobald du an der Reihe bist.`;
  if (code) {
    const f = code.slice(0, 3) + "-" + code.slice(3);
    $("codeVal").textContent = f; $("codeBox").hidden = false; $("codeHint").hidden = false; $("toStatus").hidden = false;
    $("toStatus").href = "status.html?code=" + encodeURIComponent(code);
    try { localStorage.setItem("vx_code", code); } catch (e) {}
    $("copyCode").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(f); $("copyCode").lastElementChild.textContent = "Kopiert!"; };
  }
  $("done").scrollIntoView({ block: "center", behavior: "smooth" });
}
