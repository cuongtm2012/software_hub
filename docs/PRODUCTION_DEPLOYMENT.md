# 🚀 Production Deployment Guide

## Current Production Setup

Based on successful deployment on VPS server.

### Running Services

| Service | Container Name | Image | Port | Status |
|---------|---------------|-------|------|--------|
| **App** | `software_hub_app` | `software-hub-app` | 5000 | ✅ Healthy |
| **PostgreSQL** | `software_hub_db` | `postgres:16-alpine` | 5432 | ✅ Healthy |
| **Redis** | `software_hub_redis` | `redis:7-alpine` | 6379 | ✅ Healthy |
| **MongoDB** | `softwarehub-mongo` | `mongo:7` | 27017 | ✅ Healthy |

---

## 📋 Prerequisites

1. **Server Requirements**
   - Ubuntu 20.04+ or Debian 11+
   - Docker & Docker Compose installed
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB disk space

2. **Domain & DNS** (Optional but recommended)
   - Domain pointing to server IP
   - SSL certificate (Let's Encrypt)

---

## 🔧 Deployment Steps

### Method 1: Using Deployment Script (Recommended)

```bash
cd /var/www/software-hub
chmod +x scripts/deploy-production-final.sh
./scripts/deploy-production-final.sh
```

### Method 2: Manual Deployment

```bash
cd /var/www/software-hub

# Pull latest code
git pull

# Stop existing containers
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Build and start
docker-compose -f docker-compose.prod.yml build --no-cache app
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## 🔍 Verification

### 1. Check Container Status

```bash
docker ps
```

All containers should show `(healthy)` status.

### 2. Health Check

```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok"}`

### 3. View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

Should see:
```
✅ Firebase Admin SDK initialized successfully
Database connection established successfully
SoftwareHub application serving on port 5000
```

---

## 🌐 Access Application

### Local Access
```
http://localhost:5000
```

### Remote Access
```
http://<server-ip>:5000
```

### With Domain (after Nginx setup)
```
https://yourdomain.com
```

---

## 🔄 Common Operations

### Restart Application

```bash
docker-compose -f docker-compose.prod.yml restart app
```

### Update Application

```bash
cd /var/www/software-hub
git pull
docker-compose -f docker-compose.prod.yml build --no-cache app
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f app

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Stop All Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Backup Database

```bash
# PostgreSQL backup
docker exec software_hub_db pg_dump -U postgres software_hub > backup.sql

# MongoDB backup
docker exec softwarehub-mongo mongodump --out /backup
```

---

## 🔐 Security Recommendations

### 1. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Block direct access to databases (optional)
# Only allow from localhost
ufw deny 5432/tcp
ufw deny 6379/tcp
ufw deny 27017/tcp

ufw enable
```

### 2. Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install nginx -y

# Create config
cat > /etc/nginx/sites-available/software-hub << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. Setup SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Logs size
du -sh /var/lib/docker/containers/*
```

### Health Monitoring

```bash
# Setup cron job for health checks
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * curl -f http://localhost:5000/api/health || systemctl restart docker
```

---

## 🐛 Troubleshooting

### App Container Keeps Restarting

```bash
# View logs
docker logs software_hub_app

# Common issues:
# 1. Database not ready - wait 30 seconds
# 2. Missing .env file - check environment variables
# 3. Port conflict - check if port 5000 is free
```

### Database Connection Failed

```bash
# Check PostgreSQL
docker exec software_hub_db psql -U postgres -c "SELECT 1"

# Check Redis
docker exec software_hub_redis redis-cli ping

# Check MongoDB
docker exec softwarehub-mongo mongosh --eval "db.adminCommand('ping')"
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## 📝 Environment Variables

Key environment variables in `.env.production`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@software_hub_db:5432/software_hub
REDIS_URL=redis://software_hub_redis:6379
MONGODB_URL=mongodb://softwarehub-mongo:27017/softwarehub-chat

# App
NODE_ENV=production
PORT=5000
SESSION_SECRET=<your-secret-key>

# Optional Services
RESEND_API_KEY=<your-resend-key>
FIREBASE_PROJECT_ID=<your-firebase-project>
```

---

## 🎯 Performance Optimization

### 1. Enable Redis Session Store

Add to `.env.production`:
```bash
SESSION_STORE=redis
```

### 2. Setup Database Connection Pooling

Already configured in app, but can adjust in code:
```typescript
// server/db.ts
pool: {
  min: 2,
  max: 10
}
```

### 3. Enable Gzip Compression

Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Check container status: `docker ps`
3. Review this documentation
4. Contact system administrator

---

**Last Updated**: 2026-01-30  
**Production Server**: VPS (vmi3042468)  
**Status**: ✅ Running Successfully
