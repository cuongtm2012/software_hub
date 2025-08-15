# SoftwareHub Docker Deployment Guide

## Overview

SoftwareHub uses a comprehensive microservices architecture deployed with Docker containers. This guide covers everything you need to know about deploying, managing, and scaling the SoftwareHub platform using Docker.

## Architecture

### Microservices Structure

```
SoftwareHub Platform
├── Main Application (Port 5000) - Core web application
├── Email Service (Port 3001) - SendGrid email processing
├── Chat Service (Port 3002) - Real-time messaging with Socket.IO
├── Notification Service (Port 3003) - Firebase push notifications
├── Worker Service (Port 3004) - Background job processing
├── PostgreSQL Database (Port 5432) - Primary data storage
├── Redis Cache (Port 6379) - Caching and message queues
├── MongoDB (Port 27017) - Chat history storage
└── Nginx Load Balancer (Port 80/443) - Reverse proxy
```

### Container Security Features

- **Multi-stage builds** for optimized production images
- **Non-root users** for all application containers
- **Health checks** for automatic container recovery
- **Resource limits** and restart policies
- **Network isolation** with custom Docker networks

## Quick Start

### Prerequisites

- Docker 20.10+ and Docker Compose V2
- 8GB+ RAM and 20GB+ disk space
- Valid API keys for external services

### 1. Environment Setup

```bash
# Copy environment template
cp .env.docker .env

# Edit with your configuration
nano .env
```

### 2. Deploy Production Stack

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy full production stack
./scripts/docker-deploy.sh
```

### 3. Development Environment

```bash
# Start development environment with hot reloading
./scripts/docker-dev.sh
```

## Environment Configuration

### Required Environment Variables

#### Database Configuration
```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/softwarehub
REDIS_URL=redis://redis:6379
MONGODB_URL=mongodb://mongo:27017/softwarehub-chat
```

#### External Services
```env
# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=verified@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_ENDPOINT=https://account.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=your_bucket_name
```

## Deployment Scripts

### Production Deployment

```bash
./scripts/docker-deploy.sh
```

**Features:**
- Builds optimized production images
- Performs health checks
- Shows deployment summary
- Comprehensive error handling

### Development Environment

```bash
./scripts/docker-dev.sh
```

**Features:**
- Hot reloading for all services
- Volume mounts for real-time development
- Debug mode enabled
- Development-specific configurations

### Cleanup Operations

```bash
./scripts/docker-clean.sh
```

**Options:**
1. Stop containers only
2. Stop and remove containers
3. Remove containers and images
4. Full cleanup (destroys all data)
5. System cleanup (remove unused resources)

## Manual Container Management

### Build Individual Services

```bash
# Main application
docker build -t softwarehub-app:latest .

# Email service
docker build -t softwarehub-email:latest ./services/email-service

# Chat service
docker build -t softwarehub-chat:latest ./services/chat-service

# Notification service
docker build -t softwarehub-notification:latest ./services/notification-service

# Worker service
docker build -t softwarehub-worker:latest ./services/worker-service
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d softwarehub-app

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart email-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f softwarehub-app

# Last 100 lines
docker-compose logs --tail=100 chat-service
```

### Health Monitoring

```bash
# Check service status
docker-compose ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' softwarehub-main

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' softwarehub-main
```

## Database Management

### Data Persistence

All database data is stored in Docker volumes:
- `postgres_data` - PostgreSQL data
- `redis_data` - Redis cache data
- `mongo_data` - MongoDB chat history

### Database Initialization

The PostgreSQL container automatically imports data from `shared/data-dumps/` on first startup.

### Backup Operations

```bash
# PostgreSQL backup
docker exec softwarehub-postgres pg_dump -U postgres softwarehub > backup.sql

# Redis backup
docker exec softwarehub-redis redis-cli BGSAVE

# MongoDB backup
docker exec softwarehub-mongo mongodump --db softwarehub-chat --out /backup
```

### Restore Operations

```bash
# PostgreSQL restore
docker exec -i softwarehub-postgres psql -U postgres softwarehub < backup.sql

