// Regenerate the Enemy Skills index page (the table at /docs/battles/enemy-skills/)
// from the per-skill markdown files in this directory. Run after adding,
// removing, or renaming an enemy skill: `node createIndex.js`.
//
// The Enemy Skills Tracker UI used to read its data from a separate
// `src/data/enemySkills.json` written here, but it now derives that
// per-locale at build time via `scripts/build-enemy-skills-data.mjs` from
// the same markdown frontmatter — so this script no longer writes JSON.
const fs = require("fs");
const path = require("path");

const enemySkillsDir = path.join(__dirname);
const botseDir = path.resolve(enemySkillsDir, "../../..");
const files = fs
  .readdirSync(enemySkillsDir)
  .filter((file) => file.endsWith(".md") && file !== "index.md");

const enemySkills = files.map((file) => {
  const filePath = path.join(enemySkillsDir, file);
  const content = fs.readFileSync(filePath, "utf-8");

  const frontMatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
  const frontMatter = frontMatterMatch ? frontMatterMatch[1] : "";

  const idMatch = frontMatter.match(/id:\s*(\w+)/);
  const titleMatch = frontMatter.match(/title:\s*(.+)/);
  const hoverTextMatch = frontMatter.match(/hoverText:\s*(.+)/);

  return {
    id: idMatch ? idMatch[1] : "",
    title: titleMatch ? titleMatch[1].replace(/"/g, "") : "",
    hoverText: hoverTextMatch ? hoverTextMatch[1] : "",
    filePath:
      "/" +
      path
        .relative(
          botseDir,
          path.join(path.dirname(filePath), path.parse(filePath).name)
        )
        .replace(/\\/g, "/"),
  };
});

let markdownContent = `---\nid: enemy-skills\ntitle: Enemy Skills\nslug: /battles/enemy-skills/index\nhoverText: An overview of the enemy skills.\n---\n\n`;
markdownContent += `| Skill | Ability |\n|-------|------------|\n`;

enemySkills.forEach((skill) => {
  markdownContent += `| [${skill.title}](${skill.filePath}) | ${skill.hoverText} |\n`;
});

fs.writeFileSync(path.join(__dirname, "index.md"), markdownContent);
