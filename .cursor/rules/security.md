# Security Standards

## Authentication & Authorization
- Use JWT tokens with proper expiration
- Implement bcrypt for password hashing
- Use secure session management
- Implement rate limiting for auth endpoints
- Validate all inputs with Joi schemas

## Data Protection
- Use parameterized queries (Prisma handles this)
- Implement CORS properly
- Use security headers with Helmet
- Sanitize all user inputs
- Log security events
