#!/bin/bash

# Complete Docker Deployment Fix Script
# Handles port conflicts, environment variables, and all common issues

set -e

echo "=========================================="
echo "Complete Docker Deployment Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Navigate to project
cd /var/www/software-hub 2>/dev/null || cd ~/Cuongtm2012/software_hub || {
    print_error "Project directory not found"
    exit 1
}

print_info "Working directory: $(pwd)"
echo ""

# ==========================================
# Step 1: Handle PostgreSQL Port Conflict
# ==========================================
print_info "Step 1: Checking PostgreSQL port conflict..."

if systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL is running on host - this will cause port conflict!"
    read -p "Stop and disable host PostgreSQL? (yes/no): " STOP_PG
    
    if [ "$STOP_PG" = "yes" ]; then
        print_info "Stopping PostgreSQL on host..."
        sudo systemctl stop postgresql
        sudo systemctl disable postgresql
        print_success "PostgreSQL stopped and disabled"
    else
        print_warning "Keeping host PostgreSQL running"
        print_info "Will use port 5433 for Docker PostgreSQL instead"
        
        # Update docker-compose to use different port
        if grep -q "5432:5432" docker-compose.production.yml; then
            sed -i 's/5432:5432/5433:5432/' docker-compose.production.yml
            print_success "Changed Docker PostgreSQL port to 5433"
        fi
    fi
else
    print_success "No PostgreSQL port conflict"
fi
echo ""

# ==========================================
# Step 2: Fix Environment Variables
# ==========================================
print_info "Step 2: Setting up environment variables..."

# Check and create .env.production
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating..."
    
    cat > .env.production << EOF
# Database Configuration
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=$(openssl rand -base64 32)

# Database Host - MUST be 'db' for Docker
DATABASE_URL=postgresql://software_hub_user:\${DB_PASSWORD}@db:5432/software_hub

# Chat Service
CHAT_SERVICE_URL=http://chat-service:3001

# Email Service (Optional)
RESEND_API_KEY=

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
EOF
    
    chmod 600 .env.production
    print_success "Created .env.production with secure passwords"
else
    print_success ".env.production exists"
fi

# Verify and fix empty variables
print_info "Verifying environment variables..."

fix_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.production 2>/dev/null | cut -d'=' -f2-)
    
    if [ -z "$var_value" ]; then
        case $var_name in
            DB_PASSWORD)
                NEW_VALUE=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)
                ;;
            SESSION_SECRET)
                NEW_VALUE=$(openssl rand -base64 32)
                ;;
            DB_NAME)
                NEW_VALUE="software_hub"
                ;;
            DB_USER)
                NEW_VALUE="software_hub_user"
                ;;
            *)
                return 0
                ;;
        esac
        
        if grep -q "^${var_name}=" .env.production; then
            sed -i "s|^${var_name}=.*|${var_name}=${NEW_VALUE}|" .env.production
        else
            echo "${var_name}=${NEW_VALUE}" >> .env.production
        fi
        print_success "Fixed ${var_name}"
    fi
}

# Fix required variables
for var in DB_NAME DB_USER DB_PASSWORD SESSION_SECRET; do
    fix_env_var "$var"
done

# Ensure DATABASE_URL uses 'db' as host
if ! grep -q "DATABASE_URL.*@db:" .env.production; then
    print_warning "DATABASE_URL not using 'db' as host"
    DB_PASS=$(grep "^DB_PASSWORD=" .env.production | cut -d'=' -f2)
    DB_USER=$(grep "^DB_USER=" .env.production | cut -d'=' -f2)
    DB_NAME=$(grep "^DB_NAME=" .env.production | cut -d'=' -f2)
    
    if grep -q "^DATABASE_URL=" .env.production; then
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}|" .env.production
    else
        echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}" >> .env.production
    fi
    print_success "Fixed DATABASE_URL to use Docker network"
fi

print_success "Environment variables configured"
echo ""