# MongoDB restore
docker exec softwarehub-mongo mongorestore --db softwarehub-chat /backup/softwarehub-chat
```

## Scaling and Load Balancing

### Horizontal Scaling

```bash
# Scale specific services
docker-compose up -d --scale email-service=3
docker-compose up -d --scale worker-service=2
```

### Nginx Load Balancer

The included nginx.conf provides:
- SSL termination
- Load balancing across service instances
- Static file serving
- Rate limiting
- Security headers

### Resource Limits

Add to docker-compose.yml for production:

```yaml
services:
  softwarehub-app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Monitoring and Debugging

### Container Metrics

```bash
# Resource usage
docker stats

# Container inspection
docker inspect softwarehub-main

# Process list
docker exec softwarehub-app ps aux
```

### Application Debugging

```bash
# Enter container shell
docker exec -it softwarehub-main sh

# View environment variables
docker exec softwarehub-main env

# Test service connectivity
docker exec softwarehub-main curl http://email-service:3001/health
```

### Log Analysis

```bash
# Error logs only
docker-compose logs | grep ERROR

# Service-specific errors
docker-compose logs email-service | grep -i error

# Real-time monitoring
docker-compose logs -f --tail=0 | grep -i "error\|warning"
```

## Security Best Practices

### Container Security

1. **Non-root users** - All containers run as non-root users
2. **Minimal base images** - Using Alpine Linux for smaller attack surface
3. **Health checks** - Automatic container restart on failure
4. **Network isolation** - Services communicate only through defined networks

### Environment Security

```bash
# Set proper file permissions
chmod 600 .env

# Use Docker secrets for production
docker secret create sendgrid_key /path/to/sendgrid_key.txt
```

### Production Hardening

1. **Use specific image tags** instead of `latest`
2. **Implement resource limits** for all containers
3. **Enable Docker Content Trust** for image verification
4. **Regular security updates** for base images
5. **Network segmentation** with custom networks

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Verify environment variables
docker exec service-name env

# Test health endpoint
curl http://localhost:port/health
```

#### Database Connection Issues
```bash
# Test PostgreSQL connection
docker exec softwarehub-postgres pg_isready -U postgres

# Test Redis connection
docker exec softwarehub-redis redis-cli ping

# Test MongoDB connection
docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')"
```

#### Memory/CPU Issues
```bash
# Check resource usage
docker stats --no-stream

# Increase memory limits
# Edit docker-compose.yml mem_limit values
```

### Performance Optimization

#### Image Optimization
- Use multi-stage builds
- Minimize layers in Dockerfiles
- Use .dockerignore files
- Cache npm/pip dependencies

#### Runtime Optimization
- Set appropriate memory limits
- Use volume mounts for development
- Enable container restart policies
- Implement proper logging levels

## Migration Guide

### From Development to Production

1. **Update environment variables** for production services
2. **Configure SSL certificates** for HTTPS
3. **Set up monitoring** and log aggregation
4. **Implement backup strategies** for data persistence
5. **Configure load balancing** for high availability

### Database Migrations

```bash
# Run database migrations
docker exec softwarehub-main npm run db:push

# Seed production data
docker exec softwarehub-main npm run db:seed
```

## Support and Maintenance

### Regular Maintenance Tasks

```bash
# Update base images
docker-compose pull

# Rebuild with latest code
docker-compose build --no-cache

# Clean unused resources
docker system prune -f

# Update containers
docker-compose up -d --build
```

### Health Monitoring

Set up monitoring for:
- Container health status
- Resource utilization
- Application metrics
- Database performance
- External service connectivity

## Appendix

### Docker Compose Reference

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development overrides
- `.env.docker` - Environment template

### Script Reference

- `scripts/docker-deploy.sh` - Production deployment
- `scripts/docker-dev.sh` - Development environment
- `scripts/docker-clean.sh` - Cleanup operations

### Port Mapping

| Service | Container Port | Host Port | Description |
|---------|---------------|-----------|-------------|
| Main App | 5000 | 5000 | Web application |
| Email Service | 3001 | 3001 | Email processing |
| Chat Service | 3002 | 3002 | Real-time messaging |
| Notification | 3003 | 3003 | Push notifications |
| Worker Service | 3004 | 3004 | Background jobs |
| PostgreSQL | 5432 | 5432 | Primary database |
| Redis | 6379 | 6379 | Cache & queues |
| MongoDB | 27017 | 27017 | Chat history |
| Nginx | 80/443 | 80/443 | Load balancer |

For additional support and advanced configurations, refer to the individual service documentation in the `services/` directory.