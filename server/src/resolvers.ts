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

    publicGroups: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);

      // Get groups that are public and user is not a member of and not blocked from
      const publicGroups = await context.prisma.group.findMany({
        where: {
          isPublic: true,
          AND: [
            {
              memberships: {
                none: {
                  userId: user.id
                }
              }
            },
            {
              blockedUsers: {
                none: {
                  userId: user.id
                }
              }
            }
          ]
        },
        include: {
          memberships: {
            include: {
              user: true
            }
          }
        }
      });

      return publicGroups;
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

    joinGroup: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if already a member
      const existing = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existing) {
        throw new GraphQLError('You are already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is blocked from this group
      const blocked = await context.prisma.blockedUser.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (blocked) {
        throw new GraphQLError('You are blocked from joining this group', { extensions: { code: 'FORBIDDEN' } });
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

      // Get next member ID
      const lastMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const memberId = (lastMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId,
          isAdmin: false,
        },
        include: { user: true, group: true },
      });

      // Publish member joined event
      publishMemberJoined(membership);

      return membership;
    },

    leaveGroup: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is a member
      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('You are not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if this would leave the group without admins
      if (membership.isAdmin) {
        const adminCount = await context.prisma.membership.count({
          where: { groupId, isAdmin: true },
        });
        if (adminCount <= 1) {
          throw new GraphQLError('Cannot leave group as the last admin', { extensions: { code: 'FORBIDDEN' } });
        }
      }

      await context.prisma.membership.delete({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      return true;
    },

    addMember: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user exists
      const user = await context.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get next member ID
      const lastMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const memberId = (lastMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId,
          groupId,
          memberId,
          isAdmin: false,
        },
        include: { user: true, group: true },
      });

      return membership;
    },

    addMemberByUsername: async (_: any, { groupId, username }: { groupId: string; username: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user exists
      const user = await context.prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is already a member
      const existingMembership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existingMembership) {
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get next member ID
      const lastMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const memberId = (lastMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId,
          isAdmin: false,
        },
        include: { user: true, group: true },
      });

      // Publish member joined event
      publishMemberJoined(membership);

      return membership;
    },

    addMemberByEmail: async (_: any, { groupId, email }: { groupId: string; email: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user exists
      const user = await context.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is already a member
      const existingMembership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existingMembership) {
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get next member ID
      const lastMember = await context.prisma.membership.findFirst({
        where: { groupId },
        orderBy: { memberId: 'desc' },
      });

      const memberId = (lastMember?.memberId || 0) + 1;

      const membership = await context.prisma.membership.create({
        data: {
          userId: user.id,
          groupId,
          memberId,
          isAdmin: false,
        },
        include: { user: true, group: true },
      });

      // Publish member joined event
      publishMemberJoined(membership);

      return membership;
    },

    removeMember: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user is a member
      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!membership) {
        throw new GraphQLError('User is not a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Cannot remove the last admin
      if (membership.isAdmin) {
        const adminCount = await context.prisma.membership.count({
          where: { groupId, isAdmin: true },
        });
        if (adminCount <= 1) {
          throw new GraphQLError('Cannot remove the last admin', { extensions: { code: 'FORBIDDEN' } });
        }
      }

      await context.prisma.membership.delete({
        where: { userId_groupId: { userId, groupId } },
      });

      return true;
    },

    makeAdmin: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      const membership = await context.prisma.membership.update({
        where: { userId_groupId: { userId, groupId } },
        data: { isAdmin: true },
        include: { user: true, group: true },
      });

      return membership;
    },

    removeAdmin: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user is an admin
      const membership = await context.prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!membership || !membership.isAdmin) {
        throw new GraphQLError('User is not an admin of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if this would leave the group without admins
      const adminCount = await context.prisma.membership.count({
        where: { groupId, isAdmin: true },
      });
      if (adminCount <= 1) {
        throw new GraphQLError('Cannot remove the last admin', { extensions: { code: 'FORBIDDEN' } });
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

      // Check if user exists
      const user = await context.prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is already blocked
      const existingBlock = await context.prisma.blockedUser.findUnique({
        where: { userId_groupId: { userId: input.userId, groupId: input.groupId } },
      });

      if (existingBlock) {
        throw new GraphQLError('User is already blocked from this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Remove user from group if they are a member
      await context.prisma.membership.deleteMany({
        where: { userId: input.userId, groupId: input.groupId },
      });

      // Block the user
      await context.prisma.blockedUser.create({
        data: {
          userId: input.userId,
          groupId: input.groupId,
          blockedById: context.user!.id,
          reason: input.reason,
        },
      });

      return true;
    },

    unblockUser: async (_: any, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      await requireGroupAdmin(context, groupId);

      // Check if user is blocked
      const blockedUser = await context.prisma.blockedUser.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!blockedUser) {
        throw new GraphQLError('User is not blocked from this group', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Remove the block
      await context.prisma.blockedUser.delete({
        where: { userId_groupId: { userId, groupId } },
      });

      return true;
    },

    // Event mutations
    createEvent: async (_: any, { input }: { input: { groupId: string; date: Date; description: string } }, context: Context) => {
      const user = requireAuth(context);
      await requireGroupAdmin(context, input.groupId);

      const event = await context.prisma.event.create({
        data: {
          groupId: input.groupId,
          createdById: user.id,
          date: input.date,
          description: input.description,
        },
        include: { createdBy: true, group: true },
      });

      pubsub.publish(EVENTS.EVENT_CREATED, { eventCreated: event });
      return event;
    },

    updateEvent: async (_: any, { id, input }: { id: string; input: { groupId: string; date: Date; description: string } }, context: Context) => {
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
          date: input.date,
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

      await context.prisma.event.delete({ where: { id } });
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
};


