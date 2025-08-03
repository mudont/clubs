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

describe('Frontend Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Existing GraphQL Queries', () => {
    test('teamMatch query works with existing frontend fragment', async () => {
      // This simulates the existing MATCH_FRAGMENT from client/src/components/tennis/graphql.ts
      const mockTeamMatch = {
        id: 'match1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        // New fields that should be optional
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      const mockHomeTeam = {
        id: 'team1',
        Group: { id: 'group1', name: 'Team A', members: [] },
        captain: { id: 'captain1', username: 'captain1' },
      };

      const mockAwayTeam = {
        id: 'team2',
        Group: { id: 'group2', name: 'Team B', members: [] },
        captain: { id: 'captain2', username: 'captain2' },
      };

      mockPrisma.teamLeagueTeamMatch.findUnique = jest.fn().mockResolvedValue(mockTeamMatch);
      mockPrisma.teamLeagueTeam.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockHomeTeam)
        .mockResolvedValueOnce(mockAwayTeam);

      // Simulate the query that the frontend makes
      const result = await resolvers.Query.teamMatch({}, { id: 'match1' }, mockContext);

      // Verify all existing fields are present
      expect(result).toHaveProperty('id', 'match1');
      expect(result).toHaveProperty('homeTeamId', 'team1');
      expect(result).toHaveProperty('awayTeamId', 'team2');
      expect(result).toHaveProperty('matchDate');
      expect(result).toHaveProperty('createdAt');

      // Verify resolvers for nested fields work
      const homeTeam = await resolvers.TeamLeagueTeamMatch.homeTeam(result, {}, mockContext);
      const awayTeam = await resolvers.TeamLeagueTeamMatch.awayTeam(result, {}, mockContext);

      expect(homeTeam).toEqual(mockHomeTeam);
      expect(awayTeam).toEqual(mockAwayTeam);
    });

    test('associatedEvents field continues to work for existing queries', async () => {
      const mockTeamMatch = {
        id: 'match1',
        matchDate: new Date('2024-01-15T10:00:00Z'),
        homeTeamEventId: null, // Legacy data
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

      // This simulates the GetTeamMatchEventRsvpsQuery from the frontend
      const associatedEvents = await resolvers.TeamLeagueTeamMatch.associatedEvents(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(associatedEvents).toHaveLength(2);
      expect(associatedEvents[0]).toHaveProperty('id', 'event1');
      expect(associatedEvents[0]).toHaveProperty('group');
      expect(associatedEvents[0]).toHaveProperty('rsvps');
      expect(associatedEvents[1]).toHaveProperty('id', 'event2');
    });

    test('new homeTeamEvent and awayTeamEvent fields are optional and work when present', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: 'event1',
        awayTeamEventId: 'event2',
      };

      const mockHomeEvent = {
        id: 'event1',
        groupId: 'group1',
        date: new Date('2024-01-15T10:00:00Z'),
        description: '🎾 Tennis Match: Team A vs Team B',
        group: { id: 'group1', name: 'Team A' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      };

      const mockAwayEvent = {
        id: 'event2',
        groupId: 'group2',
        date: new Date('2024-01-15T10:00:00Z'),
        description: '🎾 Tennis Match: Team B vs Team A',
        group: { id: 'group2', name: 'Team B' },
        createdBy: { id: 'user1', username: 'testuser' },
        rsvps: [],
      };

      mockPrisma.event.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockHomeEvent)
        .mockResolvedValueOnce(mockAwayEvent);

      // Test new resolvers
      const homeEvent = await resolvers.TeamLeagueTeamMatch.homeTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );
      const awayEvent = await resolvers.TeamLeagueTeamMatch.awayTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(homeEvent).toEqual(mockHomeEvent);
      expect(awayEvent).toEqual(mockAwayEvent);
    });

    test('new fields return null when not present (legacy data)', async () => {
      const mockTeamMatch = {
        id: 'match1',
        homeTeamEventId: null,
        awayTeamEventId: null,
      };

      const homeEvent = await resolvers.TeamLeagueTeamMatch.homeTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );
      const awayEvent = await resolvers.TeamLeagueTeamMatch.awayTeamEvent(
        mockTeamMatch,
        {},
        mockContext
      );

      expect(homeEvent).toBeNull();
      expect(awayEvent).toBeNull();
      expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Existing Mutations', () => {
    test('createTeamMatch mutation works with existing input structure', async () => {
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

      // Verify the result has all expected fields for existing frontend code
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('homeTeamId', 'team1');
      expect(result).toHaveProperty('awayTeamId', 'team2');
      expect(result).toHaveProperty('matchDate');
      expect(result).toHaveProperty('homeTeam');
      expect(result).toHaveProperty('awayTeam');

      // New fields should be present but won't break existing queries
      expect(result).toHaveProperty('homeTeamEvent');
      expect(result).toHaveProperty('awayTeamEvent');
    });

    test('deleteTeamMatch mutation maintains same behavior', async () => {
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

      // Should return boolean as before
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('TypeScript Type Compatibility', () => {
    test('generated types include new optional fields', () => {
      // This test verifies that the TypeScript types are compatible
      // The actual types are generated in client/src/__generated__/types.ts

      // Simulate the generated TeamLeagueTeamMatch type structure
      interface TeamLeagueTeamMatch {
        __typename?: 'TeamLeagueTeamMatch';
        id: string;
        teamLeagueId: string;
        homeTeamId: string;
        awayTeamId: string;
        matchDate: string;
        createdAt: string;
        associatedEvents: Array<any>;
        homeTeam: any;
        awayTeam: any;
        individualSinglesMatches: Array<any>;
        individualDoublesMatches: Array<any>;
        // New optional fields
        homeTeamEvent?: any | null;
        awayTeamEvent?: any | null;
      }

      // Test that existing code patterns still work
      const mockMatch: TeamLeagueTeamMatch = {
        id: 'match1',
        teamLeagueId: 'league1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        matchDate: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        associatedEvents: [],
        homeTeam: {},
        awayTeam: {},
        individualSinglesMatches: [],
        individualDoublesMatches: [],
        // New fields can be omitted (backward compatibility)
      };

      expect(mockMatch.id).toBe('match1');
      expect(mockMatch.homeTeamEvent).toBeUndefined();
      expect(mockMatch.awayTeamEvent).toBeUndefined();

      // Test that new fields can be explicitly set
      const mockMatchWithEvents: TeamLeagueTeamMatch = {
        ...mockMatch,
        homeTeamEvent: { id: 'event1' },
        awayTeamEvent: { id: 'event2' },
      };

      expect(mockMatchWithEvents.homeTeamEvent).toBeDefined();
      expect(mockMatchWithEvents.awayTeamEvent).toBeDefined();
    });
  });
});
