import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import { repoRoot } from "./i18n-utils.mjs";
for (const mode of ["development", "production"])
  test(`SSR preserves UTF-8 text and anchor attributes in ${mode}`, () => {
    const result = execFileSync(
      process.execPath,
      [join(repoRoot, "scripts/fixtures/ssr-unicode.cjs")],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: mode },
      }
    );
    assert.deepEqual(JSON.parse(result), { zeroBytes: 0, exact: true });
  });
