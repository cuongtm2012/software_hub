# VPS Deployment Guide - Software Hub

Hướng dẫn chi tiết deploy ứng dụng Software Hub lên Contabo VPS (95.111.253.111).

## 📋 Tổng Quan

### Thông Tin VPS
- **IP**: 95.111.253.111
- **OS**: Ubuntu/Debian
- **User**: root
- **Port SSH**: 22

### Kiến Trúc Deployment
```
Internet → Nginx (Port 80/443)
           ↓
           ├→ Static Files (dist/)
           └→ API Proxy → PM2 → Node.js App (Port 3000)
                          ├→ Main Server (Port 3000)
                          ├→ Email Service (Port 3001)
                          ├→ Chat Service (Port 3002)
                          └→ Notification Service (Port 3003)
```

## 🚨 Vấn Đề Hiện Tại

### 1. Port Mismatch
- **Vấn đề**: Code đang dùng PORT=3000 nhưng ecosystem.config.js và nginx config dùng PORT=5000
- **Giải pháp**: Thống nhất sử dụng PORT=3000

### 2. Missing Scripts
- **Vấn đề**: Không có `npm run db:migrate` và `npm start` script
- **Giải pháp**: Thêm scripts vào package.json

### 3. Build Process
- **Vấn đề**: Server code cần build từ TypeScript sang JavaScript
- **Giải pháp**: Đảm bảo build cả client và server

### 4. Environment Variables
- **Vấn đề**: Thiếu file .env.production trên VPS
- **Giải pháp**: Tạo template và hướng dẫn cấu hình

### 5. Database Setup
- **Vấn đề**: Database chưa được import data
- **Giải pháp**: Thêm bước import database trong deployment

## ✅ Giải Pháp Chi Tiết

### Bước 1: Chuẩn Bị VPS

#### 1.1. Chạy VPS Setup Script

```bash
# Trên máy local, copy script lên VPS
scp scripts/vps-setup.sh root@95.111.253.111:/tmp/

# SSH vào VPS
ssh root@95.111.253.111

# Chạy setup script
chmod +x /tmp/vps-setup.sh
/tmp/vps-setup.sh
```

#### 1.2. Cấu Hình Environment Variables

```bash
# Tạo file .env.production
nano /var/www/software-hub/.env.production
```

Nội dung file:
```env
# Database
DATABASE_URL=postgresql://software_hub_user:YOUR_SECURE_PASSWORD@localhost:5432/software_hub
POSTGRES_DB=software_hub
POSTGRES_USER=software_hub_user
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=CHANGE_TO_RANDOM_STRING_MIN_32_CHARS

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@domain.com

# Or use SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Microservice URLs
EMAIL_SERVICE_URL=http://localhost:3001
CHAT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB (for chat service)
MONGODB_URL=mongodb://admin:password@localhost:27017/softwarehub-chat?authSource=admin

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Storage (Cloudflare R2 or AWS S3)
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_ENDPOINT=https://your_endpoint

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
```

#### 1.3. Cập Nhật Database Password

```bash
# Đổi password PostgreSQL
sudo -u postgres psql
ALTER USER software_hub_user WITH PASSWORD 'your_new_secure_password';
\q
```

### Bước 2: Cấu Hình GitHub Secrets

Vào GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Thêm các secrets sau:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SSH_HOST` | `95.111.253.111` | IP của VPS |
| `SSH_USERNAME` | `root` | Username SSH |
| `SSH_KEY` | `<private key>` | SSH private key |
| `SSH_PORT` | `22` | SSH port (optional) |

#### Tạo SSH Key (nếu chưa có)

```bash
# Trên máy local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/vps_deploy

# Copy public key lên VPS
ssh-copy-id -i ~/.ssh/vps_deploy.pub root@95.111.253.111

# Copy private key vào GitHub Secrets
cat ~/.ssh/vps_deploy
# Copy toàn bộ nội dung (bao gồm cả BEGIN và END)
```

### Bước 3: Import Database

#### 3.1. Copy Database Dumps lên VPS

```bash
# Từ máy local
scp -r database/dumps root@95.111.253.111:/tmp/

# SSH vào VPS
ssh root@95.111.253.111

# Import schema
sudo -u postgres psql -d software_hub < /tmp/dumps/schema_20260129_222356.sql

# Import data
sudo -u postgres psql -d software_hub < /tmp/dumps/data_20260129_222356.sql

