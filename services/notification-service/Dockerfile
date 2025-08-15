FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S notificationservice -u 1001
RUN chown -R notificationservice:nodejs /app
USER notificationservice

# Set production environment
ENV NODE_ENV=production

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

CMD ["node", "src/app.js"]