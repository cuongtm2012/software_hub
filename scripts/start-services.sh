#!/bin/bash

# SoftwareHub Service Startup Script
# Using APISIX API Gateway (nginx removed)
set -e

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

print_header "Starting SoftwareHub Services with APISIX"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Start using docker-manage.sh script
if [ -f "./docker-manage.sh" ]; then
    print_status "Using docker-manage.sh for orchestrated startup..."
    ./docker-manage.sh prod
else
    print_warning "docker-manage.sh not found. Starting services manually..."
    
    # Start databases first
    print_status "Starting databases..."
    docker-compose up -d postgres redis mongo
    
    # Start etcd for APISIX
    print_status "Starting etcd..."
    docker-compose up -d etcd
    sleep 5
    
    # Wait for databases
    print_status "Waiting for databases to be ready..."
    sleep 15
    
    # Start microservices
    print_status "Starting microservices..."
    docker-compose up -d email-service chat-service notification-service worker-service
    
    # Wait for microservices
    print_status "Waiting for microservices to be ready..."
    sleep 20
    
    # Start main application
    print_status "Starting main application..."
    docker-compose up -d softwarehub-app
    
    # Start APISIX gateway and dashboard
    print_status "Starting APISIX gateway and dashboard..."
    docker-compose up -d apisix apisix-dashboard
    sleep 10
    
    # Configure APISIX routes
    print_status "Configuring APISIX routes..."
    if [ -f "./setup-apisix.sh" ]; then
        ./setup-apisix.sh || print_warning "APISIX route configuration failed"
    else
        print_warning "setup-apisix.sh not found. Routes not configured."
    fi
    
    # Start backup service
    docker-compose up -d postgres-backup
    
    print_status "All services started!"
fi

print_header "Service URLs"
print_status "🌐 Main Application: http://localhost"
print_status "📊 APISIX Dashboard: http://localhost:9000"
print_status "🔧 APISIX Admin API: http://localhost:9180"
print_status ""
print_status "📈 Direct Service Access:"
print_status "  - Main App: http://localhost:5000"
print_status "  - Email Service: http://localhost:3001"
print_status "  - Chat Service: http://localhost:3002"
print_status "  - Notification Service: http://localhost:3003"