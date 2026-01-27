# 🐳 Docker Commands Cheat Sheet - Software Hub

## 📋 Quick Reference

### Essential Commands

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🚀 Deployment Commands

### Build & Start

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Build without cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Build and start in one command
docker-compose -f docker-compose.prod.yml up -d --build

# Start specific service
docker-compose -f docker-compose.prod.yml up -d app
```

### Stop & Remove

```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop

# Stop specific service
docker-compose -f docker-compose.prod.yml stop app

# Remove containers (keep volumes)
docker-compose -f docker-compose.prod.yml down

# Remove containers and volumes (⚠️ DELETES DATA)
docker-compose -f docker-compose.prod.yml down -v

# Remove containers, volumes, and images
docker-compose -f docker-compose.prod.yml down -v --rmi all
```

### Restart

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app

# Restart with rebuild
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📊 Monitoring Commands

### Logs

```bash
# View all logs (follow mode)
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis

# View last N lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app

# View logs since timestamp
docker-compose -f docker-compose.prod.yml logs --since 2026-01-25T10:00:00

# View logs without follow
docker-compose -f docker-compose.prod.yml logs app
```

### Status & Health

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check detailed status
docker-compose -f docker-compose.prod.yml ps -a

# Check resource usage
docker stats

# Check specific containers
docker stats software_hub_app software_hub_db software_hub_redis

# One-time stats
docker stats --no-stream

# Check health
curl http://localhost:5000/api/health
```

### Inspect

```bash
# Inspect service
docker-compose -f docker-compose.prod.yml config

# Inspect specific service
docker inspect software_hub_app

# Inspect network
docker network inspect software_hub_network

# Inspect volume
docker volume inspect software_hub_postgres_data
```

## 🔧 Maintenance Commands

### Database

```bash
# Access PostgreSQL shell
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres software_hub

# Run SQL file
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres software_hub < script.sql

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres software_hub > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres software_hub < backup.sql

# Check database size
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('software_hub'));"
```

### Redis

```bash
# Access Redis CLI
docker-compose -f docker-compose.prod.yml exec redis redis-cli

# Check Redis info
docker-compose -f docker-compose.prod.yml exec redis redis-cli INFO

# Flush all data (⚠️ DELETES ALL CACHE)
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL

# Get all keys
docker-compose -f docker-compose.prod.yml exec redis redis-cli KEYS '*'
```

### Application

```bash
# Access app container shell
docker-compose -f docker-compose.prod.yml exec app sh

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:push

# Check app environment
docker-compose -f docker-compose.prod.yml exec app env

# View app process
docker-compose -f docker-compose.prod.yml exec app ps aux
```

## 🗂️ Volume Commands

### List & Inspect

```bash
# List all volumes
docker volume ls

# List project volumes
docker volume ls | grep software_hub

# Inspect volume
docker volume inspect software_hub_postgres_data
docker volume inspect software_hub_redis_data
docker volume inspect software_hub_uploads_data
```

### Backup & Restore

```bash
# Backup volume
docker run --rm -v software_hub_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v software_hub_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data

# Copy files from volume
docker cp software_hub_app:/app/uploads ./uploads_backup

# Copy files to volume
docker cp ./uploads_backup software_hub_app:/app/uploads
```

### Clean Up

```bash
# Remove unused volumes
docker volume prune

# Remove specific volume (⚠️ DELETES DATA)
docker volume rm software_hub_postgres_data
```

## 🌐 Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect software_hub_network

# Check which containers are on network
docker network inspect software_hub_network | grep Name

# Remove network
docker network rm software_hub_network
```

## 🧹 Cleanup Commands

### Remove Containers

```bash
# Remove stopped containers
docker container prune

# Remove all containers
docker rm $(docker ps -a -q)

# Force remove running containers
docker rm -f $(docker ps -a -q)
```

### Remove Images

```bash
# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a

# Remove specific image
docker rmi software-hub:latest

# Remove all images
docker rmi $(docker images -q)
```

### System Cleanup

```bash
# Remove all unused data
docker system prune

# Remove all unused data including volumes (⚠️ DELETES DATA)
docker system prune -a --volumes

