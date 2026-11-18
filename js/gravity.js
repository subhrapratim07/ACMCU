// Gravity playground inside the big "ACM CU" footer lettering.
// Glowing balls fall, bounce and roll over the letter shapes, and pile up on them.
// Move the cursor to push them away, hold the button (or finger) to pull them in.
(() => {
  const wrap = document.getElementById("big"), cv = document.getElementById("bigCv");
  if (!wrap || !cv) return;
  const ctx = cv.getContext("2d");
  let reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const playBtn = document.getElementById("bigPlay");

  // ---- tweak these ----
  const LINES = ["ACM", "CU"];
  const GRAVITY = 1100;          // px/s^2
  const BOUNCE = 0.38;           // 0 = dead, 1 = perfectly bouncy
  const REACH = 110;             // cursor influence radius (px)
  const REST_SECONDS = 3.2;      // a ball sitting still this long fades and drops again
  const COLORS = [[99, 102, 241], [139, 141, 255], [99, 102, 241], [245, 245, 247], [255, 10, 120]];
  // ---------------------

  const SPACING = -0.05, LINE_H = 0.85, SUB = 3;
  let W = 0, H = 0, size = 0, dpr = 1, lastW = 0;
  let mask = null, textLayer = null, balls = [], running = false, last = 0;
  const ptr = { x: -999, y: -999, in: false, down: false };

  const maxBalls = () => (W < 600 ? 80 : 150);
  const baseR = () => Math.min(Math.max(size * 0.012, 2.6), 5.5);

  const drawText = (c, fancy) => {
    c.font = `700 ${size}px "Space Grotesk", system-ui, sans-serif`;
    c.textBaseline = "alphabetic"; c.textAlign = "left";
    const ls = SPACING * size, native = "letterSpacing" in c;
    if (native) c.letterSpacing = ls + "px";
    if (fancy) {
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(255,255,255,.31)"); g.addColorStop(1, "rgba(255,255,255,.06)");
      c.fillStyle = g;
    } else c.fillStyle = "#fff";
    LINES.forEach((t, k) => {
      const y = size * 0.75 + k * size * LINE_H;
      if (native) {
        const w = c.measureText(t).width - ls;
        c.fillText(t, (W - w) / 2, y);
      } else {
        const chars = [...t];
        const w = chars.reduce((a, ch) => a + c.measureText(ch).width + ls, 0) - ls;
        let x = (W - w) / 2;
        chars.forEach(ch => { c.fillText(ch, x, y); x += c.measureText(ch).width + ls; });
      }
    });
  };

  const layout = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.floor(wrap.clientWidth); lastW = innerWidth;
    size = Math.min(Math.max(80, innerWidth * 0.32), 448);   // same size as the old CSS text
    H = Math.ceil(size * 1.66);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";

    textLayer = document.createElement("canvas");
    textLayer.width = W * dpr; textLayer.height = H * dpr;
    const t = textLayer.getContext("2d"); t.scale(dpr, dpr); drawText(t, true);

    const m = document.createElement("canvas"); m.width = W; m.height = H;
    const mc = m.getContext("2d", { willReadFrequently: true }); drawText(mc, false);
    const d = mc.getImageData(0, 0, W, H).data;
    mask = new Uint8Array(W * H);
    for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  };

  const solid = (x, y) => {
    x = Math.floor(x); y = Math.floor(y);
    return x >= 0 && x < W && y >= 0 && y < H && mask[y * W + x] === 1;
  };

  const spawn = (b, anywhere) => {
    b.x = Math.random() * W;
    b.y = anywhere ? -Math.random() * H : -10 - Math.random() * 40;
    b.vx = (Math.random() - 0.5) * 40; b.vy = Math.random() * 60;
    return b;
  };
  const makeBall = () => spawn({
    r: baseR() * (0.7 + Math.random() * 0.6),
    c: COLORS[(Math.random() * COLORS.length) | 0], a: 1, rest: 0, fade: 0
  }, true);

  const DIRS = Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)]);
  const collide = b => {
    for (let it = 0; it < 6; it++) {
      let nx = 0, ny = 0, hit = solid(b.x, b.y);
      for (const [dx, dy] of DIRS) if (solid(b.x + dx * b.r, b.y + dy * b.r)) { nx -= dx; ny -= dy; hit = true; }
      if (!hit) return;
      let l = Math.hypot(nx, ny);
      if (l < 1e-3) { nx = 0; ny = -1; l = 1; }
      nx /= l; ny /= l;
      b.x += nx; b.y += ny;                                   // push out of the letter
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) {                                           // bounce + a little friction
        b.vx -= (1 + BOUNCE) * vn * nx; b.vy -= (1 + BOUNCE) * vn * ny;
        const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty;
        b.vx -= vt * 0.02 * tx; b.vy -= vt * 0.02 * ty;
      }
    }
  };

  const separate = () => {
    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const a = balls[i];
      for (let j = i + 1; j < n; j++) {
        const b = balls[j], m = a.r + b.r, dx = b.x - a.x, dy = b.y - a.y;
        if (dx > m || dx < -m || dy > m || dy < -m) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 >= m * m || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), o = (m - d) / 2, nx = dx / d, ny = dy / d;
        a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) { const k = -rv * 0.55; a.vx -= k * nx; a.vy -= k * ny; b.vx += k * nx; b.vy += k * ny; }
      }
    }
  };

  const step = dt => {
    const h = dt / SUB;
    for (let s = 0; s < SUB; s++) {
      for (const b of balls) {
        b.vy += GRAVITY * h;
        if (ptr.in) {
          const dx = b.x - ptr.x, dy = b.y - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH && d2 > 1) {
            const d = Math.sqrt(d2), f = 1 - d / REACH, k = ptr.down ? -2400 : 3200;
            b.vx += dx / d * f * k * h; b.vy += dy / d * f * k * h;
            if (ptr.down) { b.vx *= 0.97; b.vy *= 0.97; }
          }
        }
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 1400) { b.vx *= 1400 / sp; b.vy *= 1400 / sp; }
        b.x += b.vx * h; b.y += b.vy * h;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.5; }
        else if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.5; }
        collide(b);
      }
      for (let k = 0; k < 3; k++) {                  // keep balls apart AND out of the letters
        separate();
        for (const b of balls) collide(b);
      }
    }
    for (const b of balls) {                                   // lifecycle: rest -> fade -> drop again
      if (b.fade === 1) { b.a -= dt * 3; if (b.a <= 0) { spawn(b); b.a = 0; b.fade = 2; b.rest = 0; } }
      else if (b.fade === 2) { b.a += dt * 3; if (b.a >= 1) { b.a = 1; b.fade = 0; } }
      else {
        b.rest = Math.hypot(b.vx, b.vy) < 18 ? b.rest + dt : 0;
        if (b.rest > REST_SECONDS) b.fade = 1;
        if (b.y > H + 40) { spawn(b); b.a = 0; b.fade = 2; }
      }
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(textLayer, 0, 0, W, H);
    for (const b of balls) {
      if (b.a <= 0) continue;
      const [r, g, bl] = b.c;
      ctx.fillStyle = `rgba(${r},${g},${bl},${0.10 * b.a})`;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${bl},${b.a})`;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
    }
    if (ptr.in) {
      ctx.strokeStyle = ptr.down ? "rgba(255,10,120,.7)" : "rgba(139,141,255,.5)";
      ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.arc(ptr.x, ptr.y, ptr.down ? REACH * 0.35 : 12, 0, 6.283); ctx.stroke();
    }
  };

  const frame = now => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    step(dt); draw();
    requestAnimationFrame(frame);
  };

  // pointer: move = push, hold = pull
  const pos = e => { const r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true; };
  wrap.addEventListener("pointermove", pos);
  wrap.addEventListener("pointerdown", e => { pos(e); ptr.down = true; });
  addEventListener("pointerup", () => { ptr.down = false; });
  wrap.addEventListener("pointerleave", () => { ptr.in = false; ptr.down = false; });
  wrap.addEventListener("pointercancel", () => { ptr.in = false; ptr.down = false; });

  const start = () => {
    wrap.classList.add("live");
    balls = Array.from({ length: maxBalls() }, makeBall);
    new IntersectionObserver(es => {               // only simulate while the footer is on screen
      if (es[0].isIntersecting) { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
      else running = false;
    }, { rootMargin: "120px" }).observe(wrap);
  };

  const init = () => {
    layout();
    wrap.classList.add("ready");
    if (reduce) {                                  // device asks for less motion: static lettering + a Play button
      draw();
      wrap.classList.add("reduced");
      if (playBtn) playBtn.onclick = () => { reduce = false; wrap.classList.remove("reduced"); start(); };
      return;
    }
    start();
  };

  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (!W || innerWidth === lastW) return;       // ignore mobile address-bar height changes
      layout();
      balls.forEach(b => { b.x = Math.min(b.x, W - b.r); });
      if (reduce) draw();
    }, 150);
  });

  const fontReady = (document.fonts && document.fonts.load)
    ? document.fonts.load('700 100px "Space Grotesk"').catch(() => {}) : Promise.resolve();
  Promise.race([fontReady, new Promise(r => setTimeout(r, 2500))]).then(init);
})();