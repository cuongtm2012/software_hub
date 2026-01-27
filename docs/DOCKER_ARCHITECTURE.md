# 🏗️ Docker Architecture - Software Hub

## Overview

Software Hub sử dụng kiến trúc Docker multi-container với 3 services chính:

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │              │  │              │  │           │ │
│  │  PostgreSQL  │◄─┤     App      │◄─┤   Redis   │ │
│  │   Database   │  │   (Node.js)  │  │   Cache   │ │
│  │              │  │              │  │           │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│       :5432             :5000             :6379     │
└─────────────────────────────────────────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                    Persistent Volumes
```

## Services

### 1. PostgreSQL (Database)

**Image**: `postgres:16-alpine`  
**Port**: 5432  
**Volume**: `postgres_data:/var/lib/postgresql/data`

**Responsibilities**:
- Store application data
- User accounts
- Software catalog
- Reviews and ratings
- Transactions

**Health Check**:
```bash
pg_isready -U postgres
```

### 2. Redis (Cache)

**Image**: `redis:7-alpine`  
**Port**: 6379  
**Volume**: `redis_data:/data`

**Responsibilities**:
- Session storage
- Caching frequently accessed data
- Rate limiting
- Temporary data storage

**Health Check**:
```bash
redis-cli ping
```

### 3. Application (Node.js)

**Image**: Custom (built from `Dockerfile.prod`)  
**Port**: 5000  
**Volumes**: `uploads_data:/app/uploads`

**Responsibilities**:
- Serve web application
- API endpoints
- Business logic
- Authentication
- File uploads

**Health Check**:
```bash
curl -f http://localhost:5000/api/health
```

## Build Process

### Multi-Stage Build (Dockerfile.prod)

```
Stage 1: Dependencies
├── Install all npm packages
└── Prepare for build

Stage 2: Builder
├── Copy dependencies
├── Copy source code
├── Build client (Vite)
└── Build server (TypeScript)

Stage 3: Production
├── Install production dependencies only
├── Copy built files
├── Configure security (non-root user)
└── Set up health checks
```

**Benefits**:
- ✅ Smaller final image (~200MB vs ~1GB)
- ✅ No dev dependencies in production
- ✅ Faster deployment
- ✅ Better security

## Data Flow

### Request Flow

```
User Browser
    │
    ▼
App Container (Port 5000)
    │
    ├─► Static Files (HTML, CSS, JS)
    │
    ├─► API Routes
    │   │
    │   ├─► PostgreSQL (Data)
    │   │
    │   └─► Redis (Cache/Sessions)
    │
    └─► Response
```

### Build Flow

```
Source Code
    │
    ▼
npm run build
    │
    ├─► build:client (Vite)
    │   └─► dist/public/
    │
    └─► build:server (TypeScript)
        └─► dist/server/
```

## Networking

### Internal Network

Services communicate via Docker network:
- **postgres**: `postgres:5432`
- **redis**: `redis:6379`
- **app**: `app:5000`

### External Access

Only app port is exposed:
- **Host**: `localhost:5000`
- **Container**: `app:5000`

## Volumes

### Persistent Data

```yaml
volumes:
  postgres_data:     # Database files
  redis_data:        # Redis persistence
  uploads_data:      # User uploads
```

**Location**: `/var/lib/docker/volumes/`

### Backup Strategy

```bash
# Database
docker-compose exec postgres pg_dump > backup.sql

# Uploads
docker cp software_hub_app:/app/uploads ./uploads_backup
```

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/db
SESSION_SECRET=random_secret_key
NODE_ENV=production
```

### Optional

```bash
# OAuth
GOOGLE_CLIENT_ID=...
FACEBOOK_APP_ID=...

# Email
RESEND_API_KEY=...

# Storage
AWS_ACCESS_KEY_ID=...
```

## Security Features

### 1. Non-Root User

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### 2. Health Checks

All services have health checks:
- Automatic restart on failure
- Load balancer integration ready

### 3. Network Isolation

- Services in private network
- Only app port exposed
- Database not accessible from outside

### 4. Secret Management

- Environment variables
- No secrets in image
- .env.production not committed

## Resource Limits

### Recommended

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

### Monitoring

```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

## Scaling

### Horizontal Scaling

```bash
# Scale app instances
docker-compose up -d --scale app=3
```

**Note**: Requires:
- Load balancer (Nginx/HAProxy)
- Shared session store (Redis)
- Shared file storage (S3/GCS)

### Vertical Scaling

Increase resources in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

## Deployment Strategies

### 1. Blue-Green Deployment

```bash
# Deploy new version (green)
docker-compose -f docker-compose.prod.yml up -d --build

# Test green environment
curl http://localhost:5000/health

# Switch traffic (update load balancer)
# ...

# Remove old version (blue)
docker-compose -f docker-compose.old.yml down
```

### 2. Rolling Update

```bash
# Update one service at a time
docker-compose up -d --no-deps --build app
```

### 3. Canary Deployment

```bash
# Deploy to subset of users
docker-compose up -d --scale app=2
# Route 10% traffic to new version
# Monitor metrics
# Gradually increase traffic
```

## Monitoring & Logging

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last N lines
docker-compose logs --tail=100 app
```

### Metrics

```bash
# Resource usage
docker stats

# Container health
docker-compose ps
```

### External Tools

- **Logging**: LogDNA, Papertrail, ELK Stack
- **Monitoring**: Prometheus + Grafana
- **APM**: New Relic, Datadog
- **Errors**: Sentry

## Troubleshooting

### Common Issues

#### 1. Container Restart Loop

```bash
# Check logs
docker-compose logs app

# Common causes:
# - Database connection failed
# - Missing environment variables
# - Port already in use
```

#### 2. Database Connection Error

```bash
# Verify network
docker network inspect software_hub_network

# Check DATABASE_URL
# Must use service name: postgres:5432
# NOT localhost:5432
```

#### 3. Out of Disk Space

```bash
# Clean up
docker system prune -a --volumes

# Check usage
docker system df
```

## Best Practices

### Development

1. Use `Dockerfile` for dev (hot reload)
2. Mount source code as volume
3. Use docker-compose.yml

### Production

1. Use `Dockerfile.prod` (multi-stage)
2. No source code mounting
3. Use docker-compose.prod.yml
4. Enable health checks
5. Set resource limits
6. Use secrets management
7. Regular backups
8. Monitor logs and metrics

## Performance Optimization

### 1. Layer Caching

```dockerfile
# Copy package.json first
COPY package*.json ./
RUN npm ci

# Then copy source
COPY . .
```

### 2. .dockerignore

Exclude unnecessary files:
- node_modules
- .git
- tests
- documentation

### 3. Multi-Stage Build

Remove dev dependencies from final image.

### 4. Alpine Images

Use Alpine Linux for smaller images:
- `node:20-alpine`
- `postgres:16-alpine`
- `redis:7-alpine`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml push
      
      - name: Deploy
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## Disaster Recovery

### Backup

```bash
# Full backup
./deploy.sh
# Select option 6: Backup database

# Manual backup
docker-compose exec postgres pg_dump -U postgres software_hub > backup.sql
```

### Restore

```bash
# Restore database
docker-compose exec -T postgres psql -U postgres software_hub < backup.sql

# Restore uploads
docker cp uploads_backup software_hub_app:/app/uploads
```

### Recovery Plan

1. Stop services
2. Restore database from backup
3. Restore file uploads
4. Start services
5. Verify functionality

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Multi-Stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Last Updated**: 2026-01-25
