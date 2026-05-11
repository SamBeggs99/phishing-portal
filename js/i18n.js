let _ui = null;
let _uiAll = null;

export async function initI18n(rootPrefix = ".") {
  const res = await fetch(new URL(`${rootPrefix}/data/ui.json`, window.location.href));
  if (!res.ok) {
    console.warn("Failed to load ui.json");
    return getUI();
  }
  const data = await res.json();
  _uiAll = { en: data };
  _ui = { ...data, i18nEnabled: false };
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = "en";
  }
  return _ui;
}

export function getUI() {
  return (
    _ui || {
      nav: {},
      home: {},
      module: {},
      strategies: {},
      stories: {},
      quiz: {},
      progress: {},
      footer: {},
      i18nEnabled: false
    }
  );
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

export async function fetchDataJson(base, rootPrefix = ".") {
  const baseName = String(base).replace(/\.json$/i, "");
  const url = new URL(`${rootPrefix}/data/${baseName}.json`, window.location.href).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load data: ${url}`);
  return res.json();
}
