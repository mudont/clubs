/**
 * GraphQL integration tests for Apollo Client queries and mutations
 */

import { useMutation, useQuery } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CREATE_EXPENSE, GET_USER_EXPENSES } from '../../graphql/Expenses';
import { GET_GROUP_MEMBERS } from '../../graphql/Group';
import { ME_QUERY } from '../../graphql/User';
import { createTestExpense, createTestGroup, createTestUser } from '../utils/mock-factories';
import { renderWithProviders } from '../utils/test-utils';

// Import statements (would be at the top in real file)

// Test components that use GraphQL
const TestQueryComponent: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, loading, error } = useQuery(GET_USER_EXPENSES, {
    variables: { userId },
  });

  if (loading) return <div>Loading expenses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>User Expenses</h2>
      {data?.userExpenses?.map((expense: any) => (
        <div key={expense.id} data-testid="expense-item">
          {expense.description}: ${expense.amount}
        </div>
      ))}
    </div>
  );
};

const TestMutationComponent: React.FC = () => {
  const [createExpense, { loading, error }] = useMutation(CREATE_EXPENSE);

  const handleCreate = () => {
    createExpense({
      variables: {
        input: {
          description: 'Test Expense',
          amount: 100,
          groupId: 'group-1',
          paidBy: 'user-1',
          splits: [],
        },
      },
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Expense'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

// Test data
const mockUser = createTestUser({
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
});

const mockExpenses = [
  createTestExpense({
    id: 'expense-1',
    description: 'Lunch',
    amount: 25.5,
    paidByUser: mockUser,
  }),
  createTestExpense({
    id: 'expense-2',
    description: 'Coffee',
    amount: 4.75,
    paidByUser: mockUser,
  }),
];

describe('GraphQL Integration Tests', () => {
  describe('Query Integration', () => {
    it('handles successful query execution', async () => {
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: {
              userExpenses: mockExpenses,
            },
          },
        },
      ];

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-1" />
        </MockedProvider>
      );

      // Should show loading initially
      expect(screen.getByText(/loading expenses/i)).toBeInTheDocument();

      // Should show data after loading
      await waitFor(() => {
        expect(screen.getByText('User Expenses')).toBeInTheDocument();
        expect(screen.getByText('Lunch: $25.5')).toBeInTheDocument();
        expect(screen.getByText('Coffee: $4.75')).toBeInTheDocument();
      });

      // Should have correct number of expense items
      const expenseItems = screen.getAllByTestId('expense-item');
      expect(expenseItems).toHaveLength(2);
    });

    it('handles query errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          error: new Error('Network error'),
        },
      ];

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-1" />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
      });
    });

    it('handles empty query results', async () => {
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: {
              userExpenses: [],
            },
          },
        },
      ];

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-1" />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User Expenses')).toBeInTheDocument();
        expect(screen.queryByTestId('expense-item')).not.toBeInTheDocument();
      });
    });

    it('handles query variables correctly', async () => {
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-2' },
          },
          result: {
            data: {
              userExpenses: [mockExpenses[0]],
            },
          },
        },
      ];

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-2" />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Lunch: $25.5')).toBeInTheDocument();
        expect(screen.queryByText('Coffee: $4.75')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mutation Integration', () => {
    it('handles successful mutation execution', async () => {
      const mocks = [
        {
          request: {
            query: CREATE_EXPENSE,
            variables: {
              input: {
                description: 'Test Expense',
                amount: 100,
                groupId: 'group-1',
                paidBy: 'user-1',
                splits: [],
              },
            },
          },
          result: {
            data: {
              createExpense: {
                id: 'new-expense-1',
                description: 'Test Expense',
                amount: 100,
              },
            },
          },
        },
      ];

      const user = userEvent.setup();
      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestMutationComponent />
        </MockedProvider>
      );

      const createButton = screen.getByRole('button', { name: /create expense/i });
      await user.click(createButton);

      // Should show loading state
      expect(screen.getByText(/creating/i)).toBeInTheDocument();

      // Should complete successfully
      await waitFor(() => {
        expect(screen.getByText(/create expense/i)).toBeInTheDocument();
        expect(screen.queryByText(/creating/i)).not.toBeInTheDocument();
      });
    });

    it('handles mutation errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: CREATE_EXPENSE,
            variables: expect.any(Object),
          },
          error: new Error('Validation error'),
        },
      ];

      const user = userEvent.setup();
      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestMutationComponent />
        </MockedProvider>
      );

      const createButton = screen.getByRole('button', { name: /create expense/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/error: validation error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cache Integration', () => {
    it('updates cache correctly after mutation', async () => {
      const initialExpenses = [mockExpenses[0]];
      const newExpense = createTestExpense({
        id: 'new-expense-1',
        description: 'New Expense',
        amount: 50,
      });

      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: {
              userExpenses: initialExpenses,
            },
          },
        },
        {
          request: {
            query: CREATE_EXPENSE,
            variables: expect.any(Object),
          },
          result: {
            data: {
              createExpense: newExpense,
            },
          },
        },
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: {
              userExpenses: [...initialExpenses, newExpense],
            },
          },
        },
      ];

      const user = userEvent.setup();
      const { rerender } = renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-1" />
          <TestMutationComponent />
        </MockedProvider>
      );

      // Wait for initial query
      await waitFor(() => {
        expect(screen.getByText('Lunch: $25.5')).toBeInTheDocument();
      });

      // Execute mutation
      const createButton = screen.getByRole('button', { name: /create expense/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.queryByText(/creating/i)).not.toBeInTheDocument();
      });

      // Trigger refetch by rerendering
      rerender(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestQueryComponent userId="user-1" />
          <TestMutationComponent />
        </MockedProvider>
      );

      // Should show updated data
      await waitFor(() => {
        expect(screen.getByText('New Expense: $50')).toBeInTheDocument();
      });
    });

    it('handles cache errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: {
              userExpenses: mockExpenses,
            },
          },
        },
      ];

      // Mock console.error to avoid noise in tests
      const originalConsoleError = console.error;
      console.error = jest.fn();

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false} errorPolicy="all">
          <TestQueryComponent userId="user-1" />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User Expenses')).toBeInTheDocument();
      });

      console.error = originalConsoleError;
    });
  });

  describe('Loading States Integration', () => {
    it('handles loading states correctly across multiple queries', async () => {
      const slowMocks = [
        {
          request: {
            query: ME_QUERY,
          },
          result: {
            data: { me: mockUser },
          },
          delay: 100,
        },
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: { userExpenses: mockExpenses },
          },
          delay: 200,
        },
      ];

      const MultiQueryComponent = () => {
        const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
        const { data: expensesData, loading: expensesLoading } = useQuery(GET_USER_EXPENSES, {
          variables: { userId: 'user-1' },
        });

        return (
          <div>
            {meLoading && <div>Loading user...</div>}
            {expensesLoading && <div>Loading expenses...</div>}
            {meData && <div>User: {meData.me.username}</div>}
            {expensesData && <div>Expenses: {expensesData.userExpenses.length}</div>}
          </div>
        );
      };

      renderWithProviders(
        <MockedProvider mocks={slowMocks} addTypename={false}>
          <MultiQueryComponent />
        </MockedProvider>
      );

      // Should show both loading states initially
      expect(screen.getByText(/loading user/i)).toBeInTheDocument();
      expect(screen.getByText(/loading expenses/i)).toBeInTheDocument();

      // First query completes
      await waitFor(() => {
        expect(screen.getByText('User: testuser')).toBeInTheDocument();
        expect(screen.queryByText(/loading user/i)).not.toBeInTheDocument();
      });

      // Second query still loading
      expect(screen.getByText(/loading expenses/i)).toBeInTheDocument();

      // Second query completes
      await waitFor(() => {
        expect(screen.getByText('Expenses: 2')).toBeInTheDocument();
        expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Integration', () => {
    it('handles network errors with retry mechanism', async () => {
      const attemptCount = 0;
      const mocks = [
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          error: new Error('Network error'),
        },
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: { userExpenses: mockExpenses },
          },
        },
      ];

      const RetryComponent = () => {
        const { data, loading, error, refetch } = useQuery(GET_USER_EXPENSES, {
          variables: { userId: 'user-1' },
          errorPolicy: 'all',
        });

        return (
          <div>
            {loading && <div>Loading...</div>}
            {error && (
              <div>
                <div>Error: {error.message}</div>
                <button onClick={() => refetch()}>Retry</button>
              </div>
            )}
            {data && <div>Success: {data.userExpenses.length} expenses</div>}
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RetryComponent />
        </MockedProvider>
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText('Success: 2 expenses')).toBeInTheDocument();
      });
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('handles complex component with multiple GraphQL operations', async () => {
      const mocks = [
        {
          request: { query: ME_QUERY },
          result: { data: { me: mockUser } },
        },
        {
          request: {
            query: GET_GROUP_MEMBERS,
            variables: { groupId: 'group-1' },
          },
          result: {
            data: {
              group: createTestGroup({
                id: 'group-1',
                memberships: [{ user: mockUser }],
              }),
            },
          },
        },
        {
          request: {
            query: GET_USER_EXPENSES,
            variables: { userId: 'user-1' },
          },
          result: {
            data: { userExpenses: mockExpenses },
          },
        },
      ];

      const ComplexComponent = () => {
        const { data: meData } = useQuery(ME_QUERY);
        const { data: groupData } = useQuery(GET_GROUP_MEMBERS, {
          variables: { groupId: 'group-1' },
          skip: !meData,
        });
        const { data: expensesData } = useQuery(GET_USER_EXPENSES, {
          variables: { userId: meData?.me?.id || '' },
          skip: !meData?.me?.id,
        });

        return (
          <div>
            {meData && <div>User: {meData.me.username}</div>}
            {groupData && <div>Group: {groupData.group.name}</div>}
            {expensesData && <div>Expenses: {expensesData.userExpenses.length}</div>}
          </div>
        );
      };

      renderWithProviders(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ComplexComponent />
        </MockedProvider>
      );

      // Should load data in sequence
      await waitFor(() => {
        expect(screen.getByText('User: testuser')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/group:/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Expenses: 2')).toBeInTheDocument();
      });
    });
  });
});
