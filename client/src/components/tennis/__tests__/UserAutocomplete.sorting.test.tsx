import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import UserAutocomplete from '../UserAutocomplete';
import { USER_SEARCH } from '../graphql';

const mockSearchResults = {
  userSearch: [
    {
      id: '1',
      firstName: 'Zoe',
      lastName: 'Wilson',
      username: 'zoe',
      email: 'zoe@example.com',
    },
    {
      id: '2',
      firstName: 'Alice',
      lastName: 'Smith',
      username: 'alice',
      email: 'alice@example.com',
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      username: 'bob',
      email: 'bob@example.com',
    },
    {
      id: '4',
      firstName: '',
      lastName: '',
      username: 'charlie',
      email: 'charlie@example.com',
    },
  ],
};

const mocks = [
  {
    request: {
      query: USER_SEARCH,
      variables: { query: 'test' },
    },
    result: {
      data: mockSearchResults,
    },
  },
];

describe('UserAutocomplete Sorting', () => {
  it('should sort search results alphabetically by display name', async () => {
    const mockOnChange = jest.fn();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserAutocomplete onChange={mockOnChange} />
      </MockedProvider>
    );

    const input = screen.getByPlaceholderText('Search for a user...');

    // Type to trigger search
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.focus(input);

    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Check that results are sorted alphabetically
    // Should be: Alice Smith, Bob Johnson, charlie (username), Zoe Wilson
    const suggestions = screen.getAllByRole('button');

    // The first suggestion should be Alice Smith
    expect(suggestions[0]).toHaveTextContent('Alice Smith');

    // Check that all users are present
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('charlie')).toBeInTheDocument(); // username fallback
    expect(screen.getByText('Zoe Wilson')).toBeInTheDocument();
  });

  it('should handle users without names by sorting by username', async () => {
    const mockOnChange = jest.fn();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserAutocomplete onChange={mockOnChange} />
      </MockedProvider>
    );

    const input = screen.getByPlaceholderText('Search for a user...');

    // Type to trigger search
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.focus(input);

    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('charlie')).toBeInTheDocument();
    });

    // User with no first/last name should show username and be sorted correctly
    expect(screen.getByText('charlie')).toBeInTheDocument();
    expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
  });
});
