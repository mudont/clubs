import { PrismaClient, User, RSVPStatus } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { pubsub, EVENTS, publishMessageAdded, publishEventCreated, publishRSVPUpdated, publishMemberJoined } from './pubsub';
import { withFilter } from 'graphql-subscriptions';

const prisma = new PrismaClient();

interface Context {
    prisma: PrismaClient;
    user: User | null;
}

// Helper function to check if user is authenticated
function requireAuth(context: Context): User {
    if (!context.user) {
        throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    return context.user;
}

// Helper function to check if user is admin of a club
async function requireClubAdmin(context: Context, clubId: string): Promise<void> {
    const user = requireAuth(context);
    const membership = await context.prisma.membership.findUnique({
        where: { userId_clubId: { userId: user.id, clubId } },
    });

    if (!membership || !membership.isAdmin) {
        throw new GraphQLError('You must be an admin of this club', { extensions: { code: 'FORBIDDEN' } });
    }
}

// Helper function to check if user is member of a club
async function requireClubMember(context: Context, clubId: string): Promise<void> {
    const user = requireAuth(context);
    const membership = await context.prisma.membership.findUnique({
        where: { userId_clubId: { userId: user.id, clubId } },
    });

    if (!membership) {
        throw new GraphQLError('You must be a member of this club', { extensions: { code: 'FORBIDDEN' } });
    }
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

        // Club queries
        clubs: async (_: any, __: any, context: Context) => {
            return await context.prisma.club.findMany();
        },

        club: async (_: any, { id }: { id: string }, context: Context) => {
            return await context.prisma.club.findUnique({ where: { id } });
        },

        myClubs: async (_: any, __: any, context: Context) => {
            const user = requireAuth(context);
            const memberships = await context.prisma.membership.findMany({
                where: { userId: user.id },
                include: { club: true },
            });
            return memberships.map(m => m.club);
        },

        // Event queries
        events: async (_: any, { clubId }: { clubId: string }, context: Context) => {
            await requireClubMember(context, clubId);
            return await context.prisma.event.findMany({
                where: { clubId },
                include: { createdBy: true, rsvps: true },
            });
        },

        event: async (_: any, { id }: { id: string }, context: Context) => {
            return await context.prisma.event.findUnique({
                where: { id },
                include: { createdBy: true, rsvps: true },
            });
        },

        // Message queries
        messages: async (_: any, { clubId, limit }: { clubId: string; limit: number }, context: Context) => {
            await requireClubMember(context, clubId);
            return await context.prisma.message.findMany({
                where: { clubId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: true },
            });
        },

        userSearch: async (_: any, { query }: { query: string }, context: Context) => {
            requireAuth(context);
            return await context.prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 10,
            });
        },
    },

    Mutation: {
        // Club mutations
        createClub: async (_: any, { input }: { input: { name: string; description?: string } }, context: Context) => {
            const user = requireAuth(context);

            const club = await context.prisma.club.create({
                data: {
                    name: input.name,
                    description: input.description,
                    memberships: {
                        create: {
                            userId: user.id,
                            isAdmin: true,
                            memberId: 1, // First member gets ID 1
                        },
                    },
                },
            });

            return club;
        },

        joinClub: async (_: any, { clubId }: { clubId: string }, context: Context) => {
            const user = requireAuth(context);

            // Check if already a member
            const existing = await context.prisma.membership.findUnique({
                where: { userId_clubId: { userId: user.id, clubId } },
            });

            if (existing) {
                throw new GraphQLError('You are already a member of this club', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            // Get next member ID
            const lastMember = await context.prisma.membership.findFirst({
                where: { clubId },
                orderBy: { memberId: 'desc' },
            });

            const memberId = (lastMember?.memberId || 0) + 1;

            const membership = await context.prisma.membership.create({
                data: {
                    userId: user.id,
                    clubId,
                    memberId,
                    isAdmin: false,
                },
                include: { user: true, club: true },
            });

            // Publish member joined event
            publishMemberJoined(membership);

            return membership;
        },

        leaveClub: async (_: any, { clubId }: { clubId: string }, context: Context) => {
            const user = requireAuth(context);

            const membership = await context.prisma.membership.findUnique({
                where: { userId_clubId: { userId: user.id, clubId } },
            });

            if (!membership) {
                throw new GraphQLError('You are not a member of this club', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            if (membership.isAdmin) {
                // Check if this is the last admin
                const adminCount = await context.prisma.membership.count({
                    where: { clubId, isAdmin: true },
                });

                if (adminCount <= 1) {
                    throw new GraphQLError('Cannot leave club as the last admin', { extensions: { code: 'FORBIDDEN' } });
                }
            }

            await context.prisma.membership.delete({
                where: { userId_clubId: { userId: user.id, clubId } },
            });

            return true;
        },

        addMember: async (_: any, { clubId, userId }: { clubId: string; userId: string }, context: Context) => {
            await requireClubAdmin(context, clubId);

            // Get next member ID
            const lastMember = await context.prisma.membership.findFirst({
                where: { clubId },
                orderBy: { memberId: 'desc' },
            });

            const memberId = (lastMember?.memberId || 0) + 1;

            const membership = await context.prisma.membership.create({
                data: {
                    userId,
                    clubId,
                    memberId,
                    isAdmin: false,
                },
                include: { user: true, club: true },
            });

            // Publish member joined event
            publishMemberJoined(membership);

            return membership;
        },

        removeMember: async (_: any, { clubId, userId }: { clubId: string; userId: string }, context: Context) => {
            await requireClubAdmin(context, clubId);

            const membership = await context.prisma.membership.findUnique({
                where: { userId_clubId: { userId, clubId } },
            });

            if (!membership) {
                throw new GraphQLError('User is not a member of this club', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            if (membership.isAdmin) {
                throw new GraphQLError('Cannot remove admin members', { extensions: { code: 'FORBIDDEN' } });
            }

            await context.prisma.membership.delete({
                where: { userId_clubId: { userId, clubId } },
            });

            return true;
        },

        makeAdmin: async (_: any, { clubId, userId }: { clubId: string; userId: string }, context: Context) => {
            await requireClubAdmin(context, clubId);

            return await context.prisma.membership.update({
                where: { userId_clubId: { userId, clubId } },
                data: { isAdmin: true },
                include: { user: true, club: true },
            });
        },

        removeAdmin: async (_: any, { clubId, userId }: { clubId: string; userId: string }, context: Context) => {
            await requireClubAdmin(context, clubId);

            const membership = await context.prisma.membership.findUnique({
                where: { userId_clubId: { userId, clubId } },
            });

            if (!membership?.isAdmin) {
                throw new GraphQLError('User is not an admin of this club', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            // Check if this is the last admin
            const adminCount = await context.prisma.membership.count({
                where: { clubId, isAdmin: true },
            });

            if (adminCount <= 1) {
                throw new GraphQLError('Cannot remove the last admin', { extensions: { code: 'FORBIDDEN' } });
            }

            return await context.prisma.membership.update({
                where: { userId_clubId: { userId, clubId } },
                data: { isAdmin: false },
                include: { user: true, club: true },
            });
        },

        // Event mutations
        createEvent: async (_: any, { input }: { input: { clubId: string; date: Date; description: string } }, context: Context) => {
            const user = requireAuth(context);
            await requireClubAdmin(context, input.clubId);

            const event = await context.prisma.event.create({
                data: {
                    clubId: input.clubId,
                    createdById: user.id,
                    date: input.date,
                    description: input.description,
                },
                include: { createdBy: true, club: true },
            });

            // Publish event created
            publishEventCreated(event);

            return event;
        },

        updateEvent: async (_: any, { id, input }: { id: string; input: { clubId: string; date: Date; description: string } }, context: Context) => {
            const user = requireAuth(context);

            const event = await context.prisma.event.findUnique({
                where: { id },
                include: { club: true },
            });

            if (!event) {
                throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            // Only creator or club admin can update
            if (event.createdById !== user.id) {
                await requireClubAdmin(context, event.clubId);
            }

            return await context.prisma.event.update({
                where: { id },
                data: {
                    date: input.date,
                    description: input.description,
                },
                include: { createdBy: true, club: true },
            });
        },

        deleteEvent: async (_: any, { id }: { id: string }, context: Context) => {
            const user = requireAuth(context);

            const event = await context.prisma.event.findUnique({
                where: { id },
                include: { club: true },
            });

            if (!event) {
                throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            // Only creator or club admin can delete
            if (event.createdById !== user.id) {
                await requireClubAdmin(context, event.clubId);
            }

            await context.prisma.event.delete({ where: { id } });
            return true;
        },

        createRSVP: async (_: any, { input }: { input: { eventId: string; status: RSVPStatus; note?: string } }, context: Context) => {
            const user = requireAuth(context);

            const event = await context.prisma.event.findUnique({
                where: { id: input.eventId },
                include: { club: true },
            });

            if (!event) {
                throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            await requireClubMember(context, event.clubId);

            // Check if RSVP already exists
            const existing = await context.prisma.rSVP.findUnique({
                where: { eventId_userId: { eventId: input.eventId, userId: user.id } },
            });

            if (existing) {
                throw new GraphQLError('You have already RSVPed to this event', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            const rsvp = await context.prisma.rSVP.create({
                data: {
                    eventId: input.eventId,
                    userId: user.id,
                    status: input.status,
                    note: input.note,
                },
                include: { event: true, user: true },
            });

            // Publish RSVP updated
            publishRSVPUpdated(rsvp);

            return rsvp;
        },

        updateRSVP: async (_: any, { id, status, note }: { id: string; status: RSVPStatus; note?: string }, context: Context) => {
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
                data: { status, note },
                include: { event: true, user: true },
            });

            // Publish RSVP updated
            publishRSVPUpdated(updatedRSVP);

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
        sendMessage: async (_: any, { input }: { input: { clubId: string; content: string } }, context: Context) => {
            const user = requireAuth(context);
            await requireClubMember(context, input.clubId);

            const message = await context.prisma.message.create({
                data: {
                    clubId: input.clubId,
                    userId: user.id,
                    content: input.content,
                },
                include: { user: true, club: true },
            });

            console.log('Publishing messageAdded for clubId:', message.clubId);
            publishMessageAdded(message);

            return message;
        },

        // User mutations
        updateProfile: async (_: any, { input }: { input: { username?: string; phone?: string; photoUrl?: string } }, context: Context) => {
            const user = requireAuth(context);

            return await context.prisma.user.update({
                where: { id: user.id },
                data: input,
            });
        },

        addMemberByUsername: async (_: any, { clubId, username }: { clubId: string; username: string }, context: Context) => {
            await requireClubAdmin(context, clubId);
            const user = await context.prisma.user.findUnique({ where: { username } });
            if (!user) throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
            // Reuse addMember logic
            // Get next member ID
            const lastMember = await context.prisma.membership.findFirst({
                where: { clubId },
                orderBy: { memberId: 'desc' },
            });
            const memberId = (lastMember?.memberId || 0) + 1;
            const membership = await context.prisma.membership.create({
                data: {
                    userId: user.id,
                    clubId,
                    memberId,
                    isAdmin: false,
                },
                include: { user: true, club: true },
            });
            publishMemberJoined(membership);
            return membership;
        },
        addMemberByEmail: async (_: any, { clubId, email }: { clubId: string; email: string }, context: Context) => {
            await requireClubAdmin(context, clubId);
            const user = await context.prisma.user.findUnique({ where: { email } });
            if (!user) throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
            // Reuse addMember logic
            // Get next member ID
            const lastMember = await context.prisma.membership.findFirst({
                where: { clubId },
                orderBy: { memberId: 'desc' },
            });
            const memberId = (lastMember?.memberId || 0) + 1;
            const membership = await context.prisma.membership.create({
                data: {
                    userId: user.id,
                    clubId,
                    memberId,
                    isAdmin: false,
                },
                include: { user: true, club: true },
            });
            publishMemberJoined(membership);
            return membership;
        },
    },

    Subscription: {
        messageAdded: {
            subscribe: withFilter(
                () => pubsub.asyncIterableIterator([EVENTS.MESSAGE_ADDED]),
                (payload, variables) => {
                    console.log('Subscription filter:', {
                        payloadClubId: payload.messageAdded.clubId,
                        variablesClubId: variables.clubId,
                    });
                    return payload.messageAdded.clubId === variables.clubId;
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
    Club: {
        memberships: async (parent: any, _: any, context: Context) => {
            return await context.prisma.membership.findMany({
                where: { clubId: parent.id },
                include: { user: true },
            });
        },
        members: async (parent: any, _: any, context: Context) => {
            // Alias for memberships, for frontend compatibility
            return await context.prisma.membership.findMany({
                where: { clubId: parent.id },
                include: { user: true },
            });
        },
        events: async (parent: any, _: any, context: Context) => {
            return await context.prisma.event.findMany({
                where: { clubId: parent.id },
                include: { createdBy: true },
            });
        },
        messages: async (parent: any, _: any, context: Context) => {
            return await context.prisma.message.findMany({
                where: { clubId: parent.id },
                include: { user: true },
            });
        },
    },

    User: {
        memberships: async (parent: any, _: any, context: Context) => {
            return await context.prisma.membership.findMany({
                where: { userId: parent.id },
                include: { club: true },
            });
        },

        messages: async (parent: any, _: any, context: Context) => {
            return await context.prisma.message.findMany({
                where: { userId: parent.id },
                include: { club: true },
            });
        },
    },

    Event: {
        rsvps: async (parent: any, _: any, context: Context) => {
            return await context.prisma.rSVP.findMany({
                where: { eventId: parent.id },
                include: { user: true },
            });
        },
    },

    Membership: {
        role: (parent: any) => (parent.isAdmin ? 'ADMIN' : 'MEMBER'),
    },
}; 