#!/bin/bash

# VPS Docker Setup Script
# Prepares VPS for Docker-based deployment
# Run this ONCE on a fresh VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Software Hub - VPS Docker Setup     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Step 1: Update System
echo -e "${BLUE}[1/12] Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Stop and disable manual database services
echo -e "${BLUE}[2/12] Cleaning up manual database installations...${NC}"
if systemctl is-active --quiet postgresql 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Stopping PostgreSQL service...${NC}"
  systemctl stop postgresql
  systemctl disable postgresql
fi
if systemctl is-active --quiet mongodb 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Stopping MongoDB service...${NC}"
  systemctl stop mongodb
  systemctl disable mongodb
fi
if systemctl is-active --quiet mongod 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Stopping mongod service...${NC}"
  systemctl stop mongod
  systemctl disable mongod
fi
if systemctl is-active --quiet redis-server 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Stopping Redis service...${NC}"
  systemctl stop redis-server
  systemctl disable redis-server
fi
echo -e "${GREEN}✓ Manual services stopped${NC}"
echo ""

# Step 3: Install Docker
echo -e "${BLUE}[3/12] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  # Install prerequisites
  apt-get install -y ca-certificates curl gnupg lsb-release
  
  # Add Docker's official GPG key
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  
  # Set up repository
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  
  # Install Docker Engine
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  
  # Start and enable Docker
  systemctl start docker
  systemctl enable docker
  
  echo -e "${GREEN}✓ Docker $(docker --version) installed${NC}"
else
  echo -e "${GREEN}✓ Docker already installed: $(docker --version)${NC}"
fi
echo ""

# Step 4: Install Docker Compose
echo -e "${BLUE}[4/12] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_VERSION="v2.24.5"
  curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}✓ Docker Compose $(docker-compose --version) installed${NC}"
else
  echo -e "${GREEN}✓ Docker Compose already installed: $(docker-compose --version)${NC}"
fi
echo ""

# Step 5: Configure Docker
echo -e "${BLUE}[5/12] Configuring Docker...${NC}"
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
systemctl restart docker
echo -e "${GREEN}✓ Docker configured${NC}"
echo ""

# Step 6: Install Node.js 20.x
echo -e "${BLUE}[6/12] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
echo -e "${GREEN}✓ npm $(npm --version) installed${NC}"
echo ""

# Step 7: Install PM2
echo -e "${BLUE}[7/12] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  pm2 startup systemd -u root --hp /root
fi
echo -e "${GREEN}✓ PM2 $(pm2 --version) installed${NC}"
echo ""

# Step 8: Install Nginx
echo -e "${BLUE}[8/12] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  apt-get install -y nginx
  systemctl enable nginx
fi
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

# Step 9: Install additional tools
echo -e "${BLUE}[9/12] Installing additional tools...${NC}"
apt-get install -y git curl wget htop jq
echo -e "${GREEN}✓ Additional tools installed${NC}"
echo ""

# Step 10: Configure firewall
echo -e "${BLUE}[10/12] Configuring firewall...${NC}"
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Step 11: Create project directory
echo -e "${BLUE}[11/12] Creating project directory...${NC}"
PROJECT_PATH="/var/www/software-hub"
mkdir -p $PROJECT_PATH
mkdir -p /var/log/software-hub
chown -R root:root $PROJECT_PATH
chmod -R 755 $PROJECT_PATH
echo -e "${GREEN}✓ Project directory created: $PROJECT_PATH${NC}"
echo ""

# Step 12: Configure Nginx
echo -e "${BLUE}[12/12] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/software-hub << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    # Increase client body size for file uploads
    client_max_body_size 100M;

    # Root directory for static files
    root /var/www/software-hub/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Static assets with caching
    location /assets {
        alias /var/www/software-hub/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support for Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # SPA fallback - serve index.html for all other routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
echo -e "${GREEN}✓ Nginx configured and started${NC}"
echo ""

# Generate secure passwords
echo -e "${BLUE}Generating secure credentials...${NC}"
DB_PASSWORD=$(openssl rand -base64 32)
MONGO_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 48)
JWT_SECRET=$(openssl rand -base64 48)

