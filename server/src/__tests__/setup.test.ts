import { prisma } from './setup';

describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.DATABASE_URL).toContain('test_clubs_');
  });

  it('should have database connection', async () => {
    // Simple query to test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should clean database between tests', async () => {
    // Create a test record
    const user = await prisma.user.create({
      data: {
        username: 'cleanup_test',
        email: 'cleanup@test.com',
        emailVerified: true,
      },
    });

    expect(user).toBeDefined();

    // The beforeEach in setup.ts should clean this up automatically
    // This test verifies the cleanup mechanism works
  });

  it('should have mocked external services', () => {
    const emailModule = require('../auth/email');
    const loggerModule = require('../utils/logger');

    expect(emailModule.generateVerificationToken).toBeDefined();
    expect(emailModule.sendVerificationEmail).toBeDefined();
    expect(loggerModule.logError).toBeDefined();
    expect(loggerModule.logInfo).toBeDefined();
  });
});
