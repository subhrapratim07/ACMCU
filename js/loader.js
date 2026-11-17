// ACM CU loader: counter fills from outline to solid while a seam line draws,
// then the screen splits open along that line.
(() => {
  const ld = document.getElementById("loader");
  if (!ld) return;
  const num = document.getElementById("ldNum"), msg = document.getElementById("ldMsg");
  const MIN = 1700;   // shortest time the loader stays up (ms)
  const MAX = 7000;   // safety: never block the site longer than this (ms)
  const steps = [[30, "Initialising chapter"], [60, "Loading events"], [90, "Assembling the team"], [101, "Ready"]];
  const t0 = performance.now();
  let loaded = document.readyState === "complete", p = 0, finished = false;
  addEventListener("load", () => { loaded = true; });

  const finish = () => {
    if (finished) return;
    finished = true;
    ld.classList.add("done");                       // content fades, panels split apart
    setTimeout(() => {                              // site animates in as the curtain opens
      document.body.classList.add("ready");
      document.body.classList.remove("loading");
    }, 300);
    setTimeout(() => ld.remove(), 1600);
  };

  const tick = now => {
    const t = now - t0;
    let target = 92 * (1 - Math.pow(1 - Math.min(t / MIN, 1), 2));
    if ((loaded && t >= MIN) || t > MAX) target = 100;
    p += (target - p) * 0.12;
    if (target === 100 && p > 99.4) p = 100;

    num.textContent = String(Math.round(p)).padStart(2, "0");
    ld.style.setProperty("--p", p.toFixed(1) + "%");
    msg.textContent = steps.find(s => p < s[0])[1];

    if (p >= 100) setTimeout(finish, 250);
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
