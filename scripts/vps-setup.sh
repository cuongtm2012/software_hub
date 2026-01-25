#!/bin/bash

# VPS Initial Setup Script for Software Hub
# Run this script on your VPS (95.111.253.111) as root

set -e

echo "🚀 Starting Software Hub VPS Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Update system
print_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js 20.x
print_info "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
print_success "Node.js $(node --version) installed"

# Install PM2
print_info "Installing PM2 process manager..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
print_success "PM2 installed"

# Install Nginx
print_info "Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
print_success "Nginx installed"

# Install PostgreSQL
print_info "Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
print_success "PostgreSQL installed"

# Install Git
print_info "Installing Git..."
apt-get install -y git
print_success "Git installed"

# Create project directory
print_info "Creating project directory..."
mkdir -p /var/www/software-hub
cd /var/www/software-hub
print_success "Project directory created at /var/www/software-hub"

# Create log directory
print_info "Creating log directory..."
mkdir -p /var/log
touch /var/log/software-hub-deploy.log
chmod 644 /var/log/software-hub-deploy.log
print_success "Log directory configured"

# Setup PostgreSQL database
print_info "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE software_hub;
CREATE USER software_hub_user WITH ENCRYPTED PASSWORD 'changeme_secure_password';
GRANT ALL PRIVILEGES ON DATABASE software_hub TO software_hub_user;
\q
EOF
print_success "PostgreSQL database created"

# Configure firewall
print_info "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Copy Nginx configuration
print_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/software-hub << 'NGINX_EOF'
server {
    listen 80;
    server_name 95.111.253.111;

    root /var/www/software-hub/dist;
    index index.html;

    location /assets {
        alias /var/www/software-hub/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
print_success "Nginx configured and started"

# Create deployment script
print_info "Creating deployment script..."
cat > /var/www/deploy.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

PROJECT_PATH="/var/www/software-hub"
LOG_FILE="/var/log/software-hub-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting deployment..."
cd $PROJECT_PATH

if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

log "Stopping services..."
pm2 stop all || true

log "Starting services..."
pm2 start ecosystem.config.js --env production
pm2 save

log "Deployment completed!"
pm2 list
DEPLOY_EOF

chmod +x /var/www/deploy.sh
print_success "Deployment script created"

# Create environment file template
print_info "Creating environment file template..."
cat > /var/www/software-hub/.env.production << 'ENV_EOF'
# Database
DATABASE_URL=postgresql://software_hub_user:changeme_secure_password@localhost:5432/software_hub

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=CHANGE_ME_TO_RANDOM_STRING

# Email
RESEND_API_KEY=your_resend_api_key

# Add other environment variables as needed
ENV_EOF
print_success "Environment file template created"

# Print summary
echo ""
echo "=========================================="
echo "✅ VPS Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Edit environment variables:"
echo "   nano /var/www/software-hub/.env.production"
echo ""
echo "2. Update PostgreSQL password:"
echo "   sudo -u postgres psql"
echo "   ALTER USER software_hub_user WITH PASSWORD 'your_secure_password';"
echo ""
echo "3. Configure GitHub Secrets:"
echo "   - SSH_PRIVATE_KEY"
echo "   - REMOTE_HOST: 95.111.253.111"
echo "   - REMOTE_USER: root"
echo ""
echo "4. Push to GitHub main branch to trigger deployment"
echo ""
echo "📊 Installed Software:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo "   - Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "   - PostgreSQL: $(psql --version | cut -d' ' -f3)"
echo ""
echo "🔧 Useful Commands:"
echo "   - Check PM2 processes: pm2 list"
echo "   - View logs: pm2 logs"
echo "   - Check Nginx: systemctl status nginx"
echo "   - View deployment log: tail -f /var/log/software-hub-deploy.log"
echo ""
echo "=========================================="
