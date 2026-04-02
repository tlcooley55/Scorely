#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000/v1}"
AUTH_BEARER="${AUTH_BEARER:-}"
USERNAME="${USERNAME:-smoke_user}"

pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; exit 1; }

hdrs=()
if [[ -n "$AUTH_BEARER" ]]; then
  hdrs+=("-H" "Authorization: Bearer $AUTH_BEARER")
fi

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
[[ "$code" == "200" ]] && pass "GET /health" || fail "GET /health -> $code"

song_payload='{"title":"Smoke Song","artist":"Smoke Artist","album_art":null,"genre":null,"release_year":2026}'
code=$(curl -s -o /tmp/scorely_song.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  "${hdrs[@]}" \
  -d "$song_payload" "$BASE_URL/songs")
[[ "$code" == "201" ]] && pass "POST /songs" || fail "POST /songs -> $code"

song_id=$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('/tmp/scorely_song.json','utf8')); process.stdout.write(j.song_id||'')")
[[ -n "$song_id" ]] || fail "POST /songs" "/tmp/scorely_song.json missing song_id"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/songs/$song_id")
[[ "$code" == "200" ]] && pass "GET /songs/:songId" || fail "GET /songs/:songId -> $code"

rating_payload=$(printf '{"song_id":"%s","rating_value":5,"review":"Smoke test review"}' "$song_id")
code=$(curl -s -o /tmp/scorely_rating.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  "${hdrs[@]}" \
  -d "$rating_payload" "$BASE_URL/ratings")
[[ "$code" == "201" ]] && pass "POST /ratings" || fail "POST /ratings -> $code"

rating_id=$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('/tmp/scorely_rating.json','utf8')); process.stdout.write(j.rating_id||'')")
[[ -n "$rating_id" ]] || fail "POST /ratings" "/tmp/scorely_rating.json missing rating_id"

patch_payload='{"rating_value":4,"review":"Updated smoke test review"}'
code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  -H "Content-Type: application/json" \
  "${hdrs[@]}" \
  -d "$patch_payload" "$BASE_URL/ratings/$rating_id")
[[ "$code" == "200" ]] && pass "PATCH /ratings/:ratingId" || fail "PATCH /ratings/:ratingId -> $code"

code=$(curl -s -o /dev/null -w "%{http_code}" "${hdrs[@]}" "$BASE_URL/me/ratings")
[[ "$code" == "200" ]] && pass "GET /me/ratings" || fail "GET /me/ratings -> $code"

bookmark_payload=$(printf '{"song_id":"%s"}' "$song_id")
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  "${hdrs[@]}" \
  -d "$bookmark_payload" "$BASE_URL/bookmarks")
[[ "$code" == "201" ]] && pass "POST /bookmarks" || fail "POST /bookmarks -> $code"

code=$(curl -s -o /dev/null -w "%{http_code}" "${hdrs[@]}" "$BASE_URL/bookmarks")
[[ "$code" == "200" ]] && pass "GET /bookmarks" || fail "GET /bookmarks -> $code"

profile_payload=$(printf '{"username":"%s"}' "$USERNAME")
code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  -H "Content-Type: application/json" \
  "${hdrs[@]}" \
  -d "$profile_payload" "$BASE_URL/me/profile")
[[ "$code" == "200" ]] && pass "PATCH /me/profile" || fail "PATCH /me/profile -> $code"

code=$(curl -s -o /dev/null -w "%{http_code}" "${hdrs[@]}" "$BASE_URL/me/profile")
[[ "$code" == "200" ]] && pass "GET /me/profile" || fail "GET /me/profile -> $code"

pass "DONE: smoke tests completed"
