/* DJ PH. Site behaviour. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  const abs = (u) => new URL(u, document.baseURI).href;
  const fmtDur = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  const fmtClock = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;
  const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const skipIntro = /[?&]skip\b/.test(location.search);
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const HOWLER = "https://phola.howler.co.za/PHolaeastlondon";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ==================================================================
     Content. Edit here.
     ================================================================== */
  const MIXES = [
    { n: 275, slug: "dj-ph-mix-275", date: "2025-06-20", secs: 3674, tags: ["Amapiano", "Live"], bpm: 112 },
    { n: 274, slug: "dj-ph-mix-274", date: "2024-12-13", secs: 2115, tags: ["Hip Hop", "Party"], bpm: 95 },
    { n: 273, slug: "dj-ph-mix-273", date: "2024-12-13", secs: 4094, tags: ["Amapiano"], bpm: 112 },
    { n: 272, slug: "dj-ph-mix-272", date: "2024-05-17", secs: 3400, tags: ["Mix"], bpm: 112 },
    { n: 271, slug: "dj-ph-mix-271", date: "2024-03-01", secs: 3861, tags: ["Amapiano", "Live"], bpm: 112 },
    { n: 270, slug: "dj-ph-mix-270", date: "2024-01-16", secs: 3448, tags: ["Amapiano", "3-Step"], bpm: 114 },
    { n: 269, slug: "dj-ph-mix-269", date: "2024-01-16", secs: 2777, tags: ["Hip Hop"], bpm: 95 },
    { n: 268, slug: "dj-ph-mix-268", date: "2023-08-02", secs: 1761, tags: ["Hip Hop", "Trap", "Drill"], bpm: 70 },
    { n: 267, slug: "dj-ph-mix-267", date: "2023-07-31", secs: 1431, tags: ["Hip Hop", "Mash-ups"], bpm: 95 },
    { n: 266, slug: "dj-ph-mix-266", date: "2023-07-28", secs: 1810, tags: ["Amapiano", "Party"], bpm: 112 }
  ];
  MIXES.forEach((m) => { m.art = abs(`assets/img/mix-${m.n}.webp`); });

  // Gigs come from content/gigs.json and the Save the Date block from content/next-up.json.
  // PH edits both at /admin (see README). Upcoming dates first, then the most recent.
  let GIGS = [];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fitWords = (text, max) => {
    let out = "";
    for (const w of String(text).trim().split(/\s+/)) { const next = out ? `${out} ${w}` : w; if (next.length > max) break; out = next; }
    return out || String(text).slice(0, max);
  };
  function toGigs(list) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
    const rows = (Array.isArray(list) ? list : [])
      .filter((g) => g && g.show !== false && /^\d{4}-\d{2}-\d{2}/.test(g.date || "") && g.city)
      .map((g) => {
        const key = g.date.slice(0, 10);
        const [y, m, d] = key.split("-").map(Number);
        const when = g.precision === "year" ? `${y}` : g.precision === "month" ? `${MON[m - 1]} ${y}` : `${d} ${MON[m - 1]} ${y}`;
        const boardDate = g.precision === "day" || !g.precision ? `${pad(d)} ${MON[m - 1]} ${String(y).slice(2)}` : when;
        const boardText = g.board || String(g.event || "").replace(/,/g, "");
        return {
          key, upcoming: key >= today, record: !!g.record, when, time: g.times || "", city: g.city, what: g.event || "", link: g.tickets || "",
          board: { date: boardDate, city: fitWords(g.city.split(",")[0], 12), event: fitWords(boardText, 19), short: fitWords(boardText, 17) }
        };
      });
    const next = rows.filter((g) => g.upcoming).sort((a, b) => a.key.localeCompare(b.key));
    const past = rows.filter((g) => !g.upcoming).sort((a, b) => b.key.localeCompare(a.key));
    next.forEach((g, i) => Object.assign(g.board, i ? { status: "ON TIME" } : { status: "BOARDING", tone: "orange" }));
    past.forEach((g) => Object.assign(g.board, g.record ? { status: "RECORD", tone: "record" } : { status: "LANDED" }));
    return next.concat(past);
  }

  // Same photos and lines as the PHola site's "Cities visited"
  const EDITIONS = [
    { city: "East London", img: "city-el", meta: "PH's home turf. Back Fri 18 Dec 2026.", flag: "Next up", link: HOWLER },
    { city: "Johannesburg", img: "city-jhb", meta: "Waterfall, rooftops and the main stage after dark." },
    { city: "Cape Town", img: "city-cpt", meta: "Four thousand on the day. The biggest yet." },
    { city: "Durban", img: "city-dbn", meta: "Home of the Durban July after party." },
    { city: "Bloemfontein", img: "city-bfn", meta: "A-Reece and Focalistic on the bill." },
    { city: "Botswana", img: "city-bw", meta: "Across the border, with The Day Club." }
  ];

  const life = (n) => `assets/img/life/L${n}.webp`;
  // Hero doors: a two-up slideshow. Each step the right photo moves to the left door.
  const DOORS = ["048", "110", "041", "197", "126", "061", "249", "045"].map(life);
  const ROLL = [["110", "Paris"], ["041", "Wheels up"], ["197", "Golden hour"], ["126", "Day set"], ["249", "After dark"], ["078", "Valet"], ["048", "Booth"], ["061", "Red carpet"], ["003", "Palms"]];
  const CAMERA_ROLL = ["110", "041", "126", "197", "048", "003", "249", "019", "061", "078", "130", "141", "045", "152", "218", "089", "245", "164", "185", "076", "010", "188", "258", "205", "122", "101", "068", "237", "139", "013", "156", "212", "026", "149", "081", "241", "190", "004", "098", "111", "216", "083", "043", "225", "030"];
  const PRESS = ["37", "11", "40", "06", "36", "24", "08", "41", "27", "47", "38", "16", "19", "02", "30", "45", "12", "25", "35", "43", "21", "09", "32", "44", "01", "13", "39", "17", "48", "03", "20", "26", "34", "46", "07", "14", "22", "28", "31", "33", "42", "04", "10", "15", "18", "23", "29", "05"];
  const KIT = ["37", "11", "40", "06"];

  /* ==================================================================
     Render
     ================================================================== */
  const vinylHTML = (art) => `<div class="vinyl"><div class="vinyl__grooves"><div class="vinyl__label" style="--art:url('${art}')"></div></div><div class="vinyl__sheen"></div></div>`;
  const sleeveHTML = (m) => `
    <article class="sleeve" data-mix="${m.n}" tabindex="0" role="button" aria-label="Play DJ PH Mix ${m.n}">
      <div class="sleeve__art"><div class="sleeve__disc">${vinylHTML(m.art)}</div><img class="sleeve__cover" src="${m.art}" alt="DJ PH Mix ${m.n} artwork" loading="lazy" width="800" height="800"></div>
      <div class="sleeve__meta"><span class="sleeve__num">${m.n}</span><span class="sleeve__tags mono">${m.tags.join(" / ")}</span><span class="sleeve__facts mono">${fmtDur(m.secs)} <i>/</i> ${fmtDate(m.date)}</span></div>
    </article>`;

  function renderHome() {
    const doorHTML = (offset) => DOORS.map((src, i) => `<img src="${src}" alt="" ${i === offset ? 'class="is-on"' : 'loading="lazy"'}>`).join("");
    $("#doorL").innerHTML = doorHTML(0);
    $("#doorR").innerHTML = doorHTML(1);

    renderCrate();

    $("#edsTrack").innerHTML = EDITIONS.map((e, i) => {
      const tag = e.link ? "a" : "div";
      const attrs = e.link ? ` href="${e.link}" target="_blank" rel="noopener"` : "";
      const media = `<div class="ed__img"><img src="assets/img/phola/${e.img}.webp" alt="PHola ${e.city}" loading="lazy">${e.flag ? `<span class="ed__flag mono">${e.flag}</span>` : ""}</div>`;
      return `<${tag} class="ed"${attrs}>${media}<div class="ed__row"><p class="ed__name">${e.city}</p><p class="ed__meta mono">${pad(i + 1)} <i>/</i> ${e.meta}</p></div></${tag}>`;
    }).join("");

    $("#rollGrid").innerHTML = ROLL.map(([n, cap], i) => `<figure class="snap" data-light="${life(n)}"><img src="assets/img/life/md/L${n}.webp" alt="DJ PH, ${cap.toLowerCase()}" loading="lazy" decoding="async"><figcaption class="mono"><span>${cap}</span><span>${pad(i + 1)} / ${pad(ROLL.length)}</span></figcaption></figure>`).join("");
    $("#kitRow").innerHTML = KIT.map((n) => `<a class="kit__item" href="#press" data-open="press"><img src="assets/img/press/P${n}.webp" alt="DJ PH studio portrait" loading="lazy"></a>`).join("");
  }
  function renderGigList() {
    const act = (g) => g.upcoming ? (g.link ? `<a href="${esc(g.link)}" target="_blank" rel="noopener">Tickets</a>` : `<span class="gig__tag">Soon</span>`)
      : g.record ? `<span class="gig__tag gig__tag--record">Record</span>` : `<span class="gig__tag">Played</span>`;
    $("#gigsList").innerHTML = GIGS.slice(0, 6).map((g) => `
      <li class="gig ${g.upcoming ? "is-next" : "is-past"}">
        <span class="gig__date mono">${esc(g.when)}</span>
        <span class="gig__city" data-scramble>${esc(g.city)}</span>
        <span class="gig__act mono">${act(g)}</span>
        <p class="gig__what">${esc(g.what)}${g.time ? `, ${esc(g.time)}` : ""}</p>
      </li>`).join("");
  }
  function renderCrate() {
    $("#crateTrack").innerHTML = MIXES.map(sleeveHTML).join("") +
      `<a class="crate__end" href="https://www.mixcloud.com/iam_pH/" target="_blank" rel="noopener"><span class="mono">The full archive</span><b>Every mix on Mixcloud ↗</b></a>`;
  }

  const rendered = {};
  const PAGE_RENDER = {
    mixes() { $("#mixesAll").innerHTML = MIXES.map(sleeveHTML).join(""); bindSleeves($("#mixesAll")); syncSleeves(); },
    gigs() { renderBoard(); runBoard(); },
    photobook() {
      $("#masonry").innerHTML = CAMERA_ROLL.map((n, i) => `<figure data-light="${life(n)}" data-idx="${i}"><img src="${life(n)}" alt="DJ PH, camera roll frame ${i + 1}" loading="lazy"></figure>`).join("");
    },
    press() {
      $("#pressGrid").innerHTML = PRESS.map((n) => `<div class="pp"><div class="pp__img" data-light="assets/img/press/P${n}.webp"><img src="assets/img/press/P${n}.webp" alt="DJ PH press portrait ${n}" loading="lazy"></div><p class="pp__dl mono"><span>PH-${n}</span><a href="assets/press/DJ-PH-press-${n}.jpg" download>Download</a></p></div>`).join("");
    },
    about() { runRecord(); }
  };

  /* ---------- Departures board (Gigs page) ---------- */
  const BOARD_COLS = [{ key: "date", w: 9, label: "Date" }, { key: "city", w: 12, label: "City" }, { key: "event", w: 19, label: "Event" }, { key: "status", w: 8, label: "Status" }];
  const boardMQ = window.matchMedia("(max-width: 700px)");
  const flapCells = (text, w) => String(text).toUpperCase().padEnd(w, " ").slice(0, w).split("").map((ch) => `<span class="flap" data-ch="${ch === " " ? "&nbsp;" : esc(ch)}">&nbsp;</span>`).join("");
  const cellWidth = (w) => `calc(var(--tile) * ${w} + ${2 * (w - 1)}px)`;
  function renderBoard() {
    const rows = GIGS.map((g) => g.board);
    if (boardMQ.matches) {
      $("#board").innerHTML = rows.map((f) => `<div class="board__row board__row--stack ${f.tone ? "is-" + f.tone : ""}" role="row" aria-label="${esc(`${f.date}, ${f.city}, ${f.event}, ${f.status}`)}"><div class="board__line"><div class="board__cell">${flapCells(f.date, 9)}</div><div class="board__cell board__cell--status">${flapCells(f.status, 8)}</div></div><div class="board__line"><div class="board__cell">${flapCells(f.short || f.event, 17)}</div></div></div>`).join("");
      return;
    }
    const head = `<div class="board__row board__row--head" role="row">${BOARD_COLS.map((c) => `<div class="board__cell" role="columnheader" style="width:${cellWidth(c.w)}">${c.label}</div>`).join("")}</div>`;
    $("#board").innerHTML = head + rows.map((f) => `<div class="board__row ${f.tone ? "is-" + f.tone : ""}" role="row">${BOARD_COLS.map((c) => `<div class="board__cell board__cell--${c.key}" role="cell" aria-label="${esc(f[c.key])}">${flapCells(f[c.key] || "", c.w)}</div>`).join("")}</div>`).join("");
  }
  boardMQ.addEventListener("change", () => { if (rendered.gigs) { renderBoard(); flipIn($$("#board .flap"), true); } });

  /* ---------- Split-flap: wall-clock timed so slow frames still settle ---------- */
  const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  function flipIn(els, instant) {
    const t0 = performance.now();
    const flaps = els.map((el, i) => {
      const target = el.dataset.ch === " " ? " " : el.dataset.ch;
      return { el, target, steps: target === " " ? 0 : 4 + Math.floor(Math.random() * 6), start: t0 + i * 14, shown: -1, done: false };
    });
    const settle = (f) => { f.el.textContent = f.target === " " ? " " : f.target; f.done = true; };
    if (reduced || instant) { flaps.forEach(settle); return; }
    (function tick(now) {
      let busy = false;
      for (const f of flaps) {
        if (f.done) continue;
        busy = true;
        if (now < f.start) continue;
        const step = Math.floor((now - f.start) / 60);
        if (step >= f.steps) { settle(f); continue; }
        if (step !== f.shown) {
          f.shown = step;
          f.el.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
          f.el.classList.remove("is-flip"); void f.el.offsetWidth; f.el.classList.add("is-flip");
        }
      }
      if (busy) requestAnimationFrame(tick);
    })(performance.now());
  }
  function runBoard() {
    const rows = $$("#board .board__row:not(.board__row--head)");
    flipIn(rows.flatMap((r) => $$(".flap", r)));
  }

  /* ---------- Save the Date: poster, countdown and buttons ---------- */
  // Times are entered in South African time
  const saTime = (v) => (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v || "") ? new Date(`${v.slice(0, 16)}:00+02:00`).getTime() : 0);
  let EVENT_AT = saTime($("#countdown").dataset.starts);
  const countEls = { d: $('[data-unit="d"]'), h: $('[data-unit="h"]'), m: $('[data-unit="m"]') };
  let lastCount = "";
  function updateCount() {
    $("#countdown").hidden = !(EVENT_AT > Date.now());
    if ($("#countdown").hidden) return;
    let ms = Math.max(0, EVENT_AT - Date.now());
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4);
    const vals = { d: String(d).padStart(2, "0"), h: pad(h), m: pad(m) };
    const key = vals.d + vals.h + vals.m;
    if (key === lastCount) return;
    const first = !lastCount;
    lastCount = key;
    Object.entries(vals).forEach(([u, v]) => {
      const el = countEls[u];
      if (el.children.length !== v.length) el.innerHTML = v.split("").map(() => '<span class="flap">0</span>').join("");
      v.split("").forEach((ch, i) => {
        const f = el.children[i];
        if (f.textContent === ch) return;
        f.dataset.ch = ch;
        if (first) f.textContent = ch; else flipIn([f]);
      });
    });
  }
  updateCount();
  setInterval(updateCount, 10000);

  const setBtn = (a, text, link) => {
    a.hidden = !(text && link);
    if (a.hidden) return;
    const out = /^https?:/i.test(link);
    a.textContent = text;
    a.href = link;
    if (out) { a.target = "_blank"; a.rel = "noopener"; } else { a.removeAttribute("target"); a.removeAttribute("rel"); }
  };
  function applyNextUp(n) {
    const on = !!(n && n.show !== false && n.poster);
    $("#nextUp").hidden = !on;
    $("#gigsGrid").classList.toggle("is-solo", !on);
    if (!on) return;
    if (n.intro) $("#gigsIntro").textContent = n.intro;
    const img = $("#posterImg"), src = String(n.poster).replace(/^\//, "");
    if (img.getAttribute("src") !== src) img.src = src;
    img.alt = n.poster_alt || n.event || "";
    // Any poster shape works; very tall or wide ones are cropped to a sensible frame
    const fit = () => { if (img.naturalWidth) $("#poster").style.setProperty("--poster-ratio", Math.min(1.4, Math.max(0.62, img.naturalWidth / img.naturalHeight))); };
    if (img.complete) fit(); else img.addEventListener("load", fit, { once: true });
    setBtn($("#nextBtn"), n.button_text, n.button_link);
    setBtn($("#nextBtn2"), n.second_text, n.second_link);
    $("#countLabel").textContent = n.countdown_label || "Starts in";
    $("#countdown").setAttribute("aria-label", `Countdown to ${n.event || "the next show"}`);
    EVENT_AT = saTime(n.starts);
    lastCount = "";
    updateCount();
  }

  const getJSON = (url) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url} ${r.status}`))));
  let gigRowsIn = () => {};
  function loadGigs() {
    getJSON("content/gigs.json")
      .then((data) => { GIGS = toGigs(data && data.gigs); })
      .catch(() => { GIGS = []; })
      .then(() => {
        renderGigList();
        if (rendered.gigs) { renderBoard(); flipIn($$("#board .flap"), true); }
        gigRowsIn();
      });
    getJSON("content/next-up.json").then(applyNextUp).catch(() => {});
  }

  /* ---------- Johannesburg clocks ---------- */
  const jhbFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  function tickClock() {
    const t = jhbFmt.format(new Date());
    $("#jhbClock").textContent = t;
    $("#boardClock").textContent = t.slice(0, 5);
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- 72 hour counter (About page) ---------- */
  let recordRan = false;
  function runRecord() {
    if (recordRan) return;
    recordRan = true;
    const el = $("#record");
    const set = (p) => {
      const t = Math.round(p * 72 * 3600);
      $("#recH").textContent = pad(Math.floor(t / 3600));
      $("#recM").textContent = pad(Math.floor((t % 3600) / 60));
      $("#recS").textContent = pad(t % 60);
    };
    if (reduced) { set(1); el.classList.add("is-done"); return; }
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 3200;
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        set(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(step); else el.classList.add("is-done");
      })(t0);
    }, { root: $("#page-about"), threshold: 0.4 });
    io.observe(el);
  }

  /* ==================================================================
     Player (Mixcloud widget API)
     ================================================================== */
  const navEl = $("#nav");
  const Player = {
    mix: MIXES[0], widget: null, iframe: null, playing: false, pending: null,
    suppress: false, started: false, confirmed: false, dur: MIXES[0].secs,

    setMeta(m) {
      this.mix = m; this.dur = m.secs;
      $("#npTitle").textContent = `Mix ${m.n}`;
      $("#np").setAttribute("aria-label", `Play DJ PH Mix ${m.n}`);
      $("#deckTitle").textContent = `DJ PH Mix ${m.n}`;
      $("#deckTags").textContent = m.tags.join(" / ");
      $("#deckLen").textContent = fmtDur(m.secs);
      $("#deckNow").textContent = "00:00";
      $("#musicCover").src = m.art;
      $("#musicLabel").style.setProperty("--art", `url('${m.art}')`);
      $("#deckBar").style.width = "0%";
      $("#npBar").style.width = "0%";
      $("#nowArt").src = m.art;
      $("#nowTitle").textContent = `DJ PH Mix ${m.n}`;
      $("#nowMeta").innerHTML = `${m.tags.join(" <i>/</i> ")} <i>/</i> ${fmtDur(m.secs)}`;
      syncSleeves();
    },
    feedURL(m) { return `https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&hide_artwork=1&light=1&autoplay=1&feed=${encodeURIComponent(`/iam_pH/${m.slug}/`)}`; },
    async whenApi() {
      for (let i = 0; i < 80 && !(window.Mixcloud && window.Mixcloud.PlayerWidget); i++) await new Promise((r) => setTimeout(r, 100));
      return window.Mixcloud && window.Mixcloud.PlayerWidget;
    },
    async mount(m, prime) {
      if (this.iframe) this.iframe.remove();
      this.widget = null;
      navEl.classList.remove("needs-tap");
      const frame = document.createElement("iframe");
      frame.title = "Mixcloud player";
      frame.allow = "autoplay; encrypted-media";
      frame.src = this.feedURL(m);
      const loaded = new Promise((r) => frame.addEventListener("load", r, { once: true }));
      $("#playerFrame").appendChild(frame);
      this.iframe = frame;
      if (!prime) this.watchStart();
      const ok = await this.whenApi();
      await loaded;
      if (frame !== this.iframe) return;
      if (!ok) { if (!prime) this.needTap(); return; }
      const w = window.Mixcloud.PlayerWidget(frame);
      await Promise.race([w.ready, new Promise((r) => setTimeout(r, 8000))]);
      if (frame !== this.iframe) return;
      if (typeof w.play !== "function") { if (!prime) this.needTap(); return; }
      this.widget = w;
      w.events.play.on(() => { if (this.suppress) { w.pause(); return; } this.setPlaying(true); });
      w.events.pause.on(() => this.setPlaying(false));
      w.events.ended.on(() => this.setPlaying(false));
      w.events.progress.on((pos, dur) => {
        if (dur) this.dur = dur;
        if (!this.confirmed && this.playing && pos >= 1) {
          this.confirmed = true; this.started = true;
          if (typeof this.onConfirmed === "function") this.onConfirmed();
        }
        const pct = `${Math.min(100, (pos / this.dur) * 100)}%`;
        $("#deckBar").style.width = pct;
        $("#npBar").style.width = pct;
        $("#deckNow").textContent = fmtClock(pos);
      });
      if (!this.suppress) w.play();
    },
    prime() { if (!this.iframe) this.mount(this.mix, true); },
    start() {
      this.suppress = false; this.started = true; this.watchStart();
      if (this.widget) this.widget.play(); else if (!this.iframe) this.mount(this.mix);
    },
    hush() { this.suppress = true; if (this.widget) this.widget.pause(); },
    needTap() { navEl.classList.add("needs-tap"); },
    async play(m) {
      this.suppress = false; this.started = true;
      if (m && m.n !== this.mix.n) {
        this.setPlaying(false); this.setMeta(m);
        if (this.widget && typeof this.widget.load === "function") {
          this.watchStart();
          try { await this.widget.load(`/iam_pH/${m.slug}/`, true); return; } catch (e) { /* fresh player below */ }
        }
        await this.mount(m); return;
      }
      if (!this.iframe) { await this.mount(this.mix); return; }
      if (this.widget) { if (!this.playing) this.watchStart(); this.widget.togglePlay(); }
    },
    seek(ratio) { if (this.widget && typeof this.widget.seek === "function") this.widget.seek(ratio * this.dur); },
    watchStart() {
      clearTimeout(this.pending);
      this.pending = setTimeout(() => { if (!this.playing) this.needTap(); }, 5000);
    },
    setPlaying(on) {
      this.playing = on;
      if (on) { clearTimeout(this.pending); navEl.classList.remove("needs-tap"); }
      $("#np").classList.toggle("is-playing", on);
      $("#np").setAttribute("aria-label", on ? "Pause the mix" : `Play DJ PH Mix ${this.mix.n}`);
      $("#deck").classList.toggle("is-playing", on);
      $("#deckPlay").setAttribute("aria-label", on ? "Pause the mix" : `Play DJ PH Mix ${this.mix.n}`);
      $("#deckKicker").textContent = on ? "Now playing" : this.started ? "Paused" : "Latest mix";
      $("#nowcard").classList.toggle("is-playing", on);
      $("#nowLabel").textContent = on ? "Now playing" : this.started ? "Paused" : "Latest mix";
      $("#nowPlay").setAttribute("aria-label", on ? "Pause the mix" : `Play DJ PH Mix ${this.mix.n}`);
      syncSleeves();
    }
  };
  function syncSleeves() {
    $$(".sleeve").forEach((s) => {
      const cur = +s.dataset.mix === Player.mix.n && Player.playing;
      s.classList.toggle("is-playing", cur);
      $(".sleeve__disc", s).classList.toggle("is-spinning", cur);
    });
  }
  function bindSleeves(root) {
    $$(".sleeve", root).forEach((s) => {
      const go = () => { const m = MIXES.find((x) => x.n === +s.dataset.mix); if (Player.mix.n === m.n && Player.iframe) Player.play(); else Player.play(m); };
      s.addEventListener("click", go);
      s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  }

  renderHome();
  loadGigs();
  bindSleeves(document);
  Player.setMeta(MIXES[0]);
  $("#np").addEventListener("click", () => Player.play());
  $("#nowPlay").addEventListener("click", () => Player.play());
  $("#deckPlay").addEventListener("click", () => Player.play());
  $(".deck__bar").addEventListener("click", (e) => { const r = e.currentTarget.getBoundingClientRect(); Player.seek((e.clientX - r.left) / r.width); });

  // New uploads on Mixcloud appear on their own
  (async function refreshMixcloud() {
    try {
      const res = await fetch("https://api.mixcloud.com/iam_pH/cloudcasts/?limit=12");
      if (!res.ok) return;
      const { data } = await res.json();
      let added = 0;
      data.forEach((c) => {
        const num = parseInt((c.name.match(/(\d{3,})/) || [])[1], 10);
        if (!num || num <= MIXES[0].n || MIXES.some((m) => m.n === num)) return;
        const tags = (c.tags || []).slice(0, 2).map((t) => t.name.replace(/ dj mix/i, ""));
        MIXES.push({ n: num, slug: c.slug, date: c.created_time.slice(0, 10), secs: c.audio_length, tags: tags.length ? tags : ["Mix"], bpm: 112, art: c.pictures && (c.pictures["1024wx1024h"] || c.pictures.extra_large) });
        added++;
      });
      if (!added) return;
      MIXES.sort((a, b) => b.n - a.n);
      $("#mixCount").textContent = MIXES[0].n;
      renderCrate();
      bindSleeves($("#crateTrack"));
      if (hasGsap) ScrollTrigger.refresh();
      if (!Player.started) Player.setMeta(MIXES[0]);
    } catch (e) { /* offline: static list stays */ }
  })();

  /* ---------- Forms ---------- */
  $$("[data-form]").forEach((form) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const done = $(".form__done", form);
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      done.textContent = form.name === "contact" ? "Sent. The team will come back to you." : "You're on the list.";
      form.reset();
    } catch (err) {
      done.textContent = "That didn't go through. Email bookings@iamph.co.za instead.";
    }
    done.hidden = false;
  }));

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  let lbList = [], lbIdx = 0;
  function openLight(list, idx) {
    lbList = list; lbIdx = idx;
    $(".lightbox__img", lb).src = lbList[lbIdx];
    $(".lightbox__count", lb).textContent = `${lbIdx + 1} / ${lbList.length}`;
    lb.hidden = false;
  }
  const stepLight = (d) => openLight(lbList, (lbIdx + d + lbList.length) % lbList.length);
  $(".lightbox__prev", lb).addEventListener("click", () => stepLight(-1));
  $(".lightbox__next", lb).addEventListener("click", () => stepLight(1));
  $(".lightbox__close", lb).addEventListener("click", () => { lb.hidden = true; });
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-light]");
    if (!t) return;
    const scope = t.closest(".masonry, .press__grid, .roll__grid") || document;
    const list = $$("[data-light]", scope).map((x) => x.dataset.light);
    openLight(list, list.indexOf(t.dataset.light));
  });

  /* ---------- Mobile menu ---------- */
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));

  /* ==================================================================
     Pages: full-screen sheets over the home page, so the mix keeps playing
     ================================================================== */
  let lenis = null;
  let current = null;
  let onPageTrack = null; // set by the motion code: shows the open page in the nav
  const closeBtn = $("#pageClose");
  function openPage(name, push = true, instant = false) {
    const el = $(`#page-${name}`);
    if (!el) return;
    setMenu(false);
    if (current && current !== name) closePage(false, true);
    if (!rendered[name]) { rendered[name] = true; if (PAGE_RENDER[name]) PAGE_RENDER[name](); }
    else if (name === "gigs") runBoard();
    current = name;
    el.hidden = false;
    el.scrollTop = 0;
    document.body.classList.add("page-open");
    if (lenis) lenis.stop();
    closeBtn.hidden = false;
    $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.dataset.open === name));
    if (onPageTrack) onPageTrack(name);
    if (push) history.pushState({ page: name }, "", `#${name}`);
    if (hasGsap && !reduced && !instant) gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" });
    else el.style.clipPath = "inset(0% 0% 0% 0%)";
  }
  function closePage(push = true, instant = false) {
    if (!current) return;
    const el = $(`#page-${current}`);
    current = null;
    closeBtn.hidden = true;
    $$(".nav__links a").forEach((a) => a.classList.remove("is-active"));
    if (onPageTrack) onPageTrack(null);
    const finish = () => { el.hidden = true; document.body.classList.remove("page-open"); if (lenis) lenis.start(); };
    if (push) history.pushState({}, "", location.pathname + location.search);
    if (hasGsap && !reduced && !instant) gsap.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "expo.inOut", onComplete: finish });
    else { el.style.clipPath = "inset(100% 0% 0% 0%)"; finish(); }
  }
  function scrollToId(id) {
    const target = id === "top" ? 0 : document.getElementById(id);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { offset: id === "top" ? 0 : -60, duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 60, behavior: reduced ? "auto" : "smooth" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-open], [data-scroll], [data-home], [data-close]");
    if (!a) return;
    e.preventDefault();
    setMenu(false);
    if (a.dataset.open) { openPage(a.dataset.open); return; }
    const wasOpen = !!current;
    if (current) closePage(true, false);
    const go = () => (a.dataset.scroll ? scrollToId(a.dataset.scroll) : a.hasAttribute("data-home") ? scrollToId("top") : null);
    if (wasOpen) setTimeout(go, 720); else go();
  });
  closeBtn.addEventListener("click", () => closePage());
  window.addEventListener("popstate", () => {
    const name = location.hash.slice(1);
    if ($(`#page-${name}`)) openPage(name, false); else closePage(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!lb.hidden) { lb.hidden = true; return; }
    if (current) closePage();
    setMenu(false);
  });
  document.addEventListener("keydown", (e) => { if (!lb.hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) stepLight(e.key === "ArrowRight" ? 1 : -1); });

  /* ==================================================================
     Loader, then motion
     ================================================================== */
  const deepLink = location.hash.slice(1);
  if (!hasGsap) {
    $("#loader").remove();
    document.body.classList.remove("is-loading");
    if ($(`#page-${deepLink}`)) openPage(deepLink, false, true);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(".door", { yPercent: 8 }, { yPercent: 0, duration: 1.4, stagger: 0.08 }, 0)
      .fromTo(".doors__cue", { scale: 0 }, { scale: 1, duration: 0.9 }, 0.6);
    return tl;
  }

  (function runLoader() {
    const num = $("#loaderNum"), bar = $("#loaderBar"), count = { v: 1 }, target = MIXES[0].n;
    const assets = document.fonts ? document.fonts.ready : Promise.resolve();
    const counting = new Promise((resolve) => gsap.to(count, {
      v: target, duration: reduced || skipIntro ? 0.05 : 2.1, ease: "power2.inOut", onComplete: resolve,
      onUpdate: () => { num.textContent = String(Math.round(count.v)).padStart(3, "0"); bar.style.width = (count.v / target) * 100 + "%"; }
    }));
    let revealed = false, ready = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      gsap.timeline()
        .to("#loader", { clipPath: "inset(0% 0% 100% 0%)", duration: reduced ? 0.01 : 1.1, ease: "expo.inOut" })
        .add(heroIntro(), reduced ? 0 : 0.4)
        .add(() => {
          $("#loader").remove();
          document.body.classList.remove("is-loading");
          if (lenis) lenis.start();
          // Measure in page order so the pinned rails push everything below them down
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          warmImages();
          if ($(`#page-${deepLink}`)) openPage(deepLink, false);
        }, reduced ? 0 : 0.8);
    };
    if (skipIntro) Player.suppress = true;
    Player.prime();
    Player.onConfirmed = () => { if (ready) reveal(); };
    $("#enterSound").addEventListener("click", () => { Player.start(); reveal(); }, { once: true });
    $("#enterQuiet").addEventListener("click", () => { Player.hush(); reveal(); }, { once: true });
    Promise.all([assets, counting]).then(() => {
      ready = true;
      if (skipIntro || Player.confirmed) { reveal(); return; }
      $("#loaderStatus").textContent = `Mix ${MIXES[0].n} is cued`;
      $("#loader").classList.add("is-ready");
      $("#enterSound").focus({ preventScroll: true });
    });
  })();

  // Load every section's images in the background while the visitor is still on the hero,
  // in page order, so nothing pops in halfway through an animation
  function warmImages() {
    const queue = $$("main img[loading='lazy']").filter((img) => !img.complete);
    const next = () => {
      queue.splice(0, 4).forEach((img) => { img.loading = "eager"; });
      if (queue.length) (window.requestIdleCallback || ((f) => setTimeout(f, 120)))(next, { timeout: 400 });
    };
    next();
    const v = $(".note__video"); if (v) v.preload = "auto";
  }

  /* ---------- Hero: the doors slideshow ---------- */
  const doorL = $("#doorL"), doorR = $("#doorR");
  let doorStep = 0, doorsOpen = false;
  const showDoor = (el, i) => $$("img", el).forEach((img, k) => img.classList.toggle("is-on", k === i % DOORS.length));
  setInterval(() => {
    if (reduced || doorsOpen || document.hidden) return;
    doorStep++;
    showDoor(doorL, doorStep);
    showDoor(doorR, doorStep + 1);
  }, 2200);

  /* ---------- Hero: doors slide apart, PH rises behind them ---------- */
  const heroTypes = $$(".hero__type");
  const Ps = $$(".hero__p"), Hs = $$(".hero__h");
  const heroPH = $(".hero__ph");
  gsap.set(heroPH, { xPercent: -50, x: 0, transformOrigin: "50% 100%" });
  gsap.set(heroTypes, { transformOrigin: "50% 100%" });
  const stretch = { v: 125 };
  const setStretch = () => heroTypes.forEach((t) => { t.style.fontStretch = stretch.v + "%"; });
  if (reduced) {
    gsap.set(".door", { display: "none" });
    gsap.set(".doors__cue", { display: "none" });
    stretch.v = 74; setStretch();
  } else {
    setStretch();
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero", start: "top top", end: () => "+=" + innerHeight * 1.1, scrub: true, invalidateOnRefresh: true,
        onUpdate: (st) => { doorsOpen = st.progress > 0.98; }
      }
    })
      .to(doorL, { xPercent: -101, ease: "power1.inOut" }, 0)
      .to(doorR, { xPercent: 101, ease: "power1.inOut" }, 0)
      .to(".doors__cue", { opacity: 0, duration: 0.15 }, 0)
      .fromTo(heroTypes, { yPercent: 38 }, { yPercent: 4, ease: "power2.out" }, 0.05)
      .to(stretch, { v: 74, ease: "power2.inOut", onUpdate: setStretch }, 0.05)
      .fromTo(".hero__type:not(.hero__type--line)", { color: "#4a2418" }, { color: "#ff4f1f", ease: "none" }, 0.1)
      .fromTo(".hero__type--line", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.6)
      .fromTo(heroPH, { scale: 0.86, yPercent: 8 }, { scale: 1, yPercent: 0, ease: "power2.out" }, 0.1)
      .fromTo([".hero__intro", ".hero__aside", ".nowcard"], { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, ease: "none" }, 0.4);
  }

  // The photo floats on its own: a slow lift, a sway from the feet and a drift, on different periods
  if (!reduced) {
    const loop = [
      gsap.fromTo(heroPH, { y: 0 }, { y: -18, duration: 3.1, ease: "sine.inOut", yoyo: true, repeat: -1 }),
      gsap.fromTo(heroPH, { rotation: -1.1 }, { rotation: 1.1, duration: 4.4, ease: "sine.inOut", yoyo: true, repeat: -1 }),
      gsap.fromTo(heroPH, { x: -10 }, { x: 10, duration: 5.6, ease: "sine.inOut", yoyo: true, repeat: -1 })
    ];
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top",
      onLeave: () => loop.forEach((t) => t.pause()),
      onEnterBack: () => loop.forEach((t) => t.resume())
    });
  }

  // The letters follow the mouse
  if (finePointer && !reduced) {
    const pX = Ps.map((el) => gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }));
    const hX = Hs.map((el) => gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }));
    $(".hero").addEventListener("mousemove", (e) => {
      const mx = e.clientX / innerWidth - 0.5;
      pX.forEach((f) => f(mx * -36));
      hX.forEach((f) => f(mx * 36));
    });
  }

  // While a mix plays, PH breathes on the beat
  const pulseTargets = heroTypes.concat($$(".outro__line span"));
  const typeSX = gsap.quickSetter(pulseTargets, "scaleX"), typeSY = gsap.quickSetter(pulseTargets, "scaleY");
  let pulsing = false, beat0 = 0;
  gsap.ticker.add(() => {
    if (reduced || !Player.playing) { if (pulsing) { typeSX(1); typeSY(1); pulsing = false; } return; }
    if (!pulsing) { beat0 = performance.now(); pulsing = true; }
    const k = Math.pow(1 - ((((performance.now() - beat0) / 1000) * (Player.mix.bpm / 60)) % 1), 4);
    typeSX(1 + k * 0.03);
    typeSY(1 + k * 0.018);
  });

  /* ==================================================================
     Motion. Each move says something about the section it lives in.
     ================================================================== */

  // Split a heading into words and letters so it can squeeze into place, like the PH in the hero
  function splitTitle(el) {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ");
    return $$(".ch", el);
  }
  function splitWords(el, cls) {
    const walk = (node) => Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const sp = document.createElement("span"); sp.className = cls; sp.textContent = part; frag.appendChild(sp);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) walk(child);
    });
    walk(el);
    return $$("." + cls, el);
  }
  // Departure-board style text scramble for city names
  const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function scramble(el) {
    const final = el.dataset.final || (el.dataset.final = el.textContent);
    if (reduced) { el.textContent = final; return; }
    const t0 = performance.now(), dur = 420;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const settled = Math.floor(p * final.length);
      el.textContent = final.split("").map((c, i) => (i < settled || c === " " || c === ",") ? c : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]).join("");
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    })(t0);
  }

  // Which track you're on, shown in the nav
  const navTrack = $("#navTrack");
  function setTrack(code, name) {
    if (navTrack.dataset.code === code) return;
    navTrack.dataset.code = code;
    const html = `<b>${name}</b>`;
    if (reduced) { navTrack.innerHTML = html; return; }
    gsap.to(navTrack.children, { yPercent: -120, opacity: 0, duration: 0.2, ease: "power2.in", overwrite: true, onComplete: () => {
      navTrack.innerHTML = html;
      gsap.fromTo(navTrack.children, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out", stagger: 0.05 });
    } });
  }
  let homeTrack = ["00", "Intro"];
  [[".hero", "00", "Intro"], ...$$("[data-track]").map((el) => [el, el.dataset.track, el.dataset.name]), [".flip", "A/B", "Flip the record"], [".outro", "OUT", "Play for the people"]]
    .forEach(([el, code, name]) => ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (st) => { if (!st.isActive) return; homeTrack = [code, name]; if (!current) setTrack(code, name); } }));
  const PAGE_TRACK = { mixes: ["A3", "Mixes"], gigs: ["A4", "Gigs"], photobook: ["B2", "The camera roll"], press: ["B4", "Press kit"], about: ["PH", "About"] };
  onPageTrack = (name) => (name && PAGE_TRACK[name] ? setTrack(...PAGE_TRACK[name]) : setTrack(...homeTrack));
  if (current && PAGE_TRACK[current]) setTrack(...PAGE_TRACK[current]);

  // Section titles squeeze in letter by letter
  $$("[data-split]").forEach((el) => {
    const chars = splitTitle(el);
    if (reduced) return;
    const w = { v: 125 };
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%" } })
      .fromTo(chars, { yPercent: 115, rotate: 7, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.55, ease: "expo.out", stagger: 0.012 }, 0)
      .fromTo(w, { v: 125 }, { v: 62, duration: 0.65, ease: "expo.out", onUpdate: () => chars.forEach((c) => { c.style.fontStretch = w.v + "%"; }) }, 0);
  });
  if (!reduced) {
    $$(".sh__aside").forEach((aside) => gsap.from(aside, { y: 24, opacity: 0, duration: 0.6, ease: "expo.out", scrollTrigger: { trigger: aside.closest(".sh"), start: "top 100%" } }));
    gsap.from(".sh__title--logo img", { yPercent: 40, opacity: 0, duration: 0.7, ease: "expo.out", scrollTrigger: { trigger: ".eds .sh", start: "top 100%" } });
  }

  // A1: the boarding pass prints out, the barcode runs, the words come up as you read
  const passWords = splitWords($(".pass__text"), "pw");
  if (reduced) { passWords.forEach((w) => { w.style.opacity = 1; }); }
  else {
    gsap.timeline({ scrollTrigger: { trigger: "#pass", start: "top 100%" } })
      .fromTo("#pass", { clipPath: "inset(0% 0% 100% 0%)", y: 70, rotate: -3 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, rotate: -0.8, ease: "expo.out", duration: 0.75 }, 0)
      .fromTo(".pass__code", { scaleX: 0 }, { scaleX: 1, ease: "expo.out", duration: 0.5 }, 0.35)
      .to(passWords, { opacity: 1, stagger: { amount: 0.3 }, ease: "none", duration: 0.15 }, 0.1);
  }

  // A2: the record slides out of the sleeve, turns at 33 rpm while playing, and scratches with your scroll
  const grooves = $("#musicGrooves");
  const setGroove = gsap.quickSetter(grooves, "rotation", "deg");
  let grooveRot = 0, grooveY = scrollY;
  gsap.ticker.add((t, dt) => {
    const v = scrollY - grooveY; grooveY = scrollY;
    if (reduced) return;
    grooveRot += (Player.playing ? 0.2 * dt : 0) + v * 0.55;
    setGroove(grooveRot % 360);
  });
  if (!reduced) gsap.fromTo("#musicDisc", { xPercent: 0, rotate: -10 }, { xPercent: 46, rotate: 0, ease: "expo.out", duration: 0.9, scrollTrigger: { trigger: ".music__grid", start: "top 100%" } });

  // A3 and B1: the crate and the editions scroll sideways while the page holds still
  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", () => {
    if (reduced) return;
    const crate = $("#crateTrack");
    const cdist = () => Math.max(0, crate.scrollWidth - innerWidth);
    const arts = () => $$(".sleeve__art", crate);
    let settle;
    gsap.to(crate, {
      x: () => -cdist(), ease: "none",
      scrollTrigger: {
        trigger: ".mixes", start: "top top", end: () => "+=" + cdist(), pin: ".mixes__pin", scrub: true, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
        onUpdate: (st) => {
          // flicking through the crate tilts the sleeves
          const tilt = gsap.utils.clamp(-28, 28, st.getVelocity() / -90);
          gsap.to(arts(), { rotateY: tilt, duration: 0.4, ease: "power3.out", overwrite: true });
          if (settle) settle.kill();
          settle = gsap.delayedCall(0.15, () => gsap.to(arts(), { rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", overwrite: true }));
        }
      }
    });
    const eds = $("#edsTrack");
    const edist = () => Math.max(0, eds.scrollWidth - innerWidth);
    const edsTween = gsap.to(eds, { x: () => -edist(), ease: "none", scrollTrigger: { trigger: ".eds", start: "top top", end: () => "+=" + edist(), pin: ".eds__pin", scrub: true, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1 } });
    $$(".ed__img img", eds).forEach((img) => gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: img.closest(".ed"), containerAnimation: edsTween, start: "left right", end: "right left", scrub: true } }));
  });

  if (!reduced) {
    // A4: the poster flips up off the table, then the board scrambles the cities in
    gsap.fromTo("#poster", { rotateX: 62, y: 90, opacity: 0.2, transformPerspective: 1200 }, { rotateX: 0, y: 0, opacity: 1, ease: "expo.out", duration: 0.85, scrollTrigger: { trigger: ".gigs__next", start: "top 100%" } });
    let gigRows;
    gigRowsIn = () => {
      if (gigRows) { gigRows.scrollTrigger.kill(); gigRows.kill(); }
      if (!$(".gig")) return;
      gigRows = gsap.from(".gig", { x: 60, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: "#gigsList", start: "top 100%", onEnter: () => $$("[data-scramble]").forEach((el, i) => setTimeout(() => scramble(el), i * 55)) } });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    // The flip: the record turns over from Side A to Side B, and night turns to day
    gsap.timeline({ scrollTrigger: { trigger: ".flip", start: "top top", end: "bottom bottom", scrub: true } })
      .fromTo("#flipDisc", { rotateY: 0, rotateZ: -30, scale: 0.62 }, { rotateY: 180, rotateZ: 300, scale: 1, ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(".flip__bg", { scale: 1.18 }, { scale: 1, ease: "none", duration: 1 }, 0)
      .to(".flip__line--a", { yPercent: -80, opacity: 0, ease: "power2.in", duration: 0.3 }, 0.18)
      .to(".flip__day", { opacity: 1, ease: "none", duration: 0.3 }, 0.55)
      .fromTo(".flip__line--b", { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.25 }, 0.72);

    // B2: the prints start as a pile in the middle and deal themselves out into a grid
    const grid = $("#rollGrid");
    const seed = [-16, 11, -7, 18, -12, 6, -19, 9, -4];
    const deal = gsap.timeline({ scrollTrigger: { trigger: grid, start: "top 100%", invalidateOnRefresh: true } });
    $$(".snap", grid).forEach((p, i) => {
      deal.fromTo(p, {
        x: () => grid.clientWidth / 2 - (p.offsetLeft + p.offsetWidth / 2),
        y: () => grid.clientHeight / 2 - (p.offsetTop + p.offsetHeight / 2),
        rotation: seed[i % seed.length], scale: 0.82
      }, { x: 0, y: 0, rotation: i % 2 ? 1.2 : -1.2, scale: 1, ease: "expo.out", duration: 0.55 }, (8 - i) * 0.018);
    });

    // B3: cards wipe open like a shutter
    gsap.fromTo(".card__img", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".lately__grid", start: "top 100%" } });
    gsap.fromTo(".card__img img", { scale: 1.3 }, { scale: 1, duration: 0.75, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".lately__grid", start: "top 100%" } });
    gsap.from(".card__tag, .card__title", { y: 20, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: ".lately__grid", start: "top 100%" } });

    // B4: the portraits fire like a camera flash, one after the other
    const kitItems = $$(".kit__item");
    gsap.timeline({ scrollTrigger: { trigger: "#kitRow", start: "top 100%" } })
      .set(kitItems, { "--flash": 1 })
      .to(kitItems, { "--flash": 0, duration: 0.3, ease: "power2.out", stagger: 0.06 })
      .fromTo($$(".kit__item img"), { scale: 1.16 }, { scale: 1, duration: 0.6, ease: "expo.out", stagger: 0.06 }, 0);
    gsap.from(".kit__facts li", { y: 30, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".kit__facts", start: "top 100%" } });

    // B5 and the outro
    gsap.from(".contact__big", { yPercent: 60, opacity: 0, duration: 0.7, ease: "expo.out", scrollTrigger: { trigger: ".contact__grid", start: "top 100%" } });
    gsap.fromTo(".outro__line span:first-child", { xPercent: -18 }, { xPercent: 0, ease: "expo.out", duration: 0.9, scrollTrigger: { trigger: ".outro", start: "top 100%" } });
    gsap.fromTo(".outro__line span:last-child", { xPercent: 18 }, { xPercent: 0, ease: "expo.out", duration: 0.9, scrollTrigger: { trigger: ".outro", start: "top 100%" } });
  }
  ScrollTrigger.create({ trigger: ".outro", start: "top 60%", end: "bottom top", toggleClass: { targets: document.body, className: "on-orange" } });

  // Background video only runs while it is on screen
  const vid = $(".note__video");
  new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting && !reduced) vid.play().catch(() => {}); else vid.pause(); }), { threshold: 0.1 }).observe(vid);

  /* ---------- Cursor: a tag that trails the pointer and rolls through greetings ---------- */
  if (finePointer) {
    const cur = $("#cursor"), tag = $(".cursor__tag", cur), roll = $("#cursorRoll"), label = $("#cursorLabel");
    const WORDS = ["Hello", "Molo", "Sawubona", "Dumela", "Howzit"];
    roll.innerHTML = WORDS.concat(WORDS[0]).map((w) => `<span>${w}</span>`).join("");
    const words = $$("span", roll);
    const PAD = 20, ROW = 26;
    const fit = (el) => { tag.style.width = `${Math.ceil(el.offsetWidth) + PAD}px`; };
    let wi = 0, mode = "hello", seen = false;
    fit(words[0]);

    const cx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3.out" });
    const cy = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      if (!seen) { seen = true; gsap.set(cur, { x: e.clientX, y: e.clientY }); if (mode !== "off") cur.classList.remove("is-off"); }
      cx(e.clientX); cy(e.clientY);
    });
    document.documentElement.addEventListener("mouseleave", () => cur.classList.add("is-off"));
    document.documentElement.addEventListener("mouseenter", () => { if (seen && mode !== "off") cur.classList.remove("is-off"); });

    // Roll to the next greeting every couple of seconds
    if (!reduced) setInterval(() => {
      if (mode !== "hello" || document.hidden) return;
      // If a throttled frame skipped the last reset, wrap here instead of running off the list
      if (wi >= WORDS.length) { wi = 0; gsap.set(roll, { y: 0 }); }
      wi++;
      fit(words[wi]);
      gsap.to(roll, { y: -wi * ROW, duration: 0.6, ease: "expo.out", onComplete: () => { if (wi === WORDS.length) { wi = 0; gsap.set(roll, { y: 0 }); } } });
    }, 1800);

    const setMode = (m, text) => {
      mode = m;
      cur.classList.toggle("is-off", m === "off" || !seen);
      cur.classList.toggle("is-label", m === "label");
      if (m === "label") { label.textContent = text; fit(label); }
      else if (m === "hello") fit(words[wi]);
    };
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      const s = t.closest(".sleeve");
      if (s) { const n = +s.dataset.mix; setMode("label", Player.playing && Player.mix.n === n ? "Pause" : `Play ${n}`); return; }
      if (t.closest("[data-light]")) { setMode("label", "View"); return; }
      if (t.closest("a, button, input, textarea, select, label, .deck__bar, .lightbox")) { setMode("off"); return; }
      setMode("hello");
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());

  // Photos and mixes that land late change the page height. Re-measure when it settles so
  // every reveal still fires the moment its section comes into view, not a screen later
  let measuredH = 0, remeasure;
  new ResizeObserver(() => {
    if (Math.abs(document.body.scrollHeight - measuredH) < 2) return;
    clearTimeout(remeasure);
    remeasure = setTimeout(() => { ScrollTrigger.refresh(); measuredH = document.body.scrollHeight; }, 150);
  }).observe(document.body);
})();
