#!/usr/bin/env bash
# Mirror docs/ markdown files into i18n/en/docusaurus-plugin-content-docs/current/.
#
# Weblate cannot map a single component across two directories, so the
# English source markdown lives in two places: the canonical docs/ tree
# and a mirrored copy under i18n/en/.../current/. The mirror is what
# Weblate uses as the source for the Documentation component.
#
# Run this script after editing docs/ to keep the mirror in sync. CI also
# runs it on every push that touches docs/ and commits the result.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT_DIR/docs"
DST="$ROOT_DIR/i18n/en/docusaurus-plugin-content-docs/current"

if [ ! -d "$SRC" ]; then
  echo "docs/ not found at $SRC" >&2
  exit 1
fi

mkdir -p "$DST"

# Wipe existing mirrored markdown so deletions in docs/ propagate.
find "$DST" -type f \( -name '*.md' -o -name '*.mdx' \) -delete
find "$DST" -type d -empty -delete
mkdir -p "$DST"

# Copy markdown files preserving the directory structure.
cd "$SRC"
find . -type f \( -name '*.md' -o -name '*.mdx' \) | while read -r f; do
  mkdir -p "$DST/$(dirname "$f")"
  cp "$f" "$DST/$f"
done

echo "Synced $(find "$DST" -type f \( -name '*.md' -o -name '*.mdx' \) | wc -l) files into $DST"
