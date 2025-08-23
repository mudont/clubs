# Testing Guide

This document provides comprehensive information about the testing setup and practices for the server application.

## Overview

The testing strategy includes three levels of testing:

1. **Unit Tests** - Test individual functions and modules in isolation
2. **Integration Tests** - Test GraphQL resolvers and service interactions
3. **End-to-End Tests** - Test complete API workflows using HTTP requests

## Test Coverage Goals

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Prerequisites

Before running tests, ensure you have:

1. **PostgreSQL** running locally (default port 5432)
2. **Redis** running locally (default port 6379)
3. Node.js and npm installed
4. Environment variables configured

## Quick Start

1. **Setup test environment:**

   ```bash
   ./scripts/test-setup.sh
   ```

2. **Run all tests:**

   ```bash
   npm test
   ```

3. **Run tests with coverage:**
   ```bash
   npm run test:coverage
   ```

## Test Commands

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm test`                 | Run all tests                              |
| `npm run test:unit`        | Run unit tests only                        |
| `npm run test:integration` | Run integration tests only                 |
| `npm run test:e2e`         | Run end-to-end tests only                  |
| `npm run test:coverage`    | Run tests with coverage report             |
| `npm run test:watch`       | Run tests in watch mode                    |
| `npm run test:ci`          | Run tests for CI (no watch, with coverage) |

## Test Structure

```
src/__tests__/
├── setup.ts                 # Global test setup and configuration
├── helpers/
│   └── test-utils.ts        # Test utilities and factories
├── unit/                    # Unit tests
│   ├── auth/
│   ├── middleware/
│   ├── utils/
│   └── expenses/
├── integration/             # Integration tests
│   └── resolvers/
│       ├── auth.test.ts
│       ├── groups.test.ts
│       └── tennis.test.ts
└── e2e/                     # End-to-end tests
    └── graphql-api.test.ts
```

## Test Database

### Automatic Setup

Tests automatically:

- Create a unique test database for each test run
- Run Prisma migrations
- Clean up data between tests
- Drop the test database after completion

### Manual Database Management

If you need to manually manage test databases:

```bash
# Create test database
createdb test_clubs_manual

# Run migrations
DATABASE_URL="postgresql://postgres:password@localhost:5432/test_clubs_manual" npx prisma migrate deploy

# Drop test database
dropdb test_clubs_manual
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions in isolation:

```typescript
// src/__tests__/unit/utils/example.test.ts
import { myFunction } from '../../../utils/example';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Tests

Integration tests should test GraphQL resolvers with real database:

```typescript
// src/__tests__/integration/resolvers/example.test.ts
import { createTestUser, createAuthenticatedContext } from '../../helpers/test-utils';

describe('Example Resolvers', () => {
  it('should create resource', async () => {
    const user = await createTestUser();
    const context = await createAuthenticatedContext({ id: user.id });

    const result = await resolvers.Mutation.createResource(
      null,
      { input: { name: 'Test' } },
      context,
      mockGraphQLInfo
    );

    expect(result.name).toBe('Test');
  });
});
```

### End-to-End Tests

E2E tests should test complete API workflows:

```typescript
// src/__tests__/e2e/api.test.ts
import request from 'supertest';

describe('API Endpoints', () => {
  it('should handle GraphQL query', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: 'query { me { id } }',
      })
      .expect(200);

    expect(response.body.data).toBeDefined();
  });
});
```

## Test Utilities

### Test Factories

Use test factories to create test data:

```typescript
import { createTestUser, createTestGroup, createTestMembership } from '../helpers/test-utils';

// Create a user
const user = await createTestUser({
  username: 'testuser',
  email: 'test@example.com',
});

// Create a group
const group = await createTestGroup({
  name: 'Test Group',
  isPublic: true,
});

// Create membership
await createTestMembership(user.id, group.id, { isAdmin: true });
```

### Authentication Context

Create authenticated contexts for testing protected resolvers:

```typescript
import { createAuthenticatedContext } from '../helpers/test-utils';

