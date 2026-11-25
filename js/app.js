(() => {
  "use strict";

  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  // ?snapshot renders a still frame (used to generate the social preview image)
  const snapshot = new URLSearchParams(location.search).has("snapshot");
  const reduceMotion = snapshot || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const noHover = matchMedia("(hover: none)").matches;

  // ───────── i18n ─────────
  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") || localStorage.getItem("lang") || "en";
  if (!["en", "pt"].includes(lang)) lang = "en";
  const tr = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] ?? o.en ?? "");
  const ui = (k) => tr(S.ui[k]);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ───────── Graph ─────────
  const css = getComputedStyle(root);
  const COLORS = S.layers.map((_, i) => css.getPropertyValue(`--c${i}`).trim() || "#6ff2c2");
  const rgba = (hex, a) => {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  const nodes = S.neurons.map((n, i) => ({ ...n, idx: i, color: COLORS[n.layer], in: [], out: [], x: 0, y: 0 }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const layers = S.layers.map((l, i) => ({ ...l, nodes: nodes.filter((n) => n.layer === i) }));
  const edges = S.edges.map(([a, b, w], i) => {
    const e = { i, a: byId[a], b: byId[b], w };
    if (!e.a || !e.b) throw new Error(`Bad edge ${a}→${b}`);
    e.a.out.push(e); e.b.in.push(e);
    return e;
  });

  // ───────── DOM ─────────
  const net = $("#net"), wrap = $("#neurons"), canvas = $("#wires"), ctx = canvas.getContext("2d");
  const labelsEl = $("#layerLabels"), panel = $("#panel"), scrim = $("#scrim");
  const scrub = $("#scrub"), epochOut = $("#epochOut"), ticker = $("#ticker"), playBtn = $("#playBtn");

  nodes.forEach((n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "neuron" + (n.layer === 2 ? " big" : "") + (n.current ? " current" : "");
    b.style.setProperty("--nc", n.color);
    b.innerHTML = `<span class="dot"></span><span class="label"><span class="t"></span><span class="s"></span></span>`;
    b.addEventListener("mouseenter", () => setHover(n.id));
    b.addEventListener("mouseleave", () => setHover(null));
    b.addEventListener("focus", () => setHover(n.id));
    b.addEventListener("blur", () => setHover(null));
    b.addEventListener("click", (ev) => { ev.stopPropagation(); openPanel(n.id); });
    n.el = b;
    wrap.appendChild(b);
  });

  // ───────── Layout ─────────
  let W = 0, H = 0, mobile = false;

  function layout() {
    mobile = innerWidth <= 760;
    W = net.clientWidth;
    labelsEl.innerHTML = "";

    if (!mobile) {
      net.style.height = "";
      H = net.clientHeight;
      const x0 = Math.max(60, W * 0.075), x1 = W * 0.8;
      const top = 56, avail = H - top - 16;
      layers.forEach((L, li) => {
        const x = x0 + (li * (x1 - x0)) / (layers.length - 1);
        const k = L.nodes.length;
        const gap = Math.min(avail / Math.max(k, 1), L.id === "exp" ? 110 : 92);
        const y0 = top + (avail - gap * (k - 1)) / 2;
        L.nodes.forEach((n, j) => { n.x = x; n.y = y0 + j * gap; });
        addLayerLabel(L, li, x, 0);
      });
    } else {
      const perRow = 3, rowH = 92, labelH = 46, bandGap = 34;
      let y = 0;
      layers.forEach((L, li) => {
        addLayerLabel(L, li, 18, y);
        y += labelH;
        const rows = Math.ceil(L.nodes.length / perRow);
        L.nodes.forEach((n, j) => {
          const r = Math.floor(j / perRow);
          const cols = Math.min(perRow, L.nodes.length - r * perRow);
          const c = j - r * perRow;
          n.x = (W * (c + 1)) / (cols + 1);
          n.y = y + r * rowH + 10;
        });
        y += rows * rowH + bandGap;
      });
      H = y;
      net.style.height = H + "px";
    }

    nodes.forEach((n) => { n.el.style.left = n.x + "px"; n.el.style.top = n.y + "px"; });

    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    edges.forEach((e) => {
      const { a, b } = e;
      if (!mobile) {
        const dx = (b.x - a.x) * 0.5;
        e.p = [a.x, a.y, a.x + dx, a.y, b.x - dx, b.y, b.x, b.y];
      } else {
        const dy = (b.y - a.y) * 0.5;
        e.p = [a.x, a.y, a.x, a.y + dy, b.x, b.y - dy, b.x, b.y];
      }
    });
    if (reduceMotion) draw(0);
  }

  function addLayerLabel(L, li, x, y) {
    const d = document.createElement("div");
    d.className = "layer-label";
    d.style.setProperty("--lc", COLORS[li]);
    d.style.left = x + "px";
    d.style.top = (mobile ? y : -6) + "px";
    d.innerHTML = `<b>${esc(L.tag)}</b>${esc(tr(L.label))}<small>${esc(tr(L.sub))}</small>`;
    labelsEl.appendChild(d);
  }

  const bez = (p, t) => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
  };

  // ───────── State ─────────
  const T0 = S.timeline.start, T1 = S.timeline.end;
  let scrubT = T1, hoverId = null, selectedId = null;
  let litNodes = null, litEdges = null;

  const isDormant = (n) => n.t > scrubT + 1e-6;
  const edgeLive = (e) => !isDormant(e.a) && !isDormant(e.b);

  function computePath() {
    const id = hoverId || selectedId;
    if (!id) { litNodes = litEdges = null; return; }
    litNodes = new Set([id]); litEdges = new Set();
    // walk upstream (what fed this neuron) and downstream (what it produced)
    const walk = (n, dir, seen) => {
      for (const e of n[dir]) {
        litEdges.add(e);
        const m = dir === "out" ? e.b : e.a;
        litNodes.add(m.id);
        if (!seen.has(m)) { seen.add(m); walk(m, dir, seen); }
      }
    };
    walk(byId[id], "in", new Set());
    walk(byId[id], "out", new Set());
  }

  function applyState() {
    computePath();
    nodes.forEach((n) => {
      const c = n.el.classList;
      c.toggle("dormant", isDormant(n));
      c.toggle("lit", !!litNodes && litNodes.has(n.id) && n.id !== (hoverId || selectedId));
      c.toggle("dim", !!litNodes && !litNodes.has(n.id));
      c.toggle("active", n.id === selectedId);
    });
    if (reduceMotion) draw(0);
  }

  function setHover(id) {
    if (noHover && id) return; // on touch, rely on tap → panel
    hoverId = id;
    applyState();
    if (id && !reduceMotion) byId[id].in.concat(byId[id].out).forEach((e, k) => edgeLive(e) && spawn(e, -k * 0.08, 1.6));
  }

  // ───────── Pulses ─────────
  const sprites = COLORS.map((c) => {
    const s = document.createElement("canvas"); s.width = s.height = 32;
    const g = s.getContext("2d"), grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.18, rgba(c, 0.95));
    grd.addColorStop(0.45, rgba(c, 0.25)); grd.addColorStop(1, rgba(c, 0));
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32);
    return s;
  });
  let pulses = [];
  function spawn(e, t = 0, speed = 1, hops = 0) {
    if (pulses.length > 90) return;
    pulses.push({ e, t, v: (0.45 + Math.random() * 0.35) * speed, hops });
  }
  function ambient() {
    const pool = (litEdges ? [...litEdges] : edges).filter(edgeLive);
    if (!pool.length) return;
    const starters = pool.filter((e) => e.a.layer === 0 || (litEdges && e.a.id === (hoverId || selectedId)));
    const list = starters.length && Math.random() < 0.55 ? starters : pool;
    let r = Math.random() * list.reduce((s, e) => s + e.w, 0);
    for (const e of list) { r -= e.w; if (r <= 0) { spawn(e); break; } }
  }

  // ───────── Render ─────────
  let last = performance.now(), ambientClock = 0;
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    const focus = !!litEdges;

    for (const e of edges) {
      const live = edgeLive(e), lit = focus && litEdges.has(e);
      let alpha, lw = 1;
      if (lit && live) { alpha = 0.35 + 0.5 * e.w; lw = 1 + 1.4 * e.w; }
      else if (lit) alpha = 0.1;
      else if (focus) alpha = 0.025;
      else alpha = live ? 0.06 + 0.14 * e.w : 0.025;
      const p = e.p;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      if (lit && live) {
        const g = ctx.createLinearGradient(p[0], p[1], p[6], p[7]);
        g.addColorStop(0, rgba(e.a.color, alpha)); g.addColorStop(1, rgba(e.b.color, alpha));
        ctx.strokeStyle = g;
      } else ctx.strokeStyle = `rgba(200,210,235,${alpha})`;
      ctx.lineWidth = lw; ctx.stroke();
    }

    if (!dt) return;
    ctx.globalCompositeOperation = "lighter";
    const next = [];
    for (const q of pulses) {
      q.t += q.v * dt;
      if (q.t >= 1) {
        // the signal propagates forward like a real activation
        const outs = q.e.b.out.filter(edgeLive).filter((e) => !litEdges || litEdges.has(e));
        if (outs.length && q.hops < 4 && Math.random() < 0.7) next.push({ e: outs[(Math.random() * outs.length) | 0], t: 0, v: q.v, hops: q.hops + 1 });
        continue;
      }
      if (q.t < 0) { next.push(q); continue; }
      if (!edgeLive(q.e)) continue;
      const [x, y] = bez(q.e.p, q.t);
      const s = focus ? (litEdges.has(q.e) ? 22 : 0) : 16;
      if (s) ctx.drawImage(sprites[q.t < 0.5 ? q.e.a.layer : q.e.b.layer], x - s / 2, y - s / 2, s, s);
      next.push(q);
    }
    pulses = next;
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    const raw = (now - last) / 1000, dt = Math.min(0.05, raw); last = now;
    ambientClock += dt;
    const every = litEdges ? 0.09 : 0.22;
    while (ambientClock > every) { ambientClock -= every; ambient(); }
    if (playing) stepPlay(Math.min(0.25, raw));
    draw(dt);
    requestAnimationFrame(frame);
  }

  // ───────── Timeline ─────────
  const events = nodes.filter((n) => n.when).sort((a, b) => a.t - b.t);
  const MONTHS = { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"] };
  const fmtT = (t) => {
    if (t >= T1 - 0.005) return ui("now");
    const y = Math.floor(t), m = Math.min(11, Math.floor((t - y) * 12));
    return `${MONTHS[lang][m]} ${y}`;
  };
  let playing = false, playSpeed = 1;

  function buildTicks() {
    const el = $("#ticks"); el.innerHTML = "";
    for (let y = Math.ceil(T0); y <= Math.floor(T1); y++) {
      const s = document.createElement("span");
      s.className = "tick"; s.textContent = "’" + String(y).slice(2);
      s.style.left = ((y - T0) / (T1 - T0)) * 100 + "%";
      s.dataset.y = y; el.appendChild(s);
    }
  }

  function setScrub(t, fromUser) {
    const prev = scrubT;
    scrubT = Math.max(T0, Math.min(T1, t));
    const f = (scrubT - T0) / (T1 - T0);
    if (!fromUser) scrub.value = Math.round(f * 1000);
    scrub.style.setProperty("--p", f * 100 + "%");
    epochOut.textContent = fmtT(scrubT);
    document.querySelectorAll(".tick").forEach((s) => s.classList.toggle("on", +s.dataset.y <= scrubT));
    if (scrubT > prev) events.filter((n) => n.t > prev && n.t <= scrubT).forEach(fireEvent);
    applyState();
    scrub.setAttribute("aria-valuetext", fmtT(scrubT));
  }

  function fireEvent(n) {
    n.el.classList.remove("fire"); void n.el.offsetWidth; n.el.classList.add("fire");
    if (!reduceMotion) n.in.filter((e) => !isDormant(e.a)).forEach((e, k) => spawn(e, -k * 0.05, 2.2));
    ticker.innerHTML = `<span class="k">${esc(tr(n.when).split("–")[0].trim())}</span>${esc(tr(n.title))} · ${esc(tr(n.org).split("·")[0].trim())}`;
  }

  function play(speedYearsPerSec) {
    if (scrubT >= T1 - 0.01) setScrub(T0);
    playSpeed = speedYearsPerSec; playing = true;
    playBtn.classList.add("playing"); playLabel();
  }
  function stop(finished) {
    playing = false; playBtn.classList.remove("playing"); playLabel();
    if (finished) ticker.innerHTML = `<span class="k">${esc(ui("done"))}</span>${esc(ui("doneOut"))}`;
  }
  function stepPlay(dt) {
    setScrub(scrubT + playSpeed * dt);
    if (scrubT >= T1) stop(true);
  }
  const playLabel = () => { $("#playLabel").textContent = playing ? ui("pause") : ui("play"); playBtn.setAttribute("aria-label", playing ? ui("pause") : ui("play")); };

  playBtn.addEventListener("click", () => (playing ? stop(false) : play((T1 - T0) / 20)));
  scrub.addEventListener("input", () => { if (playing) stop(false); setScrub(T0 + (scrub.value / 1000) * (T1 - T0), true); });

  // ───────── Panel ─────────
  let lastFocus = null;
  function openPanel(id) {
    const n = byId[id];
    if (!panel.classList.contains("open")) lastFocus = document.activeElement;
    selectedId = id;
    const L = S.layers[n.layer];
    panel.style.setProperty("--nc", n.color);
    $("#pLayer").textContent = `${L.tag} · ${tr(L.label)}`;
    const sortW = (a, b) => b.w - a.w;
    const linkList = (list, side) => list.slice().sort(sortW).map((e) => {
      const m = e[side];
      return `<button type="button" class="link-neuron" data-go="${m.id}" style="--lc:${m.color};--w:${Math.round(e.w * 100)}%">
        <i></i><span>${esc(tr(m.title))}</span><span class="w" title="w = ${e.w.toFixed(2)}"></span></button>`;
    }).join("");

    $("#pBody").innerHTML = `
      <h2 id="p-title" tabindex="-1">${esc(tr(n.title))}</h2>
      ${n.org ? `<p class="p-org">${esc(tr(n.org))}</p>` : ""}
      ${n.when ? `<p class="p-when">${esc(tr(n.when))}${n.current ? ` <span class="badge">${esc(ui("current"))}</span>` : ""}</p>` : ""}
      ${isDormant(n) ? `<p class="dormant-note">◌ ${esc(ui("dormant"))} (${esc(fmtT(scrubT))})</p>` : ""}
      ${n.body ? `<p class="p-body">${esc(tr(n.body))}</p>` : ""}
      ${n.bullets ? `<ul class="p-bullets">${tr(n.bullets).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      ${n.link ? `<a class="cta" href="${esc(n.link.href)}" ${n.link.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(n.link.label)} ↗</a>` : ""}
      ${n.metrics ? `<p class="p-sec">${esc(ui("impact"))}</p><div class="metrics">${n.metrics.map((m) => `<div class="metric"><b>${esc(m.v)}</b><span>${esc(tr(m.l))}</span></div>`).join("")}</div>` : ""}
      ${n.tech ? `<p class="p-sec">${esc(ui("stack"))}</p><div class="tags">${n.tech.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
      ${n.in.length ? `<p class="p-sec">${esc(ui("incoming"))}</p><div class="links">${linkList(n.in, "a")}</div>` : ""}
      ${n.out.length ? `<p class="p-sec">${esc(ui("outgoing"))}</p><div class="links">${linkList(n.out, "b")}</div>` : ""}
    `;
    $("#pBody").scrollTop = 0;
    panel.classList.add("open"); panel.setAttribute("aria-hidden", "false");
    if (mobile) scrim.classList.add("on");
    applyState();
    $("#p-title").focus({ preventScroll: true });
    if (!reduceMotion) n.in.concat(n.out).filter(edgeLive).forEach((e, k) => spawn(e, -k * 0.06, 1.8));
  }
  function closePanel() {
    if (!panel.classList.contains("open")) return;
    panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); scrim.classList.remove("on");
    const prevSel = selectedId; selectedId = null; applyState();
    const back = lastFocus && document.contains(lastFocus) ? lastFocus : prevSel && byId[prevSel].el;
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  const step = (d) => { if (selectedId) openPanel(nodes[(byId[selectedId].idx + d + nodes.length) % nodes.length].id); };

  $("#pBody").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) openPanel(b.dataset.go); });
  $("#pClose").addEventListener("click", closePanel);
  $("#pPrev").addEventListener("click", () => step(-1));
  $("#pNext").addEventListener("click", () => step(1));
  scrim.addEventListener("click", closePanel);
  net.addEventListener("click", (e) => { if (!e.target.closest(".neuron")) closePanel(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
    if (!panel.classList.contains("open") || e.target === scrub) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  // ───────── Model card (readable version of the same data) ─────────
  function renderCard() {
    const d = new Date();
    const ver = `v${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const exp = layers[2].nodes.slice().sort((a, b) => b.t - a.t);
    const edu = layers[1].nodes.slice().sort((a, b) => b.t - a.t);
    const evals = exp.flatMap((n) => (n.metrics || []).map((m) => ({ ...m, src: `${tr(n.title)} · ${tr(n.org).split("·")[0].trim()}` })));
    const outs = layers[4].nodes;

    $("#cardInner").innerHTML = `
      <p class="mc-kicker">${esc(ui("modelCard"))}</p>
      <h2 class="mc-title" id="mc-title">${esc(S.person.name)}<span class="mono">matheus-bueno-de-oliveira · ${ver} · ${esc(ui("mcTypeV"))}</span></h2>
      <p class="mc-intro">${esc(ui("mcIntro"))}</p>

      <dl class="spec">
        <dt>${esc(ui("mcType"))}</dt><dd>${esc(ui("mcTypeV"))}</dd>
        <dt>${esc(ui("mcArch"))}</dt><dd>${esc(ui("mcArchV"))}</dd>
        <dt>${esc(ui("mcUse"))}</dt><dd>${esc(ui("mcUseV"))}</dd>
        <dt>${esc(ui("mcLimits"))}</dt><dd>${esc(ui("mcLimitsV"))}</dd>
      </dl>

      <h3 class="mc-h">${esc(ui("mcEval"))} <small>${esc(ui("mcEvalNote"))}</small></h3>
      <div class="evals">${evals.map((m) => `<div class="eval"><b>${esc(m.v)}</b><span>${esc(tr(m.l))}</span><em>${esc(m.src)}</em></div>`).join("")}</div>

      <h3 class="mc-h">${esc(ui("mcHistory"))}</h3>
      <ol class="history">${exp.map((n) => `
        <li style="--lc:${n.color}">
          <span class="h-when">${esc(tr(n.when))}</span>
          <span class="h-title">${esc(tr(n.title))}</span>
          <span class="h-org">${esc(tr(n.org))}</span>
          ${n.bullets ? `<ul>${tr(n.bullets).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          <button type="button" class="h-open" data-go="${n.id}">${esc(ui("openNeuron"))}</button>
        </li>`).join("")}
      </ol>

      <div class="cols">
        <div>
          <h3 class="mc-h">${esc(ui("mcData"))}</h3>
          <ul class="plain">${edu.map((n) => `<li><b>${esc(tr(n.title))}</b><span>${esc(tr(n.org))} · ${esc(tr(n.when))}</span></li>`).join("")}</ul>
        </div>
        <div>
          <h3 class="mc-h">${esc(ui("mcFeatures"))}</h3>
          <ul class="plain">${layers[3].nodes.slice().reverse().map((n) => `<li><b>${esc(tr(n.title))}</b><span>${esc((n.tech || []).join(" · "))}</span></li>`).join("")}</ul>
        </div>
      </div>

      <h3 class="mc-h">${esc(ui("mcInference"))}</h3>
      <div class="endpoints">${outs.map((n) => `<a href="${esc(n.link.href)}" ${n.link.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}><i>→</i>${esc(n.link.label)}</a>`).join("")}</div>

      <footer class="foot">
        <span>© ${d.getFullYear()} ${esc(S.person.name)} · ${esc(ui("footer"))}</span>
        <a href="#stage">${esc(ui("backToNet"))}</a>
      </footer>`;
  }
  $("#cardInner").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) openPanel(b.dataset.go); });

  // ───────── Language ─────────
  function applyLang() {
    root.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = ui(el.dataset.i18n)));
    nodes.forEach((n) => {
      n.el.querySelector(".t").textContent = tr(n.short);
      n.el.querySelector(".s").textContent = n.when ? tr(n.when) : n.link ? n.link.label : tr(n.org);
      n.el.setAttribute("aria-label", `${tr(n.title)}${n.org ? " · " + tr(n.org) : ""}${n.when ? " · " + tr(n.when) : ""}`);
    });
    $("#hint").textContent = noHover ? ui("hintTouch") : ui("hint");
    $("#langBtn").setAttribute("aria-label", ui("switchLang"));
    scrub.setAttribute("aria-label", ui("timelineLabel"));
    $("#pPrev").setAttribute("aria-label", ui("prev"));
    $("#pNext").setAttribute("aria-label", ui("next"));
    $("#pClose").setAttribute("aria-label", ui("close"));
    $("#stage").setAttribute("aria-label", lang === "pt" ? "Rede neural interativa" : "Interactive neural network");
    document.title = `${S.person.name} · ${ui("mcTypeV")}`;
    playLabel();
    epochOut.textContent = fmtT(scrubT);
    renderCard();
    layout();
    if (selectedId) openPanel(selectedId);
    ticker.textContent = "";
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "pt" : "en";
    localStorage.setItem("lang", lang);
    const u = new URL(location.href);
    lang === "pt" ? u.searchParams.set("lang", "pt") : u.searchParams.delete("lang");
    history.replaceState(null, "", u);
    applyLang();
  });

  // ───────── Boot ─────────
  buildTicks();
  applyLang();
  new ResizeObserver(() => layout()).observe(net);
  addEventListener("resize", layout);

  // fade neurons in, layer by layer
  nodes.forEach((n) => setTimeout(() => n.el.classList.add("ready"), reduceMotion ? 0 : 150 + n.layer * 140 + (n.idx % 7) * 30));

  if (reduceMotion) {
    setScrub(T1);
    if (snapshot) { hoverId = "telus"; applyState(); }
  } else {
    setScrub(T0);
    setTimeout(() => play((T1 - T0) / 7), 900); // quick intro forward pass
    requestAnimationFrame(frame);
  }
})();
