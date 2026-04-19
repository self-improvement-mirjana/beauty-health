#!/usr/bin/env bash
#
# End-to-end smoke flow against a running API.
#
# Docker (preporučeno za isti stack kao u CI / tim):
#   Iz korena repozitorijuma (gde je docker-compose.yml):
#     docker compose up --build -d
#   Backend sluša na hostu: http://localhost:8080 (mapiranje iz compose fajla).
#   Profil u kontejneru je `local` — uključen je Liquibase seed uključujući moderatora.
#
# Lokalno bez Docker-a:
#   Pokreni PostgreSQL (ili samo H2 ne važi za ovu skriptu — treba živa API instanca),
#   zatim iz backend/: ./gradlew bootRun  (obično profil `local`).
#
# Requirements: curl, jq
#
# Environment:
#   BASE_URL              default http://localhost:8080 (isti kao docker-compose port)
#   DEMO_WAIT_MAX_SEC     čekanje da API odgovori na ping (podrazumevano 90)
#   DEMO_EMAIL            email kupca (podrazumevano demo-<timestamp>@example.local)
#   DEMO_PASS             lozinka kupca (podrazumevano DemoUserPass1!)
#   MODERATOR_EMAIL       prazno = preskoči moderator deo; podrazumevano moderator@local.test
#   MODERATOR_PASSWORD    podrazumevano ModeratorLocal1!
#
# Moderator nalog (Liquibase context `local`, vidi backend/README.md): moderator@local.test

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
DEMO_WAIT_MAX_SEC="${DEMO_WAIT_MAX_SEC:-90}"
DEMO_PASS="${DEMO_PASS:-DemoUserPass1!}"
DEMO_EMAIL="${DEMO_EMAIL:-demo-$(date +%s)@example.local}"
MODERATOR_EMAIL="${MODERATOR_EMAIL:-moderator@local.test}"
MODERATOR_PASSWORD="${MODERATOR_PASSWORD:-ModeratorLocal1!}"

hdr() { printf '\n=== %s ===\n' "$*"; }

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

need_cmd curl
need_cmd jq

wait_for_api() {
  local deadline=$((SECONDS + DEMO_WAIT_MAX_SEC))
  hdr "Waiting for API at ${BASE_URL} (max ${DEMO_WAIT_MAX_SEC}s)…"
  while (( SECONDS < deadline )); do
    if curl -sf "${BASE_URL}/api/v1/catalog/ping" -H 'Accept: application/json' | jq -e '.ok == true' >/dev/null 2>&1; then
      printf 'API is up.\n'
      return 0
    fi
    sleep 2
  done
  die "API did not become ready. Start stack first, e.g. from repo root: docker compose up --build -d"
}
wait_for_api

api_get() {
  local path="$1"
  shift
  curl -sS "${BASE_URL}${path}" "$@" -H 'Accept: application/json'
}

api_post_json() {
  local path="$1"
  local body="$2"
  shift 2
  curl -sS "${BASE_URL}${path}" "$@" -H 'Accept: application/json' -H 'Content-Type: application/json' -d "$body"
}

hdr "Health: catalog + cart ping"
api_get '/api/v1/catalog/ping' | jq .
api_get '/api/v1/cart/ping' | jq .

hdr "Money format (docs/API_MONEY.md)"
api_get '/api/v1/catalog/money-format-example' | jq .

hdr "Public catalog snippet"
api_get '/api/v1/products?page=0&size=2' | jq '{totalElements, firstSlugs: [.content[].slug]}'

hdr "PLP categoryFacet (comma-separated) vs Lice-only — facet total is usually lower"
LICE_ONLY=$(api_get '/api/v1/products?page=0&size=1&categorySlug=lice' | jq -r '.totalElements // empty')
LICE_FACET=$(api_get '/api/v1/products?page=0&size=1&categorySlug=lice&categoryFacet=masna-koza-tip-koze,problematicna' | jq -r '.totalElements // empty')
printf '  totalElements Lice only:             %s\n' "${LICE_ONLY:-?}"
printf '  totalElements Lice + skin facets:    %s\n' "${LICE_FACET:-?}"
if [[ -n "${LICE_ONLY:-}" && -n "${LICE_FACET:-}" && "$LICE_ONLY" == "$LICE_FACET" ]]; then
  printf '  (Napomena: isti broj — proveri da li backend/JAR ima najnoviji kod i da Liquibase „tip kože pod Lice“ važi na bazi.)\n'
fi

hdr "Category child product counts (PLP sidebar, npr. roditelj lice)"
api_get '/api/v1/categories/lice/child-product-counts' | jq 'if type == "array" then .[0:3] else . end'

hdr "Category product counts by slug (mega-meni, podstablo)"
api_get '/api/v1/categories/product-counts?slug=bb-cc-kreme&slug=akne' | jq .

hdr "Public catalog sort=price,asc (smoke — stariji backend bez ORDER BY price vraća 500)"
PRICE_SORT_JSON=$(api_get '/api/v1/products?page=0&size=1&sort=price,asc')
echo "$PRICE_SORT_JSON" | jq -e '.content != null and (.content | type == "array")' >/dev/null \
  || die 'GET /products?sort=price,asc failed — rebuild backend image: docker compose build backend && docker compose up -d backend'
