# Port Configuration Guide

## Overview

The application is configured with a multi-layer port mapping for production deployment with NGINX reverse proxy.

## Production Architecture

```
Internet (HTTPS:443) → NGINX (SSL Termination) → Application (Port 12410) → Docker Container (Port 4010)
```

## Port Mapping Layers

1. **Public Access**: Port 443 (HTTPS) - handled by NGINX
2. **NGINX → Application**: Port 12410 (internal server communication)
3. **Server → Container**: Port 4010 (Docker internal)

## Configuration Files

### Docker Compose

```yaml
# docker-compose.yml
services:
  app:
    ports:
      - '${EXTERNAL_PORT:-12410}:4010'
```

### Environment Variables

```bash
# .env.production
PORT=4010              # Internal container port
EXTERNAL_PORT=12410    # External server port
FRONTEND_URL=http://localhost:12410
BACKEND_URL=http://localhost:12410
```

## Deployment Commands

### Production Deployment

```bash
# Deploy with port mapping 12410 → 4010
npm run deploy:prod

# Or manually
docker-compose --env-file .env.production up -d
```

### Access URLs

#### Public Access (via NGINX)

- **Application**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/health
- **GraphQL Playground**: https://yourdomain.com/graphql

#### Direct Access (for testing/debugging)

- **Application**: http://your-server:12410
- **Health Check**: http://your-server:12410/health
- **GraphQL Playground**: http://your-server:12410/graphql

## Testing the Configuration

### Local Testing

```bash
# Deploy locally
npm run deploy:prod

# Test the application
curl http://localhost:12410/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Server Testing

```bash
# Check if application port is listening
netstat -tlnp | grep 12410

# Check if NGINX is listening on HTTPS
netstat -tlnp | grep 443

# Test direct application access
curl http://localhost:12410/health

# Test via NGINX (production access)
curl https://yourdomain.com/health
```

## Firewall Configuration

### NGINX Setup (Production)

For production with NGINX, open ports 80 and 443:

```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### Direct Access (Development/Testing)

For direct access to the application, also open port 12410:

### Ubuntu/Debian

```bash
sudo ufw allow 12410
```

### CentOS/RHEL

```bash
sudo firewall-cmd --permanent --add-port=12410/tcp
sudo firewall-cmd --reload
```

### AWS Security Group

Add inbound rule:

- Type: Custom TCP
- Port: 12410
- Source: 0.0.0.0/0 (or specific IPs)

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 12410
lsof -i :12410

# Kill process if needed
sudo kill -9 <PID>
```

### Container Not Accessible

```bash
# Check container status
docker-compose --env-file .env.production ps

# Check container logs
docker-compose --env-file .env.production logs app

# Test internal container port
docker-compose --env-file .env.production exec app wget --spider http://localhost:4010/health
```

### Network Issues

```bash
# Check Docker networks
docker network ls

# Inspect the clubs network
docker network inspect clubs_clubs-network
```

## Alternative Port Configurations

### Different External Port

To use a different external port (e.g., 8080):

```bash
# In .env.production
EXTERNAL_PORT=8080
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:8080
```

### Multiple Instances

To run multiple instances on different ports:

```bash
# Instance 1
EXTERNAL_PORT=12410

# Instance 2
EXTERNAL_PORT=12411

# Instance 3
EXTERNAL_PORT=12412
```

## Security Considerations

1. **Firewall**: Only open port 12410 to necessary sources
2. **Reverse Proxy**: Consider using a reverse proxy for SSL termination
3. **Load Balancer**: Use a load balancer for production traffic
4. **Monitoring**: Monitor port 12410 for unusual traffic

## Production Best Practices

1. **Use HTTPS**: Configure SSL/TLS for production
2. **Domain Name**: Use a proper domain instead of IP:port
3. **Load Balancing**: Distribute traffic across multiple instances
4. **Monitoring**: Set up health checks and alerting
5. **Backup**: Regular backups of data and configuration
