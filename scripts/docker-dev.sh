#!/bin/bash

# Docker development helper script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_status "Creating .env from template..."
    cp .env.example .env 2>/dev/null || echo "No .env.example found"
    exit 1
fi

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis

    print_status "Waiting for services to be healthy..."
    sleep 10

    print_status "Services started successfully!"
    print_status "Database: postgresql://clubs:clubs@localhost:5432/clubs_db"
    print_status "Redis: redis://localhost:6379"
    print_status ""
    print_status "You can now run:"
    print_status "  npm run dev:server  # Start the GraphQL server"
    print_status "  npm run dev:client  # Start the React client"
    print_status "  npm run dev         # Start both simultaneously"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_status "Development environment stopped."
}

# Function to reset development environment
reset_dev() {
    print_warning "This will destroy all data in the development database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting development environment..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis
        print_status "Development environment reset complete."
    else
        print_status "Reset cancelled."
    fi
}

# Function to show logs
logs_dev() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
}

# Function to show status
status_dev() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
}

# Main script logic
case "${1:-start}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        stop_dev
        start_dev
        ;;
    reset)
        reset_dev
        ;;
    logs)
        logs_dev
        ;;
    status)
        status_dev
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reset|logs|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start development database and Redis"
        echo "  stop    - Stop development environment"
        echo "  restart - Restart development environment"
        echo "  reset   - Reset development environment (destroys data)"
        echo "  logs    - Show logs from development services"
        echo "  status  - Show status of development services"
        exit 1
        ;;
esac
