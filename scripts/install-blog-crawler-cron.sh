#!/usr/bin/env bash
# Idempotent crontab entry: blog crawler daily 08:00 Asia/Ho_Chi_Minh.
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
CRON_MARKER="software-hub-blog-crawler"
CRON_SCHEDULE="0 8 * * *"
CRON_TZ="Asia/Ho_Chi_Minh"
RUNNER="$APP_ROOT/run-blog-crawl-cron.sh"

if [ ! -f "$APP_ROOT/dist/scripts/run-blog-crawler.js" ]; then
  echo "⚠️  Skip cron install: dist/scripts/run-blog-crawler.js not found"
  exit 0
fi

chmod +x "$RUNNER"

CRON_LINE="$CRON_SCHEDULE TZ=$CRON_TZ $RUNNER # $CRON_MARKER"

EXISTING="$(crontab -l 2>/dev/null || true)"
if echo "$EXISTING" | grep -q "$CRON_MARKER"; then
  FILTERED="$(echo "$EXISTING" | grep -v "$CRON_MARKER" || true)"
  printf '%s\n%s\n' "$FILTERED" "$CRON_LINE" | sed '/^$/d' | crontab -
  echo "✓ Updated crontab: $CRON_LINE"
else
  { echo "$EXISTING"; echo "$CRON_LINE"; } | sed '/^$/d' | crontab -
  echo "✓ Installed crontab: $CRON_LINE"
fi
