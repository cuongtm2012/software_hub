# SSL Certificate Troubleshooting Guide

Hướng dẫn khắc phục sự cố khi setup SSL certificate với Let's Encrypt cho swhubco.com

## Mục lục

- [Kiểm tra DNS](#kiểm-tra-dns)
- [Kiểm tra Nginx](#kiểm-tra-nginx)
- [Kiểm tra ACME Challenge](#kiểm-tra-acme-challenge)
- [Kiểm tra Firewall](#kiểm-tra-firewall)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Logs để check](#logs-để-check)
- [Manual SSL Setup](#manual-ssl-setup)

---

## Kiểm tra DNS

### 1. Verify DNS đang point đúng IP

```bash
# Kiểm tra A record cho domain chính
dig +short swhubco.com A
# Kết quả mong đợi: 95.111.253.111

# Kiểm tra A record cho www subdomain
dig +short www.swhubco.com A
# Kết quả mong đợi: 95.111.253.111

# Kiểm tra AAAA record (IPv6)
dig +short swhubco.com AAAA
# Kết quả mong đợi: 2a02:c207:2304:2468::1
```

### 2. Nếu không có `dig`, dùng `nslookup`

```bash
nslookup swhubco.com
nslookup www.swhubco.com
```

### 3. Kiểm tra DNS propagation

DNS có thể mất 10-60 phút để propagate. Kiểm tra từ nhiều địa điểm:

- https://dnschecker.org
- https://www.whatsmydns.net

### Khắc phục DNS issues

**Vấn đề: DNS không point đúng IP**

1. Đăng nhập vào DNS provider (Cloudflare, Namecheap, etc.)
2. Thêm/cập nhật A records:
   ```
   Type: A
   Name: @
   Value: 95.111.253.111
   TTL: Auto/3600
   
   Type: A
   Name: www
   Value: 95.111.253.111
   TTL: Auto/3600
   ```
3. Đợi 10-60 phút rồi verify lại

---

## Kiểm tra Nginx

### 1. Test Nginx configuration

```bash
# Kiểm tra syntax
sudo nginx -t

# Nếu ok, kết quả:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Check Nginx status

```bash
# Kiểm tra nginx đang chạy
sudo systemctl status nginx

# Nếu không chạy, start nginx
sudo systemctl start nginx

# Enable nginx khi boot
sudo systemctl enable nginx
```

### 3. Reload Nginx sau khi thay đổi config

```bash
# Reload config (không downtime)
sudo systemctl reload nginx

# Hoặc restart (có downtime)
sudo systemctl restart nginx
```

### 4. Verify Nginx đang listen trên port 80

```bash
sudo netstat -tulpn | grep :80
# hoặc
sudo ss -tulpn | grep :80

# Kết quả mong đợi:
# tcp   0   0 0.0.0.0:80   0.0.0.0:*   LISTEN   1234/nginx
```

---

## Kiểm tra ACME Challenge

### 1. Tạo test file

```bash
# Tạo thư mục cho ACME challenge
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Tạo test file
echo "test-content" | sudo tee /var/www/html/.well-known/acme-challenge/test.txt

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### 2. Test từ server (localhost)

```bash
curl http://localhost/.well-known/acme-challenge/test.txt
# Kết quả mong đợi: test-content
```

### 3. Test từ bên ngoài (internet)

```bash
curl http://swhubco.com/.well-known/acme-challenge/test.txt
# Kết quả mong đợi: test-content

# Nếu có lỗi 404:
# - Kiểm tra nginx config có location block cho /.well-known/acme-challenge/
# - Kiểm tra path /var/www/html tồn tại
# - Kiểm tra permissions
```

### 4. Verify nginx config có ACME location

Trong `/etc/nginx/sites-available/default` hoặc nginx config file, phải có:

```nginx
location ^~ /.well-known/acme-challenge/ {
    root /var/www/html;
    default_type text/plain;
    allow all;
}
```

### 5. Dọn dẹp test file

```bash
sudo rm -f /var/www/html/.well-known/acme-challenge/test.txt
```

---

## Kiểm tra Firewall

### 1. Check UFW status

```bash
sudo ufw status

# Phải thấy:
# 80/tcp         ALLOW       Anywhere
# 443/tcp        ALLOW       Anywhere
```

### 2. Mở port 80 và 443 nếu chưa có

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 3. Check iptables (nếu không dùng UFW)

```bash
sudo iptables -L -n -v | grep -E '80|443'
```

### 4. Test port accessibility từ bên ngoài

```bash
# Từ máy khác hoặc dùng online tool:
telnet swhubco.com 80
# Hoặc
nc -zv swhubco.com 80
```

---

## Lỗi thường gặp

### Lỗi 1: `Invalid response from https://swhubco.com/.well-known/acme-challenge/... : 404`

**Nguyên nhân:** Nginx không serve được ACME challenge file

**Khắc phục:**
1. Kiểm tra nginx config có location block cho `/.well-known/acme-challenge/`
2. Kiểm tra thư mục `/var/www/html` tồn tại và có quyền đọc
3. Test bằng cách tạo file test (xem phần ACME Challenge ở trên)
4. Reload nginx: `sudo systemctl reload nginx`

### Lỗi 2: `Connection refused` hoặc `Timeout`

**Nguyên nhân:** Port 80 bị block hoặc nginx không chạy

**Khắc phục:**
1. Check nginx: `sudo systemctl status nginx`
2. Check firewall: `sudo ufw status`
3. Check port: `sudo netstat -tulpn | grep :80`
4. Mở port: `sudo ufw allow 80/tcp`

### Lỗi 3: `DNS problem: NXDOMAIN looking up A for swhubco.com`

**Nguyên nhân:** DNS chưa được cấu hình hoặc chưa propagate

**Khắc phục:**
1. Verify DNS: `dig +short swhubco.com A`
2. Nếu không trả về IP đúng → cấu hình DNS tại provider
3. Đợi 10-60 phút để DNS propagate
4. Check DNS propagation: https://dnschecker.org

### Lỗi 4: `Too many requests for this domain`

**Nguyên nhân:** Let's Encrypt rate limit (5 failed attempts/hour, 50 certs/week)

**Khắc phục:**
1. Đợi 1 giờ trước khi retry
2. Dùng `--dry-run` để test: `certbot --nginx --dry-run -d swhubco.com`
3. Xem rate limits: https://letsencrypt.org/docs/rate-limits/

### Lỗi 5: `The client lacks sufficient authorization`

**Nguyên nhân:** Domain ownership không được verify

**Khắc phục:**
1. Đảm bảo DNS point đúng IP
2. Đảm bảo ACME challenge path accessible từ internet
3. Try manual DNS challenge (xem phần Manual SSL Setup)

---

## Logs để check

### 1. Certbot logs

```bash
# Main log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Xem toàn bộ log
sudo less /var/log/letsencrypt/letsencrypt.log
```

### 2. Nginx error logs

```bash
# Real-time monitoring
sudo tail -f /var/log/nginx/error.log

# Software Hub specific log
sudo tail -f /var/log/nginx/software-hub-error.log
```

### 3. Nginx access logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/software-hub-access.log
```

### 4. System logs

```bash
# Journal logs cho nginx
sudo journalctl -u nginx -f

# Journal logs cho certbot
sudo journalctl -u certbot -f
```

---

## Manual SSL Setup

### Option 1: Manual HTTP challenge

```bash
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d swhubco.com \
  -d www.swhubco.com \
  --email admin@swhubco.com \
  --agree-tos
```

### Option 2: Manual DNS challenge (recommended nếu HTTP fail nhiều)

```bash
sudo certbot certonly --manual \
  --preferred-challenges dns \
  -d swhubco.com \
  -d www.swhubco.com \
  --email admin@swhubco.com \
  --agree-tos
```

Certbot sẽ yêu cầu thêm TXT record vào DNS:
```
Type: TXT
Name: _acme-challenge
Value: <provided-by-certbot>
TTL: 120
```

Sau khi thêm TXT record:
1. Đợi 2-5 phút
2. Verify: `dig +short _acme-challenge.swhubco.com TXT`
3. Press Enter trong certbot để continue

### Option 3: Standalone mode (cần stop nginx tạm thời)

```bash
# Stop nginx
sudo systemctl stop nginx

# Chạy certbot standalone
sudo certbot certonly --standalone \
  -d swhubco.com \
  -d www.swhubco.com \
  --email admin@swhubco.com \
  --agree-tos

# Start nginx lại
sudo systemctl start nginx
```

---

## Sau khi có certificate

### 1. Verify certificate

```bash
# List certificates
sudo certbot certificates

# Check certificate details
sudo openssl x509 -in /etc/letsencrypt/live/swhubco.com/cert.pem -text -noout
```

### 2. Test HTTPS

```bash
curl -I https://swhubco.com
curl -I https://www.swhubco.com
```

### 3. Test SSL configuration

- https://www.ssllabs.com/ssltest/analyze.html?d=swhubco.com
- https://www.ssllabs.com/ssltest/analyze.html?d=www.swhubco.com

### 4. Setup auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check certbot timer
sudo systemctl status certbot.timer

# Enable timer nếu chưa có
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Quick Checklist

Trước khi chạy certbot, verify:

- [ ] DNS pointing đúng IP: `dig +short swhubco.com A`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Nginx config valid: `sudo nginx -t`
- [ ] Port 80 open: `sudo ufw status`
- [ ] ACME path accessible: `curl http://swhubco.com/.well-known/acme-challenge/test.txt`
- [ ] Domain accessible từ internet: `curl -I http://swhubco.com`

Nếu tất cả đều OK, chạy:

```bash
sudo /var/www/software-hub/scripts/setup-ssl-certificate.sh
```

---

## Support Resources

- Let's Encrypt Community: https://community.letsencrypt.org
- Certbot Documentation: https://certbot.eff.org/docs/
- Nginx Documentation: https://nginx.org/en/docs/
- DNS Checker: https://dnschecker.org
- SSL Test: https://www.ssllabs.com/ssltest/

---

## Emergency Commands

```bash
# Force renew certificate
sudo certbot renew --force-renewal

# Delete và tạo lại certificate
sudo certbot delete --cert-name swhubco.com
sudo certbot --nginx -d swhubco.com -d www.swhubco.com

# Restore nginx config từ backup
sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx

# Check all certbot certificates
sudo certbot certificates

# Revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/swhubco.com/cert.pem
```
