#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-3001}"
if lsof -iTCP -sTCP:LISTEN -nP | grep -q ":$PORT"; then
  echo "Port $PORT on juba kasutuses. Vabasta port või muuda PORT väärtust."
  exit 1
fi
exec npx next dev -p "$PORT"
