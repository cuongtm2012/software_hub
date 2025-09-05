#!/bin/bash

# SoftwareHub Service Stop Script
# APISIX deployment (nginx removed)
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

print_header "Stopping SoftwareHub Services (APISIX deployment)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Cannot stop containers."
    exit 1
fi

# Stop using docker-manage.sh script
if [ -f "./docker-manage.sh" ]; then
    print_status "Using docker-manage.sh for orchestrated shutdown..."
    ./docker-manage.sh stop
else
    print_warning "docker-manage.sh not found. Stopping services manually..."
    
    print_status "Stopping all SoftwareHub containers..."
    docker-compose down
fi

print_status "All SoftwareHub services stopped successfully!"
print_status "APISIX gateway and dashboard are now offline."