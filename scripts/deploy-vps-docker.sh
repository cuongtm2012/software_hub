#!/usr/bin/env bash
# Non-interactive VPS deploy: docker-compose.vps.yml (DB/cache) + npm ci + PM2.
# Invoked from GitHub Actions after tarball extract to PROJECT_PATH (e.g. /var/www/software-hub).

set -euo pipefail

echo "=================================="
echo "Software Hub — VPS deploy script"
echo "=================================="

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_ROOT"

COMPOSE_FILE="docker-compose.vps.yml"

compose() {
  if docker compose version &>/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" "$@"
  elif command -v docker-compose &>/dev/null; then
    docker-compose -f "$COMPOSE_FILE" "$@"
  else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available."
    exit 1
  fi
}

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Missing $COMPOSE_FILE in $APP_ROOT"
  exit 1
fi

echo "📦 Starting / updating infrastructure containers..."
compose up -d

echo "📥 Installing production npm dependencies..."
if [ -f package-lock.json ]; then
  npm ci --omit=dev --no-audit --no-fund
else
  npm install --omit=dev --no-audit --no-fund
fi

if ! command -v pm2 &>/dev/null; then
  echo "❌ PM2 is not installed. Install with: npm i -g pm2"
  exit 1
fi

echo "🔄 Reloading PM2 (ecosystem.config.js)..."
pm2 reload ecosystem.config.js --env production 2>/dev/null || pm2 start ecosystem.config.js --env production
pm2 save

echo "📊 PM2 status:"
pm2 status || true

echo "=================================="
echo "✅ Deploy finished"
echo "=================================="
