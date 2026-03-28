#!/bin/bash
# Export courses from local DB
# Run on local machine with DB running
set -e
cd "$(dirname "$0")/.."
OUT="scripts/seed-courses.sql"
DB="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/software_hub}"

pg_dump "$DB" --data-only --table=public.courses -f "$OUT" 2>/dev/null && echo "✅ Exported to $OUT" || echo "Run: pg_dump ... --table=public.courses"
