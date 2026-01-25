#!/bin/bash

# Software Hub Deployment Script for VPS
# This script should be placed at /var/www/deploy.sh on the VPS

set -e

PROJECT_PATH="/var/www/software-hub"
LOG_FILE="/var/log/software-hub-deploy.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting deployment process..."

# Navigate to project directory
cd $PROJECT_PATH

# Load environment variables
if [ -f .env.production ]; then
    log "Loading environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Stop existing services
log "Stopping existing services..."

# Option 1: If using PM2
if command -v pm2 &> /dev/null; then
    log "Stopping PM2 processes..."
    pm2 stop all || true
fi

# Option 2: If using systemd
if systemctl is-active --quiet software-hub; then
    log "Stopping systemd service..."
    systemctl stop software-hub
fi

# Option 3: If using Docker
if [ -f docker-compose.yml ]; then
    log "Stopping Docker containers..."
    docker-compose down
fi

# Build and start services based on deployment method
log "Starting services..."

# Option 1: PM2 (Recommended for Node.js apps)
if command -v pm2 &> /dev/null; then
    log "Starting with PM2..."
    
    # Start main server
    pm2 start server/index.js --name "software-hub-server" --node-args="--max-old-space-size=2048"
    
    # Start microservices if needed
    if [ -d "services/email-service" ]; then
        pm2 start services/email-service/index.js --name "email-service"
    fi
    
    if [ -d "services/chat-service" ]; then
        pm2 start services/chat-service/index.js --name "chat-service"
    fi
    
    if [ -d "services/notification-service" ]; then
        pm2 start services/notification-service/index.js --name "notification-service"
    fi
    
    # Save PM2 configuration
    pm2 save
    
    log "PM2 processes started successfully"
fi

# Option 2: Systemd
if systemctl is-enabled --quiet software-hub 2>/dev/null; then
    log "Starting systemd service..."
    systemctl start software-hub
    systemctl status software-hub --no-pager
fi

# Option 3: Docker Compose
if [ -f docker-compose.yml ]; then
    log "Starting Docker containers..."
    docker-compose up -d --build
    docker-compose ps
fi

# Reload Nginx if it's being used as reverse proxy
if command -v nginx &> /dev/null; then
    log "Reloading Nginx..."
    nginx -t && systemctl reload nginx
fi

# Wait for services to be ready
log "Waiting for services to start..."
sleep 5

# Health check
log "Performing health check..."
if curl -f http://localhost:5000/api/health &> /dev/null; then
    log "✅ Health check passed!"
else
    log "⚠️  Health check failed - service may need manual intervention"
fi

log "Deployment completed!"

# Display running processes
if command -v pm2 &> /dev/null; then
    pm2 list
fi
