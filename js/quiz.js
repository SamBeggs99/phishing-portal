import { escapeHtml, setActiveNav } from "./shared.js";
import { renderCertificate, downloadCertificateSvg } from "./certificate.js";

function getScorePercent({ correctCount, total }) {
  if (!total) return 0;
  return (correctCount / total) * 100;
}

function renderQuestions({ questions, quizRootEl }) {
  quizRootEl.innerHTML = "";
  questions.forEach((q, idx) => {
    const name = `question-${idx}`;
    const choicesHtml = q.choices.map((c) => {
      const inputId = `${name}-${c.id}`;
      return `
        <label class="choice" for="${inputId}">
          <input type="radio" id="${inputId}" name="${name}" value="${c.id}" required />
          <div>
            <div class="choice-label">${escapeHtml(c.label)}</div>
            ${c.hint ? `<div class="choice-hint">${escapeHtml(c.hint)}</div>` : ""}
          </div>
        </label>
      `;
    }).join("");

    const el = document.createElement("div");
    el.className = "quiz-question";
    el.innerHTML = `
      <h3>Question ${idx + 1} of ${questions.length}</h3>
      <p style="margin:0 0 14px;font-size:15px;color:var(--text);line-height:1.6;font-weight:500;">${escapeHtml(q.question)}</p>
      <div class="choices">${choicesHtml}</div>
    `;
    quizRootEl.appendChild(el);
  });
}

function readUserAnswers({ questions }) {
  return questions.map((_, idx) => {
    const el = document.querySelector(`input[name="question-${idx}"]:checked`);
    return el?.value ?? null;
  });
}

export async function initQuizPage() {
  setActiveNav();

  const quizDataUrl = new URL("./data/quiz.json", window.location.href).toString();
  const res = await fetch(quizDataUrl);
  if (!res.ok) {
    const quizRoot = document.getElementById("quiz-questions");
    if (quizRoot) quizRoot.innerHTML = `<p class="small-note">Failed to load quiz data.</p>`;
    return;
  }

  const quizData = await res.json();
  const questions = quizData.questions || [];
  const passThresholdPercent = Number(quizData.passThresholdPercent ?? 80);

  const nameInput = document.getElementById("quiz-name");
  const form = document.getElementById("quiz-form");
  const quizRootEl = document.getElementById("quiz-questions");
  const resultEl = document.getElementById("quiz-result");
  const certificateSection = document.getElementById("certificate-section");
  const certContainer = document.getElementById("certificate-container");
  const downloadBtn = document.getElementById("download-certificate");
  const progressDisplay = document.getElementById("quiz-progress-display");

  if (!nameInput || !form || !quizRootEl || !resultEl || !certificateSection || !certContainer) return;

  const saved = localStorage.getItem("phish_quiz_name");
  if (saved && !nameInput.value) nameInput.value = saved;

  if (progressDisplay) {
    progressDisplay.textContent = `${questions.length} questions · ${passThresholdPercent}% to pass`;
  }

  renderQuestions({ questions, quizRootEl });
  certificateSection.classList.add("hidden");
  resultEl.innerHTML = "";
  downloadBtn?.classList.add("hidden");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (nameInput.value || "").trim();
    if (!name) {
      resultEl.className = "result fail";
      resultEl.innerHTML = `<p class="small-note">Please enter your name before submitting.</p>`;
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    localStorage.setItem("phish_quiz_name", name);

    const answers = readUserAnswers({ questions });
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      resultEl.className = "result fail";
      resultEl.innerHTML = `<p class="small-note">Please answer all ${questions.length} questions before submitting (${unanswered} unanswered).</p>`;
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const correctCount = questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correctChoiceId ? 1 : 0), 0);
    const total = questions.length;
    const scorePercent = getScorePercent({ correctCount, total });
    const passed = scorePercent >= passThresholdPercent;

    resultEl.className = `result ${passed ? "pass" : "fail"}`;
    resultEl.innerHTML = `
      <h2 style="margin-bottom:8px;">${passed ? "✓ Passed" : "✗ Not quite"}</h2>
      <p style="font-size:15px;color:var(--text-2);line-height:1.6;margin-bottom:10px;">
        You scored <strong style="color:var(--text);">${Math.round(scorePercent)}%</strong> (${correctCount}/${total} correct). Minimum required: ${passThresholdPercent}%.
      </p>
      <p class="small-note">
        ${passed ? "Your certificate is ready below." : "Review the modules and try again."}
      </p>
      ${!passed ? `<div style="height:14px"></div><a class="btn" href="./modules/index.html">← Review Modules</a>` : ""}
    `;

    if (passed) {
      const issuedOn = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      renderCertificate({ name, scorePercent, passed, issuedOn, containerEl: certContainer });
      certificateSection.classList.remove("hidden");
      downloadBtn?.classList.remove("hidden");
    } else {
      certificateSection.classList.add("hidden");
      downloadBtn?.classList.add("hidden");
    }

    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("quiz-restart")?.addEventListener("click", () => {
    resultEl.className = "result";
    resultEl.innerHTML = "";
    certificateSection.classList.add("hidden");
    downloadBtn?.classList.add("hidden");
    renderQuestions({ questions, quizRootEl });
    nameInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  downloadBtn?.addEventListener("click", () => {
    downloadCertificateSvg({ name: nameInput.value, containerEl: certContainer });
  });
}
