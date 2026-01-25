# ✅ Post-VPS Setup Checklist

VPS đã được setup thành công! Bây giờ cần hoàn thành các bước sau:

## 🔑 Bước 1: Tạo SSH Key cho GitHub Actions (Trên VPS)

**Đang ở terminal SSH, chạy:**

```bash
bash /root/Cuongtm2012/software_hub/scripts/post-setup.sh
```

Hoặc chạy từng lệnh:

```bash
# Tạo SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub" -f ~/.ssh/github_actions -N ""

# Thêm vào authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Set permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys ~/.ssh/github_actions

# Hiển thị private key
cat ~/.ssh/github_actions
```

**📋 COPY toàn bộ output (từ `-----BEGIN` đến `-----END`)**

---

## 🔐 Bước 2: Cập nhật Database Password (Trên VPS)

```bash
# Vào PostgreSQL
sudo -u postgres psql

# Trong psql, chạy:
ALTER USER software_hub_user WITH PASSWORD 'YourSecurePassword123!';
\q
```

**💾 LƯU password này!**

---

## 📝 Bước 3: Cấu hình Environment Variables (Trên VPS)

```bash
# Edit file .env
nano /var/www/software-hub/.env.production
```

**Cập nhật:**
- `DATABASE_URL`: Thay `CHANGE_THIS_PASSWORD` bằng password từ Bước 2
- `RESEND_API_KEY`: Thêm API key của Resend (nếu có)

**Lưu file:** `Ctrl+X`, `Y`, `Enter`

---

## 🔧 Bước 4: Test Database Connection (Trên VPS)

```bash
PGPASSWORD='YourSecurePassword123!' psql -U software_hub_user -d software_hub -h localhost -c "SELECT version();"
```

**Expected:** Hiển thị PostgreSQL version ✅

---

## 🐙 Bước 5: Cấu hình GitHub Secrets

**Vào:** `https://github.com/YOUR_USERNAME/software_hub/settings/secrets/actions`

**Thêm 4 secrets:**

| Secret Name | Value | Nguồn |
|------------|-------|-------|
| `SSH_HOST` | `95.111.253.111` | IP VPS |
| `SSH_USERNAME` | `root` | Username |
| `SSH_KEY` | `[Private Key]` | Output từ Bước 1 |
| `SSH_PORT` | `22` | Port SSH |

**⚠️ SSH_KEY phải bao gồm:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

---

## 🧪 Bước 6: Test SSH Connection (Từ máy local)

```bash
# Nếu bạn muốn test từ local (optional)
# Copy private key từ VPS
ssh root@95.111.253.111 "cat ~/.ssh/github_actions" > ~/.ssh/github_actions_vps
chmod 600 ~/.ssh/github_actions_vps

# Test connection
ssh -i ~/.ssh/github_actions_vps root@95.111.253.111
```

**Expected:** Kết nối thành công không cần password ✅

---

## 🚀 Bước 7: Deploy!

### Option A: Push to main branch
```bash
# Trên máy local
cd /Users/jack/Desktop/1.PROJECT/software_hub
git add .
git commit -m "feat: configure deployment for Contabo VPS"
git push origin main
```

### Option B: Manual trigger
1. Go to: `https://github.com/YOUR_USERNAME/software_hub/actions`
2. Click: **Deploy to Contabo VPS**
3. Click: **Run workflow** > **Run workflow**

---

## ✅ Bước 8: Verify Deployment

**Sau khi GitHub Actions chạy xong:**

```bash
# Trên VPS, check status
pm2 list

# View logs
pm2 logs software-hub --lines 50

# Test locally
curl http://localhost:3000

# Test via Nginx
curl http://95.111.253.111
```

**Hoặc mở browser:** `http://95.111.253.111`

---

## 🔍 Quick Reference

### VPS Info
- **IP:** 95.111.253.111
- **User:** root
- **Project Path:** /var/www/software-hub
- **App Port:** 3000
- **Web Port:** 80

### Useful Commands (Trên VPS)
```bash
# Check app status
pm2 list

# View logs
pm2 logs software-hub

# Restart app
pm2 restart software-hub

# Check Nginx
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check database
sudo -u postgres psql software_hub
```

---

## 🆘 Troubleshooting

### ❌ GitHub Actions fails: "Permission denied"
```bash
# Trên VPS, check permissions
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### ❌ Database connection error
```bash
# Check PostgreSQL
systemctl status postgresql

# Test connection
PGPASSWORD='your_password' psql -U software_hub_user -d software_hub -h localhost
```

### ❌ App won't start
```bash
# Check logs
pm2 logs software-hub --err

# Check .env file
cat /var/www/software-hub/.env.production

# Try manual start
cd /var/www/software-hub
npm start
```

### ❌ 502 Bad Gateway
```bash
# Check if app is running
pm2 list

# Check Nginx
nginx -t
systemctl status nginx
```

---

## 📚 Documentation

- **Full Guide:** [docs/GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- **Deployment Guide:** [docs/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Deploy:** [docs/QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

**Current Status:** ✅ VPS Setup Complete  
**Next:** Complete steps 1-7 above to enable deployment
