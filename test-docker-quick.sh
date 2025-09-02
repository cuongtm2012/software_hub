#!/bin/bash

# Quick Docker Test Script
# This script tests if Docker setup is working properly

echo "🧪 Testing Docker Setup..."
echo "================================"

# Check if ports are free
echo "1. Checking port availability..."
for port in 3001 3002 3003 5000 5432 6379 27017; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "   ❌ Port $port is in use"
    else
        echo "   ✅ Port $port is available"
    fi
done

echo ""
echo "2. Testing Docker commands..."

# Test docker-compose syntax
if docker-compose config > /dev/null 2>&1; then
    echo "   ✅ Docker Compose configuration is valid"
else
    echo "   ❌ Docker Compose configuration has errors"
    exit 1
fi

echo ""
echo "3. Starting basic database services first..."

# Start only databases first to avoid dependency issues
docker-compose up -d postgres redis mongo

echo ""
echo "4. Waiting for databases to be ready..."
sleep 30

echo ""
echo "5. Checking database health..."
docker-compose ps

echo ""
echo "✅ Quick test completed!"
echo "You can now run: ./docker-manage.sh dev"