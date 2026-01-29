#!/bin/bash

# Complete VPS Deployment Script
# This script sets up everything needed for Software Hub on a fresh VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Software Hub - Complete VPS Setup   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Step 1: Update System
echo -e "${BLUE}[1/10] Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Node.js 20.x
echo -e "${BLUE}[2/10] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
echo -e "${GREEN}✓ npm $(npm --version) installed${NC}"
echo ""

# Step 3: Install PM2
echo -e "${BLUE}[3/10] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  pm2 startup systemd -u root --hp /root
fi
echo -e "${GREEN}✓ PM2 $(pm2 --version) installed${NC}"
echo ""

# Step 4: Install Nginx
echo -e "${BLUE}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  apt-get install -y nginx
  systemctl enable nginx
fi
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

# Step 5: Install PostgreSQL
echo -e "${BLUE}[5/10] Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
  # Wait for PostgreSQL to be ready
  sleep 2
else
  # Ensure PostgreSQL is running even if already installed
  if ! systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL is installed but not running. Starting...${NC}"
    systemctl start postgresql
    sleep 2
  fi
fi

# Verify PostgreSQL is running
if systemctl is-active --quiet postgresql; then
  echo -e "${GREEN}✓ PostgreSQL installed and running${NC}"
else
  echo -e "${RED}❌ PostgreSQL failed to start${NC}"
  systemctl status postgresql --no-pager | head -10
  exit 1
fi
echo ""

# Step 6: Install Redis (for sessions and caching)
echo -e "${BLUE}[6/10] Installing Redis...${NC}"
if ! command -v redis-cli &> /dev/null; then
  apt-get install -y redis-server
  systemctl enable redis-server
  systemctl start redis-server
fi
echo -e "${GREEN}✓ Redis installed${NC}"
echo ""

# Step 7: Install MongoDB (for chat service)
echo -e "${BLUE}[7/10] Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
  # Detect Ubuntu version
  UBUNTU_VERSION=$(lsb_release -cs)
  
  # MongoDB 7.0 doesn't support Ubuntu Noble yet, use Jammy repository
  if [ "$UBUNTU_VERSION" = "noble" ]; then
    echo -e "${YELLOW}⚠️  Ubuntu Noble detected, using Jammy repository for MongoDB${NC}"
    MONGO_UBUNTU_VERSION="jammy"
  else
    MONGO_UBUNTU_VERSION="$UBUNTU_VERSION"
  fi
  
  # Try to install MongoDB from official repository
  if curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
     gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor 2>/dev/null; then
    
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $MONGO_UBUNTU_VERSION/mongodb-org/7.0 multiverse" | \
      tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    apt-get update -qq
    
    if apt-get install -y mongodb-org 2>/dev/null; then
      systemctl enable mongod
      systemctl start mongod
      echo -e "${GREEN}✓ MongoDB 7.0 installed from official repository${NC}"
    else
      # Fallback to Ubuntu's MongoDB package
      echo -e "${YELLOW}⚠️  Official MongoDB failed, installing from Ubuntu repository${NC}"
      apt-get install -y mongodb
      systemctl enable mongodb
      systemctl start mongodb
      echo -e "${GREEN}✓ MongoDB installed from Ubuntu repository${NC}"
    fi
  else
    # Fallback to Ubuntu's MongoDB package
    echo -e "${YELLOW}⚠️  Installing MongoDB from Ubuntu repository${NC}"
    apt-get install -y mongodb
    systemctl enable mongodb
    systemctl start mongodb
    echo -e "${GREEN}✓ MongoDB installed from Ubuntu repository${NC}"
  fi
fi
echo ""

# Step 8: Install Git
echo -e "${BLUE}[8/10] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
  apt-get install -y git
fi
echo -e "${GREEN}✓ Git installed${NC}"
echo ""

# Step 9: Setup Project Directory
echo -e "${BLUE}[9/10] Setting up project directory...${NC}"
mkdir -p /var/www/software-hub
mkdir -p /var/log
touch /var/log/software-hub-deploy.log
chmod 644 /var/log/software-hub-deploy.log
echo -e "${GREEN}✓ Project directory created at /var/www/software-hub${NC}"
echo ""

# Step 10: Setup Database
echo -e "${BLUE}[10/10] Setting up PostgreSQL database...${NC}"

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Create database and user
sudo -u postgres psql << EOF
-- Drop if exists
DROP DATABASE IF EXISTS software_hub;
DROP USER IF EXISTS software_hub_user;

-- Create new
CREATE DATABASE software_hub;
CREATE USER software_hub_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE software_hub TO software_hub_user;

-- Grant schema permissions
\c software_hub
GRANT ALL ON SCHEMA public TO software_hub_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO software_hub_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO software_hub_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO software_hub_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO software_hub_user;
EOF

echo -e "${GREEN}✓ PostgreSQL database created${NC}"
echo ""

