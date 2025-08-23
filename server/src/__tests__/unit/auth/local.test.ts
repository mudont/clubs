import bcrypt from 'bcrypt';
import { signup } from '../../../auth/local';
import { createMockRequest, createMockResponse, createTestUser } from '../../helpers/test-utils';
import { prisma } from '../../setup';

describe('Local Authentication', () => {
  describe('signup', () => {
    const validSignupData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      username: 'testuser',
    };

    it('should create a new user with valid data', async () => {
      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Signup successful. Please check your email to verify your account.',
        user: expect.objectContaining({
          email: validSignupData.email,
          username: validSignupData.username,
        }),
      });

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: validSignupData.email },
      });

      expect(user).toBeTruthy();
      expect(user?.email).toBe(validSignupData.email);
      expect(user?.username).toBe(validSignupData.username);
      expect(user?.emailVerified).toBe(false);
      expect(user?.passwordHash).toBeTruthy();

      // Verify password was hashed
      const isValidPassword = await bcrypt.compare(validSignupData.password, user!.passwordHash!);
      expect(isValidPassword).toBe(true);
    });

    it('should reject signup with existing email', async () => {
      // Create existing user
      await createTestUser({ email: validSignupData.email });

      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email already in use.',
      });
    });

    it('should reject signup with existing username', async () => {
      // Create existing user with different email but same username
      await createTestUser({
        email: 'different@example.com',
        username: validSignupData.username,
      });

      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username already in use.',
      });
    });

    it('should reject signup with missing email', async () => {
      const req = createMockRequest({
        body: {
          password: validSignupData.password,
          username: validSignupData.username,
        },
      });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and username are required.',
      });
    });

    it('should reject signup with missing password', async () => {
      const req = createMockRequest({
        body: {
          email: validSignupData.email,
          username: validSignupData.username,
        },
      });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and username are required.',
      });
    });

    it('should reject signup with missing username', async () => {
      const req = createMockRequest({
        body: {
          email: validSignupData.email,
          password: validSignupData.password,
        },
      });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email, password, and username are required.',
      });
    });

    it('should handle database errors gracefully', async () => {
      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      // Mock prisma to throw an error
      const originalFindUnique = prisma.user.findUnique;
      prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Signup failed.',
      });

      // Restore original method
      prisma.user.findUnique = originalFindUnique;
    });

    it('should hash password with sufficient complexity', async () => {
      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      await signup(req, res);

      const user = await prisma.user.findUnique({
        where: { email: validSignupData.email },
      });

      expect(user?.passwordHash).toBeTruthy();
      expect(user?.passwordHash).not.toBe(validSignupData.password);
      expect(user?.passwordHash?.length).toBeGreaterThan(50);

      // Verify bcrypt hash format
      expect(user?.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
    });

    it('should create user with optional fields', async () => {
      const signupDataWithOptionals = {
        ...validSignupData,
        firstName: 'John',
        lastName: 'Doe',
      };

      const req = createMockRequest({ body: signupDataWithOptionals });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      const user = await prisma.user.findUnique({
        where: { email: validSignupData.email },
      });

      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
    });

    it('should trim whitespace from input fields', async () => {
      const signupDataWithWhitespace = {
        email: '  test@example.com  ',
        password: validSignupData.password,
        username: '  testuser  ',
      };

      const req = createMockRequest({ body: signupDataWithWhitespace });
      const res = createMockResponse();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user?.email).toBe('test@example.com');
      expect(user?.username).toBe('testuser');
    });

    it('should handle email verification token generation', async () => {
      const req = createMockRequest({ body: validSignupData });
      const res = createMockResponse();

      // Mock email functions are already mocked in setup.ts
      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      // Verify that email verification functions were called
      const { generateVerificationToken, sendVerificationEmail } = require('../../../auth/email');
      expect(generateVerificationToken).toHaveBeenCalledWith(validSignupData.email);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        validSignupData.email,
        'mock-verification-token'
      );
    });
  });

  describe('Password Security', () => {
    it('should hash passwords with bcrypt', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 4);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[aby]\$04\$.{53}$/);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await bcrypt.hash(password, 4);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should use consistent salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, 4);
      const hash2 = await bcrypt.hash(password, 4);

      // Hashes should be different (due to random salt)
      expect(hash1).not.toBe(hash2);

      // But both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });
});
