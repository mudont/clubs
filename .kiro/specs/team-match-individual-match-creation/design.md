# Design Document

## Overview

This feature enhances the BatchMatchEditor component by adding the ability to create new individual matches directly from the team match detail view. The design leverages the existing IndividualMatchList form component to maintain consistency while adding contextual integration within the BatchMatchEditor component.

The solution involves modifying the BatchMatchEditor component to include "+" buttons at the bottom of both Singles and Doubles tabs, which will open a modal or inline form using the same form logic from IndividualMatchList, but with pre-populated data from the parent team match.

## Architecture

### Component Structure

```
TeamMatchList
├── BatchMatchEditor (modified)
│   ├── Singles Tab
│   │   ├── Existing matches table
│   │   └── "+ Add Singles Match" button (new)
│   └── Doubles Tab
│       ├── Existing matches table
│       └── "+ Add Doubles Match" button (new)
└── IndividualMatchForm (extracted/reused)
    ├── Singles form fields
    └── Doubles form fields
```

### Data Flow

1. User clicks "+" button in BatchMatchEditor
2. BatchMatchEditor opens form with team match context
3. Form pre-populates with team match data (date, teams, teamMatchId)
4. User fills remaining fields and submits
5. GraphQL mutation creates individual match
6. BatchMatchEditor refreshes to show new match
7. Form closes and returns to table view

## Components and Interfaces

### Modified BatchMatchEditor Component

**Props Interface:**

```typescript
interface BatchMatchEditorProps {
  singlesMatches: IndividualSinglesMatch[];
  doublesMatches: IndividualDoublesMatch[];
  onSave: (
    matches: (IndividualSinglesMatch | IndividualDoublesMatch)[],
    matchType: 'singles' | 'doubles'
  ) => void;
  // New props for individual match creation
  teamMatch: TeamLeagueTeamMatch;
  leagueId: string;
  onRefresh: () => void;
}
```

**New State:**

```typescript
const [showCreateForm, setShowCreateForm] = useState<
  'singles' | 'doubles' | null
>(null);
```

### Extracted IndividualMatchForm Component

**Props Interface:**

```typescript
interface IndividualMatchFormProps {
  matchType: 'singles' | 'doubles';
  teamMatch: TeamLeagueTeamMatch;
  leagueId: string;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Features:**

- Reuses form logic from IndividualMatchList
- Pre-populates match date from team match
- Filters players by home/away teams
- Handles both singles and doubles creation
- Provides consistent validation and error handling

### Player Filtering Logic

**Home Team Players:**

```typescript
const getHomeTeamPlayers = (teamMatch: TeamLeagueTeamMatch): User[] => {
  return teamMatch.homeTeam.group.members?.map((m) => m.user) || [];
};
```

**Away Team Players:**

```typescript
const getAwayTeamPlayers = (teamMatch: TeamLeagueTeamMatch): User[] => {
  return teamMatch.awayTeam.group.members?.map((m) => m.user) || [];
};
```

## Data Models

### Team Match Context

The form will receive the complete team match object containing:

- `id`: Used as teamMatchId for new individual matches
- `matchDate`: Pre-populated in form date field
- `homeTeam.group.members`: Source for home team player options
- `awayTeam.group.members`: Source for away team player options

### Form Data Structures

Reuse existing input types:

- `CreateIndividualSinglesMatchInput`
- `CreateIndividualDoublesMatchInput`

### Default Values

```typescript
// Singles defaults
const singlesDefaults = {
  matchDate: teamMatch.matchDate.split('T')[0],
  teamMatchId: teamMatch.id,
  order: singlesMatches.length + 1,
  score: '',
  winner: null,
  player1Id: '',
  player2Id: '',
};

// Doubles defaults
const doublesDefaults = {
  matchDate: teamMatch.matchDate.split('T')[0],
  teamMatchId: teamMatch.id,
  order: doublesMatches.length + 1,
  score: '',
  winner: null,
  team1Player1Id: '',
  team1Player2Id: '',
  team2Player1Id: '',
  team2Player2Id: '',
};
```

## Error Handling

### Validation Rules

- All player fields required
- Players cannot be duplicated within same match
- Match date required
- Match order must be positive integer
- Winner selection required

### Error Display

- Form-level error messages for validation failures
- Network error handling with user-friendly messages
- Loading states during form submission
- Prevent double submission

### Error Recovery

- Form remains open on validation errors
- User can correct errors and resubmit
- Cancel button clears form and closes
- Network errors allow retry

## Testing Strategy

### Unit Tests

1. **BatchMatchEditor Component Tests**
   - Renders "+" buttons in both tabs
   - Opens correct form type when buttons clicked
   - Passes correct props to form component
   - Handles form success/cancel callbacks

2. **IndividualMatchForm Component Tests**
   - Pre-populates form with team match data
   - Filters players correctly by team
   - Validates form inputs properly
   - Submits correct mutation data
   - Handles success/error states

3. **Integration Tests**
   - Complete flow from button click to match creation
   - Form data persistence during tab switches
   - Proper refresh after successful creation
   - Error handling throughout the flow

### GraphQL Mutation Tests

- Verify correct mutation variables sent
- Test success response handling
- Test error response handling
- Validate data refresh after creation

## Implementation Approach

### Phase 1: Extract Form Component

1. Extract form logic from IndividualMatchList into reusable component
2. Create IndividualMatchForm with proper props interface
3. Update IndividualMatchList to use extracted component
4. Ensure no regression in existing functionality

### Phase 2: Modify BatchMatchEditor

1. Add "+" buttons to Singles and Doubles tabs
2. Add form state management
3. Integrate IndividualMatchForm component
4. Implement team-based player filtering
5. Add form success/cancel handlers

### Phase 3: Integration and Testing

1. Update TeamMatchList to pass additional props
2. Test complete user flow
3. Add error handling and loading states
4. Implement accessibility features
5. Add comprehensive test coverage

## User Experience Considerations

### Visual Design

- "+" buttons styled consistently with existing UI
- Form appears inline below the matches table
- Clear visual separation between form and table
- Loading states during form submission

### Interaction Flow

1. User sees "+" button at bottom of matches list
2. Click opens form inline (no modal/popup)
3. Form pre-filled with sensible defaults
4. Clear Save/Cancel actions
5. Success returns to table view with new match visible

### Accessibility

- Proper ARIA labels for form controls
- Keyboard navigation support
- Screen reader announcements for form state changes
- Focus management when form opens/closes

### Performance

- Lazy load form component only when needed
- Efficient player filtering without unnecessary re-renders
- Optimistic UI updates where appropriate
- Proper cleanup of form state on unmount
