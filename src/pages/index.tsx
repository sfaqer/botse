import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <p className="hero__subtitle">
          {translate({
            id: "homepage.tagline",
            message:
              "Unofficial references for The Elder Scrolls:Betrayal of the Second Era",
            description: "Site tagline shown as the homepage hero subtitle",
          })}
        </p>
        <div className={styles.buttons}></div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
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
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
