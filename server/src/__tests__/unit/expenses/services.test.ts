import { Decimal } from '@prisma/client/runtime/library';
import { ExpensesService } from '../../../expenses/services';
import {
  createTestExpense,
  createTestGroup,
  createTestMembership,
  createTestUser,
} from '../../helpers/test-utils';
import { prisma } from '../../setup';

describe('ExpensesService', () => {
  let expensesService: ExpensesService;
  let testGroup: any;
  let testUser1: any;
  let testUser2: any;
  let testUser3: any;

  beforeEach(async () => {
    expensesService = new ExpensesService();

    // Create test users and group
    testUser1 = await createTestUser({ username: 'user1', email: 'user1@test.com' });
    testUser2 = await createTestUser({ username: 'user2', email: 'user2@test.com' });
    testUser3 = await createTestUser({ username: 'user3', email: 'user3@test.com' });

    testGroup = await createTestGroup({ name: 'Test Expense Group' });

    // Add users to group
    await createTestMembership(testUser1.id, testGroup.id);
    await createTestMembership(testUser2.id, testGroup.id);
    await createTestMembership(testUser3.id, testGroup.id);
  });

  describe('createExpense', () => {
    it('should create expense with equal splits', async () => {
      const expenseInput = {
        groupId: testGroup.id,
        description: 'Dinner for three',
        amount: 90,
        currency: 'USD',
        category: 'Food',
        date: new Date(),
        splitType: 'EQUAL' as const,
        splits: [
          { userId: testUser1.id, amount: 30 },
          { userId: testUser2.id, amount: 30 },
          { userId: testUser3.id, amount: 30 },
        ],
        paidBy: testUser1.id,
      };

      const expense = await expensesService.createExpense(expenseInput);

      expect(expense).toBeDefined();
      expect(expense.description).toBe(expenseInput.description);
      expect(expense.amount).toEqual(new Decimal(90));
      expect(expense.paidBy).toBe(testUser1.id);
      expect(expense.splits).toHaveLength(3);
      expect(expense.splits.every(split => split.amount.equals(new Decimal(30)))).toBe(true);
    });

    it('should create expense with custom splits', async () => {
      const expenseInput = {
        groupId: testGroup.id,
        description: 'Shared taxi',
        amount: 50,
        currency: 'USD',
        category: 'Transport',
        date: new Date(),
        splitType: 'CUSTOM' as const,
        splits: [
          { userId: testUser1.id, amount: 20 },
          { userId: testUser2.id, amount: 15 },
          { userId: testUser3.id, amount: 15 },
        ],
        paidBy: testUser2.id,
      };

      const expense = await expensesService.createExpense(expenseInput);

      expect(expense).toBeDefined();
      expect(expense.paidBy).toBe(testUser2.id);
      expect(expense.splits).toHaveLength(3);

      const user1Split = expense.splits.find(s => s.userId === testUser1.id);
      const user2Split = expense.splits.find(s => s.userId === testUser2.id);
      const user3Split = expense.splits.find(s => s.userId === testUser3.id);

      expect(user1Split?.amount).toEqual(new Decimal(20));
      expect(user2Split?.amount).toEqual(new Decimal(15));
      expect(user3Split?.amount).toEqual(new Decimal(15));
    });

    it('should reject expense with invalid split total', async () => {
      const expenseInput = {
        groupId: testGroup.id,
        description: 'Invalid expense',
        amount: 100,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'CUSTOM' as const,
        splits: [
          { userId: testUser1.id, amount: 40 },
          { userId: testUser2.id, amount: 30 }, // Total = 70, not 100
        ],
        paidBy: testUser1.id,
      };

      await expect(expensesService.createExpense(expenseInput)).rejects.toThrow(
        'Split amounts must equal expense amount'
      );
    });

    it('should reject expense if paidBy user is not group member', async () => {
      const outsideUser = await createTestUser();

      const expenseInput = {
        groupId: testGroup.id,
        description: 'Invalid payer',
        amount: 50,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL' as const,
        splits: [{ userId: testUser1.id, amount: 50 }],
        paidBy: outsideUser.id,
      };

      await expect(expensesService.createExpense(expenseInput)).rejects.toThrow(
        'Paid by user is not a member of this group'
      );
    });

    it('should create expense with percentage splits', async () => {
      const expenseInput = {
        groupId: testGroup.id,
        description: 'Percentage split expense',
        amount: 100,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'PERCENTAGE' as const,
        splits: [
          { userId: testUser1.id, amount: 50, percentage: 50 },
          { userId: testUser2.id, amount: 30, percentage: 30 },
          { userId: testUser3.id, amount: 20, percentage: 20 },
        ],
        paidBy: testUser1.id,
      };

      const expense = await expensesService.createExpense(expenseInput);

      expect(expense).toBeDefined();
      expect(expense.splitType).toBe('PERCENTAGE');

      const splits = expense.splits;
      expect(splits.find(s => s.userId === testUser1.id)?.percentage).toEqual(new Decimal(50));
      expect(splits.find(s => s.userId === testUser2.id)?.percentage).toEqual(new Decimal(30));
      expect(splits.find(s => s.userId === testUser3.id)?.percentage).toEqual(new Decimal(20));
    });
  });

  describe('getGroupExpenses', () => {
    beforeEach(async () => {
      // Create test expenses
      await createTestExpense(testGroup.id, testUser1.id, 100);
      await createTestExpense(testGroup.id, testUser2.id, 50);
      await createTestExpense(testGroup.id, testUser3.id, 75);
    });

    it('should return group expenses with details', async () => {
      const expenses = await expensesService.getGroupExpenses(testGroup.id);

      expect(expenses).toHaveLength(3);
      expect(expenses.every(e => e.groupId === testGroup.id)).toBe(true);
      expect(expenses.every(e => e.paidByUser)).toBeTruthy();
      expect(expenses.every(e => e.splits)).toBeTruthy();
    });

    it('should limit results when specified', async () => {
      const expenses = await expensesService.getGroupExpenses(testGroup.id, 2);

      expect(expenses).toHaveLength(2);
    });

    it('should return expenses in descending date order', async () => {
      const expenses = await expensesService.getGroupExpenses(testGroup.id);

      for (let i = 1; i < expenses.length; i++) {
        expect(expenses[i - 1].date.getTime()).toBeGreaterThanOrEqual(expenses[i].date.getTime());
      }
    });
  });

  describe('calculateDebts', () => {
    beforeEach(async () => {
      // Create expenses to generate debts
      // User1 pays 90, split equally among 3 users (30 each)
      // User2 and User3 owe User1 30 each
      await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Expense 1',
        amount: 90,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 30 },
          { userId: testUser2.id, amount: 30 },
          { userId: testUser3.id, amount: 30 },
        ],
        paidBy: testUser1.id,
      });

      // User2 pays 60, split equally among 3 users (20 each)
      // User1 and User3 owe User2 20 each
      await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Expense 2',
        amount: 60,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 20 },
          { userId: testUser2.id, amount: 20 },
          { userId: testUser3.id, amount: 20 },
        ],
        paidBy: testUser2.id,
      });
    });

    it('should calculate debts correctly', async () => {
      const debts = await expensesService.calculateDebts(testGroup.id);

      // User2 owes User1: 30 (from expense 1)
      // User1 owes User2: 20 (from expense 2)
      // Net: User2 owes User1: 10

      // User3 owes User1: 30 (from expense 1)
      // User3 owes User2: 20 (from expense 2)

      expect(debts.get(testUser2.id)?.get(testUser1.id)).toBe(30);
      expect(debts.get(testUser1.id)?.get(testUser2.id)).toBe(20);
      expect(debts.get(testUser3.id)?.get(testUser1.id)).toBe(30);
      expect(debts.get(testUser3.id)?.get(testUser2.id)).toBe(20);
    });
  });

  describe('getGroupDebtSummary', () => {
    beforeEach(async () => {
      // Create test expenses
      await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Test expense',
        amount: 90,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 30 },
          { userId: testUser2.id, amount: 30 },
          { userId: testUser3.id, amount: 30 },
        ],
        paidBy: testUser1.id,
      });
    });

    it('should return debt summary for all group members', async () => {
      const summary = await expensesService.getGroupDebtSummary(testGroup.id);

      expect(summary).toHaveLength(3);
      expect(summary.every(s => s.user)).toBeTruthy();
      expect(summary.every(s => typeof s.totalOwed === 'number')).toBe(true);
      expect(summary.every(s => typeof s.totalOwedTo === 'number')).toBe(true);
      expect(summary.every(s => typeof s.netAmount === 'number')).toBe(true);
    });

    it('should calculate net amounts correctly', async () => {
      const summary = await expensesService.getGroupDebtSummary(testGroup.id);

      const user1Summary = summary.find(s => s.user.id === testUser1.id);
      const user2Summary = summary.find(s => s.user.id === testUser2.id);
      const user3Summary = summary.find(s => s.user.id === testUser3.id);

      // User1 paid 90, owes 30, so net +60
      expect(user1Summary?.netAmount).toBe(60);

      // User2 and User3 each owe 30, so net -30
      expect(user2Summary?.netAmount).toBe(-30);
      expect(user3Summary?.netAmount).toBe(-30);
    });
  });

  describe('generateOptimalSettlements', () => {
    beforeEach(async () => {
      // Create complex debt scenario
      await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Expense 1',
        amount: 120,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 40 },
          { userId: testUser2.id, amount: 40 },
          { userId: testUser3.id, amount: 40 },
        ],
        paidBy: testUser1.id,
      });

      await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Expense 2',
        amount: 60,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 20 },
          { userId: testUser2.id, amount: 20 },
          { userId: testUser3.id, amount: 20 },
        ],
        paidBy: testUser2.id,
      });
    });

    it('should generate optimal settlements', async () => {
      const settlements = await expensesService.generateOptimalSettlements(testGroup.id);

      expect(settlements).toBeDefined();
      expect(Array.isArray(settlements)).toBe(true);

      // Should create settlements to balance debts
      settlements.forEach(settlement => {
        expect(settlement.groupId).toBe(testGroup.id);
        expect(settlement.status).toBe('PENDING');
        expect(settlement.fromUser).toBeDefined();
        expect(settlement.toUser).toBeDefined();
        expect(Number(settlement.amount)).toBeGreaterThan(0);
      });
    });

    it('should minimize number of transactions', async () => {
      const settlements = await expensesService.generateOptimalSettlements(testGroup.id);

      // With 3 users, optimal settlements should require at most 2 transactions
      expect(settlements.length).toBeLessThanOrEqual(2);
    });
  });

  describe('createSettlement', () => {
    it('should create settlement between group members', async () => {
      const settlementInput = {
        groupId: testGroup.id,
        fromUserId: testUser2.id,
        toUserId: testUser1.id,
        amount: 25,
        currency: 'USD',
        paymentMethod: 'CASH' as const,
        notes: 'Settling dinner expense',
      };

      const settlement = await expensesService.createSettlement(settlementInput, testUser2.id);

      expect(settlement).toBeDefined();
      expect(settlement.fromUserId).toBe(testUser2.id);
      expect(settlement.toUserId).toBe(testUser1.id);
      expect(settlement.amount).toEqual(new Decimal(25));
      expect(settlement.paymentMethod).toBe('CASH');
      expect(settlement.notes).toBe('Settling dinner expense');
      expect(settlement.status).toBe('PENDING');
    });

    it('should reject settlement if user not in group', async () => {
      const outsideUser = await createTestUser();

      const settlementInput = {
        groupId: testGroup.id,
        fromUserId: testUser1.id,
        toUserId: testUser2.id,
        amount: 25,
        currency: 'USD',
      };

      await expect(
        expensesService.createSettlement(settlementInput, outsideUser.id)
      ).rejects.toThrow('User is not a member of this group');
    });
  });

  describe('markSettlementPaid', () => {
    let testSettlement: any;

    beforeEach(async () => {
      testSettlement = await expensesService.createSettlement(
        {
          groupId: testGroup.id,
          fromUserId: testUser2.id,
          toUserId: testUser1.id,
          amount: 30,
          currency: 'USD',
        },
        testUser2.id
      );
    });

    it('should mark settlement as paid', async () => {
      const updatedSettlement = await expensesService.markSettlementPaid(
        testSettlement.id,
        'BANK_TRANSFER',
        'Paid via bank transfer'
      );

      expect(updatedSettlement.status).toBe('PAID');
      expect(updatedSettlement.paymentMethod).toBe('BANK_TRANSFER');
      expect(updatedSettlement.notes).toBe('Paid via bank transfer');
      expect(updatedSettlement.paidAt).toBeDefined();
    });

    it('should reject marking non-existent settlement as paid', async () => {
      await expect(expensesService.markSettlementPaid('non-existent-id', 'CASH')).rejects.toThrow(
        'Settlement not found'
      );
    });
  });

  describe('updateExpense', () => {
    let testExpense: any;

    beforeEach(async () => {
      testExpense = await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Original expense',
        amount: 100,
        currency: 'USD',
        category: 'Food',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [
          { userId: testUser1.id, amount: 50 },
          { userId: testUser2.id, amount: 50 },
        ],
        paidBy: testUser1.id,
      });
    });

    it('should update expense by payer', async () => {
      const updateInput = {
        description: 'Updated expense description',
        amount: 120,
        category: 'Entertainment',
      };

      const updatedExpense = await expensesService.updateExpense(
        testExpense.id,
        updateInput,
        testUser1.id
      );

      expect(updatedExpense.description).toBe(updateInput.description);
      expect(updatedExpense.amount).toEqual(new Decimal(120));
      expect(updatedExpense.category).toBe(updateInput.category);
    });

    it('should reject update by non-payer non-admin', async () => {
      await expect(
        expensesService.updateExpense(
          testExpense.id,
          { description: 'Hacked description' },
          testUser2.id
        )
      ).rejects.toThrow('Not authorized to edit this expense');
    });

    it('should allow update by group admin', async () => {
      // Make user2 an admin
      await prisma.membership.update({
        where: {
          userId_groupId: {
            userId: testUser2.id,
            groupId: testGroup.id,
          },
        },
        data: { isAdmin: true },
      });

      const updatedExpense = await expensesService.updateExpense(
        testExpense.id,
        { description: 'Admin updated description' },
        testUser2.id
      );

      expect(updatedExpense.description).toBe('Admin updated description');
    });
  });

  describe('deleteExpense', () => {
    let testExpense: any;

    beforeEach(async () => {
      testExpense = await expensesService.createExpense({
        groupId: testGroup.id,
        description: 'Expense to delete',
        amount: 50,
        currency: 'USD',
        category: 'Test',
        date: new Date(),
        splitType: 'EQUAL',
        splits: [{ userId: testUser1.id, amount: 50 }],
        paidBy: testUser1.id,
      });
    });

    it('should delete expense by payer', async () => {
      const result = await expensesService.deleteExpense(testExpense.id, testUser1.id);

      expect(result).toBe(true);

      // Verify expense was deleted
      const deletedExpense = await prisma.expense.findUnique({
        where: { id: testExpense.id },
      });

      expect(deletedExpense).toBeNull();
    });

    it('should reject deletion by non-payer non-admin', async () => {
      await expect(expensesService.deleteExpense(testExpense.id, testUser2.id)).rejects.toThrow(
        'Not authorized to delete this expense'
      );
    });

    it('should reject deletion of non-existent expense', async () => {
      await expect(expensesService.deleteExpense('non-existent-id', testUser1.id)).rejects.toThrow(
        'Expense not found'
      );
    });
  });
});
