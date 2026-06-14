#!/usr/bin/env bash
# Non-interactive VPS deploy: docker-compose.vps.yml (DB/cache) + npm ci + PM2.
# Invoked from GitHub Actions after tarball extract to PROJECT_PATH (e.g. /var/www/software-hub).

set -euo pipefail

echo "=================================="
echo "Software Hub — VPS deploy script"
echo "=================================="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="docker-compose.vps.yml"
# Tarball deploy puts this script next to compose at repo root; a git clone has it under scripts/.
if [ -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
  APP_ROOT="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../$COMPOSE_FILE" ]; then
  APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  echo "❌ Missing $COMPOSE_FILE (looked in $SCRIPT_DIR and $SCRIPT_DIR/..)"
  exit 1
fi
cd "$APP_ROOT"

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

echo "🛑 Stopping legacy app containers that bind port 5000..."
for legacy in softwarehub-app software-hub-app; do
  if docker ps -a --format '{{.Names}}' | grep -qx "$legacy"; then
    docker stop "$legacy" 2>/dev/null || true
    docker update --restart=no "$legacy" 2>/dev/null || true
    echo "   Stopped $legacy (restart policy disabled)"
  fi
done

echo "📦 Starting / updating infrastructure containers (Redis + Mongo)..."
echo "   Database: Supabase cloud (not local Postgres)"
if docker ps -a --format '{{.Names}}' | grep -qx 'softwarehub-redis' \
  && docker ps -a --format '{{.Names}}' | grep -qx 'softwarehub-mongo'; then
  echo "   Reusing existing Redis/Mongo containers..."
  docker start softwarehub-redis softwarehub-mongo >/dev/null 2>&1 || true
else
  compose up -d
fi

if [ -f .env ]; then
  echo "✓ Using existing .env on VPS"
  if ! grep -qE '^SUPABASE_SERVICE_KEY=.+' .env && ! grep -qE '^SUPABASE_SECRET_KEY=.+' .env; then
    echo "❌ SUPABASE_SERVICE_KEY missing in .env — /api/user JWT verify will fail on production"
    exit 1
  fi
else
  echo "⚠️  No .env found — copy .env.vps.example to .env and configure Supabase keys"
fi

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

echo "🔄 Reloading PM2 (ecosystem.config.cjs)..."
pm2 delete email-service chat-service notification-service 2>/dev/null || true
pm2 delete software-hub-server 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

sleep 3
if ss -tlnp 2>/dev/null | grep -q ':5000.*docker'; then
  echo "❌ Port 5000 is still owned by Docker — nginx will serve stale code"
  ss -tlnp | grep ':5000' || true
  exit 1
fi
if ! ss -tlnp 2>/dev/null | grep -q ':5000'; then
  echo "❌ Nothing is listening on port 5000 after PM2 start"
  pm2 logs software-hub-server --lines 20 --nostream || true
  exit 1
fi

echo "📊 PM2 status:"
pm2 status || true

echo "=================================="
echo "✅ Deploy finished"
echo "=================================="
