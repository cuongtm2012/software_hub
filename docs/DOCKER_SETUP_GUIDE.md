# 🚀 Quick Docker Setup Guide

## Option 1: Automated Setup (Recommended)

### Single Command Setup

```bash
# Upload and run complete setup script
scp scripts/setup-complete.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/setup-complete.sh"
```

**This will:**
- ✓ Install Docker & Docker Compose
- ✓ Setup project directory
- ✓ Configure environment variables
- ✓ Build Docker images
- ✓ Start all services
- ✓ Run database migrations
- ✓ Perform health checks

---

## Option 2: Step-by-Step Setup

### Step 1: Setup VPS with Docker

```bash
# Upload script
scp scripts/setup-vps-docker.sh root@95.111.253.111:/tmp/

# SSH and run
ssh root@95.111.253.111
bash /tmp/setup-vps-docker.sh
```

### Step 2: Configure Environment

```bash
# Navigate to project
cd /var/www/software-hub

# Run configuration script
bash scripts/configure-env.sh
```

**The script will:**
- Generate secure passwords
- Prompt for API keys (optional)
- Create `.env.production`
- Save credentials securely

**Or manually:**

```bash
# Copy template
cp .env.production.template .env.production

# Edit values
nano .env.production
```

### Step 3: Deploy

```bash
# Using Makefile (recommended)
make deploy

# Or using Docker Compose directly
docker-compose -f docker-compose.production.yml up -d --build
```

---

## Option 3: Manual Configuration

### Create .env.production manually

```bash
cd /var/www/software-hub

cat > .env.production << 'EOF'
# Database
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=YOUR_SESSION_SECRET_HERE

# Email (Optional)
RESEND_API_KEY=

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Chat Service
CHAT_SERVICE_URL=http://chat-service:3001
EOF

# Set permissions
chmod 600 .env.production
```

### Generate secure values

```bash
# Database password
openssl rand -base64 32

# Session secret
openssl rand -base64 32
```

---

## 📋 Available Scripts

| Script | Purpose |
|--------|---------|
| `setup-complete.sh` | Complete automated setup |
| `setup-vps-docker.sh` | Install Docker & dependencies |
| `configure-env.sh` | Interactive environment setup |
| `migrate-db-to-docker.sh` | Migrate existing database |

---

## 🔧 Quick Commands

### Using Scripts

```bash
# Complete setup
bash scripts/setup-complete.sh

# Just configure environment
bash scripts/configure-env.sh

# Migrate database
bash scripts/migrate-db-to-docker.sh
```

### Using Makefile

```bash
# Deploy everything
make deploy

# Start services
make up

# View logs
make logs

# Check status
make ps

# Backup database
make backup
```

### Using Docker Compose

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

---

## ✅ Verification

### Check Services

```bash
# Container status
make ps
# or
docker-compose -f docker-compose.production.yml ps
```

### View Logs

```bash
# All services
make logs

# Specific service
make logs SERVICE=app
```

### Health Check

```bash
# Using Makefile
make health

# Manual check
curl http://localhost:3000/api/health
```

### Test Application

```bash
# Local
curl http://localhost:3000

# External
curl http://95.111.253.111
```

---

## 🔍 Troubleshooting

### Script fails

```bash
# Check Docker installation
docker --version
docker-compose --version

# Check permissions
ls -la /var/www/software-hub

# View logs
docker-compose -f docker-compose.production.yml logs
```

### Environment issues

```bash
# Check .env.production exists
ls -la .env.production

# Verify contents (be careful with passwords!)
cat .env.production

# Regenerate
bash scripts/configure-env.sh
```

### Services won't start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Rebuild
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 📚 Documentation

- **Complete Guide**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **Quick Reference**: [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)
- **Makefile Help**: Run `make help`

---

## 🎯 Recommended Workflow

**For first-time setup:**
```bash
bash scripts/setup-complete.sh
```

**For updates:**
```bash
cd /var/www/software-hub
git pull origin main
make deploy
```

**For daily operations:**
```bash
make logs    # View logs
make ps      # Check status
make backup  # Backup database
```

---

**VPS:** 95.111.253.111  
**User:** root  
**Project:** /var/www/software-hub  
**Port:** 3000
