import { readFile, readdir } from "node:fs/promises";
import { join, relative, posix } from "node:path";
import { createRequire } from "node:module";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import matter from "gray-matter";
import ts from "typescript";
import { prepareEnglishMirror } from "./doc-source.mjs";
const require = createRequire(import.meta.url);
const getSlug = require("@docusaurus/plugin-content-docs/lib/slug.js").default;
const markdown = unified().use(remarkParse).use(remarkGfm);
const mdx = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkDirective);
const slash = (s) => s.replaceAll("\\", "/");
const normalize = (s) => s.replace(/\r\n/g, "\n");
function visit(node, fn, parent) {
  fn(node, parent);
  for (const child of node.children || []) visit(child, fn, node);
}
async function filesIn(root) {
  const files = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) files.push(file);
    }
  }
  await walk(root);
  return files.sort();
}

export async function auditDocumentation(root) {
  const errors = [],
    documents = [],
    categories = [];
  const issue = (file, type, detail, line) =>
    errors.push({
      file: slash(relative(root, file)),
      type,
      detail,
      ...(line ? { line } : {}),
    });
  const sourceRoot = join(root, "docs");
  const sourceFiles = (await filesIn(sourceRoot)).filter((f) =>
    /\.mdx?$/.test(f)
  );
  const localeNames = (
    await readdir(join(root, "i18n"), { withFileTypes: true })
  )
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  let messages = {};
  try {
    messages = JSON.parse(
      await readFile(join(root, "i18n/en/code.json"), "utf8")
    );
  } catch {}
  const titles = new Set(
    Object.entries(messages)
      .filter(([key]) => key.startsWith("docs.admonition."))
      .map(([, value]) => value.message)
  );
  const roots = [
    ["source", sourceRoot],
    ...localeNames.map((l) => [
      l,
      join(root, "i18n", l, "docusaurus-plugin-content-docs/current"),
    ]),
  ];
  const assets = new Set(
    (await filesIn(join(root, "static"))).map((f) =>
      slash(relative(join(root, "static"), f))
    )
  );
  for (const [locale, folder] of roots) {
    for (const file of (await filesIn(folder)).filter((f) =>
      /\.mdx?$/.test(f)
    )) {
      const raw = normalize(await readFile(file, "utf8"));
      const docPath = slash(relative(folder, file));
      if (!raw.startsWith("---\n")) {
        issue(file, "frontmatter", "Missing YAML frontmatter");
        continue;
      }
      const closing = raw.slice(4).match(/^(-{3,})[ \t]*$/m);
      if (!closing || closing[1] !== "---")
        issue(
          file,
          "frontmatter",
          "Frontmatter must close with exactly three hyphens"
        );
      let parsed;
      try {
        parsed = matter(raw);
      } catch (error) {
        issue(file, "frontmatter", error.message);
        continue;
      }
      const fm = parsed.data,
        body = parsed.content,
        offset = raw.slice(0, raw.length - body.length).split("\n").length - 1;
      for (const key of [
        "id",
        "title",
        "slug",
        "description",
        "hoverText",
        "sidebar_label",
      ])
        if (fm[key] != null && typeof fm[key] !== "string")
          issue(file, "metadata", `${key} must be a string`);
      if (typeof fm.id === "string" && /[\\/]/.test(fm.id))
        issue(file, "metadata", "Document id must not contain a path");
      if (/[\u0000\uFFFD\u{E000}-\u{F8FF}\u{F0000}-\u{10FFFD}]/u.test(raw))
        issue(
          file,
          "character",
          "Unexpected NUL, replacement or private-use character"
        );
      if (typeof fm.hoverText === "string" && /<\/?[a-z]/i.test(fm.hoverText))
        issue(
          file,
          "tooltip",
          "hoverText supports Markdown text and links; HTML is not rendered"
        );
      const directives = [],
        protectedLines = new Set();
      let protectedRegion = false;
      for (const [index, line] of body.split("\n").entries()) {
        if (line.includes("<!-- translate:off -->")) {
          if (protectedRegion)
            issue(
              file,
              "translation-marker",
              "Nested translate:off marker",
              index + offset + 1
            );
          protectedRegion = true;
        }
        if (protectedRegion) protectedLines.add(index + 1);
        if (line.includes("<!-- translate:on -->")) {
          if (!protectedRegion)
            issue(
              file,
              "translation-marker",
              "Unmatched translate:on marker",
              index + offset + 1
            );
          protectedRegion = false;
        }
        const start = line.match(/^\s*:::([a-z][\w-]*)(?:\[([^\]]+)\])?/);
        if (start) {
          directives.push(index);
          if (start[2] && !titles.has(start[2]))
            issue(
              file,
              "callout-title",
              `Register custom title in UI translations: ${start[2]}`,
              index + offset + 1
            );
        } else if (/^\s*:::\s*$/.test(line)) {
          if (!directives.length)
            issue(
              file,
              "admonition",
              "Unmatched closing directive",
              index + offset + 1
            );
          else directives.pop();
        }
      }
      if (protectedRegion)
        issue(file, "translation-marker", "Unclosed translate:off region");
      for (const index of directives)
        issue(file, "admonition", "Unclosed directive", index + offset + 1);
      const htmlBlocks = [];
      visit(markdown.parse(body), (node, parent) => {
        if (
          node.type === "html" &&
          ["root", "blockquote", "listItem"].includes(parent?.type) &&
          !node.value.startsWith("<!--")
        )
          htmlBlocks.push(node.position);
      });
      let input = body.replace(/<!--[\s\S]*?-->/g, (value) =>
        value.replace(/[^\n]/g, " ")
      );
      input = input.replace(
        /(^\s*#{1,6}[^\n]*?)(\s+\{#[^}]+\})(\s*)$/gm,
        (_, a, b, c) => a + " ".repeat(b.length) + c
      );
      let tree;
      try {
        tree = mdx.parse(input);
      } catch (error) {
        issue(
          file,
          "mdx",
          error.reason || error.message,
          (error.line || 0) + offset
        );
        continue;
      }
      const refs = [],
        ids = new Set();
      for (const match of body.matchAll(/^\s*#{1,6}[^\n]*\{#([^}]+)\}\s*$/gm)) {
        if (ids.has(match[1]))
          issue(file, "anchor", `Duplicate id: ${match[1]}`);
        ids.add(match[1]);
      }
      visit(tree, (node, parent) => {
        const line = (node.position?.start.line || 0) + offset;
        if (
          node.type === "text" &&
          /[\p{L}\p{N}]/u.test(node.value) &&
          !parent?.data?.directiveLabel
        ) {
          const start = node.position.start.line;
          if (
            protectedLines.has(start) ||
            htmlBlocks.some(
              (range) => start >= range.start.line && start <= range.end.line
            )
          )
            issue(file, "hidden-text", node.value.trim().slice(0, 160), line);
        }
        if (
          node.type === "code" &&
          !node.lang &&
          /[\p{L}]{3}/u.test(node.value)
        )
          issue(
            file,
            "code-block",
            "Add an explicit code-fence language or remove unintended indentation",
            line
          );
        if (node.type === "table")
          for (const row of node.children)
            if (row.children.length !== node.align.length)
              issue(
                file,
                "table",
                `Expected ${node.align.length} columns; found ${row.children.length}`,
                row.position.start.line + offset
              );
        if (node.type === "link" || node.type === "image")
          refs.push({ url: node.url, image: node.type === "image", line });
        if (
          node.type === "mdxJsxTextElement" ||
          node.type === "mdxJsxFlowElement"
        ) {
          for (const attribute of node.attributes || []) {
            if (
              attribute.type !== "mdxJsxAttribute" ||
              typeof attribute.value !== "string"
            )
              continue;
            if (["href", "src"].includes(attribute.name))
              refs.push({
                url: attribute.value,
                image: attribute.name === "src",
                line,
              });
            if (attribute.name === "id") {
              if (ids.has(attribute.value))
                issue(file, "anchor", `Duplicate id: ${attribute.value}`, line);
              ids.add(attribute.value);
            }
          }
          if (
            node.name === "img" &&
            !node.attributes.some((a) => a.name === "alt")
          )
            issue(file, "image", "Image has no alt attribute", line);
        }
      });
      if (typeof fm.hoverText === "string")
        for (const match of fm.hoverText.matchAll(/\]\(([^)]+)\)/g))
          refs.push({ url: match[1], line: 1 });
      let route;
      try {
        route = (
          "/docs" +
          getSlug({
            baseID: fm.id || posix.basename(docPath).replace(/\.mdx?$/, ""),
            source: docPath,
            sourceDirName: posix.dirname(docPath),
            frontMatterSlug: fm.slug,
          })
        ).replace(/\/$/, "");
      } catch (error) {
        issue(file, "route", error.message);
        continue;
      }
      documents.push({ file, docPath, locale, fm, route, refs, raw });
    }
  }
  const canonical = new Map(
    documents.filter((d) => d.locale === "source").map((d) => [d.docPath, d])
  );
  const english = new Map(
    documents.filter((d) => d.locale === "en").map((d) => [d.docPath, d])
  );
  for (const source of canonical.values()) {
    const mirror = english.get(source.docPath);
    if (!mirror) issue(source.file, "mirror", "Missing English Weblate mirror");
    else if (normalize(mirror.raw) !== prepareEnglishMirror(source.raw))
      issue(
        mirror.file,
        "mirror",
        "English Weblate mirror differs from canonical source"
      );
  }
  for (const doc of documents.filter((d) => d.locale !== "source")) {
    const source = canonical.get(doc.docPath);
    if (!source) {
      issue(doc.file, "orphan", "Translation has no canonical document");
      continue;
    }
    for (const key of ["id", "slug", "sidebar_position", "tags"])
      if (JSON.stringify(doc.fm[key]) !== JSON.stringify(source.fm[key]))
        issue(doc.file, "metadata", `${key} differs from canonical document`);
  }
  const routes = new Map();
  for (const doc of documents) {
    if (!routes.has(doc.locale)) routes.set(doc.locale, new Map());
    const map = routes.get(doc.locale);
    if (map.has(doc.route))
      issue(doc.file, "route", `Duplicate route ${doc.route}`);
    map.set(doc.route, doc.file);
  }
  for (const file of (await filesIn(sourceRoot)).filter((f) =>
    f.endsWith("_category_.json")
  )) {
    let data;
    try {
      data = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      issue(file, "category", error.message);
      continue;
    }
    if (data.link?.type === "generated-index" && data.link.slug) {
      const route = ("/docs/" + data.link.slug.replace(/^\//, "")).replace(
        /\/$/,
        ""
      );
      for (const map of routes.values()) {
        if (map.has(route))
          issue(file, "route", `Generated category duplicates ${route}`);
        map.set(route, file);
      }
      categories.push(route);
    }
  }
  function checkReference(file, locale, ref) {
    const url = ref.url || "";
    if (/^(javascript|vbscript):/i.test(url)) {
      issue(file, "link", "Unsupported link scheme", ref.line);
      return;
    }
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(url)) return;
    const pathname = url.split(/[?#]/)[0];
    if (!ref.image && pathname.startsWith("/docs")) {
      const route = pathname.replace(/\/$/, "").replace(/\.mdx?$/, "");
      if (!routes.get(locale)?.has(route) && !routes.get("source")?.has(route))
        issue(file, "link", `Unknown documentation route: ${url}`, ref.line);
    } else if (ref.image && pathname.startsWith("/")) {
      let name;
      try {
        name = decodeURIComponent(pathname.slice(1));
      } catch {
        issue(file, "asset", `Malformed URL: ${url}`, ref.line);
        return;
      }
      if (!assets.has(name))
        issue(
          file,
          "asset",
          `Missing asset or wrong filename case: ${url}`,
          ref.line
        );
    }
  }
  for (const doc of documents)
    for (const ref of doc.refs) checkReference(doc.file, doc.locale, ref);
  let jsxFiles = 0;
  for (const file of (await filesIn(join(root, "src"))).filter((f) =>
    /\.(tsx?|jsx?|json)$/.test(f)
  )) {
    const content = await readFile(file, "utf8");
    if (/\.tsx$/.test(file)) {
      jsxFiles++;
      const result = ts.transpileModule(content, {
        fileName: file,
        reportDiagnostics: true,
        compilerOptions: {
          jsx: ts.JsxEmit.Preserve,
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
        },
      });
      for (const diagnostic of result.diagnostics || [])
        if (diagnostic.category === ts.DiagnosticCategory.Error)
          issue(
            file,
            "jsx",
            ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")
          );
    }
    if (file.endsWith(".json"))
      try {
        JSON.parse(content);
      } catch (error) {
        issue(file, "json", error.message);
      }
    const inspectString = (value) => {
      if (value.startsWith("/docs/") && !/\s/.test(value))
        checkReference(file, "source", { url: value });
      for (const match of value.matchAll(/\]\((\/docs\/[^)]+)\)/g))
        checkReference(file, "source", { url: match[1] });
    };
    if (file.endsWith(".json")) {
      const inspectValue = (value) => {
        if (typeof value === "string") inspectString(value);
        else if (value && typeof value === "object")
          for (const child of Object.values(value)) inspectValue(child);
      };
      try {
        inspectValue(JSON.parse(content));
      } catch {}
    } else {
      const source = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );
      const inspectNode = (node) => {
        if (
          ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node)
        )
          inspectString(node.text);
        ts.forEachChild(node, inspectNode);
      };
      inspectNode(source);
    }
  }
  const readme = join(root, "README.md");
  try {
    markdown.parse(await readFile(readme, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") issue(readme, "markdown", error.message);
  }
  return {
    sourceDocuments: sourceFiles.length,
    documents: documents.length,
    jsxFiles,
    generatedCategories: categories.length,
    errors,
  };
}
