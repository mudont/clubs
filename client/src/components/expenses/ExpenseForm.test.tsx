import { MockedProvider } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectAccessible } from '../../__tests__/utils/accessibility-helpers';
import { FormComponentTestSuite } from '../../__tests__/utils/base-component-tests';
import {
  createTestExpense,
  createTestGroup,
  createTestUser,
} from '../../__tests__/utils/mock-factories';
import { renderWithProviders } from '../../__tests__/utils/test-utils';
import { CREATE_EXPENSE, UPDATE_EXPENSE } from '../../graphql/Expenses';
import { GET_GROUP_MEMBERS } from '../../graphql/Group';
import { ME_QUERY } from '../../graphql/User';

import { ExpenseForm } from './ExpenseForm';

// Test data
const mockUser = createTestUser({
  id: 'user-1',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
});

const mockGroup = createTestGroup({
  id: 'group-1',
  name: 'Test Group',
  memberships: [
    {
      id: 'membership-1',
      isAdmin: true,
      memberId: 1,
      user: mockUser,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 'membership-2',
      isAdmin: false,
      memberId: 2,
      user: createTestUser({
        id: 'user-2',
        username: 'member2',
        firstName: 'Member',
        lastName: 'Two',
      }),
      joinedAt: new Date().toISOString(),
    },
  ],
});

const mockExpense = createTestExpense({
  id: 'expense-1',
  description: 'Test Expense',
  amount: 100,
  category: 'Food & Dining',
  date: '2024-01-15',
  paidByUser: mockUser,
  splits: [
    {
      id: 'split-1',
      amount: 50,
      user: mockUser,
    },
    {
      id: 'split-2',
      amount: 50,
      user: mockGroup.memberships[1].user,
    },
  ],
});

