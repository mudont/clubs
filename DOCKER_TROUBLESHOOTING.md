# Docker Development Troubleshooting

## Common Issues and Solutions

### 1. "DB_PASSWORD variable is not set" Warning

**Problem**: Docker Compose shows warnings about missing environment variables.

**Solution**: Make sure your `.env` file contains the required Docker variables:

```bash
DB_NAME=clubs_db
DB_USER=clubs
DB_PASSWORD=clubs
REDIS_PASSWORD=clubs_redis_pass
```

### 2. Container Health Check Failures

**Problem**: Containers fail health checks and show as "unhealthy".

**Solution**:

```bash
# Reset the development environment
npm run docker:reset

# Or manually reset
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
npm run docker:dev
```

### 3. Port Already in Use

**Problem**: Error "address already in use" for ports 5432 or 6379.

**Solution**:

```bash
# Check what's using the ports
lsof -i :5432
lsof -i :6379

# Stop conflicting services
brew services stop postgresql  # If using Homebrew PostgreSQL
brew services stop redis       # If using Homebrew Redis

# Or use different ports in .env
DB_PORT=5433
REDIS_PORT=6380
```

### 4. Database Connection Issues

**Problem**: Application can't connect to the database.

**Solution**:

```bash
# Check if database is running
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Test database connection
docker exec -it clubs-db-1 psql -U clubs -d clubs_db

# Check logs
npm run docker:logs
```

### 5. Redis Connection Issues

**Problem**: Application can't connect to Redis.

**Solution**:

```bash
# Test Redis connection
docker exec -it clubs-redis-1 redis-cli ping

# For development, Redis runs without password
# Make sure REDIS_URL in .env is: redis://localhost:6379
```

### 6. Prisma Migration Issues

**Problem**: Database schema is out of sync.

**Solution**:

```bash
# Run migrations
cd server
npx prisma migrate dev

# Or reset database
npm run docker:reset
cd server
npx prisma migrate dev
npx prisma generate
```

## Useful Commands

### Check Service Status

```bash
npm run docker:logs    # View all logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps  # Check status
```

### Connect to Services

```bash
# Connect to PostgreSQL
docker exec -it clubs-db-1 psql -U clubs -d clubs_db

# Connect to Redis
docker exec -it clubs-redis-1 redis-cli
```

### Clean Up

```bash
# Stop services
npm run docker:stop

# Remove all containers and volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Remove all Docker data (nuclear option)
docker system prune -a --volumes
```

## Development Workflow

1. **Start Docker services**: `npm run docker:dev`
2. **Run migrations**: `cd server && npx prisma migrate dev`
3. **Start application**: `npm run dev`
4. **Stop when done**: `npm run docker:stop`

## Environment Variables Reference

Required variables for Docker development:

```bash
# Database
DB_NAME=clubs_db
DB_USER=clubs
DB_PASSWORD=clubs
DB_PORT=5432

# Redis
REDIS_PASSWORD=clubs_redis_pass  # Not used in dev mode
REDIS_PORT=6379

# Application
DATABASE_URL=postgresql://clubs:clubs@localhost:5432/clubs_db
REDIS_URL=redis://localhost:6379
```
