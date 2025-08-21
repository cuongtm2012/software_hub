#!/bin/bash
set -e

echo "Starting database initialization..."

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    local retries=0
    local max_retries=30
    
    until pg_isready -h localhost -p 5432 -U postgres -d postgres; do
        retries=$((retries + 1))
        if [ $retries -eq $max_retries ]; then
            echo "PostgreSQL failed to become ready after $max_retries attempts"
            exit 1
        fi
        echo "PostgreSQL is unavailable - sleeping (attempt $retries/$max_retries)"
        sleep 2
    done
    echo "PostgreSQL is ready!"
}

# Wait for PostgreSQL to be ready
wait_for_postgres

echo "Creating database if it doesn't exist..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE softwarehub' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'softwarehub')\gexec
EOSQL

# Switch to the softwarehub database for subsequent operations
export PGDATABASE=softwarehub

echo "Database initialization completed!"

# Import dump files if they exist
if [ "$(ls -A /dumps/*.sql 2>/dev/null)" ]; then
    echo "Found SQL dump files, importing..."
    for dump_file in /dumps/*.sql; do
        if [ -f "$dump_file" ]; then
            echo "Importing $dump_file..."
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "softwarehub" -f "$dump_file"
            echo "Successfully imported $dump_file"
        fi
    done
else
    echo "No SQL dump files found in /dumps directory"
    echo "Creating basic schema using Drizzle..."
    
    # Create basic tables that are commonly needed
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "softwarehub" <<-EOSQL
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create basic users table if it doesn't exist
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            name VARCHAR(255),
            avatar TEXT,
            role VARCHAR(50) DEFAULT 'user',
            is_verified BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create sessions table for authentication
        CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create basic indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
        
        -- Grant permissions
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
EOSQL
    
    echo "Basic schema created successfully"
fi

echo "Database setup completed successfully!"