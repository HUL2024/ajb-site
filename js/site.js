// Fills news, story, gallery, staff, academics level photos and documents (permit) on any page that has the matching element.
const GALLERY_CATEGORIES = ["School Events", "Academic Activities", "Sports Events", "Staff", "Campus & Facilities", "Other"];
const STAFF_GROUPS = ["Administration", "Teachers", "Support Staff"];
const PREFETCH = true; // load other pages' photos quietly in the background (set false to turn off)
const PAGE_SIZE = 10; // gallery photos shown at first and per "See more" click

// Start talking to Google early so photos and data arrive sooner.
["https://script.google.com", "https://drive.google.com", "https://lh3.googleusercontent.com"].forEach(u => {
  const l = document.createElement("link");
  l.rel = "preconnect"; l.href = u; if (u.indexOf("script") > 0) l.crossOrigin = "";
  document.head.append(l);
});

function el(tag, props = {}, kids = []) {
  const n = document.createElement(tag);
  Object.assign(n, props);
  kids.forEach(k => n.append(k));
  return n;
}

// First two sentences, max ~220 characters.
function excerpt(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const two = sentences.slice(0, 2).join(" ").trim();
  return two.length > 220 ? two.slice(0, 217).trimEnd() + "…" : two;
}

/* ---------- News ---------- */
function renderNews(list) {
  const box = document.getElementById("news-list");
  if (!box) return;
  const full = box.classList.contains("news-full");
  box.replaceChildren();
  if (!list.length) { box.append(el("p", { textContent: "No news yet." })); return; }
  list.slice(0, +box.dataset.limit || 20).forEach((n, i) => {
    const img = n.photo ? el("img", { src: n.photo, alt: "", loading: "lazy" }) : el("i");
    const body = [el("b", { className: "t", textContent: n.title }), el("span", { textContent: n.date })];
    if (full) body.push(
      el("p", { className: "ex", textContent: excerpt(n.summary) }),
      el("em", { className: "more", textContent: "Read more →" })
    );
    const id = n.id !== undefined ? n.id : i + 1;
    box.append(el("a", { className: "item", href: "story.html?id=" + encodeURIComponent(id) }, [img, el("div", {}, body)]));
  });
}

function renderStory(list) {
  const box = document.getElementById("story");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  const n = list.find((x, i) => String(x.id !== undefined ? x.id : i + 1) === id);
  box.replaceChildren();
  if (!n) { box.append(el("p", { textContent: "Story not found." })); return; }
  document.title = n.title + " | AJB Leaders Academy";
  if (n.photo) box.append(el("img", { className: "story-img", src: n.photo, alt: "" }));
  box.append(
    el("h2", { textContent: n.title }),
    el("p", { className: "date", textContent: n.date }),
    el("p", { className: "body", textContent: n.summary || "" })
  );
}

/* ---------- Gallery ---------- */
function photoCard(p, full) {
  const img = el("img", { src: p.url, alt: p.caption || "School photo", loading: "lazy", decoding: "async" });
  const link = el("a", { href: full ? (p.full || p.url) : "gallery.html", target: full ? "_blank" : "_self", rel: "noopener" }, [img]);
  const card = el("figure", {}, [link]);
  const meta = [p.category, p.date].filter(Boolean).join(" · ");
  if (p.caption || (full && meta)) {
    const cap = el("figcaption");
    if (p.caption) cap.append(el("b", { textContent: p.caption }));
    if (full && meta) cap.append(el("span", { textContent: meta }));
    card.append(cap);
  }
  return card;
}

