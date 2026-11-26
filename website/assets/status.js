// Status-Seite: Login mit Code → Status, fertiges Video und Chat mit visualx.mp4.
(() => {
  const CFG = window.APP_CONFIG || {};
  const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const sb = DEMO ? null : window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  if (DEMO) $("demo").hidden = false;
  const store = { get: () => { try { return localStorage.getItem("vx_code") || ""; } catch (e) { return ""; } }, set: (v) => { try { localStorage.setItem("vx_code", v); } catch (e) {} }, del: () => { try { localStorage.removeItem("vx_code"); } catch (e) {} } };
  const clean = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const fmt = (c) => (c.length > 3 ? c.slice(0, 3) + "-" + c.slice(3) : c);
  let code = "", lastId = 0, timer = null, ticks = 0;

  $("code").addEventListener("input", (e) => { const v = clean(e.target.value); e.target.value = fmt(v); });
  $("codeForm").onsubmit = (e) => { e.preventDefault(); login(clean($("code").value)); };
  $("logoutBtn").onclick = (e) => { e.preventDefault(); store.del(); location.href = "status.html"; };

  async function rpc(fn, args) {
    if (DEMO) return demo(fn, args);
    const { data, error } = await sb.rpc(fn, args);
    if (error) throw new Error(error.message || "Fehler");
    return data;
  }

  async function login(c) {
    $("codeErr").textContent = "";
    if (c.length !== 6) { $("codeErr").textContent = "Der Code hat 6 Zeichen, z. B. ABC-123."; return; }
    try {
      const s = await rpc("portal_status", { p_code: c });
      if (s.error) { $("codeErr").textContent = "Dieser Code ist unbekannt. Prüfe ihn bitte nochmal."; store.del(); return; }
      code = c; store.set(c);
      $("loginView").hidden = true; $("portal").hidden = false; $("logoutBtn").hidden = false;
      render(s); await loadMessages(); startPolling();
      window.VX_RPC = rpc; window.dispatchEvent(new CustomEvent("vx:login", { detail: { code } }));
    } catch (x) {
      $("codeErr").textContent = String(x.message).includes("too_many") ? "Zu viele falsche Versuche. Bitte warte 15 Minuten." : "Verbindung fehlgeschlagen. Bitte versuch es gleich nochmal.";
    }
  }

  const ORDER = ["neu", "wartet", "in_arbeit", "fertig"];
  function render(s) {
    window.dispatchEvent(new CustomEvent("vx:state", { detail: { status: s.status, video_key: s.video_key, notifiedUnread: 0 } }));
    $("pName").textContent = s.username || "–";
    $("pSong").textContent = s.song_title ? `Song: ${s.song_title}` : "";
    const idx = s.status === "abgelehnt" ? -1 : Math.max(0, ORDER.indexOf(s.status));
    document.querySelectorAll("#stepsLine .st").forEach((el, i) => { el.classList.toggle("past", i < idx || (idx === 3 && i === 3)); el.classList.toggle("now", i === idx && idx !== 3); });
    $("stepsLine").style.setProperty("--p", `${idx < 0 ? 0 : (idx / 3) * 100}%`);
    const pos = $("pPos");
    if (s.status === "abgelehnt") pos.innerHTML = `<b>Leider konnte ich dein Video nicht umsetzen.</b> Schreib mir im Chat, wenn du Fragen hast.`;
    else if (s.status === "fertig") pos.innerHTML = s.video_key ? `Dein Video ist fertig – viel Spaß damit!` : `Dein Video ist fertig. Ich schicke es dir gleich hier rein.`;
    else if (s.status === "in_arbeit") pos.innerHTML = `<b>Ich arbeite gerade an deinem Video.</b> Du bekommst es hier, sobald es fertig ist.`;
    else pos.innerHTML = `Du bist auf <b>Platz ${s.position ?? "–"}</b> der Warteliste. Ich melde mich, sobald du dran bist.`;
    if (s.video_key) {
      const src = `api/v/${s.video_key.split("/").map(encodeURIComponent).join("/")}`;
      if ($("pVideo").dataset.src !== src) { $("pVideo").src = src; $("pVideo").dataset.src = src; }
      $("pDownload").href = src + "?dl=1"; $("videoCard").hidden = false;
    } else $("videoCard").hidden = true;
  }

  const bubble = (m) => VXChat.bubble(m, m.sender === "user");
  async function loadMessages() {
    const r = await rpc("portal_messages", { p_code: code, p_after: lastId });
    if (r.error) return;
    const list = r.messages || [];
    if (!list.length) return;
    $("chatEmpty").hidden = true;
    const body = $("chatBody"); const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 80;
    body.insertAdjacentHTML("beforeend", list.map(bubble).join(""));
    lastId = list[list.length - 1].id;
    if (atBottom || ticks === 0) body.scrollTop = body.scrollHeight;
  }
  function startPolling() {
    clearInterval(timer);
    timer = setInterval(async () => {
      if (document.hidden) return;
      ticks++;
      try { await loadMessages(); if (ticks % 4 === 0) { const s = await rpc("portal_status", { p_code: code }); if (!s.error) render(s); } } catch (e) {}
    }, 4000);
  }

  const ta = $("chatText");
  const comp = VXChat.mountComposer($("chatForm"), {
    upload: async (file, kind) => {
      if (DEMO) throw new Error("Im Demo-Modus können keine Dateien gesendet werden.");
      const t = await rpc("portal_upload_ticket", { p_code: code });
      if (t.error === "rate") throw new Error("Du hast gerade viele Dateien geschickt. Bitte warte kurz.");
      if (t.error) throw new Error("Upload nicht möglich.");
      return comp.uploadVia(`api/upload?kind=${kind}&name=${encodeURIComponent(file.name)}`, { "X-Ticket": t.ticket }, file);
    },
    send: async (m) => { const r = await rpc("portal_send", { p_code: code, p_body: m.body, p_kind: m.kind, p_key: m.key, p_type: m.type }); if (r.error) throw new Error("Senden fehlgeschlagen."); await loadMessages(); $("chatBody").scrollTop = $("chatBody").scrollHeight; },
  });
  $("chatForm").onsubmit = async (e) => {
    e.preventDefault(); const text = ta.value.trim(); if (!text) return;
    ta.value = ""; ta.style.height = "auto"; ta.disabled = true;
    try {
      const r = await rpc("portal_send", { p_code: code, p_body: text });
      if (r.error === "rate") alert("Du hast gerade sehr viele Nachrichten geschickt. Bitte warte kurz.");
      else if (r.error) { alert("Nachricht konnte nicht gesendet werden."); ta.value = text; }
      await loadMessages(); $("chatBody").scrollTop = $("chatBody").scrollHeight;
    } catch (x) { alert("Verbindung fehlgeschlagen."); ta.value = text; }
    ta.disabled = false; ta.focus();
  };

  // auto-login from link (?code=) or saved code
  const fromUrl = clean(new URLSearchParams(location.search).get("code"));
  const saved = fromUrl || store.get();
  if (saved) { $("code").value = fmt(saved); login(saved); }

  // demo data
  let demoMsgs = [{ id: 1, created_at: new Date(Date.now() - 3600e3).toISOString(), sender: "admin", body: "Hey! Danke fürs Eintragen. Ich melde mich hier, sobald ich an deinem Video arbeite." }], demoN = 2;
  function demo(fn, args) {
    if (args.p_code && args.p_code !== "ABC123") return fn === "portal_status" ? { error: "invalid" } : { error: "invalid" };
    if (fn === "portal_status") return { username: "@demo", song_title: "Mein Song", status: "in_arbeit", position: 2, video_key: null, unread: 0 };
    if (fn === "portal_messages") return { messages: demoMsgs.filter((m) => m.id > (args.p_after || 0)) };
    if (fn === "portal_send") { demoMsgs.push({ id: demoN++, created_at: new Date().toISOString(), sender: "user", body: args.p_body }); return { id: demoN }; }
  }
})();
