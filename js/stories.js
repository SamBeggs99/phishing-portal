import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n, getDataUrl } from "./i18n.js";

async function init() {
  const ui = await initI18n(".");
  window.__setLang = (l) => { localStorage.setItem("pac_lang", l); window.location.reload(); };

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  const s = ui.stories || {};
  document.querySelector(".page-eyebrow").textContent = s.eyebrow || "Real-World Stories";
  document.querySelector(".page-hero h1").textContent = s.h1 || "Real attacks. Real consequences.";
  document.querySelector(".page-hero p").textContent = s.body || "";

  const res = await fetch(getDataUrl("stories", "."));
  if (!res.ok) { document.getElementById("stories-root").innerHTML = `<p class="small-note">Failed to load stories.</p>`; return; }
  const data = await res.json();
  const items = data.examples || [];

  document.getElementById("stories-root").innerHTML = items.map((item, i) => `
    <div class="story-card">
      <div class="story-header">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <div class="story-meta">${escapeHtml(item.meta)}</div>
        </div>
        <div class="story-num">0${i+1}</div>
      </div>
      <p class="story-excerpt" style="white-space:pre-wrap;">${escapeHtml(item.scenario)}</p>
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(s.whyWorked?.split("—")[0]?.trim() || "Red flags")}</div>
      <ul class="list-clean" style="margin-bottom:14px;">
        ${(item.redFlags||[]).map(f=>`<li>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <details>
        <summary>${escapeHtml(s.whyWorked || "Why it worked — and what you can do differently")}</summary>
        <div class="details-body">
          <p class="small-note" style="margin-bottom:10px;"><strong style="color:var(--text);">${escapeHtml(s.whyPhishing || "Why it was phishing")}:</strong> ${escapeHtml(item.whyItWasPhishing)}</p>
          <p class="small-note"><strong style="color:var(--text);">${escapeHtml(s.whatInstead || "What to do instead")}:</strong> ${escapeHtml(item.whatToDo)}</p>
        </div>
      </details>
    </div>`).join("");
}

init();
