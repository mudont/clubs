import { MockedProvider } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';

import { expectAccessible } from '../../__tests__/utils/accessibility-helpers';
import { BaseComponentTestSuite } from '../../__tests__/utils/base-component-tests';
import { createTestUser } from '../../__tests__/utils/mock-factories';
import { renderWithProviders } from '../../__tests__/utils/test-utils';
import { GET_GROUP_DEBT_SUMMARY } from '../../graphql/Expenses';

import { DebtSummary } from './DebtSummary';

// Test data
const mockUsers = [
  createTestUser({
    id: 'user-1',
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Johnson',
  }),
  createTestUser({
    id: 'user-2',
    username: 'bob',
    firstName: 'Bob',
    lastName: 'Smith',
  }),
  createTestUser({
    id: 'user-3',
    username: 'charlie',
    firstName: 'Charlie',
    lastName: 'Brown',
  }),
];

const mockDebtSummary = [
  {
    user: mockUsers[0],
    totalOwed: 50.0,
    totalOwedTo: 75.0,
    netAmount: 25.0, // Owed 75 - Owes 50 = +25
    debts: [
      {
        toUser: mockUsers[1],
        amount: 30.0,
      },
      {
        toUser: mockUsers[2],
        amount: 20.0,
      },
    ],
  },
  {
    user: mockUsers[1],
    totalOwed: 80.0,
    totalOwedTo: 30.0,
    netAmount: -50.0, // Owed 30 - Owes 80 = -50
    debts: [
      {
        toUser: mockUsers[0],
        amount: 50.0,
      },
      {
        toUser: mockUsers[2],
        amount: 30.0,
      },
    ],
  },
  {
    user: mockUsers[2],
    totalOwed: 25.0,
    totalOwedTo: 50.0,
    netAmount: 25.0, // Owed 50 - Owes 25 = +25
    debts: [
      {
        toUser: mockUsers[0],
        amount: 25.0,
      },
    ],
  },
];

// GraphQL mocks
const createMocks = (hasDebts = true, isLoading = false, hasError = false) => [
  {
    request: {
      query: GET_GROUP_DEBT_SUMMARY,
      variables: { groupId: 'group-1' },
    },
    result: hasError
      ? undefined
      : {
          data: {
            groupDebtSummary: hasDebts ? mockDebtSummary : [],
          },
        },
    error: hasError ? new Error('Failed to fetch debt summary') : undefined,
    delay: isLoading ? 1000 : 0,
  },
];

// Test suite implementation
class DebtSummaryTestSuite extends BaseComponentTestSuite<{ groupId: string }> {
  component = DebtSummary;
  defaultProps = { groupId: 'group-1' };
  displayName = 'DebtSummary';

  async testUserInteractions(): Promise<void> {
    describe('User Interactions', () => {
      it('displays debt information in an accessible format', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check that user information is displayed
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();

        // Check that usernames are displayed
        expect(screen.getByText('@alice')).toBeInTheDocument();
        expect(screen.getByText('@bob')).toBeInTheDocument();
        expect(screen.getByText('@charlie')).toBeInTheDocument();
      });

      it('shows individual debt details when expanded', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check that individual debts are shown
        expect(screen.getByText('→ Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('→ Charlie Brown')).toBeInTheDocument();
        expect(screen.getByText('→ Alice Johnson')).toBeInTheDocument();

        // Check debt amounts
        expect(screen.getByText('$30.00')).toBeInTheDocument();
        expect(screen.getByText('$20.00')).toBeInTheDocument();
        expect(screen.getByText('$50.00')).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
      });

      it('displays net amounts with correct styling', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check positive net amounts (green)
        const positiveAmounts = screen.getAllByText('+$25.00');
        positiveAmounts.forEach(amount => {
          expect(amount).toHaveClass('text-green-600');
        });

        // Check negative net amounts (red)
        const negativeAmount = screen.getByText('-$50.00');
        expect(negativeAmount).toHaveClass('text-red-600');
      });
    });
  }

  async testLoadingStates(): Promise<void> {
    describe('Loading States', () => {
      it('shows loading skeleton while fetching data', async () => {
        const loadingMocks = createMocks(true, true);
        this.render({}, { mocks: loadingMocks });

        // Check for loading skeleton
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();

        // Check for animated pulse elements
        const pulseElements = this.container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
      });

      it('hides loading state after data loads', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Loading skeleton should be gone
        expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();

        // Data should be visible
        expect(screen.getByText('Debt Summary')).toBeInTheDocument();
      });
    });
  }

  async testErrorStates(): Promise<void> {
    describe('Error States', () => {
      it('displays error message when GraphQL query fails', async () => {
        const errorMocks = createMocks(true, false, true);
        this.render({}, { mocks: errorMocks });

        await waitFor(() => {
          expect(screen.getByText(/error loading debt summary/i)).toBeInTheDocument();
          expect(screen.getByText(/failed to fetch debt summary/i)).toBeInTheDocument();
        });
      });

      it('maintains component structure during error state', async () => {
        const errorMocks = createMocks(true, false, true);
        this.render({}, { mocks: errorMocks });

        await waitFor(() => {
          // Component container should still be present
          expect(
            this.container.querySelector('.bg-white.rounded-lg.shadow-md')
          ).toBeInTheDocument();
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

        // Check main heading
        expect(
          screen.getByRole('heading', { name: /debt summary/i, level: 3 })
        ).toBeInTheDocument();
      });

      it('provides accessible financial information', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check that financial amounts are properly labeled
        const totalOwedElements = screen.getAllByText(/total owed/i);
        const totalOwedToElements = screen.getAllByText(/total owed to/i);
        const netBalanceElements = screen.getAllByText(/net balance/i);

        expect(totalOwedElements.length).toBeGreaterThan(0);
        expect(totalOwedToElements.length).toBeGreaterThan(0);
        expect(netBalanceElements.length).toBeGreaterThan(0);
      });

      it('uses appropriate color coding for financial states', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check color coding for different financial states
        const positiveAmounts = this.container.querySelectorAll('.text-green-600, .text-green-800');
        const negativeAmounts = this.container.querySelectorAll('.text-red-600, .text-red-800');
        const neutralAmounts = this.container.querySelectorAll('.text-blue-600, .text-blue-800');

        expect(positiveAmounts.length).toBeGreaterThan(0);
        expect(negativeAmounts.length).toBeGreaterThan(0);
        expect(neutralAmounts.length).toBeGreaterThan(0);
      });

      it('provides clear visual hierarchy for debt information', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check that user cards have proper structure
        const userCards = this.container.querySelectorAll('.border.border-gray-200.rounded-lg');
        expect(userCards.length).toBe(3); // One for each user

        // Check that each card has proper sections
        userCards.forEach(card => {
          expect(card.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();
          expect(card.querySelector('.border-t.border-gray-100')).toBeInTheDocument();
        });
      });
    });
  }

  protected render(props?: Partial<{ groupId: string }>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props };
    const mocks = options?.mocks || createMocks();

    this.renderResult = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary {...finalProps} />
      </MockedProvider>,
      options
    );
    return this.renderResult;
  }
}

