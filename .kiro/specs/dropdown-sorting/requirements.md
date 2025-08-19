# Requirements Document

## Introduction

This feature addresses the need to improve user experience by ensuring all dropdown components in the frontend display their options in a sorted order by item text. Currently, several dropdown components display options in an unsorted manner, making it difficult for users to quickly find and select the desired option, especially in dropdowns with many items.

## Requirements

### Requirement 1

**User Story:** As a user creating or editing tennis team matches, I want the team selection dropdowns to be sorted alphabetically by team name, so that I can quickly find and select the correct teams.

#### Acceptance Criteria

1. WHEN viewing the "Home Team" dropdown in the team match creation form THEN the system SHALL display team options sorted alphabetically by group name
2. WHEN viewing the "Away Team" dropdown in the team match creation form THEN the system SHALL display team options sorted alphabetically by group name
3. WHEN editing an existing team match THEN the system SHALL display team options sorted alphabetically by group name in both dropdowns

### Requirement 2

**User Story:** As a user managing group expenses, I want the "Paid By" dropdown to be sorted alphabetically by member name, so that I can quickly find the person who paid for the expense.

#### Acceptance Criteria

1. WHEN creating a new expense THEN the system SHALL display group members in the "Paid By" dropdown sorted alphabetically by full name (firstName lastName)
2. WHEN editing an existing expense THEN the system SHALL display group members in the "Paid By" dropdown sorted alphabetically by full name (firstName lastName)
3. IF a member has no firstName or lastName THEN the system SHALL sort by username as fallback

### Requirement 3

**User Story:** As a user creating or editing expenses, I want the expense categories dropdown to be sorted alphabetically, so that I can quickly find the appropriate category for my expense.

#### Acceptance Criteria

1. WHEN viewing the expense category dropdown THEN the system SHALL display categories sorted alphabetically
2. WHEN creating a new expense THEN the system SHALL maintain alphabetical sorting of categories
3. WHEN editing an existing expense THEN the system SHALL maintain alphabetical sorting of categories

### Requirement 4

**User Story:** As a user in the autocomplete components, I want search results to be sorted alphabetically, so that I can easily scan through the results to find what I'm looking for.

#### Acceptance Criteria

1. WHEN using the UserAutocomplete component THEN the system SHALL display search results sorted alphabetically by display name (firstName lastName or username)
2. WHEN using the GroupAutocomplete component THEN the system SHALL display search results sorted alphabetically by group name
3. WHEN search results are returned THEN the system SHALL maintain consistent sorting regardless of the search query

### Requirement 5

**User Story:** As a user managing expense settlements, I want the payment method dropdown to be sorted in a logical order, so that I can quickly select the appropriate payment method.

#### Acceptance Criteria

1. WHEN viewing the payment method dropdown in settlement forms THEN the system SHALL display payment methods in a logical sorted order
2. WHEN creating a settlement THEN the system SHALL maintain consistent ordering of payment methods
3. WHEN the payment method labels are displayed THEN the system SHALL sort by the display label text

### Requirement 6

**User Story:** As a user working with tennis match results, I want the result type dropdown to maintain its current logical order, so that the most common options appear first.

#### Acceptance Criteria

1. WHEN viewing the result type dropdown in BatchMatchEditor THEN the system SHALL maintain the current predefined order (Completed, Timed Match, Default, None)
2. WHEN editing match results THEN the system SHALL preserve the logical ordering that prioritizes common result types
3. WHEN displaying winner options THEN the system SHALL maintain the current order (Select, Home, Away) as it follows a logical progression

### Requirement 7

**User Story:** As a user creating individual tennis matches, I want player selection dropdowns to be sorted alphabetically by player name, so that I can quickly find and select the correct players.

#### Acceptance Criteria

1. WHEN creating singles matches THEN the system SHALL display players in both Player 1 and Player 2 dropdowns sorted alphabetically by display name (firstName lastName or username)
2. WHEN creating doubles matches THEN the system SHALL display players in all four player position dropdowns sorted alphabetically by display name
3. WHEN viewing player options in IndividualMatchList THEN the system SHALL maintain consistent alphabetical sorting across all player dropdowns

### Requirement 8

**User Story:** As a user managing tennis league matches, I want team member dropdowns to be sorted alphabetically by player name, so that I can efficiently assign players to match positions.

#### Acceptance Criteria

1. WHEN selecting players for singles matches in LeagueDetail THEN the system SHALL display home and away team members sorted alphabetically by display name
2. WHEN selecting players for doubles matches in LeagueDetail THEN the system SHALL display team members sorted alphabetically in all four player position dropdowns
3. IF a player has no firstName or lastName THEN the system SHALL sort by username as fallback

### Requirement 9

**User Story:** As a user working with split types in expense forms, I want the split type dropdown to maintain its current logical order, so that the most common split methods appear first.

#### Acceptance Criteria

1. WHEN viewing the split type dropdown THEN the system SHALL maintain the current predefined order (Equal, Percentage, Custom, Shares)
2. WHEN creating or editing expenses THEN the system SHALL preserve the logical ordering that prioritizes common split types
3. WHEN displaying split options THEN the system SHALL maintain consistency across all expense forms
