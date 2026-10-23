import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import { repoRoot } from "./i18n-utils.mjs";

const cacheRoot = resolve(repoRoot, ".cache-loader");
const docsPath = "battles/enemy-skills";
const localePath = (locale) =>
  `i18n/${locale}/docusaurus-plugin-content-docs/current`;
const englishBlind =
  "---\nid: blind\ntitle: Blind\nhoverText: 'See [Dodge](/docs/battles/enemy-skills/dodge).'\n---\n\n:::info\nA note.\n:::\n";
const russianBlind =
  "---\nid: blind\ntitle: Слепота\nhoverText: 'См. [уклонение](/docs/battles/enemy-skills/dodge).'\n---\n\n:::info\nСохранить перевод.\n:::\n";

async function put(root, path, content) {
  const file = join(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

async function fixture(t) {
  await mkdir(cacheRoot, { recursive: true });
  const root = await mkdtemp(join(cacheRoot, "i18n-test-"));
  t.after(async () => {
    // Cleanup is confined to the disposable directory created by this test.
    assert.equal(dirname(root), cacheRoot);
    assert.ok(basename(root).startsWith("i18n-test-"));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "src/data"), { recursive: true });
  for (const script of [
    "i18n-utils.mjs",
    "build-enemy-skills-data.mjs",
    "sync-docs-mirror.mjs",
    "emit-term-json.mjs",
  ]) {
    const source = join(repoRoot, "scripts", script);
    if (existsSync(source))
      await copyFile(source, join(root, "scripts", script));
  }
  for (const locale of ["en", "ru", "ta"])
    await put(root, `i18n/${locale}/code.json`, "{}\n");
  await put(root, "i18n/README.txt", "This file is not a locale.\n");
  await put(root, `docs/${docsPath}/blind.md`, englishBlind);
  await put(
    root,
    `docs/${docsPath}/dodge.md`,
    "---\nid: dodge\ntitle: Dodge\nhoverText: Dodge an attack.\n---\n"
  );
  await put(
    root,
    `docs/${docsPath}/index.md`,
    "---\nid: index\ntitle: Enemy Skills\n---\n"
  );
  await put(
    root,
    `docs/${docsPath}/_category_.json`,
    '{"label":"Enemy Skills"}\n'
  );
  await put(root, `${localePath("ru")}/${docsPath}/blind.md`, russianBlind);
  await put(
    root,
    "docusaurus.preview.config.ts",
    'const PREVIEW_BASE_URL = "/reference/";\n'
  );
  return root;
}

function run(root, script, ...args) {
  return execFileSync(
    process.execPath,
    [join(root, "scripts", script), ...args],
    { cwd: root, encoding: "utf8" }
  );
}

async function json(root, path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

test("tracker discovers new locales and falls back for each missing document", async (t) => {
  const root = await fixture(t);
  run(root, "build-enemy-skills-data.mjs");
  const data = await json(root, "src/data/enemySkills.generated.json");
  assert.deepEqual(Object.keys(data), ["en", "ru", "ta"]);
  assert.equal(data.ru.find((skill) => skill.id === "blind").title, "Слепота");
  assert.equal(data.ru.find((skill) => skill.id === "dodge").title, "Dodge");
  assert.deepEqual(data.ta, data.en);
  for (const skills of Object.values(data)) {
    assert.equal(
      skills.length,
      2,
      "index pages must not become tracker skills"
    );
    assert.equal(skills[0].filePath, "/docs/battles/enemy-skills/blind");
  }
  await put(root, "i18n/fr/code.json", "{}\n");
  run(root, "build-enemy-skills-data.mjs");
  const updated = await json(root, "src/data/enemySkills.generated.json");
  assert.deepEqual(updated.fr, updated.en);
});

// This generator exists only on the preview branch; shared i18n tests also
// run on the i18n branch, which deliberately has no preview infrastructure.
test(
  "preview tooltips include untranslated pages and categories in every locale",
  {
    skip: !existsSync(join(repoRoot, "scripts/emit-term-json.mjs")),
  },
  async (t) => {
    const root = await fixture(t);
    run(root, "emit-term-json.mjs", "build");
    const ru = await json(root, `build/ru/docs/${docsPath}/blind.json`);
    assert.equal(ru.metadata.title, "Слепота");
    assert.match(ru.metadata.hoverText, /href="\/reference\/ru\/docs\//);
    const ruFallback = await json(root, `build/ru/docs/${docsPath}/dodge.json`);
    assert.equal(ruFallback.metadata.title, "Dodge");
    const ta = await json(root, `build/ta/docs/${docsPath}/blind.json`);
    assert.equal(ta.metadata.title, "Blind");
    assert.match(ta.metadata.hoverText, /href="\/reference\/ta\/docs\//);
    for (const prefix of ["", "ru/", "ta/"]) {
      const category = await json(root, `build/${prefix}docs/${docsPath}.json`);
      assert.equal(category.metadata.title, "Enemy Skills");
    }
  }
);

test("mirror seeds all locales, propagates source deletions, and preserves translations", async (t) => {
  const root = await fixture(t);
  const stale = `${localePath("en")}/removed.md`;
  await put(root, stale, "Obsolete source.\n");
  run(root, "sync-docs-mirror.mjs");
  assert.equal(existsSync(join(root, stale)), false);
  assert.equal(
    await readFile(
      join(root, `${localePath("ru")}/${docsPath}/blind.md`),
      "utf8"
    ),
    russianBlind
  );
  const english = await readFile(
    join(root, `${localePath("en")}/${docsPath}/blind.md`),
    "utf8"
  );
  assert.match(
    english,
    /<!-- translate:off -->\n:::info\n<!-- translate:on -->/
  );
  assert.equal((english.match(/<!-- translate:off -->/g) ?? []).length, 2);
  assert.equal(
    await readFile(
      join(root, `${localePath("ta")}/${docsPath}/blind.md`),
      "utf8"
    ),
    english
  );
  await put(
    root,
    `${localePath("ta")}/${docsPath}/blind.md`,
    "A translation saved after the first sync.\r\n"
  );
  run(root, "sync-docs-mirror.mjs");
  assert.equal(
    await readFile(
      join(root, `${localePath("en")}/${docsPath}/blind.md`),
      "utf8"
    ),
    english
  );
  assert.equal(
    await readFile(
      join(root, `${localePath("ru")}/${docsPath}/blind.md`),
      "utf8"
    ),
    russianBlind
  );
  assert.equal(
    await readFile(
      join(root, `${localePath("ta")}/${docsPath}/blind.md`),
      "utf8"
    ),
    "A translation saved after the first sync.\r\n"
  );
});

test("workflow stages generated translations even when the English mirror is unchanged", async (t) => {
  const root = await fixture(t);
  const git = (...args) =>
    execFileSync(
      "git",
      [
        "-c",
        `safe.directory=${root.replace(/\\/g, "/")}`,
        "-c",
        "core.autocrlf=false",
        "-c",
        "core.quotePath=false",
        "-c",
        "commit.gpgsign=false",
        "-c",
        `core.hooksPath=${join(root, "disabled-hooks")}`,
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.invalid",
        ...args,
      ],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
  run(root, "sync-docs-mirror.mjs");
  git("init", "-b", "i18n");
  git("add", ".");
  git("commit", "-qm", "Fixture baseline");
  await put(root, "i18n/fr/code.json", "{}\n");
  await put(root, "i18n/ru/code.json", '{"ui":{"message":"changed"}}\n');
  run(root, "sync-docs-mirror.mjs");
  assert.equal(git("diff", "--name-only", "--", localePath("en")).trim(), "");
  const workflow = await readFile(
    join(repoRoot, ".github/workflows/sync-docs-mirror.yml"),
    "utf8"
  );
  const stage = workflow.match(/^\s+git add -- '([^']+)'$/m);
  assert.ok(
    stage,
    "the workflow must stage mirror and locale documents before checking for changes"
  );
  git("add", "--", stage[1]);
  const staged = git("diff", "--cached", "--name-only").trim().split(/\r?\n/);
  assert.deepEqual(
    staged,
    ["blind.md", "dodge.md", "index.md"].map(
      (file) => `${localePath("fr")}/${docsPath}/${file}`
    )
  );
  assert.match(git("diff", "--name-only"), /i18n\/ru\/code\.json/);
});

test("term previews preserve section links and still wrap document links", () => {
  const require = createRequire(import.meta.url);
  const replaceTerms = require("@grnet/webpack-terms-replace-loader");
  const context = {
    query: { termsDir: "./docs", baseUrl: "/reference/ru/" },
    resourcePath: join(repoRoot, "docs/glossary/example.md"),
  };
  const sectionLinks = [
    "[Recovery](/docs/battles/adventurer-turn/index/#2-recovery)",
    "[Local](#2-recovery)",
    "[Relative](../battles/adventurer-turn/index.md#2-recovery)",
    "[Filtered](/docs/glossary/fatigue?view=all#overfatigue)",
  ];
  const source =
    "---\nid: example\ntitle: Example\n---\n\n" +
    [...sectionLinks, "[Fatigue](/docs/glossary/fatigue)"].join("\n\n");
  const result = replaceTerms.call(context, source);
  for (const link of sectionLinks) assert.ok(result.includes(link), link);
  assert.ok(
    result.includes(
      '<Term pathName="/reference/ru/docs/glossary/fatigue">Fatigue</Term>'
    )
  );
  assert.equal(replaceTerms.call(context, result), result);
});
