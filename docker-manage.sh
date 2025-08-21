#!/bin/bash
# Software Hub Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
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
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to clean up and rebuild services
clean_rebuild() {
    print_status "Stopping all services..."
    docker-compose down --volumes --remove-orphans

    print_status "Removing old images..."
    docker-compose down --rmi all --volumes --remove-orphans

    print_status "Building fresh images..."
    docker-compose build --no-cache

    print_status "Starting services with dependencies..."
    docker-compose up -d --remove-orphans
}

# Function to fix email service dependencies
fix_email_service() {
    print_status "Fixing email service dependencies..."
    
    # Rebuild email service with fresh dependencies
    docker-compose stop email-service
    docker-compose rm -f email-service
    docker-compose build --no-cache email-service
    docker-compose up -d email-service
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    services=("postgres" "redis" "mongo" "email-service" "chat-service" "notification-service")
    
    for service in "${services[@]}"; do
        status=$(docker-compose ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
        
        if [ "$status" = "healthy" ]; then
            print_status "$service: ✅ Healthy"
        elif [ "$status" = "unhealthy" ]; then
            print_error "$service: ❌ Unhealthy"
        elif [ "$status" = "starting" ]; then
            print_warning "$service: ⏳ Starting..."
        else
            # Check if container is running
            if docker-compose ps $service | grep -q "Up"; then
                print_warning "$service: ⚠️  Running (no health check)"
            else
                print_error "$service: ❌ Not running"
            fi
        fi
    done
}

# Function to show logs for failing services
show_logs() {
    print_status "Showing recent logs for all services..."
    docker-compose logs --tail=50 --timestamps
}

# Function to restart specific service
restart_service() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name"
        exit 1
    fi
    
    print_status "Restarting $1..."
    docker-compose restart $1
    sleep 5
    check_health
}

# Function to start services in correct order
start_services() {
    print_status "Starting services in correct dependency order..."
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose up -d postgres redis mongo
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 30
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices
    print_status "Waiting for microservices to be ready..."
    sleep 20
    
    # Start main application
    print_status "Starting main application..."
    docker-compose up -d softwarehub-app
    
    # Wait for main app
    sleep 15
    
    # Start nginx
    print_status "Starting nginx..."
    docker-compose up -d nginx
    
    # Start backup service
    docker-compose up -d postgres-backup
    
    print_status "All services started. Checking health..."
    check_health
}

# Clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    docker volume prune -f
    print_success "Cleanup completed!"
}

# Show help
show_help() {
    echo "Software Hub Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start           - Start all services in correct order"
    echo "  stop            - Stop all services"
    echo "  restart         - Restart all services"
    echo "  rebuild         - Clean rebuild all services"
    echo "  fix-email       - Fix email service dependency issues"
    echo "  health          - Check health of all services"
    echo "  logs            - Show recent logs from all services"
    echo "  restart-service - Restart a specific service"
    echo "  clean           - Clean up all Docker resources"
    echo
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 fix-email"
    echo "  $0 restart-service email-service"
    echo "  $0 health"
}

# Main execution
case "$1" in
    "start")
        check_docker
        start_services
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        ;;
    "restart")
        check_docker
        print_status "Restarting all services..."
        docker-compose down
        start_services
        ;;
    "rebuild")
        check_docker
        clean_rebuild
        ;;
    "fix-email")
        check_docker
        fix_email_service
        ;;
    "health")
        check_health
        ;;
    "logs")
        show_logs
        ;;
    "restart-service")
        check_docker
        restart_service $2
        ;;
    "clean")
        cleanup
        ;;
    *)
        show_help
        ;;
esac