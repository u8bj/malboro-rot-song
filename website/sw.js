// visualx.mp4 Service Worker: zeigt Push-Mitteilungen an (Nachricht, Video fertig, Status-Update).
self.window = self;
try { importScripts("config.js"); } catch (e) {}
const CFG = self.APP_CONFIG || {};
const STATE_URL = new URL("__vx_state", self.registration.scope).href;
async function getState() { try { const c = await caches.open("vx"); const r = await c.match(STATE_URL); return r ? await r.json() : {}; } catch (e) { return {}; } }
async function setState(s) { const c = await caches.open("vx"); await c.put(STATE_URL, new Response(JSON.stringify(s), { headers: { "Content-Type": "application/json" } })); }

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("message", (e) => { if (e.data && e.data.type === "state") e.waitUntil(getState().then((s) => setState({ ...s, ...e.data.state }))); });

const STATUS_TEXT = { neu: "Deine Anfrage ist eingegangen.", wartet: "Du bist jetzt auf der Warteliste.", in_arbeit: "Ich arbeite jetzt an deinem Video!", fertig: "Dein Video ist fertig!", abgelehnt: "Es gibt ein Update zu deiner Anfrage." };

self.addEventListener("push", (e) => e.waitUntil((async () => {
  const st = await getState();
  let title = "visualx.mp4", body = "Es gibt Neuigkeiten zu deinem Musikvideo.";
  try {
    if (st.code && CFG.SUPABASE_URL) {
      const r = await fetch(CFG.SUPABASE_URL + "/rest/v1/rpc/portal_status", { method: "POST", headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_code: st.code }) });
      const s = await r.json();
      if (s && !s.error) {
        const unread = s.unread || 0;
        if (s.video_key && s.video_key !== st.video_key) { title = "Dein Video ist fertig!"; body = "Tippe hier, um es anzusehen und herunterzuladen."; }
        else if (unread > 0 && unread !== st.notifiedUnread) { title = "Neue Nachricht von visualx.mp4"; body = unread === 1 ? "Du hast eine neue Nachricht." : `Du hast ${unread} neue Nachrichten.`; }
        else if (s.status && s.status !== st.status) { title = "Status-Update"; body = STATUS_TEXT[s.status] || body; }
        await setState({ ...st, status: s.status, video_key: s.video_key, notifiedUnread: unread });
      }
    }
  } catch (err) {}
  await self.registration.showNotification(title, { body, icon: "assets/app/icon-192.png", badge: "assets/app/badge-96.png", tag: "vx-update", renotify: true, data: { url: "status.html" } });
})()));

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const url = new URL("status.html", self.registration.scope).href;
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of wins) if (c.url.startsWith(self.registration.scope)) { await c.focus(); if (c.navigate) await c.navigate(url); return; }
    await self.clients.openWindow(url);
  })());
});
