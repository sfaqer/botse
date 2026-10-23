#!/usr/bin/env bash
# Compatibility entry point; the implementation also runs directly on Windows.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$ROOT_DIR/scripts/sync-docs-mirror.mjs"
