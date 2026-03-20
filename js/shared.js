export function escapeHtml(value) {
  const str = String(value ?? "");
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function setActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const links = document.querySelectorAll('a[data-nav="true"]');
  links.forEach((a) => {
    const hrefRaw = a.getAttribute("href") || "";
    let hrefPath = hrefRaw;
    try {
      hrefPath = new URL(hrefRaw, window.location.href).pathname;
    } catch { /* ignore */ }
    hrefPath = String(hrefPath).toLowerCase();
    const isCurrent = path === hrefPath || path.endsWith(hrefPath);
    if (isCurrent) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
