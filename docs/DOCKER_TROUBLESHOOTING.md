# 🔧 Docker Deployment - Complete Troubleshooting Guide

## 🎯 Quick Fix (Run This First)

```bash
# On VPS SSH terminal
cd ~/Cuongtm2012/software_hub
git pull origin main
bash scripts/deploy-complete.sh
```

This single script will fix ALL common issues automatically.

---

## 📋 Common Issues & Solutions

### 1. ❌ Port Conflict: `address already in use`

**Problem:** PostgreSQL on host is using port 5432

**Solution A: Stop host PostgreSQL (Recommended)**
```bash
sudo systemctl stop postgresql
sudo systemctl disable postgresql
```

**Solution B: Use different port**
```bash
# Edit docker-compose.production.yml
# Change: "5432:5432" to "5433:5432"
sed -i 's/5432:5432/5433:5432/' docker-compose.production.yml
```

---

### 2. ❌ Environment Variables Not Set

**Problem:** 
```
WARN[0000] The "DB_PASSWORD" variable is not set
```

**Solution:**
```bash
# Quick fix
bash scripts/quick-fix-env.sh

# Or manual
nano .env.production
# Add:
DB_PASSWORD=your_secure_password_here
SESSION_SECRET=your_secret_here
```

**Important:** Ensure these variables are set:
- `DB_PASSWORD` - Database password
- `SESSION_SECRET` - Session secret
- `DB_NAME` - Database name
- `DB_USER` - Database user

---

### 3. ❌ Wrong DB_HOST Configuration

**Problem:** App can't connect to database

**Solution:** In `.env.production`, use service name:
```bash
# ❌ Wrong
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# ✅ Correct
DATABASE_URL=postgresql://user:pass@db:5432/db
```

The hostname must be `db` (the Docker service name), not `localhost`.

---

### 4. ❌ Vite Build Failed: `Could not resolve entry module`

**Problem:** Vite can't find index.html during Docker build

**Solution:** Already fixed in latest code
```bash
git pull origin main
# vite.config.ts now outputs to correct directory
```

---

### 5. ❌ Container Stuck or Won't Start

**Solution:**
```bash
# Clean everything
docker-compose -f docker-compose.production.yml down
docker system prune -f

# Remove volumes (CAREFUL - deletes data!)
docker volume rm software-hub-postgres-data

# Rebuild
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

### 6. ❌ Health Check Failed

**Problem:** App container starts but health check fails

**Check logs:**
```bash
docker-compose -f docker-compose.production.yml logs app
```

**Common causes:**
- Database not ready → Wait longer or check DB logs
- Wrong environment variables → Check .env.production
- Port already in use → Check with `lsof -i :3000`

---

## 🚀 Complete Deployment Workflow

### First Time Setup

```bash
# 1. Navigate to project
cd ~/Cuongtm2012/software_hub

# 2. Pull latest code
git pull origin main

# 3. Run complete deployment
bash scripts/deploy-complete.sh
```

The script will:
- ✅ Check and fix port conflicts
- ✅ Create/fix .env.production
- ✅ Generate secure passwords
- ✅ Clean Docker resources
- ✅ Build images
- ✅ Start services
- ✅ Wait for database health
- ✅ Run migrations
- ✅ Perform health checks

### Update Deployment

```bash
cd ~/Cuongtm2012/software_hub
git pull origin main
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔍 Verification Commands

### Check Services Status
```bash
docker-compose -f docker-compose.production.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f app
docker-compose -f docker-compose.production.yml logs -f db
```

### Test Application
```bash
# Health check
curl http://localhost:3000/api/health

# External access
curl http://95.111.253.111:3000
```

### Check Database Connection
```bash
# From inside app container
docker-compose -f docker-compose.production.yml exec app node -e "console.log(process.env.DATABASE_URL)"

# Connect to database
docker-compose -f docker-compose.production.yml exec db psql -U software_hub_user -d software_hub
```

---

## 📊 Service Dependencies

```
┌─────────────────────────────────────┐
│  Nginx (Optional)                   │
│  Port: 80/443                       │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────┐
│     App     │  │    Chat    │
│  Port 3000  │  │  Port 3001 │
│             │  │            │
│ depends_on: │  │ depends_on:│
│    db       │  │    db      │
└──────┬──────┘  └─────┬──────┘
       │                │
       └───────┬────────┘
               │
        ┌──────▼──────┐
        │ PostgreSQL  │
        │  Port 5432  │
        │             │
        │ healthcheck │
        └─────────────┘
```

**Startup Order:**
1. PostgreSQL starts
2. Health check passes
3. App & Chat services start
4. Nginx proxies requests (if configured)

---

## 🛠️ Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `deploy-complete.sh` | Complete deployment | First time or major issues |
| `quick-fix-env.sh` | Fix environment vars | Empty DB_PASSWORD |
| `fix-docker-build.sh` | Fix build issues | Build failures |
| `configure-env.sh` | Interactive env setup | Need to reconfigure |
| `migrate-db-to-docker.sh` | Migrate existing DB | Moving from host PostgreSQL |

---

## 🔐 Security Checklist

- [ ] `.env.production` has strong passwords
- [ ] `.env.production` permissions are 600
- [ ] Credentials file deleted after saving
- [ ] Firewall allows ports 80, 443, 3000
- [ ] Database not exposed externally (or use 127.0.0.1:5432)
- [ ] Regular backups configured
- [ ] SSL/TLS configured (if using domain)

---

## 🆘 Emergency Commands

### Stop Everything
```bash
docker-compose -f docker-compose.production.yml down
```

### Restart App Only
```bash
docker-compose -f docker-compose.production.yml restart app
```

### View Real-time Logs
```bash
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

### Backup Database
```bash
docker-compose -f docker-compose.production.yml exec db pg_dump -U software_hub_user software_hub > backup-$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup.sql | docker-compose -f docker-compose.production.yml exec -T db psql -U software_hub_user -d software_hub
```

### Complete Reset (DANGEROUS!)
```bash
docker-compose -f docker-compose.production.yml down -v
docker system prune -af
bash scripts/deploy-complete.sh
```

---

## 📞 Getting Help

1. **Check logs first:**
   ```bash
   docker-compose -f docker-compose.production.yml logs
   ```

2. **Verify configuration:**
   ```bash
   docker-compose -f docker-compose.production.yml config
   ```

3. **Check system resources:**
   ```bash
   df -h  # Disk space
   free -h  # Memory
   docker stats  # Container resources
   ```

4. **Run complete fix:**
   ```bash
   bash scripts/deploy-complete.sh
   ```

---

**Last Updated:** 2026-01-25  
**VPS IP:** 95.111.253.111  
**Project Path:** ~/Cuongtm2012/software_hub
