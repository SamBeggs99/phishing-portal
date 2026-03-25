import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar, markModuleComplete, renderCheckIn, initCheckIn } from "../../js/shared.js";
import { getHeaderHTML, getFooterHTML } from "../../js/header.js";
import { initI18n, getUI, fetchDataJson } from "../../js/i18n.js";

export async function renderPhishingModule(topicId) {
  try {
    const ui = await initI18n("../..");
    window.__setLang = (l) => { localStorage.setItem("pac_lang",l); window.location.reload(); };

    document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: "../..", ui });
    document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: "../..", ui });
    setActiveNav(); initMobileNav(); updateProgressBar();

    let data;
    try {
      data = await fetchDataJson("phishing-modules", "../..");
    } catch {
      document.getElementById("module-root").innerHTML = `<p class="small-note">Failed to load module.</p>`;
      return;
    }
    const topic = data.topics[topicId];
    if (!topic) { document.getElementById("module-root").innerHTML = `<p class="small-note">Module not found.</p>`; return; }

    const m = ui.module || {};
    const root = document.getElementById("module-root");
    if (topic.type === "types-of-phishing") root.innerHTML = renderTypes(topic, m);
    else root.innerHTML = renderStandard(topic, m);

    initMicroScenario(getMicroScenario(topic), ui);
    initRedFlagSpotter(topic.redFlagSpotter, ui);
    initMissionMode(topic.missionMode, ui);
    initMissionSurprise(topicId, topic.missionMode);
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
  const hero = getModuleHero(topic);
  const flags = (topic.redFlags || []).map(f => `<li>${escapeHtml(f)}</li>`).join("");
  const steps = (topic.responseSteps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const quickTakeaway = quick?.points?.length ? `
    <div class="content-section tone-warning">
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
  const redFlagSpotter = renderRedFlagSpotter(topic.redFlagSpotter);
  const missionMode = renderMissionMode(topic.missionMode);
  const missionSurprise = renderMissionSurprise(missionMode);
  const storySignals = topic.story?.signals?.length ? `
      <div class="mono-label" style="margin:14px 0 8px;">What to notice</div>
      <ul class="list-clean">${topic.story.signals.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
  ` : "";
  const story = topic.story ? `
    <div class="content-section tone-neutral">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(m.realStory || "Real-world story")}</div>
      <h2 style="margin-bottom:4px;">${escapeHtml(topic.story.title)}</h2>
      <div class="mono-label" style="color:var(--text-3);margin-bottom:14px;">${escapeHtml(topic.story.meta)}</div>
      <p class="small-note" style="white-space:pre-wrap;font-size:14px;line-height:1.75;">${escapeHtml(topic.story.text)}</p>
      ${storySignals}
    </div>` : "";
  const deeper = topic.deeperLearning ? `
    <details>
      <summary>${escapeHtml(topic.deeperLearning.title || m.deeperLearning || "Deeper learning")}</summary>
      <div class="details-body">
        ${(topic.deeperLearning.points || []).map(p => `<p class="small-note" style="margin-bottom:10px;">${escapeHtml(p)}</p>`).join("")}
      </div>
    </details>` : "";
  const checkInHTML = renderCheckIn(topic.checkIn, { module: m });
  const summary = `
    <div class="content-section tone-action">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(m.keyTakeaway || "Key takeaway")}</div>
      <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
    </div>`;
  const flagsAndSteps = `
    <div class="content-two-col">
      <div class="content-section">
        <h2>🚩 ${escapeHtml(m.redFlags || "Red flags")}</h2>
        <ul class="list-clean">${flags || "<li>See module content</li>"}</ul>
      </div>
      <div class="content-section">
        <h2>✅ ${escapeHtml(m.howToRespond || "How to respond")}</h2>
        <ul class="list-clean">${steps || "<li>See module content</li>"}</ul>
      </div>
    </div>`;
  const additionalGuidance = renderExpandableGroup(
    m.showMoreGuidance || "Optional practice and examples",
    [story, redFlagSpotter, microScenario, deeper, checkInHTML]
  );

  const variant = topic.layoutVariant || "default";
  const orderedSections = variant === "story-first"
    ? [hero, summary, flagsAndSteps, additionalGuidance]
    : variant === "scenario-first"
      ? [quickTakeaway, hero, summary, flagsAndSteps, additionalGuidance]
      : variant === "mission"
        ? [hero, quickTakeaway, summary, flagsAndSteps, additionalGuidance]
      : [quickTakeaway, hero, summary, flagsAndSteps, additionalGuidance];

  return `
    <div class="module-body">
      ${missionSurprise}
      ${orderedSections.filter(Boolean).join("")}
    </div>`;
}

function renderExpandableGroup(label, sections) {
  const body = (sections || []).filter(Boolean).join("");
  if (!body) return "";
  return `
    <details>
      <summary>${escapeHtml(label || "Show more")}</summary>
      <div class="details-body">
        ${body}
      </div>
    </details>`;
}

function renderMissionSurprise(missionHTML) {
  if (!missionHTML) return "";
  return `
    <div id="mission-surprise-overlay" class="mission-surprise-overlay hidden" role="dialog" aria-modal="true" aria-label="Mission Mode">
      <div id="mission-surprise-panel" class="mission-surprise-panel hidden">
        <button class="mission-surprise-close" id="mission-surprise-close" type="button" aria-label="Close mission">×</button>
        <div class="mission-surprise-head">
          <div class="mono-label" style="margin-bottom:4px;">Random mission</div>
          <p class="small-note">Mission triggered. Complete this challenge to continue.</p>
        </div>
        ${missionHTML}
      </div>
    </div>
  `;
}

function initMissionSurprise(moduleKey, mission) {
  if (!mission?.steps?.length) return;
  const overlay = document.getElementById("mission-surprise-overlay");
  const panel = document.getElementById("mission-surprise-panel");
  const closeBtn = document.getElementById("mission-surprise-close");
  if (!overlay || !panel || !closeBtn) return;

  const seenKey = `mission_prompt_seen_${moduleKey}`;
  if (sessionStorage.getItem(seenKey) === "1") return;

  const delayMs = (Math.floor(Math.random() * 11) + 5) * 1000;
  setTimeout(() => {
    if (sessionStorage.getItem(seenKey) === "1") return;
    overlay.classList.remove("hidden");
    panel.classList.remove("hidden");
    document.body.classList.add("mission-lock");
  }, delayMs);

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    panel.classList.add("hidden");
    document.body.classList.remove("mission-lock");
    sessionStorage.setItem(seenKey, "1");
  });
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

function getModuleHero(topic) {
  if (!topic.moduleHero?.title && !topic.moduleHero?.description) return "";
  return `
    <div class="content-section tone-neutral">
      <div class="module-hero-strip">
        <span class="module-hero-icon">${escapeHtml(topic.moduleHero?.icon || "🛡️")}</span>
        <div>
          <div class="mono-label" style="margin-bottom:5px;">Module focus</div>
          <h2 style="margin-bottom:6px;">${escapeHtml(topic.moduleHero?.title || "Think before you click")}</h2>
          <p class="small-note">${escapeHtml(topic.moduleHero?.description || "")}</p>
        </div>
      </div>
    </div>`;
}

function renderRedFlagSpotter(spotter) {
  if (!spotter?.prompt || !spotter?.flags?.length || !spotter?.correctFlagIds?.length) return "";
  return `
    <div class="content-section tone-warning">
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(spotter.title || "Spot the red flag")}</div>
      <p style="font-size:14px;color:var(--text-2);line-height:1.7;margin-bottom:12px;">${escapeHtml(spotter.prompt)}</p>
      <div class="red-flag-choices" id="rf-choices">
        ${(spotter.flags || []).map(flag => `
          <label class="choice rf-choice" data-id="${escapeHtml(flag.id)}">
            <input type="checkbox" value="${escapeHtml(flag.id)}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
            <div><span class="choice-label">${escapeHtml(flag.label)}</span></div>
          </label>`).join("")}
      </div>
      <button class="btn sm" id="rf-submit" type="button" style="margin-top:12px;">Check choices</button>
      <div id="rf-feedback" class="hidden" style="margin-top:10px;padding:12px 14px;border-radius:var(--radius);font-size:13px;line-height:1.6;border-left:3px solid transparent;"></div>
    </div>`;
}

function initRedFlagSpotter(spotter, ui) {
  if (!spotter?.correctFlagIds?.length) return;
  const root = document.getElementById("rf-choices");
  const submit = document.getElementById("rf-submit");
  const feedback = document.getElementById("rf-feedback");
  if (!root || !submit || !feedback) return;

  const m = ui?.module || {};
  submit.addEventListener("click", () => {
    const selected = [...root.querySelectorAll("input:checked")].map(i => i.value);
    const expected = [...spotter.correctFlagIds].sort();
    const actual = [...selected].sort();
    const ok = expected.length === actual.length && expected.every((id, idx) => id === actual[idx]);

    root.querySelectorAll("input").forEach(input => input.disabled = true);
    root.querySelectorAll(".rf-choice").forEach(choice => {
      const id = choice.dataset.id;
      if (spotter.correctFlagIds.includes(id)) {
        choice.style.borderColor = "rgba(46,204,113,0.4)";
        choice.style.background = "rgba(46,204,113,0.07)";
      } else if (selected.includes(id)) {
        choice.style.borderColor = "rgba(232,51,42,0.4)";
        choice.style.background = "rgba(232,51,42,0.07)";
      }
    });
    submit.disabled = true;
    feedback.classList.remove("hidden");
    feedback.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
    feedback.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";
    feedback.innerHTML = `
      <strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${escapeHtml(ok ? (m.correct || "Correct") : (m.incorrect || "Incorrect"))}</strong>
      <p style="margin-top:5px;color:var(--text-2);">${escapeHtml(spotter.explanation || "Review the suspicious cues and verify through trusted channels.")}</p>`;
  });
}

function renderMissionMode(mission) {
  if (!mission?.title || !mission?.steps?.length) return "";
  return `
    <div class="content-section mission-mode">
      <div class="mission-header">
        <div>
          <div class="mono-label" style="margin-bottom:8px;">Mission Mode</div>
          <h2 style="margin-bottom:6px;">${escapeHtml(mission.title)}</h2>
          <p class="small-note">${escapeHtml(mission.brief || "Make the safest decision at each step.")}</p>
        </div>
        <div class="mission-score" id="mission-score">0 / ${mission.steps.length}</div>
      </div>
      <div class="mission-steps" id="mission-steps">
        ${mission.steps.map((step, idx) => `
          <div class="mission-step" data-step="${idx}">
            <div class="mono-label" style="margin-bottom:6px;">Step ${idx + 1}</div>
            <p style="font-size:14px;color:var(--text-2);line-height:1.6;margin-bottom:10px;">${escapeHtml(step.prompt || "")}</p>
            <div class="choices">
              ${(step.choices || []).map(c => `
                <label class="choice mission-choice" data-step="${idx}" data-id="${escapeHtml(c.id)}" style="cursor:pointer;">
                  <input type="radio" name="mission-${idx}" value="${escapeHtml(c.id)}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
                  <div><span class="choice-label">${escapeHtml(c.label)}</span></div>
                </label>`).join("")}
            </div>
            <div class="hidden mission-feedback" id="mission-feedback-${idx}" style="margin-top:10px;padding:10px 12px;border-radius:var(--radius);font-size:12.5px;line-height:1.6;border-left:3px solid transparent;"></div>
          </div>
        `).join("")}
      </div>
      <button class="btn sm" id="mission-submit" type="button" style="margin-top:12px;">Score my mission</button>
    </div>`;
}

function initMissionMode(mission, ui) {
  if (!mission?.steps?.length) return;
  const submit = document.getElementById("mission-submit");
  const score = document.getElementById("mission-score");
  const stepsRoot = document.getElementById("mission-steps");
  if (!submit || !score || !stepsRoot) return;
  const m = ui?.module || {};

  submit.addEventListener("click", () => {
    let total = 0;
    mission.steps.forEach((step, idx) => {
      const chosen = stepsRoot.querySelector(`input[name="mission-${idx}"]:checked`)?.value;
      const feedback = document.getElementById(`mission-feedback-${idx}`);
      if (!feedback) return;
      const ok = chosen === step.correctChoiceId;
      if (ok) total += 1;
      stepsRoot.querySelectorAll(`.mission-choice[data-step="${idx}"]`).forEach(opt => {
        opt.style.cursor = "default";
        if (opt.dataset.id === step.correctChoiceId) {
          opt.style.borderColor = "rgba(46,204,113,0.4)";
          opt.style.background = "rgba(46,204,113,0.07)";
        } else if (chosen && opt.dataset.id === chosen) {
          opt.style.borderColor = "rgba(232,51,42,0.4)";
          opt.style.background = "rgba(232,51,42,0.07)";
        }
      });
      stepsRoot.querySelectorAll(`input[name="mission-${idx}"]`).forEach(i => i.disabled = true);
      feedback.classList.remove("hidden");
      feedback.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
      feedback.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";
      feedback.innerHTML = `<strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${escapeHtml(ok ? (m.correct || "Correct") : (m.incorrect || "Incorrect"))}</strong><p style="margin-top:4px;color:var(--text-2);">${escapeHtml(step.bestAction || "")}</p>`;
    });
    score.textContent = `${total} / ${mission.steps.length}`;
    submit.disabled = true;
    setTimeout(() => {
      const overlay = document.getElementById("mission-surprise-overlay");
      const panel = document.getElementById("mission-surprise-panel");
      if (overlay) overlay.classList.add("hidden");
      if (panel) panel.classList.add("hidden");
      document.body.classList.remove("mission-lock");
    }, 2000);
  });
}

function renderTypes(topic, m) {
  const qrDemo = topic.qrPhishingDemo?.image?.src ? `
      <div class="content-section tone-warning">
        <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(topic.qrPhishingDemo.title || "QR phishing demo")}</div>
        <h2 style="margin-bottom:6px;">${escapeHtml(topic.qrPhishingDemo.entice || "Scan the code to continue")}</h2>
        <p class="small-note" style="margin-bottom:12px;">${escapeHtml(topic.qrPhishingDemo.instruction || "")}</p>
        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
          <img
            src="${escapeHtml(topic.qrPhishingDemo.image.src)}"
            alt="${escapeHtml(topic.qrPhishingDemo.image.alt || "QR code")}"
            style="width:220px;max-width:100%;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:#fff;padding:10px;"
            loading="lazy"
          />
          <div style="flex:1;min-width:220px;">
            <div class="mono-label" style="margin:2px 0 8px;">Before you scan</div>
            <ul class="list-clean">
              <li>${escapeHtml(topic.qrPhishingDemo.safety || "Do not enter real credentials. Close the page if it requests sensitive info.")}</li>
              <li>On phones, your camera app will show a preview. If the domain looks unfamiliar, do not proceed.</li>
              <li>If you’re on desktop or can’t scan, you can still continue—this demo is optional.</li>
            </ul>
          </div>
        </div>
      </div>
  ` : "";

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
  const additionalGuidance = renderExpandableGroup(
    m.showMoreGuidance || "Optional practice and examples",
    [deeper, checkInHTML]
  );

  return `
    <div class="module-body">
      <div class="content-section">
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${escapeHtml(topic.summary || "")}</p>
      </div>
      ${qrDemo}
      <div class="grid-2">${types}</div>
      ${additionalGuidance}
    </div>`;
}
