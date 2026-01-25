# Docker Deployment Guide

## 📦 Overview

This guide covers deploying the Software Hub application using Docker and Docker Compose.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80/443)           │
│         Reverse Proxy & SSL             │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────┐
│     App     │  │    Chat    │
│  (Port 3000)│  │(Port 3001) │
│   Node.js   │  │  WebSocket │
└──────┬──────┘  └─────┬──────┘
       │                │
       └───────┬────────┘
               │
        ┌──────▼──────┐
        │ PostgreSQL  │
        │ (Port 5432) │
        │   Database  │
        └─────────────┘
```

## 🚀 Quick Start

### 1. Setup VPS with Docker

```bash
# Upload setup script
scp scripts/setup-vps-docker.sh root@95.111.253.111:/tmp/

# SSH and run
ssh root@95.111.253.111
bash /tmp/setup-vps-docker.sh
```

### 2. Configure Environment

```bash
cd /var/www/software-hub

# Copy template
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

**Required variables:**
- `DB_PASSWORD`: Secure database password
- `SESSION_SECRET`: Random secret (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY`: Email service API key

### 3. Deploy

```bash
# Build and start containers
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

## 📋 Detailed Setup

### Prerequisites

- Ubuntu 20.04+ or Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 20GB+ disk space

### Installation Steps

#### Step 1: Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker
```

#### Step 2: Install Docker Compose

```bash
# Install Docker Compose plugin
apt install docker-compose-plugin

# Or install standalone
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### Step 3: Clone Repository

```bash
cd /var/www
git clone <your-repo-url> software-hub
cd software-hub
```

#### Step 4: Configure Environment

```bash
# Create .env.production
cp .env.production.template .env.production

# Generate secrets
echo "DB_PASSWORD=$(openssl rand -base64 32)" >> .env.production
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env.production

# Edit other variables
nano .env.production
```

#### Step 5: Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f app
```

## 🔄 Database Migration

### Migrate from Host PostgreSQL to Docker

```bash
# Run migration script
bash scripts/migrate-db-to-docker.sh software_hub software_hub_user
```

### Manual Migration

```bash
# 1. Backup existing database
pg_dump -U software_hub_user -d software_hub > backup.sql

# 2. Start Docker database
docker-compose -f docker-compose.production.yml up -d db

# 3. Wait for database to be ready
sleep 10

# 4. Restore backup
cat backup.sql | docker-compose -f docker-compose.production.yml exec -T db psql -U software_hub_user -d software_hub

# 5. Start all services
docker-compose -f docker-compose.production.yml up -d
```

## 🛠️ Management Commands

### Container Management

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Stop all services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart app

# View logs
docker-compose -f docker-compose.production.yml logs -f app

# Execute command in container
docker-compose -f docker-compose.production.yml exec app npm run db:migrate
```

### Database Management

```bash
# Access PostgreSQL
docker-compose -f docker-compose.production.yml exec db psql -U software_hub_user -d software_hub

# Backup database
docker-compose -f docker-compose.production.yml exec db pg_dump -U software_hub_user software_hub > backup-$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker-compose -f docker-compose.production.yml exec -T db psql -U software_hub_user -d software_hub
```

### Cleanup

```bash
# Remove stopped containers
docker-compose -f docker-compose.production.yml down

# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune

# Full cleanup
docker system prune -af
```

## 🔍 Monitoring

### Health Checks

```bash
# Check container health
docker-compose -f docker-compose.production.yml ps

# View container stats
docker stats

# Check specific service health
curl http://localhost:3000/api/health
```

### Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f app

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100 app
```

## 🔒 Security

### Best Practices

1. **Use secrets management**
```bash
# Don't commit .env.production
echo ".env.production" >> .gitignore
```

2. **Regular updates**
```bash
# Update images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

3. **Limit exposed ports**
```yaml
# In docker-compose.yml, only expose necessary ports
ports:
  - "127.0.0.1:5432:5432"  # Only localhost can access
```

4. **Use Docker secrets** (for Docker Swarm)
```bash
echo "my_secret_password" | docker secret create db_password -
```

## 🚨 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs app

# Check container status
docker-compose -f docker-compose.production.yml ps

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

### Database connection issues

```bash
# Check database is running
docker-compose -f docker-compose.production.yml ps db

# Test connection
docker-compose -f docker-compose.production.yml exec app ping db

# Check environment variables
docker-compose -f docker-compose.production.yml exec app env | grep DATABASE
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system df
docker system prune -af --volumes
```

### Port already in use

```bash
# Find process using port
lsof -i :3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Map to different host port
```

## 📊 Performance Optimization

### Resource Limits

```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Caching

```dockerfile
# In Dockerfile, optimize layer caching
COPY package*.json ./
RUN npm ci
COPY . .
```

## 🔄 CI/CD Integration

### GitHub Actions

The workflow is configured in `.github/workflows/deploy-docker.yml`

**Trigger deployment:**
1. Push to `main` branch
2. Or manually trigger from Actions tab

### Manual Deployment

```bash
# On VPS
cd /var/www/software-hub
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Check GitHub Issues
4. Contact support team

---

**Last Updated:** 2026-01-25  
**Docker Version:** 24.0+  
**Docker Compose Version:** 2.24+
