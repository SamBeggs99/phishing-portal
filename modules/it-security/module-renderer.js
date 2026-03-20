import { escapeHtml, setActiveNav, initMobileNav, updateProgressBar, markModuleComplete, renderCheckIn, initCheckIn } from "../../js/shared.js";
import { getHeaderHTML, getFooterHTML } from "../../js/header.js";
import { initI18n, getDataUrl } from "../../js/i18n.js";

export async function renderITModule(moduleId) {
  try {
    const ui = await initI18n("../..");
    window.__setLang = (l) => { localStorage.setItem("pac_lang", l); window.location.reload(); };
    document.getElementById("header-root").innerHTML = getHeaderHTML({ rootPrefix: "../..", ui });
    document.getElementById("footer-root").innerHTML = getFooterHTML({ rootPrefix: "../..", ui });
    setActiveNav(); initMobileNav(); updateProgressBar();

    const res = await fetch(getDataUrl("it-security", "../.."));
    if (!res.ok) { document.getElementById("module-root").innerHTML = `<p class="small-note">Failed to load module.</p>`; return; }
    const data = await res.json();
    const t = data.topics[moduleId];
    if (!t) { document.getElementById("module-root").innerHTML = `<p class="small-note">Module not found.</p>`; return; }

    const m = ui.module || {};
    const e = s => escapeHtml(String(s ?? ""));
    const ul = arr => arr?.length ? `<ul class="list-clean">${arr.map(f=>`<li>${e(f)}</li>`).join("")}</ul>` : "";
    const quickTakeaway = t.quickTakeaway?.points?.length ? `
      <div class="content-section" style="border-color:var(--border-red);background:rgba(171,35,40,0.06);">
        <div class="mono-label" style="margin-bottom:8px;">${e(t.quickTakeaway.title || "1-minute takeaway")}</div>
        ${ul(t.quickTakeaway.points)}
      </div>` : "";
    const microScenario = t.microScenario?.question ? `
      <div class="content-section">
        <div class="mono-label" style="margin-bottom:8px;">${e(t.microScenario.title || "Quick decision check")}</div>
        <p style="font-size:14px;color:var(--text-2);line-height:1.7;margin-bottom:12px;">${e(t.microScenario.question)}</p>
        <div class="choices" id="ms-choices">
          ${(t.microScenario.choices || []).map(c => `
            <label class="choice ms-choice" data-id="${e(c.id)}" style="cursor:pointer;">
              <input type="radio" name="ms-choice" value="${e(c.id)}" style="margin-top:3px;accent-color:#AB2328;flex-shrink:0;width:14px;height:14px;"/>
              <div><span class="choice-label">${e(c.label)}</span></div>
            </label>`).join("")}
        </div>
        <div id="ms-feedback" class="hidden" style="margin-top:10px;padding:12px 14px;border-radius:var(--radius);font-size:13px;line-height:1.6;border-left:3px solid transparent;"></div>
      </div>` : "";
    const ol_numbered = (arr, color="var(--pac-red)", bg="var(--red-glow)", border="var(--border-red)") =>
    arr?.length ? `<ol style="list-style:none;display:flex;flex-direction:column;gap:8px;padding:0;">${arr.map((s,i)=>`
      <li style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-family:var(--mono);font-size:10px;color:${color};background:${bg};border:1px solid ${border};border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i+1}</span>
        <span style="font-size:13.5px;color:var(--text-2);line-height:1.6;">${e(s)}</span>
      </li>`).join("")}</ol>` : "";

  const story = t.story ? `
    <div class="content-section">
      <div class="mono-label" style="margin-bottom:8px;">${e(m.realStory||"Real-world story")}</div>
      <h2 style="margin-bottom:4px;">${e(t.story.title)}</h2>
      <div class="mono-label" style="color:var(--text-3);margin-bottom:14px;">${e(t.story.meta)}</div>
      <p class="small-note" style="white-space:pre-wrap;font-size:14px;line-height:1.75;">${e(t.story.text)}</p>
    </div>` : "";

  const deeper = t.deeperLearning ? `
    <details><summary>${e(t.deeperLearning.title||"Deeper learning")}</summary>
      <div class="details-body">${(t.deeperLearning.points||[]).map(p=>`<p class="small-note" style="margin-bottom:10px;">${e(p)}</p>`).join("")}</div>
    </details>` : "";

  // ── Clean Desk extras ──
  const eodChecklist = t.endOfDayChecklist ? `
    <div class="content-section">
      <div class="mono-label" style="margin-bottom:8px;">End-of-day checklist</div>
      <p class="small-note" style="margin-bottom:12px;">Before you leave your desk every day:</p>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;padding:0;">
        ${t.endOfDayChecklist.map(item=>`
          <li style="display:flex;gap:10px;align-items:flex-start;">
            <span style="width:18px;height:18px;border:1.5px solid rgba(46,204,113,0.4);border-radius:4px;flex-shrink:0;margin-top:2px;"></span>
            <span style="font-size:13.5px;color:var(--text-2);">${e(item)}</span>
          </li>`).join("")}
      </ul>
    </div>` : "";

  const publicSpaces = t.publicSpaces ? `
    <div class="content-section"><h2>${e(t.publicSpaces.title)}</h2>${ul(t.publicSpaces.points)}</div>` : "";

  // ── Password extras ──
  const passwordStrength = t.passwordStrength ? `
    <div class="content-section">
      <h2>${e(t.passwordStrength.title)}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div>
          <div class="mono-label" style="color:#c94040;margin-bottom:8px;">Weak — avoid these</div>
          ${(t.passwordStrength.weak||[]).map(w=>`
            <div style="background:rgba(232,51,42,0.06);border:1px solid rgba(232,51,42,0.15);border-radius:8px;padding:10px 12px;margin-bottom:6px;">
              <code style="font-size:12.5px;color:var(--text);font-family:var(--mono);">${e(w.example)}</code>
              <p style="font-size:11.5px;color:var(--text-3);margin-top:3px;line-height:1.5;">${e(w.reason)}</p>
            </div>`).join("")}
        </div>
        <div>
          <div class="mono-label" style="color:var(--green);margin-bottom:8px;">Strong — use these</div>
          ${(t.passwordStrength.strong||[]).map(s=>`
            <div style="background:rgba(46,204,113,0.05);border:1px solid rgba(46,204,113,0.15);border-radius:8px;padding:10px 12px;margin-bottom:6px;">
              <code style="font-size:12.5px;color:var(--text);font-family:var(--mono);">${e(s.example)}</code>
              <p style="font-size:11.5px;color:var(--text-3);margin-top:3px;line-height:1.5;">${e(s.reason)}</p>
            </div>`).join("")}
        </div>
      </div>
      <div class="example-box"><strong>The rule</strong>${e(t.passwordStrength.rule)}</div>
    </div>` : "";

  const ifCompromised = t.ifCompromised ? `
    <div class="content-section"><h2>${e(t.ifCompromised.title)}</h2>${ul(t.ifCompromised.steps)}</div>` : "";

  // ── AUP extras ──
  const yesNo = t.yesNo ? `
    <div class="content-section">
      <h2>${e(t.yesNo.title)}</h2>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${(t.yesNo.items||[]).map(item=>{
          const color = item.answer==='yes'?'#2ECC71':item.answer==='no'?'#c94040':'#F5A623';
          const bg = item.answer==='yes'?'rgba(46,204,113,0.06)':item.answer==='no'?'rgba(232,51,42,0.06)':'rgba(245,166,35,0.06)';
          const border = item.answer==='yes'?'rgba(46,204,113,0.2)':item.answer==='no'?'rgba(232,51,42,0.2)':'rgba(245,166,35,0.2)';
          const label = item.answer==='yes'?'YES':item.answer==='no'?'NO':'CAUTION';
          return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:12px 14px;">
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <span style="font-family:var(--mono);font-size:9px;font-weight:700;color:${color};padding:3px 7px;border-radius:999px;border:1px solid ${border};white-space:nowrap;margin-top:1px;">${label}</span>
              <div>
                <p style="font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:4px;">${e(item.question)}</p>
                <p style="font-size:12.5px;color:var(--text-2);line-height:1.6;">${e(item.detail)}</p>
              </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>` : "";

  const consequences = t.consequences ? `
    <div class="content-section"><h2>${e(t.consequences.title)}</h2>${ul(t.consequences.points)}</div>` : "";

  // ── Physical Security extras ──
  const visitorScript = t.visitorScript ? `
    <div class="content-section">
      <h2>${e(t.visitorScript.title)}</h2>
      <p class="small-note" style="margin-bottom:14px;">${e(t.visitorScript.intro)}</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${(t.visitorScript.phrases||[]).map(p=>`
          <div style="background:var(--ink-3);border:1px solid var(--border);border-radius:10px;padding:12px 14px;">
            <div class="mono-label" style="color:var(--text-3);margin-bottom:5px;">${e(p.situation)}</div>
            <p style="font-size:13.5px;color:var(--text);font-style:italic;line-height:1.6;">${e(p.say)}</p>
          </div>`).join("")}
      </div>
      <p class="small-note" style="margin-top:10px;color:var(--text-3);">${e(t.visitorScript.note)}</p>
    </div>` : "";

  const usbDrop = t.usbDrop ? `
    <div class="content-section">
      <h2>${e(t.usbDrop.title)}</h2>
      <p class="small-note">${e(t.usbDrop.body)}</p>
    </div>` : "";

  // ── Social Media extras ──
  const beforeYouPost = t.beforeYouPost ? `
    <div class="content-section">
      <h2>${e(t.beforeYouPost.title)}</h2>
      <p class="small-note" style="margin-bottom:12px;">Before you post anything work-related, ask yourself:</p>
      ${ul(t.beforeYouPost.questions)}
      <div class="example-box" style="margin-top:12px;"><strong>The rule</strong>${e(t.beforeYouPost.rule)}</div>
    </div>` : "";

  const engSpecific = t.engineeringSpecific ? `
    <div class="content-section"><h2>${e(t.engineeringSpecific.title)}</h2>${ul(t.engineeringSpecific.points)}</div>` : "";

  // ── VPN extras ──
  const vpnTrouble = t.vpnTroubleshoot ? `
    <div class="content-section">
      <h2>${e(t.vpnTroubleshoot.title)}</h2>
      <p class="small-note" style="margin-bottom:12px;">${e(t.vpnTroubleshoot.intro)}</p>
      ${ul(t.vpnTroubleshoot.steps)}
      <div class="example-box" style="margin-top:12px;"><strong>Important</strong>${e(t.vpnTroubleshoot.important)}</div>
    </div>` : "";

  const homeRouter = t.homeRouterChecklist ? `
    <div class="content-section"><h2>${e(t.homeRouterChecklist.title)}</h2>${ul(t.homeRouterChecklist.steps)}</div>` : "";

  // ── Incident Reporting extras ──
  const barracuda = t.barracuda ? `
    <div class="content-section" style="border-color:var(--border-red);">
      <div class="mono-label" style="margin-bottom:8px;">Reporting with Barracuda</div>
      <h2 style="margin-bottom:12px;">${e(t.barracuda.title)}</h2>
      <div style="background:var(--ink-3);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px;">
        ${ol_numbered(t.barracuda.steps)}
      </div>
      <p class="small-note" style="color:var(--amber);margin-bottom:10px;"><strong>Can't find the Barracuda button?</strong> ${e(t.barracuda.cantFindIt)}</p>
      <div class="example-box"><strong>After you report</strong>${e(t.barracuda.afterYouReport)}</div>
    </div>` : "";

  const whatHappensNext = t.whatHappensNext ? `
    <div class="content-section">
      <h2>${e(t.whatHappensNext.title)}</h2>
      ${ol_numbered(t.whatHappensNext.steps, "var(--text-3)", "var(--ink-3)", "var(--border)")}
    </div>` : "";

  const whenInDoubt = t.whenInDoubt ? `
    <div class="content-section" style="background:var(--red-glow);border-color:var(--border-red);">
      <h2>${e(t.whenInDoubt.title)}</h2>
      <p style="font-size:14px;color:var(--text-2);line-height:1.75;">${e(t.whenInDoubt.body)}</p>
    </div>` : "";

    document.getElementById("module-root").innerHTML = `
    <div class="module-body">
      ${quickTakeaway}
      <div class="content-section">
        <div class="mono-label" style="margin-bottom:8px;">${e(m.keyTakeaway||"Key takeaway")}</div>
        <p style="font-size:15px;color:var(--text-2);line-height:1.75;">${e(t.summary)}</p>
      </div>
      ${story}
      <div class="content-two-col">
        <div class="content-section"><h2>🚩 ${e(m.redFlags||"Red flags")}</h2>${ul(t.redFlags)}</div>
        <div class="content-section"><h2>✅ ${e(m.whatToDo||"What to do")}</h2>${ul(t.responseSteps)}</div>
      </div>
      ${passwordStrength}${ifCompromised}
      ${eodChecklist}${publicSpaces}
      ${yesNo}${consequences}
      ${visitorScript}${usbDrop}
      ${beforeYouPost}${engSpecific}
      ${vpnTrouble}${homeRouter}
      ${barracuda}${whatHappensNext}${whenInDoubt}
      ${microScenario}
      ${deeper}
      ${renderCheckIn(t.checkIn, ui)}
    </div>`;

    initCheckIn(t.checkIn, ui);
    initMicroScenario(t.microScenario, ui);
    setTimeout(() => markModuleComplete(moduleId), 8000);
  } catch (err) {
    console.error("Failed to render IT security module:", err);
    const root = document.getElementById("module-root");
    if (root) {
      root.innerHTML = `<p class="small-note">We couldn't render this module right now. Please refresh the page. If the problem continues, contact IT.</p>`;
    }
  }
}

function initMicroScenario(scenario, ui) {
  if (!scenario?.question || !scenario?.correctChoiceId) return;
  const e = s => escapeHtml(String(s ?? ""));
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
        <strong style="color:${ok ? "#2ECC71" : "#AB2328"};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace;">${e(ok ? (m.correct || "Correct") : (m.incorrect || "Incorrect"))}</strong>
        <p style="margin-top:5px;color:var(--text-2);">${e(scenario.bestAction || "")}</p>`;
    });
  });
}
