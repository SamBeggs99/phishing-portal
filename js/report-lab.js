import { setActiveNav, initMobileNav, updateProgressBar, markModuleComplete, isModuleComplete, escapeHtml } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n } from "./i18n.js";

const PRACTICE_KEY = "practice_report-lab";

const STEPS = [
  {
    title: "Step 1 — Find the right place in the ribbon",
    body: "In PAC Outlook, the Barracuda button is in the <strong>Add-ins</strong> section of the ribbon (Home tab).",
    hint: "Click the Barracuda button on the ribbon to continue."
  },
  {
    title: "Step 2 — Confirm you’re reporting",
    body: "Reporting sends the message to Security for investigation. It helps protect others if the campaign is widespread.",
    hint: "In the dialog, click <strong>Report phishing</strong> to complete the lab."
  },
  {
    title: "Step 3 — You’re done (what happens next)",
    body: "After you report, Security can analyze the message, block the sender/domain, and warn others if needed.",
    hint: "You can now practice in the Inbox Simulator."
  }
];

let stepIdx = 0;
let openedDialog = false;
let reported = false;

async function init() {
  const ui = await initI18n(".");

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  wireRibbon();
  wireModal();
  wireNav();
  render();

  if (isModuleComplete(PRACTICE_KEY)) {
    setCompletedUI(true);
    stepIdx = 2;
    render();
  }
}

function wireNav() {
  document.getElementById("rl-back")?.addEventListener("click", () => {
    stepIdx = Math.max(0, stepIdx - 1);
    render();
  });
  document.getElementById("rl-next")?.addEventListener("click", () => {
    stepIdx = Math.min(STEPS.length - 1, stepIdx + 1);
    render();
  });
}

function wireRibbon() {
  const barracuda = document.getElementById("rl-barracuda-btn");
  barracuda?.addEventListener("click", () => {
    openedDialog = true;
    openModal();
    if (stepIdx === 0) {
      stepIdx = 1;
      render();
    }
  });
}

function wireModal() {
  document.getElementById("rl-modal-close")?.addEventListener("click", closeModal);
  document.getElementById("rl-modal-cancel")?.addEventListener("click", closeModal);
  document.getElementById("rl-modal")?.addEventListener("click", (e) => { if (e.target?.id === "rl-modal") closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  document.getElementById("rl-modal-report")?.addEventListener("click", () => {
    reported = true;
    showToast("Reported (simulation). Nice—fast reporting protects everyone.");
    markModuleComplete(PRACTICE_KEY);
    setCompletedUI(true);
    if (stepIdx < 2) stepIdx = 2;
    render();
  });
}

function render() {
  const step = STEPS[stepIdx];
  const fill = document.getElementById("rl-fill");
  const label = document.getElementById("rl-step-label");
  const box = document.getElementById("rl-instructions");
  const next = document.getElementById("rl-next");
  const back = document.getElementById("rl-back");

  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `Step ${stepIdx + 1} of ${STEPS.length}`;

  if (box) {
    const gateMsg = stepIdx === 0 && !openedDialog
      ? `<div class="report-lab-gate">To continue: click <strong>Barracuda</strong> in the <strong>Add-ins</strong> section.</div>`
      : stepIdx === 1 && openedDialog && !reported
        ? `<div class="report-lab-gate">To finish: in the dialog, click <strong>Report phishing</strong>.</div>`
        : "";

    box.innerHTML = `
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(step.title)}</div>
      <p class="small-note" style="margin-bottom:12px;">${step.body}</p>
      ${gateMsg}
      <div class="small-note" style="color:var(--text-3);margin-top:10px;">${step.hint}</div>
    `;
  }

  if (back) back.disabled = stepIdx === 0;
  if (next) {
    const gated = (stepIdx === 0 && !openedDialog) || (stepIdx === 1 && !reported);
    next.disabled = gated;
    next.textContent = stepIdx === STEPS.length - 1 ? "Done" : "Next ›";
  }
}

function openModal() {
  const modal = document.getElementById("rl-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("sim-lock");
}

function closeModal() {
  const modal = document.getElementById("rl-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("sim-lock");
}

function showToast(msg) {
  const t = document.getElementById("rl-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2800);
}

function setCompletedUI(on) {
  const pill = document.getElementById("rl-complete-pill");
  if (pill) pill.style.display = on ? "inline-flex" : "none";
}

init();

