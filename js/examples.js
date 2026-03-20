import { escapeHtml, setActiveNav } from "./shared.js";

function renderExampleCard(example) {
  const redFlags = Array.isArray(example.redFlags) ? example.redFlags : [];
  const rfHtml = redFlags.length > 0
    ? `<ul class="list">${redFlags.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
    : `<p class="small-note">Add red flags for this example.</p>`;

  return `
    <div class="example-card" style="grid-column:span 6;">
      <h3>${escapeHtml(example.title || "Example")}</h3>
      ${example.meta ? `<p class="meta">${escapeHtml(example.meta)}</p>` : ""}
      <p class="small-note" style="margin-bottom:16px;white-space:pre-wrap;">${escapeHtml(example.scenario || "")}</p>

      <div class="meta" style="margin-bottom:8px;">🚩 Red flags</div>
      ${rfHtml}

      <div style="height:14px"></div>
      <div class="meta" style="margin-bottom:6px;">Why it was phishing</div>
      <p class="small-note" style="white-space:pre-wrap;">${escapeHtml(example.whyItWasPhishing || "")}</p>

      <div style="height:14px"></div>
      <div class="meta" style="margin-bottom:6px;">What to do instead</div>
      <p class="small-note" style="white-space:pre-wrap;">${escapeHtml(example.whatToDo || "")}</p>
    </div>
  `;
}

export async function initExamplesPage() {
  setActiveNav();
  const root = document.getElementById("examples-root");
  if (!root) return;

  const url = new URL("./data/examples.json", window.location.href).toString();
  const res = await fetch(url);
  if (!res.ok) {
    root.innerHTML = `<p class="small-note">Failed to load examples.</p>`;
    return;
  }
  const data = await res.json();
  const items = Array.isArray(data.examples) ? data.examples : [];

  if (items.length === 0) {
    root.innerHTML = `<p class="small-note">Add examples in <code>data/examples.json</code>.</p>`;
    return;
  }

  root.innerHTML = `<div class="examples-grid">${items.map(renderExampleCard).join("")}</div>`;
}
