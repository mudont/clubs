import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestUser } from '../../../__tests__/utils/mock-factories';
import { GET_GROUP_MEMBERS } from '../../../graphql/Group';
import { ME_QUERY } from '../../../graphql/User';
import { ExpenseForm } from '../ExpenseForm';

// Create test users with various name combinations to test sorting
const testUsers = [
  createTestUser({
    id: '1',
    firstName: 'Zoe',
    lastName: 'Wilson',
    username: 'zoe_wilson',
  }),
  createTestUser({
    id: '2',
    firstName: 'Alice',
    lastName: 'Smith',
    username: 'alice_smith',
  }),
  createTestUser({
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    username: 'bob_johnson',
  }),
  createTestUser({
    id: '4',
    firstName: 'Charlie',
    lastName: 'Brown',
    username: 'charlie_brown',
  }),
  createTestUser({
    id: '5',
    firstName: 'Alice',
    lastName: 'Anderson',
    username: 'alice_anderson',
  }),
  createTestUser({
    id: '6',
    firstName: null,
    lastName: null,
    username: 'username_only',
  }),
];

const mockMembersData = {
  group: {
    id: '1',
    memberships: testUsers.map((user, index) => ({
      user,
      id: `membership-${index + 1}`,
      isAdmin: index === 0,
      memberId: index + 1,
    })),
  },
};

const mockMeData = {
  me: testUsers[0], // Zoe Wilson
};

const mocks = [
  {
    request: {
      query: GET_GROUP_MEMBERS,
      variables: { groupId: '1' },
    },
    result: {
      data: mockMembersData,
    },
  },
  {
    request: {
      query: ME_QUERY,
    },
    result: {
      data: mockMeData,
    },
  },
];