# Setup MongoDB
echo -e "${BLUE}Setting up MongoDB...${NC}"
MONGO_PASSWORD=$(openssl rand -base64 32)

mongosh << EOF
use admin
db.createUser({
  user: "admin",
  pwd: "$MONGO_PASSWORD",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
use softwarehub-chat
db.createUser({
  user: "chatuser",
  pwd: "$MONGO_PASSWORD",
  roles: [ { role: "readWrite", db: "softwarehub-chat" } ]
})
EOF

echo -e "${GREEN}✓ MongoDB configured${NC}"
echo ""

# Configure Firewall
echo -e "${BLUE}Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Configure Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"
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

# Create environment file
echo -e "${BLUE}Creating environment file...${NC}"

# Generate secure secrets
SESSION_SECRET=$(openssl rand -base64 48)
JWT_SECRET=$(openssl rand -base64 48)

cat > /var/www/software-hub/.env.production << ENV_EOF
# Database
DATABASE_URL=postgresql://software_hub_user:${DB_PASSWORD}@localhost:5432/software_hub
POSTGRES_DB=software_hub
POSTGRES_USER=software_hub_user
POSTGRES_PASSWORD=${DB_PASSWORD}

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=${SESSION_SECRET}

# Microservice URLs
EMAIL_SERVICE_URL=http://localhost:3001
CHAT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB (for chat service)
MONGODB_URL=mongodb://admin:${MONGO_PASSWORD}@localhost:27017/softwarehub-chat?authSource=admin

# JWT
JWT_SECRET=${JWT_SECRET}

# Email Service (SendGrid) - REPLACE WITH YOUR KEYS
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_email@domain.com

# Firebase (for push notifications) - REPLACE WITH YOUR KEYS
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Storage (Cloudflare R2) - REPLACE WITH YOUR KEYS
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_ENDPOINT=https://your_endpoint

# Payment (Stripe) - REPLACE WITH YOUR KEYS
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
ENV_EOF

chmod 600 /var/www/software-hub/.env.production
echo -e "${GREEN}✓ Environment file created${NC}"
echo ""

# Save credentials
CREDENTIALS_FILE="/root/software-hub-credentials.txt"
cat > $CREDENTIALS_FILE << CRED_EOF
╔════════════════════════════════════════════════════════════╗
║           Software Hub - Deployment Credentials            ║
╚════════════════════════════════════════════════════════════╝

Generated: $(date)

PostgreSQL Database:
  Database: software_hub
  User: software_hub_user
  Password: ${DB_PASSWORD}
  Connection: postgresql://software_hub_user:${DB_PASSWORD}@localhost:5432/software_hub

MongoDB:
  Database: softwarehub-chat
  User: admin
  Password: ${MONGO_PASSWORD}
  Connection: mongodb://admin:${MONGO_PASSWORD}@localhost:27017/softwarehub-chat?authSource=admin

Application Secrets:
  SESSION_SECRET: ${SESSION_SECRET}
  JWT_SECRET: ${JWT_SECRET}

⚠️  IMPORTANT: 
  1. Save these credentials securely
  2. Update .env.production with your API keys (SendGrid, Firebase, Stripe, etc.)
  3. Delete this file after saving credentials: rm $CREDENTIALS_FILE

Next Steps:
  1. Configure GitHub Secrets (see docs/VPS_DEPLOYMENT_GUIDE.md)
  2. Push code to GitHub to trigger deployment
  3. Import database: scp database/dumps/* root@95.111.253.111:/tmp/
  4. Run: sudo -u postgres psql -d software_hub < /tmp/dumps/schema_*.sql
  5. Run: sudo -u postgres psql -d software_hub < /tmp/dumps/data_*.sql

CRED_EOF

chmod 600 $CREDENTIALS_FILE

# Print summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              VPS Setup Complete! 🎉                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Installed Software:${NC}"
echo "   • Node.js: $(node --version)"
echo "   • npm: $(npm --version)"
echo "   • PM2: $(pm2 --version)"
echo "   • Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "   • PostgreSQL: $(psql --version | cut -d' ' -f3)"
echo "   • Redis: $(redis-cli --version | cut -d' ' -f2)"
echo "   • MongoDB: $(mongod --version | head -1 | cut -d' ' -f3)"
echo ""
echo -e "${YELLOW}🔐 Credentials saved to:${NC} $CREDENTIALS_FILE"
echo -e "${YELLOW}📝 Environment file:${NC} /var/www/software-hub/.env.production"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "   1. View credentials: cat $CREDENTIALS_FILE"
echo "   2. Update .env.production with your API keys"
echo "   3. Configure GitHub Secrets (SSH_HOST, SSH_USERNAME, SSH_KEY)"
echo "   4. Import database dumps"
echo "   5. Push code to GitHub to trigger deployment"
echo ""
echo -e "${YELLOW}📖 Full documentation:${NC} docs/VPS_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}✨ Your VPS is ready for deployment!${NC}"
echo ""
