export function initMatrixBackground(canvas) {
  if (!canvas) return false;

  const prefersReduced = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let fontSize = 16;
  let columns = 0;
  let drops = [];
  let rafId = 0;
  let frame = 0;

  const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getChar = () => chars[Math.floor(Math.random() * chars.length)];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (ctx && !prefersReduced) {
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (height / fontSize)));
    }
  }

  resize();
  window.addEventListener("resize", resize);

  // No 2D context (rare): still show CSS-driven backdrop on #matrix-bg; avoid matrix-static-bg gap.
  if (!ctx) return true;

  // Reduced motion: keep the stacked PAC gradients on #matrix-bg (site.css) — do not hide canvas or rely only on body::before (inconsistent on some mobile browsers).
  if (prefersReduced) return true;

  function draw() {
    frame += 1;
    if (frame % 2 !== 0) {
      rafId = window.requestAnimationFrame(draw);
      return;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Space Mono", monospace`;
    for (let i = 0; i < drops.length; i += 1) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = "rgba(171, 35, 40, 0.35)";
      ctx.fillText(getChar(), x, y);

      if (y > height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.65;
    }

    rafId = window.requestAnimationFrame(draw);
  }

  rafId = window.requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
      return;
    }
    rafId = window.requestAnimationFrame(draw);
  });

  return true;
}
