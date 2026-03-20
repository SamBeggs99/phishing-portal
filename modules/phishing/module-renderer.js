import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar, markModuleComplete, renderCheckIn, initCheckIn } from "../../js/shared.js";
import { getHeaderHTML, getFooterHTML } from "../../js/header.js";
import { initI18n, getUI, getDataUrl } from "../../js/i18n.js";

export async function renderPhishingModule(topicId) {
  try {
    const ui = await initI18n("../..");
    window.__setLang = (l) => { localStorage.setItem("pac_lang",l); window.location.reload(); };

    document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: "../..", ui });
    document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: "../..", ui });
    setActiveNav(); initMobileNav(); updateProgressBar();

    const url = getDataUrl("phishing-modules", "../..");
    const res = await fetch(url);
    if (!res.ok) { document.getElementById("module-root").innerHTML = `<p class="small-note">Failed to load module.</p>`; return; }
    const data = await res.json();
    const topic = data.topics[topicId];
    if (!topic) { document.getElementById("module-root").innerHTML = `<p class="small-note">Module not found.</p>`; return; }

    const m = ui.module || {};
    const root = document.getElementById("module-root");
    if (topic.type === "types-of-phishing") root.innerHTML = renderTypes(topic, m);
    else root.innerHTML = renderStandard(topic, m);

    initMicroScenario(getMicroScenario(topic), ui);
    initCheckIn(topic.checkIn, ui);
    setTimeout(() => markModuleComplete(topicId), 8000);
  } catch (err) {
    console.error("Failed to render phishing module:", err);
    const root = document.getElementById("module-root");
    if (root) {
      root.innerHTML = `<p class="small-note">We couldn't render this module right now. Please refresh the page. If the problem continues, contact IT.</p>`;
    }
  }
}

