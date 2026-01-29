# 📋 Docker Deployment Checklist

## Pre-Deployment Checklist

### ✅ Files Created/Updated

- [x] `package.json` - Updated build scripts
  - `build:client`: Vite build
  - `build:server`: TypeScript compilation
  - `start`: Run compiled server
  
- [x] `tsconfig.server.json` - Server TypeScript config
  
- [x] `Dockerfile.prod` - Production multi-stage Dockerfile
  - Stage 1: Install dependencies
  - Stage 2: Build application
  - Stage 3: Production runtime
  
- [x] `docker-compose.prod.yml` - Production compose file
  - PostgreSQL service
  - Redis service
  - Application service
  
- [x] `.dockerignore` - Optimize build context
  
- [x] `.env.production.example` - Environment template
  
- [x] `deploy.sh` - Deployment automation script
  
- [x] `DOCKER_README.md` - Quick start guide

### 📝 Configuration Checklist

Before deploying, ensure you have:

#### 1. Environment Variables (.env.production)

```bash
# Required
- [ ] DATABASE_URL
- [ ] SESSION_SECRET
- [ ] NODE_ENV=production

# OAuth (if using)
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] FACEBOOK_APP_ID
- [ ] FACEBOOK_APP_SECRET

# Email (if using)
- [ ] RESEND_API_KEY

# Payment (if using)
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY

# Storage (if using)
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_S3_BUCKET
```

#### 2. System Requirements

- [ ] Docker installed (>= 20.10.0)
- [ ] Docker Compose installed (>= 2.0.0)
- [ ] At least 2GB RAM available
- [ ] At least 10GB disk space
- [ ] Ports 5000, 5432, 6379 available

#### 3. Security

- [ ] Strong database password set
- [ ] SESSION_SECRET is random and long (>32 chars)
- [ ] .env.production is in .gitignore
- [ ] OAuth callback URLs configured correctly
- [ ] Firewall rules configured (if applicable)

## Deployment Steps

### Step 1: Prepare Environment

```bash
# 1. Copy environment file
cp .env.production.example .env.production

# 2. Edit with your values
nano .env.production

# 3. Make deploy script executable
chmod +x deploy.sh
```

### Step 2: Build and Deploy

```bash
# Option A: Use automated script (Recommended)
./deploy.sh
# Select option 1: Build and start containers

# Option B: Manual deployment
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Step 3: Run Migrations

```bash
# Access app container
docker-compose -f docker-compose.prod.yml exec app sh

# Run database migrations
npm run db:push

# Exit container
exit
```

### Step 4: Verify Deployment

```bash
# 1. Check container status
docker-compose -f docker-compose.prod.yml ps

# All services should show "Up" and "healthy"

# 2. Check health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok",...}

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Should show "SoftwareHub application serving on port 5000"

# 4. Access application
# Open browser: http://localhost:5000
```

## Post-Deployment Checklist

- [ ] Health check returns 200 OK
- [ ] Can access homepage
- [ ] Can login/register
- [ ] Database connection working
- [ ] Static files loading correctly
- [ ] API endpoints responding
- [ ] Logs show no errors

## Monitoring

### Daily Checks

```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Resource usage
docker stats --no-stream

# Recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Weekly Tasks

- [ ] Review logs for errors
- [ ] Check disk usage
- [ ] Backup database
- [ ] Update Docker images

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres software_hub > backup_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_*.sql
```

## Troubleshooting

### Common Issues

#### 1. Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

#### 2. Database connection error

```bash
# Verify DATABASE_URL format
# Should be: postgresql://user:password@postgres:5432/database
# Note: Use 'postgres' as host (service name), not 'localhost'

# Check if postgres is running
docker-compose -f docker-compose.prod.yml ps postgres
```

#### 3. Build fails

```bash
# Clear cache and rebuild
docker builder prune -a
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 4. Out of memory

```bash
# Check memory usage
docker stats

# Increase memory limit in docker-compose.prod.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop new containers
docker-compose -f docker-compose.prod.yml down

# 2. Restore database backup (if needed)
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres software_hub < backup_YYYYMMDD.sql

# 3. Check out previous version
git checkout <previous-commit>

# 4. Rebuild and deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## Performance Optimization

### Recommended Settings

1. **Enable Redis for sessions**
   - Set `REDIS_URL` in .env.production
   - Uncomment Redis session store in server code

2. **Configure connection pooling**
   - Set appropriate `DATABASE_POOL_SIZE`

3. **Enable gzip compression**
   - Already configured in Express

4. **Set up CDN for static assets**
   - Configure AWS CloudFront or similar

## Security Hardening

- [ ] Use HTTPS in production (configure reverse proxy)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Enable helmet.js middleware
- [ ] Regular security updates

## Next Steps

After successful deployment:

1. **Set up monitoring**
   - Configure logging service (e.g., LogDNA, Papertrail)
   - Set up uptime monitoring (e.g., UptimeRobot)
   - Configure error tracking (e.g., Sentry)

2. **Configure CI/CD**
   - Set up GitHub Actions
   - Automate testing
   - Automate deployment

3. **Set up backups**
   - Automate database backups
   - Store backups off-site
   - Test restore procedure

4. **Configure domain**
   - Point domain to server
   - Set up SSL certificate
   - Configure reverse proxy (Nginx/Caddy)

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md) - Detailed guide

---

**Last Updated**: 2026-01-25
**Version**: 1.0.0
