#!/bin/bash

# SoftwareHub Docker Management Script
# Enhanced with APISIX API Gateway (nginx removed)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE="docker-compose.dev.yml"
APISIX_PROJECT="softwarehub-apisix"

# Default gateway type - APISIX only now
GATEWAY_TYPE="apisix"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_gateway() {
    echo -e "${CYAN}[GATEWAY]${NC} $1"
}

show_help() {
    echo "SoftwareHub Docker Management Script"
    echo "Using APISIX API Gateway"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  dev                                 # Start in development mode"
    echo "  prod                                # Start in production mode"
    echo "  stop                                # Stop all containers"
    echo "  restart                             # Restart all containers"
    echo "  rebuild                             # Rebuild and restart all containers"
    echo "  rebuild-service <service>           # Rebuild specific service"
    echo "  logs                                # Show logs for all services"
    echo "  logs-service <service>              # Show logs for specific service"
    echo "  status                              # Show container status"
    echo "  setup-apisix                        # Configure APISIX routes"
    echo "  help                                # Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                              # Start development mode"
    echo "  $0 prod                             # Start production mode"
    echo "  $0 rebuild-service notification     # Rebuild notification service"
    echo "  $0 logs-service softwarehub-app     # Show main app logs"
    echo "  $0 setup-apisix                     # Configure APISIX routes"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

get_compose_files() {
    echo "-f $COMPOSE_FILE -p $APISIX_PROJECT"
}

get_dev_compose_files() {
    echo "-f $COMPOSE_FILE -p $APISIX_PROJECT"
}

start_dev() {
    print_header "Starting SoftwareHub in Development Mode"
    print_gateway "Using APISIX as API Gateway"
    print_status "This mode provides live code updates without rebuilding containers"
    
    local compose_args=$(get_dev_compose_files)
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose $compose_args up -d postgres redis mongo
    
    # Start etcd for APISIX
    print_status "Starting etcd..."
    docker-compose $compose_args up -d etcd
    sleep 5
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose $compose_args up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start main application
    print_status "Starting main application..."
    docker-compose $compose_args up -d softwarehub-app
    
    # Start APISIX gateway and dashboard
    print_status "Starting APISIX gateway and dashboard..."
    docker-compose $compose_args up -d apisix apisix-dashboard
    sleep 15
    
    # Wait for APISIX to be fully healthy
    print_status "Waiting for APISIX to be fully ready..."
    sleep 5
    
    print_status "Configuring APISIX routes..."
    if [ -f "./setup-apisix.sh" ]; then
        ./setup-apisix.sh || print_warning "APISIX route configuration failed. Run './setup-apisix.sh' manually."
    else
        print_warning "setup-apisix.sh not found. APISIX routes not configured."
    fi
    
    docker-compose $compose_args up -d postgres-backup
    
    print_status "Development environment started!"
    show_access_info
}

start_prod() {
    print_header "Starting SoftwareHub in Production Mode"
    print_gateway "Using APISIX as API Gateway"
    
    local compose_args=$(get_compose_files)
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose $compose_args up -d postgres redis mongo
    
    # Start etcd for APISIX
    print_status "Starting etcd..."
    docker-compose $compose_args up -d etcd
    sleep 5
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose $compose_args up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start main application
    print_status "Starting main application..."
    docker-compose $compose_args up -d softwarehub-app
    
    # Start APISIX gateway and dashboard
    print_status "Starting APISIX gateway and dashboard..."
    docker-compose $compose_args up -d apisix apisix-dashboard
    sleep 15
    
    # Wait for APISIX to be fully healthy
    print_status "Waiting for APISIX to be fully ready..."
    sleep 5
    
    print_status "Configuring APISIX routes..."
    if [ -f "./setup-apisix.sh" ]; then
        ./setup-apisix.sh || print_warning "APISIX route configuration failed. Run './setup-apisix.sh' manually."
    else
        print_warning "setup-apisix.sh not found. APISIX routes not configured."
    fi
    
    docker-compose $compose_args up -d postgres-backup
    
    print_status "Production environment started!"
    show_access_info
}

stop_containers() {
    print_header "Stopping SoftwareHub Containers"
    print_gateway "Stopping APISIX deployment"
    
    local compose_args=$(get_compose_files)
    print_status "Stopping all services..."
    docker-compose $compose_args down
    
    print_status "All containers stopped"
}

restart_containers() {
    print_header "Restarting SoftwareHub"
    stop_containers
    start_prod
}

rebuild_all() {
    print_header "Rebuilding All Services"
    print_gateway "Using APISIX deployment"
    
    local compose_args=$(get_compose_files)
    
    print_status "Stopping all containers..."
    docker-compose $compose_args down
    
    print_status "Rebuilding all services..."
    docker-compose $compose_args build --no-cache
    
    print_status "Starting services..."
    start_prod
}

rebuild_service() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        print_status "Available services: main, email, chat, notification, worker, gateway"
        exit 1
    fi
    
    local compose_args=$(get_compose_files)
    local service_name=""
    
    case $service in
        main)
            service_name="softwarehub-app"
            ;;
        email)
            service_name="email-service"
            ;;
        chat)
            service_name="chat-service"
            ;;
        notification)
            service_name="notification-service"
            ;;
        worker)
            service_name="worker-service"
            ;;
        gateway)
            service_name="apisix"
            ;;
        *)
            print_error "Unknown service: $service"
            print_status "Available services: main, email, chat, notification, worker, gateway"
            exit 1
            ;;
    esac
    
    print_header "Rebuilding $service_name"
    print_gateway "Using APISIX deployment"
    
    docker-compose $compose_args build --no-cache $service_name
    docker-compose $compose_args up -d $service_name
    
    # If rebuilding APISIX, reconfigure routes
    if [ "$service" = "gateway" ]; then
        sleep 5
        print_status "Reconfiguring APISIX routes..."
        if [ -f "./setup-apisix.sh" ]; then
            ./setup-apisix.sh || print_warning "APISIX route configuration failed"
        fi
    fi
    
    print_status "$service_name rebuilt and restarted"
}

