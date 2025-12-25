#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Chat Service...${NC}"

# Check if port 3002 is already in use
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3002 is already in use. Stopping existing process...${NC}"
    kill -9 $(lsof -t -i:3002) 2>/dev/null
    sleep 2
fi

# Navigate to chat service directory
cd "$(dirname "$0")/services/chat-service" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Start chat service
echo -e "${GREEN}✅ Starting chat service on port 3002...${NC}"
npm start &

# Wait a moment for service to start
sleep 3

# Check if service is running
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Chat service is running on port 3002${NC}"
    echo -e "${GREEN}✅ WebSocket endpoint: ws://localhost:3002${NC}"
    echo -e "${GREEN}✅ Health check: http://localhost:3002/health${NC}"
    
    # Test health endpoint
    echo -e "\n${YELLOW}🔍 Testing health endpoint...${NC}"
    curl -s http://localhost:3002/health | head -n 20
else
    echo -e "${RED}❌ Failed to start chat service${NC}"
    echo -e "${YELLOW}Check logs above for errors${NC}"
    exit 1
fi
