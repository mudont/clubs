# Project Overview
This is a full-stack social and sports club management platform built with modern web technologies. Maintain enterprise-grade code quality with 0 ESLint errors.

# Architecture Principles

## Technology Stack
- Frontend: React 19, TypeScript, Apollo Client, Redux Toolkit
- Backend: Node.js, Express 5, GraphQL (Apollo Server), Prisma ORM
- Database: PostgreSQL, Redis
- Testing: Jest, Playwright, Supertest
- Code Quality: ESLint, Prettier, TypeScript strict mode

## Design Principles
- Type Safety First: Always use TypeScript with strict mode
- Zero ESLint Errors: Maintain 0 errors, warnings are acceptable for TypeScript `any` types only
- Import Organization: Follow ESLint import/order rules strictly
- Error Boundaries: Use React error boundaries with retry mechanisms
- Accessibility: WCAG compliance with Testing Library best practices
- Security: Input validation, rate limiting, secure authentication

# Development Workflow

## Before Committing
1. Run `npm run lint` (must have 0 errors)
2. Run `npm run type-check`
3. Run tests: `npm test`
4. Check accessibility: `npm run test:accessibility`
5. Verify build: `npm run build`
6. **Update documentation** if code changes affect features, APIs, or configuration

## Code Review Checklist
- [ ] TypeScript types are comprehensive
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Accessibility standards are met
- [ ] Security considerations are addressed
- [ ] Performance impact is considered
- [ ] **Documentation is updated** for any API, feature, or configuration changes
