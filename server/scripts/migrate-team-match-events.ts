#!/usr/bin/env ts-node

/**
 * Data Migration Script: Link Existing Team Matches to Events
 *
 * This script analyzes existing TeamLeagueTeamMatch records and attempts to
 * find their associated events using string matching logic. It then populates
 * the homeTeamEventId and awayTeamEventId fields.
 *
 * Usage: npx ts-node scripts/migrate-team-match-events.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  totalMatches: number;
  matchesWithBothEvents: number;
  matchesWithHomeEventOnly: number;
  matchesWithAwayEventOnly: number;
  matchesWithNoEvents: number;
  errors: string[];
  warnings: string[];
}

async function migrateTeamMatchEvents(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalMatches: 0,
    matchesWithBothEvents: 0,
    matchesWithHomeEventOnly: 0,
    matchesWithAwayEventOnly: 0,
    matchesWithNoEvents: 0,
    errors: [],
    warnings: [],
  };

  console.log('🚀 Starting team match event migration...');

  try {
    // Get all team matches that don't have event references yet
    const teamMatches = await prisma.teamLeagueTeamMatch.findMany({
      where: {
        AND: [{ homeTeamEventId: null }, { awayTeamEventId: null }],
      },
      include: {
        homeTeam: { include: { Group: true } },
        awayTeam: { include: { Group: true } },
      },
    });

    stats.totalMatches = teamMatches.length;
    console.log(`📊 Found ${stats.totalMatches} team matches to migrate`);

    if (stats.totalMatches === 0) {
      console.log('✅ No team matches need migration');
      return stats;
    }

    // Process each team match
    for (const teamMatch of teamMatches) {
      console.log(
        `\n🔍 Processing match: ${teamMatch.homeTeam.Group.name} vs ${teamMatch.awayTeam.Group.name}`
      );

      try {
        // Find potential events for both teams
        const homeTeamEvents = await findMatchingEvents(
          teamMatch.homeTeam.Group.id,
          teamMatch.homeTeam.Group.name,
          teamMatch.awayTeam.Group.name,
          teamMatch.matchDate
        );

        const awayTeamEvents = await findMatchingEvents(
          teamMatch.awayTeam.Group.id,
          teamMatch.awayTeam.Group.name,
          teamMatch.homeTeam.Group.name,
          teamMatch.matchDate
        );

        // Select the best matching events
        const homeEvent = selectBestMatchingEvent(
          homeTeamEvents,
          teamMatch.homeTeam.Group.name,
          teamMatch.awayTeam.Group.name
        );
        const awayEvent = selectBestMatchingEvent(
          awayTeamEvents,
          teamMatch.awayTeam.Group.name,
          teamMatch.homeTeam.Group.name
        );

        // Update the team match with event references
        const updateData: any = {};
        if (homeEvent) {
          updateData.homeTeamEventId = homeEvent.id;
          console.log(`  ✅ Found home team event: ${homeEvent.description.substring(0, 50)}...`);
        } else {
          stats.warnings.push(
            `No home team event found for match ${teamMatch.id}: ${teamMatch.homeTeam.Group.name} vs ${teamMatch.awayTeam.Group.name}`
          );
          console.log(`  ⚠️  No home team event found`);
        }

        if (awayEvent) {
          updateData.awayTeamEventId = awayEvent.id;
          console.log(`  ✅ Found away team event: ${awayEvent.description.substring(0, 50)}...`);
        } else {
          stats.warnings.push(
            `No away team event found for match ${teamMatch.id}: ${teamMatch.homeTeam.Group.name} vs ${teamMatch.awayTeam.Group.name}`
          );
          console.log(`  ⚠️  No away team event found`);
        }

        // Update statistics
        if (homeEvent && awayEvent) {
          stats.matchesWithBothEvents++;
        } else if (homeEvent) {
          stats.matchesWithHomeEventOnly++;
        } else if (awayEvent) {
          stats.matchesWithAwayEventOnly++;
        } else {
          stats.matchesWithNoEvents++;
        }

        // Apply the update if we found at least one event
        if (Object.keys(updateData).length > 0) {
          await prisma.teamLeagueTeamMatch.update({
            where: { id: teamMatch.id },
            data: updateData,
          });
          console.log(`  💾 Updated team match with event references`);
        }
      } catch (error) {
        const errorMsg = `Error processing match ${teamMatch.id}: ${error instanceof Error ? error.message : String(error)}`;
        stats.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = `Fatal error during migration: ${error instanceof Error ? error.message : String(error)}`;
    stats.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return stats;
}

async function findMatchingEvents(
  groupId: string,
  teamName: string,
  opponentName: string,
  matchDate: Date
): Promise<any[]> {
  // Find events for this group that contain tennis match indicators
  const events = await prisma.event.findMany({
    where: {
      groupId: groupId,
      description: {
        contains: '🎾 Tennis Match',
      },
      // Look for events within a reasonable time window (±7 days)
      date: {
        gte: new Date(matchDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        lte: new Date(matchDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Filter events that mention both teams
  return events.filter(event => {
    const description = event.description.toLowerCase();
    const teamNameLower = teamName.toLowerCase();
    const opponentNameLower = opponentName.toLowerCase();

    return description.includes(teamNameLower) && description.includes(opponentNameLower);
  });
}

function selectBestMatchingEvent(
  events: any[],
  teamName: string,
  opponentName: string
): any | null {
  if (events.length === 0) {
    return null;
  }

  if (events.length === 1) {
    return events[0];
  }

  // If multiple events, prefer the one with the most specific description
  // This is a simple heuristic - in practice, there should typically be only one match
  return events.reduce((best, current) => {
    const bestScore = calculateEventMatchScore(best, teamName, opponentName);
    const currentScore = calculateEventMatchScore(current, teamName, opponentName);
    return currentScore > bestScore ? current : best;
  });
}

function calculateEventMatchScore(event: any, teamName: string, opponentName: string): number {
  const description = event.description.toLowerCase();
  const teamNameLower = teamName.toLowerCase();
  const opponentNameLower = opponentName.toLowerCase();

  let score = 0;

  // Base score for containing tennis match indicator
  if (description.includes('🎾 tennis match')) score += 10;

  // Score for exact team name matches
  if (description.includes(teamNameLower)) score += 5;
  if (description.includes(opponentNameLower)) score += 5;

  // Bonus for containing "vs" between team names
  if (
    description.includes(`${teamNameLower} vs ${opponentNameLower}`) ||
    description.includes(`${opponentNameLower} vs ${teamNameLower}`)
  ) {
    score += 10;
  }

  return score;
}

async function printMigrationReport(stats: MigrationStats): Promise<void> {
  console.log('\n📋 Migration Report');
  console.log('==================');
  console.log(`Total matches processed: ${stats.totalMatches}`);
  console.log(`Matches with both events linked: ${stats.matchesWithBothEvents}`);
  console.log(`Matches with home event only: ${stats.matchesWithHomeEventOnly}`);
  console.log(`Matches with away event only: ${stats.matchesWithAwayEventOnly}`);
  console.log(`Matches with no events found: ${stats.matchesWithNoEvents}`);

  if (stats.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${stats.warnings.length}):`);
    stats.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  const successRate =
    stats.totalMatches > 0
      ? (
          ((stats.matchesWithBothEvents +
            stats.matchesWithHomeEventOnly +
            stats.matchesWithAwayEventOnly) /
            stats.totalMatches) *
          100
        ).toFixed(1)
      : '0';

  console.log(`\n✅ Migration completed with ${successRate}% success rate`);

  if (stats.matchesWithNoEvents > 0) {
    console.log(
      `\n💡 ${stats.matchesWithNoEvents} matches have no associated events. This may be normal if:`
    );
    console.log('   - The matches were created but events were deleted manually');
    console.log('   - The matches are from before event creation was implemented');
    console.log('   - The event descriptions have been modified');
  }
}

// Main execution
async function main() {
  try {
    const stats = await migrateTeamMatchEvents();
    await printMigrationReport(stats);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Migration completed with errors. Please review the error log above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main();
}

export { MigrationStats, migrateTeamMatchEvents };