// GraphQL mocks
const createMocks = (isEdit = false) => [
  {
    request: { query: ME_QUERY },
    result: { data: { me: mockUser } },
  },
  {
    request: {
      query: GET_GROUP_MEMBERS,
      variables: { groupId: 'group-1' },
    },
    result: { data: { group: mockGroup } },
  },
  {
    request: {
      query: CREATE_EXPENSE,
      variables: {
        input: {
          description: 'New Test Expense',
          amount: 150,
          currency: 'USD',
          category: 'Food & Dining',
          date: expect.any(String),
          receiptUrl: '',
          splitType: 'EQUAL',
          groupId: 'group-1',
          paidBy: 'user-1',
          splits: expect.any(Array),
        },
      },
    },
    result: {
      data: {
        createExpense: {
          id: 'new-expense-1',
          description: 'New Test Expense',
          amount: 150,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_EXPENSE,
      variables: {
        id: 'expense-1',
        input: {
          description: 'Updated Test Expense',
          amount: 200,
          currency: 'USD',
          category: 'Entertainment',
          date: expect.any(String),
          receiptUrl: '',
          splitType: 'EQUAL',
          groupId: 'group-1',
          paidBy: 'user-1',
          splits: expect.any(Array),
        },
      },
    },
    result: {
      data: {
        updateExpense: {
          id: 'expense-1',
          description: 'Updated Test Expense',
          amount: 200,
        },
      },
    },
  },
];

// Test suite implementation
interface ExpenseFormTestProps {
  groupId: string;
  expense?: any;
  onSuccess?: any;
  onCancel?: any;
}

class ExpenseFormTestSuite extends FormComponentTestSuite<ExpenseFormTestProps> {
  component = ExpenseForm;
  defaultProps = {
    groupId: 'group-1',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };
  displayName = 'ExpenseForm';

  async testValidation(): Promise<void> {
    describe('Form Validation', () => {
      it('shows validation errors for required fields', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Clear required fields
        await this.helpers.form.fillField('Description', '');
        await this.helpers.form.fillField('Amount', '0');

        // Try to submit
        await this.helpers.form.submitForm();

        // Check for validation errors
        await waitFor(() => {
          expect(screen.getByText(/description is required/i)).toBeInTheDocument();
          expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
        });
      });

      it('validates split amounts equal total for custom split', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Fill form with valid data
        await this.helpers.form.fillField('Description', 'Test Expense');
        await this.helpers.form.fillField('Amount', '100');

        // Select custom split type
        const splitTypeSelect = screen.getByLabelText(/split type/i);
        await this.user.selectOptions(splitTypeSelect, 'CUSTOM');

        // Set invalid split amounts (don't equal total)
        const amountInputs = screen.getAllByDisplayValue('50');
        await this.user.clear(amountInputs[0]);
        await this.user.type(amountInputs[0], '30');
        await this.user.clear(amountInputs[1]);
        await this.user.type(amountInputs[1], '30');

        // Try to submit
        await this.helpers.form.submitForm();

        // Check for validation error
        await waitFor(() => {
          expect(
            screen.getByText(/split amounts must equal the total amount/i)
          ).toBeInTheDocument();
        });
      });
    });
  }

  async testSubmission(): Promise<void> {
    describe('Form Submission', () => {
      it('creates new expense successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ onSuccess });
        await this.helpers.async.waitForDataLoad();

        // Fill form
        await this.helpers.form.fillField('Description', 'New Test Expense');
        await this.helpers.form.fillField('Amount', '150');

        // Submit form
        await this.helpers.form.submitForm();

        // Wait for success callback
        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });

      it('updates existing expense successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ expense: mockExpense, onSuccess } as any);
        await this.helpers.async.waitForDataLoad();

        // Update form fields
        await this.helpers.form.fillField('Description', 'Updated Test Expense');
        await this.helpers.form.fillField('Amount', '200');

        const categorySelect = screen.getByLabelText(/category/i);
        await this.user.selectOptions(categorySelect, 'Entertainment');

        // Submit form
        await this.helpers.form.submitForm();

        // Wait for success callback
        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });

      it('handles submission errors gracefully', async () => {
        const errorMocks = [
          ...createMocks().slice(0, 2), // Keep ME_QUERY and GET_GROUP_MEMBERS
          {
            request: {
              query: CREATE_EXPENSE,
              variables: expect.any(Object),
            },
            error: new Error('Network error'),
          },
        ];

        renderWithProviders(<ExpenseForm groupId="group-1" onSuccess={jest.fn()} />, {
          mocks: errorMocks,
        });

        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        // Fill and submit form
        await this.user.type(screen.getByLabelText(/description/i), 'Test Expense');
        await this.user.type(screen.getByLabelText(/amount/i), '100');
        await this.user.click(screen.getByRole('button', { name: /add expense/i }));

        // Check for error message
        await waitFor(() => {
          expect(screen.getByText(/failed to save expense/i)).toBeInTheDocument();
        });
      });
    });
  }

  async testFieldInteractions(): Promise<void> {
    describe('Field Interactions', () => {
      it('updates split amounts when total amount changes', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Change total amount
        await this.helpers.form.fillField('Amount', '200');

        // Check that split amounts updated (equal split)
        await waitFor(() => {
          const splitAmounts = screen.getAllByText('$100.00');
          expect(splitAmounts).toHaveLength(2); // Two members, $100 each
        });
      });

      it('updates split amounts when split type changes', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Set amount
        await this.helpers.form.fillField('Amount', '100');

        // Change to percentage split
        const splitTypeSelect = screen.getByLabelText(/split type/i);
        await this.user.selectOptions(splitTypeSelect, 'PERCENTAGE');

        // Check that percentage inputs appear
        await waitFor(() => {
          const percentageInputs = screen.getAllByDisplayValue('50');
          expect(percentageInputs).toHaveLength(2); // 50% each
        });
      });

      it('allows custom split amounts', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Set amount and custom split
        await this.helpers.form.fillField('Amount', '100');
        const splitTypeSelect = screen.getByLabelText(/split type/i);
        await this.user.selectOptions(splitTypeSelect, 'CUSTOM');

        // Modify split amounts
        const amountInputs = screen.getAllByDisplayValue('50');
        await this.user.clear(amountInputs[0]);
        await this.user.type(amountInputs[0], '60');
        await this.user.clear(amountInputs[1]);
        await this.user.type(amountInputs[1], '40');

        // Check that amounts are updated
        expect(screen.getByDisplayValue('60')).toBeInTheDocument();
        expect(screen.getByDisplayValue('40')).toBeInTheDocument();
      });

      it('handles paid by selection', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Change paid by user
        const paidBySelect = screen.getByLabelText(/paid by/i);
        await this.user.selectOptions(paidBySelect, 'user-2');

        // Verify selection
        expect(paidBySelect).toHaveValue('user-2');
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

      it('has proper form labels and structure', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Check for proper labels
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/paid by/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/split type/i)).toBeInTheDocument();

        // Check for form structure
        const form = screen.getByRole('form') || this.container.querySelector('form');
        expect(form).toBeInTheDocument();
      });

      it('announces validation errors to screen readers', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Clear required field and submit
        await this.helpers.form.fillField('Description', '');
        await this.helpers.form.submitForm();

        // Check that error is announced
        await waitFor(() => {
          const errorMessage = screen.getByText(/description is required/i);
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage).toHaveAttribute('role', 'alert');
        });
      });
    });
  }

  async testLoadingStates(): Promise<void> {
    describe('Loading States', () => {
      it('shows loading state while fetching group members', async () => {
        const slowMocks = [
          {
            request: { query: ME_QUERY },
            result: { data: { me: mockUser } },
          },
          {
            request: {
              query: GET_GROUP_MEMBERS,
              variables: { groupId: 'group-1' },
            },
            result: { data: { group: mockGroup } },
            delay: 1000, // Simulate slow response
          },
        ];

        renderWithProviders(<ExpenseForm groupId="group-1" />, { mocks: slowMocks });

        // Check for loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      it('disables form during submission', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Fill and submit form
        await this.helpers.form.fillField('Description', 'Test Expense');
        await this.helpers.form.fillField('Amount', '100');

        const submitButton = screen.getByRole('button', { name: /add expense/i });
        await this.user.click(submitButton);

        // Check that button is disabled during submission
        expect(submitButton).toBeDisabled();
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
              query: GET_GROUP_MEMBERS,
              variables: { groupId: 'group-1' },
            },
            error: new Error('Failed to fetch group members'),
          },
        ];

        renderWithProviders(<ExpenseForm groupId="group-1" />, { mocks: errorMocks });

        // Should still show loading initially, then handle error gracefully
        await waitFor(() => {
          expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
      });
    });
  }

  protected render(props?: Partial<typeof this.defaultProps>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props };
    const mocks = options?.mocks || createMocks(!!(finalProps as any).expense);

    this.renderResult = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm {...finalProps} />
      </MockedProvider>,
      options
    );
    return this.renderResult;
  }
}

// Additional specific tests
describe('ExpenseForm - Specific Behaviors', () => {
  const user = userEvent.setup();

  it('pre-fills form when editing existing expense', async () => {
    const mocks = createMocks(true);
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm groupId="group-1" expense={mockExpense} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that form is pre-filled
    expect(screen.getByDisplayValue('Test Expense')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Food & Dining')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    const mocks = createMocks();

    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm groupId="group-1" onCancel={onCancel} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('handles different split types correctly', async () => {
    const mocks = createMocks();
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm groupId="group-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Test shares split
    const splitTypeSelect = screen.getByLabelText(/split type/i);
    await user.selectOptions(splitTypeSelect, 'SHARES');

    // Check that shares inputs appear
    await waitFor(() => {
      const sharesInputs = screen.getAllByDisplayValue('1');
      expect(sharesInputs.length).toBeGreaterThan(0);
    });
  });
});

// Run the test suite
const expenseFormTestSuite = new ExpenseFormTestSuite();
expenseFormTestSuite.runAllTests();