describe('ExpenseForm Sorting', () => {
  const user = userEvent.setup();

  describe('Member Sorting in Paid By Dropdown', () => {
    it('sorts members alphabetically by display name', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      // Wait for data to load
      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i);
      expect(paidBySelect).toBeInTheDocument();

      // Get all options and verify they are sorted
      const options = within(paidBySelect).getAllByRole('option');
      const optionTexts = options.map(option => option.textContent);

      // Expected order: Alice Anderson, Alice Smith, Bob Johnson, Charlie Brown, username_only, Zoe Wilson
      const expectedOrder = [
        'Alice Anderson (alice_anderson)',
        'Alice Smith (alice_smith)',
        'Bob Johnson (bob_johnson)',
        'Charlie Brown (charlie_brown)',
        'username_only (username_only)',
        'Zoe Wilson (zoe_wilson) (You)',
      ];

      expectedOrder.forEach((expectedText, index) => {
        expect(optionTexts[index]).toContain(expectedText.split(' (')[0]);
      });
    });

    it('handles users with same first name correctly', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i);

      // Both Alice users should be present and sorted by last name
      expect(within(paidBySelect).getByText(/Alice Anderson/)).toBeInTheDocument();
      expect(within(paidBySelect).getByText(/Alice Smith/)).toBeInTheDocument();

      const options = within(paidBySelect).getAllByRole('option');
      const aliceAndersonIndex = options.findIndex(option =>
        option.textContent?.includes('Alice Anderson')
      );
      const aliceSmithIndex = options.findIndex(option =>
        option.textContent?.includes('Alice Smith')
      );

      // Anderson should come before Smith
      expect(aliceAndersonIndex).toBeLessThan(aliceSmithIndex);
    });

    it('handles users without names correctly', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i);

      // User without first/last name should show username
      expect(within(paidBySelect).getByText(/username_only/)).toBeInTheDocument();
    });

    it('marks current user with "(You)" indicator', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i);

      // Current user (Zoe Wilson) should have "(You)" indicator
      expect(within(paidBySelect).getByText(/Zoe Wilson.*\(You\)/)).toBeInTheDocument();
    });

    it('defaults to current user as paid by', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i) as HTMLSelectElement;

      // Should default to current user's ID
      await waitFor(() => {
        expect(paidBySelect.value).toBe('1'); // Zoe Wilson's ID
      });
    });
  });

  describe('Category Sorting', () => {
    it('sorts categories alphabetically', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const categorySelect = screen.getByLabelText(/category/i);
      const options = within(categorySelect).getAllByRole('option');
      const optionTexts = options.map(option => option.textContent);

      // Expected alphabetical order
      const expectedOrder = [
        'Education',
        'Entertainment',
        'Food & Dining',
        'General',
        'Healthcare',
        'Shopping',
        'Transportation',
        'Travel',
        'Utilities',
      ];

      expectedOrder.forEach((expectedCategory, index) => {
        expect(optionTexts[index]).toBe(expectedCategory);
      });
    });

    it('defaults to General category', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
      expect(categorySelect.value).toBe('General');
    });

    it('allows category selection', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const categorySelect = screen.getByLabelText(/category/i);

      // Change category
      await user.selectOptions(categorySelect, 'Food & Dining');

      expect((categorySelect as HTMLSelectElement).value).toBe('Food & Dining');
    });
  });

  describe('Split Details Sorting', () => {
    it('displays split details in same order as paid by dropdown', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      // Wait for split details to load
      await waitFor(() => {
        expect(screen.getByText(/split details/i)).toBeInTheDocument();
      });

      // Get all split detail sections
      const splitSections = screen.getAllByText(
        /Alice Anderson|Alice Smith|Bob Johnson|Charlie Brown|username_only|Zoe Wilson/
      );

      // Should be in same alphabetical order as dropdown
      const expectedOrder = [
        'Alice Anderson',
        'Alice Smith',
        'Bob Johnson',
        'Charlie Brown',
        'username_only',
        'Zoe Wilson',
      ];

      // Check that at least the first few are in correct order
      expectedOrder.slice(0, 3).forEach((expectedName, index) => {
        expect(splitSections[index]).toHaveTextContent(expectedName);
      });
    });

    it('maintains sort order when split type changes', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/split details/i)).toBeInTheDocument();
      });

      // Change split type
      const splitTypeSelect = screen.getByLabelText(/split type/i);
      await user.selectOptions(splitTypeSelect, 'PERCENTAGE');

      // Verify order is maintained
      const splitSections = screen.getAllByText(
        /Alice Anderson|Alice Smith|Bob Johnson|Charlie Brown|username_only|Zoe Wilson/
      );

      expect(splitSections[0]).toHaveTextContent('Alice Anderson');
      expect(splitSections[1]).toHaveTextContent('Alice Smith');
      expect(splitSections[2]).toHaveTextContent('Bob Johnson');
    });
  });

  describe('Accessibility and Sorting', () => {
    it('maintains proper tab order despite alphabetical sorting', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      // Tab through form elements
      const paidBySelect = screen.getByLabelText(/paid by/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const amountInput = screen.getByLabelText(/amount/i);
      const categorySelect = screen.getByLabelText(/category/i);

      // Elements should be focusable in logical order
      await user.tab();
      expect(paidBySelect).toHaveFocus();

      await user.tab();
      expect(descriptionInput).toHaveFocus();

      await user.tab();
      expect(amountInput).toHaveFocus();

      await user.tab();
      expect(categorySelect).toHaveFocus();
    });

    it('provides accessible labels for sorted options', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const paidBySelect = screen.getByLabelText(/paid by/i);
      const options = within(paidBySelect).getAllByRole('option');

      // Each option should have accessible text
      options.forEach(option => {
        expect(option.textContent).toBeTruthy();
        expect(option.textContent?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance with Sorting', () => {
    it('sorts efficiently with larger member lists', async () => {
      // Create a larger dataset
      const largeMemberList = Array.from({ length: 50 }, (_, index) =>
        createTestUser({
          id: `user-${index + 1}`,
          firstName: `User${index + 1}`,
          lastName: `LastName${index + 1}`,
          username: `user${index + 1}`,
        })
      );

      const largeMocks = [
        {
          request: {
            query: GET_GROUP_MEMBERS,
            variables: { groupId: '1' },
          },
          result: {
            data: {
              group: {
                id: '1',
                memberships: largeMemberList.map((user, index) => ({
                  user,
                  id: `membership-${index + 1}`,
                  isAdmin: index === 0,
                  memberId: index + 1,
                })),
              },
            },
          },
        },
        {
          request: {
            query: ME_QUERY,
          },
          result: {
            data: { me: largeMemberList[0] },
          },
        },
      ];

      const startTime = performance.now();

      render(
        <MockedProvider mocks={largeMocks} addTypename={false}>
          <ExpenseForm groupId="1" />
        </MockedProvider>
      );

      await screen.findByText('Add New Expense');

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);

      // Verify sorting still works
      const paidBySelect = screen.getByLabelText(/paid by/i);
      const options = within(paidBySelect).getAllByRole('option');

      // First option should be User1 (alphabetically first)
      expect(options[0]).toHaveTextContent('User1 LastName1');
    });
  });
});
