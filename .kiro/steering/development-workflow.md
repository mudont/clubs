# Development Workflow & Standards

## Code Quality Standards

### ESLint Requirements

- **MUST maintain 0 ESLint errors** at all times
- Warnings are acceptable only for TypeScript `any` types
- Run `npm run lint` before every commit
- Use `npm run lint:fix` to auto-fix issues

### TypeScript Enforcement

- **ALWAYS use TypeScript (.ts/.tsx) for new files**
- **NEVER create JavaScript (.js/.jsx) files**
- Convert existing .js files to .ts when modifying them
- Use TypeScript for all scripts, utilities, and configuration files
- Maintain strict TypeScript configuration

### Import Organization

- Follow ESLint import/order rules strictly
- Group imports: external libraries → internal modules → relative imports
- Use absolute imports where configured
- Remove unused imports automatically

## Development Process

### Before Committing

1. Run `npm run lint` (must have 0 errors)
2. Run `npm run type-check`
3. Run tests: `npm test`
4. Check accessibility: `npm run test:a11y`
5. Verify build: `npm run build`
6. **Update documentation** if code changes affect features, APIs, or configuration

### Testing Requirements

- Write unit tests for new features
- Include accessibility tests using Testing Library
- Maintain test coverage thresholds
- Use Jest for backend, React Testing Library for frontend
- Run E2E tests with Playwright for critical flows

### Database Development

- Use Prisma migrations for schema changes
- Run `npx prisma generate` after schema updates
- Follow snake_case naming in PostgreSQL
- Use camelCase in Prisma schema with proper mapping
- Test migrations in development before production

## Code Patterns

### React Components

- Use functional components with hooks
- Implement error boundaries with fallback UI and retry mechanisms
- Use React.memo for performance optimization
- Implement lazy loading with Suspense
- Replace `window.confirm()` with custom confirmation dialogs
- Use proper dependency arrays in useEffect

### Error Handling

- Implement comprehensive error boundaries
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors appropriately for debugging
- Handle network failures gracefully

### Security Practices

- Validate all user inputs with Joi schemas
- Implement rate limiting on sensitive endpoints
- Use parameterized queries (Prisma handles this)
- Sanitize user-generated content
- Follow OWASP security guidelines

## Environment Management

### Development Setup

```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install

# Setup database
cd server && npx prisma migrate dev
cd server && npx prisma generate

# Start development
npm run dev
```

### Environment Variables

- Use `.env` files for configuration
- Never commit sensitive data
- Generate secure secrets with `npm run generate:secrets`
- Validate required environment variables on startup

### Docker Development

```bash
# Start with Docker (recommended)
docker-compose up -d

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up -d
```

## Performance Standards

### Frontend Performance

- Implement code splitting and lazy loading
- Use React.memo and useMemo appropriately
- Optimize bundle sizes
- Implement proper caching strategies
- Monitor Core Web Vitals

### Backend Performance

- Use database indexes appropriately
- Implement Redis caching for frequent queries
- Use connection pooling
- Monitor query performance
- Implement proper pagination

## Documentation Requirements

### Code Documentation

- Document complex business logic
- Use JSDoc for public APIs
- Keep README files updated
- Document environment variables
- Maintain API documentation

### Update Documentation When:

- Adding new features or endpoints
- Changing configuration requirements
- Modifying deployment processes
- Updating dependencies with breaking changes
- Adding new environment variables

## Deployment Process

### Staging Deployment

- Automatic deployment on `develop` branch
- Run full test suite
- Perform security scans
- Validate environment configuration

### Production Deployment

- Manual approval required
- Deploy from `main` branch only
- Run database migrations
- Perform health checks
- Monitor application metrics post-deployment

## Monitoring & Maintenance

### Health Checks

- Monitor application health endpoints
- Track database performance
- Monitor Redis cache hit rates
- Set up alerting for critical issues

### Regular Maintenance

- Update dependencies monthly
- Review security advisories
- Optimize database queries
- Clean up unused code and dependencies