# Create environment file
cat > $PROJECT_PATH/.env.production << ENV_EOF
# Database Configuration (Docker Containers)
POSTGRES_DB=softwarehub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/softwarehub

# MongoDB
MONGO_INITDB_DATABASE=softwarehub-chat
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
MONGODB_URL=mongodb://admin:${MONGO_PASSWORD}@localhost:27017/softwarehub-chat?authSource=admin

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=${SESSION_SECRET}
JWT_SECRET=${JWT_SECRET}

# Microservice URLs
EMAIL_SERVICE_URL=http://localhost:3001
CHAT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# Email Service (REPLACE WITH YOUR KEYS)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Firebase (REPLACE WITH YOUR KEYS)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Storage (REPLACE WITH YOUR KEYS)
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_ENDPOINT=https://your_endpoint

# Payment (REPLACE WITH YOUR KEYS)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Client URL
CLIENT_URL=http://$(curl -s ifconfig.me)
ENV_EOF

chmod 600 $PROJECT_PATH/.env.production
echo -e "${GREEN}✓ Environment file created${NC}"
echo ""

# Save credentials
CREDENTIALS_FILE="/root/software-hub-credentials.txt"
cat > $CREDENTIALS_FILE << CRED_EOF
╔════════════════════════════════════════════════════════════╗
║           Software Hub - VPS Credentials                   ║
╚════════════════════════════════════════════════════════════╝

Generated: $(date)

PostgreSQL (Docker):
  Database: softwarehub
  User: postgres
  Password: ${DB_PASSWORD}
  Connection: postgresql://postgres:${DB_PASSWORD}@localhost:5432/softwarehub

MongoDB (Docker):
  Database: softwarehub-chat
  User: admin
  Password: ${MONGO_PASSWORD}
  Connection: mongodb://admin:${MONGO_PASSWORD}@localhost:27017/softwarehub-chat?authSource=admin

Redis (Docker):
  Password: ${REDIS_PASSWORD}
  Connection: redis://:${REDIS_PASSWORD}@localhost:6379

Application Secrets:
  SESSION_SECRET: ${SESSION_SECRET}
  JWT_SECRET: ${JWT_SECRET}

⚠️  IMPORTANT: 
  1. Save these credentials securely
  2. Update .env.production with your API keys (SendGrid, Firebase, Stripe, etc.)
  3. Delete this file after saving: rm $CREDENTIALS_FILE

Next Steps:
  1. View credentials: cat $CREDENTIALS_FILE
  2. Update .env.production: nano /var/www/software-hub/.env.production
  3. Configure GitHub Secrets (SSH_HOST, SSH_USERNAME, SSH_KEY)
  4. Deploy from GitHub or manually

CRED_EOF

chmod 600 $CREDENTIALS_FILE

# Print summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              VPS Setup Complete! 🎉                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Installed Software:${NC}"
echo "   • Docker: $(docker --version)"
echo "   • Docker Compose: $(docker-compose --version)"
echo "   • Node.js: $(node --version)"
echo "   • npm: $(npm --version)"
echo "   • PM2: $(pm2 --version)"
echo "   • Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo -e "${YELLOW}🔐 Credentials saved to:${NC} $CREDENTIALS_FILE"
echo -e "${YELLOW}📝 Environment file:${NC} /var/www/software-hub/.env.production"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "   1. View credentials: cat $CREDENTIALS_FILE"
echo "   2. Update .env.production with your API keys"
echo "   3. Start Docker containers: cd /var/www/software-hub && docker-compose -f docker-compose.vps.yml up -d"
echo "   4. Import database dumps"
echo "   5. Deploy application code"
echo ""
echo -e "${GREEN}✨ Your VPS is ready for Docker deployment!${NC}"
echo ""
