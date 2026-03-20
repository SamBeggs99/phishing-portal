import { escapeHtml, setActiveNav } from "./shared.js";

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const lis = items.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `<ul class="list">${lis}</ul>`;
}

function renderParagraphs(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items.map((x) => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(x)}</p>`).join("");
}

function renderStandardTopic(topic) {
  const summary = topic.summary ? `<p class="small-note" style="font-size:15px;line-height:1.65;color:var(--text-2);">${escapeHtml(topic.summary)}</p>` : "";
  const redFlags = renderList(topic.redFlags);
  const response = renderList(topic.responseSteps);

  let deeper = "";
  if (topic.deeperLearning && (topic.deeperLearning.title || topic.deeperLearning.points?.length)) {
    const title = topic.deeperLearning.title || "Deeper learning";
    deeper = `
      <details>
        <summary>${escapeHtml(title)}</summary>
        <div style="padding-top:12px;">${renderParagraphs(topic.deeperLearning.points)}</div>
      </details>
    `;
  }

  return `
    <div class="section">
      <h2>Key Takeaway</h2>
      ${summary || `<p class="small-note">Add a summary for this module in <code>data/modules.json</code>.</p>`}
    </div>
    <div style="height:14px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div class="section">
        <h2>🚩 Red Flags</h2>
        ${redFlags || `<p class="small-note">Add red flags in <code>data/modules.json</code>.</p>`}
      </div>
      <div class="section">
        <h2>✅ How to Respond</h2>
        ${response || `<p class="small-note">Add response steps in <code>data/modules.json</code>.</p>`}
      </div>
    </div>
    ${deeper ? `<div style="height:14px"></div>${deeper}` : ""}
  `;
}

function renderTypesTopic(topic) {
  const intro = topic.summary
    ? `<p class="small-note" style="font-size:15px;line-height:1.65;color:var(--text-2);">${escapeHtml(topic.summary)}</p>`
    : "";

  const deeper = topic.deeperLearning?.points?.length
    ? `
      <div style="height:14px"></div>
      <details>
        <summary>${escapeHtml(topic.deeperLearning.title || "Deeper learning")}</summary>
        <div style="padding-top:12px;">${renderParagraphs(topic.deeperLearning.points)}</div>
      </details>
    `
    : "";

  const types = Array.isArray(topic.types) ? topic.types : [];
  const cards = types.map((t) => {
    const signals = renderList(t.signals);
    return `
      <div class="example-card" style="grid-column:span 6;">
        <h3>${escapeHtml(t.type)}</h3>
        <div class="meta" style="margin-bottom:6px;">What it is</div>
        <p class="small-note" style="margin-bottom:14px;">${escapeHtml(t.description)}</p>
        <div class="meta" style="margin-bottom:8px;">Common signals</div>
        ${signals || `<p class="small-note">Add signals in <code>data/modules.json</code>.</p>`}
      </div>
    `;
  }).join("");

  return `
    <div class="section">
      <h2>Overview</h2>
      ${intro}
    </div>
    <div style="height:14px"></div>
    <div class="examples-grid">
      ${cards || `<div class="small-note">Add phishing types in <code>data/modules.json</code>.</div>`}
    </div>
    ${deeper}
  `;
}

export async function renderModulePage(rootEl) {
  setActiveNav();
  const topicId = (rootEl?.dataset?.topic || "").trim();
  if (!topicId) {
    rootEl.innerHTML = `<p class="small-note">No module topic configured for this page.</p>`;
    return;
  }

  const modulesUrl = new URL("../data/modules.json", window.location.href).toString();
  const res = await fetch(modulesUrl);
  if (!res.ok) {
    rootEl.innerHTML = `<p class="small-note">Failed to load module content.</p>`;
    return;
  }
  const data = await res.json();
  const topic = data?.topics?.[topicId];

  if (!topic) {
    rootEl.innerHTML = `<p class="small-note">Module topic not found: ${escapeHtml(topicId)}</p>`;
    return;
  }

  if (topic.type === "types-of-phishing") rootEl.innerHTML = renderTypesTopic(topic);
  else rootEl.innerHTML = renderStandardTopic(topic);
}
