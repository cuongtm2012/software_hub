# Production Dockerfile using pre-built local files
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Configure npm for production dependencies
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 30000 && \
    npm config set fetch-retry-maxtimeout 180000 && \
    npm config set fetch-timeout 300000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm cache clean --force && \
    npm ci --omit=dev --no-audit --no-fund --legacy-peer-deps && \
    npm cache clean --force

# Copy pre-built application files (built locally with our fixes)
COPY --chown=nodejs:nodejs dist/ ./dist/
COPY --chown=nodejs:nodejs client/dist/ ./client/dist/

# Copy necessary runtime files
COPY --chown=nodejs:nodejs server/ ./server/
COPY --chown=nodejs:nodejs shared/ ./shared/
COPY --chown=nodejs:nodejs drizzle.config.ts ./
COPY --chown=nodejs:nodejs healthcheck.js ./

# Change ownership to nodejs user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with the production-only entry point
CMD ["node", "dist/production.js"]