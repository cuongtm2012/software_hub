#!/bin/bash

# Docker Management Script for SoftwareHub
# This script helps manage Docker containers with live code updates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

show_help() {
    echo "Docker Management Script for SoftwareHub"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev                 Start in development mode with live code updates"
    echo "  prod                Start in production mode (static builds)"
    echo "  stop                Stop all containers"
    echo "  restart             Restart all containers"
    echo "  rebuild             Rebuild and restart containers"
    echo "  rebuild-service     Rebuild specific service: [main|email|chat|notification|worker]"
    echo "  logs                Show logs for all services"
    echo "  logs-service        Show logs for specific service"
    echo "  status              Show container status"
    echo "  update              Update containers with latest code changes"
    echo "  clean               Clean up Docker system (removes unused images/containers)"
    echo "  reset               Complete reset (stop, clean, rebuild)"
    echo ""
    echo "Examples:"
    echo "  $0 dev                          # Start development mode"
    echo "  $0 rebuild-service notification # Rebuild notification service"
    echo "  $0 logs-service softwarehub-app # Show main app logs"
    echo "  $0 update                       # Update running containers with code changes"
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

start_dev() {
    print_header "Starting SoftwareHub in Development Mode"
    print_status "This mode provides live code updates without rebuilding containers"
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis mongo
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start main application
    print_status "Starting main application..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d softwarehub-app
    
    # Start nginx and backup service
    print_status "Starting nginx and backup service..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d nginx postgres-backup
    
    print_status "Development environment started!"
    print_status "Your code changes will be reflected immediately in the containers"
    print_status "Access the application at: http://localhost"
    print_status "Services running on:"
    print_status "  - Main App: http://localhost:5000"
    print_status "  - Email Service: http://localhost:3001" 
    print_status "  - Chat Service: http://localhost:3002"
    print_status "  - Notification Service: http://localhost:3003"
}

start_prod() {
    print_header "Starting SoftwareHub in Production Mode"
    print_status "This mode uses static builds for better performance"
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose up -d postgres redis mongo
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be ready..."
    sleep 15
    
    # Start main application
    print_status "Starting main application..."
    docker-compose up -d softwarehub-app
    
    # Start nginx and backup service
    print_status "Starting nginx and backup service..."
    docker-compose up -d nginx postgres-backup
    
    print_status "Production environment started!"
    print_status "Access the application at: http://localhost"
}

stop_containers() {
    print_header "Stopping SoftwareHub Containers"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_status "All containers stopped"
}

restart_containers() {
    print_header "Restarting SoftwareHub Containers"
    stop_containers
    start_dev
}

rebuild_all() {
    print_header "Rebuilding All Containers"
    print_status "This will rebuild all Docker images with latest code"
    
    stop_containers
    docker-compose build --no-cache
    start_dev
    
    print_status "All containers rebuilt and restarted"
}

rebuild_service() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service to rebuild"
        print_status "Available services: main, email, chat, notification, worker"
        exit 1
    fi
    
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
        *)
            print_error "Unknown service: $service"
            print_status "Available services: main, email, chat, notification, worker"
            exit 1
            ;;
    esac
    
    print_header "Rebuilding $service_name"
    docker-compose build --no-cache $service_name
    docker-compose up -d $service_name
    print_status "$service_name rebuilt and restarted"
}

show_logs() {
    print_header "Showing Logs for All Services"
    docker-compose logs -f
}

show_service_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        exit 1
    fi
    
    print_header "Showing Logs for $service"
    docker-compose logs -f "$service"
}

show_status() {
    print_header "Container Status"
    docker-compose ps
    echo ""
    print_status "Container Health:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

update_containers() {
    print_header "Updating Containers with Latest Code"
    print_status "In development mode, code changes are automatically synced"
    print_status "Restarting all services to pick up environment and config changes..."
    
    # Restart all application services to pick up any environment or config changes
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart email-service
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart chat-service
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart notification-service
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart worker-service
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart softwarehub-app
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart nginx
    
    print_status "All services restarted to pick up latest changes"
}

clean_docker() {
    print_header "Cleaning Docker System"
    print_warning "This will remove unused Docker images, containers, and networks"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker system prune -f
        docker image prune -f
        print_status "Docker system cleaned"
    else
        print_status "Clean operation cancelled"
    fi
}

reset_environment() {
    print_header "Resetting Development Environment"
    print_warning "This will stop all containers, clean Docker system, and rebuild everything"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_containers
        docker system prune -f
        docker image prune -f
        rebuild_all
        print_status "Environment completely reset"
    else
        print_status "Reset operation cancelled"
    fi
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
    update)
        update_containers
        ;;
    clean)
        clean_docker
        ;;
    reset)
        reset_environment
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac