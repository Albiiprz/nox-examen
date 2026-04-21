#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://examen.noxseason.com}"

echo "[smoke] Health check: ${BASE_URL}/api/health"
health_code=$(curl -s -o /tmp/nox_health.json -w "%{http_code}" "${BASE_URL}/api/health")
if [[ "$health_code" != "200" ]]; then
  echo "[smoke][ERROR] /api/health devolvió HTTP $health_code"
  cat /tmp/nox_health.json || true
  exit 1
fi

echo "[smoke] Ready check: ${BASE_URL}/api/ready"
ready_code=$(curl -s -o /tmp/nox_ready.json -w "%{http_code}" "${BASE_URL}/api/ready")
if [[ "$ready_code" != "200" ]]; then
  echo "[smoke][ERROR] /api/ready devolvió HTTP $ready_code"
  cat /tmp/nox_ready.json || true
  exit 1
fi

echo "[smoke] Security headers check"
headers=$(curl -sI "${BASE_URL}/")
for header in "x-frame-options" "x-content-type-options" "content-security-policy" "x-request-id"; do
  if ! echo "$headers" | tr '[:upper:]' '[:lower:]' | grep -q "$header"; then
    echo "[smoke][ERROR] Falta cabecera: $header"
    exit 1
  fi
done

echo "[smoke] OK"
