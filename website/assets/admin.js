// Admin-Panel: Login (Supabase Auth), Warteliste verwalten, Songs anhören, Status/Notizen, Löschen, Export, Anmeldung öffnen/schließen.
const CFG = window.APP_CONFIG || {};
const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const STATUS = { neu: "Neu", wartet: "Wartet", in_arbeit: "In Arbeit", fertig: "Fertig", abgelehnt: "Abgelehnt" };
const ACTIVE = ["neu", "wartet", "in_arbeit"];
let sb = null, rows = [], filter = "aktiv", settings = { open: true, message: "" }, unread = {}, chatTimer = null;

if (DEMO) {
  $("demo").hidden = false;
  const now = Date.now();
  const mk = (i, u, st, song) => ({ id: `demo-${i}`, created_at: new Date(now - (9 - i) * 86400000).toISOString(), username: u, contact_platform: ["Instagram", "Snapchat", "TikTok"][i % 3], contact_handle: u.replace("@", ""), tiktok: u, song_title: song, song_path: "", lyrics: "Strophe 1\nZeile eins …\nZeile zwei …\n\nRefrain\n…", wishes: i % 2 ? "Dunkel, viel Lila, Herz-Motiv" : null, is_16_plus: true, rights_ok: true, privacy_ok: true, status: st, notes: i === 1 ? "Song ist sehr ruhig – langsame Kamerafahrten" : null });
  rows = [mk(1, "@lena.music", "in_arbeit", "Nachtlicht"), mk(2, "@beatsbykev", "wartet", "Kein Weg zurück"), mk(3, "@jxnas_", "wartet", "Blau"), mk(4, "@melody.mp3", "neu", "Für immer"), mk(5, "@sam.raps", "neu", null), mk(6, "@ari", "fertig", "Sommer"), mk(7, "@nora.v", "abgelehnt", "Cover")];
  showApp();
} else {
  const { createClient } = window.supabase;
  sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  sb.auth.getSession().then(({ data }) => { if (data.session) showApp(); else $("loginView").hidden = false; });
}

$("loginForm").onsubmit = async (e) => {
  e.preventDefault(); $("loginErr").textContent = "";
  const { error } = await sb.auth.signInWithPassword({ email: $("em").value.trim(), password: $("pw").value });
  if (error) { $("loginErr").textContent = "Anmeldung fehlgeschlagen. E-Mail oder Passwort falsch."; return; }
  $("loginView").hidden = true; showApp();
};
$("logout").onclick = async () => { if (sb) await sb.auth.signOut(); location.reload(); };
$("refresh").onclick = () => load();
$("q").oninput = () => render();

async function showApp() {
  $("appView").hidden = false;
  await load();
  setInterval(() => { if ($("drawer").style.display !== "block") load(true); }, 20000);
}

async function load(silent) {
  if (!DEMO) {
    const r = await sb.from("submissions").select("*").order("created_at", { ascending: true });
    if (r.error) { if (!silent) alert("Laden fehlgeschlagen: " + r.error.message + "\n\nIst deine E-Mail in der Tabelle 'admins' eingetragen?"); return; }
    rows = r.data;
    const s = await sb.from("settings").select("open,message").eq("id", 1).maybeSingle();
    if (s.data) settings = s.data;
    const m = await sb.from("messages").select("submission_id").eq("sender", "user").eq("read_by_admin", false);
    unread = {}; (m.data || []).forEach((x) => { unread[x.submission_id] = (unread[x.submission_id] || 0) + 1; });
  }
  $("open").checked = !!settings.open; $("closedMsg").value = settings.message || ""; $("openLabel").textContent = settings.open ? "Anmeldungen offen" : "Anmeldungen geschlossen";
  render();
}

function positions() { const m = {}; let n = 0; for (const r of rows) if (ACTIVE.includes(r.status)) m[r.id] = ++n; return m; }

