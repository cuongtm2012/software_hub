# 🔧 Quick Fix for Docker Build Issues

## Current Issues on VPS:

1. ❌ Environment variables not loaded (DB_PASSWORD, etc.)
2. ❌ Dockerfile COPY command syntax error

## ✅ Solution:

### Option 1: Run Fix Script (Recommended)

```bash
# You're already on VPS in SSH terminal
cd /var/www/software-hub

# Or if in different location:
cd ~/Cuongtm2012/software_hub

# Pull latest fixes
git pull origin main

# Run fix script
bash scripts/fix-docker-build.sh
```

### Option 2: Manual Fix

```bash
# 1. Navigate to project
cd /var/www/software-hub  # or ~/Cuongtm2012/software_hub

# 2. Pull latest code (includes fixed Dockerfile)
git pull origin main

# 3. Verify .env.production exists and has values
cat .env.production

# If missing or empty, create it:
cat > .env.production << 'EOF'
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=jMUrtexJK2BclEHKwNKrHyqBVdLO7Dgw
SESSION_SECRET=HtyKGU4REapfsjp2fFzG3GcMpqPPuWaI80GpKn3GI4Q=
NODE_ENV=production
PORT=3000
CHAT_SERVICE_URL=http://chat-service:3001
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
EOF

# 4. Clean up Docker
docker-compose -f docker-compose.production.yml down
docker system prune -f

# 5. Rebuild
docker-compose -f docker-compose.production.yml build --no-cache

# 6. Start services
docker-compose -f docker-compose.production.yml up -d

# 7. Check logs
docker-compose -f docker-compose.production.yml logs -f
```

## 📋 What Was Fixed:

### 1. Dockerfile.production
- ❌ Old: `COPY client/package*.json ./client/ 2>/dev/null || true`
- ✅ New: `COPY package*.json ./` (simplified, no shell redirection)

### 2. docker-compose.production.yml
- ✅ Added `env_file: - .env.production` to all services
- ✅ Now properly loads environment variables

## 🔍 Verify Fix:

```bash
# Check containers are running
docker-compose -f docker-compose.production.yml ps

# Should show:
# software-hub-db    running
# software-hub-app   running
# software-hub-chat  running

# Test application
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

## 🆘 If Still Having Issues:

### Check environment file:
```bash
cat .env.production
# Make sure DB_PASSWORD and SESSION_SECRET are set
```

### Check Docker logs:
```bash
docker-compose -f docker-compose.production.yml logs app
docker-compose -f docker-compose.production.yml logs db
```

### Rebuild from scratch:
```bash
docker-compose -f docker-compose.production.yml down -v
docker system prune -af
bash scripts/fix-docker-build.sh
```

## 📞 Current Status:

Based on your terminal output:
- ✅ VPS setup complete
- ✅ .env.production created with credentials
- ❌ Docker build failed (will be fixed with above steps)

## 🚀 Next Steps After Fix:

1. **Verify deployment:**
   ```bash
   curl http://95.111.253.111:3000
   ```

2. **Check logs:**
   ```bash
   docker-compose -f docker-compose.production.yml logs -f
   ```

3. **Update database password:**
   ```bash
   sudo -u postgres psql
   ALTER USER software_hub_user WITH PASSWORD 'jMUrtexJK2BclEHKwNKrHyqBVdLO7Dgw';
   \q
   ```

---

**Run this now on your SSH terminal:**
```bash
cd ~/Cuongtm2012/software_hub/scripts
bash fix-docker-build.sh
```
