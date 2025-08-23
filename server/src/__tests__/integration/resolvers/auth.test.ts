import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import {
  createAuthenticatedContext,
  createTestContext,
  createTestUser,
  mockGraphQLInfo,
} from '../../helpers/test-utils';
import { prisma } from '../../setup';

// Import resolvers - we'll need to mock the resolvers import
const resolvers = require('../../../resolvers');

describe('Authentication Resolvers', () => {
  describe('Mutation.signup', () => {
    const signupInput = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a new user successfully', async () => {
      const context = await createTestContext();

      const result = await resolvers.Mutation.signup(
        null,
        { input: signupInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(signupInput.email);
      expect(result.user.username).toBe(signupInput.username);
      expect(result.user.firstName).toBe(signupInput.firstName);
      expect(result.user.lastName).toBe(signupInput.lastName);

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: signupInput.email },
      });

      expect(user).toBeTruthy();
      expect(user?.emailVerified).toBe(false);
      expect(user?.passwordHash).toBeTruthy();
    });

    it('should reject signup with existing email', async () => {
      // Create existing user
      await createTestUser({ email: signupInput.email });

      const context = await createTestContext();

      await expect(
        resolvers.Mutation.signup(null, { input: signupInput }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject signup with existing username', async () => {
      // Create existing user with different email
      await createTestUser({
        email: 'different@example.com',
        username: signupInput.username,
      });

      const context = await createTestContext();

      await expect(
        resolvers.Mutation.signup(null, { input: signupInput }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate input data', async () => {
      const context = await createTestContext();

      // Test missing required fields
      const invalidInputs = [
        { ...signupInput, email: '' },
        { ...signupInput, username: '' },
        { ...signupInput, password: '' },
        { ...signupInput, email: 'invalid-email' },
      ];

      for (const invalidInput of invalidInputs) {
        await expect(
          resolvers.Mutation.signup(null, { input: invalidInput }, context, mockGraphQLInfo)
        ).rejects.toThrow();
      }
    });
  });

  describe('Mutation.login', () => {
    let testUser: any;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(password, 4);
      testUser = await createTestUser({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash,
        emailVerified: true,
      });
    });

    it('should login with valid email and password', async () => {
      const context = await createTestContext();

      const result = await resolvers.Mutation.login(
        null,
        {
          input: {
            username: testUser.email,
            password,
          },
        },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(testUser.id);
      expect(result.user.email).toBe(testUser.email);
    });

    it('should login with valid username and password', async () => {
      const context = await createTestContext();

      const result = await resolvers.Mutation.login(
        null,
        {
          input: {
            username: testUser.username,
            password,
          },
        },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(testUser.id);
    });

    it('should reject login with invalid password', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.login(
          null,
          {
            input: {
              username: testUser.email,
              password: 'WrongPassword123!',
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject login with non-existent user', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.login(
          null,
          {
            input: {
              username: 'nonexistent@example.com',
              password,
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject login for unverified email', async () => {
      const unverifiedUser = await createTestUser({
        email: 'unverified@example.com',
        username: 'unverified',
        passwordHash: await bcrypt.hash(password, 4),
        emailVerified: false,
      });

      const context = await createTestContext();

      await expect(
        resolvers.Mutation.login(
          null,
          {
            input: {
              username: unverifiedUser.email,
              password,
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject login for OAuth-only user (no password)', async () => {
      const oauthUser = await createTestUser({
        email: 'oauth@example.com',
        username: 'oauthuser',
        passwordHash: null, // OAuth-only user
        emailVerified: true,
      });

      const context = await createTestContext();

      await expect(
        resolvers.Mutation.login(
          null,
          {
            input: {
              username: oauthUser.email,
              password,
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Mutation.changePassword', () => {
    let testUser: any;
    const currentPassword = 'CurrentPassword123!';
    const newPassword = 'NewPassword123!';

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(currentPassword, 4);
      testUser = await createTestUser({
        passwordHash,
        emailVerified: true,
      });
    });

    it('should change password successfully', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.changePassword(
        null,
        {
          input: {
            currentPassword,
            newPassword,
          },
        },
        context,
        mockGraphQLInfo
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password changed successfully');

      // Verify password was changed in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.passwordHash).not.toBe(testUser.passwordHash);

      // Verify new password works
      const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash!);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject change with incorrect current password', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.changePassword(
          null,
          {
            input: {
              currentPassword: 'WrongPassword123!',
              newPassword,
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should require authentication', async () => {
      const context = await createTestContext(); // No authenticated user

      await expect(
        resolvers.Mutation.changePassword(
          null,
          {
            input: {
              currentPassword,
              newPassword,
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate new password strength', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const weakPasswords = ['weak', '12345678', 'password', 'PASSWORD', 'Password'];

      for (const weakPassword of weakPasswords) {
        await expect(
          resolvers.Mutation.changePassword(
            null,
            {
              input: {
                currentPassword,
                newPassword: weakPassword,
              },
            },
            context,
            mockGraphQLInfo
          )
        ).rejects.toThrow();
      }
    });
  });

  describe('Query.me', () => {
    it('should return current user when authenticated', async () => {
      const testUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.me(null, {}, context, mockGraphQLInfo);

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.username).toBe(testUser.username);
    });

    it('should return null when not authenticated', async () => {
      const context = await createTestContext();

      const result = await resolvers.Query.me(null, {}, context, mockGraphQLInfo);

      expect(result).toBeNull();
    });
  });

  describe('Mutation.updateProfile', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should update user profile successfully', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const updateInput = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
        phone: '+1234567890',
      };

      const result = await resolvers.Mutation.updateProfile(
        null,
        { input: updateInput },
        context,
        mockGraphQLInfo
      );

      expect(result.firstName).toBe(updateInput.firstName);
      expect(result.lastName).toBe(updateInput.lastName);
      expect(result.bio).toBe(updateInput.bio);
      expect(result.phone).toBe(updateInput.phone);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.firstName).toBe(updateInput.firstName);
      expect(updatedUser?.lastName).toBe(updateInput.lastName);
      expect(updatedUser?.bio).toBe(updateInput.bio);
      expect(updatedUser?.phone).toBe(updateInput.phone);
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.updateProfile(
          null,
          { input: { firstName: 'Test' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate username uniqueness when updating', async () => {
      const otherUser = await createTestUser({ username: 'existinguser' });

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.updateProfile(
          null,
          { input: { username: 'existinguser' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should allow partial updates', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.updateProfile(
        null,
        { input: { firstName: 'OnlyFirst' } },
        context,
        mockGraphQLInfo
      );

      expect(result.firstName).toBe('OnlyFirst');
      expect(result.lastName).toBe(testUser.lastName); // Should remain unchanged
    });
  });
});
