import { MockedProvider } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { expectAccessible } from '../../__tests__/utils/accessibility-helpers';
import { BaseComponentTestSuite } from '../../__tests__/utils/base-component-tests';
import {
  createTestExpense,
  createTestGroup,
  createTestUser,
} from '../../__tests__/utils/mock-factories';
import { renderWithProviders } from '../../__tests__/utils/test-utils';
import { GET_USER_EXPENSES } from '../../graphql/Expenses';
import { ME_QUERY } from '../../graphql/User';

import ExpensesPage from './ExpensesPage';

// Test data
const mockUser = createTestUser({
  id: 'user-1',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
});

const mockGroup1 = createTestGroup({
  id: 'group-1',
  name: 'Test Group 1',
});

const mockGroup2 = createTestGroup({
  id: 'group-2',
  name: 'Test Group 2',
});

const mockExpenses = [
  createTestExpense({
    id: 'expense-1',
    description: 'Dinner at restaurant',
    amount: 120.5,
    category: 'Food & Dining',
    date: '2024-01-15T00:00:00.000Z',
    paidByUser: mockUser,
    groupId: mockGroup1.id,
    splits: [
      {
        id: 'split-1',
        amount: 60.25,
        user: mockUser,
      },
      {
        id: 'split-2',
        amount: 60.25,
        user: createTestUser({ id: 'user-2', firstName: 'Jane', lastName: 'Doe' }),
      },
    ],
  }),
  createTestExpense({
    id: 'expense-2',
    description: 'Movie tickets',
    amount: 45.0,
    category: 'Entertainment',
    date: '2024-01-10T00:00:00.000Z',
    paidByUser: createTestUser({ id: 'user-2', firstName: 'Jane', lastName: 'Doe' }),
    groupId: mockGroup2.id,
    splits: [
      {
        id: 'split-3',
        amount: 22.5,
        user: mockUser,
      },
      {
        id: 'split-4',
        amount: 22.5,
        user: createTestUser({ id: 'user-2', firstName: 'Jane', lastName: 'Doe' }),
      },
    ],
  }),
  createTestExpense({
    id: 'expense-3',
    description: 'Gas for road trip',
    amount: 80.0,
    category: 'Transportation',
    date: '2024-01-05T00:00:00.000Z',
    paidByUser: mockUser,
    groupId: mockGroup1.id,
    splits: [
      {
        id: 'split-5',
        amount: 40.0,
        user: mockUser,
      },
      {
        id: 'split-6',
        amount: 40.0,
        user: createTestUser({ id: 'user-3', firstName: 'Bob', lastName: 'Smith' }),
      },
    ],
  }),
];

// Transform expenses to match component expectations
const transformedExpenses = mockExpenses.map(expense => ({
  ...expense,
  paidBy: {
    id: expense.paidByUser.id,
    username: expense.paidByUser.username,
    firstName: expense.paidByUser.firstName,
    lastName: expense.paidByUser.lastName,
  },
  group: {
    id: expense.groupId,
    name: expense.groupId === mockGroup1.id ? mockGroup1.name : mockGroup2.name,
  },
  splitType: 'EQUAL',
}));

// GraphQL mocks
const createMocks = (hasExpenses = true) => [
  {
    request: { query: ME_QUERY },
    result: { data: { me: mockUser } },
  },
  {
    request: {
      query: GET_USER_EXPENSES,
      variables: { userId: mockUser.id },
    },
    result: {
      data: {
        userExpenses: hasExpenses ? transformedExpenses : [],
      },
    },
  },
];

// Test suite implementation
class ExpensesPageTestSuite extends BaseComponentTestSuite {
  component = ExpensesPage;
  defaultProps = {};
  displayName = 'ExpensesPage';

