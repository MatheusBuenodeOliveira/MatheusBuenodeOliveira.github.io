(() => {
  "use strict";

  const S = window.SITE;
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement, body = document.body;
  const params = new URLSearchParams(location.search);
  const snapshot = params.has("snapshot"); // still frame for the social preview image
  const reduceMotion = snapshot || matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ───────── i18n ─────────
  let lang = params.get("lang") || localStorage.getItem("lang") || "en";
  if (!["en", "pt"].includes(lang)) lang = "en";
  const tr = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] ?? o.en ?? "");
  const ui = (k) => tr(S.ui[k]);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ───────── Graph ─────────
  const N = {};
  const tracks = S.tracks.map((t, ti) => ({ ...t, ti }));
  const trackOf = (n) => tracks.find((t) => t.id === n.track);
  N.hello = { id: "hello", ...S.neurons.hello, track: "core", color: S.coreColor };
  N.contact = { id: "contact", ...S.neurons.contact, track: "core", color: S.coreColor };
  tracks.forEach((t) => t.order.forEach((id, k) => (N[id] = { id, ...S.neurons[id], track: t.id, ti: t.ti, step: k, color: t.color })));
  const nodes = Object.values(N);
  nodes.forEach((n) => (n.adj = []));

  const edges = [];
  const addEdge = (a, b, w, kind, reason) => {
    const e = { a: N[a], b: N[b], w, kind, reason, bend: kind === "link" ? (edges.length % 2 ? 1 : -1) : 0 };
    if (!e.a || !e.b) throw new Error(`bad edge ${a}-${b}`);
    edges.push(e); e.a.adj.push(e); e.b.adj.push(e);
  };
  tracks.forEach((t) => {
    addEdge("hello", t.order[0], 1, "start");
    t.order.slice(1).forEach((id, k) => addEdge(t.order[k], id, 1, "path"));
    addEdge(t.order[t.order.length - 1], "contact", 1, "end");
  });
  S.links.forEach(([a, b, w, r]) => addEdge(a, b, w, "link", r));
  const edgeBetween = (a, b) => a.adj.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));

  let visited;
  try { visited = new Set(JSON.parse(sessionStorage.getItem("visited") || "[]")); } catch { visited = new Set(); }
  const saveVisited = () => { try { sessionStorage.setItem("visited", JSON.stringify([...visited])); } catch {} };

  // ───────── Layout ─────────
  const sky = $("#sky"), ctx = sky.getContext("2d");
  let vw = 0, vh = 0, dpr = 1, mobile = false, D = 600, DH = 600, orbR = 300, oR = 14;
  const maxLen = Math.max(...tracks.map((t) => t.order.length));

  function layout() {
    vw = innerWidth; vh = innerHeight; mobile = vw <= 760;
    dpr = Math.min(devicePixelRatio || 1, 2);
    sky.width = Math.round(vw * dpr); sky.height = Math.round(vh * dpr);
    sky.style.width = vw + "px"; sky.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!mobile) { D = Math.round(Math.min(vh * 0.72, vw * 0.48, 680)); DH = D; }
    else { D = Math.round(Math.min(vw * 0.86, 420)); DH = Math.round(Math.min(vh * 0.58, D * 1.75)); }
    orbR = D / 2;
    root.style.setProperty("--D", D + "px");
    root.style.setProperty("--DH", DH + "px");

    // world layout: in close-up, neighbours sit just outside the viewport
    const dx = Math.max(vw / 2 + D / 2 + (mobile ? 40 : 90), D * 1.4);
    const dy = Math.max(vh / 2 + DH / 2 + 50, DH * 1.2);
    const place = (col, row) => (mobile ? [(row - 1) * dx, col * dy] : [col * dx, (row - 1) * dy]);
    [N.hello.wx, N.hello.wy] = place(0, 1);
    [N.contact.wx, N.contact.wy] = place(maxLen + 1, 1);
    tracks.forEach((t) => t.order.forEach((id, k) => ([N[id].wx, N[id].wy] = place(k + 1, t.ti))));

    // overview layout (screen space): tracks as rows on desktop, columns on mobile
    if (!mobile) {
      const padX = Math.max(110, vw * 0.08), top = 120, bottom = 175;
      const colW = (vw - 2 * padX) / (maxLen + 1), rowH = (vh - top - bottom) / 2;
      const at = (col, row) => [padX + col * colW, top + row * rowH];
      [N.hello.ox, N.hello.oy] = at(0, 1);
      [N.contact.ox, N.contact.oy] = at(maxLen + 1, 1);
      tracks.forEach((t) => t.order.forEach((id, k) => ([N[id].ox, N[id].oy] = at(k + 1, t.ti))));
      oR = Math.max(9, Math.min(18, Math.min(colW, rowH) * 0.1));
    } else {
      const padX = vw * 0.18, top = 118, bottom = 120;
      const colW = (vw - 2 * padX) / 2, rowH = (vh - top - bottom) / (maxLen + 1);
      const at = (row, col) => [padX + col * colW, top + row * rowH];
      [N.hello.ox, N.hello.oy] = at(0, 1);
      [N.contact.ox, N.contact.oy] = at(maxLen + 1, 1);
      tracks.forEach((t) => t.order.forEach((id, k) => ([N[id].ox, N[id].oy] = at(k + 1, t.ti))));
      oR = Math.max(8, Math.min(12, rowH * 0.13));
    }
    buildStars();
    placeAtlas();
    drawMini();
  }

  // ───────── Camera ─────────
  const cam = { x: 0, y: 0, z: 0.3 };
  let m = 1; // 0 = world (close-up), 1 = overview layout
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const proj = (wx, wy) => [(wx - cam.x) * cam.z + vw / 2, (wy - cam.y) * cam.z + vh / 2];
  function pos(n) {
    if (m >= 1) return [n.ox, n.oy];
    const [sx, sy] = proj(n.wx, n.wy);
    return m <= 0 ? [sx, sy] : [lerp(sx, n.ox, m), lerp(sy, n.oy, m)];
  }
  const rad = (n) => lerp(orbR * cam.z, oR * (n.track === "core" ? 1.25 : 1), m);

  // cubic curve between two points, flowing along the main axis
  function curve(P, Q, bend) {
    const [x0, y0] = P, [x3, y3] = Q;
    const dx = x3 - x0, dy = y3 - y0, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, b = bend * len * 0.12;
    if (!mobile) return [x0, y0, x0 + dx * 0.5 + nx * b, y0 + ny * b, x3 - dx * 0.5 + nx * b, y3 + ny * b, x3, y3];
    return [x0, y0, x0 + nx * b, y0 + dy * 0.5 + ny * b, x3 + nx * b, y3 - dy * 0.5 + ny * b, x3, y3];
  }
  const bez = (p, t) => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
  };

  // ───────── Tweens ─────────
  let tween = null;
  function animate(dur, update, done) {
    if (reduceMotion || dur <= 0) { update(1); done && done(); return; }
    tween = { t0: performance.now(), dur, update, done };
  }
  function stepTween(now) {
    if (!tween) return;
    const k = Math.min(1, (now - tween.t0) / tween.dur);
    tween.update(k);
    if (k >= 1) { const d = tween.done; tween = null; d && d(); }
  }

  // ───────── Modes & navigation ─────────
  let mode = "intro", current = null, hoverId = null, flyColor = S.coreColor;
  const trailPts = [];
  function setMode(mo) {
    mode = mo;
    body.className = "mode-" + mo;
    $("#netBtn").classList.toggle("on", mo === "overview");
    if (mo === "overview") { updateReturn(); placeAtlas(); }
  }

  function go(id, push = true) {
    if (!N[id]) return;
    if (mode === "overview" || mode === "intro") return dive(id, push);
    if (mode !== "focus" || id === current) return;
    const from = N[current], to = N[id];
    const e = edgeBetween(from, to);
    let path;
    if (e) {
      const p = curve([e.a.wx, e.a.wy], [e.b.wx, e.b.wy], e.bend);
      path = e.a === from ? p : [p[6], p[7], p[4], p[5], p[2], p[3], p[0], p[1]];
    } else path = curve([from.wx, from.wy], [to.wx, to.wy], 0);
    const dist = Math.hypot(to.wx - from.wx, to.wy - from.wy);
    const dip = Math.min(0.72, 0.3 + dist / (D * 9));
    setMode("fly"); clearSynapses(); trailPts.length = 0;
    flyColor = to.color;
    animate(Math.min(1700, 850 + dist * 0.12), (k) => {
      const t = ease(k);
      [cam.x, cam.y] = bez(path, t);
      cam.z = 1 - dip * Math.sin(Math.PI * t);
      trailPts.push([cam.x, cam.y]); if (trailPts.length > 18) trailPts.shift();
    }, () => arrive(id, push));
  }

  // from the overview, zoom into a neuron
  function dive(id, push = true) {
    const to = N[id];
    setMode("morph"); clearSynapses();
    cam.x = to.wx; cam.y = to.wy;
    animate(1100, (k) => { const t = ease(k); m = 1 - t; cam.z = lerp(0.3, 1, t); }, () => arrive(id, push));
  }

  function toOverview(push = true) {
    if (mode !== "focus") return;
    setMode("morph"); clearSynapses(); hoverId = null;
    const z0 = cam.z;
    animate(900, (k) => { const t = ease(k); m = t; cam.z = lerp(z0, 0.3, t); }, () => {
      setMode("overview");
      if (push) history.pushState(null, "", "#network");
      const h = N[current] && N[current].atlasEl; h && h.focus({ preventScroll: true });
    });
  }

  function arrive(id, push) {
    current = id; m = 0;
    cam.x = N[id].wx; cam.y = N[id].wy; cam.z = 1;
    visited.add(id); saveVisited();
    renderSoma(); setMode("focus"); renderSynapses(); renderTrail(); drawMini();
    if (push) history.pushState(null, "", "#" + id);
    else if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    const h = $("#somaInner h2"); h && h.focus({ preventScroll: true });
  }

  addEventListener("popstate", () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === "network") { toOverview(false); return; }
    go(N[h] ? h : "hello", false);
  });

  // ───────── The neuron content ─────────
  function renderSoma() {
    const n = N[current], t = trackOf(n);
    root.style.setProperty("--tc", n.color);
    let k;
    if (t) {
      const idx = String(n.step + 1).padStart(2, "0"), len = String(t.order.length).padStart(2, "0");
      k = `<span>${esc(tr(t.label))}</span><span class="idx">${idx} / ${len}</span>${n.current ? `<span class="badge">${esc(ui("now"))}</span>` : ""}`;
    } else k = `<span>${esc(tr(n.kicker))}</span>`;

    $("#somaInner").innerHTML = [
      `<p class="k-line">${k}</p>`,
      `<h2 class="n-title" tabindex="-1">${esc(tr(n.title))}</h2>`,
      n.org ? `<p class="n-org">${esc(tr(n.org))}</p>` : "",
      n.when ? `<p class="n-when">${esc(tr(n.when))}</p>` : "",
      n.metrics ? `<div class="n-metrics">${n.metrics.map((x) => `<div class="n-metric"><b>${esc(x.v)}</b><span>${esc(tr(x.l))}</span></div>`).join("")}</div>` : "",
      n.body ? `<p class="n-body">${esc(tr(n.body))}</p>` : "",
      n.facts ? `<dl class="n-facts">${n.facts.map((f) => `<div><dt>${esc(tr(f.k))}</dt><dd>${esc(tr(f.v))}</dd></div>`).join("")}</dl>` : "",
      n.bullets ? `<ul class="n-bullets">${tr(n.bullets).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : "",
      n.tech ? `<div class="n-tech">${n.tech.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : "",
      n.links ? `<div class="n-links">${n.links.map((l) => `<a href="${esc(l.href)}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><small>${esc(tr(l.kind))}</small><span>${esc(l.label)}</span></a>`).join("")}</div>` : "",
      n.hint ? `<p class="n-hint">${esc(tr(n.hint))}</p>` : "",
    ].join("");
    const sc = $("#somaScroll");
    sc.scrollTop = 0;
    requestAnimationFrame(updateMore);
  }
  function updateMore() {
    const sc = $("#somaScroll");
    $("#soma").classList.toggle("has-more", sc.scrollHeight - sc.scrollTop - sc.clientHeight > 8);
  }
  $("#somaScroll").addEventListener("scroll", updateMore, { passive: true });

  // ───────── Synapses: the ways out of the current neuron ─────────
  const synEl = $("#synapses");
  let conns = [], synList = [];

  function synapsesOf(n) {
    const list = [];
    for (const e of n.adj) {
      const o = e.a === n ? e.b : e.a, fwd = e.a === n;
      const s = { id: o.id, node: o, w: e.w, color: o.color, title: tr(o.short), reason: "" };
      if (e.kind === "link") { s.kind = "link"; s.kicker = tr(trackOf(o).label); s.reason = tr(e.reason); }
      else if (fwd) {
        s.kind = "next";
        if (n.id === "hello") { const t = trackOf(o); s.kicker = ui("start"); s.title = tr(t.label); s.reason = tr(t.blurb); s.color = t.color; }
        else if (o.id === "contact") { s.kicker = ui("contactNext"); s.title = tr(o.title); }
        else s.kicker = ui("next");
      } else {
        s.kind = "back";
        s.kicker = n.id === "contact" ? tr(trackOf(o).label) : ui("back");
      }
      list.push(s);
    }
    if (n.id === "contact") list.push({ id: "@network", kind: "next", virtual: true, kicker: ui("network"), title: ui("openNetwork"), reason: ui("openNetworkWhy"), color: S.coreColor, w: 1 });
    const rank = { back: 0, next: 1, link: 2 };
    return list.sort((a, b) => rank[a.kind] - rank[b.kind] || b.w - a.w);
  }

  function clearSynapses() { synEl.innerHTML = ""; conns = []; synList = []; }

  function synButton(s) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "syn" + (s.kind === "next" ? " primary" : "");
    b.style.setProperty("--sc", s.color);
    b.innerHTML = `<span class="s-k">${esc(s.kicker)}</span><span class="s-t">${esc(s.title)}</span>${s.reason ? `<span class="s-r">${esc(s.reason)}</span>` : ""}`;
    b.addEventListener("click", () => (s.virtual ? toOverview() : go(s.id)));
    b.setAttribute("aria-label", `${s.kicker}: ${s.title}${s.reason ? ". " + s.reason : ""}`);
    return b;
  }

  function renderSynapses() {
    clearSynapses();
    const n = N[current], list = synapsesOf(n);
    const cx = vw / 2, cy = vh / 2;
    const gapX = Math.max(36, Math.min(110, (vw - D) * 0.08));
    const room = (vw - D) / 2 - gapX - 18;
    const rows = mobile || room < 150;

    list.forEach((s) => {
      s.dx = s.virtual ? 1 : s.node.wx - n.wx;
      s.dy = s.virtual ? 0.5 : s.node.wy - n.wy;
      s.el = synButton(s);
    });

    if (!rows) {
      // desktop: synapses leave the neuron towards where their target really is
      const sides = { l: [], r: [] };
      list.forEach((s) => {
        const side = s.dx > 0 ? "r" : s.dx < 0 ? "l" : s.kind === "back" ? "l" : "r";
        s.side = side; s.el.classList.add("side-" + side);
        s.el.style.maxWidth = Math.min(240, room) + "px";
        synEl.appendChild(s.el);
        s.ax = side === "r" ? cx + D / 2 + gapX : cx - D / 2 - gapX;
        const slope = Math.abs(s.dx) < 1 ? Math.sign(s.dy) * 9 : s.dy / Math.abs(s.dx);
        s.want = cy + Math.max(-1, Math.min(1, slope * 0.9)) * (vh * 0.3);
        sides[side].push(s);
      });
      const minY = 92;
      for (const side of ["l", "r"]) {
        const maxY = side === "r" ? vh - 150 : vh - 76; // keep clear of the minimap
        const arr = sides[side].sort((a, b) => a.want - b.want || (a.kind === "next" ? -1 : 1));
        let prev = minY - 12;
        arr.forEach((s) => { s.h = s.el.offsetHeight; s.y = Math.max(s.want, prev + 12 + s.h / 2); prev = s.y + s.h / 2; });
        const over = prev - maxY;
        if (over > 0) arr.forEach((s) => (s.y -= over));
        const under = arr.length ? minY - (arr[0].y - arr[0].h / 2) : 0;
        if (under > 0) arr.forEach((s) => (s.y += under));
        arr.forEach((s) => { s.el.style.left = s.ax + "px"; s.el.style.top = s.y + "px"; });
      }
    } else {
      // narrow screens: a row of synapses above (back) and below (forward) the neuron
      const top = document.createElement("div"), bot = document.createElement("div");
      top.className = "syn-row"; bot.className = "syn-row";
      list.forEach((s) => {
        const up = mobile ? s.dy < 0 || (s.dy === 0 && s.dx < 0) : s.kind === "back";
        s.up = up; (up ? top : bot).appendChild(s.el);
      });
      synEl.append(top, bot);
      const half = DH / 2;
      top.style.top = Math.max(60, cy - half - 14 - top.offsetHeight) + "px";
      bot.style.top = Math.min(vh - bot.offsetHeight - 56, cy + half + 14) + "px";
      [top, bot].forEach((r) => r.addEventListener("scroll", computeConns, { passive: true }));
    }
    synList = list;
    computeConns();
  }

  function computeConns() {
    const cx = vw / 2, cy = vh / 2;
    conns = synList.map((s) => {
      const r = s.el.getBoundingClientRect();
      if (!r.width || r.right < 0 || r.left > vw) return null;
      let ax, ay, x0, y0, c1, c2;
      if (s.side) {
        ax = s.side === "r" ? r.left : r.right; ay = r.top + r.height / 2;
        const ux = ax - cx, uy = ay - cy, L = Math.hypot(ux, uy);
        x0 = cx + (ux / L) * (D / 2 + 3); y0 = cy + (uy / L) * (D / 2 + 3);
        c1 = [cx + (ux / L) * (D / 2 + 70), cy + (uy / L) * (D / 2 + 70)];
        c2 = [ax + (s.side === "r" ? -50 : 50), ay];
      } else {
        ax = r.left + r.width / 2; ay = s.up ? r.bottom : r.top;
        x0 = cx + Math.max(-D * 0.3, Math.min(D * 0.3, ax - cx)) * 0.6;
        const edge = mobile ? DH / 2 : Math.sqrt(Math.max(0, (D / 2) ** 2 - (x0 - cx) ** 2));
        y0 = s.up ? cy - edge - 2 : cy + edge + 2;
        c1 = [x0, lerp(y0, ay, 0.5)]; c2 = [ax, lerp(y0, ay, 0.5)];
      }
      return { p: [x0, y0, c1[0], c1[1], c2[0], c2[1], ax, ay], color: s.color, w: s.w, kind: s.kind };
    }).filter(Boolean);
  }

  // ───────── Bottom HUD: where am I in this path ─────────
  function renderTrail() {
    const n = N[current], t = trackOf(n), el = $("#trail");
    const count = `<span class="trail-count">${visited.size}/${nodes.length} ${esc(ui("visited"))}</span>`;
    if (!t) { el.innerHTML = `<span class="trail-label">${esc(tr(n.kicker))}</span>${count}`; return; }
    el.innerHTML = `<span class="trail-label">${esc(tr(t.label))}</span><span class="trail-dots">${t.order.map((id) =>
      `<button type="button" class="trail-dot${id === current ? " here" : visited.has(id) ? " seen" : ""}" data-go="${id}" aria-label="${esc(tr(N[id].short))}" title="${esc(tr(N[id].short))}"></button>`).join("")}</span>${count}`;
  }
  $("#trail").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });

  // ───────── Overview labels (also the clickable targets) ─────────
  const atlas = $("#atlas");
  function buildAtlas() {
    atlas.innerHTML = "";
    nodes.forEach((n) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "a-node";
      b.innerHTML = `<b>${esc(tr(n.short))}</b>${n.when ? `<small>${esc(tr(n.when).split(/[–·]/)[0].trim())}</small>` : ""}`;
      b.addEventListener("click", () => go(n.id));
      b.addEventListener("mouseenter", () => (hoverId = n.id));
      b.addEventListener("mouseleave", () => (hoverId = null));
      b.addEventListener("focus", () => (hoverId = n.id));
      b.addEventListener("blur", () => (hoverId = null));
      n.atlasEl = b; atlas.appendChild(b);
    });
    tracks.forEach((t) => {
      const d = document.createElement("div");
      d.className = "a-track"; d.style.color = t.color; d.textContent = tr(t.label);
      t.atlasEl = d; atlas.appendChild(d);
    });
  }
  function placeAtlas() {
    nodes.forEach((n) => {
      const r = oR * (n.track === "core" ? 1.25 : 1), el = n.atlasEl;
      if (!el) return;
      el.style.left = n.ox + "px"; el.style.top = n.oy - r - 6 + "px";
      el.style.paddingTop = 2 * r + 12 + "px";
      el.classList.toggle("here", n.id === current);
    });
    tracks.forEach((t) => {
      if (!t.atlasEl) return;
      const f = N[t.order[0]];
      if (!mobile) { t.atlasEl.style.left = f.ox - oR - 22 + "px"; t.atlasEl.style.top = f.oy - oR - 16 + "px"; t.atlasEl.style.transform = "translate(-50%,-50%)"; }
      else { t.atlasEl.style.left = f.ox + "px"; t.atlasEl.style.top = f.oy - oR - 12 + "px"; t.atlasEl.style.transform = "translate(-50%,-100%)"; }
    });
  }

  // ───────── Minimap ─────────
  const mini = $("#mini"), mctx = mini.getContext("2d");
  function drawMini() {
    if (!vw || mobile) return;
    const w = 176, h = 112;
    mini.width = w * dpr; mini.height = h * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const xs = nodes.map((n) => n.ox), ys = nodes.map((n) => n.oy);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((w - 24) / (x1 - x0 || 1), (h - 24) / (y1 - y0 || 1));
    const offX = 12 + ((w - 24) - (x1 - x0) * s) / 2, offY = 12 + ((h - 24) - (y1 - y0) * s) / 2;
    const P = (n) => [offX + (n.ox - x0) * s, offY + (n.oy - y0) * s];
    mctx.clearRect(0, 0, w, h);
    edges.forEach((e) => {
      const [ax, ay] = P(e.a), [bx, by] = P(e.b);
      mctx.strokeStyle = e.kind === "link" ? "rgba(150,190,255,.12)" : "rgba(150,190,255,.28)";
      mctx.lineWidth = 1; mctx.beginPath(); mctx.moveTo(ax, ay); mctx.lineTo(bx, by); mctx.stroke();
    });
    nodes.forEach((n) => {
      const [x, y] = P(n), here = n.id === current;
      mctx.beginPath(); mctx.arc(x, y, here ? 4.5 : 2.6, 0, Math.PI * 2);
      mctx.fillStyle = visited.has(n.id) || here ? n.color : "rgba(120,140,180,.45)";
      mctx.fill();
      if (here) { mctx.strokeStyle = n.color; mctx.lineWidth = 1; mctx.beginPath(); mctx.arc(x, y, 8, 0, Math.PI * 2); mctx.stroke(); }
    });
  }

  // ───────── Drawing ─────────
  const hexA = (hex, a) => { const v = parseInt(hex.slice(1), 16); return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`; };
  const glow = {};
  function glowSprite(c) {
    if (glow[c]) return glow[c];
    const s = document.createElement("canvas"); s.width = s.height = 64;
    const g = s.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.14, hexA(c, 0.95));
    grd.addColorStop(0.4, hexA(c, 0.22)); grd.addColorStop(1, hexA(c, 0));
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return (glow[c] = s);
  }

  let stars = [];
  function buildStars() {
    const xs = nodes.map((n) => n.wx), ys = nodes.map((n) => n.wy);
    const x0 = Math.min(...xs) - vw, x1 = Math.max(...xs) + vw, y0 = Math.min(...ys) - vh, y1 = Math.max(...ys) + vh;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    stars = Array.from({ length: 260 }, () => ({ x: lerp(x0, x1, rnd()), y: lerp(y0, y1, rnd()), d: 0.25 + rnd() * 0.6, a: 0.15 + rnd() * 0.45, r: 0.5 + rnd() * 1.1, ox: rnd() * vw, oy: rnd() * vh }));
  }

  let pulses = [];
  function spawnPulse() {
    if (mode === "focus") {
      if (!conns.length) return;
      pulses.push({ conn: conns[(Math.random() * conns.length) | 0], t: 0, v: 0.5 + Math.random() * 0.4 });
      return;
    }
    const pool = hoverId ? N[hoverId].adj : edges;
    pulses.push({ e: pool[(Math.random() * pool.length) | 0], t: 0, v: 0.35 + Math.random() * 0.35 });
  }

  const onScreen = (x, y, r) => x + r > -50 && x - r < vw + 50 && y + r > -50 && y - r < vh + 50;

  function draw(dt) {
    ctx.clearRect(0, 0, vw, vh);
    const vg = ctx.createRadialGradient(vw / 2, vh / 2, 0, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    vg.addColorStop(0, "#0a1630"); vg.addColorStop(0.55, "#060d1f"); vg.addColorStop(1, "#03060f");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, vw, vh);

    // dust: parallax depth while flying, a still field in the overview
    for (const s of stars) {
      let x = (s.x - cam.x) * cam.z * s.d + vw / 2, y = (s.y - cam.y) * cam.z * s.d + vh / 2;
      x = lerp(x, s.ox, m); y = lerp(y, s.oy, m);
      if (x < 0 || x > vw || y < 0 || y > vh) continue;
      ctx.fillStyle = `rgba(160,195,255,${s.a})`;
      ctx.fillRect(x, y, s.r, s.r);
    }

    const P = new Map(nodes.map((n) => [n, pos(n)]));
    const focusNode = mode === "focus" ? N[current] : null;
    const hl = hoverId ? N[hoverId] : null;
    const lineScale = Math.max(0.7, Math.min(2.2, cam.z * 2 + m));

    for (const e of edges) {
      const a = P.get(e.a), b = P.get(e.b);
      if (Math.max(a[0], b[0]) < -100 || Math.min(a[0], b[0]) > vw + 100 || Math.max(a[1], b[1]) < -100 || Math.min(a[1], b[1]) > vh + 100) continue;
      const p = curve(a, b, e.bend);
      const touch = hl && (e.a === hl || e.b === hl);
      let alpha = e.kind === "link" ? 0.12 + 0.14 * e.w : 0.3;
      if (visited.has(e.a.id) && visited.has(e.b.id)) alpha += 0.15;
      if (hl) alpha = touch ? 0.9 : alpha * 0.3;
      if (focusNode && (e.a === focusNode || e.b === focusNode)) alpha *= 0.2;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      g.addColorStop(0, hexA(e.a.color, alpha)); g.addColorStop(1, hexA(e.b.color, alpha));
      ctx.strokeStyle = g;
      ctx.lineWidth = (e.kind === "link" ? 1 : 1.6) * (touch ? 1.7 : 1) * lineScale;
      ctx.setLineDash(e.kind === "link" ? [4, 6] : []);
      ctx.stroke();
    }

    if (mode === "focus") for (const c of conns) {
      const p = c.p;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      const g = ctx.createLinearGradient(p[0], p[1], p[6], p[7]);
      g.addColorStop(0, hexA(N[current].color, 0.5)); g.addColorStop(1, hexA(c.color, c.kind === "link" ? 0.5 : 0.85));
      ctx.strokeStyle = g; ctx.lineWidth = c.kind === "link" ? 1 : 1.8;
      ctx.setLineDash(c.kind === "link" ? [4, 5] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.globalCompositeOperation = "lighter";
    pulses = pulses.filter((q) => {
      q.t += q.v * dt;
      if (q.t >= 1) return false;
      let x, y, c;
      if (q.conn) { if (mode !== "focus" || !conns.includes(q.conn)) return false; [x, y] = bez(q.conn.p, q.t); c = q.conn.color; }
      else { if (mode === "focus") return false; const a = P.get(q.e.a), b = P.get(q.e.b); [x, y] = bez(curve(a, b, q.e.bend), q.t); c = q.t < 0.5 ? q.e.a.color : q.e.b.color; }
      if (!onScreen(x, y, 0)) return true;
      const s = q.conn ? 22 : 12 + m * 8;
      ctx.drawImage(glowSprite(c), x - s / 2, y - s / 2, s, s);
      return true;
    });

    if (mode === "fly" && trailPts.length) {
      trailPts.forEach(([wx, wy], i) => {
        const [x, y] = proj(wx, wy), s = 10 + (i / trailPts.length) * 50;
        ctx.globalAlpha = ((i + 1) / trailPts.length) * 0.6;
        ctx.drawImage(glowSprite(flyColor), x - s / 2, y - s / 2, s, s);
      });
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";

    const tnow = performance.now() / 1000;
    for (const n of nodes) {
      if (n === focusNode) continue; // the DOM neuron sits on top of it
      const [x, y] = P.get(n), r = rad(n);
      if (!onScreen(x, y, r * 2)) continue;
      const lit = visited.has(n.id) || n.id === current;
      const dim = hl && hl !== n && !hl.adj.some((e) => e.a === n || e.b === n);
      const base = dim ? 0.35 : 1;
      const gs = r * 3.2;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = base * (lit ? 0.55 : 0.32);
      ctx.drawImage(glowSprite(n.color), x - gs / 2, y - gs / 2, gs, gs);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = base;
      const g = ctx.createRadialGradient(x, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, hexA(n.color, lit ? 0.55 : 0.3)); g.addColorStop(0.7, "rgba(6,12,28,.96)"); g.addColorStop(1, "rgba(6,12,28,.98)");
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = Math.max(1, r * 0.03); ctx.strokeStyle = hexA(n.color, lit ? 0.9 : 0.55); ctx.stroke();
      if (n.id === current && m > 0.5) {
        const k = (tnow % 2) / 2;
        ctx.beginPath(); ctx.arc(x, y, r + 4 + k * 16, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(n.color, 0.8 * (1 - k)); ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (r > 26 && m < 0.6) {
        const fs = Math.max(11, Math.min(30, r * 0.16));
        ctx.font = `500 ${fs}px Geist, system-ui, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(230,238,252,${Math.min(1, (r - 26) / 40) * (1 - m)})`;
        ctx.fillText(tr(n.short), x, y);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ───────── Loop ─────────
  let last = performance.now(), clock = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    stepTween(now);
    if (!reduceMotion) {
      clock += dt;
      const every = mode === "focus" ? 0.28 : hoverId ? 0.06 : 0.12;
      while (clock > every) { clock -= every; if (pulses.length < 80) spawnPulse(); }
    }
    draw(dt);
    requestAnimationFrame(frame);
  }

  // ───────── Controls ─────────
  $("#netBtn").addEventListener("click", () => (mode === "overview" ? dive(current || "hello") : toOverview()));
  $("#minimap").addEventListener("click", () => toOverview());
  $("#returnBtn").addEventListener("click", () => dive(current || "hello"));
  $("#brand").addEventListener("click", () => go("hello"));
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "n" || e.key === "N") { mode === "overview" ? dive(current || "hello") : toOverview(); return; }
    if (e.key === "Escape" && mode === "overview") { dive(current || "hello"); return; }
    if (mode !== "focus") return;
    const list = synapsesOf(N[current]);
    const pick = (kind) => list.find((x) => x.kind === kind);
    if (e.key === "ArrowRight") { const s = pick("next"); if (s) { e.preventDefault(); s.virtual ? toOverview() : go(s.id); } }
    if (e.key === "ArrowLeft") { const s = pick("back"); if (s) { e.preventDefault(); go(s.id); } }
  });
  let rz;
  const onResize = () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (innerWidth === vw && innerHeight === vh) return;
      layout();
      if (mode === "focus") { cam.x = N[current].wx; cam.y = N[current].wy; renderSynapses(); }
      if (snapshot) draw(0); // headless capture may not run animation frames
    }, 80);
  };
  addEventListener("resize", onResize);
  new ResizeObserver(onResize).observe(root);

  // ───────── Language ─────────
  function updateReturn() {
    const n = N[current || "hello"];
    $("#returnBtn").textContent = `${ui("returnTo")} ${tr(n.short)} ↩`;
  }
  function applyLang() {
    root.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = ui(el.dataset.i18n)));
    $("#netLabel").textContent = ui("network");
    $("#netBtn").setAttribute("aria-label", ui("network"));
    $("#langBtn").setAttribute("aria-label", ui("switchLang"));
    $("#keys").textContent = ui("keys");
    $("#ovHint").textContent = ui("networkHint");
    atlas.setAttribute("aria-label", ui("network"));
    $("#minimap").setAttribute("aria-label", ui("network"));
    $("#legend").innerHTML = tracks.map((t) => `<li style="--lc:${t.color}"><i></i>${esc(tr(t.label))}</li>`).join("") +
      `<li style="--lc:${S.coreColor}"><i></i>${esc(ui("core"))}</li>`;
    document.title = `Matheus Bueno de Oliveira · ${ui("role")}`;
    buildAtlas(); placeAtlas(); updateReturn();
    if (current && mode === "focus") { renderSoma(); renderSynapses(); renderTrail(); }
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "pt" : "en";
    try { localStorage.setItem("lang", lang); } catch {}
    const u = new URL(location.href);
    lang === "pt" ? u.searchParams.set("lang", "pt") : u.searchParams.delete("lang");
    history.replaceState(null, "", u);
    applyLang();
  });

  // ───────── Boot ─────────
  buildAtlas();
  layout();
  applyLang();
  const startHash = decodeURIComponent(location.hash.slice(1));
  if (snapshot) {
    ["hello", "city", "dellint", "dell1", "dell2", "telus", "agentic", "contact"].forEach((v) => visited.add(v));
    current = "telus"; setMode("overview"); draw(0);
    // headless capture can resize the page without events or animation frames
    setInterval(() => { if (innerWidth !== vw || innerHeight !== vh) { layout(); placeAtlas(); } draw(0); }, 200);
  } else if (startHash === "network") {
    setMode("overview");
  } else {
    setMode("intro"); // show the whole network for a moment, then dive in
    const target = N[startHash] ? startHash : "hello";
    setTimeout(() => dive(target, false), reduceMotion ? 0 : 1100);
  }
  requestAnimationFrame(frame);
})();
