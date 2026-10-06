#!/usr/bin/env bash
# Renders docs/diagrams/src/*.html to docs/diagrams/*.png (1600x1000 at 2x) with headless Chrome.
# Usage: scripts/render-diagrams.sh [name ...]   e.g. scripts/render-diagrams.sh 01-architecture
# Set CHROME to the Chrome or Chromium binary when it is not in the default macOS location.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src_dir="$root/docs/diagrams/src"
out_dir="$root/docs/diagrams"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [ ! -x "$chrome" ]; then
  echo "Chrome not found at: $chrome (set CHROME=/path/to/chrome)" >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  names=("$@")
else
  names=()
  for file in "$src_dir"/*.html; do names+=("$(basename "$file" .html)"); done
fi

for name in "${names[@]}"; do
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --force-device-scale-factor=2 --window-size=1600,1000 \
    --screenshot="$out_dir/$name.png" "file://$src_dir/$name.html" 2>/dev/null
  echo "Rendered docs/diagrams/$name.png"
done
