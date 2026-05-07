import type { Config } from "@docusaurus/types";
import baseConfig from "./docusaurus.config";

const PREVIEW_BASE_URL = "/botse/";

// Raw HTML tags inside markdown (<img>, <a>) bypass Docusaurus's baseUrl
// rewriting, so absolute paths like /icons/foo.svg break on a non-root
// baseUrl. Prefix them at preprocess time. Skips protocol-relative URLs and
// anchors. Upstream uses baseUrl="/" and does not need this fix.
const prefixAbsoluteHtmlPaths = ({ fileContent }: { fileContent: string }) =>
  fileContent.replace(
    /(<(?:img|a|source)\b[^>]*?\s(?:src|href)=)"\/(?!\/)/g,
    `$1"${PREVIEW_BASE_URL}`,
  );

const previewConfig: Config = {
  ...baseConfig,
  url: "https://sfaqer.github.io",
  baseUrl: PREVIEW_BASE_URL,
  organizationName: "sfaqer",
  projectName: "botse",
  markdown: {
    ...(baseConfig.markdown ?? {}),
    preprocessor: prefixAbsoluteHtmlPaths,
  },
  themeConfig: {
    ...baseConfig.themeConfig,
    algolia: undefined,
  },
  themes: [
    ...(baseConfig.themes ?? []),
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en", "ru"],
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
      },
    ],
  ],
};

export default previewConfig;
