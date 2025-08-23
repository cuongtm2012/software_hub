#!/bin/bash

# SoftwareHub Services Status Script
# This script checks the status of all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check service status
check_service() {
    local service_name=$1
    local port=$2
    local pid_file=$3
    
    printf "%-25s" "$service_name:"
    
    # Check if port is active
    if check_port $port; then
        local pid=$(lsof -ti:$port 2>/dev/null)
        echo -e "${GREEN}✓ Running${NC} (Port: $port, PID: $pid)"
        return 0
    else
        echo -e "${RED}✗ Not Running${NC} (Port: $port)"
        return 1
    fi
}

# Function to check database status
check_database() {
    local db_name=$1
    local container_name=$2
    local check_command=$3
    
    printf "%-25s" "$db_name:"
    
    if docker exec $container_name $check_command >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC} (Docker)"
    else
        echo -e "${RED}✗ Not Running${NC} (Docker)"
    fi
}

main() {
    echo "🔍 SoftwareHub Services Status Check"
    echo "======================================"
    echo ""
    
    echo "📊 Databases (Docker):"
    echo "----------------------"
    check_database "PostgreSQL" "softwarehub-postgres" "pg_isready -U postgres -d softwarehub"
    check_database "Redis" "softwarehub-redis" "redis-cli ping"
    check_database "MongoDB" "softwarehub-mongo" "mongosh --eval \"db.adminCommand('ping')\" --quiet"
    
    echo ""
    echo "🚀 Application Services:"
    echo "------------------------"
    check_service "Email Service" 3001 "services/email-service/email-service.pid"
    check_service "Chat Service" 3002 "services/chat-service/chat-service.pid"
    check_service "Notification Service" 3003 "services/notification-service/notification-service.pid"
    check_service "Main Application" 5000 "main-app.pid"
    
    echo ""
    echo "⚙️  Background Services:"
    echo "------------------------"
    
    # Check worker service (no port, check by PID file or process)
    printf "%-25s" "Worker Service:"
    if [ -f "services/worker-service/worker-service.pid" ]; then
        local worker_pid=$(cat "services/worker-service/worker-service.pid" 2>/dev/null)
        if kill -0 "$worker_pid" 2>/dev/null; then
            echo -e "${GREEN}✓ Running${NC} (PID: $worker_pid)"
        else
            echo -e "${RED}✗ Not Running${NC} (Stale PID file)"
        fi
    else
        # Check by process name
        local worker_proc=$(pgrep -f "services/worker-service" 2>/dev/null || true)
        if [ -n "$worker_proc" ]; then
            echo -e "${GREEN}✓ Running${NC} (PID: $worker_proc)"
        else
            echo -e "${RED}✗ Not Running${NC}"
        fi
    fi
    
    echo ""
    echo "📋 Quick Actions:"
    echo "-----------------"
    echo "Start services:  ./start-services.sh"
    echo "Stop services:   ./stop-services.sh"
    echo "View logs:       tail -f logs/*.log"
    echo ""
}

# Run main function
main "$@"