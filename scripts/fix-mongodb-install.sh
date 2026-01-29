#!/bin/bash

# Quick Fix: Install MongoDB on Ubuntu Noble
# Run this on VPS if MongoDB installation failed

set -e

echo "🔧 Installing MongoDB (Ubuntu Noble compatible)..."

# Detect Ubuntu version
UBUNTU_VERSION=$(lsb_release -cs)

if [ "$UBUNTU_VERSION" = "noble" ]; then
  echo "⚠️  Ubuntu Noble detected, using Jammy repository"
  MONGO_UBUNTU_VERSION="jammy"
else
  MONGO_UBUNTU_VERSION="$UBUNTU_VERSION"
fi

# Remove failed installation attempts
echo "Cleaning up previous attempts..."
rm -f /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -qq

# Try official MongoDB repository
echo "Attempting to install MongoDB 7.0..."
if curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor 2>/dev/null; then
  
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $MONGO_UBUNTU_VERSION/mongodb-org/7.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  
  apt-get update -qq
  
  if apt-get install -y mongodb-org; then
    systemctl enable mongod
    systemctl start mongod
    echo "✅ MongoDB 7.0 installed successfully!"
    mongod --version | head -1
  else
    echo "⚠️  MongoDB 7.0 installation failed, trying Ubuntu's MongoDB..."
    apt-get install -y mongodb
    systemctl enable mongodb
    systemctl start mongodb
    echo "✅ MongoDB installed from Ubuntu repository"
    mongod --version | head -1
  fi
else
  echo "⚠️  Installing MongoDB from Ubuntu repository..."
  apt-get install -y mongodb
  systemctl enable mongodb
  systemctl start mongodb
  echo "✅ MongoDB installed successfully!"
  mongod --version | head -1
fi

# Verify MongoDB is running
echo ""
echo "Checking MongoDB status..."
if systemctl is-active --quiet mongod 2>/dev/null; then
  echo "✅ mongod service is running"
  systemctl status mongod --no-pager | head -5
elif systemctl is-active --quiet mongodb 2>/dev/null; then
  echo "✅ mongodb service is running"
  systemctl status mongodb --no-pager | head -5
else
  echo "❌ MongoDB is not running. Trying to start..."
  systemctl start mongod 2>/dev/null || systemctl start mongodb
fi

echo ""
echo "✨ MongoDB installation complete!"
echo ""
echo "Next: Continue with the setup script or run manually:"
echo "  cd ~/Cuongtm2012/software_hub/scripts"
echo "  ./setup-vps-complete.sh"
