const LANG_KEY = "pac_lang";
// Translation rollout flag.
// When enabled, we honor user selection, URL overrides, and load locale JSON when present.
const ENABLE_TRANSLATIONS = true;
let _ui = null;
let _lang = "en";
let _uiAll = null;

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, override) {
  if (!isPlainObject(base)) return override ?? base;
  const out = { ...base };
  if (!isPlainObject(override)) return out;
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObject(v) && isPlainObject(out[k])) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}

function normalizeLang(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "en") return "en";
  if (v === "pt" || v === "pt-br" || v === "ptbr") return "pt";
  if (v === "zh" || v === "zh-cn" || v === "zhcn") return "zh";
  if (v === "es" || v === "es-419" || v === "es419") return "es";
  return null;
}

export async function initI18n(rootPrefix = ".") {
  const qsLang = typeof window !== "undefined" ? normalizeLang(new URLSearchParams(window.location.search).get("lang")) : null;
  if (ENABLE_TRANSLATIONS && qsLang) localStorage.setItem(LANG_KEY, qsLang);
  _lang = ENABLE_TRANSLATIONS ? (qsLang || localStorage.getItem(LANG_KEY) || "en") : "en";
  // Set the browser's language hint early so accessibility tools can pick it up.
  // This is intentionally decoupled from the UI JSON language labels.
  const htmlLangMap = { en: "en", pt: "pt-BR", zh: "zh-CN", es: "es-419" };
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = htmlLangMap[_lang] || "en";
  }
  const res = await fetch(new URL(`${rootPrefix}/data/ui.json`, window.location.href));
  if (!res.ok) { console.warn("Failed to load ui.json"); return getUI(); }
  const data = await res.json();
  _uiAll = data;
  const en = data["en"] || {};
  const chosen = data[_lang] || {};
  _ui = { ...deepMerge(en, chosen), i18nEnabled: ENABLE_TRANSLATIONS };
  return _ui;
}

export function getLang() { return _lang; }

export function setLang(lang) {
  const normalized = normalizeLang(lang) || "en";
  _lang = ENABLE_TRANSLATIONS ? normalized : "en";
  localStorage.setItem(LANG_KEY, _lang);
  window.location.reload();
}

export function getUI() {
  return _ui || { lang: "EN", nav: {}, home: {}, module: {}, strategies: {}, stories: {}, quiz: {}, progress: {}, footer: {}, i18nEnabled: ENABLE_TRANSLATIONS };
}

export function t(path, vars = {}) {
  const ui = getUI();
  const keys = path.split(".");
  const tryGet = (obj) => {
    let v = obj;
    for (const k of keys) {
      v = v?.[k];
      if (v === undefined) return undefined;
    }
    return v;
  };
  const val = tryGet(ui) ?? tryGet(_uiAll?.en) ?? path;
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

export async function fetchDataJson(base, rootPrefix = ".") {
  const preferredUrl = getDataUrl(base, rootPrefix);
  const preferredRes = await fetch(preferredUrl);
  if (preferredRes.ok) return await preferredRes.json();
  // Fallback to English if a localized file isn't present yet.
  const enUrl = new URL(`${rootPrefix}/data/${base.replace(".json", "")}.json`, window.location.href).toString();
  const enRes = await fetch(enUrl);
  if (!enRes.ok) throw new Error(`Failed to load data: ${preferredUrl} and fallback ${enUrl}`);
  return await enRes.json();
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
