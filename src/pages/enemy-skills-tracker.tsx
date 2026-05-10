import React from "react";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import SkillSelector from "../components/SkillSelector";

export default function EnemySkillsTracker(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: "homepage.layout.title",
        message: "BOTSE Helper",
        description: "HTML <title> for the homepage and tracker page (the site brand name)",
      })}
      description={translate({
        id: "homepage.layout.description",
        message: "References and Guides for Betrayal of the Second Era.",
        description: "HTML <meta> description for the homepage and tracker page",
      })}
    >
      <main style={{ padding: 20 + "px" }}>
        <header>
          <h1>
            <Translate
              id="enemySkillsTracker.heading"
              description="<h1> heading on the Enemy Skills Tracker page"
            >
              Enemy Skills Tracker
            </Translate>
          </h1>
          <p>
            <Translate
              id="enemySkillsTracker.description"
              description="Intro paragraph above the tracker UI"
            >
              Select enemy skills from the menu below as they appear in battle, to keep track of which skills are currently present in the battle. You can collapse the panel for better visibility.
            </Translate>{" "}
          </p>
        </header>
        <SkillSelector />
      </main>
    </Layout>
  );
}
