#!/bin/bash

# SoftwareHub Services Startup Script
# This script starts all services manually (databases should already be running in Docker)

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

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_success "$service_name is ready on port $port"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

# Function to check database connections
check_databases() {
    print_status "Checking database connections..."
    
    # Check PostgreSQL
    if ! docker exec softwarehub-postgres pg_isready -U postgres -d softwarehub >/dev/null 2>&1; then
        print_error "PostgreSQL is not ready. Please start Docker databases first:"
        echo "docker-compose up -d postgres redis mongo"
        exit 1
    fi
    
    # Check Redis
    if ! docker exec softwarehub-redis redis-cli ping >/dev/null 2>&1; then
        print_error "Redis is not ready. Please start Docker databases first:"
        echo "docker-compose up -d postgres redis mongo"
        exit 1
    fi
    
    # Check MongoDB
    if ! docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
        print_error "MongoDB is not ready. Please start Docker databases first:"
        echo "docker-compose up -d postgres redis mongo"
        exit 1
    fi
    
    print_success "All databases are ready"
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local log_file=$4
    
    print_status "Starting $service_name..."
    
    if check_port $port; then
        print_warning "$service_name is already running on port $port"
        return 0
    fi
    
    cd "$service_path"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Start the service in background
    nohup npm start > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "${service_name}.pid"
    
    print_status "$service_name started with PID $pid, logs: $log_file"
    
    # Wait for service to be ready
    if wait_for_service "$service_name" "$port"; then
        print_success "$service_name is running successfully"
    else
        print_error "Failed to start $service_name"
        return 1
    fi
}

# Main execution
main() {
    print_status "Starting SoftwareHub Services..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "services" ]; then
        print_error "Please run this script from the SoftwareHub root directory"
        exit 1
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Check database connections
    check_databases
    
    # Start services in dependency order
    print_status "Starting microservices..."
    
    # 1. Email Service (independent)
    start_service "email-service" "services/email-service" 3001 "../../logs/email-service.log"
    
    # 2. Chat Service (independent)
    start_service "chat-service" "services/chat-service" 3002 "../../logs/chat-service.log"
    
    # 3. Notification Service (independent)
    start_service "notification-service" "services/notification-service" 3003 "../../logs/notification-service.log"
    
    # 4. Worker Service (depends on email and notification services)
    cd services/worker-service
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for worker-service..."
        npm install
    fi
    nohup npm start > "../../logs/worker-service.log" 2>&1 &
    echo $! > "worker-service.pid"
    print_success "Worker service started"
    cd ../..
    
    # 5. Main Application (depends on all microservices)
    print_status "Starting main SoftwareHub application..."
    sleep 5  # Give microservices time to fully initialize
    
    if check_port 5000; then
        print_warning "Main application is already running on port 5000"
    else
        # Install main app dependencies if needed
        if [ ! -d "node_modules" ]; then
            print_status "Installing dependencies for main application..."
            npm install
        fi
        
        nohup npm run dev > "logs/main-app.log" 2>&1 &
        echo $! > "main-app.pid"
        
        if wait_for_service "main-application" 5000; then
            print_success "Main application is running successfully"
        else
            print_error "Failed to start main application"
            exit 1
        fi
    fi
    
    print_success "🚀 All services started successfully!"
    echo ""
    echo "Service Status:"
    echo "📧 Email Service:       http://localhost:3001"
    echo "💬 Chat Service:        http://localhost:3002"
    echo "🔔 Notification Service: http://localhost:3003"
    echo "⚙️  Worker Service:      Running in background"
    echo "🌐 Main Application:    http://localhost:5000"
    echo ""
    echo "Logs are available in the 'logs/' directory"
    echo "To stop services, run: ./stop-services.sh"
}

# Run main function
main "$@"