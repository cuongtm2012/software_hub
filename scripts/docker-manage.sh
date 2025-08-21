#!/bin/bash

# SoftwareHub Docker Management Script
# Enhanced with Gateweaver API Gateway (APISIX removed)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE="docker-compose.dev.yml"
GATEWEAVER_PROJECT="softwarehub-gateweaver"

# Default gateway type - Gateweaver only now
GATEWAY_TYPE="gateweaver"

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
    echo -e "${CYAN}[GATEWEAVER]${NC} $1"
}

show_help() {
    echo "SoftwareHub Docker Management Script"
    echo "Using Gateweaver API Gateway"
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
    echo "  health                              # Check service health"
    echo "  test-routing                        # Test Gateweaver routing"
    echo "  remove-apisix                       # Remove old APISIX containers"
    echo "  help                                # Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                              # Start development mode"
    echo "  $0 prod                             # Start production mode"
    echo "  $0 rebuild-service notification     # Rebuild notification service"
    echo "  $0 logs-service gateweaver          # Show Gateweaver logs"
    echo "  $0 health                           # Check all service health"
    echo "  $0 test-routing                     # Test gateway routing"
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
    
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

get_compose_files() {
    echo "-f $COMPOSE_FILE -p $GATEWEAVER_PROJECT"
}

get_dev_compose_files() {
    echo "-f $COMPOSE_FILE -p $GATEWEAVER_PROJECT"
}

# Function to remove old APISIX containers
remove_apisix() {
    print_header "Removing Old APISIX Services"
    print_gateway "Cleaning up legacy APISIX deployment"
    
    # Stop and remove APISIX containers
    docker stop softwarehub-apisix softwarehub-apisix-dashboard softwarehub-etcd 2>/dev/null || true
    docker rm softwarehub-apisix softwarehub-apisix-dashboard softwarehub-etcd 2>/dev/null || true
    
    # Remove APISIX images
    docker rmi apache/apisix:3.7.0-debian apache/apisix-dashboard:3.0.1-alpine bitnami/etcd:3.5.9 2>/dev/null || true
    
    print_status "APISIX services removed successfully"
}

# Function to build Gateweaver if needed
build_gateweaver() {
    print_status "Building Gateweaver API Gateway..."
    
    # Check if Gateweaver configuration exists
    if [ ! -f "gateweaver.yml" ]; then
        print_error "gateweaver.yml not found. Please ensure the configuration file exists."
        exit 1
    fi
    
    # Build Gateweaver image
    docker build -f Dockerfile.gateweaver -t softwarehub-gateweaver:latest .
    
    print_status "Gateweaver image built successfully"
}

start_dev() {
    print_header "Starting SoftwareHub in Development Mode"
    print_gateway "Using Gateweaver as API Gateway"
    print_status "This mode provides live code updates without rebuilding containers"
    
    local compose_args=$(get_dev_compose_files)
    
    # Remove any old APISIX containers first
    remove_apisix
    
    # Build Gateweaver if needed
    build_gateweaver
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose $compose_args up -d postgres redis mongo
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose $compose_args up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start Gateweaver gateway
    print_status "Starting Gateweaver gateway..."
    docker-compose $compose_args up -d gateweaver
    sleep 10
    
    # Start main application
    print_status "Starting main application..."
    docker-compose $compose_args up -d softwarehub-app
    
    # Start backup service
    docker-compose $compose_args up -d postgres-backup
    
    # Wait for everything to be ready
    print_status "Waiting for all services to be ready..."
    sleep 5
    
    print_status "Development environment started!"
    check_service_health
    show_access_info
}

start_prod() {
    print_header "Starting SoftwareHub in Production Mode"
    print_gateway "Using Gateweaver as API Gateway"
    
    local compose_args=$(get_compose_files)
    
    # Remove any old APISIX containers first
    remove_apisix
    
    # Build Gateweaver if needed
    build_gateweaver
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose $compose_args up -d postgres redis mongo
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose $compose_args up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start Gateweaver gateway
    print_status "Starting Gateweaver gateway..."
    docker-compose $compose_args up -d gateweaver
    sleep 10
    
    # Start main application
    print_status "Starting main application..."
    docker-compose $compose_args up -d softwarehub-app
    
    # Start backup service
    docker-compose $compose_args up -d postgres-backup
    
    # Wait for everything to be ready
    print_status "Waiting for all services to be ready..."
    sleep 5
    
    print_status "Production environment started!"
    check_service_health
    show_access_info
}

stop_containers() {
    print_header "Stopping SoftwareHub Containers"
    print_gateway "Stopping Gateweaver deployment"
    
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
    print_gateway "Using Gateweaver deployment"
    
    local compose_args=$(get_compose_files)
    
    print_status "Stopping all containers..."
    docker-compose $compose_args down
    
    print_status "Rebuilding all services..."
    docker-compose $compose_args build --no-cache
    build_gateweaver
    
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
            service_name="gateweaver"
            ;;
        *)
            print_error "Unknown service: $service"
            print_status "Available services: main, email, chat, notification, worker, gateway"
            exit 1
            ;;
    esac
    
    print_header "Rebuilding $service_name"
    print_gateway "Using Gateweaver deployment"
    
    if [ "$service" = "gateway" ]; then
        build_gateweaver
    else
        docker-compose $compose_args build --no-cache $service_name
    fi
    
    docker-compose $compose_args up -d $service_name
    
    print_status "$service_name rebuilt and restarted"
}

