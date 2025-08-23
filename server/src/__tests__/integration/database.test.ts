import { createTestGroup, createTestMembership, createTestUser } from '../helpers/test-utils';
import { prisma } from '../setup';

describe('Database Integration', () => {
  describe('User Operations', () => {
    it('should create user with all fields', async () => {
      const userData = {
        username: 'dbtest_user',
        email: 'dbtest@example.com',
        firstName: 'Database',
        lastName: 'Test',
        bio: 'Test user for database integration',
        phone: '+1234567890',
      };

      const user = await createTestUser(userData);

      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.bio).toBe(userData.bio);
      expect(user.phone).toBe(userData.phone);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should enforce unique constraints', async () => {
      const userData = {
        username: 'unique_test',
        email: 'unique@example.com',
      };

      await createTestUser(userData);

      // Try to create another user with same username
      await expect(
        createTestUser({ username: userData.username, email: 'different@example.com' })
      ).rejects.toThrow();

      // Try to create another user with same email
      await expect(
        createTestUser({ username: 'different_user', email: userData.email })
      ).rejects.toThrow();
    });

    it('should handle user deletion with cascading', async () => {
      const user = await createTestUser();
      const group = await createTestGroup();
      await createTestMembership(user.id, group.id);

      // Create an event
      const event = await prisma.event.create({
        data: {
          groupId: group.id,
          createdById: user.id,
          date: new Date(),
          description: 'Test event',
        },
      });

      // Delete user should fail due to foreign key constraints
      await expect(prisma.user.delete({ where: { id: user.id } })).rejects.toThrow();

      // Clean up properly
      await prisma.event.delete({ where: { id: event.id } });
      await prisma.membership.delete({
        where: { userId_groupId: { userId: user.id, groupId: group.id } },
      });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Group Operations', () => {
    it('should create group with memberships', async () => {
      const user = await createTestUser();
      const group = await createTestGroup({ name: 'DB Test Group' });
      const membership = await createTestMembership(user.id, group.id, { isAdmin: true });

      expect(membership.userId).toBe(user.id);
      expect(membership.groupId).toBe(group.id);
      expect(membership.isAdmin).toBe(true);
      expect(membership.memberId).toBe(1);

      // Add another member
      const user2 = await createTestUser();
      const membership2 = await createTestMembership(user2.id, group.id);

      expect(membership2.memberId).toBe(2);
    });

    it('should enforce unique membership constraint', async () => {
      const user = await createTestUser();
      const group = await createTestGroup();

      await createTestMembership(user.id, group.id);

      // Try to create duplicate membership
      await expect(createTestMembership(user.id, group.id)).rejects.toThrow();
    });

    it('should handle complex group queries', async () => {
      const user1 = await createTestUser({ username: 'user1', email: 'user1@test.com' });
      const user2 = await createTestUser({ username: 'user2', email: 'user2@test.com' });
      const group = await createTestGroup({ name: 'Complex Group' });

      await createTestMembership(user1.id, group.id, { isAdmin: true });
      await createTestMembership(user2.id, group.id, { isAdmin: false });

      // Create events
      await prisma.event.create({
        data: {
          groupId: group.id,
          createdById: user1.id,
          date: new Date(),
          description: 'Event 1',
        },
      });

      await prisma.event.create({
        data: {
          groupId: group.id,
          createdById: user2.id,
          date: new Date(),
          description: 'Event 2',
        },
      });

      // Query group with all relations
      const groupWithRelations = await prisma.group.findUnique({
        where: { id: group.id },
        include: {
          memberships: {
            include: { user: true },
            orderBy: { memberId: 'asc' },
          },
          events: {
            include: { createdBy: true },
            orderBy: { createdAt: 'desc' },
          },
          messages: true,
        },
      });

      expect(groupWithRelations).toBeTruthy();
      expect(groupWithRelations?.memberships).toHaveLength(2);
      expect(groupWithRelations?.events).toHaveLength(2);
      expect(groupWithRelations?.memberships[0].isAdmin).toBe(true);
      expect(groupWithRelations?.memberships[1].isAdmin).toBe(false);
    });
  });

  describe('Tennis Module Database Operations', () => {
    it('should create complete tennis league structure', async () => {
      const user = await createTestUser();
      const group1 = await createTestGroup({ name: 'Team 1' });
      const group2 = await createTestGroup({ name: 'Team 2' });

      // Create league
      const league = await prisma.teamLeague.create({
        data: {
          name: 'DB Test League',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
        },
      });

      // Create point systems
      await prisma.teamLeaguePointSystem.createMany({
        data: [
          {
            teamLeagueId: league.id,
            matchType: 'SINGLES',
            order: 1,
            winPoints: 3,
            lossPoints: 0,
            drawPoints: 1,
            defaultWinPoints: 3,
            defaultLossPoints: 0,
            defaultDrawPoints: 1,
          },
          {
            teamLeagueId: league.id,
            matchType: 'DOUBLES',
            order: 1,
            winPoints: 3,
            lossPoints: 0,
            drawPoints: 1,
            defaultWinPoints: 3,
            defaultLossPoints: 0,
            defaultDrawPoints: 1,
          },
        ],
      });

      // Create teams
      const team1 = await prisma.teamLeagueTeam.create({
        data: {
          teamLeagueId: league.id,
          groupId: group1.id,
          captainId: user.id,
        },
      });

      const team2 = await prisma.teamLeagueTeam.create({
        data: {
          teamLeagueId: league.id,
          groupId: group2.id,
          captainId: user.id,
        },
      });

      // Create team match
      const teamMatch = await prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          matchDate: new Date(),
          teamLeagueId: league.id,
        },
      });

      // Create individual matches
      await prisma.teamLeagueIndividualSinglesMatch.create({
        data: {
          player1Id: user.id,
          player2Id: user.id,
          matchDate: new Date(),
          teamMatchId: teamMatch.id,
          order: 1,
          score: '6-4, 6-2',
          winner: 'HOME',
        },
      });

      // Verify complete structure
      const completeLeague = await prisma.teamLeague.findUnique({
        where: { id: league.id },
        include: {
          pointSystems: true,
          teams: {
            include: {
              Group: true,
              captain: true,
            },
          },
          teamMatches: {
            include: {
              singlesMatches: true,
              doublesMatches: true,
            },
          },
        },
      });

      expect(completeLeague).toBeTruthy();
      expect(completeLeague?.pointSystems).toHaveLength(2);
      expect(completeLeague?.teams).toHaveLength(2);
      expect(completeLeague?.teamMatches).toHaveLength(1);
      expect(completeLeague?.teamMatches[0].singlesMatches).toHaveLength(1);
    });

    it('should enforce tennis-specific constraints', async () => {
      const user = await createTestUser();
      const group = await createTestGroup();
      const league = await prisma.teamLeague.create({
        data: {
          name: 'Constraint Test League',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      });

      const team = await prisma.teamLeagueTeam.create({
        data: {
          teamLeagueId: league.id,
          groupId: group.id,
          captainId: user.id,
        },
      });

      const teamMatch = await prisma.teamLeagueTeamMatch.create({
        data: {
          homeTeamId: team.id,
          awayTeamId: team.id, // Same team - should be allowed at DB level
          matchDate: new Date(),
          teamLeagueId: league.id,
        },
      });

      // Try to create duplicate singles match (same teamMatchId and order)
      await prisma.teamLeagueIndividualSinglesMatch.create({
        data: {
          player1Id: user.id,
          player2Id: user.id,
          matchDate: new Date(),
          teamMatchId: teamMatch.id,
          order: 1,
          score: '6-4, 6-2',
        },
      });

      await expect(
        prisma.teamLeagueIndividualSinglesMatch.create({
          data: {
            player1Id: user.id,
            player2Id: user.id,
            matchDate: new Date(),
            teamMatchId: teamMatch.id,
            order: 1, // Duplicate order
            score: '6-3, 6-1',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Expenses Module Database Operations', () => {
    it('should create expense with splits', async () => {
      const user1 = await createTestUser({ username: 'payer', email: 'payer@test.com' });
      const user2 = await createTestUser({ username: 'split1', email: 'split1@test.com' });
      const user3 = await createTestUser({ username: 'split2', email: 'split2@test.com' });
      const group = await createTestGroup();

      await createTestMembership(user1.id, group.id);
      await createTestMembership(user2.id, group.id);
      await createTestMembership(user3.id, group.id);

      // Create expense
      const expense = await prisma.expense.create({
        data: {
          groupId: group.id,
          paidBy: user1.id,
          description: 'Test expense',
          amount: 90,
          currency: 'USD',
          category: 'Food',
          date: new Date(),
          splitType: 'EQUAL',
        },
      });

      // Create splits
      await prisma.expenseSplit.createMany({
        data: [
          { expenseId: expense.id, userId: user1.id, amount: 30 },
          { expenseId: expense.id, userId: user2.id, amount: 30 },
          { expenseId: expense.id, userId: user3.id, amount: 30 },
        ],
      });

      // Verify expense with splits
      const expenseWithSplits = await prisma.expense.findUnique({
        where: { id: expense.id },
        include: {
          splits: {
            include: { user: true },
          },
          paidByUser: true,
        },
      });

      expect(expenseWithSplits).toBeTruthy();
      expect(expenseWithSplits?.splits).toHaveLength(3);
      expect(expenseWithSplits?.paidByUser.id).toBe(user1.id);
    });

    it('should handle settlements', async () => {
      const user1 = await createTestUser({ username: 'from', email: 'from@test.com' });
      const user2 = await createTestUser({ username: 'to', email: 'to@test.com' });
      const group = await createTestGroup();

      const settlement = await prisma.settlement.create({
        data: {
          groupId: group.id,
          fromUserId: user1.id,
          toUserId: user2.id,
          amount: 25.5,
          currency: 'USD',
          status: 'PENDING',
        },
      });

      expect(settlement.amount.toNumber()).toBe(25.5);
      expect(settlement.status).toBe('PENDING');

      // Update settlement to paid
      const paidSettlement = await prisma.settlement.update({
        where: { id: settlement.id },
        data: {
          status: 'PAID',
          paymentMethod: 'CASH',
          paidAt: new Date(),
        },
      });

      expect(paidSettlement.status).toBe('PAID');
      expect(paidSettlement.paymentMethod).toBe('CASH');
      expect(paidSettlement.paidAt).toBeTruthy();
    });
  });

  describe('Database Performance', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple users
      const users = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          createTestUser({
            username: `bulk_user_${i}`,
            email: `bulk_user_${i}@test.com`,
          })
        )
      );

      const group = await createTestGroup({ name: 'Bulk Test Group' });

      // Create memberships in bulk
      await prisma.membership.createMany({
        data: users.map((user, index) => ({
          userId: user.id,
          groupId: group.id,
          memberId: index + 1,
          isAdmin: index === 0,
        })),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      // Verify all memberships were created
      const memberships = await prisma.membership.findMany({
        where: { groupId: group.id },
      });

      expect(memberships).toHaveLength(10);
    });

    it('should handle complex queries efficiently', async () => {
      // Create test data
      const users = await Promise.all([
        createTestUser({ username: 'complex1', email: 'complex1@test.com' }),
        createTestUser({ username: 'complex2', email: 'complex2@test.com' }),
      ]);

      const groups = await Promise.all([
        createTestGroup({ name: 'Complex Group 1' }),
        createTestGroup({ name: 'Complex Group 2' }),
      ]);

      // Create memberships
      for (const user of users) {
        for (const group of groups) {
          await createTestMembership(user.id, group.id);
        }
      }

      const startTime = Date.now();

      // Complex query with multiple joins
      const result = await prisma.user.findMany({
        where: {
          memberships: {
            some: {
              group: {
                name: {
                  contains: 'Complex',
                },
              },
            },
          },
        },
        include: {
          memberships: {
            include: {
              group: {
                include: {
                  events: true,
                  messages: true,
                },
              },
            },
          },
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1 second
      expect(result).toHaveLength(2);
      expect(result[0].memberships).toHaveLength(2);
    });
  });

  describe('Transaction Handling', () => {
    it('should handle transaction rollback on error', async () => {
      const user = await createTestUser();
      const group = await createTestGroup();

      try {
        await prisma.$transaction(async tx => {
          // Create membership
          await tx.membership.create({
            data: {
              userId: user.id,
              groupId: group.id,
              memberId: 1,
            },
          });

          // This should cause an error (duplicate membership)
          await tx.membership.create({
            data: {
              userId: user.id,
              groupId: group.id,
              memberId: 2, // Different memberId but same user/group
            },
          });
        });

        fail('Transaction should have failed');
      } catch (error) {
        // Expected error
      }

      // Verify no membership was created due to rollback
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: group.id,
          },
        },
      });

      expect(membership).toBeNull();
    });

    it('should handle successful transaction', async () => {
      const user = await createTestUser();
      const group = await createTestGroup();

      const result = await prisma.$transaction(async tx => {
        const membership = await tx.membership.create({
          data: {
            userId: user.id,
            groupId: group.id,
            memberId: 1,
          },
        });

        const event = await tx.event.create({
          data: {
            groupId: group.id,
            createdById: user.id,
            date: new Date(),
            description: 'Transaction test event',
          },
        });

        return { membership, event };
      });

      expect(result.membership).toBeTruthy();
      expect(result.event).toBeTruthy();

      // Verify both records exist
      const membership = await prisma.membership.findUnique({
        where: { id: result.membership.id },
      });
      const event = await prisma.event.findUnique({
        where: { id: result.event.id },
      });

      expect(membership).toBeTruthy();
      expect(event).toBeTruthy();
    });
  });
});
