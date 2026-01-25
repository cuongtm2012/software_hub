#!/bin/bash
set -e

echo "Starting data import from dumps..."

# Database connection parameters
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-softwarehub}
DB_USER=${DB_USER:-postgres}
DUMP_DIR=${DUMP_DIR:-/dumps}

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
        echo "Database is unavailable - sleeping"
        sleep 3
    done
    echo "Database is ready!"
}

# Function to import SQL files
import_sql_files() {
    local pattern=$1
    local description=$2
    
    echo "Looking for $description files with pattern: $pattern"
    
    for file in $DUMP_DIR/$pattern; do
        if [ -f "$file" ]; then
            echo "Importing $description: $(basename "$file")"
            
            # Check if file is compressed
            if [[ "$file" == *.gz ]]; then
                echo "Decompressing and importing: $file"
                gunzip -c "$file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
            else
                echo "Importing: $file"
                psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$file"
            fi
            
            echo "Successfully imported: $(basename "$file")"
        fi
    done
}

# Main execution
echo "=== Software Hub Database Import Script ==="
echo "Target Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Dump Directory: $DUMP_DIR"

# Wait for database to be ready
wait_for_db

# Import files in order of priority
echo "=== Starting import process ==="

# 1. Import full database dumps first (highest priority)
import_sql_files "full_database*.sql*" "full database dumps"

# 2. Import schema files
import_sql_files "schema*.sql*" "schema files"

# 3. Import data files
import_sql_files "data*.sql*" "data files"

# 4. Import any other SQL files
import_sql_files "*.sql*" "other SQL files"

echo "=== Import process completed ==="

# Run post-import tasks
if [ -f "$DUMP_DIR/post-import.sql" ]; then
    echo "Running post-import tasks..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$DUMP_DIR/post-import.sql"
    echo "Post-import tasks completed"
fi

echo "All database imports completed successfully!"