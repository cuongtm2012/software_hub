# SoftwareHub Docker Deployment

## Quick Start

### 1. Setup Environment
```bash
# Copy environment template
cp .env.docker .env

# Edit with your actual API keys
nano .env
```

### 2. Deploy Production
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy entire stack
./scripts/docker-deploy.sh
```

### 3. Development Environment
```bash
# Start with hot reloading
./scripts/docker-dev.sh
```

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Main App | 5000 | SoftwareHub web application |
| Email | 3001 | SendGrid email processing |
| Chat | 3002 | Real-time messaging |
| Notifications | 3003 | Firebase push notifications |
| Worker | 3004 | Background job processing |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & message queues |
| MongoDB | 27017 | Chat history storage |

## Management Commands

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Full cleanup
./scripts/docker-clean.sh
```

## Health Checks

All services include health endpoints:
- Main App: `http://localhost:5000/api/health`
- Email: `http://localhost:3001/health`
- Chat: `http://localhost:3002/health`
- Notifications: `http://localhost:3003/health`
- Worker: `http://localhost:3004/health`

## Data Persistence

Database data is automatically persisted in Docker volumes:
- `postgres_data` - PostgreSQL database
- `redis_data` - Redis cache
- `mongo_data` - MongoDB chat history

## Architecture Features

✅ **Security**: Non-root users, health monitoring  
✅ **Scalability**: Microservices architecture  
✅ **Development**: Hot reloading, volume mounts  
✅ **Production**: Optimized builds, restart policies  
✅ **Monitoring**: Health checks, comprehensive logging  

For detailed documentation, see [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md).