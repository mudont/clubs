# Implementation Plan

- [x] 1. Update Prisma schema with event references
  - Add homeTeamEventId and awayTeamEventId fields to TeamLeagueTeamMatch model
  - Add bidirectional relations between TeamLeagueTeamMatch and Event models
  - Generate and apply database migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create data migration script for existing records
  - Write script to analyze existing TeamLeagueTeamMatch records
  - Implement string matching logic to find associated events
  - Add comprehensive logging for matched and unmatched records
  - Test migration script with development data
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Update createTeamMatch resolver with transaction logic
  - Wrap match creation in database transaction
  - Create team match, home event, and away event atomically
  - Update team match with event references within transaction
  - Add comprehensive error handling and rollback logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Update deleteTeamMatch resolver with precise deletion
  - Replace string matching with direct event reference lookup
  - Delete RSVPs and events using specific IDs from team match
  - Wrap deletion operations in transaction for consistency
  - Add detailed error messages for debugging
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Add comprehensive error handling and logging
  - Implement transaction failure logging with full error details
  - Add migration warning and error documentation
  - Create specific error messages for deletion failures
  - Add data consistency detection and logging
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Create unit tests for new functionality
  - Test transaction rollback scenarios in createTeamMatch
  - Test precise deletion logic in deleteTeamMatch
  - Test migration script with various data scenarios
  - Test error handling for all failure modes
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 7. Run data migration on existing database
  - Execute migration script on development database
  - Verify all existing matches have proper event references
  - Document any unmatched records for manual review
  - Test new deletion logic with migrated data
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Validate backward compatibility and API consistency
  - Test existing GraphQL queries return same data structure
  - Verify mutations work without client-side changes
  - Ensure new fields are optional and don't break existing queries
  - Test that existing functionality works after deployment
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
