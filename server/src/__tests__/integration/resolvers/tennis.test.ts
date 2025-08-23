import { GraphQLError } from 'graphql';
import {
  createAuthenticatedContext,
  createTestContext,
  createTestGroup,
  createTestMembership,
  createTestTeam,
  createTestTennisLeague,
  createTestUser,
  mockGraphQLInfo,
} from '../../helpers/test-utils';
import { prisma } from '../../setup';

const resolvers = require('../../../resolvers');

describe('Tennis Resolvers', () => {
  describe('Mutation.createTennisLeague', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should create tennis league successfully', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const leagueInput = {
        name: 'Test Tennis League',
        description: 'A test tennis league',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        isActive: true,
      };

      const pointSystems = [
        {
          matchType: 'SINGLES',
          order: 1,
          winPoints: 3,
          lossPoints: 0,
          drawPoints: 1,
        },
        {
          matchType: 'DOUBLES',
          order: 1,
          winPoints: 3,
          lossPoints: 0,
          drawPoints: 1,
        },
      ];

      const result = await resolvers.Mutation.createTennisLeague(
        null,
        { input: leagueInput, pointSystems },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(leagueInput.name);
      expect(result.description).toBe(leagueInput.description);
      expect(result.isActive).toBe(leagueInput.isActive);

      // Verify point systems were created
      const createdPointSystems = await prisma.teamLeaguePointSystem.findMany({
        where: { teamLeagueId: result.id },
      });

      expect(createdPointSystems).toHaveLength(2);
      expect(createdPointSystems.some(ps => ps.matchType === 'SINGLES')).toBe(true);
      expect(createdPointSystems.some(ps => ps.matchType === 'DOUBLES')).toBe(true);
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.createTennisLeague(
          null,
          { input: { name: 'Test League' } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate point system order constraints', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const leagueInput = {
        name: 'Test League',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
      };

      // Invalid point systems - higher order has higher points
      const invalidPointSystems = [
        {
          matchType: 'SINGLES',
          order: 1,
          winPoints: 1, // Lower points
          lossPoints: 0,
          drawPoints: 0,
        },
        {
          matchType: 'SINGLES',
          order: 2,
          winPoints: 3, // Higher points for higher order - invalid
          lossPoints: 0,
          drawPoints: 0,
        },
      ];

      await expect(
        resolvers.Mutation.createTennisLeague(
          null,
          { input: leagueInput, pointSystems: invalidPointSystems },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Mutation.createTennisTeam', () => {
    let testUser: any;
    let testGroup: any;
    let testLeague: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGroup = await createTestGroup();
      testLeague = await createTestTennisLeague();
      await createTestMembership(testUser.id, testGroup.id);
    });

    it('should create tennis team successfully', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const teamInput = {
        groupId: testGroup.id,
        captainId: testUser.id,
      };

      const result = await resolvers.Mutation.createTennisTeam(
        null,
        { leagueId: testLeague.id, input: teamInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.groupId).toBe(testGroup.id);
      expect(result.captainId).toBe(testUser.id);
      expect(result.captain).toBeDefined();
      expect(result.Group).toBeDefined();
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.createTennisTeam(
          null,
          { leagueId: testLeague.id, input: { groupId: testGroup.id, captainId: testUser.id } },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Mutation.createTeamMatch', () => {
    let testUser: any;
    let testGroup1: any;
    let testGroup2: any;
    let testLeague: any;
    let homeTeam: any;
    let awayTeam: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGroup1 = await createTestGroup({ name: 'Home Team Group' });
      testGroup2 = await createTestGroup({ name: 'Away Team Group' });
      testLeague = await createTestTennisLeague();

      await createTestMembership(testUser.id, testGroup1.id);
      await createTestMembership(testUser.id, testGroup2.id);

      homeTeam = await createTestTeam(testLeague.id, testGroup1.id, testUser.id);
      awayTeam = await createTestTeam(testLeague.id, testGroup2.id, testUser.id);
    });

    it('should create team match with events', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const matchInput = {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        matchDate: '2024-06-15T14:00:00.000Z',
      };

      const result = await resolvers.Mutation.createTeamMatch(
        null,
        { leagueId: testLeague.id, input: matchInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.homeTeamId).toBe(homeTeam.id);
      expect(result.awayTeamId).toBe(awayTeam.id);
      expect(result.homeTeamEvent).toBeDefined();
      expect(result.awayTeamEvent).toBeDefined();

      // Verify events were created
      const homeEvent = await prisma.event.findUnique({
        where: { id: result.homeTeamEventId },
      });
      const awayEvent = await prisma.event.findUnique({
        where: { id: result.awayTeamEventId },
      });

      expect(homeEvent).toBeDefined();
      expect(homeEvent?.groupId).toBe(testGroup1.id);
      expect(homeEvent?.description).toContain('Home match');

      expect(awayEvent).toBeDefined();
      expect(awayEvent?.groupId).toBe(testGroup2.id);
      expect(awayEvent?.description).toContain('Away match');
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.createTeamMatch(
          null,
          {
            leagueId: testLeague.id,
            input: {
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              matchDate: '2024-06-15T14:00:00.000Z',
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should validate team existence', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.createTeamMatch(
          null,
          {
            leagueId: testLeague.id,
            input: {
              homeTeamId: 'non-existent-team',
              awayTeamId: awayTeam.id,
              matchDate: '2024-06-15T14:00:00.000Z',
            },
          },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow();
    });
  });

  describe('Mutation.createIndividualSinglesMatch', () => {
    let testUser: any;
    let player1: any;
    let player2: any;
    let testLeague: any;
    let teamMatch: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      player1 = await createTestUser({ username: 'player1', email: 'player1@test.com' });
      player2 = await createTestUser({ username: 'player2', email: 'player2@test.com' });

      const testGroup1 = await createTestGroup();
      const testGroup2 = await createTestGroup();
      testLeague = await createTestTennisLeague();

      const homeTeam = await createTestTeam(testLeague.id, testGroup1.id, testUser.id);
      const awayTeam = await createTestTeam(testLeague.id, testGroup2.id, testUser.id);

      teamMatch = await prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: new Date(),
          teamLeagueId: testLeague.id,
        },
      });
    });

    it('should create individual singles match', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const matchInput = {
        player1Id: player1.id,
        player2Id: player2.id,
        matchDate: '2024-06-15T14:00:00.000Z',
        teamMatchId: teamMatch.id,
        order: 1,
        score: '6-4, 6-2',
        winner: 'HOME',
        resultType: 'NONE',
      };

      const result = await resolvers.Mutation.createIndividualSinglesMatch(
        null,
        { leagueId: testLeague.id, input: matchInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.player1Id).toBe(player1.id);
      expect(result.player2Id).toBe(player2.id);
      expect(result.score).toBe('6-4, 6-2');
      expect(result.winner).toBe('HOME');
      expect(result.order).toBe(1);
    });

    it('should validate tennis score format', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const matchInput = {
        player1Id: player1.id,
        player2Id: player2.id,
        matchDate: '2024-06-15T14:00:00.000Z',
        teamMatchId: teamMatch.id,
        order: 1,
        score: 'invalid-score-format!@#',
        winner: 'HOME',
      };

      await expect(
        resolvers.Mutation.createIndividualSinglesMatch(
          null,
          { leagueId: testLeague.id, input: matchInput },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow('Invalid tennis score format');
    });

    it('should allow empty score', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const matchInput = {
        player1Id: player1.id,
        player2Id: player2.id,
        matchDate: '2024-06-15T14:00:00.000Z',
        teamMatchId: teamMatch.id,
        order: 1,
        score: '',
      };

      const result = await resolvers.Mutation.createIndividualSinglesMatch(
        null,
        { leagueId: testLeague.id, input: matchInput },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.score).toBe('');
    });
  });

  describe('Query.tennisLeagues', () => {
    beforeEach(async () => {
      await createTestTennisLeague();
      await prisma.teamLeague.create({
        data: {
          name: 'Another League',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      });
    });

    it('should return all tennis leagues', async () => {
      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeagues(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(2);
      expect(result.every((league: any) => league.name)).toBe(true);
    });

    it('should handle empty result gracefully', async () => {
      // Clear all leagues
      await prisma.teamLeague.deleteMany();

      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeagues(null, {}, context, mockGraphQLInfo);

      expect(result).toEqual([]);
    });
  });

  describe('Query.tennisLeague', () => {
    let testLeague: any;

    beforeEach(async () => {
      testLeague = await createTestTennisLeague();
    });

    it('should return specific tennis league with relations', async () => {
      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeague(
        null,
        { id: testLeague.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(testLeague.id);
      expect(result.name).toBe(testLeague.name);
    });

    it('should return null for non-existent league', async () => {
      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeague(
        null,
        { id: 'non-existent-id' },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeNull();
    });
  });

  describe('Query.tennisLeagueStandings', () => {
    let testLeague: any;
    let homeTeam: any;
    let awayTeam: any;

    beforeEach(async () => {
      const testUser = await createTestUser();
      const testGroup1 = await createTestGroup({ name: 'Team 1' });
      const testGroup2 = await createTestGroup({ name: 'Team 2' });
      testLeague = await createTestTennisLeague();

      homeTeam = await createTestTeam(testLeague.id, testGroup1.id, testUser.id);
      awayTeam = await createTestTeam(testLeague.id, testGroup2.id, testUser.id);

      // Create a team match
      const teamMatch = await prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: new Date(),
          teamLeagueId: testLeague.id,
        },
      });

      // Create individual matches with results
      await prisma.teamLeagueIndividualSinglesMatch.create({
        data: {
          player1Id: testUser.id,
          player2Id: testUser.id,
          matchDate: new Date(),
          teamMatchId: teamMatch.id,
          order: 1,
          score: '6-4, 6-2',
          winner: 'HOME',
        },
      });
    });

    it('should calculate standings correctly', async () => {
      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeagueStandings(
        null,
        { id: testLeague.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2); // Two teams

      // Check standings structure
      result.forEach((standing: any) => {
        expect(standing.teamId).toBeDefined();
        expect(standing.teamName).toBeDefined();
        expect(typeof standing.points).toBe('number');
        expect(typeof standing.wins).toBe('number');
        expect(typeof standing.losses).toBe('number');
        expect(typeof standing.matchesPlayed).toBe('number');
      });

      // Home team should have points for winning
      const homeTeamStanding = result.find((s: any) => s.teamId === homeTeam.id);
      expect(homeTeamStanding.wins).toBe(1);
      expect(homeTeamStanding.points).toBeGreaterThan(0);
    });

    it('should handle league with no matches', async () => {
      const emptyLeague = await prisma.teamLeague.create({
        data: {
          name: 'Empty League',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      });

      const context = await createTestContext();

      const result = await resolvers.Query.tennisLeagueStandings(
        null,
        { id: emptyLeague.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toEqual([]);
    });
  });

  describe('Query.userTennisLeagues', () => {
    let testUser: any;
    let testGroup: any;
    let testLeague: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGroup = await createTestGroup();
      await createTestMembership(testUser.id, testGroup.id);

      testLeague = await prisma.teamLeague.create({
        data: {
          name: 'User League',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
        },
      });

      await createTestTeam(testLeague.id, testGroup.id, testUser.id);
    });

    it("should return user's active tennis leagues", async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.userTennisLeagues(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testLeague.id);
      expect(result[0].name).toBe('User League');
    });

    it('should not return inactive leagues', async () => {
      // Make league inactive
      await prisma.teamLeague.update({
        where: { id: testLeague.id },
        data: { isActive: false },
      });

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.userTennisLeagues(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(0);
    });

    it('should not return leagues outside date range', async () => {
      // Set league dates in the past
      await prisma.teamLeague.update({
        where: { id: testLeague.id },
        data: {
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-12-31'),
        },
      });

      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Query.userTennisLeagues(null, {}, context, mockGraphQLInfo);

      expect(result).toHaveLength(0);
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Query.userTennisLeagues(null, {}, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Mutation.deleteTeamMatch', () => {
    let testUser: any;
    let teamMatch: any;
    let homeEvent: any;
    let awayEvent: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      const testGroup1 = await createTestGroup();
      const testGroup2 = await createTestGroup();
      const testLeague = await createTestTennisLeague();

      const homeTeam = await createTestTeam(testLeague.id, testGroup1.id, testUser.id);
      const awayTeam = await createTestTeam(testLeague.id, testGroup2.id, testUser.id);

      // Create events
      homeEvent = await prisma.event.create({
        data: {
          groupId: testGroup1.id,
          createdById: testUser.id,
          date: new Date(),
          description: 'Home team event',
        },
      });

      awayEvent = await prisma.event.create({
        data: {
          groupId: testGroup2.id,
          createdById: testUser.id,
          date: new Date(),
          description: 'Away team event',
        },
      });

      // Create team match with event references
      teamMatch = await prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: new Date(),
          teamLeagueId: testLeague.id,
          homeTeamEventId: homeEvent.id,
          awayTeamEventId: awayEvent.id,
        },
      });
    });

    it('should delete team match and associated events', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      const result = await resolvers.Mutation.deleteTeamMatch(
        null,
        { id: teamMatch.id },
        context,
        mockGraphQLInfo
      );

      expect(result).toBe(true);

      // Verify team match was deleted
      const deletedMatch = await prisma.teamLeagueTeamMatch.findUnique({
        where: { id: teamMatch.id },
      });
      expect(deletedMatch).toBeNull();

      // Verify events were deleted
      const deletedHomeEvent = await prisma.event.findUnique({
        where: { id: homeEvent.id },
      });
      const deletedAwayEvent = await prisma.event.findUnique({
        where: { id: awayEvent.id },
      });

      expect(deletedHomeEvent).toBeNull();
      expect(deletedAwayEvent).toBeNull();
    });

    it('should require authentication', async () => {
      const context = await createTestContext();

      await expect(
        resolvers.Mutation.deleteTeamMatch(null, { id: teamMatch.id }, context, mockGraphQLInfo)
      ).rejects.toThrow(GraphQLError);
    });

    it('should handle non-existent team match', async () => {
      const context = await createAuthenticatedContext({ id: testUser.id });
      context.user = testUser;

      await expect(
        resolvers.Mutation.deleteTeamMatch(
          null,
          { id: 'non-existent-id' },
          context,
          mockGraphQLInfo
        )
      ).rejects.toThrow(GraphQLError);
    });
  });
});