show_logs() {
    print_header "Showing Logs for All Services"
    print_gateway "Showing logs for APISIX deployment"
    
    local compose_args=$(get_compose_files)
    docker-compose $compose_args logs -f
}

show_service_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        exit 1
    fi
    
    print_header "Showing Logs for $service"
    print_gateway "Using APISIX deployment"
    
    local compose_args=$(get_compose_files)
    docker-compose $compose_args logs -f "$service"
}

show_status() {
    print_header "Container Status"
    print_gateway "Status for APISIX deployment"
    
    echo ""
    print_status "APISIX deployment:"
    local compose_args=$(get_compose_files)
    docker-compose $compose_args ps
    
    echo ""
    print_status "Service Health:"
    echo "  - APISIX Gateway: http://localhost:80"
    echo "  - APISIX Dashboard: http://localhost:9000"
    echo "  - APISIX Admin API: http://localhost:9180"
    echo ""
}

setup_apisix() {
    print_header "Setting up APISIX Routes"
    print_gateway "Configuring APISIX API Gateway"
    
    if [ -f "./setup-apisix.sh" ]; then
        ./setup-apisix.sh
    else
        print_error "setup-apisix.sh not found!"
        exit 1
    fi
}

show_access_info() {
    print_header "Access Information"
    print_status "🌐 Application URLs:"
    print_status "  - Main Application: http://localhost"
    print_status "  - APISIX Dashboard: http://localhost:9000"
    print_status "  - APISIX Admin API: http://localhost:9180"
    print_status ""
    print_status "📊 Direct Service Access:"
    print_status "  - Main App: http://localhost:5000"
    print_status "  - Email Service: http://localhost:3001"
    print_status "  - Chat Service: http://localhost:3002"
    print_status "  - Notification Service: http://localhost:3003"
}

# Main script logic
check_docker

case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    rebuild)
        rebuild_all
        ;;
    rebuild-service)
        rebuild_service "$2"
        ;;
    logs)
        show_logs
        ;;
    logs-service)
        show_service_logs "$2"
        ;;
    status)
        show_status
        ;;
    setup-apisix)
        setup_apisix
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac