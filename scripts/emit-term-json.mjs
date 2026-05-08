#!/usr/bin/env node
// Post-build helper that creates the per-term JSON files expected by
// @grnet/docusaurus-term-preview's hover tooltip.
//
// The terminology plugin's webpack loader is broken on Docusaurus 3.x
// (the .json files it should emit never reach the build output), so the
// tooltip falls back to a permanent "loading..." state. As a stopgap we
// regenerate the same files post-build by parsing the markdown frontmatter
// directly. Used by the GH Pages preview workflow; not currently wired into
// the upstream/main build.
//
// Usage: node scripts/emit-term-json.mjs <buildDir>

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Minimal markdown subset → HTML for tooltip hoverText: paragraphs, links,
// inline code, bold/italic. Anything more elaborate isn't used in glossary
// frontmatter today; if that changes, swap this for a real markdown parser.
function mdToHtml(src) {
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escape(src);
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => `<a href="${href}">${text}</a>`,
  );
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>");
  return `<p>${html.replace(/\n{2,}/g, "</p>\n<p>")}</p>`;
}

const buildDir = process.argv[2] ?? "build";
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const p = join(dir, entry);
    const s = await stat(p);
    if (s.isDirectory()) yield* walk(p);
    else if (entry.endsWith(".md") || entry.endsWith(".mdx")) yield p;
  }
}

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
    if (v.startsWith('"') && v.endsWith('"')) data[k] = v.slice(1, -1);
  }
  return data;
}

async function emitForLocale(srcRoot, outRoot, urlPrefix) {
  let count = 0;
  for await (const file of walk(srcRoot)) {
    const raw = await readFile(file, "utf-8");
    const fm = parseFrontmatter(raw) ?? {};
    // Emit a JSON for every markdown file: the @grnet term-preview component
    // wraps every doc-internal link in <Term> and fetches "<url>.json", so a
    // missing file leaves the tooltip stuck on "loading...". Pages without a
    // hoverText fall back to title-only metadata; the tooltip then shows just
    // the title. Glossary terms keep their full hoverText body.
    const fallbackId = relative(srcRoot, file)
      .replace(/\\/g, "/")
      .replace(/\.mdx?$/, "")
      .split("/")
      .pop();
    const id = fm.id || fallbackId;
    const title = fm.title || id;
    const hoverHtml = fm.hoverText ? mdToHtml(fm.hoverText) : "";
    const rel = relative(srcRoot, file).replace(/\\/g, "/").replace(/\.mdx?$/, "");
    const outFile = join(outRoot, rel + ".json");
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(
      outFile,
      JSON.stringify({
        metadata: { ...fm, id, title, hoverText: hoverHtml },
        content: "",
      }),
    );
    count++;
  }
  if (count) {
    console.log(`emit-term-json: wrote ${count} files for ${urlPrefix || "/"}`);
  }
}

const docsRoot = join(repoRoot, "docs");
const outDocsRoot = join(buildDir, "docs");
await emitForLocale(docsRoot, outDocsRoot, "");

// non-default locales
const i18nRoot = join(repoRoot, "i18n");
try {
  for (const locale of await readdir(i18nRoot)) {
    if (locale === "en") continue;
    const localeDocsSrc = join(
      i18nRoot,
      locale,
      "docusaurus-plugin-content-docs",
      "current",
    );
    try {
      await stat(localeDocsSrc);
    } catch {
      continue;
    }
    const localeOut = join(buildDir, locale, "docs");
    await emitForLocale(localeDocsSrc, localeOut, `/${locale}/`);
  }
} catch {}
