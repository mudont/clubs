#!/bin/bash

# NGINX Setup Script for Clubs Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[NGINX]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_header "🔧 Setting up NGINX for Clubs Application"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Get domain name from user
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    print_error "Domain name is required"
    exit 1
fi

print_status "Setting up NGINX for domain: $DOMAIN_NAME"

# Install NGINX if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing NGINX..."
    apt update
    apt install -y nginx
else
    print_status "NGINX is already installed"
fi

# Install Certbot for Let's Encrypt
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot for SSL certificates..."
    apt install -y certbot python3-certbot-nginx
else
    print_status "Certbot is already installed"
fi

# Create NGINX configuration
print_status "Creating NGINX configuration..."
NGINX_CONFIG="/etc/nginx/sites-available/clubs-app"

cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
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
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    # Main application proxy
    location / {
        proxy_pass http://localhost:12410;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # GraphQL endpoint with rate limiting
    location /graphql {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://localhost:12410/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support for subscriptions
        proxy_read_timeout 86400;
    }

    # Authentication endpoints with stricter rate limiting
    location ~ ^/(login|signup|auth) {
        limit_req zone=login burst=5 nodelay;

        proxy_pass http://localhost:12410;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://localhost:12410/health;
        access_log off;

        # Quick timeout for health checks
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }
}
EOF

# Enable the site
print_status "Enabling NGINX site..."
ln -sf /etc/nginx/sites-available/clubs-app /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    print_status "Removing default NGINX site..."
    rm /etc/nginx/sites-enabled/default
fi

# Test NGINX configuration
print_status "Testing NGINX configuration..."
if nginx -t; then
    print_status "✅ NGINX configuration is valid"
else
    print_error "❌ NGINX configuration test failed"
    exit 1
fi

# Enable and start NGINX
print_status "Starting NGINX..."
systemctl enable nginx
systemctl restart nginx

# Check if application is running on port 12410
if ! netstat -tlnp | grep -q ":12410 "; then
    print_warning "⚠️  Application is not running on port 12410"
    print_status "Please deploy your application first: npm run deploy:prod"
fi

# Setup SSL certificate with Let's Encrypt
print_status "Setting up SSL certificate with Let's Encrypt..."
read -p "Do you want to obtain an SSL certificate now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Obtaining SSL certificate..."
    certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos --email "admin@$DOMAIN_NAME"

    if [ $? -eq 0 ]; then
        print_status "✅ SSL certificate obtained successfully"
    else
        print_warning "⚠️  SSL certificate setup failed. You can run it manually later:"
        echo "sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
    fi
else
    print_status "Skipping SSL certificate setup"
    print_status "You can set it up later with: sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
fi

# Open firewall ports
print_status "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    print_status "✅ UFW firewall configured for NGINX"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    print_status "✅ Firewalld configured for NGINX"
else
    print_warning "⚠️  Please manually configure your firewall to allow ports 80 and 443"
fi

print_header "🎉 NGINX Setup Complete!"
echo ""
print_status "Configuration Summary:"
echo "  - Domain: $DOMAIN_NAME"
echo "  - NGINX Config: /etc/nginx/sites-available/clubs-app"
echo "  - SSL: Let's Encrypt (if configured)"
echo "  - Proxy Target: http://localhost:12410"
echo ""
print_status "Next Steps:"
echo "  1. Deploy your application: npm run deploy:prod"
echo "  2. Test HTTPS access: https://$DOMAIN_NAME/health"
echo "  3. Monitor logs: sudo tail -f /var/log/nginx/access.log"
echo ""
print_status "🔍 Your application should now be accessible at https://$DOMAIN_NAME"
