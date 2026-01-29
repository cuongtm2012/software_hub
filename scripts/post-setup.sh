#!/bin/bash
# Quick commands to run on VPS after setup

echo "==================================="
echo "Post-Setup Configuration Commands"
echo "==================================="
echo ""

# 1. Generate SSH Key for GitHub Actions
echo "1. Generating SSH Key for GitHub Actions..."
ssh-keygen -t rsa -b 4096 -C "github-actions@software-hub" -f ~/.ssh/github_actions -N ""

# 2. Add to authorized_keys
echo "2. Adding public key to authorized_keys..."
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# 3. Set permissions
echo "3. Setting permissions..."
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
chmod 644 ~/.ssh/github_actions.pub

echo ""
echo "==================================="
echo "✅ SSH Key Generated!"
echo "==================================="
echo ""
echo "📋 COPY THIS PRIVATE KEY TO GITHUB SECRET 'SSH_KEY':"
echo "---------------------------------------------------"
cat ~/.ssh/github_actions
echo "---------------------------------------------------"
echo ""

# 4. Generate SESSION_SECRET
echo "4. Generating SESSION_SECRET..."
SESSION_SECRET=$(openssl rand -base64 32)
echo "📋 SESSION_SECRET (add to .env.production):"
echo "$SESSION_SECRET"
echo ""

# 5. Create .env.production template
echo "5. Creating .env.production file..."
cd /var/www/software-hub

cat > .env.production << EOF
NODE_ENV=production
PORT=3000

# Database - UPDATE PASSWORD!
DATABASE_URL=postgresql://software_hub_user:CHANGE_THIS_PASSWORD@localhost:5432/software_hub

# Session
SESSION_SECRET=$SESSION_SECRET

# Email (Resend) - Add your API key
RESEND_API_KEY=

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
EOF

chmod 600 .env.production

echo "✅ .env.production created at /var/www/software-hub/.env.production"
echo ""

# 6. Instructions for PostgreSQL password
echo "==================================="
echo "📝 Next Steps:"
echo "==================================="
echo ""
echo "1. Update PostgreSQL password:"
echo "   sudo -u postgres psql"
echo "   ALTER USER software_hub_user WITH PASSWORD 'your_secure_password';"
echo "   \q"
echo ""
echo "2. Update .env.production with the password:"
echo "   nano /var/www/software-hub/.env.production"
echo "   (Update DATABASE_URL with your password)"
echo ""
echo "3. Add to GitHub Secrets:"
echo "   - SSH_HOST: 95.111.253.111"
echo "   - SSH_USERNAME: root"
echo "   - SSH_KEY: (the private key shown above)"
echo "   - SSH_PORT: 22"
echo ""
echo "4. Test database connection:"
echo "   PGPASSWORD='your_password' psql -U software_hub_user -d software_hub -h localhost -c 'SELECT version();'"
echo ""
echo "5. Deploy from GitHub Actions!"
echo ""
