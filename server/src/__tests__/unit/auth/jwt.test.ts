import jwt from 'jsonwebtoken';
import { generateToken, getUserFromToken, verifyToken } from '../../../auth/jwt';
import { createTestUser } from '../../helpers/test-utils';
import { prisma } from '../../setup';

describe('JWT Authentication', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify the token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.username).toBe(user.username);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should include correct user information in token', async () => {
      const user = await createTestUser({
        username: 'testuser123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = generateToken(user);
      const decoded = jwt.decode(token) as any;

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.username).toBe('testuser123');
      expect(decoded.firstName).toBe('John');
      expect(decoded.lastName).toBe('Doe');
    });

    it('should set appropriate expiration time', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const decoded = jwt.decode(token) as any;

      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 7 * 24 * 60 * 60; // 7 days

      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 10); // Allow 10 second tolerance
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.id).toBe(user.id);
      expect(decoded?.email).toBe(user.email);
      expect(decoded?.username).toBe(user.username);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = verifyToken('not.a.valid.jwt.token');
      expect(decoded).toBeNull();
    });

    it('should return null for token with wrong signature', async () => {
      const user = await createTestUser();
      const token = jwt.sign({ id: user.id, email: user.email }, 'wrong-secret', {
        expiresIn: '7d',
      });

      const decoded = verifyToken(token);
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', async () => {
      const user = await createTestUser();
      const expiredToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '0s',
      });

      // Wait a moment to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('getUserFromToken', () => {
    it('should return user for valid token', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const retrievedUser = await getUserFromToken(token);

      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser?.id).toBe(user.id);
      expect(retrievedUser?.email).toBe(user.email);
      expect(retrievedUser?.username).toBe(user.username);
    });

    it('should return null for invalid token', async () => {
      const user = await getUserFromToken('invalid-token');
      expect(user).toBeNull();
    });

    it('should return null if user not found in database', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      // Delete the user from database
      await prisma.user.delete({ where: { id: user.id } });

      const retrievedUser = await getUserFromToken(token);
      expect(retrievedUser).toBeNull();
    });

    it('should return null for expired token', async () => {
      const user = await createTestUser();
      const expiredToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '0s' });

      await new Promise(resolve => setTimeout(resolve, 100));

      const retrievedUser = await getUserFromToken(expiredToken);
      expect(retrievedUser).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      // Mock prisma to throw an error
      const originalFindUnique = prisma.user.findUnique;
      prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

      const retrievedUser = await getUserFromToken(token);
      expect(retrievedUser).toBeNull();

      // Restore original method
      prisma.user.findUnique = originalFindUnique;
    });
  });

  describe('Token Security', () => {
    it('should generate different tokens for same user at different times', async () => {
      const user = await createTestUser();

      const token1 = generateToken(user);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const token2 = generateToken(user);

      expect(token1).not.toBe(token2);

      // Both should be valid
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1?.id).toBe(user.id);
      expect(decoded2?.id).toBe(user.id);
      expect(decoded1?.iat).not.toBe(decoded2?.iat);
    });

    it('should not include sensitive information in token', async () => {
      const user = await createTestUser({
        passwordHash: 'sensitive-hash',
      });

      const token = generateToken(user);
      const decoded = jwt.decode(token) as any;

      expect(decoded.passwordHash).toBeUndefined();
      expect(decoded.password).toBeUndefined();
    });

    it('should handle tokens with missing required fields', () => {
      const invalidToken = jwt.sign(
        { email: 'test@example.com' }, // Missing id
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeTruthy(); // Token is valid but may not work with getUserFromToken
    });
  });
});