# Verify
sudo -u postgres psql -d software_hub -c "SELECT COUNT(*) FROM users;"
```

### Bước 4: Deploy

#### 4.1. Push Code lên GitHub

```bash
# Commit changes
git add .
git commit -m "fix: update deployment configuration for VPS"
git push origin main
```

GitHub Actions sẽ tự động:
1. Build client (Vite)
2. Build server (TypeScript → JavaScript)
3. Tạo deployment package
4. Upload lên VPS
5. Install dependencies
6. Restart PM2

#### 4.2. Monitor Deployment

Xem logs trên GitHub:
- Vào repository → Actions → Chọn workflow run mới nhất

Xem logs trên VPS:
```bash
ssh root@95.111.253.111

# PM2 logs
pm2 logs

# Deployment log
tail -f /var/log/software-hub-deploy.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Bước 5: Verify Deployment

```bash
# Check PM2 processes
pm2 list

# Check application
curl http://localhost:3000/health

# Check Nginx
curl http://95.111.253.111

# Check API
curl http://95.111.253.111/api/softwares
```

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"

```bash
# SSH vào VPS
cd /var/www/software-hub

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --production

# Restart
pm2 restart all
```

### Lỗi: "Port already in use"

```bash
# Tìm process đang dùng port
lsof -i:3000

# Kill process
kill -9 <PID>

# Hoặc restart PM2
pm2 restart all
```

### Lỗi: "Database connection failed"

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep software_hub

# Check user permissions
sudo -u postgres psql -c "\du"

# Test connection
sudo -u postgres psql -d software_hub -c "SELECT 1;"
```

### Lỗi: "502 Bad Gateway"

```bash
# Check PM2 processes
pm2 list

# Check if app is running
curl http://localhost:3000/health

# Check Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Check logs
tail -f /var/log/nginx/error.log
pm2 logs software-hub-server
```

### Lỗi: Build Failed

```bash
# Trên máy local, test build
npm run build

# Check build output
ls -la dist/

# Nếu build thành công local nhưng fail trên CI:
# - Check Node version (phải là 20.x)
# - Check dependencies trong package.json
# - Check build scripts
```

## 📝 Useful Commands

### PM2 Management

```bash
# List processes
pm2 list

# Logs
pm2 logs
pm2 logs software-hub-server
pm2 logs --lines 100

# Restart
pm2 restart all
pm2 restart software-hub-server

# Stop
pm2 stop all
pm2 stop software-hub-server

# Delete
pm2 delete all
pm2 delete software-hub-server

# Monitor
pm2 monit

# Save current process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

### Nginx Management

```bash
# Test config
nginx -t

# Reload config
systemctl reload nginx

# Restart
systemctl restart nginx

# Status
systemctl status nginx

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Management

```bash
# Connect to database
sudo -u postgres psql -d software_hub

# Backup database
sudo -u postgres pg_dump software_hub > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql -d software_hub < backup.sql

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('software_hub'));"
```

### System Management

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
htop

# Check running processes
ps aux | grep node

# Check open ports
netstat -tulpn | grep LISTEN
```

## 🔄 Update Workflow

### Khi Cần Update Code

```bash
# 1. Commit và push
git add .
git commit -m "feat: your changes"
git push origin main

# 2. GitHub Actions sẽ tự động deploy

# 3. Verify trên VPS
ssh root@95.111.253.111
pm2 logs
curl http://localhost:3000/health
```

### Khi Cần Update Environment Variables

```bash
# SSH vào VPS
ssh root@95.111.253.111

# Edit .env.production
nano /var/www/software-hub/.env.production

# Restart services
pm2 restart all
```

### Khi Cần Update Database Schema

```bash
# 1. Tạo migration script (nếu có)
# 2. Copy lên VPS
scp migrations/new_migration.sql root@95.111.253.111:/tmp/

# 3. Run migration
ssh root@95.111.253.111
sudo -u postgres psql -d software_hub < /tmp/new_migration.sql

# 4. Restart app
pm2 restart all
```

## 🔒 Security Best Practices

### 1. Firewall

```bash
# Only allow necessary ports
ufw status
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
```

### 2. SSH Security

```bash
# Disable password authentication
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

### 3. SSL/TLS (Let's Encrypt)

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### 4. Database Security

```bash
# Change default passwords
# Use strong passwords
# Limit network access to localhost only
```

### 5. Environment Variables

```bash
# Never commit .env files
# Use strong secrets (min 32 characters)
# Rotate secrets regularly
```

## 📊 Monitoring

### Setup PM2 Monitoring

```bash
# Link PM2 to PM2.io (optional)
pm2 link <secret_key> <public_key>

# Or use PM2 web interface
pm2 web
```

### Setup Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 📚 References

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🆘 Support

Nếu gặp vấn đề:
1. Check logs: `pm2 logs`, `tail -f /var/log/nginx/error.log`
2. Check process status: `pm2 list`, `systemctl status nginx`
3. Check network: `curl http://localhost:3000/health`
4. Review deployment logs trên GitHub Actions

Contact: cuongtm2012@gmail.com