function renderGallery(list) {
  const box = document.getElementById("gallery-list");
  if (!box) return;
  const full = box.classList.contains("gallery-full");
  list = list.map(p => ({ ...p, category: p.category || "Other" }));

  if (!full) { // home page: newest few photos
    box.replaceChildren();
    if (!list.length) { for (let i = 0; i < 4; i++) box.append(el("i")); return; }
    list.slice(0, +box.dataset.limit || 4).forEach(p => box.append(photoCard(p, false)));
    return;
  }

  // Gallery page: category filters + "See more"
  const filters = document.getElementById("gallery-filters");
  const moreBtn = document.getElementById("gallery-more");
  const present = new Set(list.map(p => p.category));
  const cats = ["All", ...GALLERY_CATEGORIES.filter(c => present.has(c)), ...[...present].filter(c => !GALLERY_CATEGORIES.includes(c))];
  let current = "All", shown = PAGE_SIZE;

  function draw() {
    const items = current === "All" ? list : list.filter(p => p.category === current);
    box.replaceChildren();
    if (!items.length) box.append(el("p", { textContent: "No photos yet." }));
    items.slice(0, shown).forEach(p => box.append(photoCard(p, true)));
    const left = items.length - shown;
    if (moreBtn) {
      moreBtn.hidden = left <= 0;
      moreBtn.textContent = "See more (" + Math.min(left, PAGE_SIZE) + " more)";
    }
  }

  if (filters) {
    filters.replaceChildren();
    cats.forEach(c => {
      const b = el("button", { type: "button", textContent: c, className: c === current ? "on" : "" });
      b.setAttribute("aria-pressed", c === current);
      b.addEventListener("click", () => {
        current = c; shown = PAGE_SIZE;
        filters.querySelectorAll("button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
        draw();
      });
      filters.append(b);
    });
  }
  if (moreBtn) moreBtn.onclick = () => { shown += PAGE_SIZE; draw(); };
  draw();
}

/* ---------- Staff ---------- */
function initials(name) {
  return String(name || "").replace(/^(mr|mrs|ms|miss|dr)\.?\s+/i, "").split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
}

function renderStaff(list) {
  const box = document.getElementById("staff-list");
  if (!box) return;
  box.replaceChildren();
  if (!list.length) { box.append(el("p", { textContent: "Staff list coming soon." })); return; }
  const groups = {};
  const order = [...STAFF_GROUPS];
  list.forEach(s => {
    const g = s.group || "Staff";
    (groups[g] = groups[g] || []).push(s);
    if (!order.includes(g)) order.push(g);
  });
  order.filter(g => groups[g]).forEach(g => {
    box.append(el("h2", { textContent: g }));
    const grid = el("div", { className: "staff-grid" });
    groups[g].forEach(s => {
      const pic = s.photo ? el("img", { src: s.photo, alt: s.name, loading: "lazy" }) : el("div", { className: "initials", textContent: initials(s.name) });
      const card = el("div", { className: "staff-card" }, [pic, el("b", { textContent: s.name })]);
      if (s.role) card.append(el("span", { textContent: s.role }));
      if (s.bio) card.append(el("p", { textContent: s.bio }));
      grid.append(card);
    });
    box.append(grid);
  });
}

/* ---------- Academics level photos ---------- */
// Sheet tab "Academics": Level | Photo | Caption | Show.
// The page shows grey loading boxes first. If the sheet has no photos for the level, 4 default school photos are used.
const LEVEL_FALLBACK = ["images/student-speaking.jpg", "images/kids-standing.jpg", "images/hero.jpg", "images/kids-standing.jpg"];

function levelKey(name) {
  const k = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return k.indexOf("early-childhood") === 0 ? "ece" : k;
}

function levelFigure(src, alt, full, caption) {
  const img = el("img", { alt, decoding: "async" });
  img.addEventListener("load", () => img.classList.add("in"));
  img.addEventListener("error", () => {
    if (img.dataset.fb) return;
    img.dataset.fb = "1";
    img.src = LEVEL_FALLBACK[0];
  });
  img.src = src;
  if (img.complete && img.naturalWidth) img.classList.add("in");
  const link = el("a", full ? { href: full, target: "_blank", rel: "noopener" } : {}, [img]);
  const card = el("figure", {}, [link]);
  if (caption) card.append(el("figcaption", { textContent: caption }));
  return card;
}

function renderLevelPhotos(list) {
  const box = document.getElementById("level-photos");
  if (!box) return;
  const mine = list.filter(p => p.url && levelKey(p.level) === box.dataset.level).slice(0, 8);
  box.replaceChildren();
  if (mine.length) {
    mine.forEach(p => box.append(levelFigure(p.url, p.caption || "Students at AJB Leaders Academy", p.full || p.url, p.caption)));
  } else {
    LEVEL_FALLBACK.forEach(src => box.append(levelFigure(src, "Students at AJB Leaders Academy", "", "")));
  }
}

/* ---------- Documents (e.g. the school operational permit) ---------- */
// Sheet tab "Documents": Title | File | Details | Valid Until | Show.
// A page asks for one with <section data-doc="School Operational Permit" data-heading="..." hidden></section>.
function renderDocuments(list) {
  document.querySelectorAll("[data-doc]").forEach(box => {
    const want = box.dataset.doc.trim().toLowerCase();
    const d = list.find(x => String(x.title).trim().toLowerCase() === want);
    box.replaceChildren();
    if (!d) { box.hidden = true; return; }
    if (box.dataset.heading) box.append(el("h2", { textContent: box.dataset.heading }));
    const kids = [];
    if (d.thumb) {
      const img = el("img", { src: d.thumb, alt: d.title, loading: "lazy" });
      const thumb = el("a", { className: "doc-thumb", href: d.link, target: "_blank", rel: "noopener" }, [img]);
      img.addEventListener("error", () => thumb.remove());
      kids.push(thumb);
    }
    kids.push(el("div", { className: "doc-text" }, [
      el("h3", { textContent: d.title }),
      d.details ? el("p", { textContent: d.details }) : null,
      d.valid ? el("p", { className: "doc-valid", textContent: "Valid until " + d.valid }) : null,
      el("a", { className: "btn gold", href: d.link, target: "_blank", rel: "noopener", textContent: "View document →" })
    ].filter(Boolean)));
    box.append(el("div", { className: "doc-box" }, kids));
    box.hidden = false;
  });
}

/* ---------- Speed: remember the data and warm up photos in the background ---------- */
const CACHE_KEY = "ajb-site-data-v1:" + (typeof API_URL !== "undefined" ? API_URL : "");

function readCache() {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && c.data ? c : null; }
  catch (e) { return null; }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); }
  catch (e) { /* storage full or blocked: skip */ }
}

