const isElement = (node, tagName) =>
  node.type === "element" && node.tagName === tagName;

function isClassTableWrapper(node) {
  const className = isElement(node, "div")
    ? node.properties?.className
    : node.type === "mdxJsxFlowElement" && node.name === "div"
      ? node.attributes?.find(
          (attribute) =>
            attribute.type === "mdxJsxAttribute" &&
            attribute.name === "className"
        )?.value
      : undefined;
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string"
      ? className.split(/\s+/)
      : [];
  return classes.includes("class-table-wrapper");
}

function textContent(node) {
  if (node.type === "text") return node.value;
  if (isElement(node, "br") || node.name === "br") return " ";
  return (node.children ?? []).map(textContent).join("");
}

function labelTable(table) {
  const head = table.children.find((node) => isElement(node, "thead"));
  const headerRows = head?.children.filter((node) => isElement(node, "tr"));
  if (headerRows?.length !== 1) return;
  const [headerRow] = headerRows;
  const headers = headerRow?.children.filter((node) => isElement(node, "th"));
  if (!headers?.length) return;

  const rows = table.children
    .filter((node) => isElement(node, "tbody"))
    .flatMap((body) => body.children.filter((node) => isElement(node, "tr")))
    .map((row) => row.children.filter((node) => isElement(node, "td")));
  // Class tables have one header row and one cell per column. Do not guess
  // column labels for tables whose cells span multiple rows or columns.
  const cells = [...headers, ...rows.flat()];
  if (
    rows.some((row) => row.length !== headers.length) ||
    cells.some(
      (cell) => cell.properties?.colSpan > 1 || cell.properties?.rowSpan > 1
    )
  )
    return;

  const labels = headers.map((cell) =>
    textContent(cell).replace(/\s+/g, " ").trim()
  );
  for (const row of rows) {
    row.forEach((cell, index) => {
      cell.properties ??= {};
      cell.properties["data-label"] = labels[index];
    });
  }
}

// Build labels from the localized Markdown so mobile cards work before
// hydration and automatically follow translations of the table headers.
export default function rehypeClassTableLabels() {
  return function transform(tree) {
    function walk(node, insideClassTable = false) {
      const inside = insideClassTable || isClassTableWrapper(node);
      if (inside && isElement(node, "table")) labelTable(node);
      for (const child of node.children ?? []) walk(child, inside);
    }
    walk(tree);
  };
}
