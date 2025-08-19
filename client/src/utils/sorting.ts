/**
 * Utility functions for sorting dropdown options consistently across components
 */

export interface UserLike {
  firstName?: string;
  lastName?: string;
  username: string;
}

export interface NamedItem {
  name: string;
}

/**
 * Sort users/players by display name (firstName lastName) with fallback to username
 * Uses case-insensitive locale-aware comparison
 */
export const sortByDisplayName = (users: UserLike[]): UserLike[] => {
  try {
    return [...users].sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  } catch (error) {
    console.warn('Sorting by display name failed, using original order:', error);
    return users;
  }
};

/**
 * Sort items by their name property
 * Uses case-insensitive locale-aware comparison
 */
export const sortByName = <T extends NamedItem>(items: T[]): T[] => {
  try {
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  } catch (error) {
    console.warn('Sorting by name failed, using original order:', error);
    return items;
  }
};

/**
 * Sort items by their display labels using a custom label function
 * Uses case-insensitive locale-aware comparison
 */
export const sortByLabel = (items: string[], getLabelFn: (item: string) => string): string[] => {
  try {
    return [...items].sort((a, b) =>
      getLabelFn(a).localeCompare(getLabelFn(b), undefined, { sensitivity: 'base' })
    );
  } catch (error) {
    console.warn('Sorting by label failed, using original order:', error);
    return items;
  }
};

/**
 * Sort string array alphabetically
 * Uses case-insensitive locale-aware comparison
 */
export const sortAlphabetically = (items: string[]): string[] => {
  try {
    return [...items].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  } catch (error) {
    console.warn('Alphabetical sorting failed, using original order:', error);
    return items;
  }
};
