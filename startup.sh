#!/bin/bash

# SoftwareHub Service Startup Script
# This script ensures services start in the correct order and are properly initialized

set -e

echo "🚀 Starting SoftwareHub Services..."
echo "=================================="

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

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name on port $port..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo "  Attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    print_error "$service_name failed to start within timeout"
    return 1
}

# Function to wait for HTTP service health check
wait_for_health_check() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=1

    print_status "Checking health for $service_name..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            print_success "$service_name health check passed!"
            return 0
        fi
        
        echo "  Health check attempt $attempt/$max_attempts..."
        sleep 3
        ((attempt++))
    done

    print_error "$service_name health check failed"
    return 1
}

# Clean up any existing containers
print_status "Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p database/dumps database/backups database/init database/mongo-init ssl

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/softwarehub
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://admin:password@localhost:27017/softwarehub-chat?authSource=admin

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Email Configuration (Optional)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Firebase Configuration (Optional)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FCM_VAPID_KEY=

# Storage Configuration (Optional)
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_ENDPOINT=

# Service URLs (Internal)
EMAIL_SERVICE_URL=http://email-service:3001
CHAT_SERVICE_URL=http://chat-service:3002
NOTIFICATION_SERVICE_URL=http://notification-service:3003
EOF
    print_warning "Please configure your .env file with appropriate values"
fi

# Step 1: Start database services first
print_status "Step 1: Starting database services..."
docker-compose up -d postgres redis mongo

# Wait for databases to be ready
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379
wait_for_service "MongoDB" 27017

# Give databases extra time to fully initialize
print_status "Allowing databases to fully initialize..."
sleep 10

# Step 2: Start microservices
print_status "Step 2: Starting microservices..."
docker-compose up -d email-service chat-service notification-service

# Wait for microservices to be ready
wait_for_service "Email Service" 3001
wait_for_service "Chat Service" 3002
wait_for_service "Notification Service" 3003

# Health checks for microservices
wait_for_health_check "Email Service" "http://localhost:3001/health"
wait_for_health_check "Chat Service" "http://localhost:3002/health"
wait_for_health_check "Notification Service" "http://localhost:3003/health"

# Step 3: Start worker service
print_status "Step 3: Starting worker service..."
docker-compose up -d worker-service

# Give worker service time to initialize
sleep 5

# Step 4: Start main application
print_status "Step 4: Starting main application..."
docker-compose up -d softwarehub-app

# Wait for main application
wait_for_service "Main Application" 5000
wait_for_health_check "Main Application" "http://localhost:5000/health"

# Final validation
print_status "Step 5: Final validation..."
echo
echo "🔍 Service Status Summary:"
echo "========================="

# Check all services
services=("postgres:5432:PostgreSQL" "redis:6379:Redis" "mongo:27017:MongoDB" "email-service:3001:Email Service" "chat-service:3002:Chat Service" "notification-service:3003:Notification Service" "softwarehub-app:5000:Main Application")

all_healthy=true

for service in "${services[@]}"; do
    IFS=':' read -r container port name <<< "$service"
    
    if nc -z localhost $port 2>/dev/null; then
        print_success "$name (port $port): RUNNING"
    else
        print_error "$name (port $port): NOT RUNNING"
        all_healthy=false
    fi
done

echo
echo "🌐 Application URLs:"
echo "==================="
echo "Main Application: http://localhost:5000"
echo "Email Service: http://localhost:3001/health"
echo "Chat Service: http://localhost:3002/health"
echo "Notification Service: http://localhost:3003/health"

echo
if [ "$all_healthy" = true ]; then
    print_success "🎉 All services are running successfully!"
    echo
    echo "To view logs: docker-compose logs -f [service-name]"
    echo "To stop services: docker-compose down"
    echo "To restart services: ./startup.sh"
else
    print_error "❌ Some services failed to start properly"
    echo
    echo "Troubleshooting:"
    echo "1. Check logs: docker-compose logs [service-name]"
    echo "2. Run validation: node validate-services.js"
    echo "3. Check Docker: docker-compose ps"
    exit 1
fi