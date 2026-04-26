#!/usr/bin/env bash
# Pokreni Postgres + Spring Boot backend kroz docker compose i sačekaj zdravlje API-ja.
# Idempotentno: ako je stack već gore, samo proverava ping.
#
# Sve flagove i env vidi: README.md u istom folderu.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_BH_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"   # beauty-health/

API_URL="${API_URL:-http://localhost:8080}"
WAIT_MAX="${WAIT_MAX:-180}"

cd "$REPO_BH_ROOT"

echo "=== beauty-health: docker compose up (postgres + backend) ==="
docker compose up --build -d postgres backend

echo
echo "=== Čekanje da backend odgovori na ${API_URL}/api/v1/catalog/ping (max ${WAIT_MAX}s) ==="
deadline=$((SECONDS + WAIT_MAX))
while (( SECONDS < deadline )); do
    if curl -sf "${API_URL}/api/v1/catalog/ping" -H 'Accept: application/json' \
        | grep -q '"ok"'; then
        echo "  Backend je gore."
        break
    fi
    printf '.'
    sleep 2
done
echo

if ! curl -sf "${API_URL}/api/v1/catalog/ping" >/dev/null 2>&1; then
    echo "ERROR: Backend nije postao spreman u ${WAIT_MAX}s." >&2
    echo "  Pogledaj: docker compose logs backend" >&2
    exit 1
fi

echo
echo "=== Quick health checks ==="
curl -s "${API_URL}/api/v1/catalog/ping" | head -c 200; echo
curl -s "${API_URL}/api/v1/cart/ping"    | head -c 200; echo

echo
echo "Stack je spreman. Moderator app će biti pokrenut automatski preko Playwright webServer-a."
