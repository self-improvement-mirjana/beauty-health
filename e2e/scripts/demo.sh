#!/usr/bin/env bash
# Live demo: pokreni docker stack pa otvori Chrome (headed) i šetaj se po moderator app-u
# sa 2 sekunde pauze između koraka i 400 ms slowMo na svakoj akciji.
#
# Korisno za snimanje ekrana / živo gledanje. Browser ostaje otvoren tokom svake akcije.
#
# Env (opciono):
#   WALKTHROUGH_PAUSE_MS   pauza između koraka u ms (default 2000)
#   PLAYWRIGHT_SLOW_MO     usporenje svake akcije u ms (default 400)
#   WAIT_MAX               sekundi za čekanje backend-a (default 180)

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

PAUSE="${WALKTHROUGH_PAUSE_MS:-2000}"
SLOW="${PLAYWRIGHT_SLOW_MO:-400}"

echo
echo "============================================================"
echo "  LIVE DEMO — Beauty Health Moderator"
echo "  pause/step: ${PAUSE} ms, slowMo/action: ${SLOW} ms"
echo "  Pokreni screen recorder ako želiš snimak."
echo "============================================================"
sleep 2

WALKTHROUGH_PAUSE_MS="$PAUSE" PLAYWRIGHT_SLOW_MO="$SLOW" \
    npx playwright test tests/moderator-walkthrough.spec.ts --headed --reporter=list

echo
echo "Demo gotov. PNG snapshoti su u: $E2E_DIR/screenshots/"
