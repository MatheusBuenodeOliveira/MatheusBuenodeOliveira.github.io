(() => {
  "use strict";

  const S = window.SITE;
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement, body = document.body;
  const params = new URLSearchParams(location.search);
  const snapshot = params.has("snapshot"); // still frame for the social preview image
  const perfProbe = params.has("perf") ? [] : null; // ?perf exposes average draw time as window.__drawMs
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

  nodes.forEach((n) => { if (n.photo) new Image().src = n.photo.src; }); // preload photos
  let visited;
  try { visited = new Set(JSON.parse(sessionStorage.getItem("visited") || "[]")); } catch { visited = new Set(); }
  const saveVisited = () => { try { sessionStorage.setItem("visited", JSON.stringify([...visited])); } catch {} };

  // ───────── Layout ─────────
  const sky = $("#sky"), ctx = sky.getContext("2d");
  let vw = 0, vh = 0, dpr = 1, mobile = false, D = 600, DH = 600, orbR = 300, oR = 14;
  const maxLen = Math.max(...tracks.map((t) => t.order.length));

  function layout() {
    vw = innerWidth; vh = innerHeight; mobile = vw <= 760;
    dpr = Math.min(devicePixelRatio || 1, innerWidth <= 760 ? 1.5 : 2);
    sky.width = Math.round(vw * dpr); sky.height = Math.round(vh * dpr);
    sky.style.width = vw + "px"; sky.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!mobile) { D = Math.round(Math.min(vh * 0.72, vw * 0.48, 680)); DH = D; }
    else { D = Math.round(Math.min(vw * 0.86, 420)); DH = Math.round(Math.min(vh * 0.58, D * 1.75)); }
    orbR = mobile ? Math.min(DH / 2, D * 0.62) : D / 2;
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
      const padX = Math.max(110, vw * 0.08), top = 162, bottom = 175;
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
      n.photo ? `<img class="n-photo ${n.photo.kind}" src="${esc(n.photo.src)}" alt="${esc(tr(n.photo.alt))}" />` : "",
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
    b.innerHTML = `<span class="s-node" aria-hidden="true"></span><span class="s-txt"><span class="s-k">${esc(s.kicker)}</span><span class="s-t">${esc(s.title)}</span>${s.reason ? `<span class="s-r">${esc(s.reason)}</span>` : ""}</span>`;
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
      const nr = s.el.firstElementChild.getBoundingClientRect(), nx = nr.left + nr.width / 2, ny = nr.top + nr.height / 2;
      let ax, ay, x0, y0, c1, c2;
      if (s.side) {
        ax = nx; ay = ny;
        const ux = ax - cx, uy = ay - cy, L = Math.hypot(ux, uy);
        x0 = cx + (ux / L) * (D / 2 + 3); y0 = cy + (uy / L) * (D / 2 + 3);
        c1 = [cx + (ux / L) * (D / 2 + 70), cy + (uy / L) * (D / 2 + 70)];
        c2 = [ax + (s.side === "r" ? -60 : 60), ay];
      } else {
        ax = nx; ay = ny;
        x0 = cx + Math.max(-D * 0.3, Math.min(D * 0.3, ax - cx)) * 0.6;
        const edge = mobile ? DH / 2 : Math.sqrt(Math.max(0, (D / 2) ** 2 - (x0 - cx) ** 2));
        y0 = s.up ? cy - edge - 2 : cy + edge + 2;
        c1 = [x0, lerp(y0, ay, 0.5)]; c2 = [ax, lerp(y0, ay, 0.5)];
      }
      return { p: [x0, y0, c1[0], c1[1], c2[0], c2[1], ax, ay], color: s.color, w: s.w, kind: s.kind };
    }).filter(Boolean);
    conns.forEach((c, i) => (c.offs = strandOffsets(501 + i * 13, 22)));
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
    const mk = (cls, text) => { const d = document.createElement("div"); d.className = cls; d.textContent = text || ""; d.setAttribute("aria-hidden", "true"); atlas.appendChild(d); return d; };
    layerEls = { inp: mk("a-layer", ui("inputLayer")), hid: mk("a-layer", ui("hiddenLayers")), out: mk("a-layer", ui("outputLayer")), br: mk("a-bracket"),
      idx: tracks[1].order.map((_, k) => mk("a-idx", "h" + (k + 1))) };
  }
  let layerEls = null;
  function placeLayers() {
    if (!layerEls) return;
    const cols = tracks[1].order.map((id) => N[id]), first = cols[0], last = cols[cols.length - 1];
    const set = (el, x, y, tf) => { el.style.left = x + "px"; el.style.top = y + "px"; el.style.transform = tf; };
    const L = layerEls;
    L.hid.classList.toggle("vert", mobile); L.br.classList.toggle("vert", mobile);
    if (!mobile) {
      const y = Math.min(...nodes.map((n) => n.oy)) - oR - 52, gap = (last.ox - first.ox) / (cols.length - 1);
      set(L.inp, N.hello.ox, y, "translate(-50%,-50%)");
      set(L.out, N.contact.ox, y, "translate(-50%,-50%)");
      set(L.hid, (first.ox + last.ox) / 2, y, "translate(-50%,-50%)");
      L.br.style.width = last.ox - first.ox + gap * 0.7 + "px"; L.br.style.height = "";
      set(L.br, first.ox - gap * 0.35, y + 11, "none");
      L.idx.forEach((el, k) => { el.style.display = ""; set(el, cols[k].ox, y + 23, "translate(-50%,-50%)"); });
    } else {
      const gap = (last.oy - first.oy) / (cols.length - 1);
      set(L.inp, 12, N.hello.oy, "translate(0,-50%)");
      set(L.out, 12, N.contact.oy, "translate(0,-50%)");
      set(L.hid, 8, (first.oy + last.oy) / 2, "translate(0,-50%) rotate(180deg)");
      L.br.style.height = last.oy - first.oy + gap * 0.7 + "px"; L.br.style.width = "";
      set(L.br, 26, first.oy - gap * 0.35, "none");
      L.idx.forEach((el) => (el.style.display = "none"));
    }
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
    placeLayers();
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

  // ───────── Plexus geometry: every neuron is a low-poly mesh ─────────
  const mkRnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function fibSphere(n, rnd, jit) {
    return Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963 + rnd() * jit, k = 0.9 + rnd() * 0.16;
      return [Math.cos(th) * r * k, y * k * 0.96, Math.sin(th) * r * k, rnd()];
    });
  }
  function nearEdges(pts, k) {
    const seen = new Set(), out = [];
    pts.forEach((p, i) => pts.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2])
      .sort((a, b) => a[1] - b[1]).slice(1, k + 1)
      .forEach(([j]) => { const key = i < j ? i + "," + j : j + "," + i; if (!seen.has(key)) { seen.add(key); out.push([i, j]); } }));
    return out;
  }
  const GEO = [11, 23, 37].map((seed) => {
    const rnd = mkRnd(seed);
    const hi = fibSphere(150, rnd, 0.25), lo = fibSphere(34, rnd, 0.3);
    const dots = Array.from({ length: 1500 }, (_, i) => {
      const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), d = i < 950 ? 0.82 + rnd() * 0.16 : Math.cbrt(rnd()) * 0.8;
      return [Math.sin(v) * Math.cos(u) * d, Math.cos(v) * d, Math.sin(v) * Math.sin(u) * d, rnd()];
    });
    return { hi, hiE: nearEdges(hi, 4), lo, loE: nearEdges(lo, 3), dots };
  });
  nodes.forEach((n, i) => { n.geo = GEO[i % 3]; n.phase = i * 1.7; });

  // strand offsets: plexus chains used for synapses
  function strandOffsets(seed, count = 30) {
    const rnd = mkRnd(seed);
    return Array.from({ length: count }, () => [rnd(), rnd() - 0.5, rnd() - 0.5, rnd()]).sort((a, b) => a[0] - b[0]);
  }
  edges.forEach((e, i) => (e.offs = strandOffsets(101 + i * 7)));

  // background: soft bokeh lights at several depths plus fine dust
  let bokeh = [], dust = [];
  const bokehDisc = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(90,175,255,1)"); r.addColorStop(0.65, "rgba(70,160,255,.75)"); r.addColorStop(1, "rgba(70,160,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c;
  })();
  function buildStars() {
    const rnd = mkRnd(7);
    bokeh = Array.from({ length: mobile ? 34 : 60 }, () => ({ x: rnd(), y: rnd(), r: 3 + Math.pow(rnd(), 2.3) * (mobile ? 34 : 52), a: 0.04 + rnd() * 0.17, d: 0.05 + rnd() * 0.3, ph: rnd() * 6.28 }));
    dust = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd(), d: 0.2 + rnd() * 0.5, a: 0.1 + rnd() * 0.35 }));
  }
  const wrap = (v, size) => ((v % size) + size) % size;

  let pulses = [];
  function spawnPulse() {
    if (mode === "focus") {
      if (!conns.length) return;
      pulses.push({ conn: conns[(Math.random() * conns.length) | 0], t: 0, v: 0.45 + Math.random() * 0.35 });
      return;
    }
    const pool = hoverId ? N[hoverId].adj : edges;
    pulses.push({ e: pool[(Math.random() * pool.length) | 0], t: 0, v: 0.35 + Math.random() * 0.35 });
  }

  const onScreen = (x, y, r) => x + r > -50 && x - r < vw + 50 && y + r > -50 && y - r < vh + 50;
  const rgbCache = {};
  const rgbOf = (hex) => rgbCache[hex] || (rgbCache[hex] = (() => { const v = parseInt(hex.slice(1), 16); return `${(v >> 16) & 255},${(v >> 8) & 255},${v & 255}`; })());

  // Drawing is batched: points and lines are sorted into a few brightness
  // buckets, so each neuron costs a handful of fill/stroke calls, not thousands.
  const NB = 5;
  const buckets = Array.from({ length: NB }, () => []);
  const clearBuckets = () => buckets.forEach((b) => (b.length = 0));
  function fillBuckets(rgb, maxA, size) {
    for (let k = 0; k < NB; k++) {
      const b = buckets[k]; if (!b.length) continue;
      ctx.fillStyle = `rgba(${rgb},${(maxA * (k + 1)) / NB})`;
      ctx.beginPath();
      for (let i = 0; i < b.length; i += 3) { const sz = size ? size : b[i + 2]; ctx.rect(b[i] - sz / 2, b[i + 1] - sz / 2, sz, sz); }
      ctx.fill();
    }
  }

  // a chain of mesh nodes along a curve
  function drawStrand(p, offs, color, alpha, spread) {
    const len = Math.hypot(p[6] - p[0], p[7] - p[1]);
    const n = Math.max(4, Math.min(offs.length, Math.round(len / 22)));
    const xs = new Float32Array(n), ys = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const o = offs[Math.floor((i / n) * offs.length)];
      const [x, y] = bez(p, o[0]), s = Math.sin(Math.PI * o[0]) * spread + 1.5;
      xs[i] = x + o[1] * s * 2; ys[i] = y + o[2] * s * 2;
    }
    const rgb = rgbOf(color);
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
    ctx.strokeStyle = `rgba(${rgb},${alpha * 0.35})`; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < n; i++) for (let j = i + 1; j <= i + 2 && j < n; j++) { ctx.moveTo(xs[i], ys[i]); ctx.lineTo(xs[j], ys[j]); }
    ctx.strokeStyle = `rgba(${rgb},${alpha * 0.45})`; ctx.lineWidth = 0.7; ctx.stroke();
    clearBuckets();
    for (let i = 0; i < n; i++) {
      const o = offs[Math.floor((i / n) * offs.length)], tw = 0.5 + 0.5 * Math.sin(tnow * 2.2 + o[3] * 30);
      buckets[Math.min(NB - 1, (tw * NB) | 0)].push(xs[i], ys[i], 0);
      if (o[3] > 0.86 && spread > 6) ctx.drawImage(glowSprite(color), xs[i] - 8, ys[i] - 8, 16, 16);
    }
    fillBuckets("215,240,255", alpha, 2);
  }

  // one neuron as a rotating plexus sphere, with level of detail by size
  function drawNeuron(n, x, y, r, alpha, lit) {
    const g = n.geo, rgb = rgbOf(n.color);
    const c = Math.cos(tnow * 0.12 + n.phase), s = Math.sin(tnow * 0.12 + n.phase);
    const tx = 0.25 + Math.sin(tnow * 0.15 + n.phase) * 0.08, c2 = Math.cos(tx), s2 = Math.sin(tx);
    const big = r > 46, A = alpha * (lit ? 1 : 0.7);
    const gs = r * 2.6;
    ctx.globalAlpha = A * (lit ? 0.4 : 0.25);
    ctx.drawImage(glowSprite(n.color), x - gs / 2, y - gs / 2, gs, gs);
    ctx.globalAlpha = 1;

    // inner texture
    if (r > 110) {
      const step = r > 220 && !mobile ? 1 : 2;
      clearBuckets();
      for (let i = 0; i < g.dots.length; i += step) {
        const q = g.dots[i];
        const x1 = q[0] * c + q[2] * s, z1 = -q[0] * s + q[2] * c, d = ((q[1] * s2 + z1 * c2) + 1) / 2;
        const v = (0.15 + 0.85 * d) * (0.6 + 0.4 * Math.sin(tnow * 2.5 + q[3] * 50));
        buckets[Math.min(NB - 1, (v * NB) | 0)].push(x + x1 * r, y + (q[1] * c2 - z1 * s2) * r, 0.6 + d * 1.1);
      }
      fillBuckets(rgb, 0.37 * A, 0);
    }

    // wireframe
    const V = big ? g.hi : g.lo, E = big ? g.hiE : g.loE, m3 = V.length;
    const px = new Float32Array(m3), py = new Float32Array(m3), pd = new Float32Array(m3);
    for (let i = 0; i < m3; i++) {
      const q = V[i], x1 = q[0] * c + q[2] * s, z1 = -q[0] * s + q[2] * c;
      px[i] = x + x1 * r; py[i] = y + (q[1] * c2 - z1 * s2) * r; pd[i] = ((q[1] * s2 + z1 * c2) + 1) / 2;
    }
    const lines = [[], [], [], []];
    for (const [i, j] of E) lines[Math.min(3, (((pd[i] + pd[j]) / 2) * 4) | 0)].push(i, j);
    lines.forEach((L, k) => {
      if (!L.length) return;
      const d = (k + 0.5) / 4;
      ctx.strokeStyle = `rgba(${rgb},${(0.06 + 0.5 * d * d) * A})`;
      ctx.lineWidth = (big ? 0.6 : 0.5) + d * (big ? 0.7 : 0.4);
      ctx.beginPath();
      for (let t = 0; t < L.length; t += 2) { ctx.moveTo(px[L[t]], py[L[t]]); ctx.lineTo(px[L[t + 1]], py[L[t + 1]]); }
      ctx.stroke();
    });

    // vertices
    clearBuckets();
    for (let i = 0; i < m3; i++) {
      const k = V[i][3], d = pd[i], v = (0.2 + 0.8 * d) * (0.55 + 0.45 * Math.sin(tnow * 1.8 + k * 40));
      buckets[Math.min(NB - 1, (v * NB) | 0)].push(px[i], py[i], big ? 1 + d * 1.6 : 0.8 + d);
      if (big && k > 0.8 && d > 0.45) {
        const gg = 10 + d * Math.min(22, r * 0.08);
        ctx.globalAlpha = A; ctx.drawImage(glowSprite(n.color), px[i] - gg / 2, py[i] - gg / 2, gg, gg); ctx.globalAlpha = 1;
      }
    }
    fillBuckets("225,245,255", A, 0);

    if (big) {
      const fy = y - r * 0.85, fl = ctx.createRadialGradient(x - r * 0.1, fy, 0, x - r * 0.1, fy, r * 0.7);
      fl.addColorStop(0, `rgba(190,235,255,${0.26 * A})`); fl.addColorStop(1, "rgba(80,170,255,0)");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(x - r * 0.1, fy, r * 0.7, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.globalAlpha = A; ctx.drawImage(glowSprite(n.color), x - r * 0.6, y - r * 0.6, r * 1.2, r * 1.2); ctx.globalAlpha = 1;
    }
  }

  let tnow = 0;
  function draw(dt) {
    tnow = performance.now() / 1000;
    const bg = ctx.createRadialGradient(vw / 2, vh / 2, 0, vw / 2, vh / 2, Math.max(vw, vh) * 0.85);
    bg.addColorStop(0, "#0a2a55"); bg.addColorStop(0.45, "#061633"); bg.addColorStop(1, "#020610");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, vw, vh);

    ctx.globalCompositeOperation = "lighter";
    const W = vw + 240, H = vh + 240;
    for (const b of bokeh) {
      const x = wrap(b.x * W - cam.x * cam.z * b.d * (1 - m) + Math.sin(tnow * 0.1 + b.ph) * 14, W) - 120;
      const y = wrap(b.y * H - cam.y * cam.z * b.d * (1 - m) + Math.cos(tnow * 0.08 + b.ph) * 10, H) - 120;
      ctx.globalAlpha = b.a; ctx.drawImage(bokehDisc, x - b.r, y - b.r, b.r * 2, b.r * 2);
    }
    ctx.globalAlpha = 1;
    for (const s of dust) {
      const x = wrap(s.x * W - cam.x * cam.z * s.d * (1 - m), W) - 120, y = wrap(s.y * H - cam.y * cam.z * s.d * (1 - m), H) - 120;
      ctx.fillStyle = `rgba(160,205,255,${s.a})`; ctx.fillRect(x, y, 1.2, 1.2);
    }

    const P = new Map(nodes.map((n) => [n, pos(n)]));
    const focusNode = mode === "focus" ? N[current] : null;
    const hl = hoverId ? N[hoverId] : null;
    const spread = lerp(orbR * cam.z * 0.11, 5, m);

    for (const e of edges) {
      const a = P.get(e.a), b = P.get(e.b);
      if (Math.max(a[0], b[0]) < -100 || Math.min(a[0], b[0]) > vw + 100 || Math.max(a[1], b[1]) < -100 || Math.min(a[1], b[1]) > vh + 100) continue;
      const touch = hl && (e.a === hl || e.b === hl);
      let alpha = e.kind === "link" ? 0.35 + 0.3 * e.w : 0.75;
      if (visited.has(e.a.id) && visited.has(e.b.id)) alpha = Math.min(1, alpha + 0.2);
      if (hl) alpha = touch ? 1 : alpha * 0.25;
      if (focusNode && (e.a === focusNode || e.b === focusNode)) alpha *= 0.15;
      drawStrand(curve(a, b, e.bend), e.offs, e.kind === "link" ? e.b.color : e.a.color, alpha, spread * (e.kind === "link" ? 0.7 : 1));
    }

    if (mode === "focus") conns.forEach((c) => drawStrand(c.p, c.offs, c.color, c.kind === "link" ? 0.75 : 1, orbR * 0.07));

    pulses = pulses.filter((q) => {
      q.t += q.v * dt;
      if (q.t >= 1) return false;
      let x, y, c;
      if (q.conn) { if (mode !== "focus" || !conns.includes(q.conn)) return false; [x, y] = bez(q.conn.p, q.t); c = q.conn.color; }
      else { if (mode === "focus") return false; const a = P.get(q.e.a), b = P.get(q.e.b); [x, y] = bez(curve(a, b, q.e.bend), q.t); c = q.t < 0.5 ? q.e.a.color : q.e.b.color; }
      if (!onScreen(x, y, 0)) return true;
      const s = q.conn ? 34 : 16 + m * 8;
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

    for (const n of nodes) {
      const [x, y] = P.get(n), r = rad(n);
      if (!onScreen(x, y, r * 1.3)) continue;
      const lit = visited.has(n.id) || n.id === current;
      const dim = hl && hl !== n && !hl.adj.some((e) => e.a === n || e.b === n);
      drawNeuron(n, x, y, r, dim ? 0.3 : 1, lit);
      if (n.id === current && m > 0.5) {
        const k = (tnow % 2) / 2;
        ctx.beginPath(); ctx.arc(x, y, r + 4 + k * 16, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(n.color, 0.8 * (1 - k)); ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";

    // names on the neurons you pass while flying
    for (const n of nodes) {
      if (n === focusNode) continue;
      const [x, y] = P.get(n), r = rad(n);
      if (r <= 26 || m >= 0.6 || !onScreen(x, y, r)) continue;
      const fs = Math.max(11, Math.min(30, r * 0.16));
      ctx.font = `500 ${fs}px Geist, system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(230,238,252,${Math.min(1, (r - 26) / 40) * (1 - m)})`;
      ctx.fillText(tr(n.short), x, y);
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
    if (perfProbe) { const t0 = performance.now(); draw(dt); perfProbe.push(performance.now() - t0); if (perfProbe.length > 120) perfProbe.shift(); window.__drawMs = perfProbe.reduce((a, b) => a + b, 0) / perfProbe.length; } else draw(dt);
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
