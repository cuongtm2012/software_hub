#!/bin/bash

# Database Migration Script
# Migrates data from host PostgreSQL to Docker PostgreSQL

set -e

echo "=================================="
echo "Database Migration to Docker"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
HOST_DB_NAME="${1:-software_hub}"
HOST_DB_USER="${2:-software_hub_user}"
BACKUP_DIR="/tmp/db-migration"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"

# Create backup directory
mkdir -p $BACKUP_DIR

print_info "Starting database migration..."
echo ""

# Step 1: Backup from host PostgreSQL
print_info "Step 1: Backing up database from host PostgreSQL..."
read -sp "Enter PostgreSQL password for $HOST_DB_USER: " DB_PASSWORD
echo ""

PGPASSWORD=$DB_PASSWORD pg_dump -U $HOST_DB_USER -h localhost -d $HOST_DB_NAME -F p -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    print_success "Database backed up to: $BACKUP_FILE"
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    print_info "Backup size: $BACKUP_SIZE"
else
    print_error "Failed to backup database"
    exit 1
fi
echo ""

# Step 2: Stop existing Docker containers
print_info "Step 2: Stopping existing Docker containers..."
docker-compose -f docker-compose.production.yml down || true
print_success "Containers stopped"
echo ""

# Step 3: Remove old volume (optional - be careful!)
read -p "Do you want to remove the old database volume? This will DELETE all data in Docker! (yes/no): " REMOVE_VOLUME
if [ "$REMOVE_VOLUME" = "yes" ]; then
    print_warning "Removing old database volume..."
    docker volume rm software-hub-postgres-data || true
    print_success "Volume removed"
else
    print_info "Keeping existing volume"
fi
echo ""

# Step 4: Start only database container
print_info "Step 4: Starting PostgreSQL container..."
docker-compose -f docker-compose.production.yml up -d db

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Check if database is healthy
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f docker-compose.production.yml exec -T db pg_isready -U $HOST_DB_USER -d $HOST_DB_NAME > /dev/null 2>&1; then
        print_success "Database is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Database failed to start"
    exit 1
fi
echo ""

# Step 5: Restore backup to Docker PostgreSQL
print_info "Step 5: Restoring backup to Docker PostgreSQL..."
cat $BACKUP_FILE | docker-compose -f docker-compose.production.yml exec -T db psql -U $HOST_DB_USER -d $HOST_DB_NAME

if [ $? -eq 0 ]; then
    print_success "Database restored successfully!"
else
    print_error "Failed to restore database"
    exit 1
fi
echo ""

# Step 6: Verify migration
print_info "Step 6: Verifying migration..."
TABLE_COUNT=$(docker-compose -f docker-compose.production.yml exec -T db psql -U $HOST_DB_USER -d $HOST_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
print_info "Number of tables in Docker database: $(echo $TABLE_COUNT | tr -d ' ')"
echo ""

# Step 7: Start all containers
print_info "Step 7: Starting all containers..."
docker-compose -f docker-compose.production.yml up -d

print_success "All containers started"
echo ""

# Summary
echo "=================================="
echo "Migration Complete!"
echo "=================================="
echo ""
print_success "Database has been migrated to Docker"
print_info "Backup file saved at: $BACKUP_FILE"
print_warning "Keep this backup file safe!"
echo ""
print_info "Next steps:"
echo "  1. Verify application is working: curl http://localhost:3000"
echo "  2. Check container status: docker-compose -f docker-compose.production.yml ps"
echo "  3. View logs: docker-compose -f docker-compose.production.yml logs -f"
echo ""
print_info "To rollback, restore the backup file to host PostgreSQL"
echo ""
