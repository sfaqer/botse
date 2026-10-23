#!/usr/bin/env node
// Keep Weblate's English source mirror current and seed missing documents
// for every discovered locale. Existing translations are never rewritten.
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  defaultLocale,
  discoverLocales,
  markdownFiles,
  repoRoot,
} from "./i18n-utils.mjs";

import { prepareEnglishMirror } from "./doc-source.mjs";

const docsRoot = join(repoRoot, "docs");
const localeRoot = (locale) =>
  join(repoRoot, "i18n", locale, "docusaurus-plugin-content-docs", "current");

// A missing source directory is an error, not a request to empty the mirror.
await access(docsRoot);
const locales = discoverLocales();
const sources = await markdownFiles(docsRoot);
const englishRoot = localeRoot(defaultLocale);

for (const [relativePath, file] of await markdownFiles(englishRoot)) {
  if (!sources.has(relativePath)) await unlink(file);
}

const seeded = Object.fromEntries(locales.map((locale) => [locale, 0]));
for (const [relativePath, file] of sources) {
  const content = prepareEnglishMirror(await readFile(file, "utf-8"));
  for (const locale of locales) {
    const target = join(localeRoot(locale), relativePath);
    await mkdir(dirname(target), { recursive: true });
    if (locale === defaultLocale) {
      let previous;
      try {
        previous = await readFile(target, "utf-8");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (previous !== content) await writeFile(target, content, "utf-8");
    } else {
      try {
        await writeFile(target, content, { encoding: "utf-8", flag: "wx" });
        seeded[locale]++;
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
      }
    }
  }
}

console.log(
  `Synced ${sources.size} documents into the ${defaultLocale} mirror`
);
for (const locale of locales.filter((locale) => locale !== defaultLocale)) {
  console.log(`Seeded ${seeded[locale]} missing documents for ${locale}`);
}
