#!/bin/bash

# Automated VPS Setup Script for Contabo
# Run this script on your VPS to set up the environment for deployment

set -e

echo "=================================="
echo "VPS Setup Script for Software Hub"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash setup-vps.sh)"
    exit 1
fi

print_info "Starting VPS setup..."
echo ""

# 1. Update system
print_info "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"
echo ""

# 2. Install Node.js 20
print_info "Step 2: Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js installed: $(node -v)"
else
    print_warning "Node.js already installed: $(node -v)"
fi
echo ""

# 3. Install build tools
print_info "Step 3: Installing build tools..."
apt install -y build-essential git curl wget
print_success "Build tools installed"
echo ""

# 4. Install PM2
print_info "Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    print_success "PM2 installed and configured"
else
    print_warning "PM2 already installed: $(pm2 -v)"
fi
echo ""

# 5. Install PostgreSQL
print_info "Step 5: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL installed and started"
else
    print_warning "PostgreSQL already installed"
fi
echo ""

# 6. Create database and user
print_info "Step 6: Setting up database..."
read -p "Enter database name (default: software_hub): " DB_NAME
DB_NAME=${DB_NAME:-software_hub}

read -p "Enter database user (default: software_hub_user): " DB_USER
DB_USER=${DB_USER:-software_hub_user}

read -sp "Enter database password: " DB_PASSWORD
echo ""

sudo -u postgres psql << EOF
-- Drop if exists (for clean setup)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create new
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- PostgreSQL 15+ requires additional grants
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

print_success "Database created: $DB_NAME"
echo ""

# 7. Install Nginx
print_info "Step 7: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi
echo ""

# 8. Configure Nginx
print_info "Step 8: Configuring Nginx..."
read -p "Enter server IP or domain (default: 95.111.253.111): " SERVER_NAME
SERVER_NAME=${SERVER_NAME:-95.111.253.111}

cat > /etc/nginx/sites-available/software-hub << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
print_success "Nginx configured for $SERVER_NAME"
echo ""

# 9. Configure Firewall
print_info "Step 9: Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw reload
    print_success "Firewall configured"
else
    apt install -y ufw
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    print_success "UFW installed and configured"
fi
echo ""

# 10. Create project directory
print_info "Step 10: Creating project directory..."
PROJECT_PATH="/root/Cuongtm2012"
mkdir -p $PROJECT_PATH
chown -R root:root $PROJECT_PATH
chmod -R 755 $PROJECT_PATH
print_success "Project directory created: $PROJECT_PATH"
echo ""

# 11. Create .env file
print_info "Step 11: Creating .env file..."
read -sp "Enter SESSION_SECRET (press Enter to generate random): " SESSION_SECRET
echo ""
if [ -z "$SESSION_SECRET" ]; then
    SESSION_SECRET=$(openssl rand -base64 32)
    print_info "Generated random SESSION_SECRET"
fi

cat > $PROJECT_PATH/.env << EOF
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

# Session
SESSION_SECRET=$SESSION_SECRET

# Email (Resend) - Add your API key
RESEND_API_KEY=

# OAuth - Add your credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
EOF

chmod 600 $PROJECT_PATH/.env
print_success ".env file created (remember to add API keys)"
echo ""

# 12. Setup SSH for GitHub Actions
print_info "Step 12: Setting up SSH for GitHub Actions..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

print_warning "Add your GitHub Actions public key to ~/.ssh/authorized_keys"
print_info "You can do this by running: nano ~/.ssh/authorized_keys"
echo ""

# 13. Install fail2ban for security
print_info "Step 13: Installing fail2ban..."
if ! command -v fail2ban-client &> /dev/null; then
    apt install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    print_success "fail2ban installed and started"
else
    print_warning "fail2ban already installed"
fi
echo ""

# 14. Setup PM2 log rotation
print_info "Step 14: Setting up PM2 log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
print_success "PM2 log rotation configured"
echo ""

# 15. Create backup directory
print_info "Step 15: Creating backup directory..."
mkdir -p /root/backups
print_success "Backup directory created"
echo ""

# Summary
echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
print_success "VPS is now ready for deployment"
echo ""
echo "Next steps:"
echo "1. Add your GitHub Actions public key to: ~/.ssh/authorized_keys"
echo "2. Update .env file with your API keys: nano $PROJECT_PATH/.env"
echo "3. Configure GitHub Secrets with:"
echo "   - SSH_HOST: $SERVER_NAME"
echo "   - SSH_USERNAME: root"
echo "   - SSH_KEY: (your private key)"
echo "   - SSH_PORT: 22"
echo "4. Test SSH connection from your local machine"
echo "5. Trigger deployment from GitHub Actions"
echo ""
echo "Configuration Summary:"
echo "  - Node.js: $(node -v)"
echo "  - npm: $(npm -v)"
echo "  - PM2: $(pm2 -v)"
echo "  - PostgreSQL: $(psql --version | awk '{print $3}')"
echo "  - Nginx: $(nginx -v 2>&1 | awk -F'/' '{print $2}')"
echo "  - Database: $DB_NAME"
echo "  - Database User: $DB_USER"
echo "  - Project Path: $PROJECT_PATH"
echo "  - Server: $SERVER_NAME"
echo ""
print_warning "IMPORTANT: Save your database password securely!"
print_warning "Database Password: $DB_PASSWORD"
echo ""
