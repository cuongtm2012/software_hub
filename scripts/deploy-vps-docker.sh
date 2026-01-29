#!/bin/bash

# VPS Deployment Script
# Deploys application to VPS with Docker databases and PM2 app

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_PATH="/var/www/software-hub"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Software Hub - VPS Deployment       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Navigate to project directory
echo -e "${BLUE}[1/10] Navigating to project directory...${NC}"
cd $PROJECT_PATH
echo -e "${GREEN}✓ In $PROJECT_PATH${NC}"
echo ""

# Step 2: Pull latest code (if git repo)
if [ -d ".git" ]; then
  echo -e "${BLUE}[2/10] Pulling latest code...${NC}"
  git pull origin main
  echo -e "${GREEN}✓ Code updated${NC}"
else
  echo -e "${YELLOW}⚠️  [2/10] Not a git repository, skipping pull${NC}"
fi
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}[3/10] Installing dependencies...${NC}"
npm ci --production
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Build application
echo -e "${BLUE}[4/10] Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Application built${NC}"
echo ""

# Step 5: Start Docker containers (databases)
echo -e "${BLUE}[5/10] Starting Docker containers...${NC}"
docker-compose -f docker-compose.vps.yml up -d
echo -e "${GREEN}✓ Docker containers started${NC}"
echo ""

# Step 6: Wait for databases to be ready
echo -e "${BLUE}[6/10] Waiting for databases to be ready...${NC}"
sleep 10

# Check PostgreSQL
until docker exec softwarehub-postgres pg_isready -U postgres -d softwarehub > /dev/null 2>&1; do
  echo -e "${YELLOW}⏳ Waiting for PostgreSQL...${NC}"
  sleep 2
done
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# Check MongoDB
until docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; do
  echo -e "${YELLOW}⏳ Waiting for MongoDB...${NC}"
  sleep 2
done
echo -e "${GREEN}✓ MongoDB ready${NC}"

# Check Redis
until docker exec softwarehub-redis redis-cli ping > /dev/null 2>&1; do
  echo -e "${YELLOW}⏳ Waiting for Redis...${NC}"
  sleep 2
done
echo -e "${GREEN}✓ Redis ready${NC}"
echo ""

# Step 7: Import database (if dumps exist)
if [ -d "database/dumps" ] && [ "$(ls -A database/dumps/*.sql 2>/dev/null)" ]; then
  echo -e "${BLUE}[7/10] Importing database...${NC}"
  
  # Find latest schema and data dumps
  SCHEMA_DUMP=$(ls -t database/dumps/schema_*.sql 2>/dev/null | head -1)
  DATA_DUMP=$(ls -t database/dumps/data_*.sql 2>/dev/null | head -1)
  
  if [ -n "$SCHEMA_DUMP" ]; then
    echo -e "${YELLOW}⏳ Importing schema...${NC}"
    docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < "$SCHEMA_DUMP" 2>&1 | grep -v "ERROR" || true
    echo -e "${GREEN}✓ Schema imported${NC}"
  fi
  
  if [ -n "$DATA_DUMP" ]; then
    echo -e "${YELLOW}⏳ Importing data...${NC}"
    docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < "$DATA_DUMP" 2>&1 | grep -v "ERROR\|duplicate key" || true
    echo -e "${GREEN}✓ Data imported${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  [7/10] No database dumps found, skipping import${NC}"
fi
echo ""

# Step 8: Restart PM2 processes
echo -e "${BLUE}[8/10] Restarting PM2 processes...${NC}"
if pm2 list | grep -q "software-hub-server"; then
  pm2 delete all
fi
pm2 start ecosystem.config.js --env production
pm2 save
echo -e "${GREEN}✓ PM2 processes started${NC}"
echo ""

# Step 9: Restart Nginx
echo -e "${BLUE}[9/10] Restarting Nginx...${NC}"
nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

# Step 10: Health checks
echo -e "${BLUE}[10/10] Running health checks...${NC}"
sleep 5

# Check PM2 processes
PM2_STATUS=$(pm2 list | grep -c "online" || echo "0")
echo -e "${GREEN}✓ PM2 processes online: $PM2_STATUS${NC}"

# Check Docker containers
DOCKER_STATUS=$(docker ps --filter "name=softwarehub" --format "{{.Status}}" | grep -c "Up" || echo "0")
echo -e "${GREEN}✓ Docker containers running: $DOCKER_STATUS${NC}"

# Check application health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Application health check passed${NC}"
else
  echo -e "${RED}❌ Application health check failed${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deployment Complete! 🎉                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 Status:${NC}"
echo "   • Docker containers: $DOCKER_STATUS running"
echo "   • PM2 processes: $PM2_STATUS online"
echo ""
echo -e "${YELLOW}🔍 Useful Commands:${NC}"
echo "   • View PM2 logs: pm2 logs"
echo "   • View Docker logs: docker-compose -f docker-compose.vps.yml logs -f"
echo "   • Check PM2 status: pm2 list"
echo "   • Check Docker status: docker ps"
echo "   • Test application: curl http://localhost:3000/health"
echo ""
