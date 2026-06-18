#!/usr/bin/env bash
# Daily blog crawler — invoked by crontab on VPS.
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_ROOT"

LOG_FILE="${BLOG_CRAWLER_LOG:-/var/log/software-hub-blog-crawler.log}"
SOURCES="${BLOG_CRAWLER_SOURCES:-devto,freecodecamp}"

mkdir -p "$(dirname "$LOG_FILE")"

{
  echo "=============================================="
  echo "[$(date -Iseconds)] blog crawl start (sources=$SOURCES)"
  NODE_ENV=production node dist/scripts/run-blog-crawler.js --sources="$SOURCES"
  echo "[$(date -Iseconds)] blog crawl done (exit $?)"
} >>"$LOG_FILE" 2>&1
