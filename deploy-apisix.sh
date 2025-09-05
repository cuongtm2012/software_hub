#!/bin/bash

# Deploy Apache APISIX API Gateway
# This script handles the complete deployment and transition from nginx to APISIX

set -e

COMPOSE_FILE="docker-compose.apisix.yml"
PROJECT_NAME="softwarehub-apisix"

echo "🚀 Deploying Apache APISIX API Gateway for SoftwareHub"
echo "=================================================="

# Function to check if a service is healthy
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Checking health of $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps $service | grep -q "healthy\|Up"; then
            echo "✅ $service is healthy!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to become healthy after $max_attempts attempts"
    return 1
}

# Step 1: Stop existing nginx-based services
echo ""
echo "🛑 Stopping existing nginx-based services..."
if docker-compose ps nginx >/dev/null 2>&1; then
    docker-compose down nginx
    echo "✅ Stopped nginx service"
else
    echo "ℹ️  No nginx service running"
fi

# Step 2: Start APISIX infrastructure
echo ""
echo "🔧 Starting APISIX infrastructure..."
docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d etcd

# Wait for etcd to be ready
check_service_health "etcd"

# Step 3: Start APISIX and Dashboard
echo ""
echo "🌐 Starting APISIX Gateway and Dashboard..."
docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d apisix apisix-dashboard

# Wait for APISIX to be ready
check_service_health "apisix"

# Step 4: Start all other services
echo ""
echo "🔄 Starting all microservices..."
docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

# Wait for key services
echo ""
echo "⏳ Waiting for all services to be healthy..."
check_service_health "postgres"
check_service_health "redis"
check_service_health "email-service"
check_service_health "notification-service"
check_service_health "chat-service"
check_service_health "softwarehub-app"

# Step 5: Configure APISIX routes
echo ""
echo "⚙️  Configuring APISIX routes..."
sleep 10  # Give APISIX a moment to fully initialize

if ./setup-apisix.sh; then
    echo "✅ APISIX routes configured successfully!"
else
    echo "❌ Failed to configure APISIX routes. Check logs and try running ./setup-apisix.sh manually"
fi

# Step 6: Verify deployment
echo ""
echo "🔍 Verifying deployment..."

# Test main health endpoint
if curl -s http://localhost/health >/dev/null 2>&1; then
    echo "✅ Main application accessible through APISIX"
else
    echo "❌ Main application not accessible"
fi

# Test notification service
if curl -s http://localhost/health/notifications >/dev/null 2>&1; then
    echo "✅ Notification service accessible through APISIX"
else
    echo "❌ Notification service not accessible"
fi

# Test email service
if curl -s http://localhost/health/email >/dev/null 2>&1; then
    echo "✅ Email service accessible through APISIX"
else
    echo "❌ Email service not accessible"
fi

echo ""
echo "🎉 APISIX Deployment Complete!"
echo "================================"
echo ""
echo "🌐 Access Points:"
echo "   Main Application:     http://localhost"
echo "   APISIX Dashboard:     http://localhost:9000"
echo "   APISIX Admin API:     http://localhost:9180"
echo "   Prometheus Metrics:   http://localhost:9091/apisix/prometheus/metrics"
echo ""
echo "🔐 APISIX Dashboard Login:"
echo "   Username: admin"
echo "   Password: admin123456"
echo ""
echo "📊 Service Status:"
docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
echo ""
echo "📋 Next Steps:"
echo "1. Test your application: http://localhost"
echo "2. Monitor through dashboard: http://localhost:9000"
echo "3. Check Prometheus metrics: http://localhost:9091/apisix/prometheus/metrics"
echo "4. Update your application to use APISIX URLs if needed"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:           docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
echo "   Stop services:       docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
echo "   Restart APISIX:      docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart apisix"
echo "   Reconfigure routes:  ./setup-apisix.sh"
echo ""