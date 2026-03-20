export function initMatrixBackground(canvas) {
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

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
    columns = Math.floor(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (height / fontSize)));
  }

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

  resize();
  window.addEventListener("resize", resize);
  rafId = window.requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
      return;
    }
    rafId = window.requestAnimationFrame(draw);
  });
}
