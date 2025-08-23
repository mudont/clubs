/**
 * Comprehensive tests for tennis utility functions
 */

import { createTestUser } from '../../../__tests__/utils/mock-factories';
import {
  formatPlayerName,
  getAwayTeamPlayers,
  getFormattedAwayTeamPlayers,
  getFormattedHomeTeamPlayers,
  getHomeTeamPlayers,
  parseScoreString,
  scoreArrayToString,
} from '../utils';

// Mock data
const mockUsers = [
  createTestUser({
    id: 'user-1',
    username: 'player1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  }),
  createTestUser({
    id: 'user-2',
    username: 'player2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  }),
  createTestUser({
    id: 'user-3',
    username: 'player3',
    firstName: '',
    lastName: '',
    email: 'player3@example.com',
  }),
  createTestUser({
    id: 'user-4',
    username: 'player4',
    email: 'player4@example.com',
  }),
];

const mockTeamMatch = {
  id: 'team-match-1',
  matchDate: '2024-01-15T00:00:00.000Z',
  homeTeam: {
    group: {
      name: 'Home Team',
      members: [{ user: mockUsers[0] }, { user: mockUsers[1] }],
    },
  },
  awayTeam: {
    group: {
      name: 'Away Team',
      members: [{ user: mockUsers[2] }, { user: mockUsers[3] }],
    },
  },
};

describe('Score Parsing Functions', () => {
  describe('parseScoreString', () => {
    describe('Basic Functionality', () => {
      it('parses simple score string correctly', () => {
        const result = parseScoreString('6-4');
        expect(result).toEqual([[6, 4]]);
      });

      it('parses multi-set score string correctly', () => {
        const result = parseScoreString('6-4 3-6 7-5');
        expect(result).toEqual([
          [6, 4],
          [3, 6],
          [7, 5],
        ]);
      });

      it('parses three-set match correctly', () => {
        const result = parseScoreString('6-4 0-6 6-3');
        expect(result).toEqual([
          [6, 4],
          [0, 6],
          [6, 3],
        ]);
      });

      it('handles tiebreak scores', () => {
        const result = parseScoreString('7-6 6-4');
        expect(result).toEqual([
          [7, 6],
          [6, 4],
        ]);
      });
    });

    describe('Edge Cases', () => {
      it('handles empty string', () => {
        const result = parseScoreString('');
        expect(result).toEqual([]);
      });

      it('handles whitespace-only string', () => {
        const result = parseScoreString('   ');
        expect(result).toEqual([]);
      });

      it('handles single number', () => {
        const result = parseScoreString('6');
        expect(result).toEqual([[6, NaN]]);
      });

      it('handles malformed score', () => {
        const result = parseScoreString('6-4-2');
        expect(result).toEqual([[6, 4, 2]]);
      });

      it('handles non-numeric scores', () => {
        const result = parseScoreString('a-b');
        expect(result).toEqual([[NaN, NaN]]);
      });

      it('handles extra whitespace', () => {
        const result = parseScoreString('  6-4   3-6  ');
        expect(result).toEqual([
          [6, 4],
          [3, 6],
        ]);
      });

      it('handles multiple spaces between sets', () => {
        const result = parseScoreString('6-4    3-6');
        expect(result).toEqual([
          [6, 4],
          [3, 6],
        ]);
      });
    });

    describe('Boundary Values', () => {
      it('handles zero scores', () => {
        const result = parseScoreString('0-6 6-0');
        expect(result).toEqual([
          [0, 6],
          [6, 0],
        ]);
      });

      it('handles high scores', () => {
        const result = parseScoreString('15-13 7-6');
        expect(result).toEqual([
          [15, 13],
          [7, 6],
        ]);
      });

      it('handles negative numbers', () => {
        const result = parseScoreString('-1-2');
        expect(result).toEqual([[-1, 2]]);
      });
    });

    describe('Performance', () => {
      it('handles long score strings efficiently', () => {
        const longScore = Array.from({ length: 100 }, () => '6-4').join(' ');

        const startTime = performance.now();
        const result = parseScoreString(longScore);
        const endTime = performance.now();

        expect(result).toHaveLength(100);
        expect(endTime - startTime).toBeLessThan(10); // Should complete quickly
      });
    });
  });

  describe('scoreArrayToString', () => {
    describe('Basic Functionality', () => {
      it('converts simple score array to string', () => {
        const result = scoreArrayToString([[6, 4]]);
        expect(result).toBe('6-4');
      });

      it('converts multi-set score array to string', () => {
        const result = scoreArrayToString([
          [6, 4],
          [3, 6],
          [7, 5],
        ]);
        expect(result).toBe('6-4 3-6 7-5');
      });

      it('handles three-set match', () => {
        const result = scoreArrayToString([
          [6, 4],
          [0, 6],
          [6, 3],
        ]);
        expect(result).toBe('6-4 0-6 6-3');
      });
    });

    describe('Edge Cases', () => {
      it('handles empty array', () => {
        const result = scoreArrayToString([]);
        expect(result).toBe('');
      });

      it('handles single set with multiple scores', () => {
        const result = scoreArrayToString([[6, 4, 2]]);
        expect(result).toBe('6-4-2');
      });

      it('handles zero scores', () => {
        const result = scoreArrayToString([
          [0, 6],
          [6, 0],
        ]);
        expect(result).toBe('0-6 6-0');
      });

      it('handles negative numbers', () => {
        const result = scoreArrayToString([[-1, 2]]);
        expect(result).toBe('-1-2');
      });
    });

    describe('Boundary Values', () => {
      it('handles very high scores', () => {
        const result = scoreArrayToString([[999, 1000]]);
        expect(result).toBe('999-1000');
      });

      it('handles decimal numbers', () => {
        const result = scoreArrayToString([[6.5, 4.5]]);
        expect(result).toBe('6.5-4.5');
      });
    });
  });

  describe('Score Parsing Round Trip', () => {
    it('maintains consistency in round trip conversion', () => {
      const originalScores = ['6-4', '6-4 3-6 7-5', '7-6 6-4', '0-6 6-0 6-3'];

      originalScores.forEach(score => {
        const parsed = parseScoreString(score);
        const converted = scoreArrayToString(parsed);
        expect(converted).toBe(score);
      });
    });

    it('handles edge cases in round trip', () => {
      const edgeCases = ['', '6-4 0-6', '15-13'];

      edgeCases.forEach(score => {
        const parsed = parseScoreString(score);
        const converted = scoreArrayToString(parsed);

        if (score === '') {
          expect(converted).toBe('');
        } else {
          expect(converted).toBe(score);
        }
      });
    });
  });
});

describe('Player Utility Functions', () => {
  describe('formatPlayerName', () => {
    describe('Basic Functionality', () => {
      it('formats name with first and last name', () => {
        const user = mockUsers[0]; // John Doe
        const result = formatPlayerName(user);
        expect(result).toBe('John Doe');
      });

      it('falls back to username when no names', () => {
        const user = mockUsers[3]; // player4 (no first/last name)
        const result = formatPlayerName(user);
        expect(result).toBe('player4');
      });

      it('falls back to email when no username or names', () => {
        const user = {
          ...mockUsers[3],
          username: '',
          firstName: '',
          lastName: '',
        };
        const result = formatPlayerName(user);
        expect(result).toBe('player4@example.com');
      });
    });

    describe('Edge Cases', () => {
      it('handles only first name', () => {
        const user = {
          ...mockUsers[0],
          lastName: '',
        };
        const result = formatPlayerName(user);
        expect(result).toBe('John');
      });

      it('handles only last name', () => {
        const user = {
          ...mockUsers[0],
          firstName: '',
        };
        const result = formatPlayerName(user);
        expect(result).toBe('Doe');
      });

      it('handles empty string names', () => {
        const user = mockUsers[2]; // Empty first/last names
        const result = formatPlayerName(user);
        expect(result).toBe('player3');
      });

      it('handles whitespace-only names', () => {
        const user = {
          ...mockUsers[0],
          firstName: '  ',
          lastName: '  ',
        };
        const result = formatPlayerName(user);
        expect(result).toBe('player1'); // Falls back to username
      });

      it('handles null/undefined names', () => {
        const user = {
          ...mockUsers[0],
          firstName: null,
          lastName: undefined,
        };
        const result = formatPlayerName(user);
        expect(result).toBe('player1');
      });
    });

    describe('Boundary Values', () => {
      it('handles very long names', () => {
        const longName = 'A'.repeat(100);
        const user = {
          ...mockUsers[0],
          firstName: longName,
          lastName: 'Short',
        };
        const result = formatPlayerName(user);
        expect(result).toBe(`${longName} Short`);
      });

      it('handles special characters in names', () => {
        const user = {
          ...mockUsers[0],
          firstName: 'José',
          lastName: "O'Connor",
        };
        const result = formatPlayerName(user);
        expect(result).toBe("José O'Connor");
      });

      it('handles Unicode characters', () => {
        const user = {
          ...mockUsers[0],
          firstName: '中文',
          lastName: '名字',
        };
        const result = formatPlayerName(user);
        expect(result).toBe('中文 名字');
      });
    });
  });

  describe('getHomeTeamPlayers', () => {
    it('extracts home team players correctly', () => {
      const players = getHomeTeamPlayers(mockTeamMatch);

      expect(players).toHaveLength(2);
      expect(players[0].id).toBe('user-1');
      expect(players[1].id).toBe('user-2');
    });

    it('handles empty home team members', () => {
      const emptyTeamMatch = {
        ...mockTeamMatch,
        homeTeam: {
          group: {
            name: 'Empty Team',
            members: [],
          },
        },
      };

      const players = getHomeTeamPlayers(emptyTeamMatch);
      expect(players).toEqual([]);
    });

    it('handles missing members array', () => {
      const noMembersTeamMatch = {
        ...mockTeamMatch,
        homeTeam: {
          group: {
            name: 'No Members Team',
            members: undefined,
          },
        },
      };

      const players = getHomeTeamPlayers(noMembersTeamMatch);
      expect(players).toEqual([]);
    });
  });

  describe('getAwayTeamPlayers', () => {
    it('extracts away team players correctly', () => {
      const players = getAwayTeamPlayers(mockTeamMatch);

      expect(players).toHaveLength(2);
      expect(players[0].id).toBe('user-3');
      expect(players[1].id).toBe('user-4');
    });

    it('handles empty away team members', () => {
      const emptyTeamMatch = {
        ...mockTeamMatch,
        awayTeam: {
          group: {
            name: 'Empty Team',
            members: [],
          },
        },
      };

      const players = getAwayTeamPlayers(emptyTeamMatch);
      expect(players).toEqual([]);
    });
  });

  describe('getFormattedHomeTeamPlayers', () => {
    it('formats and sorts home team players', () => {
      const players = getFormattedHomeTeamPlayers(mockTeamMatch);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('Jane Smith'); // Should be sorted alphabetically
      expect(players[1].name).toBe('John Doe');

      // Should maintain all original user properties
      expect(players[0].id).toBe('user-2');
      expect(players[1].id).toBe('user-1');
    });

    it('handles players with no names', () => {
      const teamMatchWithNoNames = {
        ...mockTeamMatch,
        homeTeam: {
          group: {
            name: 'Home Team',
            members: [
              { user: mockUsers[2] }, // Empty names
              { user: mockUsers[3] }, // No names
            ],
          },
        },
      };

      const players = getFormattedHomeTeamPlayers(teamMatchWithNoNames);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('player3'); // Username fallback
      expect(players[1].name).toBe('player4'); // Username fallback
    });

    it('maintains sorting consistency', () => {
      // Test multiple times to ensure consistent sorting
      for (let i = 0; i < 5; i++) {
        const players = getFormattedHomeTeamPlayers(mockTeamMatch);
        expect(players[0].name).toBe('Jane Smith');
        expect(players[1].name).toBe('John Doe');
      }
    });
  });

  describe('getFormattedAwayTeamPlayers', () => {
    it('formats and sorts away team players', () => {
      const players = getFormattedAwayTeamPlayers(mockTeamMatch);

      expect(players).toHaveLength(2);
      // Both have username fallbacks, should be sorted alphabetically
      expect(players[0].name).toBe('player3');
      expect(players[1].name).toBe('player4');
    });

    it('handles mixed name formats', () => {
      const mixedTeamMatch = {
        ...mockTeamMatch,
        awayTeam: {
          group: {
            name: 'Away Team',
            members: [
              { user: mockUsers[0] }, // John Doe
              { user: mockUsers[3] }, // player4 (username only)
            ],
          },
        },
      };

      const players = getFormattedAwayTeamPlayers(mixedTeamMatch);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('John Doe');
      expect(players[1].name).toBe('player4');
    });
  });
});

describe('Integration Tests', () => {
  describe('Player Functions Integration', () => {
    it('all player functions work together consistently', () => {
      const homePlayersRaw = getHomeTeamPlayers(mockTeamMatch);
      const awayPlayersRaw = getAwayTeamPlayers(mockTeamMatch);
      const homePlayersFormatted = getFormattedHomeTeamPlayers(mockTeamMatch);
      const awayPlayersFormatted = getFormattedAwayTeamPlayers(mockTeamMatch);

      // Raw functions should return same number of players
      expect(homePlayersRaw).toHaveLength(homePlayersFormatted.length);
      expect(awayPlayersRaw).toHaveLength(awayPlayersFormatted.length);

      // Formatted functions should maintain all user data
      homePlayersFormatted.forEach(formattedPlayer => {
        const rawPlayer = homePlayersRaw.find(p => p.id === formattedPlayer.id);
        expect(rawPlayer).toBeDefined();
        expect(formattedPlayer.username).toBe(rawPlayer!.username);
        expect(formattedPlayer.email).toBe(rawPlayer!.email);
      });
    });
  });

  describe('Score Functions Integration', () => {
    it('score parsing and formatting work together', () => {
      const testScores = ['6-4', '6-4 3-6 7-5', '7-6 6-4', '0-6 6-0 6-3', ''];

      testScores.forEach(originalScore => {
        const parsed = parseScoreString(originalScore);
        const formatted = scoreArrayToString(parsed);

        if (originalScore === '') {
          expect(formatted).toBe('');
        } else {
          expect(formatted).toBe(originalScore);
        }
      });
    });
  });
});

describe('Error Handling and Robustness', () => {
  describe('Malformed Data Handling', () => {
    it('handles malformed team match data', () => {
      const malformedTeamMatch = {
        id: 'malformed',
        homeTeam: null,
        awayTeam: undefined,
      };

      expect(() => getHomeTeamPlayers(malformedTeamMatch as any)).toThrow();
      expect(() => getAwayTeamPlayers(malformedTeamMatch as any)).toThrow();
    });

    it('handles malformed user data gracefully', () => {
      const malformedUser = {
        id: 'malformed',
        // Missing required fields
      };

      expect(() => formatPlayerName(malformedUser as any)).not.toThrow();
      const result = formatPlayerName(malformedUser as any);
      expect(typeof result).toBe('string');
    });
  });

  describe('Performance with Large Datasets', () => {
    it('handles large team rosters efficiently', () => {
      const largeRoster = Array.from({ length: 100 }, (_, i) => ({
        user: createTestUser({ id: `user-${i}`, firstName: `Player${i}`, lastName: `Last${i}` }),
      }));

      const largeTeamMatch = {
        ...mockTeamMatch,
        homeTeam: {
          group: {
            name: 'Large Home Team',
            members: largeRoster,
          },
        },
      };

      const startTime = performance.now();
      const players = getFormattedHomeTeamPlayers(largeTeamMatch);
      const endTime = performance.now();

      expect(players).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('handles complex score strings efficiently', () => {
      const complexScore = Array.from({ length: 50 }, (_, i) => `${6 + i}-${4 + i}`).join(' ');

      const startTime = performance.now();
      const parsed = parseScoreString(complexScore);
      const formatted = scoreArrayToString(parsed);
      const endTime = performance.now();

      expect(parsed).toHaveLength(50);
      expect(formatted).toBe(complexScore);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});

describe('Type Safety and Contracts', () => {
  describe('Function Contracts', () => {
    it('maintains type contracts for player functions', () => {
      const homeTeamPlayers = getHomeTeamPlayers(mockTeamMatch);
      const formattedPlayers = getFormattedHomeTeamPlayers(mockTeamMatch);

      // Raw players should have User interface
      homeTeamPlayers.forEach(player => {
        expect(typeof player.id).toBe('string');
        expect(typeof player.username).toBe('string');
        expect(typeof player.email).toBe('string');
      });

      // Formatted players should have User + name property
      formattedPlayers.forEach(player => {
        expect(typeof player.id).toBe('string');
        expect(typeof player.username).toBe('string');
        expect(typeof player.email).toBe('string');
        expect(typeof player.name).toBe('string');
      });
    });

    it('maintains type contracts for score functions', () => {
      const scoreString = '6-4 3-6';
      const parsed = parseScoreString(scoreString);
      const formatted = scoreArrayToString(parsed);

      // Parsed should be number[][]
      expect(Array.isArray(parsed)).toBe(true);
      parsed.forEach(set => {
        expect(Array.isArray(set)).toBe(true);
        set.forEach(score => {
          expect(typeof score).toBe('number');
        });
      });

      // Formatted should be string
      expect(typeof formatted).toBe('string');
    });
  });
});
