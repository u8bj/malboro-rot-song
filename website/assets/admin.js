// Admin-Panel: Login (Supabase Auth), Warteliste verwalten, Songs anhören, Status/Notizen, Löschen, Export, Anmeldung öffnen/schließen.
const CFG = window.APP_CONFIG || {};
const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const STATUS = { neu: "Neu", wartet: "Wartet", in_arbeit: "In Arbeit", fertig: "Fertig", abgelehnt: "Abgelehnt" };
const ACTIVE = ["neu", "wartet", "in_arbeit"];
let sb = null, rows = [], filter = "aktiv", settings = { open: true, message: "" };

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
  setInterval(() => { if ($("drawer").style.display !== "block") load(true); }, 60000);
}

async function load(silent) {
  if (!DEMO) {
    const r = await sb.from("submissions").select("*").order("created_at", { ascending: true });
    if (r.error) { if (!silent) alert("Laden fehlgeschlagen: " + r.error.message + "\n\nIst deine E-Mail in der Tabelle 'admins' eingetragen?"); return; }
    rows = r.data;
    const s = await sb.from("settings").select("open,message").eq("id", 1).maybeSingle();
    if (s.data) settings = s.data;
  }
  $("open").checked = !!settings.open; $("closedMsg").value = settings.message || ""; $("openLabel").textContent = settings.open ? "Anmeldungen offen" : "Anmeldungen geschlossen";
  render();
}

function positions() { const m = {}; let n = 0; for (const r of rows) if (ACTIVE.includes(r.status)) m[r.id] = ++n; return m; }

function render() {
  const pos = positions(); const c = (st) => rows.filter((r) => r.status === st).length;
  $("stats").innerHTML = [["Gesamt", rows.length], ["Neu", c("neu")], ["Wartet", c("wartet")], ["In Arbeit", c("in_arbeit")], ["Fertig", c("fertig")]].map(([l, v]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join("");
  const tabs = [["aktiv", `Offen (${rows.filter((r) => ACTIVE.includes(r.status)).length})`], ...Object.entries(STATUS).map(([k, v]) => [k, `${v} (${c(k)})`]), ["alle", `Alle (${rows.length})`]];
  $("tabs").innerHTML = tabs.map(([k, l]) => `<button data-k="${k}" class="${filter === k ? "on" : ""}">${l}</button>`).join("");
  $("tabs").querySelectorAll("button").forEach((b) => (b.onclick = () => { filter = b.dataset.k; render(); }));
  const q = $("q").value.trim().toLowerCase();
  const list = rows.filter((r) => (filter === "alle" ? true : filter === "aktiv" ? ACTIVE.includes(r.status) : r.status === filter))
    .filter((r) => !q || [r.username, r.tiktok, r.contact_handle, r.song_title].some((x) => String(x || "").toLowerCase().includes(q)));
  $("list").innerHTML = list.length ? list.map((r) => `<div class="item" data-id="${esc(r.id)}">
      <div class="pos">${pos[r.id] ? "#" + pos[r.id] : "–"}</div>
      <div><b>${esc(r.username)}</b><div class="muted">${esc(r.song_title || "ohne Titel")}</div></div>
      <div class="hide-m muted">${esc(r.contact_platform)}: ${esc(r.contact_handle)}</div>
      <div class="hide-m muted">${new Date(r.created_at).toLocaleDateString("de-DE")}</div>
      <div><span class="pill st-${esc(r.status)}">${STATUS[r.status] || esc(r.status)}</span></div></div>`).join("") : `<div class="empty">Keine Einträge.</div>`;
  $("list").querySelectorAll(".item").forEach((el) => (el.onclick = () => openDetail(el.dataset.id)));
}

async function openDetail(id) {
  const r = rows.find((x) => x.id === id); if (!r) return; const pos = positions()[r.id];
  let audio = "";
  if (!DEMO && r.song_path) { const s = await sb.storage.from("songs").createSignedUrl(r.song_path, 3600); if (s.data) audio = s.data.signedUrl; }
  $("panel").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font-size:30px;margin:0">${esc(r.username)}</h2><button class="btn small ghost" id="close" aria-label="Schließen">${ic("x")}</button></div>
    <div class="muted" style="margin-top:4px">${pos ? `Platz #${pos} · ` : ""}eingetragen am ${new Date(r.created_at).toLocaleString("de-DE")}</div>
    <div class="kv">
      <div>Kontakt</div><div>${esc(r.contact_platform)}: <b>${esc(r.contact_handle)}</b></div>
      <div>TikTok</div><div>${esc(r.tiktok)}</div>
      <div>Songtitel</div><div>${esc(r.song_title || "–")}</div>
      <div>16+ / Eltern ok</div><div>${r.is_16_plus ? "Ja" : `<b style='color:var(--red);display:inline-flex;align-items:center;gap:6px'>${ic("alert")}Nein / nicht bestätigt</b>`}</div>
      <div>Rechte am Song</div><div>${r.rights_ok ? "bestätigt" : "–"}</div>
      <div>Wünsche</div><div>${esc(r.wishes || "–")}</div>
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
  const close = () => { $("drawer").style.display = "none"; };
  $("close").onclick = close; $("drawer").onclick = (e) => { if (e.target === $("drawer")) close(); };
  $("cpLyrics").onclick = () => navigator.clipboard.writeText(r.lyrics || "");
  $("cpContact").onclick = () => navigator.clipboard.writeText(`${r.contact_platform}: ${r.contact_handle}`);
  $("save").onclick = async () => {
    const patch = { status: $("st").value, notes: $("nt").value.trim() || null };
    if (!DEMO) { const u = await sb.from("submissions").update(patch).eq("id", r.id); if (u.error) return alert("Speichern fehlgeschlagen: " + u.error.message); }
    Object.assign(r, patch); close(); render();
  };
  $("del").onclick = async () => {
    if (!confirm(`Eintrag von ${r.username} inkl. Song endgültig löschen?`)) return;
    if (!DEMO) {
      if (r.song_path) await sb.storage.from("songs").remove([r.song_path]);
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
  const pos = positions(); const cols = ["platz", "created_at", "status", "username", "contact_platform", "contact_handle", "tiktok", "song_title", "is_16_plus", "wishes", "notes", "lyrics"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(";"), ...rows.map((r) => cols.map((c) => q(c === "platz" ? pos[r.id] || "" : r[c])).join(";"))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })); a.download = `warteliste_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
};
