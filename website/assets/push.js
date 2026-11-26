// Push-Mitteilungen auf der Status-Seite: aktivieren / deaktivieren, iPhone-Anleitung, Zustand an den Service Worker geben.
(() => {
  const card = document.getElementById("notifyCard");
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  let code = "", reg = null, lastState = {};

  const b64ToU8 = (b) => { const p = "=".repeat((4 - (b.length % 4)) % 4); const raw = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); };
  const post = (state) => { const t = reg && (reg.active || reg.waiting || reg.installing); if (t) t.postMessage({ type: "state", state }); };

  async function ensureReg() {
    if (!supported) return null;
    if (!reg) { reg = await navigator.serviceWorker.register("sw.js", { scope: "./" }); await navigator.serviceWorker.ready; reg = await navigator.serviceWorker.getRegistration("./") || reg; }
    return reg;
  }

  function view(html) { card.innerHTML = html; card.hidden = false; }
  async function render() {
    if (!supported) {
      if (isIOS && !standalone) return view(`
        <div class="nc-head"><span class="nc-ic">${ic("sparkles")}</span><div><b>Mitteilungen aufs iPhone</b><small>Bekomme eine Mitteilung, wenn ich dir schreibe oder dein Video fertig ist.</small></div></div>
        <ol class="nc-steps">
          <li>Tippe unten in Safari auf <b>Teilen</b> <span class="kbd"><svg class="ic" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg></span></li>
          <li>Wähle <b>„Zum Home-Bildschirm“</b></li>
          <li>Öffne <b>visualx.mp4</b> vom Home-Bildschirm, gib deinen Code ein und tippe hier auf <b>„Mitteilungen aktivieren“</b></li>
        </ol>`);
      card.hidden = true; return;
    }
    const perm = Notification.permission;
    const r = await ensureReg().catch(() => null);
    const sub = r ? await r.pushManager.getSubscription() : null;
    if (perm === "denied") return view(`<div class="nc-head"><span class="nc-ic off">${ic("alert")}</span><div><b>Mitteilungen sind blockiert</b><small>Erlaube Mitteilungen für diese Seite in den Einstellungen deines Handys bzw. Browsers.</small></div></div>`);
    if (sub && perm === "granted") {
      view(`<div class="nc-head"><span class="nc-ic on">${ic("check")}</span><div><b>Mitteilungen sind an</b><small>Du bekommst eine Mitteilung, wenn ich schreibe oder dein Video fertig ist.</small></div><button class="btn small ghost" id="ncOff">Aus</button></div>`);
      document.getElementById("ncOff").onclick = async () => { try { await window.VX_RPC("portal_push_unsubscribe", { p_code: code, p_endpoint: sub.endpoint }); } catch (e) {} await sub.unsubscribe(); render(); };
      return;
    }
    view(`<div class="nc-head"><span class="nc-ic">${ic("sparkles")}</span><div><b>Nichts verpassen</b><small>Bekomme eine Mitteilung aufs Handy, wenn ich dir schreibe oder dein Video fertig ist.</small></div></div>
      <button class="btn glow" id="ncOn" style="width:100%;margin-top:14px"><span>Mitteilungen aktivieren</span>${ic("arrow")}</button><div class="err" id="ncErr"></div>`);
    document.getElementById("ncOn").onclick = enable;
  }

  async function enable() {
    const err = document.getElementById("ncErr"); err.textContent = "";
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { render(); return; }
      const r = await ensureReg();
      const { key } = await (await fetch("api/vapid")).json();
      let sub = await r.pushManager.getSubscription();
      if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(key) });
      const res = await window.VX_RPC("portal_push_subscribe", { p_code: code, p_endpoint: sub.endpoint });
      if (res && res.error) throw new Error(res.error);
      post({ code, ...lastState });
      render();
    } catch (e) { err.textContent = "Das hat leider nicht geklappt. Bitte versuch es nochmal."; console.error(e); }
  }

  window.addEventListener("vx:login", async (e) => { code = e.detail.code; await ensureReg().catch(() => {}); post({ code, ...lastState }); render(); });
  window.addEventListener("vx:state", (e) => { lastState = e.detail; if (code) post({ code, ...lastState }); });
})();