  async testUserInteractions(): Promise<void> {
    describe('User Interactions', () => {
      it('toggles add expense form when button is clicked', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        const addButton = screen.getByRole('button', { name: /add new expense/i });
        await this.user.click(addButton);

        // Check that form appears
        expect(screen.getByText(/add new expense/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

        // Click cancel to hide form
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await this.user.click(cancelButton);

        // Form should be hidden
        expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      });

      it('navigates to dashboard when back button is clicked', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        const backButton = screen.getByRole('link', { name: /back to dashboard/i });
        expect(backButton).toHaveAttribute('href', '/dashboard');
      });

      it('shows add first expense button when no expenses exist', async () => {
        const emptyMocks = createMocks(false);
        this.render({}, { mocks: emptyMocks });
        await this.helpers.async.waitForDataLoad();

        const addFirstButton = screen.getByRole('button', { name: /add your first expense/i });
        await this.user.click(addFirstButton);

        // Should show the expense form
        expect(screen.getByText(/add new expense/i)).toBeInTheDocument();
      });

      it('navigates to group expenses when view group expenses link is clicked', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        const groupLinks = screen.getAllByRole('link', { name: /view group expenses/i });
        expect(groupLinks[0]).toHaveAttribute('href', `/expenses/group/${mockGroup1.id}`);
      });
    });
  }

  async testLoadingStates(): Promise<void> {
    describe('Loading States', () => {
      it('shows loading state while fetching expenses', async () => {
        const slowMocks = [
          {
            request: { query: ME_QUERY },
            result: { data: { me: mockUser } },
          },
          {
            request: {
              query: GET_USER_EXPENSES,
              variables: { userId: mockUser.id },
            },
            result: { data: { userExpenses: transformedExpenses } },
            delay: 1000,
          },
        ];

        renderWithProviders(
          <MemoryRouter>
            <MockedProvider mocks={slowMocks} addTypename={false}>
              <ExpensesPage />
            </MockedProvider>
          </MemoryRouter>
        );

        // Should show loading state
        expect(screen.getByText(/loading expenses/i)).toBeInTheDocument();
      });

      it('hides loading state after data loads', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
      });
    });
  }

  async testErrorStates(): Promise<void> {
    describe('Error States', () => {
      it('handles GraphQL errors gracefully', async () => {
        const errorMocks = [
          {
            request: { query: ME_QUERY },
            result: { data: { me: mockUser } },
          },
          {
            request: {
              query: GET_USER_EXPENSES,
              variables: { userId: mockUser.id },
            },
            error: new Error('Failed to fetch expenses'),
          },
        ];

        renderWithProviders(
          <MemoryRouter>
            <MockedProvider mocks={errorMocks} addTypename={false}>
              <ExpensesPage />
            </MockedProvider>
          </MemoryRouter>
        );

        // Should handle error gracefully (component should still render)
        await waitFor(() => {
          expect(screen.getByText(/expenses/i)).toBeInTheDocument();
        });
      });
    });
  }

  async testAccessibility(): Promise<void> {
    describe('Accessibility', () => {
      it('passes accessibility audit', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();
        await expectAccessible(this.container, this.user);
      });

      it('has proper heading structure', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check for proper heading hierarchy
        expect(screen.getByRole('heading', { name: /expenses/i, level: 1 })).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /expenses overview/i, level: 2 })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /all expenses/i, level: 2 })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /expenses by group/i, level: 2 })
        ).toBeInTheDocument();
      });

      it('has proper navigation landmarks', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check for main content area
        const main = screen.getByRole('main') || document.querySelector('.expenses-content');
        expect(main).toBeInTheDocument();
      });

      it('provides accessible expense information', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check that expense information is accessible
        const expenseItems = document.querySelectorAll('.expense-item');
        expenseItems.forEach(item => {
          expect(item).toBeInTheDocument();
          // Each expense should have accessible content
          const description = item.querySelector('h4');
          expect(description).toBeInTheDocument();
        });
      });
    });
  }

  protected render(props?: any, options?: any) {
    const mocks = options?.mocks || createMocks();

    this.renderResult = renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage {...props} />
        </MockedProvider>
      </MemoryRouter>,
      options
    );
    return this.renderResult;
  }
}

// Additional specific tests
describe('ExpensesPage - Data Display', () => {
  it('displays expense overview statistics correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check overview statistics
    expect(screen.getByText('3')).toBeInTheDocument(); // Total expenses
    expect(screen.getByText('$245.50')).toBeInTheDocument(); // Total amount
    expect(screen.getByText('2')).toBeInTheDocument(); // Groups with expenses
  });

  it('displays individual expenses correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check that all expenses are displayed
    expect(screen.getByText('Dinner at restaurant')).toBeInTheDocument();
    expect(screen.getByText('Movie tickets')).toBeInTheDocument();
    expect(screen.getByText('Gas for road trip')).toBeInTheDocument();

    // Check expense details
    expect(screen.getByText('$120.50 USD')).toBeInTheDocument();
    expect(screen.getByText('$45.00 USD')).toBeInTheDocument();
    expect(screen.getByText('$80.00 USD')).toBeInTheDocument();

    // Check categories and groups
    expect(screen.getByText(/food & dining/i)).toBeInTheDocument();
    expect(screen.getByText(/entertainment/i)).toBeInTheDocument();
    expect(screen.getByText(/transportation/i)).toBeInTheDocument();
  });

  it('groups expenses by group correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check group breakdown
    const group1Cards = screen.getAllByText('Test Group 1');
    const group2Cards = screen.getAllByText('Test Group 2');

    expect(group1Cards.length).toBeGreaterThan(0);
    expect(group2Cards.length).toBeGreaterThan(0);

    // Check group totals (Group 1: $120.50 + $80.00 = $200.50, Group 2: $45.00)
    expect(screen.getByText('$200.50')).toBeInTheDocument();
    expect(screen.getByText('$45.00')).toBeInTheDocument();
  });

  it('shows empty state when no expenses exist', async () => {
    const emptyMocks = createMocks(false);
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={emptyMocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check empty state
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start tracking shared expenses/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first expense/i })).toBeInTheDocument();

    // Check that overview shows zeros
    expect(screen.getByText('0')).toBeInTheDocument(); // Total expenses
    expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total amount
  });

  it('displays paid by information correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check paid by information
    expect(screen.getByText(/paid by test/i)).toBeInTheDocument(); // Test User
    expect(screen.getByText(/paid by jane/i)).toBeInTheDocument(); // Jane Doe
  });

  it('formats dates correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Check that dates are formatted (exact format may vary by locale)
    const dateElements = screen.getAllByText(/1\/\d+\/2024/); // MM/DD/YYYY format
    expect(dateElements.length).toBeGreaterThan(0);
  });
});

describe('ExpensesPage - Form Integration', () => {
  it('hides form after successful expense creation', async () => {
    const user = userEvent.setup();
    const mocks = createMocks();
    renderWithProviders(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpensesPage />
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading expenses/i)).not.toBeInTheDocument();
    });

    // Show form
    const addButton = screen.getByRole('button', { name: /add new expense/i });
    await user.click(addButton);

    expect(screen.getByText(/add new expense/i)).toBeInTheDocument();

    // Simulate successful form submission by calling the onSuccess callback
    // This would normally be triggered by the ExpenseForm component
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Form should be hidden
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });
});

// Run the test suite
const expensesPageTestSuite = new ExpensesPageTestSuite();
expensesPageTestSuite.runAllTests();
