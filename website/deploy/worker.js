// Serves the waitlist site under u8bj.xyz/visualx.mp4/ (static assets). Everything else on u8bj.xyz stays with the other workers.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/visualx.mp4") { url.pathname = "/visualx.mp4/"; return Response.redirect(url.toString(), 301); }
    if (!url.pathname.startsWith("/visualx.mp4/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
