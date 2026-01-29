# Docker Deployment Guide for VPS

Complete guide for deploying Software Hub to VPS using Docker for databases and PM2 for the Node.js application.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    VPS (Host)                       │
│                                                     │
│  ┌──────────────┐         ┌──────────────────────┐ │
│  │    Nginx     │────────▶│    PM2 (Host)        │ │
│  │   (Port 80)  │         │  ├─ Main App (3000)  │ │
│  └──────────────┘         │  ├─ Email Svc (3001) │ │
│         │                 │  ├─ Chat Svc (3002)  │ │
│         │                 │  └─ Notif Svc (3003) │ │
│         │                 └──────────────────────┘ │
│         │                           │              │
│         │                           ▼              │
│  ┌──────────────────────────────────────────────┐  │
│  │         Docker Containers                    │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │ PostgreSQL  │  │ MongoDB  │  │  Redis  │ │  │
│  │  │  (5432)     │  │  (27017) │  │ (6379)  │ │  │
│  │  └─────────────┘  └──────────┘  └─────────┘ │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Why Hybrid?**
- ✅ Docker for databases: Easy management, isolation, backups
- ✅ PM2 for Node.js app: Better performance, clustering, zero-downtime restarts
- ✅ Nginx on host: Simpler SSL/TLS management

## Quick Start

### 1. Initial VPS Setup (One-time)

```bash
# Copy setup script to VPS
scp scripts/setup-vps-docker-hybrid.sh root@95.111.253.111:/tmp/

# SSH to VPS
ssh root@95.111.253.111

# Run setup script
chmod +x /tmp/setup-vps-docker-hybrid.sh
/tmp/setup-vps-docker-hybrid.sh
```

This script will:
- Stop manual PostgreSQL/MongoDB/Redis services
- Install Docker + Docker Compose
- Install Node.js 20.x + PM2
- Install Nginx
- Configure firewall
- Generate secure credentials
- Create `.env.production`

### 2. Save Credentials

```bash
# View and save credentials
cat /root/software-hub-credentials.txt

# Delete after saving
rm /root/software-hub-credentials.txt
```

### 3. Update Environment Variables

```bash
nano /var/www/software-hub/.env.production
```

Update these keys:
- `SENDGRID_API_KEY` - Email service
- `FIREBASE_*` - Push notifications
- `CLOUDFLARE_R2_*` - File storage (optional)
- `STRIPE_*` - Payment (optional)

### 4. Configure GitHub Secrets

Go to: https://github.com/cuongtm2012/software_hub/settings/secrets/actions

Add:
- `SSH_HOST` = `95.111.253.111`
- `SSH_USERNAME` = `root`
- `SSH_KEY` = `<your private SSH key>`

### 5. Deploy

```bash
# From local machine
git push origin main
```

GitHub Actions will automatically:
1. Build application
2. Create deployment package
3. Upload to VPS
4. Run deployment script
5. Start Docker containers
6. Import database
7. Start PM2 processes

## Manual Deployment

If you prefer to deploy manually:

### 1. Clone Repository

```bash
ssh root@95.111.253.111
cd /var/www/software-hub
git clone https://github.com/cuongtm2012/software_hub.git .
```

### 2. Install Dependencies

```bash
npm ci --production
```

### 3. Build Application

```bash
npm run build
```

### 4. Start Docker Containers

```bash
docker-compose -f docker-compose.vps.yml up -d
```

### 5. Import Database

```bash
# Copy dumps to VPS
scp -r database/dumps root@95.111.253.111:/var/www/software-hub/database/

# SSH to VPS
ssh root@95.111.253.111
cd /var/www/software-hub

# Import schema
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/schema_20260129_222356.sql

# Import data
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/data_20260129_222356.sql
```

### 6. Start PM2 Processes

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 7. Restart Nginx

```bash
systemctl restart nginx
```

## Verification

### Check Docker Containers

```bash
docker ps
# Expected: 3 containers (postgres, mongo, redis)

docker-compose -f docker-compose.vps.yml ps
# Expected: All containers "healthy"
```

