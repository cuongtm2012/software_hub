#!/bin/bash
# Import database/dumps/data_20260129_222356.sql to production
# Run from LOCAL: ./scripts/import-dump-to-production.sh
# Requires: SSH to root@95.111.253.111

set -e
cd "$(dirname "$0")/.."
DUMP="database/dumps/data_20260129_222356.sql"
SERVER="root@95.111.253.111"
REMOTE="~/Cuongtm2012/software_hub"

echo "1. Uploading dump to production..."
scp -o StrictHostKeyChecking=no "$DUMP" "$SERVER:$REMOTE/"

echo "2. Importing into software_hub database..."
echo "   (Nếu có lỗi duplicate key, production đã có data - cần truncate tables trước)"
ssh "$SERVER" "cd $REMOTE && docker cp data_20260129_222356.sql software_hub_db:/tmp/ && docker exec -i software_hub_db psql -U postgres -d software_hub -v ON_ERROR_STOP=0 -f /tmp/data_20260129_222356.sql"

echo "3. Cleanup..."
ssh "$SERVER" "docker exec software_hub_db rm /tmp/data_20260129_222356.sql"

echo "Done. Restart app: ssh $SERVER 'cd $REMOTE && docker-compose -f docker-compose.prod.yml restart app'"
