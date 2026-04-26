#!/usr/bin/env bash
# Demo skripta: loguje bank admina, izdaje RSA cert za beauty-health merchant-a,
# i ispisuje privatni ključ i javni ključ za copy/paste u shop .env.
#
# Korišćenje:
#   ./bank/scripts/demo-issue-cert.sh [BANK_BASE_URL]
#
# Podrazumevani BANK_BASE_URL: http://localhost:8090

set -euo pipefail

BANK_URL="${1:-http://localhost:8090}"

echo "==> Prijavljivanje na banku ($BANK_URL)..."
LOGIN_RESP=$(curl -s -X POST "$BANK_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@banka.local","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "GRESKA: Login neuspesan. Odgovor: $LOGIN_RESP"
  exit 1
fi
echo "    Token: ${TOKEN:0:20}..."

echo ""
echo "==> Trazim beauty-health merchant..."
MERCHANTS=$(curl -s "$BANK_URL/api/v1/admin/merchants" \
  -H "Authorization: Bearer $TOKEN")

MERCHANT_ID=$(echo "$MERCHANTS" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$MERCHANT_ID" ]; then
  echo "GRESKA: Merchant beauty-health nije pronadjen."
  exit 1
fi
echo "    Merchant ID: $MERCHANT_ID"

echo ""
echo "==> Izdajem RSA keypair za merchant $MERCHANT_ID..."
CRED_RESP=$(curl -s -X POST "$BANK_URL/api/v1/admin/merchants/$MERCHANT_ID/credentials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"RSA_KEYPAIR","validityDays":365}')

SERIAL=$(echo "$CRED_RESP" | grep -o '"serial":"[^"]*"' | cut -d'"' -f4)
echo "    Serial: $SERIAL"

echo ""
echo "================================================================"
echo "PRIVATNI KLJUC (za shop backend env APP_BANK_PRIVATE_KEY_PEM):"
echo "================================================================"
echo "$CRED_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('privateKeyPem','N/A'))" 2>/dev/null || \
echo "$CRED_RESP" | grep -o '"privateKeyPem":"[^"]*"' | cut -d'"' -f4 | sed 's/\\n/\n/g'

echo ""
echo "================================================================"
echo "JAVNI KLJUC (za shop backend env APP_BANK_BANK_PUBLIC_KEY_PEM):"
echo "================================================================"
echo "$CRED_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('publicKeyPem','N/A'))" 2>/dev/null || \
echo "$CRED_RESP" | grep -o '"publicKeyPem":"[^"]*"' | cut -d'"' -f4 | sed 's/\\n/\n/g'

echo ""
echo "================================================================"
echo "Kopirajte gore prikazane kljuceve u docker-compose.yml environment"
echo "varijable za backend servis, ili u application-local.yml."
echo "================================================================"
