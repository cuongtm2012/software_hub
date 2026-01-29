#!/bin/bash

# Software Hub - Docker Production Deployment Script
# This script helps you quickly deploy the application using Docker

set -e

echo "🚀 Software Hub - Docker Production Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from example...${NC}"
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}📝 Please edit .env.production with your actual values before continuing.${NC}"
        echo -e "${YELLOW}   Press Enter when ready...${NC}"
        read
    else
        echo -e "${RED}❌ .env.production.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Build and start containers"
echo "2) Stop containers"
echo "3) View logs"
echo "4) Restart containers"
echo "5) Remove containers and volumes (⚠️  DELETES DATA)"
echo "6) Backup database"
echo "7) Check container status"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🔨 Building Docker images...${NC}"
        docker-compose -f docker-compose.prod.yml build
        
        echo ""
        echo -e "${YELLOW}🚀 Starting containers...${NC}"
        docker-compose -f docker-compose.prod.yml up -d
        
        echo ""
        echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
        sleep 10
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "📊 Container status:"
        docker-compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "🌐 Application should be available at: http://localhost:5000"
        echo "🔍 Health check: http://localhost:5000/api/health"
        echo ""
        echo "📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🛑 Stopping containers...${NC}"
        docker-compose -f docker-compose.prod.yml down
        echo -e "${GREEN}✅ Containers stopped${NC}"
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}📋 Showing logs (Ctrl+C to exit)...${NC}"
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}🔄 Restarting containers...${NC}"
        docker-compose -f docker-compose.prod.yml restart
        echo -e "${GREEN}✅ Containers restarted${NC}"
        ;;
        
    5)
        echo ""
        echo -e "${RED}⚠️  WARNING: This will DELETE all data in the database!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}🗑️  Removing containers and volumes...${NC}"
            docker-compose -f docker-compose.prod.yml down -v
            echo -e "${GREEN}✅ Containers and volumes removed${NC}"
        else
            echo "Cancelled."
        fi
        ;;
        
    6)
        echo ""
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        echo -e "${YELLOW}💾 Creating database backup: $BACKUP_FILE${NC}"
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres software_hub > "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
        ;;
        
    7)
        echo ""
        echo "📊 Container status:"
        docker-compose -f docker-compose.prod.yml ps
        echo ""
        echo "💻 Resource usage:"
        docker stats --no-stream software_hub_app software_hub_db software_hub_redis 2>/dev/null || docker stats --no-stream
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
