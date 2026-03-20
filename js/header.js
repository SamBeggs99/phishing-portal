export function getHeaderHTML({ rootPrefix = ".", ui = null } = {}) {
  const r = rootPrefix;
  const n = ui?.nav || {};
  const p = ui?.progress || {};
  const lang = ui?.lang || "EN";
  const i18nEnabled = ui?.i18nEnabled !== false;

  const progressTpl = p.count || "{n} / {total} modules";

  return `
<header>
  <div class="container nav">
    <a class="brand" href="${r}/index.html" aria-label="The PAC Group IT Security Training">
      <div class="brand-logo">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="17,3 21,13 31,13 23,19 26,30 17,24 8,30 11,19 3,13 13,13" fill="none" stroke="#AB2328" stroke-width="1.6" stroke-linejoin="round"/>
          <polygon points="17,8 19,13 24,13 20,16 21.5,21 17,18 12.5,21 14,16 10,13 15,13" fill="#AB2328" opacity="0.22"/>
          <line x1="17" y1="3" x2="17" y2="1" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="31" y1="17" x2="33" y2="17" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="17" y1="31" x2="17" y2="33" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="3" y1="17" x2="1" y2="17" stroke="#AB2328" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">The PAC Group</span>
        <span class="brand-sub">IT Security Training</span>
      </div>
    </a>

    <div class="nav-actions">
      <a class="home-shortcut" href="${r}/index.html" aria-label="Go to home page">⌂ ${n.home || "Home"}</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
    </div>

    <nav class="navlinks" aria-label="Primary navigation">
      <a data-nav="true" href="${r}/index.html">${n.home || "Home"}</a>
      <div class="nav-divider"></div>
      <span class="nav-section-label">${n.phishing || "Phishing"}</span>
      <a data-nav="true" href="${r}/modules/phishing/index.html">${n.modules || "Modules"}</a>
      <a data-nav="true" href="${r}/strategies.html">${n.strategies || "Strategies"}</a>
      <a data-nav="true" href="${r}/stories.html">${n.stories || "Stories"}</a>
      <div class="nav-divider"></div>
      <span class="nav-section-label">${n.itSecurity || "IT Security"}</span>
      <a data-nav="true" href="${r}/modules/it-security/index.html">${n.itModules || "IT Modules"}</a>
      <div class="nav-divider"></div>
      <a data-nav="true" href="${r}/quiz.html" class="nav-quiz-link">${n.quiz || "Quiz"}</a>
      ${i18nEnabled ? `
      <div class="nav-divider"></div>
      <div class="lang-switcher" role="group" aria-label="Language">
        <button class="lang-btn${lang==="EN"?" active":""}" onclick="window.__setLang('en')" title="English">EN</button>
        <button class="lang-btn${lang==="PT"?" active":""}" onclick="window.__setLang('pt')" title="Português">PT</button>
        <button class="lang-btn${lang==="中文"?" active":""}" onclick="window.__setLang('zh')" title="中文">中文</button>
        <button class="lang-btn${lang==="ES"?" active":""}" onclick="window.__setLang('es')" title="Español">ES</button>
      </div>` : ""}
    </nav>
  </div>

  <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
    <a data-nav="true" href="${r}/index.html">${n.home || "Home"}</a>
    <a data-nav="true" href="${r}/modules/phishing/index.html">${n.phishing || "Phishing"} — ${n.modules || "Modules"}</a>
    <a data-nav="true" href="${r}/strategies.html">${n.strategies || "Strategies"}</a>
    <a data-nav="true" href="${r}/stories.html">${n.stories || "Stories"}</a>
    <a data-nav="true" href="${r}/modules/it-security/index.html">${n.itSecurity || "IT Security"} — ${n.itModules || "Modules"}</a>
    <a data-nav="true" href="${r}/quiz.html">${n.quiz || "Quiz"}</a>
    ${i18nEnabled ? `<div style="padding:10px 20px;display:flex;gap:6px;">
      <button class="lang-btn${lang==="EN"?" active":""}" onclick="window.__setLang('en')">EN</button>
      <button class="lang-btn${lang==="PT"?" active":""}" onclick="window.__setLang('pt')">PT</button>
      <button class="lang-btn${lang==="中文"?" active":""}" onclick="window.__setLang('zh')">中文</button>
      <button class="lang-btn${lang==="ES"?" active":""}" onclick="window.__setLang('es')">ES</button>
    </div>` : ""}
  </nav>
</header>

<div class="progress-banner">
  <div class="container progress-inner">
    <span class="progress-label">${p.label || "Your progress"}</span>
    <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
    <span class="progress-count" id="progress-count" data-tpl="${progressTpl}">0 / 12</span>
  </div>
</div>`;
}

export function getFooterHTML({ rootPrefix = ".", ui = null } = {}) {
  const r = rootPrefix;
  const f = ui?.footer || {};
  return `
<footer>
  <div class="container footer-inner">
    <div class="footer-brand">
      <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
        <polygon points="17,3 21,13 31,13 23,19 26,30 17,24 8,30 11,19 3,13 13,13" fill="none" stroke="#AB2328" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
      <div>
        <div class="footer-brand-name">${f.name || "The PAC Group"}</div>
        <div class="footer-brand-sub">${f.sub || "IT Security Training Portal"}</div>
      </div>
    </div>
    <div class="footer-slogan">${f.slogan || "Integrated Globally › Implemented Locally"}</div>
    <div class="footer-links">
      <a href="${r}/index.html">${ui?.nav?.home || "Home"}</a>
      <a href="${r}/modules/phishing/index.html">${ui?.nav?.phishing || "Phishing"}</a>
      <a href="${r}/modules/it-security/index.html">${ui?.nav?.itSecurity || "IT Security"}</a>
      <a href="${r}/quiz.html">${ui?.nav?.quiz || "Quiz"}</a>
      <a href="mailto:phishing@pacgroup.com">${f.reportLink || "Report Phishing"}</a>
    </div>
  </div>
</footer>`;
}
