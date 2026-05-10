import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import addTooltips from "./addTooltips";
import ListItem from "@mui/material/ListItem";

interface EnemySkillCardsProps {
  title: string;
  ability: string;
  link: string;
}

// Prefix internal `/docs/...` (and any other root-relative) URLs with the
// site baseUrl + active locale segment so the rendered <a> matches what
// Docusaurus' <Link> would have produced. The body of each card is built
// from a JSON string and injected via dangerouslySetInnerHTML, so it
// bypasses both <Link> and the markdown preprocessor that handles this
// for normal .md content.
const markdownToHtml = (markdown: string, urlPrefix: string): string => {
  let html = markdown
    .replace(/\\/g, "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, text, href) => {
      const resolved = href.startsWith("/") ? urlPrefix + href.slice(1) : href;
      return `<a href="${resolved}">${text}</a>`;
    });

  html = addTooltips(html);
  return html;
};

const EnemySkillCards: React.FC<EnemySkillCardsProps> = ({
  title,
  ability,
  link,
}) => {
  // siteConfig.baseUrl from useDocusaurusContext is already locale-aware at
  // runtime: on the ru locale it returns "/botse/ru/", on the default locale
  // it returns "/botse/" (or "/" in prod). Don't append the locale segment
  // manually — that doubles the prefix to "/botse/ru/ru/...".
  const { siteConfig } = useDocusaurusContext();
  const urlPrefix = siteConfig.baseUrl;

  return (
    <Card>
      <CardContent
        sx={{
          "&:last-child": {
            paddingBottom: 13 + "px",
          },
          padding: 13 + "px",
        }}
      >
        <h4 style={{ marginBottom: 5 + "px" }}>
          <Link to={link} target="_blank" rel="noopener noreferrer">
            {title}
          </Link>
        </h4>
        <span
          dangerouslySetInnerHTML={{ __html: markdownToHtml(ability, urlPrefix) }}
        ></span>
      </CardContent>
    </Card>
  );
};

export default EnemySkillCards;
