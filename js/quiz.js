import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n, getUI, getDataUrl } from "./i18n.js";

function makeCertSVG({ name, score, passed, date, ui }) {
  const q = ui?.quiz || {};
  const safeName = escapeHtml(name || "Participant");
  const statusColor = passed ? "#2ECC71" : "#F5A623";
  const statusLabel = passed ? (q.certifiedLabel || "Certified — Phishing Awareness") : (q.incompleteLabel || "Training Incomplete");
  const subtitle = q.certSubtitle || "has successfully completed the PAC Phishing Awareness Assessment";
  const issuedLabel = q.certIssued || "ISSUED";
  const slogan = q.certSlogan || "INTEGRATED GLOBALLY › IMPLEMENTED LOCALLY";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#181A19"/><stop offset="100%" stop-color="#212322"/></linearGradient></defs>
  <rect width="1400" height="900" fill="url(#bg)"/>
  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.7" fill="rgba(171,35,40,0.15)"/></pattern>
  <rect width="1400" height="900" fill="url(#dots)"/>
  <rect x="60" y="60" width="1280" height="780" rx="16" fill="none" stroke="rgba(171,35,40,0.22)" stroke-width="1"/>
  <rect x="72" y="108" width="1256" height="4" rx="2" fill="#AB2328" opacity="0.7"/>
  <rect x="72" y="788" width="1256" height="2" rx="1" fill="#AB2328" opacity="0.3"/>
  <g transform="translate(676,145)">
    <polygon points="24,2 28,12 38,12 30,18 33,28 24,22 15,28 18,18 10,12 20,12" fill="none" stroke="#AB2328" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="24,7 26,12 31,12 27,15 28.5,20 24,17 19.5,20 21,15 17,12 22,12" fill="#AB2328" opacity="0.25"/>
    <line x1="24" y1="2" x2="24" y2="0" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="38" y1="15" x2="40" y2="15" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="24" y1="28" x2="24" y2="30" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="10" y1="15" x2="8" y2="15" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
  </g>
  <text x="700" y="224" text-anchor="middle" font-size="13" font-family="ui-monospace,monospace" fill="rgba(171,35,40,0.9)" letter-spacing="4">THE PAC GROUP · IT SECURITY TRAINING</text>
  <text x="700" y="274" text-anchor="middle" font-size="20" font-family="ui-sans-serif,system-ui,sans-serif" fill="${statusColor}" font-weight="600">${escapeHtml(statusLabel)}</text>
  <rect x="600" y="290" width="200" height="1" fill="rgba(255,255,255,0.08)"/>
  <text x="700" y="428" text-anchor="middle" font-size="54" font-family="ui-sans-serif,system-ui,sans-serif" fill="#F0F1F0" font-weight="600" letter-spacing="-1">${safeName}</text>
  <text x="700" y="484" text-anchor="middle" font-size="18" font-family="ui-sans-serif,system-ui,sans-serif" fill="rgba(240,241,240,0.6)">${escapeHtml(subtitle)}</text>
  <rect x="612" y="510" width="176" height="46" rx="8" fill="rgba(171,35,40,0.15)" stroke="rgba(171,35,40,0.3)" stroke-width="1"/>
  <text x="700" y="529" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="rgba(171,35,40,0.8)" letter-spacing="2">SCORE</text>
  <text x="700" y="549" text-anchor="middle" font-size="17" font-family="ui-monospace,monospace" fill="#AB2328" font-weight="700">${score}%</text>
  <text x="120" y="736" font-size="13" font-family="ui-monospace,monospace" fill="rgba(240,241,240,0.35)" letter-spacing="0.5">${escapeHtml(issuedLabel)}: ${escapeHtml(date)}</text>
  <text x="1280" y="736" text-anchor="end" font-size="11" font-family="ui-monospace,monospace" fill="rgba(240,241,240,0.3)" letter-spacing="0.5">${escapeHtml(slogan)}</text>
  <circle cx="120" cy="796" r="5" fill="#AB2328" opacity="0.7"/>
  <circle cx="136" cy="796" r="5" fill="#AB2328" opacity="0.4"/>
  <circle cx="152" cy="796" r="5" fill="#AB2328" opacity="0.2"/>
</svg>`;
}

async function init() {
  const ui = await initI18n(".");
  window.__setLang = (l) => { localStorage.setItem("pac_lang", l); window.location.reload(); };

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

  const res = await fetch(getDataUrl("quiz", "."));
  if (!res.ok) { document.getElementById("quiz-questions").innerHTML = `<p class="small-note">Failed to load quiz.</p>`; return; }
  const quizData = await res.json();
  const questions = quizData.questions || [];
  const threshold = Number(quizData.passThresholdPercent ?? 80);

  const nameInput2 = document.getElementById("quiz-name");
  const form = document.getElementById("quiz-form");
  const questionsEl = document.getElementById("quiz-questions");
  const resultEl = document.getElementById("quiz-result");
  const certSection = document.getElementById("certificate-section");
  const certContainer = document.getElementById("certificate-container");
  const dlBtn2 = document.getElementById("download-certificate");

  const saved = localStorage.getItem("pac_quiz_name");
  if (saved && nameInput2 && !nameInput2.value) nameInput2.value = saved;
  if (progressDisplay) progressDisplay.textContent = (q.progressDisplay || "{n} questions · {threshold}% to pass").replace("{n}", questions.length).replace("{threshold}", threshold);

  renderQuestions();
  certSection.classList.add("hidden");

  function renderQuestions() {
    questionsEl.innerHTML = "";
    questions.forEach((ques, i) => {
      const div = document.createElement("div");
      div.className = "quiz-question";
      div.innerHTML = `
        <h3>${(q.questionOf || "Question {n} of {total}").replace("{n}", i+1).replace("{total}", questions.length)}</h3>
        <p>${escapeHtml(ques.question)}</p>
        <div class="choices">
          ${ques.choices.map(c => `
            <label class="choice" for="q${i}-${c.id}">
              <input type="radio" id="q${i}-${c.id}" name="question-${i}" value="${c.id}" required/>
              <div>
                <div class="choice-label">${escapeHtml(c.label)}</div>
                ${c.hint ? `<div class="choice-hint">${escapeHtml(c.hint)}</div>` : ""}
              </div>
            </label>`).join("")}
        </div>`;
      questionsEl.appendChild(div);
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = nameInput2.value.trim();
    if (!name) { showResult("fail", q.nameNote || "Please enter your name."); return; }
    localStorage.setItem("pac_quiz_name", name);

    const answers = questions.map((_, i) => document.querySelector(`input[name="question-${i}"]:checked`)?.value ?? null);
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered) { showResult("fail", `${unanswered} unanswered`); return; }

    const correct = questions.filter((ques, i) => answers[i] === ques.correctChoiceId).length;
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= threshold;

    const bodyTpl = passed ? (q.passBody || "You scored {pct}% ({correct}/{total} correct). Minimum: {threshold}%.") : (q.failBody || "You scored {pct}% ({correct}/{total} correct). Minimum: {threshold}%.");
    const body = bodyTpl.replace("{pct}", pct).replace("{correct}", correct).replace("{total}", questions.length).replace("{threshold}", threshold);

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
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("quiz-restart")?.addEventListener("click", () => {
    resultEl.className = "result"; resultEl.innerHTML = "";
    certSection.classList.add("hidden");
    renderQuestions();
    nameInput2.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        ctx.drawImage(img, 0, 0, 1400, 900);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
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
    const subject = encodeURIComponent(`PAC IT Security Certificate — ${name}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find my PAC IT Security Training certificate attached.\n\nI have completed the PAC Phishing Awareness Assessment and passed with the required score.\n\nPlease let me know if you need any further information.\n\nBest regards,\n${name}\n\n---\nNote: Please attach your downloaded certificate PNG to this email before sending.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });

  function showResult(cls, msg) {
    resultEl.className = `result ${cls}`;
    resultEl.innerHTML = `<p class="small-note">${msg}</p>`;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

init();
