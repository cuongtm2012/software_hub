# Hướng dẫn Deploy lên Contabo VPS

## 1. Thiết lập GitHub Secrets

Truy cập repository của bạn trên GitHub và vào **Settings > Secrets and variables > Actions**, sau đó thêm các secrets sau:

### Required Secrets:

| Secret Name | Value | Mô tả |
|------------|-------|-------|
| `SSH_HOST` | `95.111.253.111` | Địa chỉ IP của VPS Contabo |
| `SSH_USERNAME` | `root` | Username để SSH vào VPS |
| `SSH_KEY` | `[Private Key]` | Private SSH key (xem hướng dẫn bên dưới) |
| `SSH_PORT` | `22` | Port SSH (mặc định là 22) |

### Cách tạo và cấu hình SSH Key:

#### Trên máy local của bạn:

```bash
# 1. Tạo SSH key pair mới (nếu chưa có)
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub"

# Lưu key tại: ~/.ssh/contabo_deploy
# Không cần passphrase (để GitHub Actions có thể dùng tự động)

# 2. Copy public key
cat ~/.ssh/contabo_deploy.pub
```

#### Trên VPS Contabo:

```bash
# 1. SSH vào VPS
ssh root@95.111.253.111

# 2. Tạo thư mục .ssh nếu chưa có
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 3. Thêm public key vào authorized_keys
nano ~/.ssh/authorized_keys
# Paste nội dung của contabo_deploy.pub vào đây

# 4. Set permissions
chmod 600 ~/.ssh/authorized_keys

# 5. Restart SSH service
systemctl restart sshd
```

#### Thêm Private Key vào GitHub Secrets:

```bash
# Copy toàn bộ nội dung private key (bao gồm cả header và footer)
cat ~/.ssh/contabo_deploy

# Output sẽ giống như:
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEA...
# ...
# -----END RSA PRIVATE KEY-----
```

**Lưu ý quan trọng:**
- Copy **toàn bộ** nội dung, bao gồm `-----BEGIN RSA PRIVATE KEY-----` và `-----END RSA PRIVATE KEY-----`
- Không có khoảng trắng thừa ở đầu hoặc cuối
- Paste vào GitHub Secret `SSH_KEY`

## 2. Cấu hình VPS Contabo

### 2.1. Kiểm tra và cấu hình Firewall

```bash
# Kiểm tra UFW status
sudo ufw status

# Nếu UFW đang active, đảm bảo port SSH được mở
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Hoặc nếu dùng iptables
sudo iptables -L -n
```

### 2.2. Cài đặt các dependencies cần thiết

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install build tools
apt install -y build-essential

# Setup PM2 to start on boot
pm2 startup systemd
# Chạy lệnh mà PM2 suggest
```

### 2.3. Tạo thư mục project

```bash
# Tạo thư mục deployment
mkdir -p /root/Cuongtm2012
chown -R root:root /root/Cuongtm2012
chmod -R 755 /root/Cuongtm2012

# Tạo thư mục backup
mkdir -p /root/backups
```

### 2.4. Cấu hình Database (PostgreSQL)

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE software_hub;
CREATE USER software_hub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE software_hub TO software_hub_user;
\q
EOF
```

### 2.5. Cấu hình Environment Variables

```bash
# Tạo file .env trong thư mục project
cd /root/Cuongtm2012
nano .env
```

Thêm nội dung sau vào file `.env`:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://software_hub_user:your_secure_password@localhost:5432/software_hub

# Session
SESSION_SECRET=your_very_long_random_secret_key_here

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# OAuth (nếu có)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 2.6. Cấu hình Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/software-hub
```

Thêm cấu hình sau:

```nginx
server {
    listen 80;
    server_name 95.111.253.111;  # Hoặc domain của bạn

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## 3. Test Deployment

### 3.1. Test SSH Connection từ local

```bash
# Test kết nối SSH
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111

# Nếu thành công, bạn sẽ vào được VPS
```

### 3.2. Test Manual Deployment

```bash
# Trên local, build project
npm run build

# Tạo tarball
tar -czf software-hub.tar.gz dist server shared services package*.json tsconfig.json

# Copy lên VPS
scp -i ~/.ssh/contabo_deploy software-hub.tar.gz root@95.111.253.111:/tmp/

# SSH vào VPS và extract
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111
cd /root/Cuongtm2012
tar -xzf /tmp/software-hub.tar.gz
npm ci --production
npm run db:migrate
pm2 start npm --name "software-hub" -- start
pm2 save
```

### 3.3. Trigger GitHub Actions

Sau khi đã cấu hình xong:

1. Commit và push code lên branch `main`
2. Hoặc vào GitHub > Actions > Deploy to Contabo VPS > Run workflow

## 4. Troubleshooting

### Lỗi: Connection Refused

```bash
# Kiểm tra SSH service
systemctl status sshd

# Kiểm tra firewall
ufw status
iptables -L -n

# Kiểm tra SSH config
cat /etc/ssh/sshd_config | grep Port
cat /etc/ssh/sshd_config | grep PermitRootLogin
```

### Lỗi: Permission Denied

```bash
# Kiểm tra permissions
ls -la ~/.ssh/
ls -la ~/.ssh/authorized_keys

# Fix permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh
```

### Lỗi: Application không start

```bash
# Kiểm tra PM2 logs
pm2 logs software-hub

# Kiểm tra application logs
cd /root/Cuongtm2012
npm run dev  # Test locally

# Kiểm tra database connection
psql -U software_hub_user -d software_hub -h localhost
```

### Debug GitHub Actions

Trong file workflow, đã bật `debug: true` cho cả SCP và SSH actions. Xem logs chi tiết tại:
- GitHub > Actions > [Workflow run] > [Job] > [Step]

## 5. Monitoring và Maintenance

### Setup PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs software-hub

# Monitor resources
pm2 monit

# Restart app
pm2 restart software-hub

# Stop app
pm2 stop software-hub
```

### Setup Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Strategy

Workflow tự động tạo backup trước khi deploy tại `/root/software-hub-backup-[timestamp]` và giữ lại 5 backup gần nhất.

## 6. Security Best Practices

1. **Đổi SSH port mặc định** (tùy chọn):
```bash
nano /etc/ssh/sshd_config
# Đổi Port 22 thành port khác (ví dụ: 2222)
systemctl restart sshd
# Nhớ update GitHub Secret SSH_PORT
```

2. **Disable password authentication**:
```bash
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

3. **Setup fail2ban**:
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

4. **Regular updates**:
```bash
apt update && apt upgrade -y
```

## 7. SSL/HTTPS Setup (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (nếu có domain)
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

---

**Lưu ý cuối cùng:**
- Thay thế `your_secure_password`, `your_very_long_random_secret_key_here`, và các API keys bằng giá trị thực tế
- Backup file `.env` và database thường xuyên
- Monitor logs và resources của VPS
- Test deployment trên staging environment trước khi deploy production
