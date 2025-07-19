import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './pubsub';

const EVENTS = {
  MESSAGE_ADDED: 'MESSAGE_ADDED',
  EVENT_CREATED: 'EVENT_CREATED',
  RSVP_UPDATED: 'RSVP_UPDATED',
  MEMBER_JOINED: 'MEMBER_JOINED',
} as const;

interface Context {
  prisma: PrismaClient;
  user?: any;
}

// Helper function to check if user is admin of a group
async function requireGroupAdmin(context: Context, groupId: string): Promise<void> {
  const user = requireAuth(context);
  const membership = await context.prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });
  if (!membership || !membership.isAdmin) {
    throw new GraphQLError('You must be an admin of this group', { extensions: { code: 'FORBIDDEN' } });
  }
}

// Helper function to check if user is member of a group
async function requireGroupMember(context: Context, groupId: string): Promise<void> {
  const user = requireAuth(context);
  const membership = await context.prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });
  if (!membership) {
    throw new GraphQLError('You must be a member of this group', { extensions: { code: 'FORBIDDEN' } });
  }
}

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

function publishMemberJoined(membership: any) {
  pubsub.publish(EVENTS.MEMBER_JOINED, { memberJoined: membership });
}

// TENNIS MODULE RESOLVERS
const tennisResolvers = {
  Query: {
    tennisLeagues: async (_: any, __: any, context: Context) => {
      try {
        console.log('tennisLeagues resolver called');
        const leagues = await context.prisma.teamLeague.findMany();
        console.log('tennisLeagues result:', leagues);
        return Array.isArray(leagues) ? leagues : [];
      } catch (error) {
        console.error('Error in tennisLeagues resolver:', error);
        return [];
      }
    },
    tennisLeague: async (_: any, { id }: { id: string }, context: Context) => {
      return context.prisma.teamLeague.findUnique({
        where: { id },
        include: {
          pointSystems: true,
          teams: {
            include: {
              captain: true,
              Group: true,
            },
          },
          teamMatches: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
          // Removed: individualSinglesMatches, individualDoublesMatches
        },
      });
    },
    tennisLeagueStandings: async (_: any, { id }: { id: string }, context: Context) => {
      const league = await context.prisma.teamLeague.findUnique({
        where: { id },
        include: {
          teams: { include: { Group: true } },
          teamMatches: {
            include: {
              homeTeam: true,
              awayTeam: true,
              singlesMatches: true,
              doublesMatches: true,
            },
          },
          pointSystems: true,
        },
      });

      if (!league || !league.teams || !league.teamMatches || !league.pointSystems) {
        throw new GraphQLError('League not found or missing data');
      }

      // Standings calculation: sum points for each team from all completed singles/doubles matches
      const teamPoints: Record<string, number> = {};
      const teamWins: Record<string, number> = {};
      const teamLosses: Record<string, number> = {};
      for (const team of league.teams) {
        teamPoints[team.id] = 0;
        teamWins[team.id] = 0;
        teamLosses[team.id] = 0;
      }
      for (const match of league.teamMatches) {
        // Singles
        for (const singles of match.singlesMatches ?? []) {
          if (!singles.winner) continue;
          const ps = league.pointSystems.find(
            (ps: any) => ps.matchType === 'SINGLES' && ps.order === singles.order
          );
          if (!ps) continue;
          const homeId = match.homeTeamId;
          const awayId = match.awayTeamId;
          if (singles.winner === 'HOME') {
            teamWins[homeId]++;
            teamLosses[awayId]++;
            if (homeId in teamPoints) teamPoints[homeId] += ps.winPoints;
          } else if (singles.winner === 'AWAY') {
            teamWins[awayId]++;
            teamLosses[homeId]++;
            if (awayId in teamPoints) teamPoints[awayId] += ps.winPoints;
          }
        }
        // Doubles
        for (const doubles of match.doublesMatches ?? []) {
          if (!doubles.winner) continue;
          const ps = league.pointSystems.find(
            (ps: any) => ps.matchType === 'DOUBLES' && ps.order === doubles.order
          );
          if (!ps) continue;
          const homeId = match.homeTeamId;
          const awayId = match.awayTeamId;
          if (doubles.winner === 'HOME') {
            teamWins[homeId]++;
            teamLosses[awayId]++;
            if (homeId in teamPoints) teamPoints[homeId] += ps.winPoints;
          } else if (doubles.winner === 'AWAY') {
            teamWins[awayId]++;
            teamLosses[homeId]++;
            if (awayId in teamPoints) teamPoints[awayId] += ps.winPoints;
          }
        }
      }
      const standings = league.teams.map((team: any) => ({
        teamId: team.id,
        teamName: team.Group.name,
        matchesPlayed: league.teamMatches.filter(
          (m: any) => m.homeTeamId === team.id || m.awayTeamId === team.id
        ).length,
        wins: teamWins[team.id],
        losses: teamLosses[team.id],
        draws: 0,
        points: teamPoints[team.id],
        gamesWon: 0,
        gamesLost: 0,
      }));
      standings.sort((a: { points: number }, b: { points: number }) => b.points - a.points);
      return standings;
    },
    userTennisLeagues: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      const currentDate = new Date();

      // Find all teams where the user is a member of the team's group
      const userTeams = await context.prisma.teamLeagueTeam.findMany({
        where: {
          Group: {
            memberships: {
              some: {
                userId: user.id
              }
            }
          }
        },
        include: {
          teamLeague: true
        }
      });

      // Extract unique leagues from the teams
      const leagueIds = [...new Set(userTeams.map(team => team.teamLeagueId))];

      // Get the full league data, filtering for active leagues within date range
      const leagues = await context.prisma.teamLeague.findMany({
        where: {
          id: {
            in: leagueIds
          },
          isActive: true,
          startDate: {
            lte: currentDate
          },
          endDate: {
            gte: currentDate
          }
        }
      });

      return leagues;
    },
  },
  Mutation: {
    createTennisLeague: async (_: any, { input, pointSystems }: any, context: Context) => {
      requireAuth(context);

      const league = await context.prisma.teamLeague.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          isActive: input.isActive ?? true,
        },
      });

      // Create point systems if provided
      if (Array.isArray(pointSystems) && pointSystems.length > 0) {
        // Validate order/winPoints
        for (const matchType of ['SINGLES', 'DOUBLES']) {
          const systems = pointSystems.filter(ps => ps.matchType === matchType).sort((a, b) => a.order - b.order);
          for (let i = 1; i < systems.length; ++i) {
            if (systems[i].winPoints > systems[i - 1].winPoints) {
              throw new GraphQLError(`For matchType ${matchType}, lower order must have higher or equal winPoints`);
            }
          }
        }
        await context.prisma.teamLeaguePointSystem.createMany({
          data: pointSystems.map(ps => ({
            teamLeagueId: league.id,
            matchType: ps.matchType,
            order: ps.order,
            winPoints: ps.winPoints,
            lossPoints: ps.lossPoints ?? 0,
            drawPoints: ps.drawPoints ?? 0,
            defaultWinPoints: 3,
            defaultLossPoints: 0,
            defaultDrawPoints: 0,
          })),
        });
      }
      return league;
    },
    updateTennisLeague: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
      if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      return context.prisma.teamLeague.update({
        where: { id },
        data: updateData,
        include: {
          pointSystems: true,
          teams: {
            include: {
              captain: true,
              Group: true,
            },
          },
          teamMatches: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
          // Removed: individualSinglesMatches, individualDoublesMatches
        },
      });
    },
    deleteTennisLeague: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      // Delete all related data
      // No need to delete singles/doubles matches by teamLeagueId, handled by cascading from team matches
      await context.prisma.teamLeagueTeamMatch.deleteMany({ where: { teamLeagueId: id } });
      await context.prisma.teamLeagueTeam.deleteMany({ where: { teamLeagueId: id } });
      await context.prisma.teamLeaguePointSystem.deleteMany({ where: { teamLeagueId: id } });
      await context.prisma.teamLeague.delete({ where: { id } });

      return true;
    },
    createTennisTeam: async (_: any, { leagueId, input }: any, context: Context) => {
      requireAuth(context);

      const team = await context.prisma.teamLeagueTeam.create({
        data: {
          groupId: input.groupId,
          captainId: input.captainId,
          teamLeagueId: leagueId,
        },
        include: {
          captain: true,
          Group: true,
        },
      });

      return team;
    },
    updateTennisTeam: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);

      const updateData: any = {};
      if (input.groupId !== undefined) updateData.groupId = input.groupId;
      if (input.captainId !== undefined) updateData.captainId = input.captainId;

      return context.prisma.teamLeagueTeam.update({
        where: { id },
        data: updateData,
        include: {
          captain: true,
          Group: true,
        },
      });
    },
    deleteTennisTeam: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      await context.prisma.teamLeagueTeam.delete({ where: { id } });
      return true;
    },
    createTeamMatch: async (_: any, { leagueId, input }: any, context: Context) => {
      requireAuth(context);

      // Get the teams with their groups to create events
      const homeTeam = await context.prisma.teamLeagueTeam.findUnique({
        where: { id: input.homeTeamId },
        include: { Group: true }
      });

      const awayTeam = await context.prisma.teamLeagueTeam.findUnique({
        where: { id: input.awayTeamId },
        include: { Group: true }
      });

      if (!homeTeam || !awayTeam) {
        throw new GraphQLError('One or both teams not found');
      }

      // Create the team match
      const teamMatch = await context.prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          matchDate: new Date(input.matchDate),
          teamLeagueId: leagueId,
        },
        include: {
          homeTeam: {
            include: { Group: true }
          },
          awayTeam: {
            include: { Group: true }
          },
        },
      });

      // Create events for both teams' groups
      const matchDate = new Date(input.matchDate);

      // Create event for home team's group
      const homeEventDescription = `🎾 Tennis Match: ${homeTeam.Group.name} vs ${awayTeam.Group.name}\n\nHome match for ${homeTeam.Group.name}. Please RSVP your availability.`;

      const homeEvent = await context.prisma.event.create({
        data: {
          groupId: homeTeam.Group.id,
          createdById: context.user.id,
          date: matchDate,
          description: homeEventDescription,
        },
        include: { createdBy: true, group: true },
      });

      // Create event for away team's group
      const awayEventDescription = `🎾 Tennis Match: ${awayTeam.Group.name} vs ${homeTeam.Group.name}\n\nAway match against ${homeTeam.Group.name}. Please RSVP your availability.`;

      const awayEvent = await context.prisma.event.create({
        data: {
          groupId: awayTeam.Group.id,
          createdById: context.user.id,
          date: matchDate,
          description: awayEventDescription,
        },
        include: { createdBy: true, group: true },
      });

      // Publish events for real-time updates
      pubsub.publish(EVENTS.EVENT_CREATED, { eventCreated: homeEvent });
      pubsub.publish(EVENTS.EVENT_CREATED, { eventCreated: awayEvent });

      return teamMatch;
    },
    updateTeamMatch: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);

      // Get the current team match to find associated events
      const currentMatch = await context.prisma.teamLeagueTeamMatch.findUnique({
        where: { id },
        include: {
          homeTeam: { include: { Group: true } },
          awayTeam: { include: { Group: true } }
        }
      });

      if (!currentMatch) {
        throw new GraphQLError('Team match not found');
      }

      const updateData: any = {};
      if (input.homeTeamId !== undefined) updateData.homeTeamId = input.homeTeamId;
      if (input.awayTeamId !== undefined) updateData.awayTeamId = input.awayTeamId;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);

      const updatedMatch = await context.prisma.teamLeagueTeamMatch.update({
        where: { id },
        data: updateData,
        include: {
          homeTeam: {
            include: { Group: true }
          },
          awayTeam: {
            include: { Group: true }
          },
        },
      });

      // Update associated events if date changed
      if (input.matchDate !== undefined) {
        const newMatchDate = new Date(input.matchDate);

        // Find and update events for both teams
        const events = await context.prisma.event.findMany({
          where: {
            OR: [
              { groupId: currentMatch.homeTeam.Group.id },
              { groupId: currentMatch.awayTeam.Group.id }
            ],
            description: {
              contains: '🎾 Tennis Match'
            }
          }
        });

        // Update events that match this team match
        for (const event of events) {
          if (event.description.includes(currentMatch.homeTeam.Group.name) &&
            event.description.includes(currentMatch.awayTeam.Group.name)) {
            await context.prisma.event.update({
              where: { id: event.id },
              data: { date: newMatchDate }
            });
          }
        }
      }

      return updatedMatch;
    },
    deleteTeamMatch: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      // Get the team match to find associated events
      const teamMatch = await context.prisma.teamLeagueTeamMatch.findUnique({
        where: { id },
        include: {
          homeTeam: { include: { Group: true } },
          awayTeam: { include: { Group: true } }
        }
      });

      if (!teamMatch) {
        throw new GraphQLError('Team match not found');
      }

      // Find and delete associated events for both teams
      const events = await context.prisma.event.findMany({
        where: {
          OR: [
            { groupId: teamMatch.homeTeam.Group.id },
            { groupId: teamMatch.awayTeam.Group.id }
          ],
          description: {
            contains: '🎾 Tennis Match'
          }
        }
      });

      // Delete events that match this team match
      for (const event of events) {
        if (event.description.includes(teamMatch.homeTeam.Group.name) &&
          event.description.includes(teamMatch.awayTeam.Group.name)) {
          // Delete all RSVPs for this event first
          await context.prisma.rSVP.deleteMany({ where: { eventId: event.id } });
          // Delete the event
          await context.prisma.event.delete({ where: { id: event.id } });
        }
      }

      // Delete the team match
      await context.prisma.teamLeagueTeamMatch.delete({ where: { id } });
      return true;
    },
    createIndividualSinglesMatch: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);
      if (input.score !== undefined && input.score !== null && input.score !== '' && !isValidTennisScore(input.score)) {
        throw new GraphQLError('Invalid tennis score format');
      }
      return context.prisma.teamLeagueIndividualSinglesMatch.create({
        data: {
          player1Id: input.player1Id,
          player2Id: input.player2Id,
          matchDate: new Date(input.matchDate),
          teamMatchId: input.teamMatchId,
          order: input.order,
          score: input.score ?? '',
          winner: input.winner ?? null,
        },
        include: {
          player1: true,
          player2: true,
          teamMatch: true,
        },
      });
    },
    updateIndividualSinglesMatch: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);
      if (input.score !== undefined && !isValidTennisScore(input.score)) {
        throw new GraphQLError('Invalid tennis score format');
      }
      const updateData: any = {};
      if (input.player1Id !== undefined) updateData.player1Id = input.player1Id;
      if (input.player2Id !== undefined) updateData.player2Id = input.player2Id;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);
      if (input.teamMatchId !== undefined) updateData.teamMatchId = input.teamMatchId;
      if (input.order !== undefined) updateData.order = input.order;
      if (input.score !== undefined) updateData.score = input.score;
      if (input.winner !== undefined) updateData.winner = input.winner;
      return context.prisma.teamLeagueIndividualSinglesMatch.update({
        where: { id },
        data: updateData,
        include: {
          player1: true,
          player2: true,
          teamMatch: true,
        },
      });
    },
    deleteIndividualSinglesMatch: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);
      await context.prisma.teamLeagueIndividualSinglesMatch.delete({ where: { id } });
      return true;
    },
    createIndividualDoublesMatch: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);
      if (input.score !== undefined && input.score !== null && input.score !== '' && !isValidTennisScore(input.score)) {
        throw new GraphQLError('Invalid tennis score format');
      }
      return context.prisma.teamLeagueIndividualDoublesMatch.create({
        data: {
          team1Player1Id: input.team1Player1Id,
          team1Player2Id: input.team1Player2Id,
          team2Player1Id: input.team2Player1Id,
          team2Player2Id: input.team2Player2Id,
          matchDate: new Date(input.matchDate),
          teamMatchId: input.teamMatchId,
          order: input.order,
          score: input.score ?? '',
          winner: input.winner ?? null,
        },
        include: {
          team1Player1: true,
          team1Player2: true,
          team2Player1: true,
          team2Player2: true,
          teamMatch: true,
        },
      });
    },
    updateIndividualDoublesMatch: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);
      if (input.score !== undefined && !isValidTennisScore(input.score)) {
        throw new GraphQLError('Invalid tennis score format');
      }
      const updateData: any = {};
      if (input.team1Player1Id !== undefined) updateData.team1Player1Id = input.team1Player1Id;
      if (input.team1Player2Id !== undefined) updateData.team1Player2Id = input.team1Player2Id;
      if (input.team2Player1Id !== undefined) updateData.team2Player1Id = input.team2Player1Id;
      if (input.team2Player2Id !== undefined) updateData.team2Player2Id = input.team2Player2Id;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);
      if (input.teamMatchId !== undefined) updateData.teamMatchId = input.teamMatchId;
      if (input.order !== undefined) updateData.order = input.order;
      if (input.score !== undefined) updateData.score = input.score;
      if (input.winner !== undefined) updateData.winner = input.winner;
      return context.prisma.teamLeagueIndividualDoublesMatch.update({
        where: { id },
        data: updateData,
        include: {
          team1Player1: true,
          team1Player2: true,
          team2Player1: true,
          team2Player2: true,
          teamMatch: true,
        },
      });
    },
    deleteIndividualDoublesMatch: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);
      await context.prisma.teamLeagueIndividualDoublesMatch.delete({ where: { id } });
      return true;
    },
    updatePointSystem: async (_: any, { leagueId, input }: any, context: Context) => {
      requireAuth(context);

      const updateData: any = {};
      if (input.winPoints !== undefined) updateData.winPoints = input.winPoints;
      if (input.lossPoints !== undefined) updateData.lossPoints = input.lossPoints;
      if (input.drawPoints !== undefined) updateData.drawPoints = input.drawPoints;
      if (input.defaultWinPoints !== undefined) updateData.defaultWinPoints = input.defaultWinPoints;
      if (input.defaultLossPoints !== undefined) updateData.defaultLossPoints = input.defaultLossPoints;
      if (input.defaultDrawPoints !== undefined) updateData.defaultDrawPoints = input.defaultDrawPoints;

      // Use the compound unique key for update
      if (!input.matchType || input.order === undefined) {
        throw new Error('matchType and order are required to update a point system entry');
      }

      return context.prisma.teamLeaguePointSystem.update({
        where: {
          teamLeagueId_matchType_order: {
            teamLeagueId: leagueId,
            matchType: input.matchType,
            order: input.order,
          },
        },
        data: updateData,
      });
    },
  },
  TeamLeague: {
    pointSystems: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeaguePointSystem.findMany({
        where: { teamLeagueId: parent.id },
        orderBy: [{ matchType: 'asc' }, { order: 'asc' }],
      }),
    teams: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueTeam.findMany({
        where: { teamLeagueId: parent.id },
        include: { captain: true, Group: true },
      }),
    teamMatches: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueTeamMatch.findMany({
        where: { teamLeagueId: parent.id },
        include: {
          homeTeam: {
            include: {
              captain: true,
              Group: true,
            },
          },
          awayTeam: {
            include: {
              captain: true,
              Group: true,
            },
          },
          singlesMatches: true,
          doublesMatches: true,
        },
      }),
    // Removed: individualSinglesMatches and individualDoublesMatches
  },
  TeamLeagueTeam: {
    captain: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.captainId } }),
    members: async (parent: any, _: any, context: Context) => {
      // Get the group for this team
      const group = await context.prisma.group.findUnique({
        where: { id: parent.groupId },
        include: { memberships: { include: { user: true } } },
      });
      return group ? group.memberships.map((m: any) => m.user) : [];
    },
    group: (parent: any, _: any, context: Context) =>
      context.prisma.group.findUnique({ where: { id: parent.groupId } }),
  },
  TeamLeagueTeamMatch: {
    homeTeam: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueTeam.findUnique({ where: { id: parent.homeTeamId } }),
    awayTeam: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueTeam.findUnique({ where: { id: parent.awayTeamId } }),
    individualSinglesMatches: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueIndividualSinglesMatch.findMany({
        where: { teamMatchId: parent.id },
        include: { player1: true, player2: true },
      }),
    individualDoublesMatches: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeagueIndividualDoublesMatch.findMany({
        where: { teamMatchId: parent.id },
        include: {
          team1Player1: true,
          team1Player2: true,
          team2Player1: true,
          team2Player2: true,
        },
      }),
    associatedEvents: async (parent: any, _: any, context: Context) => {
      // Get the team match with team details to find associated events
      const teamMatch = await context.prisma.teamLeagueTeamMatch.findUnique({
        where: { id: parent.id },
        include: {
          homeTeam: { include: { Group: true } },
          awayTeam: { include: { Group: true } }
        }
      });

      if (!teamMatch) return [];

      // Find events for both teams that match this team match
      const events = await context.prisma.event.findMany({
        where: {
          OR: [
            { groupId: teamMatch.homeTeam.Group.id },
            { groupId: teamMatch.awayTeam.Group.id }
          ],
          description: {
            contains: '🎾 Tennis Match'
          }
        },
        include: { group: true, createdBy: true, rsvps: { include: { user: true } } }
      });

      // Filter events that match this specific team match
      return events.filter(event =>
        event.description.includes(teamMatch.homeTeam.Group.name) &&
        event.description.includes(teamMatch.awayTeam.Group.name)
      );
    },
  },
  TeamLeagueIndividualSinglesMatch: {
    player1: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.player1Id } }),
    player2: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.player2Id } }),
  },
  TeamLeagueIndividualDoublesMatch: {
    team1Player1: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.team1Player1Id } }),
    team1Player2: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.team1Player2Id } }),
    team2Player1: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.team2Player1Id } }),
    team2Player2: (parent: any, _: any, context: Context) =>
      context.prisma.user.findUnique({ where: { id: parent.team2Player2Id } }),
  },
};

