import fs from "node:fs";
import path from "node:path";

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function walkKeys(obj, prefix = "") {
  const out = new Set();
  if (!isPlainObject(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      for (const child of walkKeys(v, p)) out.add(child);
    } else {
      out.add(p);
    }
  }
  return out;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function formatList(items, max = 80) {
  const arr = [...items].sort();
  if (arr.length <= max) return arr;
  return [...arr.slice(0, max), `… (+${arr.length - max} more)`];
}

const repoRoot = process.cwd();
const uiPath = path.join(repoRoot, "data", "ui.json");

if (!fs.existsSync(uiPath)) {
  console.error(`Missing ${uiPath}`);
  process.exit(1);
}

const ui = readJson(uiPath);
const langs = ["en", "es", "pt", "zh"];

const base = ui.en || {};
const baseKeys = walkKeys(base);

let failed = false;
for (const lang of langs) {
  const block = ui[lang] || {};
  const keys = walkKeys(block);
  const missing = [...baseKeys].filter(k => !keys.has(k));

  console.log(`\n[${lang}]`);
  console.log(`- keys: ${keys.size}`);
  console.log(`- missing vs en: ${missing.length}`);
  if (missing.length) {
    failed = true;
    for (const line of formatList(missing)) console.log(`  - ${line}`);
  }
}

console.log("\nDone.");
process.exit(failed ? 2 : 0);

