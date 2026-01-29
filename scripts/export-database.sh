#!/bin/bash

# Script to export PostgreSQL database dump
# This script will:
# 1. Clean old data in /database folder
# 2. Export full database dump to /database folder

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATABASE_DIR="$PROJECT_ROOT/database"

echo -e "${GREEN}=== Database Export Script ===${NC}"
echo "Project Root: $PROJECT_ROOT"
echo "Database Directory: $DATABASE_DIR"
echo ""

# Load environment variables (prioritize .env over .env.production)
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${GREEN}Loading .env...${NC}"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
elif [ -f "$PROJECT_ROOT/.env.production" ]; then
    echo -e "${GREEN}Loading .env.production...${NC}"
    set -a
    source "$PROJECT_ROOT/.env.production"
    set +a
else
    echo -e "${RED}Error: No .env file found!${NC}"
    exit 1
fi

# Detect if PostgreSQL is running in Docker
DOCKER_CONTAINER=""
USE_DOCKER=false

if command -v docker &> /dev/null; then
    # Try different container name patterns
    DOCKER_CONTAINER=$(docker ps --filter "name=software-hub-db" --format "{{.Names}}" 2>/dev/null | head -1)
    if [ -z "$DOCKER_CONTAINER" ]; then
        DOCKER_CONTAINER=$(docker ps --filter "name=softwarehub-postgres" --format "{{.Names}}" 2>/dev/null | head -1)
    fi
    if [ -z "$DOCKER_CONTAINER" ]; then
        DOCKER_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" 2>/dev/null | head -1)
    fi
    
    if [ -n "$DOCKER_CONTAINER" ]; then
        echo -e "${GREEN}✓ Detected PostgreSQL running in Docker container: $DOCKER_CONTAINER${NC}"
        USE_DOCKER=true
    fi
fi

# Set default values if not set
DB_USER=${POSTGRES_USER:-software_hub_user}
DB_NAME=${POSTGRES_DB:-software_hub}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Database password not set!${NC}"
    exit 1
fi

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Step 1: Clean old data in /database folder
echo -e "${YELLOW}Step 1: Cleaning old data in /database folder...${NC}"

# Create backup of important files before cleaning
TEMP_BACKUP="$PROJECT_ROOT/.temp_db_backup"
mkdir -p "$TEMP_BACKUP"

# Backup schema and important files
if [ -f "$DATABASE_DIR/schema.prisma" ]; then
    cp "$DATABASE_DIR/schema.prisma" "$TEMP_BACKUP/"
fi
if [ -f "$DATABASE_DIR/prisma.ts" ]; then
    cp "$DATABASE_DIR/prisma.ts" "$TEMP_BACKUP/"
fi
if [ -d "$DATABASE_DIR/migrations" ]; then
    cp -r "$DATABASE_DIR/migrations" "$TEMP_BACKUP/"
fi
if [ -d "$DATABASE_DIR/init" ]; then
    cp -r "$DATABASE_DIR/init" "$TEMP_BACKUP/"
fi

# Clean database directory (except backups folder structure)
echo "Removing old files..."
find "$DATABASE_DIR" -mindepth 1 -maxdepth 1 ! -name 'backups' -exec rm -rf {} +

# Restore important files
if [ -f "$TEMP_BACKUP/schema.prisma" ]; then
    cp "$TEMP_BACKUP/schema.prisma" "$DATABASE_DIR/"
fi
if [ -f "$TEMP_BACKUP/prisma.ts" ]; then
    cp "$TEMP_BACKUP/prisma.ts" "$DATABASE_DIR/"
fi
if [ -d "$TEMP_BACKUP/migrations" ]; then
    cp -r "$TEMP_BACKUP/migrations" "$DATABASE_DIR/"
fi
if [ -d "$TEMP_BACKUP/init" ]; then
    cp -r "$TEMP_BACKUP/init" "$DATABASE_DIR/"
fi

# Clean temp backup
rm -rf "$TEMP_BACKUP"

echo -e "${GREEN}✓ Old data cleaned${NC}"
echo ""

# Step 2: Create necessary directories
echo -e "${YELLOW}Step 2: Creating directory structure...${NC}"
mkdir -p "$DATABASE_DIR/dumps"
mkdir -p "$DATABASE_DIR/backups"
mkdir -p "$DATABASE_DIR/scripts"
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 3: Export database dump
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$DATABASE_DIR/dumps/software_hub_dump_$TIMESTAMP.sql"
DUMP_CUSTOM="$DATABASE_DIR/dumps/software_hub_dump_$TIMESTAMP.dump"
DUMP_LATEST="$DATABASE_DIR/dumps/latest.sql"

echo -e "${YELLOW}Step 3: Exporting database dump...${NC}"
echo "Dump file: $DUMP_FILE"
echo ""

# Check if PostgreSQL is running
if [ "$USE_DOCKER" = true ]; then
    echo "Using Docker container: $DOCKER_CONTAINER"
    # Test connection via Docker
    if ! docker exec "$DOCKER_CONTAINER" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
        echo -e "${RED}Error: PostgreSQL in Docker container is not ready!${NC}"
        exit 1
    fi
else
    echo "Using local PostgreSQL"
    # Test connection to local PostgreSQL
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        echo -e "${RED}Error: PostgreSQL is not running or not accessible!${NC}"
        echo "Please ensure PostgreSQL is running and accessible."
        exit 1
    fi
fi

# Export database dump (SQL format)
echo "Exporting SQL dump..."

