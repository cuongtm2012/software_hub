# Deployment Checklist - Contabo VPS

## Pre-Deployment Checklist

### 1. GitHub Secrets Configuration ✓
- [ ] `SSH_HOST` = `95.111.253.111`
- [ ] `SSH_USERNAME` = `root`
- [ ] `SSH_KEY` = Private SSH key (với header và footer đầy đủ)
- [ ] `SSH_PORT` = `22` (hoặc custom port)

**Cách kiểm tra:**
- Vào GitHub Repository > Settings > Secrets and variables > Actions
- Đảm bảo tất cả 4 secrets đã được tạo

### 2. SSH Key Setup ✓
- [ ] Đã tạo SSH key pair trên máy local
- [ ] Public key đã được thêm vào `~/.ssh/authorized_keys` trên VPS
- [ ] Private key đã được thêm vào GitHub Secret `SSH_KEY`
- [ ] Permissions đúng: `~/.ssh` (700), `authorized_keys` (600)

**Cách kiểm tra:**
```bash
# Trên local
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111
# Nếu kết nối thành công mà không cần password = OK
```

### 3. VPS Configuration ✓
- [ ] Node.js v20 đã được cài đặt
- [ ] npm đã được cài đặt
- [ ] PM2 đã được cài đặt globally
- [ ] PostgreSQL đã được cài đặt và đang chạy
- [ ] Nginx đã được cài đặt và cấu hình
- [ ] Firewall đã mở port 22, 80, 443

**Cách kiểm tra:**
```bash
# Upload và chạy script health check
scp scripts/vps-health-check.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/vps-health-check.sh"
```

### 4. Project Directory ✓
- [ ] Thư mục `/root/Cuongtm2012` đã được tạo
- [ ] Permissions: `755`
- [ ] Owner: `root:root`

**Cách kiểm tra:**
```bash
ssh root@95.111.253.111 "ls -la /root/Cuongtm2012"
```

### 5. Environment Variables ✓
- [ ] File `.env` đã được tạo trong `/root/Cuongtm2012`
- [ ] `DATABASE_URL` đã được cấu hình đúng
- [ ] `SESSION_SECRET` đã được set
- [ ] Các API keys cần thiết đã được thêm

**Cách kiểm tra:**
```bash
ssh root@95.111.253.111 "cat /root/Cuongtm2012/.env"
```

### 6. Database Setup ✓
- [ ] PostgreSQL database `software_hub` đã được tạo
- [ ] User `software_hub_user` đã được tạo với password
- [ ] User có đủ quyền trên database

**Cách kiểm tra:**
```bash
ssh root@95.111.253.111 "sudo -u postgres psql -c '\l' | grep software_hub"
```

### 7. Nginx Configuration ✓
- [ ] Nginx config file đã được tạo
- [ ] Config đã được enable (symlink)
- [ ] Nginx đã được restart
- [ ] Reverse proxy đến port 3000 hoạt động

**Cách kiểm tra:**
```bash
ssh root@95.111.253.111 "nginx -t"
curl http://95.111.253.111
```

## Deployment Steps

### Step 1: Test SSH Connection
```bash
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111
```
**Expected:** Kết nối thành công không cần password

### Step 2: Run Health Check
```bash
# Upload script
scp scripts/vps-health-check.sh root@95.111.253.111:/tmp/

# Run check
ssh root@95.111.253.111 "bash /tmp/vps-health-check.sh"
```
**Expected:** Tất cả checks đều pass (✓)

### Step 3: Manual Test Deploy (Optional)
```bash
# Build locally
npm run build

# Create package
tar -czf software-hub.tar.gz dist server shared services package*.json tsconfig.json

# Upload
scp software-hub.tar.gz root@95.111.253.111:/tmp/

# Deploy manually
ssh root@95.111.253.111 << 'EOF'
cd /root/Cuongtm2012
tar -xzf /tmp/software-hub.tar.gz
npm ci --production
npm run db:migrate
pm2 start npm --name "software-hub" -- start
pm2 save
EOF
```
**Expected:** Application starts successfully

