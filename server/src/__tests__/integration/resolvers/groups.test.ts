import { GraphQLError } from 'graphql';
import {
  createAuthenticatedContext,
  createTestContext,
  createTestGroup,
  createTestMembership,
  createTestUser,
  mockGraphQLInfo,
} from '../../helpers/test-utils';
import { prisma } from '../../setup';

const resolvers = require('../../../resolvers');

describe('Group Resolvers', () => {
  describe('Mutation.createGroup', () => {
    it('should create a new group successfully', async () => {
      const testUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const groupInput = {
        name: 'Test Group',
        description: 'A test group',
        isPublic: true,
      };

      const result = await resolvers.Mutation.createGroup(
        null,
        { input: groupInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(groupInput.name);
      expect(result.description).toBe(groupInput.description);
      expect(result.isPublic).toBe(groupInput.isPublic);

      // Verify group was created in database
      const group = await prisma.group.findUnique({
        where: { id: result.id },
        include: { memberships: true },
      });

      expect(group).toBeTruthy();
      expect(group?.memberships).toHaveLength(1);
      expect(group?.memberships[0].userId).toBe(testUser.id);
      expect(group?.memberships[0].isAdmin).toBe(true);
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.createGroup(
          null,
          { input: { name: 'Test Group' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate required fields', async () => {
      const testUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.createGroup(null, { input: { name: '' } }, context, mockGraphQLInfo)
      ).rejects.toThrow();
    });

    it('should create group with default values', async () => {
      const testUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.createGroup(
        null,
        { input: { name: 'Minimal Group' } },
        context,
        mockGraphQLInfo
      );

      expect(result.isPublic).toBe(false); // Default value
      expect(result.description).toBeNull();
    });
  });

  describe('Mutation.updateGroup', () => {
    let testUser: any;
    let testGroup: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGroup = await createTestGroup();
      await createTestMembership(testUser.id, testGroup.id, { isAdmin: true });
    });

    it('should update group successfully by admin', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const updateInput = {
        name: 'Updated Group Name',
        description: 'Updated description',
        isPublic: true,
      };

      const result = await resolvers.Mutation.updateGroup(
        null,
        { id: testGroup.id, input: updateInput },
        context,
        mockGraphQLInfo
      );

      expect(result.name).toBe(updateInput.name);
      expect(result.description).toBe(updateInput.description);
      expect(result.isPublic).toBe(updateInput.isPublic);

      // Verify in database
      const updatedGroup = await prisma.group.findUnique({
        where: { id: testGroup.id },
      });

      expect(updatedGroup?.name).toBe(updateInput.name);
      expect(updatedGroup?.description).toBe(updateInput.description);
      expect(updatedGroup?.isPublic).toBe(updateInput.isPublic);
    });

    it('should reject update by non-admin member', async () => {
      const nonAdminUser = await createTestUser();
      await createTestMembership(nonAdminUser.id, testGroup.id, { isAdmin: false });

      const context = await createAuthenticatedContext({ id: nonAdminUser.id });
      context.user = nonAdminUser;

      await expect(
        resolvers.Mutation.updateGroup(
          null,
          { id: testGroup.id, input: { name: 'Hacked Name' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject update by non-member', async () => {
      const outsideUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: outsideUser.id });
      context.user = outsideUser;

      await expect(
        resolvers.Mutation.updateGroup(
          null,
          { id: testGroup.id, input: { name: 'Hacked Name' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should allow partial updates', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.updateGroup(
        null,
        { id: testGroup.id, input: { name: 'Only Name Updated' } },
        context,
        mockGraphQLInfo
      );

      expect(result.name).toBe('Only Name Updated');
      expect(result.description).toBe(testGroup.description); // Should remain unchanged
    });
  });

  describe('Mutation.joinGroup', () => {
    let testUser: any;
    let publicGroup: any;
    let privateGroup: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      publicGroup = await createTestGroup({ isPublic: true });
      privateGroup = await createTestGroup({ isPublic: false });
    });

    it('should allow joining public group', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.joinGroup(
        null,
        { groupId: publicGroup.id },
        context,
        mockGraphQLInfo
      );

      expect(result.id).toBe(publicGroup.id);

      // Verify membership was created
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: testUser.id,
            groupId: publicGroup.id,
          },
        },
      });

      expect(membership).toBeTruthy();
      expect(membership?.isAdmin).toBe(false);
    });

    it('should reject joining private group', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.joinGroup(null, { groupId: privateGroup.id }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject joining group if already a member', async () => {
      await createTestMembership(testUser.id, publicGroup.id);

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.joinGroup(null, { groupId: publicGroup.id }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should reject joining non-existent group', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.joinGroup(null, { groupId: 'non-existent-id' }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should assign correct member ID', async () => {
      // Create some existing members
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      await createTestMembership(user1.id, publicGroup.id);
      await createTestMembership(user2.id, publicGroup.id);

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await resolvers.Mutation.joinGroup(
        null,
        { groupId: publicGroup.id },
        context,
        mockGraphQLInfo
      );

      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: testUser.id,
            groupId: publicGroup.id,
          },
        },
      });

      expect(membership?.memberId).toBe(3); // Should be the 3rd member
    });
  });

  describe('Mutation.leaveGroup', () => {
    let testUser: any;
    let testGroup: any;
    let adminUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      adminUser = await createTestUser();
      testGroup = await createTestGroup();
      await createTestMembership(adminUser.id, testGroup.id, { isAdmin: true });
      await createTestMembership(testUser.id, testGroup.id, { isAdmin: false });
    });

    it('should allow regular member to leave group', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.leaveGroup(
        null,
        { groupId: testGroup.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toBe(true);

      // Verify membership was removed
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: testUser.id,
            groupId: testGroup.id,
          },
        },
      });

      expect(membership).toBeNull();
    });

    it('should prevent last admin from leaving group', async () => {
      const context = await createAuthenticatedContext({ id: adminUser.id });
      context.user = adminUser;

      await expect(
        resolvers.Mutation.leaveGroup(null, { groupId: testGroup.id }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should allow admin to leave if other admins exist', async () => {
      const anotherAdmin = await createTestUser();
      await createTestMembership(anotherAdmin.id, testGroup.id, { isAdmin: true });

      const context = await createAuthenticatedContext({ id: adminUser.id });
      context.user = adminUser;

      const result = await resolvers.Mutation.leaveGroup(
        null,
        { groupId: testGroup.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toBe(true);
    });

    it('should reject leaving group if not a member', async () => {
      const outsideUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: outsideUser.id });
      context.user = outsideUser;

      await expect(
        resolvers.Mutation.leaveGroup(null, { groupId: testGroup.id }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Query.groups', () => {
    it('should return all groups', async () => {
      const group1 = await createTestGroup({ name: 'Group 1' });
      const group2 = await createTestGroup({ name: 'Group 2' });

      const context = await createTestContext();

      const result = await resolvers.Query.groups(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(2);
      expect(result.map((g: any) => g.name)).toContain('Group 1');
      expect(result.map((g: any) => g.name)).toContain('Group 2');
    });
  });

  describe('Query.publicGroups', () => {
    beforeEach(async () => {
      await createTestGroup({ name: 'Public Group 1', isPublic: true });
      await createTestGroup({ name: 'Public Group 2', isPublic: true });
      await createTestGroup({ name: 'Private Group', isPublic: false });
    });

    it('should return only public groups', async () => {
      const testUser = await createTestUser();
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.publicGroups(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(2);
      expect(result.every((g: any) => g.isPublic)).toBe(true);
    });

    it('should filter by search query', async () => {
      const context = await createAuthenticatedContext();

      const result = await resolvers.Query.publicGroups(
        null,
        { query: 'Group 1' },
        context,
        mockGraphQLInfo
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Public Group 1');
    });

    it('should search in description', async () => {
      await createTestGroup({
        name: 'Special Group',
        description: 'Contains searchable text',
        isPublic: true,
      });

      const context = await createAuthenticatedContext();

      const result = await resolvers.Query.publicGroups(
        null,
        { query: 'searchable' },
        context,
        mockGraphQLInfo
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Special Group');
    });
  });

  describe('Query.myGroups', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it("should return user's groups", async () => {
      const group1 = await createTestGroup({ name: 'My Group 1' });
      const group2 = await createTestGroup({ name: 'My Group 2' });
      const otherGroup = await createTestGroup({ name: 'Other Group' });

      await createTestMembership(testUser.id, group1.id);
      await createTestMembership(testUser.id, group2.id);

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.myGroups(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(2);
      expect(result.map((g: any) => g.name)).toContain('My Group 1');
      expect(result.map((g: any) => g.name)).toContain('My Group 2');
      expect(result.map((g: any) => g.name)).not.toContain('Other Group');
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(resolvers.Query.myGroups(null, {}, context, mockGraphQLInfo)).rejects.toThrow(
        GraphQLError
      );
    });
  });

  describe('Group field resolvers', () => {
    let testGroup: any;
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGroup = await createTestGroup();
      await createTestMembership(testUser.id, testGroup.id);
    });

    it('should resolve members field', async () => {
      const context = await createTestContext();

      const result = await resolvers.Group.members(testGroup, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testUser.id);
    });

    it('should resolve memberships field', async () => {
      const context = await createTestContext();

      const result = await resolvers.Group.memberships(testGroup, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testUser.id);
    });
  });
});
