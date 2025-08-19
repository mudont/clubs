# Implementation Plan

- [x] 1. Extract reusable IndividualMatchForm component from IndividualMatchList
  - Create new `IndividualMatchForm.tsx` component that encapsulates the form logic from IndividualMatchList
  - Define props interface with `matchType`, `teamMatch`, `leagueId`, `onSuccess`, and `onCancel`
  - Extract form state management, validation, and submission logic
  - Include both singles and doubles form rendering based on matchType prop
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Update IndividualMatchList to use extracted form component
  - Refactor IndividualMatchList to use the new IndividualMatchForm component
  - Pass appropriate props including team match context and callbacks
  - Ensure existing functionality remains unchanged
  - Test that individual match creation still works from the original location
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Add player filtering utilities for team-based selection
  - Create utility functions `getHomeTeamPlayers` and `getAwayTeamPlayers` in tennis utils
  - Implement player filtering logic that extracts players from team match home/away teams
  - Add alphabetical sorting of filtered players using existing `sortByName` utility
  - Write unit tests for player filtering functions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Modify BatchMatchEditor to include "+" buttons and form integration
  - Add "+" buttons at the bottom of both Singles and Doubles tabs in BatchMatchEditor
  - Add state management for `showCreateForm` to track which form type is open
  - Update BatchMatchEditor props interface to include `teamMatch`, `leagueId`, and `onRefresh`
  - Implement button click handlers that set the appropriate form type
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 5. Integrate IndividualMatchForm into BatchMatchEditor
  - Conditionally render IndividualMatchForm component when `showCreateForm` is not null
  - Pass correct props including match type, team match context, and callback handlers
  - Implement `onSuccess` callback that refreshes data and closes form
  - Implement `onCancel` callback that closes form without saving
  - Position form inline below the matches table with proper styling
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 2.4, 2.5_

- [x] 6. Implement form pre-population with team match defaults
  - Modify IndividualMatchForm to pre-populate match date from team match
  - Set teamMatchId automatically from team match context
  - Calculate default match order based on existing matches count
  - Filter player dropdowns based on home/away team membership
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 4.1, 4.2, 4.3, 4.4_

- [x] 7. Update TeamMatchList to pass additional props to BatchMatchEditor
  - Modify TeamMatchList component to pass `teamMatch`, `leagueId`, and `onRefresh` props to BatchMatchEditor
  - Ensure the refetch function is properly passed as `onRefresh` callback
  - Update the expanded match view to include the new functionality
  - Test that team match data flows correctly to the form component
  - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [x] 8. Add comprehensive error handling and loading states
  - Implement form validation with appropriate error messages
  - Add loading states during form submission with disabled submit button
  - Handle GraphQL mutation errors with user-friendly error display
  - Prevent double submission during loading state
  - Add proper error recovery allowing users to retry after fixing issues
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Add accessibility features and keyboard navigation
  - Add proper ARIA labels to form controls and buttons
  - Implement keyboard navigation support for form interactions
  - Add screen reader announcements for form state changes
  - Ensure focus management when form opens and closes
  - Test with screen readers and keyboard-only navigation
  - _Requirements: 2.2, 2.3_

- [x] 10. Write comprehensive unit tests for new functionality
  - Write tests for IndividualMatchForm component covering form rendering, validation, and submission
  - Write tests for BatchMatchEditor modifications including button rendering and form integration
  - Write tests for player filtering utilities with various team configurations
  - Write integration tests covering the complete flow from button click to match creation
  - Test error handling scenarios and edge cases
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_
