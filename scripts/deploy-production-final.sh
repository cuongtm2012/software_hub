#!/bin/bash

# ============================================
# Software Hub - Production Deployment Script
# ============================================
# This script deploys the app to production using Docker
# Based on successful production setup

set -e  # Exit on error

echo "🚀 Starting Software Hub Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/software-hub"
COMPOSE_FILE="docker-compose.prod.yml"

# Step 1: Navigate to app directory
echo -e "${YELLOW}📁 Navigating to application directory...${NC}"
cd "$APP_DIR"

# Step 2: Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"
    
    # Check for local changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Local changes detected. Stashing...${NC}"
        git stash --include-untracked
        LOCAL_CHANGES_STASHED=true
    else
        LOCAL_CHANGES_STASHED=false
    fi
    
    # Fetch latest from remote
    echo -e "${YELLOW}📡 Fetching from remote...${NC}"
    git fetch origin
    
    # Reset to remote branch (force update)
    echo -e "${YELLOW}🔄 Resetting to latest remote code...${NC}"
    git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null
    
    # Clean untracked files
    git clean -fd
    
    # Show current commit
    echo -e "${GREEN}✅ Updated to commit: $(git log -1 --oneline)${NC}"
    
    if [ "$LOCAL_CHANGES_STASHED" = true ]; then
        echo -e "${YELLOW}💾 Local changes were stashed. To restore: git stash pop${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull${NC}"
fi

# Step 3: Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Step 4: Build new images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache app

# Step 5: Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Step 6: Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Step 7: Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# Step 8: Show logs
echo -e "${YELLOW}📋 Showing application logs (last 50 lines)...${NC}"
docker-compose -f "$COMPOSE_FILE" logs --tail=50 app

# Step 9: Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 5
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=100 app
    exit 1
fi

# Step 10: Display running containers
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Running containers:"
docker ps --filter "name=software_hub"

echo ""
echo -e "${GREEN}🎉 Software Hub is now running!${NC}"
echo ""
echo "Access the application at:"
echo "  - http://localhost:5000"
echo "  - http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "Useful commands:"
echo "  - View logs:    docker-compose -f $COMPOSE_FILE logs -f app"
echo "  - Stop app:     docker-compose -f $COMPOSE_FILE down"
echo "  - Restart app:  docker-compose -f $COMPOSE_FILE restart app"
echo "  - Check status: docker-compose -f $COMPOSE_FILE ps"
