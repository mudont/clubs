# Production Architecture

## Overview

The Clubs application uses a multi-layer architecture with NGINX as a reverse proxy, Docker containers for the application, and external databases.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │    │                 │
│   Internet      │    │   NGINX         │    │   Application   │    │   Docker        │
│   (Users)       │    │   Reverse       │    │   Server        │    │   Container     │
│                 │    │   Proxy         │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │ HTTPS:443             │ HTTP:12410            │ HTTP:4010             │
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                                 │                       │
                        ┌─────────────────┐    ┌─────────────────┐
                        │                 │    │                 │
                        │   PostgreSQL    │    │     Redis       │
                        │   Database      │    │     Cache       │
                        │                 │    │                 │
                        └─────────────────┘    └─────────────────┘
                                 │                       │
                                 │ Port:5432             │ Port:6379
                                 │                       │
```

## Component Details

### 1. NGINX Reverse Proxy

- **Purpose**: SSL termination, load balancing, security
- **Port**: 443 (HTTPS), 80 (HTTP redirect)
- **Features**:
  - SSL/TLS termination with Let's Encrypt
  - HTTP to HTTPS redirect
  - Rate limiting
  - Security headers
  - WebSocket support for GraphQL subscriptions
  - Static file caching

### 2. Application Server

- **Technology**: Node.js + Express + GraphQL
- **Port**: 12410 (external), 4010 (internal Docker)
- **Features**:
  - GraphQL API
  - Real-time subscriptions
  - Authentication (OAuth + local)
  - File uploads
  - Health checks

### 3. Database Layer

- **PostgreSQL**: Primary data storage
  - Port: 5432
  - Persistent volumes
  - Automatic backups
- **Redis**: Caching and sessions
  - Port: 6379
  - Session storage
  - Real-time data caching

### 4. Docker Containers

- **App Container**: Node.js application
- **DB Container**: PostgreSQL database
- **Redis Container**: Redis cache
- **Auto-restart**: `unless-stopped` policy

## Traffic Flow

### 1. User Request

```
User Browser → HTTPS:443 → NGINX
```

### 2. SSL Termination

```
NGINX → SSL Certificate Validation → Decrypt HTTPS
```

### 3. Reverse Proxy

```
NGINX → HTTP:12410 → Application Server
```

### 4. Container Communication

```
Application Server → Port:4010 → Docker Container
```

### 5. Database Access

```
Docker Container → PostgreSQL:5432 & Redis:6379
```

## Security Layers

### 1. NGINX Security

- SSL/TLS encryption
- Rate limiting
- Security headers (HSTS, XSS protection, etc.)
- Request filtering
- DDoS protection

### 2. Application Security

- JWT authentication
- OAuth integration
- Input validation
- CORS configuration
- Session management

### 3. Network Security

- Firewall configuration
- Internal Docker network
- Database access restrictions
- Health check endpoints

## Deployment Process

### 1. Infrastructure Setup

```bash
# Setup NGINX with SSL
npm run setup:nginx

# Configure firewall
sudo ufw allow 80
sudo ufw allow 443
```

### 2. Application Deployment

```bash
# Deploy application containers
npm run deploy:prod

# Verify deployment
curl https://yourdomain.com/health
```

### 3. Monitoring

```bash
# Check NGINX status
sudo systemctl status nginx

# Check application logs
docker-compose --env-file .env.production logs -f app

# Monitor NGINX logs
sudo tail -f /var/log/nginx/access.log
```

## High Availability Considerations

### 1. Load Balancing

```nginx
upstream app_servers {
    server localhost:12410;
    server localhost:12411;
    server localhost:12412;
}
```

### 2. Database Replication

- Master-slave PostgreSQL setup
- Redis clustering
- Automated failover

### 3. Container Orchestration

- Docker Swarm or Kubernetes
- Health checks and auto-recovery
- Rolling deployments

## Monitoring and Logging

### 1. Application Monitoring

- Health check endpoints
- Performance metrics
- Error tracking
- Real-time alerts

### 2. Infrastructure Monitoring

- NGINX access/error logs
- Docker container metrics
- Database performance
- SSL certificate expiry

### 3. Log Aggregation

- Centralized logging
- Log rotation
- Search and analysis
- Alerting on errors

## Backup Strategy

### 1. Database Backups

- Daily PostgreSQL dumps
- Redis persistence
- Automated backup verification
- Off-site storage

### 2. Configuration Backups

- NGINX configuration
- SSL certificates
- Environment variables
- Docker configurations

### 3. Application Backups

- Source code versioning
- Docker image registry
- Static file backups
- User uploads

## Performance Optimization

### 1. NGINX Optimization

- Gzip compression
- Static file caching
- Connection pooling
- Buffer optimization

### 2. Application Optimization

- Database connection pooling
- Redis caching
- GraphQL query optimization
- Image optimization

### 3. Database Optimization

- Index optimization
- Query performance tuning
- Connection limits
- Memory configuration

## Scaling Strategy

### 1. Horizontal Scaling

- Multiple application instances
- Load balancer configuration
- Session sharing via Redis
- Database read replicas

### 2. Vertical Scaling

- Increased server resources
- Container resource limits
- Database memory tuning
- Cache size optimization

### 3. Geographic Distribution

- CDN integration
- Multi-region deployment
- Database replication
- Edge caching
