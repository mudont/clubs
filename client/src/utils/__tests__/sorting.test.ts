import { sortAlphabetically, sortByDisplayName, sortByLabel, sortByName } from '../sorting';

describe('Sorting utilities', () => {
  describe('sortByDisplayName', () => {
    it('should sort users by full name when available', () => {
      const users = [
        { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
        { firstName: 'Bob', lastName: 'Johnson', username: 'bob' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Bob');
      expect(sorted[2].firstName).toBe('John');
    });

    it('should fallback to username when name is not available', () => {
      const users = [{ username: 'zebra' }, { username: 'alpha' }, { username: 'beta' }];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].username).toBe('alpha');
      expect(sorted[1].username).toBe('beta');
      expect(sorted[2].username).toBe('zebra');
    });

    it('should handle mixed cases with and without names', () => {
      const users = [
        { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        { username: 'alpha' },
        { firstName: 'Alice', lastName: '', username: 'alice' },
        { firstName: '', lastName: 'Smith', username: 'smith' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].username).toBe('alpha');
      expect(sorted[2].firstName).toBe('John');
      expect(sorted[3].lastName).toBe('Smith');
    });

    it('should handle undefined/null values gracefully', () => {
      const users = [
        { firstName: undefined, lastName: null, username: 'user1' } as any,
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].username).toBe('user1');
    });

    it('should handle empty arrays', () => {
      const users: any[] = [];
      const sorted = sortByDisplayName(users);
      expect(sorted).toEqual([]);
    });

    it('should handle single item arrays', () => {
      const users = [{ firstName: 'John', lastName: 'Doe', username: 'johndoe' }];
      const sorted = sortByDisplayName(users);
      expect(sorted).toEqual(users);
    });

    it('should handle duplicate names', () => {
      const users = [
        { firstName: 'John', lastName: 'Doe', username: 'johndoe1' },
        { firstName: 'John', lastName: 'Doe', username: 'johndoe2' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted).toHaveLength(2);
      expect(sorted[0].firstName).toBe('John');
      expect(sorted[1].firstName).toBe('John');
    });

    it('should be case insensitive', () => {
      const users = [
        { firstName: 'john', lastName: 'doe', username: 'johndoe' },
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('john');
    });

    it('should not modify the original array', () => {
      const users = [
        { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
      ];
      const original = [...users];
      sortByDisplayName(users);
      expect(users).toEqual(original);
    });
  });

  describe('sortByName', () => {
    it('should sort items by name property', () => {
      const items = [
        { name: 'Zebra', id: 1 },
        { name: 'Alpha', id: 2 },
        { name: 'Beta', id: 3 },
      ];
      const sorted = sortByName(items);
      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('Beta');
      expect(sorted[2].name).toBe('Zebra');
    });

    it('should be case insensitive', () => {
      const items = [{ name: 'zebra' }, { name: 'Alpha' }, { name: 'BETA' }];
      const sorted = sortByName(items);
      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('BETA');
      expect(sorted[2].name).toBe('zebra');
    });

    it('should handle empty arrays', () => {
      const items: any[] = [];
      const sorted = sortByName(items);
      expect(sorted).toEqual([]);
    });

    it('should not modify the original array', () => {
      const items = [{ name: 'B' }, { name: 'A' }];
      const original = [...items];
      sortByName(items);
      expect(items).toEqual(original);
    });
  });

  describe('sortByLabel', () => {
    it('should sort items using custom label function', () => {
      const items = ['CASH_APP', 'BANK_TRANSFER', 'PAYPAL'];
      const getLabelFn = (item: string) => item.replace('_', ' ').toLowerCase();
      const sorted = sortByLabel(items, getLabelFn);
      expect(sorted[0]).toBe('BANK_TRANSFER');
      expect(sorted[1]).toBe('CASH_APP');
      expect(sorted[2]).toBe('PAYPAL');
    });

    it('should handle empty arrays', () => {
      const items: string[] = [];
      const getLabelFn = (item: string) => item;
      const sorted = sortByLabel(items, getLabelFn);
      expect(sorted).toEqual([]);
    });

    it('should not modify the original array', () => {
      const items = ['B', 'A'];
      const original = [...items];
      const getLabelFn = (item: string) => item;
      sortByLabel(items, getLabelFn);
      expect(items).toEqual(original);
    });
  });

  describe('sortAlphabetically', () => {
    it('should sort string arrays alphabetically', () => {
      const items = ['Zebra', 'Alpha', 'Beta'];
      const sorted = sortAlphabetically(items);
      expect(sorted[0]).toBe('Alpha');
      expect(sorted[1]).toBe('Beta');
      expect(sorted[2]).toBe('Zebra');
    });

    it('should be case insensitive', () => {
      const items = ['zebra', 'Alpha', 'BETA'];
      const sorted = sortAlphabetically(items);
      expect(sorted[0]).toBe('Alpha');
      expect(sorted[1]).toBe('BETA');
      expect(sorted[2]).toBe('zebra');
    });

    it('should handle special characters', () => {
      const items = ['Food & Dining', 'Transportation', 'Entertainment'];
      const sorted = sortAlphabetically(items);
      expect(sorted[0]).toBe('Entertainment');
      expect(sorted[1]).toBe('Food & Dining');
      expect(sorted[2]).toBe('Transportation');
    });

    it('should handle empty arrays', () => {
      const items: string[] = [];
      const sorted = sortAlphabetically(items);
      expect(sorted).toEqual([]);
    });

    it('should not modify the original array', () => {
      const items = ['B', 'A'];
      const original = [...items];
      sortAlphabetically(items);
      expect(items).toEqual(original);
    });
  });

  describe('Error handling', () => {
    it('should handle sorting failures gracefully', () => {
      // Mock console.warn to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create an object that will cause localeCompare to throw
      const problematicUsers = [{ firstName: null, lastName: null, username: 'user1' } as any];

      // Override localeCompare to throw an error
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = jest.fn(() => {
        throw new Error('Comparison failed');
      });

      const result = sortByDisplayName(problematicUsers);

      // Should return original array on error
      expect(result).toEqual(problematicUsers);
      expect(consoleSpy).toHaveBeenCalled();

      // Restore original method
      String.prototype.localeCompare = originalLocaleCompare;
      consoleSpy.mockRestore();
    });
  });
});
