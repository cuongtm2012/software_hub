# Apache APISIX API Gateway Deployment Guide

## Overview

This guide covers the deployment of Apache APISIX as a replacement for nginx in your SoftwareHub microservices architecture. APISIX provides enhanced features including:

- **Advanced Load Balancing**: Multiple algorithms (round-robin, least-conn, consistent hash)
- **Real-time Route Management**: Dynamic route updates without restarts
- **Rich Plugin Ecosystem**: 80+ plugins for security, monitoring, and traffic management
- **Built-in Monitoring**: Prometheus metrics and comprehensive dashboard
- **WebSocket Support**: Native WebSocket proxying for real-time features
- **Better Rate Limiting**: More granular and flexible rate limiting options

## Architecture

```
Internet → APISIX (Port 80) → Microservices
                ↓
         APISIX Dashboard (Port 9000)
                ↓
         Admin API (Port 9180)
                ↓
         Prometheus Metrics (Port 9091)
```

## Quick Start

### 1. Deploy APISIX

```bash
# Run the automated deployment script
./deploy-apisix.sh
```

This script will:
- Stop existing nginx services
- Start etcd for configuration storage
- Deploy APISIX and dashboard
- Configure all routes and plugins
- Verify the deployment

### 2. Manual Deployment (Alternative)

```bash
# Start services
docker-compose -f docker-compose.apisix.yml up -d

# Wait for services to be healthy
docker-compose -f docker-compose.apisix.yml ps

# Configure routes
./setup-apisix.sh
```

## Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Main Application | http://localhost | Frontend and main APIs |
| APISIX Dashboard | http://localhost:9000 | Web management interface |
| APISIX Admin API | http://localhost:9180 | REST API for configuration |
| Prometheus Metrics | http://localhost:9091/apisix/prometheus/metrics | Monitoring data |

## Route Configuration

### Microservice Routes

1. **Email Service**: `/api/email/*` → `email-service:3001`
   - Rate limit: 2 req/s, burst 10
   - Path rewrite: `/api/email/send` → `/api/send`

2. **Notification Service**: `/api/notifications/*` → `notification-service:3003`
   - Rate limit: 5 req/s, burst 15
   - Direct path mapping

3. **Chat Service**: `/api/chat/*` → `chat-service:3002`
   - WebSocket support enabled
   - No rate limiting for real-time features

4. **Authentication**: `/api/login`, `/api/register` → `main-app:5000`
   - Strict rate limit: 5 req/5min

### Health Check Routes

- `/health` → Main application health
- `/health/email` → Email service health
- `/health/notifications` → Notification service health
- `/health/chat` → Chat service health

## Dashboard Usage

### Accessing the Dashboard

1. Open http://localhost:9000
2. Login with:
   - **Username**: admin
   - **Password**: admin123456

### Key Features

- **Routes**: View and manage all routes
- **Upstreams**: Configure backend services
- **Plugins**: Enable/disable and configure plugins
- **Consumers**: Manage API consumers and authentication
- **Certificates**: SSL certificate management

## Rate Limiting Configuration

APISIX uses the `limit-req` plugin for rate limiting:

```json
{
  "limit-req": {
    "rate": 10,           // Requests per second
    "burst": 20,          // Burst capacity
    "rejected_code": 429, // HTTP status for rejected requests
    "nodelay": true       // Process burst requests immediately
  }
}
```

Current limits:
- **Email APIs**: 2 req/s, burst 10
- **Notifications**: 5 req/s, burst 15  
- **Authentication**: 5 req/5min, burst 5
- **General APIs**: 10 req/s, burst 20

## Load Balancing

APISIX supports multiple load balancing algorithms:

- **Round Robin** (default): Distributes requests evenly
- **Least Connections**: Routes to server with fewest active connections
- **Consistent Hash**: Routes based on client IP or other criteria
- **Weighted Round Robin**: Routes based on server weights

## Security Features

### Global Security Headers

All responses include:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Available Security Plugins

- **JWT Authentication**: `jwt-auth`
- **Key Authentication**: `key-auth`
- **Basic Authentication**: `basic-auth`
- **IP Restrictions**: `ip-restriction`
- **CORS**: `cors`
- **Request Validation**: `request-validation`

## Monitoring and Observability

### Prometheus Metrics

Access metrics at: http://localhost:9091/apisix/prometheus/metrics

