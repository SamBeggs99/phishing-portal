import { setActiveNav, initMobileNav, updateProgressBar, applyCompletionToCards, getTrainingProgress, MODULE_GROUPS } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n, getUI } from "./i18n.js";

async function init() {
  const ui = await initI18n(".");

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav();
  initMobileNav();
  updateProgressBar();
  applyCompletionToCards();
  initStartHereAndGoals(ui);

  const h = ui.home || {};
  const n = ui.nav || {};
  const p = ui.progress || {};

  // Hero
  const eyebrow = document.querySelector(".hero-eyebrow");
  if (eyebrow) { eyebrow.innerHTML = `<span class="hero-dot"></span>${h.eyebrow || "ONE PAC · Active Training Program"}`; }

  const heroH1 = document.querySelector(".hero h1");
  if (heroH1) heroH1.innerHTML = `${h.h1line1||"Stay"} <strong>${h.h1strong1||"secure"}</strong>.<br>${h.h1line2||"Stay"} <strong>${h.h1strong2||"aware"}</strong>.<br>${h.h1line3||"Stay"} <strong>${h.h1strong3||"PAC"}</strong>.`;

  const heroP = document.querySelector(".hero > p");
  if (heroP) heroP.textContent = h.body || "";

  // CTA buttons
  const ctaBtns = document.querySelectorAll(".cta-row a");
  if (ctaBtns[0]) ctaBtns[0].textContent = (h.ctaStart || "Start Your Training") + " ›";
  if (ctaBtns[1]) ctaBtns[1].textContent = h.ctaQuiz || "Take the Quiz";

  // Stats
  const statLabels = document.querySelectorAll(".stat-label");
  const statKeys = ["statModules","statStories","statQuestions","statGame","statCertify"];
  statLabels.forEach((el, i) => { if (statKeys[i]) el.textContent = h[statKeys[i]] || el.textContent; });

  // Why this matters (brief)
  const wm = document.getElementById("why-matters");
  if (wm) {
    const lbl = wm.querySelector(".mono-label");
    const h2 = wm.querySelector("h2");
    const p = wm.querySelector("p.small-note");
    const cards = wm.querySelectorAll(".grid-3 > div");
    if (lbl) lbl.textContent = h.whyMattersLabel || lbl.textContent;
    if (h2) h2.textContent = h.whyMattersH2 || h2.textContent;
    if (p) p.textContent = h.whyMattersBody || p.textContent;
    const cardMap = [
      { t: "whyMattersCard1Title", b: "whyMattersCard1Body" },
      { t: "whyMattersCard2Title", b: "whyMattersCard2Body" },
      { t: "whyMattersCard3Title", b: "whyMattersCard3Body" }
    ];
    cards.forEach((c, i) => {
      const t = c.querySelector(".mono-label");
      const bp = c.querySelector("p");
      if (cardMap[i]) {
        if (t && h[cardMap[i].t]) t.textContent = h[cardMap[i].t];
        if (bp && h[cardMap[i].b]) bp.textContent = h[cardMap[i].b];
      }
    });
  }

  // Facts (statistics) strip label
  const factsLabel = document.getElementById("home-facts-label");
  if (factsLabel) factsLabel.textContent = h.factsLabel || factsLabel.textContent;

  // Learning path title
  const pathTitle = document.querySelector(".path-rail-label");
  if (pathTitle) pathTitle.textContent = h.pathTitle || "Your Learning Path";

  initLearningPathRailHighlight();

  // Path steps
  const pathSteps = document.querySelectorAll(".path-step");
  const railStepTitles = document.querySelectorAll(".path-rail-step-title");
  const pathData = [
    { num: "Step 01", title: h.step1Title, desc: h.step1Desc },
    { num: "Step 02", title: h.step2Title, desc: h.step2Desc },
    { num: "Step 03", title: h.step3Title, desc: h.step3Desc },
    { num: "Step 04", title: h.step4Title, desc: h.step4Desc },
  ];
  pathSteps.forEach((el, i) => {
    if (!pathData[i]) return;
    const t = el.querySelector("h3");
    const d = el.querySelector("p");
    if (t && pathData[i].title) t.textContent = pathData[i].title;
    if (d && pathData[i].desc) d.textContent = pathData[i].desc;
  });
  railStepTitles.forEach((el, i) => {
    if (!pathData[i]) return;
    if (pathData[i].title) el.textContent = pathData[i].title;
  });

  // Game section
  const gameTitle = document.querySelector(".game-title");
  const gameDesc = document.querySelector(".game-desc");
  const gameBtn = document.querySelector(".game-header .btn");
  if (gameTitle) gameTitle.textContent = h.gameTitle || "";
  if (gameDesc) gameDesc.textContent = h.gameDesc || "";
  if (gameBtn) gameBtn.textContent = (h.gameFullscreen || "Open full screen") + " ↗";

  // Module overview cards (targeted selectors; avoids index-based clobbering)
  const phLabel = document.getElementById("home-card-phishing-label");
  const phH2 = document.getElementById("home-card-phishing-h2");
  const phDesc = document.getElementById("home-card-phishing-desc");
  const phBtn = document.getElementById("home-card-phishing-btn");
  if (phLabel) phLabel.textContent = h.phishingLabel || phLabel.textContent;
  if (phH2) phH2.textContent = h.phishingH2 || phH2.textContent;
  if (phDesc) phDesc.textContent = h.phishingDesc || phDesc.textContent;
  if (phBtn) phBtn.textContent = ((h.phishingBtn || "Phishing Modules") + " ›");

  const itLabel = document.getElementById("home-card-it-label");
  const itH2 = document.getElementById("home-card-it-h2");
  const itDesc = document.getElementById("home-card-it-desc");
  const itBtn = document.getElementById("home-card-it-btn");
  if (itLabel) itLabel.textContent = h.itLabel || itLabel.textContent;
  if (itH2) itH2.textContent = h.itH2 || itH2.textContent;
  if (itDesc) itDesc.textContent = h.itDesc || itDesc.textContent;
  if (itBtn) itBtn.textContent = ((h.itBtn || "IT Security Modules") + " ›");

  // "Do this today" section
  const todayTitle = document.querySelector(".today-title");
  const todaySubtitle = document.querySelector(".today-subtitle");
  if (todayTitle) todayTitle.textContent = h.todayTitle || "";
  if (todaySubtitle) todaySubtitle.textContent = h.todaySubtitle || "";

  const todayItems = document.querySelectorAll(".dt");
  const todayData = [
    { label: h.today1label, text: h.today1 },
    { label: h.today2label, text: h.today2 },
    { label: h.today3label, text: h.today3 },
    { label: h.today4label, text: h.today4 },
    { label: h.today5label, text: h.today5 },
  ];
  todayItems.forEach((el, i) => {
    if (!todayData[i]) return;
    const lbl = el.querySelector(".dtlbl");
    const p = el.querySelector("p");
    if (lbl && todayData[i].label) lbl.textContent = todayData[i].label;
    if (p && todayData[i].text) p.textContent = todayData[i].text;
  });

  const reportLbl = document.querySelector(".report-lbl");
  if (reportLbl) reportLbl.textContent = h.reportLabel || "Report phishing";
}