### Step 4: Trigger GitHub Actions
1. Go to GitHub Repository
2. Navigate to **Actions** tab
3. Select **Deploy to Contabo VPS** workflow
4. Click **Run workflow** > **Run workflow**

**Expected:** All steps complete successfully

### Step 5: Verify Deployment
```bash
# Check application status
ssh root@95.111.253.111 "pm2 list"

# Check logs
ssh root@95.111.253.111 "pm2 logs software-hub --lines 50"

# Test endpoint
curl http://95.111.253.111
```
**Expected:** Application is running and responding

## Troubleshooting Guide

### Issue: Connection Refused
**Symptoms:** GitHub Actions cannot connect to VPS

**Solutions:**
1. Check firewall:
```bash
ssh root@95.111.253.111 "ufw status"
ssh root@95.111.253.111 "ufw allow 22/tcp"
```

2. Check SSH service:
```bash
ssh root@95.111.253.111 "systemctl status sshd"
```

3. Verify SSH key format in GitHub Secret

### Issue: Permission Denied
**Symptoms:** SSH connection fails with permission error

**Solutions:**
1. Fix permissions:
```bash
ssh root@95.111.253.111 "chmod 700 ~/.ssh"
ssh root@95.111.253.111 "chmod 600 ~/.ssh/authorized_keys"
```

2. Check authorized_keys content:
```bash
ssh root@95.111.253.111 "cat ~/.ssh/authorized_keys"
```

### Issue: Deployment Fails
**Symptoms:** Files uploaded but application doesn't start

**Solutions:**
1. Check PM2 logs:
```bash
ssh root@95.111.253.111 "pm2 logs software-hub --err"
```

2. Check environment variables:
```bash
ssh root@95.111.253.111 "cat /root/Cuongtm2012/.env"
```

3. Check database connection:
```bash
ssh root@95.111.253.111 "cd /root/Cuongtm2012 && npm run db:migrate"
```

### Issue: Application Crashes
**Symptoms:** PM2 shows app in error state

**Solutions:**
1. Check application logs:
```bash
ssh root@95.111.253.111 "pm2 logs software-hub --lines 100"
```

2. Try starting manually:
```bash
ssh root@95.111.253.111 "cd /root/Cuongtm2012 && npm start"
```

3. Check dependencies:
```bash
ssh root@95.111.253.111 "cd /root/Cuongtm2012 && npm ci --production"
```

## Post-Deployment Verification

### 1. Application Health
- [ ] PM2 shows app as "online"
- [ ] No errors in PM2 logs
- [ ] Application responds to HTTP requests

### 2. Database
- [ ] Migrations ran successfully
- [ ] Can connect to database
- [ ] Tables are created

### 3. Nginx
- [ ] Reverse proxy working
- [ ] Can access via IP: http://95.111.253.111
- [ ] Static files served correctly

### 4. Monitoring
- [ ] PM2 monitoring enabled
- [ ] Log rotation configured
- [ ] Backup directory created

## Quick Commands Reference

```bash
# SSH into VPS
ssh root@95.111.253.111

# Check PM2 status
pm2 list

# View logs
pm2 logs software-hub

# Restart application
pm2 restart software-hub

# Stop application
pm2 stop software-hub

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check database
sudo -u postgres psql software_hub

# Check disk space
df -h

# Check memory
free -h

# View running processes
htop
```

## Emergency Rollback

If deployment fails and you need to rollback:

```bash
ssh root@95.111.253.111 << 'EOF'
# Find latest backup
LATEST_BACKUP=$(ls -dt /root/software-hub-backup-* | head -1)
echo "Rolling back to: $LATEST_BACKUP"

# Stop current app
pm2 stop software-hub

# Restore backup
rm -rf /root/Cuongtm2012
cp -r $LATEST_BACKUP /root/Cuongtm2012

# Restart app
cd /root/Cuongtm2012
pm2 restart software-hub
EOF
```

---

**Last Updated:** 2026-01-25
**VPS IP:** 95.111.253.111
**Project Path:** /root/Cuongtm2012
