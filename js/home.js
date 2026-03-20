import { setActiveNav, initMobileNav, updateProgressBar, applyCompletionToCards } from "./js/shared.js";
import { getHeaderHTML, getFooterHTML } from "./js/header.js";
import { initI18n, getUI } from "./js/i18n.js";

async function init() {
  const ui = await initI18n(".");
  window.__setLang = (l) => { localStorage.setItem("pac_lang", l); window.location.reload(); };

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav();
  initMobileNav();
  updateProgressBar();
  applyCompletionToCards();

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

  // Learning path title
  const pathTitle = document.querySelector(".path-rail-label");
  if (pathTitle) pathTitle.textContent = h.pathTitle || "Your Learning Path";

  initLearningPathRailHighlight();

  // Path steps
  const pathSteps = document.querySelectorAll(".path-step");
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

  // Game section
  const gameTitle = document.querySelector(".game-title");
  const gameDesc = document.querySelector(".game-desc");
  const gameBtn = document.querySelector(".game-header .btn");
  if (gameTitle) gameTitle.textContent = h.gameTitle || "";
  if (gameDesc) gameDesc.textContent = h.gameDesc || "";
  if (gameBtn) gameBtn.textContent = (h.gameFullscreen || "Open full screen") + " ↗";

  // Module section cards
  const sectionLabels = document.querySelectorAll(".mono-label");
  const sectionH2s = document.querySelectorAll(".section h2");
  const sectionPs = document.querySelectorAll(".section p.small-note");
  const sectionBtns = document.querySelectorAll(".section .btn.primary");

  // Phishing section (first .section)
  if (sectionLabels[0]) sectionLabels[0].textContent = h.phishingLabel || "";
  if (sectionH2s[0]) sectionH2s[0].textContent = h.phishingH2 || "";
  if (sectionPs[0]) sectionPs[0].textContent = h.phishingDesc || "";
  if (sectionBtns[0]) sectionBtns[0].textContent = (h.phishingBtn || "Phishing Modules") + " ›";

  // IT section (second .section)
  if (sectionLabels[1]) sectionLabels[1].textContent = h.itLabel || "";
  if (sectionH2s[1]) sectionH2s[1].textContent = h.itH2 || "";
  if (sectionPs[1]) sectionPs[1].textContent = h.itDesc || "";
  if (sectionBtns[1]) sectionBtns[1].textContent = (h.itBtn || "IT Security Modules") + " ›";

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

  // Page title
  const lang = ui.lang || "EN";
  const titles = { "PT": "Treinamento em Segurança de TI — The PAC Group", "中文": "IT安全培训 — PAC集团", "ES": "Capacitación en Seguridad TI — The PAC Group" };
  if (titles[lang]) document.title = titles[lang];
}

function initLearningPathRailHighlight() {
  const shell = document.querySelector(".learning-path-shell");
  const rail = document.querySelector(".path-rail");
  if (!shell || !rail || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        rail.classList.toggle("active", entry.isIntersecting);
      });
    },
    { root: null, threshold: 0.2 }
  );

  observer.observe(shell);
}

init();
