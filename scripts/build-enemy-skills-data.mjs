#!/usr/bin/env node
// Build per-locale enemy-skills data for the tracker UI by reading the
// markdown frontmatter under docs/battles/enemy-skills/ (default locale)
// and i18n/<locale>/.../battles/enemy-skills/ (other locales).
//
// Why: each enemy skill already lives as its own doc page with frontmatter
// `title` and `hoverText`. Those pages are tracked by Weblate as markdown
// components, so translators already translate them once. Surfacing the
// same strings to the tracker via this generated JSON avoids creating a
// second translation pipeline (and a second copy for translators to keep
// in sync).
//
// Output: src/data/enemySkills.generated.json — { <locale>: Skill[] }.
// Locales are discovered from i18n/ using the same helper as Docusaurus.
// Missing translations fall back to the corresponding files in docs/.
//
// Runs as a prebuild/prestart hook (see package.json). Output file is
// gitignored — always derived from source markdown at build time.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { discoverLocales, localeDocFiles, repoRoot } from "./i18n-utils.mjs";

function parseFrontmatter(src) {
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("\n---", 3);
  if (end < 0) return null;
  const block = src.slice(3, end).trim();
  const data = {};
  let key = null;
  let buf = "";
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (m) {
      if (key) data[key] = buf.trim();
      key = m[1];
      buf = m[2];
    } else {
      buf += "\n" + line;
    }
  }
  if (key) data[key] = buf.trim();
  for (const k of Object.keys(data)) {
    const v = data[k];
    if (typeof v !== "string" || v.length < 2) continue;
    // Strip outer YAML quoting and unescape the doubled-quote convention
    // (single-quoted YAML uses '' for a literal ').
    if (v.startsWith('"') && v.endsWith('"')) {
      data[k] = v.slice(1, -1);
    } else if (v.startsWith("'") && v.endsWith("'")) {
      data[k] = v.slice(1, -1).replace(/''/g, "'");
    }
  }
  return data;
}

async function loadLocale(locale) {
  const files = await localeDocFiles(locale, "battles/enemy-skills");
  const out = [];
  for (const [relativePath, file] of [...files].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    if (/^index\.mdx?$/.test(relativePath)) continue;
    const raw = await readFile(file, "utf-8");
    const fm = parseFrontmatter(raw) ?? {};
    const id = fm.id || relativePath.replace(/\.mdx?$/, "");
    out.push({
      id,
      title: fm.title ?? id,
      hoverText: fm.hoverText ?? "",
      // Docusaurus Link adds the deployment baseUrl and active locale.
      filePath: `/docs/battles/enemy-skills/${id}`,
    });
  }
  return out;
}

async function main() {
  const locales = discoverLocales();
  const result = {};
  for (const locale of locales) {
    result[locale] = await loadLocale(locale);
    console.log(
      `build-enemy-skills-data: ${locale} → ${result[locale].length} skills`
    );
  }

  const outFile = join(repoRoot, "src", "data", "enemySkills.generated.json");
  await writeFile(outFile, JSON.stringify(result, null, 2) + "\n", "utf-8");
  console.log(`build-enemy-skills-data: wrote ${outFile}`);
}

await main();
