#!/bin/bash

# SoftwareHub Services Stop Script
# This script stops all manually started services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                print_warning "Force killing $service_name..."
                kill -9 "$pid"
            fi
            
            rm -f "$pid_file"
            print_success "$service_name stopped"
        else
            print_warning "$service_name was not running"
            rm -f "$pid_file"
        fi
    else
        print_warning "No PID file found for $service_name"
    fi
}

# Function to stop services by port
stop_by_port() {
    local service_name=$1
    local port=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        print_status "Stopping $service_name on port $port (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        local check_pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$check_pid" ]; then
            print_warning "Force killing $service_name on port $port..."
            kill -9 "$check_pid" 2>/dev/null || true
        fi
        
        print_success "$service_name stopped"
    else
        print_warning "$service_name was not running on port $port"
    fi
}

main() {
    print_status "Stopping SoftwareHub Services..."
    
    # Stop main application
    stop_service "main-application" "main-app.pid"
    stop_by_port "main-application" 5000
    
    # Stop worker service
    stop_service "worker-service" "services/worker-service/worker-service.pid"
    
    # Stop microservices
    stop_service "notification-service" "services/notification-service/notification-service.pid"
    stop_by_port "notification-service" 3003
    
    stop_service "chat-service" "services/chat-service/chat-service.pid"
    stop_by_port "chat-service" 3002
    
    stop_service "email-service" "services/email-service/email-service.pid"
    stop_by_port "email-service" 3001
    
    # Clean up any remaining Node.js processes related to our services
    print_status "Cleaning up any remaining processes..."
    pkill -f "services/email-service" 2>/dev/null || true
    pkill -f "services/chat-service" 2>/dev/null || true
    pkill -f "services/notification-service" 2>/dev/null || true
    pkill -f "services/worker-service" 2>/dev/null || true
    
    print_success "🛑 All services stopped successfully!"
    
    # Note about databases
    echo ""
    print_status "Note: Docker databases are still running. To stop them:"
    echo "docker-compose stop postgres redis mongo"
    echo "or to stop and remove:"
    echo "docker-compose down"
}

# Run main function
main "$@"