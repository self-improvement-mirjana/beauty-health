#!/usr/bin/env bash
# Stop docker compose stack (ne dira Vite dev server-e — Playwright ih automatski ugasi po završetku).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_BH_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_BH_ROOT"

echo "=== docker compose down ==="
docker compose down
