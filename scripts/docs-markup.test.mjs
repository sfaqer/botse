import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { dirname, join, resolve, basename } from "node:path";
import test from "node:test";
import { auditDocumentation } from "./docs-markup.mjs";
import { prepareEnglishMirror } from "./doc-source.mjs";
import { repoRoot } from "./i18n-utils.mjs";
const cache = resolve(repoRoot, ".cache-loader");
async function fixture(t) {
  await mkdir(cache, { recursive: true });
  const root = await mkdtemp(join(cache, "docs-test-"));
  t.after(async () => {
    assert.equal(dirname(root), cache);
    assert(basename(root).startsWith("docs-test-"));
    await rm(root, { recursive: true, force: true });
  });
  async function put(path, text) {
    const file = join(root, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, text);
  }
  async function doc(path, body) {
    const content =
      "---\nid: " +
      basename(path, ".md") +
      "\ntitle: Example\n---\n\n" +
      body +
      "\n";
    await put("docs/" + path, content);
    await put(
      "i18n/en/docusaurus-plugin-content-docs/current/" + path,
      prepareEnglishMirror(content)
    );
    return content;
  }
  await put(
    "i18n/en/code.json",
    JSON.stringify({ "docs.admonition.example": { message: "Example" } })
  );
  return { root, put, doc };
}
test("canonical index and generated-category links remain valid with inline icons", async (t) => {
  const { root, put, doc } = await fixture(t);
  await doc("glossary/index.md", "Text.");
  await put(
    "docs/objectives/_category_.json",
    JSON.stringify({
      label: "Objectives",
      link: { type: "generated-index", slug: "/objectives/" },
    })
  );
  await put(
    "static/icons/test.svg",
    '<svg xmlns="http://www.w3.org/2000/svg"/>'
  );
  await doc(
    "source.md",
    '[Glossary](/docs/glossary/) and [objectives](/docs/objectives/).\n\n| Icon | Name |\n| --- | --- |\n| <img src="/icons/test.svg" alt="Test" /> | Name |\n\n:::note[Example]\nA note.\n:::'
  );
  assert.deepEqual((await auditDocumentation(root)).errors, []);
});
test("HTML blocks must expose visible text to translation tools", async (t) => {
  const { root, doc } = await fixture(t);
  await doc(
    "banner.md",
    "<div>\n# Hidden heading\nHidden introduction.\n</div>"
  );
  assert(
    (await auditDocumentation(root)).errors.some(
      (e) => e.type === "hidden-text"
    )
  );
  await doc(
    "banner.md",
    "<div>\n\n# Visible heading\n\nVisible introduction.\n\n</div>"
  );
  assert.deepEqual((await auditDocumentation(root)).errors, []);
});
test("bad routes, filename case and raw tooltip HTML are caught", async (t) => {
  const { root, put, doc } = await fixture(t);
  await put("static/icons/Test.svg", "<svg/>");
  await doc(
    "bad.md",
    '[Missing](/docs/missing)\n\n<img src="/icons/test.svg" alt="Test" />'
  );
  const content =
    "---\nid: tooltip\ntitle: Tooltip\nhoverText: '<img src=\"/icons/Test.svg\" />'\n---\n\nText.\n";
  await put("docs/tooltip.md", content);
  await put(
    "i18n/en/docusaurus-plugin-content-docs/current/tooltip.md",
    content
  );
  const types = new Set(
    (await auditDocumentation(root)).errors.map((e) => e.type)
  );
  for (const type of ["link", "asset", "tooltip"])
    assert(types.has(type), type);
});
test("translated route identifiers, unregistered captions and mirror drift are caught", async (t) => {
  const { root, put, doc } = await fixture(t);
  const source = await doc(
    "guide.md",
    ":::warning[Unregistered title]\nText.\n:::"
  );
  await put(
    "i18n/ru/docusaurus-plugin-content-docs/current/guide.md",
    source.replace("id: guide", "id: translated-guide")
  );
  await put(
    "i18n/en/docusaurus-plugin-content-docs/current/guide.md",
    source + "Stale text.\n"
  );
  const types = new Set(
    (await auditDocumentation(root)).errors.map((e) => e.type)
  );
  for (const type of ["metadata", "callout-title", "mirror"])
    assert(types.has(type), type);
});
