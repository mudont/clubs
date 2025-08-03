#!/bin/bash

# Production deployment script with port mapping

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_header "🚀 Starting Production Deployment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running!"
    print_status "Please start Docker service: sudo systemctl start docker"
    exit 1
fi

# Check if Docker service is enabled for auto-start
if ! systemctl is-enabled docker > /dev/null 2>&1; then
    print_warning "Docker service is not enabled for auto-start on boot"
    print_status "Enable with: sudo systemctl enable docker"
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_status "Please create .env.production with your production configuration"
    exit 1
fi

# Show current configuration
print_status "Current port configuration:"
echo "  - External port (server): 12410"
echo "  - Internal port (container): 4010"
echo "  - Application will be accessible at: http://your-server:12410"

# Build and deploy
print_status "Building and starting production services..."
docker-compose --env-file .env.production up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose --env-file .env.production ps

# Run database migrations
print_status "Running database migrations..."
docker-compose --env-file .env.production exec -T app sh -c "cd server && npx prisma migrate deploy"

# Generate Prisma client
print_status "Generating Prisma client..."
docker-compose --env-file .env.production exec -T app sh -c "cd server && npx prisma generate"

# Test health endpoint
print_status "Testing application health..."
sleep 5
if curl -f http://localhost:12410/health > /dev/null 2>&1; then
    print_status "✅ Application is healthy and responding on port 12410"
else
    print_warning "⚠️  Health check failed - application may still be starting"
    print_status "Check logs with: docker-compose --env-file .env.production logs -f app"
fi

print_header "🎉 Production Deployment Complete!"
echo ""
print_status "Application Details:"
echo "  - External URL: http://localhost:12410"
echo "  - Health Check: http://localhost:12410/health"
echo "  - GraphQL Playground: http://localhost:12410/graphql"
echo ""
print_status "Auto-Restart Configuration:"
echo "  ✅ Containers will restart automatically on server reboot"
echo "  ✅ Containers will restart automatically if they crash"
echo "  ✅ Restart policy: unless-stopped (production-ready)"
echo ""
print_status "Useful Commands:"
echo "  - View logs: docker-compose --env-file .env.production logs -f"
echo "  - Stop services: docker-compose --env-file .env.production down"
echo "  - Restart app: docker-compose --env-file .env.production restart app"
echo "  - Check restart policy: docker inspect clubs-app-1 | grep RestartPolicy"
echo ""
print_status "🔍 Monitor your application and check logs for any issues"
print_status "📖 See AUTO_RESTART_GUIDE.md for detailed restart behavior information"
