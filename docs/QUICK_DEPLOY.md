# Quick Deployment Guide - Contabo VPS

## 🚀 5-Minute Setup

### Step 1: Generate SSH Key (Local Machine)
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub"
# Save as: ~/.ssh/contabo_deploy (no passphrase)
cat ~/.ssh/contabo_deploy.pub  # Copy this
```

### Step 2: Setup VPS (One Command)
```bash
# Upload and run setup script
scp scripts/setup-vps.sh root@95.111.253.111:/tmp/ && \
ssh root@95.111.253.111 "bash /tmp/setup-vps.sh"
```

### Step 3: Add SSH Key to VPS
```bash
ssh root@95.111.253.111
nano ~/.ssh/authorized_keys
# Paste public key from Step 1, save and exit
```

### Step 4: Configure GitHub Secrets
Go to: **GitHub Repo > Settings > Secrets and variables > Actions**

Add these 4 secrets:
| Name | Value |
|------|-------|
| `SSH_HOST` | `95.111.253.111` |
| `SSH_USERNAME` | `root` |
| `SSH_KEY` | Content of `~/.ssh/contabo_deploy` |
| `SSH_PORT` | `22` |

### Step 5: Test Connection
```bash
ssh -i ~/.ssh/contabo_deploy root@95.111.253.111
```
✅ Should connect without password

### Step 6: Deploy
Go to: **GitHub > Actions > Deploy to Contabo VPS > Run workflow**

---

## 🔍 Verify Deployment

```bash
# Check health
ssh root@95.111.253.111 "pm2 list"

# View logs
ssh root@95.111.253.111 "pm2 logs software-hub --lines 50"

# Test endpoint
curl http://95.111.253.111
```

---

## 🆘 Common Issues

### ❌ Connection Refused
```bash
ssh root@95.111.253.111 "ufw allow 22/tcp && ufw reload"
```

### ❌ Permission Denied
```bash
ssh root@95.111.253.111 "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

### ❌ App Won't Start
```bash
ssh root@95.111.253.111 "cd /root/Cuongtm2012 && pm2 logs software-hub"
```

---

## 📚 Full Documentation

- [Complete Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Scripts README](../scripts/README.md)

---

## 🔑 Important Paths

| Item | Path |
|------|------|
| Project | `/root/Cuongtm2012` |
| Environment | `/root/Cuongtm2012/.env` |
| Nginx Config | `/etc/nginx/sites-available/software-hub` |
| Backups | `/root/software-hub-backup-*` |

---

**VPS IP:** 95.111.253.111  
**SSH User:** root  
**SSH Port:** 22  
**App Port:** 3000  
**Web Port:** 80
