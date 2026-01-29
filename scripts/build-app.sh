#!/usr/bin/env bash
# Build Software Hub app: install deps + build client & server
set -e
cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building app (client + server)..."
npm run build

echo ""
echo "✅ Build xong. Chạy production: npm start"
