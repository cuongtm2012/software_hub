#!/bin/bash

# SoftwareHub Docker Deployment Script
# This script builds and deploys the entire SoftwareHub microservices stack

set -e

echo "🚀 Starting SoftwareHub Docker Deployment..."

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Check environment file
check_env_file() {
    print_status "Checking environment configuration..."
    if [[ ! -f .env ]]; then
        if [[ -f .env.docker ]]; then
            print_warning ".env file not found. Copying from .env.docker template..."
            cp .env.docker .env
            print_warning "Please edit .env file with your actual configuration values before proceeding."
            print_warning "Press Enter to continue after editing .env file, or Ctrl+C to exit..."
            read -r
        else
            print_error ".env file not found and no .env.docker template available."
            exit 1
        fi
    fi
    
    print_success "Environment file found"
}

# Build images
build_images() {
    print_status "Building Docker images..."
    
    # Build main application
    print_status "Building main application..."
    docker build -t softwarehub-app:latest .
    
    # Build microservices
    print_status "Building email service..."
    docker build -t softwarehub-email:latest ./services/email-service
    
    print_status "Building chat service..."
    docker build -t softwarehub-chat:latest ./services/chat-service
    
    print_status "Building notification service..."
    docker build -t softwarehub-notification:latest ./services/notification-service
    
    print_status "Building worker service..."
    docker build -t softwarehub-worker:latest ./services/worker-service
    
    print_success "All images built successfully"
}

# Deploy with Docker Compose
deploy_stack() {
    print_status "Deploying SoftwareHub stack..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
    
    # Start the stack
    print_status "Starting services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "SoftwareHub stack deployed successfully"
}

# Check service health
check_services() {
    print_status "Checking service health..."
    sleep 10  # Give services time to start
    
    services=("postgres" "redis" "mongo" "email-service" "chat-service" "notification-service" "worker-service" "softwarehub-app")
    
    for service in "${services[@]}"; do
        if docker-compose ps -q $service &> /dev/null || docker compose ps -q $service &> /dev/null; then
            print_success "$service is running"
        else
            print_error "$service failed to start"
            print_status "Checking logs for $service..."
            docker-compose logs $service 2>/dev/null || docker compose logs $service 2>/dev/null || true
        fi
    done
}

# Show deployment summary
show_summary() {
    print_success "🎉 SoftwareHub deployment completed!"
    echo ""
    echo "📊 Service URLs:"
    echo "  🌐 Main Application: http://localhost:5000"
    echo "  📧 Email Service: http://localhost:3001"
    echo "  💬 Chat Service: http://localhost:3002"
    echo "  🔔 Notification Service: http://localhost:3003"
    echo "  ⚙️  Worker Service: http://localhost:3004"
    echo ""
    echo "📊 Database URLs:"
    echo "  🐘 PostgreSQL: localhost:5432"
    echo "  🍃 MongoDB: localhost:27017"
    echo "  🔴 Redis: localhost:6379"
    echo ""
    echo "🔧 Useful commands:"
    echo "  📝 View logs: docker-compose logs -f [service_name]"
    echo "  🔍 Check status: docker-compose ps"
    echo "  🛑 Stop all: docker-compose down"
    echo "  🔄 Restart: docker-compose restart [service_name]"
}

# Main execution
main() {
    check_docker
    check_docker_compose
    check_env_file
    build_images
    deploy_stack
    check_services
    show_summary
}

# Execute main function
main "$@"