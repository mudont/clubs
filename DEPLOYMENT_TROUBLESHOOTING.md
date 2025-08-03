# Deployment Troubleshooting Guide

## RESOLVED: tslib Module Not Found

### Problem

The deployment was failing with the error:

```
Error: Cannot find module 'tslib'
```

This error occurred because Apollo Server's nested dependencies couldn't find the `tslib` module in the Docker container.

### Root Cause

The issue was a combination of:

1. **Dependency version conflicts**: Apollo Server 4.12.2 uses `@graphql-tools/schema@9.0.19` while we were using `@graphql-tools/schema@10.0.23`
2. **Docker build process**: Using `npm ci` instead of `npm install` in Docker was causing inconsistent dependency resolution
3. **Missing npm overrides**: The nested `tslib` dependencies weren't being properly resolved

### Solution

The fix involved three changes:

1. **Added npm overrides** in `server/package.json`:

```json
"overrides": {
  "tslib": "^2.8.1"
}
```

2. **Changed Docker build** from `npm ci` to `npm install` in Dockerfile:

```dockerfile
RUN cd server && npm install && cd ../client && npm install
```

3. **Used consistent dependency versions** to avoid conflicts

### Status: ✅ RESOLVED

The application now deploys successfully without tslib errors.

### Immediate Solutions

#### Option 1: Rollback to Working State

```bash
# Stop current deployment
docker-compose --env-file .env.production down

# Use development environment instead
npm run docker:dev
npm run dev:server
```

#### Option 2: Fix Docker Build

The issue might be resolved by:

1. Using a different Node.js base image
2. Updating Apollo Server to a version that doesn't have this issue
3. Using a different GraphQL server implementation

#### Option 3: Manual Fix

```bash
# Stop containers
docker-compose --env-file .env.production down

# Build without cache
docker-compose --env-file .env.production build --no-cache

# Try deployment again
npm run deploy:prod
```

### Next Steps

1. **Immediate**: Use development environment for testing
2. **Short-term**: Investigate Apollo Server version compatibility
3. **Long-term**: Consider alternative GraphQL server implementations

### Development Environment

While we fix the production deployment, you can use the development environment:

```bash
# Start development database and Redis
npm run docker:dev

# Start the application in development mode
npm run dev:server  # In one terminal
npm run dev:client  # In another terminal

# Or start both together
npm run dev
```

The development environment will be available at:

- Application: http://localhost:4010
- Client: http://localhost:3000

### Monitoring

To monitor the fix attempts:

```bash
# Check container logs
docker-compose --env-file .env.production logs app --tail=20

# Check container status
docker-compose --env-file .env.production ps

# Check if containers are restarting
docker stats --no-stream
```
