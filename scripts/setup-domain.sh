#!/bin/bash

# ============================================
# Domain Setup Script for swhubco.com
# ============================================
# This script configures Nginx and SSL for the domain

set -e

echo "🌐 Setting up domain: swhubco.com"

DOMAIN="swhubco.com"
EMAIL="admin@swhubco.com"  # Change this to your email

# Step 1: Install Nginx
echo "📦 Installing Nginx..."
apt update
apt install -y nginx

# Step 2: Create Nginx configuration
echo "⚙️  Creating Nginx configuration..."
cat > /etc/nginx/sites-available/swhubco.com << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name swhubco.com www.swhubco.com;

    # Redirect to HTTPS (will be configured by Certbot)
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support for chat
    location /socket.io/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Client max body size (for uploads)
    client_max_body_size 50M;
}
EOF

# Step 3: Enable site
echo "✅ Enabling site..."
ln -sf /etc/nginx/sites-available/swhubco.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Step 4: Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Step 5: Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# Step 6: Install Certbot for SSL
echo "🔐 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Step 7: Get SSL certificate
echo "📜 Obtaining SSL certificate..."
echo "⚠️  Make sure your domain DNS is pointing to this server IP!"
echo "Server IP: $(curl -s ifconfig.me)"
echo ""
read -p "Press Enter to continue with SSL setup, or Ctrl+C to cancel..."

certbot --nginx -d swhubco.com -d www.swhubco.com --non-interactive --agree-tos -m "$EMAIL" || {
    echo "❌ SSL setup failed. Please check:"
    echo "1. DNS is pointing to this server"
    echo "2. Port 80 and 443 are open"
    echo "3. Domain is accessible"
    echo ""
    echo "You can run SSL setup manually later:"
    echo "certbot --nginx -d swhubco.com -d www.swhubco.com"
}

# Step 8: Setup auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Step 9: Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw --force enable

echo ""
echo "✅ Domain setup completed!"
echo ""
echo "🌐 Your site should now be accessible at:"
echo "   - https://swhubco.com"
echo "   - https://www.swhubco.com"
echo ""
echo "📋 Next steps:"
echo "1. Verify DNS is pointing to: $(curl -s ifconfig.me)"
echo "2. Test the site: curl -I https://swhubco.com"
echo "3. Check SSL: https://www.ssllabs.com/ssltest/analyze.html?d=swhubco.com"
echo ""
echo "🔧 Useful commands:"
echo "   - Check Nginx status: systemctl status nginx"
echo "   - View Nginx logs: tail -f /var/log/nginx/error.log"
echo "   - Renew SSL manually: certbot renew"
echo "   - Test SSL renewal: certbot renew --dry-run"
