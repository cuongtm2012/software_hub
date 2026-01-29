#!/bin/bash

# Script to import PostgreSQL database dump into Docker container
# This script will:
# 1. Check if Docker container is running
# 2. Drop existing database (if exists)
# 3. Import database dump from /database/dumps folder

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATABASE_DIR="$PROJECT_ROOT/database"

echo -e "${GREEN}=== Database Import Script ===${NC}"
echo "Project Root: $PROJECT_ROOT"
echo "Database Directory: $DATABASE_DIR"
echo ""

# Find Docker executable
DOCKER_CMD=""
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
elif [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"
else
    echo -e "${RED}Error: Docker not found!${NC}"
    echo "Please install Docker Desktop or ensure Docker is in your PATH."
    exit 1
fi

echo -e "${GREEN}✓ Docker found: $DOCKER_CMD${NC}"
echo ""

# Check if Docker container is running
DOCKER_CONTAINER="softwarehub-postgres"
if ! $DOCKER_CMD ps --filter "name=$DOCKER_CONTAINER" --format "{{.Names}}" | grep -q "$DOCKER_CONTAINER"; then
    echo -e "${RED}Error: PostgreSQL container '$DOCKER_CONTAINER' is not running!${NC}"
    echo ""
    echo "Please start the container first:"
    echo "  docker-compose up -d postgres"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
echo ""

# Database configuration
DB_USER="postgres"
DB_NAME="softwarehub"
DB_PASSWORD="password"

# Find the latest dump file
DUMP_FILE=""
if [ -L "$DATABASE_DIR/dumps/latest.sql" ]; then
    # Follow symlink
    LATEST_LINK=$(readlink "$DATABASE_DIR/dumps/latest.sql")
    DUMP_FILE="$DATABASE_DIR/dumps/$LATEST_LINK"
    echo -e "${BLUE}Using latest dump (symlink): $(basename "$DUMP_FILE")${NC}"
elif [ -f "$DATABASE_DIR/dumps/software_hub_dump_20260129_222356.sql" ]; then
    DUMP_FILE="$DATABASE_DIR/dumps/software_hub_dump_20260129_222356.sql"
    echo -e "${BLUE}Using dump: $(basename "$DUMP_FILE")${NC}"
else
    # Find the most recent dump file
    DUMP_FILE=$(ls -t "$DATABASE_DIR/dumps"/software_hub_dump_*.sql 2>/dev/null | head -1)
    if [ -z "$DUMP_FILE" ]; then
        echo -e "${RED}Error: No dump file found in $DATABASE_DIR/dumps/${NC}"
        echo ""
        echo "Please ensure you have a dump file in the dumps directory."
        echo "You can create one by running:"
        echo "  ./scripts/export-database.sh"
        echo ""
        exit 1
    fi
    echo -e "${BLUE}Using most recent dump: $(basename "$DUMP_FILE")${NC}"
fi

if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}Error: Dump file not found: $DUMP_FILE${NC}"
    exit 1
fi

echo "Dump file: $DUMP_FILE"
echo "File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

# Ask for confirmation
echo -e "${YELLOW}WARNING: This will DROP the existing database and import the dump!${NC}"
echo -e "${YELLOW}All current data in the database will be LOST!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Import cancelled."
    exit 0
fi

# Step 1: Copy dump file to container
echo -e "${YELLOW}Step 1: Copying dump file to container...${NC}"
$DOCKER_CMD cp "$DUMP_FILE" "$DOCKER_CONTAINER:/tmp/dump.sql"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dump file copied to container${NC}"
else
    echo -e "${RED}✗ Failed to copy dump file${NC}"
    exit 1
fi
echo ""

# Step 2: Drop existing database and recreate
echo -e "${YELLOW}Step 2: Preparing database...${NC}"
echo "Dropping existing database (if exists)..."

$DOCKER_CMD exec "$DOCKER_CONTAINER" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Existing database dropped${NC}"
else
    echo -e "${YELLOW}⚠ Database drop failed (may not exist)${NC}"
fi

echo "Creating new database..."
$DOCKER_CMD exec "$DOCKER_CONTAINER" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${YELLOW}⚠ Database creation failed (may already exist)${NC}"
fi
echo ""

# Step 3: Import dump
echo -e "${YELLOW}Step 3: Importing database dump...${NC}"
echo "This may take a few minutes depending on the dump size..."
echo ""

$DOCKER_CMD exec "$DOCKER_CONTAINER" psql -U "$DB_USER" -d postgres -f /tmp/dump.sql 2>&1 | grep -E "(CREATE|ALTER|COPY|INSERT|ERROR|FATAL)" || true

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Database dump imported successfully${NC}"
else
    echo ""
    echo -e "${RED}✗ Failed to import database dump${NC}"
    echo ""
    echo "You can try importing manually:"
    echo "  docker exec -i $DOCKER_CONTAINER psql -U $DB_USER -d postgres < $DUMP_FILE"
    exit 1
fi
echo ""

# Step 4: Clean up
echo -e "${YELLOW}Step 4: Cleaning up...${NC}"
$DOCKER_CMD exec "$DOCKER_CONTAINER" rm /tmp/dump.sql
echo -e "${GREEN}✓ Temporary files cleaned${NC}"
echo ""

# Step 5: Verify import
echo -e "${YELLOW}Step 5: Verifying import...${NC}"
TABLE_COUNT=$($DOCKER_CMD exec "$DOCKER_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database verified: $TABLE_COUNT tables found${NC}"
    echo ""
    echo "Tables in database:"
    $DOCKER_CMD exec "$DOCKER_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null || true
else
    echo -e "${YELLOW}⚠ Warning: No tables found in database${NC}"
fi
echo ""

# Display summary
echo -e "${GREEN}=== Import Complete ===${NC}"
echo ""
echo "Summary:"
echo "  Database: $DB_NAME"
echo "  Container: $DOCKER_CONTAINER"
echo "  Tables: $TABLE_COUNT"
echo ""
echo -e "${GREEN}✓ Database imported successfully!${NC}"
echo ""
echo "You can now connect to the database:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
