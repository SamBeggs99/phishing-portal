import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n, getUI, fetchDataJson } from "./i18n.js";

function prefersReducedMotion() {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollIntoViewSafe(el, block = "start") {
  if (!el || typeof el.scrollIntoView !== "function") return;
  try {
    el.scrollIntoView({ block, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  } catch {
    try {
      el.scrollIntoView();
    } catch {
      /* ignore */
    }
  }
}

function scrollToTopSafe() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  } catch {
    try {
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  }
}

function makeCertSVG({ name, score, passed, date, ui }) {
  const q = ui?.quiz || {};
  const safeName = escapeHtml(name || "Participant");
  const statusColor = passed ? "#2ECC71" : "#F5A623";
  const statusLabel = passed ? (q.certifiedLabel || "Certified — Phishing Awareness") : (q.incompleteLabel || "Training Incomplete");
  const subtitle = q.certSubtitle || "has successfully completed the PAC Phishing Awareness Assessment";
  const issuedLabel = q.certIssued || "ISSUED";
  const slogan = q.certSlogan || "INTEGRATED GLOBALLY › IMPLEMENTED LOCALLY";
  const scoreNum = escapeHtml(String(score ?? ""));
  const scoreColor = passed ? "#2ECC71" : "#F5A623";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <defs>
    <linearGradient id="cert-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1c1b"/><stop offset="100%" stop-color="#141615"/></linearGradient>
  </defs>
  <rect width="1400" height="900" fill="url(#cert-bg)"/>
  <pattern id="cert-grain" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
  </pattern>
  <rect width="1400" height="900" fill="url(#cert-grain)"/>
  <rect x="72" y="72" width="1256" height="756" rx="18" fill="rgba(30,33,31,0.35)" stroke="rgba(171,35,40,0.35)" stroke-width="1"/>
  <rect x="100" y="100" width="1200" height="4" rx="2" fill="#AB2328" opacity="0.85"/>
  <g transform="translate(676,152)">
    <polygon points="24,2 28,12 38,12 30,18 33,28 24,22 15,28 18,18 10,12 20,12" fill="none" stroke="#AB2328" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="24,7 26,12 31,12 27,15 28.5,20 24,17 19.5,20 21,15 17,12 22,12" fill="#AB2328" opacity="0.25"/>
    <line x1="24" y1="2" x2="24" y2="0" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="38" y1="15" x2="40" y2="15" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="24" y1="28" x2="24" y2="30" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="10" y1="15" x2="8" y2="15" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
  </g>
  <text x="700" y="218" text-anchor="middle" font-size="12" font-family="ui-monospace,monospace" fill="#c75c60" letter-spacing="0.22em">THE PAC GROUP · IT SECURITY TRAINING</text>
  <text x="700" y="262" text-anchor="middle" font-size="22" font-family="ui-sans-serif,system-ui,sans-serif" fill="${statusColor}" font-weight="600">${escapeHtml(statusLabel)}</text>
  <line x1="460" y1="288" x2="940" y2="288" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="700" y="368" text-anchor="middle" font-size="52" font-family="ui-sans-serif,system-ui,sans-serif" fill="#F0F1F0" font-weight="600" letter-spacing="-0.02em">${safeName}</text>
  <text x="700" y="418" text-anchor="middle" font-size="17" font-family="ui-sans-serif,system-ui,sans-serif" fill="rgba(240,241,240,0.72)">${escapeHtml(subtitle)}</text>
  <rect x="530" y="448" width="340" height="88" rx="12" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
  <text x="700" y="482" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="rgba(240,241,240,0.55)" letter-spacing="0.2em">SCORE</text>
  <text x="700" y="520" text-anchor="middle" font-size="32" font-family="ui-monospace,monospace" fill="${scoreColor}" font-weight="700">${scoreNum}%</text>
  <rect x="100" y="748" width="1200" height="4" rx="2" fill="#AB2328" opacity="0.85"/>
  <text x="116" y="808" font-size="13" font-family="ui-monospace,monospace" fill="rgba(240,241,240,0.55)" letter-spacing="0.04em">${escapeHtml(issuedLabel)}: ${escapeHtml(date)}</text>
  <text x="1284" y="808" text-anchor="end" font-size="12" font-family="ui-monospace,monospace" fill="rgba(240,241,240,0.5)" letter-spacing="0.12em">${escapeHtml(slogan)}</text>
</svg>`;
}

async function init() {
  const ui = await initI18n(".");

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  const q = ui.quiz || {};

  // Update static text
  document.querySelector(".page-eyebrow").textContent = q.eyebrow || "Certification Assessment";
  document.querySelector(".page-hero h1").textContent = q.h1 || "Phishing Awareness Quiz";
  document.querySelector(".page-hero p").textContent = q.body || "10 questions · Score 80% or higher";
  const nameLabel = document.querySelector("label[for='quiz-name']");
  if (nameLabel) nameLabel.textContent = q.nameLabel || "Full name";
  const nameInput = document.getElementById("quiz-name");
  if (nameInput) nameInput.placeholder = q.namePlaceholder || "e.g. Alex Johnson";
  document.querySelector(".quiz-name-note")?.textContent && (document.querySelector(".quiz-name-note").textContent = q.nameNote || "");
  const submitBtn = document.querySelector("#quiz-form .btn.primary");
  if (submitBtn) submitBtn.childNodes[submitBtn.childNodes.length - 1].textContent = " " + (q.submitBtn || "Submit Quiz");
  const restartBtn = document.getElementById("quiz-restart");
  if (restartBtn) restartBtn.textContent = q.restartBtn || "Restart";
  const certTitle = document.querySelector("#certificate-section .section h2");
  if (certTitle) certTitle.textContent = q.certTitle || "Your PAC Certificate";
  const certNote = document.querySelector("#certificate-section .section .small-note");
  if (certNote) certNote.textContent = q.certNote || "";
  const dlBtn = document.getElementById("download-certificate");
  if (dlBtn) dlBtn.textContent = q.downloadBtn || "Download Certificate";
  const progressDisplay = document.getElementById("quiz-progress-display");
  const printBtn = document.getElementById("print-certificate");
  if (printBtn) printBtn.textContent = `🖨 ${q.printBtn || "Print"}`;

  let quizData;
  try {
    quizData = await fetchDataJson("quiz", ".");
  } catch {
    document.getElementById("quiz-questions").innerHTML = `<p class="small-note">Failed to load quiz.</p>`;
    return;
  }
  const questions = quizData.questions || [];
  const threshold = Number(quizData.passThresholdPercent ?? 80);

  const nameInput2 = document.getElementById("quiz-name");
  const form = document.getElementById("quiz-form");
  const questionsEl = document.getElementById("quiz-questions");
  const resultEl = document.getElementById("quiz-result");
  const certSection = document.getElementById("certificate-section");
  const certContainer = document.getElementById("certificate-container");
  const dlBtn2 = document.getElementById("download-certificate");
  let shuffledQuestions = [];
  let currentQuestionIndex = 0;
  let answers = [];

  const saved = localStorage.getItem("pac_quiz_name");
  if (saved && nameInput2 && !nameInput2.value) nameInput2.value = saved;
  if (progressDisplay) {
    progressDisplay.textContent = (q.progressDisplay || "{n} questions · {threshold}% to pass")
      .replace("{n}", questions.length)
      .replace("{threshold}", threshold);
  }

  resetAttempt();
  certSection.classList.add("hidden");

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resetAttempt() {
    shuffledQuestions = shuffle(questions);
    currentQuestionIndex = 0;
    answers = Array(shuffledQuestions.length).fill(null);
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    const ques = shuffledQuestions[currentQuestionIndex];
    const selected = answers[currentQuestionIndex];
    const total = shuffledQuestions.length;
    const isFirst = currentQuestionIndex === 0;
    const isLast = currentQuestionIndex === total - 1;
    const progress = Math.round(((currentQuestionIndex + 1) / total) * 100);

    questionsEl.innerHTML = `
      <div class="quiz-question">
        <h3>${(q.questionOf || "Question {n} of {total}").replace("{n}", currentQuestionIndex + 1).replace("{total}", total)}</h3>
        <p>${escapeHtml(ques.question)}</p>
        <div class="choices">
          ${ques.choices.map((c, ci) => {
            const id = `q-${currentQuestionIndex}-${ci}`;
            return `
              <label class="choice" for="${id}">
                <input type="radio" id="${id}" name="question-current" value="${escapeHtml(c.id)}" ${selected === c.id ? "checked" : ""}/>
                <div>
                  <div class="choice-label">${escapeHtml(c.label)}</div>
                  ${c.hint ? `<div class="choice-hint">${escapeHtml(c.hint)}</div>` : ""}
                </div>
              </label>`;
          }).join("")}
        </div>
        <div class="flex-row" style="margin-top:14px;justify-content:space-between;">
          <button class="btn sm" id="quiz-prev" type="button" ${isFirst ? "disabled" : ""}>← ${q.prevBtn || "Previous"}</button>
          <div class="small-note" style="font-size:12px;">${q.progressLabel || "Progress"}: ${progress}%</div>
          ${isLast
            ? `<button class="btn primary sm" id="quiz-submit-final" type="button">${q.submitBtn || "Submit Quiz"}</button>`
            : `<button class="btn primary sm" id="quiz-next" type="button">${q.nextBtn || "Next"} →</button>`}
        </div>
      </div>`;

    const choiceInputs = questionsEl.querySelectorAll("input[name='question-current']");
    choiceInputs.forEach(input => {
      input.addEventListener("change", () => {
        answers[currentQuestionIndex] = input.value;
      });
    });

    const prevBtn = document.getElementById("quiz-prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex === 0) return;
        currentQuestionIndex -= 1;
        renderCurrentQuestion();
      });
    }

    const nextBtn = document.getElementById("quiz-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (!answers[currentQuestionIndex]) {
          showResult("fail", q.answerRequired || "Please choose an answer before continuing.");
          return;
        }
        currentQuestionIndex += 1;
        renderCurrentQuestion();
      });
    }

    const submitFinalBtn = document.getElementById("quiz-submit-final");
    if (submitFinalBtn) {
      submitFinalBtn.addEventListener("click", submitQuiz);
    }
  }

  function submitQuiz() {
    const name = nameInput2.value.trim();
    if (!name) { showResult("fail", q.nameNote || "Please enter your name."); return; }
    localStorage.setItem("pac_quiz_name", name);

    const unanswered = answers.filter(a => a === null).length;
    if (unanswered) { showResult("fail", `${unanswered} unanswered`); return; }

    const correct = shuffledQuestions.filter((ques, i) => answers[i] === ques.correctChoiceId).length;
    const pct = Math.round((correct / shuffledQuestions.length) * 100);
    const passed = pct >= threshold;

    const bodyTpl = passed ? (q.passBody || "You scored {pct}% ({correct}/{total} correct). Minimum: {threshold}%.") : (q.failBody || "You scored {pct}% ({correct}/{total} correct). Minimum: {threshold}%.");
    const body = bodyTpl.replace("{pct}", pct).replace("{correct}", correct).replace("{total}", shuffledQuestions.length).replace("{threshold}", threshold);

    resultEl.className = `result ${passed ? "pass" : "fail"}`;
    resultEl.innerHTML = `
      <h2>${passed ? (q.passTitle || "Passed") : (q.failTitle || "Not quite")}</h2>
      <p style="font-size:15px;color:var(--text-2);line-height:1.6;margin:8px 0 10px;">${body}</p>
      <p class="small-note">${passed ? (q.passCert || "Your certificate is ready below.") : (q.failRetry || "Review the modules and try again.")}</p>
      ${!passed ? `<div style="height:12px"></div><a class="btn" href="./modules/phishing/index.html">← ${ui.nav?.modules || "Modules"}</a>` : ""}`;

    if (passed) {
      const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      const svg = makeCertSVG({ name, score: pct, passed, date, ui });
      certContainer.innerHTML = svg;
      certContainer.dataset.svg = svg;
      certSection.classList.remove("hidden");
    } else {
      certSection.classList.add("hidden");
    }
    scrollIntoViewSafe(resultEl, "start");
  }

  form.addEventListener("submit", e => e.preventDefault());

  document.getElementById("quiz-restart")?.addEventListener("click", () => {
    resultEl.className = "result"; resultEl.innerHTML = "";
    certSection.classList.add("hidden");
    resetAttempt();
    nameInput2.focus();
    scrollToTopSafe();
  });

  dlBtn2?.addEventListener("click", () => {
    const svg = certContainer?.dataset?.svg;
    if (!svg) return;
    const safeName = (nameInput2.value || "certificate").trim().replace(/[^a-z0-9\-_ ]/gi,"").replace(/\s+/g,"-").slice(0,60) || "certificate";
    const format = dlBtn2.dataset.format || "png";
    if (format === "svg") {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `PAC-cert-${safeName}.svg`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } else {
      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1400; canvas.height = 900;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return;
        }
        ctx.drawImage(img, 0, 0, 1400, 900);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a"); a.href = pngUrl; a.download = `PAC-cert-${safeName}.png`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(pngUrl), 500);
        }, "image/png");
      };
      img.src = url;
    }
  });

  document.getElementById("download-svg")?.addEventListener("click", () => {
    dlBtn2.dataset.format = "svg"; dlBtn2.click();
  });

  document.getElementById("email-cert")?.addEventListener("click", () => {
    const name = nameInput2.value.trim() || "Team Member";
    const subject = encodeURIComponent(`PAC Security Awareness Training — Completed: ${name}`);
    const body = encodeURIComponent(`Hi IT,\n\nThis email is to confirm that I have completed the PAC Security Awareness Training and passed the assessment.\n\nName: ${name}\nDate completed: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\nMy certificate is attached.\n\nRegards,\n${name}\n\n---\nNote: Please attach your downloaded certificate PNG to this email before sending.`);
    window.location.href = `mailto:phishing@pacgroup.com?subject=${subject}&body=${body}`;
  });

  function showResult(cls, msg) {
    resultEl.className = `result ${cls}`;
    resultEl.innerHTML = `<p class="small-note">${msg}</p>`;
    scrollIntoViewSafe(resultEl, "start");
  }
}

init();