# ==========================================
# Step 3: Pull Latest Code
# ==========================================
if [ -d ".git" ]; then
    print_info "Step 3: Pulling latest code..."
    git fetch origin
    git pull origin main || git pull origin master || print_warning "Failed to pull"
    print_success "Code updated"
else
    print_warning "Not a git repository"
fi
echo ""

# ==========================================
# Step 4: Clean Up Docker Resources
# ==========================================
print_info "Step 4: Cleaning up Docker resources..."

# Stop containers
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Remove dangling resources
docker system prune -f

# Remove old volumes (optional)
read -p "Remove old database volumes? This will DELETE all data! (yes/no): " REMOVE_VOL
if [ "$REMOVE_VOL" = "yes" ]; then
    docker volume rm software-hub-postgres-data 2>/dev/null || true
    print_warning "Database volume removed - fresh start"
fi

print_success "Docker cleaned up"
echo ""

# ==========================================
# Step 5: Build Docker Images
# ==========================================
print_info "Step 5: Building Docker images..."

if docker-compose -f docker-compose.production.yml build --no-cache; then
    print_success "Docker images built successfully!"
else
    print_error "Docker build failed!"
    print_info "Check logs above for errors"
    exit 1
fi
echo ""

# ==========================================
# Step 6: Start Services
# ==========================================
print_info "Step 6: Starting services..."

docker-compose -f docker-compose.production.yml up -d

print_success "Services started"
echo ""

# ==========================================
# Step 7: Wait for Database Health
# ==========================================
print_info "Step 7: Waiting for database to be healthy..."

MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f docker-compose.production.yml exec -T db pg_isready -U software_hub_user -d software_hub > /dev/null 2>&1; then
        print_success "Database is healthy!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Database failed to become healthy"
    print_info "Checking database logs..."
    docker-compose -f docker-compose.production.yml logs db
    exit 1
fi
echo ""

# ==========================================
# Step 8: Run Database Migrations
# ==========================================
print_info "Step 8: Running database migrations..."

docker-compose -f docker-compose.production.yml exec -T app npm run db:migrate || print_warning "Migration failed or not configured"
echo ""

# ==========================================
# Step 9: Health Check
# ==========================================
print_info "Step 9: Performing application health check..."

sleep 10

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is healthy!"
else
    print_warning "Health check failed. Checking logs..."
    docker-compose -f docker-compose.production.yml logs --tail=30 app
fi
echo ""

# ==========================================
# Step 10: Show Status
# ==========================================
print_info "Step 10: Container status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# ==========================================
# Summary
# ==========================================
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""

print_success "All services are running!"
echo ""
echo "📊 Service URLs:"
echo "  - Application: http://$(curl -s ifconfig.me):3000"
echo "  - Health Check: http://localhost:3000/api/health"
echo ""
echo "🔧 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Check status: docker-compose -f docker-compose.production.yml ps"
echo "  - Restart app: docker-compose -f docker-compose.production.yml restart app"
echo "  - Stop all: docker-compose -f docker-compose.production.yml down"
echo ""
echo "📝 Configuration:"
echo "  - Environment: .env.production"
echo "  - Database: PostgreSQL in Docker"
echo "  - Network: software-hub-network"
echo ""

# Save credentials
CRED_FILE=".deployment-credentials-$(date +%Y%m%d-%H%M%S).txt"
cat > "$CRED_FILE" << EOF
Deployment Credentials - $(date)

DB_PASSWORD: $(grep '^DB_PASSWORD=' .env.production | cut -d'=' -f2)
SESSION_SECRET: $(grep '^SESSION_SECRET=' .env.production | cut -d'=' -f2)

Database Connection:
  Host: db (inside Docker network) or localhost:5432 (from host)
  Database: $(grep '^DB_NAME=' .env.production | cut -d'=' -f2)
  User: $(grep '^DB_USER=' .env.production | cut -d'=' -f2)

IMPORTANT: Save these credentials securely and delete this file!
EOF

chmod 600 "$CRED_FILE"
print_warning "Credentials saved to: $CRED_FILE"
print_warning "Please save these and delete the file!"
echo ""
