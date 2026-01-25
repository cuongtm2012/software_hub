# Deployment Scripts

This directory contains scripts to help with VPS deployment and maintenance.

## Available Scripts

### 1. `setup-vps.sh` - Automated VPS Setup

Automatically sets up a fresh Contabo VPS with all necessary components.

**What it does:**
- Updates system packages
- Installs Node.js 20
- Installs PM2 (Process Manager)
- Installs and configures PostgreSQL
- Installs and configures Nginx
- Sets up firewall (UFW)
- Creates project directory
- Generates .env file
- Configures security (fail2ban)
- Sets up PM2 log rotation

**Usage:**
```bash
# Upload to VPS
scp scripts/setup-vps.sh root@95.111.253.111:/tmp/

# SSH into VPS and run
ssh root@95.111.253.111
cd /tmp
chmod +x setup-vps.sh
sudo bash setup-vps.sh
```

**Interactive prompts:**
- Database name (default: software_hub)
- Database user (default: software_hub_user)
- Database password
- Server name/IP (default: 95.111.253.111)
- Session secret (auto-generated if not provided)

### 2. `vps-health-check.sh` - VPS Health Check

Verifies that all components are properly installed and configured.

**What it checks:**
- Node.js installation and version
- npm installation
- PM2 installation
- PostgreSQL installation and status
- Nginx installation and status
- SSH configuration
- SSH authorized_keys permissions
- Firewall status
- Project directory existence and permissions
- Disk space usage
- Memory usage
- Application status in PM2

**Usage:**
```bash
# Upload to VPS
scp scripts/vps-health-check.sh root@95.111.253.111:/tmp/

# Run check
ssh root@95.111.253.111 "bash /tmp/vps-health-check.sh"
```

**Output:**
- ✓ Green checkmarks for passed checks
- ✗ Red X marks for failed checks
- Detailed information about each component

## Quick Start Guide

### First Time Setup

1. **Prepare your local machine:**
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub"
# Save as: ~/.ssh/contabo_deploy

# Copy public key
cat ~/.ssh/contabo_deploy.pub
```

2. **Setup VPS:**
```bash
# Upload setup script
scp scripts/setup-vps.sh root@95.111.253.111:/tmp/

# SSH into VPS
ssh root@95.111.253.111

# Run setup
cd /tmp
chmod +x setup-vps.sh
sudo bash setup-vps.sh
```

3. **Add SSH key to VPS:**
```bash
# On VPS
nano ~/.ssh/authorized_keys
# Paste your public key from step 1
```

4. **Configure GitHub Secrets:**
Go to GitHub Repository > Settings > Secrets and variables > Actions

Add these secrets:
- `SSH_HOST`: 95.111.253.111
- `SSH_USERNAME`: root
- `SSH_KEY`: (paste content of ~/.ssh/contabo_deploy)
- `SSH_PORT`: 22

5. **Verify setup:**
```bash
# Upload health check script
scp scripts/vps-health-check.sh root@95.111.253.111:/tmp/

# Run check
ssh root@95.111.253.111 "bash /tmp/vps-health-check.sh"
```

6. **Test SSH connection:**
```bash
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111
```

7. **Deploy:**
- Go to GitHub > Actions > Deploy to Contabo VPS
- Click "Run workflow"

## Troubleshooting

### Script fails with "Permission denied"

Make sure to run with sudo:
```bash
sudo bash setup-vps.sh
```

### Cannot connect to VPS

Check firewall:
```bash
ssh root@95.111.253.111 "ufw status"
ssh root@95.111.253.111 "ufw allow 22/tcp"
```

### Health check shows failures

Run the setup script again:
```bash
ssh root@95.111.253.111 "bash /tmp/setup-vps.sh"
```

### Database connection fails

Check PostgreSQL status:
```bash
ssh root@95.111.253.111 "systemctl status postgresql"
ssh root@95.111.253.111 "sudo -u postgres psql -l"
```

## Manual Commands

### Restart Application
```bash
ssh root@95.111.253.111 "pm2 restart software-hub"
```

### View Logs
```bash
ssh root@95.111.253.111 "pm2 logs software-hub"
```

### Check Application Status
```bash
ssh root@95.111.253.111 "pm2 list"
```

### Update Environment Variables
```bash
ssh root@95.111.253.111 "nano /root/Cuongtm2012/.env"
# After editing, restart app
ssh root@95.111.253.111 "pm2 restart software-hub"
```

### Check Nginx Logs
```bash
ssh root@95.111.253.111 "tail -f /var/log/nginx/access.log"
ssh root@95.111.253.111 "tail -f /var/log/nginx/error.log"
```

### Database Backup
```bash
ssh root@95.111.253.111 "sudo -u postgres pg_dump software_hub > /root/backups/db-$(date +%Y%m%d).sql"
```

## Security Notes

1. **Change default SSH port** (optional but recommended):
```bash
ssh root@95.111.253.111
nano /etc/ssh/sshd_config
# Change Port 22 to another port (e.g., 2222)
systemctl restart sshd
# Update GitHub Secret SSH_PORT
```

2. **Disable password authentication**:
```bash
ssh root@95.111.253.111
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

3. **Regular updates**:
```bash
ssh root@95.111.253.111 "apt update && apt upgrade -y"
```

## Support

For more detailed information, see:
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](../docs/DEPLOYMENT_CHECKLIST.md)
