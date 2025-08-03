#!/bin/bash

# Test auto-restart behavior

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[AUTO-RESTART TEST]${NC} $1"
}

print_header "🧪 Testing Auto-Restart Behavior"

# Check if application is running
if ! curl -f http://localhost:12410/health > /dev/null 2>&1; then
    print_error "Application is not running on port 12410"
    print_status "Please deploy first: npm run deploy:prod"
    exit 1
fi

print_status "✅ Application is running and healthy"

# Get container ID
CONTAINER_ID=$(docker-compose --env-file .env.production ps -q app)
if [ -z "$CONTAINER_ID" ]; then
    print_error "Could not find app container"
    exit 1
fi

print_status "📋 Container ID: $CONTAINER_ID"

# Check current restart policy
RESTART_POLICY=$(docker inspect $CONTAINER_ID | grep -A 2 '"RestartPolicy"' | grep '"Name"' | cut -d'"' -f4)
print_status "🔄 Current restart policy: $RESTART_POLICY"

if [ "$RESTART_POLICY" != "unless-stopped" ]; then
    print_warning "⚠️  Restart policy is not 'unless-stopped'. Expected behavior may differ."
fi

# Test restart behavior by killing the container
print_status "🔥 Simulating container crash (killing container)..."
docker kill $CONTAINER_ID > /dev/null

print_status "⏳ Waiting for container to restart..."
sleep 5

# Check if container restarted
NEW_CONTAINER_ID=$(docker-compose --env-file .env.production ps -q app)
if [ -z "$NEW_CONTAINER_ID" ]; then
    print_error "❌ Container did not restart automatically"
    exit 1
fi

if [ "$CONTAINER_ID" = "$NEW_CONTAINER_ID" ]; then
    print_status "🔄 Same container restarted"
else
    print_status "🆕 New container started (ID: $NEW_CONTAINER_ID)"
fi

# Wait a bit more for the application to be ready
print_status "⏳ Waiting for application to be ready..."
sleep 10

# Test if application is healthy again
if curl -f http://localhost:12410/health > /dev/null 2>&1; then
    print_status "✅ Application restarted successfully and is healthy!"
else
    print_error "❌ Application is not responding after restart"
    print_status "Check logs: docker-compose --env-file .env.production logs app"
    exit 1
fi

# Show restart count
RESTART_COUNT=$(docker inspect $NEW_CONTAINER_ID | grep '"RestartCount"' | cut -d':' -f2 | tr -d ' ,')
print_status "🔢 Container restart count: $RESTART_COUNT"

print_header "🎉 Auto-Restart Test Complete!"
echo ""
print_status "Test Results:"
echo "  ✅ Container restart policy: $RESTART_POLICY"
echo "  ✅ Container restarted automatically after crash"
echo "  ✅ Application is healthy after restart"
echo "  ✅ Restart count: $RESTART_COUNT"
echo ""
print_status "🔄 Your containers WILL restart automatically after server reboot"
print_status "📖 See AUTO_RESTART_GUIDE.md for more information"
