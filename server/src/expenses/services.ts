import { PaymentMethod, PrismaClient, SettlementStatus, SplitType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  receiptUrl?: string;
  splitType: SplitType;
  splits: ExpenseSplitInput[];
}

export interface ExpenseSplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface DebtSummary {
  user: { id: string; username: string; firstName?: string | null; lastName?: string | null };
  totalOwed: number;
  totalOwedTo: number;
  netAmount: number;
  debts: DebtDetail[];
}

export interface DebtDetail {
  toUser: { id: string; username: string; firstName?: string | null; lastName?: string | null };
  amount: number;
  currency: string;
}

export class ExpensesService {
  /**
   * Create a new expense with splits
   */
  async createExpense(input: CreateExpenseInput, paidByUserId: string) {
    // Validate total splits equal expense amount
    const totalSplit = input.splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    if (Math.abs(totalSplit - input.amount) > 0.01) {
      throw new Error('Split amounts must equal expense amount');
    }

    // Check if user is member of the group
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: paidByUserId,
          groupId: input.groupId,
        },
      },
    });

    if (!membership) {
      throw new Error('User is not a member of this group');
    }

    // Create expense and splits in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          groupId: input.groupId,
          paidBy: paidByUserId,
          description: input.description,
          amount: new Decimal(input.amount),
          currency: input.currency,
          category: input.category,
          date: input.date,
          receiptUrl: input.receiptUrl,
          splitType: input.splitType,
          splits: {
            create: input.splits.map((split) => ({
              userId: split.userId,
              amount: new Decimal(split.amount || 0),
              percentage: split.percentage ? new Decimal(split.percentage) : null,
              shares: split.shares || 1,
            })),
          },
        },
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
      });

      // Auto-generate settlements if enabled
      const settings = await tx.groupSettings.findUnique({
        where: { groupId: input.groupId },
      });

      if (settings?.autoSettle) {
        await this.generateOptimalSettlements(input.groupId, tx);
      }

      return expense;
    });

    return expense;
  }

  /**
   * Get expenses for a group
   */
  async getGroupExpenses(groupId: string, limit: number = 50) {
    return prisma.expense.findMany({
      where: { groupId },
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
      take: limit,
    });
  }

  /**
   * Get a single expense by ID
   */
  async getExpense(id: string) {
    return prisma.expense.findUnique({
      where: { id },
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
    });
  }

  /**
   * Update an expense
   */
  async updateExpense(id: string, input: Partial<CreateExpenseInput>, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { splits: true },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if user can edit this expense (paid by them or is admin)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: expense.groupId,
        },
      },
    });

    if (!membership || (expense.paidBy !== userId && !membership.isAdmin)) {
      throw new Error('Not authorized to edit this expense');
    }

    const updateData: any = {};
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount !== undefined) updateData.amount = new Decimal(input.amount);
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;
    if (input.splitType !== undefined) updateData.splitType = input.splitType;

    return prisma.$transaction(async (tx) => {
      // Update expense
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: updateData,
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
      });

      // Update splits if provided
      if (input.splits) {
        // Delete existing splits
        await tx.expenseSplit.deleteMany({
          where: { expenseId: id },
        });

        // Create new splits
        await tx.expenseSplit.createMany({
          data: input.splits.map((split) => ({
            expenseId: id,
            userId: split.userId,
            amount: new Decimal(split.amount || 0),
            percentage: split.percentage ? new Decimal(split.percentage) : null,
            shares: split.shares || 1,
          })),
        });
      }

      return updatedExpense;
    });
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if user can delete this expense (paid by them or is admin)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: expense.groupId,
        },
      },
    });

    if (!membership || (expense.paidBy !== userId && !membership.isAdmin)) {
      throw new Error('Not authorized to delete this expense');
    }

    await prisma.expense.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Calculate debts for a group
   */
  async calculateDebts(groupId: string): Promise<Map<string, Map<string, number>>> {
    const expenses = await prisma.expense.findMany({
      where: { groupId },
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
      },
    });

    const debts = new Map<string, Map<string, number>>();

    for (const expense of expenses) {
      const paidBy = expense.paidByUser.id;

      for (const split of expense.splits) {
        const userId = split.user.id;
        if (userId === paidBy) continue;

        // Initialize debt tracking
        if (!debts.has(userId)) debts.set(userId, new Map());
        if (!debts.has(paidBy)) debts.set(paidBy, new Map());

        // Track debt from user to paidBy
        const userDebts = debts.get(userId)!;
        const currentDebt = userDebts.get(paidBy) || 0;
        userDebts.set(paidBy, currentDebt + Number(split.amount));
      }
    }

    return debts;
  }

  /**
   * Get debt summary for a group
   */
  async getGroupDebtSummary(groupId: string): Promise<DebtSummary[]> {
    const debts = await this.calculateDebts(groupId);
    const members = await prisma.membership.findMany({
      where: { groupId },
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
    });

    const summaries: DebtSummary[] = [];

    for (const member of members) {
      const userId = member.user.id;
      const userDebts = debts.get(userId) || new Map();

      let totalOwed = 0;
      let totalOwedTo = 0;
      const debtDetails: DebtDetail[] = [];

      // Calculate what this user owes to others
      for (const [toUserId, amount] of userDebts) {
        totalOwed += amount;
        const toUser = members.find(m => m.user.id === toUserId)?.user;
        if (toUser) {
          debtDetails.push({
            toUser,
            amount,
            currency: 'USD', // TODO: support multiple currencies
          });
        }
      }

      // Calculate what others owe to this user
      for (const [otherUserId, otherDebts] of debts) {
        if (otherUserId !== userId) {
          const amountOwedToUser = otherDebts.get(userId) || 0;
          totalOwedTo += amountOwedToUser;
        }
      }

      const netAmount = totalOwedTo - totalOwed;

      summaries.push({
        user: member.user,
        totalOwed,
        totalOwedTo,
        netAmount,
        debts: debtDetails,
      });
    }

    return summaries;
  }

  /**
   * Generate optimal settlements to minimize transactions
   */
  async generateOptimalSettlements(groupId: string, tx?: any): Promise<any[]> {
    const prismaClient = tx || prisma;
    const debts = await this.calculateDebts(groupId);
    const settlements: any[] = [];

    // Calculate net amounts for each user
    const netAmounts = new Map<string, number>();
    const members = await prismaClient.membership.findMany({
      where: { groupId },
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
    });

    for (const member of members) {
      const userId = member.user.id;
      let net = 0;

      // Subtract what user owes
      const userDebts = debts.get(userId) || new Map();
      for (const [toUser, amount] of userDebts) {
        net -= amount;
      }

      // Add what others owe to user
      for (const [otherUser, otherDebts] of debts) {
        if (otherUser !== userId) {
          net += otherDebts.get(userId) || 0;
        }
      }

      netAmounts.set(userId, net);
    }

    // Generate minimal settlements
    const creditors = Array.from(netAmounts.entries())
      .filter(([_, net]) => net > 0.01)
      .sort((a, b) => b[1] - a[1]);

    const debtors = Array.from(netAmounts.entries())
      .filter(([_, net]) => net < -0.01)
      .sort((a, b) => a[1] - b[1]);

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const [creditorId, creditorAmount] = creditors[creditorIndex];
      const [debtorId, debtorAmount] = debtors[debtorIndex];

      const settlementAmount = Math.min(creditorAmount, Math.abs(debtorAmount));

      if (settlementAmount > 0.01) {
        const settlement = await prismaClient.settlement.create({
          data: {
            groupId,
            fromUserId: debtorId,
            toUserId: creditorId,
            amount: new Decimal(settlementAmount),
            currency: 'USD', // TODO: get from group settings
            status: SettlementStatus.PENDING,
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
        });

        settlements.push(settlement);
      }

      // Update remaining amounts
      creditors[creditorIndex][1] -= settlementAmount;
      debtors[debtorIndex][1] += settlementAmount;

      if (creditors[creditorIndex][1] < 0.01) creditorIndex++;
      if (debtors[debtorIndex][1] > -0.01) debtorIndex++;
    }

    return settlements;
  }

  /**
   * Create a settlement
   */
  async createSettlement(input: CreateSettlementInput, userId: string) {
    // Check if user is member of the group
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: input.groupId,
        },
      },
    });

    if (!membership) {
      throw new Error('User is not a member of this group');
    }

    return prisma.settlement.create({
      data: {
        groupId: input.groupId,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        amount: new Decimal(input.amount),
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        status: SettlementStatus.PENDING,
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
    });
  }

  /**
   * Mark a settlement as paid
   */
  async markSettlementPaid(id: string, paymentMethod: PaymentMethod, notes?: string, userId?: string) {
    const settlement = await prisma.settlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      throw new Error('Settlement not found');
    }

    // Check if user can mark this settlement as paid
    if (userId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: settlement.groupId,
          },
        },
      });

      if (!membership) {
        throw new Error('User is not a member of this group');
      }
    }

    return prisma.settlement.update({
      where: { id },
      data: {
        status: SettlementStatus.PAID,
        paymentMethod,
        notes,
        paidAt: new Date(),
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
    });
  }

  /**
   * Get group settlements
   */
  async getGroupSettlements(groupId: string) {
    return prisma.settlement.findMany({
      where: { groupId },
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
  }

  /**
   * Get or create group settings
   */
  async getGroupSettings(groupId: string) {
    let settings = await prisma.groupSettings.findUnique({
      where: { groupId },
    });

    if (!settings) {
      settings = await prisma.groupSettings.create({
        data: {
          groupId,
          defaultCurrency: 'USD',
          allowExpenses: true,
          requireApproval: false,
          autoSettle: false,
        },
      });
    }

    return settings;
  }

  /**
   * Update group settings
   */
  async updateGroupSettings(groupId: string, input: any) {
    return prisma.groupSettings.upsert({
      where: { groupId },
      update: input,
      create: {
        groupId,
        ...input,
      },
    });
  }
}
