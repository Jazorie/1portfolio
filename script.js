/* =========================================================
   Simple hash router:  #/  #/about  #/behind-the-scenes
                        #/work/:slug  (case studies)
   In-page scrolling uses data-scroll="id" so it doesn't
   clash with hash routing.
   ========================================================= */

// ---- Project data (edit / add your projects here) ----
const projects = [
  { slug: "project-one",   title: "Project One",   tags: ["tag", "tag"], ready: true,  featured: true, image: "images/project-one.png", popup: true },
  { slug: "project-two",   title: "Project Two",   tags: ["tag", "tag"], ready: false },
  { slug: "project-three", title: "Project Three", tags: ["tag", "tag"], ready: true,  featured: true },
  { slug: "project-four",  title: "Project Four",  tags: ["tag", "tag"], ready: false },
];

// Show the project's image if it has one, otherwise a placeholder box
const shot = (p, label, style = "") =>
  p.image
    ? `<img class="shot" src="${p.image}" alt="${p.title} screenshot"${p.popup ? ` data-popup="${p.slug}"` : ""}${style ? ` style="${style}"` : ""} />`
    : `<div class="placeholder"${style ? ` style="${style}"` : ""}>${label}</div>`;

const caseSections = ["context", "problem", "process", "solution", "outcome"];

// ---- Page templates ----
const pages = {
  "/": () => `

    <section id="work">
      <h2>selected work</h2>
      <div class="project-list">
        ${projects.map(p => `
          <a class="project-row ${p.ready ? "" : "disabled"}" href="${p.ready ? `#/work/${p.slug}` : "#"}">
            ${shot(p, "thumbnail")}
            <div>
              <h3>${p.title}</h3>
              <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
            </div>
            <span>${p.ready ? "Case study ↗" : "Coming soon"}</span>
          </a>`).join("")}
      </div>
    </section>

    <section id="featured">
      <p class="eyebrow">planet 01</p>
      <h2>Featured.</h2>
      <div class="featured">
        ${projects.filter(p => p.featured).map(p => `
          <a class="feature-card" href="#/work/${p.slug}">
            ${shot(p, "large image")}
            <div>
              <h3>${p.title}</h3>
              <p>[summary]</p>
              <dl class="meta" style="grid-template-columns:repeat(3,1fr)">
                <div><dt>role</dt><dd>—</dd></div>
                <div><dt>team</dt><dd>—</dd></div>
                <div><dt>timeline</dt><dd>—</dd></div>
              </dl>
            </div>
          </a>`).join("")}
      </div>
    </section>

    <section id="behind">
      <a class="feature-card" href="#/behind-the-scenes">
        <div class="placeholder">image</div>
        <div><p class="eyebrow">behind the scenes</p><h3>How I built this</h3></div>
      </a>
    </section>

    <section id="next">
      <p class="eyebrow">next stop ↓</p>
      <div class="next-stop">
        <a href="#/about">about →</a>
      </div>
    </section>`,

  "/about": () => `
    <section>
      <h2>about</h2>
      <div class="placeholder">photo</div>
      <p style="margin-top:20px">[About content]</p>
    </section>
    <section>
      <h2>experience</h2>
      <p>[Experience list]</p>
    </section>`,

  "/behind-the-scenes": () => `
    <a class="back-link" href="#/">← back home</a>
    <section>
      <h2>how I built this</h2>
      <p>[Process write-up]</p>
    </section>`,

  "/coming-soon": () => `
    <section>
      <h2>coming soon</h2>
      <p>This project is still in progress.</p>
      <p style="margin-top:16px"><a href="#/" data-scroll="work">← all work</a></p>
    </section>`,
};

