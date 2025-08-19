# Design Document

## Overview

This design document outlines the implementation approach for sorting dropdown options across the frontend React components. The solution focuses on client-side sorting to improve user experience without requiring backend changes, while maintaining performance and consistency across all dropdown components.

## Architecture

### Sorting Strategy

The implementation will use client-side sorting applied at the component level, ensuring that:

- Data fetched from GraphQL queries remains unchanged
- Sorting logic is applied consistently across similar dropdown types
- Performance impact is minimal for typical dropdown sizes
- Existing functionality and state management remain unaffected

### Component Categories

Based on the analysis, dropdown components fall into three categories:

1. **Data-driven dropdowns**: Team selections, member selections (require alphabetical sorting)
2. **Predefined option dropdowns**: Categories, split types (require alphabetical sorting)
3. **Logical order dropdowns**: Result types, winner selections (maintain current order)

## Components and Interfaces

### 1. TeamMatchList Component

**Location**: `client/src/components/tennis/TeamMatchList.tsx`

**Changes Required**:

- Sort teams array by `group.name` before rendering in both Home Team and Away Team dropdowns
- Apply sorting in the render logic without modifying the original data

**Implementation**:

```typescript
// Sort teams alphabetically by group name
const sortedTeams = [...teams].sort((a, b) =>
  a.group.name.localeCompare(b.group.name, undefined, { sensitivity: 'base' })
);
```

### 2. ExpenseForm Component

**Location**: `client/src/components/expenses/ExpenseForm.tsx`

**Changes Required**:

- Sort group members by display name in "Paid By" dropdown
- Sort expense categories alphabetically
- Maintain current split type order (logical ordering)

**Implementation**:

```typescript
// Sort members by display name (firstName lastName or username)
const sortedMembers = [...membersData.group.memberships].sort((a, b) => {
  const nameA =
    `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() ||
    a.user.username;
  const nameB =
    `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() ||
    b.user.username;
  return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
});

// Sort categories alphabetically
const sortedCategories = [...EXPENSE_CATEGORIES].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
);
```

### 3. UserAutocomplete Component

**Location**: `client/src/components/tennis/UserAutocomplete.tsx`

**Changes Required**:

- Sort search results by display name before rendering

**Implementation**:

```typescript
// Sort users by display name
const sortedUsers = [...userSearchData.userSearch].sort((a, b) => {
  const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
  const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
  return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
});
```

### 4. GroupAutocomplete Component

**Location**: `client/src/components/tennis/GroupAutocomplete.tsx`

**Changes Required**:

- Sort search results by group name before rendering

**Implementation**:

```typescript
// Sort groups by name
const sortedGroups = [...groupSearchData.publicGroups].sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
);
```

### 5. IndividualMatchList Component

**Location**: `client/src/components/tennis/IndividualMatchList.tsx`

**Changes Required**:

- Sort players by display name in all player selection dropdowns for singles and doubles matches
- Apply consistent sorting across all player dropdowns

**Implementation**:

```typescript
// Sort players by display name
const sortedPlayers = [...players].sort((a, b) => {
  const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
  const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
  return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
});
```

### 6. LeagueDetail Component

**Location**: `client/src/components/tennis/LeagueDetail.tsx`

**Changes Required**:

- Sort team members by display name in singles match player dropdowns
- Sort team members by display name in doubles match player dropdowns (all 4 player positions)

**Implementation**:

```typescript
// Sort team members by display name
const sortedHomeTeamMembers = [
  ...(selectedSinglesTeamMatch?.homeTeam.group?.members?.map((m) => m.user) ||
    []),
].sort((a, b) => {
  const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
  const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
  return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
});

const sortedAwayTeamMembers = [
  ...(selectedSinglesTeamMatch?.awayTeam.group?.members?.map((m) => m.user) ||
    []),
].sort((a, b) => {
  const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
  const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
  return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
});
```

### 7. SettlementList Component

**Location**: `client/src/components/expenses/SettlementList.tsx`

**Changes Required**:

- Sort payment methods by their display labels

**Implementation**:

```typescript
// Sort payment methods by display label
const sortedPaymentMethods = [...PAYMENT_METHODS].sort((a, b) =>
  getPaymentMethodLabel(a).localeCompare(getPaymentMethodLabel(b), undefined, {
    sensitivity: 'base',
  })
);
```

