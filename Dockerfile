# Development-focused Dockerfile for ARM64 (M1/M2 Mac) compatibility
FROM --platform=linux/arm64/v8 node:20-alpine

WORKDIR /app

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Configure npm for better reliability
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 30000 && \
    npm config set fetch-retry-maxtimeout 180000 && \
    npm config set fetch-timeout 300000

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for development
# This ensures tsx and other dev tools are available
RUN npm cache clean --force && \
    npm ci --no-audit --no-fund --legacy-peer-deps && \
    npm cache clean --force

# Copy application files
COPY --chown=nodejs:nodejs . .

# Change ownership to nodejs user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Always run in development mode to avoid ARM64 Rollup build issues
CMD ["npm", "run", "dev"]