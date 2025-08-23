/**
 * Comprehensive tests for sorting utility functions
 */

import {
  NamedItem,
  UserLike,
  sortAlphabetically,
  sortByDisplayName,
  sortByLabel,
  sortByName,
} from '../sorting';

describe('sortByDisplayName', () => {
  const createUser = (overrides: Partial<UserLike> = {}): UserLike => ({
    username: 'testuser',
    ...overrides,
  });

  describe('Basic Functionality', () => {
    it('sorts users by first and last name when available', () => {
      const users = [
        createUser({ firstName: 'Zoe', lastName: 'Wilson', username: 'zoe' }),
        createUser({ firstName: 'Alice', lastName: 'Smith', username: 'alice' }),
        createUser({ firstName: 'Bob', lastName: 'Johnson', username: 'bob' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Bob');
      expect(sorted[2].firstName).toBe('Zoe');
    });

    it('falls back to username when no first/last name', () => {
      const users = [
        createUser({ username: 'zebra' }),
        createUser({ username: 'alpha' }),
        createUser({ username: 'beta' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].username).toBe('alpha');
      expect(sorted[1].username).toBe('beta');
      expect(sorted[2].username).toBe('zebra');
    });

    it('handles mixed users with and without names', () => {
      const users = [
        createUser({ username: 'zebra' }),
        createUser({ firstName: 'Alice', lastName: 'Smith', username: 'alice' }),
        createUser({ username: 'alpha' }),
        createUser({ firstName: 'Bob', lastName: 'Johnson', username: 'bob' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].firstName).toBe('Alice'); // Alice Smith
      expect(sorted[1].username).toBe('alpha'); // alpha (username)
      expect(sorted[2].firstName).toBe('Bob'); // Bob Johnson
      expect(sorted[3].username).toBe('zebra'); // zebra (username)
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const result = sortByDisplayName([]);
      expect(result).toEqual([]);
    });

    it('handles single user', () => {
      const users = [createUser({ firstName: 'John', lastName: 'Doe' })];
      const result = sortByDisplayName(users);
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
    });

    it('handles users with only first name', () => {
      const users = [
        createUser({ firstName: 'Zoe', username: 'zoe' }),
        createUser({ firstName: 'Alice', username: 'alice' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Zoe');
    });

    it('handles users with only last name', () => {
      const users = [
        createUser({ lastName: 'Wilson', username: 'wilson' }),
        createUser({ lastName: 'Anderson', username: 'anderson' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].lastName).toBe('Anderson');
      expect(sorted[1].lastName).toBe('Wilson');
    });

    it('handles users with empty string names', () => {
      const users = [
        createUser({ firstName: '', lastName: '', username: 'zebra' }),
        createUser({ firstName: '', lastName: '', username: 'alpha' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].username).toBe('alpha');
      expect(sorted[1].username).toBe('zebra');
    });

    it('handles users with whitespace-only names', () => {
      const users = [
        createUser({ firstName: '  ', lastName: '  ', username: 'zebra' }),
        createUser({ firstName: '\\t', lastName: '\\n', username: 'alpha' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].username).toBe('alpha');
      expect(sorted[1].username).toBe('zebra');
    });
  });

  describe('Case Sensitivity', () => {
    it('sorts case-insensitively', () => {
      const users = [
        createUser({ firstName: 'zoe', lastName: 'wilson' }),
        createUser({ firstName: 'Alice', lastName: 'Smith' }),
        createUser({ firstName: 'BOB', lastName: 'JOHNSON' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('BOB');
      expect(sorted[2].firstName).toBe('zoe');
    });

    it('sorts usernames case-insensitively', () => {
      const users = [
        createUser({ username: 'ZEBRA' }),
        createUser({ username: 'alpha' }),
        createUser({ username: 'Beta' }),
      ];

      const sorted = sortByDisplayName(users);

      expect(sorted[0].username).toBe('alpha');
      expect(sorted[1].username).toBe('Beta');
      expect(sorted[2].username).toBe('ZEBRA');
    });
  });

  describe('Locale Support', () => {
    it('handles accented characters correctly', () => {
      const users = [
        createUser({ firstName: 'Zoë', lastName: 'Wilson' }),
        createUser({ firstName: 'André', lastName: 'Smith' }),
        createUser({ firstName: 'Björn', lastName: 'Johnson' }),
      ];

      const sorted = sortByDisplayName(users);

      // Should sort correctly with locale-aware comparison
      expect(sorted[0].firstName).toBe('André');
      expect(sorted[1].firstName).toBe('Björn');
      expect(sorted[2].firstName).toBe('Zoë');
    });
  });

  describe('Immutability', () => {
    it('does not mutate the original array', () => {
      const users = [
        createUser({ firstName: 'Zoe', lastName: 'Wilson' }),
        createUser({ firstName: 'Alice', lastName: 'Smith' }),
      ];
      const originalOrder = [...users];

      sortByDisplayName(users);

      expect(users).toEqual(originalOrder);
    });

    it('returns a new array', () => {
      const users = [createUser({ firstName: 'John', lastName: 'Doe' })];
      const sorted = sortByDisplayName(users);

      expect(sorted).not.toBe(users);
      expect(sorted).toEqual(users);
    });
  });

  describe('Error Handling', () => {
    it('handles malformed user objects gracefully', () => {
      const users = [
        createUser({ firstName: 'Alice', lastName: 'Smith' }),
        // @ts-ignore - Testing runtime error handling
        { firstName: null, lastName: undefined, username: 'test' },
        createUser({ firstName: 'Bob', lastName: 'Johnson' }),
      ];

      expect(() => sortByDisplayName(users)).not.toThrow();
      const sorted = sortByDisplayName(users);
      expect(sorted).toHaveLength(3);
    });

    it('returns original array on sorting error', () => {
      // Mock localeCompare to throw an error
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = jest.fn(() => {
        throw new Error('Locale error');
      });

      const users = [createUser({ firstName: 'Alice' }), createUser({ firstName: 'Bob' })];
      const result = sortByDisplayName(users);

      expect(result).toEqual(users);

      // Restore original method
      String.prototype.localeCompare = originalLocaleCompare;
    });
  });

  describe('Performance', () => {
    it('handles large arrays efficiently', () => {
      const users = Array.from({ length: 1000 }, (_, i) =>
        createUser({
          firstName: `User${i}`,
          lastName: `LastName${i}`,
          username: `user${i}`,
        })
      );

      const startTime = performance.now();
      const sorted = sortByDisplayName(users);
      const endTime = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});

describe('sortByName', () => {
  const createNamedItem = (name: string): NamedItem => ({ name });

  describe('Basic Functionality', () => {
    it('sorts items by name property', () => {
      const items = [createNamedItem('Zebra'), createNamedItem('Alpha'), createNamedItem('Beta')];

      const sorted = sortByName(items);

      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('Beta');
      expect(sorted[2].name).toBe('Zebra');
    });

    it('sorts case-insensitively', () => {
      const items = [createNamedItem('zebra'), createNamedItem('Alpha'), createNamedItem('BETA')];

      const sorted = sortByName(items);

      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('BETA');
      expect(sorted[2].name).toBe('zebra');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const result = sortByName([]);
      expect(result).toEqual([]);
    });

    it('handles single item', () => {
      const items = [createNamedItem('Single')];
      const result = sortByName(items);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Single');
    });

    it('handles items with empty names', () => {
      const items = [createNamedItem(''), createNamedItem('Alpha'), createNamedItem('')];

      const sorted = sortByName(items);

      expect(sorted[0].name).toBe('');
      expect(sorted[1].name).toBe('');
      expect(sorted[2].name).toBe('Alpha');
    });
  });

  describe('Immutability', () => {
    it('does not mutate the original array', () => {
      const items = [createNamedItem('B'), createNamedItem('A')];
      const originalOrder = [...items];

      sortByName(items);

      expect(items).toEqual(originalOrder);
    });
  });

  describe('Error Handling', () => {
    it('returns original array on sorting error', () => {
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = jest.fn(() => {
        throw new Error('Locale error');
      });

      const items = [createNamedItem('B'), createNamedItem('A')];
      const result = sortByName(items);

      expect(result).toEqual(items);

      String.prototype.localeCompare = originalLocaleCompare;
    });
  });
});

describe('sortByLabel', () => {
  const getLabelFn = (item: string) => item.toUpperCase();

  describe('Basic Functionality', () => {
    it('sorts items using custom label function', () => {
      const items = ['zebra', 'alpha', 'beta'];
      const sorted = sortByLabel(items, getLabelFn);

      expect(sorted).toEqual(['alpha', 'beta', 'zebra']);
    });

    it('uses label function for comparison', () => {
      const items = ['item_3', 'item_1', 'item_2'];
      const getNumberLabel = (item: string) => item.split('_')[1];

      const sorted = sortByLabel(items, getNumberLabel);

      expect(sorted).toEqual(['item_1', 'item_2', 'item_3']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const result = sortByLabel([], getLabelFn);
      expect(result).toEqual([]);
    });

    it('handles single item', () => {
      const items = ['single'];
      const result = sortByLabel(items, getLabelFn);
      expect(result).toEqual(['single']);
    });
  });

  describe('Error Handling', () => {
    it('returns original array on sorting error', () => {
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = jest.fn(() => {
        throw new Error('Locale error');
      });

      const items = ['b', 'a'];
      const result = sortByLabel(items, getLabelFn);

      expect(result).toEqual(items);

      String.prototype.localeCompare = originalLocaleCompare;
    });

    it('handles label function errors gracefully', () => {
      const errorLabelFn = () => {
        throw new Error('Label function error');
      };

      const items = ['b', 'a'];
      const result = sortByLabel(items, errorLabelFn);

      expect(result).toEqual(items);
    });
  });
});

describe('sortAlphabetically', () => {
  describe('Basic Functionality', () => {
    it('sorts strings alphabetically', () => {
      const items = ['zebra', 'alpha', 'beta'];
      const sorted = sortAlphabetically(items);

      expect(sorted).toEqual(['alpha', 'beta', 'zebra']);
    });

    it('sorts case-insensitively', () => {
      const items = ['Zebra', 'alpha', 'BETA'];
      const sorted = sortAlphabetically(items);

      expect(sorted).toEqual(['alpha', 'BETA', 'Zebra']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const result = sortAlphabetically([]);
      expect(result).toEqual([]);
    });

    it('handles single item', () => {
      const items = ['single'];
      const result = sortAlphabetically(items);
      expect(result).toEqual(['single']);
    });

    it('handles empty strings', () => {
      const items = ['', 'alpha', ''];
      const sorted = sortAlphabetically(items);

      expect(sorted).toEqual(['', '', 'alpha']);
    });

    it('handles numbers as strings', () => {
      const items = ['10', '2', '1'];
      const sorted = sortAlphabetically(items);

      // String comparison, not numeric
      expect(sorted).toEqual(['1', '10', '2']);
    });
  });

  describe('Special Characters', () => {
    it('handles special characters', () => {
      const items = ['@symbol', '#hash', 'alpha'];
      const sorted = sortAlphabetically(items);

      // Special characters should sort before letters
      expect(sorted[0]).toBe('#hash');
      expect(sorted[1]).toBe('@symbol');
      expect(sorted[2]).toBe('alpha');
    });

    it('handles accented characters', () => {
      const items = ['café', 'apple', 'naïve'];
      const sorted = sortAlphabetically(items);

      expect(sorted).toEqual(['apple', 'café', 'naïve']);
    });
  });

  describe('Immutability', () => {
    it('does not mutate the original array', () => {
      const items = ['c', 'a', 'b'];
      const originalOrder = [...items];

      sortAlphabetically(items);

      expect(items).toEqual(originalOrder);
    });
  });

  describe('Error Handling', () => {
    it('returns original array on sorting error', () => {
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = jest.fn(() => {
        throw new Error('Locale error');
      });

      const items = ['b', 'a'];
      const result = sortAlphabetically(items);

      expect(result).toEqual(items);

      String.prototype.localeCompare = originalLocaleCompare;
    });
  });

  describe('Performance', () => {
    it('handles large arrays efficiently', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item${i}`);

      const startTime = performance.now();
      const sorted = sortAlphabetically(items);
      const endTime = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});

describe('Integration Tests', () => {
  it('all sorting functions work together consistently', () => {
    const users = [
      { firstName: 'Zoe', lastName: 'Wilson', username: 'zoe' },
      { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
      { username: 'beta' },
    ];

    const namedItems = [{ name: 'Zoe Wilson' }, { name: 'Alice Smith' }, { name: 'beta' }];

    const strings = ['Zoe Wilson', 'Alice Smith', 'beta'];

    const sortedUsers = sortByDisplayName(users);
    const sortedItems = sortByName(namedItems);
    const sortedStrings = sortAlphabetically(strings);

    // All should produce the same order
    expect(sortedUsers[0].firstName).toBe('Alice');
    expect(sortedItems[0].name).toBe('Alice Smith');
    expect(sortedStrings[0]).toBe('Alice Smith');

    expect(sortedUsers[1].username).toBe('beta');
    expect(sortedItems[1].name).toBe('beta');
    expect(sortedStrings[1]).toBe('beta');

    expect(sortedUsers[2].firstName).toBe('Zoe');
    expect(sortedItems[2].name).toBe('Zoe Wilson');
    expect(sortedStrings[2]).toBe('Zoe Wilson');
  });
});

describe('Boundary Value Tests', () => {
  describe('sortByDisplayName boundary values', () => {
    it('handles very long names', () => {
      const longName = 'A'.repeat(1000);
      const users = [
        { firstName: longName, lastName: 'Z', username: 'long' },
        { firstName: 'B', lastName: 'Short', username: 'short' },
      ];

      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe(longName);
      expect(sorted[1].firstName).toBe('B');
    });

    it('handles Unicode characters', () => {
      const users = [
        { firstName: '🎾', lastName: 'Tennis', username: 'tennis' },
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
        { firstName: '中文', lastName: '名字', username: 'chinese' },
      ];

      expect(() => sortByDisplayName(users)).not.toThrow();
      const sorted = sortByDisplayName(users);
      expect(sorted).toHaveLength(3);
    });
  });

  describe('Performance boundary tests', () => {
    it('handles maximum practical array size', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        firstName: `User${i}`,
        lastName: `Last${i}`,
        username: `user${i}`,
      }));

      const startTime = performance.now();
      const sorted = sortByDisplayName(largeArray);
      const endTime = performance.now();

      expect(sorted).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});

describe('Error Recovery Tests', () => {
  it('recovers from partial sorting failures', () => {
    let callCount = 0;
    const originalLocaleCompare = String.prototype.localeCompare;

    // Mock to fail on third call
    String.prototype.localeCompare = jest.fn(function (this: string, other: string) {
      callCount++;
      if (callCount === 3) {
        throw new Error('Intermittent error');
      }
      return originalLocaleCompare.call(this, other);
    });

    const items = ['c', 'a', 'b', 'd'];
    const result = sortAlphabetically(items);

    // Should return original array on any error
    expect(result).toEqual(items);

    String.prototype.localeCompare = originalLocaleCompare;
  });
});

describe('Type Safety Tests', () => {
  it('maintains type safety with generic functions', () => {
    interface CustomItem extends NamedItem {
      id: number;
      category: string;
    }

    const items: CustomItem[] = [
      { id: 1, name: 'Zebra', category: 'animal' },
      { id: 2, name: 'Alpha', category: 'greek' },
    ];

    const sorted = sortByName(items);

    // Should maintain all properties
    expect(sorted[0]).toEqual({ id: 2, name: 'Alpha', category: 'greek' });
    expect(sorted[1]).toEqual({ id: 1, name: 'Zebra', category: 'animal' });
  });
});
