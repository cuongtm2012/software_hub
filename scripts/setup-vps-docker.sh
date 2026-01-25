#!/bin/bash

# VPS Setup Script with Docker Support
# Installs Docker, Docker Compose, and prepares environment

set -e

echo "=================================="
echo "VPS Setup with Docker"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    print_error "Please run as root (use: sudo bash setup-vps-docker.sh)"
    exit 1
fi

# Step 1: Update system
print_info "Step 1: Updating system..."
apt update && apt upgrade -y
print_success "System updated"
echo ""

# Step 2: Install Docker
print_info "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Install prerequisites
    apt install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker installed: $(docker --version)"
else
    print_warning "Docker already installed: $(docker --version)"
fi
echo ""

# Step 3: Install Docker Compose (standalone)
print_info "Step 3: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed: $(docker-compose --version)"
else
    print_warning "Docker Compose already installed: $(docker-compose --version)"
fi
echo ""

# Step 4: Configure Docker
print_info "Step 4: Configuring Docker..."

# Create Docker daemon config
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
print_success "Docker configured"
echo ""

# Step 5: Install additional tools
print_info "Step 5: Installing additional tools..."
apt install -y git curl wget htop
print_success "Additional tools installed"
echo ""

# Step 6: Configure firewall
print_info "Step 6: Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp  # Application port
    ufw allow 3001/tcp  # Chat service port
    ufw reload
    print_success "Firewall configured"
else
    apt install -y ufw
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw allow 3001/tcp
    print_success "UFW installed and configured"
fi
echo ""

# Step 7: Create project directory
print_info "Step 7: Creating project directory..."
PROJECT_PATH="/var/www/software-hub"
mkdir -p $PROJECT_PATH
chown -R root:root $PROJECT_PATH
chmod -R 755 $PROJECT_PATH
print_success "Project directory created: $PROJECT_PATH"
echo ""

# Step 8: Clone repository (optional)
read -p "Do you want to clone the repository now? (yes/no): " CLONE_REPO
if [ "$CLONE_REPO" = "yes" ]; then
    read -p "Enter repository URL: " REPO_URL
    if [ -n "$REPO_URL" ]; then
        print_info "Cloning repository..."
        cd /var/www
        rm -rf software-hub
        git clone $REPO_URL software-hub
        cd software-hub
        print_success "Repository cloned"
    fi
fi
echo ""

# Step 9: Create environment file
print_info "Step 9: Creating environment file..."
cd $PROJECT_PATH

if [ -f ".env.production.template" ]; then
    cp .env.production.template .env.production
else
    cat > .env.production << EOF
# Production Environment Variables
DB_NAME=software_hub
DB_USER=software_hub_user
DB_PASSWORD=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
EOF
fi

chmod 600 .env.production
print_success ".env.production created"
echo ""

# Step 10: Setup fail2ban
print_info "Step 10: Installing fail2ban..."
if ! command -v fail2ban-client &> /dev/null; then
    apt install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    print_success "fail2ban installed"
else
    print_warning "fail2ban already installed"
fi
echo ""

# Summary
echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
print_success "VPS is ready for Docker deployment"
echo ""
echo "Installed Software:"
echo "  - Docker: $(docker --version)"
echo "  - Docker Compose: $(docker-compose --version)"
echo "  - Git: $(git --version | head -1)"
echo ""
echo "Next steps:"
echo "  1. Update .env.production: nano $PROJECT_PATH/.env.production"
echo "  2. Configure GitHub Secrets:"
echo "     - SSH_HOST: $(curl -s ifconfig.me)"
echo "     - SSH_USERNAME: root"
echo "     - SSH_KEY: (your private SSH key)"
echo "     - SSH_PORT: 22"
echo "  3. Deploy from GitHub Actions or manually:"
echo "     cd $PROJECT_PATH"
echo "     docker-compose -f docker-compose.production.yml up -d"
echo ""
print_warning "IMPORTANT: Save the generated passwords from .env.production!"
echo ""
