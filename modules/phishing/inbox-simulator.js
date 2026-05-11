import { setActiveNav, initMobileNav, updateProgressBar, escapeHtml } from "../../js/shared.js";
import { getHeaderHTML, getFooterHTML } from "../../js/header.js";
import { initI18n } from "../../js/i18n.js";

const DEMO_PAGES = {
  m365: "./sim-pages/m365-login.html",
  hr: "./sim-pages/hr-verify.html"
};

const MESSAGES = [
  {
    id: "m1",
    subject: "Action required: Microsoft 365 session expires today",
    fromName: "Microsoft Security",
    fromEmail: "security@microsoft-login-alerts.co",
    to: "you@pacgroup.com",
    time: "4:46 PM",
    tags: ["Urgency", "Credential theft"],
    bodyHtml: `
      <p>Your Microsoft 365 session will expire in <strong>30 minutes</strong>. Verify now to avoid disruption.</p>
      <p>
        <a class="sim-link" href="${DEMO_PAGES.m365}" data-purpose="login">Verify session</a>
      </p>
      <p class="small-note">Do not contact IT — this is an automated security workflow.</p>
    `,
    signals: [
      "Sender domain is not a real Microsoft domain",
      "Urgency + threat of disruption",
      "Discourages verification via IT"
    ],
    bestResponse: "Report it. Do not use the link. Navigate to Microsoft 365 directly (or contact IT) using a known channel."
  },
  {
    id: "m2",
    subject: "PAC HR: Compliance acknowledgement required",
    fromName: "PAC HR Team",
    fromEmail: "hr@pacgr0up.com",
    to: "you@pacgroup.com",
    time: "9:12 AM",
    tags: ["Intimidation", "Lookalike domain"],
    bodyHtml: `
      <p>Your employment record shows a <strong>compliance issue</strong> that may affect your contract.</p>
      <p>Please acknowledge within <strong>60 minutes</strong> to avoid escalation.</p>
      <p>
        <a class="sim-link" href="${DEMO_PAGES.hr}" data-purpose="verify">View details</a>
      </p>
    `,
    signals: [
      "Lookalike domain (pacgr0up.com)",
      "Threat-based language and escalation",
      "Time pressure linked to clicking a link"
    ],
    bestResponse: "Verify through normal HR channels you already trust. If unexpected, report it before clicking anything."
  },
  {
    id: "m3",
    subject: "Updated supplier invoice — please review today",
    fromName: "Accounts Payable",
    fromEmail: "ap@pacgroup.com",
    to: "you@pacgroup.com",
    time: "11:03 AM",
    tags: ["Legitimate", "Expected workflow"],
    bodyHtml: `
      <p>Hi,</p>
      <p>Supplier invoice updated in the approved system. Please review when you have a moment.</p>
      <p class="small-note">Tip: In real life, always open finance documents from the approved system, not an email attachment.</p>
    `,
    signals: [
      "Sender domain matches PAC",
      "No request for credentials or payment changes",
      "No urgency / threat language"
    ],
    bestResponse: "Looks normal. Still follow the standard process: verify the request context and use approved systems."
  }
];

let selectedId = null;
let didInspect = false;
let score = { correct: 0, total: 0 };

async function init() {
  const ui = await initI18n("../..");

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: "../..", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: "../..", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  renderList();
  wireActions();
  wireModal();
}

function renderList() {
  const root = document.getElementById("sim-list");
  if (!root) return;
  root.innerHTML = MESSAGES.map((m) => `
    <button class="inbox-sim-item" type="button" role="option" data-id="${escapeHtml(m.id)}" aria-selected="false">
      <div class="inbox-sim-item-head">
        <span class="inbox-sim-from">${escapeHtml(m.fromName)}</span>
        <span class="inbox-sim-time">${escapeHtml(m.time)}</span>
      </div>
      <div class="inbox-sim-subject">${escapeHtml(m.subject)}</div>
      <div class="inbox-sim-tags">${(m.tags || []).map(t => `<span class="inbox-sim-tag">${escapeHtml(t)}</span>`).join("")}</div>
    </button>
  `).join("");

  root.querySelectorAll(".inbox-sim-item").forEach(btn => {
    btn.addEventListener("click", () => selectMessage(btn.dataset.id));
  });
}

function selectMessage(id) {
  selectedId = id;
  didInspect = false;

  document.querySelectorAll(".inbox-sim-item").forEach(el => {
    const active = el.dataset.id === id;
    el.classList.toggle("active", active);
    el.setAttribute("aria-selected", active ? "true" : "false");
  });

  const msg = MESSAGES.find(m => m.id === id);
  const view = document.getElementById("sim-message");
  const status = document.getElementById("sim-status");
  const feedback = document.getElementById("sim-feedback");
  if (feedback) feedback.classList.add("hidden");

  if (!msg || !view) return;
  if (status) status.textContent = "Message selected — choose what to do next";

  view.innerHTML = `
    <div class="inbox-sim-header">
      <h2 style="margin-bottom:6px;">${escapeHtml(msg.subject)}</h2>
      <div class="small-note" style="display:flex;flex-wrap:wrap;gap:10px;">
        <span><strong>From:</strong> ${escapeHtml(msg.fromName)} &lt;${escapeHtml(msg.fromEmail)}&gt;</span>
        <span><strong>To:</strong> ${escapeHtml(msg.to)}</span>
        <span><strong>Time:</strong> ${escapeHtml(msg.time)}</span>
      </div>
    </div>
    <div class="inbox-sim-body">
      ${msg.bodyHtml}
    </div>
    <div class="inbox-sim-hint small-note">
      Hint: Hover links to preview. Use “Inspect details” before deciding.
    </div>
  `;

  view.querySelectorAll("a.sim-link").forEach(a => {
    a.addEventListener("mouseenter", () => showLinkPreview(a.getAttribute("href") || ""));
    a.addEventListener("focus", () => showLinkPreview(a.getAttribute("href") || ""));
    a.addEventListener("mouseleave", () => hideLinkPreview());
    a.addEventListener("blur", () => hideLinkPreview());
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDemoPage(a.getAttribute("href") || "", msg);
    });
  });
}

