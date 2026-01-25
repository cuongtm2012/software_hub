# 🚀 Deployment Checklist

Use this checklist to ensure successful deployment to your Contabo VPS.

## ✅ Pre-Deployment Checklist

### VPS Setup
- [ ] VPS is accessible via SSH (`ssh root@95.111.253.111`)
- [ ] Run VPS setup script (`scripts/vps-setup.sh`)
- [ ] Node.js 20.x is installed
- [ ] PM2 is installed and configured
- [ ] Nginx is installed and running
- [ ] PostgreSQL is installed and running
- [ ] Firewall is configured (ports 22, 80, 443 open)

### Database Configuration
- [ ] PostgreSQL database `software_hub` created
- [ ] Database user `software_hub_user` created
- [ ] Database password is secure and updated
- [ ] Database connection string is correct in `.env.production`

### GitHub Configuration
- [ ] Repository is pushed to GitHub
- [ ] GitHub Actions workflow file exists (`.github/workflows/deploy.yml`)
- [ ] SSH key pair generated
- [ ] Public key added to VPS `~/.ssh/authorized_keys`
- [ ] GitHub Secrets configured:
  - [ ] `SSH_PRIVATE_KEY`
  - [ ] `REMOTE_HOST` (95.111.253.111)
  - [ ] `REMOTE_USER` (root)
  - [ ] `ENV_FILE` (optional)

### Environment Variables
- [ ] `.env.production` file created on VPS
- [ ] `DATABASE_URL` configured
- [ ] `SESSION_SECRET` generated (use `openssl rand -base64 32`)
- [ ] `RESEND_API_KEY` added (for email service)
- [ ] `STRIPE_SECRET_KEY` added (if using payments)
- [ ] All required API keys configured

### Nginx Configuration
- [ ] Nginx config file created (`/etc/nginx/sites-available/software-hub`)
- [ ] Symbolic link created (`/etc/nginx/sites-enabled/software-hub`)
- [ ] Default site disabled
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx restarted

### Deployment Scripts
- [ ] `deploy.sh` exists on VPS (`/var/www/deploy.sh`)
- [ ] `deploy.sh` is executable (`chmod +x /var/www/deploy.sh`)
- [ ] `ecosystem.config.js` configured for PM2

## 🚀 Deployment Steps

### 1. Initial Deployment
```bash
# On your local machine
git add .
git commit -m "Initial production deployment"
git push origin main
```

### 2. Monitor Deployment
- [ ] Go to GitHub → Actions tab
- [ ] Watch workflow execution
- [ ] Verify all steps complete successfully
- [ ] Check for any error messages

### 3. Verify Deployment
```bash
# SSH into VPS
ssh root@95.111.253.111

# Check PM2 processes
pm2 list

# Check application logs
pm2 logs software-hub-server --lines 50

# Test health endpoint
curl http://localhost:5000/api/health

# Check Nginx status
systemctl status nginx
```

### 4. Test Application
- [ ] Visit http://95.111.253.111 in browser
- [ ] Homepage loads correctly
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] Authentication works
- [ ] File uploads work (if applicable)

## 🔒 Security Checklist

### SSH Security
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled (optional)
- [ ] SSH port changed from 22 (optional)
- [ ] Fail2ban installed (optional)

### Application Security
- [ ] All secrets are in environment variables (not in code)
- [ ] Session secret is strong and random
- [ ] Database password is strong
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented

### Server Security
- [ ] Firewall (UFW) is enabled
- [ ] Only necessary ports are open
- [ ] System packages are updated
- [ ] Automatic security updates enabled (optional)

### SSL/HTTPS (Recommended)
- [ ] Domain name configured (if applicable)
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS redirect configured
- [ ] Auto-renewal configured

## 📊 Post-Deployment Checklist

### Monitoring Setup
- [ ] PM2 monitoring configured
- [ ] Log rotation configured
- [ ] Disk space monitoring setup
- [ ] Uptime monitoring configured (optional)
- [ ] Error tracking setup (Sentry, etc.) (optional)

### Backup Configuration
- [ ] Database backup script created
- [ ] Automated daily backups configured
- [ ] Backup retention policy defined
- [ ] Backup restoration tested

### Performance Optimization
- [ ] PM2 cluster mode enabled (if needed)
- [ ] Nginx caching configured
- [ ] Gzip compression enabled
- [ ] Static assets cached properly
- [ ] Database indexes optimized

### Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Team members have access to credentials

## 🔄 Ongoing Maintenance

### Daily
- [ ] Check PM2 process status
- [ ] Review error logs
- [ ] Monitor disk space

### Weekly
- [ ] Review application logs
- [ ] Check for security updates
- [ ] Verify backups are working

### Monthly
- [ ] Update system packages
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Review SSL certificate expiry

## 🆘 Emergency Contacts

- **VPS Provider:** Contabo Support
- **Technical Lead:** admin@in2sight.com
- **Database Admin:** [Your DBA contact]
- **DevOps:** [Your DevOps contact]

## 📝 Deployment Log

Keep a record of deployments:

| Date | Version | Deployed By | Notes |
|------|---------|-------------|-------|
| 2026-01-25 | v1.0.0 | Initial | First production deployment |
|  |  |  |  |

## ✅ Sign-off

- [ ] All checklist items completed
- [ ] Application tested and verified
- [ ] Team notified of deployment
- [ ] Documentation updated

**Deployed by:** ___________________  
**Date:** ___________________  
**Signature:** ___________________

---

**Next Deployment:** Follow this checklist for each deployment  
**Emergency Rollback:** `pm2 restart all` or restore from backup
