#!/usr/bin/env bash
# Pokreni docker stack + headless Playwright walkthrough koji pravi PNG-ove svake stranice.
#
# Izlaz: beauty-health/e2e/screenshots/NN_naziv.png
#
# Env:
#   WAIT_MAX  koliko sekundi maks čekati backend (default 180)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

bash "$SCRIPT_DIR/up.sh"

cd "$E2E_DIR"

if [ ! -d node_modules ]; then
    echo "=== npm install (e2e) ==="
    npm install
fi

if [ ! -d "$HOME/.cache/ms-playwright" ] && [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
    echo "=== playwright install chromium ==="
    npx playwright install chromium
fi

echo
echo "=== Walkthrough (headless, screenshoti u e2e/screenshots/) ==="
WALKTHROUGH_PAUSE_MS="${WALKTHROUGH_PAUSE_MS:-500}" \
    npx playwright test tests/moderator-walkthrough.spec.ts --reporter=list

echo
echo "=== Sačuvani screenshoti ==="
ls -1 screenshots/*.png 2>/dev/null | sed 's|^|  |' || echo "  (nema PNG-ova — pogledaj output iznad)"
