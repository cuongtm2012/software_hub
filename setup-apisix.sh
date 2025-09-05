#!/bin/bash

# APISIX Setup and Configuration Script
# This script configures Apache APISIX with routes equivalent to the nginx setup

set -e

APISIX_ADMIN_URL="http://localhost:9180"
ADMIN_KEY="admin123456789"

echo "🚀 Configuring Apache APISIX API Gateway..."

# Wait for APISIX to be ready
echo "⏳ Waiting for APISIX to be ready..."
until curl -s "$APISIX_ADMIN_URL/apisix/admin/routes" -H "X-API-KEY: $ADMIN_KEY" > /dev/null 2>&1; do
    echo "Waiting for APISIX admin API..."
    sleep 2
done

echo "✅ APISIX is ready!"

# Function to create upstreams
create_upstream() {
    local name=$1
    local host=$2
    local port=$3
    
    echo "📡 Creating upstream: $name -> $host:$port"
    
    curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/upstreams/$name" \
        -H "X-API-KEY: $ADMIN_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"type\": \"roundrobin\",
            \"nodes\": {
                \"$host:$port\": 1
            },
            \"timeout\": {
                \"connect\": 10,
                \"send\": 60,
                \"read\": 60
            },
            \"retries\": 3,
            \"keepalive_pool\": {
                \"size\": 320,
                \"idle_timeout\": 60,
                \"requests\": 1000
            }
        }"
}

# Function to create routes
create_route() {
    local id=$1
    local name=$2
    local uri=$3
    local upstream=$4
    local plugins=$5
    
    echo "🛣️  Creating route: $name ($uri)"
    
    curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/routes/$id" \
        -H "X-API-KEY: $ADMIN_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"uri\": \"$uri\",
            \"upstream_id\": \"$upstream\",
            \"plugins\": $plugins,
            \"enable_websocket\": true
        }"
}

# Create upstreams for each service
create_upstream "main-app" "softwarehub-app" "5000"
create_upstream "email-service" "email-service" "3001"
create_upstream "chat-service" "chat-service" "3002"
create_upstream "notification-service" "notification-service" "3003"

echo ""
echo "🔧 Creating routes with rate limiting and load balancing..."

# Email Service Routes with rate limiting
create_route "1" "email-service" "/api/email/*" "email-service" '{
    "limit-req": {
        "rate": 2,
        "burst": 10,
        "rejected_code": 429,
        "nodelay": true
    },
    "proxy-rewrite": {
        "regex_uri": ["^/api/email/(.*)$", "/api/$1"]
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Notification Service Routes with rate limiting
create_route "2" "notification-service" "/api/notifications/*" "notification-service" '{
    "limit-req": {
        "rate": 5,
        "burst": 15,
        "rejected_code": 429,
        "nodelay": true
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Chat Service Routes with WebSocket support
create_route "3" "chat-service" "/api/chat/*" "chat-service" '{
    "proxy-rewrite": {
        "regex_uri": ["^/api/chat/(.*)$", "/api/chat/$1"]
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Authentication Routes with stricter rate limiting
create_route "4" "auth-routes" "/api/login" "main-app" '{
    "limit-req": {
        "rate": 0.083,
        "burst": 5,
        "rejected_code": 429,
        "nodelay": true
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

create_route "5" "auth-routes-register" "/api/register" "main-app" '{
    "limit-req": {
        "rate": 0.083,
        "burst": 5,
        "rejected_code": 429,
        "nodelay": true
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Admin Routes
create_route "6" "admin-routes" "/api/admin/*" "main-app" '{
    "limit-req": {
        "rate": 10,
        "burst": 20,
        "rejected_code": 429,
        "nodelay": true
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Socket.IO Routes for real-time features
create_route "7" "socket-io" "/socket.io/*" "main-app" '{
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# General API Routes (catch-all for remaining APIs)
create_route "8" "general-api" "/api/*" "main-app" '{
    "limit-req": {
        "rate": 10,
        "burst": 20,
        "rejected_code": 429,
        "nodelay": true
    },
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

# Health check routes
create_route "9" "health-email" "/health/email" "email-service" '{
    "proxy-rewrite": {
        "uri": "/health"
    }
}'

create_route "10" "health-notifications" "/health/notifications" "notification-service" '{
    "proxy-rewrite": {
        "uri": "/health"
    }
}'

create_route "11" "health-chat" "/health/chat" "chat-service" '{
    "proxy-rewrite": {
        "uri": "/health"
    }
}'

# Main health check
create_route "12" "health-main" "/health" "main-app" '{}'

# Static files with caching
create_route "13" "static-files" "/*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)" "main-app" '{
    "response-rewrite": {
        "headers": {
            "set": {
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff"
            }
        }
    }
}'

# Default route for frontend and remaining paths
create_route "14" "default-frontend" "/*" "main-app" '{
    "real-ip": {
        "source": "http_x_forwarded_for",
        "trusted_addresses": ["0.0.0.0/0"]
    }
}'

echo ""
echo "🔒 Adding global security plugins..."

# Add global security plugins
curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/global_rules/1" \
    -H "X-API-KEY: $ADMIN_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "plugins": {
            "response-rewrite": {
                "headers": {
                    "set": {
                        "X-Frame-Options": "SAMEORIGIN",
                        "X-Content-Type-Options": "nosniff",
                        "X-XSS-Protection": "1; mode=block",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    }
                }
            },
            "gzip": {
                "types": [
                    "text/plain",
                    "text/css",
                    "text/xml",
                    "text/javascript",
                    "application/javascript",
                    "application/json",
                    "application/xml",
                    "application/rss+xml",
                    "application/atom+xml",
                    "image/svg+xml"
                ],
                "min_length": 10240
            }
        }
    }'

echo ""
echo "📊 Enabling Prometheus metrics..."

# Enable Prometheus plugin globally for monitoring
curl -X PUT "$APISIX_ADMIN_URL/apisix/admin/global_rules/2" \
    -H "X-API-KEY: $ADMIN_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "plugins": {
            "prometheus": {
                "prefer_name": true
            }
        }
    }'

echo ""
echo "✅ APISIX Configuration Complete!"
echo ""
echo "🌐 Services Available:"
echo "   - Main Application: http://localhost (port 80)"
echo "   - APISIX Admin API: http://localhost:9180"
echo "   - APISIX Dashboard: http://localhost:9000"
echo "   - Prometheus Metrics: http://localhost:9091/apisix/prometheus/metrics"
echo ""
echo "🔐 Dashboard Login:"
echo "   - Username: admin"
echo "   - Password: admin123456"
echo ""
echo "📈 Test the routes:"
echo "   curl http://localhost/health"
echo "   curl http://localhost/api/notifications/test"
echo "   curl http://localhost/health/email"
echo ""