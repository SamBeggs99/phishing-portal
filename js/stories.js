import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar, isModuleComplete, markModuleComplete } from "./shared.js";
import { getHeaderHTML, getFooterHTML } from "./header.js";
import { initI18n, getDataUrl } from "./i18n.js";

async function init() {
  const ui = await initI18n(".");
  window.__setLang = (l) => { localStorage.setItem("pac_lang", l); window.location.reload(); };

  document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: ".", ui });
  document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: ".", ui });
  setActiveNav(); initMobileNav(); updateProgressBar();

  const s = ui.stories || {};
  document.querySelector(".page-eyebrow").textContent = s.eyebrow || "Real-World Stories";
  document.querySelector(".page-hero h1").textContent = s.h1 || "Real attacks. Real consequences.";
  document.querySelector(".page-hero p").textContent = s.body || "";

  const res = await fetch(getDataUrl("stories", "."));
  if (!res.ok) { document.getElementById("stories-root").innerHTML = `<p class="small-note">Failed to load stories.</p>`; return; }
  const data = await res.json();
  const items = data.examples || [];

  document.getElementById("stories-root").innerHTML = items.map((item, i) => {
    const storyId = `story_${slugify(item.title || String(i + 1))}`;
    const quick = renderStory30(item.story30);
    const checkIn = renderStoryCheckIn(item.checkIn, storyId, i);
    const completed = isModuleComplete(storyId);
    return `
    <div class="story-card ${completed ? "completed" : ""}" data-story-id="${escapeHtml(storyId)}">
      <div class="story-header">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <div class="story-meta">${escapeHtml(item.meta)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
          <div class="story-complete-badge" aria-label="Completed story"><span aria-hidden="true">✓</span> Completed</div>
          <div class="story-num">0${i+1}</div>
        </div>
      </div>
      ${quick}
      <p class="story-excerpt" style="white-space:pre-wrap;">${escapeHtml(item.scenario)}</p>
      <div class="mono-label" style="margin-bottom:8px;">${escapeHtml(s.whyWorked?.split("—")[0]?.trim() || "Red flags")}</div>
      <ul class="list-clean" style="margin-bottom:14px;">
        ${(item.redFlags||[]).map(f=>`<li>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <details>
        <summary>${escapeHtml(s.whyWorked || "Why it worked — and what you can do differently")}</summary>
        <div class="details-body">
          <p class="small-note" style="margin-bottom:10px;"><strong style="color:var(--text);">${escapeHtml(s.whyPhishing || "Why it was phishing")}:</strong> ${escapeHtml(item.whyItWasPhishing)}</p>
          <p class="small-note"><strong style="color:var(--text);">${escapeHtml(s.whatInstead || "What to do instead")}:</strong> ${escapeHtml(item.whatToDo)}</p>
        </div>
      </details>
      ${checkIn}
    </div>`;
  }).join("");

  initStoryCheckIns();
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "story";
}

function renderStory30(story30) {
  if (!story30) return "";
  const notice = (story30.whatToNotice || []).slice(0, 3).map(x => `<li>${escapeHtml(x)}</li>`).join("");
  const todo = (story30.whatToDo || []).slice(0, 2).map(x => `<li>${escapeHtml(x)}</li>`).join("");
  return `
    <div class="story-quick">
      <h4>Story in 30 seconds</h4>
      <div class="story-quick-grid">
        <div class="story-quick-item">
          <strong>Attack goal</strong>
          <p class="small-note">${escapeHtml(story30.attackGoal || "")}</p>
        </div>
        <div class="story-quick-item">
          <strong>How it worked</strong>
          <p class="small-note">${escapeHtml(story30.howItWorked || "")}</p>
        </div>
        <div class="story-quick-item">
          <strong>What to notice</strong>
          <ul class="list-clean">${notice}</ul>
        </div>
        <div class="story-quick-item">
          <strong>What to do at PAC</strong>
          <ul class="list-clean">${todo}</ul>
        </div>
      </div>
    </div>
  `;
}

function renderStoryCheckIn(checkIn, storyId, idx) {
  if (!checkIn?.question || !checkIn?.choices?.length || !checkIn?.correctChoiceId) return "";
  const qid = `sci_${idx}`;
  return `
    <div class="content-section" style="margin-top:14px;">
      <div class="mono-label" style="margin-bottom:4px;">Quick check-in</div>
      <p class="small-note" style="margin-bottom:16px;">One question to lock in what you just read.</p>
      <div class="checkin-question" data-story-checkin="1" data-story-id="${escapeHtml(storyId)}" data-correct="${escapeHtml(checkIn.correctChoiceId)}">
        <p style="font-size:14px;font-weight:500;color:var(--text);line-height:1.6;margin-bottom:12px;">${escapeHtml(checkIn.question)}</p>
        <div class="choices">
          ${(checkIn.choices || []).map(c => `
            <label class="choice story-checkin-choice" data-id="${escapeHtml(c.id)}" style="cursor:pointer;">
              <input type="radio" name="${qid}" value="${escapeHtml(c.id)}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
              <div><span class="choice-label">${escapeHtml(c.label)}</span></div>
            </label>
          `).join("")}
        </div>
        <div class="checkin-feedback hidden" style="margin-top:10px;padding:12px 14px;border-radius:var(--radius);font-size:13px;line-height:1.6;border-left:3px solid transparent;"></div>
        <div class="story-checkin-expl hidden">${escapeHtml(checkIn.explanation || "")}</div>
        <div class="small-note" style="margin-top:10px;color:var(--text-3);">Completing this marks the story as done on this device.</div>
      </div>
    </div>
  `;
}

function initStoryCheckIns() {
  document.querySelectorAll('[data-story-checkin="1"]').forEach(root => {
    const correct = root.getAttribute("data-correct");
    const storyId = root.getAttribute("data-story-id");
    const feedback = root.querySelector(".checkin-feedback");
    const inputs = root.querySelectorAll("input[type='radio']");
    if (!correct || !storyId || !feedback || !inputs.length) return;

    root.querySelectorAll(".story-checkin-choice").forEach(lbl => {
      lbl.addEventListener("click", () => {
        const chosen = lbl.getAttribute("data-id");
        const expl = root.querySelector(".story-checkin-expl")?.textContent || "";
        root.querySelectorAll("input").forEach(i => i.disabled = true);
        root.querySelectorAll(".story-checkin-choice").forEach(opt => {
          opt.style.cursor = "default";
          const id = opt.getAttribute("data-id");
          if (id === correct) {
            opt.style.borderColor = "rgba(46,204,113,0.4)";
            opt.style.background = "rgba(46,204,113,0.07)";
          } else if (chosen && id === chosen && chosen !== correct) {
            opt.style.borderColor = "rgba(232,51,42,0.4)";
            opt.style.background = "rgba(232,51,42,0.07)";
          }
        });

        const ok = chosen === correct;
        feedback.classList.remove("hidden");
        feedback.style.borderLeftColor = ok ? "#2ECC71" : "#AB2328";
        feedback.style.background = ok ? "rgba(46,204,113,0.05)" : "rgba(171,35,40,0.05)";

        // Find matching story item text already embedded? We stored explanation in DOM? Keep minimal for now:
        feedback.innerHTML = `
          <strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${ok ? "Correct" : "Incorrect"}</strong>
          <p style="margin-top:5px;color:var(--text-2);">${escapeHtml(expl || "Re-read the 30-second block and apply it to your next suspicious message.")}</p>
        `;

        markModuleComplete(storyId);
        const card = root.closest(".story-card");
        if (card) card.classList.add("completed");
      });
    });
  });
}

init();
