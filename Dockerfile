# Multi-stage build for optimized production image
FROM node:20-alpine AS base
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder  
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/shared ./shared

# Copy remaining necessary files
COPY package*.json ./
COPY server ./server

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S softwarehub -u 1001
RUN chown -R softwarehub:nodejs /app
USER softwarehub

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]