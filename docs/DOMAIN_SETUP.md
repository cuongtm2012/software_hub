# 🌐 Domain Setup Guide - swhubco.com

Complete guide to configure **swhubco.com** for Software Hub production.

---

## 📋 Prerequisites

1. **Domain purchased**: swhubco.com ✅
2. **VPS server running**: Production app on port 5000 ✅
3. **Server IP**: Get from `curl ifconfig.me` on server
4. **Email**: For SSL certificate notifications

---

## 🔧 Step 1: Configure DNS

Login to your domain registrar and add these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `<your-server-ip>` | 3600 |
| A | www | `<your-server-ip>` | 3600 |

**Example:**
```
A     @       123.45.67.89    3600
A     www     123.45.67.89    3600
```

**Wait 5-10 minutes** for DNS propagation.

**Verify DNS:**
```bash
# Check if DNS is working
nslookup swhubco.com
dig swhubco.com +short
```

---

## 🚀 Step 2: Run Setup Script on Server

SSH into your production server and run:

```bash
cd /var/www/software-hub

# Download or copy the setup script
# Then run:
sudo ./scripts/setup-domain.sh
```

The script will:
1. ✅ Install Nginx
2. ✅ Configure reverse proxy
3. ✅ Setup SSL with Let's Encrypt
4. ✅ Configure firewall
5. ✅ Enable auto-renewal

---

## 📝 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/swhubco.com
```

Paste this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name swhubco.com www.swhubco.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for chat
    location /socket.io/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/swhubco.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Install SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d swhubco.com -d www.swhubco.com
```

Follow the prompts:
- Enter email: `your-email@example.com`
- Agree to terms: `Y`
- Redirect HTTP to HTTPS: `2` (recommended)

### 5. Setup Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 6. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## ✅ Verification

### 1. Check DNS Resolution

```bash
nslookup swhubco.com
# Should return your server IP
```

### 2. Test HTTP Access

```bash
curl -I http://swhubco.com
# Should redirect to HTTPS
```

### 3. Test HTTPS Access

```bash
curl -I https://swhubco.com
# Should return 200 OK
```

### 4. Check Nginx Status

```bash
sudo systemctl status nginx
```

### 5. Check SSL Certificate

```bash
sudo certbot certificates
```

Or visit: https://www.ssllabs.com/ssltest/analyze.html?d=swhubco.com

---

## 🔍 Troubleshooting

### DNS Not Resolving

```bash
# Check DNS propagation
dig swhubco.com +short

# Wait more time (can take up to 24 hours)
# Or flush local DNS cache
```

### SSL Certificate Failed

```bash
# Check if ports are open
sudo ufw status
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Check Nginx is running
sudo systemctl status nginx

# Try manual SSL setup
sudo certbot --nginx -d swhubco.com -d www.swhubco.com --dry-run
```

### 502 Bad Gateway

```bash
# Check if app is running
docker ps | grep software_hub_app

# Check app logs
docker logs software_hub_app

# Restart app
cd /var/www/software-hub
docker-compose -f docker-compose.prod.yml restart app
```

### Nginx Errors

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔐 Security Best Practices

### 1. Enable HSTS

Add to Nginx config:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 2. Disable Server Tokens

Add to Nginx config:
```nginx
server_tokens off;
```

### 3. Rate Limiting

Add to Nginx config:
```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req zone=one burst=20;
```

### 4. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 📊 Monitoring

### Check SSL Expiry

```bash
sudo certbot certificates
```

### Monitor Nginx Access

```bash
sudo tail -f /var/log/nginx/access.log
```

### Monitor App Health

```bash
curl https://swhubco.com/api/health
```

### Setup Monitoring Cron

```bash
# Add to crontab
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * curl -f https://swhubco.com/api/health || echo "App down!" | mail -s "Alert" your-email@example.com
```

---

## 🎯 Final Checklist

- [ ] DNS A records configured
- [ ] DNS propagated (nslookup works)
- [ ] Nginx installed and running
- [ ] Nginx config created and enabled
- [ ] SSL certificate obtained
- [ ] Auto-renewal enabled
- [ ] Firewall configured
- [ ] HTTPS working (https://swhubco.com)
- [ ] HTTP redirects to HTTPS
- [ ] WebSocket working (chat feature)
- [ ] SSL grade A+ (SSLLabs test)

---

## 🌐 Access URLs

After setup:
- **Production**: https://swhubco.com
- **WWW**: https://www.swhubco.com
- **Health Check**: https://swhubco.com/api/health

---

## 📞 Support

If you encounter issues:
1. Check logs: `sudo tail -f /var/log/nginx/error.log`
2. Verify app is running: `docker ps`
3. Test locally: `curl http://localhost:5000`
4. Check DNS: `nslookup swhubco.com`

---

**Last Updated**: 2026-01-30  
**Domain**: swhubco.com  
**Status**: Ready for setup
