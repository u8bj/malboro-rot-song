// visualx.mp4 – Warteliste. Serves the static site under /visualx.mp4/ and a small video API backed by R2.
// Static files are injected by gen_worker.py as FILES.
/*FILES*/
const BASE = "/visualx.mp4";
const cache = new Map();
function bytes(p) { let b = cache.get(p); if (!b) { const s = atob(FILES[p][1]); b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); cache.set(p, b); } return b; }
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...SEC } });

function rangeOf(header, size) {
  const m = /bytes=(\d*)-(\d*)/.exec(header || ""); if (!m) return null;
  let start = m[1] === "" ? size - Number(m[2]) : Number(m[1]); let end = m[1] !== "" && m[2] !== "" ? Number(m[2]) : size - 1;
  if (start < 0 || start >= size || end < start) return { bad: true };
  return { start, end: Math.min(end, size - 1) };
}

async function isAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/is_admin`, { method: "POST", headers: { apikey: env.SUPABASE_ANON, Authorization: auth, "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) return false;
  return (await r.json()) === true;
}

function rid() { const a = new Uint8Array(20); crypto.getRandomValues(a); return [...a].map((x) => x.toString(16).padStart(2, "0")).join(""); }


const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const AUD_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/aac", "audio/x-m4a", "audio/m4a"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
async function hmacHex(secret, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function ticketSid(ticket, env) {
  const [sid, exp, sig] = String(ticket || "").split(".");
  if (!UUID_RE.test(sid || "") || !/^\d+$/.test(exp || "") || !sig || Number(exp) < Date.now() / 1000) return null;
  const good = await hmacHex(env.TICKET_SECRET || "", `${sid}.${exp}`);
  if (good.length !== sig.length) return null;
  let diff = 0; for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? sid : null;
}
async function serveR2(request, env, key, url, fallbackType) {
  const head = await env.VIDEOS.head(key); if (!head) return json({ error: "not_found" }, 404);
  const size = head.size; const rg = rangeOf(request.headers.get("Range"), size);
  if (rg && rg.bad) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  const obj = rg ? await env.VIDEOS.get(key, { range: { offset: rg.start, length: rg.end - rg.start + 1 } }) : await env.VIDEOS.get(key);
  const name = key.split("/").pop();
  const h = { "Content-Type": head.httpMetadata?.contentType || fallbackType, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400", ...SEC,
    "Content-Disposition": `${url.searchParams.get("dl") ? "attachment" : "inline"}; filename="${name.replace(/"/g, "")}"` };
  if (rg) return new Response(request.method === "HEAD" ? null : obj.body, { status: 206, headers: { ...h, "Content-Range": `bytes ${rg.start}-${rg.end}/${size}`, "Content-Length": String(rg.end - rg.start + 1) } });
  return new Response(request.method === "HEAD" ? null : obj.body, { headers: { ...h, "Content-Length": String(size) } });
}

