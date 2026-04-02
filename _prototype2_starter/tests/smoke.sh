
#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
AUTH="${AUTH:-local-dev-key}"

pass() { echo "✓ $1"; }
fail() { echo "✗ $1"; exit 1; }

json() { echo "$1" | python3 -c 'import sys, json; import sys; print(json.dumps(json.load(sys.stdin), indent=2))' 2>/dev/null || true; }

# Health
code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $AUTH" "$BASE_URL/api/health")
[[ "$code" == "200" ]] && pass "GET /api/health" || fail "GET /api/health -> $code"

# List assignments
code=$(curl -s -o /tmp/p2_assignments.json -w "%{http_code}" -H "x-api-key: $AUTH" "$BASE_URL/api/assignments")
[[ "$code" == "200" ]] && pass "GET /api/assignments" || fail "GET /api/assignments -> $code"

# Create assignment
payload='{"title":"Prototype 2","dueDate":"2025-10-01T00:00:00Z"}'
code=$(curl -s -o /tmp/p2_create.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" -H "x-api-key: $AUTH" \
  -d "$payload" "$BASE_URL/api/assignments")
[[ "$code" =~ ^20[01]$ ]] && pass "POST /api/assignments" || fail "POST /api/assignments -> $code"

id=$(python3 - <<'PY'
import json,sys
try:
    data=json.load(open("/tmp/p2_create.json"))
    print(data.get("id",""))
except Exception:
    print("")
PY
)

if [[ -z "$id" ]]; then
  fail "Created assignment has no id"
fi

# Get by id
code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $AUTH" "$BASE_URL/api/assignments/$id")
[[ "$code" == "200" ]] && pass "GET /api/assignments/$id" || fail "GET /api/assignments/$id -> $code"
