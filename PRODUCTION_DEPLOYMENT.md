# Production Deployment Guide

## Overview

This guide covers deploying the Clubs application to production. The application runs on port 4010 inside Docker containers, mapped to port 12410 on the server. **Production deployments are expected to use NGINX with SSL termination as a reverse proxy**, forwarding HTTPS traffic from port 443 to port 12410.

## Production Architecture

```
Internet (HTTPS:443) → NGINX (SSL Termination) → Application (Port 12410) → Docker Container (Port 4010)
```

- **NGINX**: Handles SSL/TLS termination and reverse proxy
- **Port 443**: Public HTTPS traffic entry point
- **Port 12410**: Application server port (configured via EXTERNAL_PORT)
- **Port 4010**: Internal Docker container port

## Prerequisites

- Docker and Docker Compose installed
- Production environment variables configured
- SSL certificates (if using HTTPS)

## Auto-Restart Behavior ✅

**Your containers WILL automatically restart** after server reboots because all services are configured with `restart: unless-stopped`. This means:

- ✅ Containers restart automatically on server reboot
- ✅ Containers restart automatically if they crash
- ✅ Manual stops are respected (won't restart if you manually stop them)
- ✅ No manual intervention needed after reboots

## Production Environment Setup

### 1. Environment Configuration

Create a `.env.production` file with production values:

```bash
# Node environment
NODE_ENV=production

# Server port (internal container port)
PORT=4010

# External port (server port mapping)
EXTERNAL_PORT=12410

# Database configuration
DB_NAME=clubs_production
DB_USER=clubs_prod
DB_PASSWORD=your-secure-db-password
DATABASE_URL=postgresql://clubs_prod:your-secure-db-password@db:5432/clubs_production

# Redis configuration
REDIS_PASSWORD=your-secure-redis-password
REDIS_URL=redis://:your-secure-redis-password@redis:6379

# Security secrets (generate secure values)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
SESSION_SECRET=your-super-secure-session-secret-at-least-32-characters

# OAuth credentials
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
FACEBOOK_CLIENT_ID=your-production-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-production-facebook-client-secret

# Email configuration
EMAIL_USER=your-production-email@domain.com
EMAIL_PASS=your-email-app-password
EMAIL_FROM=noreply@yourdomain.com

# URLs (with NGINX reverse proxy - no port needed)
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
```

### 2. Ensure Docker Starts on Boot

```bash
# Enable Docker service to start on boot (required for auto-restart)
sudo systemctl enable docker

# Verify Docker service status
sudo systemctl status docker
```

### 3. Production Deployment

```bash
# Build and start production services
docker-compose --env-file .env.production up -d

# Check service status
docker-compose --env-file .env.production ps

# View logs
docker-compose --env-file .env.production logs -f app
```

### 4. Database Setup

```bash
# Run database migrations
docker-compose --env-file .env.production exec app sh -c "cd server && npx prisma migrate deploy"

# Generate Prisma client (if needed)
docker-compose --env-file .env.production exec app sh -c "cd server && npx prisma generate"
```

## NGINX Reverse Proxy Setup (Required)

**Production deployments require NGINX** as a reverse proxy with SSL termination. NGINX handles HTTPS traffic on port 443 and forwards requests to the application on port 12410.

### NGINX Configuration

Create `/etc/nginx/sites-available/clubs-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to application
    location / {
        proxy_pass http://localhost:12410;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support for GraphQL subscriptions
    location /graphql {
        proxy_pass http://localhost:12410/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:12410/health;
        access_log off;
    }
}
```

### Enable NGINX Configuration

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/clubs-app /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx

# Enable NGINX to start on boot
sudo systemctl enable nginx
```

### SSL Certificate Setup

#### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

#### Option 2: Custom SSL Certificate

```bash
# Place your certificate files
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-private.key
```

### Option 2: Reverse Proxy Service

Use a separate reverse proxy service like Traefik or Caddy:

```yaml
# Add to docker-compose.yml
services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.insecure=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.myresolver.acme.httpchallenge=true
      - --certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.myresolver.acme.email=your-email@domain.com
      - --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    labels:
      - 'traefik.http.routers.app.rule=Host(`yourdomain.com`)'
      - 'traefik.http.routers.app.entrypoints=websecure'
      - 'traefik.http.routers.app.tls.certresolver=myresolver'
```

### Option 3: Application-Level HTTPS

Configure the Express app to handle HTTPS directly (requires code changes).

## Monitoring and Maintenance

### Health Checks

The application includes built-in health checks:

```bash
# Check application health (external port)
curl http://localhost:12410/health

# Check via Docker (internal port)
docker-compose exec app wget --spider http://localhost:4010/health
```

### Log Management

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db

# View Redis logs
docker-compose logs -f redis
```

### Backup

```bash
# Backup database
docker-compose exec db pg_dump -U clubs_prod clubs_production > backup.sql

# Backup Redis data
docker-compose exec redis redis-cli --rdb /data/backup.rdb
```

## Scaling

### Horizontal Scaling

To run multiple app instances:

```yaml
services:
  app:
    # ... existing configuration
    deploy:
      replicas: 3
    ports:
      - '4010-4012:4010'
```

### Resource Limits

```yaml
services:
  app:
    # ... existing configuration
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 12410 is available on the server
2. **Database connection**: Check DATABASE_URL and database service health
3. **Redis connection**: Verify REDIS_URL and Redis service status
4. **Environment variables**: Ensure all required variables are set

### Debug Commands

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 app

# Connect to application container
docker-compose exec app sh

# Test database connection
docker-compose exec db psql -U clubs_prod -d clubs_production

# Test Redis connection
docker-compose exec redis redis-cli -a your-secure-redis-password ping
```

## Security Considerations

1. **Use strong passwords** for database and Redis
2. **Generate secure secrets** for JWT and sessions
3. **Enable firewall** to restrict access to necessary ports only
4. **Regular updates** of Docker images and dependencies
5. **Monitor logs** for suspicious activity
6. **Backup regularly** and test restore procedures

## Performance Optimization

1. **Enable Redis caching** for sessions and frequently accessed data
2. **Configure database connection pooling**
3. **Use CDN** for static assets if needed
4. **Monitor resource usage** and scale accordingly
5. **Implement proper logging levels** in production