echo "$PRICE_SORT_JSON" | jq '{totalElements, firstSlug: .content[0].slug, firstPrice: .content[0].moneyRegular.amount}'

hdr "Register customer: ${DEMO_EMAIL}"
REG_BODY=$(jq -n \
  --arg email "$DEMO_EMAIL" \
  --arg pass "$DEMO_PASS" \
  --arg name "Demo Buyer" \
  '{email:$email, password:$pass, fullName:$name}')
REG_JSON=$(api_post_json '/api/v1/auth/register' "$REG_BODY")
echo "$REG_JSON" | jq .
TOKEN=$(echo "$REG_JSON" | jq -er '.accessToken') || die 'register failed (no accessToken). Is the API up? Email already used? Try DEMO_EMAIL=...'

hdr "GET /auth/me"
curl -sS "${BASE_URL}/api/v1/auth/me" -H "Authorization: Bearer ${TOKEN}" -H 'Accept: application/json' | jq .

hdr "Product PDP (seed slug product-001) → variant id"
PDP=$(api_get '/api/v1/products/product-001')
echo "$PDP" | jq '{slug, title: .title, variantId: .variants[0].id, moneyRegular: .variants[0].moneyRegular}'
VARIANT_ID=$(echo "$PDP" | jq -er '.variants[0].id') || die 'no variant on product-001'

hdr "Add to cart (authenticated)"
CART=$(api_post_json '/api/v1/cart/items' "{\"variantId\":${VARIANT_ID},\"quantity\":2}" -H "Authorization: Bearer ${TOKEN}")
echo "$CART" | jq '{empty, lineCount, totalQuantity, subtotal}'
echo "$CART" | jq -e '.empty == false' >/dev/null || die 'cart should not be empty'

hdr "Cart summary"
curl -sS "${BASE_URL}/api/v1/cart/summary" -H "Authorization: Bearer ${TOKEN}" -H 'Accept: application/json' | jq .

hdr "Checkout (COD)"
ORDER_BODY='{"recipientName":"Demo Primac","recipientPhone":"0600000000","addressLine1":"Ulica 1","addressLine2":null,"city":"Beograd","postalCode":"11000","countryCode":"RS"}'
ORDER_JSON=$(api_post_json '/api/v1/orders' "$ORDER_BODY" -H "Authorization: Bearer ${TOKEN}")
echo "$ORDER_JSON" | jq .
ORDER_ID=$(echo "$ORDER_JSON" | jq -er '.orderId') || die 'checkout failed'

hdr "Order detail (customer)"
curl -sS "${BASE_URL}/api/v1/orders/${ORDER_ID}" -H "Authorization: Bearer ${TOKEN}" -H 'Accept: application/json' | jq '{id, status, total, lines: [.lines[] | {quantity, lineTotal}]}'

hdr "Cart empty after checkout"
curl -sS "${BASE_URL}/api/v1/cart" -H "Authorization: Bearer ${TOKEN}" -H 'Accept: application/json' | jq '{empty, subtotal}'

if [[ -n "$MODERATOR_EMAIL" ]]; then
  hdr "Moderator login (${MODERATOR_EMAIL})"
  MOD_BODY=$(jq -n --arg e "$MODERATOR_EMAIL" --arg p "$MODERATOR_PASSWORD" '{email:$e, password:$p}')
  MOD_JSON=$(api_post_json '/api/v1/auth/login' "$MOD_BODY")
  if echo "$MOD_JSON" | jq -e '.accessToken' >/dev/null 2>&1; then
    MOD_TOKEN=$(echo "$MOD_JSON" | jq -er '.accessToken')
    echo "$MOD_JSON" | jq '{tokenType, expiresInSeconds, user: .user.email}'
    curl -sS "${BASE_URL}/api/v1/admin/ping" -H "Authorization: Bearer ${MOD_TOKEN}" -H 'Accept: application/json' | jq .
    curl -sS "${BASE_URL}/api/v1/admin/orders?page=0&size=3" -H "Authorization: Bearer ${MOD_TOKEN}" -H 'Accept: application/json' | jq '{totalElements, sample: [.content[]? | {id, status, customerEmail, total}]}'
    curl -sS "${BASE_URL}/api/v1/admin/orders/${ORDER_ID}" -H "Authorization: Bearer ${MOD_TOKEN}" -H 'Accept: application/json' | jq '{customerEmail, order: {id: .order.id, status: .order.status}}'
  else
    printf 'WARN: moderator login failed (expected with non-local DB / missing seed). JSON:\n%s\n' "$(echo "$MOD_JSON" | jq -c .)"
  fi
else
  echo "MODERATOR_EMAIL empty — skipping moderator block."
fi

hdr "Done"
printf 'Customer: %s / %s\n' "$DEMO_EMAIL" "$DEMO_PASS"
printf 'API base: %s\n' "$BASE_URL"
printf 'Isti tok u browseru (Playwright): iz korena repoa cd e2e && npm install && npx playwright install chromium && npm test\n'