## Data Models

### Sorting Utility Function

Create a reusable utility function for consistent sorting behavior:

```typescript
// utils/sorting.ts
export const sortByDisplayName = (
  users: Array<{ firstName?: string; lastName?: string; username: string }>
) => {
  return users.sort((a, b) => {
    const nameA =
      `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username;
    const nameB =
      `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username;
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
  });
};

export const sortByName = <T extends { name: string }>(items: T[]) => {
  return items.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
};

export const sortByLabel = (
  items: string[],
  getLabelFn: (item: string) => string
) => {
  return items.sort((a, b) =>
    getLabelFn(a).localeCompare(getLabelFn(b), undefined, {
      sensitivity: 'base',
    })
  );
};
```

### Sorting Configuration

Define which components require sorting and which should maintain their current order:

```typescript
// config/dropdownSorting.ts
export const DROPDOWN_SORTING_CONFIG = {
  // Components that require alphabetical sorting
  ALPHABETICAL_SORT: [
    'TeamMatchList.teams',
    'ExpenseForm.members',
    'ExpenseForm.categories',
    'UserAutocomplete.results',
    'GroupAutocomplete.results',
    'IndividualMatchList.players',
    'LeagueDetail.teamMembers',
    'SettlementList.paymentMethods',
  ],

  // Components that maintain logical order
  MAINTAIN_ORDER: [
    'BatchMatchEditor.resultTypes',
    'BatchMatchEditor.winnerOptions',
    'ExpenseForm.splitTypes',
  ],
};
```

## Error Handling

### Sorting Failures

- Implement fallback behavior if sorting fails
- Log sorting errors without breaking the UI
- Ensure original data order is preserved if sorting encounters issues

```typescript
const safeSortByName = <T extends { name: string }>(items: T[]) => {
  try {
    return sortByName(items);
  } catch (error) {
    console.warn('Sorting failed, using original order:', error);
    return items;
  }
};
```

### Data Validation

- Handle cases where expected properties might be undefined
- Provide fallback values for sorting keys
- Ensure sorting works with partial data

## Testing Strategy

### Unit Tests

1. **Sorting Utility Tests**:
   - Test sorting with various name combinations
   - Test handling of undefined/null values
   - Test locale-aware sorting behavior

2. **Component Integration Tests**:
   - Verify dropdowns render options in sorted order
   - Test that sorting doesn't break existing functionality
   - Verify selected values are preserved after sorting

3. **Edge Case Tests**:
   - Empty arrays
   - Single item arrays
   - Arrays with duplicate names
   - Arrays with special characters

### Test Implementation

```typescript
// utils/sorting.test.ts
describe('Sorting utilities', () => {
  describe('sortByDisplayName', () => {
    it('should sort users by full name when available', () => {
      const users = [
        { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        { firstName: 'Alice', lastName: 'Smith', username: 'alice' },
      ];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].firstName).toBe('Alice');
    });

    it('should fallback to username when name is not available', () => {
      const users = [{ username: 'zebra' }, { username: 'alpha' }];
      const sorted = sortByDisplayName(users);
      expect(sorted[0].username).toBe('alpha');
    });
  });
});
```

### Accessibility Testing

- Ensure sorted dropdowns maintain proper ARIA attributes
- Verify keyboard navigation works correctly with sorted options
- Test screen reader compatibility with sorted content

### Performance Testing

- Measure sorting performance with large datasets (100+ items)
- Verify no memory leaks from sorting operations
- Test sorting performance on mobile devices

## Implementation Approach

### Phase 1: Utility Functions

1. Create sorting utility functions
2. Add comprehensive unit tests
3. Document sorting behavior

### Phase 2: Component Updates

1. Update TeamMatchList component
2. Update ExpenseForm component
3. Update Autocomplete components
4. Update SettlementList component

### Phase 3: Testing & Validation

1. Run comprehensive test suite
2. Manual testing of all affected dropdowns
3. Performance validation
4. Accessibility validation

### Rollback Strategy

- All changes are client-side only, making rollback simple
- Original data structures remain unchanged
- Can disable sorting by removing sort calls without breaking functionality
- Feature flags could be implemented if gradual rollout is desired
