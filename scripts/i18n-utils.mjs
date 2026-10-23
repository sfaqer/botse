import { readdirSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const defaultLocale = "en";

// Use the same locale list in Docusaurus and in the content generators.
export function discoverLocales() {
  const locales = readdirSync(join(repoRoot, "i18n"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== defaultLocale)
    .map((entry) => entry.name)
    .sort();
  return [defaultLocale, ...locales];
}

export async function markdownFiles(root) {
  const files = new Map();
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        files.set(relative(root, file).replace(/\\/g, "/"), file);
      }
    }
  }
  await walk(root);
  return files;
}

// Match Docusaurus's per-document fallback: translated files override the
// canonical docs, while untranslated pages remain available in every locale.
export async function localeDocFiles(locale, subdirectory = "") {
  const files = await markdownFiles(join(repoRoot, "docs", subdirectory));
  if (locale !== defaultLocale) {
    const translated = await markdownFiles(
      join(
        repoRoot,
        "i18n",
        locale,
        "docusaurus-plugin-content-docs",
        "current",
        subdirectory
      )
    );
    for (const [relativePath, file] of translated)
      files.set(relativePath, file);
  }
  return files;
}
