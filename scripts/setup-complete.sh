#!/bin/bash

# All-in-One Docker Setup Script
# Combines VPS setup, environment configuration, and deployment

set -e

echo "=========================================="
echo "Software Hub - Complete Docker Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash setup-complete.sh)"
    exit 1
fi

# Step 1: Check if Docker is installed
print_info "Step 1: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker..."
    bash scripts/setup-vps-docker.sh
else
    print_success "Docker already installed: $(docker --version)"
fi
echo ""

# Step 2: Check if Docker Compose is installed
print_info "Step 2: Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed: $(docker-compose --version)"
fi
echo ""

# Step 3: Navigate to project directory
PROJECT_PATH="/var/www/software-hub"
print_info "Step 3: Setting up project directory..."
if [ ! -d "$PROJECT_PATH" ]; then
    mkdir -p $PROJECT_PATH
    print_success "Created project directory: $PROJECT_PATH"
fi
cd $PROJECT_PATH
echo ""

# Step 4: Clone or update repository
print_info "Step 4: Repository setup..."
if [ -d ".git" ]; then
    print_info "Updating repository..."
    git pull origin main
else
    read -p "Enter repository URL (or press Enter to skip): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        print_info "Cloning repository..."
        cd /var/www
        rm -rf software-hub
        git clone $REPO_URL software-hub
        cd software-hub
        print_success "Repository cloned"
    else
        print_warning "Skipping repository clone"
    fi
fi
echo ""

# Step 5: Configure environment
print_info "Step 5: Configuring environment..."
if [ -f "scripts/configure-env.sh" ]; then
    bash scripts/configure-env.sh
else
    print_warning "configure-env.sh not found, creating basic .env.production..."
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
CHAT_SERVICE_URL=http://chat-service:3001
EOF
        chmod 600 .env.production
        print_success "Basic .env.production created"
    fi
fi
echo ""

# Step 6: Build Docker images
print_info "Step 6: Building Docker images..."
docker-compose -f docker-compose.production.yml build --no-cache
print_success "Docker images built"
echo ""

# Step 7: Start services
print_info "Step 7: Starting services..."
docker-compose -f docker-compose.production.yml up -d
print_success "Services started"
echo ""

# Step 8: Wait for services to be ready
print_info "Step 8: Waiting for services to be ready..."
sleep 15

# Check if database is ready
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f docker-compose.production.yml exec -T db pg_isready -U software_hub_user > /dev/null 2>&1; then
        print_success "Database is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Database failed to start"
    exit 1
fi
echo ""

# Step 9: Run database migrations
print_info "Step 9: Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app npm run db:migrate || print_warning "Migration failed or not configured"
echo ""

# Step 10: Check service status
print_info "Step 10: Checking service status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# Step 11: Health check
print_info "Step 11: Performing health check..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is healthy!"
else
    print_warning "Health check failed. Check logs with: docker-compose -f docker-compose.production.yml logs"
fi
echo ""

# Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
print_success "Docker deployment is ready!"
echo ""
echo "Service URLs:"
echo "  - Application: http://$(curl -s ifconfig.me):3000"
echo "  - Chat Service: http://$(curl -s ifconfig.me):3001"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Check status: docker-compose -f docker-compose.production.yml ps"
echo "  - Restart: docker-compose -f docker-compose.production.yml restart"
echo "  - Stop: docker-compose -f docker-compose.production.yml down"
echo ""
echo "Or use Makefile commands:"
echo "  - make logs"
echo "  - make ps"
echo "  - make restart"
echo "  - make down"
echo ""
print_info "Configuration files:"
echo "  - Environment: $PROJECT_PATH/.env.production"
echo "  - Credentials: $PROJECT_PATH/.credentials-*.txt"
echo ""
print_warning "IMPORTANT: Save your credentials securely!"
echo ""
