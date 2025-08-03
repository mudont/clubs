# Design Document

## Overview

This design implements direct event references in the TeamLeagueTeamMatch model to fix the cascading deletion bug. The solution establishes explicit foreign key relationships between tennis matches and their associated events, enabling precise deletion operations and preventing unintended data loss.

## Architecture

### Database Schema Changes

The core architectural change involves adding bidirectional references between TeamLeagueTeamMatch and Event models:

```prisma
model TeamLeagueTeamMatch {
  // ... existing fields
  homeTeamEventId String? @unique @map("home_team_event_id")
  awayTeamEventId String? @unique @map("away_team_event_id")

  homeTeamEvent   Event? @relation("HomeTeamEvent", fields: [homeTeamEventId], references: [id])
  awayTeamEvent   Event? @relation("AwayTeamEvent", fields: [awayTeamEventId], references: [id])
}

model Event {
  // ... existing fields
  homeTeamMatch   TeamLeagueTeamMatch? @relation("HomeTeamEvent")
  awayTeamMatch   TeamLeagueTeamMatch? @relation("AwayTeamEvent")
}
```

### Transaction Flow

All tennis match operations will use database transactions to ensure atomicity:

1. **Creation Transaction:**
   - Begin transaction
   - Create TeamLeagueTeamMatch record
   - Create home team Event
   - Create away team Event
   - Update TeamLeagueTeamMatch with event references
   - Commit transaction

2. **Deletion Transaction:**
   - Begin transaction
   - Fetch TeamLeagueTeamMatch with event references
   - Delete RSVPs for home team event
   - Delete home team event
   - Delete RSVPs for away team event
   - Delete away team event
   - Delete TeamLeagueTeamMatch
   - Commit transaction

## Components and Interfaces

### Modified GraphQL Resolvers

#### createTeamMatch Resolver

- **Input:** Existing CreateTeamMatchInput
- **Output:** TeamLeagueTeamMatch with populated event references
- **Behavior:** Creates match and events in a single transaction
- **Error Handling:** Rolls back entire transaction on any failure

#### deleteTeamMatch Resolver

- **Input:** Team match ID
- **Output:** Boolean success indicator
- **Behavior:** Deletes only the specific events referenced by the match
- **Error Handling:** Provides detailed error messages for debugging

### Migration Script

- **Purpose:** Link existing matches to their events
- **Strategy:** String matching with fallback logging
- **Safety:** Non-destructive operation with comprehensive logging

## Data Models

### Enhanced TeamLeagueTeamMatch

```typescript
interface TeamLeagueTeamMatch {
  // ... existing fields
  homeTeamEventId?: string;
  awayTeamEventId?: string;
  homeTeamEvent?: Event;
  awayTeamEvent?: Event;
}
```

### Event Model Additions

```typescript
interface Event {
  // ... existing fields
  homeTeamMatch?: TeamLeagueTeamMatch;
  awayTeamMatch?: TeamLeagueTeamMatch;
}
```

## Error Handling

### Transaction Failures

- **Database Errors:** Log full error details and roll back transaction
- **Validation Errors:** Return user-friendly messages
- **Constraint Violations:** Handle gracefully with specific error messages

### Migration Issues

- **Unmatched Events:** Log warnings but continue processing
- **Data Inconsistencies:** Document for manual review
- **Performance Issues:** Process in batches if needed

### Runtime Errors

- **Missing References:** Handle null event references gracefully
- **Orphaned Data:** Detect and log for cleanup
- **Concurrent Modifications:** Use appropriate locking strategies

## Testing Strategy

### Unit Tests

- **Transaction Logic:** Test rollback scenarios
- **Event Matching:** Verify correct event association
- **Error Handling:** Test all failure modes
- **Migration Logic:** Test with various data scenarios

### Integration Tests

- **End-to-End Flows:** Test complete creation and deletion cycles
- **Database Constraints:** Verify foreign key enforcement
- **GraphQL API:** Test resolver behavior with new schema
- **Migration Process:** Test with realistic data sets

### Performance Tests

- **Transaction Overhead:** Measure impact of transactional operations
- **Query Performance:** Ensure new relationships don't degrade performance
- **Migration Speed:** Test with large datasets

## Security Considerations

### Data Integrity

- **Foreign Key Constraints:** Prevent orphaned references
- **Transaction Isolation:** Ensure concurrent operations don't interfere
- **Validation:** Verify event ownership before deletion

### Access Control

- **Authorization:** Maintain existing permission checks
- **Audit Logging:** Track all match and event operations
- **Data Privacy:** Ensure no sensitive data exposure in error messages

## Performance Optimization

### Database Indexes

- **Event References:** Index homeTeamEventId and awayTeamEventId
- **Query Optimization:** Ensure efficient joins for event lookups
- **Migration Performance:** Use batch processing for large datasets

### Caching Strategy

- **Event Data:** Cache frequently accessed event information
- **Match Data:** Maintain existing caching patterns
- **Invalidation:** Clear caches on match/event modifications

## Deployment Strategy

### Migration Steps

1. **Schema Update:** Add new columns as nullable
2. **Data Migration:** Run script to populate event references
3. **Code Deployment:** Deploy new resolver logic
4. **Validation:** Verify all existing matches have proper references
5. **Monitoring:** Watch for any data inconsistencies

### Rollback Plan

- **Schema Rollback:** Remove new columns if needed
- **Data Restoration:** Restore from backup if migration fails
- **Code Rollback:** Revert to string-matching logic if necessary

### Monitoring

- **Error Rates:** Monitor transaction failure rates
- **Performance Metrics:** Track query performance impact
- **Data Consistency:** Regular checks for orphaned data