show_logs() {
    print_header "Showing Logs for All Services"
    print_gateway "Showing logs for Gateweaver deployment"
    
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
    print_gateway "Using Gateweaver deployment"
    
    local compose_args=$(get_compose_files)
    docker-compose $compose_args logs -f "$service"
}

show_status() {
    print_header "Container Status"
    print_gateway "Status for Gateweaver deployment"
    
    echo ""
    print_status "Gateweaver deployment:"
    local compose_args=$(get_compose_files)
    docker-compose $compose_args ps
    
    echo ""
    print_status "Service Endpoints:"
    echo "  - Main Gateway: http://localhost"
    echo "  - Gateweaver Health: http://localhost:8081/health"
    echo "  - Gateweaver Metrics: http://localhost:8082/metrics"
    echo ""
}

# Function to check service health
check_service_health() {
    print_header "Checking Service Health"
    print_gateway "Health check for Gateweaver deployment"
    
    # Check Gateweaver health
    echo ""
    print_status "Gateweaver API Gateway:"
    if curl -f -s "http://localhost:8081/health" > /dev/null; then
        print_status "✅ Gateweaver is healthy"
        curl -s "http://localhost:8081/health" | jq '.' 2>/dev/null || curl -s "http://localhost:8081/health"
    else
        print_error "❌ Gateweaver health check failed"
    fi
    
    # Check individual microservices
    echo ""
    print_status "Microservices:"
    
    services=("email-service:3001" "chat-service:3002" "notification-service:3003")
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if curl -f -s "http://localhost:$port/health" > /dev/null; then
            print_status "✅ $name is healthy"
        else
            print_warning "⚠️  $name health check failed"
        fi
    done
    
    # Check databases
    echo ""
    print_status "Databases:"
    
    if docker exec softwarehub-postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_status "✅ PostgreSQL is healthy"
    else
        print_warning "⚠️  PostgreSQL health check failed"
    fi
    
    if docker exec softwarehub-redis redis-cli ping > /dev/null 2>&1; then
        print_status "✅ Redis is healthy"
    else
        print_warning "⚠️  Redis health check failed"
    fi
    
    if docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status "✅ MongoDB is healthy"
    else
        print_warning "⚠️  MongoDB health check failed"
    fi
}

# Function to test Gateweaver routing
test_routing() {
    print_header "Testing Gateweaver Routing"
    print_gateway "Testing API Gateway routing functionality"
    
    # Test main gateway
    echo ""
    print_status "Testing main gateway (port 80):"
    if curl -f -s "http://localhost" > /dev/null; then
        print_status "✅ Main gateway is accessible"
    else
        print_warning "⚠️  Main gateway test failed"
    fi
    
    # Test health endpoint
    echo ""
    print_status "Testing health endpoint:"
    if curl -f -s "http://localhost:8081/health" > /dev/null; then
        print_status "✅ Health endpoint is accessible"
    else
        print_error "❌ Health endpoint test failed"
    fi
    
    # Test metrics endpoint
    echo ""
    print_status "Testing metrics endpoint:"
    if curl -f -s "http://localhost:8082/metrics" > /dev/null; then
        print_status "✅ Metrics endpoint is accessible"
    else
        print_warning "⚠️  Metrics endpoint test failed"
    fi
    
    # Test routing to services through gateway
    echo ""
    print_status "Testing service routing through gateway:"
    
    services=("api/email/health" "api/chat/health" "api/notifications/health")
    for endpoint in "${services[@]}"; do
        service_name=$(echo $endpoint | cut -d/ -f2)
        
        if curl -f -s "http://localhost/$endpoint" > /dev/null; then
            print_status "✅ $service_name routing works"
        else
            print_warning "⚠️  $service_name routing test failed"
        fi
    done
}

show_access_info() {
    print_header "Access Information"
    print_status "🌐 Application URLs:"
    print_status "  - Main Application: http://localhost"
    print_status "  - Gateweaver Health: http://localhost:8081/health"
    print_status "  - Gateweaver Metrics: http://localhost:8082/metrics"
    print_status ""
    print_status "📊 Direct Service Access:"
    print_status "  - Main App: http://localhost:5000"
    print_status "  - Email Service: http://localhost:3001"
    print_status "  - Chat Service: http://localhost:3002"
    print_status "  - Notification Service: http://localhost:3003"
    print_status ""
    print_status "🔗 Service Routing through Gateway:"
    print_status "  - Email API: http://localhost/api/email/*"
    print_status "  - Chat API: http://localhost/api/chat/*"
    print_status "  - Notifications API: http://localhost/api/notifications/*"
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
    health)
        check_service_health
        ;;
    test-routing)
        test_routing
        ;;
    remove-apisix)
        remove_apisix
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