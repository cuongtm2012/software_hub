#!/bin/bash

# Quick Fix: Start PostgreSQL and verify it's running
# Run this on VPS if PostgreSQL connection failed

set -e

echo "🔧 Fixing PostgreSQL connection..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo "❌ PostgreSQL is not installed!"
  echo "Installing PostgreSQL..."
  apt-get update -qq
  apt-get install -y postgresql postgresql-contrib
fi

# Check PostgreSQL status
echo "Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
  echo "✅ PostgreSQL is already running"
else
  echo "⚠️  PostgreSQL is not running. Starting..."
  
  # Try to start PostgreSQL
  systemctl start postgresql
  
  # Wait a bit for it to start
  sleep 2
  
  # Check again
  if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL started successfully"
  else
    echo "❌ Failed to start PostgreSQL"
    echo "Checking logs..."
    journalctl -u postgresql -n 20 --no-pager
    exit 1
  fi
fi

# Enable PostgreSQL to start on boot
systemctl enable postgresql

# Show status
echo ""
echo "PostgreSQL Status:"
systemctl status postgresql --no-pager | head -10

# Test connection
echo ""
echo "Testing PostgreSQL connection..."
if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
  echo "✅ PostgreSQL connection successful!"
  echo ""
  sudo -u postgres psql -c "SELECT version();" | head -3
else
  echo "❌ PostgreSQL connection failed"
  echo "Checking PostgreSQL logs..."
  tail -20 /var/log/postgresql/postgresql-*.log 2>/dev/null || journalctl -u postgresql -n 20 --no-pager
  exit 1
fi

echo ""
echo "✨ PostgreSQL is ready!"
echo ""
echo "You can now continue with database setup:"
echo "  1. Run the setup script again: ./setup-vps-complete.sh"
echo "  2. Or create database manually:"
echo "     sudo -u postgres psql"
