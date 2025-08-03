import { PrismaClient } from '@prisma/client';
import { resolvers } from '../resolvers';

// Mock Prisma client
const mockPrisma = {
  $transaction: jest.fn(),
  teamLeagueTeam: {
    findUnique: jest.fn(),
  },
  teamLeagueTeamMatch: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  event: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  rSVP: {
    deleteMany: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock context
const mockContext = {
  prisma: mockPrisma,
  user: { id: 'user-1' },
};

// Mock pubsub
jest.mock('../pubsub', () => ({
  pubsub: {
    publish: jest.fn(),
  },
}));

describe('Team Match Event References', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeamMatch', () => {
    const mockInput = {
      homeTeamId: 'home-team-1',
      awayTeamId: 'away-team-1',
      matchDate: '2024-01-15T10:00:00Z',
    };

    const mockHomeTeam = {
      id: 'home-team-1',
      Group: { id: 'group-1', name: 'Home Team' },
    };

    const mockAwayTeam = {
      id: 'away-team-1',
      Group: { id: 'group-2', name: 'Away Team' },
    };

    it('should create team match with events in a transaction', async () => {
      const mockTeamMatch = {
        id: 'match-1',
        homeTeamId: 'home-team-1',
        awayTeamId: 'away-team-1',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        teamLeagueId: 'league-1',
      };

      const mockHomeEvent = {
        id: 'home-event-1',
        groupId: 'group-1',
        createdById: 'user-1',
        date: new Date('2024-01-15T10:00:00Z'),
        description:
          '🎾 Tennis Match: Home Team vs Away Team\\n\\nHome match for Home Team. Please RSVP your availability.',
        createdBy: { id: 'user-1' },
        group: { id: 'group-1' },
      };

      const mockAwayEvent = {
        id: 'away-event-1',
        groupId: 'group-2',
        createdById: 'user-1',
        date: new Date('2024-01-15T10:00:00Z'),
        description:
          '🎾 Tennis Match: Away Team vs Home Team\\n\\nAway match against Home Team. Please RSVP your availability.',
        createdBy: { id: 'user-1' },
        group: { id: 'group-2' },
      };

      const mockUpdatedTeamMatch = {
        ...mockTeamMatch,
        homeTeamEventId: 'home-event-1',
        awayTeamEventId: 'away-event-1',
        homeTeam: mockHomeTeam,
        awayTeam: mockAwayTeam,
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
            create: jest.fn().mockResolvedValue(mockTeamMatch),
            update: jest.fn().mockResolvedValue(mockUpdatedTeamMatch),
          },
          event: {
            create: jest
              .fn()
              .mockResolvedValueOnce(mockHomeEvent)
              .mockResolvedValueOnce(mockAwayEvent),
          },
        };
        return callback(tx);
      });

      const result = await resolvers.Mutation.createTeamMatch(
        null,
        { leagueId: 'league-1', input: mockInput },
        mockContext
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedTeamMatch);
      expect(result.homeTeamEventId).toBe('home-event-1');
      expect(result.awayTeamEventId).toBe('away-event-1');
    });

    it('should rollback transaction if team not found', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeam: {
            findUnique: jest.fn().mockResolvedValueOnce(mockHomeTeam).mockResolvedValueOnce(null), // Away team not found
          },
        };
        return callback(tx);
      });

      await expect(
        resolvers.Mutation.createTeamMatch(
          null,
          { leagueId: 'league-1', input: mockInput },
          mockContext
        )
      ).rejects.toThrow('One or both teams not found');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should handle transaction failures gracefully', async () => {
      const mockError = new Error('Database connection failed');
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(mockError);

      await expect(
        resolvers.Mutation.createTeamMatch(
          null,
          { leagueId: 'league-1', input: mockInput },
          mockContext
        )
      ).rejects.toThrow('Failed to create team match: Database connection failed');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTeamMatch', () => {
    const matchId = 'match-1';

    it('should delete team match and associated events in a transaction', async () => {
      const mockTeamMatch = {
        id: 'match-1',
        homeTeamEventId: 'home-event-1',
        awayTeamEventId: 'away-event-1',
        homeTeam: { Group: { id: 'group-1', name: 'Home Team' } },
        awayTeam: { Group: { id: 'group-2', name: 'Away Team' } },
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeamMatch: {
            findUnique: jest.fn().mockResolvedValue(mockTeamMatch),
            delete: jest.fn().mockResolvedValue(mockTeamMatch),
          },
          rSVP: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          event: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await resolvers.Mutation.deleteTeamMatch(null, { id: matchId }, mockContext);

      expect(result).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should handle team match not found', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeamMatch: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      await expect(
        resolvers.Mutation.deleteTeamMatch(null, { id: matchId }, mockContext)
      ).rejects.toThrow('Team match not found');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should delete team match even if no events are associated', async () => {
      const mockTeamMatch = {
        id: 'match-1',
        homeTeamEventId: null,
        awayTeamEventId: null,
        homeTeam: { Group: { id: 'group-1', name: 'Home Team' } },
        awayTeam: { Group: { id: 'group-2', name: 'Away Team' } },
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          teamLeagueTeamMatch: {
            findUnique: jest.fn().mockResolvedValue(mockTeamMatch),
            delete: jest.fn().mockResolvedValue(mockTeamMatch),
          },
        };
        return callback(tx);
      });

      const result = await resolvers.Mutation.deleteTeamMatch(null, { id: matchId }, mockContext);

      expect(result).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should handle foreign key constraint errors', async () => {
      const constraintError = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
      };

      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(constraintError);

      await expect(
        resolvers.Mutation.deleteTeamMatch(null, { id: matchId }, mockContext)
      ).rejects.toThrow(
        'Cannot delete team match: it has dependent records that must be removed first'
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should handle record not found errors', async () => {
      const notFoundError = {
        code: 'P2025',
        message: 'Record not found',
      };

      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(notFoundError);

      await expect(
        resolvers.Mutation.deleteTeamMatch(null, { id: matchId }, mockContext)
      ).rejects.toThrow('Team match not found or already deleted');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Migration Script', () => {
  // These tests would require a more complex setup with actual database
  // For now, we'll focus on the resolver tests above
  it('should be tested with integration tests', () => {
    // TODO: Add integration tests for the migration script
    expect(true).toBe(true);
  });
});
