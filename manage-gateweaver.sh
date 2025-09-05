#!/bin/bash

# Gateweaver Management Script
# This script helps manage the Gateweaver API Gateway deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to stop and remove APISIX containers
remove_apisix() {
    print_status "Removing APISIX services..."
    
    # Stop and remove APISIX containers
    docker stop softwarehub-apisix softwarehub-apisix-dashboard softwarehub-etcd 2>/dev/null || true
    docker rm softwarehub-apisix softwarehub-apisix-dashboard softwarehub-etcd 2>/dev/null || true
    
    # Remove APISIX images
    docker rmi apache/apisix:3.7.0-debian apache/apisix-dashboard:3.0.1-alpine bitnami/etcd:3.5.9 2>/dev/null || true
    
    print_success "APISIX services removed successfully"
}

# Function to build Gateweaver image
build_gateweaver() {
    print_status "Building Gateweaver API Gateway..."
    
    # Check if Gateweaver configuration exists
    if [ ! -f "gateweaver.yml" ]; then
        print_error "gateweaver.yml not found. Please ensure the configuration file exists."
        exit 1
    fi
    
    # Build Gateweaver image
    docker build -f Dockerfile.gateweaver -t softwarehub-gateweaver:latest .
    
    print_success "Gateweaver image built successfully"
}

# Function to start services with Gateweaver
start_services() {
    print_status "Starting services with Gateweaver API Gateway..."
    
    # Start all services
    docker-compose up -d
    
    print_success "Services started successfully"
    
    # Show running containers
    echo ""
    print_status "Running containers:"
    docker-compose ps
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    
    docker-compose down
    
    print_success "All services stopped"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Check Gateweaver health
    echo ""
    print_status "Gateweaver API Gateway:"
    if curl -f -s "http://localhost:8081/health" > /dev/null; then
        print_success "Gateweaver is healthy"
        curl -s "http://localhost:8081/health" | jq '.' 2>/dev/null || curl -s "http://localhost:8081/health"
    else
        print_error "Gateweaver health check failed"
    fi
    
    # Check individual microservices
    echo ""
    print_status "Microservices:"
    
    services=("email-service:3001" "chat-service:3002" "notification-service:3003")
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if curl -f -s "http://localhost:$port/health" > /dev/null; then
            print_success "$name is healthy"
        else
            print_warning "$name health check failed"
        fi
    done
    
    # Check databases
    echo ""
    print_status "Databases:"
    
    if docker exec softwarehub-postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL is healthy"
    else
        print_warning "PostgreSQL health check failed"
    fi
    
    if docker exec softwarehub-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_warning "Redis health check failed"
    fi
    
    if docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB health check failed"
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f --tail=50
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f --tail=50 "$service"
    fi
}

# Function to restart specific service
restart_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_error "Please specify a service to restart"
        echo "Available services: gateweaver, softwarehub-app, email-service, chat-service, notification-service, worker-service"
        exit 1
    fi
    
    print_status "Restarting $service..."
    docker-compose restart "$service"
    print_success "$service restarted successfully"
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up all containers, images, and volumes..."
    
    # Stop all services
    docker-compose down -v
    
    # Remove APISIX remnants
    remove_apisix
    
    # Remove all project images
    docker rmi softwarehub-gateweaver:latest 2>/dev/null || true
    docker-compose down --rmi all 2>/dev/null || true
    
    # Prune unused Docker resources
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to test Gateweaver routing
test_routing() {
    print_status "Testing Gateweaver routing..."
    
    # Test main gateway
    echo ""
    print_status "Testing main gateway (port 80):"
    if curl -f -s "http://localhost" > /dev/null; then
        print_success "Main gateway is accessible"
    else
        print_warning "Main gateway test failed"
    fi
    
    # Test health endpoint
    echo ""
    print_status "Testing health endpoint:"
    if curl -f -s "http://localhost:8081/health" > /dev/null; then
        print_success "Health endpoint is accessible"
        curl -s "http://localhost:8081/health" | jq '.' 2>/dev/null || echo ""
    else
        print_error "Health endpoint test failed"
    fi
    
    # Test metrics endpoint
    echo ""
    print_status "Testing metrics endpoint:"
    if curl -f -s "http://localhost:8082/metrics" > /dev/null; then
        print_success "Metrics endpoint is accessible"
    else
        print_warning "Metrics endpoint test failed"
    fi
    
    # Test routing to services through gateway
    echo ""
    print_status "Testing service routing through gateway:"
    
    services=("api/email/health" "api/chat/health" "api/notifications/health")
    for endpoint in "${services[@]}"; do
        service_name=$(echo $endpoint | cut -d/ -f2)
        
        if curl -f -s "http://localhost/$endpoint" > /dev/null; then
            print_success "$service_name routing works"
        else
            print_warning "$service_name routing test failed"
        fi
    done
}

# Function to show usage
show_usage() {
    echo "Gateweaver Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup           Remove APISIX and build Gateweaver"
    echo "  build           Build Gateweaver image"
    echo "  start           Start all services with Gateweaver"
    echo "  stop            Stop all services"
    echo "  restart [svc]   Restart specific service or all services"
    echo "  health          Check health of all services"
    echo "  logs [svc]      Show logs for specific service or all services"
    echo "  test            Test Gateweaver routing"
    echo "  cleanup         Stop services and clean up all containers/images"
    echo "  remove-apisix   Remove APISIX containers and images"
    echo ""
    echo "Examples:"
    echo "  $0 setup                    # Complete APISIX to Gateweaver migration"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs gateweaver         # Show Gateweaver logs"
    echo "  $0 restart notification-service  # Restart notification service"
    echo "  $0 test                     # Test all routing"
}

# Main script logic
case "${1:-}" in
    "setup")
        check_docker
        remove_apisix
        build_gateweaver
        start_services
        sleep 10
        check_health
        test_routing
        print_success "Gateweaver setup completed! APISIX has been completely replaced."
        ;;
    "build")
        check_docker
        build_gateweaver
        ;;
    "start")
        check_docker
        start_services
        ;;
    "stop")
        check_docker
        stop_services
        ;;
    "restart")
        check_docker
        restart_service "$2"
        ;;
    "health")
        check_docker
        check_health
        ;;
    "logs")
        check_docker
        show_logs "$2"
        ;;
    "test")
        check_docker
        test_routing
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "remove-apisix")
        check_docker
        remove_apisix
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo ""
        show_usage
        exit 1
        ;;
esac