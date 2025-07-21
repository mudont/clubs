import { GraphQLError } from 'graphql';
import { ExpensesService } from './services';

const expensesService = new ExpensesService();

interface Context {
  prisma: any;
  user?: any;
}

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.user;
}

export const expensesResolvers = {
  Query: {
    // Expense queries
    groupExpenses: async (_: any, { groupId, limit }: { groupId: string; limit?: number }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view expenses for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.getGroupExpenses(groupId, limit);
    },

    expense: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const expense = await expensesService.getExpense(id);
      if (!expense) {
        throw new GraphQLError('Expense not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: expense.groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view this expense', { extensions: { code: 'FORBIDDEN' } });
      }

      return expense;
    },

    userExpenses: async (_: any, { userId }: { userId: string }, context: Context) => {
      const currentUser = requireAuth(context);

      // Users can only view their own expenses or if they're admin
      if (currentUser.id !== userId) {
        if (!currentUser.isAdmin) {
          throw new GraphQLError('Not authorized to view other users\' expenses', { extensions: { code: 'FORBIDDEN' } });
        }
      }

      return context.prisma.expense.findMany({
        where: { paidBy: userId },
        include: {
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          paidByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          group: true,
        },
        orderBy: { date: 'desc' },
      });
    },

    // Settlement queries
    groupSettlements: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view settlements for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.getGroupSettlements(groupId);
    },

    userSettlements: async (_: any, { userId }: { userId: string }, context: Context) => {
      const currentUser = requireAuth(context);

      // Users can only view their own settlements or if they're admin
      if (currentUser.id !== userId) {
        if (!currentUser.isAdmin) {
          throw new GraphQLError('Not authorized to view other users\' settlements', { extensions: { code: 'FORBIDDEN' } });
        }
      }

      return context.prisma.settlement.findMany({
        where: {
          OR: [
            { fromUserId: userId },
            { toUserId: userId },
          ],
        },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          toUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          group: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    // Debt queries
    groupDebtSummary: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view debt summary for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.getGroupDebtSummary(groupId);
    },

    userDebtSummary: async (_: any, { userId, groupId }: { userId: string; groupId: string }, context: Context) => {
      const currentUser = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: currentUser.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view debt summary for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      // Users can only view their own debt summary or if they're admin
      if (currentUser.id !== userId) {
        if (!currentUser.isAdmin) {
          throw new GraphQLError('Not authorized to view other users\' debt summary', { extensions: { code: 'FORBIDDEN' } });
        }
      }

      const debtSummary = await expensesService.getGroupDebtSummary(groupId);
      return debtSummary.find(summary => summary.user.id === userId);
    },

    optimalSettlements: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view optimal settlements for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.generateOptimalSettlements(groupId);
    },

    // Settings queries
    groupSettings: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to view settings for this group', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.getGroupSettings(groupId);
    },
  },

  Mutation: {
    // Expense mutations
    createExpense: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      return expensesService.createExpense(input, user.id);
    },

    updateExpense: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const user = requireAuth(context);
      return expensesService.updateExpense(id, input, user.id);
    },

    deleteExpense: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      return expensesService.deleteExpense(id, user.id);
    },

    // Settlement mutations
    createSettlement: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      return expensesService.createSettlement(input, user.id);
    },

    updateSettlement: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const user = requireAuth(context);

      const settlement = await context.prisma.settlement.findUnique({
        where: { id },
      });

      if (!settlement) {
        throw new GraphQLError('Settlement not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check if user is member of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: settlement.groupId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not authorized to update this settlement', { extensions: { code: 'FORBIDDEN' } });
      }

      return context.prisma.settlement.update({
        where: { id },
        data: input,
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          toUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          group: true,
        },
      });
    },

    markSettlementPaid: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const user = requireAuth(context);
      return expensesService.markSettlementPaid(id, input.paymentMethod, input.notes, user.id);
    },

    deleteSettlement: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const settlement = await context.prisma.settlement.findUnique({
        where: { id },
      });

      if (!settlement) {
        throw new GraphQLError('Settlement not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check if user is member of the group and can delete
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: settlement.groupId,
          },
        },
      });

      if (!membership || (!membership.isAdmin && settlement.fromUserId !== user.id)) {
        throw new GraphQLError('Not authorized to delete this settlement', { extensions: { code: 'FORBIDDEN' } });
      }

      await context.prisma.settlement.delete({
        where: { id },
      });

      return true;
    },

    // Settings mutations
    updateGroupSettings: async (_: any, { groupId, input }: { groupId: string; input: any }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is admin of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership || !membership.isAdmin) {
        throw new GraphQLError('Only group admins can update group settings', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.updateGroupSettings(groupId, input);
    },

    // Utility mutations
    generateOptimalSettlements: async (_: any, { groupId }: { groupId: string }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is admin of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId,
          },
        },
      });

      if (!membership || !membership.isAdmin) {
        throw new GraphQLError('Only group admins can generate optimal settlements', { extensions: { code: 'FORBIDDEN' } });
      }

      return expensesService.generateOptimalSettlements(groupId);
    },

    bulkCreateSettlements: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);

      // Check if user is admin of the group
      const membership = await context.prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: input.groupId,
          },
        },
      });

      if (!membership || !membership.isAdmin) {
        throw new GraphQLError('Only group admins can bulk create settlements', { extensions: { code: 'FORBIDDEN' } });
      }

      const settlements = [];
      for (const settlementInput of input.settlements) {
        const settlement = await expensesService.createSettlement(settlementInput, user.id);
        settlements.push(settlement);
      }

      return settlements;
    },
  },
};
