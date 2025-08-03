# Requirements Document

## Introduction

This specification addresses a critical bug where deleting a tennis league match incorrectly deletes all tennis match events for the involved teams, rather than just the events associated with the specific match being deleted. The solution implements direct event references in the team match model to establish proper data relationships and prevent cascading deletion bugs.

## Requirements

### Requirement 1: Database Schema Enhancement

**User Story:** As a system administrator, I want tennis league matches to have direct references to their associated events, so that the relationship between matches and events is explicit and reliable.

#### Acceptance Criteria

1. WHEN a TeamLeagueTeamMatch is created THEN it SHALL have optional foreign key references to homeTeamEventId and awayTeamEventId
2. WHEN an Event is created for a tennis match THEN it SHALL have optional reverse relations to homeTeamMatch and awayTeamMatch
3. WHEN the schema is updated THEN existing data SHALL remain intact during migration
4. WHEN foreign key constraints are added THEN they SHALL prevent orphaned event references

### Requirement 2: Transactional Match Creation

**User Story:** As a tennis league administrator, I want tennis match creation to be atomic, so that either both the match and its events are created successfully or none are created at all.

#### Acceptance Criteria

1. WHEN creating a tennis league match THEN the creation SHALL be wrapped in a database transaction
2. WHEN the transaction succeeds THEN the team match SHALL have valid references to both home and away team events
3. WHEN the transaction fails THEN no partial data SHALL be left in the database
4. WHEN events are created THEN they SHALL be immediately linked to the team match within the same transaction

### Requirement 3: Precise Match Deletion

**User Story:** As a tennis league administrator, I want to delete a specific tennis match, so that only the events associated with that match are removed and other tennis events remain untouched.

#### Acceptance Criteria

1. WHEN deleting a team match THEN only the events referenced by homeTeamEventId and awayTeamEventId SHALL be deleted
2. WHEN deleting match events THEN all associated RSVPs SHALL be deleted first to maintain referential integrity
3. WHEN a team match is deleted THEN other tennis match events for the same teams SHALL remain unaffected
4. WHEN deletion fails THEN the system SHALL provide clear error messages and maintain data consistency

### Requirement 4: Data Migration for Existing Records

**User Story:** As a system administrator, I want existing tennis matches to be properly linked to their events, so that the new deletion logic works correctly for all historical data.

#### Acceptance Criteria

1. WHEN the migration runs THEN existing TeamLeagueTeamMatch records SHALL be analyzed to find their associated events
2. WHEN matching events are found THEN the homeTeamEventId and awayTeamEventId fields SHALL be populated
3. WHEN events cannot be matched THEN the migration SHALL log warnings but continue processing
4. WHEN migration completes THEN all successfully matched records SHALL have proper event references

### Requirement 5: Backward Compatibility

**User Story:** As a developer, I want the API to remain compatible with existing clients, so that frontend applications continue to work without changes.

#### Acceptance Criteria

1. WHEN GraphQL queries are made THEN existing resolvers SHALL continue to return the same data structure
2. WHEN mutations are called THEN the API surface SHALL remain unchanged
3. WHEN new fields are added THEN they SHALL be optional and not break existing queries
4. WHEN the system is deployed THEN existing functionality SHALL work without client-side changes

### Requirement 6: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging, so that I can troubleshoot issues and ensure data integrity.

#### Acceptance Criteria

1. WHEN transaction failures occur THEN detailed error messages SHALL be logged
2. WHEN migration encounters issues THEN warnings and errors SHALL be clearly documented
3. WHEN deletion operations fail THEN the system SHALL provide specific error messages
4. WHEN data inconsistencies are detected THEN they SHALL be logged for administrative review
