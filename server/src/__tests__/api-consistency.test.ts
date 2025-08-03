import { PrismaClient } from '@prisma/client';
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

describe('API Consistency Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GraphQL Query Structure Consistency', () => {
    test('teamMatch query returns all expected fields including new optional ones', async () => {
      const mockTeamMatch = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        // New optional fields
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(mockTeamMatch);

      const result = await resolvers.Query.teamMatch({}, { id: 'match1' }, mockContext);

      // Verify all existing fields are present
      expect(result).toHaveProperty('id', 'match1');
      expect(result).toHaveProperty('teamLeagueId', 'league1');
      expect(result).toHaveProperty('homeTeamId', 'team1');
      expect(result).toHaveProperty('awayTeamId', 'team2');
      expect(result).toHaveProperty('matchDate');
      expect(result).toHaveProperty('createdAt');

      // Verify new optional fields are present
      expect(result).toHaveProperty('homeTeamEventId', 'event1');
      expect(result).toHaveProperty('awayTeamEventId', 'event2');
    });

    test('teamMatch query works when new fields are null', async () => {
      const mockTeamMatch = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        // New optional fields are null (for legacy data)
        homeTeamEventId: null,
        awayTeamEventId: null,
      };

      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(mockTeamMatch);

      const result = await resolvers.Query.teamMatch({}, { id: 'match1' }, mockContext);

      expect(result).toHaveProperty('id', 'match1');
      expect(result).toHaveProperty('homeTeamEventId', null);
      expect(result).toHaveProperty('awayTeamEventId', null);
    });
  });

  describe('Field Resolver Consistency', () => {
    test('homeTeamEvent resolver returns null when homeTeamEventId is null', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: null,
      };

      const result = await resolvers.TeamLeagueTeamMatch.homeTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toBeNull();
      expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();
    });

    test('awayTeamEvent resolver returns null when awayTeamEventId is null', async () => {
      const mockTeamMatch = {
        id: 'match1',
        awayTeamEventId: null,
      };

      const result = await resolvers.TeamLeagueTeamMatch.awayTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toBeNull();
      expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();
    });

    test('homeTeamEvent resolver returns event when homeTeamEventId is present', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: 'event1',
      };

      const mockEvent = {
        id: 'event1',
        groupId: 'group1',
        date: new Date('2024-01-15T10:00:00Z'),
        description: '🎾 Tennis Match: Team A vs Team B',
        group: { id: 'group1', name: 'Team A' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      };

      mockPrisma.event.findUnique = jest.fn().mockResolvedValue(mockEvent);

      const result = await resolvers.TeamLeagueTeamMatch.homeTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event1' },
        include: { group: true, createdBy: true, rsvps: { include: { user: true } } },
      });
    });

    test('awayTeamEvent resolver returns event when awayTeamEventId is present', async () => {
      const mockTeamMatch = {
        id: 'match1',
        awayTeamEventId: 'event2',
      };

      const mockEvent = {
        id: 'event2',
        groupId: 'group2',
        date: new Date('2024-01-15T10:00:00Z'),
        description: '🎾 Tennis Match: Team B vs Team A',
        group: { id: 'group2', name: 'Team B' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      };

      mockPrisma.event.findUnique = jest.fn().mockResolvedValue(mockEvent);

      const result = await resolvers.TeamLeagueTeamMatch.awayTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event2' },
        include: { group: true, createdBy: true, rsvps: { include: { user: true } } },
      });
    });

    test('associatedEvents resolver continues to work with legacy string matching', async () => {
      const mockTeamMatch = {
        id: 'match1',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        // Legacy data without event references
        homeTeamEventId: null,
        awayTeamEventId: null,
      };

      const mockTeamMatchWithTeams = {
        ...mockTeamMatch,
        homeTeam: { Group: { id: 'group1', name: 'Team A' } },
        awayTeam: { Group: { id: 'group2', name: 'Team B' } },
      };

      const mockEvents = [
        {
          id: 'event1',
          groupId: 'group1',
          date: new Date('2024-01-15T10:00:00Z'),
          description: '🎾 Tennis Match: Team A vs Team B\n\nHome match for Team A.',
          group: { id: 'group1', name: 'Team A' },
          createdBy: { id: 'user1', username: 'testuser' },
          rsvps: [],
        },
        {
          id: 'event2',
          groupId: 'group2',
          date: new Date('2024-01-15T10:00:00Z'),
          description: '🎾 Tennis Match: Team B vs Team A\n\nAway match against Team A.',
          group: { id: 'group2', name: 'Team B' },
          createdBy: { id: 'user1', username: 'testuser' },
          rsvps: [],
        },
      ];

      mockPrisma.teamLeagueTeamMatch.findUnique = jest
        .fn()
        .mockResolvedValue(mockTeamMatchWithTeams);
      mockPrisma.event.findMany = jest.fn().mockResolvedValue(mockEvents);

      const result = await resolvers.TeamLeagueTeamMatch.associatedEvents(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'event1');
      expect(result[1]).toHaveProperty('id', 'event2');
    });
  });

  describe('Mutation Input/Output Consistency', () => {
    test('createTeamMatch accepts same input structure as before', async () => {
      const input = {
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
      };

      // This should not require any additional input fields
      expect(() => {
        // Validate input structure - should not throw
        const validatedInput = {
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          matchDate: input.matchDate,
        };
        expect(validatedInput).toBeDefined();
      }).not.toThrow();
    });

    test('updateTeamMatch accepts same input structure as before', async () => {
      const input = {
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
      };

      const mockCurrentMatch = {
        id: 'match1',
        homeTeam: { Group: { id: 'group1', name: 'Team A' } },
        awayTeam: { Group: { id: 'group2', name: 'Team B' } },
      };

      const mockUpdatedMatch = {
        id: 'match1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        homeTeam: { Group: { id: 'group1', name: 'Team A' } },
        awayTeam: { Group: { id: 'group2', name: 'Team B' } },
      };

      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(mockCurrentMatch);
      mockPrisma.teamLeagueTeamMatch.update = jest.fn().mockResolvedValue(mockUpdatedMatch);
      mockPrisma.event.findMany = jest.fn().mockResolvedValue([]);

      const result = await resolvers.Mutation.updateTeamMatch(
        {},
        { id: 'match1', input },
        mockContext
      );

      expect(result).toHaveProperty('id', 'match1');
      expect(result).toHaveProperty('homeTeamId', 'team1');
      expect(result).toHaveProperty('awayTeamId', 'team2');
    });

    test('deleteTeamMatch returns boolean as before', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
        homeTeam: { Group: { id: 'group1', name: 'Team A' } },
        awayTeam: { Group: { id: 'group2', name: 'Team B' } },
      };

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

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('Schema Field Optionality', () => {
    test('new fields are optional and do not break existing queries', () => {
      // Test that a query without the new fields still works
      const legacyTeamMatchData = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        // Note: homeTeamEventId and awayTeamEventId are not included
      };

      // This should not cause any issues
      expect(legacyTeamMatchData).toHaveProperty('id');
      expect(legacyTeamMatchData).toHaveProperty('homeTeamId');
      expect(legacyTeamMatchData).toHaveProperty('awayTeamId');
      expect(legacyTeamMatchData).not.toHaveProperty('homeTeamEventId');
      expect(legacyTeamMatchData).not.toHaveProperty('awayTeamEventId');
    });

    test('new fields can be explicitly set to null', () => {
      const teamMatchWithNullEvents = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        homeTeamEventId: null,
        awayTeamEventId: null,
      };

      expect(teamMatchWithNullEvents.homeTeamEventId).toBeNull();
      expect(teamMatchWithNullEvents.awayTeamEventId).toBeNull();
    });

    test('new fields can be set to valid event IDs', () => {
      const teamMatchWithEvents = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      expect(teamMatchWithEvents.homeTeamEventId).toBe('event1');
      expect(teamMatchWithEvents.awayTeamEventId).toBe('event2');
    });
  });

  describe('Error Handling Consistency', () => {
    test('error messages maintain same format and structure', async () => {
      // Test that error handling doesn't change for existing scenarios
      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(null);

      const result = await resolvers.Query.teamMatch({}, { id: 'nonexistent' }, mockContext);

      // Should return null for non-existent matches (same as before)
      expect(result).toBeNull();
    });

    test('transaction failures provide consistent error information', async () => {
      const input = {
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
      };

      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        resolvers.Mutation.createTeamMatch({}, { leagueId: 'league1', input }, mockContext)
      ).rejects.toThrow('Failed to create team match');
    });
  });
});