const context = await createAuthenticatedContext({
  username: 'testuser',
});

// Use context in resolver tests
const result = await resolvers.Query.me(null, {}, context, mockGraphQLInfo);
```

### Mock Services

External services are automatically mocked in test setup:

```typescript
// Email service is mocked
const { sendVerificationEmail } = require('../../../auth/email');
expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'token');

// Logger is mocked
const { logError } = require('../../../utils/logger');
expect(logError).toHaveBeenCalledWith('Error message');
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Clean up after tests** (handled automatically by setup)

### Test Data

1. **Use test factories** instead of creating data manually
2. **Create minimal test data** needed for each test
3. **Use unique identifiers** to avoid conflicts
4. **Don't rely on test execution order**

### Assertions

1. **Be specific** in assertions
2. **Test both success and error cases**
3. **Verify side effects** (database changes, external calls)
4. **Use appropriate matchers**

### Performance

1. **Keep tests fast** by using minimal data
2. **Use transactions** where possible (handled by setup)
3. **Mock external services** to avoid network calls
4. **Run tests in parallel** when safe

## Common Patterns

### Testing Authentication

```typescript
it('should require authentication', async () => {
  const context = await createTestContext(); // No user

  await expect(
    resolvers.Mutation.protectedAction(null, {}, context, mockGraphQLInfo)
  ).rejects.toThrow('Authentication required');
});
```

### Testing Authorization

```typescript
it('should require admin privileges', async () => {
  const user = await createTestUser();
  const group = await createTestGroup();
  await createTestMembership(user.id, group.id, { isAdmin: false });

  const context = await createAuthenticatedContext({ id: user.id });

  await expect(
    resolvers.Mutation.adminAction(null, { groupId: group.id }, context, mockGraphQLInfo)
  ).rejects.toThrow('Admin privileges required');
});
```

### Testing Validation

```typescript
it('should validate input', async () => {
  const context = await createAuthenticatedContext();

  await expect(
    resolvers.Mutation.createResource(
      null,
      { input: { name: '' } }, // Invalid input
      context,
      mockGraphQLInfo
    )
  ).rejects.toThrow('Validation failed');
});
```

### Testing Database Changes

```typescript
it('should create record in database', async () => {
  const context = await createAuthenticatedContext();

  const result = await resolvers.Mutation.createResource(
    null,
    { input: { name: 'Test' } },
    context,
    mockGraphQLInfo
  );

  // Verify in database
  const record = await prisma.resource.findUnique({
    where: { id: result.id },
  });

  expect(record).toBeTruthy();
  expect(record.name).toBe('Test');
});
```

## Debugging Tests

### Running Single Test

```bash
# Run specific test file
npm test -- auth.test.ts

# Run specific test case
npm test -- --testNamePattern="should login successfully"
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run tests with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage and verbose output
npm run test:coverage -- --verbose
```

## Continuous Integration

The test suite is designed to run in CI environments:

```bash
# CI command (no watch, with coverage)
npm run test:ci
```

### CI Environment Variables

Set these environment variables in your CI:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/test_clubs_ci
JWT_SECRET=test-secret-key-for-testing-only-32-chars
BCRYPT_ROUNDS=4
REDIS_URL=redis://localhost:6379/1
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify database permissions

2. **Redis connection errors**
   - Ensure Redis is running
   - Check REDIS_URL format
   - Verify Redis is accessible

3. **Test timeouts**
   - Increase Jest timeout in jest.config.js
   - Check for hanging promises
   - Ensure proper cleanup

4. **Port conflicts**
   - Use different ports for test services
   - Check for running processes

### Getting Help

1. Check test logs for specific error messages
2. Run tests with `--verbose` flag for more details
3. Verify all prerequisites are installed and running
4. Check environment variables are set correctly

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- `coverage/coverage-final.json` - JSON coverage data

Open the HTML report in your browser to see detailed coverage information.
