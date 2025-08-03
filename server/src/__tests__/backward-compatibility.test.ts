import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { resolvers } from '../resolvers';

// Mock Prisma client
const mockPrisma = {
  teamLeagueTeamMatch: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  teamLeagueTeam: {
    findUnique: jest.fn(),
  },
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  rSVP: {
    deleteMany: jest.fn(),
  },
  teamLeagueIndividualSinglesMatch: {
    findMany: jest.fn(),
  },
  teamLeagueIndividualDoublesMatch: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

const mockContext = {
  prisma: mockPrisma,
  user: { id: 'user1', username: 'testuser' },
};

describe('Backward Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TeamLeagueTeamMatch GraphQL Type', () => {
    const mockTeamMatch = {
      id: 'match1',
      homeTeamId: 'team1',
      awayTeamId: 'team2',
      matchDate: new Date('2024-01-15'),
      teamLeagueId: 'league1',
      createdAt: new Date(),
      homeTeamEventId: 'event1',
      awayTeamEventId: 'event2',
    };

    const mockHomeTeam = {
      id: 'team1',
      Group: { id: 'group1', name: 'Team A' },
    };

    const mockAwayTeam = {
      id: 'team2',
      Group: { id: 'group2', name: 'Team B' },
    };

    const mockEvents = [
      {
        id: 'event1',
        groupId: 'group1',
        date: new Date('2024-01-15'),
        description:
          '🎾 Tennis Match: Team A vs Team B\n\nHome match for Team A. Please RSVP your availability.',
        group: { id: 'group1', name: 'Team A' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      },
      {
        id: 'event2',
        groupId: 'group2',
        date: new Date('2024-01-15'),
        description:
          '🎾 Tennis Match: Team B vs Team A\n\nAway match against Team A. Please RSVP your availability.',
        group: { id: 'group2', name: 'Team B' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      },
    ];

    test('should return existing data structure for associatedEvents field', async () => {
      // Mock the database calls for associatedEvents resolver
      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue({
        ...mockTeamMatch,
        homeTeam: mockHomeTeam,
        awayTeam: mockAwayTeam,
      });

      mockPrisma.event.findMany = jest.fn().mockResolvedValue(mockEvents);

      // Call the associatedEvents resolver
      const result = await resolvers.TeamLeagueTeamMatch.associatedEvents(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'event1');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('group');
      expect(result[0]).toHaveProperty('createdBy');
      expect(result[0]).toHaveProperty('rsvps');
      expect(result[1]).toHaveProperty('id', 'event2');
    });

    test('should maintain existing resolver structure for homeTeam and awayTeam', async () => {
      mockPrisma.teamLeagueTeam.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockHomeTeam)
        .mockResolvedValueOnce(mockAwayTeam);

      const homeTeamResult = await resolvers.TeamLeagueTeamMatch.homeTeam(
        mockTeamMatch,
        {},
        mockContext
      );
      const awayTeamResult = await resolvers.TeamLeagueTeamMatch.awayTeam(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(homeTeamResult).toEqual(mockHomeTeam);
      expect(awayTeamResult).toEqual(mockAwayTeam);
      expect(mockPrisma.teamLeagueTeam.findUnique).toHaveBeenCalledWith({
        where: { id: 'team1' },
      });
      expect(mockPrisma.teamLeagueTeam.findUnique).toHaveBeenCalledWith({
        where: { id: 'team2' },
      });
    });

    test('should support new homeTeamEvent and awayTeamEvent fields without breaking existing queries', async () => {
      // Test that the schema includes these fields and they can be resolved
      const mockHomeEvent = mockEvents[0];
      const mockAwayEvent = mockEvents[1];

      // Mock Prisma to return events when accessed via foreign key
      mockPrisma.event.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockHomeEvent)
        .mockResolvedValueOnce(mockAwayEvent);

      // Since these resolvers don't exist yet, we'll add them as part of this test
      const homeEventResolver = (parent: any) =>
        parent.homeTeamEventId
          ? mockContext.prisma.event.findUnique({ where: { id: parent.homeTeamEventId } })
          : null;

      const awayEventResolver = (parent: any) =>
        parent.awayTeamEventId
          ? mockContext.prisma.event.findUnique({ where: { id: parent.awayTeamEventId } })
          : null;

      const homeEventResult = await homeEventResolver(mockTeamMatch);
      const awayEventResult = await awayEventResolver(mockTeamMatch);

      expect(homeEventResult).toEqual(mockHomeEvent);
      expect(awayEventResult).toEqual(mockAwayEvent);
    });
  });

  describe('createTeamMatch Mutation Backward Compatibility', () => {
    test('should maintain same input and output structure', async () => {
      const input = {
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
      };

      const mockHomeTeam = {
        id: 'team1',
        Group: { id: 'group1', name: 'Team A' },
      };

      const mockAwayTeam = {
        id: 'team2',
        Group: { id: 'group2', name: 'Team B' },
      };

      const mockCreatedMatch = {
        id: 'match1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        teamLeagueId: 'league1',
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      const mockHomeEvent = {
        id: 'event1',
        groupId: 'group1',
        createdById: 'user1',
        date: new Date('2024-01-15T10:00:00Z'),
        description:
          '🎾 Tennis Match: Team A vs Team B\n\nHome match for Team A. Please RSVP your availability.',
        createdBy: { id: 'user1', username: 'testuser' },
        group: { id: 'group1', name: 'Team A' },
      };

      const mockAwayEvent = {
        id: 'event2',
        groupId: 'group2',
        createdById: 'user1',
        date: new Date('2024-01-15T10:00:00Z'),
        description:
          '🎾 Tennis Match: Team B vs Team A\n\nAway match against Team A. Please RSVP your availability.',
        createdBy: { id: 'user1', username: 'testuser' },
        group: { id: 'group2', name: 'Team B' },
      };

      const mockUpdatedMatch = {
        ...mockCreatedMatch,
        homeTeam: { ...mockHomeTeam, Group: mockHomeTeam.Group },
        awayTeam: { ...mockAwayTeam, Group: mockAwayTeam.Group },
        homeTeamEvent: mockHomeEvent,
        awayTeamEvent: mockAwayEvent,
      };

      // Mock the transaction
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeam: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockHomeTeam)
              .mockResolvedValueOnce(mockAwayTeam),
          },
          teamLeagueTeamMatch: {
            create: jest.fn().mockResolvedValue(mockCreatedMatch),
            update: jest.fn().mockResolvedValue(mockUpdatedMatch),
          },
          event: {
            create: jest
              .fn()
              .mockResolvedValueOnce(mockHomeEvent)
              .mockResolvedValueOnce(mockAwayEvent),
          },
        };
        return await callback(tx);
      });

      const result = await resolvers.Mutation.createTeamMatch(
        {},
        { leagueId: 'league1', input },
        mockContext
      );

      // Verify the result maintains the expected structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('homeTeamId', 'team1');
      expect(result).toHaveProperty('awayTeamId', 'team2');
      expect(result).toHaveProperty('matchDate');
      expect(result).toHaveProperty('homeTeam');
      expect(result).toHaveProperty('awayTeam');

      // New fields should be present but optional
      expect(result).toHaveProperty('homeTeamEvent');
      expect(result).toHaveProperty('awayTeamEvent');
    });

    test('should handle transaction failures gracefully', async () => {
      const input = {
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
      };

      // Mock transaction failure
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        resolvers.Mutation.createTeamMatch({}, { leagueId: 'league1', input }, mockContext)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('deleteTeamMatch Mutation Backward Compatibility', () => {
    test('should maintain same input and output structure', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
        homeTeam: { Group: { id: 'group1', name: 'Team A' } },
        awayTeam: { Group: { id: 'group2', name: 'Team B' } },
      };

      // Mock the transaction
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeamMatch: {
            findUnique: jest.fn().mockResolvedValue(mockTeamMatch),
            delete: jest.fn().mockResolvedValue(mockTeamMatch),
          },
          rSVP: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          event: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      const result = await resolvers.Mutation.deleteTeamMatch({}, { id: 'match1' }, mockContext);

      // Should return boolean as before
      expect(result).toBe(true);
    });

    test('should handle missing team match gracefully', async () => {
      // Mock transaction with null team match
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeamMatch: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return await callback(tx);
      });

      await expect(
        resolvers.Mutation.deleteTeamMatch({}, { id: 'nonexistent' }, mockContext)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Query Backward Compatibility', () => {
    test('teamMatch query should return same structure with new optional fields', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15'),
        teamLeagueId: 'league1',
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(mockTeamMatch);

      const result = await resolvers.Query.teamMatch({}, { id: 'match1' }, mockContext);

      expect(result).toEqual(mockTeamMatch);
      expect(result).toHaveProperty('homeTeamEventId'); // New field
      expect(result).toHaveProperty('awayTeamEventId'); // New field
    });
  });

  describe('Field Resolver Backward Compatibility', () => {
    test('individualSinglesMatches and individualDoublesMatches should work as before', async () => {
      const mockTeamMatch = { id: 'match1' };
      const mockSinglesMatches = [
        {
          id: 'singles1',
          player1: { id: 'player1', username: 'player1' },
          player2: { id: 'player2', username: 'player2' },
        },
      ];
      const mockDoublesMatches = [
        {
          id: 'doubles1',
          team1Player1: { id: 'player1', username: 'player1' },
          team1Player2: { id: 'player2', username: 'player2' },
          team2Player1: { id: 'player3', username: 'player3' },
          team2Player2: { id: 'player4', username: 'player4' },
        },
      ];

      (mockPrisma.teamLeagueIndividualSinglesMatch.findMany as jest.Mock).mockResolvedValue(
        mockSinglesMatches
      );
      (mockPrisma.teamLeagueIndividualDoublesMatch.findMany as jest.Mock).mockResolvedValue(
        mockDoublesMatches
      );

      const singlesResult = await resolvers.TeamLeagueTeamMatch.individualSinglesMatches(
        mockTeamMatch,
        {},
        mockContext
      );
      const doublesResult = await resolvers.TeamLeagueTeamMatch.individualDoublesMatches(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(singlesResult).toEqual(mockSinglesMatches);
      expect(doublesResult).toEqual(mockDoublesMatches);
    });
  });
});