### Check PM2 Processes

```bash
pm2 list
# Expected: 4 processes (main, email, chat, notification)

pm2 logs --lines 20
# Expected: No errors
```

### Test Application

```bash
# Health check
curl http://localhost:3000/health
# Expected: {"status":"ok"}

# API test
curl http://localhost:3000/api/softwares | jq '.' | head -20
# Expected: JSON array of softwares

# From browser
open http://95.111.253.111
```

## Maintenance

### View Logs

```bash
# PM2 logs
pm2 logs
pm2 logs software-hub-server

# Docker logs
docker-compose -f docker-compose.vps.yml logs -f
docker logs softwarehub-postgres
```

### Restart Services

```bash
# Restart PM2 processes
pm2 restart all

# Restart Docker containers
docker-compose -f docker-compose.vps.yml restart

# Restart Nginx
systemctl restart nginx
```

### Update Application

```bash
cd /var/www/software-hub
git pull origin main
npm ci --production
npm run build
pm2 restart all
```

### Backup Database

```bash
# PostgreSQL
docker exec softwarehub-postgres pg_dump -U postgres softwarehub > backup_$(date +%Y%m%d).sql

# MongoDB
docker exec softwarehub-mongo mongodump --out=/tmp/mongo-backup
docker cp softwarehub-mongo:/tmp/mongo-backup ./mongo-backup_$(date +%Y%m%d)
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i:5432

# Stop manual PostgreSQL
systemctl stop postgresql
systemctl disable postgresql
```

### Docker Container Won't Start

```bash
# Check logs
docker logs softwarehub-postgres

# Remove and recreate
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up -d
```

### PM2 Process Crashed

```bash
# Check logs
pm2 logs software-hub-server --lines 100

# Restart
pm2 restart software-hub-server

# Or restart all
pm2 restart all
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec softwarehub-postgres psql -U postgres -d softwarehub -c "SELECT 1;"

# Check environment variables
cat /var/www/software-hub/.env.production | grep DATABASE_URL
```

### 502 Bad Gateway

```bash
# Check if app is running
pm2 list
curl http://localhost:3000/health

# Check Nginx config
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## Useful Commands

```bash
# Docker
docker ps                                              # List containers
docker-compose -f docker-compose.vps.yml ps           # List compose services
docker-compose -f docker-compose.vps.yml logs -f      # Follow logs
docker-compose -f docker-compose.vps.yml restart      # Restart all
docker-compose -f docker-compose.vps.yml down         # Stop all
docker-compose -f docker-compose.vps.yml up -d        # Start all

# PM2
pm2 list                    # List processes
pm2 logs                    # View logs
pm2 restart all             # Restart all
pm2 stop all                # Stop all
pm2 delete all              # Delete all
pm2 monit                   # Monitor resources

# Nginx
nginx -t                    # Test config
systemctl reload nginx      # Reload config
systemctl restart nginx     # Restart
systemctl status nginx      # Check status

# System
df -h                       # Disk space
free -h                     # Memory
top                         # CPU/Memory usage
netstat -tulpn | grep LISTEN # Open ports
```

## Security

### SSL/TLS (Recommended)

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### Firewall

```bash
# Check status
ufw status

# Only allow necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Update Passwords

```bash
# Generate new passwords
openssl rand -base64 32

# Update .env.production
nano /var/www/software-hub/.env.production

# Restart services
docker-compose -f docker-compose.vps.yml restart
pm2 restart all
```

## Files Reference

- `docker-compose.vps.yml` - Docker Compose for databases
- `.env.vps.template` - Environment variables template
- `scripts/setup-vps-docker-hybrid.sh` - Initial VPS setup
- `scripts/deploy-vps-docker.sh` - Deployment script
- `ecosystem.config.js` - PM2 configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow

## Support

For issues:
1. Check logs: `pm2 logs`, `docker logs`
2. Review this guide
3. Check GitHub Issues
4. Contact: cuongtm2012@gmail.com
