# VPS Deployment Checklist

Quick checklist để deploy Software Hub lên VPS thành công.

## ✅ Pre-Deployment (Trên Máy Local)

### 1. Chuẩn Bị Code
- [ ] Code đã được test local (`npm run dev` chạy OK)
- [ ] Build thành công (`npm run build` không lỗi)
- [ ] Port đã thống nhất là 3000 (check `.env`, `ecosystem.config.js`, `nginx config`)
- [ ] Tất cả changes đã commit

### 2. Chuẩn Bị Database Dumps
- [ ] Export database dumps mới nhất
  ```bash
  ./scripts/export-database.sh
  ```
- [ ] Verify dumps tồn tại trong `database/dumps/`
  - `schema_*.sql`
  - `data_*.sql`

### 3. Chuẩn Bị SSH Keys
- [ ] Tạo SSH key pair cho deployment
  ```bash
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vps_deploy
  ```
- [ ] Copy public key lên VPS
  ```bash
  ssh-copy-id -i ~/.ssh/vps_deploy.pub root@95.111.253.111
  ```
- [ ] Test SSH connection
  ```bash
  ssh -i ~/.ssh/vps_deploy root@95.111.253.111
  ```

## ✅ VPS Setup (Lần Đầu)

### 1. Chạy Setup Script
```bash
# Copy script lên VPS
scp scripts/setup-vps-complete.sh root@95.111.253.111:/tmp/

# SSH vào VPS
ssh root@95.111.253.111

# Chạy script
chmod +x /tmp/setup-vps-complete.sh
/tmp/setup-vps-complete.sh
```

- [ ] Script chạy thành công
- [ ] Lưu credentials từ `/root/software-hub-credentials.txt`
- [ ] Xóa file credentials sau khi lưu: `rm /root/software-hub-credentials.txt`

### 2. Cấu Hình Environment Variables
```bash
nano /var/www/software-hub/.env.production
```

Cập nhật các keys sau:
- [ ] `SENDGRID_API_KEY` - Email service
- [ ] `SENDGRID_FROM_EMAIL` - Email gửi đi
- [ ] `FIREBASE_PROJECT_ID` - Push notifications
- [ ] `FIREBASE_CLIENT_EMAIL` - Firebase service account
- [ ] `FIREBASE_PRIVATE_KEY` - Firebase private key
- [ ] `CLOUDFLARE_R2_*` - File storage (nếu dùng)
- [ ] `STRIPE_*` - Payment gateway (nếu dùng)

### 3. Import Database
```bash
# Copy dumps lên VPS
scp -r database/dumps root@95.111.253.111:/tmp/

# SSH vào VPS và import
ssh root@95.111.253.111

# Import schema
sudo -u postgres psql -d software_hub < /tmp/dumps/schema_20260129_222356.sql

# Import data
sudo -u postgres psql -d software_hub < /tmp/dumps/data_20260129_222356.sql

# Verify
sudo -u postgres psql -d software_hub -c "SELECT COUNT(*) FROM users;"
```

- [ ] Schema imported successfully
- [ ] Data imported successfully
- [ ] Tables có data (users, products, softwares, etc.)

## ✅ GitHub Configuration

### 1. Cấu Hình GitHub Secrets
Vào: `https://github.com/cuongtm2012/software_hub/settings/secrets/actions`

Thêm secrets:
- [ ] `SSH_HOST` = `95.111.253.111`
- [ ] `SSH_USERNAME` = `root`
- [ ] `SSH_KEY` = `<nội dung file ~/.ssh/vps_deploy>` (private key)
- [ ] `SSH_PORT` = `22` (optional)

### 2. Test GitHub Actions
- [ ] Workflow file tồn tại: `.github/workflows/deploy.yml`
- [ ] Workflow được enable trên GitHub
- [ ] Có quyền write cho Actions

## ✅ Deployment

### 1. Push Code
```bash
git add .
git commit -m "chore: prepare for VPS deployment"
git push origin main
```

- [ ] Push thành công
- [ ] GitHub Actions workflow triggered
- [ ] Workflow chạy thành công (check tab Actions)

### 2. Monitor Deployment
Trên GitHub:
- [ ] Build client step: ✅
- [ ] Build server step: ✅
- [ ] Deploy to VPS step: ✅
- [ ] Execute deployment script: ✅
- [ ] Health check: ✅

