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

# Copy English source preserving directory structure.
cd "$SRC"
find . -type f \( -name '*.md' -o -name '*.mdx' \) | while read -r f; do
  mkdir -p "$EN_DIR/$(dirname "$f")"
  cp "$f" "$EN_DIR/$f"
done

en_count=$(find "$EN_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) | wc -l)
echo "Synced $en_count files into $EN_DIR"

# Seed missing target files in each locale so Weblate has them to track.
for locale in "${LOCALES[@]}"; do
  loc_dir="$ROOT_DIR/i18n/$locale/docusaurus-plugin-content-docs/current"
  mkdir -p "$loc_dir"
  added=0
  cd "$EN_DIR"
  find . -type f \( -name '*.md' -o -name '*.mdx' \) | while read -r f; do
    target="$loc_dir/${f#./}"
    if [ ! -f "$target" ]; then
      mkdir -p "$(dirname "$target")"
      cp "$f" "$target"
      added=$((added + 1))
      echo "  seeded $locale/${f#./}"
    fi
  done
done