Key metrics:
- Request count and latency
- Error rates by route
- Upstream health status
- Rate limiting statistics

### Logging

APISIX logs are available through Docker:

```bash
# View APISIX logs
docker-compose -f docker-compose.apisix.yml logs -f apisix

# View all service logs
docker-compose -f docker-compose.apisix.yml logs -f
```

## Management Commands

### Route Management

```bash
# List all routes
curl -H "X-API-KEY: admin123456789" http://localhost:9180/apisix/admin/routes

# Get specific route
curl -H "X-API-KEY: admin123456789" http://localhost:9180/apisix/admin/routes/1

# Update route
curl -X PUT -H "X-API-KEY: admin123456789" -H "Content-Type: application/json" \
  -d '{"uri": "/api/test/*", "upstream_id": "main-app"}' \
  http://localhost:9180/apisix/admin/routes/15
```

### Plugin Management

```bash
# List available plugins
curl -H "X-API-KEY: admin123456789" http://localhost:9180/apisix/admin/plugins/list

# Check plugin status
curl -H "X-API-KEY: admin123456789" http://localhost:9180/apisix/admin/plugins/prometheus
```

## Troubleshooting

### Common Issues

1. **APISIX not starting**
   ```bash
   # Check etcd status
   docker-compose -f docker-compose.apisix.yml logs etcd
   
   # Restart APISIX
   docker-compose -f docker-compose.apisix.yml restart apisix
   ```

2. **Routes not working**
   ```bash
   # Reconfigure routes
   ./setup-apisix.sh
   
   # Check route configuration
   curl -H "X-API-KEY: admin123456789" http://localhost:9180/apisix/admin/routes
   ```

3. **Dashboard access issues**
   ```bash
   # Check dashboard logs
   docker-compose -f docker-compose.apisix.yml logs apisix-dashboard
   
   # Restart dashboard
   docker-compose -f docker-compose.apisix.yml restart apisix-dashboard
   ```

### Health Checks

```bash
# Test main gateway
curl http://localhost/health

# Test specific services
curl http://localhost/health/email
curl http://localhost/health/notifications
curl http://localhost/health/chat

# Test APISIX status
curl http://localhost:9080/apisix/status
```

## Migration from nginx

### Differences from nginx

| Feature | nginx | APISIX |
|---------|--------|--------|
| Configuration | Static files | Dynamic via API |
| Reload | Requires restart | Hot reload |
| Plugins | Limited | 80+ built-in plugins |
| Dashboard | Third-party | Built-in web UI |
| Monitoring | Basic logs | Prometheus + Dashboard |
| Rate Limiting | Basic | Advanced with multiple algorithms |

### Updated Environment Variables

In your main application, these URLs now point to APISIX:

```env
EMAIL_SERVICE_URL=http://apisix:9080
CHAT_SERVICE_URL=http://apisix:9080
NOTIFICATION_SERVICE_URL=http://apisix:9080
NGINX_URL=http://apisix:9080
```

## Performance Tuning

### Connection Pooling

```yaml
keepalive_pool:
  size: 320          # Pool size
  idle_timeout: 60   # Idle timeout in seconds
  requests: 1000     # Max requests per connection
```

### Timeout Configuration

```yaml
timeout:
  connect: 10    # Connection timeout
  send: 60       # Send timeout  
  read: 60       # Read timeout
```

## Production Deployment

### Security Hardening

1. Change default admin key:
   ```yaml
   admin_key:
     - name: "admin"
       key: "your-secure-random-key"  # Use a strong random key
       role: admin
   ```

2. Restrict dashboard access:
   ```yaml
   allow_list:
     - 10.0.0.0/8      # Internal network only
     - 172.16.0.0/12
     - 192.168.0.0/16
   ```

3. Enable HTTPS:
   ```yaml
   ssl:
     enable: true
     ssl_protocols: TLSv1.2 TLSv1.3
   ```

### Scaling Considerations

- Use external etcd cluster for high availability
- Deploy multiple APISIX instances behind a load balancer
- Configure proper resource limits in Docker/Kubernetes
- Set up monitoring and alerting for all components

## Support

- **Apache APISIX Documentation**: https://apisix.apache.org/docs/
- **GitHub Repository**: https://github.com/apache/apisix
- **Community**: https://apisix.apache.org/community/

---

This deployment provides a robust, scalable API Gateway solution that enhances your microservices architecture with advanced routing, monitoring, and management capabilities.