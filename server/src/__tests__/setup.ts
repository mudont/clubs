import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32-chars';
process.env.SESSION_SECRET = 'test-session-secret-for-testing-only-32-chars';
process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use different Redis DB for tests
process.env.PORT = '4011'; // Different port for tests

// Generate a unique test database name for this test run
const testDbName = `test_clubs_${randomBytes(8).toString('hex')}`;
const testDatabaseUrl = `postgresql://postgres:password@localhost:5432/${testDbName}`;
process.env.DATABASE_URL = testDatabaseUrl;

let prisma: PrismaClient;

beforeAll(async () => {
  // Create test database
  try {
    execSync(`createdb ${testDbName}`, { stdio: 'ignore' });
  } catch (error) {
    // Database might already exist, ignore error
  }

  // Initialize Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });

  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'ignore',
  });

  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'ignore' });
});

afterAll(async () => {
  // Clean up
  if (prisma) {
    await prisma.$disconnect();
  }

  // Drop test database
  try {
    execSync(`dropdb ${testDbName}`, { stdio: 'ignore' });
  } catch (error) {
    // Ignore errors when dropping database
  }
});

beforeEach(async () => {
  // Clean all tables before each test
  if (prisma) {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter(name => name !== '_prisma_migrations')
      .map(name => `"public"."${name}"`)
      .join(', ');

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }
});

// Export test utilities
export { prisma, testDatabaseUrl };

// Mock external services for tests
jest.mock('../auth/email', () => ({
  generateVerificationToken: jest.fn().mockReturnValue('mock-verification-token'),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/logger', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
  logHttp: jest.fn(),
  logPerformance: jest.fn(),
  logQuery: jest.fn(),
  logSecurityEvent: jest.fn(),
  logRequest: jest.fn(),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

// Mock Redis for tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    disconnect: jest.fn(),
  }));
});
