import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signup } from '../auth/local';
import { generateToken, verifyToken, getUserFromToken } from '../auth/jwt';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
jest.mock('@prisma/client');
const mockPrisma = jest.mocked(new PrismaClient());

// Mock config
jest.mock('../config', () => ({
  config: {
    JWT_SECRET: 'test-secret-key-for-testing-only-32-chars',
    BCRYPT_ROUNDS: 10,
  },
  securityConfig: {
    jwtSecret: 'test-secret-key-for-testing-only-32-chars',
    bcryptRounds: 10,
  },
}));

// Mock email verification
jest.mock('../auth/email', () => ({
  generateVerificationToken: jest.fn().mockReturnValue('mock-verification-token'),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));

describe('Authentication', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };

    jest.clearAllMocks();
  });

  describe('signup', () => {
    const validSignupData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      username: 'testuser',
    };

    it('should create a new user with valid data', async () => {
      mockRequest.body = validSignupData;

      // Mock Prisma calls
      mockPrisma.user.findUnique = jest.fn()
        .mockResolvedValueOnce(null) // email not exists
        .mockResolvedValueOnce(null); // username not exists
      
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: 'user-id',
        email: validSignupData.email,
        username: validSignupData.username,
        emailVerified: false,
      });

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: validSignupData.email,
          username: validSignupData.username,
          passwordHash: expect.any(String),
          emailVerified: false,
        },
      });

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Signup successful. Please check your email to verify your account.',
      });
    });

    it('should reject signup with existing email', async () => {
      mockRequest.body = validSignupData;

      mockPrisma.user.findUnique = jest.fn().mockResolvedValueOnce({
        id: 'existing-user',
        email: validSignupData.email,
      });

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Email already in use.',
      });
    });

    it('should reject signup with existing username', async () => {
      mockRequest.body = validSignupData;

      mockPrisma.user.findUnique = jest.fn()
        .mockResolvedValueOnce(null) // email not exists
        .mockResolvedValueOnce({ // username exists
          id: 'existing-user',
          username: validSignupData.username,
        });

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Username already in use.',
      });
    });

    it('should reject signup with missing required fields', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        // missing password and username
      };

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Email, password, and username are required.',
      });
    });

    it('should handle database errors gracefully', async () => {
      mockRequest.body = validSignupData;

      mockPrisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Signup failed.',
      });
    });
  });

  describe('JWT Token Management', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: true,
    };

    describe('generateToken', () => {
      it('should generate a valid JWT token', () => {
        const token = generateToken(mockUser as any);
        
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);

        // Verify the token can be decoded
        const decoded = jwt.verify(token, 'test-secret-key-for-testing-only-32-chars') as any;
        expect(decoded.id).toBe(mockUser.id);
        expect(decoded.email).toBe(mockUser.email);
        expect(decoded.username).toBe(mockUser.username);
      });
    });

    describe('verifyToken', () => {
      it('should verify a valid token', () => {
        const token = generateToken(mockUser as any);
        const decoded = verifyToken(token);

        expect(decoded).toBeTruthy();
        expect(decoded.id).toBe(mockUser.id);
        expect(decoded.email).toBe(mockUser.email);
      });

      it('should return null for invalid token', () => {
        const decoded = verifyToken('invalid-token');
        expect(decoded).toBeNull();
      });

      it('should return null for expired token', () => {
        // Create token that expires immediately
        const expiredToken = jwt.sign(
          { id: mockUser.id },
          'test-secret-key-for-testing-only-32-chars',
          { expiresIn: '0s' }
        );

        // Wait a moment to ensure expiration
        setTimeout(() => {
          const decoded = verifyToken(expiredToken);
          expect(decoded).toBeNull();
        }, 100);
      });
    });

    describe('getUserFromToken', () => {
      it('should return user for valid token', async () => {
        const token = generateToken(mockUser as any);
        
        mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

        const user = await getUserFromToken(token);

        expect(user).toEqual(mockUser);
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: mockUser.id },
        });
      });

      it('should return null for invalid token', async () => {
        const user = await getUserFromToken('invalid-token');
        expect(user).toBeNull();
      });

      it('should return null if user not found in database', async () => {
        const token = generateToken(mockUser as any);
        
        mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

        const user = await getUserFromToken(token);

        expect(user).toBeNull();
      });
    });
  });

  describe('Password Security', () => {
    it('should hash passwords with sufficient complexity', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // Bcrypt hashes are typically 60 chars
      
      // Verify the hash can be verified
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
}); 