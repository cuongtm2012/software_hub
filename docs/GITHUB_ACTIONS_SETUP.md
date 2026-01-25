# GitHub Actions Setup Guide

## Bước 1: Tạo SSH Key trên VPS (đã kết nối SSH)

Chạy các lệnh sau trên VPS:

```bash
# Tạo SSH key pair cho GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub" -f ~/.ssh/github_actions -N ""

# Thêm public key vào authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
chmod 644 ~/.ssh/github_actions.pub

# Hiển thị private key (copy toàn bộ để thêm vào GitHub Secret)
echo "=== PRIVATE KEY - Copy this to GitHub Secret SSH_KEY ==="
cat ~/.ssh/github_actions
echo "=== END PRIVATE KEY ==="
```

## Bước 2: Cấu hình Environment Variables

```bash
# Chuyển đến thư mục project
cd /var/www/software-hub

# Tạo file .env.production
nano .env.production
```

Thêm nội dung sau (thay thế các giá trị thực tế):

```env
NODE_ENV=production
PORT=3000

# Database - Cập nhật password
DATABASE_URL=postgresql://software_hub_user:YOUR_SECURE_PASSWORD@localhost:5432/software_hub

# Session Secret - Generate random string
SESSION_SECRET=YOUR_VERY_LONG_RANDOM_SECRET_KEY_HERE

# Email (Resend)
RESEND_API_KEY=your_resend_api_key_here

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

Để generate SESSION_SECRET:
```bash
openssl rand -base64 32
```

## Bước 3: Cập nhật PostgreSQL Password

```bash
# Vào PostgreSQL
sudo -u postgres psql

# Trong psql prompt, chạy:
ALTER USER software_hub_user WITH PASSWORD 'your_secure_password_here';
\q
```

## Bước 4: Test Database Connection

```bash
# Test connection
PGPASSWORD='your_secure_password_here' psql -U software_hub_user -d software_hub -h localhost -c "SELECT version();"
```

## Bước 5: Cấu hình GitHub Secrets

Vào GitHub Repository > Settings > Secrets and variables > Actions

Thêm các secrets sau:

| Secret Name | Value | Nguồn |
|------------|-------|-------|
| `SSH_HOST` | `95.111.253.111` | IP VPS |
| `SSH_USERNAME` | `root` | Username SSH |
| `SSH_KEY` | `[Private Key]` | Output từ `cat ~/.ssh/github_actions` |
| `SSH_PORT` | `22` | Port SSH |

**Lưu ý quan trọng về SSH_KEY:**
- Copy **toàn bộ** nội dung từ `-----BEGIN RSA PRIVATE KEY-----` đến `-----END RSA PRIVATE KEY-----`
- Bao gồm cả header và footer
- Không có khoảng trắng thừa

## Bước 6: Test SSH Connection từ Local

Trên máy local của bạn:

```bash
# Test connection với key
ssh -i ~/.ssh/github_actions root@95.111.253.111

# Nếu chưa có key trên local, copy từ VPS:
# Trên VPS:
cat ~/.ssh/github_actions

# Trên local:
nano ~/.ssh/github_actions_vps
# Paste nội dung, save
chmod 600 ~/.ssh/github_actions_vps

# Test
ssh -i ~/.ssh/github_actions_vps root@95.111.253.111
```

## Bước 7: Cập nhật Workflow Path

File `.github/workflows/deploy.yml` hiện đang deploy vào `/root/Cuongtm2012`, nhưng VPS setup script tạo thư mục tại `/var/www/software-hub`.

Chọn một trong hai:

### Option A: Sử dụng /var/www/software-hub (Recommended)
Cập nhật workflow để sử dụng path này.

### Option B: Tạo symlink
```bash
# Trên VPS
ln -s /var/www/software-hub /root/Cuongtm2012
```

## Bước 8: Trigger Deployment

1. Commit và push code lên branch `main`:
```bash
git add .
git commit -m "feat: setup deployment configuration"
git push origin main
```

2. Hoặc trigger manually:
   - Go to GitHub > Actions
   - Select "Deploy to Contabo VPS"
   - Click "Run workflow"

## Verification Checklist

Sau khi deploy, kiểm tra:

```bash
# Trên VPS
pm2 list                    # Check app status
pm2 logs software-hub       # View logs
curl http://localhost:3000  # Test app
curl http://95.111.253.111  # Test via Nginx
```

## Troubleshooting

### Lỗi: Permission denied (publickey)
```bash
# Check SSH key permissions
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_actions
chmod 600 ~/.ssh/authorized_keys
```

### Lỗi: Database connection failed
```bash
# Check PostgreSQL
systemctl status postgresql
sudo -u postgres psql -l

# Test connection
PGPASSWORD='password' psql -U software_hub_user -d software_hub -h localhost
```

### Lỗi: Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 list
pm2 logs software-hub

# Check Nginx config
nginx -t
systemctl status nginx
```
