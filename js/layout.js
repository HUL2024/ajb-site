// Page-specific styles (news cards, gallery, staff, principal) load on every page.
const pagesCss = document.createElement("link");
pagesCss.rel = "stylesheet";
pagesCss.href = "css/pages.css";
document.head.append(pagesCss);

// Loads the shared header, footer and principal message into every page that has a slot for them.
// Needs a web server (Live Server in VS Code, or any web host) because it uses fetch().
(async function () {
  async function load(id, url) {
    const target = document.getElementById(id);
    if (!target) return;
    try { target.innerHTML = await (await fetch(url)).text(); }
    catch (e) { target.textContent = "Open this site with Live Server or a web host to load the shared header/footer."; }
  }
  // Home page: put the principal's message after the feature strip, unless <div id="principal"> already exists.
  const feat = document.querySelector(".feat");
  if (feat && !document.getElementById("principal")) {
    const slot = document.createElement("div");
    slot.id = "principal";
    feat.after(slot);
  }
  await Promise.all([
    load("site-header", "partials/header.html"),
    load("site-footer", "partials/footer.html"),
    load("principal", "partials/principal.html")
  ]);
  const page = document.body.dataset.nav || location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(a => { if (a.getAttribute("href") === page) a.classList.add("on"); });
  // Phone menu: the three-line button opens a slide-in menu; choosing a page, the X, the dark area or Esc closes it.
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.getElementById("site-nav");
  if (menuBtn && menu) {
    const setOpen = open => {
      document.body.classList.toggle("nav-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", () => setOpen(!document.body.classList.contains("nav-open")));
    document.querySelector(".nav-overlay").addEventListener("click", () => setOpen(false));
    menu.addEventListener("click", e => { if (e.target.closest("a") || e.target.closest(".nav-close")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) setOpen(false); });
    window.addEventListener("pageshow", () => setOpen(false)); // after the Back button
  }
})();