if [ "$USE_DOCKER" = true ]; then
    # Export from Docker container
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --encoding=UTF8 \
        --verbose \
        > "$DUMP_FILE" 2>&1
else
    # Export from local PostgreSQL
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --encoding=UTF8 \
        --verbose \
        > "$DUMP_FILE" 2>&1
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SQL dump exported successfully${NC}"
    
    # Create symlink to latest dump
    ln -sf "$(basename "$DUMP_FILE")" "$DUMP_LATEST"
    echo -e "${GREEN}✓ Latest dump symlink created${NC}"
else
    echo -e "${RED}✗ Failed to export SQL dump${NC}"
    exit 1
fi

# Export database dump (Custom format - compressed)
echo ""
echo "Exporting custom format dump (compressed)..."

if [ "$USE_DOCKER" = true ]; then
    # Export from Docker container to stdout, then save to file
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --verbose \
        > "$DUMP_CUSTOM" 2>&1
else
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$DUMP_CUSTOM" 2>&1
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Custom format dump exported successfully${NC}"
else
    echo -e "${YELLOW}⚠ Custom format dump failed (optional)${NC}"
fi

# Export schema only
SCHEMA_FILE="$DATABASE_DIR/dumps/schema_$TIMESTAMP.sql"
echo ""
echo "Exporting schema only..."

if [ "$USE_DOCKER" = true ]; then
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --schema-only \
        --clean \
        --if-exists \
        --create \
        > "$SCHEMA_FILE" 2>&1
else
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --schema-only \
        --clean \
        --if-exists \
        --create \
        > "$SCHEMA_FILE" 2>&1
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema dump exported successfully${NC}"
else
    echo -e "${YELLOW}⚠ Schema dump failed (optional)${NC}"
fi

# Export data only
DATA_FILE="$DATABASE_DIR/dumps/data_$TIMESTAMP.sql"
echo ""
echo "Exporting data only..."

if [ "$USE_DOCKER" = true ]; then
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --data-only \
        --column-inserts \
        > "$DATA_FILE" 2>&1
else
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --data-only \
        --column-inserts \
        > "$DATA_FILE" 2>&1
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data dump exported successfully${NC}"
else
    echo -e "${YELLOW}⚠ Data dump failed (optional)${NC}"
fi

# Step 4: Create README
echo ""
echo -e "${YELLOW}Step 4: Creating README...${NC}"
cat > "$DATABASE_DIR/README.md" << EOF
# Database Dumps

This directory contains PostgreSQL database dumps for the Software Hub application.

## Directory Structure

\`\`\`
database/
├── dumps/              # Database dump files
│   ├── latest.sql     # Symlink to latest full dump
│   ├── software_hub_dump_YYYYMMDD_HHMMSS.sql    # Full database dump (SQL)
│   ├── software_hub_dump_YYYYMMDD_HHMMSS.dump   # Full database dump (Custom format, compressed)
│   ├── schema_YYYYMMDD_HHMMSS.sql               # Schema only
│   └── data_YYYYMMDD_HHMMSS.sql                 # Data only
├── backups/           # Backup files
├── migrations/        # Database migrations
├── init/             # Initialization scripts
└── scripts/          # Database scripts
\`\`\`

## Latest Export

- **Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **Database**: $DB_NAME
- **Files**:
  - Full dump (SQL): \`$(basename "$DUMP_FILE")\`
  - Full dump (Custom): \`$(basename "$DUMP_CUSTOM")\`
  - Schema only: \`$(basename "$SCHEMA_FILE")\`
  - Data only: \`$(basename "$DATA_FILE")\`

## How to Restore

### Restore from SQL dump:
\`\`\`bash
psql -h localhost -U $DB_USER -d postgres < dumps/latest.sql
\`\`\`

### Restore from custom format dump:
\`\`\`bash
pg_restore -h localhost -U $DB_USER -d $DB_NAME -c dumps/software_hub_dump_*.dump
\`\`\`

### Restore schema only:
\`\`\`bash
psql -h localhost -U $DB_USER -d $DB_NAME < dumps/schema_*.sql
\`\`\`

### Restore data only:
\`\`\`bash
psql -h localhost -U $DB_USER -d $DB_NAME < dumps/data_*.sql
\`\`\`

## Notes

- The \`latest.sql\` symlink always points to the most recent full dump
- Custom format dumps are compressed and can be restored with pg_restore
- Schema dumps contain only table structures, no data
- Data dumps contain only INSERT statements, no schema

## Automated Export

To export database regularly, run:
\`\`\`bash
./scripts/export-database.sh
\`\`\`

Or set up a cron job:
\`\`\`bash
# Export database every day at 2 AM
0 2 * * * cd /path/to/software_hub && ./scripts/export-database.sh >> logs/db-export.log 2>&1
\`\`\`
EOF

echo -e "${GREEN}✓ README created${NC}"

# Step 5: Display summary
echo ""
echo -e "${GREEN}=== Export Complete ===${NC}"
echo ""
echo "Summary:"
echo "  Database: $DB_NAME"
echo "  Timestamp: $TIMESTAMP"
echo ""
echo "Files created:"
ls -lh "$DATABASE_DIR/dumps/" | grep "$TIMESTAMP" | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo -e "${GREEN}✓ All dumps exported successfully!${NC}"
echo ""
echo "To restore the database, use:"
echo "  psql -h localhost -U $DB_USER -d postgres < $DUMP_FILE"
echo ""
