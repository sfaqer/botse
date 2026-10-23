// Keep Docusaurus directive syntax out of editable Markdown translation units.
// Custom callout captions are localized through the Admonition theme wrapper.
export function prepareEnglishMirror(source) {
  return source
    .replace(/\r\n/g, '\n')
    .replace(/^(:::[a-z][\w-]*(?:\[[^\]]*\])?[^\n]*)$/gm,
      '<!-- translate:off -->\n$1\n<!-- translate:on -->')
    .replace(/^(:::)\s*$/gm,
      '<!-- translate:off -->\n$1\n<!-- translate:on -->');
}
