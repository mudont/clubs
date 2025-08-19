import { TeamLeagueTeamMatch } from '../types';
import {
  formatPlayerName,
  getAwayTeamPlayers,
  getFormattedAwayTeamPlayers,
  getFormattedHomeTeamPlayers,
  getHomeTeamPlayers,
  parseScoreString,
  scoreArrayToString,
} from '../utils';

const mockTeamMatch: TeamLeagueTeamMatch = {
  id: 'team-match-1',
  homeTeamId: 'home-team-1',
  awayTeamId: 'away-team-1',
  matchDate: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  homeTeam: {
    id: 'home-team-1',
    group: {
      id: 'home-group-1',
      name: 'Home Team',
      members: [
        {
          id: 'member-1',
          user: {
            id: 'user-1',
            username: 'player1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'member-2',
          user: {
            id: 'user-2',
            username: 'player2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        },
        {
          id: 'member-3',
          user: {
            id: 'user-3',
            username: 'usernameonly',
            firstName: '',
            lastName: '',
            email: 'username@example.com',
          },
        },
      ],
    },
    captainId: 'user-1',
    captain: {
      id: 'user-1',
      username: 'player1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  },
  awayTeam: {
    id: 'away-team-1',
    group: {
      id: 'away-group-1',
      name: 'Away Team',
      members: [
        {
          id: 'member-4',
          user: {
            id: 'user-4',
            username: 'player4',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
          },
        },
        {
          id: 'member-5',
          user: {
            id: 'user-5',
            username: 'player5',
            firstName: 'Alice',
            lastName: '',
            email: 'alice@example.com',
          },
        },
      ],
    },
    captainId: 'user-4',
    captain: {
      id: 'user-4',
      username: 'player4',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
    },
  },
  individualSinglesMatches: [],
  individualDoublesMatches: [],
};

describe('Tennis Utils', () => {
  describe('Score parsing utilities', () => {
    describe('parseScoreString', () => {
      it('parses valid score string', () => {
        expect(parseScoreString('6-4 0-6 7-6')).toEqual([
          [6, 4],
          [0, 6],
          [7, 6],
        ]);
      });

      it('handles empty string', () => {
        expect(parseScoreString('')).toEqual([]);
      });

      it('handles whitespace-only string', () => {
        expect(parseScoreString('   ')).toEqual([]);
      });

      it('parses single set', () => {
        expect(parseScoreString('6-4')).toEqual([[6, 4]]);
      });
    });

    describe('scoreArrayToString', () => {
      it('converts score array to string', () => {
        expect(
          scoreArrayToString([
            [6, 4],
            [0, 6],
            [7, 6],
          ])
        ).toBe('6-4 0-6 7-6');
      });

      it('handles empty array', () => {
        expect(scoreArrayToString([])).toBe('');
      });

      it('handles single set', () => {
        expect(scoreArrayToString([[6, 4]])).toBe('6-4');
      });
    });
  });

  describe('Player filtering utilities', () => {
    describe('formatPlayerName', () => {
      it('formats name with first and last name', () => {
        const user = {
          id: 'user-1',
          username: 'player1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        };
        expect(formatPlayerName(user)).toBe('John Doe');
      });

      it('formats name with only first name', () => {
        const user = {
          id: 'user-1',
          username: 'player1',
          firstName: 'John',
          lastName: '',
          email: 'john@example.com',
        };
        expect(formatPlayerName(user)).toBe('John');
      });

      it('formats name with only last name', () => {
        const user = {
          id: 'user-1',
          username: 'player1',
          firstName: '',
          lastName: 'Doe',
          email: 'john@example.com',
        };
        expect(formatPlayerName(user)).toBe('Doe');
      });

      it('falls back to username when no first/last name', () => {
        const user = {
          id: 'user-1',
          username: 'player1',
          firstName: '',
          lastName: '',
          email: 'john@example.com',
        };
        expect(formatPlayerName(user)).toBe('player1');
      });

      it('falls back to email when no first/last name or username', () => {
        const user = {
          id: 'user-1',
          username: '',
          firstName: '',
          lastName: '',
          email: 'john@example.com',
        };
        expect(formatPlayerName(user)).toBe('john@example.com');
      });
    });

    describe('getHomeTeamPlayers', () => {
      it('extracts home team players', () => {
        const players = getHomeTeamPlayers(mockTeamMatch);
        expect(players).toHaveLength(3);
        expect(players[0].id).toBe('user-1');
        expect(players[1].id).toBe('user-2');
        expect(players[2].id).toBe('user-3');
      });

      it('handles team with no members', () => {
        const teamMatchNoMembers = {
          ...mockTeamMatch,
          homeTeam: {
            ...mockTeamMatch.homeTeam,
            group: {
              ...mockTeamMatch.homeTeam.group,
              members: undefined,
            },
          },
        };
        const players = getHomeTeamPlayers(teamMatchNoMembers);
        expect(players).toEqual([]);
      });
    });

    describe('getAwayTeamPlayers', () => {
      it('extracts away team players', () => {
        const players = getAwayTeamPlayers(mockTeamMatch);
        expect(players).toHaveLength(2);
        expect(players[0].id).toBe('user-4');
        expect(players[1].id).toBe('user-5');
      });

      it('handles team with no members', () => {
        const teamMatchNoMembers = {
          ...mockTeamMatch,
          awayTeam: {
            ...mockTeamMatch.awayTeam,
            group: {
              ...mockTeamMatch.awayTeam.group,
              members: undefined,
            },
          },
        };
        const players = getAwayTeamPlayers(teamMatchNoMembers);
        expect(players).toEqual([]);
      });
    });

    describe('getFormattedHomeTeamPlayers', () => {
      it('returns formatted and sorted home team players', () => {
        const players = getFormattedHomeTeamPlayers(mockTeamMatch);
        expect(players).toHaveLength(3);

        // Should be sorted alphabetically by name
        expect(players[0].name).toBe('Jane Smith');
        expect(players[1].name).toBe('John Doe');
        expect(players[2].name).toBe('usernameonly');

        // Should include original user data
        expect(players[0].id).toBe('user-2');
        expect(players[1].id).toBe('user-1');
        expect(players[2].id).toBe('user-3');
      });
    });

    describe('getFormattedAwayTeamPlayers', () => {
      it('returns formatted and sorted away team players', () => {
        const players = getFormattedAwayTeamPlayers(mockTeamMatch);
        expect(players).toHaveLength(2);

        // Should be sorted alphabetically by name
        expect(players[0].name).toBe('Alice');
        expect(players[1].name).toBe('Bob Johnson');

        // Should include original user data
        expect(players[0].id).toBe('user-5');
        expect(players[1].id).toBe('user-4');
      });
    });
  });
});
