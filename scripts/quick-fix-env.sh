#!/bin/bash
# Quick fix for empty DB_PASSWORD in .env.production

cd /var/www/software-hub 2>/dev/null || cd ~/Cuongtm2012/software_hub || exit 1

echo "Checking .env.production..."

# Check if DB_PASSWORD is empty
DB_PASS=$(grep '^DB_PASSWORD=' .env.production 2>/dev/null | cut -d'=' -f2)

if [ -z "$DB_PASS" ]; then
    echo "❌ DB_PASSWORD is empty! Generating new password..."
    NEW_PASS=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)
    
    if grep -q '^DB_PASSWORD=' .env.production; then
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_PASS/" .env.production
    else
        echo "DB_PASSWORD=$NEW_PASS" >> .env.production
    fi
    
    echo "✅ Generated new DB_PASSWORD: $NEW_PASS"
    echo "💾 Save this password!"
else
    echo "✅ DB_PASSWORD is set"
fi

# Check SESSION_SECRET
SESS_SECRET=$(grep '^SESSION_SECRET=' .env.production 2>/dev/null | cut -d'=' -f2)

if [ -z "$SESS_SECRET" ]; then
    echo "❌ SESSION_SECRET is empty! Generating..."
    NEW_SECRET=$(openssl rand -base64 32)
    
    if grep -q '^SESSION_SECRET=' .env.production; then
        sed -i "s/^SESSION_SECRET=.*/SESSION_SECRET=$NEW_SECRET/" .env.production
    else
        echo "SESSION_SECRET=$NEW_SECRET" >> .env.production
    fi
    
    echo "✅ Generated new SESSION_SECRET"
else
    echo "✅ SESSION_SECRET is set"
fi

echo ""
echo "Current .env.production:"
cat .env.production
echo ""
echo "Now run: bash scripts/fix-docker-build.sh"