function caseStudy(slug) {
  const idx = projects.findIndex(p => p.slug === slug && p.ready);
  if (idx === -1) return null;
  const p = projects[idx];
  const next = projects.slice(idx + 1).concat(projects.slice(0, idx)).find(x => x.ready && x !== p);

  return `
    <a class="back-link" href="#/" data-scroll="work">← back to work</a>
    <h2>${p.title}</h2>
    ${shot(p, "hero image", "min-height:320px")}

    ${caseSections.map((s, i) => `
      <section id="${s}">
        <h2>${s[0].toUpperCase() + s.slice(1)}</h2>
        <p>[${s} content]</p>
        ${s === "outcome" ? `
          <div class="stats">
            <div class="stat"><strong>00%</strong>metric</div>
            <div class="stat"><strong>00%</strong>metric</div>
            <div class="stat"><strong>0</strong>metric</div>
          </div>` : ""}
      </section>`).join("")}

    <section>
      <p class="eyebrow">next stop →</p>
      <div class="next-stop">
        <a href="${next ? `#/work/${next.slug}` : "#/coming-soon"}">next project →</a>
        <a href="#/" data-scroll="work">all work</a>
      </div>
    </section>`;
}

const notFound = () => `
  <section>
    <p class="eyebrow">lost in the desert</p>
    <h2>404</h2>
    <p>This planet doesn't exist (yet). <a href="#/">Follow the stars home</a></p>
  </section>`;

// ---- Router ----
const app = document.getElementById("app");
const sidebarExtra = document.getElementById("sidebar-extra");
let pendingScroll = null;

function render() {
  const path = location.hash.replace(/^#/, "") || "/";
  let html, isCase = false;

  const caseMatch = path.match(/^\/work\/([\w-]+)$/);
  if (caseMatch) {
    html = caseStudy(caseMatch[1]);
    isCase = !!html;
  } else if (pages[path]) {
    html = pages[path]();
  }

  app.innerHTML = html || notFound();
  app.classList.remove("fade"); void app.offsetWidth; app.classList.add("fade");

  // Case-study sidebar: in-page section nav
  sidebarExtra.innerHTML = isCase
    ? `<nav class="case-nav">${caseSections.map(s => `<a href="#" data-scroll="${s}">${s}</a>`).join("")}</nav>`
    : "";

  // Active nav state
  document.querySelectorAll(".main-nav a").forEach(a => {
    const r = a.dataset.route;
    a.classList.toggle("active",
      r === path || (r === "work" && path.startsWith("/work")));
  });

  // Parallax intro only on the home page
  scene.hidden = path !== "/";

  if (pendingScroll) { scrollToId(pendingScroll); pendingScroll = null; }
  else window.scrollTo(0, 0);

  if (isCase) observeCaseSections();
  observeReveals();
  updateScene();
}

// ---- Scroll scene: move layers by scroll progress ----
const scene = document.getElementById("scene");
const stage = scene.querySelector(".scene-sticky");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScene() {
  if (scene.hidden || reduceMotion) return;
  const rect = scene.getBoundingClientRect();
  const total = rect.height - innerHeight;
  if (rect.bottom < 0) return; // scrolled past, nothing to animate
  const p = clamp(-rect.top / total);
  stage.style.setProperty("--p", p.toFixed(3));

  stage.querySelectorAll("[data-y], [data-zoom], [data-fade-out], [data-show]").forEach(el => {
    // data-range="a,b" → this layer only moves during that slice of the scroll
    const [ra, rb] = (el.dataset.range || "0,1").split(",").map(Number);
    const q = ramp(p, ra, rb);
    const y = parseFloat(el.dataset.y || 0) * q * innerHeight;
    const z = 1 + parseFloat(el.dataset.zoom || 0) * q;
    el.style.transform = `translate3d(0, ${y}px, 0) scale(${z})`;

    if (el.dataset.fadeOut) {
      const [a, b] = el.dataset.fadeOut.split(",").map(Number);
      el.style.opacity = 1 - ramp(p, a, b);
    }
    if (el.dataset.show) { // fade in a→b, hold, fade out c→d
      const [a, b, c, d] = el.dataset.show.split(",").map(Number);
      el.style.opacity = Math.min(ramp(p, a, b), 1 - ramp(p, c, d));
    }
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateScene(); ticking = false; });
}, { passive: true });
window.addEventListener("resize", updateScene);

// ---- Reveal content as it scrolls into view ----
const revealer = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add("in");
    revealer.unobserve(el);
    // once revealed, drop the classes so hover effects work normally
    const delay = parseFloat(el.style.transitionDelay) || 0;
    setTimeout(() => {
      el.classList.remove("reveal", "in");
      el.style.transitionDelay = "";
    }, 900 + delay);
  });
}, { threshold: 0.15 });

function observeReveals() {
  app.querySelectorAll("section, .project-row, .feature-card, .stat").forEach(el => {
    el.classList.add("reveal");
    const list = el.parentElement;
    if (list.matches(".project-list, .featured, .stats")) {
      el.style.transitionDelay = `${[...list.children].indexOf(el) * 90}ms`;
    }
    revealer.observe(el);
  });
}

function scrollToId(id) {
  if (id === "top") return window.scrollTo({ top: 0, behavior: "smooth" });
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// Handle data-scroll links (works across routes)
document.addEventListener("click", e => {
  const a = e.target.closest("[data-scroll]");
  if (!a) return;
  e.preventDefault();
  const target = a.dataset.scroll;
  const href = a.getAttribute("href");
  const currentPath = location.hash.replace(/^#/, "") || "/";
  const destPath = href && href.startsWith("#/") ? href.slice(1) : currentPath;

  if (destPath === currentPath) scrollToId(target);
  else { pendingScroll = target; location.hash = destPath; }
});

// ---- Image popup (lightbox) ----
const lightbox = document.createElement("dialog");
lightbox.className = "lightbox";
lightbox.innerHTML = `<button class="lightbox-close" aria-label="Close">×</button><img alt="" />`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");

document.addEventListener("click", e => {
  const a = e.target.closest("[data-popup]");
  if (!a) return;
  const p = projects.find(x => x.slug === a.dataset.popup);
  if (!p?.image) return;
  e.preventDefault();      // don't follow the card's link
  e.stopPropagation();
  lightboxImg.src = p.image;
  lightboxImg.alt = `${p.title} screenshot`;
  lightbox.showModal();
});
// close on × or by clicking the dark area around the image (Esc works too)
lightbox.addEventListener("click", e => {
  if (e.target === lightbox || e.target.closest(".lightbox-close")) lightbox.close();
});

// ---- Resume popup ----
const resumeBox = document.createElement("dialog");
resumeBox.className = "lightbox resume-box";
resumeBox.innerHTML = `
  <button class="lightbox-close" aria-label="Close">×</button>
  <iframe title="Resume"></iframe>
  <a class="resume-open" href="resume.pdf" target="_blank" rel="noopener">open in new tab ↗</a>`;
document.body.appendChild(resumeBox);

document.addEventListener("click", e => {
  const a = e.target.closest("[data-resume]");
  if (!a) return;
  e.preventDefault();
  const frame = resumeBox.querySelector("iframe");
  if (!frame.src) frame.src = a.getAttribute("href");
  resumeBox.showModal();
});
resumeBox.addEventListener("click", e => {
  if (e.target === resumeBox || e.target.closest(".lightbox-close")) resumeBox.close();
});

// Highlight current case-study section in sidebar
let observer;
function observeCaseSections() {
  observer?.disconnect();
  observer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      document.querySelectorAll(".case-nav a").forEach(a =>
        a.classList.toggle("active", a.dataset.scroll === en.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  caseSections.forEach(s => {
    const el = document.getElementById(s);
    if (el) observer.observe(el);
  });
}

// ---- Night sky: twinkling stars + the odd shooting star ----
function makeStars(container, count) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const size = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1;
    s.className = "star";
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%; left:${Math.random() * 100}%;
      --d:${2 + Math.random() * 4}s; --delay:${Math.random() * 4}s;`;
    container.appendChild(s);
  }
}
const sky = document.getElementById("stars");
makeStars(sky, 60);
makeStars(document.getElementById("scene-stars"), 40);
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => {
    const s = document.createElement("span");
    s.className = "shooting";
    s.style.top = `${Math.random() * 40}%`;
    s.style.left = `${40 + Math.random() * 60}%`;
    sky.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }, 7000);
}

// ---- Live clock ----
const clock = document.getElementById("clock");
function tick() { clock.textContent = new Date().toLocaleTimeString([], { hour12: false }); }
setInterval(tick, 1000); tick();

window.addEventListener("hashchange", render);
render();
