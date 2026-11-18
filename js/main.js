(() => {
  const D = window.ACM, $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("#year").textContent = D.year;
  $("#year2").textContent = D.year;
  $(".track").innerHTML = Array(12).fill("<span>because technology matters</span>").join("");

  // about tabs
  const tabs = $(".tabs"), panel = $(".tabpanel");
  const showTab = id => {
    tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", b.dataset.id === id));
    panel.style.animation = "none"; panel.offsetHeight; panel.style.animation = "";
    panel.textContent = D.about.find(a => a.id === id).text;
  };
  tabs.innerHTML = D.about.map(a => `<button role="tab" data-id="${a.id}">${esc(a.label)}</button>`).join("");
  tabs.onclick = e => e.target.dataset.id && showTab(e.target.dataset.id);
  showTab(D.about[0].id);

  // stats (counted from data.js, so they never go stale)
  const stats = [
    [D.events.upcoming.length, "Events planned"],
    [new Set(D.events.upcoming.map(e => e.type)).size, "Event formats"],
    [D.projects.length, "Projects"],
    [D.team.length, "Team members"]
  ];
  $("#stats").innerHTML = stats.map(([n, l]) => `<div><b data-n="${n}">0</b><span>${esc(l)}</span></div>`).join("");
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const n = +e.target.dataset.n; let i = 0;
    if (!n) { e.target.textContent = "0"; return }
    const t = setInterval(() => { e.target.textContent = ++i + "+"; if (i >= n) clearInterval(t) }, 90);
  }));
  document.querySelectorAll("#stats b").forEach(b => cio.observe(b));

  // events: upcoming (filterable) + past
  const fmt = e => e.date ? new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date TBA";
  const rowHTML = (e, i) =>
    `<article class="row" data-t="${esc(e.type)}"><span class="idx">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div><small><b>${esc(e.type)}</b><br>${fmt(e)}</small></article>`;
  const empty = m => `<p class="empty">${esc(m)}</p>`;
  const byDate = (a, b) => (b.date || "").localeCompare(a.date || "");

  const types = ["All", ...new Set(D.events.upcoming.map(e => e.type))];
  $("#chips").innerHTML = types.map((t, i) => `<button aria-pressed="${i === 0}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
  $("#upcomingGrid").innerHTML = D.events.upcoming.map(rowHTML).join("") || empty("New events will be announced soon.");
  $("#pastGrid").innerHTML = D.events.past.slice().sort(byDate).map(rowHTML).join("") || empty("Our first event is yet to happen. Check back soon!");
  $("#chips").onclick = e => {
    const t = e.target.dataset.t; if (!t) return;
    $("#chips").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === e.target));
    document.querySelectorAll("#upcomingGrid .row").forEach(c => c.classList.toggle("hide", t !== "All" && c.dataset.t !== t));
  };

  // projects
  $("#projGrid").innerHTML = D.projects.map(p =>
    `<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p><div class="links"><a href="${esc(p.link)}" target="_blank" rel="noopener">Visit website</a></div></article>`).join("");

  // footer: contact details, map and social icons (all from data.js)
  const C = D.contact, q = encodeURIComponent(C.mapQuery);
  $("#addr").innerHTML = `<b>${esc(C.address[0])}</b>` + C.address.slice(1).map(esc).join("<br>");
  $("#mail").href = "mailto:" + C.email; $("#mail").textContent = C.email;
  $("#mapFrame").src = `https://www.google.com/maps?q=${q}&output=embed`;
  $("#mapLink").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  $("#social").innerHTML = D.social.map(s => {
    const live = s.url && s.url !== "#";
    return `<li><a href="${esc(s.url || "#")}" aria-label="${esc(s.name)}" title="${esc(s.name)}"${live ? ' target="_blank" rel="noopener"' : ""}><i class="${esc(s.icon)}" aria-hidden="true"></i></a></li>`;
  }).join("");

  // team: big name list drives the profile card.
  // Auto-rotates every TEAM_MS; pauses while the pointer/focus is on the section
  // (or it is off-screen) and resumes from whichever member is currently shown.
  const TEAM_MS = 2000;
  const lk = (u, n) => u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>` : "";
  const list = $("#tlist"), card = $("#tcard"), wrap = $(".team-wrap");
  let cur = -1, hover = false, focus = false, vis = false;
  list.innerHTML = D.team.map((m, i) => `<li><button data-i="${i}">${esc(m.name)}</button></li>`).join("");
  const hold = () => card.classList.toggle("hold", hover || focus || !vis);
  const pick = (i, force) => {
    if (i === cur && !force) return;
    cur = i;
    const m = D.team[i];
    list.querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === i));
    const av = m.img ? `<img src="${esc(m.img)}" alt="${esc(m.name)}">` : `<div class="ph" aria-hidden="true">${esc(m.name.replace(/^Dr\.\s*/, "")[0])}</div>`;
    card.innerHTML = `${av}<div class="plate"><b>${esc(m.name)}</b><small>${esc(m.role)}</small><div class="links">${lk(m.linkedin, "LinkedIn")}${lk(m.github, "GitHub")}</div></div>`;
    card.classList.remove("tick"); void card.offsetWidth; card.classList.add("tick");   // restart the timer bar
  };
  const fromEvent = e => { const b = e.target.closest("button"); b && pick(+b.dataset.i) };
  list.onmouseover = list.onclick = list.onfocusin = fromEvent;
  card.style.setProperty("--ti", TEAM_MS + "ms");
  card.addEventListener("animationend", e => { if (e.animationName === "tcardTick") pick((cur + 1) % D.team.length, true) });
  wrap.addEventListener("pointerenter", () => { hover = true; hold() });
  wrap.addEventListener("pointerleave", () => { hover = false; hold() });
  wrap.addEventListener("focusin", () => { focus = true; hold() });
  wrap.addEventListener("focusout", () => { focus = false; hold() });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; hold() }, { threshold: .25 }).observe($("#team"));
  pick(0);
  hold();

  // nav: sliding pill, active section, pink theme in ACM-W
  const nav = $("#nav"), pill = $(".pill"), links = [...nav.querySelectorAll("a")];
  const move = a => { if (!a) { pill.style.width = 0; return } pill.style.left = a.offsetLeft + "px"; pill.style.width = a.offsetWidth + "px" };
  const setActive = id => {
    const a = links.find(l => l.getAttribute("href") === "#" + id);
    links.forEach(l => l.classList.toggle("on", l === a));
    document.body.classList.toggle("pink", id === "acmw");
    move(a);
  };
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(s => io.observe(s));
  addEventListener("resize", () => move(nav.querySelector(".on")));

  // mobile menu
  const btn = $("#menuBtn");
  const toggle = o => { nav.classList.toggle("open", o); btn.setAttribute("aria-expanded", o) };
  btn.onclick = () => toggle(!nav.classList.contains("open"));
  nav.onclick = e => e.target.tagName === "A" && toggle(false);
  addEventListener("keydown", e => e.key === "Escape" && toggle(false));

  // navbar: blurred background after scrolling
  const navWrap = $(".nav-wrap");
  const onScroll = () => navWrap.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // hero background: drifting indigo node network (canvas, no library)
  const cv = $("#bg"), cx = cv.getContext("2d");
  if (!matchMedia("(prefers-reduced-motion:reduce)").matches && !matchMedia("(max-width:760px)").matches) {
    let w, h, pts;
    const init = () => {
      w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight;
      pts = Array.from({ length: Math.min(80, w / 16 | 0) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
    };
    const loop = () => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(99,102,241,.28)"; cx.fillStyle = "#8b8dff";
      pts.forEach((p, i) => {
        p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h;
        cx.fillRect(p.x, p.y, 2, 2);
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          if (Math.hypot(p.x - q.x, p.y - q.y) < 130) { cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke() }
        }
      });
      requestAnimationFrame(loop);
    };
    addEventListener("resize", init); init(); loop();
  }
})();