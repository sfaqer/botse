import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import rehypeClassTableLabels from "./rehype-class-table-labels.mjs";

async function render(source) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeClassTableLabels],
  });
  return renderToStaticMarkup(createElement(Content));
}

const labels = (html) =>
  [...html.matchAll(/data-label="([^"]*)"/g)].map((match) => match[1]);

for (const headers of [
  ["Tenacity Cost", "Name", "Ability", "Upgrade effect"],
  ["Стоимость стойкости", "Название", "Способность", "Эффект повышения"],
]) {
  test(`mobile class labels use localized headers during SSR: ${headers[0]}`, async () => {
    const table = (columns) =>
      `| ${columns.join(" | ")} |\n| ${columns.map(() => "---").join(" | ")} |\n| ${columns.map((_, index) => index + 1).join(" | ")} |`;
    const html = await render(`
<div className="class-table-wrapper">

${table(headers.slice(0, 3))}

</div>

<div className="extra class-table-wrapper">

${table(headers)}

</div>
`);
    assert.deepEqual(labels(html), [...headers.slice(0, 3), ...headers]);
  });
}

test("header formatting becomes safe plain-text labels without changing other tables", async () => {
  const html = await render(`
| Ordinary header |
| --- |
| Outside |

<div className="class-table-wrapper-other">

| Similar wrapper name |
| --- |
| Outside |

</div>

<div className="class-table-wrapper">

| **Стоимость** [стойкости](/tenacity) | Name &quot;A&quot; &amp; B |
| --- | --- |
| 1 | <img src="/icons/test.svg" alt="Test" /> |

</div>
`);
  assert.deepEqual(labels(html), [
    "Стоимость стойкости",
    "Name &quot;A&quot; &amp; B",
  ]);
  assert(
    html.includes(
      '<th><strong>Стоимость</strong> <a href="/tenacity">стойкости</a></th>'
    )
  );
  assert(html.includes('<img src="/icons/test.svg" alt="Test"'));
  assert.equal((html.match(/data-label=/g) ?? []).length, 2);
});
