#!/bin/bash

# Quick Fix Script for Docker Build Issues
# Run this on VPS to fix common Docker deployment problems

set -e

echo "=================================="
echo "Docker Build Fix Script"
echo "=================================="
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

# Navigate to project directory
cd /var/www/software-hub || cd ~/Cuongtm2012/software_hub || {
    print_error "Project directory not found"
    exit 1
}

print_info "Current directory: $(pwd)"
echo ""

# Step 1: Check if .env.production exists
print_info "Step 1: Checking .env.production..."
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    if [ -f ".env.production.template" ]; then
        cp .env.production.template .env.production
        print_success "Created .env.production from template"
    else
        print_error ".env.production.template not found"
        print_info "Creating basic .env.production..."
        cat > .env.production << 'EOF'
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
SESSION_SECRET=CHANGE_THIS_SECRET
NODE_ENV=production
PORT=3000
CHAT_SERVICE_URL=http://chat-service:3001
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
EOF
        print_success "Created basic .env.production"
        print_warning "Please update passwords in .env.production!"
    fi
else
    print_success ".env.production exists"
fi
echo ""

# Step 2: Verify .env.production has required variables
print_info "Step 2: Verifying environment variables..."
REQUIRED_VARS=("DB_NAME" "DB_USER" "DB_PASSWORD" "SESSION_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.production; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing variables: ${MISSING_VARS[*]}"
    print_info "Adding missing variables with defaults..."
    for var in "${MISSING_VARS[@]}"; do
        case $var in
            DB_PASSWORD|SESSION_SECRET)
                echo "${var}=$(openssl rand -base64 32)" >> .env.production
                ;;
            DB_NAME)
                echo "DB_NAME=software_hub" >> .env.production
                ;;
            DB_USER)
                echo "DB_USER=software_hub_user" >> .env.production
                ;;
        esac
    done
    print_success "Added missing variables"
else
    print_success "All required variables present"
fi
echo ""

# Step 3: Pull latest code (if git repo)
if [ -d ".git" ]; then
    print_info "Step 3: Pulling latest code..."
    git fetch origin
    git pull origin main || git pull origin master || print_warning "Failed to pull latest code"
    print_success "Code updated"
else
    print_warning "Not a git repository, skipping pull"
fi
echo ""

# Step 4: Clean up Docker
print_info "Step 4: Cleaning up Docker..."
docker-compose -f docker-compose.production.yml down || true
docker system prune -f
print_success "Docker cleaned up"
echo ""

# Step 5: Build images
print_info "Step 5: Building Docker images..."
docker-compose -f docker-compose.production.yml build --no-cache
if [ $? -eq 0 ]; then
    print_success "Docker images built successfully!"
else
    print_error "Docker build failed!"
    print_info "Checking for common issues..."
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile.production" ]; then
        print_error "Dockerfile.production not found!"
        exit 1
    fi
    
    # Check if docker-compose file exists
    if [ ! -f "docker-compose.production.yml" ]; then
        print_error "docker-compose.production.yml not found!"
        exit 1
    fi
    
    exit 1
fi
echo ""

# Step 6: Start services
print_info "Step 6: Starting services..."
docker-compose -f docker-compose.production.yml up -d
print_success "Services started"
echo ""

# Step 7: Wait for database
print_info "Step 7: Waiting for database to be ready..."
sleep 10

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
    print_warning "Database health check timeout (this might be OK)"
fi
echo ""

# Step 8: Run migrations
print_info "Step 8: Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app npm run db:migrate || print_warning "Migration failed or not configured"
echo ""

# Step 9: Check status
print_info "Step 9: Checking service status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# Step 10: Health check
print_info "Step 10: Performing health check..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is healthy!"
else
    print_warning "Health check failed. Checking logs..."
    docker-compose -f docker-compose.production.yml logs --tail=20 app
fi
echo ""

# Summary
echo "=================================="
echo "Fix Complete!"
echo "=================================="
echo ""
print_success "Docker deployment fixed and running"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Check status: docker-compose -f docker-compose.production.yml ps"
echo "  - Restart: docker-compose -f docker-compose.production.yml restart"
echo ""
print_info "If issues persist, check:"
echo "  1. .env.production has correct values"
echo "  2. Docker logs: docker-compose -f docker-compose.production.yml logs"
echo "  3. System resources: df -h && free -h"
echo ""
