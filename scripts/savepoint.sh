#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +"%Y%m%d-%H%M%S")"
OUT="snapshots/savepoint-$STAMP.tgz"

echo "↳ Creating snapshot to $OUT"
tar -czf "$OUT" \
  src/app/esglite/item \
  src/components/esglite \
  src/app/questionnaires/esglite \
  src/app/api/cdm \
  src/data/vsme \
  package.json tsconfig.json

echo "✓ Snapshot saved: $OUT"