function render() {
  const pos = positions(); const c = (st) => rows.filter((r) => r.status === st).length;
  $("stats").innerHTML = [["Gesamt", rows.length], ["Neu", c("neu")], ["Wartet", c("wartet")], ["In Arbeit", c("in_arbeit")], ["Ungelesen", Object.values(unread).reduce((a, b) => a + b, 0)]].map(([l, v]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join("");
  const tabs = [["aktiv", `Offen (${rows.filter((r) => ACTIVE.includes(r.status)).length})`], ...Object.entries(STATUS).map(([k, v]) => [k, `${v} (${c(k)})`]), ["alle", `Alle (${rows.length})`]];
  $("tabs").innerHTML = tabs.map(([k, l]) => `<button data-k="${k}" class="${filter === k ? "on" : ""}">${l}</button>`).join("");
  $("tabs").querySelectorAll("button").forEach((b) => (b.onclick = () => { filter = b.dataset.k; render(); }));
  const q = $("q").value.trim().toLowerCase();
  const list = rows.filter((r) => (filter === "alle" ? true : filter === "aktiv" ? ACTIVE.includes(r.status) : r.status === filter))
    .filter((r) => !q || [r.username, r.tiktok, r.contact_handle, r.song_title].some((x) => String(x || "").toLowerCase().includes(q)));
  $("list").innerHTML = list.length ? list.map((r) => `<div class="item" data-id="${esc(r.id)}">
      <div class="pos">${pos[r.id] ? "#" + pos[r.id] : "–"}</div>
      <div><b>${esc(r.username)}</b>${unread[r.id] ? ` <span class="badge">${unread[r.id]} neu</span>` : ""}${r.video_key ? ` <span class="badge ok">Video</span>` : ""}<div class="muted">${esc(r.song_title || "ohne Titel")}</div></div>
      <div class="hide-m muted">${esc(r.contact_platform)}: ${esc(r.contact_handle)}</div>
      <div class="hide-m muted">${new Date(r.created_at).toLocaleDateString("de-DE")}</div>
      <div><span class="pill st-${esc(r.status)}">${STATUS[r.status] || esc(r.status)}</span></div></div>`).join("") : `<div class="empty">Keine Einträge.</div>`;
  $("list").querySelectorAll(".item").forEach((el) => (el.onclick = () => openDetail(el.dataset.id)));
}

const fmtCode = (c) => (c ? c.slice(0, 3) + "-" + c.slice(3) : "–");
const vidSrc = (key) => "api/v/" + key.split("/").map(encodeURIComponent).join("/");
async function token() { if (DEMO) return ""; const { data } = await sb.auth.getSession(); return data.session ? data.session.access_token : ""; }
function bubbleA(m) { const d = new Date(m.created_at); return `<div class="msg ${m.sender === "admin" ? "me" : "them"}"><div class="b">${esc(m.body).replace(/\n/g, "<br>")}</div><time>${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} · ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</time></div>`; }

async function openDetail(id) {
  const r = rows.find((x) => x.id === id); if (!r) return; const pos = positions()[r.id];
  let audio = "";
  if (!DEMO && r.song_path) { const s = await sb.storage.from("songs").createSignedUrl(r.song_path, 3600); if (s.data) audio = s.data.signedUrl; }
  $("panel").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font-size:30px;margin:0;word-break:break-word">${esc(r.username)}</h2><button class="btn small ghost" id="close" aria-label="Schließen">${ic("x")}</button></div>
    <div class="muted" style="margin-top:4px">${pos ? `Platz #${pos} · ` : ""}eingetragen am ${new Date(r.created_at).toLocaleString("de-DE")}</div>
    <div class="kv">
      <div>Code</div><div><b style="letter-spacing:.12em;font-size:18px">${esc(fmtCode(r.code))}</b> <button class="btn small ghost" id="cpCode" style="padding:6px 10px;margin-left:6px">${ic("copy")}</button></div>
      <div>Kontakt</div><div>${esc(r.contact_platform)}: <b>${esc(r.contact_handle)}</b></div>
      <div>TikTok</div><div>${esc(r.tiktok)}</div>
      <div>Songtitel</div><div>${esc(r.song_title || "–")}</div>
      <div>Wünsche</div><div>${esc(r.wishes || "–")}</div>
    </div>

    <div class="card admin-chat chat">
      <div class="chat-head"><div class="avatar">${esc((r.username || "?").replace("@", "").slice(0, 1).toUpperCase())}</div><div><b>Chat mit ${esc(r.username)}</b><small>Die Person sieht den Chat auf ihrer Status-Seite.</small></div></div>
      <div class="chat-body" id="aChat"><div class="chat-empty" id="aEmpty">Noch keine Nachrichten.</div></div>
      <form class="chat-input" id="aForm"><textarea id="aText" rows="1" maxlength="2000" placeholder="Antwort schreiben …"></textarea><button class="send" type="submit" aria-label="Senden">${ic("arrow")}</button></form>
    </div>

    <div class="card" style="padding:16px;margin:14px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><b>Fertiges Video</b>${r.video_key ? `<span class="badge ok">hochgeladen</span>` : ""}</div>
      ${r.video_key ? `<video controls playsinline preload="metadata" src="${esc(vidSrc(r.video_key))}" style="width:100%;max-height:360px;border-radius:14px;background:#000"></video><div class="muted" style="margin:6px 0 10px">${esc(r.video_name || "")} · ${r.video_at ? new Date(r.video_at).toLocaleString("de-DE") : ""}</div>` : `<p class="muted" style="margin:0 0 10px">Lade hier das fertige Video hoch. Die Person sieht es danach sofort mit ihrem Code.</p>`}
      <label class="drop" id="vDrop"><input id="vFile" type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" /><span class="drop-ic">${ic("upload")}</span><span><b>${r.video_key ? "Neues Video hochladen (ersetzt das alte)" : "Video hochladen"}</b><br /><small class="muted">MP4, MOV oder WEBM · max. 95 MB</small></span></label>
      <div class="progress" id="vProg"><div></div></div><div class="err" id="vErr"></div>
      ${r.video_key ? `<button class="btn small ghost" id="vDel">${ic("trash")}Video entfernen</button>` : ""}
    </div>

    <div class="card" style="padding:16px;margin-bottom:14px">${audio ? `<audio controls src="${esc(audio)}" style="width:100%"></audio><div class="actions"><a class="btn small ghost" href="${esc(audio)}" download>${ic("download")}Song herunterladen</a></div>` : `<span class="muted">${DEMO ? "Im Demo-Modus gibt es keinen Song." : "Kein Song gefunden."}</span>`}</div>
    <div style="display:flex;justify-content:space-between;align-items:center"><b>Lyrics</b><button class="btn small ghost" id="cpLyrics">${ic("copy")}Kopieren</button></div>
    <pre class="lyrics">${esc(r.lyrics)}</pre>
    <div class="field" style="margin-top:16px"><label>Status</label><select id="st">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === r.status ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label>Interne Notizen (sieht nur du)</label><textarea id="nt" style="min-height:90px">${esc(r.notes || "")}</textarea></div>
    <div class="actions">
      <button class="btn small" id="save">${ic("save")}Speichern</button>
      <button class="btn small ghost" id="cpContact">${ic("copy")}Kontakt kopieren</button>
      <button class="btn small danger" id="del" style="margin-left:auto">${ic("trash")}Löschen</button>
    </div>`;
  $("drawer").style.display = "block";
  const close = () => { $("drawer").style.display = "none"; clearInterval(chatTimer); load(true); };
  $("close").onclick = close; $("drawer").onclick = (e) => { if (e.target === $("drawer")) close(); };
  $("cpCode").onclick = () => navigator.clipboard.writeText(fmtCode(r.code));
  $("cpLyrics").onclick = () => navigator.clipboard.writeText(r.lyrics || "");
  $("cpContact").onclick = () => navigator.clipboard.writeText(`${r.contact_platform}: ${r.contact_handle}`);

  // ── chat ──
  let lastId = 0;
  const loadChat = async () => {
    let list = [];
    if (DEMO) list = lastId ? [] : [{ id: 1, created_at: new Date().toISOString(), sender: "user", body: "Hey, wann ist mein Video ungefähr fertig?" }];
    else { const m = await sb.from("messages").select("id,created_at,sender,body").eq("submission_id", r.id).gt("id", lastId).order("id"); list = m.data || []; }
    if (!list.length) return;
    $("aEmpty").hidden = true; const box = $("aChat");
    box.insertAdjacentHTML("beforeend", list.map(bubbleA).join("")); lastId = list[list.length - 1].id; box.scrollTop = box.scrollHeight;
    if (!DEMO && list.some((m) => m.sender === "user")) { await sb.from("messages").update({ read_by_admin: true }).eq("submission_id", r.id).eq("sender", "user").eq("read_by_admin", false); }
    delete unread[r.id];
  };
  await loadChat(); clearInterval(chatTimer); chatTimer = setInterval(() => { if (!document.hidden) loadChat().catch(() => {}); }, 4000);
  const ta = $("aText");
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; });
  ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("aForm").requestSubmit(); } });
  const sendAdmin = async (text) => {
    if (DEMO) { $("aEmpty").hidden = true; $("aChat").insertAdjacentHTML("beforeend", bubbleA({ created_at: new Date().toISOString(), sender: "admin", body: text })); return true; }
    const ins = await sb.from("messages").insert({ submission_id: r.id, sender: "admin", body: text, read_by_admin: true });
    if (ins.error) { alert("Senden fehlgeschlagen: " + ins.error.message); return false; }
    await loadChat(); return true;
  };
  $("aForm").onsubmit = async (e) => { e.preventDefault(); const t = ta.value.trim(); if (!t) return; ta.value = ""; ta.style.height = "auto"; if (!(await sendAdmin(t))) ta.value = t; };

  // ── video upload ──
  $("vFile").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return; $("vErr").textContent = "";
    if (f.size > 95 * 1024 * 1024) { $("vErr").textContent = "Die Datei ist größer als 95 MB. Bitte exportiere sie etwas kleiner (z. B. 1080p, H.264)."; return; }
    if (DEMO) { $("vErr").textContent = "Im Demo-Modus kann nichts hochgeladen werden."; return; }
    const tk = await token(); const prog = $("vProg"); prog.style.display = "block";
    const key = await new Promise((resolve) => {
      const x = new XMLHttpRequest(); x.open("POST", "api/admin/video?name=" + encodeURIComponent(f.name));
      x.setRequestHeader("Authorization", "Bearer " + tk); x.setRequestHeader("Content-Type", f.type || "video/mp4");
      x.upload.onprogress = (ev) => { if (ev.lengthComputable) prog.firstElementChild.style.width = `${Math.round((ev.loaded / ev.total) * 100)}%`; };
      x.onload = () => { try { const j = JSON.parse(x.responseText); resolve(x.status === 200 ? j.key : (j.error || "Fehler " + x.status)); } catch (er) { resolve("Fehler " + x.status); } };
      x.onerror = () => resolve("Netzwerkfehler"); x.send(f);
    });
    if (!key || !key.startsWith("v/")) { $("vErr").textContent = "Upload fehlgeschlagen: " + key; prog.style.display = "none"; return; }
    const old = r.video_key; const patch = { video_key: key, video_name: f.name, video_at: new Date().toISOString(), status: "fertig" };
    const u = await sb.from("submissions").update(patch).eq("id", r.id);
    if (u.error) { $("vErr").textContent = "Speichern fehlgeschlagen: " + u.error.message; return; }
    if (old) fetch("api/admin/video?key=" + encodeURIComponent(old), { method: "DELETE", headers: { Authorization: "Bearer " + tk } });
    Object.assign(r, patch);
    await sendAdmin("Dein Video ist fertig! Du kannst es oben auf deiner Status-Seite ansehen und herunterladen.");
    clearInterval(chatTimer); openDetail(r.id); render();
  };
  if ($("vDel")) $("vDel").onclick = async () => {
    if (!confirm("Video entfernen? Die Person sieht es dann nicht mehr.")) return;
    if (!DEMO) {
      const tk = await token(); await fetch("api/admin/video?key=" + encodeURIComponent(r.video_key), { method: "DELETE", headers: { Authorization: "Bearer " + tk } });
      const u = await sb.from("submissions").update({ video_key: null, video_name: null, video_at: null }).eq("id", r.id); if (u.error) return alert(u.error.message);
    }
    Object.assign(r, { video_key: null, video_name: null, video_at: null }); clearInterval(chatTimer); openDetail(r.id); render();
  };

  $("save").onclick = async () => {
    const patch = { status: $("st").value, notes: $("nt").value.trim() || null };
    if (!DEMO) { const u = await sb.from("submissions").update(patch).eq("id", r.id); if (u.error) return alert("Speichern fehlgeschlagen: " + u.error.message); }
    Object.assign(r, patch); close(); render();
  };
  $("del").onclick = async () => {
    if (!confirm(`Eintrag von ${r.username} inkl. Song, Video und Chat endgültig löschen?`)) return;
    if (!DEMO) {
      if (r.song_path) await sb.storage.from("songs").remove([r.song_path]);
      if (r.video_key) { const tk = await token(); await fetch("api/admin/video?key=" + encodeURIComponent(r.video_key), { method: "DELETE", headers: { Authorization: "Bearer " + tk } }); }
      const d = await sb.from("submissions").delete().eq("id", r.id); if (d.error) return alert("Löschen fehlgeschlagen: " + d.error.message);
    }
    rows = rows.filter((x) => x.id !== r.id); close(); render();
  };
}

$("saveSettings").onclick = async () => {
  const patch = { open: $("open").checked, message: $("closedMsg").value.trim() || null };
  if (!DEMO) { const u = await sb.from("settings").update(patch).eq("id", 1); if (u.error) return alert("Speichern fehlgeschlagen: " + u.error.message); }
  settings = patch; $("openLabel").textContent = patch.open ? "Anmeldungen offen" : "Anmeldungen geschlossen"; alert("Gespeichert.");
};
$("open").onchange = () => { $("openLabel").textContent = $("open").checked ? "Anmeldungen offen (noch speichern)" : "Anmeldungen geschlossen (noch speichern)"; };

$("csv").onclick = () => {
  const pos = positions(); const cols = ["platz", "code", "created_at", "status", "username", "contact_platform", "contact_handle", "tiktok", "song_title", "wishes", "notes", "lyrics"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(";"), ...rows.map((r) => cols.map((c) => q(c === "platz" ? pos[r.id] || "" : r[c])).join(";"))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })); a.download = `warteliste_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
};