// Additional specific tests
describe('DebtSummary - Data Display', () => {
  it('calculates and displays summary statistics correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check summary statistics
    // Total Owed: 50 + 80 + 25 = 155
    expect(screen.getByText('$155.00')).toBeInTheDocument();

    // Total Owed To: 75 + 30 + 50 = 155
    expect(screen.getByText('$155.00')).toBeInTheDocument();

    // Net Balance: 155 - 155 = 0
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('displays individual user debt breakdowns correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check Alice's debt breakdown
    expect(screen.getByText('Owed to others:')).toBeInTheDocument();
    expect(screen.getByText('Owed by others:')).toBeInTheDocument();

    // Check specific amounts in the breakdown sections
    const owedToOthersAmounts = screen.getAllByText('$50.00');
    const owedByOthersAmounts = screen.getAllByText('$75.00');

    expect(owedToOthersAmounts.length).toBeGreaterThan(0);
    expect(owedByOthersAmounts.length).toBeGreaterThan(0);
  });

  it('shows empty state when no debts exist', async () => {
    const emptyMocks = createMocks(false);
    renderWithProviders(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check empty state
    expect(screen.getByText(/all settled up/i)).toBeInTheDocument();
    expect(screen.getByText(/no outstanding debts/i)).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();

    // Check that summary shows zeros
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('displays user avatars with initials correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check that user initials are displayed
    expect(screen.getByText('A')).toBeInTheDocument(); // Alice
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob
    expect(screen.getByText('C')).toBeInTheDocument(); // Charlie
  });

  it('handles users without first names correctly', async () => {
    const modifiedDebtSummary = [
      {
        ...mockDebtSummary[0],
        user: {
          ...mockUsers[0],
          firstName: null,
          lastName: null,
        },
      },
    ];

    const mocks = [
      {
        request: {
          query: GET_GROUP_DEBT_SUMMARY,
          variables: { groupId: 'group-1' },
        },
        result: {
          data: {
            groupDebtSummary: modifiedDebtSummary,
          },
        },
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Should show username initial when no first name
    expect(screen.getByText('A')).toBeInTheDocument(); // From username 'alice'
  });
});

describe('DebtSummary - Visual Design', () => {
  it('applies correct styling for positive net amounts', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check that positive amounts have green styling
    const positiveAmounts = screen.getAllByText('+$25.00');
    positiveAmounts.forEach(amount => {
      expect(amount).toHaveClass('text-green-600');
    });
  });

  it('applies correct styling for negative net amounts', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check that negative amounts have red styling
    const negativeAmount = screen.getByText('-$50.00');
    expect(negativeAmount).toHaveClass('text-red-600');
  });

  it('uses proper card layout and spacing', async () => {
    const mocks = createMocks();
    const { container } = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebtSummary groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    // Check main container styling
    const mainContainer = screen
      .getByText('Debt Summary')
      .closest('.bg-white.rounded-lg.shadow-md');
    expect(mainContainer).toBeInTheDocument();

    // Check grid layout for summary stats
    const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    expect(statsGrid).toBeInTheDocument();

    // Check individual user cards
    const userCards = container.querySelectorAll('.border.border-gray-200.rounded-lg.p-4');
    expect(userCards.length).toBe(3);
  });
});

// Run the test suite
const debtSummaryTestSuite = new DebtSummaryTestSuite();
debtSummaryTestSuite.runAllTests();
