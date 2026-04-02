param(
  [string]$ApiBase = "http://localhost:3000/v1",
  [string]$Username = "smoke_user"
)

$ErrorActionPreference = "Stop"

function Pass($name) { Write-Host "PASS  $name" -ForegroundColor Green }
function Fail($name, $err) {
  Write-Host "FAIL  $name" -ForegroundColor Red
  if ($err) { Write-Host ($err | Out-String) -ForegroundColor Red }
  exit 1
}

function Hit($name, [scriptblock]$fn) {
  try {
    $result = & $fn
    Pass $name
    return $result
  } catch {
    $resp = $_.Exception.Response
    if ($resp -and $resp.StatusCode) {
      $code = [int]$resp.StatusCode
      $body = $_.ErrorDetails.Message
      Fail "$name -> $code" $body
    }
    Fail $name $_
  }
}

Write-Host "Scorely API smoke test" -ForegroundColor Cyan
Write-Host "ApiBase: $ApiBase" -ForegroundColor Cyan

Hit "GET /health" { Invoke-RestMethod -Method Get -Uri "$ApiBase/health" | Out-Null }

$newSong = Hit "POST /songs" {
  $body = @{ title = "Smoke Song"; artist = "Smoke Artist"; album = "Smoke Album"; year = 2026 } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$ApiBase/songs" -ContentType "application/json" -Body $body
}

$songId = $newSong.song_id
if (-not $songId) { Fail "POST /songs" "No song_id returned" }
Write-Host "song_id=$songId" -ForegroundColor DarkGray

Hit "GET /songs/:songId" { Invoke-RestMethod -Method Get -Uri "$ApiBase/songs/$songId" | Out-Null }

$rating = Hit "POST /ratings" {
  $body = @{ song_id = $songId; rating_value = 5; review = "Smoke test review" } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$ApiBase/ratings" -ContentType "application/json" -Body $body
}

$ratingId = $rating.rating_id
if (-not $ratingId) { Fail "POST /ratings" "No rating_id returned" }
Write-Host "rating_id=$ratingId" -ForegroundColor DarkGray

Hit "PATCH /ratings/:ratingId" {
  $body = @{ rating_value = 4; review = "Updated smoke test review" } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$ApiBase/ratings/$ratingId" -ContentType "application/json" -Body $body | Out-Null
}

Hit "GET /me/ratings" { Invoke-RestMethod -Method Get -Uri "$ApiBase/me/ratings" | Out-Null }

Hit "POST /bookmarks" {
  $body = @{ song_id = $songId } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$ApiBase/bookmarks" -ContentType "application/json" -Body $body | Out-Null
}

Hit "GET /bookmarks" { Invoke-RestMethod -Method Get -Uri "$ApiBase/bookmarks" | Out-Null }

Hit "PATCH /me/profile" {
  $body = @{ username = $Username } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$ApiBase/me/profile" -ContentType "application/json" -Body $body | Out-Null
}

Hit "GET /me/profile" { Invoke-RestMethod -Method Get -Uri "$ApiBase/me/profile" | Out-Null }

Write-Host "DONE: smoke tests completed" -ForegroundColor Cyan
