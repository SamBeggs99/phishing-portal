import { initMatrixBackground } from "./background-matrix.js";

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
  ensureVisualFallbackSupport();
  ensureSiteBackground();
  const path = window.location.pathname.toLowerCase();
  document.querySelectorAll('a[data-nav="true"]').forEach(a => {
    let href = "";
    try { href = new URL(a.getAttribute("href") || "", window.location.href).pathname.toLowerCase(); } catch {}
    const active = path === href || path.endsWith(href);
    active ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
}

function ensureVisualFallbackSupport() {
  const supports = typeof CSS !== "undefined"
    && typeof CSS.supports === "function"
    && (CSS.supports("backdrop-filter: blur(2px)") || CSS.supports("-webkit-backdrop-filter: blur(2px)"));
  document.documentElement.classList.toggle("no-backdrop-filter", !supports);
}

function ensureSiteBackground() {
  if (window.__pacMatrixInitDone) return;
  const existing = document.getElementById("matrix-bg");
  const canvas = existing || document.createElement("canvas");
  if (!existing) {
    canvas.id = "matrix-bg";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
  }
  const started = initMatrixBackground(canvas);
  document.documentElement.classList.toggle("matrix-static-bg", !started);
  window.__pacMatrixInitDone = true;
}

export function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("nav-mobile");
  if (!toggle || !mobileNav) return;
  toggle.addEventListener("click", () => mobileNav.classList.toggle("open"));
}

const STORAGE_KEY = "pac_it_training_v4";

function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function markModuleComplete(moduleId) {
  const data = getProgress();
  data[moduleId] = true;
  saveProgress(data);
  updateProgressBar();
}

export function isModuleComplete(moduleId) {
  return !!getProgress()[moduleId];
}

const TOTAL_MODULES = 12;

export function updateProgressBar() {
  const data = getProgress();
  const completed = Object.keys(data).filter(k => data[k]).length;
  const pct = Math.round((completed / TOTAL_MODULES) * 100);
  const fill = document.getElementById("progress-fill");
  const count = document.getElementById("progress-count");
  if (fill) fill.style.width = pct + "%";
  if (count) {
    const tpl = count.dataset.tpl || "{n} / {total} modules";
    count.textContent = tpl.replace("{n}", completed).replace("{total}", TOTAL_MODULES);
  }
}

export function applyCompletionToCards() {
  const data = getProgress();
  document.querySelectorAll("[data-module-id]").forEach(el => {
    if (data[el.dataset.moduleId]) el.classList.add("completed");
  });
}

export function renderCheckIn(questions, ui) {
  if (!questions || questions.length === 0) return "";
  const m = ui?.module || {};

  const qs = questions.map((q, qi) => {
    const choices = q.choices.map(c => `
      <label class="choice checkin-choice" data-qi="${qi}" data-id="${c.id}" style="cursor:pointer;">
        <input type="radio" name="checkin-${qi}" value="${c.id}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
        <div><span class="choice-label">${escapeHtml(c.label)}</span></div>
      </label>`).join("");
    return `
      <div class="checkin-question" id="ciq-${qi}" style="margin-bottom:12px;">
        <p style="font-size:14px;font-weight:500;color:var(--text);line-height:1.6;margin-bottom:12px;">${escapeHtml(q.question)}</p>
        <div class="choices" id="ciq-choices-${qi}">${choices}</div>
        <div class="checkin-feedback hidden" id="ciq-fb-${qi}" style="margin-top:10px;padding:12px 14px;border-radius:var(--radius);font-size:13px;line-height:1.6;border-left:3px solid transparent;"></div>
      </div>`;
  }).join("");

  return `
    <div class="content-section" style="margin-top:14px;">
      <div class="mono-label" style="margin-bottom:4px;">${escapeHtml(m.checkIn || "Quick check-in")}</div>
      <p class="small-note" style="margin-bottom:16px;">${escapeHtml(m.checkInSubtitle || "Two quick questions to lock in what you've learned.")}</p>
      ${qs}
    </div>`;
}

export function initCheckIn(questions, ui) {
  if (!questions || questions.length === 0) return;
  const m = ui?.module || {};
  questions.forEach((q, qi) => {
    document.querySelectorAll(`[data-qi="${qi}"]`).forEach(lbl => {
      lbl.addEventListener("click", () => {
        const chosen = lbl.dataset.id;
        const correct = q.correctChoiceId;
        const fb = document.getElementById(`ciq-fb-${qi}`);
        const choicesEl = document.getElementById(`ciq-choices-${qi}`);
        choicesEl.querySelectorAll("input").forEach(i => i.disabled = true);
        choicesEl.querySelectorAll(".checkin-choice").forEach(l => {
          l.style.cursor = "default";
          if (l.dataset.id === correct) {
            l.style.borderColor = "rgba(46,204,113,0.4)";
            l.style.background = "rgba(46,204,113,0.07)";
          } else if (l.dataset.id === chosen && chosen !== correct) {
            l.style.borderColor = "rgba(232,51,42,0.4)";
            l.style.background = "rgba(232,51,42,0.07)";
          }
        });
        const ok = chosen === correct;
        fb.classList.remove("hidden");
        fb.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
        fb.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";
        fb.innerHTML = `
          <strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${escapeHtml(ok ? (m.correct||"Correct") : (m.incorrect||"Incorrect"))}</strong>
          <p style="margin-top:5px;color:var(--text-2);">${escapeHtml(q.explanation)}</p>`;
      });
    });
  });
}