function wireActions() {
  const inspect = document.getElementById("sim-inspect");
  const del = document.getElementById("sim-delete");
  const report = document.getElementById("sim-report");

  inspect?.addEventListener("click", () => {
    const msg = getSelected();
    if (!msg) return;
    didInspect = true;
    openDetails(msg);
  });

  del?.addEventListener("click", () => {
    const msg = getSelected();
    if (!msg) return;
    gradeAction(msg, "delete");
  });

  report?.addEventListener("click", () => {
    const msg = getSelected();
    if (!msg) return;
    gradeAction(msg, "report");
  });
}

function getSelected() {
  if (!selectedId) return null;
  return MESSAGES.find(m => m.id === selectedId) || null;
}

function gradeAction(msg, action) {
  // Very simple rubric for MVP:
  // - For m1/m2: report is best
  // - For m3: delete is fine but “report” not necessary; treat as “okay”
  const isPhish = msg.id === "m1" || msg.id === "m2";
  const ok = isPhish ? action === "report" : (action === "delete" || action === "report");

  score.total += 1;
  if (ok) score.correct += 1;

  const status = document.getElementById("sim-status");
  if (status) status.textContent = `Score: ${score.correct} / ${score.total}`;

  const fb = document.getElementById("sim-feedback");
  if (!fb) return;
  fb.classList.remove("hidden");
  fb.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
  fb.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";

  const inspectNote = didInspect ? "Nice—checking details first is the habit that prevents mistakes." : "Try using “Inspect details” before deciding—phish relies on speed.";
  const header = ok ? "Good call" : "Risky choice";
  const next = msg.bestResponse || "";
  fb.innerHTML = `
    <div class="mono-label" style="margin-bottom:6px;color:${ok ? "#2ECC71" : "#AB2328"};">${escapeHtml(header)}</div>
    <p class="small-note" style="margin-bottom:10px;">${escapeHtml(inspectNote)}</p>
    <div class="mono-label" style="margin-bottom:6px;">Best response</div>
    <p class="small-note" style="margin-bottom:0;">${escapeHtml(next)}</p>
  `;
}

function openDetails(msg) {
  openModal("Inspect details", `
    <div class="content-section" style="margin:0;">
      <div class="mono-label" style="margin-bottom:8px;">What to notice</div>
      <ul class="list-clean">${(msg.signals || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      <div class="section-gap-sm"></div>
      <div class="mono-label" style="margin-bottom:8px;">Headers (simulated)</div>
      <div class="small-note" style="white-space:pre-wrap;line-height:1.6;">
From: ${escapeHtml(msg.fromName)} &lt;${escapeHtml(msg.fromEmail)}&gt;
To: ${escapeHtml(msg.to)}
Subject: ${escapeHtml(msg.subject)}
      </div>
    </div>
  `);
}

let previewEl = null;
function showLinkPreview(href) {
  const view = document.getElementById("sim-message");
  if (!view) return;
  if (!previewEl) {
    previewEl = document.createElement("div");
    previewEl.className = "sim-link-preview";
    view.appendChild(previewEl);
  }
  previewEl.textContent = `Link preview: ${href}`;
  previewEl.classList.add("show");
}
function hideLinkPreview() {
  previewEl?.classList.remove("show");
}

function openDemoPage(href, msg) {
  openModal("Link opened (training demo)", `
    <div class="content-section" style="margin:0;">
      <div class="mono-label" style="margin-bottom:8px;">You clicked a link</div>
      <p class="small-note" style="margin-bottom:12px;">
        This is a <strong>local training page</strong> to show how convincing phishing flows can look.
      </p>
      <iframe class="sim-iframe" title="Training demo page" src="${escapeHtml(href)}"></iframe>
      <div class="section-gap-sm"></div>
      <p class="small-note" style="margin-bottom:0;">
        After viewing, ask: did the email pressure you? did the domain match exactly? would you verify off-channel first?
      </p>
    </div>
  `);
  // Clicking a link in a phish is a learning moment; don’t count as “wrong” automatically—feedback comes from report/delete.
  const status = document.getElementById("sim-status");
  if (status) status.textContent = `Link opened — now decide: report or delete (Score: ${score.correct} / ${score.total})`;
}

function wireModal() {
  const modal = document.getElementById("sim-modal");
  const close = document.getElementById("sim-modal-close");
  close?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

function openModal(title, html) {
  const modal = document.getElementById("sim-modal");
  const body = document.getElementById("sim-modal-body");
  const t = document.getElementById("sim-modal-title");
  if (!modal || !body || !t) return;
  t.textContent = title;
  body.innerHTML = html;
  modal.classList.remove("hidden");
  document.body.classList.add("sim-lock");
}

function closeModal() {
  const modal = document.getElementById("sim-modal");
  const body = document.getElementById("sim-modal-body");
  if (!modal || !body) return;
  modal.classList.add("hidden");
  body.innerHTML = "";
  document.body.classList.remove("sim-lock");
}

init();

