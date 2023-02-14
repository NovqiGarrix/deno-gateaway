$PORT = 8080
$url = "http://localhost:$PORT/gateway/healthcheck"


for ($i=1; $i -le 12; $i++) {
  Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing | Out-Null
}