async function api(request, env, path, url) {
  // GET /api/v/<key>  → stream a finished video (key is an unguessable capability, handed out only with a valid code)
  if (path.startsWith("/api/v/") && (request.method === "GET" || request.method === "HEAD")) {
    const key = decodeURIComponent(path.slice("/api/v/".length));
    if (!/^v\/[a-f0-9]{40}\/[\w.\- ]{1,120}$/.test(key)) return json({ error: "not_found" }, 404);
    const head = await env.VIDEOS.head(key); if (!head) return json({ error: "not_found" }, 404);
    const size = head.size; const rg = rangeOf(request.headers.get("Range"), size);
    if (rg && rg.bad) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const obj = rg ? await env.VIDEOS.get(key, { range: { offset: rg.start, length: rg.end - rg.start + 1 } }) : await env.VIDEOS.get(key);
    const name = key.split("/").pop();
    const h = { "Content-Type": head.httpMetadata?.contentType || "video/mp4", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600", ...SEC,
      "Content-Disposition": `${url.searchParams.get("dl") ? "attachment" : "inline"}; filename="${name.replace(/"/g, "")}"` };
    if (rg) return new Response(request.method === "HEAD" ? null : obj.body, { status: 206, headers: { ...h, "Content-Range": `bytes ${rg.start}-${rg.end}/${size}`, "Content-Length": String(rg.end - rg.start + 1) } });
    return new Response(request.method === "HEAD" ? null : obj.body, { headers: { ...h, "Content-Length": String(size) } });
  }
  // GET /api/a/<key> → chat attachment (unguessable capability URL)
  if (path.startsWith("/api/a/") && (request.method === "GET" || request.method === "HEAD")) {
    const key = decodeURIComponent(path.slice("/api/".length));
    if (!/^a\/[0-9a-f-]{36}\/[a-f0-9]{40}\/[\w.\- ]{1,120}$/.test(key)) return json({ error: "not_found" }, 404);
    return serveR2(request, env, key, url, "application/octet-stream");
  }
  // POST /api/upload?kind=image|audio&name=…  (user: X-Ticket header · admin: Authorization + X-Sid)
  if (path === "/api/upload" && request.method === "POST") {
    let sid = await ticketSid(request.headers.get("X-Ticket"), env);
    if (!sid && request.headers.get("Authorization")) { const s2 = request.headers.get("X-Sid") || ""; if (UUID_RE.test(s2) && (await isAdmin(request, env))) sid = s2; }
    if (!sid) return json({ error: "forbidden" }, 403);
    const kind = url.searchParams.get("kind"); const type = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    const len = Number(request.headers.get("Content-Length") || 0);
    if (kind === "image" ? !IMG_TYPES.includes(type) : kind === "audio" ? !AUD_TYPES.includes(type) : true) return json({ error: "type" }, 415);
    if (!len) return json({ error: "empty" }, 400);
    if (len > (kind === "image" ? 12 : 15) * 1024 * 1024) return json({ error: "too_large" }, 413);
    const raw = (url.searchParams.get("name") || (kind === "image" ? "bild.jpg" : "sprachnachricht.m4a")).replace(/[^\w.\- ]/g, "_").slice(-80) || "datei";
    const key = `a/${sid}/${rid()}/${raw}`;
    await env.VIDEOS.put(key, request.body, { httpMetadata: { contentType: request.headers.get("Content-Type") || type } });
    return json({ key, type: request.headers.get("Content-Type") || type });
  }
  // DELETE /api/admin/purge?sid=<uuid>  (admin) → remove all chat attachments of an entry
  if (path === "/api/admin/purge" && request.method === "DELETE") {
    if (!(await isAdmin(request, env))) return json({ error: "forbidden" }, 403);
    const sid = url.searchParams.get("sid") || ""; if (!UUID_RE.test(sid)) return json({ error: "bad_sid" }, 400);
    let cursor, n = 0;
    do { const l = await env.VIDEOS.list({ prefix: `a/${sid}/`, cursor }); const keys = l.objects.map((o) => o.key); if (keys.length) { await env.VIDEOS.delete(keys); n += keys.length; } cursor = l.truncated ? l.cursor : undefined; } while (cursor);
    return json({ ok: true, deleted: n });
  }
  // POST /api/admin/video?name=<file>  (admin only) → store upload in R2, return key
  if (path === "/api/admin/video" && request.method === "POST") {
    if (!(await isAdmin(request, env))) return json({ error: "forbidden" }, 403);
    const len = Number(request.headers.get("Content-Length") || 0);
    if (!len) return json({ error: "empty" }, 400);
    if (len > 95 * 1024 * 1024) return json({ error: "too_large" }, 413);
    const raw = (url.searchParams.get("name") || "video.mp4").replace(/[^\w.\- ]/g, "_").slice(-100) || "video.mp4";
    const key = `v/${rid()}/${raw}`;
    await env.VIDEOS.put(key, request.body, { httpMetadata: { contentType: request.headers.get("Content-Type") || "video/mp4" } });
    return json({ key });
  }
  // DELETE /api/admin/video?key=<key>  (admin only)
  if (path === "/api/admin/video" && request.method === "DELETE") {
    if (!(await isAdmin(request, env))) return json({ error: "forbidden" }, 403);
    const key = url.searchParams.get("key") || "";
    if (!/^v\/[a-f0-9]{40}\//.test(key)) return json({ error: "bad_key" }, 400);
    await env.VIDEOS.delete(key);
    return json({ ok: true });
  }
  return json({ error: "not_found" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let p = decodeURIComponent(url.pathname);
    if (p === BASE) return Response.redirect(url.origin + BASE + "/" + url.search, 301);
    if (!p.startsWith(BASE + "/")) return new Response("Nicht gefunden", { status: 404 });
    const sub = p.slice(BASE.length);
    if (sub.startsWith("/api/")) {
      try { return await api(request, env, sub, url); } catch (e) { return json({ error: "server", detail: String(e && e.message || e) }, 500); }
    }
    if (p.endsWith("/")) p += "index.html";
    if (!FILES[p] && FILES[p + ".html"]) p += ".html";
    if (!FILES[p] || !["GET", "HEAD"].includes(request.method)) return new Response("Nicht gefunden", { status: 404 });
    const [type] = FILES[p]; const body = bytes(p); const size = body.length;
    const h = { "Content-Type": type, "Accept-Ranges": "bytes", ...SEC, "Cache-Control": type.startsWith("text/html") || p.endsWith("/config.js") ? "no-cache" : "public, max-age=86400" };
    if (p.endsWith("/admin.html")) h["X-Robots-Tag"] = "noindex, nofollow";
    const rg = rangeOf(request.headers.get("Range"), size);
    if (rg && rg.bad) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    if (rg) return new Response(request.method === "HEAD" ? null : body.slice(rg.start, rg.end + 1), { status: 206, headers: { ...h, "Content-Range": `bytes ${rg.start}-${rg.end}/${size}`, "Content-Length": String(rg.end - rg.start + 1) } });
    return new Response(request.method === "HEAD" ? null : body, { headers: { ...h, "Content-Length": String(size) } });
  },
};