# Check disk usage
docker system df

# Detailed disk usage
docker system df -v
```

## 🔍 Debugging Commands

### Container Debugging

```bash
# View container processes
docker-compose -f docker-compose.prod.yml top

# View container changes
docker diff software_hub_app

# View container events
docker events

# View container port mapping
docker port software_hub_app
```

### Network Debugging

```bash
# Test network connectivity
docker-compose -f docker-compose.prod.yml exec app ping postgres
docker-compose -f docker-compose.prod.yml exec app ping redis

# Check DNS resolution
docker-compose -f docker-compose.prod.yml exec app nslookup postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec app nc -zv postgres 5432
```

### Performance Debugging

```bash
# Real-time stats
docker stats

# Container resource limits
docker inspect software_hub_app | grep -A 10 Resources

# Check container logs size
docker ps -s
```

## 📦 Image Commands

### Build

```bash
# Build image
docker build -f Dockerfile.prod -t software-hub:latest .

# Build without cache
docker build --no-cache -f Dockerfile.prod -t software-hub:latest .

# Build with build args
docker build --build-arg NODE_ENV=production -f Dockerfile.prod -t software-hub:latest .
```

### Tag & Push

```bash
# Tag image
docker tag software-hub:latest yourusername/software-hub:latest
docker tag software-hub:latest yourusername/software-hub:1.0.0

# Push to registry
docker push yourusername/software-hub:latest
docker push yourusername/software-hub:1.0.0

# Pull from registry
docker pull yourusername/software-hub:latest
```

### Inspect

```bash
# List images
docker images

# Inspect image
docker inspect software-hub:latest

# View image history
docker history software-hub:latest

# View image layers
docker history --no-trunc software-hub:latest
```

## 🔄 Update Commands

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Or rebuild specific service
docker-compose -f docker-compose.prod.yml up -d --build app
```

### Update Base Images

```bash
# Pull latest base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with latest base images
docker-compose -f docker-compose.prod.yml build --pull

# Restart with updated images
docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 Common Workflows

### Fresh Start

```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down

# Clean up
docker system prune -a

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build
```

### Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Backup Everything

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres software_hub > db_backup.sql

# Backup uploads
docker cp software_hub_app:/app/uploads ./uploads_backup

# Backup environment
cp .env.production .env.production.backup
```

### Restore Everything

```bash
# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres software_hub < db_backup.sql

# Restore uploads
docker cp ./uploads_backup software_hub_app:/app/uploads

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 🚨 Emergency Commands

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Try starting in foreground
docker-compose -f docker-compose.prod.yml up app

# Check configuration
docker-compose -f docker-compose.prod.yml config
```

### Database Issues

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres

# Access database shell
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres software_hub
```

### Out of Disk Space

```bash
# Check usage
docker system df

# Clean up
docker system prune -a

# Remove old images
docker image prune -a

# Remove old volumes (⚠️ CAREFUL)
docker volume prune
```

### Reset Everything (⚠️ NUCLEAR OPTION)

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down -v

# Remove all containers
docker rm -f $(docker ps -a -q)

# Remove all images
docker rmi -f $(docker images -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Remove all networks
docker network prune -f

# Start fresh
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📝 Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Docker Compose shortcuts
alias dcp='docker-compose -f docker-compose.prod.yml'
alias dcup='docker-compose -f docker-compose.prod.yml up -d'
alias dcdown='docker-compose -f docker-compose.prod.yml down'
alias dclogs='docker-compose -f docker-compose.prod.yml logs -f'
alias dcps='docker-compose -f docker-compose.prod.yml ps'
alias dcrestart='docker-compose -f docker-compose.prod.yml restart'

# Common tasks
alias dcbuild='docker-compose -f docker-compose.prod.yml build'
alias dcrebuild='docker-compose -f docker-compose.prod.yml up -d --build'
alias dcexec='docker-compose -f docker-compose.prod.yml exec'

# Usage:
# dcup          # Start services
# dclogs app    # View app logs
# dcexec app sh # Access app shell
```

---

**Tip**: Use `./deploy.sh` for an interactive menu of common tasks!
