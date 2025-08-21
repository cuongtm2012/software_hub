#!/bin/bash
set -e

echo "Starting database initialization with corrected data..."

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

echo "Dropping and recreating database for clean import..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Terminate any existing connections to the softwarehub database
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'softwarehub' AND pid <> pg_backend_pid();
    
    -- Drop the database if it exists
    DROP DATABASE IF EXISTS softwarehub;
    
    -- Create fresh database
    CREATE DATABASE softwarehub;
EOSQL

# Switch to the softwarehub database for subsequent operations
export PGDATABASE=softwarehub

echo "Database recreated successfully!"

# Import the corrected dump file
echo "Importing corrected dump_data.sql..."
if [ -f "/dumps/dump_data.sql" ]; then
    echo "Found corrected dump file, importing..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "softwarehub" -f "/dumps/dump_data.sql"
    echo "Successfully imported corrected dump_data.sql"
    
    # Fix ownership issues from the dump
    echo "Fixing table ownership..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "softwarehub" <<-EOSQL
        -- Change ownership of all tables, sequences, and types to postgres
        DO \$\$
        DECLARE
            r RECORD;
        BEGIN
            -- Change table ownership
            FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
            LOOP
                EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
            END LOOP;
            
            -- Change sequence ownership
            FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
            LOOP
                EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequencename) || ' OWNER TO postgres';
            END LOOP;
            
            -- Change type ownership
            FOR r IN SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e'
            LOOP
                EXECUTE 'ALTER TYPE public.' || quote_ident(r.typname) || ' OWNER TO postgres';
            END LOOP;
        END
        \$\$;
        
        -- Grant all privileges
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
        GRANT USAGE ON ALL TYPES IN SCHEMA public TO postgres;
EOSQL
    
    echo "Table ownership fixed successfully"
    
else
    echo "ERROR: dump_data.sql not found in /dumps directory!"
    echo "Creating basic schema as fallback..."
    
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

echo "Database setup completed successfully with corrected data!"