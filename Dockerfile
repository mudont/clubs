# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci && \
    cd server && npm ci && \
    cd ../client && npm ci

# Build stage for server
FROM base AS server-builder

WORKDIR /app/server

# Copy server source
COPY server/ ./

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Build stage for client
FROM base AS client-builder

WORKDIR /app/client

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S clubs -u 1001

WORKDIR /app

# Copy built server
COPY --from=server-builder --chown=clubs:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=clubs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=server-builder --chown=clubs:nodejs /app/server/package.json ./server/package.json

# Copy built client
COPY --from=client-builder --chown=clubs:nodejs /app/client/build ./client/build

# Copy Prisma client
COPY --from=server-builder --chown=clubs:nodejs /app/server/prisma ./server/prisma

# Create logs directory
RUN mkdir -p logs && chown clubs:nodejs logs

# Switch to non-root user
USER clubs

# Expose port
EXPOSE 4010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
               const options = { host: 'localhost', port: 4010, path: '/health' }; \
               const req = http.request(options, (res) => { \
                 process.exit(res.statusCode === 200 ? 0 : 1); \
               }); \
               req.on('error', () => process.exit(1)); \
               req.end();"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"] 