// Quietly loads the first photos of the other pages so they are ready before someone opens them.
function warmImages(data) {
  const c = navigator.connection || {};
  if (!PREFETCH || c.saveData || /(^|-)2g$/.test(c.effectiveType || "")) return;
  const urls = [], count = {};
  (data.academics || []).forEach(p => { const k = levelKey(p.level); count[k] = (count[k] || 0) + 1; if (count[k] <= 4) urls.push(p.url); });
  (data.gallery || []).slice(0, PAGE_SIZE).forEach(p => urls.push(p.url));
  (data.news || []).slice(0, 4).forEach(n => urls.push(n.photo));
  (data.staff || []).slice(0, 8).forEach(m => urls.push(m.photo));
  (data.documents || []).forEach(d => urls.push(d.thumb));
  const queue = [...new Set(urls.filter(Boolean))];
  const next = () => {
    const src = queue.shift();
    if (!src) return;
    const im = new Image();
    im.decoding = "async";
    im.onload = im.onerror = () => setTimeout(next, 150);
    im.src = src;
  };
  next(); next(); // two at a time, so the page itself is never slowed down
}

// Shown when the school data could not be loaded. Never shows made-up content.
function renderUnavailable(text) {
  const msg = text || "We could not load this right now. Please check your connection and try again.";
  ["news-list", "gallery-list", "staff-list", "story"].forEach(id => {
    const box = document.getElementById(id);
    if (!box) return;
    const retry = el("button", { type: "button", className: "btn navy", textContent: "Try again" });
    retry.addEventListener("click", () => location.reload());
    box.replaceChildren(el("p", { textContent: msg }), retry);
  });
  renderLevelPhotos([]);
  renderDocuments([]);
}

function renderAll(data) {
  const news = data.news || [];
  renderNews(news);
  renderStory(news);
  renderGallery(data.gallery || []);
  renderStaff(data.staff || []);
  renderLevelPhotos(data.academics || []);
  renderDocuments(data.documents || []);
}

(async function () {
  if (typeof API_URL === "undefined" || !API_URL) { renderUnavailable("This section is not connected to the school data yet."); return; }
  const cached = readCache();
  if (cached) renderAll(cached.data); // instant: shows what we saw last time
  let data = cached ? cached.data : null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const fresh = await (await fetch(API_URL, { signal: ctl.signal })).json();
    clearTimeout(timer);
    if (!cached || JSON.stringify(cached.data) !== JSON.stringify(fresh)) { writeCache(fresh); renderAll(fresh); }
    data = fresh;
  } catch (e) {
    console.error("Could not load site data", e);
    if (!cached) renderUnavailable();
  }
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
  const go = () => idle(() => warmImages(data));
  if (document.readyState === "complete") go(); else window.addEventListener("load", go);
})();

// "Copy" buttons (for example next to the school email address).
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const text = btn.dataset.copy;
  const done = () => { const old = btn.textContent; btn.textContent = "Copied ✓"; setTimeout(() => { btn.textContent = old; }, 1800); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => window.prompt("Copy this email address:", text));
  else window.prompt("Copy this email address:", text);
});

// Contact form: sends the message to the Google Sheet (tab "Messages") through the same Apps Script link.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const note = form.querySelector(".form-note");
    const btn = form.querySelector("button");
    const d = Object.fromEntries(new FormData(form));
    if (!String(d.name).trim() || !String(d.contact).trim() || String(d.message).trim().length < 5) {
      note.textContent = "Please fill in your name, how we can reach you, and your message.";
      return;
    }
    if (typeof API_URL === "undefined" || !API_URL) {
      note.textContent = "The message form is not connected yet. Please use WhatsApp or email.";
      return;
    }
    btn.disabled = true;
    note.textContent = "Sending…";
    try {
      await fetch(API_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) });
      form.reset();
      note.textContent = "Thank you! Your message has been sent.";
    } catch (err) {
      note.textContent = "Sorry, we could not send your message. Please use WhatsApp or email.";
    }
    btn.disabled = false;
  });
})();
