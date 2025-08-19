import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';

import { GET_GROUP_MEMBERS } from '../../../graphql/Group';
import { ME_QUERY } from '../../../graphql/User';
import { ExpenseForm } from '../ExpenseForm';

const mockMembersData = {
  group: {
    id: '1',
    memberships: [
      {
        user: {
          id: '1',
          firstName: 'Zoe',
          lastName: 'Wilson',
          username: 'zoe',
          email: 'zoe@example.com',
        },
      },
      {
        user: {
          id: '2',
          firstName: 'Alice',
          lastName: 'Smith',
          username: 'alice',
          email: 'alice@example.com',
        },
      },
      {
        user: {
          id: '3',
          firstName: 'Bob',
          lastName: 'Johnson',
          username: 'bob',
          email: 'bob@example.com',
        },
      },
    ],
  },
};

const mockMeData = {
  me: {
    id: '1',
    firstName: 'Zoe',
    lastName: 'Wilson',
    username: 'zoe',
    email: 'zoe@example.com',
  },
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
  it('should sort members alphabetically in Paid By dropdown', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm groupId="1" />
      </MockedProvider>
    );

    // Wait for data to load
    await screen.findByText('Add New Expense');

    // Check that members are sorted alphabetically in Paid By dropdown
    const paidBySelect = screen.getByDisplayValue(/Alice Smith|Bob Johnson|Zoe Wilson/);
    expect(paidBySelect).toBeInTheDocument();

    // The options should be in alphabetical order: Alice, Bob, Zoe
    const aliceOption = screen.getByText(/Alice Smith \(alice\)/);
    const bobOption = screen.getByText(/Bob Johnson \(bob\)/);
    const zoeOption = screen.getByText(/Zoe Wilson \(zoe\)/);

    expect(aliceOption).toBeInTheDocument();
    expect(bobOption).toBeInTheDocument();
    expect(zoeOption).toBeInTheDocument();
  });

  it('should sort categories alphabetically', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ExpenseForm groupId="1" />
      </MockedProvider>
    );

    // Wait for data to load
    await screen.findByText('Add New Expense');

    // Check that categories are sorted alphabetically
    const categorySelect = screen.getByDisplayValue('General');
    expect(categorySelect).toBeInTheDocument();

    // Categories should be sorted: Education, Entertainment, Food & Dining, General, Healthcare, Shopping, Transportation, Travel, Utilities
    const educationOption = screen.getByText('Education');
    const entertainmentOption = screen.getByText('Entertainment');
    const foodOption = screen.getByText('Food & Dining');

    expect(educationOption).toBeInTheDocument();
    expect(entertainmentOption).toBeInTheDocument();
    expect(foodOption).toBeInTheDocument();
  });
});