// Tennis score validation helper
function isValidTennisScore(score: string): boolean {
  // Accepts scores like "6-4", "6-4 0-6 7-6", "7-6(5) 6-7(3) 7-5", etc.
  // Each set: number-number, optional (tiebreak)
  const set = /([0-7])-([0-7])(\([0-9]+\))?/;
  const pattern = new RegExp(`^${set.source}( ${set.source})*$`);
  return pattern.test(score.trim());
}

export const resolvers = {
  Query: {
    health: () => 'OK',

    // User queries
    me: (_: any, __: any, context: Context) => {
      return context.user;
    },

    user: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.prisma.user.findUnique({ where: { id } });
    },

    userSearch: async (_: any, { query }: { query: string }, context: Context) => {
      requireAuth(context);

      // Search by username or email containing the query
      return await context.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10, // Limit results
        orderBy: { username: 'asc' },
      });
    },

    // Group queries
    groups: async (_: any, __: any, context: Context) => {
      return await context.prisma.group.findMany();
    },

    group: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.prisma.group.findUnique({ where: { id } });
    },

    myGroups: async (_: any, __: any, context: Context) => {
      const memberships = await context.prisma.membership.findMany({
        where: { userId: requireAuth(context).id },
        include: { group: true },
      });
      return memberships.map(m => m.group);
    },

    publicGroups: async (_: any, args: { query?: string }, context: Context) => {
      const user = requireAuth(context);
      const where: any = { isPublic: true };
      if (args.query) {
        where.OR = [
          { name: { contains: args.query, mode: 'insensitive' } },
          { description: { contains: args.query, mode: 'insensitive' } }
        ];
      }
      return await context.prisma.group.findMany({
        where,
        orderBy: { name: 'asc' },
        take: 10,
      });
    },

    // Event queries
    events: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      await requireGroupMember(context, groupId);
      return await context.prisma.event.findMany({
        where: { groupId },
        include: {
          createdBy: true,
          rsvps: {
            include: {
              user: true
            }
          }
        },
      });
    },

    event: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.prisma.event.findUnique({
        where: { id },
        include: {
          createdBy: true,
          rsvps: {
            include: {
              user: true
            }
          }
        },
      });
    },

    userPendingEvents: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      const currentDate = new Date();

      // Get all groups the user is a member of
      const userMemberships = await context.prisma.membership.findMany({
        where: { userId: user.id },
        include: { group: true }
      });

      const userGroupIds = userMemberships.map(m => m.groupId);

      // Get all events from user's groups that haven't expired yet
      const events = await context.prisma.event.findMany({
        where: {
          groupId: { in: userGroupIds },
          date: { gte: currentDate }
        },
        include: {
          group: true,
          createdBy: true,
          rsvps: {
            include: { user: true }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Return all unexpired events (user can revise any RSVP)
      return events;
    },

    // Message queries
    messages: async (_: any, { groupId, limit }: { groupId: string; limit: number }, context: Context) => {
      await requireGroupMember(context, groupId);
      return await context.prisma.message.findMany({
        where: { groupId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    },

    // Tennis queries - merge from tennisResolvers
    ...tennisResolvers.Query,
  },

  Mutation: {
    // Group mutations
    createGroup: async (_: any, { input }: { input: { name: string; description?: string; isPublic?: boolean } }, context: Context) => {
      const user = requireAuth(context);

      const group = await context.prisma.group.create({
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic || false,
          memberships: {
            create: {
              userId: user.id,
              isAdmin: true,
              memberId: 1, // First member gets ID 1
            },
          },
        },
      });

      return group;
    },

    updateGroup: async (_: any, { id, input }: { id: string; input: { name?: string; description?: string; isPublic?: boolean } }, context: Context) => {
      await requireGroupAdmin(context, id);

      const updatedGroup = await context.prisma.group.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        },
      });

      return updatedGroup;
    },

    joinGroup: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if already a member
      const memberships = await context.prisma.membership.findMany({
        where: { userId: user.id },
        include: { group: true },
      });
      if (memberships.some(m => m.groupId === groupId)) {
        throw new GraphQLError('You are already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if group is public or user is being added by admin
      const group = await context.prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new GraphQLError('Group not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (!group.isPublic) {
        throw new GraphQLError('This group is not public', { extensions: { code: 'FORBIDDEN' } });
      }

      // Get the next member ID for this group
      const maxMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const nextMemberId = (maxMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId: nextMemberId,
        },
        include: { user: true, group: true },
      });

      publishMemberJoined(membership);
      return membership.group;
    },

    leaveGroup: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('You are not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (membership.isAdmin) {
        // Check if this is the last admin
        const adminCount = await context.prisma.membership.count({
          where: { groupId, isAdmin: true },
        });

        if (adminCount <= 1) {
          throw new GraphQLError('Cannot leave group: you are the last admin. Transfer admin role or delete the group.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
      }

      await context.prisma.membership.delete({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      return true;
    },

    addMember: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user is already a member
      const existing = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (existing) {
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get the next member ID for this group
      const maxMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const nextMemberId = (maxMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId,
          groupId,
          memberId: nextMemberId,
        },
        include: { user: true, group: true },
      });

      publishMemberJoined(membership);
      return membership;
    },

    addMemberByUsername: async (_: any, { groupId, username }: { groupId: string; username: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const user = await context.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is already a member
      const existing = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existing) {
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get the next member ID for this group
      const maxMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const nextMemberId = (maxMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId: nextMemberId,
        },
        include: { user: true, group: true },
      });

      publishMemberJoined(membership);
      return membership;
    },

    addMemberByEmail: async (_: any, { groupId, email }: { groupId: string; email: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is already a member
      const existing = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existing) {
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get the next member ID for this group
      const maxMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const nextMemberId = (maxMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId: nextMemberId,
        },
        include: { user: true, group: true },
      });

      publishMemberJoined(membership);
      return membership;
    },

    removeMember: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('User is not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (membership.isAdmin) {
        throw new GraphQLError('Cannot remove an admin. Remove admin role first.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      await context.prisma.membership.delete({
        where: { userId_groupId: { userId, groupId } },
      });

      return true;
    },

    makeAdmin: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('User is not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const updatedMembership = await context.prisma.membership.update({
        where: { userId_groupId: { userId, groupId } },
        data: { isAdmin: true },
        include: { user: true, group: true },
      });

      return updatedMembership;
    },

    removeAdmin: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('User is not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (!membership.isAdmin) {
        throw new GraphQLError('User is not an admin', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if this is the last admin
      const adminCount = await context.prisma.membership.count({
        where: { groupId, isAdmin: true },
      });

      if (adminCount <= 1) {
        throw new GraphQLError('Cannot remove the last admin', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const updatedMembership = await context.prisma.membership.update({
        where: { userId_groupId: { userId, groupId } },
        data: { isAdmin: false },
        include: { user: true, group: true },
      });

      return updatedMembership;
    },

    blockUser: async (_: any, { input }: { input: { groupId: string; userId: string; reason?: string } }, context: Context) => {
      await requireGroupAdmin(context, input.groupId);

      // Check if user is already blocked
      const existing = await context.prisma.blockedUser.findUnique({
        where: { userId_groupId: { userId: input.userId, groupId: input.groupId } },
      });

      if (existing) {
        throw new GraphQLError('User is already blocked from this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const blockedUser = await context.prisma.blockedUser.create({
        data: {
          userId: input.userId,
          groupId: input.groupId,
          blockedById: context.user!.id,
          reason: input.reason,
        },
        include: { user: true, blockedBy: true, group: true },
      });

      return true;
    },

    unblockUser: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const blockedUser = await context.prisma.blockedUser.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!blockedUser) {
        throw new GraphQLError('User is not blocked from this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      await context.prisma.blockedUser.delete({
        where: { userId_groupId: { userId, groupId } },
      });

      return true;
    },

    // Event mutations
    createEvent: async (_: any, { input }: { input: { groupId: string; date: string; description: string } }, context: Context) => {
      const user = requireAuth(context);
      await requireGroupMember(context, input.groupId);

      const event = await context.prisma.event.create({
        data: {
          groupId: input.groupId,
          createdById: user.id,
          date: new Date(input.date),
          description: input.description,
        },
        include: { createdBy: true, group: true },
      });

      pubsub.publish(EVENTS.EVENT_CREATED, { eventCreated: event });
      return event;
    },

    updateEvent: async (_: any, { id, input }: { id: string; input: { groupId: string; date: string; description: string } }, context: Context) => {
      const user = requireAuth(context);

      const event = await context.prisma.event.findUnique({
        where: { id },
        include: { group: true },
      });

      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Only creator or group admin can update
      if (event.createdById !== user.id) {
        await requireGroupAdmin(context, event.groupId);
      }

      const updatedEvent = await context.prisma.event.update({
        where: { id },
        data: {
          groupId: input.groupId,
          date: new Date(input.date),
          description: input.description,
        },
        include: { createdBy: true, group: true },
      });

      return updatedEvent;
    },

    deleteEvent: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const event = await context.prisma.event.findUnique({
        where: { id },
        include: { group: true },
      });

      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Only creator or group admin can delete
      if (event.createdById !== user.id) {
        await requireGroupAdmin(context, event.groupId);
      }

      // Delete all RSVPs for this event
      await context.prisma.rSVP.deleteMany({ where: { eventId: id } });
      // Delete the event
      await context.prisma.event.delete({ where: { id } });
      return true;
    },

    deleteGroup: async (_: any, { id }: { id: string }, context: Context) => {
      await requireGroupAdmin(context, id);

      // Delete all RSVPs for all events in the group
      const events = await context.prisma.event.findMany({ where: { groupId: id } });
      const eventIds = events.map(e => e.id);
      if (eventIds.length > 0) {
        await context.prisma.rSVP.deleteMany({ where: { eventId: { in: eventIds } } });
      }
      // Delete all events
      await context.prisma.event.deleteMany({ where: { groupId: id } });
      // Delete all messages
      await context.prisma.message.deleteMany({ where: { groupId: id } });
      // Delete all memberships
      await context.prisma.membership.deleteMany({ where: { groupId: id } });
      // Delete all blocked users
      await context.prisma.blockedUser.deleteMany({ where: { groupId: id } });
      // Delete all team matches
      await context.prisma.teamLeagueTeamMatch.deleteMany({ where: { teamLeagueId: id } });
      // Delete the group
      await context.prisma.group.delete({ where: { id } });
      return true;
    },

    createRSVP: async (_: any, { input }: { input: { eventId: string; status: string; note?: string } }, context: Context) => {
      const user = requireAuth(context);

      const event = await context.prisma.event.findUnique({
        where: { id: input.eventId },
        include: { group: true },
      });

      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is a member of the group
      await requireGroupMember(context, event.groupId);

      const rsvp = await context.prisma.rSVP.upsert({
        where: { eventId_userId: { eventId: input.eventId, userId: user.id } },
        update: {
          status: input.status as any,
          note: input.note,
        },
        create: {
          eventId: input.eventId,
          userId: user.id,
          status: input.status as any,
          note: input.note,
        },
        include: { event: true, user: true },
      });

      pubsub.publish(EVENTS.RSVP_UPDATED, { rsvpUpdated: rsvp });
      return rsvp;
    },

    updateRSVP: async (_: any, { id, status, note }: { id: string; status: string; note?: string }, context: Context) => {
      const user = requireAuth(context);

      const rsvp = await context.prisma.rSVP.findUnique({
        where: { id },
        include: { event: true },
      });

      if (!rsvp) {
        throw new GraphQLError('RSVP not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (rsvp.userId !== user.id) {
        throw new GraphQLError('You can only update your own RSVP', { extensions: { code: 'FORBIDDEN' } });
      }

      const updatedRSVP = await context.prisma.rSVP.update({
        where: { id },
        data: {
          status: status as any,
          note,
        },
        include: { event: true, user: true },
      });

      pubsub.publish(EVENTS.RSVP_UPDATED, { rsvpUpdated: updatedRSVP });
      return updatedRSVP;
    },

    deleteRSVP: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const rsvp = await context.prisma.rSVP.findUnique({
        where: { id },
      });

      if (!rsvp) {
        throw new GraphQLError('RSVP not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (rsvp.userId !== user.id) {
        throw new GraphQLError('You can only delete your own RSVP', { extensions: { code: 'FORBIDDEN' } });
      }

      await context.prisma.rSVP.delete({ where: { id } });
      return true;
    },

    // Message mutations
    sendMessage: async (_: any, { input }: { input: { groupId: string; content: string } }, context: Context) => {
      const user = requireAuth(context);
      await requireGroupMember(context, input.groupId);

      const message = await context.prisma.message.create({
        data: {
          groupId: input.groupId,
          userId: user.id,
          content: input.content,
        },
        include: { user: true, group: true },
      });

      pubsub.publish(EVENTS.MESSAGE_ADDED, { messageAdded: message });
      return message;
    },

    // User mutations
    updateProfile: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);

      const updatedUser = await context.prisma.user.update({
        where: { id: user.id },
        data: input,
      });

      return updatedUser;
    },

    deleteUser: async (_: any, { userId }: { userId: string }, context: Context) => {
      const user = requireAuth(context);

      // For now, users can only delete themselves
      if (user.id !== userId) {
        throw new GraphQLError('You can only delete your own account', { extensions: { code: 'FORBIDDEN' } });
      }

      await context.prisma.user.delete({
        where: { id: userId },
      });

      return true;
    },

    // Tennis mutations - merge from tennisResolvers
    ...tennisResolvers.Mutation,
    createTeamLeaguePointSystem: async (_: any, { leagueId, input }: any, context: Context) => {
      requireAuth(context);
      // Validate: for this leagueId and matchType, order must not have winPoints greater than any lower order
      const existing = await context.prisma.teamLeaguePointSystem.findMany({
        where: { teamLeagueId: leagueId, matchType: input.matchType },
        orderBy: { order: 'asc' },
      });
      for (let i = 0; i < existing.length; ++i) {
        if (existing[i].order < input.order && existing[i].winPoints < input.winPoints) {
          throw new GraphQLError('Lower order must have higher or equal winPoints');
        }
        if (existing[i].order > input.order && existing[i].winPoints > input.winPoints) {
          throw new GraphQLError('Lower order must have higher or equal winPoints');
        }
      }
      return context.prisma.teamLeaguePointSystem.create({
        data: {
          teamLeagueId: leagueId,
          matchType: input.matchType,
          order: input.order,
          winPoints: input.winPoints,
          lossPoints: input.lossPoints ?? 0,
          drawPoints: input.drawPoints ?? 0,
          defaultWinPoints: 3,
          defaultLossPoints: 0,
          defaultDrawPoints: 0,
        },
      });
    },
    updateTeamLeaguePointSystem: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);
      const current = await context.prisma.teamLeaguePointSystem.findUnique({ where: { id } });
      if (!current) throw new GraphQLError('Point system not found');
      const matchType = input.matchType ?? current.matchType;
      const order = input.order ?? current.order;
      const winPoints = input.winPoints ?? current.winPoints;
      // Validate
      const siblings = await context.prisma.teamLeaguePointSystem.findMany({
        where: { teamLeagueId: current.teamLeagueId, matchType },
        orderBy: { order: 'asc' },
      });
      for (let i = 0; i < siblings.length; ++i) {
        if (siblings[i].id === id) continue;
        if (siblings[i].order < order && siblings[i].winPoints < winPoints) {
          throw new GraphQLError('Lower order must have higher or equal winPoints');
        }
        if (siblings[i].order > order && siblings[i].winPoints > winPoints) {
          throw new GraphQLError('Lower order must have higher or equal winPoints');
        }
      }
      return context.prisma.teamLeaguePointSystem.update({
        where: { id },
        data: {
          matchType,
          order,
          winPoints,
          lossPoints: input.lossPoints ?? current.lossPoints,
          drawPoints: input.drawPoints ?? current.drawPoints,
        },
      });
    },
    deleteTeamLeaguePointSystem: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);
      await context.prisma.teamLeaguePointSystem.delete({ where: { id } });
      return true;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.MESSAGE_ADDED]),
        (payload: any, variables: any) => {
          console.log('Subscription filter:', {
            payloadGroupId: payload.messageAdded.groupId,
            variablesGroupId: variables.groupId,
          });
          return payload.messageAdded.groupId === variables.groupId;
        }
      ),
    },
    eventCreated: {
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.EVENT_CREATED]),
    },
    rsvpUpdated: {
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.RSVP_UPDATED]),
    },
    memberJoined: {
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.MEMBER_JOINED]),
    },
  },

  // Field resolvers for nested data
  Group: {
    memberships: async (parent: any, _: any, context: Context) => {
      return await context.prisma.membership.findMany({
        where: { groupId: parent.id },
        include: { user: true },
      });
    },
    members: async (parent: any, _: any, context: Context) => {
      // Alias for memberships, for frontend compatibility
      return await context.prisma.membership.findMany({
        where: { groupId: parent.id },
        include: { user: true },
      });
    },
    events: async (parent: any, _: any, context: Context) => {
      return await context.prisma.event.findMany({
        where: { groupId: parent.id },
        include: { createdBy: true },
      });
    },
    messages: async (parent: any, _: any, context: Context) => {
      return await context.prisma.message.findMany({
        where: { groupId: parent.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: true },
      });
    },
    blockedUsers: async (parent: any, _: any, context: Context) => {
      return await context.prisma.blockedUser.findMany({
        where: { groupId: parent.id },
        include: { user: true, blockedBy: true },
      });
    },
  },

  Membership: {
    role: (parent: any) => {
      return parent.isAdmin ? 'ADMIN' : 'MEMBER';
    },
  },

  // Tennis field resolvers - merge from tennisResolvers (excluding Query and Mutation)
  TeamLeague: tennisResolvers.TeamLeague,
  TeamLeagueTeam: tennisResolvers.TeamLeagueTeam,
  TeamLeagueTeamMatch: tennisResolvers.TeamLeagueTeamMatch,
  TeamLeagueIndividualSinglesMatch: tennisResolvers.TeamLeagueIndividualSinglesMatch,
  TeamLeagueIndividualDoublesMatch: tennisResolvers.TeamLeagueIndividualDoublesMatch,
};


