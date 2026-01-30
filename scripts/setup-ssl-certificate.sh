#!/bin/bash

# SSL Certificate Setup Script for swhubco.com
# This script sets up Let's Encrypt SSL certificate using certbot

set -e

echo "=========================================="
echo "SSL Certificate Setup for swhubco.com"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Configuration
DOMAIN="swhubco.com"
WWW_DOMAIN="www.swhubco.com"
SERVER_IP="95.111.253.111"
SERVER_IP_V6="2a02:c207:2304:2468::1"
EMAIL="admin@swhubco.com"
WEBROOT="/var/www/html"
ACME_DIR="$WEBROOT/.well-known/acme-challenge"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash setup-ssl-certificate.sh)"
    exit 1
fi

# Step 1: Check DNS Configuration
print_info "Step 1: Verifying DNS configuration..."
echo ""

verify_dns() {
    local domain=$1
    local expected_ip=$2
    local record_type=${3:-A}
    
    print_info "Checking $record_type record for $domain..."
    
    if command -v dig &> /dev/null; then
        result=$(dig +short $domain $record_type | head -n1)
    elif command -v nslookup &> /dev/null; then
        if [ "$record_type" = "A" ]; then
            result=$(nslookup $domain | grep "Address:" | tail -n1 | awk '{print $2}')
        else
            result=$(nslookup -type=AAAA $domain | grep "Address:" | tail -n1 | awk '{print $2}')
        fi
    else
        print_warning "Neither dig nor nslookup found. Skipping DNS check."
        return 0
    fi
    
    if [ -z "$result" ]; then
        print_error "No $record_type record found for $domain"
        return 1
    fi
    
    if [ "$result" = "$expected_ip" ]; then
        print_success "$domain → $result (correct)"
        return 0
    else
        print_error "$domain → $result (expected: $expected_ip)"
        return 1
    fi
}

# Verify DNS
dns_ok=true
verify_dns "$DOMAIN" "$SERVER_IP" "A" || dns_ok=false
verify_dns "$WWW_DOMAIN" "$SERVER_IP" "A" || dns_ok=false

if [ "$dns_ok" = false ]; then
    echo ""
    print_error "DNS is not pointing to this server!"
    echo ""
    echo "Please update your DNS records:"
    echo "  $DOMAIN       A     $SERVER_IP"
    echo "  $WWW_DOMAIN   A     $SERVER_IP"
    echo ""
    echo "After updating DNS, wait 10-60 minutes for propagation,"
    echo "then run this script again."
    echo ""
    read -p "Continue anyway? (yes/no): " FORCE_CONTINUE
    if [ "$FORCE_CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

echo ""

# Step 2: Install Certbot
print_info "Step 2: Checking certbot installation..."

if ! command -v certbot &> /dev/null; then
    print_info "Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot already installed: $(certbot --version)"
fi

echo ""

# Step 3: Prepare webroot directory
print_info "Step 3: Preparing webroot directory..."

mkdir -p "$ACME_DIR"
chmod -R 755 "$WEBROOT"
chown -R www-data:www-data "$WEBROOT"

# Create test file
echo "certbot-test" > "$ACME_DIR/test.txt"

print_success "Webroot directory ready: $WEBROOT"

# Test if nginx can serve the test file
print_info "Testing ACME challenge accessibility..."
sleep 2

if curl -sf "http://$DOMAIN/.well-known/acme-challenge/test.txt" > /dev/null 2>&1; then
    print_success "ACME challenge path is accessible"
    rm -f "$ACME_DIR/test.txt"
else
    print_warning "Cannot access ACME challenge path via HTTP"
    print_info "This might be okay if nginx will be configured by certbot"
fi

echo ""

# Step 4: Check Nginx configuration
print_info "Step 4: Checking nginx configuration..."

if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed!"
    exit 1
fi

if nginx -t 2>&1 | grep -q "syntax is ok"; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    nginx -t
    exit 1
fi

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_warning "Nginx is not running. Starting..."
    systemctl start nginx
    print_success "Nginx started"
fi

echo ""

# Step 5: Check firewall
print_info "Step 5: Checking firewall configuration..."

if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        if ufw status | grep -qE "80.*ALLOW" && ufw status | grep -qE "443.*ALLOW"; then
            print_success "Firewall allows HTTP (80) and HTTPS (443)"
        else
            print_warning "Firewall might be blocking HTTP/HTTPS"
            print_info "Opening ports 80 and 443..."
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw reload
            print_success "Ports opened"
        fi
    else
        print_info "UFW firewall is not active"
    fi
else
    print_info "UFW not found, skipping firewall check"
fi

echo ""

# Step 6: Obtain SSL Certificate
print_info "Step 6: Obtaining SSL certificate..."
echo ""
print_warning "Make sure your domain DNS is pointing to this server IP!"
echo "Server IP: $SERVER_IP"
echo ""
read -p "Press Enter to continue with SSL setup, or Ctrl+C to cancel..."

echo ""
print_info "Running certbot..."

# Try to obtain certificate
if certbot --nginx \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    --hsts \
    --staple-ocsp; then
    
    print_success "SSL certificate obtained successfully!"
else
    print_error "SSL setup failed. Please check:"
    echo "1. DNS is pointing to this server"
    echo "2. Port 80 and 443 are open"
    echo "3. Domain is accessible"
    echo ""
    echo "You can run SSL setup manually later:"
    echo "certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
    exit 1
fi

echo ""

# Step 7: Setup Auto-renewal
print_info "Step 7: Setting up SSL auto-renewal..."

# Test renewal
if certbot renew --dry-run > /dev/null 2>&1; then
    print_success "SSL auto-renewal is configured and working"
else
    print_warning "SSL auto-renewal test failed"
fi

# Ensure certbot timer is enabled (systemd)
if systemctl list-timers | grep -q "certbot"; then
    print_success "Certbot renewal timer is active"
else
    print_info "Enabling certbot renewal timer..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
fi

echo ""

# Step 8: Configure Firewall (final)
print_info "Step 8: Configuring firewall..."

if command -v ufw &> /dev/null; then
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw reload > /dev/null 2>&1
    print_success "Firewall configured"
fi

echo ""

# Summary
echo "=========================================="
print_success "Domain setup completed!"
echo "=========================================="
echo ""
echo "🌐 Your site should now be accessible at:"
echo "   - https://$DOMAIN"
echo "   - https://$WWW_DOMAIN"
echo ""
echo "📋 Next steps:"
echo "1. Verify DNS is pointing to: $SERVER_IP"
echo "2. Test the site: curl -I https://$DOMAIN"
echo "3. Check SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "🔧 Useful commands:"
echo "   - Check Nginx status: systemctl status nginx"
echo "   - View Nginx logs: tail -f /var/log/nginx/error.log"
echo "   - Renew SSL manually: certbot renew"
echo "   - Test SSL renewal: certbot renew --dry-run"
echo ""
