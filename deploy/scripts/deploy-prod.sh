#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/opt/nox-examen}"

cd "$PROJECT_DIR"

echo "[deploy] Pull de cambios"
git pull --ff-only

echo "[deploy] Build y arranque"
docker compose -f deploy/docker-compose.prod.yml up -d --build --remove-orphans

echo "[deploy] Esperando 10s para warmup"
sleep 10

echo "[deploy] Smoke test"
./deploy/scripts/smoke-test.sh https://examen.noxseason.com

echo "[deploy] Despliegue completado"
