# Requirements Document

## Introduction

This feature enhances the Team Match detail view by adding the ability to create new individual matches (Singles and Doubles) directly from within the expanded team match view. Currently, users can only edit existing individual matches through the BatchMatchEditor component. This feature will add "+" buttons at the bottom of both the Singles and Doubles tabs that open the same form component used elsewhere in the application for creating individual matches, with pre-populated defaults from the parent team match.

## Requirements

### Requirement 1

**User Story:** As a tennis league administrator, I want to add new individual matches directly from the team match detail view, so that I can quickly create matches without navigating to separate pages.

#### Acceptance Criteria

1. WHEN viewing a team match in expanded mode THEN the BatchMatchEditor SHALL display a "+" button at the bottom of the Singles matches list
2. WHEN viewing a team match in expanded mode THEN the BatchMatchEditor SHALL display a "+" button at the bottom of the Doubles matches list
3. WHEN the "+" button is clicked THEN the system SHALL open the individual match creation form
4. WHEN the individual match creation form opens THEN the match date SHALL default to the team match date
5. WHEN the individual match creation form opens THEN the home team players SHALL be pre-populated from the team match home team
6. WHEN the individual match creation form opens THEN the away team players SHALL be pre-populated from the team match away team
7. WHEN the individual match creation form opens THEN the teamMatchId SHALL be automatically set to the current team match ID

### Requirement 2

**User Story:** As a tennis league administrator, I want the individual match creation form to use the same component as other parts of the application, so that I have a consistent user experience.

#### Acceptance Criteria

1. WHEN the "+" button is clicked THEN the system SHALL use the same form component used in IndividualMatchList
2. WHEN the form is displayed THEN it SHALL have the same validation rules as the existing individual match creation form
3. WHEN the form is displayed THEN it SHALL have the same styling and layout as the existing individual match creation form
4. WHEN a match is successfully created THEN the system SHALL refresh the team match data to show the new individual match
5. WHEN a match is successfully created THEN the system SHALL close the form and return to the BatchMatchEditor view

### Requirement 3

**User Story:** As a tennis league administrator, I want the form to be contextually aware of whether I'm creating a Singles or Doubles match, so that the appropriate form fields are displayed.

#### Acceptance Criteria

1. WHEN the "+" button is clicked in the Singles tab THEN the system SHALL open the Singles match creation form
2. WHEN the "+" button is clicked in the Doubles tab THEN the system SHALL open the Doubles match creation form
3. WHEN the Singles form is opened THEN it SHALL display fields for Player 1 and Player 2 selection
4. WHEN the Doubles form is opened THEN it SHALL display fields for Team 1 Player 1, Team 1 Player 2, Team 2 Player 1, and Team 2 Player 2 selection
5. WHEN either form is opened THEN it SHALL display fields for Match Date, Match Order, Score, and Match Winner
6. WHEN either form is opened THEN the Match Date field SHALL be pre-populated with the team match date

### Requirement 4

**User Story:** As a tennis league administrator, I want the player selection dropdowns to be filtered by the teams involved in the team match, so that I can only select players from the appropriate teams.

#### Acceptance Criteria

1. WHEN the Singles form is opened THEN Player 1 dropdown SHALL contain only players from the home team
2. WHEN the Singles form is opened THEN Player 2 dropdown SHALL contain only players from the away team
3. WHEN the Doubles form is opened THEN Team 1 Player 1 and Team 1 Player 2 dropdowns SHALL contain only players from the home team
4. WHEN the Doubles form is opened THEN Team 2 Player 1 and Team 2 Player 2 dropdowns SHALL contain only players from the away team
5. WHEN any player dropdown is opened THEN players SHALL be sorted alphabetically by name
6. WHEN a player is already selected in another dropdown THEN they SHALL still be available for selection (no exclusion logic needed)

### Requirement 5

**User Story:** As a tennis league administrator, I want proper error handling and user feedback when creating individual matches, so that I understand what went wrong if the creation fails.

#### Acceptance Criteria

1. WHEN the form submission fails due to validation errors THEN the system SHALL display appropriate error messages
2. WHEN the form submission fails due to network errors THEN the system SHALL display a user-friendly error message
3. WHEN the form is being submitted THEN the submit button SHALL show a loading state
4. WHEN the form is being submitted THEN the user SHALL not be able to submit the form multiple times
5. WHEN the user clicks Cancel THEN the form SHALL close without creating a match
6. WHEN the user clicks Cancel THEN any form data SHALL be cleared
