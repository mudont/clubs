import { Group, Membership, PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';

import { generateToken } from '../../auth/jwt';
import { Context } from '../../types/context';

export const prisma = new PrismaClient();

// Test data factories
export const createTestUser = async (overrides: Partial<User> = {}): Promise<User> => {
  const defaultUser = {
    username: `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
    emailVerified: true,
    passwordHash: await bcrypt.hash('TestPassword123!', 4),
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  };

  return prisma.user.create({
    data: defaultUser,
  });
};

export const createTestGroup = async (overrides: Partial<Group> = {}): Promise<Group> => {
  const defaultGroup = {
    name: `Test Group ${Date.now()}`,
    description: 'A test group',
    isPublic: false,
    ...overrides,
  };

  return prisma.group.create({
    data: defaultGroup,
  });
};

export const createTestMembership = async (
  userId: string,
  groupId: string,
  overrides: Partial<Membership> = {}
): Promise<Membership> => {
  const memberCount = await prisma.membership.count({
    where: { groupId },
  });

  const defaultMembership = {
    userId,
    groupId,
    isAdmin: false,
    memberId: memberCount + 1,
    ...overrides,
  };

  return prisma.membership.create({
    data: defaultMembership,
  });
};

export const createTestContext = async (user?: User): Promise<Context> => {
  return {
    user: user || null,
    prisma,
    pubsub: new PubSub(),
  };
};

export const createAuthenticatedContext = async (
  userOverrides: Partial<User> = {}
): Promise<Context> => {
  const user = await createTestUser(userOverrides);
  return createTestContext(user);
};

export const generateTestToken = (user: User): string => {
  return generateToken(user);
};

// Test data cleanup
export const cleanupTestData = async (): Promise<void> => {
  // Clean up in reverse dependency order
  await prisma.rSVP.deleteMany();
  await prisma.message.deleteMany();
  await prisma.event.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.authAccount.deleteMany();
  await prisma.teamLeagueIndividualSinglesMatch.deleteMany();
  await prisma.teamLeagueIndividualDoublesMatch.deleteMany();
  await prisma.teamMatchLineupSlot.deleteMany();
  await prisma.teamMatchLineup.deleteMany();
  await prisma.teamLeagueTeamMatch.deleteMany();
  await prisma.teamLeagueTeam.deleteMany();
  await prisma.teamLeaguePointSystem.deleteMany();
  await prisma.teamLeague.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupSettings.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
};

// Mock GraphQL info object
export const mockGraphQLInfo = {
  fieldName: 'test',
  fieldNodes: [],
  returnType: {} as any,
  parentType: {} as any,
  path: { key: 'test', typename: 'Test' },
  schema: {} as any,
  fragments: {},
  rootValue: {},
  operation: {} as any,
  variableValues: {},
  cacheControl: {} as any,
};

// Helper to create test tennis league with teams
export const createTestTennisLeague = async () => {
  const league = await prisma.teamLeague.create({
    data: {
      name: 'Test Tennis League',
      description: 'A test tennis league',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  });

  // Create point systems
  await prisma.teamLeaguePointSystem.createMany({
    data: [
      {
        teamLeagueId: league.id,
        matchType: 'SINGLES',
        order: 1,
        winPoints: 3,
        lossPoints: 0,
        drawPoints: 1,
        defaultWinPoints: 3,
        defaultLossPoints: 0,
        defaultDrawPoints: 1,
      },
      {
        teamLeagueId: league.id,
        matchType: 'DOUBLES',
        order: 1,
        winPoints: 3,
        lossPoints: 0,
        drawPoints: 1,
        defaultWinPoints: 3,
        defaultLossPoints: 0,
        defaultDrawPoints: 1,
      },
    ],
  });

  return league;
};

// Helper to create test team
export const createTestTeam = async (leagueId: string, groupId: string, captainId: string) => {
  return prisma.teamLeagueTeam.create({
    data: {
      teamLeagueId: leagueId,
      groupId,
      captainId,
    },
  });
};

// Helper to create test expense
export const createTestExpense = async (groupId: string, paidBy: string, amount: number = 100) => {
  return prisma.expense.create({
    data: {
      groupId,
      paidBy,
      description: 'Test expense',
      amount,
      currency: 'USD',
      category: 'Test',
      date: new Date(),
      splitType: 'EQUAL',
    },
  });
};

// Helper to wait for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to assert error messages
export const expectGraphQLError = (error: any, message: string) => {
  expect(error).toBeDefined();
  expect(error.message).toContain(message);
};

// Helper to create mock request/response objects
export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};
