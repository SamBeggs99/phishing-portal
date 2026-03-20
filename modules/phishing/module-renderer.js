import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar, markModuleComplete, renderCheckIn, initCheckIn } from "../../js/shared.js";
import { getHeaderHTML, getFooterHTML } from "../../js/header.js";
import { initI18n, getUI, getDataUrl } from "../../js/i18n.js";

export async function renderPhishingModule(topicId) {
  const ui = await initI18n("../..");
  window.__setLang = (l) => { localStorage.setItem("pac_lang",l); window.location.reload(); };

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: "../..", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: "../..", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  const url = getDataUrl("phishing-modules", "../..");
  const res = await fetch(url);
  if (!res.ok) { document.getElementById("module-root").innerHTML = `<p class="small-note">Failed to load module.</p>`; return; }
  const data = await res.json();
  const topic = data.topics[topicId];
  if (!topic) { document.getElementById("module-root").innerHTML = `<p class="small-note">Module not found.</p>`; return; }

  const m = ui.module || {};
  const root = document.getElementById("module-root");
  if (topic.type === "types-of-phishing") root.innerHTML = renderTypes(topic, m);
  else root.innerHTML = renderStandard(topic, m);

  initCheckIn(topic.checkIn, ui);
  setTimeout(() => markModuleComplete(topicId), 8000);
}

function renderStandard(topic, m) {
  const flags = (topic.redFlags || []).map(f => `<li>${escapeHtml(f)}</li>`).join("");
  const steps = (topic.responseSteps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const deeper = topic.deeperLearning ? `
    <details>
      <summary>${escapeHtml(topic.deeperLearning.title || m.deeperLearning || "Deeper learning")}</summary>
      <div class="details-body">
        ${(topic.deeperLearning.points || []).map(p => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(p)}</p>`).join("")}
      </div>
    </details>` : "";
  const checkInHTML = renderCheckIn(topic.checkIn, { module: m });

  return `
    <div class="module-body">
      <div class="content-section">
        <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(m.keyTakeaway || "Key takeaway")}</div>
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
      </div>
      <div class="content-two-col">
        <div class="content-section">
          <h2>🚩 ${escapeHtml(m.redFlags || "Red flags")}</h2>
          <ul class="list-clean">${flags || "<li>See module content</li>"}</ul>
        </div>
        <div class="content-section">
          <h2>✅ ${escapeHtml(m.howToRespond || "How to respond")}</h2>
          <ul class="list-clean">${steps || "<li>See module content</li>"}</ul>
        </div>
      </div>
      ${deeper}
      ${checkInHTML}
    </div>`;
}

function renderTypes(topic, m) {
  const types = (topic.types || []).map(t => {
    const signals = (t.signals || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
    return `
      <div class="content-section">
        <h2>${escapeHtml(t.type)}</h2>
        <p class="small-note" style="margin-bottom:12px;">${escapeHtml(t.description)}</p>
        <ul class="list-clean">${signals}</ul>
      </div>`;
  }).join("");
  const deeper = topic.deeperLearning ? `
    <details>
      <summary>${escapeHtml(topic.deeperLearning.title || m.deeperLearning || "Deeper learning")}</summary>
      <div class="details-body">
        ${(topic.deeperLearning.points || []).map(p => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(p)}</p>`).join("")}
      </div>
    </details>` : "";
  const checkInHTML = renderCheckIn(topic.checkIn, { module: m });

  return `
    <div class="module-body">
      <div class="content-section">
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
      </div>
      <div class="grid-2">${types}</div>
      ${deeper}
      ${checkInHTML}
    </div>`;
}
