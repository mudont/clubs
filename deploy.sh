#!/bin/bash

echo "🚀 Starting deployment..."

# Build client
echo "📦 Building client..."
cd client
npm run build
cd ..

# Build server
echo "🔧 Building server..."
cd server
npm run build
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Start with PM2
echo "🚀 Starting server with PM2..."
pm2 start ecosystem.config.js --env production

echo "✅ Deployment complete!"
echo "📊 Check status with: pm2 list"
echo "📋 View logs with: pm2 logs clubs-server" 