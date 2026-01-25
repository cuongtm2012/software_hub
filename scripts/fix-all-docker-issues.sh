#!/bin/bash

# Complete Fix Script for All Docker Issues
# Run this on VPS to fix all problems

set -e

echo "=========================================="
echo "Complete Docker Fix - All Issues"
echo "=========================================="
echo ""

cd ~/Cuongtm2012/software_hub || exit 1

# 1. Fix Nginx mount issue
echo "1. Fixing Nginx mount issue..."
if [ -d "nginx/nginx.conf" ]; then
    echo "   Removing incorrect nginx.conf directory..."
    rm -rf nginx/nginx.conf
fi

# Create nginx directory and file if not exists
mkdir -p nginx/conf.d
if [ ! -f "nginx/nginx.conf" ]; then
    echo "   Creating nginx.conf file..."
    cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    keepalive_timeout 65;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF
fi

echo "   ✓ Nginx config fixed"
echo ""

# 2. Stop all containers
echo "2. Stopping all containers..."
docker-compose -f docker-compose.production.yml down
echo "   ✓ Containers stopped"
echo ""

# 3. Clean up Docker
echo "3. Cleaning up Docker..."
docker system prune -f
echo "   ✓ Docker cleaned"
echo ""

# 4. Pull latest code
echo "4. Pulling latest code..."
git pull origin main
echo "   ✓ Code updated"
echo ""

# 5. Ensure .env exists
echo "5. Checking environment file..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo "   ✓ Created .env from .env.production"
else
    echo "   ✓ .env exists"
fi
echo ""

# 6. Build images
echo "6. Building Docker images (this may take a while)..."
docker-compose -f docker-compose.production.yml build --no-cache
echo "   ✓ Images built"
echo ""

# 7. Start only essential services (db and app, skip nginx and chat for now)
echo "7. Starting essential services (db and app)..."
docker-compose -f docker-compose.production.yml up -d db app

echo "   Waiting for services to start..."
sleep 15

echo "   ✓ Services started"
echo ""

# 8. Check status
echo "8. Checking service status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# 9. Show logs
echo "9. Recent logs from app:"
docker-compose -f docker-compose.production.yml logs --tail=30 app
echo ""

# 10. Test
echo "10. Testing application..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✓ Application is responding!"
else
    echo "   ⚠ Application not responding yet. Check logs:"
    echo "   docker-compose -f docker-compose.production.yml logs -f app"
fi
echo ""

echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Services running:"
echo "  - Database: localhost:5432"
echo "  - Application: localhost:3000"
echo ""
echo "Next steps:"
echo "  1. Check logs: docker-compose -f docker-compose.production.yml logs -f app"
echo "  2. Test app: curl http://localhost:3000"
echo "  3. If working, start chat: docker-compose -f docker-compose.production.yml up -d chat-service"
echo ""
