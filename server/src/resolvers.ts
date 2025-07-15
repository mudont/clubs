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
          pointSystem: true,
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
            where: { isCompleted: true },
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
          pointSystem: true,
        },
      });

      if (!league) {
        throw new GraphQLError('League not found');
      }

      const standings = await Promise.all(
        league.teams.map(async (team) => {
          let matchesPlayed = 0;
          let wins = 0;
          let losses = 0;
          let draws = 0;
          let gamesWon = 0;
          let gamesLost = 0;

          // Calculate team match statistics
          for (const match of league.teamMatches) {
            if (match.homeTeamId === team.id || match.awayTeamId === team.id) {
              matchesPlayed++;

              if (match.homeScore !== null && match.awayScore !== null) {
                const isHome = match.homeTeamId === team.id;
                const teamScore = isHome ? match.homeScore : match.awayScore;
                const opponentScore = isHome ? match.awayScore : match.homeScore;

                gamesWon += teamScore;
                gamesLost += opponentScore;

                if (teamScore > opponentScore) {
                  wins++;
                } else if (teamScore < opponentScore) {
                  losses++;
                } else {
                  draws++;
                }
              }
            }
          }

          const points = wins * (league.pointSystem?.winPoints || 3) +
            losses * (league.pointSystem?.lossPoints || 0) +
            draws * (league.pointSystem?.drawPoints || 1);

          return {
            teamId: team.id,
            teamName: team.Group.name,
            matchesPlayed,
            wins,
            losses,
            draws,
            points,
            gamesWon,
            gamesLost,
          };
        })
      );

      // Sort by points (descending), then by goal difference, then by goals scored
      return standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aGoalDiff = a.gamesWon - a.gamesLost;
        const bGoalDiff = b.gamesWon - b.gamesLost;
        if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
        return b.gamesWon - a.gamesWon;
      });
    },
  },
  Mutation: {
    createTennisLeague: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);

      const league = await context.prisma.teamLeague.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          isActive: input.isActive ?? true,
          pointSystem: {
            create: {
              winPoints: 3,
              lossPoints: 0,
              drawPoints: 1,
              defaultWinPoints: 3,
              defaultLossPoints: 0,
              defaultDrawPoints: 1,
            },
          },
        },
        include: {
          pointSystem: true,
          teams: true,
          teamMatches: true,
          // Removed: individualSinglesMatches, individualDoublesMatches
        },
      });

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
          pointSystem: true,
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

      return context.prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          matchDate: new Date(input.matchDate),
          isCompleted: input.isCompleted ?? false,
          teamLeagueId: leagueId,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });
    },
    updateTeamMatch: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);

      const updateData: any = {};
      if (input.homeTeamId !== undefined) updateData.homeTeamId = input.homeTeamId;
      if (input.awayTeamId !== undefined) updateData.awayTeamId = input.awayTeamId;
      if (input.homeScore !== undefined) updateData.homeScore = input.homeScore;
      if (input.awayScore !== undefined) updateData.awayScore = input.awayScore;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);
      if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted;

      return context.prisma.teamLeagueTeamMatch.update({
        where: { id },
        data: updateData,
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });
    },
    deleteTeamMatch: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      await context.prisma.teamLeagueTeamMatch.delete({ where: { id } });
      return true;
    },
    createIndividualSinglesMatch: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);

      return context.prisma.teamLeagueIndividualSinglesMatch.create({
        data: {
          player1Id: input.player1Id,
          player2Id: input.player2Id,
          player1Score: input.player1Score,
          player2Score: input.player2Score,
          matchDate: new Date(input.matchDate),
          isCompleted: input.isCompleted ?? false,
          teamMatchId: input.teamMatchId,
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

      const updateData: any = {};
      if (input.player1Id !== undefined) updateData.player1Id = input.player1Id;
      if (input.player2Id !== undefined) updateData.player2Id = input.player2Id;
      if (input.player1Score !== undefined) updateData.player1Score = input.player1Score;
      if (input.player2Score !== undefined) updateData.player2Score = input.player2Score;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);
      if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted;
      if (input.teamMatchId !== undefined) updateData.teamMatchId = input.teamMatchId;

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

      return context.prisma.teamLeagueIndividualDoublesMatch.create({
        data: {
          team1Player1Id: input.team1Player1Id,
          team1Player2Id: input.team1Player2Id,
          team2Player1Id: input.team2Player1Id,
          team2Player2Id: input.team2Player2Id,
          team1Score: input.team1Score,
          team2Score: input.team2Score,
          matchDate: new Date(input.matchDate),
          isCompleted: input.isCompleted ?? false,
          teamMatchId: input.teamMatchId,
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

      const updateData: any = {};
      if (input.team1Player1Id !== undefined) updateData.team1Player1Id = input.team1Player1Id;
      if (input.team1Player2Id !== undefined) updateData.team1Player2Id = input.team1Player2Id;
      if (input.team2Player1Id !== undefined) updateData.team2Player1Id = input.team2Player1Id;
      if (input.team2Player2Id !== undefined) updateData.team2Player2Id = input.team2Player2Id;
      if (input.team1Score !== undefined) updateData.team1Score = input.team1Score;
      if (input.team2Score !== undefined) updateData.team2Score = input.team2Score;
      if (input.matchDate !== undefined) updateData.matchDate = new Date(input.matchDate);
      if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted;
      if (input.teamMatchId !== undefined) updateData.teamMatchId = input.teamMatchId;

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

      return context.prisma.teamLeaguePointSystem.update({
        where: { teamLeagueId: leagueId },
        data: updateData,
      });
    },
  },
  TeamLeague: {
    pointSystem: (parent: any, _: any, context: Context) =>
      context.prisma.teamLeaguePointSystem.findUnique({ where: { teamLeagueId: parent.id } }),
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
      const user = requireAuth(context);
      const memberships = await context.prisma.membership.findMany({
        where: { userId: user.id },
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
      return membership;
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


