#!/bin/bash

# Test setup script for the server
set -e

echo "🔧 Setting up test environment..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first."
    exit 1
fi

# Set test environment variables
export NODE_ENV=test
export JWT_SECRET=test-secret-key-for-testing-only-32-chars
export BCRYPT_ROUNDS=4
export REDIS_URL=redis://localhost:6379/1

echo "✅ Environment variables set"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Test environment setup complete!"
echo ""
echo "Available test commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:unit     - Run unit tests only"
echo "  npm run test:integration - Run integration tests only"
echo "  npm run test:e2e      - Run end-to-end tests only"
echo "  npm run test:coverage - Run tests with coverage report"
echo "  npm run test:watch    - Run tests in watch mode"
echo "  npm run test:ci       - Run tests for CI (no watch, with coverage)"
