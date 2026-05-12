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
// Locales discovered automatically from the i18n.locales array of
// docusaurus.config.ts; default locale data is read from docs/.
//
// Runs as a prebuild/prestart hook (see package.json). Output file is
// gitignored — always derived from source markdown at build time.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

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

async function loadLocale(skillsDir, urlPrefix) {
  if (!existsSync(skillsDir)) return [];
  const files = (await readdir(skillsDir))
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort();
  const out = [];
  for (const f of files) {
    const raw = await readFile(join(skillsDir, f), "utf-8");
    const fm = parseFrontmatter(raw) ?? {};
    const id = fm.id || f.replace(/\.md$/, "");
    out.push({
      id,
      title: fm.title ?? id,
      hoverText: fm.hoverText ?? "",
      filePath: `${urlPrefix}/docs/battles/enemy-skills/${id}`,
    });
  }
  return out;
}

// Discover locales from docusaurus.config.ts. Cheap: just regex out the
// `locales: [...]` array — the file is tiny and the format is stable.
async function discoverLocales() {
  const cfg = await readFile(join(repoRoot, "docusaurus.config.ts"), "utf-8");
  const m = cfg.match(/locales:\s*\[([^\]]+)\]/);
  if (!m) return ["en"];
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

async function main() {
  const locales = await discoverLocales();
  const defaultLocaleMatch = (
    await readFile(join(repoRoot, "docusaurus.config.ts"), "utf-8")
  ).match(/defaultLocale:\s*["']([^"']+)["']/);
  const defaultLocale = defaultLocaleMatch ? defaultLocaleMatch[1] : "en";

  const result = {};
  for (const locale of locales) {
    let skillsDir;
    let urlPrefix;
    if (locale === defaultLocale) {
      skillsDir = join(repoRoot, "docs", "battles", "enemy-skills");
      urlPrefix = "";
    } else {
      skillsDir = join(
        repoRoot,
        "i18n",
        locale,
        "docusaurus-plugin-content-docs",
        "current",
        "battles",
        "enemy-skills",
      );
      urlPrefix = ""; // Docusaurus router prepends /<locale>/ at runtime
    }
    result[locale] = await loadLocale(skillsDir, urlPrefix);
    console.log(
      `build-enemy-skills-data: ${locale} → ${result[locale].length} skills`,
    );
  }

  const outFile = join(repoRoot, "src", "data", "enemySkills.generated.json");
  await writeFile(outFile, JSON.stringify(result, null, 2) + "\n", "utf-8");
  console.log(`build-enemy-skills-data: wrote ${outFile}`);
}

await main();
