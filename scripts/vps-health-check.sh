#!/bin/bash

# VPS Health Check and Configuration Script
# This script helps verify VPS configuration for deployment

set -e

echo "=================================="
echo "VPS Configuration Health Check"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# 1. Check Node.js
echo "1. Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_status 0 "Node.js installed: $NODE_VERSION"
    if [[ "$NODE_VERSION" == v20* ]]; then
        print_status 0 "Node.js version is correct (v20.x)"
    else
        print_status 1 "Node.js version should be v20.x"
    fi
else
    print_status 1 "Node.js not installed"
fi
echo ""

# 2. Check npm
echo "2. Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_status 0 "npm installed: $NPM_VERSION"
else
    print_status 1 "npm not installed"
fi
echo ""

# 3. Check PM2
echo "3. Checking PM2..."
if command_exists pm2; then
    PM2_VERSION=$(pm2 -v)
    print_status 0 "PM2 installed: $PM2_VERSION"
else
    print_status 1 "PM2 not installed (run: npm install -g pm2)"
fi
echo ""

# 4. Check PostgreSQL
echo "4. Checking PostgreSQL..."
if command_exists psql; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_status 0 "PostgreSQL installed: $PSQL_VERSION"
    
    # Check if PostgreSQL is running
    if systemctl is-active --quiet postgresql; then
        print_status 0 "PostgreSQL service is running"
    else
        print_status 1 "PostgreSQL service is not running"
    fi
else
    print_status 1 "PostgreSQL not installed"
fi
echo ""

# 5. Check Nginx
echo "5. Checking Nginx..."
if command_exists nginx; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk -F'/' '{print $2}')
    print_status 0 "Nginx installed: $NGINX_VERSION"
    
    # Check if Nginx is running
    if systemctl is-active --quiet nginx; then
        print_status 0 "Nginx service is running"
    else
        print_status 1 "Nginx service is not running"
    fi
else
    print_status 1 "Nginx not installed"
fi
echo ""

# 6. Check SSH Configuration
echo "6. Checking SSH Configuration..."
if [ -f /etc/ssh/sshd_config ]; then
    SSH_PORT=$(grep "^Port" /etc/ssh/sshd_config | awk '{print $2}')
    if [ -z "$SSH_PORT" ]; then
        SSH_PORT="22 (default)"
    fi
    print_status 0 "SSH Port: $SSH_PORT"
    
    PERMIT_ROOT=$(grep "^PermitRootLogin" /etc/ssh/sshd_config | awk '{print $2}')
    if [ -z "$PERMIT_ROOT" ]; then
        PERMIT_ROOT="yes (default)"
    fi
    print_status 0 "PermitRootLogin: $PERMIT_ROOT"
else
    print_status 1 "SSH config file not found"
fi
echo ""

# 7. Check authorized_keys
echo "7. Checking SSH authorized_keys..."
if [ -f ~/.ssh/authorized_keys ]; then
    KEY_COUNT=$(wc -l < ~/.ssh/authorized_keys)
    print_status 0 "authorized_keys exists with $KEY_COUNT key(s)"
    
    # Check permissions
    PERMS=$(stat -c %a ~/.ssh/authorized_keys 2>/dev/null || stat -f %A ~/.ssh/authorized_keys)
    if [ "$PERMS" == "600" ]; then
        print_status 0 "authorized_keys permissions are correct (600)"
    else
        print_status 1 "authorized_keys permissions are incorrect ($PERMS, should be 600)"
    fi
else
    print_status 1 "authorized_keys file not found"
fi
echo ""

# 8. Check Firewall
echo "8. Checking Firewall..."
if command_exists ufw; then
    UFW_STATUS=$(ufw status | head -1)
    echo "UFW: $UFW_STATUS"
    if [[ "$UFW_STATUS" == *"active"* ]]; then
        print_status 0 "UFW is active"
        echo "Open ports:"
        ufw status | grep ALLOW | awk '{print "  - " $1}'
    else
        print_status 1 "UFW is inactive"
    fi
else
    echo "UFW not installed, checking iptables..."
    if command_exists iptables; then
        print_status 0 "iptables is available"
    else
        print_status 1 "No firewall detected"
    fi
fi
echo ""

# 9. Check Project Directory
echo "9. Checking Project Directory..."
PROJECT_PATH="/root/Cuongtm2012"
if [ -d "$PROJECT_PATH" ]; then
    print_status 0 "Project directory exists: $PROJECT_PATH"
    
    # Check permissions
    PERMS=$(stat -c %a "$PROJECT_PATH" 2>/dev/null || stat -f %A "$PROJECT_PATH")
    print_status 0 "Directory permissions: $PERMS"
    
    # Check if .env exists
    if [ -f "$PROJECT_PATH/.env" ]; then
        print_status 0 ".env file exists"
    else
        print_status 1 ".env file not found"
    fi
    
    # Check if node_modules exists
    if [ -d "$PROJECT_PATH/node_modules" ]; then
        print_status 0 "node_modules directory exists"
    else
        print_status 1 "node_modules not installed (run: npm ci --production)"
    fi
else
    print_status 1 "Project directory does not exist"
    echo -e "${YELLOW}Run: mkdir -p $PROJECT_PATH${NC}"
fi
echo ""

# 10. Check Disk Space
echo "10. Checking Disk Space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status 0 "Disk usage: ${DISK_USAGE}%"
else
    print_status 1 "Disk usage is high: ${DISK_USAGE}%"
fi
echo ""

# 11. Check Memory
echo "11. Checking Memory..."
if command_exists free; then
    TOTAL_MEM=$(free -h | awk 'NR==2 {print $2}')
    USED_MEM=$(free -h | awk 'NR==2 {print $3}')
    print_status 0 "Memory: $USED_MEM / $TOTAL_MEM used"
else
    print_status 1 "Cannot check memory usage"
fi
echo ""

# 12. Check if application is running
echo "12. Checking Application Status..."
if command_exists pm2; then
    if pm2 list | grep -q "software-hub"; then
        print_status 0 "Application is running in PM2"
        echo ""
        pm2 list | grep software-hub
    else
        print_status 1 "Application is not running in PM2"
    fi
else
    print_status 1 "PM2 not installed, cannot check application status"
fi
echo ""

# Summary
echo "=================================="
echo "Health Check Complete"
echo "=================================="
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Fix any issues marked with ✗"
echo "2. Ensure GitHub Secrets are configured correctly"
echo "3. Test SSH connection: ssh root@95.111.253.111"
echo "4. Trigger deployment from GitHub Actions"
echo ""