function initLearningPathRailHighlight() {
  const trigger = document.getElementById("learning-path");
  const rail = document.querySelector(".page-path-rail");
  if (!trigger || !rail || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        rail.classList.toggle("active", entry.isIntersecting);
      });
    },
    { root: null, threshold: 0.2 }
  );

  observer.observe(trigger);
}

function initStartHereAndGoals(ui) {
  const { completed, total, pct, data } = getTrainingProgress();

  const goalsPct = document.getElementById("goals-pct");
  const goalsCount = document.getElementById("goals-count");
  if (goalsPct) goalsPct.textContent = `${pct}%`;
  if (goalsCount) goalsCount.textContent = `${completed} / ${total} modules completed`;

  const phishingDone = MODULE_GROUPS.phishing.every(id => !!data[id]);
  const itDone = MODULE_GROUPS.itSecurity.every(id => !!data[id]);

  const goalsList = document.getElementById("goals-list");
  if (goalsList) {
    const rows = [
      { done: phishingDone, label: "Complete all Phishing modules (5)" },
      { done: itDone, label: "Complete all IT Security modules (8)" },
      { done: phishingDone && itDone, label: "Take the quiz and score 80%+ for certification" }
    ];
    goalsList.innerHTML = rows.map(r => `
      <li style="display:flex;gap:10px;align-items:flex-start;">
        <span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;margin-top:2px;background:${r.done ? "rgba(46,204,113,0.14)" : "rgba(245,166,35,0.12)"};border:1px solid ${r.done ? "rgba(46,204,113,0.35)" : "rgba(245,166,35,0.25)"};color:${r.done ? "#2ECC71" : "#F5A623"};font-size:12px;font-weight:700;">
          ${r.done ? "✓" : "•"}
        </span>
        <span style="color:var(--text-2);line-height:1.6;">${r.label}</span>
      </li>
    `).join("");
  }

  const cta = document.getElementById("start-here-cta");
  const copy = document.getElementById("start-here-copy");
  if (!cta || !copy) return;

  if (!phishingDone) {
    cta.href = "./modules/phishing/index.html";
    cta.textContent = "Continue: Phishing modules ›";
    copy.textContent = "Start with the phishing tactics—they’re the fastest way to build the ‘pause and verify’ habit.";
  } else if (!itDone) {
    cta.href = "./modules/it-security/index.html";
    cta.textContent = "Continue: IT Security modules ›";
    copy.textContent = "Next, lock in the everyday security habits that prevent incidents before they start.";
  } else {
    cta.href = "./quiz.html";
    cta.textContent = "Take the quiz + earn certificate ›";
    copy.textContent = "You’ve completed the modules. Take the quiz to certify—80%+ earns your certificate.";
  }
}

init();
