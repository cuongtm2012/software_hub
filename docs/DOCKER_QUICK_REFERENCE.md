# 🐳 Docker Quick Reference

## 🚀 Quick Start

```bash
# 1. Setup VPS with Docker
bash scripts/setup-vps-docker.sh

# 2. Configure environment
cp .env.production.template .env.production
nano .env.production

# 3. Deploy
make deploy
```

## 📋 Common Commands

### Using Makefile (Recommended)

```bash
make help          # Show all available commands
make build         # Build images
make up            # Start services
make down          # Stop services
make restart       # Restart services
make logs          # View logs
make ps            # Show containers
make migrate       # Run migrations
make backup        # Backup database
make deploy        # Full deployment
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Stop services
docker-compose -f docker-compose.production.yml down

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart specific service
docker-compose -f docker-compose.production.yml restart app

# Execute command
docker-compose -f docker-compose.production.yml exec app npm run db:migrate
```

## 🔧 Management

### View Logs

```bash
# All services
make logs

# Specific service
make logs SERVICE=app
make logs SERVICE=db

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100 app
```

### Database Operations

```bash
# Backup
make backup

# Restore
make restore BACKUP=backups/backup-20240125.sql

# Access PostgreSQL
make shell-db

# Run migrations
make migrate
```

### Container Access

```bash
# App container shell
make shell-app

# Database shell
make shell-db

# Execute command
docker-compose -f docker-compose.production.yml exec app npm run <command>
```

## 🔍 Monitoring

```bash
# Container status
make ps

# Resource usage
make stats

# Health check
make health

# Detailed logs
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

## 🛠️ Troubleshooting

### Container won't start

```bash
# Check logs
make logs SERVICE=app

# Rebuild
make build
make up

# Check configuration
docker-compose -f docker-compose.production.yml config
```

### Database issues

```bash
# Check database logs
make logs SERVICE=db

# Test connection
docker-compose -f docker-compose.production.yml exec app ping db

# Reset database (CAREFUL!)
docker-compose -f docker-compose.production.yml down -v
make up
```

### Out of disk space

```bash
# Check usage
docker system df

# Clean up
docker system prune -af
docker volume prune
```

## 🔄 Deployment

### Manual Deployment

```bash
cd /var/www/software-hub
git pull origin main
make deploy
```

### Via GitHub Actions

Push to `main` branch or trigger manually from Actions tab.

## 📊 File Structure

```
software_hub/
├── Dockerfile.production          # Production Dockerfile
├── docker-compose.production.yml  # Docker Compose config
├── .env.production               # Environment variables
├── .dockerignore                 # Docker ignore file
├── Makefile                      # Management commands
├── nginx/
│   └── conf.d/
│       └── default.conf         # Nginx config
└── scripts/
    ├── setup-vps-docker.sh      # VPS setup
    └── migrate-db-to-docker.sh  # DB migration
```

## 🔑 Important Paths

| Item | Path |
|------|------|
| Project | `/var/www/software-hub` |
| Environment | `.env.production` |
| Logs | `./logs/` |
| Uploads | `./uploads/` |
| Backups | `./backups/` |
| Database Volume | `software-hub-postgres-data` |

## 🌐 Ports

| Service | Internal | External |
|---------|----------|----------|
| App | 3000 | 3000 |
| Chat | 3001 | 3001 |
| Database | 5432 | 5432 |
| Nginx | 80/443 | 80/443 |

## 🔒 Security Checklist

- [ ] Change default passwords in `.env.production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Limit database port exposure (127.0.0.1:5432)
- [ ] Setup SSL/TLS with Nginx
- [ ] Regular backups
- [ ] Update Docker images regularly
- [ ] Monitor logs for suspicious activity

## 📚 Documentation

- [Full Docker Guide](./DOCKER_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [GitHub Actions Setup](./GITHUB_ACTIONS_SETUP.md)

---

**VPS:** 95.111.253.111  
**User:** root  
**Project:** /var/www/software-hub
