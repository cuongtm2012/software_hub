# SSL Setup Fixed - Ready to Deploy

## Vấn đề đã được fix

Đã khắc phục lỗi SSL certificate setup cho domain **swhubco.com**. Lỗi ban đầu là nginx config thiếu ACME challenge location và còn placeholder domain.

## Các thay đổi đã thực hiện

### ✅ 1. Cập nhật nginx.conf

File: `nginx.conf`

**Thay đổi:**
- Domain placeholder `yourdomain.com` → `swhubco.com`
- Domain placeholder `www.yourdomain.com` → `www.swhubco.com`
- Thêm location block cho Let's Encrypt ACME challenge:

```nginx
location ^~ /.well-known/acme-challenge/ {
    root /var/www/html;
    default_type text/plain;
    allow all;
}
```

### ✅ 2. Tạo SSL setup script

File: `scripts/setup-ssl-certificate.sh`

Script tự động hóa toàn bộ quá trình SSL setup:
- ✓ Verify DNS pointing đúng IP
- ✓ Install certbot nếu chưa có
- ✓ Tạo webroot directory cho ACME challenge
- ✓ Test ACME challenge accessibility
- ✓ Check nginx config và firewall
- ✓ Obtain SSL certificate từ Let's Encrypt
- ✓ Setup auto-renewal

### ✅ 3. Tạo troubleshooting guide

File: `docs/SSL_TROUBLESHOOTING.md`

Hướng dẫn chi tiết troubleshoot mọi vấn đề SSL:
- Kiểm tra DNS
- Kiểm tra Nginx
- Kiểm tra ACME challenge
- Kiểm tra Firewall
- Các lỗi thường gặp và cách fix
- Logs để debug
- Manual SSL setup options

---

## Cách deploy lên production

### Bước 1: Upload files đã fix lên server

```bash
# Từ local, push code lên git
cd /Users/jack/.cursor/worktrees/software_hub/pfo
git add nginx.conf scripts/setup-ssl-certificate.sh docs/SSL_TROUBLESHOOTING.md
git commit -m "Fix SSL certificate setup for swhubco.com"
git push origin main

# SSH vào server
ssh root@95.111.253.111

# Pull latest code
cd /var/www/software-hub  # hoặc đường dẫn project của bạn
git pull origin main
```

### Bước 2: Copy nginx config vào hệ thống

```bash
# Backup config hiện tại
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Copy config mới
sudo cp nginx.conf /etc/nginx/sites-available/default

# Test config
sudo nginx -t

# Nếu ok, reload nginx
sudo systemctl reload nginx
```

### Bước 3: Chạy SSL setup script

```bash
# Make script executable (nếu chưa)
chmod +x scripts/setup-ssl-certificate.sh

# Chạy script
sudo ./scripts/setup-ssl-certificate.sh
```

Script sẽ:
1. Kiểm tra DNS đang point đúng IP
2. Cài đặt certbot
3. Chuẩn bị webroot directory
4. Test ACME challenge
5. Obtain SSL certificate
6. Setup auto-renewal

---

## Nếu vẫn gặp lỗi

### 1. DNS chưa point đúng

**Kiểm tra:**
```bash
dig +short swhubco.com A
dig +short www.swhubco.com A
```

**Mong đợi:** `95.111.253.111`

**Fix:** 
- Đăng nhập DNS provider
- Update A records
- Đợi 10-60 phút để DNS propagate

### 2. ACME challenge không accessible

**Kiểm tra:**
```bash
# Tạo test file
sudo mkdir -p /var/www/html/.well-known/acme-challenge
echo "test" | sudo tee /var/www/html/.well-known/acme-challenge/test.txt

# Test từ server
curl http://localhost/.well-known/acme-challenge/test.txt

# Test từ internet
curl http://swhubco.com/.well-known/acme-challenge/test.txt
```

**Nếu 404:**
- Check nginx config có location block cho `/.well-known/acme-challenge/`
- Check thư mục `/var/www/html` tồn tại
- Check permissions: `sudo chmod -R 755 /var/www/html`
- Reload nginx: `sudo systemctl reload nginx`

### 3. Port 80 hoặc 443 bị block

**Kiểm tra:**
```bash
sudo ufw status
sudo netstat -tulpn | grep -E ':80|:443'
```

**Fix:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 4. Rate limit từ Let's Encrypt

**Nếu gặp:** `Too many requests`

**Fix:**
- Đợi 1 giờ
- Dùng `--dry-run` để test: `certbot renew --dry-run`
- Xem rate limits: https://letsencrypt.org/docs/rate-limits/

---

## Alternative: Manual DNS challenge

Nếu HTTP validation fail nhiều lần, dùng DNS challenge:

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d swhubco.com \
  -d www.swhubco.com \
  --email admin@swhubco.com \
  --agree-tos
```

Certbot sẽ yêu cầu thêm TXT record:
```
Type: TXT
Name: _acme-challenge
Value: <giá trị certbot cung cấp>
TTL: 120
```

Sau khi add TXT record:
1. Đợi 2-5 phút
2. Verify: `dig +short _acme-challenge.swhubco.com TXT`
3. Press Enter trong certbot

---

## Verify SSL thành công

Sau khi setup xong:

```bash
# Test HTTPS
curl -I https://swhubco.com
curl -I https://www.swhubco.com

# Check certificate
sudo certbot certificates

# Test SSL grade
```

Mở browser: https://www.ssllabs.com/ssltest/analyze.html?d=swhubco.com

Expected: Grade A

---

## Tài liệu tham khảo

- **SSL Troubleshooting:** `docs/SSL_TROUBLESHOOTING.md`
- **SSL Setup Script:** `scripts/setup-ssl-certificate.sh`
- **Nginx Config:** `nginx.conf`

---

## Quick Commands

```bash
# Chạy SSL setup
sudo ./scripts/setup-ssl-certificate.sh

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check certbot certificates
sudo certbot certificates

# Test SSL renewal
sudo certbot renew --dry-run

# View certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Support

Nếu cần hỗ trợ, check:
1. `docs/SSL_TROUBLESHOOTING.md` - troubleshooting chi tiết
2. Certbot logs: `/var/log/letsencrypt/letsencrypt.log`
3. Nginx logs: `/var/log/nginx/error.log`
4. Let's Encrypt Community: https://community.letsencrypt.org
