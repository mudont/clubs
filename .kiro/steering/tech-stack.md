# Technology Stack & Architecture

## Frontend Stack

- **React 19**: Latest React with concurrent features and modern hooks
- **TypeScript**: Full type safety across the entire frontend
- **Apollo Client**: GraphQL client with intelligent caching and state management
- **Redux Toolkit**: Predictable state management for complex UI state
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Progressive Web App**: Installable app with offline capabilities

## Backend Stack

- **Node.js + Express 5**: High-performance JavaScript runtime with Express
- **GraphQL + Apollo Server**: Type-safe API with real-time subscriptions
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **Passport.js**: Multi-provider authentication (Local, Google, GitHub, Facebook)
- **JWT**: Stateless authentication with secure token management

## Database & Caching

- **PostgreSQL**: ACID-compliant relational database with snake_case naming
- **Redis**: In-memory caching and session storage for scalability
- **Prisma Schema**: Code-first database modeling with type generation

## Infrastructure & DevOps

- **Docker**: Containerized deployment with multi-stage builds
- **Docker Compose**: Complete development environment orchestration
- **Nginx**: Reverse proxy and static file serving
- **GitHub Actions**: Automated CI/CD pipeline with security scanning

## Key Architecture Patterns

### Database Design

- PostgreSQL uses snake_case for all table names and column names
- Prisma schema uses camelCase for TypeScript compatibility
- All database entities are mapped using `@map()` and `@@map()` directives
- Examples: `createdAt` → `created_at`, `firstName` → `first_name`

### Authentication Flow

1. Multi-provider OAuth + local authentication
2. JWT tokens with Redis session storage
3. Email verification and password reset flows
4. Rate limiting on authentication endpoints

### Real-Time Communication

- GraphQL subscriptions over WebSocket
- Redis pub/sub for message broadcasting
- Apollo Client cache updates for real-time UI

### Security Features

- Input validation with Joi schemas
- Rate limiting on all endpoints
- CORS configuration and security headers
- bcrypt password hashing
- HTTP-only secure cookies

## Development Standards

- **Zero ESLint Errors**: Maintain 0 errors, warnings acceptable for TypeScript `any` types only
- **TypeScript First**: Always use .ts/.tsx for new files, never .js/.jsx
- **Import Organization**: Follow ESLint import/order rules strictly
- **Error Boundaries**: React error boundaries with retry mechanisms
- **Accessibility**: WCAG compliance with Testing Library best practices
