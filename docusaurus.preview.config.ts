import type { Config } from "@docusaurus/types";
import baseConfig from "./docusaurus.config";

const previewConfig: Config = {
  ...baseConfig,
  url: "https://sfaqer.github.io",
  baseUrl: "/botse/",
  organizationName: "sfaqer",
  projectName: "botse",
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
