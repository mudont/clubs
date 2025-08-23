#!/bin/bash

# Quick test script to verify test setup
set -e

echo "🧪 Running quick test to verify setup..."

# Set test environment variables
export NODE_ENV=test
export JWT_SECRET=test-secret-key-for-testing-only-32-chars
export SESSION_SECRET=test-session-secret-for-testing-only-32-chars
export BCRYPT_ROUNDS=4
export REDIS_URL=redis://localhost:6379/1
export DATABASE_URL=postgresql://postgres:password@localhost:5432/test_clubs_quick

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create test database
echo "📦 Creating test database..."
createdb test_clubs_quick 2>/dev/null || echo "Database already exists"

# Run migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Run setup test only
echo "🧪 Running setup test..."
npx jest --testPathPattern="setup.test.ts" --verbose --forceExit

# Cleanup
echo "🧹 Cleaning up..."
dropdb test_clubs_quick 2>/dev/null || echo "Database cleanup skipped"

echo "✅ Quick test completed successfully!"