function renderStandard(topic, m) {
  const quick = getQuickTakeaway(topic);
  const scenario = getMicroScenario(topic);
  const flags = (topic.redFlags || []).map(f => `<li>${escapeHtml(f)}</li>`).join("");
  const steps = (topic.responseSteps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const quickTakeaway = quick?.points?.length ? `
    <div class="content-section" style="border-color:var(--border-red);background:rgba(171,35,40,0.06);">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(quick.title || "1-minute takeaway")}</div>
      <ul class="list-clean">${quick.points.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    </div>` : "";
  const microScenario = scenario?.question ? `
    <div class="content-section">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(scenario.title || "Quick decision check")}</div>
      <p style="font-size:14px;color:var(--text-2);line-height:1.7;margin-bottom:12px;">${escapeHtml(scenario.question)}</p>
      <div class="choices" id="ms-choices">
        ${(scenario.choices || []).map(c => `
          <label class="choice ms-choice" data-id="${escapeHtml(c.id)}" style="cursor:pointer;">
            <input type="radio" name="ms-choice" value="${escapeHtml(c.id)}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
            <div><span class="choice-label">${escapeHtml(c.label)}</span></div>
          </label>`).join("")}
      </div>
      <div id="ms-feedback" class="hidden" style="margin-top:10px;padding:12px 14px;border-radius:var(--radius);font-size:13px;line-height:1.6;border-left:3px solid transparent;"></div>
    </div>` : "";
  const story = topic.story ? `
    <div class="content-section">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(m.realStory || "Real-world story")}</div>
      <h2 style="margin-bottom:4px;">${escapeHtml(topic.story.title)}</h2>
      <div class="mono-label" style="color:var(--text-3);margin-bottom:14px;">${escapeHtml(topic.story.meta)}</div>
      <p class="small-note" style="white-space:pre-wrap;font-size:14px;line-height:1.75;">${escapeHtml(topic.story.text)}</p>
    </div>` : "";
  const deeper = topic.deeperLearning ? `
    <details>
      <summary>${escapeHtml(topic.deeperLearning.title || m.deeperLearning || "Deeper learning")}</summary>
      <div class="details-body">
        ${(topic.deeperLearning.points || []).map(p => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(p)}</p>`).join("")}
      </div>
    </details>` : "";
  const checkInHTML = renderCheckIn(topic.checkIn, { module: m });

  return `
    <div class="module-body">
      ${quickTakeaway}
      <div class="content-section">
        <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(m.keyTakeaway || "Key takeaway")}</div>
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
      </div>
      ${story}
      <div class="content-two-col">
        <div class="content-section">
          <h2>🚩 ${escapeHtml(m.redFlags || "Red flags")}</h2>
          <ul class="list-clean">${flags || "<li>See module content</li>"}</ul>
        </div>
        <div class="content-section">
          <h2>✅ ${escapeHtml(m.howToRespond || "How to respond")}</h2>
          <ul class="list-clean">${steps || "<li>See module content</li>"}</ul>
        </div>
      </div>
      ${microScenario}
      ${deeper}
      ${checkInHTML}
    </div>`;
}

function initMicroScenario(scenario, ui) {
  if (!scenario?.question || !scenario?.correctChoiceId) return;
  const choicesRoot = document.getElementById("ms-choices");
  const feedback = document.getElementById("ms-feedback");
  if (!choicesRoot || !feedback) return;
  const m = ui?.module || {};
  choicesRoot.querySelectorAll(".ms-choice").forEach(lbl => {
    lbl.addEventListener("click", () => {
      const chosen = lbl.dataset.id;
      const correct = scenario.correctChoiceId;
      choicesRoot.querySelectorAll("input").forEach(i => i.disabled = true);
      choicesRoot.querySelectorAll(".ms-choice").forEach(opt => {
        opt.style.cursor = "default";
        if (opt.dataset.id === correct) {
          opt.style.borderColor = "rgba(46,204,113,0.4)";
          opt.style.background = "rgba(46,204,113,0.07)";
        } else if (opt.dataset.id === chosen && chosen !== correct) {
          opt.style.borderColor = "rgba(232,51,42,0.4)";
          opt.style.background = "rgba(232,51,42,0.07)";
        }
      });
      const ok = chosen === correct;
      feedback.classList.remove("hidden");
      feedback.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
      feedback.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";
      feedback.innerHTML = `
        <strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${escapeHtml(ok ? (m.correct || "Correct") : (m.incorrect || "Incorrect"))}</strong>
        <p style="margin-top:5px;color:var(--text-2);">${escapeHtml(scenario.bestAction || "")}</p>`;
    });
  });
}

function getQuickTakeaway(topic) {
  if (topic.quickTakeaway?.points?.length) return topic.quickTakeaway;
  const points = [];
  if (topic.summary) {
    const firstSentence = String(topic.summary).split(".")[0]?.trim();
    if (firstSentence) points.push(firstSentence + ".");
  }
  if (topic.redFlags?.[0]) points.push(`Watch for: ${topic.redFlags[0]}`);
  if (topic.responseSteps?.[0]) points.push(`Do first: ${topic.responseSteps[0]}`);
  if (!points.length) return null;
  return { title: "1-minute takeaway", points: points.slice(0, 3) };
}

function getMicroScenario(topic) {
  if (topic.microScenario?.question && topic.microScenario?.choices?.length) return topic.microScenario;
  const fallback = topic.checkIn?.[0];
  if (!fallback?.question || !fallback?.choices?.length || !fallback?.correctChoiceId) return null;
  return {
    title: "Quick decision check",
    question: fallback.question,
    choices: fallback.choices,
    correctChoiceId: fallback.correctChoiceId,
    bestAction: fallback.explanation || "Choose the safest verified path before acting."
  };
}

function renderTypes(topic, m) {
  const types = (topic.types || []).map(t => {
    const signals = (t.signals || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
    return `
      <div class="content-section">
        <h2>${escapeHtml(t.type)}</h2>
        <p class="small-note" style="margin-bottom:12px;">${escapeHtml(t.description)}</p>
        <ul class="list-clean">${signals}</ul>
      </div>`;
  }).join("");
  const deeper = topic.deeperLearning ? `
    <details>
      <summary>${escapeHtml(topic.deeperLearning.title || m.deeperLearning || "Deeper learning")}</summary>
      <div class="details-body">
        ${(topic.deeperLearning.points || []).map(p => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(p)}</p>`).join("")}
      </div>
    </details>` : "";
  const checkInHTML = renderCheckIn(topic.checkIn, { module: m });

  return `
    <div class="module-body">
      <div class="content-section">
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
      </div>
      <div class="grid-2">${types}</div>
      ${deeper}
      ${checkInHTML}
    </div>`;
}
