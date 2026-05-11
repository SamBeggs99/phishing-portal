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

  const setOpen = (open) => {
    mobileNav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.classList.toggle("nav-mobile-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(!mobileNav.classList.contains("open"));
  });

  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!mobileNav.classList.contains("open")) return;
    setOpen(false);
    toggle.focus();
  });
}

const STORAGE_KEY = "pac_it_training_v4";
/** Progress expires if nothing new is saved for this long (sliding: each completion refreshes the clock). */
const PROGRESS_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;

function isEnvelope(v) {
  return (
    !!v &&
    typeof v === "object" &&
    typeof v.savedAt === "number" &&
    Number.isFinite(v.savedAt) &&
    v.modules != null &&
    typeof v.modules === "object"
  );
}

function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (isEnvelope(parsed)) {
      if (Date.now() - parsed.savedAt > PROGRESS_MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        try {
          localStorage.removeItem("pac_quiz_name");
        } catch {
          /* ignore */
        }
        return {};
      }
      return { ...parsed.modules };
    }
    const legacy = { ...parsed };
    saveProgress(legacy);
    return legacy;
  } catch {
    return {};
  }
}

function saveProgress(modules) {
  try {
    const payload = { savedAt: Date.now(), modules: { ...modules } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export const MODULE_GROUPS = {
  phishing: ["urgency", "intimidation", "scarcity", "authority", "types-of-phishing"],
  itSecurity: ["clean-desk", "password-hygiene", "acceptable-use", "physical-security", "social-media", "remote-vpn", "incident-reporting", "ai-acceptable-use"]
};

export const TRAINING_MODULE_IDS = [...MODULE_GROUPS.phishing, ...MODULE_GROUPS.itSecurity];

export function markModuleComplete(moduleId) {
  const data = getProgress();
  data[moduleId] = true;
  saveProgress(data);
  updateProgressBar();
}

export function isModuleComplete(moduleId) {
  return !!getProgress()[moduleId];
}

export function getTrainingProgress() {
  const data = getProgress();
  const completedIds = TRAINING_MODULE_IDS.filter(id => !!data[id]);
  const total = TRAINING_MODULE_IDS.length;
  const completed = completedIds.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct, completedIds, data };
}

export function updateProgressBar() {
  const { completed, total, pct } = getTrainingProgress();
  const fill = document.getElementById("progress-fill");
  const count = document.getElementById("progress-count");
  if (fill) fill.style.width = pct + "%";
  if (count) {
    const tpl = count.dataset.tpl || "{n} / {total} modules";
    count.textContent = tpl.replace("{n}", completed).replace("{total}", total);
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

const MISSION_SURPRISE_CLOSE = "__pacCloseMissionSurprise";

/**
 * Random-delay mission overlay: Escape to close, Tab trap, focus return, and a stable close hook for post-score teardown.
 */
export function setupMissionSurpriseOverlay({ moduleKey, mission, overlay, panel, closeBtn }) {
  if (!mission?.steps?.length || !overlay || !panel || !closeBtn) return;

  const seenKey = `mission_prompt_seen_${moduleKey}`;
  if (sessionStorage.getItem(seenKey) === "1") return;

  let savedActive = null;
  let onKeydown = null;

  const focusableSelector =
    "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

  function getFocusables() {
    return Array.from(panel.querySelectorAll(focusableSelector)).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tabIndex === -1) return false;
      return el.offsetParent !== null || el === closeBtn;
    });
  }

  function close() {
    if (onKeydown) {
      document.removeEventListener("keydown", onKeydown, true);
      onKeydown = null;
    }
    const hadTrap = !overlay.classList.contains("hidden");
    overlay.classList.add("hidden");
    panel.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mission-lock");
    sessionStorage.setItem(seenKey, "1");
    overlay[MISSION_SURPRISE_CLOSE] = undefined;
    if (hadTrap && savedActive instanceof HTMLElement && document.contains(savedActive)) {
      try {
        savedActive.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    }
    savedActive = null;
  }

  function open() {
    if (sessionStorage.getItem(seenKey) === "1") return;
    savedActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    overlay.classList.remove("hidden");
    panel.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("mission-lock");

    onKeydown = (e) => {
      if (overlay.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const activeInPanel = active instanceof Node && panel.contains(active);
      if (e.shiftKey) {
        if (active === first || !activeInPanel) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !activeInPanel) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeydown, true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          closeBtn.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      });
    });
  }

  closeBtn.addEventListener("click", close);
  overlay[MISSION_SURPRISE_CLOSE] = close;

  const delayMs = (Math.floor(Math.random() * 11) + 5) * 1000;
  setTimeout(() => {
    if (sessionStorage.getItem(seenKey) === "1") return;
    open();
  }, delayMs);
}

/** Used after "Score my mission" so Escape handler and focus restore run. */
export function closeMissionSurpriseOverlayIfPresent() {
  const overlay = document.getElementById("mission-surprise-overlay");
  const fn = overlay?.[MISSION_SURPRISE_CLOSE];
  if (typeof fn === "function") fn();
}
