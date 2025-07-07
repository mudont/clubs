# Clubs - Social & Sports Club Management Platform

> **A modern, full-stack web application for managing social and sports clubs with real-time chat, event management, and member administration.**

[![CI/CD Pipeline](https://github.com/username/clubs/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/username/clubs/actions)
[![Test Coverage](https://codecov.io/gh/username/clubs/branch/main/graph/badge.svg)](https://codecov.io/gh/username/clubs)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=username_clubs&metric=security_rating)](https://sonarcloud.io/dashboard?id=username_clubs)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Building](#building)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [DevOps Workflows](#devops-workflows)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Clubs is a production-ready social and sports club management platform built with modern web technologies. It provides comprehensive club management, real-time communication, event scheduling, and member administration capabilities.

### **Tech Stack**
- **Frontend**: React 19, TypeScript, Apollo Client, Redux Toolkit
- **Backend**: Node.js, Express, GraphQL, Prisma ORM
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Nginx, GitHub Actions
- **Monitoring**: Winston, Custom monitoring scripts
- **Testing**: Jest, Playwright, Supertest

### **Key Capabilities**
- Multi-authentication (Local, Google, GitHub, Facebook OAuth)
- Real-time chat with WebSocket support
- Event management with RSVP functionality
- Progressive Web App (PWA) with offline support
- Comprehensive security and monitoring
- Production-ready DevOps pipeline

---

## ✨ Features

For a comprehensive list of features and architecture details, see [FEATURES.md](./FEATURES.md).

**Core Features:**
- 🔐 Secure authentication & authorization
- 👥 Club creation and member management
- 📅 Event scheduling and RSVP system
- 💬 Real-time chat and messaging
- 📱 Progressive Web App (PWA)
- 🔒 Enterprise-grade security
- 📊 Monitoring and observability
- 🚀 Production-ready infrastructure

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/username/clubs.git
cd clubs

# Copy environment configuration
cp env.example .env

# Edit .env with your configuration
nano .env
```

### **2. Start with Docker (Recommended)**
```bash
# Start all services (PostgreSQL, Redis, Application)
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
open http://localhost:4010
```

### **3. Manual Setup (Development)**
```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Start PostgreSQL and Redis
docker-compose up -d db redis

# Setup database
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

# Start development servers
npm run dev:server &  # Backend on :4010
npm run dev:client &  # Frontend on :3000
```

---

## 🛠️ Development Setup

### **Environment Configuration**

1. **Copy the example environment file:**
```bash
cp env.example .env
```

2. **Configure required variables:**
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/clubs_db

# Security (Generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long

# Email Configuration (for email verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@clubs-app.com

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Development Workflow**

1. **Install dependencies:**
```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
cd ..
```

2. **Database setup:**
```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

3. **Start development servers:**
```bash
# Start backend (GraphQL server)
cd server
npm run dev

# In another terminal, start frontend
cd client
npm start

# Or use the convenience script from root
npm run dev
```

4. **Access services:**
- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:4010/graphql
- **Health Check**: http://localhost:4010/health
- **Prisma Studio**: http://localhost:5555

### **Development Tools**

```bash
# Code formatting
npm run format

# Linting
npm run lint

# Type checking
npm run type-check

# Database reset (development only)
cd server && npx prisma migrate reset
```

---

## 🌐 Production Deployment

### **Docker Production Deployment**

1. **Environment Setup:**
```bash
# Create production environment file
cp env.example .env.production

# Configure production variables
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
```

2. **Deploy with Docker Compose:**
```bash
# Build and start production services
docker-compose -f docker-compose.yml --profile production up -d

# Or deploy specific services
docker-compose up -d db redis app nginx
```

3. **Initialize production database:**
```bash
# Run migrations
docker-compose exec app npm run migrate

# (Optional) Seed production data
docker-compose exec app npm run seed:prod
```

### **Manual Production Deployment**

1. **Build the application:**
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
cd ..
```

2. **Setup production services:**
```bash
# Install production dependencies only
cd server && npm ci --only=production
cd ../client && npm ci --only=production

# Setup PostgreSQL and Redis
# Configure nginx reverse proxy
# Setup SSL certificates
```

3. **Start production services:**
```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# Or start manually
cd server && npm start
```

### **Cloud Deployment**

**AWS/GCP/Azure:**
```bash
# Build and push Docker image
docker build -t clubs-app .
docker tag clubs-app your-registry/clubs-app:latest
docker push your-registry/clubs-app:latest

# Deploy with Kubernetes
kubectl apply -f k8s/
```

**Heroku:**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

---

## 🔨 Building

### **Development Build**
```bash
# Build server
cd server
npm run build

# Build client
cd ../client
npm run build

# Or build both from root
npm run build
```

### **Production Build**
```bash
# Build optimized production bundles
NODE_ENV=production npm run build

# Build Docker image
docker build -t clubs-app .

# Multi-architecture build
docker buildx build --platform linux/amd64,linux/arm64 -t clubs-app .
```

### **Build Verification**
```bash
# Test production build locally
npm run build
npm run start:prod

# Run build in Docker
docker run -p 4010:4010 --env-file .env clubs-app
```

---

## 🧪 Testing

### **Unit Tests**
```bash
# Run all tests
npm test

# Run server tests
cd server && npm test

# Run client tests
cd client && npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### **Integration Tests**
```bash
# Run integration tests with test database
cd server
NODE_ENV=test npm run test:integration

# Setup test database
DATABASE_URL=postgresql://postgres:password@localhost:5432/clubs_test npm run test
```

### **End-to-End Tests**
```bash
# Install Playwright
cd client
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.ts
```

### **Security Tests**
```bash
# Run security scan
npm run security:scan

# Run dependency audit
npm audit

# Run Semgrep security analysis
semgrep --config=auto .
```

### **Performance Tests**
```bash
# Load testing with Artillery
npm install -g artillery
artillery run tests/performance/load-test.yml

# Database performance
cd server
npm run test:db-performance
```

### **Test Configuration**

**Jest Configuration** (`server/jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 📊 Monitoring

### **Application Monitoring**

1. **Start monitoring services:**
```bash
# Start monitoring script
cd server
node scripts/monitor.js

# Run as background service
nohup node scripts/monitor.js > logs/monitor.log 2>&1 &

# With PM2
pm2 start scripts/monitor.js --name "clubs-monitor"
```

2. **Health checks:**
```bash
# Application health
curl http://localhost:4010/health

# Database health
curl http://localhost:4010/health/db

# Redis health
curl http://localhost:4010/health/redis

# System metrics
curl http://localhost:4010/metrics
```

### **Log Management**

1. **View logs:**
```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# Access logs
tail -f logs/access.log

# Docker logs
docker-compose logs -f app
```

2. **Log aggregation:**
```bash
# Centralized logging with ELK stack
docker-compose -f docker-compose.elk.yml up -d

# View logs in Kibana
open http://localhost:5601
```

### **Metrics Collection**

1. **Prometheus metrics:**
```bash
# Start Prometheus
docker run -p 9090:9090 -v ./prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus

# Access metrics
open http://localhost:9090
```

2. **Grafana dashboards:**
```bash
# Start Grafana
docker run -p 3001:3000 grafana/grafana

# Import dashboard from grafana/dashboard.json
```

### **Alerting**

1. **Configure webhook alerts:**
```bash
# Set webhook URL in environment
export ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# Configure alert thresholds
export ALERT_CPU_THRESHOLD=80
export ALERT_MEMORY_THRESHOLD=80
export ALERT_RESPONSE_TIME_MS=5000
```

2. **Email alerts:**
```bash
# Configure SMTP settings
export SMTP_HOST=smtp.gmail.com
export SMTP_USER=alerts@yourdomain.com
export SMTP_PASS=your-app-password
```

---

## 🔄 DevOps Workflows

### **CI/CD Pipeline**

The application uses GitHub Actions for automated CI/CD:

1. **Continuous Integration:**
   - Code quality checks (ESLint, Prettier)
   - Security scanning (Trivy, Semgrep)
   - Unit and integration tests
   - Build verification
   - Test coverage reporting

2. **Continuous Deployment:**
   - Staging deployment on develop branch
   - Production deployment on main branch
   - Docker image building and registry push
   - Database migrations
   - Health checks and rollback

### **Environment Management**

```bash
# Development
git checkout develop
docker-compose up -d

# Staging
git checkout staging
docker-compose -f docker-compose.staging.yml up -d

# Production
git checkout main
docker-compose -f docker-compose.prod.yml up -d
```

### **Database Management**

1. **Migrations:**
```bash
# Create migration
cd server
npx prisma migrate dev --name add-new-feature

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

2. **Backups:**
```bash
# Manual backup
node scripts/backup.js

# Automated backups (cron)
0 2 * * * /usr/bin/node /path/to/clubs/server/scripts/backup.js

# Restore from backup
psql -U postgres -d clubs_db < backups/database_backup_2024-01-01.sql
```

### **Deployment Scripts**

1. **Zero-downtime deployment:**
```bash
#!/bin/bash
# deploy.sh
./scripts/health-check.sh
docker-compose pull
docker-compose up -d --no-deps app
./scripts/wait-for-health.sh
docker-compose restart nginx
```

2. **Rollback script:**
```bash
#!/bin/bash
# rollback.sh
docker-compose stop app
docker-compose up -d --scale app=0
docker tag clubs-app:previous clubs-app:latest
docker-compose up -d app
```

---

## 🔒 Security

### **Security Checklist**

✅ **Environment Security:**
- [ ] JWT secrets are 32+ characters
- [ ] Database passwords are strong
- [ ] Environment files are not committed
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured

✅ **Application Security:**
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] Security headers configured

✅ **Infrastructure Security:**
- [ ] Non-root Docker containers
- [ ] Network security groups configured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Backup encryption enabled

### **Security Monitoring**

```bash
# Run security audit
npm audit
npm audit fix

# Check for vulnerabilities
docker run --rm -v "$PWD":/app securecodewarrior/nodejs-security-scanner

# Monitor security logs
tail -f logs/security.log | grep "SECURITY_EVENT"
```

### **Security Updates**

```bash
# Update dependencies
npm update
npm audit fix

# Update Docker base images
docker pull node:18-alpine
docker build --no-cache -t clubs-app .

# Apply security patches
apt-get update && apt-get upgrade
```

---

## 🚨 Troubleshooting

### **Common Issues**

**Database Connection Issues:**
```bash
# Check database status
docker-compose ps db

# Check connection
psql -h localhost -U postgres -d clubs_db

# Reset database
docker-compose down db
docker volume rm clubs_postgres_data
docker-compose up -d db
```

**Redis Connection Issues:**
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli ping

# Clear Redis cache
redis-cli flushall
```

**Application Startup Issues:**
```bash
# Check application logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Restart application
docker-compose restart app
```

### **Performance Issues**

**Slow Database Queries:**
```bash
# Enable query logging
echo "log_statement = 'all'" >> postgresql.conf

# Analyze slow queries
cd server
npm run analyze:queries

# Check database performance
docker-compose exec db pg_stat_activity
```

**High Memory Usage:**
```bash
# Monitor memory usage
docker stats

# Analyze Node.js memory
node --inspect server/dist/index.js

# Check for memory leaks
npm install -g clinic
clinic doctor -- node server/dist/index.js
```

### **Debugging**

**Debug Mode:**
```bash
# Start in debug mode
DEBUG=* npm run dev

# Debug specific modules
DEBUG=apollo:* npm run dev

# Node.js debugging
node --inspect-brk server/dist/index.js
```

**Production Debugging:**
```bash
# Check health endpoints
curl http://localhost:4010/health

# Monitor logs
tail -f logs/app.log | grep ERROR

# Check system resources
top
df -h
free -m
```

---

## 🤝 Contributing

### **Development Process**

1. **Fork and clone:**
```bash
git clone https://github.com/yourusername/clubs.git
cd clubs
```

2. **Create feature branch:**
```bash
git checkout -b feature/new-feature
```

3. **Make changes and test:**
```bash
npm test
npm run lint
npm run type-check
```

4. **Commit and push:**
```bash
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

5. **Create pull request**

### **Code Standards**

- Follow TypeScript and ESLint rules
- Write tests for new features
- Update documentation
- Follow conventional commits
- Ensure all CI checks pass

### **Project Structure**

```
clubs/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   ├── prisma/
│   ├── scripts/
│   └── package.json
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD
├── docker-compose.yml      # Development environment
└── README.md
```

---

## 📞 Support

- **Documentation**: [FEATURES.md](./FEATURES.md)
- **Issues**: [GitHub Issues](https://github.com/username/clubs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/username/clubs/discussions)
- **Security**: security@yourdomain.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the developer community**
