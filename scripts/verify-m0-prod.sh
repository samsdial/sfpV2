#!/usr/bin/env bash
# Verificación automática M0 en producción. Uso: ./scripts/verify-m0-prod.sh [BASE_URL]
set -euo pipefail
BASE="${1:-https://peru-cobra-411499.hostingersite.com}"
BASE="${BASE%/}"

echo "== Health =="
curl -sf "$BASE/api/health" | jq .

echo "== Redirect / -> login =="
code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/")
loc=$(curl -sS -I "$BASE/" | grep -i '^location:' || true)
echo "HTTP $code $loc"

echo "== /registro (esperado 404 tras ALLOW_SIGNUP=false) =="
reg=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/registro")
echo "HTTP $reg"

echo "== /dev/ui (esperado 404 en producción) =="
dev=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/dev/ui")
echo "HTTP $dev"

if [ "$reg" = "404" ] && [ "$dev" = "404" ]; then
  echo "OK: M0 prod gates automáticos pasaron."
else
  echo "Pendiente: registro=$reg (quieres 404), dev/ui=$dev (quieres 404)."
  exit 1
fi
