#!/usr/bin/env bash
# Mirror docs/ markdown files into i18n/en/docusaurus-plugin-content-docs/current/
# and seed missing locale targets so Weblate has a translation file to track.
#
# Weblate cannot map a single component across two directories, so the
# English source markdown lives in two places: the canonical docs/ tree
# and a mirrored copy under i18n/en/.../current/. The mirror is what
# Weblate uses as the source for the Documentation components.
#
# For each non-default locale (ru, ...), a parallel target file must exist
# for Weblate to display per-file translation stats. This script creates a
# starting copy of the English source for any missing target file, but
# never overwrites an existing one — translator progress is preserved.
#
# Run this script after editing docs/ to keep the mirror in sync. CI also
# runs it on every push that touches docs/ and commits the result.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT_DIR/docs"
EN_DIR="$ROOT_DIR/i18n/en/docusaurus-plugin-content-docs/current"
LOCALES=("ru")

if [ ! -d "$SRC" ]; then
  echo "docs/ not found at $SRC" >&2
  exit 1
fi

mkdir -p "$EN_DIR"

# Wipe existing English mirror so deletions in docs/ propagate.
find "$EN_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) -delete
find "$EN_DIR" -type d -empty -delete
mkdir -p "$EN_DIR"

# Copy English source preserving directory structure, then post-process each
# file to wrap Docusaurus admonition markers in translate:off / translate:on
# HTML comments. translate-toolkit's Markdown converter (used by Weblate)
# treats content between these markers as untranslatable, so the markers
# never appear in the translator's UI and never get translated. Without
# this workaround, ":::info" gets segmented together with the next line of
# content, presenting it to translators as a translatable string and
# risking ":::Информация" or similar syntax-breaking translations.
cd "$SRC"
find . -type f \( -name '*.md' -o -name '*.mdx' \) | while read -r f; do
  mkdir -p "$EN_DIR/$(dirname "$f")"
  cp "$f" "$EN_DIR/$f"
done

python_wrap_admonitions() {
  python -c "$(cat <<'PY'
import os, re, sys
root = sys.argv[1]
opener = re.compile(r'^(:::[a-z][\w-]*(?:\[[^\]]*\])?[^\n]*)$', re.M)
closer = re.compile(r'^(:::)\s*$', re.M)
for dp, _, files in os.walk(root):
    for name in files:
        if not (name.endswith('.md') or name.endswith('.mdx')):
            continue
        p = os.path.join(dp, name)
        with open(p, encoding='utf-8') as fh:
            src = fh.read()
        new = opener.sub(r'<!-- translate:off -->\n\1\n<!-- translate:on -->', src)
        new = closer.sub(r'<!-- translate:off -->\n\1\n<!-- translate:on -->', new)
        if new != src:
            with open(p, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)
PY
)" "$1"
}
python_wrap_admonitions "$EN_DIR"

en_count=$(find "$EN_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) | wc -l)
echo "Synced $en_count files into $EN_DIR (admonition markers wrapped)"

# Seed missing target files in each locale so Weblate has them to track,
# and wrap admonition markers in existing target files too — Weblate aligns
# units between source and target by content, and we need both sides to
# segment identically.
for locale in "${LOCALES[@]}"; do
  loc_dir="$ROOT_DIR/i18n/$locale/docusaurus-plugin-content-docs/current"
  mkdir -p "$loc_dir"
  cd "$EN_DIR"
  find . -type f \( -name '*.md' -o -name '*.mdx' \) | while read -r f; do
    target="$loc_dir/${f#./}"
    if [ ! -f "$target" ]; then
      mkdir -p "$(dirname "$target")"
      cp "$f" "$target"
      echo "  seeded $locale/${f#./}"
    fi
  done
  python_wrap_admonitions "$loc_dir"
  echo "  wrapped admonition markers in $locale"
done
