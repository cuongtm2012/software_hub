#!/bin/bash

# SoftwareHub Docker Development Script
# This script sets up development environment with hot reloading

set -e

echo "🔧 Starting SoftwareHub Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create development docker-compose override
create_dev_override() {
    print_status "Creating development configuration..."
    
    cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  softwarehub-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: base  # Use base stage for development
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/client/node_modules
    command: npm run dev
    ports:
      - "5000:5000"
      - "5173:5173"  # Vite HMR port

  email-service:
    environment:
      - NODE_ENV=development
    volumes:
      - ./services/email-service:/app
      - /app/node_modules
    command: npm run dev

  chat-service:
    environment:
      - NODE_ENV=development
    volumes:
      - ./services/chat-service:/app
      - /app/node_modules
    command: npm run dev

  notification-service:
    environment:
      - NODE_ENV=development
    volumes:
      - ./services/notification-service:/app
      - /app/node_modules
    command: npm run dev

  worker-service:
    environment:
      - NODE_ENV=development
    volumes:
      - ./services/worker-service:/app
      - /app/node_modules
    command: npm run dev
EOF

    print_success "Development configuration created"
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Start with development overrides
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis mongo
    
    print_status "Waiting for databases to be ready..."
    sleep 15
    
    # Start application services
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    print_success "Development environment started"
}

# Show development info
show_dev_info() {
    print_success "🔧 Development environment ready!"
    echo ""
    echo "📊 Development URLs:"
    echo "  🌐 Main App (dev): http://localhost:5000"
    echo "  ⚡ Vite HMR: http://localhost:5173"
    echo "  📧 Email Service: http://localhost:3001"
    echo "  💬 Chat Service: http://localhost:3002"
    echo "  🔔 Notification Service: http://localhost:3003"
    echo "  ⚙️  Worker Service: http://localhost:3004"
    echo ""
    echo "🔧 Development features:"
    echo "  ♻️  Hot reloading enabled for all services"
    echo "  📁 Local files mounted for real-time changes"
    echo "  🐛 Debug mode enabled"
    echo ""
    echo "📝 Useful development commands:"
    echo "  📊 View all logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
    echo "  🔍 Check status: docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps"
    echo "  🛑 Stop all: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
    echo "  🔄 Restart service: docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart [service]"
}

# Main execution
main() {
    create_dev_override
    start_dev
    show_dev_info
}

# Execute main function
main "$@"