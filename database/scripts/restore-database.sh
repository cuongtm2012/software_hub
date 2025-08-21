#!/bin/bash
set -e

# Database restore script for Software Hub
# This script restores database from backup files

echo "=== Software Hub Database Restore Script ==="

# Configuration
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-softwarehub}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/backups}

# Function to list available backups
list_backups() {
    echo "Available backup files:"
    ls -lh "$BACKUP_DIR"/softwarehub_backup_*.sql.gz 2>/dev/null | nl || {
        echo "No backup files found in $BACKUP_DIR"
        exit 1
    }
}

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
        echo "Database is unavailable - sleeping"
        sleep 3
    done
    echo "Database is ready!"
}

# Function to restore from backup
restore_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        echo "Error: Backup file not found: $backup_file"
        exit 1
    fi
    
    echo "Restoring from backup: $(basename "$backup_file")"
    echo "Target database: $DB_HOST:$DB_PORT/$DB_NAME"
    
    # Create a confirmation prompt
    read -p "This will overwrite the existing database. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Restore cancelled."
        exit 0
    fi
    
    # Drop existing connections
    echo "Terminating existing connections..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
    " 2>/dev/null || true
    
    # Restore the database
    echo "Starting restore process..."
    if [[ "$backup_file" == *.gz ]]; then
        echo "Decompressing and restoring..."
        gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
    else
        echo "Restoring uncompressed backup..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$backup_file"
    fi
    
    echo "Database restored successfully!"
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file> | list"
    echo "       $0 list                    - List available backups"
    echo "       $0 <backup_file>          - Restore from specific backup file"
    echo "       $0 latest                 - Restore from latest backup"
    exit 1
fi

wait_for_db

case "$1" in
    "list")
        list_backups
        ;;
    "latest")
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/softwarehub_backup_*.sql.gz 2>/dev/null | head -1)
        if [ -z "$LATEST_BACKUP" ]; then
            echo "No backup files found"
            exit 1
        fi
        restore_backup "$LATEST_BACKUP"
        ;;
    *)
        # If it's a filename, try to restore it
        if [[ "$1" == /* ]]; then
            # Absolute path
            restore_backup "$1"
        else
            # Relative path, assume it's in backup directory
            restore_backup "$BACKUP_DIR/$1"
        fi
        ;;
esac