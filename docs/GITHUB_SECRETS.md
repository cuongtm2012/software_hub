# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for automated deployment.

## Required Secrets

Navigate to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. SSH_PRIVATE_KEY

**Purpose:** SSH authentication to your VPS

**How to generate:**

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions@software-hub" -f ~/.ssh/software-hub-deploy

# Display the private key (copy this entire output)
cat ~/.ssh/software-hub-deploy
```

**Add to VPS:**

```bash
# SSH into your VPS
ssh root@95.111.253.111

# Add the public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste content from ~/.ssh/software-hub-deploy.pub]
EOF
chmod 600 ~/.ssh/authorized_keys
```

**Add to GitHub:**
- Secret name: `SSH_PRIVATE_KEY`
- Secret value: [paste entire content from `~/.ssh/software-hub-deploy`]

---

### 2. REMOTE_HOST

**Purpose:** VPS IP address

- Secret name: `REMOTE_HOST`
- Secret value: `95.111.253.111`

---

### 3. REMOTE_USER

**Purpose:** SSH username for VPS

- Secret name: `REMOTE_USER`
- Secret value: `root`

---

### 4. ENV_FILE (Optional but Recommended)

**Purpose:** Production environment variables

**Template:**

```env
DATABASE_URL=postgresql://software_hub_user:YOUR_PASSWORD@localhost:5432/software_hub
SESSION_SECRET=YOUR_SESSION_SECRET
RESEND_API_KEY=YOUR_RESEND_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_KEY
```

**How to generate secrets:**

```bash
# Generate session secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32
```

**Add to GitHub:**
- Secret name: `ENV_FILE`
- Secret value: [paste your complete .env.production content]

---

## Verification

After adding all secrets, verify they're configured:

1. Go to **Settings → Secrets and variables → Actions**
2. You should see:
   - ✅ SSH_PRIVATE_KEY
   - ✅ REMOTE_HOST
   - ✅ REMOTE_USER
   - ✅ ENV_FILE (optional)

## Testing the Deployment

1. Make a small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

3. Monitor deployment:
   - Go to **Actions** tab in GitHub
   - Click on the latest workflow run
   - Watch the deployment progress

## Troubleshooting

### "Permission denied (publickey)"
- Verify SSH_PRIVATE_KEY is correctly copied (include BEGIN/END lines)
- Ensure public key is in VPS `~/.ssh/authorized_keys`
- Check VPS SSH config allows key authentication

### "Connection refused"
- Verify REMOTE_HOST is correct
- Check VPS firewall allows SSH (port 22)
- Ensure VPS is running

### "Command not found: pm2"
- SSH into VPS and install PM2:
  ```bash
  npm install -g pm2
  ```

## Security Notes

⚠️ **NEVER commit secrets to your repository**
⚠️ **Use strong, unique passwords for all services**
⚠️ **Rotate secrets periodically**
⚠️ **Limit SSH access to specific IPs if possible**

## Next Steps

After configuring secrets:
1. Review `docs/DEPLOYMENT.md` for VPS setup
2. Configure Nginx on your VPS
3. Setup PostgreSQL database
4. Test the deployment workflow