Trên VPS:
```bash
ssh root@95.111.253.111

# Check PM2
pm2 list
# Should show: software-hub-server, email-service, chat-service, notification-service

# Check logs
pm2 logs --lines 50

# Check Nginx
systemctl status nginx

# Test application
curl http://localhost:3000/health
```

- [ ] PM2 processes running
- [ ] No errors in logs
- [ ] Nginx running
- [ ] Health check returns OK

### 3. Verify Website
```bash
# Test từ local
curl http://95.111.253.111
curl http://95.111.253.111/api/softwares

# Hoặc mở browser
open http://95.111.253.111
```

- [ ] Website loads
- [ ] API returns data
- [ ] Can login
- [ ] Can browse products/softwares

## ✅ Post-Deployment

### 1. Setup SSL (Optional but Recommended)
```bash
ssh root@95.111.253.111

# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate (nếu có domain)
certbot --nginx -d yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

- [ ] SSL certificate installed
- [ ] HTTPS working
- [ ] Auto-renewal configured

### 2. Setup Monitoring
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Setup alerts (optional)
pm2 link <secret> <public>
```

- [ ] Log rotation configured
- [ ] Monitoring setup (optional)

### 3. Backup Strategy
```bash
# Create backup script
nano /root/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump software_hub > $BACKUP_DIR/db_$DATE.sql
# Keep only last 7 backups
ls -t $BACKUP_DIR/db_*.sql | tail -n +8 | xargs rm -f
```

```bash
chmod +x /root/backup-database.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-database.sh
```

- [ ] Backup script created
- [ ] Cron job configured
- [ ] Test backup: `./backup-database.sh`

## ✅ Troubleshooting

### Common Issues

#### 1. Build Failed on GitHub Actions
- [ ] Check Node version (should be 20.x)
- [ ] Check `package.json` scripts
- [ ] Test build locally: `npm run build`
- [ ] Check workflow logs for specific error

#### 2. PM2 Processes Not Starting
```bash
# Check logs
pm2 logs

# Check environment
cat /var/www/software-hub/.env.production

# Restart manually
cd /var/www/software-hub
pm2 delete all
pm2 start ecosystem.config.js --env production
```

#### 3. 502 Bad Gateway
```bash
# Check if app is running
pm2 list
curl http://localhost:3000/health

# Check Nginx config
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

#### 4. Database Connection Error
```bash
# Check PostgreSQL
systemctl status postgresql

# Test connection
sudo -u postgres psql -d software_hub -c "SELECT 1;"

# Check credentials in .env.production
```

#### 5. Port Already in Use
```bash
# Find process
lsof -i:3000

# Kill if needed
kill -9 <PID>

# Restart PM2
pm2 restart all
```

## 📝 Useful Commands

### PM2
```bash
pm2 list                    # List all processes
pm2 logs                    # View logs
pm2 logs software-hub-server # View specific service logs
pm2 restart all             # Restart all services
pm2 stop all                # Stop all services
pm2 delete all              # Delete all processes
pm2 monit                   # Monitor resources
```

### Nginx
```bash
nginx -t                    # Test config
systemctl reload nginx      # Reload config
systemctl restart nginx     # Restart Nginx
systemctl status nginx      # Check status
tail -f /var/log/nginx/error.log  # View error logs
```

### Database
```bash
# Connect
sudo -u postgres psql -d software_hub

# Backup
sudo -u postgres pg_dump software_hub > backup.sql

# Restore
sudo -u postgres psql -d software_hub < backup.sql

# Check size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('software_hub'));"
```

### System
```bash
df -h                       # Disk space
free -h                     # Memory
top                         # CPU/Memory usage
netstat -tulpn | grep LISTEN # Open ports
```

## 🎯 Success Criteria

Deployment is successful when:
- [✅] All PM2 processes are running
- [✅] Website accessible at http://95.111.253.111
- [✅] API endpoints returning data
- [✅] Can login and use features
- [✅] No errors in PM2 logs
- [✅] No errors in Nginx logs
- [✅] Database has data
- [✅] Health check returns OK

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs`, `tail -f /var/log/nginx/error.log`
2. Review this checklist
3. Check docs/VPS_DEPLOYMENT_GUIDE.md
4. Contact: cuongtm2012@gmail.com

---

**Last Updated**: 2026-01-29
**VPS IP**: 95.111.253.111
**Repository**: https://github.com/cuongtm2012/software_hub
