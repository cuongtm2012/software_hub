#!/usr/bin/env bash
# Push GitHub Actions secrets from local .env (run manually — never commit secrets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh &>/dev/null; then
  echo "❌ gh CLI required" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "❌ Missing .env" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
if [[ -f client/.env ]]; then
  # shellcheck disable=SC1091
  source client/.env
fi
set +a

set_secret() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "⏭  Skip empty: $name"
    return
  fi
  printf '%s' "$value" | gh secret set "$name"
  echo "✓ $name"
}

echo "=== SSH secrets ==="
SSH_KEY_FILE="${SSH_KEY_FILE:-$HOME/.ssh/id_rsa}"
if [[ ! -f "$SSH_KEY_FILE" && -f "$HOME/.ssh/id_ed25519" ]]; then
  SSH_KEY_FILE="$HOME/.ssh/id_ed25519"
fi
if [[ -f "$SSH_KEY_FILE" ]]; then
  gh secret set SSH_KEY < "$SSH_KEY_FILE"
  echo "✓ SSH_KEY (from $SSH_KEY_FILE)"
else
  echo "⚠️  SSH_KEY_FILE not found: $SSH_KEY_FILE"
fi

set_secret SSH_HOST "${SSH_HOST:-95.111.253.111}"
set_secret SSH_USERNAME "${SSH_USERNAME:-root}"
set_secret SSH_PORT "${SSH_PORT:-22}"

echo "=== Build-time secrets (Vite) ==="
set_secret VITE_SUPABASE_URL "${VITE_SUPABASE_URL:-$SUPABASE_URL}"
set_secret VITE_SUPABASE_ANON_KEY "${VITE_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}"
set_secret VITE_SUPABASE_PUBLISHABLE_KEY "${VITE_SUPABASE_PUBLISHABLE_KEY:-$SUPABASE_PUBLISHABLE_KEY}"
set_secret VITE_GA_MEASUREMENT_ID "${VITE_GA_MEASUREMENT_ID:-}"
set_secret VITE_GEMINI_API_KEY "${VITE_GEMINI_API_KEY:-}"
set_secret SITE_URL "${SITE_URL:-https://swhubco.com}"

echo "=== VPS runtime .env (base64) ==="
VPS_ENV="$(bash scripts/build-vps-env.sh)"
printf '%s' "$VPS_ENV" | base64 | tr -d '\n' | gh secret set VPS_ENV_B64
echo "✓ VPS_ENV_B64"

echo "=== Done ==="
gh secret list
