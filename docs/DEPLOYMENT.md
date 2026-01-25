# Software Hub - Deployment Guide

## 🚀 Automated Deployment to Contabo VPS

This guide explains how to set up and use the automated deployment pipeline for Software Hub.

## Prerequisites

### On Your VPS (95.111.253.111)

1. **SSH Access**: Ensure you have root SSH access
2. **Node.js**: Install Node.js 20.x
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   ```

3. **PM2** (Process Manager - Recommended):
   ```bash
   npm install -g pm2
   pm2 startup systemd
   ```

4. **Nginx** (Reverse Proxy):
   ```bash
   apt-get install -y nginx
   ```

5. **PostgreSQL** (Database):
   ```bash
   apt-get install -y postgresql postgresql-contrib
   ```

### On GitHub

1. **Repository**: Push your code to GitHub
2. **Secrets**: Configure the following secrets in your repository

## 📝 GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### 1. SSH_PRIVATE_KEY
Your SSH private key for authentication to the VPS.

**Generate SSH Key Pair:**
```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions@software-hub" -f ~/.ssh/software-hub-deploy

# Copy the private key content
cat ~/.ssh/software-hub-deploy
```

**Add to VPS:**
```bash
# On VPS as root
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste your public key from software-hub-deploy.pub]
EOF

chmod 600 ~/.ssh/authorized_keys
```

**Add to GitHub Secret:**
- Name: `SSH_PRIVATE_KEY`
- Value: [paste entire private key content from `software-hub-deploy`]

### 2. REMOTE_HOST
- Name: `REMOTE_HOST`
- Value: `95.111.253.111`

### 3. REMOTE_USER
- Name: `REMOTE_USER`
- Value: `root`

### 4. ENV_FILE (Optional)
Your production environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/software_hub
POSTGRES_USER=software_hub_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=software_hub

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_session_secret_here

# Email Service
RESEND_API_KEY=your_resend_api_key

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Stripe (if using)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🔧 VPS Setup

### 1. Initial Setup on VPS

```bash
# SSH into your VPS
ssh root@95.111.253.111

# Create project directory
mkdir -p /var/www/software-hub
cd /var/www/software-hub

# Create environment file
nano .env.production
# [Paste your environment variables]

# Copy deployment script
nano /var/www/deploy.sh
# [Paste content from deploy.sh]

# Make it executable
chmod +x /var/www/deploy.sh

# Create log directory
mkdir -p /var/log
touch /var/log/software-hub-deploy.log
```

### 2. Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/software-hub
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name 95.111.253.111 yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /assets {
        alias /var/www/software-hub/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API and WebSocket
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:5000/api/health;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE software_hub;
CREATE USER software_hub_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE software_hub TO software_hub_user;
\q
```

### 4. Setup PM2 Ecosystem (Optional)

```bash
cd /var/www/software-hub
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'software-hub-server',
      script: './server/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '500M',
      error_file: '/var/log/software-hub-error.log',
      out_file: '/var/log/software-hub-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'email-service',
      script: './services/email-service/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'chat-service',
      script: './services/chat-service/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'notification-service',
      script: './services/notification-service/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## 🎯 Deployment Workflow

### Automatic Deployment

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - ✅ Checkout code
   - ✅ Install dependencies
   - ✅ Build production assets
   - ✅ Create deployment package
   - ✅ Transfer to VPS
   - ✅ Extract and install on VPS
   - ✅ Run database migrations
   - ✅ Restart services
   - ✅ Perform health check

3. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Click on the latest workflow run
   - View logs for each step

### Manual Deployment

Trigger manually from GitHub:
1. Go to Actions tab
2. Select "Deploy to Contabo VPS"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## 🔍 Monitoring & Troubleshooting

### Check Application Status

```bash
# SSH into VPS
ssh root@95.111.253.111

# Check PM2 processes
pm2 list
pm2 logs

# Check Nginx status
systemctl status nginx
nginx -t

# Check application logs
tail -f /var/log/software-hub-deploy.log
tail -f /var/log/software-hub-error.log
tail -f /var/log/software-hub-out.log

# Check disk space
df -h

# Check memory usage
free -h
```

### Common Issues

**1. Deployment fails at SSH step:**
- Verify SSH key is correctly added to GitHub Secrets
- Ensure public key is in VPS `~/.ssh/authorized_keys`
- Check VPS firewall allows SSH (port 22)

**2. Services won't start:**
- Check environment variables in `.env.production`
- Verify database connection
- Check PM2 logs: `pm2 logs`

**3. 502 Bad Gateway:**
- Ensure application is running: `pm2 list`
- Check Nginx configuration: `nginx -t`
- Verify port 5000 is not blocked

**4. Database migration fails:**
- Ensure PostgreSQL is running
- Verify database credentials
- Check migration files exist

## 🔐 Security Best Practices

1. **Never commit secrets** to the repository
2. **Use strong passwords** for database and session secrets
3. **Enable firewall** on VPS:
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

4. **Setup SSL/TLS** with Let's Encrypt:
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

5. **Regular backups**:
   ```bash
   # Database backup
   pg_dump software_hub > backup-$(date +%Y%m%d).sql
   ```

## 📊 Performance Optimization

1. **Enable PM2 cluster mode** for better CPU utilization
2. **Configure Nginx caching** for static assets
3. **Use CDN** for static assets (optional)
4. **Monitor with PM2 Plus** (optional): https://pm2.io/

## 🆘 Support

For issues or questions:
- Check GitHub Actions logs
- Review VPS logs: `/var/log/software-hub-*.log`
- Contact: admin@in2sight.com
