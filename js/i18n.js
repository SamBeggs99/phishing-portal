const LANG_KEY = "pac_lang";
// Temporary rollout flag: keep translation assets in repo, but run English-only UI for now.
const ENABLE_TRANSLATIONS = false;
let _ui = null;
let _lang = "en";

export async function initI18n(rootPrefix = ".") {
  _lang = ENABLE_TRANSLATIONS ? (localStorage.getItem(LANG_KEY) || "en") : "en";
  // Set the browser's language hint early so accessibility tools can pick it up.
  // This is intentionally decoupled from the UI JSON language labels.
  const htmlLangMap = { en: "en", pt: "pt-BR", zh: "zh-CN", es: "es-419" };
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = htmlLangMap[_lang] || "en";
  }
  const res = await fetch(new URL(`${rootPrefix}/data/ui.json`, window.location.href));
  if (!res.ok) { console.warn("Failed to load ui.json"); return getUI(); }
  const data = await res.json();
  _ui = { ...(data[_lang] || data["en"]), i18nEnabled: ENABLE_TRANSLATIONS };
  return _ui;
}

export function getLang() { return _lang; }

export function setLang(lang) {
  _lang = ENABLE_TRANSLATIONS ? lang : "en";
  localStorage.setItem(LANG_KEY, _lang);
  window.location.reload();
}

export function getUI() {
  return _ui || { lang: "EN", nav: {}, home: {}, module: {}, strategies: {}, stories: {}, quiz: {}, progress: {}, footer: {}, i18nEnabled: ENABLE_TRANSLATIONS };
}

export function t(path, vars = {}) {
  const ui = getUI();
  const keys = path.split(".");
  let val = ui;
  for (const k of keys) { val = val?.[k]; if (val === undefined) return path; }
  if (typeof val !== "string") return path;
  return val.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export function getDataUrl(base, rootPrefix = ".") {
  const lang = getLang();
  const ext = base.endsWith(".json") ? "" : ".json";
  const langSuffix = lang === "en" ? "" : `.${lang}`;
  const filename = base.replace(".json", "") + langSuffix + ".json";
  return new URL(`${rootPrefix}/data/${filename}`, window.location.href).toString();
}

export function renderLangSwitcher(activeLang) {
  const langs = [
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
    { code: "zh", label: "中文" },
    { code: "es", label: "ES" }
  ];
  return `<div class="lang-switcher" role="group" aria-label="Language selector">
    ${langs.map(l => `
      <button class="lang-btn${activeLang === l.code ? " active" : ""}" 
        onclick="window.__setLang('${l.code}')" 
        aria-pressed="${activeLang === l.code}"
        title="${l.label}">
        ${l.label}
      </button>`).join("")}
  </div>`;
}

// Expose setLang globally for inline onclick handlers
window.__setLang = setLang;
