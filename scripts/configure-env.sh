#!/bin/bash

# Configure Environment Script for Docker Deployment
# Automatically sets up .env.production with secure defaults

set -e

echo "=================================="
echo "Environment Configuration"
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

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    print_warning ".env.production already exists!"
    read -p "Do you want to overwrite it? (yes/no): " OVERWRITE
    if [ "$OVERWRITE" != "yes" ]; then
        print_info "Keeping existing .env.production"
        exit 0
    fi
    # Backup existing file
    cp .env.production .env.production.backup.$(date +%Y%m%d-%H%M%S)
    print_info "Backed up existing .env.production"
fi

print_info "Generating secure environment configuration..."
echo ""

# Generate secure random values
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
SESSION_SECRET=$(openssl rand -base64 32)

# Interactive prompts
print_info "Database Configuration"
read -p "Database name [software_hub]: " DB_NAME
DB_NAME=${DB_NAME:-software_hub}

read -p "Database user [software_hub_user]: " DB_USER
DB_USER=${DB_USER:-software_hub_user}

print_success "Generated secure database password"
echo ""

print_info "Email Configuration (Resend)"
read -p "Resend API Key (leave empty to skip): " RESEND_API_KEY
echo ""

print_info "OAuth Configuration (Optional - press Enter to skip)"
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "Facebook App ID: " FACEBOOK_APP_ID
read -p "Facebook App Secret: " FACEBOOK_APP_SECRET
echo ""

print_info "Application Configuration"
read -p "Application Port [3000]: " APP_PORT
APP_PORT=${APP_PORT:-3000}

read -p "Chat Service Port [3001]: " CHAT_PORT
CHAT_PORT=${CHAT_PORT:-3001}
echo ""

# Create .env.production file
print_info "Creating .env.production file..."

cat > .env.production << EOF
# ============================================
# Production Environment Variables
# Generated on: $(date)
# ============================================

# ============================================
# Database Configuration
# ============================================
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# ============================================
# Application Configuration
# ============================================
NODE_ENV=production
PORT=$APP_PORT

# Session Secret - Auto-generated secure random string
SESSION_SECRET=$SESSION_SECRET

# ============================================
# Email Service (Resend)
# ============================================
RESEND_API_KEY=$RESEND_API_KEY

# ============================================
# OAuth Providers (Optional)
# ============================================
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
FACEBOOK_APP_ID=$FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET

# ============================================
# Chat Service
# ============================================
CHAT_SERVICE_URL=http://chat-service:$CHAT_PORT

# ============================================
# External URLs (Update with your domain)
# ============================================
# FRONTEND_URL=http://95.111.253.111
# API_URL=http://95.111.253.111/api
EOF

# Set secure permissions
chmod 600 .env.production

print_success ".env.production created successfully!"
echo ""

# Display summary
echo "=================================="
echo "Configuration Summary"
echo "=================================="
echo ""
echo "Database:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Application:"
echo "  Port: $APP_PORT"
echo "  Chat Port: $CHAT_PORT"
echo ""
echo "Session Secret: $SESSION_SECRET"
echo ""

if [ -n "$RESEND_API_KEY" ]; then
    echo "Email: Configured ✓"
else
    echo "Email: Not configured (optional)"
fi
echo ""

if [ -n "$GOOGLE_CLIENT_ID" ]; then
    echo "Google OAuth: Configured ✓"
else
    echo "Google OAuth: Not configured (optional)"
fi
echo ""

if [ -n "$FACEBOOK_APP_ID" ]; then
    echo "Facebook OAuth: Configured ✓"
else
    echo "Facebook OAuth: Not configured (optional)"
fi
echo ""

# Save credentials to a secure file
CREDENTIALS_FILE=".credentials-$(date +%Y%m%d-%H%M%S).txt"
cat > $CREDENTIALS_FILE << EOF
Software Hub - Production Credentials
Generated: $(date)

Database Password: $DB_PASSWORD
Session Secret: $SESSION_SECRET

IMPORTANT: Keep this file secure and delete after saving credentials to a password manager!
EOF

chmod 600 $CREDENTIALS_FILE

print_warning "IMPORTANT: Credentials saved to: $CREDENTIALS_FILE"
print_warning "Please save these credentials securely and delete this file!"
echo ""

# Next steps
echo "=================================="
echo "Next Steps"
echo "=================================="
echo ""
print_info "1. Review .env.production:"
echo "   nano .env.production"
echo ""
print_info "2. Update PostgreSQL password in database:"
echo "   sudo -u postgres psql"
echo "   ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
echo "   \q"
echo ""
print_info "3. Deploy application:"
echo "   make deploy"
echo ""
print_info "4. Or start with Docker Compose:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
print_success "Configuration complete!"
echo ""
