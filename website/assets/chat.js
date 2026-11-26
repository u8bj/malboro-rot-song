// Shared chat helpers: bubbles (text / image / voice), composer with image picker and voice recorder.
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const att = (key) => "api/" + key.split("/").map(encodeURIComponent).join("/");
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function bubble(m, mine) {
    const d = new Date(m.created_at);
    const time = `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} · ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
    let inner;
    if (m.kind === "image" && m.attachment_key) inner = `<a class="b img" href="${esc(att(m.attachment_key))}" target="_blank" rel="noopener"><img src="${esc(att(m.attachment_key))}" alt="Bild" loading="lazy" /></a>`;
    else if (m.kind === "audio" && m.attachment_key) inner = `<div class="b voice"><button type="button" class="vplay" data-src="${esc(att(m.attachment_key))}" aria-label="Abspielen">${ic("play")}</button><div class="vbar"><div></div></div><span class="vtime">Sprachnachricht</span></div>`;
    else inner = `<div class="b">${esc(m.body).replace(/\n/g, "<br>")}</div>`;
    return `<div class="msg ${mine ? "me" : "them"}">${inner}<time>${time}</time></div>`;
  }

  // one shared <audio> for voice bubbles
  const player = new Audio(); let curBtn = null;
  const reset = () => { if (curBtn) { curBtn.innerHTML = ic("play"); const bar = curBtn.parentElement.querySelector(".vbar div"); if (bar) bar.style.width = "0%"; curBtn = null; } };
  player.addEventListener("timeupdate", () => { if (!curBtn) return; const wrap = curBtn.parentElement; wrap.querySelector(".vbar div").style.width = `${(player.currentTime / (player.duration || 1)) * 100}%`; if (isFinite(player.duration)) wrap.querySelector(".vtime").textContent = `${mmss(player.currentTime)} / ${mmss(player.duration)}`; });
  player.addEventListener("ended", reset);
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".vplay"); if (!b) return;
    if (curBtn === b) { if (player.paused) { player.play(); b.innerHTML = ic("pause"); } else { player.pause(); b.innerHTML = ic("play"); } return; }
    reset(); curBtn = b; player.src = b.dataset.src; player.play().catch(() => {}); b.innerHTML = ic("pause");
  });

  // downscale photos before upload (fast on mobile data)
  async function shrinkImage(file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || file.size < 400 * 1024) return file;
    try {
      const bmp = await createImageBitmap(file);
      const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
      return blob ? new File([blob], (file.name || "bild").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
    } catch (e) { return file; }
  }

  function pickRecorderType() {
    for (const t of ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]) if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
    return "";
  }

  const nice = (e, what) => { const m = String((e && e.message) || ""); return /schema cache|PGRST|function|fetch|network/i.test(m) ? `${what} konnte gerade nicht gesendet werden. Bitte versuch es später nochmal.` : m || `${what} konnte nicht gesendet werden.`; };

  /** form: the .chat-input form. opts.upload(file, kind) → {key,type}; opts.send({kind, body, key, type}) → bool */
  function mountComposer(form, opts) {
    const ta = form.querySelector("textarea");
    form.insertAdjacentHTML("afterbegin", `<button type="button" class="tool" data-act="img" aria-label="Bild senden">${ic("image")}</button><button type="button" class="tool" data-act="mic" aria-label="Sprachnachricht aufnehmen">${ic("mic")}</button><input type="file" accept="image/*" hidden />`);
    form.insertAdjacentHTML("beforeend", `<div class="rec" hidden><span class="dot"></span><span class="rtime">0:00</span><span class="rlabel">Aufnahme läuft …</span><button type="button" class="tool rcancel" aria-label="Verwerfen">${ic("trash")}</button></div><div class="cstatus" hidden></div>`);
    const fileIn = form.querySelector('input[type=file]'), recBox = form.querySelector(".rec"), status = form.querySelector(".cstatus"), sendBtn = form.querySelector(".send");
    const busy = (txt) => { status.hidden = !txt; status.textContent = txt || ""; };
    ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; });
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && matchMedia("(hover: hover)").matches) { e.preventDefault(); form.requestSubmit(); } });

    form.querySelector('[data-act="img"]').onclick = () => fileIn.click();
    fileIn.onchange = async () => {
      const f = fileIn.files[0]; fileIn.value = ""; if (!f) return;
      if (!f.type.startsWith("image/")) return alert("Bitte wähle ein Bild aus.");
      busy("Bild wird gesendet …");
      try { const small = await shrinkImage(f); if (small.size > 12 * 1024 * 1024) throw new Error("Das Bild ist zu groß (max. 12 MB)."); const up = await opts.upload(small, "image"); await opts.send({ kind: "image", body: "", key: up.key, type: up.type }); }
      catch (e) { alert(nice(e, "Das Bild")); }
      busy("");
    };

    let rec = null, chunks = [], t0 = 0, tick = null, stream = null, cancelled = false;
    const stopUi = () => { clearInterval(tick); recBox.hidden = true; ta.hidden = false; form.classList.remove("recording"); if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
    form.querySelector('[data-act="mic"]').onclick = async () => {
      if (rec) return;
      if (!navigator.mediaDevices || !window.MediaRecorder) return alert("Dein Browser unterstützt keine Sprachaufnahme.");
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return alert("Bitte erlaube den Zugriff aufs Mikrofon."); }
      const type = pickRecorderType(); chunks = []; cancelled = false;
      rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        const mime = (rec.mimeType || type || "audio/webm").split(";")[0]; const r = rec; rec = null; stopUi();
        if (cancelled || !chunks.length) return;
        const blob = new Blob(chunks, { type: mime }); if ((Date.now() - t0) < 700) return;
        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
        busy("Sprachnachricht wird gesendet …");
        try { const up = await opts.upload(new File([blob], `sprachnachricht.${ext}`, { type: mime }), "audio"); await opts.send({ kind: "audio", body: "", key: up.key, type: up.type }); }
        catch (e) { alert(nice(e, "Die Sprachnachricht")); }
        busy("");
      };
      rec.start(250); t0 = Date.now(); ta.hidden = true; recBox.hidden = false; form.classList.add("recording");
      tick = setInterval(() => { const s = (Date.now() - t0) / 1000; recBox.querySelector(".rtime").textContent = mmss(s); if (s >= 120) rec && rec.stop(); }, 250);
    };
    recBox.querySelector(".rcancel").onclick = () => { cancelled = true; if (rec) rec.stop(); };
    form.addEventListener("submit", (e) => { if (rec) { e.preventDefault(); e.stopImmediatePropagation(); rec.stop(); } }, true);

    async function uploadVia(url, headers, file) {
      return new Promise((resolve, reject) => {
        const x = new XMLHttpRequest(); x.open("POST", url);
        Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v)); x.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        x.upload.onprogress = (ev) => { if (ev.lengthComputable) busy(`${status.textContent.split(" (")[0]} (${Math.round((ev.loaded / ev.total) * 100)} %)`); };
        x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} if (x.status === 200 && j.key) resolve(j); else reject(new Error(j.error === "too_large" ? "Die Datei ist zu groß." : j.error === "type" ? "Dieses Dateiformat wird nicht unterstützt." : "Upload fehlgeschlagen.")); };
        x.onerror = () => reject(new Error("Netzwerkfehler beim Hochladen.")); x.send(file);
      });
    }
    return { uploadVia };
  }

  window.VXChat = { bubble, mountComposer, att };
})();
